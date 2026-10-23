# Q5 — конструкция зафиксирована до final art

Lead lead-r4d-q5-gpt61-01, thread 01a16974-8019-7a70-852a-161d2611cbc2. Фиксация 23 октября 2026, после проверки 19:15:12 Europe/Kyiv (16:15:12 UTC) и до первой генерации. Исходная база 412030fd83e6ddfd010811d2c11e0f8ee7af7f45.

Builder сообщил v1 READY в coordination/builder-construction.md. Artist подтвердил конкретную v1 в coordination/artist-freeze-ack.md: прочитал контракт/данные, осмотрел технические PNG и проверил hashes; геометрию менять для арта не просит. Lead прочитал CONSTRUCTION.md и rig.json, визуально осмотрел parts-blueprint и pose-blueprint и независимо сверил все19 файлов SHA256.json: 19 совпадений, 0 расхождений. На этот момент final art/генерации ещё нет.

- construction/v1/rig.json SHA256: `16379c05ef97cd5ec4527c63f09cb166152c74b3b1e5d2d10f73c13eb8f488eb`.
- construction/v1/SHA256.json SHA256: `a8e1b937154e317e1170725165317e2b516691810a6692fbeb9e23031c5f8cd2`.
- construction/v1/parts-clean.png SHA256: `85b29b2b353f4c0e90279501e2e738975418cdf50061a7a06c7a4c5fa3cef874`.

Достаточная основа сохранена: устройство и joints/parenting, точные pivot/canvas/placement/shapes всех12 PNG, числовые layers, перекрытия/запасы, локальные оси и подошва, исходные/крайние позы и реальные samples idle/low/locomotion/jump/mid-transition общего spring/IK механизма. Материалы и характер ещё не определяют конструкцию задним числом.

Artist разрешён следующий шаг немедленно: выбрать один художественный образ и генерировать appearance/details под эти геометрические входы. Предложенные7 уникальных форм с повторным использованием для одинаковых near/far допустимы: итог остаётся одним полным персонажем с12 записями. Сохранять prompt/tool/reference/results и part→construction соответствие. Первый реальный стык совместно соединить с движением Builder до полного кандидата.

construction/v1/ больше не редактировать. Любое изменение конструкции вслед за генерацией сохраняется отдельно before/after и с причиной в CONSTRUCTION_CHANGES.md; неизменность скелета не означает автоматически точное соблюдение формы текстурами. Различия покрытия/силуэта также раскрывать в ASSET_PROCESS.md. Один look и один pass; это не разрешение исправительного цикла. После q5-c1 freeze коррекции только отдельно CTO, Q6 запрещён.
