$ErrorActionPreference='Stop';$taskOwn='E:/R4D/perspective/p5-worktrees/asset-artist/experiments/p5-regenerated-objects/transfer-water-dark/dark/asset-artist';$taskRuntime='E:/R4D/perspective/p5-runtime/asset-artist/transfer-water-dark/dark';$env:TEMP=Join-Path $taskRuntime 'temp';$env:TMP=$env:TEMP
Add-Type -AssemblyName System.Drawing
$taskRefs=@(Get-ChildItem (Join-Path $PSHOME 'ref') -Filter '*.dll' -File|Select-Object -ExpandProperty FullName)+@([Drawing.Bitmap].Assembly.Location,(Join-Path $PSHOME 'System.Private.Windows.GdiPlus.dll'),(Join-Path $PSHOME 'System.Private.Windows.Core.dll'))
Add-Type -TypeDefinition @'
using System;
using System.Drawing;
using System.Collections.Generic;
public static class P5RimUniformRegistration {
 static int[] Edges(Bitmap b,int y){int l=-1,r=-1;for(int x=0;x<b.Width;x++){if(b.GetPixel(x,y).A>=128){l=x;break;}}for(int x=b.Width-1;x>=0;x--){if(b.GetPixel(x,y).A>=128){r=x;break;}}return new[]{l,r};}
 static int Top(Bitmap b){for(int y=100;y<300;y++)if(b.GetPixel(627,y).A>=128)return y;return -1;}
 static int WarmEnd(Bitmap b,int x,int lo,int hi){int result=-1;for(int y=lo;y<=hi;y++){var c=b.GetPixel(x,y);if(c.A>=128&&c.R>=140&&c.G>=100&&c.R>c.G+12&&c.G>c.B+10)result=y;}return result;}
 public static object Fit(string full,string rim){using(var a=new Bitmap(full))using(var b=new Bitmap(rim)){
  int[] rows={180,200,225,250,300,350,400,450,500,550,575,600,650,700,750};
  var ae=new Dictionary<int,int[]>();var be=new Dictionary<int,int[]>();foreach(int y in rows)ae[y]=Edges(a,y);for(int y=100;y<1000;y++)be[y]=Edges(b,y);
  int[] ay={Top(a),WarmEnd(a,627,150,350)};
  int[] by={Top(b),WarmEnd(b,627,150,350)};
  foreach(int q in ay)if(q<0)throw new Exception("Missing full landmark");foreach(int q in by)if(q<0)throw new Exception("Missing rim landmark");
  double best=double.MaxValue,bk=0,btx=0,bty=0;
  for(int ki=1000;ki<=1080;ki++){double k=ki/1000.0;for(int ti=-60;ti<=60;ti++){double ty=ti*.5,tx=0;int n=0;foreach(int y in rows){int yy=(int)Math.Round(k*y+ty);var e=be[yy];if(e[0]<0)continue;tx+=e[0]-k*ae[y][0];tx+=e[1]-k*ae[y][1];n+=2;}if(n!=2*rows.Length)continue;tx/=n;double sse=0;foreach(int y in rows){var e=be[(int)Math.Round(k*y+ty)];for(int side=0;side<2;side++){double d=e[side]-(k*ae[y][side]+tx);sse+=d*d;}}for(int j=0;j<ay.Length;j++){double d=by[j]-(k*ay[j]+ty);sse+=4*d*d;}if(sse<best){best=sse;bk=k;btx=tx;bty=ty;}}}
  var samples=new List<object>();double max=0;foreach(int y in rows){int yy=(int)Math.Round(bk*y+bty);var e=be[yy];double dl=e[0]-(bk*ae[y][0]+btx),dr=e[1]-(bk*ae[y][1]+btx);max=Math.Max(max,Math.Max(Math.Abs(dl),Math.Abs(dr)));samples.Add(new{fullY=y,rimY=yy,fullEdges=ae[y],rimEdges=e,deltaLeft=dl,deltaRight=dr});}var ys=new List<object>();for(int j=0;j<ay.Length;j++){double d=by[j]-(bk*ay[j]+bty);max=Math.Max(max,Math.Abs(d));ys.Add(new{fullY=ay[j],rimY=by[j],residual=d});}
  return new{uniformScale=bk,translationTexturePx=new[]{btx,bty},weightedRmsTexturePx=Math.Sqrt(best/(2*rows.Length+4*ay.Length)),maxSampledResidualTexturePx=max,outerContourSamples=samples,verticalLandmarks=ys,opticalOpeningPointPx=new[]{bk*627.5+btx,bk*440+bty},captureProxyWidthPx=bk*330,captureProxyDepthPx=bk*223};
 }}
}
'@ -ReferencedAssemblies $taskRefs
$taskFit=[P5RimUniformRegistration]::Fit((Join-Path $taskRuntime 'raw/receiver-v1.png'),(Join-Path $taskRuntime 'raw/receiver-back-rim-v1.png'))
$taskOut=[ordered]@{method='Равномерная регистрация НОВОГО native rim в frame исходного full по внешним alpha>=128 contours и warm masonry landmarks; один k и2D translation, rotation0. Только metadata, PNG bytes не изменены. Никаких source/native/seed/tick fitting.';fullSha256='bf3f2fa5143bf6180dcf44f80e711bb97094e2eefdf24c1b0dab6f6d5bd13a6b';rimSha256='5f00b57501ec52eb879ba6219d77034bee172c3ff580d2487581cd7406b573c1';mapping='p_rim=k*p_full+t; rimW=k*330,rimD=k*223,O_rim=k*O_full+t,hR_rim=k*hR_full,A_rim=O_rim+[0,hR_rim]. Поэтому source optical O всех3parts совпадает при обычном target-bound uniform mapping.';fit=$taskFit;limitations=@('Новый рисунок не точная uniform copy: residual/uncertainty сохраняются; нет pixel identity или recovered3D.','Нативный rimv2 изменил composition ещё сильнее, сохранён как nonselected, не подменяет v1.','Source registration/pixel/legitimate wall partial occlusion требуют actual QA.');actualQa=$false;pngMutation=$false}
$taskOut|ConvertTo-Json -Depth 12|Set-Content (Join-Path $taskOwn 'records/receiver-rim-uniform-registration.v1.json') -Encoding utf8NoBOM
$taskFit|Select-Object uniformScale,translationTexturePx,weightedRmsTexturePx,maxSampledResidualTexturePx,opticalOpeningPointPx,captureProxyWidthPx,captureProxyDepthPx|ConvertTo-Json -Depth 4
