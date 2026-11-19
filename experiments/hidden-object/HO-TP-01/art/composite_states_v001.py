from pathlib import Path
from PIL import Image
import cv2, numpy as np, json, hashlib, shutil, math

P=Path(r"K:\Agents\R4D\Review\HO-TP-01\assets\v001")
R=Path(r"D:\dev\R4D\experiments\hidden-object\HO-TP-01\art")
SOURCE=Path(r"K:\Agents\R4D\Review\HO-AF-01\C-ship-bakery\HO-AF-01_C_selected-master_from-C2-correction01_20261119T085657Z.png")
EXPECTED="f6f96897290470778067ae15cba408418673f7578c38195736bee60fb822a65e"
assert hashlib.sha256(SOURCE.read_bytes()).hexdigest()==EXPECTED
orig=Image.open(SOURCE).convert("RGB");oa=np.array(orig)
ROI=np.zeros(oa.shape[:2],bool);ROI[480:941,0:960]=True
CONFIG={
"bread":{"crop":[176,535,480,320],"raw":"raw_edit_01_bread_v001.png","alpha":"mask_bread_alpha_v001.png","support":"mask_bread_support_v001.png"},
"bowl":{"crop":[464,480,384,256],"raw":"raw_edit_02_bowl_v001.png","alpha":"mask_bowl_alpha_v003.png","support":"mask_bowl_support_v003.png"}
}
def save_new(im,path):
 if path.exists():raise FileExistsError(path)
 im.save(path)
def meta(path):
 im=Image.open(path)
 return {"path":str(path),"width":im.width,"height":im.height,"bytes":path.stat().st_size,"sha256":hashlib.sha256(path.read_bytes()).hexdigest()}
results={}
for name,c in CONFIG.items():
 x,y,w,h=c["crop"]
 src=np.array(orig.crop((x,y,x+w,y+h)))
 rawim=Image.open(P/c["raw"]).convert("RGB")
 resized=np.array(rawim.resize((w,h),Image.Resampling.LANCZOS))
 am=np.array(Image.open(P/c["alpha"]).convert("L"))
 guide=np.array(Image.open(P/c["support"]).convert("L").crop((x,y,x+w,y+h)))
 fixed=cv2.erode((guide<8).astype(np.uint8)*255,np.ones((15,15),np.uint8))
 sift=cv2.SIFT_create(nfeatures=1200,contrastThreshold=0.02)
 ka,da=sift.detectAndCompute(cv2.cvtColor(resized,cv2.COLOR_RGB2GRAY),fixed)
 kb,db=sift.detectAndCompute(cv2.cvtColor(src,cv2.COLOR_RGB2GRAY),fixed)
 good=[]
 if da is not None and db is not None:
  for m in cv2.BFMatcher().knnMatch(da,db,k=2):
   if len(m)==2 and m[0].distance<0.72*m[1].distance:good.append(m[0])
 M=np.array([[1.,0.,0.],[0.,1.,0.]],dtype=np.float64)
 accepted=False;inliers=0;median_error=None
 if len(good)>=6:
  pa=np.float32([ka[m.queryIdx].pt for m in good])
  pb=np.float32([kb[m.trainIdx].pt for m in good])
  fit,ins=cv2.estimateAffinePartial2D(pa,pb,method=cv2.RANSAC,ransacReprojThreshold=1.8,maxIters=3000,confidence=.995)
  if fit is not None:
   inliers=int(ins.sum())
   scale=float(np.hypot(fit[0,0],fit[0,1]));angle=math.degrees(math.atan2(fit[1,0],fit[0,0]))
   pred=cv2.transform(pa.reshape(-1,1,2),fit).reshape(-1,2)
   median_error=float(np.median(np.linalg.norm(pred[ins.ravel()>0]-pb[ins.ravel()>0],axis=1)))
   if inliers>=6 and .96<scale<1.04 and abs(angle)<2 and abs(fit[0,2])<15 and abs(fit[1,2])<15:
    M=fit;accepted=True
 aligned=cv2.warpAffine(resized,M,(w,h),flags=cv2.INTER_LANCZOS4,borderMode=cv2.BORDER_REFLECT_101)
 alignedim=Image.fromarray(aligned)
 save_new(alignedim,P/f"aligned_{name}_v001.png")
 alpha=Image.fromarray(am[y:y+h,x:x+w])
 patch=alignedim.convert("RGBA");patch.putalpha(alpha)
 save_new(patch,P/f"patch_{name}_rgba_v001.png")
 full=orig.convert("RGBA")
 full.alpha_composite(patch,(x,y))
 state=full.convert("RGB")
 state_path=P/f"state_{name}_removed_v001.png"
 save_new(state,state_path)
 diff=np.any(np.array(state)!=oa,axis=2)
 support=am>0
 assert not np.any(diff & ~ROI)
 assert not np.any(diff & ~support)
 # All pixels outside this exact technical alpha support are original source pixels.
 other=CONFIG["bowl" if name=="bread" else "bread"]
 othermask=np.array(Image.open(P/other["alpha"]))>0
 assert not np.any(diff & othermask)
 save_new(state.crop((x,y,x+w,y+h)).resize((w*2,h*2),Image.Resampling.NEAREST),P/f"inspect_state_{name}_2x_v001.png")
 xy=np.argwhere(diff)
 bbox=[int(xy[:,1].min()),int(xy[:,0].min()),int(xy[:,1].max()+1),int(xy[:,0].max()+1)] if len(xy) else None
 results[name]={"crop_xywh":c["crop"],"raw":meta(P/c["raw"]),"aligned":meta(P/f"aligned_{name}_v001.png"),"working_state":meta(state_path),"patch":meta(P/f"patch_{name}_rgba_v001.png"),"alpha":meta(P/c["alpha"]),"registration":{"initial_resize_from":list(rawim.size),"resize_to":[w,h],"method":"SIFT outside 15px-eroded excluded support; partial affine RANSAC, constrained near identity","candidate_matches":len(good),"inliers":inliers,"median_inlier_error_px":median_error,"accepted":accepted,"matrix_raw_resized_to_source_crop":M.tolist()},"verification":{"changed_pixels":int(diff.sum()),"changed_bbox_xyxy":bbox,"outside_roi_changed_pixels":int(np.count_nonzero(diff & ~ROI)),"outside_exact_alpha_changed_pixels":int(np.count_nonzero(diff & ~support)),"other_object_support_changed_pixels":int(np.count_nonzero(diff & othermask))}}
a=np.array(Image.open(P/CONFIG["bread"]["alpha"]))>0
b=np.array(Image.open(P/CONFIG["bowl"]["alpha"]))>0
assert not np.any(a&b)
results["mask_overlap_pixels"]=int(np.count_nonzero(a&b))
out=P/"technical_composite_v001.json"
if out.exists():raise FileExistsError(out)
out.write_text(json.dumps(results,indent=2),encoding="utf-8")
print(json.dumps({n: {"registration":results[n]["registration"],"verification":results[n]["verification"]} for n in CONFIG}))

