# Q6 — текущее состояние

23 октября 2026. **accepted-for-showing: q6-c1, stop/show with limitations, correction запрещена.** [CTO_DECISION.md](CTO_DECISION.md), [RESULTS.md](RESULTS.md). Единственный полный pass, авторский просмотр, оба независимых QA и responses завершены. Продукт после freeze не менялся. **Очередь Q1–Q6 исследовательски завершена; release Q6 pending.** Это не статус полной художественной готовности.

## Версия и входы

Base/исходный origin main: `f7b563db381078f90109bbf48946841809986217`. Candidate freeze `2026-10-23T17:25:35.087Z` (20:25:35 Europe/Kiev). [output/builder/q6-c1-files.json](output/builder/q6-c1-files.json), SHA-256 `cc739d9e680f64b3fecf62e855b80caf4a7002f501eba282668a9e95758c8321`: **20 runtime/1 048 402 bytes + 56 inputs/5 582 809 bytes = 76/6 631 211 bytes**. Contract SHA `e1dbd83ca86f2c723c5ec51fc97fb85aa06236c88c628c728893005ca284380a`. Lead независимо подтвердил 76/76 и 6/6 npm tests без browser/build/correction.

Вход: `provenance/source/` — точные original parts/master/manifest/rig/animation. Контракт — `FROZEN_CONTRACT.json`; при возобновлении сверить hash, а не запускать новый pass. Source diagnostic `[39,240]`, общий neutral `[41,284]`, pivots `[98,35]`/`[102,28]`, layers `-10/-11`; J2 overlay `-8`. J1=M2 final, J2 underlay=J1, J0=originals. Calls M1=1/M2=1/J2=0, retries=0.

## Открыть и передать

Локально **http://127.0.0.1:4186/**, переданный Node/Vite PID **63020**. При closeout наличие процесса подтверждено без HTTP/browser-проверки; сервер не останавливался. Он оставлен CTO/будущему Release Engineer. Не запускать второй сервер. После завершения процесса запускать из этой области по `CANDIDATE.md`: `npm ci`, `npm run dev` (strict port4186). `npm test` read-only; build пишет в `output/builder/dist` и не выполнялся Lead повторно.

Будущий route: **`/review/r4d/q6-single-joint/`**. Публичная публикация Q6 пока не выполнена. Её назначает CTO отдельному свежему Release Engineer после проверки доставленного коммита. Не обращаться к VPS/Imagen/UGH и не выполнять release-команды в этой сессии.

Код: `index.html`, `src/main.js`, `src/rig.js`, `src/motion.js`, `src/style.css`; runtime mapping `public/art/manifest.json`. Изготовление: `process/M1/`, `process/M2/`, `process/J2/`, `art/**`. Просмотр/QA: `qa/artist/REPORT.md`, `qa/technical/REPORT.md`, `qa/visual/REPORT.md`; ответы: `coordination/*-qa-response.md`. Первоначальные отзывы/передачи сохранены как история и не переписаны под финальный статус.

## Команда и каналы

Единственный заказчик/координатор: CTO `cto-r4d-01`, thread `01a1653d-1c24-7991-a16b-619bc964ca40`. Все сотрудники Q6: `gpt-6.1-sol / medium`, local, cwd `D:\dev\R4D`; конфигурация/IDs сверены по существующим `.staff-local/<staff_id>.init.json` Staff Department, без изменения сессий.

| staff_id | Thread |
|---|---|
| lead-r4d-q6-01 | 01a169ba-1b54-73d2-8115-af79edb80cad |
| artist-r4d-q6-01 | 01a169ba-1b6e-7f41-86b5-4dcf8fd38c81 |
| builder-r4d-q6-01 | 01a169ba-1b22-7e31-b389-77ebf6c643d2 |
| technical-qa-r4d-q6-01 | 01a169ba-1b56-7e71-b327-6f4ed8756218 |
| visual-qa-r4d-q6-01 | 01a169ba-1b6e-7403-a927-f32e50dad662 |

Сессии постоянные, не удалялись; новых участников/чатов/subagents/worktree/клонов не создавали. Назначение релизного сотрудника остаётся CTO.

## Осталось и следующий шаг

J1 частично лучше J0, но потерял запас и остаётся жёстким; J2 добавил alpha coverage, но выглядит лоскутом. M1 дал полые края/drift/crop; M2 final защищён вне маски композицией, внутри неё есть потери. На выборке крупной дыры нет; все углы/естественность/органическая деформация не доказаны. CSS scale и fixed zoom clipping раскрыты. Принятие не снимает ограничения.

Lead сохраняет документацию и один narrow commit/push только Q6, общего сравнительного вывода и одной ссылки статуса в clean architect/START_HERE.md. Прежние 1469 tracked experiment-файлов и 39 foreign dirty/untracked записаны в `coordination/lead-verification/before.json` для сверки при доставке. Dependencies, build products и временная `.playwright-cli` исключены локальным `.gitignore`; `.gitattributes` сохраняет exact bytes при core.autocrlf. Сырые консольные/browser логи остаются локально, не входят в Git-доставку; смысловые observations/reports/scripts/screenshots сохраняются. Следующий шаг после доставки — проверка коммита CTO и отдельный release, без нового производства.
