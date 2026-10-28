"""Full P4 packet: source-pixel cutouts plus local background restoration.

Run with process-local P4_ASSET_RUNTIME/TEMP/TMP on E. This script has no
simulation or private-core code. It never changes starter-v01.
"""
import copy
import hashlib
import json
import os
from pathlib import Path
import shutil
import subprocess

import cv2
import numpy as np
from PIL import Image, ImageDraw, ImageFilter

import prepare_starter as starter

cv2.setNumThreads(2)
ROOT = Path(__file__).resolve().parents[1]
RUNTIME = Path(os.environ.get("P4_ASSET_RUNTIME", r"E:\R4D\perspective\p4-runtime\asset-artist"))
OUT = ROOT / "full-v02"
WORK = RUNTIME / "full-v02"
RAW = {
    "clean-plate-v01": "exec-e6f738de-e5c7-41c2-9e5e-26ddc4342610.png",
    "ball-v01": "exec-f9d50b3c-2c0a-405e-ad69-884ff688bc0e.png",
    "ball-shadow-v01": "exec-fe609b28-2a60-4548-aec2-2ec4826c1764.png",
}
LEAF = [(-1.02,-.6),(-.96,-.88),(-1,-1.3),(-.84,-1.51),(-.58,-1.36),(-.7,-1.65),(-.48,-1.76),(-.21,-1.58),(-.19,-1.76),(0,-1.83),(.18,-1.65),(.28,-1.76),(.48,-1.64),(.55,-1.42),(.78,-1.55),(.97,-1.36),(.95,-1.11),(1.04,-1.03),(1,-.66),(.95,-.3),(.7,-.05),(.15,.06),(-.45,.02),(-.9,-.2)]
FROG = [(-1.04,-.5),(-.97,-1),(-.72,-1.25),(-.7,-1.58),(-.5,-1.76),(-.28,-1.73),(-.1,-1.55),(.12,-1.65),(.23,-1.81),(.45,-1.8),(.62,-1.62),(.65,-1.43),(.9,-1.15),(1.02,-.8),(1.03,-.5),(.9,-.17),(.5,.04),(-.3,.05),(-.8,-.12)]
SCENE_OUTLINES = {
    "rail-left": [(0,180),(222,180),(232,205),(283,223),(326,237),(355,260),(385,278),(407,323),(420,357),(432,380),(438,409),(427,438),(401,461),(363,480),(343,507),(336,540),(352,564),(392,578),(422,596),(440,627),(440,660),(428,696),(402,721),(365,740),(328,759),(291,786),(267,823),(256,855),(261,902),(286,943),(318,968),(345,1001),(363,1028),(358,1055),(336,1076),(311,1081),(296,1107),(0,1140)],
    "rail-right": [(1536,180),(1288,180),(1270,202),(1210,220),(1168,236),(1137,249),(1124,271),(1120,300),(1131,326),(1163,344),(1190,370),(1199,400),(1185,434),(1178,467),(1186,499),(1213,527),(1235,547),(1267,562),(1289,588),(1304,621),(1308,650),(1302,677),(1281,706),(1270,737),(1270,776),(1279,808),(1295,836),(1304,863),(1295,903),(1278,927),(1251,950),(1238,985),(1226,1007),(1228,1043),(1253,1064),(1281,1074),(1295,1110),(1536,1150)],
    "near-platform-front": [(312,1094),(420,1106),(600,1116),(790,1123),(970,1118),(1160,1102),(1240,1088),(1278,1124),(1184,1160),(1004,1177),(774,1188),(540,1175),(360,1158),(312,1139)],
}


def jwrite(path, value):
    starter.write_json(path, value)


def box_for(mask, padding=8):
    x0,y0,x1,y1 = mask.getbbox()
    return (max(0,x0-padding),max(0,y0-padding),min(1536,x1+padding),min(1536,y1+padding))


def refined_mask(source, outline, center, halfwidth, family):
    rough = np.array(starter.polygon(outline))
    box = box_for(Image.fromarray(rough), 10)
    x0,y0,x1,y1 = box
    p = rough[y0:y1,x0:x1] >= 128
    dilated = cv2.dilate(np.uint8(p), np.ones((21,21),np.uint8)) > 0
    labels = np.full(p.shape, cv2.GC_BGD, np.uint8)
    labels[dilated] = cv2.GC_PR_BGD
    labels[p] = cv2.GC_PR_FGD
    # Small interior seeds avoid declaring uncertain leaf/eye gaps foreground.
    x,y = center
    cv2.ellipse(labels, (round(x-x0),round(y-y0-.7*halfwidth)), (max(2,round(.34*halfwidth)),max(2,round(.45*halfwidth))), 0,0,360,cv2.GC_FGD,-1)
    cv2.ellipse(labels, (round(x-x0),round(y-y0-.23*halfwidth)), (max(2,round(.65*halfwidth)),max(2,round(.1*halfwidth))),0,0,360,cv2.GC_FGD,-1)
    if family=='wood-base':
        cv2.ellipse(labels,(round(x-x0),round(y-y0-2.43*halfwidth)),(round(.65*halfwidth),round(.23*halfwidth)),0,0,360,cv2.GC_FGD,-1)
        cv2.rectangle(labels,(round(x-x0-.45*halfwidth),round(y-y0-2.1*halfwidth)),(round(x-x0+.45*halfwidth),round(y-y0-.4*halfwidth)),cv2.GC_FGD,-1)
    if family=='flower-base':
        rgb=np.array(source.crop(box),dtype=float)
        red=(rgb[:,:,0]>1.25*rgb[:,:,1])&(rgb[:,:,0]>1.35*rgb[:,:,2])&dilated
        labels[red]=cv2.GC_FGD
    cv2.grabCut(cv2.cvtColor(np.array(source.crop(box)),cv2.COLOR_RGB2BGR),labels,None,np.zeros((1,65),np.float64),np.zeros((1,65),np.float64),4,cv2.GC_INIT_WITH_MASK)
    result = np.uint8((labels==cv2.GC_FGD)|(labels==cv2.GC_PR_FGD))*255
    # Retain one connected source object; discard isolated floor fragments.
    count,cc,stats,_ = cv2.connectedComponentsWithStats(result)
    if count>1:
        cx,cy=round(x-x0),round(y-y0-.55*halfwidth)
        which=cc[min(cy,result.shape[0]-1),min(cx,result.shape[1]-1)]
        if which==0: which=1+int(np.argmax(stats[1:,cv2.CC_STAT_AREA]))
        result=np.uint8(cc==which)*255
    result=cv2.morphologyEx(result,cv2.MORPH_CLOSE,np.ones((3,3),np.uint8))
    # Supersampled polygon choices are saved; a subpixel alpha softens graphcut.
    crop=Image.fromarray(result).filter(ImageFilter.GaussianBlur(.34))
    mask=Image.new('L',source.size);mask.paste(crop,(x0,y0))
    return mask


def local_restore(target, clean, mask, feather=4):
    """Poisson match restored gradients to original floor at each patch edge."""
    m=np.array(mask)
    if not np.any(m): return target
    x,y,w,h=cv2.boundingRect(m)
    # seamlessClone needs a real zero border, including for edge-touching rails.
    if x<2 or y<2 or x+w>1534 or y+h>1534:
        return Image.composite(clean,target,mask.filter(ImageFilter.GaussianBlur(feather)))
    box=(max(0,x-8),max(0,y-8),min(1536,x+w+8),min(1536,y+h+8))
    tile=np.array(clean.crop(box));dst=np.array(target.crop(box));mm=np.array(mask.crop(box))
    center=(tile.shape[1]//2,tile.shape[0]//2)
    matched=cv2.seamlessClone(cv2.cvtColor(tile,cv2.COLOR_RGB2BGR),cv2.cvtColor(dst,cv2.COLOR_RGB2BGR),mm,center,cv2.NORMAL_CLONE)
    matched=Image.fromarray(cv2.cvtColor(matched,cv2.COLOR_BGR2RGB))
    soft=mask.crop(box).filter(ImageFilter.GaussianBlur(feather))
    patch=Image.composite(matched,target.crop(box),soft)
    result=target.copy();result.paste(patch,(box[0],box[1]));return result


def save_rgba(source,mask,box,path):
    im=source.crop(box).convert('RGBA');im.putalpha(mask.crop(box));im.save(path)
    assert np.array_equal(np.array(im)[:,:,:3],np.array(source.crop(box)))
    return im


def part_record(name,im,box,anchor,role,depth,provenance):
    im.save(OUT/name)
    return {'partId':name[:-4], 'file':name,'sha256':starter.sha(OUT/name),'sizePx':list(im.size),'sourceRectPx':starter.rect_json(box),'anchorLocalPx':[anchor[0]-box[0],anchor[1]-box[1]],'role':role,'depth':depth,'alpha':'straight','provenance':provenance}


def main():
    assert starter.sha(starter.SOURCE)==starter.SOURCE_SHA
    assert shutil.disk_usage(RUNTIME).free>2*1024**3,'E <= 2GiB: stop with checkpoint'
    for d in (OUT,WORK,WORK/'raw',WORK/'evidence'):d.mkdir(parents=True,exist_ok=True)
    raw_records=[]
    for key,name in RAW.items():
        src=Path(r'C:\Users\user\.codex\generated_images\01a1818a-efc0-7fd1-bf77-caedc7b51442')/name
        dst=WORK/'raw'/(key+'.png');shutil.copy2(src,dst)
        assert starter.sha(src)==starter.sha(dst) and src.stat().st_size==dst.stat().st_size
        raw_records.append({'name':key,'toolOutput':name,'sha256':starter.sha(dst),'bytes':dst.stat().st_size,'sizePx':list(Image.open(dst).size),'originalRetained':True})
    jwrite(WORK/'raw/copy-manifest.json',raw_records)
    data={}
    for name,(path,expected) in starter.INPUTS.items():
        b=subprocess.check_output(['git','show',starter.P1_COMMIT+':'+path]);assert hashlib.sha256(b.replace(b'\r\n',b'\n')).hexdigest()==expected;data[name]=json.loads(b)
    source=Image.open(starter.SOURCE).convert('RGB')
    clean=Image.open(WORK/'raw/clean-plate-v01.png').convert('RGB').resize(source.size,Image.Resampling.LANCZOS)
    p1=data['p1-manifest.json'];research=data['projection.json'];board=data['config.json']['board']
    old=json.loads((ROOT/'starter-v01/manifest.json').read_bytes())
    natives={o['id']:[o['x'],o['y']] for k in ('pins','buckets') for o in board[k]}
    masks={};selections={};shadow_masks={};boxes={}
    flower_template=[((x-524)/40,(y-400)/40) for x,y in starter.OUTLINES['flower-01']]
    wood_template=[((x-628)/30,(y-493)/30) for x,y in starter.OUTLINES['wood-01']]
    for obs in research['obstacles']:
        oid=obs['id'];x,y=obs['observedFrontContactPx'];w=obs['supportHalfWidthPx']
        if oid in ('flower-01','wood-01'):
            masks[oid]=starter.polygon(starter.OUTLINES[oid]);outline=starter.OUTLINES[oid]
        else:
            t={'flower-base':flower_template,'wood-base':wood_template,'leaf-base':LEAF,'frog-base':FROG}[obs['family']]
            outline=[(x+dx*w,y+(dy-.22 if obs['family']=='flower-base' and dy < -1 else dy)*w) for dx,dy in t]
            masks[oid]=refined_mask(source,outline,(x,y),w,obs['family'])
        if oid=='wood-07':
            cap=[(671,982),(675,976),(684,971),(696,969),(708,971),(720,975),(726,982),(729,992),(720,1000),(704,1004),(685,1002),(671,995)]
            masks[oid]=Image.fromarray(np.maximum(np.array(masks[oid]),np.array(starter.polygon(cap))))
        shadow=[(x-w,y-.7*w),(x+.9*w,y-.2*w),(x+.6*w,y+.4*w),(x-.35*w,y+.9*w),(x-1.4*w,y+1.35*w),(x-2.1*w,y+.95*w),(x-2*w,y+.35*w),(x-1.5*w,y-.1*w)]
        sm=starter.polygon(shadow,feather=1.3)
        arr=np.array(sm);arr[1101:]=0;shadow_masks[oid]=Image.fromarray(arr)
        union=Image.fromarray(np.maximum(np.array(masks[oid]),arr))
        boxes[oid]=box_for(union,8)
        if oid in ('flower-01','wood-01'):
            old_o=next(o for o in old['objects'] if o['objectId']==oid);r=old_o['sourceRectPx'];boxes[oid]=(r['x'],r['y'],r['x']+r['width'],r['y']+r['height'])
            # The old body bytes and registration are intentionally retained.
        selections[oid]={'outlineSourcePx':outline,'shadowRegionSourcePx':shadow,'method':'starter exact alpha' if oid in ('flower-01','wood-01') else 'artist family outline + local GrabCut, original RGB'}
        if oid=='wood-07':selections[oid]['capCorrectionSourcePx']=cap

    basket_boxes={'receiver-01':(188,1163,509,1443),'receiver-02':(495,1191,790,1477),'receiver-03':(775,1194,1071,1485),'receiver-04':(1039,1165,1338,1456)}
    basket_hulls={
      'receiver-01':starter.OUTLINES['receiver-01'],
      'receiver-02':[(513,1247),(522,1225),(547,1210),(580,1200),(619,1198),(656,1198),(694,1205),(729,1219),(754,1234),(770,1253),(776,1278),(769,1302),(758,1329),(752,1366),(737,1396),(710,1424),(680,1439),(668,1461),(649,1469),(638,1462),(623,1464),(611,1453),(590,1455),(578,1439),(555,1420),(540,1396),(531,1361),(522,1322),(516,1297),(508,1272)],
      'receiver-03':[(791,1247),(805,1227),(832,1210),(867,1201),(909,1198),(950,1202),(989,1213),(1021,1229),(1045,1250),(1054,1274),(1047,1295),(1036,1323),(1029,1363),(1014,1396),(989,1424),(960,1441),(949,1467),(932,1477),(917,1469),(902,1470),(890,1456),(873,1456),(857,1437),(836,1418),(818,1390),(809,1358),(800,1320),(793,1294),(786,1271)],
      'receiver-04':[(1057,1228),(1069,1208),(1096,1192),(1131,1181),(1169,1178),(1209,1180),(1246,1192),(1277,1208),(1302,1229),(1317,1250),(1318,1271),(1306,1295),(1294,1330),(1283,1362),(1262,1392),(1237,1410),(1224,1437),(1207,1448),(1193,1442),(1181,1443),(1169,1427),(1150,1428),(1135,1413),(1112,1392),(1093,1364),(1080,1333),(1070,1298),(1061,1269),(1051,1247)]}
    for oid,hull in basket_hulls.items():
        masks[oid]=starter.polygon(hull);boxes[oid]=basket_boxes[oid];selections[oid]={'outlineSourcePx':hull,'method':'artist selected original basket silhouette; no regenerated basket RGB'}
        if oid!='receiver-01':
            box=boxes[oid];x0,y0,x1,y1=box
            a=np.array(masks[oid].crop(box));labels=np.full(a.shape,cv2.GC_BGD,np.uint8);labels[a>0]=cv2.GC_PR_FGD
            goal=next(o for o in research['goals'] if o['id']==oid);cx,cy=goal['sourceCenterPx'];cx=round(cx-x0);cy=round(cy-y0)
            cv2.ellipse(labels,(cx,cy),(65,24),0,0,360,cv2.GC_FGD,-1)
            cv2.ellipse(labels,(cx,cy+95),(62,65),0,0,360,cv2.GC_FGD,-1)
            cv2.grabCut(cv2.cvtColor(np.array(source.crop(box)),cv2.COLOR_RGB2BGR),labels,None,np.zeros((1,65),np.float64),np.zeros((1,65),np.float64),4,cv2.GC_INIT_WITH_MASK)
            aa=np.uint8((labels==cv2.GC_FGD)|(labels==cv2.GC_PR_FGD))*255
            mask=Image.new('L',source.size);mask.paste(Image.fromarray(aa).filter(ImageFilter.GaussianBlur(.3)),(x0,y0));masks[oid]=mask
            selections[oid]['method']='artist outline plus local GrabCut with definite opening/body seeds; original RGB'

    # Static border bands own the source architectural pixels once. Their broad
    # outside-scene areas cannot affect the playable interior through alpha.
    scene_masks={};claimed=np.zeros((1536,1536),np.uint8)
    object_union=np.maximum.reduce([np.array(m) for m in masks.values()])
    rgb=np.array(source,dtype=float)
    teal=(rgb[:,:,1]>1.35*rgb[:,:,0])&(rgb[:,:,2]>1.15*rgb[:,:,0])&((rgb[:,:,1]+rgb[:,:,2])>140)
    # Exclude pins before extending the static band to visible rail tips.
    for obs in research['obstacles']:
        x,y=obs['observedFrontContactPx'];w=obs['supportHalfWidthPx']
        teal[max(0,round(y-3*w)):min(1536,round(y+w)),max(0,round(x-1.35*w)):min(1536,round(x+1.35*w))]=False
    for key,outline in SCENE_OUTLINES.items():
        a=np.array(starter.polygon(outline))
        if key in ('rail-left','rail-right'):
            for y in range(200,1090):
                if key=='rail-left':
                    xx=np.where(teal[y,180:465])[0]
                    if len(xx):a[y,:min(470,180+int(xx.max())+16)]=255
                else:
                    xx=np.where(teal[y,1090:1410])[0]
                    if len(xx):a[y,max(1080,1090+int(xx.min())-16):]=255
            a=cv2.morphologyEx(a,cv2.MORPH_CLOSE,np.ones((9,3),np.uint8))
        a[(object_union>=128)|(claimed>=128)]=0
        scene_masks[key]=Image.fromarray(a);claimed=np.maximum(claimed,a)
    background=source.copy();restoration_regions=np.zeros((1536,1536),np.uint8)
    # First the floor patches; wide transition plus gradient matching fixes the
    # starter wood boundary without changing any source body/anchor.
    for obs in research['obstacles']:
        oid=obs['id'];rough=np.array(starter.polygon(selections[oid]['outlineSourcePx']))
        a=np.maximum.reduce([np.array(masks[oid]),rough,np.array(shadow_masks[oid])])
        a=cv2.dilate(a,np.ones((25,25),np.uint8));a[1104:]=0
        background=local_restore(background,clean,Image.fromarray(a),feather=5)
        restoration_regions=np.maximum(restoration_regions,np.array(Image.fromarray(a).filter(ImageFilter.GaussianBlur(5))))
    for oid in basket_hulls:
        a=cv2.dilate(np.array(masks[oid]),np.ones((13,13),np.uint8))
        background=local_restore(background,clean,Image.fromarray(a),feather=3)
        restoration_regions=np.maximum(restoration_regions,np.array(Image.fromarray(a).filter(ImageFilter.GaussianBlur(3))))
    for key,m in scene_masks.items():
        a=np.array(m)
        # Keep border restoration under the source foreground ownership.
        background=Image.composite(clean,background,m)
        restoration_regions=np.maximum(restoration_regions,a)
    background.save(OUT/'background.png');Image.fromarray(restoration_regions).save(OUT/'restoration-regions.png')
    objects=[];preview=background.convert('RGBA');ground_parts=[];body_parts=[];front_parts=[]
    observations={o['id']:o for k in ('obstacles','goals') for o in research[k]}
    for oid,mask in masks.items():
        box=boxes[oid];anchor=observations[oid]['sourceCenterPx'];native=natives[oid]
        assert np.max(np.abs(np.array(starter.transform(p1['projection']['sourceToNative'],anchor))-native))<1e-6
        obj={'objectId':oid,'nativeKind':'bucket' if oid.startswith('receiver') else 'pin','anchorSourcePx':anchor,'anchorLocalPx':[anchor[0]-box[0],anchor[1]-box[1]],'anchorNative':native,'anchorResearch':[native[0]-p1['translation']['offset'][0],native[1]-p1['translation']['offset'][1]],'sourceRectPx':starter.rect_json(box),'parts':[]}
        if oid in shadow_masks:
            area=np.array(shadow_masks[oid],float)/255*(1-np.array(mask,float)/255)
            s=np.mean(np.array(source,dtype=float),2);b=np.mean(np.array(background,dtype=float),2)
            estimated=np.clip((b-s)/np.maximum(b-36,1),0,.62)
            # Retain a low smooth floor-shadow component where fine paving
            # texture makes luminance recovery underdetermined.
            smooth=np.array(Image.fromarray(np.uint8(estimated*255)).filter(ImageFilter.GaussianBlur(2)),float)/255
            opacity=np.maximum(smooth,.11)*area
            rgba=Image.new('RGBA',source.size,(35,39,24,0));rgba.putalpha(Image.fromarray(np.uint8(opacity*255)).filter(ImageFilter.GaussianBlur(.75)));im=rgba.crop(box)
            rec=part_record(oid+'-ground-shadow.png',im,box,anchor,'ground-shadow',{'layer':'ground','sortNativeY':native[1]}, {'kind':'restored','method':'source cast-shadow region + locally recovered luminance alpha, soft floor component 0.11; dark olive; source shadow removed from background','limitation':'estimated opacity; not an exact lighting decomposition'})
            obj['parts'].append(rec);ground_parts.append((im,box))
        if oid.startswith('receiver'):
            if oid=='receiver-01':
                for role in ('body','foreground'):
                    im=Image.open(ROOT/'starter-v01'/f'{oid}-{role}.png').convert('RGBA')
                    rec=part_record(oid+'-'+role+'.png',im,box,anchor,role,{'layer':'receiver-back' if role=='body' else 'receiver-front','sortNativeY':native[1],'occlusion':'rear before ball; front after ball while its source billboard overlaps receiver sourceRect'}, {'kind':'extracted','method':'byte-identical starter-v01 source RGB/alpha and crop'})
                    obj['parts'].append(rec);(body_parts if role=='body' else front_parts).append((im,box))
            else:
                contour=observations[oid]['openingContourPx'];ys=[p[1] for p in contour];xs=[p[0] for p in contour]
                left,right=min(xs)-25,max(xs)+25;cy=max(ys)+1;cx=anchor[0];half=(right-left)/2
                boundary=[(left,cy-40),(cx-half*.65,cy-10),(cx,cy+2),(cx+half*.65,cy-10),(right,cy-40),(box[2]+2,box[3]+2),(box[0]-2,box[3]+2)]
                f=np.array(starter.polygon(boundary))>=128;a=np.array(mask)
                for role,alpha in (('body',np.where(f,0,a)),('foreground',np.where(f,a,0))):
                    im=save_rgba(source,Image.fromarray(np.uint8(alpha)),box,WORK/f'{oid}-{role}.png')
                    rec=part_record(oid+'-'+role+'.png',im,box,anchor,role,{'layer':'receiver-back' if role=='body' else 'receiver-front','sortNativeY':native[1],'occlusion':'rear before ball; front after ball while its source billboard overlaps receiver sourceRect'}, {'kind':'extracted','method':'original source RGB; artist silhouette and P1 opening contour guide the exclusive front/rear alpha split'})
                    obj['parts'].append(rec);(body_parts if role=='body' else front_parts).append((im,box))
                selections[oid]['frontBoundarySourcePx']=boundary
        else:
            if oid in ('flower-01','wood-01'):
                im=Image.open(ROOT/'starter-v01'/f'{oid}-body.png').convert('RGBA')
            else:im=save_rgba(source,mask,box,WORK/f'{oid}-body.png')
            rec=part_record(oid+'-body.png',im,box,anchor,'body',{'layer':'body','sortNativeY':native[1],'occlusion':'sort with ball ground native Y, alpha provides partial occlusion'}, {'kind':'extracted','method':selections[oid]['method']+'; RGB identical to source'})
            obj['parts'].append(rec);body_parts.append((im,box))
        objects.append(obj)

    scene_parts=[]
    for key,mask in scene_masks.items():
        box=box_for(mask,1);anchor=[(box[0]+box[2])/2,1114 if key=='near-platform-front' else box[3]]
        im=save_rgba(source,mask,box,WORK/(key+'.png'))
        rec=part_record(key+'.png',im,box,anchor,'foreground',{'layer':'scene-front','occlusion':'fixed source-space foreground alpha, draw after depth-sorted bodies/ball and before receiver-front; inverse-view uses P1 source mesh'}, {'kind':'extracted','method':'original RGB architectural foreground band; outside-playfield scenery retained with the band, not a movable independent rail','sourceOutlinePx':SCENE_OUTLINES[key]})
        rec['anchorSourcePx']=anchor;rec['anchorNative']=starter.transform(p1['projection']['sourceToNative'],anchor)
        scene_parts.append(rec);front_parts.insert(0,(im,box))

    actor={}
    for key,name in (('body','ball-v01'),('shadow','ball-shadow-v01')):
        im=Image.open(WORK/'raw'/(name+'.png')).convert('RGBA')
        alpha=np.array(im.getchannel('A'));assert alpha.min()==0 and alpha.max()>30
        # Uniform downsample of generated output, alpha retained. Bounds specify
        # the effective radius; transparent padding does not affect scale.
        im.thumbnail((256,256),Image.Resampling.LANCZOS);im.save(OUT/('ball-'+key+'.png'))
        a=np.array(im.getchannel('A'));ys,xs=np.where(a>=16);bbox=[int(xs.min()),int(ys.min()),int(xs.max()+1),int(ys.max()+1)]
        center=[(bbox[0]+bbox[2])/2,(bbox[1]+bbox[3])/2]
        actor[key]={'file':'ball-'+key+'.png','sha256':starter.sha(OUT/('ball-'+key+'.png')),'sizePx':list(im.size),'alpha':'straight','contentBoundsPxAlpha16':bbox,'centerLocalPx':center,'contentRadiusPx':[(bbox[2]-bbox[0])/2,(bbox[3]-bbox[1])/2],'provenance':{'kind':'generated','rawSha256':next(r['sha256'] for r in raw_records if r['name']==name),'tool':'built-in image_gen','processing':'uniform downsample only; actual generated alpha retained'}}
    actor['nativeRadius']=board['ball']['r'];actor['placement']={'bodyCenter':'P = project(nativeToSource, simulation ball.pos); no additional position offset or radius change','sourceRadiusPx':'R = nativeRadius / (H[2][0]*x + H[2][1]*y + H[2][2]); this H has H00=1, H10=0','bodyScale':'uniform scale R / body.contentRadiusPx[0], pivot body.centerLocalPx; keep the generated circular sprite','shadowCenterSourcePx':'P + [-0.55*R, +0.60*R]','shadowContentHalfSizeSourcePx':'[1.12*R, 0.42*R]; scale content bounds, not transparent canvas','shadowLayer':'ground, once, before bodies/ball; existing foreground alpha occludes it','depth':'same simulation ball.pos.y as diagnostic; no physics or PRNG effects','inverseView':'form source-space actor quad with these rules, transform its vertices by P1 sourceToNative; do not treat raster sphere as a floor circle'}
    actor['body']['role']='body';actor['body']['depth']={'layer':'body','sortNativeY':'simulation ball.pos.y'}
    actor['shadow']['role']='ground-shadow';actor['shadow']['depth']={'layer':'ground'}
    actor['shadow']['opacityMultiplier']=0.42
    actor['render']={'radiusRule':'native-horizontal-projective-derivative','bodySourceCenterOffsetR':[0,0],'bodyUniformScaleRule':'R / body.contentRadiusPx[0]','shadowSourceCenterOffsetR':[-0.55,0.60],'shadowSourceContentHalfSizeR':[1.12,0.42],'sourceToNativeQuad':True,'noPhysicsEffects':True}
    for im,box in ground_parts:preview.alpha_composite(im,(box[0],box[1]))
    for im,box in body_parts:preview.alpha_composite(im,(box[0],box[1]))
    for im,box in front_parts:preview.alpha_composite(im,(box[0],box[1]))
    preview.save(WORK/'evidence/reassembled-no-ball.png')
    # A clearly labelled static contact sheet, never a claimed Pixi/QA result.
    sheet=Image.new('RGB',(1200,1000),(225,230,224));draw=ImageDraw.Draw(sheet)
    for i,obs in enumerate(research['obstacles']):
        im=Image.open(OUT/(obs['id']+'-body.png'));im.thumbnail((140,150));x=(i%8)*150;y=(i//8)*190+25;sheet.paste(im,(x,y),im);draw.text((x+4,y-18),obs['id'],fill=(20,30,20))
    for i,oid in enumerate(basket_hulls):
        im=Image.alpha_composite(Image.open(OUT/(oid+'-body.png')),Image.open(OUT/(oid+'-foreground.png')));im.thumbnail((220,200));x=i*250;y=790;sheet.paste(im,(x,y),im);draw.text((x+4,y-18),oid,fill=(20,30,20))
    sheet.save(OUT/'cutouts-preview.png')
    # Preview with exactly the accepted drop position, no invented trajectory.
    drop=board['drops'][0];p=starter.transform(p1['projection']['nativeToSource'],[drop['x'],drop['y']])
    h=p1['projection']['nativeToSource'];r=16/(h[2][0]*drop['x']+h[2][1]*drop['y']+h[2][2])
    hero=background.convert('RGBA')
    for im,box in ground_parts:hero.alpha_composite(im,(box[0],box[1]))
    for key in ('shadow','body'):
        spec=actor[key];im=Image.open(OUT/spec['file']).convert('RGBA');rx,ry=spec['contentRadiusPx']
        if key=='body':sx=sy=r/rx;center=p
        else:sx=1.12*r/rx;sy=.42*r/ry;center=[p[0]-.55*r,p[1]+.60*r];im.putalpha(im.getchannel('A').point(lambda a:round(a*.42)))
        im=im.resize((max(1,round(im.width*sx)),max(1,round(im.height*sy))),Image.Resampling.LANCZOS)
        hero.alpha_composite(im,(round(center[0]-spec['centerLocalPx'][0]*sx),round(center[1]-spec['centerLocalPx'][1]*sy)))
    for im,box in body_parts:hero.alpha_composite(im,(box[0],box[1]))
    for im,box in front_parts:hero.alpha_composite(im,(box[0],box[1]))
    hero.save(OUT/'assembled-at-drop-preview.png')
    manifest=copy.deepcopy(old);manifest.update({'version':'p4-full-v01','status':'full source-extracted packet for real consumer/QA; final Art PASS NOT CLAIMED','background':{'file':'background.png','sha256':starter.sha(OUT/'background.png'),'sourceRectPx':{'x':0,'y':0,'width':1536,'height':1536},'provenance':{'kind':'source-with-local-restoration','regionMask':'restoration-regions.png','regionMaskSha256':starter.sha(OUT/'restoration-regions.png'),'restoredIds':list(masks)+list(scene_masks),'method':'empty generated restoration plate used only under removed source cutouts/shadows; per-floor-patch Poisson boundary matching and 5px transition; exterior source pixels retained'}},'objects':objects,'sceneParts':scene_parts,'ball':actor,'remaining':['needs real full Pixi scene confirmation; no final Art/QA PASS','shadow opacity is restored/estimated, not exact decomposition of original floor lighting','fine leaf/feather/basket silhouette and receiver entry remain visual QA targets','side foreground bands include source scenery outside the playable interior; not independently movable snake sprites','hidden rear 3D surfaces are not invented; original camera/placement is fixed and only required hidden floor/backdrop restored']})
    manifest['version']='p4-full-v02'
    manifest['registration']['scope']='all25 pins, all4 receiver bodies/fronts, static border foreground, generated ball/shadow; full common geometry unchanged'
    manifest['registration']['shadows']='25 ground-shadow parts once; none of their old bodies/shadows retained on cleaned floor; architectural environmental shadows remain fixed'
    jwrite(OUT/'manifest.json',manifest)
    jwrite(OUT/'provenance.json',{'raw':raw_records,'sourceRgbExact':True,'selections':selections,'sceneForeground':SCENE_OUTLINES,'starterRetained':'starter-v01 unchanged; flower-01 and wood-01 body and receiver-01 body/front bytes reused','woodCorrection':'the initial retouch edge came from incompatible full-frame generated floor geometry/tone with a 2px mask transition; full floor restoration uses Poisson gradient matching to the original border and 5px feather, without changing body or anchor','generatedPixels':'local restored background, own ball and its separate shadow only; no regenerated obstacle/basket body pixels','prompts':'../RUN_RECORD.md, full-v01 continuation'})
    outside=restoration_regions==0
    checks={'pins':sum(o['nativeKind']=='pin' for o in objects),'buckets':sum(o['nativeKind']=='bucket' for o in objects),'parts':sum(len(o['parts']) for o in objects),'sceneParts':len(scene_parts),'ballRadiusNative':actor['nativeRadius'],'outsideRestorationRgbSourceExact':bool(np.array_equal(np.array(background)[outside],np.array(source)[outside])),'starterBodyHashesUnchanged':all(starter.sha(OUT/(k+'-body.png'))==starter.sha(ROOT/'starter-v01'/(k+'-body.png')) for k in ('flower-01','wood-01')),'status':'preparation checks, not dynamic QA'}
    assert checks['pins']==25 and checks['buckets']==4 and checks['starterBodyHashesUnchanged']
    jwrite(OUT/'preparation-checks.json',checks)
    jwrite(OUT/'file-hashes.json',{p.name:{'sha256':starter.sha(p),'bytes':p.stat().st_size} for p in sorted(OUT.iterdir()) if p.is_file() and p.name!='file-hashes.json'})
    print(json.dumps({'output':str(OUT),'manifestSha256':starter.sha(OUT/'manifest.json'),**checks}))


if __name__=='__main__':main()
