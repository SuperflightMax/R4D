# Dark: первое применение frozen P3

Baseline ART f899a308aed156a11e2a1013292ed68c6669959d /
CODE f1aca21e7b9ba19001e7e8762fcaf2511bf9bf74; ссылки на рецепт:
ART:experiments/p3-masks/asset-artist/CONSUMER_CONTRACT.md и
CODE:experiments/p3-masks/builder/ASSET_CONTRACT.md. Сверен consumer контракт
f3b7ce8d:experiments/p3-masks/transfer/dark/builder/CONSUMER_CONTRACT.md.

Тот же r4d-p3-assets-v1, sourceSize1536², crop without rescale, white RGB/alpha.
JPG остаётся цельным неизменённым фоном, нарисованные падающие тени исключены
из тела. Art-off выключает маски шарика и отдельной тени, geometry выше арта.

Первый полный набор60 masks: 12 круговых объектов; 24 области передних/
боковых граней12 segmentLoop объектов; 6 боковых wall spans; 3 дальних спуска;
12 областей front/left/right rim четырёх приёмников; 3 разделителя платформы.
Pin depth=exact config.y. Для oriented loop faces линии взяты с наблюдаемых
P1 sourceVerticesPx и проведены неизменённой sourceToNative. Прямоугольники
и повёрнутые основания не выпрямлены. Маски граней делят один исходный силуэт
с1px overlap, используя уже существующее depthLineNative; renderer/sort неизменны.
Борта используют прежний near-endpoint span anchor. Front rims имеют свои
наблюдаемые source-depth lines; trigger bucket circles не изменяются.

Ball/shadow — собственные ранее generated PNG из frozen ART, exact copies
в Dark assets/. Это reuse, не новая генерация. Anchor/radius прежние и измерены.
Shadow offset[-.45,.5], scale[1.15,2.6], alpha0.93 для тёмного пола. Свет
сверху-справа по исходнику; читаемость в собранном движении ещё проверяется.
Provenance/hash/originPromptPath сохранены. Water-файлы не потребляются.

Источник данного варианта — исходный способ до существенных изменений.
Важные обычные input witnesses TQA: seed0 pillar02/366, pillar04/840,
receiver01/888; seed2 pillar04/897/1058/1380, pillar02/972 (LOST1812 сохранён).
Это ориентиры, НЕ visual/movement PASS. Особенно проверять частичное скрытие
в углах и смену порядка у передних/боковых граней, затем входы приёмников.
Source overlay просмотрен, alpha/holes/hash probes проходят. Остались риски
ручных мелких контуров и scalar/line аппроксимации; новая сортировка не вводилась.

Повтор авторинга: python -B author_objects.py, затем python -B prepare_assets.py.
Exact packet: python -B freeze_handoff.py <commit>. Внешний manifest включает
все Git payload files, в том числе hashes/provenance/docs, без CRLF rewrite.
