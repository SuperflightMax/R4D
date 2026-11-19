from pathlib import Path
from PIL import Image
import numpy as np, cv2, json
P=Path(r"K:\Agents\R4D\Review\HO-TP-01\assets\v001")
from PIL import ImageDraw
S=(1672,941)
def poly_mask(polys,boxes=()):
 im=Image.new("L",S,0);d=ImageDraw.Draw(im)
 for p in polys:d.polygon(p,fill=255)
 for b in boxes:d.rectangle(b,fill=255)
 return np.array(im)>0
# Native-pixel hand traces of visible stationary linen/crumb surroundings.
linen_front=[(0,705),(176,705),(189,704),(199,708),(208,711),(219,717),(231,723),(242,719),(253,717),(264,721),(275,729),(286,733),(299,740),(312,743),(324,749),(336,751),(349,758),(361,763),(375,770),(386,777),(401,780),(407,793),(415,805),(410,941),(0,941)]
linen_back=[(500,480),(825,480),(825,625),(758,625),(749,596),(747,579),(742,573),(733,570),(719,567),(706,565),(692,564),(680,564),(670,563),(660,563),(650,564),(640,564),(630,563),(620,563),(609,562),(597,561),(586,559),(578,560),(567,562),(557,565),(547,567),(536,570),(524,573),(500,574)]
cord_right=[(740,565),(750,567),(759,579),(761,599),(770,636),(766,676),(754,676),(751,628),(745,602),(744,582)]
fragment=[(490,704),(494,696),(504,692),(507,687),(518,687),(526,684),(534,679),(542,678),(545,683),(544,693),(549,700),(542,708),(539,716),(545,722),(531,726),(518,727),(506,723),(496,721)]
block=[(486,620),(501,618),(548,624),(557,629),(557,641),(542,648),(483,639),(483,625)]
base_bread=np.array(Image.open(P/"mask_bread_support_v001.png"))>=128
base_bowl=np.array(Image.open(P/"mask_bowl_support_v003.png"))>=128
settings={
"bread":{"base":base_bread,"protect":poly_mask([linen_front,fragment,block],[(420,713,440,728),(448,717,480,740),(335,741,414,754)]),"version":"v002"},
"bowl":{"base":base_bowl,"protect":poly_mask([linen_back,cord_right,block,linen_front,fragment]),"version":"v004"}
}
stats={}
for n,c in settings.items():
 base=c["base"].astype(np.uint8)
 protect=c["protect"]
 # Extension includes immediate contact shadows and provides a wood-only blending band.
 core=cv2.dilate(base,cv2.getStructuringElement(cv2.MORPH_ELLIPSE,(9,9)))>0
 core[protect]=False
 distance=cv2.distanceTransform((~core).astype(np.uint8),cv2.DIST_L2,3)
 alpha=np.clip(1-distance/12.0,0,1)*255
 alpha[core]=255
 alpha[protect]=0
 # Preserve a 2px guard around stationary pixels; do not blur artistic texture.
 guard=cv2.distanceTransform((~protect).astype(np.uint8),cv2.DIST_L2,3)
 alpha*=np.minimum(guard/2.0,1.0)
 alpha[protect]=0
 alpha=np.rint(alpha).astype(np.uint8)
 alpha[alpha<2]=0
 im=Image.fromarray(alpha)
 path=P/f"mask_{n}_alpha_{c['version']}.png"
 prot=P/f"protected_{n}_{c['version']}.png"
 if path.exists() or prot.exists():raise FileExistsError(n)
 im.save(path);Image.fromarray((protect*255).astype(np.uint8)).save(prot)
 stats[n]={"alpha_path":str(path),"protected_path":str(prot),"bbox":im.getbbox(),"opaque_extension_px":4,"outer_feather_px":12,"protected_guard_px":2}
assert not np.any((np.array(Image.open(P/"mask_bread_alpha_v002.png"))>0)&(np.array(Image.open(P/"mask_bowl_alpha_v004.png"))>0))
(P/"mask_refinement_v002.json").write_text(json.dumps({"method":"technical opacity support/feather only; no texture synthesis","linen_front":linen_front,"linen_back":linen_back,"cord_right":cord_right,"fragment":fragment,"block":block,"outputs":stats},indent=2),encoding="utf-8")
print(json.dumps(stats))

