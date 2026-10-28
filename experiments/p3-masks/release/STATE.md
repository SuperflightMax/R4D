# P3 Masks — локальная подготовка выпуска

28 октября 2026, Europe/Kyiv.
Владелец: `release-engineer-r4d-p3-masks-01`, Release Engineer.
Worktree: `E:\R4D\perspective\p3-worktrees\release-engineer`.
Ветка: `codex/r4d-p3-masks-release-engineer-01`.

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
четыре серверных документа, service doc и CHANGELOG. Exact актуальные пути
серверных документов и SSH alias не установлены. В своём worktree файл
`work/REVIEW_HANDOFF.md` отсутствует (`Test-Path` вернул `False`). Sensitive config,
credentials, session DB и чужие рабочие копии для их угадывания не читались.
Доступ и service doc pointers ожидаются от CTO после ответа Max.

## Точные входы для следующего прохода

| От кого | Что передать |
| --- | --- |
| Builder через Lead | Candidate ID, полный frozen source commit, абсолютный путь готового самостоятельного static bundle и его точная граница. Не branch HEAD и не команда пересборки. |
| Builder | Exact manifest bytes и SHA256 manifest: для каждого публикуемого относительного пути размер в bytes и SHA256; полный перечень файлов без пропусков. Если передаётся архив — также его точный путь и SHA256. |
| Builder | Entry point и base route `/review/r4d/p3-masks/`, route-relative ресурсы, build provenance и версии native core/PixiJS, включённые лицензии. Указание, где находится compiled runtime; private TS, source maps и локальные paths в browser tree не входят. |
| Technical QA | Exact report commit/path; проверенные candidate ID и manifest SHA256, фактические проверки и ограничения. В том числе route-relative static loading и runtime dependencies. |
| Visual QA | Exact report commit/path для тех же candidate ID и manifest SHA256; просмотренные движение/кадры и честные художественные ограничения. План проверки не заменяет выполненную QA. |
| Lead/CTO | Принятая disposition именно этого candidate с обеими QA и ограничениями; текст существующей карточки/её минимального дополнения и размещаемых ограничений. Частичное закрытие опыта отдельно от художественного PASS. |
| CTO | Документированный доступ, актуальные service doc pointers, разрешённый read-only способ получить live root и baseline Review. Перед любыми server/webroot/nginx writes — отдельный single release token с точным bundle hash, baseline и пределами операции. |

Builder передаёт готовые проверенные bytes. Release не пересобирает и не
меняет продукт ради smoke. Изменение bytes после QA означает другой candidate
и возврат владельцу для решения о затронутых проверках.

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
3. После передачи документированного доступа получить read-only текущий root,
   baseline manifest/хеши и сведения о существующем механизме root switch,
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

Сейчас выполняются только небольшие чтения, документация и Git; тяжёлой
операции нет. Перед будущей тяжёлой упаковкой/проверкой — свежие system-wide
RAM/CPU/C/D/E и оценка совокупного пика с P2/Millionko. Тяжёлые temp/cache/
output/build/staging — только `E:\R4D\perspective\p3-runtime\release-engineer`,
с process-local параметрами. E≤4 GiB — диагностика; E≤2 GiB — безопасный
checkpoint/stop. Глобальные настройки не менять.

Следующий проход — после точных входов из таблицы. До этого локальная
подготовка завершена; публикация не выполнена, активного ожидания нет.
