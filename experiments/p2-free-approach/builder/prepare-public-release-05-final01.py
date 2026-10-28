"""One C05 local intent, fresh read-only SSH/HTTP; deliberately no execution mode."""
import base64, datetime, hashlib, io, json, os, re, subprocess, sys, tarfile
from pathlib import Path, PurePosixPath

REPO = Path(__file__).resolve().parents[3]
BASE = Path(r'E:\R4D\perspective\p2-runtime\output')
OUT = BASE / 'p2-review-release-intent-05-final-01'
WORK = BASE / 'builder/candidate05-intent-preparation-01'
FROZEN = BASE / 'p2-jungle-static-candidate-05'
OLD = BASE / 'p2-jungle-static-candidate-04'
PREFIX = 'review/r4d/p2-free-approach/'
BUILD = '0367d46211ed170c8840cf702b5ea1cc05f6e430'
START = '3c4ecc72fc436df6252412a34721345c5dc30064'
TURN = '01a183b4-71fd-7b22-8f57-e6da57231b5f'
MF_SHA = 'aa40eea4d51100e157b0bdf32623e874a39777c52be2c801c3dce20285fc4b1b'
OLD_MF_SHA = '60f79d1bdad8d3737376952043013394bb3098de6b15200fc5c352dd875dd1f7'
P2_TREE = '19afaab7ef62e88948419b2fdc38210395ed64acba7aa024d4dc6619d7f6bdec'
P1_TREE = '88e934cab5ce2621cc6ad811b7bc40bcfb5ccce74262a35068654552aeeb99f7'
QA_REF = '74e4a77d1e8fc982d62bfc0cb02237103b2a6f19'
QA_PATH = 'experiments/p2-free-approach/qa/technical/candidate-05-STATIC-01.md'
QA_SHA = 'ccb6812f7283e14042e4cb3150eebb9c28b7e125e05c8793d28ba3ce865ce9b1'
QA_EVIDENCE = BASE / 'technical-qa/candidate-05-static-01/EVIDENCE.json'
QA_EVIDENCE_SHA = '52438e74014edf96c3d8a62dc9e0eeff9a254536b02c65d601570614cfa93eb0'
TARGETS = {
    'lock': '/run/lock/review-p2-candidate-05-public-final01.lock',
    'upload': '/srv/superflight-review/releases/.p2-candidate-05-public-final01.payload.tar',
    'staging': '/srv/superflight-review/releases/.p2-candidate-05-public-final01.stage',
    'newRoot': '/srv/superflight-review/releases/p2-jungle-static-candidate-05',
    'backup': '/opt/superflight-studio/backups/review-p2-candidate-05-public-final01',
    'snippetTemp': '/etc/nginx/snippets/.review-p2-candidate-05-public-final01.locations.conf.tmp',
    'serviceDocTemp': '/home/sf/assistant-context/vps/services/.superflight-studio.p2-candidate-05-public-final01.tmp',
    'changelogTemp': '/home/sf/assistant-context/vps/.CHANGELOG.p2-candidate-05-public-final01.tmp',
}
RECEIPTS = {
    'UI_MODEL_CHECK.json': (1518, '5b8985898e48efc225a9096a3d21b1ff9b2f722e4b3a4fcf73e2675fcf1353bd'),
    'PACKAGE_STATIC_CHECK.json': (1394, 'b45e11838290b03be2ae53990257dac085c937aa6a45b1e69fdbbc9f16ef2472'),
    'C04_C05_DELTA.json': (1555, '7aa01c5ef1dbf21252fe1b0b0a962d1b29d42f2ffd8336e3f8030ba91e842152'),
    'BUILD_RESOURCE_PREFLIGHT.json': (678, '02c29bd56d01194122a8193b4edd94f17d083bc30c06ed5fb79a0fb700c54378'),
}
LIMITS = [
    'Bounded source/artifact/static/privacy and isolated fit/status model review only; no new QA run.',
    'Actual PUBLIC05 black200/live paused resize/browser/GPU/physics/native/Art/Android/download/visibility unverified.',
    'PUBLIC04-UI-01 code/model fix is not actual PUBLIC05 proof; black-frame cause remains inference.',
    'No full Technical/Art/P2 closure; four occluders and existing geometry/art limits unchanged.',
    'C04 token/window released by CTO 2026-10-28T17:18:45Z; no new execution token.',
]
sha = lambda b: hashlib.sha256(b).hexdigest()
jb = lambda x: (json.dumps(x, ensure_ascii=False, indent=2) + '\n').encode()
now = lambda: datetime.datetime.now(datetime.timezone.utc).isoformat()
tree = lambda rows: sha(''.join(f"{r['sha256']} {r['bytes']} {r['path']}\n" for r in sorted(rows, key=lambda r: r['path'])).encode())
simple = lambda row: {k: row[k] for k in ('path', 'bytes', 'sha256')}


def git(*args):
    return subprocess.check_output(['git', *args], cwd=REPO)


def write_new(path, data):
    assert not os.path.lexists(path), f'Occupied owned file: STOP, no overwrite: {path}'
    path.parent.mkdir(parents=True, exist_ok=True)
    with path.open('xb') as f:
        f.write(data)


def resources():
    ps = r"$m=Get-CimInstance Win32_OperatingSystem;$c=Get-CimInstance Win32_Processor|Measure-Object LoadPercentage -Average;[ordered]@{atUtc=[DateTime]::UtcNow.ToString('o');totalRamGiB=$m.TotalVisibleMemorySize/1MB;freeRamGiB=$m.FreePhysicalMemory/1MB;cpuPercent=$c.Average;disks=@(Get-PSDrive -Name C,D,E|ForEach-Object{[ordered]@{name=$_.Name;freeBytes=$_.Free}});ownWorktreeProcesses=@(Get-CimInstance Win32_Process|Where-Object{$_.CommandLine -like '*p2-worktrees\builder*' -and $_.ProcessId -ne $PID}|ForEach-Object{[ordered]@{id=$_.ProcessId;name=$_.Name;parent=$_.ParentProcessId}})}|ConvertTo-Json -Depth 5 -Compress"
    r = json.loads(subprocess.check_output(['powershell', '-NoProfile', '-Command', ps], text=True))
    free = min(d['freeBytes'] for d in r['disks'])
    assert free > 2 * 1024**3, 'At/below 2GiB: safe checkpoint/STOP'
    assert free > 4 * 1024**3, 'At/below 4GiB: diagnose/warn/STOP preparation'
    assert r['freeRamGiB'] > 4.25, 'Aggregate RAM allowance unavailable: STOP'
    assert next(d['freeBytes'] for d in r['disks'] if d['name'] == 'E') > 6.1 * 1024**3
    r.update(ownRamBudgetGiB=.25, ownEDiskBudgetGiB=.1,
             P4MillionkoRamAllowanceGiB=4, P4MillionkoEDiskAllowanceGiB=2,
             aggregatePlannedRamGiB=r['totalRamGiB'] - r['freeRamGiB'] + 4.25,
             futureForeignPeaksNotMeasured=True, processLocalEOnly=True,
             thresholds='<=4GiB warn/diagnose; <=2GiB safe checkpoint/stop')
    return r


def pins():
    raw = (FROZEN / 'BUILD_MANIFEST.json').read_bytes()
    oldraw = (OLD / 'BUILD_MANIFEST.json').read_bytes()
    assert len(raw) == 9013 and sha(raw) == MF_SHA
    assert sha(oldraw) == OLD_MF_SHA
    m, old = json.loads(raw), json.loads(oldraw)
    assert (m['sourceCommit'], m['fileCount'], m['totalBytes'], m['treeSha256']) == (BUILD, 16, 2453059, P2_TREE)
    assert sha((json.dumps(m['files'], ensure_ascii=False, separators=(',', ':')) + '\n').encode()) == P2_TREE
    browser = FROZEN / 'bundle' / PREFIX
    assert sorted(p.relative_to(browser).as_posix() for p in browser.rglob('*') if p.is_file()) == [r['path'] for r in m['files']]
    assert not any(p.is_symlink() for p in browser.rglob('*'))
    for row in m['files']:
        data = (browser / row['path']).read_bytes()
        assert len(data) == row['bytes'] and sha(data) == row['sha256']
        assert not row['path'].endswith(('.ts', '.map'))
    report = git('show', QA_REF + ':' + QA_PATH)
    evidence = QA_EVIDENCE.read_bytes()
    assert len(report) == 13930 and sha(report) == QA_SHA
    assert len(evidence) == 30564 and sha(evidence) == QA_EVIDENCE_SHA
    for name, (size, digest) in RECEIPTS.items():
        data = (BASE / 'builder/candidate05-local-checks-01' / name).read_bytes()
        assert len(data) == size and sha(data) == digest
    return m, old, raw, report, evidence


REMOTE = r'''
import base64,datetime,hashlib,json,os,re,shutil,stat,time,urllib.request,urllib.error
from pathlib import Path
targets=__TARGETS__
expected_p2=__EXPECTED_P2__
sha=lambda b:hashlib.sha256(b).hexdigest()
now=lambda:datetime.datetime.now(datetime.timezone.utc).isoformat()
tree=lambda rows:sha(''.join(f"{r['sha256']} {r['bytes']} {r['path']}\n" for r in sorted(rows,key=lambda r:r['path'])).encode())
def ancestors(p):
 for a in [p,*p.parents]:assert not a.is_symlink(),'Symlink: '+str(a)
def meta(p):
 ancestors(p);s=p.lstat();assert stat.S_ISREG(s.st_mode),str(p)
 b=p.read_bytes();return {'path':str(p),'bytes':len(b),'sha256':sha(b),'mode':oct(stat.S_IMODE(s.st_mode)),'uid':s.st_uid,'gid':s.st_gid,'symlink':False}
def inventory(root):
 fs=[];ds=[]
 for parent,subdirs,names in os.walk(root,followlinks=False):
  p=Path(parent);s=p.lstat();assert stat.S_ISDIR(s.st_mode) and not p.is_symlink()
  ds.append({'path':p.relative_to(root).as_posix(),'mode':oct(stat.S_IMODE(s.st_mode)),'uid':s.st_uid,'gid':s.st_gid,'symlink':False})
  for n in subdirs:assert not (p/n).is_symlink()
  for n in names:
   q=p/n;r=meta(q);r['path']=q.relative_to(root).as_posix();fs.append(r)
 return sorted(fs,key=lambda r:r['path']),sorted(ds,key=lambda r:r['path'])
def target_state():
 rows=[]
 for key,name in targets.items():
  p=Path(name);ancestors(p)
  rows.append({'kind':key,'path':name,'exists':os.path.lexists(p),'parentExists':p.parent.exists(),'ancestorsNoSymlinks':True})
  assert not os.path.lexists(p),'Occupied future target: '+name
 return rows
started=now();ts=target_state()
mem={l.split(':')[0]:int(l.split()[1])*1024 for l in Path('/proc/meminfo').read_text().splitlines() if l.startswith(('MemTotal:','MemAvailable:'))}
free={p:shutil.disk_usage(p).free for p in ['/srv/superflight-review/releases','/opt/superflight-studio/backups']}
assert min(free.values())>4*1024**3,'VPS disk threshold: diagnose/STOP'
assert mem['MemAvailable']>512*1024**2,'VPS RAM low: STOP'
cpu0=[int(v) for v in Path('/proc/stat').read_text().splitlines()[0].split()[1:]]
time.sleep(.25)
cpu1=[int(v) for v in Path('/proc/stat').read_text().splitlines()[0].split()[1:]]
delta=[b-a for a,b in zip(cpu0,cpu1)];total=sum(delta[:8]);idle=delta[3]+delta[4]
paths=[Path(p) for p in ['/etc/nginx/snippets/review.locations.conf','/etc/nginx/conf.d/superflight-studio.conf','/etc/nginx/mime.types','/home/sf/assistant-context/vps/services/superflight-studio.md','/home/sf/assistant-context/vps/CHANGELOG.md']]
before=[meta(p) for p in paths]
snippet=paths[0].read_bytes();text=snippet.decode('utf-8');assert 'auth_request' not in text
roots=re.findall(r'^\s*root\s+([^;]+);',text,re.M);assert len(roots)==1
root=Path(roots[0]);ancestors(root)
assert str(root).startswith('/srv/superflight-review/releases/') and root.resolve()==root
assert snippet.count(('root '+str(root)+';').encode())==1
fs,ds=inventory(root)
assert all(r['uid']==r['gid']==0 and r['mode']=='0o644' for r in fs)
assert all(r['uid']==r['gid']==0 and r['mode']=='0o755' for r in ds)
own=[{'path':r['path'][len('review/r4d/p2-free-approach/'):],'bytes':r['bytes'],'sha256':r['sha256']} for r in fs if r['path'].startswith('review/r4d/p2-free-approach/')]
assert own==expected_p2,'Unexpected current P2 delta: STOP Root/CTO'
p1=[r for r in fs if r['path'].startswith('review/r4d/p1-mapping-report/')]
assert len(p1)==12 and sum(r['bytes'] for r in p1)==2057712 and tree(p1)=='88e934cab5ce2621cc6ad811b7bc40bcfb5ccce74262a35068654552aeeb99f7','P1 preservation mismatch'
manifest=(root/'RELEASE_MANIFEST.json').read_bytes();m=json.loads(manifest)
published=[{k:r[k] for k in ['path','bytes','sha256']} for r in fs if r['path']!='RELEASE_MANIFEST.json']
assert m['schema_version']==1 and len(m['published_files'])==len(published)
assert {r['path']:r for r in m['published_files']}=={r['path']:r for r in published},'Current root manifest inconsistent'
assert m['published_file_count']==len(published) and m['published_bytes']==sum(r['bytes'] for r in published)
catalog=(root/'review/index.html').read_bytes()
docs={str(p):base64.b64encode(p.read_bytes()).decode() for p in paths[3:]}
class NoRedirect(urllib.request.HTTPRedirectHandler):
 def redirect_request(self,*a,**k):return None
opener=urllib.request.build_opener(NoRedirect());http=[]
rels=['review/index.html','review/r4d/p2-free-approach/index.html','review/r4d/p1-mapping-report/index.html','review/r4d/p2-free-approach/src/main.js']
urls=['https://superflight.space/review/','https://superflight.space/review/r4d/p2-free-approach/','https://superflight.space/review/r4d/p1-mapping-report/','https://superflight.space/review/r4d/p2-free-approach/src/main.js']
for url,rel in zip(urls,rels):
 try:
  try:res=opener.open(urllib.request.Request(url,headers={'User-Agent':'R4D-P2-C05-local-intent-readonly'},method='GET'),timeout=20)
  except urllib.error.HTTPError as e:res=e
  with res:
   b=res.read();expected=next(r for r in fs if r['path']==rel)
   http.append({'url':url,'path':rel,'status':res.code,'bytes':len(b),'sha256':sha(b),'matchesCurrentFile':len(b)==expected['bytes'] and sha(b)==expected['sha256'],'headers':{k:res.headers.get(k) for k in ['Location','Content-Type','Cache-Control','X-Robots-Tag','X-Content-Type-Options','Referrer-Policy','X-Frame-Options']}})
 except urllib.error.URLError as e:http.append({'url':url,'path':rel,'technicalError':str(e),'status':None})
after=[meta(p) for p in paths];fs2,ds2=inventory(root);ts2=target_state()
assert before==after and fs==fs2 and ds==ds2 and ts==ts2,'Incoherent/drift during read: STOP'
assert all(sha(base64.b64decode(docs[str(p)]))==next(r['sha256'] for r in after if r['path']==str(p)) for p in paths[3:])
print(json.dumps({'startedAtUtc':started,'finishedAtUtc':now(),'server_writes':0,'cookiesUsed':False,'authUsed':False,'redirectsFollowed':False,'actualRoot':str(root),'before':before,'after':after,'files':fs,'directories':ds,'filesAfter':fs2,'directoriesAfter':ds2,'fullInventoryStableDuringRead':True,'rootManifestConsistent':True,'targets':ts,'P2ExactFrozen04':True,'P1Exact12':True,'reviewAuthRequestAbsent':True,'snippetBase64':base64.b64encode(snippet).decode(),'catalogBase64':base64.b64encode(catalog).decode(),'releaseManifestBase64':base64.b64encode(manifest).decode(),'docsBase64':docs,'http':http,'vpsResources':{'atUtc':now(),'memoryBytes':mem,'cpuPercent':100*(total-idle)/total if total else 0,'loadAverage':list(os.getloadavg()),'freeDiskBytes':free},'privateVhostBytesCopied':False,'foreignProductBytesInspected':False},ensure_ascii=False))
'''


def read_remote(old, receipt_name):
    expected = [simple(r) for r in old['files']]
    code = REMOTE.replace('__TARGETS__', repr(TARGETS)).replace('__EXPECTED_P2__', repr(expected))
    p = subprocess.run(['ssh', '-o', 'BatchMode=yes', '-o', 'ConnectTimeout=15', 'vps1-direct',
                        'sudo -n python3 -B -'], input=code.encode(), capture_output=True, timeout=150)
    write_new(WORK / (receipt_name + '.stderr.log'), p.stderr)
    if p.returncode:
        raise RuntimeError('Read-only SSH technical/guard failure; STOP. ' + p.stderr.decode('utf-8', errors='replace'))
    b = json.loads(p.stdout)
    write_new(WORK / (receipt_name + '.json'), jb(b))
    assert all(r.get('status') == 200 and r.get('matchesCurrentFile') for r in b['http']), 'HTTP technical/status/hash failure; recorded, STOP; no race inferred'
    return b


def snapshot():
    assert not os.path.lexists(OUT) and not os.path.lexists(WORK), 'Occupied target/checkpoint: STOP, no overwrite/renumber'
    assert not git('status', '--porcelain'), 'Commit preparation helper first'
    host = resources()
    m, old, *_ = pins()
    assert not os.path.lexists(OUT) and not os.path.lexists(WORK)
    WORK.mkdir(); (WORK / 'tmp').mkdir()
    os.environ['TEMP'] = os.environ['TMP'] = str(WORK / 'tmp')
    os.environ['PYTHONDONTWRITEBYTECODE'] = '1'
    owner = {'turn': TURN, 'checkpointAtStart': START, 'preparationSourceCommit': git('rev-parse', 'HEAD').decode().strip(),
             'helperSha256': sha(Path(__file__).read_bytes()), 'createdAtUtc': now(), 'phase': 'OWNED_READ_ONLY_SNAPSHOT', 'server_writes': 0}
    write_new(WORK / 'LOCAL_OWNERSHIP.json', jb(owner))
    write_new(WORK / 'HOST_RESOURCES.json', jb(host))
    b = read_remote(old, 'ACTUAL_PUBLIC_INITIAL')
    write_new(WORK / 'BASELINE_COMPLETE.json', jb({'turn': TURN, 'phase': 'BASELINE_COMPLETE', 'baselineSha256': sha(jb(b)), 'server_writes': 0}))
    print(json.dumps({'phase': 'READ_ONLY_BASELINE_COMPLETE', 'turn': TURN, 'actualRoot': b['actualRoot'], 'files': len(b['files']),
                      'directories': len(b['directories']), 'bytes': sum(r['bytes'] for r in b['files']), 'treeSha256': tree(b['files']),
                      'baselineBytes': len(jb(b)), 'baselineSha256': sha(jb(b)), 'startedAtUtc': b['startedAtUtc'], 'finishedAtUtc': b['finishedAtUtc'],
                      'http': b['http'], 'vpsResources': b['vpsResources'], 'hostResources': host, 'server_writes': 0}, ensure_ascii=False))


def execution_plan(i):
    t, b, p = i['targets'], i['baseline'], i['planned']
    lines = '\n'.join('- ' + k + ': `' + v + '`' for k, v in t.items())
    return f'''# C05 PUBLIC final01 — LOCAL preparation only

server_writes=0; executionAuthorized=false. Helper has snapshot/seal only, no deployment mode.
Нужен НОВЫЙ exact CTO token ПОСЛЕ Root/CTO review immutable intent/plan/sealed/archive.
Token должен bind exact финальные hashes и все восемь names ниже. Literal token/nonce
не хранить в Git/public. C04 token/window CTO освободил 2026-10-28T17:18:45Z.
Ни этот packet, ни independent static QA сами не разрешают VPS writes.

Build/source/implementation {BUILD}; frozen manifest {MF_SHA}; 16files/2453059bytes/
{P2_TREE}. Preparation helper HEAD {i['preparationSourceCommit']} не заменяет build pin.
Independent TQA {QA_REF}, report {QA_SHA}, evidence {QA_EVIDENCE_SHA}; source/model/
artifact/privacy only. Actual PUBLIC05/black200/live paused resize/browser/GPU/physics/
native/Art/Android/download/visibility unverified; full Technical/Art/P2 closure нет.
Новых QA/SDK/сборок/Artist/VQA/TQA назначений этот план не делает.

## Exact future write-set (СЕЙЧАС НЕ ВЫПОЛНЯЕТСЯ)

{lines}

Только atomic replace /etc/nginx/snippets/review.locations.conf через exact snippetTemp;
append-only service /home/sf/assistant-context/vps/services/superflight-studio.md и
/home/sf/assistant-context/vps/CHANGELOG.md через два exact doc temps. Никаких иных
names, installs/global settings/ports/vhost/MIME/security/auth/history/DB/session writes.
Private backup allowlist: fresh snippet/docs before + exact intent/plan/guard/payload/
pre-switch/postchecks/render/docs receipt и conditional rollback receipts. Не копировать
whole private vhost/security/history/DB/session/foreign app sources. Внутренние backup
names также фиксируются exact новым CTO gate, без произвольных дополнительных файлов.

## Fresh gate и phases после нового exact token

1. Перед ЛЮБЫМ write, включая lock: fresh host+VPS RAM/CPU/disk/aggregate, own0.25GiB
RAM/0.1GiB E + P4/Millionko allowance4GiB RAM/2GiB E. <=4GiB warn/diagnose,
<=2GiB safe checkpoint/STOP; чужие PID/files не трогать. Process-local E TEMP/TMP,
Python -Xutf8/-B locally, remote -B; no install/global config.
2. Новый coherent RAW read: snippet/root/vhost/globalMIME/docs metadata+bytes/hash,
двойной full old files+dirs/bytes/SHA/uid/gid/mode/no symlinks и root-manifest consistency,
PUBLIC no-cookie catalog/P2/P1/JS, все8targets absent+ancestors. Exact match sealed
baseline {b['sha256']}, root {b['actualRoot']}; dated receipt не execution guard.
Любой drift/incoherence/occupied target/ownership/security ambiguity => STOP Root/CTO,
без adaptation/rebase/rename/номер02/normalized guard. HTTP technical failure отдельно,
не объявлять race. Policy denial => exact call/action/target/reason и STOP операции/
same-target обходов; не повторять через другого actor/browser/server/device/model.
3. Только после gate exclusive own lock c intent hash/nonce/inode; phase journal,
проверка nonce/inode/phase перед каждым write, guards повторно под lock. Fresh backup
только allowlist. Upload в absent exact path; verify archive bytes/SHA,18 exact safe
regular entries/no abs/traversal/link/special/extra. Не extract без проверки.
4. Stage из opaque inherited CURRENT baseline separate-inode copy (никаких hardlinks/
symlinks old→stage), preserve foreign/P1 files+dirs uid/gid/modes/bytes exact. Исключить
старый P2 subtree целиком/catalog/rootmanifest; добавить18payload leaves. Own P2 ровно16,
без stale leaves. Full planned inventory {p['inventorySha256']}, {p['files']}files/
{p['directories']}dirs/{p['bytes']}bytes/tree {p['treeSha256']}; digest rule в inventory.
Root manifest САМ исключён из published_files, включён в full planned inventory.
Old root неизменён. Final absent; stage→final atomic NOREPLACE; no overwrite/fallback rename.
5. Снова raw guards/oldroot/owned lock phase. Fresh PUBLIC rollback snippet/docs before
непосредственно перед switch; exact hash/uid/gid/mode; не protected history/template.
nginx -t до switch. Ровно один raw `root {b['actualRoot']};` literal replacement на
`root {t['newRoot']};`; каждый другой byte идентичен, no root-normalized comparison.
Exact temp file with original snippet uid/gid/mode + atomic replace, nginx -t после,
graceful reload и active. Любой чужой drift => STOP без overwrite/adaptation.
6. Actual serving: no-cookie catalog и все16P2 HTTP200/exactbytes/SHA/MIME/security
headers; full new inventory/rootmanifest and all foreign/P1 files+dirs/metadata exact,
P1 all12/tree{P1_TREE}, catalog ровно existing P2card/count unchanged; oldroot,
vhost/globalMIME/config unchanged. Capture fact receipts, no new PASS inference.
7. ПОСЛЕ actual serving+checks STOP docs/cleanup с OWNED LOCK HELD. Адресный actual
PUBLIC05 runtime QA CTO даст отдельно; сейчас никого не будить. Unverified render
сам по себе не автоматический blocker/rollback. Shared window не освобождать самому.
8. Только отдельное continuation same token: honest actual render receipt (включая
limitations/failures), guarded append-only docs using CURRENT exact byte-prefix/
length/SHA/uid/gid/mode, actual observed values; preserve whole prefix and metadata.
Не нормализовать/перегенерировать чужие docs. Final full guards/checks и cleanup только
своих matching nonce/inode/phase artifacts/lock. Shared window release только explicit CTO.

## Conditional current PUBLIC rollback

Только в будущем exact token/CTO scope, при owned live exact after snippet/root и
неизменных oldroot/vhost/globalMIME. Restore лишь fresh captured CURRENT before snippet
bytes/metadata, nginx -t/graceful reload/active/public checks; docs не откатывать из
history/template, допустим только exact authorized rollback append. При чужом drift
STOP без overwrite. Protected history/auth/template/session restore запрещён.

После LOCAL handoff STOP Root/CTO review. Token/execution/delivery сейчас отсутствуют.
'''


def documentation_template(i):
    return f'''# Future private append-only docs template — LOCAL ONLY

VPS writes0. Только future separate continuation SAME new exact token ПОСЛЕ serving,
all16HTTP/full-preservation checks и separately authorized actual PUBLIC05 runtime QA.
Before append: fresh current byte-prefix/length/SHA/uid/gid/mode must exactly match
sealed baseline + any explicitly gated prior append; drift => STOP. Original prefix
opaque, preserve every byte; append newline only as new suffix. No old content rewrite.
Render unverified не automatic blocker/rollback. Не писать literal token/nonce.

## Service doc suffix (placeholders must be actual facts)

### {{{{ACTUAL_UTC}}}} · P2 candidate05 limited PUBLIC delivery

Authorization receipt {{{{EXACT_GATE_ID_WITHOUT_TOKEN}}}}, implementation/build {BUILD},
frozen manifest {MF_SHA}, 16files/2453059bytes/tree{P2_TREE}; preparation turn {TURN}.
Independent source/model/static TQA {QA_REF}, report{QA_SHA}/evidence{QA_EVIDENCE_SHA}.
Actual switch/root/nginx/active {{{{OBSERVED_DELIVERY}}}}. Archive {i['archive']['sha256']}.
All16HTTP/hash/MIME/security headers {{{{HTTP_RECEIPT}}}}; full inventory/P1/foreign/
oldroot/vhost/globalMIME preservation {{{{EXACT_PRESERVATION_RECEIPT}}}}.
Addressed actual PUBLIC05 runtime QA {{{{ACTUAL_RENDER_RECEIPT_AND_LIMITATIONS}}}}.
Static/model facts do not imply actual black200/GPU/Art/Android/download/visibility fix.
No full Technical/Art/P2 closure without independent evidence. Four occluders unchanged.
Fresh current PUBLIC rollback/private receipts {TARGETS['backup']}; protected history
not restored. Lock/phase/window {{{{ACTUAL_OWNED_CLEANUP_AND_EXPLICIT_CTO_RELEASE}}}}.

## CHANGELOG suffix

- {{{{ACTUAL_UTC}}}} P2 candidate05 limited PUBLIC update; source {BUILD}, exact16files,
  manifest{MF_SHA}, static/model independent review only. Delivery/HTTP/preservation
  {{{{ACTUAL_RECEIPTS}}}}; actual render {{{{OBSERVED_FACTS_AND_UNVERIFIED_LIMITS}}}}.
  Current PUBLIC root-only switch; original docs byte-prefix/uid/gid/mode preserved.

Сейчас это шаблон, НЕ результат delivery/QA/docs. Literal token не публикуется.
'''


def seal():
    assert not os.path.lexists(OUT), 'Occupied immutable target: STOP; no overwrite/renumber'
    assert not git('status', '--porcelain'), 'Dirty preparation checkout: STOP'
    owner = json.loads((WORK / 'LOCAL_OWNERSHIP.json').read_bytes())
    head = git('rev-parse', 'HEAD').decode().strip()
    assert owner['turn'] == TURN and owner['preparationSourceCommit'] == head and owner['helperSha256'] == sha(Path(__file__).read_bytes())
    assert json.loads((WORK / 'BASELINE_COMPLETE.json').read_bytes())['phase'] == 'BASELINE_COMPLETE'
    os.environ['TEMP'] = os.environ['TMP'] = str(WORK / 'tmp')
    os.environ['PYTHONDONTWRITEBYTECODE'] = '1'
    host = resources(); m, old, mraw, report, evidence = pins()
    b0 = json.loads((WORK / 'ACTUAL_PUBLIC_INITIAL.json').read_bytes())
    b = read_remote(old, 'ACTUAL_PUBLIC_FINAL')
    for key in ('actualRoot', 'before', 'after', 'files', 'directories', 'filesAfter', 'directoriesAfter', 'targets', 'snippetBase64', 'catalogBase64', 'releaseManifestBase64', 'docsBase64'):
        assert b[key] == b0[key], 'Baseline drift since initial read: STOP, no adaptation: ' + key
    packet = {}
    def add(name, data):
        assert name not in packet
        packet[name] = data
    add('HOST_RESOURCES.json', (WORK / 'HOST_RESOURCES.json').read_bytes())
    add('PACKAGE_RESOURCES.json', jb(host))
    add('baseline/ACTUAL_PUBLIC_INITIAL.json', jb(b0)); add('baseline/ACTUAL_PUBLIC.json', jb(b))
    for key, name in [('snippetBase64', 'review.locations.conf.before'), ('catalogBase64', 'catalog.before.html'), ('releaseManifestBase64', 'RELEASE_MANIFEST.before.json')]:
        add('baseline/' + name, base64.b64decode(b[key]))
    for path, data in b['docsBase64'].items():
        add('baseline/' + ('service.before.bytes' if '/services/' in path else 'CHANGELOG.before.bytes'), base64.b64decode(data))
    add('audit/TQA_REPORT.md', report); add('audit/TQA_EVIDENCE.json', evidence)
    add('audit/FROZEN_BUILD_MANIFEST.json', mraw)
    for name in RECEIPTS:
        add('audit/' + name, (BASE / 'builder/candidate05-local-checks-01' / name).read_bytes())
    qa = {'commit': QA_REF, 'leadAcceptedCommit': '926f43185ab032d3e8d4f78b48caff46a4831a7d',
          'turn': '01a183a5-80d3-7a82-aa69-080d38fa9801', 'path': QA_PATH, 'reportBytes': len(report), 'reportSha256': QA_SHA,
          'evidenceBytes': len(evidence), 'evidenceSha256': QA_EVIDENCE_SHA, 'scope': 'independent bounded source/artifact/privacy/fit-status VM model; no new actionable defects',
          'newQaRun': False, 'actualPublic05Verified': False, 'fullTechnicalPass': False, 'artPass': False, 'p2Closure': False}
    own = []
    for row in m['files']:
        dest = PREFIX + row['path']; data = (FROZEN / 'bundle' / dest).read_bytes()
        add('payload/' + dest, data); own.append(simple(dict(row, path=dest)))
    scanner = REPO / 'experiments/p2-free-approach/builder/scripts/scan-browser-text.mjs'
    assert scanner.read_text(encoding='utf-8').replace('\r\n', '\n').encode() == git('show', BUILD + ':experiments/p2-free-approach/builder/scripts/scan-browser-text.mjs')
    scan_code = "import{readFileSync}from'node:fs';import{pathToFileURL}from'node:url';const{scanBrowserText}=await import(pathToFileURL(process.argv[1]));const m=JSON.parse(readFileSync(process.argv[2]));const rows=m.files.filter(x=>/\\.(js|mjs|json|html|css|txt)$/.test(x.path)).map(x=>({path:x.path,...scanBrowserText(x.path,readFileSync(process.argv[3]+'/'+x.path))}));if(rows.some(x=>x.violations.length))throw Error(JSON.stringify(rows));console.log(JSON.stringify({scope:'packaging privacy scan only; no product execution',files:rows,productExecuted:false,newQaRun:false}));"
    scan = subprocess.check_output([r'D:\nodejs\node.exe', '--max-old-space-size=96', '--input-type=module', '-e', scan_code,
                                    str(scanner), str(FROZEN / 'BUILD_MANIFEST.json'), str(FROZEN / 'bundle' / PREFIX)], cwd=REPO)
    add('audit/PAYLOAD_PRIVACY.json', jb(json.loads(scan)))
    catalog = packet['baseline/catalog.before.html']
    previous_catalog = (BASE / 'p2-review-release-intent-04-final-03/payload/review/index.html').read_bytes()
    pattern = rb'<a class="card" href="\./r4d/p2-free-approach/">.*?</a>'
    current_cards, accepted_cards = re.findall(pattern, catalog, re.S), re.findall(pattern, previous_catalog, re.S)
    assert len(current_cards) == len(accepted_cards) == 1 and current_cards[0] == accepted_cards[0], 'Unexpected P2 card change: STOP'
    card_before = current_cards[0]
    card_after = card_before.replace('Пробный candidate-04:'.encode(), 'Пробный candidate-05:'.encode(), 1)
    old_scope = 'Независимая offline QA подтвердила clock/replay/state/history. Actual UI/Pixi/WebGL, wall-time, DOM download и Android не проверены; качество движения и художественная приёмка не подтверждены.'.encode()
    new_scope = 'Candidate-05 исправляет размеры viewport и подсказку завершения. Независимая проверка исходников, артефакта и модели fit/status не выявила новых дефектов. Actual PUBLIC05, чёрный кадр при 200%, browser/GPU, Android, download и visibility не проверены; полной технической и художественной приёмки нет.'.encode()
    assert card_before.count('Пробный candidate-04:'.encode()) == 1 and card_after.count(old_scope) == 1
    card_after = card_after.replace(old_scope, new_scope, 1)
    updated = catalog.replace(card_before, card_after, 1)
    assert updated.replace(card_after, card_before, 1) == catalog
    p1pattern = rb'<a class="card" href="\./r4d/p1-mapping-report/">.*?</a>'
    p1cards = re.findall(p1pattern, catalog, re.S)
    assert len(p1cards) == 1 and p1cards == re.findall(p1pattern, previous_catalog, re.S) == re.findall(p1pattern, updated, re.S)
    counters = re.findall(rb'<span>\d+ [^<]+</span>', catalog)
    assert len(counters) == 1 and counters == re.findall(rb'<span>\d+ [^<]+</span>', updated)
    add('payload/review/index.html', updated)
    catalog_delta = {'changedOnly': 'exact existing P2 card; every other byte preserved', 'beforeBytes': len(catalog), 'beforeSha256': sha(catalog),
                     'afterBytes': len(updated), 'afterSha256': sha(updated), 'cardBefore': card_before.decode(), 'cardAfter': card_after.decode(),
                     'counterBytes': counters[0].decode(), 'counterUnchanged': True, 'P1CardUnchanged': True, 'exactInverse': True}
    add('audit/CATALOG_DELTA.json', jb(catalog_delta))
    inherited_full = [r for r in b['files'] if not r['path'].startswith(PREFIX) and r['path'] not in ('review/index.html', 'RELEASE_MANIFEST.json')]
    inherited = [simple(r) for r in inherited_full]
    p1 = [r for r in inherited if r['path'].startswith('review/r4d/p1-mapping-report/')]
    assert len(p1) == 12 and sum(r['bytes'] for r in p1) == 2057712 and tree(p1) == P1_TREE
    published = sorted(inherited + own + [{'path': 'review/index.html', 'bytes': len(updated), 'sha256': sha(updated)}], key=lambda r: r['path'])
    assert len({r['path'] for r in published}) == len(published)
    public_qa = {k: v for k, v in qa.items() if k not in ('path', 'turn', 'leadAcceptedCommit')}
    release = {'schema_version': 1, 'release_id': 'p2-jungle-static-candidate-05-public-final01', 'path_prefix': '/review/',
               'publication_note': 'Proposed limited C05 source/model/static-reviewed update; actual PUBLIC05 runtime/black200/GPU/art unverified; no full acceptance.',
               'preparedAtUtc': b['finishedAtUtc'], 'preparationSourceCommit': head, 'previous_release': b['actualRoot'],
               'previous_manifest': simple(next(r for r in b['files'] if r['path'] == 'RELEASE_MANIFEST.json')),
               'p2': {'buildCommit': BUILD, 'implementationCommit': BUILD, 'frozenManifestSha256': MF_SHA, 'files': 16, 'bytes': 2453059, 'treeSha256': P2_TREE, 'qa': public_qa},
               'preservation': {'opaqueForeignFiles': len(inherited), 'P1Files': 12, 'P1Bytes': 2057712, 'P1OpaqueTreeSha256': P1_TREE, 'catalogCounterUnchanged': True},
               'published_file_count': len(published), 'published_bytes': sum(r['bytes'] for r in published), 'published_files': published}
    add('payload/RELEASE_MANIFEST.json', jb(release))
    full = sorted(published + [{'path': 'RELEASE_MANIFEST.json', 'bytes': len(jb(release)), 'sha256': sha(jb(release))}], key=lambda r: r['path'])
    dirs = {r['path']: r for r in b['directories'] if r['path'] != PREFIX.rstrip('/') and not r['path'].startswith(PREFIX)}
    for row in full:
        parent = PurePosixPath(row['path']).parent
        while parent.as_posix() != '.':
            name = parent.as_posix(); dirs.setdefault(name, {'path': name, 'mode': '0o755', 'uid': 0, 'gid': 0, 'symlink': False}); parent = parent.parent
    planned_files = [dict(r, mode='0o644', uid=0, gid=0, symlink=False) for r in full]
    planned = {'files': planned_files, 'directories': sorted(dirs.values(), key=lambda r: r['path']), 'fileCount': len(full), 'directoryCount': len(dirs),
               'totalBytes': sum(r['bytes'] for r in full), 'treeSha256': tree(full), 'digestRule': 'SHA256(sorted UTF-8 lines: sha256 + SPACE + decimal bytes + SPACE + POSIX relative path + LF); root manifest included; metadata exact via inventory JSON',
               'rootManifestExcludedFromPublishedFiles': True, 'plannedInventoryDigestRule': 'SHA256(exact PLANNED_INVENTORY.json bytes including LF)'}
    add('PLANNED_INVENTORY.json', jb(planned))
    assert all(next(r for r in planned_files if r['path'] == oldrow['path']) == oldrow for oldrow in inherited_full)
    foreign_dirs = [r for r in b['directories'] if r['path'] != PREFIX.rstrip('/') and not r['path'].startswith(PREFIX)]
    assert all(dirs[r['path']] == r for r in foreign_dirs)
    before = packet['baseline/review.locations.conf.before']
    old_literal, new_literal = ('root ' + b['actualRoot'] + ';').encode(), ('root ' + TARGETS['newRoot'] + ';').encode()
    assert before.count(old_literal) == 1 and b'auth_request' not in before
    after = before.replace(old_literal, new_literal, 1)
    assert after.replace(new_literal, old_literal, 1) == before
    add('plan/review.locations.conf.after', after)
    preservation = {'foreignFiles': len(inherited), 'foreignDirectories': len(foreign_dirs), 'foreignFileRowsExactIncludingMetadata': True, 'foreignDirectoryRowsExact': True,
                    'P1Files': 12, 'P1Bytes': 2057712, 'P1TreeSha256': P1_TREE, 'P1CardExact': True, 'catalogOtherBytesExactInverse': True, 'counterUnchanged': True,
                    'oldP2ExactFrozen04': True, 'newP2ExactFrozen05': True, 'newP2Files': 16, 'newP2Bytes': 2453059, 'newP2NoStaleLeaves': True,
                    'foreignProductBytesInspected': False, 'foreignRecipesUsed': False, 'hardlinksOrSymlinksPlanned': False, 'newQaRun': False, 'productExecuted': False, 'server_writes': 0}
    add('audit/PRESERVATION_PROOF.json', jb(preservation))
    payload_rows = []
    tar_buffer = io.BytesIO()
    with tarfile.open(fileobj=tar_buffer, mode='w', format=tarfile.USTAR_FORMAT) as archive:
        for name in sorted(n for n in packet if n.startswith('payload/')):
            rel, data = name[len('payload/'):], packet[name]
            assert not rel.startswith('/') and '..' not in PurePosixPath(rel).parts and '\\' not in rel
            t = tarfile.TarInfo(rel); t.size = len(data); t.mode = 0o644; t.uid = t.gid = 0; t.mtime = 0
            archive.addfile(t, io.BytesIO(data)); payload_rows.append({'path': rel, 'bytes': len(data), 'sha256': sha(data)})
    archive_raw = tar_buffer.getvalue()
    assert len(payload_rows) == 18 and {r['path'] for r in payload_rows} == {r['path'] for r in own} | {'review/index.html', 'RELEASE_MANIFEST.json'}
    with tarfile.open(fileobj=io.BytesIO(archive_raw), mode='r:') as archive:
        members = archive.getmembers(); assert [t.name for t in members] == [r['path'] for r in payload_rows]
        for t, row in zip(members, payload_rows):
            assert t.isfile() and not t.issym() and not t.islnk() and t.size == row['bytes'] and sha(archive.extractfile(t).read()) == row['sha256']
    archive_name = 'p2-candidate-05-public-final01.payload.tar'
    add(archive_name, archive_raw)
    add('audit/ARCHIVE_ALLOWLIST.json', jb({'regularLeaves': 18, 'files': payload_rows, 'rootManifestOutsideReview': True, 'noLinksSpecialExtraTraversal': True, 'deltaNotStandalone': True}))
    intent = {'schema': 'r4d.p2.public-release-intent.c05.final01', 'status': 'IMMUTABLE_LOCAL_AWAIT_ROOT_CTO_REVIEW_NEW_EXACT_TOKEN',
              'server_writes': 0, 'server_write': False, 'executionAuthorized': False, 'newExactCtoTokenRequired': True, 'C04WindowReleasedAtUtc': '2026-10-28T17:18:45Z',
              'actualTurnId': TURN, 'firstCompletedReadOnlyAction': '2026-10-28T18:10:19Z own clean checkout/status/branch/HEAD + local target absence/resources',
              'checkpointAtStart': START, 'preparationSourceCommit': head, 'preparationHelperSha256': sha(Path(__file__).read_bytes()),
              'buildCommit': BUILD, 'implementationCommit': BUILD, 'frozenManifestBytes': 9013, 'frozenManifestSha256': MF_SHA, 'frozenFiles': 16, 'frozenBytes': 2453059, 'frozenTreeSha256': P2_TREE,
              'qa': qa, 'baseline': {'path': 'baseline/ACTUAL_PUBLIC.json', 'bytes': len(jb(b)), 'sha256': sha(jb(b)), 'startedAtUtc': b['startedAtUtc'], 'finishedAtUtc': b['finishedAtUtc'],
                                    'actualRoot': b['actualRoot'], 'files': len(b['files']), 'directories': len(b['directories']), 'bytesTotal': sum(r['bytes'] for r in b['files']), 'treeSha256': tree(b['files']),
                                    'rawGuards': b['before'], 'targets': b['targets'], 'newFreshRawGuardsRequiredBeforeAnyWriteIncludingLock': True},
              'targets': TARGETS, 'archive': {'path': archive_name, 'bytes': len(archive_raw), 'sha256': sha(archive_raw), 'regularLeaves': 18, 'semantics': 'delta over exact opaque CURRENT baseline; not standalone full tree'},
              'planned': {'inventoryPath': 'PLANNED_INVENTORY.json', 'inventorySha256': sha(jb(planned)), 'files': len(full), 'directories': len(dirs), 'bytes': planned['totalBytes'], 'treeSha256': planned['treeSha256'],
                          'manifestBytes': len(jb(release)), 'manifestSha256': sha(jb(release)), 'opaqueForeignFiles': len(inherited)},
              'snippet': {'beforeBytes': len(before), 'beforeSha256': sha(before), 'afterBytes': len(after), 'afterSha256': sha(after), 'oneRawRootLiteralOnly': True},
              'catalog': catalog_delta, 'limitations': LIMITS, 'newQaRun': False, 'notPublished': True}
    plan, template = execution_plan(intent).encode(), documentation_template(intent).encode()
    add('EXECUTION_PLAN.md', plan); add('DOCUMENTATION_APPEND_TEMPLATE.md', template)
    intent.update(executionPlanBytes=len(plan), executionPlanSha256=sha(plan), documentationTemplateBytes=len(template), documentationTemplateSha256=sha(template))
    add('RELEASE_INTENT.json', jb(intent))
    add('LOCAL_OWNERSHIP.json', jb(dict(owner, phase='LOCAL_PACKET_OWNER_SEAL_IS_COMPLETION_MARKER', finalTarget=str(OUT))))
    sealed = {'status': 'LOCAL_PACKET_VALIDATED_NOT_AUTHORIZED', 'actualTurnId': TURN, 'server_writes': 0, 'newExactCtoTokenRequired': True, 'newQaRun': False,
              'files': [{'path': n, 'bytes': len(data), 'sha256': sha(data)} for n, data in sorted(packet.items())], 'sealExcludesItself': True}
    add('SEALED_PACKET.json', jb(sealed))
    assert sum(len(data) for data in packet.values()) < .1 * 1024**3, 'Own E output budget exceeded'
    pins()  # final frozen rehash; never rebuild or import product
    assert not os.path.lexists(OUT), 'Final absence check: occupied => STOP'
    OUT.mkdir()
    for name, data in packet.items():
        write_new(OUT / name, data)
    assert sorted(p.relative_to(OUT).as_posix() for p in OUT.rglob('*') if p.is_file()) == sorted(packet)
    assert not any(p.is_symlink() for p in OUT.rglob('*'))
    for name, data in packet.items():
        assert (OUT / name).read_bytes() == data
    write_new(WORK / 'SEALED_COMPLETE.json', jb({'phase': 'SEALED_COMPLETE', 'turn': TURN, 'intentSha256': sha(jb(intent)), 'sealedSha256': sha(jb(sealed)), 'server_writes': 0}))
    print(json.dumps({'phase': 'IMMUTABLE_LOCAL_COMPLETE_STOP_FOR_ROOT_CTO', 'turn': TURN, 'preparationSourceCommit': head,
                      'baseline': intent['baseline'], 'planned': intent['planned'], 'archive': intent['archive'], 'qa': qa,
                      'keyFiles': {n: {'bytes': len(packet[n]), 'sha256': sha(packet[n])} for n in ['RELEASE_INTENT.json', 'EXECUTION_PLAN.md', 'SEALED_PACKET.json', 'PLANNED_INVENTORY.json', 'DOCUMENTATION_APPEND_TEMPLATE.md']},
                      'packetFiles': len(packet), 'packetBytes': sum(len(v) for v in packet.values()), 'preservation': preservation, 'server_writes': 0}, ensure_ascii=False))


if __name__ == '__main__':
    assert len(sys.argv) == 2 and sys.argv[1] in ('snapshot', 'seal'), 'Only LOCAL snapshot/seal supported; no execution mode'
    {'snapshot': snapshot, 'seal': seal}[sys.argv[1]]()
