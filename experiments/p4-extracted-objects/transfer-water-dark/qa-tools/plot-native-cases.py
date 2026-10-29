"""Static plots from preserved native states; no source-image editing or game renderer."""
import json
import math
import sys
from pathlib import Path
import matplotlib
matplotlib.use('Agg')
import matplotlib.pyplot as plt
from matplotlib.patches import Circle

root = Path(sys.argv[1])
config = json.loads((root / 'inputs/config.json').read_text(encoding='utf-8'))
cases = json.loads((root / 'CRITICAL_CASES.json').read_text(encoding='utf-8'))
water = cases['board'] == 'water'
names = ['arch07-full-foot-band-crossing', 'arch07-left-corner'] if water else ['pillar02-corner', 'pillar02-front-face', 'pillar04-side-face']
fig, axes = plt.subplots(1, len(names), figsize=(7 * len(names), 6), squeeze=False)
for ax, name in zip(axes[0], names):
    case = next(c for c in cases['cases'] if c['id'] == name)
    object_id = case['target'].split(':')[0]
    if water:
        object_id = 'arch-07'
    edges = [s for s in config['board']['segments'] if s['id'].startswith(object_id)]
    for s in edges:
        ax.plot([s['x1'], s['x2']], [s['y1'], s['y2']], color='#076b7e', lw=2)
    trace = [json.loads(s) for s in (root / 'runs' / f"seed-{case['seed']}.jsonl").read_text(encoding='utf-8').splitlines()]
    first, last = max(0, min(case['ticks']) - 3), min(len(trace) - 1, max(case['ticks']) + 3)
    path = [f['state']['ball']['pos'] for f in trace[first:last + 1]]
    ax.plot([p['x'] for p in path], [p['y'] for p in path], '-o', color='#ae245d', ms=3, lw=1.5)
    chosen = case['frames'] if len(case['frames']) < 5 else [case['frames'][i] for i in [0, 2, -1]]
    palette = ['#60666c', '#c05a00', '#1e8a4f', '#546cc4']
    for index, f in enumerate(chosen):
        p = f['state']['ball']['pos']
        color = palette[index % len(palette)]
        ax.add_patch(Circle((p['x'], p['y']), 16, fill=False, color=color, lw=1.2, alpha=.8))
        ax.annotate(str(f['state']['tick']), (p['x'], p['y']), xytext=(12, (-1)**index * 16), textcoords='offset points', fontsize=9, color=color, arrowprops={'arrowstyle': '-', 'color': color})
    if 'eventTick' in case:
        event = next(e for f in case['frames'] for e in f['events'] if e.get('type') == 'object_hit' and e.get('tick') == case['eventTick'] and e.get('objectId') == case['target'])
        ax.scatter([event['x']], [event['y']], marker='x', color='#bd0000', s=65, zorder=8)
    points = [(s['x1'], s['y1']) for s in edges] + [(s['x2'], s['y2']) for s in edges] + [(p['x'], p['y']) for p in path]
    ax.set_xlim(min(p[0] for p in points)-25, max(p[0] for p in points)+25)
    ax.set_ylim(max(p[1] for p in points)+25, min(p[1] for p in points)-25)
    ax.set_aspect('equal')
    ax.grid(alpha=.18)
    ax.ticklabel_format(useOffset=False, style='plain')
    ax.tick_params(axis='x', labelrotation=30)
    ax.set_xlabel('Native x')
    ax.set_ylabel('Native y (down)')
    ax.set_title(f"{name}\nseed {case['seed']}; r16", fontsize=11)
fig.suptitle(f"P4 {cases['board']} / {cases['activeTrial']} — actual saved native states", fontsize=16)
fig.text(.5, .015, 'Diagnostic only: supplied 2D geometry, no art / lintel-height / Pixi / receiver-front PASS.', ha='center', fontsize=10)
fig.tight_layout(rect=[0, .05, 1, .91])
fig.savefig(root / 'critical-native.png', dpi=130)
plt.close(fig)
print(root / 'critical-native.png')
