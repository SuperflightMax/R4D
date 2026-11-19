from pathlib import Path
from PIL import Image
import numpy as np,json
V1=Path(r"K:\Agents\R4D\Review\HO-TP-01\assets\v001")
V2=Path(r"K:\Agents\R4D\Review\HO-TP-01\assets\v002")
src=Image.open(V1/"original_C2_exact.png").convert("RGB")
a=np.array(Image.open(V1/"mask_bowl_alpha_v004.png").convert("L"))
edge=[(518,575),(530,570),(545,566),(555,563),(565,559),(575,556),(585,557),(595,558),(605,560),(615,561),(625,562),(635,562),(645,561),(655,561),(665,562),(675,562),(685,563),(695,563),(705,564),(715,566),(725,568),(736,570),(744,574)]
for x in range(518,745):
 y=int(round(np.interp(x,[p[0] for p in edge],[p[1] for p in edge])))
 a[535:y,x]=0
 a[y:594,x]=255
# Preserve the actual original wood block, cord and all unrelated area as in accepted support.
protected=np.array(Image.open(V1/"protected_bowl_v004.png"))>0
# The old broad rear-linen exclusion caused the old rim; replace only the upper band with the new trace.
keep=protected.copy();keep[535:594,518:745]=False
a[keep]=0
patch=Image.open(V1/"aligned_bowl_v002.png").convert("RGBA")
patch.putalpha(Image.fromarray(a[480:736,464:848]))
full=src.convert("RGBA");full.alpha_composite(patch,(464,480));state=full.convert("RGB")
for name in ["mask_bowl_technical_trial_v001.png","state_bowl_technical_trial_v001.png","inspect_bowl_technical_trial_4x_v001.png"]:
 if (V2/name).exists():raise FileExistsError(name)
Image.fromarray(a).save(V2/"mask_bowl_technical_trial_v001.png")
state.save(V2/"state_bowl_technical_trial_v001.png")
state.crop((505,530,770,670)).resize((1060,560),Image.Resampling.NEAREST).save(V2/"inspect_bowl_technical_trial_4x_v001.png")
(V2/"technical_trial_parameters_v001.json").write_text(json.dumps({"edge_points_full_source":edge,"method":"exact alpha boundary trial, existing registered raw only; no new art"},indent=2),encoding="utf-8")
print("Technical boundary trial created in v002 only.")

