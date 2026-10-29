# P6 Builder: черновик и native/PixiJS consumer

Рабочая область: `E:\R4D\perspective\p6-worktrees\builder`. Runtime: `E:\R4D\perspective\p6-runtime\builder`. Все команды ниже выполнять из своего checkout с process-local TEMP/TMP/npm cache на этом runtime. Глобальные настройки не требуются.

Черновик v01 frozen: [DRAFT_HANDOFF.md](DRAFT_HANDOFF.md). Подготовка финального арта и независимая QA ещё не завершены. Диагностический круг и геометрическая доска не заменяют художественные ассеты.

## Подготовка и запуск

```powershell
$env:TEMP='E:\R4D\perspective\p6-runtime\builder'
$env:TMP=$env:TEMP
$env:npm_config_cache='E:\R4D\perspective\p6-runtime\builder\npm-cache'
python experiments/p6-geometry-first-art/builder/scripts/native-setup.py
Copy-Item -LiteralPath 'experiments/p6-geometry-first-art/builder/runtime-deps/package.json','experiments/p6-geometry-first-art/builder/runtime-deps/package-lock.json' -Destination 'E:\R4D\perspective\p6-runtime\builder\deps'
npm.cmd --prefix 'E:\R4D\perspective\p6-runtime\builder\deps' ci --no-audit --no-fund
node experiments/p6-geometry-first-art/builder/scripts/build.mjs
node experiments/p6-geometry-first-art/builder/scripts/verify-native.mjs
node experiments/p6-geometry-first-art/builder/scripts/serve.mjs
```

Следующая сборка пишет только `runtime/candidates/integration-02/site`, её локальный адрес: `http://127.0.0.1:41767/`. Baseline `b1bb84d` по `http://127.0.0.1:41766/` заморожен для TQA: прежний runtime/site и snapshot не перезаписываются. Подробнее: [BASELINE_FREEZE.md](verification/BASELINE_FREEZE.md). При необходимости перезапуска baseline использовать `node experiments/p6-geometry-first-art/builder/scripts/serve.mjs --baseline`; это раздаёт immutable snapshot и не требует сборки. Не запускать второй процесс на уже занятом порту.

Сервер раздаёт только выбранный site. Он не раздаёт private raw TS или maps; sourcemaps не создаются. Неизменённые native Git blobs находятся только в runtime/private, с object inventory. Native source repo/HEAD не меняется.

Зависимости: Node.js, npm, Python3/Pillow для черновика. Версии PixiJS8.6.6 и esbuild0.25.5 зафиксированы. Никакие реализации других P2–P5 не используются.

## Consumer и проверка

Один RunController и настоящее native API обслуживают паузу, real-time, шаги, seek и replay. Seek всегда заново считает от исходного старта, не подменяет ball state сохранёнными координатами. Real-time добавляет только целые 5ms тики; пауза не интерполирует. Обычный новый бросок берёт uint32 из browser crypto, отдельно от native PRNG. Config меняется только в `rng.seed` для выбранного броска.

Replay сохраняет original config UTF-8, config с seed, start/drop, geometry/projection pins/hash, core commit/tree/compiled hash, текущий native state, исходные native events и отдельный массив `eventStateTicks`. Последний связывает event tick с фактически полученным state tick, не редактируя native events. Арт-кандидат и consumer hash сохраняются как provenance; физический импорт проверяет физические pins, config/start и пересчитанный state. Текущий арт указан в шапке; импорт старого повтора не переключает его.

Внутренняя QA API: `window.p6.state` (clone), `seek(tick)`, `step(count)`, `pause()`, `setView('flat'|'source')`, `exportReplay()`, `meta`. В UI доступны точный JSON native snapshot, независимые арт/геометрия, плоский вид, +1/+10, переход на tick, обычный seed и файлы повторов. Переключатели/масштабирование не вызывают шаг и не используют native RNG.

Selfcheck самостоятельно рассчитывает normal seeds0/1/2, сравнивает single/batch, native runUntilDone, replay/seek и canonical state/event digests с independent QA contract `49719d407fe1a9408911d49ba819ac6a02022a0a`. Состояния QA не подставляются в consumer. Результат: `verification/native-selfcheck.json`; полные собственные traces — runtime/verification. Это проверка физического потребителя, не художественный PASS.

Для отдельного сохраняемого native replay: `node experiments/p6-geometry-first-art/builder/scripts/export-run.mjs SEED [TICKS]`. Без TICKS рассчитывается весь обычный запуск до native terminal. Файлы сохраняются в own runtime/verification.

Стыковка frozen слоёв Artist описана в [CONSUMER_CONTRACT.md](CONSUMER_CONTRACT.md). Реальный художественный кандидат ещё требуется подключить и просмотреть на контактах, боковых отскоках и корзинах. Предусмотренный depth contract не объявляется доказанным качеством перекрытий.

Actual ранний sphere/shadow candidate integration-02: [handoff и реальные кадры](integration-02/HANDOFF.md). Его сборка использует `build.mjs --sprites-v01`, explicit lift0, исходный прямоугольный shadow canvas. Это геометрический фон с настоящими sphere/shadow, без готовых obstacle occlusion layers. Полный board art пока не подключён. Его самостоятельная проверка находится в `integration-02/native-selfcheck.json`, traces — `runtime/candidates/integration-02/verification`; прежний baseline report сохранён.
