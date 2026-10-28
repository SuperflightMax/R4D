"""P4 VQA-01: parameter-only shadow correction, static proposal, no simulation.

No consumer/native source is copied or executed. The saved QA state supplies
only the exact still position. --package creates a new artwork-only packet.
"""
import copy
import hashlib
import json
import os
from pathlib import Path
import shutil
import sys

import numpy as np
from PIL import Image, ImageDraw

ROOT=Path(__file__).resolve().parents[1]
OLD=ROOT/'full-v02'
NEW=ROOT/'full-v03'
RUNTIME=Path(os.environ.get('P4_ASSET_RUNTIME',r'E:\R4D\perspective\p4-runtime\asset-artist'))/'shadow-v03'
QA=Path(r'E:\R4D\perspective\p4-worktrees\visual-qa\experiments\p4-extracted-objects\qa\visual\evidence\frozen02-qa-01')
FROZEN=Path(r'E:\R4D\perspective\p4-runtime\builder\candidates\p4-full-v02-candidate-02\art')
OLD_SHA='209350371d807a879fef1ab61a2aff02868d4e24414892f4d50a17cee02c5543'
OFFSET=[-0.95,0.86]
HALF=[1.55,0.58]
OPACITY=0.65


def sha(p):return hashlib.sha256(Path(p).read_bytes()).hexdigest()


def write(p,value):Path(p).write_text(json.dumps(value,ensure_ascii=False,indent=2)+'\n',encoding='utf-8',newline='\n')


def project(h,p):
    q=np.asarray(h)@np.array([p['x'],p['y'],1.0]);return [q[0]/q[2],q[1]/q[2]]


def actor_image(ball,key,center,radius):
    spec=ball[key];im=Image.open(OLD/spec['file']).convert('RGBA')
    if key=='body':
        sx=sy=radius/spec['contentRadiusPx'][0];p=center;opacity=1
    else:
        off=ball['render']['shadowSourceCenterOffsetR'];half=ball['render']['shadowSourceContentHalfSizeR']
        sx=half[0]*radius/spec['contentRadiusPx'][0];sy=half[1]*radius/spec['contentRadiusPx'][1]
        p=[center[0]+off[0]*radius,center[1]+off[1]*radius];opacity=spec['opacityMultiplier']
    cx,cy=spec['centerLocalPx']
    im=im.transform((1536,1536),Image.Transform.AFFINE,(1/sx,0,cx-p[0]/sx,0,1/sy,cy-p[1]/sy),resample=Image.Resampling.BICUBIC)
    if opacity!=1:im.putalpha(im.getchannel('A').point(lambda a:round(a*opacity)))
    return im


def scene(m,state):
    image=Image.open(OLD/m['background']['file']).convert('RGBA')
    ground=[];bodies=[];front=[];receiver=[]
    for obj in m['objects']:
        for p in obj['parts']:
            if p['role']=='ground-shadow':ground.append(p)
            elif p['depth']['layer']=='receiver-front':receiver.append(p)
            else:bodies.append((p['depth']['sortNativeY'],p))
    def place(part):
        r=part['sourceRectPx'];image.alpha_composite(Image.open(OLD/part['file']).convert('RGBA'),(r['x'],r['y']))
    for p in ground:place(p)
    h=m['p1']['nativeToSource'];pos=state['ball']['pos'];center=project(h,pos)
    radius=m['ball']['nativeRadius']/(h[2][0]*pos['x']+h[2][1]*pos['y']+h[2][2])
    shadow=actor_image(m['ball'],'shadow',center,radius);body=actor_image(m['ball'],'body',center,radius)
    image=Image.alpha_composite(image,shadow)
    bodies.append((pos['y'],None))
    for _,part in sorted(bodies,key=lambda t:t[0]):
        if part is None:image=Image.alpha_composite(image,body)
        else:place(part)
    for p in m['sceneParts']:place(p)
    for p in receiver:place(p)
    # Diagnostic of exposed opacity, not a perceptual or live-render PASS.
    a=np.array(shadow.getchannel('A'),dtype=float)/255
    b=np.array(body.getchannel('A'),dtype=float)/255
    exposed=a*(1-b)
    css=Image.fromarray(np.uint8(exposed*255)).resize((574,574),Image.Resampling.LANCZOS)
    e=np.array(css,dtype=float)/255
    metrics={'radiusSourcePx':radius,'centerSourcePx':center,'maxExposedAlphaCss':float(e.max()),'exposedAlphaAreaCssPx':float(e.sum()),'exposedPixelsAlphaAtLeast0_10':int(np.sum(e>=.10)),'exposedPixelsAlphaAtLeast0_20':int(np.sum(e>=.20)),'uncoveredShadowAlphaFraction':float(exposed.sum()/a.sum())}
    return image,metrics


def main():
    assert sha(OLD/'manifest.json')==sha(FROZEN/'manifest.json')==OLD_SHA
    assert shutil.disk_usage(RUNTIME.parent).free>2*1024**3,'E <= 2GiB: stop'
    RUNTIME.mkdir(parents=True,exist_ok=True)
    index=json.loads((QA/'review-index.json').read_bytes())
    ref=next(s for s in index['screenshots'] if s['file']=='30-ball-shadow-seed1842222754-t590-normal.jpg')
    assert ref['state']['seed']==1842222754 and ref['state']['tick']==590
    assert sha(QA/ref['file'])==ref['imageSha256']
    before=json.loads((OLD/'manifest.json').read_bytes());after=copy.deepcopy(before)
    assert sha(OLD/before['ball']['shadow']['file'])==sha(FROZEN/before['ball']['shadow']['file'])==before['ball']['shadow']['sha256']
    after['version']='p4-full-v03'
    after['status']='VQA-01 shadow-only parameter correction proposal; pending actual consumer and independent VQA'
    after['ball']['render']['shadowSourceCenterOffsetR']=OFFSET
    after['ball']['render']['shadowSourceContentHalfSizeR']=HALF
    after['ball']['shadow']['opacityMultiplier']=OPACITY
    after['ball']['placement']['shadowCenterSourcePx']='P + [-0.95*R, +0.86*R]'
    after['ball']['placement']['shadowContentHalfSizeSourcePx']='[1.55*R, 0.58*R]; scale content bounds, not transparent canvas'
    after['remaining']=before['remaining']+['VQA-01: new shadow parameters have only an Artist static before/after; actual same-state consumer and independent VQA still required']
    for key in ('source','p1','registration','background','objects','sceneParts'):
        assert before[key]==after[key],key
    assert before['ball']['body']==after['ball']['body'] and before['ball']['nativeRadius']==after['ball']['nativeRadius']==16
    assert before['ball']['shadow']['file']==after['ball']['shadow']['file'] and before['ball']['shadow']['sha256']==after['ball']['shadow']['sha256']
    old,old_metrics=scene(before,ref['state']);new,new_metrics=scene(after,ref['state'])
    old.save(RUNTIME/'before-t590-source.png');new.save(RUNTIME/'after-t590-source.png')
    comparison=Image.new('RGB',(1206,648),(225,230,224));d=ImageDraw.Draw(comparison)
    for i,(im,label) in enumerate(((old,'full-v02: current shadow'),(new,'full-v03: proposed shadow'))):
        x=10+i*606;comparison.paste(im.resize((574,574),Image.Resampling.LANCZOS).convert('RGB'),(x,42));d.text((x,18),label,fill=(20,30,20))
    d.text((10,626),'ARTIST STATIC RECONSTRUCTION - same saved seed1842222754/t590, each board574x574 - not live proof',fill=(20,30,20))
    comparison.save(RUNTIME/'shadow-before-after-normal574.png')
    # Detail is supplementary; the full 574px boards above are the target scale.
    center=old_metrics['centerSourcePx'];box=(round(center[0]-75),round(center[1]-55),round(center[0]+75),round(center[1]+75))
    detail=Image.new('RGB',(940,450),(225,230,224));dd=ImageDraw.Draw(detail)
    for i,(im,label) in enumerate(((old,'full-v02 detail'),(new,'full-v03 detail'))):
        detail.paste(im.crop(box).resize((450,390),Image.Resampling.NEAREST).convert('RGB'),(i*470,30));dd.text((i*470+8,8),label+' - supplementary static crop',fill=(20,30,20))
    detail.save(RUNTIME/'shadow-before-after-detail.png')
    proposal={'kind':'Artist static proposal, not consumer/QA proof','sourceArtistCommit':'b2c0339704c9a6a86e4a1188b0022ba724aadd43','oldManifestSha256':OLD_SHA,'frozenArtifactSha256':'c7815edc846749478e56e76d072233ae5a6fcd0ee86d2c14f9936379bff9b757','consumerSourceReviewed':'b2db9e947ebf2213e725a66f1e778f9137b14d5f','qaNormalReference':ref,'changedFields':{'ball.render.shadowSourceCenterOffsetR':{'before':before['ball']['render']['shadowSourceCenterOffsetR'],'after':OFFSET},'ball.render.shadowSourceContentHalfSizeR':{'before':before['ball']['render']['shadowSourceContentHalfSizeR'],'after':HALF},'ball.shadow.opacityMultiplier':{'before':before['ball']['shadow']['opacityMultiplier'],'after':OPACITY}},'shadowPngUnchangedSha256':before['ball']['shadow']['sha256'],'bodyPngUnchangedSha256':before['ball']['body']['sha256'],'diagnosis':'Consumer source applies declared content radii, pivot, offset, size and opacity correctly. No source-level mismatch found. At574px most of the dense old shadow is hidden behind the sphere; exposed edge is too small/faint. This is an artwork display-parameter correction, not a P1/core/body adjustment. Actual GPU application still requires Builder confirmation.','staticMetricsBefore':old_metrics,'staticMetricsAfter':new_metrics,'limits':['static PNG composition is not the live Pixi renderer','no new physics run, seed hunt or post-capture sinking','same-state consumer/VQA still required','receiver01/03 and partial rim capture remain unconfirmed']}
    proposal['builderActualConfirmation']={'receivedVia':'Lead, same shadow-only continuation','candidate':'p4-full-v02-candidate-02','viewportPx':[1280,720],'tick':590,'shadowOpacity':0.42,'visibleShadowSpriteCount':1,'shadowHalfHeightCssPx':2.29,'contentBoundsScaleOffsetMatch':True,'doubleOpacityOrPremultiplyFound':False,'scope':'old current02 mapping confirmed; new full-v03 rendering still pending'}
    proposal['diagnosis']='Exact consumer source applies content radii, pivot, offset, size and opacity correctly. Builder via Lead also confirmed live current02 mapping: alpha0.42, one shadow sprite, correct scale/offset and no repeated opacity/premultiply. The dense old shadow center lies inside the sphere and only a small faint edge remains visible at574px. Correct display parameters only; keep both PNGs, body position/r16/P1/core. New full-v03 parameters still need same-state actual consumer and independent VQA.'
    write(RUNTIME/'proposal.json',proposal)
    if '--package' in sys.argv:
        NEW.mkdir(exist_ok=True)
        names={before['background']['file'],before['background']['provenance']['regionMask'],before['ball']['body']['file'],before['ball']['shadow']['file']}
        names|={p['file'] for o in before['objects'] for p in o['parts']}
        names|={p['file'] for p in before['sceneParts']}
        for name in names:
            shutil.copy2(OLD/name,NEW/name);assert sha(OLD/name)==sha(NEW/name),name
        for name in ('shadow-before-after-normal574.png','shadow-before-after-detail.png','proposal.json'):
            shutil.copy2(RUNTIME/name,NEW/name)
        write(NEW/'manifest.json',after)
        write(NEW/'provenance.json',{'version':'p4-full-v03','parentManifestSha256':OLD_SHA,'kind':'display-parameter-only shadow correction','generationCalls':0,'allCopiedComponentsByteIdentical':len(names),'bodyAndShadowRawPreserved':True,'changedFields':proposal['changedFields'],'reason':proposal['diagnosis'],'evidence':'proposal.json','rawExtractionProvenance':'../full-v02/provenance.json','finalArtPass':False})
        write(NEW/'preparation-checks.json',{'sourceManifestVerified':OLD_SHA,'copiedPngCount':len(names),'allCopiedPngByteIdentical':True,'nonActorComponentsUnchanged':True,'ballBodyDefinitionUnchanged':True,'ballNativeRadiusUnchanged':16,'p1ConfigProjectionAnchorsUnchanged':True,'consumerSourceIncluded':False,'staticProposalOnly':True})
        write(NEW/'file-hashes.json',{p.name:{'sha256':sha(p),'bytes':p.stat().st_size} for p in sorted(NEW.iterdir()) if p.is_file() and p.name!='file-hashes.json'})
    print(json.dumps({'before':old_metrics,'after':new_metrics,'packageCreated':'--package' in sys.argv,'manifestSha256':sha(NEW/'manifest.json') if '--package' in sys.argv else None}))


if __name__=='__main__':main()
