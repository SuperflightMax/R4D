"""Read-only full Water pixel/trajectory analysis. No new simulation or image edits.
Alpha fractions are source-plane estimates, not GPU readback. A trajectory scan
only selects existing 0/1/2 poses for subsequent actual UI observation.
"""
import json
import sys
from pathlib import Path
import numpy as np
from PIL import Image
import psutil

target, prep, out = map(Path, sys.argv[1:])
art=json.loads((target/'art/manifest.json').read_text())
cfg=json.loads((prep/'inputs/config.json').read_text())
source=np.asarray(Image.open(target/'input/original.jpg').convert('RGB'))
parts=[p for o in art['objects'] for p in o['parts']]+art['sceneParts']
pixels={};rgb=[];dimensions=[]
for p in parts:
    im=Image.open(target/'art'/p['file']);a=np.asarray(im)
    assert im.mode=='RGBA',p['file']
    assert list(im.size)==p['sizePx'],p['file']
    pixels[p['partId']]=a[:,:,3].astype(float)/255
    dimensions.append(dict(file=p['file'],size=list(im.size),mode=im.mode))
    if p['provenance']['kind']=='extracted':
        r=p['sourceRectPx'];src=source[r['y']:r['y']+r['height'],r['x']:r['x']+r['width']]
        mask=a[:,:,3]>0
        n=int(np.count_nonzero(np.any(a[:,:,:3]!=src,axis=2)&mask))
        assert n==0,(p['file'],n)
        rgb.append(dict(file=p['file'],nonzeroAlphaPixels=int(mask.sum()),partialAlphaPixels=int(((a[:,:,3]>0)&(a[:,:,3]<255)).sum()),rgbMismatches=n))
body=np.asarray(Image.open(target/'art/ball-body.png'))[:,:,3].astype(float)/255
actor_bounds=[]
for name in ['body','shadow']:
    p=art['ball'][name];a=np.asarray(Image.open(target/'art'/p['file']))[:,:,3]
    yy,xx=np.where(a>=16);bounds=[int(xx.min()),int(yy.min()),int(xx.max()+1),int(yy.max()+1)]
    assert bounds==p['contentBoundsPxAlpha16']
    actor_bounds.append(dict(actor=name,contentBoundsPxAlpha16=bounds,contentRadiusPx=p['contentRadiusPx'],centerLocalPx=p['centerLocalPx']))
def sample(im,x,y):
    ix,iy=np.floor(x).astype(int),np.floor(y).astype(int);fx,fy=x-ix,y-iy;v=np.zeros_like(x,dtype=float)
    for dx,dy,wt in [(0,0,(1-fx)*(1-fy)),(1,0,fx*(1-fy)),(0,1,(1-fx)*fy),(1,1,fx*fy)]:
        ok=(ix+dx>=0)&(iy+dy>=0)&(ix+dx<im.shape[1])&(iy+dy<im.shape[0])
        v[ok]+=im[iy[ok]+dy,ix[ok]+dx]*wt[ok]
    return v
def overlap(cx,cy,scale,chosen,step=.25):
    xx,yy=np.meshgrid(np.arange(cx-128*scale,cx+128*scale,step),np.arange(cy-128.5*scale,cy+127.5*scale,step))
    ba=sample(body,(xx-cx)/scale+128-.5,(yy-cy)/scale+128.5-.5);cover=np.zeros_like(ba);per={}
    for p in chosen:
        r=p['sourceRectPx'];pa=sample(pixels[p['partId']],xx-r['x']-.5,yy-r['y']-.5)
        per[p['partId']]=float(np.sum(ba*pa)/np.sum(ba));cover=1-(1-cover)*(1-pa)
    return dict(alphaWeightedOverlapFraction=float(np.sum(ba*cover)/np.sum(ba)),overlapSamples=int(np.count_nonzero((ba>=16/255)&(cover>=16/255))),perPart=per)
observations=[]
for file in sorted(out.glob('*.dom.json')):
    raw=json.loads(file.read_text())['raw'];s=json.loads(raw['state']);a=json.loads(raw['depth'])['actor']
    # Only local source poses; order is taken from preserved runtime inspection.
    selected=[p for p in parts if p['depth']['layer'] in ['scene-front','receiver-front'] or (p['depth']['layer'] in ['body','receiver-back'] and p['depth']['sortNativeY']>s['ball']['pos']['y'])]
    if file.stem.startswith(('02-','03-','04-','05-','08-','09-','10-','11-','12-','14-','37-','38-','39-','41-','42-','43-','44-','48-','50-','51-','52-')):
        v=overlap(a['center']['x'],a['center']['y'],a['bodyScale'],selected)
        observations.append(dict(file=file.name,seed=s['seed'],tick=s['tick'],**v))
exclusive=[]
for o in art['objects']:
    if not o['objectId'].startswith('receiver'):continue
    rear=next(p for p in o['parts'] if p['depth']['layer']=='receiver-back');front=next(p for p in o['parts'] if p['depth']['layer']=='receiver-front')
    assert rear['sourceRectPx']==front['sourceRectPx']
    a,b=pixels[rear['partId']],pixels[front['partId']]
    r=rear['sourceRectPx'];px,py=round(o['anchorSourcePx'][0])-r['x'],round(o['anchorSourcePx'][1])-r['y']
    rear_center_alpha=float(a[py,px]);assert rear_center_alpha==0
    exclusive.append(dict(id=o['objectId'],bothNonzeroPixels=int(np.count_nonzero((a>0)&(b>0))),rearTransparentPixels=int(np.count_nonzero(a==0)),rearAlphaAtAcceptedCenter=rear_center_alpha))
scan=[];H=np.asarray(art['p1']['nativeToSource']);fronts=[p for p in parts if p['depth']['layer']=='receiver-front']
for seed in [0,1,2]:
    runs=[json.loads(line)['state'] for line in (prep/f'runs/seed-{seed}.jsonl').read_text().splitlines()]
    for p in fronts:
        r=p['sourceRectPx'];bucket=next(b for b in cfg['board']['buckets'] if b['id']==p['partId'].split(':')[0]);hits=[];nearest=(float('inf'),None)
        for s in runs:
            x,y=s['ball']['pos']['x'],s['ball']['pos']['y'];dist=float(np.hypot(x-bucket['x'],y-bucket['y']))
            if dist<nearest[0]:nearest=(dist,s['tick'])
            v=H@np.array([x,y,1]);cx,cy=v[:2]/v[2];R=16/v[2]
            if cx+1.3*R<r['x'] or cx-1.3*R>r['x']+r['width'] or cy+1.3*R<r['y'] or cy-1.3*R>r['y']+r['height']:continue
            ov=overlap(cx,cy,R/100,[p],step=.5)
            if ov['overlapSamples']:hits.append(dict(tick=s['tick'],fraction=ov['alphaWeightedOverlapFraction']))
        scan.append(dict(seed=seed,receiver=bucket['id'],nearestNativeCenterDistance=nearest[0],nearestTick=nearest[1],nativeCaptureRadius=bucket['r'],overlapTicks=hits))
result=dict(method='.25 source px observed poses; .5 px existing full-run scan; alpha16 overlap threshold; estimates, not GPU readback',dimensions=dimensions,actorBounds=actor_bounds,originalRgb=rgb,receiverRearFront=exclusive,observedPoses=observations,existingTrajectoryScan=scan,ownAnalysisPeakWorkingSetBytes=psutil.Process().memory_info().peak_wset)
(out/'ALPHA_RESULTS.json').write_text(json.dumps(result,indent=2)+'\n')
print(json.dumps(dict(parts=len(parts),originalRgb=len(rgb),receiverRearFront=exclusive,scans=[dict(seed=x['seed'],receiver=x['receiver'],nearestTick=x['nearestTick'],distance=x['nearestNativeCenterDistance'],overlap=[x['overlapTicks'][0]['tick'],x['overlapTicks'][-1]['tick']] if x['overlapTicks'] else []) for x in scan]),indent=2))
