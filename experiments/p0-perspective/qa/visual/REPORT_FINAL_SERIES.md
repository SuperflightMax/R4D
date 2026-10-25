# P0 perspective — независимый Visual QA серии F1–F4

**Вердикт серии:** `BLOCKED`.

Per-board: **F1 FAIL**, **F2 PASS**, **F3 PASS**, **F4 PASS**. Усреднённый PASS не применяется: обязательный дефект художественной интеграции F1 блокирует весь candidate. Publication остаётся закрыта.

## Точная область проверки

- frozen rubric: `21150e583311e8688146a27fa48aaa8c41c8aaa8`;
- Research: `627a9feb33cc6fdc8e63738ada13577752b9bf4a`;
- Concept frozen brief: `ae82913a18cf0beed2b67f1c421b30e1c1988e3b`;
- Builder freeze: `0260519c5e3ff74365556713042d576b7bbec66e`;
- Asset component sets: `557e4650ee22cb7387290f5baece37d1219484cb`;
- Builder candidate: `4cdd9e6b1da397ae1549ab4085af0f830555fd42`.

Composite hashes независимо совпали:

- F1 `2fee80e59e52f519a519d18ec340bec11e1f96b276a125ffbbbcd684946b19c4`;
- F2 `873e58c160e7ecfd0831002b6c5c3cd273693518fe39ea38d2953643c05ed52b`;
- F3 `114c16ed5c412191e27175b6a498e109f56f02b9ac302c8b80fc0b237ff836c6`;
- F4 `4db1465934ad1e7fb3f831d81b06c7995d02ec38c72ed58b9555e77be8916225`.

## Provenance, freeze и независимость — PASS

Concept, Asset и Research перенесены в Builder-ветку cherry-pick commit, но содержимое соответствующих путей без diff совпадает с названными exact sources. Builder freeze — прямой предок candidate. Интегрированная копия rubric без diff совпадает с frozen `21150e58…`.

Четыре plate, четыре master и четыре shadow имеют 12 разных SHA-256; L1 sources не переиспользованы. Layout hashes, `p`, `q`, `uniformScale`, instance IDs и source slots не менялись после freeze. Сохранены все десять фактических генераций, prompts, tool IDs, hashes и причины двух corrections; отвергнутые F1 marker plate и F3 chute plate присутствуют как evidence.

Полный независимый `npm run check` завершился PASS для v1, contract v2, L1, series freeze и final series. В частности подтверждены четыре byte-exact PNG reproduction, четыре независимых source sets, 16 уникальных IDs, stable order, отсутствие overlays и закрытые gates. Рабочее дерево Builder после проверки осталось чистым, remote указывает на exact candidate.

## Общие формальные инварианты — PASS F1–F4

Для каждой доски manifest/numeric report подтверждает один собственный master и shadow, exact base rows `q=.338/.453/.567/.681`, exact scales `.939/.978/1.018/1.058`, uniform X/Y transform, общий source normalization внутри доски, одинаковый destination rectangle master/shadow и порядок `shadow → master`.

Независимый визуальный overlay formal quad/rows показал:

- боковые границы всех четырёх plate идут по принятому направлению без излома;
- far seams близки к `q=.255`;
- все четыре base anchors точно совпадают с formal rows;
- у F2–F4 near seam частично/почти полностью закрыт крупной foreground-архитектурой, но видимые боковые направляющие продолжаются к formal near corners; отдельного ракурса или доказанного смещения underlying quad не видно.

Перекрытие near seam названо ограничением визуальной проверки, а не измеренным FAIL: frozen brief разрешает foreground локально закрывать границу, и имеющиеся линии не требуют подбирать доскам новую камеру.

## F1 — FAIL: разрыв освещения layered composite

**Что прошло.** Quad/rows/`S(z)` и one-master identity соблюдены. Astrolabe plate закончена, marker-free и заметно отличается от F2–F4. Основания видимы; alpha halo, прямоугольные patches, grid, UI, подписи, шарик и collider overlay отсутствуют.

**Наблюдение.** Plate содержит крупную сильную диагональную архитектурную тень, пересекающую правую среднюю часть поля. Экземпляр `board-01-drum-mid-far` в frozen anchor `p=.62, q=.453` стоит внутри этой затенённой области, но его корпус сохраняет тот же яркий прямой золотой свет, что экземпляры на освещённом полу. Собственная board shadow у drum компактна и не связывает его с большой тенью окружения. В полном кадре этот экземпляр читается как яркий слой поверх затемнённого plate.

**Дефект.** Plate/master/shadow не образуют единое освещение в одном характерном состоянии доски. Это нарушает обязательную художественную цельность layered result и frozen требование общего света; проблема не является предпочтением палитры или микроскопической разницей резкости.

**Гипотеза причины.** Независимый master рассчитан на прямой свет, а plate уже содержит baked cast shadow в frozen position. Детерминированная сборка корректно сохраняет пиксели, но не учитывает локальную световую окклюзию. Это объяснение, а не доказанный внутренний дефект генератора.

**Вердикт F1:** FAIL. Candidate блокируется этим дефектом.

## F2 — PASS

Garden plate удерживает общий ракурс; foreground portals перекрывают часть near seam, но не создают второй пол, а боковые границы согласованы с formal quad. Lotus family использует один master, слабый рост читается, основания стоят на рядах. Рассеянный тёплый свет master совместим с plate, компактные землистые тени дают достаточный контакт без швов. Marker leakage и технические слои не обнаружены. Доска художественно закончена и различима по архитектуре, растениям и резному материалу.

## F3 — PASS

После сохранённой correction furnace chutes не выступают на игровое поле. Видимые границы и продолжение side guides согласованы с formal quad; foreground pits закрывают near seam как передний слой. Furnace master идентичен во всех четырёх копиях, exact rows/scale соблюдены, основания и мягкие тени читаются. Янтарное внутреннее свечение не создаёт второго направления падающих теней. Blockout, markers и overlays отсутствуют; кузнечная тема и силуэты самостоятельны.

## F4 — PASS

Поле сухое и непрерывное, вода остаётся за его границами; shell foreground перекрывает near seam, но side guides согласованы с formal quad. Tidal family использует один master с exact rows/scale, видимые основания и прохладные контактные тени. Pearl/turquoise/coral art, fan-shell landmark и foreground образуют законченный самостоятельный мир. Leakage, halo, UI и техническая графика не обнаружены.

## Серия и сопоставимая галерея

Галерея показывает четыре одинаковых квадратных кадра в общей 2×2 сетке и одной колонке на узком viewport; подписи не меняют масштаб изображений. Все boards можно сравнивать без независимого crop/stretch. F1–F4 различаются архитектурой, силуэтом, материалами и content, а не только recolor. Существенные неудачные plate-попытки сохранены и не скрыты галереей.

**Вердикт серии:** BLOCKED только из-за обязательного FAIL F1; F2–F4 не требуют общей переделки.

## Единый пакет возврата

Нужна точечная коррекция F1 без изменения frozen layout, quad, rows, scales или master identity: убрать/перестроить baked diagonal shadow plate так, чтобы четыре frozen anchors находились в совместимом световом состоянии, либо применить заранее согласованный детерминированный способ локальной световой интеграции, не превращающий четыре копии в разные master и не выполняющий global redraw composite.

После нового exact candidate Visual QA перепроверит F1 и отсутствие регрессий shared invariants/gallery. F2–F4 сохраняют текущий PASS, но их exact bytes должны оставаться неизменными; автоматический перенос PASS на изменённые файлы не допускается.
