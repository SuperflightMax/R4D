from pathlib import Path
from PIL import Image,ImageDraw
import numpy as np,json
V1=Path(r"K:\Agents\R4D\Review\HO-TP-01\assets\v001")
V2=Path(r"K:\Agents\R4D\Review\HO-TP-01\assets\v002")
src=Image.open(V1/"original_C2_exact.png").convert("RGB");oa=np.array(src)
patch=Image.open(V2/"patch_bowl_corrected_rgba_v002.png").convert("RGBA")
alpha=Image.new("L",src.size,0);alpha.paste(patch.getchannel("A"),(464,480))
params=json.loads((V2/"upper_seam_parameters_v002.json").read_text())
protect=Image.new("L",src.size,0);d=ImageDraw.Draw(protect)
for key in ["protected_cord","protected_block"]:d.polygon([tuple(p) for p in params[key]],fill=255)
d.rectangle((495,695,545,730),fill=255)
a=np.array(alpha);pr=np.array(protect)>0;a[pr]=0
patch.putalpha(Image.fromarray(a[480:736,464:848]))
def save(im,n):
 p=V2/n
 if p.exists():raise FileExistsError(p)
 im.save(p)
save(patch,"patch_bowl_corrected_rgba_v003.png")
save(Image.fromarray(a),"replacement_bowl_alpha_v003.png")
save(protect,"protected_cord_block_fragment_v003.png")
bowl=src.convert("RGBA");bowl.alpha_composite(patch,(464,480));bowl=bowl.convert("RGB")
save(bowl,"state_bowl_removed_corrected_v003.png")
bread=Image.open(V1/"patch_bread_rgba_v003.png").convert("RGBA")
both=src.convert("RGBA");both.alpha_composite(bread,(176,535));both.alpha_composite(patch,(464,480));both=both.convert("RGB")
reverse=src.convert("RGBA");reverse.alpha_composite(patch,(464,480));reverse.alpha_composite(bread,(176,535));reverse=reverse.convert("RGB")
assert np.array_equal(np.array(both),np.array(reverse))
save(both,"state_both_removed_v003.png")
save(bowl.crop((464,480,848,736)).resize((768,512),Image.Resampling.NEAREST),"inspect_bowl_corrected_2x_v003.png")
save(bowl.crop((520,540,755,615)).resize((1175,375),Image.Resampling.NEAREST),"inspect_upper_corrected_5x_v003.png")
oldpr=np.array(Image.open(V1/"protected_bowl_v004.png"))>0
diff=np.any(np.array(bowl)!=oa,axis=2)
changed=diff&oldpr;q=np.argwhere(changed)
assert not np.any(diff&pr)
stats={"final_protected_cord_block_fragment_changed_pixels":int((diff&pr).sum()),"old_protected_mask_changed_pixels":int(changed.sum()),"old_protected_changed_bbox_xyxy":None if not len(q) else [int(q[:,1].min()),int(q[:,0].min()),int(q[:,1].max()+1),int(q[:,0].max()+1)],"offline_order_difference_pixels":0}
(V2/"final_edge_lock_metrics_v003.json").write_text(json.dumps(stats,indent=2),encoding="utf-8")
print(json.dumps(stats))

