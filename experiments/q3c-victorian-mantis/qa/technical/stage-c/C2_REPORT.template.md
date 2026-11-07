# C2_FULL_RIG_TRANSFORM · Technical QA

Статус `PENDING_CANDIDATE`. Результат продукта `NOT_RUN`.

| Связь | Значение |
| --- | --- |
| TQA / turn | `technical-qa-r4d-q3c-01` / ___ |
| Stage C start / exact Builder candidate от CTO | `21fbafcfb435838bc84aed931fe68e57cae9fdbc` / ___ |
| Asset/rig/concept pins | ___ |
| Input blobs/SHA256, served build manifest SHA256 | ___ / ___ |
| Версии среды, preview, viewport/режим, seed и input transcript | ___ |
| Ссылки на npm ci/test/build, raw runs и measurements | ___ |
| Повторное совпадение inputs/build после прогона | ___ |

| Gate | Статус | Наблюдение и ссылка на evidence |
| --- | --- | --- |
| C2-00 Pin | NOT_RUN | |
| C2-01 Build/live | NOT_RUN | |
| C2-02 Direct action | NOT_RUN | |
| C2-03 K0–K5 | NOT_RUN | |
| C2-04 Identity/continuity | NOT_RUN | |
| C2-05 Pivots/lengths | NOT_RUN | |
| C2-06 Floor/aperture | NOT_RUN | |
| C2-07 Viewport/a11y | NOT_RUN | |
| C2-08 Replay | NOT_RUN | |
| C2-09 Timing | NOT_RUN | |
| C2-10 Async idles | NOT_RUN | |

- Ключи K0–K5, реальные tick и локальные механические признаки. Для каждого ключа связать предшествующий и следующий кадр с live видео.
- Inventory, parent/instance IDs, максимумы pivot gap, length error, floor penetration, sole gap, planted drift. Отдельно указать ход каретки, проверку проёмов и глубины.
- Timing по локальным каналам. Указать единицы, разрешение, численные пороги, measured onset/peak/delay/overlap/shape/overshoot/settled tick и соответствующий живой кадр.
- Idle каждой формы. Указать наблюдаемые семейства, окна без активности, диапазоны и лучшую корреляцию после сдвига. Зафиксировать время обычного просмотра.
- Replay. Указать независимые теги, seed и тот же viewport, первый расходящийся tick при наличии. Записать проверенное seeded свойство на альтернативном seed.
- Дефекты одним списком. ID, SHA, seed, режим/viewport, реальные действия и tick, ожидаемое/фактическое, влияние, источник возможного сбоя, evidence.
- Открытые проверки, границы вывода и следующий кандидат при необходимости. Stage D относится к ходьбе, мотыльку и охоте.
- Решение в границе Technical QA, ссылка на отдельную визуальную проверку, состояние собственных процессов, точные пути будущего отчётного коммита и разрешение CTO на Git.
