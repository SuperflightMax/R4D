"""P6 Phase A read-only baseline; never imports or executes a write phase.

Generic tree/canonical/HTTP behavior adapted from authorized common helpers at
372344f9f6198cd811daa4612256a2fd8b32597b: combined_remote_v3.py lines 1-29,
38-154 only. No P3 product/run/data is included.
"""
import datetime
import hashlib
import http.client
import json
import os
import socket
import stat
from pathlib import Path


def sha(data):
    return hashlib.sha256(data).hexdigest()


def now():
    return datetime.datetime.now(datetime.timezone.utc).isoformat()


def canonical(data):
    return json.dumps(data, sort_keys=True, separators=(',', ':'), ensure_ascii=False).encode()


def tree_digest(root, include_rows=False):
    files, dirs = [], []
    for path in [root] + sorted(root.rglob('*')):
        info = path.lstat()
        if stat.S_ISLNK(info.st_mode):
            raise RuntimeError('STOP symlink in published tree')
        row = {'path': path.relative_to(root).as_posix(), 'uid': info.st_uid,
               'gid': info.st_gid, 'mode': stat.S_IMODE(info.st_mode)}
        if path.is_dir():
            dirs.append(row)
        elif path.is_file():
            digest = hashlib.sha256()
            with path.open('rb') as stream:
                for chunk in iter(lambda: stream.read(1024 * 1024), b''):
                    digest.update(chunk)
            files.append({**row, 'bytes': info.st_size, 'sha256': digest.hexdigest()})
        else:
            raise RuntimeError('STOP nonregular published entry')
    files.sort(key=lambda item: item['path'])
    dirs.sort(key=lambda item: item['path'])
    result = {'files': len(files), 'directories': len(dirs),
              'bytes': sum(item['bytes'] for item in files),
              'metadataDigest': sha(canonical({'files': files, 'directories': dirs}))}
    if include_rows:
        result['metadataRows'] = {'files': files, 'directories': dirs}
    return result


HEADER_NAMES = ('Location', 'X-Frame-Options', 'Cache-Control', 'X-Robots-Tag',
                'X-Content-Type-Options', 'Referrer-Policy', 'Content-Type')


def http_probe(path, foreign=False):
    connection = http.client.HTTPSConnection('superflight.space', timeout=20)
    digest, size = hashlib.sha256(), 0
    headers = {'User-Agent': 'R4D-P6-Phase-A-readonly/1'}
    if foreign:
        headers['Origin'] = 'https://example.invalid'
    try:
        connection.request('GET', path, headers=headers)
        response = connection.getresponse()
        result = {'path': path, 'foreignOrigin': foreign, 'status': response.status,
                  'headers': {key: response.getheader(key) for key in HEADER_NAMES}}
        for chunk in iter(lambda: response.read(65536), b''):
            digest.update(chunk)
            size += len(chunk)
        return {**result, 'bodyBytes': size, 'bodySha256': digest.hexdigest(),
                'bodyComplete': True, 'observedUtc': now()}
    finally:
        connection.close()


def run():
    result = {'startedUtc': now(), 'actualEuid': os.geteuid(),
              'host': socket.gethostname(), 'serverWrite': False,
              'tokenGranted': False, 'activeRootBindingVerified': False}
    if result['actualEuid'] != 0:
        raise RuntimeError('STOP actual euid0 required')
    root = Path('/srv/superflight-review/releases/p3-water-dark-front-edge-04')
    result['lastKnownPublishedRoot'] = str(root)
    if not root.is_dir():
        raise RuntimeError('STOP last known root unavailable')
    target = root / 'review/r4d/p6-geometry-first-art'
    result['p6TargetAtLastKnownRoot'] = {'path': str(target), 'occupied': os.path.lexists(target)}
    result['p6NamedReleaseEntries'] = sorted(path.name for path in root.parent.iterdir()
                                            if 'p6' in path.name.lower())
    if result['p6TargetAtLastKnownRoot']['occupied'] or result['p6NamedReleaseEntries']:
        return {**result, 'status': 'STOP_POSSIBLE_DUPLICATE', 'completedUtc': now()}
    result['lastKnownRootTree'] = tree_digest(root)
    result['http'] = [http_probe('/review/'), http_probe('/review/', True),
                      http_probe('/review/.p6-phase-a-probe'),
                      http_probe('/review/r4d/p6-geometry-first-art/')]
    result['pendingExactPointers'] = ['active root snippet', 'main vhost', 'global MIME',
                                      'service documents', 'writer/intent/lock', 'rollback']
    return {**result, 'status': 'READ_ONLY_BASELINE_PARTIAL', 'completedUtc': now()}


if __name__ == '__main__':
    try:
        print(json.dumps(run(), ensure_ascii=False))
    except Exception as error:
        print(json.dumps({'status': 'STOP', 'serverWrite': False,
                          'reason': str(error), 'errorType': type(error).__name__}))
        raise SystemExit(1)
