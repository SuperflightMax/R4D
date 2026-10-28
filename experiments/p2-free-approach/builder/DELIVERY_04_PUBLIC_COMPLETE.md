# P2 candidate04 — LIMITED delivery/docs completion, QA findings сохранены

**P2_C04_DELIVERY_DOCS_COMPLETE_LOCK_RELEASED_WINDOW_HELD**.
Verified PUBLIC target:
https://superflight.space/review/r4d/p2-free-approach/ .
Доставка и обязательная документация завершены. **Full Technical/Art/P2 closure
не выдаётся**, причины render-находок не диагностированы, fixes не поручались.
Собственный lock снят, writers idle. **Shared Review окно не освобождено**:
только explicit CTOrelease после итоговой передачи.

## Actual continuation / первый completed action и guard

Actual current turn **01a18378-0842-7ac3-a9af-5f4e6f19e878** получен read-only
`read_thread` своего existing chat `01a17e5e-51b8-70a3-a713-3f0b233767a0`.
CODEX_TURN_ID не был exposed, поэтому ID не выдуман и sensitive logs не читались.
Исходный checkpoint **ec4794831546bc44bbf327c913fb3040d791670e**, clean,
branch `codex/r4d-p2-free-builder-01`, только
`E:\R4D\perspective\p2-worktrees\builder`. Model/reasoning/role/chat/staff/
worktree/device/session не менялись, новой доставки не было.

Первый completed action — свой checkout/status/host resources и exact QA Git
objects. Затем оба report полностью прочитаны, все pinned evidence сверены:
Technical evidence6654 и7 linked files; Visual index2788 и17 rows (16rawJPG+JSON);
Root private review3288. Это metadata validation существующих inputs, не новая QA.

Первый completed **read-only** served-phase guard:
**2026-10-28T17:08:10.278716Z–17:08:18.007628Z**, до любого server write в
continuation. Owned nonce/inode11/hash exact, phase ownership подтверждена;
live newroot/snippet AFTER952/raw vhost/MIME/docs/full563files+81dirs,
545opaque foreign/P1all12/count4/oldroot intact. Все16 PUBLIC HTTP200/
bytes/SHA/MIME/headers exact; документы ещё P1-prefix72789/291345bytes,
uid1003/gid27/0640. Не требовали absence уже собственных завершённых targets.

Private `docs-completion-01/guard.result.json`31362bytes/SHA256
`54ecbe05432796592578bfcffcf2208deba6b75994a734f98f96a8b4fceddece`.
Host17:07:52UTC: total31.907GiB/free15.964GiB RAM, CPU2%, C/D/E>4GiB;
aggregate planned20.193GiB включает own0.25GiB и allowance роста P4/Millionko4GiB.
E budget own0.1GiB+allowance2GiB; будущие чужие пики не измерялись. VPS available
5386256384 RAM bytes/CPU3.03%/free disk30245089280bytes. Перед finish свежие
host/VPS/phase guards повторены;4/2GiB rule/process-local E TEMP/TMP/no cache
соблюдены. Чужие PID/tabs/processes/P4/Millionko/UGH/P3/P5/P6 не трогались,
Technical/Visual/Artist не будили. Наших servers/browser/QA не запускали.

## Bound actual PUBLIC QA inputs и честный scope

Текущий P2 CTO gate issued2026-10-28T16:20:31Z продолжен той же ролью/phase.
Новый token не создавался/не запрашивался, P1token не использовался. Literal
token/nonce только private E/declared private backup, не public docs/Git.

### Technical

Original **27b9adf765fabc0ac6858253b4a61158b3c3bfbb**, Lead cc22d56;
`experiments/p2-free-approach/qa/technical/candidate-04-PUBLIC-01.md`:
13919bytes/SHA256
`6da040f3a327b8f160a6a65720f58764c6bd77312ffc4e990867ff2e3c07c2ae`.
Actual QA turn `01a18363-280e-73c3-a33b-5429354498b0`.
EVIDENCE6654bytes/SHA
`02195dd2d21aea381152cb17194635b551e904c67cc001ee53ef7d3934e8a2c1`,
все7 linked files exact. Подтверждены PUBLIC200/no redirect/canvas/Pixi/default
0.25, UI pause/resume/+1/+10/+100/seek/reset/replay, четыре seed1 checkpoint
0/94/95/1735, terminal1735LOST/+100clamped. Три actual visible/focused timing
окна ratios0.25146/0.49917/1.00251, не synthetic deltas и не FPS benchmark.

Finding **PUBLIC04-UI-01 P3**: после terminal→seek95 save-status остаётся
«Запуск завершён» при correct done:false. Физический rewind исправен в проверке.
Actual download/export, hidden-document/focus-loss suspension и WebGL backend
**не подтверждены**. All16 live body hashes остаются attributed Builder delivery
proof, не независимыми live hashes Technical QA.
Первый failed `call_c50ec4f1fd324a30bc334f09f0dfe1c2` runtime reason UNKNOWN,
явного policy denial не возвращено; binding/locator/API ошибки описаны отдельно.
Download не запускался, routing unchanged; own tab closed/reset/prior hidden restored.

### Visual

Original **1ff628005fbe82ec087d30d5c62dde61265e9c7d**, Lead877b589;
`experiments/p2-free-approach/qa/visual/CANDIDATE_04_PUBLIC_VISUAL_01.md`:
12957bytes/SHA256
`2a396de45786f5228939fb78c793a5b270ab8f1a855085e3834d2cf19343cc0a`.
Actual turn `01a18363-2ac3-77a2-be19-b81bbf952244`.
Verdict **PUBLIC_VISUAL_OBSERVED_WITH_LIMITATIONS**. Observations126742bytes/SHA
`2faa736425c412af1adabf65d507cc6b2c28ca344058b0dc0fe170d9f9ba0561`;
index2788bytes/SHA
`eaefe7990b6a2645974727b5bcfe04225fb1fcca3e7874326c6536cd60945d96`,
все17 rows (16rawJPG+JSON) exact.

Actual desktop1280×720/narrow390×844, ordinary seed1 motion/leaf01 UI contact
tick95, controls доступны, общего measured overflow нет. **Canvas при200%
чёрный на raw94/95/96; после «По размеру»+1→97 сцена видна. Причина неизвестна.**
Нет автоматического product blocker/Art PASS. Stale hint также на97 при done:false.
Native-floor view в UI не найден; geometry-only — projection. Тонкие контакты,
partial occlusion, отдельная тень/grounding не приняты; only4occluders, остальные
объекты/ограда/корзины не приняты. Physical Android/gestures untested. Новых
явных policy denials нет, own tab closed и viewport actual1280×720 reset.

Root review3288bytes/SHA
`09f379e2f921b857734a46af786b03a38c468a266fc991d181a8d951a3b75ed8`,
status BOUND_REPORTS_REVIEWED_FOR_DOCUMENTATION_NOT_FULL_PRODUCT_PASS.
Lead лично смотрел7 кадров; CTO уведомлён. P1renderPASS не наследован.
Неизвестные причины не заменены success/диагнозом; hotfix/расширение QA/
автоматический rollback не выполнялись. Исторические local/file запреты не
повторялись/не обходились, новых собственных denials в continuation нет.

## Guarded private render receipt / append-only docs

После повторного fresh served guard записан только объявленный private
PUBLIC_RENDER_RECEIPT с обоими report/evidence pins, findings, scope attribution,
Rootreview, noFullPass. Перед каждым append fresh raw doc guards и own phase
повторены; изменения через exact declared temp leaves/atomic replace.

| Документ | Before bytes/SHA256 | Append bytes/SHA256 | After bytes/SHA256 |
|---|---|---|---|
| `/home/sf/assistant-context/vps/services/superflight-studio.md` |72789 / `2bbc4ed03767ceba52af06c4d3b37e3fb3423340bbcf16f4c3558e1d04e92efc`|3856 / `11aa4dc8ac56a48856d3c7b808203052f052bbfbdb77c6a8d2b31cb735095ab7`|76645 / `6664e51d308260e4eb58a36047730f1d723ce0e873acf51b730afa99697816b1`|
| `/home/sf/assistant-context/vps/CHANGELOG.md` |291345 / `e19755650908ece2c668ebee72a8ff5baac149ee1785a3e8b8f6c5440a927916`|2392 / `3f21e59079ac4af1131b7890edc7a0233c6d357f80c3a227b741a44359a2cd6d`|293737 / `daa2e1aa49e5c70954cf7317cbba61f0744e0583ffba0777c3581f8ba3339bef`|

Atomic replace service **17:09:35.266647UTC**, CHANGELOG **17:09:37.174573UTC**.
Полные72789/291345 old byte prefixes **exact**, uid1003/gid27/mode0640 сохранены.
Значения bound template — только actual facts. Ни product/frozen/canonical
catalog card hotfix, ни другие server docs/настройки не менялись.

## Final proof / matching owned cleanup

После обоих append final HTTP/inventory/config/P1/foreign/oldroot/docs guard
прошёл; nginx-t17:09:39.745060UTC и active17:09:39.771016UTC passed. Reload
не повторялся. Full **563files/81dirs/90775084bytes**, tree
`892fa950ee4ce08f02a71b76f99241eeb95d52038515699fff8e8a447f9e6b8f`;
545foreign rows и все12P1files/tree88e934… preserved, old562-file root intact.
Все16 P2 PUBLIC files/catalog HTTP200/exactbytes/SHA/MIME/headers,
все JS application/javascript; P1index200 unchanged/count4/P1card intact.
Owner HTTP hash proof не выдан за независимый body-hash verdict QA.

Live root `/srv/superflight-review/releases/p2-jungle-static-candidate-04`.
Frozen16files/2452021bytes/tree
`60d216a64c86fed4b83f4ed3802e3d1393cdda2db8776818d22710173dc2ffed`,
BUILD_MANIFEST60f79d1bdad8d3737376952043013394bb3098de6b15200fc5c352dd875dd1f7
неизменны; build08f9/implementation0a80/compiledcore/config/geometry/art
untouched. Нет new delivery/upload/extract/stage/switch/QA/build/physics/
gesture/size/height/occlusion/native-view fix или rollback.

Raw snippet952bytes/SHA
`4d32b2d6ee8e19d5c6c24ab61e25f8e8226c0e6d7baa64cc8d2a5e6eae036235`,
vhost17255/SHA35c0db6029d246dac31a53d1151e89fedba9dbba0ceeeb1921e779ef0307e4e8,
MIME5349/SHA6f95d1d7d75e3c072907d845622a69d23110d1266c16ff122b3109b8b21f3ae9
exact unchanged. Auth/credentials/security/firewall/ports/DB/sessions untouched.

**17:09:39.804627UTC** снят только matching owned nonce/inode11 lock.
Own snippet/service/CHANGELOG temps отсутствуют; stage уже renamed,
upload/archive/backup/new/old immutable releases сохранены. Owned writers idle,
нет активных owned servers/browser/exec/QA. Read-only checkpoint
**17:11:59.570926UTC** повторно подтвердил lock/temp absence, docs prefix/
owner/mode/hash и raw snippet/vhost/MIME. Shared Review окно **held**, мы его
не освобождали. Дальнейшее product решение и явное release окна — только CTO.

## Exact private receipts

Server directory `/opt/superflight-studio/backups/review-p2-candidate-04-public-final03`.
Verified local copies:
`E:\R4D\perspective\p2-runtime\output\builder\p2-review-execution-04-final03-01\docs-completion-01\evidence`.

| Receipt | bytes | SHA256 |
|---|---:|---|
| PUBLIC_RENDER_RECEIPT.json |28289|`670b939d7d7f731140fc3826e1daf26e37a2aa8f742e6242c01db8bf39f4556c`|
| DOCS_RESULT.json |30554|`f423de269e3958e8481aba6c6c40c0c111e898203cdb1177e610cf7334e9d638`|
| FINAL_ACTUAL_STATE.json |2085|`71a5fca2b69727bba4f3a36c32053457b507f92b1dcda9dcdfc555f093471cde`|

Local `docs-completion-01/finish.result.json`43335bytes/SHA
`a9aa3791043549d73e165172e8dbcdd9d916a1fd478b98420779c60d1abffd9c`.
Локальные ownership/authorization state сохранены private E с финальной фазой,
без literal token/nonce в public docs/Git. Commit/push handoff завершает только
этот delivery/docs scope; Full Technical/Art/P2 closure не выдаёт.
