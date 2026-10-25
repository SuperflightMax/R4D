# R1 — итог пакета Asset

25 октября 2026. **MINIMAL_MATERIALS_COMPLETE_WITH_LIMITATIONS / R1_TECHNICAL_FAIL_BEFORE_FULL_AFTER.** По решению Lead после повторного solver STOP работа заморожена. Изготовление минимального source-derived набора выполнено; motion/shoulder artistic PASS **не проверен**, joint gate не состоялся. Это не доказательство невозможности cage и не отрицательный художественный review отсутствующего полного after.

Передача: `MATERIALS.json` + `SHORTS_TRACE.json`, материалы в `materials/`, локальный repair provenance в `repairs/tank-01/`, общий `PROVENANCE.md`; личный просмотр исходной сборки — `INITIAL_ASSEMBLY_REVIEW.md`. Source/style только v04, raw SOURCE FAIL остаётся.

Стабильные hashes:

| Файл | SHA256 |
|---|---|
| MATERIALS.json | `5c03e254dca5e430d978b9fcf4bd713df639375039af25523b442d3239a0c65f` |
| SHORTS_TRACE.json | `330468ff7eba951f88efb8b4af464f3b772094a67bea9ac62124b0cc3345484a` |
| diagnostics/initial-assembly.png | `c0e05e9dfca9e4d801c415014275d8d54a3d665b7ae2fa196e9eb01534a0afc7` |
| diagnostics/SOURCE_PIXEL_CHECK.json | `85941038e07f1b55ab55a7a52b2932c460c70b7cc72b0faa65c43e7581ac4709` |

Индивидуальные hashes десяти материалов — в manifest. Ниже полноты генерации: один local repair не выполнил задачу и сохранён отклонённым, второй открыл ткань и применён только к прежнему subset. За рукой остаётся узкий незаполненный diagonal corridor; rest arm закрывает его, swing не проверен и готовым не объявлен. Новых hidden surfaces/масок ради обхождения solver не назначено.

**Важная граница версий для Builder/Lead:** при личном semantic review material01 очищен от yellow fringe на arm и skin fringe под cuffs; финальный actual garment boundary берётся из текущего alpha/SHORTS_TRACE, не из прежнего hand envelope. Если сохранённый solver witness построен по более раннему trace/текстуре, его нельзя задним числом объявлять прогоном финальных PNG. Не пересчитывать solver/не менять материал автоматически: сохранить оба факта и сопоставить hashes в handoff. Это semantic correction материала до его freeze, а не попытка исправить cage результат.

Ни full rendered after, ни MOTION_REVIEW не создавались. Новые whole/full parts/full motion/QA/release/Q2A не открыты. Старые источники/evidence/R0 и чужие изменения сохранены. Пакет готов Lead для stage/commit; дальнейшее действие только по отдельному поручению.

### Установленная связь версий перед публикацией

Аудит подтвердил: solver использовал31-точечный boundary SHA256 `c967ab5f…bcd708`; текущий stable trace SHA256 `330468ff…5484a` содержит44-точечный actual boundary и добавленный прежний handTraceEnvelope. Все semantic seam/cuff paths и owners неизменны. Исторические байты точно восстановлены с CRLF и совпали с первоначальным input hash — `history/SHORTS_TRACE_INITIAL_EXACT_RECOVERED.json`; полный отчёт `TRACE_VERSION_AUDIT.json`. Таким образом, технический STOP приписывается только историческому trace, не текущей44-точечной геометрии. Material/trace во время аудита не менялись, нового прогона/PASS не было.

### 25 октября 2026 — отдельный актуальный прогон actual44 завершён

После предыдущей записи Builder отдельно выполнил тот же pipeline на frozen current44-vertex trace/material. По его техническому результату и сообщению Lead: **STOP low53/240**, drop≈50,79 raw px из требуемых230, orientation ratio≈−0,00260944; cage покрывает все52221 nonzero-alpha hip pixels. Исторический envelope STOP остаётся только историческим входом; этот новый STOP относится к актуальному44-точечному входу и не смешивается с ним. Материал/trace Asset между аудитом и этим прогоном не изменялись.

Полного after нет. Художественный motion gate по-прежнему **не проведён**, motion/shoulder artistic PASS не заявлен; известный незаполненный shoulder hidden corridor остаётся ограничением материала. Это технический STOP конкретного зафиксированного способа, не доказательство невозможности cage вообще. Новых repairs/материалов/смены метода Asset не выполнял. Art пакет финален; старые факты и точные bytes сохранены.
