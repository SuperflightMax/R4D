import hashlib, json, re, subprocess, urllib.request
from pathlib import Path
from PIL import Image

ROOT = Path('D:/dev/R4D')
Q = ROOT / 'experiments/q4a-whole-character'
BASE = Q / 'build/negative-review-v02/review/r4d/q4a-whole-character'
OUT = Q / 'qa/technical/negative-review'
URL = 'http://127.0.0.1:4197/review/r4d/q4a-whole-character/'
COMMIT = '62a3b8cfd9599cc5d71e6433784c3661c5527a5f'
checks = []
origin_notes = []
def check(name, ok):
    checks.append({'check': name, 'pass': bool(ok)})
def sha(data): return hashlib.sha256(data).hexdigest()
def read(p): return json.loads(p.read_text(encoding='utf-8-sig'))
build, source = read(BASE/'build-manifest.json'), read(BASE/'source-manifest.json')
check('build manifest supplied hash', sha((BASE/'build-manifest.json').read_bytes()) == 'c403b92bd4da73c072e20dac6d6fcc5bdb29222d92c6e7524f7757c5865133c8')
check('source manifest supplied hash', sha((BASE/'source-manifest.json').read_bytes()) == '51737944bd88908185cae36c529049ce05935b9d06a5b08cf66298106db88e6c')
files = {p.relative_to(BASE).as_posix() for p in BASE.rglob('*') if p.is_file()}
check('complete manifest tree', files == set(build['files']) | {'build-manifest.json'})
for name, info in build['files'].items():
    data = (BASE/name).read_bytes()
    check('file '+name, sha(data)==info['sha256'] and len(data)==info['bytes'])
for name in sorted(files):
    with urllib.request.urlopen(URL+name) as r:
        check('HTTP exact '+name, r.status==200 and r.read()==(BASE/name).read_bytes())
frozen_origins = 0
for entry in source['entries']:
    dest = BASE/entry['destination']
    check('output '+entry['destination'], sha(dest.read_bytes())==entry['outputSha256'])
    origins = entry.get('origins', [{'origin': entry.get('origin'), 'sha256': entry.get('originSha256')}])
    for origin in origins:
        data = (ROOT/origin['origin']).read_bytes()
        check('origin '+origin['origin'], sha(data)==origin['sha256'])
        if '/app/negative-review/' not in origin['origin']:
            frozen = subprocess.run(['git','show',COMMIT+':'+origin['origin']], cwd=ROOT, capture_output=True)
            if '/art/negative-review/SOURCE_CATALOG.json' in origin['origin']:
                origin_notes.append({'origin':origin['origin'],'note':'new viewer catalog; not present in research commit; source images/reviews verified separately'})
            else:
                check('committed origin content '+origin['origin'], frozen.returncode==0 and frozen.stdout.replace(b'\r\n',b'\n')==data.replace(b'\r\n',b'\n'))
                if frozen.stdout!=data:
                    origin_notes.append({'origin':origin['origin'],'note':'working-tree CRLF vs committed LF only; candidate exact to hashed working-tree origin'})
            frozen_origins += 1
    transform = entry['transformation']
    if transform=='exact byte copy':
        check('exact copy '+entry['destination'], dest.read_bytes()==(ROOT/entry['origin']).read_bytes())
    if transform.startswith('deterministic rectangular source crop'):
        x,y,w,h=map(int,re.search(r'\[(\d+),(\d+),(\d+),(\d+)\]',transform).groups())
        im=Image.open(ROOT/origins[0]['origin']).convert('RGBA').crop((x,y,x+w,y+h))
        got=Image.open(dest).convert('RGBA')
        check('crop pixels '+entry['destination'], im.size==got.size and im.tobytes()==got.tobytes())
data=read(BASE/'data/evidence.json')
catalog=read(BASE/'data/source-catalog.json')
check('five whole sources',len(data['wholes'])==len(catalog['sources'])==5)
for item,original in zip(data['wholes'],catalog['sources']):
    for key,source_key in [('id','id'),('origin','originPath'),('sha256','sha256'),('statusScope','statusScope')]:
        check('catalog '+item['id']+' '+key,item[key]==original[source_key])
    check('catalog status '+item['id'],item['catalogStatus']==original['statusRu']+' '+original['noteRu'])
rest=read(Q/'builder/early-v04-r1/CAGE_REST.json')
result=read(Q/'builder/early-v04-r2/R2_RESULT.json')
witness=read(Q/'builder/early-v04-r2/R2_FAILURE.json')['witness']
for key,value in data['rest'].items(): check('rest '+key,value==rest[key])
check('exact count/order', len(data['accepted'])==len(result['outputs'])==26 and [r['label'] for r in data['accepted']]==['low-'+str(i) for i in range(26)])
for i,row in enumerate(data['accepted']):
    for key,value in row.items(): check('accepted '+str(i)+' '+key,value==result['outputs'][i][key])
for key,value in data['rejected'].items(): check('rejected '+key,value==witness[key])
check('triangle923',data['rest']['triangles'][923]==data['rejected']['indices'])
check('no interpolation',data['interpolation'] is False)
check('source commit',data['sourceCommit']==COMMIT)
check('correction01 no fake image',data['blockedCorrection01']['hasImage'] is False)
report={'candidate':'negative-review-v02','url':URL,'buildManifestSHA256':sha((BASE/'build-manifest.json').read_bytes()),'fileCount':len(files),'sourceEntryCount':len(source['entries']),'frozenOriginsChecked':frozen_origins,'originNotes':origin_notes,'checks':checks,'failed':[c for c in checks if not c['pass']]}
(OUT/'INTEGRITY_V02.json').write_text(json.dumps(report,ensure_ascii=False,indent=2),encoding='utf-8')
print(json.dumps({k:v for k,v in report.items() if k!='checks'},ensure_ascii=False,indent=2))
raise SystemExit(bool(report['failed']))
