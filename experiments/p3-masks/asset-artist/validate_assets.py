"""Check the concrete consumer package, source alignment, coverage, and holes.

Does not declare artistic or movement PASS. Existing Pillow only.
"""
import hashlib
import json
from pathlib import Path
from PIL import Image
from prepare_masks import exact_json

ROOT=Path(__file__).resolve().parent

def main():
    assets=json.loads((ROOT/'assets.json').read_text())
    regions=json.loads((ROOT/'regions.json').read_text())['regions']
    config=exact_json('simulation/boards/01/trial-01/config.json',
      'dd5c519cd6d4b7295118e0a3a1063efed424a0ce739450bd5153c6a9941982db')
    manifest=exact_json('simulation/boards/01/trial-01/manifest.json',
      '7784dc0a215d0e472cf06a4eee03793592727cf0fa9a1fa0e0c78e5f1d17da18')
    assert assets['schema']=='r4d-p3-assets-v1' and assets['sourceSize']==[1536,1536]
    pins={p['id']:p for p in config['board']['pins']}
    authored_pins={r['configId'] for r in regions if r['kind']=='pin'}
    assert set(pins)==authored_pins
    ids=[o['id'] for o in assets['occluders']]
    assert len(ids)==len(set(ids))==51
    loaded={}
    for o in assets['occluders']:
        x,y,w,h=o['rectPx'];assert 0<=x<x+w<=1536 and 0<=y<y+h<=1536
        im=Image.open(ROOT/o['path']);assert im.size==(w,h) and im.mode=='RGBA'
        assert all(c.getextrema()==(255,255) for c in im.split()[:3])
        assert im.getchannel('A').getextrema()==(0,255)
        loaded[o['id']]=(o,im.getchannel('A'))
        if o['id'] in pins:assert o['depthNativeY']==pins[o['id']]['y']
    def alpha_at(id,point):
        o,alpha=loaded[id];x,y,w,h=o['rectPx'];px,py=point
        return alpha.getpixel((px-x,py-y)) if x<=px<x+w and y<=py<y+h else 0
    for id,p in [('flower-01',(479,406)),('wood-01',(581,505)),
                 ('frog-02',(422,562)),('wood-06',(377,986)),('leaf-05',(564,951))]:
        assert alpha_at(id,p)==0,(id,'baked shadow masked',p)
    for id,hole,front in [('receiver-01',(358,1238),(350,1284)),
      ('receiver-02',(646,1264),(650,1305)),('receiver-03',(915,1267),(923,1310)),
      ('receiver-04',(1194,1244),(1207,1290))]:
        assert max(alpha_at(f'{id}-front-{n}',hole) for n in range(1,5))==0,id
        assert max(alpha_at(f'{id}-front-{n}',front) for n in range(1,5))>240,id
    for item in (assets['ball'],assets['shadow']):
        im=Image.open(ROOT/item['path']);assert im.mode=='RGBA' and item['radiusPx']>0
    for name,h in json.loads((ROOT/'hashes.json').read_text()).items():
        raw=(ROOT/name).read_bytes()
        assert len(raw)==h['bytes'] and hashlib.sha256(raw).hexdigest()==h['sha256'],name
        if name.endswith(('.json','.py')):assert b'\r\n' not in raw,(name,'expected canonical LF')
    print('51 unique masks; 25 exact pin depths; source-size crops/white RGB/alpha/hashes; '
          'five shadow exclusion probes and four open-basket/front-rim probes verified. No movement/art PASS.')

if __name__=='__main__':main()
