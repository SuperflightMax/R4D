# P3 frozen candidate 01 — выдача обеим QA

28 октября 2026. Builder `builder-r4d-p3-masks-01`.
Это один кандидат для независимых TQA/VQA, не итоговый PASS и не публикация.
Серверных записей Builder не выполнял. Новые QA-результаты относятся только
к указанным ниже bytes; изменения требуют новой именованной версии.

## Идентичность

- Source code commit: `f1aca21e7b9ba19001e7e8762fcaf2511bf9bf74`.
- Artist commit: `f899a308aed156a11e2a1013292ed68c6669959d`.
  Source prefix: `experiments/p3-masks/asset-artist/`.
  Consumed `assets.json` SHA256:
  `98cef793f5cf9191fea315caf4bf11d727c20b2d5a9d5704972e97e02cfd2f73`.
  Это exact LF Git bytes, прежний CRLF digest исключён.
- Immutable build directory:
  `E:\R4D\perspective\p3-runtime\builder\full-checkpoint-06`.
- Полный paths/sizes/SHA256 manifest:
  `E:\R4D\perspective\p3-runtime\builder\full-checkpoint-06\file-manifest.json`.
- SHA256 exact manifest bytes (12815 bytes):
  `e2e9f7d837b3d05f484f75a877af6992a70ee88363add783d80f3c6e206f431f`.
- 76 payload files / 3388537 bytes; плюс manifest — 77 files / 3401352 bytes.
  Manifest не включает собственный digest; он указан выше.
- Стабильный preview именно этого каталога:
  `http://127.0.0.1:6866/review/r4d/p3-masks/`.
  Только loopback GET/HEAD, собственный Node preview PID24412.
- `build.json` закрепляет source/Artist/core/P1/toolchain;
  все file hashes независимо пересчитаны из actual saved/HTTP bytes.
  Восемь browser/source-input файлов побайтно сверены с exact source Git
  objects, а не только с текущей рабочей копией или произвольным HEAD.

## Native, общие входы и лицензии

Native `@millionko/sim-core`:
`5a6fa03f1cdb3de88a2d9c7dbe795eb8e2a7f023`.
Source tree Git OID `6539b91a379d32c22281d43e71bb17fecb608437`.
14 consumed native Git blob OIDs перечислены в `build.json`; чтение было
из exact objects без изменения исходников. Node24.15.0,
`node:module.stripTypeScriptTypes({mode:'transform',sourceMap:false})`,
rolldown1.2.15 ESM/minify. `native-core.js` SHA256:
`af8e6dea9ee5c46759f99ba3b68f4afa91c740b4fd2aba2d2d3f65bfa66753fa`.
Этот runtime hash также совпал с checkpoint02/03/04.
В served bundle нет TS, source maps или private source filesystem paths.
Скомпилированный native включён по выданному разрешению CTO.

PixiJS8.22.0 — local standalone `vendor/pixi.js` и неизменённый
`vendor/PIXI-LICENSE.txt` (MIT). Build-time Node/rolldown не раздаются.
Свои ball/shadow и 51 source-aligned PNG masks входят из Artist exact objects.
Jungle скопирован неизменным с проверкой исходного SHA256.

P1 repeat `4b47db04c7140ebf88f69b91faa0b790d46f22ec`:
config/manifest/projection сохранены exact; их SHA256 в payload manifest.
25pins/16segments/4buckets/1drop, r16, tick5ms, g980, speed2000,
angleDeviationDeg2/bounceDeviation0.02/lcg32/quantize7 не изменены.
Меняется только rng.seed. Визуализация и маски не используют native PRNG.

## Воспроизведения и самопроверка

В интерфейсе есть свёрнутый раздел «Сохранённые запуски и кадры».
`replays/index.json` и семь checkpoint JSON — часть frozen payload:

| Seed | Последний тик | Native результат |
| --- | ---: | --- |
| 0 | 1956 | IN_BUCKET receiver-03 |
| 2818447218 | 762 | LOST |
| 2099436614 | 747 | LOST |
| 3925936860 | 1256 | LOST |
| 1199311181 | 1367 | IN_BUCKET receiver-01 |

Это исходный seed и четыре обычных random-запуска, сохранённые без отсева
неудобных исходов. Дополнительные checkpoints: seed0/tick1503 и
seed2099436614/tick487. +1 tick даёт соседнее точное native состояние.

Проверены native replay и rejection изменённых config/state; реальный
браузерный download/file-chooser import восстановил тот же seed/tick/state.
Проверены +tick/seek, Art/Geometry и view/framing/zoom/pan с сохранением тика.
Source и flat показывают один config. Диагностические незалитые контуры выше
арта; Art-off выключает background, ball/shadow и оба occlusion passes.
Full-route GET дал одинаковые bytes/hash для всех 76 payload файлов,
browser-facing `.js` имеет JavaScript MIME. Backend/POST отсутствуют.

Оба боковых перехода просмотрены на actual Pixi кадрах:
seed0 / flower-03 ticks1503/1504/1505,
seed2099436614 / frog-02 ticks487/488/489.
В этих случаях видимого pop не обнаружено, шарик проходит сбоку силуэта.
Это не доказательство достаточности scalar depth для каждого случая.
Artist JSON blob/PNG в preliminary9cf и finalf899 совпадают; повторять
проверенные кадры из-за LF/hash bookkeeping не требовалось.

Целые ordinary runs просмотрены в браузере: все пять дошли до указанных
native исходов. Seed0 на preliminary05 использовал идентичный final JSON/PNG;
остальные четыре — full06. Дополнительно просмотрены вход seed0 в receiver03
на ticks1945/1950/1956, реальный контакт seed2818447218 left-5 на611/612/613,
Art-off и увеличенные/перемещённые корзины без изменения run/tick.

Actual screenshots/checkpoint evidence лежат отдельно от frozen bundle:
`E:\R4D\perspective\p3-runtime\builder\evidence-full05` и `evidence-full06`.
Ранний partial/contact/rebound leaf-01 сохранён в `evidence-02`.
Это самопроверка Builder, не независимые QA verdicts.

## Остаточные ограничения, которые нужно видеть QA

1. На seed2818447218, left-5 hit tick612, принятый boundary лежит на видимом
   полу перед нарисованным бортом: отскок выглядит ранним относительно арта.
   Evidence `evidence-full06/seed2818447218-wall-geometry-t613.jpg` плюс611–613.
   Это фиксируется как расхождение общего mapping; коллайдер не подгонялся,
   маской расхождение не скрывалось. LOST исходы сохранены отдельно, точная
   причина каждого LOST этим наблюдением не доказана.
2. Pins используют scalar accepted pin.y; длинные борта — coarse near-endpoint
   depth. Мелкая листва/AA и изогнутые границы вручную заданы Artist и не
   объявляются пиксельно идеальными. Проверенные переходы не дают общей
   гарантии; полезные конкретные дефекты следует возвращать вместе.
3. Native capture фиксирует IN_BUCKET при штатном center-distance condition;
   на паузе сохраняется exact финальное состояние, без выдуманного sinking.
   В сохранённых полных runs достигнуты receiver01/03; достижения02/04 не
   заявлены как просмотренные. Маски всех четырёх корзин присутствуют.
4. Читаемость обновлённой shadow и цельность художественного движения требуют
   независимой VQA. Наличие PNG, native completion и этот freeze не дают
   художественный PASS и не являются публикацией результата опыта.

Во время обеих QA этот каталог и его manifest не перезаписываются.
README/STATE/этот handoff могут обновляться отдельно; frozen source остаётся
указанным f1aca21, независимо от более позднего documentation HEAD.
