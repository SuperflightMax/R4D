# P1 board 04 — water temple mapping v0.1

Независимая привязка `04-water-temple.jpg`. Параметры 01/02/03 не
переносились; sim-core, config, traces и Viewer не менялись.

## Плоскость и transform

Собственная projective homography построена по внутренним границам внешней
каменной чаши:

```text
far-left  (190,250)    far-right  (1346,250)
near-left (106,1060)   near-right (1430,1060)
playable flat 0..1000 × 0..1000
receiver apron y=1000..1250
```

Матрицы, обратная матрица и точная область допустимости находятся в
[`mapping-v0.1.json`](mapping-v0.1.json).

## Как вода, высоты и мосты схлопываются в 2D

Модель намеренно содержит **одну непрерывную 2D navigation plane** внутри
внешних стен храма:

- зелёные острова становятся обычным traversable floor;
- внутренние водные каналы становятся тем же traversable floor: shoreline и
  разница уровня воды не создают collider, depth или отдельный слой;
- короткие мосты, ramps и ступени становятся тем же traversable floor: их
  высота и края не создают collider или height mechanic;
- наружные каскады за внешними стенами остаются background вне playable domain;
- четыре передних бассейна не входят в navigation plane: это receiver apron с
  четырьмя круглыми goal triggers.

Следовательно, после схлопывания сохраняются только внешние bounds, опорные
footprints объектов и четыре goal triggers. Это явная игровая аппроксимация, а
не восстановление физики воды или высот из рисунка. Millionko source view не
использовался и скрытая физическая реализация не угадывалась.

## Геометрия

- 21 obstacle.
- 6 circles — irregular frog bases по нижней опоре, не по голове или тени.
- 15 rectangular segment loops: семь upright pillars и восемь white arches;
  каждый loop разворачивается в четыре настоящих сегмента.
- Один start `(500,55)` из центрального верхнего каскада.
- Внешние bounds и четыре near gaps.
- Четыре bucket circles radius `45` внутри наблюдаемых водных компонентов.

Water component измерен детерминированным HSV threshold
`H=75..105, S>=70, V>=50`; его bounding box — evidence containment, а не
восстановленная форма бассейна. Checker требует, чтобы projected bucket circle
целиком оставался внутри этого box.

## Evidence и передача

- [Perspective overlay](evidence/overlay.png): cyan — outer bounds, magenta —
  support colliders, green — buckets/start, gold — measured water component
  boxes, orange — receiver apron.
- [Flat preview](evidence/flat-preview.png): inverse view той же геометрии.
- [Checker](check_mapping.py): source SHA, matrix inverse, finite/round-trip,
  anchors, bounds, primitive counts, goal containment, обязательный single-plane
  contract и pixel identity evidence.

Future Viewer обязан рисовать из фактической config, полученной из mapping ids.
PNG не является вторым источником геометрии.

## Неопределённости и отвергнутые варианты

- Near edge частично закрыт rails передних бассейнов; floor quad — ручная
  аппроксимация с неопределённостью `10–14 px`, не recovered camera.
- Задняя часть frog footprint скрыта; круг — разрешённая аппроксимация
  irregular base. У pillars/arches оценивается скрытая задняя глубина.
- Shoreline colliders отвергнуты: они изобрели бы неизвестную passability и
  нарушили согласованную единую 2D-плоскость.
- Height tiers для мостов и ступеней отвергнуты: физическая модель и Millionko
  source view исследователю не выданы.
- Silhouette colliders отвергнуты: верхушки arches, головы frogs и тени не лежат
  на полу.

Остаточные сомнения передаются visual/trajectory QA. Seed не отбирался.
