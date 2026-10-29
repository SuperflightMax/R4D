# P3 Water + Dark — единый combined release intent

29 октября2026, Europe/Kyiv. Release Engineer `release-engineer-r4d-p3-masks-01`.
**WAIT_EXACT_CTO_TOKEN · server_write=false · token=null**.
Это единственный canonical intent двух sibling pages. Исторические per-board
plans1cf782e не являются отдельными releases/token requests. CTO принял оба
bounded результата71a4f50 для Review, но execution token ещё не выдан.
P5 window явно закрыт29.10.2026 в10:55:12Z; следующее окно зарезервировано P3,
P6 его не получает. Window owner: `cto-r4d-perspective-01`.

## Два самостоятельных frozen результата

Оба Lead RESULT и STATE полностью прочитаны на
`71a4f50eb0d74562d9e5e5129c5535495cdae055`; обе независимые пары QA прочитаны
полностью. Все approved local bytes независимо сверены с manifest: строго
**194 files /7088324 bytes**, включая оба file-manifest.json. Ничего из frozen
не редактируется, post-QA texts внутрь не добавлены, build/native/предметная QA
не повторяются. Public вывод **обоих — PARTIAL**, не общий art/mapping PASS.

| Поле | Water | Dark |
|---|---|---|
| Candidate | `water-front-edge-04` | `dark-receiver-front-edge-04` |
| SOURCE | `5196c0bd4981992c4e3d9678438aed1aa1c0d84c` | `d7eac5d7d76127e3138480f1f16eaf28aac0f15a` |
| ART | `5c9ba8c640b344094e0ada7c4ed6c9ec076550e5` | `e5d3e1f44c112e483ff2a23fbd169cb119390865` |
| Assets SHA256 | `4a5bc16f69146fe26a3e3893fcf3c1c8e5b943400bc65d5215cb41d58efeece6` | `2b02dcde6c07266b67285700040e4ae0342f06fb760ae6ed0cf1fdcdc9b6cbad` |
| File-manifest SHA256 | `de1344afcb197115b76cb4006ead3d96e7b2581a1a299df1100d7a552d2ce2c6` | `d180e5a63bb1dec7c510507fc2ce990e7cb10927b337a19c4bb9effc67e4ed1b` |
| Manifest bytes |17208|15737|
| Payload files/bytes |100 /3561039|92 /3494340|
| С manifest files/bytes |101 /3578247|93 /3510077|
| Sibling path |`/review/r4d/p3-masks-water/`|`/review/r4d/p3-masks-dark/`|

Host обоих будущих URL: **https://superflight.space**. Точные immutable inputs:
- Water: `E:\R4D\perspective\p3-runtime\builder\transfer-water-dark\water\front-edge-04`.
- Dark: `E:\R4D\perspective\p3-runtime\builder\transfer-water-dark\dark\receiver-front-edge-04`.

[BOARD_PUBLICATIONS.json](combined-packet/BOARD_PUBLICATIONS.json) фиксирует
раздельные source/art/manifest/assets/QA/result refs, hashes/размеры документов,
первый сохранённый метод и recipe changes. [ARCHIVE_MANIFEST.json](combined-packet/ARCHIVE_MANIFEST.json)
задаёт каждый поставляемый path/bytes/SHA256, без Repo/raw/authoring/private TS/maps.
В обоих frozen app760c9bad…0a3e6 и compiled nativeaf8e6dea…753fa, Pixi/license/P1
выданы теми же approved bytes; данные другой доски не подставлены.

### Water — Technical PASS / Visual PARTIAL

TQA `c48236803b18ff2f15e7bead312dc5c0f8966e18`,
`water/technical-qa/reports/water-front-edge-04.md`.
VQA `42dacf338ba75071269cae1ecb6072e1dabf03be`,
`water/visual-qa/front-edge-04/REPORT.md`.
W-EARLY-POP-01 локально CLOSED в seed1/arch07/1006–1022. **W-DIVIDER-01 OPEN**:
seed2/t1250, покрытие разделителя плюс неоднозначная семантика поверхности
в accepted planeCollapse2D. Не external blocker, не доказанная единственная
вина physics/P1/sorting, не global ART PASS. Artist triage
`cb8e8691ead826af21a2a4de93fb8dbb5ef07345` и решение Lead сохранены.

### Dark — targeted Technical PASS / overall Visual PARTIAL

Targeted TQA `18e880e117f30747c4d938b1f94cf3622f20fdc0`,
`dark/technical-qa/targeted-receiver-front04/REPORT.md`.
VQA `bc34a864bc44cba231d466daa46bdc7b02651845`,
`dark/visual-qa/receiver-front-edge-04/REPORT.md`.
D-POP-01 локально CLOSED на seed3858699109,2010–2019/2044–2047; пределы
покрытия направлений и shadow сохраняются. Полная TQA03
`b327ae601a4962dd5826abfbfdeefaf77c090a55` — **ранее выполнено на03**, не новая
полная QA04. Historical FAIL03/early/raw/frozen остаются сохранены.

### Recipe/provenance: renderer не равен recipe

Water71 masks: depth арок выбирается по ближним опорным рёбрам вместо центров,
24 depth records; shadow0.72/offset[-0.45,0.5]/scale[1.15,2.6]. Dark60 masks:
нижняя общая опора фасада вместо верхней внутренней кромки,12 receiver lines;
shadow0.93 при том же offset/scale. Оба варианта сохраняют scalar/line renderer
и native, но **выбор depth-опоры — явное изменение recipe**, не «неизменный рецепт».
`rendererUnchanged` в release metadata относится к соответствующему transfer
FULL03 → corrected04; это не заявление о byte identity app с Jungle.

Первые применения сохранены: SOURCEc73d6128970b2b022d5313b08c34cafdec9a1bc3 /
ART17dc9fcdc261562acb581dd8590096819734c807; Water FULL03 manifestb3c69767…58d3,
Dark FULL03b3923f4c…d0307. Полные refs в BOARD_PUBLICATIONS.
Jungle CODEf1aca21e7b9ba19001e7e8762fcaf2511bf9bf74 /
ARTf899a308aed156a11e2a1013292ed68c6669959d /
manifest e2e9f7d837b3d05f484f75a877af6992a70ee88363add783d80f3c6e206f431f,
PARTIAL/MAP-01/post-auth limits не изменяются. Jungle QA не переоткрывалась.

## Fresh opaque baseline — совпал с expected pointer

Полный RO snapshot13:33:37Z; повторный полный guard **2026-10-29T13:59:55.171643+00:00** не изменился.
Только existing `vps1-direct`, `sudo -n -- python3 -B` через stdin. Actual audit
**euid0/egid0** проверены. Сообщённый outer1003/27 не считается доказательством
root; обычный SSH python не используется для будущих privileged writes.

| Guard | Exact value |
|---|---|
| Current root |`/srv/superflight-review/releases/p5-jungle-regenerated-candidate-03`|
| Count/size |674files /88dirs /122587862bytes|
| Current RELEASE_MANIFEST |144636bytes /`b54342562a030361fb705d63b52750018956ea3cdfea204450f48a6bbeced9c5`|
| Current snippet |957bytes /`e2a466db57830bddb9003361028f99c132504ed3e12a632918898cd6c2a51224`|
| Root-normalized config |`a6b469d123e41d2e7ab51c37120c0d8b1d1595107e0e437319a08a561ece945f`|
| Full opaque metadata digest |`ed789cd60a3de3287f9a4456e68f9707df09d8487f2026d2111beee05e4d7a98`|
| Future candidate snippet |950bytes /`f7948d10efb040e83c15d86df26866aed9a5a90eb53bf85c7fd0206c05d1200e`|

Actual published673 files/122443226bytes совпали с current manifest.
[Jungle77 entries](combined-packet/BASELINE_EVIDENCE.json) совпали с исходными
Jungle hashes. Symlinks/nonregular entries нет. Live new prefixes, new root,
backup и temp отсутствуют — exact preconditions в FINAL_RO_GUARD/WRITE_SCOPE.

**Mixed ownership — часть guard, не исправлять:**592 files/84dirs uid0/gid0,
82 files/4dirs uid1003/gid27; files0644,dirs0755. Первый RO helper ошибочно
предполагал root:root для всех и остановился. Metadata-only read установил
фактические значения; pointer/counts/snippet/bytes не дрейфовали. Исправлена
только проверка в local helper. Foreign uid/gid/modes hash-bound и в новом
clone сохраняются точно; global chown/normalization не разрешены.
Это ordinary assertion, **не policy denial**. Ничего на сервере не исправлялось.

[BASELINE_EVIDENCE](combined-packet/BASELINE_EVIDENCE.json) содержит opaque tree
metadata/hash и docs/resource hashes без foreign semantic data/config contents.
[FINAL_RO_GUARD](combined-packet/FINAL_RO_GUARD.json) — свежий итог/отсутствие targets.
Чужие products/art/findings P2/P4/P5/P6 не читались; только opaque identity/tree.


Overlay parent precondition отдельно проверен по actual inventory и финальному
RO metadata digest: пересечение — только `review` и `review/r4d`, оба
uid0/gid0/0755. Все4 legacy1003:27 directories находятся вне overlayDirectory
intersection; новых directories16. [Evidence](combined-packet/OVERLAY_PARENT_PRECONDITIONS.json).
Строгая existing-parent ветка script соответствует этим observed values; при
любом будущем изменении full metadata guard/parent check останавливают операцию,
а не нормализуют чужой каталог.

## Concrete local packet и hashes

Release ID: **`p3-water-dark-front-edge-04`**.
New immutable root: `/srv/superflight-review/releases/p3-water-dark-front-edge-04`.
Runtime: `E:\R4D\perspective\p3-runtime\release-engineer\transfer-water-dark\combined\water-dark-front-edge-04`.
Exact local archive: `E:\R4D\perspective\p3-runtime\release-engineer\transfer-water-dark\combined\water-dark-front-edge-04\p3-water-dark-front-edge-04-overlay.tar.gz`.

| Binding | Bytes / SHA256 |
|---|---|
| Overlay tar.gz |4495459 /`0cee1516db37cb2ac8a38fec54214c47483f8bea755a71dbd0d04a244b3c9fbb`|
| ARCHIVE_MANIFEST.json |50581 /`c61a8476f74f061e722df98130058283ffbfd37ff1e6522d488ea1cadbeaec70`|
| Full RELEASE_MANIFEST.json |216459 /`e8a801faf58b670fd2b2cb7ba1c327d20c025593c75881915ae7d211f2fcf3f3`|
| WRITE_SCOPE.json |72260 /`aff5355dcb376ab1edef8d45455c391bb5b1099f77a7ee07240f6efe11097959`|
| Future write script combined_remote.py |15543 /`e47debc4bd1892728d114550b08c3415886abf06f10a50b797c79a5a8b15512f`|
| Future launcher combined_execute.py |5544 /`592a78db696e44bfe665b0a35d8eb66dea854a3bc0d5a354bacdf7b15fe71ef8`|
| PACKET_INDEX.json |3395 /`ae0b1054d192d05d78c91579239c942ded90682df8777ef6bf166ad0df782ecd`|

**Overlay196 files /7320545 uncompressed bytes**:194 approved frozen files plus
`review/index.html` and root `RELEASE_MANIFEST.json` publication metadata. Эти2
файла находятся вне frozen prefixes. Все196 tar entries и обе копии frozen
сверены по каждому path/size/SHA; сам transport hash закреплён выше.
Полный будущий tree: **868 files /104dirs /129749260 bytes**, из них867 browser
files /129532801bytes. New full metadata digest:
`71419d91cc132a8d63d1be21718e0f20c72a796ff65decbaf6b4c7de796c9f65`.

На E не скачивался полный122MB foreign payload. Будущий server stage клонирует
current baseline opaque в new root, сохраняет его uid/gid/modes, затем накладывает
только bound overlay. **672 прежних browser files unchanged**; старый manifest
остаётся в старом immutable root и связан previous manifest hash.

## Минимальная catalog delta

[CATALOG_DELTA.patch](combined-packet/CATALOG_DELTA.patch) — zero-context, без
текста foreign cards. Только две PARTIAL cards со своими verdict/caveat и
существующий section counter **6→8 материалов**. Никакого нового UI/схемы.
Old catalog14511bytes /`eb57e35bcebbe4a639b92c625f23de5efb90ae2c15da8a3996ca653fb61a6885`;
new15762bytes /`fd4e28b8bfb1764e9d6623009d8f21c23eb1e5df59590effc42ced55f842beeb`; delta+1251bytes.
Обратная дельта возвращает exact old catalog. Jungle/foreign cards неизменны.
Точные новые тексты — [CATALOG_CARDS.html](combined-packet/CATALOG_CARDS.html).

## Будущий exact write-set — сейчас НИ ОДНОЙ записи

Требуется **новый single exact CTO token** на этот combined scope, оба artifacts,
оба verdicts и оба script hashes. Token поле сейчас null; authorization-файла
не существует. Старые Jungle/P5 tokens и самостоятельно придуманный token
не применяются. Future write-script `combined_remote.py` и launcher `combined_execute.py`
сохранены/захэшированы и проверены только syntax; ни одна их фаза не исполнялась.
RO/local helper `prepare_combined.py` выполнял только запрошенный аудит/упаковку.

| Path | Только после нового token |
|---|---|
| `/opt/superflight-studio/backups/review-p3-water-dark-front-edge-04/` |Новый backup: `review.locations.conf.before`, `STATE.json`, `candidate-overlay.tar.gz`, затем `PUBLISHED.json`|
| `/srv/superflight-review/releases/p3-water-dark-front-edge-04/` |Opaque clone674 baseline files, preserving foreign metadata; apply196-file overlay; verify868-file complete tree/digest|
| `/etc/nginx/snippets/.review-p3-water-dark-front-edge-04.locations.conf.tmp` |Точный root-only candidate, uid0/gid0/0644; затем atomic replace|
| `/etc/nginx/snippets/review.locations.conf` |Заменить только root, nginx-t до/после и graceful reload|
| `/home/sf/assistant-context/vps/services/superflight-studio.md` и `/home/sf/assistant-context/vps/CHANGELOG.md` |Append-only exact release/двух verdicts/проверок/ограничений/rollback; без foreign findings/secrets|

Непосредственно перед первой записью: fresh host/VPS resources, actual euid0,
полные old root/snippet/manifest/tree/uid/gid/modes и все target-prefix guards.
Затем последовательно **preflight → begin → upload → stage → switch → postcheck
→ document**; без повторения completed phases. Scoped scripts не создают locks,
новые services/containers/публичные ports и не меняют auth/global MIME/security.

Перед switch снова полный old baseline и exact new tree/archive; fresh
before-snippet snapshot с UTC; temp absent. Candidate ожидается hashf7948d10…1200e,
normalized config прежний. Любой drift/занятый target/неясное владение — STOP
конкретного шага с action/target/toolcall/reason Lead/CTO; не retarget/token reuse.
Новый policy denial не обходить, sensitive policies/configs/keys не читать.

[combined_execute.py](combined_execute.py) требует внешний новый CTO authorization
JSON с token, serverWrite=true, windowOwner, releaseId, scopeSha256, scriptSha256,
launcherSha256, archiveSha256, releaseManifestSha256, authorizedPhases и правом
rollbackAllowed для switch. Он проверяет actual source/scope hashes **до SSH**.
Authorization файл будет записан только после реальной отдельной execution
команды; здесь он не генерируется. Remote script повторно проверяет euid0,
связь authorization/scope и все file/root guards прежде записей.
После token никакие script/scope bytes/line endings не менять.

## Rollback и postchecks

Proposed exact pointer: `/opt/superflight-studio/backups/review-p3-water-dark-front-edge-04/review.locations.conf.before`.
**Backup ещё не создан**. Перед switch сохранить exact957-byte old snippet,
SHA e2a466db…51224, root P5 candidate03; fresh UTC в STATE/PUBLISHED.
Rollback только если current root всё ещё наш combined root и snippetf794…1200e.
Вернуть exact before тем же temp/atomic путём, nginx-t и graceful reload;
позднюю foreign правку не затирать. Old immutable root/Jungle/DB/sessions
не удалять/не восстанавливать чужим snapshot. Конкретные config/reload failures
допускают только согласованный consistency rollback; красный smoke сначала
классифицировать, продукт ради него не менять.

После разрешённого switch: полные new868 и old674 metadata/bytes, сохранность
Jungle и обеих отдельных frozen namespaces, nginx active, catalog/navigation
и прежняя protection behavior. План215 auth GET paths (оба routes,194 files,
каталог и18 старых R4D routes), foreign Origin403 и dotfile404 —217 HTTP checks.
10 browser `.js` MIME/body и authenticated UI проверять только существующим
разрешённым post-auth способом. Login303/HTML не доказывает JS MIME/body/UI;
без такого доступа ограничения явно остаются. Никакого login/cookies bypass,
новой генерации/native build/полной QA или frozen edits ради smoke.
Window/token/slot освобождает только CTO после фактической публикации/handoff.

## Ресурсы, проверки и точка остановки

Перед RO-audit13:33:18UTC: RAMfree14.581/31.907GiB, CPU1%,
C/D/E16.594/16.237/11.024GiB. Перед packaging13:38:41UTC:
RAMfree13.986GiB, CPU3%, C/D/E16.595/16.237/11.009GiB.
Оценка добавочного peak≤1GiB и128MiB E: observed total17.921GiB +≤1GiB≈18.921GiB
с текущей общей нагрузкой, не резерв/не гарантия будущего роста.
Actual own combined runtime12975478 bytes (<128MiB), без удаления raw/старых работ.
VPS audit4CPU/load0.48, MemAvailable5482827776bytes, diskfree≈30.23GB.
Все тяжёлые output/cache/temp только own E combined runtime, env process-local.
E≤4GiB diagnosis,≤2 safe checkpoint/stop; прежний10GiB reserve не применяется.

Заключительный seal RO guard2026-10-29T13:59:55.171643+00:00 повторно совпал; euid0.
Сделано сейчас: own HEAD/status/STATE/order/планы; fully-read Lead/QA;
194-file exact verification; fresh RO probes/audit/recheck; локальные overlay,
полные manifests, catalog reverse proof; scoped scripts syntax-only, saved hashes.
**Не сделано:** upload/remote staging/locks/backups/nginx/service docs/server
cleanup/публикация. Никакого активного server writer/браузера/preview от Release.
Jungle/old early/raw/frozen и чужие процессы/UGH сохранены. Policy denial не было.

Обе board STATE ссылаются сюда. После commit+push — точный handoff Lead и idle.
Lead читает этот intent/скрипты/hashes/guard и запрашивает новый exact CTO token;
затем отдельная execution команда. Этот intent сам публикацию не запускает.
