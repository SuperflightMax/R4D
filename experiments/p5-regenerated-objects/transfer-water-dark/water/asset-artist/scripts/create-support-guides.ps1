$ErrorActionPreference='Stop'
Add-Type -AssemblyName System.Drawing
$taskRuntime='E:/R4D/perspective/p5-runtime/asset-artist/transfer-water-dark/water'
$taskTargets=Get-Content (Join-Path $taskRuntime 'refs/targets.json') -Raw|ConvertFrom-Json
function P5-Polygon($Graphics,$Brush,$Pairs){$taskPoints=[Drawing.PointF[]]@($Pairs|ForEach-Object{[Drawing.PointF]::new([single]$_[0],[single]$_[1])});$Graphics.FillPolygon($Brush,$taskPoints)}
$taskLight=[Drawing.SolidBrush]::new([Drawing.Color]::FromArgb(224,224,224));$taskMid=[Drawing.SolidBrush]::new([Drawing.Color]::FromArgb(165,165,165));$taskDark=[Drawing.SolidBrush]::new([Drawing.Color]::FromArgb(115,115,115))
try{
 $taskFrog=[Drawing.Bitmap]::new(1254,1254);$taskG=[Drawing.Graphics]::FromImage($taskFrog)
 try{$taskG.SmoothingMode=[Drawing.Drawing2D.SmoothingMode]::AntiAlias;$taskG.Clear([Drawing.Color]::White);$taskG.FillEllipse($taskDark,177,757,900,406);$taskG.FillRectangle($taskMid,177,890,900,70);$taskG.FillEllipse($taskLight,177,687,900,406);$taskG.FillEllipse($taskMid,270,300,714,660);$taskG.FillEllipse($taskLight,270,250,714,350);$taskFrog.Save((Join-Path $taskRuntime 'refs/frog-elevated-support-guide.png'),[Drawing.Imaging.ImageFormat]::Png)}finally{$taskG.Dispose();$taskFrog.Dispose()}
 $taskArch=$taskTargets.objects|Where-Object id -eq 'arch-01';$taskBounds=$taskArch.sourcePx.footprintBounds;$taskK=1000/$taskArch.sourcePx.footprintWidth
 $taskImage=[Drawing.Bitmap]::new(1254,1254);$taskG=[Drawing.Graphics]::FromImage($taskImage)
 try{$taskG.SmoothingMode=[Drawing.Drawing2D.SmoothingMode]::AntiAlias;$taskG.Clear([Drawing.Color]::White)
 foreach($taskLoop in $taskArch.sourcePx.groundLoops){$taskFloor=@($taskLoop|ForEach-Object{,@((127+($_[0]-$taskBounds.minX)*$taskK),(910+($_[1]-$taskBounds.minY)*$taskK))});$taskTop=@($taskFloor|ForEach-Object{,@($_[0],($_[1]-550))});for($taskI=0;$taskI -lt $taskFloor.Count;$taskI++){$taskJ=($taskI+1)%$taskFloor.Count;P5-Polygon $taskG $taskMid @($taskTop[$taskI],$taskTop[$taskJ],$taskFloor[$taskJ],$taskFloor[$taskI])};P5-Polygon $taskG $taskLight $taskTop}
 $taskDepth=$taskArch.sourcePx.footprintDepth*$taskK;$taskG.FillRectangle($taskMid,127,[single](210+$taskDepth),1000,150);$taskG.FillRectangle($taskLight,127,210,1000,[single]$taskDepth)
 $taskImage.Save((Join-Path $taskRuntime 'refs/arch-01-proportions-guide.png'),[Drawing.Imaging.ImageFormat]::Png)
 }finally{$taskG.Dispose();$taskImage.Dispose()}
 $taskOriginal=[Drawing.Bitmap]::new('K:/Agents/R4D/Assets/perspective/04-water-temple.jpg')
 try{foreach($taskSpec in @(@{name='frog-source-reference';rect=[Drawing.Rectangle]::new(680,820,180,175)},@{name='arch-source-reference';rect=[Drawing.Rectangle]::new(480,295,135,120)})){$taskCrop=$taskOriginal.Clone($taskSpec.rect,[Drawing.Imaging.PixelFormat]::Format32bppArgb);try{$taskCrop.Save((Join-Path $taskRuntime ('refs/'+$taskSpec.name+'.png')),[Drawing.Imaging.ImageFormat]::Png)}finally{$taskCrop.Dispose()}}}finally{$taskOriginal.Dispose()}
}finally{$taskLight.Dispose();$taskMid.Dispose();$taskDark.Dispose()}
Get-ChildItem (Join-Path $taskRuntime 'refs') -Filter '*guide.png'|ForEach-Object{[ordered]@{file=$_.FullName;bytes=$_.Length;sha256=(Get-FileHash -LiteralPath $_.FullName -Algorithm SHA256).Hash.ToLowerInvariant();role='Reference-only technical scaffold, never final art'}}|ConvertTo-Json
