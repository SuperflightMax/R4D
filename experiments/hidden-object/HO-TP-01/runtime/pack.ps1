param()
$ErrorActionPreference = 'Stop'
$builderManifestPath = 'K:\Agents\R4D\Review\HO-TP-01\assets\v002\manifest_v002.json'
$builderExpectedManifestHash = '8d6cc5010886ec46a66258afe8685b93b137376c7bf87bc8c66bb80441edeff0'
$builderExpectedSourceHash = 'f6f96897290470778067ae15cba408418673f7578c38195736bee60fb822a65e'
$builderTargetPath = 'K:\Agents\R4D\Review\HO-TP-01\runtime'

function Get-BuilderByteHash([byte[]]$builderBytes) {
  $builderProvider = [System.Security.Cryptography.SHA256]::Create()
  try { return ([BitConverter]::ToString($builderProvider.ComputeHash($builderBytes))).Replace('-', '').ToLowerInvariant() }
  finally { $builderProvider.Dispose() }
}
function Read-BuilderImage($builderEntry, [bool]$builderEmbed = $true) {
  $builderBytes = [IO.File]::ReadAllBytes($builderEntry.path)
  $builderHash = Get-BuilderByteHash $builderBytes
  if ($builderBytes.Length -ne $builderEntry.bytes -or $builderHash -ne $builderEntry.sha256) { throw ('STOP: input bytes/hash mismatch: ' + $builderEntry.path) }
  $builderWidth = $builderBytes[16]*16777216 + $builderBytes[17]*65536 + $builderBytes[18]*256 + $builderBytes[19]
  $builderHeight = $builderBytes[20]*16777216 + $builderBytes[21]*65536 + $builderBytes[22]*256 + $builderBytes[23]
  if ($builderWidth -ne $builderEntry.width -or $builderHeight -ne $builderEntry.height) { throw ('STOP: input PNG dimensions mismatch: ' + $builderEntry.path) }
  $builderRecord = [ordered]@{ path = $builderEntry.path; bytes = $builderEntry.bytes; sha256 = $builderHash; width = $builderWidth; height = $builderHeight }
  if ($builderEmbed) { $builderRecord.dataUrl = 'data:image/png;base64,' + [Convert]::ToBase64String($builderBytes) }
  return $builderRecord
}

$builderManifestBytes = [IO.File]::ReadAllBytes($builderManifestPath)
if ((Get-BuilderByteHash $builderManifestBytes) -ne $builderExpectedManifestHash) { throw 'STOP: exact manifest_v002 hash mismatch; a new revision requires addressed CTO input.' }
$builderManifest = [Text.Encoding]::UTF8.GetString($builderManifestBytes) | ConvertFrom-Json
if ($builderManifest.source_original_png.sha256 -ne $builderExpectedSourceHash -or ($builderManifest.roi_full_source_xywh -join ',') -ne '0,480,960,461' -or $builderManifest.replacement_alpha_overlap_pixels -ne 0 -or $builderManifest.hit_masks.overlap_pixels -ne 0) { throw 'STOP: source/ROI/overlap does not match the task.' }
$builderPayload = [ordered]@{
  manifestPath = $builderManifestPath
  manifestSha256 = $builderExpectedManifestHash
  source = Read-BuilderImage $builderManifest.source_original_png
  expectedBothState = Read-BuilderImage $builderManifest.combined_both_removed_png $false
  objects = [ordered]@{}
  artStatus = 'PARTIAL: bowl upper linen seam; candidate only, no independent or human art acceptance'
}
$builderInputs = @($builderManifest.source_original_png, $builderManifest.combined_both_removed_png)
foreach ($builderItem in @('bread','bowl')) {
  $builderState = $builderManifest.states.($builderItem + '_removed')
  $builderPayload.objects[$builderItem] = [ordered]@{
    origin = $builderState.replacement_patch_origin_xy
    patch = Read-BuilderImage $builderState.replacement_patch_rgba_png
    alpha = Read-BuilderImage $builderState.replacement_alpha_full_png
    expectedState = Read-BuilderImage $builderState.full_working_png $false
    hitMask = Read-BuilderImage $builderManifest.hit_masks.$builderItem.file
    hitMaskGeometry = $builderManifest.hit_masks.$builderItem.geometry
    artStatus = $builderState.art_status
  }
  $builderInputs += @($builderState.replacement_patch_rgba_png, $builderState.replacement_alpha_full_png, $builderState.full_working_png, $builderManifest.hit_masks.$builderItem.file)
}
$builderSourceFiles = @('index.html','style.css','app.js','pack.ps1','author-check.cjs','README.md')
foreach ($builderName in $builderSourceFiles) {
  if (-not (Test-Path -LiteralPath (Join-Path $PSScriptRoot $builderName))) { throw ('Missing source: ' + $builderName) }
}
if (-not (Test-Path -LiteralPath $builderTargetPath)) { New-Item -ItemType Directory -Path $builderTargetPath | Out-Null }
foreach ($builderName in $builderSourceFiles) {
  $builderFromPath = Join-Path $PSScriptRoot $builderName
  $builderToPath = Join-Path $builderTargetPath $builderName
  if ([IO.Path]::GetFullPath($builderFromPath) -ne [IO.Path]::GetFullPath($builderToPath)) { Copy-Item -LiteralPath $builderFromPath -Destination $builderToPath }
}
$builderUtf8 = New-Object System.Text.UTF8Encoding($false)
[IO.File]::WriteAllText((Join-Path $builderTargetPath 'assets.js'), 'window.HOTP01_ASSETS = ' + ($builderPayload | ConvertTo-Json -Depth 8 -Compress) + ';' + [Environment]::NewLine, $builderUtf8)
Copy-Item -LiteralPath $builderManifestPath -Destination (Join-Path $builderTargetPath 'artist-manifest_v002.json')
$builderPackageFiles = @($builderSourceFiles) + @('assets.js','artist-manifest_v002.json')
$builderInventory = foreach ($builderName in $builderPackageFiles) {
  $builderFilePath = Join-Path $builderTargetPath $builderName
  [ordered]@{ path = $builderName; bytes = (Get-Item -LiteralPath $builderFilePath).Length; sha256 = (Get-FileHash -LiteralPath $builderFilePath -Algorithm SHA256).Hash.ToLowerInvariant() }
}
$builderPackageManifest = [ordered]@{
  checkpoint = 'TECHNICAL_CANDIDATE_ART_PARTIAL'
  createdUtc = [DateTime]::UtcNow.ToString('o')
  originalPath = $builderManifest.source_original_png.path
  originalSha256 = $builderExpectedSourceHash
  artistManifest = $builderManifestPath
  artistManifestSha256 = $builderExpectedManifestHash
  artStatus = $builderPayload.artStatus
  availableStates = @('both','bread_removed','bowl_removed','both_removed')
  inputs = @($builderInputs)
  files = @($builderInventory)
}
[IO.File]::WriteAllText((Join-Path $builderTargetPath 'PACKAGE_MANIFEST.json'), ($builderPackageManifest | ConvertTo-Json -Depth 8) + [Environment]::NewLine, $builderUtf8)
Write-Output (Join-Path $builderTargetPath 'index.html')
