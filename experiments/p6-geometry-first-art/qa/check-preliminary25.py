"""Independent frozen-byte, P1 registration, actual-IAB and alpha checks.

Reads only authorized public candidate copies and this QA's retained oracle.
Does not import Builder QA output or run a new native simulation.
"""
import argparse
import hashlib
import json
import math
import struct
import urllib.request
from urllib.parse import quote
from collections import Counter, deque
from pathlib import Path
from PIL import Image, ImageChops, ImageDraw, ImageFilter

p = argparse.ArgumentParser()
p.add_argument('--runtime', required=True)
p.add_argument('--verify-live', action='store_true')
args = p.parse_args()
rt = Path(args.runtime)
root = rt / 'consumer/integration-04-preliminary25'
served = root / 'served'
browser = rt / 'preliminary25-browser'
out = Path(__file__).parent / 'integration-04-preliminary25'
out.mkdir(exist_ok=True)

def read(p):
    return json.loads(p.read_bytes())

def sha(b):
    return hashlib.sha256(b).hexdigest()

def save(p, data):
    p.write_bytes((json.dumps(data, ensure_ascii=False, indent=2) + '\n').encode('utf8'))

def dist(a, b):
    return math.hypot(a[0] - b[0], a[1] - b[1])

def project(matrix, point):
    x, y = point
    w = matrix[2][0] * x + matrix[2][1] * y + matrix[2][2]
    return [(matrix[0][0] * x + matrix[0][1] * y + matrix[0][2]) / w,
            (matrix[1][0] * x + matrix[1][1] * y + matrix[1][2]) / w]

def f32(n):
    return struct.unpack('f', struct.pack('f', n))[0]

invbytes = (root / 'inventory.bin').read_bytes()
assert sha(invbytes) == 'efa9ad5d74025c5893178a62a5da7ad4601bbbbc44fbef5d5b27914b402ad833'
inv = json.loads(invbytes)
assert len(inv['files']) == 74 and inv['totalBytes'] == 23530619
for item in inv['files']:
    b = (served / item['path']).read_bytes()
    assert len(b) == item['bytes'] and sha(b) == item['sha256'], item['path']
if args.verify_live:
    live = Path('E:/R4D/perspective/p6-runtime/builder/candidates/integration-04-preliminary25/site')
    before = (live.parent / 'freeze-inventory.json').read_bytes()
    assert before == invbytes
    for item in inv['files']:
        disk = (live / item['path']).read_bytes()
        with urllib.request.urlopen('http://127.0.0.1:41770/' + quote(item['path']), timeout=15) as response:
            http = response.read()
        assert disk == http == (served / item['path']).read_bytes(), item['path']
        assert len(http) == item['bytes'] and sha(http) == item['sha256']
    assert (live.parent / 'freeze-inventory.json').read_bytes() == before
    save(out / 'closing-byte-validation.json', {'sourceCommit': '7a4450a8c2edc20880b3d300abc1d51187005479',
        'inventorySha256': sha(invbytes), 'files': 74, 'bytes': 23530619,
        'all74DiskHttpAndOriginalQaCopyStillEqual': True, 'inventoryStableAcrossClosingRead': True})
meta = read(served / 'build-meta.json')
assert meta['consumerSha256'] == 'efaff71843b69a415b3dc755586c459ba6d7e146675fde441aa82b4123cff741'
assert meta['coreSha256'] == '8843446996582eaccbd9ff63d3147d74b7eca9a614d8e0df16851d1d89d46f50'
for name in ['config.json', 'manifest.json']:
    assert (served / name).read_bytes() == (rt / 'inputs/common' / name).read_bytes()
assert (root / 'source/viewer/controller.mjs').read_bytes() == (rt / 'consumer/integration-03-ui-fix-01/source/viewer/controller.mjs').read_bytes()
cfg = read(rt / 'inputs/common/config.json')
manifest = read(rt / 'inputs/common/manifest.json')
M = manifest['projection']['nativeToSource']
P = lambda point: project(M, point)
pins = {pin['id']: pin for pin in cfg['board']['pins']}
artist = read(served / 'artist.json')
placements = artist['preliminary25Source']['placements']
bodies = [layer for layer in artist['layers'] if layer['role'] == 'body']
assert len(artist['layers']) == 27 and len(bodies) == 25 and len(placements) == 25
assert Counter(layer['objectId'] for layer in bodies) == Counter(pins.keys())
assert Counter(x['id'] for x in placements) == Counter(pins.keys())
masters_packet = read(root / 'source-inputs/OBSTACLE_MASTERS_V01.json')
wood = read(root / 'source-inputs/WOOD_PACKET_V02.json')
input_refs = []
for commit, filename, expected in [
    ('a6d0493383f55ffcfc2de966d15c79bcd3c088bd', 'OBSTACLE_MASTERS_V01.json', 'ce9843e959004ecd668a82d27d7862398cfbfc4315d4d0a4564b6f121f4f76d1'),
    ('0c3a6b7ae6916262b061234d8e6f5a7a9aa0f3b9', 'WOOD_PACKET_V02.json', '73523d0669c3f4121161a2dced82587bdcf6f467d9de9986cb7610b7bd8ea49a'),
    ('2467aced9c8c7a90fb567d368eee865ac931d922', 'SPRITE_PACKET_V03.json', '93d84435979c1df900abfb1ec5aca69967823b7f8255fc69cde644d68709bda1'),
    ('e805089167c4d2ec98ff0409b818b5016550e59e', 'FLOOR_PACKET_V02.json', '4b00ca7fd9aed2254db66897b3b8a9c8f90c8f415f4d8db53ba233da0b5a24be')]:
    raw = (root / 'source-inputs' / filename).read_bytes()
    assert sha(raw) == expected
    input_refs.append({'commit': commit, 'packet': filename, 'sha256': expected, 'bytes': len(raw)})
floor_packet = read(root / 'source-inputs/FLOOR_PACKET_V02.json')
assert sha((root / 'source-inputs/floor-material-v02.png').read_bytes()) == floor_packet['materialRawSha256']
assert not floor_packet['floorContainsBakedShadows']
contract_sha = sha((Path(__file__).parent / 'state-contract.json').read_bytes())
assert contract_sha == 'b9b303c8ef05245b88d2d1e09f4cdfc165048bde112a4f06319c4bdb383a1fb7'
masters = {m['family']: m for m in masters_packet['masters'] if m['family'] != 'wood'}
masters['wood'] = {**wood, 'groundEllipseRadiusPx': [wood['baseEllipse']['radiusXPx'], wood['baseEllipse']['radiusYPx']]}
asset_checks = []
for family, master in masters.items():
    raw = (served / 'artist' / master['texture']).read_bytes()
    assert sha(raw) == master['sha256']
    im = Image.open(served / 'artist' / master['texture'])
    assert im.mode == 'RGBA' and list(im.size) == master['canvas']
    assert not master['bakedGroundShadow']
    asset_checks.append({'family': family, 'texture': master['texture'], 'sha256': sha(raw), 'canvas': im.size})

registration = []
for placement in placements:
    pin = pins[placement['id']]
    layer = next(x for x in bodies if x['objectId'] == pin['id'])
    master = masters[placement['family']]
    native = [pin['x'], pin['y']]
    assert placement['nativeBase'] == native == layer['nativeBase']
    assert placement['nativeRadius'] == pin['r'] == layer['nativeRadius']
    assert placement['sourceAnchor'] == master['groundAnchorPx']
    assert placement['sourceCanvas'] == master['canvas']
    assert layer['texture'] == master['texture'] and layer['rect'] == placement['rect']
    center = P(native)
    radius = dist(P([pin['x'] - pin['r'], pin['y']]), P([pin['x'] + pin['r'], pin['y']])) / 2
    scale = radius / master['groundEllipseRadiusPx'][0]
    x, y, w, h = layer['rect']
    actual_anchor = [x + master['groundAnchorPx'][0] * w / master['canvas'][0],
                     y + master['groundAnchorPx'][1] * h / master['canvas'][1]]
    assert dist(actual_anchor, center) < 1e-9
    assert abs(w / master['canvas'][0] - scale) < 1e-12
    assert abs(h / master['canvas'][1] - scale) < 1e-12
    assert dist(placement['centerSource'], center) < 1e-9
    # This is an approximation measurement, never a replacement collider or art gate.
    rx = radius
    ry = scale * master['groundEllipseRadiusPx'][1]
    ellipse = [[center[0] + rx * math.cos(i * math.tau / 1024), center[1] + ry * math.sin(i * math.tau / 1024)] for i in range(1024)]
    contour = [P([pin['x'] + pin['r'] * math.cos(i * math.tau / 128), pin['y'] + pin['r'] * math.sin(i * math.tau / 128)]) for i in range(128)]
    residual = max(min(dist(a, b) for b in ellipse) for a in contour)
    registration.append({'id': pin['id'], 'family': placement['family'], 'nativeBase': native,
                         'nativeRadius': pin['r'], 'projectedCenter': center, 'sourceAnchorErrorPx': dist(actual_anchor, center),
                         'uniformScale': scale, 'projectedHorizontalRadius': radius,
                         'assetEllipseVsTrueProjectedCircleSampleMaxNearestPx': residual})

shadow_layers = [x for x in artist['layers'] if x['role'] == 'ground-shadow']
assert len(shadow_layers) == 1 and len(artist['shadows']) == 25
assert Counter(shadow_layers[0]['coveredObjectIds']) == Counter(pins.keys())
assert shadow_layers[0]['texture'] == 'prepared/ground-shadows-v01.png'
assert shadow_layers[0]['opacity'] == 1 and shadow_layers[0]['perInstanceOpacityBaked'] == .42
for ident in pins:
    assert artist['shadows'][ident] == {'kind': 'precomposed', 'layerId': 'actual-static-shadows25', 'singleSource': True}
assert [x['texture'] for x in artist['layers'] if x['role'] == 'background'] == ['prepared/floor-layer-v02.png']
assert not artist['consumerTrialOverrides']
assert artist['ball']['liftRadiusFactor'] == 1
assert artist['ball']['shadow']['opacity'] == .6
assert artist['ball']['shadow']['maskTexture'] == 'prepared/floor-mask-v01.png'

floor = Image.open(served / 'artist/prepared/floor-layer-v02.png').convert('RGBA')
mask = Image.open(served / 'artist/prepared/floor-mask-v01.png').convert('RGBA')
shadows = Image.open(served / 'artist/prepared/ground-shadows-v01.png').convert('RGBA')
alpha = floor.getchannel('A')
mask_alpha = mask.getchannel('A')
assert ImageChops.difference(alpha, mask_alpha).getbbox() is None
assert ImageChops.difference(alpha, Image.open(served / 'artist/prepared/floor-layer-v01.png').getchannel('A')).getbbox() is None
polygon = [P(p) for p in manifest['projection']['playableFloorNativePolygon']]
expected = Image.new('L', floor.size)
ImageDraw.Draw(expected).polygon(polygon, fill=255)
inner = expected.filter(ImageFilter.MinFilter(7))
outer = expected.filter(ImageFilter.MaxFilter(7))
ab, ib, ob = alpha.tobytes(), inner.tobytes(), outer.tobytes()
holes = sum(1 for a, i in zip(ab, ib) if i == 255 and a != 255)
spill = sum(1 for a, o in zip(ab, ob) if o == 0 and a != 0)
assert holes == 0 and spill == 0  # A 3px boundary band isolates antialias rasterization.
assert all(alpha.getpixel(tuple(round(v) for v in P([p['x'], p['y']]))) == 255 for p in pins.values())

# Independent connected-component evidence for the precomposed 25-shadow image.
# The threshold is diagnostic; it does not impose an artistic opacity target.
sw, sh = shadows.size
sb = shadows.getchannel('A').tobytes()
seen = bytearray(1 if x >= 16 else 0 for x in sb)
components = []
for start in range(len(seen)):
    if not seen[start]:
        continue
    seen[start] = 0
    q = deque([start])
    count = total_x = total_y = 0
    while q:
        at = q.popleft()
        y, x = divmod(at, sw)
        count += 1
        total_x += x
        total_y += y
        for xx, yy in [(x-1,y),(x+1,y),(x,y-1),(x,y+1),(x-1,y-1),(x+1,y-1),(x-1,y+1),(x+1,y+1)]:
            if 0 <= xx < sw and 0 <= yy < sh:
                nxt = yy * sw + xx
                if seen[nxt]:
                    seen[nxt] = 0
                    q.append(nxt)
    if count >= 20:
        center = [total_x / count, total_y / count]
        nearest = min(registration, key=lambda r: dist(center, r['projectedCenter']))
        components.append({'pixelsAlphaAtLeast16': count, 'centroid': center, 'nearestPin': nearest['id']})
assert len(components) == 25 and Counter(c['nearestPin'] for c in components) == Counter(pins.keys())

oracles = {n: read(rt / f'oracle/seed-{n}.json') for n in range(3)}
samples = read(browser / 'actual-ui.json') + read(browser / 'frames.json')
sample_checks = []
for sample in samples:
    s, m = sample['state'], sample['metrics']
    if sample['label'].startswith('frame-'):
        assert sample['viewport'] == {'width': 1536, 'height': 1536, 'dpr': 1}
        assert Image.open(browser / (sample['label'] + '.jpg')).size == (1536, 1536)
    seed, tick = m['seed'], s['tick']
    oracle = oracles[seed]
    assert s == oracle['states'][tick], sample['label']
    if 'replay' in sample:
        events = [e for e in oracle['events'] if e['tick'] + (e['type'] == 'object_hit') <= tick]
        assert sample['replay']['events'] == events, sample['label']
        assert sample['replay']['eventStateTicks'] == [e['tick'] + (e['type'] == 'object_hit') for e in events]
        assert sample['replay']['state'] == s
    assert not sample.get('error')
    assert not m['sphereBodyMasked'] and not m['sceneMasked'] and not m['geometryMasked']
    assert m['shadow']['maskActive'] == m['artVisible']
    assert m['shadow']['opacity'] == .6
    assert m['staticShadowDrawLayers'] == 1 and m['groundLayers'] == 2
    assert Counter(m['staticShadowCoveredObjectIds']) == Counter(pins.keys())
    assert len(m['objectLayers']) == 25 and m['registrationGuideCount'] == 25
    native = [s['ball']['pos']['x'], s['ball']['pos']['y']]
    center = P(native)
    radius = dist(P([native[0]-16, native[1]]), P([native[0]+16, native[1]])) / 2
    expected_ball = native if m['view'] == 'flat' else [center[0], center[1] - radius]
    assert dist(expected_ball, m['ball']['center']) < 1e-9
    assert abs(m['ball']['scale'][0] * 428 - (16 if m['view'] == 'flat' else radius)) < 1e-10
    assert m['ball']['scale'][0] == m['ball']['scale'][1]
    first_native = [native[0] - 6 - 885.5 * 22 / 312, native[1] + 10 - 442 * 22 / 312]
    first = first_native if m['view'] == 'flat' else P(first_native)
    assert [f32(v) for v in first] == m['shadow']['firstGroundVertexSource']
    for body in m['objectLayers']:
        pin = pins[body['objectId']]
        assert body['nativeBase'] == [pin['x'], pin['y']] and body['nativeRadius'] == pin['r']
        assert body['aboveBall'] == (native[1] < pin['y'])
        if m['view'] == 'source':
            assert body['actualPosition'] == body['rect'][:2] and body['actualDimensions'] == body['rect'][2:]
    sample_checks.append({'label': sample['label'], 'seed': seed, 'tick': tick, 'rngU32': s['rngU32'],
                          'nativeStateEqual': True, 'eventsEqual': 'replay' in sample, 'view': m['view'],
                          'artVisible': m['artVisible'], 'geometryVisible': m['geometryVisible'],
                          'maskActive': m['shadow']['maskActive']})

ui = {s['label']: s for s in read(browser / 'actual-ui.json')}
first, second = ui['live-typed95-first'], ui['live-typed95-redraw']
assert first['state']['tick'] < second['state']['tick']
assert first['controls']['tick'] == second['controls']['tick'] == '95'
assert not first['controls']['paused'] and not second['controls']['paused']
assert ui['live-seek-paused95']['state']['tick'] == 95 and ui['live-seek-paused95']['controls']['paused']
assert ui['step10-to105']['state']['tick'] == 105
assert ui['next-contact95']['state'] == ui['api-replay-real-import95']['state'] == ui['seed0-t0095']['state']
assert not read(browser / 'console.json')
assert not read(browser / 'frame-console.json')

pixels = {'floorMaskAlphaEqualAllPixels': True, 'oldFloorAlphaEqualAllPixels': True,
          'pixelsCompared': floor.width * floor.height, 'independentP1PolygonBoundaryBandPx': 3,
          'opaqueInteriorHolesBeyondBoundaryBand': holes, 'nonzeroSpillBeyondBoundaryBand': spill,
          'all25PinCentersOpaque': True, 'staticShadowAlphaMax': shadows.getchannel('A').getextrema()[1],
          'staticShadowComponentsAtAlpha16AndArea20': components,
          'componentsAreDiagnosticNotAnArtGate': True}
save(out / 'pixel-check.json', pixels)
report = {'scope': 'Preliminary25 integration only; no final-scene, motion or art acceptance',
          'sourceCommit': '7a4450a8c2edc20880b3d300abc1d51187005479', 'url': 'http://127.0.0.1:41770/',
          'inventorySha256': sha(invbytes), 'filesListSha256': '15c5a2308a78a29d7df7e3aac781aadb45642320c14d93aaedf3772e238813df',
          'files': len(inv['files']), 'bytes': inv['totalBytes'], 'consumerSha256': meta['consumerSha256'],
          'coreSha256': meta['coreSha256'], 'controllerSha256': sha((root / 'source/viewer/controller.mjs').read_bytes()),
          'unchangedController': True, 'newIndependentFullNativeOracleRun': False,
          'stateContractSha256': contract_sha, 'inputs': input_refs,
          'oracle': 'QA retained independent native seeds0/1/2, not Builder frames/QA artifacts',
          'actualIabSnapshotsCompared': len(samples), 'samples': sample_checks, 'assets': asset_checks,
          'familyCounts': dict(Counter(x['family'] for x in placements)), 'registration': registration,
          'maxAnchorErrorPx': max(r['sourceAnchorErrorPx'] for r in registration),
          'oneStaticShadowDrawLayerCovers25UniqueIds': True, 'sourceGeometryPathUnmasked': True,
          'nativeStateAndPrngPreservedByViewToggles': True,
          'liveTickEdit': {'firstTick': first['state']['tick'], 'secondTick': second['state']['tick'], 'inputHeld': '95', 'seekPausedAt': 95},
          'apiReplayImportEqual': True, 'consoleWarningsOrErrors': [],
          'saveReplayDownloadButtonTested': False, 'downloadOperationRetried': False,
          'limitations': ['Boundary and receiver art absent; surrounding scene unfinished.',
                          'Approximate master ellipses are not physical circles or replacement colliders.',
                          'Selected still frames do not constitute continuous-motion/art acceptance.',
                          'Save replay download remains unverified after the previously stopped operation.']}
save(out / 'check.json', report)
(out / 'frozen-inventory.source.bin').write_bytes(invbytes)
save(out / 'actual-ui.json', read(browser / 'actual-ui.json'))
save(out / 'frames.json', read(browser / 'frames.json'))
save(out / 'byte-validation.json', read(root / 'byte-validation.json'))
print(json.dumps({'snapshots': len(samples), 'maxAnchorErrorPx': report['maxAnchorErrorPx'], 'floorAlphaEqual': True,
                  'floorInteriorHoles': holes, 'floorSpill': spill, 'shadowComponents': len(components),
                  'componentPinIds': [c['nearestPin'] for c in components], 'newIndependentOracleRun': False}))
