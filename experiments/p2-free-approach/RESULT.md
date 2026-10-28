# P2 Jungle — частичный исследовательский результат

28 октября 2026. **COMPLETED BOUNDED PARTIAL RESEARCH RESULT**, принят CTO после review exact `ac2a01abf30a8ad19a50407a08ee91545d449074`. [Опубликованный C05](https://superflight.space/review/r4d/p2-free-approach/) сохранён. Limited delivery, actual QA и docs приняты; полного Technical/Art PASS и достижения художественной цели не заявлено. Серверное окно освобождено CTO в **20:02:14 UTC / 22:02:14 Europe/Kyiv**, исследовательский slot P2 — explicit CTO release в **20:18:34 UTC / 22:18:34 Europe/Kyiv**.

## Способ и реальное производство

Цель — оживить неизменную перспективную Jungle настоящим Millionko в PixiJS, сохранив соответствие шара геометрии, убедительные перекрытия и читаемые тени. Выбран способ с целым исходным JPG: поверх рисуются собственные шар и тень, затем зарегистрированные силуэты исходных объектов. Это сохраняет нарисованные свет и тени, не требует дорисовки пола и не создаёт швов повторной вклейки.

Artist изготовил один объёмный шар встроенным imagegen и выполнил одну адресную alpha-коррекцию. Выбранный `ball-v2.png` сохранён побайтно как второй raw: canvas1254×1254, видимый диаметр830.5px; слабые остаточные alpha-точки задокументированы. Тень — отдельный процедурный RGBA-диск128×128. Четыре силуэта `flower-01`, `leaf-01`, `frog-01`, `wood-01` размечены вручную; это художественные контуры, не новые colliders. Сохранены [точные запросы и отбор](asset-artist/GENERATION_RUN_RECORD.json), [рецепт данных/тени](asset-artist/prepare-assets.py) и [готовый контракт v2](builder/source-packets/jungle-art-v2/README.md). Для точного повтора нужны выбранные PNG, повторная генерация не гарантирует те же пиксели.

Builder отображает native-позицию принятой матрицей `H`, размер сферы следует r16 и локальному масштабу H; прозрачный padding учитывается по измеренному диску. Подъём центра — оценка из локального Jacobian, не восстановленная 3D-камера. Тень проецируется отдельно на пол, source-силуэты закрывают её поверхность. Для шара весь силуэт включается при `ball.y < depthNativeY`: пространственное частичное скрытие возможно, но попиксельной глубины глаз, свесов и поверхности сферы нет. `occludedBy` перечисляет включённые накладки, а не доказанные пересечения пикселей. [Код отображения](builder/src/main.mjs), [контракт и предел модели](builder/ASSET_CONTRACT.md).

## Неизменные входы и финальный артефакт

- Исходник: `01-jungle.jpg`,1536×1536, SHA256 `c8f9e4245c1de8c2086e615bc75dc10aea59b76b614d6e106593e07262e24f72`.
- Принятый P1: `4b47db04c7140ebf88f69b91faa0b790d46f22ec`; config, manifest, перспектива/direct projection и transform. Приёмка Макса относится к obstacle mapping и перспективе; новой приёмки drops/корзин в P2 не было.
- Настоящий native core: `5a6fa03f1cdb3de88a2d9c7dbe795eb8e2a7f023`, package tree `008d16a80a26bb77d562a45218b01da09b0d9ff0`. r16, tick5ms,25pins/16segments/4buckets и физика не менялись; запуск задаёт только seed. Compiled core SHA256 `dbb01f3276fca9df7bacd69ecfb1e3737e74f6bd606b67041ec6ba5ca092c2a7`; C05 переиспользовал exact C04 bytes. [Все input pins](builder/scripts/pins.mjs).

| Финальный C05 | Exact значение |
| --- | --- |
| Implementation/build/source | `0367d46211ed170c8840cf702b5ea1cc05f6e430` |
| Frozen artifact | `E:/R4D/perspective/p2-runtime/output/p2-jungle-static-candidate-05` |
| Browser tree | `bundle/review/r4d/p2-free-approach/`,16files /2453059bytes |
| BUILD_MANIFEST.json |9013bytes; SHA256 `aa40eea4d51100e157b0bdf32623e874a39777c52be2c801c3dce20285fc4b1b` |
| Browser tree SHA256 | `19afaab7ef62e88948419b2fdc38210395ed64acba7aa024d4dc6619d7f6bdec` |

Manifest перечисляет все16bytes/hash records, включая `kind`; tree digest — SHA256 от JSON отсортированных records +LF. [Freeze/provenance](builder/CANDIDATE05_FREEZE.md) и [итог доставки](builder/DELIVERY_05_PUBLIC_COMPLETE.md) сохраняют полные pins. В Review поставлен compiled runtime; приватные native TS/maps и operator secrets в публичный Git не перенесены.

## Существующий рецепт воспроизведения

Нужны clean source0367…, Git-объекты принятого P1, неизменный JPG, tracked пакет Artist v2 и Node≥24. Первоначальная полная сборка использовала разрешённый native checkout, Pixi8.22.0 и Rolldown1.2.15; C05 использует frozen04 с manifest SHA `60f79d1bdad8d3737376952043013394bb3098de6b15200fc5c352dd875dd1f7`. Сборщик проверяет все его16файлов и копирует core/Pixi/license без новой компиляции. Output должен отсутствовать и находиться внутри собственного E runtime.

Существующие команды из `builder/` приведены как рецепт; при этой финализации они **не выполнялись**:

```powershell
node scripts/build-static.mjs --version p2-jungle-static-candidate-05 --source "<JUNGLE_JPG>" --reuse-artifact "<FROZEN_C04>" --output "<NEW_E_ARTIFACT>"
node --experimental-vm-modules scripts/check-static.mjs --artifact "<NEW_E_ARTIFACT>" --package-only
```

Package-only проверка не запускает физику/Pixi. Полные параметры первой сборки — в [build script](builder/scripts/build-static.mjs); исторический `serve.mjs` не является текущим маршрутом. Для уже опубликованного повтора сохранён вход [`?seed=1&paused=1`](https://superflight.space/review/r4d/p2-free-approach/?seed=1&paused=1): видимые seek/+1 и200%/Fit; без скрытых QA-mutators. Этим текстом новый запуск или rebuild не назначается.

## Наблюдения, коррекции и существенные неудачи

1. Первые browser-проверки были ограничены отклонёнными local/file операциями; render тогда не наблюдался. Затем browser `.mjs` имел проблему MIME. C03 выдаёт `.js` с явной адаптацией references, сохранёнными исходными blobs и узким scanner exception для pinned Pixi. Финальная поставка подтвердила все16HTTP-файлов,6JS как `application/javascript`. История доступов/неудач сохранена в [delivery03](builder/DELIVERY_03.md) и [C04 checkpoint](LEAD_DELIVERY_04_CHECKPOINT.md).
2. Для разбора движения добавлен дробный playback clock0.25×/0.5×/1×, независимый от физики. Сохранённые native/oracle проверки подтвердили состояния и события; C04 actual UI показал pause/seek/replay и ограниченные rate windows. Это не FPS/stress PASS. [Source/правила clock](builder/PLAYBACK_SOURCE_01.md), [TQA04](qa/technical/candidate-04-PUBLIC-01.md).
3. [VQA04](qa/visual/CANDIDATE_04_PUBLIC_VISUAL_01.md) реально зафиксировал black200 на94/95/96; Fit+шаг97 восстановил сцену. После rewind оставался stale completion hint. C05 устранил обнаруженный scrollbar feedback в измерении stage, добавил общий redraw и lifecycle hint. [Независимые static/model проверки](qa/technical/candidate-05-STATIC-01.md) и actual [TQA05](qa/technical/candidate-05-PUBLIC-01.md)/[VQA05](qa/visual/CANDIDATE_05_PUBLIC_VISUAL_DELTA_01.md) подтвердили стабильные tested canvas/state/RNG, очищение/возврат hint и видимую сцену в captured94/95/96/200 и returnFit. Это две ограниченные desktop/IAB/seed1 выборки; причина прежнего black не установлена, универсального исправления не доказано.

Сохранённые обычные прогоны включают LOST; успешный вход в корзину художественно не подтверждён. Точный случай Макса «перед глазами жаб» не воспроизведён; [source/data диагноз](qa/visual/CANDIDATE_03_FROGS_TINYBALL_DIAGNOSTIC.md) не подменяет кадры. Fine contact, непрерывное partial occlusion и grounding тени шара остаются непринятыми. Fit/narrow делают шар и тень малыми; narrow сохраняет внутренние scrollbars. Только4из25препятствий имеют накладки, остальные21, ограда и бортики корзин не покрыты. Физический Android/жесты, live download/error ownership и visibility suspension не проверены. Ошибка VQA lookup `performance` была ordinary scope/binding TypeError, без explicit denial или установленной причины в продукте; точный audit сохранён в VQA05.

## Вывод и handoff

Получены собственный производственный маршрут ассетов, работающая Pixi/native интеграция, точные replay/QA pins и опубликованный ограниченный пример. Полнота перекрытий и обязательное художественное качество не доказаны; технические/model/HTTP факты этого не заменяют. CTO завершил текущую попытку частичным результатом: candidate06, дальнейшая дорисовка, новые тесты и device/SDK поиск не назначены. C04/C05 и raw failures сохраняются.

Серверная доставка/docs/cleanup приняты, token закрыт и окно released20:02:14UTC; дальнейших server actions по нему нет. По read-only статусу20:07UTC Builder856b807/TQA94e125/VQA4b9aa770 — completed/idle, Artistbf961453 — completed/notLoaded; все четыре worktree чистые. Новых поручений команде нет, оставшейся разрешённой production-работы **0**. CTO принял итог и explicit освободил research slot P2 в20:18:34UTC. Эта последняя административная фиксация сохраняет partial и все ограничения; работа остановлена. [Полная история, receipts и операционное завершение](LEAD_DELIVERY_05_CHECKPOINT.md).
