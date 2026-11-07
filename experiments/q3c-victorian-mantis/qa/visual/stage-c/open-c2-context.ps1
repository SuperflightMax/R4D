param(
    [Parameter(Mandatory)][ValidateSet('desktop', 'mobile390', 'mobile360')][string]$Size,
    [Parameter(Mandatory)][ValidateSet('normal', 'reduced')][string]$Motion
)

. "$PSScriptRoot/c2-browser-env.ps1"
$qaC2Dimensions = @{
    desktop = @{ width = 1440; height = 1000 }
    mobile390 = @{ width = 390; height = 844 }
    mobile360 = @{ width = 360; height = 732 }
}
$qaC2Viewport = $qaC2Dimensions[$Size]
$qaC2IsMobile = $Size -ne 'desktop'
$qaC2MotionPreference = if ($Motion -eq 'reduced') { 'reduce' } else { 'no-preference' }
$qaC2ContextConfig = @{
    browser = @{
        browserName = 'chromium'
        isolated = $true
        launchOptions = @{
            executablePath = 'C:/Users/user/AppData/Local/ms-playwright/chromium-1208/chrome-win64/chrome.exe'
            headless = $true
        }
        contextOptions = @{
            viewport = $qaC2Viewport
            screen = $qaC2Viewport
            deviceScaleFactor = 1
            isMobile = $qaC2IsMobile
            hasTouch = $qaC2IsMobile
            reducedMotion = $qaC2MotionPreference
        }
    }
    outputDir = "evidence/$Motion/$Size"
}
$qaC2ConfigFile = Join-Path $qaC2Temp "$Motion-$Size.json"
$qaC2ContextConfig | ConvertTo-Json -Depth 8 | Set-Content -LiteralPath $qaC2ConfigFile -Encoding utf8
$qaC2Session = "q3c-c2-vqa-$Motion-$Size"
& D:\nodejs\node.exe $qaC2Cli "-s=$qaC2Session" open 'http://127.0.0.1:4188/?seed=42' "--config=$qaC2ConfigFile"
exit $LASTEXITCODE
