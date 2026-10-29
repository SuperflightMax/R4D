"""Materialize the authorized core Git objects exclusively in the private runtime."""
import hashlib
import json
from pathlib import Path, PurePosixPath
import subprocess

REPO = r'D:\dev\millionko'
PIN = '5a6fa03f1cdb3de88a2d9c7dbe795eb8e2a7f023'
TREE = '008d16a80a26bb77d562a45218b01da09b0d9ff0'
RUNTIME = Path(r'E:\R4D\perspective\p6-runtime\builder')
PREFIX = 'packages/sim-core/'
def git(*args): return subprocess.check_output(['git','-C',REPO,*args])
actual = git('rev-parse',f'{PIN}:packages/sim-core').decode().strip()
if actual != TREE: raise ValueError(f'Native tree mismatch: {actual}')
target = RUNTIME / 'private' / PIN / 'sim-core'
files = []
for entry in git('ls-tree','-r','-z',PIN,'--',PREFIX+'src',PREFIX+'package.json').split(b'\0'):
    if not entry: continue
    meta, raw_path = entry.split(b'\t',1)
    mode, kind, oid = meta.decode().split()
    path = raw_path.decode()
    if kind != 'blob' or not path.startswith(PREFIX): raise ValueError('Unexpected native entry')
    rel = PurePosixPath(path[len(PREFIX):])
    if '..' in rel.parts: raise ValueError('Unexpected native path')
    data = git('cat-file','blob',oid)
    if hashlib.sha1(f'blob {len(data)}\0'.encode()+data).hexdigest() != oid: raise ValueError('Native blob mismatch')
    dest = target.joinpath(*rel.parts)
    dest.parent.mkdir(parents=True,exist_ok=True)
    dest.write_bytes(data)
    files.append(dict(path=str(rel),blob=oid,bytes=len(data),sha256=hashlib.sha256(data).hexdigest()))
(RUNTIME/'deps').mkdir(parents=True,exist_ok=True)
report = dict(commit=PIN,packageTree=TREE,files=files)
(target/'object-inventory.json').write_text(json.dumps(report,indent=2)+'\n',encoding='utf-8')
print(json.dumps(dict(commit=PIN,packageTree=TREE,privateTarget=str(target),files=len(files),bytes=sum(f['bytes'] for f in files)),indent=2))
