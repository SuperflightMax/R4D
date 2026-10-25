# Whole-v04 — условия и provenance

25 октября 2026. Asset `asset-artist-r4d-q4a-01`, cwd `D:\dev\R4D`, host local. HEAD `5aa3b2d05713759cbd0c4c1f0e7791a948e2f560`; опубликованный P и отдельный старт G Lead. Checkout не переключался.

Встроенный `image_gen.imagegen`, **ровно один успешный вызов**, `transparent_background: true`. Точный prompt сохранён в `whole-v04-prompt.txt`. Это новый complete whole, не edit отдельных конечностей и не parts sheet. Дополнительных вызовов не было.

Ровно два local references, в порядке отправки:

1. `D:\dev\R4D\experiments\q4a-whole-character\art\whole-v03\raw\whole-v03-correction02.png`, SHA256 `ed40c54d4e916383c00b2002292ea7aec281d2e3162df0a14955b163f5c11e4a`: только identity/face/age/palette/fitted mid-thigh garment/art style; прежняя поза не назначена образцом.
2. `D:\dev\R4D\experiments\q4a-whole-character\builder\whole-v04\pose-guide.png`, SHA256 `6288eecc6d28d73b1750d07db97d056e21b708ad019bb6f3d62fb8fbd657b47e`: только цельная поза/negative gaps, не будущие маски/части. Guide frozen и не менялся.

Возвращённый оригинал: `C:\Users\user\.codex\generated_images\01a17267-0689-7461-bfb7-2096d42cc29c\exec-5a823f37-258e-4b15-9ae8-f99943ad241c.png`. Первым сохранён побайтовой копией в `whole-v04.png`, до производных. SHA256 обоих файлов совпал: `56947ae376af812075e42f23d2c874ef1c9f30de6f51718700f4376cfae38bb3`. Размер1024×1536, RGBA, alpha0–254. ID модели генерации/seed инструмент не сообщил. Размер в prompt — пожелание, не отдельный параметр API.

После raw сохранены prompt и эти условия; выполнены только диагностические alpha-composite тем же raw на light `(245,245,240)`, dark `(30,34,40)` и checker40px: `../previews/whole-v04-{light,dark,checker}.png`. Скрипт `tools/art/whole_v04/source_previews.py` не меняет raw и проверяет его SHA256; alpha/предварительные sole numbers — в `whole-v04-diagnostics.json`. Семантические маски/части не изготовлены. Окончательная read-only alpha gap/sole проверка принадлежит Builder.

Alpha0:1166405 px; alpha1–15:26562; alpha16–239:11954; alpha≥240:367943. Коричневые hidden RGB в raw viewer на трёх реальных композициях не образуют сплошной фон. Слабая периферийная alpha и край сохранены, очистка не выполнялась.

Личный source review — `../SOURCE_REVIEW.md`. Предыдущие источники/guide/evidence не менялись. Новых app/build/rig/motion нет. Stage/commit/push — Lead.
