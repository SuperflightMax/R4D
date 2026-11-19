from pathlib import Path
from PIL import Image,ImageDraw
import json,hashlib
V1=Path(r"K:\Agents\R4D\Review\HO-TP-01\assets\v001")
V2=Path(r"K:\Agents\R4D\Review\HO-TP-01\assets\v002")
V2.mkdir(parents=True,exist_ok=True)
m=json.loads((V1/"manifest_v001.json").read_text(encoding="utf-8"))
source=Path(m["source_original_png"]["path"])
assert hashlib.sha256(source.read_bytes()).hexdigest()==m["source_original_png"]["sha256"]
baseline={str(p):hashlib.sha256(p.read_bytes()).hexdigest() for p in V1.iterdir() if p.is_file()}
out=V2/"v001_frozen_hashes_before.json"
if out.exists():raise FileExistsError(out)
out.write_text(json.dumps(baseline,indent=2),encoding="utf-8")
box=(520,540,755,610);scale=5;pad=38
orig=Image.open(source).convert("RGB")
raw=Image.open(V1/"aligned_bowl_v002.png").convert("RGB")
partial=Image.open(V1/"state_bowl_removed_v002.png").convert("RGB")
inputs=[("source",orig.crop(box)),("aligned_raw",raw.crop((box[0]-464,box[1]-480,box[2]-464,box[3]-480))),("partial_state",partial.crop(box))]
for name,im in inputs:
 view=Image.new("RGB",(im.width*scale+pad,im.height*scale+pad),(30,30,30))
 view.paste(im.resize((im.width*scale,im.height*scale),Image.Resampling.NEAREST),(pad,pad))
 d=ImageDraw.Draw(view)
 for x in range(520,756,10):
  px=pad+(x-520)*scale;d.line((px,pad,px,view.height),fill=(115,80,90),width=1);d.text((px-10,5),str(x),fill="white")
 for y in range(540,611,5):
  py=pad+(y-540)*scale;d.line((pad,py,view.width,py),fill=(115,80,90),width=1);d.text((1,py-4),str(y),fill="white")
 dst=V2/f"inspect_upper_{name}_grid_v002.png"
 if dst.exists():raise FileExistsError(dst)
 view.save(dst)
print(json.dumps({"source":str(source),"source_sha256":m["source_original_png"]["sha256"],"v001_files_frozen":len(baseline),"view_box_xyxy":box,"v002":str(V2)}))

