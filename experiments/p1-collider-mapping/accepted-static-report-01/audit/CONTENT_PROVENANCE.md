# Текст ↔ источники ↔ изображения

Единственный содержательный ref: `4b47db04c7140ebf88f69b91faa0b790d46f22ec`.
Все указанные ниже пути относительны к его subtree
`experiments/p1-collider-mapping/clean-repeat-01/`.
Точная побайтовая provenance иллюстраций и selected inputs — `PROVENANCE.json`.

| Блок страницы | Основание в принятом subtree | Иллюстрации / границы |
|---|---|---|
| Статус P1 | Актуальное прямое поручение Макса и AGENTS: принят маппинг/перспектива, прежде всего препятствия | Старые слова provisional/no acceptance в файлах и внутри снимков описывали момент их создания; не подменяют позднее решение Макса. Страница не расширяет приёмку на шарик, тень, движение, drops/buckets. |
| Recipe 1–2 | `research/BOARD01_CHECKPOINT.md`, `BOARD02_CHECKPOINT.md`, `BOARD03_CHECKPOINT.md`, `BOARD04_CHECKPOINT.md`; selected projection JSON, перечисленные в provenance | Ручные отметки, camera fit по швам либо ширинам, сжатие по горизонтальным верхам; row-major H с делением на w. Не автоматическая 3D-реконструкция. |
| Recipe 3 | `simulation/boards/{01/trial-01,02/trial-01,03/trial-02,04/trial-02}/manifest.json` | В каждом `translation.rule` — единый сдвиг без масштаба, вращения, clipping и изменения порядка вершин. Canonical config/Research digests проверены при копировании. |
| Recipe 4 / цвета overlay | `viewer/README.md`, `viewer/src/scene.ts`, `viewer/scripts/prepare-inputs.mjs`, `viewer/scripts/board-inputs.mjs` | Конфигурация — источник геометрии, manifest — источник преобразования. Cyan pins, gold segments, green buckets, pink ball. Core не запускался. |
| Whole-source ≠ floor framing | `research/BOARD03_CHECKPOINT.md`, `viewer/README.md`, `viewer/evidence/plain-four-board/README.md` | `fig-method-source` и `fig-method-inverse` — candidate02 Research; в inverse весь исходник, signed research flat до native shift. Восемь остальных картинок — реальные сохранённые whole-source/floor captures selected native config. |
| Таблица препятствий | Counts выбранных четырёх Simulation manifests; их config canonical hash проверен | 01:25/0/0; 02:12/12/48; 03:14/7/42; 04:6/23/92 — circle footprints / loops / obstacle segments. Bounds, drops, buckets не включены. |
| Джунгли | `research/BOARD01_CHECKPOINT.md` | `fig-01-source`/`fig-01-flat`: Viewer trial01, seed1 tick0. Условные круглые нижние опоры; извилистая граница, корзины ниже пола. |
| Тёмный храм | `research/BOARD02_CHECKPOINT.md` | `fig-02-source`/`fig-02-flat`: trial01, seed1 tick0. 12 circles и 12 собственных quad loops; rear vertices оценены. |
| Солнечный храм | `research/BOARD03_SUPPORT_REVISION.md` | `fig-03-source`/`fig-03-flat`: trial02, seed1 tick0. Семь six-edge jaguar loops, 14 circles. Камера неизменна; лица upright discs не взяты целиком как коллайдеры. |
| Водный храм | `research/BOARD04_CHECKPOINT.md`, `BOARD04_START_REVISION.md` | `fig-04-source`/`fig-04-flat`: trial02, seed1 tick0; новый source start `[712,280]`. Только старт изменён; 29 obstacles и H прежние. Восемь арок дают 16 независимых ног. |
| Ограничения | Все четыре checkpoints, support/start revisions, `coordination/STATE.md`, `viewer/evidence/plain-four-board/README.md` | Скрытые опоры условны; round-trip не доказывает метрическую камеру; inverse raised art не top-down; water collapse; drops/buckets не отдельная приёмка. Результат ограничен четырьмя ручными привязками. |

## Проверка версии 04 до выбора иллюстраций

В exact accepted subtree существуют старые Research figures
`research/evidence/board04-source-candidate.jpg` и
`board04-inverse-whole-source.jpg`, созданные до start candidate02.
Они **не экспортированы** в отчёт. Наличие рисунка препятствий не делает его
иллюстрацией исправленного старта.

Финальные `viewer/evidence/plain-four-board/04-desktop-source-whole.jpg` и
`04-desktop-flat-floor.jpg` существуют, README явно закрепляет 04 trial02,
на снимках видны trial02/config9048b28af292… и старт слева от верхней лягушки.
Обе выбраны без изменения байтов. Следовательно, обязательной отсутствующей
финальной иллюстрации не обнаружено, нового рисунка/симуляции не требуется.

## Выполненная ограниченная самопроверка

Автор визуально просмотрел все десять исходных изображений как локальные JPG.
Проверены их board/trial, seed1/tick0 у восьми Viewer captures, разные framing,
видимые исправленные jaguar loops и старт 04. HTML/CSS пока не отрисованы в
браузере в этой сессии; отзывчивость и соответствие страницы требуют целевой
TQA/VQA. Этот документ не заявляет независимый PASS или художественную приёмку.
Нет новой физики, random search, reannotation, новых досок или пересчёта traces.

Публичный allowlist: только `site/index.html`, `site/report.css`, десять JPG.
Audit, скрипты, configs, manifests, traces и полный исходный subtree в браузер
не передаются. Страница не зависит от внешней сети или обязательных библиотек.
