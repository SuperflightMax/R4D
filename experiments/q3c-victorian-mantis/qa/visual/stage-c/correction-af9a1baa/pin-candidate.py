import hashlib
import json
import re
import subprocess
import sys
from datetime import datetime, timezone
from pathlib import Path
from urllib.request import urlopen


ROOT = Path(__file__).resolve().parent
PROJECT = ROOT.parents[3]
REPO = PROJECT.parent.parent
CANDIDATE = 'af9a1baa7122fc5d17d0783581a564be2d32f187'
PRIOR_VQA = 'e5772eda88c1e3cc5aaa1cfd92965df614949c08'
URL = 'http://127.0.0.1:4189/'
STAGE_C = ROOT.parent.relative_to(REPO).as_posix()
PROJECT_PATH = PROJECT.relative_to(REPO).as_posix()
MODE = sys.argv[1]
if MODE not in ('before', 'after'):
    raise ValueError('Expected before or after')


def git(*args):
    return subprocess.check_output(['git', '-C', str(REPO), *args], encoding='utf-8').strip()


def sha(data):
    return hashlib.sha256(data).hexdigest()


def fetch(path=''):
    with urlopen(URL + path, timeout=8) as response:
        return response.read()


paths = git('ls-tree', '-r', '--name-only', CANDIDATE, '--', PROJECT_PATH).splitlines()
inputs = [name for name in paths if not name.startswith(f'{PROJECT_PATH}/qa/')]
assert not git('diff', '--name-only', CANDIDATE, '--', *inputs), 'Product input differs from candidate'
assert not git('diff', '--name-only', PRIOR_VQA, '--', STAGE_C), 'Prior VQA evidence changed'
head, remote = git('rev-parse', 'HEAD', 'origin/main').splitlines()
if MODE == 'before':
    assert head == remote == CANDIDATE
else:
    allowed = f'{PROJECT_PATH}/qa/technical/stage-c/correction-af9a1baa/'
    assert all(p.startswith(allowed) for p in git('diff', '--name-only', CANDIDATE, 'HEAD').splitlines())

dist = PROJECT / 'dist'
html = fetch()
entry = re.search(rb'script type="module"[^>]*src="\./([^"]+)"', html)[1].decode()
assert entry == 'assets/index-BS97Fcsr.js'
assert html == (dist / 'index.html').read_bytes()
entry_bytes = fetch(entry)
assert entry_bytes == (dist / entry).read_bytes()
record = {
    'candidate': CANDIDATE, 'priorVqa': PRIOR_VQA, 'head': head, 'originMain': remote,
    'observedUtc': datetime.now(timezone.utc).isoformat(),
    'preview': URL, 'servedEntry': entry, 'servedEntrySha256': sha(entry_bytes),
    'inputs': {name: sha((REPO / name).read_bytes()) for name in inputs},
    'dist': {path.relative_to(dist).as_posix(): sha(path.read_bytes())
             for path in sorted(dist.rglob('*')) if path.is_file()},
}
if MODE == 'after':
    before = json.loads((ROOT / 'evidence/candidate-before.json').read_text(encoding='utf-8'))
    for key in ('servedEntry', 'servedEntrySha256', 'inputs', 'dist'):
        assert before[key] == record[key], f'Pin changed: {key}'
    routes = sorted((ROOT / 'evidence').glob('*/observations.json'))
    assert len(routes) == 2
    record['recordedRoutes'] = []
    for path in routes:
        obs = json.loads(path.read_text(encoding='utf-8-sig'))
        assert obs['candidate'] == CANDIDATE and obs['metadata']['script'] == URL + entry
        assert not obs['metadata']['reduced'] and obs['ready']
        record['recordedRoutes'].append({'path': path.relative_to(ROOT).as_posix(), 'metadata': obs['metadata']})

output = ROOT / 'evidence'
output.mkdir(exist_ok=True)
(output / f'candidate-{MODE}.json').write_text(json.dumps(record, indent=2) + '\n', encoding='utf-8')
print(f'{MODE}: {entry} {record["servedEntrySha256"]}, {len(inputs)} inputs, {len(record["dist"])} dist files')
