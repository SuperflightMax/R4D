# P0 L1 components — self-check

## Environment / floor plate

- PASS: квадрат `1536 × 1536`, полностью непрозрачный (`alpha255=2359296`, `alpha0=0`, partial `0`).
- PASS: один законченный Jade Sky Observatory environment, центральный дальний ориентир, боковое обрамление и передний порог.
- PASS: игровая плоскость непрерывна; drums, obstacle shadows, control markers, сетка, строки, подписи, UI, шарик и коллайдеры отсутствуют.
- PASS: материал, свет и детализация соответствуют роли art reference, при этом точный храм и четыре чаши не копируются как obstacle layout.
- RISK / Builder check: границы и seams визуально согласованы с formal reference, но генеративный результат сам по себе не гарантирует точного pixel overlay. Plate не деформировался для сокрытия расхождения.

## Drum master

- PASS: ровно один законченный drum; пола, сцены, baked contact/cast shadow, текста и технических markers нет.
- PASS: canvas `1074 × 1137`, видимые bounds `(64,64)..(1009,1072)`, nonzero edge pixels `0`.
- PASS: alpha: transparent `373772`, opaque `841149`, antialiased partial `6217`; фон за объектом alpha `0` после задокументированной очистки.
- PASS: полный нижний край виден; base-center anchor `(537,1072)` стабилен и записан в metadata.
- PASS: верх, фаски и боковые края имеют минимум `64 px` прозрачного padding.

## Shadow master

- PASS: отдельный RGBA, одинаковый с object master canvas `1074 × 1137` и anchor `(537,1072)`.
- PASS: visible bounds `(167,1053)..(1031,1123)`, nonzero edge pixels `0`; направление вправо-вниз, contact часть у основания.
- PASS: shadow не вшита ни в drum master, ни в environment plate.

## Gate

- PASS: L1 composite не собирался; четыре копии и horizontal `p` не выбирались.
- PASS: formal anchors/scales не изменялись, отдельные camera/shape/ellipse для результатов не создавались.
- PASS: только P0; нет P1+, физики, коллайдеров, шарика или sim-core.
