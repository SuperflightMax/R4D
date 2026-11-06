$qaVisualRoot = $PSScriptRoot
$env:npm_config_cache = Join-Path $qaVisualRoot '.cache/npm'
$env:PWTEST_DAEMON_SESSION_DIR = Join-Path $qaVisualRoot '.cache/daemon'
$env:PLAYWRIGHT_BROWSERS_PATH = Join-Path $qaVisualRoot '.cache/browsers'
$env:TEMP = Join-Path $qaVisualRoot '.tmp'
$env:TMP = $env:TEMP
New-Item -ItemType Directory -Path $env:TEMP -Force | Out-Null
$qaVisualCli = Join-Path $qaVisualRoot '.cache/npm/_npx/31e32ef8478fbf80/node_modules/@playwright/cli/playwright-cli.js'
