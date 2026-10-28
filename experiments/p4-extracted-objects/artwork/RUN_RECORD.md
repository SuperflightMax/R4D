# P4: журнал арта

## 2026-10-28 — starter-v01

Начат по отдельному Stage 2. Исходник `01-jungle.jpg`, SHA256
`c8f9e4245c1de8c2086e615bc75dc10aea59b76b614d6e106593e07262e24f72`.
P1 exact commit `4b47db04c7140ebf88f69b91faa0b790d46f22ec`;
все три переданных SHA-LF проверены. P0 recipe прочитан по exact commit
`ee4d8e5c7dbb3b6618d58d6dacb0caf9b73dfb1b`; его числа не подставлялись вместо P1.

Способ: оригинальные RGB-пиксели внутри заданных художником силуэтов;
новая alpha, без перерисовки препятствий. Генеративное восстановление только
под удаляемыми частями фона. Условие следующего шага — проверить реальный
стык с consumer до полной нарезки. Полная нарезка ещё не начиналась.

Ресурсы перед первым шагом: RAM свободно 17,85/31,91 GiB; CPU 6%;
C/D/E свободно 14,96/16,32/16,93 GiB. Локальный плановый пик до 1 GiB RAM,
до 0,3 GiB файлов, без параллельного пакета генераций. Обработка и raw-копии
в собственном runtime на E, process-local TEMP/TMP; глобальные настройки не менялись.

### Генерация 1 — частично непригодное восстановление полного кадра

Built-in `image_gen`, edit target — исходный read-only JPG.
`transparent_background=false`. Результат 1254×1254:
`exec-abfe4df0-c057-4f73-af0b-c6002170d95a.png`.
Копия и SHA/bytes — runtime `raw/copy-manifest.json` и starter `provenance.json`.
Активный tool-managed original на C сохранён.

Точный prompt:

```text
Use case: precise-object-edit. Edit target: the supplied 1536x1536 jungle pinball board, exact original image. Create a LOCAL clean background restoration plate for sprite extraction. Preserve camera, all architecture, image framing, colors, floor seams, other objects and lighting. Remove ONLY these three items and their cast/contact shadows: (1) the small red flower on its mossy round stone pedestal centered at source pixel (526,370), roughly x482..568 y330..404, plus its down-left floor shadow; (2) the small teal-and-gold wooden cylinder centered at (628,455), roughly x594..663 y409..498, plus its down-left shadow; (3) the LEFTMOST of four hanging baskets, the entire basket itself including rim, dark opening, woven front and feather decoration, roughly x195..506 y1170..1435. Preserve its suspension ropes above it, adjacent vegetation, platform edge and all three other baskets. For the two floor objects, naturally continue the existing warm stone paving and cracks underneath, no replacement objects, no residual round bases, no residual object shadows. For the removed left basket restore only plausible distant jungle/sky already visible alongside it; retain surrounding plant silhouettes. These local hidden pixels are restoration, not a redesign. Everything outside these three local target areas must remain visually unchanged. Square composition, same full-frame extent. No ball, no symbols, no guides, no text, no watermark.
```

Наблюдение: wood-01 и receiver-01 удалены; вместо flower-01 удалён flower-02.
Весь результат не используется. Из него берутся только локальные области
wood-01 и receiver-01 под сохранёнными removal masks. Все остальные пиксели
берутся из оригинала; flower-02 остаётся исходным.

### Генерация 2 — локальная коррекция flower-01

Built-in `image_gen`, edit target — точный source crop
`[440,300,168,168]` с единственным цветком. Crop просмотрен до edit.
`transparent_background=false`. Результат 1254×1254:
`exec-1c2f7c02-bef4-4c94-a1ad-feaf0912c7f5.png`.
Активный original на C сохранён. Результат равномерно приведён к размеру crop,
использован только под локальной removal mask flower-01 и его старой тени.

Точный prompt:

```text
Use case: precise-object-edit. Edit this single square floor crop only. Remove the ONE red flower and its entire round mossy stone base at the center, and remove its complete dark cast/contact shadow below and to the left. Fill their place with naturally continued existing pale warm stone paving. Keep the original floor plane, color, illumination, cracks and moss outside the removed object region. Do not leave a circular pedestal, flower, rock or shadow. Do not introduce any new objects. The result is an empty clean floor patch in exactly the same camera and square framing, for localized background restoration behind a source-extracted sprite.
```

Model ID, seed, sampler, steps и quality генератора интерфейсом не раскрыты;
не приписываются. Подтверждение Director `gpt-6.1-sol/xhigh` относится к
сотруднику и не является наблюдением конфигурации image_gen.

### Подготовка и собственная проверка первого комплекта

`tools/prepare_starter.py` создал background, 6 RGBA-частей и manifest.
Оба body препятствий и обе части receiver сохраняют исходные RGB. Задний
и передний слои корзины делят alpha без дублирования внутреннего шва.
Тени препятствий восстановлены как отдельная оценка opacity по исходной
форме и яркости относительно восстановленного пола. Это не точное
разложение исходного освещения: alpha и видимость теней остаются предметом
проверки в consumer.

Успешно проверены source hash и размеры, три SHA-LF, обратная регистрация
трёх опорных точек с config (ошибка <1e-6 native unit), исходные RGB внутри
вырезок и RGB фона вне локальных областей восстановления. Файлы открыты и
просмотрены отдельно и после статической обратной сборки. Это собственная
проверка подготовки, не динамический QA и не подтверждение стыка PixiJS.

Перед обработкой повторно: RAM свободно 16,13 GiB, CPU 19%;
C/D/E свободно 14,88/16,31/16,69 GiB. Подготовка заняла около 7 секунд.
Raw originals на C не удалены; raw-копии на E побайтно сверены по SHA и длине,
метаданные перенесены через copy2, запись находится в runtime copy-manifest.

Остаточные вопросы: граница тонкой листвы/подвесов receiver, заметность
и края восстановленных теней, seam foreground при частичном перекрытии
шарика, точная загрузка straight alpha в consumer. Ball/shadow ещё не
изготовлены; полная нарезка не начата до подтверждения маленького стыка.

## 2026-10-28 — полный комплект после реального малого стыка

Lead передал подтверждение фактического Pixi-стыка starter. Прочитаны exact
`d0634841896beb7a5870356263b328fdfaac26f3` consumer `ART_INTEGRATION.md` и
`BUILDER_STATE.md`; просмотрены кадры loaded/parts-off, wood tick615 и receiver
tick2385 из runtime Builder. Это чтение результата P4; другие опыты не читались.
Реальная загрузка/регистрация starter подтверждены; полное попадание в
receiver-01 и полный Art/QA PASS этим не подтверждены. Отклонённый push Builder
не повторялся и не объявляется доставкой.

### Причина и исправление wood

Starter использовал кусок полного generated frame с отличающимися тоном и
геометрией floor seams; переход по маске был около 2px. В новом фоне каждая
область удалённого препятствия/тени согласована с исходной границей методом
Poisson NORMAL_CLONE и переходом 5px. Он переносит градиенты чистого пола,
а не сохраняет контур исходного предмета. Тело wood-01, его anchor и геометрия
не менялись. Border restoration остаётся под своей исходной foreground alpha,
чтобы сгенерированный цвет не вытекал на соседний исходный пол.

### Три генерации полного продолжения

Built-in `image_gen`, без CLI/API fallback. Все tool-managed C originals
сохранены. E-копии raw находятся в собственных runtime full-v01/full-v02;
copy2, bytes/SHA проверены, записи — raw/copy-manifest.json и provenance пакета.
Model/seed/sampler/quality генератора не раскрыты и не выдумываются.

1. Empty restoration plate, edit исходного JPG, transparent_background=false,
   output `exec-e6f738de-e5c7-41c2-9e5e-26ddc4342610.png`, 1254×1254.
   Генерация равномерно приведена к 1536² и используется только в записанных
   областях локального восстановления. RGB объектов из неё не берутся.

Точный prompt:

```text
Use case: precise-object-edit. Edit target: supplied jungle game board. Produce an EMPTY RESTORATION PLATE for extraction of the existing foreground and obstacles, not a new game board. Keep the EXACT square full-frame camera, platform shape, size, three entrance temples, landscape, light from upper right, warm stone floor and perspective. Remove ALL 25 small freestanding objects from the stone playing floor: every red flower on a round mossy base, every turquoise leaf-fan on a base, every frog statue on a base, and every teal-and-gold wooden cylindrical peg. Remove ALL their cast/contact shadows too. The entire playing floor must be empty uninterrupted matching stone paving with natural seams and moss; no pegs, no round bases, no round marks, no leftover shadows. Also remove all FOUR hanging basket receptacles below the platform including their rims, dark holes, woven bodies and feathers; restore the distant jungle/sky behind them. Preserve suspension ropes and vines wherever already visible. Remove only the large winding turquoise feathered SNAKE RAILS on the left and right edge of the playing floor, including their large near-end snake heads; restore plausible continuing stone ledge, wood/rope support or vegetation behind their silhouettes. Do not remove the entrance temples or the structural platform itself. Preserve everything else as closely as possible. We will use only locally masked restored pixels from this image behind the source-extracted sprites, so do not relocate architecture or change the floor plane. No ball, no text, no diagrams, no added furniture, no replacement obstacle set.
```

2. Own raster ball, исходный JPG только как style/light reference,
   transparent_background=true, output
   `exec-f9d50b3c-2c0a-405e-ad69-884ff688bc0e.png`, 1280×1280.
   Сохранена alpha; только равномерное уменьшение до 256². Отдельной cast shadow
   в этом файле нет. Радиус задаётся общим r16 и принятой P1, не размером canvas.

Точный prompt:

```text
Use case: stylized-concept. Asset type: ONE isolated volumetric raster game ball with genuine transparent background. The supplied jungle board is STYLE AND LIGHTING REFERENCE ONLY; do not redraw the board. Make a single perfectly round smooth warm pale amber-gold ceramic/stone sphere, compatible with the richly painted 3D jungle temple game art. Clear rounded volume, subtle natural material texture, warm soft highlight from upper right, gentle olive-brown shading on lower left and underside. Keep the silhouette circular and clean for a small gameplay sprite. One centered ball fills about 75 percent of the square canvas with transparent padding all around. No cast shadow or ground plane in this asset, because its shadow is a separate layer. No rings, pedestal, face, feathers, text, outline, symbols, glow, watermark, or other objects. Output actual alpha transparency, not a checkerboard.
```

3. Own separate ball shadow, без reference, transparent_background=true, output
   `exec-fe609b28-2a60-4548-aec2-2ec4826c1764.png`, 1280×1280.
   Сохранена исходная alpha; равномерное уменьшение до 256². Генератор дал
   пик alpha216 вместо запрошенного около35%; в manifest явно задан display
   opacityMultiplier0.42 (пик≈91), исходная alpha не переписывалась.

Точный prompt:

```text
Use case: stylized-concept. Asset type: ONE simple soft cast/contact shadow sprite, actual transparent RGBA. Create a single centered horizontal oval shadow for a small round ball on pale jungle-temple stone. Dark muted olive-brown color, semi-transparent, densest at center about 35 percent opacity, smoothly fading to fully transparent at the edge, no solid black border, no highlights. Oval long axis horizontal, width about 70 percent of square canvas, height about 30 percent. Very simple soft blurred elliptical shadow only. No ball, floor, pedestal, background, text, symbols, checkerboard or other objects. Keep enough fully transparent padding on all four sides. It will be scaled and offset separately beneath a round raster ball.
```

### Значимая первая неудача полного прохода и коррекции

Первый full-v01 имел потерю светлой крышки wood-07, отсечённый лепесток
flower-04 с остатком на фоне, лишнюю подложку у корзин и остаточные внутренние
края rail. Он не передавался как готовый комплект. Полный первоначальный
пакет сохранён в собственном runtime:
`full-v01/rejected-pass-01/`, manifest SHA256
`3cff1415b6d90334fbcdd50599f90b2a6f2321c3339cd66cace830323bf28d3e`.
Исходная неудачная статическая сборка — `full-v01/evidence/reassembled-no-ball.png`.

Full-v02: у столбиков добавлены явные foreground seeds светлых крышек;
красные лепестки помечены объектом; removal region опирается на консервативный
исходный контур, а не только на уточнённую alpha. Для wood-07 крышка дополнена
по просмотренному source crop с координатной сеткой. У остальных корзин
исходная silhouette уточнена GrabCut, без генерации новых body pixels.
Край фиксированных боковых полос дополнен исходными turquoise rail tips
с исключением областей pegs. Повторной генерации набора или скрытого reroll нет.
Существенные comparison sheets/кропы сохранены в runtime evidence, компактное
сравнение первого дефекта и исправления включено в пакет.

### Состав и предел проверки full-v02

25 pin body + 25 ground-shadow, 4 receiver rear/front = 58 частей;
3 static source foreground bands; один generated ball и отдельная shadow.
Foreground bands содержат внешнюю исходную декорацию вместе с бортами и
не выдаются за независимые перемещаемые snake-объекты. Config, физическое ядро,
проекция, native/source anchors, r16 и PRNG не менялись. Body flower-01/wood-01
и обе части receiver-01 переиспользованы побайтно из сохранённого starter.

Собственная проверка: hashes, source dimensions, 29 anchors/P1 inverse,
источник RGB тел/foreground, размеры/alpha PNG, полнота ID, просмотр чистой
подложки, контактного листа и статической обратной сборки. Preview шара
поставлен только в принятую drop-точку; траектория не придумывалась.
Это не динамический или независимый QA. Тонкие края, естественность теней,
частичные перекрытия и реальный вход в корзины подтверждаются в полном consumer.

Ресурсы повторно перед обработкой: свободно RAM16,06GiB, CPU5%,
C/D/E15,50/16,31/16,45GiB. Перед последней коррекцией:
RAM18,41GiB, CPU9%, C/D/E15,20/16,31/16,41GiB. Проходы последовательные,
ожидаемый пик до1GiB RAM/0,5GiB файлов; дефицита или порогов E не достигнуто.
Новые чаты/сотрудники/браузеры/серверы не запускались, чужие файлы не менялись.

Независимое чтение сохранённого пакета подтвердило 61 declared RGBA part,
2 actor RGBA, размеры/SHA/alpha, полноту object IDs P1 и исходные RGB у
36 source body/foreground parts. Все 11 indexed starter-файлов неизменны;
обе части receiver-01 также побайтно сохранены в новом пакете. Статические
сравнение wood и preview в принятой drop-точке просмотрены. Начальный radius
по H/r16 равен14,0742176996px. В manifest тень шара имеет явный alpha multiplier.
Финальная полная сцена Pixi/QA этим чтением не подтверждается.
