from pathlib import Path
import json,math,base64
import numpy as np
from PIL import Image,ImageDraw
import cv2
R=Path('D:/dev/R4D/experiments/q6-single-joint');Q=R/'qa/technical'
raw=(Q/'browser-result-base64.log').read_text(encoding='utf-8-sig')
decoder=json.JSONDecoder();encoded,_=decoder.raw_decode(raw.split('### Result',1)[1].lstrip());data=json.loads(base64.b64decode(encoded).decode('utf-8'))
(Q/'browser-results.json').write_text(json.dumps(data,indent=2,ensure_ascii=False),encoding='utf-8')
images={v:{p:np.array(Image.open(R/f'art/{v}/{p}_near.png').convert('RGBA')) for p in ['thigh','shin']} for v in ['J0','J1','J2','M1','M2']}
images['J2']['overlay']=np.array(Image.open(R/'art/J2/kneepad_overlay.png').convert('RGBA'))
# 0.5 canonical-pixel sampling about the actual knee, not about an alpha bbox.
step=.5; coords=np.arange(-64+step/2,64,step);xx,yy=np.meshgrid(coords,coords);disk=xx*xx+yy*yy<=28**2
def sample(arr,t,knee):
 dx=xx+(knee['x']-t['x'])/t['scale'];dy=yy+(knee['y']-t['y'])/t['scale'];a=t['angle']
 ix=np.floor(dx*math.cos(a)+dy*math.sin(a)+t['pivot'][0]).astype(int);iy=np.floor(-dx*math.sin(a)+dy*math.cos(a)+t['pivot'][1]).astype(int)
 valid=(ix>=0)&(iy>=0)&(ix<arr.shape[1])&(iy<arr.shape[0]);out=np.zeros((*xx.shape,4),dtype=np.uint8);out[valid]=arr[iy[valid],ix[valid]];return out
records=[];coverage={};part_masks={}
samples=[s for s in data['samples'] if '-t' in s['name'] or s['name'].startswith('retarget') or s['name'].startswith('RAF-')]
for s in samples:
 for v in images:
  t=next(p for p in s['panels'] if p['id']==v)['transform']; knee=t['shin'];arrs={p:sample(im,t['thigh' if p=='thigh' else 'shin'],knee) for p,im in images[v].items()}
  composite=np.zeros((*xx.shape,4),dtype=float)
  for p in ['shin','thigh','overlay']:
   if p not in arrs:continue
   fg=arrs[p].astype(float)/255;alpha=fg[:,:,3:4];composite[:,:,:3]=fg[:,:,:3]*alpha+composite[:,:,:3]*(1-alpha);composite[:,:,3:4]=alpha+composite[:,:,3:4]*(1-alpha)
  masks={p:arr[:,:,3]>=128 for p,arr in arrs.items()};union=np.logical_or.reduce(list(masks.values()));overlap=masks['thigh']&masks['shin'];centerDist=float(np.sqrt((xx[union]**2+yy[union]**2).min())) if union.any() else None
  # Hole = transparent component enclosed by opaque union inside ROI; exterior is excluded.
  count,labels,stats,centroids=cv2.connectedComponentsWithStats((~union).astype('uint8'),connectivity=8)
  enclosed=[]
  for i in range(1,count):
   x,y,w,h,area=stats[i]
   if x>0 and y>0 and x+w<union.shape[1] and y+h<union.shape[0] and np.any((labels==i)&disk):enclosed.append(float(area*step*step))
  if overlap.any():gap=0.
  else:
   dist=cv2.distanceTransform((~masks['thigh']).astype('uint8'),cv2.DIST_L2,cv2.DIST_MASK_PRECISE);gap=float(dist[masks['shin']].min()*step) if masks['shin'].any() else None
  lum=(composite[:,:,:3]*np.array([.2126,.7152,.0722])).sum(axis=2)*255
  rec={'sample':s['name'],'variant':v,'pose':s['pose'],'opaqueOverlapCanonicalArea':float((overlap&disk).sum()*step*step),'opaqueUnionDiskCanonicalArea':float((union&disk).sum()*step*step),'alpha32UnionDiskCanonicalArea':float((np.logical_or.reduce([a[:,:,3]>=32 for a in arrs.values()])&disk).sum()*step*step),'minimumThighShinGapCanonical':gap,'nearestOpaqueToAxisCanonical':centerDist,'enclosedHoleCanonicalAreas':enclosed,'darkOpaqueDiskCanonicalAreaLumaBelow30':float(((lum<30)&union&disk).sum()*step*step),'scale':knee['scale']}
  key=s['name'];coverage[(key,v)]=union;records.append(rec)
  if v=='J0':source_union=union.copy()
  else:rec['opaqueCoverageRemovedVsJ0DiskCanonicalArea']=float((source_union&~union&disk).sum()*step*step);rec['opaqueCoverageAddedVsJ0DiskCanonicalArea']=float((~source_union&union&disk).sum()*step*step)
summary={}
for v in images:
 a=[r for r in records if r['variant']==v];summary[v]={'samples':len(a),'minOverlapCanonicalArea':min(r['opaqueOverlapCanonicalArea'] for r in a),'maxOverlapCanonicalArea':max(r['opaqueOverlapCanonicalArea'] for r in a),'maxGapCanonical':max(r['minimumThighShinGapCanonical'] or 0 for r in a),'samplesWithEnclosedHole':sum(bool(r['enclosedHoleCanonicalAreas']) for r in a),'maxEnclosedHoleCanonicalArea':max([x for r in a for x in r['enclosedHoleCanonicalAreas']]or[0]),'maxCoverageRemovedVsJ0CanonicalArea':max(r.get('opaqueCoverageRemovedVsJ0DiskCanonicalArea',0) for r in a),'maxNearestOpaqueToAxisCanonical':max(r['nearestOpaqueToAxisCanonical'] for r in a)}
out={'method':'Inverse-map actual browser world transforms to native textures, nearest sample every .5 canonical pixel in +/-64 square about knee; opaque alpha>=128; local disk radius28. Not WebGL raster measurement. Gap is nearest thigh/shin opaque support in ROI; overlap does not prove natural contour. Dark area is luma<30, not a semantic line detector. Enclosed transparent components in ROI exclude exterior; antialias/threshold and .5 grid limit precision. Areas screen equivalent = canonical area * scale^2; CSS further scales.', 'summary':summary,'records':records}
(Q/'geometry-results.json').write_text(json.dumps(out,indent=2,ensure_ascii=False),encoding='utf-8')
print(json.dumps(summary,indent=2))
# Contact sheet from actual browser screenshots, fixed knee crops, no art repair.
names=['bind','extreme_extension','extreme_flexion','step_overlap','jump_phase'];sheet=Image.new('RGB',(5*180,5*190),'white');draw=ImageDraw.Draw(sheet)
for row,pose in enumerate(names):
 s=next(s for s in data['samples'] if s['name']==pose+'-t12');k=s['panels'][0]['transform']['shin'];
 for col,v in enumerate(['J0','J1','J2','M1','M2']):
  group='J' if col<3 else 'M';im=Image.open(Q/f'output/playwright/{group}-{pose}.png');
  # Panel positions in screenshots of #panels: J x=18,472,926; M x=245,699; y=39 canvas start.
  px=([18,472,926][col] if col<3 else [245,699][col-3]); x=px+k['x']*438/440;y=39+k['y']*438/440
  crop=im.crop((round(x-43),round(y-43),round(x+43),round(y+43))).resize((172,172))
  sheet.paste(crop,(col*180,row*190+18));draw.text((col*180,row*190),v+' '+pose,fill='black')
sheet.save(Q/'output/playwright/knee-contact.png')
