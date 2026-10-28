$ErrorActionPreference='Stop'
$taskRuntime='E:/R4D/perspective/p5-runtime/asset-artist'
$taskRepoRoot='E:/R4D/perspective/p5-worktrees/asset-artist'
$taskOwn=Join-Path $taskRepoRoot 'experiments/p5-regenerated-objects/asset-artist'
$taskSelected=Join-Path $taskRuntime 'selected/mini-set-01'
if(Test-Path -LiteralPath $taskSelected) {throw 'Refusing overwrite of pinned selected set'}
New-Item -ItemType Directory -Path $taskSelected | Out-Null
$taskMeasures=Get-Content -LiteralPath (Join-Path $taskRuntime 'manifests/image-measurements.json') -Raw | ConvertFrom-Json
$taskContours=Get-Content -LiteralPath (Join-Path $taskRuntime 'manifests/contact-contour-measurements.json') -Raw | ConvertFrom-Json
$taskTargets=Get-Content -LiteralPath (Join-Path $taskRuntime 'refs/targets.json') -Raw | ConvertFrom-Json
$taskCopyRecords=Get-Content -LiteralPath (Join-Path $taskRuntime 'manifests/copy-records.jsonl') | ForEach-Object {$_ | ConvertFrom-Json}
$taskSpecs=@(
 @{name='floor-v1';family='floor';prompt='001-floor-v1.txt';anchor=@(0,0);width=1254;depth=1254},
 @{name='flower-v1';family='flower';prompt='002-flower-v1.txt'},
 @{name='leaf-v1';family='leaf';prompt='003-leaf-v1.txt'},
 @{name='frog-v1';family='frog';prompt='004-frog-v1.txt'},
 @{name='wood-v1';family='wood';prompt='005-wood-v1.txt'},
 @{name='ball-v1';family='ball';prompt='006-ball-v1.txt';anchor=@(628,1089);width=959;depth=447.1},
 @{name='obstacle-shadow-v1';family='obstacle-shadow';prompt='007-obstacle-shadow-v1.txt';anchor=@(760,675);width=600;depth=285},
 @{name='ball-shadow-v1';family='ball-shadow';prompt='008-ball-shadow-v1.txt';anchor=@(680,795);width=700;depth=326.3},
 @{name='receiver-v1';family='receiver';prompt='009-receiver-v1.txt';anchor=@(628,477);width=290;depth=174.4},
 @{name='receiver-front-v1';family='receiver';prompt='010-receiver-front-v1.txt';anchor=@(628,477);width=290;depth=174.4}
)
$taskTextures=@(foreach($taskSpec in $taskSpecs) {
 $taskMeasure=$taskMeasures | Where-Object {[IO.Path]::GetFileNameWithoutExtension($_.file) -eq $taskSpec.name}
 if(-not $taskMeasure) {throw ('Missing measurement '+$taskSpec.name)}
 $taskContour=$taskContours | Where-Object {$_.name -eq $taskSpec.name}
 if($taskContour) {$taskSpec.anchor=@($taskContour.contactEllipseFit.cx,$taskContour.contactEllipseFit.cy);$taskSpec.width=$taskContour.contactEllipseFit.width;$taskSpec.depth=$taskContour.contactEllipseFit.depth}
 $taskRaw=Join-Path $taskRuntime ('raw/'+$taskSpec.name+'.png')
 $taskFinal=Join-Path $taskSelected ($taskSpec.name+'.png')
 Copy-Item -LiteralPath $taskRaw -Destination $taskFinal
 $taskRawItem=Get-Item -LiteralPath $taskRaw; $taskFinalItem=Get-Item -LiteralPath $taskFinal
 $taskFinalItem.CreationTimeUtc=$taskRawItem.CreationTimeUtc; $taskFinalItem.LastWriteTimeUtc=$taskRawItem.LastWriteTimeUtc; $taskFinalItem.Attributes=$taskRawItem.Attributes
 $taskFinalHash=(Get-FileHash -LiteralPath $taskFinal -Algorithm SHA256).Hash.ToLowerInvariant()
 if($taskFinalHash -ne $taskMeasure.sha256 -or $taskFinalItem.Length -ne $taskMeasure.bytes) {throw 'Selected bytes changed'}
 $taskCopy=$taskCopyRecords | Where-Object {$_.sha256 -eq $taskMeasure.sha256} | Select-Object -First 1
 $taskToolId=[IO.Path]::GetFileNameWithoutExtension($taskCopy.source)
 [ordered]@{
  id=$taskSpec.name;family=$taskSpec.family;file=$taskFinal.Replace('\','/');sha256=$taskFinalHash;bytes=$taskMeasure.bytes;sizePx=@($taskMeasure.image.width,$taskMeasure.image.height)
  alpha=@{policy=$(if($taskSpec.family -eq 'floor'){'opaque'}else{'straight-rgba'});bounds=$taskMeasure.image.bounds;visibleBounds=$taskMeasure.image.visibleBounds;maxAlpha=$taskMeasure.image.maxAlpha;note='Exact alpha>0/alpha>=16 bounds; native outputs contain very faint alpha outside visible silhouette. No trim/threshold/color correction applied.'}
  groundAnchorPx=$taskSpec.anchor;footprintPx=@{center=$taskSpec.anchor;width=$taskSpec.width;depth=$taskSpec.depth}
  provenance=@{method='generated';promptPath=('prompts/'+$taskSpec.prompt);promptSha256=(Get-FileHash -LiteralPath (Join-Path $taskOwn ('prompts/'+$taskSpec.prompt)) -Algorithm SHA256).Hash.ToLowerInvariant();toolOutputId=$taskToolId;rawSha256=$taskMeasure.sha256;rawFile=$taskRaw.Replace('\','/');nativeOutputPath=$taskCopy.source;corrections=@();selection='First generated candidate, preserved unchanged; partial integration candidate, no artistic PASS';references=@($(if($taskSpec.name -eq 'receiver-front-v1'){'E:/R4D/perspective/p5-runtime/asset-artist/raw/receiver-v1.png'}elseif($taskSpec.family -match 'shadow'){@()}else{'K:/Agents/R4D/Assets/perspective/01-jungle.jpg'}))}
 }
})
$taskInstances=[System.Collections.Generic.List[object]]::new()
function Add-P5Instance([string]$Id,[string]$Texture,[string]$Target,[string]$Parent,[string]$Role,[double]$Depth,[string]$Reason){
 $taskInstances.Add([ordered]@{id=$Id;textureId=$Texture;targetId=$Target;parentId=$Parent;role=$Role;depthOffsetRadii=$Depth;depthReason=$Reason})
}
Add-P5Instance 'floor' 'floor-v1' '$source' 'board' 'floor' 0 'Full-frame newly generated floor/environment; uniform1254->1536, no crop'
$taskBindings=@(@{target='flower-07';texture='flower-v1'},@{target='leaf-05';texture='leaf-v1'},@{target='frog-05';texture='frog-v1'},@{target='wood-04';texture='wood-v1'})
foreach($taskBinding in $taskBindings){
 Add-P5Instance ($taskBinding.target+'-shadow') 'obstacle-shadow-v1' $taskBinding.target $taskBinding.target 'shadow' 0 'Ground-plane cast shadow; shared target center, actual offset is authored in shadow pixels'
 Add-P5Instance ($taskBinding.target+'-body') $taskBinding.texture $taskBinding.target $taskBinding.target 'body' 0 'Single whole body at contact ellipse center; partial occlusion not yet verified in actual native motion'
}
Add-P5Instance 'ball-shadow' 'ball-shadow-v1' '$ball' 'ball' 'shadow' 0 'Follows live r16 ground anchor; authored lower-left cast offset, no state shift'
Add-P5Instance 'ball' 'ball-v1' '$ball' 'ball' 'ball' 0 'Uniform circular sphere; contact under center, projected width from live r16'
Add-P5Instance 'receiver-01-back' 'receiver-v1' 'receiver-01' 'receiver-01' 'receiver-back' -1 'Whole receiver below ball layer; far rim at rear edge of trigger footprint. Capture circle is a subregion of aperture.'
Add-P5Instance 'receiver-01-front' 'receiver-front-v1' 'receiver-01' 'receiver-01' 'receiver-front' 1 'Near lip/body at front edge of trigger footprint; separate generated alpha edit, retained canvas registration'
$taskManifest=[ordered]@{
 schema='r4d.p5.assets/1';status='partial';sourceSha256='c8f9e4245c1de8c2086e615bc75dc10aea59b76b614d6e106593e07262e24f72';p1Commit='4b47db04c7140ebf88f69b91faa0b790d46f22ec'
 lighting=@{description='Warm upper-left sunlight; neutral olive-brown separate contact/cast shadows qualitatively toward lower-left. Numerical angle not inferred from original JPG.';shadowDirectionSourcePx=@(-1,1);obstacleShadowAnchorPx=@(760,675);obstacleShadowVisibleBoundsCenterPx=@(633.5,727.5);ballShadowAnchorPx=@(680,795);ballShadowVisibleBoundsCenterPx=@(603.5,833.5)}
 textures=$taskTextures;instances=@($taskInstances)
 limits=@('Only four obstacle targets and receiver-01 included; remaining21pins/3receivers intentionally absent from this early set','Measured generated base depths are closer to near field than requested far view; residual source footprint depth error is recorded, no XY warp or collider change','Native-generated faint alpha residue extends beyond visible silhouette; pending actual-scale inspection','Receiver front is native imagegen edit, not pixel-identical alpha masking; registration must be checked in assembly','No independently prepared side-rail/front-platform occluder yet','No Pixi/native/browser inspection or independent QA verdict for these bytes yet')
}
$taskManifestPath=Join-Path $taskOwn 'asset-manifest.mini-01.json'
$taskJson=($taskManifest | ConvertTo-Json -Depth 18) -replace "`r`n","`n"
if(-not (Test-Json -Json $taskJson -SchemaFile (Join-Path $taskRuntime 'refs/asset-manifest.schema.json'))) {throw 'Consumer schema invalid'}
[IO.File]::WriteAllText($taskManifestPath,$taskJson+"`n",[Text.UTF8Encoding]::new($false))
$taskFit=@(foreach($taskBinding in $taskBindings){
 $taskTexture=$taskTextures | Where-Object {$_.id -eq $taskBinding.texture};$taskTarget=$taskTargets.objects | Where-Object {$_.id -eq $taskBinding.target};$taskScale=$taskTarget.sourcePx.footprintWidth/$taskTexture.footprintPx.width
 [ordered]@{targetId=$taskBinding.target;textureId=$taskBinding.texture;native=$taskTarget.native;sourceAnchor=$taskTarget.sourcePx.anchor;targetFootprintSourcePx=@($taskTarget.sourcePx.footprintWidth,$taskTarget.sourcePx.footprintDepth);textureFootprintPx=$taskTexture.footprintPx;uniformScale=$taskScale;renderedFootprintDepthSourcePx=$taskTexture.footprintPx.depth*$taskScale;depthResidualSourcePx=$taskTexture.footprintPx.depth*$taskScale-$taskTarget.sourcePx.footprintDepth;geometryModified=$false}
})
[IO.File]::WriteAllText((Join-Path $taskOwn 'BINDINGS.mini-01.json'),((($taskFit | ConvertTo-Json -Depth 10) -replace "`r`n","`n")+"`n"),[Text.UTF8Encoding]::new($false))
$taskManifestItem=Get-Item -LiteralPath $taskManifestPath
[ordered]@{manifest=$taskManifestPath;sha256=(Get-FileHash -LiteralPath $taskManifestPath -Algorithm SHA256).Hash.ToLowerInvariant();bytes=$taskManifestItem.Length;textures=$taskTextures.Count;instances=$taskInstances.Count;selectedDirectory=$taskSelected;schemaValidated=$true;bindings=$taskFit} | ConvertTo-Json -Depth 10
