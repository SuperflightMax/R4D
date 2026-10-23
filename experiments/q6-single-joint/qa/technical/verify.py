from pathlib import Path
import hashlib,json,sys
import numpy as np
from PIL import Image
R=Path('D:/dev/R4D/experiments/q6-single-joint'); Q=R/'qa/technical'
def sha(p): return hashlib.sha256(p.read_bytes()).hexdigest()
def load(p): return json.loads(p.read_text(encoding='utf-8-sig'))
def image(p): return np.array(Image.open(p).convert('RGBA'))
phase=sys.argv[1]; m=load(R/'output/builder/q6-c1-files.json'); records=[]
for group in ['runtime','immutableInputs']:
 for e in m[group]:
  p=R/e['file']; h=sha(p); size=p.stat().st_size
  records.append({'file':e['file'],'group':group,'bytes':size,'sha256':h,'ok':h==e['sha256'] and size==e['bytes']})
manifest_hash=sha(R/'output/builder/q6-c1-files.json'); contract_hash=sha(R/'FROZEN_CONTRACT.json')
summary={'phase':phase,'manifestSHA256':manifest_hash,'manifestOK':manifest_hash=='cc739d9e680f64b3fecf62e855b80caf4a7002f501eba282668a9e95758c8321','contractSHA256':contract_hash,'contractOK':contract_hash=='e1dbd83ca86f2c723c5ec51fc97fb85aa06236c88c628c728893005ca284380a','count':len(records),'bytes':sum(e['bytes'] for e in records),'failures':[e for e in records if not e['ok']],'records':records}
(Q/f'hashes-{phase}.json').write_text(json.dumps(summary,indent=2),encoding='utf-8')
if phase=='before':
 c=load(R/'FROZEN_CONTRACT.json'); runtime=load(R/'public/art/manifest.json'); mapping=[]
 for v,entry in runtime['variants'].items():
  for part in ['thigh','shin','overlay']:
   if part not in entry: continue
   e=entry[part]; pub=R/'public'/e['file']; src=R/e['source']
   mapping.append({'variant':v,'part':part,'ok':sha(pub)==sha(src)==e['sha256'],'size':list(Image.open(pub).size),'bytes':pub.stat().st_size})
 atlas=image(R/'process/M1/source-atlas.png'); mask=np.array(Image.open(R/'process/M2/atlas-mask.png'))==255
 raw=Image.open(R/'process/M2/raw.png').convert('RGBA'); norm=np.array(raw.resize((512,512),Image.Resampling.LANCZOS)); final=image(R/'process/M2/composited-atlas.png')
 def diff(a,b,z):
  d=np.abs(a.astype('int16')-b.astype('int16'))[z];return {'changedPixels':int(np.any(d!=0,axis=1).sum()),'maxDelta':int(d.max()),'zonePixels':int(z.sum())}
 metrics={'runtimeMapping':mapping,'rawM2Outside':diff(norm,atlas,~mask),'finalM2Outside':diff(final,atlas,~mask),'rawNormalizationExact':bool(np.array_equal(norm,image(R/'process/M2/normalized.png'))),'parts':{}}
 for part in ['thigh','shin']:
  original=image(R/f'provenance/source/assets/parts/{part}_near.png'); arr=image(R/f'art/M2/{part}_near.png'); native_mask=np.array(Image.open(R/f'process/M2/{part}_mask.png'))==255
  rect=c['atlas_contract']['slots'][part]['crop'];x0,y0,x1,y1=rect
  metrics['parts'][part]={'outside':diff(arr,original,~native_mask),'cropExact':bool(np.array_equal(arr,final[y0:y1,x0:x1])),'J1equalsM2':bool(np.array_equal(arr,image(R/f'art/J1/{part}_near.png'))),'J2underlayEqualsJ1':bool(np.array_equal(arr,image(R/f'art/J2/{part}_near.png'))),'opaqueRemovedInside':int(((original[:,:,3]>=128)&(arr[:,:,3]<128)&native_mask).sum())}
 ledger=load(R/'process/M2/call-ledger.json');metrics['ledger']=ledger
 metrics['rawCopiesMatchGeneratedSource']={method:sha(Path(ledger[method]['raw_source']))==sha(R/f'process/{method}/raw.png')==ledger[method]['raw_sha256'] for method in ['M1','M2']}
 (Q/'input-metrics.json').write_text(json.dumps(metrics,indent=2,ensure_ascii=False),encoding='utf-8')
print(json.dumps({k:v for k,v in summary.items() if k!='records'}))
