# Dark full candidate-01 — independent technical QA

30 октября 2026. **PARTIAL. Native/profile/controls/actor placement PASS;
side silhouette continuity не закрыта: P3 TQA-DARK-01-01 OPEN.** Full Art PASS
не выдаётся. Receiver02/03/04 dynamic cases, worker response-body SHA и строгое
пиксельное отсутствие осветления остаются UNVERIFIED по указанным ниже причинам.
Water review отдельно зафиксирован QA-коммитом383e7f3b и не изменён.

## Один frozen target

`dark-full-original-p4-candidate-01`, Dark02/trial-01, loopback4399.
Root `E:/R4D/perspective/p4-runtime/builder/transfer-water-dark/dark/candidates/dark-full-original-p4-candidate-01`.
Builder `ed62bae3f81d227494478c82b2279b5badcf715d`, Artist
`05ba43101a95fc1efcda5395d1394c27cb887f09`: LOCAL_HELD; source/art ancestry не
копировались/cherry-pick/push в QA. Проверен исходный P4 до новых вариантов.

| Identity | SHA-256 |
| --- | --- |
| artifact.json | `6dd25ecd75b5ade5fb67f8bb4d06dbddd2efc15676168b713ab951729a82eecf` |
| payload root,218 files | `281cd26408c36d6fb84e77093b808f0df2eb6115e1636ecac5ecb9bf6a49b00e` |
| artwork root | `25708990254f20ec6681dec9c3c2c23ef74c0853937ff78d02a5ecb13fdbfcff` |
| unchanged fixed app,C2 | `96ddc0443f311dd46f7f07b287171118608a583f0fd26416dbaa18ad8c8e84d0` |
| reused native bundle | `8843446996582eaccbd9ff63d3147d74b7eca9a614d8e0df16851d1d89d46f50` |
| Dark full-v01 art manifest | `d71bf97b07fb2571aa3ea0298900270775ae939b270753d3bfbe22097104a716` |
| new Dark shadow PNG | `f9a91c40b75c08e94f91d0948872050bb3d9bc56a3753cfc99ba21a0d9295887` |

Все218 disk/HTTP files и оба roots совпали **до и после** UI QA; artifact
disk/HTTP и FROZEN binding также совпали. PID38840/CommandLine соответствовал
`<frozen-root>/serve.mjs` при входе/выходе. Server/freeze/security/global
settings не менялись. Payload scan не нашёл raw TS/maps/sourceMappingURL/
sourcesContent или проверенных private-source paths.

Accepted P1 `4b47db04c7140ebf88f69b91faa0b790d46f22ec`; config
`14be2a023833d266d1e333bf582af5fd5885deb445698c10ebd846ef0cc080b2`,
manifest `3fab422bd1f74d477d1648620c97ad6d7b8b0a55a70a1102d6e6885def564d81`,
JPG `7ceff71bd0a871fecd725527dff5522450c8e75a74eb99c107b5d8624bf8fa3a`.
Config/manifest побайтно равны собственным Dark prep, обе art H точно равны P1.
Translation[33307,33912],drop[33349.528039973346,33109.09546312392]/angle90/
speed0,r16,tick5ms,quantize7,g980,maxspeed2000,angleDeviation2,bounceDeviation.02,
wallBounce1,lcg32. Counts12 pins/70 segments/4 buckets/1 drop; Water/Jungle
координаты и параметры новой texture не подставлялись.

## Exact native и binding

Одна собственная hidden IAB tab/run, затем закрыта. **94/94 independent native
observations exact** по full SimState,adapter fields,rngU32 и полному ordered
events, без epsilon. Ещё **6/6 supplied-only** observations ordinary1632614828
сравнены с frozen Builder checkpoints, а не с собственным native oracle.
Они не включены в94 независимых native PASS.

Raw DOM JSON сохранялся TEXT, JSON.parse выполнялся локально; browser object
transport rounding не использован. Key order/prototypes не выдаются за physics
различие. Reference: прежние own `dark/runs/seed-{0,1,2}.jsonl` из prep ecaed28…,
полученные своими27 verified cached TS actual core
`5a6fa03f1cdb3de88a2d9c7dbe795eb8e2a7f023`. Package tree
`008d16a80a26bb77d562a45218b01da09b0d9ff0` — declared pin, не вновь
восстановленный полный tree. Новых build/checkout/oracle/seed matrix нет.

| Scope | Result |
| --- | --- |
| Full pack | PASS28 objects:6bowl-base,6skull-base,6pillar,6block,4receiver;60object+6scene=66parts;69runtime PNG. Intentional remainder0 — coverage, не clean-quality PASS |
| Anchors/native IDs | PASS все28; pins/buckets точно config centers; segments-family mean4 accepted foot vertices. Max native delta7.28e-12 (render-anchor tolerance1e-9), source/local anchor tolerance1e-8. Новых colliders/height/per-face sorting нет |
| Source RGB/alpha | PASS все66 part PNG RGBA/dimensions;38 extracted body/rear/front/scene parts имеют0 RGB mismatches при alpha>0 с исходным JPG.28 shadows — declared estimates, не физическая lighting decomposition |
| Opaque interiors | PASS12 bowl/skull probes: black interiors alpha255,0 enclosed transparent holes; это обычные source bodies, не4native goals. Receiver rear/front у всех4 имеют0 shared nonzero-alpha pixels; cavity accepted-center rear alpha1 сохранён |
| PNG binding | PASS69 file/HTTP SHA + actual decoded dimensions/declared texture hashes. Worker-response body SHA UNVERIFIED: unsupported Target.setAutoAttach не повторялся; другого actor/transport нет |
| Body/placement | PASS всех100 observed poses: body PNGbf510895… прежний, center=Dark H(native),R=16/w,uniform scaleR/100,pivot[128,128.5],no uplift. Max placement delta0 |
| New shadow placement | PASS PNG alpha16 bounds[25,113,231,146],pivot[128,129.5],contentRadius[103,16.5];offsetR[-.95,.86],halfsizeR[1.55,.58],opacity.65. Один видимый source/flat actor,ground; premultiply-alpha-on-upload |
| Sorting/masks | PASS binding исходного ground→nativeY bodies/ball→scene-front→receiver-front→geometry. Runtime receiver-back при crop overlap реальноballY-.01. Consumer не назначает gameplay mask и не использует restoration-regions как clip; continuity-limit отдельно ниже |
| Layout | PASS actual1280×720,DPR1,canvas840×590,fit.3736979166666667,whole board574²,zoom1/noFollow/ArtON/GEOOFF. Whole scene/PartsOFF/ON,details zoom2 и original JPG осмотрены отдельно |
| Controls | PASS3 Play/Replay→посимвольный9→97→973→blur→Go. Play продолжался: start56,last digit133/136/136,blur213/216/216; draft973 сохранён, Go exact973 во всех3 |
| SAME file/invariants | PASS actual export973→manual974→import SAME bytes973; native manual974→повторный import973. Art/Geometry/Parts/diagnostic/source-native/zoom/follow сохраняют state/PRNG/events; native+N3→976 exact |
| Runtime/guards | PASS source Play835→IN_BUCKET888, native Play970→1026/pause1039/resume1099/pause1112 exact. Real Water checkpoint→«Несовместимая версия входа»,changed gravity→«Config изменён», state/events973 не изменились.0 console warn/error; post-end+1/+100 invariant |

## Actual corner/front/side/boundary

Все следующие states0/2 сопоставлены с own native, включая события и PRNG.
Проценты — bilinear **source-PNG alpha estimate**,.25source px,actual runtime
zIndex/container; не GPU readback. Native-camera frames исключены из метрики.

| Case | Actual visibility / verdict |
| --- | --- |
| Seed2 pillar02 corner,366–369 | PASS partial20.22/27.14/34.32/36.56%;edge01 event367→state368;normal+zoom368 |
| Seed2 pillar02 front,971–974 | PASS ball перед body,hidden0. Potential alpha12.43/18.12/19.84/15.34% не выдаётся за скрытие;edge03 event972→973 |
| Seed0 pillar04 side,839–842 | PASS partial839–841:7.87/8.96/8.26%;edge04 event840→841. **FAIL continuous-silhouette criterion**842:body за ball,hidden0 при potential2.17%;см.P3 |
| Seed0 left-3,459–462 | PASS actual foreground partial77.17/81.91/84.23/81.32%;event460→461;это silhouette, не crop bbox |
| Supplied ordinary1632614828 block02,890–892 | В actual Pixi полностью скрыт block02;normal+zoom891. Не partial proof. Full state/events совпадают с supplied checkpoints, independent native verdict этим seed не присвоен |

### TQA-DARK-01-01 — P3 OPEN: grouped depth flips before silhouette clears

Repro: этот freeze,seed0,Source/Art/PartsON,paused seek841→+1. Общий foot
nativeY pillar04 меняет порядок всего body/ball на842, хотя source PNG alpha
ещё пересекается с диском. Actual hidden estimate8.26%→0; на842 остаётся
2.174% potential overlap. Координаты/скорость/PRNG/events при этом exact native,
position jump не найден. Normal/zoom пары841/842 сохранены.

Это ограничение original grouped-nativeY, а не input/native/clock defect.
Непрерывное корректное перекрытие на этом переходе не объявляется PASS;
малый perceptual размер остатка на normal должен оценить VQA. Передать Lead;
если требуется исправление continuity, только отдельный разрешённый named
variant после сохранённого исходного результата. Freeze/physics/height не менять.

## Receivers по отдельности

Просмотрены целые ранее сохранённые0/1/2 trajectories,3587states, по actual
front PNG alpha; новых seeds/runs для поиска результата нет. Дополнительные
rim samples затем реально показаны в UI.

| Receiver | Approach/capture | Front-rim |
| --- | --- | --- |
| 01 | PASS seed0,885–888→IN_BUCKET888;seed1,882–884→IN_BUCKET884 | Шар целиком виден в opaque black cavity:rear potential1,но actual rear behind ball,hidden0;front alpha0. Это не partial |
| 01,другой существующий run | Seed2 подходит к57.3462 native distance at1736,но не capture;итогLOST1812 | **PASS partial observed** actual1744–1751,normal+zoom/PartsONOFF1747:same state;hidden1746/47/48=40.14/55.90/71.34%. Full front scan overlap1743–1781 |
| 02 | UNOBSERVED0/1/2;nearest302.0422 atseed0/888 | UNVERIFIED/unavailable в сохранённом наборе:front alpha16 overlap не найден |
| 03 | UNOBSERVED0/1/2;nearest602.7606 atseed0/888 | UNVERIFIED/unavailable в сохранённом наборе |
| 04 | UNOBSERVED0/1/2;nearest900.2709 atseed0/888 | UNVERIFIED/unavailable в сохранённом наборе |

Before1742 hidden0. After1782 **receiver-front overlap0, но near-platform-front
полностью закрывает шар (hidden1)**; это не возвращение полной видимости.
Near platform учитывается, а не игнорируется ради удобного rim PASS.
Наблюдение Artist о полном скрытии capture888 статическим rear не
воспроизвелось в consumer:runtime rear стоит позади ball. Полностью видимый
capture и полностью скрытый ordinary не заменяют partial1747. Sinking нет.

## Dark shadow и точность изображений

Новая PNG имеетRGB≤1 приalpha>0,205 alpha levels,max alpha205/255;
effective peak с multiplier.65≈.52255. В настоящем normal/zoom рендере след
тёмный и мягкий; непрозрачного чёрного диска/замены floor яркой olive текстурой
не наблюдалось. Ground/contact offsets и радиусы подтверждены отдельно,
общий Art/shadow-material PASS из этого не следует.

Actual screenshot ROI973 versus same normal baseline0 преимущественно
темнее:PartsON37/40samples,PartsOFF38/40. Остались3/1 слабых положительных
residual,максимум+1.72/+2.86 luma. Body-free subset их не устранил.
Затем установлено, что **CUA screenshots — lossy JPEG**, включая различия
в соседних compression blocks. Поэтому строгая zero-brightening радиометрия
по этим кадрам UNVERIFIED; residual не выдаётся за доказанный shadow defect
или игнорируемый PASS. Исходная texture PNG и математический blend/placement
проверены отдельно. GPU texture/worker readback не заявляется.

65 собственных raw screenshot bytes переименованы из ошибочного `.png` suffix
в `.jpg` **без перекодирования/изменения байтов**; mapping/SHA в
`SCREENSHOT_ENCODING.json`. Alpha-анализ использует настоящие source PNG,
поэтому JPEG ограничение не меняет расчёт silhouette/order.

## Provenance, артефакты и ресурсы

Independent outcomes сохранены:seed0 receiver01/888,seed1 receiver01/884,
seed2 LOST1812/finalX32824.3930072. Supplied ordinary1632614828 доведён в UI
доLOST2323/finalX33941.6877261;его сравнение только supplied. Новый Builder
3207937946/LOST2011 сохранён в freeze как supplied provenance.
Файл`01-new-ordinary-end` действительноACTIVE73/donefalse;он не outcome.
Настоящий`01b-new-ordinary-actual-end` — тот же seed,LOST2011. Отклонённый
Builder+N4000 не повторялся; история/всеLOST сохранены.

[RESULTS.json](evidence/full-01/RESULTS.json),[RAW_INDEX.json](evidence/full-01/RAW_INDEX.json).
Raw JSON/export/negative fixture/JPEG/analysis только own E:
`E:/R4D/perspective/p4-runtime/technical-qa/transfer-water-dark/dark/full-original-p4-candidate-01`.
Кадры`00-load-normal.jpg`,`01-parts-off-normal.jpg`,`09-side-841-zoom.jpg`/
`10-side-842-zoom.jpg`,`14-capture0-888-zoom.jpg`,`17-corner-368-zoom.jpg`,
`24-rim01-normal-on.jpg`/`25-rim01-normal-off.jpg`,`26-rim01-zoom-on.jpg`/
`27-rim01-zoom-off.jpg`,`58-ordinary-891-zoom.jpg`. Все66частей снимаются
PartsOFF;far architecture остаётся environment. В empty marble видны
тональные patch transitions; old-shadow cleanup/края/материалы/свет — VQA,
coverage и sourceRGB hashes не объявляются clean-quality PASS.

Перед browser RAM9.08/31.91GiB free,CPU6%/24logical,C13.73/D14.62/E9.10GiB.
После закрытия RAM9.34GiB free,CPU1%,C13.65/D14.61/E9.04GiB. Recorded final
Python analysis peak89.56MiB; sampled page heap used18.61/allocated44.97MiB;
decoded RGBA equivalent24.91MiB. Heap не total browser/GPU peak;aggregate
включает другиеslots. Свой малый download C→own E побайтно сверён, удалён
только созданный QA файл;global download settings не менялись. Ветка содержит
только own unheld QA metadata/tools,private TS/maps/source не публикуются.
