param([string]$TaskRoot)
Add-Type -AssemblyName System.Drawing
function New-ReviewSheet {
  param([string]$Output, [array]$Cases)
  $taskSheet=[System.Drawing.Bitmap]::new(1300,290*$Cases.Count)
  $taskG=[System.Drawing.Graphics]::FromImage($taskSheet)
  $taskG.Clear([System.Drawing.Color]::White)
  $taskG.InterpolationMode=[System.Drawing.Drawing2D.InterpolationMode]::NearestNeighbor
  $taskFont=[System.Drawing.Font]::new('Arial',11)
  for($taskRow=0;$taskRow -lt $Cases.Count;$taskRow++) {
    $taskCase=$Cases[$taskRow]
    for($taskCol=0;$taskCol -lt 5;$taskCol++) {
      $taskTick=$taskCase.ticks[$taskCol]
      $taskSource=Join-Path $TaskRoot "raw\paused\$($taskCase.prefix)-t$taskTick.jpg"
      $taskImage=[System.Drawing.Image]::FromFile($taskSource)
      $taskX=$taskCol*260
      $taskY=$taskRow*290
      $taskG.DrawString("$($taskCase.label) | t$taskTick",$taskFont,[System.Drawing.Brushes]::Black,$taskX,$taskY)
      $taskCrop=[System.Drawing.Rectangle]::new($taskCase.x,$taskCase.y,130,120)
      $taskG.DrawImage($taskImage,[System.Drawing.Rectangle]::new($taskX,$taskY+23,260,240),$taskCrop,[System.Drawing.GraphicsUnit]::Pixel)
      $taskG.DrawImage($taskImage,[System.Drawing.Rectangle]::new($taskX,$taskY+264,260,26),[System.Drawing.Rectangle]::new(935,235,260,26),[System.Drawing.GraphicsUnit]::Pixel)
      $taskImage.Dispose()
    }
  }
  $taskSheet.Save((Join-Path $TaskRoot $Output),[System.Drawing.Imaging.ImageFormat]::Png)
  $taskFont.Dispose()
  $taskG.Dispose()
  $taskSheet.Dispose()
}
