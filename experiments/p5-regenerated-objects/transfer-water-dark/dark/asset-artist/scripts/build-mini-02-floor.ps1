$ErrorActionPreference='Stop'
$taskOwn='E:/R4D/perspective/p5-worktrees/asset-artist/experiments/p5-regenerated-objects/transfer-water-dark/dark/asset-artist'
$taskRuntime='E:/R4D/perspective/p5-runtime/asset-artist/transfer-water-dark/dark'
$env:TEMP=Join-Path $taskRuntime 'temp';$env:TMP=$env:TEMP
if(Test-Path (Join-Path $taskOwn 'asset-manifest.mini-02-floor.json')){throw 'Preserve existing successor; do not regenerate frozen JSON'}
function Write-P5Json([string]$Name,$Value){$taskJson=($Value|ConvertTo-Json -Depth 35)-replace "`r`n","`n";[IO.File]::WriteAllText((Join-Path $taskOwn $Name),$taskJson+"`n",[Text.UTF8Encoding]::new($false))}
function Clone-P5($Value){return $Value|ConvertTo-Json -Depth 35|ConvertFrom-Json -AsHashtable}
$taskBaseFile=Join-Path $taskOwn 'asset-manifest.mini-01.json'
if((Get-Item $taskBaseFile).Length -ne 47851 -or (Get-FileHash $taskBaseFile -Algorithm SHA256).Hash.ToLowerInvariant() -ne 'c14b212e846f00dd3adf546feba5692bf9bd268002405b711f9157648a1661d7'){throw 'Original Dark mini01 pin differs'}
$taskBaseline=Get-Content $taskBaseFile -Raw|ConvertFrom-Json -AsHashtable;$taskM=Clone-P5 $taskBaseline
$taskRec=Get-Content (Join-Path $taskOwn 'records/floor-v3.json') -Raw|ConvertFrom-Json -AsHashtable
$taskMeasure=Get-Content (Join-Path $taskOwn 'records/image-measurements.mini-02.json') -Raw|ConvertFrom-Json -AsHashtable
if($taskMeasure.sha256 -ne 'f9474768fe208f8dc4f26fd97714b862ab37f23f23125a2d17778f920233c472' -or $taskMeasure.image.width -ne 1254 -or $taskMeasure.image.height -ne 1254){throw 'Floor pin/frame differs'}
$taskFloor=$taskM.textures|Where-Object id -eq 'floor-v2'
$taskFloor.id='floor-v3';$taskFloor.file=$taskMeasure.file.Replace('\','/');$taskFloor.sha256=$taskMeasure.sha256;$taskFloor.bytes=$taskMeasure.bytes
$taskFloor.provenance=[ordered]@{method='generated';promptPath=$taskRec.prompt;promptSha256=$taskRec.promptSha256;toolOutputId=$taskRec.toolOutputId;nativeOutputPath=$taskRec.source;rawFile=$taskRec.raw.Replace('\','/');rawSha256=$taskRec.sha256;references=$taskRec.references;corrections=@('Native floor-only edit: ближняя кромка возвращена к принятой P1 sourceY1121, ниже вертикальная стенка; без новых receiver panels');selection='Отдельный floor-only successor d01; actual registration/occlusion QA ожидаются'}
$taskFloorInst=$taskM.instances|Where-Object id -eq 'floor';$taskFloorInst.textureId='floor-v3';$taskFloorInst.depthReason='Uniform1254->1536 floor-only native correction nearY1121; actor registration/depth/native unchanged'
$taskM.limitations=@('Отдельный floor-only successor после сохранённого d01; это не receiver correction и не actual QA PASS.','Ближняя верхняя кромка floorv3 вручную оценена около textureY915±3 => sourceY1120.766±3.675; thin cap имеет толщину/скос, не точная восстановленная 3D плоскость.','Верхний кадр визуально сохранён native edit, pixel identity с floorv2 не заявлена.')+@($taskM.limitations|Where-Object{$_ -notmatch '^Floorv2 removes'})
$taskM.floorCorrection=[ordered]@{variant='post-d01-floor-near-boundary-v3';baselineArtistCommit='0f70d00db096ee30f057dd65ca36a53df3f78899';baselineConsumerCommit='aae514ed31720ab6d913f4bc6d63286c26992e0a';baselineManifestSha256='c14b212e846f00dd3adf546feba5692bf9bd268002405b711f9157648a1661d7';acceptedNearFloorSourceY=1121;candidateNearFloorTextureY=915;manualUncertaintyTexturePx=3;uniformScale=1536.0/1254;candidateNearFloorSourceY=915.0*1536/1254;nominalYResidualSourcePx=915.0*1536/1254-1121;uncertaintySourcePx=3.0*1536/1254;actorInstancesChanged=0;actorTexturesChanged=0;receiverPolicyChanged=$false;newGenerationCount=1;geometryChanged=$false;nativeChanged=$false;actualQa=$false}
$taskA=Clone-P5 $taskBaseline;$taskB=Clone-P5 $taskM
foreach($taskX in @($taskA,$taskB)){$taskX.Remove('limitations');$taskX.Remove('floorCorrection');$taskX.textures=@($taskX.textures|Where-Object family -ne 'floor');$taskX.instances=@($taskX.instances|Where-Object id -ne 'floor')}
if(($taskA|ConvertTo-Json -Depth 35 -Compress) -cne ($taskB|ConvertTo-Json -Depth 35 -Compress)){throw 'Floor-only semantic comparison failed'}
if(-not(Test-Json -Json ($taskM|ConvertTo-Json -Depth 35) -SchemaFile (Join-Path $taskRuntime 'refs/asset-manifest.schema.json'))){throw 'Schema failed'}
foreach($taskTx in $taskM.textures){if((Get-FileHash -LiteralPath $taskTx.file -Algorithm SHA256).Hash.ToLowerInvariant() -ne $taskTx.sha256 -or (Get-Item -LiteralPath $taskTx.file).Length -ne $taskTx.bytes){throw 'PNG pin differs'}}
Write-P5Json 'asset-manifest.mini-02-floor.json' $taskM
Write-P5Json 'FLOOR_CORRECTION.mini-02.json' $taskM.floorCorrection
Write-P5Json 'SELECTED.mini-02.json' ([ordered]@{uniquePng=8;textureIds=15;instances=35;png=@($taskM.textures|Group-Object sha256|ForEach-Object{[ordered]@{file=$_.Group[0].file;sha256=$_.Name;bytes=$_.Group[0].bytes;textureIds=@($_.Group.id)}})})
@('asset-manifest.mini-02-floor.json','FLOOR_CORRECTION.mini-02.json','SELECTED.mini-02.json')|ForEach-Object{$taskP=Join-Path $taskOwn $_;[ordered]@{path=$_;bytes=(Get-Item $taskP).Length;sha256=(Get-FileHash $taskP -Algorithm SHA256).Hash.ToLowerInvariant()}}|ConvertTo-Json
