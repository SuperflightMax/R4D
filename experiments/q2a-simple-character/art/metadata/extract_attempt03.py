"""Lossless rectangular extraction. No resizing, recoloring, masking, or alpha cleanup."""
from pathlib import Path
import json, math
from PIL import Image

root=Path(__file__).resolve().parents[1]
im=Image.open(root/'source/attempt03_raw.png')
out=root/'parts/attempt03_initial';out.mkdir(parents=True,exist_ok=True)
# Landmark positions are visual anatomical estimates, not an exact generator promise.
# The proposed assembly anchors below expose a revised measured bind; not approved contract changes.
data={
 'body':([86,119,121,307],{'pelvis':[145,371],'neck':[151,151],'shoulder_near':[152,190],'shoulder_far':[138,190],'waist':[150,300]},'pelvis',[495,550],4),
 'head':([453,63,96,138],{'neck':[499,190],'crown':[491,64],'chin':[532,164]},'neck',[501,330],9),
 'arm_near':([105,531,106,265],{'shoulder':[141,565],'elbow':[177,681],'wrist':[191,789]},'shoulder',[502,369],7),
 'arm_far':([313,531,107,265],{'shoulder':[380,565],'elbow':[340,681],'wrist':[334,789]},'shoulder',[488,369],0),
 'hand_near':([187,837,61,102],{'wrist':[215,849]},'wrist',[552,593],8),
 'hand_far':([340,837,61,102],{'wrist':[369,849]},'wrist',[442,593],1),
 'leg_near':([734,60,119,371],{'hip':[781,100],'knee':[823,258],'ankle':[828,425]},'hip',[500,550],5),
 'leg_far':([976,60,120,371],{'hip':[1019,100],'knee':[1060,258],'ankle':[1055,425]},'hip',[490,550],2),
 'foot_near':([712,799,116,76],{'ankle':[743,840],'heel_contact':[720,871],'toe_contact':[821,871]},'ankle',[547,875],6),
 'foot_far':([972,799,115,76],{'ankle':[1003,840],'heel_contact':[980,871],'toe_contact':[1080,871]},'ankle',[526,875],3),
}
result={
 'status':'DIAGNOSTIC_INITIAL_KIT_NOT_ART_ACCEPTED_NOT_CONTRACT_CONFORMING',
 'source':'../source/attempt03_raw.png','raw_size':list(im.size),'logical_sheet_size':[2048,1536],
 'transform':{'s':1.0,'t':[0.0,0.0],'meaning':'Proposed anatomical scale: one raw pixel per assembly unit. This is not canvas-fit scale 1448/2048. Artwork did not preserve target layout. No image pixels are resized.'},
 'coordinate_formula':'A=(L_U+crop_origin_U-t)/s-D; U=s*R+t; R=A+D',
 'landmark_method':'Manual visual estimates, uncertainty approx 5-10 raw px; single D anchors each part, all other measured landmarks preserved.',
 'contract_revision_required':[
   'Measured torso neck/pelvis separation is220 instead of264; shoulder lies39px lower after pelvic anchoring. Head attached to measured neck yields approximate crown204, not132.',
   'Near hip-knee163.49 and knee-ankle167.07 versus162.79/161.25; far163.23/167.07. Arms121.46/108.90 versus122.93/106.92, far122.70/108.17. No independent scale applied.',
   'Measured initial anatomical boot contacts imply ground906 rather than900 and sole101/100 rather than80; no hidden stretching to original contacts.',
   'Proposed bind is diagnostic only. Builder/Concept/Lead must accept explicit revised schema or identify art correction. Low drop160 remains a requirement, not yet demonstrated.',
   'Duplicate deltoid and pelvic garment masses, slight torso turn and semi-transparent red fringe remain visible. No artistic PASS.'
 ],
 'operations':['Copy rectangular crops with8px padding from original raw, preserving RGBA values exactly. No pixel recoloring, alpha filtering, rotation, reflection or resampling.'],
 'parts':{}
}
for name,(box,lm,anchor,anchorA,layer) in data.items():
 x,y,w,h=box
 x0=max(0,x-8);y0=max(0,y-8);x1=min(im.width,x+w+8);y1=min(im.height,y+h+8)
 crop=im.crop((x0,y0,x1,y1));crop.save(out/f'{name}.png')
 D=[lm[anchor][0]-anchorA[0],lm[anchor][1]-anchorA[1]]
 lens={}
 pairs=[('shoulder','elbow'),('elbow','wrist'),('hip','knee'),('knee','ankle'),('heel_contact','toe_contact')]
 for a,b in pairs:
  if a in lm and b in lm:lens[a+'_'+b]=math.dist(lm[a],lm[b])
 result['parts'][name]={
   'png':f'../parts/attempt03_initial/{name}.png','crop_U':[x0,y0,x1-x0,y1-y0],
   'landmarks_U':lm,'landmarks_R':lm,
   'landmarks_PNG':{k:[v[0]-x0,v[1]-y0] for k,v in lm.items()},
   'D':D,'layer':layer,'proposed_bind_landmarks_A':{k:[v[0]-D[0],v[1]-D[1]] for k,v in lm.items()},
   'measured_lengths_U':lens,
 }
dest=root/'metadata/attempt03_initial.json';dest.write_text(json.dumps(result,ensure_ascii=False,indent=2),encoding='utf-8')
print(dest)
print(json.dumps({k:v['measured_lengths_U'] for k,v in result['parts'].items()},indent=2))
