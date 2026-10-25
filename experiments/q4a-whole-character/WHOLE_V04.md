# Whole-v04 — цельный pose reference перед генерацией

25 октября 2026. Прямое решение CTO после `182a3e9`: correction02 SOURCE_POSE_FAIL принят; текстовые edit-попытки raw-v03 закрыты, критерии не ослаблять. Разрешён качественно другой способ задания позы: один заранее согласованный технический **WHOLE pose reference**, correction02 — только identity/style/garment reference. Это та же Q4A, не parts-first.

## Сохранность и владение

Все v01–v03/correction01–02/evidence01–05 frozen. Чужие dirty/untracked не трогать, новых чатов/subagents/worktree/clone/credentials/payments/локальной AI-инфраструктуры нет. Только Lead stage/commit/push завершённых P и G gates.

| Участник | Владение whole-v04 |
|---|---|
| Lead | Этот brief, TEAM.md, README.md, координация и доставка |
| Concept | `concept/whole-v04/`: короткий pose brief, личный просмотр guide и source |
| Builder | `builder/whole-v04/`: единый guide SVG/PNG и его техническое описание, личные guide/source reviews и read-only alpha gap/sole проверка; никаких app/build/rig |
| Asset | `art/whole-v04/`, `tools/art/whole_v04/`: личное guide agreement, один full raw whole после старта G, prompt/условия/provenance, диагностические фоны, личный source review |
| Technical QA / Visual QA | Не возобновлять: кандидата нет |

## Этап P — общий guide до генерации

Concept и Builder совместно задают **один связный цельный манекен/silhouette** на холсте1024×1536, техническая болванка SVG/PNG, не чистовой арт, не набор деталей и не будущие маски. Concept сначала фиксирует короткое намерение позы/анатомии; Builder создаёт guide по этому brief. Координаты guide служат только расположению всего тела и negative space, не будущему rig. Удобные поля, человеческая стойка, без T-pose/робота.

- Right-facing умеренный nearly-profile без foreshortening.
- Естественное shoulder attachment; вся near arm-chain ниже deltoid/axilla уходит вперёд в открытый фон. Читаемый прозрачный wedge между upper-arm/forearm и torso; elbow явно правее всего tank outline. Дельту не отрывать, плечо не вывихивать.
- Far arm назад, вне pelvis/shorts/thigh.
- Две полные hip→knee→ankle→shoe цепи естественно разнесены; обе плотные подошвы на одной горизонтали, обувь не сдвигать отдельно от цепи. Мягкие колени, органическая спокойная стойка.

Все трое **лично смотрят** итоговый guide до генерации. Если он неестественен или недостаточно задаёт просвет/опору — исправляется именно guide до фиксации. Asset явно подтверждает: guide задаёт только pose/negative space, не будущие маски. После трёх явных согласий Lead публикует P и даёт старт G. Планирование guide не разрешает parts-first.

## Этап G — один новый full whole

После pushed P Asset делает ровно **ОДИН** новый whole-v04 вызов по отдельному старту Lead. Два references: `art/whole-v03/raw/whole-v03-correction02.png` — только лицо/возраст/палитра/профессиональные fitted mid-thigh running shorts/art style; согласованный guide — только расположение всего тела/negative gaps. Новый цельный adult athletic character для2D animation, transparent background, не edit отдельных limbs и не parts sheet. Нейтральная спортивная одежда, без повторения сексуально маркированных формулировок. Никакой локальной AI-инфраструктуры.

Raw `art/whole-v04/raw/whole-v04.png` сохранить без обработки **до** производных, точные prompt/условия/references/provenance рядом. Затем только диагностические light/dark/checker того же raw. При блоке/ошибке сохранить факт и остановиться без автоматических повторов. Предыдущие материалы immutable.

## Source gate троих

Лично посмотреть raw/light/dark/checker и сохранить отдельные `SOURCE_REVIEW.md` в своих зонах:

1. Identity/art/fitted garment/ракурс accepted.
2. После естественного shoulder attachment near arm не лежит на tank/abdomen. Gap визуально читается **и проверяется alpha**, не только взглядом. Builder делает read-only проверку реального фонового коридора по raw без изготовления масок/частей; допустимое крепление и свободная цепь различаются явно.
3. Dense sole rows отличаются **не более4 raw px**, обе подошвы визуально плоские на общей опоре. Слабый alpha-шум не считать опорой; показать окна/пороги/строки.
4. Ноги/hip/thigh contours пригодны к semantic cut, швы shorts ясны, loose flaps нет. Не навязывать модель будущей деформации.
5. Потенциальные shoulder/hip hidden zones объяснимы без decorative cover.

Если FAIL — сохранить конкретную причину, не генерировать v05 автоматически и не менять gate. Если PASS — передать CTO точный source gate и предложение **одного раннего shoulder/hip slicing test**; сам тест/части до отдельного решения не начинать. Parts/masks/rig/full motion/QA/release/Q2A закрыты. Завершённый G — commit/push и CTO.

Текущий статус: P разрешён, guide ещё не создан/согласован. G не начат.

## P: первая версия guide возвращена на анатомическую коррекцию

PNG `10e2eb81c2dd0fe47917dd98107d3b58ac73f7f585ba316e5a23451dbc662e2c` лично посмотрели все трое и Lead. Builder/Asset приняли техническую позу, но Concept дал `GUIDE_CORRECTION_REQUESTED`: высокие колени/длинные голени и короткое ближнее предплечье относительно верхней руки. Просветы, живое плечо и общая опора читаются; исправляются пропорции **самого цельного guide** до freeze с сохранением удачных отношений. Точный review — `concept/whole-v04/POSE_GUIDE_REVIEW.md`.

P пока не принят и не опубликован, G не открыт. После правки нужны личные просмотры и явные согласия троих на новый PNG hash; прежнее согласие Asset не переносится автоматически. Никаких чистовых частей/масок/рига или новых imagegen-вызовов.

## P завершён: исправленная версия согласована и frozen

Все трое лично посмотрели исправленный PNG и явно согласовали **одну версию**: [Concept](concept/whole-v04/POSE_GUIDE_REVIEW_V02.md), [Asset](art/whole-v04/POSE_GUIDE_REVIEW_V02.md), [Builder](builder/whole-v04/POSE_GUIDE_REVIEW.md). Lead повторно лично посмотрел итоговый PNG, сверил его hash с тремя reviews. Замечания к пропорциям устранены достаточно для технической позы; живое плечо/просветы, elbow вне tank, полные ноги/мягкие колени/общая опора и поля сохранены. Guide не является художественным source PASS или будущими масками/частями.

- Frozen reference: [pose-guide.png](builder/whole-v04/pose-guide.png), 1024×1536, SHA256 `6288eecc6d28d73b1750d07db97d056e21b708ad019bb6f3d62fb8fbd657b47e`.
- [SVG](builder/whole-v04/pose-guide.svg): SHA256 `256481736d2a1524d44e59844f98501844ffd689bbb59fa28fe1f0870ba295ae`.
- [Описание](builder/whole-v04/POSE_GUIDE.md), [alpha/sole проверка](builder/whole-v04/GUIDE_CHECK.json): расширяющийся реальный gap; dense sole rows1451/1451 при alpha≥128 и1450/1450 при alpha≥250. Это числа guide, не нового raw.
- Первая версия и замечания сохранены отдельно: `pose-guide-v01.svg/.png`, первоначальные Concept/Asset reviews, [история точного восстановления](builder/whole-v04/POSE_GUIDE_HISTORY.md). Замечания Concept не стёрты и не превращены задним числом в согласие v01.

После успешного commit/push этого P Lead разрешает G: **один** новый full whole-v04 вызов с ровно двумя раздельными references по brief выше. Asset получает отдельное сообщение старта после подтверждённого push. Frozen guide/исторические raw не менять. До source gate никаких частей/масок/рига; при неуспехе v05 не назначать автоматически.

## G завершён: SOURCE_POSE_FAIL по пунктам2 и3

P опубликован `5aa3b2d05713759cbd0c4c1f0e7791a948e2f560`; только после подтверждённого push Lead дал отдельный старт G. Asset выполнил **ровно один успешный full whole-v04 вызов** с двумя references установленного назначения. [Raw](art/whole-v04/raw/whole-v04.png) сохранён без обработки до производных, [prompt](art/whole-v04/raw/whole-v04-prompt.txt)/[условия и provenance](art/whole-v04/raw/whole-v04-conditions.md)/[диагностика Asset](art/whole-v04/raw/whole-v04-diagnostics.json) рядом. Отдельные композиции того же raw: [light](art/whole-v04/previews/whole-v04-light.png), [dark](art/whole-v04/previews/whole-v04-dark.png), [checker](art/whole-v04/previews/whole-v04-checker.png).

Все трое лично посмотрели четыре изображения: [Concept](concept/whole-v04/SOURCE_REVIEW.md), [Asset](art/whole-v04/SOURCE_REVIEW.md), [Builder](builder/whole-v04/SOURCE_REVIEW.md). Единогласный итог **SOURCE_POSE_FAIL**. Lead также лично посмотрел raw/три фона и независимо повторил ключевые alpha/sole измерения без записи в исходник.

| Пункт source gate | Получено |
|---|---|
| 1. Identity/art/fitted garment/ракурс | Принимаются: узнаваемый Мирон, полноценный raster art, закрытые облегающие шорты до середины бедра, почти-профиль |
| 2. Near arm после естественного attachment | **FAIL.** Верхняя рука ниже дельты продолжает перекрывать майку; guide-клин не воспроизведён. Свободное предплечье не заменяет просвет всей цепи |
| 3. Dense soles≤4rawpx и плоская опора | **FAIL.** Last rows1469/1464 при alpha≥128 (5px),1468/1461 при alpha≥250 (7px). Допуск4 не округлён и не ослаблен |
| 4. Hip/thigh contours, швы, безflaps | По статическому виду принимаются; две ноги/объёмы и швы читаются, looseflaps нет. Модель нарезки/деформации не назначена |
| 5. Hidden zones | Названы по смыслу, декоративных накладок нет. Невидимые поверхности не объявлены готовыми частями/patch |

### Проверка именно raw, не guide

[Builder RAW_CHECK.json](builder/whole-v04/source/RAW_CHECK.json) и [read-only код](builder/whole-v04/source/check_source.py) содержат окна/пороги/строки, семантические пары «майка→кожа upper-arm» и alpha-интервалы. На rows400/420/440/460/480 между визуально определёнными точками майки и верхней руки минимальная alpha253, максимальная253–254; alpha0 count0 во всех пяти сечениях. Это плотное продолжение материала ниже компактного плечевого крепления, а не фоновый коридор. На row480 при alpha≥128 torso+near-arm образуют единый interval397..702; отдельный правый gap появляется лишь ниже, у локтя/предплечья. Пустой внешний фон справа не засчитан за внутренний wedge. Concept независимо измерил сечения и подошвы, не заимствовал числа Builder.

Lead повторно прочитал пять contact-probes по raw и получил те же minima/maxima; по двум раздельным окнам получил dense rows1469/1468 и1464/1461. Слабые alpha1 экстремумы не принимались за плотную подошву. Эти измерения не являются производственными масками, будущими joints или контактной моделью рига.

### Сохранность и передача CTO

Lead проверил SHA256 raw и оригинала imagegen: оба `56947ae376af812075e42f23d2c874ef1c9f30de6f51718700f4376cfae38bb3`. Оба reference неизменны: guide `6288eecc…657b47e`, correction02 `ed40c54d…5c11e4a`. На реальных композициях нет сплошного коричневого фона; hiddenRGB raw viewer не объявлялся сценой. Слабая периферийная alpha не очищалась. Старые v01–v03/correction01–02/evidence01–05 и frozen P сохранены, чужие dirty/untracked не изменены.

**Разрешённые P и G выполнены. Source gate не пройден, accepted whole нет.** Эта одна попытка переноса согласованной whole-позы с отдельным identity/style/garment reference не дала двух обязательных свойств. Это не доказательство невозможности whole-метода вообще; причину того, почему генератор не сохранил позу, не выдаём за установленную. Нового v05, ослабления критериев, частей/масок/рига/нового app/build/движения/QA/release/Q2A нет. Low/shoulder/hip/ткань в движении не проверены. Предложение раннего slicing test не активируется при source FAIL. Следующий предметный шаг — только прямое решение CTO по сохранённому gate.
