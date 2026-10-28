# P4 candidate-03: public release-intent DRAFT — НЕПОЛНЫЙ

28 октября 2026. CTO разрешил будущую публикацию **ограниченного прототипа с остаточными пробелами**, не принятой полной P4. Token отсутствует, все VPS/public writes закрыты. После отдельной CTO selector disposition завершён [ONE sealed LOCAL handoff](p4-candidate-03-sealed-local-handoff.md). Historical STOP и original proposal сохранены; correction записана отдельно. Этот draft заменяет intent02, execution authority требует Root/CTO review и нового single-use token.

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

- **TQA:** PASS порученной технической дельты, TQA-02-01 CLOSED; 40 строгих UI snapshots, 8 случаев продвижения, 0 console errors/warnings. Прочитан `E:\R4D\perspective\p4-worktrees\technical-qa\experiments\p4-extracted-objects\qa\technical\CANDIDATE_03_REPORT.md`, observed file SHA256 `f43c4adf451578f3c7468170b027c657efe0bf79dfd25bace71d43bbbbcc87c1`. Окончательный published clean commit `2c4671b5ed5b04a1635c2429328cf433ac4ec35f`, Git blob `16b8b76c1d48f00a15e700e5c7294915eeaa2cd8`; Lead подтвердил совпадение SHA256 с observed pin и blob текущего файла через filters. Повторная QA не выполнялась.
- **VQA:** VQA-01 CLOSED/PASS по shadow delta и проверенной регрессии. Прочитан `E:\R4D\perspective\p4-worktrees\visual-qa\experiments\p4-extracted-objects\qa\visual\FROZEN_03_REVIEW.md`; его Git blob совпал с published commit `eeea68cc8c53bc3462ba310410a6ffe7b088e070` (blob `0d72baae889289383ccca2d3314f839011d3c791`).
- Оба QA отчёта указывают тот же artifact/source/art pin и независимые проверки всех **111 disk/HTTP hashes**. Это их выполненные проверки; Release не повторял их широкий объём. Native/config/P1 и все 65 PNG неизменны по их сравнению; shadow03 и real playback проверены заново.
- **Не полный Art PASS и не приёмка всех обязательств P4.** Receiver-01/03, partial front-rim при capture и целевой Review-prefix не подтверждены. Receiver-02/04, wood/frog/borders имеют указанное в отчётах покрытие. Отдельное погружение не добавлялось. Исследовательское ограничение не закрывается выпуском или подписью PASS.

## Предлагаемый write set, требующий решения CTO

Только `https://superflight.space/review/r4d/p4-extracted-objects/`: CTO принял browser content subset **82 files / 10 099 772 bytes**, byte-exact, entry index.html, завершающий `/`. Предыдущее предложение «111 + markers» заменено: helper/Markdown/evidence/history/restoration mask/markers и ненужные fixtures не включены. Exact local manifest SHA256 `95d33355b9f50d77e38cfdb2279bec6ee3746e6230a1ac7e1e32d1f4ecc63241`; единственный P1 source-path flag принят узкой disposition CTO для exact JSON, proof history сохранена. Content approval не является sealed write allowlist/token. Никаких rebuild/правок frozen bytes или production-запуска serve.mjs.

Единственная внешняя дельта — согласованная CTO карточка в текущем `https://superflight.space/review/` сразу после exact P3 href `/review/r4d/p3-masks/` по отдельной selector correction: P4 href `./r4d/p4-extracted-objects/`, заданные eyebrow/title/description/CTA и counter4→5. Original Stage A proposal сохранён; corrected parameters и authority record отдельно в sealed packet inputs. Insertion/inverse на fresh coherent baseline подтверждены; existing P3 и все прочие bytes/cards/order не изменены. Все foreign routes, shared assets/auth/security/global MIME сохраняются.

Схема Andy: основной superflight.space/Review public, private sf.superflight.space. После отдельной continuation Stage B read-only сохранил новый fresh coherent C05 baseline и совпавший preseal recheck;8 server targets отсутствуют. Full LOCAL seal создан, private receipts в exact own runtime target; будущие BEFORE FIRSTWRITE/UNDERLOCK/preswitch/docs guards всё равно обязательны. Старые protected snippets/templates/rollback не применять. GET `/review/r4d/` с403 не повторялся/не обходился; secrets/allowlists/keys/cookies не читались.

## Exact missing fields

| Поле | Что должен передать/решить CTO/operator |
| --- | --- |
| `operatorAndTargets` | Fresh Stage B identity/C05 root/config/docs/inventory/8-target guards и preseal equality проверены. Полный LOCAL plan/seal готов; future privileged writes не испытывались. |
| `catalogAndBoundedDecision` | Bounded decision/exact card/единственная selector correction получены; actual unique section/anchor/counter4→5 и exact inverse подтверждены в sealed LOCAL packet. |
| `privacyDisposition` | ACCEPTED CTO только existing source.path пользовательского original image в exact P1 JSON11565/SHA7784dc0a215d0e472cf06a4eee03793592727cf0fa9a1fa0e0c78e5f1d17da18. Verbatim; не общее исключение и не zero-local-paths. |
| `windowReleaseAndCoherentBaseline` | Window release и Stage B continuation получены. CTO исправил только selector на `/review/r4d/p3-masks/`; существующая P3 card неизменна, original/STOP сохранены. Fresh C05 simple digest совпал по уточнённой формуле. |
| `rootReviewAndSingleCTOToken03` | Единственный оставшийся execution gate: review sealed LOCAL пакета Root/CTO и новый single-use exact-bound token03 с учётом HOLD. До него никаких server writes; HTTP/UI остаются UNVERIFIED. |

## После отдельного решения и token

Получить exact approved bytes и окончательные QA pins → непосредственно перед writes свежий current public root/catalog/snippet/auth snapshot и rollback по новому baseline → сверить single CTO token с03 и точным write set → точечная доставка → HTTP bytes/SHA, MIME/cache/base paths/import map + реальный UI во вложенном Review-prefix (64 textures, raster ball/shadow, random/replay, pause/resume) → сохранность foreign catalog/routes и private boundary. Это smoke доставки, не новая широкая QA. Если каталог изменился, пересчитать одну вставку без перезаписи чужих bytes.

Перед тяжёлым шагом повторить RAM/CPU/C/D/E и aggregate peak; только own E-runtime/process-local env. Stage B private checkpoint содержит fresh host/VPS resources с concurrent allowance4GiBRAM/2GiBE; порогиE4/2GiB не достигнуты, тяжёлая package preparation не начата.

**Builder source remote HOLD сохраняется:** никакого push/dry-run/actor/branch/transport/PR/cherry-pick обхода, переноса held source в свою ветку или публикации без отдельного решения. Допустимый собственный report-only commit/push содержит только документы Release. Сейчас delivery не выполняется и не объявляется.
