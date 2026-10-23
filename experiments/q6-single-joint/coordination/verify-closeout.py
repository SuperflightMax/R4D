"""Read candidate/protected/foreign bytes; write only new Lead verification records."""
from pathlib import Path
import hashlib
import json
import subprocess
import sys

ROOT = Path(__file__).resolve().parents[1]
REPO = ROOT.parents[1]
OUT = ROOT / 'coordination' / 'lead-verification'
OUT.mkdir(exist_ok=True)
PHASE = sys.argv[1]

def sha(path):
    return hashlib.sha256(path.read_bytes()).hexdigest()

def git(*args):
    return subprocess.check_output(['git', *args], cwd=REPO)

manifest_path = ROOT / 'output/builder/q6-c1-files.json'
manifest = json.loads(manifest_path.read_text(encoding='utf-8'))
mh = sha(manifest_path)
assert mh == 'cc739d9e680f64b3fecf62e855b80caf4a7002f501eba282668a9e95758c8321'
assert sha(ROOT / 'FROZEN_CONTRACT.json') == 'e1dbd83ca86f2c723c5ec51fc97fb85aa06236c88c628c728893005ca284380a'
records = []
for group in ['runtime', 'immutableInputs']:
    for entry in manifest[group]:
        path = ROOT / entry['file']
        assert sha(path) == entry['sha256'], entry['file']
        assert path.stat().st_size == entry['bytes'], entry['file']
        records.append(dict(entry, group=group))
assert len(records) == 76 and sum(e['bytes'] for e in records) == 6631211

protected = {}
for name in git('ls-files', '-z', 'experiments').decode().split('\0'):
    if name and not name.startswith('experiments/q6-single-joint/'):
        protected[name] = sha(REPO / name)
assert not git('diff', '--name-only', 'HEAD', '--', 'experiments', ':(exclude)experiments/q6-single-joint').strip()

foreign_names = set()
for raw in git('status', '--porcelain=v1', '-z', '--untracked-files=all').decode().split('\0'):
    if not raw:
        continue
    name = raw[3:]
    if name.startswith('experiments/q6-single-joint/') or name in ['docs/Q1_Q6_COMPARATIVE_CONCLUSION.md', 'architect/START_HERE.md']:
        continue
    foreign_names.add(name)
foreign = {name: sha(REPO / name) for name in sorted(foreign_names) if (REPO / name).is_file()}
if PHASE != 'before':
    before = json.loads((OUT / 'before.json').read_text(encoding='utf-8'))
    assert protected == before['protectedSHA256'], 'Protected bytes changed'
    assert foreign == before['foreignSHA256'], 'Foreign paths/bytes changed'

result = {'phase': PHASE, 'candidate': manifest['candidate'], 'manifestSHA256': mh,
          'count': len(records), 'bytes': sum(e['bytes'] for e in records),
          'protectedCount': len(protected), 'foreignCount': len(foreign),
          'protectedSHA256': protected, 'foreignSHA256': foreign,
          'files': records, 'failures': []}
if PHASE not in ['post-commit', 'post-push']:
    (OUT / (PHASE + '.json')).write_text(json.dumps(result, ensure_ascii=False, indent=2) + '\n', encoding='utf-8')
print(json.dumps({k: v for k, v in result.items() if k not in ['protectedSHA256', 'foreignSHA256', 'files']}))
