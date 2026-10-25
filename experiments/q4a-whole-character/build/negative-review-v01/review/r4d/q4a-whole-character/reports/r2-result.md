# R2 — единственный actual: FAIL_STOP

25 октября 2026. Builder `builder-r4d-q4a-01`. **R2_FAIL_STOP. Full range не достигнут; repair/after не открывались.** Прямое [решение CTO об остановке Q4A](../../CTO_STOP_DECISION.md) и [CLOSURE](../../CLOSURE.md): исследование завершено с отрицательным/частичным результатом. Новых solver/topology/anchors/whole/repair/full-parts/motion попыток нет. Отдельный evidence viewer — другая задача после сохранения пакета, не animation PASS.

## Точный запуск и сохранность

Единственный command `python -B experiments/q4a-whole-character/builder/early-v04-r2/run_r2.py --actual`; разрешённый commit `2b9e0a87cdc8e068ca4ce465b322587461431f23`, manifest `c02ada675af95499a5d91b9e5d0b3e799dbb5a1f71ec9618cbbf4e0791f6d7e8`. CTO read-only gate и отдельный старт Lead сохранены в authorization/sentinel. **Exec session3530, exit1, elapsed12.563s, actualRuns1**, implementationException=null. Ни actual, ни synthetic после результата не повторялись; hashed code/config/inputs не менялись. Все44 published hashes после запуска совпали (`POST_RUN_HASH_CHECK.json` и финальная сверка).

OS PID отдельно захватить не успели: процесс уже завершился. Первоначальный auxiliary `ACTUAL_EXECUTION.json` был whole-file null из-за PowerShell capture error; Builder заменил его восстановленной metadata **до** получения запрета CTO менять raw wrapper. Это ошибка сохранности capture: первичные bytes/hash не сохранились, не выдумываются. Нынешнее object-поле processId=null — другой факт, отсутствие наблюдённого PID. Подробная chronology/tool chunks/пределы наблюдаемого и hash surviving object — [EXECUTION_CAPTURE_AUDIT.md](EXECUTION_CAPTURE_AUDIT.md) / `.json`. Авторитетные sentinel/result/failure/journal/post-hashes не переписывались; повторного запуска для PID не было.

## Где остановился согласованный путь

Приняты **26 exact outputs low0..25 из241**. Последний completed low25=25/240, drop**23.958333333333336px** из230. Current target low26=26/240 (target drop24.916666666666668px) **не принят**.

В его локальном homotopy-интервале последний accepted λ=**0.15234375**, rejected candidate λ=**0.152587890625**, trial step=1/4096. Требуемое дальнейшее уменьшение до1/8192 нарушило minimum step → **MINIMUM_HOMOTOPY_STEP**. Candidate rejection — **SINGULAR_COMPRESSION**: σmin=**0.29999830114264353 < frozen0.30**. Малый размер нарушения не округляется в PASS. Последний accepted σmin=0.30000227739148483.

Equivalent low/drop для численного pin interpolation: accepted0.10480143229166666 /24.104329427083332px; rejected0.10480244954427083 /24.10456339518229px. Это **не дополнительные completed outputs и не принятый output26**. Evidence fraction корректно относится к current output26; lastCompletedOutput=25 сохранён отдельно.

Candidate имел положительную orientation: min area ratio0.39420865977255604, max1.8040140147429253; σmax1.5807565200595528, max condition4.528119302176538. Причина — заранее установленный distortion stop, **не inversion**. Все3 μ stages0.1/0.01/0.001 этого candidate сошлись до quality rejection; final ARAP346.80562882079636, barrier133.7633249525114, objective346.93939214574885. Это не глобальное доказательство infeasibility cage.

## Exact witness и журнал

Triangle**923**, indices**[221,611,344]**, все owners**free**, source area2.6741906845341084px². Его candidate singular values≈[1.358428098024174;0.29999830114264353], area ratio0.40752612163168467. В source triangle три dense pixel centers alpha253: (476.5;842.5), (477.5;842.5), (483.5;843.5) — не полностью прозрачная служебная ячейка.

Exact source/last accepted/rejected vertices, pins, λ и source-alpha — `R2_FAILURE.json` и `R2_WITNESS_SUMMARY.json`. Лично просмотренный статический [R2_WITNESS.png](R2_WITNESS.png) / `.svg` построен **только из сохранённых arrays**, без solve/правки арта: source, accepted partial state, rejected candidate и σmin graph. Никакой художественной сборкой/full after он не называется.

**1197 iterations /30 accepted homotopy substeps**; current output26:21 attempts/4 accepted substeps. Не исчерпаны iteration60000/substep8192 budgets; сработал именно minimum step после quality rejection. Journal содержит1056 optimizer iterations,141 convergence/stage-complete records,30 homotopy accepts/17 rejects (все compression),26 output accepts, один terminal stop. `R2_JOURNAL_AUDIT.json` сохраняет energies/budgets/counts; raw `R2_JOURNAL.jsonl` не менялся.

Все frozen rest/targets/actual44/raw/material/coverage/leg geometry/support остались прежними. Source gate raw-v04 остаётся FAIL. R1/исторические wrong-input попытки не изменены. Полного low230 rendered after, artistic MOTION_REVIEW/joint PASS и full motion результата нет. Точный ограниченный FAIL-пакет готов Lead для read-only сверки и commit/push; дальнейших численных или художественных попыток не запускаю.
