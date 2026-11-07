param(
    [Parameter(Mandatory)][ValidateSet('desktop', 'mobile390', 'mobile360')][string]$Size,
    [Parameter(Mandatory)][ValidateSet('normal', 'reduced')][string]$Motion,
    [switch]$Uninterrupted
)

if ($Uninterrupted -and ($Size -ne 'desktop' -or $Motion -ne 'normal')) {
    throw 'The uninterrupted control uses normal desktop.'
}

$qaCorrectionRoot = $PSScriptRoot
$qaCaptureTemp = Join-Path $qaCorrectionRoot '.tmp'
$qaVisualCache = (Resolve-Path -LiteralPath (Join-Path $qaCorrectionRoot '../../.cache')).Path
$env:PWTEST_DAEMON_SESSION_DIR = Join-Path $qaCaptureTemp 'daemon'
$env:TEMP = Join-Path $qaCaptureTemp 'temp'
$env:TMP = $env:TEMP
$env:PLAYWRIGHT_BROWSERS_PATH = Join-Path $qaVisualCache 'browsers'
New-Item -ItemType Directory -Path $env:TEMP -Force | Out-Null
$qaCli = Join-Path $qaVisualCache 'npm/_npx/31e32ef8478fbf80/node_modules/@playwright/cli/playwright-cli.js'

$qaSizes = @{
    desktop = @{ width = 1440; height = 1000 }
    mobile390 = @{ width = 390; height = 844 }
    mobile360 = @{ width = 360; height = 732 }
}
$qaViewport = $qaSizes[$Size]
$qaMobile = $Size -ne 'desktop'
$qaReduced = if ($Motion -eq 'reduced') { 'reduce' } else { 'no-preference' }
$qaOutput = "evidence/$Motion/$Size"
if ($Uninterrupted) { $qaOutput = 'evidence/uninterrupted/desktop' }
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
            reducedMotion = $qaReduced
        }
    }
    outputDir = $qaOutput
}
$qaRoute = if ($Uninterrupted) { 'uninterrupted-desktop' } else { "$Motion-$Size" }
$qaConfigFile = Join-Path $qaCaptureTemp "$qaRoute.json"
$qaConfig | ConvertTo-Json -Depth 8 | Set-Content -LiteralPath $qaConfigFile -Encoding utf8
$qaSession = "q3c-vqa-3be9-$qaRoute"
$qaDimensions = "$($qaViewport.width)x$($qaViewport.height)"
$qaVideo = if ($Motion -eq 'normal') { 'normal-speed.mp4' } else { 'reduced-preference.mp4' }

$qaCaptureScript = if ($Uninterrupted) { 'capture-uninterrupted.js' } else { 'capture-correction.js' }
& D:\nodejs\node.exe $qaCli "-s=$qaSession" open 'http://127.0.0.1:4189/?seed=42' "--config=$qaConfigFile"
if ($LASTEXITCODE -ne 0) { exit $LASTEXITCODE }
& D:\nodejs\node.exe $qaCli "-s=$qaSession" video-start "$qaOutput/$qaVideo" "--size=$qaDimensions" --fps=25
if ($LASTEXITCODE -ne 0) { exit $LASTEXITCODE }
$qaCapture = & D:\nodejs\node.exe $qaCli "-s=$qaSession" --raw run-code "--filename=$qaCaptureScript"
$qaCaptureStatus = $LASTEXITCODE
if ($qaCaptureStatus -eq 0) {
    $qaCapture | Set-Content -LiteralPath "$qaOutput/observations.json" -Encoding utf8
} else {
    $qaCapture
}
& D:\nodejs\node.exe $qaCli "-s=$qaSession" video-stop
$qaVideoStatus = $LASTEXITCODE
& D:\nodejs\node.exe $qaCli "-s=$qaSession" close
if ($qaCaptureStatus -ne 0) { exit $qaCaptureStatus }
exit $qaVideoStatus
