"""Focused offline tests of actual V3 HTTP guards/payload and opaque append helpers."""
from pathlib import Path
import argparse,ast,copy,datetime,hashlib,importlib.util,json,types
from unittest.mock import patch

CONTROL=Path(__file__).parent
RUNTIME=Path(r'E:\R4D\perspective\p3-runtime\release-engineer\transfer-water-dark\combined\water-dark-front-edge-04')

def sha(data):return hashlib.sha256(data).hexdigest()

class Reply:
    def __init__(self,status,headers,body):
        self.status=status;self.headers=dict(headers);self.data=body;self.offset=0;self.read_sizes=[]
    def getheader(self,key):return self.headers.get(key)
    def read(self,size):
        assert 0<size<=65536
        self.read_sizes.append(size);chunk=self.data[self.offset:self.offset+size];self.offset+=len(chunk);return chunk

class Factory:
    def __init__(self,replies):self.replies=list(replies);self.connections=[]
    def __call__(self,host,timeout):
        assert host=='superflight.space' and timeout==25
        connection=Connection(self.replies.pop(0));self.connections.append(connection);return connection

class Connection:
    def __init__(self,reply):self.reply=reply;self.closed=False;self.request_args=None
    def request(self,method,path,headers):
        assert method=='GET'
        assert set(headers) in ({'User-Agent'},{'User-Agent','Origin'})
        assert headers['User-Agent']=='R4D-P3-combined-delivery/1'
        if 'Origin' in headers:assert headers['Origin']=='https://example.invalid'
        self.request_args=(method,path,dict(headers))
    def getresponse(self):return self.reply
    def close(self):self.closed=True

def dump_without_location(node):return ast.dump(node,include_attributes=False)

def core_write_logic_unchanged(old,new):
    old_run=next(n for n in ast.parse(old).body if isinstance(n,ast.FunctionDef) and n.name=='run')
    new_run=next(n for n in ast.parse(new).body if isinstance(n,ast.FunctionDef) and n.name=='run')
    for name in ['resource','snip','baseline','newguard','state','persist','nginx_test','reload','restore']:
        get=lambda r:next(n for n in r.body if isinstance(n,ast.FunctionDef) and n.name==name)
        assert dump_without_location(get(old_run))==dump_without_location(get(new_run)),name
    for phase in ['stage','switch','rollback']:
        def get(run):
            return next(n for n in run.body if isinstance(n,ast.If) and isinstance(n.test,ast.Compare)
                        and isinstance(n.test.left,ast.Name) and n.test.left.id=='phase'
                        and len(n.test.comparators)==1 and isinstance(n.test.comparators[0],ast.Constant)
                        and n.test.comparators[0].value==phase)
        assert dump_without_location(get(old_run))==dump_without_location(get(new_run)),phase
    get_tree=lambda source:next(n for n in ast.parse(source).body if isinstance(n,ast.FunctionDef) and n.name=='tree')
    assert dump_without_location(get_tree(old))==dump_without_location(get_tree(new))

def main():
    parser=argparse.ArgumentParser(description=__doc__);parser.add_argument('--receipt',required=True);args=parser.parse_args()
    receipt_path=Path(args.receipt);assert not receipt_path.exists()
    source=(CONTROL/'combined_remote_v3.py').read_bytes()
    spec=importlib.util.spec_from_file_location('actual_combined_remote_v3',CONTROL/'combined_remote_v3.py')
    remote=importlib.util.module_from_spec(spec);spec.loader.exec_module(remote)
    scope=json.loads((CONTROL/'combined-packet-v3/WRITE_SCOPE_V3.json').read_bytes())
    baseline=scope['httpBaseline'];policy=scope['publicResourcePolicy'];results=[]
    old_body=(RUNTIME/'catalog.before.html').read_bytes();new_body=(RUNTIME/'overlay/review/index.html').read_bytes()
    assert len(old_body)==baseline['catalogBefore']['bytes'] and sha(old_body)==baseline['catalogBefore']['sha256']
    assert len(new_body)==baseline['catalogAfter']['bytes'] and sha(new_body)==baseline['catalogAfter']['sha256']
    def run_protection(name,mutate=None,key='catalogBefore',reject=False):
        replies=[Reply(200,baseline['headers'],old_body if key=='catalogBefore' else new_body),
                 Reply(403,baseline['headers'],b'offline-origin'),Reply(404,baseline['headers'],b'offline-dot')]
        if mutate:mutate(replies)
        factory=Factory(replies)
        with patch.object(remote,'http_client',types.SimpleNamespace(HTTPSConnection=factory)):
            observations=remote.collect_http('superflight.space',[('/review/',False),('/review/',True),('/review/.p3-combined-probe',False)])
        assert len(factory.connections)==3 and all(c.closed and c.reply.read_sizes for c in factory.connections)
        assert factory.connections[1].request_args[2]['Origin']=='https://example.invalid'
        try:remote.verify_protection(observations,baseline,key)
        except remote.EvidenceError as error:
            assert reject,name
            assert error.evidence['httpObservations']==observations
            json.dumps(error.evidence)
            results.append({'case':name,'expected':'REJECT','actual':'REJECT','reason':str(error),'observedStatuses':[r['status'] for r in observations],'actualFactsRetained':True})
        else:
            assert not reject,name
            results.append({'case':name,'expected':'PASS','actual':'PASS','observedStatuses':[r['status'] for r in observations]})
    run_protection('old_catalog200_exact_hash_and_seven_headers')
    run_protection('new_catalog200_exact_hash_and_seven_headers',key='catalogAfter')
    run_protection('normal303_rejected',lambda r:setattr(r[0],'status',303),reject=True)
    run_protection('wrong_body200_rejected',lambda r:setattr(r[0],'data',b'offline-wrong-body'),reject=True)
    run_protection('wrong_origin_status_rejected',lambda r:setattr(r[1],'status',200),reject=True)
    run_protection('wrong_dot_status_rejected',lambda r:setattr(r[2],'status',200),reject=True)
    run_protection('wrong_security_header_rejected',lambda r:r[0].headers.update({'X-Frame-Options':'SAMEORIGIN'}),reject=True)
    run_protection('non_null_location_rejected',lambda r:r[0].headers.update({'Location':'/login'}),reject=True)
    module_path=scope['publicBrowserModulePaths'][0];url='/'+module_path
    expected=scope['publicPayloadExpectations'][url];js_body=(RUNTIME/'overlay'/module_path).read_bytes()
    def resource(name,status,content_type,body,wanted,reject=False):
        headers=dict(baseline['headers']);headers['Content-Type']=content_type
        factory=Factory([Reply(status,headers,body)])
        with patch.object(remote,'http_client',types.SimpleNamespace(HTTPSConnection=factory)):
            actual=remote.http_probe('superflight.space',url)
        assert factory.connections[0].closed
        try:outcome=remote.verify_payload(actual,expected,policy)
        except remote.EvidenceError as error:
            assert reject;assert error.evidence['httpObservations']==[actual]
            results.append({'case':name,'expected':'REJECT','actual':'REJECT','actualFactsRetained':True})
        else:
            assert not reject and outcome['outcome']==wanted,outcome
            results.append({'case':name,'expected':wanted,'actual':outcome['outcome'],'moduleMimeBodyVerified':outcome['moduleMimeBodyVerified']})
    resource('exact_js_payload_and_actual_js_mime',200,'application/javascript; charset=utf-8',js_body,'VERIFIED')
    resource('html200_never_counts_as_module',200,'text/html',b'offline-login-html','UNVERIFIED_HTML_RESPONSE')
    resource('denial_never_counts_as_module',403,'text/html',b'offline-denial','UNVERIFIED_ACCESS_RESPONSE')
    resource('exact_js_bytes_wrong_mime_remains_unverified',200,'text/html',js_body,'UNVERIFIED_MODULE_MIME')
    resource('non_html_wrong_payload_rejected',200,'application/javascript',b'offline-wrong-js',None,reject=True)
    doc=receipt_path.parent/'offline-document-prefix.txt';assert not doc.exists();doc.write_bytes(b'original opaque local fixture\n')
    before=remote.opaque_doc_snapshot(doc);proof=remote.append_document(doc,b'append-only offline evidence\n',before)
    assert proof['originalPrefixAndMetadataPreserved']
    after=remote.opaque_doc_snapshot(doc,before['bytes']);assert remote.verify_doc_prefix(before,after)
    altered=copy.deepcopy(after);altered['prefixSha256']='0'*64
    try:remote.verify_doc_prefix(before,altered)
    except remote.EvidenceError:pass
    else:raise AssertionError('Changed original prefix accepted')
    altered=copy.deepcopy(after);altered['inode']+=1
    try:remote.verify_doc_prefix(before,altered)
    except remote.EvidenceError:pass
    else:raise AssertionError('Changed inode accepted')
    core_write_logic_unchanged((CONTROL/'combined_remote_v2.py').read_bytes(),source)
    old_scope=json.loads((CONTROL/'combined-packet/WRITE_SCOPE.json').read_bytes())
    assert all(scope[k]==v for k,v in old_scope.items())
    assert len(scope['publicSmokePaths'])+2==217 and len(scope['publicPayloadExpectations'])==197
    assert len(scope['publicBrowserModulePaths'])==10
    launcher_old=ast.parse((CONTROL/'combined_execute_v2.py').read_bytes());launcher_new=ast.parse((CONTROL/'combined_execute_v3.py').read_bytes())
    get_upload=lambda m:next(n.value.value for n in m.body if isinstance(n,ast.Assign) and any(isinstance(t,ast.Name) and t.id=='UPLOAD' for t in n.targets))
    assert get_upload(launcher_old)==get_upload(launcher_new)
    for name in ['combined_remote_v3.py','combined_execute_v3.py']:compile((CONTROL/name).read_bytes(),name,'exec')
    receipt={'status':'PASS','utc':datetime.datetime.now(datetime.timezone.utc).isoformat(),
             'test':'Actual imported V3 helpers with offline connection stub and opaque existing local catalog/module fixtures',
             'remoteSha256':sha(source),'launcherSha256':sha((CONTROL/'combined_execute_v3.py').read_bytes()),
             'scopeSha256':sha((CONTROL/'combined-packet-v3/WRITE_SCOPE_V3.json').read_bytes()),
             'networkUsed':False,'sshUsed':False,'phaseRun':False,'bodyOutputOrSaved':False,
             'cases':results,'docPrefixProofPass':True,'changedDocPrefixAndInodeRejected':True,
             'stageSwitchRollbackTreeAndForeignMetadataGuardsUnchanged':True,'uploadWriteLogicUnchanged':True,
             'originalScopeKeysUnchanged':True,'publicChecksPlanned':217,'modulesPlanned':10,
             'syntaxPass':True,'testSourceSha256':sha(Path(__file__).read_bytes())}
    receipt_path.write_bytes((json.dumps(receipt,ensure_ascii=False,indent=2)+'\n').encode())
    print(json.dumps(receipt,ensure_ascii=False))

if __name__=='__main__':main()
