# R2 — audit auxiliary execution capture

Первичный auxiliary wrapper наблюдался как `ACTUAL_EXECUTION.json=null`. Причина — отдельная PowerShell-команда capture использовала bare `true` вместо `$true`; создание record завершилось ошибкой, последующая сериализация записала null. Это **не solver exception**.

До получения указания CTO сохранить raw null Builder уже заменил этот файл восстановленной metadata-записью. Это ошибка сохранности wrapper. Исходные bytes/hash не были зафиксированы; **оригинальный SHA256 неизвестен**, восстановление или предположение о newline/BOM за оригинал не выдаются. Текущая запись сохранена отдельно как `ACTUAL_EXECUTION_RECOVERED_METADATA.json` с проверенным hash в audit JSON. Оригинальную null-запись задним числом «точной» не объявляем; файл дальше не переписываем.

Сохранившееся точное tool evidence: один `exec_command` запуска actual, chunk88418c, running session3530; completion через `write_stdin(3530)`, chunkcf4edf, exit1. Отдельный OS PID не успели захватить: solver завершился за12.563с; PID не выдумывается. Вспомогательная capture-команда — chunkb5f90e — не запускала solver.

Авторитетные numerical artifacts — sentinel, result, failure, journal и post-run hash check — не менялись; actualRuns1, implementationException=null, published hashes unchanged. Повторного actual или synthetic после actual не было. См. `EXECUTION_CAPTURE_AUDIT.json` для exact identifiers и границ наблюдаемого.

Хронология по tool chunks: запуск88418c → failed wrapper/null b5f90e → completion cf4edf → metadata recovery650fbf → добавление exit/elapsed978743 → получение CTO no-rewrite instruction → отдельный audit. Обе записи object произошли **до** этого запрета; после него ACTUAL_EXECUTION не менялся. Нынешнее поле `processId=null` не означает whole-file null: оно честно фиксирует незахваченный OS PID. Exact observedAtUtc recovery и текущий byte-hash есть в audit JSON; они не выдаются за время первоначальной null-записи.
