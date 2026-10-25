param(
    [string]$Root = (Split-Path -Parent $PSScriptRoot)
)

$ErrorActionPreference='Stop'
Add-Type -AssemblyName System.Drawing

$boardRoot=Join-Path $Root 'board-01'
$sourcePath=Join-Path $boardRoot 'raw/plate-v3-source.png'
$outputPath=Join-Path $boardRoot 'prepared/environment-floor-plate-1536.png'
$metadataPath=Join-Path $boardRoot 'prepared/component-metadata.json'

$source=[System.Drawing.Bitmap]::FromFile($sourcePath)
try{
    $rawSize=@($source.Width,$source.Height)
    $output=[System.Drawing.Bitmap]::new(1536,1536,[System.Drawing.Imaging.PixelFormat]::Format24bppRgb)
    try{
        $graphics=[System.Drawing.Graphics]::FromImage($output)
        try{
            $graphics.Clear([System.Drawing.Color]::Black)
            $graphics.CompositingMode=[System.Drawing.Drawing2D.CompositingMode]::SourceOver
            $graphics.CompositingQuality=[System.Drawing.Drawing2D.CompositingQuality]::HighQuality
            $graphics.InterpolationMode=[System.Drawing.Drawing2D.InterpolationMode]::HighQualityBicubic
            $graphics.PixelOffsetMode=[System.Drawing.Drawing2D.PixelOffsetMode]::HighQuality
            $graphics.SmoothingMode=[System.Drawing.Drawing2D.SmoothingMode]::HighQuality
            $graphics.DrawImage($source,[System.Drawing.Rectangle]::new(0,0,1536,1536),[System.Drawing.Rectangle]::new(0,0,$source.Width,$source.Height),[System.Drawing.GraphicsUnit]::Pixel)
        }finally{$graphics.Dispose()}
        $output.Save($outputPath,[System.Drawing.Imaging.ImageFormat]::Png)
    }finally{$output.Dispose()}
}finally{$source.Dispose()}

$metadata=Get-Content -LiteralPath $metadataPath -Raw|ConvertFrom-Json
$metadata.environment.rawFile='../raw/plate-v3-source.png'
$metadata.environment.rawSize=$rawSize
$metadata.environment.rawSha256=(Get-FileHash -Algorithm SHA256 -LiteralPath $sourcePath).Hash.ToLowerInvariant()
$metadata.environment.preparedSha256=(Get-FileHash -Algorithm SHA256 -LiteralPath $outputPath).Hash.ToLowerInvariant()
$metadata|ConvertTo-Json -Depth 8|Set-Content -LiteralPath $metadataPath -Encoding utf8NoBOM

Write-Output "Prepared only corrected F1 plate: $outputPath"
