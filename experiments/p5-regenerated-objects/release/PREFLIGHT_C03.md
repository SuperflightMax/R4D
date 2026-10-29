# P5 C03: адресный локальный preflight

29 октября 2026, Europe/Kyiv; проверки 01:01–01:03 UTC. Продолжение `c2210115c9704f47d64de782b851bc8ed7bd2b71:experiments/p5-regenerated-objects/release/PREFLIGHT_C02.md`. Это inventory/privacy delta, не product/art/native QA, финальная приёмка или live seal. Server reads/writes, SSH, HTTP Review = 0; root не менялся, не копировался, rebuild/archive/install не было. C02 сохранён.

## Exact C03

Root: `E:/R4D/perspective/p5-runtime/builder/output/previews/c03/public`; index — соседний `index.json`, **11618 bytes**, SHA256 `17838d163e6c710cad513a68b5cd5ba5c6543a708761b96e7ee62fa362c2ef2d`.

Consumer source в index: `af23e124cf5bd1d9de884082ffbc993448217112`, prefix `experiments/p5-regenerated-objects/builder/`. Diff этого prefix от C02 consumer398b содержит только HANDOFF_C02.md, LOG.jsonl и STATE.md. Actual app.js **571012 bytes**, SHA256 `4a003dd39212f21b7a3dd1baa82c0d0738af3a9767c6e51225b9b54f5aac325c`, идентичен проверенному C02.

Artist source: `a5ec68fb2ed6aeacd8c66bc575166567bd0c3966`, prefix `experiments/p5-regenerated-objects/asset-artist/`. Прочитан HANDOFF_MINI_03.md, blob `eda33b90fbe5caaee83307f4cac56a9a14194fb4`; проверены exact Git bytes mini03 manifest **89838 bytes**/SHA256 `a083143b199f78cefe2725907b91385145cb9c29067ad319dd862974a13714a0` и DELTA_MINI_03.json **12713 bytes**/SHA256 `0dbab3cffcc65ced429fccf0993533e43038541c0b6370559729fec6a493de3a`, blob `6e0c2596357c29f31767b20c853d7fd52cf08016`.

## Фактическая дельта и перенос проверок

Все **29/29** файлов C03 совпали с actual index по bytes/SHA256; суммарно **21675411 bytes**, +6977 к C02. Лишних, удалённых, unsafe/duplicate paths и reparse points нет. Для сравнения использован собственный C02 inventory evidence SHA256 `a03eb0144885fb1e7f2aaecda50ba6a0df6bd047af7b4bfaa4641db9610fe768`; его идентичность подтверждена. Неизменны **27 файлов**, включая все **17 PNG**.

| Изменённый public файл | Было bytes | Стало bytes | Actual C03 SHA256 |
|---|---:|---:|---|
| assets/manifest.json | 59960 | 66026 | 13f443587180095cb701564ee7cdd24a3e1e062932cc075a3cb1de37e056ef91 |
| data/preview-input.json | 1502 | 2413 | 5fa16917bef327c65914b225c8258b01cc63d6e086316f9e3bb65f685ac401a2 |

- Staged manifest семантически равен C02 после исключения единственного `near-ledge.sourceClipPx`. Внутри этого объекта изменены polygon (23 → 55 точек), expectedVisibleBoundsSourcePx, limitations и provenance; coordinateSpace сохранён. Новый объект точно совпал с exact source mini03, polygon — с newSourcePolygonPx в DELTA. Остальные clips, textures, instances/bindings, receiver policy и anchors идентичны. Это проверка состава данных, не художественной правильности контура или движения.
- preview-input равен C02 вне artistManifest; новая artistManifest metadata точно совпала с index. Support/provenance refs остаются metadata, raw authoring/DELTA/evidence не добавлены в public file list.
- inputPins C03 и C02 семантически идентичны: P1 `4b47db04c7140ebf88f69b91faa0b790d46f22ec`, native `5a6fa03f1cdb3de88a2d9c7dbe795eb8e2a7f023` / tree `008d16a80a26bb77d562a45218b01da09b0d9ff0`, config/projection/view-math, physics/RNG/counts. Actual config, targets, input verification, P1 manifest, dependency lock/pins и compiled app bytes также неизменны. Native/source execution checks не повторялись; новая гарантия физики не заявляется.
- THIRD_PARTY_LICENSES.txt идентичен C02: **9330 bytes**, SHA256 `583c1487aefadfa1b72c181ab73a5f7a2030afb0545cf49b90ff66973faef82f`; dependency lock **4341 bytes**, SHA256 `b1bdcd0eb94d0d5c7bb11195eae7d90c16ac9e006484d2a9a192c851559e7678`. После подтверждения идентичности перенесены прежние scoped license/colord checks, без повторной проверки installed packages или registry/download. Grant приватному Millionko не выводится.
- PNG hashes/bytes идентичны, поэтому прежние container/C2PA-marker проверки перенесены без повторного чтения chunks. Прежний предел — отсутствие полной C2PA semantic/signature validation — сохранён.
- Только два изменённых public JSON проверены прежними privacy rules: source-map/inline sourcesContent, private native/staging path и credential markers не найдены. File whitelist не расширился, raw TS/maps/private staging не добавлены. Предел статического marker scan остаётся прежним; не заявляется обнаружение любого возможного секрета.

## Evidence и ресурсы

Own runtime: `E:/R4D/perspective/p5-runtime/release-engineer/output/c03-local-preflight-01/`.

| Evidence | Bytes | SHA256 |
|---|---:|---|
| delta-privacy.json | 12796 | ec49218a8aa74509f632b67744b4db1e840ceea8a515ab3623fb6aba779aa66d |
| preview-metadata.json | 276 | 490949df077053770dceca653ef3b11710a30e323f324ea7282f5dfef2129586 |

Guard 01:01:40 UTC: RAM free15.505/31.907 GiB, system CPU12%, aggregate sample~11%, aggregate WS19.878 GiB/385 процессов; C/D/E free16.288/16.281/12.000 GiB. Own peak estimate0.3 GiB RAM/<0.001 GiB output плюс allowance4 GiB RAM/2 GiB E соблюдён. Общие настройки и чужие данные/процессы не менялись. Новых failure/denial в этом проходе не было.

## QA и закрытый delivery gate

По адресному handoff Lead оба независимых C02 отчёта воспроизвели C02-V01: TQA `a3fac041969bcc287ae5fbb0c25a53a71034d4ea:experiments/p5-regenerated-objects/qa/technical/REPORT_C02.md` (blob `4794b261a1be65d4825e8bcb8e5b5770259bd7a2`), VQA `c662b0badfb5e44fb5ab6a55a8152f1570d18f0f:experiments/p5-regenerated-objects/qa/visual/REPORT_C02.md` (blob `0d1aa7c3f46f8be975cc93cd80eeb61537dd0a9b`). Пути/blobs подтверждены через свой Git; сами продуктовые проверки не повторялись. C02 PASS не переносится и не заявляется.

Окончательные независимые TQA/VQA C03 ещё pending; Builder selfcheck не заменяет их. C02-V01 не считается закрытым на основании статической дельты: проверка полного near edge, seed4210403976/t674–676 и затронутых переходов остаётся QA. Frozen index knownLimits сохраняются, локальный preflight их не смягчает.

Draft CTO request из PREFLIGHT_C02 заменяет candidate на exact C03 index/hash и 29 файлов/21675411 bytes выше; existing target `/review/r4d/p5-regenerated-objects/`, alias `vps1-direct`, opaque wrapper и границы действий/rollback прежние. Реальные server destination/mapping/baseline/catalog/docs/rollback данные по-прежнему pending и не собирались. Новый exact CTO review и single-use token отсутствуют; release gate **closed**. Проверка упаковки завершена, выпуск не начинался.
