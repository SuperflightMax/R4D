# Water w01 — первый generated mini, передача независимым QA

30 октября 2026, Europe/Kyiv. Содержательный первый local production handoff: новый floor/ball/shadows и pillar03/04 работают в настоящем native/Pixi. Это **partial mini**, не полный перенос Water/Dark и не independent/artistic PASS. `serverWrites=0`, `tokenGranted=false`; отдельного CTO release token нет. Jungle RESULT и frozen outputs сохранены.

## Exact frozen snapshot

| Pin | Значение |
|---|---|
| Consumer source / branch | `41349b8d8ae61ceb69e288301af7c080e2b006b5` / `codex/r4d-p5-regenerated-builder-01` |
| Source prefix | `experiments/p5-regenerated-objects/transfer-water-dark/water/builder/` |
| Artist | `094301dda9a43e7b4970af9d9af20982a38fb221` |
| Artist manifest | `experiments/p5-regenerated-objects/transfer-water-dark/water/asset-artist/asset-manifest.mini-01.json`,13990bytes/SHA256 `7d551ff2eebfeef6f23674c140836f010ed16b6da11b42822af708f92c292981` |
| Staged manifest | `assets/manifest.json`,10228bytes/SHA256 `bf468e44bf8bacbab8d810a1a86a57228515abc2c665397b45e8b2ea80313fe2` |
| app.js | 570782bytes/SHA256 `3f7285b11617d900a55404aaaa15d5dbb4fbf4a385eba210ed862ab5cd29c055` |
| Public root | `E:/R4D/perspective/p5-runtime/builder/transfer-water-dark/water/output/previews/w01/public` |
| FILE_INDEX | `E:/R4D/perspective/p5-runtime/builder/transfer-water-dark/water/output/previews/w01/FILE_INDEX.json` |
| FILE_INDEX bytes / SHA256 | 4851 / `b65666c1c942d71763115f05744358ef45463f0fa528a4da0e9f0b8b3d912c4e` |
| Preview index | `.../water/output/previews/w01/index.json`,12125bytes/SHA256 `6b30fdf4f76d665c8d9aeb2c9d9b6d9e0398da3caa2326fa462a8ca37e7d4ce1` |
| Inventory | 17 public files /6771984bytes; каждый path/bytes/SHA в FILE_INDEX |
| Dependency lock | `data/dependency-lock.json`,4341bytes/SHA256 `b1bdcd0eb94d0d5c7bb11195eae7d90c16ac9e006484d2a9a192c851559e7678` |
| Preview | `http://127.0.0.1:55188/`, PID **38664**, exec session **80589** |
| Host / startup | `WIN-36E9FF9EJM0` / `2026-10-29T23:39:09.036Z` |
| Owner snapshot | `E:/R4D/perspective/p5-runtime/builder/transfer-water-dark/water/preview-owners/w01-pid38664.json` (current owner теперь у w02) |

Ownership подтверждён owner/process command/root/listener. Новый порт55188 был свободен; чужие процессы не менялись. W00 PID13048/session52196/port55186 оставлен, его owner snapshot в `water/preview-owners/w00-pid13048.json`. D00 PID37032/session18796/port55187 оставлен. Own IAB вкладки закрыты; servers/root сохраняются для адресных QA. HTTP200 exact app/manifest/config/dependency-lock и все17 frozen file hashes проверены. Raw native TS/maps/private staging исключены explicit whitelist. Это не release/privacy approval.

## Канон и неизменённые входы

Canon `b1382dd4c230815a019e52e2ec4617ef705661d5`, transfer card blob`09f33f99d771ab28b9575de1a358acc40b4d571c`; ORDERrev5, P2-P6-transfer, P5, COMMON, Builder projectrole прочитаны через read-only `E:/R4D/perspective/p6-source.git`. Common JSON SHA256`497eb8cca3aa7413254a85b18d98a1e7dfde66d9779c39fc6b5932a21f2b4946` прочитан целиком.

Accepted P1`4b47db04c7140ebf88f69b91faa0b790d46f22ec`, **Water04/trial-02** exclusively: config27231bytes/SHA`9048b28af2923c93d8be772367beeb828f1e4513a6298af1c803379f77d3e50c`; manifest15870bytes/SHA`48c4fef26fd8c94f06c278851222ef285edda54ac14e53da8908f4ee663dc420`. JPG527016bytes/SHA`8da65c76c110b6ba7cefe113564fe12feed4428e84e84835f033e7da31d3b80d` read-only и просмотрен. Trial01 historical startup FAIL не запускался/не подставлялся. Exact Git bytes materialized без PowerShell reencoding. Per-board projection и translation`[33256,34124]` сохранены; view-math3050bytes/SHA`96f01cc2093c353ff958cb906fe0c8ae93412425d0f7a5ec7cca0f2bf9f1aa5e`.

27 cached native files проверены SHA/bytes и reused: source`5a6fa03f1cdb3de88a2d9c7dbe795eb8e2a7f023`, package tree`008d16a80a26bb77d562a45218b01da09b0d9ff0`. В input-verification используется common naming`sourceCommit/packageTree`. Config:6pins/106segments/4buckets/1drop,r16,tick5ms,quantize7,g980,maxspeed2000,noise2deg/.02,lcg32. Native source не rematerialized, physics/start/config/projection/PRNG не менялись. Verified Pixi8.17.1/esbuild0.25.12/Node24.15 reused; npm install/полного старого dependency audit/Jungle oracle не было.

## Сохранённый метод и новые параметры

Baseline: Jungle RESULT`df0d95f40e60991632c885f0bc53d32497a090e7`, consumer`af23e124cf5bd1d9de884082ffbc993448217112`, Artist`a5ec68fb2ed6aeacd8c66bc575166567bd0c3966`. Старые receiver02/04/rails/raisedplants/rarecontours PARTIAL/UNVERIFIED не переименованы в PASS.

Сохраняются generated raster sprites, uniform scale по ground footprint width, declared parts/native ground depth и generated-floor sourceClip. Адаптация данных: реальные P1 segment loops, их area centroids и halfY extent для part depth; virtual art assembly arch объединяет две существующие feet для регистрации, **не создаёт solid hull/lintel/height collider**. Counts/translation/projection больше не Jungle constants. Сортировка/подготовка принципиально не заменены; исходный w01 сохранён до будущих существенных variants. `BASELINE_RECIPE.json` и contract фиксируют границы.

Ранний contract/schema/example/targets опубликованы `5d40b82ac6b2b69f7077bb9bfe58c7560fbf783e`. Targets345191bytes/SHA`8e6976b9e40aa202a8dc34da9bad49b96d5fa6135aa1e1d6be22d567b8cf7559`:21art groups/29physical object targets/8arch assemblies/4receivers. Numeric example не является реальным ассетом.

## Art coverage и измерения

5 unique exact native-imagegen PNG /7instances: новый floor, sphere, ball-shadow, obstacle-shadow-v2 и pillar-mid-v1 с body/shadow на pillar03/04. Все SHA/bytes/dimensions/alpha bounds проверены consumer verifier. Два BINDINGS native/source matched; pillar depth residual после uniform scale **−0.09324019342998469sourcepx**. Faceted support измерен ellipse proxy, не выдан за точный ground polygon/художественный PASS. Pixels не правились, trim/XYwarp/instance offsets нет. Полные prompts/raw/native links, excluded frog/arch/shadow v1 failures сохранены Artist. Original crops/Jungle PNG не используются как новый финальный арт.

Selected directory: `E:/R4D/perspective/p5-runtime/asset-artist/transfer-water-dark/water/selected/mini-set-01/`. Exact SELECTED/BINDINGS/HANDOFF sidecar pins в frozen index; own materialization `water/handoffs/mini01/`.

Новый ball: visible bbox[99,101,1052,1046], sphere center[625,624], ground anchor[625,1147], **L523texturepx**, около±3px optical uncertainty. `scripts/receiver-clearance.mjs` выводит общую hR=L*sB/sR policy из НОВЫХ art/projection. Receiver textures пока отсутствуют, hR не вычислялся; Jungle17.8px не подставлялся. Штатный IN_BUCKET не дополняется sinking.

**Missing:**19/21art groups (5pillars,6frogs,8arches),27/29physical targets, все4receiver/back-front, long walls/near edge/sourceClip/raised environment. W01 sourceClipCount0. Соответствующие contacts остаются реальными и доступны geometry diagnostic; отскок у отсутствующего арта не скрывается. Контуры арок/ворот не считаются проверенными.

## Actual самопроверка и evidence

Own hidden IAB, UI Play/Pause/Replay/+1/seek, source Art/Geometry/Whole/Field. **14paused snapshots/10unique seed-tick pairs** точно совпали с существующими TQA native traces; нового oracle/full matrix/seed search нет. Seed0: realtime до pause73, pillar03 front event585→states585/586/587, Art/Geometry/Whole/Field586 и сохранённый LOST1326. Новый шарик/оба pillars/shadows загрузились, контактное положение рассмотрено actual кадрами; общего light/shadow/artistic PASS нет.

![Water w01 actual pillar03 front state586](E:/R4D/perspective/p5-runtime/builder/transfer-water-dark/water/evidence/w01-browser/seed0-t586-pillar03-front-art.jpg)

Seed1:1008/1014/1021 и actual realtime998→pause1065; сохранён LOST1196. Arch07 доступен ground disk с касаниями по TQA, но здесь **нет arch art**: только diagnostic footprints/new ball. Это не проверка высоты, проёма или скрытия под lintel. Moving AX read1032 и screenshot1048 не атомарны; paused frames точны. ArtOff586 убирает текущие sprites/floor; активных masks в этом subset нет, future mask bypass ещё требует actual QA.

TQA input reports полностью прочитаны: source`761e6087c902fe5ea941b90b5ce4d72383a0d755`, Water/Dark`qa/technical/REPORT_INPUT_ORACLE_001.md`. Ordinary seeds0–3/LOST сохраняются. Water windows109959bytes/SHA`31a339e874a0c48f0a4ccc644cfbcdc5c612169022851971997482239903a744` использованы read-only; четыре oracle серии не повторялись. Seed0 trace213256bytes/SHA`bba8f933de901cc6781a71d6c51f0f60fdcd1e0bcfbe765c7ad9c0625a5df51d`; seed1 trace191625bytes/SHA`bca460bdf161bf2f867181f45ab552154a309baa7b45564e47f4494f68913607`.

Evidence index `E:/R4D/perspective/p5-runtime/builder/transfer-water-dark/water/evidence/w01-handoff/EVIDENCE_INDEX.json`: **33172bytes**, SHA256 **`a2e8efe5a8a9720099807210cb276cf315870c56ad9568c4962055843c8e8489`**. Включает101browser files w00/d00/w01 и7report/owner/reader snapshots с bytes/SHA/MIME. Summary17959bytes/SHA`7e48e2a28f114a1c3f2990f821f1ef1c26107def39e8d305a80185d21a0f18ae`. Raw JPEG без reencoding. UI download/timeout/resize/DPR/full contacts/partial masks/receiver rendering ещё unverified.

## Открытый W01-V01 — стартовый ball crop

После основного selfcheck VQA адресно передал W01-V01. Builder воспроизвёл на неизменном frozen w01: seed0/state0 Field обрезает верх сферы, Whole0 показывает её целиком; Field100 уже помещается. Actual states0/100 совпали с existing native trace, Whole↔Field0 сохранил state/RNG. Причина подтверждена: старый Field minY270, новый ball alpha>0 при accepted drop начинается с249.72811384258958sourceY (visible bounds251.8288319211287). Камера не учитывала поднятый authored silhouette. Это consumer framing defect, не P1/native input defect.

Repro evidence `E:/R4D/perspective/p5-runtime/builder/transfer-water-dark/water/evidence/w01-framing-repro/INDEX.json`:1424bytes/SHA`c62bd153ad389ee153a973d0926e1fa40d796f311c4a9b07747e064c9bc9f8c3`. w01 сохраняется как исходный результат. Коррекция measured start-ball alpha bounds выполнена в отдельном [w02](HANDOFF_W02.md); independent closure остаётся VQA. Новая сортировка, world offsets, native/config/RNG corrections не нужны. Ранние40TQA actual state/RNG/config/event matches сообщены Lead; полного art/order PASS это не даёт, pillar04 contact и hiding за pillars остаются unverified.

## Сохранность и продолжение

W00 index9317bytes/SHA`1c24369b778abd4215dba96b1c8d823a4dbb421774a32c6d14d5c1ccb2c598a2`; D00 index9159bytes/SHA`32f9c97254c12f7847c1ebb6fdae023ec4091c782584e2c68c983970ad8e3f2b` сохранены, source`62c58d0c6a5a8c6c51d83084158c65721000b19e`. Dark exact inputs/targets и native/Pixi scaffold подготовлены отдельно; [HANDOFF_D00.md](../../dark/builder/HANDOFF_D00.md).

Fresh w01 build guard23:37UTC: RAMfree10.796/31.907GiB, CPU6%system/8.75%aggregate,WS26.748GiB/552processes; C14.620/D14.648/E9.728GiB. Own peak2GiB RAM/.3GiB E + concurrent4/2GiB соблюдён. Browser guard23:38:59: RAM10.514,CPU0%/aggregate4.42%,WS26.838/549procs,C14.554/D14.648/E9.702. Shared WS не уникальная RAM. Outputs/TEMP/cache process-local own E; model/effort/host/settings и foreign worktrees/PIDs не менялись.

Обычная materializer SyntaxError`Unexpected token )` возникла до выполнения/записи; исправлен только script. Один build tool yield с неполным отображением metadata проверен read-only own log, успешный build не повторялся. Нового denial нет; исторические forbidden403/call/transport fallbacks не выполнялись. SSH/Review/server actions0; Jungle token закрыт и не reused.

Следующий шаг — independent w01 TQA/VQA; параллельно Artist продолжает arch/frog/receiver/foreground и Dark art. Для successor — новый frozen id, w01 не перезаписывать. Смена принципа подготовки/сортировки требует отдельного variant после сохранения baseline. Публичная доставка только по отдельному concrete CTO token.
