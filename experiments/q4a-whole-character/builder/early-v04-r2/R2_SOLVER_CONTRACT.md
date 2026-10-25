# R2 — точный solver contract до actual solve

25 октября 2026. `builder-r4d-q4a-01`. Прочитан `EARLY_V04_R2.md`; условия Concept `R2_REVIEW_CONDITIONS.md` прочитаны. Через Lead оба художника предварительно приняли смысл stop, но окончательные согласия нужны на **эту точную версию**. **READY_FOR_LEAD_CONTRACT_REVIEW_NO_ACTUAL_SOLVE.** Ни одного actual-input solve R2 не выполнялось.

**Preflight02, по прямому уточнению CTO до actual:** прежние draft/code/hash manifest и raw synthetic evidence сохранены в `preflight01/`. Исправлено только evidentiary состояние границы outputs: fraction сбрасывается в0 при начале каждого output, current output index/label названы явно, last accepted geometry/pins и last completed output получают единый authoritative snapshot для Stop и implementation exception. Objective/config/пороги/actual inputs неизменны; проверка edge отдельно в `synthetic/SYNTHETIC_EVIDENCE_EDGE_CHECK.json`, обязательном hashed evidence. Перед actual обязателен отдельный CTO read-only gate после публикации договора.

## 1. Frozen предмет

Не меняются R1 raw/Asset manifest/все10 PNG/actual44 trace, `CAGE_REST.json`614 vertices/1169 triangles/29 pins, `CAGE_TARGETS.json`241 outputs/drop230/back110, source geometry/длины/support и coverage. Rest и targets читаются непосредственно из frozen R1, без перестроения, нормализации или переназначения owners. Hashes exact inputs и этого договора/config/code — `R2_HASHES.json`. В R1 ничего не пишется. Новых app/build/repair/материалов сейчас нет.

Единственная гипотеза: nonlinear positive continuation от последнего accepted positive state вместо harmonic initial iterate. Frozen source-area ARAP energy сохраняется; добавлен заранее фиксированный log-det barrier. Подшаги pins — только численный путь между прежними outputs, не новые позы/anchors/исправления отдельных кадров.

## 2. Objective и производные

Для каждого frozen triangle: rest matrix Dm=[Xb−Xa,Xc−Xa], площадь At=det(Dm)/2>0, F=[Yb−Ya,Yc−Ya]Dm⁻¹, d=det(F). R(F) — ближайший proper2D rotation (тот же polar-angle закон R1).

**Eμ(Y)=Σ At·||F−R(F)||² + μ·Σ At·(d−1−log(d)).** Free variables — только исходные неприкреплённые вершины; pins eliminated и присваиваются exact targets. Первая сумма — прежняя ARAP rest energy без смены весов. Barrier стремится к∞ при d→0+, имеет нулевую энергию/градиент при d=1; не поощряет бесконечное раздувание. Производная по F:2(F−R)+μ(d−1)F⁻ᵀ. Barycentric gradients/source-area scatter те же математические определения; проверяются на синтетике, не actual witness.

Objective конечен только при finite geometry и **d>1e−4** для каждого triangle. Неконечная/неположительная trial форма отвергается, не «лечится» изменением rest/targets.

Barrier schedule для **каждого** homotopy candidate ровно **μ=0.1 →0.01 →0.001**. Ни μ, ни targets, ни число стадий после actual результата не меняются. По каждой стадии журналируются отдельно ARAP, unweighted barrier, μ и их сумма: изменение μ не скрывается как монотонность одной энергии.

## 3. Seed, low0 и adaptive homotopy

Начальный seed — exact frozen rest X с source pin positions X[pins], положительной ориентацией и единичными distortion ratios. Первый output low0 **не пропускается**: от source pin positions к неизменным targets low0 проводится та же adaptive homotopy. После него seed для следующего output — последний accepted positive homotopy state, без harmonic/free-vertex extension.

Evidence fraction имеет область действия **текущего output-интервала** и сбрасывается в0 до первого candidate каждого нового output. Поэтому vertices в его λ0 — последний завершённый output (либо source для low0), а `lastCompletedOutput` остаётся прежним до завершения нового. На всех Stop/exception путях один `evidence_state()` фиксирует эти понятия вместе; λ=1 предыдущего output не переносится в diagnostic snapshot следующего. Эта метаинформация не меняет numerical λ/seed/solve.

Для каждого из241 прежних output targets: origin pins — предыдущий exact output (для low0 source pins). λ начинается0, первый шаг1. Candidate pins = (1−λ)origin+λtarget; на λ=1 присваивается исходный target array без накопления interpolation drift. Free coordinates seed **не двигаются** при смене pins: это копия последнего accepted state. Если такое seed после exact pin assignment не positive, trial отвергается и homotopy increment делится пополам; отрицательная seed форма не становится входом минимизатора.

Принятый candidate проходит весь μ schedule, convergence, positive и distortion/pin gate; λ продвигается, следующий шаг удваивается, ограниченный оставшимся интервалом. При rejection rollback к **последнему принятому** state, шаг×0.5, те же objective/параметры. Minimum step **2⁻¹²=1/4096** прежнего output-интервала. При необходимости меньшего шага — STOP с последним accepted state и rejected witness, не недостижимый low как результат.

## 4. Один nonlinear optimizer

Preconditioned L-BFGS, memory8, с фиксированным source-energy preconditioner H0=(2Kff)⁻¹; Kff — тот же source-area stiffness ARAP. Этот matrix inverse только preconditioner gradient, **не harmonic extension новых boundary pins**. Никаких diagonal shifts/смены preconditioner по witness. При non-descent/nonfinite L-BFGS direction memory сбрасывается и используется −H0g: заранее оговорённая стандартная safeguard ветвь одного optimizer.

Максимальная длина displacement каждой free vertex в trial direction — **2raw px** (trust cap). Далее Armijo line search: c1=1e−4, initial α=1, ×0.5, максимум32 trials. Принимается только finite positive trial с Enew≤Eold+c1α·g·p. Pins остаются exact. L-BFGS curvature pair сохраняется только при s·y>0 и >1e−10||s||||y||; иначе pair пропускается. Memory сбрасывается на новой barrier стадии/candidate. Random seed/стохастики нет; NumPy float64, один BLAS/OMP thread в entry point.

Convergence каждой μ стадии: max по free vertices ||H0g||₂≤**1e−4raw px**. Максимум200 iterations на стадию. Десять подряд принятых iterations с relative objective decrease≤1e−12 при gradient выше tolerance — ENERGY_STALL. Нулевой/неfinite descent,32 неудачных line trials, unconverged200 iterations — rejection candidate; homotopy shrink не означает смены алгоритма. Параметры не подбираются по actual.

## 5. Предварительные distortion stops и точная область действия

Принятый homotopy state и каждый опубликованный output обязаны одновременно иметь:

| Метрика каждого triangle | Допуск |
|---|---|
| Area ratio d | **[0.20,3.0]**, дополнительно strict d>1e−4 |
| Минимальное singular value | **≥0.30** |
| Максимальное singular value / directional stretch | **≤2.0** |
| Condition σmax/σmin | **≤6.0** |
| Max pin error | **≤1e−8raw px** |

Это заранее выбранный технический предел сильного искажения, не физическая калибровка ткани и не художественный PASS. σmin0.30 ещё допускает сжатие направления до30% исходной длины; σmax2 — двукратное растяжение. Condition6 и area≥20% дополнительно не дают компенсировать потерю высоты экстремальным stretch в другом направлении. Такой результат всё равно может быть художественно непригодным **внутри** этих limits; оба художника это явно отметили через Lead. Пределы не получены перебором actual inputs/R1 witness.

**Где применяются:** positive d>1e−4 — ко всем входящим в objective/принимаемым optimizer iterates; отрицательные line trials только логируются как rejected. Distortion limits таблицы — **после convergence всего μ schedule, перед принятием каждого homotopy state, и повторно на каждом exact output**. Они не навязываются отдельному line-search trial или промежуточной μ стадии: эти transient optimizer states не выдаются за принятый численный путь/позу. Их ratios/SVD/condition также журналируются; временный выход за limits не скрывается.

Candidate, нарушивший distortion gate, отвергается и возвращается в ту же adaptive homotopy; если gate невозможно пройти при finite budgets/minimum step, итог FAIL. Нельзя принять более мелкие substeps вместо отсутствующего конечного target или опубликовать partial low как PASS.

## 6. Бюджеты и точные условия STOP

Не более**60000 optimizer iterations** на весь actual run,200 на μ stage;256 attempted candidates/128 accepted substeps на один output,8192 accepted substeps всего. Нужен step<1/4096 — STOP. Исчерпание любого бюджета, nonfinite/singular rest/preconditioner, pin mismatch, implementation exception или изменение frozen input/code hashes — FAIL/STOP. Для attempt/stall/distortion сохраняются target index/low, λ, candidate/last accepted vertices, precise reason/metrics/triangle owners и source/target triangle. Infeasibility глобального constraint problem этим не доказывается.

После единственного actual результата никаких изменений law/config/topology/pins/geometry/material и автоматических retries. Даже подтверждённый implementation bug — только audit и прямое решение CTO. Lead не разрешает такой повтор самостоятельно.

## 7. Журнал и критерий PASS

`R2_JOURNAL.jsonl`: source seed; каждый optimizer iteration/convergence/stage complete; для них ARAP/barrier/objective, μ, min/max area ratios, min/max singular values, condition, preconditioned gradient, pins, iteration budget; принятый α, число rejected line trials и худший их orientation ratio; accepted/rejected homotopy attempts, λ/step и reason. Геометрия хранится на всех exact outputs и в final failure/last accepted witness; не каждый отвергнутый trial становится отдельной художественной версией.

Технический PASS требует **всех241 outputs low0..240**, включая исходный full drop230/back110, exact pins и limits на каждом accepted homotopy/output. Partial outputs не PASS. Frozen source/geometry/coverage/support hashes должны совпасть до/после: прежние52221 nonzero source centers covered без extrapolation; два ранее раскрытых partial cell-corner исключения остаются, не переименовываются в идеальную RGBA coverage. Legs/support не оптимизируются R2 и не могут меняться; прежний121-state feasibility остаётся отдельным компонентом.

Только numeric PASS даёт основание для отдельного разрешённого bounded shoulder corridor cycle/after. Сейчас repair/app/build/after не начинались. Будущий exact after сохраняет neutral/near swing±25°/полный low/transition/оба фона/raw рядом; Concept/Asset независимо оценивают форму. Внутри численных limits сохраняется возможность artistic FAIL.

## 8. Preflight, hashes и запрет преждевременного actual solve

`run_r2.py --synthetic` использует только самостоятельно заданную25-vertex square grid, аналитические perturbations, rigid transforms и заведомо отражённую boundary. R1 rest/targets/actual witness не загружаются. `synthetic/SYNTHETIC_CHECK.json` и журналы фиксируют проверки формул/gradient/rigid invariants, positive rejection, adaptive homotopy и finite stop; это не подбор по actual.

До первого actual solve сохраняются этот contract, `CONFIG.json`, `positive_solver.py`, `run_r2.py`, synthetic evidence и `R2_HASHES.json`. После финальных согласий художников и commit/push Lead возвращает **точный manifest/commit CTO для обязательного read-only gate**. Одного review/старта Lead без этого gate недостаточно. Только после прямого положительного gate CTO и отдельного старта создаётся `AUTHORIZED_START.json`, привязанный к approved manifest SHA256 и CTO-gated commit. Код требует одновременно `startFromLead=true`, `ctoReadOnlyGatePassed=true`, оба approved manifest hashes равными текущему и40-символьный `ctoGateCommit`. До этого `--actual` заблокирован **до загрузки actual численных inputs**. Actual entry point сверяет все input/code hashes и создаёт exclusive `ACTUAL_RUN_STARTED.json`; второй запуск запрещён даже после exception. `R2_RESULT.json` и post-run hash check сохраняются на STOP/PASS. Никакого actual solve до этого старта нет.

Ориентир подготовки25–40мин; один ограниченный actual run15–25мин, возможна более ранняя остановка. Это оценка, не дополнительный wall-clock-based tuning/budget: воспроизводимый STOP определяется объявленными counts/tolerances. Если реальное время существенно больше — сообщить Lead, не менять параметры. Stage/commit/push — Lead.
