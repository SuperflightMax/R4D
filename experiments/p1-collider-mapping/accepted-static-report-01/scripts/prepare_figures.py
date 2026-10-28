"""Exact-byte copies from the accepted Git snapshot; no simulation or image editing."""
import hashlib,json,subprocess
from pathlib import Path

BASE=Path(__file__).resolve().parents[1]
REPO=BASE.parents[2]
REF='4b47db04c7140ebf88f69b91faa0b790d46f22ec'
SUBTREE='experiments/p1-collider-mapping/clean-repeat-01/'

def git_bytes(path):
    assert path.startswith(SUBTREE)
    return subprocess.check_output(['git','show',REF+':'+path],cwd=REPO)

def git_blob(path):
    return subprocess.check_output(['git','rev-parse',REF+':'+path],cwd=REPO,text=True).strip()

def main():
    target=BASE/'site'/'figures'
    target.mkdir(exist_ok=True)
    audit=BASE/'audit'
    audit.mkdir(exist_ok=True)
    chosen=[]
    for board,trial in [('01','01'),('02','01'),('03','02'),('04','02')]:
        for source_suffix,name_suffix,view,framing in [
            ('desktop-source-whole','perspective-whole','source-perspective','whole-source'),
            ('desktop-flat-floor','native-floor','inverse-floor','playable-floor-and-receivers')]:
            chosen.append({'sourcePath':SUBTREE+f'viewer/evidence/plain-four-board/{board}-{source_suffix}.jpg',
                'file':f'{board}-{name_suffix}.jpg','figureId':f'fig-{board}-'+('source' if view=='source-perspective' else 'flat'),
                'board':board,'trial':trial,'view':view,'framing':framing,'geometry':'exact selected native config through saved Viewer; source view projects native; inverse view keeps native',
                'state':'seed1 tick0; archived screenshot, no run performed for this report'})
    for original,name,figure,view,framing in [
        ('board03-source-candidate-02.jpg','03-research-perspective.jpg','fig-method-source','source-perspective','whole-source'),
        ('board03-inverse-whole-source-candidate-02.jpg','03-research-inverse-whole.jpg','fig-method-inverse','inverse-floor','whole-source')]:
        chosen.append({'sourcePath':SUBTREE+'research/evidence/'+original,'file':name,'figureId':figure,'board':'03','researchCandidate':'02','view':view,'framing':framing,'geometry':'research signed flat coordinates, before common translation to native','state':'saved Research overlay; not a sim screenshot'})
    for row in chosen:
        data=git_bytes(row['sourcePath'])
        dest=target/row['file']
        if dest.exists():
            assert dest.read_bytes()==data,'Refusing to overwrite a different image: '+str(dest)
        else:
            dest.write_bytes(data)
        row.update({'sourceCommit':REF,'gitBlob':git_blob(row['sourcePath']),'bytes':len(data),'sha256':hashlib.sha256(data).hexdigest(),'modified':False})
    inputs=[]
    for board,trial in [('01','01'),('02','01'),('03','02'),('04','02')]:
        path=SUBTREE+f'simulation/boards/{board}/trial-{trial}/manifest.json'
        raw=git_bytes(path);m=json.loads(raw)
        cpath=SUBTREE+f'simulation/boards/{board}/trial-{trial}/config.json'
        c=git_bytes(cpath)
        rpath=m['research']['file'];r=git_bytes(rpath)
        assert hashlib.sha256(c.replace(b'\r\n',b'\n')).hexdigest()==m['config']['canonicalLfUtf8Sha256']
        assert hashlib.sha256(r.replace(b'\r\n',b'\n')).hexdigest()==m['research']['canonicalLfUtf8Sha256']
        inputs.append({'board':board,'trial':trial,'manifestPath':path,'manifestBlob':git_blob(path),'manifestSha256':hashlib.sha256(raw).hexdigest(),'counts':m['config']['counts'],'configPath':cpath,'configCanonicalLfUtf8Sha256':m['config']['canonicalLfUtf8Sha256'],'researchPath':rpath,'researchCanonicalLfUtf8Sha256':m['research']['canonicalLfUtf8Sha256'],'translation':m['translation'],'sourceImageSha256':m['source']['sha256']})
    data={'sourceCommit':REF,'sourceSubtree':SUBTREE,'noSimulationExecuted':True,'noNewDiagrams':True,
        'versionDecision04':'Research source/inverse overlays are candidate01, before start-only revision. Excluded. Existing plain-four-board desktop source-whole and flat-floor explicitly use trial02 and show revised start; no missing final illustration.',
        'versionEvidencePaths':[SUBTREE+'viewer/scripts/board-inputs.mjs',SUBTREE+'viewer/evidence/plain-four-board/README.md',SUBTREE+'viewer/README.md',SUBTREE+'research/BOARD03_SUPPORT_REVISION.md',SUBTREE+'research/BOARD04_START_REVISION.md'],
        'figures':chosen,'selectedInputs':inputs}
    (audit/'PROVENANCE.json').write_text(json.dumps(data,ensure_ascii=False,indent=2)+'\n',encoding='utf-8')
    print(json.dumps({'figures':len(chosen),'bytes':sum(r['bytes'] for r in chosen),'boards':[{'board':r['board'],'trial':r['trial'],'counts':r['counts']} for r in inputs]},ensure_ascii=False))

if __name__=='__main__':
    main()
