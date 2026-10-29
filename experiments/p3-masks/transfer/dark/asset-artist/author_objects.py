"""Dark's own inspected source silhouettes; unchanged P1 oriented foundations."""
import json
from pathlib import Path
import subprocess
ROOT=Path(__file__).resolve().parent
REPO=Path(r'E:\R4D\perspective\p3-worktrees\asset-artist')

def clip(poly,x,left):
    out=[]
    for a,b in zip(poly[-1:]+poly[:-1],poly):
        ia=a[0]<=x if left else a[0]>=x;ib=b[0]<=x if left else b[0]>=x
        if ia!=ib:
            t=(x-a[0])/(b[0]-a[0]);out.append([x,round(a[1]+t*(b[1]-a[1]),3)])
        if ib:out.append(b)
    return out

def fit(poly,b):
    x0,y0,x1,y1=b
    return [[round(x0+x*(x1-x0),3),round(y0+y*(y1-y0),3)] for x,y in poly]

def main():
    meta=json.loads((ROOT/'INPUTS.json').read_bytes());p=meta['p1']
    profile=json.loads(subprocess.check_output(['git','-C',str(REPO),'show',p['commit']+':'+p['files']['projection']['path']]))
    supports={o['id']:o for o in profile['obstacles']}
    bowl=[[.03,.28],[.10,.17],[.17,.10],[.26,.09],[.29,.04],[.40,.02],[.43,0],[.59,0],[.62,.04],[.73,.04],[.75,.10],[.85,.11],[.91,.18],[.98,.25],[1,.42],[.95,.55],[.90,.59],[.88,.85],[.78,.94],[.57,1],[.31,.98],[.17,.90],[.10,.80],[.07,.58],[.02,.50],[0,.35]]
    skull=[[.15,.02],[.42,0],[.52,.06],[.85,.015],[.98,.10],[1,.31],[.95,.50],[.86,.58],[.84,.83],[.74,.98],[.23,1],[.10,.92],[.06,.69],[.09,.56],[.02,.47],[0,.21],[.05,.10]]
    pillar=[[.10,.04],[.40,0],[.80,.02],[.94,.10],[.94,.71],[1,.76],[1,.98],[.04,1],[0,.93],[.01,.77],[.08,.72]]
    block=[[.38,.02],[.54,0],[.65,.08],[.79,.08],[.95,.20],[.95,.33],[1,.43],[.97,.72],[.86,.82],[.53,1],[.13,.83],[.015,.73],[0,.43],[.04,.33],[.04,.20],[.21,.11],[.31,.12]]
    bowls=[[744,292,840,388],[332,386,431,482],[1105,408,1209,499],[559,591,664,699],[999,696,1111,808],[505,847,624,969]]
    skulls=[[461,282,543,378],[1016,282,1100,380],[714,455,807,566],[1128,592,1231,701],[420,702,516,821],[837,837,943,968]]
    pillars=[[591,370,670,479],[310,577,395,704],[836,575,922,704],[252,811,344,954],[1181,813,1279,957],[668,961,762,1104]]
    blocks=[[884,368,971,478],[454,485,548,588],[975,487,1067,597],[683,704,786,835],[344,967,449,1097],[994,967,1105,1097]]
    regions=[]
    for family,boxes,template in [('bowl-base',bowls,bowl),('skull-base',skulls,skull)]:
        for n,b in enumerate(boxes,1):
            id=f'{family}-{n:02d}';regions.append({'id':id,'pinId':id,'sourceBoundsPx':b,'polygons':[fit(template,b)]})
    for family,boxes,template in [('pillar',pillars,pillar),('block',blocks,block)]:
        for n,b in enumerate(boxes,1):
            id=f'{family}-{n:02d}';poly=fit(template,b);v=supports[id]['sourceVerticesPx']
            # P1 polygon vertices are retained in their accepted order. Front
            # and side anchors are the actual base edges, not axis-aligned boxes.
            split=v[1][0] if family=='pillar' else v[2][0]
            edges=[(v[3],v[2]),(v[1],v[2])] if family=='pillar' else [(v[3],v[2]),(v[2],v[1])]
            for suffix,left,edge in [('front',True,edges[0]),('side',False,edges[1])]:
                regions.append({'id':id+'-'+suffix,'sourceObjectId':id,'sourceBoundsPx':b,
                    'depthLineSourcePx':edge,'polygons':[clip(poly,split+(1 if left else -1),left)]})
    boundary=ROOT/'boundary_regions.json';data={'regions':regions}
    if boundary.exists():
        bd=json.loads(boundary.read_bytes());regions.extend(bd['regions'])
        data['openProbes']=bd.get('openProbes',[]);data['opaqueProbes']=bd.get('opaqueProbes',[])
    (ROOT/'regions.json').write_bytes((json.dumps(data,indent=2)+'\n').encode())

if __name__=='__main__':main()
