"""Future existing-wrapper transport. Requires a new exact CTO authorization file.

Adapted from combined_execute_v3.py at authorized commit 372344f9f6198cd811daa4612256a2fd8b32597b.
Never run an execution phase during Phase A. No token is generated here.
"""
import argparse
import hashlib
import json
import os
import shlex
import subprocess
import sys
from pathlib import Path

RUNTIME = Path(r'E:\R4D\perspective\p6-runtime\release-engineer\phase-a-local-partial-01')


def sha(data):
    return hashlib.sha256(data).hexdigest()


def require(ok, reason):
    if not ok:
        raise RuntimeError('STOP ' + reason)


UPLOAD = '''
import os,json,hashlib,shutil,sys,datetime
from pathlib import Path
assert os.geteuid()==0,'STOP actual euid0'
b=Path(S['writeBoundaryAfterSeparateTokenOnly']['backup']);p=b/'STATE.json';st=json.loads(p.read_bytes())
assert st['intentSha256']==A['intentSha256'] and st['tokenSha256']==A['tokenSha256'],'STOP state owner'
assert st['status']=='BACKUP_CREATED' and 'upload' not in st['completedPhases'],'STOP upload state; inspect uncertain outcome'
live=Path(S['writeBoundaryAfterSeparateTokenOnly']['liveSnippet']).read_bytes()
assert hashlib.sha256(live).hexdigest()==S['snippetDelta']['beforeSha256'],'STOP snippet drift'
target=Path(S['writeBoundaryAfterSeparateTokenOnly']['archiveRemotePath']);assert not os.path.lexists(target),'STOP occupied archive'
with target.open('xb') as stream:shutil.copyfileobj(sys.stdin.buffer,stream,1024*1024)
os.chmod(target,0o600)
assert target.stat().st_size==S['overlayArchive']['bytes'] and hashlib.sha256(target.read_bytes()).hexdigest()==S['overlayArchive']['sha256'],'STOP uploaded bytes'
st.update(status='UPLOADED',lastPhaseUtc=datetime.datetime.now(datetime.timezone.utc).isoformat());st['completedPhases'].append('upload')
p.write_bytes((json.dumps(st,ensure_ascii=False,indent=2)+'\\n').encode());os.chmod(p,0o600)
print(json.dumps({'status':'UPLOADED','archiveSha256':S['overlayArchive']['sha256']}))
'''


def main():
    parser = argparse.ArgumentParser(description=__doc__)
    parser.add_argument('--phase', required=True, choices=['preflight','begin','upload','stage','switch','postcheck','document','rollback'])
    parser.add_argument('--intent-file', required=True)
    parser.add_argument('--authorization-file', required=True)
    args = parser.parse_args()
    intent_path = Path(args.intent_file).resolve(); auth_path = Path(args.authorization_file).resolve()
    require(intent_path.is_relative_to(RUNTIME.resolve()) and auth_path.is_relative_to(RUNTIME.resolve()), 'control files outside own runtime')
    scope_bytes = intent_path.read_bytes(); scope = json.loads(scope_bytes); auth = json.loads(auth_path.read_bytes())
    require(scope['status']=='FROZEN_INTENT' and scope['tokenRequestReady'] is True, 'intent incomplete')
    require(auth.get('serverWrite') is True and auth.get('tokenGranted') is True and bool(auth.get('token')), 'new explicit CTO token missing')
    require(not auth['token'].startswith('CTO-P3-'), 'closed P3 token is not P6 authority')
    require(auth.get('intentSha256') == sha(scope_bytes), 'intent binding')
    require(auth.get('archiveSha256') == scope['overlayArchive']['sha256'], 'archive binding')
    require(auth.get('launcherSha256') == sha(Path(__file__).read_bytes()) == scope['writerHashes']['launcherSha256'], 'launcher binding')
    writer_path = intent_path.parent / 'P6_REMOTE_WRITER.py'; writer = writer_path.read_bytes()
    require(auth.get('writerSha256') == sha(writer) == scope['writerHashes']['composedWriterSha256'], 'writer binding')
    require(auth.get('releaseId') == scope['releaseId'] == 'p6-local-partial-01', 'release binding')
    require(args.phase in auth.get('authorizedPhases',[]), 'phase not authorized')
    execution = intent_path.parent / 'execution'; execution.mkdir(exist_ok=True)
    record = execution / (args.phase + '.json'); require(not record.exists(), 'phase record exists; RO reconcile, no replay')
    ssh = ['ssh','-o','BatchMode=yes','-o','StrictHostKeyChecking=yes','-o','ConnectTimeout=15','-o','ConnectionAttempts=1','vps1-direct']
    if args.phase == 'upload':
        archive = Path(scope['overlayArchive']['path']).resolve()
        require(archive.is_relative_to(RUNTIME.resolve()) and archive.stat().st_size == scope['overlayArchive']['bytes'] and sha(archive.read_bytes()) == scope['overlayArchive']['sha256'], 'local archive drift')
        small_scope = {'writeBoundaryAfterSeparateTokenOnly': {key:scope['writeBoundaryAfterSeparateTokenOnly'][key] for key in ('backup','liveSnippet','archiveRemotePath')},
                       'snippetDelta': {'beforeSha256':scope['snippetDelta']['beforeSha256']},
                       'overlayArchive': {key:scope['overlayArchive'][key] for key in ('bytes','sha256')}}
        small_auth = {'intentSha256':auth['intentSha256'], 'tokenSha256':sha(auth['token'].encode())}
        code = 'S='+repr(small_scope)+'\nA='+repr(small_auth)+'\n'+UPLOAD
        with archive.open('rb') as data:
            result = subprocess.run(ssh+['sudo -n -- python3 -B -c '+shlex.quote(code)],stdin=data,stdout=subprocess.PIPE,stderr=subprocess.PIPE)
    else:
        code = writer + ('\nSCOPE_BYTES='+repr(scope_bytes)+'\nSCOPE=json.loads(SCOPE_BYTES)\nAUTH='+repr(auth)+
                         '\nWRITER_SHA256='+repr(sha(writer))+'\ntry:\n print(json.dumps(run_phase('+repr(args.phase)+'),ensure_ascii=False))\n'
                         'except Exception as e:\n print(json.dumps({"status":"STOP","phase":'+repr(args.phase)+',"reason":str(e)}));raise SystemExit(1)\n').encode()
        result = subprocess.run(ssh+['sudo -n -- python3 -B -'],input=code,stdout=subprocess.PIPE,stderr=subprocess.PIPE)
    if result.stdout:
        value = json.loads(result.stdout); record.write_bytes((json.dumps(value,ensure_ascii=False,indent=2)+'\n').encode())
        print(json.dumps(value,ensure_ascii=False,indent=2))
    if result.returncode:
        if result.stderr:(execution/(args.phase+'.stderr.txt')).write_bytes(result.stderr)
        print('STOP exact phase '+args.phase+'; SSH exit '+str(result.returncode));raise SystemExit(result.returncode)


if __name__ == '__main__':
    main()
