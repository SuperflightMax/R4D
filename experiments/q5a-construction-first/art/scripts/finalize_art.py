"""Save checks, selected surface map, contact sheet and production notes."""
import json
from pathlib import Path
from PIL import Image,ImageDraw
from check_art import check
from prepare_art import ART,ICC

def main():
    result=check()
    (ART/'validation.json').write_text(json.dumps(result,ensure_ascii=False,indent=2)+'\n',encoding='utf-8')
    selected=json.loads((ART/'attempts/02/checks-and-mapping.json').read_text(encoding='utf-8'))
    selected['status']='ART_READY_FOR_CONCEPT_AND_BUILDER_REVIEW'
    selected['selected_attempt']='02'
    selected['validation']='validation.json'
    (ART/'package.json').write_text(json.dumps(selected,ensure_ascii=False,indent=2)+'\n',encoding='utf-8')
    mapping=json.loads((ART/'reference/surface-atlas-map.json').read_text(encoding='utf-8'))
    sheet=Image.new('RGBA',(2048,2048),'#e5e7e8');draw=ImageDraw.Draw(sheet)
    for m in mapping:
        path=ART/'attempts/02/textures'/(m['id']+'.png')
        im=Image.open(path);dx,dy=m['atlas_translation']
        sheet.alpha_composite(im,(round(dx),round(dy)))
        i=m['cell'];draw.text(((i%4)*512+16,(i//4)*512+16),m['id'],fill='#222222')
    sheet.convert('RGB').save(ART/'attempts/02/preview/surfaces.png',icc_profile=ICC)
    rows='\n'.join('| `'+s['id']+'` | `art/'+s['file'].replace('\\','/')+'` | '+s['source']+' |' for s in selected['surfaces'])
    notes='''# Q5A: изготовление растрового арта Нэлы

25 октября 2026 года, Europe/Kyiv. Asset Artist `asset-artist-r4d-q5a-01`.

**ART_READY_FOR_CONCEPT_AND_BUILDER_REVIEW.** Выбран пакет `art/attempts/02/`, 15 зарегистрированных PNG. Это подготовленная передача на художественный/конструктивный просмотр, не приёмка движения или финального качества CTO. Clean art начат только после прямого production brief CTO и gate-коммита `d3bdf8f1cffebe2179805eeb54a8a36faab08805`, совпадавшего с HEAD и origin/main.

Основание — DESIGN.md, ART_CONSTRAINTS.md, CONSTRUCTION.md, JSON v2 и положительные construction reviews. SHA конструкции до и после работы: `70f324aa7126f7aea0eca24e42aa370b18bb48d070810f3819a5cab16116e092`. Геометрия, UV, риг, диапазоны, демо и другие документы не менялись.

## Выдача

- `art/package.json` — точный выбор, mapping 15 поверхностей, pivots и SHA-256 каждого PNG; пути относительно art/.
- `art/attempts/02/textures/` — выбранные 15 RGBA PNG 1024×1024, straight alpha, встроенный sRGB ICC.
- `art/attempts/02/preview/bind.png` — прозрачный нейтральный bind в viewport 960×640.
- `art/attempts/02/preview/contact-sheet.png` — восемь статических конфигураций в целевом масштабе: bind, low_deep, оба walk-контакта, jump_apex, jump_landing, range_reach, range_compression.
- `art/attempts/02/preview/low-deep-x2.png` — диагностический присед ×2, поле 1280×960; `surfaces.png` — все полные поверхности отдельно.
- `art/validation.json` — выполненные проверки и хеши исходных генераций. `art/attempts/01/` сохраняет первую сборку с тёмной проймой, nearest-фильтрацией и её версией обработки.
- `art/source/` — четыре исходных результата built-in и четыре точных prompts. Каждый использованный результат скопирован из generated_images в проект, оригиналы в CODEX_HOME оставлены.
- `art/reference/` — детерминированный raster bind из принятого SVG, atlas-регистрация поверхностей, mapping и фиксированный sRGB профиль. Это технические ориентиры, не замена сгенерированного арта.

## Режим и вызовы встроенного генератора

Прочитаны imagegen/SKILL.md, references/prompting.md и sample-prompts.md; использован только default built-in `image_gen.imagegen`, edit через `referenced_image_paths`, каждый раз `transparent_background=true`. Точный внутренний image-model ID инструмент не сообщил; параметры качества/модели не подменялись. API/CLI, ключи, локальные generative-модели, установка зависимостей и сторонние сервисы не использовались.

| Вызов | Входы по порядку | Сохранённый результат | Решение |
|---|---|---|---|
| 01 | reference/bind-registration.png — edit target/geometry | source/nela-01.png | Новый цельный образ, эталон внешности. Не считается метрически точной регистрацией |
| 02 | reference/surface-atlas-registration.png — edit target; source/nela-01.png — identity/style | source/nela-atlas-02.png | Единый лист 15 полных поверхностей; основной источник материала |
| 03 | source/nela-atlas-02.png — edit target; reference/surface-atlas-registration.png — geometry | source/nela-atlas-03-head-repair.png | Исправлена только задача клетки head_face: без волос и шеи. В пакет взята только эта клетка |
| 04 | source/nela-atlas-02.png — edit target | source/nela-atlas-04-armhole-repair.png | Осветлена тёмная полость проймы. В пакет взята только клетка torso_top |

Все outputs имеют фактический размер 1254×1254 и настоящую RGBA-прозрачность. Заданные в prompt 1024/2048 и точные позиции генератор не гарантировал. Поэтому отбор генерации отделён от последующей детерминированной регистрации. Edits 03/04 слегка меняли и соседние клетки: они не заменяли принятые материалы всего листа; их побочный дрейф исключён выбором одной клетки.

Исходные имена в CODEX_HOME/generated_images/01a16ffd-8810-7bd2-a3d0-6fee241915c2:

- 01: exec-e4a59b07-a69d-4752-ad5f-3114db010eee.png
- 02: exec-f744fe01-f08d-4cc2-b7a9-6cb79c1c67bf.png
- 03: exec-b2fe7e9a-c648-4121-9e12-9997c0b2dbd3.png
- 04: exec-4102247c-09d9-44ac-b744-c0639f8b731f.png

## Детерминированная подготовка и коррекции

1. reference.py читает полигоны bind-registration.svg, применяет исходные translate/scale, растеризует Pillow с трёхкратной дискретизацией и уменьшает до 1024. Служебные текст, кресты и фон не переносятся. Ориентир просмотрен перед вызовом 01.
2. atlas_reference.py размещает полные поверхности JSON в 4×4 клетки по 512 без изменения общей пиксельной шкалы; размещение обратимо через surface-atlas-map.json. Ориентир просмотрен перед вызовом 02. Это разнесение уже утверждённых материалов, не новая конструкция.
3. prepare_art.py выделяет крупнейший alpha-компонент каждой клетки при пороге 96, удаляя прозрачную пыль. Затем переносит реальные сгенерированные RGB-пиксели построчно по ширине силуэта в маску соответствующей поверхности v2. Внутренние детали могут деформироваться при таком переносе; совпадение маски не доказывает совпадения нарисованной анатомии.
4. Hidden skin берётся из полных сгенерированных голых конечностей, не из видимых обрезков цельного персонажа. Ткань торса не попадает в руку, шорты — в кожу бедра. Для pelvis_shorts используется верхняя часть сгенерированной ткани (69% высоты исходного материала), чтобы не переносить чужой нижний подол/пах. Две панели сидения остаются в одном общем поле.
5. Локальное клонирование цвета у первых/последних пяти строк кожи убирает поперечные срезы. Полоса fold_contracts с защитным полем 4 px получает широкий мягкий свет: вариация поперёк полосы смешивается на 72% с медианой текущей строки кожи. Это обработка сгенерированного материала, не создание нового рисунка программными примитивами. Внешняя геометрия и UV остаются v2.
6. На внутренних краях тканевых панелей подавлена замкнутая тёмная окантовка; сами складки/фактура взяты из генерации. Цвет дальней кожи/кистей умеренно снижен множителями RGB 0.955/0.95/0.945. Прозрачные пиксели получают RGB-запас своего материала на 4 px; альфа остаётся маской конструкции с антиалиасингом.
7. Preview читает только сохранённые poses v2. Кожа использует её постоянные треугольники/UV, остальные полигоны триангулируются в bind и переносятся по соответствующим вершинам; панели шорт раздельно. Ближняя рука разделена по постоянным root/limb draw-фрагментам, кожа ноги показывается от t=.5. Не рисуется отдельная версия тела для каждого кадра. Во втором варианте применена bilinear-фильтрация premultiplied samples с возвратом в straight RGBA.

Ни человек, ни агент не дорисовывали вручную внешний персонаж в редакторе. Агент выбирал источники, маски и параметры перечисленной обработки; художественные пиксели лица, кожи, ткани, волос и обуви создал встроенный генератор. Роль этой существенной обработки не скрывается под словом «автоматически».

## Проверки и художественная самопроверка

Проверки PASS: все 15 ID/имён, 1024×1024 RGBA, sRGB ICC, нет пустых материалов, есть alpha=0 и alpha=255, альфа каждой текстуры точно совпадает с растеризованной геометрической маской v2, pivots неизменны, SHA-256 файлов совпадают, непрозрачных чёрных дыр нет, RGB-запас по 4 px присутствует. Детальные значения и исходные хеши — validation.json. Конструкция осталась на прежней SHA. Это проверки файла и регистрации, не художественный PASS и не доказательство качества скелетной анимации.

Просмотрены каждый встроенный output, bind и весь лист восьми поз первой сборки, затем bind, low_deep ×2, весь лист восьми поз и лист отдельных поверхностей второй. Тёмная полость проймы заметно уменьшилась; вместо неё видна ткань, сохранены открытые плечо, локти и колени. Есть характерное лицо, тёплая кожа, бирюзовый топ, терракотовые шорты и низкая обувь. Нет дисков, брони, механических торцов или маскировки согнутых суставов. Первая неудача и исправленная выдача доступны для сравнения.

Остались видимые риски для Concept/Builder review: локальная фасетность/пережатие силуэта на сильном локтевом и коленном сгибе; изменение широкого света в сжатой UV-полосе; различимость соседних конечностей при совпадении; заметность границы ткани сидения/штанины; уплотнение волос и искажение мелких черт лица/кисти при подгонке к оболочке. Тонкая линия проймы сохранилась, поэтому в движении нужно проверить, не читается ли она жёсткой дугой. Сдвиг внутренних художественных ориентиров генератора не измерялся как точная анатомическая ошибка. Эти свойства не объявляются решёнными из-за PASS размеров.

Движение, непрерывность переходов, быстрые команды, контакт во времени и реальный runtime не проверены. Здесь только neutral bind и независимые крайние позы; production demo/motion не создавались. Текущий результат пригоден для следующего внутреннего просмотра, окончательную пригодность материала подтверждают Concept/Builder/QA и CTO. Внешнего инструментального блокера нет; исправление конструкции вместо арта не выполнялось.

При проверке целостности одна команда была запущена до завершения записи варианта 02 и получила несовпадение SHA. После завершения записи полная проверка повторена и прошла; промежуточный FAIL не трактуется как дефект ассетов.

## Повторение

Из D:/dev/R4D, установленными Python, Pillow и numpy; ничего не устанавливалось:

```powershell
python -B experiments/q5a-construction-first/art/scripts/reference.py
python -B experiments/q5a-construction-first/art/scripts/atlas_reference.py
python -B experiments/q5a-construction-first/art/scripts/prepare_art.py --attempt 02
python -B experiments/q5a-construction-first/art/scripts/check_art.py
python -B experiments/q5a-construction-first/art/scripts/finalize_art.py
```

Генераторные исходники уже сохранены; эти команды не вызывают imagegen и не требуют ключа. Исторический prepare_art.py в attempts/01 вместе с srgb.icc сохраняет алгоритм первой сборки; его запуск с --attempt 01 воспроизводит прежние outputs. Финальные ICC-байты фиксированы в reference/srgb.icc, а не создаются с новым временем при каждом запуске. Равенство после повторного исполнения не проверялось отдельным вторым полным прогоном; проверены сохранённые хеши и текущая регистрация.

Не выполнялись commit/push, публикация, переписка с другими чатами, изменение state/конструкции/старых опытов. Чужие dirty/untracked сохранены.

## Mapping поверхностей

| Surface ID | Выбранный файл | Генераторный источник |
|---|---|---|
'''+rows+'\n\n## Точные prompts вызовов\n\n'
    for i in range(1,5):
        prompt=(ART/'source'/f'prompt-{i:02d}.txt').read_text(encoding='utf-8')
        notes+=f'### Вызов {i:02d}\n\n```text\n{prompt.rstrip()}\n```\n\n'
    (ART.parent/'ART.md').write_text(notes,encoding='utf-8')
    print(json.dumps({'status':selected['status'],'surfaces':len(selected['surfaces']),'checks':result['result'],
                      'notes':str(ART.parent/'ART.md')},ensure_ascii=False))

if __name__=='__main__':main()
