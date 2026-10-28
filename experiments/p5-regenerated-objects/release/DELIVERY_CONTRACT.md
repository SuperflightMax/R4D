# P5: контракт передачи для выпуска

Подготовлено 29 октября 2026, Europe/Kyiv. Это локальная подготовка Release Engineer, не публикация, QA PASS или приёмка результата. Серверные записи сейчас запрещены; release gate закрыт.

## Основание и точные источники

- Рабочая карточка Lead: `5ae51fa0342689cb0ad4b5b5d5681ddc16b60e81:experiments/p5-regenerated-objects/coordination/STAGE2.md`, Git blob `e35de47c690c5821a0106a9ae4cbf75dbf61fb41`.
- Заказ: R4D `64061757802dc60770ab156ef5672af741d65d03`, `orders/perspective/ORDER.md` (редакция 4), `orders/perspective/P5-regenerated-objects.md`; основание последовательного продолжения — `work/requests/PERSPECTIVE_POST_P1_UPDATE.md`, пункт 3 и заключительные абзацы.
- Профессиональные инструкции: Staff `e9dfa0e32226e3f72de1f75e5c77a43d5ebfd9b3`; Playbook `c32f3ee79ca73c1bf87e8ee6a9c0844252568f3e`, blob `d3066526699a9a21fb8e8e5806958fbd105c8cf2`.

## Что передают Builder и Lead

Передача — одна ссылка на frozen candidate с перечисленными ниже данными в существующем manifest/записи состояния; отдельный отчётный конвейер не нужен.

1. Exact consumer commit и путь; asset-manifest commit/path/SHA256/bytes; для каждого публикуемого файла относительный путь, SHA256 и bytes. Передаётся готовый public root, отделённый от private staging. Сборка из случайного HEAD или незаявленных локальных правок не допускается.
2. Pins config/геометрии, projection, неизменённого native source/tree, зависимостей и lockfile; команда воспроизведения, версии инструментов и необходимый runtime. Общие source/native/P1 pins остаются в разделе «Общие входы» и пункте 5 контракта Lead выше; здесь они не переопределяются. Требуется связь этих pins с actual build bytes.
3. Package privacy listing: что именно входит в public root, compiled native runtime и licenses; ссылки на отдельно хранимые raw/provenance/evidence. Artist отвечает за provenance и выбранные final assets, Builder — за consumer/schema/build, Lead — за связность frozen handoff.
4. Обычные seed/tick/replay cases, known defects и честные unverified; exact ссылки на независимые TQA и VQA с идентификатором того же candidate и hashes проверенных bytes. Изменившиеся bytes требуют указания дельты и адресной перепроверки затронутых свойств. Закрытие ограниченной попытки не равно technical/artistic PASS.

## Privacy и изоляция

- Public package содержит только явно перечисленные допустимые final assets/runtime/data и licenses. Raw private Millionko TS, source maps/sourcesContent, source dumps, credentials, keys, cookies и mixed runbook/config не публикуются. Raw imagegen outputs, refs и полный provenance хранятся отдельно в private staging; включение отдельных материалов в public package требует явного решения по их допустимости, а не копирования родительского каталога.
- Чужие методы, реализации, арт, findings и Review P2–P4/P6 не читаются как refs. Существующая shared publication wrapper остаётся opaque; её source не является материалом P5. Existing alias — `vps1-direct`, существующий PUBLIC target — `/review/r4d/p5-regenerated-objects/`; нового доступа, сервиса или процесса выпуска не создаётся.
- В этом проходе SSH, HTTP и серверные metadata не нужны и не собирались. Расширять разрешённый список operational reads нельзя. Исторический denied composite и GET `/review/r4d/403` не повторять; `file://` не использовать как обход. Новая denial прекращает exact action/target и same-target обходы с фиксацией primary reason; ordinary failure классифицируется по исходному тексту.

## Будущий exact review, проверки и rollback

После frozen handoff и обеих независимых QA нужен новый exact CTO review и single-use token: candidate/hash, конкретный target/action, разрешённые изменения catalog/docs, условия и способ rollback. До этого server writes = 0. Token на один candidate не разрешает доставку других bytes или изменение nginx/security/credentials/access.

Достаточны точечные проверки доставки: соответствие принятому file inventory/hash; отсутствие запрещённых raw/maps/private файлов; доступность exact target и его существенных ресурсов через HTTP с правильными типами; открытие собранного Pixi/native и одного сохранённого replay. Полные физические и художественные матрицы QA повторяются только при конкретном риске доставки. Локальные assertions и HTTP 200 не заменяют actual browser runtime или VQA; непроведённое остаётся unverified.

Перед разрешённой мутацией фиксируется относящийся к token baseline: предыдущее состояние целевого root (либо его отсутствие), catalog и только затронутые docs. Shared opaque baseline и соседние продукты сохраняются. Раздаётся только перечисленный public root; raw/private staging не становится web root. Live seal сейчас не выполняется.

Rollback заранее согласуется в token: вернуть именно прежний target root и разрешённые собственные catalog/docs изменения либо убрать только собственную новую публикацию, если target отсутствовал. Восстанавливать общий vhost, менять security или останавливать чужие процессы нельзя. Append-only CHANGELOG не переписывается: исправление/откат отмечается новой записью. Неизвестное отклонение само по себе не запускает автоматический rollback; сообщаются версия, target, наблюдение и первичная причина.

## Выполнено и что закрыто

Прочитана exact карточка Lead и основание продолжения; собственные branch/HEAD/clean status проверены. Создан только этот контракт. Ни frozen product, ни независимые QA этих bytes пока не получены. Серверных чтений/записей, сборки, установки, симуляции, product QA и продуктовой публикации в этом проходе не было. Следующая передача Release Engineer — готовый frozen handoff с обеими QA и отдельным exact CTO решением; ожидание арта не является текущей работой.
