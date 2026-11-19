# FX-01 — факты существующей доставки

Подготовка CTO, 19 ноября 2026. Это сведения для выпуска после коррекции/адресной QA, не отметка о состоявшейся публикации. Кандидат/серверные файлы по этому документу пока не менялись. Доставляется только FX-01, без нового хоста, репозитория, установки, API или доступа.

## Доступ и инструкции

- Имеющийся SSH alias `vps1-direct`, пользователь `sf`; read-only доступ проверен. Эксплуатационная документация описывает существующий passwordless sudo. Новые права не выдавались.
- Перед изменениями перечитать `/opt/superflight-studio/README_RU.txt`, `/home/sf/assistant-context/vps/INDEX.md`, `/home/sf/assistant-context/vps/PROCEDURES.md`, актуальные разделы `/home/sf/assistant-context/vps/services/superflight-studio.md`; проверить живое состояние, не доверять историческим root/hash.
- Никаких `.env`, auth/DB/cookies/tokens, ключей и сессионных данных не читать/публиковать. Не трогать другие приложения, GPU, WireGuard, DNS, firewall, сертификаты и контейнеры.

## Установленный существующий способ

Публичный Review — `https://superflight.space/review/`. Новая FX-страница планируется в `https://superflight.space/review/r4d/fx-workshop/fx-01/`. Это выбранное место внутри уже разрешённого Review, без нового сервиса. Runtime — только exact `index.html`, `style.css`, `app.js` принятого для доставки commit; без README, checks, evidence, source maps, профилей и пользовательских рецептов.

Прочитанный живой snippet `/etc/nginx/snippets/review.locations.conf` содержит стабильный public browser-only location. Разрешено менять только литерал immutable root; весь остальной snippet сохраняется побайтно. **Не восстанавливать исторический auth_request/private redirect и не перерендеривать старым шаблоном.** На момент read-only проверки root был `/srv/superflight-review/releases/millionko-ui02b-r2-r01-334b7287`. Это наблюдение, не будущая гарантированная база.

Рабочая схема прежних выпусков: новый immutable release с сохранением всех прежних browser-файлов/владельцев/прав; точные FX runtime-файлы; минимальные изменения двух каталогов; fresh rollback; полная сверка сохранности, fresh live-root/hash guard; атомарная замена только Review root; `nginx -t` до/после и graceful reload. Старые releases сохраняются. При чужом изменении live состояния не перетирать его: остановить переключение, пересобрать от актуальной базы/согласовать окно, не вмешиваясь в чужую работу.

Прочитаны два текущих каталога: `review/index.html` и `review/r4d/index.html`. В глобальном каталоге R4D указан как 23 артефакта; в R4D — art-2d 1, skeleton 13, perspective 9. Для FX достаточно одной новой карточки/ссылки и раздела FX Workshop, с корректным общим счётчиком. Остальные карточки, статусы и ссылки не переписывать. Числа перед выпуском считать из свежего дерева, не заменять вслепую.

На VPS при preflight было около 26 GiB свободно. Перед staging проверить снова, как и C/D/E по порогам 4/2 GiB. Не делать cleanup чужого и не забирать ресурс HO.

## Проверка доставки и границы

Нужны связь source commit ↔ runtime SHA/size ↔ release ↔ URL; чтение всех FX-файлов по настоящему HTTPS с совпадающими байтами/MIME, каталог/ссылки и небольшой browser smoke в отдельном тестовом состоянии. Убедиться, что README/checks/evidence/dotfiles не стали доступны. Сохранить текущие Origin/GET-only/no-store/noindex/nosniff/Referrer-Policy/DENY и существующие защиты; посторонние конфигурации/маршруты не менять.

Серверный service doc и `CHANGELOG.md` дополняются append-only по существующему процессу; retired `/opt/superflight-studio/update-docs.py` не использовать. Продуктовая команда сохраняет короткую квитанцию доставки в своей FX-области репозитория и делает commit/push; full raw logs не входят в public tree.

Публикация кандидата не закрывает физический M11 и человеческий gate. Карточка Review должна честно обозначать UX-прототип для просмотра, не законченный этап. До реальных наблюдений Макса/Славы и решения Product + Max FX-01 не принят; FX-02+ закрыты.
