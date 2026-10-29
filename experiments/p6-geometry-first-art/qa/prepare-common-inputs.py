"""Independent P6 QA input extraction; native source stays in the private runtime."""
import argparse
import hashlib
import json
from pathlib import Path
import subprocess

BASE = 'c6603f0f327350172df44687a4d4ead19e0e5e6b'
P1 = '4b47db04c7140ebf88f69b91faa0b790d46f22ec'
P0 = 'ee4d8e5c7dbb3b6618d58d6dacb0caf9b73dfb1b'
NATIVE = '5a6fa03f1cdb3de88a2d9c7dbe795eb8e2a7f023'
NATIVE_TREE = '008d16a80a26bb77d562a45218b01da09b0d9ff0'
P1_ROOT = 'experiments/p1-collider-mapping/clean-repeat-01/'
SPECS = [
    ('config.json', P1, P1_ROOT+'simulation/boards/01/trial-01/config.json', 'dd5c519cd6d4b7295118e0a3a1063efed424a0ce739450bd5153c6a9941982db', 9503),
    ('manifest.json', P1, P1_ROOT+'simulation/boards/01/trial-01/manifest.json', '7784dc0a215d0e472cf06a4eee03793592727cf0fa9a1fa0e0c78e5f1d17da18', 11565),
    ('projection.mjs', P1, P1_ROOT+'simulation/projection.mjs', None, None),
    ('view-math.mjs', P1, P1_ROOT+'viewer/src/view-math.mjs', None, None),
    ('CROSS_SERIES_CONCLUSION_AND_RECIPE.md', P0, 'experiments/p0-perspective/research/CROSS_SERIES_CONCLUSION_AND_RECIPE.md', None, None),
]

def sha256(data):
    return hashlib.sha256(data).hexdigest()

def git(repo, *args):
    return subprocess.run(['git', '-C', str(repo), *args], cwd=WORKTREE,
                          check=True, stdout=subprocess.PIPE, stderr=subprocess.PIPE).stdout

def write_exact(path, data):
    path.parent.mkdir(parents=True, exist_ok=True)
    if path.exists() and path.read_bytes() != data:
        raise RuntimeError(f'refusing to overwrite different bytes: {path}')
    path.write_bytes(data)

parser = argparse.ArgumentParser()
parser.add_argument('--worktree', required=True)
parser.add_argument('--runtime', required=True)
parser.add_argument('--native-repo', required=True)
parser.add_argument('--reference', required=True)
args = parser.parse_args()
WORKTREE = Path(args.worktree).resolve()
runtime = Path(args.runtime).resolve()
native_repo = Path(args.native_repo).resolve()
git(WORKTREE, 'merge-base', '--is-ancestor', BASE, 'HEAD')
assert git(WORKTREE, 'symbolic-ref', '--short', 'HEAD').decode().strip() == 'codex/r4d-p6-geometry-first-technical-qa-01'
expected_docs = {
    'orders/perspective/ORDER.md': '7fb0047e6f8326ec034e1439be746f18b86d1a8b',
    'orders/perspective/P6-geometry-first-art.md': 'd362af27a641957a0d9f8b9de6eb7d593f8d0d96',
}
for path, expected in expected_docs.items():
    assert git(WORKTREE, 'rev-parse', f'{BASE}:{path}').decode().strip() == expected
reference = Path(args.reference)
reference_bytes = reference.read_bytes()
assert sha256(reference_bytes) == 'c8f9e4245c1de8c2086e615bc75dc10aea59b76b614d6e106593e07262e24f72'
receipt = {'base': BASE, 'document_blobs': expected_docs,
           'reference': {'path': str(reference), 'bytes': len(reference_bytes), 'sha256': sha256(reference_bytes)},
           'common_inputs': [], 'native': {'commit': NATIVE, 'package_tree': NATIVE_TREE},
           'scope': 'pins and independent preparation only; no product acceptance'}
for name, commit, path, expected_hash, expected_size in SPECS:
    data = git(WORKTREE, 'show', f'{commit}:{path}')
    digest = sha256(data)
    assert expected_hash is None or digest == expected_hash, (name, digest)
    assert expected_size is None or len(data) == expected_size, (name, len(data))
    blob = hashlib.sha1(b'blob '+str(len(data)).encode()+b'\0'+data).hexdigest()
    assert blob == git(WORKTREE, 'rev-parse', f'{commit}:{path}').decode().strip()
    write_exact(runtime/'inputs'/'common'/name, data)
    receipt['common_inputs'].append({'name': name, 'commit': commit, 'source': path,
                                     'bytes': len(data), 'sha256': digest, 'git_blob': blob})
assert git(native_repo, 'rev-parse', f'{NATIVE}:packages/sim-core').decode().strip() == NATIVE_TREE
native_records = []
for entry in git(native_repo, 'ls-tree', '-rz', NATIVE, 'packages/sim-core').split(b'\0'):
    if not entry:
        continue
    meta, raw_path = entry.split(b'\t', 1)
    mode, kind, oid = meta.decode().split()
    assert kind == 'blob' and mode in ('100644', '100755')
    path = raw_path.decode()
    assert path.startswith('packages/sim-core/') and '..' not in Path(path).parts
    data = git(native_repo, 'cat-file', 'blob', oid)
    write_exact(runtime/'native-source'/path, data)
    native_records.append({'path': path, 'git_blob': oid, 'bytes': len(data), 'sha256': sha256(data)})
native_manifest = (json.dumps(native_records, ensure_ascii=False, indent=2)+'\n').encode()
write_exact(runtime/'native-source-manifest.json', native_manifest)
receipt['native'].update(files=len(native_records), source_bytes=sum(x['bytes'] for x in native_records),
                         source_manifest_sha256=sha256(native_manifest), source_location='private QA runtime only')
output = WORKTREE/'experiments'/'p6-geometry-first-art'/'qa'/'common-inputs.json'
write_exact(output, (json.dumps(receipt, ensure_ascii=False, indent=2)+'\n').encode())
print(json.dumps({'receipt': str(output), 'receipt_sha256': sha256(output.read_bytes()),
                  'native_files': len(native_records), 'native_source_bytes': receipt['native']['source_bytes'],
                  'common_inputs': receipt['common_inputs']}, ensure_ascii=False, indent=2))
