from pathlib import Path
from PIL import Image,ImageDraw
import numpy as np,json
V1=Path(r"K:\Agents\R4D\Review\HO-TP-01\assets\v001")
V2=Path(r"K:\Agents\R4D\Review\HO-TP-01\assets\v002")
x,y,w,h=500,520,280,160
target=Image.open(V2/"state_bowl_technical_trial_v001.png").convert("RGB").crop((x,y,x+w,y+h))
reference=Image.open(V1/"original_C2_exact.png").convert("RGB").crop((x,y,x+w,y+h))
edge=json.loads((V2/"technical_trial_parameters_v001.json").read_text())["edge_points_full_source"]
# Narrow seam reconstruction, exclusively in the former bowl silhouette.
points=[tuple(p) for p in edge if p[0]>=530 and p[0]<=744]+[(744,612),(530,612)]
mask=Image.new("L",(1672,941),0);d=ImageDraw.Draw(mask);d.polygon(points,fill=255)
cord=[(738,564),(749,566),(759,579),(761,599),(770,636),(766,676),(754,676),(751,628),(745,602),(742,582)]
block=[(486,620),(501,618),(548,624),(557,629),(557,641),(542,648),(483,639),(483,625)]
d.polygon(cord,fill=0);d.polygon(block,fill=0)
for name,im in [("target_upper_seam_v002.png",target),("reference_original_upper_seam_v002.png",reference),("guide_upper_seam_v002.png",mask.crop((x,y,x+w,y+h))),("mask_upper_seam_support_v002.png",mask)]:
 p=V2/name
 if p.exists():raise FileExistsError(p)
 im.save(p)
(V2/"upper_seam_parameters_v002.json").write_text(json.dumps({"crop_xywh":[x,y,w,h],"upper_edge":edge,"support_polygon":points,"protected_cord":cord,"protected_block":block},indent=2),encoding="utf-8")
print("New local edit target, original reference and technical guide prepared in v002.")

