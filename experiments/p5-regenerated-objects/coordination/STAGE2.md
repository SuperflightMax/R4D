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

Первый материальный результат — [CHECKPOINT_C01.md](CHECKPOINT_C01.md), commit `4eeac03`. Пять actual initial send receipts и новые Stage 2 turns — [DISPATCH.json](DISPATCH.json), commit `a1ca011`. Каждый специалист получил одно первоначальное поручение; дальнейшие сообщения передают интерфейсы и коррекции внутри него. Production начался. Release/server writes = 0.

### Сейчас проверяется c02

Producer freeze успешно завершён до capacity-сбоя его модели. Consumer `398b0daaaad914cc67b8390a51454d21db524e7a`, frozen root `E:/R4D/perspective/p5-runtime/builder/output/previews/c02/public`; index рядом, 10707 bytes, SHA256 `f40040bb40d529b7bf1f289e661d69f7f882fddfc962e40cdc5616a59c9d9389`. Inventory: 29 файлов / 21668434 bytes; app SHA256 `4a003dd39212f21b7a3dd1baa82c0d0738af3a9767c6e51225b9b54f5aac325c`, staged manifest SHA256 `275ade538d30119434723339487cf7d036a35bbbefe4ad6807f4dd810a6e4491`. Canonical input/native/Artist/deps pins — в producer index, не в пересказе чата.

Actual c02 preview: `http://127.0.0.1:55185/`, Builder PID21340/session26545/root c02; current `preview-owner.json` проверен read-only. Старые preview ownership ниже относятся к c01. Builder turn `01a1850a-3773-7a32-abd8-4dfee77bc2c8` возобновлён с того же checkpoint: предыдущий ход failed с `Selected model is at capacity. Please try a different model.` Настройки не менялись; build/freeze/replay не повторяли. Остались docs/commit/push handoff и owner pins. C02 сам не переписывать ради отчёта.

После fresh idle/no-duplicate проверки обе independent QA получили этот exact c02: TQA turn `01a1850e-9c56-7273-8446-f6dccd169cca`, VQA turn `01a1850e-9d8b-78d1-a3bc-7a34ef83ae0b`. Проверяют новый полный набор, receiver/clip/Field дельты и ранее unverified side/occlusion сценарии. VQA уже подтвердил 29 файлов и HTTP identity/ownership; художественного/общего PASS ещё нет. Показан producer кадр `evidence/c02-browser/seed1696420279-t875-field-art.jpg`, 144552 bytes, SHA256 `611985f45a233a72bc9e1c0f1e2aa726680bdf376171be98a0e8119eb3eb2f1a`; это self-check, не независимая VQA.

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
| A01: ракурс и полнота | Mini02 передан и собран в c02: 25/25 pins, 4/4 receivers, max depth residual 3.295859 source px; selected far/mid/near variants. Название far и числа не означают PASS | Artist сохранил генерации/отбор/остаточные ошибки; теперь TQA/VQA проверяют реальную полную сцену. P0 geometry guides остались референсами, не финальным артом |
| A04 / C01-V01 / F-C01-01: приёмник | Обе actual QA: seed1696420279, 874→875 — native IN_BUCKET, sphere у дальнего rim и остаётся там после terminal. Ground source ≈(380.921,1221.626), receiver center ≈(358.559,1238.210); native distance30.398 < r33.524. Visible sphere center ≈17.7 source px выше ground из-за bottom anchor. Точная aperture ещё не измерена, P1 bug не доказан | Artist измеряет true aperture, authored anchor и front/back. Builder подтвердил back < ball < front, но visible alpha bounds почти не пересекаются: одной сортировки недостаточно. Согласовать арт и sphere-height policy по измерениям. Native/source targets, r16 и physics не менять; measurement-based исправление texture-local anchor допускается с provenance. Не маскировать один case исчезновением или ложным terminal |
| A03: foreground | Две native-edit пробы сдвинули слой относительно generated floor; rejected сохранены | Принят явный scene clip из того же generated floor. Contract/schema/example опубликованы в `8bf447629ec78a1ccb088b4ba7a784746e0aca83:experiments/p5-regenerated-objects/builder/contracts/GENERATED_FLOOR_CLIP.md`. Artist передаёт production polygon в source1536, parent, exact floor SHA и ограничения; Builder реализует минимальный renderer. Art off выключает mask, Geometry выше. Следующий candidate требует actual QA |
| C01-V02: Field framing | Field обрезает готовый receiver01; Whole позволяет просмотр. Это рекомендация просмотру, отдельно от обязательного visible entry | Builder source fix включает нужные rendered receiver bounds, исключает полный floor canvas. На mini01 нижняя граница расширена с1286.912 до1426.500 source px; Art/Geometry используют одинаковые bounds. Actual проверка — на следующем candidate |
| P01: license | Installed 42 files совпали с official npm @pixi/colord2.9.6; LICENSE отсутствует и в tarball. Точный официальный текст найден через gitHead/package.json | Source fix `365e8220221c6f26983e65f4496d875a9a222b1c`, future package fragment проверен. В c01 gap остаётся исторически; final package отдельно проверит Release |

### Следующий переход

Полный Artist mini02 передан Builder: frozen `4990463ec6eabf89aa47f58f9b59f703cbf739ba:experiments/p5-regenerated-objects/asset-artist/HANDOFF_MINI_02.md`. Manifest рядом: 83772 bytes, SHA256 `6055be855714bc9ad66a0e803fc392fbd8e01d94a9798536e7047c06d5d2a331`. Selected root `E:/R4D/perspective/p5-runtime/asset-artist/selected/mini-set-02/`: 17 unique PNG, 23 texture IDs, 64 instances, 25/25 pins, 4/4 receivers, ball/shadow/floor и 3 foreground regions. Max depth residual 3.2958589851 source px. BINDINGS SHA256 `8241f2b9d1c862b773a307ca352615bb634452d8950f1199b64d41540ecd24d6`; receiver policy SHA256 `1ea3c31e6a1904d8219b0ca52d79a4010eee34474dc5c8132a4d131d1fa36f1a`; canonical FOREGROUND_REGIONS SHA256 `e20ad2065c723ae1bdfe2bc2f42bf3fb60f0b997c5edf0d213986f86372daa00`. Полные длинные rails пока не partitioned, ограничения coarse near-ledge/serpent contours объявлены и требуют actual QA.

Artist housekeeping HEAD/remote `a5f26a57833e8671bf031a2b21c1b9f990dd3c87` clean: raw1254 authoring и source1536 regions больше не имеют case-only имён, authoring сохранён как FOREGROUND_AUTHORING. Продуктовые manifest/BINDINGS/policy/17 PNG совпали; frozen499 остаётся действующим handoff. Artist idle. Builder turn `01a184ec-a3a3-7181-a2d5-48bc77a68872` собирает c02; все4 hR подтверждены, следующий шаг — self-check загрузки/короткий receiver replay и новый immutable freeze для TQA/VQA. Полную QA Builder не подменяет.

Решение по receiver для c02: принят вариант 1 из `3c2e50c7caa64b281480ba895e13cf309dcbd655:experiments/p5-regenerated-objects/asset-artist/RECEIVER_C01_DIAGNOSIS.md`. Измеренная optical point `[628,477]` сохраняется отдельно. Logical authored anchor чаши располагается ниже неё на clearance текущей billboard sphere: `hR = sphere-center lift в source / receiver uniform scale`, с r16 и exact P1 в центре каждого bucket. Одно правило применяется ко всем четырём receivers, без seed/tick поправок. Native/source targets/config/projection/радиусы прежние; изображение чаши относительно logical plane явно сдвигается вверх, это изменение внутреннего anchor-контракта, а не скрытая «поправка 1px». Artist передаёт aliases одинаковых PNG с рассчитанными anchors и полные inputs/outputs в policy/BINDINGS; aliases не считаются новыми генерациями. Actual QA должна проверить вход, крепление чаш к floor/ropes, обычные cases и неизменность физики. Пока это проверяемая коррекция, не PASS.

Builder source fixes: license `365e8220221c6f26983e65f4496d875a9a222b1c`, clip `8bf447629ec78a1ccb088b4ba7a784746e0aca83`, Field `5ce9130195be9bf463a574332ab90f031f1c883e`, receiver contract `2c8551e45876396e4b8f5df7f6d6c93713f89e2c`; все pushed. TQA/VQA idle до нового frozen c02. Следующая независимая QA проверяет дельты, полное покрытие и обязательные контакты, частичное скрытие, боковые отскоки и приёмники в actual motion; seed0 left-2 event475→states475/476/477 ещё actual unverified и нужен для sides. Завершённые common oracle/c01 матрицы без причины не повторять. Lead не генерирует, не пишет product и не заменяет QA.

Release idle. Его local контракт: `6844d9a3ab0aa7ec6f4a621f98f8f436b9fd1262:experiments/p5-regenerated-objects/release/DELIVERY_CONTRACT.md`. SSH/HTTP/server metadata/writes в подготовке = 0. Следующий gate: лучший разумный результат → frozen + обе независимые QA → новый exact CTO review/single-use token → разрешённая доставка. C01 — ранний результат.

Ориентир 8–12 активных часов сохраняется; оснований увеличивать бюджет или менять состав сейчас нет. Наблюдаемое календарное окно не выдавать за измеренное active время. Последние QA guards: E ≈12.12 GiB, RAM free ≈16 GiB; перед каждым heavy шагом свой fresh systemwide/aggregate guard и peak estimate с allowance 4 GiB RAM / 2 GiB E. Uniform scale и part depth v1 — рабочий способ consumer, не новое требование заказа. Модель, effort, host, global settings/env/credentials не менялись; новых chats/roles/worktree/subagents/P6 нет. Новая denial останавливает exact operation/target и обходы; ordinary failures классифицируются по primary text.
