"""Offline regression for the actual nested HTTP helper; never executes run/phases."""
from pathlib import Path
import argparse,ast,copy,datetime,hashlib,json,types

CONTROL=Path(__file__).parent
HEADER_KEYS=['Location','X-Frame-Options','Cache-Control','X-Robots-Tag',
             'X-Content-Type-Options','Referrer-Policy','Content-Type']

def sha(data):
    return hashlib.sha256(data).hexdigest()

class OfflineFactory:
    def __init__(self):
        self.connections=[]
    def __call__(self,host,timeout):
        connection=OfflineConnection(host,timeout)
        self.connections.append(connection)
        return connection

class OfflineConnection:
    def __init__(self,host,timeout):
        self.host=host;self.timeout=timeout;self.events=['connect']
        self.method=None;self.path=None;self.headers=None
    def request(self,method,path,headers):
        self.events.append('request')
        self.method=method;self.path=path;self.headers=dict(headers)
    def getresponse(self):
        self.events.append('getresponse')
        self.status=403 if self.headers.get('Origin') else (404 if self.path.endswith('.p3-combined-probe') else 303)
        self.response_headers={
            'Location':'/login' if self.status==303 else None,
            'X-Frame-Options':'DENY','Cache-Control':'no-store',
            'X-Robots-Tag':'noindex','X-Content-Type-Options':'nosniff',
            'Referrer-Policy':'no-referrer',
            'Content-Type':'text/html' if self.status in (303,403) else 'text/plain'}
        return OfflineResponse(self)
    def close(self):
        self.events.append('close')

class OfflineResponse:
    def __init__(self,connection):
        self.connection=connection;self.status=connection.status
    def getheader(self,key):
        return self.connection.response_headers.get(key)
    def read(self):
        self.connection.events.append('read')
        return b'offline-stub-body'

def extracted_actual_helper(source,factory):
    module=ast.parse(source)
    runs=[n for n in module.body if isinstance(n,ast.FunctionDef) and n.name=='run']
    assert len(runs)==1
    helpers=[n for n in runs[0].body if isinstance(n,ast.FunctionDef) and n.name=='http']
    assert len(helpers)==1
    # Preserve the original nested function's lexical binding of its own name.
    # Merely calling a rewritten stand-alone imitation would miss this bug.
    wrapper=ast.parse('def make_http_helper(s):\n    pass\n').body[0]
    wrapper.body=[copy.deepcopy(helpers[0]),ast.Return(value=ast.Name(id='http',ctx=ast.Load()))]
    isolated=ast.fix_missing_locations(ast.Module(body=[wrapper],type_ignores=[]))
    client=types.SimpleNamespace(HTTPSConnection=factory)
    namespace={'http':types.SimpleNamespace(client=client),'http_client':client}
    exec(compile(isolated,'<actual-http-helper-only>','exec'),namespace)
    return namespace['make_http_helper']({'publicHost':'offline.invalid'})

def main():
    parser=argparse.ArgumentParser(description=__doc__)
    parser.add_argument('--receipt',required=True)
    args=parser.parse_args()
    v1=(CONTROL/'combined_remote.py').read_bytes()
    v2=(CONTROL/'combined_remote_v2.py').read_bytes()
    launcher1=(CONTROL/'combined_execute.py').read_bytes()
    launcher2=(CONTROL/'combined_execute_v2.py').read_bytes()
    expected=v1.replace(
        b'import datetime,hashlib,http.client,json,os,re,shutil,stat,subprocess,tarfile\n',
        b'import datetime,hashlib,json,os,re,shutil,stat,subprocess,tarfile\nimport http.client as http_client\n'
    ).replace(b'c=http.client.HTTPSConnection',b'c=http_client.HTTPSConnection')
    assert v2==expected,'Unexpected remote changes outside alias fix'
    expected_launcher=launcher1.replace(
        b"remote=(CONTROL/'combined_remote.py')",b"remote=(CONTROL/'combined_remote_v2.py')"
    ).replace(b"execution=RUNTIME/'execution'",b"execution=RUNTIME/'execution-v2'")
    assert launcher2==expected_launcher,'Unexpected launcher changes'
    for name,data in [('remote-v2',v2),('launcher-v2',launcher2)]:
        compile(data,name,'exec')
    old_factory=OfflineFactory()
    old_helper=extracted_actual_helper(v1,old_factory)
    try:
        old_helper('/review/')
    except AttributeError as error:
        assert str(error)=="'function' object has no attribute 'client'",str(error)
        old_failure={'exceptionType':type(error).__name__,'reason':str(error)}
    else:
        raise AssertionError('V1 namespace failure was not reproduced')
    assert not old_factory.connections,'V1 unexpectedly reached connection factory'
    factory=OfflineFactory();helper=extracted_actual_helper(v2,factory)
    cases=[('/review/',False,303),('/review/',True,403),('/review/.p3-combined-probe',False,404)]
    checked=[]
    for path,foreign,status in cases:
        result=helper(path,foreign)
        connection=factory.connections[-1]
        wanted={'User-Agent':'R4D-P3-combined-delivery/1'}
        if foreign:wanted['Origin']='https://example.invalid'
        assert connection.host=='offline.invalid' and connection.timeout==25
        assert connection.method=='GET' and connection.path==path and connection.headers==wanted
        assert connection.events==['connect','request','getresponse','read','close'],connection.events
        assert result=={'path':path,'status':status,'headers':{k:connection.response_headers[k] for k in HEADER_KEYS},'foreignOrigin':foreign},result
        checked.append({'path':path,'foreignOrigin':foreign,'status':status,'requestHeaders':wanted,
                        'responseHeaderKeys':list(result['headers']),'bodyRead':True,'connectionClosed':True,
                        'events':connection.events})
    assert len(factory.connections)==3
    receipt={'status':'PASS','utc':datetime.datetime.now(datetime.timezone.utc).isoformat(),
             'test':'AST-extracted actual nested HTTP helper / offline HTTPSConnection stub',
             'networkUsed':False,'sshUsed':False,'remotePhaseRun':False,
             'v1':{'sourceSha256':sha(v1),'expectedFailureReproduced':True,'stubConnections':0,**old_failure},
             'v2':{'sourceSha256':sha(v2),'launcherSha256':sha(launcher2),'syntaxPass':True,
                   'exactMinimalDiffPass':True,'stubConnections':len(factory.connections),'cases':checked}}
    path=Path(args.receipt)
    assert not path.exists(),'Do not overwrite an existing test receipt'
    path.write_text(json.dumps(receipt,ensure_ascii=False,indent=2)+'\n',encoding='utf-8')
    print(json.dumps(receipt,ensure_ascii=False))

if __name__=='__main__':
    main()
