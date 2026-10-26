# P1 board 02 — dark temple mapping v0.1

Независимая привязка `02-dark-temple.jpg`. Параметры 01/03 не переносились;
sim-core, config, traces и Viewer не менялись.

## Плоскость и transform

Собственная projective homography построена по внутренним floor/wall seams:

```text
far-left  (320,252)    far-right  (1216,252)
near-left (155,1128)   near-right (1381,1128)
playable flat 0..1000 × 0..1000
receiver apron y=1000..1150
```

Near/far width ratio около `1.37`; identity mode не сохраняет проходы у стен.
Матрицы, обратная матрица и точная область допустимости находятся в
[`mapping-v0.1.json`](mapping-v0.1.json).

## Геометрия

- 24 obstacles.
- 12 circles: шесть drums и шесть irregular skull bases. Skull описывается по
  нижней опоре, не по зубам, лбу или тени.
- 12 rectangular segment loops: шесть upright pillars и шесть square blocks;
  каждый loop разворачивается в четыре настоящих сегмента.
- Один start `(500,60)` из центрального chute.
- Внешние bounds и четыре near gaps.
- Четыре bucket circles radius `34` внутри наблюдаемых тёмных прямоугольных
  приёмников.

Bucket circle — доступный trigger, не восстановление всей прямоугольной ямы.
Checker требует, чтобы projected circle целиком оставался внутри измеренного
dark opening.

## Evidence и передача

- [Perspective overlay](evidence/overlay.png): реальные основы поверх исходного
  JPG; cyan — bounds, magenta — colliders, green — buckets/start, gold —
  измеренные openings, orange — apron.
- [Flat preview](evidence/flat-preview.png): inverse view той же геометрии.
- [Checker](check_mapping.py): source SHA, matrix inverse, finite/round-trip,
  anchors, bounds, primitive counts, goal containment и pixel identity evidence.

Future Viewer обязан рисовать из фактической config, полученной из mapping ids.
PNG не является вторым источником геометрии.

## Неопределённости и отвергнутые варианты

- Far seam частично закрыт ramps, near architecture — foreground bins; quad
  является рабочей аппроксимацией с неопределённостью `8–12 px`, не recovered
  camera.
- Задняя часть skull bases скрыта; круг — честное разрешённое приближение
  irregular footprint.
- Rectangular bases видимы лучше, но их глубина всё равно оценочная.
- Identity и transforms 01/03 отклонены из-за другого widening/stone walls.
- Full skull/cube silhouette collider отклонён: верхушки не лежат на полу.

Остаточные сомнения передаются visual/trajectory QA. Seed не отбирался.
