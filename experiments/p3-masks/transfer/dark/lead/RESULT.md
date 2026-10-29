# P3 Dark — ограниченный результат переноса

29 октября2026. **Targeted Technical PASS, D-POP-01 локально закрыт.**
Общая художественная оценка — PARTIAL: положительный адресный retest с явными
пределами покрытия и теней. Общий Visual PASS всех60 масок/всех подходов не дан.
Ограниченный результат опубликован одним согласованным Release V3 с Water.

## LIVE Review и фактическая публикационная проверка

**[Открыть Dark Review](https://superflight.space/review/r4d/p3-masks-dark/)**.
Switch2026-10-29T16:40:46.555575Z, postchecks16:41:37.142460Z,
append-only documentation16:42:54.288935Z. Frozen source/art/manifest ниже
опубликованы точно, без нового native build/полной QA матрицы.

Combined217 HTTP:215×200,Origin403,dotfile404;197/197 payload identities
и10/10 JS MIME/body verified. Currentcatalog200 совпал с exact new15762/SHAfd4e28b8…2beeb.
Newroot868files/104dirs/meta71419d91…c9f65; старый root/foreignbytes/metadata,
mixed ownership и77Jungle сохранены. Для двух docs append-only prefix SHA
и inode/uid/gid/mode доказаны отдельно.

[Lead public IAB smoke](../../water/lead/PUBLIC_UI_SMOKE.md): фактический Dark
canvas60/source d7ea загрузился; seed0 tick0→10/.050s, controls согласованы.
Это текущий bounded public UI proof в конкретном контексте, не универсальная
auth/security приёмка и не полная новая visual/native QA. Итог PARTIAL,
coverage/shadow limits прежние. Token/window/slot закрывает только CTO после
финального delivery review; историческая auth303 terminology не current claim.

## Точный результат

| Поле | Значение |
|---|---|
| Candidate | dark-receiver-front-edge-04 |
| SOURCE | d7eac5d7d76127e3138480f1f16eaf28aac0f15a |
| ART | e5d3e1f44c112e483ff2a23fbd169cb119390865 |
| ART variant | receiver-front-edge-01 |
| Manifest SHA256 | d180e5a63bb1dec7c510507fc2ce990e7cb10927b337a19c4bb9effc67e4ed1b |
| Объём | 92payload/3494340 bytes + manifest15737; всего93 files/3510077 bytes |
| Bundle | E:\R4D\perspective\p3-runtime\builder\transfer-water-dark\dark\receiver-front-edge-04 |

Exact P1 board02/trial01/candidate01, native5a6fa03 и исходный JPG закреплены
в [BASELINE](BASELINE.md) и [Targeted TQA](../technical-qa/targeted-receiver-front04/REPORT.md).
Исходный метод — Jungle frozen CODEf1aca21/ARTf899; его прежние ограничения
не объявляются PASS переноса. Dark проверен отдельно от Water.

## Применённый рецепт

1. Сохранить целый исходный JPG1536² и exact accepted P1/native coordinates,
   loops/translation/domains, r16/5ms и штатный RNG.
2. Описать60 source-aligned whiteRGB/alpha crop масок для чаш/черепов,
   косых блоков/граней, колонн, бортов и частей приёмников. Восстанавливать
   пиксели того же JPG поверх отдельных проходов сферы и тени.
3. Использовать собственные отдельные PNG шара и shadow базового P3.
   Dark shadow alpha0.93, offsetRadius[-0.45,0.5], scaleRadius[1.15,2.6];
   projected r16/lift0.65 прежние. Geometry располагается выше Art,
   view/zoom/pan/Art/Geometry сохраняют native checkpoint.
4. Для каждого из4 приёмников выбрать в сохранённом front-полигоне ребро
   с max mean nativeY после accepted sourceToNative. Это нижнее опорное
   ребро11→12; назначить его общую depthLineNative трём частям приёмника.
   Заменены12 линий; остальные48 records и все62 PNG точны относительно17dc.
5. Оставить прежний scalar/line renderer/depthAt/clamp. Thin build selector
   выбирает ART variant; native compiled bytes переиспользуются.14 shipped
   checkpoints скопированы из точных ранее проверенных sources с provenance.
   Packaging не выполняет новую native-компиляцию/полную матрицу.
6. После freeze проверить точные bytes, обычный D-POP replay и соседние кадры
   старого/нового порога при100%/200%, затем близкие уже хорошие входы.
   Подробный повтор — [Builder RECIPE](../builder/RECIPE.md).

Исходный FULL03 SOURCEc73/ART17dc, manifestb3923f4c…d0307 сохранён в
Builder dark/full-method-03 с воспроизводимым историческим FAIL. Коррекция
не меняет PNG, траекторию или радиус и не содержит seed/tick-specific поведения.

## Доказательства и исправление

[Основная TQA03 b327ae601a4962dd5826abfbfdeefaf77c090a55](../technical-qa/reports/dark-full-method-03.md)
**ранее выполнена**:11793 полных native states/ordered hits,66browser samples,
JSON/controls/negative/import/replay. Она не выдаётся за заново выполненную04.

[Новая targeted TQA18e880e117f30747c4d938b1f94cf3622f20fdc0](../technical-qa/targeted-receiver-front04/REPORT.md):
93local/HTTP files/MIME/allowlist exact;14 copied CP provenance;12 lines/
48 records/62 PNG/12 common runtime-input files проверены. Независимая
деривация по4 front-полигонам совпала с max error 0. Проверены25 selected states четырёх
seeds и68browser samples совпали с direct cached oracle; actual2012 download
побайтно равен VQA03. Native build/полная прежняя матрица не повторялись.

[Новая Visual QAbc34a864bc44cba231d466daa46bdc7b02651845](../visual-qa/receiver-front-edge-04/REPORT.md)
полностью прочитана Lead; actual A/B монтаж лично просмотрен. Старый03 резко
раскрывает шар на2011→2012. На04 при том же state/камере2012 остаётся partial,
2013–2018 дают постепенный выход из силуэта. Normal Play,100%/200% и все
соседние2010–2019 проверены;43paired paused states/controls/camera совпали.
Это основание локальной closure D-POP-01, а не только перенос номера threshold.

В новом окне2044–2047 sphere находится справа вне JPG; на каждом одинаковом
тике old/new decoded RGB crop шара/тени совпадает точно. Раздельный source
predicate shadowOFF2045/ballOFF2046 описывает механизм, не GPU-измерение.
Тень читается на увеличенном crop, слабый край в обычном масштабе ограничен
тёмным фоном. Универсальное качество теней этим не подтверждено.

Good entries01/seed0/888,02/seed1551806092/971,03/seed3238915631/1435 и
receiver04-side1960/1980/1995/2005 не показали существенной новой регрессии.
WIN заканчиваются до передних фасадов и не сертифицируют все rims. В11entry
crop есть малые RGB-различия до14/255, также на статических частях кромок;
причина не доказана, попиксельная идентичность good entries не заявляется.
Визуально существенного нарушения в сохранённых кадрах не установлено.

VQA сохранила157raw/105fullJPEG/4montages/5actualdownloads, TQA —34selectedJPEG/
8CP и145raw-index. Старые reports/raw/frozen сохранены. Все own QA tabs закрыты.

## Решение Lead и практический вывод

Принять локальное закрытие D-POP-01 на exact dark-receiver-front-edge-04
в проверенном seed/окне. Исторический FAIL03 сохраняется. Ограниченный Dark
результат завершён: техническая проверка положительна, адресный visual retest
положителен, общая художественная оценка PARTIAL с неполным покрытием подходов.

Базовый рецепт перенёсся через60 контуров и привязку depth. Верхняя внутренняя
кромка оказалась плохой опорой для всего фасада: mesh снимался слишком рано.
Нижняя общая опора дала проверенное постепенное раскрытие без нового renderer.
Бинарный scalar/line метод и принятая2D/source-height модель сохраняют пределы;
все стороны/углы/остальные48 records и художественное поведение теней этим
адресным циклом универсально не приняты. Новый цикл подгонки не поручается.
