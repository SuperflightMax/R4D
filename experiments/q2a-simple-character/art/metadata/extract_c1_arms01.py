"""Extract the four edited surfaces; preserve the six unaffected initial PNGs byte-for-byte."""
from pathlib import Path
from PIL import Image
import json, math, shutil, hashlib

root=Path(__file__).resolve().parents[1]
old=json.loads((root/'metadata/attempt03_initial.json').read_text(encoding='utf-8'))
m=json.loads(json.dumps(old))
raw=Image.open(root/'source/c1_arms01_raw.png')
out=root/'parts/c1_arms01';out.mkdir(parents=True,exist_ok=True)
edited={
 'arm_near':([105,534,105,241],{'shoulder':[142,568],'elbow':[177,681],'wrist':[188,769]},'shoulder',[502,369]),
 'arm_far':([321,535,106,241],{'shoulder':[389,568],'elbow':[345,681],'wrist':[342,769]},'shoulder',[488,369]),
 'hand_near':([166,811,62,96],{'wrist':[193,834]},'wrist',[548,570]),
 'hand_far':([310,811,60,96],{'wrist':[339,834]},'wrist',[441,570]),
}
for name,p in m['parts'].items():
 p['source_U']='../source/attempt03_raw.png'
 if name in edited:
  box,lm,anchor,anchorA=edited[name];x,y,w,h=box
  x0=max(0,x-8);y0=max(0,y-8);x1=min(raw.width,x+w+8);y1=min(raw.height,y+h+8)
  raw.crop((x0,y0,x1,y1)).save(out/f'{name}.png')
  D=[lm[anchor][0]-anchorA[0],lm[anchor][1]-anchorA[1]]
  p.update({'source_U':'../source/c1_arms01_raw.png','crop_U':[x0,y0,x1-x0,y1-y0],
   'landmarks_U':lm,'landmarks_R':lm,'landmarks_PNG':{k:[v[0]-x0,v[1]-y0] for k,v in lm.items()},
   'D':D,'proposed_bind_landmarks_A':{k:[v[0]-D[0],v[1]-D[1]] for k,v in lm.items()},
   'measured_lengths_U':{a+'_'+b:math.dist(lm[a],lm[b]) for a,b in [('shoulder','elbow'),('elbow','wrist')] if a in lm and b in lm}})
 else:
  shutil.copyfile(root/'metadata'/old['parts'][name]['png'],out/f'{name}.png')
 p['png']=f'../parts/c1_arms01/{name}.png'

m['status']='P1_C1_TARGETED_ARM_HAND_ART_CANDIDATE_PENDING_MOTION_VIEW'
m['version']='c1_arms01'
m['source']='../source/attempt03_raw.png'
m['sources']=['../source/attempt03_raw.png','../source/c1_arms01_raw.png']
m['source_rule']='Use per-part source_U for crop provenance. Six unchanged surfaces use initial source; four edited surfaces use c1_arms01 source. Both raw1448x1086, same s1,t0. Coordinates cannot be checked against one source for every part.'
m['operations']=['Four rectangular crops from coordinated imagegen edit, preserving RGBA pixels; six PNGs copied byte-for-byte from initial. No per-part resampling, rotation, reflection, alpha threshold or recolor.']
m['supersedes']='For four new surfaces only, these landmarks include the revised hidden wrist insertion. DO NOT apply another+8px to hand D. The earlier c1_landmark_revision.json is for initial PNGs only.'
m['contract_revision_required']=[
 'Torso/head/legs/boots unchanged from initial: short body, sole100-101 and ground906 remain explicitly documented measured anatomy.',
 'Near arm118.30/88.68; far121.26/88.05 raw px by manual landmarks. Upper arms differ few px from initial; forearms shortened20px by anatomical generation, not image rescaling.',
 'Proposed assembled wrist near548,570 and far441,570; elbows537,482 and444,482. Shoulder positions unchanged. Fingers now approximatelyY643, above knees708, close to middle thigh629. Need actual C1 bind and low viewing.',
 'New hand proximal hidden extension about23px; do not add the initial-PNG wrist+8 correction again.',
 'Pelvic/body art unchanged intentionally; Builder diagnoses and corrects weights separately. No artistic PASS for pelvis or whole slice.',
 'Trace red edge RGB remains at alpha1-5/255. No broad alpha removal performed; inspect on light/dark after integration.'
]
dest=root/'metadata/c1_arms01.json';dest.write_text(json.dumps(m,ensure_ascii=False,indent=2),encoding='utf-8')
checks={}
for name in m['parts']:
 if name not in edited:
  prev=(root/'metadata'/old['parts'][name]['png']).read_bytes();curr=(out/f'{name}.png').read_bytes()
  checks[name]=prev==curr
report={'metadata':str(dest),'parts':len(m['parts']),'six_unchanged_PNG_byte_checks':checks,'edited_lengths':{n:m['parts'][n]['measured_lengths_U'] for n in edited},'source_png_sha256':hashlib.sha256((root/'source/c1_arms01_raw.png').read_bytes()).hexdigest()}
(root/'metadata/c1_arms01_extraction_checks.json').write_text(json.dumps(report,indent=2),encoding='utf-8')
print(json.dumps(report,indent=2))
