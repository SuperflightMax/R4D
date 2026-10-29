"""Combined P3 local packet. VPS calls in this helper are strictly read-only."""
from pathlib import Path
import base64
import datetime
import hashlib
import json
import os
import re
import shlex
import shutil
import subprocess
import sys
import tarfile

WORK = Path(r'E:\R4D\perspective\p3-worktrees\release-engineer')
CONTROL = WORK/'experiments/p3-masks/transfer/water/release-engineer'
OUT = Path(r'E:\R4D\perspective\p3-runtime\release-engineer\transfer-water-dark\combined\water-dark-front-edge-04')
RELEASE_ID = 'p3-water-dark-front-edge-04'
OLD_ROOT = '/srv/superflight-review/releases/p5-jungle-regenerated-candidate-03'
NEW_ROOT = '/srv/superflight-review/releases/'+RELEASE_ID
BACKUP = '/opt/superflight-studio/backups/review-'+RELEASE_ID
TEMP = '/etc/nginx/snippets/.review-'+RELEASE_ID+'.locations.conf.tmp'
EXPECTED_SNIPPET = 'e2a466db57830bddb9003361028f99c132504ed3e12a632918898cd6c2a51224'
SSH = ['ssh','-o','BatchMode=yes','-o','StrictHostKeyChecking=yes','-o','ConnectTimeout=15',
       '-o','ConnectionAttempts=1','vps1-direct']
BOARDS = {
 'water': {'candidate':'water-front-edge-04','bundle':r'E:\R4D\perspective\p3-runtime\builder\transfer-water-dark\water\front-edge-04',
  'source':'5196c0bd4981992c4e3d9678438aed1aa1c0d84c','art':'5c9ba8c640b344094e0ada7c4ed6c9ec076550e5',
  'assetsSha256':'4a5bc16f69146fe26a3e3893fcf3c1c8e5b943400bc65d5215cb41d58efeece6',
  'manifestSha256':'de1344afcb197115b76cb4006ead3d96e7b2581a1a299df1100d7a552d2ce2c6',
  'manifestBytes':17208,'payloadFiles':100,'payloadBytes':3561039,'totalFiles':101,'totalBytes':3578247,
  'prefix':'review/r4d/p3-masks-water/','verdict':'Technical PASS / Visual PARTIAL; W-EARLY-POP locally closed; W-DIVIDER-01 OPEN coverage + planeCollapse limitation',
  'qa':[('c48236803b18ff2f15e7bead312dc5c0f8966e18','technical-qa/reports/water-front-edge-04.md'),('42dacf338ba75071269cae1ecb6072e1dabf03be','visual-qa/front-edge-04/REPORT.md')]},
 'dark': {'candidate':'dark-receiver-front-edge-04','bundle':r'E:\R4D\perspective\p3-runtime\builder\transfer-water-dark\dark\receiver-front-edge-04',
  'source':'d7eac5d7d76127e3138480f1f16eaf28aac0f15a','art':'e5d3e1f44c112e483ff2a23fbd169cb119390865',
  'assetsSha256':'2b02dcde6c07266b67285700040e4ae0342f06fb760ae6ed0cf1fdcdc9b6cbad',
  'manifestSha256':'d180e5a63bb1dec7c510507fc2ce990e7cb10927b337a19c4bb9effc67e4ed1b',
  'manifestBytes':15737,'payloadFiles':92,'payloadBytes':3494340,'totalFiles':93,'totalBytes':3510077,
  'prefix':'review/r4d/p3-masks-dark/','verdict':'Targeted Technical PASS / overall Visual PARTIAL; D-POP locally closed; coverage/shadow limitations',
  'qa':[('18e880e117f30747c4d938b1f94cf3622f20fdc0','technical-qa/targeted-receiver-front04/REPORT.md'),('bc34a864bc44cba231d466daa46bdc7b02651845','visual-qa/receiver-front-edge-04/REPORT.md')]}
}

def sha(data):
    return hashlib.sha256(data).hexdigest()

def write_json(path,data):
    path.write_bytes((json.dumps(data,ensure_ascii=False,indent=2)+'\n').encode())

def entry(path,name):
    b=path.read_bytes()
    return {'path':name,'bytes':len(b),'sha256':sha(b)}

def local_inventory(root,exclude=()):
    result=[]
    for p in root.rglob('*'):
        assert not p.is_symlink(),'Unexpected local symlink'
        if p.is_file() and p.relative_to(root).as_posix() not in exclude:
            result.append(entry(p,p.relative_to(root).as_posix()))
    return sorted(result,key=lambda f:f['path'])

def verify_boards():
    output={}
    for board,spec in BOARDS.items():
        root=Path(spec['bundle']); raw=(root/'file-manifest.json').read_bytes()
        assert sha(raw)==spec['manifestSha256'] and len(raw)==spec['manifestBytes']
        m=json.loads(raw);actual=local_inventory(root,('file-manifest.json',))
        assert actual==sorted(m['files'],key=lambda f:f['path']),'Frozen bytes mismatch '+board
        assert len(actual)==spec['payloadFiles'] and sum(f['bytes'] for f in actual)==spec['payloadBytes']
        files=local_inventory(root)
        assert len(files)==spec['totalFiles'] and sum(f['bytes'] for f in files)==spec['totalBytes']
        qa=[]
        for commit,name in spec['qa']:
            path='experiments/p3-masks/transfer/'+board+'/'+name
            data=subprocess.check_output(['git','-C',str(WORK),'show',commit+':'+path])
            assert spec['manifestSha256'].encode() in data and spec['source'].encode() in data and spec['art'].encode() in data
            qa.append({'commit':commit,'path':path,'bytes':len(data),'sha256':sha(data)})
        output[board]={**spec,'qa':qa,'files':files}
    assert sum(x['totalFiles'] for x in output.values())==194
    assert sum(x['totalBytes'] for x in output.values())==7088324
    return output

def ssh_read(script):
    result=subprocess.run(SSH+['sudo -n -- python3 -B -'],input=script.encode(),stdout=subprocess.PIPE,stderr=subprocess.PIPE)
    if result.returncode:
        raise RuntimeError('STOP RO audit SSH exit '+str(result.returncode)+': '+result.stderr.decode(errors='replace')[:1500])
    return json.loads(result.stdout)

REMOTE_PROBE=r'''
import pathlib,hashlib,re,json,os,datetime,stat
h=lambda b:hashlib.sha256(b).hexdigest()
assert os.geteuid()==0,'STOP expected euid0 for authorized opaque audit'
s=pathlib.Path('/etc/nginx/snippets/review.locations.conf');b=s.read_bytes()
expected='/srv/superflight-review/releases/p5-jungle-regenerated-candidate-03'
assert len(b)==957 and h(b)=='e2a466db57830bddb9003361028f99c132504ed3e12a632918898cd6c2a51224','STOP expected snippet drift'
roots=re.findall(rb'^\s*root\s+([^;\s]+)\s*;',b,re.M);assert roots==[expected.encode()],'STOP expected root drift'
r=pathlib.Path(expected);files=[];dirs=[]
for p in [r]+sorted(r.rglob('*')):
 st=p.lstat();assert not stat.S_ISLNK(st.st_mode),'STOP symlink in live root'
 if p.is_dir():dirs.append(p)
 elif p.is_file():files.append(p)
 else:raise RuntimeError('STOP nonregular live entry')
assert len(files)==674 and len(dirs)==88 and sum(p.stat().st_size for p in files)==122587862,'STOP expected opaque count/bytes drift'
manifests=[]
for p in [r/'RELEASE_MANIFEST.json',r/'release-manifest.json']:
 if p.is_file():
  mb=p.read_bytes();m=json.loads(mb)
  manifests.append({'path':str(p),'bytes':len(mb),'sha256':h(mb),'keys':list(m),'listFields':{k:len(v) for k,v in m.items() if isinstance(v,list)},'entryKeys':{k:list(v[0]) for k,v in m.items() if isinstance(v,list) and v and isinstance(v[0],dict)}})
targets=['/srv/superflight-review/releases/p3-water-dark-front-edge-04','/opt/superflight-studio/backups/review-p3-water-dark-front-edge-04','/etc/nginx/snippets/.review-p3-water-dark-front-edge-04.locations.conf.tmp',str(r/'review/r4d/p3-masks-water'),str(r/'review/r4d/p3-masks-dark')]
for p in targets:assert not os.path.lexists(p),'STOP occupied target '+p
print(json.dumps({'utc':datetime.datetime.now(datetime.timezone.utc).isoformat(),'euid':os.geteuid(),'egid':os.getegid(),'root':str(r),'fileCount':len(files),'dirCount':len(dirs),'totalBytes':sum(p.stat().st_size for p in files),'snippetBytes':len(b),'snippetSha256':h(b),'manifests':manifests,'allTargetsAbsent':targets,'catalogExists':(r/'review/index.html').is_file()}))
'''

def probe():
    OUT.mkdir(parents=True,exist_ok=True)
    assert not (OUT/'probe.json').exists(),'Existing probe; inspect before repeating'
    verified=verify_boards()
    write_json(OUT/'approved-boards.json',verified)
    result=ssh_read(REMOTE_PROBE)
    write_json(OUT/'probe.json',result)
    print(json.dumps(result,ensure_ascii=False,indent=2),flush=True)
    print('Frozen exact:194 files/7088324 bytes; no VPS writes.',flush=True)

REMOTE_AUDIT=REMOTE_PROBE[:REMOTE_PROBE.index("print(json.dumps(")]+r'''
import base64
mp=r/'RELEASE_MANIFEST.json';mb=mp.read_bytes();m=json.loads(mb)
assert h(mb)=='b54342562a030361fb705d63b52750018956ea3cdfea204450f48a6bbeced9c5','STOP live manifest changed since probe'
rows=[];directory_rows=[]
for p in [r]+sorted(r.rglob('*')):
 st=p.lstat();name=p.relative_to(r).as_posix()
 meta={'path':name,'uid':st.st_uid,'gid':st.st_gid,'mode':stat.S_IMODE(st.st_mode)}
 if p.is_dir():directory_rows.append(meta)
 else:
  data=p.read_bytes();rows.append({**meta,'bytes':len(data),'sha256':h(data)})
rows.sort(key=lambda f:f['path']);directory_rows.sort(key=lambda f:f['path'])
published=[{'path':f['path'],'bytes':f['bytes'],'sha256':f['sha256']} for f in rows if f['path']!='RELEASE_MANIFEST.json']
recorded=sorted([{'path':f['path'],'bytes':f['bytes'],'sha256':f['sha256']} for f in m['publishedFiles']],key=lambda f:f['path'])
assert published==recorded,'STOP actual bytes differ from live manifest'
assert len(published)==m['publishedFileCount'] and sum(f['bytes'] for f in published)==m['publishedBytes']
assert all(x['mode']==0o644 for x in rows),'STOP unexpected live file mode'
assert all(x['mode']==0o755 for x in directory_rows),'STOP unexpected live directory mode'
# Ownership is observed and hash-bound, never silently normalized. Legacy opaque
# entries include uid1003/gid27; future copying must retain those exact values.
pattern=rb'(^\s*root\s+)([^;\s]+)(\s*;)'
normal=lambda data:re.sub(pattern,lambda x:x[1]+b'<REVIEW_ROOT>'+x[3],data,flags=re.M)
candidate=re.sub(pattern,lambda x:x[1]+b'/srv/superflight-review/releases/p3-water-dark-front-edge-04'+x[3],b,flags=re.M)
assert normal(candidate)==normal(b)
catalog=(r/'review/index.html').read_bytes()
docnames=['/home/sf/assistant-context/vps/services/superflight-studio.md','/opt/superflight-studio/README_RU.txt','/home/sf/assistant-context/vps/INDEX.md','/home/sf/assistant-context/vps/PROCEDURES.md']
docs=[{'path':name,'sha256':h(pathlib.Path(name).read_bytes())} for name in docnames]
canon=lambda value:json.dumps(value,sort_keys=True,separators=(',',':'),ensure_ascii=False).encode()
metadata={'files':rows,'directories':directory_rows}
v=os.statvfs(r)
mem={line.split(':')[0]:int(line.split()[1])*1024 for line in pathlib.Path('/proc/meminfo').read_text().splitlines() if line.startswith(('MemTotal:','MemAvailable:'))}
print(json.dumps({'utc':datetime.datetime.now(datetime.timezone.utc).isoformat(),'euid':os.geteuid(),'egid':os.getegid(),'root':str(r),'fileCount':len(rows),'dirCount':len(directory_rows),'totalBytes':sum(x['bytes'] for x in rows),'manifestPath':str(mp),'manifestSha256':h(mb),'manifestBytes':len(mb),'publishedFiles':published,'publishedBytes':sum(f['bytes'] for f in published),'files':rows,'directories':directory_rows,'inventoryMetadataSha256':h(canon(metadata)),'snippetPath':str(s),'snippetSha256':h(b),'snippetBytes':len(b),'normalizedSnippetSha256':h(normal(b)),'candidateSnippetSha256':h(candidate),'candidateSnippetBytes':len(candidate),'allTargetsAbsent':targets,'catalogSha256':h(catalog),'catalogBytes':len(catalog),'catalogBase64':base64.b64encode(catalog).decode(),'docs':docs,'resources':{'memBytes':mem,'loadAverage':os.getloadavg(),'cpus':os.cpu_count(),'diskFreeBytes':v.f_bavail*v.f_frsize},'serverWrites':False}))
'''

def audit():
    assert (OUT/'probe.json').exists() and not (OUT/'baseline-audit.json').exists()
    data=ssh_read(REMOTE_AUDIT)
    jungle=json.loads(subprocess.check_output(['git','-C',str(WORK),'show',
        '390e178ecc044cadb9b67f4a2506d5efdc171fef:experiments/p3-masks/release/intent-frozen-01/RELEASE_MANIFEST.json']))
    expected=[x for x in jungle['published_files'] if x['path'].startswith('review/r4d/p3-masks/')]
    actual=[x for x in data['publishedFiles'] if x['path'].startswith('review/r4d/p3-masks/')]
    assert actual==expected and len(actual)==77,'STOP Jungle opaque identity drift'
    data['junglePreservedFiles']=len(actual)
    write_json(OUT/'baseline-audit.json',data)
    (OUT/'catalog.before.html').write_bytes(base64.b64decode(data['catalogBase64']))
    section=re.search(r'<section\b[^>]*aria-labelledby="r4d-perspective-title"[^>]*>(.*?)</section>',
                      base64.b64decode(data['catalogBase64']).decode(),re.S)
    assert section
    first=re.search(r'<a\b[^>]*class="card"[^>]*>',section[1]);assert first
    summary={k:data[k] for k in ['utc','euid','root','fileCount','dirCount','totalBytes','manifestSha256',
         'inventoryMetadataSha256','snippetSha256','normalizedSnippetSha256','candidateSnippetSha256',
         'candidateSnippetBytes','catalogSha256','catalogBytes','junglePreservedFiles','resources','serverWrites']}
    print(json.dumps(summary,ensure_ascii=False,indent=2),flush=True)
    print('Shared catalog shell only: '+section[1][:first.start()],flush=True)

def canonical(value):
    return json.dumps(value,sort_keys=True,separators=(',',':'),ensure_ascii=False).encode()

def package():
    import difflib
    import gzip
    baseline=json.loads((OUT/'baseline-audit.json').read_bytes())
    boards=json.loads((OUT/'approved-boards.json').read_bytes())
    overlay=OUT/'overlay';assert not overlay.exists(),'Do not overwrite a prepared overlay'
    overlay.mkdir()
    for board,spec in boards.items():
        root=Path(spec['bundle'])
        assert local_inventory(root)==spec['files'],'Frozen drift '+board
        assert any(f['sha256']==spec['assetsSha256'] for f in spec['files']),'Artist identity missing '+board
        dest=overlay/spec['prefix'];shutil.copytree(root,dest)
        assert local_inventory(dest)==spec['files']
    frozen_entries=local_inventory(overlay)
    assert len(frozen_entries)==194 and sum(f['bytes'] for f in frozen_entries)==7088324
    old=(OUT/'catalog.before.html').read_bytes();text=old.decode('utf-8')
    assert '\r' not in text
    section=re.search(r'<section\b[^>]*aria-labelledby="r4d-perspective-title"[^>]*>(.*?)</section>',text,re.S);assert section
    original=section[1]
    counter=re.search(r'<span>(\d+) материалов</span>',original);assert counter and int(counter[1])==6
    cards='''        <a class="card" href="/review/r4d/p3-masks-water/">
          <p class="eyebrow">Ограниченный результат · Visual PARTIAL</p>
          <strong>P3 — водная доска: цельная картинка и маски</strong>
          <span>Technical PASS в проверенном объёме. Локальный pop арки закрыт. W-DIVIDER-01 OPEN: покрытие разделителя и неоднозначность поверхности в принятой 2D-модели; полной художественной приёмки нет.</span>
          <b>Открыть демку ↗</b>
        </a>
        <a class="card" href="/review/r4d/p3-masks-dark/">
          <p class="eyebrow">Ограниченный результат · Visual PARTIAL</p>
          <strong>P3 — тёмная доска: цельная картинка и маски</strong>
          <span>Targeted Technical PASS. D-POP-01 локально закрыт адресным retest. Покрытие подходов и художественное качество теней имеют пределы; общего Visual/art PASS нет.</span>
          <b>Открыть демку ↗</b>
        </a>
'''
    insertion=original.rfind('      </div>');assert insertion>=0
    changed=original[:insertion]+cards+original[insertion:]
    changed=changed.replace(counter[0],'<span>8 материалов</span>',1)
    assert changed.replace(cards,'',1).replace('<span>8 материалов</span>',counter[0],1)==original
    new_text=text[:section.start(1)]+changed+text[section.end(1):]
    catalog=new_text.encode();(overlay/'review/index.html').write_bytes(catalog)
    (OUT/'catalog.delta.patch').write_bytes(''.join(difflib.unified_diff(text.splitlines(True),new_text.splitlines(True),
        fromfile='baseline/review/index.html',tofile='candidate/review/index.html',n=0)).encode())
    (OUT/'catalog-cards.html').write_bytes(cards.encode())
    old_map={f['path']:f for f in baseline['files']}
    published={f['path']:dict(f) for f in baseline['files'] if f['path']!='RELEASE_MANIFEST.json'}
    overlay_files=local_inventory(overlay)
    for f in overlay_files:published[f['path']]={**f,'uid':0,'gid':0,'mode':0o644}
    previous={f['path']:f for f in baseline['files'] if f['path']!='RELEASE_MANIFEST.json'}
    assert [p for p in previous if previous[p]!=published[p]]==['review/index.html']
    assert len(set(published)-set(previous))==194
    board_public={}
    for board,s in boards.items():
        note=('Depth recipe changed: near/front support-edge midpoints instead of object centres;24 arch records; original full-method-03 preserved.'
              if board=='water' else 'Depth recipe changed: lower common front support instead of upper inner rim;12 receiver lines; original full-method-03 and prior full TQA preserved.')
        board_public[board]={k:s[k] for k in ['candidate','source','art','assetsSha256','manifestSha256','manifestBytes','payloadFiles','payloadBytes','totalFiles','totalBytes','prefix','verdict','qa']}
        board_public[board]['recipeChange']=note
        board_public[board]['rendererUnchanged']=True
        board_public[board]['humanOrMaxQaClaimed']=False
    published_list=sorted(published.values(),key=lambda f:f['path'])
    manifest={'schema':'r4d.p3.water-dark.combined-release.v1','release':RELEASE_ID,'publicHost':'superflight.space',
      'selfExcluded':True,'previousRoot':baseline['root'],'previousManifestSha256':baseline['manifestSha256'],
      'opaqueBaselineMetadataSha256':baseline['inventoryMetadataSha256'],'boards':board_public,
      'jungleBaselinePreserved':{'code':'f1aca21e7b9ba19001e7e8762fcaf2511bf9bf74','art':'f899a308aed156a11e2a1013292ed68c6669959d',
        'frozenManifestSha256':'e2e9f7d837b3d05f484f75a877af6992a70ee88363add783d80f3c6e206f431f','files':77,'verdict':'PARTIAL/MAP-01; post-auth public JS MIME/body/UI unverified'},
      'catalogChanges':{'path':'review/index.html','beforeSha256':sha(old),'afterSha256':sha(catalog),'beforeBytes':len(old),'afterBytes':len(catalog),
        'counterBefore':6,'counterAfter':8,'addedCards':2,'inverseRestoresExactBefore':True},
      'publishedFileCount':len(published_list),'publishedBytes':sum(f['bytes'] for f in published_list),'publishedFiles':published_list}
    write_json(overlay/'RELEASE_MANIFEST.json',manifest)
    archive_files=[{**f,'uid':0,'gid':0,'mode':0o644} for f in local_inventory(overlay)]
    full_files=sorted(published_list+[next(f for f in archive_files if f['path']=='RELEASE_MANIFEST.json')],key=lambda f:f['path'])
    directories={f['path']:dict(f) for f in baseline['directories']}
    archive_dirs=[]
    for p in sorted(overlay.rglob('*')):
        if p.is_dir():
            d={'path':p.relative_to(overlay).as_posix(),'uid':0,'gid':0,'mode':0o755};archive_dirs.append(d)
            if d['path'] in directories:assert directories[d['path']]==d,'Do not change foreign parent metadata'
            else:directories[d['path']]=d
    full_dirs=sorted(directories.values(),key=lambda f:f['path'])
    archive_path=OUT/(RELEASE_ID+'-overlay.tar.gz');assert not archive_path.exists()
    with archive_path.open('xb') as file:
        with gzip.GzipFile(filename='',mode='wb',fileobj=file,mtime=0,compresslevel=6) as gz:
            with tarfile.open(fileobj=gz,mode='w',format=tarfile.PAX_FORMAT) as target:
                for p in sorted(overlay.rglob('*'),key=lambda p:p.relative_to(overlay).as_posix()):
                    info=target.gettarinfo(str(p),arcname=p.relative_to(overlay).as_posix())
                    info.uid=info.gid=0;info.uname=info.gname='root';info.mtime=0
                    info.mode=0o755 if p.is_dir() else 0o644
                    if p.is_file():
                        with p.open('rb') as src:target.addfile(info,src)
                    else:target.addfile(info)
    actual=[]
    with tarfile.open(archive_path,'r:gz') as archive:
        for member in archive:
            assert member.isdir() or member.isfile()
            assert member.uid==member.gid==0 and member.mode==(0o755 if member.isdir() else 0o644)
            if member.isfile():
                data=archive.extractfile(member).read();actual.append({'path':member.name,'bytes':len(data),'sha256':sha(data),'uid':0,'gid':0,'mode':0o644})
    assert sorted(actual,key=lambda f:f['path'])==archive_files
    assert len(archive_files)==196
    for board,s in boards.items():assert local_inventory(overlay/s['prefix'])==s['files']
    archive_manifest={'schema':'r4d.p3.combined-overlay.file-manifest.v1','frozenApprovedFiles':194,'frozenApprovedBytes':7088324,
      'publicationAdditionalFiles':['review/index.html','RELEASE_MANIFEST.json'],'files':archive_files,'directories':archive_dirs,
      'fileCount':len(archive_files),'fileBytes':sum(f['bytes'] for f in archive_files),'selfExcluded':True}
    write_json(OUT/'ARCHIVE_MANIFEST.json',archive_manifest)
    scope={'schema':'r4d.p3.combined-write-scope.v1','status':'WAIT_EXACT_CTO_TOKEN','serverWrite':False,'token':None,
      'windowOwner':'cto-r4d-perspective-01','window':'one combined serialized P3 window; P5 closed; P6 not assigned',
      'releaseId':RELEASE_ID,'transport':'vps1-direct','publicHost':'superflight.space','leadCommit':'71a4f50eb0d74562d9e5e5129c5535495cdae055',
      'boards':board_public,'oldRoot':OLD_ROOT,'newRoot':NEW_ROOT,'backup':BACKUP,'tempSnippet':TEMP,
      'snippet':'/etc/nginx/snippets/review.locations.conf','oldManifestSha256':baseline['manifestSha256'],
      'oldSnippetSha256':baseline['snippetSha256'],'oldSnippetBytes':baseline['snippetBytes'],
      'normalizedSnippetSha256':baseline['normalizedSnippetSha256'],'newSnippetSha256':baseline['candidateSnippetSha256'],
      'newSnippetBytes':baseline['candidateSnippetBytes'],'baselineMetadataSha256':baseline['inventoryMetadataSha256'],
      'baselineCount':{'files':674,'directories':88,'bytes':122587862},'baselineUtc':baseline['utc'],
      'archive':entry(archive_path,archive_path.name),'archiveLocalPath':str(archive_path),'archiveRemotePath':BACKUP+'/candidate-overlay.tar.gz',
      'archiveManifest':entry(OUT/'ARCHIVE_MANIFEST.json','ARCHIVE_MANIFEST.json'),
      'releaseManifest':entry(overlay/'RELEASE_MANIFEST.json','RELEASE_MANIFEST.json'),
      'overlayFiles':archive_files,'overlayDirectories':archive_dirs,'fullNewMetadataSha256':sha(canonical({'files':full_files,'directories':full_dirs})),
      'fullNewCount':{'files':len(full_files),'directories':len(full_dirs),'bytes':sum(f['bytes'] for f in full_files)},
      'unchangedForeignBrowserFiles':len(previous)-1,'replaceInClone':['review/index.html','RELEASE_MANIFEST.json'],
      'catalog':manifest['catalogChanges'],'rollbackBeforePath':BACKUP+'/review.locations.conf.before',
      'serviceDoc':'/home/sf/assistant-context/vps/services/superflight-studio.md','changelog':'/home/sf/assistant-context/vps/CHANGELOG.md',
      'requiredEuidBeforeAnyFutureWrite':0,'preserveForeignOwnershipModesExactly':True,'newFilesOwnerGroupMode':'0:0/0644; new dirs0:0/0755',
      'preconditions':baseline['allTargetsAbsent'],'postAuthPublicJsBodyMimeUiVerified':False,
      'metadataDigestRule':'sha256(JSON UTF-8 ensure_ascii=false sort_keys=true separators=comma/colon; files/dirs sorted by path; root path is dot)',
      'noRebuildNoFrozenEdits':True}
    write_json(OUT/'WRITE_SCOPE.json',scope)
    print(json.dumps({k:scope[k] for k in ['releaseId','archive','archiveManifest','releaseManifest','fullNewCount','unchangedForeignBrowserFiles','newSnippetSha256','fullNewMetadataSha256','catalog']},ensure_ascii=False,indent=2))
    print('OVERLAY_READY:194 immutable candidate files + catalog + release metadata; no remote writes.',flush=True)

def recheck():
    before=json.loads((OUT/'baseline-audit.json').read_bytes())
    current=ssh_read(REMOTE_AUDIT)
    for key in ['root','manifestSha256','inventoryMetadataSha256','snippetSha256','catalogSha256','allTargetsAbsent']:
        assert current[key]==before[key],'STOP baseline changed after preparation: '+key
    # Keep separate raw evidence; do not overwrite the first audited snapshot.
    assert not (OUT/'baseline-final.json').exists()
    write_json(OUT/'baseline-final.json',current)
    print(json.dumps({k:current[k] for k in ['utc','euid','root','manifestSha256','inventoryMetadataSha256','snippetSha256','fileCount','dirCount','totalBytes','serverWrites']},ensure_ascii=False,indent=2))
    print('FINAL_RO_GUARD_UNCHANGED; targets/prefixes still absent.',flush=True)

if __name__=='__main__':
    assert sys.argv[1] in ('probe','audit','package','recheck')
    {'probe':probe,'audit':audit,'package':package,'recheck':recheck}[sys.argv[1]]()
