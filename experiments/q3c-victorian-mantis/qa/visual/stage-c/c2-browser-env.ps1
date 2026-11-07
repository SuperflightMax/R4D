$qaC2Root = $PSScriptRoot
$qaC2Temp = Join-Path $qaC2Root '.tmp'
$env:PWTEST_DAEMON_SESSION_DIR = Join-Path $qaC2Temp 'daemon'
$env:TEMP = Join-Path $qaC2Temp 'temp'
$env:TMP = $env:TEMP
$env:PLAYWRIGHT_BROWSERS_PATH = (Resolve-Path -LiteralPath (Join-Path $qaC2Root '../.cache/browsers')).Path
New-Item -ItemType Directory -Path $env:TEMP -Force | Out-Null
$qaC2Cli = (Resolve-Path -LiteralPath (Join-Path $qaC2Root '../.cache/npm/_npx/31e32ef8478fbf80/node_modules/@playwright/cli/playwright-cli.js')).Path
