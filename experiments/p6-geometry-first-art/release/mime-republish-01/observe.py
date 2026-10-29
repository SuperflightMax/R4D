"""Read-only MIME preparation using exact known Review pointers only."""
import ast
import base64
import hashlib
import json
import subprocess
import sys
from pathlib import Path

RUNTIME = Path(r'E:\R4D\perspective\p6-runtime\release-engineer\mime-republish-01')
V1 = Path(r'E:\R4D\perspective\p6-runtime\release-engineer\phase-a-local-partial-01\candidate-03\intent')

CHECK = r'''
assert os.geteuid()==0,'STOP actual euid0'
snippet=Path('/etc/nginx/snippets/review.locations.conf')
before=opaque_snapshot(snippet);snippet_bytes=snippet.read_bytes()
assert before['sha256']=='f7948d10efb040e83c15d86df26866aed9a5a90eb53bf85c7fd0206c05d1200e','STOP actual baseline snippet drift'
roots=re.findall(rb'^\s*root\s+([^;\s]+)\s*;',snippet_bytes,re.M)
assert roots==[b'/srv/superflight-review/releases/p3-water-dark-front-edge-04'],'STOP actual routing drift'
mime=Path('/etc/nginx/mime.types');mime_before=opaque_snapshot(mime);mime_bytes=mime.read_bytes()
mapping={}
clean=re.sub(rb'#[^\n]*',b'',mime_bytes)
for match in re.finditer(rb'([a-zA-Z0-9.+-]+/[a-zA-Z0-9.+-]+)\s+([^;{}]+);',clean):
    for extension in match.group(2).split():mapping[extension.decode()]=match.group(1).decode()
assert mapping.get('js') in ('application/javascript','text/javascript'),'STOP standard JS MIME unsupported'
assert 'mjs' not in mapping or mapping['mjs']==mapping['js'],'STOP unexpected existing mjs mapping'
old=tree_digest(Path('/srv/superflight-review/releases/p3-water-dark-front-edge-04'),True)
retained=tree_digest(Path('/srv/superflight-review/releases/p6-local-partial-01'),True)
assert old['metadataDigest']=='71419d91cc132a8d63d1be21718e0f20c72a796ff65decbaf6b4c7de796c9f65','STOP old tree drift'
assert retained['metadataDigest']=='52b18f0d634801f45f5a618fb43bcf82cca6d7ed551654b5df26a4b4c051873d','STOP retained P6 drift'
docs=[opaque_snapshot(Path(x['path'])) for x in EXPECTED_DOCS]
assert docs==EXPECTED_DOCS,'STOP opaque documents drift'
targets=['/opt/superflight-studio/backups/review-p6-mime-republish-01','/etc/nginx/snippets/review.locations.conf.p6-mime-republish-01.tmp']
assert not any(os.path.lexists(x) for x in targets),'STOP occupied new MIME intent target'
http=[http_probe('/review/'),http_probe('/review/',True),http_probe('/review/.p6-phase-a-probe'),http_probe('/review/r4d/p6-geometry-first-art/')]
assert [x['status'] for x in http]==[200,403,404,404],'STOP active HTTP routing/protection differs'
assert http[0]['bodySha256']=='fd4e28b8bfb1764e9d6623009d8f21c23eb1e5df59590effc42ced55f842beeb','STOP actual catalog differs'
assert opaque_snapshot(snippet)==before and opaque_snapshot(mime)==mime_before,'STOP dependency drift during read-only observation'
print(json.dumps({'status':'MIME_PREPARATION_READ_ONLY','utc':now(),'actualEuid':os.geteuid(),'serverWrite':False,
 'snippet':before,'snippetBytesBase64':base64.b64encode(snippet_bytes).decode(),'rootLiterals':[x.decode() for x in roots],
 'standardMime':mime_before,'mimeBytesBase64':base64.b64encode(mime_bytes).decode(),'mimeMapping':mapping,
 'oldTree':old,'retainedTree':retained,'documents':docs,'http':http,'newIntentTargetsAbsent':targets,
 'knownRetainedRootIsNotActiveDuplicate':True},ensure_ascii=False))
'''


def main():
    final = len(sys.argv)>1 and sys.argv[1]=='--final'
    if not final:
        RUNTIME.mkdir(exist_ok=False)
        (RUNTIME / 'inputs').mkdir()
    record = RUNTIME / ('PREP_FINAL_RO.private.json' if final else 'PREP_BASELINE.private.json')
    assert not record.exists(), 'STOP existing observation; no duplicate request'
    writer = (V1 / 'P6_REMOTE_WRITER.py').read_bytes()
    assert hashlib.sha256(writer).hexdigest() == 'd91862fb74cbe3ca243b41e95d482f54ae28f1ea7ab85c4e3d102cb8c6424b4b'
    helpers = writer.split(b'"""Future token-bound P6 phases, adapted to existing combined wrapper mechanics.', 1)[0]
    scope = json.loads((V1 / 'FROZEN_INTENT.json').read_bytes())
    code = helpers + ('\nEXPECTED_DOCS=' + repr(scope['baseline']['serviceDocuments']) + '\n').encode() + CHECK.encode()
    ast.parse(code.decode())
    ssh = ['ssh','-o','BatchMode=yes','-o','StrictHostKeyChecking=yes','-o','ConnectTimeout=15','-o','ConnectionAttempts=1','vps1-direct','sudo -n -- python3 -B -']
    result = subprocess.run(ssh, input=code, stdout=subprocess.PIPE, stderr=subprocess.PIPE)
    record.write_bytes(result.stdout)
    if result.stderr:
        (RUNTIME / 'PREP_BASELINE.stderr.txt').write_bytes(result.stderr)
    if result.returncode:
        print(result.stderr.decode('utf-8','replace')); raise SystemExit(result.returncode)
    value = json.loads(result.stdout)
    for field, name in [('snippetBytesBase64','snippet-before.bin'),('mimeBytesBase64','standard-mime.types')]:
        data=base64.b64decode(value.pop(field));target=RUNTIME/'inputs'/name
        if final:assert target.read_bytes()==data,'STOP final dependency bytes drift'
        else:target.write_bytes(data)
    for field in ['oldTree','retainedTree']:
        value[field].pop('metadataRows',None)
    mapping = value.pop('mimeMapping')
    value['selectedMimeMappings'] = {key:mapping.get(key) for key in ['html','css','js','mjs','json','png','txt']}
    value['standardMappingCount'] = len(mapping)
    print(json.dumps(value,ensure_ascii=False,indent=2))
    print('baselineSha256',hashlib.sha256(record.read_bytes()).hexdigest())


if __name__ == '__main__':
    sys.stdout.reconfigure(encoding='utf-8'); main()
