# Water Artist — журнал значимых действий

## 29 октября 2026 — перенос исходного способа

По новому прямому старту Max полностью прочитаны4 карточки c6603f0,
сверены оба отдельных P1 набора/JPG. Начальная чистая ветка545bf170.
Ранние7 масок и exact reused own generated ball/shadow опубликованы4eb4001.
Lead/Builder реально увидели открытый arch07 и partial frog01 в Pixi.

Полный первый набор71 masks сохранён17dc9fc, без смены scalar/line renderer.
PNG body contours уточнялись по исходнику: широкая rail area ошибочно
захватывала поток; теперь каменные куски разделены,4 water probes открыты.
Неудачный overlay в runtime/mask-overlay-boundary-v1-rejected.png сохранён.
Полный byte extraction84files проверен, внешний manifest95c7f3a9... отдельно.

## 29 октября 2026 — один целевой обычный arch depth проход

Lead поручил корректировку после независимого воспроизведения VQA pop1014→1015.
Создан отдельный variants/arch-front-edge-01, baseline17dc не подменяется.
Правило: середина принятого переднего ребра feet вместо среднего всех вершин,
для всех8 arches одинаково. Меняются только24 depth entries, все73 PNG и47
других occluders неизменны. Source/config/projection/native/radius не менялись.

Bounded alpha estimate на настоящем обычном seed1: старый crossing1015
оставляет21.324% geometric alpha overlap; новый crossing1021 —0.001%.
State1014 совпал с Builder checkpoint, outcome LOST1196 сохранён. Это
самопроверка данных, не независимая QA/Pixi художественный PASS. Нужны actual
comparative frames обеих passes и обычные другие arches/seeds. Если не даёт
улучшения, отрицательный результат сохранить; новую сортировку не изобретать.
