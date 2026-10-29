# P6: frozen baseline для независимой TQA

Source: `b1bb84d06fea0389f8cecd3ae7e5a0103aad0e96`. 29 октября 2026.

Текущие runtime/site bytes сохранены отдельно, без пересборки, масштабирования и изменения какого-либо файла:

- TQA URL: `http://127.0.0.1:41766/`.
- Текущий backing directory: `E:\R4D\perspective\p6-runtime\builder\site`, также frozen.
- Immutable snapshot: `E:\R4D\perspective\p6-runtime\builder\candidates\baseline-b1bb84d\site`.
- Inventory: `E:\R4D\perspective\p6-runtime\builder\candidates\baseline-b1bb84d\inventory.json`.
- Inventory file SHA-256: `dc98e5271aac9e4a173a3902b13c62741630c4eacedc854a4326511b0c8bdef9`.
- Canonical files-list SHA-256: `78b7f52f4167f4def15ec2da9624a243d9f5ce69ae1ec8f896b756d2838f3558`.
- 9 файлов, 2 397 043 bytes. Для каждого проверено равенство disk = snapshot = фактически полученные HTTP bytes по прежнему URL.

Точные размеры и hashes всех 9 файлов — [baseline-b1bb84d-inventory.json](baseline-b1bb84d-inventory.json); HTTP receipt — [baseline-b1bb84d-http-check.json](baseline-b1bb84d-http-check.json). Freeze — обязательство не менять эти байты; ACL/глобальная безопасность/настройки OS не менялись.

Дальнейшие build/export/verification по умолчанию используют отдельный `runtime/candidates/integration-02/site`. Его будущий server — порт41767. Пока он не собран и не запущен, этот адрес не объявляется доступным. Существующий baseline server продолжает обслуживать старые байты; исходный процесс не перезапускался.

Для перезапуска baseline, только если порт41766 свободен: `node experiments/p6-geometry-first-art/builder/scripts/serve.mjs --baseline`. Он обслуживает snapshot, а не следующие кандидаты.

Совместимость с Artist textual layer contract `e8bf577d46b48b871f678f53f85a5cb0d250eeb0` описана в `../CONSUMER_CONTRACT.md`. Actual sphere/shadow metadata packet ещё не выдан Lead. Значения canvas/alpha bounds/anchors/radius/opacity не подставлялись по догадке; интеграция следующего кандидата начинается после exact packet.
