import json
from pathlib import Path
root=Path(__file__).parent
summary={}
for p in root.glob('*.log'):
    txt=p.read_text(encoding='utf-8-sig')
    if '### Result\n' not in txt: continue
    try: data=json.JSONDecoder().raw_decode(txt.split('### Result\n',1)[1].strip())[0]
    except ValueError: continue
    (root/(p.stem+'.json')).write_text(json.dumps(data,ensure_ascii=False,indent=2),encoding='utf-8')
    rows=data.get('rows',[])
    summary[p.stem]={'captures':len(rows),'phases':sorted(set(r.get('phase','') for r in rows))}
    if rows and 'stats' in rows[0]:
        summary[p.stem]['max_inversions']=max(r['stats']['inverted'] for r in rows)
        summary[p.stem]['max_webgl_error']=max(r['stats']['webglError'] for r in rows)
    if 'pause' in data: summary[p.stem]['pause']=data['pause']
print(json.dumps(summary,ensure_ascii=False,indent=2))
(root/'capture-summary.json').write_text(json.dumps(summary,ensure_ascii=False,indent=2),encoding='utf-8')
