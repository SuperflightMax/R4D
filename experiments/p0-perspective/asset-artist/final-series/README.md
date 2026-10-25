# P0 final series — independent component sets F1–F4

Это Asset Artist handoff для deterministic assembly. Boards здесь не собраны.

Каждый `board-0N/` содержит собственные independently generated raw plate/master, exact prompts, prepared opaque `1536²` plate, clean RGBA control master, отдельную board-owned shadow и metadata с crop/anchor/hashes. Ни один F-set не использует L1 или другой F-set как source/reference.

- `SERIES_INPUTS.md` — разрешённые общие formal/art inputs и exact freeze commits.
- `RUN_RECORD.md` — все 11 фактических image_gen invocations, включая marker/chute failures, frozen-QA baked-shadow failure и основания corrections.
- `scripts/prepare-final-components.ps1` — единая воспроизводимая подготовка без художественного redraw.
- `scripts/check-final-components.ps1` и `component-validation.json` — alpha/edge/anchor/hash проверка.
- `integration-manifests/` — source declarations, frozen layouts и 12 уникальных component hashes для Builder cross-series checker.

В каждом наборе master и shadow используют один declared base-center anchor. Four copies, board composite, overlays и post-composite redraw отсутствуют.
