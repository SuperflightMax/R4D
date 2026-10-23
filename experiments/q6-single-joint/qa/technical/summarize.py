from pathlib import Path
import json
import numpy as np
from PIL import Image
Q=Path('D:/dev/R4D/experiments/q6-single-joint/qa/technical');R=Q.parent.parent
def load(name):return json.loads((Q/name).read_text(encoding='utf8'))
b=load('browser-results.json');g=load('geometry-results.json');p=load('provenance-audit.json');before=load('hashes-before.json');after=load('hashes-after.json');inputs=load('input-metrics.json')
bboxes={}
for v in ['J0','J1','J2','M1','M2']:
 bboxes[v]={}
 for part in ['thigh','shin']:
  arr=np.array(Image.open(R/f'art/{v}/{part}_near.png').convert('RGBA'));bboxes[v][part]={}
  for threshold in [1,32,128]:
   yy,xx=np.where(arr[:,:,3]>=threshold);bboxes[v][part][str(threshold)]=[int(xx.min()),int(yy.min()),int(xx.max()+1),int(yy.max()+1)]
out={'staff_id':'technical-qa-r4d-q6-01','role':'Independent Technical QA Q6','model_reasoning_basis':'Configuration supplied by dispatch: gpt-6.1-sol / medium','candidate':'q6-c1','base':'f7b563db381078f90109bbf48946841809986217','cwd':'D:/dev/R4D','full_passes':1,'corrections':0,'verdict':'STOP_SHOW_WITH_LIMITATIONS','research_question_measurable':True,'motion_comparability':True,'blocking_findings':[],
'frozen':{'manifestSHA256':after['manifestSHA256'],'contractSHA256':after['contractSHA256'],'files':after['count'],'bytes':after['bytes'],'beforeFailures':before['failures'],'afterFailures':after['failures'],'beforeAfterRecordEquality':before['records']==after['records']},
'browser':{'session':'q6-technical-qa','closed':True,'serverLeftRunning':True,'stateSamples':len(b['samples']),'assertions':len(b['checks']),'failedAssertions':[x for x in b['checks'] if not x['ok']],'errors':b['errors'],'warnings':b['warnings'],'requestFailures':b['requestFailures'],'httpErrors':b['httpErrors'],'assets':len(b['uniqueAssetURLs']),'desktop':[1440,1100],'mobileViewport':[390,844],'screenshotCount':25,'contactSheetCount':1,'actualRAF':True,'diagnosticAdvanceSameMotion':True},
'geometry':g['summary'],'nativeAlphaBboxesHalfOpen':bboxes,'provenanceAuditFailures':p['failures'],'outsideMask':p['diffs'],'runtimeMappingOK':all(x['ok'] for x in inputs['runtimeMapping']),
'findings':[
 {'id':'T1','severity':'research-limitation','domain':'J/M','summary':'J1/M2 loses stock; original alpha>=128 coverage removed inside repair masks: thigh1688, shin260. No sampled macroscopic disconnection.','blocksShow':False},
 {'id':'T2','severity':'research-limitation','domain':'J','summary':'J0 cap and M1 hollow end remain; J1 fabric improves cut-face appearance but retains rigid contour; J2 adds angular protrusion. No ideal joint established.','blocksShow':False},
 {'id':'T3','severity':'presentation-limitation','domain':'camera','summary':'Fixed .84 flexion clips distal boot; knee remains visible. CSS scales entire canvas equally.','blocksShow':False}],
'separateConclusions':{'diagnostic':'Source [39,240] vs neutral [41,284] confirmed, effective layers -10/-11 retained; offset change does not remove art cap.','J':'Same motion permits comparison of actual variants. J1 changes coverage as well as cap, so pure contour-only causality is not isolated. J2 is not proven superior.','M':'Both routes use one scale/fixed crops. M2 final outside diff0 is agent compositing; raw diff71437. M1 outside diff73608. Frozen ledger supports calls2/retries0; calls not witnessed by QA.'},
'recommendation':'Stop/show. No technical correction needed to make the research comparison measurable. CTO decides after reviews/responses.',
'limits':['Sampled local joint only; not exhaustive command times','Coverage geometry is inverse-texture alpha sampling, not WebGL framebuffer pixel counting','No subjective naturalness, 60fps, physical correctness or production readiness claim','One case does not prove method repeatability','Ledger/raw provenance inspected; absence of unrecorded generation not independently provable'],
'infrastructure':['First QA CLI startup failed before navigation because expected browser revision missing; existing isolated Chromium1208 used without install','Initial shell text export damaged Cyrillic; canonical results exported as UTF8/base64 without rerunning pass','Builder reports initial CLI SyntaxError before actions; completed self-check is not substituted for independent QA'],
'evidence':['REPORT.md','browser-results.json','geometry-results.json','input-metrics.json','provenance-audit.json','hashes-before.json','hashes-after.json','output/playwright/','browser-pass.cjs','verify.py','geometry.py','audit-provenance.py']}
(Q/'SUMMARY.json').write_text(json.dumps(out,indent=2,ensure_ascii=False)+'\n',encoding='utf8')
assert out['frozen']['beforeAfterRecordEquality'] and not out['browser']['failedAssertions'] and not p['failures']
print(json.dumps({'verdict':out['verdict'],'files':out['frozen']['files'],'bytes':out['frozen']['bytes'],'samples':out['browser']['stateSamples'],'failures':len(out['browser']['failedAssertions']),'bboxThighJ0':bboxes['J0']['thigh']['128'],'bboxThighM2':bboxes['M2']['thigh']['128']}))
