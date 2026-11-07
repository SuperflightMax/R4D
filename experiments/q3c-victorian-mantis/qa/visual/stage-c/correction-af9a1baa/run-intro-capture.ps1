param(
    [Parameter(Mandatory)][ValidateSet('desktop', 'mobile360')][string]$Size
)

$ErrorActionPreference = 'Stop'
Set-Location -LiteralPath $PSScriptRoot
$qaTemp = Join-Path $PSScriptRoot '.tmp'
$qaCache = (Resolve-Path -LiteralPath (Join-Path $PSScriptRoot '../../.cache')).Path
$env:PWTEST_DAEMON_SESSION_DIR = Join-Path $qaTemp 'daemon'
$env:TEMP = Join-Path $qaTemp 'temp'
$env:TMP = $env:TEMP
$env:PLAYWRIGHT_BROWSERS_PATH = Join-Path $qaCache 'browsers'
New-Item -ItemType Directory -Path $env:TEMP -Force | Out-Null
$qaCli = Join-Path $qaCache 'npm/_npx/31e32ef8478fbf80/node_modules/@playwright/cli/playwright-cli.js'
$qaSizes = @{
    desktop = @{ width = 1440; height = 1000 }
    mobile360 = @{ width = 360; height = 732 }
}
$qaViewport = $qaSizes[$Size]
$qaMobile = $Size -ne 'desktop'
$qaOutput = "evidence/$Size"
$qaConfig = @{
    browser = @{
        browserName = 'chromium'
        isolated = $true
        launchOptions = @{
            executablePath = 'C:/Users/user/AppData/Local/ms-playwright/chromium-1208/chrome-win64/chrome.exe'
            headless = $true
        }
        contextOptions = @{
            viewport = $qaViewport
            screen = $qaViewport
            deviceScaleFactor = 1
            isMobile = $qaMobile
            hasTouch = $qaMobile
            reducedMotion = 'no-preference'
        }
    }
    outputDir = $qaOutput
}
$qaRoute = $Size
$qaConfigFile = Join-Path $qaTemp "$qaRoute.json"
$qaConfig | ConvertTo-Json -Depth 8 | Set-Content -LiteralPath $qaConfigFile -Encoding utf8
$qaSession = "q3c-vqa-af9a-$qaRoute"
$qaDimensions = "$($qaViewport.width)x$($qaViewport.height)"
$qaVideo = 'normal-speed.mp4'

& D:\nodejs\node.exe $qaCli "-s=$qaSession" open 'http://127.0.0.1:4189/?seed=42' "--config=$qaConfigFile"
if ($LASTEXITCODE -ne 0) { exit $LASTEXITCODE }
try {
    & D:\nodejs\node.exe $qaCli "-s=$qaSession" video-start "$qaOutput/$qaVideo" "--size=$qaDimensions" --fps=25
    if ($LASTEXITCODE -ne 0) { throw 'Recording start failed' }
    $qaCapture = & D:\nodejs\node.exe $qaCli "-s=$qaSession" --raw run-code --filename=capture-intro.js
    $qaStatus = $LASTEXITCODE
    & D:\nodejs\node.exe $qaCli "-s=$qaSession" video-stop
    if ($LASTEXITCODE -ne 0 -or $qaStatus -ne 0) { throw "Recording failed. $qaCapture" }
    $qaCapture | Set-Content -LiteralPath "$qaOutput/observations.json" -Encoding utf8
} finally {
    & D:\nodejs\node.exe $qaCli "-s=$qaSession" close
}
