# P5 Water + Dark — local wrapper runtime smoke 003

Результат: **SCOPED_BROWSER_RUNTIME_VERIFIED**, с заметкой об optional favicon404. Прежний browser/runtime UNVERIFIED закрыт для точного baseline archive `baselines-water-w04-dark-d01`. Это проверка локальной доставки обвязки и начальной загрузки сцен.

Own HEAD при старте `06c45e0273bf8c5f0d447e79aaeb86ba6429e2d4`, clean/WIP0; branch `codex/r4d-p5-regenerated-release-engineer-01`, host WIN-36E9FF9EJM0. Целевой PACKAGE_INDEX:10627 bytes/SHA256 `ff6e0284bf1217a02f6fcb0a184e7026cd07d1de0eac3b0167c1d3e2b20fbfe5`, public43files/27415220bytes.

Разрешённый root заранее разрешён абсолютным путём и проверен по whitelist/hashes/read-only: `E:/R4D/perspective/p5-runtime/release-engineer/transfer-water-dark/builds/baselines-water-w04-dark-d01/public`. Один own server bind127.0.0.1:6846, PID13256/session98621, parent33624, `D:/python310/python.exe`, user user; root/helper ACL owner BUILTIN/Administrators. Private sidecars вне serving root, handler обслуживал только exact43 whitelist.

В собственной hidden IAB tab2 реально открыты root → Water w04 → browser Back → root → Dark d01 → Back → root. Root показывает архив исходных вариантов, ожидаемые исправления и отсутствие final/publication. Оба metadata details раскрылись: доступны commits, FILE_INDEX hashes, Water open findings и Dark pending/floor limits. Версии выбирались из своих карточек. Возврат проверен через browser Back; отдельного on-page Back в frozen child pages нет.

| Scene | Actual browser HTTP200 | PNG реально загружены | Initial canvas |
|---|---:|---:|---|
| Water w04 nested root | 19 | 9 | Отрисован, coverage9/21 +4/4cups |
| Dark d01 nested root | 18 | 8 | Отрисован, coverage12/24 +4/4cups |

Обе сцены остались на начальном paused seed0/tick0. Native state/seed/art matrix не повторялась; кнопки throw/replay/step/export не нажимались. Canvas/assets/config/JS/CSS во вложенных roots загрузились; console warn/error captures пусты, CORS errors не наблюдались. Browser log40requests:39×200, единственный404 — автоматический optional `/favicon.ico`, отсутствующий в whitelist. Этот cosmetic запрос оставлен явной заметкой; required payload failures0. Дополнительные direct-loopback HTTP GET всех43files совпали по bytes/SHA:27415220bytes. Три намеренных private-exclusion probes `/PACKAGE_INDEX.json`, `/private/package-descriptor.json`, `/private/qa/water/w04/technical.md` получили ожидаемые404; это отдельные проверки serving boundary.

Native JPEG1265×712 captures сохранены без crop/reencode: [root](E:/R4D/perspective/p5-runtime/release-engineer/transfer-water-dark/output/browser-003/01-root.jpg), [metadata](E:/R4D/perspective/p5-runtime/release-engineer/transfer-water-dark/output/browser-003/03-both-metadata.jpg), [Water](E:/R4D/perspective/p5-runtime/release-engineer/transfer-water-dark/output/browser-003/05-water-ready.jpg), [Dark](E:/R4D/perspective/p5-runtime/release-engineer/transfer-water-dark/output/browser-003/08-dark-ready.jpg). AX snapshots, console, browser-only HTTP log и full43 identity evidence находятся в own output/browser-003. 25evidence files/452486bytes; exact index `output/EVIDENCE_INDEX_003.json` и source `EVIDENCE_PINS_003.json`: 14274bytes/SHA256 `df88b8a5c94b55d0ce4f0b9f8ce45165e536dd01990598f8de5beb8ae8bbe23b`.

Own tab закрыта. Non-tty stdin сервера оказался closed, поэтому STOP не доставлен. Перед Ctrl+C отдельно подтверждена console только own server/parent/helper; CTRL_C_EVENT вызвал штатный Python finally/OWN_SERVER_STOPPED. Session exit1 — ожидаемый KeyboardInterrupt, не abrupt kill. Stop record02:22:35.751Z; PID13256 absent и listener6846 absent подтверждены02:23:04.557Z. Чужие процессы/Builder55192/55193 не трогались.

Original Water/Dark receipts, первый draft и archive PACKAGE_INDEX совпали с прежними pins;43 hashes/7staticrelative refs повторно проверены. Все prior material/build files read-only. Wrapper source/art/candidate bytes не менялись, новый build не потребовался. Frozen PACKAGE_INDEX сохраняет историческое UNVERIFIED-at-build-time; текущая scoped closure приложена отдельным evidence, без изменения baseline.

Fresh before server02:15:58.966Z: RAMfree9.171GiB, CPU5%, aggregate10.667%, aggregateWS28.458GiB, C/D/E13.688/14.609/9.043GiB. Own estimate1GiBRAM/.05GiBE, reserve4GiBRAM/2GiBE; peak не инструментирован. After02:23:07.603Z: RAMfree9.085GiB, CPU4%, aggregate4.542%, aggregateWS28.374GiB, C/D/E13.647/14.609/9.039GiB. Первый clixml aggregate включал Idle; corrected fresh JSON перед server это явно уточняет. Server TEMP/TMP и evidence/helper/output находятся в own E; globals/settings/security/credentials/CODEX_HOME не менялись.

W04-V01/W04-TQA-V01, original B01 и known Dark floor limitations сохранены; smoke не назначает новый art/physics PASS. w05/d02/current QA batch не читались и не принимались. final=false, FullArt/Water/Dark/P5PASS=false, TokenGranted=false, Review/VPSwrites0. SSH/Review/VPS/file:// и прежние publish scripts не использовались. Нового policy denial не было; отмеченные favicon/STDIN/tooling случаи — ordinary local failures. Все сообщения только в own chat.
