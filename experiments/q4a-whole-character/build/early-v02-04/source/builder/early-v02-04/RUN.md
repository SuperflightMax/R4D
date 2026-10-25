# Garment04: новый renderer

После разрешённого старта Lead реализован отдельный entry `app/panels04-main.mjs` и чистая математика `app/panel-transform.mjs`. Сетка02 и mapping03 не импортируются и не используются. Одна Sprite и одна affine/rigid матрица на каждую из трёх garment-панелей; всё изображение объекта преобразуется одинаково. Порядок garment: far → near → waistSeat. Относительно тела02: far z15, near z35, waistSeat z36, остальные body z не меняются.

Из каталога Q4A `npm run dev` открывает текущий garment04 по http://127.0.0.1:4194/. Пока три реальных панели не экспортированы, loader прямо сообщает об отсутствии материала04; старый pelvis не заменяет новый материал. Повторная сборка: `npm run build`, затем обновить страницу. Реальные `art/` сервер читает напрямую.

Технический этап: `node builder/early-v02-04/check-matrices.mjs` — сохранённые 15 поз, точные anchors, determinant, identity и сравнение нового live Motion с frozen02. Проверено: maxBodyPoseDifference 0; минимум det farFlap / down-120 = 0,07228396. Это 7,2284% исходной площади, поэтому объём/подол/поясной шов остаются художественной проверкой. Нового min-area требования не вводим.

После реальных PNG: `node builder/early-v02-04/check-material.mjs` проверяет bytes, crop и binding всех 11 body-частей с frozen02. RGBA source-neutral и seam occlusion — отдельные проверки по материалам Asset, не выводятся из determinant/coverage счётчиков. Пауза, шаг и замедление работают на neutral↔low; dropdown показывает те же сохранённые 15 поз как сравнение. Source-neutral показывает identity-сборку для проверки исходного владения, а не переход из текущей позы.

После содержательного прогона сохранить exact immutable after командой `node builder/early-v02-04/save.mjs`, не перезаписывая папку. До реальных масок эта команда не выполнялась. Адрес будущего снимка — `/early-v02-04/index.html`. До garment PASS тело02/пройма/skin/колено не меняются; full motion/QA/release/Q2A закрыты. Stage/commit Lead.
