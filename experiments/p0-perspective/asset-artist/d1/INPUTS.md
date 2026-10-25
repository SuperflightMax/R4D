# P0 d1 — фактические входы

## Изображения

1. `inputs/formal-reference-v1.png` — **единственный геометрический control**.
   - Источник: растровый рендер `../../builder/generated/formal-reference-v1.svg` после `npm run check` PASS.
   - Размер: `1536 × 1536`.
   - SHA-256: `08ebe1bd5dd7e3a60097a15c1e29e60c46c4bcf27e4babda730fcffa269f723f`.
   - Роль: камера, контур и положение поля, центральная ось, контрольные ряды, функция масштаба и вид стоящих объёмов.

2. `K:\Agents\R4D\Assets\perspective\03-sun-temple.jpg` — **художественный референс**, read-only.
   - Размер: `1536 × 1536`.
   - SHA-256: `f5cfa2bbe8e4b49ecbc0f4c7a0cee99842b182b56ae495979153b8fc9ff86e32`.
   - Роль: уровень законченности, материальность, свет, иерархия и игровая читаемость; не источник отдельной камеры и не композиция для буквального копирования.

`concept/visual-template.png` генератору не передавался: его наблюдательная трапеция отличается от Research. Художественные требования взяты текстом из `concept/ART_DIRECTION.md` и `concept/GENERATOR_BRIEF_STRUCTURE.md`.

## Зафиксированная база

- Integrated baseline до Builder fix: `3a46ce21f9b655c8b5c8b567827160d34300706e`.
- Builder EOL fix, исходный exact SHA: `0cc217d120597e1ec9f26cb2caa79e54d59386ba`.
- Локальный cherry-pick fix: `61c092799bf1b9a6f8e956a34fa2a8e4dcc40a09`.
- `npm run check`: PASS до запуска генерации.
