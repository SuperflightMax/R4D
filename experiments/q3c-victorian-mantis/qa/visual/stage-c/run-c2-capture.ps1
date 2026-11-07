param(
    [Parameter(Mandatory)][ValidateSet('desktop', 'mobile390', 'mobile360')][string]$Size,
    [Parameter(Mandatory)][ValidateSet('normal', 'reduced')][string]$Motion
)

. "$PSScriptRoot/c2-browser-env.ps1"
& "$PSScriptRoot/open-c2-context.ps1" -Size $Size -Motion $Motion
if ($LASTEXITCODE -ne 0) { exit $LASTEXITCODE }

$qaC2Session = "q3c-c2-vqa-$Motion-$Size"
$qaC2Output = "evidence/$Motion/$Size"
$qaC2Config = Get-Content -LiteralPath (Join-Path $qaC2Temp "$Motion-$Size.json") -Raw | ConvertFrom-Json
$qaC2View = $qaC2Config.browser.contextOptions.viewport
$qaC2VideoDimensions = "$($qaC2View.width)x$($qaC2View.height)"
$qaC2VideoName = if ($Motion -eq 'normal') { 'normal-speed.mp4' } else { 'reduced-preference.mp4' }
& D:\nodejs\node.exe $qaC2Cli "-s=$qaC2Session" video-start "$qaC2Output/$qaC2VideoName" "--size=$qaC2VideoDimensions" --fps=25
if ($LASTEXITCODE -ne 0) { exit $LASTEXITCODE }

$qaC2Captured = & D:\nodejs\node.exe $qaC2Cli "-s=$qaC2Session" --raw run-code --filename=capture-c2.js
$qaC2CaptureExit = $LASTEXITCODE
if ($qaC2CaptureExit -eq 0) {
    $qaC2Captured | Set-Content -LiteralPath "$qaC2Output/observations.json" -Encoding utf8
} else {
    $qaC2Captured
}
& D:\nodejs\node.exe $qaC2Cli "-s=$qaC2Session" video-stop
exit $qaC2CaptureExit
