# Builder P3: рабочее состояние

28 октября 2026, `builder-r4d-p3-masks-01`.
Заказ: exact main `64061757802dc60770ab156ef5672af741d65d03`,
`orders/perspective/ORDER.md` + `P3-masks.md`; stage 2 выдан Lead.
Работа только в собственном E worktree/ветке. Серверная запись не разрешена.

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

## Первый диагностический checkpoint

Source `02b1a1991108ad1c26c997a71ebc753a19b89e08`.
Build `E:\R4D\perspective\p3-runtime\builder\checkpoint-01`.
Manifest SHA256 `db762887a84752a8ec42425918dfde2e62b52ab643cf354c7bb13ee3bf4c00dd`.
Preview (собственный Node, PID 101084):
`http://127.0.0.1:6866/review/r4d/p3-masks/`.
Это диагностика БЕЗ Artist ball/shadow/masks, не кандидат художественной QA.

Native самопроверка: seed 0 -> receiver-03, final tick1956;
два обычных crypto-random seeds 2818447218 -> LOST tick762,
2099436614 -> LOST tick747. Все три имели первый контакт leaf-01 tick94.
Случайные плохие запуски не отбрасывались и сохранены в own runtime JSON.
Экспорт/импорт tick100 побайтно совпал с повтором native; изменённая позиция
отклонена. Это самопроверка Builder, не независимый TQA PASS.

В IAB реально увидены Jungle, +1 tick=0.005s, Art-off и flat-view. Console
error/warn пуст. Выявлены тонкие контуры при уменьшении и ненадёжное завершение
ввода числового seek: исправлены в source после checkpoint-01, ещё не freeze.

## Следующее

Первый настоящий partial/contact/swap на leaf-01 с Artist ball/shadow и PNG
mask. Scalar depth пока гипотеза; проверить необходимость передней дуги
accepted footprint. Config/projection не менять. Затем весь набор и frozen
кандидат для двух QA через Lead. Нужны реальные браузерные download/import.

Ресурсы перед первым browser: RAM free5.181GiB, CPU68%,
C7.774/D16.306/E31.923GiB. Это исторический snapshot, перед тяжёлой операцией
обновить system-wide показатели. Никакой очистки чужих файлов/процессов.
