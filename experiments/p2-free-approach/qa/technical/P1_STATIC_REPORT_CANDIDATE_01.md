# Accepted P1 static report candidate-01 — независимая Technical QA

28 октября 2026, Europe/Kyiv. `technical-qa-r4d-p2-free-01`; actual turn `01a182c2-c54e-73d3-9cd6-d4629df4240e`. Первый выполненный шаг: сверены свой E-worktree/ветка/чистый HEAD `df30939444dfc3875fe1f0fc39b31a4621be1d28`, прочитаны exact HANDOFF/PROVENANCE и frozen BUILD_MANIFEST. Работа выполнена в существующем `E:\R4D\perspective\p2-worktrees\technical-qa`, ветка `codex/r4d-p2-free-technical-qa-01`.

**Ограниченный static-вывод: файл-набор, bytes/hash/provenance, выбранные версии, локальные ссылки и согласованность датированного PUBLIC baseline/catalog draft подтверждены. Блокирующих дефектов в проверенной static-области не найдено.** Два возврата к каталогу являются root-relative `/review/`, а не строго относительными; исключение явно учтено ниже. **PAGE_RENDER_NOT_OBSERVED:** actual desktop/mobile/layout/overflow/live HTTP не проверены. Это не broad Technical/physics/visual PASS, не новая приёмка P1 и не разрешение публикации.

## Exact candidate

- Accepted P1: **`4b47db04c7140ebf88f69b91faa0b790d46f22ec`**, только `experiments/p1-collider-mapping/clean-repeat-01/`.
- Build source: **`2135851427c568038b23fded38d6cbe8b6f6b0e3`**; handoff/source **`383164ff397e83a5ad47238f6ebe196688f649ff`**. Site Git tree этих двух refs совпал; после build добавлен handoff, сайт не менялся.
- Frozen artifact: `E:\R4D\perspective\p2-runtime\output\p1-static-report-candidate-01`.
- Public payload: только `public/review/r4d/p1-mapping-report/` — **12 файлов / 2 057 712 bytes**: HTML, CSS, десять JPG.
- BUILD_MANIFEST: **4037 bytes**, SHA-256 **`00eb21e37f4a30e1dfbf7addad0eeafe1e66b266c553495ea30ae8d96255a14c`**.
- Public-relative tree SHA-256 **`88e934cab5ce2621cc6ad811b7bc40bcfb5ccce74262a35068654552aeeb99f7`**.
- Site-relative tree SHA-256 **`c2286a6284f27f0d550689c1313f7c6bf9e2acda483547ed2d1801db1919a02b`**.

Независимо проверены фактические пути allowlist, отсутствие лишних файлов/symlink, каждый размер/SHA и оба tree digest по правилу sorted `sha256 + space + decimal bytes + space + relative path + LF`. Все12 public files совпали с exact build source; frozen bytes повторно захешированы после проверки и не изменены. Audit, configs, manifests, traces, исходники/JS/TS/maps/logs в public tree не входят. HTML/CSS не содержат active runtime, внешних runtime-зависимостей или найденных operator/private-source literals; в JPEG metadata соответствующие literals не найдены. Текст содержит рецепт/ограничения, а не встроенный полный config или private core.

## Provenance и выбранные версии

`audit/PROVENANCE.json`, `audit/CONTENT_PROVENANCE.md`, `audit/CATALOG_DELTA.json` сопоставлены с exact handoff Git ref. Все десять JPG **побайтно** совпали с десятью адресно указанными accepted4b47 Git objects; дополнительно совпали их blob IDs, raw SHA-256, byte lengths и реальные JPEG SOF dimensions. Копирование/извлечение новых figures, пересборка, пересчёт или перерисовка не выполнялись: оригинальные blobs только читались в памяти для сравнения.

Выбор trial независимо сверён с accepted `viewer/scripts/board-inputs.mjs`, `viewer/evidence/plain-four-board/README.md` и четырьмя точно выбранными manifests/config/research pins — без повторной инвентаризации всего accepted input:

| Доска | Viewer trial | Круги | Контуры опор | Сегменты препятствий |
| --- | --- | ---: | ---: | ---: |
| 01 | 01 | 25 | 0 | 0 |
| 02 | 01 | 12 | 12 | 48 |
| 03 | 02 | 14 | 7 | 42 |
| 04 | 02 | 6 | 23 | 92 |

Четыре selected manifest/config/research canonical-LF hashes и manifest blobs совпали с accepted refs; counts/translation соответствуют provenance. Это проверка версии/данных, не новый расчёт H или физики. Для04 подтверждено сохранённое `start.sourcePx=[712,280]`. Прочитаны точные support/start revision документы03/04: у03 семь six-edge jaguar loops при прежней камере, у04 start-only candidate02. Старые Research figures04 candidate01 не экспортированы.

Восемь Viewer JPG обозначены как archived selected-trial pairs: source whole / native floor-and-receivers. Два Research JPG03 candidate02 отдельно обозначены как perspective / inverse **всего** исходника в signed research flat до native shift. Figure IDs и captions не смешивают эти framing/coordinate группы. Текст явно сохраняет ручное участие, условность скрытых опор/единого пола04, пределы inverse raised art и отсутствие отдельной приёмки движения/drops/buckets.

Дополнительно непосредственно просмотрены только два существующих локальных JPG `03-perspective-whole.jpg` и `04-perspective-whole.jpg`: видны trial02, config-prefix `d64678c33710…` / `9048b28af292…`;04 показывает старт слева от верхней лягушки. Это собственное наблюдение архивных JPEG, не рендер HTML, не повтор Viewer и не чужой VQA PASS. Полная визуальная проверка страницы в этом проходе не заявлена.

## Ссылки и PUBLIC catalog draft

Проверена **31 связь**: 21 relative static-file reference, восемь внутренних fragments и **два same-origin root-relative возврата `/review/`**. Все fragments/aria-labelledby существуют, IDs не дублируются. Для всех10 figures `img.src` и охватывающий full-JPG href совпадают; размеры HTML соответствуют JPEG, alt непустой. CSS и JPG targets относительны report route. Два catalog href не названы относительными: они направлены на известный PUBLIC catalog route; по датированному receipt у него200. Битых локальных targets не найдено. CSS содержит responsive правила и contain/full-image source intent, но это не доказательство реального mobile layout или отсутствия overflow.

Датированный snapshot **28 октября, 13:25:33–13:25:34 UTC** проверен как существующее evidence, **не как будущий release guard**:

- `PUBLIC_BASELINE.json` SHA-256 `8b44a020745ff5b13df4a7b0e4c9f0393239ca623a52532bdf6b6349edf47144` совпал.
- **550 files / 88 710 090 bytes**, modes files0644/dirs0755, uid/gid0, symlink false; 549 opaque published-file metadata records плюс сам RELEASE_MANIFEST точно согласованы с inventory.
- RELEASE_MANIFEST **107213 bytes**, SHA-256 `381ff209d36f24c1734e2f2012d0b298cb13efd37e928956ceaf00ab967c2937`; содержимое продуктов не исследовалось, сверялись только path/bytes/hash metadata.
- Catalog before **11955 bytes**, SHA-256 `759de374bafabe98bcc1d96e297e0972df1439bd7322e3920438ec46eb188694`; bytes совпали с catalog field baseline и датированным HTTP200 receipt.
- PUBLIC snippet receipt **948 bytes**, SHA-256 `d264c2fc62fa6673e6c527e995b4c4cdb0dd02845dfe6d7c12dbea53dc537598`; before/after metadata совпали. **Отсутствие auth_request явно задано PUBLIC handoff; raw snippet text в этом snapshot не сохранён, его независимый разбор здесь не заявлен.** Старый protected template/auth/rollback не применялся. Датированный no-cookie/no-login catalog200 согласован с PUBLIC схемой; текущую VPS-конфигурацию этот проход не проверяет.
- Предлагаемый P1 route в snapshot отсутствует/HTTP404; это не live опубликованная страница и не дефект frozen report.

Catalog draft воспроизведён **ровно двумя** адресными заменами: одна P1 card перед P2 и `3 демонстрации → 4 материала`. Draft SHA-256 **`bec395e0940223f0f2f3549a1726e9d61abb862e713ede1b2fab995e32d10581`**,12702 bytes. Обратные замены восстановили все11955 исходных bytes. Остальные разделы/карточки обработаны как непрозрачные сохраняемые bytes, без изучения чужих продуктов/кода/арта/QA. Draft не выдаётся за готовый shared release или актуальную основу будущей записи.

## Граница рендера и фактических отказов

У Technical QA **ноль browser/HTTP попыток** и ноль собственных новых policy denials. Первоначальный `git show` для CONTENT_PROVENANCE без `audit/` дал обычный path-not-found; путь уточнён по HANDOFF, прочитан `audit/CONTENT_PROVENANCE.md`. Это не запрет инструмента и не дефект продукта.

Сохранена новая **входящая общая граница**, не мой browser test: Lead сообщил VQA `cua_repl.js`, call **`call_abc1dd4797314b4f99b8273827bb843b`**, действие `cua.createBrowserTab('iab', file URL, {visible:false})`, exact target **`file:///E:/R4D/perspective/p2-runtime/output/p1-static-report-candidate-01/public/review/r4d/p1-mapping-report/index.html`**. Exact reason: **`The requested URL protocol is not allowed. Allowed protocols: "http:", "https:".`** Операция остановлена; другой actor/browser/server/CDP/HTML-renderer для обхода не использовался. Чужой факт соответствия всех10 изображений не перенесён в мой PASS. VQA ordinary style.css→report.css correction — отдельный случай, не собственный policy failure Technical QA.

Следовательно, **PAGE_RENDER_NOT_OBSERVED**: actual desktop/mobile rendering, читаемость страницы, viewport/overflow и HTTP200 каждого report/JPG после будущей публикации остаются непроверенными. Source/CSS checks и локальные JPEG не подменяют эти наблюдения. Нет broad fullTechnical/physics PASS, новых sim runs/seeds/research или переоценки принятого P1.

## Собственные результаты и завершение

Инструмент: [p1-static-report-candidate-01.mjs](p1-static-report-candidate-01.mjs). Новый свободный output был проверен до создания; evidence **`E:\R4D\perspective\p2-runtime\output\technical-qa\p1-static-report-01\EVIDENCE.json`**, **21615 bytes**, SHA-256 **`36787ee737913bde70b9140dc55261eed26e0b02250790926262c826437a01ff`**, запись `2026-10-28T14:02:00.298Z`.

Resource receipt рядом: **1008 bytes**, SHA-256 **`0c77183de75f3c4f7323433764b50a52cb66727749b4e71cbd0b1abd7d72aa5d`**. Свежий host-wide snapshot с текущей конкурентной областью P4/Millionko: RAM free16.903GiB, CPU7%, C14.731/D16.309/E16.534GiB. Лёгкий однопоточный static пакет: own RAM budget256MiB/E-output8MiB, retained coordination C budget1.525GiB; future peaks чужих процессов не атрибутированы и не объявлены измеренными. Тяжёлой сборки/симуляции/рендера не было; правила4/2 соблюдены, known exhaustion peak отсутствовал. TEMP/TMP только process-local E, Node compile cache отключён. Процесс завершился exit0, своей активной нагрузки/вкладок/серверов нет.

Frozen candidate01, accepted inputs, P2 frozen04/QA df309 и предыдущие evidence не изменены. VPS/shared writes/token/install/new people/sessions/worktrees/device/model changes не выполнялись; чужие процессы не тронуты. Работа завершена bounded static verdict без активного ожидания. Public пример: `<NODE> experiments/p2-free-approach/qa/technical/p1-static-report-candidate-01.mjs --artifact "<FROZEN_P1_REPORT>" --output "<NEW_FREE_E_OUTPUT>" --resources "<FRESH_RESOURCE_RECEIPT>"`. Следующий release — только отдельный exact intent/новый CTO token/свежая PUBLIC основа; эта QA не исполняла и не разрешала такой шаг.
