"""FX01-D1-43b6268e: probe/stage/verify only. No live switch or reload command."""
import base64
import hashlib
import json
import os
from pathlib import Path
import re
import shutil
import stat
import subprocess
import sys
from datetime import datetime, timezone

SOURCE = '43b6268e924698048a4d79df1aad2512c86f08f7'
SNIPPET = Path('/etc/nginx/snippets/review.locations.conf')
RELEASES = Path('/srv/superflight-review/releases')
DOCS = [Path('/home/sf/assistant-context/vps/services/superflight-studio.md'), Path('/home/sf/assistant-context/vps/CHANGELOG.md')]
CATALOGS = ['review/index.html', 'review/r4d/index.html']
RUNTIME = ['review/r4d/fx-workshop/fx-01/' + n for n in ['index.html', 'style.css', 'app.js']]
PROTECTED = ['/etc/nginx/nginx.conf', '/etc/nginx/mime.types', '/etc/nginx/conf.d/superflight-studio.conf', '/etc/nginx/conf.d/superflight-studio-http.conf', '/etc/nginx/snippets/imagen.locations.conf', '/etc/nginx/snippets/superflight-public-runtime-guard.conf', '/etc/nginx/snippets/superflight-public-static.locations.conf', '/etc/nginx/snippets/superflight-studio-portal.conf', '/opt/superflight-studio/portal/app.py', '/opt/superflight-studio/portal/compose.yml']

def utc():
    return datetime.now(timezone.utc).isoformat()

def sha(data):
    return hashlib.sha256(data).hexdigest()

def encoded(data):
    return json.dumps(data, sort_keys=True, ensure_ascii=True, separators=(',', ':')).encode()

def file_meta(path):
    st = path.lstat()
    assert stat.S_ISREG(st.st_mode), str(path)
    digest = hashlib.sha256()
    with path.open('rb') as f:
        for block in iter(lambda: f.read(1024 * 1024), b''):
            digest.update(block)
    return {'type': 'file', 'uid': st.st_uid, 'gid': st.st_gid, 'mode': stat.S_IMODE(st.st_mode), 'size': st.st_size, 'sha256': digest.hexdigest()}

def tree(root):
    assert root.is_dir() and root.resolve() == root
    result = {}
    for path in [root] + sorted(root.rglob('*')):
        st = path.lstat()
        assert not path.is_symlink(), 'Symlink: ' + str(path)
        key = path.relative_to(root).as_posix()
        if stat.S_ISDIR(st.st_mode):
            result[key] = {'type': 'dir', 'uid': st.st_uid, 'gid': st.st_gid, 'mode': stat.S_IMODE(st.st_mode)}
        else:
            result[key] = file_meta(path)
    return result

def summary(inventory):
    files = [v for v in inventory.values() if v['type'] == 'file']
    return {'files': len(files), 'directories': len(inventory) - len(files), 'bytes': sum(v['size'] for v in files), 'sha256': sha(encoded(inventory))}

def live():
    data = SNIPPET.read_bytes()
    roots = re.findall(rb'^\s*root (/srv/superflight-review/releases/[A-Za-z0-9_-]+);$', data, re.M)
    assert len(roots) == 1, 'Ambiguous live root'
    return data, Path(roots[0].decode('ascii'))

def protected():
    return {p: file_meta(Path(p)) for p in PROTECTED}

def nginx_state():
    return subprocess.check_output(['systemctl', 'show', 'nginx', '-p', 'ActiveState', '-p', 'MainPID', '-p', 'ExecReload'], text=True).strip()

def probe():
    data, root = live()
    inventory = tree(root)
    return {'at_utc': utc(), 'root': str(root), 'snippet_sha256': sha(data), 'snippet_b64': base64.b64encode(data).decode(), 'snippet_meta': file_meta(SNIPPET), 'inventory': inventory, 'summary': summary(inventory), 'protected': protected(), 'nginx_state': nginx_state(), 'disk_free': shutil.disk_usage(RELEASES).free, 'catalogs': {p: base64.b64encode((root / p).read_bytes()).decode() for p in CATALOGS}}

def guard(base):
    data, root = live()
    assert str(root) == base['root'] and sha(data) == base['snippet_sha256'], 'Live root/snippet changed; do not overwrite'
    assert protected() == base['protected'], 'Protected component changed'
    assert tree(root) == base['inventory'], 'Base tree changed'
    return data, root

def write_json(path, data):
    with path.open('xb') as f:
        f.write(json.dumps(data, indent=2, ensure_ascii=False).encode('utf-8') + b'\n')

def append_docs(text):
    # Preserve the existing prefix and uid/gid/mode; never use the retired writer.
    for path in DOCS:
        before = path.read_bytes()
        metadata = file_meta(path)
        with path.open('ab') as f:
            f.write(text.encode('utf-8'))
        after = path.read_bytes()
        now = file_meta(path)
        assert after == before + text.encode('utf-8')
        assert all(now[k] == metadata[k] for k in ['uid', 'gid', 'mode'])

def verify(receipt_path):
    receipt = json.loads(receipt_path.read_text())
    backup = receipt_path.parent
    base = json.loads((backup / 'BASELINE.json').read_text())
    guard(base)
    target = Path(receipt['staging_root'])
    assert tree(target) == json.loads((backup / 'STAGED_INVENTORY.json').read_text()), 'Staging tree changed'
    old = (backup / 'review.locations.before.conf').read_bytes()
    candidate = (backup / 'review.locations.candidate.conf').read_bytes()
    assert sha(old) == base['snippet_sha256']
    assert sha(candidate) == receipt['candidate_snippet_sha256']
    assert candidate.replace(str(target).encode(), base['root'].encode()) == old
    assert nginx_state() == base['nginx_state'], 'nginx state/reload changed since baseline'
    subprocess.run(['nginx', '-t'], check=True, capture_output=True)
    return {'status': 'STAGING_READY', 'at_utc': utc(), 'live_root': base['root'], 'live_snippet_sha256': base['snippet_sha256'], 'staging_root': str(target), 'staging_summary': summary(tree(target)), 'base_and_protected_unchanged': True, 'nginx_state_unchanged': True, 'root_only_candidate': True, 'live_switch': False, 'reload': False}

def stage(packet, baseline_path, ident):
    assert os.geteuid() == 0
    assert re.fullmatch(r'fx01-43b6268e-\d{8}T\d{6}Z', ident)
    base = json.loads(baseline_path.read_text())
    manifest = json.loads((packet / 'packet.json').read_text())
    assert manifest['source'] == SOURCE and manifest['base_manifest_sha256'] == base['summary']['sha256']
    assert manifest['base_root'] == base['root'] and manifest['base_snippet_sha256'] == base['snippet_sha256']
    assert set(manifest['files']) == set(CATALOGS + RUNTIME)
    assert {p.relative_to(packet / 'public').as_posix() for p in (packet / 'public').rglob('*') if p.is_file()} == set(manifest['files'])
    for rel, item in manifest['files'].items():
        content = (packet / 'public' / rel).read_bytes()
        assert len(content) == item['size'] and sha(content) == item['sha256']
        assert not (packet / 'public' / rel).is_symlink()
    old, root = guard(base)
    total = base['summary']['bytes'] + sum(v['size'] for v in manifest['files'].values())
    free = shutil.disk_usage(RELEASES).free
    assert free > 4 * 1024**3 and free - total > 4 * 1024**3, 'Disk threshold: review step before write'
    final = RELEASES / ident
    staging = RELEASES / ('.staging-' + ident)
    backup = Path('/opt/superflight-studio/backups') / ('review-' + ident)
    assert not final.exists() and not staging.exists() and not backup.exists(), 'Unique D1 paths already exist'
    backup.mkdir(mode=0o700)
    write_json(backup / 'BASELINE.json', base)
    shutil.copy2(SNIPPET, backup / 'review.locations.before.conf')
    append_docs(f'\n\n## FX-01 D1 START — {ident}\n\n{utc()}. Source {SOURCE}; only immutable staging preparation. Incoming {packet.parent}; base {root}, snippet {base["snippet_sha256"]}. NO live switch/reload; CUT is not issued.\n')
    try:
        subprocess.run(['cp', '--archive', '--reflink=auto', '--', str(root), str(staging)], check=True)
        assert tree(staging) == base['inventory'], 'Clone differs from base'
        for rel, item in base['inventory'].items():
            if item['type'] == 'file':
                assert os.stat(root / rel).st_ino != os.stat(staging / rel).st_ino, 'Hardlinked clone'
        for rel in CATALOGS + RUNTIME:
            dst = staging / rel
            missing = []
            parent = dst.parent
            while not parent.exists():
                missing.append(parent)
                parent = parent.parent
            dst.parent.mkdir(parents=True, exist_ok=True)
            for path in missing:
                os.chown(path, 0, 0)
                os.chmod(path, 0o755)
            dst.write_bytes((packet / 'public' / rel).read_bytes())
            if rel in RUNTIME:
                os.chown(dst, 0, 0)
                os.chmod(dst, 0o644)
        after = tree(staging)
        changed = []
        for rel, prior in base['inventory'].items():
            assert rel in after, 'Missing prior path'
            if rel in CATALOGS:
                assert all(after[rel][k] == prior[k] for k in ['type', 'uid', 'gid', 'mode'])
                changed.append(rel)
            else:
                assert prior == after[rel], 'Foreign file/metadata changed: ' + rel
        additions = {k for k, v in after.items() if k not in base['inventory'] and v['type'] == 'file'}
        new_dirs = {k for k, v in after.items() if k not in base['inventory'] and v['type'] == 'dir'}
        assert additions == set(RUNTIME)
        assert new_dirs == {'review/r4d/fx-workshop', 'review/r4d/fx-workshop/fx-01'}
        for rel, item in manifest['files'].items():
            assert after[rel]['size'] == item['size'] and after[rel]['sha256'] == item['sha256']
        guard(base)
        os.rename(staging, final)
        candidate = old.replace(b'root ' + str(root).encode() + b';', b'root ' + str(final).encode() + b';')
        assert candidate != old and candidate.replace(str(final).encode(), str(root).encode()) == old
        (backup / 'review.locations.candidate.conf').write_bytes(candidate)
        shutil.copy2(packet / 'packet.json', backup / 'packet.json')
        shutil.copy2(Path(__file__), backup / 'd1_stage.py')
        shutil.copy2(Path(__file__).with_name('d1_rollback.py'), backup / 'd1_rollback.py')
        write_json(backup / 'STAGED_INVENTORY.json', after)
        receipt = {'key': 'FX01-D1-43b6268e', 'status': 'STAGING_READY', 'at_utc': utc(), 'source': SOURCE, 'intended_url': 'https://superflight.space/review/r4d/fx-workshop/fx-01/', 'base_root': str(root), 'base_snippet_sha256': sha(old), 'staging_root': str(final), 'backup': str(backup), 'candidate_snippet_sha256': sha(candidate), 'base_summary': base['summary'], 'staging_summary': summary(after), 'preserved_files': base['summary']['files'] - 2, 'changed': changed, 'added_files': sorted(additions), 'added_dirs': sorted(new_dirs), 'no_symlinks': True, 'no_shared_file_inodes': True, 'inherited_owners_modes_preserved': True, 'counts': manifest['counts'], 'runtime': {k: manifest['files'][k] for k in RUNTIME}, 'packet_sha256': sha((packet / 'packet.json').read_bytes()), 'live_switch': False, 'reload': False}
        receipt['base_browser_files'] = sum(k.startswith('review/') and v['type'] == 'file' for k, v in base['inventory'].items())
        receipt['staged_browser_files'] = sum(k.startswith('review/') and v['type'] == 'file' for k, v in after.items())
        receipt['preserved_browser_files'] = receipt['base_browser_files'] - 2
        receipt['catalog_inverse_verified'] = manifest['catalog_inverse_verified']
        write_json(backup / 'STAGING_READY.json', receipt)
        checked = verify(backup / 'STAGING_READY.json')
        write_json(backup / 'STAGING_VERIFIED.json', checked)
        append_docs(f'\n\n## FX-01 D1 STAGING_READY — {ident}\n\n{utc()}. Source {SOURCE}; staged {final}; {receipt["staging_summary"]["files"]} files / {receipt["staging_summary"]["bytes"]} bytes. Preserved {receipt["preserved_files"]} previous files and inherited uid/gid/mode; only two catalogs changed and three exact runtime files added. No symlinks/hardlink clone. Live root/hash and protected components unchanged, nginx -t PASS; NO live switch/reload. Candidate snippet changes only root, SHA256 {sha(candidate)}. Private receipts/guarded rollback {backup}. Await separate CTO CUT. Physical M11 and human/product gates remain open.\n')
        return receipt
    except Exception as exc:
        append_docs(f'\n\n## FX-01 D1 FAILED — {ident}\n\n{utc()}. Preparation failed: {type(exc).__name__}: {exc}. No switch/reload executed by D1 helper. Keep partial staging/backup for inspection; do not claim STAGING_READY.\n')
        raise

if __name__ == '__main__':
    if sys.argv[1] == 'probe':
        result = probe()
    elif sys.argv[1] == 'stage':
        result = stage(Path(sys.argv[2]), Path(sys.argv[3]), sys.argv[4])
    elif sys.argv[1] == 'verify':
        result = verify(Path(sys.argv[2]))
    else:
        raise SystemExit('probe | stage PACKET BASELINE ID | verify RECEIPT. No CUT command.')
    print(json.dumps(result, ensure_ascii=True))
