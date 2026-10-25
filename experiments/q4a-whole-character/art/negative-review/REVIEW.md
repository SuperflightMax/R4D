# Negative review v02 — личная проверка Asset

25 октября 2026. `asset-artist-r4d-q4a-01`.

**ASSET_SOURCE_PROVENANCE_PRESENTATION_PASS** только для frozen **negative-review-v02**. Существенных несоответствий в своей области не обнаружил. Это PASS честности показа сохранённого отрицательного/частичного опыта, **не художественный/motion PASS персонажа**, не приёмка CTO и не разрешение release/Q2A.

## Exact просмотренная версия

- Snapshot: `experiments/q4a-whole-character/build/negative-review-v02/`.
- URL: `http://127.0.0.1:4197/review/r4d/q4a-whole-character/`.
- Source package commit: `62a3b8cfd9599cc5d71e6433784c3661c5527a5f`.
- Route build-manifest SHA256: `c403b92bd4da73c072e20dac6d6fcc5bdb29222d92c6e7524f7757c5865133c8`.
- Route source-manifest SHA256: `51737944bd88908185cae36c529049ce05935b9d06a5b08cf66298106db88e6c`.

Оба manifest hash лично сверены. V01 не проверял; он superseded. Проверка выполнена мной в отдельной фоновой вкладке встроенного IAB, без личного Chrome. Первый запрос создания вкладки завершился timeout без вкладки, затем viewer открыт успешно; это не ошибка приложения. Снимки Builder не подменяли личный просмотр.

## Что лично проверено

**Whole/source.** Переключил все пять сохранённых attempts v01/v02/raw-v03/correction02/v04. Лично посмотрел целые фигуры, shoulder/tank и hip/shorts. В gallery весь raw-v04 помещается внутри своего изображения, волосы/кисти/обувь не обрезаны; статичный whole отделён от локальной сетки. Raw-v04/correction02 на светлом и raw-v04 на тёмном показывают alpha корректно, без выдачи hidden RGB за нарисованный фон. Крупные shoulder/hip контексты позволяют читать перекрытие майки и исходную форму шорт.

Статусы выбранных источников соответствуют reviews: v01 не принят по исходной позе, v02 частично полезен без общей animation-приёмки, v03/correction02/v04 source pose FAIL. Разрешение CTO использовать v04 в отдельном viability test не выдано за source acceptance. Correction01 — отдельный OUTPUT_BLOCKED_NO_RAW без подставленного PNG. При раскрытии provenance v04 показаны точный origin/SHA256 и ссылка на сохранённый source review.

Пять PNG и пять corresponding review-файлов внутри snapshot численно совпали с frozen каталогом; пять исходных PNG в workspace также неизменны. Каталог SHA256 по-прежнему `5063b713e700026d113b4e710e34cbb1cab0c28617e4901b07327eb5a6d75001`. Результат — `evidence-v02/PROVENANCE_CHECK.json`; каталог не редактировался.

**Плечо/незавершённый repair.** Raw upper-arm на tank ниже естественного attachment не скрыт и назван source defect. Подписаны sole mismatch5/7px, точные строки/пороги доступны в provenance/review. Незавершённый узкий tank/axilla corridor за рукой явно назван незаполненным; отсутствие shoulder swing и художественной приёмки сборки раскрыто. Viewer не изображает этот hidden участок восстановленным и не выдаёт source crop за новый repair. Сам corridor в этом viewer описан текстом, не представлен новым реконструированным after — это соответствует отсутствию завершённой сборки.

**R1.** Раскрыл точные числа и историю. Основной результат — final actual44 harmonic STOP low53/240, target drop50,7917 из230, отрицательная initial iterate до ARAP sample. Ранние envelope/input-owner ошибки отдельно обозначены как история. R1/R2 stops не сравниваются как художественное качество; текст предупреждает о разных заранее заданных numerical gates.

**R2 accepted.** Начальная пауза подтверждена. Лично просмотрены low0, low25, scrub и дискретный play сохранённых states; play от начала дошёл до25 и остановился, не зациклился/не перешёл к rejected. Ползунок ограничен0..25, отдельно виден полный диапазон /240. Low25 подписан23,9583/230px; его достижение не выглядит полным low. Mesh и texture включаются отдельно; texture-only состояние на светлом и mesh на тёмном просмотрены. Деформируется только локальная текстура shorts, цельный персонаж явно остаётся статичным контекстом. Это просмотр evidence, не мой MOTION_REVIEW отсутствующего полного after.

**Rejected.** Раскрыл отдельный красный блок, просмотрел на светлом/тёмном. Candidate не включён в accepted play и прямо отмечен как отклонённый на пути к target low26, не достигнутый output26. Показаны λ0.152587890625 после accepted0.15234375, triangle923, σmin0.29999830114264353<0.30. Значение не округлено до прошедшего threshold; положительная area ratio0.39420865977255604 и причина distortion/SINGULAR_COMPRESSION отделены от inversion. Число1197 iterations/30 substeps и отсутствие полного low названы.

**Общий вывод.** До деталей читается «Полноценная анимация не получена»,26/241,23,96/230 и отсутствие художественной приёмки. Leg-chain feasibility отделена от недостигнутой ткани/цельной сборки. Общая математическая невозможность подхода не утверждается. Контекстно зависимых утверждений о том, что viewer лишь локально смотрят или acceptance/publication ещё предстоит, в видимой основной подаче не обнаружил; provenance «локальные файлы, без CDN» описывает ресурсы, а не жизненный статус доставки.

## Evidence и предел review

Моя зона `evidence-v02/`: `source-v04-dark.png`, `accepted25-light-texture.png`, `rejected-low26-light.png`, `rejected-low26-dark.png`, `visible-state.txt`, `final-dom.txt`, `PROVENANCE_CHECK.json`. Это новые диагностические screenshot/text reports только личной проверки, не новые материалы персонажа. В просмотренной вкладке console error/warn log пуст. Responsive/полная integrity-проверка остаются Technical/Visual QA; здесь не присваиваю их PASS.

App/build/source/catalog/frozen PNG/trace не менялись. Imagegen/repair/solve/новые позы/full motion не выполнялись. Координация через Lead; окончательная приёмка и отдельный release — CTO.
