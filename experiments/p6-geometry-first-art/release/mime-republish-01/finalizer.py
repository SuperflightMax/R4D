"""Local late binding, then separately authorized append-only document phase."""
import argparse
import datetime
import hashlib
import json
import subprocess
from pathlib import Path
from lease_guard import live_lease

RUNTIME=Path(r'E:\R4D\perspective\p6-runtime\release-engineer\mime-republish-01')


def sha(data):return hashlib.sha256(data).hexdigest()
def need(ok,reason):
    if not ok:raise RuntimeError('STOP '+reason)
def read(path):
    p=Path(path).resolve();need(p.is_relative_to(RUNTIME.resolve()),'private receipt/approval outside own runtime')
    b=p.read_bytes();return p,b,json.loads(b)
def rec(path,data):return {'path':str(path),'bytes':len(data),'sha256':sha(data)}
def utc(value):
    parsed=datetime.datetime.fromisoformat(value.replace('Z','+00:00'));need(parsed.tzinfo is not None,'UTC/timezone receipt required');return value

def check_document_deadline(auth,utc_now=None):
    value=auth.get('firstWriteMustStartByUtc')
    if value:
        deadline=datetime.datetime.fromisoformat(value.replace('Z','+00:00'));need(deadline.tzinfo is not None,'document deadline timezone')
        need((utc_now or datetime.datetime.now(datetime.timezone.utc))<deadline,'document first-write deadline missed')


def validate_receipts(f,apply,http,ui,approval,hashes):
    need(apply['status']=='FIX_RELOADED_NEEDS_HTTP' and apply['state']['intentSha256']==f['fixIntentSha256'],'actual new apply receipt')
    need(http['status']=='HTTP_VERIFIED_UI_PENDING' and http['fixIntentSha256']==f['fixIntentSha256'],'actual new HTTP verification')
    need(http['readiness']['status']=='EXPECTED_CATALOG_READY' and len(http['canonicalProtection'])==3,'actual bounded readiness/protection receipt')
    need(len(http['payloads'])==45 and len(http['oldRepresentativeTypes'])==5 and all(x['payloadIdentityVerified'] and x['mimeVerified'] and x['securityHeadersVerified'] for x in http['payloads']+http['oldRepresentativeTypes']),'actual complete 45+5 verification')
    need(ui.get('status')=='VERIFIED_DELIVERY_SMOKE' and ui.get('fixIntentSha256')==f['fixIntentSha256'] and ui.get('archiveSha256')==f['original']['archiveSha256'] and ui.get('url')==f['url'],'actual bounded Lead UI receipt bindings')
    need(approval.get('approved') is True and approval.get('fixIntentSha256')==f['fixIntentSha256'] and approval.get('uiReceiptSha256')==hashes['ui'] and approval.get('httpReceiptSha256')==hashes['http'] and approval.get('applyReceiptSha256')==hashes['apply'],'explicit CTO approval of actual receipt hashes')
    need(approval.get('originalIntentSha256')==f['original']['intentSha256'] and approval.get('archiveSha256')==f['original']['archiveSha256'] and approval.get('url')==f['url'],'CTO completion chain')
    utc(apply['state']['reloadCompletedUtc']);utc(ui['checkedAtUtc']);utc(approval['approvedAtUtc'])


def prepare(args,fpath,fbytes,f):
    ap,ab,apply=read(args.apply_receipt);hp,hb,http=read(args.http_receipt);up,ub,ui=read(args.ui_receipt);cp,cb,approval=read(args.approval_file)
    validate_receipts(f,apply,http,ui,approval,{'apply':sha(ab),'http':sha(hb),'ui':sha(ub)})
    published=utc(apply['state']['reloadCompletedUtc']);ui_time=utc(ui['checkedAtUtc']);utc(approval['approvedAtUtc'])
    binding={'schema':'r4d.p6.finalizer-binding.v1','finalizerIntentSha256':sha(fbytes),'fixIntentSha256':f['fixIntentSha256'],
             'actualPublicationUtc':published,'applyReceipt':rec(ap,ab),'httpReceipt':rec(hp,hb),'uiReceipt':rec(up,ub),'uiApproval':rec(cp,cb),'appends':[]}
    values={'url':f['url'],'verdict':'LOCAL_PARTIAL / NO_ART_MOTION_PASS','actualPublicationUtc':published,'uiCheckedAtUtc':ui_time,
            'originalIntentSha256':f['original']['intentSha256'],'originalArchiveSha256':f['original']['archiveSha256'],'fixIntentSha256':f['fixIntentSha256'],
            'httpReceiptSha256':sha(hb),'uiReceiptSha256':sha(ub),'uiApprovalSha256':sha(cb)}
    for index,template in enumerate(f['appendTemplates']):
        data=template.format(**values).encode();path=RUNTIME/('finalizer-append-'+str(index)+'.bin');need(not path.exists(),'append output occupied')
        path.write_bytes(data);binding['appends'].append(rec(path,data))
    out=RUNTIME/'FINALIZER_BINDING.json';need(not out.exists(),'existing immutable UI binding');out.write_bytes((json.dumps(binding,ensure_ascii=False,indent=2)+'\n').encode())
    print(json.dumps({'status':'LOCAL_FINALIZER_BINDING_PREPARED','binding':rec(out,out.read_bytes()),'serverWrite':False},ensure_ascii=False,indent=2))


def main():
    p=argparse.ArgumentParser(description=__doc__);p.add_argument('--phase',choices=['prepare-binding','document'],required=True);p.add_argument('--intent-file',required=True)
    for name in ['apply-receipt','http-receipt','ui-receipt','approval-file','binding-file','authorization-file']:p.add_argument('--'+name)
    args=p.parse_args();fp,fb,f=read(args.intent_file);need(f['status']=='FROZEN_FINALIZER_INTENT','finalizer not frozen')
    need(sha(Path(__file__).read_bytes())==f['writerHashes']['launcherSha256'] and sha(Path(__file__).with_name('lease_guard.py').read_bytes())==f['writerHashes']['leaseGuardSha256'],'finalizer/lease code drift')
    if args.phase=='prepare-binding':return prepare(args,fp,fb,f)
    bp,bb,b=read(args.binding_file);ap,ab,a=read(args.authorization_file)
    need(a.get('serverWrite') is True and a.get('tokenGranted') is True and a.get('intentSha256')==sha(fb) and a.get('bindingSha256')==sha(bb),'fresh exact finalizer authority')
    need(a.get('releaseId')==f['releaseId']=='p6-mime-republish-01','finalizer release binding')
    need('document' in a.get('authorizedPhases',[]) and a.get('launcherSha256')==sha(Path(__file__).read_bytes()),'document phase/code grant')
    need(a.get('uiReceiptSha256')==b['uiReceipt']['sha256'] and a.get('uiApprovalSha256')==b['uiApproval']['sha256'],'CTO actual UI approval authority binding')
    for key in ['applyReceipt','httpReceipt','uiReceipt','uiApproval']:
        path=Path(b[key]['path']);need(sha(path.read_bytes())==b[key]['sha256'],'actual receipt/approval changed')
    # Re-derive every byte from templates/approved receipts, without writing files.
    apply=json.loads(Path(b['applyReceipt']['path']).read_bytes());http=json.loads(Path(b['httpReceipt']['path']).read_bytes())
    ui=json.loads(Path(b['uiReceipt']['path']).read_bytes());approval=json.loads(Path(b['uiApproval']['path']).read_bytes())
    validate_receipts(f,apply,http,ui,approval,{'apply':b['applyReceipt']['sha256'],'http':b['httpReceipt']['sha256'],'ui':b['uiReceipt']['sha256']})
    need(b['actualPublicationUtc']==apply['state']['reloadCompletedUtc'] and len(b['appends'])==len(f['appendTemplates'])==2,'actual time/two exact appends')
    values={'url':f['url'],'verdict':'LOCAL_PARTIAL / NO_ART_MOTION_PASS','actualPublicationUtc':b['actualPublicationUtc'],'uiCheckedAtUtc':ui['checkedAtUtc'],
            'originalIntentSha256':f['original']['intentSha256'],'originalArchiveSha256':f['original']['archiveSha256'],'fixIntentSha256':f['fixIntentSha256'],
            'httpReceiptSha256':b['httpReceipt']['sha256'],'uiReceiptSha256':b['uiReceipt']['sha256'],'uiApprovalSha256':b['uiApproval']['sha256']}
    appends=[]
    for template,row in zip(f['appendTemplates'],b['appends']):
        data=Path(row['path']).read_bytes();need(data==template.format(**values).encode() and sha(data)==row['sha256'],'exact append substitution');appends.append(data)
    writer=Path(f['writerPath']).read_bytes();need(sha(writer)==f['writerHashes']['composedWriterSha256']==a.get('writerSha256'),'finalizer writer binding')
    record=RUNTIME/'FINALIZER_EXECUTION.json';need(not record.exists(),'existing finalizer record; reconcile, no replay')
    code=writer+('\nFINALIZER_BYTES='+repr(fb)+'\nF=json.loads(FINALIZER_BYTES)\nBINDING_BYTES='+repr(bb)+'\nB=json.loads(BINDING_BYTES)\nA='+repr(a)+'\nAPPENDS='+repr(appends)+'\nWRITER_SHA256='+repr(sha(writer))+'\ntry:\n print(json.dumps(finalize(),ensure_ascii=False))\nexcept Exception as e:\n print(json.dumps({"status":"STOP","reason":str(e)}));raise SystemExit(1)\n').encode()
    ssh=['ssh','-o','BatchMode=yes','-o','StrictHostKeyChecking=yes','-o','ConnectTimeout=15','-o','ConnectionAttempts=1','vps1-direct','sudo -n -- python3 -B -']
    check_document_deadline(a)
    lease=live_lease(a)  # Fresh authoritative fields immediately before this document write phase.
    result=subprocess.run(ssh,input=code,stdout=subprocess.PIPE,stderr=subprocess.PIPE)
    if result.stdout:
        value=json.loads(result.stdout);value['clientLeaseCheck']=lease;record.write_bytes((json.dumps(value,ensure_ascii=False,indent=2)+'\n').encode());print(json.dumps(value,ensure_ascii=False,indent=2))
    if result.returncode:
        if result.stderr:(RUNTIME/'FINALIZER_EXECUTION.stderr.txt').write_bytes(result.stderr)
        raise SystemExit(result.returncode)


if __name__=='__main__':main()
