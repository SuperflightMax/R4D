# P3 Masks — локальная подготовка выпуска

28 октября 2026, Europe/Kyiv.
Владелец: `release-engineer-r4d-p3-masks-01`, Release Engineer.
Worktree: `E:\R4D\perspective\p3-worktrees\release-engineer`.
Ветка: `codex/r4d-p3-masks-release-engineer-01`.

## PAUSED_SAFE — checkpoint паузы Max

Прямая временная пауза Max через Dot/CTO: `2026-10-28T00:46:00Z`
(02:46 Europe/Kyiv). Заказ сохранён; продолжение только после новой явной
команды Max. Старый stage 2, поздние inputs/checkpoints и свободный token
не разрешают возобновление. Оба слота paused/reserved.

До checkpoint HEAD `3210845628c1258c8c1e2b9e34883be4708aa7a8`, своя ветка,
дерево чистое; незавершённого WIP и выполняющейся atomic release нет.
Свои долгоживущие процессы, серверы и браузерные вкладки не запускались;
останавливать нечего. Immutable/raw assets не менялись. `server_write=false`.
По сообщению CTO P2 limited release completed/token released; новых
server writes, reload или rollback не выполнять.

Exact resume point: после новой явной команды Max сверить этот checkpoint
и своё Git-дерево, затем получить названный frozen bundle/manifest hash,
две QA тех же bytes и Lead/CTO gate из таблицы ниже. До отдельного P3 token
серверная запись запрещена; актуальный live baseline проверяется перед
будущей разрешённой записью. Сейчас новых работ/проверок не начинать;
после сохранения checkpoint остановиться без активного ожидания.

## Поручение и состояние

Получен stage 2/2 от Lead `lead-r4d-p3-masks-01` по старту CTO
`cto-r4d-perspective-01`. Разрешена локальная подготовка доставки;
`server_write=false`. Release token не выдан; первое серверное окно у P2.
Frozen candidate, build manifest и обе QA пока не переданы.
Публикация, серверный аудит и проверка текущего live root не выполнялись.

Заказ: `orders/perspective/ORDER.md` и `P3-masks.md` на exact R4D
`64061757802dc60770ab156ef5672af741d65d03`. Обязательства не изменяются.
Задание Lead прочитано из
`a56cc0cd41565527fb99efb35bb885426f98eca2:experiments/p3-masks/lead/STATE.md`.
В той записи выдача заданий ещё ожидалась; последующее адресное поручение
stage 2/2 подтверждает старт этого участка.

До подготовки: HEAD `64061757802dc60770ab156ef5672af741d65d03`, нужная ветка,
`git status --porcelain=v1` и staged list пусты. Продуктовых файлов,
сборок, масок, изображений и серверных записей этот проход не создаёт.

## Найденный штатный пример и предел его применимости

Прочитан только как пример доставки исторический release record:
`64061757802dc60770ab156ef5672af741d65d03:work/agents/release-engineer-r4d-q6-01.md`.
Продукт Q6, его сборка, исходники и ассеты не переносились.

Запись документирует immutable releases под `/srv/superflight-review/releases/`,
manifest вне browser tree, сохранение прежнего Review, замену только `root`
существующего Review-snippet, `nginx -t` и graceful reload. Исторический
адрес просмотра — `https://superflight.space/review/`.
Это не подтверждение текущей серверной конфигурации, доступа или live root.
Старые roots, hashes и backup paths не используются как текущий rollback.

В release records есть указатели на локальный `work/REVIEW_HANDOFF.md`,
четыре серверных документа, service doc и CHANGELOG. В своём worktree файл
`work/REVIEW_HANDOFF.md` отсутствует (`Test-Path` вернул `False`).

### Уточнение CTO: доступ и документы установлены

Последующим адресным уточнением Lead передал решённые CTO access pointers;
повторный вопрос Max не требуется. Existing SSH alias — `vps1-direct`.
Read-only SSH чтение документов фактически прошло с `BatchMode=yes` и
`StrictHostKeyChecking=yes`; старые Windows control scripts не запускались.
Следующим уточнением Lead передал подтверждённые ДотМакса общие pointers:
immutable roots `/srv/superflight-review/releases/<release-id>` и защищённый
маршрут `/review/r4d/<slug>/`; P3 slug — `p3-masks` из заказа. Это исторические
указатели: актуальный live root/manifest сверяется read-only перед записью.

Прочитаны относящиеся к Review сведения runbook, указатели README и полностью
обязательные INDEX/PROCEDURES. SHA256 самих документов сняты read-only
`2026-10-28T00:08:49Z` (02:08:49 Europe/Kyiv):

| Документ | SHA256 |
| --- | --- |
| `/home/sf/assistant-context/vps/services/superflight-studio.md` | `e793dddd6db66fad7b0548358b2da47d0869a6c20cfa5ea40dbb4149a169e77f` |
| `/opt/superflight-studio/README_RU.txt` | `7b4e78bcd3bda70daa7ed4203d28b8be367c51cb596c9f54db8ac366ed9f1cf9` |
| `/home/sf/assistant-context/vps/INDEX.md` | `e925b847f4cf1bb747a68817f7a2755a58c39efccee724ce967649bd65f62064` |
| `/home/sf/assistant-context/vps/PROCEDURES.md` | `34fb7d9ac43a8b234a86bb6272b23a329afda28b9a1adf4dbf1fda3a56728bc9` |

Процедуры требуют свежую проверку live перед изменением, минимальное
изменение, проверку runtime/пользовательского пути и обновление service doc
и `/home/sf/assistant-context/vps/CHANGELOG.md`. Описанный для Review процесс —
immutable release, атомарная замена только root в
`/etc/nginx/snippets/review.locations.conf`, `nginx -t` и graceful reload.
Общий `/test/<slug>/` contour из PROCEDURES не является целью этого выпуска.

Ни historical roots в runbook, ни успешное SSH чтение не подтверждают будущую
live цель P3. Текущий root/snippet/manifest не читались; config/keys/credentials/
allowlist/session DB файлы не открывались. P2 products и QA findings не читались.
Серверных файлов, docs или service state этот проход не менял.

## Точные входы для следующего прохода

| От кого | Что передать |
| --- | --- |
| Builder через Lead | Candidate ID, полный frozen source commit, абсолютный путь готового самостоятельного static bundle и его точная граница. Не branch HEAD и не команда пересборки. |
| Builder | Exact manifest bytes и SHA256 manifest: для каждого публикуемого относительного пути размер в bytes и SHA256; полный перечень файлов без пропусков. Если передаётся архив — также его точный путь и SHA256. |
| Builder | Entry point и base route `/review/r4d/p3-masks/`, route-relative ресурсы, build provenance и версии native core/PixiJS, включённые лицензии. Указание, где находится compiled runtime; private TS, source maps и локальные paths в browser tree не входят. |
| Technical QA | Exact report commit/path; проверенные candidate ID и manifest SHA256, фактические проверки и ограничения. В том числе route-relative static loading и runtime dependencies. |
| Visual QA | Exact report commit/path для тех же candidate ID и manifest SHA256; просмотренные движение/кадры и честные художественные ограничения. План проверки не заменяет выполненную QA. |
| Lead/CTO | Принятая disposition именно этого candidate с обеими QA и ограничениями; текст существующей карточки/её минимального дополнения и размещаемых ограничений. Частичное закрытие опыта отдельно от художественного PASS. |
| CTO | После exact candidate/двух QA — подтвердить сериализованное окно и актуальный baseline в release intent. Доступ `vps1-direct` и doc pointers уже переданы. Перед любыми server/webroot/nginx writes — отдельный single release token с точным bundle hash, baseline и пределами операции. |

Builder передаёт готовые проверенные bytes. Release не пересобирает и не
меняет продукт ради smoke. Изменение bytes после QA означает другой candidate
и возврат владельцу для решения о затронутых проверках.

Уточнение CTO по delivery: JavaScript MIME для `.mjs` в действующем Review
не подтверждён. Browser-facing ES modules должны быть `.js` с корректными
`src`/`import` references уже до freeze; Node-only `.mjs` не переименовываются.
В будущем release smoke проверить Content-Type JavaScript и exact body bytes
для всех поставленных browser `.js`, а также фактическую загрузку module graph.
Auth redirect/login HTML не подтверждают MIME модуля: без разрешённого
authenticated просмотра соответствующая проверка остаётся неподтверждённой.
Глобальные `mime.types`/nginx ради этого не менять; продукт на сервере ради
smoke не править. Дефект bundle возвращается Builder через Lead до нового freeze.

## Минимальный маршрут после получения входов

1. Сверить candidate manifest SHA256 и каждый path/size/SHA256 готового bundle;
   проверить совпадение версии обеих QA и принятого решения. Проверить состав
   browser tree и лицензии по manifest/allowlist, не публиковать source maps,
   private sources, credentials, raw logs или зависимости целиком.
2. Подготовить release intent для CTO: candidate/source commit, exact manifest
   hash, bundle hash при наличии архива, target route, ссылки на обе QA,
   ограничения и предполагаемый объём изменения каталога. Не заполнять
   отсутствующие значения догадками. Manifest не включает собственный hash;
   hash его точных bytes хранится в intent/записи выпуска.
3. Через установленный `vps1-direct` получить read-only текущий root,
   baseline manifest/хеши и подтвердить существующий механизм root switch,
   auth и отката. Baseline должен учитывать завершившееся окно P2.
   Кандидат и две QA пока отсутствуют, поэтому этот шаг сейчас не выполняется.
4. Из разрешённого baseline локально подготовить полное новое immutable Review
   tree: прежние материалы сохраняются побайтно, добавляются только P3 route
   и согласованное минимальное изменение существующего каталога. Набор
   старых файлов/карточек нельзя брать из исторического Q6 snapshot.
   Финальный release manifest фиксирует весь новый browser tree и точный
   baseline, изменения каталога перечисляются отдельно. Копирование текущего
   дерева не означает разрешение читать чужие продуктовые реализации.
5. Выполнить соразмерный локальный delivery smoke точных release bytes:
   entry point, ресурсы, навигация из каталога и назад, отсутствие ошибок
   загрузки; предметную QA без конкретной причины не повторять. Локальные
   browser/server процессы сейчас не запускаются.
6. Передать CTO конкретный intent, manifest hash, baseline и rollback plan.
   До single release token не делать upload/staging, общие webroot/nginx
   записи, root switch, `nginx -t` на сервере или reload. Если baseline
   изменился после подготовки, остановить этот выпуск и обновить intent;
   прежний token не распространяется на новые bytes или другой baseline.
7. Только в разрешённом CTO окне и по подтверждённому service doc: сверить
   baseline ещё раз, сохранить свежий rollback, доставить exact frozen bytes,
   проверить staging manifest и сохранность прежних материалов. Если штатный
   процесс подтверждён, заменить только root, выполнить `nginx -t` и graceful
   reload. Существующие auth/карточки/demos сохраняются. Новых services,
   контейнеров, портов и изменений доступа этот маршрут не предусматривает.
8. Проверить фактическую доставку точной версии и сохранность прежнего Review
   в разрешённых пределах; вернуть URL, manifest/hash, выполненные проверки,
   ограничения и фактический rollback pointer. Серверные записи по штатному
   учёту append-only; успешный скрипт сам по себе не подтверждает доступность.

### Будущие точные операции с сервером

Ниже план, а не выполненные команды. Значения `live-root`, `release-id` и
`backup-id` фиксируются фактической проверкой и token, сейчас не придуманы.

| Режим | Target и действие |
| --- | --- |
| Read-only после candidate/QA | Через `vps1-direct` перечитать применимые service doc/PROCEDURES; проверить hostname/date, место на диске и статус nginx. Runtime/container metadata — только предусмотренные процедурой сведения о состоянии, без inspect env/auth/config. |
| Read-only baseline | Из `/etc/nginx/snippets/review.locations.conf` получить только текущую root-директиву, SHA256 и metadata. Secret-bearing config в чат/репозиторий не выводить. Manifest текущего immutable release и opaque inventory использовать только для сохранности paths/bytes; P2 реализации и QA findings не исследовать. Расположение manifest вне served tree подтвердить по текущему release, не угадывать. |
| Local | Сверить frozen P3 и обе QA; подготовить intent и exact manifest полного нового Review. В E runtime сохранить разрешённый opaque baseline, добавить только P3 и согласованную карточку. До token на VPS ничего не создавать. |
| Write только по token | Создать согласованный свежий backup под `/opt/superflight-studio/backups/review-p3-<backup-id>/`: exact прежний Review-snippet, root/hash и rollback metadata. Копирование конфигурации остаётся на сервере, секреты не выводятся. |
| Write только по token | Доставить согласованный immutable release под `/srv/superflight-review/releases/<release-id>/`, со штатным расположением served tree и manifest вне него. Сверить весь tree с manifest, permissions/ownership и сохранность прежних bytes; старые releases не изменять. |
| Write/control только по token | Подготовить в том же nginx-каталоге candidate snippet, меняя единственный root; проверить byte equality остального и атомарно заменить только `/etc/nginx/snippets/review.locations.conf` с сохранением root:root/0644. `sudo nginx -t` до/после, затем только `sudo systemctl reload nginx`; не restart. |
| Read-only delivery | Сверить новый root/hash и bytes, статус nginx, target `/review/r4d/p3-masks/`, каталог/старые маршруты и auth-поведение. Authenticated browser проверять только существующим разрешённым способом; отсутствие такой проверки явно назвать, cookies/login не добывать. |
| Write учёта по token | Добавить запись выпуска/результатов/rollback в `/home/sf/assistant-context/vps/services/superflight-studio.md` и `/home/sf/assistant-context/vps/CHANGELOG.md`. Append-only, без чужих продуктовых выводов. Общие INDEX/README и другие services для этого не менять. |

Если fresh baseline уже отличается от token или live изменился во время
подготовки, switch не выполнять: вернуть CTO точное расхождение и обновить
intent в его сериализованном процессе. Разрешение чтения не становится правом
записи. При denial остановить конкретную операцию и вернуть exact
action/target/toolcall/reason, не обходить отказ.

## Минимальный rollback contract

- Непосредственно перед разрешённым switch сохранить previous live root,
  exact прежний Review-snippet и его SHA256, новый snippet SHA256, сведения
  о текущем release и место свежего backup. Секретные значения в Git не писать.
- Нормализация единственного root должна подтверждать сохранность остальной
  конфигурации. Auth, headers и чужие services не изменять. Прежний immutable
  release не перезаписывать и не удалять.
- Перед rollback сверить live snippet/root с опубликованными P3 значениями.
  Если уже был следующий выпуск или другое изменение, не затирать его старым
  backup; передать CTO расхождение и согласовать актуальное действие.
- Откат возвращает exact прежний root/snippet штатным атомарным способом,
  затем `nginx -t`, graceful reload и проверку доступности/auth и прежних
  карточек. Выполнение rollback требует соответствующего права CTO в token
  или отдельного распоряжения. DB/сессии и чужие services не восстанавливать.
- Красный smoke сначала классифицировать: окружение, сценарий проверки,
  данные/контент, выпуск или продукт. Не чинить продукт и не откатывать
  автоматически по любому непонятному наблюдению.

## Ресурсы и следующий шаг

Текущий этап на паузе; тяжёлых операций нет.
Перед будущей тяжёлой упаковкой/проверкой — свежие system-wide
RAM/CPU/C/D/E и оценка совокупного пика с P2/Millionko. Тяжёлые temp/cache/
output/build/staging — только `E:\R4D\perspective\p3-runtime\release-engineer`,
с process-local параметрами. E≤4 GiB — диагностика; E≤2 GiB — безопасный
checkpoint/stop. Глобальные настройки не менять.

Следующий проход допустим только после новой явной команды Max и точных
входов из таблицы. Локальная подготовка сохранена; публикация не выполнена,
активного ожидания нет.
