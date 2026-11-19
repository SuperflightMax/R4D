from pathlib import Path
from PIL import Image,ImageDraw
import json, numpy as np, cv2
P=Path(r"K:\Agents\R4D\Review\HO-TP-01\assets\v001")
c=json.loads((P/"mask_parameters_v001.json").read_text())["bowl"]
c["support"]=[[518,575],[521,571],[533,569],[546,566],[556,564],[566,561],[575,557],[585,557],[596,558],[606,560],[617,561],[629,561],[640,562],[650,562],[660,561],[671,562],[683,562],[694,563],[704,563],[715,565],[726,567],[736,569],[744,572],[748,576],[749,583],[747,596],[740,611],[732,623],[721,635],[705,643],[686,650],[663,654],[640,655],[616,652],[592,648],[572,642],[553,633],[539,620],[530,607],[523,591]]
S=4
m=Image.new("L",(1672*S,941*S),0);d=ImageDraw.Draw(m)
d.polygon([(x*S,y*S) for x,y in c["support"]],fill=255)
for x0,y0,x1,y1 in c["protected_boxes"]:d.rectangle((x0*S,y0*S,x1*S,y1*S),fill=0)
m=m.resize((1672,941),Image.Resampling.LANCZOS)
a=np.array(m);a[a<8]=0;a[a>247]=255
hard=(a>=128).astype(np.uint8)
dist=cv2.distanceTransform(hard,cv2.DIST_L2,3)
alpha=np.minimum(a,np.clip(dist/2*255,0,255).astype(np.uint8));alpha[hard==0]=0
x,y,w,h=c["crop"]
for name in ["mask_bowl_support_v002.png","mask_bowl_alpha_v002.png","guide_bowl_v002.png","inspect_bowl_mask_overlay_v002.png","mask_parameters_bowl_v002.json"]:
 if (P/name).exists():raise FileExistsError(name)
Image.fromarray(a).save(P/"mask_bowl_support_v002.png")
Image.fromarray(alpha).save(P/"mask_bowl_alpha_v002.png")
Image.fromarray(a).crop((x,y,x+w,y+h)).save(P/"guide_bowl_v002.png")
src=Image.open(P/"target_bowl_v001.png").convert("RGB")
over=Image.composite(Image.new("RGB",src.size,(240,30,110)),src,Image.fromarray(a).crop((x,y,x+w,y+h)).point(lambda v:int(v*.42)))
over.resize((w*2,h*2),Image.Resampling.NEAREST).save(P/"inspect_bowl_mask_overlay_v002.png")
(P/"mask_parameters_bowl_v002.json").write_text(json.dumps(c,indent=2),encoding="utf-8")
print({"bowl_alpha_bbox":Image.fromarray(alpha).getbbox(),"unchanged_visible_linen_sample":bool(np.all(alpha[540:556,580:700]==0))})

