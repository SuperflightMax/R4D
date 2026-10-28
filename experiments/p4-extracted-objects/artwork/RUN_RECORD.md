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
