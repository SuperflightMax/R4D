"""Technical v4 silhouette-aware static verification only. Immutable attempt02 supplies RGB.

No generation, painting, product runtime, timing, commands, or attempt03 output.
Geometry supplies the accepted outer silhouette. Conservative triangle seam
coverage is clipped BEFORE composition. A separately authored silhouette alpha
can subtract coverage; attempt02 registration alpha is never that mask.
"""
import argparse
import hashlib
import io
import json
import runpy
import subprocess
from pathlib import Path

import numpy as np
from PIL import Image, ImageDraw, ImageFilter, ImageColor
import prepare_art as legacy

ROOT=Path(__file__).resolve().parents[1].parent
ART=ROOT/'art'
OUT=ART/'technical/v4'
PATH=ROOT/'construction/construction.json'
DATA=json.loads(PATH.read_bytes())
SURF={s['id']:s for s in DATA['surfaces']}
COMMIT='d3bdf8f1cffebe2179805eeb54a8a36faab08805'


def digest(p):return hashlib.sha256(p.read_bytes()).hexdigest()


def protected_check():
    record=json.loads((OUT/'protected-inputs.json').read_bytes())
    repo=ROOT.parents[1]
    for name,sha in record['files'].items():
        assert digest(repo/name)==sha,('protected input changed',name)
    return len(record['files'])


def material_rgb(image):
    """Extend ONLY this material's existing pixels, without new paint.

    Deterministic row-nearest sampling outside the solid source mask. No
    pose-dependent patch and no alpha threshold applied to posed fragments.
    These RGB planes stay in RAM; immutable PNGs are never saved or modified.
    """
    raw=np.asarray(image)
    solid=raw[:,:,3]>=128
    rows=np.where(solid.any(axis=1))[0]
    assert len(rows)
    rgb=np.zeros_like(raw[:,:,:3])
    grid=np.arange(1024)
    for y in rows:
        xs=np.where(solid[y])[0]
        for channel in range(3):rgb[y,:,channel]=np.interp(grid,xs,raw[y,xs,channel])
    for y in np.where(~solid.any(axis=1))[0]:
        rgb[y]=rgb[rows[np.argmin(abs(rows-y))]]
    return rgb


def load_materials():
    package=json.loads((ART/'package.json').read_bytes())
    rgb={};rgba={}
    for entry in package['surfaces']:
        p=ART/entry['file']
        assert digest(p)==entry['sha256']
        image=Image.open(p).convert('RGBA')
        assert image.size==(1024,1024)
        rgba[entry['id']]=image
        rgb[entry['id']]=material_rgb(image)
    assert set(rgb)==set(SURF)
    return rgb,rgba


def pieces(pose,name,fragment):
    geom=pose['surfaces'][name]
    if 'patches' in geom:
        for panel in geom['patches']:
            yield np.array(panel['uv'])*1024,np.array(panel['vertices']),panel['triangles']
        return
    triangles=geom['triangles']
    if 'arm_skin' in name and fragment!='all':
        rootids={0,1,2,3,4,5,*geom['cap_vertex_ids']}
        triangles=[t for t in triangles if (set(t)<=rootids)==(fragment=='root')]
    if 'leg_skin' in name:triangles=[t for t in triangles if min(t)>=4]
    yield np.array(geom['uv'])*1024,np.array(geom['vertices']),triangles


def regions(pose,op):
    g=pose['surfaces'][op['surface']];fragment=op['fragment']
    if 'patches' in g:return [p['outline'] for p in g['patches']]
    if 'arm_skin' in op['surface']:
        return [g['root_outline']] if fragment=='root' else [g['limb_outline'],g['silhouette_regions'][1]] if fragment=='limb' else g['silhouette_regions']
    if 'leg_skin' in op['surface']:return [g['visible_outline'],g['silhouette_regions'][1]]
    return [g['outline']]


def outer_mask(pose,op,size,scale,origin,ss):
    mask=Image.new('L',(size[0]*ss,size[1]*ss));pen=ImageDraw.Draw(mask)
    for poly in regions(pose,op):
        pen.polygon([((origin[0]+scale*x)*ss,(origin[1]-scale*y)*ss) for x,y in poly],fill=255)
    return mask


def accepted_envelope(pose,size=(960,640),scale=1,origin=(480,560),ss=2):
    # Independent contour union, never inferred from triangle raster coverage.
    union=np.zeros((size[1]*ss,size[0]*ss),dtype=np.uint8)
    for op in DATA['draw_operations']:union=np.maximum(union,np.asarray(outer_mask(pose,op,size,scale,origin,ss)))
    return Image.fromarray(union).resize(size,Image.Resampling.BOX)


def render(pose,materials,size=(960,640),scale=1,origin=(480,560),ss=2,silhouette_alpha=None,operations=None):
    canvas=Image.new('RGBA',(size[0]*ss,size[1]*ss))
    for op in DATA['draw_operations'] if operations is None else operations:
        rgb=materials[op['surface']]
        layer=np.zeros((size[1]*ss,size[0]*ss,4),dtype=np.uint8)
        for source,world,triangles in pieces(pose,op['surface'],op['fragment']):
            dest=np.stack(((origin[0]+scale*world[:,0])*ss,(origin[1]-scale*world[:,1])*ss),axis=1)
            for tri in triangles:
                target=dest[tri];uv_source=source[tri]
                matrix=np.stack((target[1]-target[0],target[2]-target[0]),axis=1)
                det=np.linalg.det(matrix)
                if abs(det)<1e-8:continue  # declared zero-area skin fold, not drawn
                src_det=np.linalg.det(np.stack((uv_source[1]-uv_source[0],uv_source[2]-uv_source[0]),axis=1))
                assert src_det*det>0,('flipped face refused',pose['id'],op,tri)
                radius=.5*ss
                x0=max(0,int(np.floor(target[:,0].min()-radius)));x1=min(size[0]*ss,int(np.ceil(target[:,0].max()+radius))+1)
                y0=max(0,int(np.floor(target[:,1].min()-radius)));y1=min(size[1]*ss,int(np.ceil(target[:,1].max()+radius))+1)
                if x1<=x0 or y1<=y0:continue
                yy,xx=np.mgrid[y0:y1,x0:x1]
                bary=np.stack((xx+.5-target[0,0],yy+.5-target[0,1]),axis=-1)@np.linalg.inv(matrix).T
                # Conservative output-pixel footprint: test triangle against
                # its half-pixel square support, not only its centre. This is a
                # general edge coverage rule, not a repair of failed pixels.
                support=lambda edge:(.5*ss)*np.abs(edge).sum()/abs(det)
                tu=support(target[2]-target[0]);tv=support(target[1]-target[0]);tw=support(target[2]-target[1])
                inside=(bary[:,:,0]>=-tu-1e-8)&(bary[:,:,1]>=-tv-1e-8)&(bary.sum(axis=2)<=1+tw+1e-8)
                source_xy=uv_source[0]+bary[:,:,0,None]*(uv_source[1]-uv_source[0])+bary[:,:,1,None]*(uv_source[2]-uv_source[0])
                # Coordinates describe pixel edges; array samples are pixel centres.
                sx=np.clip(source_xy[:,:,0]-.5,0,1023);sy=np.clip(source_xy[:,:,1]-.5,0,1023)
                ix=np.floor(sx).astype(int);iy=np.floor(sy).astype(int)
                jx=np.minimum(ix+1,1023);jy=np.minimum(iy+1,1023)
                fx=(sx-ix)[:,:,None];fy=(sy-iy)[:,:,None]
                color=(rgb[iy,ix]*(1-fx)*(1-fy)+rgb[iy,jx]*fx*(1-fy)+rgb[jy,ix]*(1-fx)*fy+rgb[jy,jx]*fx*fy)
                block=layer[y0:y1,x0:x1]
                block[inside,:3]=np.clip(color[inside],0,255).astype(np.uint8)
                coverage=np.full(inside.shape,255,dtype=np.uint8)
                if silhouette_alpha is not None and op['surface'] in silhouette_alpha:
                    # This is an explicit authored cutout, separate from source
                    # registration alpha. Nearest samples preserve a hard cut.
                    mask=silhouette_alpha[op['surface']]
                    coverage=mask[np.clip(np.rint(sy).astype(int),0,1023),np.clip(np.rint(sx).astype(int),0,1023)]
                block[inside,3]=np.maximum(block[inside,3],coverage[inside])
        layer[:,:,3]=np.minimum(layer[:,:,3],np.asarray(outer_mask(pose,op,size,scale,origin,ss)))
        canvas=Image.alpha_composite(canvas,Image.fromarray(layer,'RGBA'))
    return canvas.resize(size,Image.Resampling.BOX)


def envelope(pose,draw_shapes,size=(960,640),scale=1,origin=(480,560)):
    image=Image.new('L',size);pen=ImageDraw.Draw(image)
    for _,poly,_ in draw_shapes(pose):
        pen.polygon([(origin[0]+scale*x,origin[1]-scale*y) for x,y in poly],fill=255)
    return np.asarray(image.filter(ImageFilter.MinFilter(5)))==255


def geometry_counts(data,legacy_mode=False):
    inversions=0;intersections=0;degenerate=0;by_surface={}
    for pose in data['poses']:
        for op in data['draw_operations']:
            iterator=legacy.pieces(op['surface'],pose,op['fragment']) if legacy_mode else pieces(pose,op['surface'],op['fragment'])
            for src,world,tris in iterator:
                for tri in tris:
                    sa=legacy.cross(*[src[i] for i in tri]);pa=legacy.cross(*[world[i] for i in tri])
                    inversions+=int(sa*pa>1e-7)
                    degenerate+=int(abs(pa)<1e-7)
        for name,g in pose['surfaces'].items():
            polys=[panel['outline'] for panel in g['patches']] if 'patches' in g else g.get('silhouette_regions',[g['outline']])
            for poly in polys:
                n=len(poly)
                for i in range(n):
                    for j in range(i+2,n):
                        if (j+1)%n==i:continue
                        a,b,c,d=poly[i],poly[(i+1)%n],poly[j],poly[(j+1)%n]
                        if legacy.cross(a,b,c)*legacy.cross(a,b,d)<-1e-7 and legacy.cross(c,d,a)*legacy.cross(c,d,b)<-1e-7:
                            intersections+=1;by_surface[name]=by_surface.get(name,0)+1
    return {'inversions':inversions,'self_intersections':intersections,'self_intersections_by_surface':by_surface,'declared_zero_fold_faces':degenerate}


def png_bytes(image):
    buf=io.BytesIO();image.save(buf,format='PNG',icc_profile=legacy.ICC);return buf.getvalue()


def contour_evidence():
    # Code-native construction diagrams, not new raster art or source materials.
    hands=Image.new('RGB',(1200,500),'#edf0f2');pen=ImageDraw.Draw(hands)
    for row,side in enumerate(('far','near')):
        for col,pid in enumerate(('bind','low_deep','jump_apex','range_compression')):
            pose=next(p for p in DATA['poses'] if p['id']==pid);g=pose['surfaces'][side+'_hand']
            local=g['anatomical_local_outline'];xy=[(col*300+65+6*x,row*250+120-6*y) for x,y in local]
            pen.polygon(xy,fill='#cfae8e',outline='#253b49')
            for key,color in [('thumb_vertex_id','#b04330'),('finger_vertex_id','#235b9a')]:
                x,y=xy[g[key]];pen.ellipse((x-4,y-4,x+4,y+4),fill=color)
            pen.text((col*300+12,row*250+12),f'{pid} / {side} / local 6x',fill='#172532')
            pen.text((col*300+12,row*250+210),'44 vertices / wrist x=0 / overlap=7',fill='#172532')
            pen.line((col*300+65,row*250+60,col*300+65,row*250+160),fill='#608080')
    joints=Image.new('RGB',(1600,900),'#edf0f2')
    for row,pid in enumerate(('low_deep','range_compression','range_reach')):
        pose=next(p for p in DATA['poses'] if p['id']==pid)
        for col,name in enumerate(('far_arm_skin','near_arm_skin','far_leg_skin','near_leg_skin')):
            g=pose['surfaces'][name];side=name.split('_')[0];joint=pose['landmarks'][side+('_elbow' if 'arm' in name else '_knee')]
            tile=Image.new('RGB',(400,300),'#edf0f2');draw=ImageDraw.Draw(tile)
            transform=lambda p:(200+3*(p[0]-joint[0]),155-3*(p[1]-joint[1]))
            for poly in g['silhouette_regions']:draw.polygon([transform(p) for p in poly],fill='#cfae8e')
            for key,color in [('outer_bend_vertex_ids','#235b9a'),('inner_fillet_vertex_ids','#b04330')]:
                pts=[transform(g['vertices'][i]) for i in g[key]];draw.line(pts,fill=color,width=2)
                for x,y in pts:draw.ellipse((x-2,y-2,x+2,y+2),fill=color)
            draw.text((10,10),f'{pid} / {name} / 3x',fill='#172532')
            draw.text((10,280),'blue outer / red inner / same skin mesh',fill='#172532')
            joints.paste(tile,(400*col,300*row))
    return {'hand-contours.png':png_bytes(hands),'joint-controls.png':png_bytes(joints)}


def baseline(textures):
    old_source=subprocess.check_output(['git','show',COMMIT+':experiments/q5a-construction-first/construction/build_package.py'],cwd=ROOT.parents[1])
    scope={'__file__':str(ROOT/'construction/build_package.py'),'__name__':'frozen_v2'}
    exec(compile(old_source,'committed_v2_build_package.py','exec'),scope)
    rows=[]
    for pose in legacy.DATA['poses']:
        image=legacy.render(pose,textures)
        mask=envelope(pose,scope['draw_shapes'])
        rows.append({'pose':pose['id'],'interior_deficient_pixels':int((mask&(np.asarray(image)[:,:,3]<128)).sum())})
    result=geometry_counts(legacy.DATA,True)
    result['interior_deficient_pixels']=sum(p['interior_deficient_pixels'] for p in rows)
    result['poses']=rows
    assert result['inversions']==45 and result['interior_deficient_pixels']==139
    return result


def outputs_and_checks():
    protected=protected_check()
    module=runpy.run_path(str(ROOT/'construction/build_package.py'))
    module['validate'](DATA);module['validate_fold_sweep']();regression=module['validate_v2'](DATA)
    mesh_regression=module['validate_v3'](DATA)
    silhouette_regression=module['validate_v4'](DATA)
    rgb,old_textures=load_materials()
    before=baseline(old_textures)
    after=geometry_counts(DATA)
    assert after['inversions']==0 and after['self_intersections']==0 and after['declared_zero_fold_faces']==28,after
    files=contour_evidence();rows=[];probes=[]
    sheets={bg:Image.new('RGB',(1600,2560),color) for bg,color in [('light','#edf0f2'),('dark','#20242c')]}
    for i,pose in enumerate(DATA['poses']):
        image=render(pose,rgb)
        pixels=np.asarray(image);outer=accepted_envelope(pose)
        core=np.asarray(outer.point(lambda x:255 if x>=128 else 0).filter(ImageFilter.MinFilter(5)))==255
        missing=int((core&(pixels[:,:,3]<128)).sum())
        assert missing==0,('interior alpha deficiency',pose['id'],missing)
        outside=int(((pixels[:,:,3]>=128)&(np.asarray(outer)<128)).sum())
        assert outside==0,('opaque outside accepted silhouette',pose['id'],outside)
        assert np.all(pixels[:,:,3]<=np.asarray(outer)),('coverage escaped silhouette',pose['id'])
        double=render(pose,rgb,(1920,1280),2,(960,1120))
        double_outer=accepted_envelope(pose,(1920,1280),2,(960,1120))
        double_core=np.asarray(double_outer.point(lambda x:255 if x>=128 else 0).filter(ImageFilter.MinFilter(5)))==255
        double_alpha=np.asarray(double)[:,:,3]
        missing_x2=int((double_core&(double_alpha<128)).sum())
        outside_x2=int(((double_alpha>=128)&(np.asarray(double_outer)<128)).sum())
        assert missing_x2==outside_x2==0,('full-state x2',pose['id'],missing_x2,outside_x2)
        for pid,x,y in [('walk_far_contact',459,342),('walk_far_contact',518,454),('bind',484,529),('idle_settle_left',455,299)]:
            if pose['id']==pid:
                assert pixels[y,x,3]>=128
                probes.append({'pose':pid,'pixel':[x,y],'alpha':int(pixels[y,x,3])})
        files['rgba/'+pose['id']+'.png']=png_bytes(image)
        checks={}
        for bg,color in [('light','#edf0f2'),('dark','#20242c')]:
            composite=Image.new('RGBA',image.size,color);composite.alpha_composite(image)
            alpha=pixels[:,:,3,None].astype(float)/255
            expected=pixels[:,:,:3]*alpha+np.array(ImageColor.getrgb(color))*(1-alpha)
            error=int((core&np.any(abs(np.asarray(composite)[:,:,:3].astype(float)-expected)>1,axis=2)).sum())
            assert error==0,('composition contract mismatch',pose['id'],bg,error)
            checks[bg]={'interior_alpha_deficient_pixels':missing,'composition_error_pixels':error,
                        'interior_partial_AA_pixels':int((core&(pixels[:,:,3]<255)).sum())}
            composite=composite.convert('RGB')
            files[bg+'/'+pose['id']+'.png']=png_bytes(composite)
            tile=composite.crop((340,0,660,640))
            sheets[bg].paste(tile,((i%5)*320,(i//5)*640))
            ImageDraw.Draw(sheets[bg]).text(((i%5)*320+8,(i//5)*640+12),pose['id'],fill='#111111' if bg=='light' else '#ffffff')
        rows.append({'pose':pose['id'],'interior_deficient_pixels':missing,'opaque_outside_silhouette_pixels':outside,'full_state_x2':{'interior_deficient_pixels':missing_x2,'opaque_outside_silhouette_pixels':outside_x2,'viewport':[1920,1280]},'background_checks':checks})
    for bg,sheet in sheets.items():files[bg+'-sheet.png']=png_bytes(sheet)
    low=next(p for p in DATA['poses'] if p['id']=='low_deep')
    image=render(low,rgb,(1280,960),2,(640,880))
    bg=Image.new('RGBA',image.size,'#edf0f2');bg.alpha_composite(image)
    files['low-deep-x2.png']=png_bytes(bg.convert('RGB'))
    landing=next(p for p in DATA['poses'] if p['id']=='jump_landing')
    landing_image=render(landing,rgb,(1280,960),2,(640,880))
    landing_bg=Image.new('RGBA',landing_image.size,'#20242c');landing_bg.alpha_composite(landing_image)
    files['landing-x2.png']=png_bytes(landing_bg.convert('RGB'))
    after['interior_deficient_pixels']=sum(r['interior_deficient_pixels'] for r in rows)
    after['opaque_outside_silhouette_pixels']=sum(r['opaque_outside_silhouette_pixels'] for r in rows)
    # Isolated hands prove the concave thumb/finger cuts survive transfer.
    hand_rows=[]
    for pose in DATA['poses']:
        for name in ('far_hand','near_hand'):
            op={'surface':name,'fragment':'all'}
            hand=render(pose,rgb,operations=[op]);alpha=np.asarray(hand)[:,:,3]
            mask=np.asarray(outer_mask(pose,op,(960,640),1,(480,560),2).resize((960,640),Image.Resampling.BOX))
            assert np.all(alpha<=mask)
            ys,xs=np.where(mask>=128)
            transparent_corners=int((mask[ys.min():ys.max()+1,xs.min():xs.max()+1]==0).sum())
            assert transparent_corners>0
            hand_rows.append({'pose':pose['id'],'surface':name,'transparent_bbox_pixels':transparent_corners,'opaque_outside':int(((alpha>=128)&(mask<128)).sum())})
    # A synthetic alpha subtraction uses no new art and is never saved as a
    # material. Half the bind hand is cut away; seam overlap cannot refill it.
    name='near_hand';op={'surface':name,'fragment':'all'}
    authored=np.full((1024,1024),255,dtype=np.uint8)
    cut=int(np.mean(np.array(DATA['poses'][0]['surfaces'][name]['uv'])[:,0])*1024)
    authored[:,cut:]=0
    full=render(DATA['poses'][0],rgb,operations=[op]);cutout=render(DATA['poses'][0],rgb,operations=[op],silhouette_alpha={name:authored})
    assert np.count_nonzero(np.asarray(cutout)[:,:,3]>=128)<np.count_nonzero(np.asarray(full)[:,:,3]>=128)
    assert np.all(np.asarray(cutout)[:,:,3]<=np.asarray(full)[:,:,3])
    # At bind, source registration maps exactly to target. The right half-plane
    # beyond the authored cut must remain fully transparent, including seams.
    first_cut_screen=int(np.ceil(480+(cut-512)/2))+1
    assert np.asarray(cutout)[:,first_cut_screen:,3].max()==0
    before_v3=json.loads((ART/'technical/v3/checks.json').read_bytes())['after_v3']
    report={'status':'V4_SILHOUETTE_TECHNICAL_ONLY_NOT_PRODUCT_CANDIDATE','construction_sha256':digest(PATH),
            'v2_commit':COMMIT,'material_attempt':'02 read-only rejected evidence; AR1-AR3 UNRESOLVED',
            'art_package_sha256':digest(ART/'package.json'),'protected_files':protected,
            'before_v2':before,'before_v3':before_v3,'after_v4':after,'poses':rows,'regression_v2_checks':regression,
            'construction_v3_mesh_checks':mesh_regression,'old_failure_probes':probes,
            'construction_v4_silhouette_checks':silhouette_regression,'isolated_hand_checks':hand_rows,
            'authored_alpha_subtraction':'PASS RAM-only synthetic mask reduces coverage and is not refilled',
            'render_contract':'explicit v4 triangles/UV; reject flipped; skip 28 zero faces; conservative internal footprint clipped to each accepted anatomical contour before composition; 2x BOX; optional separate authored alpha can subtract; attempt02 RGB only; no pose patches',
            'outputs_sha256':{name:hashlib.sha256(value).hexdigest() for name,value in files.items()},
            'clean_art_attempt03':'FORBIDDEN pending two v4 reviews'}
    protected_check()
    files['checks.json']=(json.dumps(report,ensure_ascii=False,indent=2)+'\n').encode('utf-8')
    return files,report


def main():
    parser=argparse.ArgumentParser();parser.add_argument('--check',action='store_true');args=parser.parse_args()
    files,report=outputs_and_checks()
    for name,raw in files.items():
        p=OUT/name
        if args.check:assert p.read_bytes()==raw,('not byte reproducible',name)
        else:p.parent.mkdir(parents=True,exist_ok=True);p.write_bytes(raw)
    print(json.dumps({'result':'PASS','mode':'read-only byte check' if args.check else 'write technical v4 only',
                      'construction_sha256':report['construction_sha256'],'before':{k:v for k,v in report['before_v2'].items() if k!='poses'},
                      'after':report['after_v4'],'poses':len(report['poses']),'protected_files':report['protected_files'],'outputs':len(files)},indent=2))


if __name__=='__main__':main()
