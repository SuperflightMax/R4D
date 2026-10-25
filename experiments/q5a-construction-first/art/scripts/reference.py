"""Deterministic rasterization of the approved SVG polygons, not art generation."""
from pathlib import Path
import re
import xml.etree.ElementTree as ET
from PIL import Image, ImageDraw

ART = Path(__file__).resolve().parents[1]
SOURCE = ART.parent / 'construction' / 'bind-registration.svg'
OUT = ART / 'reference' / 'bind-registration.png'

def render():
    root = ET.fromstring(SOURCE.read_bytes())
    factor = 3
    canvas = Image.new('RGBA', (1024*factor, 1024*factor))
    draw = ImageDraw.Draw(canvas)
    def walk(node, matrix=(1,1,0,0)):
        sx,sy,tx,ty=matrix
        for name,args in re.findall(r'(translate|scale)\(([^)]+)\)',node.get('transform','')):
            a=list(map(float,re.split(r'[ ,]+',args)))
            if name=='translate': tx+=sx*a[0];ty+=sy*(a[1] if len(a)>1 else 0)
            else: sx*=a[0];sy*=a[1] if len(a)>1 else a[0]
        if node.tag.endswith('polygon'):
            values=list(map(float,re.findall(r'-?\d+(?:\.\d+)?',node.get('points'))))
            points=[((sx*x+tx)*factor,(sy*y+ty)*factor) for x,y in zip(values[::2],values[1::2])]
            draw.polygon(points, fill=node.get('fill','#cccccc'))
            if node.get('stroke') and node.get('stroke')!='none':
                draw.line(points+[points[0]],fill=node.get('stroke'),width=max(1,round(float(node.get('stroke-width','1'))*abs(sx)*factor)),joint='curve')
        for child in node: walk(child,(sx,sy,tx,ty))
    walk(root)
    OUT.parent.mkdir(parents=True,exist_ok=True)
    canvas.resize((1024,1024),Image.Resampling.LANCZOS).save(OUT)
    print(OUT)

if __name__=='__main__': render()
