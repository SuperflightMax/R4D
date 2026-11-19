"""Prepared only. Requires explicit rollback instruction after CUT, plus exact live guard."""
import hashlib
import json
import os
from pathlib import Path
import stat
import subprocess
import sys
from d1_stage import guard, protected, sha, tree, append_docs, utc

def atomic(path, data, metadata):
    temp = path.with_name(path.name + '.fx01-rollback-' + str(os.getpid()))
    with temp.open('xb') as f:
        f.write(data)
        f.flush()
        os.fsync(f.fileno())
    os.chown(temp, metadata['uid'], metadata['gid'])
    os.chmod(temp, metadata['mode'])
    os.replace(temp, path)

def rollback():
    assert sys.argv[1:] == ['--rollback'], 'Explicit --rollback required; do not run during D1 staging'
    assert os.geteuid() == 0
    folder = Path(__file__).resolve().parent
    receipt = json.loads((folder / 'STAGING_READY.json').read_text())
    base = json.loads((folder / 'BASELINE.json').read_text())
    snippet = Path('/etc/nginx/snippets/review.locations.conf')
    current = snippet.read_bytes()
    assert sha(current) == receipt['candidate_snippet_sha256'], 'Rollback refuses foreign edits or pre-CUT base'
    assert protected() == base['protected'], 'Protected config changed'
    assert tree(Path(base['root'])) == base['inventory'], 'Old immutable base changed'
    old = (folder / 'review.locations.before.conf').read_bytes()
    assert sha(old) == base['snippet_sha256']
    subprocess.run(['nginx', '-t'], check=True)
    atomic(snippet, old, base['snippet_meta'])
    try:
        subprocess.run(['nginx', '-t'], check=True)
    except Exception:
        atomic(snippet, current, base['snippet_meta'])
        raise
    subprocess.run(['systemctl', 'reload', 'nginx'], check=True)
    assert subprocess.check_output(['systemctl', 'is-active', 'nginx'], text=True).strip() == 'active'
    append_docs(f'\n\n## FX-01 guarded rollback — {utc()}\n\nReturned only Review snippet root to {base["root"]}; exact guards and nginx tests passed; graceful reload. No DB/session restoration.\n')
    print(json.dumps({'status': 'ROLLED_BACK', 'root': base['root'], 'snippet_sha256': sha(old)}))

if __name__ == '__main__':
    rollback()
