"""Freeze a short MIME-only intent; never connects to or writes the server."""
import ast
import hashlib
import json
import re
import subprocess
from pathlib import Path

RUNTIME = Path(r'E:\R4D\perspective\p6-runtime\release-engineer\mime-republish-01')
CONTROL = Path(__file__).resolve().parent
WORKTREE = r'E:\R4D\perspective\p6-worktrees\release-engineer'
V1 = Path(r'E:\R4D\perspective\p6-runtime\release-engineer\phase-a-local-partial-01\candidate-03\intent')
OLD = '/srv/superflight-review/releases/p3-water-dark-front-edge-04'
P6 = '/srv/superflight-review/releases/p6-local-partial-01'


def sha(data):
    return hashlib.sha256(data).hexdigest()


def record(path):
    b=path.read_bytes();return {'path':str(path),'bytes':len(b),'sha256':sha(b)}


def save(path, data):
    assert not path.exists(), 'STOP occupied frozen output: '+str(path)
    path.write_bytes(data)


def main():
    before=(RUNTIME/'inputs/snippet-before.bin').read_bytes()
    baseline_path=RUNTIME/'PREP_FINAL_RO.private.json';base=json.loads(baseline_path.read_bytes())
    assert sha(before)==base['snippet']['sha256']=='f7948d10efb040e83c15d86df26866aed9a5a90eb53bf85c7fd0206c05d1200e'
    mime=(RUNTIME/'inputs/standard-mime.types').read_bytes()
    assert sha(mime)==base['standardMime']['sha256']
    assert not re.search(rb'\btypes\s*\{',before),'STOP existing Review local types require explicit merge review'
    assert before.count(b'location ^~ /review/ {')==1
    assert before.count(OLD.encode())==1
    staged=before.replace(OLD.encode(),P6.encode())
    root=re.search(rb'(?m)^([ \t]*)root\s+[^;\n]+;[ \t]*\n',staged);assert root
    start=staged.index(b'location ^~ /review/ {');assert start<root.start()<staged.index(b'location @review_slash')
    indent=root.group(1)
    addition=indent+b'include /etc/nginx/mime.types;\n'+indent+b'types { application/javascript mjs; }\n'
    after=staged[:root.end()]+addition+staged[root.end():]
    inverse=after.replace(addition,b'',1).replace(P6.encode(),OLD.encode(),1)
    assert inverse==before and after.count(addition)==1
    assert base['mimeMapping']['js']=='application/javascript' and 'mjs' not in base['mimeMapping']
    effective=dict(base['mimeMapping']);effective['mjs']=effective['js']
    assert len(effective)==len(base['mimeMapping'])+1 and all(effective[k]==v for k,v in base['mimeMapping'].items())
    save(RUNTIME/'snippet-after.bin',after);save(RUNTIME/'snippet-inverse.bin',inverse)
    delta=('root '+OLD+';\n→ root '+P6+';\n'+addition.decode()).encode()
    save(RUNTIME/'SNIPPET_DELTA.txt',delta)
    original_bytes=(V1/'FROZEN_INTENT.json').read_bytes();assert sha(original_bytes)=='d5a120453d8f16f98227963a756f9e2408dd4fdcf11db2d51dff96044058c163'
    original=json.loads(original_bytes)
    reps=json.loads((RUNTIME/'inputs/OLD_REPRESENTATIVES.json').read_bytes())
    prior_types=json.loads((RUNTIME/'OLD_TYPES_BEFORE.private.json').read_bytes())
    assert len(prior_types['observations'])==len(reps)==5
    retained_files={x['path']:x for x in base['retainedTree']['metadataRows']['files']}
    rep_expectations=[]
    for item,observed in zip(reps,prior_types['observations']):
        assert all(retained_files[item['path']][k]==item[k] for k in ('bytes','sha256','uid','gid','mode'))
        assert observed['bodySha256']==item['sha256'] and observed['bodyBytes']==item['bytes']
        rep_expectations.append({'urlPath':'/'+item['path'],'bytes':item['bytes'],'sha256':item['sha256'],
                                 'acceptedMimeTypes':[observed['expectedMime']]})
    full=(V1/'P6_REMOTE_WRITER.py').read_bytes();assert sha(full)=='d91862fb74cbe3ca243b41e95d482f54ae28f1ea7ab85c4e3d102cb8c6424b4b'
    prefix=full.split(b'"""Future token-bound P6 phases, adapted to existing combined wrapper mechanics.',1)[0].decode()
    parsed=ast.parse(prefix);parts=[]
    allowed={'sha','now','canonical','tree_digest','opaque_snapshot'}
    for node in parsed.body:
        if isinstance(node,(ast.Import,ast.ImportFrom)) or (isinstance(node,ast.FunctionDef) and node.name in allowed) or (isinstance(node,ast.Assign) and any(isinstance(t,ast.Name) and t.id=='HEADER_NAMES' for t in node.targets)):
            parts.append(ast.get_source_segment(prefix,node))
    writer=('\n\n'.join(parts)+'\n\n').encode()+(CONTROL/'remote.py').read_bytes();ast.parse(writer.decode())
    save(RUNTIME/'MIME_REMOTE_WRITER.py',writer)
    summary=lambda x:{k:v for k,v in x.items() if k!='metadataRows'}
    guard_tests=record(RUNTIME/'CONTROL_VALIDATION_FINAL.json')
    scope={
      'schema':'r4d.p6.mime-republication-fix.v1','status':'FROZEN_FIX_INTENT','tokenGranted':False,'serverWriteAuthorized':False,
      'releaseId':'p6-mime-republish-01','preparedByLocalCommit':subprocess.check_output(['git','-C',WORKTREE,'rev-parse','HEAD']).decode().strip(),
      'executorThreadId':'01a1879b-febf-70f0-b503-71f7a19e356d','host':'WIN-36E9FF9EJM0','transport':'vps1-direct','remoteInterpreter':'sudo -n -- python3 -B',
      'original':{'intentPath':str(V1/'FROZEN_INTENT.json'),'intentSha256':sha(original_bytes),'archiveSha256':original['overlayArchive']['sha256'],
                  'consumerSource':original['sourceCommit'],'ledgerCommit':original['ledgerCommit'],'frozenInventorySha256':original['frozenInventorySha256'],
                  'status':'LOCAL_PARTIAL / NO_ART_MOTION_PASS','failedV1PostcheckSha256':'77cfc0969f2dc8e3aafce24f462a871772e894199c774939adf8bc1b4df7e888'},
      'roots':{'before':{'path':OLD,'identity':summary(base['oldTree'])},'retained':{'path':P6,'identity':summary(base['retainedTree'])}},
      'snippetPath':'/etc/nginx/snippets/review.locations.conf','beforeSnippet':base['snippet'],
      'afterSnippet':{'localPath':str(RUNTIME/'snippet-after.bin'),'bytes':len(after),'sha256':sha(after)},
      'inverse':{'localPath':str(RUNTIME/'snippet-inverse.bin'),'bytes':len(inverse),'sha256':sha(inverse),'restoresBeforeExactly':True},
      'delta':{'protectedContext':'existing location ^~ /review/','insertedDirectives':addition.decode(),
               'otherSnippetBytesIdenticalAfterInverse':True,'newLocations':0,'authOriginHeadersNosniffChanged':False},
      'standardMime':base['standardMime'],
      'mappingProof':{'existingReviewTypesBlock':False,'standardMappingsRetained':len(base['mimeMapping']),'afterMappingCount':len(effective),
                      'onlyAddedMapping':{'mjs':'application/javascript'},'globalMimeFileWritten':False,
                      'mechanism':'Include unchanged complete standard types in the existing Review location, then append mjs in a second types block at that same context. All 110 declared standard mappings retained; all other snippet directives and routes unchanged.'},
      'documents':base['documents'],'httpBaseline':base['http'],'catalogAfter':{'bytes':original['catalogDelta']['afterBytes'],'sha256':original['catalogDelta']['afterSha256']},
      'backup':'/opt/superflight-studio/backups/review-p6-mime-republish-01',
      'tempSnippet':'/etc/nginx/snippets/review.locations.conf.p6-mime-republish-01.tmp',
      'writeSet':['new owned fix backup/snapshot/STATE','exact Review snippet atomic replacement','existing nginx -t/reload'],
      'forbiddenWrites':['old or retained root files','runtime/core/config/projection/PRNG/assets','V1 state/receipts/authority','service documents','global mime.types','main vhost/security/access/credentials'],
      'liveLeaseGuard':{'coordinatorPath':r'E:\R4D\perspective\coordination\perspective-two-slots-2026-10-28.json',
                        'beforeEveryRemoteWritePhase':['apply','rollback'],'required':{'sharedRelease.tokenGranted':True,'sharedRelease.token.id':'must equal AUTH.token','sharedRelease.token.status':'ACTIVE_SINGLE_USE','sharedRelease.token.executorThreadId':'01a1879b-febf-70f0-b503-71f7a19e356d'},
                        'bindWholeCoordinatorSha256':False,'immutableAuthorityAloneIsPermission':False,'readOnlyRequiresActiveWriteToken':False},
      'safeBoundaryProtocol':'Executor acknowledges no pending write after phase return. CTO closes the fresh token only after that acknowledgement. Uncertain outcome => STOP and bounded RO; no write/reload replay.',
      'firstWriteDeadline':'Mandatory AUTH.firstWriteMustStartByUtc checked locally, then on VPS after RO guards immediately before backup.mkdir; missed deadline stops before first server write.',
      'recovery':{'automatic':False,'allowedStates':['FIX_WRITE_STARTED','FIX_SNIPPET_REPLACED','FIX_RELOADED_NEEDS_HTTP'],
                  'conditions':'Prior bounded RO reconciliation and explicit CTO recovery command; fresh live lease still ACTIVE with the same apply-token owner, rollbackAuthorized=true, rollback phase granted, exact after-snippet and owned original snapshot, roots/docs/MIME unchanged.',
                  'closedOrDifferentTokenOrUnknownState':'STOP. Requires a new exact recovery binding/intent/token from CTO after RO; this writer does not treat recovery as universal and never reopens a closed authority.',
                  'inverse':'Exact original 950-byte snippet and P3 root, existing nginx -t/reload; no immediate catalog assertion inside write phase. Subsequent RO readback only. Never delete retained P6 root or evidence.'},
      'validation':{'readiness':{'maxObservations':3,'probeHardTimeoutSeconds':2,'waitBetweenSeconds':1,'maximumWaitSeconds':2,'totalHardBudgetSeconds':9,
                                  'record':'All actual status, all headers, body bytes/SHA and elapsed timing. Only exact previous catalog may receive another same-context observation; unknown/access response stops. No write/reload retry. No suite before exact expected catalog.'},
                    'canonicalProtectionRequests':3,'onceOnlyPayloadRequests':45,'oldRepresentativeRequests':5,
                    'suiteProbeHardTimeoutSeconds':5,'suiteProbeTimeoutSumSeconds':265,'maximumHttpObservations':56,'readinessPlusSuiteProbeBudgetSeconds':274,
                    'noRedirectsCredentialsOrAuthBypass':True,'recordAllObservationsInNewOwnedLocalRecords':True,
                    'ui':'Later ONE Lead bounded canvas/modules/step/play-pause/replay/paused Art-Geometry smoke, only after HTTP verification and CTO confirmation. No art acceptance, QA redo or download check.'},
      'oldRepresentativeTypes':rep_expectations,
      'newRecordsOnly':True,'v1Chronology':{'closureUtc':'2026-10-29T21:28:25Z','rollbackWriteUtc':'2026-10-29T21:31:18.877546554Z','rollbackResult':'STOP catalog HTTP identity; later RO original routing exact. Post-closure action is not retroactively authorized.'},
      'finalization':'Separate frozen finalizer intent/late binding after actual new HTTP and Lead UI receipts plus explicit CTO UI approval; append only two exact service documents. MIME/root write set is unchanged. No V1 success rewrite or current UI/P4/P5/P6 Water-Dark work.',
      'writerHashes':{'launcherSha256':sha((CONTROL/'execute.py').read_bytes()),'remoteSourceSha256':sha((CONTROL/'remote.py').read_bytes()),'composedWriterSha256':sha(writer),'leaseGuardSha256':sha((CONTROL/'lease_guard.py').read_bytes())},
      'preparationEvidence':{'freshBaseline':record(baseline_path),'oldTypesBefore':record(RUNTIME/'OLD_TYPES_BEFORE.private.json'),'controlGuardTests':guard_tests},
      'technicalEvidence':['https://nginx.org/en/docs/http/ngx_http_core_module.html#types','https://raw.githubusercontent.com/nginx/nginx/release-1.26.2/src/http/ngx_http_core_module.c'],
      'transcriptEvidenceVerbatim':original['authorizationBasis']['transcriptEvidence'],
      'nextAction':'No server writes in preparation. Wait for fresh exact CTO token/window; current authoritative tokenGranted=false.'}
    target=RUNTIME/'FROZEN_FIX_INTENT.json';save(target,(json.dumps(scope,ensure_ascii=False,indent=2)+'\n').encode())
    print(json.dumps({'intent':record(target),'afterSnippet':scope['afterSnippet'],'inverse':scope['inverse'],'delta':scope['delta'],
                      'writerHashes':scope['writerHashes'],'tokenGranted':False,'serverWrite':False},ensure_ascii=False,indent=2))


if __name__=='__main__':
    main()
