#!/bin/sh
# Installs Heddle on Linux or macOS, with nothing else required:
#
#     curl -fsSL https://heddlehq.github.io/website/install.sh | sh
#
# Everything goes in ~/.heddle. To remove it, delete that folder and the line
# this script added to your shell profile.
#
# HEDDLE_HOME        install somewhere else
# HEDDLE_NO_START=1  install without starting it
set -eu

download_url="${HEDDLE_DOWNLOAD_URL:-https://github.com/heddlehq/Heddle/releases/latest/download}"
guide="https://github.com/heddlehq/Heddle/blob/main/guides/installation.md"

fail() {
  printf '\n%s\n\n' "$1" >&2
  exit 1
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
    echo "Add $1 to your PATH to use the heddle command."
  elif ! grep -qs "$1" "$profile"; then
    printf '\n# Heddle\nexport PATH="%s:$PATH"\n' "$1" >> "$profile"
  fi
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
  work="$(mktemp -d)"
  trap 'rm -rf "$work"' EXIT

  echo "Downloading Heddle for $target..."
  curl -fSL --progress-bar -o "$work/$archive" "$download_url/$archive" ||
    fail "Could not download Heddle from $download_url/$archive"
  curl -fsSL -o "$work/$archive.sha256" "$download_url/$archive.sha256" ||
    fail "Could not download the checksum from $download_url"
  verify_checksum "$work" "$archive"

  # An update replaces the program and leaves your data in $home/data alone.
  [ -x "$app/heddle" ] && "$app/heddle" stop >/dev/null 2>&1 || true

  mkdir -p "$home" "$work/app"
  tar -xzf "$work/$archive" -C "$work/app"
  rm -rf "$app"
  mv "$work/app" "$app"

  add_to_path "$app"

  printf '\nHeddle %s is installed in %s\n' "$(cat "$app/VERSION")" "$home"
  echo "Open a new terminal and run \`heddle\` to start it again."

  if [ -z "${HEDDLE_NO_START:-}" ]; then
    echo
    HEDDLE_HOME="$home" "$app/heddle"
  fi
}

# Last on purpose: a connection cut halfway through `curl | sh` runs nothing.
main
