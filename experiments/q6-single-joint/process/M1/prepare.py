from pathlib import Path
import hashlib, json, shutil
from PIL import Image, ImageDraw

ROOT = Path(__file__).resolve().parents[2]
def sha(p): return hashlib.sha256(p.read_bytes()).hexdigest()
def savejson(p, value): p.write_text(json.dumps(value, ensure_ascii=False, indent=2)+'\n', encoding='utf-8')
contract = json.loads((ROOT/'FROZEN_CONTRACT.json').read_text(encoding='utf-8'))
assert sha(ROOT/'FROZEN_CONTRACT.json') == 'e1dbd83ca86f2c723c5ec51fc97fb85aa06236c88c628c728893005ca284380a'
src=ROOT/'provenance/source'
for rel, expected in contract['source']['sha256'].items(): assert sha(src/rel)==expected, rel
for d in ['process/M1','process/M2','process/J2','art/J0','art/J1','art/J2','art/M1','art/M2']:
    (ROOT/d).mkdir(parents=True,exist_ok=True)
atlas=Image.new('RGBA',(512,512))
mask=Image.new('L',(512,512),0)
layout=Image.new('RGB',(512,512),'#f0f0f0'); draw=ImageDraw.Draw(layout)
for name in ['thigh','shin']:
    slot=contract['atlas_contract']['slots'][name]
    p=src/f'assets/parts/{name}_near.png'
    part=Image.open(p).convert('RGBA')
    atlas.paste(part,tuple(slot['source_placement']))
    shutil.copyfile(p, ROOT/f'art/J0/{name}_near.png')
    rect=contract['atlas_contract']['hidden_repair_masks'][name+'_atlas_rect']
    ImageDraw.Draw(mask).rectangle((rect[0],rect[1],rect[2]-1,rect[3]-1),fill=255)
    native=Image.new('L',part.size,0)
    nr=contract['atlas_contract']['hidden_repair_masks'][name+'_native_rect']
    ImageDraw.Draw(native).rectangle((nr[0],nr[1],nr[2]-1,nr[3]-1),fill=255)
    native.save(ROOT/f'process/M2/{name}_mask.png')
    draw.rectangle(tuple(slot['crop']),outline='#222222',width=2)
    draw.rectangle((rect[0],rect[1],rect[2]-1,rect[3]-1),outline='#e04040',width=2)
    x,y=slot['pivot_on_atlas']; draw.line((x-6,y,x+6,y),fill='#00a060',width=2); draw.line((x,y-6,x,y+6),fill='#00a060',width=2)
atlas.save(ROOT/'process/M1/source-atlas.png')
layout.save(ROOT/'process/M1/layout.png')
mask.save(ROOT/'process/M2/atlas-mask.png')
Image.open(src/'assets/sky_courier_master.png').crop((139,920,278,1090)).save(ROOT/'process/J2/master-crop.png')
savejson(ROOT/'process/M1/preparation.json', {'contract_sha256':sha(ROOT/'FROZEN_CONTRACT.json'),'source_hashes_verified':contract['source']['sha256'],'atlas_placement':'byte-exact RGBA paste without alpha blending','mask':'255 editable, 0 protected, no feather','layout':'black crop boxes, red repair boxes, green semantic pivots; reference only, never final art','software':'Pillow','generation_calls_before':0})
print('Prepared source atlas, layout, binary masks and J0 exact copies; source hashes verified.')
