# P2 candidate04 — checkpoint сериализации доставки

**PUBLIC_P1_STATIC_PRIORITY — 2026-10-28 после outage.** Max12:36UTC разрешил продолжение P2/P4 кроме UGH; Max12:38UTC отдельно поручил static report принятого P1 exact4b47 для показа Славе. CTO передал эти команды. `superflight.space`/Review теперь PUBLIC; закрытый portal=`sf.superflight.space`. Все protected intents01/02, snippets/templates/guards/rollback ниже являются историей и не допускаются к новому release. P2candidate04 не опубликован, нового token нет, server_write=false.

Lead фактически возобновлён turn `01a1829b-1678-7c81-a99c-3664bcf99c88`, проверил clean `29530fcf45d827099d373bb4be3fe232f9903ac1`. Builder actual turn `01a1829b-0da3-7913-bbdb-3bd738d0c0f7` уже получил начальное задание CTO; Lead не дублирует его. Сначала PUBLIC read-only baseline + accepted-P1 image/recipe inventory; затем HTML/CSS/figures без JS/core/maps/private logs/full source. Direct/inverse figures exact accepted4b47 найдены для всех четырёх досок; floor inverse не true3Dtop-down. Existing TQA/VQA получают named exact candidate и ограниченную static QA. Новая отдельная публикация P1 — только exact PUBLIC intent/Lead gate/новый single CTO token/actual HTTP200+view checks. Route `p1-mapping-report` пока предложение, не готовый URL.

Frozen P2source04/df309/manifest остаются без rebuild/reQA. Не готовить ещё один полный04 intent до P1: после P1 изменится catalog baseline. После P1resume — новый PUBLIC04 intent от фактической новой базы. См. актуальный верхний раздел [канонического состояния](../../docs/PERSPECTIVE_RESEARCH_STATE.md).

## История прежнего protected delivery-unlock


**DELIVERY_UNLOCK_RECEIVED — 2026-10-28T07:47:59Z.** CTO явно освободил P3 token после его delivery/postchecks/docs. Новый04 token не выдан; P2 server_write=false. Lead сверил clean51bcac9738ab6ba36d5ddca2764615473b456e31 и неизменный manifest04. Тот же Builder адресно возобновлён изc4a4b7f…, новый actual turn `01a1817f-0730-7e41-8f75-c9f492480f2b`; первый проверочный вызов `exec-bbe49079-001a-4cb4-8a24-3d3ee06d905d` completed. Выполняется только новый coherent read-only actual baseline и один LOCAL intent04-final-02, если каталог свободен. Ниже сохранена история ожидания/obsolete01; она не является новым блокирующим Max-start. Source/frozen04 и независимую QA не повторять; всех non-P2/P3 bytes касается только opaque preservation. Указанный CTO последний root/manifest/snippet — указатель, не future guard.

## Исторический checkpoint ожидания освобождения окна

**WAIT_SHARED_P3_TOKEN_RELEASE. Candidate04 не опубликован.** CTO выдал эксклюзивное окно доставки P3; выдача токена не подтверждает состоявшийся switch. Это сериализация доставки, не новая продуктовая пауза Max. У P2 нет нового release token, server writes/reload/rollback отсутствуют. Source и независимая QA сохраняют силу; новый общий старт Max не требуется.

Сохранено в `E:/R4D/perspective/p2-worktrees/lead`, branch `codex/r4d-p2-free-lead-01`; до этого checkpoint HEAD `a3871c71b54600ba79c3dee7fa82bd21649e7a31`, status clean.

- Implementation `0a80b0b63c688b6f77b8f710576adf2ea5c263c1`, actual build HEAD `08f9b9eaa6aa1063eb7fcd9cf373ddacf907725a`.
- Frozen artifact `E:/R4D/perspective/p2-runtime/output/p2-jungle-static-candidate-04`:16 files/2452021 bytes; tree `60d216a64c86fed4b83f4ed3802e3d1393cdda2db8776818d22710173dc2ffed`; BUILD_MANIFEST `60f79d1bdad8d3737376952043013394bb3098de6b15200fc5c352dd875dd1f7`.
- Independent [TQA04](qa/technical/candidate-04-REPORT.md), commit `df30939444dfc3875fe1f0fc39b31a4621be1d28`: offline-инварианты подтверждены, новых code blockers в проверенной области нет. Evidence249046 bytes SHA256 `3e216f15232893321bda29f1fa40a47a8dafaf0e51179e41777e22958b0b3410`. UI/Pixi/DOM/wall-time/Android/scene остаются непроверенными; полного Technical/art PASS нет.

Builder подтвердил: собственная уже начатая локальная session81920 завершилась exit0,18-member archive согласован. Последний наблюдавшийся delivery baseline был03 в06:49:29UTC; P3 switch этим не устанавливается. Root независимо зафиксировал наличие draft и hashes, но не продолжает его release-review/упаковку.

**Исторический draft — obsolete03, не ready и не для token request:** `E:/R4D/perspective/p2-runtime/output/p2-review-release-intent-04-final-01`. RELEASE_INTENT SHA256 `d6f29f9c5968d9d3c0b8f779cfd699be8aa36985d1029141082cf3edb9319cf9`; archive SHA256 `5872f17ea4014cade760c4f76ccbeaa1e8df4449159d2e7deb4a2fa36ed542b8`. Существующие intent/archive/baseline/QA/checks не удалять и не перезаписывать; disposition сохраняется отдельным sidecar и рабочим checkpoint Builder. Полную упаковку и baseline polls не продолжать до явного освобождения P3 token CTO.

После **явного сообщения CTO об освобождении P3 token** Lead адресно поручает тому же Builder новый read-only coherent снимок фактического root/manifest/catalog/file hashes/modes и absent targets. Все P3 bytes сохранять как opaque delivery baseline, не изучая код, арт или выводы. Затем один свежий exact LOCAL intent04 в новом каталоге, например `p2-review-release-intent-04-final-02`, если свободен. Старый03 draft/token не использовать. При drift остановить именно этот intent; frozen04 не пересобирать, старую QA-матрицу не повторять. Server writes только после нового точного Lead gate и нового single CTO token.

Финальный ACK Builder: checkpoint `c4a4b7f330639872e5a5c2ed7fc26d2eceffabb8` pushed, status idle; собственных процессов/exec sessions нет. Raw intent/archive/baseline/QA/checks не переписаны. Obsolete disposition сохранён отдельным `SERIALIZATION_STATUS.json`, в BSTATE и checkpoint MD; дальнейшие baseline reads/упаковки/server actions остановлены до адресного delivery-unlock.

У Lead нет активных server/PID/exec sessions или browser tabs; текущая работа — только этот локальный checkpoint. TQA завершила проверку; Visual QA и Artist не пробуждались ради формального ACK. Immutable/raw assets и старые кандидаты сохранены. P2 не закрыт, slot1 остаётся занят. Старые launcher/file/security ограничения и ресурсное правило4/2GiB остаются действующими.
