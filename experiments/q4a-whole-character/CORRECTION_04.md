# EARLY_V02_04 — артикулируемые естественные панели одежды

25 октября 2026. Прямое решение CTO после `6958195`: прежнее boundary piecewise-affine mapping закрыто, его границы/параметры больше не менять. Новая гипотеза — минимальная garment-конструкция по естественным швам; у каждой панели один rigid либо positive-affine transform, без cell mesh.

## Сохранность и владение

Все source/repairs, art-наборы и builds/reviews/evidence01/02/03 неизменны. Чужие dirty/untracked вне Q4A не трогать. Новых чатов/subagents/worktree/инфраструктуры нет. Stage/commit/push — Lead после завершённого проверенного gate.

| Участник | Собственные пути цикла04 |
|---|---|
| Lead | `CORRECTION_04.md`, `TEAM.md`, `README.md` |
| Asset | `art/early-v02-04/`, `tools/art/prepare_early_04.py`, live `art/parts.json`; условный единственный local repair — только в новом подкаталоге `art/repairs/early-v02-04/` после доказанной необходимости |
| Builder | Текущие `app/`, build/serve скрипты, новые `builder/early-v02-04/`, `build/early-v02-04/`, технические проверки; не art и не прежние mapping/evidence |
| Concept | `concept/EARLY_V02_04_REVIEW.md` и свои evidence после готового stable after |
| Technical QA / Visual QA | Пока без полного кандидата |

## Сначала договор Asset + Builder

На сохранённой трассе согласовать до реализации минимальное число естественных панелей: waistband/seat, near leg flap, far leg flap. Crotch/gusset четвёртой панелью допустим только по реальному шву/скрытой поверхности, не как видимая заплатка. Совместно выбрать 3 или 4 панели и pivots; описать швы, принадлежность внешнего контура, hidden overlap и anchors в новых собственных документах. NearHem `(592,757)` и вся её дуга — near leg panel.

Neutral-композиция видимых масок воспроизводит всю непрозрачную ткань v02 в пределах масок: unassigned 0, duplicateVisibleOwner 0. Нельзя исключать неудобные пиксели. Hidden margins под поясом/швами только из сохранённых v02/repair surfaces, с раскрытым provenance; в neutral они не видны. Waist/seat следует pelvis/root, near/far flap — своему thigh.

## Garment-этап

Builder выбирает rigid либо один affine transform на панель. Determinant положителен (для affine — выше объявленного epsilon) во всех прежних 15 neutral↔deep-low samples и возврате. Нет per-cell deformation, больших cloth grids, barycentric extrapolation, vertical thresholds и подбора весов. Если positive affine по нескольким anchors невозможен — разделение только по реальному шву, без новых придуманных панелей.

Прежние limb lengths, drop 243.61 px и диапазон колен не уменьшать; прошедшее alpha-support решение стоп сохранить. Во всём переходе natural seam overlap не даёт дыр, двойного подола, отдельного лоскута и смены владельца внешнего контура. Neutral exact coverage, transform/determinant и визуальное поведение — разные проверки; положительная матрица не означает художественный PASS.

После подтверждённого garment PASS открывается **только body coverage**: пройма, donor skin под подолом, колено — сначала ownership/binding/hidden overlap на существующих пикселях. Прежнее условное разрешение на **один** local repair остаётся неиспользованным и действует лишь при доказанной отсутствующей скрытой поверхности: near `x440..590/y660..815`, far `x548..630/y665..813`, rear armhole `x410..550/y235..400`. Whole edit запрещён, видимые v02-пиксели не заменяются, одежда не увеличивается. Доказательство отсутствующей зоны передать Lead; before/prompt/условия/provenance сохраняются. До garment PASS покрытие/repair не начинать.

## Итоговый gate и остановка

Все панели positive determinant на всех samples, exact garment coverage 0/0, no visible seam artifact на обоих фонах во всём neutral↔low; сохранены drop/углы/длины/опора. Нет разомкнутой проймы, donor-вставки, коленного шипа и отдельного лоскута. На одном stable exact after — независимые личные PASS Concept и Asset.

Если естественные панели не удерживают цельность при том же low — заморозить FAIL с конкретным швом/недостающей поверхностью. Не добавлять панели вне реальных швов, не уменьшать low. Только после полного PASS Lead открывает полный комплект и motion. Пока walk/jump/full QA/candidate/release/Q2A закрыты.

Статус: договор 3/4 панелей и pivots ещё не выполнен; изготовление новой garment-конструкции не начато.

## Общий договор до изготовления

Asset и Builder явно согласовали **3 панели, без gusset** в [PANELS.md](art/early-v02-04/PANELS.md)/[PANELS.json](art/early-v02-04/PANELS.json) и [AGREEMENT.md](builder/early-v02-04/AGREEMENT.md). Действует одна схема **2 верхних root anchors + 1 hem anchor своего thigh** на каждый flap. Первоначальный вариант 1+2 рассмотрен, но не испытывался и не реализуется.

- `waistSeat`: rigid root, reference pelvis `(538,645)`, determinant 1.
- `nearFlap`: `(452,613)` и `(598,615)` следуют общему root; `(592,757)` — rigid near-thigh вокруг reference nearHip `(525,685)`.
- `farFlap`: `(598,615)` и `(625,626)` следуют root; `(634,758)` — rigid far-thigh вокруг reference farHip `(570,690)`.
- Каждый flap имеет **одну** affine-матрицу; determinant > `1e-4` на всех 15 прежних samples. Hip и контрольные точки не добавляются скрыто как четвёртые constraints.
- Порядок снизу вверх: `farFlap → nearFlap → waistSeat`. Существующие скрытые запасы около 12 px под поясом и до 8 px far-under-near — гипотеза, их достаточность не доказана. Две верхние точки держат хорду, не всю кривую кромку.

Lead разрешает изготовление **только garment-этапа** по этому договору. Exact source-neutral проверяется по фактической RGBA-композиции, а не лишь 0/0 владельцев (исходная alpha местами 253). Никакого нового поля весов/mesh, новых anchors по результатам отдельных поз и расширения одежды ради шва. До garment PASS body coverage/repair закрыты.
