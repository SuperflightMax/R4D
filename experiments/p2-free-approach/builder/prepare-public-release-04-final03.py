"""Read-only PUBLIC snapshot + one immutable LOCAL P2 release packet. No deploy mode."""
import base64,datetime,hashlib,io,json,os,re,subprocess,sys,tarfile
from pathlib import Path

REPO=Path(__file__).resolve().parents[3]
OUT=Path(r'E:\R4D\perspective\p2-runtime\output\p2-review-release-intent-04-final-03')
FROZEN=Path(r'E:\R4D\perspective\p2-runtime\output\p2-jungle-static-candidate-04')
PREFIX='review/r4d/p2-free-approach/'
BUILD='08f9b9eaa6aa1063eb7fcd9cf373ddacf907725a';IMPLEMENTATION='0a80b0b63c688b6f77b8f710576adf2ea5c263c1'
MF_SHA='60f79d1bdad8d3737376952043013394bb3098de6b15200fc5c352dd875dd1f7'
P2_TREE='60d216a64c86fed4b83f4ed3802e3d1393cdda2db8776818d22710173dc2ffed'
QA_REF='df30939444dfc3875fe1f0fc39b31a4621be1d28'
QA_PATH='experiments/p2-free-approach/qa/technical/candidate-04-REPORT.md'
QA_EVIDENCE=Path(r'E:\R4D\perspective\p2-runtime\output\technical-qa\candidate-04-offline-01\EVIDENCE.json')
TARGETS={'newRoot':'/srv/superflight-review/releases/p2-jungle-static-candidate-04',
 'staging':'/srv/superflight-review/releases/.p2-candidate-04-public-final03.stage',
 'upload':'/srv/superflight-review/releases/.p2-candidate-04-public-final03.payload.tar',
 'backup':'/opt/superflight-studio/backups/review-p2-candidate-04-public-final03',
 'snippetTemp':'/etc/nginx/snippets/.review-p2-candidate-04-public-final03.locations.conf.tmp',
 'serviceDocTemp':'/home/sf/assistant-context/vps/services/.superflight-studio.p2-candidate-04-public-final03.tmp',
 'changelogTemp':'/home/sf/assistant-context/vps/.CHANGELOG.p2-candidate-04-public-final03.tmp',
 'lock':'/run/lock/review-p2-candidate-04-public-final03.lock'}
sha=lambda b:hashlib.sha256(b).hexdigest()
jb=lambda x:(json.dumps(x,ensure_ascii=False,indent=2)+'\n').encode()
now=lambda:datetime.datetime.now(datetime.timezone.utc).isoformat()
tree=lambda rows:sha(''.join(f"{r['sha256']} {r['bytes']} {r['path']}\n" for r in sorted(rows,key=lambda r:r['path'])).encode())
def git(ref,path):return subprocess.check_output(['git','show',ref+':'+path],cwd=REPO)
def write_new(p,data):
 assert not p.exists(),str(p)
 p.parent.mkdir(parents=True,exist_ok=True);p.write_bytes(data)
def host_resources():
 ps=r"$o=Get-CimInstance Win32_OperatingSystem;$c=Get-CimInstance Win32_Processor|Measure-Object LoadPercentage -Average;[ordered]@{atUtc=[DateTime]::UtcNow.ToString('o');totalRamGiB=$o.TotalVisibleMemorySize/1MB;freeRamGiB=$o.FreePhysicalMemory/1MB;cpuPercent=$c.Average;disks=@(Get-PSDrive -Name C,D,E|ForEach-Object{[ordered]@{name=$_.Name;freeBytes=$_.Free}})}|ConvertTo-Json -Depth 5 -Compress"
 r=json.loads(subprocess.check_output(['powershell','-NoProfile','-Command',ps],text=True))
 assert min(x['freeBytes'] for x in r['disks'])>4*1024**3 and r['freeRamGiB']>4.25
 r.update(ownAdditionalRamBudgetGiB=.25,ownAdditionalEDiskBudgetGiB=.1,P4MillionkoConcurrentRamAllowanceGiB=4,P4MillionkoConcurrentEDiskAllowanceGiB=2,futureForeignPeaksNotMeasured=True,aggregatePlannedRamGiB=r['totalRamGiB']-r['freeRamGiB']+4.25,processLocalTempOutputOnlyE=True,thresholds='<=4GiB warn/diagnose; <=2GiB safe checkpoint/stop')
 return r

REMOTE=r'''
import base64,datetime,hashlib,json,os,re,shutil,stat,time,urllib.request,urllib.error
from pathlib import Path
targets=__TARGETS__
sha=lambda b:hashlib.sha256(b).hexdigest()
now=lambda:datetime.datetime.now(datetime.timezone.utc).isoformat()
def meta(p):
 s=p.lstat();assert stat.S_ISREG(s.st_mode) and not p.is_symlink(),str(p)
 data=p.read_bytes();return {'path':str(p),'bytes':len(data),'sha256':sha(data),'mode':oct(stat.S_IMODE(s.st_mode)),'uid':s.st_uid,'gid':s.st_gid,'symlink':False}
def inventory(root):
 fs=[];ds=[]
 for parent,subdirs,names in os.walk(root,followlinks=False):
  p=Path(parent);s=p.lstat();assert stat.S_ISDIR(s.st_mode) and not p.is_symlink()
  ds.append({'path':p.relative_to(root).as_posix(),'mode':oct(stat.S_IMODE(s.st_mode)),'uid':s.st_uid,'gid':s.st_gid,'symlink':False})
  for name in subdirs:assert not (p/name).is_symlink()
  for name in names:
   q=p/name;r=meta(q);r['path']=q.relative_to(root).as_posix();fs.append(r)
 return sorted(fs,key=lambda r:r['path']),sorted(ds,key=lambda r:r['path'])
started=now()
paths=[Path(p) for p in ['/home/sf/assistant-context/vps/INDEX.md','/home/sf/assistant-context/vps/PROCEDURES.md','/home/sf/assistant-context/vps/services/superflight-studio.md','/home/sf/assistant-context/vps/CHANGELOG.md','/opt/superflight-studio/README_RU.txt','/etc/nginx/snippets/review.locations.conf','/etc/nginx/conf.d/superflight-studio.conf','/etc/nginx/mime.types']]
before=[meta(p) for p in paths]
snippet=Path('/etc/nginx/snippets/review.locations.conf').read_bytes();text=snippet.decode();assert 'auth_request' not in text
roots=re.findall(r'^\s*root\s+([^;]+);',text,re.M);assert len(roots)==1
root=Path(roots[0]);assert str(root).startswith('/srv/superflight-review/releases/') and root.resolve()==root and not root.is_symlink()
fs,ds=inventory(root)
assert all(r['mode']=='0o644' and r['uid']==r['gid']==0 for r in fs)
assert all(r['mode']=='0o755' and r['uid']==r['gid']==0 for r in ds)
oldmf=(root/'RELEASE_MANIFEST.json').read_bytes();m=json.loads(oldmf)
assert m['schema_version']==1
assert {r['path']:r for r in m['published_files']}=={r['path']:{k:r[k] for k in ['path','bytes','sha256']} for r in fs if r['path']!='RELEASE_MANIFEST.json'}
target_state=[]
for kind,name in targets.items():
 p=Path(name);assert p.resolve()==p
 for parent in p.parents:assert not parent.is_symlink()
 target_state.append({'kind':kind,'path':name,'exists':os.path.lexists(p),'parentExists':p.parent.exists(),'parentSymlink':p.parent.is_symlink()})
 assert not os.path.lexists(p),'Occupied target: '+name
assert not os.path.lexists('/run/lock/review-p1-static-report-01.lock')
mem={l.split(':')[0]:int(l.split()[1])*1024 for l in Path('/proc/meminfo').read_text().splitlines() if l.startswith(('MemTotal:','MemAvailable:'))}
def cpu():return [int(v) for v in Path('/proc/stat').read_text().splitlines()[0].split()[1:]]
a=cpu();time.sleep(.25);z=cpu();delta=[v-u for u,v in zip(a,z)];total=sum(delta[:8]);idle=delta[3]+delta[4]
free={p:shutil.disk_usage(p).free for p in ['/srv/superflight-review/releases','/opt/superflight-studio/backups']}
assert min(free.values())>4*1024**3 and mem['MemAvailable']>512*1024**2
service=Path('/home/sf/assistant-context/vps/services/superflight-studio.md').read_text();index=Path('/home/sf/assistant-context/vps/INDEX.md').read_text();proc=Path('/home/sf/assistant-context/vps/PROCEDURES.md').read_text();readme=Path('/opt/superflight-studio/README_RU.txt').read_text()
rules={'indexCriticalRules':'\n'.join(index.splitlines()[:18]),'currentPublicSplit':'\n'.join(service.splitlines()[:8]),'historicalReviewHeading':[l for l in service.splitlines() if l.startswith('## Historical Review')],'documentationRule':proc.split('## Documentation Update Rule',1)[1].split('## ',1)[0],'readmePublicPointer':'\n'.join(readme.splitlines()[:4])}
class NoRedirect(urllib.request.HTTPRedirectHandler):
 def redirect_request(self,*a,**k):return None
opener=urllib.request.build_opener(NoRedirect());http=[]
urls=['https://superflight.space/review/','https://superflight.space/review/r4d/p2-free-approach/','https://superflight.space/review/r4d/p1-mapping-report/']
js=[r['path'] for r in fs if r['path'] in ['review/r4d/p2-free-approach/src/main.js','review/r4d/p2-free-approach/src/main.mjs']];assert len(js)==1
urls.append('https://superflight.space/'+js[0])
for url in urls:
 req=urllib.request.Request(url,headers={'User-Agent':'R4D-P2-final03-readonly-preparation'},method='GET')
 try:res=opener.open(req,timeout=20)
 except urllib.error.HTTPError as e:res=e
 with res:
  data=res.read();http.append({'url':url,'status':res.code,'bytes':len(data),'sha256':sha(data),'headers':{k:res.headers.get(k) for k in ['Location','Content-Type','Cache-Control','X-Robots-Tag','X-Content-Type-Options','Referrer-Policy','X-Frame-Options']}})
assert all(r['status']==200 for r in http)
for h,rel in zip(http,['review/index.html','review/r4d/p2-free-approach/index.html','review/r4d/p1-mapping-report/index.html',js[0]]):
 expected=next(r for r in fs if r['path']==rel);assert h['sha256']==expected['sha256'] and h['bytes']==expected['bytes']
after=[meta(p) for p in paths];fs2,ds2=inventory(root);assert before==after and fs2==fs and ds2==ds
result={'startedAtUtc':started,'finishedAtUtc':now(),'server_write':False,'cookiesUsed':False,'loginFollowed':False,'actualRoot':str(root),'before':before,'after':after,'files':fs,'directories':ds,'fullInventoryStableDuringRead':True,'targets':target_state,'oldP1LockAbsent':True,'reviewAuthRequestAbsent':True,'snippetBase64':base64.b64encode(snippet).decode(),'catalogBase64':base64.b64encode((root/'review/index.html').read_bytes()).decode(),'releaseManifestBase64':base64.b64encode(oldmf).decode(),'http':http,'vpsResources':{'atUtc':now(),'memoryBytes':mem,'cpuPercent':100*(total-idle)/total if total else 0,'loadAverage':list(os.getloadavg()),'freeDiskBytes':free},'operationalRules':rules,'currentJavaScriptMimeDirective':[l.strip() for l in Path('/etc/nginx/mime.types').read_text().splitlines() if 'javascript' in l]}
print(json.dumps(result,ensure_ascii=False))
'''

def snapshot():
 assert not OUT.exists(),'Occupied local final03 target: STOP, no overwrite/renumber'
 assert not subprocess.check_output(['git','status','--porcelain','--untracked-files=no'],cwd=REPO),'Tracked WIP must be reviewed'
 resource=host_resources()
 assert not OUT.exists(),'Recheck immediately before create'
 OUT.mkdir();(OUT/'tmp').mkdir();os.environ['TEMP']=os.environ['TMP']=str(OUT/'tmp');os.environ['PYTHONDONTWRITEBYTECODE']='1'
 write_new(OUT/'HOST_RESOURCES.json',jb(resource))
 code=REMOTE.replace('__TARGETS__',repr(TARGETS))
 p=subprocess.run(['ssh','-o','BatchMode=yes','-o','ConnectTimeout=15','vps1-direct','sudo -n python3 -B -'],input=code.encode(),capture_output=True,timeout=120)
 write_new(OUT/'baseline/read.stderr.log',p.stderr);assert p.returncode==0,p.stderr.decode()
 b=json.loads(p.stdout);write_new(OUT/'baseline/ACTUAL_PUBLIC.json',jb(b))
 for key,name in [('snippetBase64','review.locations.conf.before'),('catalogBase64','catalog.before.html'),('releaseManifestBase64','RELEASE_MANIFEST.before.json')]:write_new(OUT/'baseline'/name,base64.b64decode(b[key]))
 print(json.dumps({'phase':'READ_ONLY_PUBLIC_BASELINE_COMPLETE','out':str(OUT),'startedAtUtc':b['startedAtUtc'],'finishedAtUtc':b['finishedAtUtc'],'actualRoot':b['actualRoot'],'files':len(b['files']),'bytes':sum(r['bytes'] for r in b['files']),'baselineBytes':len(jb(b)),'baselineSha256':sha(jb(b)),'targetsAbsent':all(not r['exists'] for r in b['targets']),'http':b['http'],'vpsResources':b['vpsResources'],'hostResources':resource,'server_write':False},ensure_ascii=False))

def package():
 assert OUT.exists() and not (OUT/'SEALED_PACKET.json').exists() and not (OUT/'payload').exists(),'No overwrite of local packet'
 assert not subprocess.check_output(['git','status','--porcelain'],cwd=REPO),'Commit preparation source first'
 prep_head=subprocess.check_output(['git','rev-parse','HEAD'],cwd=REPO,text=True).strip()
 os.environ['TEMP']=os.environ['TMP']=str(OUT/'tmp');os.environ['PYTHONDONTWRITEBYTECODE']='1'
 write_new(OUT/'PACKAGE_RESOURCES.json',jb(host_resources()))
 braw=(OUT/'baseline/ACTUAL_PUBLIC.json').read_bytes();b=json.loads(braw)
 assert b['fullInventoryStableDuringRead'] and b['reviewAuthRequestAbsent'] and not b['server_write']
 mraw=(FROZEN/'BUILD_MANIFEST.json').read_bytes();assert sha(mraw)==MF_SHA
 m=json.loads(mraw);assert m['sourceCommit']==BUILD and m['fileCount']==16 and m['totalBytes']==2452021 and m['treeSha256']==P2_TREE
 assert sha((json.dumps(m['files'],ensure_ascii=False,separators=(',',':'))+'\n').encode())==P2_TREE
 browser=FROZEN/'bundle'/PREFIX
 assert sorted(p.relative_to(browser).as_posix() for p in browser.rglob('*') if p.is_file())==[r['path'] for r in m['files']]
 assert not any(p.is_symlink() for p in browser.rglob('*'))
 own=[]
 for row in m['files']:
  data=(browser/row['path']).read_bytes();assert len(data)==row['bytes'] and sha(data)==row['sha256']
  assert not row['path'].endswith(('.ts','.map'))
  dest=PREFIX+row['path'];write_new(OUT/'payload'/dest,data);own.append({'path':dest,'bytes':len(data),'sha256':sha(data)})
 qa_report=git(QA_REF,QA_PATH);qa_data=QA_EVIDENCE.read_bytes()
 assert len(qa_data)==249046 and sha(qa_data)=='3e216f15232893321bda29f1fa40a47a8dafaf0e51179e41777e22958b0b3410'
 qa={'commit':QA_REF,'path':QA_PATH,'reportBytes':len(qa_report),'reportSha256':sha(qa_report),'evidenceBytes':249046,'evidenceSha256':sha(qa_data),'evidencePath':str(QA_EVIDENCE),'scope':'bounded offline clock/replay/state/presentation-history invariants','unverified':['actual P2 UI/Pixi/WebGL','wall-time','DOM download','Android gestures','scene/art PASS'],'P1RenderPassInherited':False,'newQaRun':False}
 write_new(OUT/'audit/TQA_REPORT.md',qa_report);write_new(OUT/'audit/FROZEN_BUILD_MANIFEST.json',mraw)
 old_catalog=(OUT/'baseline/catalog.before.html').read_bytes();text=old_catalog.decode('utf-8')
 found=re.findall(r'<a class="card" href="\./r4d/p2-free-approach/">.*?</a>',text,re.S);assert len(found)==1
 card_before=found[0];card_after=card_before
 replacements=[('Пробный candidate-03:','Пробный candidate-04:'),('повтор по seed и пошаговый просмотр.','повтор по seed, пошаговый просмотр и темп 0,25×/0,5×/1×.'),('Статус runtime/visual-unverified: работа интерфейса и качество движения в браузере ещё не подтверждены.','Независимая offline QA подтвердила clock/replay/state/history. Actual UI/Pixi/WebGL, wall-time, DOM download и Android не проверены; качество движения и художественная приёмка не подтверждены.')]
 for old,new in replacements:assert card_after.count(old)==1;card_after=card_after.replace(old,new,1)
 assert text.count(card_before)==1
 new_catalog=text.replace(card_before,card_after,1).encode('utf-8')
 assert new_catalog.replace(card_after.encode(),card_before.encode(),1)==old_catalog
 assert text.count('./r4d/p1-mapping-report/')==1 and '<span>4 материала</span>' in text
 write_new(OUT/'payload/review/index.html',new_catalog)
 delta={'changedOnly':'existing P2 card; no new card/count change','beforeCatalogBytes':len(old_catalog),'beforeCatalogSha256':sha(old_catalog),'afterCatalogBytes':len(new_catalog),'afterCatalogSha256':sha(new_catalog),'cardBefore':card_before,'cardAfter':card_after,'exactInverse':True,'countUnchanged':'4 материала','P1CardPreserved':True}
 write_new(OUT/'audit/CATALOG_DELTA.json',jb(delta))
 old_p2=[r for r in b['files'] if r['path'].startswith(PREFIX)]
 inherited=[{k:r[k] for k in ['path','bytes','sha256']} for r in b['files'] if not r['path'].startswith(PREFIX) and r['path'] not in ['review/index.html','RELEASE_MANIFEST.json']]
 p1=[r for r in inherited if r['path'].startswith('review/r4d/p1-mapping-report/')]
 assert len(p1)==12 and sum(r['bytes'] for r in p1)==2057712 and tree(p1)=='88e934cab5ce2621cc6ad811b7bc40bcfb5ccce74262a35068654552aeeb99f7'
 files=sorted(inherited+own+[{'path':'review/index.html','bytes':len(new_catalog),'sha256':sha(new_catalog)}],key=lambda r:r['path'])
 assert len({r['path'] for r in files})==len(files)
 release={'schema_version':1,'release_id':'p2-jungle-static-candidate-04-public-final03','path_prefix':'/review/','publication_note':'LOCAL PREPARATION ONLY; proposed limited Review replacement; no server-write token; actual04 UI/runtime/art unverified','preparedAtUtc':b['finishedAtUtc'],'preparationSourceCommit':prep_head,'previous_release':b['actualRoot'],'previous_manifest':next(r for r in b['files'] if r['path']=='RELEASE_MANIFEST.json'),'p2':{'buildCommit':BUILD,'implementationCommit':IMPLEMENTATION,'frozenManifestSha256':MF_SHA,'files':16,'bytes':2452021,'treeSha256':P2_TREE,'qa':qa},'preservation':{'opaqueForeignFiles':len(inherited),'P1Files':len(p1),'P1Bytes':sum(r['bytes'] for r in p1),'P1OpaqueTreeSha256':tree(p1),'catalogCountUnchanged':'4 материала'},'published_file_count':len(files),'published_bytes':sum(r['bytes'] for r in files),'published_files':files}
 release_raw=jb(release);write_new(OUT/'payload/RELEASE_MANIFEST.json',release_raw)
 planned_files=sorted(files+[{'path':'RELEASE_MANIFEST.json','bytes':len(release_raw),'sha256':sha(release_raw)}],key=lambda r:r['path'])
 dirs={r['path'] for r in b['directories'] if r['path']!=PREFIX.rstrip('/') and not r['path'].startswith(PREFIX)}
 for row in planned_files:
  parent=Path(row['path']).parent
  while parent.as_posix()!='.':dirs.add(parent.as_posix());parent=parent.parent
 planned={'files':[dict(r,mode='0o644',uid=0,gid=0,symlink=False) for r in planned_files],'directories':[{'path':p,'mode':'0o755','uid':0,'gid':0,'symlink':False} for p in sorted(dirs)],'fileCount':len(planned_files),'totalBytes':sum(r['bytes'] for r in planned_files),'treeSha256':tree(planned_files)}
 write_new(OUT/'PLANNED_INVENTORY.json',jb(planned))
 before=(OUT/'baseline/review.locations.conf.before').read_bytes();old_literal=('root '+b['actualRoot']+';').encode();new_literal=('root '+TARGETS['newRoot']+';').encode()
 assert before.count(old_literal)==1 and b'auth_request' not in before
 after=before.replace(old_literal,new_literal,1);assert after.replace(new_literal,old_literal,1)==before
 write_new(OUT/'plan/review.locations.conf.after',after)
 archive=OUT/'p2-candidate-04-public-final03.payload.tar';payload_rows=[]
 with tarfile.open(archive,'x',format=tarfile.USTAR_FORMAT) as tar:
  for p in sorted(q for q in (OUT/'payload').rglob('*') if q.is_file()):
   data=p.read_bytes();rel=p.relative_to(OUT/'payload').as_posix();t=tarfile.TarInfo(rel);t.size=len(data);t.mode=0o644;t.uid=t.gid=0;t.mtime=0;tar.addfile(t,io.BytesIO(data));payload_rows.append({'path':rel,'bytes':len(data),'sha256':sha(data)})
 archive_raw=archive.read_bytes();assert len(payload_rows)==18
 with tarfile.open(archive,'r:') as tar:
  members=tar.getmembers();assert [t.name for t in members]==[r['path'] for r in payload_rows]
  for t,r in zip(members,payload_rows):assert t.isfile() and not t.issym() and not t.islnk() and '..' not in Path(t.name).parts and not t.name.startswith('/') and sha(tar.extractfile(t).read())==r['sha256']
 preservation={'opaqueForeignFiles':len(inherited),'oldP2Files':len(old_p2),'oldP2Bytes':sum(r['bytes'] for r in old_p2),'newP2Files':16,'newP2Bytes':2452021,'foreignRowsExact':all(next(x for x in files if x['path']==r['path'])==r for r in inherited),'P1OpaqueFiles':p1,'P1OpaqueTreeSha256':tree(p1),'catalogInverseExact':True,'frozen04FileBytesUnchanged':True,'noProductCodeExecuted':True,'newQaRun':False,'server_write':False}
 write_new(OUT/'audit/PRESERVATION_PROOF.json',jb(preservation))
 intent={'schema':'r4d.p2.public-release-intent.final03','status':'IMMUTABLE_LOCAL_READY_AWAIT_ROOT_REVIEW_NEW_EXACT_CTO_TOKEN','server_write':False,'executionAuthorized':False,'newCtoTokenRequired':True,'oldP1TokenNotReused':True,'P1WindowReleasedAtUtc':'2026-10-28T15:47:25Z (Root/CTO instruction)','preparationSourceCommit':prep_head,'checkpointAtStart':'eed2759a57c83356a98b1d5fd900b7ea0cb26b31','actualTurnId':None,'actualTurnIdReason':'not exposed by tool API/CODEX_TURN_ID','buildCommit':BUILD,'implementationCommit':IMPLEMENTATION,'frozenArtifact':str(FROZEN),'frozenManifestBytes':len(mraw),'frozenManifestSha256':MF_SHA,'frozenFiles':16,'frozenBytes':2452021,'frozenTreeSha256':P2_TREE,'qa':qa,'baseline':{'path':'baseline/ACTUAL_PUBLIC.json','bytes':len(braw),'sha256':sha(braw),'startedAtUtc':b['startedAtUtc'],'finishedAtUtc':b['finishedAtUtc'],'actualRoot':b['actualRoot'],'files':len(b['files']),'bytesTotal':sum(r['bytes'] for r in b['files']),'rawConfigs':b['before'],'targetAbsence':b['targets'],'newFreshGuardsRequiredBeforeFirstWriteIncludingLock':True},'targets':TARGETS,'archive':{'path':archive.name,'bytes':len(archive_raw),'sha256':sha(archive_raw),'files':payload_rows,'semantics':'18-leaf delta over exact guarded inherited current PUBLIC release; not standalone tree'},'planned':{'inventoryPath':'PLANNED_INVENTORY.json','inventorySha256':sha(jb(planned)),'files':len(planned_files),'bytes':planned['totalBytes'],'treeSha256':planned['treeSha256'],'manifestBytes':len(release_raw),'manifestSha256':sha(release_raw),'opaqueForeignFiles':len(inherited),'oldP2Files':len(old_p2)},'catalog':delta,'snippet':{'beforeBytes':len(before),'beforeSha256':sha(before),'afterBytes':len(after),'afterSha256':sha(after),'change':'one exact RAW PUBLIC root literal; every other byte preserved; no normalized guard/template','rollback':'fresh current PUBLIC before bytes only, captured again directly before future switch; current P1 oldroot intact required'},'writeSetDocument':'EXECUTION_PLAN.md','documentationTemplate':'DOCUMENTATION_APPEND_TEMPLATE.md','limitations':['No new server-write token or release authorization','No build/QA/physics/imagegen/source/art fixes','No inherited P1 render PASS for P2','P2 UI/Pixi/WebGL/wall-time/download/Android/scene-art unverified','Only four occluders; remaining obstacles/railings/basket rims unchanged','Old protected final01/final02 are obsolete and retained unchanged'],'notPublished':True}
 plan=execution_plan(intent,b,qa)
 template=documentation_template(intent)
 write_new(OUT/'EXECUTION_PLAN.md',plan.encode());write_new(OUT/'DOCUMENTATION_APPEND_TEMPLATE.md',template.encode())
 intent['writeSetDocumentBytes']=len(plan.encode());intent['writeSetDocumentSha256']=sha(plan.encode());intent['documentationTemplateBytes']=len(template.encode());intent['documentationTemplateSha256']=sha(template.encode())
 intent['preparationScript']={'path':str(Path(__file__).relative_to(REPO)).replace('\\','/'),'sha256':sha(Path(__file__).read_bytes())}
 write_new(OUT/'RELEASE_INTENT.json',jb(intent))
 names=['RELEASE_INTENT.json',archive.name,'PLANNED_INVENTORY.json','EXECUTION_PLAN.md','DOCUMENTATION_APPEND_TEMPLATE.md','HOST_RESOURCES.json','PACKAGE_RESOURCES.json','baseline/ACTUAL_PUBLIC.json','baseline/review.locations.conf.before','baseline/catalog.before.html','baseline/RELEASE_MANIFEST.before.json','plan/review.locations.conf.after','audit/TQA_REPORT.md','audit/FROZEN_BUILD_MANIFEST.json','audit/PRESERVATION_PROOF.json','audit/CATALOG_DELTA.json']
 sealed={'status':'LOCAL_PACKET_VALIDATED_NOT_AUTHORIZED','server_write':False,'newCtoTokenRequired':True,'newQaRun':False,'files':[{'path':name,'bytes':(OUT/name).stat().st_size,'sha256':sha((OUT/name).read_bytes())} for name in names]}
 write_new(OUT/'SEALED_PACKET.json',jb(sealed))
 print(json.dumps({'intentBytes':len(jb(intent)),'intentSha256':sha(jb(intent)),'archiveBytes':len(archive_raw),'archiveSha256':sha(archive_raw),'planned':intent['planned'],'snippet':intent['snippet'],'catalogAfterBytes':len(new_catalog),'catalogAfterSha256':sha(new_catalog),'sealedBytes':len(jb(sealed)),'sealedSha256':sha(jb(sealed)),'sourceCommit':prep_head,'qaReportBytes':len(qa_report),'qaReportSha256':sha(qa_report),'server_write':False}))

def execution_plan(i,b,qa):
 t=i['targets'];old=b['actualRoot'];sn=i['snippet'];p=i['planned'];a=i['archive']
 return f'''# P2 frozen04 PUBLIC final03 — LOCAL plan, server_write=false

Только Root review. Нового server-write token нет. Нужны отдельный exact Lead/CTO
gate и НОВЫЙ single-use token, bound финальными intent/plan/sealed/archive hashes.
Старый P1 token закрыт/не используется; final01/final02 obsolete сохраняются.
Эта подготовка не выполняла ни одного server write. Нет deploy execution mode.

## Exact identity / privacy

Build {BUILD}; implementation {IMPLEMENTATION}; frozen manifest {MF_SHA}.
16 immutable browser files/2452021 bytes/tree {P2_TREE}, включая только уже
разрешённые compiled runtime/JS, public inputs JSON, Pixi/license, JPG/PNG/CSS.
Никаких raw private core TS/maps/research configs/logs/full source/audit в /review.
Существующий public config из frozen allowlist не является новым private input.
Архив {a['path']}: {a['bytes']} bytes/SHA {a['sha256']},18 regular leaves.
Это delta, НЕ standalone full tree. Общий planned release {p['files']} files/
{p['bytes']} bytes/tree {p['treeSha256']}; root-level manifest {p['manifestBytes']}
bytes/SHA {p['manifestSha256']}, вне browser subtree.

Independent TQA {QA_REF}: boundedoffline clock/replay/state/history invariants.
Evidence249046 bytes/SHA {qa['evidenceSha256']}. UI/Pixi/WebGL/wall-time/DOM
download/Android/ArtPASS не проверены. P1 PUBLIC render PASS не наследуется P2.
Нет нового build/physics/QA/reannotation/imagegen/gesture/size/height/occlusion fix.

## Fresh PUBLIC baseline / future guards

Actual read {b['startedAtUtc']}–{b['finishedAtUtc']}; actual root {old}.
{len(b['files'])}files/{sum(r['bytes'] for r in b['files'])}bytes; files0644/dirs0755/
root:root/no symlinks, coherent raw docs/config/files+dirs before/after.
Все approved raw doc/vhost/globalMIME hashes и owners/modes — baseline snapshot.
Catalog/P2/P1/current P2JS HTTP200/exact saved bytes; .js application/javascript.
Все восемь new targets absent; ancestors no symlinks. Этот dated receipt НЕ
заменяет новый actual guard после token перед ПЕРВЫМ write, включая lock.

Before snippet {sn['beforeBytes']} bytes/SHA {sn['beforeSha256']}; after
{sn['afterBytes']} bytes/SHA {sn['afterSha256']}. Ровно один RAW root literal,
все остальные PUBLIC bytes unchanged, auth_request отсутствует. Никаких
protected templates/old backups/root-normalized guards/credentials/security/
firewall/ports/globalMIME/vhost edits. Rollback — только current PUBLIC snapshot.

## Полный future write-set (сейчас НЕ выполняется)

- Exclusive own nonce/inode lock: {t['lock']}; удалить только matching owned inode/nonce.
- Новый exact archive upload: {t['upload']}.
- Новое stage tree: {t['staging']}; final absent immutable root: {t['newRoot']}.
- Новая PRIVATE backup/evidence dir: {t['backup']}. Только exact
  review.locations.conf.before, superflight-studio.md.before, CHANGELOG.md.before,
  RELEASE_INTENT.json, EXECUTION_PLAN.md, BASELINE_GUARD.json, PAYLOAD_CHECKS.json,
  PRE_SWITCH_GUARD.json, POSTCHECKS.json, PUBLIC_RENDER_RECEIPT.json,
  DOCS_RESULT.json и условный ROLLBACK_RESULT.json. Без DB/session/credentials
  или чужих app sources/full private nginx config.
- Snippet temp {t['snippetTemp']} -> /etc/nginx/snippets/review.locations.conf,
  root:root0644, atomic replace exact after bytes только после fresh guards.
- Append-only /home/sf/assistant-context/vps/services/superflight-studio.md через
  {t['serviceDocTemp']}; /home/sf/assistant-context/vps/CHANGELOG.md через
  {t['changelogTemp']}. Fresh old-prefix hashes и uid/gid/modes из actual baseline
  сохранить (сейчас1003/27/0640). Только фактические delivery/QA/limitations.
- nginx-t до/после будущего switch, graceful reload и active check. Другие
  services/ports/settings не менять. Архив/backup/old/final releases не удалять.

## Bound execution phases после нового exact token

1. Fresh own checkout/phase/sessions и system-wide host+VPS resources.4/2GiB:
   <=4 warn/diagnose; <=2 checkpoint/stop. Own0.25GiB RAM/0.1GiB E плюс allowance
   P4/Millionko4GiB RAM/2GiB E; это план, не измеренные future чужие пики.
   Process-local E TEMP/TMP/cache/output; не останавливать чужие процессы.
2. До lock: RAW current root/snippet/vhost/MIME/docs + дважды полный old files+
   dirs/hash/bytes/owners/modes/no symlinks exact baseline; current catalog/P2/P1
   HTTP bytes exact.8target absences/ancestors exact. Any drift/unowned target
   ->STOP Root/CTO до любого write, не silent rebase/rename/номер04.
3. Свой exclusive lock с intent hash/nonce; repeat guards под lock. Новая
   private backup dir; fresh exact PUBLIC before snippet и два doc snapshots.
   Upload archive в absent path, validate SHA/size/18 regular entries/no links/
   no traversal/allowlist до extraction. Новый stage. Копировать отдельными
   inode только {p['opaqueForeignFiles']} opaque inherited files (без старого
   P2prefix, catalog и root manifest), сохраняя foreign dirs/owners/modes.
   Наложить18 payload leaves; в P2 subtree ровно16 frozen files, никаких stale
   oldP2 leaves. Не удалять/переписывать live old subtree.
4. Full planned files+dirs exact; все {p['opaqueForeignFiles']} foreign rows
   unchanged, P1card/count4 и12P1files/2057712bytes/tree88e934… сохранены.
   Нет symlinks/hardlinks между source и stage. Old root повторно exact.
   Atomic NOREPLACE stage→newroot, только при absence финального пути.
5. Непосредственно перед switch снова raw guards/full old+new inventory/
   own phase/nonce/inode; actual fresh PUBLIC rollback snapshot непосредственно
   перед switch (не по имени backupdir). nginx-t; exact temp+atomic snippet
   replacement; nginx-t/graceful reload/active. Ни чужие edits, ни поздний drift
   не затирать. Partial continuation только phase-aware, не пустой restart.
6. Actual no-cookie PUBLIC catalog+все16P2files200/exactbytes/SHA/MIME/headers,
   все .js application/javascript; полный {p['files']}-file inventory, foreign
   rows и old root exact; P1/all12 unchanged, catalog только own P2card/count4.
   Не объявлять actual04 UI/WebGL/timing/download/Android/art PASS по hashes
   или по P1 view. Новый actual04 PUBLIC view/QA только отдельным заданием Root.
7. После фактических delivery observations — bound append template двух docs,
   fresh old bytes/uid/gid/mode guards, atomic declared temps, oldprefix exact.
   Actual limitations/render status, без выдуманного PASS. Затем final checks,
   private receipts и только own matching lock/temp completion. CTO окно
   освободит отдельно; switch или lock cleanup сами по себе не release окна.

## Current PUBLIC rollback, не исполнен

Только в будущем token scope/решении Lead при exact live after SHA
{sn['afterSha256']}, root {t['newRoot']}, unchanged vhost/MIME/oldroot.
Если чужой drift — STOP, не overwrite. Свежий backup должен совпадать с
current PUBLIC before {sn['beforeBytes']} bytes/{sn['beforeSha256']} и не иметь
auth_request. Восстановить только эти exact bytes через declared owned temp,
root:root0644/atomic replace, nginx-t/graceful reload/active/public checks.
Никаких protected history, DB/session restore, deletion immutable releases,
глобальных settings. Непроверенный render сам по себе не доказанный дефект.

Новый real tool denial — exact action/target/call/reason STOP этой операции,
без split/другого actor/browser/server/renderer/model обхода. Capacity !=policy.
После LOCAL handoff остановка для Rootreview; ни один write сейчас не разрешён.
'''

def documentation_template(i):
 return f'''# Future private documentation append template, preparation only

Ничего не записано на VPS. После нового exact token и actual delivery append
service doc и CHANGELOG с сохранением oldbyteprefix/uid/gid/mode. Подстановки
только actual observed values; не публиковать literal token.

## Service doc append

## R4D P2 candidate04 limited Review — {{{{ACTUAL_UTC}}}}

Status {{{{ACTUAL_DELIVERY_STATUS}}}}. Exact authorization receipt identity
{{{{AUTHORIZATION_RECEIPT_ID_WITHOUT_TOKEN}}}}; actual switch/nginx/active
{{{{ACTUAL_SWITCH_RESULT}}}}. Build {BUILD}; implementation {IMPLEMENTATION};
frozen manifest {MF_SHA};16files/2452021bytes/tree {P2_TREE}.
TQA {QA_REF} boundedoffline only; actual04 UI/Pixi/WebGL/wall-time/DOMdownload/
Android/art remain unverified unless separate actual observations are recorded.
P1 render PASS not inherited. Four occluders only; no touch/size/height fixes.
Archive {i['archive']['bytes']}bytes/SHA{i['archive']['sha256']}; root
{i['targets']['newRoot']}; planned{i['planned']['files']}files/
{i['planned']['bytes']}bytes/tree{i['planned']['treeSha256']}; manifest
{i['planned']['manifestBytes']}bytes/SHA{i['planned']['manifestSha256']}.
Actual preservation/P1/counter4/foreign inventory {{{{ACTUAL_PRESERVATION_RESULT}}}}.
PUBLIC HTTP/16file bytes/MIME/header results {{{{ACTUAL_HTTP_RESULTS}}}}.
Actual P2 render/limitations {{{{ACTUAL_RENDER_OR_UNVERIFIED_STATUS}}}}.
Fresh rollback snapshot/private receipts {i['targets']['backup']}; only current
PUBLIC before exact bytes, no protected auth/template/session restore.
Actual rollback/failure {{{{ACTUAL_ROLLBACK_OR_FAILURE_STATUS}}}}.
CTO window remains held until separate explicit release.

## CHANGELOG append

## {{{{ACTUAL_UTC}}}} — R4D P2 candidate04 limited delivery

{{{{ACTUAL_DELIVERY_STATUS}}}}; actual PUBLIC result {{{{ACTUAL_HTTP_RESULTS}}}}.
16 exact frozen files, boundedoffline TQA; actual render/limitations
{{{{ACTUAL_RENDER_OR_UNVERIFIED_STATUS}}}}. P1/other files/card count4 preserved
{{{{ACTUAL_PRESERVATION_RESULT}}}}. Current PUBLIC root-only switch/guarded
rollback; actual outcome {{{{ACTUAL_ROLLBACK_OR_FAILURE_STATUS}}}}. Service doc
and declared private evidence contain exact hashes and execution receipt.
'''

if __name__=='__main__':
 assert len(sys.argv)==2 and sys.argv[1] in ['snapshot','package']
 {'snapshot':snapshot,'package':package}[sys.argv[1]]()
