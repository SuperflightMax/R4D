# P4 candidate-03: public release-intent DRAFT — НЕПОЛНЫЙ

28 октября 2026. Предмет — возможная публикация **ограниченного прототипа с остаточными пробелами**, не принятой полной P4. Token отсутствует, все VPS/public writes закрыты. Ни упаковки, ни серверного baseline/rollback в этом turn нет. Этот draft заменяет intent02.

## Exact candidate и проверка Release

| Pin | Значение |
| --- | --- |
| Candidate | `p4-full-v03-candidate-03`, frozen=true, builderDirty=false |
| Source LOCAL HELD | `7d2344c1a8959f73ff26af5d3aba7dd02eb0e971` |
| artifact.json SHA256 | `298649ec518a13e8070201e822108005a6b5081454452f50243d18f2fde2d542` |
| Artist full-v03 | `b7efff1e2f519812421829808e71a0d83154926d` |
| Art manifest SHA256 | `276dfdfd32f1f543ce39d72fe7e360523c6ec70387d1c44dd21acd47f9fb1a6a` |

Root: `E:\R4D\perspective\p4-runtime\builder\candidates\p4-full-v03-candidate-03\`. Прочитаны artifact/FROZEN/RUN, переданный HANDOFF, оба полных текущих QA reports и минимальные resource-path фрагменты. Фактический artifact hash совпал со всеми pins; source Git object существует без переноса в свою ветку. Все 111 payload paths существуют, без дубликатов/выхода из root, суммарно 11 617 209 bytes. Собственная выборка index/app/art manifest/art-binding/runs index — **5/5 SHA совпали**. Широкая QA, native build, preview/PID Builder не использовались.

Layout03: 65 PNG, 7 JPG, 23 JSON, 2 JS, 1 HTML, 1 CSS, 1 MJS, 3 Markdown, 8 license/text; плюс artifact/FROZEN metadata. Относительно02 manifest перечисляет 22 добавления, 11 удалений, 7 изменённых файлов; исходный02 не изменялся. HTML/base contract прежний: `./style.css`, `./app.js`, import map → `./native-runtime.js`, `./input/…`, `./art/manifest.json` и относительные raster paths. Это не подтверждение будущего Review mount.

## Независимые conclusions и границы

- **TQA:** PASS порученной технической дельты, TQA-02-01 CLOSED; 40 строгих UI snapshots, 8 случаев продвижения, 0 console errors/warnings. Прочитан `E:\R4D\perspective\p4-worktrees\technical-qa\experiments\p4-extracted-objects\qa\technical\CANDIDATE_03_REPORT.md`, observed file SHA256 `f43c4adf451578f3c7468170b027c657efe0bf79dfd25bace71d43bbbbcc87c1`. Final report commit в поручении ещё не выдан; перед одобренной записью сверить окончательный pin.
- **VQA:** VQA-01 CLOSED/PASS по shadow delta и проверенной регрессии. Прочитан `E:\R4D\perspective\p4-worktrees\visual-qa\experiments\p4-extracted-objects\qa\visual\FROZEN_03_REVIEW.md`; его Git blob совпал с published commit `eeea68cc8c53bc3462ba310410a6ffe7b088e070` (blob `0d72baae889289383ccca2d3314f839011d3c791`).
- Оба QA отчёта указывают тот же artifact/source/art pin и независимые проверки всех **111 disk/HTTP hashes**. Это их выполненные проверки; Release не повторял их широкий объём. Native/config/P1 и все 65 PNG неизменны по их сравнению; shadow03 и real playback проверены заново.
- **Не полный Art PASS и не приёмка всех обязательств P4.** Receiver-01/03, partial front-rim при capture и целевой Review-prefix не подтверждены. Receiver-02/04, wood/frog/borders имеют указанное в отчётах покрытие. Отдельное погружение не добавлялось. Исследовательское ограничение не закрывается выпуском или подписью PASS.

## Предлагаемый write set, требующий решения CTO

Только `https://superflight.space/review/r4d/p4-extracted-objects/`: 111 exact payload files + artifact.json/FROZEN.json, verbatim, entry index.html, завершающий `/`; без rebuild/repack и production-запуска local serve.mjs. Единственная внешняя дельта — ссылка в текущем `https://superflight.space/review/`. Предложение href `/review/r4d/p4-extracted-objects/`, label **«P4 — извлечённые объекты (ограниченный прототип)»**; место/label ещё не согласованы. Сохранить все foreign bytes/entries/routes; shared assets, auth, redirects, security/global MIME не менять.

Схема Andy: основной superflight.space/Review public, private sf.superflight.space. Старые protected snippets/templates/rollback не применять. Старый public snapshot уже изменился и не является release baseline. Новых HTTP/server snapshot запросов здесь не было; прежний GET `/review/r4d/` с403 не повторялся/не обходился. Sensitive configs/allowlists/credentials/tool outputs не искались.

## Exact missing fields

| Поле | Что должен передать/решить CTO/operator |
| --- | --- |
| `publishMethod`, `targetIdentity` | Текущий авторизованный способ точечной записи и проверенная production identity; без раскрытия credentials. |
| `physicalPublicRoot`, `physicalP4Path`, `physicalCatalogPath` | Три точных актуальных physical paths и их logical URL mapping. Не угадывать по старой схеме. |
| `catalogLinkPlacement`, `catalogLinkLabel` | Конкретное место единственного добавления и утверждённая честная подпись ограниченного прототипа. |
| `authorizedSnapshotMethod`, `currentRoutingAuthReference`, `rollbackProcedureAuthority` | Разрешённый fresh root/catalog/snippet/auth snapshot, место его сохранения и точный rollback по этому baseline, без sensitive reads. |
| `boundedPublicationDecision`, `singleCTOToken03` | Явное решение о допустимости bounded publication с перечисленными residuals; новый одноразовый token именно на03/digest/target/write set, с учётом source HOLD. |

## После отдельного решения и token

Получить exact approved bytes и окончательные QA pins → непосредственно перед writes свежий current public root/catalog/snippet/auth snapshot и rollback по новому baseline → сверить single CTO token с03 и точным write set → точечная доставка → HTTP bytes/SHA, MIME/cache/base paths/import map + реальный UI во вложенном Review-prefix (64 textures, raster ball/shadow, random/replay, pause/resume) → сохранность foreign catalog/routes и private boundary. Это smoke доставки, не новая широкая QA. Если каталог изменился, пересчитать одну вставку без перезаписи чужих bytes.

Перед тяжёлым шагом повторить RAM/CPU/C/D/E и aggregate peak; только own E-runtime/process-local env. Здесь шаги лёгкие; E свободно 16,258 GiB. E <=4 GiB — warn/diagnostic, <=2 GiB — checkpoint/stop.

**Builder source remote HOLD сохраняется:** никакого push/dry-run/actor/branch/transport/PR/cherry-pick обхода, переноса held source в свою ветку или публикации без отдельного решения. Допустимый собственный report-only commit/push содержит только документы Release. Сейчас delivery не выполняется и не объявляется.
