"""Prepare local immutable P6 publication bytes. No SSH, install, build or QA.

Reads only the exact authorized P6 site, pinned input copies, approved comparison
input and integrity-pinned public dependency license archives. Writes own runtime.
"""
import base64
import datetime
import gzip
import hashlib
import html
import io
import json
import re
import shutil
import stat
import struct
import sys
import tarfile
import urllib.parse
import urllib.request
import zlib
from html.parser import HTMLParser
from pathlib import Path, PurePosixPath

CONTROL = Path(__file__).resolve().parent
RUNTIME = Path(r'E:\R4D\perspective\p6-runtime\release-engineer\phase-a-local-partial-01')
SITE = Path(r'E:\R4D\perspective\p6-runtime\builder\candidates\integration-07-full-world\site')
COMPARISON = Path(r'E:\R4D\perspective\coordination\p6-public-comparison-input-2026-10-29.json')
URL_PREFIX = 'r4d/p6-geometry-first-art/'
PREFIX = 'review/' + URL_PREFIX
BASE = '/review/' + URL_PREFIX
COMPARISON_URL = 'https://superflight.space' + BASE + 'publication/comparison.html'
FROZEN_SHA = 'e280b2ca82e1898ca539d6512b05cba2e57d7b4eac9eb5396a98d5eaeadb650d'
PACKAGES = ['@pixi/colord', 'earcut', 'eventemitter3', 'ismobilejs', 'parse-svg-path', 'pixi.js']


def require(ok, reason):
    if not ok:
        raise RuntimeError('STOP ' + reason)


def sha(data):
    return hashlib.sha256(data).hexdigest()


def js(data):
    return (json.dumps(data, ensure_ascii=False, indent=2) + '\n').encode()


def safe(path):
    p = PurePosixPath(path)
    require(not p.is_absolute() and all(x not in ('', '.', '..') for x in path.split('/'))
            and '\\' not in path and ':' not in path, 'unsafe relative path')
    return p


def write(path, data):
    if path.exists():
        require(path.is_file() and path.read_bytes() == data, 'local output differs: ' + str(path))
        return
    path.parent.mkdir(parents=True, exist_ok=True)
    path.write_bytes(data)


def record(path, relative):
    data = path.read_bytes()
    return {'path': relative, 'bytes': len(data), 'sha256': sha(data)}


def page(title, body):
    return ('<!doctype html>\n<html lang="ru"><meta charset="utf-8">'
            '<meta name="viewport" content="width=device-width,initial-scale=1">'
            '<meta name="robots" content="noindex,nofollow,noarchive">'
            '<title>' + html.escape(title) + '</title>'
            '<style>body{font:17px/1.55 system-ui,sans-serif;max-width:1180px;margin:40px auto;'
            'padding:0 22px;color:#18211d;background:#f6f8f6}a{color:#145d47}'
            'table{border-collapse:collapse;width:100%;font-size:15px}td,th{border:1px solid #b9c9c0;'
            'padding:12px;text-align:left;vertical-align:top}pre{white-space:pre-wrap;overflow-wrap:anywhere}'
            '.status{padding:12px;background:#fff1cf;border-left:4px solid #ae7000}small{color:#46544b}'
            '</style><body><nav><a href="/review/">Каталог Review</a> · '
            '<a href="' + BASE + '">Демка P6</a> · <a href="' + BASE +
            'publication/result.html">Результат P6</a> · <a href="' + BASE +
            'publication/comparison.html">Первичное сравнение</a></nav><main><h1>' +
            html.escape(title) + '</h1>' + body + '</main></body></html>\n').encode()


def para(value):
    return '<p>' + html.escape(value) + '</p>'


def comparison_page(value):
    rows = []
    for item in value['approaches']:
        if item['method'] == 'P6':
            # Two input fields mix future/past publication states. Use the explicit
            # approved P6 status/visual/limits instead; never invent a publication.
            outcome = value['p6Publication']['status'] + '. ' + value['p6Publication']['wholeImageResult']
            limits = value['p6Publication']['visual'] + ' ' + ' '.join(value['p6Publication']['otherLimits'])
        else:
            outcome, limits = item['result'], item['limits']
        rows.append('<tr><th><a href="' + html.escape(item['url'], quote=True) + '">' +
                    html.escape(item['method']) + '</a></th>' + ''.join('<td>' + html.escape(x) + '</td>'
                    for x in [item['approach'], outcome, item['strength'], limits, item['continuation']]) + '</tr>')
    body = para(value['status']) + para(value['commonConditions'])
    body += '<table><thead><tr><th>Способ</th><th>Подход</th><th>Результат</th><th>Сильная сторона</th>'
    body += '<th>Ограничения</th><th>Продолжение</th></tr></thead><tbody>' + ''.join(rows) + '</tbody></table>'
    body += para(value['conclusion']) + para(value['timingLimit']) + para(value['transferScope'])
    return page(value['title'], body)


def licenses(lock, output):
    result = []
    for name in PACKAGES:
        info = lock['packages']['node_modules/' + name]
        url = info['resolved']
        require(urllib.parse.urlsplit(url).hostname == 'registry.npmjs.org', 'unexpected license source host')
        algorithm, expected = info['integrity'].split('-', 1)
        require(algorithm == 'sha512', 'unexpected integrity algorithm')
        # License-only fetch, not installation. Archive bytes stay in own runtime.
        key = name.replace('@', '').replace('/', '-') + '-' + info['version']
        cached = output / 'license-inputs' / (key + '.tgz')
        prior_cache = RUNTIME / 'candidate-01/license-inputs' / (key + '.tgz')
        if cached.exists():
            data = cached.read_bytes()
        elif prior_cache.exists():
            data = prior_cache.read_bytes()
        else:
            with urllib.request.urlopen(url, timeout=25) as response:
                data = response.read(32 * 1024 * 1024 + 1)
        require(len(data) <= 32 * 1024 * 1024, 'license archive exceeds bound')
        require(base64.b64encode(hashlib.sha512(data).digest()).decode() == expected,
                'dependency archive integrity mismatch')
        write(output / 'license-inputs' / (key + '.tgz'), data)
        with tarfile.open(fileobj=io.BytesIO(data), mode='r:gz') as archive:
            found = [m for m in archive.getmembers() if m.isfile() and
                     re.fullmatch(r'package/(?:license|licence|copying)(?:\.txt|\.md)?', m.name, re.I)]
            require(len(found) <= 1, 'license document ambiguity: ' + name)
            if not found:
                override_path = RUNTIME / 'inputs/license-owner-provenance.json'
                if override_path.exists():
                    overrides = json.loads(override_path.read_bytes())
                    override = overrides.get(name)
                else:
                    override = None
                if override is not None:
                    require(override['version'] == info['version'], 'license owner version mismatch')
                    license_path = Path(override['localLicensePath']).resolve()
                    require(license_path.is_relative_to((RUNTIME / 'inputs').resolve()), 'license override outside own inputs')
                    content = license_path.read_bytes()
                    require(sha(content) == override['sha256'] and len(content) == override['bytes'], 'license owner bytes mismatch')
                    destination = 'publication/licenses/' + key + '.txt'
                    write(output / 'payload' / PREFIX / destination, content)
                    result.append({'name': name, 'version': info['version'], 'declaredLicense': info.get('license'),
                                   'sourceUrl': url, 'sourceIntegrity': info['integrity'], 'sourceArchiveSha256': sha(data),
                                   'licenseTextStatus': 'EXACT_UPSTREAM_COMMON_PROVENANCE', 'licenseProvenance': {k:v for k,v in override.items() if k != 'localLicensePath'},
                                   'publicPath': destination, 'licenseBytes': len(content), 'licenseSha256': sha(content)})
                    continue
                result.append({'name': name, 'version': info['version'], 'declaredLicense': info.get('license'),
                               'sourceUrl': url, 'sourceIntegrity': info['integrity'],
                               'sourceArchiveSha256': sha(data), 'licenseTextStatus': 'PENDING_OWNER_PROVENANCE',
                               'reason': 'Integrity-pinned archive contains no license text; no substitute license/version used.'})
                continue
            member = found[0]
            require(member.size < 128 * 1024, 'license document exceeds bound')
            content = archive.extractfile(member).read()
        destination = 'publication/licenses/' + key + '.txt'
        write(output / 'payload' / PREFIX / destination, content)
        result.append({'name': name, 'version': info['version'], 'declaredLicense': info.get('license'), 'licenseTextStatus': 'EXACT_ARCHIVE_TEXT',
                       'sourceUrl': url, 'sourceIntegrity': info['integrity'],
                       'sourceArchiveSha256': sha(data), 'sourceMember': member.name,
                       'publicPath': destination, 'licenseBytes': len(content), 'licenseSha256': sha(content)})
    return result


class EntryReferences(HTMLParser):
    def __init__(self):
        super().__init__()
        self.references = []

    def handle_starttag(self, tag, attrs):
        attrs = dict(attrs)
        if tag == 'script' and attrs.get('src'):
            self.references.append(attrs['src'])
        if tag == 'link' and attrs.get('href'):
            self.references.append(attrs['href'])


def static_references(site):
    entry = EntryReferences()
    entry.feed((site / 'index.html').read_text(encoding='utf-8'))
    app = (site / 'app.mjs').read_text(encoding='utf-8')
    require('["config.json", "manifest.json", "build-meta.json", "geometry.json"]' in app,
            'known immutable consumer boot dependency list differs')
    refs = set(entry.references + ['app.mjs', 'config.json', 'manifest.json', 'build-meta.json',
                                   'geometry.json', 'geometry-draft.png', 'artist.json'])
    # The bundle contains Pixi documentation examples with quoted import text.
    # Actual esbuild module declarations begin at column zero in this frozen file.
    imports = re.findall(r'(?m)^import\b[^\n]*?\bfrom\s+["\']([^"\']+)["\']', app)
    refs.update(x.removeprefix('./') for x in imports)
    require(imports == ['./native/core.mjs'], 'unexpected external module dependency')
    artist = json.loads((site / 'artist.json').read_bytes())
    texture_paths = [x['texture'] for x in artist['layers']]
    texture_paths += [artist['ball']['texture'], artist['ball']['shadow']['texture'],
                      artist['ball']['shadow']['maskTexture']]
    refs.update('artist/' + x for x in texture_paths)
    css_urls = re.findall(r'url\(["\']?([^\)"\']+)', (site / 'style.css').read_text(encoding='utf-8'))
    refs.update(x for x in css_urls if not x.startswith('data:'))
    for ref in refs:
        safe(ref)
        require((site / ref).is_file(), 'missing runtime reference: ' + ref)
    return {'entryReferences': entry.references, 'moduleImports': imports,
            'runtimeReferences': sorted(refs), 'externalRuntimeResources': [],
            'scope': 'Static boot/import/stylesheet and adapter texture graph; no runtime/physics QA rerun.'}


def privacy(payload):
    rules = {'privateKey': r'BEGIN (?:RSA |EC |OPENSSH )?PRIVATE KEY',
             'tokenValue': r'gh[pousr]_[A-Za-z0-9]{20,}|github_pat_[A-Za-z0-9_]{20,}|sk-[A-Za-z0-9_-]{20,}',
             'sourceMap': r'sourceMappingURL|sourcesContent|sourceURL\s*=',
             'internalDrivePath': r'(?<![A-Za-z])[A-Z]:[\\/]',
             'localHttp': r'https?://(?:127\.0\.0\.1|localhost)(?=[:/])',
             'credentialUrl': r'https?://[^\s/<>"\']+:[^\s/<>"\']+@'}
    findings, allowances, metadata = [], [], []
    for path in sorted(payload.rglob('*')):
        require(not path.is_symlink() and not (path.lstat().st_file_attributes & 0x400), 'reparse point')
        if not path.is_file():
            continue
        relative = path.relative_to(payload).as_posix()
        require(path.suffix.lower() not in ('.ts', '.tsx', '.map') and '/qa/' not in relative,
                'forbidden payload type')
        data = path.read_bytes()
        if path.suffix.lower() in ('.html', '.mjs', '.js', '.css', '.json', '.txt'):
            text = data.decode('utf-8')
            for rule, pattern in rules.items():
                for match in re.finditer(pattern, text):
                    row = {'path': relative, 'rule': rule, 'line': text.count('\n', 0, match.start()) + 1}
                    if relative == PREFIX + 'manifest.json' and rule == 'internalDrivePath' and text[match.start():].startswith('K:\\\\Agents\\\\R4D\\\\Assets\\\\perspective\\\\01-jungle.jpg'):
                        allowances.append({**row, 'basis': 'Nonsecret user-supplied source image pointer in immutable accepted P1 manifest; no private runtime or credential path.'})
                    elif relative == PREFIX + 'app.mjs' and rule == 'internalDrivePath' and row['line'] in (9403, 9411, 9551) and text[match.start():match.end()] == 'C:/':
                        allowances.append({**row, 'basis': 'Reviewed Pixi path API documentation example C:/ only; no actual private directory follows.'})
                    else:
                        findings.append(row)
        elif path.suffix.lower() == '.png':
            require(data[:8] == b'\x89PNG\r\n\x1a\n', 'PNG signature differs')
            offset = 8
            while offset + 12 <= len(data):
                size = struct.unpack('>I', data[offset:offset + 4])[0]
                kind = data[offset + 4:offset + 8]
                require(offset + size + 12 <= len(data), 'PNG chunk outside file')
                if kind in (b'tEXt', b'iTXt', b'zTXt', b'eXIf'):
                    metadata.append({'path': relative, 'kind': kind.decode(), 'bytes': size})
                offset += size + 12
                if kind == b'IEND':
                    break
            require(offset == len(data), 'unexpected PNG trailing bytes')
    require(not findings, 'privacy findings: ' + json.dumps(findings))
    require(not metadata, 'image text/EXIF metadata needs review: ' + json.dumps(metadata))
    return {'unresolvedFindings': findings, 'qualifiedNonsecretPointers': allowances,
            'imageTextOrExifMetadata': metadata, 'rawPrivateSourcesAndMapsIncluded': False,
            'qaOracleOperatorLogsHeldReportsIncluded': False,
            'scope': 'Inventory/type/reference/provenance and bounded local pattern scan; no claim of exhaustive secret detection.'}


def main():
    output_name = sys.argv[1] if len(sys.argv) > 1 else 'candidate-01'
    require(re.fullmatch(r'candidate-[0-9]{2}', output_name), 'invalid local preparation name')
    output = RUNTIME / output_name
    require(not (output / 'LOCAL_PREPARATION_RECEIPT.json').exists(), 'completed local artifact already exists; do not overwrite')
    inv_bytes = (RUNTIME / 'inputs/freeze-inventory.json').read_bytes()
    require(sha(inv_bytes) == FROZEN_SHA, 'frozen inventory identity')
    inv = json.loads(inv_bytes)
    require(len(inv['files']) == 101 and inv['totalBytes'] == 40559900, 'frozen totals')
    artist_meta = json.loads((SITE / 'artist.json').read_bytes())
    asset_sources = {}
    for key, value in artist_meta.items():
        if key.endswith('Source') and isinstance(value, dict):
            asset_sources[key] = {k:v for k,v in value.items() if k in ('commit', 'packet', 'packetSha256', 'packetPath', 'sourceCommit')}
    observed, selection, seen = [], [], set()
    for row in inv['files']:
        safe(row['path'])
        require(row['path'].casefold() not in seen, 'path case collision')
        seen.add(row['path'].casefold())
        source = SITE / row['path']
        require(source.is_file() and not source.is_symlink() and not (source.lstat().st_file_attributes & 0x400), 'source not regular')
        data = source.read_bytes()
        require(len(data) == row['bytes'] and sha(data) == row['sha256'], 'frozen disk mismatch: ' + row['path'])
        include = not row['path'].startswith('qa/')
        if row['path'] == 'native/core.mjs':
            provenance = {'kind': 'compiled-private-native', 'commit': '5a6fa03f1cdb3de88a2d9c7dbe795eb8e2a7f023', 'packageTree': '008d16a80a26bb77d562a45218b01da09b0d9ff0'}
            license_basis = 'Owner-authorized compiled consumer only; no public source license assigned.'
        elif row['path'].startswith('artist/') or row['path'] == 'artist.json':
            provenance = {'kind': 'own-p6-component-art', 'adapterSha256': inv['adapterSha256'], 'sourceBlocks': asset_sources}
            license_basis = 'Owner-authorized accepted P6 consumer publication; held asset Git delivery remains separate.'
        elif row['path'] in ('config.json', 'manifest.json', 'geometry.json'):
            provenance = {'kind': 'accepted-p1-geometry-projection', 'commit': '4b47db04c7140ebf88f69b91faa0b790d46f22ec'}
            license_basis = 'Owner-authorized common P1 input in accepted P6 consumer.'
        elif include:
            provenance = {'kind': 'own-p6-builder-consumer', 'commit': inv['sourceCommit']}
            license_basis = 'Owner-authorized P6 consumer; app.mjs additionally carries listed locked third-party components.'
        else:
            provenance = {'kind': 'private-frozen-qa-evidence', 'inventoryFileSha256': FROZEN_SHA}
            license_basis = 'Excluded; metadata decision only, no publication permission inferred.'
        selection.append({**row, 'decision': 'include' if include else 'exclude',
                          'reason': 'Immutable runtime dependency' if include else 'Private QA/oracle/evidence; no public bytes',
                          'provenance': provenance, 'licenseBasis': license_basis})
        if include:
            write(output / 'payload' / PREFIX / row['path'], data)
            observed.append(row)
    graph = static_references(SITE)
    require(set(graph['runtimeReferences']) | {'index.html'} == {r['path'] for r in observed}, 'runtime subset has unexplained inclusions')
    comparison_bytes = COMPARISON.read_bytes()
    require(len(comparison_bytes) == 10288 and sha(comparison_bytes) == '40b4c81f3f32208b3eee0e59d3050c6a47db450ac9edb7abc8b5a4532ac2ec5d', 'exact approved comparison whitelist bytes')
    comparison = json.loads(comparison_bytes)
    require(comparison['p6Publication']['source'] == inv['sourceCommit'] and
            comparison['p6Publication']['frozenInventorySha256'] == FROZEN_SHA, 'comparison input pin mismatch')
    extra = output / 'payload' / PREFIX / 'publication'
    write(extra / 'comparison.html', comparison_page(comparison))
    p6 = comparison['p6Publication']
    body = '<p class="status">' + html.escape(p6['status']) + '</p>'
    body += para(p6['wholeImageResult']) + para(p6['technical']) + para(p6['visual'])
    body += '<ul>' + ''.join('<li>' + html.escape(x) + '</li>' for x in p6['otherLimits']) + '</ul>'
    body += '<p><a href="../">Открыть неизменённую компонентную демку</a> · <a href="comparison.html">Сравнение пяти способов</a> · <a href="notices.html">Происхождение и лицензии</a></p>'
    body += para('Собранная демка сохраняет исходные служебные подписи frozen snapshot. Итог этой попытки указан выше; он не означает художественный PASS.')
    write(extra / 'result.html', page('P6 Geometry First Art', body))
    lock_bytes = (RUNTIME / 'inputs/package-lock.json').read_bytes()
    meta = json.loads((SITE / 'build-meta.json').read_bytes())
    require(sha(lock_bytes) == meta['runtimeDependencyLockSha256'], 'dependency lock pin')
    license_rows = licenses(json.loads(lock_bytes), output)
    require(set(re.findall(r'node_modules/((?:@[^/]+/)?[^/]+)/', (SITE / 'app.mjs').read_text(encoding='utf-8'))) == set(PACKAGES), 'bundled package set differs')
    body = para('Демка использует настоящий Millionko и PixiJS. Приватные исходники Millionko, карты исходников и внутренние отчёты в пакет не входят. Публикация consumer не означает Git-доставку удержанных исходников или художественных материалов.')
    body += para('P6 растровые компоненты — собственные материалы этой попытки. Публикация согласованного consumer разрешена владельцем через CTO; открытая лицензия на приватные исходники или художественные материалы этим не назначается.')
    body += '<ul>' + ''.join('<li>' + html.escape(x['name'] + ' ' + x['version'] + ' — ' + str(x['declaredLicense'])) +
             (': <a href="' + html.escape(x['publicPath'].removeprefix('publication/'), quote=True) + '">Текст лицензии</a>' if x.get('publicPath') else ': license provenance pending; локальный пакет не готов к публикации') + '</li>' for x in license_rows) + '</ul>'
    write(extra / 'notices.html', page('Происхождение и лицензии P6', body))
    public_files = [record(p, p.relative_to(output / 'payload').as_posix()) for p in sorted((output / 'payload').rglob('*')) if p.is_file()]
    public_manifest = {'schema': 'r4d.p6.publication.v1', 'status': p6['status'], 'sourceCommit': inv['sourceCommit'],
                       'ledgerCommit': '4f6937d5aa58ad864e612e2552110f42b97931d4', 'frozenInventorySha256': FROZEN_SHA,
                       'runtimeSubsetCount': len(observed), 'runtimeSubsetBytes': sum(x['bytes'] for x in observed),
                       'runtimeSemantics': 'Byte-exact subset; no app/source/config/seed/physics modification or rebuild.',
                       'privateExclusionCount': len(selection) - len(observed), 'privateExclusionReason': 'QA/oracle/evidence only; original inventory and raw internal ledgers are not public.',
                       'sourcePins': {'nativeCommit': meta['coreCommit'], 'nativePackageTree': meta['coreTree'],
                                      'nativeCompiledSha256': meta['coreSha256'], 'p1Commit': meta['p1Commit'],
                                      'dependencyLockSha256': sha(lock_bytes), 'pixiVersion': meta['pixiVersion'], 'esbuildVersion': meta['esbuildVersion']},
                       'artProvenance': asset_sources, 'compiledNativeBasis': 'Owner-authorized consumer publication; raw private TS/maps excluded; no open-source license assigned.',
                       'comparisonUrl': COMPARISON_URL, 'licenses': license_rows, 'filesExcludingThisManifest': public_files,
                       'manifestSelfHash': 'Detached in private frozen intent; archive hash covers manifest bytes.'}
    write(extra / 'manifest.json', js(public_manifest))
    privacy_result = privacy(output / 'payload')
    final_files = [record(p, p.relative_to(output / 'payload').as_posix()) for p in sorted((output / 'payload').rglob('*')) if p.is_file()]
    manifest = {'schema': 'r4d.p6.private-publication-selection.v1', 'tokenGranted': False, 'serverWrite': False,
                'status': p6['status'], 'sourceCommit': inv['sourceCommit'], 'ledgerCommit': '4f6937d5aa58ad864e612e2552110f42b97931d4',
                'frozenInventoryFileSha256': FROZEN_SHA, 'frozenFileCount': 101, 'frozenTotalBytes': 40559900,
                'selectionForEveryFrozenEntry': selection, 'runtimeSubset': observed,
                'runtimeDependencies': graph, 'privacy': privacy_result, 'licenses': license_rows,
                'comparisonInputSha256': sha(comparison_bytes), 'comparisonUrl': COMPARISON_URL,
                'comparisonSelection': {'P2_P5': 'Approved approach/result/strength/limits/continuation fields only; linked products were not read.',
                                        'P6': 'Explicit p6Publication status/wholeImageResult/visual/otherLimits replace two contradictory publication-state fields; no change to scientific claims.'},
                'payloadFiles': final_files, 'payloadFileCount': len(final_files),
                'payloadTotalBytes': sum(x['bytes'] for x in final_files),
                'generationEnvironment': {'python': sys.version.split()[0], 'zlib': zlib.ZLIB_RUNTIME_VERSION}}
    write(output / 'PUBLICATION_MANIFEST.private.json', js(manifest))
    fragment = ('<section class="r4d-p6-publication"><h2>P6 Geometry First Art</h2><p>LOCAL_PARTIAL / NO_ART_MOTION_PASS</p>'
                '<p><a href="' + BASE + '">Компонентная демка P6</a> · <a href="' + BASE + 'publication/result.html">Результат и ограничения</a> · '
                '<a href="' + BASE + 'publication/comparison.html">Первичное сравнение пяти подходов</a></p></section>\n').encode()
    write(output / 'CATALOG_FRAGMENT.html', fragment)
    archive_path = output / 'P6_LOCAL_PARTIAL_01.tar.gz'
    with archive_path.open('xb') as raw:
        with gzip.GzipFile(filename='', fileobj=raw, mode='wb', mtime=0, compresslevel=9) as compressed:
            with tarfile.open(fileobj=compressed, mode='w', format=tarfile.USTAR_FORMAT) as archive:
                for row in final_files:
                    member = tarfile.TarInfo(row['path'])
                    member.size = row['bytes']; member.mode = 0o644; member.mtime = 0
                    member.uid = member.gid = 0; member.uname = member.gname = ''
                    archive.addfile(member, io.BytesIO((output / 'payload' / row['path']).read_bytes()))
    with tarfile.open(archive_path, 'r:gz') as archive:
        members = archive.getmembers()
        require([m.name for m in members] == [r['path'] for r in final_files], 'archive whitelist mismatch')
        for member, row in zip(members, final_files):
            require(member.isfile() and sha(archive.extractfile(member).read()) == row['sha256'], 'archive payload mismatch')
    receipt = {'status': 'LOCAL_ARTIFACTS_PREPARED_NOT_TOKEN_READY', 'serverWrite': False, 'tokenGranted': False,
               'frozenDiskChecked': 101, 'frozenDiskMismatches': 0,
               'runtimeFiles': len(observed), 'runtimeBytes': sum(x['bytes'] for x in observed),
               'excludedPrivateFiles': len(selection) - len(observed),
               'payloadFiles': len(final_files), 'payloadBytes': sum(x['bytes'] for x in final_files),
               'archive': record(archive_path, archive_path.name),
               'privateManifest': record(output / 'PUBLICATION_MANIFEST.private.json', 'PUBLICATION_MANIFEST.private.json'),
               'comparison': record(extra / 'comparison.html', 'publication/comparison.html'),
               'comparisonUrl': COMPARISON_URL,
               'licenseTextPending': [x['name'] for x in license_rows if x['licenseTextStatus'] == 'PENDING_OWNER_PROVENANCE'],
               'pending': ['Final fresh read-only root/writer/opaque-snippet/docs guards',
                           'Exact preserved catalog replacement bytes', 'Final frozen intent', 'Separate CTO execution command/token']}
    write(output / 'LOCAL_PREPARATION_RECEIPT.json', js(receipt))
    print(json.dumps(receipt, ensure_ascii=False, indent=2))


if __name__ == '__main__':
    sys.stdout.reconfigure(encoding='utf-8')
    main()
