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

Пока нет просмотра реального частичного перекрытия в собранном P3 и нет PASS.
Риск: scalar depth pin.y против передней footprint-дуги при боковых контактах.
Не готовить всю сцену до раннего стыка. Следующий шаг: Builder подключает
exact пакет; затем проверяем соседние реальные тики и полезно корректируем.

Ресурсы перед shadow-generation: RAM free4.519GiB, CPU37%, C7.793/D16.306/
E33.343GiB. Одновременно с P2/Millionko; новый локальный пик <0.5GiB RAM,
<0.1GiB files. Тяжёлый runtime только E:\R4D\perspective\p3-runtime\asset-artist.
