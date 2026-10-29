"""Derive one fixed receiver support-line candidate; copy every PNG verbatim."""
import copy, hashlib, json, subprocess
from pathlib import Path
ROOT=Path(__file__).resolve().parent
REPO=Path(r'E:\R4D\perspective\p3-worktrees\asset-artist')
BASE='17dc9fcdc261562acb581dd8590096819734c807'
PREFIX='experiments/p3-masks/transfer/dark/asset-artist/'
def blob(name):
    return subprocess.check_output(['git','-C',str(REPO),'show',BASE+':'+PREFIX+name])
def write(name,value):
    (ROOT/name).write_bytes((json.dumps(value,ensure_ascii=False,indent=2)+'\n').encode('utf8'))
def main():
    assert not (ROOT/'assets.json').exists(),'Refuse to overwrite an existing candidate'
    meta=json.loads(blob('INPUTS.json'));inputs={}
    for key,item in meta['p1']['files'].items():
        raw=subprocess.check_output(['git','-C',str(REPO),'show',meta['p1']['commit']+':'+item['path']])
        assert hashlib.sha256(raw).hexdigest()==item['sha256'],key
        inputs[key]=json.loads(raw)
    assert hashlib.sha256(Path(meta['source']['path']).read_bytes()).hexdigest()==meta['source']['sha256']
    H=inputs['manifest']['projection']['sourceToNative']
    def native(p):
        x,y=p;w=H[2][0]*x+H[2][1]*y+H[2][2]
        return [(H[0][0]*x+H[0][1]*y+H[0][2])/w,(H[1][0]*x+H[1][1]*y+H[1][2])/w]
    original=json.loads(blob('assets.json'));assets=copy.deepcopy(original)
    regions={z['id']:z for z in json.loads(blob('regions.json'))['regions']}
    objects={z['id']:z for z in assets['occluders']};changes=[];edges=[]
    for k in range(1,5):
        rid=f'receiver-{k:02d}';poly=regions[rid+'-front']['polygons'][0]
        candidates=[(i,[poly[i],poly[(i+1)%len(poly)]]) for i in range(len(poly))]
        index,edge=max(candidates,key=lambda z:sum(native(p)[1] for p in z[1])/2)
        source=sorted(edge,key=lambda p:p[0]);line=[native(p) for p in source]
        edges.append({'receiverId':rid,'frontPolygonIndex':0,'edgeIndex':index,
                      'sourcePx':source,'native':line})
        for part in ('front','left-rim','right-rim'):
            id=rid+'-'+part;obj=objects[id]
            changes.append({'id':id,'field':'depthLineNative',
                'old':obj['depthLineNative'],'new':copy.deepcopy(line),
                'oldSourcePx':regions[id]['depthLineSourcePx'],'newSourcePx':source})
            obj['depthLineNative']=copy.deepcopy(line)
    assert len(changes)==12
    paths=sorted({original['ball']['path'],original['shadow']['path'],
                  *[z['path'] for z in original['occluders']]})
    assert len(paths)==62
    for name in ['INPUTS.json','provenance.json',*paths]:
        path=ROOT/name;path.parent.mkdir(parents=True,exist_ok=True);path.write_bytes(blob(name))
    write('assets.json',assets)
    write('ANCHOR_CHANGES.json',{'baselineArt':BASE,'changedRecords':changes})
    write('DERIVATION.json',{'baselineArt':BASE,
        'baselineAssetsSha256':hashlib.sha256(blob('assets.json')).hexdigest(),
        'baselineRegionsSha256':hashlib.sha256(blob('regions.json')).hexdigest(),
        'p1Commit':meta['p1']['commit'],'p1ManifestSha256':meta['p1']['files']['manifest']['sha256'],
        'rule':'Consecutive front-facade polygon edge with maximum mean native Y; sourceToNative unchanged. All three receiver components share this front support line.',
        'receiverEdges':edges,'pngOperation':'exact Git blob copy; no decode/resave',
        'scope':'12 depthLineNative values only; 48 other occluder records unchanged',
        'selectionInputs':'existing source contours and pinned homography; no seed, tick or ball radius'})
    print(json.dumps({'assetsSha256':hashlib.sha256((ROOT/'assets.json').read_bytes()).hexdigest(),
                      'changedRecords':len(changes),'exactPngCopies':len(paths)}))
if __name__=='__main__':main()
