# C2 trace contract

Формат обмена для Technical QA Stage C. Runtime и asset handoff остаются источниками истины. Этот формат предназначен для QA-адаптера после фиксации кандидата.

## Привязка коллектора

`collect-c2.js` — функция для Playwright CLI `run-code --filename`. Скопировать в каталог закреплённого прогона и заполнить единственный `binding`. До выдачи SHA binding остаётся пустым. Данные для привязки:

| Поле | Значение |
| --- | --- |
| `sha`, `buildSha256` | SHA CTO и SHA256 файла build manifest из preflight. |
| `url`, `output` | Preview из выбранного `dist`, `http://127.0.0.1:4205/`. Вывод в абсолютный `<runRoot>/evidence`. |
| `tag`, `kind`, `mode` | Уникальный tag из `[a-z0-9-]`, `live`/`trace`, `pointer`/`keyboard`/`touch`. Touch открывается с реальной эмуляцией, режим передаётся явно. |
| `viewport`, `seed`, `hz` | `{width,height}`, uint32, частота реального фиксированного тика. |
| `introLimitTicks`, `transformTicks`, `idleTicks` | Верхняя граница интро, полное окно от действия до settled K5 с хвостом ≥0.1 с, окно каждой idle от 12 с. На каждом участке число записанных кадров равно заданному count, шагов на один меньше. Для длинной осмысленной idle настроить достаточно времени для двух характерных периодов. |
| `capsulePhase`, `mantisPhase`, `actionName`, `stageSelector` | Фактические фазы готовности и доступное имя кнопки, selector поверхности сцены. Для клавиатуры запуск `firstKey`, по умолчанию `a`. |

Базовые хуки из среза — `window.__Q3C__.ready`, `snapshot()`, `pause()` и `step(seconds)`. Для be62 полный кадр рендера читается через trace(), а snapshot() используется для фазы. Подготовить привязку копии коллектора через bind-be62.ps1. Снимок является JSON-совместимой копией реального тика. Для `trace` настоящее действие идёт при остановленном времени, а смена позы проверяется с этого же тика. В `live` реальный clock свободен. Кнопка выбирается по роли/имени после просмотра доступного состояния. `Tab` и `Enter` используются как клавиатурный ввод, touch через touch context.

Внутри QA-снимка нужны tick, phase, seed, lifecycle событий, фактические instance tokens, asset IDs и мироматрицы каждого узла, включая скрытые упакованные детали. Экземпляры связываются с реальными объектами рендера, например WeakMap токеном. Отдельно нужны локальные значения активных приводов, вклад idle, границы K0–K5, поддержка и апертуры. Калибровка world space вычитает camera transform. Захват помечает тег, SHA, build hash и viewport. Blob download служит переносу данных трассы в папку QA.

## Нормализация

Создать в `runRoot` собственный `c2-adapter.mjs` после чтения реального snapshot и frozen rig. Три экспорта:

```js
export const rig = /* структура и допуски из закреплённого rig */ null;
export function frame(raw, section) {
  // Преобразовать значения из реального snapshot в контракт ниже.
  // section: preAction, capsuleIdle, transform, mantisIdle.
  throw new Error('Bind the adapter to the exact Builder snapshot');
}
export function keyTicks(rawTransformFrames, rawPreAction) {
  // K0 соответствует tick непосредственно до действия.
  // K1–K5 берутся из реальных фаз или закреплённых границ, сверенных с позами.
  throw new Error('Bind K0–K5 markers');
}
```

`normalize-c2.mjs` читает три gzip-блока одного тега, проверяет pin/build/seed/viewport и экспортирует один JSON. Два тега обозначают независимые записи. Нормализация сохраняет наблюдаемые значения и фиксирует единицы. Шум и квантование оговариваются заранее.

| Объект | Поля |
| --- | --- |
| Нормализованный frame | `tick`, `state` (фактическая форма `capsule`, `transform`, `mantis`), `phase` кандидата, `events`, `parts`, `planted`, `channels`. Сохраняются события и механически существенное состояние для replay, без wall-clock и browser session ID. |
| `parts[id]` | `token`, `parent` (физический, `null` у корня), `asset`, `matrix=[a,b,c,d,tx,ty]`. `xw=a*x+c*y+tx`, `yw=b*x+d*y+ty`, y вниз. Физическая матрица с исключённой камерой. projected хранит отдельно фактическую экранную матрицу Pixi до камеры. |
| `planted` | ID контактов из `rig.soles`, наблюдаемых на данном tick. Реальный выход из постановки закрывает её интервал. Контакт переката описывается отдельно при сверке фактической подошвы. |
| `channels[id]` | В трансформации значение реального локального привода в rad/u с развернутым углом, без суммарной FK-геометрии и с отделённым idle. В idle фактическое локальное движение. Указать источник и проверку соответствия реальной позе. |
| `rig.U`, `rig.floorY`, `rig.tolerances` | Единица длины shell и мировая линия пола. `{position,contact,scale,angle}`, замороженные до измерения. |
| `rig.parts[id]` | `parent`, `asset`, `scale:[sx,sy]`, `maxSpeed` и `maxAngularSpeed` в секунду, `floorContour:[[x,y],...]` в локальных координатах. Полный инвентарь сверяется с handoff. Контуры обязательны у подошв и физических деталей, которые могут приблизиться к полу. |
| Anchor | `{part,at:[x,y]}`. Все pivots и углы приводятся к единицам, ориентации и оси runtime. |
| `rig.hinges[]` | `{id,a:anchor,b:anchor}` для пары совпадающих осей. Скользящие сопряжения документируются отдельными ходом и нахлёстом в отчёте. |
| `rig.links[]` | `{id,a:anchor,b:anchor,length}`. `length` берётся из frozen handoff, точки — из матриц обоих звеньев. |
| `rig.soles[id]` | Anchor постановки. Минимум четыре разные части с полигональным контуром. |
| `rig.motion[]` | `{id,role,unit,noise,minTravel,target,settleBand,overshoot:{direction,min,max}}`. Направление ±1 за target. Заявленный overshoot выше измерительного шума. На жёстких упорах `min=0`. |
| Роли motion | `chassis`, `thorax-lower`, `thorax-upper`, `carriage`, `hatch`, `near-arm`, `near-blade`, `far-arm`, `far-blade`, `support-near`, `support-far`. Привязка каждой роли к реальной детали/степени свободы входит в отчёт. |
| `rig.pairs[]` | `{first,second,delayTicks,overlapTicks,distinctShape}`. `null` для неприменимого требования о задержке/перекрытии. Направление задержки считается от first к second. |
| `rig.idle.capsuleIdle` и `rig.idle.mantisIdle` | `{minSamples,lagSeconds,channels:[{id,role,noise,minRange},...]}`. Семейства `body`, `eye`, `secondary`. Длительность и лаг покрывают заявленные периоды и сдвиги. |
| `keyTicks` | `{K0,K1,K2,K3,K4,K5}` из целых ticks. K0 равен `preAction.tick` и первому tick transform; следующие ключи строго возрастают и лежат внутри окна. |

Сравнение replay включает нормализованные события, оба idle и весь переход. `token` исключается только между независимыми запусками и проверяется на постоянство внутри каждого. Флаги кода связываются с raw snapshot, исходным SHA, физическим ID и кадром. Матрица ручного просмотра дополняет численные границы реальными проёмами, полным контуром, вводом, а11y и обычным темпом.
