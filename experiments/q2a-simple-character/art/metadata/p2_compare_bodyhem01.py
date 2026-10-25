"""Diagnostic enlarged comparison only; no accepted asset pixels modified."""
from pathlib import Path
from PIL import Image,ImageDraw
root=Path(__file__).resolve().parents[1]
out=Image.new('RGB',(860,510),(238,238,232));d=ImageDraw.Draw(out)
for x,name,title in [(10,'attempt03_raw.png','Baseline body'),(440,'p2_bodyhem01_raw.png','Local hem edit attempt')]:
 im=Image.open(root/'source'/name).crop((75,300,215,440)).convert('RGBA')
 bg=Image.new('RGBA',im.size,(238,238,232,255));bg.alpha_composite(im)
 out.paste(bg.convert('RGB').resize((420,420),Image.Resampling.NEAREST),(x,35))
 d.text((x,10),title,fill=(20,20,20))
out.save(root/'metadata/p2_bodyhem01_compare.png')
