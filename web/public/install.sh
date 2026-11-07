#!/bin/sh
# Installs Heddle on Linux or macOS, with nothing else required:
#
#     curl -fsSL https://heddlehq.github.io/website/install.sh | sh
#
# This only fetches the `heddle` command and hands over to `heddle install`, which
# asks what you want. Anything after `--` goes to it:
#
#     curl -fsSL https://heddlehq.github.io/website/install.sh | sh -s -- --treadle
#     curl -fsSL https://heddlehq.github.io/website/install.sh | sh -s -- --yes
#
# With no terminal to ask in, it installs the defaults. `heddle install --help` lists
# every option.
#
# HEDDLE_HOME        install somewhere else
# HEDDLE_NO_START=1  install without starting it
set -eu

download_url="${HEDDLE_DOWNLOAD_URL:-https://github.com/heddlehq/Heddle/releases/latest/download}"
guide="https://github.com/heddlehq/Heddle/blob/main/guides/installation.md"

fail() {
  printf '\n  [!] %s\n\n' "$1" >&2
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
  expected="$(cut -d' ' -f1 "$1.sha256")"

  if command -v sha256sum >/dev/null 2>&1; then
    actual="$(sha256sum "$1" | cut -d' ' -f1)"
  else
    actual="$(shasum -a 256 "$1" | cut -d' ' -f1)"
  fi

  [ "$expected" = "$actual" ] || fail "The download is damaged. Run the installer again."
}

main() {
  command -v curl >/dev/null 2>&1 || fail "Please install curl and run this again."

  target="$(detect_target)"
  file="heddle-cli-$target"

  work="$(mktemp -d)"
  trap 'rm -rf "$work"' EXIT

  curl -fsSL --retry 2 -o "$work/heddle" "$download_url/$file" ||
    fail "Could not download Heddle from $download_url/$file"
  curl -fsSL --retry 2 -o "$work/heddle.sha256" "$download_url/$file.sha256" ||
    fail "Could not download the checksum from $download_url"
  verify_checksum "$work/heddle"
  chmod +x "$work/heddle"

  # `curl | sh` leaves this script's stdin on the pipe. The questions need the
  # terminal, when there is one.
  if (: </dev/tty) 2>/dev/null; then
    "$work/heddle" install "$@" </dev/tty
  else
    "$work/heddle" install "$@"
  fi
}

# Last on purpose: a connection cut halfway through `curl | sh` runs nothing.
main "$@"
