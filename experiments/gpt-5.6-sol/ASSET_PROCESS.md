# Подготовка ассетов: «Небесный курьер»

## Результат

Оригинальный персонаж первого прохода — молодая небесная курьер-механик в
строгом правом профиле. Узнаваемые детали: авиаторская шапка с латунным
наушником и очками, красный шарф, охристая куртка с компасом, тёмно-синие
брюки, кожаная сумка и высокие шнурованные ботинки.

Готовые игровые PNG лежат в `assets/`: цельный эталон
`sky_courier_master.png`, десять отдельных деталей в `assets/parts/`,
манифест `assets/manifest.json` и проверочный лист
`assets/preview_contact_sheet.png`. Необработанные результаты генератора
сохранены в `assets/source/`.

## Учёт времени

- Начало зафиксированного производственного интервала: 2026-10-22 23:37:53
  (UTC+03:00), время появления результата первой генерации.
- Окончание: 2026-10-22 23:54:46 (UTC+03:00).
- Длительность измеряемого активного интервала: 16 минут 53 секунды.
- В интервал входит генерация, отбор, техническая альфа-нарезка, визуальная
  проверка и документация. Подготовительное чтение инструкций до появления
  первого результата в этот измеряемый интервал не включено.

## Хронология и отбор

1. Первая генерация дала сильный законченный образ, но фон оказался тёмным
   градиентом вместо хромакея, а ноги были слегка развёрнуты. Дизайн принят как
   художественное направление, сам файл не включён в проход.
2. Корректирующая генерация сохранила персонажа и усилила профиль. Генератор
   снова не выполнил требование плоского фона. Этот вариант выбран цельным
   эталоном и сохранён как `assets/source/sky_courier_master_generated.png`.
3. На основе эталона сгенерирован разнесённый лист деталей с дорисованными
   круглыми запасами под плечами, локтями, шеей и бёдрами. Из него взяты голова,
   торс, четыре части рук, шарф и сумка. Исходник сохранён как
   `assets/source/sky_courier_parts_generated.png`.
4. Отдельная итерация ног была нужна потому, что первый лист смешал варианты
   брючин и ботинок. Генератор не дал надёжные отдельные пары бедро/голень, но
   дал две применимые цельные ноги от бедра до ботинка. Они сохранены как
   `leg_near.png` и `leg_far.png`; исходный лист —
   `assets/source/sky_courier_legs_generated.png`.
5. Критерии отбора: законченный игровой образ; читаемый правый профиль;
   одинаковые контур, свет и палитра; наличие ближних и дальних конечностей;
   дорисованные округлые зоны перекрытия; отсутствие обрезанных ботинок и рук;
   возможность отделить художественные острова без дорисовки видимой формы.

## Точные промпты генерации

Все четыре вызова выполнены встроенной генерацией изображений. Второй вызов
использовал первый результат как изображение-референс; третий — второй; четвёртый
— цельный эталон и лист деталей.

### 1. Цельный персонаж

```text
Use case: stylized-concept
Asset type: production-ready 2D game character master artwork for skeletal cutout animation
Primary request: Create one original full-body character: a nimble sky-courier mechanic, strictly exact side profile facing right, standing in a neutral animation-ready pose. The character is a polished, appealing game hero, not a mannequin.
Scene/backdrop: perfectly flat solid #00ff00 chroma-key background for local background removal. One uniform color only, no floor, no shadow, no gradient, no texture.
Subject: adult human courier with a compact aviator cap and round brass ear-piece, short contained dark hair, expressive profile face with one visible eye and strong readable nose/chin silhouette; ochre short jacket over a cream undershirt, dark navy trousers, sturdy rust-brown boots, red scarf tied close behind neck, small brass compass badge, compact leather cross-body satchel resting at the far hip. Both arms and both legs must be present and readable in strict side view: near limbs visually distinct from far limbs through controlled value differences, with the far arm and far leg still clearly visible behind. Arms relaxed with slight bends, hands closed in simple glove shapes. Feet point right. No weapon.
Style/medium: high-end hand-painted 2D game illustration, clean animation-friendly cel-painted shapes, subtly textured brushwork, crisp dark warm outlines, coherent silhouette, production sprite quality.
Composition/framing: single character centered, full body completely visible from scarf tip to boot soles, generous empty chroma padding on every side, no cropping. Orthographic side elevation with no three-quarter view, no foreshortening, no camera perspective.
Lighting/mood: soft upper-left key light, restrained shading that remains consistent across all body parts, adventurous and friendly.
Color palette: ochre, cream, dark navy, rust brown, brass gold, small red scarf accent. Do not use green anywhere in the character.
Animation construction constraints: shoulder, elbow, wrist, hip, knee, and ankle locations must be visually clear. Clothing cuffs should naturally hide seams. Torso and pelvis shapes should be broad enough to overlap rotating limbs. Limbs use rounded joint silhouettes. Avoid fine flyaway hair and semi-transparent materials.
Constraints: exactly one character, strict right-facing profile, fully opaque subject, flat #00ff00 only outside the subject, no cast shadow, no contact shadow, no reflection, no text, no labels, no watermark, no logos, no extra props, no environment, no duplicate body parts.
Avoid: front view, three-quarter view, spread-sheet layout, pose sheet, action pose, crossed limbs, hands hidden behind torso, cropped boots, realistic photo, 3D render, geometric dummy.
```

### 2. Коррекция профиля и фона

```text
Use case: precise-object-edit
Asset type: corrected production master for a 2D skeletal-animation game character
Input images: Image 1 is the character identity and costume reference.
Primary request: Recreate the exact same sky-courier woman from Image 1 with the same face, aviator cap, brass earpiece and goggles, red scarf, ochre cropped jacket, cream shirt, dark navy trousers, gloves, boots, leather satchel, compass badge, palette, linework and painterly cel-shading. Change the pose into a true orthographic side elevation facing right, suitable for a 2D cutout puppet.
Composition/framing: full body, head-to-boots fully visible, centered with generous padding. Head, ribcage, pelvis, knees and feet all aligned in strict profile. Both feet point exactly right. No three-quarter turn. Far arm and far leg sit behind the near limbs but are offset slightly enough to remain identifiable. Arms hang with a small natural bend and do not cross the torso. Hands are visible.
Scene/backdrop: replace the entire background with one perfectly uniform flat solid #00ff00 chroma key. No black, no vignette, no glow, no halo, no shadow, no floor, no gradient, no texture.
Animation construction: make shoulder, elbow, wrist, hip, knee, ankle placements clear; rounded joint contours; jacket and trouser cuffs provide overlap cover; fully opaque character; clean silhouette.
Constraints: preserve character identity and all costume design; exactly one character; no added or removed accessories; no text; no watermark; no environment. Do not use green within the character.
Avoid: three-quarter view, front view, perspective, crossed limbs, merged legs, hidden hands, action pose, crop, duplicate parts.
```

### 3. Разнесённый лист деталей

```text
Use case: identity-preserve
Asset type: source art sheet for a 2D cutout skeletal puppet
Input images: Image 1 is the exact character reference. Preserve her identity, profile face, proportions, outfit design, materials, palette, warm dark outlines, painterly cel shading, and upper-left light.
Primary request: Produce a clean exploded paper-doll parts sheet of this same right-facing sky-courier, with each opaque body piece fully drawn and spatially separated so no pieces touch or overlap.
Required isolated pieces, exactly once each:
1. complete head plus aviator cap, hair and brass earpiece, strict right-facing profile, with a short rounded neck plug extending downward;
2. torso plus jacket, cream shirt and pelvis/waist as one solid piece, strict right-facing side view, with rounded shoulder sockets and rounded hip overlap areas fully painted;
3. near upper arm with ochre jacket sleeve and rounded shoulder/elbow overlap ends;
4. near forearm plus brown glove, cream cuff and rounded elbow overlap end;
5. far upper arm, same design but slightly darker, rounded ends;
6. far forearm plus glove, slightly darker, rounded end;
7. near thigh in navy trousers with rounded hip and knee overlap ends;
8. near shin plus complete rust-brown boot pointing right, rounded knee overlap end;
9. far thigh, slightly darker, rounded ends;
10. far shin plus complete boot pointing right, slightly darker, rounded end;
11. red scarf knot and two short tails as one separate opaque decorative piece;
12. leather satchel with strap as one separate opaque piece.
Layout: arrange all twelve pieces in neat spacious rows like a professional animation production parts sheet. Every piece fully visible with at least 40 pixels of plain background between pieces. No labels, no arrows, no guides, no assembled character, no duplicate pieces.
Scene/backdrop: perfectly flat uniform vivid cyan #00ffff background. No black, no green, no vignette, no gradient, no glow, no shadows, no texture, no floor.
Construction constraints: hidden regions under cuffs and joints must be fully painted; overlap plugs should extend roughly 15 percent beyond the visible seam; rounded joint ends; consistent scale between matching limb segments; fully opaque art; crisp clean silhouette; no holes.
Constraints: preserve exact character design from Image 1; strict side-view anatomy; no text, no watermark, no logo, no extra props. Do not use cyan anywhere in the character.
Avoid: assembled pose, mannequin diagram, three-quarter view, front-facing parts, touching pieces, cropped parts, missing far limbs, skeletal bones, geometric primitives.
```

### 4. Дополнительная итерация ног

```text
Use case: identity-preserve
Asset type: supplemental production art sheet containing only leg segments for the same 2D skeletal puppet
Input images: Image 1 is the assembled sky-courier identity/costume reference; Image 2 is her generated parts-sheet style and scale reference.
Primary request: Create exactly four separate, fully painted, opaque leg segment sprites for the same right-facing sky-courier woman. Nothing else.
Required pieces:
1. near thigh only: dark navy trouser fabric from rounded hip overlap plug to rounded knee overlap plug; side-profile anatomy, slightly forward-curved, no boot and no lower leg;
2. near lower leg plus complete rust-brown lace-up boot pointing exactly right: rounded knee overlap plug at top, navy trouser fabric through shin into boot cuff, full boot and sole visible;
3. far thigh only: same design, subtly darker/lower contrast, rounded hip and knee overlap plugs, no boot and no lower leg;
4. far lower leg plus complete boot pointing exactly right: subtly darker/lower contrast, rounded knee plug, full boot and sole.
Layout: all four components vertical and upright in one horizontal row, equal scale, generous space between every part, no touching, no overlap, no labels. Thighs and lower legs should have compatible width at the knee. Hidden overlap plugs extend about 15 percent beyond the visible seam and are fully painted with rounded contours.
Style: exactly match Image 2 warm dark outline, hand-painted cel shading, navy cloth, rust leather, brass buckle details, upper-left light.
Scene/backdrop: one perfectly flat solid light gray #e8e8e8 background only. No vignette, no gradient, no glow, no shadows, no floor, no texture.
Constraints: strict orthographic right-facing profile, exactly four pieces, fully opaque art, no cyan or green in character, no text, no watermark, no other body parts, no full assembled leg, no duplicate pieces.
Avoid: long unsegmented full legs, feet facing camera, three-quarter view, cropped soles, bare skin at joints, mannequin shapes.
```

## Техническая нарезка и альфа

- Генератор во всех итерациях проигнорировал требование плоского хромакея и
  создал тёмный градиент со свечением. Поэтому простой выбор цвета не применялся.
- Для каждого нужного острова задана ограничивающая область. Контур найден по
  реальному тёмному абрису изображения (Canny + замыкание), фон внутри области
  отделён GrabCut, а маска пересечена с внешним художественным контуром.
- Закрыты только небольшие ложные отверстия в светлых участках (глаз, кожа,
  латунь). Альфа слегка сглажена (`sigma 0.55`), затем деталь обрезана с десятью
  прозрачными пикселями запаса.
- У сумки отдельно очищен прозрачный просвет внутри ремня мягкой полигональной
  маской. Это правка альфы, не дорисовка изображения.
- У ближнего предплечья локально восстановлена альфа внутри сгенерированного
  круглого локтевого запаса; его RGB-пиксели уже присутствовали в исходнике.
- Видимые RGB-пиксели героя, одежды, конечностей и декора происходят только из
  генерации изображений. Кодом ничего художественного не рисовалось.
- Ручной пиксельной дорисовки или перерисовки видимого арта не было.
- Человеческое вмешательство: **ноль**. Промпты, отбор и технические операции
  выполнил агент Asset Artist.

## Проверка

- Каждый рабочий PNG открыт через Pillow как `RGBA`.
- У каждого файла диапазон альфы `0..255`, прозрачные углы и непустая видимая
  область.
- Размеры и альфа проверяются повторно после записи манифеста.
- Все детали визуально осмотрены вместе на светло-серой шахматной подложке в
  `assets/preview_contact_sheet.png`.

## Известные ограничения и указания Builder

- `leg_near.png` и `leg_far.png` — цельные ноги. Вращать их от бедра; не делать
  отдельный изгиб колена без новых художественных деталей.
- Детали с разных генерационных листов не имеют гарантированно единого
  пиксельного масштаба. Сначала нормализовать их относительно цельного эталона,
  затем один раз зафиксировать масштаб и смещения рига.
- Дальние конечности художественно очень близки к ближним. Их читаемость в
  основном обеспечивается слоями и небольшим снижением яркости/масштаба в риге;
  сильную перекраску применять не стоит.
- Круглые телесные вставки на плечах, локтях, шее и бёдрах намеренно видимы в
  отдельных PNG. В собранном персонаже их надо закрывать манжетами и соседними
  деталями, оставляя запас под вращение.
- Сумку лучше привязать к `torso` и дать небольшое запаздывающее качание. Шарф
  крепить узлом к шее; хвосты уже направлены назад.
- Альфа получена с исходника на тёмном свечении. На очень светлом фоне по краю
  местами возможен тонкий тёмный ореол; на игровом фоне среднего тона он почти
  не заметен.
- Над круглым запасом `forearm_near.png` остаётся тонкая дуга исходного тёмного
  контура. В штатной сборке она должна целиком уйти под `upper_arm_near.png`;
  при слишком малом перекрытии будет заметна.
- Цельный эталон нужен как визуальная цель, а не как скрытый слой готового
  персонажа.

---

## Исправление после двух QA: `pass1-candidate-1-qa-fix`

Этот раздел дополняет, а не заменяет историю кандидата 1 выше. Оба QA отклонили
первый комплект из-за видимых телесных дисков, цельных ног и слоя сумки поверх
живота.

### Дополнительное время

- Начало измеряемого интервала исправления: 2026-10-23 00:22:34 (UTC+03:00).
- Окончание: 2026-10-23 00:41:25 (UTC+03:00).
- Дополнительная длительность: 18 минут 51 секунда.

### Что изменено

1. Через image generation создан новый торс без телесных дисков: высокий
   воротник, непрозрачный охристый плечевой окат и широкие тёмно-синие тазовые
   лопасти. Первая версия случайно сохранила целый рукав, поэтому выполнена ещё
   одна узкая итерация, убравшая рукав и оставившая только компактный тканевый
   окат. Оба результата сохранены в `assets/source/`; активен второй.
2. Создана новая ближняя пара `thigh_near.png` + `shin_near.png`. Это реальные
   разные сгенерированные острова: бедро заканчивается у колена, голень начинается
   у колена и содержит полный ботинок.
3. От ближней пары отдельной генерацией получена согласованная дальняя пара
   `thigh_far.png` + `shin_far.png`, изначально темнее и с меньшим контрастом.
4. Дальние рука и предплечье дополнительно затемнены умножением RGB на `0.93`;
   альфа и форма не менялись. Это техническая цветокоррекция реально
   сгенерированных деталей, а не новая рисованная форма.
5. Исходная сумка кандидата 1 разделена альфа-масками на
   `satchel_body.png` (за корпусом) и `satchel_strap.png` (поверх одежды).
   Видимые пиксели и дизайн сумки не перерисовывались.
6. Из нового торса сделан `collar_cover.png`: тот же холст и тот же transform,
   но видима только верхняя одежда. Он рисуется поверх головы и гарантированно
   закрывает шейный запас без перестановки всего торса над лицом и волосами.
7. Старые цельные ноги, цельная сумка и исходный торс не удалены. Рабочие копии
   кандидата 1 сохранены в `assets/source/candidate1_*.png`; старые
   `parts/leg_near.png`, `parts/leg_far.png` и `parts/satchel.png` оставлены как
   неактивные и перечислены в `legacyCandidate1Parts` манифеста.

### Точные новые промпты

Все четыре дополнительных вызова выполнены встроенной генерацией изображений с
референсами из прохода и с запросом настоящей прозрачности.

#### 5. Торс с закрытыми суставами

```text
Use case: precise-object-edit
Asset type: replacement torso sprite for a 2D cutout skeletal game character
Input images: Image 1 is the current isolated torso sprite and exact edit target. Image 2 is the assembled character identity, costume, profile, palette, linework and lighting reference.
Primary request: Recreate Image 1 as the same right-facing sky-courier torso, preserving the ochre cropped jacket, cream shirt, navy waistband/pelvis, compass badge, belts, warm dark outline, painterly cel shading and exact character proportions. Correct only the joint-cover construction so no beige skin-colored socket discs are visible in the finished torso sprite.
Required construction changes:
- At the neck, build a tall opaque ochre-and-cream collar opening that overlaps upward and will cover the head's rounded neck plug from the front and both sides through approximately plus/minus 25 degrees of head rotation. No beige neck disc belongs in the torso.
- At both shoulder sockets, replace the beige circles with fully painted ochre jacket sleeve-cap fabric. Each rounded sleeve cap must extend outward enough to cover an upper-arm plug behind it through approximately plus/minus 55 degrees of arm swing. No skin-colored shoulder circle remains visible.
- At both hip sockets, replace beige circles with fully painted dark navy trouser/waist fabric and jacket hem overlap. The torso/pelvis silhouette must cover thigh plugs behind it through approximately plus/minus 50 degrees of leg swing. No beige hip circle remains visible.
- Keep the openings and overlaps broad, rounded and opaque; clothing edges, not skin discs, define the visible silhouette.
Scene/backdrop: genuinely transparent background with preserved alpha; no colored backdrop, glow, shadow, floor, checkerboard rendering or halo.
Composition/framing: one isolated torso sprite only, strict orthographic right-facing side view, generous transparent padding, fully visible, no head, no arms, no legs, no bag, no scarf.
Constraints: change only joint-cover construction; preserve exact costume design, compass badge, belts, colors, materials, light direction and style; no skin discs; no labels; no guides; no text; no watermark.
Avoid: mannequin sockets, beige circles, exposed ball joints, full character, duplicate parts, three-quarter view, geometric placeholder shapes.
```

#### 6. Ближние бедро и голень

```text
Use case: identity-preserve
Asset type: near-leg production sprites for a 2D cutout skeletal game character
Input images: Image 1 is the exact sky-courier identity, costume, proportions and assembled leg reference. Image 2 is the exact painterly cel style, navy trouser fabric, rust leather boot, warm outline and overlap-plug construction reference.
Primary request: Create exactly TWO isolated right-facing side-profile sprites for the NEAR leg of the same sky-courier, separated at the knee for believable skeletal animation.
Piece A — THIGH ONLY: navy trouser fabric from a broad rounded CLOTH-COVERED hip overlap at the top to a broad rounded NAVY-CLOTH knee overlap at the bottom. It must stop at the knee. No shin, no boot, no skin-colored circle. Natural slightly forward-curved thigh silhouette. The hip plug and knee plug are both dark navy fabric, fully painted, and extend 18 percent beyond their intended seams.
Piece B — SHIN PLUS COMPLETE BOOT ONLY: begins at a broad rounded dark-navy-cloth knee socket at the top, continues through the lower trouser leg and boot cuff, and ends in the complete rust-brown lace-up boot and sole pointing exactly right. No thigh, no hip, no skin-colored circle. The top knee overlap matches Piece A in width and curvature and extends 18 percent beyond the seam.
Scale/compatibility: Piece A and Piece B are shown at the same pixel scale. When their knee centers overlap, the full leg has the same proportions as Image 1. The thigh length and knee location must be anatomically plausible; do not make either piece a full leg.
Layout: Piece A alone on the LEFT; Piece B alone on the RIGHT; upright vertical orientation; at least 120 transparent pixels between them; neither piece touches or overlaps the other; both fully visible with generous padding.
Style/medium: exactly match the hand-painted 2D game art, crisp warm dark outlines, subtle cloth wear, rust leather, brass buckle details and upper-left lighting of the references.
Scene/backdrop: genuinely transparent background with preserved alpha; no color backdrop, no glow, no floor, no shadow, no checkerboard rendering.
Constraints: exactly two pieces; strict orthographic right-facing profile; fully opaque artwork; no labels, no arrows, no text, no watermark, no other body parts, no duplicate pieces.
Avoid: full unsegmented leg, thigh connected to boot, beige joint discs, bare knee skin, mannequin parts, front-facing boot, three-quarter perspective, cropped sole.
```

#### 7. Дальние бедро и голень

```text
Use case: identity-preserve
Asset type: far-leg production sprites for the same 2D cutout skeletal game character
Input images: Image 1 is the exact accepted near-leg two-piece sheet and the required geometry/scale/style reference. Image 2 is the sky-courier identity and costume reference.
Primary request: Create the matching FAR-leg pair for the same character. Preserve Image 1's exact segmentation, proportions, knee-center compatibility, right-facing profile, navy trouser construction, boot design, outline language and pixel scale. Produce exactly two isolated pieces: FAR THIGH ONLY on the left, and FAR SHIN PLUS COMPLETE BOOT ONLY on the right.
Far-limb differentiation: render the entire far pair approximately 15 percent darker and slightly lower in highlight contrast than Image 1, while preserving navy fabric, rust-brown leather and brass identity. The far pair must clearly sit behind the near pair without looking like a different costume or a grayscale copy.
Construction:
- Far thigh has a broad rounded dark-navy-cloth hip overlap at top and matching dark-navy-cloth knee overlap at bottom; no shin, no boot, no beige disc.
- Far shin begins with the matching rounded navy-cloth knee overlap, continues through lower trouser leg and the complete rust-brown lace-up boot pointing exactly right; no thigh, no hip, no beige disc.
- Both knee plugs extend 18 percent beyond the intended seam and match each other in width and curvature.
Layout: thigh alone on LEFT, shin-plus-boot alone on RIGHT, upright, same scale as Image 1, at least 120 transparent pixels between parts, fully visible with generous padding.
Style/medium: same hand-painted 2D game art, crisp warm dark outlines, cloth wear and leather texture; only the controlled far-limb value reduction changes.
Scene/backdrop: genuinely transparent background with preserved alpha; no backdrop, glow, floor, shadow or checkerboard rendering.
Constraints: exactly two pieces; strict orthographic right-facing profile; no labels, arrows, text, watermark, other body parts or duplicates.
Avoid: full unsegmented leg, beige joint circles, bare knee, geometry drift, different boot, front view, three-quarter view, cropped sole.
```

#### 8. Удаление лишнего рукава из нового торса

```text
Use case: precise-object-edit
Asset type: corrected arm-free torso sprite for a 2D cutout skeletal game character
Input images: Image 1 is the newly corrected clothed-joint torso and the exact edit target. Image 2 is the assembled character identity/style reference.
Primary request: Remove ONLY the long attached ochre sleeve and cuff from Image 1. This torso sprite must contain the body shell and pelvis only, with no upper arm, no lower arm, no sleeve hanging downward and no glove.
Shoulder construction after removal: preserve a compact rounded ochre JACKET SHOULDER CAP attached to the torso, about one quarter of the current sleeve length. It is opaque clothing, not skin, and extends just far enough over the shoulder socket to cover a separate upper-arm sprite rotating behind it. Close and repaint the former sleeve attachment cleanly in matching ochre jacket fabric and warm dark outline.
Preserve exactly: tall collar, cream shirt, jacket body and hem, compass badge, leather harness and diagonal belt, navy waistband/pelvis hip covers, belt hardware, strict right-facing side profile, proportions, palette, textures, lighting and painterly cel style from Image 1.
Scene/backdrop: genuinely transparent background with preserved alpha; no backdrop, glow, floor, shadow or checkerboard rendering.
Composition/framing: exactly one isolated arm-free torso/pelvis sprite, fully visible with generous padding; no head, arms, legs, bag or scarf.
Constraints: change only the attached sleeve area; keep all joint covers opaque clothing; no beige skin discs anywhere; no duplicate shoulder; no text, labels, guides or watermark.
Avoid: long sleeve, cuff, hand, exposed ball joint, mannequin socket, three-quarter view, redesign of costume or badge.
```

### Техническая обработка исправления

- Встроенный генератор в новых вызовах впервые вернул настоящие `RGBA` с
  прозрачным фоном. Альфа сохранена напрямую; GrabCut для новых деталей не
  применялся.
- В каждом листе ног два крупнейших альфа-острова выделены как бедро и голень,
  обрезаны с прозрачным запасом и одинаково нормализованы: бедро `195×350`,
  голень с ботинком `221×454`. Ближняя и дальняя пары имеют одинаковые размеры.
- Новый торс пропорционально уменьшен до высоты `541 px`, соответствующей
  прежнему торсу; итоговый размер `271×541`.
- Альфа новых файлов нормализована до полного диапазона `0..255` без изменения
  RGB-формы.
- `satchel_body` и `satchel_strap` получены только разделением альфы старой
  сгенерированной сумки. Нижние концы ремня оставлены с запасом для скрытия под
  корпусом.
- `collar_cover` содержит те же сгенерированные пиксели, что верх нового торса,
  на том же холсте; изменена только альфа за пределами воротника и оката.
- Дальние руки затемнены множителем `0.93`. Дальние ноги не затемнялись кодом:
  их более тёмный тон создан генератором по отдельному промпту.

### Оставшиеся ограничения после исправления

- Новый торс стилистически совпадает с героем, но его плечевой окат и тазовые
  лопасти чуть крупнее исходного эталона: это намеренный запас для перекрытий.
- Телесные плечевые и шейный запасы сохраняются в исходных PNG. Они не должны
  быть видны при соблюдении слоёв: плечи за `torso`, голова под
  `collar_cover`.
- Раздельный ремень сумки рассчитан на скрытие концов под торсом и корпусом
  сумки; сам по себе вне сборки выглядит обрезанным.
- Пара бедро/голень совместима по ширине и масштабу, но окончательное положение
  колена и длину шага Builder должен проверить в живой анимации по точкам из
  `manifest.json`.
