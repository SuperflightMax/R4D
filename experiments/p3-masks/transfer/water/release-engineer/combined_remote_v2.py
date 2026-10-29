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
    require(auth['token']!='CTO-P3-F01-20261028T064706Z-ddfe257b6856','completed Jungle token cannot be reused')
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
    def http(path,foreign=False):
        c=http_client.HTTPSConnection(s['publicHost'],timeout=25)
        headers={'User-Agent':'R4D-P3-combined-delivery/1'}
        if foreign:headers['Origin']='https://example.invalid'
        c.request('GET',path,headers=headers);r=c.getresponse()
        keys=['Location','X-Frame-Options','Cache-Control','X-Robots-Tag','X-Content-Type-Options','Referrer-Policy','Content-Type']
        result={'path':path,'status':r.status,'headers':{k:r.getheader(k) for k in keys},'foreignOrigin':foreign}
        r.read();c.close();return result

    if phase in ('preflight','begin'):
        for p in s['preconditions']:absent(p)
        t=baseline();res=resource()
        require(res['diskFreeBytes']>s['fullNewCount']['bytes']+s['archive']['bytes']+1048576,'space below actual operation need')
        checks=[http('/review/'),http('/review/',True),http('/review/.p3-combined-probe')]
        require([r['status'] for r in checks]==[303,403,404],'prewrite protection differs')
        if phase=='preflight':return {'status':'PREFLIGHT_PASS','utc':now(),'euid':os.geteuid(),'resources':res,'serverWrites':False}
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
        paths=s['publicSmokePaths'];checks=[http(path) for path in paths]
        require(all(r['status']==303 for r in checks),'unexpected unauthenticated response')
        foreign=http('/review/',True);dot=http('/review/.p3-combined-probe')
        for a,b in zip(st['beforeHttp'],[checks[0],foreign,dot]):
            require(a['status']==b['status'] and a['headers']==b['headers'],'protection header/status drift')
        st.update(status='POSTCHECKED_AUTH_LIMITATION',postchecksUtc=now(),publicChecks=len(checks)+2,
            auth303=len(checks),foreignOrigin403=True,dotfile404=True,oldRoutes=s['oldRouteCount'],
            postAuthJsMimeBodyUiVerified=False,postAuthLimitation='Normal login barrier; no cookies/login/auth bypass')
        persist(st,True);return {k:st[k] for k in ['status','postchecksUtc','publicChecks','auth303','oldRoutes','postAuthJsMimeBodyUiVerified']}
    if phase=='rollback':
        require(auth.get('rollbackAllowed') is True,'rollback not authorized');restore((backup/'review.locations.conf.before').read_bytes())
        st.update(status='ROLLED_BACK',rollbackUtc=now());persist(st,True);return {'status':st['status'],'utc':now()}
    if phase=='document':
        require(st['status']=='POSTCHECKED_AUTH_LIMITATION','unexpected document state');snip(new,s['newSnippetSha256'])
        block=('\n\n## P3 Water + Dark bounded Review — '+st['switchUtc']+'\n\nToken '+auth['token']+'; one combined window; owner '+s['windowOwner']+'.\n'
          'Root '+str(new)+'; manifest '+s['releaseManifest']['sha256']+'; overlay '+s['archive']['sha256']+'.\n'
          'Water /review/r4d/p3-masks-water/: Technical PASS / Visual PARTIAL; W-EARLY-POP locally closed; W-DIVIDER-01 OPEN coverage+planeCollapse limitation. Depth recipe now uses near/front support edges instead of centres.\n'
          'Dark /review/r4d/p3-masks-dark/: targeted Technical PASS / overall Visual PARTIAL; D-POP locally closed; coverage/shadow limits. Depth recipe uses lower common facade support instead of upper inner rim. Prior full TQA03 remains previously performed.\n'
          '194 frozen files/7088324 bytes unchanged;196 overlay files include catalog+release metadata. No rebuild, post-QA frozen edits or new product QA.\n'
          'Opaque foreign bytes/uid/gid/modes including mixed1003:27 entries and77 Jungle files preserved; catalog only two cards/counter6->8.\n'
          'Only root switched atomically; nginx-t before/after, graceful reload. Snippet '+s['newSnippetSha256']+'; normalized '+s['normalizedSnippetSha256']+'.\n'
          +str(st['publicChecks'])+' HTTPS checks; normal auth303/Origin403/dotfile404 protections unchanged. Public post-auth JS MIME/body/UI not verified; no login/cookies/auth/globalMIME/services/ports changes.\n'
          'Rollback '+str(backup)+'/review.locations.conf.before ; refreshed '+st['beforeSwitchUtc']+'; old root '+str(old)+' / old snippet '+s['oldSnippetSha256']+'. Guard current own P3 root/snippet before restore; never overwrite later edits or delete old releases/DB/sessions.\n'
          'Neither board is full visual/art PASS. Window/slot release remains CTO responsibility after handoff.\n')
        docs=[Path(s['serviceDoc']),Path(s['changelog'])]
        for p in docs:require(auth['token'].encode() not in p.read_bytes(),'token already documented; do not repeat append')
        hashes=[]
        for p in docs:
            with p.open('ab') as f:f.write(block.encode());f.flush();os.fsync(f.fileno())
            hashes.append({'path':str(p),'sha256':sha(p.read_bytes())})
        st.update(status='PUBLISHED_COMBINED_PARTIAL_WITH_AUTH_LIMITATION',documentedUtc=now(),docs=hashes);persist(st,True)
        require(json.loads((backup/'PUBLISHED.json').read_bytes())==st,'PUBLISHED readback differs')
        return {'status':st['status'],'utc':now(),'docs':hashes,'publishedRecordSha256':sha((backup/'PUBLISHED.json').read_bytes()),'windowReleasedByEngineer':False}
    raise RuntimeError('STOP unknown phase')
