# Water front-edge-04 — независимая Technical QA

29 октября 2026, Europe/Kyiv. `technical-qa-r4d-p3-masks-01`.

**Technical PASS в проверенном объёме:** exact candidate/input identity,
delivery/MIME, native config/states/events/PRNG, browser JSON/replay/controls.
Подтверждённых новых технических дефектов в этом объёме не найдено.
Общий художественный/mapping/method PASS не выдан. W-EARLY-POP-01 этой ролью
формально не закрывается; visual closure и полный цельный кадр/движение — VQA.

## Точный кандидат и последовательность

| Поле | Pin |
| --- | --- |
| Candidate | `water-front-edge-04` |
| SOURCE | `5196c0bd4981992c4e3d9678438aed1aa1c0d84c` |
| ART | `5c9ba8c640b344094e0ada7c4ed6c9ec076550e5` |
| ART prefix | `experiments/p3-masks/transfer/water/asset-artist/variants/arch-front-edge-01/` |
| assets.json SHA256 | `4a5bc16f69146fe26a3e3893fcf3c1c8e5b943400bc65d5215cb41d58efeece6` |
| file-manifest SHA256 | `de1344afcb197115b76cb4006ead3d96e7b2581a1a299df1100d7a552d2ce2c6` |
| Frozen root | `E:\R4D\perspective\p3-runtime\builder\transfer-water-dark\water\front-edge-04` |
| Preview | `http://127.0.0.1:6868/review/r4d/p3-masks-water/` |
| Handoff полностью прочитан | `017c6d7756aa99ef13ec941ff1b86aaa36ec4455`, Water builder `STATE.md` и `RECIPE.md` |
| QA baseline HEAD | `b327ae601a4962dd5826abfbfdeefaf77c090a55` |

Dark сначала полностью завершён, commit+push и точный handoff переданы Lead;
его own tab закрыта. Затем создана отдельная Water tab2, runtime и evidence.
Существующая ветка/worktree те же; новых threads/branches/worktrees нет.
Jungle/Dark и их статусы не менялись. Frozen payload/source/ART не правились,
серверы не запускались/не останавливались. `server_write=false`, release token
не использовался, staging/upload/lock/service/deploy действий нет.

## Exact bytes, inputs и лицензия

Все **101 файл / 3 578 247 bytes** проверены на диске и по HTTP:
100 payload entries / 3 561 039 bytes плюс manifest / 17 208 bytes.
Точный набор файлов, уникальные entries, каждый size/SHA256 и response body
совпали; каждый GET — 200. MIME проверен у всех JS/JSON/HTML/CSS/PNG/JPG/TXT.
82 файла непосредственно связаны с exact Git objects: восемь SOURCE files
и 74 raw ART files (71 masks, ball, shadow, assets.json).

P1 exact `4b47db04c7140ebf88f69b91faa0b790d46f22ec`, board04/trial02/candidate02:

| Вход | SHA256 |
| --- | --- |
| Config | `9048b28af2923c93d8be772367beeb828f1e4513a6298af1c803379f77d3e50c` |
| P1 manifest | `48c4fef26fd8c94f06c278851222ef285edda54ac14e53da8908f4ee663dc420` |
| Projection | `ee0c6e429d4e0b1da6c342174d22369cd293c3fc4b18ccd7d09a4690f71da54f` |
| Source JPG | `8da65c76c110b6ba7cefe113564fe12feed4428e84e84835f033e7da31d3b80d` |

Pins сверены по actual freeze record, build metadata, prepared inputs и
побайтно с P1 Git. View-math также exact. Не подставлен старый trial01.
Counts6 pins/106 segments/4 buckets/1 drop; r16/tick5ms/quantize7/
g980/speed2000/noise2deg/0.02/lcg32 сохранены. Исходные oriented loops,
translations/domains и 2D gate clearance — [INPUT_PREFLIGHT](../INPUT_PREFLIGHT.json).

Pixi8.22.0 и MIT notice совпали с ранее проверенными bytes; notice входит
в HTTP/hash matrix. Private TS/TSX/maps, sourcesContent/sourceMappingURL,
private-key markers и неожиданные абсолютные пути в payload не найдены.
Два **объявленных reference исходного JPG диска K:** остаются в P1 metadata;
allowlist ограничен exact `INPUT_PREFLIGHT.source.path` только в этих двух
inputs. Metadata не переписывалась. Это проверка доставки/явных маркеров,
не полный security audit.

## Строгий scope data-коррекции

Независимое сравнение exact **full ART17dc → corrected ART5c9** показало:

Original full ART: `17dc9fcdc261562acb581dd8590096819734c807`;
original SOURCE: `c73d6128970b2b022d5313b08c34cafdec9a1bc3`.
Сравнение ниже выполнено по Git ART bytes/objects. Preserved full-method-03
manifest из handoff: `b3c697675ecd76af7848fa72367f943c1b9e4a27b325b098a9fef08135fe58d3`;
отдельный полный QA старого bundle здесь не выполнялся.

- Ровно24 changed depth records — left-body/right-body/lintel восьми arches.
- Остальные47 regions, все73 PNG, ball/shadow metadata и top-level metadata
  совпали. Rect/crop/path/id и прочие поля каждого occluder неизменны.
- Все24 depth records соответствуют midpoint near/front edges16 accepted
  feet: body scalar Y и lintel line через две midpoint. Выбран near edge
  с максимальным native midpoint Y. Максимальная разница арифметического
  округления `7.275957614183426e-12` units при tolerance1e-8; byte checks
  файлов остаются точными, native-state equality не ослаблялась.
- Renderer SHA256 `760c9bada40cb3ecb944f332f6efa91bb3c1340ce7f1ad9c2cabeda4dca0a3e6`
  и bytes совпали с SOURCEc73 полного original. Новая sorting/physics не добавлена.

[variant-scope-verification.json](../evidence/front-edge-04/variant-scope-verification.json)
содержит IDs, выбранные edges и midpoint. Сравнение **не распространяется**
на ранний семимасочный ART4eb4001 / early02, к которому относится исходный
W-EARLY-POP report26295340cafa78ea8bffe09e8005badda220d731. Между4eb и full17dc
есть отдельная PNG provenance/alpha история; её классификация здесь не
выполнялась. Нельзя приписать весь переход4eb→5c только24 depth изменениям.

## Независимый native и собственные ordinary runs

Expected results получены direct `Sim` из независимого cached oracle, не из
Builder adapter. Его14 transformed modules ранее повторно сверены с exact
Git blobs в этой роли при подготовке Water. Core
`5a6fa03f1cdb3de88a2d9c7dbe795eb8e2a7f023`, package
`008d16a80a26bb77d562a45218b01da09b0d9ff0`, src tree
`6539b91a379d32c22281d43e71bb17fecb608437`.
Compiled native SHA256
`af8e6dea9ee5c46759f99ba3b68f4afa91c740b4fd2aba2d2d3f65bfa66753fa`
совпал с ранее независимо rebuild-verified bundle.14 consumed blob IDs
совпали с prepared oracle. Повторный native build не требовался,
private TS/oracle modules в Git не добавлялись.

| Набор | Seed | Terminal tick | Outcome |
| --- | ---: | ---: | --- |
| Объявленный | 0 | 1326 | LOST |
| Объявленный | 1 | 1196 | LOST |
| Объявленный | 2 | 1275 | IN_BUCKET receiver-02 |
| Объявленный | 3675989190 | 934 | LOST |
| Объявленный | 2939425288 | 984 | LOST |
| Первый собственный UI random | 2567603743 | 1448 | LOST |
| Второй собственный UI random | 2664424314 | 733 | LOST |
| Третий собственный UI random | 4133151857 | 587 | LOST |

Собственные seeds — первые три нажатия «Новый бросок», без отсева. Все
доведены до terminal в browser. Для восьми runs сверены **8 491 полное
состояние**, ordered hit events, outcomes, config и PRNG; configs меняют
только обычный rng.seed. Все11 shipped checkpoints совпали и replay-import
проходит. Wrong/missing board ID и tampered rngU32 программно отклонены.

**90 browser checkpoint samples**:88 actual public snapshots и два actual
downloads. Каждый full checkpoint/config/state/rngU32 совпал с direct
oracle. У всех88 snapshots также совпал runInfo с полным списком hits и
terminal outcome. Проверены full traces/контакты всех трёх собственных seeds.
Предъявленные seed1 и2 дополнительно реально проиграны в UI до1196/1275.

## UI/JSON и actual rendered cases

На own seed4133151857: pause70 → +1→71 → +10→81; четыре комбинации Art/Geometry
на t81, source/whole/100% → flat/floor/200% и видимый pan. Full checkpoint
сохранён. Diagnostic geometry — actual config contours выше art; Art-off
не оставляет невидимые foreground masks. Native не получает view changes.

Actual download большого uint32 seed4133151857/t81 → fresh reload → file
chooser import восстановил full checkpoint; следующий +1→t82 совпал.
Отдельный actual download seed2664424314/t733 также побайтно сохранён и
полностью совпал с native. Board-negative fixture отличается только boardId
в копии собственного Water JSON; отклонён без изменения Water t82/state.
Данные Dark в эту проверку не импортировались. Replay own third от0 до587,
включая смену только display, даёт тот же terminal. Seek Home0/End587/back87
совпадает с native. Display не является частью native checkpoint schema.

| Actual case | Наблюдение и сохранённые frames |
| --- | --- |
| Arch07, seed1 | Полный ряд1006–1022 при100% и200%, всего34 native/Pixi frames; соседние тики получены +1. Native hits left-foot1006/right-foot1012/left-foot1018. Просмотрены1014–1016 и1020–1022 в обоих масштабах: частичный sphere overlap/проход виден, заметного жёсткого переключения на этих тиках не найдено. Это ограниченное наблюдение текущего кандидата. |
| Frog01, seed1 |104/105/106 с pan вниз; visible sphere у frog на native contact105. |
| Pillar05, seed1 |709/710/711; partial ball у боковой/передней грани, native edge-01 hit710. |
| Left2, seed1 |518/519/520 и geometry overlay519; visible boundary contact519, контур проверяется на том же состоянии. |
| Receiver02, seed2 |1250/1265/1274/1275 и geometry1275, pan вверх оставляет весь бассейн видимым. На1275 native IN_BUCKET, sphere остаётся видим внутри нарисованной воды. |

Pan на seed1/t1015 отдельно сохранил full checkpoint. Для всех17 gate ticks
checkpoint при100% и200% **полностью одинаков**. До/после camera changes
четырёх receiver frames checkpoint тоже неизменен. Скриншоты — actual
browser; paused/terminal curated frames не реконструировались и не редактировались.

Отдельный source-derived расчёт показывает arch07 ball-restoration predicates
active3→0 на1021, shadow-restoration3→0 на1019 при штатном offsetRadius.
Это **не наблюдение GPU flags и не pixel/visual closure**. Самостоятельный
shadow pass сохранён; native witness прохода не заменяет rendered evidence.
См. [arch07-source-predicates.json](../evidence/front-edge-04/arch07-source-predicates.json).

## Границы вывода

На receiver approach t1250 sphere находится над нарисованным боковым
разделителем, затем в бассейне. Это наглядная граница общей2D floor/source
height модели и повод для VQA mapping assessment; native state верен.
Receiver regions/PNG и renderer неизменны в строгом сравнении full17dc→5c9;
это наблюдение не приписывается24 arch-depth records.

Не заявлены visual PASS всех71 silhouettes, каждой стороны/угла/partial
shadow, всех8 gate crossings или всех4 receivers. Floor flattening не делает
высокие нарисованные объекты видом сверху. FPS benchmark, полная3D физика
и окончательная художественная интеграция не проверялись. W-EARLY-POP-01
остаётся предметом независимой visual closure VQA/Lead, включая отдельную
shadow оценку и корректную цепочку сравниваемых ART версий.

CDP Network не дал событий; root Resource Timing —12 ресурсов со status200,
без PNG/JPG; console warn/error0. Это **не полное browser network coverage**.
Все101 HTTP bodies/MIME отдельно exact; browser реально загрузил71 masks.

## Packet и воспроизведение

[Evidence index](../evidence/front-edge-04/index.json):43 выбранных screenshots,
восемь checkpoints (два actual downloads с неизменёнными bytes и шесть public
snapshot checkpoint objects), hashes фактов/картинок. Полные34 gate frames и
весь raw сохранены на E, каждый файл включён в
[raw-index](../evidence/front-edge-04/raw-index.json).

Raw root: `E:\R4D\perspective\p3-runtime\technical-qa\transfer-water-dark\water\front-edge-04`.
[verify-front04.mjs](../verify-front04.mjs) проверяет exact package/Git/P1/
variant/native; `--browser` — собственный saved raw. Paths явно закреплены.
Для UI импортировать Water checkpoint и выбрать нужный tick из таблицы;
source/whole/200%, для frog pan вниз, для receiver вверх. Снимать непосредственно
после pan; изменение zoom/view снова подгоняет кадр. Fixture — отдельно от
положительных browser samples. [collect-front04.mjs](../collect-front04.mjs)
собирает curated packet, сохраняя raw.

Перед browser11:18:05Z: RAMfree16.617/31.907GiB, CPU4%,
C/D/E17.035/16.275/11.763GiB. Оценка добавочного peak own≤0.9GiB,
две QA+previews≤2.3GiB — оценка, не измерение/резерв. Postflight11:40:22Z:
RAMfree15.863/31.907GiB, CPU3%, C/D/E17.015/16.268/11.734GiB.
Все output/temp — own E runtime; TEMP/TMP только process-local. Own Water
tab2 закрыта, обе Builder previews не тронуты. После handoff — idle.
