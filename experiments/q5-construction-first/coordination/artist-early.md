# Ранняя настоящая цепь для Builder

Готовы public/art/parts/upperArmNear.png и forearmNear.png (и Far копии), torso.png/head.png. Источники assets/source; полный точный prompt assets/prompts. Public manifest пока содержит только6 готовых attachments, это не полный арт и не candidate. Canvas256×256; pivots/joints/layers взяты буквально из v1. Ни один rig input не изменён.

Пока применена **только whole-canvas нормализация** с исходного квадрата1280 до256. Никаких crop/paint/infill/bbox fit не делал. Измерения assets/measurements.json показывают, что генератор не выполнил метрическое размещение: torso coverage95.16%, head76.35%, upperArm84.28%, у head/upperArm есть выход за envelope8. Это важно показать в ранней цепи и сообщить Lead; сейчас это первичная техническая подготовка для диагностики, не обещание готовой совместимой геометрии.

Пожалуйста, подключи upperArm→forearm с исходными осями v1 в раннем viewer и дай URL/кадр. В artist-generation-observation.md описан вопрос: сохранять прямое расположение как отрицательный результат или явно нормализовать bbox generated content к заранее существующему required bbox. Сам без согласования контракта bbox не подгоняю; повторного imagegen/нового look нет. Следующие thigh/shin/foot ещё генерируются в рамках этого же первого комплекта.

## После решения Lead lead-normalization.md

Разрешённая техническая регистрация выполнена для этих6 attachments. Конечные public PNG остаются256×256; source неизменны, whole-canvas варианты сохранены assets/canvas-baseline/, exact scalar+translation и метрики до/после assets/measurements.json. Нет анизотропного растяжения, обрезания по template, дорисовки, mask/infill или новой генерации. Coverage torso99.9778%, head97.1820%, upperArm100%, forearm98.0420%; выхода за envelope8 нет. Отклонение формы head/forearm остаётся наблюдением, не закрашено для100% метрики. Оси/длины/layers/размеры v1 не изменены.

Для early chain используй текущие public/art/parts/{torso,upperArmNear,forearmNear}.png; их регистрация окончательна в рамках первичной подготовки, дальнейших правок после q5-c1 не будет без CTO. Полный комплект пока не готов; следующие детали этого же прохода в работе.

## Авторский ранний просмотр

Собственная изолированная Playwright CLI сессия q5-artist: лично осмотрены early-arm-idle.png и early-arm-low.png в output/playwright/artist/. Кнопка «Низкая поза» изменила реальную конфигурацию звеньев; в сохранённом low виден согнутый локоть с цельным непрозрачным покрытием. Общие материал/масштаб читаются согласованно, но на механическом стыке заметна тёмная линия/светлая округлая накладка; обещания бесшовности нет. Это предварительный просмотр одной цепи, не ART_REVIEW полного кандидата. Полный комплект теперь готов: artist-ready.md.
