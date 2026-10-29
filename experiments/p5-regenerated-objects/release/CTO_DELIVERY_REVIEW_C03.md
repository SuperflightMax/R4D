# P5 C03: конкретный CTO review, local draft

29 октября 2026, Europe/Kyiv. Подготовка review завершена; **полный исполнимый delivery intent ещё не подготовлен, single-use token отсутствует, server writes = 0**. Этот документ передаёт exact local result и перечисляет реальные недостающие операционные поля. Rootline-only diff не является разрешением или полным запросом на deploy.

## Exact результат и прочитанные основания

- Frozen C03: `E:/R4D/perspective/p5-runtime/builder/output/previews/c03/public`, **29 файлов / 21675411 bytes**. Соседний index.json **11618 bytes**, SHA256 `17838d163e6c710cad513a68b5cd5ba5c6543a708761b96e7ee62fa362c2ef2d`.
- Consumer `af23e124cf5bd1d9de884082ffbc993448217112`, prefix `experiments/p5-regenerated-objects/builder/`. Formal handoff полностью прочитан: `12e02702480ff84bf8ade352375bfb2797a6d0b0:experiments/p5-regenerated-objects/builder/HANDOFF_C03.md`, blob `bff41e1f70e84ab16cd96beaf8d127e0878577f2`.
- Actual app **571012 bytes**, SHA256 `4a003dd39212f21b7a3dd1baa82c0d0738af3a9767c6e51225b9b54f5aac325c`; staged manifest **66026 bytes**, SHA256 `13f443587180095cb701564ee7cdd24a3e1e062932cc075a3cb1de37e056ef91`.
- Artist `a5ec68fb2ed6aeacd8c66bc575166567bd0c3966`, source manifest **89838 bytes**, SHA256 `a083143b199f78cefe2725907b91385145cb9c29067ad319dd862974a13714a0`. Семантическая дельта ограничена near-ledge.sourceClipPx; 27 public files, app/17PNG/native/P1/deps/license bytes неизменны.
- Local inventory/privacy/license основание: `6c08ddd4db346bc70b1e65925497e23072400d59:experiments/p5-regenerated-objects/release/PREFLIGHT_C03.md` с перенесёнными после hash identity проверками C02. Эти завершённые проверки при recovery не повторялись. Raw private native TS/maps/source dumps и private generation/evidence staging не входят в public root; compiled native use не объявляется MIT grant. Предел bounded secret scan и отсутствие полной C2PA semantic/signature validation сохранены.
- Lead result полностью прочитан и не менялся: `3c2105820d8dbefc971fe97fc7086f743b9b9721:experiments/p5-regenerated-objects/coordination/RESULT.md`.

Обе final QA полностью прочитаны до restart и используются по сохранённым notes:

| Независимая QA | Exact report | Blob |
|---|---|---|
| TQA | `9b2eb998ea6aba6272097b955e0a53d97234dbd9:experiments/p5-regenerated-objects/qa/technical/REPORT_C03.md` | a4627427c024f48b9dbd30df4061b70852085d1c |
| VQA | `e227f3874c19539b7d38f0b8d318a911e7db2915:experiments/p5-regenerated-objects/qa/visual/REPORT_C03.md` | 5bf3afc5cde2d2a9fed8e6abb82a7e7f453bfb84 |

C02-V01 закрыт независимо собственными actual кадрами обеих QA на index17838d/manifest13f443. TQA: 39 snapshots, 30 exact cached independent trace comparisons и 9 scoped left-head snapshots; промежуточные left-head states не объявляются независимым per-tick oracle, terminal/replay/view доказательства отделены. VQA рекомендует C03 как best reasonable result и остановку ограниченной доводки после исправления наблюдавшихся значимых дефектов. Это не общий P5/FullArt/release PASS и не остановка по исчерпанию бюджета.

**Остатки:** actual entry receiver02/04, все rail/head/rare contour crossings, coarse moss/feather edges, все направления каждого контакта и часть timeout/download/DPR coverage остаются unverified. C03 не объявляется универсально правильным на всех траекториях. Показ должен сохранять эти ограничения; новые широкие QA не открываются этой записью.

## Уже собранные bounded operational receipts

Это **датированные наблюдения до restart**, не свежий active mapping, полный baseline или live seal. На восстановлении повторных SSH/HTTP/server reads нет.

Через existing alias `vps1-direct` успешно выполнены только два read calls: raw snippet в **01:13:36 UTC** и разрешённые metadata четырёх файлов в **01:14:30 UTC**. Exit0/stderr empty у обоих. Полные bodies vhost/MIME/mixed docs, credentials/keys/cookies/sshconfig не выводились. Target/catalog/каталоги/соседние продукты не читались и не stat-ились.

Raw `/etc/nginx/snippets/review.locations.conf`: **955 bytes**, SHA256 `359de106d9291f1aa8d265f3cd8c7c9aefc7703de850e9cd7ef531458a271ac9`. Тогда root directive указывала `/srv/superflight-review/releases/p4-jungle-extracted-candidate-03`. Имя root используется только как operational pointer opaque wrapper. Содержимое/арт/результаты соседних опытов не открывались.

| Только разрешённая metadata | Size | SHA256 | uid:gid / mode | inode |
|---|---:|---|---|---:|
| /etc/nginx/conf.d/superflight-studio.conf | 17255 | 35c0db6029d246dac31a53d1151e89fedba9dbba0ceeeb1921e779ef0307e4e8 | 0:0 / 0644 | не читался для выдачи |
| /etc/nginx/mime.types | 5349 | 6f95d1d7d75e3c072907d845622a69d23110d1266c16ff122b3109b8b21f3ae9 | 0:0 / 0644 | не читался для выдачи |
| /home/sf/assistant-context/vps/services/superflight-studio.md | 84121 | ea0539d3fa86d28c0064ad41796ec4d3a5f6b4bef93c00083a8cbd28668788ae | 1003:27 / 0640 | 2922368 |
| /home/sf/assistant-context/vps/CHANGELOG.md | 299008 | 4ffeac09b8c4d628b275bd8cfc14572fe9e7a91a9e539bc79ee0a9037f9355a7 | 1003:27 / 0640 | 2884515 |

Raw и receipts сохранены только в own runtime `E:/R4D/perspective/p5-runtime/release-engineer/output/c03-cto-review-01/`. Git содержит собственный индекс не секретных receipts `CTO_DELIVERY_REVIEW_C03_RECEIPTS.json`: **3686 bytes**, SHA256 `f031286729f298ef44c79fe0305f7da61105410c1fff5e59f5b29956ebe25389`. Он pin-ит raw/metadata/transport/checkpoint файлы; mixed bodies туда не включены.

## Предмет будущего решения CTO: точный payload и условная схема доставки

Existing PUBLIC path: `/review/r4d/p5-regenerated-objects/`. По прочитанному тогда snippet правило root+URI отображало бы этот путь во вложенный `/srv/superflight-review/releases/p4-jungle-extracted-candidate-03/review/r4d/p5-regenerated-objects/`. Это вычисление по dated snippet, **не подтверждение текущего наличия/содержимого target или effective host/include**.

Для review локально сохранена только условная rootline-замена:

```diff
-    root /srv/superflight-review/releases/p4-jungle-extracted-candidate-03;
+    root /srv/superflight-review/releases/p5-jungle-regenerated-candidate-03;
```

`review.locations.proposed.conf`: **957 bytes**, SHA256 `e2a466db57830bddb9003361028f99c132504ed3e12a632918898cd6c2a51224`; все прочие bytes raw snippet сохранены. Предложенное имя нового server root **не проверено и не согласовано**. Этот локальный файл не отправлялся на сервер.

Такая схема допустима только если отдельный полный intent докажет следующее: новый shared root содержит **весь согласованный opaque baseline**, сохраняет unchanged neighbors и размещает наши exact29files лишь во вложенном `review/r4d/p5-regenerated-objects/`. Нельзя направить shared Review root непосредственно на P5 payload из29files. Сейчас не выполнены root clone/archive/lock/mkdir/upload/stage, не прочитан и не скопирован server baseline.

Предполагаемые собственные дельты в будущем intent:

1. P5 subtree — только index-whitelist C03 без rebuild; никаких raw/private parent staging. Существующий baseline и соседние публикации сохраняются opaque; соответствие всех unchanged neighbors подтверждается согласованным baseline evidence, без использования их кода/арта/findings как входов P5.
2. Catalog — максимум один собственный P5 slot/link либо delta0, если slot уже правильный. Exact catalog path/schema/marker, текущее P5 значение и before/after bytes **unresolved**. Их нельзя вывести из имени release root или выдумать. Остальные catalog bytes/entries не меняются.
3. Shared snippet — только согласованная rootline в случае выбора этой схемы и подтверждения assembled full root. Vhost/MIME/auth/security/access неизменны. Право на config validation/reload также должно быть явно включено в будущий exact token; сейчас таких действий нет. Target-only альтернатива не получает разрешения из этого draft: ей тоже нужны подтверждённые mapping/существование/границы мутации.
4. Docs — только собственная P5 delivery запись в двух названных docs, с exact package/source/QA links, public target, честными остатками и фактически проведённой проверкой доставки. До полного intent неизвестны exact appended bytes/UTC/outcome. Имеющиеся hashes/size/inode дают старое prefix observation, а не разрешение менять body. Префикс/uid/gid/mode/inode должны сохраняться согласованным способом; append-only историю не переписывать. Сейчас docs writes0.

## Что не хватает для полного intent и минимальный CTO next gate

**Сейчас требуется решение о local result и отдельное поручение на подготовку полного intent, а не release token на этот rootline diff.** Не заполнены: current effective hostname/include/root; подтверждённый physical P5 target и его prior state; допустимый новый release path/его отсутствие/ownership/mode; полный opaque baseline inventory/hash и правило unchanged-neighbor сравнения; catalog path/slot/approved exact delta; complete docs append bytes/prefix guards; точные действия и проверки root switch/reload; rollback target/snapshot/criteria/retention.

Предпочтительно CTO передаёт эти параметры как согласованную operator attestation/immutable baseline manifest + exact catalog delta. Если для local-intent подготовки действительно нужны новые reads, минимальные **ещё не разрешённые и не выполненные** scopes:

- `lstat` без содержимого/рекурсии для dated baseline root `/srv/superflight-review/releases/p4-jungle-extracted-candidate-03`, его вложенного `/review/r4d/p5-regenerated-objects/` и proposed root `/srv/superflight-review/releases/p5-jungle-regenerated-candidate-03`; uid/gid/mode/inode snippet `/etc/nginx/snippets/review.locations.conf`. Это разрешает установить наличие/тип/атрибуты, не читать соседние продукты. Наличие proposed path не даёт права его очистить или заменить.
- Только необходимые `listen`/`server_name`/include-review-snippet directives и ограниченный block context из `/etc/nginx/conf.d/superflight-studio.conf`, если effective mapping/host нельзя получить от владельца. Full vhost/nginx dumps и дополнительные configs не нужны.
- Для обнаружения catalog path — только nonrecursive names/types в exact dated directories `/srv/superflight-review/releases/p4-jungle-extracted-candidate-03/review/` и `/srv/superflight-review/releases/p4-jungle-extracted-candidate-03/review/r4d/`, если владелец не передаст путь. После определения пути нужно отдельное exact разрешение на его hash/attrs и только P5 slot/insertion-marker context либо готовый approved patch; сейчас ни существование каталога, ни его schema не утверждаются.
- Full opaque baseline proof требует отдельного определённого источника/manifest/snapshot и scope полного intent. Recursive contents, автоматический full live seal и чтение code/art/results соседей этим review не запрашиваются и не выполняются. Новую свежесть dated pointers/docs prefixes при следующем этапе нужно подтверждать только в его явно разрешённой области.

Ни одно из этих дополнительных чтений не выполнено. Recovery не повторял даже прежний whitelist. Отсутствующие значения не заменяются wildcard/deploy «по месту» или self-issued token.

## Rollback constraints для будущего exact review

Если CTO выберет новую full-root схему, старый подтверждённый opaque root должен остаться доступен. Rollback может вернуть только exact before-snippet/root mapping с согласованной проверкой/reload; текущие955bytes/SHA359de — лишь старое observation, которое пока нельзя считать fresh rollback baseline. Catalog delta должна жить в новом root; прежний catalog/соседи остаются сохранены. Append-only docs при rollback получают новую честную запись, старый журнал не стирается. Cleanup нового root/lock/staging и остановка процессов не подразумеваются автоматически: их target/ownership/условия требуют отдельного точного разрешения.

Конкретные rollback triggers, retention, nginx команды и post-switch HTTP hostname/URL/hash/MIME/replay checks должны быть закреплены полным intent и новым single-use token. Unknown deviation само по себе не вызывает automatic rollback. Запрещённые GET /review/r4d/ и historical403, denied composite call_7b166cdf46834d468b5f9c297aad6e9f, file:// и same-target обходы не являются проверочным маршрутом.

## Completed recovery actions и handoff

Recovery checkpoint **08:54:38 UTC** подтвердил own branch `codex/r4d-p5-regenerated-release-engineer-01`, HEAD `6c08ddd4db346bc70b1e65925497e23072400d59`, clean status/WIP0. Сохранены пять прежних raw/proposal/metadata/transport файлов с прежними hashes; незакоммиченного draft в checkout не было. Новый append-only `recovery-checkpoint.json`: **1566 bytes**, SHA256 `df033b148cd3c92cf9ce5e4a8725457fbd8acd67fa2910cb2551b4e0b183a73e`.

Завершён этот local draft и индекс receipts; finished art/code/build/native/browser/QA/seed/inventory не повторялись, другие сотрудники не будились. Только лёгкая работа с own E файлами; heavy шаг/новый resource guard не требовались. Новых server reads/SSH/HTTP после restart, server writes, deploy/live seal/cleanup, settings/security/credentials/model/effort/host изменений нет. Собственный отчёт и receipts передаются commit/push own branch. После handoff STOP/idle до адресного CTO решения.
