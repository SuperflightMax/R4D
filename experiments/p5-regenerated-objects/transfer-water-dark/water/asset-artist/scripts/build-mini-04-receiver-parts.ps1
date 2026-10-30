$ErrorActionPreference='Stop'
$taskOwn='E:/R4D/perspective/p5-worktrees/asset-artist/experiments/p5-regenerated-objects/transfer-water-dark/water/asset-artist'
$taskRuntime='E:/R4D/perspective/p5-runtime/asset-artist/transfer-water-dark/water'
$env:TEMP=Join-Path $taskRuntime 'temp';$env:TMP=$env:TEMP
if(Test-Path (Join-Path $taskOwn 'asset-manifest.mini-04-receiver-parts.json')){throw 'Preserve existing successor; do not regenerate frozen JSON'}
function Write-P5Json([string]$Name,$Value){$taskJson=($Value|ConvertTo-Json -Depth 35)-replace "`r`n","`n";[IO.File]::WriteAllText((Join-Path $taskOwn $Name),$taskJson+"`n",[Text.UTF8Encoding]::new($false))}
function Clone-P5($Value){return $Value|ConvertTo-Json -Depth 35|ConvertFrom-Json -AsHashtable}
function Assert-P5Equal($A,$B,[string]$Why){if(($A|ConvertTo-Json -Depth 35 -Compress) -cne ($B|ConvertTo-Json -Depth 35 -Compress)){throw $Why}}
$taskBaseFile=Join-Path $taskOwn 'asset-manifest.mini-03.json'
if((Get-Item $taskBaseFile).Length -ne 44339 -or (Get-FileHash $taskBaseFile -Algorithm SHA256).Hash.ToLowerInvariant() -ne '50dceb14be6f71a429231a89c44c67d75198e1c9dd9d425c6e8c1747f251803f'){throw 'Original mini03 pin differs'}
$taskBaseline=Get-Content -LiteralPath $taskBaseFile -Raw|ConvertFrom-Json -AsHashtable
$taskM=Clone-P5 $taskBaseline
$taskMeasure=Get-Content (Join-Path $taskOwn 'records/image-measurements.mini-04.json') -Raw|ConvertFrom-Json -AsHashtable
$taskRecord=Get-Content (Join-Path $taskOwn 'records/receiver-back-rim-v1.json') -Raw|ConvertFrom-Json -AsHashtable
$taskReg=Get-Content (Join-Path $taskOwn 'records/receiver-rim-registration.mini-04.json') -Raw|ConvertFrom-Json -AsHashtable
if($taskMeasure.sha256 -ne '2f58c03e3ae6a7a4a4460f94976c3c5a4b93ca6045674df8140b9221741a3c0a' -or $taskMeasure.image.width -ne 1254 -or $taskMeasure.image.height -ne 1254){throw 'Rim frame/pin differs'}
$taskTextures=[Collections.Generic.List[object]]::new()
foreach($taskTx in $taskBaseline.textures){if($taskTx.id -notmatch '^receiver-\d\d-back-v1$'){$taskTextures.Add((Clone-P5 $taskTx))}}
$taskBases=[Collections.Generic.List[object]]::new();$taskPartRecords=[Collections.Generic.List[object]]::new()
$taskTargets=Get-Content (Join-Path $taskRuntime 'refs/targets.json') -Raw|ConvertFrom-Json -AsHashtable
foreach($taskN in 1..4){
 $taskId='receiver-'+$taskN.ToString('00');$taskOld=$taskBaseline.textures|Where-Object id -eq ($taskId+'-back-v1')
 $taskBase=Clone-P5 $taskOld;$taskBase.id=$taskId+'-base-v1';$taskBase.provenance.corrections=@($taskBase.provenance.corrections)+@('Post-w04: тот же full PNG как target-bound floor base/interior; это alias, не новая генерация')
 $taskTextures.Add($taskBase)
 $taskRim=Clone-P5 $taskOld;$taskRim.id=$taskId+'-rim-back-v1';$taskRim.file=$taskMeasure.file.Replace('\','/');$taskRim.sha256=$taskMeasure.sha256;$taskRim.bytes=$taskMeasure.bytes
 $taskRim.alpha=[ordered]@{policy='straight-rgba';bounds=$taskMeasure.image.bounds;visibleBounds=$taskMeasure.image.visibleBounds;maxAlpha=$taskMeasure.image.maxAlpha;note='Native alpha сохранена: O/оба TQA center alpha0; clear rectangle99629/99671 alpha0,42 samples alpha1. Порог/trim/matte не применялись.'}
 $taskRim.provenance=[ordered]@{method='generated';promptPath=$taskRecord.prompt;promptSha256=$taskRecord.promptSha256;toolOutputId=$taskRecord.toolOutputId;nativeOutputPath=$taskRecord.source;rawFile=$taskRecord.raw.Replace('\','/');rawSha256=$taskRecord.sha256;references=$taskRecord.references;aliasOf='receiver-back-rim-v1';aliasIsNewGeneration=$false;corrections=@('Native edit исходного Water full: удалены вода/interior и передний корпус; сохранён поднятый задний U-борт/боковины');selection='Отдельный post-w04 candidate; actual consumer/QA не проверены'}
 $taskRim.registration=[ordered]@{templateTextureSha256=$taskOld.sha256;sameCanvas=$true;opticalPointBasis='Optical O[627,500] и capture proxy230x120 перенесены по неизменному template frame; O находится в прозрачном interior';sampledOuterContourMaxDeltaTexturePx=1;registrationUncertaintyTexturePx=3;nativePixelsNotIdentical=$true;measurements='records/receiver-rim-registration.mini-04.json'}
 $taskTextures.Add($taskRim)
 $taskBack=$taskM.instances|Where-Object id -eq ($taskId+'-back');$taskBack.textureId=$taskRim.id;$taskBack.depthReason='Прежний receiver-back offset-1, только solid rim/side wall; interior находится в отдельном floor base. Без условий tick/seed.'
 $taskBases.Add([ordered]@{id=$taskId+'-base';textureId=$taskBase.id;targetId=$taskId;parentId=$taskId;role='floor';depthOffsetRadii=0.0;depthReason='Неизменный full PNG ниже shadows/ball, существующий floor rank. Scene floor id floor идёт до receiver-01-base..04-base и в массиве, и лексикографически.'})
 $taskFront=$taskBaseline.textures|Where-Object id -eq ($taskId+'-front-v1')
 foreach($taskPart in @($taskBase,$taskRim,$taskFront)){Assert-P5Equal $taskPart.groundAnchorPx $taskOld.groundAnchorPx 'Part anchor mismatch';Assert-P5Equal $taskPart.footprintPx $taskOld.footprintPx 'Part footprint mismatch';Assert-P5Equal $taskPart.opticalOpeningPointPx $taskOld.opticalOpeningPointPx 'Part optical O mismatch'}
 $taskTarget=$taskTargets.objects|Where-Object id -eq $taskId;$taskS=$taskTarget.sourcePx.footprintWidth/$taskOld.footprintPx.width
 $taskPartRecords.Add([ordered]@{targetId=$taskId;baseInstanceId=$taskId+'-base';backInstanceId=$taskId+'-back';frontInstanceId=$taskId+'-front';baseTextureId=$taskBase.id;backTextureId=$taskRim.id;frontTextureId=$taskFront.id;groundAnchorPx=$taskOld.groundAnchorPx;opticalOpeningPointPx=$taskOld.opticalOpeningPointPx;captureFootprintPx=$taskOld.footprintPx;uniformScale=$taskS;logicalRegistrationResidualSourcePx=0.0;sampledContourDeltaSourcePx=$taskS;registrationUncertaintySourcePx=3*$taskS;actualQa=$false})
}
$taskM.textures=@($taskTextures)
$taskM.instances=@($taskBaseline.instances|Where-Object id -eq 'floor')+@($taskBases)+@($taskM.instances|Where-Object id -ne 'floor')
$taskM.limitations=@('Отдельный post-w04 receiver-parts successor, не исправленный задним числом w04. Pixel/partial rim occlusion, все entry и full535-point region ожидают actual QA.','Native прозрачный interior имеет42 единичных alpha1 samples в99671-точечном прямоугольнике; максимальная alpha1, center/O alpha0. Native bytes не threshold-ились.')+@($taskM.limitations)
$taskM.receiverParts=[ordered]@{variant='post-w04-receiver-base-rim-front-v1';baselineArtistCommit='541085603e01e23b076fe33ff3c9991822c0bce2';baselineManifest='asset-manifest.mini-03.json';baselineManifestSha256='50dceb14be6f71a429231a89c44c67d75198e1c9dd9d425c6e8c1747f251803f';builderPlanCommit='aa64d27ab5dc6b88982fd5aa2f564d461a935dee';preparation='Неизменный full как base + native rim-only back + прежний front';floorOrder=@('floor','receiver-01-base','receiver-02-base','receiver-03-base','receiver-04-base');newRole=$false;newSchema=$false;newRank=$false;rendererPrerequisite='Согласованное Builder расширение существующего floor rank на target-bound floor; exact code pin передаёт Builder';newUniquePng=1;uniquePng=10;textureIds=19;instances=34;parts=@($taskPartRecords);nativeChanged=$false;policyChanged=$false;actualQa=$false}
Assert-P5Equal $taskM.receiverPolicy $taskBaseline.receiverPolicy 'Optical policy changed'
foreach($taskOldInstance in $taskBaseline.instances){$taskNewInstance=$taskM.instances|Where-Object id -eq $taskOldInstance.id;if($taskOldInstance.role -ne 'receiver-back'){Assert-P5Equal $taskNewInstance $taskOldInstance 'Unrelated instance changed'}else{foreach($taskKey in @('id','targetId','parentId','role','depthOffsetRadii')){Assert-P5Equal $taskNewInstance[$taskKey] $taskOldInstance[$taskKey] 'Back registration/depth changed'}}}
if(@($taskM.textures.file|Sort-Object -Unique).Count -ne 10 -or $taskM.textures.Count -ne 19 -or $taskM.instances.Count -ne 34){throw 'Alias/unique count mismatch'}
if(@($taskM.instances.id|Sort-Object -Unique).Count -ne $taskM.instances.Count -or @($taskM.textures.id|Sort-Object -Unique).Count -ne $taskM.textures.Count){throw 'Duplicate ID'}
if(-not(Test-Json -Json ($taskM|ConvertTo-Json -Depth 35) -SchemaFile (Join-Path $taskRuntime 'refs/asset-manifest.schema.json'))){throw 'Schema failed'}
foreach($taskTx in $taskM.textures){if((Get-FileHash -LiteralPath $taskTx.file -Algorithm SHA256).Hash.ToLowerInvariant() -ne $taskTx.sha256 -or (Get-Item -LiteralPath $taskTx.file).Length -ne $taskTx.bytes){throw 'PNG pin differs'}}
Write-P5Json 'asset-manifest.mini-04-receiver-parts.json' $taskM
Write-P5Json 'RECEIVER_PARTS.mini-04.json' $taskM.receiverParts
Write-P5Json 'SELECTED.mini-04.json' ([ordered]@{uniquePng=10;textureIds=19;instances=34;png=@($taskM.textures|Group-Object sha256|ForEach-Object{[ordered]@{file=$_.Group[0].file;sha256=$_.Name;bytes=$_.Group[0].bytes;textureIds=@($_.Group.id)}})})
@('asset-manifest.mini-04-receiver-parts.json','RECEIVER_PARTS.mini-04.json','SELECTED.mini-04.json')|ForEach-Object{$taskP=Join-Path $taskOwn $_;[ordered]@{path=$_;bytes=(Get-Item $taskP).Length;sha256=(Get-FileHash $taskP -Algorithm SHA256).Hash.ToLowerInvariant()}}|ConvertTo-Json
