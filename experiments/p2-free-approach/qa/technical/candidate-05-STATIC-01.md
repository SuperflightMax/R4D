# Candidate-05 — limited code/artifact Technical QA

28 октября 2026, Europe/Kyiv. `technical-qa-r4d-p2-free-01`; actual turn **`01a183a5-80d3-7a82-aa69-080d38fa9801`**. Первый completed read: собственный worktree/branch/clean HEAD `27b9adf765fabc0ac6858253b4a61158b3c3bfbb`, exact source/parent diff и оба frozen manifest SHA. Worktree `E:\R4D\perspective\p2-worktrees\technical-qa`; branch `codex/r4d-p2-free-technical-qa-01`.

**LIMITED CODE/ARTIFACT REGRESSION: в проверенной изменённой UI области и package/pin области новых actionable defects не обнаружено.** Fit/status code invariants и одна ограниченная VM-модель прошли; все16 browser files независимо сверены. Исправление PUBLIC04-UI-01 подтверждено на code/model уровне. **Actual PUBLIC05/black200 fix, live paused state/resize, physics/GPU/Art не проверены. Full Technical/Art/P2 closure не выдаётся.**

## Exact input и package

- Source/build **`0367d46211ed170c8840cf702b5ea1cc05f6e430`**, parent **`2cf9b6521cb2485a91ace37b44925b2a11fdc7b2`**. Diff parent→source содержит ровно четыре файла: `builder/src/main.mjs`, `builder/scripts/build-static.mjs`, `builder/scripts/check-static.mjs`, новый `builder/scripts/check-ui-layout.mjs`, внутри `experiments/p2-free-approach/`.
- Frozen05: `E:\R4D\perspective\p2-runtime\output\p2-jungle-static-candidate-05`; browser prefix `bundle/review/r4d/p2-free-approach/`.
- BUILD_MANIFEST: **9013bytes**, SHA **`aa40eea4d51100e157b0bdf32623e874a39777c52be2c801c3dce20285fc4b1b`**.
- Browser payload: **16files /2453059bytes**, tree **`19afaab7ef62e88948419b2fdc38210395ed64acba7aa024d4dc6619d7f6bdec`**, правило `SHA256(JSON.stringify(sorted per-file records)+LF)`.
- Baseline04: source **`08f9b9eaa6aa1063eb7fcd9cf373ddacf907725a`**, frozen `E:\R4D\perspective\p2-runtime\output\p2-jungle-static-candidate-04`, manifest **`60f79d1bdad8d3737376952043013394bb3098de6b15200fc5c352dd875dd1f7`**, tree **`60d216a64c86fed4b83f4ed3802e3d1393cdda2db8776818d22710173dc2ffed`**,16files/2452021bytes.

Оба manifest и **полные16-file наборы** независимо перечитаны и сверены по exact allowlist, size, SHA, kind, tree и totals, включая весь `bundle/`, без symlink/special/лишних файлов. После модели все manifest и32 browser-file hashes повторно сверены неизменными. Верхние handoff metadata Builder вне bundle не изменялись и не принимались как браузерный payload.

| Единственные изменённые browser files | Bytes | C05 SHA-256 |
| --- | ---: | --- |
|src/main.js|16809|`9e71e579cbf9a0e20a51eb2109801d94bfdb1714876718f2727fa4d55d53e87b`|
|metadata.json|863|`64c72b1cb001137fb0808a00837a0b54841a712a648589e58c806c27322162ee`|
|assets/manifest.json|13262|`ab0fdde99d491aad40e01983f3dd18ec6afc24044abd442b9deffda28e6e1f4b`|

Deep diff JSON: metadata меняет только `candidate/sourceCommit`; art manifest — только `provenance.candidate/consumerGitBlob`. Candidate/sourceCommit соответствуют05/0367; consumer blob **`17ff3f7d084b421a5dc5115f1065b1ea9f17a5a4`** соответствует committed main. Source main canonical LF SHA **`21161dcca1f46270e56ec44315f744007668b8f0ce789a81673b0424308dc583`**. Все **5 source→JS/HTML emissions** независимо воспроизведены из exact Git blobs с проверкой каждой объявленной единственной замены import-reference; иных правок emitted text нет.

Остальные **13 browser files byte-exact C04**: HTML/controls/default0.25, CSS, config, accepted projection/manifest/view-math, core runtime, controller, playback-clock, Pixi/license, source JPG, ball и shadow PNG. Дополнительно **13 protected source files** exact Git bytes C04: HTML/style/package, четыре input файла, оба controller/clock и четыре art-packet файла. Имена/число тоже совпали. Документы release/handoff, добавленные между04 и parent05, не объявлялись четырьмя runtime изменениями.

Protected pins: config **`dd5c519cd6d4b7295118e0a3a1063efed424a0ce739450bd5153c6a9941982db`**, projection **`9ca9e520f1927426a3a5ba73a5eacaf90fedffc9385e7d08d5b1e6ee644b020c`**, r16/tick5ms и весь PRNG/physics/geometry config сохранены. Core compiled21962bytes SHA **`dbb01f3276fca9df7bacd69ecfb1e3737e74f6bd606b67041ec6ba5ca092c2a7`** exact04. Native sourceTree field **`008d16a80a26bb77d562a45218b01da09b0d9ff0`**, commit **`5a6fa03f1cdb3de88a2d9c7dbe795eb8e2a7f023`** совпадают с pinned04 manifest; private native checkout не читался/не исполнялся. Reuse metadata с `rebundled:false` и exact04 manifest согласована с новым reuse branch build script и actual equal core/Pixi bytes; новый build/rebundle не выполнялся QA.

Privacy:13 text files проверены unchanged pure scanner из exact commit, SHA **`90a38a872a69e199373641f1168bd1f80d6399abe8c9d37b125ed8a44fd9b630`**; source scanner byte-exact04. Результаты совпали с manifest: violations0; единственное исключение — exact pinned Pixi URI-regex span135846..135849. Четыре negative controls с private/local/map literals сработали; HTTPS control принят; mutated Pixi потерял exception. Exact file whitelist не допускает raw TS/maps/private logs/operator scripts; scanner не нашёл private checkout/core-source paths. Authorized compiled runtime остаётся единственным private-derived browser module. Scanner — единственный импортированный project helper; core/controller/clock/Pixi/product main не импортировались.

## Changed fit/redraw и init ordering

Прочитаны committed main, build-static, check-static, весь Builder check-ui-layout, unchanged HTML/CSS и controller. В `fit()` ширина/высота считаются из **внешнего `getBoundingClientRect()` минус computed borders**, независимо от scrollbar-consumed client dimensions. `resolution:1` остаётся прежним; guarded comparison canvas.width/height предотвращает повторный renderer.resize при том же buffer. Scale/position и `render()` обновляются при каждом fit, в том числе когда resize пропущен. UI zoom, ResizeObserver и QA setZoom используют один fit; лишний второй QA render удалён.

Первый fit расположен после init app, загрузки base/ball/shadow, создания всех drawing layers/diagnostic и полного списка occluders. Sim/clock/paused/history/contact variables уже инициализированы; function declarations render/circlePath hoisted. Render содержит прежнюю drawing логику плюс только `syncCompletionHint(sim.state.done)`. Controller snapshot — clone state, contacts — read filter. В fit нет sim/clock/record вызовов; render не добавляет physical advance/reset/seek. Это статическая композиционная проверка, не actual Pixi/DOM/ResizeObserver scheduling тест.

Собственная модель извлекает **только fit и status helpers** в VM, даёт render stub и запрещает доступ fit к sim/clock. Она использует15px classic gutters, влияющие на client-size, но не внешний border box. Это одна bounded модель, без browser/renderer/core/Pixi/controller.

- C04 negative control: после первого fit получено чередование **1103×1078 ↔1108×1108**, согласующееся с переданным VQA raw baseline при unchanged95/zoom2. Это воспроизведение **модельного механизма**, не установление причины actual black200.
- C05:8 repeated callbacks дали только один resize **1118×1108** и8 redraw calls. Повторные callbacks после каждого из7 fixture zoom cases не вызывали дополнительных resize. Fixtures: внешний box1118×554 с zoom1/1.5/2/1 и synthetic narrow box341×650 с zoom1/1.5/2; narrow fixture не является device/mobile/Android тестом.
- Отдельное external-box изменение1118×554→900×500 при zoom2 дало ровно один новый resize1000×1000; повторные вызовы стабильны. Модель не проверяет GPU buffer allocation/black frames, observer delivery или реальную paused scene.

## Completion hint lifecycle

Новый owner принимает initial/completion/download/error. Sync заменяет только initial→completion при terminal и completion→initial при nonterminal. В модели13 status transitions покрыли terminal→nonterminal seek, start/reset→terminal again; completion-owned hint очищается и появляется снова. Download receipt и error text/error class пережили terminal/nonterminal transitions без перезаписи. Это проверка helpers; реальный DOM download/error path не запускался.

Wiring подтверждён чтением и exact function comparison: render изменён только добавлением status sync; `circlePath/presentation/record/start/step/seek/setPlaybackRate` exact04. Save logic exact04 после замены только status assignment на owner setter. Ticker completion оставляет прежний record, убирая старую безусловную строку статуса. Error setter теперь устанавливает owner/error class. Таким образом PUBLIC04-UI-01 имеет **code/model fix**, но его actual05 live verification остаётся открытой.

## Выполнение, evidence и границы

Builder `check-ui-layout` **прочитан, не запущен**: действительно извлекает fit/status, использует modeled15px scrollbar и C04 negative control; его собственный result не наследован. `check-static --package-only` guard прочитан: реальные core/controller imports и seed trajectories находятся внутри `if(!packageOnly)`. **Ни package-only checker, ни опасный default не запускались**; достаточные независимые package/source checks реализованы в собственном runner.

Один запуск: `D:\nodejs\node.exe --max-old-space-size=192 experiments\p2-free-approach\qa\technical\candidate-05-static.mjs`, exit0, около3s. Только process-local TEMP/TMP — own E-output/temp. No build/selfcheck/check-playback/native/seed/RNG/physics execution. Browser/download/visibility API не вызывались, file-preview/local server/renderer/device/model обходов нет. Новых policy denial или ordinary execution errors не получено. Frozen/source Builder не правились; server/release writes0, write token не использовался.

Own output **`E:\R4D\perspective\p2-runtime\output\technical-qa\candidate-05-static-01`** отсутствовал до create; файлы созданы без перезаписи. Evidence recordedAtUtc **17:59:49.519Z** (19:59:49.519 Europe/Kyiv), суммарно32609bytes; temp пуст. Fresh pre-execution aggregate17:59:44.990956Z: RAM free17311395840/34259845120bytes, CPU9%; C13.693GiB/D16.291GiB/E16.261GiB. План ownRAM0.5GiB/evidence25MiB; Node old-space cap192MiB, coordination C peak1.525GiB сохранён как planning input. Чужие future peaks не измерялись/не назначались; PID/process/tab inventory не выполнялся. Пороги4/2GiB не достигнуты. Actual process peak не измерялся.

| Own evidence | Bytes | SHA-256 |
| --- | ---: | --- |
|EVIDENCE.json|30564|`52438e74014edf96c3d8a62dc9e0eeff9a254536b02c65d601570614cfa93eb0`|
|INITIAL_CHECKPOINT.json|591|`776008c1ae09903b97e4cc35c3bbcb45992bb11b7e3eff721221035c721b7827`|
|RESOURCE_EXECUTION.json|726|`a48a482a03d775fb120ad13385d15599e066e3bcea5f5a428b6e886cbb940d95`|
|RESOURCE_PREFLIGHT.json|728|`d5776e26e3353929f9b0960ae9aa4c826661d2dfbc022390682743da67e34966`|

Own runner SHA **`2a3deda51186804fb0ba6437f31634c4553d007e436942f779527902056252b2`**. Evidence содержит все32 file records, exact source blobs/SHA, protected-source pins, provenance leaf diffs, emissions, privacy controls, все model traces и limits.

Existing C04 TQA/VQA reports/raw сохранены. Переданный Lead реальный VQA black200 и buffers1108×1108→1103×1078 не отменяются и не переписываются static/model результатом. **Actual PUBLIC05/black200/live paused resize/DOM download/hidden suspension/WebGL/native/fine occlusion/shadow/Art/Android остаются непроверенными.** Новый LOCAL intent/release gate и любые server writes находятся вне этого поручения. Новых actionable findings для hotfix нет; активное ожидание не поддерживается.
