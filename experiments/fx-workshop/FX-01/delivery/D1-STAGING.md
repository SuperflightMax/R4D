# FX-01 D1 · STAGING_READY / NO CUT

Ключ `FX01-D1-43b6268e`. 19 ноября 2026; серверные отметки ниже — UTC. CTO выдал D1 только до staging после `Q1R: C1_VERIFIED / FUNCTIONAL_SMOKE_PASS`. Исходный HEAD организационных документов `3f22157d9ca0746161434cdc8bd732cfb47ae207`. **Live root не переключён, nginx не reload/restart.** Физический M11 и человеческий/product gate остаются открытыми.

## Конкретный подготовленный результат

- Exact runtime source: **`43b6268e924698048a4d79df1aad2512c86f08f7`**. Три файла взяты через `git show` как bytes, без сборки, обёртки или правок.
- Новый immutable staging: **`/srv/superflight-review/releases/fx01-43b6268e-20261119T031029Z`**.
- Целевой адрес после отдельного CUT: `https://superflight.space/review/r4d/fx-workshop/fx-01/`. Сейчас **404**, кандидат ещё не доставлен по HTTPS.
- Private backup/receipts/rollback: **`/opt/superflight-studio/backups/review-fx01-43b6268e-20261119T031029Z`**, root-only directory 0700.
- Подготовленный snippet: `review.locations.candidate.conf` внутри backup; предыдущий — `review.locations.before.conf`.
- Incoming packet сохранён для просмотра в `/tmp/r4d-fx01-d1-43b6268e-20261119T031029Z` (частная папка sf 0700). Он не входит в public tree.

[Каноническая серверная квитанция](D1-STAGING.json) скопирована побайтно. SHA-256 самого JSON: `58d2e3e85340fca7bcc4d6b0c01e6d5c8d3a25440c2a098fea646302b5bb7691`. [Свежий read-only guard](D1-FRESH-GUARD.json), [HTTPS-проверка HOLD](D1-HTTP-HOLD.json), [минимальный diff каталогов](D1-CATALOGS.diff).

| Runtime-файл | Bytes | SHA-256 Git → packet → server staging |
| --- | ---: | --- |
| index.html | 5387 | `b4d67713c59184e4f813f4ba89c8d3b074f60149e7be90c9a29595e83561bab5` |
| style.css | 7215 | `c7409f0d06fca2b22b8f0f6cde013529c8d20a9fe84c61b205d5212bc6bc3a3b` |
| app.js | 27932 | `b34abd8bfc6e6f010397da9b2372def74f005271ce1e92a8e35b5ce9b2405f6f` |

Все три значения совпадают с независимым Q1R. Runtime в рабочем дереве также не отличается от source commit. Новая FX-директория содержит **только эти три файла**: без Markdown, checks/evidence, source maps, Git metadata, profiles и пользовательских данных.

## Fresh base и проверка сохранности

| Поле | Значение |
| --- | --- |
| Неизменённый live base root | `/srv/superflight-review/releases/millionko-ui02b-r3-r01-cc42352d` |
| Live/base snippet SHA-256 | `b9dde1214d4aabf6b7d4469fddf5cd81ee29f8e94706b20a8fa900b92f21e983` |
| Candidate snippet SHA-256 | `39b20c6fe05572089c1038ec95129211c8b6b2fc374c16b3baac117da04f3456` |
| Base canonical inventory SHA-256 | `46919ca359e980bdb5a5f2e3c3052620bc0b5f8e0ead0af4ca7b060b290d954d` |
| Staged canonical inventory SHA-256 | `b24d7b91242b33b46c458bfefa54a0a9fffe8d4615ba08cdb242b957e18f8cb9` |

Base: **1050 browser-файлов**. Staging: **1053 browser-файла**. Сохранены побайтно и с прежними uid/gid/mode **1048 прежних browser-файлов**; изменены только два каталога. Отдельный старый `RELEASE_MANIFEST.json` вне `review/` тоже сохранён без изменения. Всего staging содержит **1054 файла / 142 директории / 189396002 bytes**; полная base — 1051 файл / 140 директорий / 189354123 bytes.

Копирование выполнено `cp --archive --reflink=auto`, **без hardlink связи с base**. Полные пути, SHA/size, владельцы и права сверены; symlinks отсутствуют. У наследуемых каталогов uid/gid/mode не менялись, смешанное владение сохранено. Две новые директории root:root 0755, три новых runtime-файла root:root 0644. Старые releases и live base не редактировались и не удалялись.

В каталогах добавлены только новая FX-карточка, ссылка/секция FX Workshop и её счётчик 1; общий R4D **23→24**. Существующие art-2d 1 / skeleton 13 / perspective 9 и чужие карточки/статусы/ссылки сохранены. Обратное удаление добавленных блоков и обратная замена одного счётчика восстанавливают обе исходные страницы побайтно. Публичная подпись — «UX-прототип для просмотра», без объявления приёмки этапа и без технического отчёта в интерфейсе.

В candidate snippet заменён **только литерал immutable root**; обратная замена даёт исходный snippet побайтно. Сохранены текущие public-domain split, Origin/GET-only/dotfile guards, no-store/noindex/nosniff/Referrer-Policy/DENY, autoindex off и disable_symlinks. Старый auth_request/private redirect не возвращался, старый renderer не запускался.

Прочитаны полный D1, DELIVERY_NOTES, REVIEW_HANDOFF и актуальные серверные README/INDEX/PROCEDURES, public-split и последние Review-разделы service doc. Обязательные preflight: gateway/nginx активны, контейнеры не тронуты, `nginx -t` PASS, на VPS около 26 GiB до и 25 GiB после clone. C/D/E перед записью 7,09 / 7,32 / 33,38 GiB; пороги 4/2 GiB не достигнуты. Shared Review lock не найден; последняя чужая публикация Millionko R3 имела FINISH. Fresh guard до/после clone подтвердил root/hash, весь старый tree и защищённые vhost/global nginx/MIME/Imagen/public guards/portal app/Compose. MainPID и последняя запись ExecReload nginx остались прежними.

После staging настоящие анонимные HTTPS GET: `/review/` и `/review/r4d/` — 200 с **старыми exact hashes**, новый FX URL — 404, чужой Origin — 403, dotfile — 404; защитные заголовки на месте. Это подтверждает HOLD текущего live, а не успех будущей доставки. Новые три runtime-файла по HTTPS и browser delivery smoke пока **не проверялись** — они относятся к CUT.

## Guard, rollback и остановка

Только read-only перепроверка перед рассмотрением CUT:

```bash
sudo -n python3 -B /opt/superflight-studio/backups/review-fx01-43b6268e-20261119T031029Z/d1_stage.py verify /opt/superflight-studio/backups/review-fx01-43b6268e-20261119T031029Z/STAGING_READY.json
```

При чужом изменении root/snippet, protected hashes, base/staging inventory или состояния nginx этот guard откажет. Автоматического переключения в helper **нет**. Полные `BASELINE.json`, `STAGED_INVENTORY.json`, `packet.json`, `STAGING_READY.json`, `STAGING_VERIFIED.json` находятся в backup. SHA-256 сохранённого файла `STAGED_INVENTORY.json` (pretty JSON, отличается от canonical tree digest): `aa142783f22d2ccf1550126290f157ec5abd45c5ec87b7336a60a95a6cd9421a`.

`d1_rollback.py` подготовлен в backup, **не исполнялся**. Только по отдельному поручению на rollback **после фактического CUT**: `sudo -n python3 -B <backup>/d1_rollback.py --rollback`. Он требует exact candidate snippet hash, прежние protected hashes и целый старый immutable root, затем атомарно восстанавливает только сохранённый snippet, выполняет nginx tests/graceful reload. До CUT и при чужих правках он откажет; DB/сессии не восстанавливает.

Серверные service doc и CHANGELOG дополнены START/STAGING_READY **append-only**, с проверкой прежнего префикса и uid/gid/mode; retired writer не использовался. Серверные receipts и helper bytes сохранены приватно. Новых сервисов/портов/credential-прав/установок/API/расходов не создавалось. Собственных длительных процессов, браузера или preview-сервера для D1 нет.

**Остановка: STAGING_READY. Жду отдельный CUT CTO по этому конкретному staging.** Ни live-root switch, ни reload не разрешены этим результатом. Физический M11, Макс/Слава и решение Product + Max остаются впереди.
