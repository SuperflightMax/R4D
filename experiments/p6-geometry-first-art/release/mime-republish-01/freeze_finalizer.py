"""Freeze finalizer rules/code/templates. Actual UI binding cannot exist yet."""
import ast
import hashlib
import json
from pathlib import Path

RUNTIME=Path(r'E:\R4D\perspective\p6-runtime\release-engineer\mime-republish-01')
CONTROL=Path(__file__).resolve().parent


def sha(b):return hashlib.sha256(b).hexdigest()


def main():
    fix_bytes=(RUNTIME/'FROZEN_FIX_INTENT.json').read_bytes();fix=json.loads(fix_bytes)
    parsed=ast.parse((RUNTIME/'MIME_REMOTE_WRITER.py').read_text(encoding='utf-8'));text=(RUNTIME/'MIME_REMOTE_WRITER.py').read_text(encoding='utf-8');parts=[]
    for node in parsed.body:
        if isinstance(node,(ast.Import,ast.ImportFrom)) or (isinstance(node,ast.FunctionDef) and node.name in {'sha','now','canonical','tree_digest','opaque_snapshot'}):parts.append(ast.get_source_segment(text,node))
    writer=('\n\n'.join(parts)+'\n\n').encode()+(CONTROL/'finalizer_remote.py').read_bytes();ast.parse(writer.decode())
    target=RUNTIME/'FINALIZER_REMOTE_WRITER.py';assert not target.exists();target.write_bytes(writer)
    service='\n\n### R4D P6 новая MIME-публикация\nURL: {url}\nФактическая публикация UTC: {actualPublicationUtc}\nИтог: {verdict}\nOriginal intent: {originalIntentSha256}\nOriginal archive: {originalArchiveSha256}\nНовый MIME fix intent: {fixIntentSha256}\nНовый HTTP receipt: {httpReceiptSha256}\nLead UI smoke UTC: {uiCheckedAtUtc}; receipt: {uiReceiptSha256}\nCTO UI approval: {uiApprovalSha256}\nV1 остаётся failed/closed; его квитанции и chronology не заменены. Новый record относится только к MIME-assisted republication; art/motion PASS не заявлен.\n'
    changelog='\n\n- R4D P6 новая MIME-публикация: {url}; UTC {actualPublicationUtc}; {verdict}. Original intent {originalIntentSha256}; archive {originalArchiveSha256}; новый fix {fixIntentSha256}; HTTP {httpReceiptSha256}; UI {uiReceiptSha256} ({uiCheckedAtUtc}); CTO approval {uiApprovalSha256}. V1 failed/closed сохранён, его история не переписана.\n'
    scope={'schema':'r4d.p6.mime-finalizer-intent.v1','status':'FROZEN_FINALIZER_INTENT','releaseId':'p6-mime-republish-01','tokenGranted':False,
           'fixIntentPath':str(RUNTIME/'FROZEN_FIX_INTENT.json'),'fixIntentSha256':sha(fix_bytes),'original':fix['original'],'roots':fix['roots'],
           'url':'https://superflight.space/review/r4d/p6-geometry-first-art/','snippetPath':fix['snippetPath'],'afterSnippetSha256':fix['afterSnippet']['sha256'],
           'standardMime':fix['standardMime'],'documents':fix['documents'],
           'ownedRecordDirectory':'/opt/superflight-studio/backups/review-p6-mime-republish-01/finalization-01',
           'appendTemplates':[service,changelog],'appendTemplateSha256':[sha(service.encode()),sha(changelog.encode())],
           'writeSet':['append only /home/sf/assistant-context/vps/services/superflight-studio.md','append only /home/sf/assistant-context/vps/CHANGELOG.md','new owned finalization-01 STATE/RECEIPT only'],
           'forbidden':['config/root/runtime/upload/clone changes','reading document text into output','V1 records/authority edits','public UI/authority bytes','automatic retry/reappend'],
           'actualUiBindingCreated':False,'lateBindingRequired':'After actual new apply + HTTP + Lead bounded UI smoke and separate explicit CTO approval, local prepare-binding creates exact append bytes and immutable FINALIZER_BINDING.json. CTO authority must bind its SHA plus actual UI receipt and approval SHA before document phase.',
           'uiReceiptContract':{'status':'VERIFIED_DELIVERY_SMOKE','fixIntentSha256':sha(fix_bytes),'archiveSha256':fix['original']['archiveSha256'],'url':'https://superflight.space/review/r4d/p6-geometry-first-art/','checkedAtUtc':'actual timezone-aware observation time'},
           'ctoApprovalRequired':{'approved':True,'fixIntentSha256':sha(fix_bytes),'originalIntentSha256':fix['original']['intentSha256'],'archiveSha256':fix['original']['archiveSha256'],'url':'https://superflight.space/review/r4d/p6-geometry-first-art/','applyReceiptSha256':'actual','httpReceiptSha256':'actual','uiReceiptSha256':'actual','approvedAtUtc':'actual timezone-aware CTO approval time'},
           'leaseGuard':{**fix['liveLeaseGuard'],'beforeEveryRemoteWritePhase':['document']},'documentWritePhase':'Fresh four-field live lease immediately before remote document call, including if a historical authority still says true.',
           'appendProof':'Before both writes: exact opaque file SHA/length/inode/uid/gid/mode. Open only ab; fstat check; fsync; original-prefix SHA, inode/owner/mode unchanged; actual written suffix bytes/SHA match bound append. Partial outcome STOP, no duplicate append; separate RO reconciliation and CTO decision.',
           'firstWriteDeadline':'If fresh separate document grant includes firstWriteMustStartByUtc, check locally and on VPS after RO guards immediately before ownedRecordDirectory.mkdir; expired => STOP before document write.',
           'writerPath':str(target),'writerHashes':{'launcherSha256':sha((CONTROL/'finalizer.py').read_bytes()),'remoteSourceSha256':sha((CONTROL/'finalizer_remote.py').read_bytes()),'composedWriterSha256':sha(writer),'leaseGuardSha256':sha((CONTROL/'lease_guard.py').read_bytes())},
           'transcriptEvidenceVerbatim':fix['transcriptEvidenceVerbatim'],'nextAction':'No document/UI phase in preparation. No authority, UI approval or actual UI receipt fabricated.'}
    path=RUNTIME/'FROZEN_FINALIZER_INTENT.json';assert not path.exists();b=(json.dumps(scope,ensure_ascii=False,indent=2)+'\n').encode();path.write_bytes(b)
    print(json.dumps({'intentPath':str(path),'bytes':len(b),'sha256':sha(b),'writerHashes':scope['writerHashes'],'tokenGranted':False,'actualUiBindingCreated':False},indent=2))


if __name__=='__main__':main()
