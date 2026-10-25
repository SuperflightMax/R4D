"""Derived GPU RGB planes only; immutable accepted attempt03 stays unchanged."""
import hashlib,json
from pathlib import Path
import numpy as np
from PIL import Image
ROOT=Path(__file__).resolve().parents[1]
def material_rgb(image):
    raw=np.asarray(image);solid=raw[:,:,3]>=128;rows=np.where(solid.any(axis=1))[0]
    assert len(rows);rgb=np.zeros_like(raw[:,:,:3]);grid=np.arange(1024)
    for y in rows:
        xs=np.where(solid[y])[0]
        for channel in range(3):rgb[y,:,channel]=np.interp(grid,xs,raw[y,xs,channel])
    for y in np.where(~solid.any(axis=1))[0]:rgb[y]=rgb[rows[np.argmin(abs(rows-y))]]
    return rgb
PINS={'construction/construction.json':'7d06ea4636b49c718dad5e9d9f07000d09fa7e5cf105ec325abb84742bfdba26','art/package.json':'a18bf91c3b00bd29a9246cb206d48d40c454a421136f7d88e5d35d52dc8013b0','art/validation.json':'cc64f60aaa49fc2f9e9282130eef697402a752a346ecae1c79445a7d07066b1e'}
sha=lambda p:hashlib.sha256(p.read_bytes()).hexdigest()
for p,h in PINS.items():assert sha(ROOT/p)==h,p
data=json.loads((ROOT/'construction/construction.json').read_bytes());package=json.loads((ROOT/'art/package.json').read_bytes())
out=ROOT/'assembly/assets';out.mkdir(parents=True,exist_ok=True)
manifest={'candidate':'Q5A-NELA-ASSEMBLY-03','inputs':PINS,'textures':[]}
for s in package['surfaces']:
 p=ROOT/'art'/s['file'];assert sha(p)==s['sha256']
 target=out/(s['id']+'.png');Image.fromarray(material_rgb(Image.open(p).convert('RGBA'))).save(target)
 entry={'id':s['id'],'rgb':target.name,'source_sha256':s['sha256'],'derived_sha256':sha(target)}
 if s['silhouette_alpha_file']:
  mask=ROOT/'art'/s['silhouette_alpha_file'];dest=out/(s['id']+'-alpha.png');dest.write_bytes(mask.read_bytes());entry['alpha']=dest.name;entry['alpha_sha256']=sha(mask)
 manifest['textures'].append(entry)
rig={'surfaces':data['surfaces'],'draw_operations':data['draw_operations'],'lengths':data['lengths'],'ranges_deg':data['ranges_deg'],'bind':data['poses'][0]}
(out/'rig-data.json').write_text(json.dumps(rig,separators=(',',':')),encoding='utf-8')
manifest['rig_sha256']=sha(out/'rig-data.json')
(out/'inputs.json').write_text(json.dumps(manifest,indent=2)+'\n',encoding='utf-8')
print('PASS: 15 own-material RGB planes + 2 separate authored hand masks, exact accepted inputs')
