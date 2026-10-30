"""Local-only immutable P5 Water/Dark material and relative wrapper packaging."""
import argparse, datetime, hashlib, html, json, os, pathlib, re, shutil, stat, subprocess
from html.parser import HTMLParser
from urllib.parse import urlsplit, unquote
HERE=pathlib.Path(__file__).resolve().parent
REPO=HERE.parents[3]
RUNTIME=pathlib.Path('E:/R4D/perspective/p5-runtime/release-engineer/transfer-water-dark')
PRODUCER=pathlib.Path('E:/R4D/perspective/p5-runtime/builder/transfer-water-dark')
COMMON=pathlib.Path('E:/R4D/perspective/coordination/p4-p5-transfer-common-inputs-2026-10-29.json')
COMMON_SHA='497eb8cca3aa7413254a85b18d98a1e7dfde66d9779c39fc6b5932a21f2b4946'
P5='experiments/p5-regenerated-objects/transfer-water-dark/'
def digest(b):return hashlib.sha256(b).hexdigest()
def jsonbytes(v):return (json.dumps(v,ensure_ascii=False,sort_keys=True,indent=2)+'\n').encode()
def read_json(p):return json.loads(pathlib.Path(p).read_bytes())
def write(p,b):
 p=pathlib.Path(p);p.parent.mkdir(parents=True,exist_ok=True)
 with p.open('xb') as f:f.write(b)
def pin(p):
 p=pathlib.Path(p);b=p.read_bytes();return dict(bytes=len(b),sha256=digest(b))
def safe(rel):
 p=pathlib.PurePosixPath(rel)
 if p.is_absolute() or not p.parts or '..' in p.parts or '\\' in rel or ':' in rel or any(x.startswith('.') for x in p.parts):raise ValueError('unsafe relative path: '+rel)
 return rel

def plain_tree(root):
 root=pathlib.Path(root);found={}
 for p in [root]+sorted(root.rglob('*')):
  m=p.lstat()
  if p.is_symlink() or getattr(m,'st_file_attributes',0)&0x400:raise ValueError('link/reparse item: '+str(p))
  if p.is_file():
   if m.st_nlink!=1:raise ValueError('hardlink: '+str(p))
   found[p.relative_to(root).as_posix()]=pin(p)
  elif not p.is_dir():raise ValueError('nonregular item: '+str(p))
 return found

def guard():
 free=shutil.disk_usage(RUNTIME).free
 if free<=2*1024**3:raise RuntimeError('E<=2GiB: preserve WIP and STOP')
 if free<=4*1024**3:print('WARNING E<=4GiB: diagnose own usage before next write')
 b=COMMON.read_bytes()
 if len(b)!=4265 or digest(b)!=COMMON_SHA:raise ValueError('common-input identity changed')
 return json.loads(b)

def git_bytes(commit,path):
 if not re.fullmatch('[0-9a-f]{40}',commit) or not path.startswith(P5) or '..' in pathlib.PurePosixPath(path).parts:raise ValueError('source outside explicit P5 transfer scope')
 p=subprocess.run(['git','-C',str(REPO),'show',commit+':'+path],stdout=subprocess.PIPE,stderr=subprocess.PIPE)
 if p.returncode:raise RuntimeError(p.stderr.decode('utf-8',errors='replace'))
 return p.stdout

def checked(b,expected,label):
 if len(b)!=expected['bytes'] or digest(b)!=expected['sha256']:raise ValueError('byte identity mismatch: '+label)
 return b

def freeze_files(root):
 for p in pathlib.Path(root).rglob('*'):
  if p.is_file():p.chmod(stat.S_IREAD)

def import_material(descriptor):
 common=guard();d=read_json(descriptor);board=d['board'];ident=d['id']
 if board not in ('water','dark') or not re.fullmatch('[a-z][a-z0-9-]{1,31}',ident):raise ValueError('invalid explicit board/id')
 indexpath=pathlib.Path(d['fileIndex']).resolve();indexpath.relative_to((PRODUCER/board).resolve())
 ib=checked(indexpath.read_bytes(),dict(bytes=d['indexBytes'],sha256=d['indexSha256']),'FILE_INDEX')
 idx=json.loads(ib)
 if idx['schema']!='r4d.p5.transfer.file-index/1' or idx['board']!=board or idx['id']!=ident:raise ValueError('board/index identity mismatch')
 public=pathlib.Path(idx['publicRoot']).resolve();public.relative_to((PRODUCER/board).resolve())
 expected={}
 for row in idx['files']:
  rel=safe(row['path'])
  if rel.casefold() in {x.casefold() for x in expected}:raise ValueError('duplicate filename')
  if pathlib.PurePosixPath(rel).suffix.lower() in ('.ts','.tsx','.map','.pem','.key','.env') or rel in ('FILE_INDEX.json','index.json','HANDOFF.md'):raise ValueError('private/source sidecar in browser whitelist')
  expected[rel]=dict(bytes=row['bytes'],sha256=row['sha256'])
 if plain_tree(public)!=expected:raise ValueError('public tree differs from exact FILE_INDEX whitelist')
 inp=next(x for x in common['boards'] if x['name'].lower()==board)
 if expected['data/config.json']['sha256']!=inp['configSha256'] or expected['data/p1-manifest.json']['sha256']!=inp['manifestSha256']:raise ValueError('active P1 trial/config identity mismatch')
 if not any(p.endswith('.png') for p in expected) or not idx.get('artistManifest'):raise ValueError('no actual generated board input; scaffold is not a final board')
 # Verify all named sidecars before making a new immutable material directory.
 side={'FILE_INDEX.json':ib,'common-inputs.json':COMMON.read_bytes()}
 pi=idx['previewIndex'];side['producer-index.json']=checked((indexpath.parent/safe(pi['path'])).read_bytes(),pi,'producer-index')
 artist=idx['artistManifest'];ab=git_bytes(artist['commit'],artist['path']);checked(ab,dict(bytes=artist['sourceBytes'],sha256=artist['sourceSha256']),'artist-manifest');side['artist-manifest.source.json']=ab
 for x in artist.get('supporting',[]):side['artist-support/'+safe(x['materialized'])]=checked(git_bytes(x.get('commit',artist['commit']),x['path']),x,x['path'])
 dest=RUNTIME/'material'/board/ident
 if d['baseline'] and (RUNTIME/'material'/board).exists():
  for old in (RUNTIME/'material'/board).glob('*/RECEIPT.json'):
   if read_json(old)['baseline']:raise ValueError('explicit original baseline already retained: '+str(old))
 if dest.exists():raise FileExistsError('occupied material; preserve existing baseline/version: '+str(dest))
 dest.mkdir(parents=True)
 for rel,p in expected.items():write(dest/'public'/rel,checked((public/rel).read_bytes(),p,rel))
 for rel,b in side.items():write(dest/'private'/rel,b)
 if plain_tree(dest/'public')!=expected or plain_tree(public)!=expected:raise ValueError('material/source changed during copy; retain WIP')
 receipt=dict(schema='r4d.p5.local-material/1',board=board,id=ident,createdUtc=datetime.datetime.now(datetime.timezone.utc).isoformat(),kind=d['kind'],baseline=d['baseline'],label=d['label'],stageLabel=d['stageLabel'],summary=d['summary'],limitations=d['limitations'],technicalNotes=d.get('technicalNotes',[]),indexSha256=d['indexSha256'],indexBytes=len(ib),publicFiles=expected,publicFileCount=len(expected),publicBytes=sum(x['bytes'] for x in expected.values()),pngFiles=sum(p.endswith('.png') for p in expected),consumerCommit=idx['consumerCommit'],artistCommit=artist['commit'],activeTrial=inp['activeTrial'],sidecars={p:dict(bytes=len(b),sha256=digest(b)) for p,b in side.items()},FullArtPass=False,BoardPass=False,TokenGranted=False,serverWrites=0,descriptor=d)
 write(dest/'RECEIPT.json',jsonbytes(receipt));freeze_files(dest)
 print(json.dumps(dict(material=str(dest),receipt=pin(dest/'RECEIPT.json'),publicFiles=len(expected),publicBytes=receipt['publicBytes'],pngFiles=receipt['pngFiles'],serverWrites=0),ensure_ascii=False))
 return receipt

class Links(HTMLParser):
 def __init__(self):super().__init__();self.refs=[]
 def handle_starttag(self,tag,attrs):
  for k,v in attrs:
   if k in ('href','src') and v:self.refs.append(v)
   if tag=='base':raise ValueError('base URL is not portable')
def verify_public(public,expected):
 if plain_tree(public)!=expected:raise ValueError('package hash/inventory mismatch')
 checkedrefs=[]
 for rel in expected:
  if not rel.endswith('.html'):continue
  parser=Links();parser.feed((public/rel).read_text(encoding='utf-8'))
  for ref in parser.refs:
   if ref.startswith(('#','data:','blob:')):continue
   u=urlsplit(ref)
   if u.scheme or u.netloc or u.path.startswith('/') or '\\' in ref:raise ValueError('nonrelative package link: '+ref)
   target=((public/rel).parent/unquote(u.path)).resolve();target.relative_to(public.resolve())
   if target.is_dir():target=target/'index.html'
   if not target.is_file():raise ValueError('missing relative target: '+ref)
   checkedrefs.append(dict(fromFile=rel,reference=ref,target=target.relative_to(public.resolve()).as_posix()))
 return checkedrefs

def resolve_versions(d):
 loaded=[];keys=set()
 if set(d['selected'])!={'water','dark'}:raise ValueError('explicit Water/Dark selection required')
 for v in d['versions']:
  key=(v['board'],v['id'])
  if v['board'] not in ('water','dark') or not re.fullmatch('[a-z][a-z0-9-]{1,31}',v['id']):raise ValueError('invalid explicit version')
  if key in keys:raise ValueError('duplicate board version')
  keys.add(key);root=RUNTIME/'material'/v['board']/v['id'];r=read_json(root/'RECEIPT.json')
  if (r['board'],r['id'])!=key:raise ValueError('material identity mismatch')
  if plain_tree(root/'public')!=r['publicFiles']:raise ValueError('registered immutable material changed')
  q={}
  for kind,ref in v.get('qa',{}).items():
   if kind not in ('technical','visual') or ref['fileIndexSha256']!=r['indexSha256']:raise ValueError('QA not bound to this exact candidate')
   raw=git_bytes(ref['commit'],ref['path']);q[kind]=dict(reference=ref,raw=raw,pin=dict(bytes=len(raw),sha256=digest(raw)))
  loaded.append((v,r,root,q))
 for board in ('water','dark'):
  entries=[x for x in loaded if x[0]['board']==board]
  if entries and not any(x[1]['baseline'] for x in entries):raise ValueError('include the explicit original baseline beside successors')
 for board,ident in d['selected'].items():
  if ident is not None and (board,ident) not in keys:raise ValueError('selected version not explicit')
 return loaded

def final_eligibility(d,loaded):
 reasons=[]
 for board in ('water','dark'):
  selected=d['selected'].get(board);entry=next((x for x in loaded if x[0]['board']==board and x[0]['id']==selected),None)
  if entry is None:reasons.append(board+': no actual frozen input');continue
  if entry[1]['kind']!='generated-board' or entry[1]['id']=='d00':reasons.append(board+': diagnostic/scaffold is not a board result')
  if set(entry[3])!={'technical','visual'}:reasons.append(board+': independent exact QA handoff pending')
 if d.get('purpose')=='baseline-archive':reasons.append('historical baseline archive is not the current final result')
 handoff=d.get('leadHandoff')
 if not handoff:reasons.append('separate Lead handoff for current selected inputs pending')
 else:
  selected_hashes={board:next((x[1]['indexSha256'] for x in loaded if x[0]['board']==board and x[0]['id']==d['selected'].get(board)),None) for board in ('water','dark')}
  if handoff.get('fileIndexSha256s')!=selected_hashes:raise ValueError('Lead handoff not bound to the selected current inputs')
  git_bytes(handoff['commit'],handoff['path'])
 return dict(eligible=not reasons,reasons=reasons)

def render(d,loaded,eligibility):
 e=html.escape;boards=[]
 for board,title,desc in [('water','Водная доска','Воротца, проёмы и корзины'),('dark','Тёмная доска','Грани и углы препятствий')]:
  items=[x for x in loaded if x[0]['board']==board];cards=[]
  for v,r,root,q in items:
   href='boards/'+board+'/'+r['id']+'/'
   tag='Исходный вариант' if r['baseline'] else 'Следующий вариант'
   selected=d['selected'].get(board)==r['id'];tag+=(' · показан в этом архиве' if d.get('purpose')=='baseline-archive' else ' · текущий показ') if selected else ''
   lim=''.join('<li>'+e(x)+'</li>' for x in r['limitations'])
   cards.append('<article class="version"><p class="eyebrow">'+e(tag)+'</p><h3>'+e(r['label'])+'</h3><p class="status">'+e(v.get('stageLabel',r['stageLabel']))+'</p><p>'+e(r['summary'])+'</p><ul>'+lim+'</ul><a class="open" href="'+href+'">Открыть вариант '+e(r['id'])+' →</a><details><summary>Данные и версии</summary><dl><dt>Вариант</dt><dd>'+e(r['id'])+'</dd><dt>Независимые отчёты</dt><dd>'+('Получены обе ссылки; ограничения сохраняются' if set(q)=={'technical','visual'} else 'Ожидаются')+'</dd><dt>Consumer commit</dt><dd><code>'+e(r['consumerCommit'])+'</code></dd><dt>Artist commit</dt><dd><code>'+e(r['artistCommit'])+'</code></dd><dt>FILE_INDEX SHA256</dt><dd><code>'+e(r['indexSha256'])+'</code></dd></dl><ul>'+''.join('<li>'+e(x)+'</li>' for x in r['technicalNotes']+v.get('technicalNotes',[]))+'</ul></details></article>')
  content=''.join(cards) if cards else '<p class="pending">Готового набора для просмотра пока нет. Доска появится после передачи её замороженного набора.</p>'
  boards.append('<section class="board '+board+'"><header><p class="eyebrow">'+e(desc)+'</p><h2>'+title+'</h2></header>'+content+'</section>')
 title='Архив исходных вариантов' if d.get('purpose')=='baseline-archive' else 'Комплект двух досок' if d.get('final') else 'Локальный черновик переноса'
 available={v['board'] for v,r,root,q in loaded}
 if d.get('purpose')=='baseline-archive':notice='Здесь сохранены первые наборы для сравнения с последующими исправлениями. Текущие исправленные варианты ещё готовятся. Этот архив не является финальным результатом переноса и не опубликован.'
 elif d.get('final'):notice='Обе доски включены в локальный комплект. Ограничения указаны по каждому варианту; публикация требует отдельного разрешения.'
 elif available=={'water'}:notice='Комплект ещё не завершён. Сейчас доступен частичный водный вариант; тёмная доска ожидается. Это не итог переноса и не опубликованный результат.'
 elif available=={'dark'}:notice='Комплект ещё не завершён. Доступна тёмная доска; водная ожидается. Это не итог переноса и не опубликованный результат.'
 else:notice='Обе доски добавлены в черновик. До итогового локального комплекта нужны их точные независимые отчёты и явный выбор версий. Публикация не разрешена.'
 return ('<!doctype html>\n<html lang="ru"><head><meta charset="utf-8"><meta name="viewport" content="width=device-width,initial-scale=1"><title>P5 · Водная и тёмная доски</title><link rel="stylesheet" href="wrapper.css"></head><body><main><header class="intro"><p class="eyebrow">R4D · P5 · перенос способа</p><h1>Водная и тёмная доски</h1><p>Результаты по каждой доске и сохранённые варианты.</p></header><aside class="notice"><strong>'+title+'</strong><p>'+notice+'</p></aside><div class="boards">'+''.join(boards)+'</div><footer>Сохранённые исходные варианты остаются доступны. Непроверенное не считается пройденным.</footer></main></body></html>\n').encode()

def build(descriptor):
 guard();d=read_json(descriptor);loaded=resolve_versions(d);eligibility=final_eligibility(d,loaded)
 if d.get('final') and not eligibility['eligible']:raise ValueError('final package blocked: '+str(eligibility['reasons']))
 out=RUNTIME/'builds'/safe(d['id'])
 if out.exists():raise FileExistsError('occupied package; preserve previous draft/version')
 out.mkdir(parents=True);public=out/'public'
 for v,r,root,q in loaded:
  for rel,p in r['publicFiles'].items():write(public/'boards'/r['board']/r['id']/rel,checked((root/'public'/rel).read_bytes(),p,rel))
  for kind,data in q.items():write(out/'private'/'qa'/r['board']/r['id']/(kind+'.md'),data['raw'])
 write(public/'index.html',render(d,loaded,eligibility));write(public/'wrapper.css',(HERE/'wrapper.css').read_bytes());write(out/'private/package-descriptor.json',jsonbytes(d))
 if d.get('leadHandoff'):write(out/'private/lead-handoff.md',git_bytes(d['leadHandoff']['commit'],d['leadHandoff']['path']))
 files=plain_tree(public);refs=verify_public(public,files)
 index=dict(schema='r4d.p5.local-package/1',id=d['id'],createdUtc=datetime.datetime.now(datetime.timezone.utc).isoformat(),state='FINAL_LOCAL_ASSEMBLED' if d.get('final') else 'DRAFT_INCOMPLETE',purpose=d.get('purpose','current-result'),finalAssembled=bool(d.get('final')),finalEligibility=eligibility,TokenGranted=False,serverWrites=0,FullArtPass=False,BoardPass=False,files=files,fileCount=len(files),publicBytes=sum(p['bytes'] for p in files.values()),versions=[dict(board=r['board'],id=r['id'],baseline=r['baseline'],materialReceipt=pin(root/'RECEIPT.json'),fileIndexSha256=r['indexSha256'],qa={k:x['reference'] for k,x in q.items()}) for v,r,root,q in loaded],staticRelativeReferences=refs,actualBrowserRuntime='UNVERIFIED in this local packaging task')
 write(out/'PACKAGE_INDEX.json',jsonbytes(index));freeze_files(out)
 print(json.dumps(dict(package=str(out),index=pin(out/'PACKAGE_INDEX.json'),publicFiles=index['fileCount'],publicBytes=index['publicBytes'],state=index['state'],finalEligibility=eligibility,serverWrites=0),ensure_ascii=False))
 return index

def main():
 os.environ['TEMP']=str(RUNTIME/'temp');os.environ['TMP']=str(RUNTIME/'temp');os.environ['PYTHONPYCACHEPREFIX']=str(RUNTIME/'cache')
 ap=argparse.ArgumentParser(description=__doc__);ap.add_argument('action',choices=['import','build','verify','check-final']);ap.add_argument('input');args=ap.parse_args()
 if args.action=='import':import_material(args.input)
 elif args.action=='build':build(args.input)
 elif args.action=='check-final':d=read_json(args.input);print(json.dumps(final_eligibility(d,resolve_versions(d)),ensure_ascii=False))
 else:
  out=pathlib.Path(args.input).resolve();out.relative_to((RUNTIME/'builds').resolve());idx=read_json(out/'PACKAGE_INDEX.json');refs=verify_public(out/'public',idx['files']);print(json.dumps(dict(verified=True,files=idx['fileCount'],bytes=idx['publicBytes'],relativeReferences=len(refs),state=idx['state'],serverWrites=0)))
if __name__=='__main__':main()
