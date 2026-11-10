# Кандидат для TQA и VQA

Префикс Review — `/review/r4d/art-2d/`. Вход ведёт в
`art-01/` и `art-02/`. ART-01 — `art01-concept-8calls-v1`, восемь
полных кадров и три сравнительных листа. ART-02 —
`art02-pixi-03-p-refined-v5-r-flower-locked`, PixiJS 8.22.0.
Входы ART-02 — `02-P/refined-v5/manifest.json`,
`02-R/flower-locked/manifest.json` и `reference/control.png` из `artwork/`.
Под интерактивом три подписанных листа художника с полным размером по клику.
Первый 02-P виден в листе сравнения с коррекцией. Исходный интерактивный
проход и его проверка сохранены в
`d14ccd0c53c715442eb608221de15c7f3a51e199`.

| Файл | SHA-256 |
| --- | --- |
| `assembly.json` | `e822df923ca9848571766bc37b887172664e3edc3b8cff992084dc6c96949ea0` |
| `review-package.allowlist.json` | `179ab7324e0b36ed4d0a752eb4b5e01fba7822f59105f2b73a61c17874aff099` |
| Публичный `art-02/pixi.js` | `2a66ac7373b51d70194dc25073e3011633834c02538965b076cddc9650e2c417` |
| Исходный манифест `02-P/refined-v5` | `5cfb977a65bac8e9d23711138e9da6f1a4d3fd753a34baf1a7a285b7e99ef577` |
| Исходный манифест `02-R/flower-locked` | `a72935343589059b04ac1acc7a738b78dc389b57d52ad469e3c732b3925fdb41` |

## Локальное повторение

Из `experiments/art-2d/ART-02/builder/`:

```powershell
npm.cmd ci --ignore-scripts --no-audit --no-fund
npm.cmd run build:review
npm.cmd start -- 4182 --review
```

В браузере открыть `http://127.0.0.1:4182/review/r4d/art-2d/`. Для
самопроверки Chromium из второго терминала в том же каталоге:

```powershell
npx.cmd --yes --package '@playwright/cli@0.1.23' playwright-cli --session art02-review-builder open 'http://127.0.0.1:4182/review/r4d/art-2d/'
npx.cmd --yes --package '@playwright/cli@0.1.23' playwright-cli --session art02-review-builder run-code --filename review.playwright.js
npx.cmd --yes --package '@playwright/cli@0.1.23' playwright-cli --session art02-review-builder run-code --filename capture.playwright.js
npx.cmd --yes --package '@playwright/cli@0.1.23' playwright-cli --session art02-review-builder console info
npx.cmd --yes --package '@playwright/cli@0.1.23' playwright-cli --session art02-review-builder close
```

Пакет строится в `review-package/`. Для интеграции под префикс берётся
содержимое этого каталога по [точному списку](review-package.allowlist.json)
из 37 путей с размерами и SHA-256. Список хранится отдельно от дерева
маршрута. `review-package/` генерируется из закреплённых входов и исключён
из Git как копия. Локальный Node используется только для подготовки
и проверки. Статические страницы используют относительные URL. Pixi
лежит рядом с лицензией MIT, ссылка на sourcemap удалена из копии bundle.
В публичные манифесты вынесены только поля, читаемые просмотром.
Внутренние промпты, исходные манифесты, скрипты, журналы, профили, lock-файл
и сервер не входят в список выдачи.

## Что подтверждено

- Chromium 156, WebGL 2, DPR 1. В обеих версиях сдвиг 0→−14→0 и скрытие
  листа с возвратом восстановили весь исходный canvas попиксельно.
  На сдвиге и при скрытии неподвижный цветок сохранил все 1 574 и 1 963
  защищённых пикселя соответственно. Изолированный фон обеих версий
  совпал с PNG художника. Правка глаза затронула 670 и 806 пикселей,
  целиком внутри масок кольца. Собранные Pixi-кадры в четырёх состояниях
  отличаются от композитов художника максимум на 1 из 255 на канал.
  [Координаты и съём](output/playwright/art02-pixi-03-p-refined-v5-r-flower-locked/capture.txt) ·
  [Замеры](output/playwright/art02-pixi-03-p-refined-v5-r-flower-locked/frame-pixels.txt) ·
  [Консоль](output/playwright/art02-pixi-03-p-refined-v5-r-flower-locked/console.txt)
- На desktop 1200×900 и touch-экране 360×800 проверены входы в оба опыта.
  На узком экране кнопки переключают колонки ART-02 с шириной 354 px
  без масштабирования. Проверены скрытие листа и возврат касанием.
  ART-01 открыл исходный PNG 1006×1564, ART-02 открыл лист 1122×1150.
  В браузере нет HTTP-запросов за пределы префикса и ошибок ответа.
  [Маршруты](output/playwright/art02-pixi-03-p-refined-v5-r-flower-locked/review-smoke.txt) ·
  [Сверка файлов](output/playwright/art02-pixi-03-p-refined-v5-r-flower-locked/route-audit.txt) ·
  [Мобильное управление](output/playwright/art02-pixi-03-p-refined-v5-r-flower-locked/08-art02-mobile-controls.png)

На 02-P при скрытии листа остаётся видимым переход на прохладной подложке.
Точные художественные наблюдения по обоим методам в
[выдаче художника](../artwork/HANDOFF.md). Динамическая проба в Level Lab
не проводилась из-за отсутствия точного локального pin Millionko.
Здесь подготовка и самопроверка пакета до независимых TQA/VQA.
