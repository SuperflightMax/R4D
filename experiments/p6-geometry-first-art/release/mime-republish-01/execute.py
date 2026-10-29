"""Targeted retained-root MIME operation; fresh live lease gates every write phase."""
import argparse
import datetime
import hashlib
import json
import subprocess
import sys
from pathlib import Path
from lease_guard import THREAD, live_lease, check_lease_fields

RUNTIME = Path(r'E:\R4D\perspective\p6-runtime\release-engineer\mime-republish-01')
WRITE_PHASES = {'apply', 'rollback'}


def sha(data):
    return hashlib.sha256(data).hexdigest()


def require(ok, reason):
    if not ok:
        raise RuntimeError('STOP ' + reason)


def main():
    parser = argparse.ArgumentParser(description=__doc__)
    parser.add_argument('--phase', required=True, choices=['preflight', 'apply', 'postcheck', 'rollback'])
    parser.add_argument('--intent-file', required=True)
    parser.add_argument('--authorization-file')
    args = parser.parse_args()
    path = Path(args.intent_file).resolve()
    require(path.is_relative_to(RUNTIME.resolve()), 'intent outside own runtime')
    raw = path.read_bytes(); scope = json.loads(raw)
    require(scope['status'] == 'FROZEN_FIX_INTENT', 'intent not frozen')
    writer = (path.parent / 'MIME_REMOTE_WRITER.py').read_bytes()
    require(sha(writer) == scope['writerHashes']['composedWriterSha256'], 'writer bytes drift')
    require(sha(Path(__file__).read_bytes()) == scope['writerHashes']['launcherSha256'], 'launcher bytes drift')
    require(sha(Path(__file__).with_name('lease_guard.py').read_bytes())==scope['writerHashes']['leaseGuardSha256'],'live lease guard bytes drift')
    after = Path(scope['afterSnippet']['localPath']).read_bytes()
    require(sha(after) == scope['afterSnippet']['sha256'], 'after snippet bytes drift')
    v1_path = Path(scope['original']['intentPath'])
    v1_bytes = v1_path.read_bytes(); require(sha(v1_bytes) == scope['original']['intentSha256'], 'original immutable intent drift')
    original = json.loads(v1_bytes)
    require(original['overlayArchive']['sha256']==scope['original']['archiveSha256'],'original archive binding')
    expectations = original['futureBoundedValidation']['payloadExpectations']
    auth = {}
    if args.phase in WRITE_PHASES:
        require(bool(args.authorization_file), 'new CTO authority required')
        auth_path = Path(args.authorization_file).resolve()
        require(auth_path.is_relative_to(RUNTIME.resolve()), 'authority outside own runtime')
        auth = json.loads(auth_path.read_bytes())
        require(auth.get('serverWrite') is True and auth.get('tokenGranted') is True and bool(auth.get('token')), 'new CTO write grant required')
        require(auth.get('releaseId') == scope['releaseId'] == 'p6-mime-republish-01', 'release binding')
        require(auth.get('intentSha256') == sha(raw), 'intent authority binding')
        require(auth.get('writerSha256') == sha(writer) and auth.get('launcherSha256') == sha(Path(__file__).read_bytes()), 'code authority binding')
        require(args.phase in auth.get('authorizedPhases', []), 'phase not authorized')
        if args.phase == 'apply':
            require(bool(auth.get('firstWriteMustStartByUtc')),'first-write deadline required')
            deadline = datetime.datetime.fromisoformat(auth['firstWriteMustStartByUtc'].replace('Z', '+00:00'))
            require(datetime.datetime.now(datetime.timezone.utc) < deadline, 'first-write deadline missed; new CTO token required')
    execution = path.parent / 'execution'; execution.mkdir(exist_ok=True)
    record = execution / (args.phase + '.json')
    require(not record.exists(), 'existing phase record; reconcile read-only, do not replay')
    code = writer + ('\nFIX_BYTES=' + repr(raw) + '\nS=json.loads(FIX_BYTES)\nA=' + repr(auth) +
                     '\nAFTER_SNIPPET=' + repr(after) + '\nEXPECTED_PAYLOADS=' + repr(expectations) +
                     '\nWRITER_SHA256=' + repr(sha(writer)) + '\ntry:\n print(json.dumps(run_fix(' + repr(args.phase) + '),ensure_ascii=False))\n'
                     'except Exception as e:\n print(json.dumps({"status":"STOP","phase":' + repr(args.phase) + ',"reason":str(e),"evidence":getattr(e,"evidence",{})},ensure_ascii=False));raise SystemExit(1)\n').encode()
    ssh = ['ssh','-o','BatchMode=yes','-o','StrictHostKeyChecking=yes','-o','ConnectTimeout=15','-o','ConnectionAttempts=1','vps1-direct','sudo -n -- python3 -B -']
    lease = live_lease(auth) if args.phase in WRITE_PHASES else {'writePhase': False, 'activeWriteTokenNotRequiredForReadOnly': True}
    result = subprocess.run(ssh, input=code, stdout=subprocess.PIPE, stderr=subprocess.PIPE)
    if result.stdout:
        value = json.loads(result.stdout); value['clientLeaseCheck'] = lease
        record.write_bytes((json.dumps(value,ensure_ascii=False,indent=2)+'\n').encode())
        print(json.dumps(value,ensure_ascii=False,indent=2))
    if result.returncode:
        if result.stderr:(execution / (args.phase + '.stderr.txt')).write_bytes(result.stderr)
        print('STOP exact phase; no write/reload retry or alternate transport'); raise SystemExit(result.returncode)


if __name__ == '__main__':
    main()
