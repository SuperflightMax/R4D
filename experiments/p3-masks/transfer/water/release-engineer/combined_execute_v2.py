"""Future transport only. Requires a new CTO authorization file; no token is generated."""
from pathlib import Path
import argparse,hashlib,json,os,shlex,subprocess,sys

CONTROL=Path(__file__).parent
RUNTIME=Path(r'E:\R4D\perspective\p3-runtime\release-engineer\transfer-water-dark\combined\water-dark-front-edge-04')

def sha(data):return hashlib.sha256(data).hexdigest()
def require(ok,reason):
    if not ok:raise RuntimeError('STOP: '+reason)

UPLOAD=r'''
import pathlib,os,json,re,hashlib,shutil,sys,datetime
s=SCOPE;a=AUTH
assert os.geteuid()==0,'STOP euid0 required'
b=pathlib.Path(s['backup']);st=json.loads((b/'STATE.json').read_bytes())
assert st['token']==a['token'] and st['scopeSha256']==a['scopeSha256'],'STOP backup owner mismatch'
assert st['status']=='BACKUP_CREATED','STOP upload already started/completed or unexpected state'
live=pathlib.Path(s['snippet']).read_bytes()
assert hashlib.sha256(live).hexdigest()==s['oldSnippetSha256'],'STOP live snippet drift'
assert re.findall(rb'^\s*root\s+([^;\s]+)\s*;',live,re.M)==[s['oldRoot'].encode()],'STOP live root drift'
for p in [s['newRoot'],s['tempSnippet'],s['archiveRemotePath']]:assert not os.path.lexists(p),'STOP occupied target '+p
target=pathlib.Path(s['archiveRemotePath'])
with target.open('xb') as f:shutil.copyfileobj(sys.stdin.buffer,f,1024*1024)
os.chmod(target,0o644)
assert target.stat().st_size==s['archive']['bytes'] and hashlib.sha256(target.read_bytes()).hexdigest()==s['archive']['sha256'],'STOP uploaded identity mismatch'
st.update(status='UPLOADED',uploadUtc=datetime.datetime.now(datetime.timezone.utc).isoformat())
(b/'STATE.json').write_bytes((json.dumps(st,ensure_ascii=False,indent=2)+'\n').encode());os.chmod(b/'STATE.json',0o644)
print(json.dumps({'status':st['status'],'utc':st['uploadUtc'],'archiveSha256':s['archive']['sha256'],'bytes':s['archive']['bytes']}))
'''

def main():
    parser=argparse.ArgumentParser(description=__doc__)
    parser.add_argument('--phase',required=True,choices=['preflight','begin','upload','stage','switch','postcheck','document','rollback'])
    parser.add_argument('--authorization-file',required=True,help='NEW explicit CTO token/bindings; must not exist during intent preparation')
    args=parser.parse_args()
    scope_bytes=(CONTROL/'combined-packet/WRITE_SCOPE.json').read_bytes();s=json.loads(scope_bytes)
    auth=json.loads(Path(args.authorization_file).read_bytes())
    remote=(CONTROL/'combined_remote_v2.py').read_bytes()
    require(auth.get('serverWrite') is True and bool(auth.get('token')),'new explicit CTO token missing')
    require(auth.get('windowOwner')==s['windowOwner'] and auth.get('releaseId')==s['releaseId'],'wrong window/release')
    require(auth.get('scopeSha256')==sha(scope_bytes),'scope bytes mismatch')
    require(auth.get('scriptSha256')==sha(remote),'write script bytes mismatch')
    require(auth.get('launcherSha256')==sha(Path(__file__).read_bytes()),'launcher bytes mismatch')
    require(auth.get('archiveSha256')==s['archive']['sha256'] and auth.get('releaseManifestSha256')==s['releaseManifest']['sha256'],'artifact binding mismatch')
    require(args.phase in auth.get('authorizedPhases',[]),'phase not authorized')
    require(auth['token']!='CTO-P3-F01-20261028T064706Z-ddfe257b6856','completed Jungle token forbidden')
    # Fresh system-wide host snapshot is required in the execution handoff before heavy phases.
    # No install, global environment or policy/config discovery is performed by this launcher.
    execution=RUNTIME/'execution-v2';execution.mkdir(parents=True,exist_ok=True)
    record=execution/(args.phase+'.json');require(not record.exists(),'phase record exists; inspect actual state, do not replay')
    ssh=['ssh','-o','BatchMode=yes','-o','StrictHostKeyChecking=yes','-o','ConnectTimeout=15','-o','ConnectionAttempts=1',s['transport']]
    if args.phase=='upload':
        path=Path(s['archiveLocalPath'])
        require(path.stat().st_size==s['archive']['bytes'] and sha(path.read_bytes())==s['archive']['sha256'],'local archive drift')
        needed=['backup','snippet','oldSnippetSha256','oldRoot','newRoot','tempSnippet','archiveRemotePath','archive']
        small={key:s[key] for key in needed}
        code='SCOPE='+repr(small)+'\nAUTH='+repr(auth)+'\n'+UPLOAD
        with path.open('rb') as data:
            result=subprocess.run(ssh+['sudo -n -- python3 -B -c '+shlex.quote(code)],stdin=data,stdout=subprocess.PIPE,stderr=subprocess.PIPE)
    else:
        code=remote+b'\n'+('import json\nS=json.loads('+repr(scope_bytes.decode())+')\nA='+repr(auth)+'\n'
             'try:\n print(json.dumps(run(S,A,'+repr(args.phase)+','+repr(sha(remote))+'),ensure_ascii=False))\n'
             'except Exception as e:\n print(json.dumps({"status":"STOP","phase":'+repr(args.phase)+',"reason":str(e)})); raise SystemExit(1)\n').encode()
        result=subprocess.run(ssh+['sudo -n -- python3 -B -'],input=code,stdout=subprocess.PIPE,stderr=subprocess.PIPE)
    if result.stdout:
        value=json.loads(result.stdout);record.write_bytes((json.dumps(value,ensure_ascii=False,indent=2)+'\n').encode())
        print(json.dumps(value,ensure_ascii=False,indent=2),flush=True)
    if result.returncode:
        if result.stderr:(execution/(args.phase+'.stderr.txt')).write_bytes(result.stderr)
        print('STOP exact phase '+args.phase+'; SSH exit '+str(result.returncode),flush=True)
        # Never read sensitive config/policy/credential files to diagnose a denial.
        raise SystemExit(result.returncode)

if __name__=='__main__':main()
