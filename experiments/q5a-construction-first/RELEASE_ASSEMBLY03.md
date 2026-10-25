# Q5A ASSEMBLY03: блокировка публикации

25 октября 2026 года, Europe/Kyiv. Release Engineer `release-engineer-r4d-q5a-01`, по отдельному production release brief CTO `cto-r4d-01` (thread `01a1653d-1c24-7991-a16b-619bc964ca40`).

**BLOCKED_BY_VPS_ACCESS_PROHIBITION — not published.** Q5A принят CTO для PoC release; публикация остановлена после read-only проверки штатного процесса, до внешних изменений. Эта блокировка доставки не меняет приёмку продукта.

## Точная версия

| Назначение | Commit / версия |
|---|---|
| HEAD и локальный origin/main при проверке | `31ade6bb3109052c297e08013607ddd04eea866a` |
| Frozen production | `101343caa68579aacd5e6c01b94206680c364ab7` |
| Candidate | `Q5A-NELA-ASSEMBLY-03` |
| QA base | `0f032c21f555473aca7c61960a8c563d2440fc97` |
| CTO acceptance commit | `31ade6bb3109052c297e08013607ddd04eea866a` |

Приёмка: [CTO_ACCEPTANCE_ASSEMBLY03.md](CTO_ACCEPTANCE_ASSEMBLY03.md). Production, accepted dist, art, rig, motion и QA conclusions не изменялись. Production diff=none относительно acceptance commit.

## Процесс и препятствие

Из exact acceptance commit прочитаны предыдущие release reports [Q1](../../work/agents/release-engineer-r4d-q1-01.md), [Q5](../../work/agents/release-engineer-r4d-q5-01.md) и [Q6](../../work/agents/release-engineer-r4d-q6-01.md). В них штатный Review release состоит из создания нового неизменяемого серверного release-каталога с сохранением старых материалов, проверки manifest/хешей, атомарного переключения root существующего nginx Review snippet, проверки конфигурации и плавного перечитывания nginx.

Этот процесс требует записи на VPS и управления его nginx. Текущий brief прямо запрещает действия с VPS и предписывает остановиться, если штатная публикация невозможна без них. Другой разрешённый существующий механизм в прочитанных отчётах не установлен; обход, новый pipeline, сайт или инфраструктура не создавались.

## Доставка и проверки

Предполагаемый маршрут: `/review/r4d/q5a-construction-first/` в существующем Review на `superflight.space`. Это целевой адрес, а не подтверждённая опубликованная ссылка: URL этим выпуском не создан, его доступность не проверена. В предыдущих отчётах Review требует обычной авторизации SuperFlight; фактические условия доступа к Q5A не проверялись.

Сверка 26 dist-файлов с опубликованной версией, published integrity, загрузка ресурсов и delivery smoke не выполнялись: опубликованного этим выпуском кандидата нет. Desktop/mobile, controls, 1×/2× и jump при доставке не проверены. Новые QA PASS не заявляются; существующие выводы QA сохранены.

Внешняя среда не изменялась; VPS, UGH, Imagen, credentials и payments не использовались. Прежние Q1–Q6, их URL и версии не менялись. Чужие dirty/untracked и service caches не затрагивались. Новых попыток публикации после обнаружения блокировки не было.

## Следующее действие

CTO/Максу определить разрешённый существующий non-VPS delivery route либо отдельно изменить полномочия для штатного Review release. До такого решения публикацию не повторять. Откат выпуска не требуется: внешних изменений не было. Q4A/Q2A не начинались; переход по очереди остаётся закрыт, пока Q5A не доступен для просмотра.
