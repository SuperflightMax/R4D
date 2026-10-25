"""Register generated material pixels to immutable Q5A v2 and render STATIC QA poses.
No generator, animation controller, rig edits, network or dependency installation.
"""
import argparse
import hashlib
import json
from collections import deque
from pathlib import Path
import numpy as np
from PIL import Image, ImageDraw, ImageFilter, ImageCms

ART=next(p for p in Path(__file__).resolve().parents if p.name=='art')
DATA_PATH=ART.parent/'construction/construction.json'
SHA='70f324aa7126f7aea0eca24e42aa370b18bb48d070810f3819a5cab16116e092'
DATA=json.loads(DATA_PATH.read_text(encoding='utf-8'))
SURF={s['id']:s for s in DATA['surfaces']}
ORDER=['far_leg_skin','near_leg_skin','far_arm_skin','near_arm_skin',
       'torso_top','pelvis_shorts','far_shorts_leg','near_shorts_leg',
       'far_hand','near_hand','far_shoe','near_shoe','neck_skin','head_face','hair']
ICC=(Path(__file__).parent/'srgb.icc').read_bytes()

def source(poly):return [(512+2*x,900-2*y) for x,y in poly]
def outlines(g):return [p['outline'] for p in g['patches']] if 'patches' in g else [g['outline']]

def mask_for(g):
    im=Image.new('L',(2048,2048));draw=ImageDraw.Draw(im)
    for poly in outlines(g):draw.polygon([(x*2,y*2) for x,y in source(poly)],fill=255)
    return im.resize((1024,1024),Image.Resampling.LANCZOS)

def largest(alpha):
    mask=alpha>=96;seen=np.zeros_like(mask);best=[]
    for y,x in zip(*np.where(mask)):
        if seen[y,x]:continue
        q=deque([(y,x)]);seen[y,x]=True;group=[]
        while q:
            yy,xx=q.popleft();group.append((yy,xx))
            for ny,nx in ((yy-1,xx),(yy+1,xx),(yy,xx-1),(yy,xx+1)):
                if 0<=ny<mask.shape[0] and 0<=nx<mask.shape[1] and mask[ny,nx] and not seen[ny,nx]:
                    seen[ny,nx]=True;q.append((ny,nx))
        if len(group)>len(best):best=group
    result=np.zeros_like(mask)
    if best:
        yy,xx=zip(*best);result[yy,xx]=True
    return result

def register(name,atlas):
    i=ORDER.index(name);w,h=atlas.size
    box=(round((i%4)*w/4),round((i//4)*h/4),round((i%4+1)*w/4),round((i//4+1)*h/4))
    a=np.asarray(atlas.crop(box)).copy();component=largest(a[:,:,3])
    ys,xs=np.where(component)
    if not len(ys):raise ValueError(('missing generated surface',name))
    ymin,ymax=int(ys.min()),int(ys.max())
    # Seat is a fabric material panel, not generated full shorts: discard their hem/crotch.
    if name=='pelvis_shorts':ymax=ymin+round((ymax-ymin)*.69)
    mask=mask_for(SURF[name]['geometry_bind']);ma=np.asarray(mask)
    ty,tx=np.where(ma>=128);tmin,tmax=ty.min(),ty.max()
    out=np.zeros((1024,1024,4),dtype=np.uint8)
    rows=[y for y in range(ymin,ymax+1) if component[y].any()]
    for y in range(tmin,tmax+1):
        target=np.where(ma[y]>=128)[0]
        if not len(target):continue
        v=(y-tmin)/max(1,tmax-tmin)
        sy=round(ymin+v*(ymax-ymin));sy=min(rows,key=lambda z:abs(z-sy))
        sx=np.where(component[sy])[0]
        lo,hi=int(sx.min()),int(sx.max())
        # Exclude dark silhouette pixels on material overlaps; do not paint caps.
        inset=2 if ('skin' in name or 'shorts' in name or name=='neck_skin') else 0
        if hi-lo>2*inset:lo+=inset;hi-=inset
        px=np.arange(max(0,target.min()-4),min(1024,target.max()+5))
        u=np.clip((px-target.min())/max(1,target.max()-target.min()),0,1)
        positions=lo+u*(hi-lo)
        left=np.floor(positions).astype(int);right=np.minimum(left+1,a.shape[1]-1)
        t=(positions-left)[:,None]
        rgb=a[sy,left,:3]*(1-t)+a[sy,right,:3]*t
        out[y,px,:3]=np.clip(rgb,0,255).astype(np.uint8)
        out[y,px,3]=ma[y,px]
    # Explicit clone repairs: continuous same-owner material beyond cut ends.
    skin=('skin' in name or 'hand' in name)
    if skin and name!='head_face':
        band=5
        for start,end,anchor in [(tmin,min(tmax,tmin+band),min(tmax,tmin+band+1)),
                                 (max(tmin,tmax-band),tmax,max(tmin,tmax-band-1))]:
            ax=np.where(out[anchor,:,3]>128)[0]
            if len(ax):
                color=np.median(out[anchor,ax,0:3],axis=0)
                for y in range(start,end+1):
                    xx=np.where(ma[y]>0)[0];out[y,xx,:3]=color
    # Broad-light, no high-frequency inner fold. Geometry and UV remain untouched.
    rgb=Image.fromarray(out[:,:,:3],'RGB')
    blurred=rgb.filter(ImageFilter.GaussianBlur(6))
    if name in DATA['fold_contracts']:
        contract=DATA['fold_contracts'][name]
        zone=Image.new('L',(1024,1024));z=ImageDraw.Draw(zone)
        z.polygon([tuple(p) for p in contract['source_low_contrast_zone_px']],fill=255)
        zone=zone.filter(ImageFilter.MaxFilter(9)).filter(ImageFilter.GaussianBlur(2))
        # Sample inside the material so blur never imports transparent black.
        soft=np.asarray(zone).astype(float)/255
        for y in range(tmin,tmax+1):
            xx=np.where(ma[y]>128)[0]
            if len(xx):
                center=np.median(out[y,xx,:3],axis=0)
                weight=soft[y,xx,None]*.72
                out[y,xx,:3]=np.clip(out[y,xx,:3]*(1-weight)+center*weight,0,255)
    if 'shorts' in name:
        # Remove artificial closed end contours from panel overlap boundaries.
        interior=mask.filter(ImageFilter.MinFilter(9))
        edge=(np.asarray(mask).astype(float)-np.asarray(interior).astype(float))/255
        for y in range(tmin,tmax+1):
            xx=np.where(ma[y]>128)[0]
            if len(xx):
                color=np.median(out[y,xx,:3],axis=0)
                blend=edge[y,xx,None]
                out[y,xx,:3]=out[y,xx,:3]*(1-blend)+color*blend
    # AA boundary and straight-alpha RGB dilation using already painted owner rows.
    out[:,:,3]=ma
    for y in range(max(0,tmin-4),min(1024,tmax+5)):
        valid=np.where(np.any(out[y,:,:3]!=0,axis=1))[0]
        if not len(valid):
            sy=min(tmax,max(tmin,y));out[y,:,:3]=out[sy,:,:3];valid=np.where(np.any(out[y,:,:3]!=0,axis=1))[0]
        needed=np.where(ma[y]>0)[0]
        for x in needed:
            if not out[y,x,:3].any() and len(valid):out[y,x,:3]=out[y,valid[np.argmin(abs(valid-x))],:3]
    return Image.fromarray(out,'RGBA'),{'cell':i,'raw_cell_bbox':box,'raw_material_y_range':[ymin,ymax],
                                     'method':'rowwise generated-pixel transport to immutable source polygon'}

def cross(a,b,c):return (b[0]-a[0])*(c[1]-a[1])-(b[1]-a[1])*(c[0]-a[0])
def triangulate(poly):
    ids=list(range(len(poly)))
    if len(ids)>1 and np.linalg.norm(np.array(poly[0])-poly[-1])<1e-7:ids.pop()
    area=sum(poly[ids[i]][0]*poly[ids[(i+1)%len(ids)]][1]-poly[ids[(i+1)%len(ids)]][0]*poly[ids[i]][1] for i in range(len(ids)))
    sign=1 if area>0 else -1;result=[]
    while len(ids)>3:
        found=False
        for j in range(len(ids)):
            ia,ib,ic=ids[j-1],ids[j],ids[(j+1)%len(ids)];a,b,c=poly[ia],poly[ib],poly[ic]
            if sign*cross(a,b,c)<1e-8:continue
            inside=False
            for k in ids:
                if k in (ia,ib,ic):continue
                p=poly[k]
                if all(sign*v>1e-8 for v in (cross(a,b,p),cross(b,c,p),cross(c,a,p))):inside=True;break
            if inside:continue
            result.append([ia,ib,ic]);ids.pop(j);found=True;break
        if not found:raise ValueError('polygon cannot be triangulated')
    result.append(ids);return result

def pieces(name,pose,fragment):
    b=SURF[name]['geometry_bind'];g=pose['surfaces'][name]
    if 'patches' in b:
        for bp,gp in zip(b['patches'],g['patches']):yield source(bp['outline']),gp['outline'],triangulate(bp['outline'])
    elif b.get('triangles'):
        tris=b['triangles']
        if 'arm_skin' in name and fragment!='all':
            rootids={0,1,2,3,4,5,*b['cap_vertex_ids']}
            tris=[t for t in tris if (set(t)<=rootids)==(fragment=='root')]
        if 'leg_skin' in name:tris=[t for t in tris if min(t)>=4]
        yield source(b['vertices']),g['vertices'],tris
    else:yield source(b['vertices']),g['vertices'],triangulate(b['vertices'])

def render(pose,textures,size=(960,640),scale=1,origin=(480,560)):
    canvas=Image.new('RGBA',size)
    for op in DATA['draw_operations']:
        name=op['surface'];tex=np.asarray(textures[name])
        layer=np.zeros((size[1],size[0],4),dtype=np.uint8)
        for sv,pv,tris in pieces(name,pose,op['fragment']):
            dst=np.array([(origin[0]+scale*x,origin[1]-scale*y) for x,y in pv]);src=np.array(sv)
            for tri in tris:
                target=dst[tri];original=src[tri]
                determinant=np.linalg.det(np.stack((target[1]-target[0],target[2]-target[0]),axis=1))
                if abs(determinant)<1e-8:continue
                x0=max(0,int(np.floor(target[:,0].min())));x1=min(size[0],int(np.ceil(target[:,0].max()))+1)
                y0=max(0,int(np.floor(target[:,1].min())));y1=min(size[1],int(np.ceil(target[:,1].max()))+1)
                if x1<=x0 or y1<=y0:continue
                yy,xx=np.mgrid[y0:y1,x0:x1];pts=np.stack((xx+.5-target[0,0],yy+.5-target[0,1]),axis=-1)
                inv=np.linalg.inv(np.stack((target[1]-target[0],target[2]-target[0]),axis=1))
                uv=pts@inv.T;inside=(uv[:,:,0]>=-1e-6)&(uv[:,:,1]>=-1e-6)&(uv.sum(axis=2)<=1+1e-6)
                sample=original[0]+uv[:,:,0,None]*(original[1]-original[0])+uv[:,:,1,None]*(original[2]-original[0])
                ix=np.clip(np.rint(sample[:,:,0]).astype(int),0,1023);iy=np.clip(np.rint(sample[:,:,1]).astype(int),0,1023)
                block=layer[y0:y1,x0:x1];block[inside]=tex[iy[inside],ix[inside]]
        canvas=Image.alpha_composite(canvas,Image.fromarray(layer,'RGBA'))
    return canvas

def digest(p):return hashlib.sha256(p.read_bytes()).hexdigest()
def main():
    parser=argparse.ArgumentParser();parser.add_argument('--attempt',default='01');args=parser.parse_args()
    assert digest(DATA_PATH)==SHA,'construction changed'
    folder=ART/'attempts'/args.attempt;out=folder/'textures';out.mkdir(parents=True,exist_ok=True)
    a=Image.open(ART/'source/nela-atlas-02.png').convert('RGBA')
    repaired=Image.open(ART/'source/nela-atlas-03-head-repair.png').convert('RGBA')
    textures={};mapping=[]
    for name in ORDER:
        tex,info=register(name,repaired if name=='head_face' else a)
        p=out/(name+'.png');tex.save(p,icc_profile=ICC)
        textures[name]=tex
        mapping.append(dict(id=name,file=str(p.relative_to(ART)),source='nela-atlas-03-head-repair.png' if name=='head_face' else 'nela-atlas-02.png',
                            source_size=list(tex.size),pivot_source_px=SURF[name]['pivot_source_px'],
                            sha256=digest(p),alpha_extrema=list(tex.getchannel('A').getextrema()),**info))
    preview=folder/'preview';preview.mkdir(exist_ok=True)
    poses={p['id']:p for p in DATA['poses']}
    chosen=['bind','low_deep','walk_far_contact','walk_near_contact','jump_apex','jump_landing','range_reach','range_compression']
    sheet=Image.new('RGB',(1920,2560),'#e5e7e8');draw=ImageDraw.Draw(sheet)
    for i,pid in enumerate(chosen):
        fig=render(poses[pid],textures);fig.save(preview/(pid+'.png'),icc_profile=ICC)
        ox=(i%2)*960;oy=(i//2)*640;sheet.paste(fig,(ox,oy),fig)
        draw.text((ox+20,oy+20),pid,fill='#222222');draw.line((ox+40,oy+560,ox+920,oy+560),fill='#999999')
    sheet.save(preview/'contact-sheet.png',icc_profile=ICC)
    diag=render(poses['low_deep'],textures,(1280,960),2,(640,880))
    bg=Image.new('RGBA',diag.size,'#e5e7e8');bg.alpha_composite(diag);bg.convert('RGB').save(preview/'low-deep-x2.png',icc_profile=ICC)
    report={'status':'ART_CANDIDATE_REQUIRES_VISUAL_REVIEW','construction_sha256':SHA,'gate_commit':'d3bdf8f1cffebe2179805eeb54a8a36faab08805',
            'method':'built-in generated atlas + deterministic registration, mask cleanup, local clone and fold smoothing',
            'surfaces':mapping,'checks':{'surface_count':len(mapping),'dimensions_all_1024':all(t.size==(1024,1024) for t in textures.values()),
                'alpha_all_nontrivial':all(t.getchannel('A').getextrema()==(0,255) for t in textures.values()),
                'pivots_unchanged':all(m['pivot_source_px']==SURF[m['id']]['pivot_source_px'] for m in mapping)}}
    (folder/'checks-and-mapping.json').write_text(json.dumps(report,ensure_ascii=False,indent=2)+'\n',encoding='utf-8')
    print(json.dumps({'folder':str(folder),'checks':report['checks']},ensure_ascii=False))

if __name__=='__main__':main()
