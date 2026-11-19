from pathlib import Path
from PIL import Image
import json,numpy as np,hashlib,shutil
P=Path(r"K:\Agents\R4D\Review\HO-TP-01\assets\v001")
R=Path(r"D:\dev\R4D\experiments\hidden-object\HO-TP-01\art")
x,y,w,h=176,535,480,320
a=np.array(Image.open(P/"mask_bread_alpha_v002.png"))
# Lock the entire CTO approximate fragment rectangle as well as its actual protected silhouette.
a[695:731,495:546]=0
pr=np.array(Image.open(P/"protected_bread_v002.png"));pr[695:731,495:546]=255
for f in ["mask_bread_alpha_v003.png","protected_bread_v003.png","patch_bread_rgba_v003.png","state_bread_removed_v003.png","inspect_state_bread_2x_v003.png"]:
 if (P/f).exists():raise FileExistsError(f)
Image.fromarray(a).save(P/"mask_bread_alpha_v003.png")
Image.fromarray(pr).save(P/"protected_bread_v003.png")
patch=Image.open(P/"aligned_bread_v002.png").convert("RGBA")
patch.putalpha(Image.fromarray(a[y:y+h,x:x+w]))
patch.save(P/"patch_bread_rgba_v003.png")
full=Image.open(P/"original_C2_exact.png").convert("RGBA")
full.alpha_composite(patch,(x,y))
state=full.convert("RGB");state.save(P/"state_bread_removed_v003.png")
state.crop((x,y,x+w,y+h)).resize((w*2,h*2),Image.Resampling.NEAREST).save(P/"inspect_state_bread_2x_v003.png")
o=np.array(Image.open(P/"original_C2_exact.png").convert("RGB"))
d=np.any(np.array(state)!=o,axis=2)
assert int(d[695:731,495:546].sum())==0
assert not np.any(d & (pr>0))
dst=R/"mask_bread_alpha_v003.png"
if dst.exists():raise FileExistsError(dst)
shutil.copyfile(P/"mask_bread_alpha_v003.png",dst)
print(json.dumps({"changed_pixels":int(d.sum()),"CTO_fragment_rectangle_changed_pixels":0,"protected_shapes_changed_pixels":0,"final_bread_state":str(P/"state_bread_removed_v003.png")}))

