# Операционное состояние R4D

Обновлено: **25 октября 2026 года**, Europe/Kyiv. Основание — прямое
уточнение Max: прежняя фраза про запрет относилась только к пульту, штатная
публикация R4D разрешена, а handoff Dot считается поручением самого Max.
Переданное через Dot поручение привело к выполнению Q4A. Последующее отдельное
production поручение CTO — опубликовать принятый Q4A evidence viewer и затем
оставить R4D idle. Более поздний прямой handoff Макса через Дот отдельно снял
эту idle-границу только для следующего согласованного пункта Queue A — Q2A.

## Текущий статус

**Q2A_PUBLISHED_QUEUE_A_COMPLETE_IDLE.** Q5A принят и
опубликован. Исследование Q4A закрыто как
`RESEARCH_CLOSED_NEGATIVE_PARTIAL`; CTO принял достоверный evidence viewer
`negative-review-v02` и отдельно поручил штатную публикацию, выполненную
25 октября 2026. Полноценной анимации и художественного PASS Q4A нет.

После более позднего прямого handoff Макса через Дот создана новая независимая
команда Q2A. Командный [production plan](../experiments/q2a-simple-character/PREPARATION_PLAN.md)
из commit `b0f586d6a256ae3ef0c84e0e86727d07716e9ef8` прошёл отдельный CTO gate без
возврата на правку. Exact P1 `p1_candidate_c2_arms01` из commit
`6d5c6b593c80f057249a58b706fcdb7c5d62eae5`
[принят CTO с ограничениями](../experiments/q2a-simple-character/CTO_P1_DECISION.md).
Full-motion candidate `p2_candidate_c2` из commit
`3c27b07d489f68b3d7d8b4c8beabd35c51402fd4`
[принят CTO как завершённый PoC с ограничениями](../experiments/q2a-simple-character/CTO_ACCEPTANCE_P2_C2.md)
после независимых Technical/Visual QA PASS из `d81c4bd1a31d3b23cedacf936f290fbef251090b`.
Новая correction-итерация не открыта. Существующий Builder подготовил
[release package](../experiments/q2a-simple-character/release-package/PACKAGE.md)
для `/review/r4d/q2a-simple-character/`: 18 публичных файлов, 1 179 499 байт.
Отдельный [локальный package-QA](../experiments/q2a-simple-character/RELEASE_PACKAGE_TECHNICAL_QA.md)
прошёл без блокеров; source snapshot неизменен. Состав, provenance и следующий
шаг — в [состоянии пакета](../experiments/q2a-simple-character/RELEASE_PACKAGE_STATE.md).
По последующему прямому production brief CTO пакет опубликован 25 октября,
22:51:58 Europe/Kyiv, одиннадцатой карточкой
[Review](https://superflight.space/review/r4d/q2a-simple-character/).
Exact release id/root — `66baa7c80dbe55bf28746d4c2a36af6a1deca28d`;
18 публичных файлов не пересобирались и не редактировались, старые routes
и контент сохранены. Серверные хеши/config/root, локальный desktop/mobile
smoke exact bytes и публичная auth-граница проверены. Post-auth public canvas
не проверен; личный Chrome не использовался, это разрешённое ограничение.
[Release report](../experiments/q2a-simple-character/RELEASE_P2_C2.md) содержит
manifest/config hashes, counts, проверки и rollback. Queue A доставлена;
после этого отдельного выпуска — **idle**. Q4A не переоткрывается;
Q7, correction, hire, новые проверки или публикации не запускаются.

## Сохранённое последующее состояние

Ранее выполненный Q5A принят CTO и после отдельного прямого разрешения Макса
опубликован в [Review](https://superflight.space/review/r4d/q5a-construction-first/).
Первоначальная блокировка VPS снята этим разрешением; серверная доставка,
хеши и auth-барьер подтверждены, локальный desktop/mobile smoke выполнен
на exact опубликованных байтах. Post-auth public canvas не проверен;
по уточнению CTO выпуск завершён с этим ограничением без личного Chrome.
Подробности и rollback — в [release record](../experiments/q5a-construction-first/RELEASE_ASSEMBLY03.md).
Инвентаризация подтвердила уже опубликованные первые два PoC и Q1–Q6;
прежние URL/версии сохранены.

Q4A опубликован десятой карточкой [Review](https://superflight.space/review/r4d/q4a-whole-character/)
из exact source/acceptance `47b637ba77681cc17ccf23757396073047430c37`.
Все 36 route files совпали с Git bytes; прежние материалы сохранены, только
каталог получил новую карточку и счётчик. Серверные hash/config/root checks,
локальный desktop/mobile smoke exact bytes и публичная auth-граница проверены.
Post-auth canvas не проверен; личный Chrome не использовался по brief.
Доставка не меняет отрицательный/частичный вывод исследования.
Подробности, hashes и rollback — в [release record](../experiments/q4a-whole-character/RELEASE_NEGATIVE_REVIEW_V02.md).

## Сохранность

- Существующие сессии и персонал R4D сохраняются без удаления, архивации,
  возврата или замены. Для Q4A создана отдельная новая команда по правилам
  Queue A; прежние сотрудники остаются в ожидании.
- Отдельное поручение доставки Q4A завершено. Та же существующая команда Q2A
  после принятия P1 выполнила P2_FULL_MOTION, проверку и упаковку; штатная
  доставка Release Engineer завершена. Прежние команды не возобновлены,
  новый персонал на выпуск не создавался; после выпуска — ожидание.
- Уже находящиеся в рабочей копии материалы и незавершённые локальные
  изменения сохраняются на месте. Само их наличие не означает активного
  этапа или разрешения продолжать работу.

Эта запись фиксирует текущую административную границу. Исторические задания,
решения, QA и результаты доступны Q2A как знания, но не являются заготовкой
нового персонажа, арта, рига или анимационной сборки.
