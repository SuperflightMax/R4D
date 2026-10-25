"""Render a scientific coverage mask; source/previous art are read-only."""
from pathlib import Path
from PIL import Image
import json
here=Path(__file__).resolve().parent
data=json.loads((here/'coverage-owners.json').read_text())
im=Image.new('RGBA',tuple(data['crop'][2:]),(240,240,234,255))
for side,color in [('near',(0,134,174)),('far',(206,39,132))]:
 for x,y,a in data[side]:im.putpixel((x,y),color+(255,))
im.save(here/'coverage.png')
