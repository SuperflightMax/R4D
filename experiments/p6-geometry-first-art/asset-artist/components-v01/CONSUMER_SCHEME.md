# Отдельный компонентный вариант v01: concrete consumer scheme

Начат после сохранённой обязательной whole-image пробы и двух meaningful corrections.
Не выдаётся за её успех. Все inputs/коллайдеры/гомография P1 остаются unchanged.

## Ближайшие реальные пакеты

- Уже actual: sphere+own shadow `../SPRITE_PACKET_V01.json` (native outputs).
- Первый obstacle master: own wood post RGBA без пола/падающей тени, с круговым
  основанием и явным ground anchor. Для8 native wood IDs один family master;
  текущее разрешение/alpha/visible base измеряются после генерации, не выдумываются.
- Далее собственные flower/leaf/frog RGBA masters с отдельными base anchors:7/5/5 IDs.

## Пол и окружение

Сгенерировать own прямой raster limestone/moss material без perspective/colliders,
объектов, теней или нарисованных границ. Consumer кладёт эту текстуру на полигон
принятого пола, который уже существует в frozen geometry, через принятую матрицу.
Точное положение границы этим контролирует geometry, а не найденный на картинке край.
Отдельный own background-jungle plate не содержит поля, ограждений или игровых объектов.
Нельзя использовать whole-v02 floor как незаметно заново зарегистрированную доску.

## Объекты и тени

25 anchors и footprints получаются только из accepted config/manifest. Для masters
передаются фактические alpha bounds, base ellipse/centre и suggested visible height.
Consumer сохраняет projective ground footprint и подбирает законную нормализацию
растра, не двигает config. Техническая цилиндрическая заготовка не становится финальным
артом: поверх стоят фактические законченные raster sculptures/materials.
Тени препятствий отдельные ground layers, одно согласованное направление вниз-влево;
малые contact и читаемые cast shadows по высоте семейства. В floor их не дублировать.

## Границы и приёмники

Графические internal faces ограждений привязаны к actual16 segments, включая все
изломы. Растровая masonry/rope отделка с отдельными front/rear parts не определяет
физику. Для каждого из4 receiver open mouth centre стоит точно на capture centre;
rear body и front rim разделены, чтобы ball мог частично перекрываться ободом.
Маски извлекаются из фактических own PNG, не маски от других опытов и не geometry-only
накрывающий прямоугольник. Невидимые маски отключаются вместе с арт.

Каждый компонентный packet имеет отдельную версию и фактические PNG/hash/anchors.
Согласование первого master и показ маленькой actual сборки нужно раньше изготовления
всех разрешений. После real integration исправляются причина и конкретный слой.
