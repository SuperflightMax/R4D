from pathlib import Path
import json,hashlib,sys,datetime
R=Path(__file__).resolve().parents[2]
p=R/'output/builder/q6-c1-files.json'
h=lambda x:hashlib.sha256(x.read_bytes()).hexdigest()
assert h(p)=='cc739d9e680f64b3fecf62e855b80caf4a7002f501eba282668a9e95758c8321'
m=json.loads(p.read_text(encoding='utf-8'));checks=[]
for item in m['runtime']+m['immutableInputs']:
    f=R/item['file'];actual=h(f)
    checks.append({'file':item['file'],'sha256':actual,'bytes':f.stat().st_size,'match':actual==item['sha256'] and f.stat().st_size==item['bytes']})
out={'utc':datetime.datetime.now(datetime.timezone.utc).isoformat(),'manifest_sha256':h(p),'files':len(checks),'bytes':sum(x['bytes'] for x in checks),'all_match':all(x['match'] for x in checks),'checks':checks}
(R/'qa/artist'/sys.argv[1]).write_text(json.dumps(out,indent=2)+'\n',encoding='utf-8')
assert out['all_match'] and out['files']==76
print({k:v for k,v in out.items() if k!='checks'})
