# P5 DARK — consumer contract, generation baseline

Владелец Builder. Source consumer recipe: af23e124cf5bd1d9de884082ffbc993448217112; Jungle RESULT df0d95f40e60991632c885f0bc53d32497a090e7 сохраняет PARTIAL/UNVERIFIED. Это применение sprite/parts/generated-floor-clip метода на новом input, не новый алгоритм сортировки.

## Exact входы и targets

Board 02, trial-01, accepted P1 4b47db04c7140ebf88f69b91faa0b790d46f22ec. Config SHA256 14be2a023833d266d1e333bf582af5fd5885deb445698c10ebd846ef0cc080b2; manifest SHA256 3fab422bd1f74d477d1648620c97ad6d7b8b0a55a70a1102d6e6885def564d81; source JPEG SHA256 7ceff71bd0a871fecd725527dff5522450c8e75a74eb99c107b5d8624bf8fa3a, read-only. public/data/targets.json — вычисленные native/source anchors, реальные circles/segment loops, geometryRefs и art assemblies; public/data/input-verification.json — exact byte pins. 24 art object groups, 24 physical object targets, 4 receivers. Dark: circle bases плюс segment loops pillar/block; фронт/бок/грани/углы проверяются actual frames.

## Координаты и привязка

Native — exact config, translation уже применена: [33307,33912]. Не прибавлять её повторно. Source —1536×1536, exact per-board nativeToSource/sourceToNative из P1 manifest; texture — непрорезанный PNG, origin left/top. Viewport — CSS contain scale, DPR только backing resolution. Ни viewport, ни Art/Geometry не меняют native state/RNG.

Target-bound placement: s = target.sourcePx.footprintWidth / texture.footprintPx.width; pixel p отображается sourceAnchor + (p-groundAnchorPx)*s, uniform XY. Footprint — опора на плоскости, не alpha bbox/крона/тень. Depth residual сохраняется как измерение, не скрывается XY warp/rotation/instance offset. Circle targets используют exact native center/radius. Segment-loop anchor — area centroid неизменённого accepted native loop; depthRadius=half native Y extent только для part sorting, НЕ физический круг. Arch assembly anchor — center aggregate foot bounds для регистрации полного арта; disconnected groundLoops не становятся solid polygon/collider. Можно связать отдельные post parts с foot targets или полный набор частей с assembly; объяснить выбор.

$ball использует live native state.ball.pos и r16. Его масштаб = projected horizontal r16 diameter / authored footprint width; отдельные generated ball/shadow, sphereVisualCenterPx и groundAnchor измерить по НОВОМУ арту. $source — square generated floor с anchor[0,0] и footprint=size; square равномерно масштабируется до1536. Original crops только refs, не финальные cutouts. Jungle PNG не финальные assets новых досок.

## Manifest, alpha, parts, provenance

Schema asset-manifest.schema.json совместима с r4d.p5.assets/1; numeric example — example-not-renderable, НЕ реальные art/pins. Каждый PNG: exact SHA256/bytes/size, straight RGBA, alpha bounds>0 и visibleBounds>=16, half-open[x,y,w,h], texture-local groundAnchor и footprint center совпадают. Full opaque generated floor допустим. No auto trim/premultiply/matte. File paths relative к manifest либо explicit own Artist E final path. Все raw→candidate→selected связи, реальные prompts/tool IDs, corrections и limitations сохранены; alias не новая генерация.

Каждый instance: exact targetId,textureId,parentId,role,depthOffsetRadii[-1,1],depthReason. Circle depth=nativeY+radius*offset; polygon/assembly depth=nativeAnchorY+depthRadius*offset. Это part depth, НЕ изменение координат изображения. Shadows ниже solids; floor ниже всего; foreground $source только объявленные передние части. Stable instance ID tie-break. Center sort не объявляется достаточным: arch posts/lintel/opening, боковые грани, окружение и front rim передавать parts и проверять в actual frames. Изменение принципа сортировки — отдельный variant ПОСЛЕ сохранения baseline.

sourceClipPx optional для scene-region-from-generated-floor: source1536 polygon, provenance(sourceTextureId/sourceSha256/note), limitations, parentId exact floor instance с той же texture. Только role foreground,targetId $source,depthOffsetRadii0. Маска и sprite внутри Art tree, Geometry sibling выше. Контур следует реальной закрывающей части НОВОГО generated floor, не открытой плоскости/полной стене и не seed/tick hole. Поднятые части растений/rail/supports не исключаются из задачи; coarse/unverified границы обозначить.

## Receiver policy по новым измерениям

Для НОВОГО ball измерить L=groundAnchorY-sphereVisualCenterY в ball texture px. Для каждого receiver измерить opticalOpeningPointPx O и footprint width native trigger внутри aperture. При sB=projected ball diameter/ball footprint width и sR=projected bucket diameter/receiver footprint width, hR=L*sB/sR; logical A=[O.x,O.y+hR]. GroundAnchor и footprint.center оба A, optical O отдельно; back/front registration одинаковая, raw pixels не меняются. Политика едина для всех receivers, но выводится из этих art+projection; Jungle17.8px не константа. Сохранить измерения/calculation/limitations; explicit common visual cup shift, без hidden offset/sink/fade/seed condition. Native trigger/start не менять. После IN_BUCKET искусственного sinking нет.

## Первый handoff и реальная проверка

Не ждать fullset: новый generated floor + несколько разных элементов + ball/shadow + необходимые arch/front/environment parts. Coverage отсутствующих targets явно partial, geometry diagnostic. Передать Lead commit/manifestSHA/bytes/paths; Builder соберёт отдельный frozen w01/d01. Нужны реальные native/Pixi motion, pause/replay/+1, ArtOff/Geometry, обычные сохранённые seeds и соседние точные frames. Проверить фронт/бок/углы polygon obstacles, walls и receiver front-rim. LOST сохранять; недоступное/unverified назвать. Serverwrites0,tokenGranted=false до отдельного CTO token.
