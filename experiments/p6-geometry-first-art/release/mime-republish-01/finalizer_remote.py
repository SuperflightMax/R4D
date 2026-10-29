"""Append-only completion after exact new HTTP/UI receipts and CTO approval."""


def document_deadline(auth,utc_now=None):
    value=auth.get('firstWriteMustStartByUtc')
    if value:
        deadline=datetime.datetime.fromisoformat(value.replace('Z','+00:00'))
        if deadline.tzinfo is None or (utc_now or datetime.datetime.now(datetime.timezone.utc))>=deadline:
            raise RuntimeError('STOP document first-write deadline missed before owned record mkdir')


def suffix_identity(stream,expected_bytes,expected_sha256):
    digest=hashlib.sha256();count=0
    while True:
        chunk=stream.read(min(65536,expected_bytes+1-count))
        if not chunk:break
        digest.update(chunk);count+=len(chunk)
        if count>expected_bytes:raise RuntimeError('STOP actual append suffix too long')
    if count!=expected_bytes or digest.hexdigest()!=expected_sha256:raise RuntimeError('STOP actual append suffix bytes/SHA differ')
    return {'actualAppendBytes':count,'actualAppendSha256':digest.hexdigest()}


def finalize():
    def need(ok,reason):
        if not ok:raise RuntimeError('STOP '+reason)
    def save(path,value):
        path.write_bytes((json.dumps(value,ensure_ascii=False,indent=2)+'\n').encode());os.chmod(path,0o600)
    need(os.geteuid()==0,'actual euid0 before document write')
    need(A.get('serverWrite') is True and A.get('tokenGranted') is True and bool(A.get('token')),'fresh CTO write authority')
    need(A.get('intentSha256')==sha(FINALIZER_BYTES) and A.get('bindingSha256')==sha(BINDING_BYTES),'finalizer/binding authority')
    need(A.get('releaseId')==F['releaseId']=='p6-mime-republish-01','finalizer release binding')
    need(A.get('writerSha256')==WRITER_SHA256 and 'document' in A.get('authorizedPhases',[]),'document phase authority')
    need(A.get('uiApprovalSha256')==B['uiApproval']['sha256'] and A.get('uiReceiptSha256')==B['uiReceipt']['sha256'],'actual CTO UI approval/receipt binding')
    need(B['finalizerIntentSha256']==sha(FINALIZER_BYTES) and B['fixIntentSha256']==F['fixIntentSha256'],'completion chain')
    need(sha(Path(F['snippetPath']).read_bytes())==F['afterSnippetSha256'],'live corrected Review snippet drift')
    need(tree_digest(Path(F['roots']['before']['path']))==F['roots']['before']['identity'],'old root drift')
    need(tree_digest(Path(F['roots']['retained']['path']))==F['roots']['retained']['identity'],'retained P6 root drift')
    need(opaque_snapshot(Path('/etc/nginx/mime.types'))==F['standardMime'],'MIME dependency drift')
    before=[opaque_snapshot(Path(row['path'])) for row in F['documents']]
    need([row['path'] for row in before]==['/home/sf/assistant-context/vps/services/superflight-studio.md','/home/sf/assistant-context/vps/CHANGELOG.md'],'only two exact append targets')
    need(len(APPENDS)==len(B['appends'])==2,'exactly two append payloads')
    need(before==F['documents'],'opaque before guards changed; no append started')
    target=Path(F['ownedRecordDirectory']);need(not os.path.lexists(target),'completion record occupied; reconcile, do not replay')
    need(target.parent.is_dir(),'owned MIME fix backup missing')
    state=json.loads((target.parent/'STATE.json').read_bytes())
    need(state['intentSha256']==F['fixIntentSha256'] and state['status']=='FIX_RELOADED_NEEDS_HTTP','new fix apply record binding')
    document_deadline(A)
    target.mkdir(mode=0o700)
    result={'status':'DOCUMENT_APPEND_STARTED','utc':now(),'finalizerIntentSha256':sha(FINALIZER_BYTES),'bindingSha256':sha(BINDING_BYTES),
            'fixIntentSha256':F['fixIntentSha256'],'originalIntentSha256':F['original']['intentSha256'],'originalArchiveSha256':F['original']['archiveSha256'],'appendProofs':[]}
    save(target/'STATE.json',result)
    for index,expected in enumerate(before):
        path=Path(expected['path']);data=APPENDS[index]
        need(sha(data)==B['appends'][index]['sha256'] and len(data)==B['appends'][index]['bytes'],'exact append bytes')
        need(opaque_snapshot(path)==expected,'document drift immediately before append')
        with path.open('ab') as stream:
            info=os.fstat(stream.fileno())
            need((info.st_ino,info.st_uid,info.st_gid,stat.S_IMODE(info.st_mode),info.st_size)==
                 (expected['inode'],expected['uid'],expected['gid'],expected['mode'],expected['bytes']),'open-file document identity')
            stream.write(data);stream.flush();os.fsync(stream.fileno())
        after=opaque_snapshot(path);prefix=hashlib.sha256();remaining=expected['bytes']
        with path.open('rb') as stream:
            while remaining:
                chunk=stream.read(min(65536,remaining));need(bool(chunk),'short original prefix');prefix.update(chunk);remaining-=len(chunk)
            suffix=suffix_identity(stream,len(data),B['appends'][index]['sha256'])
        need(all(after[key]==expected[key] for key in ['path','inode','uid','gid','mode']) and after['bytes']==expected['bytes']+len(data) and prefix.hexdigest()==expected['sha256'],'append-only prefix/metadata proof')
        need(opaque_snapshot(path)==after,'document changed during append proof')
        result['appendProofs'].append({'before':expected,'after':after,'originalPrefixBytes':expected['bytes'],'originalPrefixSha256':prefix.hexdigest(),'appendSha256':sha(data),**suffix})
        save(target/'STATE.json',result)
    result.update(status='NEW_MIME_PUBLICATION_FINALIZED_LOCAL_PARTIAL',utc=now(),url=F['url'],verdict='LOCAL_PARTIAL / NO_ART_MOTION_PASS',
                  actualPublicationUtc=B['actualPublicationUtc'],uiReceiptSha256=B['uiReceipt']['sha256'],uiApprovalSha256=B['uiApproval']['sha256'],safeBoundary=True,pendingWrite=False,v1Success=False)
    save(target/'RECEIPT.json',result);save(target/'STATE.json',result)
    return result
