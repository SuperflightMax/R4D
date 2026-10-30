# Water w02 — отдельное исправление startup Field crop

30 октября 2026, Europe/Kyiv. W01-V01 воспроизведён на immutable w01 и адресован в отдельном **framing-only w02**. В Producer actual check стартовый ball полностью виден в Field/Whole; независимое закрытие принадлежит VQA и пока pending. Art coverage остаётся тем же partial mini01; полного художественного/order PASS нет. ServerWrites0/tokenGranted=false.

| Pin | Значение |
|---|---|
| Consumer source | `f06ed5d7f87dc3e51323881d3ce8380ead65ea18` |
| Artist / manifest | `094301dda9a43e7b4970af9d9af20982a38fb221`;13990bytes/SHA256 `7d551ff2eebfeef6f23674c140836f010ed16b6da11b42822af708f92c292981` |
| Public root | `E:/R4D/perspective/p5-runtime/builder/transfer-water-dark/water/output/previews/w02/public` |
| FILE_INDEX | `E:/R4D/perspective/p5-runtime/builder/transfer-water-dark/water/output/previews/w02/FILE_INDEX.json` |
| FILE_INDEX bytes / SHA256 |4851 / `1a8945190e064be5fedfaa80c30a1aa9f24db048d2bef407546c53246697cdcb` |
| Preview index | `.../water/output/previews/w02/index.json`,12125bytes/SHA256 `1ffd27a73c5f4be6bff6865c054e2764367eb46a13c96460d472ac38543ac29d` |
| Inventory |17files/6772069bytes, каждый file path/bytes/SHA внутри FILE_INDEX |
| app.js |570867bytes/SHA256 `0571bbdaa541fa8d5ad617c686118d69b4ba7dacca746652dc99f8489cc248c2` |
| Staged manifest |10228bytes/SHA256 `bf468e44bf8bacbab8d810a1a86a57228515abc2c665397b45e8b2ea80313fe2` — exact w01 bytes |
| Preview |`http://127.0.0.1:55190/`,PID **17036**, exec session **64255** |
| Host / startedUtc |`WIN-36E9FF9EJM0` / `2026-10-30T00:00:14.387Z` |
| Owner |`E:/R4D/perspective/p5-runtime/builder/transfer-water-dark/water/preview-owner.json` |

Port55190 проверен свободным, own PID/command/root/listener matched. W01 остаётся на55188/PID38664/session80589; owner snapshot `water/preview-owners/w01-pid38664.json`. W00/d00/Jungle и все frozen bytes сохранены. Root/listeners не заменялись; новая вкладка w02 была собственной hidden IAB и после проверки закрыта.

## Причина и ровно эта коррекция

На w01 seed0/state0 Field обрезал верх шара, Whole0 показывал целиком; Field100 уже помещался. Source Field domain учитывал ground geometry, receiver/foreground bounds, но не поднятый authored ball silhouette. Old minY270; raw alpha>0 new ball при accepted drop имеет minY249.72811384258958, visible>=16 minY251.8288319211287. Repro с actual states/screenshots: `water/evidence/w01-framing-repro/INDEX.json`,1424bytes/SHA`c62bd153ad389ee153a973d0926e1fa40d796f311c4a9b07747e064c9bc9f8c3`.

В `src/framing.mjs` ball включён в important part bounds по **alpha>0** и actual authored ground anchor/scale. `src/app.mjs` использует эти bounds **один раз на accepted initial drop**, до запуска движения; затем domain не меняется при ticks/replay/Art/Geometry/Whole/Field. Новых world offsets, seed/tick branches, перемещения sprite/native target, RNG calls или новой сортировки нет. Metadata rule уточнён; first w01 baseline явно сохранён в BASELINE_RECIPE.

Фиксированный новый source domain: X`120.00000000000242..1414.9999999999982`, Y`249.72811384258958..1222.7983538935216`. Изменился только minY; прежние maxY/minX/maxX сохранены. Это не magic Jungle padding: bound получен из нового ball PNG alpha[0,23,1168,1193], groundAnchor[625,1147], scale0.026932283058193875 и accepted drop source[712,280]. Existing8CSS margin и contain правило не менялись.

В public inventory изменился **только app.js** (+85bytes);16остальных файлов,5PNG, source/staged manifest, config/projection, dependencies/terms и controller/native inputs unchanged. Поэтому это обычная framing correction того же метода, не variant сортировки/подготовки. Все17files проверены на диске; HTTP200 app/manifest/config совпали с pins.

## Actual follow-up

8paused snapshots/5unique seed-tick pairs точно совпали с existing TQA traces0/1, без нового native oracle/seed search/full QA. Рассмотрены Field0/Whole0, Art+Geometry/ArtOff0, Field100, pillar03 front586, seed1 replay0 и +1state1. Во всех8 snapshots domain совпал с новым fixed domain; native state/RNG при view controls сохранились. Whole0/Field0 показывают весь стартовый шар; Field100 и586 рассмотрены без нового очевидного crop. Это Producer observation, не independent closure.

![w02 Field0 — весь стартовый ball](E:/R4D/perspective/p5-runtime/builder/transfer-water-dark/water/evidence/w02-browser/seed0-t0-field-art.jpg)

Evidence `E:/R4D/perspective/p5-runtime/builder/transfer-water-dark/water/evidence/w02-handoff/EVIDENCE_INDEX.json`: **10190bytes**, SHA256 **`20f0c1d1b18931b96912150c37779efc6cddbe7b9d10b553cb4edc19108b33b5`**.25browser files +7report/owner/reader snapshots, original JPEG SHA/bytes/MIME, source numeric regression и HTTP checks. Summary6231bytes/SHA`0ce8d685f4a0e78f0f5cc4df7b024956975d3645844ea2e2f8f7267d0eaf1779`.

## Сохранённые входы и остатки

P1`4b47db04c7140ebf88f69b91faa0b790d46f22ec`, Water04/**trial02**, configSHA`9048b28af2923c93d8be772367beeb828f1e4513a6298af1c803379f77d3e50c`, sourceJPGSHA`8da65c76c110b6ba7cefe113564fe12feed4428e84e84835f033e7da31d3b80d` unchanged. Cached native source`5a6fa03f1cdb3de88a2d9c7dbe795eb8e2a7f023`/tree`008d16a80a26bb77d562a45218b01da09b0d9ff0`,r16/tick5ms/quantize7/g980/maxspeed2000/noise2deg/.02/lcg32 не менялись. Raw TS/maps не public; separate release/privacy gate pending.

Набор прежний5textures/7instances: floor/ball/shadows и pillar03/04. Missing19/21artgroups,4receivers/front rims, arch/frog/sidewalls/near-edge/sourceclips. Hiding за pillars и pillar04 contact не получают PASS по имеющимся native совпадениям. Arch07 проход остаётся diagnostic без arch art; heightphysics не заявляется. Artist-authored ограничения в frozen manifest/index сохранены дословно с pre-Builder status; scoped actual checks выше дополняют их по времени, не подменяют independent QA.

Подробности первого material checkpoint, всех P1/Art/dep pins, saved ordinary LOST и Dark scaffold: [HANDOFF_W01.md](HANDOFF_W01.md), [HANDOFF_D00.md](../../dark/builder/HANDOFF_D00.md). Старые Jungle RESULT`df0d95f40e60991632c885f0bc53d32497a090e7` и recipe/sourceconsumer`af23e124cf5bd1d9de884082ffbc993448217112`/Art`a5ec68fb2ed6aeacd8c66bc575166567bd0c3966` сохраняют прежние PARTIAL/UNVERIFIED.

Fresh build guard23:58UTC RAMfree10.131/31.907GiB,CPU4%/aggregate2.96%,WS27.546GiB/545procs,C13.989/D14.640/E9.660GiB; peak2RAM/.3E+4/2allowance. Browser00:00:06UTC RAM10.329,CPU8%/aggregate10.29%,WS27.130/526procs,C13.987/D14.640/E9.649; peak1.5RAM/.1E+4/2. Outputs/cache/TEMP own E/process-local, global/model/effort/host/foreign settings/PID не менялись; denial0, SSH/Review/server actions0, old Jungle token не reused.

Следующий адресный шаг — независимое VQA закрытие W01-V01 на exact w02. После новых Artist mini — новый candidate с отдельными missing coverage и actual motion checks. W01/w02 не перезаписывать; public delivery только по отдельному concrete CTO token.
