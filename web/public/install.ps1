# Installs Heddle on Windows 10 or later, with nothing else required:
#
#     irm https://heddlehq.github.io/website/install.ps1 | iex
#
# This only fetches the `heddle` command and hands over to `heddle install`, which
# asks what you want. To pass it options, like installing only Treadle:
#
#     & ([scriptblock]::Create((irm https://heddlehq.github.io/website/install.ps1))) --treadle
#
# `heddle install --help` lists every option.
#
# HEDDLE_HOME        install somewhere else
# HEDDLE_NO_START=1  install without starting it

function Install-Heddle($options) {
  $ErrorActionPreference = 'Stop'
  # The progress bar makes Invoke-WebRequest many times slower.
  $ProgressPreference = 'SilentlyContinue'
  [Net.ServicePointManager]::SecurityProtocol = [Net.SecurityProtocolType]::Tls12

  if (-not [Environment]::Is64BitOperatingSystem) {
    throw 'Heddle needs a 64-bit version of Windows.'
  }

  $downloadUrl = if ($env:HEDDLE_DOWNLOAD_URL) { $env:HEDDLE_DOWNLOAD_URL } else { 'https://github.com/heddlehq/Heddle/releases/latest/download' }
  $file = 'heddle-cli-windows-x64.exe'
  $work = Join-Path ([IO.Path]::GetTempPath()) ("heddle-" + [Guid]::NewGuid())

  New-Item -ItemType Directory -Force -Path $work | Out-Null

  try {
    $binary = Join-Path $work 'heddle.exe'
    Invoke-WebRequest -UseBasicParsing -Uri "$downloadUrl/$file" -OutFile $binary
    Invoke-WebRequest -UseBasicParsing -Uri "$downloadUrl/$file.sha256" -OutFile "$binary.sha256"

    $expected = (Get-Content "$binary.sha256" -Raw).Trim().Split(' ')[0]
    $actual = (Get-FileHash $binary -Algorithm SHA256).Hash
    if ($expected -ne $actual) {
      throw 'The download is damaged. Run the installer again.'
    }

    & $binary install @options
  }
  finally {
    Remove-Item -Recurse -Force $work -ErrorAction SilentlyContinue
  }
}

# Inside a function so that `| iex` can't close the person's terminal on an error.
# Last on purpose: a connection cut halfway through runs nothing.
try {
  Install-Heddle $args
}
catch {
  Write-Host ''
  Write-Host '  [!] ' -ForegroundColor DarkRed -NoNewline
  Write-Host $_.Exception.Message
  Write-Host ''
}
