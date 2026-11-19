from pathlib import Path
from PIL import Image,ImageDraw
import numpy as np,cv2,json,hashlib,shutil
V1=Path(r"K:\Agents\R4D\Review\HO-TP-01\assets\v001")
V2=Path(r"K:\Agents\R4D\Review\HO-TP-01\assets\v002")
R=Path(r"D:\dev\R4D\experiments\hidden-object\HO-TP-01\art")
c=json.loads((V2/"hit_mask_parameters_v002.json").read_text())
b=c["bowl"]
m=Image.new("L",(1672,941),0);d=ImageDraw.Draw(m)
for p in b["polygons"]:d.polygon([tuple(q) for q in p],fill=255)
for p in b["exclude"]:d.polygon([tuple(q) for q in p],fill=0)
d.rectangle((495,695,545,730),fill=0)
a=cv2.erode(np.array(m),np.ones((5,5),np.uint8),iterations=1,borderType=cv2.BORDER_CONSTANT,borderValue=0)
a=(a>0).astype(np.uint8)*255
p=V2/"hit_bowl_L_v003.png"
if p.exists():raise FileExistsError(p)
Image.fromarray(a).save(p)
shutil.copyfile(p,R/p.name)
x,y,w,h=b["crop"]
source=Image.open(V1/"original_C2_exact.png").convert("RGB").crop((x,y,x+w,y+h))
ov=Image.composite(Image.new("RGB",source.size,(15,190,240)),source,Image.fromarray(a[y:y+h,x:x+w]).point(lambda q:int(q*.5)))
ov.resize((w*2,h*2),Image.Resampling.NEAREST).save(V2/"inspect_hit_bowl_2x_v003.png")
c["outputs"]["bowl"].update(path=str(p),nonzero_pixels=int((a>0).sum()),bbox_xyxy=Image.fromarray(a).getbbox(),native_inner_guard_px=2,sha256=hashlib.sha256(p.read_bytes()).hexdigest())
c["rule"]="source hand-traced visible silhouettes; binary L 0/255; no feather; conservative inward guard bread 1px, bowl 2px to avoid bottom contact shadow; excluded stationary fragment/block/cord"
(V2/"hit_mask_parameters_v003.json").write_text(json.dumps(c,indent=2),encoding="utf-8")
shutil.copyfile(V2/"hit_mask_parameters_v003.json",R/"hit_mask_parameters_v003.json")
print(json.dumps(c["outputs"]["bowl"]))

