$ErrorActionPreference='Stop'
$taskOwn='E:/R4D/perspective/p5-worktrees/asset-artist/experiments/p5-regenerated-objects/asset-artist'
$taskRuntime='E:/R4D/perspective/p5-runtime/asset-artist'
function Write-P5Json([string]$Name,$Value){$taskText=($Value|ConvertTo-Json -Depth 30)-replace "`r`n","`n";[IO.File]::WriteAllText((Join-Path $taskOwn $Name),$taskText+"`n",[Text.UTF8Encoding]::new($false))}
function Copy-P5Object($Value){return ($Value|ConvertTo-Json -Depth 30|ConvertFrom-Json -AsHashtable)}
function Bounds-P5($Polygon){$taskXs=@($Polygon|ForEach-Object{$_[0]});$taskYs=@($Polygon|ForEach-Object{$_[1]});$taskMinX=($taskXs|Measure-Object -Minimum).Minimum;$taskMinY=($taskYs|Measure-Object -Minimum).Minimum;return @($taskMinX,$taskMinY,(($taskXs|Measure-Object -Maximum).Maximum-$taskMinX),(($taskYs|Measure-Object -Maximum).Maximum-$taskMinY))}
function Area-P5($Polygon){$taskArea=0.0;for($taskI=0;$taskI -lt $Polygon.Count;$taskI++){$taskJ=($taskI+1)%$Polygon.Count;$taskArea+=$Polygon[$taskI][0]*$Polygon[$taskJ][1]-$Polygon[$taskJ][0]*$Polygon[$taskI][1]};return [math]::Abs($taskArea/2)}
function Contains-P5($Polygon,[double]$X,[double]$Y){$taskInside=$false;$taskJ=$Polygon.Count-1;for($taskI=0;$taskI -lt $Polygon.Count;$taskI++){$taskA=$Polygon[$taskI];$taskB=$Polygon[$taskJ];if(($taskA[1] -gt $Y) -ne ($taskB[1] -gt $Y)){if($X -lt ($taskB[0]-$taskA[0])*($Y-$taskA[1])/($taskB[1]-$taskA[1])+$taskA[0]){$taskInside=-not $taskInside}};$taskJ=$taskI};return $taskInside}
$taskOldPath=Join-Path $taskOwn 'asset-manifest.mini-02.json'
if((Get-FileHash -LiteralPath $taskOldPath -Algorithm SHA256).Hash.ToLowerInvariant() -ne '6055be855714bc9ad66a0e803fc392fbd8e01d94a9798536e7047c06d5d2a331'){throw 'Frozen mini02 differs'}
$taskOld=Get-Content -LiteralPath $taskOldPath -Raw|ConvertFrom-Json -AsHashtable
$taskManifest=Copy-P5Object $taskOld
$taskAuthoring=Get-Content -LiteralPath (Join-Path $taskOwn 'NEAR_LEDGE_AUTHORING.mini-03.json') -Raw|ConvertFrom-Json -AsHashtable
$taskNewPolygon=@($taskAuthoring.polygon|ForEach-Object{,@(($_[0]*1536/1254),($_[1]*1536/1254))})
$taskOldInstance=$taskOld.instances|Where-Object{$_.id -eq 'near-ledge'}
$taskNewInstance=$taskManifest.instances|Where-Object{$_.id -eq 'near-ledge'}
$taskOldPolygon=$taskOldInstance.sourceClipPx.polygon
$taskNewBounds=Bounds-P5 $taskNewPolygon
$taskNewArea=Area-P5 $taskNewPolygon
if($taskNewBounds[0] -lt 0 -or $taskNewBounds[1] -lt 0 -or $taskNewBounds[0]+$taskNewBounds[2] -gt 1536 -or $taskNewBounds[1]+$taskNewBounds[3] -ge 1202 -or $taskNewArea -le 1){throw 'Invalid structural-edge region'}
$taskNewInstance.sourceClipPx.polygon=$taskNewPolygon
$taskNewInstance.sourceClipPx.expectedVisibleBoundsSourcePx=$taskNewBounds
$taskNewInstance.sourceClipPx.provenance.authoringTexturePolygonPx=$taskAuthoring.polygon
$taskNewInstance.sourceClipPx.provenance.note='C02-V01 clip-only correction: retain actual near stone front fascia under its full architectural seam. Exclude flat paving on both wings and above the center. Same generated floor bytes/registration; no per-seed hole or native change.'
$taskNewInstance.sourceClipPx.provenance.correction=@{finding='C02-V01';previousManifestCommit='4990463ec6eabf89aa47f58f9b59f703cbf739ba';previousManifestSha256='6055be855714bc9ad66a0e803fc392fbd8e01d94a9798536e7047c06d5d2a331';basis=$taskAuthoring.basis;uncertaintyTexturePx=$taskAuthoring.measurementUncertaintyTexturePx;bitmapChanged=$false;seedConditional=$false}
$taskNewInstance.sourceClipPx.limitations=$taskAuthoring.limitations
if(-not(Test-Json -Json ($taskManifest|ConvertTo-Json -Depth 30) -SchemaFile (Join-Path $taskRuntime 'refs/asset-manifest.schema.v2.json'))){throw 'Schema validation failed'}
$taskOldUnchanged=Copy-P5Object $taskOld;$taskNewUnchanged=Copy-P5Object $taskManifest
($taskOldUnchanged.instances|Where-Object{$_.id -eq 'near-ledge'}).Remove('sourceClipPx')|Out-Null
($taskNewUnchanged.instances|Where-Object{$_.id -eq 'near-ledge'}).Remove('sourceClipPx')|Out-Null
if(($taskOldUnchanged|ConvertTo-Json -Depth 30 -Compress) -cne ($taskNewUnchanged|ConvertTo-Json -Depth 30 -Compress)){throw 'Unexpected change outside near-ledge sourceClipPx'}
$taskRegions=Get-Content -LiteralPath (Join-Path $taskOwn 'FOREGROUND_REGIONS.mini-02.json') -Raw|ConvertFrom-Json -AsHashtable
$taskNearRegion=$taskRegions|Where-Object{$_.id -eq 'near-ledge'}
$taskNearRegion.expectedBoundsSourcePx=$taskNewBounds;$taskNearRegion.polygonAreaSourcePx2=$taskNewArea;$taskNearRegion.sourceClipPx=Copy-P5Object $taskNewInstance.sourceClipPx
$taskSamples=@(@{id='VQA-t676-ground-approx';raw=@((1209*1254/1536),(1099*1254/1536));basis='Given VQA source ground point approx1209,1099; regression probe only, not design boundary'},@{id='left-flat-paving';raw=@(310,890);basis='Open stone paving visible above left fascia'},@{id='center-flat-paving';raw=@(627,925);basis='Paving/bevel above the main front stone face'},@{id='right-flat-paving';raw=@(987,895);basis='Open stone paving left of right serpent face'},@{id='left-stone-face';raw=@(310,925);basis='Visible front stone fascia'},@{id='center-stone-face';raw=@(627,945);basis='Visible front stone fascia'},@{id='right-stone-face';raw=@(987,920);basis='Visible front stone fascia'})
$taskProbeRows=@(foreach($taskSample in $taskSamples){$taskSource=@(($taskSample.raw[0]*1536/1254),($taskSample.raw[1]*1536/1254));[ordered]@{id=$taskSample.id;basis=$taskSample.basis;texturePointPx=$taskSample.raw;sourcePointPx=$taskSource;oldInside=Contains-P5 $taskOldPolygon $taskSource[0] $taskSource[1];newInside=Contains-P5 $taskNewPolygon $taskSource[0] $taskSource[1]}})
if(($taskProbeRows|Where-Object{$_.id -eq 'VQA-t676-ground-approx'}).newInside){throw 'Regression point still covered'}
foreach($taskSample in $taskProbeRows|Where-Object{$_.id -match 'flat-paving'}){if($taskSample.newInside){throw ('Visible paving still covered '+$taskSample.id)}}
foreach($taskSample in $taskProbeRows|Where-Object{$_.id -match 'stone-face'}){if(-not $taskSample.newInside){throw ('Structural face excluded '+$taskSample.id)}}
$taskUnique=@($taskManifest.textures.file|Sort-Object -Unique)
foreach($taskTexture in $taskManifest.textures){if((Get-FileHash -LiteralPath $taskTexture.file -Algorithm SHA256).Hash.ToLowerInvariant() -ne $taskTexture.sha256 -or (Get-Item -LiteralPath $taskTexture.file).Length -ne $taskTexture.bytes){throw ('Texture pin mismatch '+$taskTexture.id)}}
$taskDiagnosticFrames=@('seed4210403976-t674-field-art.jpg','seed4210403976-t675-field-art.jpg','seed4210403976-t676-field-art.jpg','seed4210403976-t676-field-art-geometry.jpg')
$taskFramePins=@(foreach($taskName in $taskDiagnosticFrames){$taskPath='E:/R4D/perspective/p5-runtime/visual-qa/evidence/c02/'+$taskName;[ordered]@{file=$taskPath;sha256=(Get-FileHash -LiteralPath $taskPath -Algorithm SHA256).Hash.ToLowerInvariant();bytes=(Get-Item -LiteralPath $taskPath).Length}})
$taskDelta=[ordered]@{finding='C02-V01';type='clip-only generated-floor scene-region correction';frozenBefore=@{artistCommit='4990463ec6eabf89aa47f58f9b59f703cbf739ba';manifest='asset-manifest.mini-02.json';sha256='6055be855714bc9ad66a0e803fc392fbd8e01d94a9798536e7047c06d5d2a331';consumerPrefix='398b0daa'};floorSha256='24a54990c4876fc809af3efd42a711a8a47fefeef51caf3b88608017cbce6e06';changedInstance='near-ledge';changedField='sourceClipPx';basis=$taskAuthoring.basis;oldTexturePolygonPx=$taskOldInstance.sourceClipPx.provenance.authoringTexturePolygonPx;newTexturePolygonPx=$taskAuthoring.polygon;oldSourcePolygonPx=$taskOldPolygon;newSourcePolygonPx=$taskNewPolygon;oldBoundsSourcePx=$taskOldInstance.sourceClipPx.expectedVisibleBoundsSourcePx;newBoundsSourcePx=$taskNewBounds;oldPolygonAreaSourcePx2=Area-P5 $taskOldPolygon;newPolygonAreaSourcePx2=$taskNewArea;fixedProbes=$taskProbeRows;diagnosticFramePins=$taskFramePins;invariants=@{semanticFieldsOutsideNearLedgeClipUnchanged=$true;nativeSourceAnchorsUnchanged=$true;bodyShadowReceiverBindingsUnchanged=$true;receiverClearanceUnchanged=$true;otherContoursUnchanged=$true;pngCount=$taskUnique.Count;allTextureShaAndBytesMatch=$true;newBitmapGeneration=$false;seedTickConditional=$false};measurementUncertaintyTexturePx=3;limits=@('Read-only frames and structural-edge data analysis, not actual rebuilt C03 runtime QA','Static point containment does not prove complete sphere visibility/partial occlusion','Small raised plant tops above the architectural seam are deliberately not promoted by the near-ledge mask')}
Write-P5Json 'asset-manifest.mini-03.json' $taskManifest
Write-P5Json 'FOREGROUND_REGIONS.mini-03.json' $taskRegions
Write-P5Json 'DELTA_MINI_03.json' $taskDelta
@('asset-manifest.mini-03.json','FOREGROUND_REGIONS.mini-03.json','DELTA_MINI_03.json')|ForEach-Object{$taskItem=Get-Item -LiteralPath (Join-Path $taskOwn $_);[pscustomobject]@{file=$_;bytes=$taskItem.Length;sha256=(Get-FileHash -LiteralPath $taskItem.FullName -Algorithm SHA256).Hash.ToLowerInvariant()}}|ConvertTo-Json
