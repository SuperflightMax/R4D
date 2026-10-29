# P5 Regenerated Objects — рабочая карточка Lead

Старт: 2026-10-28 22:16 UTC (2026-10-29 Europe/Kyiv). Это состояние исполнения, не изменение заказа.

Восстановление 2026-10-29 после ручного restart завершено: собственные HEAD/branch/status/checkpoint проверены, checkout был clean на `3c2105820d8dbefc971fe97fc7086f743b9b9721`. RESULT этого commit сохранён без изменений. Lead recovery turn `01a186dc-2aea-72a2-b12f-c8ac7c0ac2e6`; ровно одно continuation отправлено прерванному Release после fresh interrupted/no-duplicate check, его новый turn `01a186dd-d379-7011-ab7d-daa6796e2048`. Actual receipt и completed actions — [RECOVERY_C03.json](RECOVERY_C03.json). Exact local review handoff — [CTO_REVIEW_C03.md](CTO_REVIEW_C03.md), включая canonical Git bytes/SHA всех отчётов. Release draft completed/pushed `8236f5f5c563ebdd33849a60ef64dfee823674e4`, worktree clean, STOP/idle. Полный delivery intent ещё требует отдельного CTO поручения с target/catalog/fullbaseline/docs/rollback параметрами. Продукт/build/QA не повторялись; новых server reads на recovery0, serverwrites0/tokenотсутствует. Lead после фиксации handoff STOP/idle до решения CTO.

## Полномочия и границы

Новое решение CTO после полного review `faf096c`: C03 принят как лучший проверенный результат ограниченной локальной попытки; общий P5/FullArt PASS не присвоен, остатки receiver02/04/rails/contours сохраняются. Отдельно разрешён полный LOCAL sealed intent в exact `E:/R4D/perspective/p5-runtime/release-engineer/p5-review-release-intent-03-final-01` и ограниченные fresh operational reads, включая два opaque full PUBLIC inventories и собственную catalog delta. Server writes0/token не выдан. После fresh own clean + Release completed/idle/no-duplicate checks отправлено ровно одно continuation; actual receipt/turn/первое completed действие — [INTENT_C03_FINAL01_DISPATCH.json](INTENT_C03_FINAL01_DISPATCH.json). Release turn `01a186eb-770c-7fa0-8fda-a19c72dcdbea` создал один local target после ABSENT, заканчивает sealed intent и затем STOP/idle для нового CTO review. RESULT, production и завершённые QA не переделываются; completed Builder/Artist/TQA/VQA не будятся.

CTO адресно открыл Stage 2 существующей команде после подтверждённой публикации P4; delivery window освобождён 2026-10-28 22:11:01 UTC. Человеческое основание: R4D 64061757802dc60770ab156ef5672af741d65d03, work/requests/PERSPECTIVE_POST_P1_UPDATE.md, пункт 3 и заключительные абзацы. Поручение разрешает пять адресных передач существующим специалистам. Другие команды/роли/worktree/subagents не создаются; P6 не запускается.

Неизменяемые требования: ORDER редакция 4 и P5 card на R4D 64061757802dc60770ab156ef5672af741d65d03; Staff e9dfa0e32226e3f72de1f75e5c77a43d5ebfd9b3; Playbook c32f3ee79ca73c1bf87e8ee6a9c0844252568f3e/blob d3066526699a9a21fb8e8e5806958fbd105c8cf2. Реализации, арт, маски, кандидаты, результаты и Review P2–P4/P6 не используются. Общие P0/P1/native/deps и opaque publication wrapper допустимы.

## Владельцы

| Область | Существующий чат | Собственный каталог worktree/runtime |
|---|---|---|
| Lead | текущий | lead |
| Pixi/native consumer, схема и сборка | 01a1842d-b417-7d60-a517-13b4007efc3b | builder |
| Генерация, художественная подготовка и provenance | 01a1842d-becc-7012-b425-bc311371f6f9 | asset-artist |
| Независимая техническая проверка | 01a1842d-c7b2-7842-a27f-a3b29c18673a | technical-qa |
| Независимая визуальная проверка | 01a1842d-d2ce-76a0-ba58-d47073a5db7c | visual-qa |
| Privacy/package/delivery | 01a1842d-ddd8-7b20-a27a-2ebc52ecea57 | release-engineer |

Корни: E:/R4D/perspective/p5-worktrees/<role> и E:/R4D/perspective/p5-runtime/<role>. В чужие checkout не писать. Исходники и manifests передавать точными Git commit/path; тяжёлые private/raw/evidence — разрешёнными read-only path+SHA256+bytes. Для собственных изменений commit/push в свою codex/r4d-p5-regenerated-<role>-01. Каждая область имеет одного пишущего владельца. Lead собирает ссылки и коррекции, не пишет product вместо Builder/Artist и не проводит вместо QA их приёмку.

## Общие входы

- Read-only JPG: K:/Agents/R4D/Assets/perspective/01-jungle.jpg, 1536x1536, SHA256 c8f9e4245c1de8c2086e615bc75dc10aea59b76b614d6e106593e07262e24f72.
- Accepted P1: 4b47db04c7140ebf88f69b91faa0b790d46f22ec; prefix experiments/p1-collider-mapping/clean-repeat-01/.
  - simulation/boards/01/trial-01/config.json: 9503 bytes; SHA256 dd5c519cd6d4b7295118e0a3a1063efed424a0ce739450bd5153c6a9941982db.
  - simulation/boards/01/trial-01/manifest.json: 11565 bytes; SHA256 7784dc0a215d0e472cf06a4eee03793592727cf0fa9a1fa0e0c78e5f1d17da18.
  - simulation/projection.mjs: 614 bytes; SHA256 b59a0c1e6c34b417d253178457ef3580b8bea0aa89c989d1342f9376e19b9431.
  - viewer/src/view-math.mjs: 3050 bytes; SHA256 96f01cc2093c353ff958cb906fe0c8ae93412425d0f7a5ec7cca0f2bf9f1aa5e.
- P0 recipe: ee4d8e5c7dbb3b6618d58d6dacb0caf9b73dfb1b:experiments/p0-perspective/research/CROSS_SERIES_CONCLUSION_AND_RECIPE.md. Recipe не диктует вид ассетов.
- Private Millionko source read-only: D:/dev/millionko, exact 5a6fa03f1cdb3de88a2d9c7dbe795eb8e2a7f023, packages/sim-core tree 008d16a80a26bb77d562a45218b01da09b0d9ff0. Материализация только exact Git bytes в собственный private E runtime; source checkout не менять. Raw private TS/maps/dumps не публиковать; допустимый compiled runtime+licenses проходят privacy-check.

## Единый контракт данных и сборки

1. Различать native simulation units, принятую проекцию P1, source-image pixels 1536x1536, texture-local pixels и viewport CSS/device pixels. Native coordinates, config/IDs/radii/drop/buckets, projection translation/matrix и tick/RNG не изменять ради арта. Builder публикует точную схему/пример и математику соответствия; Artist готовит manifest к ней до полного набора. Общие ошибки входа — отдельные findings, без скрытой подгонки.
2. Каждая generated texture/part имеет стабильный id/family, роль, exact file SHA256/bytes, ширину/высоту px, alpha policy и измеренный alpha/visible bounds, texture-local ground anchor, привязку к source/native anchor и целевой ground footprint/размер. Поворот/масштаб объясняются согласованием с принятой геометрией, не траекторией. Ball: r16 в native через принятую проекцию; без произвольного увеличения. Height/silhouette не выдавать за footprint.
3. Для parts/теней явно указать parent, слой/occlusion role, общий ground anchor, свет, offsets и состав. Частичное скрытие проверяется в движении: сортировка по центру не считается доказательством. Floor/receiver/foreground также заново генерируются; original crops только refs. Читаемые тени, опора, свет/резкость/объём оцениваются в сборке при обычном масштабе.
4. Provenance включает source/ref pins, реальные prompts/tool outputs, raw/candidate/selected/final связи и существенные коррекции. Artist владеет ассетами/provenance; Builder — consumer manifest/schema/rendering. Минимальный первый handoff: floor, несколько разных obstacle families, ball+shadow и необходимая foreground/receiver part. Не ждать всех 25.
5. Native defaults/fields/API сверить по exact source: r16, tickMs5, quantizeDigits7, gravityY980, maxBallSpeed2000, angleDeviationDeg2, bounceDeviation.02, lcg32; 25 pins/16 segments/4 buckets/1 drop. UI view/art/geometry/pause/step/replay не меняют состояние/RNG кроме явно запрошенного шага или нового/повторного запуска. Обычные seeds, проблемные replays сохраняются, отбор только красивого запрещён.
6. Consumer: PixiJS; независимые Арт/Геометрия; геометрия из actual config поверх арта, без невидимых масок при отключённом арте; pause и точный tick step/replay. Небольшой стенд без редактора. Native integration и actual browser runtime отделяются от model/code assertions.
7. Preview только own localhost после проверки свободного порта. Builder фиксирует owner PID/session/URL/root; QA согласует доступ и не управляет чужими устройствами. Остановка только собственных процессов. Новый public/security/credentials доступ не создавать.
8. Frozen handoff: consumer commit, asset-manifest commit+hash, build file hashes, config/projection/native pins, dep/lockfile pins, package privacy listing, воспроизводимый запуск, обычные seed/tick cases и known defects. TQA и VQA независимо проверяют эти же exact bytes; значимые дельты требуют адресной перепроверки, не бессмысленного повтора готовых матриц.

## Порядок, бюджет, ресурсы

Ориентир попытки 8–12 активных часов включает коррекции и независимые QA; ожидание/очередь отмечаются отдельно. Первый материальный checkpoint через 90–150 активных минут: generated элементы разных типов+floor+ball/shadow+foreground в реальном Pixi/native, anchors/scale/light и первые полезные независимые замечания. Оценка пересматривается по этому результату; это не autoPASS и не автоматический cutoff.

Builder и Artist начинают совместимость на малом наборе; TQA независимо готовит common/native/projection oracle, VQA самостоятельно знакомится с Jungle/P1 и входит в раннюю реальную сборку; Release сейчас только короткая read-only/local подготовка контракта delivery/privacy/QA handoff. Lead передаёт согласованные интерфейсы и связные исправления по первичной причине, отмечает потраченное время и материальный прогресс.

Перед тяжёлым шагом fresh systemwide+aggregate guard, собственная оценка peak и allowance другим процессам: 4 GiB RAM/2 GiB E. Учитывать initial imagegen writes на C. TEMP/TMP/cache/output/staging только own E/process-local, без global settings/CODEX_HOME/security redirects. E <=4 GiB warn+diagnose, <=2 GiB safe checkpoint STOP; чужие PID/data не чистить. Lead sample 22:16:27 UTC: RAM free16.967/31.907 GiB, CPU10%, C16.220/D16.282/E12.203 GiB.

Исторический denied composite call_7b166cdf46834d468b5f9c297aad6e9f не повторять, не дробить, не переносить; file:// не fallback. Новая denial останавливает exact action/target и same-target обходы; сообщить call/action/target/primary reason. Обычную ошибку классифицировать по первичному тексту, без выдуманной policy/race причины.

Release gate закрыт: серверные writes сейчас 0. После лучшего разумного результата нужны frozen bytes, обе независимые QA, новый exact CTO review/single-use token. Existing /review/r4d/p5-regenerated-objects/ и shared wrapper сохраняются opaque. Закрытие попытки отдельно от technical/artistic успеха; неподтверждённое прямо указывать.

## Текущее состояние

Первый материальный результат — [CHECKPOINT_C01.md](CHECKPOINT_C01.md), commit `4eeac03`. Пять actual initial send receipts и новые Stage 2 turns — [DISPATCH.json](DISPATCH.json), commit `a1ca011`. Каждый специалист получил одно первоначальное поручение; дальнейшие сообщения передают интерфейсы и коррекции внутри него. Production начался. Release/server writes = 0.

### C03 проверен; готовится exact CTO review handoff

Producer freeze успешно завершён до capacity-сбоя его модели. Consumer `398b0daaaad914cc67b8390a51454d21db524e7a`, frozen root `E:/R4D/perspective/p5-runtime/builder/output/previews/c02/public`; index рядом, 10707 bytes, SHA256 `f40040bb40d529b7bf1f289e661d69f7f882fddfc962e40cdc5616a59c9d9389`. Inventory: 29 файлов / 21668434 bytes; app SHA256 `4a003dd39212f21b7a3dd1baa82c0d0738af3a9767c6e51225b9b54f5aac325c`, staged manifest SHA256 `275ade538d30119434723339487cf7d036a35bbbefe4ad6807f4dd810a6e4491`. Canonical input/native/Artist/deps pins — в producer index, не в пересказе чата.

Actual c02 preview на момент завершения QA: `http://127.0.0.1:55185/`, Builder PID21340/session26545/root c02. Формальный handoff pushed/clean `af23e124cf5bd1d9de884082ffbc993448217112:experiments/p5-regenerated-objects/builder/HANDOFF_C02.md`. Capacity recovery завершён без изменения настроек или повторения freeze/replay. Builder получил следующую адресную сборку; перед новым QA нужны актуальные owner/root pins. C02 остаётся неизменяемым.

Обе independent QA завершены и pushed: TQA `a3fac041969bcc287ae5fbb0c25a53a71034d4ea:experiments/p5-regenerated-objects/qa/technical/REPORT_C02.md`; VQA `c662b0badfb5e44fb5ab6a55a8152f1570d18f0f:experiments/p5-regenerated-objects/qa/visual/REPORT_C02.md`. TQA подтвердил package/native/control invariants и 100 actual snapshots; VQA положительно оценил полный Jungle, материалы, свет, тени и опору. Receiver01/03 visible entry и Field закрывают прежние findings. Общего PASS нет: обе QA независимо подтвердили C02-V01 — расширенный near-ledge clip закрывает сферу над открытым полом. Native/config/P1 не являются причиной.

Artist clip-only correction pushed `a5ec68fb2ed6aeacd8c66bc575166567bd0c3966:experiments/p5-regenerated-objects/asset-artist/HANDOFF_MINI_03.md`. Manifest mini03 89838 bytes SHA256 `a083143b199f78cefe2725907b91385145cb9c29067ad319dd862974a13714a0`; FOREGROUND mini03 15922 bytes SHA256 `118abd360f963b6088dab47f23c56554e9d4b31ef718d91345954fa3cc97e870`; DELTA 12713 bytes SHA256 `0dbab3cffcc65ced429fccf0993533e43038541c0b6370559729fec6a493de3a`. Меняется только near-ledge.sourceClipPx по всей каменной кромке; 17 PNG, остальные маски, bindings, receiver policy прежние. Контур выведен из силуэта generated floor, не из seed/tick. Статические проверки не означают runtime PASS. Builder после fresh idle проверки получил c03 build/selfcheck/freeze/handoff; затем обе QA проверят дельту и регрессии. Common/source oracle и завершённые матрицы без причины не повторять.

C03 frozen: `E:/R4D/perspective/p5-runtime/builder/output/previews/c03/public`, 29 files / 21675411 bytes. Index 11618 bytes SHA256 `17838d163e6c710cad513a68b5cd5ba5c6543a708761b96e7ee62fa362c2ef2d`; consumer pin `af23e124cf5bd1d9de884082ffbc993448217112` (c02 handoff docs, код тот же); app.js SHA256 `4a003dd39212f21b7a3dd1baa82c0d0738af3a9767c6e51225b9b54f5aac325c` побайтно прежний. Staged manifest 66026 bytes SHA256 `13f443587180095cb701564ee7cdd24a3e1e062932cc075a3cb1de37e056ef91`. Preview owner `http://127.0.0.1:55185/`, PID12500/session67163/rootc03, начат 00:58:57 UTC после штатной замены own c02 listener. C01/C02 не менялись.

После fresh idle checks назначены C03 delta-проходы: TQA turn `01a1852d-1fdf-7712-8a2e-56a26382ecc5`, VQA `01a1852d-2160-7a92-a8db-7847282255ad`, Release local audit `01a1852c-8886-7d62-8984-2f97d63110af`. Builder selfcheck completed/pushed `12e02702480ff84bf8ade352375bfb2797a6d0b0:experiments/p5-regenerated-objects/builder/HANDOFF_C03.md`:21snapshots,17exact cachedtrace matches,4lefthead snapshots только прежние seed/tick metadata. Код/bundle/frozen bytes не менялись. Все проходы относятся к тому же immutable index.

Обе final QA прочитаны полностью. VQA `e227f3874c19539b7d38f0b8d318a911e7db2915:experiments/p5-regenerated-objects/qa/visual/REPORT_C03.md`: C02-V01 закрыт; правая/центральная/левая части изменённой кромки и receiver01/03 без новых значимых visible defects. Художественная оценка положительная в проверенном исследовательском объёме; рекомендована остановка доводки и CTO review. 24own JPEG; EVIDENCE_C03.json31002 bytes SHA256 `275ba4b0f3f2443f8bb62cd49eadd0646b53860e59535b5f064704868ba076f7`.

TQA `9b2eb998ea6aba6272097b955e0a53d97234dbd9:experiments/p5-regenerated-objects/qa/technical/REPORT_C03.md`:39actual snapshots,30exact cached independent trace matches,9lefthead scoped snapshots с local replay/view invariance; terminal333 сверён с прежним actual native, intermediate independent trace не заявлен. C02-V01 закрыт независимо; useful partial/hide/reveal и entry01/03 сохранены, новых дефектов дельты не найдено. Evidence index15440bytes SHA256 `ba939a9a8f9a8b2d4cd05446484609c5481b785473fe36c144dac6a8b49b33ac`. Общего универсального/P5/release PASS нет. Lead принимает c03 как best reasonable local result для CTO review; итог и причина остановки в [RESULT.md](RESULT.md), не исчерпание бюджета.

### Сохранённые результаты c01

| Область | Точная версия и результат |
|---|---|
| Consumer c01 | `0c611039246904443128b9d12084af2c5a0ae6e6`, путь `experiments/p5-regenerated-objects/builder/`; handoff `a259c8bcbf4f3b242a1f2001f06d14a0e89a6d4d:experiments/p5-regenerated-objects/builder/HANDOFF_C01.md` |
| Generated mini01 | Artist `5085be86d5b5e9bf22619254f42b95ad3dc1320e:experiments/p5-regenerated-objects/asset-artist/asset-manifest.mini-01.json`; canonical Git LF 23553 bytes, SHA256 `7b8935f4db6f9c20ec6fc2867e115dd787a2a93982f5ef4a5588810d8470e77f` |
| Frozen bytes | `E:/R4D/perspective/p5-runtime/builder/output/previews/c01/public`; 22 files / 13937155 bytes. Index рядом: 7149 bytes, SHA256 `a19fea2f7ce677f9fa24c5822e0c411a032bd79fda58c055ff8e386ec474f4ac`. App SHA256 `39d0cc5cdc8e869df975f008057c3c408ed3e41ce40bdd870dd0f001f19f1f44` |
| Source oracle TQA | `4e989becd94a3e25b22988ca644c608b04c4528b:experiments/p5-regenerated-objects/qa/technical/REPORT_SOURCE_ORACLE_001.md`: exact native tree / 37 files, projection 1922 points, upfront seeds 0–3. Без причины не повторять |
| Actual TQA c01 | Completed/pushed `955af7f4d7d576c6296671f141e5314198eb3f1f:experiments/p5-regenerated-objects/qa/technical/REPORT_C01.md`. Все 22 файла disk/HTTP, 10 PNG metadata и 33 browser states; controls сохраняют native state/RNG/config. Ordinary seed 3957814979: LOST847 и точный replay |
| Actual VQA c01 | Completed/pushed `ca0219cf65490242a55b1b5b57591e458e556be6:experiments/p5-regenerated-objects/qa/visual/REPORT_C01.md`. Семейства, материалы, тени и опора содержательны в просмотренных кадрах; узкие flower/frog окна проверены. Ordinary seed 3339315606: LOST1709. Общего художественного PASS нет |

Coverage c01: 4/25 pins, 1/4 receivers, 10 textures / 13 instances, свой ball/shadow и generated floor в actual Pixi/native. Native/source anchors, config и projection неизменны; масштаб равномерный, XY warp нет. Остальные colliders сохранены, отсутствие их арта явно обозначено.

Обе QA c01 завершили и закрыли собственные вкладки. Исторический preview имел Builder PID32108/session55195; после их завершения Builder заменил только собственный listener для c02. C01 и mini01 не перезаписывать. Старый own PID22076 был штатно остановлен после ownership проверки; exit1 не сопровождался runtime error/denial. Новый preview требует своего root/pins и fresh ownership/free-port проверки.

Evidence TQA: `E:/R4D/perspective/p5-runtime/technical-qa/c01/`, index SHA256 `b34472b1c85021f73f24f432cb856a2e7ea29df40e3adae99a7eaf01b1edaf85`. Evidence VQA: `E:/R4D/perspective/p5-runtime/visual-qa/evidence/c01/`; Git `EVIDENCE_C01.json` рядом с отчётом, 29521 bytes, SHA256 `9523761e4e36277ca6f559a0b2a532cef7c7eee4932c18069d6d2b719977dd5e`. Raw и active C imagegen refs сохранены Artist.

### Очередь полезных коррекций

| ID | Факт и граница уверенности | Владелец и следующий шаг |
|---|---|---|
| A01: ракурс и полнота | C02: 25/25 pins, 4/4 receivers, max depth residual 3.295859 source px; generated far/mid/near variants. VQA увидел цельный Jungle, материалы/свет/объём | Все 27 imagegen invocations, refs, rejected и selections сохранены. Отдельный контакт каждого из 25 targets и все силуэты не проверены; числа не заменяют художественную оценку |
| A04 / C01-V01 / F-C01-01 | Закрыт в c02 на receiver01 seed1696420279/875 и receiver03 seed0/1956, включая realtime | Единая optical/logical anchor policy измеренно сдвигает рисунок чаш вверх примерно17.8 source px при прежних native/source targets. Entry02/04 остаётся unverified, поиск выигрышных seeds не разрешён |
| C02-V01: foreground | Обе QA подтвердили defect c02: ordinary4210403976/674–677, near-ledge захватывал открытый пол | Закрыт независимо в c03 после mini03 перетрассировки всей кромки; actual Art/Geometry и правые/центральные/левые регрессии пройдены. LOST757 сохранён. Serpent clips прежние; длинные rails не partitioned |
| C01-V02: Field | На c02 четыре чаши целиком в Field; bounds не меняются от Art/Geometry | Closed в просмотренных actual cases; c03 не меняет framing |
| P01: license | Текст @pixi/colord2.9.6 из exact upstream gitHead включён один раз; official42files совпали | Release c02 local preflight подтвердил exact license/package pins. C03 требует проверки дельты, без повторения неизменённых проверок |

### Следующий переход

Полный Artist mini02 передан Builder: frozen `4990463ec6eabf89aa47f58f9b59f703cbf739ba:experiments/p5-regenerated-objects/asset-artist/HANDOFF_MINI_02.md`. Manifest рядом: 83772 bytes, SHA256 `6055be855714bc9ad66a0e803fc392fbd8e01d94a9798536e7047c06d5d2a331`. Selected root `E:/R4D/perspective/p5-runtime/asset-artist/selected/mini-set-02/`: 17 unique PNG, 23 texture IDs, 64 instances, 25/25 pins, 4/4 receivers, ball/shadow/floor и 3 foreground regions. Max depth residual 3.2958589851 source px. BINDINGS SHA256 `8241f2b9d1c862b773a307ca352615bb634452d8950f1199b64d41540ecd24d6`; receiver policy SHA256 `1ea3c31e6a1904d8219b0ca52d79a4010eee34474dc5c8132a4d131d1fa36f1a`; canonical FOREGROUND_REGIONS SHA256 `e20ad2065c723ae1bdfe2bc2f42bf3fb60f0b997c5edf0d213986f86372daa00`. Полные длинные rails пока не partitioned, ограничения coarse near-ledge/serpent contours объявлены и требуют actual QA.

Artist housekeeping `a5f26a57833e8671bf031a2b21c1b9f990dd3c87` устранил case-only имена, сохранив FOREGROUND_AUTHORING и все product bytes mini02. Последующий clip-only mini03 `a5ec68fb2ed6aeacd8c66bc575166567bd0c3966` pushed; Artist idle. C02/mini02 immutable, c03 сохранён отдельно. Полную QA Builder не подменяет.

Решение по receiver для c02: принят вариант 1 из `3c2e50c7caa64b281480ba895e13cf309dcbd655:experiments/p5-regenerated-objects/asset-artist/RECEIVER_C01_DIAGNOSIS.md`. Измеренная optical point `[628,477]` сохраняется отдельно. Logical authored anchor чаши располагается ниже неё на clearance текущей billboard sphere: `hR = sphere-center lift в source / receiver uniform scale`, с r16 и exact P1 в центре каждого bucket. Одно правило применяется ко всем четырём receivers, без seed/tick поправок. Native/source targets/config/projection/радиусы прежние; изображение чаши относительно logical plane явно сдвигается вверх, это изменение внутреннего anchor-контракта, а не скрытая «поправка 1px». Artist передаёт aliases одинаковых PNG с рассчитанными anchors и полные inputs/outputs в policy/BINDINGS; aliases не считаются новыми генерациями. Actual QA должна проверить вход, крепление чаш к floor/ropes, обычные cases и неизменность физики. Пока это проверяемая коррекция, не PASS.

Builder source fixes: license `365e8220221c6f26983e65f4496d875a9a222b1c`, clip `8bf447629ec78a1ccb088b4ba7a784746e0aca83`, Field `5ce9130195be9bf463a574332ab90f031f1c883e`, receiver contract `2c8551e45876396e4b8f5df7f6d6c93713f89e2c`; все pushed. C02 actual QA проверили четыре семейства, leaf/wood partial/full/reveal, left-2 states475/476/477 и near-ledge/left-head windows. Адресные C03 TQA/VQA completed/pushed; Builder/Artist/TQA/VQA idle, при восстановлении не будились. Entry02/04, все rail/head crossings и все направления overlap не покрыты; общего PASS им не выдавать. Lead не генерирует, не пишет product и не заменяет QA.

Release local C02 preflight completed/pushed `c2210115c9704f47d64de782b851bc8ed7bd2b71:experiments/p5-regenerated-objects/release/PREFLIGHT_C02.md`: 29/29 hashes/bytes, bounded privacy scan, 17 PNG с сохранённым C2PA, 8 license blocks/9 package metadata. Server reads/writes/SSH/HTTP Review = 0. C03 проверяется по file/hash delta; полный live seal не выполнялся. До exact CTO request ещё нужны фактические destination/raw-root mapping, target baseline, catalog entry, doc changes/rollback в разрешённых read-only границах. Новый exact CTO review/single-use token обязателен до любых серверных writes. Неизменяемый delivery contract: `6844d9a3ab0aa7ec6f4a621f98f8f436b9fd1262:experiments/p5-regenerated-objects/release/DELIVERY_CONTRACT.md`.

C03 local preflight завершён `6c08ddd4db346bc70b1e65925497e23072400d59:experiments/p5-regenerated-objects/release/PREFLIGHT_C03.md`:29/29 inventory,27unchanged,2JSON delta privacy; PNG/licenses перенесены только после identity. В этом local проходе server operations0. Далее после fresh idle Release получил ранее разрешённый bounded operational whitelist: raw `/etc/nginx/snippets/review.locations.conf`; только hash/size/uid/gid/mode vhost и mime.types; только hash/size/uid/gid/mode/inode двух названных service/CHANGELOG docs. Bodies mixed runbook/vhost/docs, target/catalog contents и расширение whitelist не разрешены. Цель — конкретизировать CTO request; неизвестные baseline/catalog поля вынести как exact дополнительные read scopes, не добывать обходом. Server writes0, полного live seal/token нет.

Ориентир 8–12 активных часов сохраняется; оснований увеличивать бюджет или менять состав сейчас нет. Наблюдаемое календарное окно не выдавать за измеренное active время. Последние QA guards: E ≈12.12 GiB, RAM free ≈16 GiB; перед каждым heavy шагом свой fresh systemwide/aggregate guard и peak estimate с allowance 4 GiB RAM / 2 GiB E. Uniform scale и part depth v1 — рабочий способ consumer, не новое требование заказа. Модель, effort, host, global settings/env/credentials не менялись; новых chats/roles/worktree/subagents/P6 нет. Новая denial останавливает exact operation/target и обходы; ordinary failures классифицируются по primary text.
