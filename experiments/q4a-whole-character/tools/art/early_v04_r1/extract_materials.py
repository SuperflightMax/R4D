"""Minimal v04 source extraction. Explicit local reconstructed subset only."""
from pathlib import Path
from PIL import Image,ImageDraw,ImageChops
import numpy as np,json,hashlib,cv2
ROOT=Path(__file__).resolve().parents[3];ART=ROOT/'art/early-v04-r1';OUT=ART/'materials';OUT.mkdir(exist_ok=True)
SRC=ROOT/'art/whole-v04/raw/whole-v04.png';im=Image.open(SRC).convert('RGBA');W,H=im.size
def mask(poly):
 m=Image.new('L',(W*4,H*4));ImageDraw.Draw(m).polygon([(int(x*4),int(y*4)) for x,y in poly],fill=255)
 return m.resize((W,H),Image.Resampling.LANCZOS)
def extract(m,base=im):
 r=base.copy();r.putalpha(ImageChops.multiply(base.getchannel('A'),m));return r
nearpoly=[(350,250),(1024,250),(1024,750),(780,750),(650,580),(550,520),(430,420),(350,400)]
farpoly=[(362,327),(385,386),(380,435),(351,486),(328,532),(301,578),(267,637),(231,699),(226,741),(214,794),(173,827),(128,815),(119,754),(148,698),(185,654),(217,577),(252,506),(286,449),(319,391),(341,350)]
shortpoly=[(392,610),(430,611),(484,619),(532,631),(571,638),(577,666),(588,693),(600,719),(610,749),(625,784),(640,816),(653,831),(628,840),(601,851),(571,866),(544,879),(529,884),(513,862),(501,843),(495,857),(462,850),(423,839),(386,833),(361,827),(365,795),(372,764),(376,742),(369,717),(368,684),(373,651),(383,623)]
near=mask(nearpoly);far=mask(farpoly);shorts=mask(shortpoly)
# Skin owns arm. Remove connected mustard fringe from this hand-traced envelope,
# then fill internal skin-texture holes; no synthetic skin/color is introduced.
hsv=cv2.cvtColor(np.array(im)[:,:,:3],cv2.COLOR_RGB2HSV)
rgb=np.array(im)[:,:,:3].astype('int16')
gold=((hsv[:,:,0]>=14)&(hsv[:,:,1]>=172))|((hsv[:,:,0]>=19)&((rgb[:,:,1]-rgb[:,:,2])>50))
candidate=(np.array(near)>127)&~gold&(np.array(im)[:,:,3]>15)
contours,_=cv2.findContours(candidate.astype('uint8'),cv2.RETR_EXTERNAL,cv2.CHAIN_APPROX_SIMPLE)
skin=np.zeros((H,W),dtype='uint8');cv2.drawContours(skin,[max(contours,key=cv2.contourArea)],-1,255,cv2.FILLED)
near=Image.fromarray(skin)
# Keep plum garment only; the hand envelope must not give the cage a skin strip
# below either cuff or a mustard sliver from the tank waistband overlap.
cloth=(np.array(shorts)>127)&(hsv[:,:,0]>125)&(hsv[:,:,1]>40)&(np.array(im)[:,:,3]>15)
cc,_=cv2.findContours(cloth.astype('uint8'),cv2.RETR_EXTERNAL,cv2.CHAIN_APPROX_SIMPLE)
cm=np.zeros((H,W),dtype='uint8');maincloth=max(cc,key=cv2.contourArea);cv2.drawContours(cm,[maincloth],-1,255,cv2.FILLED)
shorts=Image.fromarray(cm)
actualcloth=cv2.approxPolyDP(maincloth,1.0,True).reshape(-1,2).tolist()
# Source-only thigh/shin overlap is the same visible skin near each knee;
# no hidden skin is generated or silently cloned under clothing.
polys={
 'near_thigh':[(170,822),(515,822),(515,1045),(170,1045)],
 'far_thigh':[(505,822),(780,822),(780,1045),(505,1045)],
 'near_shin':[(140,940),(515,940),(515,1395),(140,1395)],
 'far_shin':[(550,940),(790,940),(790,1395),(550,1395)],
 'near_shoe':[(188,1335),(214,1321),(244,1337),(265,1341),(290,1333),(322,1326),(347,1354),(374,1372),(406,1388),(441,1397),(471,1407),(497,1430),(496,1481),(175,1481),(174,1409)],
 'far_shoe':[(633,1339),(660,1333),(689,1343),(711,1344),(735,1334),(760,1325),(779,1360),(814,1378),(856,1392),(899,1402),(930,1416),(940,1480),(609,1480),(607,1410)]}
masks={'near_arm':near,'far_arm':far,'hip_shorts':shorts}
for k,p in polys.items():masks[k]=mask(p)
# Remove clothing from skin extracts, preserving only original visible skin.
for k in ['near_thigh','far_thigh']:
 masks[k]=ImageChops.subtract(masks[k],shorts)
# Knee and ankle overlaps intentionally retain duplicated original visible skin;
# no artificial complementary alpha seam is introduced at the same rest pose.
# Original body above waist, with arm pixels removed from torso owner.
torso=mask([(300,0),(650,0),(650,235),(570,300),(595,360),(600,435),(580,510),(576,640),(529,631),(483,621),(433,613),(393,613),(398,573),(402,524),(389,476),(370,428),(361,383),(349,345),(356,305),(393,265),(426,239),(420,205),(300,205)])
torso=ImageChops.subtract(ImageChops.subtract(torso,near),far)
req=json.loads((ART/'repairs/tank-01/REQUEST.json').read_text())
hidden=mask(req['hiddenPolygonRaw'])
# Expose the exact extracted missing-tank corridor within the same approved
# hidden subset, without broadening reconstruction into visible raw pixels.
# The repair is bounded above by the existing mask; extraction reserves remain
# flagged for Builder if the original subset is not enough in motion.
repair=Image.open(ART/'repairs/tank-01/attempt02-result-raw.png').convert('RGBA').resize((340,340),Image.Resampling.LANCZOS)
recon=Image.new('RGBA',im.size);recon.paste(repair,(320,220))
# Hidden reconstruction composited beneath source torso, not over visible source.
hidden_patch=extract(hidden,recon)
body=Image.alpha_composite(hidden_patch,extract(torso))
materials={k:extract(m) for k,m in masks.items()};materials['torso_head_tank']=body
for k,r in materials.items():r.save(OUT/(k+'.png'))
hidden_patch.save(OUT/'torso_hidden_reconstruction.png')
for k,m in {**masks,'torso_source':torso,'tank_hidden':hidden}.items():
 (ART/'masks').mkdir(exist_ok=True);m.save(ART/'masks'/(k+'.png'))
# Exact initial source-space assembly: far leg, near leg, garment, rear arm, torso, near arm.
order=['far_thigh','far_shin','far_shoe','near_thigh','near_shin','near_shoe','hip_shorts','far_arm','torso_head_tank','near_arm']
assembly=Image.new('RGBA',im.size)
for k in order:assembly=Image.alpha_composite(assembly,materials[k])
assembly.save(ART/'diagnostics/initial-assembly.png')
for name,c in [('light',(245,245,240,255)),('dark',(30,34,40,255))]:
 Image.alpha_composite(Image.new('RGBA',im.size,c),assembly).save(ART/f'diagnostics/initial-assembly-{name}.png')
trace={'canvas':[1024,1536],'boundary':actualcloth,'handTraceEnvelope':shortpoly,
 'waistband':[[392,610],[430,611],[484,619],[532,631],[571,638]],
 'nearLegOpening':[[361,827],[386,833],[423,839],[462,850],[495,857]],
 'farLegOpening':[[529,884],[544,879],[571,866],[601,851],[628,840],[653,831]],
 'sideSeam':[[455,625],[445,690],[431,752],[408,835]],
 'crotchSeam':[[562,639],[567,675],[574,705],[560,733],[544,745],[530,758],[514,792],[501,843]],
 'owner':'one continuous hip/shorts cage; waistband pelvis, openings their thighs','hidden':'Exact internal crotch/skin under cuffs not present; no automatic repair.'}
(ART/'SHORTS_TRACE.json').write_text(json.dumps(trace,indent=2)+'\n',encoding='utf-8')
manifest={'version':'v04-r1-materials01','canvas':[W,H],'source':'art/whole-v04/raw/whole-v04.png','sourceSHA256':hashlib.sha256(SRC.read_bytes()).hexdigest(),'coordinates':'full source canvas; cropRect [x,y,width,height]','drawOrder':order,'materials':[],'trace':'SHORTS_TRACE.json','status':'INITIAL_ASSEMBLY_PENDING_PERSONAL_REVIEW; no motion PASS'}
for k,r in materials.items():
 path=OUT/(k+'.png');manifest['materials'].append({'id':k,'file':'materials/'+path.name,'cropRect':[0,0,W,H],'owner':k,'classification':'source-extracted + bounded reconstructed hidden subset' if k=='torso_head_tank' else 'source-extracted','sha256':hashlib.sha256(path.read_bytes()).hexdigest(),'hidden':'tank subset only from tank-01 attempt02' if k=='torso_head_tank' else 'No generated hidden continuation; knee source overlaps are duplicated original visible skin.'})
(ART/'MATERIALS.json').write_text(json.dumps(manifest,indent=2)+'\n',encoding='utf-8')
print(json.dumps({'materials':len(materials),'sourceSHA256':manifest['sourceSHA256'],'status':manifest['status']}))
