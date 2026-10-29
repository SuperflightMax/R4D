"""Bounded alpha estimate on actual ordinary native seed1 states, not Pixi QA."""
import hashlib
import json
import math
from pathlib import Path
import subprocess
from PIL import Image,ImageChops
ROOT=Path(__file__).resolve().parent
REPO=Path(r'E:\R4D\perspective\p3-worktrees\asset-artist')
BASE='17dc9fcdc261562acb581dd8590096819734c807'
PREFIX='experiments/p3-masks/transfer/water/asset-artist/'
RUNTIME=Path(r'E:\R4D\perspective\p3-runtime\asset-artist\transfer-water-dark\water')
def blob(c,p):return subprocess.check_output(['git','-C',str(REPO),'show',c+':'+p])
def main():
    old=json.loads(blob(BASE,PREFIX+'assets.json'));new=json.loads((ROOT/'assets.json').read_bytes())
    meta=json.loads((ROOT/'INPUTS.json').read_bytes());p=meta['p1'];r=p['files']['manifest']
    raw=blob(p['commit'],r['path']);assert hashlib.sha256(raw).hexdigest()==r['sha256']
    H=json.loads(raw)['projection']['nativeToSource']
    def tr(x,y):
        w=H[2][0]*x+H[2][1]*y+H[2][2]
        return [(H[0][0]*x+H[0][1]*y+H[0][2])/w,(H[1][0]*x+H[1][1]*y+H[1][2])/w]
    trace=json.loads((RUNTIME/'native-seed1-1006-1035.json').read_bytes())
    check=json.loads(Path(r'E:\R4D\perspective\p3-runtime\builder\transfer-water-dark\water\evidence\native-01\water-seed1-gate07-tick1014.json').read_bytes())
    assert next(s for s in trace['states'] if s['tick']==1014)==check['state']
    masks={o['id']:Image.open(ROOT/o['path']).getchannel('A') for o in new['occluders']}
    ball=Image.open(ROOT/new['ball']['path']).getchannel('A');definition=new['ball']
    def depth(o,x):
        if 'depthNativeY' in o:return o['depthNativeY']
        (x1,y1),(x2,y2)=o['depthLineNative'];t=0 if x1==x2 else max(0,min(1,(x-x1)/(x2-x1)))
        return y1+t*(y2-y1)
    def mass(im):return sum(v*n for v,n in enumerate(im.histogram()))
    rows=[]
    for state in trace['states']:
        pos=state['ball']['pos'];x,y=pos['x'],pos['y'];u,v=tr(x,y)
        a,b=tr(x-16,y),tr(x+16,y);radius=math.hypot(b[0]-a[0],b[1]-a[1])/2
        scale=radius/definition['radiusPx'];left=u-definition['anchorPx'][0]*scale
        top=v-radius*.65-definition['anchorPx'][1]*scale
        x0,y0=math.floor(left),math.floor(top);w=math.ceil(ball.width*scale)+2;h=math.ceil(ball.height*scale)+2
        alpha=ball.transform((w,h),Image.Transform.AFFINE,(1/scale,0,(x0-left)/scale,0,1/scale,(y0-top)/scale),resample=Image.Resampling.BILINEAR)
        total=mass(alpha)
        result={'tick':state['tick'],'native':[x,y],'source':[u,v]}
        for label,assets in [('baseline',old),('frontEdge',new),('allGeometric',new)]:
            union=Image.new('L',(w,h));active=[]
            for o in assets['occluders']:
                if not o['id'].startswith('arch-07-'):continue
                if label!='allGeometric' and y>=depth(o,x):continue
                active.append(o['id']);ox,oy,ow,oh=o['rectPx']
                part=masks[o['id']].crop((x0-ox,y0-oy,x0-ox+w,y0-oy+h))
                union=ImageChops.screen(union,part)
            result[label]={'occludedAlphaPercent':round(100*mass(ImageChops.multiply(alpha,union))/total,3),'active':active}
        rows.append(result)
    flips={}
    for label in ('baseline','frontEdge'):
        flips[label]=[r for previous,r in zip(rows,rows[1:]) if bool(previous[label]['active'])!=bool(r[label]['active'])]
    report={'kind':'bounded alpha estimate; not browser/independent QA',
      'ruleIndependentOfSeed':True,'baselineArt':BASE,'sameNativeSeed':1,
      'nativeResult':trace['result'],'lastTick':trace['lastTick'],
      'nativeState1014MatchesBuilderCheckpointExactly':True,
      'limits':'Pillow bilinear alpha sampling approximates Pixi texture filtering; no shadow/movement/art PASS. Actual Pixi comparative frames required.',
      'flips':flips,'rows':rows}
    raw=(json.dumps(report,indent=2)+'\n').encode();(ROOT/'EVALUATION.json').write_bytes(raw)
    print(json.dumps({'flips':flips,'nativeLastTick':trace['lastTick'],'artifact':str(ROOT/'EVALUATION.json')}))
if __name__=='__main__':main()
