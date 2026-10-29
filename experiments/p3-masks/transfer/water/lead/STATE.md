# P3 Water — состояние Lead

29 октября 2026. Actual Lead turn `01a186fa-2fef-7ff2-8083-4a9fa83f9883`.
Worktree `E:\R4D\perspective\p3-worktrees\lead`, прежняя branch
`codex/r4d-p3-masks-lead-01`, исходный clean HEAD
`b6226c4ed81493273d421001a2202c3a2bc4639e`.

## PRODUCTION_STARTED — candidate/QA/publish ещё нет

[Исходный рецепт/точные входы](BASELINE.md) зафиксированы до переноса.
Все пять участников fresh completed/notLoaded/errornull проверены перед
последовательными адресными handoff; каждый send isError=false. Runtime
передачи model=gpt-6.1-sol/thinking=xhigh, новые роли/чаты/worktrees не созданы.

| Роль | Existing chat | Фактический новый turn |
| --- | --- | --- |
| Builder | `01a17fb0-0342-7083-8170-081fd7446d11` | `01a186fc-2c6b-7f21-8c77-dadb83058f22` |
| Artist | `01a17fb0-1134-7433-8f15-30a362b2af46` | `01a186fc-3554-7330-8c86-29166bcd6773` |
| TQA | `01a17fb0-1ad2-70e3-823b-e26a5dbdceb8` | `01a186fc-3cd2-7173-b970-246428cca6de` |
| VQA | `01a17fb0-2697-7b10-ad86-9b4bbe6548ae` | `01a186fc-4717-75e0-8725-5014d72cb42e` |
| Release | `01a17fb0-3262-7d02-957e-29f4c9d649b6` | `01a186fc-4d21-7c02-955d-3731d997bef5` |

Первое concrete Builder action `exec-979fdca8-4a9d-4341-ba62-97339a68c466`
completed/exit0: HEAD/branch/status, exact cards, P1 inventory, source hashes.
TQA/Release первые read-only commands тоже completed/exit0. Обязательный
checkpoint с пятью send/turn IDs и action отправлен CTO, isError=false.
Новые адресные уточнения Lead передали независимо проверенные Water/Dark pins
и ресурсы, не дублировали выдачу или новый состав.

Задачи: Builder consumer/config/provenance; Artist whole-art masks/ball/shadow;
TQA exact inputs/native invariants и доступность gate; VQA independent matrix;
Release только локальный план, затем idle. Первый видимый Water ориентир45–75
активных минут, пересмотр по факту. Первый проход двух досок2–3ч; bounded
цикл QA/доводки/публикации4–6 активных часов — оценка, не критерий PASS.

Fresh host Lead09:28:16UTC: RAMfree16.659/31.907GiB,CPU2%,
C/D/Efree16.347/16.280/11.942GiB. Предварительная добавочная совокупная
оценка initial peak≤4GiB RAM/≤2GiB E, не резерв/гарантия. Собственные свежие
snapshots перед тяжёлыми шагами обязательны. E≤4 diagnosis,≤2 checkpoint/stop.
Ролевые temp/cache/output только E runtime transfer-water-dark/water.

Следующий участок Lead: свести Artist/Builder контракт; получить первый
применимый Water handoff и реальный native/Pixi checkpoint, затем immutable
candidate обеим независимым QA. Water gate подтверждать actual movement/
overlap; input blocker отдельным воспроизведением CTO. Dark идёт отдельно.
Не останавливать производство на одном STATE/ACK. Jungle не менять.

Server_write=false, токена нет, P5 first release window. Published результата
Water нет; будущий route `/review/r4d/p3-masks-water/`. Никакого remote
staging/upload/lock/nginx/service-doc writes/cleanup до нового exact token.
Legacy denial не повторять/не обходить; UGH/чужие методы не трогать.
