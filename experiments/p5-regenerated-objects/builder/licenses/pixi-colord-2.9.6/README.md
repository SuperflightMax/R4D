# @pixi/colord 2.9.6 — точный license supplement

Подготовлено2026-10-28 23:04UTC /29октября Europe/Kyiv для следующего package. **c01 не менялся и остаётся с прежним license gap.**

## Где возник пропуск

Официальный npm archive `@pixi/colord@2.9.6` содержит42файла/109845unpacked bytes и не содержит LICENSE/LICENSE.md. Все42файла установленной read-only common dependency побайтно совпали с этим archive, дополнительных файлов нет. Это исключает объяснение «license file потерялся только в локальной установке» для проверенного набора. Прежний consumer collector искал license files только внутри установленного package, поэтому включил metadata `MIT`, но пропустил сам текст.

Точный механизм, почему upstream publication не включила файл, не установлен. Release script/whitelist сами по себе не доказывают причину фактически опубликованного archive.

## Цепочка primary source → actual bytes

1. [Официальная npm version metadata](https://registry.npmjs.org/@pixi%2fcolord/2.9.6), HTTP200, fetched2026-10-28T22:58:32.895Z,5327bytes,SHA256 `63b5fca10eff46f53b7a81007d0acbe9f6eeee29fd38251e7740c29cc5b0ba3f`. В ней exact `gitHead=5344fbf77b736f81cd33c21050021bc09bc9dd1d` и archive integrity.
2. [Официальный archive](https://registry.npmjs.org/@pixi/colord/-/colord-2.9.6.tgz),30553bytes,SHA256 `53c41fe64870c917d08ccf06cf324c85b03a00b6c08371a06f7b29ff19dded20`. Проверены и SHA1, и published SHA512 integrity. Код archive не исполнялся, unsafe extraction не выполнялась.
3. [package.json official PixiJS fork на exact gitHead](https://github.com/pixijs/colord/blob/5344fbf77b736f81cd33c21050021bc09bc9dd1d/package.json) побайтно совпал с published и installed package.json:5963bytes,SHA256 `d92aec39b7b030ebb6419b8ca4da12fd1a9b7bbd12d2979ab019308b417507e8`,Git blob `93f3ca386429119f7df96742146242dece16f11a`. Package metadata всё ещё указывает upstream omgovich/colord; использован именно PixiJS fork с тем же publisher gitHead и теми же bytes, не latest upstream по догадке.
4. [LICENSE.md того же exact commit](https://github.com/pixijs/colord/blob/5344fbf77b736f81cd33c21050021bc09bc9dd1d/LICENSE.md):1083bytes,SHA256 `7613d4594ee8b6163926af3435dae61c9e3d5a27cd137bd76a543ba40002d8fc`,Git blob `e437003733acd123c76c2a9df0c13a6f3b02b51e`. Git blob пересчитан из фактических UTF-8 bytes. Реальная attribution в файле: `Copyright (c) 2020 Vlad Shilov omgovich@ya.ru`; текст не сочинён и не заменён общим MIT шаблоном.

`SOURCE.json` связывает все источники, hashes и42installed file pins. Его digest8932bytes/SHA256 `c9d2b53dbcbd6598a9e5e1473091d00e7de11c4a2d0df6b071d9f06815264f77`. Полный raw evidence и archive — `E:/R4D/perspective/p5-runtime/builder/output/license-source-001/`. Это только публичная third-party dependency; исходники/лицензия private Millionko сюда не копировались и не переопределялись.

## Что меняется в следующем package

`scripts/pin-dependencies.mjs` применяет supplement только к exact package name/version/package.json hash и повторно сверяет42файла с published pins. Затем сверяет bytes/SHA лицензии и включает её ровно один раз в terms, записывая official URL/commit/blob/archive digest в dependency lock. Read-only `D:/dev/millionko/node_modules` не меняется.

Изолированный packaging fragment, **не новый consumer candidate**:

- `E:/R4D/perspective/p5-runtime/builder/output/license-package-001/public/THIRD_PARTY_LICENSES.txt`:9330bytes,SHA256 `583c1487aefadfa1b72c181ab73a5f7a2030afb0545cf49b90ff66973faef82f`.
- `.../public/data/dependency-lock.json`:4341bytes,SHA256 `a14d1f939d51cd9b0f2cc74112f2632dccdcb719a12313b68733e698cf2fd9d7`.

Полный official license обнаружен в terms ровно один раз; список missingRuntimeLicenseFiles пуст. Для изоляции добавлен `--output-root`; immutable `output/previews/*` запрещён как выход collector. `freeze-preview.mjs` выводит actual missing licenses из lock вместо прежнего hardcoded сообщения о colord.

Перед/после этой операции index c01 и все22public file pins совпали; ownership record unchanged, PID32108/session55195. Это byte-preservation проверка, не повтор c01 QA. App/native/browser не пересобирались, listener не заменялся, server release writes0. Evidence `license-source-001/verification.json` фиксирует эти утверждения.

Guard22:58:32UTC: RAMfree15.630/31.907GiB,systemCPU4%,aggregateCPU12.29%,aggregateWS20.547GiB; C/D/E free16.920/16.282/12.134GiB. Own peak estimate0.2GiB RAM/0.02GiB E плюс allowance4GiB RAM/2GiB E соблюдён. TEMP/TMP/cache/output ownE/process-local. Web open registry metadata вернул `is not accessible via this tool`; официальный registry GET из Node вернул200. Policy reason/denial не возвращался; ограничения не менялись.
