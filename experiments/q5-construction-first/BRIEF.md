# Q5 — конструкция до внешности

Production разрешён Director после public Q4 https://superflight.space/review/r4d/q4-whole-character/ . Lead lead-r4d-q5-gpt61-01, thread 01a16974-8019-7a70-852a-161d2611cbc2; CTO cto-r4d-01, thread 01a1653d-1c24-7991-a16b-619bc964ca40. Cwd всех D:\dev\R4D, gpt-6.1-sol / medium. Fetch origin/main 412030fd83e6ddfd010811d2c11e0f8ee7af7f45. Никаких новых чатов/subagents/worktree/clones.

## Вопрос и порядок

Помогает ли достаточная конструкция, подготовленная до final art, получить художественный комплект под известные движения? Один полный персонаж/образ и один полный проход. Без Textoon, Live2D, обучения моделей и Q6. Новые коррекции только по отдельному разрешению CTO на одну точную.

1. Builder вместе с Artist выбирают простую достаточную конструкцию. Builder — единственный редактор CONSTRUCTION.md и construction/; Artist пишет coordination/artist-construction.md с требованиями и подтверждением. До генерации должны существовать устройство персонажа, joints/parenting/pivots, placement и формы графических частей, слои/перекрытия/скрытые поверхности, исходные и крайние позы и необходимые движения. Пригодный existing rig допустим; заимствование отметить. Техническая болванка допустима как конструкция, не как финальный арт.
2. Builder сохраняет неизменяемый construction/v1/ и хеши. Artist подтверждает достаточность и способ передачи ограничений генератору. Lead фиксирует CONSTRUCTION_FREEZE.md до первой генерации. До этого никакой генерации финального look/parts.
3. Artist генерирует appearance/details под зафиксированную конструкцию. Один look достаточен. Сохранить prompt/tool/results, входную конструкцию, источники/части и операции подготовки, соответствие каждой части конструкции. Не выдавать простые программные фигуры за конечный художественный растр.
4. Раннее соединение настоящей цепи/части с её движением Artist+Builder; затем полный комплект и единый механизм. Если генерация требует менять конструкцию, не переписывать v1: сохранить before/after, причину и влияние в CONSTRUCTION_CHANGES.md. Это результат опыта, а не скрытая правка. Изменение не разрешает второй look/проход.
5. Builder фиксирует q5-c1 в CANDIDATE.md с хешами всех runtime и provenance inputs и работающим локальным URL. После freeze кандидат неизменен. Technical QA, Visual QA и Artist независимо смотрят одну сборку в движении. QA — один полный проход, предварительное чтение/наблюдение не заменяет его.
6. Исполнители отвечают на общий пакет замечаний без правок. Lead сохраняет RESULTS.md, адресно доставляет Git-изменения и передаёт CTO решение stop/show либо запрос одной точной коррекции. Решение о качестве/завершении за CTO. Публикацию Lead отдельно не запускает.

## Поведение

Применяются ../../docs/ANIMATION_DEMO_REQUIREMENTS.md: живой idle, отличающаяся low через суставы, locomotion с опорой, jump (подготовка/отрыв/полёт/посадка/актуальная наземная цель). Один механизм принимает arbitrary и mid-transition commands из текущей позы; наземный запрос меняется в полёте. Не писать отдельные клипы на каждую пару/маршрут, не прятать неудобные состояния. Наблюдать естественность и дефекты, не объявлять их решёнными по build.

## Команда и владение

- Asset Artist 01a16974-8031-75e0-b897-349988ae23d5: assets/, public/art/, ART_DIRECTION.md, ART_PROVENANCE.md, ASSET_PROCESS.md, ART_REVIEW.md, coordination/artist*. Обязателен собственный просмотр полной сборки в движении.
- Builder 01a16974-801a-7e02-8660-1549e800cdc3: CONSTRUCTION.md, construction/, CONSTRUCTION_CHANGES.md, код/package/config/README.md, CANDIDATE.md, output/builder/, coordination/builder*. Единственный редактор геометрии/контракта; Artist передаёт измерения своей записью.
- Technical QA 01a16974-8044-76a3-9f87-49168d6ce8f1: qa/technical/, проверка порядка и coupling, provenance/hashes и поведения, один полный независимый проход после кандидата.
- Visual QA 01a16974-8040-7ae3-a975-db7a8ad1d522: qa/visual/, вид целого/стыки/слои/позы/опора/прерывания, соответствие конструкции, один полный независимый проход после кандидата.
- Lead: BRIEF.md, STATE.md, CONSTRUCTION_FREEZE.md, RESULTS.md, координация и адресный commit/push. Каждый пишет только собственный work/agents/<staff_id>.md. Git add/commit/push централизует Lead.

Внутренняя связь через названные существующие threads и coordination/ с отдельными файлами отправителей; при active writer не создавать конкурирующий ход. Не менять Q1–Q4, чужие dirty/untracked, JOURNAL/CTO/REVIEW_HANDOFF. Ничего чужого не чистить и чужие процессы не останавливать.

## Источники

Playbook da128e3 (при недоступности разрешённый локальный fallback); Staff roles/lead.md и MODELS.md 41f19e8; R4D роли и очередь 412030f. Применимые знания: docs/research/2d-raster-preparation/art-preparation.md, ai-approaches.md и architect/research/2026-10-23-2d-animation-findings.md. Скрытое продолжение определяется реальным диапазоном; pivot, parenting и слой различны. Atlas и точный generative repair не являются доказанными универсальными рецептами. Не переносить старую последовательность recommendation вместо Q5.
