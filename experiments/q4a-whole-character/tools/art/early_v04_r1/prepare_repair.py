"""Prepare bounded, source-derived shoulder repair request; does not alter raw."""
from pathlib import Path
from PIL import Image,ImageDraw
import json,hashlib
ROOT=Path(__file__).resolve().parents[3];ART=ROOT/'art/early-v04-r1';OUT=ART/'repairs/tank-01';OUT.mkdir(parents=True,exist_ok=True)
src=ROOT/'art/whole-v04/raw/whole-v04.png';im=Image.open(src).convert('RGBA')
box=(320,220,660,560)
# Only projected hidden tank/axilla immediately behind near upper-arm.
poly=[(434,387),(448,394),(473,418),(507,445),(542,473),(566,491),(574,499),(579,478),(584,452),(584,430),(578,406),(568,382),(553,362),(538,344),(525,335),(507,344),(483,360),(458,374)]
m=Image.new('L',im.size);ImageDraw.Draw(m).polygon(poly,fill=255)
before=im.crop(box);before.save(OUT/'before.png')
m.crop(box).save(OUT/'hidden-subset-mask.png')
guide=before.copy();guide.paste((255,0,255,255),(0,0),m.crop(box));guide.save(OUT/'region-guide.png')
spec={'source':'art/whole-v04/raw/whole-v04.png','sourceSHA256':hashlib.sha256(src.read_bytes()).hexdigest(),'contextCropXYXY':list(box),'hiddenPolygonRaw':poly,'owner':'torso/tank; tiny axillary transition','purpose':'Continue same tank behind occluding near upper-arm only; no new whole, no visible deltoid change.','application':'Only this hidden subset may be taken from reconstruction; all outside remains source-extracted. Shape boundary is an estimate of unseen torso, not a claim of recovered original pixels.','status':'PRECALL_DEFINED'}
(OUT/'REQUEST.json').write_text(json.dumps(spec,indent=2)+'\n',encoding='utf-8')
print(json.dumps(spec))
