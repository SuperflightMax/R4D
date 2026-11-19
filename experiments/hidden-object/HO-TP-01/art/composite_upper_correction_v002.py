from pathlib import Path
from PIL import Image
import numpy as np,cv2,json,math,hashlib
V1=Path(r"K:\Agents\R4D\Review\HO-TP-01\assets\v001")
V2=Path(r"K:\Agents\R4D\Review\HO-TP-01\assets\v002")
def save(im,name):
 p=V2/name
 if p.exists():raise FileExistsError(p)
 im.save(p)
src=Image.open(V1/"original_C2_exact.png").convert("RGB");oa=np.array(src)
x,y,w,h=500,520,280,160
target=np.array(Image.open(V2/"target_upper_seam_v002.png").convert("RGB"))
rawim=Image.open(V2/"raw_edit_03_upper_seam_v002.png").convert("RGB")
raw=np.array(rawim.resize((w,h),Image.Resampling.LANCZOS))
guide=np.array(Image.open(V2/"guide_upper_seam_v002.png").convert("L"))
fixed=cv2.erode((guide==0).astype(np.uint8)*255,np.ones((9,9),np.uint8))
sift=cv2.SIFT_create(nfeatures=1000,contrastThreshold=.02)
ka,da=sift.detectAndCompute(cv2.cvtColor(raw,cv2.COLOR_RGB2GRAY),fixed)
kb,db=sift.detectAndCompute(cv2.cvtColor(target,cv2.COLOR_RGB2GRAY),fixed)
good=[]
if da is not None and db is not None:
 for pair in cv2.BFMatcher().knnMatch(da,db,k=2):
  if len(pair)==2 and pair[0].distance<.72*pair[1].distance:good.append(pair[0])
M=np.array([[1.,0.,0.],[0.,1.,0.]])
accepted=False;nin=0;err=None
if len(good)>=6:
 a=np.float32([ka[m.queryIdx].pt for m in good]);b=np.float32([kb[m.trainIdx].pt for m in good])
 f,ins=cv2.estimateAffinePartial2D(a,b,method=cv2.RANSAC,ransacReprojThreshold=1.5,maxIters=3000,confidence=.995)
 if f is not None:
  nin=int(ins.sum());sc=float(np.hypot(f[0,0],f[0,1]));ang=math.degrees(math.atan2(f[1,0],f[0,0]))
  pred=cv2.transform(a.reshape(-1,1,2),f).reshape(-1,2)
  err=float(np.median(np.linalg.norm(pred[ins.ravel()>0]-b[ins.ravel()>0],axis=1)))
  if nin>=6 and .96<sc<1.04 and abs(ang)<2 and abs(f[0,2])<15 and abs(f[1,2])<15:M=f;accepted=True
aligned=cv2.warpAffine(raw,M,(w,h),flags=cv2.INTER_LANCZOS4,borderMode=cv2.BORDER_REFLECT_101)
save(Image.fromarray(aligned),"registered_upper_seam_v002.png")
corr=np.array(Image.open(V2/"mask_upper_seam_support_v002.png").convert("L"))
# No feather across the original visible linen edge; taper only into the already restored wood below.
for yy in range(604,613):corr[yy,:]=np.rint(corr[yy,:]*(612-yy)/8).astype(np.uint8)
corr[613:,:]=0
corrpatch=Image.fromarray(aligned).convert("RGBA");corrpatch.putalpha(Image.fromarray(corr[y:y+h,x:x+w]))
save(corrpatch,"patch_upper_seam_rgba_v002.png")
save(Image.fromarray(corr),"mask_upper_seam_alpha_v002.png")
base_alpha=Image.open(V2/"mask_bowl_technical_trial_v001.png").convert("L")
base_patch=Image.open(V1/"aligned_bowl_v002.png").convert("RGBA")
base_patch.putalpha(base_alpha.crop((464,480,848,736)))
base_patch.alpha_composite(corrpatch,(x-464,y-480))
save(base_patch,"patch_bowl_corrected_rgba_v002.png")
afull=Image.new("L",src.size,0);afull.paste(base_patch.getchannel("A"),(464,480))
save(afull,"replacement_bowl_alpha_v002.png")
state=src.convert("RGBA");state.alpha_composite(base_patch,(464,480));state=state.convert("RGB")
save(state,"state_bowl_removed_corrected_v002.png")
save(state.crop((464,480,848,736)).resize((768,512),Image.Resampling.NEAREST),"inspect_bowl_corrected_2x_v002.png")
save(state.crop((520,540,755,615)).resize((1175,375),Image.Resampling.NEAREST),"inspect_upper_corrected_5x_v002.png")
bread=Image.open(V1/"patch_bread_rgba_v003.png").convert("RGBA")
abread=np.array(Image.open(V1/"mask_bread_alpha_v003.png"))>0
abowl=np.array(afull)>0
overlap=int((abread&abowl).sum());assert overlap==0,overlap
both=src.convert("RGBA");both.alpha_composite(bread,(176,535));both.alpha_composite(base_patch,(464,480));both=both.convert("RGB")
reverse=src.convert("RGBA");reverse.alpha_composite(base_patch,(464,480));reverse.alpha_composite(bread,(176,535));reverse=reverse.convert("RGB")
assert np.array_equal(np.array(both),np.array(reverse))
save(both,"state_both_removed_v002.png")
roi=np.zeros(oa.shape[:2],bool);roi[480:941,:960]=True
metrics={}
for n,im,mask in [("bowl",state,abowl),("both",both,abowl|abread)]:
 d=np.any(np.array(im)!=oa,axis=2)
 assert not np.any(d&~roi);assert not np.any(d&~mask)
 metrics[n]={"changed_pixels":int(d.sum()),"outside_roi_changed_pixels":int((d&~roi).sum()),"outside_replacement_alpha_changed_pixels":int((d&~mask).sum()),"fragment_rect_changed_pixels":int(d[695:731,495:546].sum()),"front_linen_sample_changed_pixels":int(d[770:941,180:370].sum()),"rear_linen_sample_changed_pixels":int(d[530:550,590:710].sum()),"wood_block_sample_changed_pixels":int(d[624:640,491:545].sum())}
reg={"raw_size":list(rawim.size),"native_crop_xywh":[x,y,w,h],"initial_resize_to":[w,h],"matches":len(good),"inliers":nin,"median_error_px":err,"accepted":accepted,"matrix":M.tolist()}
(V2/"correction_composite_parameters_v002.json").write_text(json.dumps({"registration":reg,"correction_feather":"none across original linen boundary; lower taper y604..612","base_patch_origin":[464,480],"mask_overlap_pixels":overlap,"offline_order_difference_pixels":0,"integrity":metrics},indent=2),encoding="utf-8")
print(json.dumps({"registration":reg,"mask_overlap_pixels":overlap,"integrity":metrics}))

