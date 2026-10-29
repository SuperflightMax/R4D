param([Parameter(Mandatory=$true)][string]$Version)
$ErrorActionPreference = 'Stop'
Add-Type -AssemblyName System.Drawing
$assetRoot = Split-Path -Parent $PSScriptRoot
$runtimeInputs = 'E:\R4D\perspective\p6-runtime\asset-artist\inputs\builder-draft-v01'
$rawFile = Join-Path $assetRoot ('raw\whole-board-' + $Version + '.png')
$registrationFile = Join-Path $runtimeInputs 'registration.png'
if ((Get-FileHash -LiteralPath $registrationFile -Algorithm SHA256).Hash.ToLowerInvariant() -ne '426bec72faf21fe6ba654dca988ed1d74241b1372246d78741419b19a3d5cf4a') { throw 'Registration SHA256 mismatch' }
$preparedDir = Join-Path $assetRoot 'prepared'
$evidenceDir = Join-Path $assetRoot 'evidence'
New-Item -ItemType Directory -Path $preparedDir,$evidenceDir -Force | Out-Null
$raw = [System.Drawing.Bitmap]::new($rawFile)
if ($raw.Width -ne $raw.Height) { $raw.Dispose(); throw 'Non-square output: no crop or axis warp permitted' }
$prepared = [System.Drawing.Bitmap]::new(1536,1536,[System.Drawing.Imaging.PixelFormat]::Format32bppArgb)
$graphics = [System.Drawing.Graphics]::FromImage($prepared)
$graphics.CompositingMode = [System.Drawing.Drawing2D.CompositingMode]::SourceCopy
$graphics.InterpolationMode = [System.Drawing.Drawing2D.InterpolationMode]::HighQualityBicubic
$graphics.PixelOffsetMode = [System.Drawing.Drawing2D.PixelOffsetMode]::HighQuality
$graphics.DrawImage($raw,[System.Drawing.Rectangle]::new(0,0,1536,1536),0,0,$raw.Width,$raw.Height,[System.Drawing.GraphicsUnit]::Pixel)
$graphics.Dispose()
$preparedFile = Join-Path $preparedDir ('whole-board-' + $Version + '-1536.png')
$prepared.Save($preparedFile,[System.Drawing.Imaging.ImageFormat]::Png)
$overlay = [System.Drawing.Bitmap]::new($prepared)
$registration = [System.Drawing.Bitmap]::new($registrationFile)
$graphics = [System.Drawing.Graphics]::FromImage($overlay)
$graphics.DrawImageUnscaled($registration,0,0)
$graphics.Dispose()
$overlayFile = Join-Path $evidenceDir ('whole-board-' + $Version + '-registration.png')
$overlay.Save($overlayFile,[System.Drawing.Imaging.ImageFormat]::Png)
[pscustomobject]@{Version=$Version;RawDimensions=@($raw.Width,$raw.Height);PreparedDimensions=@(1536,1536);Operation='single uniform full-frame scale; no crop, local warp or new registration';RawSHA256=(Get-FileHash -LiteralPath $rawFile -Algorithm SHA256).Hash.ToLowerInvariant();PreparedSHA256=(Get-FileHash -LiteralPath $preparedFile -Algorithm SHA256).Hash.ToLowerInvariant();OverlaySHA256=(Get-FileHash -LiteralPath $overlayFile -Algorithm SHA256).Hash.ToLowerInvariant()} | ConvertTo-Json | Set-Content -LiteralPath (Join-Path $evidenceDir ('whole-board-' + $Version + '-preparation.json')) -Encoding utf8
$registration.Dispose(); $overlay.Dispose(); $prepared.Dispose(); $raw.Dispose()
Get-Content -LiteralPath (Join-Path $evidenceDir ('whole-board-' + $Version + '-preparation.json')) -Raw
