# Единственный кандидат Q5 — q5-c1

Зафиксирован23 октября2026 после готовности Artist, ранней настоящей цепи и самопроверки Builder. Runtime/art/provenance заморожены для одного независимого прохода Technical QA, Visual QA и полного ART_REVIEW Artist. Коррекции только по отдельному разрешению CTO; Q6 запрещён.

Открыть http://127.0.0.1:4185/ . Скрытый Node/Vite PID114040, output/builder/vite.*; второй сервер не запускать. README описывает управление. Публичную публикацию этот кандидат не выполняет.

`output/builder/q5-c1-files.json`:40 runtime-входов,38 provenance inputs. SHA256 самого манифеста `cc6ad2723362c7bac5e9a1f432c99fd7e06716f29b99152dde9eb00f939cccd3`. Construction v1 SHA rig `16379c05ef97cd5ec4527c63f09cb166152c74b3b1e5d2d10f73c13eb8f488eb`;19 pre-art hashes сохранены, v1 не менялась. Manifest Artist geometry сверена с v1; runtime берёт physical data прямо из неё.

Один образ «Эмалевый мастер»,7 generation-вызовов по7 заранее заданным геометрическим формам,12 PNG attachments. Генератор не удержал размещение на холсте; Lead до кандидата разрешил явный uniform scale+translation под прежний bbox. Raw, whole-canvas baseline, exact transforms и coverage before/after сохранены; без новой генерации, nonuniform stretch, paint/infill/alpha masking. CONSTRUCTION_CHANGES раскрывает вмешательство подготовки, остаточное отличие формы и измерение pixel edge подошвы30→31 при прежних суставах/длинах.

Reuse spring/IK/UI Q2 с новой fixed геометрией; один mechanism idle/low/locomotion/jump и arbitrary/mid-transition requests из текущих pose/velocity. Полёт сохраняет возможность изменить наземную цель. Кнопки конструкция/арт и исходная поза помогают сравнению на тех же осях. Технические маски обозначены отдельно и не выдаются за итоговый художественный растр.

Самопроверка:4/4 Node tests, production build, реальный изолированный Chromium.9 jump start/landing combinations,4 маршрута,2mid-transition, keyboard, pause/step, bones, bind/выход по команде, construction/art, фон и390px без overflow. Errors0/Warnings0; 37 observations в browser-selfcheck-result.json и кадры output/playwright/builder. Это не независимая приёмка.

Ограничения: head97.18%, forearm98.04%, foot86.09% required coverage; суставные накладки/тёмные линии остаются видимыми; одинаковый near/far art и плоский профиль ограничивают глубину. Ближайшая подошва при шаге до1.84835 экранного px выше пола от smoothing lift; отсутствие sliding/физический баланс не гарантируются. Эти состояния и отличия не скрыты.

Q1–Q4 diff пуст, чужие dirty/untracked сохранены. Собственный браузер q5-builder закрыт, сервер оставлен команде. Git add/commit/push централизует Lead. Следующий шаг: оба QA и Artist смотрят **этот** неизменный кандидат, затем общий пакет и ответ исполнителей для решения CTO.
