# Release Engineer P4: подготовка публичной публикации

Состояние: [Stage A выполнен](p4-candidate-03-stage-a-checkpoint.md), только read-only/local. CTO разрешил будущую bounded publication03, не Full Art/P4 closure. Exact frozen/QA pins прежние; local browser subset proposal82 files/10 099 772 bytes сохраняет64 textures/licenses8, один обязательный P1 source-path privacy flag требует disposition. Preliminary operator identity/targets проверены,10 targets absent/no symlinks; это не CURRENT PUBLIC baseline/seal. Актуальный неполный [draft03](p4-candidate-03-public-write-intent-draft.md) заменяет широкое предложение111+markers. Нужны P2 window release, отдельный Stage B, Root/CTO review и single token; REMOTE_WRITES_HOLD_CTO Builder действует. Серверной доставки/переноса source не было.

## Рабочая область и ограничения

- Единственный checkout: `E:\R4D\perspective\p4-worktrees\release-engineer`; ветка `codex/r4d-p4-extracted-release-engineer-01`; исходный HEAD `64061757802dc60770ab156ef5672af741d65d03`, перед подготовкой clean.
- Runtime/temp/cache/output/staging: только `E:\R4D\perspective\p4-runtime\release-engineer`, env только process-local. Глобальные настройки, credentials и security не читать/не менять. Тяжёлых шагов не выполнялось.
- Ресурсы перед наблюдениями: CPU 23%, 24 logical CPU; RAM 17,898 / 31,907 GiB свободно; C: 14,956 GiB, D: 16,315 GiB, E: 16,926 GiB свободно. Локальный сохранённый HTML занимает 11 955 bytes. Перед будущим тяжёлым шагом повторить ресурсы и согласовать совместный пик; E <=4 GiB — предупредить и диагностировать, <=2 GiB — checkpoint и остановка.
- Получено подтверждение Director `gpt-6.1-sol/xhigh`; это не собственное наблюдение runtime. Настройки не менялись.
- Исходники, арт, кандидаты и выводы P2/P3/P5/P6 не читались; из общего каталога извлечены только URL и структура подключения ресурсов. Чужие checkout, UGH, Queue A/Q2A и dirty `D:\dev\R4D` не изменялись.
- Полномочия: точная доставка frozen bytes P4 в существующий public Review, сохранение чужих bytes/routes, новый baseline/manifest/rollback/postchecks. Реализацию и исследовательские выводы не исправлять. Старые protected-review templates, rollback и token не применять.

## Read-only наблюдения 28 октября 2026

Время: 15:31–15:32 Europe/Kiev (13:31–13:32 UTC). Все запросы: GET, redirects disabled, cookies disabled, default credentials disabled.

| Адрес | Наблюдение |
| --- | --- |
| `https://superflight.space/` | HTTP 302, Location `https://superflight.space/review/`; `text/html`; auth challenge отсутствует. |
| `https://superflight.space/review/` | HTTP 200 без auth, `text/html`, `Cache-Control: no-store`; 11 955 bytes; ETag `"6ae1a3d7-2eb3"`; Last-Modified `2026-10-28T07:27:19Z`. |
| `https://superflight.space/review/r4d/` | HTTP 403, `text/html`, `no-store`, 146 bytes; auth challenge отсутствует. Конкретная операция остановлена, повторов и обхода не было. |
| `https://sf.superflight.space/` | HTTP 303, Location `/login`, `text/html; charset=utf-8`, `no-store`; login не открывался, авторизация не выполнялась. |
| `https://superflight.space/review/assets/site.css` | HTTP 200, `text/css`, `no-store`; 4 108 bytes; ETag `"6ae1a3d7-100c"`. |

HTML каталога: UTF-8 без BOM, LF, title `Review · SuperFlight`, scripts и base tag отсутствуют. Общий CSS подключён как `./assets/site.css`. Существующие catalog href имеют относительную и абсолютную формы; link `p4-extracted-objects` отсутствует. URL чужих карточек извлечены для сохранности, страницы и их ресурсы не запрашивались. Текущее состояние целевого P4 endpoint не установлено.

Наблюдаемые границы: `/review/` публичен в проверенном HTTP-запросе; private root `sf.superflight.space` направляет на login. Причина 403 у directory endpoint `/review/r4d/` сервером не раскрыта; считать её доказательством прежней auth-схемы нельзя. UI Review/P4, MIME ассетов P4 и работоспособность чужих routes не проверены.

Сохранённый HTML: `E:\R4D\perspective\p4-runtime\release-engineer\review-root.html`; SHA256 `759de374bafabe98bcc1d96e297e0972df1439bd7322e3920438ec46eb188694`. SHA256 CSS response: `124d6c4b60d31872e3120e8d50fb3aca1c2852c613d86670585c45e5d7ba0288`. Это dated observations, не release baseline и не разрешение использовать эти bytes для будущего rollback.

HTTP refusal record: action `GET without auth/cookies; redirects disabled`; target `https://superflight.space/review/r4d/`; tool `functions.exec -> exec_command`, result chunk `edf449`; отдельный call ID для вложенного HTTP GET инструмент не выдаёт; reason `HTTP 403 Forbidden`, дополнительная причина не сообщена. Не было отказа automatic approval review. Не делать variant/retry/fallback для этой операции без нового разрешённого основания. Известный запрещённый `call_7b166cdf46834d468b5f9c297aad6e9f` не повторялся.

## Минимальный publish intent

После freeze доставить неизменённые публичные bytes только в `/review/r4d/p4-extracted-objects/` и внести одно необходимое точечное добавление в текущий каталог `/review/`. Сохранить все прежние записи каталога, bytes вне разрешённого набора и routes. Не менять public/private границы, auth, redirects, shared CSS/JS, security или global MIME. Не переносить private TS, maps, native source paths либо credentials в публичный артефакт.

До freeze не собирать полный staging, не снимать преждевременный серверный snapshot, не создавать шаблон поверх старой protected-review схемы. Новые baseline, snapshot и конкретный rollback готовятся непосредственно перед будущими writes на фактической схеме public Review.

## Недостающие входы от CTO/Lead

1. Frozen artifact: exact commit владельца, место получения готовых bytes и manifest (`relative path`, byte count, SHA256 исходных bytes, entrypoint, runtime assets/base paths и ожидаемые MIME). Text для проверки frozen bytes не нормализовать по LF. Manifest digest должен однозначно связывать поставку и выводы QA.
2. Независимые TQA и VQA conclusions, относящиеся именно к этим bytes/manifest, с фактическими ограничениями и результатом; непроверенное не объявлять PASS.
3. Текущий разрешённый способ точечной записи и server identity, физический public target для P4 и файл/владелец каталога, допустимый способ fresh baseline/snapshot/rollback и проверки сохранности routes. Credentials в отчёт не передавать; sensitive allowlists/config/tool outputs не читать. Старую инфраструктурную запись не считать актуальной автоматически. Для 403 нужен факт от владельца текущего routing: directory listing запрещён или существует другое конкретное ограничение; сам отказ не обходить.
4. Согласованный текст/место единственной ссылки P4 в каталоге и соответствующий публичный entrypoint. Точная файловая дельта станет известна после freeze и fresh catalog baseline.
5. Новый single release-token CTO для конкретных frozen bytes, назначения P4 и точечного изменения каталога; определённые условия rollback. До его получения writes/deploy запрещены.

## Минимальный local release checklist после freeze

- [ ] Получить frozen manifest и независимые TQA/VQA conclusions; сверить commit, artifact digest и scope.
- [ ] Повторить RAM/CPU/C/D/E; оценить размер локального staging/snapshot и совместный пик. Собственный runtime и process-local env только.
- [ ] Проверить готовые bytes по manifest без rebuild; проверить отсутствие private source/maps/путей и разрешённый набор публичных файлов; подготовить локальную точечную дельту каталога.
- [ ] На актуальном public target непосредственно перед writes снять fresh baseline/snapshot только затрагиваемых файлов и нужных route/catalog metadata. Согласовать точный rollback с этим baseline; не использовать сегодняшнее наблюдение как baseline. Если catalog изменился — пересчитать дельту, не затирать изменения других владельцев.
- [ ] Получить новый single release-token CTO; сверить его с конкретным артефактом и write set. При несовпадении не публиковать.
- [ ] Выполнить только разрешённую точечную доставку и добавление catalog link; не изменять чужие каталоги, routes, auth и global MIME.
- [ ] Сверить опубликованные bytes с manifest; GET проверить status, точные asset MIME/cache headers и base paths для HTML, JS/module, JSON, PNG/WebP, fonts и WASM — только если тип реально присутствует. HTML вместо asset не засчитывать как успешный ответ.
- [ ] Проверить P4 и переход из каталога в разрешённом изолированном браузере, загрузку арта/управления, отсутствие resource/console ошибок; публичный доступ без auth. Проверить прежние route metadata без чтения чужих продуктов и private boundary без login/credentials.
- [ ] Проверить сохранность прежних записей/bytes в рамках разрешённого сравнения, вернуть URL, manifest digest, baseline/rollback location и фактические postchecks; при сбое остановить конкретную операцию и действовать только в согласованных полномочиях.

Окончательный TQA pin: published clean commit `2c4671b5ed5b04a1635c2429328cf433ac4ec35f`, blob `16b8b76c1d48f00a15e700e5c7294915eeaa2cd8`. Следующий шаг: disposition privacy flag и отдельное поручение Stage B после P2 C05 window release; затем full seal/review/token. Активного ожидания нет. Списки первоначального prep не заменяют актуальный draft/Stage A checkpoint. Сейчас публикация не выполняется.
