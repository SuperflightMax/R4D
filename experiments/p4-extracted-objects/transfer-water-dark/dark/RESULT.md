# P4 Dark — результат исходного переноса

30 октября 2026. **PARTIAL: способ P4 повторён на тёмной доске в проверенных случаях.** Полный комплект собран в живом native/Pixi consumer; независимый VQA дал scoped visual PASS без подтверждённого блокирующего Art FAIL. Полного Dark Art PASS нет: receiver-02/03/04 не наблюдались в сохранённых траекториях. TQA оставил P3-ограничение непрерывности бокового перекрытия. Это результат исходного метода, без per-face depth/height варианта.

## Зафиксированный опыт

Полный immutable target — `dark-full-original-p4-candidate-01`, artifact SHA256 **`6dd25ecd75b5ade5fb67f8bb4d06dbddd2efc15676168b713ab951729a82eecf`**, payload root **`281cd26408c36d6fb84e77093b808f0df2eb6115e1636ecac5ecb9bf6a49b00e`**. В payload 218 файлов; artifact/FROZEN дают 220 всего. Local root: `E:/R4D/perspective/p4-runtime/builder/transfer-water-dark/dark/candidates/dark-full-original-p4-candidate-01`, preview [loopback 4399](http://127.0.0.1:4399/), проверенный владелец при handoff PID 38840. Перед последующим использованием owner проверяется заново.

Artist **`05ba43101a95fc1efcda5395d1394c27cb887f09`**, manifest **`d71bf97b07fb2571aa3ea0298900270775ae939b270753d3bfbe22097104a716`**. Извлечены 24 floor objects — по 6 bowl-base, skull-base, pillar и block — и 4 receiver: 28 объектов,60 object parts + 6 scene parts,69 runtime PNG. Ближняя платформа, guards и 3 divider имеют отдельные части. Намеренного baked body/old-shadow remainder нет; far architecture остаётся environment. Пятнистость восстановленного мрамора сохранена в evidence; явные оставшиеся тела или резкие прямоугольные швы VQA не подтвердил.

Builder source **`ed62bae3f81d227494478c82b2279b5badcf715d` LOCAL_HELD**; app **`96ddc0443f311dd46f7f07b287171118608a583f0fd26416dbaa18ad8c8e84d0`** включает отдельно исправленный ввод точного тика. Native bundle **`8843446996582eaccbd9ff63d3147d74b7eca9a614d8e0df16851d1d89d46f50`** переиспользован без пересборки.

## Что переносилось и что пришлось довести

Сохранён рецепт P4: видимые RGB исходного JPG, alpha/контуры/GrabCut, локальное восстановление скрытого мрамора, отдельные оценочные ground shadows, раздельные receiver rear/front и fixed scene parts. В 38 видимых body/rear/front/scene частях RGB при любом ненулевом alpha точно совпал с source. Чёрные внутренности bowl/skull сохранены непрозрачными; это 12 препятствий, не четыре приёмника. Restored-floor mask описывает происхождение пикселей и не применяется как невидимый gameplay clip.

Локальная подготовка потребовала удаления оставшихся светлых верхушек из repair plate и уточнения выступов боковых стен. Эти WIP-проходы сохранены. Золотой body шара переиспользован из собственного Jungle. Его olive shadow на тёмном полу осветлял отдельные пиксели; baseline оставлен, для Dark изготовлена новая neutral-black alpha texture **`f9a91c40b75c08e94f91d0948872050bb3d9bc56a3753cfc99ba21a0d9295887`**. Offset[-.95,.86]R, half-size[1.55,.58]R, opacity.65 и физический r16 не менялись. Это доводка материала тем же способом; VQA увидел мягкую затемняющую тень в обычном масштабе.

Приняты только Dark 02/trial-01 и P1 **`4b47db04c7140ebf88f69b91faa0b790d46f22ec`**. Config SHA **`14be2a023833d266d1e333bf582af5fd5885deb445698c10ebd846ef0cc080b2`**, manifest **`3fab422bd1f74d477d1648620c97ad6d7b8b0a55a70a1102d6e6885def564d81`**, source **`7ceff71bd0a871fecd725527dff5522450c8e75a74eb99c107b5d8624bf8fa3a`**. Его H/inverse/translation/anchors не заменялись числами Water/Jungle. Native core 5a6fa03, r16/tick5ms/quantize7/drop/geometry/noise/PRNG неизменны. Тела сортируются прежним nativeY; новой геометрии высоты нет.

## Наблюдённые случаи и границы

- Corner pillar-02, seed2, event 367→state 368: реальное частичное скрытие на 366–369.
- Front pillar-02, seed2,972→973: шар перед телом. Potential alpha overlap не выдан за фактическое скрытие.
- Side pillar-04, seed0,840→841: partial на 839–841. На 842 grouped nativeY выводит шар вперёд при оставшемся potential overlap ≈2.17%: **TQA-DARK-01-01/P3 OPEN**. VQA не увидел заметного скачка в normal 574²; увеличенный переход и ограничение сохранены.
- Outer guards и near-platform дают реальные alpha-overlaps; block-02 ordinary corner 891 полностью скрывает шар и не считается partial proof.
- Receiver-01: seed0/888 и seed 1/884 — capture с полностью видимым шаром в black cavity. Штатный receiver-back находится позади ball; предупреждение статического Artist helper о полном скрытии в Pixi не воспроизвелось.
- Отдельный seed 2/LOST 1812 даёт настоящий partial front-rim01 на 1746–1748. Это не capture того же run. После 1782 front overlap прекращается, но шар закрывает near-platform; полная видимость не выдумывалась.

Receiver-02/03/04 approach/capture/front-rim остаются UNOBSERVED в просмотренных обычных 0/1/2; это не доказательство физической невозможности. Все исходы, включая supplied ordinary LOST 2323/2011, сохранены. Новых удобных поз, seed hunt или sinking после native end нет. Файл с подготовительной ошибкой +N4000/ACTIVE73 не выдан за конечный исход.

## Независимая приёмка и воспроизведение

Обе QA проверили **один 6dd25ecd…**: [TQA acef8610](https://github.com/SuperflightMax/R4D/blob/acef8610f1516da120084a5a7f5f4d687ddb7b07/experiments/p4-extracted-objects/transfer-water-dark/dark/qa/technical/FULL_01_REVIEW.md) — 94 exact observations по собственному cached native reference и 6 отдельно supplied-only; [VQA 436af24](https://github.com/SuperflightMax/R4D/blob/436af24f6919bc0e32f22ee127d48547d9d61cec/experiments/p4-extracted-objects/transfer-water-dark/dark/qa/visual/FULL_ORIGINAL_01.md) — scoped visual PASS, 84 paused captures. Все 218 disk/HTTP hashes/roots совпали. Raw DOM JSON читался текстом, полная precision/PRNG/ordered events сохранены; управление, same-file import и wrong-board guard пройдены.

Воспроизведение: source whole view 1280×720, DPR 1, board 574², zoom 1/noFollow, Art ON/Geometry OFF; seed 2→368/973/1747 и seed 0→841/842/888, соседние +1 ticks и Parts ON/OFF. Крупные кадры дополняют whole-view. Worker-response hash и строгая shadow-радиометрия по lossy JPEG остаются UNVERIFIED; unsupported API не повторялся.

Release завершил LOCAL Stage A, local metadata commit `ee38531cd25a5e68b0223a58a97bcd01dc21d203`. Пакет в `E:/R4D/perspective/p4-runtime/release-engineer/transfer-water-dark/dark/local-stage-a-v01`: 87 файлов / 9 226 691 bytes, subset root `96f9b67554b853b91846a80cfefa2ba92893d2ed9c14e5b31b26c54059228176`. Tar SHA `57b0a9d383b46999b0a3a197e8989ea86db0b12c8a9fe5fdb716278005e91396`, seal SHA `ae617322678d90d03306c22cae90d36907e079ce8e85d6bbab5712afcaa0ce60`. Lead отдельно сверил все87 файлов/размеры и SHA manifest/tar/seal. Source freeze не менялся. Runtime closure включает79 исходных файлов, JPG fallback и69PNG; восемь license notices сохранены отдельно. Недостающий MIT notice @pixi/colord2.9.6 подтверждён точным upstream gitHead/package bytes и включён до seal.

Публикации transfer пока нет: tokenGranted=false. В HANDOFF/DEPLOYMENT_PROPOSAL подготовлен новый sibling prefix `/review/r4d/p4-dark-extracted-objects/`; это предложение, не назначенный namespace или grant. Нужны свежий конкретный CTO token, текущий protected-access contract и disposition двух неизменённых source-path полей в JSON. Protected Review/server reads/writes —0; StageB/C не начаты. Builder source/ancestry не доставлены в Git; старый Jungle RESULT/frozen/public сохранены. Исследовательские затраты и общая хронология обеих досок учитываются вместе в Lead STATE; этот результат не объявляет весь transfer завершённым.
