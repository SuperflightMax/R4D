"""Build the one-off D1 packet from pinned Git bytes and a fresh read-only probe."""
import base64
from datetime import datetime, timezone
import difflib
import hashlib
import json
from pathlib import Path
import re
import subprocess
import sys

SOURCE = '43b6268e924698048a4d79df1aad2512c86f08f7'
PREFIX = 'experiments/fx-workshop/FX-01/'

def digest(data):
    return hashlib.sha256(data).hexdigest()

def plural(n):
    return 'артефакт' if n % 10 == 1 and n % 100 != 11 else 'артефакта' if n % 10 in (2, 3, 4) and n % 100 not in (12, 13, 14) else 'артефактов'

def one_replace(text, old, new):
    assert text.count(old) == 1, 'Catalog anchor changed: ' + old
    return text.replace(old, new, 1)

def main():
    repo, probe_file, output = map(Path, sys.argv[1:])
    base = json.loads(probe_file.read_text(encoding='utf-8-sig'))
    assert not output.exists(), 'Unique packet output required'
    output.mkdir(parents=True)
    public = output / 'public'
    paths = {}
    for name in ['index.html', 'style.css', 'app.js']:
        data = subprocess.check_output(['git', '-C', str(repo), 'show', SOURCE + ':' + PREFIX + name])
        rel = 'review/r4d/fx-workshop/fx-01/' + name
        dst = public / rel
        dst.parent.mkdir(parents=True, exist_ok=True)
        dst.write_bytes(data)
        blob = subprocess.check_output(['git', '-C', str(repo), 'rev-parse', SOURCE + ':' + PREFIX + name], text=True).strip()
        paths[rel] = {'size': len(data), 'sha256': digest(data), 'git_blob': blob, 'source_path': PREFIX + name}
    old_r4d = base64.b64decode(base['catalogs']['review/r4d/index.html']).decode('utf-8')
    counts = {m[1]: m[2].count('<article class="artifact-card">') for m in re.finditer(r'<section class="stage" id="([^"]+)".*?>(.*?)</section>', old_r4d, re.S)}
    old_count = sum(counts.values())
    assert old_count == old_r4d.count('<article class="artifact-card">') and old_count > 0
    assert 'fx-workshop' not in old_r4d, 'FX already present; do not duplicate D1'
    section = '''    <section class="stage" id="fx-workshop" aria-labelledby="fx-workshop-title">
      <div class="section-head"><h2 id="fx-workshop-title">FX Workshop</h2><span>1 артефакт</span></div>
      <div class="artifact-grid">
        <article class="artifact-card">
          <div class="artifact-top"><span class="stage-meta">FX-01</span><span class="status status-partial">UX-прототип для просмотра</span></div>
          <h3>Мастерская эффектов</h3>
          <p>Два входа в одну работу: от эффекта или от объекта. Примерка, настройки, композиция и возврат к сохранённому рецепту. Проба удобства на простых эффектах.</p>
          <div class="artifact-actions"><a href="./fx-workshop/fx-01/">Открыть мастерскую</a></div>
        </article>
      </div>
    </section>

'''
    r4d = one_replace(old_r4d, '      <a href="#art-2d">', '      <a href="#fx-workshop">FX Workshop · 1</a>\n      <a href="#art-2d">')
    r4d = one_replace(r4d, '    <section class="stage" id="art-2d"', section + '    <section class="stage" id="art-2d"')
    old_global = base64.b64decode(base['catalogs']['review/index.html']).decode('utf-8')
    catalog = one_replace(old_global, f'<span class="project-count">{old_count} {plural(old_count)}</span>', f'<span class="project-count">{old_count + 1} {plural(old_count + 1)}</span>')
    card = '''        <a class="project-card" href="./r4d/#fx-workshop">
          <span class="stage-meta">Этап · 1 артефакт</span>
          <strong>FX Workshop</strong>
          <span>Примерка и настройка эффектов в общем UX-прототипе.</span>
          <b>Открыть этап</b>
        </a>
'''
    catalog = one_replace(catalog, '      <div class="project-grid">\n', '      <div class="project-grid">\n' + card)
    assert r4d.replace(section, '', 1).replace('      <a href="#fx-workshop">FX Workshop · 1</a>\n', '', 1) == old_r4d
    assert catalog.replace(card, '', 1).replace(f'<span class="project-count">{old_count + 1} {plural(old_count + 1)}</span>', f'<span class="project-count">{old_count} {plural(old_count)}</span>', 1) == old_global
    diff = ''
    for rel, prior, new in [('review/index.html', old_global, catalog), ('review/r4d/index.html', old_r4d, r4d)]:
        data = new.encode('utf-8')
        dst = public / rel
        dst.parent.mkdir(parents=True, exist_ok=True)
        dst.write_bytes(data)
        paths[rel] = {'size': len(data), 'sha256': digest(data), 'before_sha256': digest(prior.encode('utf-8'))}
        diff += ''.join(difflib.unified_diff(prior.splitlines(True), new.splitlines(True), fromfile='base/' + rel, tofile='staged/' + rel, n=0))
    ident = 'fx01-43b6268e-' + datetime.now(timezone.utc).strftime('%Y%m%dT%H%M%SZ')
    manifest = {'key': 'FX01-D1-43b6268e', 'release_id': ident, 'source': SOURCE, 'base_root': base['root'], 'base_snippet_sha256': base['snippet_sha256'], 'base_manifest_sha256': base['summary']['sha256'], 'files': paths, 'catalog_inverse_verified': True, 'counts': {'r4d_before': old_count, 'r4d_after': old_count + 1, 'existing_stages': counts, 'fx_workshop': 1}}
    (output / 'packet.json').write_text(json.dumps(manifest, indent=2, ensure_ascii=False) + '\n', encoding='utf-8')
    (output / 'catalogs.diff').write_text(diff, encoding='utf-8')
    print(json.dumps(manifest, ensure_ascii=True))

if __name__ == '__main__':
    main()
