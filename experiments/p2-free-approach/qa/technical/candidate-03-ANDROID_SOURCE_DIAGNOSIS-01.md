# P2 Android: source/data-разбор жестов, масштаба и читаемости

28 октября 2026, Europe/Kyiv. `technical-qa-r4d-p2-free-01`. Выполнено после новой явной команды Max от **05:36 UTC**, переданной Lead через trusted Dot/CTO. Начальный checkpoint/HEAD — `36601e05388aa0dcf352f63adf7dbca30ec48659`, ветка `codex/r4d-p2-free-technical-qa-01`, status был чистым.

**Вывод:** сохранённый Pixi EventSystem назначает canvas `touch-action: none`; это конкретная source-причина ожидать блокировку native scroll/pinch, но не проведённое воспроизведение Android. Видимый диск шара в выбранных мобильных viewport при 1× рассчитан примерно в **6–9 CSS px**. Полноценный PNG не увеличивает его: размер нормирован на физический r16. Playback slowdown можно проверять отдельно от физики, сравнивая состояния одинаковых тиков. Продукт, радиус, геометрия и ядро здесь не менялись; новых тестов не написано и прежние sim-аудиты не повторялись.

## Прочитанные источники и доказательства

Feedback 1–7 прочитан из `dceb1b9e425fb22812e871542118819c85492de8:docs/PERSPECTIVE_RESEARCH_STATE.md:13–55`. Там сохранены наблюдения Max **04:13 UTC** и дополнение **04:19 UTC**: «медленнее», не «меньше». Модель Android-устройства, браузер, viewport, seed и тики просмотра неизвестны. Исторический текст о паузе на этой ревизии уточнён новой явной командой resume, а не принят за новый запрет чтения/диагностики. Положительная оценка движения не превращена в acceptance; P2 остаётся незакрытым.

Exact source — `e7ed4d068f33ee6ecda491f15dc46a6fd548ef96`, каталог `experiments/p2-free-approach/builder/`. Прочитаны только относящиеся файлы и сохранённые данные, не весь репозиторий:

- `index.html:4,17,21`: viewport, варианты 1/1.5/2 и открытая QA-секция; blob `29644c33c87b72e7ebdf5ecf56eb6b76c324412d`.
- `style.css:2,7–9`: padding main, рамка/overflow/высота stage, canvas; blob `de3235b7917f32e531cac04ae4c3b1873247cd33`.
- `src/main.mjs:32,84–95,106–119,172–207,208–218`: init, fit, диск шара, сохранение и физический accumulator; blob `9f06dfcd41aaacd2b39335f64fb70b4eddfc182f`.
- `src/controller.mjs`: delegation штатному core, step/seek/descriptor; blob `bd9c73274bda68af8155a19919a4f86a1b84ebb0`.

Для frozen candidate-03 заново сопоставлены с manifest хеши относящихся browser index/style/main/Pixi/config/accepted-manifest/art-manifest. Source `.mjs` и emitted `.js` различаются только ранее проверенными declared references; нового build не было. BUILD_MANIFEST SHA-256 `69a46f395278749ab44b81bcd78f0b70f6f1edf2bbd2d30ff536411d16bf5575`.

Исходный сохранённый **Pixi 8.22.0**: frozen `vendor/pixi.js`, SHA-256 **`a073adb40aaa803fd19066c21997a09f895397e98a5555be8bd0a7c57873d4ef`**. Читаемое пояснение — `<PIXI_PACKAGE>/lib/events/EventSystem.mjs`, SHA-256 `961cd8f2d95420374d204a51e5f0f334de88e0146291f7561ba0d2749f0f313b`; нужные присваивания/условия найдены также непосредственно в frozen minified SDK, а не только в соседнем lib-файле. Никакие операторские пути к private core/SDK не зашиты в новый public tooling source.

Новый численный receipt: `E:\R4D\perspective\p2-runtime\output\technical-qa\android-source-diagnosis-01\CALCULATION.json`, **7626 bytes**, SHA-256 **`acd3c86ab61a2e74afb6cf37aa838406f7bdd85ea6ad53cf185fb33275039333`**, время `2026-10-28T05:52:43.763Z`. Он содержит source blobs, проверенные input hashes, SDK offsets, допущения, формулу, глубины и все числа ниже. Hash-verified старый evidence03 `0a34ca7223d7b85fa9150ab94600592f4edc83d8d68fd78ce12bfdfcfaa85a41` только прочитан; его checkpoints не пересчитаны симулятором.

## Кто управляет жестами: факты исходника

1. R4D вызывает `Application.init()` без override EventSystem/eventFeatures. Собственных touch/pointer/pinch обработчиков, `preventDefault`, `setPointerCapture` или CSS touch-action в exact index/style/main нет. `overflow: auto` принадлежит stage, но само по себе не разрешает жесты, начатые на его canvas.
2. Pixi `EventSystem.init()` вызывает `setTargetElement(canvas)` (`EventSystem.mjs:86–92`); тот вызывает `_addEvents()` (`320–338`). При `supportsPointerEvents = !!globalThis.PointerEvent` SDK ставит **inline canvas.style.touchAction = "none"**. В старой MS-ветке назначаются msContentZooming/msTouchAction. В frozen SDK первое `touchAction` — character offset **125876**, очистка при снятии событий — **127269**. Это присваивание не зависит от наличия кликабельных игровых объектов или default eventMode `passive`.
3. SDK `autoPreventDefault` по умолчанию true (`47`), но `_onPointerDown()` вызывает native preventDefault **только** при включённом click feature, `events[0].isNormalized` и cancelable (`200–208`). Обычный настоящий PointerEvent не нормализуется как legacy touch/mouse (`454–499`); поэтому утверждать «каждый pointerdown гасится preventDefault» неправильно. В fallback без Pointer Events SDK подписывает touchstart/move/end и нормализует TouchEvent; там этот путь может отменять default. Boolean `true` в addEventListener означает capture phase, не измеренное значение passive. Wheel имеет отдельное `{passive:true,capture:true}` (`359–362`).
4. `setPointerCapture` в exact app и frozen SDK не найден. Capture phase слушателей не является API pointer capture; implicit capture браузера в этой работе не наблюдался. Остальные найденные SDK preventDefault относятся также к FederatedEvent и WebGL context loss, их нельзя автоматически объявлять причиной жестов.

**Предсказание, не Android-runtime факт:** если устройство выбирает указанную Pointer Events-ветку и нет внешнего override, inline `touch-action:none` объясняет одновременно отказ viewport scroll и pinch, начинающихся на canvas. Эти жесты регулируются touch-action; отключение одного autoPreventDefault не снимает CSS-запрет. Нормативный смысл подтверждён [W3C Pointer Events, §8.3](https://www.w3.org/TR/pointerevents3/#details-of-touch-action-values); это семантика свойства, а не замер телефона Max.

Viewport meta не содержит запрета user scaling. Внутренний select 150%/200% — отдельное пространственное увеличение scene/renderer, собственного pinch recognizer нет. По исходнику нельзя утверждать, что select не работает на Android: Max мог иметь в виду другой жест. При выбранной модели на 2× canvas расширяется до 652×652 либо 756×756 CSS px внутри stage 326/378×616: увеличенный кадр требует panning/scroll. Если этот жест блокируется canvas, увеличение и удобный осмотр остаются разными задачами. Реальное поведение select, computed touch-action, scrolling ancestors и viewport надо будет наблюдать после нового допустимого handoff/auth-факта.

## Расчёт видимого шара

**Допущения:** layout viewport 360×800 либо 412×800 **CSS px**, page scale1, без font/accessibility overrides, scrollbar overlay без layout gutter. Это представительные выбранные размеры, не устройство Max. Main имеет padding16 с каждой стороны, stage — border1, поэтому stage.clientWidth = V−34: **326 / 378**. При высоте800 stage.clientHeight = max(400,min(0.77×800,1000)) = **616**. В обоих случаях fit ограничен шириной. DPR не умножает CSS-размер; renderer resolution1 влияет на raster detail, не увеличивает диск.

Сохранены r16 и H из actual accepted manifest. Для этой H горизонтальный диаметр в исходных пикселях точно равен:

`Dsource(y) = |H(x+16,y) − H(x−16,y)| = 32 / (6.066459862490026 − 0.0001486986341421116*y)`.

`spriteScale = Dsource / 830.5`; следовательно, видимый диаметр содержимого `Dcss = 830.5 * spriteScale * sceneScale = Dsource * min(stage.clientWidth,stage.clientHeight)/1536 * zoom`.

**830.5 px — содержимое**, canvas PNG1254×1254 включает прозрачные поля: весь sprite rectangle шире диска в 1.50993 раза. Считать 1254 видимым шаром было бы ошибкой; большая исходная картинка или замедление сами по себе не увеличивают CSS-диск. Вертикальный lift в main меняет положение, не диаметр.

Основной диапазон native y выбран от дальнего края пола **33100.260498…** до самого ближнего центра корзины **34923.903640…**. Сам пол заканчивается на **34695.151346…**, старт — **33151.813310…**. В этом диапазоне Dsource растёт **27.9599 → 36.6417 px**; на старте28.1484, у переднего края пола35.2680.

| Viewport CSS width | stage width | Zoom | Видимый диск, дальний пол → центры корзин, CSS px |
| ---: | ---: | ---: | ---: |
| 360 | 326 | 1× | 5.93–7.78 |
| 360 | 326 | 1.5× | 8.90–11.67 |
| 360 | 326 | 2× | 11.87–15.55 |
| 412 | 378 | 1× | 6.88–9.02 |
| 412 | 378 | 1.5× | 10.32–13.53 |
| 412 | 378 | 2× | 13.76–18.03 |

Whole-source native domain шире по глубине: **32279.788869…–35287.065733…**. Сохранённые checkpoints двух прошлых запусков охватывают **33151.813310…–35375.725935…**; последнее LOST-состояние уже за whole-source domain и не использовано как «нормальное положение шара на поле» в основной таблице. Изменённые gutters, настоящий page zoom, UA shrink-to-fit или иная измеренная ширина stage требуют пересчёта, а не признания этих чисел Android-замером.

**Следствие для читаемости:** диск около6–9 CSS px на 1× согласуется с жалобой на маленький шар как количественное объяснение. Различимость блика/границы, контраст, качество raster и удобство наблюдения ещё не оценены. Радиус, metadata diameter и коллайдеры ради увеличения не менялись.

## Целевой независимый QA-план slowdown после нового candidate

Сейчас регулятора rate нет: `main:208–212` накапливает ticker.deltaMS и делит на fixed tickMs5. В `<PIXI_PACKAGE>/lib/ticker/Ticker.mjs:82,110,421–436` speed по умолчанию1, deltaMS уже масштабируется speed и ограничивается maxElapsedMS100. Поэтому реальные секунды под нагрузкой не обязаны равняться идеальным расчётным секундам.

Для порученного варианта **presentation rate0.25/0.5/1** проверять единственное масштабирование времени подачи native тиков; не уменьшать dt ядра, не менять его PRNG/config/геометрию/radius. Если rate применяется к accumulator отдельно, исключить повторное умножение через ticker.speed. Это план проверки, не написанный patch или тест.

| Presentation rate | Native ticks / идеальную wall-second | Идеальная wall-длительность одного тика | Кадр95 от старта, идеальная wall-time |
| ---: | ---: | ---: | ---: |
| 0.25 | 50 | 20 ms | 1.900 s |
| 0.5 | 100 | 10 ms | 0.950 s |
| 1 | 200 | 5 ms | 0.475 s |

После адресного freeze нового candidate достаточно связанного небольшого прохода:

1. Подтвердить новые source/build bytes и неизменные core/config/geometry/r16 для этого presentation-only варианта. Использовать сохранённые seed1 и обычный490822599, без охоты за IN_BUCKET; не повторять всю прежнюю native-матрицу без новой причины.
2. При каждом rate сопоставить полные SimState/rngU32 и события на одинаковых тиках, включая **94/95/96** вокруг leaf-01 и terminal. Frame95 — post-step кадр контакта; seed1 terminal1735, обычный490822599 terminal2172. Количество/порядок шагов и исход не должны зависеть от rate. Видимые before/during/after отдельно проверить на собранном арте.
3. Пауза и смена rate на паузе не двигают состояние. +1/+10 всегда означают физические тики, seek/replay воспроизводят тот же tick/state. Смена rate во время проигрывания не создаёт новый seed, не сбрасывает session и не расходует PRNG; обработка дробного accumulator должна быть явной. Art/Geometry/zoom не воздействуют на физику. Декоративная интерполяция на паузе не подменяет точный кадр.
4. В реальном UI измерить темп на активной вкладке, записать effective delta/паузы/нагрузку и проверить соотношение0.25/0.5/1, не объявляя wall-clock jitter физическим дефектом. При зависании вкладки учесть существующий clamp, не имитировать фиксированную wall-time точность. Удобство slowdown и контакты остаются отдельной оценкой наблюдаемой сцены.
5. Save/download должен сохранять исходные seed/config/provenance/tick/state неизменными; **presentation.playbackRate** хранить отдельно от physical config и его hash. Если требуется повтор именно изменения темпа внутри запуска, отдельно сохранять history изменений presentation rate, а не подменять seed или траекторию. Проверить реальный download DOM после допустимого auth-доступа.
6. Отдельный короткий mobile-проход: вертикальный swipe, начатый на canvas/вне него, pinch, выбор1/1.5/2 и panning увеличенной сцены; записать устройство/браузер/реальные CSS viewport и stage rect/page scale. Не считать desktop-эмуляцию настоящим Android и не переносить offline PASS на эти жесты.

Max также разрешил рассматривать другие физические настройки в будущем. Данный план presentation-only не отменяет этого решения: новый physics config был бы отдельным вариантом с собственными полными условиями/хешем и новым выводом, а не прежней траекторией. Здесь ни один параметр не выбран и не изменён. Feedback по жабам/высоте не превращён в диагноз конкретного объекта без seed/тика/сцены.

## Граница завершения

Выполнены только лёгкое source-чтение, проверка относящихся хешей и арифметический расчёт по сохранённым данным. Browser не открывался и login-only цикл не повторялся; нового auth-факта нет. Новые тесты, симуляция, generation/build/install/release, server writes/reload/rollback и процессы чужих проектов не запускались. Temp/output только process-local E; credentials/settings/allowlists не читались. Тяжёлого пакета не было; перед будущим тяжёлым QA требуется свежая RAM/CPU/C/D/E оценка с учётом Millionko/P3 и пика по правилу >4/<=4/<=2, а не прежний резерв10.

Source/data-диагноз завершён; Android-runtime, исправление жестов и slowdown implementation/QA не выполнены. Следующая релевантная QA — после нового адресного candidate handoff и требуемого факта допустимого просмотра. Активного ожидания нет; immutable candidate03 и прежние evidence сохранены.
