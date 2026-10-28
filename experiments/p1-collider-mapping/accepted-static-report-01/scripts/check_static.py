"""Bounded file/link/provenance checks; does not run Viewer or physics."""
import hashlib,json,re,struct,subprocess
from html.parser import HTMLParser
from pathlib import Path
from urllib.parse import urlsplit

BASE=Path(__file__).resolve().parents[1]
REPO=BASE.parents[2]
sha=lambda b:hashlib.sha256(b).hexdigest()

class Page(HTMLParser):
    def __init__(self):
        super().__init__();self.ids=[];self.links=[];self.images=[];self.forbidden=[]
    def handle_starttag(self,tag,attrs):
        a=dict(attrs)
        if 'id' in a:self.ids.append(a['id'])
        if tag in ['script','iframe','canvas','form','object','embed','base']:self.forbidden.append(tag)
        assert not any(k.startswith('on') for k in a),'Event handler'
        for k in ['href','src']:
            if k in a:self.links.append(a[k])
        if tag=='img':self.images.append(a)

def jpeg_size(data):
    assert data[:2]==b'\xff\xd8'
    pos=2
    while pos<len(data):
        assert data[pos]==255
        while data[pos]==255:pos+=1
        marker=data[pos];pos+=1
        if marker in [0x01,*range(0xd0,0xda)]:continue
        size=int.from_bytes(data[pos:pos+2],'big')
        if marker in [0xc0,0xc1,0xc2,0xc3,0xc5,0xc6,0xc7,0xc9,0xca,0xcb,0xcd,0xce,0xcf]:
            h,w=struct.unpack('>HH',data[pos+3:pos+7]);return w,h
        pos+=size
    raise AssertionError('No JPEG size')

def check():
    site=BASE/'site';p=Page();html=(site/'index.html').read_text(encoding='utf-8');p.feed(html)
    assert not p.forbidden
    assert len(p.ids)==len(set(p.ids))
    assert len(p.images)==10
    provenance=json.loads((BASE/'audit/PROVENANCE.json').read_text(encoding='utf-8'))
    assert provenance['sourceCommit']=='4b47db04c7140ebf88f69b91faa0b790d46f22ec'
    assert len(provenance['figures'])==10
    expected={'index.html','report.css'}|{'figures/'+r['file'] for r in provenance['figures']}
    actual={f.relative_to(site).as_posix() for f in site.rglob('*') if f.is_file()}
    assert expected==actual,(expected^actual)
    assert not any(f.is_symlink() for f in site.rglob('*'))
    for url in p.links:
        parts=urlsplit(url)
        assert not parts.scheme and not parts.netloc,url
        if url=='/review/':continue
        if not parts.path:
            assert parts.fragment in p.ids,url
        else:
            path=(site/parts.path).resolve()
            assert site.resolve() in path.parents and path.is_file(),url
    for img in p.images:
        assert img.get('alt') and img.get('loading')=='lazy'
        data=(site/img['src']).read_bytes()
        assert jpeg_size(data)==(int(img['width']),int(img['height'])),img['src']
    for row in provenance['figures']:
        data=(site/'figures'/row['file']).read_bytes()
        source=subprocess.check_output(['git','show',row['sourceCommit']+':'+row['sourcePath']],cwd=REPO)
        assert data==source and sha(data)==row['sha256'] and len(data)==row['bytes']
        assert row['figureId'] in p.ids
    assert [(r['board'],r['trial']) for r in provenance['selectedInputs']]==[('01','01'),('02','01'),('03','02'),('04','02')]
    assert [(r['counts']['circleFootprints'],r['counts']['loopFootprints'],r['counts']['obstacleSegments']) for r in provenance['selectedInputs']]==[(25,0,0),(12,12,48),(14,7,42),(6,23,92)]
    css=(site/'report.css').read_text(encoding='utf-8')
    assert not re.search(r'url\s*\(|@import',css,re.I)
    assert '@media(max-width:760px)' in css and 'object-fit:contain' in css
    assert not re.search(r'[A-Z]:[\\/]|/srv/|/home/|/etc/|\.map\b|sim-core|node_modules',html+'\n'+css)
    rows=[{'path':path,'bytes':(site/path).stat().st_size,'sha256':sha((site/path).read_bytes())} for path in sorted(actual)]
    tree=sha(''.join(f"{r['sha256']} {r['bytes']} {r['path']}\n" for r in rows).encode())
    return {'status':'PASS bounded static/provenance self-check','browserRenderVerified':False,'independentQa':False,'simulationExecuted':False,'files':len(rows),'totalBytes':sum(r['bytes'] for r in rows),'treeHashRule':'SHA-256 UTF-8 sorted rows: sha256 + space + decimal bytes + space + path + LF; site-relative paths','treeSha256':tree,'fileManifest':rows}

if __name__=='__main__':
    result=check()
    (BASE/'audit/STATIC_CHECK.json').write_text(json.dumps(result,ensure_ascii=False,indent=2)+'\n',encoding='utf-8')
    print(json.dumps({k:v for k,v in result.items() if k!='fileManifest'},ensure_ascii=False))
