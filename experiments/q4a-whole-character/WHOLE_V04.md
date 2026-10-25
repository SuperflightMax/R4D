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
