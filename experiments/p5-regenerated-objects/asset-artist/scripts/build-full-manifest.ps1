$ErrorActionPreference='Stop'
$taskRuntime='E:/R4D/perspective/p5-runtime/asset-artist'
$taskOwn='E:/R4D/perspective/p5-worktrees/asset-artist/experiments/p5-regenerated-objects/asset-artist'
$taskSelected=Join-Path $taskRuntime 'selected/mini-set-02'
$taskMini=Get-Content -LiteralPath (Join-Path $taskOwn 'asset-manifest.mini-01.json') -Raw|ConvertFrom-Json -AsHashtable
$taskTargets=Get-Content -LiteralPath (Join-Path $taskRuntime 'refs/targets.json') -Raw|ConvertFrom-Json -AsHashtable
$taskMeasures=Get-Content -LiteralPath (Join-Path $taskRuntime 'manifests/image-measurements.json') -Raw|ConvertFrom-Json -AsHashtable
$taskContours=@(Get-Content -LiteralPath (Join-Path $taskOwn 'records/contact-contour-measurements.json') -Raw|ConvertFrom-Json -AsHashtable)+@(Get-Content -LiteralPath (Join-Path $taskRuntime 'manifests/contact-contours.mini-02.json') -Raw|ConvertFrom-Json -AsHashtable)
$taskCopies=Get-Content -LiteralPath (Join-Path $taskRuntime 'manifests/copy-records.jsonl')|ForEach-Object{$_|ConvertFrom-Json -AsHashtable}
$taskInvocations=Get-Content -LiteralPath (Join-Path $taskOwn 'records/tool-invocations.mini02.json') -Raw|ConvertFrom-Json -AsHashtable
$taskRegions=Get-Content -LiteralPath (Join-Path $taskOwn 'FOREGROUND_AUTHORING.mini-02.json') -Raw|ConvertFrom-Json -AsHashtable
function Write-P5Json([string]$Name,$Value){$taskText=($Value|ConvertTo-Json -Depth 24)-replace "`r`n","`n";[IO.File]::WriteAllText((Join-Path $taskOwn $Name),$taskText+"`n",[Text.UTF8Encoding]::new($false))}
function Copy-P5Object($Value){return ($Value|ConvertTo-Json -Depth 24|ConvertFrom-Json -AsHashtable)}
$taskFiles=[System.Collections.Generic.HashSet[string]]::new()
function New-P5Texture([string]$Name,[string]$Family){
 $taskOld=@($taskMini.textures|Where-Object{$_.id -eq $Name})
 if($taskOld.Count -gt 0){$taskTexture=Copy-P5Object $taskOld[0]}else{
  $taskMeasure=$taskMeasures|Where-Object{[IO.Path]::GetFileNameWithoutExtension($_.file) -eq $Name}
  $taskFit=$taskContours|Where-Object{$_.name -eq $Name}|Select-Object -Last 1
  $taskInvocation=$taskInvocations|Where-Object{$_.id -eq $Name}
  $taskCopy=$taskCopies|Where-Object{$_.sha256 -eq $taskMeasure.sha256}|Select-Object -First 1
  if(-not $taskFit -or -not $taskMeasure -or -not $taskInvocation -or -not $taskCopy){throw ('Missing measured/provenance input '+$Name)}
  $taskAnchor=@($taskFit.contactEllipseFit.cx,$taskFit.contactEllipseFit.cy)
  $taskTexture=[ordered]@{id=$Name;family=$Family;file='';sha256=$taskMeasure.sha256;bytes=$taskMeasure.bytes;sizePx=@($taskMeasure.image.width,$taskMeasure.image.height);alpha=@{policy='straight-rgba';bounds=$taskMeasure.image.bounds;visibleBounds=$taskMeasure.image.visibleBounds;maxAlpha=$taskMeasure.image.maxAlpha;note='Native alpha unchanged; faint alpha outside visible silhouette preserved, no trim/threshold'};groundAnchorPx=$taskAnchor;footprintPx=@{center=$taskAnchor;width=$taskFit.contactEllipseFit.width;depth=$taskFit.contactEllipseFit.depth};provenance=@{method='generated';promptPath=$taskInvocation.promptFile;promptSha256=(Get-FileHash -LiteralPath (Join-Path $taskOwn $taskInvocation.promptFile) -Algorithm SHA256).Hash.ToLowerInvariant();toolOutputId=[IO.Path]::GetFileNameWithoutExtension($taskCopy.source);rawSha256=$taskMeasure.sha256;rawFile=$taskMeasure.file;nativeOutputPath=$taskCopy.source;references=$taskInvocation.arguments.referenced_image_paths;corrections=@(@{operation='new native-imagegen camera/control variant';note='Actual output selected by measured support contour; guide/reference pixels never final material'});selection='Coherent family candidate with nearest measured support depth/width; actual assembled quality unverified'}}
 }
 $taskTexture.file=(Join-Path $taskSelected ($Name+'.png')).Replace('\','/')
 $null=$taskFiles.Add($Name)
 return $taskTexture
}
$taskTextures=[System.Collections.Generic.List[object]]::new()
$taskTextureMap=@{}
function Add-P5Texture($Texture){if(-not $taskTextureMap.ContainsKey($Texture.id)){$taskTextureMap[$Texture.id]=$Texture;$taskTextures.Add($Texture)}}
foreach($taskName in 'floor-v1','ball-v1','ball-shadow-v1','obstacle-shadow-v1'){Add-P5Texture (New-P5Texture $taskName (($taskMini.textures|Where-Object{$_.id -eq $taskName})[0].family))}
$taskFamilyNames=@{flower=@('flower-far-v1','flower-mid-v4','flower-mid-v5','flower-v1');leaf=@('leaf-far-v1','leaf-mid-v4','leaf-v1');frog=@('frog-far-v1','frog-v1');wood=@('wood-far-v1','wood-v1','wood-near-v1')}
$taskPool=@{}
foreach($taskFamily in $taskFamilyNames.Keys){$taskPool[$taskFamily]=@($taskFamilyNames[$taskFamily]|ForEach-Object{New-P5Texture $_ $taskFamily})}
$taskInstances=[System.Collections.Generic.List[object]]::new()
function Add-P5Instance([string]$Id,[string]$Texture,[string]$Target,[string]$Parent,[string]$Role,[double]$Depth,[string]$Reason){$taskInstances.Add([ordered]@{id=$Id;textureId=$Texture;targetId=$Target;parentId=$Parent;role=$Role;depthOffsetRadii=$Depth;depthReason=$Reason})}
Add-P5Instance 'floor' 'floor-v1' '$source' 'board' 'floor' 0 'Same freshly generated full-frame floor as mini01; uniform1254->1536, no crop/warp'
$taskBindings=[System.Collections.Generic.List[object]]::new()
foreach($taskTarget in $taskTargets.objects|Where-Object{$_.kind -eq 'pin'}){
 $taskRatio=$taskTarget.sourcePx.footprintDepth/$taskTarget.sourcePx.footprintWidth
 $taskTexture=$taskPool[$taskTarget.family]|Sort-Object @{Expression={[math]::Abs($_.footprintPx.depth/$_.footprintPx.width-$taskRatio)}}|Select-Object -First 1
 Add-P5Texture $taskTexture
 $taskScale=$taskTarget.sourcePx.footprintWidth/$taskTexture.footprintPx.width
 $taskDelta=$taskTexture.footprintPx.depth*$taskScale-$taskTarget.sourcePx.footprintDepth
 Add-P5Instance ($taskTarget.id+'-shadow') 'obstacle-shadow-v1' $taskTarget.id $taskTarget.id 'shadow' 0 'Separate generated cast/contact shadow on ground; same unchanged native target as body'
 Add-P5Instance ($taskTarget.id+'-body') $taskTexture.id $taskTarget.id $taskTarget.id 'body' 0 'Whole generated body, measured contact ellipse center; partial occlusion pending actual full-scene QA'
 $taskBindings.Add([ordered]@{targetId=$taskTarget.id;textureId=$taskTexture.id;family=$taskTarget.family;native=$taskTarget.native;sourceAnchor=$taskTarget.sourcePx.anchor;targetFootprintSourcePx=@($taskTarget.sourcePx.footprintWidth,$taskTarget.sourcePx.footprintDepth);authoredFootprintPx=$taskTexture.footprintPx;uniformScale=$taskScale;renderedFootprintDepthSourcePx=$taskTexture.footprintPx.depth*$taskScale;depthResidualSourcePx=$taskDelta;selection='Closest measured support depth/width among coherent family pool, independent of seed';geometryModified=$false})
}
Add-P5Instance 'ball-shadow' 'ball-shadow-v1' '$ball' 'ball' 'shadow' 0 'Unchanged generated sphere shadow, live native r16 ground point'
Add-P5Instance 'ball' 'ball-v1' '$ball' 'ball' 'ball' 0 'Unchanged bottom/contact anchor and uniform sphere scale from live projected r16 width'
$taskM=$taskTargets.projection.nativeToSource
function Get-P5Width([double]$X,[double]$Y,[double]$R){$taskMin=[double]::PositiveInfinity;$taskMax=[double]::NegativeInfinity;for($taskI=0;$taskI -lt 128;$taskI++){$taskAngle=$taskI*2*[math]::PI/128;$taskX=$X+[math]::Cos($taskAngle)*$R;$taskY=$Y+[math]::Sin($taskAngle)*$R;$taskW=$taskM[2][0]*$taskX+$taskM[2][1]*$taskY+$taskM[2][2];$taskProjectedX=($taskM[0][0]*$taskX+$taskM[0][1]*$taskY+$taskM[0][2])/$taskW;$taskMin=[math]::Min($taskMin,$taskProjectedX);$taskMax=[math]::Max($taskMax,$taskProjectedX)};return $taskMax-$taskMin}
$taskBall=$taskTextureMap['ball-v1'];$taskOptical=@(628,477)
$taskL=$taskBall.groundAnchorPx[1]-($taskBall.alpha.visibleBounds[1]+$taskBall.alpha.visibleBounds[3]/2)
$taskExpected=@{'receiver-01'=67.61658485838826;'receiver-02'=81.36410310994435;'receiver-03'=79.49910938997404;'receiver-04'=72.01147152317914}
$taskPolicyRows=[System.Collections.Generic.List[object]]::new()
foreach($taskTarget in $taskTargets.objects|Where-Object{$_.kind -eq 'bucket'}){
 $taskBucketWidth=Get-P5Width $taskTarget.native.anchor[0] $taskTarget.native.anchor[1] $taskTarget.native.radius
 $taskBallWidth=Get-P5Width $taskTarget.native.anchor[0] $taskTarget.native.anchor[1] 16
 $taskReceiverScale=$taskBucketWidth/290;$taskBallScale=$taskBallWidth/$taskBall.footprintPx.width
 $taskHR=$taskL*$taskBallScale/$taskReceiverScale
 $taskExpectedDelta=$taskHR-$taskExpected[$taskTarget.id]
 if([math]::Abs($taskExpectedDelta) -gt 1e-8){throw ('Independent policy mismatch '+$taskTarget.id+' '+$taskExpectedDelta)}
 $taskLogical=@($taskOptical[0],($taskOptical[1]+$taskHR))
 foreach($taskPart in 'back','front'){
  $taskRawName=if($taskPart -eq 'back'){'receiver-v1'}else{'receiver-front-v1'}
  $taskTexture=New-P5Texture $taskRawName 'receiver'
  $taskTexture.id=$taskTarget.id+'-'+$taskPart+'-logical-v1'
  $taskTexture.groundAnchorPx=$taskLogical;$taskTexture.footprintPx.center=$taskLogical
  $taskTexture.opticalOpeningPointPx=$taskOptical
  $taskTexture.alias=@{sourceTextureId=$taskRawName;newGeneration=$false;rawPixelsChanged=$false;policyId='receiver-sphere-height-v1';targetId=$taskTarget.id;logicalClearancePx=$taskHR}
  $taskTexture.provenance.corrections=@($taskTexture.provenance.corrections)+@(@{operation='Lead-approved common optical/logical anchor contract';logicalAnchorPx=$taskLogical;opticalPointPx=$taskOptical;hR=$taskHR;pixelBytesChanged=$false;seedDependent=$false})
  Add-P5Texture $taskTexture
  $taskDepth=if($taskPart -eq 'back'){-1}else{1}
  Add-P5Instance ($taskTarget.id+'-'+$taskPart) $taskTexture.id $taskTarget.id $taskTarget.id ('receiver-'+$taskPart) $taskDepth 'Same generated receiver parts, shared logical anchor from common r16 sphere-height policy; optical point separate, no native/source target shift'
 }
 $taskRow=[ordered]@{targetId=$taskTarget.id;native=$taskTarget.native;logicalTargetSource=$taskTarget.sourcePx.anchor;opticalReferenceTexturePx=$taskOptical;previousLogicalAnchorTexturePx=$taskOptical;newLogicalAnchorTexturePx=$taskLogical;footprintCenterEqualsLogicalAnchor=$true;nativeBallRadius=16;circleSamples=128;ballVisibleBoundsCenterProxyY=($taskBall.alpha.visibleBounds[1]+$taskBall.alpha.visibleBounds[3]/2);ballGroundAnchorY=$taskBall.groundAnchorPx[1];L=$taskL;ballFootprintWidth=$taskBall.footprintPx.width;receiverFootprintWidth=290;projectedBucketWidthSourcePx=$taskBucketWidth;projectedBallWidthSourcePx=$taskBallWidth;receiverUniformScale=$taskReceiverScale;ballUniformScale=$taskBallScale;hRTexturePx=$taskHR;visualCupShiftSourceY=-$taskHR*$taskReceiverScale;opticalReferenceSourceAfterCorrection=@($taskTarget.sourcePx.anchor[0],($taskTarget.sourcePx.anchor[1]-$taskHR*$taskReceiverScale));builderExpectedHR=$taskExpected[$taskTarget.id];independentCalculationDelta=$taskExpectedDelta;seedDependent=$false;geometryModified=$false}
 $taskPolicyRows.Add($taskRow);$taskBindings.Add($taskRow)
}
$taskClipBindings=[System.Collections.Generic.List[object]]::new()
foreach($taskRegion in $taskRegions){
 $taskSourcePolygon=@($taskRegion.authoringTexturePolygonPx|ForEach-Object{,@(($_[0]*1536/1254),($_[1]*1536/1254))})
 $taskXs=@($taskSourcePolygon|ForEach-Object{$_[0]});$taskYs=@($taskSourcePolygon|ForEach-Object{$_[1]})
 $taskMinX=($taskXs|Measure-Object -Minimum).Minimum;$taskMaxX=($taskXs|Measure-Object -Maximum).Maximum;$taskMinY=($taskYs|Measure-Object -Minimum).Minimum;$taskMaxY=($taskYs|Measure-Object -Maximum).Maximum
 $taskArea=0.0;for($taskI=0;$taskI -lt $taskSourcePolygon.Count;$taskI++){$taskJ=($taskI+1)%$taskSourcePolygon.Count;$taskArea+=$taskSourcePolygon[$taskI][0]*$taskSourcePolygon[$taskJ][1]-$taskSourcePolygon[$taskJ][0]*$taskSourcePolygon[$taskI][1]};$taskArea=[math]::Abs($taskArea/2)
 if($taskMinX -lt 0 -or $taskMinY -lt 0 -or $taskMaxX -gt 1536 -or $taskMaxY -ge 1202 -or $taskArea -le 1){throw 'Invalid foreground region or overlaps measured receiver aperture band'}
 $taskInstance=[ordered]@{id=$taskRegion.id;textureId='floor-v1';targetId='$source';parentId='floor';role='foreground';depthOffsetRadii=0;depthReason=$taskRegion.reason;sourceClipPx=@{coordinateSpace='source1536';polygon=$taskSourcePolygon;provenance=@{method='scene-region-from-generated-floor';sourceTextureId='floor-v1';sourceSha256=$taskTextureMap['floor-v1'].sha256;note=$taskRegion.reason;authoringTexturePolygonPx=$taskRegion.authoringTexturePolygonPx;sourceScale=1536/1254;newImageGeneration=$false};limitations=$taskRegion.limitations;expectedVisibleBoundsSourcePx=@($taskMinX,$taskMinY,($taskMaxX-$taskMinX),($taskMaxY-$taskMinY))}}
 $taskInstances.Add($taskInstance)
 $taskClipBindings.Add(@{id=$taskRegion.id;expectedBoundsSourcePx=$taskInstance.sourceClipPx.expectedVisibleBoundsSourcePx;polygonAreaSourcePx2=$taskArea;sourceClipPx=$taskInstance.sourceClipPx})
}
$taskPolicy=[ordered]@{id='receiver-sphere-height-v1';approval='Explicit Lead decision29Oct2026, option1; applies to next candidate only';contractCommit='2c8551e45876396e4b8f5df7f6d6c93713f89e2c';formula='W(p,r)=128sample exact P1 projected circle width; sR=Wbucket/290; sB=Wball(r16)/959; L=1089-(150+941/2)=468.5; hR=L*sB/sR; A=[628,477+hR]';opticalReferenceTexturePx=$taskOptical;ballRawSha256=$taskBall.sha256;ballMetadataProxyLimit='visible-bounds center620.5 is a proxy, not a fitted exact sphere center; original visible bounds alpha>=16; artist contour uncertainty does not alter frozen reference O';oldReceiverMeasurement='records/receiver01-aperture-contour.json';builderExpectedArtifact=@{file='E:/R4D/perspective/p5-runtime/builder/output/receiver-policy-001/expected-rule.json';sha256='c10764513f0e83d008db2530acaa89f489eefd6dfe83c9d5ca132d6cee9f898f';bytes=4036};effect='All visual cups move upward relative to unchanged logical/native/source targets. PNG/sphere metadata/physics unchanged; not a one-pixel measurement correction or sink';futureBallChange='Recompute all aliases if sphere PNG/visible bounds/ground anchor/footprint/radius or projection changes';rows=@($taskPolicyRows);actualQA='Not performed on these next-candidate aliases yet'}
$taskManifest=[ordered]@{schema='r4d.p5.assets/1';status='candidate';sourceSha256=$taskMini.sourceSha256;p1Commit=$taskMini.p1Commit;consumerSchemaCommit='8bf447629ec78a1ccb088b4ba7a784746e0aca83';receiverPolicyCommit=$taskPolicy.contractCommit;lighting=$taskMini.lighting;textures=@($taskTextures);instances=@($taskInstances);coverage=@{pins=25;receivers=4;foregroundParts=3;note='Target coverage only; art/occlusion/receiver success unverified until actual next scene QA'};receiverAnchorPolicy=$taskPolicy.id;limitations=@('Mini01/c01 remain immutable; this candidate has not been viewed in Pixi/native','Residual depth differences remain measured, not erased with XY warp or collider changes','Generated shadow alpha and color unchanged from mini01; new far/full arrangements require visual review','Three declared near architecture regions are coarse artist contours and can cut moss/feathers at edges; exact pixel registration inherited from generated floor','Full long side rails remain unpartitioned; no claim all side-wall occlusion is correct','Receiver visual placement changes by common sphere-height policy; floor/ropes/parts and terminal entry must be checked on all four targets','Aliases are not new imagegen outputs; same generated back/front PNG bytes')}
$taskManifestJson=($taskManifest|ConvertTo-Json -Depth 24)-replace "`r`n","`n"
if(-not(Test-Json -Json $taskManifestJson -SchemaFile (Join-Path $taskRuntime 'refs/asset-manifest.schema.v2.json'))){throw 'Consumer schema validation failed'}
New-Item -ItemType Directory -Path $taskSelected -Force|Out-Null
$taskUsedNames=@($taskTextures|ForEach-Object{[IO.Path]::GetFileNameWithoutExtension($_.file)}|Sort-Object -Unique)
foreach($taskName in $taskUsedNames){$taskRaw=Join-Path $taskRuntime ('raw/'+$taskName+'.png');$taskFinal=Join-Path $taskSelected ($taskName+'.png');$taskInfo=$taskTextures|Where-Object{[IO.Path]::GetFileNameWithoutExtension($_.file) -eq $taskName}|Select-Object -First 1;if(-not(Test-Path -LiteralPath $taskFinal)){Copy-Item -LiteralPath $taskRaw -Destination $taskFinal;$taskRawItem=Get-Item -LiteralPath $taskRaw;$taskFinalItem=Get-Item -LiteralPath $taskFinal;$taskFinalItem.CreationTimeUtc=$taskRawItem.CreationTimeUtc;$taskFinalItem.LastWriteTimeUtc=$taskRawItem.LastWriteTimeUtc;$taskFinalItem.Attributes=$taskRawItem.Attributes};if((Get-FileHash -LiteralPath $taskFinal -Algorithm SHA256).Hash.ToLowerInvariant() -ne $taskInfo.sha256 -or (Get-Item -LiteralPath $taskFinal).Length -ne $taskInfo.bytes){throw ('Selected bytes mismatch '+$taskName)}}
Write-P5Json 'asset-manifest.mini-02.json' $taskManifest
Write-P5Json 'BINDINGS.mini-02.json' @($taskBindings)
Write-P5Json 'RECEIVER_ANCHOR_POLICY.mini-02.json' $taskPolicy
Write-P5Json 'FOREGROUND_REGIONS.mini-02.json' @($taskClipBindings)
$taskPinFits=@($taskBindings|Where-Object{$_.Contains('depthResidualSourcePx')})
$taskResult=[ordered]@{manifest='asset-manifest.mini-02.json';sha256=(Get-FileHash -LiteralPath (Join-Path $taskOwn 'asset-manifest.mini-02.json') -Algorithm SHA256).Hash.ToLowerInvariant();bytes=(Get-Item -LiteralPath (Join-Path $taskOwn 'asset-manifest.mini-02.json')).Length;textureIds=$taskTextures.Count;uniquePngFiles=$taskUsedNames.Count;instances=$taskInstances.Count;pins=$taskPinFits.Count;receivers=$taskPolicyRows.Count;maxAbsDepthResidualSourcePx=($taskPinFits|ForEach-Object{[math]::Abs($_.depthResidualSourcePx)}|Measure-Object -Maximum).Maximum;receiverPolicyRows=@($taskPolicyRows);selectedDirectory=$taskSelected;schemaValid=$true}
$taskResult|ConvertTo-Json -Depth 12
