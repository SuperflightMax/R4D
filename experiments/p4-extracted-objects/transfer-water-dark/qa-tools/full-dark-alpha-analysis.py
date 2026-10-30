"""Read-only PNG/actual-order/old-trajectory analysis for Dark, without a simulator.
Source-plane alpha estimates are not GPU readback. Native-camera frames are excluded.
"""
import json
import sys
from pathlib import Path
from collections import deque
import numpy as np
from PIL import Image, ImageFilter
import psutil
target,prep,out=map(Path,sys.argv[1:])
art=json.loads((target/'art/manifest.json').read_text());cfg=json.loads((prep/'inputs/config.json').read_text())
source=np.asarray(Image.open(target/'input/original.jpg').convert('RGB'))
parts=[p for o in art['objects'] for p in o['parts']]+art['sceneParts'];pixels={};rgb=[];dims=[]
for p in parts:
    im=Image.open(target/'art'/p['file']);a=np.asarray(im);assert im.mode=='RGBA';assert list(im.size)==p['sizePx']
    pixels[p['partId']]=a[:,:,3].astype(float)/255;dims.append(dict(file=p['file'],size=list(im.size),mode=im.mode))
    if p['provenance']['kind']=='extracted':
        r=p['sourceRectPx'];ref=source[r['y']:r['y']+r['height'],r['x']:r['x']+r['width']];mask=a[:,:,3]>0
        n=int(np.count_nonzero(np.any(a[:,:,:3]!=ref,axis=2)&mask));assert n==0,(p['file'],n)
        rgb.append(dict(file=p['file'],nonzeroAlphaPixels=int(mask.sum()),partialAlphaPixels=int(((a[:,:,3]>0)&(a[:,:,3]<255)).sum()),rgbMismatches=n))
actor_bounds=[]
for name in ['body','shadow']:
    p=art['ball'][name];a=np.asarray(Image.open(target/'art'/p['file']));yy,xx=np.where(a[:,:,3]>=16);bounds=[int(xx.min()),int(yy.min()),int(xx.max()+1),int(yy.max()+1)];assert bounds==p['contentBoundsPxAlpha16']
    actor_bounds.append(dict(actor=name,bounds=bounds,center=p['centerLocalPx'],contentRadius=p['contentRadiusPx']))
body=np.asarray(Image.open(target/'art/ball-body.png'))[:,:,3].astype(float)/255
shadow_rgba=np.asarray(Image.open(target/'art/ball-shadow.png'));shadow_alpha=shadow_rgba[:,:,3].astype(float)/255
shadow_stats=dict(rgbMaxAtNonzeroAlpha=int(shadow_rgba[:,:,:3][shadow_rgba[:,:,3]>0].max()),maxAlpha=int(shadow_rgba[:,:,3].max()),alphaLevels=int(np.unique(shadow_rgba[:,:,3]).size),effectiveMaxAlpha=float(shadow_alpha.max()*.65))
def sample(im,x,y):
    ix,iy=np.floor(x).astype(int),np.floor(y).astype(int);fx,fy=x-ix,y-iy;v=np.zeros_like(x,dtype=float)
    for dx,dy,wt in [(0,0,(1-fx)*(1-fy)),(1,0,fx*(1-fy)),(0,1,(1-fx)*fy),(1,1,fx*fy)]:
        ok=(ix+dx>=0)&(iy+dy>=0)&(ix+dx<im.shape[1])&(iy+dy<im.shape[0]);v[ok]+=im[iy[ok]+dy,ix[ok]+dx]*wt[ok]
    return v
def pose_overlap(cx,cy,scale,chosen,ahead=None,step=.25):
    xx,yy=np.meshgrid(np.arange(cx-128*scale,cx+128*scale,step),np.arange(cy-128.5*scale,cy+127.5*scale,step));ba=sample(body,(xx-cx)/scale+128-.5,(yy-cy)/scale+128.5-.5)
    cover=np.zeros_like(ba);per=[]
    for p in chosen:
        r=p['sourceRectPx']
        if cx+128*scale<r['x'] or cx-128*scale>r['x']+r['width'] or cy+129*scale<r['y'] or cy-129*scale>r['y']+r['height']:continue
        pa=sample(pixels[p['partId']],xx-r['x']-.5,yy-r['y']-.5);potential=float(np.sum(ba*pa)/np.sum(ba));front=True if ahead is None else ahead[p['partId']]
        if potential>1e-12:per.append(dict(id=p['partId'],potential=potential,hidden=potential if front else 0,ahead=front))
        if front:cover=1-(1-cover)*(1-pa)
    return dict(hiddenFraction=float(np.sum(ba*cover)/np.sum(ba)),overlapSamples=int(np.count_nonzero((ba>=16/255)&(cover>=16/255))),parts=per)
observations=[]
for file in sorted(out.glob('*.dom.json')):
    r=json.loads(file.read_text());raw=r['raw'];s=json.loads(raw['state']);d=json.loads(raw['depth']);a=d['actor']
    if r['controls']['view']!='source' or not r['controls']['art']:continue
    lookup={p['id']:p for p in d['parts']};chosen=[p for p in parts if p['depth']['layer']!='ground']
    ahead={p['partId']:r['controls']['showParts'] and (lookup[p['partId']]['container'] in ['scene-front','receiver-front'] or lookup[p['partId']]['zIndex']>s['ball']['pos']['y']) for p in chosen}
    observations.append(dict(file=file.name,seed=s['seed'],tick=s['tick'],**pose_overlap(a['center']['x'],a['center']['y'],a['bodyScale'],chosen,ahead)))
receivers=[]
for o in art['objects']:
    if o['nativeKind']!='bucket':continue
    rear=next(p for p in o['parts'] if p['depth']['layer']=='receiver-back');front=next(p for p in o['parts'] if p['depth']['layer']=='receiver-front');assert rear['sourceRectPx']==front['sourceRectPx'];a,b=pixels[rear['partId']],pixels[front['partId']];rr=rear['sourceRectPx'];px,py=round(o['anchorSourcePx'][0])-rr['x'],round(o['anchorSourcePx'][1])-rr['y']
    receivers.append(dict(id=o['objectId'],sharedAlphaPixels=int(np.count_nonzero((a>0)&(b>0))),rearAlphaAtAcceptedCenter=float(a[py,px])))
opaque=[]
for o in art['objects']:
    if not o['objectId'].startswith(('bowl-base','skull-base')):continue
    p=next(p for p in o['parts'] if p['role']=='body');a=np.asarray(Image.open(target/'art'/p['file']));solid=a[:,:,3]>=128;h,w=solid.shape;reach=np.zeros_like(solid);q=deque()
    for x in range(w):q.extend([(0,x),(h-1,x)])
    for y in range(h):q.extend([(y,0),(y,w-1)])
    while q:
        y,x=q.popleft()
        if x<0 or y<0 or x>=w or y>=h or reach[y,x] or solid[y,x]:continue
        reach[y,x]=True;q.extend([(y-1,x),(y+1,x),(y,x-1),(y,x+1)])
    filled=~reach;inner=np.asarray(Image.fromarray((filled*255).astype('uint8')).filter(ImageFilter.MinFilter(7)))>0;dark=inner&(a[:,:,:3].max(axis=2)<40)
    opaque.append(dict(id=o['objectId'],blackInteriorPixels=int(dark.sum()),minAlpha=int(a[:,:,3][dark].min()) if dark.any() else None,nonOpaque=int(np.count_nonzero(dark&(a[:,:,3]<255))),enclosedTransparentPixels=int(np.count_nonzero(filled&~solid))))
scan=[];H=np.asarray(art['p1']['nativeToSource']);fronts=[p for p in parts if p['depth']['layer']=='receiver-front']
for seed in [0,1,2]:
    runs=[json.loads(line)['state'] for line in (prep/f'runs/seed-{seed}.jsonl').read_text().splitlines()]
    for p in fronts:
        rr=p['sourceRectPx'];b=next(x for x in cfg['board']['buckets'] if x['id']==p['partId'].split(':')[0]);near=(float('inf'),None);hits=[]
        for s in runs:
            x,y=s['ball']['pos']['x'],s['ball']['pos']['y'];dist=float(np.hypot(x-b['x'],y-b['y']))
            if dist<near[0]:near=(dist,s['tick'])
            v=H@np.array([x,y,1]);cx,cy=v[:2]/v[2];R=16/v[2]
            if cx+1.3*R<rr['x'] or cx-1.3*R>rr['x']+rr['width'] or cy+1.3*R<rr['y'] or cy-1.3*R>rr['y']+rr['height']:continue
            ov=pose_overlap(cx,cy,R/100,[p],step=.5)
            if ov['overlapSamples']:hits.append(dict(tick=s['tick'],fraction=ov['hiddenFraction']))
        scan.append(dict(seed=seed,receiver=b['id'],nearestDistance=near[0],nearestTick=near[1],captureRadius=b['r'],overlapTicks=hits))
# Actual normal screenshots, with a conservative body-free subset and residuals retained.
def shadow_compare(target_name,base_name):
    r=json.loads((out/(target_name+'.dom.json')).read_text());a=json.loads(r['raw']['depth'])['actor'];fit=a['rendered']['fitScale'];c=r['layout']['canvas'][0];ox=c['left']+(c['clientWidth']-1536*fit)/2;oy=c['top']+(c['clientHeight']-1536*fit)/2
    bounds=art['ball']['shadow']['contentBoundsPxAlpha16'];pivot=art['ball']['shadow']['centerLocalPx'];sc=a['shadowScale'];center=a['shadowCenter'];box=(int(np.floor(ox+(center['x']+(bounds[0]-pivot[0])*sc[0])*fit))-2,int(np.floor(oy+(center['y']+(bounds[1]-pivot[1])*sc[1])*fit))-2,int(np.ceil(ox+(center['x']+(bounds[2]-pivot[0])*sc[0])*fit))+2,int(np.ceil(oy+(center['y']+(bounds[3]-pivot[1])*sc[1])*fit))+2)
    target_image=Image.open(out/(target_name+'.jpg'));base_image=Image.open(out/(base_name+'.jpg'))
    ti=np.asarray(target_image.convert('RGB').crop(box)).astype(float);bi=np.asarray(base_image.convert('RGB').crop(box)).astype(float);yy,xx=np.indices(ti.shape[:2]);xx=xx+box[0];yy=yy+box[1];sx=(xx+.5-ox)/fit;sy=(yy+.5-oy)/fit
    sa=sample(shadow_alpha,(sx-center['x'])/sc[0]+pivot[0]-.5,(sy-center['y'])/sc[1]+pivot[1]-.5);ba=sample(body,(sx-a['center']['x'])/a['bodyScale']+128-.5,(sy-a['center']['y'])/a['bodyScale']+128.5-.5)
    mask=(sa>=16/255)&((sx-a['center']['x'])**2+(sy-a['center']['y'])**2>(1.5*a['radius'])**2);body_neighbor=np.asarray(Image.fromarray(((ba>0)*255).astype('uint8')).filter(ImageFilter.MaxFilter(3)))>0;pure=mask&~body_neighbor;delta=(ti-bi)@np.array([.2126,.7152,.0722])
    def stats(m):
        v=delta[m];return dict(pixels=int(m.sum()),darkened=int((v<-.25).sum()),brighter=int((v>.25).sum()),minLumaDelta=float(v.min()) if v.size else None,maxLumaDelta=float(v.max()) if v.size else None)
    positive=[]
    for y,x in zip(*np.where(mask&(delta>.25))):positive.append(dict(pixel=[int(xx[y,x]),int(yy[y,x])],lumaDelta=float(delta[y,x]),bodyAlpha=float(ba[y,x]),bodyWithinOnePixel=bool(body_neighbor[y,x])))
    return dict(target=target_name,baseline=base_name,targetFormat=target_image.format,baselineFormat=base_image.format,broad=stats(mask),bodyFree=stats(pure),positiveResiduals=positive)
shadow_screen=dict(method='actual normal screenshot ROIs; shadow alpha16 outside1.5R; body-free subset also excludes sampled body alpha and one pixel neighborhood; positives retained; screenshots are LOSSY JPEG, not GPU readback',strictZeroBrighteningVerdict='UNVERIFIED: lossy JPEG prevents radiometric attribution of weak positive residuals',comparisons=[shadow_compare('19-front-973','00-load-normal'),shadow_compare('61-shadow-parts-off-973-normal','01-parts-off-normal')])
result=dict(method='.25 source-pixel observed poses and ACTUAL runtime zIndex/container; .5px old whole-run front scan; alpha16; estimates not GPU readback',dimensions=dims,originalRgb=rgb,actorBounds=actor_bounds,shadowTexture=shadow_stats,shadowActualPixels=shadow_screen,receivers=receivers,opaqueInteriorProbes=opaque,observedPoses=observations,existingTrajectoryScan=scan,ownAnalysisPeakWorkingSetBytes=psutil.Process().memory_info().peak_wset)
(out/'ALPHA_RESULTS.json').write_text(json.dumps(result,indent=2)+'\n')
print(json.dumps(dict(parts=len(parts),rgb=len(rgb),shadowTexture=shadow_stats,shadowActualPixels=shadow_screen,opaque=opaque,scan=[dict(seed=x['seed'],receiver=x['receiver'],nearestTick=x['nearestTick'],distance=x['nearestDistance'],overlap=[x['overlapTicks'][0]['tick'],x['overlapTicks'][-1]['tick']] if x['overlapTicks'] else []) for x in scan]),indent=2))
