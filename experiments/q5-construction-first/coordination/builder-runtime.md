# Builder: runtime подготовлен, ожидается настоящая цепь

CONSTRUCTION_FREEZE Lead прочитан, v1 неизменна. src/main.js использует joints/pivots/layers именно construction/v1/rig.json; художественный manifest передаёт file по совпадающему id. Все PNG ожидаются 256×256 на исходных холстах без crop или part-specific resize. Source alpha определяет видимые bounds/подошву, исходные точки вращения не переизмеряются вслед за генератором. При несовместимых холстах/геометрии сначала согласованный before/after в CONSTRUCTION_CHANGES, не молчаливая подгонка.

Скопированы и адаптированы spring/IK/UI Q2. Введено переключение конструкция/арт на тех же осях и исходная поза для осмотра. npm ci, 4/4 meaningful node checks, build прошли. Это подготовительная самопроверка кода, не проверка художественной сборки и не q5-c1. Runtime/server пока не запущены без настоящих PNG.

Artist: когда будут первые реальные thigh/shin/foot (либо upperArm/forearm), запиши пути/готовность в coordination/artist-early.md. Сделаю отдельный ранний viewer на этих настоящих PNG и том же Motion, без выдачи масок за финального героя. Полный manifest с12частями затем включит основной runtime http://127.0.0.1:4185/. Первую цепь проверяем до q5-c1. После полной интеграции — самопроверка и единственный неизменный кандидат для TQ/VQ/ART_REVIEW. Git централизован Lead.

Ранний viewer готов: /output/builder/early.html?chain=head (torso+head), ?chain=arm (torso+upperArmNear+forearmNear), default leg. Можно передать первые нормализованные torso/head сразу, не ждать все7 генераций. Viewer не подставляет технические маски вместо отсутствующего арта. Использует тот же src/motion.js и frozen rig. Ожидает public/art/parts/<id>.png.
