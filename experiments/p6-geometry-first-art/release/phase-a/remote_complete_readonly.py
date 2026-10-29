"""Append to authorized read-only helpers; no server writes, subprocess mutations or config discovery."""
import base64
import re
import subprocess


def opaque_snapshot(path):
    info = path.lstat()
    if not stat.S_ISREG(info.st_mode):
        raise RuntimeError('STOP opaque target not regular')
    digest = hashlib.sha256()
    count = 0
    with path.open('rb') as stream:
        for chunk in iter(lambda: stream.read(65536), b''):
            digest.update(chunk)
            count += len(chunk)
    after = path.lstat()
    if (info.st_ino, info.st_size, info.st_mtime_ns) != (after.st_ino, after.st_size, after.st_mtime_ns):
        raise RuntimeError('STOP opaque target changed while reading')
    return {'path': str(path), 'inode': info.st_ino, 'uid': info.st_uid, 'gid': info.st_gid,
            'mode': stat.S_IMODE(info.st_mode), 'bytes': count, 'sha256': digest.hexdigest(),
            'prefixBytes': count, 'prefixSha256': digest.hexdigest()}


def run_complete():
    if os.geteuid() != 0:
        raise RuntimeError('STOP actual euid0 required')
    result = {'startedUtc': now(), 'actualEuid': os.geteuid(), 'host': socket.gethostname(),
              'serverWrite': False, 'tokenGranted': False}
    snippet = Path('/etc/nginx/snippets/review.locations.conf')
    before = opaque_snapshot(snippet)
    snippet_bytes = snippet.read_bytes()
    roots = re.findall(rb'^\s*root\s+([^;\s]+)\s*;', snippet_bytes, re.M)
    if not roots or len(set(roots)) != 1:
        raise RuntimeError('STOP root routing not singular')
    root = Path(roots[0].decode())
    if str(root) != '/srv/superflight-review/releases/p3-water-dark-front-edge-04':
        raise RuntimeError('STOP active root differs from authorized published baseline')
    result['activeRouting'] = {'snippet': before, 'root': str(root), 'rootDirectiveCount': len(roots),
                               'normalizedSnippetSha256': sha(snippet_bytes.replace(roots[0], b'__REVIEW_ROOT__'))}
    result['rootTree'] = tree_digest(root, True)
    if result['rootTree']['metadataDigest'] != '71419d91cc132a8d63d1be21718e0f20c72a796ff65decbaf6b4c7de796c9f65':
        raise RuntimeError('STOP active tree differs from authorized baseline')
    targets = [root / 'review/r4d/p6-geometry-first-art',
               Path('/srv/superflight-review/releases/p6-local-partial-01'),
               Path('/opt/superflight-studio/backups/review-p6-local-partial-01'),
               Path('/etc/nginx/snippets/review.locations.conf.p6-local-partial-01.tmp')]
    result['intentTargets'] = [{'path': str(path), 'occupied': os.path.lexists(path)} for path in targets]
    result['p6ReleaseNames'] = sorted(path.name for path in root.parent.iterdir() if 'p6' in path.name.lower())
    if any(row['occupied'] for row in result['intentTargets']) or result['p6ReleaseNames']:
        raise RuntimeError('STOP existing P6 publication or conflicting intent target')
    writers, untagged_python_stdin = [], []
    for proc in Path('/proc').iterdir():
        if not proc.name.isdigit() or int(proc.name) == os.getpid():
            continue
        try:
            command = (proc / 'cmdline').read_bytes()[:65536]
            executable = (proc / 'comm').read_text().strip()
        except (FileNotFoundError, PermissionError, ProcessLookupError):
            continue
        if any(marker in command for marker in [b'p6-geometry-first-art', b'review-p6-local-partial-01', b'releases/p6-local-partial-01']):
            writers.append({'pid': int(proc.name), 'executable': executable})
        elif executable.startswith('python') and b'\x00-\x00' in command:
            untagged_python_stdin.append({'pid': int(proc.name), 'executable': executable})
    result['writerGuard'] = {'matchingP6Processes': writers, 'otherPythonStdinProcesses': untagged_python_stdin,
                             'scope': 'Bounded process metadata and exact P6 intent target absence; no credentials/config discovery.',
                             'centralLockPointer': None, 'serializedOwner': 'P6 per CTO instruction; execution token not granted.'}
    if writers or untagged_python_stdin:
        raise RuntimeError('STOP possible competing writer requires CTO classification')
    result['serviceDocuments'] = [opaque_snapshot(Path(path)) for path in
                                  ['/home/sf/assistant-context/vps/services/superflight-studio.md',
                                   '/home/sf/assistant-context/vps/CHANGELOG.md']]
    catalog_path = root / 'review/index.html'
    catalog = catalog_path.read_bytes()
    result['catalog'] = opaque_snapshot(catalog_path)
    result['http'] = [http_probe('/review/'), http_probe('/review/', True),
                      http_probe('/review/.p6-phase-a-probe'), http_probe('/review/r4d/p6-geometry-first-art/')]
    normal = result['http'][0]
    if normal['status'] != 200 or normal['bodySha256'] != sha(catalog) or normal['bodyBytes'] != len(catalog):
        raise RuntimeError('STOP catalog HTTP/active disk binding differs')
    if result['http'][-1]['status'] != 404:
        raise RuntimeError('STOP target route no longer absent')
    result['nginxActive'] = subprocess.run(['systemctl', 'is-active', '--quiet', 'nginx']).returncode == 0
    if not result['nginxActive']:
        raise RuntimeError('STOP nginx not active')
    if opaque_snapshot(snippet) != before:
        raise RuntimeError('STOP snippet drift during read-only baseline')
    result['activeRootBindingVerified'] = True
    result['snippetBytesBase64'] = base64.b64encode(snippet_bytes).decode()
    result['catalogBytesBase64'] = base64.b64encode(catalog).decode()
    result['pendingGuards'] = []
    result['excludedConfiguration'] = {'mainVhost': {'read': False, 'hashChecked': False, 'writeAllowed': False},
                                       'globalMime': {'read': False, 'hashChecked': False, 'writeAllowed': False},
                                       'basis': 'CTO explicitly excluded unknown pointers from blocking gate and write set; no discovery.'}
    return {**result, 'status': 'PHASE_A_ACTIVE_ROOT_BASELINE', 'completedUtc': now()}


try:
    print(json.dumps(run_complete(), ensure_ascii=False))
except Exception as error:
    print(json.dumps({'status': 'STOP', 'serverWrite': False, 'tokenGranted': False, 'reason': str(error)}))
    raise SystemExit(1)
