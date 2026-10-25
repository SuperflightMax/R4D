"""Make a geometry-only edit target, one atlas with 15 registered surfaces."""
import json
from pathlib import Path
from PIL import Image, ImageDraw

ART=Path(__file__).resolve().parents[1]
DATA=json.loads((ART.parent/'construction/construction.json').read_text(encoding='utf-8'))
ORDER=['far_leg_skin','near_leg_skin','far_arm_skin','near_arm_skin',
       'torso_top','pelvis_shorts','far_shorts_leg','near_shorts_leg',
       'far_hand','near_hand','far_shoe','near_shoe','neck_skin','head_face','hair']

def polygons(s):
    g=s['geometry_bind']
    return [p['outline'] for p in g['patches']] if 'patches' in g else [g['outline']]

def make():
    factor=2
    im=Image.new('RGBA',(2048*factor,2048*factor))
    draw=ImageDraw.Draw(im)
    mapping=[]
    surfaces={s['id']:s for s in DATA['surfaces']}
    for i,name in enumerate(ORDER):
        s=surfaces[name]; polys=polygons(s)
        pp=[(512+2*x,900-2*y) for poly in polys for x,y in poly]
        box=[min(x for x,y in pp),min(y for x,y in pp),max(x for x,y in pp),max(y for x,y in pp)]
        cx=(box[0]+box[2])/2;cy=(box[1]+box[3])/2
        dx=(i%4)*512+256-cx;dy=(i//4)*512+256-cy
        color='#ce986f' if 'far' in name else '#e2ac80'
        if 'shorts' in name: color='#b96648'
        elif name=='torso_top':color='#398b91'
        elif 'shoe' in name:color='#77745f'
        elif name=='hair':color='#413331'
        for poly in polys:
            xy=[((512+2*x+dx)*factor,(900-2*y+dy)*factor) for x,y in poly]
            draw.polygon(xy,fill=color)
        mapping.append({'id':name,'cell':i,'atlas_translation':[dx,dy],'source_bbox':box})
    folder=ART/'reference';folder.mkdir(parents=True,exist_ok=True)
    im.resize((2048,2048),Image.Resampling.LANCZOS).save(folder/'surface-atlas-registration.png')
    (folder/'surface-atlas-map.json').write_text(json.dumps(mapping,indent=2)+'\n',encoding='utf-8')

if __name__=='__main__':make()
