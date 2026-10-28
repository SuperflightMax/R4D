"""Local release-intent preparation. The only remote program is read-only.

No deploy/rollback execution mode is provided. No Viewer, renderer or core runs.
"""
import base64,datetime,hashlib,io,json,os,subprocess,sys,tarfile
from pathlib import Path

REPO=Path(__file__).resolve().parents[4]
SOURCE='experiments/p1-collider-mapping/accepted-static-report-01/'
OUT=Path(r'E:\R4D\perspective\p2-runtime\output\p1-static-report-release-intent-01')
FROZEN=Path(r'E:\R4D\perspective\p2-runtime\output\p1-static-report-candidate-01')
BUILD='2135851427c568038b23fded38d6cbe8b6f6b0e3'
HANDOFF='383164ff397e83a5ad47238f6ebe196688f649ff'
MANIFEST_SHA='00eb21e37f4a30e1dfbf7addad0eeafe1e66b266c553495ea30ae8d96255a14c'
PUBLIC_TREE='88e934cab5ce2621cc6ad811b7bc40bcfb5ccce74262a35068654552aeeb99f7'
QA=[{'kind':'TQA','commit':'054bb5bd6a385d36ce51fe382f2526e95cdcee99','path':'experiments/p2-free-approach/qa/technical/P1_STATIC_REPORT_CANDIDATE_01.md','evidencePath':r'E:\R4D\perspective\p2-runtime\output\technical-qa\p1-static-report-01\EVIDENCE.json','evidenceBytes':21615,'evidenceSha256':'36787ee737913bde70b9140dc55261eed26e0b02250790926262c826437a01ff'},
    {'kind':'VQA','commit':'3c5a27ed9fe18e79860491182fe4091738d7d424','path':'experiments/p2-free-approach/qa/visual/P1_STATIC_REPORT_CANDIDATE_01.md'}]
TARGETS={'newRoot':'/srv/superflight-review/releases/p1-mapping-report-candidate-01',
    'staging':'/srv/superflight-review/releases/.p1-static-report-01.stage',
    'upload':'/srv/superflight-review/releases/.p1-static-report-01.payload.tar',
    'backup':'/opt/superflight-studio/backups/review-p1-static-report-01',
    'snippetTemp':'/etc/nginx/snippets/.review-p1-static-report-01.locations.conf.tmp',
    'serviceDocTemp':'/home/sf/assistant-context/vps/services/.superflight-studio.p1-static-report-01.tmp',
    'changelogTemp':'/home/sf/assistant-context/vps/.CHANGELOG.p1-static-report-01.tmp',
    'lock':'/run/lock/review-p1-static-report-01.lock'}
sha=lambda b:hashlib.sha256(b).hexdigest()
jb=lambda x:(json.dumps(x,ensure_ascii=False,indent=2)+'\n').encode()
now=lambda:datetime.datetime.now(datetime.timezone.utc).isoformat()
tree=lambda rows:sha(''.join(f"{r['sha256']} {r['bytes']} {r['path']}\n" for r in sorted(rows,key=lambda x:x['path'])).encode())
def git(ref,path):return subprocess.check_output(['git','show',ref+':'+path],cwd=REPO)
def write_new(path,data):
    assert not path.exists(),str(path)
    path.parent.mkdir(parents=True,exist_ok=True);path.write_bytes(data)

REMOTE=r'''
import base64,datetime,hashlib,json,os,re,shutil,stat,urllib.request,urllib.error
from pathlib import Path
targets=__TARGETS__
sha=lambda b:hashlib.sha256(b).hexdigest()
now=lambda:datetime.datetime.now(datetime.timezone.utc).isoformat()
def meta(p):
    s=p.lstat();assert stat.S_ISREG(s.st_mode) and not p.is_symlink(),str(p)
    data=p.read_bytes()
    return {'path':str(p),'bytes':len(data),'sha256':sha(data),'mode':oct(stat.S_IMODE(s.st_mode)),'uid':s.st_uid,'gid':s.st_gid,'symlink':False}
def inventory(root):
    rows=[];dirs=[]
    for parent,subdirs,names in os.walk(root,followlinks=False):
        p=Path(parent);s=p.lstat();assert stat.S_ISDIR(s.st_mode) and not p.is_symlink()
        dirs.append({'path':p.relative_to(root).as_posix(),'mode':oct(stat.S_IMODE(s.st_mode)),'uid':s.st_uid,'gid':s.st_gid,'symlink':False})
        for name in subdirs:assert not (p/name).is_symlink()
        for name in names:
            q=p/name;m=meta(q);m['path']=q.relative_to(root).as_posix();rows.append(m)
    return sorted(rows,key=lambda x:x['path']),sorted(dirs,key=lambda x:x['path'])
paths=[Path(p) for p in ['/home/sf/assistant-context/vps/INDEX.md','/home/sf/assistant-context/vps/PROCEDURES.md','/home/sf/assistant-context/vps/services/superflight-studio.md','/home/sf/assistant-context/vps/CHANGELOG.md','/opt/superflight-studio/README_RU.txt','/etc/nginx/snippets/review.locations.conf','/etc/nginx/conf.d/superflight-studio.conf','/etc/nginx/mime.types']]
before=[meta(p) for p in paths]
snippet=Path('/etc/nginx/snippets/review.locations.conf').read_bytes()
txt=snippet.decode('utf-8');assert 'auth_request' not in txt
roots=re.findall(r'^\s*root\s+([^;]+);',txt,re.M);assert len(roots)==1
root=Path(roots[0]);assert str(root).startswith('/srv/superflight-review/releases/') and root.resolve()==root
result={'startedAtUtc':now(),'serverWrites':False,'cookiesUsed':False,'loginFollowed':False,'root':str(root),'before':before,'reviewAuthRequestAbsent':True,'snippetBase64':base64.b64encode(snippet).decode()}
files,dirs=inventory(root);result['files']=files;result['directories']=dirs
assert all(r['mode']=='0o644' and r['uid']==0 and r['gid']==0 for r in files)
assert all(r['mode']=='0o755' and r['uid']==0 and r['gid']==0 for r in dirs)
for rel,key in [('review/index.html','catalogBase64'),('RELEASE_MANIFEST.json','releaseManifestBase64')]:
    result[key]=base64.b64encode((root/rel).read_bytes()).decode()
target_rows=[]
for key,name in targets.items():
    p=Path(name);assert p.resolve()==p,str(p)
    target_rows.append({'kind':key,'path':name,'exists':os.path.lexists(p),'parentExists':p.parent.exists(),'parentSymlink':p.parent.is_symlink()})
    assert not os.path.lexists(p),str(p)
route=root/'review/r4d/p1-mapping-report';assert not os.path.lexists(route)
result['targets']=target_rows;result['proposedRouteExists']=False
result['remoteFreeBytes']={p:shutil.disk_usage(p).free for p in ['/srv/superflight-review/releases','/opt/superflight-studio/backups']}
service=Path('/home/sf/assistant-context/vps/services/superflight-studio.md').read_text()
result['currentPublicDocExcerpt']='\n'.join(service.splitlines()[:8])
result['serviceReviewHistoricalHeading']=[line for line in service.splitlines() if line.startswith('## Historical Review production')]
class NoRedirect(urllib.request.HTTPRedirectHandler):
    def redirect_request(self,*args,**kwargs):return None
opener=urllib.request.build_opener(NoRedirect());result['http']=[]
for url in ['https://superflight.space/review/','https://superflight.space/review/r4d/p2-free-approach/','https://superflight.space/review/r4d/p1-mapping-report/','https://sf.superflight.space/review/']:
    req=urllib.request.Request(url,headers={'User-Agent':'R4D-P1-static-local-release-intent'},method='GET')
    try:res=opener.open(req,timeout=15)
    except urllib.error.HTTPError as e:res=e
    with res:
        data=res.read();result['http'].append({'url':url,'status':res.code,'bytes':len(data),'sha256':sha(data),'headers':{k:res.headers.get(k) for k in ['Location','Content-Type','Cache-Control','X-Robots-Tag','X-Content-Type-Options','Referrer-Policy','X-Frame-Options']}})
after=[meta(p) for p in paths];assert before==after
files2,dirs2=inventory(root);assert files2==files and dirs2==dirs
result['after']=after;result['fullInventoryStableDuringRead']=True
assert result['http'][0]['status']==200 and result['http'][1]['status']==200 and result['http'][2]['status']==404
assert result['http'][0]['sha256']==sha(base64.b64decode(result['catalogBase64']))
result['finishedAtUtc']=now();print(json.dumps(result,ensure_ascii=False))
'''

def snapshot():
    assert not OUT.exists(),'Existing intent must be inspected, not overwritten'
    assert subprocess.check_output(['git','rev-parse','HEAD'],cwd=REPO,text=True).strip()==HANDOFF
    status=subprocess.check_output(['git','status','--porcelain'],cwd=REPO,text=True)
    assert all(SOURCE in line for line in status.splitlines()),status
    ps=r"$o=Get-CimInstance Win32_OperatingSystem;$c=Get-CimInstance Win32_Processor|Measure-Object LoadPercentage -Average;[ordered]@{atUtc=[DateTime]::UtcNow.ToString('o');totalRamGiB=$o.TotalVisibleMemorySize/1MB;freeRamGiB=$o.FreePhysicalMemory/1MB;cpuPercent=$c.Average;disks=@(Get-PSDrive -Name C,D,E|ForEach-Object{[ordered]@{name=$_.Name;freeBytes=$_.Free}})}|ConvertTo-Json -Depth 5 -Compress"
    resources=json.loads(subprocess.check_output(['powershell','-NoProfile','-Command',ps],text=True))
    assert min(d['freeBytes'] for d in resources['disks'])>4*1024**3
    resources.update({'ownAdditionalRamBudgetGiB':0.2,'ownAdditionalDiskBudgetGiB':0.1,'concurrentP4MillionkoRamReserveGiB':4,'concurrentP4MillionkoEDiskReserveGiB':2,'reserveIsPlanningAllowanceNotMeasuredFuturePeak':True,'cpuMode':'single lightweight Python packaging; no simulation/build/render','processLocalTempOnlyE':True,'thresholds':'<=4GiB diagnose/warn; <=2GiB safe checkpoint/stop'})
    resources['aggregatePlannedRamGiB']=resources['totalRamGiB']-resources['freeRamGiB']+4.2
    assert resources['aggregatePlannedRamGiB']<resources['totalRamGiB']
    OUT.mkdir();(OUT/'tmp').mkdir()
    os.environ['TEMP']=os.environ['TMP']=str(OUT/'tmp');os.environ['PYTHONDONTWRITEBYTECODE']='1'
    write_new(OUT/'RESOURCES.json',jb(resources))
    remote=REMOTE.replace('__TARGETS__',repr(TARGETS))
    p=subprocess.run(['ssh','-o','BatchMode=yes','-o','ConnectTimeout=15','vps1-direct','sudo -n python3 -B -'],input=remote.encode(),capture_output=True,timeout=120)
    write_new(OUT/'baseline/read.stderr.log',p.stderr)
    assert p.returncode==0,p.stderr.decode()
    b=json.loads(p.stdout);write_new(OUT/'baseline/ACTUAL_PUBLIC.json',jb(b))
    for key,name in [('snippetBase64','review.locations.conf.before'),('catalogBase64','catalog.before.html'),('releaseManifestBase64','RELEASE_MANIFEST.before.json')]:
        write_new(OUT/'baseline'/name,base64.b64decode(b[key]))
    print(json.dumps({'out':str(OUT),'baselineStarted':b['startedAtUtc'],'baselineFinished':b['finishedAtUtc'],'actualRoot':b['root'],'files':len(b['files']),'bytes':sum(r['bytes'] for r in b['files']),'publicAuthRequestAbsent':b['reviewAuthRequestAbsent'],'targetAbsence':all(not r['exists'] for r in b['targets']),'httpStatuses':[r['status'] for r in b['http']],'baselineSha256':sha(jb(b)),'resources':resources},ensure_ascii=False))

def package():
    assert OUT.exists() and not (OUT/'RELEASE_INTENT.json').exists()
    os.environ['TEMP']=os.environ['TMP']=str(OUT/'tmp');os.environ['PYTHONDONTWRITEBYTECODE']='1'
    baseline_raw=(OUT/'baseline/ACTUAL_PUBLIC.json').read_bytes();b=json.loads(baseline_raw)
    assert b['fullInventoryStableDuringRead'] and b['reviewAuthRequestAbsent'] and not b['serverWrites']
    mraw=(FROZEN/'BUILD_MANIFEST.json').read_bytes();m=json.loads(mraw)
    assert len(mraw)==4037 and sha(mraw)==MANIFEST_SHA and m['publicTreeSha256']==PUBLIC_TREE
    rows=m['fileManifest'];assert len(rows)==12 and sum(r['bytes'] for r in rows)==2057712
    assert tree(rows)==PUBLIC_TREE
    assert sorted(p.relative_to(FROZEN/'public').as_posix() for p in (FROZEN/'public').rglob('*') if p.is_file())==[r['path'] for r in rows]
    payload=OUT/'payload';payload.mkdir()
    for r in rows:
        data=(FROZEN/'public'/r['path']).read_bytes();assert len(data)==r['bytes'] and sha(data)==r['sha256']
        write_new(payload/r['path'],data)
    delta=json.loads(git(HANDOFF,SOURCE+'audit/CATALOG_DELTA.json'))
    old_catalog=(OUT/'baseline/catalog.before.html').read_bytes()
    assert sha(old_catalog)==delta['baselineCatalogSha256'],'Catalog changed: stop for Root review'
    new_catalog=old_catalog
    for op in delta['operations']:
        old=op['before'].encode();new=op['after'].encode();assert new_catalog.count(old)==1
        new_catalog=new_catalog.replace(old,new,1)
    inverse=new_catalog
    for op in reversed(delta['operations']):inverse=inverse.replace(op['after'].encode(),op['before'].encode(),1)
    assert inverse==old_catalog
    write_new(payload/'review/index.html',new_catalog)
    old_files={r['path']:r for r in b['files']}
    inherited=[{k:r[k] for k in ['path','bytes','sha256']} for r in b['files'] if r['path'] not in ['RELEASE_MANIFEST.json','review/index.html']]
    assert not any(r['path'].startswith('review/r4d/p1-mapping-report/') for r in inherited)
    files=sorted(inherited+rows+[{'path':'review/index.html','bytes':len(new_catalog),'sha256':sha(new_catalog)}],key=lambda r:r['path'])
    assert len({r['path'] for r in files})==len(files)
    qa=[]
    for q in QA:
        raw=git(q['commit'],q['path']);copy=dict(q);copy.update({'reportBytes':len(raw),'reportSha256':sha(raw),'pageRender':'PAGE_RENDER_NOT_OBSERVED'})
        write_new(OUT/'audit'/f"{q['kind']}_REPORT.md",raw)
        if q.get('evidencePath'):
            raw=Path(q['evidencePath']).read_bytes();assert len(raw)==q['evidenceBytes'] and sha(raw)==q['evidenceSha256']
        qa.append(copy)
    release={'schema_version':1,'release_id':'p1-mapping-report-candidate-01','path_prefix':'/review/','status':'prepared locally; server_write=false; no release authorization','preparedAtUtc':b['finishedAtUtc'],'releaseRoot':TARGETS['newRoot'],'sourceHandoffCommit':HANDOFF,'frozenBuildSource':BUILD,'acceptedP1Commit':'4b47db04c7140ebf88f69b91faa0b790d46f22ec','frozenBuildManifestSha256':MANIFEST_SHA,'p1PublicTreeSha256':PUBLIC_TREE,'previousRoot':b['root'],'previousManifestSha256':old_files['RELEASE_MANIFEST.json']['sha256'],'preservation':{'opaqueUnchangedFiles':len(inherited),'catalogReplacements':2,'p2Live03Preserved':True,'p2Frozen04NotIncluded':True},'qa':qa,'pageRender':'PAGE_RENDER_NOT_OBSERVED','published_files':files,'published_file_count':len(files),'published_bytes':sum(r['bytes'] for r in files)}
    raw=jb(release);write_new(payload/'RELEASE_MANIFEST.json',raw)
    planned=files+[{'path':'RELEASE_MANIFEST.json','bytes':len(raw),'sha256':sha(raw)}];planned.sort(key=lambda r:r['path'])
    dirs={r['path'] for r in b['directories']}
    for r in planned:
        p=Path(r['path']).parent
        while p.as_posix()!='.':dirs.add(p.as_posix());p=p.parent
    full={'files':[dict(r,uid=0,gid=0,mode='0o644',symlink=False) for r in planned],'directories':[{'path':p,'uid':0,'gid':0,'mode':'0o755','symlink':False} for p in sorted(dirs)],'treeSha256':tree(planned),'fileCount':len(planned),'totalBytes':sum(r['bytes'] for r in planned)}
    write_new(OUT/'PLANNED_INVENTORY.json',jb(full))
    before=(OUT/'baseline/review.locations.conf.before').read_bytes()
    old_line=('root '+b['root']+';').encode();new_line=('root '+TARGETS['newRoot']+';').encode()
    assert before.count(old_line)==1 and b'auth_request' not in before
    after=before.replace(old_line,new_line,1);assert after.replace(new_line,old_line,1)==before
    write_new(OUT/'plan/review.locations.conf.after',after)
    archive=OUT/'p1-static-report-01.payload.tar'
    payload_rows=[]
    with tarfile.open(archive,'x',format=tarfile.USTAR_FORMAT) as tar:
        for p in sorted(q for q in payload.rglob('*') if q.is_file()):
            rel=p.relative_to(payload).as_posix();data=p.read_bytes();info=tarfile.TarInfo(rel);info.size=len(data);info.mode=0o644;info.uid=info.gid=0;info.mtime=0
            tar.addfile(info,io.BytesIO(data));payload_rows.append({'path':rel,'bytes':len(data),'sha256':sha(data)})
    archive_data=archive.read_bytes()
    assert len(payload_rows)==14 and {r['path'] for r in payload_rows}=={r['path'] for r in rows}|{'review/index.html','RELEASE_MANIFEST.json'}
    with tarfile.open(archive,'r:') as tar:
        for item,row in zip(tar.getmembers(),payload_rows):
            assert item.isfile() and item.name==row['path'] and item.uid==item.gid==0 and item.mode==0o644
            assert sha(tar.extractfile(item).read())==row['sha256']
    intent={'schema':'r4d.p1-static-report.local-release-intent-01','preparedAtUtc':now(),'status':'LOCAL_PREPARATION_ONLY_AWAIT_ROOT_REVIEW','server_write':False,'executionAuthorized':False,'newCtoTokenRequired':True,'sourceHandoffCommit':HANDOFF,'frozenBuildSource':BUILD,'acceptedP1Commit':'4b47db04c7140ebf88f69b91faa0b790d46f22ec','frozenCandidate':str(FROZEN),'frozenManifestBytes':4037,'frozenManifestSha256':MANIFEST_SHA,'p1PublicFiles':12,'p1PublicBytes':2057712,'p1PublicTreeSha256':PUBLIC_TREE,'baseline':{'path':'baseline/ACTUAL_PUBLIC.json','bytes':len(baseline_raw),'sha256':sha(baseline_raw),'startedAtUtc':b['startedAtUtc'],'finishedAtUtc':b['finishedAtUtc'],'actualRoot':b['root'],'files':len(b['files']),'bytesTotal':sum(r['bytes'] for r in b['files']),'beforeAfterExact':True,'targetsAbsent':b['targets'],'freshRepeatRequiredBeforeEveryWritePhase':True},'targets':TARGETS,'archive':{'path':archive.name,'bytes':len(archive_data),'sha256':sha(archive_data),'files':payload_rows,'semantics':'delta over exact guarded opaque inherited root; NOT standalone full release'},'plannedSharedRelease':{'inventoryPath':'PLANNED_INVENTORY.json','inventorySha256':sha(jb(full)),'files':len(planned),'bytes':full['totalBytes'],'treeSha256':full['treeSha256'],'releaseManifestBytes':len(raw),'releaseManifestSha256':sha(raw),'preservedOpaqueFiles':len(inherited)},'catalog':{'beforeBytes':len(old_catalog),'beforeSha256':sha(old_catalog),'afterBytes':len(new_catalog),'afterSha256':sha(new_catalog),'replacements':2,'inverseExact':True,'newCards':1,'count':'3 демонстрации → 4 материала'},'snippet':{'path':'/etc/nginx/snippets/review.locations.conf','beforeBytes':len(before),'beforeSha256':sha(before),'afterBytes':len(after),'afterSha256':sha(after),'change':'one exact root literal only; all PUBLIC/security bytes preserved; no normalized guards','rollbackSource':'fresh authorized-execution snapshot of current PUBLIC snippet, exact bytes must also match this baseline; no protected template'},'qa':qa,'pageRender':'PAGE_RENDER_NOT_OBSERVED','previewRestriction':{'toolCall':'call_abc1dd4797314b4f99b8273827bb843b','reason':'The requested URL protocol is not allowed. Allowed protocols: "http:", "https:".','noRetryOrAlternateLocalRenderer':True},'writeSetAndGuardsDocument':'EXECUTION_PLAN.md','documentsAfterDeliveryOnly':['/home/sf/assistant-context/vps/services/superflight-studio.md','/home/sf/assistant-context/vps/CHANGELOG.md'],'notPublished':True,'unchanged':['private Studio/auth/credentials/security settings','vhost/global nginx MIME','P2 current candidate03','P2 frozen04/df309/obsolete intents','UGH/skeleton/P4/Millionko products'],'postReleaseRequired':'actual PUBLIC page and all 12 asset-byte/status/MIME/header checks; actual desktop/mobile PUBLIC view; no inherited full PASS'}
    write_new(OUT/'RELEASE_INTENT.json',jb(intent))
    print(json.dumps({'intent':str(OUT/'RELEASE_INTENT.json'),'intentBytes':len(jb(intent)),'intentSha256':sha(jb(intent)),'archiveBytes':len(archive_data),'archiveSha256':sha(archive_data),'payloadFiles':len(payload_rows),'plannedSharedFiles':len(planned),'plannedSharedBytes':full['totalBytes'],'plannedTreeSha256':full['treeSha256'],'plannedManifestBytes':len(raw),'plannedManifestSha256':sha(raw),'catalogAfterSha256':sha(new_catalog),'snippetBeforeSha256':sha(before),'snippetAfterSha256':sha(after),'baselineSha256':sha(baseline_raw),'server_write':False},ensure_ascii=False))

if __name__=='__main__':
    assert len(sys.argv)==2 and sys.argv[1] in ['snapshot','package']
    {'snapshot':snapshot,'package':package}[sys.argv[1]]()
