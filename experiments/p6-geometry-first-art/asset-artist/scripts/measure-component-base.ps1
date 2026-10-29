param([Parameter(Mandatory=$true)][string]$Family)
$ErrorActionPreference='Stop'
Add-Type -AssemblyName System.Drawing
$assetRoot=Split-Path -Parent $PSScriptRoot
$componentRoot=Join-Path $assetRoot 'components-v01'
$stats=Get-Content -LiteralPath (Join-Path $componentRoot ($Family+'-alpha.json')) -Raw | ConvertFrom-Json
$box=@($stats.bounds | Where-Object { $_.threshold -eq 128 })[0].rectInclusive
$centre0=($box[0]+$box[2])/2.0; $radius0=($box[2]-$box[0]+1)/2.0
$bitmap=[System.Drawing.Bitmap]::new((Join-Path $componentRoot ('raw\'+$Family+'.png')))
$samples=@()
for($i=0;$i -le24;$i++){
 $x=[int][math]::Round($centre0+(-0.95+1.90*$i/24)*$radius0)
 $y=-1
 for($row=$bitmap.Height-1;$row -ge0;$row--){if($bitmap.GetPixel($x,$row).A -ge128){$y=$row;break}}
 if($y -ge0){$samples+=[pscustomobject]@{x=$x;y=$y}}
}
$best=$null
for($shift=-6;$shift -le6;$shift+=2){
 $cx=$centre0+$shift
 for($step=96;$step -le100;$step++){
  $rx=$radius0*$step/100.0
  [double]$sumF=0;[double]$sumFF=0;[double]$sumY=0;[double]$sumFY=0
  $valid=$true
  foreach($point in $samples){$u=($point.x-$cx)/$rx;if([math]::Abs($u) -ge1){$valid=$false;break};$f=[math]::Sqrt(1-$u*$u);$sumF+=$f;$sumFF+=$f*$f;$sumY+=$point.y;$sumFY+=$f*$point.y}
  if(-not $valid){continue}
  $count=$samples.Count;$denominator=$count*$sumFF-$sumF*$sumF
  if([math]::Abs($denominator) -lt1e-10){continue}
  $ry=($count*$sumFY-$sumF*$sumY)/$denominator;$cy=($sumY-$ry*$sumF)/$count
  if($ry/$rx -lt0.30 -or $ry/$rx -gt0.65){continue}
  [double]$sse=0
  foreach($point in $samples){$u=($point.x-$cx)/$rx;$prediction=$cy+$ry*[math]::Sqrt(1-$u*$u);$sse+=($point.y-$prediction)*($point.y-$prediction)}
  if($null -eq $best -or $sse -lt $best.sse){$best=[pscustomobject]@{cx=$cx;cy=$cy;rx=$rx;ry=$ry;sse=$sse;rms=[math]::Sqrt($sse/$count)}}
 }
}
$bitmap.Dispose()
if($null -eq $best){throw 'No plausible lower-rim ellipse fit'}
$result=[ordered]@{family=$Family;basis='Artist approximate ground ellipse from actual alpha>=128 lower-rim samples, not a physical collider or proved geometry match';centerPx=@($best.cx,$best.cy);radiusXPx=$best.rx;radiusYPx=$best.ry;lowerRimFitRmsPx=$best.rms;samples=$samples;visualTopY=$box[1];visibleHeightAboveGroundPx=($best.cy-$box[1]);needsActualAssemblyOverlay=$true}
$json=($result | ConvertTo-Json -Depth 6).Replace("`r`n","`n")
[System.IO.File]::WriteAllText((Join-Path $componentRoot ($Family+'-base.json')),$json+"`n",[System.Text.UTF8Encoding]::new($false))
[pscustomobject]$result | Select-Object family,centerPx,radiusXPx,radiusYPx,lowerRimFitRmsPx,visibleHeightAboveGroundPx | ConvertTo-Json
