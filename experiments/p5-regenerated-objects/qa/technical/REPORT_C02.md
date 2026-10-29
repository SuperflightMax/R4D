# P5 Technical QA — frozen C02

29 октября 2026, Europe/Kyiv; основной actual проход примерно00:28–00:43 UTC, адресный clip follow-up00:46–00:48 UTC. Независимый проход C02 завершён. **Package/input identity и native/control invariants подтверждены; C02-V01 независимо воспроизведён: foreground ошибочно скрывает сферу над открытым полом. Общий technical/artistic PASS P5 и release не выданы.**

F-C01-01 не воспроизвёлся на receiver01 и receiver03: шарик виден внутри отверстия. C01-V02 Field clipping не воспроизвёлся для всех четырёх rendered чаш; domain не меняется с Art/Geometry. Эти закрытые cases отделены от нового подтверждённого C02-V01 и оставшейся coverage. Ошибки native/state в проверенных случаях не выявлены.

## Frozen bytes и источники

- Consumer `398b0daaaad914cc67b8390a51454d21db524e7a`, prefix `experiments/p5-regenerated-objects/builder/`.
- Root `E:/R4D/perspective/p5-runtime/builder/output/previews/c02/public`; полностью прочитан index10707bytes,SHA256 `f40040bb40d529b7bf1f289e661d69f7f882fddfc962e40cdc5616a59c9d9389`.
- Все29файлов/21668434bytes проверены на диске и через HTTP GET; hashes/bytes совпали. `app.js`571012bytes,SHA256 `4a003dd39212f21b7a3dd1baa82c0d0738af3a9767c6e51225b9b54f5aac325c`; staged manifest59960bytes,SHA256 `275ade538d30119434723339487cf7d036a35bbbefe4ad6807f4dd810a6e4491`.
- Artist `4990463ec6eabf89aa47f58f9b59f703cbf739ba`: полностью прочитаны `HANDOFF_MINI_02.md`, policy/foreground sidecars; manifest83772bytes,SHA256 `6055be855714bc9ad66a0e803fc392fbd8e01d94a9798536e7047c06d5d2a331`. Все source→staged поля сверены целиком после объявленной нормализации URLs/schema/provenance digest. Manifest и три sidecar совпали с normalized HEAD `a5f26a57833e8671bf031a2b21c1b9f990dd3c87`.
- Полностью прочитаны receiver contract `2c8551e45876396e4b8f5df7f6d6c93713f89e2c:experiments/p5-regenerated-objects/builder/contracts/RECEIVER_ANCHOR_POLICY.md`, consumer app/framing/asset contract/generated-floor-clip contract на C02; просмотрена адресная source delta и `NEXT_CANDIDATE_DELTAS.md`.
- Accepted P1/config/projection/native pins прежние: P1 `4b47db04c7140ebf88f69b91faa0b790d46f22ec`, config SHA256 `dd5c519cd6d4b7295118e0a3a1063efed424a0ce739450bd5153c6a9941982db`, P1 manifest `7784dc0a215d0e472cf06a4eee03793592727cf0fa9a1fa0e0c78e5f1d17da18`, projection `b59a0c1e6c34b417d253178457ef3580b8bea0aa89c989d1342f9376e19b9431`; native commit `5a6fa03f1cdb3de88a2d9c7dbe795eb8e2a7f023`, tree `008d16a80a26bb77d562a45218b01da09b0d9ff0`. Original Jungle hash повторно совпал с `c8f9e4245c1de8c2086e615bc75dc10aea59b76b614d6e106593e07262e24f72`.
- `src/controller.mjs` побайтно совпал с C01: Git blob `5f2e1ea73ee3bfda9319fcb7d3489633585fc584`. Dependency lock совпал с exact C02 Git и inventory. License supplement присутствует в pinned terms; независимая release/privacy/license приёмка остаётся у назначенного владельца. Bundle не пересобирался, полный722build-input audit повторно не выполнялся.
- До открытия браузера проверены owner/root/index/app: URL `http://127.0.0.1:55185/`, Builder PID21340/session26545, rootC02. После проверки owner и served app/manifest hashes снова совпали. Producer root/listener не менялись; transient capacity issue Producer не воспроизводился через новые build/replay.

## Подготовка новых bindings/policy

17unique PNG/23texture IDs/64instances:25bodies+25shadows,4receiver back/front pairs,ball/shadow,floor,3foreground parts. Все17PNG независимо прочитаны Pillow12.1.1; alpha>0/alpha>=16 bounds,max alpha,размеры,bytes/SHA совпали для всех23metadata entries. Все29BINDINGS сопоставлены с unchanged pinned targets, native/source anchors и texture footprint; max body depth residual3.2958589851sourcepx подтверждён как число, не художественный PASS.

Для каждой чаши независимо пересчитано только **новое** правило `hR=L*sB/sR`, где L468.5px. Back/front имеют одинаковый logical A и optical O=[628,477], PNG bytes не менялись. hR:67.6165848584/81.3641031099/79.4991093900/72.0114715232texturepx; visual shifts−17.8063/−17.8882/−17.9005/−17.8326sourcepx. Это объявленный перенос рисунка относительно прежнего logical plane, без изменения native/source targets. Seed/tick offsets,sink/fade не добавлены.

3foreground instances — near-ledge/near-serpent-left/near-serpent-right, parentfloor, same floor-v1 bytes, exact Artist source1536 polygons. Source→staged contours/provenance/IDs совпали. По exact consumer source sprite+mask находятся под одним Art child layer, Geometry — последующий отдельный sibling. Runtime отключение Art проверено в реально полностью скрытом состоянии852; диагностический ball outline стал виден. Инспекция приватного Pixi scene graph не заявляется: topology проверена по source, эффект — actual UI/кадрами.

**Общий source oracle1922точки и seed0–3 matrix не повторялись, native export/core заново не собирался.** Для поиска моментов использованы существующие ordinary traces0/1696420279/3957814979 и declared alpha/clip geometry. 9×9alpha sampling выбирал реальные моменты, а не доказывал видимое качество. Выбранные окна затем просмотрены в браузере.

## Actual runtime coverage

Собственная скрытая IAB вкладка browser2/tab2; исходный viewport оставлен. Управление выполнялось через UI buttons/seed/slider/select. Через read-only CDP читались snapshots/config/meta/record; product mutations/seek через JS API не вызывались. В конце вкладка закрыта, сервер не создавался и чужие PID не останавливались. Warning/error console сообщений не было.

| Проверка | Actual кадры/действия | Подтверждённая область |
| --- | --- | --- |
| Leaf | seed0:94/95/96 leaf01;788/789/790 leaf02;1614/1615/1616 leaf04 | Far/mid/near contacts, exact native events/state |
| Wood | seed0:571/572/573 wood01;seed1696420279:783/784/785 wood06 | Far/near contacts; не только прежние касательные frog/flower |
| Frog | seed0:441/442/443 frog02 и1715/1716/1717 frog05 | Far/near contact windows |
| Flower | seed0:890/891/892 flower02 и1328/1329/1330 flower03;seed1696420279:834/835/836 flower07 | Новые far/mid variants и late contact |
| Боковой отскок | seed0 left-2:475/476/477 плюс overlay фактического477 | Отскок рассмотрен у нарисованной внутренней границы; native/contact state совпали. Полная сегментация длинного rail отсутствует |
| Body overlap transitions | leaf01:59/60/75/144;wood01:559/560/566/578/666/667;wood04:1527/1528/1545/1556 | Реальное вхождение сферы за силуэт, partial/full hide и последующее появление. Не объявлено проверкой всех center-sort flips |
| Foreground переходы | seed1696420279:843/844/848/852/856/857/860/864;seed0:1920/1930/1937/1945;preserved LOST3957814979:765/772/783 | Наблюдалось partial→full hide→reveal; сам факт скрытия не доказывает правильность области. C02-V01 ниже показывает false occlusion в другом месте |
| Маска/контролы | на852:Art/Geometry/Whole/Field;UI+1→853,+10→863;pause нового обычного запуска на70 и повторное наблюдение70 | Config/state/RNG сохранялись при view/mask actions; реальные шаги и пауза точны |
| Receiver01 |1696420279:874/875 и normal realtime до875 | F-C01-01 не воспроизвёлся; sphere видна внутри aperture |
| Receiver03 |seed0:1955/1956 и полный realtime до1956 | Sphere видна внутри aperture, native terminal прежний |
| Field/V02 |Whole/Field и Art/Geometry на875; все11important parts | Нет прежнего crop чаш/передних частей, camera/domain стабильны |

Native collision event t сопоставлялся с post-step state t+1, bucket/lifecycle — со своим tick. В просмотренных pin/left-2 окнах не выявлен **видимый** отскок от пустого места; часть самого контакта может быть скрыта объектом. Координатное совпадение не используется как замена рассмотренным кадрам. Нового дефекта common input этим проходом не доказано; LOST не объявляется ошибкой маппинга.

На трёх preserved traces alpha sampling не нашёл информативного body center-depth flip с заметным opaque overlap. Поэтому общий PASS center sort **не** заявляется. Вместо формальной проверки смены знака просмотрены реальные entering/exiting overlap windows за leaf/wood и foreground. Сложные другие силуэты/непопавшие в пути crossings остаются unverified.

## Native/state/RNG и обычные исходы

**100actual browser snapshots** сопоставлены с independent native по state/RNG/config/event sequence:93основного прохода и7адресного follow-up C02-V01. Field framing metadata совпали во всех проверенных states/view combinations основного прохода. Полный browser per-tick trace не записывался; moving read перед screenshot не является атомарным render timestamp. Paused contact frames точны.

| Seed / происхождение | Actual результат | Independent native trace SHA256 |
| --- | --- | --- |
|0, preserved/default replay|receiver03/tick1956; normal realtime и paused frames|`971c4b1c96f9e8aa271161fe31025cb776d7ad830dae5758cb54e01c77c8a572`, reused|
|1696420279, preserved ordinary replay|receiver01/tick875; normal realtime и paused frames|`04d76d90cd5425d64c625ac1cea15e5501bd009bccbc6fcad3be2e04bb6c9a14`, reused|
|3957814979, preserved TQA LOST|LOST/tick847; новая clip область просмотрена|`f722ffbe0d33fc110f850e2be3e68393b7c72f07a6147d51fce62183f4137979`, reused|
|1858573514, **первый** новый UI бросок|LOST/tick843; pause70; точный replay|`c598e832aa2bd01ec4b625a286acd485cf470b0d1aa2f2174add0912550e5502`|
|2608986051, **второй** новый UI бросок|LOST/tick1175; точный replay|`893c730b70f0fb64adeebb5a44d4ccfc62cb06d5d93b44c8acb19509fc721710`|
|4210403976, адресно переданный ordinary VQA case|LOST/tick757; собственные actual states674–677/757 и контроль слоёв|`555e6fe1566f24c5a37b4e41359c2dcd548035bab51f8cc7d93f711a244f3890`|

Все два новых исхода сохранены; после двух заранее ограниченных ordinary throw действий новые seeds ради выигрыша/нужной корзины не искались. Штатное ядро запущено по одному разу для двух новых UI seeds и отдельно один раз для адресно переданного case4210403976. Старые traces использованы read-only. Physical fields/start/drop/PRNG algorithms не менялись.

## Адресные выводы по C01 и остаткам

### C02-V01 — расширенный near-ledge clip скрывает шарик над открытым полом

Адресный finding получен от Lead во время завершения отчёта. Переданный VQA кадр проверен read-only: `E:/R4D/perspective/p5-runtime/visual-qa/evidence/c02/seed4210403976-t676-field-art-geometry.jpg`,148340bytes,SHA256 `607003ba03c71cb4a4db1cf6639e7687ae6993bb445d1073d85b772c98b36494`. Затем case **независимо воспроизведён** в новой собственной IAB вкладке на том же app SHA, без изменения C02.

Repro: seed4210403976 → «Повтор» → Field,Art on/Geometry off → seek674 → +1→675 → +1→676. Сфера закрывается над визуально открытым полом; Geometry on показывает её ground circle перед near edge. Самостоятельно сохранены674/675/676/677,676сGeometry иArt off, terminal757. Все7states/config/RNG/events совпали со штатным ядром.

**Первичная причина локализована до near-ledge contour, не до native и не до right-serpent clip.** На676 source ground `(1209.3239829,1098.8094830)`, visible sphere bbox X1191.7415100..1226.9431625,Y1064.3419630..1098.8828963. Весь visible bbox поX ещё левее минимальногоX right-serpent polygon1228.5550239; ground и visible-center proxy находятся внутри расширенной правой части **near-ledge**. Actual кадр подтверждает, что эта область захватила открытый пол. Controller/config/projection/state верны, normal LOST757 сохранён.

Это семантически неверная foreground segmentation: корректное partial hiding за wood01/wood04 и наличие работающей mask tree не оправдывают исчезновение на открытом полу. Полного foreground PASS нет. Artist уже получил correction от Lead для нового manifest/C03; TQA product не правил. Нужный следующий повтор — clip delta, case674–677, смежные crossing/Art off/Geometry/Field и необходимые регрессии; common oracle и C01 matrix не повторять. C03 в этом проходе не ожидался и не проверялся.

Собственные evidence: `clip-followup/browser/seed4210403976-676-art.png`,SHA256 `b5e770e1a0291434da53abaa1f0584397c398e94dfa929843bad2cadfe1e8849`; `...-676-geometry.png`,`2c3afbf961ac05367fc3e32485178efdc14992602783dab4ac3a1cf5ed6a7f7b`. `clip-followup/verification.json`5204bytes,SHA256 `76c058b94b4d638ad9fd0b88e542d878e6d3057de1bdb627443e6c31613e1955` содержит exact source measurements/native comparison и provenance адресного входа.

**F-C01-01 / C01-V01:** закрыт в наблюдавшихся receiver01/03 cases на C02, включая real time. Primary cause прежнего расхождения устранён объявленной optical/logical anchor policy: sphere проходит в видимое отверстие при прежнем correct native terminal. Это не доказательство входа в receiver02/04. Полное исчезновение/3Dпогружение не подставлялось вместо штатного результата.

**C01-V02:** Field не обрезал четыре чаши в просмотренных кадрах. Actual canvas1110×545CSSpx,DPR1; domain source X180.0574163..1384.1148325,Y300..1410.0959465.11important rendered part bounds целиком внутри canvas с8CSSpx margin; Art/Geometry не меняют domain. Часть страницы может быть ниже viewport fold и доступна скроллом; это отделено от прежнего consumer Field crop.

**Остатки обязательной проверки:** кроме подтверждённого near-ledge false occlusion, entry receiver02/04 не достигнут; оба near-serpent clip overlaps не подтверждены движением; длинные side rails не partitioned и их корректная частичная occlusion не доказана. Все25targets подключены, но отдельный contact case для каждого из25 и всех частей/контуров не просмотрен. Есть четыре семейства, несколько variants и реальные overlap transitions — это фактическая граница покрытия. Coarse contours у moss/feathers сохраняют риск; им не выдан общий PASS.

Следующий полезный вход для Lead — исправленный clip candidate и решение по непокрытым receiver/rail/head-edge scenarios в действующих рамках; meaningful art/consumer correction проверяется адресно. Полное художественное качество/читаемость всех теней — отдельно у VQA; наш числовой residual и PNG counts не являются artistic PASS.

## Evidence и ресурсы

Все raw/private материалы только в `E:/R4D/perspective/p5-runtime/technical-qa/c02/`. Короткие exact pins — [C02_EVIDENCE_PINS.json](C02_EVIDENCE_PINS.json). Private source/maps в Git не передаются.

Исходный `evidence-index.json`:35552bytes,SHA256 `170aa6ba547e85ff1bfef08d28e53938d49cda570d796ef943317e0fb416330d`;206файлов/25192514bytes до самого index, сохранён без перезаписи. Адресный follow-up: `clip-followup/evidence-index.json`,3758bytes,SHA256 `cc898442628119280756c2a8616a58ed0b5cb41f4d0ce4984ef092741b6ff2d4`,20файлов/1823244bytes до своего index. Итоговая append-only цепочка `evidence-index-002.json`,595bytes,SHA256 `838775b709f03fa035310fc14489f52022d4a59f0220215b6d07b8f831df709e` связывает обе части и100verified snapshots. Основные файлы:

- `package-verification.json`:SHA256 `8bb348e47c6435285540e8af7c81fb1510d9122c7d16a6cb96578f46b38104b4`;
- `binding-verification.json`:`7a4a72b8519cc141a40adc0bdffb6a058d52658e7fb90ab4c67bb295879a5b10`;
- `trace-window-analysis-002.json`:`92091eac97a7e6d09c7c4019336989e840b985ebc96ef38d01dd9d434d91ccf3`;
- `browser-native-comparison.json`:`6aadf7a8fae9773019688e09eb64691c8ad955ad8afee917877a26b47c91f63e`;
- `browser-native-addendum.json`:`84ca199f246b12a3c49ebd614e4473aab12dec3f55d7caf662f8436b349d1449`;
- итоговый `browser/final-receiver01-field875.png`:`078c079cb88b66e2abbae001316fcbeb29e21a6ee94d470c85cdd1ffe529dc9b`.

Начальный fresh guard: RAMfree16.307/31.907GiB,CPU4%,aggregateWS19.189GiB,402процесса; C17.070/D16.281/E12.056GiB. Peak estimate1.2GiB RAM/.15GiB E + concurrent allowance4GiB RAM/2GiB E. Повторный guard до новых native checks: RAM15.504,CPU6%,E12.031GiB. После закрытия своей вкладки: RAM15.951,CPU3%,aggregateWS19.295GiB,402процесса; C16.320/D16.281/E12.025GiB. Изолированный browser peak не измерялся; shared working sets не трактуются как уникальная RAM. Пороги E4/2GiB не достигнуты.

Перед адресным follow-up fresh guard RAM15.886GiB,CPU4%,E12.025GiB с peak estimate1.2GiB/.05GiB и прежним4/2allowance. После закрытия дополнительной своей вкладки RAM15.726GiB,CPU3%,E12.022GiB; обе свои вкладки закрыты, listener Builder не менялся.

TEMP/TMP/output/evidence — собственный E/process-local, global env/settings/credentials не менялись. Чужие worktree/PID/devices, dirty D:/dev/R4D и native source checkout не изменялись. Own worktree/branch прежние. Server release writes0, gate закрыт; сообщения другим чатам не отправлялись.

Обычная QA tooling ошибка: один завершающий Node postprocessor смешал require и top-level await (`ERR_AMBIGUOUS_MODULE_SYNTAX`) и был исправлен async wrapper до выполнения; native/product не повторялись. Имя `seed0-left2-476-overlay` неточно: внутри actual state477; это отмечено в index, для476 используется самостоятельный art-only кадр. Viewport capability только прочитана, размер не менялся. Denial/403/исторических обходов и browser file fallback не было.

Пока также unverified: timeout exception branch, UI download, другие device/DPR modes, raw generation audit, полный build-input/binary provenance/privacy/release. Это законченный exact C02 QA report с открытой coverage, не разрешение публиковать или объявлять весь P5 готовым.
