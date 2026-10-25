# P0 perspective — Builder checkpoint v1

Детерминированная сборка формального эталона P0 из Research JSON. Результат
нужен как единый геометрический control и диагностический комплект перед
генерацией досок; это не финальная серия P0.

## Что входит

- `generated/formal-reference-v1.svg` — квадратный шаблон 1536 × 1536: поле,
  четыре угла, ось, контрольные ряды и два семейства объёмных образцов;
- `generated/diagnostic-comparison-v1.svg` — сопоставимый кадр основной
  2.5D-модели и диагностической строгой гомографии;
- `generated/gallery-v1.html` — статическая галерея исходного референса,
  эталона и входных материалов с явно разделёнными ролями;
- `generated/metrics-v1.json` — явные параметры, вычисленные точки и вектор
  сравнения без общего непрозрачного score;
- `PROVENANCE.md` — точные входные commit и решение по несовпадающей
  concept-геометрии.

Галерея не копирует пользовательский JPEG в Git: при открытии локально она
читает `K:\Agents\R4D\Assets\perspective\03-sun-temple.jpg` через `file:///K:/`.

## Повторное построение и проверка

Из этого каталога:

```powershell
npm run build
npm run check
```

`build` читает `../research/perspective-model-v0.1.json` и полностью
пересоздаёт `generated/`. `check` повторяет сборку во временный каталог,
сравнивает файлы побайтно, проверяет SHA-256/размер исходного JPEG и основные
инварианты модели.

Для просмотра галереи в реальном браузере:

```powershell
npm run preview:build
$job = Start-Process node -ArgumentList 'scripts/serve.mjs','--root','output/playwright/gallery-v1/site','--port','4175' -WindowStyle Hidden -PassThru
$pw = 'C:\Users\user\.codex\skills\playwright\scripts\playwright_cli.sh'
$bash = 'D:\Git\bin\bash.exe'
& $bash $pw --session r4d-p0-v1 open http://127.0.0.1:4175/
& $bash $pw --session r4d-p0-v1 snapshot
& $bash $pw --session r4d-p0-v1 screenshot
& $bash $pw --session r4d-p0-v1 close
Stop-Process -Id $job.Id
```

`preview:build` проверяет исходный read-only путь и копирует JPEG только в
игнорируемый preview-каталог. Снимки Playwright также остаются в
`output/playwright/` и не входят в Git.

## Ограничения

- Модель — рабочий 2.5D-композиционный эталон, не восстановленная камера.
- Concept template показан только как художественная спецификация; его
  наблюдательная трапеция не участвует в геометрии v1.
- Строгая гомография — только сравнение; основной эталон сохраняет независимую
  слабую функцию масштаба объектов.
- Новые законченные доски, фактические запросы генератору и проверка
  повторяемости генерации появятся в следующих материалах команды P0.
