"""Independently compare the actual candidate against the original Git blobs."""
import hashlib, io, json, subprocess, sys
from pathlib import Path
from PIL import Image, ImageChops
ROOT=Path(__file__).resolve().parent
REPO=Path(r'E:\R4D\perspective\p3-worktrees\asset-artist')
BASE='17dc9fcdc261562acb581dd8590096819734c807'
PREFIX='experiments/p3-masks/transfer/dark/asset-artist/'
def blob(name):
    return subprocess.check_output(['git','-C',str(REPO),'show',BASE+':'+PREFIX+name])
def digest(b):return hashlib.sha256(b).hexdigest()
def main():
    old=json.loads(blob('assets.json'));new=json.loads((ROOT/'assets.json').read_bytes())
    assert set(old)==set(new)
    for key in old:
        if key!='occluders':assert old[key]==new[key],key
    assert len(old['occluders'])==len(new['occluders'])==60
    expected={f'receiver-{k:02d}-{p}' for k in range(1,5) for p in ('front','left-rim','right-rim')}
    actual=[]
    for a,b in zip(old['occluders'],new['occluders']):
        assert a['id']==b['id'] and a['path']==b['path'] and a['rectPx']==b['rectPx']
        keys=[k for k in set(a)|set(b) if a.get(k)!=b.get(k)]
        if keys:
            assert keys==['depthLineNative'] and a['id'] in expected
            actual.append({'id':a['id'],'field':keys[0],'old':a[keys[0]],'new':b[keys[0]]})
    assert {x['id'] for x in actual}==expected
    declared=json.loads((ROOT/'ANCHOR_CHANGES.json').read_bytes())['changedRecords']
    assert actual==[{k:z[k] for k in ('id','field','old','new')} for z in declared]
    meta=json.loads((ROOT/'INPUTS.json').read_bytes())
    assert (ROOT/'INPUTS.json').read_bytes()==blob('INPUTS.json')
    assert (ROOT/'provenance.json').read_bytes()==blob('provenance.json')
    assert digest(Path(meta['source']['path']).read_bytes())==meta['source']['sha256']
    pin={};manifest=None
    for key,item in meta['p1']['files'].items():
        raw=subprocess.check_output(['git','-C',str(REPO),'show',meta['p1']['commit']+':'+item['path']])
        assert digest(raw)==item['sha256'];pin[key]=digest(raw)
        if key=='manifest':manifest=json.loads(raw)
    H=manifest['projection']['sourceToNative']
    def native(p):
        x,y=p;w=H[2][0]*x+H[2][1]*y+H[2][2]
        return [(H[0][0]*x+H[0][1]*y+H[0][2])/w,(H[1][0]*x+H[1][1]*y+H[1][2])/w]
    reg={z['id']:z for z in json.loads(blob('regions.json'))['regions']}
    lookup={z['id']:z for z in new['occluders']}
    for k in range(1,5):
        rid=f'receiver-{k:02d}';poly=reg[rid+'-front']['polygons'][0]
        edges=[[poly[i],poly[(i+1)%len(poly)]] for i in range(len(poly))]
        front=max(edges,key=lambda e:sum(native(p)[1] for p in e)/2)
        line=[native(p) for p in sorted(front,key=lambda p:p[0])]
        for part in ('front','left-rim','right-rim'):assert lookup[rid+'-'+part]['depthLineNative']==line
    records=[];crops={z['path']:z for z in old['occluders']}
    paths=sorted({old['ball']['path'],old['shadow']['path'],*crops})
    assert {p.relative_to(ROOT).as_posix() for p in ROOT.rglob('*.png')}==set(paths)
    for name in paths:
        a=blob(name);b=(ROOT/name).read_bytes();assert a==b,name
        ia=Image.open(io.BytesIO(a)).convert('RGBA');ib=Image.open(io.BytesIO(b)).convert('RGBA')
        assert ia.size==ib.size and ia.tobytes()==ib.tobytes(),name
        rec={'path':name,'bytes':len(b),'baselineSha256':digest(a),'candidateSha256':digest(b),
             'rawBytesEqual':True,'dimensions':list(ib.size),'decodedRgbaEqual':True}
        if name in crops:
            x,y,w,h=crops[name]['rectPx'];assert ia.size==(w,h)
            ca=Image.new('L',(1536,1536));cb=Image.new('L',(1536,1536))
            ca.paste(ia.getchannel('A'),(x,y));cb.paste(ib.getchannel('A'),(x,y))
            assert ImageChops.difference(ca,cb).getbbox() is None
            rec.update(rectPx=[x,y,w,h],sourceAlignedAlphaChangedPixels=0,
                       sourceAlignedAlphaSha256=digest(cb.tobytes()))
        records.append(rec)
    report={'baselineArt':BASE,'candidateAssetsSha256':digest((ROOT/'assets.json').read_bytes()),
        'pngCount':len(records),'allRawBytesEqual':True,'allDecodedRgbaEqual':True,
        'sourceAlignedMaskCount':len(crops),'allRectsEqual':True,'allSourceAlignedAlphaEqual':True,
        'ballAndShadowMetadataEqual':True,'unrelatedOccluderRecordsUnchanged':48,
        'changedRecords':actual,'p1Sha256':pin,'pngFiles':records,
        'scope':'byte/metadata/source-alpha checks only; not runtime or visual QA PASS'}
    raw=(json.dumps(report,indent=2,ensure_ascii=False)+'\n').encode('utf8')
    if '--write' in sys.argv:
        target=ROOT/'BYTE_EQUIVALENCE.json'
        if target.exists():assert target.read_bytes()==raw,'Refuse to overwrite differing verification'
        else:target.write_bytes(raw)
    print(json.dumps({k:report[k] for k in ('candidateAssetsSha256','pngCount','allRawBytesEqual',
         'allSourceAlignedAlphaEqual','ballAndShadowMetadataEqual','unrelatedOccluderRecordsUnchanged')}))
if __name__=='__main__':main()
