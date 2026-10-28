"""Art-only contact sheet from Builder's actual native seed-0 states.

No trajectories are invented and no sim is replaced. This is a static self-check,
not the Pixi/browser integration check and not an independent QA verdict.
"""
import json
import subprocess
from pathlib import Path
from PIL import Image, ImageDraw

ROOT = Path(__file__).resolve().parent
OUT = Path(r'E:\R4D\perspective\p3-runtime\asset-artist\inspection')
SOURCE = Path(r'K:\Agents\R4D\Assets\perspective\01-jungle.jpg')
TRACE = Path(r'E:\R4D\perspective\p3-runtime\builder\run0-source-samples.json')
TICKS = [40,55,65,75,85,93,94,95,105,130,160,200]

def main():
    states = json.loads(TRACE.read_text())
    assets = json.loads((ROOT/'assets.json').read_text())
    src = Image.open(SOURCE).convert('RGBA')
    raw_ball = Image.open(ROOT/assets['ball']['path'])
    raw_shadow = Image.open(ROOT/assets['shadow']['path'])
    sheet = Image.new('RGB',(4*420,3*440),(34,37,33))
    report=[]
    for k,tick in enumerate(TICKS):
        s=states[tick];x,y,r=s['x'],s['y'],s['r']
        scene=src.copy()
        # Only this preview approximates the local shadow homography by its
        # local image-plane ellipse; the consumer uses the exact floor mesh.
        shadow_scale_x=r/assets['shadow']['radiusPx']*assets['shadow']['scaleRadius'][0]
        shadow_scale_y=r/assets['shadow']['radiusPx']*assets['shadow']['scaleRadius'][1]*0.49
        sh=raw_shadow.resize((round(raw_shadow.width*shadow_scale_x),round(raw_shadow.height*shadow_scale_y)),Image.Resampling.LANCZOS)
        sh.putalpha(sh.getchannel('A').point(lambda a:round(a*assets['shadow']['alpha'])))
        sx=round(x-r*.45-assets['shadow']['anchorPx'][0]*shadow_scale_x)
        sy=round(y+r*.5*.49-assets['shadow']['anchorPx'][1]*shadow_scale_y)
        scene.alpha_composite(sh,(sx,sy))
        scale=r/assets['ball']['radiusPx']
        ball=raw_ball.resize((round(raw_ball.width*scale),round(raw_ball.height*scale)),Image.Resampling.LANCZOS)
        bx=round(x-assets['ball']['anchorPx'][0]*scale)
        by=round(y-r*.65-assets['ball']['anchorPx'][1]*scale)
        scene.alpha_composite(ball,(bx,by))
        for o in assets['occluders']:
            depth=o.get('depthNativeY')
            if 'depthLineNative' in o:
                (x1,y1),(x2,y2)=o['depthLineNative']
                t=0 if x1==x2 else max(0,min(1,(s['native']['x']-x1)/(x2-x1)))
                depth=y1+t*(y2-y1)
            if s['native']['y'] >= depth:continue
            ox,oy,w,h=o['rectPx'];alpha=Image.open(ROOT/o['path']).getchannel('A')
            original=src.crop((ox,oy,ox+w,oy+h));original.putalpha(alpha)
            scene.alpha_composite(original,(ox,oy))
        tile=scene.crop((665,270,875,470)).resize((420,400))
        left=(k%4)*420;top=(k//4)*440
        sheet.paste(tile,(left,top+40))
        ImageDraw.Draw(sheet).text((left+5,top+8),f'actual native seed0 tick{tick}',fill='white')
        report.append(s)
    OUT.mkdir(parents=True,exist_ok=True)
    sheet.save(OUT/'early-real-ticks.png')
    (OUT/'early-real-ticks.json').write_text(json.dumps({'trace':str(TRACE),'ticks':report,'renderer':'art-only static; not Pixi integration'},indent=2)+'\n')
    print(OUT/'early-real-ticks.png')

if __name__=='__main__':main()
