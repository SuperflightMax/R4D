from pathlib import Path
from PIL import Image,ImageDraw
p=Path(r"K:\Agents\R4D\Review\HO-TP-01\assets\v001")
im=Image.open(p/"original_C2_exact.png").convert("RGB")
box=(500,530,770,615);scale=4;pad=32
view=Image.new("RGB",((box[2]-box[0])*scale+pad,(box[3]-box[1])*scale+pad),(35,35,35))
view.paste(im.crop(box).resize(((box[2]-box[0])*scale,(box[3]-box[1])*scale),Image.Resampling.NEAREST),(pad,pad))
d=ImageDraw.Draw(view)
for x in range(500,771,10):
    px=pad+(x-500)*scale
    d.line((px,pad,px,view.height),fill=(140,80,90),width=1)
    d.text((px-8,4),str(x),fill=(255,255,255))
for y in range(530,616,10):
    py=pad+(y-530)*scale
    d.line((pad,py,view.width,py),fill=(140,80,90),width=1)
    d.text((1,py-4),str(y),fill=(255,255,255))
out=p/"inspect_bowl_top_grid_v001.png"
if out.exists():raise FileExistsError(out)
view.save(out)

