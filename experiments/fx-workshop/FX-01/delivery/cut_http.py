"""Bounded anonymous HTTPS readback for the exact published FX-01 candidate."""
from datetime import datetime, timezone
import hashlib
import json
from pathlib import Path
import sys
from urllib.request import Request, urlopen
from urllib.error import HTTPError

ORIGIN = 'https://superflight.space'
BASE = '/review/r4d/fx-workshop/fx-01/'

def main():
    packet = json.loads(Path(sys.argv[1]).read_text(encoding='utf-8-sig'))
    probes = []
    def check(path, status, item=None, method='GET', headers=None):
        try:
            response = urlopen(Request(ORIGIN + path, headers=headers or {}, method=method), timeout=20)
        except HTTPError as error:
            response = error
        with response:
            body = response.read()
            found = {'path': path, 'method': method, 'foreign_origin': bool(headers), 'status': response.status, 'expected_status': status, 'bytes': len(body), 'sha256': hashlib.sha256(body).hexdigest(), 'mime': response.headers.get_content_type(), 'headers': {k: response.headers.get(k) for k in ['Cache-Control', 'Strict-Transport-Security', 'X-Robots-Tag', 'X-Content-Type-Options', 'Referrer-Policy', 'X-Frame-Options']}}
        good = found['status'] == status
        if item:
            expected_mime = ['text/css'] if path.endswith('.css') else ['application/javascript', 'text/javascript'] if path.endswith('.js') else ['text/html']
            good = good and found['bytes'] == item['size'] and found['sha256'] == item['sha256'] and found['mime'] in expected_mime
        h = found['headers']
        good = good and h['Cache-Control'] == 'no-store' and 'noindex' in (h['X-Robots-Tag'] or '') and h['X-Content-Type-Options'] == 'nosniff' and h['Referrer-Policy'] == 'same-origin' and h['X-Frame-Options'] == 'DENY' and 'max-age=31536000' in (h['Strict-Transport-Security'] or '')
        found['ok'] = bool(good)
        probes.append(found)
    for rel, item in packet['files'].items():
        check('/' + rel, 200, item)
    check(BASE, 200, packet['files']['review/r4d/fx-workshop/fx-01/index.html'])
    for excluded in ['README.md', 'SELF-CHECK.md', 'C1-SELF-CHECK.md', 'checks/interaction.js', 'checks/evidence/c1/after-result.json', 'app.js.map', '.git/config', 'delivery/D1-STAGING.json']:
        check(BASE + excluded, 404)
    check(BASE, 403, headers={'Origin': 'https://foreign.invalid'})
    check(BASE, 403, method='POST')
    passed = sum(p['ok'] for p in probes)
    result = {'key': 'FX01-D1-CUT-43b6268e-20261119T031029Z', 'status': 'HTTP_VERIFIED' if passed == len(probes) else 'HTTP_FAILED', 'at_utc': datetime.now(timezone.utc).isoformat(), 'source': packet['source'], 'release_id': packet['release_id'], 'url': ORIGIN + BASE, 'passed': passed, 'total': len(probes), 'probes': probes}
    Path(sys.argv[2]).write_bytes((json.dumps(result, indent=2) + '\n').encode())
    print(json.dumps({k: result[k] for k in ['status', 'at_utc', 'source', 'url', 'passed', 'total']}))
    raise SystemExit(0 if passed == len(probes) else 1)

if __name__ == '__main__':
    main()
