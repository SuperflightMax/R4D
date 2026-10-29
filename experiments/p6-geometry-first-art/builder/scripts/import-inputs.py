"""Copy only the authorized public common inputs, preserving Git blob bytes."""
import hashlib
import json
from pathlib import Path
import subprocess

ROOT = Path(__file__).resolve().parents[4]
OUT = Path(__file__).resolve().parents[1] / 'inputs'
P1 = '4b47db04c7140ebf88f69b91faa0b790d46f22ec'
BASE = 'experiments/p1-collider-mapping/clean-repeat-01/'
SOURCES = [
    ('config.json', P1, BASE + 'simulation/boards/01/trial-01/config.json', 'dd5c519cd6d4b7295118e0a3a1063efed424a0ce739450bd5153c6a9941982db'),
    ('manifest.json', P1, BASE + 'simulation/boards/01/trial-01/manifest.json', '7784dc0a215d0e472cf06a4eee03793592727cf0fa9a1fa0e0c78e5f1d17da18'),
    ('projection.mjs', P1, BASE + 'simulation/projection.mjs', 'b59a0c1e6c34b417d253178457ef3580b8bea0aa89c989d1342f9376e19b9431'),
    ('view-math.mjs', P1, BASE + 'viewer/src/view-math.mjs', '96f01cc2093c353ff958cb906fe0c8ae93412425d0f7a5ec7cca0f2bf9f1aa5e'),
    ('P0-RECIPE.md', 'ee4d8e5c7dbb3b6618d58d6dacb0caf9b73dfb1b', 'experiments/p0-perspective/research/CROSS_SERIES_CONCLUSION_AND_RECIPE.md', '9ffe076b1746d5c4ef78da2f7d9a95bedcadf5e7f49f07f6d5899c0cc8373619'),
]

OUT.mkdir(parents=True, exist_ok=True)
inventory = []
for name, commit, path, expected in SOURCES:
    data = subprocess.check_output(['git', '-C', str(ROOT), 'show', f'{commit}:{path}'])
    digest = hashlib.sha256(data).hexdigest()
    if digest != expected:
        raise ValueError(f'Input hash mismatch: {path}: {digest}')
    (OUT / name).write_bytes(data)
    inventory.append(dict(file=name, commit=commit, path=path, bytes=len(data), sha256=digest))

reference = Path(r'K:\Agents\R4D\Assets\perspective\01-jungle.jpg')
digest = hashlib.sha256(reference.read_bytes()).hexdigest()
if digest != 'c8f9e4245c1de8c2086e615bc75dc10aea59b76b614d6e106593e07262e24f72':
    raise ValueError('Reference hash mismatch')
inventory.append(dict(file=str(reference), readOnly=True, bytes=reference.stat().st_size,
                      width=1536, height=1536, sha256=digest))
report = dict(schema='r4d.p6.common-inputs.v1', inputs=inventory,
              privateCore=dict(commit='5a6fa03f1cdb3de88a2d9c7dbe795eb8e2a7f023',
                               packageTree='008d16a80a26bb77d562a45218b01da09b0d9ff0',
                               publicSources=False))
(OUT / 'inventory.json').write_text(json.dumps(report, indent=2) + '\n', encoding='utf-8')
print(json.dumps(report, indent=2))
