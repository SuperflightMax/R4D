"""Finalize local metadata and seal one intent, without any network or server writes."""
import hashlib,io,json,tarfile,sys
from pathlib import Path
from prepare_release_intent import OUT,FROZEN,MANIFEST_SHA,PUBLIC_TREE,TARGETS,sha,jb,tree

def refresh_unsealed_metadata():
    assert not (OUT/'SEALED_PACKET.json').exists()
    p=OUT/'payload/RELEASE_MANIFEST.json';r=json.loads(p.read_bytes())
    assert 'files' in r,'One-time compatibility finalization already completed'
    b=json.loads((OUT/'baseline/ACTUAL_PUBLIC.json').read_bytes())
    files=r.pop('files');r.pop('schema');r.pop('fileCountExcludingThisManifest');r.pop('totalBytesExcludingThisManifest')
    r={'schema_version':1,'release_id':'p1-mapping-report-candidate-01','path_prefix':'/review/',**r,'published_files':files,'published_file_count':len(files),'published_bytes':sum(x['bytes'] for x in files)}
    r['preparedAtUtc']=b['finishedAtUtc'];raw=jb(r);p.write_bytes(raw)
    planned_path=OUT/'PLANNED_INVENTORY.json';planned=json.loads(planned_path.read_bytes())
    for row in planned['files']:
        if row['path']=='RELEASE_MANIFEST.json':row.update(bytes=len(raw),sha256=sha(raw))
    planned['totalBytes']=sum(x['bytes'] for x in planned['files']);planned['treeSha256']=tree(planned['files']);planned_path.write_bytes(jb(planned))
    archive=OUT/'p1-static-report-01.payload.tar';rows=[]
    with tarfile.open(archive,'w',format=tarfile.USTAR_FORMAT) as tar:
        for f in sorted(q for q in (OUT/'payload').rglob('*') if q.is_file()):
            data=f.read_bytes();rel=f.relative_to(OUT/'payload').as_posix();t=tarfile.TarInfo(rel);t.size=len(data);t.mode=0o644;t.uid=t.gid=0;t.mtime=0;tar.addfile(t,io.BytesIO(data));rows.append({'path':rel,'bytes':len(data),'sha256':sha(data)})
    i=json.loads((OUT/'RELEASE_INTENT.json').read_bytes());i['archive'].update(bytes=archive.stat().st_size,sha256=sha(archive.read_bytes()),files=rows)
    i['plannedSharedRelease'].update(inventorySha256=sha(jb(planned)),bytes=planned['totalBytes'],treeSha256=planned['treeSha256'],releaseManifestBytes=len(raw),releaseManifestSha256=sha(raw))
    (OUT/'RELEASE_INTENT.json').write_bytes(jb(i))
    print(json.dumps({'archive':i['archive']['sha256'],'archiveBytes':i['archive']['bytes'],'planned':i['plannedSharedRelease']},ensure_ascii=False))

def seal():
    assert not (OUT/'SEALED_PACKET.json').exists()
    i=json.loads((OUT/'RELEASE_INTENT.json').read_bytes());braw=(OUT/'baseline/ACTUAL_PUBLIC.json').read_bytes();b=json.loads(braw)
    assert i['server_write'] is False and i['executionAuthorized'] is False
    assert sha(braw)==i['baseline']['sha256'] and b['before']==b['after']
    old_meta={r['path']:{k:r[k] for k in ['path','bytes','sha256']} for r in b['files']}
    old_manifest=json.loads((OUT/'baseline/RELEASE_MANIFEST.before.json').read_bytes())
    assert {r['path']:r for r in old_manifest['published_files']}=={k:v for k,v in old_meta.items() if k!='RELEASE_MANIFEST.json'}
    planned=json.loads((OUT/'PLANNED_INVENTORY.json').read_bytes());new_meta={r['path']:{k:r[k] for k in ['path','bytes','sha256']} for r in planned['files']}
    preserved=[p for p in old_meta if p not in ['RELEASE_MANIFEST.json','review/index.html']]
    assert len(preserved)==548 and all(new_meta[p]==old_meta[p] for p in preserved)
    frozen=json.loads((FROZEN/'BUILD_MANIFEST.json').read_bytes())
    assert sha((FROZEN/'BUILD_MANIFEST.json').read_bytes())==MANIFEST_SHA and tree(frozen['fileManifest'])==PUBLIC_TREE
    for r in frozen['fileManifest']:
        assert (OUT/'payload'/r['path']).read_bytes()==(FROZEN/'public'/r['path']).read_bytes()
    actual=sorted(p.relative_to(OUT/'payload').as_posix() for p in (OUT/'payload').rglob('*') if p.is_file())
    assert actual==[r['path'] for r in i['archive']['files']] and len(actual)==14
    with tarfile.open(OUT/i['archive']['path'],'r:') as tar:
        members=tar.getmembers();assert [t.name for t in members]==actual
        for t,r in zip(members,i['archive']['files']):
            assert t.isfile() and not t.issym() and not t.islnk() and '..' not in Path(t.name).parts and not t.name.startswith('/')
            data=tar.extractfile(t).read();assert len(data)==r['bytes'] and sha(data)==r['sha256'] and new_meta[t.name]==r
    assert sha((OUT/i['archive']['path']).read_bytes())==i['archive']['sha256']
    assert sha(jb(planned))==i['plannedSharedRelease']['inventorySha256'] and tree(planned['files'])==planned['treeSha256']
    assert len(planned['files'])==562
    before=(OUT/'baseline/review.locations.conf.before').read_bytes();after=(OUT/'plan/review.locations.conf.after').read_bytes()
    assert sha(before)==i['snippet']['beforeSha256'] and sha(after)==i['snippet']['afterSha256']
    assert after.replace(('root '+TARGETS['newRoot']+';').encode(),('root '+b['root']+';').encode(),1)==before and b'auth_request' not in before+after
    plan=(OUT/'EXECUTION_PLAN.md').read_bytes();template=(OUT/'DOCUMENTATION_APPEND_TEMPLATE.md').read_bytes()
    assert f'Planned after{len(after)} bytes' in plan.decode('utf-8')
    i['writeSetAndGuardsDocumentSha256']=sha(plan);i['documentationAppendTemplateSha256']=sha(template)
    i['preparationScripts']=[{'path':p.name,'bytes':p.stat().st_size,'sha256':sha(p.read_bytes())} for p in [Path(__file__),Path(__file__).with_name('prepare_release_intent.py')]]
    (OUT/'RELEASE_INTENT.json').write_bytes(jb(i))
    proof={'status':'LOCAL_PACKET_VALIDATED_NOT_AUTHORIZED','server_write':False,'pageRender':'PAGE_RENDER_NOT_OBSERVED','frozenP1Unchanged':True,'opaqueFilesPreserved':len(preserved),'archiveSafeExact14Files':True,'plannedSharedFiles':562,'catalogDeltaBoundedByQa':True,'currentPublicRollbackExact':True,'files':[]}
    for name in ['RELEASE_INTENT.json','p1-static-report-01.payload.tar','PLANNED_INVENTORY.json','EXECUTION_PLAN.md','DOCUMENTATION_APPEND_TEMPLATE.md','RESOURCES.json','baseline/ACTUAL_PUBLIC.json','baseline/review.locations.conf.before','plan/review.locations.conf.after','audit/TQA_REPORT.md','audit/VQA_REPORT.md']:
        data=(OUT/name).read_bytes();proof['files'].append({'path':name,'bytes':len(data),'sha256':sha(data)})
    (OUT/'SEALED_PACKET.json').write_bytes(jb(proof));print(json.dumps(proof,ensure_ascii=False))

if __name__=='__main__':
    assert len(sys.argv)==2 and sys.argv[1] in ['refresh-unsealed-metadata','seal']
    {'refresh-unsealed-metadata':refresh_unsealed_metadata,'seal':seal}[sys.argv[1]]()
