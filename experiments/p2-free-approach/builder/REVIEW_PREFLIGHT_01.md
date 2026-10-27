# P2 Review: read-only preflight 01

28 октября 2026, Europe/Kiev. Серверный замер 2026-10-27T23:45:35.751840+00:00. **READ_ONLY_PREFLIGHT_COMPLETE_AWAITING_LEAD_GATE_AND_CTO_TOKEN**. Server writes=0; candidate-02 bytes/source/tree/build manifest неизменны.

## Штатный доступ и полностью прочитанные инструкции

Использован только существующий SSH alias `vps1-direct`, BatchMode и ConnectTimeout15. Connection/read успешно выполнены, без добавления host keys/credentials/settings и без извлечения SSH/security config. Локальный historical control.ps1 и другие найденные Windows скрипты не запускались.

Полностью прочитаны оба названных документа, включая их обязательные INDEX/PROCEDURES. Ранее полностью прочитаны Staff `roles/release-engineer.md` на e9dfa0e32226e3f72de1f75e5c77a43d5ebfd9b3 и R4D `roles/release-engineer.md` из exact Lead base ec090addd2f261b4f4f2b5abd8c742df4672d115. Версии серверных docs определены фактическими bytes/SHA256, а не устаревшими заголовками:

| Документ | Bytes | SHA256 |
| --- | ---: | --- |
| `/home/sf/assistant-context/vps/INDEX.md` | 15577 | `e925b847f4cf1bb747a68817f7a2755a58c39efccee724ce967649bd65f62064` |
| `/home/sf/assistant-context/vps/PROCEDURES.md` | 5146 | `34fb7d9ac43a8b234a86bb6272b23a329afda28b9a1adf4dbf1fda3a56728bc9` |
| `/home/sf/assistant-context/vps/services/superflight-studio.md` | 57415 | `e793dddd6db66fad7b0548358b2da47d0869a6c20cfa5ea40dbb4149a169e77f` |
| `/opt/superflight-studio/README_RU.txt` | 10915 | `7b4e78bcd3bda70daa7ed4203d28b8be367c51cb596c9f54db8ac366ed9f1cf9` |

Применимые правила: fresh live state перед изменением; минимальное действие только по выданному gate; сохранение старых routes/releases и защиты; nginx -t и только graceful reload; после изменения relevant service doc + CHANGELOG; rollback не восстанавливает/удаляет sessions DB. Исторические root/status в README/runbook не приняты за текущую цель. Другие приложения и общие auth/credentials/security не входят в работу.

## Фактическое текущее состояние

- Live release id: `fd851ad78adfec67c11ed59f07fa24dbef2761c6`.
- Live root: `/srv/superflight-review/releases/fd851ad78adfec67c11ed59f07fa24dbef2761c6`.
- Review snippet: `/etc/nginx/snippets/review.locations.conf`, mode644, SHA256 `544233b893c860cbe993a952232211b0a8641df6482f42815ec680d2cd23c7d4`.
- Полный live release manifest: `/srv/superflight-review/releases/fd851ad78adfec67c11ed59f07fa24dbef2761c6/RELEASE_MANIFEST.json`, 261716 bytes, SHA256 `9c6159e21fd655b86525a8b19427b6fe650318c28c899cd5f10da761c2b62b5c`.
- Browser tree: **457 files / 82751790 bytes**.
- Все457 `published_files` проверены по path/bytes/SHA256; множества manifest/actual совпали, errors0, symlinks0. Все browser files root:root,644.
- Catalog: `review/index.html`, 10381 bytes, SHA256 `584aa3f83c2264e349a3ee66ba7f2b376f22737ed5160f72873a597ad3f79247`. Его существующие ссылки перечислены в локальном JSON preflight, содержимое не менялось.
- `review/r4d/p2-free-approach/` отсутствует.
- На filesystem release root свободно 30883127296 bytes; это датированный замер, не обещание будущего остатка.

Manifest использует ключ `published_files`; первый summary-reader первоначально искал `files`, затем фактическая схема распознана и выполнено полное сравнение457 записей. Это уточнение read-only проверки, не изменение manifest или release.

## Намеченный intent для Lead/CTO, сейчас не исполняется

Адресный независимый offline TQA прочитан полностью из `6a9f37a17bbcea1e93d79bb7053b45285b9ce76a:experiments/p2-free-approach/qa/technical/candidate-02-REPORT.md`. Он сверил все15 файлов/входы и11087 compiled/native состояний, события/replay/ticks для6 seed. Все6 исходов LOST совпали с native; browser/UI/Pixi/download/visual и полного Technical QA PASS нет.

Builder принимает найденный [P2] дефект source `5f40f669…`, `scripts/build-static.mjs:80`: граница `(?:^|["'\s])[A-Z]:[\\/]` пропускает настоящие локальные пути в template literal и file URI. Это ослабление эвристики будущих сборок, а не только исключение доказанного Pixi false positive. В **текущих exact bytes** независимая TQA признаков утечки не нашла. Факты передаются CTO вместе; отсутствие найденной утечки не объявляет scanner исправленным. Исправление — отдельное будущее поручение с новым source/candidate при необходимости; текущий candidate не меняется и не пересобирается. TQA-отчёт не является разрешением публикации.

Тот же frozen `p2-jungle-static-candidate-02`, source `5f40f6692dc5e7238afc961a2e0afa826cdefc9b`, 15 files/2448166 bytes; tree SHA256 `5bc6fd3b7f99e20fe98e3f98d972371538beee767abebc905fa595af55205b4d`, build manifest SHA256 `6cf78e7b64625828929cd5905afe033570579f8e2950c103c757d53016a49aa0`.

Предлагаемый release id: `p2-jungle-static-candidate-02`.
Предлагаемый новый immutable root: `/srv/superflight-review/releases/p2-jungle-static-candidate-02`.
Предлагаемый fresh rollback/evidence: `/opt/superflight-studio/backups/review-p2-candidate-02-20261027T234352Z`.
Оба каталога сейчас **не существуют**, не создавались. Имя rollback привязано к этому preflight; его содержимое/время фиксации должны быть фактически свежими непосредственно перед разрешённой записью. Если любой target уже существует или baseline сменился, не перезаписывать; вернуть факт Lead для нового exact intent.

Новый полный release сохраняет весь текущий Review, добавляет ровно15 frozen P2 files и одну честную карточку/счётчик P2 в обычный catalog с пометкой **runtime/visual-unverified**. Замороженный P2 route для подписи не правится. Из прежних457 browser files456 должны остаться побайтно прежними; только catalog получает ограниченное добавление. Ожидаемое количество472, итоговые bytes будут 82751790+2448166+точная catalog delta, которая сейчас не готовилась. Полный RELEASE_MANIFEST с hashes/provenance остаётся вне browser tree. Приватные TS/maps/logs/credentials не доставляются; только необходимый frozen compiled runtime, сохранённый в E artifact.

Ограниченная публикация того же immutable candidate после достаточного offline TQA и нового exact gate может дать защищённый HTTP(S) target для дальнейшего реального VQA. Она не является финальной QA/приёмкой P2 или artistic PASS. Authenticated browser session пока не подтверждена; сам HTTP(S) target не доказывает успешную post-auth отрисовку.

## Только необходимый существующий workflow после gate/token

1. Lead передаёт exact intent CTO и получает единственный общий release token. Сейчас ни exact gate Lead, ни token не получены. До них никакого upload/mkdir/staging/серверных scripts/правок/root switch/reload.
2. После token ещё раз read-only проверить актуальные root/snippet/manifest against baseline и состояние nginx/диска в нужном объёме. Несовпадение — остановка до решения Lead; stale preflight не затирает поздние изменения.
3. Создать новый immutable полный Review release штатным способом, сверить все paths/bytes/SHA256, root:root, dirs755/files644, no symlinks, frozen15 P2 files и неизменность остальных456. Старые releases сохранить.
4. Непосредственно перед switch получить fresh rollback/evidence: исходный Review snippet, baseline root/manifest hashes, SHA защищённого vhost/связанных файлов без вывода их секретного содержимого и ограниченное состояние/план отката. Sessions DB не читать и не копировать.
5. Атомарно изменить только root существующего Review snippet, сохранив прочие bytes защиты; nginx -t до/после и только graceful reload nginx. Никаких контейнеров, новых сервисов/портов, auth/security/permissions/firewall/DNS/других проектов.
6. Postchecks: root/snippet и manifest фактически соответствуют новому exact release; все472 browser files совпадают с manifest, все15 P2 SHA неизменны, старый root и456 файлов сохранены; каталог/старые routes остаются. Проверить существующий auth redirect без сессии, Origin/dotfiles/GET-only и защитные заголовки в нужном объёме, nginx active. Ресурсные200/Pixi/controls/download — только реальным разрешённым browser сценарием с готовым авторизованным доступом; иначе назвать это непроверенным.
7. При rollback сначала защититься от поздних чужих изменений по live snippet hash, вернуть только сохранённый root/snippet и выполнить nginx -t/graceful reload. Не трогать DB/sessions/credentials и не удалять releases. После postchecks обновить service doc и CHANGELOG, сообщить Lead/CTO и освободить token; параллельных shared writes до освобождения нет.

Ни один пункт записи не выполнен. Старые denied launcher/file-preview не повторялись, другого actor/surface не использовалось. P3–P6/другие доски закрыты. Работа остановлена на сохранённом preflight до адресного gate Lead и single token CTO, без активного ожидания.
