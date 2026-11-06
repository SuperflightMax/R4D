# Q3C — рабочее состояние команды

Обновлено: 7 ноября 2026, Europe/Kiev. Владелец записи: `lead-r4d-q3c-01`.

## Основание и текущая граница

Единственный канон обязательств — [заказ Q3C, редакция 2](../../orders/animation/Q3C-victorian-mantis.md), [передача CTO](../../work/requests/Q3C_CTO_HANDOFF.md). Подтверждённая входная версия: `cf74ad2ca64fe738de327ae50641b42085b4d460`; исходная передача `ab7cfda6`, обязательные уточнения `3c5c2e7b` и `cf74ad2c` учтены. Эта запись хранит факты исполнения, не заменяет карточку.

**`WIP_PROGRESS_SLICE_01_SCOPED_QA_HOLD_CORRECTION_REQUIRED`.** Первый пакет исходников и обе независимые QA-проверки доставлены в Git. Exact проверенный кандидат `c79af101d944c121d9dc6b7e203d393a45baf8e5` пока не готов к выпуску: TQ-01 и VQ-01 подтверждены. CTO прямо поручил узкую коррекцию только этих двух release-blockers единственному Builder, затем новый pin и targeted recheck обеих QA-ролей. Разрешённая публикация остаётся публичным WIP/progress slice, **не CTO acceptance полного Q3C**. Полный богомол, ходьба, мотылёк и захват ещё не заявляются; основной заказ продолжается после выпуска. Повторное подтверждение Dot/идеи/плана не требуется.

## Проверенная среда и сохранность

- Единственная рабочая копия: `D:\dev\R4D`, host `local`, машина `WIN-36E9FF9EJM0`, ветка `main`.
- `git fetch origin` выполнен; перед стартовыми изменениями `HEAD = origin/main = cf74ad2ca64fe738de327ae50641b42085b4d460`.
- По кадровому реестру у Q3C один Lead и один Builder; CTO дополнительно подтвердил отсутствие второго владельца по живым сессиям. Проверка фактических turns подтверждает ровно эту новую выделенную команду.
- У всех шести сотрудников подтверждён `gpt-6.1-sol` / `xhigh`. Lead проверил свои фактические параметры по метаданным текущей сессии.
- Чужой WIP сохранён: изменённые `work/JOURNAL.md`, `work/agents/cto-r4d-01.md`, untracked Q3B, browser outputs и другие материалы не включаются в наши commits. Reset/stash/clean не применяются.
- Q3/Q3B frozen. Queue A, perspective, Millionko, UGH, Imagen и локальная image-инфраструктура вне поручения. Прежняя фраза про VPS относилась к пульту: общего запрета на VPS/Review нет. Текущий Lead координирует Git/QA первого готового пакета; это не самостоятельное разрешение менять сервер вне штатной выдачи CTO.

## Команда и владение

| Роль / staff_id | Существующая сессия | Единственная область записи |
| --- | --- | --- |
| Lead `lead-r4d-q3c-01` | `01a1b2db-b4d2-7730-bdd6-62b1fef5fe77` | Этот `STATE.md`, `PRODUCTION_PLAN.md`, только раздел Q3C в `docs/PROJECT_STATE.md`; координация без product source |
| Concept Artist / art direction `concept-artist-r4d-q3c-01` | `01a1b2dd-d6a8-70b1-b4b8-ac2a27324379` | `design/concept/**` |
| Asset Artist `asset-artist-r4d-q3c-01` | `01a1b2dd-d683-7972-8a57-187e2046e43d` | `assets/**`, `design/asset-handoff/**` |
| Sole-writer Builder `builder-r4d-q3c-01` | `01a1b2dd-d69a-78a3-95f0-2484933f9f21` | `src/**`, `public/**`, `tests/**`, `index.html`, `package*.json`, `vite.config.js`, локальный `.gitignore` |
| Technical QA `technical-qa-r4d-q3c-01` | `01a1b2dd-d68e-7c11-ab2e-986d21056de2` | `qa/technical/**`; продукт только read-only |
| Независимый Visual QA `visual-qa-r4d-q3c-01` | `01a1b2dd-d67f-7d20-9f48-eb8919e4fbf1` | `qa/visual/**`; продукт только read-only |

Все относительные области таблицы находятся в `experiments/q3c-victorian-mantis/`. Области синхронизированы с текущими пакетами CTO: Concept сам перенёс готовый пакет в `design/concept/`, Asset — в `design/asset-handoff/`. Другие сотрудники и прежняя Q3/Q3B команда не назначены. Передача прав на файл возможна только явно через Lead; параллельных писателей одной области нет. QA пишут только свои непересекающиеся области; продукт остаётся read-only. Первый product/design chain выполнен по exact спискам ниже. QA report/evidence commits выполнены последовательно по отдельной выдаче CTO, исключительно в своих QA-путях; их browser evidence не входит в публичный payload.

## Доставленные версии и независимые отчёты

| Владелец / пакет | Commit SHA | Проверенный состав |
| --- | --- | --- |
| Lead, exact lists | `70f7e050ab7bb120ba58c783ae355fc4eb4a28f4` | Только три координационные записи |
| Concept | `53781d00ef3594f943031bb162958bdde6ad664d` | Ровно 7 согласованных design/concept файлов |
| Builder, q3c-slice-01 | `4e74d3718ca5be5992f9a28948107725b38b3081` | Ровно 11 согласованных runtime/test/ignore файлов |
| Asset / aggregate QA candidate | `c79af101d944c121d9dc6b7e203d393a45baf8e5` | Ровно 2 согласованных handoff/geometry файла |
| Technical QA | `730c7996aa5b908c9b24f674a1f25360d34fab9b` | Только qa/technical; [отчёт](qa/technical/slice-01/REPORT.md), SCOPED_FAIL, TQ-01 |
| Visual QA | `e3c2e097bea6116a3928c5c465e066522015d724` | Только qa/visual; [отчёт](qa/visual/REPORT_SLICE_01.md), HOLD, VQ-01 |

Lead сверил последовательность родителей и реальные path lists каждого product/design commit, push подтверждён. В этих product/design commits нет node_modules/dist/browser evidence. Оба QA commits добавляют только свою QA-область; product/design inputs по-прежнему совпадают с `c79af101`. Перед обновлением этой записи remote main подтверждён на `e3c2e097bea6116a3928c5c465e066522015d724`, index пуст. Source/prompts/скрипт подготовки сохранены в Git; их публичная поставка запрещена ниже.

Technical QA независимо подтвердил побайтное совпадение 22 файлов, чистую установку в QA-копии, 7/7 тестов, production build, основной desktop/touch путь, 2401 пошаговый снимок с постоянными звеньями/опорой, seed/input replay и отсутствие ошибок консоли. Общий esbuild был занят preview: QA использовал отдельную копию/порт 4194, не останавливая чужой сервер. Это не дефект продукта и не художественный PASS.

Visual QA просмотрел три concept PNG, desktop 1440×1000 и touch emulation 390×844/360×732 в обычном темпе с видео и промежуточными кадрами. Направление концептов проходит; падение/люки/четыре лапы/тот же глаз/idle и взгляд в просмотренном участке работают. Физический телефон и человеческое тестирование не заявляются. Полная художественная приёмка Q3C не проведена.

## Узкая correction C1 — выдача единственному Builder

Основание: прямое поручение CTO после scoped QA. Оба QA report commits выше уже доставлены; исходный runtime остаётся `4e74d371`, проверенный aggregate — `c79af101`. Рабочая база после QA — `e3c2e097bea6116a3928c5c465e066522015d724` либо её последующее изменение только этих координационных записей. После push этой записи Builder получает один пакет из двух дефектов; передачу в живой чат выполняет CTO.

1. **VQ-01:** на свежей загрузке и после «Заново» в 390×844 и 360×732, waiting/time=0, капсула уже видна и обрезана сверху; в 390×844 перекрывает подсказку. Исправить пустую начальную сцену с маячком, сохранить настоящий вход/падение сверху после активации. Не допустить нового popping/телепортации при первом движении. Проверить обе мобильные геометрии, desktop и перезапуск.
2. **TQ-01:** после обычного click/tap по «Заново» фокус остаётся на `#restart`; следующая `A` не активирует маячок вопреки подсказке. Исправить реальный keyboard restart path и проверить его без debug-паузы. Сохранить первый pointer/touch/keyboard старт и смысл кнопки перезапуска.

Runtime/product source и regression tests меняет только Builder в своей области. Нужны проверки обоих воспроизведений и сохранности текущего интро; тяжёлый новый тестовый framework не требуется. Concept/Asset frozen, будущих стадий и чистового арта в C1 не добавлять. Перед correction commit Builder возвращает фактический exact changed-path list и результаты self-check через CTO; Git-слот сериализуется с Lead, generated/browser evidence в runtime commit не входит.

После одного correction commit/push Lead сверяет diff и фиксирует **новый exact candidate**. Technical QA повторяет TQ-01 реальными вводами и короткий desktop/touch smoke; Visual QA повторяет VQ-01 на двух мобильных размерах, desktop/restart и непрерывный вход в падение. Обе роли проверяют связность с прежним неизменённым участком, продукт не чинят. Сумма первоначальных PASS не переносится автоматически на C1. До двух независимых scoped verdict и решения CTO live-switch не выполнять.

## Поставка первого публичного WIP: точные списки и Git-слоты

Сверка 7 ноября 2026, около 00:32 Europe/Kiev: `git fetch origin main` успешен; `HEAD = origin/main = 189580f27d74a316e05eee0527f8c41b5769e20e`, index пуст. Чужой WIP остаётся на месте. CTO уже выдал текущие delivery turns Concept, Builder и обеим QA-ролям; Lead не создаёт повторных turns.

**Разрешение Lead на последовательные owner commits/push.** Каждый слот начинается только после push предыдущего и при отсутствии чужого staged/index-lock. Проверять `git diff --cached --name-only` и exact staged diff; не использовать `git add .`, reset/stash/clean. Не stage generated-файлы даже при неполном ignore. Слоты:

0. **Lead:** только `STATE.md`, `PRODUCTION_PLAN.md`, раздел Q3C `docs/PROJECT_STATE.md`. Остальные слоты ждут доставки этой записи в `origin/main` и чистого diff этих трёх путей; runtime/art Lead не меняет.
1. **Concept Artist:** commit/push законченного пакета по семи exact путям ниже. После своего push не начинает новую художественную итерацию в замороженном пакете.
2. **Builder:** после Concept push добавляет узкий локальный `.gitignore` и commit/push ровно одиннадцати runtime/test путей ниже. Разрешение касается замороженного `q3c-slice-01`; новых стадий сейчас не добавлять.
3. **Asset Artist:** после Builder push, если текущий ограниченный handoff завершён и заморожен, commit/push двух exact путей ниже. Будущего чистового арта не ждать. Незавершённую работу не выдавать законченной.
4. **Lead:** сверил реальные commits и передал через CTO обеим QA exact aggregate `c79af101d944c121d9dc6b7e203d393a45baf8e5`. Первые слоты завершены; текущий следующий слот — C1 выше. QA проверяют только указанный SHA, не меняют продукт.

Все пути следующих списков относительны к каталогу Q3C.

Concept (7):
```
design/concept/01-capsule-mantis-anchor-v1.png
design/concept/02-transformation-keyposes-v1.png
design/concept/03-packing-and-mapping-v1.png
design/concept/03-packing-and-mapping-v1.svg
design/concept/ART_DIRECTION.md
design/concept/PROMPTS.md
design/concept/packing_diagram.py
```

Builder (11):
```
.gitignore
index.html
package.json
package-lock.json
vite.config.js
src/main.js
src/model.js
src/style.css
src/view.js
tests/model.test.js
tests/QA_HOOKS.md
```

Builder создаёт `.gitignore` для `node_modules/`, `dist/`, `tests/output/`, `tests/.playwright-cli/` и локального `.playwright-cli/`. Это housekeeping по прямому уточнению CTO. Сами generated paths, browser profiles, screenshots/CLI evidence в runtime commit не входят.

Asset (2, только завершённая ограниченная передача):
```
design/asset-handoff/ASSET_CONSTRUCTION.md
assets/rig/CONSTRUCTION_GEOMETRY.v1.json
```

**Публичная граница:** в Review идут только три PNG концептов из списка и сборка `q3c-slice-01` с кратким честным WIP-описанием. SVG, полный internal art-direction source, raw prompts, `packing_diagram.py`, численная rig-подготовка и browser evidence в публичную страницу не включаются. Их хранение в Git не означает разрешение публикации целиком исходного каталога. Отдельный визуальный уровень трёх листов не приписывается текущей construction geometry runtime.

**Первый проверенный QA candidate: `c79af101d944c121d9dc6b7e203d393a45baf8e5`; HOLD / SCOPED_FAIL.** Scoped review: первый пользовательский ввод pointer/touch/keyboard → маячок → падение/контакт → открытие люков/четыре постоянные лапы/тот же глаз → живой idle и взгляд, перезапуск, desktop/mobile, наблюдаемые easing/overlap/settle. Мотылёк, ходьба и богомол помечаются как отсутствующие следующие этапы, а не PASS/дефекты заявленного среза. Художественный PASS полной сцены не выставляется. Новый candidate появится после C1; текущий pin не объявляется исправленным.

Запуск по передаче Builder: `npm ci`, `npm test`, `npm run build`, `npm run dev` из каталога Q3C; `http://127.0.0.1:4187/`, для воспроизводимого разбора `?seed=42&paused=1`; read-only API/границы — `tests/QA_HOOKS.md`. Для live QA использовать обычный темп и реальные вводы, debug seek не заменяет просмотр.

## Фактические task turn IDs

Первый продуктовый запуск выполнен CTO, начало — 7 ноября 2026 около 00:08 Europe/Kiev. Это не onboarding turn IDs.

| Роль | Stage 2 task turn ID | Проверенный факт |
| --- | --- | --- |
| Lead | `01a1b2e7-f327-7581-9f4a-dcf833e0c711` | Стартовые документы commit/push `192b6731ff3f9564b7a9a3b3069da45f25b19d0c` |
| Concept Artist | `01a1b2e7-f67e-7831-8692-2aeb2b1f550c` | Пакет завершён, доставлен в 53781d00 |
| Asset Artist | `01a1b2e7-fb0c-7413-b0a4-385b563eaa59` | Ограниченный handoff завершён, доставлен в c79af101 |
| Builder | `01a1b2e7-ff3d-7aa1-9878-f184132b46ac` | Первый construction slice доставлен в 4e74d371; исправления ещё не приняты |
| Technical QA | `01a1b2e8-02d6-7e12-98ba-d40df891a3a8` | Первый read-only пакет завершён: `READY_FOR_FIRST_SLICE`, продуктовый PASS не выставлен |
| Visual QA | `01a1b2e8-073d-78f0-ac93-ebe2cba53c3f` | Первая независимая линза готова |
| Visual QA, anchor review | `01a1b2ec-20cd-7210-9fe9-d4a0e57902a1` | Направление PASS; связность трансформации HOLD до живого результата |
| Concept delivery | `01a1b2fc-f74f-74f2-bcb6-b77802d9b0ce` | Exact 7 paths, push 53781d00 |
| Builder delivery | `01a1b2fc-dd7a-72a0-87b5-9e25d684d8e7` | Exact 11 paths, push 4e74d371 |
| Asset delivery | `01a1b306-49ba-7fb3-abcf-690c61678746` | Exact 2 paths, push c79af101 |
| Independent Technical QA | `01a1b307-d2b1-7c20-8ec9-3097687058fa` | SCOPED_FAIL, report commit 730c7996 |
| Independent Visual QA | `01a1b2fc-e0a9-7ce1-8593-2cb7c86e72e5` | HOLD, report commit e3c2e097 |

## Текущие пакеты и следующий шаг

[Рабочий подход A–E](PRODUCTION_PLAN.md) принят CTO. Первый наблюдаемый результат — `design/concept/01-capsule-mantis-anchor-v1.png`, 2 179 433 байта; Lead просмотрел его. Теперь Concept package содержит три законченных листа и внутренние исходники. Это целевой внутренний образ, не готовый runtime asset и не доказательство полной трансформации. Независимый Visual QA подтвердил направление; полный путь груди/головы/крупных лап, перекрытия и опорный вес остаются предметом будущей живой проверки.

Builder передал `q3c-slice-01` и `tests/QA_HOOKS.md`; независимый scoped review завершён с двумя указанными release-blockers. Asset handoff и численная схема доставлены; будущих чистовых частей в пакете нет. Исправления C1 ещё не проверены и не принимаются как готовые по этому состоянию.

Оценка CTO: art anchor вместе с запускаемым slice — через 60–90 минут активной работы; после первого live pass переоценить полный объём. Ожидание доставки, tool failures и активную работу различать. Искусственного лимита художественных коррекций нет. Слабый результат не закрывается как known limitation.

Следующий шаг: C1 sole-writer Builder → exact changed paths и correction commit → новый pin обеим независимым QA для targeted recheck → решение CTO о WIP-выпуске. Выпуск промежуточного пакета не завершает основной Q3C и не снимает будущие художественные обязательства. Live Review URL и продуктовый PASS полного Q3C пока отсутствуют.

Живую межчатовую передачу текущей поставки выполняет CTO; Lead ведёт согласование в этом состоянии и сверяет фактические turns/commits. Этот маршрут уже работает; повторных кадровых/производственных заданий ради передачи не создавать.
