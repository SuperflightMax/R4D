"""One ordinary data-only correction, derived for every arch from pinned P1.

No PNG edits, renderer change, seed/tick-dependent rule, or baseline replacement.
"""
import copy
import csv
import hashlib
import io
import json
from pathlib import Path
import subprocess

ROOT=Path(__file__).resolve().parent
REPO=Path(r'E:\R4D\perspective\p3-worktrees\asset-artist')
BASE='17dc9fcdc261562acb581dd8590096819734c807'
PREFIX='experiments/p3-masks/transfer/water/asset-artist/'
OUT=ROOT/'variants/arch-front-edge-01'
def gitblob(commit,path):return subprocess.check_output(['git','-C',str(REPO),'show',commit+':'+path])
def write_json(path,data):path.write_bytes((json.dumps(data,indent=2)+'\n').encode())
def main():
    base=json.loads(gitblob(BASE,PREFIX+'assets.json'));variant=copy.deepcopy(base)
    meta=json.loads(gitblob(BASE,PREFIX+'INPUTS.json'));p1=meta['p1']
    raw=gitblob(p1['commit'],p1['files']['projection']['path'])
    assert hashlib.sha256(raw).hexdigest()==p1['files']['projection']['sha256']
    profile=json.loads(raw)
    raw=gitblob(p1['commit'],p1['files']['manifest']['path'])
    assert hashlib.sha256(raw).hexdigest()==p1['files']['manifest']['sha256']
    offset=json.loads(raw)['translation']['offset']
    supports={o['id']:o for o in profile['obstacles']}
    def front(id):
        v=supports[id]['verticesFlat'];assert len(v)==4
        edges=[(v[i],v[(i+1)%4]) for i in range(4)]
        means=[(a[1]+b[1])/2 for a,b in edges]
        # These accepted quads use edge2->3 as the near/front edge. Verify
        # rather than reorder or silently repair any input geometry.
        assert means[2]==max(means),id
        a,b=edges[2]
        return [(a[0]+b[0])/2+offset[0],(a[1]+b[1])/2+offset[1]]
    old={o['id']:o for o in base['occluders']};changes=[]
    for item in variant['occluders']:
        id=item['id']
        if not id.startswith('arch-'):continue
        arch='-'.join(id.split('-')[:2]);left=front(arch+'-left-foot');right=front(arch+'-right-foot')
        before=copy.deepcopy(item)
        if id.endswith('left-body'):item['depthNativeY']=left[1]
        elif id.endswith('right-body'):item['depthNativeY']=right[1]
        elif id.endswith('lintel'):item['depthLineNative']=[left,right]
        else:raise ValueError(id)
        check=copy.deepcopy(item)
        for key in ('depthNativeY','depthLineNative'):
            if key in before:check[key]=before[key]
        assert check==before,id
        changes.append({'id':id,'before':{k:before[k] for k in ('depthNativeY','depthLineNative') if k in before},
                         'after':{k:item[k] for k in ('depthNativeY','depthLineNative') if k in item}})
    assert len(changes)==24
    assert variant['ball']==base['ball'] and variant['shadow']==base['shadow']
    OUT.mkdir(parents=True,exist_ok=True)
    paths={'INPUTS.json','provenance.json',base['ball']['path'],base['shadow']['path'],
           *[o['path'] for o in base['occluders']]}
    unchanged={}
    for path in sorted(paths):
        raw=gitblob(BASE,PREFIX+path);dest=OUT/path;dest.parent.mkdir(parents=True,exist_ok=True);dest.write_bytes(raw)
        assert dest.read_bytes()==raw
        unchanged[path]={'bytes':len(raw),'sha256':hashlib.sha256(raw).hexdigest()}
    write_json(OUT/'assets.json',variant)
    write_json(OUT/'ANCHOR_CHANGES.json',{'baselineCommit':BASE,
      'rule':'For each accepted arch-foot quadrilateral, use midpoint of edge2->3 (largest native-Y mean) plus original translation. Lintel line joins the two front-edge midpoints.',
      'inputCommit':p1['commit'],'changes':changes,'byteUnchangedPayload':unchanged})
    rows=[]
    for n in range(1,9):
        id=f'arch-{n:02d}';a=old[id+'-left-body']['depthNativeY'];f=front(id+'-left-foot')[1]
        rows.append([id,a,f,f-a])
    s=io.StringIO(newline='');writer=csv.writer(s,lineterminator='\n')
    writer.writerow(['arch','old_native_y','front_edge_native_y','delta_native_y']);writer.writerows(rows)
    (OUT/'ANCHORS.csv').write_bytes(s.getvalue().encode())
    hashes=unchanged|{'assets.json':{'bytes':(OUT/'assets.json').stat().st_size,
      'sha256':hashlib.sha256((OUT/'assets.json').read_bytes()).hexdigest()}}
    write_json(OUT/'hashes.json',hashes)
    print(json.dumps({'variant':str(OUT),'changedDepthRegions':len(changes),
       'unchangedPNG':len([p for p in paths if p.endswith('.png')]),
       'assetsSha256':hashes['assets.json']['sha256'],'anchors':rows}))

if __name__=='__main__':main()
