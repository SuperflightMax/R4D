"""EARLY_V02_02 mask ownership correction; before is read-only.
No generation, segment resizing or pose-specific artwork. Local continuation
uses rigid translations of same-side source skin and records exact masks.
"""
from pathlib import Path
import json, math
import numpy as np
from PIL import Image, ImageDraw, ImageChops, ImageFilter

ROOT=Path(__file__).resolve().parents[2]
ART=ROOT/'art'
OUT=ART/'early-v02-02'
S=Image.open(ART/'source/whole-v02.png').convert('RGBA')
T=Image.open(ART/'repairs/torso-under-arms-v01.png').convert('RGBA')
F=Image.open(ART/'repairs/far-shoulder-v01.png').convert('RGBA')
before=json.loads((ROOT/'build/early-v02-01/art/parts.json').read_text(encoding='utf-8'))
lm=json.loads((ART/'early/landmarks.json').read_text(encoding='utf-8'))
J=lm['joints']; P=lm['polygons']
for sub in ['parts','masks','extracted','reconstructed','previews']:(OUT/sub).mkdir(parents=True,exist_ok=True)

def polygon(points):
    m=Image.new('L',S.size);ImageDraw.Draw(m).polygon(points,fill=255);return m
def combine(*items):
    m=Image.new('L',S.size)
    for i in items:m=ImageChops.lighter(m,i)
    return m
def skin(image):
    a=np.array(image).astype(float);r,g,b=a[:,:,0],a[:,:,1],a[:,:,2]
    return Image.fromarray(((r>g*1.055)&(g>b*1.06)&(b>g*.46)).astype('uint8')*255)
def cloth(image):
    a=np.array(image).astype(float);r,g,b=a[:,:,0],a[:,:,1],a[:,:,2]
    return Image.fromarray(((b>g*1.03)&(r>g*1.1)).astype('uint8')*255)
def cut(im,m):
    im=im.copy();im.putalpha(ImageChops.multiply(im.getchannel('A'),m))
    a=np.array(im);a[a[:,:,3]==0,:3]=0
    return Image.fromarray(a)
def paste_local(im,plate,area):
    out=im.copy();out.paste(plate,(0,0),area);return out

torso_area=Image.open(ART/'early/masks/repair-torso-under-arms.png').convert('L')
torso_area=combine(torso_area,polygon(P['farForearm']))
far_area=Image.open(ART/'early/masks/repair-far-shoulder.png').convert('L')
body=paste_local(S,T,torso_area)

# Exact skin-pixel repair donors. Translating a local hidden skin patch is not
# stretching either the image or the anatomical segment. Do not use this as a
# visible pose-specific patch: the cloth mesh must cover the proximal extension.
donors={
 'nearThigh':{'sourceRect':[460,785,100,145],'translations':[[0,-115],[-18,-115],[35,-115]],
              'targetPoly':[(461,675),(495,659),(535,664),(568,695),(590,748),(590,788),(568,812),(456,812),(440,782),(441,730)]},
 'farThigh':{'sourceRect':[582,805,48,135],'translations':[[-20,-115],[0,-115],[10,-115]],
             'targetPoly':[(548,680),(565,665),(596,670),(618,691),(629,725),(630,791),(616,813),(562,810),(546,765)]}
}

parts=[]; reconstruction_log={}
for old in before['parts']:
    name=old['id'];m=polygon(P[name]);im=S.copy();repair=Image.new('L',S.size)
    if name in ['torso','pelvis','nearThigh','farThigh']:
        im=body.copy();repair=ImageChops.multiply(torso_area,m)
    if name=='torso':
        # Keep the exact original strap/skin boundary rather than the slightly
        # redrawn plate boundary in an otherwise visible shoulder region.
        source_shoulder=polygon([(398,220),(556,220),(556,390),(398,390)])
        im=paste_local(im,S,source_shoulder)
        repair=ImageChops.subtract(repair,source_shoulder)
        # Delete the fixed skin deltoid; the moving arm is its sole owner.
        socket=polygon([(408,239),(482,236),(523,259),(539,298),(540,345),(514,376),(467,398),(426,378),(409,335)])
        redundant=ImageChops.multiply(socket,skin(S))
        m=ImageChops.subtract(m,redundant)
        # The earlier torso crop included the top of the plum waistband.
        m=ImageChops.subtract(m,ImageChops.multiply(polygon([(430,580),(644,580),(644,640),(430,640)]),cloth(im)))
        redundant.save(OUT/'masks/torso-removed-deltoid.png')
    elif name=='pelvis':
        # All visible shorts, a SINGLE primary cloth layer, no rigid shield.
        m=ImageChops.multiply(polygon([(448,588),(526,588),(630,607),(644,672),(644,771),(590,779),(520,716),(449,773),(431,704),(431,630)]),cloth(im))
        repair=ImageChops.multiply(torso_area,m)
    elif name in ['nearThigh','farThigh']:
        if name=='nearThigh':
            m=ImageChops.subtract(m,polygon([(581,777),(635,777),(650,1009),(539,1009),(552,953),(567,892),(578,831)]))
        else:
            m=ImageChops.subtract(m,polygon([(0,760),(582,760),(577,841),(564,900),(544,963),(535,1009),(0,1009)]))
        m=ImageChops.multiply(m,skin(im))  # No plum cloth can travel with thigh.
        if name=='nearThigh':
            # The original far hand touched this border; it is not near thigh.
            m=ImageChops.subtract(m,polygon([(0,0),(454,0),(454,789),(0,789)]))
        # Its dark hem outline belongs to the shorts too, not only plum fill.
        cloth_edge=cloth(im).filter(ImageFilter.MaxFilter(3))
        m=ImageChops.subtract(m,cloth_edge)
        # Remove the original dark shorts hem as well as its coloured fill.
        seam=Image.new('L',S.size); sd=ImageDraw.Draw(seam)
        path=[(442,754),(480,744),(506,728),(520,709),(538,729),(566,744),(594,759)] if name=='nearThigh' else [(590,756),(607,764),(636,761)]
        sd.line(path,fill=255,width=10)
        m=ImageChops.subtract(m,seam)
        donor=donors[name];x,y,w,h=donor['sourceRect']
        totalpatch=Image.new('L',S.size)
        for dx,dy in donor['translations']:
            patch=Image.new('RGBA',S.size)
            patch.paste(S.crop((x,y,x+w,y+h)),(x+dx,y+dy))
            patchmask=ImageChops.multiply(polygon(donor['targetPoly']),skin(patch))
            patchmask=ImageChops.multiply(patchmask,patch.getchannel('A').point(lambda v:255 if v>=16 else 0))
            # Hidden continuation cannot invent a new external hip silhouette.
            patchmask=ImageChops.multiply(patchmask,T.getchannel('A').point(lambda v:255 if v>=128 else 0))
            # Existing correct skin takes precedence, then previous donor fills.
            patchmask=ImageChops.subtract(patchmask,ImageChops.multiply(m,im.getchannel('A').point(lambda v:255 if v>=16 else 0)))
            im=paste_local(im,patch,patchmask)
            m=combine(m,patchmask);repair=combine(repair,patchmask)
            totalpatch=combine(totalpatch,patchmask)
        totalpatch.save(OUT/f'masks/{name}-translated-skin.png')
        reconstruction_log[name]=donor
    elif name in ['nearShin','farShin']:
        m=ImageChops.multiply(m,skin(S))
        # Narrow the proximal internal cut; the patella remains on the thigh.
        if name=='nearShin':
            removed=combine(polygon([(0,0),(1023,0),(1023,947),(0,947)]),
                            polygon([(526,947),(560,947),(560,974),(540,974),(533,962)]))
        else:
            removed=combine(polygon([(0,0),(1023,0),(1023,946),(0,946)]),
                            polygon([(625,947),(660,947),(660,971),(636,971),(630,959)]))
        m=ImageChops.subtract(m,removed)
    elif name in ['nearUpperArm','nearForearm','farForearm']:
        if name=='nearUpperArm':
            m=combine(m,polygon([(417,241),(454,231),(493,237),(527,256),(545,292),(543,347),(521,380),(439,379),(414,331)]))
        m=ImageChops.multiply(m,skin(S))
    elif name=='farUpperArm':
        im=paste_local(S,F,far_area);m=ImageChops.multiply(m,skin(im));repair=ImageChops.multiply(far_area,m)
    repair=ImageChops.multiply(repair,m)
    m.save(OUT/f'masks/{name}.png');repair.save(OUT/f'masks/{name}-restored.png')
    result=cut(im,m)
    bb=result.getchannel('A').point(lambda v:255 if v>=16 else 0).getbbox()
    if not bb:raise ValueError(name)
    x0,y0,x1,y1=bb
    result.crop(bb).save(OUT/f'parts/{name}.png')
    cut(S,ImageChops.subtract(m,repair)).crop(bb).save(OUT/f'extracted/{name}.png')
    cut(im,repair).crop(bb).save(OUT/f'reconstructed/{name}.png')
    p=dict(old);p.update(file=f'early-v02-02/parts/{name}.png',cropRect=[x0,y0,x1-x0,y1-y0],
        mask=f'early-v02-02/masks/{name}.png',restorationMask=f'early-v02-02/masks/{name}-restored.png',
        provenance='whole-v02; accepted existing repair pixels + explicitly masked same-side hidden skin translations')
    if name=='pelvis':
        p['z']=35;p['rigidPelvis']=False
        p['deformation']={'kind':'shorts-primary-surface','agreement':'early-v02-02/CONTOURS.md',
                          'waist':[[450,596],[525,597],[625,613]],
                          'nearHem':[[447,755],[592,757]],'farHem':[[597,766],[634,761]],'crotch':[520,707],
                          'requiresBuilderImplementation':True}
    if name=='nearThigh':p['z']=32
    if name=='farThigh':p['z']=12
    parts.append(p)

data=dict(before);data.update(version='early-v02-02-masks-awaiting-cloth-deformation',parts=parts,
    contourAgreement='early-v02-02/CONTOURS.md',
    reconstructionLog=reconstruction_log,
    scope='Restricted neutral/low only; primary shorts deformation needs Builder. No artistic PASS.')
# Keep every anatomical joint, measured length and contact exactly as before.
assert data['jointPoints']==before['jointPoints'] and data['contacts']==before['contacts']
(OUT/'parts.json').write_text(json.dumps(data,ensure_ascii=False,indent=2)+'\n',encoding='utf-8')
(ART/'parts.json').write_text(json.dumps(data,ensure_ascii=False,indent=2)+'\n',encoding='utf-8')
(OUT/'landmarks.json').write_text(json.dumps({'joints':J,'contacts':before['contacts'],'lengths':lm['lengths'],'donors':reconstruction_log},ensure_ascii=False,indent=2)+'\n',encoding='utf-8')

assembly=Image.new('RGBA',S.size)
for p in sorted(parts,key=lambda p:p['z']):
    assembly.alpha_composite(Image.open(ART/p['file']),(p['cropRect'][0],p['cropRect'][1]))
assembly.save(OUT/'previews/source-layout.png')
for color,name in [((245,245,240),'light'),((30,34,40),'dark')]:
    canvas=Image.new('RGBA',S.size,color+(255,));canvas.alpha_composite(assembly)
    canvas.convert('RGB').save(OUT/f'previews/source-layout-{name}.jpg')
board=Image.new('RGB',(1200,600),'#eeeeea');d=ImageDraw.Draw(board)
for i,p in enumerate(parts):
    im=Image.open(ART/p['file']);im.thumbnail((180,250))
    board.paste(im,(i%6*200+10,i//6*300+35),im)
    d.text((i%6*200+5,i//6*300+8),p['id'],fill='black')
board.save(OUT/'previews/parts-audit.jpg')
for p in parts:assert Image.open(ART/p['file']).size==tuple(p['cropRect'][2:])
print('12 limited layers prepared; joints/lengths/contacts unchanged. Cloth mesh required; NOT GATE PASS.')
