# P5 consumer — контракт ассетов v1

Владелец consumer/schema: Builder. Ассеты и provenance: Artist. Истина геометрии — exact P1 `4b47db04c7140ebf88f69b91faa0b790d46f22ec`; заказ не меняется.

## Координаты и масштаб

- **Native** — реальные координаты Millionko из `public/data/config.json`. Уже содержат translation `[33256,34072]`. Повторно прибавлять/вычитать её нельзя. Radius шарика строго 16.
- **Source** — квадрат `1536×1536`. Используем exact `nativeToSource` из P1 manifest и exact P1 `project(matrix,[x,y])`. Обратное преобразование — `sourceToNative` из того же manifest. Нового mapping нет.
- **Texture-local** — пиксели исходного непрорезанного PNG, начало слева сверху. Все anchors, footprint и alpha bounds заданы здесь, до масштаба. Автоматический trim не используется.
- **Viewport** — CSS pixels. Весь source квадрат равномерно contain-масштабируется и центрируется. Device pixel ratio меняет только разрешение backing canvas. Ничего из viewport не подаётся в симуляцию.

`public/data/targets.json` содержит все 25 pins, 4 receivers, source/native anchors и 128-точечные проекции реальных ground circles. Это готовая числовая таблица для Artist; она вычислена из exact config, не из силуэтов. Рецепт P0 сохраняет согласованность компонентов, но не заменяет P1 цифры.

Для target-bound слоя масштаб **равномерный**: `s = target.sourcePx.footprintWidth / texture.footprintPx.width`. Положение точки текстуры `p`: `sourceAnchor + (p-groundAnchorPx)*s`. Отдельных X/Y scale, rotation или ручного instance offset нет. Footprint depth после этого сравнивается с целевой глубиной; несовпадение нельзя скрыть растяжением. Нужен подходящий ракурс master/part. Width footprint означает ширину опоры, не alpha bbox и не ширину кроны/лепестков. Для receiver это ширина native trigger circle внутри отверстия, а не внешний габарит корзины.

`$ball` привязан к **живому** `state.ball.pos`; его projected diameter вычисляется заново с r16 тем же project. Шарик объёмный и круглый: uniform XY scale, groundAnchor под центром сферы. Тень использует тот же target width, свой canvas/groundAnchor и видимый нарисованный сдвиг. Положение/скорость/RNG симуляции от изображения не меняются.

`$source` — полноформатные floor/foreground `1536²` (или другой квадрат с uniform scale до 1536). groundAnchor `[0,0]`, footprint width/depth равны ширине/высоте texture. Никаких оригинальных вырезок как готового арта.

## Manifest

Формат: `asset-manifest.schema.json`; заполненный **числовой пример, не реальный ассет**: `asset-manifest.example.json`. Relative file paths считаются от каталога manifest. Один texture может использоваться несколькими instances. PNG straight RGBA, без premultiply на диске. Прозрачные компоненты без matte. Floor может быть opaque RGBA/RGB PNG.

Обязательны exact SHA256/bytes/dimensions, alpha bbox при `alpha>0`, visible bbox при `alpha>=16` (`[x,y,width,height]`, полуоткрытый прямоугольник), texture-local groundAnchor и authored footprint. Shadows могут выступать за footprint. Alpha bounds не переопределяют footprint и anchor. Сохранить raw → candidate → selected → final связи, реальные prompts/toolOutputId и коррекции в provenance. Example SHA не принимается consumer как реальный файл.

Каждый instance содержит `targetId` (точный native id, `$ball` или `$source`), `textureId`, `parentId`, `role`, `depthOffsetRadii` и `depthReason`. Поле offset задаёт объявленную глубину **графической части**, а не перенос её изображения или collider. Для части внутри объекта offset в `[-1,1]`; depth = native anchor y + native radius * offset. Нельзя подбирать его по удобному броску.

Роли:

| role | Отрисовка |
|---|---|
| `floor` | Под всей сценой, `$source` |
| `shadow` | На полу, ниже solid parts; общая опора родителя, свет и offset описаны в `lighting` |
| `body`, `receiver-back`, `receiver-front`, `ball` | По объявленной native depth, затем stable instance id |
| `foreground` | Перед сценой; `$source`, только явно заявленная передняя архитектура |

Общий center sort не является доказательством правильного скрытия. Для сложного силуэта Artist передаёт отдельные PNG parts с общим groundAnchor/parent; например задняя чаша и передний бортик receiver. Их положение одинаково, но глубина соответствует их части ground footprint. Частичное перекрытие затем проверяется в реальном движении. Необъявленных невидимых масок нет; «Арт» выключает весь art tree вместе с любыми графическими перекрытиями, «Геометрия» рисуется независимо поверх из actual config.

Первый handoff: floor, несколько разных obstacle families, generated ball/shadow и receiver/foreground. Для ещё не полученных объектов consumer показывает незаполненную сцену и соответствующий счётчик; диагностические контуры не выдаются за готовый арт.

## Передача

Передать Lead exact commit + manifest path + SHA256/bytes и пути реальных подготовленных PNG. Тяжёлые raw/evidence могут оставаться в собственном E runtime с hash/bytes; файл manifest должен ссылаться на доступные final bytes. Builder ничего не читает из чужих worktree без адресного handoff. Первый комплект сразу проверяется и собирается; всех 25 ждать не нужно.

## Разрешённая foreground delta после c01

Для следующего candidate добавлено optional `instance.sourceClipPx` — явная область той же generated floor texture. Exact поля/units/parent/provenance и ограничения: `GENERATED_FLOOR_CLIP.md`. Старые manifests остаются совместимыми; source/current c01 bytes и его проверки не переопределяются. Actual Artist contour ещё не передан, live runtime не менялся.
