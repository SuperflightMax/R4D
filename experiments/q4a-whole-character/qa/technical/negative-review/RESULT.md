# Technical QA — negative-review-v02

25 октября 2026. `technical-qa-r4d-q4a-01`.

**Вердикт: TECHNICAL_QA_PASS — только frozen evidence viewer v02.** Блокирующих или иных воспроизведённых дефектов в проверенном объёме не найдено. Это не art/motion/product PASS, не приёмка CTO и не разрешение release/Q2A.

## Точная версия

- Snapshot: `experiments/q4a-whole-character/build/negative-review-v02/`, route tree `review/r4d/q4a-whole-character/`.
- Проверенный URL: `http://127.0.0.1:4197/review/r4d/q4a-whole-character/`.
- Build manifest SHA256: `c403b92bd4da73c072e20dac6d6fcc5bdb29222d92c6e7524f7757c5865133c8`.
- Source manifest SHA256: `51737944bd88908185cae36c529049ce05935b9d06a5b08cf66298106db88e6c`.
- Research source/HEAD при входе: `62a3b8cfd9599cc5d71e6433784c3661c5527a5f`; cwd `D:\dev\R4D`. Candidate uncommitted, поэтому область вывода закреплена snapshot и hashes. v01 не проверялся.

## Integrity

Независимый read-only скрипт [check_integrity.py](check_integrity.py), результат [INTEGRITY_V02.json](INTEGRITY_V02.json): **404 проверки, failed=[]**.

Проверены все 36 файлов route: полнота build manifest (35 записей плюс сам manifest), размер/hash, source manifest и отсутствие циклического self hash. Все 36 HTTP-ответов совпали побайтно с snapshot. По 34 source entries сверены origin/output hashes; exact copies совпадают с origins, десять crops совпадают пиксельно с указанными прямоугольниками whole. Каталог из пяти источников и его projection сохраняют origin/hash/statusScope и исходные статусы/замечания.

Rest vertices/triangles/constraints совпали с CAGE_REST. Все поля всех 26 проецированных accepted outputs, включая все vertices, совпали с R2_RESULT; порядок строго low0..25. Отдельные rejected vertices/indices/metrics/meta/sourceTriangle совпали с R2_FAILURE; indices соответствуют triangle923. Новых output poses и интерполяции в массиве нет. Source commit верен; correction01 не имеет fake image.

Оговорка о provenance: `SOURCE_CATALOG.json` — новый каталог viewer, отсутствующий в research commit; его source images и reviews проверены отдельно. У R2_RESULT/R2_FAILURE, R1 RESULT и capture audit working-tree bytes имеют CRLF вместо committed LF. Содержимое совпадает после нормализации только переводов строк; candidate копирует именно hashed working-tree bytes. Это не изменение численных данных. Внутренний `evidence.json.version=negative-review-v01` сохранён вместе с неизменённым data package; версия проверенного viewer задана v02 manifests/HTML, подмены кандидата нет.

## Личный браузерный прогон

Отдельная временная вкладка Codex In-app Browser, без личного Chrome. Проверены desktop viewport **1440×1000** и mobile viewport **390×844**; это эмуляция размера, не физический телефон. Осмотрены реальные canvas и изображения в обеих темах, а не только DOM или отчёт Builder.

- Загрузка и повторное открытие целевого route: начальное low0, пауза, рабочие controls. Все пять sources переключаются с соответствующими PNG/подписями/статусами; whole, hip и shoulder доступны. Whole использует contain (mobile область337×520), сетка/подписи/controls не выходят за ширину страницы.
- Scrub клавиатурой Home/End/ArrowRight: low0, low1, low12, low25; метрики, drop и полный progress index/240 согласованы. На low25 показано23,9583/230px и25/240, а не полный присед.
- Play продвигает сохранённые состояния; достигает low25 и останавливается без зацикливания/rejected. Pause удерживает индекс; restart возвращает low0. Выбраны скорости1/2/4 состояния в секунду, проверено управление при playback; точные интервалы секундомером не измерялись.
- Mesh и texture выключаются/включаются; theme и source-select работают и во время play. Смена whole не подменяет R2 raw-v04 diagnostic data. На mobile выполнены restart/play/pause/scrub/source/theme/overlay действия.
- Rejected раскрывается отдельно: явное «не принято», путь к low26, обе λ, σmin0.29999830114264353<0.30, положительная area ratio и причина distortion, не inversion. Он не становится accepted output26.
- Раскрыты R1 и R2 численные сведения. Основной actual44 R1 low53 отделён от R2 и ранних ошибок; разные numerical gates не представлены рейтингом качества. Первый экран и вывод ясно сообщают отрицательный/частичный результат, отсутствие full-low/full-motion/joint art PASS и отсутствие доказательства невозможности Q4A вообще.
- Во время загрузки/переключений/раскрытия rejected в CDP: **Network.loadingFailed=0, HTTP≥400=0, Runtime.exceptionThrown=0**; console warning/error список пуст. Все наблюдавшиеся HTTP-запросы локальные, кроме встроенных data URLs; внешних зависимостей не наблюдалось. Все reports/assets дополнительно проверены через HTTP integrity scan.

В обеих проверенных ширинах горизонтального переполнения нет. Mobile controls и текст доступны одним потоком; accepted и rejected визуально разделены. Скриншоты лично просмотрены в сессии проверки; отдельный обязательный архив изображений не создавался.

## Непроверенное и завершение

Не проверялись физические touch-устройства, другие браузерные движки, публичная доставка/auth, release или полный character runtime. Не выполнялись solver/генерация/repair и художественная приёмка. Скорость playback проверена функционально, без заявления о точности таймера.

App/build/catalog/source/evidence не менялись, stage/commit не выполнялись. Записи только в своей negative-review зоне. Своя временная вкладка закрыта, viewport override сброшен; сервер Lead/Builder оставлен работать, чужие dirty/untracked сохранены. Дальнейшая координация и все дефекты — через Lead.
