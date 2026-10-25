# P0 L1 components — фактический журнал

Дата: 25 октября 2026 года. Роль: `asset-artist-r4d-p0-perspective-01`.

## Gate и источники

- Builder contract v2, exact source commit: `606737181da71457372b0f026b4d25cced68d4ee`; локальный cherry-pick: `836800b`.
- Concept art-integration brief, exact source commit: `b807bcd53cc4baa45ef06925126256f09f99b1ac`; локальный cherry-pick: `c13aa8b`.
- Geometry control: `../d1/inputs/formal-reference-v1.png`, SHA-256 `08EBE1BD5DD7E3A60097A15C1E29E60C46C4BCF27E4BABDA730FCFFA269F723F`.
- Art reference, read-only: `K:\Agents\R4D\Assets\perspective\03-sun-temple.jpg`, SHA-256 `F5CFA2BBE8E4B49ECBC0F4C7A0CEE99842B182B56AE495979153B8FC9FF86E32`.
- Предыдущие d1/c1 сохранены как evidence, но не использовались как входы генерации или edit targets.

## Generation 1: environment/floor plate

- Инструмент: встроенный `image_gen`.
- Точный prompt: `prompts/environment-floor-plate.txt`.
- Оба изображения выше были переданы как references с зафиксированными в prompt разными ролями.
- `transparent_background=false`.
- Запрошенный размер описан в prompt как `1536 × 1536`; встроенный генератор фактически вернул `1254 × 1254` RGB.
- Model, seed, sampler, steps, CFG, quality и числовой size preset интерфейсом не раскрыты; значения не выдумывались.
- Идентификатор фактического tool output: `exec-8e4c06b1-ef49-4daf-b1be-be5c82007b94.png`.
- Сырой файл: `raw/environment-floor-plate-source.png`, SHA-256 `B3AB48BA97B415C7B9B7EBF40BA49B9D5022BD9541E88C5D7328D88F3BC5EB3E`.
- Подготовка: единый full-frame bicubic resize `1254 → 1536`, без crop и без раздельного преобразования осей. После проверки краевые полупрозрачные пиксели, появившиеся при первом ARGB-ресайзе, устранены экспортом пластины как полностью непрозрачного RGB PNG; изображение не перерисовывалось.
- Prepared: `prepared/environment-floor-plate-1536.png`, SHA-256 `DD50392203E30387C6BB0219102DA9295213B56FE89375BE6F33AED478ADE3B6`.

## Generation 2: drum master

- Инструмент: встроенный `image_gen`.
- Точный prompt: `prompts/drum-master.txt`.
- Те же два reference image и те же разделённые роли.
- `transparent_background=true`.
- Встроенный генератор фактически вернул `1254 × 1254` RGBA.
- Model, seed, sampler, steps, CFG, quality и числовой size preset интерфейсом не раскрыты; значения не выдумывались.
- Идентификатор фактического tool output: `exec-5522596b-fc36-40bc-ae76-03d72f476a8b.png`.
- Сырой файл: `raw/drum-master-source.png`, SHA-256 `4B34F18AD24540A60EB96A87E17383EE64FC63660DFF4A56F0064D563FF85629`.

Существенное исправление cutout: raw содержал слабые alpha-speckles ниже `8` за реальным объектом и почти непрозрачный интерьер `240–254`. Raw сохранён как evidence. Детерминированный скрипт:

1. обнуляет alpha `< 8`;
2. переводит alpha `≥ 240` в `255`;
3. сохраняет антиалиасный диапазон `8–239`;
4. находит bounds при alpha `≥ 8`: `(154,123)..(1099,1131)`;
5. добавляет `64 px` padding и делает crop `(90,59,1074,1137)`.

Prepared master: `prepared/drum-master-rgba.png`, SHA-256 `6318A55C01B3116678445604440113D4E450489DB9BFC3B0AC2F1839C52BB878`. Base-center anchor: `(537,1072)` в prepared pixels, центр нижнего видимого края основания под осью объекта.

## Отдельная shadow layer

`prepared/drum-shadow-rgba.png` создана детерминированно скриптом, не генерацией: мягкая падающая тень вправо-вниз и плотная contact-часть. Canvas `1074 × 1137`, anchor `(537,1072)` совпадает с drum master. SHA-256 `0D25B1A01FB17F2875254D80155F62A2173CAEE5FD4D13FC6F6762BBB02D45E8`.

## Показательные проблемы и границы

- В raw drum был слабый мусор alpha; исправление описано выше и воспроизводимо, raw не скрыт.
- Первый технический export environment дал `6140` полупрозрачных крайних пикселей; исправлен только формат экспорта, итог имеет alpha `255` во всех `2359296` пикселях.
- Генеративный plate визуально следует formal frame, seams и центральной оси, но это не доказательство пиксельного совпадения quad. Точную проверку выполняет Builder на L1 overlay; transform всего кадра или новая камера здесь не применялись.
- Ни одна отдельная камера задним числом не выбиралась. Четыре экземпляра, horizontal `p`, L1 composite и global redraw не создавались.
- Дополнительных генераций после этих двух component sources не было.
