$ErrorActionPreference='Stop'
$root=Split-Path -Parent $PSScriptRoot;$c=Join-Path $root 'components-v01';$runtime='E:\R4D\perspective\p6-runtime\asset-artist'
$env:TEMP=Join-Path $runtime 'temp';$env:TMP=$env:TEMP
$cfg=Get-Content -LiteralPath ($runtime+'\inputs\accepted-p1\config.json') -Raw|ConvertFrom-Json
$manifest=Get-Content -LiteralPath ($runtime+'\inputs\accepted-p1\manifest.json') -Raw|ConvertFrom-Json;$h=$manifest.projection.nativeToSource
function P([double]$x,[double]$y){$d=$h[2][0]*$x+$h[2][1]*$y+$h[2][2];$px=($h[0][0]*$x+$h[0][1]*$y+$h[0][2])/$d;$py=($h[1][0]*$x+$h[1][1]*$y+$h[1][2])/$d;return ,@($px,$py)}
function SaveJson($name,$value){[IO.File]::WriteAllText((Join-Path $c $name),($value|ConvertTo-Json -Depth 12).Replace("`r`n","`n")+"`n",[Text.UTF8Encoding]::new($false))}
function Hash($path){(Get-FileHash -LiteralPath $path -Algorithm SHA256).Hash.ToLowerInvariant()}
$variants=@();foreach($name in @('frog-support-far-v03','frog-support-near-v02')){$base=Get-Content -LiteralPath ($c+'\'+$name+'-base.json') -Raw|ConvertFrom-Json;$alpha=Get-Content -LiteralPath ($c+'\'+$name+'-alpha.json') -Raw|ConvertFrom-Json;$ids=if($name -match 'far'){@('frog-01','frog-02','frog-03')}else{@('frog-04','frog-05')};$variants += [ordered]@{id=$name;family='frog';instances=$ids;texture=('raw/'+$name+'.png');sha256=(Hash ($c+'\raw\'+$name+'.png'));canvas=$alpha.canvas;groundAnchorPx=$base.centerPx;baseEllipse=[ordered]@{centerPx=$base.centerPx;radiusXPx=$base.radiusXPx;radiusYPx=$base.radiusYPx;lowerRimFitRmsPx=$base.lowerRimFitRmsPx};visibleTopY=$base.visualTopY;visibleHeightAboveGroundPx=$base.visibleHeightAboveGroundPx;alphaDiagnostics=$alpha}}
$frogs=@();foreach($pin in $cfg.board.pins|Where-Object{$_.id.StartsWith('frog-')}){$v=@($variants|Where-Object{$_.instances -contains $pin.id})[0];$centre=P $pin.x $pin.y;$a=P ($pin.x-$pin.r) $pin.y;$b=P ($pin.x+$pin.r) $pin.y;$rx=($b[0]-$a[0])/2;$front=P $pin.x ($pin.y+$pin.r);$scale=$rx/$v.baseEllipse.radiusXPx;$pred=$centre[1]+$scale*$v.baseEllipse.radiusYPx;$frogs += [ordered]@{id=$pin.id;variant=$v.id;nativeCentre=@($pin.x,$pin.y);nativeRadius=$pin.r;sourceGroundCentre=$centre;uniformScale=$scale;targetProjectedNearY=$front[1];fittedNearY=$pred;fittedNearExtentErrorPx=($pred-$front[1]);meaning='Own raster lower-rim fit versus exact P1 projection; arithmetic/static rehearsal, actual new browser frame still required'}}
$frogPacket=[ordered]@{schema='r4d.p6.frog-support-depth-variants.v2';status='Two actual native artistic depth variants; actual assembled far/near review pending';acceptedP1='4b47db04c7140ebf88f69b91faa0b790d46f22ec';configSha256=(Hash ($runtime+'\inputs\accepted-p1\config.json'));supersedes='frog master in OBSTACLE_MASTERS_V01 only; woodV02/flower/leaf unchanged';variants=$variants;instances=$frogs;placementRule='Choose explicitly listed variant by fixed ID. Place its measured lower-rim ellipse centre at exact P(pin centre). Uniform scale=projected horizontal radius/baseEllipse.radiusXPx. Never independently scale axes or alter geometry.';limits=@('New native edits keep friendly frog identity/material but do not preserve head pixels/height exactly; actual heights are explicit.','Far variant measured aspect0.4704, near0.5624; requested0.50/0.55 were not achieved exactly.','The maximum remaining fitted near-edge gap is approximately2.21 source pixels on frog03; this is disclosed, not an artistic PASS.','Raw alpha<16 contains faint isolated native fringes; alpha diagnostics retained.')}
SaveJson 'FROG_SUPPORT_PACKET_V02.json' $frogPacket

Add-Type -AssemblyName System.Drawing
$warmup=[Drawing.Bitmap]::new(1,1);$warmup.Dispose();$refs=@([AppDomain]::CurrentDomain.GetAssemblies()|Where-Object{-not $_.IsDynamic -and $_.Location}|ForEach-Object Location|Select-Object -Unique)
Add-Type -ReferencedAssemblies $refs -TypeDefinition @'
using System;
using System.Drawing;
using System.Drawing.Imaging;
using System.Runtime.InteropServices;
public static class P6ReceiverRepair {
 static byte[] Pixels(Bitmap b){var d=b.LockBits(new Rectangle(0,0,b.Width,b.Height),ImageLockMode.ReadOnly,PixelFormat.Format32bppArgb);byte[] p=new byte[Math.Abs(d.Stride)*b.Height];Marshal.Copy(d.Scan0,p,0,p.Length);b.UnlockBits(d);return p;}
 static Bitmap From(byte[] p,int w,int h){var b=new Bitmap(w,h,PixelFormat.Format32bppArgb);var d=b.LockBits(new Rectangle(0,0,w,h),ImageLockMode.WriteOnly,PixelFormat.Format32bppArgb);Marshal.Copy(p,0,d.Scan0,p.Length);b.UnlockBits(d);return b;}
 public static void DrawMaster(Graphics g,Bitmap b,double x,double y,double s,double ax,double ay){g.DrawImage(b,new RectangleF((float)(x-ax*s),(float)(y-ay*s),(float)(b.Width*s),(float)(b.Height*s)));}
 public static void Build(string rawPath,string output,double cx,double cy,double rx,double ry,double[] instances){
  using(var raw=new Bitmap(rawPath)){int w=raw.Width,h=raw.Height;var p=Pixels(raw);var back=new byte[p.Length];var front=new byte[p.Length];var cut=new int[w];
   for(int x=0;x<w;x++){double u=(x-cx)/rx;double guide=cy;if(Math.Abs(u)<1)guide+=ry*Math.Sqrt(1-u*u);int first=h;int start=Math.Max((int)cy,(int)(guide-45));for(int y=start;y<h;y++){int i=(y*w+x)*4;double l=.2126*p[i+2]+.7152*p[i+1]+.0722*p[i];if(p[i+3]>=128&&l>=100&&p[i+2]>=130){first=y;break;}}cut[x]=first;}
   var smooth=new int[w];for(int x=0;x<w;x++){var values=new int[9];for(int j=0;j<9;j++)values[j]=cut[Math.Max(0,Math.Min(w-1,x+j-4))];Array.Sort(values);smooth[x]=values[4];}
   for(int y=0;y<h;y++)for(int x=0;x<w;x++){int i=(y*w+x)*4;if(p[i+3]<16)continue;var target=y>=smooth[x]?front:back;for(int k=0;k<4;k++)target[i+k]=p[i+k];}
   using(var rear=From(back,w,h))using(var fore=From(front,w,h)){
    rear.Save(output+"/receiver-rear-master-v03.png",ImageFormat.Png);fore.Save(output+"/receiver-front-master-v03.png",ImageFormat.Png);
    for(int n=0;n<instances.Length/3;n++){for(int side=0;side<2;side++){using(var layer=new Bitmap(1536,1536,PixelFormat.Format32bppArgb))using(var g=Graphics.FromImage(layer)){g.InterpolationMode=System.Drawing.Drawing2D.InterpolationMode.HighQualityBicubic;DrawMaster(g,side==0?rear:fore,instances[n*3],instances[n*3+1],instances[n*3+2],cx,cy);layer.Save(output+"/receiver-0"+(n+1)+(side==0?"-rear-v02.png":"-front-v02.png"),ImageFormat.Png);}}}
   }
  }
 }
 public static void Rehearse(string directory,string ballFile,string output,double bx,double by,double br,double nativeY,double[] depths){
  using(var scene=new Bitmap(1536,1536,PixelFormat.Format32bppArgb))using(var g=Graphics.FromImage(scene))using(var ball=new Bitmap(ballFile)){
   g.Clear(Color.FromArgb(26,48,48));g.InterpolationMode=System.Drawing.Drawing2D.InterpolationMode.HighQualityBicubic;
   for(int phase=0;phase<2;phase++){
    for(int i=0;i<8;i++){if((depths[i]<=nativeY)!=(phase==0))continue;string file=directory+"/receiver-0"+(i/2+1)+(i%2==0?"-rear-v02.png":"-front-v02.png");using(var b=new Bitmap(file))g.DrawImageUnscaled(b,0,0);}
    if(phase==0)DrawMaster(g,ball,bx,by,br/428.0,626,636.5);
   }
   using(var font=new Font("Arial",17))g.DrawString("STATIC ART REHEARSAL — frozen native-state coordinates, not a browser frame",font,Brushes.White,30,1460);
   scene.Save(output,ImageFormat.Png);
  }
 }
}
'@
$cx=770.0;$cy=393.0;$rx=507.0;$ry=287.0
$receivers=@();$transforms=@();$depths=@();$layers=@()
foreach($bucket in $cfg.board.buckets){$centre=P $bucket.x $bucket.y;$a=P ($bucket.x-$bucket.r) $bucket.y;$b=P ($bucket.x+$bucket.r) $bucket.y;$captureRx=($b[0]-$a[0])/2;$scale=$captureRx/$rx;$rearDepth=$bucket.y-$bucket.r;$frontDepth=$bucket.y+$bucket.r;$receivers += [ordered]@{id=$bucket.id;nativeCentre=@($bucket.x,$bucket.y);nativeCaptureRadius=$bucket.r;mouthCentreSource=$centre;captureRadiusXSource=$captureRx;uniformScale=$scale;rearDepthNativeY=$rearDepth;frontDepthNativeY=$frontDepth;ropeLoopsRawPx=@(@(165,225),@(1375,225))};$transforms+=$centre[0];$transforms+=$centre[1];$transforms+=$scale;$depths+=$rearDepth;$depths+=$frontDepth;foreach($side in @('rear','front')){$depth=if($side -eq 'rear'){$rearDepth}else{$frontDepth};$layers += [ordered]@{id=($bucket.id+'-'+$side);texture=('prepared/'+$bucket.id+'-'+$side+'-v02.png');sourceOrigin=@(0,0);depthNativeY=$depth;role=$side}}}
[P6ReceiverRepair]::Build(($c+'\raw\receiver-master-v03.png'),($c+'\prepared'),$cx,$cy,$rx,$ry,[double[]]$transforms)
foreach($layer in $layers){$layer.sha256=Hash (Join-Path $c $layer.texture)}
$retained=@();$receiptRoot='E:\R4D\perspective\p6-runtime\visual-qa\integration-05-receivers\live'
foreach($name in @('last-approach-seed0-state1950','last-approach-seed0-state1953','last-approach-seed0-state1956','partial-front-seed1-state1680','under-front-seed1-state1690','miss-approach-seed1-state1700','partial-front-seed2-state1233','under-front-seed2-state1242','miss-approach-seed2-state1255')){
 $data=Get-Content -LiteralPath ($receiptRoot+'\'+$name+'.json') -Raw|ConvertFrom-Json;$ball=$data.render.ball;$native=$data.native.ball.pos;$file='prepared/receiver-rehearsal-'+$name+'-v02.png'
 [P6ReceiverRepair]::Rehearse(($c+'\prepared'),(Join-Path $root 'raw\ball-v01.png'),(Join-Path $c $file),$ball.center[0],$ball.center[1],$ball.visibleRadius,$native.y,[double[]]$depths)
 $retained += [ordered]@{state=$name;nativeCentre=@($native.x,$native.y);projectedNativeCentre=$data.render.projectedNativeCenter;ballCentreSource=$ball.center;visibleRadius=$ball.visibleRadius;staticArtRehearsal=$file;actualNewBrowserReview='pending with Builder; retained native receipts read only, no held QA report copied'}
}
$packet=[ordered]@{schema='r4d.p6.receiver-layer-contract.v2';status='Causal aperture/camera/depth repair after actual capture0/miss1/miss2; new actual assembled review required';acceptedP1='4b47db04c7140ebf88f69b91faa0b790d46f22ec';supersedes='RECEIVER_PACKET_V01 and both combined front/rear layers for consumer rendering';raw='raw/receiver-master-v03.png';rawSha256=(Hash ($c+'\raw\receiver-master-v03.png'));toolOutputId='exec-518cfe39-9815-4357-b39e-7e56293adde1';mouthAnchorPx=@($cx,$cy);mouthEllipseMeasuredApprox=[ordered]@{radiusX=$rx;radiusY=$ry;aspect=$ry/$rx;basis='Measured visible inner-lip guide of actual native camera edit, approximate, not a proof of exact projection'};apertureFactor=1.0;instances=$receivers;layers=$layers;sortRule='Sort all8 receiver parts and ball by ascending native Y. rearDepth=captureCy-captureR; frontDepth=captureCy+captureR. A part with depth<=ball.nativeY draws below ball; a part with depth>ball.nativeY draws above. Use these same fixed thresholds for every state/seed/outcome.';sortTieRule='Receiver part before ball at equal depth';splitMethod='Actual raw stone/gold front rim, luminance edge within45 raw pixels of measured ellipse guide, median9 columns. Front/rear are complementary raw-alpha partitions, alpha<16 removed; no opening enlargement.';sourceRegistration='Every layer1536-square at source0/0; mouthAnchor maps exactly to P(unchanged capture centre); all sprite scaling uniform; ball packetV03 unchanged.';rehearsals=$retained;limits=@('No outcome-based sink, position, opacity, mask or draw-order rule.','Raw mouth aspect~0.566 differs slightly from projected capture~0.603–0.607; exact visible rim checks and retained actual approaches remain required.','Static art rehearsals are own recompositions from frozen actual-state coordinates, not newly observed simulation or screenshots.','Earlier512 dark sample inclusion was insufficient and is not repeated as semantic proof.','Capture0 terminal may still show sphere at the far rim; actual visual acceptance remains independent.')}
SaveJson 'RECEIVER_PACKET_V02.json' $packet
[pscustomobject]@{frogs=$frogs|Select-Object id,variant,fittedNearExtentErrorPx;receiverInstances=$receivers|Select-Object id,uniformScale,rearDepthNativeY,frontDepthNativeY;packetHashes=@((Hash ($c+'\FROG_SUPPORT_PACKET_V02.json')),(Hash ($c+'\RECEIVER_PACKET_V02.json')))}|ConvertTo-Json -Depth 6
