from pathlib import Path
from PIL import Image,ImageDraw
import numpy as np,cv2,json,hashlib,shutil
V1=Path(r"K:\Agents\R4D\Review\HO-TP-01\assets\v001")
V2=Path(r"K:\Agents\R4D\Review\HO-TP-01\assets\v002")
R=Path(r"D:\dev\R4D\experiments\hidden-object\HO-TP-01\art")
SRC=V1/"original_C2_exact.png"
bread_left=[(269,685),(272,674),(279,663),(287,655),(297,646),(309,642),(319,637),(332,635),(343,636),(351,640),(361,638),(369,642),(377,645),(384,651),(391,657),(400,660),(408,666),(414,674),(415,680),(413,685),(419,687),(420,692),(419,697),(422,700),(423,705),(419,708),(420,711),(414,714),(414,718),(406,720),(400,724),(393,726),(383,729),(370,731),(356,732),(342,731),(328,731),(315,727),(304,722),(290,717),(280,709),(274,700)]
bread_right=[(375,641),(379,632),(389,625),(401,623),(414,626),(424,627),(431,629),(443,628),(453,630),(464,637),(472,644),(480,654),(488,666),(495,680),(497,688),(493,696),(484,702),(474,706),(462,705),(450,700),(441,694),(431,689),(424,680),(414,669),(405,660),(395,653),(386,648)]
bowl=[(521,575),(531,573),(543,570),(553,567),(564,564),(575,560),(586,559),(597,560),(608,562),(621,564),(635,564),(649,564),(661,563),(674,565),(688,565),(700,567),(715,568),(728,570),(741,573),(746,577),(744,588),(738,605),(731,617),(720,629),(708,636),(690,641),(671,645),(649,647),(627,646),(608,643),(590,641),(575,637),(560,630),(548,621),(538,609),(530,593),(525,582)]
block=[(486,620),(501,618),(548,624),(557,629),(557,641),(542,648),(483,639),(483,625)]
cord=[(738,564),(749,566),(759,579),(761,599),(770,636),(766,676),(754,676),(751,628),(745,602),(742,582)]
config={"bread":{"polygons":[bread_left,bread_right],"exclude":[block,cord],"crop":[176,535,480,320]},"bowl":{"polygons":[bowl],"exclude":[block,cord],"crop":[464,480,384,256]}}
source=Image.open(SRC).convert("RGB")
stats={}
for n,c in config.items():
 im=Image.new("L",source.size,0);d=ImageDraw.Draw(im)
 for p in c["polygons"]:d.polygon(p,fill=255)
 for p in c["exclude"]:d.polygon(p,fill=0)
 d.rectangle((495,695,545,730),fill=0)
 a=np.array(im)
 a=cv2.erode(a,np.ones((3,3),np.uint8),iterations=1,borderType=cv2.BORDER_CONSTANT,borderValue=0)
 a=(a>0).astype(np.uint8)*255
 out=V2/f"hit_{n}_L_v002.png"
 if out.exists():raise FileExistsError(out)
 Image.fromarray(a).save(out)
 assert np.all(a[:480]==0);assert np.all(a[:,960:]==0)
 assert np.all(a[695:731,495:546]==0)
 x,y,w,h=c["crop"]
 base=source.crop((x,y,x+w,y+h))
 tint=Image.new("RGB",base.size,(15,190,240))
 overlay=Image.composite(tint,base,Image.fromarray(a[y:y+h,x:x+w]).point(lambda q:int(q*.5)))
 overlay.resize((w*2,h*2),Image.Resampling.NEAREST).save(V2/f"inspect_hit_{n}_2x_v002.png")
 dst=R/out.name
 if dst.exists():raise FileExistsError(dst)
 shutil.copyfile(out,dst)
 count,labels=cv2.connectedComponents((a>0).astype(np.uint8))
 stats[n]={"path":str(out),"mode":"L","size":list(source.size),"values":np.unique(a).tolist(),"nonzero_pixels":int((a>0).sum()),"bbox_xyxy":Image.fromarray(a).getbbox(),"connected_components":int(count-1),"native_inner_guard_px":1,"feather":False,"sha256":hashlib.sha256(out.read_bytes()).hexdigest()}
config.update({"source_sha256":hashlib.sha256(SRC.read_bytes()).hexdigest(),"rule":"hand-traced visible body polygons, protected stationary shapes excluded; binary L, 1-native-pixel conservative inward guard, no contact shadows or replacement feather","outputs":stats})
(V2/"hit_mask_parameters_v002.json").write_text(json.dumps(config,indent=2),encoding="utf-8")
dst=R/"hit_mask_parameters_v002.json"
if dst.exists():raise FileExistsError(dst)
shutil.copyfile(V2/"hit_mask_parameters_v002.json",dst)
print(json.dumps(stats))

