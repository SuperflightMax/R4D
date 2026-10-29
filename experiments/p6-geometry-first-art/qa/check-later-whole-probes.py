"""Limited, representative registration review of frozen whole-image v02/v03."""
import argparse,hashlib,json,subprocess
from pathlib import Path
from PIL import Image,ImageDraw,ImageFont
COMMIT='da4cae189c3a103bc84909de8cbc4f4b6daed86a'
EXPECTED={'v02':'539e4b1cbbcca9931dcc5c1bfaedc680de03720a21d9c82148cfb74b1198680f','v03':'86a781198ba09b92ebbf16ce033784805cfcdd29d75ec28b2214521fbd79b501'}
p=argparse.ArgumentParser();p.add_argument('--worktree',required=True);p.add_argument('--runtime',required=True);a=p.parse_args()
wd=Path(a.worktree);rt=Path(a.runtime);qa=wd/'experiments/p6-geometry-first-art/qa';out=qa/'whole-v02-v03';out.mkdir(exist_ok=True)
geo=json.loads((qa/'registration-landmarks.json').read_bytes());inv=json.loads((qa/'draft-v01-check.json').read_bytes())['inverseFloor'];font=ImageFont.truetype(r'C:\Windows\Fonts\arial.ttf',16)
results=[]
for version,expected in EXPECTED.items():
 source='experiments/p6-geometry-first-art/asset-artist/raw/whole-board-'+version+'.png'
 raw=subprocess.run(['git','-C',str(wd),'show',COMMIT+':'+source],cwd=wd,capture_output=True,check=True).stdout
 assert hashlib.sha256(raw).hexdigest()==expected
 local=rt/'frozen'/COMMIT/('whole-board-'+version+'.png');assert local.read_bytes()==raw
 image=Image.open(local);assert image.size==(1254,1254)
 art=image.convert('RGB').resize((1536,1536),Image.Resampling.LANCZOS);overlay=art.copy();d=ImageDraw.Draw(overlay)
 for p in geo['landmarks']:
  ring=[tuple(q) for q in p['sourceContour']];d.line(ring+[ring[0]],fill='#00ffff' if p['kind']=='pin' else '#ff00ff',width=2)
  x,y=p['sourceCenter'];d.text((x,y+25),p['id'],font=font,anchor='mt',fill='white',stroke_width=2,stroke_fill='black')
 for s in geo['segments']:d.line([tuple(q) for q in s['source']],fill='#ff00ff',width=2)
 floor=[tuple(q) for q in geo['floor']];d.line(floor+[floor[0]],fill='#00ff80',width=2)
 x,y=geo['start']['source'];d.ellipse((x-4,y-4,x+4,y+4),outline='yellow',width=2)
 overlay.save(out/(version+'-overlay.png'))
 P=inv['outputToSourceMatrix'];W,H=inv['dimensions'];coeff=[P[0][0]/P[2][2],P[0][1]/P[2][2],P[0][2]/P[2][2],P[1][0]/P[2][2],P[1][1]/P[2][2],P[1][2]/P[2][2],P[2][0]/P[2][2],P[2][1]/P[2][2]]
 flat=art.transform((W,H),Image.Transform.PERSPECTIVE,coeff,Image.Resampling.BICUBIC,fillcolor='#bacbd1');fd=ImageDraw.Draw(flat);scale=inv['scale'];ox,oy=inv['offset']
 for p in geo['landmarks']:
  cx=p['nativeCenter'][0]*scale+ox;cy=p['nativeCenter'][1]*scale+oy;r=p['nativeRadius']*scale;fd.ellipse((cx-r,cy-r,cx+r,cy+r),outline='#00ffff' if p['kind']=='pin' else '#ff00ff',width=2)
 for s in geo['segments']:fd.line([(p[0]*scale+ox,p[1]*scale+oy) for p in s['native']],fill='#ff00ff',width=2)
 flat.save(out/(version+'-inverse-floor.png'))
 sheet=Image.new('RGB',(1280,260),'#222222')
 for i,p in enumerate([p for p in geo['landmarks'] if p['kind']=='bucket']):
  cx,cy=[round(v) for v in p['sourceCenter']];left=cx-160;top=cy-140;panel=art.crop((left,top,left+320,top+230));pd=ImageDraw.Draw(panel)
  for xx in range((left//20+1)*20,left+320,20):pd.line([(xx-left,0),(xx-left,229)],fill='#aaaaaa');pd.text((xx-left+1,1),str(xx),fill='black',stroke_width=1,stroke_fill='white')
  for yy in range((top//20+1)*20,top+230,20):pd.line([(0,yy-top),(319,yy-top)],fill='#aaaaaa');pd.text((1,yy-top+1),str(yy),fill='black',stroke_width=1,stroke_fill='white')
  sheet.paste(panel,(i*320,30));ImageDraw.Draw(sheet).text((i*320+5,5),p['id'],font=font,fill='white')
 sheet.save(out/(version+'-mouths.png'))
 results.append({'version':version,'sourceCommit':COMMIT,'source':source,'rawSha256':expected,'rawBytes':len(raw),'rawDimensions':[1254,1254],'registration':'uniform full-frame 1536/1254; zero translation, no crop or fitting'})
for r in results:
 r['diagnostics']=[{'file':f.name,'sha256':hashlib.sha256(f.read_bytes()).hexdigest(),'bytes':f.stat().st_size} for f in sorted(out.glob(r['version']+'-*.png'))]
(out/'diagnostics.json').write_bytes((json.dumps(results,indent=2)+'\n').encode('utf8'))
print(json.dumps(results,indent=2))
