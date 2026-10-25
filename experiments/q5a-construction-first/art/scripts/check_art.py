"""Read-only dimensional, alpha, registration and integrity checks of selected art."""
import hashlib
import json
from pathlib import Path
import numpy as np
from PIL import Image, ImageFilter
from prepare_art import ART,DATA_PATH,DATA_BYTES,DATA,SHA,SURF,mask_for

def check():
    folder=ART/'attempts/02'
    report=json.loads((folder/'checks-and-mapping.json').read_text(encoding='utf-8'))
    assert hashlib.sha256(DATA_BYTES).hexdigest()==SHA
    assert {s['id'] for s in report['surfaces']}==set(SURF)
    results=[]
    for s in report['surfaces']:
        path=ART/s['file'];im=Image.open(path)
        a=np.asarray(im);expected=np.asarray(mask_for(SURF[s['id']]['geometry_bind']))
        result={'id':s['id'],'dimensions':im.size,'mode':im.mode,
                'sha256_matches':hashlib.sha256(path.read_bytes()).hexdigest()==s['sha256'],
                'registered_alpha_exact':bool(np.array_equal(a[:,:,3],expected)),
                'opaque_pixels':int((a[:,:,3]>=128).sum()),
                'black_opaque_pixels':int(((a[:,:,3]>=128)&(a[:,:,:3].max(axis=2)==0)).sum()),
                'transparent_pixels':int((a[:,:,3]==0).sum()),
                'icc_profile':bool(im.info.get('icc_profile')),
                'rgb_guard_4px':bool(np.all(a[:,:,:3].max(axis=2)[np.asarray(im.getchannel('A').filter(ImageFilter.MaxFilter(9)))>0]>0)),
                'pivot_unchanged':s['pivot_source_px']==SURF[s['id']]['pivot_source_px']}
        assert im.mode=='RGBA' and im.size==(1024,1024)
        assert result['sha256_matches'] and result['registered_alpha_exact'] and result['icc_profile'] and result['pivot_unchanged']
        assert result['opaque_pixels']>0 and result['transparent_pixels']>0 and result['black_opaque_pixels']==0
        assert result['rgb_guard_4px']
        results.append(result)
    source=[]
    for p in sorted((ART/'source').glob('*.png')):
        im=Image.open(p);ar=np.asarray(im)
        source.append({'file':str(p.relative_to(ART)),'size':im.size,'mode':im.mode,
                       'alpha_range':list(im.getchannel('A').getextrema()),
                       'transparent_pixels':int((ar[:,:,3]==0).sum()),
                       'sha256':hashlib.sha256(p.read_bytes()).hexdigest()})
    return {'result':'PASS','scope':'dimensions, alpha, geometric registration, unchanged pivots and hashes; NOT visual/motion acceptance',
            'construction_sha256':SHA,'surface_count':len(results),'surfaces':results,'generated_sources':source}

if __name__=='__main__':print(json.dumps(check(),ensure_ascii=False,indent=2))
