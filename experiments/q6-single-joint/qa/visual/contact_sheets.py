from PIL import Image, ImageDraw, ImageFont
from pathlib import Path
import json
root=Path('experiments/q6-single-joint/qa/visual')
out=root/'output/playwright'
font=ImageFont.truetype('C:/Windows/Fonts/arial.ttf',18)
poses=['bind','extreme_extension','extreme_flexion','step_overlap','jump_phase']
index=[]
for mode in ['joint','method']:
  for scale in ['target','zoom']:
    rows=[]
    for i,pose in enumerate(poses):
      theme='dark' if i%2 else 'light'
      name=f'desktop-{mode}-{scale}-{theme}-{pose}.png'
      im=Image.open(out/name).convert('RGB')
      y=170 if scale=='target' else 180
      if pose=='jump_phase': y=70 if scale=='target' else 40
      crop=im.crop((0,y,im.width,y+270))
      row=Image.new('RGB',(im.width,303),'#f4f1eb')
      ImageDraw.Draw(row).text((8,5),f'{mode} | {scale} | {theme} | {pose} | native screenshot crop, no enlargement',font=font,fill='black')
      row.paste(crop,(0,33)); rows.append(row)
      index.append({'file':str(out/name),'pose':pose,'mode':mode,'scale':scale,'theme':theme,'capture':'executed scan-desktop.js; endpoint reached with same-Motion advance(.38); per-frame telemetry not exported by console.log; not a live timing measurement'})
    sheet=Image.new('RGB',(rows[0].width,sum(r.height for r in rows)), 'white')
    y=0
    for row in rows:sheet.paste(row,(0,y));y+=row.height
    sheet.save(out/f'sheet-{mode}-{scale}.jpg',quality=95)
(root/'observations-desktop.json').write_text(json.dumps({'note':'CLI run-code console.log did not export record array. Index reconstructed from executed script and saved filenames; no invented timing or per-frame state. Full original execution log retained.','captures':index},ensure_ascii=False,indent=2),encoding='utf-8')
# A temporal strip of live RAF screenshots, native crops, times bracketed in observations-live.json.
data=json.loads((root/'observations-live.json').read_text(encoding='utf-8-sig'))
rows=[]
for entry in data['observations']:
  if not entry.get('file'):continue
  if 'extreme_flexion' not in entry['label'] and 'live-method' not in entry['label']:continue
  im=Image.open(entry['file']).convert('RGB')
  crop=im.crop((0,210,im.width,410))
  row=Image.new('RGB',(im.width,232),'#f4f1eb')
  ImageDraw.Draw(row).text((8,4),f"{entry['label']} | clock bracket {entry['before']['clock']:.3f}..{entry['after']['clock']:.3f}; screenshot time not exact",font=font,fill='black')
  row.paste(crop,(0,32));rows.append(row)
sheet=Image.new('RGB',(max(r.width for r in rows),sum(r.height for r in rows)),'#f4f1eb')
y=0
for row in rows:sheet.paste(row,(0,y));y+=row.height
sheet.save(out/'sheet-live-motion.jpg',quality=95)
print('4 desktop sheets + live temporal sheet; no artwork modified')
