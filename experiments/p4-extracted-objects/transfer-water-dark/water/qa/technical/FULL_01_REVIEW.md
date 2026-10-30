# Full Water candidate-01 — independent technical QA

30 октября 2026. **PASS в проверенном full-pack technical scope.
TQA-WATER-01-01 CLOSED на этом новом app.** Новых технических дефектов в
проверенных cases не найдено. Это не Art PASS и не динамический PASS для
ненаблюдавшихся cases receiver01/04. Worker-response body SHA отдельно
UNVERIFIED; соответствующая unsupported операция не повторялась.

## Один неизменяемый target

`water-full-original-p4-candidate-01`, Water04/trial-02, loopback4398.
Root `E:/R4D/perspective/p4-runtime/builder/transfer-water-dark/water/candidates/water-full-original-p4-candidate-01`.
Builder `b6226979df39662e745e8636553019fae14fa19e`, Artist
`f973db5b20a99eb241a88c677b1b83ed307e1eaf`: LOCAL_HELD, не внесены в QA ancestry.

| Frozen identity | SHA-256 |
| --- | --- |
| artifact.json | `12c5f6a96a1c2c7571b13c303ffca0da4e84676916edd21fd1ddd87c39758a6c` |
| payload root, 206 files | `be302ce69e86ca2f0ca73b2ee7143440013ee0c6dd077bef0d78e5e18d72d59c` |
| artwork root | `51b0ee67d078ad7d6da71077f624b8e9de758af78400c6718fdf271789d63332` |
| app, C2 seek-draft fix | `96ddc0443f311dd46f7f07b287171118608a583f0fd26416dbaa18ad8c8e84d0` |
| unchanged native bundle | `8843446996582eaccbd9ff63d3147d74b7eca9a614d8e0df16851d1d89d46f50` |
| full-v01 art manifest | `f1cdda7a9cf4865e5ece6893eaa5f6c7214e2d29c4a0bafa52f276b6d4a34a23` |

Все 206 disk/HTTP files и оба roots проверены **до и после** actual UI QA.
Artifact disk/HTTP и FROZEN binding также совпали. PID18384/CommandLine
соответствовал `<frozen-root>/serve.mjs` при входе/выходе; QA не менял server,
freeze, source/art bytes, global/security settings. В payload нет raw TS/maps,
sourceMappingURL/sourcesContent или проверенных private-source paths.

Accepted P1 `4b47db04c7140ebf88f69b91faa0b790d46f22ec`, canon
`b1382dd4c230815a019e52e2ec4617ef705661d5`; config
`9048b28af2923c93d8be772367beeb828f1e4513a6298af1c803379f77d3e50c`,
P1 manifest `48c4fef26fd8c94f06c278851222ef285edda54ac14e53da8908f4ee663dc420`,
JPG `8da65c76c110b6ba7cefe113564fe12feed4428e84e84835f033e7da31d3b80d`.
Config/manifest побайтно равны собственным prep inputs; обе art H равны P1.
Только trial-02; trial-01 historical startup FAIL не пересматривался.

## Exact native и full-pack integration

Одна собственная hidden IAB tab/run, закрыта. **160/160 observations PASS**:
full SimState, adapter fields, rngU32 и полный упорядоченный массив событий
сравнены без epsilon. Raw DOM JSON прочитан как TEXT и JSON.parse выполнен
локально; object-transport rounding не применялся. Object key order/prototypes
не заменяют физическое сравнение. Сверка с уже сохранёнными
`transfer-water-dark/water/runs/seed-{0,1,2}.jsonl`, не с Builder selfcheck.

Reference prep ранее выполнен своими 27 проверенными cached actual core TS
`5a6fa03f1cdb3de88a2d9c7dbe795eb8e2a7f023`. Declared package tree
`008d16a80a26bb77d562a45218b01da09b0d9ff0` не выдаётся за вновь восстановленный
полный tree. Новых build/checkout/oracle/seed matrix нет.

| Scope | Результат |
| --- | --- |
| Full coverage binding | PASS 25 objects: 8 arches,6 frogs,7 pillars,4 receivers;70 object parts+5 scene=75;78 runtime textures. UI FULL PACK и scope соответствуют; intentional remainder0 — объявление покрытия, не качества |
| Profile | PASS прежние counts6 pins/106 segments/4 buckets/1 drop;translation[33256,34124];drop[33192.751665295094,33184.49424667716]/angle90/speed0;r16/tick5ms/quantize7/g980/maxspeed2000/angleDeviation2/bounceDeviation.02/wallBounce1/lcg32 |
| All-family anchors | PASS все25: pins/buckets точно config center; arches mean8 и pillars mean4 исходных segment vertices. Max native anchor delta7.28e-12 (порог1e-9), source/local anchor check1e-8. Это только визуальные anchors; новых pin/lintel/shore/height colliders нет |
| Original RGB/alpha | PASS все75 part PNG RGBA и размеры;50 extracted body/rear/front/scene PNG имеют0 RGB mismatches при alpha>0 с исходным JPG, включая partial edges. Остальные25 ground shadows — declared estimates; lighting quality не сертифицируется |
| Receivers rear/front | PASS 0 shared nonzero-alpha pixels у каждой пары; rear alpha0 в принятом source center каждой чаши. Нет opaque water rectangle или второго дублирующего rear. Water остаётся ground; размеры/связи сверены |
| Asset hashes | PASS всех78 file/HTTP SHA и decoded dimensions/declared UI texture hashes. **Worker response-body SHA UNVERIFIED**, root CDP не давал их ранее; unsupported Target.setAutoAttach не повторялся, альтернативного actor/transport нет |
| Ball | PASS всех160 poses: P=Water H(native position),R=16/w,scaleR/100,pivot[128,128.5],no uplift; max placement delta0. Реальные alpha16 contentBounds/contentRadius подтверждены PNG |
| Shadow | PASS один видимый source/flat actor, ground;offsetR[-.95,.86],halfSizeR[1.55,.58],opacity.65,pivot[128,128]. Premultiply-alpha-on-upload; source/flat не видны одновременно |
| Sorting/masks | PASS исходный ground→nativeY bodies/ball (включая прежний receiver-back)→scene-front→receiver-front→geometry. У arch bodies общий nativeY. Consumer span не назначает gameplay mask и не использует restoration-regions; это provenance, не clip |
| Layout | PASS actual1280×720,DPR1,canvas840×590,fit.3736979166666667,board574²,zoom1/noFollow/ArtON/GEOOFF; whole scene и PartsOFF/ON сохранены. Zoom2/follow details отдельно |
| Controls/invariants | PASS source/native Art/Geometry/Parts/diagnostic/zoom/follow сохраняют full state/PRNG/events; actual +1,+N,paused seek,Replay,Play/Pause/Resume; native1000→1060/pause1073/resume1133/pause1153 exact |
| SAME file | PASS actual export1009→manual1010→import SAME bytes1009; native manual1010→повторный импорт1009. Config меняет только rng.seed; bindings не ослаблены |
| Negative import | PASS wrong board→«Несовместимая версия входа», modified gravity→«Config изменён»; состояние/events tick1153 остались прежними в обоих случаях. Negative fixtures только в own E |
| Runtime | PASS0 captured warn/error за всю эту вкладку; native/rAF продвигается и заканчивается. Post-LOST +1 и post-capture +100 оставляют state/events неизменными, sinking не добавлен |

## TQA-WATER-01-01 — CLOSED для полного candidate-01

Три независимых повтора actual Play/Replay → посимвольный ввод
`1→10→100→1009` → blur через Geometry → Go. Draft сохраняется при продолжающемся
Play и не замораживает native. Результат во всех трёх — exact1009.

| Повтор | Play snapshot tick | Последняя цифра tick | Blur tick / draft | Go tick |
| --- | ---: | ---: | --- | ---: |
| 1 | 60 | 223 | 306 /1009 | 1009 |
| 2 | 56 | 173 | 253 /1009 | 1009 |
| 3 | 60 | 173 | 253 /1009 | 1009 |

Все соответствующие native states/events exact. Paused seek/SAME file/manual
1010/Resume и guards также пройдены. Исторический C1 FAIL в
[STARTER_01_REVIEW.md](STARTER_01_REVIEW.md) сохранён; C1 не исправлялся и не
переименовывался. Закрытие относится к новому app96ddc044… в этом freeze.

## Actual motion и receivers по отдельности

Seed0 frog01 states104–110, event105→state106 и arch04 states696–700,
right-foot event697→state698 сохранены. Seed1 arch07 каждый tick1005–1021,
foot events1006/1012/1018→states1007/1013/1019: exact. Частичное перекрытие
ворот actual alpha подтверждено normal кадрами; общий depth transition прежний.
Это не динамический PASS всех остальных gates только из факта загрузки.

Для недостающих rim cases просмотрены **целые уже сохранённые** ordinary0/1/2
траектории, с source projection и действительными front alpha. Это выбор
существующих поз, не новый run/seed hunt. Затем каждый найденный дополнительный
case проверен в реальном UI последовательными +1 ticks и native comparison.

| Receiver | Approach / capture | Front-rim / foreground silhouette |
| --- | --- | --- |
| 01 | UNOBSERVED в0/1/2; ближайший native center244.5907 at seed2/t1236, r31.2961 | UNVERIFIED: ни одного alpha16 overlap в полных0/1/2; unavailable в этом сохранённом наборе, это не физическая невозможность |
| 02 | PASS seed2 states1273/1274→IN_BUCKET1275, exact. В capture окне front alpha0; шар в воде полностью виден | **PASS observed отдельно на seed0/LOST**: каждый actual tick1247–1282; front overlap1248–1281, на1253 верхняя часть sphere над near rim (~46.45% alpha-weighted hidden). На1277 выход под внешней стенкой (~49.59%); paired PartsON/OFF и native view exact. Не смешивать этот LOST-case с capture seed2 |
| 03 | Observed seed1 states1113–1117, min center distance60.9035 at1115>r31.1366; capture НЕ наблюдался. Full result LOST1196 | **PASS partial observed**: каждый actual tick1118–1146; overlap1120–1145. На1124/25/26 front fractions37.49/50.19/63.19%; normal+zoom1125 показывает верхнюю часть шара над ободом; paired PartsON/OFF same state. После1146 overlap0 |
| 04 | UNOBSERVED в0/1/2; ближайший center306.0056 at seed1/t1135, r32.9799 | UNVERIFIED: alpha16 overlap отсутствует во всём сохранённом0/1/2 |

Alpha fractions — независимый bilinear source-plane estimate с шагом .25px
на actual UI poses (.5px только предварительный whole-trajectory scan),
**не GPU readback**. Crop bbox не считается overlap. В обеих подтверждённых
rim-сценах видимость проверена текущими actual Pixi кадрами и PartsON/OFF.

Native full outcomes сохранены: seed0 LOST1326/finalX32866.4825074,
seed1 LOST1196/finalX33728.1429454,seed2 IN_BUCKET receiver02/1275. Отдельно
frozen Builder provenance3009470305/LOST1429 и2771772266/LOST1100 оставлен
как supplied evidence; независимый native PASS этим двум дополнительным seeds
не присваивается. Новая удобная траектория/после-native sinking не создавались.

## Доказательства, качество и ресурсы

[RESULTS.json](evidence/full-01/RESULTS.json), [RAW_INDEX.json](evidence/full-01/RAW_INDEX.json)
содержат small metadata/raw hashes. Raw JSON/export/screenshots/negative fixtures/
аналитика только в own E:
`E:/R4D/perspective/p4-runtime/technical-qa/transfer-water-dark/water/full-original-p4-candidate-01`.
Кадры: `00-load-normal.png`, `01-full-parts-off-normal.png`,
`12-rim03-on-normal.png`/`13-rim03-off-normal.png`, `14-rim03-on-zoom.png`,
`43-rim02-normal-1277.png`, `44-rim02-zoom-on-1277.png`/`45-rim02-zoom-off-1277.png`,
`48-rim02-enter-side-zoom.png`. Original JPG осмотрен отдельно, SHA выше.
QA tools: `qa-tools/review-water-full-01.mjs`, `qa-tools/full-water-alpha-analysis.py`.

В whole-view/PartsOFF тела/структурные receiver walls удалены; environmental
low banks/far architecture/channels остаются согласно scope. Видны круглые
тональные переходы восстановленных floor patches и более светлая near-water
strip. Это фактическая передача на VQA, **не clean-quality/Art PASS**.
Согласованность shadows/materials/краёв/света не объявлена доказанной по одним
hash/RGB/coverage checks. Новый sorting/height вариант не создавался.

До browser: RAM10.12/31.91GiB free,CPU11%/24logical,C13.83/D14.62/E9.26GiB.
После закрытия: RAM9.13GiB free,CPU8%,C13.79/D14.62/E9.17GiB. Aggregate включает
другие slots. Собственный Python peak working set82.07MiB; sampled page JS heap
peak used13.58MiB/allocated20.97MiB,decoded RGBA equivalent28.11MiB.
JS heap не выдаётся за total browser/GPU peak. Только одна своя tab одновременно,
shared server не остановлен. Малый actual download побайтно скопирован C→own E,
затем удалён только созданный QA файл; global download settings не менялись.
Private TS/maps и held product/source ancestry не публикуются. Dark — отдельный
будущий target; полного Dark здесь не ожидали и не проверяли.
