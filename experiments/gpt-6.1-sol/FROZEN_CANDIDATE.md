# Замороженный кандидат 1

Заморожен Lead 2026-10-22 23:27:16 UTC, до независимых QA.

SHA-256: `09062f579e78b0ca74a348fe7d1087a38c79fc3699cd4a5125041f48a3a25458`.
Область: 69 файлов — package.json, package-lock.json, index.html,
vite.config.js, README.md и все файлы внутри src/, tests/, assets/, dist/.
Отчёты, рабочий учёт, доказательства QA и node_modules не входят.

Алгоритм: отсортировать файлы по полному пути PowerShell Sort-Object FullName;
для каждого взять относительный путь с `/`, пробел и lowercase SHA-256 байтов
файла. Объединить строки LF без конечного LF; SHA-256 от UTF-8 этих строк.

Опорные хеши:

- src/main.js: `5e2c5544007cbb7d11decf04ef3c020dfff593f4519e494994517c6e5672a3a3`
- src/motion.js: `5a4e0c8829d76c9292d0593e5d10cff2a78b67380e9594f7e7236478bcecd32e`
- assets/manifest.json: `0733eee29f651f429bbe9fc9c258a7946ff9154f6babc2742618200db4188e3c`
- dist/assets/index-D3pW4mPu.js: `7c41fa9baf951adedcc2065d475f548ddd0ba6a6608d807b331e00790e6e7c7a`

Проверяем production preview: http://127.0.0.1:4176/.
Запущен Builder: exec session31160, PID108292, `vite preview --host 127.0.0.1`.
После заморозки продукт не редактируется. QA пишут только свои отчёты
и доказательства. Пересборка должна воспроизвести тот же хеш области.
