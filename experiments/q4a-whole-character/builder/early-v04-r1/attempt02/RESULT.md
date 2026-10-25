# Early-v04-r1 — технический STOP фиксированного cage solver

25 октября 2026. Builder `builder-r4d-q4a-01`. **SOLVER_FAIL_STOP. Полный согласованный after не достигнут.** Это результат конкретной зафиксированной topology/constraints/численного продолжения, **не доказательство невозможности cage вообще и не отрицательный художественный review ещё отсутствующего full low**. Другой метод/топология/anchors/уменьшенный low не открывались.

## Что действительно сделано и можно показать

- `SOURCE_GEOMETRY.json`, `GEOMETRY_FEASIBILITY.json/.png/.svg`: новый v04 skeleton,121 состояния полного low230/back110 по обеим неизменным длинам, technical support error0/max length error2,28e−13px. Сохранились исходные centres/длины и весь первый результат.
- Asset передал `MATERIALS.json` и `SHORTS_TRACE.json`. По готовым `near_shoe.png`/`far_shoe.png` повторно сверены dense rows: при alpha≥128 **1469/1464**, при≥250 **1468/1461**, совпадают с raw support inputs. Полные chains дают общий floor1470 без отдельного shoe offset/stretch. Это сверка материала, не новый художественный PASS опоры.
- `CAGE_REST.json`:528 source vertices/1006 triangles по одной переданной на момент подготовки trace-версии (см. обязательную оговорку о boundary ниже);2px геометрический AA guard (texture/маски не менялись), верх pelvis/два cuffs rigid thigh constraints, внутренние vertices свободны. `CAGE_TARGETS.json`:241 равномерное target состояние до полного drop230. Эти inputs записаны до solve.
- `CAGE_SOLVE.json`: восемь положительных состояний low0…7/240 и точная остановка на **low8/240=0,0333333333**, то есть root drop **7,6666666667px** из требуемых230. Сохранённый полный target не означает достигнутый full after.
- `CAGE_FAILURE.png/.svg/.json` показывает source / последний positive / первый negative harmonic initial iterate, owners/соседние constraints/coords. Это техническая диагностика, не анимационная сборка. `IMPLEMENTATION_AUDIT.json` — сверка rest/индексов/градиентов.

**Чего нет:** rendered exact after с полноценным hip low, shoulder swing на двух фонах и immutable animation build/URL. Короткие первые8 cage states, исходную статическую сборку Asset или скелет нельзя выдавать за требуемый результат. Полные личные MOTION_REVIEW Concept/Asset пока не запрашиваются по отсутствующему after. Исходный raw SOURCE_POSE_FAIL не переименован.

## Реализация и найденная интерфейсная ошибка

Один закон solve сохранён в `CAGE_SOLVER_CONTRACT.md`/`solve-cage.py`: constrained ARAP source-area rest energy; fixed pelvis/cuff targets, harmonic extension boundary increment как positive initial iterate, затем общий local/global solve с orientation-preserving line search. При отрицательном initial iterate закон требует STOP, а не произвольную проекцию или уменьшение target.

Первая попытка целиком сохранена в `attempt01/`: исходные rest/targets/solve/failure/coverage, код и лог. Её ratio на triangle975 был−0,010043714432022847. Аудит выявил одну явную ошибку интерфейса: far-cuff endpoint source index11=(653,831) после2px AA miter оказался дальше3,5px heuristic threshold и ошибочно был свободным. Owner теперь читается по исходному semantic trace **до** AA guard. Это восстановление согласованной принадлежности всего cuff, не новый произвольный anchor.

После исправления: **vertices/triangles побайтово по значениям прежние**, число constraints24→25, index11 теперь farThigh. Других constraints/геометрии/закона/target/drop не менял. Повторный прогон той же модели снова остановился low8 на triangle975, ratio **−0,010021185304673878**. Первые отрицательные данные не затёрты.

Проверка rest: max|F−I|=1,71e−14; global rest solve возвращает source с max error4,80e−11px; min rest ratio≈1. Gradients/energy против finite difference согласуются до4,39e−8 на проверенных witness vertices. Ошибки ориентации source faces/индексации target/переноса v02 не обнаружено. Найденную owner-ошибку исправил в том же способе по разрешению Lead; её исправление не устранило STOP.

## Точный текущий witness

Triangle **975**, indices **[167,18,435]**, все три **free**, rest signed area **6,33458452780241px²**. Source:

| Vertex | Source x,y | Failed harmonic target x,y |
|---|---|---|
| 167 | (508,59459028757226;856,8789434195958) | (513,3710900738756;861,1296368322414) |
| 18 | (501,34003776039197;847,2837606296614) | (507,9161777640842;850,6522081300689) |
| 435 | (498,7700851934281;842,1382559886476) | (505,3976254199021;845,8380166203434) |

Failed target signed area **-0.06348004538123134px²**; последний positive area того же triangle **0.23475306979940705px²**.

Первый negative — harmonic extension нового boundary при low8, **до** ARAP-итераций данного sample. Последний сохранённый positive low7/240=0,0291666667 (drop6,7083333333px), min ratio **0,0370589529224964**, boundary error0. Координаты этого positive triangle и всех failed vertices сохранены в `CAGE_FAILURE.json`; последняя positive форма уже очень сплющена.

Ближайшие constraints: index19 nearThigh/source(496,1914;859,2972), index431 nearThigh(478,8560;855,6200), index20 nearThigh(461,5205;851,9428), index16 farThigh(528,2436;886,3603). Их точные targets/расстояния и ещё четыре соседа находятся в JSON. Сам witness не pinned; это свободная узкая область у перехода к crotch/near cuff, а не отрицательный determinant одного rigid thigh.

Внутри source triangle находятся6 pixel centers:2 nonzero-alpha, из них1 dense (499,5;843,5), alpha251; второй(500,5;845,5), alpha68. Поэтому witness не полностью пустой AA-маргинальный треугольник. Однако это всё ещё **сбой positive initial iterate данного численного продолжения**, не доказательство невозможности иного положительного solution при тех же граничных условиях. Такой solution не искался и новый solver не открывался.

## Coverage и пределы материала

Внутри expanded source cage покрыты все dense pixels hip texture. Из55039 nonzero source cells239 очень слабых AA cells (max alpha3, dense0) лежат вне2px guard; пример(411,608)alpha2. Они явно записаны в `CAGE_COVERAGE.json`, не переназначались на ближайший треугольник и не выдавались за точное полное RGBA coverage. Это отдельная граница source trace/AA, не причина отрицательной площади или разрешение менять mask молча.

## Следующее решение

Текущий фиксированный solver остановлен. До нового предметного решения Lead/CTO не меняю topology/anchors/метод/low, не достраиваю hip repair или полный комплект ради обхода STOP. Согласованный минимальный художественный after не завершён; нет общего PASS, full motion/QA/release/Q2A закрыты. Source/старые snapshots/R0/frozen guide/чужие материалы не менялись; stage/commit — Lead.

Финальные hashes rest/targets/code/source/material trace/всех переданных материалов — `INPUT_HASHES.json`. Linkage rest/targets к solve, geometry к rest и материалы к SHA256 Asset manifest совпали. **Текущий Asset trace к rest не совпал**: объяснение ниже; это не скрыто как успешная сверка.

## Обязательная оговорка: версия boundary обновлена Asset после подготовки rest

При финальной сверке текущий `SHORTS_TRACE.json` отличается от зафиксированного input: прежний boundary теперь сохранён Asset как `handTraceEnvelope`, а новый `boundary` уточнён по фактическому material contour. Все waistband/cuff/side/crotch semantic paths остались прежними. Мой rest использовал переданный первоначальный boundary с2px AA guard, а не поздний уточнённый boundary. Поэтому этот численный FAIL относится **только к данной зафиксированной hand-envelope cage**, а полноценный тест нового actual-contour rest не выполнен. Нельзя выдавать его за отрицательный результат поздней actual-boundary версии.

`SOURCE_TRACE_USED.json` сохраняет точные embedded rest **значения**, но исходные сериализованные bytes восстановить с записанным input SHA256 не удалось: `usedEmbeddedValuesReproducedExactOriginalBytes=false`. Восстановленная сериализация не выдаётся за побайтовый original. Исходный trace SHA256 был записан подготовителем отдельно от чтения значений, поэтому при конкурентном обновлении он не доказывает их принадлежность одной версии; это дополнительная слабость прежнего input capture. Сам `CAGE_REST.json` с embedded координатами/индексами имеет проверенный solve-input hash и однозначно фиксирует фактически рассчитанную геометрию. `SOURCE_TRACE_CURRENT_AT_AUDIT.json` сохраняет новую переданную версию, `TRACE_VERSION_AUDIT.json` — сравнение/изменённые поля. Старый исходник не заменён новым задним числом. На момент этой проверки topology/anchors/закон дальше не менялись, solver на новом boundary не запускался. Lead затем разрешил исправление подтверждённого input/interface mismatch после согласования стабильной версии с Asset; до её согласования корректного повторения нет. Необходимость такого следующего шага передаю Lead/CTO вместе с конкретным компонентным FAIL; текущий пакет не объявляет его сделанным.
