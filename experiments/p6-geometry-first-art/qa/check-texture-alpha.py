"""Verify original texture alpha bounds; never edit source PNG bytes."""
import argparse,hashlib,json
from pathlib import Path
from PIL import Image
p=argparse.ArgumentParser();p.add_argument('--runtime',required=True);a=p.parse_args()
rt=Path(a.runtime);root=rt/'consumer/integration-02';packet=json.loads((root/'source/SPRITE_PACKET_V01.git-lf.json').read_bytes());images=[]
for item in [packet['ball'],packet['shadow']]:
 raw=(root/'served/artist'/item['texture']).read_bytes();assert hashlib.sha256(raw).hexdigest()==item['sha256']
 im=Image.open(root/'served/artist'/item['texture']);alpha=im.getchannel('A');bounds=[]
 for expected in item['alphaBounds']:
  threshold=expected['threshold'];box=alpha.point(lambda a:255 if a>=threshold else 0).getbbox();inclusive=[box[0],box[1],box[2]-1,box[3]-1]
  assert inclusive==expected['rectInclusive'];bounds.append({'threshold':threshold,'rectInclusive':inclusive})
 images.append({'texture':item['texture'],'canvas':im.size,'alphaMax':alpha.getextrema()[1],'bounds':bounds})
report={'images':images,'shadowMaxCompositeAlpha':images[1]['alphaMax']/255*packet['shadow']['opacity']}
(rt/'integration-browser/texture-pixels.json').write_bytes((json.dumps(report,indent=2)+'\n').encode('utf8'))
print('Texture original bytes, canvas and alpha bounds verified')
