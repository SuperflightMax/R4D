from pathlib import Path
from PIL import Image
import numpy as np,json,shutil,hashlib
P=Path(r"K:\Agents\R4D\Review\HO-TP-01\assets\v001")
R=Path(r"D:\dev\R4D\experiments\hidden-object\HO-TP-01\art")
o=np.array(Image.open(P/"original_C2_exact.png").convert("RGB"))
stats={}
for n,v in [("bread","v002"),("bowl","v004")]:
 s=np.array(Image.open(P/f"state_{n}_removed_v002.png").convert("RGB"))
 d=np.any(s!=o,axis=2)
 protected=np.array(Image.open(P/f"protected_{n}_{v}.png"))>0
 stats[n]={"protected_shapes_changed_pixels":int(np.count_nonzero(d&protected)),"CTO_fragment_approx_rectangle_changed_pixels":int(d[695:731,495:546].sum()),"cloth_front_sample_changed_pixels":int(d[770:941,180:370].sum()),"cloth_rear_sample_changed_pixels":int(d[530:550,590:710].sum()),"wooden_block_sample_changed_pixels":int(d[624:640,491:545].sum())}
 assert stats[n]["protected_shapes_changed_pixels"]==0
 for suffix in ["alpha"]:
  src=P/f"mask_{n}_{suffix}_{v}.png"
  dst=R/f"mask_{n}_{suffix}_{v}.png"
  if dst.exists():raise FileExistsError(dst)
  shutil.copyfile(src,dst)
src=P/"mask_refinement_v002.json";dst=R/"mask_refinement_v002.json"
if dst.exists():raise FileExistsError(dst)
shutil.copyfile(src,dst)
assert hashlib.sha256((P/"original_C2_exact.png").read_bytes()).hexdigest()=="f6f96897290470778067ae15cba408418673f7578c38195736bee60fb822a65e"
(P/"preservation_checks_v001.json").write_text(json.dumps(stats,indent=2),encoding="utf-8")
print(json.dumps(stats))

