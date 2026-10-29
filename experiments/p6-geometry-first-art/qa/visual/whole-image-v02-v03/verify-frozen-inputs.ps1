param(
  [string]$Repo='E:\R4D\perspective\p6-worktrees\visual-qa',
  [string]$ArtistDir='E:\R4D\perspective\p6-worktrees\asset-artist\experiments\p6-geometry-first-art\asset-artist',
  [string]$Runtime='E:\R4D\perspective\p6-runtime\visual-qa'
)
$ErrorActionPreference='Stop'
$Frozen='da4cae189c3a103bc84909de8cbc4f4b6daed86a'
$Prefix='experiments/p6-geometry-first-art/asset-artist'
$ReviewDir=Join-Path $Runtime 'whole-image-v02-v03'
if((Get-PSDrive -Name E).Free -le 2GB){throw 'E <= 2 GiB: stop before copy'}
New-Item -ItemType Directory -Path $ReviewDir -Force | Out-Null
$Specs=@(
  @{Version='v02';Role='raw';Relative='raw/whole-board-v02.png';SHA256='539e4b1cbbcca9931dcc5c1bfaedc680de03720a21d9c82148cfb74b1198680f';Size=1254;Copy='whole-board-v02.raw.png'},
  @{Version='v02';Role='prepared';Relative='prepared/whole-board-v02-1536.png';SHA256='9b201f4ed3a10fcc7d09a87c6b93d249257e619a065c0b4c541b022059e2a547';Size=1536},
  @{Version='v02';Role='overlay';Relative='evidence/whole-board-v02-registration.png';SHA256='731f8532bf828a179f69dad1c04b5eb99ebfef2388bf3a9e63ba34026edff283';Size=1536;Copy='whole-board-v02.registration.png'},
  @{Version='v03';Role='raw';Relative='raw/whole-board-v03.png';SHA256='86a781198ba09b92ebbf16ce033784805cfcdd29d75ec28b2214521fbd79b501';Size=1254;Copy='whole-board-v03.raw.png'},
  @{Version='v03';Role='prepared';Relative='prepared/whole-board-v03-1536.png';SHA256='a0c8f77d3a232543cf12468500cf1db9911d4d01f720b2154d16213a43a5ca4d';Size=1536},
  @{Version='v03';Role='overlay';Relative='evidence/whole-board-v03-registration.png';SHA256='7f20f9f8b8e2b858df373c734bffd118d37de394adc8685395fe6ad3918efbc8';Size=1536;Copy='whole-board-v03.registration.png'}
)
$Records=foreach($Spec in $Specs){
  $Path=Join-Path $ArtistDir $Spec.Relative
  $GitObject="${Frozen}:${Prefix}/$($Spec.Relative)"
  $ExpectedBlob=git -C $Repo rev-parse $GitObject
  if($LASTEXITCODE -ne 0){throw "Cannot read frozen identity: $GitObject"}
  $LocalBlob=git -C $Repo hash-object --no-filters -- $Path
  if($LASTEXITCODE -ne 0 -or $LocalBlob -ne $ExpectedBlob){throw "Frozen local bytes mismatch: $Path"}
  $Hash=(Get-FileHash -LiteralPath $Path -Algorithm SHA256).Hash.ToLowerInvariant()
  if($Hash -ne $Spec.SHA256){throw "SHA256 mismatch: $Path"}
  $Bytes=[IO.File]::ReadAllBytes($Path)
  $Width=[Net.IPAddress]::NetworkToHostOrder([BitConverter]::ToInt32($Bytes,16))
  $Height=[Net.IPAddress]::NetworkToHostOrder([BitConverter]::ToInt32($Bytes,20))
  if($Width -ne $Spec.Size -or $Height -ne $Spec.Size){throw "PNG size mismatch: $Path"}
  $OwnCopy=$null
  if($Spec.ContainsKey('Copy')){
    $OwnCopy=Join-Path $ReviewDir $Spec.Copy
    if(Test-Path -LiteralPath $OwnCopy){
      if((Get-FileHash -LiteralPath $OwnCopy -Algorithm SHA256).Hash.ToLowerInvariant() -ne $Hash){throw "Existing evidence differs: $OwnCopy"}
    }else{Copy-Item -LiteralPath $Path -Destination $OwnCopy}
  }
  [ordered]@{version=$Spec.Version;role=$Spec.Role;gitObject=$GitObject;gitBlob=$ExpectedBlob;sha256=$Hash;bytes=$Bytes.Length;dimensions=@($Width,$Height);source=$Path;ownRuntimeCopy=$OwnCopy}
}
$Receipt=[ordered]@{
  schema='r4d.p6.visual-qa.whole-image-v02-v03.input-receipt.v1'
  turnId='01a187ba-1f1c-70b1-949b-8e5b3391dc3f'
  frozenArtistCommit=$Frozen
  acceptedP1='4b47db04c7140ebf88f69b91faa0b790d46f22ec'
  draftCommit='bdf470e5beb468266184cc2ea0c997191d9907b3'
  registrationSha256='426bec72faf21fe6ba654dca988ed1d74241b1372246d78741419b19a3d5cf4a'
  files=$Records
  normalization='Existing frozen Artist outputs; verified preparation records and compare-whole-image.ps1 at exact Artist commit. 1254 square -> 1536 square, uniform full-frame; exact registration unscaled at 0,0. No image changed or new fit performed by Visual QA.'
  scope='Representative original/overlay comparison only; not complete candidate registration or motion QA'
}
[IO.File]::WriteAllText((Join-Path $PSScriptRoot 'input-receipt.json'),($Receipt|ConvertTo-Json -Depth 10)+"`n",[Text.UTF8Encoding]::new($false))
$Receipt|ConvertTo-Json -Depth 10
