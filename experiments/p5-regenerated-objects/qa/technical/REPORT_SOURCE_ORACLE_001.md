# P5 Technical QA — независимый общий вход и native oracle, 001

Дата: 29 октября 2026, Europe/Kyiv; исполнение oracle 28 октября 22:23:28–22:23:32 UTC.

Первый материальный результат Stage 2 выполнен. Подтверждены точные общие входы, материализация штатного ядра и числовая согласованность проекции. **Это не technical/artistic PASS P5 и не проверка consumer в браузере.** Реальный кандидат, generated mini-set и frozen build ещё не переданы этой QA-сессии.

## Полномочия и источники

- Адресный Stage 2 от Lead после публикации P4; полностью прочитана карточка `5ae51fa0342689cb0ad4b5b5d5681ddc16b60e81:experiments/p5-regenerated-objects/coordination/STAGE2.md`.
- Неизменяемый заказ: R4D `64061757802dc60770ab156ef5672af741d65d03`, `orders/perspective/ORDER.md` редакция 4 и `P5-regenerated-objects.md`; инструкции роли полностью прочитаны в Stage 1.
- Прочитано основание продолжения `64061757802dc60770ab156ef5672af741d65d03:work/requests/PERSPECTIVE_POST_P1_UPDATE.md`.
- Staff `e9dfa0e32226e3f72de1f75e5c77a43d5ebfd9b3`; Playbook `c32f3ee79ca73c1bf87e8ee6a9c0844252568f3e`, blob `d3066526699a9a21fb8e8e5806958fbd105c8cf2` — полностью прочитаны и Playbook hash проверен в Stage 1.
- Полностью прочитан разрешённый P0 recipe `ee4d8e5c7dbb3b6618d58d6dacb0caf9b73dfb1b:experiments/p0-perspective/research/CROSS_SERIES_CONCLUSION_AND_RECIPE.md`.
- Собственная ветка `codex/r4d-p5-regenerated-technical-qa-01`, base `64061757802dc60770ab156ef5672af741d65d03`; cwd всех команд `E:/R4D/perspective/p5-worktrees/technical-qa`. UI service cwd `C:/Users/user/Documents/ChatGPT/r4d` не использовался как checkout.
- Host `WIN-36E9FF9EJM0`. Фактический `gpt-6.1-sol/xhigh` подтверждён Director через turn_context согласно адресному Stage 2; самостоятельно настройки не менялись.

## Побайтовые проверки

Read-only `K:/Agents/R4D/Assets/perspective/01-jungle.jpg`: 671136 bytes, JPEG SOF 1536×1536; SHA256 `c8f9e4245c1de8c2086e615bc75dc10aea59b76b614d6e106593e07262e24f72`. Изображение прочитано для хеша/размера, визуальная оценка исходника этим не заявляется.

Accepted P1 `4b47db04c7140ebf88f69b91faa0b790d46f22ec`; prefix `experiments/p1-collider-mapping/clean-repeat-01/`. Проверены raw Git bytes, без нормализации перевода строк:

| Файл после prefix | Bytes | SHA256 |
| --- | ---: | --- |
| `simulation/boards/01/trial-01/config.json` | 9503 | `dd5c519cd6d4b7295118e0a3a1063efed424a0ce739450bd5153c6a9941982db` |
| `simulation/boards/01/trial-01/manifest.json` | 11565 | `7784dc0a215d0e472cf06a4eee03793592727cf0fa9a1fa0e0c78e5f1d17da18` |
| `simulation/projection.mjs` | 614 | `b59a0c1e6c34b417d253178457ef3580b8bea0aa89c989d1342f9376e19b9431` |
| `viewer/src/view-math.mjs` | 3050 | `96f01cc2093c353ff958cb906fe0c8ae93412425d0f7a5ec7cca0f2bf9f1aa5e` |

Private Millionko `5a6fa03f1cdb3de88a2d9c7dbe795eb8e2a7f023`, `packages/sim-core` tree `008d16a80a26bb77d562a45218b01da09b0d9ff0`. Все 37 файлов экспортированы через `git show` только в собственный private runtime. Каждый экспорт проверен по Git blob; полное дерево независимо восстановлено из содержимого, имён и modes и совпало с exact tree. Исходный checkout не переключался и не изменялся.

Для запуска штатного кода использован уже доступный TypeScript 5.9.3, Node v24.15.0. `typescript.js` SHA256 `3ae902c92cc44dace175c0e69e13a4b0899f6983c6121d76b9ab8dd5795e7675`. Выполнено только локальное транспилирование exact TS в отдельный private каталог: без правок ядра, source maps, установки зависимостей и публикации private исходников. Это не typecheck, не consumer build и не проверка будущего dependency lockfile P5.

## Подтверждённые проверки

Штатный `validateConfig` вернул ноль ошибок. Проверены 25 pins / 16 segments / 4 buckets / 1 drop; ball r16, tick5ms, quantize7, gravity980, max speed2000, angle deviation2°, bounce deviation0.02, wallBounce1, lcg32. Общие поля/start не менялись; для каждого запуска изменялся только разрешённый seed в собственной копии config.

Проекция: 1922 точки, включая centres/footprints, сегменты, старт и четыре угла исходника. Максимальная round-trip ошибка `1.627e-11` native units; расхождение двух exact P1 API `0` source px; ошибка углов `5.212e-12` source px. Минимальный проверенный знаменатель `0.8193213851`, горизонт на этих точках не пересекается. Native translation `[33256,34072]` сохранён. Source anchor старта `(770,321)`.

Проекция ground-круга r16 на старте даёт примерно `28.148×13.123` source px; на проверенных anchors ширина `28.148–36.642`, высота `13.123–22.237` px. Это размер проекции footprint, **не** требование сплющить видимый растровый шарик и **не** проверка его художественного размера.

Заранее зафиксированы seeds `0,1,2,3`: default и следующие последовательные значения, без поиска удачного пути. Это oracle seeds, пока не seeds, наблюдавшиеся через обычное действие P5 UI.

| Seed | Терминальный state tick | Результат native | Контакты pin/segment | SHA256 полного trace |
| ---: | ---: | --- | ---: | --- |
| 0 | 1956 | `IN_BUCKET receiver-03` | 22 | `971c4b1c96f9e8aa271161fe31025cb776d7ad830dae5758cb54e01c77c8a572` |
| 1 | 1735 | `LOST` | 14 | `6e7b112ec57fd6ca2059d1e6ff02587976604e36ecf57eee0aec9f87cd6e9f83` |
| 2 | 1290 | `LOST` | 11 | `fb8797f3c6e14834a1c2454fe6803b050a5b0d58b9ccef9285ad9ac1eaa23424` |
| 3 | 2887 | `LOST` | 30 | `a59e85110632ab5fb05221653902067de4b0d06d9ad826dd9725ee962ddc1252` |

Каждый trace и event sequence повторился точно. Различаются именно позиции, а не только поле RNG. Один адресный контроль seed0 подтвердил совпадение observer/no-observer и согласие пошагового oracle с native `runUntilDone`. Полную матрицу не повторять без значимой дельты.

## Полезные условия интеграции для Lead/Builder

Это факты exact native, а не обнаруженные дефекты ещё не полученного consumer:

1. **Индексы контактов.** `object_hit` для pin/segment/wall использует tick до увеличения; event `t` соответствует переходу state `t → t+1`. Первый контакт всех четырёх seeds — `leaf-01`, event94, окно states94/95/96. RNG впервые изменился в state95. Для seed0 первый боковой контакт `left-2`, event475, окно475/476/477. Bucket event использует уже увеличенный tick. Сохранённые contact windows учитывают это различие; кадр нельзя обозначать одним неоднозначным event tick.
2. **Предел времени.** Native `stepSimRunSession` не применяет timeout автоматически. Consumer должен ограничить запуск 3200 тиками для этого exact config и вызвать штатный `timeoutSimRunSession`, если done ещё не наступил. Это подтверждено чтением exact source; timeout-ветка на четырёх обычных seeds не потребовалась и отдельным synthetic fixture не испытывалась.
3. **Корзина.** Штатное условие — строгое расстояние центра `< bucket.r`, без вычитания ball.r и без полного погружения спрайта. Seed0: перед входом distance29.5073539, на tick1956 distance24.9162688 при r28.5120755. Видимый край/передняя часть generated receiver должны проверяться отдельно в движении; numeric terminal не доказывает убедительного входа.
4. **Обычные проигрыши.** LOST seeds1–3 сохранены. Это реальные исходы exact общего config/native, сами по себе не доказательство дефекта маппинга или арта. Не менять drop, физику, buckets или препятствия ради превращения их в красивые выигрыши.

## Evidence и повтор

Скрипт: `experiments/p5-regenerated-objects/qa/technical/source-oracle.mjs`, 18855 bytes; SHA256 `7159d8667099e4839ff72fb235fa27cf0af4e91b137ae550f758e368aa169f64`.

Всё raw/private evidence находится только в `E:/R4D/perspective/p5-runtime/technical-qa/source-oracle-001/`:

| Файл | Bytes | SHA256 |
| --- | ---: | --- |
| `source-oracle-summary.json` | 16182 | `da292a8f29edd332152d238f1e631b7d37253da0be875f72880c131c92af92d1` |
| `projection-oracle.json` | 6289 | `7d5b593b9cc7795239c7b2e6f93f14a5818a02f2bde98a4097d1f2456e0bd968` |
| `resource-before.json` | 558 | `1536b991ff15d14c15dd5675d349e202d499a3abbe6e831c2a0f8cf0fbdedbec` |
| `resource-after.json` | 484 | `db4d93b7df6a3cc81747c08514b8f6782cd61633e59367cf838fc48b56d0003c` |

`checkpoint-index.json` SHA256 `0f9de629046c84c1789aa84e7784e6b09710694dc1915a0c39539ff01460a114` связывает этот генератор, итоговые файлы, private source/compiled inventories и per-seed `states.ndjson`, `events.json`, `contact-windows.json` с exact bytes/SHA256. Native/source/maps/full dumps в Git не передаются. Read-only handoff для Lead — этот private путь и index hash.

Повтор возможен только при реальном сомнении: задать process-local TEMP/TMP в собственном E runtime, выполнить `node experiments/p5-regenerated-objects/qa/technical/source-oracle.mjs source-oracle-002`. Старый run не перезаписывать. Новый timestamp/toolchain должен быть явно отделён от trace hashes. Скрипт самостоятельно делает fresh systemwide guard до материализации.

## Ресурсы и границы

До запуска: free RAM16.463/31.907 GiB, aggregate working sets19.233 GiB (сумма с возможными shared pages, не unique RAM), 436 процессов, CPU0%; C17.094 / D16.282 / E12.200 GiB. Заложенный пик своей проверки0.5 GiB RAM/0.05 GiB E плюс allowance другим4 GiB RAM/2 GiB E. После: RAM16.340 GiB, CPU2%, E12.198 GiB; Node peak RSS156.99 MiB. Материалы run занимали1629452 bytes до добавления checkpoint index. Пороги E4/2 GiB не достигнуты.

TEMP/TMP/npm cache заданы только process-local в собственном E runtime. Порт, браузер и сервер не запускались; живых собственных процессов после oracle нет. Чужие worktree/PID/devices, dirty D:/dev/R4D, глобальные настройки/credentials не менялись. Denial и ordinary failures не было; запрещённый исторический composite и его обходы не выполнялись.

**Пока unverified:** consumer commit/schema/dep pins, generated assets/anchors/alpha, реальное Pixi/browser движение, обычные UI seeds, pause/step/replay, неизменность state/RNG при Art/Geometry/view, геометрия поверх арта, отключение invisible masks, видимые контакты/side bounce/empty-air bounce/partial occlusion, receiver/draw order, frozen package/privacy и release. Никакого PASS этих пунктов по oracle не заявляется.

Следующий адресный вход нужен от Lead: exact consumer/manifest/build/config/projection/native/dep pins и owner session/PID/URL/root реального мини-набора либо разрешение своего localhost на переданном пакете. После этого — ранняя actual runtime проверка; затем отдельно exact frozen candidate. Продуктовых исправлений QA не вносит. Сообщения другим чатам не отправлялись; Lead получает результат через final/snapshot.
