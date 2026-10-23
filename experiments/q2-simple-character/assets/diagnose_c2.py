"""Read-only diagnostic composition of archived c1 pixels at actual browser poses."""
from pathlib import Path
import json,math,sys
from PIL import Image,ImageDraw

BASE=Path(__file__).resolve().parent
ARC=BASE/'comparison/q2-c1'
ART=BASE/'comparison/q2-c2-art/art' if '--c2' in sys.argv else ARC/'art'
manifest=json.loads((ART/'manifest.json').read_text(encoding='utf-8'))
poses=json.loads((ARC/'poses.json').read_text(encoding='utf-8-sig'))
def render(pose,ids):
    canvas=Image.new('RGBA',(380,390),(220,230,215,255))
    draw=ImageDraw.Draw(canvas)
    for p in sorted(manifest['parts'],key=lambda p:p['layer']):
        if p['id'] not in ids: continue
        world=pose['world'][p['id']]
        im=Image.open(ART/'parts'/f"{p['id']}.png")
        pad=Image.new('RGBA',(1024,1024));pad.alpha_composite(im,(round(512-p['pivot'][0]),round(512-p['pivot'][1])))
        pad=pad.rotate(-math.degrees(world['angle']),resample=Image.Resampling.BICUBIC,center=(512,512))
        canvas.alpha_composite(pad,(round(150+world['x']-512),round(155+world['y']-512)))
    draw=ImageDraw.Draw(canvas)
    for key in ['torso','thighNear','thighFar','shinNear','shinFar']:
        t=pose['world'][key];x,y=150+t['x'],155+t['y']
        draw.ellipse((x-3,y-3,x+3,y+3),fill='red')
    return canvas
allids=[p['id'] for p in manifest['parts']]
groups=[('whole',allids),('torso',['torso']),('thighNear',['thighNear']),('thighFar',['thighFar'])]
sheet=Image.new('RGB',(380*4,420*2),'white');d=ImageDraw.Draw(sheet)
for row,name in enumerate(['low','air']):
    for col,(label,ids) in enumerate(groups):
        sheet.paste(render(poses[name],ids),(col*380,row*420+25))
        d.text((col*380+8,row*420+6),name+' / '+label,fill='black')
sheet.save(BASE/('comparison/c2-surface-diagnosis.png' if '--c2' in sys.argv else 'comparison/c1-surface-diagnosis.png'))
