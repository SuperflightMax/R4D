# Просмотр ART-02

Небольшой локальный Pixi-просмотр пересборок Jungle. Состав файлов, позиции и
порядок слоёв задаёт `assembly.json`. Ассеты читаются из соседней папки
`artwork/`; требования к передаче описаны в [INPUTS.md](INPUTS.md).

В PowerShell из `experiments/art-2d/ART-02/builder/`:

```powershell
npm.cmd ci --ignore-scripts --no-audit --no-fund
npm.cmd start
```

Откройте `http://127.0.0.1:4182/` при масштабе браузера 100%. Порт можно
задать командой `npm.cmd start -- 4183`. Сервер слушает только loopback.
Просмотр использует PixiJS 8.22.0 из lock-файла и WebGL. Запуск проверяется
на Node.js 24.15.0. Остановка сервера — Ctrl+C.

Три колонки сохраняют одинаковый размер 354×320 CSS px. В узком окне
сравнение можно прокрутить по горизонтали или перейти к нужной колонке
кнопкой. Переключатель наложения добавляет оригинал с прозрачностью 50%
поверх каждой сборки. Сдвиг, скрытие и возврат листа действуют отдельно
для 02-P и 02-R. Для проверки краёв выберите отдельный
слой и смените подложку. Список под каждой сборкой идёт снизу вверх,
показывает bbox, pivot и текущую позицию в Pixi. Переключатель глаза
меняет состояние одной и той же раскладки до и после правки.

Версия `art02-pixi-03-p-refined-v5-r-flower-locked` подключает
`02-P/refined-v5` и `02-R/flower-locked`. Порядок и привязки читаются из
манифестов художника. Точный комплект Review, снимки и замеры текущей
проверки описаны в [REVIEW.md](REVIEW.md).

Первый проход `art02-pixi-02-p-r-first` зафиксирован коммитом
`d14ccd0c53c715442eb608221de15c7f3a51e199`. Его [самопроверка](SELF_CHECK.md)
и снимки сохранены отдельно.

Для повторного съёма после запуска сервера:

```powershell
npx.cmd --yes --package '@playwright/cli@0.1.23' playwright-cli --session art02-builder open 'http://127.0.0.1:4182/'
npx.cmd --yes --package '@playwright/cli@0.1.23' playwright-cli --session art02-builder run-code --filename capture.playwright.js
npx.cmd --yes --package '@playwright/cli@0.1.23' playwright-cli --session art02-builder console info
npx.cmd --yes --package '@playwright/cli@0.1.23' playwright-cli --session art02-builder close
```

## Граница проверки

Это промежуточный фрагмент, не уровень. Точный pin Millionko
`87d1e8d73dd2373c097a23d0839d49705a894934` отсутствует в доступном локальном
checkout. Движение в существующем Level Lab, seed/drop, контакт шарика и
паритет с headless в этом проходе не проверяются. Статические испытания
подтверждаются отдельно по фактически загруженным слоям и версии карты.
