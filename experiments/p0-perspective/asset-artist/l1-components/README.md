# P0 L1: layered art components

Пакет подготовлен для разрешённого L1-gate и не является композицией. В нём ровно три рабочих компонента:

- `prepared/environment-floor-plate-1536.png` — законченный непрозрачный environment/floor plate `1536 × 1536` без drums и их теней;
- `prepared/drum-master-rgba.png` — один чистовой RGBA master drum с прозрачным фоном;
- `prepared/drum-shadow-rgba.png` — отдельная RGBA shadow layer на том же canvas и с тем же base-center anchor.

Фактические входы перечислены в `INPUTS.md`, точные промпты сохранены в `prompts/`, сырой ответ генератора — в `raw/`, воспроизводимая подготовка — в `scripts/prepare-components.ps1`, размеры/crop/anchor — в `prepared/component-metadata.json`, ход работы и хэши — в `RUN_RECORD.md`.

Четыре копии не размещались, горизонтальные `p` не выбирались, L1 composite не собирался. Финальная серия закрыта до отдельного решения Lead.
