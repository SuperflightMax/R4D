# Jungle art v2: source-only пакет

Статус: **SOURCE_READY_RUNTIME_UNVERIFIED**. Сцена не просмотрена, runtime не выполнен, P2 не закрыт.

Единственный manifest будущего просмотра: `experiments/p2-free-approach/builder/source-packets/jungle-art-v2/manifest.json`. Это generic consumer schema `r4d.p2.assets.v1`, а не Artist contract. Существующий consumer — `builder/src/main.mjs`; его код не изменён, Git blob `7c7c28ebecc748edebaf42c16a4c6ea5277a3d29` совпадает с Lead input `5b4b015dcdf5c8553ec348976698c07186989551`.

Файлы manifest и оба PNG лежат рядом; staging не создавался. `ball.file` и `shadow.file` — относительные имена этих PNG. Для четырёх накладок `fileRole: source` использует уже подключённый неизменный Jungle; отдельная копия исходного JPG не требуется.

| Готовый PNG | Bytes | SHA256 |
| --- | ---: | --- |
| ball-v2.png | 851662 | 3484ec77027226f061bce2738972aed404455bb15c8c778fe5a3de6c7ffecfc3 |
| shadow-native-disc-v1.png | 2263 | bd54c9f8251b634657076831fd38854855aea8004ea4dc71603b3bac3a39f572 |

Artist source: exact `080bdc62bd547b40b688b555e429ba88dcd31e23:experiments/p2-free-approach/asset-artist/asset-contract-v2.json`. Готовые PNG скопированы без редактирования пикселей.

Ball: canvas [1254,1254], centerPx [627,629.5], diameterPx 830.5. Числа перенесены из Artist v2. `liftRadii` не добавлен: действует существующий расчёт consumer по локальному Jacobian, как в согласованном подходе. Физический радиус 16, config и проекция не изменялись.

Shadow: centerPx [64,64], footprintPx [96,96] = 2×textureRadiusPx48; nativeRadii [1.15,1.15] = nativeRadius18.4 / physicalRadius16; offsetNative [-8,14], opacity 1, normal blend. Альфа остаётся в PNG (0..76, заявленный maxAlpha0.3); дополнительного усиления прозрачности нет. Это та же согласованная floor-mapping настройка generic v1, без изменения геометрии или размера.

Сохранены ровно flower-01, leaf-01, frog-01, wood-01. Их sourceRect, оба source/local polygon, anchor и native-depth совпадают с Artist occluders-v1 и прежним generic manifest; `fileRole: source` сохранён для точного UV/crop существующего consumer. Остальные контуры, ограда и бортики корзин не изготовлялись.

Проверены только bytes/SHA256, поля, относительные ссылки и Git diff/status. Это не runtime, selfcheck или QA PASS. Скрипты prepare/serve/selfcheck, симуляция, тесты, браузер и сервер не запускались. Приватное ядро не читалось и не копировалось.

Старые `prepare-artist-probe.mjs`, diagnostic manifest и runtime-packet-01 оставлены без изменений. Новый source-only пакет не является оболочкой отклонённого запуска и не снимает отдельный tool-policy запрет.
