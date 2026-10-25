# Q2A — подготовка пакета Review

25 октября 2026 года. Lead `lead-r4d-q2a-01`.
**Q2A_ACCEPTED_RELEASE_PACKAGE_READY.**

Основание — [CTO_ACCEPTANCE_P2_C2.md](CTO_ACCEPTANCE_P2_C2.md).
Принятый source `3c27b07d489f68b3d7d8b4c8beabd35c51402fd4`,
frozen `snapshots/p2_candidate_c2/`, tree
`0c60f912f11cae1ce5e5cf99a6a8ce8fafc70bc4`; QA delivery
`d81c4bd1a31d3b23cedacf936f290fbef251090b`.

Существующий Builder `01a173ea-2ed4-72f2-aebc-7682fbedf2de` собрал
[release-package/PACKAGE.md](release-package/PACKAGE.md).
Публичный route tree:
`release-package/route-tree/review/r4d/q2a-simple-character/`.
**18 файлов, 1 179 499 байт.** Source motion/pose, 10 PNG, CSS и license
сохранены как exact Git blobs. Четыре явные адаптации index/main/binding/Pixi
ограничены адресами, описанием, удалением debug и source-map directive;
движение и численная rig не пересобирались.

SHA256 [provenance.json](release-package/provenance.json):
`61691306ebe4adb5c043dd0abfc4ceebb333f9984f4032c1692d8cba85aafca5`.
Manifest содержит per-file SHA256/bytes и source Git path/blob/причину адаптации.
SHA256 приёмки в нём:
`e18018746907ee498d67eee1d5a76bd4f6bf1693473a4835456f3ea32fcab6e1`.

Существующий Technical QA `01a173ea-2ed3-7350-b592-8cf8f5d379c1`
вернул [RELEASE_PACKAGE_TECHNICAL_QA_PASS](RELEASE_PACKAGE_TECHNICAL_QA.md).
Самостоятельно сверены Git→package→HTTP для всех 18 файлов, allowlist и
допустимые преобразования. Полный localhost route на desktop 1440×1000 и
mobile 390×844: canonical controls, обе последовательности, три flight target,
pause/history branch и light/dark прошли. В наблюдаемом target errors,
failed requests и внешних HTTP(S) запросов нет; горизонтального overflow нет.
Начальные и конечные manifest/публичные байты совпали. Это проверка упаковки,
не новая анатомическая приёмка, не проверка реального телефона или VPS/auth.

Manifest, scripts и evidence не входят в публичное дерево. Контрольные
запросы к исключённым частным ресурсам получили 404. В публичном дереве нет
raw/prompts/QA logs/screenshots/maps/credentials/локальных путей/rejected.
Собственные QA evidence — только `qa/release-package-technical/`.

Точный локальный просмотр оставлен для передачи:
http://127.0.0.1:4340/review/r4d/q2a-simple-character/.
Сервер Builder 4340 localhost; собственные вкладки проверяющих закрыты.
4333/4330/4327 не затрагивались. Производственный snapshot неизменен.
Единственная правка ранее учтённых файлов опыта, помимо нового пакета и
состояния/README, — scoped `.gitattributes`: `release-package/route-tree/** -text`
для сохранения exact байтов. Все 50 учтённых внешних dirty/untracked файлов
сохранены. Прежние отчёты, evidence, snapshots и опыты не перезаписывались.

Состояние README, PROJECT_STATE, ANIMATION_QUEUE_A_STATE и architect/START_HERE
обновлено по прямому поручению CTO. Передача фиксируется отдельным commit/push
только разрешённых файлов пакета, его проверки, приёмки и состояния.
Следующий шаг — CTO delivery gate по exact commit.
**Публикация/VPS не выполнялись, Q2A не объявлен опубликованным.**
Новых людей/чатов/subagents/worktree нет; чужие изменения сохраняются.
