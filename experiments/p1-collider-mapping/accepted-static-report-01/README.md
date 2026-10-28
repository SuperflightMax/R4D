# P1 — статический отчёт принятого результата

Подготовка отдельной страницы PUBLIC Review по прямому поручению Макса от
28 октября 2026. Единственный содержательный вход — commit
`4b47db04c7140ebf88f69b91faa0b790d46f22ec`, subtree
`experiments/p1-collider-mapping/clean-repeat-01/`.

`site/` содержит только HTML, CSS и выбранные неизменённые JPG. Здесь нет
симулятора, JavaScript, библиотек, запуска физики или нового исследования P1.
Изображения архивные; кнопки внутри снимков являются пикселями.

Опубликовано 28 октября 2026:
https://superflight.space/review/r4d/p1-mapping-report/ .
Доставка выполнена по exact CTO gate после bounded static QA; фактический
PUBLIC render получил `BOUNDED_PUBLIC_RENDER_PASS_WITH_NOTES`. Итог,
ограничения, hashes и завершение own lock —
[`audit/RELEASE_COMPLETE_01.md`](audit/RELEASE_COMPLETE_01.md).
Публичные bytes frozen candidate01 не менялись. Доставка завершена, окно
сериализации CTO остаётся за CTO до его отдельного решения.

`audit/` и `scripts/` не входят в публичный allowlist. Provenance сохраняет
точный Git ref, blob, байтовый SHA-256 и соответствие подписей версиям.
Снимки Viewer из `plain-four-board` относятся к selected 01/02 trial01,
03/04 trial02. У 04 использована существующая финальная пара Viewer с новым
стартом; старые Research overlays 04 candidate01 не экспортированы. Новой
диаграммы не требуется, потому что обе финальные иллюстрации уже существуют.

Страница описывает принятую привязку препятствий и перспективу. Drops/buckets,
движение, шарик, тень и художественное качество погружения отдельно не приняты.
P2 frozen04 и его прежние release-intents сохранены, эта работа их не меняет.

Подготовка: `python -B scripts/prepare_figures.py` из этого каталога.
Проверка: `python -B scripts/check_static.py`.
Скрипты читают только exact accepted subtree через Git; core не выполняется.
