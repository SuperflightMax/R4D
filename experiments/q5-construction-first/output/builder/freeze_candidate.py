"""Run only after real artwork, browser self-check and Artist readiness."""
from pathlib import Path
import json,hashlib,datetime
root=Path(__file__).resolve().parents[2]
out=root/'output/builder/q5-c1-files.json'
if out.exists():raise SystemExit('q5-c1 is immutable; do not overwrite')
rig=json.loads((root/'construction/v1/rig.json').read_text(encoding='utf-8-sig'))
art=json.loads((root/'public/art/manifest.json').read_text(encoding='utf-8-sig'))
byid={p['id']:p for p in art['parts']}
for p in rig['parts']:
    a=byid[p['id']]
    for key in ['parent','joint','pivot','layer']:
        if a[key]!=p[key]:raise SystemExit(f"Undocumented geometry mismatch {p['id']}.{key}")
runtime=[]
for dirname in ['src','public','construction/v1']:
    runtime.extend(p for p in (root/dirname).rglob('*') if p.is_file())
runtime.extend(root/p for p in ['index.html','package.json','package-lock.json','vite.config.js'])
provenance=[root/p for p in ['CONSTRUCTION.md','CONSTRUCTION_FREEZE.md','CONSTRUCTION_CHANGES.md','ART_DIRECTION.md','ART_PROVENANCE.md','ASSET_PROCESS.md']]
provenance.extend(p for p in (root/'assets').rglob('*') if p.is_file())
provenance.extend(p for p in (root/'construction').iterdir() if p.is_file())
def record(p):return dict(path=p.relative_to(root).as_posix(),bytes=p.stat().st_size,sha256=hashlib.sha256(p.read_bytes()).hexdigest())
result=dict(candidate='q5-c1',frozenAt=datetime.datetime.now(datetime.timezone.utc).isoformat(),runtime=[record(p) for p in sorted(set(runtime))],provenance=[record(p) for p in sorted(set(provenance))])
out.write_text(json.dumps(result,ensure_ascii=False,indent=2),encoding='utf8')
print(json.dumps({'runtime':len(result['runtime']),'provenance':len(result['provenance']),'manifestSHA256':hashlib.sha256(out.read_bytes()).hexdigest()}))
