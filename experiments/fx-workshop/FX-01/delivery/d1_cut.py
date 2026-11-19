"""One explicitly issued CUT. No rebuild. Exact key/base/candidate guards, no repeated reload."""
import json
import os
from pathlib import Path
import shutil
import subprocess
import sys
from d1_stage import SNIPPET, append_docs, file_meta, guard, live, nginx_state, protected, sha, tree, utc, verify, write_json
from d1_rollback import atomic

KEY = 'FX01-D1-CUT-43b6268e-20261119T031029Z'
FOLDER = Path('/opt/superflight-studio/backups/review-fx01-43b6268e-20261119T031029Z')
EXPECTED_BASE = 'b9dde1214d4aabf6b7d4469fddf5cd81ee29f8e94706b20a8fa900b92f21e983'
EXPECTED_CANDIDATE = '39b20c6fe05572089c1038ec95129211c8b6b2fc374c16b3baac117da04f3456'

def cut():
    assert os.geteuid() == 0 and Path(__file__).resolve().parent == FOLDER
    assert sys.argv[1:] == ['--cut', KEY], 'Exact explicitly issued CUT key required'
    receipt = json.loads((FOLDER / 'STAGING_READY.json').read_text())
    base = json.loads((FOLDER / 'BASELINE.json').read_text())
    staged = json.loads((FOLDER / 'STAGED_INVENTORY.json').read_text())
    assert receipt['source'] == '43b6268e924698048a4d79df1aad2512c86f08f7'
    assert receipt['staging_summary']['sha256'] == 'b24d7b91242b33b46c458bfefa54a0a9fffe8d4615ba08cdb242b957e18f8cb9'
    assert receipt['base_snippet_sha256'] == EXPECTED_BASE and receipt['candidate_snippet_sha256'] == EXPECTED_CANDIDATE
    if (FOLDER / 'CUT_RESULT.json').exists():
        done = json.loads((FOLDER / 'CUT_RESULT.json').read_text())
        assert done['key'] == KEY and sha(SNIPPET.read_bytes()) == EXPECTED_CANDIDATE, 'Previous CUT exists; inspect current state, do not repeat'
        assert protected() == base['protected'] and tree(Path(receipt['staging_root'])) == staged
        return {'idempotent_replay': True, 'result': done}
    assert not (FOLDER / 'CUT_PRECHECK.json').exists(), 'Incomplete CUT record exists; inspect before any retry'
    assert shutil.disk_usage(FOLDER).free > 4 * 1024**3
    pre = verify(FOLDER / 'STAGING_READY.json')  # includes the pre-CUT nginx -t
    assert file_meta(SNIPPET) == base['snippet_meta']
    old = SNIPPET.read_bytes()
    candidate = (FOLDER / 'review.locations.candidate.conf').read_bytes()
    assert sha(old) == EXPECTED_BASE and sha(candidate) == EXPECTED_CANDIDATE
    assert candidate.replace(receipt['staging_root'].encode(), base['root'].encode()) == old
    write_json(FOLDER / 'CUT_PRECHECK.json', {'key': KEY, 'at_utc': utc(), 'precheck': pre, 'snippet_metadata': file_meta(SNIPPET), 'disk_free': shutil.disk_usage(FOLDER).free})
    shutil.copy2(SNIPPET, FOLDER / 'CUT_BEFORE.review.locations.conf')
    append_docs(f'\n\n## FX-01 CUT START — {KEY}\n\n{utc()}. Direct CTO CUT issued for source {receipt["source"]}, immutable {receipt["staging_root"]}. Fresh exact base/staging/protected/nginx/disk guards and nginx -t passed; pre-CUT copy saved. Only root literal may change.\n')
    switched = False
    try:
        guard(base)  # refuse a foreign update immediately before replacement
        assert SNIPPET.read_bytes() == old
        atomic(SNIPPET, candidate, base['snippet_meta'])
        switched = True
        write_json(FOLDER / 'CUT_SWITCHED.json', {'key': KEY, 'at_utc': utc(), 'snippet_sha256': sha(SNIPPET.read_bytes())})
        tested = subprocess.run(['nginx', '-t'], check=True, capture_output=True, text=True)
        subprocess.run(['systemctl', 'reload', 'nginx'], check=True, capture_output=True)
        assert subprocess.check_output(['systemctl', 'is-active', 'nginx'], text=True).strip() == 'active'
        assert sha(SNIPPET.read_bytes()) == EXPECTED_CANDIDATE and live()[1] == Path(receipt['staging_root'])
        assert protected() == base['protected'] and tree(Path(base['root'])) == base['inventory']
        assert tree(Path(receipt['staging_root'])) == staged
        result = {'key': KEY, 'status': 'CUT_COMPLETE_AWAITING_HTTP_BROWSER', 'at_utc': utc(), 'source': receipt['source'], 'url': receipt['intended_url'], 'root': receipt['staging_root'], 'snippet_sha256': EXPECTED_CANDIDATE, 'before_snippet_sha256': EXPECTED_BASE, 'nginx_test_before': True, 'nginx_test_after': tested.stderr.strip(), 'graceful_reload_count': 1, 'nginx_state_after': nginx_state(), 'protected_and_old_tree_unchanged': True, 'staged_tree_exact': True, 'rollback': str(FOLDER / 'd1_rollback.py')}
        write_json(FOLDER / 'CUT_RESULT.json', result)
        append_docs(f'\n\n## FX-01 CUT complete; delivery checks pending — {KEY}\n\n{utc()}. Atomic root-only switch to {receipt["staging_root"]}; snippet {EXPECTED_CANDIDATE}. nginx tests before/after and one graceful reload PASS, nginx active; base/staged/protected hashes unchanged. HTTP/browser verification still pending. Physical M11 and human/product gates remain open.\n')
        return result
    except Exception as exc:
        failure = {'key': KEY, 'at_utc': utc(), 'error': type(exc).__name__ + ': ' + str(exc), 'switched': switched, 'current_snippet_sha256': sha(SNIPPET.read_bytes())}
        if switched and sha(SNIPPET.read_bytes()) == EXPECTED_CANDIDATE and protected() == base['protected']:
            rollback = subprocess.run(['python3', '-B', str(FOLDER / 'd1_rollback.py'), '--rollback'], capture_output=True, text=True)
            failure['guarded_rollback'] = {'returncode': rollback.returncode, 'stdout': rollback.stdout, 'stderr': rollback.stderr}
        write_json(FOLDER / 'CUT_FAILED.json', failure)
        append_docs(f'\n\n## FX-01 CUT FAILED — {KEY}\n\n{utc()}. {failure["error"]}. Inspect CUT_FAILED.json; do not repeat CUT or overwrite foreign edits.\n')
        raise

if __name__ == '__main__':
    print(json.dumps(cut(), ensure_ascii=True))
