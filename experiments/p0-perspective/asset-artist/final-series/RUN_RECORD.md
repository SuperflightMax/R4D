# P0 final series — полный журнал invocations

Дата производства: 25–26 октября 2026 года. Роль: `asset-artist-r4d-p0-perspective-01`.

## Общие факты выполнения

- Инструмент: built-in `image_gen`; CLI/API fallback не использовался.
- Для новых plate/master каждой доски передавались только два общих входа из `SERIES_INPUTS.md`: Image 1 — единственный formal geometry/camera control; Image 2 — art-quality reference only.
- Plate выполнялись с `transparent_background=false`, master — с `transparent_background=true`.
- F1/F3 correction использовали только непосредственно предшествующий plate этой же доски как edit target через `num_last_images_to_include=1`; другие boards, L1 и composite не передавались.
- Все outputs фактически получены в `1254 × 1254`; plate затем единообразно full-frame resized до `1536 × 1536` без crop/axis warp.
- Built-in интерфейс не раскрыл model, seed, sampler, steps, CFG, quality или числовой size preset. Эти значения не выдумывались.
- Tool-level failures не было. Три визуально непригодных/заблокированных plate состояния сохранены как evidence; незаписанных reroll/отборов нет.

## F1 — «Воздушная астролябия»

1. Plate v1: exact prompt `board-01/prompts/plate-v1.txt`; output id `exec-88092648-e6c6-4c48-9c23-3a3c79c81179`; raw `plate-v1-rejected-markers.png`; SHA-256 `dbd1f1c7fa65d04bcb6f9b62003be33d8cfa41a8e79aa35b95f770f1469fc6a0`.
   - Дефект: центральная золотая линия, ромбы, кольца и большие круговые орнаменты читались как control/anchor markers.
   - Основание correction: убрать только floor markers, сохранив camera/architecture/light.
2. Plate v2 correction: exact prompt `board-01/prompts/plate-correction-v2.txt`; edit target — только plate v1; output id `exec-7a4fbf23-54ae-423d-87b1-8c1c800940ba`; raw `plate-v2-source.png`; SHA-256 `1b0d995d786c4e1c8c0e1e56ba7c4665209cdb812331bbd9a02d66cf61686021`. Был принят Asset, затем frozen QA `91b11a2…` заблокировал его: сильная baked diagonal shadow пересекала frozen anchor `(p=.62,q=.453)`, тогда как master оставался direct-lit. Те же bytes сохранены как `plate-v2-qa-failure-baked-shadow.png`.
3. Master v1: exact prompt `board-01/prompts/master-v1.txt`; output id `exec-e72648b5-5225-4391-82fb-47da69e56944`; raw `master-v1-source.png`; SHA-256 `168c742ca23579cf385473b29de37f23cd3e7f8a27a2aa288d40975bc22118be`. Принят.
4. Plate v3 QA lighting correction: exact prompt `board-01/prompts/plate-qa-lighting-correction-v3.txt`; edit target — только plate v2; output id `exec-5e198487-beef-4760-b45d-03a2d7b9e041`; raw `plate-v3-source.png`; SHA-256 `13324c45a91469aa0148ad32e02fe939d2ff504b028f311d3607a776e7637260`. Единственная разрешённая invocation: сильная тень удалена со всех frozen anchor zones, камера/архитектура/тема визуально сохранены; второго reroll не было.

Prepared hashes: corrected plate `221a351ed7acebdec03cad4395ac0e04690e6b1c186de59778e1bff8f8efe10a`; unchanged master `868237ecbab76c7ffe0789d6ea98b80cbc4bd8ce8dd2d26394145192c7d0531f`; unchanged shadow `3c0d7d5ca026f4411073a4d23f6f630b8556624ed99d3fcb360cbc26fa2266b1`. Anchor `(523,1145)`.

## F2 — «Сад ступенчатого святилища»

1. Plate v1: exact prompt `board-02/prompts/plate-v1.txt`; output id `exec-7d1165d1-4f75-4b2e-831b-7e792255c472`; raw SHA-256 `3c8a71d09bf5e33b6ab236aafab5a78309781a14b45f76c665b7dfcd11c250b2`. Принят без correction: поле пустое и непрерывное.
2. Master v1: exact prompt `board-02/prompts/master-v1.txt`; output id `exec-92afae22-7a7c-4365-968b-157af11137ce`; raw SHA-256 `b5211452bb8cb3b0e06ddc8aaaaceaeb2e68d21f26a3638783ab774a2f7372e7`. Принят.

Prepared hashes: plate `d547aa14de2c7b28eb5b2d3fb562e519cec4c98f7e781fb67e14cd73ddce84ad`; master `9c8cc9d8ce75d181c120bee7b3dd1ce0cfe68509526a004814f169681edf0a7f`; shadow `59a3edb86d5cee16311aeffc745bf1d34822bb79dc711a9e66699ab46c854fc4`. Anchor `(451,1022)`.

## F3 — «Цитадель янтарных печей»

1. Plate v1: exact prompt `board-03/prompts/plate-v1.txt`; output id `exec-f17bb89b-b079-458d-ab7a-7607aa3947c6`; raw `plate-v1-rejected-chutes.png`; SHA-256 `716248b2307ef2e3812172b46fbd4f754dd1531eef1c3321c8b05104178c09d6`.
   - Дефект: три raised furnace chutes выступали за far seam на playable plane и читались как препятствия.
   - Основание correction: убрать только три выступа до seam и восстановить непрерывный пол.
2. Plate v2 correction: exact prompt `board-03/prompts/plate-correction-v2.txt`; edit target — только plate v1; output id `exec-055cf64e-161c-4743-9e20-922e073ae31d`; raw SHA-256 `a0e1a67c17f889db8f436267a34acbdaf51510cfd79b504f9bdd1029595e8045`. Принят.
3. Master v1: exact prompt `board-03/prompts/master-v1.txt`; output id `exec-d21d6d09-81a5-4e4d-b6bd-6d4762c1b118`; raw SHA-256 `d800fa517c024e8fb683088d3a5f59b36f3fa6b59e21712bb071a9c2b1ef4f78`. Принят.

Prepared hashes: plate `282ce3638de251e053f23c915c53f9a8311cf2ce16c08d6e06e36747c88f83c0`; master `8f5924dd559aca2acdf85a8fc04a03e367a7fa9a247763520debc109a0e09dc4`; shadow `6341a145b156ee5abd27352f797c701671ad28699749c2098f09b822ceb2cb55`. Anchor `(475,1126)`.

## F4 — «Жемчужный приливный двор»

1. Plate v1: exact prompt `board-04/prompts/plate-v1.txt`; output id `exec-8807bc5b-ad53-4599-af6c-9c1ff33692e2`; raw SHA-256 `1ee9cdd9ddbd5bcf2492ea86b53faa34dca4267291f17064fd04ea83b3a8b3c0`. Принят без correction: сухое непрерывное поле без воды/markers.
2. Master v1: exact prompt `board-04/prompts/master-v1.txt`; output id `exec-26d4d7a4-626f-4743-a591-6278c1d90ad3`; raw SHA-256 `6876628f333ca82e7baa51543b9fa4fef1e9c7f6754cc11325dc7b4783d0900a`. Принят.

Prepared hashes: plate `468375d6ffcd02f36eddbb62a4e617a97837a161377cdefc88c3f7f2d2f5b907`; master `bf205ec8584df2e138a2facf45f4d1a08e717af0cd26eabd2b36c44c637b1514`; shadow `233673dc1e143af74f8fe9ad543fe4ec25823ec798deb8161ef8d6d62195bebf`. Anchor `(451,1074)`.

## Детерминированная подготовка

Для каждого raw master применены одинаковые правила: alpha `<8 → 0`, alpha `≥240 → 255`, промежуточный антиалиас сохраняется; bounds считаются при alpha `≥8`, добавляется `64 px` padding. Raw не изменяются. Shadow строится на canvas master с тем же anchor; её тон и right/down offset принадлежат конкретной доске. Полные crop/size/alpha/hashes находятся в каждом `prepared/component-metadata.json` и `component-validation.json`.

Ни один board composite, family copy или global redraw не создавался.
