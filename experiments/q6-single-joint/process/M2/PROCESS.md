# M2: один visible-first repair вызов

Input master + точный source atlas + binary white-editable mask + layout; порядок и hashes в ordered-refs.json. Prompt verbatim и actual args сохранены. Маска — reference guidance, потому что отдельного mask API нет. M1 результат не передавался, обе операции получили те же исходные художественные источники и тот же J1 target.

Первичный image_gen вызов1, retries0, ожидание около38.1с по tool. `raw.png` сохранён без изменений, исходник generated_images оставлен. Не найденного image model ID не назначали. `call-ledger.json` фиксирует оба вызова.

`finalize.py` проверяет contract/source hashes, нормализует весь квадрат raw→512 общей LANCZOS операцией, сохраняет normalized и raw-crops. Затем использует точный binary selection: внутри масок RGBA normalized raw, снаружи original RGBA (включая RGB при alpha0). Alpha blending при восстановлении нет. Итоговый atlas composited-atlas.png и crops art/M2 сохранены. J1 и подложки J2 — побайтные копии art/M2. Значения outside-mask final diff0 не означают, что их сохранил генератор.

До восстановления сравнение normalized raw с source показывает71437 изменённых atlas pixels вне масок. Финальный diff0. Удаление ложного торца сопровождалось укорочением бедра и изменением складок; это сохранено без перерисовки или изменения маски. Details/размеры/bboxes/coverage — metrics.json. Выходы остаются с недостатками; сборка/движение Artist не проверялись на этом этапе.
