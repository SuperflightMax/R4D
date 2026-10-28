# P2 playback source implementation 01

28 октября 2026. **SOURCE_IMPLEMENTED_TARGETED_CHECKS_PASSED; NEW_BUILD_NOT_STARTED**. По адресному разрешению Lead выполнен только presentation slowdown. Diagnostic/plan commit `086d0852732815014ed4a596bcd67528874a04df`; actual source commit **`0a80b0b63c688b6f77b8f710576adf2ea5c263c1`** содержит реальные rate/helper/UI/build-emission изменения и targeted selfcheck. После source commit worktree был чистым; этот handoff — отдельный bookkeeping. Нового candidate/build/release/HTTP/browser/server actions нет.

## Reviewable source diff

Diff: `git diff 086d0852732815014ed4a596bcd67528874a04df..0a80b0b63c688b6f77b8f710576adf2ea5c263c1 -- experiments/p2-free-approach/builder/`. Ровно6 code/check files,252 additions/24 deletions; существенная часть additions —150-line targeted check без нового framework.

| Файл | Реальное изменение |
| --- | --- |
| `index.html` | Отдельная «Скорость»:0,25× · разбор(default),0,5×,1×; spatial «Масштаб» не изменён |
| `src/playback-clock.mjs` |52-line pure presentation clock и observation merge, без DOM/core/seed/RNG |
| `src/main.mjs` | Rate binding/status, integer tick budget, reset/visibility wiring, presentation history/export и p2QA setter/snapshot |
| `scripts/build-static.mjs` | Explicit helper.mjs→helper.js emission и ровно одна новая main import rewrite с source-blob/canonical-SHA receipt |
| `scripts/check-static.mjs` | Проверка новой import reference и helper emission receipt для будущего bundle |
| `scripts/check-playback.mjs` | Адресная проверка clock/metadata и короткого real-core contact prefix |

Native Controller/core/config/projection/r16/PRNG/ball art/occluders/touch CSS/gestures и zoom/fit код не менялись. Style/controller/config/accepted manifest/view-math отдельно сопоставлены с exacte7ed baseline в selfcheck; Git diff не содержит asset/core/config изменений. Pinned strict scanner/SDK exception source не менялись; новая.js helper emission проходит тот же scanner. Предполагаемый будущий bundle будет иметь шестой JS module; сейчас emission только подготовлен в source, output не создан.

## Точная timing/reset policy

- `PlaybackClock.consume(deltaMs, remainingTicks)` получает прежний capped Pixi deltaMS, умножает на validated rate∈{0.25,0.5,1} и возвращает только целые5ms physical ticks. Дробный остаток измеряется в sim-ms и переносится между frames и сменой rate.
- App ticker.speed не используется как второй регулятор: остаётся исходным1(default private Pixi ticker). FPS/SDK time-cap не менялись; raw elapsedMS не применяется для неограниченного catch-up.
- `setRate` сохраняет fractional credit, не вызывает native advance, не меняет seed/state/paused. Текущий rate переносится на следующий replay/random/explicit-seed run.
- Pause/continue/start/replay/seek/manual steps/focus-pause сбрасывают дробь и ставят discardNextDelta. Первый следующий running delta игнорируется, поэтому предшествующий интервал не создаёт catch-up. Это осознанная presentation policy, не обещание точного wall-time ratio через паузы.
- `visibilitychange` не меняет выбор paused: suspend запрещает clock budget, hidden/visible transitions сбрасывают дробь и первый delta. После возврата вкладки не догоняется скрытое время. Main DOM wiring ещё не исполнялся в браузере.
- Tick budget ограничен remainingTicks; на terminal/max-tick bound не хранится долг, native done сбрасывает clock. Ручные+1/+10/+100, seek и replay по-прежнему идут напрямую через неизменённый Controller; interpolation не добавлена.
- UI status отдельно называет sim-seconds и current rate. Уменьшение скорости не меняет размер шарика или spatial scale; при jank rate не гарантирует показ каждого тика, остаются contact seek/pause/+1.

## Observation/export context

Каждый replay descriptor сохраняет полный прежний physics config/version/seed/provenance и получает отдельное `presentation` поле (`r4d.p2.presentation.v1`). Оно содержит atTick, snapshot clock и history. Каждый history record имеет sequence/reason/atTick/rate/paused/hidden и наблюдавшиеся zoom/art/geometry; manual step/seek сохраняют requested count/tick. Rate changes записываются сразу, не выдавая текущий rate за весь run.

При rewind прежний более поздний physical checkpoint может сохраниться для воспроизведения, но `mergeObservation` всегда берёт последнюю presentation history и её явный atTick. Так новая смена скорости на меньшем тике не теряется из-за выбора max physical tick. Старый run завершается записью superseded, новый получает свою history с сохранённым current rate. `p2QA.snapshot()` показывает presentation отдельно от state; `p2QA.setPlaybackRate(rate)` использует тот же validated путь, что UI. Export/download DOM не проверялись.

## Meaningful targeted selfcheck

Выполнен новый `scripts/check-playback.mjs`, не прежняя11087/3909-state матрица. Read-only test dependency — уже существующий compiled03 core SHA256 `dbb01f3276fca9df7bacd69ecfb1e3737e74f6bd606b67041ec6ba5ca092c2a7`; config exact SHA256 `dd5c519cd6d4b7295118e0a3a1063efed424a0ce739450bd5153c6a9941982db`. Новый compiled runtime не создавался.

**10 checks passed**, Node exit0. Пять изменённых/new JS modules/scripts дополнительно прошли node --check; git diff --check пройден. Targeted evidence:

- `E:/R4D/perspective/p2-runtime/output/builder/playback-source-selfcheck-01/EVIDENCE.json`
-88509 bytes, SHA256 **`211c28256ef31bf5ac5d749281c04219e7e90beab169721c3756943e82e51f26`**.
- Checked UTC2026-10-28T06:06:19.613Z. SourceRecords фиксируют canonical-LF SHA всех6 tested source files.
- Две10ms frames при0.25× дают ровно один5ms tick; отдельный rate-change fixture сохраняет2.5ms fractional credit. Закрытая rational formula для96ms budget совпала с разбиением на неравные frames при всех3 rates. Такой oracle ловит per-frame floor/reset и двойное применение rate, не является копией budget loop.
- Проверены pause/hidden/visible/first-resume delta, remaining/end clamp, invalid inputs и rewind/history merge с более поздним physical checkpoint.
- Один reference256 ticks(seed1); четыре clock-driven prefix runs до128:0.25×/0.5×/1×/mixed,203/101/51/176 synthetic frames. Каждый callback сопоставлен с независимым integer-quarter-ms credit oracle, snapshot/events — с real-core reference, все128 native frames — exact. Первый реальный leaf-01 contact frame95 пройден; новых seed ради успеха нет.
- Общий prefix trajectory SHA256 всех четырёх сценариев: `32cc70b42385e237abc2102bed3367bf14226124fb76f2fe41205507dd7ecd09`. Отдельно seek94/+1/+10/+100 и seek95 совпали с reference; reset clock не вызывает лишнего physical tick.
- Ambient Math.random/crypto access traps были включены: **0 обращений**, cryptoTrapInstalled=true. Real seeded frames/events совпали после контакта; это проверка ограниченного prefix, не blanket утверждение обо всём возможном PRNG scope.
- Browser text нового helper проверен действующим strict scanner; scanner/SDK exception не расширялись.

Перед малым Node-пакетом свежие totals на06:06:01.9985949UTC: RAM free10.771GiB, CPU7%, C/D/E8.050644/16.326077/43.132099GiB. Эти system totals включают сосуществующую нагрузку; чужие процессы/вычисления не затрагивались. Оценённый малый пик Node≤128MiB RAM/E≤2MiB output не исчерпывал ресурсы; rule4/2 соблюдено. TEMP/TMP только process-localE, NODE_DISABLE_COMPILE_CACHE=1; install/global cleanup/settings не выполнялись.

## Граница handoff

Selfcheck доказывает pure clock scheduling/metadata и указанный реальный core prefix. Он не исполнял main DOM callbacks, WebGL/Pixi/render, actual visibility events, browser rate select/export/download или Android. UI/mobile/scene/full Technical QA/artistic PASS отсутствуют. Helper/scanner check не подменяет независимую QA новой сборки.

Published immutable candidate03/sourcee7ed… и все старые artifacts/QA/evidence не редактировались; old core только прочитан как test dependency. Runtime output selfcheck создан в новом E directory. Touch/size/height/occlusion из диагноза не исправлялись. Новый build/release token не выдавался и не использовался, serverwrites/reload/rollback0.

Следующий шаг — Lead читает actual source commit/diff и выдаёт отдельный new immutable candidate build gate и relevant QA. До этого сборка/публикация не начинаются. После clean commit/push source handoff завершён без activewait.
