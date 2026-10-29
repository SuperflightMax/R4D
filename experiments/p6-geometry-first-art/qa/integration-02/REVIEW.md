# Integration-02: ограниченная сверка actual sphere/shadow adapter

Проверен exact renderer adapter поверх диагностического geometry draft. В этой ограниченной проверке численного расхождения с sprite packet не обнаружено. Полный baseline не повторялся; художественный результат, shadow readability, опора и obstacle/receiver occlusion здесь не принимаются. Сам продукт QA не исправлял.

## Frozen bytes

- Source Builder `38282825c2688e010612e35b6a807e027fb0b90a`, URL `http://127.0.0.1:41767/`.
- 28 files /5260713bytes, независимо совпали public snapshot и live URL. Inventory file SHA-256 `dacd666acd97e8767b6502ff60ec4b456d21c3a1b9b36d170f87b7123e9d787a`; files-list SHA-256 `e3b47613b5b678d38d6da35bfac3af8ca567540f6270dc841ea5686eafd50850`. Exact inventory сохранён в frozen-inventory.json.
- Native bundle не изменился относительно независимо воспроизведённого baseline: SHA-256 `8843446996582eaccbd9ff63d3147d74b7eca9a614d8e0df16851d1d89d46f50`. Controller source hash также прежний; нового полного4984-state прогона не делалось.
- Actual app SHA-256 `119f1ad5e2989315ec095ba82b4d4d9f9263a982c4b3d2e7ecb64308853301e5`. Served artist.json parsed равен exact Git SPRITE_ADAPTER_V01.json; adapter manifest hash `1c30abd43cc96c09480c7f4c031eaef01e13c08344a98fbebc31816cc250e75c`.
- Ball/shadow PNG exact Git source `1adf57cfde5a20855c02a846baa045936e4d5a6d` побайтно равны served textures. Ball SHA-256 `378cc5abe32dc2086bf87c580c31675d06b91b41bbef81065bc5fe786b88542c`; shadow `3a4e58a4d3b9b707e6ec10ffe80e26c561605a4f99d5498c04ae5c684cf5606a`.

## Явная correction packet provenance

Source Git SPRITE_PACKET_V01.json: **5302 bytes, UTF8 LF**, SHA-256 `5ef0efec3633755935fa260a13f0e4e218da16e1479b54c4caee7d3b0d32bb6c`. Эти exact Git bytes independently извлечены и проверены QA.

Фактически использованная input copy: **5521 bytes, рабочая копия с CRLF**, SHA-256 `d23452ebeaa45725175fbc5d915420df0f2c60f13205eeffd3599622069640cb`. Этот другой byte identity сохранён в frozen adapter/build-meta. Lead непосредственно подтвердил равенство после CRLF→LF и равенство parsed JSON; QA проверил source Git bytes и соответствие adapter semantics, не выдавая LF hash за hash использованной input copy.

Направление проверки — actual CRLF-containing copy→LF, не попытка заново создать использованную копию слепой заменой каждого LF на CRLF. Frozen integration/runtime/PNG/старые prompts и logs не изменены; повторная симуляция или генерация из-за EOL не выполнялась. Все новые QA JSON записаны явно LF/UTF8 без BOM. Отдельная correction baseline inventory provenance добавлена в physical-baseline/REVIEW.md вместе с verbatim source bytes.

## Actual IAB states и свойства отрисовки

Прочитаны actual PixiJS properties через render-metrics DOM и native state QA API в IAB. UI seek на паузе: seed0, ticks0/94/95/96/1916/1956. Каждое native state точно равно собственному независимому oracle. Source centre/radius проверены отдельной формулой по accepted P1 matrix, а не по самоотчёту Builder.

| Tick | Радиус сферы в source px | Ошибка центра | Ошибка радиуса |
|---:|---:|---:|---:|
| 0 | 14.0742176996 | 0 | 0 |
| 94 | 14.2785241741 | 0 | 0 |
| 95 | 14.2820095258 | 0 | 0 |
| 96 | 14.2785434147 | 0 | 0 |
| 1916 | 17.6232177779 | 0 | 0 |
| 1956 | 18.2502796657 | 0 | 0 |

- Explicit visualLiftPx0 сохранён во всех шести states, source sprite centre точно P(native x,y). Default lift1 не применился к значению0.
- Raw canvas1254², anchor `[626/1254,636.5/1254]`, opacity1 и uniform X/Y scale соответствуют packet. Радиус проверен как `distance(P(x+r,y),P(x-r,y))/2`, затем через actual scale×428.
- Shadow actual canvas1774×887 сохранён. Mesh scale `[1,1]`, radiusNative `[22,22]`, offset `[-6,10]`, opacity `.42`. Нет принудительного square stretch. Frozen renderer переводит UV через исходный canvas в native ground patch, затем один раз применяет принятую матрицу.
- Первая actual mesh vertex в каждом кадре точно равна Float32 от independently computed single projection. Максимальная погрешность хранения этой вершины в source view около4.90e-5 px. Только первая вершина доступна в DOM metrics; остальные UV mapping проверены по exact frozen source, поэтому полного независимого readback всех mesh vertices не заявляется.
- PNG alpha bounds thresholds1/16/128 независимо измерены Pillow и совпали с packet. AlphaMax shadow231 даёт максимум `.3804705882` при opacity.42. Raw alpha-specks не исправлялись и не подавлялись. Это не оценка художественной читаемости.
- В source/flat, при art-off и geometry-off полный native state/PRNG сохранился. В flat actual sphere centre равен native x,y и actual scale×428 даёт r16 с машинной погрешностью1.78e-15. Поле DOM visibleRadius содержит source radius и не использовалось как flat radius. Shadow первая vertex в flat совпала с Float32 native ground координат; ошибка хранения около.00133 native units.

Полные результаты — adapter-check.json, texture-pixels.json. Выбранные actual IAB screenshots и hashes — screenshots.json. IAB оставлен на seed0/state95/source view. Новых numerical adapter defects в проверенной области не найдено.

## Открытая область

Background — диагностический draft, body/receiver occluders отсутствуют. Сфера поверх нарисованного объёма не доказывает правильное перекрытие. Grounding, свет, видимая высота, opacity/readability тени и цельность остаются за Artist/VQA и будущим assembled candidate. Технические совпадения не превращаются в художественный/motion PASS.

Baseline [P2] live tick input overwriting и отдельное непроверенное кнопочное скачивание остаются в physical-baseline/REVIEW.md. Page.setDownloadBehavior не повторялся и не переносился на другой actor/transport. Final art/полная регистрация будут проверяться по отдельному exact frozen candidate.

Воспроизведение численной проверки: qa/check-texture-alpha.py --runtime OWN_E_RUNTIME и node qa/check-sprite-adapter.mjs OWN_E_RUNTIME, с уже сохранёнными independent inputs и actual browser observations. Browser evidence взят из работающего IAB; графика скриншотов не перерисована кодом.
