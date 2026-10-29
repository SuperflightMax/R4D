$ErrorActionPreference='Stop'
$assetRoot=Split-Path -Parent $PSScriptRoot
$componentRoot=Join-Path $assetRoot 'components-v01'
$runtimeRoot='E:\R4D\perspective\p6-runtime\asset-artist'
New-Item -ItemType Directory -Path (Join-Path $runtimeRoot 'temp'),(Join-Path $componentRoot 'prepared') -Force | Out-Null
$env:TEMP=Join-Path $runtimeRoot 'temp';$env:TMP=$env:TEMP
$manifest=Get-Content -LiteralPath (Join-Path $runtimeRoot 'inputs\accepted-p1\manifest.json') -Raw | ConvertFrom-Json
$config=Get-Content -LiteralPath (Join-Path $runtimeRoot 'inputs\accepted-p1\config.json') -Raw | ConvertFrom-Json
if((Get-FileHash -LiteralPath (Join-Path $runtimeRoot 'inputs\accepted-p1\config.json') -Algorithm SHA256).Hash.ToLowerInvariant() -ne 'dd5c519cd6d4b7295118e0a3a1063efed424a0ce739450bd5153c6a9941982db'){throw 'Config identity mismatch'}
$inverse=[double[]]@($manifest.projection.sourceToNative | ForEach-Object {foreach($cell in $_){[double]$cell}})
$forward=$manifest.projection.nativeToSource
$polygon=[double[]]@($manifest.projection.playableFloorNativePolygon | ForEach-Object {$x=$_[0];$y=$_[1];$w=$forward[2][0]*$x+$forward[2][1]*$y+$forward[2][2];($forward[0][0]*$x+$forward[0][1]*$y+$forward[0][2])/$w;($forward[1][0]*$x+$forward[1][1]*$y+$forward[1][2])/$w})
$nativeX=@($manifest.projection.playableFloorNativePolygon | ForEach-Object {$_[0]})
$nativeY=@($manifest.projection.playableFloorNativePolygon | ForEach-Object {$_[1]})
$originX=($nativeX | Measure-Object -Minimum).Minimum;$originY=($nativeY | Measure-Object -Minimum).Minimum
$pins=[double[]]@($config.board.pins | ForEach-Object {$_.x;$_.y;$_.r;[double]([int]$_.id.StartsWith('wood-'))})
Add-Type -AssemblyName System.Drawing
$warmup=[System.Drawing.Bitmap]::new(1,1);$warmup.Dispose()
$refs=@([AppDomain]::CurrentDomain.GetAssemblies() | Where-Object {-not $_.IsDynamic -and $_.Location} | ForEach-Object Location | Select-Object -Unique)
Add-Type -ReferencedAssemblies $refs -TypeDefinition @"
using System;
using System.Drawing;
using System.Drawing.Imaging;
using System.Runtime.InteropServices;
public static class P6GroundLayers {
 static bool Inside(double[] p,double x,double y){bool inside=false;int n=p.Length/2;for(int i=0,j=n-1;i<n;j=i++){double xi=p[i*2],yi=p[i*2+1],xj=p[j*2],yj=p[j*2+1];if((yi>y)!=(yj>y)&&x<(xj-xi)*(y-yi)/(yj-yi)+xi)inside=!inside;}return inside;}
 static double Mirror(double v){double r=v%2.0;if(r<0)r+=2.0;return r<=1?r:2-r;}
 static byte[] Pixels(Bitmap image){var data=image.LockBits(new Rectangle(0,0,image.Width,image.Height),ImageLockMode.ReadOnly,PixelFormat.Format32bppArgb);var bytes=new byte[Math.Abs(data.Stride)*image.Height];Marshal.Copy(data.Scan0,bytes,0,bytes.Length);image.UnlockBits(data);return bytes;}
 static double Sample(byte[] p,int w,int h,double x,double y,int channel){if(x<0||y<0||x>w-1||y>h-1)return 0;int x0=(int)x,y0=(int)y,x1=Math.Min(x0+1,w-1),y1=Math.Min(y0+1,h-1);double fx=x-x0,fy=y-y0;double top=p[(y0*w+x0)*4+channel]*(1-fx)+p[(y0*w+x1)*4+channel]*fx;double bottom=p[(y1*w+x0)*4+channel]*(1-fx)+p[(y1*w+x1)*4+channel]*fx;return top*(1-fy)+bottom*fy;}
 static void Save(byte[] pixels,int size,string path){using(var output=new Bitmap(size,size,PixelFormat.Format32bppArgb)){var data=output.LockBits(new Rectangle(0,0,size,size),ImageLockMode.WriteOnly,PixelFormat.Format32bppArgb);Marshal.Copy(pixels,0,data.Scan0,pixels.Length);output.UnlockBits(data);output.Save(path,ImageFormat.Png);}}
 public static void Render(string floorTexture,string shadowTexture,string floorOut,string shadowsOut,double[] inv,double[] poly,double[] pins,double ox,double oy){
  using(var floor=new Bitmap(floorTexture))using(var shadow=new Bitmap(shadowTexture)){
   var floorPixels=Pixels(floor);var shadowPixels=Pixels(shadow);int size=1536;var outFloor=new byte[size*size*4];var outShadow=new byte[size*size*4];
   for(int y=0;y<size;y++)for(int x=0;x<size;x++){
    double sx=x+0.5,sy=y+0.5;if(!Inside(poly,sx,sy))continue;
    double den=inv[6]*sx+inv[7]*sy+inv[8];double wx=(inv[0]*sx+inv[1]*sy+inv[2])/den,wy=(inv[3]*sx+inv[4]*sy+inv[5])/den;
    double tx=Mirror((wx-ox)/512.0)*(floor.Width-1),ty=Mirror((wy-oy)/512.0)*(floor.Height-1);int index=(y*size+x)*4;
    for(int c=0;c<3;c++)outFloor[index+c]=(byte)Math.Round(Sample(floorPixels,floor.Width,floor.Height,tx,ty,c));outFloor[index+3]=255;
    double alpha=0,blue=0,green=0,red=0;
    for(int i=0;i<pins.Length;i+=4){double r=pins[i+2],length=pins[i+3]>0?0.85:0.4;double cx=pins[i]-0.55*length*r,cy=pins[i+1]+0.83*length*r,rad=1.15*r;double ux=885.5+(wx-cx)*312/rad,uy=442+(wy-cy)*312/rad;if(ux<0||uy<0||ux>=shadow.Width||uy>=shadow.Height)continue;double aRaw=Sample(shadowPixels,shadow.Width,shadow.Height,ux,uy,3);if(aRaw<16)continue;double a=aRaw/255.0*0.42;blue=Sample(shadowPixels,shadow.Width,shadow.Height,ux,uy,0)*a+blue*(1-a);green=Sample(shadowPixels,shadow.Width,shadow.Height,ux,uy,1)*a+green*(1-a);red=Sample(shadowPixels,shadow.Width,shadow.Height,ux,uy,2)*a+red*(1-a);alpha=a+alpha*(1-a);}
    if(alpha>0){outShadow[index]=(byte)Math.Round(blue/alpha);outShadow[index+1]=(byte)Math.Round(green/alpha);outShadow[index+2]=(byte)Math.Round(red/alpha);outShadow[index+3]=(byte)Math.Round(alpha*255);}
   }
   Save(outFloor,size,floorOut);Save(outShadow,size,shadowsOut);var mask=(byte[])outFloor.Clone();for(int k=0;k<mask.Length;k+=4){mask[k]=255;mask[k+1]=255;mask[k+2]=255;}Save(mask,size,floorOut.Replace("floor-layer-v01.png","floor-mask-v01.png"));
  }
 }
}
"@
$floorOut=Join-Path $componentRoot 'prepared\floor-layer-v01.png'
$shadowOut=Join-Path $componentRoot 'prepared\ground-shadows-v01.png'
[P6GroundLayers]::Render((Join-Path $componentRoot 'raw\floor-material-v01.png'),(Join-Path $assetRoot 'raw\ball-shadow-v01.png'),$floorOut,$shadowOut,$inverse,$polygon,$pins,$originX,$originY)
$preview=[System.Drawing.Bitmap]::new($floorOut);$shadowLayer=[System.Drawing.Bitmap]::new($shadowOut);$g=[System.Drawing.Graphics]::FromImage($preview);$g.DrawImageUnscaled($shadowLayer,0,0);$g.Dispose();$preview.Save((Join-Path $componentRoot 'prepared\floor-shadow-preview-v01.png'),[System.Drawing.Imaging.ImageFormat]::Png);$shadowLayer.Dispose();$preview.Dispose()
$record=[ordered]@{schema='r4d.p6.ground-layers.v1';acceptedP1='4b47db04c7140ebf88f69b91faa0b790d46f22ec';canvas=@(1536,1536);sourceToNative=$manifest.projection.sourceToNative;floorPolygonSource=$polygon;materialOriginNative=@($originX,$originY);materialPeriodNative=512;materialWrap='mirrored repeat, no crop/local fitting of a whole-board image';shadowInstances=$config.board.pins.Count;shadowLightDirectionNative=@(-0.55,0.83);shadowLengthRadiusFactors=[ordered]@{wood=0.85;others=0.4};shadowRadiusFactor=1.15;shadowOpacity=0.42;shadowAlphaCutoffRaw=16;shadowSource='own native ball-shadow-v01.png, re-used as separate ground mask';floorBakedShadow=$false;dynamicBallShadowClip=[ordered]@{mask='prepared/floor-mask-v01.png';scope='dynamic ground shadow only, never the ball body';rule='Clip the projected ball shadow to this accepted-floor mask. Outside the floor, including the board-to-receiver gap, there is no ground shadow surface. Disable this art mask together with Art.'};method='Per output pixel, exact frozen inverse homography samples generated raster material and ground shadow patches inside exact accepted floor polygon; no collider/projection change';files=@(foreach($file in @('floor-layer-v01.png','floor-mask-v01.png','ground-shadows-v01.png','floor-shadow-preview-v01.png')){[ordered]@{path=('prepared/'+$file);sha256=(Get-FileHash -LiteralPath (Join-Path $componentRoot ('prepared\'+$file)) -Algorithm SHA256).Hash.ToLowerInvariant();bytes=(Get-Item -LiteralPath (Join-Path $componentRoot ('prepared\'+$file))).Length}})}
$json=($record|ConvertTo-Json -Depth 10).Replace("`r`n","`n")
[System.IO.File]::WriteAllText((Join-Path $componentRoot 'FLOOR_PACKET_V01.json'),$json+"`n",[System.Text.UTF8Encoding]::new($false))
$record.files | ConvertTo-Json -Depth 4
