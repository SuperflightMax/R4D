# P1 static report — LOCAL release intent01 → Root review

**LOCAL_PACKET_VALIDATED_NOT_AUTHORIZED. server_write=false.** Создан один новый
локальный intent в предварительно свободном
`E:\R4D\perspective\p2-runtime\output\p1-static-report-release-intent-01`.
Ни mkdir/lock/upload/staging/backup/snippet/docs/reload/rollback на VPS не было.
Предлагаемый `/review/r4d/p1-mapping-report/` не опубликован; current404.
После этой передачи — остановка для Root review, не ожидание или выпуск.

## Checkout, ресурсы, scope

Первый шаг: свой E-worktree/branch/HEAD383164ff397e83a5ad47238f6ebe196688f649ff
проверены clean; reset/clean/model/actor/session/worktree changes не было.
Текущие изменения — только два local-preparation scripts и этот handoff в
своём `accepted-static-report-01/`. Исходная страница и frozen не менялись,
rebuild/extract/generate/новая P1 QA/симуляция не выполнялись.

Resource snapshot14:15:14 UTC: RAM31.907GiB, free15.898GiB, CPU0%; свободно
C14.639/D16.309/E16.471GiB. System-wide sample включает общую текущую нагрузку,
без чтения продуктов P4/Millionko. Собственная дополнительная budget0.2GiB RAM,
0.1GiB E; allowance конкурентного роста4GiB RAM/2GiB E. Aggregate planned RAM
20.209GiB. Это плановый запас, не измеренные будущие пики чужих процессов.
Правило4/2GiB соблюдено, heavy build/render не было; outputs/TEMP/TMP только
process-local E, Python-B/no pycache. На завершении E16.454GiB, C15.536GiB.
Своих активных servers/browser/exec sessions нет. P4 не будили/не трогали;
UGH, скелетная линия, P2 frozen04/df309/старые intents сохранены.

## Frozen и независимые verdict

- Accepted4b47db04c7140ebf88f69b91faa0b790d46f22ec,
  build2135851427c568038b23fded38d6cbe8b6f6b0e3,
  source/handoff383164ff397e83a5ad47238f6ebe196688f649ff.
- Frozen `E:\R4D\perspective\p2-runtime\output\p1-static-report-candidate-01`:
  **12 public files/2057712 bytes**, BUILD_MANIFEST4037 bytes SHA256
  `00eb21e37f4a30e1dfbf7addad0eeafe1e66b266c553495ea30ae8d96255a14c`,
  publictree `88e934cab5ce2621cc6ad811b7bc40bcfb5ccce74262a35068654552aeeb99f7`.
  Эти байты ещё раз совпали при **packaging**, без повторного предметного QA.
- TQA completed `054bb5bd6a385d36ce51fe382f2526e95cdcee99`, report
  `experiments/p2-free-approach/qa/technical/P1_STATIC_REPORT_CANDIDATE_01.md`:
  14065 bytes SHA256
  `abf5507b29848e6c16af459010519744ed2318d7c40013945b15d13f730c22f7`.
  Evidence21615 bytes SHA256
  `36787ee737913bde70b9140dc55261eed26e0b02250790926262c826437a01ff`
  проверен по существующему файлу, не пересоздан.
- VQA completed `3c5a27ed9fe18e79860491182fe4091738d7d424`, report
  `experiments/p2-free-approach/qa/visual/P1_STATIC_REPORT_CANDIDATE_01.md`:
  11958 bytes SHA256
  `b8a25cd47023852198049fa70f3be88b2c4d427436d4fecb8384e7187af2273a`.
- Принят только bounded static/figure verdict: 12-file hashes/provenance,
  31 refs, две catalog replacements, десять JPG↔caption↔text. Оба verdict
  **PAGE_RENDER_NOT_OBSERVED**, без inherited broad full PASS.
  `call_abc1dd4797314b4f99b8273827bb843b` отклонил именно file-URL protocol:
  `The requested URL protocol is not allowed. Allowed protocols: "http:", "https:".`
  Нет retry/server/CDP/другого actor/renderer или local preview. Actual PUBLIC
  desktop/mobile view, overflow и delivery HTTP проверяются только после
  будущего отдельно разрешённого release.

## Свежая actual PUBLIC основа

Read-only coherent snapshot **2026-10-28 14:15:32–14:15:34 UTC**, не13:25.
Полные files+dirs inventory и approved docs/config metadata дважды совпали.
Другие publication contents обработаны только как opaque path/bytes/hash
delivery metadata; коды/арт/recipes/QA других продуктов не читались.

Actual root `/srv/superflight-review/releases/p3-jungle-masks-frozen-01`:
550 files/88710090 bytes, root:root/files0644/dirs0755/no symlinks.
Manifest107213 bytes SHA256
`381ff209d36f24c1734e2f2012d0b298cb13efd37e928956ceaf00ab967c2937`.
Catalog11955 bytes SHA256
`759de374bafabe98bcc1d96e297e0972df1439bd7322e3920438ec46eb188694`;
no-cookie public200 bytes совпали с файлом. Live P2 public200/body
`8bebd1f5587764f7504bb5c179f51abdf8f5b576e01a9542d2707e806354c32a`.
P1 route404/absent; sf Review308 на public apex.

PUBLIC snippet948 bytes SHA256
`d264c2fc62fa6673e6c527e995b4c4cdb0dd02845dfe6d7c12dbea53dc537598`,
actual raw bytes сохранены: **auth_request отсутствует**. Vhost17255 bytes
`35c0db6029d246dac31a53d1151e89fedba9dbba0ceeeb1921e779ef0307e4e8`,
MIME5349 bytes
`6f95d1d7d75e3c072907d845622a69d23110d1266c16ff122b3109b8b21f3ae9`.
Без изменений security/credentials/global config. INDEX/PROCEDURES/current
service public split/README сверены; historical Review помечен superseded.
Service doc69083 bytes SHA
`0012999063bbca3d347c2a7c8e1d2c14bef1127db75cb0af7e1c04db3df964e1`;
CHANGELOG289574 bytes SHA
`679591fc68441ba44f0e219bd2e28a54031029410042bf1158a445e317a2de09`.
Их текущие uid1003/gid27/mode0640 сохраняются при будущем append.

Восемь exact new targets отсутствуют: final root
`/srv/superflight-review/releases/p1-mapping-report-candidate-01`, staging,
upload, backup, snippet/doc temp leaves и lock перечислены в intent/plan.
Проверены lexists/parents/no ancestor symlinks, но ничего не создавалось.
Remote free30.4GB; future additional peak около93MB.

## Финальные локальные артефакты

Все следующие пути относительны к **local intent folder**, не к VPS:

| Артефакт | bytes | SHA256 |
|---|---:|---|
| RELEASE_INTENT.json |10595|`760c6ed76c1ff97a9f33223b1c8f7a1b86973e6efb1284c08ab51e1e27d6b4ba`|
| p1-static-report-01.payload.tar |2191360|`b66db602929b95bb0d3f8a5a22e90f90a38d14ca7bbe93ca8702cc0a9dd3858f`|
| PLANNED_INVENTORY.json |163507|`f728b0a5723ceb0e225dc54dc71d0bb0a13971cb1b99b5766eb1c70f13c65c56`|
| EXECUTION_PLAN.md |14614|`66fc6c0ef90c1d1783ba86716aaeeb0aeaa5d635d0e5e568304ae05335a0eaf1`|
| DOCUMENTATION_APPEND_TEMPLATE.md |3340|`f2d0981138104b23bef3dffb812989152a7c745fa4fb64fa0b1e377a99f0ecba`|
| baseline/ACTUAL_PUBLIC.json |329030|`558b680e3dba768fbb65896c6f9ebc7870c5dfccf9128cdf61001f0b7317959d`|
| RESOURCES.json |793|`7c1f946052accad5bda0ba792a414c9bd226c87d07db70f56ed9e82e3bbec1ce`|
| SEALED_PACKET.json |2101|`5ab0518ff508eaf3f951add086f27620f8f51f269a4de7b837694eb29e5bcd34`|

Archive — **14-file delta over exact inherited root**, не full shared tree:
12 P1 files + catalog + safe root-level RELEASE_MANIFEST outside browser subtree.
Standalone распаковка не является готовым release. Полный planned tree:
**562 files/90770774 bytes**, SHA
`0e6c8f857cf60a77f7383580a87b243c2204e127095c26512fbefeec020a65b7`.
Новый manifest109438 bytes SHA
`bfe6bcc0224a0161a232ddf5dde08fa9b2bdc2d7fab4c942c9b6fd140f10ba94`;
schema_version1/published_files совместим с current delivery metadata,
561 browser files/90661336 bytes без самого manifest.

548 opaque inherited files byte-identical. В каталоге только одна P1 card и
3 демонстрации→4 материала, after12702 bytes SHA
`bec395e0940223f0f2f3549a1726e9d61abb862e713ede1b2fab995e32d10581`;
inverse восстанавливает original bytes. P2 live03 не заменён04.
Planned snippet **953 bytes** SHA
`289c2de9aa8c535a7755d94d4e69b4368ae82ea154c148449eec9d98467e2bd8`:
ровно один exact root literal, все остальные PUBLIC bytes unchanged.
Описка948→953 в private plan исправлена до передачи; предыдущий внутренний
receipt сохранён как `audit/PRE_FINAL_TEXT_CORRECTION_RECEIPT.json`, не является
актуальным intent. Авторитетны только hashes в таблице и SEALED_PACKET.
Frozen P1 bytes/manifest это исправление не затрагивало.

## Gate и дальнейшее исполнение

EXECUTION_PLAN перечисляет полный future write-set, phased exact guards,
exclusive own lock, separate-inode oldroot copy, safe14-entry delta extraction,
полную проверку562 files, atomic newroot/snippet switch, nginx-t/graceful reload,
public12-file bytes/MIME/headers, actual page view и append-only docs.
Fresh execution guards обязательны ещё раз **до первого write, включая lock**,
под lock и непосредственно перед switch; drift → STOP к Lead.

Rollback только к свежим exact actual PUBLIC before948 bytes, если live snippet
всё ещё exact after953 и root/vhost/MIME соответствуют этому release. При чужом
drift никакого overwrite. Никаких старых protected templates/normalized guards,
DB/session restoration, удаления immutable releases или глобальных изменений.

Подготовка не выдавала и не использовала CTO token. Root/Lead сначала проверяет
этот exact local packet; затем отдельный exact gate и **новый single token**.
До этого серверных записей не делать. Новых tool denials в этом этапе нет.
