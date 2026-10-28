# P3 Asset Artist — текущее состояние

28 октября 2026. `asset-artist-r4d-p3-masks-01`.

Stage 2 принят от Lead по старту CTO. Собственное дерево до начала было чистым
на `64061757802dc60770ab156ef5672af741d65d03`.

Jungle SHA256 проверен; config/manifest/projection exact P1
`4b47db04c7140ebf88f69b91faa0b790d46f22ec` совпали со всеми заданными SHA256.
P0 recipe exact `ee4d8e5c7dbb3b6618d58d6dacb0caf9b73dfb1b` прочитан.
Чужие методы/кандидаты не читались. Исходник и геометрия не изменялись.

Ранний пакет: `assets.json`, schema `r4d-p3-assets-v1`, по предложению Builder
из read-only `experiments/p3-masks/builder/ASSET_CONTRACT.md`.
Собственные ball/shadow сгенерированы built-in image_gen; prompts и provenance
сохранены, проектные PNG — exact copies на E, активные C originals оставлены.
Числа anchor/radius измерены: ball alpha>=128 bbox [139,140,1114,1109],
shadow alpha>=8 bbox [71,455,1180,800]. Слабые alpha выбросы raw сохранены.
Для shadow radiusPx нормируется по горизонтальной полуоси 554.5; её исходное
отношение полуосей уже 0.311. По адаптеру Builder текстура сначала попадает
в native floor, затем проецируется: `scaleRadius=[1.15,2.6]` компенсирует
двойное сплющивание, давая native полуширину1.15r/полуглубину0.81r.
Точная читаемость требует сборки.

Первые маски: leaf-01 (центральный ранний контакт) и flower-01. Контуры вручную
заданы в source px; детерминированно растрированы whiteRGB/alpha, 4x AA,
crop без изменения source scale. Тени не включены намеренно; точность контура
ещё требует визуальной проверки на реальных тиках.

Первый реальный стык подтверждён Builder и Lead: checkpoint02 source
`b1d74c00ec33ed71147718243b6f0f6ae89c8b72`, native seed0 leaf-01 partial60,
contact94/95, rebound150. Artist просмотрел три сохранённых Pixi кадра из
`E:\R4D\perspective\p3-runtime\builder\evidence-02`. Собственный art-only
контакт-лист из actual trace не выдаётся за Pixi/независимую QA.

Полный подготовленный пакет: 51 masks = 25 pins + 6 боковых участков +
3 дальних спуска + 1 front fascia + 16 basket-front strips. Все координаты
source-aligned, source/config неизменны. Basket-front depth lines получены
из наблюдаемой передней кромки принятой inverse projection; не из нового
физического основания. Pixel contours/sourceBounds в regions.json;
точный consumer package assets.json, hashes.json. Весь payload ~1.82 MB.

Для exact handoff JSON записывается UTF-8/LF без Windows newline conversion.
Текущий assets.json canonical-byte SHA256:
`98cef793f5cf9191fea315caf4bf11d727c20b2d5a9d5704972e97e02cfd2f73`.
Прежние озвученные raw CRLF hashes не использовать как Git hashes; причина
и исправление сохранены в RUN_LOG. PNG/координаты/глубины от этой правки
не изменились. Фактический consumer payload ~1.805MB.

Для полной передачи вместе с текстовыми metadata добавлен freeze_handoff.py:
он извлекает только собственный asset-artist prefix из exact commit в E runtime,
сверяет прочитанные final bytes и формирует внешний manifest всех файлов,
включая hashes.json и оба provenance. Digest самого manifest сообщается отдельно.

Проверены размеры/white RGB/alpha/hash integrity, все 25 exact pin depths,
пять точек исключения baked shadows и четыре пары hole/front-rim корзин.
Полный динамический/художественный PASS пока отсутствует. Риск: scalar pin
depth на боковых контактах; точность мелких ручных контуров/листвы/бортов.
Builder назвал полезные обычные run contacts: seed0 frog-02/441, wood-01/571,
flower-02/890/956/1009; сохранённые random — wood-06/604/615.
Следующий шаг: подключить exact полный пакет, проверить эти реальные тики
и вернуть Artist конкретные дефекты. Арт не объявляется принятой сценой.

Ресурсы перед shadow-generation: RAM free4.519GiB, CPU37%, C7.793/D16.306/
E33.343GiB. Одновременно с P2/Millionko; новый локальный пик <0.5GiB RAM,
<0.1GiB files. Тяжёлый runtime только E:\R4D\perspective\p3-runtime\asset-artist.

Свежий замер перед финальным overlay: UTC00:18:20, RAM free10.146/31.907GiB,
CPU1%, C7.727/D16.305/E31.544GiB. Локальные маски/пробы добавляют <0.5GiB RAM.
