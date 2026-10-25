# Исторический envelope input и текущий actual trace

25 октября 2026. `SHORTS_TRACE-envelope01.json` — точная побайтовая копия исторического trace, **восстановленного после semantic cleanup**, а не заранее сохранённый original snapshot. Восстановление: текущий handTraceEnvelope возвращён в boundary, новый ключ убран, исходный порядок ключей/indent2/trailing newline и Windows CRLF сохранены. SHA256 проверен до записи и после неё: `c967ab5f1a635c3587fa7b56d5298529d87cd6353f57ffa1f0793f666fbcd708`; равен исходному input hash Builder. Значения равны embedded semanticTrace из CAGE_REST. Подробности — `../TRACE_VERSION_AUDIT.json`.

Старый solver FAIL относится к этому31-вершинному envelope input и сохраняется. Это не прогон текущего44-вершинного actual trace.

**Передача Builder:** current stable `../SHORTS_TRACE.json` SHA256 `330468ff7eba951f88efb8b4af464f3b772094a67bea9ac62124b0cc3345484a`,44 boundary vertices. Seam/cuff/owner paths не менялись. `../MATERIALS.json` SHA256 `5c03e254dca5e430d978b9fcf4bd713df639375039af25523b442d3239a0c65f`; hip PNG SHA256 `dbc11925677a79a415a6ea1f7d5721d7d9452d1cede4b5ef1c5b0a3af8734a66`.

Материал/trace **дальше не меняю до прогона Builder**. Проверку финального actual trace тем же pipeline выполняет только Builder по поручению Lead, не Asset. Нового материала/repair/solver в этом действии нет. Исторические файлы не затирались; текущие hashes неизменны. Motion/artistic PASS не заявлен.
