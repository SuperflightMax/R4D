param(
  [string]$DraftDir='E:\R4D\perspective\p6-worktrees\builder\experiments\p6-geometry-first-art\builder\draft-v01',
  [string]$CommonInputDir='E:\R4D\perspective\p6-runtime\visual-qa\baseline-01\common-inputs'
)
$ErrorActionPreference='Stop'
$expected=[ordered]@{
  'geometry-draft.png'='bc13aa13e2b33b0e58cd0e87b90e684c3c4adbb3576d8d9b0379e3dee1bec532'
  'registration.png'='426bec72faf21fe6ba654dca988ed1d74241b1372246d78741419b19a3d5cf4a'
  'draft-overlay.png'='a8253ebdbf70bd45a29cd2c542a48d626481352c4dc6c977b9216dd4ea12de55'
  'reference-overlay.png'='1d716e627dc5061b3544db00a5eac82125527c469cf65f22c05d9f5065e3fa7b'
  'geometry.json'='0544de7b4fcebf211b194fc63566a94b34a5b21b57fb0c56207a8c866d332d71'
}
$files=foreach($name in $expected.Keys){
  $path=Join-Path $DraftDir $name
  $hash=(Get-FileHash -LiteralPath $path -Algorithm SHA256).Hash.ToLowerInvariant()
  if($hash -ne $expected[$name]){throw "Frozen draft hash mismatch: $name"}
  $dimensions=$null
  if($name.EndsWith('.png')){
    $bytes=[IO.File]::ReadAllBytes($path)
    $width=[Net.IPAddress]::NetworkToHostOrder([BitConverter]::ToInt32($bytes,16))
    $height=[Net.IPAddress]::NetworkToHostOrder([BitConverter]::ToInt32($bytes,20))
    if($width -ne 1536 -or $height -ne 1536){throw "Unexpected image dimensions: $name"}
    $dimensions=@($width,$height)
  }
  [ordered]@{name=$name;bytes=(Get-Item -LiteralPath $path).Length;sha256=$hash;dimensions=$dimensions}
}
$expectedCommon=@{'config.json'='dd5c519cd6d4b7295118e0a3a1063efed424a0ce739450bd5153c6a9941982db';'manifest.json'='7784dc0a215d0e472cf06a4eee03793592727cf0fa9a1fa0e0c78e5f1d17da18'}
foreach($name in $expectedCommon.Keys){if((Get-FileHash -LiteralPath (Join-Path $CommonInputDir $name) -Algorithm SHA256).Hash.ToLowerInvariant() -ne $expectedCommon[$name]){throw "Common input mismatch: $name"}}
$d=Get-Content -LiteralPath (Join-Path $DraftDir 'geometry.json') -Raw | ConvertFrom-Json
$c=Get-Content -LiteralPath (Join-Path $CommonInputDir 'config.json') -Raw | ConvertFrom-Json
$m=Get-Content -LiteralPath (Join-Path $CommonInputDir 'manifest.json') -Raw | ConvertFrom-Json
function Transform($H,[double]$x,[double]$y){
  $w=$H[2][0]*$x+$H[2][1]*$y+$H[2][2]
  $px=($H[0][0]*$x+$H[0][1]*$y+$H[0][2])/$w
  $py=($H[1][0]*$x+$H[1][1]*$y+$H[1][2])/$w
  return ,@($px,$py)
}
$violations=[Collections.Generic.List[string]]::new()
$metrics=[ordered]@{maxNativeFieldError=0.0;maxMatrixFieldError=0.0;maxProjectedPointErrorPx=0.0;maxInverseCircleRadiusErrorNative=0.0;sampledCirclePoints=0}
function Check-Native($actual,$wanted,[string[]]$fields,[string]$label){
  foreach($f in $fields){
    if($null -eq $actual.$f){$violations.Add("${label}: missing $f");continue}
    $err=[math]::Abs([double]$actual.$f-[double]$wanted.$f)
    $metrics.maxNativeFieldError=[math]::Max($metrics.maxNativeFieldError,$err)
    if($err -ne 0){$violations.Add("${label}: changed $f")}
  }
}
function Check-Point($actual,$wanted,[string]$label){
  $err=[math]::Sqrt([math]::Pow($actual[0]-$wanted[0],2)+[math]::Pow($actual[1]-$wanted[1],2))
  $metrics.maxProjectedPointErrorPx=[math]::Max($metrics.maxProjectedPointErrorPx,$err)
  if($err -gt 1e-8){$violations.Add("${label}: projected point mismatch")}
}
function Check-Circle($points,$native,[double]$radius){
  foreach($p in $points){
    $q=Transform $m.projection.sourceToNative $p[0] $p[1]
    $r=[math]::Sqrt([math]::Pow($q[0]-$native.x,2)+[math]::Pow($q[1]-$native.y,2))
    $err=[math]::Abs($r-$radius)
    $metrics.maxInverseCircleRadiusErrorNative=[math]::Max($metrics.maxInverseCircleRadiusErrorNative,$err)
    $metrics.sampledCirclePoints++
    if($err -gt 1e-7){$violations.Add("$($native.id): sampled circle mismatch")}
  }
}
foreach($matrixName in @('nativeToSource','sourceToNative')){for($row=0;$row -lt 3;$row++){for($col=0;$col -lt 3;$col++){
  $err=[math]::Abs($d.$matrixName[$row][$col]-$m.projection.$matrixName[$row][$col])
  $metrics.maxMatrixFieldError=[math]::Max($metrics.maxMatrixFieldError,$err)
  if($err -ne 0){$violations.Add("$matrixName changed")}
}}}
foreach($set in @(@{Actual=@($d.objects);Wanted=@($c.board.pins);Kind='pin'},@{Actual=@($d.buckets);Wanted=@($c.board.buckets);Kind='bucket'})){
  if($set.Actual.Count -ne $set.Wanted.Count){$violations.Add("$($set.Kind) count mismatch")}
  foreach($wanted in $set.Wanted){
    $actual=@($set.Actual | Where-Object id -eq $wanted.id)
    if($actual.Count -ne 1){$violations.Add("$($wanted.id): missing or duplicate");continue}
    $item=$actual[0]
    $fields=if($set.Kind -eq 'pin'){@('x','y','r','bounce','integrity')}else{@('x','y','r','prizeMul')}
    Check-Native $item.native $wanted $fields $wanted.id
    Check-Point $item.center (Transform $m.projection.nativeToSource $wanted.x $wanted.y) $wanted.id
    $points=if($set.Kind -eq 'pin'){$item.base}else{$item.rim}
    Check-Circle $points $wanted $wanted.r
  }
}
if($d.segments.Count -ne $c.board.segments.Count){$violations.Add('segment count mismatch')}
foreach($wanted in $c.board.segments){
  $actual=@($d.segments | Where-Object id -eq $wanted.id)
  if($actual.Count -ne 1){$violations.Add("$($wanted.id): missing or duplicate");continue}
  Check-Native $actual[0] $wanted @('x1','y1','x2','y2','bounce','integrity') $wanted.id
  Check-Point $actual[0].points[0] (Transform $m.projection.nativeToSource $wanted.x1 $wanted.y1) $wanted.id
  Check-Point $actual[0].points[1] (Transform $m.projection.nativeToSource $wanted.x2 $wanted.y2) $wanted.id
}
if($d.starts.Count -ne 1){$violations.Add('start count mismatch')}
Check-Native $d.starts[0] $c.board.drops[0] @('x','y','angleDeg','speed') 'start'
Check-Point $d.starts[0].center (Transform $m.projection.nativeToSource $c.board.drops[0].x $c.board.drops[0].y) 'start'
Check-Circle $d.starts[0].ballFootprint $c.board.drops[0] $c.board.ball.r
if($d.floor.Count -ne $m.projection.playableFloorNativePolygon.Count){$violations.Add('floor vertex count mismatch')}
for($i=0;$i -lt $d.floor.Count;$i++){
  $p=$m.projection.playableFloorNativePolygon[$i]
  Check-Point $d.floor[$i] (Transform $m.projection.nativeToSource $p[0] $p[1]) "floor-$i"
}
$result=[ordered]@{
  schema='r4d.p6.visual-qa.draft-01.static-verification.v1'
  frozenCommit='bdf470e5beb468266184cc2ea0c997191d9907b3'
  acceptedP1='4b47db04c7140ebf88f69b91faa0b790d46f22ec'
  scope='Frozen bytes, dimensions and exact static geometry only; actual images viewed separately. No artistic PASS or assembled motion verification.'
  files=$files
  counts=[ordered]@{pins=$d.objects.Count;segments=$d.segments.Count;buckets=$d.buckets.Count;starts=$d.starts.Count;floorVertices=$d.floor.Count}
  metrics=$metrics
  numericEpsilonNote='1e-8 source px / 1e-7 native units are floating point calculation checks, not visual fit tolerances'
  violations=@($violations)
}
[IO.File]::WriteAllText((Join-Path $PSScriptRoot 'static-verification.json'),($result|ConvertTo-Json -Depth 12)+"`n",[Text.UTF8Encoding]::new($false))
$result | ConvertTo-Json -Depth 12
if($violations.Count -gt 0){throw 'Frozen draft static verification has violations'}
