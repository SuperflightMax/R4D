# P3 Masks — рабочее состояние Lead

Обновлено: 28 октября 2026, Europe/Kyiv.
Lead: `lead-r4d-p3-masks-01`, chat `01a17faf-f425-75d1-948a-ed456864701f`.
CTO: `cto-r4d-perspective-01`, chat `01a174b2-1b0d-79b1-866f-f40e23f6dfb2`.

## Текущее: token фактически передан, Release выполняет fresh guards

CTO выдал единственный token
`CTO-P3-F01-20261028T064706Z-ddfe257b6856` на exact intent ddfe257b…,
те же bytes/targets/write-set/rollback. P2 server_write=false/hold подтверждён
CTO, shared окно эксклюзивно P3 до его явного освобождения.

Предыдущий Lead turn `01a18109-14ad-7aa3-b0ce-a8c0adfec746` завершился
capacity error: «Selected model is at capacity. Please try a different model.»
Модель/reasoning не менялись. Собственный read_thread подтвердил: прежние
передачи Release не содержали token, несмотря на последний текст о намерении.
После адресного технического resume token ОДИН РАЗ фактически отправлен
существующему Release chat `01a17fb0-3262-7d02-957e-29f4c9d649b6`;
tool вернул isError=false и правильный threadId. Это не новая выдача/выпуск.

Новый ACTUAL Release turn `01a1814d-3b98-71e0-ad48-524acbd9d828`
inProgress/errornull; первые read-only Git-команды completed/exit0.
Release получил token и начал fresh resources/live guard/inventory/modes/
absence всех3targets. Содержательного guard/switch checkpoint пока нет;
публикация/серверные записи не объявляются выполненными.
При любом восстановлении НЕ дублировать token send: сначала сверить этот
успешный результат и actual Release status. Lead не выполняет серверную
работу вместо Release. Никаких QA/build/подготовки пакета заново.

Следующее действие: наблюдать фактический prewrite/switch/postchecks,
передать CTO checkpoint. Любой drift/занятый target — stop и точный отчёт,
token не переносить на другой baseline/bytes. Slot до delivery/handoff занят.

## Exact intent и границы разрешённого выпуска

Release preparation завершена, commit
`ddfe257b68563183fc64b1b678b4cd1bf06e7aca` отправлен. Lead полностью прочитал
`experiments/p3-masks/release/INTENT_FROZEN_01.md`, baseline guard и нулевой
контекст catalog delta; независимо сверил actual manifest/archive SHA256.
Оба совпали. Новый actual Release turn `01a1812a-2672-7e42-b0d0-12fb9da33e59`
completed/idle, своих процессов/вкладок у Release нет.

- Proposed root `/srv/superflight-review/releases/p3-jungle-masks-frozen-01`;
- release manifest `381ff209d36f24c1734e2f2012d0b298cb13efd37e928956ceaf00ab967c2937`;
- transport archive `23a3df76a29b05d8cc7ea17ff1cf0e9e360848a540f15386d26e1a85998f463c`,80568959bytes;
- fresh baseline06:32:06UTC `/srv/superflight-review/releases/p2-jungle-static-candidate-03`, manifest `171a889a53da529d2a668da9811b3f6a9661cdc52ab54a46e254900553cfed35`;
- old snippet `d8cf0b3cd5a56241dc86562705daab81da09c648ad1aba8adcf232be2eb23104`, candidate root-only snippet `c67b27e4b179dfe3cb803268435b7558b0c48b8ea8b1018ec709149511be1ba8`;
- proposed backup `/opt/superflight-studio/backups/review-p3-frozen-01/` пока не создан.

Готовы549browser files/88602877bytes,550сoutermanifest/88710090bytes.
471 прежний browser-файл сохранён побайтно; старая дельта только
review/index.html: карточка «Частичный исследовательский результат» и
счётчик2→3. Пакет P3 не менялся. Existing auth/MIME/security сохраняются.
Fresh guard/actualinventory и отсутствие proposed root/backup проверяются
снова непосредственно перед первой записью. При несовпадении — stop,
возврат CTO, token не переносить на новые bytes/baseline.

Конкретный intent/gate/write-set/rollback отправлены CTO для нового single
token. До его выдачи server_write=false, remote upload/staging/backup,
nginx-t/reload/service-doc writes НЕ выполнялись. CTO подтвердил выбранный
partial outcome и прочитал оба QA; это ещё не серверный token.
Slot остаётся занят, P3 не опубликован. Следующий шаг — принять фактический
token и передать exact разрешение существующему Release без расширения.

## Завершённые QA и Lead gate

Итоговая [запись результата](../RESULT.md) подготовлена для частичного
исследовательского закрытия. TQA и VQA полностью прочитаны Lead:

- `c0db64fe4a0204d77be0d3ab61ffe21331d9c90a:experiments/p3-masks/technical-qa/TQA_REPORT_FROZEN_01.md` — technical QA complete,11493 native states/51browser snapshots, новых P3 technical defects нет;
- `0f282b89a5d58f6613153ceb385657c8fb761b1d:experiments/p3-masks/visual-qa/REPORT_FROZEN_01.md` — визуальный результат ЧАСТИЧНЫЙ, подтверждены masks/shadow/overlaps/receiver01/03/front-rim02, новых конкретных P3-дефектов нет, полный visualPASS не выдан из-за общего MAP-01.

Оба QA commit+push выполнены, деревья чистые, свои вкладки закрыты,
активных процессов/ожидания у QA нет. Frozen code/art/bytes не менялись.
Дополнительные правки без найденной причины не назначены; Artist не будили.
Lead gate: готовить публикацию exact frozen01 как ограниченного ЧАСТИЧНОГО
результата с явным ранним отскоком left-5/seed2818447218/t612. Это не
приёмка полной визуальной цели и не художественный PASS.

Release существующей команды адресно вызван для конкретного read-only/local
intent: свежий live root/manifest/opaque baseline, exact write-set/full
release hash, минимальная дельта каталога и rollback. Он получает оба QA
report commit и этот gate. Server_write=false; отдельного CTO token ещё нет.
Ни remote staging/upload/backups, ни nginx/service-doc writes до token.
Исходники/отчёты четырёх завершивших ролей интегрируются в свою ветку Lead;
immutable bundle остаётся тем же. Slot пока не освобождён, P3 не опубликован.

## Возобновление05:36UTC и выполненная QA

Новая прямая команда Max 28 октября 2026,05:36UTC, через доверенный Dot:
«Можно продолжать всем, кому еще продолжать, кроме угых, разумеется».
Trusted transcript `Sentinel_6074724116dc819181f7316416fab9f5`, адресное
подтверждение CTO. Прежняя рабочая переписка P3 с командой/CTO разрешена;
нового согласования не требуется. Пауза снята. UGH не трогать, P4–P6 не
открывать; P2 остаётся отдельным слотом без передачи его продуктов/выводов.
Ниже сохранён ИСТОРИЧЕСКИЙ снимок паузы, он не текущий запрет продолжения.

Lead прочитал этот state и оба QA pause checkpoints; свой E worktree
чистый на `152ba5ddacf52f007f15c56ba85c4dad86adf3e1`, ветка прежняя.
Manifest frozen01 повторно совпал с сохранённым e2e9f7d8… до новых действий.
Адресно возобновлены только три необходимые существующие роли:

| Роль | Новый фактический turn | Первые завершённые действия |
| --- | --- | --- |
| Lead | `01a18109-14ad-7aa3-b0ce-a8c0adfec746` | State/Git/manifest и свежие system resources сверены, три адресные выдачи успешны |
| Builder | `01a18109-f322-7db1-aa28-89289a29cc27` | Completed: pause/Git/WIP, все76 payload hashes, ресурсы и свободный port6866 проверены; preview восстановлен без rebuild |
| TQA | `01a1810b-8377-77e1-bb04-c9d9796504da` | Completed: оставшиеся browser/native случаи, отчёт c0db64fe, technical QA завершена |
| VQA | `01a1810b-96c0-73f1-8d31-fa099ec09733` | Completed: недостающие shadow/grounding/baskets/overlaps, отчёт0f282b89, частичный visual verdict |

Builder preview фактически HTTP200 на
`http://127.0.0.1:6866/review/r4d/p3-masks/`.
Новый собственный PID112732, exec session69658; старый24412 не актуален.
Builder state commit `01d890a66e98832b31b65b3995a95d1f5a51b381` опубликован,
дерево чистое. Frozen code/art/payload не менялись, пересборки не было.
Готовность preview адресно передана обеим QA, каждый работает в своей
новой отдельной IAB-вкладке. Artist/Release ради ACK не будили.

После resume TQA не повторял native compilation/пять saved runs/77-file
матрицу без причины: продолжена именно сверка ранее собранных browser
samples и3новых traces. VQA сохраняет прежние наблюдения и продолжает
shadow/grounding в обычном масштабе, корзины и actual silhouette overlap.
Итоговых отчётов/PASS ещё нет. Общий config не менять; left-5/mapcaveat
разделять с P3-дефектами. P2 Android feedback/замедление не новое P3 требование.

Свежий Lead snapshot `2026-10-28T05:43:54Z`: RAM free13.316/31.907GiB,
CPU20%/24logical, C8.11755/D16.30265/E47.269661GiB. Совокупный добавочный
peak preview+обеих QA оценён до3.3GiB, не резерв/гарантия. Каждый делает
fresh system-wide RAM/CPU/C/D/E перед тяжёлым шагом; прежние E4/2GiB
и process-local E-runtime правила сохраняются. Builder дополнительно
подтвердил freeRAM12.65GiB/port6866free до своего запуска.

P3 server_write=false, собственного token нет. P2 limited03 уже завершён,
старый token освобождён: shared lock свободен, но не разрешает новую запись.
После обоих честных QA: связанные полезные исправления назначенным владельцам,
новый candidate только при реальном изменении; затем bounded result,
готовый exact release intent/fresh live baseline и новый single CTO token.
Artist вызывается лишь по конкретному арт-дефекту, Release — при готовности
выпуска. Исследование не закрывать/слот не освобождать до реального результата,
QA, публикации и handoff. Продолжаем без новых людей/сессий/worktrees.

## Исторический checkpoint паузы00:46UTC — снята05:36UTC

28 октября 2026,00:46UTC: Max через доверенный Dot поручил мягкую временную
паузу всей команды R4D, CTO подтвердил немедленное применение. Это не отмена
заказа. Новые задания/QA/тесты/generation/build/install/deploy/эксперименты
не запускать. Старый stage2, поздний checkpoint и освобождённый release token
не разрешают продолжение. **Resume только по новой явной команде Max.**
Оба слота paused/reserved, P4–P6 не открывать, на другое устройство не переносить.

Lead немедленно отправил PAUSE_ACK CTO. Собственных серверов, браузерных
вкладок, незавершённых writers/exec sessions у Lead нет; последний wait
вернул interruption. Только этот безопасный state/commit/push checkpoint
и сбор фактических ACK существующих пяти участников. Массовая pause не
дублируется: CTO направил её всем напрямую. Immutable/raw assets сохраняются,
reset/clean/switch/потеря WIP и global cleanup не выполняются.

Все пять участников фактически **PAUSED_SAFE/idle**, финалы прочитаны
Lead и независимо подтверждены CTO. Checkpoint commits запушены:

- Builder `ac9b1a2a49ff06b29cb4ba6c188df8b48c91e4a7`;
- Artist `545bf170e4284806d2cc0867a0e96bd7644e0f67`;
- TQA `f176d9a54f5351f391cfa929ed13bab959effc27`;
- VQA `911840f42b06b4a33f381ecdb09a62fcef5f542b`;
- Release `3ec9adf9032969f13056b4d820c500c66e006f9e`.

Каждый подтвердил чистое дерево/сохранённый WIP. Builder фактически
остановил свой preview PID24412/loopback6866 и закрыл свою вкладку;
прежний preview URL сейчас не работает, старый PID нельзя считать текущим
владельцем при resume. TQA/VQA закрыли свои IAB-вкладки. Artist/Release
серверов и вкладок не имели. Активных собственных exec/atomic операций
участники не имеют. Lead чужие PID/вкладки не трогал; своих активных нет.

TQA resume: `experiments/p3-masks/technical-qa/PAUSE_CHECKPOINT.md` наf176;
последний state seed1061109253/tick1368 после import, evidence сохранены
в `E:\R4D\perspective\p3-runtime\technical-qa\frozen-01`.
VQA resume: `experiments/p3-masks/visual-qa/PAUSE_CHECKPOINT.md` на911840;
все220raw files сохранены в
`E:\R4D\perspective\p3-runtime\visual-qa\frozen-01`, 7ключевых кадров и
3checkpoint JSON включены в Git checkpoint. Остальные resume points —
STATE.md соответствующих ролей на указанных commits. Immutable/raw assets
сохранены. Окончательных QA verdicts и художественного PASS нет.

После собственного checkpoint/commit/push Lead останавливается без active
ожиданий. Других участников не будить, не ждать, их QA/WIP сейчас не мержить.

P3 публикации/серверных записей не было. По CTO P2 limited release уже
completed/token released; новых writes/reload/rollback это не разрешает.
P3 token отсутствует. После resume release только через прежний exact gate.

Точная следующая работа ПОСЛЕ ЯВНОГО RESUME: сверить этот checkpoint и
STATE/WIP пяти участников с фактическим Git без повторения сделанного.
Builder восстанавливает только свой frozen preview после свежих ресурсов/
проверки свободного loopback port. TQA/VQA продолжают незавершённую QA
того же frozen01 из своих WIP; сначала получить оба отчёта, затем связанный
пакет существенных исправлений. Новая версия — только при реальном изменении.
Fresh RAM/CPU/C/D/E перед любой тяжёлой операцией; старые snapshots не гарантия.

## Сохранённый frozen01 — тот же кандидат для продолженной QA

`P3-frozen-01` выдан обеим QA. Code
`f1aca21e7b9ba19001e7e8762fcaf2511bf9bf74`, Artist
`f899a308aed156a11e2a1013292ed68c6669959d`.
Handoff: `4603d99a5904d10924f55416e36100b2c470b534:experiments/p3-masks/builder/FROZEN_CANDIDATE.md`.
Immutable build `E:\R4D\perspective\p3-runtime\builder\full-checkpoint-06`;
`file-manifest.json` SHA256
`e2e9f7d837b3d05f484f75a877af6992a70ee88363add783d80f3c6e206f431f`.
Lead независимо сверил точный manifest hash. 76payload files/3388537bytes,
сmanifest77files/3401352bytes, 51masks. Preview
`http://127.0.0.1:6866/review/r4d/p3-masks/`; после resume Builder PID112732.
Frozen bytes не перезаписываются во время обеих QA. Native runtime SHA256
`af8e6dea9ee5c46759f99ba3b68f4afa91c740b4fd2aba2d2d3f65bfa66753fa`;
provenance/blob IDs/toolchain и licenses в `build.json`/handoff.

Адресная выдача обеим QA успешна, фактические новые ходы подтверждены
`read_thread`, оба были inProgress до pause:

- TQA `01a17ff7-1769-7f91-a29d-3197ec953758`;
- VQA `01a17ff7-601a-70e3-878a-4e61175de022`.

До pause TQA независимо сверил77 files на диске/HTTP, пересобрал native
из14exact blobs с byte equality, сравнил все состояния5saved runs и сохранил
первые3новых seeds4002564341/892542836/1061109253 без отсева. VQA сверил76
payload files disk/HTTP, просмотрел seed0→receiver03 и свой ordinary
1126639243→LOST, сохранил/повторил его и начал контакты/частичное скрытие.
Это частичные результаты: окончательных QA verdicts/artPASS нет.
Особое внимание: фактическое наложение силуэтов при смене порядка,
читаемая shadow/grounding в нормальном масштабе и known left-5/mapping.
Обеим QA переданы сохранённые хорошие/LOST runs без отбора; собственные
обычные runs сохраняются также. Каждый использует свою IAB-вкладку,
свой runtime/отчёт, shared candidate не меняет. После обоих отчётов
связанные дефекты возвращаются владельцам одним пакетом.

Lead snapshot перед параллельной QA `2026-10-28T00:41:56Z`:
RAM free10.236/31.907GiB, CPU9%/24logical;
C7.706169 / D16.304096 / E31.385117GiB свободно.
Оценка дополнительного совокупного пика двухQA до3GiB (TQAдо1/VQAдо2);
это не измерение/резерв. Каждый повторяет fresh snapshot перед тяжёлым
действием; Builder preview уже учитывается в system-wide snapshot,
Artist/Release idle. Серверная запись P3 закрыта, token нет.

## Основание и первоначальный старт

Получен stage 2/2 CTO: отдельный P3 во втором слоте, P2 продолжает отдельно.
Это уточняет только административную последовательность; обязательства
`orders/perspective/ORDER.md` и `P3-masks.md` на базе
`64061757802dc60770ab156ef5672af741d65d03` сохраняются.
Playbook: canonical blob `d3066526699a9a21fb8e8e5806958fbd105c8cf2`.
Staff policies: `e9dfa0e32226e3f72de1f75e5c77a43d5ebfd9b3`.

Stage 1 завершён всей фиксированной командой. Director отдельно подтвердил
`gpt-6.1-sol / xhigh`; Lead не выдаёт это за собственное наблюдение runtime.
Перед началом stage 2 Lead проверил свою чистую ветку
`codex/r4d-p3-masks-lead-01` на исходном HEAD.

Получено trusted transcript evidence прямого Max от ДотМакса:
`Sentinel_389382dc66d88191b155c18c89545f84` (27 октября 23:18 UTC: два
параллельных опыта, организовать P3) и
`Sentinel_3c26fb6926608191b61dbec04a9cf0cd` (исправить технически застрявший
handoff и продолжать). Разрешение ограничено существующей P3-командой,
текущим CTO и пятью подготовленными заданиями, без расширения scope.
Все пять заданий отправлены ровно один раз; каждый инструмент вернул success
и правильный threadId, неопределённых результатов и повторной доставки нет.
Фактические новые ходы независимо проверены через `read_thread`:

| Роль | Turn ID |
| --- | --- |
| Lead | `01a17fcf-8a38-7e32-87ef-525b12ff334c` |
| Builder | `01a17fd0-d801-7a30-9b54-7911e824f59f` |
| Asset Artist | `01a17fd0-f2ef-7ff3-afcc-1ac992096595` |
| TQA | `01a17fd1-0624-7b11-9d99-a3091da2cfba` |
| VQA | `01a17fd1-1069-74e2-9984-61e0c08bad56` |
| Release | `01a17fd1-1c7a-7790-a9f2-5200390b7762` |

На первой проверке все ходы inProgress. Builder проверил своё дерево и
читает exact inputs/задание, Artist проверил дерево, прочитал imagegen skill
и обозначил source1536²/alpha/anchors/masks без baked shadows. TQA/VQA
проверили свои деревья и начали подготовку; Release сверил свою копию и
готовил только локальную доставку. На этом раннем рубеже полного frozen
candidate и выполненной продуктовой QA ещё не было. CTO получил actual-start сообщение с этими фактами
и turn IDs.

## Версии подготовки и ранний стык

| Вклад | Exact версия и состояние |
| --- | --- |
| Consumer contract Builder | `4b51ebae9e635fbf2460d935647a4d8d49836ac6:experiments/p3-masks/builder/ASSET_CONTRACT.md`, опубликован |
| Ранний art packet | `7f75ccb0e515e3c955c8b9bc248990573d8f8678:experiments/p3-masks/asset-artist/assets.json`, собственные ball/shadow, leaf-01/flower-01 masks; передан Builder |
| Полный исправленный art packet | `f899a308aed156a11e2a1013292ed68c6669959d:experiments/p3-masks/asset-artist/assets.json`, 51 masks, actual Git SHA256 `98cef793f5cf9191fea315caf4bf11d727c20b2d5a9d5704972e97e02cfd2f73`; передан Builder |
| TQA preflight | `c380b6ae6d364b39815b963f5b0b96c249266863:experiments/p3-masks/technical-qa/STATE.md`, входы сверены, готов к frozen candidate; ход завершён |
| VQA preparation | `0b90e9546f4a26f087087c35eac24171f6c72556:experiments/p3-masks/visual-qa/STATE.md`, исходник просмотрен, готов к frozen candidate; ход завершён |

По завершении preflight оба QA остановились до отдельной выдачи frozen01;
актуальные активные ходы реальной QA указаны в начале этой записи.
Builder сообщил загрузку сцены в браузере без console errors и exact +1tick
=5ms; исправил ввод seek и экранную толщину диагностических контуров.
Это его самопроверка, ещё не независимая QA и не художественный результат.
Artist принял `r4d-p3-assets-v1`, сделал crop alpha masks с измеренными
anchors/radius и native depth из принятого config.

**Ранний реальный стык состоялся.** Builder checkpoint-02:
source `b1d74c00ec33ed71147718243b6f0f6ae89c8b72`, build
`E:\R4D\perspective\p3-runtime\builder\checkpoint-02`, manifest SHA256
`01076d5aab91ad97f6758588e6b8510f5a9f1b01e9d3230a1f14e07bcc688442`.
P3 preview: `http://127.0.0.1:6866/review/r4d/p3-masks/` (текущие preview
bytes не объявляются неизменяемым frozen candidate).
Native seed0: leaf-01 partial tick60, contact94/95, rebound150. Lead реально
просмотрел JPG tick60/94/150 из
`E:\R4D\perspective\p3-runtime\builder\evidence-02`; у контакта leaf
закрывает шарик. Это early checkpoint, без независимого QA/artPASS.
Первый native контакт leaf-01 tick94 также получен на обычных random seeds
2818447218 и 2099436614. Разные траектории с LOST сохранены, seed0 завершился
receiver-03. Открытый риск: scalar depth против передней дуги footprint
при боковом переходе; leaf scalar swap tick358 происходит далеко от
силуэта и не доказывает достаточность правила. Builder отдельно исправил
оценку перекрытия shadow по её собственному положению на плоскости.
CTO получил реальный early milestone и ограничения. Artist получил
продолжение полного комплекта масок; Builder продолжает боковые события,
browser download/import и `.js`-упаковку. Обе QA получат один полный freeze.

Первый проход Builder завершён на `682d2d7e193f5d2fd771a629b2c71002be793dd3`;
его самопроверки `.js`/MIME, browser download/import и обычного нового run
прошли. Исправлена ошибка отрицательного первого animation tick, pinned
core/config не менялись. Следующая интеграция начата новым фактическим
ходом Builder `01a17fe5-6abf-7761-8b10-072ae999852d`.

Полный Artist packet `9cf43318de31251561c53d7bd605459f31ef3431` содержит
51 маску; shadow scale изменён на `[1.15,2.6]` для согласования с floor
projection (raw PNG прежние). Ранние кадры старого пакета не доказывают
полный новый вид. Есть конкретные обычные боковые события для self-check:
seed0 flower-03 ticks1503–1505 и seed2099436614 frog-02 ticks487–489.

**Расхождение byte identity обнаружено и исправлено до final freeze.**
Artist указал рабочий CRLF SHA256 assets.json
`654f77e7839bf6294c0bdc8dc42a26600c1110b10ec046ca8c7acf5f4a8623c4`,
а exact Git LF bytes дают
`98cef793f5cf9191fea315caf4bf11d727c20b2d5a9d5704972e97e02cfd2f73`.
Lead независимо подтвердил расхождение; Artist сам обнаружил ту же причину
и исправил явную LF-запись/хеши всего Git payload. Исправленный exact commit
`f899a308aed156a11e2a1013292ed68c6669959d` опубликован и передан Builder.
Artist сверил все 70 final files с Git bytes; внешний handoff manifest SHA256
`a52c5a15faa6797d8dcbbd037034252fd7c13bb1cd8f5b1636e09718158ddc0d`.
Lead проверил: assets.json в9cf/f899 — один blob
`4e2d9cd1406e507fa9b79ff7b46dc4d67e0d75ee`, actual SHA25698cef выше.
PNG/координаты/depth не менялись, предварительные визуальные self-checks
сохраняют смысл; final build закрепляет именно f899 и фактические bytes.
Ход Artist `01a17fe6-54bb-7163-a276-13c8935cff59` завершён, ожидания нет.

Builder сообщил первый полный run с51 masks: seed0 → receiver-03/tick1956.
Перед freeze добавляет доступ к сохранённым обычным удачным/LOST replays и
перетаскивание увеличенного кадра, чтобы корзины оставались достижимыми.
На этапе этой самопроверки полного frozen candidate и независимого QA
verdict ещё не было; текущая выдача frozen01 описана в начале записи.
Builder также сообщил известное ограничение общего маппинга:
seed2818447218, left-5 околоtick612, контур принятой геометрии проходит
по видимому полу перед нарисованным бортом; отскок выглядит преждевременным.
Сохранены ticks611–613 и geometry overlay. Это наблюдение self-check;
независимая QA ещё проверит источник. Config/remap не меняются.
Все пять сохранённых обычных runs воспроизвелись: два попадания/три LOST.

Release local handoff опубликован на
`3210845628c1258c8c1e2b9e34883be4708aa7a8:experiments/p3-masks/release/STATE.md`;
его последний ход `01a17fd8-bfda-75a0-b8f7-dcf1e37c4d53` завершён,
активного ожидания нет. Release получил от CTO и ДотМакса общие несекретные pointers:
`vps1-direct`; `/home/sf/assistant-context/vps/services/superflight-studio.md`;
`/opt/superflight-studio/README_RU.txt` и обязательные INDEX/PROCEDURES;
`/srv/superflight-review/releases/<release-id>` и `/review/r4d/<slug>/`.
Доступ SSH и чтение runbook подтверждены Release, live root ещё не проверен.
Это исторические указатели, не разрешение записи: `server_write=false`,
token нет, первое окно P2. Чужие product artifacts не передавались.
CTO отдельно подтвердил занятие общего release-окна P2 токеном от
28 октября00:34:30UTC; это разрешение P2, не подтверждение switch.
P3 не пишет параллельно. После освобождения окна будущий live root/manifest
проверяется заново; старый baseline не переносится как текущий.
Общее delivery-уточнение CTO передано Builder и Release: browser-facing
ES modules — `.js` с явными src/import references; `.mjs` MIME в текущем
Review не подтверждён. Node-only scripts не переименовываются; глобальные
MIME/nginx настройки не меняются. После выпуска нужна проверка MIME.

Последний Lead resource snapshot `2026-10-28T00:23:43Z`:
RAM free10.044/31.907GiB, CPU11%/24logical;
C7.723415 / D16.304516 / E31.525036GiB свободно.
Builder оценил лёгкую сборку до0.3GiB RAM, браузер подключает отдельно.
Все будущие тяжёлые операции требуют нового snapshot и совокупной оценки.

## Закреплённые общие входы

- Jungle: `K:\Agents\R4D\Assets\perspective\01-jungle.jpg`, 1536×1536,
  SHA256 `c8f9e4245c1de8c2086e615bc75dc10aea59b76b614d6e106593e07262e24f72`.
  Lead независимо сверил SHA256; исходник не изменял.
- P1 repeat: `4b47db04c7140ebf88f69b91faa0b790d46f22ec`,
  `experiments/p1-collider-mapping/clean-repeat-01/`.
  Использовать exact Git objects через `git show`, а не текущую рабочую копию.
  Config: `simulation/boards/01/trial-01/config.json`, canonical LF SHA256
  `dd5c519cd6d4b7295118e0a3a1063efed424a0ce739450bd5153c6a9941982db`.
  Manifest в том же каталоге, canonical LF SHA256
  `7784dc0a215d0e472cf06a4eee03793592727cf0fa9a1fa0e0c78e5f1d17da18`.
  Projection: `research/board01-projection.candidate-01.json`, SHA256
  `9ca9e520f1927426a3a5ba73a5eacaf90fedffc9385e7d08d5b1e6ee644b020c`.
  Допустимый math: `viewer/src/view-math.mjs`.
  Lead независимо сверил все три canonical LF SHA256 из exact Git objects:
  config, manifest и projection совпали с поручением CTO.
  Manifest прочитан полностью: `nativeToSource` / `sourceToNative` и domains
  обязательны, скрытый remap недопустим. Его старые provisional-пометки
  сохраняются как история; текущая приёмка задаётся ORDER и поручением CTO.
- P0 recipe прочитан: `ee4d8e5c7dbb3b6618d58d6dacb0caf9b73dfb1b:experiments/p0-perspective/research/CROSS_SERIES_CONCLUSION_AND_RECIPE.md`.
  Рецепт удержания перспективы не заменяет метод P3 готовой layered-доской.
- Native core: `5a6fa03f1cdb3de88a2d9c7dbe795eb8e2a7f023`, авторизованная
  read-only копия из адресного поручения CTO; локальный private source path
  в текущем публичном учёте не дублируется.
  Lead независимо сверил HEAD. Приватные TS, source maps и credentials
  в публичный R4D не попадают; разрешён compiled browser runtime.
- PixiJS 8.22.0 доступен read-only в P1 `viewer/node_modules/pixi.js`;
  Builder проверяет упаковку и лицензию.

## Выданные адресные задания

Все участники пишут только в своих worktree/ветках, начиная с exact base
`64061757802dc60770ab156ef5672af741d65d03`. Общий префикс worktree:
`E:\R4D\perspective\p3-worktrees\`; runtime:
`E:\R4D\perspective\p3-runtime\<роль>`.
Новых сессий, людей, subagents, clone или worktree не создавать.

1. Builder `builder-r4d-p3-masks-01`, chat
   `01a17fb0-0342-7083-8170-081fd7446d11`, worktree `builder`, branch
   `codex/r4d-p3-masks-builder-01`: собственный минимальный PixiJS stand,
   exact native core/config/projection. Random/replay, экспорт и импорт
   checkpoint JSON без backend/POST, pause/+tick/seek. Art и Geometry
   независимы, actual geometry выше арта; выключение арта снимает его маски.
   Вместе с Artist рано согласовать anchors/depth/alpha и показать реальное
   частичное перекрытие с собственными шариком/тенью. Итог — самостоятельный
   route-relative static bundle для `/review/r4d/p3-masks/`, frozen source
   commit и file hashes, без private sources/maps. Основной код принадлежит
   Builder, Lead его не подменяет.
2. Artist `asset-artist-r4d-p3-masks-01`, chat
   `01a17fb0-1134-7433-8f15-30a362b2af46`, worktree `asset-artist`, branch
   `codex/r4d-p3-masks-asset-artist-01`: самостоятельные source-aligned masks,
   основания/бока/борта/передние края корзин, contract anchors/depth/alpha;
   baked shadows не считать непрозрачным телом. Цельная Jungle остаётся
   основой; не восстанавливать пустой пол и не перестраивать доску в нарезку.
   Свой generated объёмный rasterball и отдельная читаемая shadow в свете
   исходника. Перед imagegen прочитать применимый skill и
   `E:\CodexGeneratedImages\README.md`; соблюдать активные tool-managed C
   refs, не переносить их насильно и не менять глобальные настройки.
   Согласовать с Builder небольшой реальный пример до полной подготовки.
3. TQA `technical-qa-r4d-p3-masks-01`, chat
   `01a17fb0-1ad2-70e3-823b-e26a5dbdceb8`, worktree `technical-qa`, branch
   `codex/r4d-p3-masks-technical-qa-01`: подготовить независимые проверки
   common inputs/native/config/обычных seeds/replay/ticks/export/import,
   Art/Geometry и статической загрузки. Исполнять QA только для названного
   frozen candidate и его exact bytes; не чинить продукт самостоятельно.
   Сохранить обычные QA seeds и хорошие/плохие checkpoint-воспроизведения.
4. VQA `visual-qa-r4d-p3-masks-01`, chat
   `01a17fb0-2697-7b10-ad86-9b4bbe6548ae`, worktree `visual-qa`, branch
   `codex/r4d-p3-masks-visual-qa-01`: подготовить независимый просмотр того же
   exact frozen candidate. Реально смотреть движение и кадры до/во время/
   после контактов и смены порядка, частичное скрытие, размер, боковые
   отскоки, борта/корзины, тени и grounding в обычном масштабе. Ошибки общего
   маппинга выделять, не подгонять коллайдеры. План проверки ещё не QA;
   build/URL/PNG не означают визуальный PASS.
5. Release `release-engineer-r4d-p3-masks-01`, chat
   `01a17fb0-3262-7d02-957e-29f4c9d649b6`, worktree `release-engineer`, branch
   `codex/r4d-p3-masks-release-engineer-01`: только независимая local
   preparation существующего Review, exact manifest/rollback. Старые release
   records допустимы лишь как пример доставки. `server_write=false`.
   Не угадывать SSH alias и не читать sensitive config. После frozen
   candidate и двух QA подготовить release intent с hash/ограничениями/
   read-only live root; перед общей серверной записью получить у CTO single
   release token. Первое окно у P2. Сохранить прежние карточки, demos и auth;
   публиковать только названные frozen bytes, не случайный HEAD.

## Инварианты и ресурсы

Весь config сохраняется: 25 pins / 16 segments / 4 buckets / 1 drop,
r16, tick5ms, g980, speed2000, angleDeviationDeg2, bounceDeviation0.02,
lcg32, quantize7. Обычный новый запуск меняет только rng.seed.
Рендер не расходует PRNG. Маски зависят от состояния/оснований, не seed/tick.
Чужие P2/P4/P5/P6 реализации/арт/маски/кандидаты/выводы не использовать.
P4/P5/P6 и старые команды не запускать и не будить.

Свежий Lead snapshot 2026-10-28 01:38:51 Europe/Kyiv:
RAM total31.907/free5.200 GiB, CPU11%/24logical;
C7.898087 / D16.306591 / E37.605225 GiB свободно.
Это измерение, не гарантия будущего пика. Перед тяжёлым действием повторить
system-wide snapshot и учесть совокупный пик P3 вместе с P2/Millionko.
Тяжёлые temp/cache/output/build/staging — только в E runtime по ролям,
process-local env. E≤4 GiB — диагностика, E≤2 GiB — safe checkpoint/stop.
Не менять глобальные TEMP/TMP/CODEX_HOME/settings/security/credentials,
не устанавливать глобально, не запускать cleanup/watchdog, не трогать UGH.
Отказанный composite call `call_7b166cdf46834d468b5f9c297aad6e9f`
не повторять/дробить/переносить. Новый конкретный denial останавливает только
эту операцию; вернуть exact action/target/toolcall/reason без обхода.

Ориентир CTO: первый связный просмотр через 60–90 минут активной работы;
ограниченная попытка 4–6 активных часов с QA/осмысленными исправлениями.
Ожидание разрешений и ресурсов не считать активной продуктовой работой.
Следующее действие: получить оба независимых отчёта по указанному frozen01,
вернуть связанные конкретные дефекты владельцам, затем проверить нужную
новую версию. Выпуск — только после обеих QA/ограничений и отдельного token.
