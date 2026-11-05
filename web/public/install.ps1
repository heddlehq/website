# Installs Heddle on Windows 10 or later, with nothing else required:
#
#     irm https://heddlehq.github.io/website/install.ps1 | iex
#
# Everything goes in %LOCALAPPDATA%\Heddle, or in %ProgramData%\Heddle when your
# user folder has an accent in its name. To remove it, delete that folder and take
# it out of your user PATH.
#
# HEDDLE_HOME        install somewhere else
# HEDDLE_NO_START=1  install without starting it

function Get-HeddleHome {
  if ($env:HEDDLE_HOME) {
    return $env:HEDDLE_HOME
  }

  $default = Join-Path $env:LOCALAPPDATA 'Heddle'

  # The Postgres installer sends its own path through SQL as UTF-8, but Windows
  # hands it over in the system code page, so C:\Users\Joao with an accent fails.
  if ($default -cmatch '^[\x00-\x7F]+$') {
    return $default
  }

  return Join-Path $env:ProgramData 'Heddle'
}

function Protect-HeddleHome($path) {
  # ProgramData is readable by every account, and this folder holds passwords.
  $me = [Security.Principal.WindowsIdentity]::GetCurrent().User.Value
  & icacls $path /inheritance:r /grant:r "*${me}:(OI)(CI)F" '*S-1-5-18:(OI)(CI)F' | Out-Null
  if ($LASTEXITCODE -ne 0) {
    throw "Could not restrict access to $path."
  }
}

function Install-Heddle {
  $ErrorActionPreference = 'Stop'
  # The progress bar makes Invoke-WebRequest many times slower.
  $ProgressPreference = 'SilentlyContinue'
  [Net.ServicePointManager]::SecurityProtocol = [Net.SecurityProtocolType]::Tls12

  $downloadUrl = if ($env:HEDDLE_DOWNLOAD_URL) { $env:HEDDLE_DOWNLOAD_URL } else { 'https://github.com/heddlehq/Heddle/releases/latest/download' }
  $archive = 'heddle-windows-x64.tar.gz'
  $heddleHome = Get-HeddleHome
  $app = Join-Path $heddleHome 'app'
  $work = Join-Path ([IO.Path]::GetTempPath()) ("heddle-" + [Guid]::NewGuid())

  if (-not [Environment]::Is64BitOperatingSystem) {
    throw 'Heddle needs a 64-bit version of Windows.'
  }

  # Git's tar may come first on PATH, and it reads C:\ as a remote host.
  $tar = Join-Path $env:SystemRoot 'System32\tar.exe'
  if (-not (Test-Path $tar)) {
    throw 'Heddle needs Windows 10 version 1803 or later.'
  }

  New-Item -ItemType Directory -Force -Path $work, $heddleHome | Out-Null

  if ($heddleHome.StartsWith($env:ProgramData)) {
    Protect-HeddleHome $heddleHome
  }

  try {
    Write-Host 'Downloading Heddle for Windows...'
    Invoke-WebRequest -UseBasicParsing -Uri "$downloadUrl/$archive" -OutFile "$work\$archive"
    Invoke-WebRequest -UseBasicParsing -Uri "$downloadUrl/$archive.sha256" -OutFile "$work\$archive.sha256"

    $expected = (Get-Content "$work\$archive.sha256" -Raw).Trim().Split(' ')[0]
    $actual = (Get-FileHash "$work\$archive" -Algorithm SHA256).Hash
    if ($expected -ne $actual) {
      throw 'The download is damaged. Run the installer again.'
    }

    # An update replaces the program and leaves your data in $heddleHome\data alone.
    $launcher = Join-Path $app 'heddle.cmd'
    if (Test-Path $launcher) {
      & cmd /c "`"$launcher`" stop" *> $null
    }

    New-Item -ItemType Directory -Force -Path "$work\app" | Out-Null
    & $tar -xzf "$work\$archive" -C "$work\app"
    if ($LASTEXITCODE -ne 0) {
      throw 'Could not unpack Heddle.'
    }

    if (Test-Path $app) {
      Remove-Item -Recurse -Force $app
    }
    Move-Item "$work\app" $app
  }
  finally {
    Remove-Item -Recurse -Force $work -ErrorAction SilentlyContinue
  }

  $userPath = [Environment]::GetEnvironmentVariable('Path', 'User')
  if (($userPath -split ';') -notcontains $app) {
    [Environment]::SetEnvironmentVariable('Path', (($userPath, $app) -join ';').Trim(';'), 'User')
  }
  $env:Path = "$env:Path;$app"

  Write-Host ''
  Write-Host "Heddle $((Get-Content "$app\VERSION" -Raw).Trim()) is installed in $heddleHome"
  Write-Host 'Open a new terminal and run `heddle` to start it again.'

  if (-not $env:HEDDLE_NO_START) {
    Write-Host ''
    $env:HEDDLE_HOME = $heddleHome
    & cmd /c "`"$app\heddle.cmd`""
  }
}

# Inside a function so that `| iex` can't close the person's terminal on an error.
# Last on purpose: a connection cut halfway through runs nothing.
try {
  Install-Heddle
}
catch {
  Write-Host ''
  Write-Host $_.Exception.Message -ForegroundColor Red
  Write-Host ''
}
