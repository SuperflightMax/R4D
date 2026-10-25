"""Cycle04: agreed diagrams + authorized three-panel garment manufacture.
Only new cycle04 art and live parts.json are written; body/before read-only.
"""
from pathlib import Path
import json
from PIL import Image,ImageDraw
import numpy as np
import cv2

ROOT=Path(__file__).resolve().parents[2];ART=ROOT/'art';OUT=ART/'early-v02-04'
OUT.mkdir(parents=True,exist_ok=True)
t=json.loads((ART/'early-v02-03/CLOTH_TRACE.json').read_text(encoding='utf-8'))
c=t['curves'];waist=c['waist_back_visible']['points']+c['waist_occluded']['points'][1:]+c['waist_front_visible']['points'][1:]
lower=[[x,y+12] for x,y in waist]
panels=[
 {'id':'waistSeat','proposedTransform':'rigid_root','referencePivot':[538,645],
  'visibleOwnership':'natural top waistband attachment only; not a large rigid lower shorts shield',
  'agreementBoundary':waist+list(reversed(lower)),
  'boundaryEvidence':'top mixed visible/occluded per trace03; bottom is PROPOSED HIDDEN ASSEMBLY CUT, not observed transverse seam',
  'anchors':[{'source':[538,645],'target':'pelvis_root_translation'}], 'drawOrder':30},
 {'id':'nearFlap','proposedTransform':'single_positive_affine','referencePivot':[525,685],
  'referenceAxis':[[525,685],[503,967]],'agreementBoundary':t['proposedPanels']['near']['boundary'],
  'visibleOwnership':'all near cloth below waistband, original center seam, BOTH slit arcs and nearHem fold',
  'anchors':[{'source':[452,613],'target':'root_translation','role':'A_hidden_upper_back_attachment'},
             {'source':[598,615],'target':'root_translation','role':'B_hidden_upper_front_attachment'},
             {'source':[592,757],'target':'rigid_near_thigh','role':'C_near_front_hem_locked_owner_near'}],
  'drawOrder':20},
 {'id':'farFlap','proposedTransform':'single_positive_affine','referencePivot':[570,690],
  'referenceAxis':[[570,690],[606,960]],'agreementBoundary':t['proposedPanels']['far']['boundary'],
  'visibleOwnership':'own far front strip and far hem, never nearHem arc',
  'anchors':[{'source':[598,615],'target':'root_translation','role':'A_hidden_upper_back_attachment'},
             {'source':[625,626],'target':'root_translation','role':'B_hidden_upper_front_attachment'},
             {'source':[634,758],'target':'rigid_far_thigh','role':'C_far_front_hem'}],
  'drawOrder':10}
]
approved={'nearFlap':[[452,613],[598,615],[592,757]],
          'farFlap':[[598,615],[625,626],[634,758]]}
for panel in panels:
 if panel['id'] in approved:
  assert [a['source'] for a in panel['anchors']]==approved[panel['id']]
data={'status':'ASSET_FINAL_AGREED_LEAD_LOCKED_2_ROOT_1_HEM_WAITING_START','panelCount':3,'gusset':False,
 'source':'source/whole-v02.png','sourceSize':[1024,1536],
 'sourceTrace':'early-v02-03/CLOTH_TRACE.json','hiddenReferenceOnly':'repairs/torso-under-arms-v01.png',
 'panels':panels,'waistCurve':waist,'proposedHiddenAttachmentCut':lower,
 'nearFarCurve':c['panel_separation_proposal'],
 'visibleBoundaryOwnerRule':'waistband strip waistSeat; below it near/far curved regions; all shared nearHem boundary pixels nearFlap',
 'hiddenMargins':[
  {'id':'flap_under_waist','availableSourceStrip':waist+list(reversed(lower)),
   'sourceDepthPixels':12,'provenance':'same existing source/repair cloth pixels inside source silhouette',
   'neutralOccluder':'waistSeat','drawFlapsBelowWaist':True,'sufficiency':'UNPROVEN; two root anchors fix the attachment chord, not every point of the curved edge'},
  {'id':'far_under_near','curve':'nearFarCurve','proposedMaxSourceDepthPixels':8,
   'provenance':'existing cloth inside original outline only; no new pixels',
   'neutralOccluder':'nearFlap','sufficiency':'UNPROVEN; never extend external hem'}],
 'epsilonDeterminantProposal':0.0001,
 'coverageContract':{'target':'every visible semantic garment pixel in v02 including dark folds/lines; source alpha>=1 and >=128 audited separately',
                     'unassignedRequired':0,'duplicateVisibleOwnerRequired':0,'measured':False,
                     'hiddenExcludedFromVisibleOwnerCounts':True,'sourceRestIdentityRequired':True},
 'activeAnchorScheme':'two_root_plus_one_own_thigh_hem_per_flap; fixed by Lead after crossed proposals',
 'consideredNotImplemented':'one_root_plus_two_hem; superseded before manufacture, never run as an alternative',
 'risks':['two root anchors fix a chord; curved edge and source hidden margins still need unchanged-deep-low checking',
          'bottom of waistSeat is an unobserved hidden assembly cut, not a claimed drawn natural transverse seam'],
 'noImplementation':True,'liveContractChanged':False,
 'forbidden':'new masks/renderer before agreement, cell deformation, vertical threshold, invented gusset, new raster repair, altered body coverage'}
(OUT/'PANELS.json').write_text(json.dumps(data,ensure_ascii=False,indent=2)+'\n',encoding='utf-8')
box=(420,575,655,800);scale=4
def pt(p):return ((p[0]-box[0])*scale,(p[1]-box[1])*scale)
colors={'waistSeat':(224,147,15,180),'nearFlap':(0,133,188,60),'farFlap':(216,47,125,75)}
for file,name in [('source/whole-v02.png','PANELS_ON_SOURCE.png'),('repairs/torso-under-arms-v01.png','PANELS_ON_REFERENCE.png')]:
 im=Image.open(ART/file).convert('RGBA');base=Image.new('RGBA',im.size,(243,243,238,255));base.alpha_composite(im)
 detail=base.crop(box).resize(((box[2]-box[0])*scale,(box[3]-box[1])*scale));over=Image.new('RGBA',detail.size)
 d=ImageDraw.Draw(over)
 for panel in sorted(panels,key=lambda p:p['drawOrder']):
  points=[pt(p) for p in panel['agreementBoundary']]
  d.polygon(points,fill=colors[panel['id']],outline=colors[panel['id']][:3]+(255,),width=3)
 detail.alpha_composite(over);d=ImageDraw.Draw(detail)
 for panel in panels:
  color=colors[panel['id']][:3]+(255,)
  for anchor in panel['anchors']:
   x,y=pt(anchor['source']);d.ellipse((x-6,y-6,x+6,y+6),fill=color,outline='white',width=2)
   label=panel['id']+' '+','.join(map(str,anchor['source']))
   d.text((max(4,x-120),y+7),label,fill=color,stroke_width=1,stroke_fill='white')
 # Explicitly dotted hidden-cut line, not a new visible garment seam.
 for a,b in zip(lower,lower[1:]):
  A=pt(a);B=pt(b)
  for k in range(0,10,2):
   d.line([(A[0]+(B[0]-A[0])*k/10,A[1]+(B[1]-A[1])*k/10),(A[0]+(B[0]-A[0])*(k+1)/10,A[1]+(B[1]-A[1])*(k+1)/10)],fill='#ffcf30',width=4)
 result=Image.new('RGB',(detail.width,detail.height+110),'#f4f4ef');result.paste(detail,(0,0));dr=ImageDraw.Draw(result)
 for i,line in enumerate(['AGREEMENT ONLY: 3 panels. Orange root / blue near / pink far.',
                          'Top margin dotted: proposed HIDDEN assembly cut, not a measured drawn seam.',
                          'FINAL 3-point affine: 2 root attachments + 1 own-thigh hem anchor. 1+2 retired.',
                          'No masks/garment code. Neutral coverage 0/0 and margin sufficiency NOT measured.']):
  dr.text((10,detail.height+8+i*23),line,fill='#16222a')
 result.save(OUT/name)
print('Agreed panel data/diagrams:',OUT)

# Manufacture authorized after the shared agreement. No body files are edited.
for sub in ['parts','visible','hidden','masks','extracted','stored-repair','previews']:(OUT/sub).mkdir(exist_ok=True)
baseline=json.loads((ROOT/'build/early-v02-02/art/parts.json').read_text(encoding='utf-8'))
src=Image.open(ART/'source/whole-v02.png').convert('RGBA')
garment=next(p for p in baseline['parts'] if p['id']=='pelvis')
reference=Image.new('RGBA',src.size)
reference.paste(Image.open(ART/garment['file']),tuple(garment['cropRect'][:2]))
ref=np.array(reference);original=np.array(src)
G=ref[:,:,3]>0  # Retain EVERY prior garment cell, including dark/weak edges.
def maskpoly(points):
 m=Image.new('L',src.size);ImageDraw.Draw(m).polygon(points,fill=255)
 return np.array(m)>0
def save_mask(a,path):Image.fromarray(a.astype('uint8')*255).save(path)

# Existing immutable semantic arm masks identify original occlusion, not cloth
# colours. No skin/cloth cell is discarded because of its pose or determinant.
occ=np.zeros(G.shape,dtype=bool)
for name in ['nearUpperArm','nearForearm','farForearm']:
 occ|=np.array(Image.open(ART/f'early-v02-02/masks/{name}.png'))>0
observed=G&~occ&(original[:,:,3]>0)
ref[observed]=original[observed]  # Exact original visible RGBA takes precedence.
reference=Image.fromarray(ref)
save_mask(G,OUT/'masks/garment-reference.png')
save_mask(observed,OUT/'masks/source-observed.png')
save_mask(G&~observed,OUT/'masks/source-occluded-stored-repair.png')
reference.save(OUT/'previews/garment-reference.png')

waist_region=maskpoly(waist+list(reversed(lower)))
near_region=maskpoly(t['proposedPanels']['near']['boundary'])
far_region=maskpoly(t['proposedPanels']['far']['boundary'])
Vw=G&waist_region
Vn=G&~Vw&near_region
Vf=G&~Vw&~Vn&far_region
# Traced boundaries have manual subpixel uncertainty. Retain all edge cells by
# nearest traced REGION, not an x threshold, and record their number explicitly.
unclaimed=G&~(Vw|Vn|Vf)
dn=cv2.distanceTransform((~near_region).astype('uint8'),cv2.DIST_L2,cv2.DIST_MASK_PRECISE)
df=cv2.distanceTransform((~far_region).astype('uint8'),cv2.DIST_L2,cv2.DIST_MASK_PRECISE)
Vn|=unclaimed&(dn<=df);Vf|=unclaimed&(df<dn)
# Boundary ownership tie-break mandated by the shared agreement.
if G[757,592]:
 Vn[757,592]=True;Vf[757,592]=False;Vw[757,592]=False
visible={'farFlap':Vf,'nearFlap':Vn,'waistSeat':Vw}
line=Image.new('L',src.size)
ImageDraw.Draw(line).line([tuple(p) for p in data['nearFarCurve']['points']],fill=255,width=16)
seam_band=np.array(line)>0
hidden={
 'nearFlap':Vw&near_region,
 'farFlap':(Vw&far_region)|(Vn&seam_band),
 'waistSeat':np.zeros_like(G)
}
# Hidden underlap is interior cloth, not a second copy of the exposed fuzzy
# exterior edge. Keep every visible edge pixel in its owner; only the genuinely
# covered interior (alpha>=250) can serve as an invisible reserve in neutral.
for name in hidden:hidden[name]&=ref[:,:,3]>=250
# Exact shared-width limits: no hidden pixel lies outside prior garment material.
for name in hidden:assert not np.any(hidden[name]&~G)

def rgba_for(mask):
 a=ref.copy();a[~mask]=0;return Image.fromarray(a)

exports=[];full_combined={};full_visible={}
for panel in panels:
 name=panel['id'];v=visible[name];h=hidden[name]
 assert not np.any(v&h)
 combined=v|h
 yy,xx=np.where(combined);bb=(int(xx.min()),int(yy.min()),int(xx.max()+1),int(yy.max()+1))
 x,y,x1,y1=bb
 for folder,m in [('parts',combined),('visible',v),('hidden',h),('extracted',combined&observed),('stored-repair',combined&~observed)]:
  rgba_for(m).crop(bb).save(OUT/f'{folder}/{name}.png')
 save_mask(v,OUT/f'masks/{name}-visible.png');save_mask(h,OUT/f'masks/{name}-hidden.png')
 full_combined[name]=rgba_for(combined);full_visible[name]=rgba_for(v)
 isroot=name=='waistSeat';side='near' if name=='nearFlap' else 'far'
 exports.append({'id':name,'file':f'early-v02-04/parts/{name}.png',
  'visibleFile':f'early-v02-04/visible/{name}.png','hiddenFile':f'early-v02-04/hidden/{name}.png',
  'cropRect':[x,y,x1-x,y1-y],
  'from':'pelvis' if isroot else side+'Hip','to':'chest' if isroot else side+'Knee',
  'z':36 if isroot else 35 if side=='near' else 15,'rigidPelvis':isroot,
  'garmentPanel':{'kind':'rigid-root' if isroot else 'single-affine','anchors':panel['anchors'],
                  'referencePivot':panel['referencePivot'],'epsilon':0.0001},
  'visibleMask':f'early-v02-04/masks/{name}-visible.png','hiddenMask':f'early-v02-04/masks/{name}-hidden.png',
  'provenance':{'observedSource':'source/whole-v02.png','storedReference':'early-v02-02/parts/pelvis.png',
                'observedSourceMask':'early-v02-04/masks/source-observed.png',
                'note':'No new repair; hidden copies are existing garment pixels inside original garment area.'}})

owner_count=sum(m.astype('uint8') for m in visible.values())
unassigned=int(np.count_nonzero(G&(owner_count==0)));duplicates=int(np.count_nonzero(G&(owner_count>1)))
assert unassigned==duplicates==0
vis_comp=Image.new('RGBA',src.size);combined_comp=Image.new('RGBA',src.size)
for name in ['farFlap','nearFlap','waistSeat']:
 vis_comp=Image.alpha_composite(vis_comp,full_visible[name])
 combined_comp=Image.alpha_composite(combined_comp,full_combined[name])
vis_comp.save(OUT/'previews/source-neutral-visible-only.png')
combined_comp.save(OUT/'previews/source-neutral-with-hidden.png')
actual=np.array(combined_comp);vactual=np.array(vis_comp)
def diff_summary(a,b,area):
 d=np.abs(a.astype('int16')-b.astype('int16'))
 return {'differentPixels':int(np.count_nonzero(area&np.any(d>0,axis=2))),
         'maxRGBAChannelDifference':[int(d[:,:,k][area].max()) if area.any() else 0 for k in range(4)]}
metrics={
 'reference':'EVERY alpha>=1 pixel of immutable cycle02 garment PNG; observed v02 RGBA restored exactly outside existing arm-occlusion masks',
 'referenceCellCount':int(G.sum()),'referenceOpaque128Count':int(np.count_nonzero(G&(ref[:,:,3]>=128))),
 'sourceObservedCount':int(observed.sum()),'sourceOccludedExistingRepairCount':int((G&~observed).sum()),
 'unassigned':unassigned,'duplicateVisibleOwner':duplicates,
 'manualTraceFringeAssignedToNearestCurvedRegion':int(unclaimed.sum()),
 'nearHem592757':{'inReference':bool(G[757,592]),'visibleOwner':'nearFlap' if Vn[757,592] else 'outside reference'},
 'sourceObservedPixelMutation':diff_summary(ref,original,observed),
 'visibleOnlyCompositionVsReference':diff_summary(vactual,ref,G),
 'ordinarySourceOverWithHiddenVsReference':diff_summary(actual,ref,G),
 'hiddenCopies':{k:int(v.sum()) for k,v in hidden.items()},
 'notes':['Coverage and visible-only composition are separate from ordinary source-over alpha accumulation.',
          'Hidden reserves use existing covered cloth interior alpha>=250; exposed fuzzy edge remains solely on its visible owner.',
          'No alpha/source correction, margin removal or special renderer added to force byte equality.',
          'This is source-rest diagnostic, not the transformed neutral or motion PASS.',
          'Garment-reference completeness inherits cycle02 semantic mask; no cell from it is excluded. It is not an independent pixel-perfect segmentation audit of the original illustration.']}
for color,name in [((245,245,240,255),'light'),((30,34,40,255),'dark')]:
 base=Image.new('RGBA',src.size,color)
 expected=Image.alpha_composite(base,reference);out=Image.alpha_composite(base,combined_comp)
 metrics[f'compositedRGB_{name}']=diff_summary(np.array(out),np.array(expected),G)
 strip=Image.new('RGB',(940,450))
 for i,img in enumerate([expected,out]):
  strip.paste(img.crop((420,575,655,800)).resize((470,450)).convert('RGB'),(i*470,0))
 strip.save(OUT/f'previews/neutral-reference-vs-hidden-{name}.jpg',quality=95)
(OUT/'SELF_CHECK.json').write_text(json.dumps(metrics,ensure_ascii=False,indent=2)+'\n',encoding='utf-8')
assert metrics['sourceObservedPixelMutation']['differentPixels']==0
assert metrics['visibleOnlyCompositionVsReference']['differentPixels']==0

live=dict(baseline);live.update(version='early-v02-04-three-panels-2root-1hem-garment-only',
 parts=[p for p in baseline['parts'] if p['id']!='pelvis']+exports,
 garmentAgreement='early-v02-04/PANELS.json',garmentSelfCheck='early-v02-04/SELF_CHECK.json',
 scope='Garment only; body files identical to immutable cycle02; source-rest RGBA overlap diagnostic disclosed; no motion PASS')
(OUT/'parts.json').write_text(json.dumps(live,ensure_ascii=False,indent=2)+'\n',encoding='utf-8')
(ART/'parts.json').write_text(json.dumps(live,ensure_ascii=False,indent=2)+'\n',encoding='utf-8')
print(json.dumps(metrics,ensure_ascii=False))
