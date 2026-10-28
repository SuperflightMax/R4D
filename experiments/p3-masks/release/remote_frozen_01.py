"""Only the CTO-P3-F01 exact write-set. Executed via SSH stdin, not installed."""
import datetime
import hashlib
import http.client
import html.parser
import json
import os
from pathlib import Path, PurePosixPath
import re
import shutil
import stat
import subprocess
import sys
import tarfile
import time
import urllib.parse

TOKEN = 'CTO-P3-F01-20261028T064706Z-ddfe257b6856'
OLD = Path('/srv/superflight-review/releases/p2-jungle-static-candidate-03')
NEW = Path('/srv/superflight-review/releases/p3-jungle-masks-frozen-01')
BACKUP = Path('/opt/superflight-studio/backups/review-p3-frozen-01')
SNIPPET = Path('/etc/nginx/snippets/review.locations.conf')
TEMP = Path('/etc/nginx/snippets/.review-p3-frozen-01.locations.conf.tmp')
OLD_MANIFEST = '171a889a53da529d2a668da9811b3f6a9661cdc52ab54a46e254900553cfed35'
NEW_MANIFEST = '381ff209d36f24c1734e2f2012d0b298cb13efd37e928956ceaf00ab967c2937'
OLD_SNIPPET = 'd8cf0b3cd5a56241dc86562705daab81da09c648ad1aba8adcf232be2eb23104'
NEW_SNIPPET = 'c67b27e4b179dfe3cb803268435b7558b0c48b8ea8b1018ec709149511be1ba8'
NORMAL = '1ed5f62aafffd08ff9359fc4b615139006fc2e0e3cbf152b0363b6d0dcb7230f'
ARCHIVE_HASH = '23a3df76a29b05d8cc7ea17ff1cf0e9e360848a540f15386d26e1a85998f463c'
ROOT_PATTERN = rb'(^\s*root\s+)([^;\s]+)(\s*;)'


def sha(data):
    return hashlib.sha256(data).hexdigest()


def utc():
    return datetime.datetime.now(datetime.timezone.utc).isoformat()


def require(ok, reason):
    if not ok:
        raise RuntimeError('STOP: ' + reason)


def write_json(path, value):
    path.write_bytes((json.dumps(value, ensure_ascii=False, indent=2) + '\n').encode())
    os.chmod(path, 0o644)


def resources():
    mem = {line.split(':')[0]:int(line.split()[1])*1024
           for line in Path('/proc/meminfo').read_text().splitlines()
           if line.startswith(('MemTotal:', 'MemAvailable:'))}
    disk = os.statvfs(OLD)
    return {'utc':utc(), 'memBytes':mem, 'loadAverage':os.getloadavg(),
            'cpuCount':os.cpu_count(), 'diskFreeBytes':disk.f_bavail*disk.f_frsize}


def inventory(root, manifest_hash):
    manifest_bytes = (root/'RELEASE_MANIFEST.json').read_bytes()
    require(sha(manifest_bytes) == manifest_hash, 'manifest drift at ' + str(root))
    m = json.loads(manifest_bytes)
    actual = []
    dirs = 0
    for p in [root] + sorted(root.rglob('*')):
        s = p.lstat()
        require(not stat.S_ISLNK(s.st_mode), 'symlink at ' + str(p))
        require(s.st_uid == s.st_gid == 0, 'owner drift at ' + str(p))
        require(stat.S_ISDIR(s.st_mode) or stat.S_ISREG(s.st_mode), 'nonregular file at ' + str(p))
        require(stat.S_IMODE(s.st_mode) == (0o755 if p.is_dir() else 0o644), 'mode drift at ' + str(p))
        if p.is_dir():
            dirs += 1
        elif p != root/'RELEASE_MANIFEST.json':
            data = p.read_bytes()
            actual.append({'path':p.relative_to(root).as_posix(),'bytes':len(data),'sha256':sha(data)})
    actual.sort(key=lambda f:f['path'])
    require(actual == sorted(m['published_files'], key=lambda f:f['path']), 'inventory drift at ' + str(root))
    require(len(actual) == m['published_file_count'], 'file-count mismatch')
    require(sum(f['bytes'] for f in actual) == m['published_bytes'], 'byte-count mismatch')
    return m, {'files':len(actual)+1,'browserFiles':len(actual),
               'browserBytes':sum(f['bytes'] for f in actual),'directories':dirs,
               'manifestSha256':manifest_hash,'ownership':'root:root','dirsMode':'0755','filesMode':'0644'}


def snippet_guard(expected_root, expected_hash):
    b = SNIPPET.read_bytes()
    require(sha(b) == expected_hash, 'live snippet drift')
    matches = re.findall(ROOT_PATTERN, b, flags=re.M)
    require(len(matches) == 1 and matches[0][1] == str(expected_root).encode(), 'live root drift')
    normal = re.sub(ROOT_PATTERN, lambda m:m[1]+b'<REVIEW_ROOT>'+m[3], b, flags=re.M)
    require(sha(normal) == NORMAL, 'normalized config drift')
    s = SNIPPET.stat()
    require(s.st_uid == s.st_gid == 0 and stat.S_IMODE(s.st_mode) == 0o644, 'snippet metadata drift')
    return b


def baseline():
    snippet_guard(OLD, OLD_SNIPPET)
    _, inv = inventory(OLD, OLD_MANIFEST)
    return {'utc':utc(),'root':str(OLD),'snippetSha256':OLD_SNIPPET,
            'manifestSha256':OLD_MANIFEST,'inventory':inv,'resources':resources()}


def absent(path):
    require(not os.path.lexists(path), 'occupied target ' + str(path))


def own_state():
    state = json.loads((BACKUP/'STATE.json').read_bytes())
    require(state['token'] == TOKEN, 'backup token mismatch')
    require(sha((BACKUP/'review.locations.conf.before').read_bytes()) == OLD_SNIPPET,
            'rollback snapshot hash mismatch')
    return state


def nginx_test():
    p = subprocess.run(['nginx','-t'], stdout=subprocess.PIPE, stderr=subprocess.PIPE)
    require(p.returncode == 0, 'nginx -t returned ' + str(p.returncode))
    return 'passed'


def probe(path, foreign=False):
    conn = http.client.HTTPSConnection('superflight.space', timeout=25)
    headers = {'User-Agent':'R4D-P3-delivery-smoke/1'}
    if foreign:
        headers['Origin'] = 'https://example.invalid'
    conn.request('GET', path, headers=headers)
    response = conn.getresponse()
    selected = {k:response.getheader(k) for k in
                ['Location','X-Frame-Options','Cache-Control','X-Robots-Tag',
                 'X-Content-Type-Options','Referrer-Policy','Content-Type']}
    response.read()
    result = {'path':path,'status':response.status,'headers':selected,'foreignOrigin':foreign}
    conn.close()
    return result


def begin():
    for p in [NEW, BACKUP, TEMP]:
        absent(p)
    guard = baseline()  # Last full read before the first authorized write.
    checks = [probe('/review/'), probe('/review/',True), probe('/review/.r4d-p3-probe')]
    require([x['status'] for x in checks] == [303,403,404], 'prewrite public protection differs')
    # Guard again after network checks, immediately before creating the backup.
    snippet_guard(OLD, OLD_SNIPPET)
    BACKUP.mkdir(mode=0o700)
    before = SNIPPET.read_bytes()
    require(sha(before) == OLD_SNIPPET, 'snippet drift before backup')
    (BACKUP/'review.locations.conf.before').write_bytes(before)
    os.chmod(BACKUP/'review.locations.conf.before',0o644)
    state = {'token':TOKEN,'status':'BACKUP_CREATED','backupUtc':utc(),
             'beforeGuard':guard,'beforeHttp':checks,'archiveSha256':ARCHIVE_HASH,
             'manifestSha256':NEW_MANIFEST,'newRoot':str(NEW),'expectedSnippetSha256':NEW_SNIPPET}
    write_json(BACKUP/'STATE.json',state)
    return state


def upload():
    state = own_state()
    require(state['status'] == 'BACKUP_CREATED', 'unexpected upload state')
    snippet_guard(OLD, OLD_SNIPPET)
    absent(NEW)
    absent(TEMP)
    target = BACKUP/'candidate.tar.gz'
    absent(target)
    with target.open('xb') as output:
        shutil.copyfileobj(sys.stdin.buffer, output, length=1024*1024)
    os.chmod(target,0o644)
    require(target.stat().st_size == 80568959 and sha(target.read_bytes()) == ARCHIVE_HASH,
            'uploaded archive identity mismatch')
    state.update(status='ARCHIVE_UPLOADED',uploadCompletedUtc=utc())
    write_json(BACKUP/'STATE.json',state)
    return {'status':state['status'],'utc':utc(),'archiveSha256':ARCHIVE_HASH,'bytes':80568959}


def stage():
    state = own_state()
    require(state['status'] == 'ARCHIVE_UPLOADED', 'unexpected staging state')
    baseline()
    absent(NEW)
    absent(TEMP)
    archive = BACKUP/'candidate.tar.gz'
    require(sha(archive.read_bytes()) == ARCHIVE_HASH, 'archive drift before extract')
    NEW.mkdir(mode=0o755)
    with tarfile.open(archive,'r:gz') as source:
        for member in source:
            name = PurePosixPath(member.name)
            require(not name.is_absolute() and '..' not in name.parts, 'unsafe archive path')
            require(member.isdir() or member.isfile(), 'nonregular archive entry')
            require(member.uid == member.gid == 0 and member.mode == (0o755 if member.isdir() else 0o644),
                    'unexpected archive metadata')
            target = NEW.joinpath(*name.parts)
            if member.isdir():
                target.mkdir(parents=True,exist_ok=True)
                os.chmod(target,0o755)
            else:
                target.parent.mkdir(parents=True,exist_ok=True)
                with target.open('xb') as output:
                    shutil.copyfileobj(source.extractfile(member),output)
                os.chmod(target,0o644)
    new_m, inv = inventory(NEW,NEW_MANIFEST)
    old_m, _ = inventory(OLD,OLD_MANIFEST)
    old_map = {f['path']:f for f in old_m['published_files']}
    new_map = {f['path']:f for f in new_m['published_files']}
    require([p for p in old_map if old_map[p] != new_map.get(p)] == ['review/index.html'],
            'old browser content changed outside catalog')
    added = set(new_map)-set(old_map)
    require(len(added) == 77 and all(p.startswith('review/r4d/p3-masks/') for p in added), 'unexpected additions')
    state.update(status='STAGED_VERIFIED',stagedUtc=utc(),stagedInventory=inv,unchangedOldBrowserFiles=471)
    write_json(BACKUP/'STATE.json',state)
    return {'status':state['status'],'utc':utc(),'inventory':inv,'unchangedOldBrowserFiles':471}


def atomic_restore(before):
    snippet_guard(NEW,NEW_SNIPPET)
    absent(TEMP)
    require(sha(before) == OLD_SNIPPET, 'rollback bytes mismatch')
    with TEMP.open('xb') as output:
        output.write(before)
    os.chmod(TEMP,0o644)
    os.replace(TEMP,SNIPPET)
    nginx_test()
    p = subprocess.run(['systemctl','reload','nginx'])
    require(p.returncode == 0, 'rollback graceful reload failed')
    snippet_guard(OLD,OLD_SNIPPET)


def switch():
    state = own_state()
    require(state['status'] == 'STAGED_VERIFIED', 'unexpected switch state')
    guard = baseline()
    _, inv = inventory(NEW,NEW_MANIFEST)
    require(sha((BACKUP/'candidate.tar.gz').read_bytes()) == ARCHIVE_HASH, 'archive drift before switch')
    absent(TEMP)
    before = snippet_guard(OLD,OLD_SNIPPET)
    # Fresh exact rollback snapshot and UTC immediately before the atomic operation.
    (BACKUP/'review.locations.conf.before').write_bytes(before)
    os.chmod(BACKUP/'review.locations.conf.before',0o644)
    state.update(preSwitchGuard=guard,rollbackSnapshotRefreshedUtc=utc())
    write_json(BACKUP/'STATE.json',state)
    nginx_test()
    candidate = re.sub(ROOT_PATTERN, lambda m:m[1]+str(NEW).encode()+m[3],before,flags=re.M)
    require(sha(candidate) == NEW_SNIPPET, 'candidate snippet hash mismatch')
    with TEMP.open('xb') as output:
        output.write(candidate)
    os.chmod(TEMP,0o644)
    snippet_guard(OLD,OLD_SNIPPET)
    os.replace(TEMP,SNIPPET)
    switched = utc()
    try:
        nginx_test()
        result = subprocess.run(['systemctl','reload','nginx'])
        require(result.returncode == 0,'graceful reload failed')
        snippet_guard(NEW,NEW_SNIPPET)
    except Exception:
        atomic_restore(before)
        state.update(status='ROLLED_BACK_AFTER_CONFIG_OR_RELOAD_FAILURE',rollbackUtc=utc())
        write_json(BACKUP/'STATE.json',state)
        raise
    state.update(status='PUBLISHED_PENDING_POSTCHECKS',switchUtc=switched,
                 publishedSnippetSha256=NEW_SNIPPET,publishedInventory=inv)
    write_json(BACKUP/'STATE.json',state)
    write_json(BACKUP/'PUBLISHED.json',state)
    return {'status':state['status'],'switchUtc':switched,'root':str(NEW),
            'snippetSha256':NEW_SNIPPET,'nginxTestBeforeAfter':'passed','reload':'graceful',
            'rollbackSnapshotRefreshedUtc':state['rollbackSnapshotRefreshedUtc']}


def postcheck():
    state = own_state()
    require(state['status'] == 'PUBLISHED_PENDING_POSTCHECKS','unexpected postcheck state')
    snippet_guard(NEW,NEW_SNIPPET)
    manifest, inv = inventory(NEW,NEW_MANIFEST)
    _, old_inv = inventory(OLD,OLD_MANIFEST)
    require(subprocess.check_output(['systemctl','is-active','nginx'],text=True).strip() == 'active','nginx inactive')
    paths = ['/review/','/review/r4d/p3-masks/']
    paths += ['/'+f['path'] for f in manifest['published_files'] if f['path'].startswith('review/r4d/p3-masks/')]
    class OldRoutes(html.parser.HTMLParser):
        def __init__(self):
            super().__init__()
            self.paths = set()
        def handle_starttag(self, tag, attrs):
            href = dict(attrs).get('href','')
            if tag == 'a' and href.startswith('/review/r4d/'):
                self.paths.add(href)
    old_routes = OldRoutes()
    old_routes.feed((OLD/'review/index.html').read_text(encoding='utf-8'))
    old_paths = sorted(old_routes.paths)
    paths += old_paths
    checks = [probe(p) for p in paths]
    require(all(x['status'] == 303 for x in checks),'unexpected unauthenticated response')
    foreign = probe('/review/',True)
    dot = probe('/review/.r4d-p3-probe')
    require(foreign['status'] == 403 and dot['status'] == 404,'public protection mismatch')
    for old, new in zip(state['beforeHttp'],[checks[0],foreign,dot]):
        require(old['status'] == new['status'] and old['headers'] == new['headers'],
                'public protection headers drift')
    result = {'utc':utc(),'inventory':inv,'oldInventoryReverified':old_inv,
              'httpChecks':len(checks)+2,'auth303Count':len(checks),'oldRouteAuth303Count':len(old_paths),
              'foreignOrigin403':True,'dotfile404':True,
              'protectionHeadersIdentical':True,'publicJsMimeBodyVerified':False,
              'postAuthUiVerified':False,'limitation':'Unauthenticated requests redirect to existing login; not proof of JS MIME/body/UI.',
              'resources':resources()}
    state.update(status='POSTCHECKS_COMPLETE_AUTH_LIMITATION',postchecks=result)
    write_json(BACKUP/'STATE.json',state)
    write_json(BACKUP/'PUBLISHED.json',state)
    return result


def oldroutes():
    state = own_state()
    require(state['status'] == 'POSTCHECKS_COMPLETE_AUTH_LIMITATION','unexpected remaining-routes state')
    require(state['postchecks']['oldRouteAuth303Count'] == 0,'old route check already completed')
    snippet_guard(NEW,NEW_SNIPPET)
    class Links(html.parser.HTMLParser):
        def __init__(self):
            super().__init__()
            self.paths = set()
        def handle_starttag(self,tag,attrs):
            if tag != 'a':
                return
            href = dict(attrs).get('href','')
            url = urllib.parse.urlsplit(urllib.parse.urljoin('https://superflight.space/review/',href))
            if url.netloc == 'superflight.space' and url.path.startswith('/review/r4d/'):
                self.paths.add(url.path + ('?'+url.query if url.query else ''))
    links = Links()
    links.feed((OLD/'review/index.html').read_text(encoding='utf-8'))
    require(len(links.paths) > 0,'no old R4D routes found')
    for path in sorted(links.paths):
        response = probe(path)
        require(response['status'] == 303 and response['headers'] == state['beforeHttp'][0]['headers'],
                'old route auth/protection mismatch')
    count = len(links.paths)
    state['postchecks']['oldRouteAuth303Count'] = count
    state['postchecks']['httpChecks'] += count
    state['postchecks']['auth303Count'] += count
    state['postchecks']['remainingOldRoutesCompletedUtc'] = utc()
    write_json(BACKUP/'STATE.json',state)
    write_json(BACKUP/'PUBLISHED.json',state)
    return {'utc':utc(),'oldRouteAuth303Count':count,'httpChecks':state['postchecks']['httpChecks'],
            'auth303Count':state['postchecks']['auth303Count'],'protectionHeadersIdentical':True,
            'newPayloadChecksRepeated':False,'productChanged':False}


def document():
    state = own_state()
    require(state['status'] == 'POSTCHECKS_COMPLETE_AUTH_LIMITATION','unexpected documentation state')
    require(state['postchecks']['oldRouteAuth303Count'] > 0,'remaining old route checks incomplete')
    snippet_guard(NEW,NEW_SNIPPET)
    lines = ('\n\n## P3 Masks published — '+state['switchUtc']+'\n\n'
      'Token '+TOKEN+'; Release Engineer release-engineer-r4d-p3-masks-01; CTO cto-r4d-perspective-01.\n'
      'URL https://superflight.space/review/r4d/p3-masks/ ; catalog /review/.\n'
      'Partial research result, NOT full visual/art PASS. MAP-01: common P1 left-5 mapping, seed2818447218/t612 early bounce on visible floor; bad replay preserved.\n'
      'CODE f1aca21e7b9ba19001e7e8762fcaf2511bf9bf74 / ART f899a308aed156a11e2a1013292ed68c6669959d.\n'
      'Frozen manifest e2e9f7d837b3d05f484f75a877af6992a70ee88363add783d80f3c6e206f431f; no rebuild/product edit/new QA.\n'
      'Immutable root '+str(NEW)+'; release manifest '+NEW_MANIFEST+' (107213 bytes); archive '+ARCHIVE_HASH+' (80568959 bytes).\n'
      '549 browser files/88602877 bytes; 550 with manifest/88710090. 471 previous browser files unchanged, only catalog card/count2->3 and77 new P3 files.\n'
      'Fresh full baseline/inventory/modes before first write and before switch; root:root dirs0755/files0644, no symlinks. Old release reverified after switch.\n'
      'Only Review root switched atomically; nginx-t before/after and graceful reload. Snippet '+NEW_SNIPPET+'; normalized '+NORMAL+'.\n'
      +str(state['postchecks']['httpChecks'])+' public HTTPS checks:'+str(state['postchecks']['auth303Count'])+
      ' auth303 (including '+str(state['postchecks']['oldRouteAuth303Count'])+' old R4D routes), foreign Origin403, dotfile404; selected protection headers identical to prewrite. Nginx active.\n'
      'Authenticated public JS MIME/body/UI not verified: existing login barrier. No cookies/credentials/login/auth/MIME/security/services/ports changes.\n'
      'Fresh rollback '+str(BACKUP)+'/review.locations.conf.before ; refreshed UTC '+state['rollbackSnapshotRefreshedUtc']+'. Old root '+str(OLD)+'; old snippet '+OLD_SNIPPET+'.\n'
      'Rollback only while live P3 root/snippet still match ours; restore exact before-snippet via '+str(TEMP)+', atomic replace, nginx-t/graceful reload. Never overwrite later edits, restore sessions DB or remove old releases.\n'
      'P3 remains partial; token/window release is CTO responsibility after delivery handoff.\n')
    docs = [Path('/home/sf/assistant-context/vps/services/superflight-studio.md'),
            Path('/home/sf/assistant-context/vps/CHANGELOG.md')]
    for path in docs:
        require(TOKEN.encode() not in path.read_bytes(), 'documentation token already present at '+str(path))
    hashes = []
    for path in docs:
        with path.open('ab') as output:
            output.write(lines.encode('utf-8'))
            output.flush()
            os.fsync(output.fileno())
        hashes.append({'path':str(path),'sha256':sha(path.read_bytes())})
    state.update(status='PUBLISHED_DELIVERY_VERIFIED_WITH_AUTH_LIMITATION',documentedUtc=utc(),docs=hashes)
    write_json(BACKUP/'STATE.json',state)
    write_json(BACKUP/'PUBLISHED.json',state)
    require(json.loads((BACKUP/'PUBLISHED.json').read_bytes()) == state, 'PUBLISHED readback mismatch')
    return {'status':state['status'],'switchUtc':state['switchUtc'],'documentedUtc':state['documentedUtc'],'docs':hashes,
            'backup':str(BACKUP),'publishedRecordSha256':sha((BACKUP/'PUBLISHED.json').read_bytes()),
            'stateRecordSha256':sha((BACKUP/'STATE.json').read_bytes()),
            'beforeSnapshotSha256':sha((BACKUP/'review.locations.conf.before').read_bytes()),
            'ctowindowReleasedByEngineer':False}


def main(phase):
    functions = {'begin':begin,'upload':upload,'stage':stage,'switch':switch,'postcheck':postcheck,
                 'oldroutes':oldroutes,'document':document}
    try:
        result = functions[phase]()
        print(json.dumps(result,ensure_ascii=False))
    except Exception as error:
        print(json.dumps({'phase':phase,'status':'STOP','reason':str(error)},ensure_ascii=False))
        sys.exit(1)
