# P3 transfer — тёмная доска: локальный release plan

29 октября 2026, Europe/Kyiv. Release Engineer `release-engineer-r4d-p3-masks-01`.
**LOCAL_PLAN_COMPLETE_WAIT_FROZEN; server_write=false.** Это схема будущего
выпуска, не frozen candidate, не готовый bundle/manifest и не QA verdict.

## Начальный checkpoint и полномочия

Actual turn `01a186fc-4d21-7c02-955d-3731d997bef5` подтверждён own read_thread metadata.
Стартовый HEAD `390e178ecc044cadb9b67f4a2506d5efdc171fef`, прежняя ветка
`codex/r4d-p3-masks-release-engineer-01`, status porcelain пустой.
Первое действие — Git HEAD/branch/status и чтение карточек; затем локальные
SHA256 двух JPG и exact Git objects. Никаких SSH/live capture/server calls.

Полностью прочитаны на `c6603f0f327350172df44687a4d4ead19e0e5e6b` в заданном порядке:
`P3-transfer-water-dark.md`, `P3-masks.md`, `ORDER.md`, `P2-P6-transfer.md`.
Новое прямое решение Max09:04:16UTC/уточнение09:13:39UTC разрешает начать
перенос сейчас параллельно P5; меняется только прежняя очередность.
P5 получает следующее серверное окно первым. Старый Jungle token закончен.
Новых threads/roles/worktrees/веток/checkout не создавалось.

## Закреплённый вход этой доски

P1 coordination STATE выбирает board02/trial-01 и research candidate-01. Это собственные Dark config/manifest/projection; Water и Jungle числовые профили сюда не подставляются.
Все записи ниже извлечены read-only из P1 `4b47db04c7140ebf88f69b91faa0b790d46f22ec`.

| Вход | Exact path / SHA256 canonical LF |
| --- | --- |
| Original image | `K:\Agents\R4D\Assets\perspective\02-dark-temple.jpg` / `7ceff71bd0a871fecd725527dff5522450c8e75a74eb99c107b5d8624bf8fa3a` |
| Config | `experiments/p1-collider-mapping/clean-repeat-01/simulation/boards/02/trial-01/config.json` / `14be2a023833d266d1e333bf582af5fd5885deb445698c10ebd846ef0cc080b2` |
| Manifest | `experiments/p1-collider-mapping/clean-repeat-01/simulation/boards/02/trial-01/manifest.json` / `3fab422bd1f74d477d1648620c97ad6d7b8b0a55a70a1102d6e6885def564d81` |
| Projection | `experiments/p1-collider-mapping/clean-repeat-01/research/board02-projection.candidate-01.json` / `4dfa46589bb3fdfc8e2ad8ff2554737697e3ce9172c5b8d5c5583577df0c8c48` |

Raw Git bytes уже LF и имеют те же hashes; blob IDs/размеры зафиксированы в
[RELEASE_PLAN.json](RELEASE_PLAN.json). Config/projection hashes совпали с
закреплённым manifest; JPG independently совпал с source hash. Counts:
12 pins / 70 segments /4 buckets/1 drop.
`nativeToSource`/`sourceToNative`/translation/domains сохраняются.
Историческое provisional/no-acceptance поле manifest не переписывается:
текущая приёмка P1 задана поручением CTO; transfer QA ещё не проводилась.

Native pin из поручения: `5a6fa03f1cdb3de88a2d9c7dbe795eb8e2a7f023`, tree
`008d16a80a26bb77d562a45218b01da09b0d9ff0`; private TS здесь не читались.
Неизменённый Millionko/PixiJS, r16/tick5ms/g980/speed2000/noise2deg/0.02/
lcg32/quantize7, обычный новый seed меняет только rng.seed. Подмена geometry,
перспективы или физики релизом не допускается; общий mapping blocker идёт
через Lead к CTO с обычным replay. Незатронутая доска может продолжаться.

## Исходный P3 и применённый Jungle recipe

CTO выбрал CODE `f1aca21e7b9ba19001e7e8762fcaf2511bf9bf74` / ART
`f899a308aed156a11e2a1013292ed68c6669959d`, frozen manifest
`e2e9f7d837b3d05f484f75a877af6992a70ee88363add783d80f3c6e206f431f`.
Точные links: в выбранном CODE `builder/README.md`, `ASSET_CONTRACT.md`,
`src/app.js` и `src/run-model.js`; в ART `asset-artist/assets.json`, SHA256
`98cef793f5cf9191fea315caf4bf11d727c20b2d5a9d5704972e97e02cfd2f73`,
и referenced asset prefix. Полные repo paths/refs — в JSON.

Перечитаны Builder README/contract и свой применённый
`390e178ecc044cadb9b67f4a2506d5efdc171fef:experiments/p3-masks/release/DELIVERY_FROZEN_01.md`.
Он фиксирует immutable bytes, полный opaque baseline, root-only atomic switch,
свежий before snapshot, nginx-t/graceful reload и append-only records.
Source helpers `prepare_intent.py`/`execute_frozen_01.py`/`remote_frozen_01.py`
сохранены там же как исторические ссылки. В них Jungle token/root/hash/count;
для Water/Dark их нельзя запускать или слепо копировать.

Сохраняется способ: цельный JPG, source-aligned alpha regions, отдельные
shadow/ball occlusion passes, depth от native оснований/scalar либо линии
по контракту, без seed/tick условий. Это не новый алгоритм от Release.
Сначала сохраняется результат применения исходного способа; существенная
смена метода требует отдельного сохранённого результата и объяснения Builder/Lead.
Jungle PARTIAL/MAP-01 left-5 seed2818447218/t612 и post-auth limitation
остаются исторической правдой. Jungle files/raw/frozen/page и QA не меняются.


Закреплённые исходные ссылки: [recipe README](https://github.com/SuperflightMax/R4D/blob/f1aca21e7b9ba19001e7e8762fcaf2511bf9bf74/experiments/p3-masks/builder/README.md),
[depth/alpha contract](https://github.com/SuperflightMax/R4D/blob/f1aca21e7b9ba19001e7e8762fcaf2511bf9bf74/experiments/p3-masks/builder/ASSET_CONTRACT.md),
[renderer/depth source](https://github.com/SuperflightMax/R4D/blob/f1aca21e7b9ba19001e7e8762fcaf2511bf9bf74/experiments/p3-masks/builder/src/app.js),
[Artist assets](https://github.com/SuperflightMax/R4D/blob/f899a308aed156a11e2a1013292ed68c6669959d/experiments/p3-masks/asset-artist/assets.json),
[применённый Jungle release recipe](https://github.com/SuperflightMax/R4D/blob/390e178ecc044cadb9b67f4a2506d5efdc171fef/experiments/p3-masks/release/DELIVERY_FROZEN_01.md).

## Изоляция и требования к будущему freeze

Role area: `experiments/p3-masks/transfer/dark/release-engineer/`.
Heavy runtime: `E:\R4D\perspective\p3-runtime\release-engineer\transfer-water-dark\dark`.
Будущий sibling URL: `/review/r4d/p3-masks-dark/`. Нынешнее наличие на VPS не проверялось.
Config/assets/logs/candidates/ports другой доски сюда не смешиваются.
Готовых пакетов, ports/PID, live hashes и release targets сейчас нет.

От Builder нужны только названные готовые bytes: candidate/source/art/build
identities, file-manifest exact bytes/hash, payload inventory, board-specific
P1/image/native provenance и метод/изменения. Release не пересобирает.
Две независимые QA должны назвать **этот** board и тот же manifest hash,
дать отдельный verdict/coverage/limitations и ordinary good/bad replay refs.
Прямоугольные/многогранные препятствия, углы, передние и боковые проходы; нужны actual соседние силуэты и движение. Численная смена глубины при проходе сбоку сама по себе не QA.
Jungle QA или успех другой доски сюда не наследуются. Финальный статус и
caveat карточки приходят от QA/Lead/CTO, сейчас не придуманы.

## Manifest / hash guard / rollback / catalog delta

[RELEASE_PLAN.json](RELEASE_PLAN.json) содержит четыре раздельные схемы с
незаполненными future values; null не является выполненным guard или hash.

1. Manifest: все относительные path/bytes/SHA256 и input/build/QA identities;
   собственный hash снаружи, private TS/maps/raw logs/credentials не раздаются.
   Browser modules `.js`; Node-only `.mjs` не переименовываются. В будущем full
   release manifest включает весь свежий Review tree и лежит вне `/review/`.
2. Guard: в отдельном разрешённом future этапе после P5 зафиксировать actual
   root/manifest/snippet/normalized-config/opaque inventory/modes/UTC и отсутствие
   всех новых targets. Ни Jungle root/hash 28 октября, ни baseline другой доски
   не считаются текущими. Если sibling уже доставлен, он становится частью
   сохраняемого opaque baseline. Повторить guard перед первой записью и switch.
3. Rollback: собственные release/backup/temp IDs только после named freeze и
   нового token. Свежий exact before-snippet + UTC. Restore лишь если live root/
   snippet всё ещё наши; не затирать следующего writer. Уже доставленный sibling,
   Jungle, old roots/DB/sessions не удалять/не откатывать чужим snapshot.
4. Catalog: одна новая карточка именно `/review/r4d/p3-masks-dark/` в существующем формате,
   только её counter delta от свежего фактического числа. Все прежние карточки,
   Jungle и sibling bytes сохраняются; reverse delta возвращает exact baseline.
   Сейчас нет текущего catalog capture, готового diff или одобренного verdict.

В будущем каждая публикация получает собственный конкретный intent/вердикт
и явно связанный CTO token/write-set; готовность одной не запускает вторую.
После разрешённой доставки — actual byte/MIME/auth/navigation smoke;
auth303/login HTML не доказывают post-auth JS body/UI. Не добывать login/
cookies и не менять global MIME/auth/security ради smoke; непроверенное назвать.

## Предел текущего прохода

Это только небольшой локальный plan: тяжёлого шага нет. Перед будущим тяжёлым
шагом — fresh system-wide RAM/CPU/C/D/E и совокупная оценка с P5/Millionko;
E≤4GiB диагноз, E≤2GiB безопасный checkpoint/stop, прежний10GiB reserve не применять.
Temp/cache/output только own E runtime, env process-local. Raw/worktrees не
чистить/архивировать, чужие процессы/каталоги/UGH не трогать. При policy denial
остановить именно операцию и сообщить exact action/target/toolcall/reason,
не читать sensitive policies/configs/keys и не обходить отказ.

**SSH/live capture/locks/upload/staging/nginx/service docs/server cleanup/token
в этом проходе не выполняются.** После commit+push остановиться без ожидания.
Lead вернёт Release только по готовому frozen intent; P5 server window first.
