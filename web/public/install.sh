#!/bin/sh
# Installs Heddle on Linux or macOS, with nothing else required:
#
#     curl -fsSL https://heddlehq.github.io/website/install.sh | sh
#
# Everything goes in ~/.heddle. To remove it, delete that folder and the line
# this script added to your shell profile. Updating keeps your data, and saves a
# copy of it in ~/.heddle/backups first.
#
# HEDDLE_HOME        install somewhere else
# HEDDLE_NO_START=1  install without starting it
set -eu

download_url="${HEDDLE_DOWNLOAD_URL:-https://github.com/heddlehq/Heddle/releases/latest/download}"
guide="https://github.com/heddlehq/Heddle/blob/main/guides/installation.md"

if [ -t 1 ] && [ -z "${NO_COLOR:-}" ] && [ "${TERM:-dumb}" != dumb ]; then
  bold="$(printf '\033[1m')"
  ribbon="$(printf '\033[38;5;124m')"
  soft="$(printf '\033[2m')"
  plain="$(printf '\033[0m')"
else
  bold=""
  ribbon=""
  soft=""
  plain=""
fi

fail() {
  printf '\n  %s[!]%s %s\n\n' "$ribbon$bold" "$plain" "$1" >&2
  exit 1
}

step() {
  printf '  %s[x]%s %s\n' "$ribbon$bold" "$plain" "$1"
}

columns() {
  size="$(stty size 2>/dev/null </dev/tty || true)"
  echo "${size#* }" | grep -E '^[0-9]+$' || echo 80
}

megabytes() {
  echo $(($1 / 1048576))
}

# curl's own bar breaks into new lines when it can't fit the terminal. This one
# redraws a single line, and only ever as wide as there is room for.
draw_bar() {
  done_bytes="$1"
  total="$2"
  room="$(($(columns) - 30))"
  [ "$room" -gt 32 ] && room=32
  [ "$room" -lt 8 ] && room=8

  filled="$((done_bytes * room / total))"
  [ "$filled" -gt "$room" ] && filled="$room"
  percent="$((done_bytes * 100 / total))"
  [ "$percent" -gt 100 ] && percent=100

  bar="$(printf '%*s' "$filled" '' | tr ' ' '#')$(printf '%*s' "$((room - filled))" '' | tr ' ' '.')"
  printf '\r\033[K  [ ] %s%s%s %3d%%  %s/%s MB' "$ribbon" "$bar" "$plain" "$percent" \
    "$(megabytes "$done_bytes")" "$(megabytes "$total")"
}

download() {
  if [ ! -t 1 ]; then
    curl -fsSL --retry 2 -o "$2" "$1"
    return
  fi

  total="$(curl -fsSLI "$1" | tr -d '\r' | awk 'tolower($1) == "content-length:" { size = $2 } END { print size + 0 }')"
  curl -fsSL --retry 2 -o "$2" "$1" &
  fetching=$!

  while kill -0 "$fetching" 2>/dev/null; do
    if [ "$total" -gt 0 ]; then
      draw_bar "$(wc -c <"$2" 2>/dev/null || echo 0)" "$total"
    else
      printf '\r\033[K  [ ] Downloading %s MB' "$(megabytes "$(wc -c <"$2" 2>/dev/null || echo 0)")"
    fi
    sleep 0.1
  done

  status=0
  wait "$fetching" || status=$?
  printf '\r\033[K'
  return "$status"
}

detect_target() {
  os="$(uname -s)"
  arch="$(uname -m)"

  case "$os/$arch" in
    Linux/x86_64 | Linux/amd64) echo linux-x64 ;;
    Linux/aarch64 | Linux/arm64) echo linux-arm64 ;;
    Darwin/arm64) echo macos-arm64 ;;
    *) fail "There is no Heddle build for $os on $arch yet. Docker works everywhere: $guide" ;;
  esac
}

verify_checksum() {
  (
    cd "$1"
    if command -v sha256sum >/dev/null 2>&1; then
      sha256sum -c "$2.sha256" >/dev/null
    else
      shasum -a 256 -c "$2.sha256" >/dev/null
    fi
  ) || fail "The download is damaged. Run the installer again."
}

add_to_path() {
  case "$(basename "${SHELL:-}")" in
    zsh) profile="$HOME/.zshrc" ;;
    bash) profile="$HOME/.bashrc" ;;
    *) profile="" ;;
  esac

  case ":$PATH:" in
    *":$1:"*) return ;;
  esac

  if [ -z "$profile" ]; then
    printf '  Add %s to your PATH to use the heddle command.\n' "$1"
  elif ! grep -qs "$1" "$profile"; then
    printf '\n# Heddle\nexport PATH="%s:$PATH"\n' "$1" >> "$profile"
  fi
}

# A major Postgres version can't open the data of another one. Stop here, before
# anything has changed, instead of leaving an install that won't start.
check_postgres() {
  current="$(cat "$1/data/postgres/PG_VERSION" 2>/dev/null || true)"
  [ -n "$current" ] || return 0

  incoming="$("$2/pgsql/bin/postgres" --version | sed 's/[^0-9]*\([0-9]*\).*/\1/')"
  [ "$current" = "$incoming" ] ||
    fail "This version of Heddle needs Postgres $incoming, and your data is on Postgres $current. Nothing was changed. See $guide"
}

back_up() {
  [ -d "$1/data" ] || return 0

  backups="$1/backups"
  name="$(date +%Y%m%d-%H%M%S)-$(cat "$1/app/VERSION" 2>/dev/null || echo unknown)"
  mkdir -p "$backups"

  cp -Rp "$1/data" "$backups/$name.partial" &&
    mv "$backups/$name.partial" "$backups/$name" ||
    fail "Could not back up your data, so nothing was changed. Is the disk full?"

  # Keep the latest three: a copy of the data can get big.
  ls -1dt "$backups"/* | tail -n +4 | while IFS= read -r old; do
    rm -rf "$old"
  done

  step "Saved a copy of your data in backups/$name"
}

main() {
  [ "$(id -u)" != 0 ] || fail "Run this as your normal user, not root: the bundled Postgres refuses root. On a server, use Docker: $guide"

  if ldd --version 2>&1 | grep -qi musl; then
    fail "Heddle's builds need glibc, and this system uses musl. Docker works here: $guide"
  fi

  for tool in curl tar; do
    command -v "$tool" >/dev/null 2>&1 || fail "Please install $tool and run this again."
  done

  target="$(detect_target)"
  archive="heddle-$target.tar.gz"
  home="${HEDDLE_HOME:-$HOME/.heddle}"
  app="$home/app"

  # Postgres and Python don't load from a folder with accents in its name.
  if printf '%s' "$home" | LC_ALL=C grep -q '[^ -~]'; then
    fail "Heddle can't run from $home, because the name has accents. Pick another folder: curl -fsSL https://heddlehq.github.io/website/install.sh | HEDDLE_HOME=/some/folder sh"
  fi

  work="$(mktemp -d)"
  trap 'rm -rf "$work"' EXIT

  printf '\n  %sHeddle%s %sinstaller%s\n\n' "$bold" "$plain" "$soft" "$plain"

  download "$download_url/$archive" "$work/$archive" ||
    fail "Could not download Heddle from $download_url/$archive"
  step "Downloaded Heddle for $target"

  curl -fsSL -o "$work/$archive.sha256" "$download_url/$archive.sha256" ||
    fail "Could not download the checksum from $download_url"
  verify_checksum "$work" "$archive"
  step "Checked the download"

  mkdir -p "$home" "$work/app"
  tar -xzf "$work/$archive" -C "$work/app"
  check_postgres "$home" "$work/app"

  # An update replaces the program and leaves your data in $home/data alone. The
  # database has to be stopped for the copy to be consistent.
  [ -x "$app/heddle" ] && HEDDLE_HOME="$home" "$app/heddle" stop >/dev/null 2>&1 || true
  back_up "$home"

  rm -rf "$app"
  mv "$work/app" "$app"

  add_to_path "$app"

  step "Installed Heddle $(cat "$app/VERSION") in $home"

  printf '\n  To start it later, open a new terminal and run %sheddle%s\n\n' "$bold" "$plain"

  if [ -z "${HEDDLE_NO_START:-}" ]; then
    HEDDLE_HOME="$home" "$app/heddle"
  fi
}

# Last on purpose: a connection cut halfway through `curl | sh` runs nothing.
main
