# Текущее состояние Builder P2

staff_id `builder-r4d-p2-free-01`; branch `codex/r4d-p2-free-builder-01`; исходный HEAD `df760b680f0d0264342fc8577fcc5779b80a3a15`. Рабочая копия только `E:/R4D/perspective/p2-worktrees/builder`.

## Новое действующее поручение 28 октября: static P2 и последующий exact release gate

Последний результат: **READ_ONLY_PREFLIGHT_COMPLETE_AWAITING_LEAD_GATE_AND_CTO_TOKEN**. Доверенный Dot/Lead передали существующий alias vps1-direct и серверные docs. Оба названных runbook/README и mandatory INDEX/PROCEDURES полностью прочитаны, роли ReleaseEngineer ранее прочитаны на pinned revisions. SSH connection/read успешны без извлечения configs/keys/credentials. Current live root `/srv/superflight-review/releases/fd851ad78adfec67c11ed59f07fa24dbef2761c6`; live RELEASE_MANIFEST SHA256 `9c6159e21fd655b86525a8b19427b6fe650318c28c899cd5f10da761c2b62b5c`, 261716 bytes. Все457 browser files/82751790 bytes независимо совпали с published_files по path/bytes/SHA256, no symlinks, root:root644; P2 route отсутствует. Snippet SHA `544233b893c860cbe993a952232211b0a8641df6482f42815ec680d2cd23c7d4`. Замер 2026-10-27T23:45:35.751840Z, то есть 28 октября по Киеву. Исторические сведения о недоступных docs ниже теперь разрешены найденными штатными pointers.

Намеченный, не созданный release id/newroot `p2-jungle-static-candidate-02` / `/srv/superflight-review/releases/p2-jungle-static-candidate-02`; fresh rollback proposal `/opt/superflight-studio/backups/review-p2-candidate-02-20261027T234352Z`, сейчас отсутствует. Full intent/preservation/postchecks — REVIEW_PREFLIGHT_01.md, raw metadata только E runtime `output/builder/review-preflight-01/PREFLIGHT.json`. Candidate02/source/tree/build manifest не менялись. Ограниченная publication после достаточного offlineTQA может дать protected HTTP target, но не заменяет финальный VQA/приёмку; post-auth доступ пока не подтверждён. Никаких server writes/token/gate сейчас нет. Остановиться до адресного exact gate Lead и отдельного single token CTO, без активного ожидания и без новых вопросов о pointers.

Текущий результат: **FROZEN_PENDING_INDEPENDENT_QA**, один `p2-jungle-static-candidate-02` из source `5f40f6692dc5e7238afc961a2e0afa826cdefc9b`; 15 browser файлов / 2448166 bytes. Tree SHA256 `5bc6fd3b7f99e20fe98e3f98d972371538beee767abebc905fa595af55205b4d`. Artifact `E:/R4D/perspective/p2-runtime/output/p2-jungle-static-candidate-02/`, полный `BUILD_MANIFEST.json` и `STATIC_CHECK.json` вне browser tree. Собственная проверка exact bytes/relative resources/compiled core прошла; браузер/Pixi/download DOM не запускались. Подробная передача и все per-file SHA — `STATIC_CANDIDATE_02.md`. Release gate Lead не получен, внешней записи нет. Source commit artifact остаётся точным, последующие docs commits не требуют пересборки этих bytes.

Сохранённый checkpoint по последнему указанию Lead: candidate-02 принят Lead как frozen pending QA. Lead независимо подтвердил все15 file bytes/hashes, tree `5bc6fd3b7f99e20fe98e3f98d972371538beee767abebc905fa595af55205b4d` и manifest `6cf78e7b64625828929cd5905afe033570579f8e2950c103c757d53016a49aa0`. TQA/VQA получили exact candidate и доступную offline-проверку с явной browser limitation; результатов их приёмки ещё нет. Эти сведения переданы Lead, новая собственная проверка не запускалась.

Подтверждённого HTTP(S) preview URL пока нет. CTO уже запрашивает у Макса несекретный connection/docs pointer; вопрос не дублировать. Новый file-preview отказ зафиксирован; другой surface/actor для file URL и старый launcher не использовать. Bundle bytes не менять и не пересобирать. Release не начинать без exact gate Lead и отдельного общего token CTO. Работа свёрнута в checkpoint/clean, без активного ожидания и пингов; возобновление только по адресному сообщению Lead о доступном alias/docs или QA correction.

Уточнение source freeze: sourceCommit5f40f66 содержит настоящие public UI/build-изменения, сборка потребовала clean status. Handoff commit314c1c8 — только bookkeeping docs; sourceCommit не подменялся. После независимой QA не менять и не пересобирать frozen bytes; новый код потребует нового candidate. Private compiled runtime только E artifact, не public Git; private TS/maps/операторские логи отсутствуют в browser tree, пути ядра/dependencies переданы process args.

Текущее release-окно: перед любыми server writes нужен единственный token CTO после exact candidate/release intent от Lead; до token только build/freeze/read-only preflight. Token не получен. Параллельные общие writes до postchecks/освобождения не разрешены; live root сверять свежим. SSH/security configs/credentials не читались; alias/host не выдумывались. CTO запрашивает у Макса несекретный указатель.

Оценка разрешённого CTO built-in file-preview завершилась конкретным отказом `mcp__cua_repl.js / cua.createBrowserTab`: file URL exact candidate index с seed1/paused1 запрещён browser URL policy, разрешены только HTTP/HTTPS. Call ID не показан. IAB оставил только about:blank вкладку1; она прочитана и закрыта. Приложение/сцена не открылись; обходов и повторов нет. Нужен существующий разрешённый HTTP(S) preview target; вопрос о нём передан без запроса credentials. Build/штатный release этим file-specific отказом не запрещены. Frozen artifact, manifests, hashes и sourceCommit не изменены; запись подробно в STATIC_CANDIDATE_02.md.

CTO/Lead передали прямое решение Макса через доверенный Dot продолжать P2, собрать демку и выложить на прежний Review. Прежний SOURCE-ONLY stop больше не текущая граница. Только существующая команда; без новых сессий/runner/worktree. Exact Lead base `ec090addd2f261b4f4f2b5abd8c742df4672d115` недеструктивно merged в свою ветку, merge commit `6bb515fad07be62651d18547275af8999dd00efc`; source-ready пакет совпал без конфликтов.

Сейчас разрешена обычная standalone static сборка/packaging и её полезная самопроверка. Default — Jungle art v2; route `/review/r4d/p2-free-approach/`, относительные ресурсы, настоящий отдельный compiled sim-core, JSON download вместо обязательного POST. Принятые config/projection/PRNG не меняются. Частные TS/maps/секреты/локальные пути не входят в browser tree или новые публичные исходники. Build/temp/cache/staging/output только E runtime, process-local; действуют пороги >4/<=4/<=2 GiB.

Отказ `call_7b166cdf46834d468b5f9c297aad6e9f` не повторять/не дробить/не переносить. Старый `serve.mjs` и Windows server/browser packet не используются. Нового сервиса/порта нет. Отдельный новый отказ остановит только отказанное действие. Sensitive allowlists/config/tool-output/permissions не читать и не менять.

После независимых TQA/VQA назначена узкая техническая доставка того же frozen bundle существующим маршрутом Review; до отдельного exact gate Lead внешняя запись запрещена. Staff release-engineer полностью прочитан на `e9dfa0e32226e3f72de1f75e5c77a43d5ebfd9b3`, проектная роль — из exact Lead base. Действующие service/release инструкции и live root нужно прочитать/сверить до выпуска; исторический release record не доказывает текущий live root. Локальный `D:/vps_superflight` существует, но не содержит доступных файлов/AGENTS/README_RU; service docs пока не прочитаны. Подтверждённого существующего QA preview route до root switch пока нет; auth/чужие cookies/passwords не трогались. Сборка от этого не зависит.

Первый read-only замер: C7.871078/D16.312206/E41.623604 GiB. Перед build будет свежая оценка ожидаемого пика. Ни release, ни root switch сейчас не выполняются. Старые остановки и source-only состояния ниже остаются историей и не отменяют это конкретное разрешение сборки.

Первая ordinary build попытка из source `5c4bb7e9dbebb1e034e5414bdab7396af97ba4fe` в `E:/R4D/perspective/p2-runtime/output/p2-jungle-static-candidate-01` скомпилировала настоящий core (21962 bytes), но завершилась до freeze: поиск локальных путей ошибочно нашёл `e:\\` внутри стандартного `file:` URI-regex prebuilt Pixi. Это false positive статической проверки, не runtime/tool-policy отказ. Проверка уточнена до настоящего quoted/whitespace drive-prefix; deprecated legalComments option убран. Первый каталог и `output/builder/static-build-01.*.log` сохранены; исправленная сборка получит candidate-02. Физика, config, проекция и PNG неизменны.

Этап 2 прямо выдан Lead. Код основы, малый стык Artist и отдельный source-only пакет готового Artist v2 подготовлены. Текущий статус нового пакета — SOURCE_READY_RUNTIME_UNVERIFIED. Прежняя лёгкая физическая проверка относится к основе; сервер и браузерная проверка не запускались. Ни полный technical PASS, ни artistic PASS не заявлены; P2 не закрыт.

Принято для первого малого стыка: неподвижный исходный Jungle и его тени, отдельные ball/shadow, точные прозрачные накладки четырёх семейств. Переходы по depth проверяем на настоящих контактах, не объявляем доказанными заранее. Контракт — `ASSET_CONTRACT.md`.

Фактически read-only проверены branch/HEAD/clean до правок, native core HEAD, исходник SHA256, точный P1 config и manifest/projection pins. `prepare-inputs` извлёк четыре небольших принятых файла и побайтово сравнил их с точными Git-объектами; SHA256 config и projection совпали. `node --check` для новых модулей и `git diff --check` прошли. Это лёгкие проверки, не выполнение симуляции или просмотр сцены.

## Условия диска от 27 октября и история прежних поручений

Lead передал новое прямое правило Макса через доверенный Dot; CTO получил его 27 октября в 20:04 UTC. Оно заменяет прежнее требование остатка после пика >=10 GiB и пороги C11.415/11.525. Эти старые условия больше не действуют; записи ниже сохранены как история.

- Свободно >4 GiB: наблюдаем источники роста; остановка или очистка только из-за диска не требуются.
- Свободно <=4 GiB: предупреждение и диагностика.
- Свободно <=2 GiB: безопасный checkpoint, остановка своих агентов, разбор; очистка только разрешённая, при необходимости перезапуск.
- Заведомо не начинать операцию, единичный ожидаемый пик которой исчерпает диск. Перед будущим разрешённым тяжёлым пакетом нужна свежая оценка фактического места и ожидаемого пика по этому правилу.

Переданный замер Lead на 20:13 UTC: C=10.281738 GiB (11039932416 bytes), D=16.316677 (17519898624), E=48.53587 (52114993152). Это чужой датированный замер, не новая собственная проверка. Прежний плановый C-пик арт-пакета 1.525 GiB не уменьшен; снят только прежний disk STOP независимого P2 imagegen/арт-пакета. Asset Artist возобновлён Lead на один собственный transparent rasterball со self-review и manifest; Builder этот пакет не запускает.

Temp/cache/output/staging/archive остаются только в `E:/R4D/perspective/p2-runtime` с process-local параметрами. Активные C-ссылки сохраняем; CODEX_HOME не переносим, глобальные настройки, Windows watchdog и фоновые задачи не создаём. Ради старого порога 10 GiB ничего не чистим.

Отдельный generic tool-policy rejection `call_7b166cdf46834d468b5f9c297aad6e9f` не разблокирован. Повтор, дробление, смена runner/сессии/launcher или другой способ запуска сервера/браузера запрещены. Не сканировать и не перечитывать чувствительные allowlists/config/tool-output, не менять security/credentials. Для фиксации этого обновления такие чтения не выполнялись.

Последнее поручение Builder — узкий SOURCE-ONLY handoff: закончить данные Artist v2 для существующего generic consumer и доставить commit, без runtime. Разрешены текстовые изменения через apply_patch, точное копирование готовых PNG, read-only сравнение данных и Git diff/status/commit/push. Runtime, повтор, prepare/serve/selfcheck, install/build, симуляции, тесты/QA, сервер/браузер и другой runtime-процесс запрещены. P3–P6, другие доски, публикация/deploy закрыты. Старые планы запуска ниже не являются разрешением; одинаковые пинги и повторные disk-check в цикле не выполняются.

## Source-only пакет Jungle art v2

Lead input HEAD `5b4b015dcdf5c8553ec348976698c07186989551`, Artist exact `080bdc62bd547b40b688b555e429ba88dcd31e23`. Один новый source-каталог: `experiments/p2-free-approach/builder/source-packets/jungle-art-v2/`. Единственный manifest будущего просмотра — `manifest.json` в этом каталоге, generic schema `r4d.p2.assets.v1`, status SOURCE_READY_RUNTIME_UNVERIFIED. Рядом лежат точные `ball-v2.png` и `shadow-native-disc-v1.png`; отдельного staging нет. Размеры, SHA256, поля и ограничения находятся в README пакета.

Ball: centerPx [627,629.5], diameterPx830.5, canvas [1254,1254], bytes851662. Shadow: center [64,64], footprint [96,96], nativeRadii [1.15,1.15], offset [-8,+14], opacity1 с исходной PNG alpha. Перенесены ровно четыре прежних source-полигона/sourceRect/anchors/native-depth. Существующий `src/main.mjs` не менялся; его blob совпадает с exact Lead input. Физика, config и проекция не менялись; private core для этого поручения не читался и не копировался.

Выполнено только сравнение bytes/SHA256, PNG IHDR-размеров, значений полей и относительных ссылок. Первое строковое сравнение JSON остановилось на эквивалентных числах 627 и 627.0; последующее числовое сравнение подтвердило равенство без изменения данных. Это не runtime, selfcheck или QA PASS. Сцена не просмотрена. Runtime-запрет остаётся самостоятельной границей и не мешает сдаче этого data-only пакета.

Старый `prepare-artist-probe.mjs` (blob `2131d11b656c3137a4444927f76ccdac49d87a15`), старый diagnostic manifest (SHA256 `e49f5fa1287e23956414c9629ae57ec940eed906009b630c12e6c955fc07a894`) и runtime-packet-01 не изменены. Их история не объявляется проверенным артом.

Один read-only замер перед копированием малого готового пакета: C7.905743/D16.312515/E48.35675 GiB. Для source-файлов менее 1 MiB это не исчерпывает диск; прежний резерв 10 GiB не применялся. Активные C-original не трогались. После доставки нового source-only commit остановиться; новый запуск не поручен. Actual turn ID текущего handoff не показан интерфейсом, Lead может подтвердить его через wait_threads.

## История прежнего disk STOP: условие >=10 GiB недействующее

Перед намеченным npm-пакетом свежий guard получил C=11.409657 GiB, D=16.317471, E=48.862328. Согласованный общий пик C=1.415, D=0.25, E=5.5 оставляет C=9.994657 GiB < 10. Команда остановилась до mkdir/install/npm view. Lead принял и эскалировал CTO. Повторять guard в цикле и запускать install/build без нового основания нельзя.

Решение кода уменьшает необходимость в установке: используем уже существующий PixiJS и native type stripping в Node 24. Это не отменяет остановку ресурсов и не снижает согласованный бюджет истории.

Следующий шаг после нового основания Lead/CTO: свежий проходящий guard для конкретного пакета, запустить локальный сервер, получить кадры контактов. Лёгкий native selfcheck уже выполнен, результат ниже. Ассеты передаются отдельным manifest без правок worktree Artist. Приватные исходники, карты и credentials в tracked файлы не добавлять.

## История малого стыка и настоящей самопроверки основы

Artist exact `fc892908d54cd06a44eb785edea4a9c5b32e3c97` прочитан адресно из Git. Его commit не cherry-picked и ветка Artist не изменена. Adapter подготовил `E:/R4D/perspective/p2-runtime/output/builder/artist-probe-v1/manifest.json` и проверенную SHA256 отдельную тень. Четыре объекта: flower-01, leaf-01, frog-01, wood-01. Их exact source-полигоны ограничивают текстуру исходника; native-depth совпадает с config. Все видимые поверхности этих четырёх объектов исключены из слоя тени. Шар пока диагностический, финальной генерации нет.

`selfcheck.mjs` запущен как лёгкая проверка в Node 24: без установки/сборки/сервера/браузера, type stripping в памяти; process-local TEMP/TMP и NODE_COMPILE_CACHE направлены в runtime на E. Отчёт 10.4 KB: `E:/R4D/perspective/p2-runtime/output/builder/selfcheck.json`.

Пройдены: точный native HEAD/неизменённость пакета, байты четырёх P1 inputs, controller/native headless, seeded replay у контактов, single/bulk tick, различие траекторий, неизменность base config и проекция/inverse (максимальная ошибка 7.28e-12 native).

Заранее выбранные seed1/2 без отбора: seed1 — LOST, tick1735, 14 контактов; seed2 — LOST, tick1290, 11 контактов. Первый контакт обоих — leaf-01, post-step tick95 (native event tick94); далее расходятся. Оба LOST — наблюдение этих запусков, не доказанный дефект входа и не повод менять config. Обычные случайные UI-броски, чтение кадров, перекрытия, sidecontact и корзина ещё не проверены.

Ранее намеченный, сейчас не разрешённый шаг: сервер с подготовленным manifest, кадры tick94/95/96 и последующие wood-01 sidecontacts; наблюдать настоящий переход, не расширять контуры сверх четырёх до результата. Повторять уже пройденную native-проверку без причины не нужно. Действующие ограничения находятся выше.

## Первый ограниченный runtime-пакет: запуск не состоялся

Подготовительный code HEAD `3ef8d06754b14d3c612a2252899e007d5e387966`; actual turn ID `01a17e78-f586-7ff3-902c-c6f50c1e8acd`. Инструмент `functions.exec -> exec_command` отклонил CreateProcess до выполнения всей команды; call `call_7b166cdf46834d468b5f9c297aad6e9f`, дословная причина `blocked by policy`. Дополнительная причина не указана. Повтора и альтернативного запуска не было.

E-config/flags были только подготовлены. Фактические env/profile/cache процесса не подтверждены; guard внутри отвергнутой команды не выполнился. Сервер, браузер и PID отсутствуют; PNG=0, runtime log bytes=0. Визуальный стык не наблюдался. Отчёт с отдельными read-only замерами после отказа, размерами файлов и ограничениями атрибуции: `E:/R4D/perspective/p2-runtime/output/builder/runtime-packet-01/REPORT.json`. Этот исторический отчёт не перечитывался и не изменялся при текущем обновлении условий.

## Существенные события

- GitHub Playbook exact ref вернул 404 при этапе 1: прочитан разрешённый Staff fallback на `e9dfa0e32226e3f72de1f75e5c77a43d5ebfd9b3`.
- Первое обращение `rg` к каталогу P2 показало, что каталога ещё не было; каталог создан только внутри собственного builder-поручения.
- Heavy guard отклонил первый пакет; установка/сборка не начинались. Глобальные настройки и cleanup не выполнялись.
- Подготовлены только config/manifest/projection/transform принятого P1, собственные контроллер/UI/server/selfcheck и контракт Artist. Кодовый checkpoint передаётся как непроверенная основа.
- Кодовый checkpoint `a5cac8f7edda7aa2c7e21cafa12a27eaef9a7477` сохранён и pushed; далее добавлен адресный стык малого пакета Artist и выполнена описанная лёгкая native-проверка.
- Ограниченный runtime-пакет отклонён инструментом до создания процесса; точный call и отсутствие фактического запуска сохранены выше.
- 27 октября получено новое правило диска (>4 / <=4 / <=2 GiB); старый guard отмечен как недействующий и оставлен историей. Отдельный tool-policy запрет сохранён. Выполнено только обновление state, без runtime/QA, нового disk-check, cleanup или изменения безопасности.
- Получен узкий SOURCE-ONLY handoff по готовому Artist v2: создан один versioned generic manifest с точными PNG, только сравнение данных. Старые diagnostic пакет/скрипт и consumer сохранены; runtime, тесты/QA, сервер/браузер не запускались.
- 28 октября новое производственное поручение открыло standalone static build P2 и последующий release только после exact gate; старый отклонённый launcher сохраняет отдельный запрет. Подготовлены route-relative resources и JSON download без POST, отдельный build/check static artifact; внешних записей нет.
