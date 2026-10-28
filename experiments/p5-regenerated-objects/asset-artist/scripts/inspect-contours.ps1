param([string]$SpecsJson='', [string]$Output='E:/R4D/perspective/p5-runtime/asset-artist/manifests/contact-contour-measurements.json')
$ErrorActionPreference='Stop'
Add-Type -AssemblyName System.Drawing
$taskSpecs=@(
  @{name='flower-v1';cx=628.0;rx=422.0},
  @{name='leaf-v1';cx=628.0;rx=463.0},
  @{name='frog-v1';cx=642.0;rx=480.0},
  @{name='wood-v1';cx=628.0;rx=291.0}
)
if($SpecsJson){$taskSpecs=Get-Content -LiteralPath $SpecsJson -Raw | ConvertFrom-Json}
$taskRecords=@(foreach($taskSpec in $taskSpecs){
  $taskImage=[System.Drawing.Bitmap]::new(('E:/R4D/perspective/p5-runtime/asset-artist/raw/'+$taskSpec.name+'.png'))
  try {
    $taskSamples=@(foreach($taskFraction in @(-0.9,-0.8,-0.6,-0.4,-0.2,0,0.2,0.4,0.6,0.8,0.9)) {
      $taskX=[int][math]::Round($taskSpec.cx+$taskSpec.rx*$taskFraction)
      $taskBottom=-1
      for($taskY=$taskImage.Height-1;$taskY -ge 0;$taskY--){if($taskImage.GetPixel($taskX,$taskY).A -ge 128){$taskBottom=$taskY;break}}
      @{x=$taskX;y=$taskBottom;t=[math]::Sqrt(1-$taskFraction*$taskFraction)}
    })
    $taskN=$taskSamples.Count; $taskSumT=($taskSamples | Measure-Object t -Sum).Sum; $taskSumY=($taskSamples | Measure-Object y -Sum).Sum
    $taskSumTT=0.0;$taskSumTY=0.0
    foreach($taskSample in $taskSamples){$taskSumTT+=$taskSample.t*$taskSample.t;$taskSumTY+=$taskSample.t*$taskSample.y}
    $taskRy=($taskN*$taskSumTY-$taskSumT*$taskSumY)/($taskN*$taskSumTT-$taskSumT*$taskSumT)
    $taskCy=($taskSumY-$taskRy*$taskSumT)/$taskN
    [ordered]@{name=$taskSpec.name;contactEllipseFit=@{cx=$taskSpec.cx;cy=$taskCy;rx=$taskSpec.rx;ry=$taskRy;width=2*$taskSpec.rx;depth=2*$taskRy;ratio=$taskRy/$taskSpec.rx};samples=$taskSamples;method='Least-squares lower alpha>=128 contour y=cy+ry*sqrt(1-fraction^2); hand-painted contour approximation, not camera reconstruction'}
  } finally {$taskImage.Dispose()}
})
$taskRecords | ConvertTo-Json -Depth 7 | Set-Content -LiteralPath $Output -Encoding utf8NoBOM
$taskRecords | ConvertTo-Json -Depth 7
