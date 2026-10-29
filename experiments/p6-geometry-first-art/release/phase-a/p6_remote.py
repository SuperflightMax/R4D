"""Future token-bound P6 phases, adapted to existing combined wrapper mechanics.

Needs generic read-only helpers, SCOPE_BYTES, SCOPE, AUTH and WRITER_SHA256.
Never executed by Phase A. No service-document append or global config writes.
"""
import shutil
import tarfile


def require(ok, reason):
    if not ok:
        raise RuntimeError('STOP ' + reason)


def save_private(path, value):
    path.write_bytes((json.dumps(value, ensure_ascii=False, indent=2) + '\n').encode())
    os.chmod(path, 0o600)


def bindings():
    require(os.geteuid() == 0, 'actual euid0 required before any write')
    require(AUTH.get('serverWrite') is True and AUTH.get('tokenGranted') is True and bool(AUTH.get('token')), 'new explicit CTO token required')
    require(not AUTH['token'].startswith('CTO-P3-'), 'closed P3 token is not P6 authority')
    require(AUTH.get('intentSha256') == sha(SCOPE_BYTES), 'intent binding')
    require(AUTH.get('writerSha256') == WRITER_SHA256, 'writer binding')
    require(AUTH.get('archiveSha256') == SCOPE['overlayArchive']['sha256'], 'archive binding')
    require(AUTH.get('releaseId') == SCOPE['releaseId'] == 'p6-local-partial-01', 'release binding')
    require(SCOPE['status'] == 'FROZEN_INTENT' and SCOPE['tokenRequestReady'] is True, 'intent not ready')
    require(not SCOPE['pending'], 'unresolved intent inputs')
    require(SCOPE['newRoot'] == '/srv/superflight-review/releases/p6-local-partial-01', 'new root boundary')
    require(SCOPE['oldRoot'] == '/srv/superflight-review/releases/p3-water-dark-front-edge-04', 'old root boundary')
    boundary = SCOPE['writeBoundaryAfterSeparateTokenOnly']
    require(boundary['backup'] == '/opt/superflight-studio/backups/review-p6-local-partial-01', 'backup boundary')
    require(boundary['liveSnippet'] == '/etc/nginx/snippets/review.locations.conf', 'snippet boundary')
    require(boundary['tempSnippet'] == boundary['liveSnippet'] + '.p6-local-partial-01.tmp', 'temp boundary')
    require(not boundary['serviceDocumentWrites'] and not boundary['mainVhostWrites'] and not boundary['globalMimeWrites'], 'forbidden configuration/document write')
    return boundary


def state_at(backup):
    state = json.loads((backup / 'STATE.json').read_bytes())
    require(state['intentSha256'] == sha(SCOPE_BYTES) and state['tokenSha256'] == sha(AUTH['token'].encode()), 'state ownership')
    return state


def docs_guard():
    before = SCOPE['baseline']['serviceDocuments']
    actual = [opaque_snapshot(Path(item['path'])) for item in before]
    require(actual == before, 'opaque service documents changed')
    return actual


def check_old():
    before = SCOPE['oldTree']
    actual = tree_digest(Path(SCOPE['oldRoot']))
    require(actual == before, 'original root changed')
    return actual


def protection(after=False):
    observations = [http_probe('/review/'), http_probe('/review/', True), http_probe('/review/.p6-phase-a-probe')]
    expected = SCOPE['baseline']['http'][:3]
    for observed, old in zip(observations, expected):
        require((observed['path'], observed['foreignOrigin'], observed['status'], observed['headers']) ==
                (old['path'], old['foreignOrigin'], old['status'], old['headers']), 'protection context/status/seven headers changed')
    expected_sha = SCOPE['catalogDelta']['afterSha256' if after else 'beforeSha256']
    expected_bytes = SCOPE['catalogDelta']['afterBytes' if after else 'beforeBytes']
    require(observations[0]['bodySha256'] == expected_sha and observations[0]['bodyBytes'] == expected_bytes, 'catalog HTTP identity')
    return observations


def preflight():
    boundary = bindings()
    snippet = Path(boundary['liveSnippet'])
    require(sha(snippet.read_bytes()) == SCOPE['snippetDelta']['beforeSha256'], 'live snippet drift')
    check_old(); docs_guard()
    for name in [SCOPE['newRoot'], boundary['backup'], boundary['tempSnippet'], SCOPE['oldRoot'] + '/review/r4d/p6-geometry-first-art']:
        require(not os.path.lexists(name), 'occupied intent target')
    require(not [p for p in Path(SCOPE['oldRoot']).parent.iterdir() if 'p6' in p.name.lower()], 'competing P6 release')
    # Same bounded metadata-only writer check as the Phase A baseline.
    conflicts = []
    for proc in Path('/proc').iterdir():
        if not proc.name.isdigit() or int(proc.name) == os.getpid():
            continue
        try:
            command = (proc / 'cmdline').read_bytes()[:65536]
            executable = (proc / 'comm').read_text().strip()
        except (FileNotFoundError, PermissionError, ProcessLookupError):
            continue
        if any(value in command for value in [b'p6-geometry-first-art', b'review-p6-local-partial-01', b'releases/p6-local-partial-01']) or (executable.startswith('python') and b'\x00-\x00' in command):
            conflicts.append(int(proc.name))
    require(not conflicts, 'possible competing writer pids=' + repr(conflicts))
    return {'status': 'PREFLIGHT_READ_ONLY', 'utc': now(), 'actualEuid': os.geteuid(), 'http': protection()}


def run_phase(phase):
    boundary = bindings()
    require(phase in AUTH.get('authorizedPhases', []), 'phase not authorized')
    backup = Path(boundary['backup']); live = Path(boundary['liveSnippet']); temp = Path(boundary['tempSnippet'])
    if phase == 'preflight':
        return preflight()
    if phase == 'begin':
        evidence = preflight()
        backup.mkdir(mode=0o700)
        (backup / 'snippet-before.bin').write_bytes(live.read_bytes())
        os.chmod(backup / 'snippet-before.bin', 0o600)
        save_private(backup / 'BEFORE.json', {'root': SCOPE['oldTree'], 'documents': SCOPE['baseline']['serviceDocuments'], 'preflight': evidence})
        save_private(backup / 'STATE.json', {'status': 'BACKUP_CREATED', 'intentSha256': sha(SCOPE_BYTES),
                     'tokenSha256': sha(AUTH['token'].encode()), 'startedUtc': now(), 'completedPhases': ['begin']})
        return {'status': 'BACKUP_CREATED', 'utc': now()}
    state = state_at(backup)
    require(phase not in state['completedPhases'], 'phase already completed; inspect state, do not replay')
    if phase == 'stage':
        require(state['status'] == 'UPLOADED', 'stage state')
        archive = Path(boundary['archiveRemotePath'])
        require(archive.stat().st_size == SCOPE['overlayArchive']['bytes'] and sha(archive.read_bytes()) == SCOPE['overlayArchive']['sha256'], 'uploaded archive identity')
        check_old(); docs_guard()
        root = Path(SCOPE['newRoot']); require(not os.path.lexists(root), 'new root occupied')
        expected = SCOPE['overlayFiles']
        with tarfile.open(archive, 'r:gz') as packet:
            members = packet.getmembers()
            require([m.name for m in members] == [item['path'] for item in expected], 'archive whitelist')
            for member, item in zip(members, expected):
                require(member.isfile() and not member.issym() and not member.islnk(), 'archive member type')
                parts = member.name.split('/')
                require(not member.name.startswith('/') and all(p not in ('', '.', '..') for p in parts) and '\\' not in member.name and ':' not in member.name, 'archive member path')
                require(member.size == item['bytes'] and sha(packet.extractfile(member).read()) == item['sha256'], 'archive member bytes')
            shutil.copytree(SCOPE['oldRoot'], root, copy_function=shutil.copy2)
            old_metadata = SCOPE['baselineTreeRows']
            for item in old_metadata['directories'] + old_metadata['files']:
                target = root / item['path']; os.chown(target, item['uid'], item['gid']); os.chmod(target, item['mode'])
            for member, item in zip(members, expected):
                target = root / member.name
                require(target.resolve().is_relative_to(root.resolve()), 'resolved target outside new root')
                if member.name != 'review/index.html':
                    require(not os.path.lexists(target), 'unexpected replacement in clone')
                target.parent.mkdir(parents=True, exist_ok=True)
                target.write_bytes(packet.extractfile(member).read()); os.chown(target, 0, 0); os.chmod(target, 0o644)
                for parent in target.parents:
                    if parent == root or str(parent.relative_to(root)) in {r['path'] for r in old_metadata['directories']}:
                        break
                    os.chown(parent, 0, 0); os.chmod(parent, 0o755)
        actual = tree_digest(root)
        require(actual == {k:v for k,v in SCOPE['expectedNewTree'].items() if k != 'rowsFile'}, 'staged full tree identity')
        state['status'] = 'STAGED'
    elif phase == 'switch':
        require(state['status'] == 'STAGED', 'switch state')
        require(sha(live.read_bytes()) == SCOPE['snippetDelta']['beforeSha256'], 'live snippet drift')
        check_old(); docs_guard(); protection()
        require(not os.path.lexists(temp), 'temp snippet occupied')
        data = live.read_bytes().replace(SCOPE['oldRoot'].encode(), SCOPE['newRoot'].encode())
        require(sha(data) == SCOPE['snippetDelta']['afterSha256'], 'root-only snippet bytes')
        with temp.open('xb') as stream:
            stream.write(data); stream.flush(); os.fsync(stream.fileno())
        os.chown(temp, 0, 0); os.chmod(temp, 0o644); os.replace(temp, live)
        state['status'] = 'SNIPPET_REPLACED'; save_private(backup / 'STATE.json', state)
        for command in [['nginx', '-t'], ['systemctl', 'reload', 'nginx']]:
            result = subprocess.run(command, stdout=subprocess.PIPE, stderr=subprocess.PIPE)
            require(result.returncode == 0, 'service operation failed; inspect state, no blind retry: ' + command[0])
        state['status'] = 'SWITCHED'
    elif phase == 'postcheck':
        require(state['status'] == 'SWITCHED', 'postcheck state')
        require(sha(live.read_bytes()) == SCOPE['snippetDelta']['afterSha256'], 'published snippet identity')
        check_old(); docs_guard()
        require(tree_digest(Path(SCOPE['newRoot'])) == {k:v for k,v in SCOPE['expectedNewTree'].items() if k != 'rowsFile'}, 'published tree identity')
        observations = protection(True)
        checks = []
        for expected in SCOPE['futureBoundedValidation']['payloadExpectations']:
            observed = http_probe(expected['urlPath'])
            mime = (observed['headers'].get('Content-Type') or '').split(';', 1)[0].strip().lower()
            matched = observed['status'] == 200 and observed['bodyBytes'] == expected['bytes'] and observed['bodySha256'] == expected['sha256']
            checks.append({'path': expected['urlPath'], 'status': observed['status'], 'payloadIdentityVerified': matched,
                           'mime': mime, 'mimeVerified': mime in expected['acceptedMimeTypes'],
                           'securityHeadersVerified': all(observed['headers'][key] == SCOPE['baseline']['http'][0]['headers'][key] for key in HEADER_NAMES if key != 'Content-Type')})
        save_private(backup / 'POSTCHECK.json', {'utc': now(), 'httpBaseline': observations, 'payloadChecks': checks, 'uiSmokeVerified': False})
        require(all(item['payloadIdentityVerified'] and item['mimeVerified'] and item['securityHeadersVerified'] for item in checks), 'resource body/MIME/headers unverified; no auth bypass')
        state['status'] = 'HTTP_CHECKED_UI_PENDING'
    elif phase == 'document':
        require(state['status'] == 'HTTP_CHECKED_UI_PENDING', 'finalization state')
        require(AUTH.get('uiReceipt', {}).get('status') == 'VERIFIED_DELIVERY_SMOKE' and AUTH['uiReceipt'].get('archiveSha256') == SCOPE['overlayArchive']['sha256'], 'separate actual UI delivery smoke receipt required')
        docs_guard(); check_old()
        state['status'] = 'PUBLISHED_LOCAL_PARTIAL'
        save_private(backup / 'PUBLISHED.json', {'utc': now(), 'intentSha256': sha(SCOPE_BYTES), 'archiveSha256': SCOPE['overlayArchive']['sha256'],
                     'url': 'https://superflight.space/review/r4d/p6-geometry-first-art/', 'result': 'LOCAL_PARTIAL / NO_ART_MOTION_PASS',
                     'uiReceipt': AUTH['uiReceipt'], 'serviceDocumentAppend': False})
    elif phase == 'rollback':
        require(AUTH.get('rollbackAuthorized') is True, 'rollback needs explicit token authority')
        check_old(); docs_guard()
        before = (backup / 'snippet-before.bin').read_bytes()
        require(sha(before) == SCOPE['snippetDelta']['beforeSha256'], 'rollback snapshot identity')
        require(sha(live.read_bytes()) in (SCOPE['snippetDelta']['beforeSha256'], SCOPE['snippetDelta']['afterSha256']), 'unexpected live snippet; stop')
        require(not os.path.lexists(temp), 'rollback temp occupied')
        temp.write_bytes(before); os.chown(temp, 0, 0); os.chmod(temp, 0o644); os.replace(temp, live)
        state['status'] = 'ROLLBACK_SNIPPET_REPLACED'; save_private(backup / 'STATE.json', state)
        require(subprocess.run(['nginx', '-t'], stdout=subprocess.PIPE, stderr=subprocess.PIPE).returncode == 0, 'rollback nginx test failed')
        require(subprocess.run(['systemctl', 'reload', 'nginx'], stdout=subprocess.PIPE, stderr=subprocess.PIPE).returncode == 0, 'rollback reload failed')
        protection(); state['status'] = 'ROLLED_BACK'
    else:
        raise RuntimeError('STOP unknown phase')
    state['completedPhases'].append(phase); state['lastPhaseUtc'] = now()
    save_private(backup / 'STATE.json', state)
    return {'status': state['status'], 'phase': phase, 'utc': state['lastPhaseUtc'], 'tokenGranted': True}
