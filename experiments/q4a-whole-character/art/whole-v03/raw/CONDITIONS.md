# Raw whole-v03 — условия и происхождение

25 октября 2026. Asset Artist. Старт по прямому сообщению Lead после общего PREGEN в `WHOLE_V03.md`; проверен HEAD `6fe28c5646452917c385f68dccb8d6e92fcca875`, cwd `D:\dev\R4D`.

Выполнен **ровно один** вызов встроенного `image_gen.imagegen`. Точный prompt — `whole-v03-prompt.txt`. `referenced_image_paths` содержал только `art/source/whole-v02.png`, предварительно лично просмотренный; `transparent_background:true`. В prompt v02 явно обозначен только как identity/style reference, с требованием нового полного whole, другой одежды и новой позы. Ни частей, ни atlas, ни старого rig/данных в вызов не передавалось. Реальные model ID/seed инструментом не сообщены; размер1024×1536 указан как пожелание в prompt, не отдельный параметр вызова.

Фактический результат 1024×1536 RGBA скопирован без обработки из:

`C:\Users\user\.codex\generated_images\01a17267-0689-7461-bfb7-2096d42cc29c\exec-7cf681c1-2f49-418a-83fd-9c0ec46ce5c4.png`

в `art/whole-v03/raw/whole-v03.png`. Встроенный оригинал сохранён. SHA256 raw: `e59765185321aa89f6d1246f6b2f53828dc074fcf07b22c05e26efb5d2ff69ff`.

Raw сохранён **до любых производных** и не менялся. Затем `tools/art/whole_v03/source_previews.py` создал только диагностические композиции того же raw на светлом, тёмном и checker-фонах в `previews/`; файл проверяет неизменность raw по SHA256 до/после. Числа каналов/границ — `whole-v03-diagnostics.json`. Не выполнялись очистка alpha, цветовая правка, crop raw, masks/semantic slicing, части, достройка тела, rig/app или генеративная коррекция. Повторного imagegen-вызова нет. Stage/commit — Lead.
