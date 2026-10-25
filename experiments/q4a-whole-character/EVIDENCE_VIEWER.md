# Q4A negative-result Review candidate

25 октября 2026. Разрешение — [прямое решение CTO](CTO_STOP_DECISION.md). Исследование Q4A закрыто отрицательным/частичным результатом; это **доставка сохранённых evidence**, не новый опыт или полная анимация. Сначала публикуется exact R2/stop package; после отдельного старта Lead — viewer.

## Пути и владение

- Целевой Review route: **`/review/r4d/q4a-whole-character/`**. Только локальный candidate, без deploy/изменения старых Review cards/URLs.
- Builder: `app/negative-review/`, `builder/negative-review/`, immutable snapshot `build/negative-review-v01/` с деревом целевого route/самостоятельными assets. Один exact candidate/manifest/URL для review и QA. Старые R1/R2/code/data не менять.
- Concept: `concept/negative-review/` — личная factual/presentation review одного candidate.
- Asset: `art/negative-review/` — source/provenance/presentation review, без новых art/repair.
- Technical QA: `qa/technical/negative-review/` — integrity/controls/resources/errors/responsive.
- Visual QA: `qa/visual/negative-review/` — desktop/mobile readability, source context и честность отрицательного вывода.
- Lead: этот brief/сводный итог, CLOSURE.md, README.md, TEAM.md, приемка/итерации/commit+push/передача CTO. Каждый пишет свою зону; координация через Lead.

## Содержание и поведение

Главный вывод виден сразу: **full-low/full-motion цель Q4A не достигнута; показаны сохранённые данные опыта, не готовая character animation**. Кратко различить достигнутую leg-chain feasibility и недостигнутую ткань/художественный after. Нет joint art PASS, полного idle/low/walk/jump runtime. Cage/Q4A вообще математически невозможными не объявлять.

### Whole/source контекст

Выбор реально сохранённых whole attempts: v01/v02, первый raw-v03, v03-correction02, raw-v04. Exact копии source bytes, без новых картинок. Неизвестный/непринятый source не маркировать accepted по догадке; статусы только из сохранённых reviews. Correction01 без изображения — отдельный текстовый факт, не fake placeholder/«исправленный» source.

Весь исходный персонаж доступен и целиком помещается в контекстный просмотр; отдельно hip/shorts и shoulder/tank крупно. Light/dark. Raw-v04 defects: near upper-arm на tank ниже крепления; dense sole rows1469/1464 при alpha≥128 и1468/1461 при≥250, source FAIL остаётся. Diagnostic overlay/выноски только по сохранённым данным, не новые masks/материал. Упомянуть незавершённый hidden shoulder corridor и отсутствие swing review.

### R1 и R2

R1: основной корректный actual44 harmonic stop low53/240, drop50.79px, отрицательный initial iterate до ARAP sample. Отдельно маленькая history-ссылка на два ранних envelope-input прогона/исправленные ошибки; они не основной final-input результат. Не сравнивать разные stops как соревнование качества: R1/R2 имели разные заранее заданные numerical gates.

R2: **ровно26 сохранённых accepted exact outputs low0..25** из241. Scrub/play только этого массива, default paused. UI явно показывает index/240 и достигнутый target drop, шкала не притворяется полным0..100% low. Exact output25 соответствует drop23.9583px из230. Никакой пересчитанной интерполяции/новых output poses/solve: проигрываются только сохранённые vertices. Mesh/diagnostic overlay, исходная hip texture. Деформация только локальной texture/mesh так и называется; не рисовать ею «готовое движение всего персонажа» поверх неподвижного whole.

**Rejected witness отдельно от accepted playback:** это candidate на пути к target low26, homotopy λ0.152587890625 после accepted λ0.15234375, не accepted output26 и не достигнутый полный low. Явный статус «ОТКЛОНЁН, не принят». Показывать exact saved candidate vertices/triangle923 и метрики: σmin0.29999830114264353<0.30 при положительной area ratio; это distortion stop, не inversion. Не округлять число до0.300 так, будто порог пройден. Transient/rejected states не попадают в список accepted/обычный play.

Полезная структура: слева/сверху сохранённый whole целиком; рядом diagnostic hip canvas с texture/mesh и controls; отдельный static shoulder crop/context; компактные tabs/sections Source/R1/R2/вывод. На mobile один поток. До деталей — человеческий вывод, затем метрики/provenance в раскрываемом блоке. Красивое оформление не скрывает отрицательный результат.

## Реализация и integrity

Только frozen bytes/evidence из опубликованного R2 stop package. Допустимы deterministic crops/overlays/screenshots и компактные derived JSON с явной ссылкой на exact source/hash; никакого imagegen/нового solve/арта/repair. Self-contained local assets, без обязательных CDN/логинов/внешних ресурсов. Не менять solver/input/evidence files. Source manifest фиксирует origin path/hash и преобразование; build manifest — все candidate файлы/hash, без циклического self hash.

Canvas должен различать исходный whole, source texture, accepted mesh и rejected witness; legend/labels не двусмысленны. Controls понятны, pause/play/scrub/restart/overlay/light-dark/source-select работают, disabled состояния объяснимы. Desktop/mobile, без обрезки персонажа/контролов, клавиатура/native range по возможности. Никакого фонового autoplay, выдаваемого за полноценный idle.

## Проверка и передача

Builder передаёт exact snapshot/версию/локальный URL с целевым route, summary/source/build manifests и собственную проверку. Concept+Asset **лично смотрят тот же candidate** и фиксируют точность/отсутствие misleading presentation. Затем Technical/Visual QA проверяют **только evidence candidate**, не product motion. При дефекте — конкретная коррекция viewer/новая exact версия, без изменения frozen numerical/art data. Старые snapshots/evidence не перезаписывать.

После PASS presentation+QA Lead commit/push и передача CTO exact candidate/commit/ограничений. Acceptance и отдельный release — CTO, самостоятельно не публиковать. Q2A закрыт. Чужой dirty/untracked baseline не трогать. Release Engineer не запрашивается этим поручением.

Статус: brief сохранён, производство viewer до R2 stop package commit и отдельного старта Lead не начато.
