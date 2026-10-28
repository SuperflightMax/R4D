# P4 candidate-02: public write-intent DRAFT — НЕПОЛНЫЙ

28 октября 2026, 18:33–18:34 Europe/Kiev (16:33–16:34 UTC). Только read-only/local подготовка для новой публичной схемы Andy. Запись не разрешена.

## Проверено на frozen02

- Candidate `p4-full-v02-candidate-02`, local source `b2db9e947ebf2213e725a66f1e778f9137b14d5f`; Git object существует в собственном репозитории. Фактический SHA256 artifact.json `c7815edc846749478e56e76d072233ae5a6fcd0ee86d2c14f9936379bff9b757` совпал с входом, FROZEN.json и handoff; frozen=true, builderDirty=false.
- Read-only root: `E:\R4D\perspective\p4-runtime\builder\candidates\p4-full-v02-candidate-02\`. Прочитаны artifact/FROZEN/RUN/handoff, index, runs/index, нужные поля art manifest и resource-path фрагменты app/CSS. Preview, вкладка, PID и процесс Builder не использовались.
- Artist `b2c0339704c9a6a86e4a1188b0022ba724aadd43`, manifest SHA256 `209350371d807a879fef1ab61a2aff02868d4e24414892f4d50a17cee02c5543`. P1/core/config/projection pins совпали с общим входом.
- 100 payload paths существуют, без дубликатов/выхода из root, 10 772 354 bytes: 65 PNG, 3 JPG, 17 JSON, 2 JS, 1 HTML, 1 CSS, 1 MJS, 2 Markdown, 8 license/text. Вне списка только artifact.json и FROZEN.json. TS/TSX/maps по именам нет; это не аудит содержимого. Проверены hashes выборки 15 файлов — все совпали; полный payload не перепроверялся.
- Ball/shadow — отдельные PNG 256×256, 8-bit RGBA; headers проверены без рендера. Art metadata: 29 objects, 3 sceneParts, canvas 1536×1536, r16. Это не художественный или динамический PASS.
- Машинная выборка: `E:\R4D\perspective\p4-runtime\release-engineer\candidate-02-release-layout-observation.json`. Копирования, packaging, build, native prep, запуска и полного baseline не было.

## Предлагаемая запись

Logical target: `https://superflight.space/review/r4d/p4-extracted-objects/`, entry index.html, завершающий `/`. Предлагаемый write set — 100 исходных payload files плюс artifact.json/FROZEN.json verbatim с прежней структурой; production не запускает local serve.mjs. Builder source commits не доставляются.

Единственное изменение вне P4 — одна ссылка в `https://superflight.space/review/`. Предложение: href `/review/r4d/p4-extracted-objects/`, title `P4 — извлечённые объекты`; место/подпись ещё не утверждены. Сохранить все foreign bytes, entries и routes; shared assets, auth, redirects, security и global MIME не менять.

Base contract: `./style.css`, `./app.js`, import map → `./native-runtime.js`; app читает `./input/{config,p1-manifest,binding,art-binding}.json`, `./art/manifest.json` и относительные raster paths. CSS без внешних URL. Работу во вложенном public path ещё предстоит подтвердить UI; frozen HTML/app не переписывать.

## Каталог: свежее наблюдение, не release baseline

GET `/review/` без cookies/credentials/redirect-follow: 200, text/html, no-store, 12 839 bytes, ETag `"6ae222a9-3227"`, SHA256 `24f65bbce6b82d26d17b94aa5b4f5d781b6aafb906e4ddd6fcc1283ecb930895`. Scripts нет, общий CSS `./assets/site.css`, ссылки P4 нет. Чужие продукты не открывались.

Bytes изменились с первого prep (11 955 bytes / SHA256 `759de374bafabe98bcc1d96e297e0972df1439bd7322e3920438ec46eb188694`), прежний снимок для записи/rollback непригоден. Полный новый snapshot сейчас не снимался. Review public, private `sf.superflight.space`; fresh routing/auth snapshot нужен перед writes. Прежний GET `/review/r4d/` с 403 не повторялся и не обходился. Sensitive configs/allowlists/credentials/tool outputs не искались.

## Недостающие operator/CTO fields

В переданном current common input, собственном prep и candidate metadata этих значений нет; URL не определяет физические пути.

| Поле | Нужное значение |
| --- | --- |
| `operator.publishMethod`, `operator.targetIdentity` | Текущий авторизованный инструмент/процедура и проверенная production identity; без передачи credentials. |
| `paths.publicRoot`, `paths.p4Directory`, `paths.catalogFile` | Точные текущие physical paths и URL mapping; старые protected paths не подставлять. |
| `catalog.linkMapping` | Утверждённые href/title и место единственного добавления. |
| `baseline.snapshotMethod`, `baseline.currentRoutingAuthReference`, `rollback.procedureAndAuthority` | Разрешённый fresh snapshot затрагиваемых root/catalog/snippet/auth metadata и rollback по нему, без sensitive config reads. |
| `qa.tqaConclusion`, `qa.vqaConclusion` | Независимые выводы именно на candidate-02 и artifact SHA, с ограничениями; пока не получены. |
| `cto.releaseDecisionAndSingleToken` | Новое проверенное решение с учётом HOLD и single token на exact version, destination/write set. |

REMOTE_WRITES_HOLD_CTO Builder действует: никаких source push/dry-run/force/PR/cherry-pick/другого actor/remote/транспорта. Generic remote rejected (failed) не объявляется policy-denial или transient. Draft hold не снимает.

## Порядок будущей approved публикации

1. Получить окончательные exact bytes и independent TQA/VQA conclusions; сверить весь payload/digest/write set. Замена кандидата требует нового сопоставления intent и conclusions.
2. Перед тяжёлым шагом повторить RAM/CPU/C/D/E + aggregate peak. Только собственный runtime/process-local env; E <=4 GiB warn/diagnostic, <=2 checkpoint/stop. Здесь шаги лёгкие: C: 14,490 / D: 16,295 / E: 16,346 GiB свободно; staging нет.
3. Непосредственно перед writes — fresh current public root/catalog/snippet/auth snapshot и rollback по новому baseline; пересчитать одну catalog insertion, сохранив остальные bytes.
4. Сверить отдельный single CTO token, версию/target/write set и решение по HOLD; затем только точечная доставка, без rebuild/repack и foreign changes.
5. HTTP: все delivered hashes, корректные MIME для HTML/JS/CSS/JSON/PNG/JPG/text, cache/base paths/native import map; HTML fallback вместо asset — ошибка. Global MIME не менять.
6. Реальный публичный UI: Pixi и 64 runtime textures по handoff (background+61parts+ball/shadow), raster ball/shadow, art/geometry, random/replay, pause/+1 и повторный import; без failed assets/console errors. Это smoke доставки, не повтор полного QA. Проверить foreign route/catalog metadata и private boundary без login/чтения чужих продуктов.

Replay metadata: seed `1842222754` — t605 и t2421/IN_BUCKET receiver-02; seed `2964851399` — t1323/LOST. Это selfcheck Builder, не наблюдение Release. RUN отдельно оставляет непроверенными входы остальных трёх receiver и UI download export; тонкие края/тени ожидают VQA. Эти ограничения не закрывать релизным PASS.

Далее нужны перечисленные поля, окончательные conclusions и новое решение/token CTO. Intent неполный; writes закрыты, доставка не объявляется.
