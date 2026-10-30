# Water starter candidate-01 — early technical review

30 октября 2026. **PARTIAL: native/state и ограниченный render integration PASS;
один P3 UI FAIL; receiver-front occlusion UNVERIFIED. Полный Technical/Art PASS
Water/Dark не выдаётся.** Проверен исходный метод P4 до любых новых вариантов.

## Неизменяемая цель

`water-starter-original-p4-candidate-01`, board04/trial-02,
`http://127.0.0.1:4395/`. Builder source
`b646d3fe948d2c7e80f0a4a90fed4d318f56f654` — LOCAL_HELD, не внесён в ancestry QA.
Artist `0d7ac6e6934d30a8f149124b1129036287d8baa4`, `p4-water-starter-v01`.

| Binding | SHA-256 |
| --- | --- |
| artifact.json | `ee363d7e8dcaf555fcc06ebe1d42e695834ff003b9d50005b03ef1ada557aaee` |
| Payload root, 79 files | `dee951ddd007ff3313176de1ab9d8dcad7268780beb9987fd4d009b9ff6bc1e9` |
| Artwork root | `7ea0e79e36a0779d1a800af8127295f6d721cb65d8a4314f155a6783bb367bed` |
| app.js | `9f0780a4f5039dc91c4c5a9c69eb040dc4df099ccdcc439e5910fd954af409b6` |
| Native bundle reused | `8843446996582eaccbd9ff63d3147d74b7eca9a614d8e0df16851d1d89d46f50` |
| Art manifest | `9b67bdec90fe37f24e5bc182064331d96e847316a19b832e581a740dcd4095f6` |

Все 79 disk/HTTP файлов совпали при входе; roots пересчитаны. В конце повторно
сверены все disk files и HTTP artifact. PID8572/CommandLine соответствует
`<frozen-root>/serve.mjs`; QA его не менял. Scan публичного payload не нашёл
raw TS/maps/sourceMappingURL/sourcesContent или private source paths.

Accepted P1 `4b47db04c7140ebf88f69b91faa0b790d46f22ec`; canon
`b1382dd4c230815a019e52e2ec4617ef705661d5`. Config
`9048b28af2923c93d8be772367beeb828f1e4513a6298af1c803379f77d3e50c`,
P1 manifest `48c4fef26fd8c94f06c278851222ef285edda54ac14e53da8908f4ee663dc420`,
source `8da65c76c110b6ba7cefe113564fe12feed4428e84e84835f033e7da31d3b80d`.
Config/manifest побайтно равны собственным принятым prep inputs; обе матрицы
арта точно равны P1. Translation [33256,34124]. Counts 6 pins/106 segments/
4 buckets/1 drop. Drop [33192.751665295094,33184.49424667716], angle90,
speed0; r16, tick5ms, quantize7, gravity980/maxSpeed2000,
angleDeviation2/bounceDeviation.02/wallBounce1, lcg32 — прежние.

## Независимая проверка

Одна одновременно открытая собственная hidden IAB tab; затем отдельная
короткая контрольная tab для DPR/layout. Обе закрыты; чужие QA runs не использованы.
Сравнение с уже сохранёнными prep `runs/seed-{0,1,2}.jsonl`, рассчитанными
собственными 27 ранее проверенными cached TS файлами actual core
`5a6fa03f1cdb3de88a2d9c7dbe795eb8e2a7f023`. Declared package tree
`008d16a80a26bb77d562a45218b01da09b0d9ff0` не выдаётся за вновь восстановленный
полный tree. Новых checkout/build/oracle/seed matrix нет.

**67/67 observations: exact full SimState + adapter fields, rngU32 и полный
упорядоченный массив событий PASS, без epsilon.** DOM JSON сохранён строками,
затем распарсен локально; нет округления чисел через browser object transport.
Key order/prototypes не считаются физическим отличием. Только render/anchor
арифметика допускает 1e-10/1e-9; фактический max actor-placement delta = 0.

| Case | Результат и граница |
| --- | --- |
| Load/profile | PASS: 3 objects, 7 parts, 10 decoded textures; UI явно PARTIAL и перечисляет baked remainder |
| PNG binding | PASS disk/HTTP SHA всех файлов, 10 dimensions/roles/declared texture SHA совпадают. Hash именно worker response body — UNVERIFIED: root CDP не показывает PNG; `Target.setAutoAttach` API не поддерживает. Операция остановлена, другого actor/workaround нет |
| Original cutouts/alpha | PASS: 5 extracted body/front PNG, 0 RGB mismatches при alpha>0 с исходным JPG, включая полупрозрачные края; RGBA/straight, Pixi actor alphaMode premultiply-alpha-on-upload |
| Arch anchor/colliders | PASS: mean восьми исходных foot vertices = [33022.48723355064,34755.12349268705]; не pin. Frog/receiver anchors точно равны config centers. Нет нового lintel/shore/height collider |
| Original depth | PASS bounded: ground → common-nativeY body/ball → scene-front → receiver-front → geometry; 3 arch bodies имеют общий nativeY34755.12349268705 |
| Ball/shadow | PASS: center=H(native), R=16/w, bodyScale=R/100, pivot[128,128.5], no uplift. Единственный видимый source/flat actor, shadow offsetR[-.95,.86], halfSizeR[1.55,.58], opacity.65, ground layer |
| Controls | PASS +1 (1009→1010), +N3→1013, paused exact seek, Replay restart, source/native Play/Pause/Resume, post-end steps invariant. **FAIL exact-tick entry during Play**, ниже |
| Same file | PASS actual UI export seed1/t1009 → E copy → import SAME bytes; state/events exact; Replay + paused seek1009 exact. Config меняет только rng.seed |
| View invariants | PASS source/native, Art, Geometry, Parts, zoom, follow, diagnostic contour не меняют full state/PRNG/events. Normal viewport1280×720, DPR1, canvas840×590, fit .3736979166666667: board574px. Zoom2+follow отдельно |
| Arch before/on/after | PASS bounded: каждый live tick1005–1021 сохранён и exact native. Entry1008, inside1009–1020, exit1021. Foot events1006/1012/1018 → post-states1007/1013/1019 |
| Arch actual silhouette | PASS partial occlusion, не crop bbox: alpha-weighted hidden fraction ~74.27%/34.38%/17.80%/2.41% at1005/1008/1009/1013. Opening source514,953 alpha0 во всех 3 bodies. При ordering transition1014→1015 overlap alpha≥16 отсутствует; доказательства нового front-crossing при пересечении здесь нет |
| Receiver02 | PASS native approach1273/1274 → capture1275, both views; +100 после done неизменны, нет sinking. **Front-rim UNVERIFIED**: реальный front alpha не пересекает ball silhouette во всех трёх позах, хотя crop bbox пересекается; шар полностью виден в воде |
| Ordinary outcomes | PASS seed0 LOST1326/finalX32866.4825074 (UI +3200 from0); seed1 LOST1196/finalX33728.1429454 (source Play до конца); seed2 IN_BUCKET receiver02/1275. Все исходы сохранены, lucky-seed search нет |
| Runtime logs | PASS 0 captured warn/error после контрольной reload и заключительного прохода; rAF продвигает run в source/native |

Проценты alpha — независимая оценка bilinear sampling с шагом .25 source px
на actual UI poses, **не renderer pixel readback**; текущие normal/zoom screenshots
подтверждают частичное перекрытие. У 1014/1015 есть ничтожные soft tails ниже
alpha16 (weighted4.03e-7/1.34e-9). Визуальную достаточность shadows/materials/
restoration и общий Art PASS решает VQA/Lead.

Builder ordinary seed2771772266/LOST1100 сохранён внутри frozen payload как
Builder provenance; независимый native PASS этому дополнительному seed не
присвоен. QA подтвердил заранее подготовленные 0/1/2, без новой матрицы.

## TQA-WATER-01-01 — P3, exact tick overwritten during Play (OPEN)

Trigger: импортировать seed1/t1009, нажать Replay (он начинает Play), ввести
1009 в «Точный тик» и нажать «Перейти». Поле перезаписывается текущим tick
каждым UI render. Повтор: first read after fill70, before click86,
actual seek106; ранее также requested1009→80. После остановки requested1009
даёт exact1009. Ожидание: введённая цель сохраняется до перехода либо editing
явно останавливает Play. Native корректен для фактически выбранного tick;
это дефект управления, не drift симуляции. Продукт QA не исправлял.

Неблокирующая metadata заметка: `binding.artStatus` по-прежнему говорит
«temporary background, not extracted art». Outer artifact/artBinding/UI верно
маркированы PARTIAL starter; input provenance field устарел.

## Доказательства и пределы

Small metadata: [RESULTS.json](evidence/starter-01/RESULTS.json),
[RAW_INDEX.json](evidence/starter-01/RAW_INDEX.json). Raw DOM/export/screenshots,
integrity, console/network diagnostic — только в собственной папке
`E:/R4D/perspective/p4-runtime/technical-qa/transfer-water-dark/water/starter-original-p4-candidate-01`.
Representative actual frames: `07-zoom-follow-1009.png`, `25-zoom-arch-1013.png`,
`30-receiver-1275-zoom.png`, normal `05-arch-1008.png`/`32-receiver-normal-1275.png`.
QA tools: `qa-tools/review-starter-01.mjs`, `qa-tools/starter-alpha-analysis.py`.

19 other floor objects, receiver02 rear/water/sides, другие receivers/scene
остаются baked; Parts OFF проверяет три локальные области, не full clean floor.
Другие gates/receivers и Dark live consumer этим ранним отчётом не покрыты.
Новый sorting/height вариант не создавался; полный Water/Dark target не ожидался.

Start headroom RAM10.83/31.91GiB, CPU2%/24 logical; C14.83/D14.64/E9.57GiB.
End RAM10.47/31.91GiB, CPU1%; C14.73/D14.64/E9.54GiB. Один лёгкий QA slot;
чужие процессы/артефакты, frozen bytes, security/global download settings не менялись.
Download API имеет только `path()`: единственный малый фактический экспорт из C
побайтно скопирован на E, затем удалён только этот созданный QA download.
Собственные raw файлы сохранены; private TS/maps/Builder source не коммитятся.
