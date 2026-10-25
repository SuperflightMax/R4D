"""Local painting/registration of existing generated material; static v4 review only.
Run from repository root with -B. No network, generation, construction writes or motion.
"""
import argparse,hashlib,io,json,sys
from pathlib import Path
import numpy as np
from PIL import Image,ImageDraw,ImageFilter

HERE=Path(__file__).resolve().parent
ART=HERE.parents[1];ROOT=ART.parent
sys.path.insert(0,str(ART/'scripts'))
import integration_v4 as v
SHA='7d06ea4636b49c718dad5e9d9f07000d09fa7e5cf105ec325abb84742bfdba26'
ICC=(ART/'reference/srgb.icc').read_bytes()
OLD=json.loads((ART/'attempts/02/candidate-package-v2.json').read_bytes())
DATA=v.DATA;SURF=v.SURF;BIND=DATA['poses'][0]
GRIDY,GRIDX=np.mgrid[0:1024,0:1024]
WORLD=np.stack(((GRIDX+.5-512)/2,(900-GRIDY-.5)/2),axis=-1)

def sha(p):return hashlib.sha256(p.read_bytes()).hexdigest()
def encode(im):
    b=io.BytesIO();im.save(b,format='PNG',icc_profile=ICC);return b.getvalue()
def smooth(t):
    t=np.clip(t,0,1);return t*t*(3-2*t)
def source(points):return [(512+2*x,900-2*y) for x,y in points]
def region_mask(polygons):
    im=Image.new('L',(4096,4096));p=ImageDraw.Draw(im)
    for poly in polygons:p.polygon([(4*x,4*y) for x,y in source(poly)],fill=255)
    return im.resize((1024,1024),Image.Resampling.LANCZOS)
def geom_mask(g):
    polys=[p['outline'] for p in g['patches']] if 'patches' in g else g.get('silhouette_regions',[g['outline']])
    return region_mask(polys)
def sample(rgb,xy):
    x=np.clip(xy[...,0],0,rgb.shape[1]-1);y=np.clip(xy[...,1],0,rgb.shape[0]-1)
    ix=np.floor(x).astype(int);iy=np.floor(y).astype(int);jx=np.minimum(ix+1,rgb.shape[1]-1);jy=np.minimum(iy+1,rgb.shape[0]-1)
    a=(x-ix)[...,None];b=(y-iy)[...,None]
    return rgb[iy,ix]*(1-a)*(1-b)+rgb[iy,jx]*a*(1-b)+rgb[jy,ix]*(1-a)*b+rgb[jy,jx]*a*b
def at(rgb,point):
    x=round(512+2*point[0]);y=round(900-2*point[1]);return np.median(rgb[max(0,y-2):y+3,max(0,x-2):x+3].reshape(-1,3),axis=0)
def frame(side):return BIND['surfaces'][side+'_hand']['hand_frame']
def local_coordinates(side):
    wrist=np.array(BIND['landmarks'][side+'_wrist']);f=frame(side);delta=WORLD-wrist
    return delta@np.array(f['direction']),delta@np.array(f['normal'])

def tps(points,values,query):
    points=np.array(points,float);values=np.array(values,float)
    def phi(r2):return r2*np.log(np.maximum(r2,1e-12))
    k=phi(((points[:,None]-points[None,:])**2).sum(axis=-1));p=np.column_stack((np.ones(len(points)),points))
    matrix=np.block([[k+np.eye(len(points))*1e-7,p],[p.T,np.zeros((3,3))]])
    weights=np.linalg.solve(matrix,np.vstack((values,np.zeros((3,2)))))
    flat=query.reshape(-1,2);out=np.empty_like(flat)
    for i in range(0,len(flat),65536):
        q=flat[i:i+65536];basis=phi(((q[:,None]-points[None,:])**2).sum(axis=-1))
        out[i:i+len(q)]=basis@weights[:-3]+np.column_stack((np.ones(len(q)),q))@weights[-3:]
    return out.reshape(query.shape)

def generated_hand(side):
    raw=Image.open(HERE/'reference'/(side+'_hand-raw-crop.png')).convert('RGBA')
    # Existing generated hand pixels only, extended locally for interpolation.
    rgb=v.material_rgb(raw) if raw.size==(1024,1024) else None
    ar=np.asarray(raw);rgb=np.zeros((*ar.shape[:2],3),dtype=np.uint8);valid=ar[:,:,3]>=96
    rows=np.where(valid.any(axis=1))[0]
    for y in rows:
        xs=np.where(valid[y])[0]
        for c in range(3):rgb[y,:,c]=np.interp(np.arange(ar.shape[1]),xs,ar[y,xs,c])
    for y in np.where(~valid.any(axis=1))[0]:rgb[y]=rgb[rows[np.argmin(abs(rows-y))]]
    targets=[[-7,-5],[-7,5],[0,-5.5],[0,5.5],[6.2,10.3],[8.7,5],[13,4.5],[20,4],[22.4,0],[18,-5.7],[8,-6],[8,0],[15,0]]
    refs=np.array([[2,0],[45,0],[4,25],[48,25],[55,94],[43,60],[42,84],[43,111],[33,116],[12,105],[4,70],[25,65],[27,90]],float)
    if side=='near':
        delta=refs-[28,15]
        refs=np.array([22,10])+delta[:,1,None]*np.array([.47,.883])*1.15+delta[:,0,None]*np.array([.883,-.47])
    u,w=local_coordinates(side);xy=tps(targets,refs,np.stack((u,w),axis=-1))
    return sample(rgb,xy)

def protected():
    record=json.loads((ART/'technical/v4/protected-inputs.json').read_bytes())
    redirects={str((ROOT/'ART.md').relative_to(ROOT.parents[1])).replace('\\','/') : ART/'attempts/02/ART-attempt02.md',
               str((ART/'package.json').relative_to(ROOT.parents[1])).replace('\\','/') : ART/'attempts/02/candidate-package-v2.json',
               str((ART/'validation.json').relative_to(ROOT.parents[1])).replace('\\','/') : ART/'attempts/02/candidate-validation-v2.json'}
    for name,h in record['files'].items():
        path=redirects.get(name.replace('\\','/'),ROOT.parents[1]/name)
        assert sha(path)==h,('protected evidence changed',name)
    return len(record['files'])

def textures():
    assert sha(ROOT/'construction/construction.json')==SHA
    protected();old={};planes={}
    for entry in OLD['surfaces']:
        p=ART/entry['file'];assert sha(p)==entry['sha256']
        old[entry['id']]=Image.open(p).convert('RGBA');planes[entry['id']]=v.material_rgb(old[entry['id']]).astype(float)
    masks={n:geom_mask(s['geometry_bind']) for n,s in SURF.items()}
    authors={};result={};operations={}
    for n in SURF:
        rgb=planes[n].copy();ops=[]
        if n.endswith(('_arm_skin','_leg_skin')):
            side=n.split('_')[0];joint=BIND['landmarks'][side+('_elbow' if 'arm' in n else '_knee')]
            g=BIND['surfaces'][n];a,b=np.array(g['vertices'][6]),np.array(g['vertices'][11]);tangent=np.array(BIND['landmarks'][side+('_wrist' if 'arm' in n else '_ankle')])-joint
            tangent/=np.linalg.norm(tangent);normal=np.array([-tangent[1],tangent[0]])
            width=9 if 'arm' in n else 14
            minus=at(rgb,np.array(joint)-normal*width*.45);plus=at(rgb,np.array(joint)+normal*width*.45)
            lateral=np.clip(((WORLD-np.array(joint))@normal)/(width*1.3)+.5,0,1)
            field=minus[None,None,:]*(1-lateral[:,:,None])+plus[None,None,:]*lateral[:,:,None]
            contract=DATA['fold_contracts'][n]
            z=Image.new('L',(1024,1024));ImageDraw.Draw(z).polygon([tuple(p) for p in contract['source_low_contrast_zone_px']],fill=255)
            weight=np.asarray(z.filter(ImageFilter.MaxFilter(9)).filter(ImageFilter.GaussianBlur(8))).astype(float)/255*.94
            rgb=rgb*(1-weight[:,:,None])+field*weight[:,:,None]
            ops.append('AR3 broad source-skin light in v4 fold+control zone, 8px feather, no crosswise contour')
        if n.endswith('_hand') or n.endswith('_arm_skin'):
            side=n.split('_')[0];u,w=local_coordinates(side)
            arm=planes[side+'_arm_skin'];wrist=np.array(BIND['landmarks'][side+'_wrist']);f=frame(side)
            base=at(arm,wrist-np.array(f['direction'])*4)
            edge_minus=at(arm,wrist-np.array(f['direction'])*7-np.array(f['normal'])*2)
            edge_plus=at(arm,wrist-np.array(f['direction'])*7+np.array(f['normal'])*2)
            grad=np.clip((edge_plus-edge_minus)/4,-1.5,1.5)
            field=base+np.clip(w,-7,7)[:,:,None]*grad
            if n.endswith('_hand'):
                rgb=generated_hand(side);weight=smooth((12-u)/12)
                # Two unequal very shallow distal group trims. No wrist alpha cut.
                tip=22.05-.45*np.exp(-((w+1.6)/.65)**2)-.25*np.exp(-((w-1.0)/.65)**2)
                alpha=np.clip((tip-u)*2+.5,0,1)
                alpha[u<19]=1
                authors[n]=Image.fromarray(np.rint(alpha*255).astype(np.uint8),'L')
                ops.append('AR1 landmark TPS from raw generated hand crop; v4 anatomical envelope; authored distal-group alpha')
            else:weight=smooth((u+16)/12)*(u<4)
            rgb=rgb*(1-weight[:,:,None])+field*weight[:,:,None]
            ops.append('AR1 shared forearm/hand skin field across wrist, 12-16 logical unit feather; pivot and overlap fixed')
        result[n]=rgb;operations[n]=ops
    # Paint ONE shared material field only in the seat/thigh overlap corridor.
    cloth=Image.fromarray(np.clip(planes['near_shorts_leg'],0,255).astype(np.uint8),'RGB').filter(ImageFilter.MedianFilter(11)).filter(ImageFilter.GaussianBlur(4))
    common=np.asarray(cloth).astype(float)
    fusion=np.zeros((1024,1024),float)
    for side in ('far','near'):
        hip=np.array(BIND['landmarks'][side+'_hip']);knee=np.array(BIND['landmarks'][side+'_knee']);axis=(knee-hip)/98
        t=((WORLD-hip)@axis)/98
        weight=smooth((t-.12)/.10)*smooth((.44-t)/.10)
        fusion=np.maximum(fusion,weight)
    for n in ('pelvis_shorts','far_shorts_leg','near_shorts_leg'):
        result[n]=result[n]*(1-fusion[:,:,None])+common*fusion[:,:,None]
        operations[n]=['AR2 shared existing-cloth field only at t .12-.44 around join .28; true hem .5 and upper waist retained']
    rgba={}
    for n,rgb in result.items():
        alpha=np.asarray(masks[n]).copy()
        if n in authors:alpha=np.minimum(alpha,np.asarray(authors[n]))
        rgba[n]=Image.fromarray(np.dstack((np.clip(rgb,0,255).astype(np.uint8),alpha)),'RGBA')
    return rgba,authors,operations

def core_for(pose):
    outer=v.accepted_envelope(pose);return np.asarray(outer.point(lambda x:255 if x>=128 else 0).filter(ImageFilter.MinFilter(5)))==255,np.asarray(outer)

def build():
    tex,authors,ops=textures();rgb={n:v.material_rgb(im) for n,im in tex.items()};files={};mapping=[]
    for n,im in tex.items():
        name='textures/'+n+'.png';files[name]=encode(im)
        mapping.append({'id':n,'file':'attempts/03/'+name,'source_size':[1024,1024],
                        'sha256':hashlib.sha256(files[name]).hexdigest(),'pivot_source_px':SURF[n]['pivot_source_px'],
                        'alpha_policy':'v4 registered surface plus optional explicit authored silhouette subtraction',
                        'silhouette_alpha_file':'attempts/03/silhouette-alpha/'+n+'.png' if n in authors else None,
                        'corrections':ops[n]})
    for n,im in authors.items():
        stream=io.BytesIO();im.save(stream,format='PNG');files['silhouette-alpha/'+n+'.png']=stream.getvalue()
    colors={'light':'#edf0f2','dark':'#20242c'}
    sheets={b:Image.new('RGB',(1600,2560),c) for b,c in colors.items()}
    sheets2={b:Image.new('RGB',(3200,5120),c) for b,c in colors.items()}
    rows=[];handrows=[]
    for i,p in enumerate(DATA['poses']):
        im=v.render(p,rgb,silhouette_alpha={n:np.asarray(m) for n,m in authors.items()});pixels=np.asarray(im);core,outer=core_for(p)
        gap=int((core&(pixels[:,:,3]<128)).sum());outside=int(((pixels[:,:,3]>=128)&(outer<128)).sum())
        assert gap==outside==0,(p['id'],gap,outside)
        files['preview/rgba/'+p['id']+'.png']=encode(im)
        double=v.render(p,rgb,(1920,1280),2,(960,1120),silhouette_alpha={n:np.asarray(m) for n,m in authors.items()})
        douter=v.accepted_envelope(p,(1920,1280),2,(960,1120));dc=np.asarray(douter.point(lambda x:255 if x>=128 else 0).filter(ImageFilter.MinFilter(5)))==255;da=np.asarray(double)[:,:,3]
        # Author fingertip trims are external by design; compare body core only,
        # exclude each hand envelope from x2 core to test its coverage separately.
        hand_union=np.zeros(da.shape,dtype=bool)
        for n in authors:
            op={'surface':n,'fragment':'all'}
            hm=v.outer_mask(p,op,(1920,1280),2,(960,1120),2).resize((1920,1280),Image.Resampling.BOX)
            hand_union|=np.asarray(hm)>0
        dg=int((dc&~hand_union&(da<128)).sum());do=int(((da>=128)&(np.asarray(douter)<128)).sum());assert dg==do==0,(p['id'],'x2',dg,do)
        for b,c in colors.items():
            bg=Image.new('RGBA',im.size,c);bg.alpha_composite(im);bg=bg.convert('RGB');files['preview/'+b+'/'+p['id']+'.png']=encode(bg)
            x=(i%5)*320;y=(i//5)*640;sheets[b].paste(bg.crop((340,0,660,640)),(x,y));ImageDraw.Draw(sheets[b]).text((x+8,y+12),p['id'],fill='#222222' if b=='light' else '#ffffff')
            bg2=Image.new('RGBA',double.size,c);bg2.alpha_composite(double);bg2=bg2.convert('RGB')
            x=(i%5)*640;y=(i//5)*1280;sheets2[b].paste(bg2.crop((680,0,1320,1280)),(x,y));ImageDraw.Draw(sheets2[b]).text((x+16,y+24),p['id']+' / x2',fill='#222222' if b=='light' else '#ffffff')
            if p['id'] in ('low_deep','jump_landing','range_compression'):
                files['preview/'+b+'/'+p['id']+'-x2.png']=encode(bg2.crop((400,160,1680,1120)))
        for n,mask in authors.items():
            op={'surface':n,'fragment':'all'}
            full=np.asarray(v.render(p,rgb,operations=[op]))[:,:,3]
            authored=np.asarray(v.render(p,rgb,operations=[op],silhouette_alpha={n:np.asarray(mask)}))[:,:,3]
            assert np.all(authored<=full)
            changed=int((authored<full).sum());assert changed>0,(p['id'],n,'author alpha was ignored')
            handrows.append({'pose':p['id'],'surface':n,'subtracted_pixels':changed,'alpha_not_refilled':True})
        rows.append({'pose':p['id'],'interior_gaps':gap,'opaque_outside':outside,'full_x2_body_gaps':dg,'full_x2_opaque_outside':do})
    for b in colors:
        files['preview/'+b+'-sheet-1x.png']=encode(sheets[b]);files['preview/'+b+'-sheet-2x.png']=encode(sheets2[b])
    geometry=v.geometry_counts(DATA);assert geometry['inversions']==geometry['self_intersections']==0
    assert all(im.size==(1024,1024) and im.mode=='RGBA' and im.getchannel('A').getextrema()==(0,255) for im in tex.values())
    report={'status':'ART_ATTEMPT03_REQUIRES_CONCEPT_BUILDER_REVIEW','construction_sha256':SHA,'additional_imagegen_calls':0,
            'geometry':geometry,'protected_previous_files':protected(),'dimensions_alpha_ICC_pivots':'PASS',
            'pose_checks':rows,'authored_hand_alpha_checks':handrows,
            'surface_count':len(mapping),'retouched_surfaces':[n for n in ops if ops[n]],
            'note':'numeric tests do not certify absence of painted seams; visual review is separate',
            'outputs_sha256':{n:hashlib.sha256(b).hexdigest() for n,b in files.items()}}
    package={'status':'ART_READY_FOR_CONCEPT_AND_BUILDER_REVIEW','selected_attempt':'03','construction_sha256':SHA,
             'prior_candidate_manifest':'attempts/02/candidate-package-v2.json','validation':'attempts/03/validation.json',
             'renderer_contract':'v4 explicit mesh/UV and per-fragment silhouette; hand author alpha must be passed separately',
             'surfaces':mapping}
    files['package.json']=(json.dumps(package,ensure_ascii=False,indent=2)+'\n').encode('utf-8')
    files['validation.json']=(json.dumps(report,ensure_ascii=False,indent=2)+'\n').encode('utf-8')
    return files,report

def main():
    p=argparse.ArgumentParser();p.add_argument('--check',action='store_true');args=p.parse_args()
    files,report=build()
    for name,body in files.items():
        path=HERE/name
        if args.check:assert path.read_bytes()==body,('reproduction mismatch',name)
        else:path.parent.mkdir(parents=True,exist_ok=True);path.write_bytes(body)
    print(json.dumps({'result':'PASS','mode':'read-only byte reproduction' if args.check else 'write attempt03 only',
                      'files':len(files),'surfaces':report['surface_count'],'poses':len(report['pose_checks']),
                      'hand_alpha_cases':len(report['authored_hand_alpha_checks']),'geometry':report['geometry']},indent=2))

if __name__=='__main__':main()
