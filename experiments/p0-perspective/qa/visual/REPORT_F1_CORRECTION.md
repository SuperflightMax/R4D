# P0 perspective — повторный Visual QA F1 plate-only correction

**Финальный вердикт серии:** `READY_FOR_RESEARCH_RECIPE_AND_PRERELEASE`.

Единственный blocker из отчёта `91b11a2090dd1ce00c9603c9d88fa73d42ed0f4c` устранён. F1 теперь PASS; ранее принятые F2–F4 остались побайтно неизменны. Publication этим вердиктом не открывается.

## Точная область повторной проверки

- frozen rubric: `21150e583311e8688146a27fa48aaa8c41c8aaa8`;
- исходный series candidate: `4cdd9e6b1da397ae1549ab4085af0f830555fd42`;
- исходный QA series report: `91b11a2090dd1ce00c9603c9d88fa73d42ed0f4c`;
- Asset F1 correction exact source: `62387b6fda2190f0377a59bcbc3435923365ffac`;
- исправленный Builder candidate: `9c1050596751deee3e736fe2d4f968a37c91af97`;
- corrected F1 composite SHA-256: `6c9e6c221ebf17cc6f9549b8b43f29cea1f04416beffbe185f9252b17d084e4e`;
- corrected F1 prepared plate SHA-256: `221a351ed7acebdec03cad4395ac0e04690e6b1c186de59778e1bff8f8efe10a`.

Проверялись только F1 blocker, provenance и отсутствие shared/gallery regressions. Frozen rubric и критерии не менялись.

## Provenance и точность correction — PASS

Asset correction интегрирована в Builder-ветку commit `9411516…`; содержимое Asset final-series path без diff совпадает с exact source `62387b6…`. Записана ровно одна разрешённая invocation v3: edit target — сохранённая F1 plate v2, точный prompt и tool output ID сохранены, второго reroll не было.

Старая QA-failed plate сохранена отдельным evidence-файлом с прежними bytes. Новая plate имеет новый зафиксированный hash. F1 master `868237ec…`, shadow `3c0d7d5c…`, anchor `(523,1145)`, layout hash, `p/q`, scales и painter order не менялись.

Diff с исходным series candidate не затрагивает frozen manifest/layouts. F2–F4 output directories и `gallery.html` имеют zero diff. Их composite SHA-256 остались:

- F2 `873e58c160e7ecfd0831002b6c5c3cd273693518fe39ea38d2953643c05ed52b`;
- F3 `114c16ed5c412191e27175b6a498e109f56f02b9ac302c8b80fc0b237ff836c6`;
- F4 `4db1465934ad1e7fb3f831d81b06c7995d02ec38c72ed58b9555e77be8916225`.

Полный независимый `npm run check` снова завершился PASS: четыре exact PNG reproductions, contracts/freeze/cross-series/gallery воспроизводимы; рабочее дерево Builder осталось чистым, remote указывает на exact corrected candidate.

## Исходный F1 lighting blocker — RESOLVED

**Было.** Сильная запечённая диагональная тень пересекала frozen anchor `p=.62, q=.453`, а direct-lit drum оставался ярким и читался отдельным слоем.

**Стало.** Corrected plate удаляет сильную диагональную тень со всей игровой плоскости и восстанавливает спокойный прямо освещённый limestone floor. Все четыре frozen anchors теперь находятся в одном совместимом световом состоянии. `board-01-drum-mid-far` больше не лежит на тёмном пятне; яркость master согласована с окружающим floor. Компактная отдельная shadow снова выполняет только контактную роль и не спорит с baked окружением.

**Вердикт.** Прежний существенный разрыв света в полном кадре не воспроизводится. F1 layered composite больше не выглядит ярким sprite поверх затенённого plate.

## Сохранность F1 — PASS

- **Камера и поле:** квадратный кадр, far/near seams, боковые направляющие, central axis и formal quad визуально сохранены; crop/warp отсутствуют.
- **Архитектура:** astrolabe landmark, открытые башни, лестницы, side frame и foreground niches сохраняют прежние силуэты и иерархию.
- **Layout/geometry:** exact rows `q=.338/.453/.567/.681`, scales `.939/.978/1.018/1.058`, one-master identity и stable order не изменены.
- **Grounding:** основания и compact contact shadows читаются без прямоугольных patches, halo или floating.
- **Art cohesion:** blue/brass/limestone система, резкость, отделка и прямой верхний левый свет остаются единым законченным миром. Удаление тени не создало гладкого прямоугольного патча; floor texture и slab seams продолжаются по полю.
- **Leakage:** markers, grid, labels, axis, UI, шарик, colliders и технический overlay не появились.

## Финальный статус серии

- F1: PASS после exact plate-only correction.
- F2: PASS, exact bytes сохранены.
- F3: PASS, exact bytes сохранены.
- F4: PASS, exact bytes сохранены.
- Comparable gallery: PASS, exact bytes сохранены.
- Series: `READY_FOR_RESEARCH_RECIPE_AND_PRERELEASE`.

Граница решения: QA подтверждает frozen four-board candidate и готовность к подготовке исследовательского рецепта/предрелизного комплекта. Это не приёмка Макса, не разрешение публикации, не старт P1 и не право менять accepted inputs без новой проверки.
