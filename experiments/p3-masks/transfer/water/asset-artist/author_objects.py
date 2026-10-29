"""Water pixel silhouettes only; native support data remains pinned in P1."""
import json
from pathlib import Path
ROOT=Path(__file__).resolve().parent

def clip(poly,x,left):
    out=[]
    for a,b in zip(poly[-1:]+poly[:-1],poly):
        ia=a[0]<=x if left else a[0]>=x;ib=b[0]<=x if left else b[0]>=x
        if ia!=ib:
            t=(x-a[0])/(b[0]-a[0]);out.append([x,round(a[1]+t*(b[1]-a[1]),3)])
        if ib:out.append(b)
    return out

def fit(poly,old,b):
    x0,y0,x1,y1=old;a,c,d,e=b
    return [[round(a+(x-x0)*(d-a)/(x1-x0),3),round(c+(y-y0)*(e-c)/(y1-y0),3)] for x,y in poly]

def main():
    early=json.loads((ROOT/'regions.json').read_bytes())
    frog=next(r for r in early['regions'] if r['id']=='frog-01')['polygons'][0]
    arch=[[498,314],[585,314],[589,318],[587,343],[584,347],[593,397],[588,402],[569,402],[566,388],[559,379],[550,375],[540,375],[531,379],[523,388],[519,401],[497,401],[494,397],[503,348],[497,344],[495,320]]
    frog_bounds={'frog-01':[721,264,819,360],'frog-02':[405,432,507,530],
      'frog-03':[1027,431,1130,530],'frog-04':[357,685,472,799],
      'frog-05':[1067,685,1184,800],'frog-06':[706,839,829,968]}
    arches={'arch-01':[494,314,593,402],'arch-02':[947,314,1047,403],
      'arch-03':[270,549,380,651],'arch-04':[712,540,825,647],
      'arch-05':[1157,548,1270,652],'arch-06':[834,703,952,813],
      'arch-07':[450,854,575,974],'arch-08':[961,853,1088,974]}
    pillars={'pillar-01':[340,282,418,391],'pillar-02':[1119,282,1197,391],
      'pillar-03':[610,402,690,521],'pillar-04':[849,402,929,521],
      'pillar-05':[506,542,591,666],'pillar-06':[948,542,1031,666],
      'pillar-07':[595,691,686,820]}
    pillar=[[.16,.08],[.45,0],[.76,.035],[.86,.12],[.84,.74],[.95,.77],[1,.91],[.70,.99],[.37,1],[0,.92],[.02,.76],[.15,.71]]
    regions=[];opens=[];opaque=[]
    for id,b in frog_bounds.items():
        regions.append({'id':id,'pinId':id,'sourceBoundsPx':b,'polygons':[fit(frog,[721,264,819,360],b)]})
    for id,b in pillars.items():
        regions.append({'id':id,'supportId':id,'sourceBoundsPx':b,'polygons':[fit(pillar,[0,0,1,1],b)]})
    for id,b in arches.items():
        poly=fit(arch,[494,314,593,402],b);a,y0,z,y1=b;w=z-a;h=y1-y0
        xleft=a+(523-494)/99*w;xright=a+(565-494)/99*w
        for suffix,left,right,depth in [('left-body',a-2,xleft,{'supportId':id+'-left-foot'}),
          ('lintel',xleft,xright,{'supportLine':[id+'-left-foot',id+'-right-foot']}),
          ('right-body',xright,z+2,{'supportId':id+'-right-foot'})]:
            regions.append({'id':id+'-'+suffix,**depth,'polygons':[clip(clip(poly,left-1,False),right+1,True)]})
        ids=[id+'-'+suffix for suffix in ('left-body','lintel','right-body')]
        opens.append({'ids':ids,'point':[round(a+w*.5),round(y0+h*.92)]})
        opaque.append({'ids':ids,'point':[round(a+w*.5),round(y0+h*.45)]})
    boundary=ROOT/'boundary_regions.json'
    if boundary.exists():
        boundary_data=json.loads(boundary.read_bytes());regions.extend(boundary_data['regions'])
        opens.extend(boundary_data.get('openProbes',[]));opaque.extend(boundary_data.get('opaqueProbes',[]))
    data={'regions':regions,'openProbes':opens,'opaqueProbes':opaque}
    (ROOT/'regions.json').write_bytes((json.dumps(data,indent=2)+'\n').encode())

if __name__=='__main__':main()
