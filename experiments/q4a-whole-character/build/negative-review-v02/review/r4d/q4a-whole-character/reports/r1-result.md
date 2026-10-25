# Early-v04-r1 — итог по stable actual input

25 октября 2026. Builder `builder-r4d-q4a-01`. **SOLVER_FAIL_STOP. Фиксированный способ закрыт по решению Lead, без дальнейших numerical/topology/anchors изменений.** Full rendered after с low230 не получен; личный художественный MOTION_REVIEW не выполнен. Это FAIL конкретного фиксированного solver/продолжения, **не доказательство глобальной невозможности cage**.

## Точная финальная версия

- Единственный raw-v04 SHA256 `56947ae376af812075e42f23d2c874ef1c9f30de6f51718700f4376cfae38bb3`; исходный SOURCE_POSE_FAIL остаётся.
- Frozen actual trace44 SHA256 `330468ff7eba951f88efb8b4af464f3b772094a67bea9ac62124b0cc3345484a`.
- Frozen Asset manifest SHA256 `5c03e254dca5e430d978b9fcf4bd713df639375039af25523b442d3239a0c65f`.
- После явного freeze Asset через Lead exact bytes trace/manifest/всех10 PNG сохранены в `inputs03/`; hashes проверены до/после копирования. Solve читает собственную frozen copy; parse/hash trace получены из одних bytes.
- `CAGE_REST.json`:614 vertices/1169 triangles/29 constraints, один actual contour,2px геометрический AA guard. Верх pelvis, реальные короткие boundary arcs двух cuffs — соответствующие thigh; внутренние degrees of freedom свободны. Ни alternate panels, ни v02 geometry.
- `CAGE_TARGETS.json`:241 равномерный target до drop230/back110; source geometry/длины неизменны. Один прежний constrained ARAP rest-shape закон, harmonic continuation и positive line search, без уменьшения диапазона/кадровых поправок.

`INPUT_HASHES.json` и `FINAL_LINKAGE.json`: все финальные checks **true**, включая rest/targets→solve, geometry→rest, exact trace bytes→rest, embedded semanticTrace equality с actual stable source, manifest/каждый PNG→Asset hashes и неизменность inputs/code после capture во время прогона. Hashes кода/rest/targets/материалов сохранены. После этого inputs не меняются.

## Результат и точный witness

Сохранены53 положительных samples low0…52/240. STOP на **low53/240=0.22083333333333333**, root drop **50.791666666666664px** из требуемых230. Первая отрицательная форма — **initial harmonic iterate ДО ARAP-итераций sample53**, не финальное доказанное отрицательное constrained solution.

Triangle **923**, indices **[221,611,344]**, все три **free**. Source signed area **2.6741906845341084px²**, failed target area **−0.0069781375924504495px²**, ratio **−0.002609439047413189**.

| Vertex | Source x;y | Failed harmonic target x;y |
|---|---|---|
| 221 | 470.21574880813137;841.340013360983 | 494.5699110902981;880.0326745096341 |
| 611 | 485.4601202981951;843.7319743487352 | 507.1393170250657;877.823997783039 |
| 344 | 480.66734184198424;843.3307929864787 | 503.7111324264878;878.4252827842068 |

Последний positive **low52/240=0.21666666666666667**, drop49.833333333333336px: triangle923 vertices (494.45257797019264;879.3514041177783), (507.0341512252992;877.1810879141284), (503.6023001537905;877.7781100485968); area0.03163786536266053px², min ratio0.011830818776549925, max condition223.8138288677073, min singular0.007270494370306154, boundary error0. Уже почти схлопнувшаяся форма не объявляется пригодной из-за положительной площади.

Ближайшие constraints: index27 nearThigh/source(469.40373828476174;847.9109986234081), index26 nearThigh(496.1396894986855;857.5359410604207), index268 nearThigh(444.9798151439611;841.4311822799305), index28 nearThigh(420.5558920031605;834.9513659364527), далее far cuff. Точные8 соседей/owners/source/targets/расстояния — в `CAGE_FAILURE.json` вместе со всеми failed initial vertices. Witness лежит у near cuff; это не отрицательный determinant rigid thigh.

Внутри source triangle **три реальных dense pixel centers**, все alpha253: (476.5;842.5), (477.5;842.5), (483.5;843.5). Сбой не ограничен полностью прозрачной служебной ячейкой. Но иной положительный initial iterate/solution при тех же constraints не искался: изменение solver/continuation — отдельное решение CTO, не текущий вывод.

`CAGE_FAILURE.png/.svg` лично просмотрены: source / last positive / first negative и увеличенный точный triangle. Это статический технический plot, не fake animation after. `IMPLEMENTATION_AUDIT_INPUT03.json`: rest F≈I (max error7.32e−14), rest global solve max error9.27e−11px, gradients с ненулевым perturbation проверены finite differences (max error≈1e−7). Другой подтверждённой ошибки реализации не найдено.

## Coverage, support и достигнутые компоненты

`CAGE_COVERAGE.json`: **все52221 nonzero-alpha source pixel centers hip texture покрыты**, omissions0, extrapolation=false. Полный byte-identical footprint не заявлен: у двух dense cells (588,848)/(586,849), alpha253, нижний правый corner выходит за геометрический contour; остальные проверенные corners внутри. Это раскрытая граница raster→mesh coverage, не замаскированное полное RGBA равенство и не причина witness triangle923. Guard/текстура после FAIL не менялись.

`GEOMETRY_RESULT.md`/`GEOMETRY_FEASIBILITY.json/.png`: отдельно сохранены121 полных leg-chain states до low230/back110, max length error2.28e−13px, dense support error0, scale/stretch нет. По готовым final shoe PNG dense rows совпали с raw inputs: near1469/far1464 при alpha≥128, near1468/far1461 при≥250. Общая floor1470 достигается только IK полных chains; shoe следует ankle, отдельного offset нет. Этот компонент достижим, но **не cage или художественный PASS**.

## Два ранних wrong-input прогона сохранены отдельно

`attempt01/`: прежний31-точечный hand envelope и ошибочно свободный far-cuff endpoint11; STOP low8 ratio−0.0100437. `attempt02/`: исправлена только его semantic принадлежность (vertices/topology прежние), STOP low8 ratio−0.0100212. Сохранены inputs/code/solve/witness/отчёт. Они **не результаты финального actual contour**.

Аудит обнаружил конкурентный переход Asset от hand envelope к44-точечному actual boundary/очищенному material до freeze; все seam paths остались прежними. Финальный corrected-input прогон разрешён Lead и выполнен только после freeze. Старые31-точечные bytes затем точно восстановлены Asset с CRLF: hash `c967ab5f1a635c3587fa7b56d5298529d87cd6353f57ffa1f0793f666fbcd708`, значения равны embedded historical rest. Проверенная копия — `SOURCE_TRACE_USED_INITIAL_EXACT.json`. Раннее честное сообщение «не удалось восстановить bytes» отражает проверку LF-сериализации до этого восстановления, а не текущую утрату данных. Противоречие «все hashes совпали» при false trace linkage исправлено и не переносится в финальную проверку.

## Что не получено / границы остановки

Нет full low230 rendered after, shoulder±25° exact-after показа на обоих фонах, immutable animation snapshot/URL или совместного artistic gate. Исходная статическая сборка Asset, скелет, первые53 численных cage states и failed triangle не подменяют этот результат. Новых repairs/full parts/whole calls/runtime ради фиктивного отчёта нет. Technical/Visual QA, full motion/release/Q2A закрыты. Старые raw/guide/snapshots/R0 и чужие материалы не менялись. Завершённый компонентный FAIL передан Lead для read-only сверки и commit/push; новых solver/init/topology изменений не запускаю.
