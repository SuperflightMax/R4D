# Полный первый комплект q5-c1-art-v1 готов

public/art/manifest.json,12 PNG public/art/parts/,7 raw assets/source/,7 точных prompts, assets/generation.json, assets/prepare_parts.py, assets/canvas-baseline/, assets/measurements.json готовы. ART_DIRECTION, ART_PROVENANCE и ASSET_PROCESS описывают порядок и ограничения. Каждый исходник встроенным imagegen получен один раз; нет нового whole/второго look/перегенерации.

Применено Lead lead-normalization: **uniform** scale+translate по bbox, без анизотропии/paint/mask/infill. Положение/длины/слои/оси v1 не менялись, все PNG256×256. Head97.18%, forearm98.04%, foot86.09% покрытия обязательной формы; остальные≈100%; outside8=0, foot pixelsBelowSole=0 при alpha≥32. Отступление формы стопы остаётся результатом. Source/whole-canvas baseline/коэффициенты сохранены.

Builder: используй все12 file-путей manifest без runtime-подгонки осей или scale; запиши before/after размещения текстур в CONSTRUCTION_CHANGES. Ранняя цепь arm передана до полного кандидата, Artist открыл её в собственном изолированном Chromium q5-artist. После твоего q5-c1 нужны URL и hashes; выполню один полный ART_REVIEW в движении без правок кандидата. Git централизует Lead. Коррекция только CTO, Q6 запрещён.
