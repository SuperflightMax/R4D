# R1 — один закон cage solve до прогонов

25 октября 2026. Builder. Реализация `solve-cage.py` сохранена до появления rest cage/target прогонов. Source geometry v04 и достижимость low проверены отдельно; эти сведения не являются результатом cage.

Выбран **один constrained ARAP rest-shape solve** локального actual-contour cage. Сохраняем `CAGE_REST.json`: source vertices/triangles, положительные rest areas, owner ограниченных границ и реальные source trace/provenance. Верхняя boundary следует pelvis, две cuffs — соответствующим rigid thigh transforms, внутренние/прочие контурные vertices остаются свободными в одном rest-shape solve. Никаких дополнительных кадрозависимых anchors. Source topology фиксируется до `CAGE_TARGETS.json` и первого запуска; R0/source geometry не меняются.

Энергия: сумма source-area-weighted squared Frobenius расстояний deformation gradient до ближайшего 2D rotation (ARAP). Local step получает rotation каждого элемента polar decomposition; global step решает один постоянный Dirichlet stiffness system для внутренних degrees of freedom. Геометрия rest и верх/cuffs constraints неизменны по всему диапазону, меняются лишь target poses из общего full-chain закона.

Продолжение по равномерному low parameter: harmonic extension малого изменения boundary даёт initial iterate; затем максимум120 local/global iterations. Line search до30 halvings принимает только энергию без роста и positive area ratio >1e−4. Это единый численный закон для каждого состояния, не ручное исправление отдельных кадров. Если boundary continuation не даёт положительного initial iterate, сохраняется конкретный SOLVER_FAIL_STOP с кадром/элементом/area: это не доказательство общей математической невозможности, не повод уменьшать диапазон или перебрать другую топологию/anchors молча.

Проверяются все orientation ratios, singular values, max condition, boundary errors и число/stall итераций. Почти collapse/избыточное растяжение и неубедительный glute/thigh объём не становятся PASS из-за малого положительного determinant. Численный результат называется только NUMERIC_ORIENTATION_ONLY_NOT_ART_PASS до личных exact-after reviews художников.

Дополнительно проверяется alpha ownership/coverage mesh на исходной texture и наличие скрытых continuations: pixels вне actual source contour не переназначаются экстраполяцией «на ближайший треугольник». Если trace не покрывает реальный материал, фиксируется факт интерфейса до solve. Генеративные hip repairs/новые visible surfaces не назначаются Builder.

Source geometry/rest shape/targets/код и hashes сохраняются вместе с exact after при достижении этого этапа; при FAIL — точный компонентный факт с материалами. Это не другой способ, не v02 mesh и не урезанный low.
