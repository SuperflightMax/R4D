from pathlib import Path
from PIL import Image, ImageDraw, ImageFilter
import json, numpy as np, cv2
OUT=Path(r"K:\Agents\R4D\Review\HO-TP-01\assets\v001")
# Coordinates are full-source pixels; polygons are technical edit-support, not generated art.
CONFIG={
"bread":{"crop":[176,535,480,320],"support":[[264,685],[267,673],[274,661],[282,650],[296,641],[310,636],[320,632],[335,630],[347,631],[355,635],[365,631],[375,634],[378,625],[390,620],[405,619],[420,621],[432,624],[448,625],[461,631],[472,639],[482,650],[491,663],[499,678],[501,689],[496,699],[488,706],[478,713],[465,713],[450,710],[438,706],[432,705],[430,711],[423,717],[413,723],[405,729],[395,733],[383,736],[366,738],[346,739],[325,737],[308,733],[294,728],[282,722],[273,712],[267,701]],
"protected_polygons":[[[490,704],[494,696],[504,692],[507,687],[518,687],[526,684],[534,679],[542,678],[545,683],[544,693],[549,700],[542,708],[539,716],[545,722],[531,726],[518,727],[506,723],[496,721]]],
"protected_boxes":[[420,713,440,728],[448,717,480,740],[335,741,414,754]]},
"bowl":{"crop":[464,480,384,256],"support":[[518,575],[522,570],[533,569],[544,568],[553,561],[565,558],[579,554],[595,551],[613,551],[631,551],[650,554],[668,558],[686,560],[704,563],[719,564],[733,565],[744,568],[751,573],[752,582],[749,596],[742,611],[734,623],[721,635],[705,643],[686,650],[663,654],[640,655],[616,652],[592,648],[572,642],[553,633],[539,620],[530,607],[523,591]],
"protected_polygons":[],"protected_boxes":[[482,616,559,650]]}
}
S=4
for name,c in CONFIG.items():
    m=Image.new("L",(1672*S,941*S),0)
    d=ImageDraw.Draw(m)
    d.polygon([(x*S,y*S) for x,y in c["support"]],fill=255)
    # CTO-preserved detached fragment and separately visible crumbs/wooden block.
    for p in c["protected_polygons"]:
        d.polygon([(x*S,y*S) for x,y in p],fill=0)
    for x0,y0,x1,y1 in c["protected_boxes"]:
        d.rectangle((x0*S,y0*S,x1*S,y1*S),fill=0)
    m=m.resize((1672,941),Image.Resampling.LANCZOS)
    a=np.array(m)
    a[(a<8)]=0
    a[(a>247)]=255
    # A two-pixel inward alpha ramp. No generated artistic texture is drawn here.
    hard=(a>=128).astype(np.uint8)
    dist=cv2.distanceTransform(hard,cv2.DIST_L2,3)
    alpha=np.minimum(a,np.clip(dist/2.0*255.0,0,255).astype(np.uint8))
    alpha[hard==0]=0
    full=Image.fromarray(a)
    fade=Image.fromarray(alpha)
    for path in [OUT/f"mask_{name}_support_v001.png",OUT/f"mask_{name}_alpha_v001.png",OUT/f"guide_{name}_v001.png",OUT/f"inspect_{name}_mask_overlay_v001.png"]:
        if path.exists():raise FileExistsError(path)
    full.save(OUT/f"mask_{name}_support_v001.png")
    fade.save(OUT/f"mask_{name}_alpha_v001.png")
    x,y,w,h=c["crop"]
    full.crop((x,y,x+w,y+h)).save(OUT/f"guide_{name}_v001.png")
    src=Image.open(OUT/f"target_{name}_v001.png").convert("RGB")
    tint=Image.new("RGB",src.size,(240,30,110))
    overlay=Image.composite(tint,src,full.crop((x,y,x+w,y+h)).point(lambda v:int(v*0.42)))
    overlay.resize((w*2,h*2),Image.Resampling.NEAREST).save(OUT/f"inspect_{name}_mask_overlay_v001.png")
    c["alpha_rule"]="manual support minus protected shapes; antialias 4x; inward 2px distance ramp; no alpha outside support"
    c["mask_full_size"]=[1672,941]
config_path=OUT/"mask_parameters_v001.json"
if config_path.exists():raise FileExistsError(config_path)
config_path.write_text(json.dumps(CONFIG,indent=2),encoding="utf-8")
print(json.dumps({n: {"support_bbox":Image.open(OUT/f"mask_{n}_alpha_v001.png").getbbox()} for n in CONFIG}))

