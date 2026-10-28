# Визуальная проверка принятого P1 static candidate 01

28 октября 2026, Europe/Kyiv. Исполнитель `visual-qa-r4d-p2-free-01`, actual turn `01a182c2-cce2-7b90-bd78-b76bee5a4b44`. Итог: **соответствие всех 10 JPG, подписей и текста подтверждено в доступном объёме; PAGE_RENDER_NOT_OBSERVED**. Desktop/mobile layout, отсутствие page clipping/overflow и переходы по ссылкам в браузере не подтверждены. Полного visual/page PASS нет; это ограничение просмотра, не переоценка принятого P1.

## Точная версия и выполненный первый шаг

Handoff/source `383164ff397e83a5ad47238f6ebe196688f649ff`, build source `2135851427c568038b23fded38d6cbe8b6f6b0e3`. Единственный содержательный вход — accepted `4b47db04c7140ebf88f69b91faa0b790d46f22ec`, subtree `experiments/p1-collider-mapping/clean-repeat-01/`.

Frozen root: `E:\R4D\perspective\p2-runtime\output\p1-static-report-candidate-01`; публичная часть `public/review/r4d/p1-mapping-report/`. Независимо проверены все 12 файлов, 2 057 712 байт: файловое множество и SHA256 без расхождений. Public-relative tree digest по правилу `sha256 + space + decimal bytes + space + relative path + LF` совпал: `88e934cab5ce2621cc6ad811b7bc40bcfb5ccce74262a35068654552aeeb99f7`. BUILD_MANIFEST 4037 байт, SHA256 `00eb21e37f4a30e1dfbf7addad0eeafe1e66b266c553495ea30ae8d96255a14c`.

Первым фактическим шагом прочитаны handoff, provenance и текущее собственное дерево: `E:\R4D\perspective\p2-worktrees\visual-qa`, ветка `codex/r4d-p2-free-visual-qa-01`, входной HEAD `2e89cdf56aaa9ef49230c2b1b888cef0476b9d19`, clean. Правильные пути источников — `audit/CONTENT_PROVENANCE.md` и `report.css`. Ошибочные обращения к корневому CONTENT_PROVENANCE.md и style.css исправлены только в командах чтения; exit 1 второго чтения был отсутствующим style.css, не capacity или policy. Frozen-файлы не менялись.

## Конкретный отказ локального browser preview

Выполнена одна новая адресная попытка: tool `mcp__cua_repl.js`, call **`call_abc1dd4797314b4f99b8273827bb843b`**, действие `cua.createBrowserTab("iab", target, {visible:false})`.

Точный target: `file:///E:/R4D/perspective/p2-runtime/output/p1-static-report-candidate-01/public/review/r4d/p1-mapping-report/index.html`.

Автоматическая browser security policy отклонила запрос: **`The requested URL protocol is not allowed. Allowed protocols: "http:", "https:".`** Страница не была отрисована; фактического title, page screenshot или desktop/mobile viewport нет. Viewport override не устанавливался, reset не требовался. Эта операция остановлена без повторения, другого surface/actor, CDP, локального сервера, alternate renderer или переноса задачи. Старые отклонённые P2 launcher/file URL не выполнялись. Просмотр отдельных JPG через image viewer — оставшаяся разрешённая проверка фигур, не обход и не рендер HTML.

Перед пакетом измерены system-wide RAM 31.907 GiB / свободно 16.21 GiB, CPU sample 0%, C/D/E свободно 14.833/16.309/16.589 GiB. Замер включает текущую нагрузку P4/Millionko и остальных процессов; их продукты не читались. Для ограниченного preview/изображений планировались до 1 GiB дополнительной RAM и 50 MiB output на E, без build/нового сервиса. Индивидуальные будущие пики соседних проектов не измерялись. Каталог evidence был свободен и создан новым.

## Все десять соответствий

Каждый исходный JPG лично просмотрен в native resolution через `view_image`, отдельно от HTML. Для каждой строки проверены точный source path из provenance, Git blob accepted P1 против `git hash-object --no-filters` фактического JPG, HTML figure ID, alt/caption, href и img src. Совпали 10/10; width/height в HTML совпали с декодируемыми размерами. Это чтение уже сохранённых изображений, без extraction, перерисовки и новых симуляций.

| Figure ID | JPG | Лично проверенное соответствие |
| --- | --- | --- |
| fig-01-source | 01-perspective-whole.jpg | Jungle, trial01, seed1/tick0; весь исходник, верхняя архитектура и корзины сохранены, native config проецируется на рисунок. |
| fig-01-flat | 01-native-floor.jpg | Jungle, trial01, seed1/tick0; выбран выпрямленный пол и приёмники, верхняя архитектура вне кадра. |
| fig-02-source | 02-perspective-whole.jpg | Тёмный храм, trial01, seed1/tick0; whole-source, круги и собственные четырёхсегментные основания различимы. |
| fig-02-flat | 02-native-floor.jpg | Тёмный храм, trial01, seed1/tick0; inverse-floor framing, вытянутый арт не объявлен видом сверху. |
| fig-03-source | 03-perspective-whole.jpg | Солнечный храм, trial02, seed1/tick0; footer config d64678…, исправленные опоры ягуаров вместо прежних кругов. |
| fig-03-flat | 03-native-floor.jpg | Та же trial02, seed1/tick0; native floor и шестисегментные опоры, без верхней архитектуры в кадре. |
| fig-04-source | 04-perspective-whole.jpg | Водный храм, trial02, seed1/tick0, footer config 9048b28…; розовый старт слева от верхней лягушки. |
| fig-04-flat | 04-native-floor.jpg | Та же trial02 и исправленный старт; inverse floor, арки/вода/ступени в условной общей плоскости. |
| fig-method-source | 03-research-perspective.jpg | Research 03 candidate02, весь исходник; пурпурные опоры, голубые границы, зелёный старт/цели, жёлтые передние контакты. Это не Viewer/seed capture. |
| fig-method-inverse | 03-research-inverse-whole.jpg | Research 03 candidate02, inverse всего исходника; верхняя архитектура и приёмники сохранены, signed research flat до native shift. |

Восемь Viewer JPG имеют 1280×720; две Research-фигуры — 1536×1536 и 1091×1525. Смешения пары Research whole-source с Viewer native-floor в подписях нет. На странице разные цветовые легенды для этих двух групп обозначены в соответствующем контексте.

Для значимых версий прочитаны accepted `BOARD03_SUPPORT_REVISION.md` и `BOARD04_START_REVISION.md`: текст 03 о 14 кругах и 7×6 loops соответствует финальному источнику и видимым контурам; текст 04 `[712,280]` соответствует исправленной source-точке слева от жабы и выбранной trial02. Старые Research 04 candidate01 в десять фигур не вошли. Динамика и физическая пригодность старта заново не проверялись.

## Читаемость текста и границы утверждений

Текст последовательно описывает ручные отметки, отдельную оценку перспективы каждой доски, H с делением на w, общий native shift, config как источник геометрии, условные скрытые опоры и water collapse. Не обнаружено утверждения о доказанной универсальности, метрически восстановленной камере, настоящем 3D top-down или отдельной приёмке ball/shadow/движения/drops/buckets. Малый round-trip прямо отделён от метрической точности.

Архивный статус подписей и кнопок пояснён до восьми Viewer-фигур: это пиксели старых JPG, не работающие контролы страницы; старое «предварительная привязка» не подменяет поздний принятый статус. У всех 10 изображений href указывает на тот же полный JPG, что и img src; файлы существуют и декодируются. Фактическая браузерная навигация по этим ссылкам не выполнена.

По чтению CSS есть парная сетка desktop, одна колонка при max-width 760px, width:100%/height:auto изображений, contain у Research и отдельный overflow-x контейнер таблицы. Это предусмотренные правила, **не наблюдавшийся responsive результат**. Реальная читаемость мелких надписей внутри уменьшенных Viewer JPG, page overflow, clipping заголовка/фигур, focus/scroll и desktop/mobile viewport остаются непроверенными. Нативные JPG достаточно различимы для выполненного сопоставления; их открытие в полном размере предусмотрено текстом.

## Evidence и следующий разрешённый шаг

Собственные новые evidence: `E:\R4D\perspective\p2-runtime\output\visual-qa\p1-static-report-01\FIGURE_CHECKS.json` и `LOCAL_PREVIEW_LIMITATION.json`. В них сохранены per-figure refs/blobs/captions/full-size links, resource sample, точные call/target/reason и отсутствие viewport/screenshots. JPG не копировались и не изменялись, искусственные page screenshots не создавались.

После будущей разрешённой PUBLIC публикации нужен отдельный actual HTTP page view именно этих bytes: representative desktop/mobile layout, чтение подписей, отсутствие clipping/page overflow, открытие full JPG. Старый protected auth/template/rollback к этой PUBLIC схеме не применялся. Сейчас нет полного visual/page PASS; выполнена доступная независимая figure/caption/text часть. Server/shared writes, token operations, симуляция P1, seeds/physics QA, генерация и новый build не выполнялись; P2 frozen04/df309 не затронуты.
