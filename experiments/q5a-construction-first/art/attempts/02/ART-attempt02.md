# Q5A: изготовление растрового арта Нэлы

25 октября 2026 года, Europe/Kyiv. Asset Artist `asset-artist-r4d-q5a-01`.

**ART_READY_FOR_CONCEPT_AND_BUILDER_REVIEW.** Выбран пакет `art/attempts/02/`, 15 зарегистрированных PNG. Это подготовленная передача на художественный/конструктивный просмотр, не приёмка движения или финального качества CTO. Clean art начат только после прямого production brief CTO и gate-коммита `d3bdf8f1cffebe2179805eeb54a8a36faab08805`, совпадавшего с HEAD и origin/main.

Основание — DESIGN.md, ART_CONSTRAINTS.md, CONSTRUCTION.md, JSON v2 и положительные construction reviews. SHA конструкции до и после работы: `70f324aa7126f7aea0eca24e42aa370b18bb48d070810f3819a5cab16116e092`. Геометрия, UV, риг, диапазоны, демо и другие документы не менялись.

## Выдача

- `art/package.json` — точный выбор, mapping 15 поверхностей, pivots и SHA-256 каждого PNG; пути относительно art/.
- `art/attempts/02/textures/` — выбранные 15 RGBA PNG 1024×1024, straight alpha, встроенный sRGB ICC.
- `art/attempts/02/preview/bind.png` — прозрачный нейтральный bind в viewport 960×640.
- `art/attempts/02/preview/contact-sheet.png` — восемь статических конфигураций в целевом масштабе: bind, low_deep, оба walk-контакта, jump_apex, jump_landing, range_reach, range_compression.
- `art/attempts/02/preview/low-deep-x2.png` — диагностический присед ×2, поле 1280×960; `surfaces.png` — все полные поверхности отдельно.
- `art/validation.json` — выполненные проверки и хеши исходных генераций. `art/attempts/01/` сохраняет первую сборку с тёмной проймой, nearest-фильтрацией и её версией обработки.
- `art/source/` — четыре исходных результата built-in и четыре точных prompts. Каждый использованный результат скопирован из generated_images в проект, оригиналы в CODEX_HOME оставлены.
- `art/reference/` — детерминированный raster bind из принятого SVG, atlas-регистрация поверхностей, mapping и фиксированный sRGB профиль. Это технические ориентиры, не замена сгенерированного арта.

## Режим и вызовы встроенного генератора

Прочитаны imagegen/SKILL.md, references/prompting.md и sample-prompts.md; использован только default built-in `image_gen.imagegen`, edit через `referenced_image_paths`, каждый раз `transparent_background=true`. Точный внутренний image-model ID инструмент не сообщил; параметры качества/модели не подменялись. API/CLI, ключи, локальные generative-модели, установка зависимостей и сторонние сервисы не использовались.

| Вызов | Входы по порядку | Сохранённый результат | Решение |
|---|---|---|---|
| 01 | reference/bind-registration.png — edit target/geometry | source/nela-01.png | Новый цельный образ, эталон внешности. Не считается метрически точной регистрацией |
| 02 | reference/surface-atlas-registration.png — edit target; source/nela-01.png — identity/style | source/nela-atlas-02.png | Единый лист 15 полных поверхностей; основной источник материала |
| 03 | source/nela-atlas-02.png — edit target; reference/surface-atlas-registration.png — geometry | source/nela-atlas-03-head-repair.png | Исправлена только задача клетки head_face: без волос и шеи. В пакет взята только эта клетка |
| 04 | source/nela-atlas-02.png — edit target | source/nela-atlas-04-armhole-repair.png | Осветлена тёмная полость проймы. В пакет взята только клетка torso_top |

Все outputs имеют фактический размер 1254×1254 и настоящую RGBA-прозрачность. Заданные в prompt 1024/2048 и точные позиции генератор не гарантировал. Поэтому отбор генерации отделён от последующей детерминированной регистрации. Edits 03/04 слегка меняли и соседние клетки: они не заменяли принятые материалы всего листа; их побочный дрейф исключён выбором одной клетки.

Исходные имена в CODEX_HOME/generated_images/01a16ffd-8810-7bd2-a3d0-6fee241915c2:

- 01: exec-e4a59b07-a69d-4752-ad5f-3114db010eee.png
- 02: exec-f744fe01-f08d-4cc2-b7a9-6cb79c1c67bf.png
- 03: exec-b2fe7e9a-c648-4121-9e12-9997c0b2dbd3.png
- 04: exec-4102247c-09d9-44ac-b744-c0639f8b731f.png

## Детерминированная подготовка и коррекции

1. reference.py читает полигоны bind-registration.svg, применяет исходные translate/scale, растеризует Pillow с трёхкратной дискретизацией и уменьшает до 1024. Служебные текст, кресты и фон не переносятся. Ориентир просмотрен перед вызовом 01.
2. atlas_reference.py размещает полные поверхности JSON в 4×4 клетки по 512 без изменения общей пиксельной шкалы; размещение обратимо через surface-atlas-map.json. Ориентир просмотрен перед вызовом 02. Это разнесение уже утверждённых материалов, не новая конструкция.
3. prepare_art.py выделяет крупнейший alpha-компонент каждой клетки при пороге 96, удаляя прозрачную пыль. Затем переносит реальные сгенерированные RGB-пиксели построчно по ширине силуэта в маску соответствующей поверхности v2. Внутренние детали могут деформироваться при таком переносе; совпадение маски не доказывает совпадения нарисованной анатомии.
4. Hidden skin берётся из полных сгенерированных голых конечностей, не из видимых обрезков цельного персонажа. Ткань торса не попадает в руку, шорты — в кожу бедра. Для pelvis_shorts используется верхняя часть сгенерированной ткани (69% высоты исходного материала), чтобы не переносить чужой нижний подол/пах. Две панели сидения остаются в одном общем поле.
5. Локальное клонирование цвета у первых/последних пяти строк кожи убирает поперечные срезы. Полоса fold_contracts с защитным полем 4 px получает широкий мягкий свет: вариация поперёк полосы смешивается на 72% с медианой текущей строки кожи. Это обработка сгенерированного материала, не создание нового рисунка программными примитивами. Внешняя геометрия и UV остаются v2.
6. На внутренних краях тканевых панелей подавлена замкнутая тёмная окантовка; сами складки/фактура взяты из генерации. Цвет дальней кожи/кистей умеренно снижен множителями RGB 0.955/0.95/0.945. Прозрачные пиксели получают RGB-запас своего материала на 4 px; альфа остаётся маской конструкции с антиалиасингом.
7. Preview читает только сохранённые poses v2. Кожа использует её постоянные треугольники/UV, остальные полигоны триангулируются в bind и переносятся по соответствующим вершинам; панели шорт раздельно. Ближняя рука разделена по постоянным root/limb draw-фрагментам, кожа ноги показывается от t=.5. Не рисуется отдельная версия тела для каждого кадра. Во втором варианте применена bilinear-фильтрация premultiplied samples с возвратом в straight RGBA.

Ни человек, ни агент не дорисовывали вручную внешний персонаж в редакторе. Агент выбирал источники, маски и параметры перечисленной обработки; художественные пиксели лица, кожи, ткани, волос и обуви создал встроенный генератор. Роль этой существенной обработки не скрывается под словом «автоматически».

## Проверки и художественная самопроверка

Проверки PASS: все 15 ID/имён, 1024×1024 RGBA, sRGB ICC, нет пустых материалов, есть alpha=0 и alpha=255, альфа каждой текстуры точно совпадает с растеризованной геометрической маской v2, pivots неизменны, SHA-256 файлов совпадают, непрозрачных чёрных дыр нет, RGB-запас по 4 px присутствует. Детальные значения и исходные хеши — validation.json. Конструкция осталась на прежней SHA. Это проверки файла и регистрации, не художественный PASS и не доказательство качества скелетной анимации.

Просмотрены каждый встроенный output, bind и весь лист восьми поз первой сборки, затем bind, low_deep ×2, весь лист восьми поз и лист отдельных поверхностей второй. Тёмная полость проймы заметно уменьшилась; вместо неё видна ткань, сохранены открытые плечо, локти и колени. Есть характерное лицо, тёплая кожа, бирюзовый топ, терракотовые шорты и низкая обувь. Нет дисков, брони, механических торцов или маскировки согнутых суставов. Первая неудача и исправленная выдача доступны для сравнения.

Остались видимые риски для Concept/Builder review: локальная фасетность/пережатие силуэта на сильном локтевом и коленном сгибе; изменение широкого света в сжатой UV-полосе; различимость соседних конечностей при совпадении; заметность границы ткани сидения/штанины; уплотнение волос и искажение мелких черт лица/кисти при подгонке к оболочке. Тонкая линия проймы сохранилась, поэтому в движении нужно проверить, не читается ли она жёсткой дугой. Сдвиг внутренних художественных ориентиров генератора не измерялся как точная анатомическая ошибка. Эти свойства не объявляются решёнными из-за PASS размеров.

Движение, непрерывность переходов, быстрые команды, контакт во времени и реальный runtime не проверены. Здесь только neutral bind и независимые крайние позы; production demo/motion не создавались. Текущий результат пригоден для следующего внутреннего просмотра, окончательную пригодность материала подтверждают Concept/Builder/QA и CTO. Внешнего инструментального блокера нет; исправление конструкции вместо арта не выполнялось.

При проверке целостности одна команда была запущена до завершения записи варианта 02 и получила несовпадение SHA. После завершения записи полная проверка повторена и прошла; промежуточный FAIL не трактуется как дефект ассетов.

## Повторение

Из D:/dev/R4D, установленными Python, Pillow и numpy; ничего не устанавливалось:

```powershell
python -B experiments/q5a-construction-first/art/scripts/reference.py
python -B experiments/q5a-construction-first/art/scripts/atlas_reference.py
python -B experiments/q5a-construction-first/art/scripts/prepare_art.py --attempt 02
python -B experiments/q5a-construction-first/art/scripts/check_art.py
python -B experiments/q5a-construction-first/art/scripts/finalize_art.py
```

Генераторные исходники уже сохранены; эти команды не вызывают imagegen и не требуют ключа. Исторический prepare_art.py в attempts/01 вместе с srgb.icc сохраняет алгоритм первой сборки; его запуск с --attempt 01 воспроизводит прежние outputs. Финальные ICC-байты фиксированы в reference/srgb.icc, а не создаются с новым временем при каждом запуске. Равенство после повторного исполнения не проверялось отдельным вторым полным прогоном; проверены сохранённые хеши и текущая регистрация.

Не выполнялись commit/push, публикация, переписка с другими чатами, изменение state/конструкции/старых опытов. Чужие dirty/untracked сохранены.

## Mapping поверхностей

| Surface ID | Выбранный файл | Генераторный источник |
|---|---|---|
| `far_leg_skin` | `art/attempts/02/textures/far_leg_skin.png` | nela-atlas-02.png |
| `near_leg_skin` | `art/attempts/02/textures/near_leg_skin.png` | nela-atlas-02.png |
| `far_arm_skin` | `art/attempts/02/textures/far_arm_skin.png` | nela-atlas-02.png |
| `near_arm_skin` | `art/attempts/02/textures/near_arm_skin.png` | nela-atlas-02.png |
| `torso_top` | `art/attempts/02/textures/torso_top.png` | nela-atlas-04-armhole-repair.png |
| `pelvis_shorts` | `art/attempts/02/textures/pelvis_shorts.png` | nela-atlas-02.png |
| `far_shorts_leg` | `art/attempts/02/textures/far_shorts_leg.png` | nela-atlas-02.png |
| `near_shorts_leg` | `art/attempts/02/textures/near_shorts_leg.png` | nela-atlas-02.png |
| `far_hand` | `art/attempts/02/textures/far_hand.png` | nela-atlas-02.png |
| `near_hand` | `art/attempts/02/textures/near_hand.png` | nela-atlas-02.png |
| `far_shoe` | `art/attempts/02/textures/far_shoe.png` | nela-atlas-02.png |
| `near_shoe` | `art/attempts/02/textures/near_shoe.png` | nela-atlas-02.png |
| `neck_skin` | `art/attempts/02/textures/neck_skin.png` | nela-atlas-02.png |
| `head_face` | `art/attempts/02/textures/head_face.png` | nela-atlas-03-head-repair.png |
| `hair` | `art/attempts/02/textures/hair.png` | nela-atlas-02.png |

## Точные prompts вызовов

### Вызов 01

```text
Use case: stylized-concept
Asset type: 2D raster game character source art for segmented skeletal animation
Input images: Image 1 is the edit target and exact geometry registration, not a style reference.
Primary request: paint Nela, an adult field botanist, directly over the supplied construction registration while preserving exact full-body right-facing profile, proportions, anatomical landmarks and silhouette. Keep this 1024x1024 canvas and the exact location and size of the figure: hair top y116, soles y900; pelvis around (512,496), near shoulder (524,248), near wrist (601,492). Do not center, zoom or re-pose.
Subject/style: warm hand-painted game illustration, clear thin outer contour, restrained soft volume, short dark wavy hair, warm living skin, teal sleeveless soft-knit top, terracotta soft mid-thigh shorts, low soft shoes, calm attentive expression. Adult compact build 6.5 heads tall. Add a human face in right profile, expressive brow and subtle half-smile, natural hands inside the supplied bounds.
Composition: full body, uncropped, exactly the neutral construction pose, genuine transparent background.
Constraints: exact construction alignment; organic living shoulder/hip/elbow/knee; consistent skin/light/contour. Replace technical fills and construction lines with finished illustration. The diagonal internal line in the shorts is a surface overlap guide, not a decorative seam. Bare arms and legs must read as continuous flesh, no transverse joint outlines. Restrained broad skin lighting at elbows/knees for deformation. No text, no prop, no bag, no watermark. Preserve genuine alpha transparency.
Avoid: robot, mannequin, joint discs, armor, pads, rigid pelvis box, black end-caps, mechanical seams, cropped limbs, extra limbs/fingers, hard sleeve/short rings.
```

### Вызов 02

```text
Use case: stylized-concept
Asset type: ONE production texture atlas of 15 separate complete raster surfaces for a 2D skeletal game character.
Input images: Image 1 is the atlas EDIT TARGET with exact 4 columns x 4 rows geometry registration; Image 2 is the supporting identity/style/color reference, Nela. Paint Image 1, do NOT replace it by a standing character. Preserve grid layout, each island's position, scale, direction and silhouette. Transparent background between islands; no grid lines or text.
Primary request: paint every isolated surface with the same warm hand-painted game illustration finish as Image 2. Complete the hidden material in each surface, not cropped visible fragments. Row1 left to right: entire FAR bare leg hip-to-ankle; entire NEAR bare leg hip-to-ankle; entire FAR bare arm shoulder-to-wrist; entire NEAR bare arm shoulder-to-wrist. Legs and arms are continuous bare skin including hidden upper thigh/shoulder, NO shorts or shirt pixels, NO shoes/hands attached. Skin has broad restrained soft volume; no black caps, no crosswise seams, no internal elbow/knee rings. Keep the slight bends and exact directions from target.
Row2: teal sleeveless soft-knit torso top with open armhole and no arms; terracotta soft shorts SEAT/waist panel only; FAR terracotta shorts thigh panel only; NEAR terracotta shorts thigh panel only. These are flat fabric surfaces matching target shapes, not separate whole shorts or legs. No extra garment pixels outside target silhouette. Quiet shading in overlap zones; do not outline hidden internal ends.
Row3: FAR hand; NEAR hand; FAR low soft shoe facing RIGHT; NEAR low soft shoe facing RIGHT. Keep target orientations, natural fingers together, no wrists added beyond target. Shoes have low opening and sole, matching olive-brown reference, no socks.
Row4: skin NECK patch; separate right-profile FACE including ear, eye and attentive half-smile, matching Nela adult face; separate short dark wavy HAIR patch without any face; final cell EMPTY transparent. Head and hair need the exact complementary target silhouette, not a whole head in each cell. No neck attached to head.
Style: adult compact female field botanist, warm skin, dark brown wavy hair, teal top, terracotta shorts, low olive-brown shoes. Consistent soft light, clear thin outer contour, finished painterly surfaces. Far surfaces just slightly darker, not black.
Constraints: 15 complete isolated surfaces in exact indicated cells. Canvas and geometry registration come from Image 1, appearance from Image 2. Preserve genuine alpha transparency. No robot, mannequin, armor, pads, discs, dark cut ends, labels, watermark, props, extra surfaces. No high contrast interior marks across elbows or knees.
```

### Вызов 03

```text
Use case: precise-object-edit
Asset type: repair ONE cell of an animation surface texture atlas.
Input images: Image 1 is the atlas edit target. Image 2 is geometry registration only.
Primary request: change ONLY row 4 column 2, the head_face cell, into a complete bare-skin right-facing profile head WITHOUT any hair and WITHOUT a neck, matching the head-face silhouette in row4 column2 of Image2. Keep Nela's same eye, eyebrow, nose, ear, calm half-smile, warm skin and hand-painted finish. The scalp is plain skin because the separate hair cell is composited over it later. Remove the neck extension below the jaw; the head ends at the jaw/chin contour. No floating hair scraps.
Constraints: Every other cell is invariant: preserve row1 legs/arms, row2 fabrics, row3 hands/shoes, row4 column1 neck, row4 column3 separate hair and empty cell4. Preserve 4x4 grid, canvas framing, positions, warm shading, and genuine transparent background. No new limbs, no text or watermark. Do not change hairstyle in the separate hair cell. Only the head_face cell is repaired.
```

### Вызов 04

```text
Use case: precise-object-edit
Asset type: one targeted material repair in a 4x4 animation atlas.
Input images: Image 1 is the edit target. Change ONLY row2 column1, the teal torso top surface.
Primary request: remove the dark hollow/cavity-looking patch inside the armhole area and replace those dark interior pixels with the same softly lit teal knit fabric as its adjacent torso. This is an animation material surface, not a hollow garment floating in space. Preserve the outside silhouette, curved armhole edge, soft knit folds and teal palette. Keep edging narrow and subtle, without dark inset fill, black hole, double rims, broad stiff rolled binding or sleeve. Leave the target's transparency outside its silhouette unchanged.
Constraints: all other cells and their positions are invariant. Same 4x4 grid and transparent background, same body and garment surfaces, same illustration finish. No text, props, watermark or new surfaces. Only replace the dark cavity shading in torso fabric; do not redesign the character.
```

