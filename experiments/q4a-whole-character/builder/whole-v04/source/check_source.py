"""Read-only raw review numbers. No masks, pieces, pose changes or guide writes."""
from pathlib import Path
from PIL import Image
import numpy as np
import json,hashlib

HERE=Path(__file__).resolve().parent
ROOT=HERE.parents[2]
RAW=ROOT/'art/whole-v04/raw/whole-v04.png'
before=hashlib.sha256(RAW.read_bytes()).hexdigest()
rgba=np.array(Image.open(RAW).convert('RGBA'));alpha=rgba[:,:,3]

def intervals(values,offset=0):
 ids=np.flatnonzero(values)
 if not len(ids):return []
 groups=np.split(ids,np.where(np.diff(ids)>1)[0]+1)
 return [[int(g[0]+offset),int(g[-1]+offset)]for g in groups]

out={'scope':'read-only analysis of RAW whole-v04; not frozen pose guide',
 'rawPath':str(RAW.relative_to(ROOT)),'rawSha256':before,'size':[rgba.shape[1],rgba.shape[0]],
 'conventions':'zero-based integer pixels; intervals inclusive; no pixel masks exported',
 'alpha0Pixels':int((alpha==0).sum()),
 'alpha0NonzeroRGBPixels':int(((alpha==0)&(rgba[:,:,:3].max(axis=2)>0)).sum()),
 'rowIntervals':[],'semanticContactProbes':[],'soles':[]}
for y in [360,380,400,420,440,460,480,500,520,540,560,580]:
 out['rowIntervals'].append({'y':y,'thresholds':{str(t):intervals(alpha[y]>=t)for t in [1,128,250]}})
# Visually identified yellow tank and skin on opposite sides of the visible seam.
# These samples locate image semantics, not future cut/joint coordinates.
for y,cloth_x,skin_x in [(400,440,460),(420,460,480),(440,480,500),(460,520,540),(480,540,560)]:
 v=alpha[y,cloth_x:skin_x+1]
 out['semanticContactProbes'].append({'y':y,'tankPixel':[cloth_x,y],
  'tankRGBA':rgba[y,cloth_x].tolist(),'upperArmPixel':[skin_x,y],
  'upperArmRGBA':rgba[y,skin_x].tolist(),'betweenAlphaMin':int(v.min()),
  'betweenAlphaMax':int(v.max()),'betweenAlpha0Count':int((v==0).sum())})
for name,rect in [('screenLeft',[170,1300,500,1500]),('screenRight',[600,1300,940,1500])]:
 x0,y0,x1,y1=rect;window=alpha[y0:y1,x0:x1]
 row={'shoe':name,'readWindowHalfOpen':rect,'thresholds':{}}
 for t in [1,64,128,250]:
  yy,xx=np.where(window>=t);bottom=int(yy.max());xs=np.flatnonzero(window[bottom]>=t)+x0
  row['thresholds'][str(t)]={'lastOccupiedRow':bottom+y0,'bottomCellEdge':bottom+y0+1,
   'bottomRowXInclusive':intervals(window[bottom]>=t,x0)}
 out['soles'].append(row)
out['soleDifferences']={str(t):abs(out['soles'][0]['thresholds'][str(t)]['lastOccupiedRow']-
 out['soles'][1]['thresholds'][str(t)]['lastOccupiedRow'])for t in [1,64,128,250]}
out['denseSoleTolerancePx']=4
out['denseSolePass']=all(out['soleDifferences'][str(t)]<=4 for t in [128,250])
out['result']='SOURCE_POSE_FAIL'
out['rawHashUnchanged']=hashlib.sha256(RAW.read_bytes()).hexdigest()==before
(HERE/'RAW_CHECK.json').write_text(json.dumps(out,indent=2)+'\n',encoding='utf-8')
print(json.dumps({'rawSha256':before,'probes':out['semanticContactProbes'],
 'soleDifferences':out['soleDifferences'],'denseSolePass':out['denseSolePass'],
 'alpha0Pixels':out['alpha0Pixels'],'alpha0NonzeroRGBPixels':out['alpha0NonzeroRGBPixels'],
 'rawHashUnchanged':out['rawHashUnchanged']},indent=2))
