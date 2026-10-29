$ErrorActionPreference='Stop'
$assetRoot=Split-Path -Parent $PSScriptRoot
$componentRoot=Join-Path $assetRoot 'components-v01'
$runtime='E:\R4D\perspective\p6-runtime\asset-artist'
$env:TEMP=Join-Path $runtime 'temp';$env:TMP=$env:TEMP
$manifest=Get-Content -LiteralPath (Join-Path $runtime 'inputs\accepted-p1\manifest.json') -Raw | ConvertFrom-Json
$inverse=[double[]]@($manifest.projection.sourceToNative|ForEach-Object{foreach($cell in $_){[double]$cell}})
$h=$manifest.projection.nativeToSource
$polygon=[double[]]@($manifest.projection.playableFloorNativePolygon|ForEach-Object{$x=$_[0];$y=$_[1];$w=$h[2][0]*$x+$h[2][1]*$y+$h[2][2];($h[0][0]*$x+$h[0][1]*$y+$h[0][2])/$w;($h[1][0]*$x+$h[1][1]*$y+$h[1][2])/$w})
$xs=@($manifest.projection.playableFloorNativePolygon|ForEach-Object{$_[0]});$ys=@($manifest.projection.playableFloorNativePolygon|ForEach-Object{$_[1]})
$ox=($xs|Measure-Object -Minimum).Minimum;$oy=($ys|Measure-Object -Minimum).Minimum
$spanX=($xs|Measure-Object -Maximum).Maximum-$ox;$spanY=($ys|Measure-Object -Maximum).Maximum-$oy
$maskPath=Join-Path $componentRoot 'prepared\floor-mask-v01.png'
if((Get-FileHash -LiteralPath $maskPath -Algorithm SHA256).Hash.ToLowerInvariant() -ne 'ec7e2202d5817bace18d69c0c87745c796c904bd267c8446d2c306b86686d4b9'){throw 'Frozen floor mask mismatch'}
Add-Type -AssemblyName System.Drawing
$warmup=[System.Drawing.Bitmap]::new(1,1);$warmup.Dispose()
$refs=@([AppDomain]::CurrentDomain.GetAssemblies()|Where-Object{-not $_.IsDynamic -and $_.Location}|ForEach-Object Location|Select-Object -Unique)
Add-Type -ReferencedAssemblies $refs -TypeDefinition @"
using System;
using System.Drawing;
using System.Drawing.Imaging;
using System.Runtime.InteropServices;
public static class P6FloorOnceV3 {
 static bool Inside(double[] p,double x,double y){bool hit=false;int n=p.Length/2;for(int i=0,j=n-1;i<n;j=i++){double xi=p[i*2],yi=p[i*2+1],xj=p[j*2],yj=p[j*2+1];if((yi>y)!=(yj>y)&&x<(xj-xi)*(y-yi)/(yj-yi)+xi)hit=!hit;}return hit;}
 static byte[] Pixels(Bitmap image){var data=image.LockBits(new Rectangle(0,0,image.Width,image.Height),ImageLockMode.ReadOnly,PixelFormat.Format32bppArgb);var p=new byte[Math.Abs(data.Stride)*image.Height];Marshal.Copy(data.Scan0,p,0,p.Length);image.UnlockBits(data);return p;}
 static byte Sample(byte[] p,int w,int h,double x,double y,int c){x=Math.Max(0,Math.Min(w-1,x));y=Math.Max(0,Math.Min(h-1,y));int x0=(int)x,y0=(int)y,x1=Math.Min(x0+1,w-1),y1=Math.Min(y0+1,h-1);double fx=x-x0,fy=y-y0;double a=p[(y0*w+x0)*4+c]*(1-fx)+p[(y0*w+x1)*4+c]*fx,b=p[(y1*w+x0)*4+c]*(1-fx)+p[(y1*w+x1)*4+c]*fx;return (byte)Math.Round(a*(1-fy)+b*fy);}
 public static void Render(string texFile,string maskFile,string output,double[] inv,double[] poly,double ox,double oy,double spanX,double spanY){using(var tex=new Bitmap(texFile))using(var mask=new Bitmap(maskFile))using(var result=new Bitmap(1536,1536,PixelFormat.Format32bppArgb)){var source=Pixels(tex);var frozenMask=Pixels(mask);var pixels=new byte[1536*1536*4];double units=Math.Max(spanX/(tex.Width-1),spanY/(tex.Height-1)),padX=(tex.Width-1-spanX/units)/2,padY=(tex.Height-1-spanY/units)/2;for(int y=0;y<1536;y++)for(int x=0;x<1536;x++){double sx=x+0.5,sy=y+0.5;int index=(y*1536+x)*4;bool inside=Inside(poly,sx,sy);if(inside!=(frozenMask[index+3]>=128))throw new InvalidOperationException("Floor mask changed");if(!inside)continue;double den=inv[6]*sx+inv[7]*sy+inv[8],wx=(inv[0]*sx+inv[1]*sy+inv[2])/den,wy=(inv[3]*sx+inv[4]*sy+inv[5])/den,tx=padX+(wx-ox)/units,ty=padY+(wy-oy)/units;for(int c=0;c<3;c++)pixels[index+c]=Sample(source,tex.Width,tex.Height,tx,ty,c);pixels[index+3]=255;}var data=result.LockBits(new Rectangle(0,0,1536,1536),ImageLockMode.WriteOnly,PixelFormat.Format32bppArgb);Marshal.Copy(pixels,0,data.Scan0,pixels.Length);result.UnlockBits(data);result.Save(output,ImageFormat.Png);}}
}
"@
$raw=Join-Path $componentRoot 'raw\floor-material-v03.png';$floorOut=Join-Path $componentRoot 'prepared\floor-layer-v03.png'
[P6FloorOnceV3]::Render($raw,$maskPath,$floorOut,$inverse,$polygon,$ox,$oy,$spanX,$spanY)
$preview=[System.Drawing.Bitmap]::new($floorOut);$shadow=[System.Drawing.Bitmap]::new((Join-Path $componentRoot 'prepared\ground-shadows-v02.png'));$graphics=[System.Drawing.Graphics]::FromImage($preview);$graphics.DrawImageUnscaled($shadow,0,0);$graphics.Dispose();$preview.Save((Join-Path $componentRoot 'prepared\floor-shadow-preview-v03.png'),[System.Drawing.Imaging.ImageFormat]::Png);$shadow.Dispose();$preview.Dispose()
$texture=[System.Drawing.Bitmap]::new($raw);$canvas=@($texture.Width,$texture.Height);$texture.Dispose()
$packet=[ordered]@{schema='r4d.p6.ground-layers.v3';acceptedP1='4b47db04c7140ebf88f69b91faa0b790d46f22ec';canvas=@(1536,1536);materialRaw='raw/floor-material-v03.png';materialRawCanvas=$canvas;materialRawSha256=(Get-FileHash -LiteralPath $raw -Algorithm SHA256).Hash.ToLowerInvariant();method='Single generated portrait material, uniform native units per texel covering accepted floor AABB, sampled once through exact inverse homography; no repetition or mirror. Existing accepted floor alpha verified pixel by pixel.';sourceToNative=$manifest.projection.sourceToNative;nativeOrigin=@($ox,$oy);nativeSpan=@($spanX,$spanY);geometryMaskUnchanged=$true;staticShadowsUnchanged=$false;staticShadowCount=25;floorContainsBakedShadows=$false;files=@(foreach($file in @('floor-layer-v03.png','floor-shadow-preview-v03.png','floor-mask-v01.png','ground-shadows-v02.png')){[ordered]@{path=('prepared/'+$file);sha256=(Get-FileHash -LiteralPath (Join-Path $componentRoot ('prepared\'+$file)) -Algorithm SHA256).Hash.ToLowerInvariant();bytes=(Get-Item -LiteralPath (Join-Path $componentRoot ('prepared\'+$file))).Length}});dynamicShadowClip='Use unchanged floor-mask-v01 for dynamic shadow only; sphere body is never clipped by this floor mask';status='native style correction softens photo grain/joints and integrates stronger25-shadow layer after real all25 overview; assembled review pending'}
[System.IO.File]::WriteAllText((Join-Path $componentRoot 'FLOOR_PACKET_V03.json'),($packet|ConvertTo-Json -Depth 10).Replace("`r`n","`n")+"`n",[System.Text.UTF8Encoding]::new($false))
$packet.files|ConvertTo-Json -Depth 4
