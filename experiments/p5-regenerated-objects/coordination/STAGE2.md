# P5 Regenerated Objects — рабочая карточка Lead

Старт: 2026-10-28 22:16 UTC (2026-10-29 Europe/Kyiv). Это состояние исполнения, не изменение заказа.

## Полномочия и границы

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

- Все пять latest Stage1 turns completed/READY; fresh read 2026-10-28 около22:16 UTC. Stage2 дублей не было.
- Lead worktree чистый при старте, HEAD exact64061757802dc60770ab156ef5672af741d65d03; runtime существует. Фактический gpt-6.1-sol/xhigh подтверждён Director через turn_context и передан CTO; локальная догадка этим не подменяется.
- Все пять адресных send receipts и наблюдавшиеся новые turns сохранены в DISPATCH.json (commit a1ca011). Каждая первоначальная передача выполнена ровно один раз; последующие сообщения — адресные handoffs внутри текущего Stage2.
- Ни QA PASS, ни готовый product, ни release сейчас не заявлены.

Первые фактически выполненные действия (не единый runtime checkpoint):

| Владелец | Завершённое действие и точный pin | Ограничение |
|---|---|---|
| Builder | Consumer schema/пример/targets: b327e5ff53190c9a356f350835390de2e77580ac:experiments/p5-regenerated-objects/builder/contracts/ASSET_CONSUMER.md; рядом asset-manifest.schema.json и asset-manifest.example.json, targets в builder/public/data/targets.json. Pushed. | Consumer runtime ещё не передан; schema передана Artist. |
| Artist | Generated floor candidate E:/R4D/perspective/p5-runtime/asset-artist/raw/floor-v1.png, SHA256 24a54990c4876fc809af3efd42a711a8a47fefeef51caf3b88608017cbce6e06, 3079122 bytes; verified copy22:22:17UTC, originalC сохранён. | Raw candidate, не art PASS; границы/проекция требуют actual сборки. Flower/leaf получены по сообщению Artist, exact pins ожидаются. Floor передан Builder. |
| TQA | 4e989becd94a3e25b22988ca644c608b04c4528b:experiments/p5-regenerated-objects/qa/technical/REPORT_SOURCE_ORACLE_001.md. 37 native files/tree exact, projection1922points, seeds0–3 exact replay. Private checkpoint-index SHA256 0f9de629046c84c1789aa84e7784e6b09710694dc1915a0c39539ff01460a114. Pushed. | Не browser/art PASS. Ordinary0=>receiver03 tick1956,1–3LOST сохранены. Event94=>states94/95/96, side475=>475/476/477; timeout limit3200 через штатный API. Передано Builder. |
| VQA | 6c36558dbefdd957147b585474c6732ed6e6c07b:experiments/p5-regenerated-objects/qa/visual/PREPARATION.md; SOURCE_FACTS.json SHA256 d96c4092916735384c4b2bf283a625e00764c3e35d1bc776fd412ed955a438fe,14095bytes. Pushed. | Самостоятельно просмотрен исходный JPG/P1; кандидат ещё не оценён. Подготовка передана Artist/Builder. |
| Release | 6844d9a3ab0aa7ec6f4a621f98f8f436b9fd1262:experiments/p5-regenerated-objects/release/DELIVERY_CONTRACT.md. Pushed. | Только local delivery/privacy/handoff контракт; SSH/HTTP/server reads/writes0. Gate закрыт. |

TQA/VQA/Release завершили первые Stage2 turns и idle; повторно без входа не будить. Lead не выполняет за них генерацию/реализацию/QA.

Consumer v1 uniform scale/part depth — рабочий технический способ, не дополнительное требование заказчика. Если фактический ракурс требует полезной адресной коррекции схемы, она обсуждается по конкретному случаю без изменения P1 геометрии и физики.

### Mini01 и следующий просмотр

Artist завершил mini01 и push: 5085be86d5b5e9bf22619254f42b95ad3dc1320e:experiments/p5-regenerated-objects/asset-artist/HANDOFF_MINI_01.md. Manifest asset-manifest.mini-01.json там же: canonical Git LF23553bytes, SHA256 7b8935f4db6f9c20ec6fc2867e115dd787a2a93982f5ef4a5588810d8470e77f; schema b327e5f проверена. Read-only PNG root E:/R4D/perspective/p5-runtime/asset-artist/selected/mini-set-01/,10textures/13instances: floor, flower-07/leaf-05/frog-05/wood-04 + shadows, ball/shadow, receiver-01 back/front. Exact files/alpha/anchors/provenance в manifest, BINDINGS.mini-01.json и records/tool-invocations.json. Raw и activeC originals сохранены. Mini01 передан Builder адресно; во время ранней QA не изменять.

Builder получил сборку Pixi8.17.1/exactnative с generatedfloor1254² -> source1536². В actual IAB самопроверены state95/96/seek95, Art/Geometry/framing на паузе не изменили position/velocity/RNG. Слабый contrast geometry исправлен outline. Upfrontseed0=>receiver03 tick1956; первый обычный UIseed1696420279=>receiver01 tick875 сохранён без отбора. Пока это self-check floor-only, не visual contact/basket PASS. Exact consumer c01/build/URL evidence ожидаются для независимых QA.

Очередь полезных коррекций/проверок:

| Вопрос | Первичная причина/факт | Владелец и следующий шаг |
|---|---|---|
| A01 far-view | Первые master footprints глубже дальних P1. В mini01 выбраны существующие близкие по ракурсу targets; остаточная depth delta +3.12/+1.09/-.96/+.02 sourcepx. | Artist продолжает новые far variants/оставшиеся21pins в новой версии, без изменения mini01/геометрии/скрытого растяжения. Early image quality ещё оценит VQA. |
| A02 receivers | Подготовлен только receiver01 back/front; верхние ropes дошли до canvas edge, регистрация native-edited front пока не проверена в сборке. | Builder c01, затем TQA/VQA actual движение/частичное скрытие; Artist готовит оставшиеся receiver targets в новой версии. |
| A03 foreground | Полная side-rail/near-platform occlusion пока не подготовлена. | Artist готовит нужную переднюю архитектуру/parts с измеримыми anchors/alpha; actual QA после сборки. |
| R01 event/time | Native contact t=>poststate t+1; lifecycle/bucket tick отличаются; timeout через штатный API. | Передано Builder, применено в self-check; независимый actual consumer проход ещё впереди. |

Artist повторно свежо проверен idle/completed, затем адресно продолжил существующее поручение: независимая подготовка far variants/remaining coverage/foreground в новой версии с прежними guards и provenance. Builder получает mini01 сейчас и freeze раннего c01; обе QA остаются idle до exact runtime handoff. Release gate закрыт.

### Актуализация 23:02 UTC

Первый материальный checkpoint — CHECKPOINT_C01.md в этой папке: actual Pixi/native, generated mini01 и первый независимый VQA receiver finding, exact artifact/source/evidence pins. Consumer0c611039246904443128b9d12084af2c5a0ae6e6; handoff a259c8bcbf4f3b242a1f2001f06d14a0e89a6d4d; c01 inventory SHA256a19fea2f7ce677f9fa24c5822e0c411a032bd79fda58c055ff8e386ec474f4ac. Обе QA уже active в новых turns, исходная фраза об idle выше относится к предыдущему переходу.

A04: actual seed1696420279/tick875 sphere на дальнем rim при nativeIN_BUCKET. Приоритетная визуальная проблема; VQA исследует соседние кадры/регистрацию, TQA independently runtime, первичная причина пока не установлена. Не двигать bucket/ball и не маскировать вопрос изменением физики. Исправление по подтверждённому finding в новом candidate.

A03 уточнено: registration mismatch у двух generated foreground edits, rejected сохранены. Адресный следующий способ — явная scene-clipped foreground part из того же generated floor, Artist source-region/provenance + Builder renderer/schema; не скрытая маска, Geometry поверх и Art off отключает всё. C01 не изменяется.

Builder turn01a184bb-7dbb-7c03-b8b1-4e361852627f закрывает license gap и готовит контракт этой дельты; Artist turn01a184ac-9f1c-7313-b8f6-ef0e340a32c5 готовит mini02. Native/P1 invariants сохраняются. Release пока idle, новых серверных чтений/записей нет; его gate закрыт.
