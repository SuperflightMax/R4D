$ErrorActionPreference='Stop'
$taskRoot='E:\R4D\perspective\p3-runtime\visual-qa\transfer-water-dark\dark\receiver-front-edge-04'
$taskCaptures=Get-Content -Raw -LiteralPath (Join-Path $taskRoot 'paused-captures.json')|ConvertFrom-Json
$taskPairs=@()
foreach($taskOld in @($taskCaptures|Where-Object {$_.context -eq 'old'})){
  $taskNew=$taskCaptures|Where-Object {$_.file -eq ($taskOld.file -replace '^old/','new/')}|Select-Object -Last 1
  if($null -eq $taskNew){throw ('Missing new pair: '+$taskOld.file)}
  $taskStateEqual=($taskOld.state|ConvertTo-Json -Depth 12 -Compress) -ceq ($taskNew.state|ConvertTo-Json -Depth 12 -Compress)
  $taskControlsEqual=($taskOld.controls|ConvertTo-Json -Compress) -ceq ($taskNew.controls|ConvertTo-Json -Compress)
  $taskCameraEqual=($taskOld.camera|ConvertTo-Json -Compress) -ceq ($taskNew.camera|ConvertTo-Json -Compress)
  if(-not($taskStateEqual -and $taskControlsEqual -and $taskCameraEqual)){throw ('A/B state or view mismatch: '+$taskOld.file)}
  $taskPairs+=[pscustomobject]@{old=$taskOld.file;new=$taskNew.file;tick=$taskOld.state.tick;fullNativeStateEqual=$taskStateEqual;controlsEqual=$taskControlsEqual;cameraEqual=$taskCameraEqual}
}
$taskPairs|ConvertTo-Json -Depth 5|Set-Content -Encoding utf8 -LiteralPath (Join-Path $taskRoot 'paired-state-check.json')
$taskOriginal=Get-Content -Raw -LiteralPath 'experiments\p3-masks\transfer\dark\visual-qa\full-method-03\replays\D-POP-01-seed3858699109-t2012.json'|ConvertFrom-Json
$taskCPs=@()
foreach($taskContext in @('old','new')){
  $taskPath=Join-Path $taskRoot ('replays\'+$taskContext+'-DPOP-t2012.json')
  $taskCP=Get-Content -Raw -LiteralPath $taskPath|ConvertFrom-Json
  $taskEqual=($taskCP|ConvertTo-Json -Depth 40 -Compress) -ceq ($taskOriginal|ConvertTo-Json -Depth 40 -Compress)
  if(-not$taskEqual){throw ('Whole UI checkpoint differs from VQA03: '+$taskContext)}
  $taskCPs+=[pscustomobject]@{context=$taskContext;tick=2012;wholeCheckpointEqualsVQA03=$taskEqual;rawSHA256=(Get-FileHash -LiteralPath $taskPath -Algorithm SHA256).Hash.ToLowerInvariant()}
}
$taskCPs|ConvertTo-Json -Depth 4|Set-Content -Encoding utf8 -LiteralPath (Join-Path $taskRoot 'checkpoint-equality.json')
Add-Type -AssemblyName System.Drawing
function New-TaskCompareSheet([string]$Output,[array]$Ticks,[string]$Prefix,[int]$CropX,[int]$CropY,[int]$CropWidth=130,[int]$CropHeight=120){
  $taskSheet=[System.Drawing.Bitmap]::new(260*$Ticks.Count,580)
  $taskG=[System.Drawing.Graphics]::FromImage($taskSheet)
  $taskG.Clear([System.Drawing.Color]::White)
  $taskG.InterpolationMode=[System.Drawing.Drawing2D.InterpolationMode]::NearestNeighbor
  $taskFont=[System.Drawing.Font]::new('Arial',11)
  for($taskRow=0;$taskRow -lt 2;$taskRow++){
    $taskContext=if($taskRow -eq 0){'old'}else{'new'}
    for($taskCol=0;$taskCol -lt $Ticks.Count;$taskCol++){
      $taskTick=$Ticks[$taskCol]
      $taskImage=[System.Drawing.Image]::FromFile((Join-Path $taskRoot "raw\$taskContext\$Prefix-t$taskTick.jpg"))
      $taskX=$taskCol*260;$taskY=$taskRow*290
      $taskG.DrawString("$taskContext | t$taskTick",$taskFont,[System.Drawing.Brushes]::Black,$taskX,$taskY)
      $taskG.DrawImage($taskImage,[System.Drawing.Rectangle]::new($taskX,$taskY+23,260,240),[System.Drawing.Rectangle]::new($CropX,$CropY,$CropWidth,$CropHeight),[System.Drawing.GraphicsUnit]::Pixel)
      $taskG.DrawImage($taskImage,[System.Drawing.Rectangle]::new($taskX,$taskY+264,260,26),[System.Drawing.Rectangle]::new(935,235,260,26),[System.Drawing.GraphicsUnit]::Pixel)
      $taskImage.Dispose()
    }
  }
  $taskSheet.Save((Join-Path $taskRoot $Output),[System.Drawing.Imaging.ImageFormat]::Png)
  $taskFont.Dispose();$taskG.Dispose();$taskSheet.Dispose()
}
New-TaskCompareSheet 'D-POP-01-AB-2011-2018.png' @(2011,2012,2013,2014,2016,2018) 'target-z200-U220-L160' 700 510
New-TaskCompareSheet 'new-threshold-2044-2047.png' @(2044,2045,2046,2047) 'target-z200-U220-L160' 780 590
New-TaskCompareSheet 'receiver04-side-AB.png' @(1960,1980,1995,2005) 'receiver04-side-z200-U220-L160' 600 430 221 204
$taskPixelChecks=@()
foreach($taskTick in @(2044,2045,2046,2047)){
  $taskO=[System.Drawing.Bitmap]::new((Join-Path $taskRoot "raw\old\target-z200-U220-L160-t$taskTick.jpg"))
  $taskN=[System.Drawing.Bitmap]::new((Join-Path $taskRoot "raw\new\target-z200-U220-L160-t$taskTick.jpg"))
  $taskDifferent=0;$taskMaximum=0
  for($taskY=610;$taskY -lt 710;$taskY++){for($taskX=790;$taskX -lt 905;$taskX++){
    $taskOP=$taskO.GetPixel($taskX,$taskY);$taskNP=$taskN.GetPixel($taskX,$taskY)
    $taskDelta=[math]::Max([math]::Abs([int]$taskOP.R-[int]$taskNP.R),[math]::Max([math]::Abs([int]$taskOP.G-[int]$taskNP.G),[math]::Abs([int]$taskOP.B-[int]$taskNP.B)))
    if($taskDelta -gt 0){$taskDifferent++};$taskMaximum=[math]::Max($taskMaximum,$taskDelta)
  }}
  $taskO.Dispose();$taskN.Dispose()
  $taskPixelChecks+=[pscustomobject]@{tick=$taskTick;cropPx=@(790,610,115,100);method='Decoded RGB of actual viewport JPEG pair; same native state/view; not alpha simulation or FPS measurement';differentPixels=$taskDifferent;maximumRGBDifference=$taskMaximum}
}
$taskPixelChecks|ConvertTo-Json -Depth 5|Set-Content -Encoding utf8 -LiteralPath (Join-Path $taskRoot 'actual-crop-comparison.json')
[pscustomobject]@{pairedCompleteStates=$taskPairs.Count;wholeCheckpointsEqual03=$taskCPs.Count;thresholdCropChecks=$taskPixelChecks}|ConvertTo-Json -Depth 6
