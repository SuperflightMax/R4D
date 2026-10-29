"""Bounded source-space alpha estimate; no browser, renderer or physics rewrite."""
import hashlib, io, json, math, subprocess, sys
from pathlib import Path
from PIL import Image
ROOT=Path(__file__).resolve().parent
REPO=Path(r'E:\R4D\perspective\p3-worktrees\asset-artist')
BASE='17dc9fcdc261562acb581dd8590096819734c807'
PREFIX='experiments/p3-masks/transfer/dark/asset-artist/'
def blob(name):
    return subprocess.check_output(['git','-C',str(REPO),'show',BASE+':'+PREFIX+name])
def main():
    baseline=json.loads(blob('assets.json'));candidate=json.loads((ROOT/'assets.json').read_bytes())
    meta=json.loads((ROOT/'INPUTS.json').read_bytes());item=meta['p1']['files']['manifest']
    raw=subprocess.check_output(['git','-C',str(REPO),'show',meta['p1']['commit']+':'+item['path']])
    assert hashlib.sha256(raw).hexdigest()==item['sha256']
    F=json.loads(raw)['projection']['nativeToSource']
    def tr(p):
        x,y=p;w=F[2][0]*x+F[2][1]*y+F[2][2]
        return [(F[0][0]*x+F[0][1]*y+F[0][2])/w,(F[1][0]*x+F[1][1]*y+F[1][2])/w]
    def depth(obj,x):
        (x1,y1),(x2,y2)=obj['depthLineNative']
        t=0 if x1==x2 else max(0,min(1,(x-x1)/(x2-x1)))
        return y1+t*(y2-y1)
    old={o['id']:o for o in baseline['occluders'] if o['id'].startswith('receiver-04-')}
    new={o['id']:o for o in candidate['occluders'] if o['id'].startswith('receiver-04-')}
    trace_raw=(ROOT/'NATIVE_TRACE.json').read_bytes();trace=json.loads(trace_raw)
    assert hashlib.sha256(trace_raw).hexdigest()=='0f1b1b8c123c6bfcee2ed83d4e3bb0312b438569af58847e6f61a84f6530c05a'
    assert trace['exactVqaStateMatches']==11 and trace['result']['kind']=='LOST' and trace['lastTick']==2083
    states={s['tick']:s for s in trace['states']}
    def active(objects,xy):
        return [id for id,z in objects.items() if xy[1]<depth(z,xy[0])]
    first=next(t for t,s in states.items() if not active(new,list(s['ball']['pos'].values())))
    shadowfirst=next(t for t,s in states.items() if not active(new,[s['ball']['pos']['x']-.45*16,s['ball']['pos']['y']+.5*16]))
    imgs={id:Image.open(io.BytesIO(blob(o['path']))).getchannel('A') for id,o in old.items()}
    ball=Image.open(io.BytesIO(blob(baseline['ball']['path']))).getchannel('A')
    def sample(im,x,y):
        w,h=im.size;x=max(0,min(w-1,x));y=max(0,min(h-1,y))
        i=math.floor(x);j=math.floor(y);u=x-i;v=y-j;i1=min(w-1,i+1);j1=min(h-1,j+1)
        return ((1-u)*(1-v)*im.getpixel((i,j))+u*(1-v)*im.getpixel((i1,j))+
                (1-u)*v*im.getpixel((i,j1))+u*v*im.getpixel((i1,j1)))/255
    rows=[];ss=4
    ticks=sorted(set(range(2009,2023))|{first-1,first,first+1})
    for t in ticks:
        state=states[t];p=state['ball']['pos'];xy=[p['x'],p['y']]
        center=tr(xy);left=tr([xy[0]-16,xy[1]]);right=tr([xy[0]+16,xy[1]])
        radius=math.hypot(right[0]-left[0],right[1]-left[1])/2
        scale=radius/baseline['ball']['radiusPx'];anchor=baseline['ball']['anchorPx']
        x0=center[0]-anchor[0]*scale;y0=center[1]-anchor[1]*scale-radius*.65
        groups={'baseline':active(old,xy),'candidate':active(new,xy),'latent':list(old)}
        weights=0;tot={key:0 for key in groups}
        for iy in range(math.floor(y0*ss),math.ceil((y0+ball.height*scale)*ss)):
            y=(iy+.5)/ss
            for ix in range(math.floor(x0*ss),math.ceil((x0+ball.width*scale)*ss)):
                x=(ix+.5)/ss;weight=sample(ball,(x-x0)/scale-.5,(y-y0)/scale-.5)
                if weight==0:continue
                weights+=weight;alpha={}
                for id,obj in old.items():
                    bx,by,bw,bh=obj['rectPx']
                    alpha[id]=sample(imgs[id],x-bx-.5,y-by-.5) if bx<=x<bx+bw and by<=y<by+bh else 0
                for key,ids in groups.items():tot[key]+=weight*(1-math.prod(1-alpha[id] for id in ids))
        shadow=[xy[0]-.45*16,xy[1]+.5*16]
        rows.append({'tick':t,'native':xy,'sourceBallCenter':[center[0],center[1]-radius*.65],
            'baselineActive':groups['baseline'],'candidateActive':groups['candidate'],
            'baselineCoveragePct':round(tot['baseline']/weights*100,4),
            'candidateCoveragePct':round(tot['candidate']/weights*100,4),
            'latentAllThreeCoveragePct':round(tot['latent']/weights*100,4),
            'baselineShadowActive':active(old,shadow),'candidateShadowActive':active(new,shadow)})
    report={'baselineArt':BASE,'candidateAssetsSha256':hashlib.sha256((ROOT/'assets.json').read_bytes()).hexdigest(),
        'seed':trace['seed'],'result':trace['result'],'lastTick':trace['lastTick'],
        'vqaCommit':trace['vqaCommit'],'exactVqaStateMatches':trace['exactVqaStateMatches'],
        'nativeTraceSha256':hashlib.sha256(trace_raw).hexdigest(),
        'coreSha256':trace['coreSha256'],'runModelSha256':trace['runModelSha256'],
        'viewerAppSha256':'760c9bada40cb3ecb944f332f6efa91bb3c1340ce7f1ad9c2cabeda4dca0a3e6',
        'method':'source-view sphere alpha weighted overlap; 4x4 samples/source pixel; bilinear each PNG; union 1-product(1-a); native r16, frozen lift0.65 and scalar/line gate unchanged',
        'scope':'receiver-04 family only; shadow gates listed separately, shadow coverage not estimated; no Pixi/FPS/browser or independent visual PASS',
        'candidateBallGateOffTick':first,'candidateShadowGateOffTick':shadowfirst,'rows':rows}
    out=(json.dumps(report,indent=2,ensure_ascii=False)+'\n').encode('utf8')
    if '--write' in sys.argv:
        target=ROOT/'EVALUATION.json'
        if target.exists():assert target.read_bytes()==out,'Refuse differing evaluation overwrite'
        else:target.write_bytes(out)
    print(json.dumps({'assetsSha256':report['candidateAssetsSha256'],'seed':report['seed'],
        'lastTick':report['lastTick'],'result':report['result'],'ballGateOff':first,
        'shadowGateOff':shadowfirst,'rows':[{k:r[k] for k in ('tick','baselineCoveragePct','candidateCoveragePct','latentAllThreeCoveragePct')} for r in rows]}))
if __name__=='__main__':main()
