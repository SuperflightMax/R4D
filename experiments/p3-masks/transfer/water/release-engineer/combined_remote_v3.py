"""Future exact combined write, not executed during intent preparation."""
import datetime,hashlib,json,os,re,shutil,stat,subprocess,tarfile
import http.client as http_client
from pathlib import Path,PurePosixPath

def sha(data):return hashlib.sha256(data).hexdigest()
def now():return datetime.datetime.now(datetime.timezone.utc).isoformat()
def canonical(data):return json.dumps(data,sort_keys=True,separators=(',',':'),ensure_ascii=False).encode()
def require(ok,reason):
    if not ok:raise RuntimeError('STOP: '+reason)
def absent(path):require(not os.path.lexists(path),'occupied target '+str(path))
def save(path,data):
    path.write_bytes((json.dumps(data,ensure_ascii=False,indent=2)+'\n').encode());os.chmod(path,0o644)

def tree(root):
    files=[];dirs=[]
    for p in [root]+sorted(root.rglob('*')):
        st=p.lstat();require(not stat.S_ISLNK(st.st_mode),'symlink '+str(p))
        row={'path':p.relative_to(root).as_posix(),'uid':st.st_uid,'gid':st.st_gid,'mode':stat.S_IMODE(st.st_mode)}
        if p.is_dir():dirs.append(row)
        else:
            require(p.is_file(),'nonregular '+str(p));data=p.read_bytes()
            files.append({**row,'bytes':len(data),'sha256':sha(data)})
    files.sort(key=lambda x:x['path']);dirs.sort(key=lambda x:x['path'])
    return {'files':files,'directories':dirs}


HTTP_HEADER_NAMES=('Location','X-Frame-Options','Cache-Control','X-Robots-Tag',
                   'X-Content-Type-Options','Referrer-Policy','Content-Type')
CLOSED_TOKENS=('CTO-P3-F01-20261028T064706Z-ddfe257b6856',
               'CTO-P3-WD04-20261029T142713Z-ae0b1054d192',
               'CTO-P3-WD04-V2-20261029T144858Z-91df426327f8')

class EvidenceError(RuntimeError):
    def __init__(self,reason,evidence):
        super().__init__('STOP: '+reason);self.evidence=evidence

def require_evidence(ok,reason,evidence):
    if not ok:raise EvidenceError(reason,evidence)

def http_probe(host,path,foreign=False):
    """One GET, no redirects/auth; only digest/length/selected headers survive."""
    c=None;digest=hashlib.sha256();count=0
    result={'path':path,'foreignOrigin':foreign,'startedUtc':now(),
            'status':None,'headers':{},'bodyComplete':False}
    try:
        c=http_client.HTTPSConnection(host,timeout=25)
        headers={'User-Agent':'R4D-P3-combined-delivery/1'}
        if foreign:headers['Origin']='https://example.invalid'
        c.request('GET',path,headers=headers);r=c.getresponse()
        result.update(responseUtc=now(),status=r.status,
                      headers={k:r.getheader(k) for k in HTTP_HEADER_NAMES})
        while True:
            chunk=r.read(65536)
            if not chunk:break
            digest.update(chunk);count+=len(chunk)
        result.update(bodyBytes=count,bodySha256=digest.hexdigest(),bodyComplete=True)
        return result
    except Exception as error:
        result.update(bodyBytes=count,bodySha256=digest.hexdigest(),bodyComplete=False)
        raise EvidenceError('HTTP request failed: '+type(error).__name__+': '+str(error),
                            {'httpObservations':[result]}) from error
    finally:
        if c is not None:c.close()

def collect_http(host,requests):
    observations=[]
    for path,foreign in requests:
        try:observations.append(http_probe(host,path,foreign))
        except EvidenceError as error:
            partial=error.evidence.get('httpObservations',[])
            raise EvidenceError(str(error).removeprefix('STOP: '),
                                {'httpObservations':observations+partial}) from error
    return observations

def verify_protection(observations,baseline,catalog_key):
    evidence={'httpObservations':observations,'catalogBinding':catalog_key}
    require_evidence(len(observations)==3,'expected exactly three protection observations',evidence)
    require_evidence([(r['path'],r['foreignOrigin']) for r in observations]==
                     [('/review/',False),('/review/',True),('/review/.p3-combined-probe',False)],
                     'protection request context differs',evidence)
    require_evidence([r['status'] for r in observations]==baseline['statuses'],
                     'strict protection statuses differ',evidence)
    require_evidence(all(r['bodyComplete'] and r['headers']==baseline['headers'] for r in observations),
                     'strict seven protection headers/completeness differ',evidence)
    expected=baseline[catalog_key];normal=observations[0]
    require_evidence(normal['bodyBytes']==expected['bytes'] and normal['bodySha256']==expected['sha256'],
                     'normal catalog body identity differs',evidence)
    return True

def verify_payload(observation,expected,policy):
    """Report actual access limitations; never promote HTML/denial to module success."""
    evidence={'httpObservations':[observation],'expectedPayload':expected}
    require_evidence(observation['bodyComplete'],'resource body incomplete',evidence)
    status=observation['status'];content_type=(observation['headers'].get('Content-Type') or '').split(';',1)[0].strip().lower()
    result={'path':observation['path'],'status':status,'payloadIdentityVerified':False,
            'javascriptMimeVerified':False if expected['kind']=='javascript' else None,
            'moduleMimeBodyVerified':False if expected['kind']=='javascript' else None,
            'outcome':'UNVERIFIED','reason':None}
    if status in policy['accessLimitationStatuses']:
        result.update(outcome='UNVERIFIED_ACCESS_RESPONSE',reason='No approved payload established; no access bypass')
        return result
    require_evidence(status==200,'unexpected resource status',evidence)
    matches=observation['bodyBytes']==expected['bytes'] and observation['bodySha256']==expected['sha256']
    if not matches:
        if content_type=='text/html':
            result.update(outcome='UNVERIFIED_HTML_RESPONSE',reason='HTML200 differs from approved payload; login/scene not inferred')
            return result
        raise EvidenceError('resource body identity differs',evidence)
    result['payloadIdentityVerified']=True
    if expected['kind']=='javascript':
        result['javascriptMimeVerified']=content_type in policy['javascriptMimeTypes']
        result['moduleMimeBodyVerified']=result['javascriptMimeVerified']
        result.update(outcome='VERIFIED' if result['moduleMimeBodyVerified'] else 'UNVERIFIED_MODULE_MIME',
                      reason=None if result['moduleMimeBodyVerified'] else 'Exact JS bytes but response MIME not an accepted JavaScript type')
    else:result['outcome']='VERIFIED'
    return result

def opaque_doc_snapshot(path,prefix_bytes=None):
    st=path.lstat();require(stat.S_ISREG(st.st_mode),'documentation target not regular')
    full=hashlib.sha256();prefix=hashlib.sha256();count=0;remaining=prefix_bytes
    with path.open('rb') as stream:
        while True:
            chunk=stream.read(65536)
            if not chunk:break
            full.update(chunk);count+=len(chunk)
            if remaining is not None and remaining>0:
                size=min(remaining,len(chunk));prefix.update(chunk[:size]);remaining-=size
    require(count==st.st_size,'documentation changed during snapshot')
    result={'path':str(path),'inode':st.st_ino,'uid':st.st_uid,'gid':st.st_gid,
            'mode':stat.S_IMODE(st.st_mode),'bytes':count,'sha256':full.hexdigest()}
    if prefix_bytes is not None:
        require(remaining==0,'documentation original prefix shorter than before')
        result.update(prefixBytes=prefix_bytes,prefixSha256=prefix.hexdigest())
    return result

def verify_doc_prefix(before,after):
    proof={'docsBefore':before,'docsAfter':after}
    require_evidence(all(before[k]==after[k] for k in ['path','inode','uid','gid','mode']),
                     'documentation identity/metadata changed',proof)
    require_evidence(after['bytes']>=before['bytes'] and after['prefixBytes']==before['bytes'] and
                     after['prefixSha256']==before['sha256'],'documentation original prefix changed',proof)
    return True

def append_document(path,data,before):
    require_evidence(opaque_doc_snapshot(path)==before,'documentation drift immediately before append',{'docsBefore':before})
    with path.open('ab') as stream:
        current=os.fstat(stream.fileno())
        require_evidence((current.st_ino,current.st_uid,current.st_gid,stat.S_IMODE(current.st_mode),current.st_size)==
                         (before['inode'],before['uid'],before['gid'],before['mode'],before['bytes']),
                         'documentation open-file identity changed',{'docsBefore':before})
        stream.write(data);stream.flush();os.fsync(stream.fileno())
    after=opaque_doc_snapshot(path,before['bytes']);verify_doc_prefix(before,after)
    return {'before':before,'after':after,'originalPrefixAndMetadataPreserved':True}


def run(s,auth,phase,actual_source_hash):
    # Local approved launcher also verifies its own bytes, scope bytes and source bytes.
    scope_hash=sha((json.dumps(s,ensure_ascii=False,indent=2)+'\n').encode())
    require(os.geteuid()==0,'euid0 required before any future write; no auto-escalation')
    require(auth.get('serverWrite') is True and bool(auth.get('token')),'new explicit CTO authorization missing')
    require(auth.get('windowOwner')==s['windowOwner'],'window owner mismatch')
    require(auth.get('scopeSha256')==scope_hash,'authorization scope mismatch')
    require(auth.get('scriptSha256')==actual_source_hash,'authorization script mismatch')
    require(auth.get('archiveSha256')==s['archive']['sha256'],'authorization archive mismatch')
    require(auth.get('releaseManifestSha256')==s['releaseManifest']['sha256'],'authorization manifest mismatch')
    require(auth.get('releaseId')==s['releaseId'] and phase in auth.get('authorizedPhases',[]),'phase not authorized')
    require(auth['token'] not in CLOSED_TOKENS,'closed historical token cannot be reused')
    require(s['publicHost']==s['httpBaseline']['context']['host'] and s['transport']==s['httpBaseline']['context']['transport'],'HTTP baseline context differs')
    old=Path(s['oldRoot']);new=Path(s['newRoot']);backup=Path(s['backup'])
    snippet=Path(s['snippet']);temp=Path(s['tempSnippet']);archive=Path(s['archiveRemotePath'])
    pattern=rb'(^\s*root\s+)([^;\s]+)(\s*;)'
    def resource():
        v=os.statvfs(old)
        mem={l.split(':')[0]:int(l.split()[1])*1024 for l in Path('/proc/meminfo').read_text().splitlines() if l.startswith(('MemTotal:','MemAvailable:'))}
        return {'utc':now(),'memBytes':mem,'cpuCount':os.cpu_count(),'loadAverage':os.getloadavg(),'diskFreeBytes':v.f_bavail*v.f_frsize}
    def snip(root,digest):
        b=snippet.read_bytes();require(sha(b)==digest,'live snippet drift')
        parts=re.findall(pattern,b,re.M);require(len(parts)==1 and parts[0][1]==str(root).encode(),'live root drift')
        normal=re.sub(pattern,lambda m:m[1]+b'<REVIEW_ROOT>'+m[3],b,flags=re.M)
        require(sha(normal)==s['normalizedSnippetSha256'],'normalized config drift')
        st=snippet.stat();require(st.st_uid==st.st_gid==0 and stat.S_IMODE(st.st_mode)==0o644,'snippet metadata drift')
        return b
    def baseline():
        snip(old,s['oldSnippetSha256']);t=tree(old)
        require(sha(canonical(t))==s['baselineMetadataSha256'],'opaque baseline metadata/bytes drift')
        require(sha((old/'RELEASE_MANIFEST.json').read_bytes())==s['oldManifestSha256'],'old manifest drift')
        return t
    def newguard():
        t=tree(new);require(sha(canonical(t))==s['fullNewMetadataSha256'],'new full tree mismatch')
        require(sha((new/'RELEASE_MANIFEST.json').read_bytes())==s['releaseManifest']['sha256'],'new manifest mismatch')
        return t
    def state():
        st=json.loads((backup/'STATE.json').read_bytes())
        require(st['token']==auth['token'] and st['scopeSha256']==scope_hash,'backup ownership/authorization mismatch')
        require(sha((backup/'review.locations.conf.before').read_bytes())==s['oldSnippetSha256'],'before snapshot mismatch')
        return st
    def persist(st,published=False):
        save(backup/'STATE.json',st)
        if published:save(backup/'PUBLISHED.json',st)
    def nginx_test():
        p=subprocess.run(['nginx','-t'],stdout=subprocess.PIPE,stderr=subprocess.PIPE)
        require(p.returncode==0,'nginx -t failed; config not printed')
    def reload():require(subprocess.run(['systemctl','reload','nginx']).returncode==0,'graceful reload failed')
    def restore(before):
        snip(new,s['newSnippetSha256']);absent(temp)
        require(sha(before)==s['oldSnippetSha256'],'rollback source mismatch')
        require(sha(canonical(tree(old)))==s['baselineMetadataSha256'],'old root changed; cannot restore')
        with temp.open('xb') as f:f.write(before)
        os.chmod(temp,0o644);os.replace(temp,snippet);nginx_test();reload();snip(old,s['oldSnippetSha256'])
    if phase in ('preflight','begin'):
        for p in s['preconditions']:absent(p)
        t=baseline();res=resource()
        require(res['diskFreeBytes']>s['fullNewCount']['bytes']+s['archive']['bytes']+1048576,'space below actual operation need')
        checks=collect_http(s['publicHost'],[('/review/',False),('/review/',True),('/review/.p3-combined-probe',False)])
        verify_protection(checks,s['httpBaseline'],'catalogBefore')
        if phase=='preflight':return {'status':'PREFLIGHT_PASS','utc':now(),'euid':os.geteuid(),'resources':res,'serverWrites':False,'httpObservations':checks,'baselineMetadataSha256':s['baselineMetadataSha256'],'absentTargets':s['preconditions']}
        # The complete baseline was just verified; only these declared backup files are created.
        before=snip(old,s['oldSnippetSha256']);backup.mkdir(mode=0o700)
        (backup/'review.locations.conf.before').write_bytes(before);os.chmod(backup/'review.locations.conf.before',0o644)
        st={'token':auth['token'],'scopeSha256':scope_hash,'scriptSha256':actual_source_hash,'status':'BACKUP_CREATED',
            'backupUtc':now(),'beforeHttp':checks,'resourcesBeforeWrite':res,'oldRoot':str(old),'newRoot':str(new)}
        persist(st);return st
    st=state()
    if phase=='stage':
        require(st['status']=='UPLOADED','unexpected stage state');base=baseline();absent(new);absent(temp)
        require(archive.stat().st_size==s['archive']['bytes'] and sha(archive.read_bytes())==s['archive']['sha256'],'archive mismatch')
        res=resource();require(res['diskFreeBytes']>s['fullNewCount']['bytes']+1048576,'space below exact new tree need')
        shutil.copytree(old,new,copy_function=shutil.copy2)
        # Preserve all foreign uid/gid/modes, including the legacy 1003:27 entries.
        for row in base['directories']+base['files']:
            p=new/row['path'];os.chown(p,row['uid'],row['gid']);os.chmod(p,row['mode'])
        require(sha(canonical(tree(new)))==s['baselineMetadataSha256'],'opaque clone differs before overlay')
        expected={f['path']:f for f in s['overlayFiles']};expected_dirs={d['path']:d for d in s['overlayDirectories']};seen=set()
        old_files={f['path']:f for f in base['files']}
        with tarfile.open(archive,'r:gz') as tar:
            for member in tar:
                name=PurePosixPath(member.name);require(not name.is_absolute() and '..' not in name.parts,'unsafe archive path')
                key=name.as_posix();target=new.joinpath(*name.parts)
                require(member.uid==member.gid==0,'unexpected overlay owner')
                if member.isdir():
                    require(key in expected_dirs and member.mode==0o755,'unexpected overlay directory')
                    if target.exists():
                        mt=target.stat();require(mt.st_uid==mt.st_gid==0 and stat.S_IMODE(mt.st_mode)==0o755,'foreign parent metadata differs')
                    else:target.mkdir(mode=0o755);os.chmod(target,0o755)
                    continue
                require(member.isfile() and key in expected and key not in seen and member.mode==0o644,'unexpected overlay entry')
                seen.add(key);data=tar.extractfile(member).read();wanted=expected[key]
                require(len(data)==wanted['bytes'] and sha(data)==wanted['sha256'],'overlay file identity mismatch')
                if key in s['replaceInClone']:
                    require(target.is_file() and sha(target.read_bytes())==old_files[key]['sha256'],'clone replacement drift')
                    mode='wb'
                else:absent(target);mode='xb'
                with target.open(mode) as f:f.write(data)
                os.chown(target,0,0);os.chmod(target,0o644)
        require(seen==set(expected),'overlay entries incomplete')
        baseline();newguard()
        st.update(status='STAGED_VERIFIED',stagedUtc=now(),resourcesBeforeStage=res);persist(st)
        return {'status':st['status'],'utc':now(),'newTree':s['fullNewCount'],'metadataSha256':s['fullNewMetadataSha256']}
    if phase=='switch':
        require(st['status']=='STAGED_VERIFIED','unexpected switch state')
        require(auth.get('rollbackAllowed') is True,'token must authorize exact consistency rollback')
        baseline();newguard();absent(temp)
        require(sha(archive.read_bytes())==s['archive']['sha256'],'archive changed before switch')
        before=snip(old,s['oldSnippetSha256'])
        (backup/'review.locations.conf.before').write_bytes(before);os.chmod(backup/'review.locations.conf.before',0o644)
        st.update(beforeSwitchUtc=now(),resourcesBeforeSwitch=resource());persist(st)
        nginx_test();candidate=re.sub(pattern,lambda m:m[1]+str(new).encode()+m[3],before,flags=re.M)
        require(len(candidate)==s['newSnippetBytes'] and sha(candidate)==s['newSnippetSha256'],'candidate snippet mismatch')
        with temp.open('xb') as f:f.write(candidate)
        os.chmod(temp,0o644);snip(old,s['oldSnippetSha256']);os.replace(temp,snippet)
        switched=now()
        try:nginx_test();reload();snip(new,s['newSnippetSha256'])
        except Exception:
            restore(before);st.update(status='ROLLED_BACK_AFTER_CONFIG_OR_RELOAD_FAILURE',rollbackUtc=now());persist(st,True);raise
        st.update(status='PUBLISHED_PENDING_POSTCHECKS',switchUtc=switched);persist(st,True)
        return {'status':st['status'],'switchUtc':switched,'beforeSwitchUtc':st['beforeSwitchUtc'],'snippetSha256':s['newSnippetSha256']}
    if phase=='postcheck':
        require(st['status']=='PUBLISHED_PENDING_POSTCHECKS','unexpected postcheck state')
        snip(new,s['newSnippetSha256']);newguard()
        require(sha(canonical(tree(old)))==s['baselineMetadataSha256'],'old immutable root changed')
        require(subprocess.check_output(['systemctl','is-active','nginx'],text=True).strip()=='active','nginx inactive')
        paths=s['publicSmokePaths'];require(len(paths)+2==217,'HTTP plan count changed')
        checks=collect_http(s['publicHost'],[(path,False) for path in paths]+[('/review/',True),('/review/.p3-combined-probe',False)])
        try:
            verify_protection([checks[0],checks[-2],checks[-1]],s['httpBaseline'],'catalogAfter')
            payloads=[verify_payload(r,s['publicPayloadExpectations'][r['path']],s['publicResourcePolicy'])
                      for r in checks[:-2] if r['path'] in s['publicPayloadExpectations']]
            modules=[r for r in payloads if r['moduleMimeBodyVerified'] is not None]
            require(len(modules)==10,'browser module observation count differs')
        except EvidenceError as error:
            error.evidence['httpObservations']=checks
            raise
        counts={str(status):sum(r['status']==status for r in checks) for status in sorted({r['status'] for r in checks})}
        st.update(status='POSTCHECKED_WITH_ACCESS_LIMITATIONS',postchecksUtc=now(),publicChecks=len(checks),
            httpObservations=checks,httpStatusCounts=counts,payloadResults=payloads,moduleResults=modules,
            approvedPayloadsVerified=sum(r['payloadIdentityVerified'] for r in payloads),
            publicModuleMimeBodyVerified=all(r['moduleMimeBodyVerified'] for r in modules),
            limitedResources=sum(r['outcome']!='VERIFIED' for r in payloads),
            foreignOrigin403=True,dotfile404=True,normalCatalogIdentityVerified=True,oldRoutes=s['oldRouteCount'],
            oldRouteHttpAcceptance='Observed only; opaque original bytes/metadata remain strictly verified',
            postAuthJsMimeBodyUiVerified=False,publicUiVerifiedBySsh=False,
            accessLimitation='Only measured responses establish payload/MIME; HTML/denial does not establish scene or module. Separate lawful IAB evidence may follow; no access bypass.')
        persist(st,True);return {k:st[k] for k in ['status','postchecksUtc','publicChecks','httpStatusCounts','approvedPayloadsVerified','publicModuleMimeBodyVerified','limitedResources','moduleResults','postAuthJsMimeBodyUiVerified']}
    if phase=='rollback':
        require(auth.get('rollbackAllowed') is True,'rollback not authorized');restore((backup/'review.locations.conf.before').read_bytes())
        st.update(status='ROLLED_BACK',rollbackUtc=now());persist(st,True);return {'status':st['status'],'utc':now()}
    if phase=='document':
        require(st['status']=='POSTCHECKED_WITH_ACCESS_LIMITATIONS','unexpected document state');snip(new,s['newSnippetSha256'])
        block=('\n\n## P3 Water + Dark bounded Review — '+st['switchUtc']+'\n\nToken '+auth['token']+'; one combined window; owner '+s['windowOwner']+'.\n'
          'Root '+str(new)+'; manifest '+s['releaseManifest']['sha256']+'; overlay '+s['archive']['sha256']+'.\n'
          'Water /review/r4d/p3-masks-water/: Technical PASS / Visual PARTIAL; W-EARLY-POP locally closed; W-DIVIDER-01 OPEN coverage+planeCollapse limitation. Depth recipe now uses near/front support edges instead of centres.\n'
          'Dark /review/r4d/p3-masks-dark/: targeted Technical PASS / overall Visual PARTIAL; D-POP locally closed; coverage/shadow limits. Depth recipe uses lower common facade support instead of upper inner rim. Prior full TQA03 remains previously performed.\n'
          '194 frozen files/7088324 bytes unchanged;196 overlay files include catalog+release metadata. No rebuild, post-QA frozen edits or new product QA.\n'
          'Opaque foreign bytes/uid/gid/modes including mixed1003:27 entries and77 Jungle files preserved; catalog only two cards/counter6->8.\n'
          'Only root switched atomically; nginx-t before/after, graceful reload. Snippet '+s['newSnippetSha256']+'; normalized '+s['normalizedSnippetSha256']+'.\n'
          +str(st['publicChecks'])+' HTTPS checks; exact prospective context normal catalog200/bound new hash, Origin403 and dotfile404 with seven bound headers. Status counts '+json.dumps(st['httpStatusCounts'],sort_keys=True)+'. Approved payloads verified '+str(st['approvedPayloadsVerified'])+'; all10 public JS MIME/body verified='+str(st['publicModuleMimeBodyVerified'])+'; limited responses '+str(st['limitedResources'])+'. HTML/login/denial never counted as scene/module success. Public UI requires separate lawful IAB receipt; SSH does not verify UI. No auth/cookies/globalMIME/services/ports changes.\n'
          'Rollback '+str(backup)+'/review.locations.conf.before ; refreshed '+st['beforeSwitchUtc']+'; old root '+str(old)+' / old snippet '+s['oldSnippetSha256']+'. Guard current own P3 root/snippet before restore; never overwrite later edits or delete old releases/DB/sessions.\n'
          'Neither board is full visual/art PASS. Window/slot release remains CTO responsibility after handoff.\n')
        docs=[Path(s['serviceDoc']),Path(s['changelog'])]
        for p in docs:require(auth['token'].encode() not in p.read_bytes(),'token already documented; do not repeat append')
        before=[opaque_doc_snapshot(p) for p in docs]
        st.update(documentStartedUtc=now(),docsBefore=before);persist(st,True)
        proofs=[append_document(p,block.encode(),snapshot) for p,snapshot in zip(docs,before)]
        st.update(status='PUBLISHED_COMBINED_PARTIAL_WITH_ACCESS_LIMITATIONS',documentedUtc=now(),docs=proofs);persist(st,True)
        require(json.loads((backup/'PUBLISHED.json').read_bytes())==st,'PUBLISHED readback differs')
        return {'status':st['status'],'utc':now(),'docs':proofs,'publishedRecordSha256':sha((backup/'PUBLISHED.json').read_bytes()),'windowReleasedByEngineer':False}
    raise RuntimeError('STOP unknown phase')
