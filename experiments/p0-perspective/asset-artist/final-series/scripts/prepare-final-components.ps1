param(
    [string]$Root = (Split-Path -Parent $PSScriptRoot)
)

$ErrorActionPreference = 'Stop'
Add-Type -AssemblyName System.Drawing

$configs = @(
    [ordered]@{ Board='board-01'; Plate='plate-v2-source.png'; Master='master-v1-source.png'; ShadowRgb=@(45,50,68); ShadowOffsetX=78; ShadowOffsetY=16 },
    [ordered]@{ Board='board-02'; Plate='plate-v1-source.png'; Master='master-v1-source.png'; ShadowRgb=@(66,42,28); ShadowOffsetX=64; ShadowOffsetY=15 },
    [ordered]@{ Board='board-03'; Plate='plate-v2-source.png'; Master='master-v1-source.png'; ShadowRgb=@(24,22,20); ShadowOffsetX=72; ShadowOffsetY=17 },
    [ordered]@{ Board='board-04'; Plate='plate-v1-source.png'; Master='master-v1-source.png'; ShadowRgb=@(42,50,61); ShadowOffsetX=82; ShadowOffsetY=15 }
)

$alphaDropBelow = 8
$alphaOpaqueAt = 240
$padding = 64

function New-ArgbBitmapFromFile([string]$Path) {
    $source = [System.Drawing.Bitmap]::FromFile($Path)
    try {
        $bitmap = [System.Drawing.Bitmap]::new($source.Width, $source.Height, [System.Drawing.Imaging.PixelFormat]::Format32bppArgb)
        $graphics = [System.Drawing.Graphics]::FromImage($bitmap)
        try {
            $graphics.CompositingMode = [System.Drawing.Drawing2D.CompositingMode]::SourceCopy
            $graphics.DrawImageUnscaled($source, 0, 0)
        }
        finally { $graphics.Dispose() }
        return $bitmap
    }
    finally { $source.Dispose() }
}

function Get-BitmapBytes([System.Drawing.Bitmap]$Bitmap) {
    $rectangle = [System.Drawing.Rectangle]::new(0, 0, $Bitmap.Width, $Bitmap.Height)
    $data = $Bitmap.LockBits($rectangle, [System.Drawing.Imaging.ImageLockMode]::ReadOnly, [System.Drawing.Imaging.PixelFormat]::Format32bppArgb)
    try {
        $stride = [Math]::Abs($data.Stride)
        $bytes = [byte[]]::new($stride * $Bitmap.Height)
        [System.Runtime.InteropServices.Marshal]::Copy($data.Scan0, $bytes, 0, $bytes.Length)
        return [pscustomobject]@{ Bytes=$bytes; Stride=$stride }
    }
    finally { $Bitmap.UnlockBits($data) }
}

function Get-Sha256([string]$Path) {
    return (Get-FileHash -Algorithm SHA256 -LiteralPath $Path).Hash.ToLowerInvariant()
}

foreach ($config in $configs) {
    $boardRoot = Join-Path $Root $config.Board
    $rawRoot = Join-Path $boardRoot 'raw'
    $preparedRoot = Join-Path $boardRoot 'prepared'
    New-Item -ItemType Directory -Force -Path $preparedRoot | Out-Null

    $plateSource = Join-Path $rawRoot $config.Plate
    $masterSource = Join-Path $rawRoot $config.Master
    $plateOutput = Join-Path $preparedRoot 'environment-floor-plate-1536.png'
    $masterOutput = Join-Path $preparedRoot 'control-master-rgba.png'
    $shadowOutput = Join-Path $preparedRoot 'control-shadow-rgba.png'
    $metadataOutput = Join-Path $preparedRoot 'component-metadata.json'

    # Opaque full-frame resize. No crop and no independent axis transform.
    $plate = [System.Drawing.Bitmap]::FromFile($plateSource)
    try {
        $plateRawSize = @($plate.Width, $plate.Height)
        $preparedPlate = [System.Drawing.Bitmap]::new(1536, 1536, [System.Drawing.Imaging.PixelFormat]::Format24bppRgb)
        try {
            $graphics = [System.Drawing.Graphics]::FromImage($preparedPlate)
            try {
                $graphics.Clear([System.Drawing.Color]::Black)
                $graphics.CompositingMode = [System.Drawing.Drawing2D.CompositingMode]::SourceOver
                $graphics.CompositingQuality = [System.Drawing.Drawing2D.CompositingQuality]::HighQuality
                $graphics.InterpolationMode = [System.Drawing.Drawing2D.InterpolationMode]::HighQualityBicubic
                $graphics.PixelOffsetMode = [System.Drawing.Drawing2D.PixelOffsetMode]::HighQuality
                $graphics.SmoothingMode = [System.Drawing.Drawing2D.SmoothingMode]::HighQuality
                $graphics.DrawImage($plate, [System.Drawing.Rectangle]::new(0,0,1536,1536), [System.Drawing.Rectangle]::new(0,0,$plate.Width,$plate.Height), [System.Drawing.GraphicsUnit]::Pixel)
            }
            finally { $graphics.Dispose() }
            $preparedPlate.Save($plateOutput, [System.Drawing.Imaging.ImageFormat]::Png)
        }
        finally { $preparedPlate.Dispose() }
    }
    finally { $plate.Dispose() }

    # Alpha cleanup and crop. Raw remains untouched as evidence.
    $master = New-ArgbBitmapFromFile $masterSource
    try {
        $sourceData = Get-BitmapBytes $master
        $minX=$master.Width; $minY=$master.Height; $maxX=-1; $maxY=-1
        for ($y=0; $y -lt $master.Height; $y++) {
            for ($x=0; $x -lt $master.Width; $x++) {
                $alpha = $sourceData.Bytes[$y*$sourceData.Stride + $x*4 + 3]
                if ($alpha -ge $alphaDropBelow) {
                    if ($x -lt $minX) {$minX=$x}; if ($x -gt $maxX) {$maxX=$x}
                    if ($y -lt $minY) {$minY=$y}; if ($y -gt $maxY) {$maxY=$y}
                }
            }
        }
        if ($maxX -lt $minX -or $maxY -lt $minY) { throw "$($config.Board): no visible master pixels" }

        $cropX=[Math]::Max(0,$minX-$padding); $cropY=[Math]::Max(0,$minY-$padding)
        $cropRight=[Math]::Min($master.Width-1,$maxX+$padding); $cropBottom=[Math]::Min($master.Height-1,$maxY+$padding)
        $cropWidth=$cropRight-$cropX+1; $cropHeight=$cropBottom-$cropY+1
        $preparedMaster=[System.Drawing.Bitmap]::new($cropWidth,$cropHeight,[System.Drawing.Imaging.PixelFormat]::Format32bppArgb)
        try {
            $rect=[System.Drawing.Rectangle]::new(0,0,$cropWidth,$cropHeight)
            $data=$preparedMaster.LockBits($rect,[System.Drawing.Imaging.ImageLockMode]::WriteOnly,[System.Drawing.Imaging.PixelFormat]::Format32bppArgb)
            try {
                $stride=[Math]::Abs($data.Stride); $bytes=[byte[]]::new($stride*$cropHeight)
                for ($y=0; $y -lt $cropHeight; $y++) {
                    for ($x=0; $x -lt $cropWidth; $x++) {
                        $si=($cropY+$y)*$sourceData.Stride+($cropX+$x)*4; $ti=$y*$stride+$x*4
                        $alpha=$sourceData.Bytes[$si+3]
                        if ($alpha -lt $alphaDropBelow) { continue }
                        $bytes[$ti]=$sourceData.Bytes[$si]; $bytes[$ti+1]=$sourceData.Bytes[$si+1]; $bytes[$ti+2]=$sourceData.Bytes[$si+2]
                        $bytes[$ti+3]=if($alpha -ge $alphaOpaqueAt){255}else{$alpha}
                    }
                }
                [System.Runtime.InteropServices.Marshal]::Copy($bytes,0,$data.Scan0,$bytes.Length)
            }
            finally { $preparedMaster.UnlockBits($data) }
            $preparedMaster.Save($masterOutput,[System.Drawing.Imaging.ImageFormat]::Png)

            $axisRawX=[Math]::Round(($minX+$maxX)/2.0,[MidpointRounding]::AwayFromZero)
            $anchorX=$axisRawX-$cropX; $anchorY=$maxY-$cropY

            # Board-owned shadow: same canvas and anchor, but board-specific tone/offset.
            $shadow=[System.Drawing.Bitmap]::new($cropWidth,$cropHeight,[System.Drawing.Imaging.PixelFormat]::Format32bppArgb)
            try {
                $graphics=[System.Drawing.Graphics]::FromImage($shadow)
                try {
                    $graphics.Clear([System.Drawing.Color]::Transparent)
                    $graphics.SmoothingMode=[System.Drawing.Drawing2D.SmoothingMode]::AntiAlias
                    $rgb=$config.ShadowRgb; $baseWidth=[Math]::Round($cropWidth*0.76); $baseHeight=[Math]::Max(42,[Math]::Round($cropHeight*0.062))
                    for($i=0;$i-lt 18;$i++){
                        $fraction=$i/17.0; $width=[Math]::Round($baseWidth*(1.0-0.18*$fraction)); $height=[Math]::Round($baseHeight*(1.0-0.36*$fraction))
                        $left=[Math]::Round($anchorX+$config.ShadowOffsetX-$width/2); $top=[Math]::Round($anchorY+$config.ShadowOffsetY-$height/2)
                        $brush=[System.Drawing.SolidBrush]::new([System.Drawing.Color]::FromArgb([Math]::Round(2+4*$fraction),$rgb[0],$rgb[1],$rgb[2]))
                        try{$graphics.FillEllipse($brush,$left,$top,$width,$height)}finally{$brush.Dispose()}
                    }
                    $contactWidth=[Math]::Round($cropWidth*0.68); $contactHeight=[Math]::Max(28,[Math]::Round($cropHeight*0.03))
                    $contact=[System.Drawing.SolidBrush]::new([System.Drawing.Color]::FromArgb(26,$rgb[0],$rgb[1],$rgb[2]))
                    try{$graphics.FillEllipse($contact,[Math]::Round($anchorX-$contactWidth/2),[Math]::Round($anchorY-$contactHeight*0.4),$contactWidth,$contactHeight)}finally{$contact.Dispose()}
                }
                finally { $graphics.Dispose() }
                $shadow.Save($shadowOutput,[System.Drawing.Imaging.ImageFormat]::Png)
            }
            finally { $shadow.Dispose() }

            $metadata=[ordered]@{
                schema='r4d.p0.final-board-components.v1'; boardId=$config.Board
                environment=[ordered]@{rawFile="../raw/$($config.Plate)";rawSize=$plateRawSize;rawSha256=(Get-Sha256 $plateSource);preparedFile='environment-floor-plate-1536.png';preparedSize=@(1536,1536);preparedSha256=(Get-Sha256 $plateOutput);transform='uniform full-frame bicubic resize; no crop; no independent axis transform; opaque RGB export'}
                master=[ordered]@{rawFile="../raw/$($config.Master)";rawSize=@($master.Width,$master.Height);rawSha256=(Get-Sha256 $masterSource);alphaBoundsAtThreshold=@($minX,$minY,$maxX,$maxY);alphaDropBelow=$alphaDropBelow;alphaOpaqueAt=$alphaOpaqueAt;paddingPx=$padding;cropRect=@($cropX,$cropY,$cropWidth,$cropHeight);preparedFile='control-master-rgba.png';preparedSize=@($cropWidth,$cropHeight);preparedSha256=(Get-Sha256 $masterOutput);baseCenterAnchorPx=@($anchorX,$anchorY);anchorMeaning='center of lowest visible base-contact edge beneath the object axis'}
                shadow=[ordered]@{preparedFile='control-shadow-rgba.png';preparedSize=@($cropWidth,$cropHeight);preparedSha256=(Get-Sha256 $shadowOutput);baseCenterAnchorPx=@($anchorX,$anchorY);rgb=$rgb;offsetPx=@($config.ShadowOffsetX,$config.ShadowOffsetY);rule='board-owned deterministic soft contact/cast shadow; same canvas and anchor as master; upper-left light means cast right/down'}
            }
            $metadata|ConvertTo-Json -Depth 8|Set-Content -LiteralPath $metadataOutput -Encoding utf8NoBOM
        }
        finally { $preparedMaster.Dispose() }
    }
    finally { $master.Dispose() }

    Write-Output "Prepared $($config.Board)"
}
