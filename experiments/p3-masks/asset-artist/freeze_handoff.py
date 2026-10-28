"""Extract this artist's entire exact Git payload, then hash extracted bytes.

The outer runtime manifest includes hashes.json and all provenance/prompts/docs;
it is outside the payload to avoid a self-referential digest. No Git checkout,
newline rewriting, shell redirection of binary data, or source image edits.
"""
import hashlib
import json
from pathlib import Path, PurePosixPath
import subprocess
import sys

ROOT=Path(__file__).resolve().parent
REPO=ROOT.parents[2]
PREFIX='experiments/p3-masks/asset-artist/'
RUNTIME=Path(r'E:\R4D\perspective\p3-runtime\asset-artist').resolve()

def git(*args):
    return subprocess.check_output(['git','-C',str(REPO),*args])

def main():
    commit=git('rev-parse',sys.argv[1] if len(sys.argv)>1 else 'HEAD').decode().strip()
    output=(RUNTIME/f'handoff-{commit[:12]}').resolve()
    assert output.parent==RUNTIME
    files=git('ls-tree','-r','--name-only',commit,'--',PREFIX).decode().splitlines()
    assert files and all(p.startswith(PREFIX) for p in files)
    output.mkdir(parents=True,exist_ok=False)
    records={}
    for name in files:
        relative=PurePosixPath(name[len(PREFIX):])
        assert '..' not in relative.parts
        raw=git('show',f'{commit}:{name}')
        destination=output.joinpath(*relative.parts)
        destination.parent.mkdir(parents=True,exist_ok=True)
        destination.write_bytes(raw)
        reread=destination.read_bytes()
        assert reread==raw,name
        records[relative.as_posix()]={'bytes':len(reread),
          'sha256':hashlib.sha256(reread).hexdigest()}
    inner=json.loads((output/'hashes.json').read_bytes())
    for name,record in inner.items():assert records[name]==record,name
    for name in ('ball-v1','shadow-v1'):
        provenance=json.loads((output/'provenance'/f'{name}.json').read_bytes())
        raster=records[provenance['destination']]
        assert raster['sha256']==provenance['sha256']
        assert raster['bytes']==provenance['bytes']
    manifest={'schema':'r4d-p3-artist-exact-git-handoff-v1','sourceCommit':commit,
      'sourcePrefix':PREFIX,'payloadDirectory':str(output),
      'byteRule':'exact git blob bytes copied without newline conversion; hashes from reread extracted bytes',
      'fileCount':len(records),'totalBytes':sum(r['bytes'] for r in records.values()),
      'files':records}
    path=output.with_name(output.name+'.manifest.json')
    raw=(json.dumps(manifest,indent=2)+'\n').encode('utf8')
    path.write_bytes(raw)
    assert path.read_bytes()==raw
    summary={'commit':commit,'directory':str(output),'fileCount':len(records),
      'manifest':str(path),'manifestSha256':hashlib.sha256(raw).hexdigest(),
      'keyFiles':{name:records[name] for name in
         ('assets.json','hashes.json','provenance/ball-v1.json','provenance/shadow-v1.json')}}
    print(json.dumps(summary,indent=2))

if __name__=='__main__':main()
