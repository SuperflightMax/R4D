# Q5A: независимый Builder integration review арта attempt03

25 октября 2026 года, Europe/Kyiv. Builder `builder-r4d-q5a-01`.

**Вердикт: ART_INTEGRATION_PASS.** Кандидат attempt03 пригоден как технический вход следующей production assembly на exact construction v4. Блокеры B1/B2 прежнего Builder review не воспроизводятся. Авторские вырезы кистей сохраняются при отдельной передаче двух silhouette-alpha. Это приёмка статической регистрации/переноса, а не художественная приёмка AR1–AR3, качество движения или разрешение начинать demo в этом ходе. Следующий производственный шаг определяет CTO.

## Проверенная версия и материалы

| Файл | Фактический SHA-256 |
|---|---|
| construction/construction.json | `7d06ea4636b49c718dad5e9d9f07000d09fa7e5cf105ec325abb84742bfdba26` |
| art/package.json | `a18bf91c3b00bd29a9246cb206d48d40c454a421136f7d88e5d35d52dc8013b0` |
| art/validation.json | `cc64f60aaa49fc2f9e9282130eef697402a752a346ecae1c79445a7d07066b1e` |
| art/attempts/03/package.json | `f7d1670352948cb5f868c5042b191adbe1bc80dcfb8015f874f50a7baf9a5e2d` |
| art/attempts/03/validation.json | `c954f0aaa1f1d63132fb73e26ce5b20a71e3beee2a709f763436d10f256db5b2` |
| art/attempts/03/independent-checks.json | `59632acccf5ba027ab4ee71667cc2f05f99752d57425e0988d69890e14365400` |
| art/attempts/03/reproduction.json | `c305649da2bbba2ab21391be0de31a0c584145eb97ae313388acfab2fc70b3b1` |

Root package/validation побайтно равны candidate-package/candidate-validation. Локальные package/validation являются отдельными результатами генератора attempt03 и закономерно имеют другие хеши: candidate добавляет ссылки на независимую проверку/воспроизведение. Сверены все 7 evidence SHA, 84 output SHA в root validation, 4 source SHA и scripts SHA из reproduction. Полные 15 индивидуальных PNG SHA остаются в [каноническом package](art/package.json), не дублируются новым манифестом.

Прочитаны CONSTRUCTION.md, ART.md, прежний ART_BUILDER_REVIEW.md, root и локальные package/validation, ART_CORRECTIONS.md, reproduction.json, independent-checks.json, prepare_attempt03.py, validate_attempt03.py и finalize_attempt03.py; просмотрен актуальный договор integration_v4.py. Finalize как программа не запускался. При завершающем чтении HEAD/origin/main уже `03644152f985ecf225c06ae748100534fbe106ab`; checkout/fetch/merge/commit/push в этом review не выполнялись. Exact candidate определяется тремя SHA выше, а не старым gate_commit d3bdf8f из provenance.

## Независимо подтверждённый результат

| Проверка | Получено |
|---|---|
| Поверхности/текстуры | 15/15 ID, порядок, пути, SHA, RGBA 1024², точный sRGB ICC |
| Bind registration и alpha | 15/15: общий source=(512+2x,900-2y), alpha равна v4 оболочке с отдельным вычитанием authored hand alpha |
| Pivots | 15/15 равны construction source pivots и преобразованным bind landmarks; индивидуального центрирования нет |
| Слои | 15 материалов, прежние 16 draw operations, near-arm root/limb и видимость кожи ниже подола сохранены |
| Инверсии explicit UV → posed face | **0** во всех 19 позах |
| Строгие самопересечения контуров/панелей | **0**, включая silhouette_regions внутреннего сопряжения |
| Intended zero fold faces | **28** в данных, все в объявленных fold-зонах; renderer их пропускает |
| Internal alpha<128 внутри MinFilter(5) | **0** во всех 19 позах при 1× и 2× |
| Opaque alpha>=128 вне v4+authored силуэта | **0** во всех 19 позах при 1× и 2× |
| Изолированные кисти | **76/76** (19×2 кисти×2 масштаба): 0 внутренних дефицитов / 0 непрозрачных выходов за authored-контур |
| Реальное вычитание alpha | **38/38** пара поза/кисть при 1× имеет уменьшенное покрытие; повторного заполнения нет |
| Композиция светлого/тёмного PNG | **0** несовпадающих пикселей для всех 38 сохранённых фонов 1× |
| Воспроизведение | **86/86** существующих файлов повторены побайтно в памяти |
| Прежние защищённые материалы | **162/162**; три разрешённых entrypoint обновления сверяются через их архивы attempt02 |

Проверка геометрии выполнена непосредственно по JSON: signed UV/posed area, постоянство topology/UV, тест противоположных cross для непоследовательных рёбер, отдельный учёт нулевых fold faces. Это повторный расчёт, не чтение готового поля geometry как доказательства.

Для alpha выполнен дополнительный собственный расчёт сверх validate_attempt03.py. Оболочка построена прямо из JSON outlines/patches с root/limb/hem, без вызова renderer outer_mask/accepted_envelope. Авторская hand alpha перенесена обратным affine-преобразованием по трём неколлинеарным posed/source вершинам. Маски материалов объединены на supersampling ×2, затем BOX и threshold>=128/MinFilter(5). Сравнены сохранённые RGBA 1× и заново рассчитанные RGBA 2× в памяти. **Кисти не исключались из full-body core при 2×**: законные вырезы учтены в самой reference-оболочке. Во всех 38 полных случаях получены 0/0. Exact код ниже.

Осталось **11 пикселей частичной AA-alpha<255** внутри target core, все alpha>=128. Это не внутренняя прозрачная щель и не обещание полной непрозрачности. Ноль строгих пересечений не доказывает отсутствие касаний, коллинеарных контактов или дефектов произвольной непрерывной анимации.

Цветовые контрольные пробы validate: max-channel delta запястий 0; тканевых join — максимум 0.718740/255. Эти точки не доказывают отсутствие любых живописных границ.

## Технический просмотр и договор будущей сборки

Просмотрены все четыре полных light/dark листа 1×/2×, отдельный bind и крупные low_deep, jump_landing, range_compression на светлом/тёмном фоне. Большие листы инструмент показывал уменьшенными; локальные 1280×960 виды просмотрены отдельно. По статике нет отрыва кистей, прямоугольного заполнения кончиков, чёрных прозрачных отверстий или возврата механических накладок. Тканевый внутренний стык стал спокойнее; на сильных сгибах остаются видимые особенности света/сжатия и небольшая выразительность пальцев. Их художественную достаточность оценивает Concept Artist; этот review не закрывает AR1–AR3 числовым PASS.

При сборке нужно читать `file` и `silhouette_alpha_file` относительно `art/`, передавать две L-маски отдельно в `render(..., silhouette_alpha=authors)`, сохранять explicit triangles/UV, per-fragment outer clipping, прежние pivots и 16 операций. Обычная загрузка RGB без authors не воспроизводит кандидат. Проверенный статический рецепт — prepare_attempt03.build(); сам renderer не превращается этим review в готовый PixiJS motion runtime.

Прежний ART_BUILDER_REVIEW.md относится к v2/attempt02 и не редактируется: его 45 инверсий и 139 дефицитных пикселей были реальными для того входа. В v4/attempt03 они не найдены. Необходимости менять текущие текстуры, конструкцию или registration для начала следующего согласованного этапа по интеграционным причинам не обнаружено. Художественное решение и старт assembly остаются CTO; demo/motion сейчас не запускались.

## Выполненные команды

Из `D:\dev\R4D`, Python 3.10.6, Pillow 12.1.1, numpy 2.2.6, без установки зависимостей и записи pyc:

```powershell
python -B experiments/q5a-construction-first/construction/build_package.py --check
python -B experiments/q5a-construction-first/art/attempts/03/prepare_attempt03.py --check
python -B experiments/q5a-construction-first/art/attempts/03/validate_attempt03.py
```

Все три — exit 0 / PASS. Первая проверила 10 construction outputs и A1–A3/C1–C2/sweeps; вторая 86 byte outputs,15 surfaces,19 poses,38 hand alpha cases; третья 76 hand/scale cases и защищённые материалы. Режим --save не использовался. Старые main-проверки technical/v3/v4 с root-v2 manifest не запускались для нового кандидата: разрешённые entrypoints теперь03, архивы02 сохранены.

Ниже — точный дополнительный read-only вызов Builder, получивший `BUILDER_INDEPENDENT_PASS`. Он ничего не сохраняет; печатает метрики всех 38 полных случаев и проверяет 7 evidence/84 output SHA.

```powershell
@'
import sys,json,hashlib,io
from pathlib import Path
import numpy as np
from PIL import Image,ImageDraw,ImageFilter
root=Path('experiments/q5a-construction-first');art=root/'art';attempt=art/'attempts/03'
sys.path.insert(0,str((art/'scripts').resolve()))
import integration_v4 as r
sha=lambda p:hashlib.sha256(p.read_bytes()).hexdigest()
expected={root/'construction/construction.json':'7d06ea4636b49c718dad5e9d9f07000d09fa7e5cf105ec325abb84742bfdba26',art/'package.json':'a18bf91c3b00bd29a9246cb206d48d40c454a421136f7d88e5d35d52dc8013b0',art/'validation.json':'cc64f60aaa49fc2f9e9282130eef697402a752a346ecae1c79445a7d07066b1e'}
for p,h in expected.items():assert sha(p)==h
data=json.loads((root/'construction/construction.json').read_bytes());package=json.loads((art/'package.json').read_bytes());validation=json.loads((art/'validation.json').read_bytes())
assert (art/'package.json').read_bytes()==(attempt/'candidate-package.json').read_bytes()
assert (art/'validation.json').read_bytes()==(attempt/'candidate-validation.json').read_bytes()
assert data==r.DATA and package['construction_sha256']==validation['construction_sha256']==expected[root/'construction/construction.json']
assert [s['id'] for s in package['surfaces']]==data['draw_order']
surfaces={s['id']:s for s in data['surfaces']};planes={};authors={}
def polygons(g,op=None):
 if 'patches' in g:return [p['outline'] for p in g['patches']]
 if op and 'arm_skin' in op['surface']:
  if op['fragment']=='root':return [g['root_outline']]
  if op['fragment']=='limb':return [g['limb_outline'],g['silhouette_regions'][1]]
 if op and 'leg_skin' in op['surface']:return [g['visible_outline'],g['silhouette_regions'][1]]
 return g.get('silhouette_regions',[g['outline']])
icc=(art/'reference/srgb.icc').read_bytes()
for s in package['surfaces']:
 name=s['id'];im=Image.open(art/s['file'])
 assert im.mode=='RGBA' and im.size==(1024,1024) and im.info['icc_profile']==icc
 assert sha(art/s['file'])==s['sha256'] and s['pivot_source_px']==surfaces[name]['pivot_source_px']
 assert s['pivot_source_px']==[512+2*surfaces[name]['pivot_bind'][0],900-2*surfaces[name]['pivot_bind'][1]]
 mask=Image.new('L',(4096,4096));pen=ImageDraw.Draw(mask)
 for poly in polygons(surfaces[name]['geometry_bind']):pen.polygon([(4*(512+2*x),4*(900-2*y)) for x,y in poly],fill=255)
 mask=np.asarray(mask.resize((1024,1024),Image.Resampling.LANCZOS))
 if s['silhouette_alpha_file']:
  author=Image.open(art/s['silhouette_alpha_file']);assert author.mode=='L' and author.size==(1024,1024)
  authors[name]=np.asarray(author);mask=np.minimum(mask,authors[name])
 assert np.array_equal(np.asarray(im)[:,:,3],mask)
 planes[name]=r.material_rgb(im)
assert set(authors)=={'near_hand','far_hand'}
for field in ('evidence_sha256','outputs_sha256'):
 for name,h in validation[field].items():assert sha(art/name)==h,(field,name)
for s in validation['generated_sources']:assert sha(art/s['file'])==s['sha256']
repro=json.loads((attempt/'reproduction.json').read_bytes())
for name,h in repro['scripts_sha256'].items():assert sha(attempt/name)==h
for name,key in [('package.json','package_sha256'),('validation.json','validation_sha256'),('independent-checks.json','independent_checks_sha256')]:assert sha(attempt/name)==repro[key]
def cross(a,b,c):return (b[0]-a[0])*(c[1]-a[1])-(b[1]-a[1])*(c[0]-a[0])
flips=zeros=intersections=0
for p in data['poses']:
 for name,g in p['surfaces'].items():
  bind=data['poses'][0]['surfaces'][name]
  assert g['triangles']==bind['triangles'] and g['uv']==bind['uv']
  for panel in g.get('patches',[g]):
   for tri in panel['triangles']:
    sa=cross(*[panel['uv'][i] for i in tri]);pa=cross(*[panel['vertices'][i] for i in tri])
    flips+=int(sa*pa>1e-10);zeros+=int(abs(pa)<1e-7)
    if abs(pa)<1e-7:assert name in data['fold_contracts'] and set(tri)<=set(data['fold_contracts'][name]['low_contrast_vertex_ids'])
  for poly in polygons(g):
   n=len(poly)
   for i in range(n):
    for j in range(i+2,n):
     if (j+1)%n==i:continue
     a,b,c,d=poly[i],poly[(i+1)%n],poly[j],poly[(j+1)%n]
     intersections+=int(cross(a,b,c)*cross(a,b,d)<-1e-7 and cross(c,d,a)*cross(c,d,b)<-1e-7)
assert flips==intersections==0 and zeros==28,(flips,intersections,zeros)
def independent_envelope(p,size,scale,origin):
 ss=2;union=np.zeros((size[1]*ss,size[0]*ss),dtype=np.uint8)
 for op in data['draw_operations']:
  name=op['surface'];g=p['surfaces'][name];mask=Image.new('L',(size[0]*ss,size[1]*ss));pen=ImageDraw.Draw(mask)
  for poly in polygons(g,op):pen.polygon([((origin[0]+scale*x)*ss,(origin[1]-scale*y)*ss) for x,y in poly],fill=255)
  coverage=np.asarray(mask).copy()
  if name in authors:
   ids=[0,8,28];posed=np.asarray(g['vertices'])[ids];uv=np.asarray(g['uv'])[ids]*1024
   matrix=np.linalg.solve(np.column_stack((posed,np.ones(3))),uv)
   yy,xx=np.where(coverage>0)
   world=np.column_stack((((xx+.5)/ss-origin[0])/scale,(origin[1]-(yy+.5)/ss)/scale,np.ones(len(xx))))
   source=world@matrix-.5
   coverage[yy,xx]=authors[name][np.clip(np.rint(source[:,1]).astype(int),0,1023),np.clip(np.rint(source[:,0]).astype(int),0,1023)]
  union=np.maximum(union,coverage)
 return np.asarray(Image.fromarray(union).resize(size,Image.Resampling.BOX))
rows=[];composition_errors=0;partial=0
for p in data['poses']:
 for label,size,scale,origin in [('1x',(960,640),1,(480,560)),('2x',(1920,1280),2,(960,1120))]:
  if label=='1x':image=Image.open(attempt/'preview/rgba'/(p['id']+'.png')).convert('RGBA')
  else:image=r.render(p,planes,size,scale,origin,silhouette_alpha=authors)
  actual=np.asarray(image)[:,:,3];envelope=independent_envelope(p,size,scale,origin)
  core=np.asarray(Image.fromarray(envelope).point(lambda x:255 if x>=128 else 0).filter(ImageFilter.MinFilter(5)))==255
  gaps=int((core&(actual<128)).sum());outside=int(((actual>=128)&(envelope<128)).sum())
  assert gaps==outside==0,(p['id'],label,gaps,outside)
  if label=='1x':
   partial+=int((core&(actual<255)).sum())
   for bg,color in [('light','#edf0f2'),('dark','#20242c')]:
    composite=Image.new('RGBA',size,color);composite.alpha_composite(image)
    saved=Image.open(attempt/'preview'/bg/(p['id']+'.png')).convert('RGB')
    errors=int(np.any(np.asarray(composite.convert('RGB'))!=np.asarray(saved),axis=2).sum());composition_errors+=errors;assert errors==0
  rows.append({'pose':p['id'],'scale':label,'internal_alpha_deficiency':gaps,'opaque_outside_authored_v4':outside})
print(json.dumps({'result':'BUILDER_INDEPENDENT_PASS','exact_sha256':{str(p):h for p,h in expected.items()},'textures':15,'author_masks':2,'draw_operations':len(data['draw_operations']),'inversions':flips,'strict_self_intersections':intersections,'zero_fold_faces':zeros,'full_body_including_authored_hands':rows,'background_composition_error_pixels':composition_errors,'partial_AA_inside_core_1x':partial,'evidence_hashes':len(validation['evidence_sha256']),'output_hashes':len(validation['outputs_sha256'])},indent=2))

'@ | python -B -
```

## Сохранность и границы хода

До запуска проверок сняты SHA 479 существующих файлов внутри Q5A, work/ и .playwright-cli/. После всех расчётов перед записью review: **479/479 неизменны, новых файлов нет**. Создан только этот ART_BUILDER_REREVIEW_ATTEMPT03.md; кандидат, конструкции, scripts, state, исходники, прежние reviews и чужие dirty/untracked не редактировались. Новые сотрудники/чаты, demo/server/browser, motion, Technical/Visual QA, Q4A/Q2A и commit/push не запускались.

