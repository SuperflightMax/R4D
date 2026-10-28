"""Run one explicitly selected token phase; never retries or rebuilds a package."""
import hashlib
import json
import os
from pathlib import Path
import shlex
import subprocess
import sys

HERE = Path(__file__).parent
RUNTIME = Path(r'E:\R4D\perspective\p3-runtime\release-engineer\delivery-p3-frozen-01')
ARCHIVE = Path(r'E:\R4D\perspective\p3-runtime\release-engineer\intent-p3-frozen-01\p3-jungle-masks-frozen-01.tar.gz')
EXPECTED = '23a3df76a29b05d8cc7ea17ff1cf0e9e360848a540f15386d26e1a85998f463c'
SSH = ['ssh','-o','BatchMode=yes','-o','StrictHostKeyChecking=yes','-o','ConnectTimeout=15',
       '-o','ConnectionAttempts=1','vps1-direct']

phase = sys.argv[1]
assert phase in ('begin','upload','stage','switch','postcheck','oldroutes','document')
RUNTIME.mkdir(parents=True,exist_ok=True)
record = RUNTIME/(phase+'.json')
assert not record.exists(), 'Phase result exists; inspect exact state, do not repeat'
source = (HERE/'remote_frozen_01.py').read_text(encoding='utf-8')+'\nmain('+repr(phase)+')\n'
if phase == 'upload':
    assert ARCHIVE.stat().st_size == 80568959 and hashlib.sha256(ARCHIVE.read_bytes()).hexdigest() == EXPECTED
    print('Uploading exact token archive; live root unchanged until separate switch phase.',flush=True)
    with ARCHIVE.open('rb') as data:
        result = subprocess.run(SSH+['sudo -n python3 -c '+shlex.quote(source)],stdin=data,
                                stdout=subprocess.PIPE,stderr=subprocess.PIPE)
else:
    result = subprocess.run(SSH+['sudo -n python3 -'],input=source.encode('utf-8'),
                            stdout=subprocess.PIPE,stderr=subprocess.PIPE)
if result.stdout:
    try:
        parsed = json.loads(result.stdout)
    except ValueError:
        parsed = {'phase':phase,'status':'STOP','reason':'Non-JSON SSH stdout; do not repeat'}
    record.write_bytes((json.dumps(parsed,ensure_ascii=False,indent=2)+'\n').encode())
    print(json.dumps(parsed,ensure_ascii=False,indent=2),flush=True)
if result.returncode:
    print('STOP phase '+phase+'; SSH exit '+str(result.returncode),flush=True)
    # These calls only run our code and nginx validation; never dump config or credentials.
    if result.stderr:
        (RUNTIME/(phase+'.stderr.txt')).write_bytes(result.stderr)
        print(result.stderr.decode('utf-8',errors='replace')[:2000],flush=True)
    sys.exit(result.returncode)
