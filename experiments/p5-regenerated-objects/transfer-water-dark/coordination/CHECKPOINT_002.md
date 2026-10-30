# P5 Water + Dark — оба исходных baseline, checkpoint 002

30 октября 2026, 01:24:57 UTC. Работа продолжается. Exact artifact/QA refs — [CHECKPOINT_002.json](CHECKPOINT_002.json). Новые роли, чаты, worktrees и ветки не создавались; model/effort overrides не отправлялись.

## Фактический результат двух baseline

Water w04: consumer 48763f47d1e21e32334df3427209181a5a6114de, Artist 541085603e01e23b076fe33ff3c9991822c0bce2; 9 новых PNG / 15 texture IDs / 30 instances, 9/21 body groups и 4 receiver pairs. Native/Pixi actual motion, оба контакта arch-07 и partial hide/reveal просмотрены независимо. TQA b4940d77a563f2d56df659a23d11385179562b92: 37 selected snapshots exact state/RNG/config/events. VQA aeacc4184b8dc977a3f3e3c4b3683813ded040f4: 22 кадра, значимого дефекта в данном gate passage не увидел; тень перемычки/support PARTIAL. Это не универсальный PASS сортировки/всех арок.

Dark d01: consumer aae514ed31720ab6d913f4bc6d63286c26992e0a, Artist 0f70d00db096ee30f057dd65ca36a53df3f78899; 8 новых PNG / 15 IDs / 35 instances, 12/24 body groups и 4 receiver pairs. TQA f40bd7fd0349fdf1a0cd7790e0ee2340e6554bd3: 44 selected snapshots exact, четыре front/side/corner окна с actual motion и adjacent states, partial hiding. VQA dc422c6e1a186080df0956e53750335f2e383c18: 31 кадр, согласованные материалы/читаемый шар/тени; явного дефекта в этих контактах не увидел. Dark проверен отдельно, Water verdict не наследовался.

Все обычные исходы 0–3 сохранены, включая Water LOST1326/1196/589 и Dark LOST1812. Строгие native triggers, terminal holds, r16, 5 ms, quantize7, PRNG, config/projection и принятый P1 сохранены. Новых экспортов/компиляции ядра и старых больших матриц не было. W01-V01 framing независимо CLOSED на w02, VQA 9cd09281e27404a526fe25b387a23d34467024d5.

## Что исходный способ не закрыл

Water W04-V01 / W04-TQA-V01 OPEN: receiver-02 скрывает шар на 1273/1274 и показывает целиком на 1275. TQA локализовал full back PNG с почти opaque water alpha 252–253, покрывающей 535/535 sampled sphere points; front здесь transparent. Offset −1/+1 применён правильно, common native/trigger bug не найден.

Dark D01-V01 / D01-TQA-V01 OPEN на receiver-01/02. Здесь сферу закрывает тёмная внутренняя rear wall, а не вода; native states и offsets корректны. Сама задняя стенка вправе скрывать шар, проблема — бинарное раскрытие всей сферы. Новая подготовка должна сохранить естественное скрытие/раскрытие по настоящему борту. Передние rim contacts ещё не доказаны этими terminal trajectories; sinking/fade не добавляется.

Dark near floor edge около sourceY1260 вместо accepted1121 — отдельная открытая art-registration correction. Framing/geometry не менялись для сокрытия. Water missing 5 frogs/7 arches, Dark missing 6 bowls/4 skulls/block05/06 и environment/long-wall/near-edge clips остаются в production. Mask-specific bypass пока UNVERIFIED. **Full Water/Dark/P5 PASS=false.**

## Отдельная коррекция частей

План Builder WATER_RECEIVER_PLAN.md на aa64d27ab5dc6b88982fd5aa2f564d461a935dee прочитан и принят. Неокклюдирующий full base/interior получает уже существующий floor-rank; отдельно рисуются registered rim/back-side-wall с transparent interior и прежний front. Потребовалось минимальное распространение floor-rank на target-bound floor role; новых role/schema/rank, physics или нового sorting-принципа не вводится. Stage всё равно сохраняется отдельно от исходных w04/d01; успех successor не приписывается original baseline.

Implementation WIP прошёл 27 проверок на реальном Pixi Container и перестановках manifest: scene floor → receiver bases → shadows/ball, прежняя target-bound placement/uniform scale, неверный ID перед floor отклоняется. Это не browser pixel PASS. Rim-only Water candidate 1254², 433727 bytes/SHA256 2f58c03e3ae6a7a4a4460f94976c3c5a4b93ca6045674df8140b9221741a3c0a имеет alpha0 в O и двух TQA centers; complete region/actual occlusion ещё не проверены. Manifest/handoff и independent successor QA впереди. Native и старые frozen bytes не меняются.

## Локальная обвязка, время и продолжение

Release 06c45e0273bf8c5f0d447e79aaeb86ba6429e2d4 сохранил exact Water w04 и Dark d01 как read-only original material. Draft archive: 43 public files / 27415220 bytes, hashes и 7 relative links проверены; private source/QA sidecars вне web root. PACKAGE_INDEX 10627 bytes/SHA256 ff6e0284bf1217a02f6fcb0a184e7026cd07d1de0eac3b0167c1d3e2b20fbfe5. Purpose baseline-archive, final=false; текущие исправленные inputs/их QA и отдельный Lead handoff ещё не выданы. Local wrapper browser delivery пока UNVERIFIED, это не final package.

После двух actual baseline предварительная оценка остатка — 4–7 active hours на подготовку/регистрацию частей, недостающий art/foreground, регрессии и текущий локальный пакет; суммарно около 6–9 против исходного guide 8–12. Главная неопределённость теперь asset preparation/occlusion boundaries, не native startup. Это оценка, не автоматический cutoff.

Fresh guard 01:24:57 UTC: C/D/E 13.833/14.619/9.261 GiB, RAM free 10.045 GiB, CPU 4%, aggregate working set27.410 GiB. Lead docs/git estimate RAM 0.25/E 0.01 GiB + reserve 4 GiB RAM/2 GiB E выдержаны; роли делают свои fresh guards перед heavy. Source/rejected/Jungle сохраняются, чужие процессы не трогаются.

Приоритет: registered receiver correction в actual scenes; Dark lower floor; оставшиеся family/depth variants и Water gates; long-wall/near-edge foreground и shadow/support; scoped независимые проверки обеих досок; затем explicit current package. TokenGranted=false, Review/VPS writes 0; никакого SSH/Review до отдельного конкретного CTO token.
