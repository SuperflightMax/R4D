# Q4 — сначала цельный персонаж, затем части

Production разрешён Director 23 октября 2026 после публичного Q3: https://superflight.space/review/r4d/q3-other-anatomy/ . Руководитель CTO `cto-r4d-01`, thread `01a1653d-1c24-7991-a16b-619bc964ca40`. Lead `lead-r4d-q4-gpt61-01`, thread `01a16944-46fb-7e50-b04f-d1cc4bf87de7`.

Fetch: HEAD=origin/main `556bc12586cd5ce696b3e0f9793be1dddd50a0e0`; отличий от acceptance-base нет. Применяются канонический Playbook Chatknows da128e302e44e749431d3e3822e554bd6aca7cf8 (доступен через GitHub connector), Staff roles/MODELS 41f19e8de9d6f84f6e533186bda902e4f2c1c68e, roles/COMMON.md и дополнения R4D. Scope — CTO_EXPERIMENT_QUEUE.md Q4 и docs/ANIMATION_DEMO_REQUIREMENTS.md с уточнениями Director.

## Порядок и обязательный результат

1. Artist и Builder согласуют образ/ракурс, motion envelope, pivots, слои, перекрытия и скрытые зоны. Художественный выбор Artist; Builder сообщает реализуемые диапазоны. Это планирование движения нового цельного образа, не изготовление комплекта под готовую конструкцию Q5.
2. Artist создаёт и фиксирует exact whole image в assets/source/ и WHOLE_PROVENANCE.md: путь, SHA256, реальный prompt/tool/result, существенные условия, принятие именно этого источника. Производные части только ПОСЛЕ фиксации. Источник после фиксации неизменяемый. Сигнал Lead/Builder через coordination/.
3. Artist извлекает animation-ready части именно из этого whole и готовит hidden continuations. ASSET_PROCESS.md связывает каждую часть с источником/областью, раскрывает операции. Generative fill/local edit: где, зачем, вход/выход, что перерисовано. Не подменять способ полной генерацией parts set по мотивам. Если look сохранить не удалось — сохранить и показать результат честно. Скрытые пиксели являются достройкой, не извлечённой истиной.
4. Раннее соединение настоящей извлечённой цепи/стыка с движением, затем один полный комплект и сборка. Заимствования кода/подходов из прежних опытов записать, прежние файлы не менять.
5. Builder фиксирует единственный кандидат q4-c1 с хешами runtime-входов. Затем оба QA и сам Artist смотрят одну неизменную сборку в движении. После фиксации кандидата код/данные/арт заморожены без отдельного решения CTO. Самопроверка до кандидата не заменяет независимую оценку.
6. Lead собирает handoff CTO. Один полный проход, второго общего цикла нет. Только одна точечная коррекция по отдельному разрешению CTO. Q5 запрещён.

Живой idle, distinct low через сочленения (не масштаб целого спрайта), locomotion с видимой опорой, jump с подготовкой/полётом/посадкой. Общий механизм принимает произвольные и mid-transition команды из текущей позы; наземную цель можно менять в полёте. Автопоказ подаёт те же команды; ручной порядок свободный. Не писать клипы на каждую пару и не скрывать дефекты удобным маршрутом. Полные требования: ../../docs/ANIMATION_DEMO_REQUIREMENTS.md.

## Существующая команда и владение

Все gpt-6.1-sol / medium; cwd строго D:\dev\R4D. Новые чаты/subagents/worktree/clone запрещены.

- Artist `asset-artist-r4d-q4-gpt61-01`, thread `01a16944-471e-7f51-94d3-f4465b409115`: assets/, public/art/, ART_DIRECTION.md, WHOLE_PROVENANCE.md, ASSET_PROCESS.md, ART_REVIEW.md. Обязательный собственный просмотр сборки после CANDIDATE.
- Builder `builder-r4d-q4-gpt61-01`, thread `01a16944-4772-7310-9f8b-ea9b1e7769af`: код/package/config, README.md, ASSEMBLY_CONTRACT.md, CANDIDATE.md, output/builder/. Единственный редактор контракта; Artist передаёт измерения в своей записи. Сервер/порт определяет Builder, не останавливая чужие процессы.
- Technical QA `technical-qa-r4d-q4-gpt61-01`, thread `01a16944-4778-7c00-aa18-510703459e21`: qa/technical/, происхождение входов и реальное поведение/прерывания, хеши до/после; один полный независимый проход после кандидата.
- Visual QA `visual-qa-r4d-q4-gpt61-01`, thread `01a16944-4796-70f3-8985-54ae31062e9d`: qa/visual/, соответствие exact whole, целостность/стыки/слои/low/опора/jump/прерывания во времени, хеши до/после; один полный независимый проход.
- Lead: BRIEF.md, STATE.md, RESULTS.md, координация, адресный commit/push и handoff CTO. Каждый пишет только собственный work/agents/<staff_id>.md.

Workspace: experiments/q4-whole-character/. Сигналы coordination/ с уникальными именами от отправителя. Не запускать конкурирующие ходы активного writer. Итоговый commit/push выполняет Lead; сотрудники не делают git add/commit/push, чтобы не смешать чужие изменения.

## Контекст и сохранность

Применимые источники: docs/research/2d-raster-preparation/art-preparation.md, ai-approaches.md, architect/research/2026-10-23-2d-animation-findings.md. Точное сохранение пикселей локальным edit ещё не доказано, преимущество полного atlas не установлено. Старый порядок recommendation.md не является поручением.

Не менять Q1–Q3, work/JOURNAL.md, work/agents/cto-r4d-01.md, work/REVIEW_HANDOFF.md, .playwright-cli/, work/q3-local/, work/requests/. Не чистить чужие временные материалы. Все новые проверки только в Q4-области. Текущая задача — handoff CTO, публикацию Q4 отдельно не начинать.
