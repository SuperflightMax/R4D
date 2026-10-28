# P3-frozen-01 — безопасная пауза Technical QA

28 октября 2026, Europe/Kyiv. `technical-qa-r4d-p3-masks-01`.
Статус: **PAUSED_SAFE**, реальная QA не завершена, PASS не выдан.
Основание: срочная мягкая пауза всей R4D от Max через доверенный Dot,
переданная непосредственно CTO `cto-r4d-perspective-01`.
Возобновление — только после новой явной команды Max. Это не отмена заказа.

## Кандидат и сохранённый WIP

- CODE `f1aca21e7b9ba19001e7e8762fcaf2511bf9bf74`;
  ART `f899a308aed156a11e2a1013292ed68c6669959d`.
- Manifest SHA256
  `e2e9f7d837b3d05f484f75a877af6992a70ee88363add783d80f3c6e206f431f`.
- Shared immutable bundle: `E:\R4D\perspective\p3-runtime\builder\full-checkpoint-06`.
  QA его не изменяла. Preview — `http://127.0.0.1:6866/review/r4d/p3-masks/`.
- Собственная ветка `codex/r4d-p3-masks-technical-qa-01`; исходный QA HEAD
  перед этими WIP-изменениями `c380b6ae6d364b39815b963f5b0b96c249266863`.
- Новый собственный helper [verify-frozen.mjs](verify-frozen.mjs).
  Private native location и accepted P1 dependencies задаются параметрами
  `nativeRepo` и `deps`; приватные исходники не включены в Git.
- Фактическая машинная сверка до браузерной части сохранена в
  [FROZEN_01_WIP_VERIFICATION.json](FROZEN_01_WIP_VERIFICATION.json).
  Это промежуточное наблюдение с пустым browserSamples, не полный QA-report.
- Runtime `E:\R4D\perspective\p3-runtime\technical-qa\frozen-01`:
  `verification.json`, `qa-native-core.js`, `private-native-oracle/`.
  Последний каталог содержит локальную временную компиляцию приватных
  exact native modules, не публикуется и не переносится в payload.
- Браузерные JSON и JPG сохранены в runtime `browser/`. Префиксы:
  `ordinary-01-end`, `ordinary-02-start/end`, `ordinary-03-start/paused/plus1/plus10`,
  `paused-before-controls`, `art-off-geometry-off/on`, `art-on-geometry-on`,
  `flat-floor-200-before-pan/after-pan`, `fresh-reload`,
  `imported-ordinary03-t1367`, `imported-ordinary03-next1`.
  Скачанный реальной кнопкой checkpoint: `exported-ordinary03-t1367.json`.
  На живом проигрывании screenshot и JSON могут относиться к разным ticks;
  paused/terminal samples стабильны. Raw/JPG/JSON не удалялись.

## Что выполнено до получения паузы

1. Независимо совпали все 77 local/HTTP files и их exact bytes/hashes:
   76 payload / 3388537 bytes, с manifest 77 / 3401352 bytes; лишних файлов
   нет. Browser-facing JS MIME проверен. 62 payload файла связаны с exact
   CODE/ART Git objects; все common config/manifest/projection/view-math
   побайтно совпали с accepted P1. Jungle и Pixi/license совпали.
2. Native runtime самостоятельно пересобран из 14 exact Git blobs:
   SHA256 `af8e6dea9ee5c46759f99ba3b68f4afa91c740b4fd2aba2d2d3f65bfa66753fa`
   совпал побайтно. Отдельный unbundled native oracle без Builder adapter
   подтвердил все 6093 состояния и object_hit events пяти saved runs:
   seed0→receiver03/t1956; 2818447218→LOST/t762;
   2099436614→LOST/t747; 3925936860→LOST/t1256;
   1199311181→receiver01/t1367. Все семь saved checkpoint JSON совпали с oracle.
3. Своей отдельной IAB-вкладкой нажаты первые три обычных новых запуска,
   без отсева: `4002564341`, `892542836`, `1061109253`.
   В браузере наблюдались terminal LOST первых двух на ticks1999/1814.
   Третий реально остановлен кнопкой Pause на t1356; +1→1357, +10→1367.
   Его вычисленный runInfo.lastTick=1584, но terminal в браузере ещё не смотрелся.
4. На paused t1367 реально переключены четыре сочетания Art/Geometry,
   source→flat, whole→floor, zoom200% и выполнен drag. Полный checkpoint,
   включая rngU32, остался идентичен. Скриншоты сохранены; визуальное
   сравнение этих диагностических скриншотов ещё не доведено.
5. Реальная кнопка download сохранила checkpoint. После свежего reload
   реальный file chooser импортировал его из собственного runtime:
   UI подтвердил воспроизведение; snapshot полностью совпал с t1367.
   Последняя завершённая атомарная операция — +1 до t1368 и сохранение
   `imported-ordinary03-next1.json`. Эти browser snapshots пока НЕ сверены
   отдельным oracle после получения; helper был запущен до их появления.

Взаимодействия выполнялись UI-кнопками/полями, снимки read-only поверхности
`window.p3` читались через поддерживаемый CDP. Read-only Playwright evaluate
не видел этот global; это ограничение средства проверки, не дефект продукта.
Нет итогового вердикта по движению/перекрытиям и нет художественной оценки.

## Что осталось — точный следующий шаг после разрешённого resume

Сначала сверить, что Lead всё ещё поручает те же frozen bytes, и сделать
свежий system-wide resource snapshot. Затем сверить сохранённые собственные
browser checkpoints и полные native traces трёх новых seed с отдельным
oracle, не подменяя проверку результатом Builder. Довести третье ordinary
воспроизведение до фактически просмотренного завершения/replay.

Продолжить реальные seek вперёд/назад и необходимые saved regressions:
seed0/flower03 t1503–1505, seed2099436614/frog02 t487–489,
seed2818447218/left-5 t611–613, seed0/receiver03 t1945/1950/1956.
Независимо установить источник раннего отскока left-5; config не менять.
Досмотреть Art-off/geometry-above-art и движение в собранной сцене.
Проверить browser network/console после nested-route fresh load и JSON
дальнейшее воспроизведение. Network observer был включён, но результат
не собран перед паузой; не выдавать его за выполненную проверку.
Только после этого собрать связанные дефекты и ограниченный QA-report.

## Фактическая остановка и ресурсы

Собственная IAB-вкладка `1`, созданная этой QA, корректно закрыта через
сохранённый tab handle. Собственных активных servers/exec sessions нет:
единственный native/manifest helper завершился exit0 до паузы. Его PID79216
уже завершён; новые прогоны не запускались. Подтверждённо чужой Builder
preview PID24412 не останавливался; он не принадлежит QA. Нет serverwrites,
reload/rollback production, новых сессий/subagents/worktree или cleanup.

Последний resource snapshot перед своим compile/run, 00:47:41UTC:
RAM free6.302/31.907 GiB, CPU20%/24 logical, C/D/E free7.701/16.304/31.135 GiB.
Оценка собственного добавочного пика до1 GiB и отдельного VQA до2 GiB;
это оценка, не измеренный резерв. Все тяжёлые материалы в собственном E
runtime; TEMP/TMP задавались только процессу. Глобальные настройки и
чужие проекты не затрагивались. После checkpoint активного ожидания нет.
