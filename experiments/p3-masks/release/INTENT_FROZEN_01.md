# P3-frozen-01 — release intent для CTO

28 октября 2026, Europe/Kyiv. Release Engineer `release-engineer-r4d-p3-masks-01`.
**LOCAL_INTENT_READY; server_write=false; CTO gate/token отсутствуют.**
Публикации нет. Это предложение конкретного выпуска, не художественный PASS.
Слот P3 остаётся занятым: реальный published result и итоговый handoff впереди.

Пауза снята прямой командой Max от 05:36 UTC, Sentinel
`6074724116dc819181f7316416fab9f5`, переданной Lead/CTO. Возобновлён прежний
участок с checkpoint `3ec9adf9032969f13056b4d820c500c66e006f9e`;
новых сессий/персонала/worktrees нет. UGH не затрагивается.
Lead допустил к intent **частичный исследовательский результат**.

## Exact candidate и две QA

| Источник | Exact identity |
| --- | --- |
| CODE | `f1aca21e7b9ba19001e7e8762fcaf2511bf9bf74` |
| ART | `f899a308aed156a11e2a1013292ed68c6669959d` |
| Handoff | `4603d99a5904d10924f55416e36100b2c470b534:experiments/p3-masks/builder/FROZEN_CANDIDATE.md` |
| Frozen manifest | `e2e9f7d837b3d05f484f75a877af6992a70ee88363add783d80f3c6e206f431f`, 12815 bytes |
| TQA report | `c0db64fe4a0204d77be0d3ab61ffe21331d9c90a:experiments/p3-masks/technical-qa/TQA_REPORT_FROZEN_01.md` |
| TQA report SHA256 | `689e821a27dd99a5a24944e17022a1d396f1b5ab451549c7754b0c23f4a99502` |
| VQA report | `0f282b89a5d58f6613153ceb385657c8fb761b1d:experiments/p3-masks/visual-qa/REPORT_FROZEN_01.md` |
| VQA report SHA256 | `a250791f4ecb3543bd6ed32a79762d98da4fac4e9c3e1db95df5880f3ca1e362` |

Отчёты полностью прочитаны из exact Git objects; оба закрепляют те же
CODE/ART/manifest. TQA завершена, новых P3 technical defects в проверенном
объёме нет. VQA частичная: просмотрены частичные скрытия четырёх семейств,
высокий столб, борта, receiver01/03, передний край02, читаемая тень на светлом
полу. Новых конкретных mask/renderer defects для коррекции пара не вернула.

**Неустранённое ограничение:** общий P1 mapping `left-5`, seed `2818447218`,
tick `612` — ранний отскок от видимого свободного пола. Плохой повтор
сохранён. Полный visual/art PASS и полное исполнение визуальной цели не
заявляются; все маски/seed и попадания02/04 не исчерпаны проверкой.
Конфигурация/геометрия и frozen продукт не изменялись, новая предметная QA
не запускалась. Это ограничение явно включено в карточку и release manifest.

Исходный bundle — `E:\R4D\perspective\p3-runtime\builder\full-checkpoint-06`:
76 payload files / 3388537 bytes, 51 mask; вместе с manifest — 77 / 3401352.
Все paths/sizes/SHA256 независимо совпали; лишних/пропущенных файлов нет.
В новый route скопированы эти exact bytes без rebuild/wrapper/edit.

## Fresh baseline guard

Доступ — существующий `vps1-direct`. Live root, manifest и полный opaque
inventory проверены read-only; при capture и после локальной упаковки guard
совпал. Последняя проверка: **2026-10-28T06:32:06.390068+00:00**.
Runbook перечитан только по публикационной механике; INDEX/PROCEDURES/README
hashes прежние. Свежий service doc hash и остальные hashes сохранены в
[baseline-guard.json](intent-frozen-01/baseline-guard.json).

| Guard | Значение |
| --- | --- |
| Current live root | `/srv/superflight-review/releases/p2-jungle-static-candidate-03` |
| Current RELEASE_MANIFEST SHA256 | `171a889a53da529d2a668da9811b3f6a9661cdc52ab54a46e254900553cfed35` |
| Current Review-snippet SHA256 | `d8cf0b3cd5a56241dc86562705daab81da09c648ad1aba8adcf232be2eb23104` |
| Root-normalized snippet SHA256 | `1ed5f62aafffd08ff9359fc4b615139006fc2e0e3cbf152b0363b6d0dcb7230f` |
| Candidate snippet SHA256 | `c67b27e4b179dfe3cb803268435b7558b0c48b8ea8b1018ec709149511be1ba8` |

Текущий manifest покрывает 472 browser files / 85200941 bytes; actual server
paths/sizes/hashes совпали с ним. Включая manifest: 473 / 85301035.
Symlinks отсутствуют. Snippet root:root/0644, ровно одна root-директива.
Candidate snippet рассчитан только в памяти read-only процесса: меняется
единственный root, normalized bytes конфигурации совпадают.
P2 продукты/QA findings и содержимое чужих карточек не исследовались;
старое дерево копировалось и хешировалось как opaque baseline.

## Frozen release proposal

Proposed release ID: **`p3-jungle-masks-frozen-01`**.
Target root: `/srv/superflight-review/releases/p3-jungle-masks-frozen-01`.
Target URL: `https://superflight.space/review/r4d/p3-masks/`.
При read-only проверках proposed root отсутствовал.

Локальная готовая копия:
`E:\R4D\perspective\p3-runtime\release-engineer\intent-p3-frozen-01\release\p3-jungle-masks-frozen-01`.
Transport:
`E:\R4D\perspective\p3-runtime\release-engineer\intent-p3-frozen-01\p3-jungle-masks-frozen-01.tar.gz`.

| Артефакт | Bytes / SHA256 |
| --- | --- |
| [Полный RELEASE_MANIFEST.json](intent-frozen-01/RELEASE_MANIFEST.json) | 107213 / `381ff209d36f24c1734e2f2012d0b298cb13efd37e928956ceaf00ab967c2937` |
| Exact transport tar.gz | 80568959 / `23a3df76a29b05d8cc7ea17ff1cf0e9e360848a540f15386d26e1a85998f463c` |

Новый manifest — 549 browser files / 88602877 bytes; с самим manifest —
550 / 88710090. Manifest находится вне `/review/`, не включает собственный
digest; его hash закреплён здесь. Все entries архива повторно совпали с
готовым деревом; uid/gid0, dirs0755/files0644, только ordinary files/dirs.
После упаковки frozen P3 снова побайтно совпал с исходным bundle.

**471 прежний browser-файл неизменён.** В `review/index.html` изменены только
счётчик перспективного раздела2→3 и добавление одной P3-карточки в существующем
формате. Добавлено 77 файлов под `review/r4d/p3-masks/`; прежних удалений нет.
Обратная дельта каталога восстанавливает exact baseline bytes.

[Карточка](catalog-card.html) содержит точные title/status/caveat от Lead;
[нулевой контекст дельты](intent-frozen-01/catalog.delta.patch) показывает только
счётчик и новое содержимое, без чужих карточек. Catalog SHA256:
`84a652cdf90b42416ebfb2c61fc9d02babd19e9bb2905cc2d0451507e7610a4d`
→ `759de374bafabe98bcc1d96e297e0972df1439bd7322e3920438ec46eb188694`;
11371→11955 bytes (+584). Проверка дельты — static byte/structure checks;
новый loopback/server/browser для неё не требовался.

## Exact write-set — только после нового single CTO token

Token должен связать этот candidate, manifest/archive hashes, baseline guard,
перечисленные операции и право вернуть прежнюю консистентность. Сейчас token
не выдан; ниже только предложение, ни один remote target не записан.

| Target | Предлагаемая операция |
| --- | --- |
| `/opt/superflight-studio/backups/review-p3-frozen-01/` | Создать свежий backup; сохранить `review.locations.conf.before`, `STATE.json`, затем `PUBLISHED.json`. Доставить сюда exact `candidate.tar.gz`. Каталог read-only проверен как отсутствующий; сейчас backup не существует. |
| `/srv/superflight-review/releases/p3-jungle-masks-frozen-01/` | Создать новый immutable tree из exact archive; все 550 файлов включая manifest. Сверить inventory/hash/size/ownership/modes и старые bytes; существующие release directories не менять. |
| `/etc/nginx/snippets/.review-p3-frozen-01.locations.conf.tmp` | Подготовить в том же filesystem root-only candidate snippet; ожидаемый hash `c67b27e4…be1ba8`. |
| `/etc/nginx/snippets/review.locations.conf` | Только при повторном совпадении guard атомарно заменить подготовленным snippet root:root/0644. `sudo nginx -t` до/после; затем только `sudo systemctl reload nginx`. |
| `/home/sf/assistant-context/vps/services/superflight-studio.md` и `/home/sf/assistant-context/vps/CHANGELOG.md` | Append-only запись exact release, результата smoke, ограничений и rollback pointer; без чужих продуктовых выводов/секретов. |

Непосредственно перед первой записью повторить live guard/actual manifest;
target root и backup должны всё ещё отсутствовать. Любое несовпадение —
остановить этот intent, вернуть CTO расхождение; старый token не переносится
на новый baseline/bytes. Никаких изменений auth, global MIME/nginx settings,
доступа, публичных портов, services/containers, private keys или session DB.

## Rollback и delivery smoke

Proposed rollback pointer: `/opt/superflight-studio/backups/review-p3-frozen-01/`.
Фактического backup пока нет. Перед switch exact прежний snippet сохраняется
в `review.locations.conf.before`; его SHA256 должен быть текущим `d8cf0b3c…23104`,
root — `p2-jungle-static-candidate-03`. Старое immutable дерево сохраняется.

Rollback допустим по token/распоряжению CTO, если live snippet всё ещё равен
P3 hash `c67b27e4…be1ba8` и root — proposed P3. Вернуть exact сохранённый
snippet тем же объявленным temp path/атомарной заменой, `nginx -t` и graceful
reload. При поздней чужой правке не затирать её backup. DB/сессии/чужие
services не откатывать; releases не удалять. Красный smoke сначала
классифицируется; продукт ради smoke не исправляется.

После разрешённой публикации проверить фактические root/hash/bytes,
старые маршруты/каталог, navigation/backlink и прежнее auth-поведение.
Для пяти browser `.js` (`app`, `native-core`, `run-model`, `view-math`,
`vendor/pixi`) — JavaScript MIME и exact body по manifest; `.mjs` в browser
bundle не подставлять, глобальные MIME settings не менять.
Auth303/login HTML не подтверждают module MIME/body. Post-auth проверка
требует существующего разрешённого способа; если он недоступен, это явно
остаётся непроверенным и возвращается CTO, новые cookies/login не добываются.
Сейчас HTTPS/post-auth smoke, nginx-t/reload и публикация не выполнялись.

## Ресурсы, доказательства и следующий шаг

Перед capture: 06:24UTC RAM free11.792/31.907 GiB, CPU9%/24logical,
C/D/E free8.049/16.322/40.146 GiB. Перед упаковкой06:29:53UTC:
free11.829 GiB, CPU2%, C/D/E8.044/16.322/39.118 GiB.
Оценка добавочного peak≤0.5 GiB RAM/0.4 GiB disk; совокупное наблюдаемое
использование≈20.078 GiB плюс release≤0.5 GiB. Оно включает текущие прочие
нагрузки P2/Millionko, не гарантирует их будущий рост. Server disk free при
чтении≈30.6 GB. Перед будущей тяжёлой доставкой повторить ресурсы.
Все тяжёлые файлы — только собственный E runtime; env process-local.

Raw opaque baseline, tar, hashes и промежуточные снимки сохранены в своём
runtime. [Итоговая сводка](intent-frozen-01/intent-summary.json),
[ресурсный снимок](intent-frozen-01/resources-before-prepare.json).
Recipe [prepare_intent.py](prepare_intent.py), SHA256
`b23cd4780404a28efd71e1f1b729c9612c8f6b68b89c112906d385acc885fa94`,
не содержит remote write-команд. Первая list-сверка выявила различие
Windows/lexical sorting; проверка по path показала совпадение всех bytes,
исправлен только порядок в своём helper. Это не дефект frozen candidate.

Своих активных серверов/браузерных вкладок/exec sessions нет; общий Builder
preview PID112732 не останавливался. Следующий шаг — решение CTO и новый
single P3 token по этому intent. До него `server_write=false`, без активного
ожидания. Наличие свободного shared lock само по себе выпуск не разрешает.
