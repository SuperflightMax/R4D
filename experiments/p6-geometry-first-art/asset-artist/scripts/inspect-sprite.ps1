param([Parameter(Mandatory=$true)][string]$File)
$ErrorActionPreference='Stop'
Add-Type -AssemblyName System.Drawing
$bitmap=[System.Drawing.Bitmap]::new($File)
$width=$bitmap.Width; $height=$bitmap.Height
$locked=$bitmap.LockBits([System.Drawing.Rectangle]::new(0,0,$width,$height),[System.Drawing.Imaging.ImageLockMode]::ReadOnly,[System.Drawing.Imaging.PixelFormat]::Format32bppArgb)
$stride=[math]::Abs($locked.Stride)
$bytes=[byte[]]::new($stride*$height)
[System.Runtime.InteropServices.Marshal]::Copy($locked.Scan0,$bytes,0,$bytes.Length)
$minimumX=@($width,$width,$width); $minimumY=@($height,$height,$height)
$maximumX=@(-1,-1,-1); $maximumY=@(-1,-1,-1); $thresholds=@(1,16,128)
$alphaMaximum=0; $boundaryNonzero=0; [double]$weight=0; [double]$sumX=0; [double]$sumY=0
for($y=0;$y -lt $height;$y++) {
 for($x=0;$x -lt $width;$x++) {
  $alpha=[int]$bytes[$y*$stride+$x*4+3]
  if($alpha -eq 0){continue}
  if($alpha -gt $alphaMaximum){$alphaMaximum=$alpha}
  $weight+=$alpha; $sumX+=$x*$alpha; $sumY+=$y*$alpha
  if($x -eq 0 -or $y -eq 0 -or $x -eq $width-1 -or $y -eq $height-1){$boundaryNonzero++}
  for($k=0;$k -lt 3;$k++) {
   if($alpha -ge $thresholds[$k]) {
    if($x -lt $minimumX[$k]){$minimumX[$k]=$x}; if($y -lt $minimumY[$k]){$minimumY[$k]=$y}
    if($x -gt $maximumX[$k]){$maximumX[$k]=$x}; if($y -gt $maximumY[$k]){$maximumY[$k]=$y}
   }
  }
 }
}
$bitmap.UnlockBits($locked)
$centre=$bitmap.GetPixel([int]($width/2),[int]($height/2))
$bounds=for($k=0;$k -lt 3;$k++){[pscustomobject]@{threshold=$thresholds[$k];rectInclusive=@($minimumX[$k],$minimumY[$k],$maximumX[$k],$maximumY[$k])}}
[pscustomobject]@{canvas=@($width,$height);alphaMax=$alphaMaximum;alphaWeightedCenter=@(($sumX/$weight),($sumY/$weight));boundaryNonzero=$boundaryNonzero;bounds=@($bounds);centreRgba=@($centre.R,$centre.G,$centre.B,$centre.A)} | ConvertTo-Json -Depth 6
$bitmap.Dispose()
