"""New targeted MIME/root operation. No upload, clone, app edit or document append."""
import signal
import time


class Stop(RuntimeError):
    def __init__(self, reason, evidence=None):
        super().__init__('STOP ' + reason); self.evidence = evidence or {}


def need(ok, reason, evidence=None):
    if not ok:
        raise Stop(reason, evidence)


def save_record(path, value):
    path.write_bytes((json.dumps(value,ensure_ascii=False,indent=2)+'\n').encode()); os.chmod(path,0o600)


def roots_and_dependencies():
    old = tree_digest(Path(S['roots']['before']['path']))
    retained = tree_digest(Path(S['roots']['retained']['path']))
    need(old == S['roots']['before']['identity'] and retained == S['roots']['retained']['identity'], 'root bytes/metadata drift')
    docs = [opaque_snapshot(Path(row['path'])) for row in S['documents']]
    need(docs == S['documents'], 'opaque documents drift')
    need(opaque_snapshot(Path('/etc/nginx/mime.types')) == S['standardMime'], 'standard MIME dependency drift')
    return {'oldTree': old, 'retainedTree': retained, 'documents': docs}


def before_guard():
    evidence = roots_and_dependencies()
    need(opaque_snapshot(Path(S['snippetPath'])) == S['beforeSnippet'], 'actual P3 snippet drift')
    need(not os.path.lexists(S['backup']) and not os.path.lexists(S['tempSnippet']), 'occupied new fix target')
    return evidence


def write_binding(phase):
    need(os.geteuid() == 0, 'actual euid0 before write')
    need(A.get('serverWrite') is True and A.get('tokenGranted') is True and bool(A.get('token')), 'new CTO authority required')
    need(A.get('releaseId') == S['releaseId'] == 'p6-mime-republish-01', 'release binding')
    need(A.get('intentSha256') == sha(FIX_BYTES) and A.get('writerSha256') == WRITER_SHA256, 'intent/writer binding')
    need(phase in A.get('authorizedPhases', []), 'phase not granted')
    need(sha(AFTER_SNIPPET) == S['afterSnippet']['sha256'], 'new snippet binding')


def first_write_deadline(auth, utc_now=None):
    value = auth.get('firstWriteMustStartByUtc')
    need(isinstance(value,str) and bool(value),'first-write deadline required')
    deadline = datetime.datetime.fromisoformat(value.replace('Z','+00:00'))
    need(deadline.tzinfo is not None,'first-write deadline must include timezone')
    current = utc_now or datetime.datetime.now(datetime.timezone.utc)
    need(current < deadline,'first-write deadline missed on VPS; no backup/config write started')
    return current.isoformat()


def probe(path, foreign=False, timeout=5, limit=16777216):
    """One GET, no redirects/credentials, all headers and bounded identity evidence."""
    result = {'path': path, 'foreignOrigin': foreign, 'startedUtc': now(), 'status': None,
              'headers': [], 'securityHeaders': {}, 'bodyBytes': 0, 'bodyComplete': False}
    digest = hashlib.sha256(); connection = None; started = time.monotonic()
    previous = signal.getsignal(signal.SIGALRM)
    def alarm(signum, frame):
        raise TimeoutError('hard probe timeout')
    signal.signal(signal.SIGALRM, alarm); signal.setitimer(signal.ITIMER_REAL, timeout)
    try:
        connection = http.client.HTTPSConnection('superflight.space', timeout=timeout)
        request_headers = {'User-Agent': 'R4D-P6-Phase-A-readonly/1'}
        if foreign:request_headers['Origin'] = 'https://example.invalid'
        connection.request('GET', path, headers=request_headers); response = connection.getresponse()
        result.update(status=response.status, headers=response.getheaders(),
                      securityHeaders={key:response.getheader(key) for key in HEADER_NAMES})
        while True:
            chunk = response.read(min(65536,limit+1-result['bodyBytes']))
            if not chunk:result['bodyComplete'] = True; break
            digest.update(chunk); result['bodyBytes'] += len(chunk)
            if result['bodyBytes'] > limit:raise ValueError('body exceeds declared bound')
    except Exception as error:
        result['error'] = type(error).__name__ + ': ' + str(error)
    finally:
        signal.setitimer(signal.ITIMER_REAL,0); signal.signal(signal.SIGALRM,previous)
        if connection is not None:connection.close()
    result.update(bodySha256=digest.hexdigest(), completedUtc=now(), elapsedSeconds=time.monotonic()-started)
    return result


def readiness():
    budget = S['validation']['readiness']; observations = []; start = time.monotonic()
    for index in range(budget['maxObservations']):
        if index:time.sleep(min(budget['waitBetweenSeconds'],max(0,budget['totalHardBudgetSeconds']-(time.monotonic()-start))))
        remaining = budget['totalHardBudgetSeconds']-(time.monotonic()-start)
        need(remaining>0, 'readiness budget exhausted', {'readinessObservations':observations})
        row = probe('/review/', timeout=min(budget['probeHardTimeoutSeconds'],remaining), limit=65536)
        observations.append(row)
        need(time.monotonic()-start<=budget['totalHardBudgetSeconds'],'readiness total budget exhausted',{'readinessObservations':observations})
        normal = S['httpBaseline'][0]
        context = row['bodyComplete'] and row['status'] == normal['status'] and row['securityHeaders'] == normal['headers']
        if context and row['bodySha256']==S['catalogAfter']['sha256'] and row['bodyBytes']==S['catalogAfter']['bytes']:
            return {'status':'EXPECTED_CATALOG_READY','observations':observations,'elapsedSeconds':time.monotonic()-start}
        old_identity = row['bodySha256']==normal['bodySha256'] and row['bodyBytes']==normal['bodyBytes']
        need(context and old_identity, 'readiness unexpected response; no access bypass', {'readinessObservations':observations})
    raise Stop('expected catalog not established within readiness budget', {'readinessObservations':observations,'elapsedSeconds':time.monotonic()-start})


def run_fix(phase):
    need(os.geteuid()==0, 'actual euid0')
    if phase == 'preflight':
        return {'status':'READ_ONLY_PREFLIGHT','utc':now(),'serverWrite':False,**before_guard()}
    if phase in ('apply','rollback'):
        write_binding(phase)
        backup = Path(S['backup']); live = Path(S['snippetPath']); temp = Path(S['tempSnippet'])
        if phase == 'apply':
            before_guard(); before = live.read_bytes()
            checked_utc = first_write_deadline(A)
            backup.mkdir(mode=0o700)
            (backup/'snippet-before.bin').write_bytes(before); os.chmod(backup/'snippet-before.bin',0o600)
            state = {'status':'FIX_BACKUP_CREATED','intentSha256':sha(FIX_BYTES),'tokenSha256':sha(A['token'].encode()),
                     'firstWriteUtc':now(),'deadlineCheckedImmediatelyBeforeMkdirUtc':checked_utc,
                     'originalIntentSha256':S['original']['intentSha256'],'originalArchiveSha256':S['original']['archiveSha256']}
            data = AFTER_SNIPPET
        else:
            need(A.get('rollbackAuthorized') is True, 'new active recovery authority required')
            roots_and_dependencies(); state = json.loads((backup/'STATE.json').read_bytes())
            need(state['intentSha256']==sha(FIX_BYTES) and state['tokenSha256']==sha(A['token'].encode()),'fix state ownership')
            need(state['status'] in ('FIX_WRITE_STARTED','FIX_SNIPPET_REPLACED','FIX_RELOADED_NEEDS_HTTP') and state.get('phase')!='rollback', 'recovery state; no repeated write')
            need(sha(live.read_bytes())==S['afterSnippet']['sha256'], 'recovery live snippet drift')
            data = (backup/'snippet-before.bin').read_bytes()
            need(sha(data)==S['beforeSnippet']['sha256'], 'exact inverse snapshot')
        need(not os.path.lexists(temp),'temporary snippet occupied')
        state.update(status='FIX_WRITE_STARTED',phase=phase,writeStartUtc=now());save_record(backup/'STATE.json',state)
        with temp.open('xb') as stream:stream.write(data);stream.flush();os.fsync(stream.fileno())
        os.chown(temp,0,0);os.chmod(temp,0o644);os.replace(temp,live)
        state.update(status='FIX_SNIPPET_REPLACED',snippetReplacedUtc=now(),liveSnippetSha256=sha(data));save_record(backup/'STATE.json',state)
        for command in [['nginx','-t'],['systemctl','reload','nginx']]:
            result = subprocess.run(command,stdout=subprocess.PIPE,stderr=subprocess.PIPE)
            need(result.returncode==0,'service operation failed; RO reconciliation required',{'operation':command[0],'exitCode':result.returncode,'stderrSha256':sha(result.stderr),'state':state})
        state.update(status='FIX_RELOADED_NEEDS_HTTP' if phase=='apply' else 'FIX_INVERSE_RELOADED_NEEDS_RO',reloadCompletedUtc=now())
        save_record(backup/'STATE.json',state)
        return {'status':state['status'],'phase':phase,'utc':now(),'safeBoundary':True,'pendingWrite':False,'state':{k:v for k,v in state.items() if k!='tokenSha256'}}
    need(phase=='postcheck','unknown phase')
    integrity = roots_and_dependencies(); need(sha(Path(S['snippetPath']).read_bytes())==S['afterSnippet']['sha256'],'post-fix snippet identity')
    ready = readiness()  # At most three observations, before the once-only suite.
    canonical = [probe('/review/'),probe('/review/',True),probe('/review/.p6-phase-a-probe')]
    evidence = {'readiness':ready,'canonicalProtection':canonical,'payloads':[],'oldRepresentativeTypes':[]}
    for row,before in zip(canonical,S['httpBaseline'][:3]):
        need(row['bodyComplete'] and (row['path'],row['foreignOrigin'],row['status'],row['securityHeaders'])==
             (before['path'],before['foreignOrigin'],before['status'],before['headers']),'canonical protection changed',evidence)
    need(canonical[0]['bodyBytes']==S['catalogAfter']['bytes'] and canonical[0]['bodySha256']==S['catalogAfter']['sha256'],'canonical new catalog mismatch',evidence)
    for expected in EXPECTED_PAYLOADS + S['oldRepresentativeTypes']:
        row = probe(expected['urlPath'],timeout=5,limit=max(expected['bytes']+65536,65536))
        mime = (row['securityHeaders'].get('Content-Type') or '').split(';',1)[0].strip().lower()
        row.update(payloadIdentityVerified=row['bodyComplete'] and row['status']==200 and row['bodyBytes']==expected['bytes'] and row['bodySha256']==expected['sha256'],
                   mimeVerified=mime in expected['acceptedMimeTypes'],mime=mime,
                   securityHeadersVerified=all(row['securityHeaders'].get(key)==S['httpBaseline'][0]['headers'][key] for key in HEADER_NAMES if key!='Content-Type'))
        evidence['payloads' if expected in EXPECTED_PAYLOADS else 'oldRepresentativeTypes'].append(row)
    checks=evidence['payloads']+evidence['oldRepresentativeTypes']
    need(all(row['payloadIdentityVerified'] and row['mimeVerified'] and row['securityHeadersVerified'] for row in checks),'once-only body/MIME/header suite failed; no retry',evidence)
    return {'status':'HTTP_VERIFIED_UI_PENDING','utc':now(),'serverWrite':False,'safeBoundary':True,'pendingWrite':False,
            'fixIntentSha256':sha(FIX_BYTES),
            'originalIntentSha256':S['original']['intentSha256'],'originalArchiveSha256':S['original']['archiveSha256'],**integrity,**evidence}
