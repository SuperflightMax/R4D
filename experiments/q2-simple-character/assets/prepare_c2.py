"""Technical extraction of two imagegen replacements; c1 physical joints stay fixed.
Default: staging only. --publish copies the two PNGs and manifest to public/art.
Run baseline prepare_parts.py only to reproduce c1; run this script afterward for c2.
"""
from pathlib import Path
from PIL import Image
import json,copy,shutil,sys,hashlib
from prepare_parts import largest_component

BASE=Path(__file__).resolve().parent
ARCHIVE=BASE/'comparison/q2-c1/art'
STAGE=BASE/'comparison/q2-c2-art/art'
PUBLIC=BASE.parent/'public/art'
SOURCE=BASE/'source/thighs-c2-v1.png'
SPECS={
 'thighNear':dict(crop=(370,45,685,952),pivot=(527,90),distal=(527,820),sx=.28),
 'thighFar':dict(crop=(870,45,1185,952),pivot=(1027,90),distal=(1027,820),sx=.27),
}

def main():
    STAGE.joinpath('parts').mkdir(parents=True,exist_ok=True)
    manifest=json.loads((ARCHIVE/'manifest.json').read_text(encoding='utf-8'))
    source=Image.open(SOURCE).convert('RGBA')
    for part in manifest['parts']:
        name=part['id']
        if name not in SPECS:
            shutil.copy2(ARCHIVE/'parts'/f'{name}.png',STAGE/'parts'/f'{name}.png')
            continue
        spec=SPECS[name];rect=spec['crop'];pv=spec['pivot'];distal=spec['distal']
        im=largest_component(source.crop(rect));box=im.getbbox()
        box=(max(0,box[0]-3),max(0,box[1]-3),min(im.width,box[2]+3),min(im.height,box[3]+3))
        im=im.crop(box)
        sy=127.68/(distal[1]-pv[1]);sx=spec['sx']
        size=(round(im.width*sx),round(im.height*sy))
        actual=(size[0]/im.width,size[1]/im.height)
        im=im.resize(size,Image.Resampling.LANCZOS)
        im.save(STAGE/'parts'/f'{name}.png')
        part.update(pivot=[round((pv[0]-rect[0]-box[0])*actual[0],3),round((pv[1]-rect[1]-box[1])*actual[1],3)],size=list(size),source='source/thighs-c2-v1.png',sourceCrop=list(rect),sourcePivot=list(pv),technicalScale=list(actual),distalJoint=[0,127.68],correction='c2 compact proximal cloth; same physical root, knee joint and layer')
    manifest['artRevision']='q2-c2-art-v1'
    (STAGE/'manifest.json').write_text(json.dumps(manifest,ensure_ascii=False,indent=2)+'\n',encoding='utf-8')
    if '--publish' in sys.argv:
        for name in SPECS: shutil.copy2(STAGE/'parts'/f'{name}.png',PUBLIC/'parts'/f'{name}.png')
        shutil.copy2(STAGE/'manifest.json',PUBLIC/'manifest.json')
    print(json.dumps(dict(stage=str(STAGE),published='--publish' in sys.argv,changedParts=list(SPECS)),ensure_ascii=False))

if __name__=='__main__': main()
