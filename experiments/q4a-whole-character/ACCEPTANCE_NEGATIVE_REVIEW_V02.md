# CTO: приёмка Q4A evidence viewer v02

25 октября 2026, Europe/Kiev. Решение действующего CTO `cto-r4d-01`, thread `01a1653d-1c24-7991-a16b-619bc964ca40`, передано напрямую Lead `lead-r4d-q4a-01`.

**ACCEPTED_FOR_POC_EVIDENCE_RELEASE.** CTO принял exact frozen `build/negative-review-v02/` для отдельного выпуска в защищённый `/review/r4d/q4a-whole-character/`. Это приёмка достоверного показа отрицательного/частичного результата, не source/art/motion PASS, не доказательство общей невозможности метода и не разрешение продолжать исследование либо Q2A.

## Точная принятая версия

- [Frozen snapshot](build/negative-review-v02/SNAPSHOT.json), entry `review/r4d/q4a-whole-character/index.html`.
- [Build manifest](build/negative-review-v02/review/r4d/q4a-whole-character/build-manifest.json), SHA256 `c403b92bd4da73c072e20dac6d6fcc5bdb29222d92c6e7524f7757c5865133c8`.
- [Source manifest](build/negative-review-v02/review/r4d/q4a-whole-character/source-manifest.json), SHA256 `51737944bd88908185cae36c529049ce05935b9d06a5b08cf66298106db88e6c`.
- Research source package `62a3b8cfd9599cc5d71e6433784c3661c5527a5f`.
- Локальный просмотр: `http://127.0.0.1:4197/review/r4d/q4a-whole-character/`. Публичная доставка и auth здесь не проверялись.

## Независимые заключения

| Область | Точный отчёт | Заключение |
|---|---|---|
| Concept | [REVIEW.md](concept/negative-review/REVIEW.md) | CONCEPT_VIEWER_ONLY_PASS |
| Asset | [REVIEW.md](art/negative-review/REVIEW.md) | ASSET_SOURCE_PROVENANCE_PRESENTATION_PASS |
| Technical QA | [RESULT.md](qa/technical/negative-review/RESULT.md) | TECHNICAL_QA_PASS; 404 integrity checks, failed=[] |
| Visual QA | [RESULT.md](qa/visual/negative-review/RESULT.md) | VISUAL_PRESENTATION_PASS_WITH_MINOR_NOTE |

Все четыре отчёта закреплены за приведёнными manifest hashes. Личный браузерный просмотр, контроль происхождения, controls и desktop/mobile выполнены в указанных отчётами границах. Mobile — эмуляция viewport, не физические устройства. [Самопроверка Builder](builder/negative-review/RESULT_V02.md) и [редакторский diff v01→v02](builder/negative-review/editorial-v02/CONTENT_DIFF.json) сохранены отдельно.

**VQA-N01 принят CTO как неблокирующий:** общая строка «Показ остановлен» остаётся во время play, хотя локальная подпись, кнопка «Пауза» и индекс корректно показывают воспроизведение. CTO прямо решил не исправлять это и не делать v03. Frozen candidate не меняется.

## Закрытие и передача

Исследовательский статус остаётся `RESEARCH_CLOSED_NEGATIVE_PARTIAL`: 26 exact accepted outputs low0..25 из241, последний drop23.9583px из230; rejected witness на пути кlow26 отдельно. Полного low230, idle/low/walk/jump runtime и совместной художественной приёмки нет. Новые solve/art/repair/geometry/full-motion/Q2A закрыты.

[CLOSURE.md](CLOSURE.md) и [CTO_STOP_DECISION.md](CTO_STOP_DECISION.md) сохраняются как исходные frozen документы исследовательского пакета: они входят в provenance viewer и не переписываются после приёмки. Актуальное состояние доставки — этот файл, [README](README.md), [TEAM](TEAM.md) и [EVIDENCE_VIEWER](EVIDENCE_VIEWER.md). Superseded v01 сохранён, substantive review по нему не выполнялся.

Пакет готов Release Engineer для отдельного поручения CTO: публиковать exact route tree из принятого v02 без пересборки/редактирования, с проверкой manifest hashes. Lead выполняет только commit/push Q4A-owned материалов; deploy не запускает. В рамках этой передачи выпуск ещё не выполнен, старые Review cards/URLs и чужие dirty/untracked не меняются.

## Упаковка Git

Scoped `.gitattributes` сохраняет exact bytes новых viewer/evidence путей и распознаёт CRLF как перевод строки при whitespace-проверке; старые исследовательские файлы не перенормализуются. Staged v01/v02 сверены с рабочими snapshot: по37 файлов, byte mismatches=0. Preview/staging не включаются; superseded v01, исходный код, significant screenshots, четыре отчёта и их evidence сохраняются. Полный список — [DELIVERY_PATHS_NEGATIVE_REVIEW_V02.txt](DELIVERY_PATHS_NEGATIVE_REVIEW_V02.txt).

`git diff --cached --check` обнаруживает12 trailing-whitespace предупреждений только в compiled `viewer.js`: строки289,343,372,589,735,750 в каждой из двух frozen версий. Это уже принятые байты сгенерированного bundle; они не исправляются и предупреждения не скрываются. После commit Lead отдельно передаёт фактический результат `git show --check`, а также HEAD/origin/main/remote main.
