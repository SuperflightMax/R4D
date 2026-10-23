param([switch]$Early)
$ErrorActionPreference = 'Stop'
Add-Type -AssemblyName System.Drawing.Common
$sourceCode = @'
using System;
using System.Drawing;
using System.Drawing.Imaging;
using System.Runtime.InteropServices;
public static class Q4Extract {
  public static byte[] Pixels(Bitmap b) {
    var d=b.LockBits(new Rectangle(0,0,b.Width,b.Height),ImageLockMode.ReadOnly,PixelFormat.Format32bppArgb);
    var a=new byte[d.Stride*b.Height]; Marshal.Copy(d.Scan0,a,0,a.Length); b.UnlockBits(d);return a;
  }
  public static void Save(byte[] a,int w,int h,string path) {
    using(var b=new Bitmap(w,h,PixelFormat.Format32bppArgb)) {
      var d=b.LockBits(new Rectangle(0,0,w,h),ImageLockMode.WriteOnly,PixelFormat.Format32bppArgb);
      Marshal.Copy(a,0,d.Scan0,a.Length);b.UnlockBits(d);b.Save(path,ImageFormat.Png);
    }
  }
  public static byte[] Mask(int w,int h,float[] xy) {
    if(xy.Length<6)return new byte[w*h*4];
    using(var b=new Bitmap(w,h,PixelFormat.Format32bppArgb)) {
      using(var g=Graphics.FromImage(b)) {
        var pts=new PointF[xy.Length/2];for(int i=0;i<pts.Length;i++)pts[i]=new PointF(xy[i*2],xy[i*2+1]);
        g.FillPolygon(Brushes.White,pts);
      } return Pixels(b);
    }
  }
  public static long[] Extract(string source,string edit,string output,string sourceMask,string hiddenMask,string genMask,int x0,int y0,int cw,int ch,float[] xy,float[] genxy,double[][] fills) {
    using(var src=new Bitmap(source)) using(var ed=new Bitmap(edit)) {
      int w=src.Width,h=src.Height;var a=Pixels(src);var e=Pixels(ed);var m=Mask(w,h,xy);var gm=Mask(w,h,genxy);
      for(int z=0;z<gm.Length;z+=4)if(m[z+3]==0)gm[z]=gm[z+1]=gm[z+2]=gm[z+3]=0;
      var dst=new byte[cw*ch*4];var sm=new byte[w*h*4];var hm=new byte[w*h*4];long exact=0,clone=0,gen=0;
      for(int y=y0;y<y0+ch;y++)for(int x=x0;x<x0+cw;x++) {
        if(x<0||x>=w||y<0||y>=h)continue;
        int s=(y*w+x)*4,t=((y-y0)*cw+(x-x0))*4;
        bool generated=gm[s+3]>0&&m[s+3]>0; bool original=m[s+3]>0&&!generated;
        if(original){Array.Copy(a,s,dst,t,4);sm[s]=sm[s+1]=sm[s+2]=sm[s+3]=255;exact++;}
        else if(generated){Array.Copy(e,s,dst,t,4);hm[s]=hm[s+1]=hm[s+2]=hm[s+3]=255;gen++;}
        else foreach(var f in fills) {
          double dx=(x-f[0])/f[2],dy=(y-f[1])/f[3];if(dx*dx+dy*dy>1)continue;
          int sx=(int)(f[4]+(dx+1)*.5*(f[6]-1)),sy=(int)(f[5]+(dy+1)*.5*(f[7]-1));
          int z=(sy*w+sx)*4;Array.Copy(a,z,dst,t,4);hm[s]=hm[s+1]=hm[s+2]=hm[s+3]=255;clone++;break;
        }
      }
      Save(dst,cw,ch,output);Save(sm,w,h,sourceMask);Save(hm,w,h,hiddenMask);Save(gm,w,h,genMask);
      return new long[]{exact,clone,gen};
    }
  }
}
'@
Add-Type -TypeDefinition $sourceCode -ReferencedAssemblies (@([System.Drawing.Bitmap].Assembly.Location,[System.Drawing.PointF].Assembly.Location,[System.Runtime.InteropServices.Marshal].Assembly.Location) + @(Get-ChildItem "$PSHOME/System.Private.Windows*.dll" | ForEach-Object FullName))
$assets = $PSScriptRoot
$root = Split-Path $assets
$plan = Get-Content -Raw "$assets/parts-plan.json" | ConvertFrom-Json
$source = "$assets/source/whole-original.png"
$edit = "$assets/source/torso-local-fill.png"
$expected = 'B1A83019511EFA33A5D6B7380FC361F171C7B8D2BC82F49AB71B45D130620615'
if ((Get-FileHash $source -Algorithm SHA256).Hash -ne $expected) { throw 'Exact whole changed' }
$null = New-Item -ItemType Directory -Force -Path "$root/public/art/parts","$assets/masks"
$ids = @('torso','head','thighNear','shinNear','footNear')
$selected = @($plan.parts | Where-Object { !$Early -or $_.id -in $ids })
$manifestParts = @()
foreach ($p in $selected) {
  $allX = @($p.polygon | ForEach-Object { $_[0] })
  $allY = @($p.polygon | ForEach-Object { $_[1] })
  foreach ($f in $p.fills) { $allX += @((($f[0])-($f[2])),(($f[0])+($f[2])));$allY += @((($f[1])-($f[3])),(($f[1])+($f[3]))) }
  foreach ($v in $p.generativePolygon) { $allX += $v[0];$allY += $v[1] }
  $x0=[int][Math]::Floor(($allX | Measure-Object -Minimum).Minimum)-3
  $y0=[int][Math]::Floor(($allY | Measure-Object -Minimum).Minimum)-3
  $cw=[int][Math]::Ceiling(($allX | Measure-Object -Maximum).Maximum)-$x0+4
  $ch=[int][Math]::Ceiling(($allY | Measure-Object -Maximum).Maximum)-$y0+4
  [float[]]$poly=@($p.polygon | ForEach-Object { $_[0];$_[1] })
  [float[]]$genpoly=@($p.generativePolygon | ForEach-Object { if($null -ne $_) { $_[0];$_[1] } })
  [double[][]]$fills=@($p.fills | ForEach-Object { ,([double[]]$_) })
  $counts=[Q4Extract]::Extract($source,$edit,"$root/public/art/parts/$($p.id).png","$assets/masks/$($p.id)-source.png","$assets/masks/$($p.id)-hidden.png","$assets/masks/$($p.id)-generative.png",$x0,$y0,$cw,$ch,$poly,$genpoly,$fills)
  $parentPivot = $plan.root
  if($null -ne $p.parent) { $parentPivot=($plan.parts | Where-Object id -eq $p.parent).pivot }
  $manifestParts += [ordered]@{
    id=$p.id;file="art/parts/$($p.id).png";parent=$p.parent
    joint=@(($p.pivot[0]-$parentPivot[0]),($p.pivot[1]-$parentPivot[1]))
    pivot=@(($p.pivot[0]-$x0),($p.pivot[1]-$y0));layer=$p.layer;size=@($cw,$ch)
    source='assets/source/whole-original.png';sourceSha256=$expected.ToLower();sourcePivot=$p.pivot
    sourceCrop=@($x0,$y0,$cw,$ch);technicalScale=@(1,1);sourceMask="assets/masks/$($p.id)-source.png"
    hiddenMask="assets/masks/$($p.id)-hidden.png";generativeMask="assets/masks/$($p.id)-generative.png"
    exactSourcePixels=$counts[0];clonedHiddenPixels=$counts[1];generatedHiddenPixels=$counts[2]
    hiddenCloneEllipses=$p.fills
  }
}
$manifest=[ordered]@{version=1;character='Лесной путешественник — exact whole Q4';facing='right';targetDisplayHeight=360;sourceSize=@(1024,1536);sourceRoot=$plan.root;coordinates='+X right, +Y down; same original pixels, cropped only; joint relative to parent pivot';parts=$manifestParts}
$name=if($Early){'manifest-early.json'}else{'manifest.json'}
$manifest | ConvertTo-Json -Depth 20 | Set-Content "$root/public/art/$name" -Encoding utf8
$manifestParts | ForEach-Object { [pscustomobject]$_ } | Select-Object id,size,exactSourcePixels,clonedHiddenPixels,generatedHiddenPixels | Format-Table -AutoSize
