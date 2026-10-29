"""Read saved ordinary traces; select real overlap/order/contact windows. No simulation or edits."""
import json, math, hashlib, sys
from pathlib import Path
from PIL import Image, __version__ as pillow_version
root=Path('E:/R4D/perspective/p5-runtime/builder/output/previews/c02/public')
out=Path('E:/R4D/perspective/p5-runtime/technical-qa/c02')
output_name=sys.argv[1] if len(sys.argv)>1 else 'trace-window-analysis.json'
assert output_name.startswith('trace-window-analysis') and output_name.endswith('.json') and '/' not in output_name and '\\' not in output_name
assert not (out/output_name).exists(), 'Append-only analysis exists'
manifest=json.loads((root/'assets/manifest.json').read_bytes())
config=json.loads((root/'data/config.json').read_bytes())
matrix=json.loads((root/'data/p1-manifest.json').read_bytes())['projection']['nativeToSource']
textures={t['id']:t for t in manifest['textures']}
alphas={}; pixels=[]
def box(bb):
    if bb is None:return [0,0,0,0]
    return [bb[0],bb[1],bb[2]-bb[0],bb[3]-bb[1]]
for tex in textures.values():
    if tex['sha256'] not in alphas:
        b=(root/'assets'/tex['file']).read_bytes()
        assert len(b)==tex['bytes'] and hashlib.sha256(b).hexdigest()==tex['sha256']
        with Image.open(root/'assets'/tex['file']) as image:
            assert list(image.size)==tex['sizePx']
            alpha=image.convert('RGBA').getchannel('A')
        alphas[tex['sha256']]=alpha
    alpha=alphas[tex['sha256']]
    measured={'bounds':box(alpha.getbbox()),'visibleBounds':box(alpha.point(lambda v:255 if v>=16 else 0).getbbox()),'maxAlpha':alpha.getextrema()[1]}
    for key,value in measured.items():assert value==tex['alpha'][key],(tex['id'],key)
    pixels.append({'id':tex['id'],'sha256':tex['sha256'],**measured})

def project(x,y):
    w=matrix[2][0]*x+matrix[2][1]*y+matrix[2][2]
    return ((matrix[0][0]*x+matrix[0][1]*y+matrix[0][2])/w,(matrix[1][0]*x+matrix[1][1]*y+matrix[1][2])/w)
angles=[(math.cos(i*math.pi/64),math.sin(i*math.pi/64)) for i in range(128)]
def width(x,y,r):
    xs=[project(x+r*c,y+r*s)[0] for c,s in angles]
    return max(xs)-min(xs)
def placement(tex,x,y,r):
    px,py=project(x,y);scale=width(x,y,r)/tex['footprintPx']['width']
    return (px-tex['groundAnchorPx'][0]*scale,py-tex['groundAnchorPx'][1]*scale,scale)
def samples(tex,placement,grid=9):
    left,top,scale=placement;bx,by,bw,bh=tex['alpha']['visibleBounds'];alpha=alphas[tex['sha256']]
    return [(left+x*scale,top+y*scale) for row in range(grid) for col in range(grid)
            for x,y in [(bx+(col+.5)*bw/grid,by+(row+.5)*bh/grid)] if alpha.getpixel((int(x),int(y)))>=128]
def in_polygon(x,y,poly):
    inside=False
    for i,(ax,ay) in enumerate(poly):
        bx,by=poly[i-1]
        if (ay>y)!=(by>y) and x<(bx-ax)*(y-ay)/(by-ay)+ax:inside=not inside
    return inside
def opaque_at(tex,place,x,y):
    left,top,scale=place;u,v=(x-left)/scale,(y-top)/scale
    return 0<=u<tex['sizePx'][0] and 0<=v<tex['sizePx'][1] and alphas[tex['sha256']].getpixel((int(u),int(v)))>=128

pins={p['id']:p for p in config['board']['pins']}
bodies=[(i,textures[i['textureId']],pins[i['targetId']]) for i in manifest['instances'] if i['role']=='body']
places={p['id']:placement(t,p['x'],p['y'],p['r']) for i,t,p in bodies}
ball=textures['ball-v1'];clips=[i for i in manifest['instances'] if i.get('sourceClipPx')]
saved={
0:('E:/R4D/perspective/p5-runtime/technical-qa/source-oracle-001/private/seed-0/states.ndjson','E:/R4D/perspective/p5-runtime/technical-qa/source-oracle-001/private/seed-0/events.json'),
1696420279:('E:/R4D/perspective/p5-runtime/technical-qa/c01/native-seed-1696420279.states.ndjson','E:/R4D/perspective/p5-runtime/technical-qa/c01/native-seed-1696420279.events.json'),
3957814979:('E:/R4D/perspective/p5-runtime/technical-qa/c01/native-seed-3957814979.states.ndjson','E:/R4D/perspective/p5-runtime/technical-qa/c01/native-seed-3957814979.events.json')}
runs=[]
for seed,(trace_path,event_path) in saved.items():
    trace_bytes=Path(trace_path).read_bytes();states=[json.loads(line) for line in trace_bytes.splitlines()];events=json.loads(Path(event_path).read_bytes())
    ball_samples=[]
    for state in states:
        p=state['ball']['pos'];ball_samples.append(samples(ball,placement(ball,p['x'],p['y'],16)))
    order=[]
    for i,tex,pin in bodies:
        for tick in range(1,len(states)):
            prev=states[tick-1]['ball']['pos']['y']-pin['y'];now=states[tick]['ball']['pos']['y']-pin['y']
            if (prev<0<=now) or (now<0<=prev):
                pts=ball_samples[tick];fraction=sum(opaque_at(tex,places[pin['id']],x,y) for x,y in pts)/len(pts)
                if fraction>0:order.append({'target':pin['id'],'texture':tex['id'],'tickBefore':tick-1,'tickAfter':tick,'direction':'behind-to-front' if now>=0 else 'front-to-behind','estimatedOpaqueOverlapFraction':fraction})
    body_windows=[]
    ball_boxes=[(min(x for x,y in pts),min(y for x,y in pts),max(x for x,y in pts),max(y for x,y in pts)) for pts in ball_samples]
    for spec,tex,pin in bodies:
        left,top,scale=places[pin['id']];bx,by,bw,bh=tex['alpha']['visibleBounds']
        body_box=(left+bx*scale,top+by*scale,left+(bx+bw)*scale,top+(by+bh)*scale)
        fractions=[]
        for tick,pts in enumerate(ball_samples):
            a,b,c,d=ball_boxes[tick];x,y,u,v=body_box
            if states[tick]['ball']['pos']['y']>=pin['y'] or c<x or a>u or d<y or b>v:fractions.append(0)
            else:fractions.append(sum(opaque_at(tex,places[pin['id']],px,py) for px,py in pts)/len(pts))
        start=None
        for tick,fraction in enumerate(fractions+[0]):
            if fraction>0 and start is None:start=tick
            if fraction==0 and start is not None:
                peak=max(range(start,tick),key=lambda t:fractions[t])
                if fractions[peak]>=.1:body_windows.append({'target':pin['id'],'texture':tex['id'],'entryTick':start,'peakTick':peak,'exitTick':tick,'maxEstimatedFraction':fractions[peak]})
                start=None
    clip_windows=[]
    for clip in clips:
        fractions=[sum(in_polygon(x,y,clip['sourceClipPx']['polygon']) for x,y in pts)/len(pts) for pts in ball_samples]
        transitions=[]
        for tick in range(1,len(fractions)):
            if (fractions[tick-1]==0 and fractions[tick]>0) or (fractions[tick-1]>0 and fractions[tick]==0) or (fractions[tick-1]<1 and fractions[tick]==1) or (fractions[tick-1]==1 and fractions[tick]<1):
                transitions.append({'tickBefore':tick-1,'tickAfter':tick,'fractionBefore':fractions[tick-1],'fractionAfter':fractions[tick]})
        if transitions:clip_windows.append({'id':clip['id'],'maxFraction':max(fractions),'transitions':transitions})
    contacts=[{'id':e.get('objectId'),'kind':e.get('objectKind'),'eventTick':e['tick'],'stateTick':e['tick']+1,'texture':next((t['id'] for i,t,p in bodies if p['id']==e.get('objectId')),None)} for e in events if e['type']=='object_hit']
    runs.append({'seed':seed,'tracePath':trace_path,'traceSha256':hashlib.sha256(trace_bytes).hexdigest(),'terminal':states[-1],'contacts':contacts,'bodyOrderTransitions':sorted(order,key=lambda o:-o['estimatedOpaqueOverlapFraction']),'bodyOcclusionWindows':body_windows,'foregroundTransitions':clip_windows})
result={'scope':'Moment selection from unchanged saved ordinary native traces; estimated alpha overlap is not browser/visual PASS','pillow':pillow_version,'uniquePng':len(alphas),'textureIds':len(textures),'pixels':pixels,'runs':runs}
buffer=(json.dumps(result,indent=2)+'\n').encode();(out/output_name).write_bytes(buffer)
print(json.dumps({'file':output_name,'bytes':len(buffer),'sha256':hashlib.sha256(buffer).hexdigest(),'runs':[{k:r[k] for k in ['seed','bodyOrderTransitions','bodyOcclusionWindows','foregroundTransitions']} for r in runs]},indent=2))
