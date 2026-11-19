# FX-01 / D1 CUT — точная публикация рассмотренного staging

**PREPARED / HOLD UNTIL DIRECT CTO CUT ISSUE.** Документ сам не запускает переключение. Адресат — прежний единственный Builder; только FX-01, существующие ресурсы и доступы. После прямой выдачи CTO Git/index снова передан Builder до завершённого отчёта/freeze. Область записи репозитория — только `experiments/fx-workshop/FX-01/`; `work/` ведёт CTO.

CTO прочитал полный D1-STAGING, скрипты, квитанции и diff, а 19 ноября в 03:14:29 UTC отдельно выполнил серверный read-only verify: STAGING_READY, live/base/protected/staging/nginx guards совпали. Это разрешение на внутренний CUT в рамках уже принятого Максом исполнения, без повторного согласования плана.

## Единственный разрешённый материал

- Source runtime `43b6268e924698048a4d79df1aad2512c86f08f7`, только неизменённые `index.html`, `style.css`, `app.js`.
- Staging `/srv/superflight-review/releases/fx01-43b6268e-20261119T031029Z`.
- Canonical inventory SHA-256 `b24d7b91242b33b46c458bfefa54a0a9fffe8d4615ba08cdb242b957e18f8cb9`.
- Ожидаемый live base `/srv/superflight-review/releases/millionko-ui02b-r3-r01-cc42352d`.
- Live/base snippet SHA-256 `b9dde1214d4aabf6b7d4469fddf5cd81ee29f8e94706b20a8fa900b92f21e983`.
- Единственный candidate snippet SHA-256 `39b20c6fe05572089c1038ec95129211c8b6b2fc374c16b3baac117da04f3456`.
- Private receipts/guarded rollback `/opt/superflight-studio/backups/review-fx01-43b6268e-20261119T031029Z`.
- URL `https://superflight.space/review/r4d/fx-workshop/fx-01/`.

Никакой переделки runtime/обёртки, нового release из иного дерева, общих конфигураций или чужих проектов. Все прочие условия D1 сохраняются. Счётчик R4D 23→24; существующие browser-файлы и каталоги — как в рассмотренной квитанции/diff.

## Выполнение после прямого CUT

1. Подтвердить фактические model/effort/cwd/branch, завершённость прошлого writer-хода и точную выдачу. Прочитать свежие ops-инструкции/состояние; снова проверить C/D/E и VPS, guards live root/hash, protected components, base/staging inventory и nginx. При чужом обновлении **не переключать и не перетирать**, вернуть конкретику CTO; не собирать новый staging без рассмотрения.
2. Сохранить свежую pre-CUT квитанцию/копию текущего snippet и способ отката. Выполнить существующее атомарное переключение **только root** через candidate snippet с сохранением владельца/прав, nginx test до/после и graceful reload. Никаких restart/изменений других locations/auth/portal/DB/сессий/контейнеров/GPU/WG/DNS/firewall/certificates. При ошибке действовать сохранённым guarded rollback, только если точные guards позволяют; чужой более поздний выпуск не откатывать.
3. Проверить реальные HTTPS-ответы трёх FX-файлов: status, размер, SHA-256 и MIME совпадают с C1/Q1R. Проверить оба каталога/новые ссылки, сохранность существующих защит и недоступность Markdown/checks/evidence/source maps/dotfiles. Не раскрывать private receipts/профили/пользовательские данные.
4. Один небольшой browser delivery smoke на настоящем HTTPS в новом отдельном `?test=`/профиле: реальная загрузка актуальных bytes, A↔B с черновиком, применение/настройка, закрепление/перезагрузка. Не повторять полную UX-матрицу без причины. Личный Chrome, фокус и рабочий стол не занимать; M11 не объявлять физическим по headless.
5. Service doc/CHANGELOG дополнить append-only фактическим CUT/проверками/ограничениями. Сохранить компактную квитанцию source ↔ release ↔ URL ↔ HTTP/browser-проверки в своей продуктовой области. README актуализировать ссылкой на результат доставки/QA и открытые гейты; исторические SELF-CHECK/Q1 не переписывать. Commit+push только собственной области, назвать точный SHA; свои временные процессы остановить, Git/index вернуть CTO.

Если нужен новый ресурс/право/расход/установка — остановить только зависимый шаг и вернуть конкретную причину. Успех доставки объявлять лишь по фактическим HTTP/browser результатам. Итог — **опубликованный UX-кандидат**, физический M11/Макс/Слава/Product + Max ещё ожидаются. FX-01 не принят, FX-02+ не открыты.
