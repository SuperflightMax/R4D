"""Author the remaining fixed-scene silhouettes from inspected source bounds.

Templates only reuse this artist's own silhouettes of the same painted family.
They do not supply pixels, change the board, or change the P1 geometry.
"""
import json
from pathlib import Path

ROOT=Path(__file__).resolve().parent

def main():
    data=json.loads((ROOT/'regions.json').read_text(encoding='utf8'))
    early={r['id']:r for r in data['regions'] if r['id'] in ('leaf-01','flower-01')}
    templates={
      'flower':[(0,.48),(.01,.34),(.08,.24),(.13,.21),(.14,.10),(.23,.02),(.39,0),(.48,.04),(.57,0),(.72,.02),(.82,.10),(.82,.21),(.90,.24),(.95,.33),(.95,.44),(.99,.54),(1,.70),(.95,.84),(.82,.93),(.66,.99),(.39,1),(.21,.94),(.06,.84),(0,.71)],
      'leaf':[(.03,.51),(0,.43),(0,.35),(.03,.30),(.09,.32),(.12,.33),(.095,.24),(.095,.19),(.126,.14),(.18,.11),(.23,.126),(.274,.19),(.316,.24),(.326,.10),(.368,.038),(.432,0),(.505,0),(.558,.05),(.579,.126),(.568,.20),(.61,.126),(.65,.10),(.71,.126),(.78,.11),(.84,.15),(.85,.23),(.82,.316),(.88,.30),(.958,.29),(1,.34),(.98,.43),(.94,.51),(.895,.56),(.958,.58),(.98,.68),(.947,.80),(.83,.91),(.674,.975),(.484,1),(.305,.975),(.158,.89),(.053,.80),(.021,.68)],
      'frog':[(.02,.53),(.07,.43),(.13,.38),(.16,.24),(.22,.12),(.29,.06),(.38,.07),(.44,.15),(.57,.12),(.65,.04),(.74,0),(.83,.04),(.88,.12),(.89,.24),(.94,.34),(.99,.45),(1,.67),(.96,.81),(.84,.93),(.68,.99),(.30,1),(.13,.94),(.025,.83),(0,.68)],
      'wood':[(.05,.17),(.10,.09),(.23,.035),(.43,0),(.66,.01),(.84,.05),(.95,.13),(.98,.22),(.96,.29),(.98,.41),(.96,.55),(.97,.64),(1,.80),(.97,.90),(.85,.97),(.60,1),(.28,.99),(.09,.93),(0,.84),(.025,.72),(.015,.61),(.03,.52),(.025,.42),(.04,.32)]
    }
    # Individually inspected pixel bounds, not inferred collider silhouettes.
    bounds={
      'frog-01':[967,330,1056,408], 'wood-01':[599,410,660,497],
      'flower-02':[843,434,930,509], 'wood-02':[1049,410,1110,497],
      'frog-02':[432,477,526,558], 'leaf-02':[685,492,787,579],
      'leaf-03':[952,513,1049,594], 'wood-03':[537,577,599,667],
      'flower-03':[799,586,885,664], 'frog-03':[1080,583,1179,667],
      'frog-04':[646,673,749,761], 'wood-04':[916,656,978,752],
      'wood-05':[1167,682,1231,777], 'flower-04':[474,752,565,833],
      'flower-05':[757,778,847,859], 'leaf-04':[1015,757,1118,847],
      'wood-06':[391,876,457,974], 'leaf-05':[574,852,678,944],
      'frog-05':[866,873,975,963], 'flower-06':[1099,880,1192,964],
      'flower-07':[449,999,547,1090], 'wood-07':[663,971,734,1076],
      'wood-08':[950,971,1020,1074]
    }
    regions=list(early.values())
    for id,b in bounds.items():
        family=id.split('-')[0];x0,y0,x1,y1=b
        polygon=[[round(x0+x*(x1-x0),2),round(y0+y*(y1-y0),2)] for x,y in templates[family]]
        regions.append({'id':id,'kind':'pin','configId':id,'sourceBoundsPx':b,
                        'polygons':[polygon]})
    boundary_path=ROOT/'boundary_regions.json'
    if boundary_path.exists():
        regions.extend(json.loads(boundary_path.read_text(encoding='utf8'))['regions'])
    data['regions']=regions
    (ROOT/'regions.json').write_bytes((json.dumps(data,indent=2)+'\n').encode('utf8'))

if __name__=='__main__':main()
