# P5 C02: локальный preflight и draft запроса CTO

29 октября 2026, Europe/Kyiv; локальные проверки 00:37–00:44 UTC. Это проверка упаковки C02, не выпуск, QA PASS или финальный live seal. Server reads/writes, SSH и HTTP = 0. Public root не менялся и не копировался; archive/rebuild/install не выполнялись.

## Exact candidate и источники

Handoff: `af23e124cf5bd1d9de884082ffbc993448217112:experiments/p5-regenerated-objects/builder/HANDOFF_C02.md`, blob `8e990a3f027cb7d46bcc4e9e2a40f90962583783`. Consumer: `398b0daaaad914cc67b8390a51454d21db524e7a`, prefix `experiments/p5-regenerated-objects/builder/`.

Проверен непосредственно root `E:/R4D/perspective/p5-runtime/builder/output/previews/c02/public`; producer index — соседний `index.json`. Ни parent private staging, ни чужой продукт не копировались.

| Actual bytes | Bytes | SHA256 |
|---|---:|---|
| index.json, вне public | 10707 | f40040bb40d529b7bf1f289e661d69f7f882fddfc962e40cdc5616a59c9d9389 |
| app.js | 571012 | 4a003dd39212f21b7a3dd1baa82c0d0738af3a9767c6e51225b9b54f5aac325c |
| assets/manifest.json | 59960 | 275ade538d30119434723339487cf7d036a35bbbefe4ad6807f4dd810a6e4491 |
| THIRD_PARTY_LICENSES.txt | 9330 | 583c1487aefadfa1b72c181ab73a5f7a2030afb0545cf49b90ff66973faef82f |
| data/dependency-lock.json | 4341 | b1bdcd0eb94d0d5c7bb11195eae7d90c16ac9e006484d2a9a192c851559e7678 |

Artist source `4990463ec6eabf89aa47f58f9b59f703cbf739ba`; original mini02 manifest 83772 bytes/SHA256 `6055be855714bc9ad66a0e803fc392fbd8e01d94a9798536e7047c06d5d2a331`. Его staged representation указан в таблице; полная provenance остаётся вне public root.

Frozen index сохраняет P1 `4b47db04c7140ebf88f69b91faa0b790d46f22ec`, hashes config/projection/view-math, native `5a6fa03f1cdb3de88a2d9c7dbe795eb8e2a7f023` / tree `008d16a80a26bb77d562a45218b01da09b0d9ff0`. Frozen dependency lock сохраняет Node v24.15.0, Pixi 8.17.1, esbuild 0.25.12, native pnpm-lock SHA256 `471b2ec0c5900a87c2469490b31e9408e9a0ecf2d332366ab9006d8c34566518` и build-input-inventory SHA256 `681c2ceb7cfac081782ada8f2035afb6af162f50c5e745291d687b11c5a4f498`. Это проверенные bytes записи pins; физика, проекция и полный build-input audit здесь заново не исполнялись.

## Что проверено и границы вывода

- Все 29/29 файлов, 21668434 bytes, совпали с whitelist index по относительному пути, bytes и SHA256. Missing/mismatch/extra/reparse = 0; inventory не содержит unsafe/duplicate paths. 17 PNG и 12 текстовых файлов, без raw TS, maps, archives, hidden credential/config файлов или source dumps как отдельных файлов.
- В текстовых файлах ограниченный rg scan не нашёл sourcesContent/sourceMappingURL/sourceURL, private source/staging path markers, private-key/token/credential-assignment markers. Чувствительные глобальные файлы не читались. Это ограниченная статическая проверка, не обещание обнаружения любого возможного секрета.
- PNG container bounds корректны. Chunks: IHDR/caBX/IDAT/IEND; tEXt/iTXt/zTXt/eXIf отсутствуют. В 17 PNG сохранены 387934 bytes caBX/C2PA; bounded scan не нашёл source/private-path/credential/prompt/ref markers. 110 первоначальных коротких drive-like совпадений относятся к хвостам URL schemes, standalone drive paths = 0. Metadata не удалялась. Полная семантическая и криптографическая C2PA-валидация не проводилась.
- С actual read-only common dependencies сверены package.json hashes всех 9 packages frozen lock и тексты лицензий. Все 8 runtime license blocks включены ровно по одному с точными bytes/hash; esbuild помечен buildToolOnly, его LICENSE не требуется как runtime block. Набор: MIT — @pixi/colord 2.9.6, @xmldom/xmldom 0.8.11, eventemitter3 5.0.4, ismobilejs 1.1.1, parse-svg-path 0.1.2, pixi.js 8.17.1; ISC — earcut 3.0.2; BSD-3-Clause — tiny-lru 11.4.7. Лицензионные notices сохранены в terms.
- Colord supplement взят из `365e8220221c6f26983e65f4496d875a9a222b1c:experiments/p5-regenerated-objects/builder/licenses/pixi-colord-2.9.6/`. SOURCE.json: 8932 bytes/SHA256 `c9d2b53dbcbd6598a9e5e1473091d00e7de11c4a2d0df6b071d9f06815264f77`. Official gitHead `5344fbf77b736f81cd33c21050021bc09bc9dd1d`; LICENSE.md 1083 bytes/SHA256 `7613d4594ee8b6163926af3435dae61c9e3d5a27cd137bd76a543ba40002d8fc`, blob `e437003733acd123c76c2a9df0c13a6f3b02b51e`. Все 42 installed files совпали с SOURCE pins, extras/mismatch = 0; exact license присутствует в terms ровно один раз. Registry/archive в этом проходе не запрашивались: связь с official npm опирается на pinned SOURCE evidence и самостоятельное сравнение installed bytes, а не новый download.
- Compiled private native runtime допускается контрактом P5. Никакой MIT/open-source grant приватному Millionko из third-party terms не выводится.

## Локальные evidence pins

Каталог только собственного runtime: `E:/R4D/perspective/p5-runtime/release-engineer/output/c02-local-preflight-01/`. Это evidence, не public package.

| Evidence | Bytes | SHA256 |
|---|---:|---|
| inventory-privacy.json | 12527 | a03eb0144885fb1e7f2aaecda50ba6a0df6bd047af7b4bfaa4641db9610fe768 |
| license.json | 9871 | c234d92e4bceb9eb3a29b00bc46ec76b623cacfc687e84b82c486a352f90cad7 |
| png-provenance-refined.json | 8439 | 7800f7528b8802688ce56c2a53644dd9f827797df3c792450ecea397ce0723fe |
| png-url-classification.json | 388 | 94c2ce9f6ef350e81fda2ebc9d020ff04dfa07ab2b4493698e525611eefb003a |

Earlier png-provenance.json оставлен append-only: его sha256 относится к UTF-8 decoded/reencoded payload; raw payload digests находятся в refined evidence, классификация всех 110 URL hits — в последнем файле. Первичные ordinary check failures: unsupported PowerShell ReadOnlySpan и отсутствующий предполагаемый top-level colord alias. Исправлены локальное чтение chunk length и путь по exact consumer runtime.mjs; продукт не исправлялся, denial не было.

Guard 00:37:45 UTC: RAM free 15.601/31.907 GiB; system CPU 3%, aggregate sample ~6%, aggregate WS 19.855 GiB/407 процессов; C/D/E free 16.327/16.281/12.030 GiB. Own peak estimate 0.3 GiB RAM/<0.001 GiB output плюс concurrent allowance 4 GiB RAM/2 GiB E соблюдён. Чужие процессы/данные не менялись.

## Draft exact delivery request CTO — пока не token

После обеих окончательных независимых TQA/VQA именно C02 запросить single-use разрешение на доставку **только** candidate с index SHA256 `f40040bb40d529b7bf1f289e661d69f7f882fddfc962e40cdc5616a59c9d9389`, его 29 перечисленных файлов/21668434 bytes, consumer398b и staged manifest275ade из таблицы.

- Existing alias: `vps1-direct`; existing PUBLIC URL target: `/review/r4d/p5-regenerated-objects/`. Предлагаемое действие: перенос только whitelist public root без rebuild и без копирования parent staging; минимальная собственная catalog entry и docs update только если они явно перечислены в новом token. Shared wrapper остаётся opaque; nginx/security/credentials/access и соседние продукты не меняются.
- **Pending до exact token:** реальные absolute destination root и raw-root-only HTTP mapping; текущее наличие/содержимое target; baseline/rollback snapshot и hashes; exact catalog path/entry/baseline; конкретные docs/docprefix/baseline и разрешённые строки изменений. Эти данные не добывались. Draft с такими pending полями не является исполнимым запросом на неопределённые серверные изменения.
- Rollback в token должен назвать прежний target snapshot/hash и точные собственные catalog/docs изменения. Если root существовал — вернуть согласованный прежний root; если отсутствовал — убрать только созданную P5 публикацию и её разрешённую entry. Append-only журналы дополнять записью об откате. Общий vhost/shared wrapper и чужие процессы не откатываются. Неизвестное отклонение само по себе не вызывает automatic rollback.
- После разрешённого выпуска достаточно bounded delivery check exact target/resources/MIME/hash и сохранённого replay на опубликованных bytes; повторять product/native/art QA без дельты не требуется. Запрещённые parent Review GET/403, historical denied composite и file:// не являются fallback.

Gate остаётся закрыт: окончательные TQA/VQA C02 ещё не получены, новый exact CTO review/single-use token отсутствует, server baseline/path/catalog/rollback pending. Known limits остаются в frozen index/handoff без смягчения: coarse foreground contours, unpartitioned side rails, receiver/floor/rope/occlusion/entry требуют независимой оценки. Если QA приведёт к C03, этот preflight не объявляется final для новых bytes: применяется адресная delta к inventory/privacy/licenses и затронутым QA. Release Engineer не чинит продукт и не подменяет QA.

## Уточнение по адресному handoff Lead

До завершения этого preflight Lead передал finding VQA **C02-V01**: near-ledge polygon накрывает открытый пол на seed `4210403976`, tick `676`. Release Engineer не воспроизводил продуктовый дефект и не менял продукт. Artist готовит clip-only исправление для C03; C02 immutable и не объявляется готовым к release. Draft выше сохраняет точную идентичность C02, а не разрешает выпуск будущего C03.

Ожидаемая дельта — declared clip data/derived manifest/package pins при сохранении 17 PNG/native/receiver bindings. Это пока ожидание Lead: подтвердить его по actual C03 index и file/hash delta. На новую версию переносятся только доказанно неизменные проверки; затронутые privacy/inventory/QA проверяются адресно. Server reads/writes, SSH/HTTP и token gate остаются без изменений: 0 и closed.
