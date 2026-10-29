# Water — подготовка независимой Technical QA

29 октября 2026, Europe/Kyiv. `technical-qa-r4d-p3-masks-01`.
Статус: **INPUTS_VERIFIED_READY_FOR_FROZEN_CANDIDATE**.
Это результат подготовки входов, не вердикт по переносу или будущей демке.

## Начало и границы

- Actual turn: `01a186fc-3cd2-7173-b970-246428cca6de`.
- Worktree `E:\R4D\perspective\p3-worktrees\technical-qa`, прежняя ветка
  `codex/r4d-p3-masks-technical-qa-01`; исходный чистый HEAD
  `c0db64fe4a0204d77be0d3ab61ffe21331d9c90a`.
- Первое действие: read-only `git show` карточки P3-transfer-water-dark.
  Все четыре обязательные карточки полностью прочитаны на
  `c6603f0f327350172df44687a4d4ead19e0e5e6b`.
- Новый прямой старт Max от29.10 09:04:16Z/09:13:39Z через CTO/Lead заменяет
  только старую очередность. Jungle PARTIAL/MAP-01/post-auth ограничения
  сохраняются; Jungle-файлы, frozen/raw, QA и публикация не переоткрывались.
- Исходный метод: CODE `f1aca21e7b9ba19001e7e8762fcaf2511bf9bf74`,
  ART `f899a308aed156a11e2a1013292ed68c6669959d`, manifest
  `e2e9f7d837b3d05f484f75a877af6992a70ee88363add783d80f3c6e206f431f`.
  Рецепт/правила: exact CODE `experiments/p3-masks/builder/ASSET_CONTRACT.md`
  и `src/app.js` (depthAt/state-driven masks); exact ART
  `experiments/p3-masks/asset-artist/assets.json`. Смена метода не поручалась.

## Независимо сверенные входы

Все пути P1 ниже — exact `4b47db04c7140ebf88f69b91faa0b790d46f22ec`,
prefix `experiments/p1-collider-mapping/clean-repeat-01/`.

| Вход | Путь / raw Git LF SHA256 |
| --- | --- |
| Config | `simulation/boards/04/trial-02/config.json` — `9048b28af2923c93d8be772367beeb828f1e4513a6298af1c803379f77d3e50c` |
| Manifest | `simulation/boards/04/trial-02/manifest.json` — `48c4fef26fd8c94f06c278851222ef285edda54ac14e53da8908f4ee663dc420` |
| Projection | `research/board04-projection.candidate-02.json` — `ee0c6e429d4e0b1da6c342174d22369cd293c3fc4b18ccd7d09a4690f71da54f` |
| Source | `K:\Agents\R4D\Assets\perspective\04-water-temple.jpg` — `8da65c76c110b6ba7cefe113564fe12feed4428e84e84835f033e7da31d3b80d` |

Активный trial-02 выбран по board04 README, старый startup FAIL trial-01
не подставлен. Counts: **6 pins / 106 segments / 4 buckets / 1 drop**;
`board04-start`, r16/tick5ms/quantize7/g980/speed2000/noise2deg/0.02/lcg32.
Проверены 92 loop edges и 14 bounds с сохранением вершин и ориентации,
pin/bucket/drop translation, согласованность обеих матриц и whole-source
domains. Максимальная roundtrip ошибка 7.275957614183426e-12.
Стартовый зазор с учётом r16: **12.779332324622374** native units.

Native exact `5a6fa03f1cdb3de88a2d9c7dbe795eb8e2a7f023`, clean package.
Уровни дерева независимо различены: repository `03bb35e908ae8c5ab16e02cf62640b6663ae18f5`,
package `008d16a80a26bb77d562a45218b01da09b0d9ff0`,
src `6539b91a379d32c22281d43e71bb17fecb608437`.
Сохранённые 14 независимых native modules побайтно сверены с transform exact
Git blobs, исходники не менялись и не публиковались. Повтор тех же seed
даёт одинаковые states, три trace hashes различны.

Заранее объявленные input-probe seeds, без отбора:
0→LOST/t1326; 1→LOST/t1196; 2→IN_BUCKET receiver-02/t1275.
Это обычные native прогоны общего входа; UI/random и frozen P3 ещё не проверены.

## Water gate: доступность при r16

Проверены separate feet всех восьми арок. Lintel/shoreline/elevation
colliders не добавлялись. `minimumFootGap` — минимальное расстояние между
сегментами двух feet; `corridor clearance` — точный зазор прямого локального
пути центра (с r16) ко **всем** config pins/segments, включая концы сегментов.

| Арка | Foot gap | Gap − diameter32 | Corridor clearance |
| --- | ---: | ---: | ---: |
| 01 | 53.094862 | 21.094862 | 9.725488 |
| 02 | 52.011293 | 20.011293 | 9.170890 |
| 03 | 56.009233 | 24.009233 | 10.481181 |
| 04 | 54.050223 | 22.050223 | 11.025112 |
| 05 | 57.009531 | 25.009531 | 10.983052 |
| 06 | 55.261396 | 23.261396 | 11.223748 |
| 07 | 54.589397 | 22.589397 | 10.468428 |
| 08 | 54.589397 | 22.589397 | 10.468428 |

Локальный 2D проход геометрически доступен у всех восьми. Это не доказательство
достижения каждого прохода от drop и не проверка высоты под painted lintel.
Конкретный native witness без изменения config: **seed1 / arch-07 / tick1015**,
соседние states1014/1015/1016, движение вниз, source≈(518.076,957.456),
зазор на пересекающем шаге **4.171925**. Этот run затем LOST/t1196;
неудачный исход сохранён. Остальные семь gate crossings в этих трёх seeds
не наблюдались и не объявлены испытанными в движении.

У того же seed1 есть actual native contacts arch-07-left-foot:edge-01/t1006,
arch-07-right-foot:edge-04/t1012 и arch-07-left-foot:edge-02/t1018.
Это готовый ориентир для будущей проверки обеих опор и проёма одним run;
показанные masks/lintel пока отсутствуют. Короткое native свидетельство:
[GATE_NATIVE_WITNESS.json](GATE_NATIVE_WITNESS.json).

Входной blocker проёма при r16 не обнаружен. Lead получил адресно числа,
seed/ticks и путь witness. Это не PASS масок/шарика/тени/видимой перемычки:
они проверяются только в реальном будущем frozen candidate.

Факты: [INPUT_PREFLIGHT.json](INPUT_PREFLIGHT.json).
Runtime и raw witness:
`E:\R4D\perspective\p3-runtime\technical-qa\transfer-water-dark\water\input-preflight-01.json`
и `gate-native-witnesses-01.json` там же. Helper: [check-inputs.mjs](check-inputs.mjs),
параметры — authorized `nativeRepo` и read-only cached oracle directory;
приватный путь исходной native-копии публично не дублируется.

## Отдельная матрица Water — ещё не исполнена на кандидате

| Проверка | Достаточное доказательство после выдачи freeze |
| --- | --- |
| Identity | Один source/art/build/manifest SHA и board04/trial02 inputs; all local/HTTP bytes, route `/review/r4d/p3-masks-water/`, JS MIME, Pixi/MIT/private-source exclusion. |
| Native/PRNG | Whole config неизменён кроме нового seed; первые три обычных UI seeds без отсева, direct pinned oracle, states/events/endpoints и rngU32; replay. |
| Gate | Реальный seed1/1014–1016 как начальный witness, фактическое пересечение и соседние кадры обеих feet/lintel/opening, частичные ball/shadow masks и движение. Не заменять картинкой ворот без взаимодействия. |
| Дополнительные контакты | Доступные ordinary foot/pillar/frog/boundary контакты; поле и receiver02, input seed2/t1275 как воспроизводимый ориентир. Недостигнутое явно отделить. |
| Time/JSON | Real-time, pause, +1/+N, seek назад/вперёд, download/import после fresh load, дальнейшие ticks совпадают с oracle. |
| Просмотр | Art/Geometry независимо, diagnostic ball не скрыт mask, actual config geometry выше art; view/framing/zoom/pan сохраняют состояние и PRNG. |
| Метод/качество | Цельный исходник сохранён, footprint/shadow не заменены новым collider; rendered проверка вместе с отдельной VQA. Изменение алгоритма/подготовки фиксируется отдельно от исходного переноса. |

Нужна отдельная frozen выдача Water с exact source/art/build/hash/file-manifest,
одинаковые bytes для TQA/VQA и подтверждённый preview/port. Сейчас кандидата,
его browser теста и вердикта нет. `server_write=false`; старый Jungle token
не используется. Браузеры/серверы не запускались; native probes завершены,
активных процессов и ожидания нет.

Ресурсы перед probe, 09:36:44UTC: RAM free16.737/31.907 GiB, CPU4%/24logical,
C/D/E free16.288/16.280/11.941 GiB. Совокупная добавочная оценка двух лёгких
QA probes ≤0.7 GiB RAM/0.01 GiB E, в пределах ориентиров Lead; не резерв.
Outputs/temp раздельны по доске на E, env process-local; cleanup не выполнялся.
