"""Independent file/coverage/seam checks; --save records this local report."""
import argparse,json,hashlib
from pathlib import Path
import numpy as np
from PIL import Image,ImageFilter
import prepare_attempt03 as a

def independent_hand_envelope(pose,name,author,size,scale,origin,ss=2):
    op={'surface':name,'fragment':'all'}
    geo=np.asarray(a.v.outer_mask(pose,op,size,scale,origin,ss)).copy()
    yy,xx=np.where(geo>0)
    g=pose['surfaces'][name];b=a.BIND['surfaces'][name]
    dx=((xx+.5)/ss-origin[0])/scale-g['anatomical_landmarks']['wrist'][0]
    dy=(origin[1]-(yy+.5)/ss)/scale-g['anatomical_landmarks']['wrist'][1]
    f=g['hand_frame'];localx=dx*f['direction'][0]+dy*f['direction'][1];localy=dx*f['normal'][0]+dy*f['normal'][1]
    bf=b['hand_frame'];w=b['anatomical_landmarks']['wrist']
    sx=512+2*(w[0]+bf['direction'][0]*localx+bf['normal'][0]*localy)-.5
    sy=900-2*(w[1]+bf['direction'][1]*localx+bf['normal'][1]*localy)-.5
    geo[yy,xx]=author[np.clip(np.rint(sy).astype(int),0,1023),np.clip(np.rint(sx).astype(int),0,1023)]
    return np.asarray(Image.fromarray(geo,'L').resize(size,Image.Resampling.BOX))

def validate():
    p=json.loads((a.HERE/'package.json').read_bytes());base=json.loads((a.HERE/'validation.json').read_bytes())
    assert p['construction_sha256']==a.SHA and a.sha(a.ROOT/'construction/construction.json')==a.SHA
    assert set(s['id'] for s in p['surfaces'])==set(a.SURF)
    planes={};authors={};files=[]
    for s in p['surfaces']:
        path=a.ART/s['file'];im=Image.open(path)
        assert im.size==(1024,1024) and im.mode=='RGBA' and im.info['icc_profile']==a.ICC
        assert a.sha(path)==s['sha256'] and s['pivot_source_px']==a.SURF[s['id']]['pivot_source_px']
        alpha=np.asarray(im)[:,:,3];expected=np.asarray(a.geom_mask(a.SURF[s['id']]['geometry_bind']))
        if s['silhouette_alpha_file']:
            author=np.asarray(Image.open(a.ART/s['silhouette_alpha_file']));authors[s['id']]=author;expected=np.minimum(expected,author)
        assert np.array_equal(alpha,expected)
        assert im.getchannel('A').getextrema()==(0,255)
        planes[s['id']]=a.v.material_rgb(im)
        files.append({'surface':s['id'],'dimensions_mode_ICC_alpha_pivot_hash':'PASS','sha256':s['sha256']})
    for n,h in base['outputs_sha256'].items():assert a.sha(a.HERE/n)==h,('output changed',n)
    hand_checks=[]
    for pose in a.DATA['poses']:
        for name,author in authors.items():
            for label,size,scale,origin in [('1x',(960,640),1,(480,560)),('2x',(1920,1280),2,(960,1120))]:
                op={'surface':name,'fragment':'all'}
                actual=np.asarray(a.v.render(pose,planes,size,scale,origin,operations=[op],silhouette_alpha={name:author}))[:,:,3]
                expected=independent_hand_envelope(pose,name,author,size,scale,origin)
                core=np.asarray(Image.fromarray(expected).point(lambda x:255 if x>=128 else 0).filter(ImageFilter.MinFilter(5)))==255
                missing=int((core&(actual<128)).sum())
                # The native half-pixel conservative raster has the same rigid source map.
                outside=int(((actual>=128)&(expected<128)).sum())
                assert missing==outside==0,(pose['id'],name,label,missing,outside)
                hand_checks.append({'pose':pose['id'],'surface':name,'scale':label,'interior_gaps':missing,'opaque_outside_authored_silhouette':outside})
    wrist=[];cloth=[]
    for side in ('far','near'):
        f=a.frame(side);w=np.array(a.BIND['landmarks'][side+'_wrist'])
        for off in (-3,0,3):
            point=w-np.array(f['direction'])*3+np.array(f['normal'])*off
            xy=np.array([512+2*point[0]-.5,900-2*point[1]-.5])
            hand=a.sample(planes[side+'_hand'],xy);arm=a.sample(planes[side+'_arm_skin'],xy)
            delta=float(np.max(abs(hand-arm)));assert delta<=2,(side,'wrist material seam',delta)
            wrist.append({'side':side,'normal_offset':off,'max_channel_delta':round(delta,6)})
        patch=next(p for p in a.BIND['surfaces']['pelvis_shorts']['patches'] if p['side']==side)
        for t in (.2,.5,.8):
            point=np.array(patch['posterior_join'])*(1-t)+np.array(patch['anterior_join'])*t
            xy=np.array([512+2*point[0]-.5,900-2*point[1]-.5])
            seat=a.sample(planes['pelvis_shorts'],xy);leg=a.sample(planes[side+'_shorts_leg'],xy)
            delta=float(np.max(abs(seat-leg)));assert delta<=2,(side,'cloth material seam',delta)
            cloth.append({'side':side,'join_fraction':t,'max_channel_delta':round(delta,6)})
    return {'result':'PASS','construction_sha256':a.SHA,'files':files,'authored_hand_coverage':hand_checks,
            'wrist_material_join':wrist,'cloth_material_join':cloth,'protected_prior_files':a.protected(),
            'geometry':a.v.geometry_counts(a.DATA),'full_body_pose_checks':base['pose_checks'],
            'visual_limit':'No dark rings/repeated seams is a visual judgement; numeric colour-join checks cover stated sample points only.'}

if __name__=='__main__':
    p=argparse.ArgumentParser();p.add_argument('--save',action='store_true');args=p.parse_args()
    result=validate()
    if args.save:(a.HERE/'independent-checks.json').write_text(json.dumps(result,ensure_ascii=False,indent=2)+'\n',encoding='utf-8')
    print(json.dumps({'result':result['result'],'surfaces':len(result['files']),'hands_scales':len(result['authored_hand_coverage']),
                      'wrist_samples':result['wrist_material_join'],'cloth_samples':result['cloth_material_join'],
                      'protected_prior_files':result['protected_prior_files']},indent=2))
