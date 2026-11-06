# Q3C — рабочее состояние команды

Обновлено: 7 ноября 2026, Europe/Kiev. Владелец записи: `lead-r4d-q3c-01`.

## Основание и текущая граница

Единственный канон обязательств — [заказ Q3C, редакция 2](../../orders/animation/Q3C-victorian-mantis.md), [передача CTO](../../work/requests/Q3C_CTO_HANDOFF.md). Подтверждённая входная версия: `cf74ad2ca64fe738de327ae50641b42085b4d460`; исходная передача `ab7cfda6`, обязательные уточнения `3c5c2e7b` и `cf74ad2c` учтены. Эта запись хранит факты исполнения, не заменяет карточку.

**`WIP_PROGRESS_PACKAGE_OWNER_COMMITS_PENDING`.** 7 ноября 2026 CTO передал новое прямое поручение Max публиковать готовые материалы в Review. Первый ограниченный пакет: три концепт-листа и `q3c-slice-01`, а также законченный текущий Asset handoff в Git. Это публичный WIP/progress slice, **не CTO acceptance полного Q3C**. Полный богомол, ходьба, мотылёк и захват ещё не заявляются; основной заказ продолжается после выпуска. Повторное подтверждение Dot/идеи/плана не требуется.

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

Все относительные области таблицы находятся в `experiments/q3c-victorian-mantis/`. Области синхронизированы с текущими пакетами CTO: Concept сам перенёс готовый пакет в `design/concept/`, Asset — в `design/asset-handoff/`. Другие сотрудники и прежняя Q3/Q3B команда не назначены. Передача прав на файл возможна только явно через Lead; параллельных писателей одной области нет. Lead разрешает обеим QA-ролям писать evidence/замечания только в свои непересекающиеся `qa/technical/**` и `qa/visual/**`; продукт остаётся read-only. Owner commits разрешены только по последовательности и спискам ниже; QA пока не выполняют commit/push.

## Поставка первого публичного WIP: точные списки и Git-слоты

Сверка 7 ноября 2026, около 00:32 Europe/Kiev: `git fetch origin main` успешен; `HEAD = origin/main = 189580f27d74a316e05eee0527f8c41b5769e20e`, index пуст. Чужой WIP остаётся на месте. CTO уже выдал текущие delivery turns Concept, Builder и обеим QA-ролям; Lead не создаёт повторных turns.

**Разрешение Lead на последовательные owner commits/push.** Каждый слот начинается только после push предыдущего и при отсутствии чужого staged/index-lock. Проверять `git diff --cached --name-only` и exact staged diff; не использовать `git add .`, reset/stash/clean. Не stage generated-файлы даже при неполном ignore. Слоты:

0. **Lead:** только `STATE.md`, `PRODUCTION_PLAN.md`, раздел Q3C `docs/PROJECT_STATE.md`. Остальные слоты ждут доставки этой записи в `origin/main` и чистого diff этих трёх путей; runtime/art Lead не меняет.
1. **Concept Artist:** commit/push законченного пакета по семи exact путям ниже. После своего push не начинает новую художественную итерацию в замороженном пакете.
2. **Builder:** после Concept push добавляет узкий локальный `.gitignore` и commit/push ровно одиннадцати runtime/test путей ниже. Разрешение касается замороженного `q3c-slice-01`; новых стадий сейчас не добавлять.
3. **Asset Artist:** после Builder push, если текущий ограниченный handoff завершён и заморожен, commit/push двух exact путей ниже. Будущего чистового арта не ждать. Незавершённую работу не выдавать законченной.
4. **Lead:** сверяет реальные commits и передаёт обеим QA один exact совокупный candidate. До появления SHA строка `QA_CANDIDATE_PENDING` не является выдачей на изменяемый HEAD. QA проверяют только указанный SHA, не меняют продукт.

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

**`QA_CANDIDATE_PENDING`:** owner commits ещё не проверены Lead. Точный QA SHA и даты последуют в этой записи после последовательных push. Scoped review: первый пользовательский ввод pointer/touch/keyboard → маячок → падение/контакт → открытие люков/четыре постоянные лапы/тот же глаз → живой idle и взгляд, перезапуск, desktop/mobile, наблюдаемые easing/overlap/settle. Мотылёк, ходьба и богомол помечаются как отсутствующие следующие этапы, а не PASS/дефекты заявленного среза. Художественный PASS полной сцены не выставляется.

Запуск по передаче Builder: `npm ci`, `npm test`, `npm run build`, `npm run dev` из каталога Q3C; `http://127.0.0.1:4187/`, для воспроизводимого разбора `?seed=42&paused=1`; read-only API/границы — `tests/QA_HOOKS.md`. Для live QA использовать обычный темп и реальные вводы, debug seek не заменяет просмотр.

## Фактические task turn IDs

Первый продуктовый запуск выполнен CTO, начало — 7 ноября 2026 около 00:08 Europe/Kiev. Это не onboarding turn IDs.

| Роль | Stage 2 task turn ID | Проверенный факт |
| --- | --- | --- |
| Lead | `01a1b2e7-f327-7581-9f4a-dcf833e0c711` | Стартовые документы commit/push `192b6731ff3f9564b7a9a3b3069da45f25b19d0c` |
| Concept Artist | `01a1b2e7-f67e-7831-8692-2aeb2b1f550c` | Anchor сохранён, mapping/промежуточные позы в работе |
| Asset Artist | `01a1b2e7-fb0c-7413-b0a4-385b563eaa59` | Anchor просмотрен; конструкция частей/укладка в работе |
| Builder | `01a1b2e7-ff3d-7aa1-9878-f184132b46ac` | Создаются отдельные product files; запускаемый slice ещё не передан |
| Technical QA | `01a1b2e8-02d6-7e12-98ba-d40df891a3a8` | Первый read-only пакет завершён: `READY_FOR_FIRST_SLICE`, продуктовый PASS не выставлен |
| Visual QA | `01a1b2e8-073d-78f0-ac93-ebe2cba53c3f` | Первая независимая линза готова |
| Visual QA, anchor review | `01a1b2ec-20cd-7210-9fe9-d4a0e57902a1` | Направление PASS; связность трансформации HOLD до живого результата |

## Текущие пакеты и следующий шаг

[Рабочий подход A–E](PRODUCTION_PLAN.md) принят CTO. Первый наблюдаемый результат — `design/concept/01-capsule-mantis-anchor-v1.png`, 2 179 433 байта; Lead просмотрел его. Теперь Concept package содержит три законченных листа и внутренние исходники. Это целевой внутренний образ, не готовый runtime asset и не доказательство полной трансформации. Независимый Visual QA подтвердил направление; полный путь груди/головы/крупных лап, перекрытия и опорный вес остаются предметом будущей живой проверки.

Builder передал первый construction candidate `q3c-slice-01` и `tests/QA_HOOKS.md`, сохранил свою самопроверку вне product списка. Независимый scoped review ждёт exact commit. Asset подготовил документ и численную схему хватательного пакета; завершение текущего handoff проверяется отдельно, будущих чистовых частей в пакете нет.

Оценка CTO: art anchor вместе с запускаемым slice — через 60–90 минут активной работы; после первого live pass переоценить полный объём. Ожидание доставки, tool failures и активную работу различать. Искусственного лимита художественных коррекций нет. Слабый результат не закрывается как known limitation.

Следующий шаг: последовательные owner commits по слотам выше → exact candidate обеим QA → сгруппированные замечания/коррекции → штатная поставка готового ограниченного пакета CTO. Выпуск промежуточного пакета не завершает основной Q3C и не снимает будущие художественные обязательства. Live Review URL и продуктовый PASS полного Q3C пока отсутствуют.

Коммуникационная граница инструмента: поручение другого чата само по себе не разрешает `send_message_to_thread`. На текущем шаге Lead никому не отправлял межчатовых сообщений; существующие пакеты уже выдал CTO. Результаты доступны в этих файлах и final текущего turn для передачи CTO. Не создавать повторные задания ради обхода этой границы.
