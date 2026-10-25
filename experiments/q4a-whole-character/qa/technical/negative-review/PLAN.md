# Negative-result viewer — план Technical QA

25 октября 2026. `technical-qa-r4d-q4a-01`.
База ознакомления: `62a3b8cfd9599cc5d71e6433784c3661c5527a5f`, cwd `D:\dev\R4D`.
Основания: [решение CTO](../../../CTO_STOP_DECISION.md), [закрытие исследования](../../../CLOSURE.md), [требования к viewer](../../../EVIDENCE_VIEWER.md), общая роль и проектное дополнение Technical QA.

**ПЛАН ГОТОВ; ПРОВЕРКИ НЕ НАЧАТЫ.** Вход для проверки — отдельное поручение Lead с exact frozen snapshot/версией, локальным URL целевого route, source/build manifests и самопроверкой Builder. Текущий HEAD не считать версией ещё не выданного viewer.

## Предмет

Проверить, что viewer достоверно показывает сохранённые evidence отрицательного/частичного результата, а управление и просмотр работают. Full-motion/product QA, новый solve, арт, repair, release и Q2A закрыты. Прежний `qa/technical/PLAN.md` остаётся историческим планом, его motion-сценарии этим поручением не открываются. Технический PASS viewer не означает animation/art/motion PASS.

## Проверки exact candidate

| Область | Действия и критерий |
|---|---|
| Snapshot и manifests | Зафиксировать snapshot, версию, URL и среду. Пересчитать hashes всех файлов build manifest; проверить полноту дерева candidate, отсутствие циклического self hash. По source manifest сверить origin paths/hashes с frozen источниками. Exact sources должны совпадать побайтно; для crops/derived JSON проверить указанное преобразование и соответствие сохранённым данным, без запуска solver. Не считать manifest доказательством самого себя. |
| Whole/source | Проверить source-select для v01/v02/raw-v03/v03-correction02/raw-v04: правильные изображение, подпись и сохранённый статус. Correction01 без изображения показан текстовым фактом. Доступны whole целиком и hip/shoulder контекст. Source FAIL raw-v04, незавершённый shoulder corridor и отсутствие swing review не скрыты. |
| Accepted R2 | Сверить все 26 наборов vertices и их порядок с exact saved outputs low0..25 из241. Нет output26, интерполяции, новых поз или rejected/transient geometry в accepted массиве. Default paused; index/240 и target drop честны: low25 — 23.9583px из230, а не полный low. Рендер показывает локальную texture/mesh, не выдаёт её за движение всего whole. |
| Rejected witness | Отдельный просмотр и явная маркировка «отклонён, не принят»; exact saved candidate vertices и triangle923 соответствуют evidence. Это путь к low26, λ0.152587890625 после accepted λ0.15234375. σmin0.29999830114264353<0.30 не округлён до ложного прохождения порога; area ratio положителен. Distortion stop не назван inversion. Возврат к accepted не подмешивает witness в play. |
| R1 и итог | Основной R1 — actual44 harmonic stop low53/240, drop50.79px, отрицательный initial iterate до ARAP sample. Ранние исправленные envelope-input ошибки отделены от final-input результата. Разные gates R1/R2 не представлены рейтингом качества. На первом экране понятны negative/partial, отсутствие full low230/runtime idle-low-walk-jump и joint art PASS; нет заявления математической невозможности Q4A/cage вообще. |
| Controls | Реальными элементами: scrub к началу/середине/концу, play/pause/restart, смена source, mesh/diagnostic overlay, light/dark. Индекс, подпись, texture и canvas согласованы; play идёт только по сохранённым accepted outputs, pause останавливает, restart возвращает к low0. Проверить смену выбора/overlay во время play и объяснимые disabled состояния. Range управляется клавиатурой, если это native range. Конкретное поведение конца play сверить с заявленным, не придумывать обязательный режим зацикливания. |
| Route и ресурсы | Открыть и перезагрузить локальный `/review/r4d/q4a-whole-character/`, включая завершающий slash. Все обязательные assets разрешаются в этом route, нет missing resources, ошибок загрузки/исполнения и обязательных CDN/login/external dependencies. Проверить network/console во время загрузки и использования всех режимов; внешнюю публикацию не проверять и не выполнять. |
| Desktop/mobile | В доступном встроенном либо изолированном браузере проверить desktop и узкий mobile viewport: whole помещается, controls/подписи доступны, блоки не перекрываются, scrub/source/overlay/theme работают. Записать размеры и честно указать эмуляцию, если это не физическое устройство. Проверить обе темы; художественную приёмку не подменять технической. |

## Отчёт и границы исполнения

Результат — короткий отчёт в этой папке: exact версия, выполненное/непроверенное, integrity и controls/resources/responsive, дефекты с воспроизведением и влиянием. Скриншоты/логи сохранять только когда помогают объяснить наблюдение. Все дефекты и вопросы передавать Lead; после новой frozen версии повторять затронутые проверки. Изменение candidate отделяет результаты версий.

Пишу только в `qa/technical/negative-review/`; app/build/source/evidence и прежний PLAN не меняю, stage/commit не выполняю. Личный Chrome Макса не использую; новые чаты/агенты/worktree/clone/credentials/deploy не создаю. Свои временные процессы и ненужные файлы убираю, чужие материалы сохраняю. До exact frozen candidate тесты, браузерный прогон и инфраструктура не запускаются.
