# P3 Masks — рабочее состояние Lead

Обновлено: 28 октября 2026, Europe/Kyiv.
Lead: `lead-r4d-p3-masks-01`, chat `01a17faf-f425-75d1-948a-ed456864701f`.
CTO: `cto-r4d-perspective-01`, chat `01a174b2-1b0d-79b1-866f-f40e23f6dfb2`.

## Поручение и фактическое состояние

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
готовит только локальную доставку. Кандидата и выполненной продуктовой QA
ещё нет. CTO получил actual-start сообщение с этими фактами и turn IDs.

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
- Native core: `5a6fa03f1cdb3de88a2d9c7dbe795eb8e2a7f023`, read-only
  `D:\dev\.codex-worktrees\r4d-p1-collider-mapping\millionko-source\lead`.
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
Следующее действие: соединить контракт Artist/Builder и получить ранний
реальный пример частичного перекрытия с собственными ball/shadow; после
доводки зафиксировать единый candidate для обеих независимых QA.
