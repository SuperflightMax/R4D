# P5 — первый материальный checkpoint c01

Наблюдение Lead: 2026-10-28 23:02 UTC / 29 октября Europe/Kyiv. Это ранний результат и первый независимый отзыв, не завершение P5, не QA PASS и не release gate. Наблюдаемое окно после первых отправок 22:19–23:02 UTC не выдаётся за измеренное активное время моделей.

## Реальный результат

Заново generated floor, четыре семейства препятствий, ball/shadow и receiver back/front реально загружены в собственный PixiJS8.17.1 + неизменённый Millionko. Coverage: 4/25 pins,1/4 receivers,10textures/13instances. Недостающие colliders сохранены, неполнота явно показана. Source/native anchors не изменены; XY warp/подгонки траектории нет. Mini01/c01 остаются неизменными для независимых QA.

| Источник/артефакт | Exact pin |
|---|---|
| Пять initial send receipts, новые Stage2 turns | DISPATCH.json в этой папке, commit a1ca011; все пять actual calls success, по одной первоначальной передаче каждому существующему специалисту |
| Consumer | 0c611039246904443128b9d12084af2c5a0ae6e6:experiments/p5-regenerated-objects/builder/ |
| Handoff | a259c8bcbf4f3b242a1f2001f06d14a0e89a6d4d:experiments/p5-regenerated-objects/builder/HANDOFF_C01.md |
| Artist mini01 | 5085be86d5b5e9bf22619254f42b95ad3dc1320e:experiments/p5-regenerated-objects/asset-artist/asset-manifest.mini-01.json;23553bytes;SHA2567b8935f4db6f9c20ec6fc2867e115dd787a2a93982f5ef4a5588810d8470e77f |
| Frozen public root | E:/R4D/perspective/p5-runtime/builder/output/previews/c01/public;22files/13937155bytes |
| Inventory | .../output/previews/c01/index.json;7149bytes;SHA256a19fea2f7ce677f9fa24c5822e0c411a032bd79fda58c055ff8e386ec474f4ac |
| app.js | 569494bytes;SHA25639d0cc5cdc8e869df975f008057c3c408ed3e41ce40bdd870dd0f001f19f1f44 |
| Staged render manifest | assets/manifest.json;15630bytes;SHA25696305bca8706f22a0cad0537599a30a5ef9ae75bc49d998da5ccc573e55da7b5 |
| Replay index | E:/R4D/perspective/p5-runtime/builder/evidence/c01-replays/index.json;5430bytes;SHA256aca3ca025c5aee9a0fdf7069035ce376207029c38b99f48f0611e650b7a93c4b |
| Browser evidence index | E:/R4D/perspective/p5-runtime/builder/evidence/c01-browser/index.json;1903bytes;SHA2561efa516bc89ffc87ca86d8fb64c16f022b334c7b578a5ade578bd94da3db8a02 |

Preview http://127.0.0.1:55185/, own Builder PID32108/session55195, exact frozen root выше. TQA/VQA используют свои отдельные вкладки. Builder сохраняет listener и root до окончания проверки. Старый own PID22076 штатно остановлен после ownership/port проверки; его exit1 не сопровождался denial/runtime-error текстом. Чужие PID не менялись.

Native/P1/JPG/dep pins перечислены в inventory/handoff и исходной рабочей карточке. Native trace seed0 совпал с независимым oracle. Первый обычный UI seed1696420279 сохранён без отбора: present flower07 contact event834 -> states834/835/836, receiver01 states874/875. Seed0 terminal receiver03/tick1956 остаётся сохранённым, но art03 отсутствует; present frog05 contact1715 -> states1715/1716/1717.

## Первый независимый отзыв

После fresh idle/no-duplicate проверки обе QA получили один exact c01:

- TQA turn01a184ba-6c36-7253-9f2f-214e03ef0d8b: actual отдельная вкладка загрузилась, начаты независимые file/runtime/control/motion проверки. Source oracle4e989bec повторно не заменяет их.
- VQA turn01a184ba-ebaa-7830-a006-9c33bb88cd05, первое содержательное наблюдение msg_0abc09b117681dfb016ae27e7e086c8191bd8d7ff4bd24fea4: четыре семейства узнаваемы и по материалам близки Jungle; на seed1696420279/tick875 sphere читается на дальнем ободе при nativeIN_BUCKET. Причина ещё исследуется по соседним кадрам и регистрации частей. Это actual наблюдение, не окончательная классификация причины или художественный PASS.

Для воспроизводимого первого случая Builder кадр E:/R4D/perspective/p5-runtime/builder/evidence/mini01-seed1696420279-state875-art.png:118401bytes,SHA25628d2c4ce53c75e682fe8f6089a400c969ce152f1ba15107b25c4e92b954d43c8; frame835-art.png:147411bytes,SHA256ce74b1809e7f1450e1f14a6d4b827710990730db9f4fd84f8cf34f158071e980. Показаны inline через view_image; это вспомогательные Builder кадры, независимые VQA captures/report будут закреплены отдельно.

## Следующие полезные действия

1. TQA/VQA завершают actual c01 проверку; Lead собирает связанные findings, не чинит и не выдаёт свой просмотр за QA.
2. Artist продолжает новую версию far variants/оставшихся21pins/3receivers; исходные первые masters не размножаются автоматически на дальние targets. Новая подготовка отдельно от immutable mini01.
3. Две native-edit попытки foreground не сохранили регистрацию. Принята адресная техническая коррекция: явно объявленный source-region scene clipping из того же generated floor, с сохранением пикселей/координат. Artist задаёт область и provenance, Builder минимально расширяет consumer; весь clip принадлежит art tree, Art off его отключает, Geometry остаётся выше. Качество перекрытий проверяется actual QA следующего candidate. Original JPG как готовый слой не используется.
4. Builder независимо закрывает @pixi/colord2.9.6 license packaging gap для следующего package по точному официальному источнику. c01 этим задним числом не меняется.

Пересмотр оценки: ранняя связка generation/native/Pixi работает; есть конкретное зрительное несоответствие receiver и известный незавершённый объём. Основания менять метод/состав/увеличивать бюджет сейчас нет. Ориентир8–12активных часов сохраняется, следующий результат — fullcoverage/new candidate с полезными коррекциями и адресной независимой QA. Бюджет не autoPASS и не механический cutoff.

Fresh QA guards: TQA ожидает до1GiB RAM/0.1GiB E, VQA до2GiB RAM/0.2GiB E; последний VQA free15.89GiB RAM/E12.13GiB,CPU3%. Их own estimates и concurrent allowance4GiB RAM/2GiB E сохранены. Global env/settings/models/host/credentials и чужие устройства/worktree не менялись. Новых chats/roles/worktree/subagents/P6 не создано. Production/release server writes0; frozen final+обе QA+новый exact CTO review/single-use token ещё впереди.
