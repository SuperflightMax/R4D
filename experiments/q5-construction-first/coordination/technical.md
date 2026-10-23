# Technical QA → Lead / Builder / Artist

BRIEF/STATE прочитаны; workspace experiments/q5-construction-first/, владение qa/technical/ принято. Проверяемый contract готов: qa/technical/CONTRACT.md. Сохранены baseline SHA256 прежних tracked experiments вне Git R4D. Полный проход 0/1, ожидаю construction/v1 и Lead freeze, затем именованный q5-c1 с runtime/provenance hashes и локальным URL. Git централизует Lead.

Для проверки порядка сохраняйте исходные файлы схем и construction JSON именно до первого final-art запроса. Prompt/reference должен ссылаться на них; карта part→joint→asset и описание подготовки позволят отличить texture placement от изменения геометрии. Поздние изменения v1 не перезаписывать: before/after и причины в CONSTRUCTION_CHANGES.md. Один общий mechanism, включая команды в полёте и из промежуточной позы. QA продукт не чинит и новый цикл не запускает.

Прямой send_message_to_thread Lead вернул active writer; доставки в чат не утверждаю. Общий checkout используется по BRIEF, конкурирующий ход не создаётся.

## Подготовка завершена, ожидается frozen кандидат
Независимые наблюдения qa/technical/construction-before-art.json (16:13:11 UTC) и construction-freeze-observed.json фиксируют исходные файлы до final art; все19 hashes v1 совпали после Lead freeze. Прочитаны CONSTRUCTION.md и Artist ACK, осмотрены parts/pose blueprints. Порядок исходной конструкции подтверждён в этой части; конечный art-coupling и runtime ещё не проверены. Все 1185 прежних tracked experiment files без изменений. Полный проход0/1. Для следующего адресного хода в той же session нужен q5-c1/CANDIDATE.md с frozen inputs и рабочим URL; предварительную подготовку не считать полным проходом. Изменять продукт/запускать исправления QA не будет.

## Единственный полный проход q5-c1 завершён: 1/1

REPORT.md: qa/technical/REPORT.md. Construction-first подтверждён собственными наблюдениями до art; практическое coupling частичное. Все40runtime/38provenance hashes совпали до/после, motion.js побайтно pre-art. Независимая реконструкция12/12PNG и12/12baseline, original outputs7/7, manifest geometry12/12 совпали. Uniform registration и post-art contact30→31/258.48→259.48 раскрыты и проверены, скрытой правки v1 не найдено.

Проверенные manual controls: idle/low/move, jump из всех3 состояний, текущая наземная цель в flight, оба idle→low прерывания на move/jump.5jumps/5lands; один mechanism; console warning/errors0. Детерминированный шаг работающего браузера, без подмены реализации. T1 сохраняется: head97.182%, forearm98.042%, foot86.0863% покрытия; T2 nearest sole gap0.0011…1.5896screen px при scale0.561887,360samples. Не объявлять идеальные опору/силуэт/естественность. Новых блокирующих функциональных дефектов в проверенном не выявлено; рекомендую показать с ограничениями, решение CTO с VisualQA/Artist.

В REPORT отдельно раскрыта задержка первых screenshots; использовать verified-low/verified-flight, а не старые неправильно названные кадры. Это ошибка фиксации QA, не дефект Motion.1185 прежних tracked experiment файлов без изменений; QA runtime/art/provenance не менял. Собственная вкладка встроенного браузера закрыта, сервер PID114040 оставлен. Один пакет Lead/CTO передан здесь; никаких исправлений/второго цикла/Q6. Git централизует Lead. Исполнителям нужен ответ на этот пакет без изменения кандидата.
