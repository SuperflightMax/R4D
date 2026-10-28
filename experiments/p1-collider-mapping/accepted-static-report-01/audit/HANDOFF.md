# Builder → Lead: принятый P1, статический отчёт candidate01

Готов локальный frozen candidate для целевой TQA/VQA, **не публикация**.
Builder `builder-r4d-p2-free-01`, существующий worktree и branch
`codex/r4d-p2-free-builder-01`. Новых сессий, агентов или worktrees не создано.
Фактический turn ID инструментами этой сессии не предоставлен.

## Точные артефакты

- Единственный содержательный вход: accepted P1
  `4b47db04c7140ebf88f69b91faa0b790d46f22ec`, только
  `experiments/p1-collider-mapping/clean-repeat-01/`.
- Build source commit: `2135851427c568038b23fded38d6cbe8b6f6b0e3`.
  Последующий commit этого handoff не меняет сайт или frozen candidate.
- Source namespace:
  `experiments/p1-collider-mapping/accepted-static-report-01/`.
- Frozen candidate:
  `E:\R4D\perspective\p2-runtime\output\p1-static-report-candidate-01`.
  Создан только после проверки отсутствия; не перезаписывать.
- Публичный payload: `public/review/r4d/p1-mapping-report/` внутри candidate.
  **12 файлов, 2 057 712 байт**: один HTML, один CSS, десять неизменённых JPG.
  Ни JS, ни sim-core, configs, traces, карты исходников или обязательные внешние
  библиотеки в public не входят.
- Public-relative tree SHA-256:
  `88e934cab5ce2621cc6ad811b7bc40bcfb5ccce74262a35068654552aeeb99f7`.
- Site-relative tree SHA-256:
  `c2286a6284f27f0d550689c1313f7c6bf9e2acda483547ed2d1801db1919a02b`.
  Правило обоих: отсортированные UTF-8 строки
  `sha256 + space + decimal bytes + space + relative path + LF`, затем SHA-256.
- `BUILD_MANIFEST.json` SHA-256:
  `00eb21e37f4a30e1dfbf7addad0eeafe1e66b266c553495ea30ae8d96255a14c`.
  Там каждый публичный файл, его размер и хеш, build source и статус QA.
- Дополнительная проверка зафиксированных байтов:
  `E:\R4D\perspective\p2-runtime\output\builder\p1-static-report-prep-01\VERIFY_FROZEN.json`.

## Содержание и соответствие иллюстраций

Рецепт раскрывает ручные отметки, независимую оценку камеры каждой доски,
прямую/обратную H с делением на w, круги и segment loops, общий сдвиг в native,
отрисовку геометрии из config и различие whole-source / playable-floor framing.
Отдельно описаны результаты четырёх привязок и ограничения скрытых опор,
рисованной перспективы, inverse raised art и условного единого пола 04.
Не заявляются zero-human, универсальность или общая метрическая точность.

Восемь основных картинок — уже сохранённые Viewer pairs: 01/02 trial01,
03/04 trial02, seed1 tick0; whole-source perspective и inverse-floor crop
с native config geometry. Ещё две — Research candidate02 03, перспектива и
inverse **всего** исходника в signed research flat до native shift. Эти группы
и рамки кадра явно различены в подписях. Подписи и кнопки старого Viewer
сохранены пикселями; страница объясняет их исторический статус.

У 03 показаны 14 кругов и 7×6 jaguar segments при прежней камере.
Старые Research figures 04 относятся к candidate01, поэтому не экспортированы.
Финальная существующая Viewer pair 04 относится к trial02/config9048b28af292…
и показывает исправленный source start `[712,280]`. Отсутствия обязательной
финальной иллюстрации нет: нового построения, пересчёта или перерисовки не было.

Точные refs/blobs/raw SHA-256/версии — `audit/PROVENANCE.json`; карта текст ↔
источник ↔ figure ID — `audit/CONTENT_PROVENANCE.md`. Оба есть и в source,
и в непубличном audit candidate. Приёмка относится к P1 mapping/perspective,
прежде всего препятствиям. Drops/buckets, шарик, тень и физическое качество
движения не выданы за отдельно принятый результат.

## Свежий PUBLIC baseline и минимальный черновик каталога

Baseline: **2026-10-28 13:25:33–13:25:34 UTC**, без cookies/login, только чтение.
Полный file+dir inventory root (включая owner/mode) дважды совпал в ходе чтения;
snippet и vhost до/после совпали. 550 файлов, 88 710 090 байт, root:root,
files0644/dirs0755, symlinks нет. Содержимое других продуктов не исследовалось.

- Actual current root:
  `/srv/superflight-review/releases/p3-jungle-masks-frozen-01`.
- `RELEASE_MANIFEST.json`: 107 213 байт, SHA-256
  `381ff209d36f24c1734e2f2012d0b298cb13efd37e928956ceaf00ab967c2937`.
- Catalog `/review/`: public HTTP200; 11 955 байт, SHA-256
  `759de374bafabe98bcc1d96e297e0972df1439bd7322e3920438ec46eb188694`.
  HTTP bytes совпали с actual file.
- Current P2 route: public HTTP200, body SHA-256
  `8bebd1f5587764f7504bb5c179f51abdf8f5b576e01a9542d2707e806354c32a`.
  Это прежний candidate03; эта задача его не заменяет.
- Предлагаемый `/review/r4d/p1-mapping-report/`: **404**, директории в root нет.
  Это предлагаемый маршрут, не live URL.
- Actual public Review snippet `/etc/nginx/snippets/review.locations.conf`:
  948 байт, SHA-256
  `d264c2fc62fa6673e6c527e995b4c4cdb0dd02845dfe6d7c12dbea53dc537598`.
  **auth_request отсутствует**; старый protected template возвращать нельзя.
- Actual vhost `/etc/nginx/conf.d/superflight-studio.conf`: 17 255 байт,
  SHA-256 `35c0db6029d246dac31a53d1151e89fedba9dbba0ceeeb1921e779ef0307e4e8`.
- Candidate `audit/PUBLIC_BASELINE.json` SHA-256:
  `8b44a020745ff5b13df4a7b0e4c9f0393239ca623a52532bdf6b6349edf47144`.
  Внутри exact inventory, actual catalog, release manifest и HTTP evidence.

`audit/CATALOG_DELTA.json` — **только draft** с pin текущего catalog SHA:
добавить одну понятную карточку P1 перед P2 и поменять «3 демонстрации» на
«4 материала». P0/P2/P3 и чужие разделы сохранены побайтно. Непубличные
`audit/catalog.before.html`, `catalog.draft.html`, `CATALOG_PATCH_PROOF.json`
лежат в candidate. Обратное применение двух замен восстанавливает все исходные
байты. Draft catalog SHA-256:
`bec395e0940223f0f2f3549a1726e9d61abb862e713ede1b2fab995e32d10581`.
Они не являются готовым shared release или разрешением заменить каталог.

## Проверка и следующий шаг

Builder самопроверка PASS **только в указанном объёме**: 12-file allowlist,
10 Git-exact JPG и их реальные размеры, selected config/Research canonical
hashes, counts, внутренние ссылки/anchors, alt-тексты, отсутствие активного
контента/внешних ресурсов/операторских путей. Повторная frozen-byte проверка
подтвердила manifest/tree/file hashes, baseline и обратимость catalog delta.
Все исходные JPG просмотрены как локальные изображения.

HTML/CSS в браузере в этой сессии **не отрисованы**. Нет утверждения о
runtime/visual/independent QA PASS. Предыдущие отклонённые browser/server
действия не повторялись и не обходились.

Lead назначает целевую TQA/VQA этого exact frozen candidate: отрисовка страницы
desktop/mobile, читаемость/доступность, ссылки на полные JPG, отсутствие
обрезания, соответствие изображений/версий/подписей и границ приёмки. **Без
новой симуляции P1**, подбора seeds или переоценки принятого исследования.
Если кандидат требует изменения, не переписывать candidate01: новый номер
по решению Lead, с новым source/hash и проверкой.

После целевой QA — exact release intent на актуальной PUBLIC схеме и **новый
токен CTO до любых VPS writes/mkdir/upload/staging/backup/snippet/docs/reload**.
После реального переключения нужны public HTTP200 страницы и каждого JPG и
визуальное сопоставление с проверенным candidate; сейчас публикация не заявлена.

P2 frozen04 / TQA df309 остаются сохранены. Старые P2 local intents01/02 не
применимы к PUBLIC схеме и не перезаписаны. До завершения этой P1-публикации
P2 заново не упаковывался. UGH, скелетная линия и другие продукты не менялись.
