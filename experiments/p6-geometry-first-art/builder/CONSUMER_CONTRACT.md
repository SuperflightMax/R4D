# P6 consumer: формат ранней стыковки

Реализует Artist contract `e8bf577d46b48b871f678f53f85a5cb0d250eeb0:experiments/p6-geometry-first-art/asset-artist/LAYER_CONTRACT.md`.

Frozen candidate передаётся JSON manifest и относительными PNG. `scripts/build.mjs --artist ABSOLUTE_P6_MANIFEST` проверяет pins и SHA-256 файлов; принимаются только файлы нашей P6 области. Raw whole image и его registration check остаются отдельными материалами обязательной пробы.

```json
{
  "id": "p6-candidate-01",
  "p1Commit": "4b47db04c7140ebf88f69b91faa0b790d46f22ec",
  "configSha256": "dd5c519cd6d4b7295118e0a3a1063efed424a0ce739450bd5153c6a9941982db",
  "width": 1536,
  "height": 1536,
  "layers": [
    {"id":"floor","role":"background","texture":"floor.png","fullFrame":true},
    {"id":"flower-01-body","objectId":"flower-01","role":"body","texture":"flower-01.png","fullFrame":true,"nativeBase":[32982.10427784783,33295.09546643628],"nativeRadius":44.62098571998958}
  ],
  "shadows": {"flower-01":{"kind":"baked","layerId":"floor"}},
  "ball": {
    "texture":"ball.png","center":[256,256],"visibleRadius":180,"liftRadiusFactor":1,
    "shadow":{"texture":"ball-shadow.png","center":[256,256],"visibleRadii":[180,180],"radiusNative":[20,20],"offsetNative":[-8,8],"opacity":1}
  },
  "hashes":{"floor.png":"actual SHA-256","flower-01.png":"actual SHA-256","ball.png":"actual SHA-256","ball-shadow.png":"actual SHA-256"}
}
```

Это пример формы, не готовый кандидат. `shadows` должен перечислить все 25 ID, каждый с одним источником `baked`/`separate` и фактическим `layerId`; baked и отдельная тень одного ID одновременно не допускаются. Альфа силуэта берётся из RGBA. Невидимые глобальные маски не применяются. Если Artist нужен другой точный формат метаданных, адаптер меняет форму, а не регистрацию.

Слои регистрируются full-frame либо `rect:[sourceX,sourceY,width,height]`. Альтернатива rect — `anchor:[sourceX,sourceY]` плюс `textureAnchor:[textureX,textureY]` без растяжения. Full-frame prepared layers всегда занимают один canvas1536²; приведение исходного иного квадратного размера выполняется одним uniform full-frame scale, без crop/локальной деформации. `nativeBase`/`nativeRadius` для object ID проверяются против config.

Роли: `background`, `ground-shadow`, `body`, `receiver-rear`, `receiver-front`, `foreground`. Тени пола ниже всех тел. Для `body` можно передать отдельные куски: `depthLine:[[nativeX1,nativeY1],[nativeX2,nativeY2]]` или `occlusion.nativePolygon`. Они определяют, когда конкретная часть перекрывает шарик; обычный native base-y используется только при отсутствии более точного описания. `order` определяет взаимный порядок частей в одной группе. Receiver rear ниже шарика, front выше. Принятая физика корзин не меняется.

Шарик сохраняет круглый силуэт и равномерно масштабируется по r16 и локальной горизонтальной производной принятой проекции. Его screen center при обычном виде поднят над ground point на один видимый радиус (`liftRadiusFactor:1`), это явная художественная высота, не правка native pos. Geometry всегда рисует настоящий проецированный плоский collider. Shadow texture проецируется native->source сеткой, с native ground offset, а не просто сжимается по экранной оси. В плоском виде арт обратно преобразуется mesh по принятой матрице; объёмные рисунки не объявляются истинным видом сверху.

Actual sprite packet v01 уточнил это правило: если присутствует `visualLiftPx`, используется именно он, включая0; `liftRadiusFactor` является только fallback для manifest без явного lift. Integration-02 соблюдает packet0, center=P(x,y). Отдельный `sphere-shadow-only` adapter позволяет реальную раннюю стыковку sphere/shadow без объявления готовности board layers. Его actual metadata и кадры: `integration-02/HANDOFF.md`.

Переключатель «Арт» выключает весь artistic container, включая все перекрывающие части и тени. Geometry — независимый верхний слой из фактического config. Качество сортировки проверяется по кадрам контактов; наличие параметров само по себе не подтверждает художественный результат.
