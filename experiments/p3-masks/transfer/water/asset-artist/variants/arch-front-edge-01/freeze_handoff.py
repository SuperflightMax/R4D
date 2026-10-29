"""Freeze only this board's own artist prefix from exact Git blobs."""
import hashlib
import json
from pathlib import Path
import subprocess
import sys
ROOT=Path(__file__).resolve().parent
REPO=Path(r'E:\R4D\perspective\p3-worktrees\asset-artist')
PREFIX=ROOT.relative_to(REPO).as_posix()+'/'
def git(*args):return subprocess.check_output(['git','-C',str(REPO),*args])
def main():
    commit=git('rev-parse',sys.argv[1] if len(sys.argv)>1 else 'HEAD').decode().strip()
    meta=json.loads(git('show',commit+':'+PREFIX+'INPUTS.json'))
    expected=Path(r'E:\R4D\perspective\p3-runtime\asset-artist\transfer-water-dark')/meta['board']
    assert Path(meta['runtime']).resolve()==expected.resolve()
    output=expected/f'handoff-{commit[:12]}';output.mkdir(parents=True,exist_ok=False)
    files=git('ls-tree','-r','--name-only',commit,'--',PREFIX).decode().splitlines();records={}
    for file in files:
        assert file.startswith(PREFIX);rel=file[len(PREFIX):]
        raw=git('show',commit+':'+file);path=output/rel;path.parent.mkdir(parents=True,exist_ok=True)
        path.write_bytes(raw);final=path.read_bytes();assert final==raw
        records[rel]={'bytes':len(final),'sha256':hashlib.sha256(final).hexdigest()}
    for file,record in json.loads((output/'hashes.json').read_bytes()).items():assert records[file]==record,file
    for record in json.loads((output/'provenance.json').read_bytes())['assets']:
        assert records[record['path']]=={'bytes':record['bytes'],'sha256':record['sha256']}
    manifest={'sourceCommit':commit,'board':meta['board'],'sourcePrefix':PREFIX,
      'byteRule':'exact Git blobs; verified by rereading final bytes; no newline conversion',
      'payload':str(output),'count':len(records),'files':records}
    path=output.with_name(output.name+'.manifest.json')
    raw=(json.dumps(manifest,indent=2)+'\n').encode();path.write_bytes(raw)
    print(json.dumps({'commit':commit,'board':meta['board'],'payload':str(output),
      'files':len(records),'assetsSha256':records['assets.json']['sha256'],
      'manifest':str(path),'manifestSha256':hashlib.sha256(path.read_bytes()).hexdigest()}))
if __name__=='__main__':main()
