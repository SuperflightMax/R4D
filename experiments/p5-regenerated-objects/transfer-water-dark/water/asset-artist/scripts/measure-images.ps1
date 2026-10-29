param([string]$Directory='E:/R4D/perspective/p5-runtime/asset-artist/transfer-water-dark/water/raw')
$ErrorActionPreference='Stop'
Add-Type -AssemblyName System.Drawing
$taskReferences=@(Get-ChildItem -LiteralPath (Join-Path $PSHOME 'ref') -Filter '*.dll' -File | Select-Object -ExpandProperty FullName) + @([System.Drawing.Bitmap].Assembly.Location,(Join-Path $PSHOME 'System.Private.Windows.GdiPlus.dll'),(Join-Path $PSHOME 'System.Private.Windows.Core.dll'))
Add-Type -TypeDefinition @'
using System;
using System.Drawing;
using System.Drawing.Imaging;
using System.Runtime.InteropServices;
public static class P5AlphaMeasure {
  public static object Read(string path) {
    using(var src=new Bitmap(path)) using(var bmp=new Bitmap(src.Width,src.Height,PixelFormat.Format32bppArgb)) {
      using(var graphics=Graphics.FromImage(bmp)) { graphics.CompositingMode=System.Drawing.Drawing2D.CompositingMode.SourceCopy; graphics.DrawImageUnscaled(src,0,0); }
      var rect=new Rectangle(0,0,bmp.Width,bmp.Height);
      var data=bmp.LockBits(rect,ImageLockMode.ReadOnly,PixelFormat.Format32bppArgb);
      var bytes=new byte[Math.Abs(data.Stride)*bmp.Height]; Marshal.Copy(data.Scan0,bytes,0,bytes.Length); bmp.UnlockBits(data);
      int minX=bmp.Width,minY=bmp.Height,maxX=-1,maxY=-1,vminX=bmp.Width,vminY=bmp.Height,vmaxX=-1,vmaxY=-1,maxAlpha=0;
      long zero=0,semi=0,solid=0,alphaSum=0;
      for(int y=0;y<bmp.Height;y++) for(int x=0;x<bmp.Width;x++) {
        int a=bytes[y*Math.Abs(data.Stride)+x*4+3];
        maxAlpha=Math.Max(maxAlpha,a); alphaSum+=a;
        if(a==0) zero++; else { if(a==255) solid++; else semi++; minX=Math.Min(minX,x); minY=Math.Min(minY,y); maxX=Math.Max(maxX,x); maxY=Math.Max(maxY,y); }
        if(a>=16) {vminX=Math.Min(vminX,x);vminY=Math.Min(vminY,y);vmaxX=Math.Max(vmaxX,x);vmaxY=Math.Max(vmaxY,y);}
      }
      return new { width=bmp.Width,height=bmp.Height,bounds=maxX<0?new int[]{0,0,0,0}:new int[]{minX,minY,maxX-minX+1,maxY-minY+1}, visibleBounds=vmaxX<0?new int[]{0,0,0,0}:new int[]{vminX,vminY,vmaxX-vminX+1,vmaxY-vminY+1},maxAlpha,zeroPixels=zero,semiPixels=semi,opaquePixels=solid,alphaSum };
    }
  }
}
'@ -ReferencedAssemblies $taskReferences
$taskRecords=@(Get-ChildItem -LiteralPath $Directory -Filter '*.png' -File | ForEach-Object {
  [ordered]@{file=$_.FullName;sha256=(Get-FileHash -LiteralPath $_.FullName -Algorithm SHA256).Hash.ToLowerInvariant();bytes=$_.Length;image=[P5AlphaMeasure]::Read($_.FullName)}
})
$taskRecords | ConvertTo-Json -Depth 6 | Set-Content -LiteralPath E:/R4D/perspective/p5-runtime/asset-artist/transfer-water-dark/water/manifests/image-measurements.json -Encoding utf8NoBOM
$taskRecords | ConvertTo-Json -Depth 6
