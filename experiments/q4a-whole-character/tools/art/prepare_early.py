"""Q4A: explicit source masks/crops for the authorized neutral/low test.
No AI calls, rescaling, generative painting or pose-specific artwork here.
The two imagegen repair plates supply only named occluded regions.
"""
from pathlib import Path
import json, math
from PIL import Image, ImageDraw, ImageChops
import numpy as np

ROOT = Path(__file__).resolve().parents[2]
ART = ROOT / 'art'
SRC = Image.open(ART/'source/whole-v02.png').convert('RGBA')
TORSO = Image.open(ART/'repairs/torso-under-arms-v01.png').convert('RGBA')
FAR = Image.open(ART/'repairs/far-shoulder-v01.png').convert('RGBA')
assert SRC.size == TORSO.size == FAR.size == (1024,1536)
for p in ['early/parts','early/masks','early/extracted','early/reconstructed','early/previews']:
    (ART/p).mkdir(parents=True, exist_ok=True)

def mask(poly):
    m=Image.new('L', SRC.size)
    ImageDraw.Draw(m).polygon(poly, fill=255)
    return m

def union(*masks):
    out=Image.new('L',SRC.size)
    for m in masks: out=ImageChops.lighter(out,m)
    return out

def skin_only(m, image=SRC):
    # Supplement explicit anatomical contours: exclude mustard/plum cloth.
    a=np.array(image).astype(float)
    r,g,b=a[:,:,0],a[:,:,1],a[:,:,2]
    skin=(r>g*1.055)&(g>b*1.06)&(b>g*.46)
    return Image.fromarray((np.array(m)*skin).astype('uint8'))

def cut(im,m):
    out=im.copy()
    out.putalpha(ImageChops.multiply(im.getchannel('A'),m))
    a=np.array(out)
    a[a[:,:,3]==0,:3]=0  # Derived files only; avoid hidden-RGB filter bleed.
    return Image.fromarray(a)

joint={
 'pelvis':[538,645], 'chest':[540,405], 'neck':[528,222], 'head':[535,114],
 'nearShoulder':[477,304], 'nearElbow':[505,518], 'nearWrist':[633,682], 'nearHand':[660,753],
 'farShoulder':[444,321], 'farElbow':[403,508], 'farWrist':[411,688], 'farHand':[410,746],
 'nearHip':[525,685], 'nearKnee':[503,967], 'nearAnkle':[393,1325], 'nearToe':[518,1387],
 'farHip':[570,690], 'farKnee':[606,960], 'farAnkle':[595,1316], 'farToe':[746,1370]
}
contacts={'near':{'heel':[380,1439],'toe':[500,1451]},
          'far':{'heel':[580,1412],'toe':[720,1416]}}

# Source-coordinate polygons; boundaries are semantic, not bounding boxes.
polys={
 'torso':[(395,0),(650,0),(650,225),(580,225),(632,350),(635,621),(450,621),(447,590),(462,530),(461,450),(445,400),(410,360),(395,300)],
 'pelvis':[(449,590),(627,607),(634,646),(627,674),(594,687),(542,681),(500,680),(458,694),(439,675),(437,631)],
 'nearUpperArm':[(444,250),(482,246),(513,260),(534,287),(542,330),(538,383),(537,431),(545,476),(539,507),(522,532),(494,535),(477,514),(466,475),(451,440),(439,399),(433,352),(416,319),(420,282)],
 'nearForearm':[(482,493),(515,494),(540,509),(562,550),(586,588),(612,624),(640,655),(653,673),(673,697),(682,725),(694,758),(691,782),(680,798),(662,794),(651,790),(643,803),(627,793),(623,778),(610,770),(600,749),(591,717),(581,691),(558,666),(538,641),(517,617),(500,588),(486,560),(476,535)],
 'farUpperArm':[(429,315),(466,318),(478,345),(462,387),(450,430),(443,467),(428,501),(417,530),(393,535),(377,515),(382,488),(392,453),(398,415),(398,372),(409,337)],
 'farForearm':[(382,486),(423,491),(440,528),(438,579),(430,631),(429,672),(437,702),(448,739),(443,773),(427,801),(407,803),(390,783),(374,756),(375,716),(388,685),(387,647),(378,592),(373,539)],
 'nearThigh':[(453,652),(485,638),(528,636),(557,654),(578,689),(589,735),(585,786),(579,836),(561,885),(549,932),(540,969),(522,991),(491,994),(470,978),(458,946),(455,898),(449,844),(446,788),(442,736),(439,695)],
 'farThigh':[(548,653),(577,639),(608,649),(628,678),(634,727),(633,788),(633,847),(638,905),(640,953),(630,984),(601,991),(579,977),(562,945),(550,895),(543,842),(539,788),(536,733),(535,690)],
 'nearShin':[(473,942),(506,937),(535,949),(543,973),(530,1003),(514,1049),(496,1096),(482,1146),(467,1201),(451,1258),(441,1307),(443,1345),(417,1370),(377,1370),(350,1350),(361,1303),(369,1251),(373,1198),(375,1149),(373,1105),(383,1067),(405,1027),(432,988)],
 'farShin':[(576,938),(605,934),(631,944),(640,966),(632,1003),(630,1050),(631,1098),(628,1145),(625,1204),(627,1259),(645,1306),(648,1345),(625,1365),(588,1369),(558,1345),(558,1300),(558,1247),(552,1198),(546,1150),(535,1107),(530,1061),(541,1019),(554,979)],
 'nearFoot':[(349,1329),(379,1327),(401,1344),(429,1331),(446,1328),(453,1350),(477,1365),(503,1380),(534,1391),(559,1404),(570,1420),(566,1442),(544,1456),(485,1464),(424,1457),(368,1450),(332,1442),(311,1428),(316,1390),(332,1366)],
 'farFoot':[(558,1319),(585,1317),(607,1327),(624,1312),(645,1305),(658,1328),(689,1347),(722,1360),(754,1369),(781,1374),(792,1387),(786,1406),(756,1422),(706,1426),(651,1418),(602,1418),(563,1410),(534,1396),(531,1374),(544,1344)]
}

defs=[
 ('farUpperArm','farShoulder','farElbow',5),('farForearm','farElbow','farWrist',6),
 ('farThigh','farHip','farKnee',10),('farShin','farKnee','farAnkle',11),('farFoot','farAnkle','farToe',12),
 ('torso','pelvis','neck',20),('pelvis','pelvis','chest',25),
 ('nearThigh','nearHip','nearKnee',30),('nearShin','nearKnee','nearAnkle',31),('nearFoot','nearAnkle','nearToe',32),
 ('nearUpperArm','nearShoulder','nearElbow',40),('nearForearm','nearElbow','nearWrist',41)]

# Local repair acceptance masks, separate from extraction masks. Everything
# outside these stays from the unchanged whole-v02 image.
torso_repair=union(mask([(414,245),(488,239),(539,282),(548,436),(580,533),(622,612),(633,674),(589,713),(525,683),(478,592),(447,519),(437,401)]),mask(polys['nearForearm']))
far_repair=mask([(405,320),(470,310),(480,355),(459,415),(446,467),(420,484),(393,466),(392,400)])
torso_repair.save(ART/'early/masks/repair-torso-under-arms.png')
far_repair.save(ART/'early/masks/repair-far-shoulder.png')
parts=[]
for name,fr,to,z in defs:
    m=mask(polys[name])
    if name in ['nearUpperArm','nearForearm','farForearm']:
        m=skin_only(m)
    if name=='nearThigh':
        # Its visible left contour borders the far thigh: use that actual seam.
        m=ImageChops.subtract(m,mask([(581,777),(635,777),(650,1009),(539,1009),(552,953),(567,892),(578,831)]))
    if name=='farThigh':
        # Only the source right-hand leg belongs to far chain below shorts.
        m=ImageChops.subtract(m,mask([(0,760),(582,760),(577,841),(564,900),(544,963),(535,1009),(0,1009)]))
    # Clothing stays only in the deliberate proximal thigh region, not bare shin.
    if name in ['nearShin','farShin']:
        m=skin_only(m)
    if name=='pelvis':
        rgb=np.array(TORSO).astype(float)
        cloth=(rgb[:,:,2]>rgb[:,:,1]*1.03)&(rgb[:,:,0]>rgb[:,:,1]*1.1)
        m=Image.fromarray((np.array(m)*cloth).astype('uint8'))
    repair=Image.new('L',SRC.size)
    im=SRC.copy()
    if name in ['torso','pelvis','nearThigh','farThigh']:
        repair=ImageChops.multiply(torso_repair,m)
        im.paste(TORSO,(0,0),repair)
    if name=='farUpperArm':
        repair=ImageChops.multiply(far_repair,m)
        im.paste(FAR,(0,0),repair)
        m=skin_only(m,im)
        repair=ImageChops.multiply(repair,m)
    # No yellow/plum pixels in bare arms, no opposite thigh borrowed as skin.
    m.save(ART/f'early/masks/{name}.png')
    repair.save(ART/f'early/masks/{name}-restored.png')
    extracted=cut(SRC,ImageChops.subtract(m,repair))
    restored=cut(im,ImageChops.multiply(m,repair))
    complete=cut(im,m)
    bounds=complete.getchannel('A').point(lambda v:255 if v>=16 else 0).getbbox()
    if not bounds: raise ValueError(name)
    # Include full accepted mask where it intersects meaningful alpha.
    x0,y0,x1,y1=bounds
    extracted.crop(bounds).save(ART/f'early/extracted/{name}.png')
    restored.crop(bounds).save(ART/f'early/reconstructed/{name}.png')
    complete.crop(bounds).save(ART/f'early/parts/{name}.png')
    parts.append({'id':name,'file':f'early/parts/{name}.png','cropRect':[x0,y0,x1-x0,y1-y0],
                  'from':fr,'to':to,'z':z,'rigidPelvis':name=='pelvis',
                  'side':'far' if name.startswith('far') else 'near' if name.startswith('near') else 'center',
                  'mask':f'early/masks/{name}.png','restorationMask':f'early/masks/{name}-restored.png',
                  'provenance':'whole-v02 pixels; named local repair only where restorationMask is nonzero'})

lengths={}
for side in ['near','far']:
    for label,a,b in [('thigh','Hip','Knee'),('shin','Knee','Ankle'),('upperArm','Shoulder','Elbow'),('forearm','Elbow','Wrist')]:
        A=joint[side+a];B=joint[side+b]
        lengths[side+label]={'from':side+a,'to':side+b,'length':math.dist(A,B),'axis':[B[0]-A[0],B[1]-A[1]]}
data={'version':'early-v01-neutral-low-only','scope':'restricted early gate; no full candidate',
      'source':'source/whole-v02.png','sourceSize':list(SRC.size),'figureBounds':[314,20,473,1433],
      'jointPoints':joint,'contacts':contacts,'groundY':1451,'measurements':lengths,
      'landmarkNote':'Manual anatomical interpretation; far shoulder/hips inferred under occlusion. Contacts are actual outsole pixel locations, not matched baseline.',
      'parts':parts}
(ART/'parts.json').write_text(json.dumps(data,ensure_ascii=False,indent=2)+'\n',encoding='utf-8')
(ART/'early/landmarks.json').write_text(json.dumps({'joints':joint,'contacts':contacts,'lengths':lengths,'polygons':polys},ensure_ascii=False,indent=2)+'\n',encoding='utf-8')

# Source-layout and masks are review artifacts, not animation proofs.
assembly=Image.new('RGBA',SRC.size)
for part in sorted(parts,key=lambda p:p['z']):
    im=Image.open(ART/part['file']); assembly.alpha_composite(im,(part['cropRect'][0],part['cropRect'][1]))
assembly.save(ART/'early/previews/source-layout.png')
for background,name in [((245,245,240),'light'),((30,34,40),'dark')]:
    board=Image.new('RGBA',SRC.size,background+(255,)); board.alpha_composite(assembly)
    board.convert('RGB').save(ART/f'early/previews/source-layout-{name}.jpg')
overlay=SRC.copy(); d=ImageDraw.Draw(overlay)
for k,p in joint.items():
    x,y=p;d.ellipse((x-4,y-4,x+4,y+4),fill='#00dfff');d.text((x+5,y),k,fill='#00dfff')
for side,c in contacts.items():
    d.line([tuple(c['heel']),tuple(c['toe'])],fill='#ff3050',width=3)
overlay.save(ART/'early/previews/landmarks.png')
print(json.dumps({'parts':len(parts),'lengths':lengths,'contract':str(ART/'parts.json')},ensure_ascii=False))
