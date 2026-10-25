param(
    [Parameter(Mandatory=$true)][ValidateSet('board-01','board-02','board-03','board-04')][string]$BoardId,
    [string]$Root = (Split-Path -Parent $PSScriptRoot),
    [string]$OutputDirectory = (Join-Path (Split-Path -Parent $PSScriptRoot) "output\$BoardId")
)

$ErrorActionPreference = 'Stop'
Add-Type -AssemblyName System.Drawing

$experiment = [System.IO.Path]::GetFullPath((Join-Path $Root '..\..'))
$layoutPath = Join-Path $Root "layouts\$BoardId.json"
$prepared = Join-Path $experiment "asset-artist\final-series\$BoardId\prepared"
$metadataPath = Join-Path $prepared 'component-metadata.json'
$environmentPath = Join-Path $prepared 'environment-floor-plate-1536.png'
$masterPath = Join-Path $prepared 'control-master-rgba.png'
$shadowPath = Join-Path $prepared 'control-shadow-rgba.png'
$outputPath = Join-Path $OutputDirectory 'composite.png'

$layout = Get-Content -LiteralPath $layoutPath -Raw | ConvertFrom-Json
$metadata = Get-Content -LiteralPath $metadataPath -Raw | ConvertFrom-Json
if ($layout.schema -ne 'r4d.p0.final-series-layout.v1' -or $layout.boardId -ne $BoardId) { throw "$BoardId layout identity mismatch." }
if ($layout.frame[0] -ne 1536 -or $layout.frame[1] -ne 1536) { throw "$BoardId frame must remain 1536 x 1536." }
if ($layout.controlMarkersAllowed -ne $false) { throw "$BoardId clean-output invariant failed." }
if ($metadata.schema -ne 'r4d.p0.final-board-components.v1' -or $metadata.boardId -ne $BoardId) { throw "$BoardId component metadata mismatch." }

$expectedQ = @(0.338, 0.453, 0.567, 0.681)
$expectedScale = @(0.939, 0.978, 1.018, 1.058)
$instances = @($layout.instances | Sort-Object @{Expression={[double]$_.q}}, @{Expression={[double]$_.p}}, instanceId)
if ($instances.Count -ne 4) { throw "$BoardId requires exactly four instances." }
for ($i = 0; $i -lt 4; $i++) {
    if ([double]$instances[$i].q -ne $expectedQ[$i]) { throw "$BoardId unexpected q at row $i." }
    if ([double]$instances[$i].uniformScale -ne $expectedScale[$i]) { throw "$BoardId unexpected scale at row $i." }
}

$anchorX = [double]$metadata.master.baseCenterAnchorPx[0]
$anchorY = [double]$metadata.master.baseCenterAnchorPx[1]
if ($anchorX -ne [double]$metadata.shadow.baseCenterAnchorPx[0] -or $anchorY -ne [double]$metadata.shadow.baseCenterAnchorPx[1]) { throw "$BoardId master/shadow anchors differ." }
$visibleHeight = $anchorY - [double]$metadata.master.paddingPx + 1.0
$normalization = 120.0 / $visibleHeight

New-Item -ItemType Directory -Force -Path $OutputDirectory | Out-Null
$environment = [System.Drawing.Bitmap]::FromFile($environmentPath)
$master = [System.Drawing.Bitmap]::FromFile($masterPath)
$shadow = [System.Drawing.Bitmap]::FromFile($shadowPath)
try {
    if ($environment.Width -ne 1536 -or $environment.Height -ne 1536) { throw "$BoardId environment dimensions differ." }
    if ($master.Width -ne $shadow.Width -or $master.Height -ne $shadow.Height) { throw "$BoardId master/shadow canvases differ." }
    $composite = [System.Drawing.Bitmap]::new(1536, 1536, [System.Drawing.Imaging.PixelFormat]::Format32bppArgb)
    try {
        $graphics = [System.Drawing.Graphics]::FromImage($composite)
        try {
            $graphics.CompositingMode = [System.Drawing.Drawing2D.CompositingMode]::SourceCopy
            $graphics.DrawImageUnscaled($environment, 0, 0)
            $graphics.CompositingMode = [System.Drawing.Drawing2D.CompositingMode]::SourceOver
            $graphics.CompositingQuality = [System.Drawing.Drawing2D.CompositingQuality]::HighQuality
            $graphics.InterpolationMode = [System.Drawing.Drawing2D.InterpolationMode]::HighQualityBicubic
            $graphics.PixelOffsetMode = [System.Drawing.Drawing2D.PixelOffsetMode]::HighQuality
            $graphics.SmoothingMode = [System.Drawing.Drawing2D.SmoothingMode]::HighQuality
            $sourceRect = [System.Drawing.RectangleF]::new(0, 0, $master.Width, $master.Height)
            foreach ($instance in $instances) {
                $combinedScale = $normalization * [double]$instance.uniformScale
                $baseX = [double]$instance.p * 1536.0
                $baseY = [double]$instance.q * 1536.0
                $destination = [System.Drawing.RectangleF]::new(
                    [single]($baseX - $anchorX * $combinedScale),
                    [single]($baseY - $anchorY * $combinedScale),
                    [single]($master.Width * $combinedScale),
                    [single]($master.Height * $combinedScale)
                )
                $graphics.DrawImage($shadow, $destination, $sourceRect, [System.Drawing.GraphicsUnit]::Pixel)
                $graphics.DrawImage($master, $destination, $sourceRect, [System.Drawing.GraphicsUnit]::Pixel)
            }
        }
        finally { $graphics.Dispose() }
        $composite.Save($outputPath, [System.Drawing.Imaging.ImageFormat]::Png)
    }
    finally { $composite.Dispose() }
}
finally {
    $environment.Dispose()
    $master.Dispose()
    $shadow.Dispose()
}

Write-Output "Rendered deterministic final-series composite: $BoardId -> $outputPath"
