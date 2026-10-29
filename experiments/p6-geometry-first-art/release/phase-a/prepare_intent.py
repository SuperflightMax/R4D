"""Prepare exact local catalog/snippet deltas, deterministic overlay and intent.

No remote transport is present. Pending provenance/guards prevent token readiness.
"""
import ast
import base64
import copy
import gzip
import hashlib
import io
import json
import mimetypes
import re
import subprocess
import sys
import tarfile
from pathlib import Path, PurePosixPath

RUNTIME = Path(r'E:\R4D\perspective\p6-runtime\release-engineer\phase-a-local-partial-01')
CONTROL = Path(__file__).resolve().parent
OLD_ROOT = '/srv/superflight-review/releases/p3-water-dark-front-edge-04'
NEW_ROOT = '/srv/superflight-review/releases/p6-local-partial-01'
BACKUP = '/opt/superflight-studio/backups/review-p6-local-partial-01'
SNIPPET = '/etc/nginx/snippets/review.locations.conf'
TEMP_SNIPPET = SNIPPET + '.p6-local-partial-01.tmp'


def sha(data):
    return hashlib.sha256(data).hexdigest()


def canonical(value):
    return json.dumps(value, sort_keys=True, separators=(',', ':'), ensure_ascii=False).encode()


def write(path, data):
    if path.exists():
        raise RuntimeError('STOP occupied immutable intent output: ' + str(path))
    path.parent.mkdir(parents=True, exist_ok=True)
    path.write_bytes(data)


def record(path, relative=None):
    data = path.read_bytes()
    return {'path': relative or str(path), 'bytes': len(data), 'sha256': sha(data)}


def main():
    candidate_name = sys.argv[1] if len(sys.argv) > 1 else 'candidate-02'
    if not re.fullmatch(r'candidate-[0-9]{2}', candidate_name):
        raise RuntimeError('STOP unsafe candidate name')
    candidate = RUNTIME / candidate_name
    out = candidate / 'intent'
    if out.exists():
        raise RuntimeError('STOP existing intent; do not overwrite')
    manifest_path = candidate / 'PUBLICATION_MANIFEST.private.json'
    manifest = json.loads(manifest_path.read_bytes())
    baseline_name = sys.argv[2] if len(sys.argv) > 2 else 'baseline-final.json'
    if not re.fullmatch(r'baseline-[a-z0-9-]+\.json', baseline_name):
        raise RuntimeError('STOP unsafe baseline record name')
    baseline_path = RUNTIME / baseline_name
    baseline = json.loads(baseline_path.read_bytes())
    if baseline.get('actualEuid') != 0 or not baseline.get('activeRootBindingVerified'):
        raise RuntimeError('STOP active root baseline not established')
    if baseline['activeRouting']['root'] != OLD_ROOT:
        raise RuntimeError('STOP unexpected baseline root')
    payload = candidate / 'payload'
    for item in manifest['payloadFiles']:
        actual = record(payload / item['path'], item['path'])
        if actual != item:
            raise RuntimeError('STOP local payload drift')
    if any(not item['path'].startswith('review/r4d/p6-geometry-first-art/') for item in manifest['payloadFiles']):
        raise RuntimeError('STOP archive root prefix is not the authorized Review layout')
    before_catalog = (RUNTIME / 'inputs/catalog-before.html').read_bytes()
    fragment = (candidate / 'CATALOG_FRAGMENT.html').read_bytes()
    if sha(before_catalog) != baseline['catalog']['sha256'] or before_catalog.lower().count(b'</main>') != 1:
        raise RuntimeError('STOP catalog binding or insertion boundary differs')
    if b'p6-geometry-first-art' in before_catalog or b'r4d-p6-publication' in before_catalog:
        raise RuntimeError('STOP possible pre-existing P6 catalog card')
    offset = before_catalog.lower().index(b'</main>')
    catalog = before_catalog[:offset] + fragment + before_catalog[offset:]
    if catalog[:offset] + catalog[offset + len(fragment):] != before_catalog:
        raise RuntimeError('STOP catalog inverse does not restore original bytes')
    write(out / 'catalog-after.html', catalog)
    snippet = (RUNTIME / 'inputs/snippet-before.bin').read_bytes()
    if sha(snippet) != baseline['activeRouting']['snippet']['sha256'] or snippet.count(OLD_ROOT.encode()) != 1:
        raise RuntimeError('STOP snippet root-only delta binding differs')
    after_snippet = snippet.replace(OLD_ROOT.encode(), NEW_ROOT.encode())
    if after_snippet.replace(NEW_ROOT.encode(), b'__REVIEW_ROOT__') != snippet.replace(OLD_ROOT.encode(), b'__REVIEW_ROOT__'):
        raise RuntimeError('STOP snippet has non-root changes')
    write(out / 'snippet-after.bin', after_snippet)
    files = copy.deepcopy(manifest['payloadFiles'])
    files.append({'path': 'review/index.html', 'bytes': len(catalog), 'sha256': sha(catalog)})
    files.sort(key=lambda item: item['path'])
    helpers = (CONTROL / 'remote_baseline_readonly.py').read_bytes().split(b"\nif __name__ == '__main__':", 1)[0]
    snapshot_helpers = (CONTROL / 'remote_complete_readonly.py').read_bytes().split(b'\ntry:\n', 1)[0]
    writer = helpers + b'\n' + snapshot_helpers + b'\n' + (CONTROL / 'p6_remote.py').read_bytes()
    ast.parse(writer.decode())
    write(out / 'P6_REMOTE_WRITER.py', writer)
    archive_path = out / 'P6_PUBLICATION_OVERLAY.tar.gz'
    with archive_path.open('xb') as raw:
        with gzip.GzipFile(filename='', fileobj=raw, mode='wb', mtime=0, compresslevel=9) as compressed:
            with tarfile.open(fileobj=compressed, mode='w', format=tarfile.USTAR_FORMAT) as archive:
                for item in files:
                    data = catalog if item['path'] == 'review/index.html' else (payload / item['path']).read_bytes()
                    info = tarfile.TarInfo(item['path']); info.size = len(data); info.mode = 0o644
                    info.uid = info.gid = 0; info.uname = info.gname = ''; info.mtime = 0
                    archive.addfile(info, io.BytesIO(data))
    with tarfile.open(archive_path, 'r:gz') as archive:
        members = archive.getmembers()
        if [item.name for item in members] != [item['path'] for item in files]:
            raise RuntimeError('STOP overlay archive whitelist differs')
        for member, item in zip(members, files):
            if not member.isfile() or sha(archive.extractfile(member).read()) != item['sha256']:
                raise RuntimeError('STOP overlay archive readback differs')
    old_rows = baseline['rootTree']['metadataRows']
    expected_rows = copy.deepcopy(old_rows)
    old_file_map = {item['path']: item for item in old_rows['files']}
    directory_map = {item['path']: item for item in expected_rows['directories']}
    changes = {item['path']: item for item in files}
    expected_rows['files'] = [item for item in expected_rows['files'] if item['path'] not in changes]
    for item in files:
        metadata = {key: old_file_map[item['path']][key] for key in ('uid', 'gid', 'mode')} if item['path'] in old_file_map else {'uid': 0, 'gid': 0, 'mode': 0o644}
        expected_rows['files'].append({**item, **metadata})
        for parent in PurePosixPath(item['path']).parents:
            if str(parent) not in directory_map:
                directory_map[str(parent)] = {'path': str(parent), 'uid': 0, 'gid': 0, 'mode': 0o755}
    expected_rows['directories'] = sorted(directory_map.values(), key=lambda item: item['path'])
    expected_rows['files'].sort(key=lambda item: item['path'])
    write(out / 'EXPECTED_NEW_TREE.private.json', (json.dumps(expected_rows, ensure_ascii=False, indent=2) + '\n').encode())
    pending = list(baseline.get('pendingGuards', []))
    pending += ['License text/provenance pending: ' + item['name'] for item in manifest['licenses'] if item['licenseTextStatus'] == 'PENDING_OWNER_PROVENANCE']
    media_types = {'.html': ['text/html'], '.mjs': ['application/javascript', 'text/javascript'],
                   '.json': ['application/json'], '.css': ['text/css'], '.png': ['image/png'], '.txt': ['text/plain']}
    expectations = [{**item, 'urlPath': '/' + item['path'], 'acceptedMimeTypes': media_types[PurePosixPath(item['path']).suffix]}
                    for item in files]
    scripts = [record(path) for path in sorted(CONTROL.glob('*.py'))]
    intent = {
        'schema': 'r4d.p6.exact-publication-intent.v1',
        'status': 'PROVISIONAL_INTENT_BLOCKED' if pending else 'FROZEN_INTENT',
        'tokenGranted': False, 'serverWriteAuthorized': False, 'tokenRequestReady': not pending,
        'releaseId': 'p6-local-partial-01', 'windowOwner': 'P6 Release Engineer; serialized CTO window pending',
        'transport': 'vps1-direct', 'remoteInterpreter': 'sudo -n -- python3 -B', 'requiredEuidBeforeAnyWrite': 0,
        'host': 'WIN-36E9FF9EJM0', 'model': 'unknown', 'effort': 'unknown',
        'releaseEngineerLocalCommit': subprocess.check_output(['git','-C',r'E:\R4D\perspective\p6-worktrees\release-engineer','rev-parse','HEAD']).decode().strip(),
        'sourceCommit': manifest['sourceCommit'], 'ledgerCommit': manifest['ledgerCommit'],
        'frozenInventorySha256': manifest['frozenInventoryFileSha256'],
        'runtimeStatus': 'LOCAL_PARTIAL / NO_ART_MOTION_PASS',
        'runtimeSubset': {'files': len(manifest['runtimeSubset']), 'bytes': sum(item['bytes'] for item in manifest['runtimeSubset']),
                          'semantics': 'Exact frozen disk subset only; no rebuild, physics/geometry/capture/seed/source edits or QA redo.'},
        'privateManifest': record(manifest_path), 'overlayArchive': record(archive_path), 'overlayFiles': files,
        'publicExtras': [item for item in files if '/publication/' in item['path'] or item['path'] == 'review/index.html'],
        'comparisonUrl': manifest['comparisonUrl'],
        'comparisonArtifact': next(item for item in files if item['path'].endswith('/publication/comparison.html')),
        'catalogDelta': {'relativePath': 'review/index.html', 'beforeBytes': len(before_catalog), 'beforeSha256': sha(before_catalog),
                         'afterBytes': len(catalog), 'afterSha256': sha(catalog), 'insertOffset': offset,
                         'insertBytes': len(fragment), 'insertSha256': sha(fragment), 'removedBytes': 0, 'inverseRestoresExactOriginal': True},
        'snippetDelta': {'path': SNIPPET, 'beforeBytes': len(snippet), 'beforeSha256': sha(snippet),
                         'afterBytes': len(after_snippet), 'afterSha256': sha(after_snippet), 'rootOnly': True,
                         'normalizedSha256': sha(snippet.replace(OLD_ROOT.encode(), b'__REVIEW_ROOT__'))},
        'baselineReceipt': record(baseline_path), 'baseline': {key: value for key, value in baseline.items() if key not in ('snippetBytesBase64', 'catalogBytesBase64', 'rootTree')},
        'baselineTreeRows': old_rows,
        'oldRoot': OLD_ROOT, 'oldTree': {key:value for key,value in baseline['rootTree'].items() if key != 'metadataRows'},
        'newRoot': NEW_ROOT, 'expectedNewTree': {'files': len(expected_rows['files']), 'directories': len(expected_rows['directories']),
            'bytes': sum(item['bytes'] for item in expected_rows['files']), 'metadataDigest': sha(canonical(expected_rows)),
            'rowsFile': record(out / 'EXPECTED_NEW_TREE.private.json')},
        'writeBoundaryAfterSeparateTokenOnly': {
            'backup': BACKUP, 'archiveRemotePath': BACKUP + '/payload.tar.gz', 'newReleaseRoot': NEW_ROOT,
            'tempSnippet': TEMP_SNIPPET, 'liveSnippet': SNIPPET,
            'allowedServiceOperations': ['nginx -t', 'systemctl reload nginx'],
            'serviceDocumentWrites': [], 'mainVhostWrites': [], 'globalMimeWrites': [],
            'foreignFilesAndDirectories': 'Preserve all baseline bytes/uid/gid/modes exactly except the explicit cloned catalog delta; original root untouched.',
            'newOwnershipModes': {'uid': 0, 'gid': 0, 'publicFiles': '0644', 'publicDirectories': '0755', 'privateBackupDirectory': '0700', 'privateBackupFiles': '0600'},
            'tokenPersistence': 'No token exists in Phase A; future private authorization must bind intent/archive/scripts and exact authorized phases.'},
        'rollback': {'oldRootMustRemainExact': OLD_ROOT, 'oldTreeMetadataDigest': baseline['rootTree']['metadataDigest'],
                     'originalSnippetSha256': sha(snippet), 'originalCatalogSha256': sha(before_catalog),
                     'method': 'Restore exact backed-up root snippet, nginx -t/reload only if explicitly authorized by CTO token. Keep candidate/backup evidence; no blind retry or deletion.'},
        'futureBoundedValidation': {'payloadExpectations': expectations,
            'protectionContext': 'Same normal/foreign-Origin/missing-route GET context, no redirects or credentials; preserve six security headers and MIME policy.',
            'normalCatalogAfterSha256': sha(catalog),
            'uiSmoke': ['One approved-context load; canvas initialized, no module/resource errors.',
                        'One step advances displayed tick; Play/pause and replay controls respond.',
                        'Paused Art/Geometry toggles preserve tick/native state; no artistic reacceptance.',
                        'Download remains unverified; no full QA/oracle/capture replay or auth/stress audit.'],
            'accessLimitation': '403/redirect/login HTML is UNVERIFIED_ACCESS, never module/payload success; no bypass or new credentials.'},
        'privacy': manifest['privacy'], 'licenses': manifest['licenses'], 'pending': pending,
        'scripts': scripts, 'writerHashes': {'launcherSha256': sha((CONTROL / 'p6_execute.py').read_bytes()), 'composedWriterSha256': sha(writer)},
        'gitBoundary': 'No push/recovery of held Builder/Artist/Lead/VQA commits or reports; publication is consumer-only.',
        'authorizationBasis': {'transcriptEvidence': 'Я: «Разрешаешь опубликовать P6 в существующем защищённом Superflight Review, без нового сервера и изменения доступа? После публикации запущу P4 и P5.» Макс: «Да, разумеется, разрешаю. И дальнейшие результаты тоже.»',
                               'phaseAOnly': True, 'separateExactExecutionCommandRequired': True},
        'failureRule': 'Denial stops exact operation/target with call/reason, no alternate actor/transport. Uncertain write outcome requires RO reconciliation before any retry.'}
    target = out / ('PROVISIONAL_INTENT.json' if pending else 'FROZEN_INTENT.json')
    write(target, (json.dumps(intent, ensure_ascii=False, indent=2) + '\n').encode())
    print(json.dumps({'intent': record(target), 'status': intent['status'], 'tokenGranted': False,
                      'overlayArchive': intent['overlayArchive'], 'overlayFiles': len(files),
                      'expectedNewTree': {k:v for k,v in intent['expectedNewTree'].items() if k != 'rowsFile'},
                      'catalogDelta': intent['catalogDelta'], 'snippetDelta': intent['snippetDelta'],
                      'pending': pending}, ensure_ascii=False, indent=2))


if __name__ == '__main__':
    sys.stdout.reconfigure(encoding='utf-8')
    main()
