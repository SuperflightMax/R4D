param([double]$DepthRatio=.51,[string]$Output='E:/R4D/perspective/p5-runtime/asset-artist/refs/mid-footprint-guide.png')
$ErrorActionPreference='Stop'
# Diagnostic vector geometry raster only. Never selected/final art.
Add-Type -AssemblyName System.Drawing
$taskPath=$Output
$taskDepth=900*$DepthRatio
$taskTopY=780-$taskDepth/2
$taskBottomY=850-$taskDepth/2
if(Test-Path -LiteralPath $taskPath){throw 'Refusing overwrite of guide'}
$taskImage=[System.Drawing.Bitmap]::new(1254,1254,[System.Drawing.Imaging.PixelFormat]::Format32bppArgb)
$taskGraphics=[System.Drawing.Graphics]::FromImage($taskImage)
$taskPathSide=[System.Drawing.Drawing2D.GraphicsPath]::new()
$taskBrushSide=[System.Drawing.SolidBrush]::new([System.Drawing.Color]::FromArgb(180,180,180))
$taskBrushTop=[System.Drawing.SolidBrush]::new([System.Drawing.Color]::FromArgb(219,219,219))
$taskPen=[System.Drawing.Pen]::new([System.Drawing.Color]::FromArgb(85,85,85),4)
$taskFootPen=[System.Drawing.Pen]::new([System.Drawing.Color]::FromArgb(45,100,180),4)
try{
 $taskGraphics.Clear([System.Drawing.Color]::White)
 $taskGraphics.SmoothingMode=[System.Drawing.Drawing2D.SmoothingMode]::AntiAlias
 $taskPathSide.AddArc(177,$taskTopY,900,$taskDepth,0,180)
 $taskPathSide.AddLine(177,780,177,850)
 $taskPathSide.AddArc(177,$taskBottomY,900,$taskDepth,180,-180)
 $taskPathSide.CloseFigure()
 $taskGraphics.FillPath($taskBrushSide,$taskPathSide)
 $taskGraphics.FillEllipse($taskBrushTop,177,$taskTopY,900,$taskDepth)
 $taskGraphics.DrawEllipse($taskPen,177,$taskTopY,900,$taskDepth)
 $taskGraphics.DrawArc($taskPen,177,$taskBottomY,900,$taskDepth,0,180)
 $taskGraphics.DrawLine($taskPen,177,780,177,850)
 $taskGraphics.DrawLine($taskPen,1077,780,1077,850)
 $taskGraphics.DrawEllipse($taskFootPen,177,$taskBottomY,900,$taskDepth)
 $taskImage.Save($taskPath,[System.Drawing.Imaging.ImageFormat]::Png)
 [ordered]@{path=$taskPath;usage='Diagnostic geometry reference only; never final art';sizePx=@(1254,1254);groundAnchorPx=@(627,850);footprintPx=@{width=900;depth=$taskDepth;ratio=$DepthRatio};baseHeightPx=70;sha256=(Get-FileHash -LiteralPath $taskPath -Algorithm SHA256).Hash.ToLowerInvariant();bytes=(Get-Item -LiteralPath $taskPath).Length}|ConvertTo-Json
}finally{$taskFootPen.Dispose();$taskPen.Dispose();$taskBrushTop.Dispose();$taskBrushSide.Dispose();$taskPathSide.Dispose();$taskGraphics.Dispose();$taskImage.Dispose()}
