# P3 Dark — состояние Lead

29 октября 2026. Stage2 transfer активен, тот же Lead/состав/ветки/worktrees.
[Исходный способ и точный Dark P1](BASELINE.md) сохранены до переноса.
Dark принимает board02 trial01 и собственный source; Water inputs не заменяют его.

## FULL_ART_READY — итогового freeze/QA/publish ещё нет

Полный первый ART Dark получен и немедленно передан Builder:
`17dc9fcdc261562acb581dd8590096819734c807`,60masks,
assets.json18588bytes/SHA256
`ef5eb34be622f5ce6356d6fa51d7902c334a1f1f3c95acce225d7340928bbc29`.
Lead независимо сверил exact Git hash, прочитал STATE/CONSUMER_CONTRACT
и интегрировал этот сохранённый первый вариант в свою ветку.
Artist handoff `E:\R4D\perspective\p3-runtime\asset-artist\transfer-water-dark\dark\handoff-17dc9fcdc261`.
12pins,24front/side loop faces,6walls,3ramps,12receiver rims,3dividers.
Shadow alpha0.93, source/body PNG/r16/projection/PRNG без изменений;
это reuse собственного frozen goldball/shadow, не новая генерация.
Builder делает самостоятельный fullDark build/actual selfchecks; Water ранняя
VQA не удерживает Dark. Конкретных Dark visual findings/PASS ещё нет.

VQA matrices на русском `0ed5d4bae632e4fa3fd370ffeed193ab1d48c214`
интегрированы: [PREPARATION.md](../visual-qa/PREPARATION.md).
Dark cases PENDING. VQA сейчас делает раннюю Water диагностику, это не Dark
выдача и не вторая QA одной роли; Dark frozen handoff будет отдельным.
Artist сообщил36obstacle regions Dark с раздельными faces и oriented depth
lines; добавляет borders/baskets. Exact полного Dark art handoff ещё нет.

TQA input preparation completed/idle, commit
`fe09f8e37cff8352dbe629e28bd3e4e2c0e019aa` прочитан и интегрирован:
[Dark input state](../technical-qa/STATE.md). Predeclared native seeds:
0→receiver01/t888,1→receiver01/t884,2→LOST/t1812. Переданы Artist/Builder/VQA
обычные ориентиры seed0/pillar02:edge01/t366 иpillar04:edge04/t840,
с соседними365–367/839–841; это ещё не факты painted silhouette overlap.
VQA две отдельные матрицы подготовил; правит только язык новых документов
на русский с сохранением входов/cases/PENDING. Candidate verdict ещё нет.

Builder native preparation: replay точный, cross-board checkpoint отклоняется;
заранее выбранные native seeds1/2 совпали с точными исходами/тиками P1.
Первый contact Dark bowl-base-01/89. Consumer contract опубликован на
`f3b7ce8d94b0a9173c48d7ca6defb3837a10ed03`, Lead прочитал и передал Artist.
Реального художественного candidate пока нет. Native package/src tree pins
TQA согласовал отдельно, исходный ядро commit не менялся.

Release completed/idle/server_write=false. Локальные планы обеих досок
`1cf782e83c5e0aec0f80feeb9bc9693028a7fb5b` полностью прочитаны/интегрированы:
[PLAN.md](../release-engineer/PLAN.md),
[RELEASE_PLAN.json](../release-engineer/RELEASE_PLAN.json).
Никаких SSH/live capture/upload/staging/serverdocs; future live hashes null.
Новый exact token только после frozen bytes и независимых QA, P5 first.

Пять реальных адресных handoff и turn IDs закреплены в
[Water Lead state](../../water/lead/STATE.md); это общая команда, не вторая
параллельная выдача тех же ролей. Все actual turns inProgress/errornull на
первом checkpoint; CTO получил turn/send results и concrete Builder action.
Builder переносит consumer, Artist готовит отдельные masks/ball/shadow,
QA независимо готовят Dark матрицы, Release только local publication plan.

Dark получает собственные source/config/art/runs/logs/candidate/порт/вердикт
в `experiments/p3-masks/transfer/dark/<role>/`; role runtime
`E:\R4D\perspective\p3-runtime\<role>\transfer-water-dark\dark`.
Никаких Jungle файлов/публикации или материалов Water не переписывать.

Следующий конкретный участок: freeze baseline depth/asset contract, получить
собственный art handoff и immutable native/Pixi candidate, затем real movement
и соседние overlap ticks у углов/передних/боковых граней, borders/baskets/shadow.
QA verdict пока нет; победы ordinary runs не подбирать. Общие mapping defects
вернуть CTO воспроизведением, локальные маски/renderer исправлять своим владельцем.

Ресурсы и E≤4/≤2 thresholds как в Water Lead state; отдельная свежая проверка
перед каждым тяжёлым шагом. Тяжёлые данные только собственный E runtime,
env process-local; никакой общей очистки/изменения security/credentials/UGH.

Server_write=false, токена нет; предполагаемый route `/review/r4d/p3-masks-dark/`.
P5 имеет следующее окно первым. Публикация после независимых QA и нового
exact intent/token CTO. До того remote upload/staging/lock/nginx/docs запрещены.
Остановка на ACK/STATE не считается выполнением: производство продолжается.
