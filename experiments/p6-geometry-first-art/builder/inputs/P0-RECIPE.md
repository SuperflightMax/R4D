# P0 perspective: вывод по серии и воспроизводимый рецепт

Дата: **26 октября 2026 года**. Основание: исправленный Builder candidate
`9c1050596751deee3e736fe2d4f968a37c91af97` и независимый Visual QA
`0c3934908d9e795b631e9eaee89025e62541e2ce` с вердиктом
`READY_FOR_RESEARCH_RECIPE_AND_PRERELEASE`.

Это Researcher-вывод по P0. Он не меняет заказ, frozen rubric или formal
contract, не является приёмкой Макса, разрешением публикации или стартом P1.

## Вывод

В проверенной серии воспроизводится не «точно восстановленная камера», а один
формальный **2.5D-язык доски**:

- квадратный сопоставимый кадр;
- одна трапециевидная игровая плоскость с постоянными seams и направлением
  схождения;
- четыре одинаковых глубинных ряда;
- слабый единый рост одного и того же объекта по `S(z)`;
- согласованная видимая высота, основание и отдельная контактная тень;
- законченные, но независимо созданные архитектура, тема и семейство объектов
  каждой доски.

Четыре доски F1–F4 прошли независимый QA после точечной коррекции F1. Они
отличаются архитектурой, силуэтами, материалами и компонентами, а не являются
crop/recolor/reskin одной доски. Их формальная часть побайтно воспроизводится
из сохранённых plate/master/shadow и frozen layouts.

Главное ограничение способа: доступный single-shot генератор хорошо создаёт
законченный мир и отдельный художественный master, но в d1/c1 не удержал exact
ряды, идентичность повторов и слабую `S(z)`. Эти свойства в принятом кандидате
обеспечивает детерминированная layered-композиция, а не скрытая способность
генератора точно исполнять координатный контракт.

## Что именно зафиксировано формальной моделью

Числовой источник: Research
`627a9feb33cc6fdc8e63738ada13577752b9bf4a`,
`experiments/p0-perspective/research/perspective-model-v0.1.json`.

| Свойство | Зафиксированное значение |
| --- | --- |
| Кадр | `1536 × 1536`, `1:1`, без crop и независимого растяжения осей |
| Quad по часовой стрелке | `(0.225,.255) (.775,.255) (.915,.775) (.085,.775)` |
| Far / near seams | `q=.255 / .775`, `y=391.68 / 1190.40 px` |
| Модель плоскости | `q=.255+.520z`; half-width `=.275+.140z`; `p=.5+u·half-width` |
| Контрольные глубины | `z=.16/.38/.60/.82` |
| Base-center rows | `q=.338/.453/.567/.681`, `y=519.168/695.808/870.912/1046.016 px` |
| Масштаб | `S(z)=.91+.18z`; `.939/.978/1.018/1.058` |
| Base anchor | центр нижнего видимого опорного ребра под осью объекта |
| Повторы | один board-owned RGBA master, только равномерный X/Y scale |
| Высота master | видимая высота нормализуется к `120 px` при `S=1` |
| Порядок | `(q,p,instanceId)`, far-to-near; для экземпляра сначала shadow, затем master |

Эта таблица описывает композиционный эталон. Она не определяет фокусное
расстояние, мировые размеры, физическую высоту объектов или единственную
pinhole-камеру исходного рисунка. Painted seams plate проверены визуально в
рабочих допусках; exact q/scale повторов подтверждены manifest/numeric report.

## Layered contract: рабочая последовательность

1. **Заморозить до изображений.** Зафиксировать formal JSON/raster, brief,
   четыре layout с `p/q/scales`, component slots и hashes. Не подбирать layout
   после просмотра результата.
2. **Сделать каждую доску независимо.** Для неё отдельно создать finished
   environment/floor plate без контрольных объектов и их теней, один finished
   transparent RGBA master и отдельную board-owned shadow. Не передавать ей L1
   или другую F-доску как reference.
3. **Разделить роли двух общих изображений.** Formal raster задаёт только
   квадрат, quad/seams, ракурс и вид standing sample. `03-sun-temple.jpg`
   задаёт только художественный уровень, материал, фаски и свет. Второго
   геометрического control нет.
4. **Сохранять provenance.** До отбора записывать каждый prompt, фактический
   output/tool ID, raw hash и причину correction. Не делать незаписанный reroll.
5. **Подготовить компоненты детерминированно.** Plate равномерно full-frame
   привести к `1536²`; master сохранить с alpha, declared base anchor и
   прозрачным padding; shadow держать на том же canvas и anchor. Raw не менять.
6. **Собрать без генеративного redraw.** Видимую высоту master нормализовать к
   `120 px` при `S=1`, затем четыре раза отрисовать shadow/master в frozen
   `p/q` с frozen uniform scale. После сборки запрещены global inpaint,
   стилизация и «улучшение» всего кадра.
7. **Проверить сначала машинное, затем видимое.** Hashes, quad, rows, scales,
   anchor/destination identity, порядок, уникальность source sets и отсутствие
   overlays проверяются скриптами. После этого Visual QA смотрит seams,
   основания, цельность объёмов, свет, утечки markers и законченность мира.
8. **Исправлять только причину.** Если дефект принадлежит plate/master/shadow,
   править этот компонент узким edit и собирать заново с тем же layout. Старое
   состояние оставить evidence. Criteria/formal model под результат не менять.

## Независимость четырёх досок

Проверенный candidate использует четыре собственных plate, четыре master и
четыре shadow: **12 разных prepared SHA-256**, четыре уникальные тройки source
и 16 уникальных instance ID. L1 hashes запрещены cross-series checker и не
встречаются в F1–F4. Общими являются только formal data, frozen brief и
детерминированная сборочная логика.

| Board | Frozen `p` по четырём q-rows | Финальный composite SHA-256 |
| --- | --- | --- |
| F1 / board-01 | `.42/.62/.35/.58` | `6c9e6c221ebf17cc6f9549b8b43f29cea1f04416beffbe185f9252b17d084e4e` |
| F2 / board-02 | `.58/.38/.66/.44` | `873e58c160e7ecfd0831002b6c5c3cd273693518fe39ea38d2953643c05ed52b` |
| F3 / board-03 | `.33/.52/.69/.54` | `114c16ed5c412191e27175b6a498e109f56f02b9ac302c8b80fc0b237ff836c6` |
| F4 / board-04 | `.67/.47/.31/.60` | `4db1465934ad1e7fb3f831d81b06c7995d02ec38c72ed58b9555e77be8916225` |

F2–F4 остались побайтно неизменны после F1 lighting correction.

## Фактические prompts, входы и ограничения генерации

Полный журнал без пересказа raw-событий:

`62387b6fda2190f0377a59bcbc3435923365ffac:experiments/p0-perspective/asset-artist/final-series/RUN_RECORD.md`.

Общие входы первоначальных plate/master invocations:

1. `formal-reference-v1.png`, geometry/camera control only, SHA-256
   `08ebe1bd5dd7e3a60097a15c1e29e60c46c4bcf27e4babda730fcffa269f723f`;
2. read-only `03-sun-temple.jpg`, art-quality reference only, SHA-256
   `f5cfa2bbe8e4b49ecbc0f4c7a0cee99842b182b56ae495979153b8fc9ff86e32`.

Точное описание ролей входов:
`62387b6…:experiments/p0-perspective/asset-artist/final-series/SERIES_INPUTS.md`.
Фактически использованные prompts находятся без нормализации текста в
`62387b6…:experiments/p0-perspective/asset-artist/final-series/board-0N/prompts/`.

Факты и ограничения:

- инструмент — built-in `image_gen`; CLI/API fallback не использовался;
- plate: `transparent_background=false`; master: `true`;
- correction получает только непосредственно предшествующий plate той же
  доски как edit target (`num_last_images_to_include=1`);
- все tool outputs фактически `1254 × 1254`; plate равномерно full-frame
  resized до `1536 × 1536`, без crop/axis warp;
- интерфейс не раскрыл model, seed, sampler, steps, CFG, quality и числовой
  size preset; рецепт не выдумывает эти значения и не обещает повторить raw
  генерацию побайтно;
- выполнено 11 invocations, включая три сохранённых непригодных plate
  состояния; скрытых reroll/отбора не заявлено и в журнале не обнаружено.

## Что сработало и что не сработало

| Этап | Наблюдение | Вывод для рецепта |
| --- | --- | --- |
| d1 single-shot | Законченный арт, но field drift, неравномерные rows и примерно обычный сильный perspective scale вместо слабой `S(z)` | Текст + raster control не гарантируют числовую идентичность повторов |
| c1 усиленный prompt | Поле заметно приблизилось к control; rows/scale снова FAIL, появились похожие на markers детали | Ещё более жёсткий текст без смены передачи control — повтор без новой гипотезы |
| L1 layered | Exact rows/scales, один master, grounding и законченная доска получили PASS | Layered transfer работоспособен; L1 доказывает один diagnostic, но ещё не четыре независимые доски |
| F1 plate v1 | Центральная линия, ромбы/кольца и круги читались control markers | Узкий marker-removal edit v2 с сохранением камеры сработал; rejected raw сохранён |
| F3 plate v1 | Три furnace chutes вышли за far seam на игровую плоскость | Узкий edit до seam с восстановлением непрерывного пола сработал; rejected raw сохранён |
| F1 plate v2 | Baked diagonal shadow пересекла frozen anchor, bright master выглядел отдельным слоем; series QA был BLOCKED | Plate-only lighting edit v3 убрал сильную тень из всех anchor zones; layout/master/shadow не менялись, F2–F4 не затронуты |

Минимальный evidence этих трёх plate-дефектов сохранён по exact Asset commit:

- `board-01/raw/plate-v1-rejected-markers.png`;
- `board-03/raw/plate-v1-rejected-chutes.png`;
- `board-01/raw/plate-v2-qa-failure-baked-shadow.png`;
- исправленный F1: `board-01/raw/plate-v3-source.png`.

Все пути начинаются с
`62387b6…:experiments/p0-perspective/asset-artist/final-series/`.

## Как повторить и проверить exact candidate

1. Взять exact Builder commit
   `9c1050596751deee3e736fe2d4f968a37c91af97` на Windows host с Node.js,
   PowerShell 7 (`pwsh`) и доступным `System.Drawing`.
2. Перейти в `experiments/p0-perspective/builder`.
3. Запустить `npm run check`. Он проверяет Research/contract v2, L1, freeze,
   cross-series инварианты и четыре exact PNG reproduction.
4. Для явной пересборки выполнить `npm run build:final-series`, затем снова
   `npm run check:final-series` или полный `npm run check`.
5. Сверить четыре composite hashes с таблицей выше и фактическими файлами
   `final-series/output/board-0N/hashes.json`.
6. Открыть `final-series/output/gallery.html`; числовой PASS не заменяет
   просмотр четырёх досок и света в полном кадре.

Exact verification воспроизводит **сохранённый candidate из сохранённых
компонентов**. Повторный вызов `image_gen` не обязан дать те же raw pixels,
потому что seed/model/settings недоступны.

## Оставшиеся отклонения и границы вывода

- Это одна четырёхдосочная серия на одном художественном ориентире, а не
  доказательство универсальности для любых тем и генераторов.
- Painted quad/seams в plate оценены визуально в рабочих допусках. Near seam
  F2–F4 частично закрыт foreground-архитектурой; underlying camera не признана
  точной реконструкцией исходника.
- Композитные master местами чуть резче plate, а contact shadows компактнее
  крупных архитектурных теней. QA счёл это неблокирующим для серии.
- Согласование света остаётся компонентным риском: детерминированная сборка не
  умеет автоматически освещать master внутри baked shadow plate.
- Генератор доказал способность создать художественно пригодные plate/master
  и выполнить узкие edits, но не exact coordinate execution и не byte-level
  repeatability.
- Человек/агенты определили темы и prompts, разделили роли входов, выбрали
  base anchors, построили shadows, провели corrections и QA. Это не полностью
  автоматическая генерация одним вызовом; ручной ретуши Макса не было.
- Детерминированная часть доказана hashes/checkers и повторной сборкой. Она не
  является доказательством самостоятельной способности генератора соблюдать
  quad/rows/`S(z)` без этой обвязки.

## Карта точных источников

- Research model: `627a9feb33cc6fdc8e63738ada13577752b9bf4a`,
  `experiments/p0-perspective/research/`.
- Frozen Concept brief: `ae82913a18cf0beed2b67f1c421b30e1c1988e3b`,
  `experiments/p0-perspective/concept/FINAL_SERIES_FROZEN_BRIEF.md`.
- Builder freeze: `0260519c5e3ff74365556713042d576b7bbec66e`,
  `experiments/p0-perspective/builder/final-series/`.
- Asset final inputs and evidence: `62387b6fda2190f0377a59bcbc3435923365ffac`,
  `experiments/p0-perspective/asset-artist/final-series/`.
- Corrected candidate: `9c1050596751deee3e736fe2d4f968a37c91af97`,
  `experiments/p0-perspective/builder/final-series/output/`.
- Final independent QA: `0c3934908d9e795b631e9eaee89025e62541e2ce`,
  `experiments/p0-perspective/qa/visual/REPORT_F1_CORRECTION.md`.
- Исторические QA d1/c1/L1/series без копирования сырых логов находятся в том
  же QA commit: `REPORT_D1.md`, `REPORT_C1.md`, `REPORT_L1.md`,
  `REPORT_FINAL_SERIES.md`.
