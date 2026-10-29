param(
  [string]$Runtime='E:\R4D\perspective\p6-runtime\visual-qa',
  [string]$RawSource='E:\R4D\perspective\p6-worktrees\asset-artist\experiments\p6-geometry-first-art\asset-artist\raw\whole-board-v01.png',
  [string]$RegistrationSource='E:\R4D\perspective\p6-worktrees\builder\experiments\p6-geometry-first-art\builder\draft-v01\registration.png'
)
$ErrorActionPreference='Stop'
$RawHash='204e30e5b8d296afc916def97936c90c42b3524d68650e390297c8b18dd9b81e'
$RegistrationHash='426bec72faf21fe6ba654dca988ed1d74241b1372246d78741419b19a3d5cf4a'
function Assert-Hash([string]$Path,[string]$Expected){
  if((Get-FileHash -LiteralPath $Path -Algorithm SHA256).Hash.ToLowerInvariant() -ne $Expected){throw "Hash mismatch: $Path"}
}
Assert-Hash $RawSource $RawHash
Assert-Hash $RegistrationSource $RegistrationHash
if((Get-PSDrive -Name E).Free -le 2GB){throw 'E <= 2 GiB: stop before processing'}
$ReviewDir=Join-Path $Runtime 'whole-image-v01'
New-Item -ItemType Directory -Path $ReviewDir -Force | Out-Null
$TempDir=Join-Path $Runtime 'tmp'
New-Item -ItemType Directory -Path $TempDir -Force | Out-Null
$env:TEMP=$TempDir
$env:TMP=$TempDir
$RawCopy=Join-Path $ReviewDir 'whole-board-v01.raw.png'
$RegistrationCopy=Join-Path $ReviewDir 'registration.frozen.png'
if(Test-Path -LiteralPath $RawCopy){Assert-Hash $RawCopy $RawHash}else{Copy-Item -LiteralPath $RawSource -Destination $RawCopy}
if(Test-Path -LiteralPath $RegistrationCopy){Assert-Hash $RegistrationCopy $RegistrationHash}else{Copy-Item -LiteralPath $RegistrationSource -Destination $RegistrationCopy}
Add-Type -AssemblyName System.Drawing
$Raw=[Drawing.Image]::FromFile($RawCopy)
if($Raw.Width -ne 1254 -or $Raw.Height -ne 1254){$Raw.Dispose();throw 'Unexpected raw dimensions'}
$Normalized=[Drawing.Bitmap]::new(1536,1536,[Drawing.Imaging.PixelFormat]::Format32bppArgb)
$G=[Drawing.Graphics]::FromImage($Normalized)
$G.CompositingMode=[Drawing.Drawing2D.CompositingMode]::SourceCopy
$G.CompositingQuality=[Drawing.Drawing2D.CompositingQuality]::HighQuality
$G.InterpolationMode=[Drawing.Drawing2D.InterpolationMode]::HighQualityBicubic
$G.PixelOffsetMode=[Drawing.Drawing2D.PixelOffsetMode]::HighQuality
$G.DrawImage($Raw,[Drawing.Rectangle]::new(0,0,1536,1536),0,0,1254,1254,[Drawing.GraphicsUnit]::Pixel)
$G.Dispose()
$Raw.Dispose()
$NormalizedPath=Join-Path $ReviewDir 'whole-board-v01.full-frame-1536.png'
$Normalized.Save($NormalizedPath,[Drawing.Imaging.ImageFormat]::Png)
$Overlay=[Drawing.Bitmap]::new($Normalized)
$Normalized.Dispose()
$Registration=[Drawing.Image]::FromFile($RegistrationCopy)
$G=[Drawing.Graphics]::FromImage($Overlay)
$G.CompositingMode=[Drawing.Drawing2D.CompositingMode]::SourceOver
$G.DrawImageUnscaled($Registration,0,0)
$G.Dispose()
$Registration.Dispose()
$OverlayPath=Join-Path $ReviewDir 'whole-board-v01.registered-overlay.png'
$Overlay.Save($OverlayPath,[Drawing.Imaging.ImageFormat]::Png)
$Overlay.Dispose()
$Outputs=foreach($Path in @($RawCopy,$RegistrationCopy,$NormalizedPath,$OverlayPath)){
  [ordered]@{path=$Path;bytes=(Get-Item -LiteralPath $Path).Length;sha256=(Get-FileHash -LiteralPath $Path -Algorithm SHA256).Hash.ToLowerInvariant()}
}
$Scale=1536.0/1254.0
$Record=[ordered]@{
  schema='r4d.p6.visual-qa.whole-image-v01.registration.v1'
  turnId='01a187b1-e92e-78a0-9d18-573f0a4673ed'
  nativeEditCall='exec-70009f94-ad4b-47e6-a8e6-ce7e37eea12e'
  firstAttempt='whole-board-v01; retained first whole-image edit, no later candidate included'
  draftCommit='bdf470e5beb468266184cc2ea0c997191d9907b3'
  draftSha256='bc13aa13e2b33b0e58cd0e87b90e684c3c4adbb3576d8d9b0379e3dee1bec532'
  acceptedP1='4b47db04c7140ebf88f69b91faa0b790d46f22ec'
  rawSource=$RawSource
  rawSha256=$RawHash
  registrationSource=$RegistrationSource
  registrationSha256=$RegistrationHash
  transform=[ordered]@{rawSize=@(1254,1254);outputSize=@(1536,1536);scaleXY=@($Scale,$Scale);translation=@(0,0);crop=$false;fitHomography=$false;localWarp=$false;interpolation='System.Drawing HighQualityBicubic'}
  overlay='exact frozen registration, source-over, DrawImageUnscaled at 0,0 after uniform normalization'
  outputs=$Outputs
  scope='Static visual registration only; no art correction, motion QA or artistic PASS. Raw unchanged.'
}
[IO.File]::WriteAllText((Join-Path $PSScriptRoot 'registration.json'),($Record|ConvertTo-Json -Depth 10)+"`n",[Text.UTF8Encoding]::new($false))
$Record | ConvertTo-Json -Depth 10
