"""Create the named absent-only local candidate. Never writes to a server."""
import datetime,hashlib,json,subprocess,sys
from pathlib import Path

BASE=Path(__file__).resolve().parents[1]
REPO=BASE.parents[2]
SOURCE='experiments/p1-collider-mapping/accepted-static-report-01/'
CANDIDATE=Path(r'E:\R4D\perspective\p2-runtime\output\p1-static-report-candidate-01')
sha=lambda b:hashlib.sha256(b).hexdigest()
json_bytes=lambda v:(json.dumps(v,ensure_ascii=False,indent=2)+'\n').encode()

def main():
    assert len(sys.argv)==2,'Provide exact fresh local public-baseline directory'
    baseline_dir=Path(sys.argv[1]).resolve()
    assert baseline_dir.parent==Path(r'E:\R4D\perspective\p2-runtime\output\builder\p1-static-report-prep-01')
    assert not CANDIDATE.exists(),'Immutable candidate exists: inspect; never overwrite'
    assert not subprocess.check_output(['git','status','--porcelain'],cwd=REPO),'Commit tracked source first'
    head=subprocess.check_output(['git','rev-parse','HEAD'],cwd=REPO,text=True).strip()
    def git(path):return subprocess.check_output(['git','show',head+':'+SOURCE+path],cwd=REPO)
    check=json.loads(git('audit/STATIC_CHECK.json'))
    assert check['files']==12 and not check['browserRenderVerified'] and not check['simulationExecuted']
    delta=json.loads(git('audit/CATALOG_DELTA.json'))
    raw_baseline=(baseline_dir/'BASELINE.json').read_bytes();baseline=json.loads(raw_baseline)
    assert baseline['serverWrites'] is False and baseline['rootInventoryUnchangedDuringRead'] is True
    before=(baseline_dir/'catalog.before.html').read_bytes()
    assert sha(before)==baseline['catalogMetadata']['sha256']==delta['baselineCatalogSha256']
    after=before
    for op in delta['operations']:
        old=op['before'].encode();new=op['after'].encode()
        assert after.count(old)==1 and old!=new
        after=after.replace(old,new,1)
    inverse=after
    for op in reversed(delta['operations']):
        old=op['before'].encode();new=op['after'].encode()
        assert inverse.count(new)==1
        inverse=inverse.replace(new,old,1)
    assert inverse==before
    assert after.count(b'./r4d/p1-mapping-report/')==1
    assert baseline['proposedRouteExists'] is False
    assert [r['status'] for r in baseline['http']]==[200,200,404]
    CANDIDATE.mkdir()
    public=CANDIDATE/'public';audit=CANDIDATE/'audit'
    audit.mkdir()
    rows=[]
    for row in check['fileManifest']:
        data=git('site/'+row['path'])
        assert len(data)==row['bytes'] and sha(data)==row['sha256']
        rel='review/r4d/p1-mapping-report/'+row['path']
        dest=public/rel;dest.parent.mkdir(parents=True,exist_ok=True);dest.write_bytes(data)
        rows.append({'path':rel,'bytes':len(data),'sha256':sha(data)})
    for name in ['PROVENANCE.json','CONTENT_PROVENANCE.md','STATIC_CHECK.json','CATALOG_DELTA.json']:
        (audit/name).write_bytes(git('audit/'+name))
    (audit/'PUBLIC_BASELINE.json').write_bytes(raw_baseline)
    (audit/'catalog.before.html').write_bytes(before)
    (audit/'catalog.draft.html').write_bytes(after)
    (audit/'RELEASE_MANIFEST.before.json').write_bytes((baseline_dir/'RELEASE_MANIFEST.before.json').read_bytes())
    patch_proof={'draftOnly':True,'beforeSha256':sha(before),'afterSha256':sha(after),'operations':2,'inverseRestoresExactBeforeBytes':True,'newP1Cards':1,'unchangedOtherCatalogBytes':True,'countAfter':'4 материала','published':False}
    (audit/'CATALOG_PATCH_PROOF.json').write_bytes(json_bytes(patch_proof))
    rows.sort(key=lambda r:r['path'])
    tree=sha(''.join(f"{r['sha256']} {r['bytes']} {r['path']}\n" for r in rows).encode())
    manifest={'schema':'r4d.p1.accepted-static-report.candidate-01','createdAtUtc':datetime.datetime.now(datetime.timezone.utc).isoformat(),'sourceCommit':head,'acceptedP1Commit':'4b47db04c7140ebf88f69b91faa0b790d46f22ec','sourceSubtree':SOURCE,'proposedRoute':'/review/r4d/p1-mapping-report/','published':False,'serverWrites':False,'staticOnly':True,'sourceSiteTreeSha256':check['treeSha256'],'publicTreeSha256':tree,'treeHashRule':check['treeHashRule'].replace('site-relative paths','public-relative paths'),'publicFiles':len(rows),'publicBytes':sum(r['bytes'] for r in rows),'fileManifest':rows,'publicBaselineSha256':sha(raw_baseline),'publicBaselineFinishedAtUtc':baseline['finishedAtUtc'],'catalogPatchProof':patch_proof,'qa':{'builderStaticProvenance':'bounded PASS','browserRender':'not performed','independentTqaVqa':'pending; Lead assigns targeted review; no simulation rerun'},'releaseGate':'No VPS writes/mkdir/upload/staging/backup/snippet/docs/reload before new exact release intent and CTO token'}
    data=json_bytes(manifest);(CANDIDATE/'BUILD_MANIFEST.json').write_bytes(data)
    print(json.dumps({'candidate':str(CANDIDATE),'sourceCommit':head,'publicFiles':len(rows),'publicBytes':manifest['publicBytes'],'sourceSiteTreeSha256':check['treeSha256'],'publicTreeSha256':tree,'buildManifestSha256':sha(data),'catalogDraftSha256':sha(after),'publicBaselineSha256':sha(raw_baseline),'published':False,'serverWrites':False},ensure_ascii=False))

if __name__=='__main__':main()
