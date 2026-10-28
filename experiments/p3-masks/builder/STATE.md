# Builder P3: рабочее состояние

28 октября 2026, `builder-r4d-p3-masks-01`.
Заказ: exact main `64061757802dc60770ab156ef5672af741d65d03`,
`orders/perspective/ORDER.md` + `P3-masks.md`; stage 2 выдан Lead.
Работа только в собственном E worktree/ветке. Серверная запись не разрешена.

## Текущий статус — PREVIEW_RESUMED_FOR_QA

28 октября 2026. Получен адресный resume Lead по новой прямой команде Max.
Текущий участок ограничен восстановлением preview frozen01; новой реализации,
rebuild/generation/тестовой матрицы и собственных браузерных вкладок не было.

Pause checkpoint ac9b1a2 прочитан; при входе HEAD/branch совпали, WIP отсутствовал.
Сверены exact manifest и все76 сохранённых payload hashes, source f1aca21,
Artist f899, 51 masks. Frozen bytes не менялись и не пересоздавались.
Свежие system-wide ресурсы: RAM free12.653/31.907GiB, CPU40%/24logical,
C8.117/D16.303/E47.066GiB; оценка preview+двухQA до3.3GiB оставляет запас.
Loopback6866 был свободен перед запуском.

Собственный preview фактически запущен: PID112732, exec session69658.
Listener127.0.0.1:6866 подтверждён с этим owner. URL снова ONLINE:
http://127.0.0.1:6866/review/r4d/p3-masks/.
Каталог E:\R4D\perspective\p3-runtime\builder\full-checkpoint-06.
Startup GET manifest дал HTTP200 и exact SHA256
e2e9f7d837b3d05f484f75a877af6992a70ee88363add783d80f3c6e206f431f.
TEMP/TMP заданы только process-local на собственный E runtime temp.

Preview оставлен для двух QA. До конкретного QA-дефекта новых продуктовых
действий не требуется. server_write=false; UGH/другие проекты не затрагиваются.
Ниже PAUSED_SAFE — историческая запись уже снятой паузы, PID24412 остаётся старым.

## PAUSED_SAFE — временная пауза по прямой команде Max

28 октября 2026. Получена адресная команда CTO о немедленной мягкой паузе
всей команды. Заказ не отменён. Продолжение ТОЛЬКО после новой явной команды
Max; прежний stage2/поздний checkpoint не дают разрешения продолжать.

В момент получения выполняющихся atomic writers/build/tests/generation/release
не было. Собственный Node preview PID24412 остановлен после проверки owner:
командная строка соответствовала own preview.mjs + full-checkpoint-06.
Собственная IAB вкладка1 с URL127.0.0.1:6866/review/r4d/p3-masks/ закрыта.
Других активных собственных серверов/вкладок/нагрузки нет. Чужие процессы,
Millionko и остальные команды не трогались. Preview URL ниже сейчас OFFLINE.

WIP перед паузой: дерево чистое, HEAD4603d99a5904d10924f55416e36100b2c470b534,
ветка codex/r4d-p3-masks-builder-01. Этот pause checkpoint меняет только STATE.
Frozen source f1aca21e7b9ba19001e7e8762fcaf2511bf9bf74 и Artist
f899a308aed156a11e2a1013292ed68c6669959d сохранены без изменения.
Immutable/raw assets и весь own runtime сохранены; ничего не очищалось.
Frozen directory: E:\R4D\perspective\p3-runtime\builder\full-checkpoint-06.
Manifest SHA256 e2e9f7d837b3d05f484f75a877af6992a70ee88363add783d80f3c6e206f431f.
Evidence: own runtime evidence-full05/evidence-full06/evidence-02.

Exact next action после явного resume Max: прочитать этот STATE и
FROZEN_CANDIDATE.md, сверить фактический статус/уже полученные результаты
TQA/VQA через Lead. Не повторять выполненные проверки и не менять frozen bytes.
Если для разрешённого продолжения нужен preview — отдельно подтвердить свободный
loopback port/ownership и возобновить только свой preview указанного bundle;
новая коррекция продукта требует новой именованной версии, не overwrite full06.
Сейчас новых операций/ожиданий не запускать. Оба слота paused/reserved;
свободный release token не даёт разрешения выпуска, P4–P6 не открываются.

Нижеследующая выдача кандидата описывает состояние ДО временной паузы.

## Текущий переход: frozen candidate 01 для обеих QA

Полный handoff — [FROZEN_CANDIDATE.md](FROZEN_CANDIDATE.md).
Source f1aca21 + final Artist f899, 51 masks, 77 total served files.
Frozen bytes уже собраны в `full-checkpoint-06`; метаданные, точный source,
полные manifest hash/path, native provenance и наблюдения закреплены в handoff.
Preview PID24412, стабильный loopback route6866.
Builder больше не меняет candidate bytes во время обеих QA; исправление
требует новой именованной версии. Это выдача на QA, не art PASS и не release.

Доводка после раннего checkpoint: добавлены все 51 маски и исправленный
Artist shadow scale, семь browser checkpoint файлов/каталог пяти обычных
runs, drag-pan для просмотра увеличенных корзин. Код зафиксирован до сборки.
Все 76 payload file/HTTP hashes + .js MIME сверены; основные browser files
и общие inputs побайтно совпали с source Git objects. Все пять ordinary
runs воспроизвелись, два боковых перехода не показали видимого pop.
Сохранён реальный общий mapping defect left-5/seed2818447218/tick612:
accepted collision boundary проходит по видимому полу раньше painted rail.
Не скрыт масками и не исправлялся подгонкой. Ограничения/известное непроверенное
перечислены в handoff для TQA/VQA.

Ниже — история ранних checkpoint; её preview PID/build уже не текущие.

## Сделано

- Контракт source-aligned alpha, anchors/radius/depth предложен в
  `ASSET_CONTRACT.md`, опубликован commit `4b51eba`.
- Exact P1 config/manifest/projection извлечены из Git, три SHA256 совпали
  с поручением. Native core exact `5a6fa03f1cdb3de88a2d9c7dbe795eb8e2a7f023`
  компилируется read-only из exact objects, без изменения приватной копии.
- Собственный PixiJS 8.22.0 стенд, независимые Art/Geometry, source/flat,
  масштаб/framing, random/replay, pause/+tick/seek, checkpoint download/import.
- Состояния рассчитываются штатной native session с шагом 5 мс и штатным
  timeout. PRNG рендером не используется; меняется только rng.seed.
- Сборка самодостаточна, route-relative, с Pixi MIT license; native runtime
  один compiled minified module, без TS и source maps. Всё output — E runtime.

## Ранний связный checkpoint

Текущий source `682d2d7e193f5d2fd771a629b2c71002be793dd3`.
Build `E:\R4D\perspective\p3-runtime\builder\checkpoint-04`.
Manifest `file-manifest.json`, SHA256
`c7455fed1451019b98bd0c3718981e70bbf3c37bb20e132a885e42502a80fadc`.
19 files, 3157023 bytes; все file/HTTP hashes проверены.
Preview (собственный Node, PID 53136):
`http://127.0.0.1:6866/review/r4d/p3-masks/`.
Artist exact `7f75ccb0e515e3c955c8b9bc248990573d8f8678`: собственные generated
ball/shadow и две PNG masks leaf-01/flower-01. Полная сцена ещё не готова,
это не frozen full candidate и не художественный PASS.

Весь browser-facing JS имеет `.js` extension; фактический MIME на вложенном
route — JavaScript. Node-only scripts остаются `.mjs`. Native JS hash
`af8e6dea9ee5c46759f99ba3b68f4afa91c740b4fd2aba2d2d3f65bfa66753fa`
одинаков в checkpoint02/03/04. `build.json` содержит exact native Git tree/blob
OID, Node24.15.0, rolldown1.2.15 и compiled hash, без private source paths/maps.

Native самопроверка: seed 0 -> receiver-03, final tick1956;
два обычных crypto-random seeds 2818447218 -> LOST tick762,
2099436614 -> LOST tick747. Все три имели первый контакт leaf-01 tick94.
Случайные плохие запуски не отбрасывались и сохранены в own runtime JSON.
Экспорт/импорт tick100 побайтно совпал с повтором native; изменённая позиция
отклонена. Это самопроверка Builder, не независимый TQA PASS.
Browser ordinary seed3925936860 -> LOST tick1256; сохранён без отбрасывания.
Browser ordinary seed1199311181 -> IN_BUCKET receiver-01 tick1367: реально
просмотрено движение после исправления frame timing.

В IAB реально увидены Jungle, +1 tick=0.005s, Art-off без масок и flat-view;
view/framing/zoom не меняют run/tick. Тонкие контуры и ненадёжное завершение
ввода числового seek исправлены. При random в checkpoint03 обнаружен
отрицательный первый RAF delta, приводивший к tick=-1 и остановке анимации.
Исправлено clamp elapsed>=0 и steps>0; checkpoint04 дошёл до своего результата.
Старый console error timestamp00:13:07.449Z сохраняется в истории IAB logs,
после исправления новых ошибок при этом запуске нет.

Браузером скачан checkpoint seed0/tick95, затем выполнен random и настоящий
file-chooser import. Native пересчёт восстановил seed0/tick95 и exact state.
Скопированный JSON и actual screenshots в own runtime `evidence-02/`.
Ранний стык на seed0: partial tick60, contact94/95 с полным скрытием высоким
leaf, rebound150. Lead просмотрел кадры и принял early milestone без fullQA.
Scalar depth swap358 происходит далеко сбоку и не доказывает боковой переход.
Shadow имеет отдельный occlusion pass по собственному floor offset.

## Следующее

Artist готовит полный набор после early milestone. В уже сохранённых обычных
runs найдены близкие к footprint боковые scalar-depth переходы:
seed0 / flower-03 ticks1503–1505 (gap1.78 native за pin.r+ball.r);
seed2099436614 / frog-02 ticks487–489 (gap2.14).
Проверить их первыми с новыми exact PNG masks; не искать красивый seed.
Scalar depth пока гипотеза. Config/projection не менять. Затем весь набор,
полезные коррекции и один frozen candidate для двух QA через Lead.
QA сейчас не запускается на двухмасочном комплекте как на целом опыте.

Ресурсы перед checkpoint04: RAM free9.844/31.907GiB, CPU12%/24logical,
C7.732/D16.305/E31.548GiB. Это исторический snapshot, перед тяжёлой операцией
обновить system-wide показатели. Никакой очистки чужих файлов/процессов.
