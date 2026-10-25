param(
    [string]$Root = (Split-Path -Parent $PSScriptRoot),
    [string]$OutputDirectory = (Join-Path (Split-Path -Parent $PSScriptRoot) 'output')
)

$ErrorActionPreference = 'Stop'
Add-Type -AssemblyName System.Drawing

$experiment = [System.IO.Path]::GetFullPath((Join-Path $Root '..\..'))
$layoutPath = Join-Path $Root 'layout-v1.json'
$metadataPath = Join-Path $experiment 'asset-artist\l1-components\prepared\component-metadata.json'
$prepared = Join-Path $experiment 'asset-artist\l1-components\prepared'
$environmentPath = Join-Path $prepared 'environment-floor-plate-1536.png'
$masterPath = Join-Path $prepared 'drum-master-rgba.png'
$shadowPath = Join-Path $prepared 'drum-shadow-rgba.png'
$outputPath = Join-Path $OutputDirectory 'composite-l1.png'

$layout = Get-Content -LiteralPath $layoutPath -Raw | ConvertFrom-Json
$metadata = Get-Content -LiteralPath $metadataPath -Raw | ConvertFrom-Json
if ($layout.schema -ne 'r4d.p0.l1-layout.v1') { throw "Unexpected layout schema: $($layout.schema)" }
if ($layout.frame.widthPx -ne 1536 -or $layout.frame.heightPx -ne 1536) { throw 'L1 frame must remain 1536 × 1536.' }
if ($layout.controlMarkersAllowed -ne $false -or $layout.randomness -ne 'forbidden') { throw 'Clean deterministic output invariant failed.' }

$expectedQ = @(0.338, 0.453, 0.567, 0.681)
$expectedScale = @(0.939, 0.978, 1.018, 1.058)
$instances = @($layout.instances | Sort-Object @{Expression={[double]$_.q}}, @{Expression={[double]$_.p}}, instanceId)
if ($instances.Count -ne 4) { throw 'Exactly four L1 instances are required.' }
for ($i = 0; $i -lt 4; $i++) {
    if ([double]$instances[$i].q -ne $expectedQ[$i]) { throw "Unexpected q for instance $i" }
    if ([double]$instances[$i].uniformScale -ne $expectedScale[$i]) { throw "Unexpected scale for instance $i" }
}

$anchorX = [double]$metadata.drumMaster.baseCenterAnchorPx[0]
$anchorY = [double]$metadata.drumMaster.baseCenterAnchorPx[1]
if ($anchorX -ne [double]$metadata.shadowMaster.baseCenterAnchorPx[0] -or $anchorY -ne [double]$metadata.shadowMaster.baseCenterAnchorPx[1]) {
    throw 'Master and shadow source anchors differ.'
}
$normalization = [double]$layout.masterNormalization.nominalVisibleHeightAtUniformScale1Px / [double]$layout.masterNormalization.sourceVisibleHeightPx

New-Item -ItemType Directory -Force -Path $OutputDirectory | Out-Null
$environment = [System.Drawing.Bitmap]::FromFile($environmentPath)
$master = [System.Drawing.Bitmap]::FromFile($masterPath)
$shadow = [System.Drawing.Bitmap]::FromFile($shadowPath)
try {
    if ($environment.Width -ne 1536 -or $environment.Height -ne 1536) { throw 'Environment dimensions differ from contract.' }
    if ($master.Width -ne $shadow.Width -or $master.Height -ne $shadow.Height) { throw 'Master and shadow canvas dimensions differ.' }
    if ($master.Width -ne [int]$metadata.drumMaster.preparedSize[0] -or $master.Height -ne [int]$metadata.drumMaster.preparedSize[1]) { throw 'Master dimensions differ from metadata.' }

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
        finally {
            $graphics.Dispose()
        }
        $composite.Save($outputPath, [System.Drawing.Imaging.ImageFormat]::Png)
    }
    finally {
        $composite.Dispose()
    }
}
finally {
    $environment.Dispose()
    $master.Dispose()
    $shadow.Dispose()
}

Write-Output "Rendered deterministic L1 composite: $outputPath"
