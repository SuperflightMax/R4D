"""P3 transfer: the frozen source-aligned alpha + scalar/line depth recipe.

Only this board's pinned P1 inputs are read. No source redraw, collider edits,
simulator changes, PRNG calls, or sorting algorithm replacement.
"""
import hashlib
import json
import math
from pathlib import Path
import subprocess
import sys
from PIL import Image, ImageDraw

ROOT=Path(__file__).resolve().parent
REPO=Path(r'E:\R4D\perspective\p3-worktrees\asset-artist')

def write_json(path,value):
    path.write_bytes((json.dumps(value,indent=2,ensure_ascii=False)+'\n').encode('utf8'))

def main():
    meta=json.loads((ROOT/'INPUTS.json').read_bytes())
    inputs={}
    for name,item in meta['p1']['files'].items():
        raw=subprocess.check_output(['git','-C',str(REPO),'show',meta['p1']['commit']+':'+item['path']])
        assert hashlib.sha256(raw).hexdigest()==item['sha256'],name
        inputs[name]=json.loads(raw)
    config=inputs['config'];manifest=inputs['manifest'];profile=inputs['projection']
    pins={p['id']:p for p in config['board']['pins']}
    obstacles={p['id']:p for p in profile['obstacles']}
    segments={p['id']:p for p in config['board']['segments']}
    H=manifest['projection']['sourceToNative']
    offset=manifest['translation']['offset']
    def native_source(point):
        x,y=point;w=H[2][0]*x+H[2][1]*y+H[2][2]
        return [(H[0][0]*x+H[0][1]*y+H[0][2])/w,(H[1][0]*x+H[1][1]*y+H[1][2])/w]
    def support(id):
        if id in pins:return [pins[id]['x'],pins[id]['y']]
        v=obstacles[id]['verticesFlat']
        return [sum(p[0] for p in v)/len(v)+offset[0],sum(p[1] for p in v)/len(v)+offset[1]]
    data=json.loads((ROOT/'regions.json').read_bytes())
    (ROOT/'masks').mkdir(exist_ok=True)
    occluders=[]
    for region in data['regions']:
        points=[p for poly in region['polygons'] for p in poly]
        x0=max(0,math.floor(min(p[0] for p in points))-2);y0=max(0,math.floor(min(p[1] for p in points))-2)
        x1=min(1536,math.ceil(max(p[0] for p in points))+3);y1=min(1536,math.ceil(max(p[1] for p in points))+3)
        w,h=x1-x0,y1-y0;aa=4
        alpha=Image.new('L',(w*aa,h*aa));draw=ImageDraw.Draw(alpha)
        for poly in region['polygons']:
            draw.polygon([((x-x0)*aa,(y-y0)*aa) for x,y in poly],fill=255)
        alpha=alpha.resize((w,h),Image.Resampling.LANCZOS)
        im=Image.new('RGBA',(w,h),(255,255,255,0));im.putalpha(alpha)
        path=f'masks/{region["id"]}.png';im.save(ROOT/path)
        item={'id':region['id'],'path':path,'rectPx':[x0,y0,w,h]}
        if 'pinId' in region:item['depthNativeY']=pins[region['pinId']]['y']
        elif 'supportId' in region:item['depthNativeY']=support(region['supportId'])[1]
        elif 'supportLine' in region:item['depthLineNative']=[support(id) for id in region['supportLine']]
        elif 'depthLineSourcePx' in region:item['depthLineNative']=[native_source(p) for p in region['depthLineSourcePx']]
        else:
            s=segments[region['boundaryId']];item['depthNativeY']=max(s['y1'],s['y2'])
        assert im.size==(w,h) and im.getchannel('A').getextrema()==(0,255)
        occluders.append(item)
    assets={'schema':'r4d-p3-assets-v1','sourceSize':[1536,1536],
            'ball':meta['ball'],'shadow':meta['shadow'],'occluders':occluders}
    write_json(ROOT/'assets.json',assets)
    ids=[o['id'] for o in occluders];assert len(ids)==len(set(ids))
    def sampled_alpha(group,point):
        values=[]
        for o in occluders:
            if o['id'] not in group:continue
            x,y,w,h=o['rectPx'];px,py=point
            if x<=px<x+w and y<=py<y+h:
                values.append(Image.open(ROOT/o['path']).getchannel('A').getpixel((px-x,py-y)))
        return max(values,default=0)
    for p in data.get('openProbes',[]):assert sampled_alpha(p['ids'],p['point'])==0,p
    for p in data.get('opaqueProbes',[]):assert sampled_alpha(p['ids'],p['point'])>240,p
    paths=[ROOT/'assets.json',ROOT/'INPUTS.json',ROOT/'regions.json',ROOT/'provenance.json',
           *sorted((ROOT/'assets').glob('*.png')),*[ROOT/o['path'] for o in occluders]]
    hashes={p.relative_to(ROOT).as_posix():{'bytes':p.stat().st_size,
            'sha256':hashlib.sha256(p.read_bytes()).hexdigest()} for p in paths}
    write_json(ROOT/'hashes.json',hashes)
    if '--inspect' in sys.argv:
        source=Path(meta['source']['path']);assert hashlib.sha256(source.read_bytes()).hexdigest()==meta['source']['sha256']
        original=Image.open(source).convert('RGBA');overlay=Image.new('RGBA',original.size)
        for o in occluders:
            x,y,w,h=o['rectPx'];mask=Image.open(ROOT/o['path']).getchannel('A')
            paint=Image.new('RGBA',(w,h),(255,0,255,0));paint.putalpha(mask.point(lambda a:round(a*.35)))
            overlay.alpha_composite(paint,(x,y))
        runtime=Path(meta['runtime']);runtime.mkdir(parents=True,exist_ok=True)
        Image.alpha_composite(original,overlay).save(runtime/'mask-overlay.png')
    print(json.dumps({'board':meta['board'],'masks':len(occluders),
      'assetsSha256':hashes['assets.json']['sha256'],'bytes':sum(p['bytes'] for p in hashes.values()),
      'schemaAlphaAndProbeChecks':'passed; not runtime/art PASS'}))

if __name__=='__main__':main()
