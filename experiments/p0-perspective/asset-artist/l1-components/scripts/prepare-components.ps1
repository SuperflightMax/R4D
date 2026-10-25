param(
    [string]$Root = (Split-Path -Parent $PSScriptRoot)
)

$ErrorActionPreference = 'Stop'
Add-Type -AssemblyName System.Drawing

$raw = Join-Path $Root 'raw'
$prepared = Join-Path $Root 'prepared'
New-Item -ItemType Directory -Force -Path $prepared | Out-Null

$environmentSource = Join-Path $raw 'environment-floor-plate-source.png'
$drumSource = Join-Path $raw 'drum-master-source.png'
$environmentOutput = Join-Path $prepared 'environment-floor-plate-1536.png'
$drumOutput = Join-Path $prepared 'drum-master-rgba.png'
$shadowOutput = Join-Path $prepared 'drum-shadow-rgba.png'
$metadataOutput = Join-Path $prepared 'component-metadata.json'

function New-ArgbBitmapFromFile([string]$Path) {
    $source = [System.Drawing.Bitmap]::FromFile($Path)
    try {
        $bitmap = [System.Drawing.Bitmap]::new(
            $source.Width,
            $source.Height,
            [System.Drawing.Imaging.PixelFormat]::Format32bppArgb
        )
        $graphics = [System.Drawing.Graphics]::FromImage($bitmap)
        try {
            $graphics.CompositingMode = [System.Drawing.Drawing2D.CompositingMode]::SourceCopy
            $graphics.DrawImageUnscaled($source, 0, 0)
        }
        finally {
            $graphics.Dispose()
        }
        return $bitmap
    }
    finally {
        $source.Dispose()
    }
}

function Get-BitmapBytes([System.Drawing.Bitmap]$Bitmap) {
    $rectangle = [System.Drawing.Rectangle]::new(0, 0, $Bitmap.Width, $Bitmap.Height)
    $data = $Bitmap.LockBits(
        $rectangle,
        [System.Drawing.Imaging.ImageLockMode]::ReadOnly,
        [System.Drawing.Imaging.PixelFormat]::Format32bppArgb
    )
    try {
        $stride = [Math]::Abs($data.Stride)
        $bytes = [byte[]]::new($stride * $Bitmap.Height)
        [System.Runtime.InteropServices.Marshal]::Copy($data.Scan0, $bytes, 0, $bytes.Length)
        return [pscustomobject]@{ Bytes = $bytes; Stride = $stride }
    }
    finally {
        $Bitmap.UnlockBits($data)
    }
}

function Set-BitmapBytes([System.Drawing.Bitmap]$Bitmap, [byte[]]$Bytes) {
    $rectangle = [System.Drawing.Rectangle]::new(0, 0, $Bitmap.Width, $Bitmap.Height)
    $data = $Bitmap.LockBits(
        $rectangle,
        [System.Drawing.Imaging.ImageLockMode]::WriteOnly,
        [System.Drawing.Imaging.PixelFormat]::Format32bppArgb
    )
    try {
        $expected = [Math]::Abs($data.Stride) * $Bitmap.Height
        if ($Bytes.Length -ne $expected) {
            throw "Unexpected byte count: $($Bytes.Length), expected $expected"
        }
        [System.Runtime.InteropServices.Marshal]::Copy($Bytes, 0, $data.Scan0, $Bytes.Length)
    }
    finally {
        $Bitmap.UnlockBits($data)
    }
}

# The built-in generator returned a square 1254 source. Contract v2 requires
# 1536 × 1536; resize uniformly with no crop or independent axis transform.
$environment = [System.Drawing.Bitmap]::FromFile($environmentSource)
try {
    $environmentRawWidth = $environment.Width
    $environmentRawHeight = $environment.Height
    $environmentPrepared = [System.Drawing.Bitmap]::new(
        1536,
        1536,
        [System.Drawing.Imaging.PixelFormat]::Format24bppRgb
    )
    try {
        $graphics = [System.Drawing.Graphics]::FromImage($environmentPrepared)
        try {
            $graphics.Clear([System.Drawing.Color]::Black)
            $graphics.CompositingMode = [System.Drawing.Drawing2D.CompositingMode]::SourceOver
            $graphics.CompositingQuality = [System.Drawing.Drawing2D.CompositingQuality]::HighQuality
            $graphics.InterpolationMode = [System.Drawing.Drawing2D.InterpolationMode]::HighQualityBicubic
            $graphics.PixelOffsetMode = [System.Drawing.Drawing2D.PixelOffsetMode]::HighQuality
            $graphics.SmoothingMode = [System.Drawing.Drawing2D.SmoothingMode]::HighQuality
            $graphics.DrawImage(
                $environment,
                [System.Drawing.Rectangle]::new(0, 0, 1536, 1536),
                [System.Drawing.Rectangle]::new(0, 0, $environment.Width, $environment.Height),
                [System.Drawing.GraphicsUnit]::Pixel
            )
        }
        finally {
            $graphics.Dispose()
        }
        $environmentPrepared.Save($environmentOutput, [System.Drawing.Imaging.ImageFormat]::Png)
    }
    finally {
        $environmentPrepared.Dispose()
    }
}
finally {
    $environment.Dispose()
}

# Clean alpha deterministically without repainting the object. Pixels below 8
# are generator speckles and become transparent; near-opaque interior pixels
# at 240+ become opaque; the antialiased edge range is preserved.
$alphaDropBelow = 8
$alphaOpaqueAt = 240
$padding = 64
$drum = New-ArgbBitmapFromFile $drumSource
try {
    $sourceData = Get-BitmapBytes $drum
    $minX = $drum.Width
    $minY = $drum.Height
    $maxX = -1
    $maxY = -1
    for ($y = 0; $y -lt $drum.Height; $y++) {
        for ($x = 0; $x -lt $drum.Width; $x++) {
            $alpha = $sourceData.Bytes[$y * $sourceData.Stride + $x * 4 + 3]
            if ($alpha -ge $alphaDropBelow) {
                if ($x -lt $minX) { $minX = $x }
                if ($x -gt $maxX) { $maxX = $x }
                if ($y -lt $minY) { $minY = $y }
                if ($y -gt $maxY) { $maxY = $y }
            }
        }
    }
    if ($maxX -lt $minX -or $maxY -lt $minY) {
        throw 'No visible drum pixels at the selected alpha threshold.'
    }

    $cropX = [Math]::Max(0, $minX - $padding)
    $cropY = [Math]::Max(0, $minY - $padding)
    $cropRight = [Math]::Min($drum.Width - 1, $maxX + $padding)
    $cropBottom = [Math]::Min($drum.Height - 1, $maxY + $padding)
    $cropWidth = $cropRight - $cropX + 1
    $cropHeight = $cropBottom - $cropY + 1

    $master = [System.Drawing.Bitmap]::new(
        $cropWidth,
        $cropHeight,
        [System.Drawing.Imaging.PixelFormat]::Format32bppArgb
    )
    try {
        $masterRectangle = [System.Drawing.Rectangle]::new(0, 0, $cropWidth, $cropHeight)
        $masterData = $master.LockBits(
            $masterRectangle,
            [System.Drawing.Imaging.ImageLockMode]::WriteOnly,
            [System.Drawing.Imaging.PixelFormat]::Format32bppArgb
        )
        try {
            $masterStride = [Math]::Abs($masterData.Stride)
            $masterBytes = [byte[]]::new($masterStride * $cropHeight)
            for ($y = 0; $y -lt $cropHeight; $y++) {
                for ($x = 0; $x -lt $cropWidth; $x++) {
                    $sourceIndex = ($cropY + $y) * $sourceData.Stride + ($cropX + $x) * 4
                    $targetIndex = $y * $masterStride + $x * 4
                    $alpha = $sourceData.Bytes[$sourceIndex + 3]
                    if ($alpha -lt $alphaDropBelow) {
                        continue
                    }
                    $masterBytes[$targetIndex] = $sourceData.Bytes[$sourceIndex]
                    $masterBytes[$targetIndex + 1] = $sourceData.Bytes[$sourceIndex + 1]
                    $masterBytes[$targetIndex + 2] = $sourceData.Bytes[$sourceIndex + 2]
                    $masterBytes[$targetIndex + 3] = if ($alpha -ge $alphaOpaqueAt) { 255 } else { $alpha }
                }
            }
            [System.Runtime.InteropServices.Marshal]::Copy(
                $masterBytes,
                0,
                $masterData.Scan0,
                $masterBytes.Length
            )
        }
        finally {
            $master.UnlockBits($masterData)
        }
        $master.Save($drumOutput, [System.Drawing.Imaging.ImageFormat]::Png)

        $axisRawX = [Math]::Round(
            ($minX + $maxX) / 2.0,
            [MidpointRounding]::AwayFromZero
        )
        $baseRawY = $maxY
        $anchorX = $axisRawX - $cropX
        $anchorY = $baseRawY - $cropY

        # Separate deterministic shadow master. The image shares the drum
        # canvas and anchor; only its painted shadow is offset right/down.
        $shadow = [System.Drawing.Bitmap]::new(
            $cropWidth,
            $cropHeight,
            [System.Drawing.Imaging.PixelFormat]::Format32bppArgb
        )
        try {
            $graphics = [System.Drawing.Graphics]::FromImage($shadow)
            try {
                $graphics.Clear([System.Drawing.Color]::Transparent)
                $graphics.SmoothingMode = [System.Drawing.Drawing2D.SmoothingMode]::AntiAlias
                $graphics.CompositingMode = [System.Drawing.Drawing2D.CompositingMode]::SourceOver

                for ($i = 0; $i -lt 18; $i++) {
                    $fraction = $i / 17.0
                    $width = [Math]::Round(820 - 170 * $fraction)
                    $height = [Math]::Round(70 - 28 * $fraction)
                    $centerX = $anchorX + 84
                    $centerY = $anchorY + 16
                    $left = [Math]::Round($centerX - $width / 2)
                    $top = [Math]::Round($centerY - $height / 2)
                    $alpha = [Math]::Round(2 + 4 * $fraction)
                    $brush = [System.Drawing.SolidBrush]::new(
                        [System.Drawing.Color]::FromArgb($alpha, 49, 30, 23)
                    )
                    try {
                        $graphics.FillEllipse($brush, $left, $top, $width, $height)
                    }
                    finally {
                        $brush.Dispose()
                    }
                }

                $contactBrush = [System.Drawing.SolidBrush]::new(
                    [System.Drawing.Color]::FromArgb(26, 45, 27, 20)
                )
                try {
                    $graphics.FillEllipse(
                        $contactBrush,
                        [Math]::Round($anchorX - 370),
                        [Math]::Round($anchorY - 13),
                        740,
                        34
                    )
                }
                finally {
                    $contactBrush.Dispose()
                }
            }
            finally {
                $graphics.Dispose()
            }
            $shadow.Save($shadowOutput, [System.Drawing.Imaging.ImageFormat]::Png)
        }
        finally {
            $shadow.Dispose()
        }

        $metadata = [ordered]@{
            schema = 'r4d.p0.asset-components.v1'
            environment = [ordered]@{
                rawFile = '../raw/environment-floor-plate-source.png'
                rawSize = @($environmentRawWidth, $environmentRawHeight)
                preparedFile = 'environment-floor-plate-1536.png'
                preparedSize = @(1536, 1536)
                transform = 'uniform full-frame bicubic resize; no crop; no independent axis transform'
            }
            drumMaster = [ordered]@{
                rawFile = '../raw/drum-master-source.png'
                rawSize = @($drum.Width, $drum.Height)
                alphaBoundsAtThreshold = @($minX, $minY, $maxX, $maxY)
                alphaDropBelow = $alphaDropBelow
                alphaOpaqueAt = $alphaOpaqueAt
                paddingPx = $padding
                cropRect = @($cropX, $cropY, $cropWidth, $cropHeight)
                preparedFile = 'drum-master-rgba.png'
                preparedSize = @($cropWidth, $cropHeight)
                baseCenterAnchorPx = @($anchorX, $anchorY)
                anchorMeaning = 'center of lowest visible base-contact edge beneath the object axis'
            }
            shadowMaster = [ordered]@{
                preparedFile = 'drum-shadow-rgba.png'
                preparedSize = @($cropWidth, $cropHeight)
                baseCenterAnchorPx = @($anchorX, $anchorY)
                rule = 'separate deterministic soft contact/cast shadow, offset right/down; same canvas and anchor as drum master'
            }
        }
        $metadata | ConvertTo-Json -Depth 8 | Set-Content -LiteralPath $metadataOutput -Encoding utf8NoBOM
    }
    finally {
        $master.Dispose()
    }
}
finally {
    $drum.Dispose()
}

Write-Output "Prepared L1 components in $prepared"
