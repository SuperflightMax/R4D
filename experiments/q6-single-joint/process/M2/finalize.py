from pathlib import Path
import hashlib,json,shutil
import numpy as np
from PIL import Image,ImageDraw

R=Path(__file__).resolve().parents[2]
def sha(p):return hashlib.sha256(p.read_bytes()).hexdigest()
def js(p,x):p.write_text(json.dumps(x,ensure_ascii=False,indent=2)+'\n',encoding='utf-8')
def diff(a,b,zone):
    a=np.asarray(a).astype(np.int16);b=np.asarray(b).astype(np.int16)
    d=np.abs(a-b)[zone]
    return {'pixels':int(zone.sum()),'changed_rgba_pixels':int(np.any(d!=0,axis=1).sum()),'max_channel_delta':int(d.max()) if d.size else 0,'mean_absolute_channel_delta':float(d.mean()) if d.size else 0}
def stats(im):
    a=np.asarray(im);alpha=a[:,:,3]
    return {'size':list(im.size),'mode':im.mode,'alpha_bbox_gt0':im.getchannel('A').getbbox(),'alpha_bbox_ge128':Image.fromarray((alpha>=128).astype('uint8')*255).getbbox(),'alpha_min':int(alpha.min()),'alpha_max':int(alpha.max()),'transparent_pixels':int((alpha==0).sum()),'partial_alpha_pixels':int(((alpha>0)&(alpha<255)).sum()),'opaque_pixels':int((alpha==255).sum())}
c=json.loads((R/'FROZEN_CONTRACT.json').read_text(encoding='utf-8'))
assert sha(R/'FROZEN_CONTRACT.json')=='e1dbd83ca86f2c723c5ec51fc97fb85aa06236c88c628c728893005ca284380a'
src=R/'provenance/source'
for p,h in c['source']['sha256'].items():assert sha(src/p)==h,p
atlas=Image.open(R/'process/M1/source-atlas.png').convert('RGBA')
mask=np.asarray(Image.open(R/'process/M2/atlas-mask.png'))==255
alloutputs={};records={}
for route in ['M1','M2']:
    p=R/f'process/{route}';raw=Image.open(p/'raw.png')
    assert raw.width==raw.height,'Non-square route failure: preserve raw, no layout correction allowed'
    rawmode=raw.mode;rgba=raw.convert('RGBA')
    norm=rgba.resize((512,512),Image.Resampling.LANCZOS)
    norm.save(p/'normalized.png')
    a=np.asarray(norm).copy();s=np.asarray(atlas)
    final=norm
    if route=='M2':
        a[~mask]=s[~mask]
        final=Image.fromarray(a,'RGBA');final.save(p/'composited-atlas.png')
    report={'route':route,'call_count':1,'retries':0,'generator_model_id':'not exposed','mask_api_exposed':False,'raw_mode':rawmode,'raw':stats(rgba),'normalization':{'input_size':list(raw.size),'output_size':[512,512],'uniform_scale':512/raw.width,'origin':[0,0],'filter':'Pillow LANCZOS','per_part_alignment':False},'raw_normalized_outside_mask_diff':diff(norm,atlas,~mask),'final_outside_mask_diff':diff(final,atlas,~mask),'parts':{}}
    for name in ['thigh','shin']:
        slot=c['atlas_contract']['slots'][name];rect=tuple(slot['crop'])
        original=Image.open(src/f'assets/parts/{name}_near.png').convert('RGBA')
        rawpart=norm.crop(rect);part=final.crop(rect)
        rawpart.save(p/f'{name}-raw-crop.png')
        dest=R/f'art/{route}/{name}_near.png';part.save(dest)
        native_mask=np.asarray(Image.open(R/f'process/M2/{name}_mask.png'))==255
        ap=np.asarray(part)[:,:,3]>=128;ao=np.asarray(original)[:,:,3]>=128
        sx0,sy0,sx1,sy1=slot['slot']; region=np.asarray(norm)[sy0:sy1,sx0:sx1,3]>0
        outside=np.ones(region.shape,dtype=bool);x0,y0,x1,y1=rect;outside[y0-sy0:y1-sy0,x0-sx0:x1-sx0]=False
        rawalpha=np.asarray(rawpart)[:,:,3]>=128
        pivot=c['rig'][name]['pivot']
        report['parts'][name]={'crop':list(rect),'stats':stats(part),'raw_crop_stats':stats(rawpart),'raw_outside_mask_diff':diff(rawpart,original,~native_mask),'final_outside_mask_diff':diff(part,original,~native_mask),'inside_mask_diff':diff(part,original,native_mask),'silhouette_ge128_added':int((ap&~ao).sum()),'silhouette_ge128_removed':int((ao&~ap).sum()),'silhouette_iou':float((ap&ao).sum()/(ap|ao).sum()),'raw_alpha_pixels_outside_fixed_crop_in_slot':int((region&outside).sum()),'pivot_alpha':int(np.asarray(part)[pivot[1],pivot[0],3]),'original_opaque_repair_pixels_missing_in_raw':int((ao&~rawalpha&native_mask).sum())}
        if route=='M2':
            assert report['parts'][name]['final_outside_mask_diff']['changed_rgba_pixels']==0
            for j in ['J1','J2']:shutil.copyfile(dest,R/f'art/{j}/{name}_near.png')
    js(p/'metrics.json',report);records[route]=report

# J2: select pre-existing painted motif only; no new art drawn by code.
crop=Image.open(R/'process/J2/master-crop.png').convert('RGBA')
polygon=[(64,8),(134,14),(132,112),(111,137),(29,126),(36,108),(46,81),(54,47)]
selection=Image.new('L',crop.size,0);ImageDraw.Draw(selection).polygon(polygon,fill=255)
selection.save(R/'process/J2/selection-mask.png')
selected=crop.copy();selected.putalpha(selection);selected.save(R/'process/J2/selected-motif.png')
# Exact 0.48 inverse affine, no independent fit/translation; ceil-sized support.
import math
scaled_size=tuple(math.ceil(n*.48) for n in crop.size)
scaled=selected.transform(scaled_size,Image.Transform.AFFINE,(1/.48,0,0,0,1/.48,0),resample=Image.Resampling.BICUBIC)
scaled.save(R/'process/J2/scaled-motif.png')
overlay=Image.new('RGBA',(221,454));overlay.paste(scaled,(68,0))
overlay.save(R/'art/J2/kneepad_overlay.png')
bbox=overlay.getchannel('A').getbbox();assert 45<=bbox[0] and 0<=bbox[1] and bbox[2]<=155 and bbox[3]<=110
js(R/'process/J2/metrics.json',{'generation_calls':0,'master_crop':[139,920,278,1090],'selection_polygon_in_crop':polygon,'mask':'binary polygon, no feather before resampling; surrounding garment/background excluded by manual selection','transform':{'uniform_scale':.48,'top_left':[68,0],'filter':'inverse affine BICUBIC','support_size':list(scaled_size)},'overlay':stats(overlay),'underlay_byte_identical_to_J1':all(sha(R/f'art/J2/{n}_near.png')==sha(R/f'art/J1/{n}_near.png') for n in ['thigh','shin']),'limitation':'Existing painted trouser patch is narrow and angled; selection includes its original seam/button/cloth. No new straps fabricated, no pose-dependent repair.'})
for p in sorted((R/'art').rglob('*.png')):alloutputs[str(p.relative_to(R)).replace('\\','/')]={'sha256':sha(p),**stats(Image.open(p).convert('RGBA'))}
js(R/'process/M2/art-output-manifest.json',alloutputs)
js(R/'process/M2/call-ledger.json',{'primary_calls':2,'retries':0,'M1':{'calls':1,'raw_source':'C:/Users/user/.codex/generated_images/01a169ba-1b6e-7f41-86b5-4dcf8fd38c81/exec-fbdeacd6-1971-4523-a00c-5a9318c1d3f0.png','raw_sha256':sha(R/'process/M1/raw.png')},'M2':{'calls':1,'raw_source':'C:/Users/user/.codex/generated_images/01a169ba-1b6e-7f41-86b5-4dcf8fd38c81/exec-5ffaa3b4-3f91-4875-9526-fc0ca665df7a.png','raw_sha256':sha(R/'process/M2/raw.png')},'J2_calls':0,'generator_model_id':'not exposed','actual_tool_args':'process/M1/tool-args.json, process/M2/tool-args.json'})
print(json.dumps({'outputs':alloutputs,'M1_outside':records['M1']['raw_normalized_outside_mask_diff'],'M2_raw_outside':records['M2']['raw_normalized_outside_mask_diff'],'M2_final_outside':records['M2']['final_outside_mask_diff']},ensure_ascii=False,indent=2))
