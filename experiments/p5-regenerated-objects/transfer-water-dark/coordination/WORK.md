# P5: перенос собственного regenerated-art способа на Water и Dark

Статус: production-in-progress. Основание — прямой START CTO; новый старт у Макса не нужен. Первая фактическая выдача четырём существующим ролям завершена 2026-10-29 23:14:43 UTC. Снимок turns, completed actions и первого нового ассета: [DISPATCH.json](DISPATCH.json).

## Владение и границы

Lead работает в E:/R4D/perspective/p5-worktrees/lead, ветка codex/r4d-p5-regenerated-lead-01. Все роли используют свои прежние E worktrees/runtime на WIN-36E9FF9EJM0. Новые роли, чаты, сессии, worktrees и ветки не создаются; модели и effort сохранены. Release подключён к локальной обвязке двух original baselines; это архив сравнения, не текущий final. Lead координирует; production и независимые QA принадлежат профильным ролям.

Новые исходники: experiments/p5-regenerated-objects/transfer-water-dark/{water|dark}/{builder|asset-artist|qa/technical|qa/visual}/. Runtime каждой роли: существующий p5-runtime/<role>/transfer-water-dark/{water|dark}/. Собственные Jungle результаты, заморозки и public сохраняются.

P4/P6 код, art, маски, findings, candidates и reviews не читаются и не используются. Разрешены только общие принятые inputs/native/dependencies и publication wrapper. P6 gate аттестован CTO и повторно не исследуется. P0+, старые очереди, UGH/Millionko/Drive/backup jobs не запускаются.

## Закреплённые входы и рецепт

Canon b1382dd4c230815a019e52e2ec4617ef705661d5; новая карточка orders/perspective/P5-transfer-water-dark.md, blob 09f33f99d771ab28b9575de1a358acc40b4d571c. ORDER revision 5, P2-P6-transfer, собственная P5 карточка, COMMON и lead role прочитаны. Common file и его bytes/SHA закреплены в DISPATCH.json.

Принятый P1: 4b47db04c7140ebf88f69b91faa0b790d46f22ec, experiments/p1-collider-mapping/clean-repeat-01/. Water — boards/04/trial-02; исторический trial-01 startup FAIL сохраняется и не используется как активный. Dark — boards/02/trial-01. Для каждой доски берутся её config/manifest/projection и исходный JPG из common file; Jungle translation/counts не копируются.

Собственный исходный метод — Jungle RESULT на df0d95f40e60991632c885f0bc53d32497a090e7. Дополнительный ранее принятый общий P0 guide: ee4d8e5c7dbb3b6618d58d6dacb0caf9b73dfb1b:experiments/p0-perspective/research/CROSS_SERIES_CONCLUSION_AND_RECIPE.md; это отдельный pin, не выдуманное поле common JSON и не готовое art.

Native: существующая собственная зависимость source 5a6fa03f1cdb3de88a2d9c7dbe795eb8e2a7f023, sim-core tree 008d16a80a26bb77d562a45218b01da09b0d9ff0. r16, tick 5 ms, quantize 7, g980, maxSpeed2000, angle deviation 2°, bounce deviation .02, lcg32. Физика/RNG/config не подстраиваются под картинку; приватные TS/maps не публикуются.

## Production и критерии

Новые собственные floor/ball/shadow/objects/parts с сохранёнными prompt/raw/selection/provenance. Original crops — референсы. Floor clips из своего generated floor допустимы с точными source polygons/bytes/SHA и не считаются отдельными генерациями. До нового контракта используется совместимость собственного Jungle schema; Builder рано передаёт Artist размеры/anchors/footprints/scale/parts/depth/alpha/sourceClip.

Сначала применяется исходный P5 способ. Обычные новые параметры и исправления отделяются от существенной смены метода; перед существенным вариантом сохраняется результат исходного подхода. Высота нарисованного шара и optical cup anchor выводятся заново из нового art/projection; Jungle 17.8 px не переносятся автоматически.

Water: доступные native подходы к опорам/перемычке/проёму арок; accepted 2D collapse и отсутствие height/lintel colliders сохраняются. Dark: грани/углы/front-side перекрытия. На обеих досках — реальные receiver approaches/front rim; IN_BUCKET не дополняется выдуманным sinking. Long rails/plants включены в подготовку и QA. Обычные throws/replays, LOST сохраняется; win hunting запрещён. Недоступные/непроверенные случаи помечаются честно.

Реальный неизменённый Millionko + Pixi, Play/Pause/Replay/exact tick; paused Art/Geometry сохраняют state/RNG, geometry выше art, ArtOff убирает masks. Независимые TQA и VQA на каждой доске проверяют actual motion и соседние exact before/at/after states, тени, порядок, partial hiding. Static PNG и числовая траектория не заменяют художественный PASS.

Первый материальный checkpoint через 60–90 active minutes: actual Water prototype, первые новые assets, native motion, наблюдаемый сложный случай; Dark inputs уже закреплены. Общий ориентир двух досок — 8–12 active hours с уточнением после checkpoint, без автоматического one-generation/one-fix cutoff и без расширенных необязательных аудитов.

## Передача, ресурсы и публикация

Lead читает результаты в существующих чатах и передаёт точные commits/artifact paths/hashes. Роли не пишут друг другу или другим чатам. Первая новая raw floor передана Builder/VQA как provisional material, без объявления exact registration, motion QA или PASS.

Перед heavy — свежие C/D/E/RAM/CPU/aggregate, собственная оценка и allowance 4 GiB RAM/2 GiB E. E<=4 GiB: предупреждение/диагностика; E<=2 GiB: safe WIP/STOP. Никаких abrupt kills, удаления sources или чужой очистки. TEMP/TMP/cache/output только собственные E process-local, без глобальных env/CODEX_HOME/security/credentials изменений.

TokenGranted=false; transfer Review/VPS writes=0. Отдельный конкретный CTO token требуется до будущих Review/VPS writes; Jungle token CLOSED и не переиспользуется. SSH/Review/VPS операции сейчас не выполняются. Для local wrapper QA отдельно разрешён свой loopback HTTP preview и свой hidden browser/tab, с ownership и штатной остановкой; это не remote permission. Исторические HOLD/STOP/denial сохраняются: composite call_7b166cdf46834d468b5f9c297aad6e9f не повторять/делить/переносить, denied parent Review GET /review/r4d/403 не вызывать, file:// fallback не использовать. Новый denial: STOP exact action/target без обхода actor/ref/path/transport; unknown outcome сначала read-only evidence.

## Checkpoint 003

2026-10-30 02:26 UTC: [CHECKPOINT_003.md](CHECKPOINT_003.md) и [CHECKPOINT_003.json](CHECKPOINT_003.json). Обе independent QA закрыли прежний Water receiver pop на w05 для сохранённого repro. Front-hide остаётся NOTE/UNVERIFIED, нового sorting defect не установлено. Dark d02: положение края улучшено, но VQA D02-V01 о щелях под cap между чашами остаётся OPEN; distinct receiver D01-V01 также OPEN. Water mini05 уже содержит все21 body groups/29 physical targets и11 foreground clips; Builder собирает отдельный w06, actual расширенный QA ещё впереди. Artist продолжает Dark. Task не завершён; final handoff и публикация не разрешены.

## Текущий checkpoint 004

2026-10-30 03:32 UTC: [CHECKPOINT_004.md](CHECKPOINT_004.md) и [CHECKPOINT_004.json](CHECKPOINT_004.json). Water w06 прошёл обе independent actual QA в доступном scope без нового установленного значимого дефекта: TQA101 snapshots, VQA89 captures/22 motion intervals, шесть foreground regions. Полные light/contour/contact гарантии не присвоены. Release импортирует w06 с exact QA refs. Dark d03 receiver-only и d04 floor-only заморожены отдельно и проходят последовательный scoped review; объединённого final Dark ещё нет. Artist продолжает недостающие семейства и foreground. Полный task после checkpoint продолжается, Review/VPS writes0/tokenfalse.
