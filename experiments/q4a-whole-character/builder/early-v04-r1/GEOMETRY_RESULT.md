# R1 — первый наблюдаемый результат: full-chain feasibility

25 октября 2026. Builder. Источник/новые joint centres согласованы Asset в `R1_INTERFACE_ACK.md`; source geometry/длины/alpha support сохранены до первого прогона в `SOURCE_GEOMETRY.json`. Это **техническая достижимость скелета, не художественный gate и не cage PASS**.

Полный low230/back110 достижим по обеим исходным длинам. В121 равномерном состоянии neutral→low максимальная ошибка thigh/shin lengths **2,2737367544323206e−13 px**, support error плотного alpha contour обеих обувей **0 px**, проникновение ниже общей floor1470 **0 px**. Scale/stretch нет, body transforms — rotation+translation, determinant1.

Near исходные длины258,6832/415,9868px; far265,6483/404,0421px. Neutral near knee=(416,979), far knee=(656,9978;978,1470); far ankle=(699,1380), получен через общую опору и полную IK цепь, **не отдельным сдвигом shoe**. Сравнение с исходным far knee(670,972)/ankle(699,1375) явно сохранено. Near chain в neutral совпадает с source.

Endpoint pelvis=(395,960) из(505,730), drop230/back110; near knee internal73,4859°, thigh30,4428° к горизонтали; far knee internal91,4647°, thigh2,3751°. Длина/опора сохранены на всём переходе и обратно тем же законом. Полноценный диапазон не урезан.

`GEOMETRY_FEASIBILITY.png/.svg` показывает оба полных leg chains и реальные dense lower contours обуви в neutral/low. `GEOMETRY_FEASIBILITY.json` хранит все121 состояния и ошибки; `check-geometry.mjs` воспроизводит проверку. Dense support извлечён read-only по raw при alpha≥128 в раздельных source windows, alpha0 RGB/alpha1 noise опорой не объявляются. Когда Asset передаст source-derived shoe PNG, support повторно сверяется по ним без изменения длин/диапазона. Макс. нижний контакт — технический минимум, не независимый художественный PASS формы стоп/стойки.

Материалы/repair/cage geometry ещё в работе Asset/Builder; их отсутствие не замещено заглушками. Следующий шаг — согласованные actual garment contours/rest cage и один solve с контролем orientation/distortion. Exact rendered after и художественные MOTION_REVIEW пока отсутствуют. Никакого общего PASS.
