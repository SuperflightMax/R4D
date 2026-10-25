# P0 final series — Builder visual self-check

Проверена первая серия render из frozen layouts `board-01..04`. После первого
render значения `p`, `q`, `uniformScale`, instance IDs и нормализация master не
менялись. Повторные сборки дают те же байты PNG.

## Browser review

Локальный статический просмотр:

```powershell
node scripts/serve.mjs --root final-series/output --port 4177
```

Через Playwright CLI проверена `gallery.html` при viewport `1500x1200` и
`760x900`:

- gallery и четыре `board-0N/composite.png` — HTTP `200`;
- console — `0 errors`, `0 warnings`;
- четыре равных квадратных кадра показаны общей сеткой 2x2; на узком viewport
  переходят в одну колонку;
- локальные screenshots находятся в игнорируемом
  `output/playwright/final-series-self-check/.playwright-cli/` и не входят в
  release.

## Наблюдение finished boards

- PASS: четыре темы различимы архитектурой, силуэтом, материалами и content, а
  не только цветом.
- PASS: внутри каждой доски четыре control copies имеют одну конструкцию;
  меняются только frozen position и uniform scale.
- PASS: основания стоят на непрерывном поле, а board-owned shadows следуют
  тому же anchor/destination/scale и не образуют прямоугольных швов.
- PASS: нет grid, labels, anchor dots, UI, шарика, коллайдеров или иной
  служебной графики.
- PASS: plate/master визуально согласованы по палитре, резкости и направлению
  света; global redraw composite не применялся.

Это self-check Builder. Независимый Visual QA gate и публикация остаются
закрыты; точное визуальное соответствие quad/seams оценивает QA по frozen
formal reference и rubric.
