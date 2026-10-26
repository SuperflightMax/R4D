# P1 board 01 — jungle mapping v0.1

Независимый mapping package для read-only `01-jungle.jpg`. Он не использует
параметры board 03 и не меняет sim-core, config, traces или Viewer.

## Решение

Выбрана собственная projective homography по четырём наблюдаемым углам пола:

```text
far-left  (390,286)     far-right  (1146,286)
near-left (235,1112)    near-right (1301,1112)
flat playable: 0..1000 × 0..1000
receiver apron: y=1000..1180
```

Near/far width ratio около `1.41`; identity mode поэтому не подходит. Параметры
03 также отклоняют боковые rails и seams, поэтому не переносились. Forward и
inverse matrices лежат в [`mapping-v0.1.json`](mapping-v0.1.json); checker
проверяет их взаимную обратимость и весь объявленный apron.

## Геометрия

- 25 obstacles: все описаны кругами по нижним каменным plinth/rim, а не по
  листьям, головам лягушек, цветам, барабанным верхушкам или теням.
- Семейные радиусы: drum `28`, flower `32`, leaf `34`, frog `36` flat units.
- Один start из центрального верхнего chute: `(500,60)`, вниз по `+y`.
- Три внешние стороны и пять near-wall segments с четырьмя проходами.
- Четыре существующих `bucketCircle`, radius `26`, в receiver apron.

Нарисованные корзины — широкие овалы. Bucket circles намеренно вписаны по их
короткой оси: это честный доступный физический trigger, а не заявление, что
весь овал является кругом. Checker требует, чтобы 96 projected samples каждого
bucket оставались внутри измеренного тёмного отверстия.

## Диагностика и передача

- [Perspective overlay](evidence/overlay.png): cyan — bounds/quad, magenta —
  obstacle bases, gold — измеренные тёмные openings, green — реальные bucket
  approximations и start, orange — receiver apron.
- [Flat preview](evidence/flat-preview.png): обратное преобразование того же JPG
  и та же геометрия в flat coordinates.
- [Deterministic checker](check_mapping.py): source SHA, finite/matrix inverse,
  round-trip, anchors, playable bounds, goal containment и pixel identity
  evidence.

Будущий Viewer не должен читать нарисованные evidence-контуры как отдельную
геометрию. Он получает фактическую sim config, построенную из mapping ids, и
рисует contours из неё; evidence здесь только проверяет передачу.

## Неопределённости и неудачные варианты

- Near floor edge художественно слегка изогнут, а rails и foliage закрывают
  углы. Quad — измеримая рабочая аппроксимация, не recovered camera;
  неопределённость углов примерно `8–14 px`.
- Frog и leaf bases частично скрыты собственным объёмом. Anchor — наблюдаемый
  центр нижнего plinth; неопределённость `6–10 px`.
- Вариант с полным silhouette circle отклонён: он давал бы отскоки от листьев,
  глаз, цветов и верхушек.
- Identity и перенос transform 03 отклонены до разметки obstacles, потому что
  они не совпадают с расширением jungle floor.

Эти сомнения являются приоритетами overlay/trajectory QA, а не runtime jitter.
Seed и траектория ради красивого попадания не выбирались.
