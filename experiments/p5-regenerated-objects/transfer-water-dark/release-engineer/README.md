# P5 Water + Dark — local package wrapper

Только локальная material copy и общая обвязка. Этот код не выполняет HTTP/SSH/Review/VPS операции, не запускает сервер, не собирает product/native и не использует Jungle/P4/P6 payload. TokenGranted=false; прежний Jungle token CLOSED.

## Текущий материал

`candidate-water-w04.json` pin-ит original Water whole-gate w04. Первый сохранённый `package-draft-w04.json` включает только эту версию; в нём Dark отсутствует. В UI нет фиктивной Dark демки или художественного PASS. Видимые ограничения сформулированы по-человечески; source commits, hashes и точные residuals спрятаны в отдельный metadata-раздел. Все public href/src относительные, без внешних сервисов/fonts/scripts обвязки.

`candidate-dark-d01.json` pin-ит второй original baseline: реальный частичный Dark d01. Новый `package-baselines-w04-d01.json` (`purpose=baseline-archive`, `final=false`) хранит оба исходных варианта для сравнения; Water w04 снабжён exact историческими TQA/VQA с открытыми W04-V01/W04-TQA-V01, Dark handoff pending. Архив не подменяет текущие исправляемые результаты. Original material receipts и первый draft не менялись. См. HANDOFF_002.md.

Own runtime: `E:/R4D/perspective/p5-runtime/release-engineer/transfer-water-dark/`.

- `material/<board>/<id>/public/` — только exact whitelist producer FILE_INDEX.
- `material/<board>/<id>/private/` — exact FILE_INDEX/producer index/common-inputs/artist source/supporting sidecars; вне web root.
- `material/<board>/<id>/RECEIPT.json` — bytes/SHA, source pins, status и ограничения; immutable material, occupied ID не заменяется.
- `builds/<explicit-package-id>/public/` — wrapper и все явно перечисленные baseline/variant board roots.
- `builds/<explicit-package-id>/private/` и `PACKAGE_INDEX.json` — package descriptor/QA snapshots и inventory, вне web root.

Материальные файлы и готовый draft помечаются read-only. Создание нового пакета не удаляет предыдущие пакеты или baseline.

## Команды (own E cwd)

```powershell
python -B experiments/p5-regenerated-objects/transfer-water-dark/release-engineer/package_transfer.py import experiments/p5-regenerated-objects/transfer-water-dark/release-engineer/candidate-water-w04.json
python -B experiments/p5-regenerated-objects/transfer-water-dark/release-engineer/package_transfer.py build experiments/p5-regenerated-objects/transfer-water-dark/release-engineer/package-draft-w04.json
python -B experiments/p5-regenerated-objects/transfer-water-dark/release-engineer/package_transfer.py verify E:/R4D/perspective/p5-runtime/release-engineer/transfer-water-dark/builds/water-w04-dark-pending
python -B experiments/p5-regenerated-objects/transfer-water-dark/release-engineer/package_transfer.py check-final experiments/p5-regenerated-objects/transfer-water-dark/release-engineer/package-draft-w04.json
```

Первые две команды уже выполнены; повтор с теми же ID защищён от overwrite. Для новых inputs использовать новые явные candidate/package ID, а не менять старый baseline.

## Следующий frozen input

Lead передаёт exact FILE_INDEX path/bytes/SHA, board/id, consumer/artist pins и честные label/stage/limitations. Producer schema `r4d.p5.transfer.file-index/1`, producer root только `p5-runtime/builder/transfer-water-dark/<water|dark>/`. Создать новый candidate descriptor по примеру w04, `baseline=false` для Water successors. Первый реальный Dark generated-board input становится своим baseline; D00 scaffold не является финальным Dark. Один original baseline на доску, без незаметной смены исходного метода.

`import` проверяет exact index, безопасные уникальные relative paths, все file bytes/SHA, отсутствие extra/link/reparse/private TS/maps/key files, active P1 config/manifest и все явные source/provenance sidecars. Common input SHA497eb8... задаёт Water04/trial02 и Dark02/trial01. Git source/support refs читаются только в собственном P5 transfer prefix; remote autofetch/checkout не выполняются. При ordinary failure WIP сохраняется; occupied material не очищается.

Новый package descriptor явно перечисляет `versions` и `selected.water`/`selected.dark`. Для successors надо оставить original baseline в `versions`. `stageLabel` и дополнительные `technicalNotes` можно передать в version entry как annotation, не изменяя material. Все указанные варианты сохраняют собственные ссылки; явного выбора «самой новой папки» нет.

Для каждой версии `qa.technical` и `qa.visual` принимают exact `commit`, `path` и `fileIndexSha256`. SHA должен совпасть с этим material, отчёт физически читается из указанного собственного Git commit и копируется только в private package sidecars. Это проверка handoff identity, а не присвоение QA PASS по тексту.

`final=true` разрешает только LOCAL_ASSEMBLED пакет при обоих действительных текущих generated board inputs, обеих независимых QA handoff на выбранные точные версии и отдельном exact Lead handoff. `purpose=baseline-archive` всегда исключает final. `leadHandoff` задаёт физически читаемые `commit`/`path` в own P5 transfer prefix и `fileIndexSha256s: {water: <selected SHA>, dark: <selected SHA>}`; report копируется в private. Это привязка к явно выбранным текущим inputs, не автоматический вывод разрешения из QA или наличия двух исходных вариантов. Нет Dark/QA либо выбран D00/scaffold — final build блокируется до создания output. Полный художественный PASS не выводится из наличия отчётов. Любая публикация требует отдельного конкретного CTO token; local final не выдаёт это разрешение.

## Границы проверки

Выполнены real w04 и d01 import/build/hash verification. Новый архив:43 public files/27415220 bytes,7 static relative href/src. Первый draft сохранён неизменным. Product/native/seed/visual QA не повторялись. На HANDOFF_001/002 browser/runtime был UNVERIFIED; HANDOFF_003 закрывает scoped actual browser smoke точного baseline archive: обе сцены/relative links/metadata/browser Back работают,17PNG реально загружены,required payload failures0,console warn/error пусты. Optional default favicon404 сохранён заметкой; это не полный art/native PASS. Frozen PACKAGE_INDEX не переписывался. В HANDOFF_001/002 server/browser запусков не было. В HANDOFF_003 по явному разрешению использованы один own loopback server и hidden IAB tab; оба закрыты. file:// не использовался. Исходные Builder PID37932/session37240 и PID40328/session83117/roots не менялись.

TEMP/TMP/cache/output — own E process-local. Перед тяжёлым шагом fresh C/D/E/RAM/CPU/aggregate, own peak+4GiBRAM/2GiBE allowance. E<=4GiB предупреждение/диагностика, <=2GiB safe checkpoint/STOP; чужое не чистить. Не запускать прежние Jungle publish/preflight/rollback scripts.
