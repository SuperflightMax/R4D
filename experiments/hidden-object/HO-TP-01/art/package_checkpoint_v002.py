from pathlib import Path
from PIL import Image
import numpy as np,json,hashlib,copy,shutil
V1=Path(r"K:\Agents\R4D\Review\HO-TP-01\assets\v001")
V2=Path(r"K:\Agents\R4D\Review\HO-TP-01\assets\v002")
R=Path(r"D:\dev\R4D\experiments\hidden-object\HO-TP-01\art")
old=json.loads((V1/"manifest_v001.json").read_text(encoding="utf-8"))
def fm(p):
 p=Path(p);q={"path":str(p),"bytes":p.stat().st_size,"sha256":hashlib.sha256(p.read_bytes()).hexdigest()}
 if p.suffix.lower()==".png":
  with Image.open(p) as im:q.update(width=im.width,height=im.height,mode=im.mode)
 return q
source=Path(old["source_original_png"]["path"])
assert fm(source)["sha256"]==old["source_original_png"]["sha256"]
baseline=json.loads((V2/"v001_frozen_hashes_before.json").read_text())
changed=[p for p,h in baseline.items() if hashlib.sha256(Path(p).read_bytes()).hexdigest()!=h]
assert not changed,changed
for name in ["replacement_bowl_alpha_v003.png","mask_upper_seam_alpha_v002.png"]:
 dst=R/name
 if dst.exists():raise FileExistsError(dst)
 shutil.copyfile(V2/name,dst)
o=np.array(Image.open(source).convert("RGB"));roi=np.zeros(o.shape[:2],bool);roi[480:941,:960]=True
ab=np.array(Image.open(V1/"mask_bread_alpha_v003.png"))>0
aa=np.array(Image.open(V2/"replacement_bowl_alpha_v003.png"))>0
assert not np.any(ab&aa)
params=json.loads((V2/"correction_composite_parameters_v002.json").read_text())
lock=json.loads((V2/"final_edge_lock_metrics_v003.json").read_text())
hit=json.loads((V2/"hit_mask_parameters_v003.json").read_text())
hb=np.array(Image.open(V2/"hit_bread_L_v002.png"));hm=np.array(Image.open(V2/"hit_bowl_L_v003.png"))
for mask in [hb,hm]:
 assert mask.shape==(941,1672)
 assert set(np.unique(mask))=={0,255}
 assert not np.any(mask[695:731,495:546])
assert not np.any((hb>0)&(hm>0))
points={"bread_left":[340,685],"bread_right":[450,670],"bowl_body":[635,605],"bowl_shadow":[640,652],"bread_shadow":[345,737],"linen":[250,800],"wood_block":[520,632],"loose_fragment":[520,710],"plain_wood":[570,700]}
point_values={k:{"bread":int(hb[y,x]),"bowl":int(hm[y,x])} for k,(x,y) in points.items()}
assert point_values["bread_left"]["bread"]==255
assert point_values["bread_right"]["bread"]==255
assert point_values["bowl_body"]["bowl"]==255
for key in ["bowl_shadow","bread_shadow","linen","wood_block","loose_fragment","plain_wood"]:assert point_values[key]=={"bread":0,"bowl":0},(key,point_values[key])
metrics={}
for key,file,alpha in [("bowl","state_bowl_removed_corrected_v003.png",aa),("both","state_both_removed_v003.png",aa|ab)]:
 im=np.array(Image.open(V2/file).convert("RGB"));d=np.any(im!=o,axis=2)
 metrics[key]={"changed_pixels":int(d.sum()),"outside_roi_changed_pixels":int((d&~roi).sum()),"outside_replacement_alpha_changed_pixels":int((d&~alpha).sum()),"fragment_rectangle_changed_pixels":int(d[695:731,495:546].sum()),"front_linen_sample_changed_pixels":int(d[770:941,180:370].sum()),"rear_linen_sample_changed_pixels":int(d[530:550,590:710].sum()),"wood_block_sample_changed_pixels":int(d[624:640,491:545].sum())}
 for q in ["outside_roi_changed_pixels","outside_replacement_alpha_changed_pixels","fragment_rectangle_changed_pixels","front_linen_sample_changed_pixels","rear_linen_sample_changed_pixels","wood_block_sample_changed_pixels"]:assert metrics[key][q]==0
bread=copy.deepcopy(old["states"]["bread_removed"]);bread["art_status"]="unchanged_checkpoint01_bread_v003_CTO_allows_candidate_integration"
bowl={"object":"wooden_bowl_and_all_dough","full_working_png":fm(V2/"state_bowl_removed_corrected_v003.png"),"replacement_patch_rgba_png":fm(V2/"patch_bowl_corrected_rgba_v003.png"),"replacement_patch_origin_xy":[464,480],"replacement_patch_crop_xywh":[464,480,384,256],"replacement_alpha_full_png":fm(V2/"replacement_bowl_alpha_v003.png"),"alpha_source_in_repository":fm(R/"replacement_bowl_alpha_v003.png"),"base_raw_from_checkpoint01":old["states"]["bowl_removed"]["raw_generated_png"],"correction_raw_generated_png":fm(V2/"raw_edit_03_upper_seam_v002.png"),"correction_target_png":fm(V2/"target_upper_seam_v002.png"),"original_reference_png":fm(V2/"reference_original_upper_seam_v002.png"),"correction_guidance_png":fm(V2/"guide_upper_seam_v002.png"),"correction_registration":params["registration"],"integrity_measurements":metrics["bowl"],"art_status":"PARTIAL_UPPER_BOUNDARY_REMAINS_FOR_CTO_ART_REVIEW"}
newcall=json.loads((R/"call_03_v002.json").read_text())
manifest={"schema":"HO-TP-01-checkpoint-02-v002","status":"COMPLETE_LOCAL_PACKAGE_BUT_BOWL_ART_REMAINS_PARTIAL_STOP_CTO","previous_manifest_unchanged":fm(V1/"manifest_v001.json"),"source_original_png":fm(source),"private_exact_original_copy_png":old["private_exact_original_copy_png"],"roi_full_source_xywh":[0,480,960,461],"coordinate_system":"full native source 1672x941, x right/y down, rectangle maxima exclusive","object_definitions":old["object_definitions"],"method":"precomputed independently applicable replacement patches from builtin ImageGen art plus technical registration/matting; no universal object/shadow layer system","states":{"bread_removed":bread,"bowl_removed":bowl},"combined_both_removed_png":fm(V2/"state_both_removed_v003.png"),"combined_integrity":metrics["both"],"replacement_alpha_overlap_pixels":int((ab&aa).sum()),"offline_patch_order_difference_pixels":0,"runtime_two_order_test":"not performed; offline equality does not replace Builder/QA runtime test","hit_masks":{"bread":{"file":fm(V2/"hit_bread_L_v002.png"),"repository_copy":fm(R/"hit_bread_L_v002.png"),"object_id":"bread_two_touching_large_halves","source":fm(source),"geometry":hit["outputs"]["bread"]},"bowl":{"file":fm(V2/"hit_bowl_L_v003.png"),"repository_copy":fm(R/"hit_bowl_L_v003.png"),"object_id":"bowl_and_all_dough","source":fm(source),"geometry":hit["outputs"]["bowl"]},"decoder":"PNG mode L, values 0/255. Test luminance >=128 (RGB channels equal after browser decode), NOT file alpha; L PNG has no transparency encoding.","overlap_pixels":int(((hb>0)&(hm>0)).sum()),"point_checks_full_source":point_values,"geometry_rule":hit["rule"],"parameter_file":fm(V2/"hit_mask_parameters_v003.json")},"calls":old["calls"]+[newcall],"calls_this_assignment":1,"calls_this_assignment_limit":1,"observed_pilot_calls":3,"pilot_limit":8,"early_restoration_calls":3,"early_limit":4,"early_active_hour_limit":6,"team_active_hour_limit":20,"new_call_wait_seconds":newcall["observed_wait_seconds"],"observed_pilot_imagegen_wait_seconds":old["total_observed_imagegen_wait_seconds"]+newcall["observed_wait_seconds"],"call_cost_and_separate_quota":"unknown; no paid/API/CLI route","v001_frozen_file_check":{"files_checked":len(baseline),"changed_files":changed,"baseline_file":fm(V2/"v001_frozen_hashes_before.json")},"upper_edge_protection_audit":lock,"residual_defects":[{"area_full_source_xyxy":[550,553,710,580],"description":"narrow upper transition remains visible at high magnification; old protected mask contained rim-edge pixels, 514 of its pixels changed in [522,556,740,574). Cannot claim all semantic linen-edge pixels independently accepted; candidate remains PARTIAL."},{"area_full_source_xyxy":[538,623,570,645],"description":"wood block source pixels protected; nearby contact join still requires independent edge inspection"}],"diagnostics":[fm(V2/n) for n in ["inspect_bowl_corrected_2x_v003.png","inspect_upper_corrected_5x_v003.png","inspect_hit_bread_2x_v002.png","inspect_hit_bowl_2x_v003.png","inspect_upper_source_grid_v002.png","inspect_upper_aligned_raw_grid_v002.png"]],"superseded_v002_trials":[str(V2/n) for n in ["state_bowl_technical_trial_v001.png","state_bowl_removed_corrected_v002.png","state_both_removed_v002.png","hit_bowl_L_v002.png"]],"replay_helper":fm(R/"replay_patches_v002.py"),"technical_sources":[fm(R/n) for n in ["inspect_edge_v002.py","technical_edge_trial_v002.py","prepare_upper_seam_v002.py","composite_upper_correction_v002.py","lock_stationary_edge_v003.py","build_hit_masks_v002.py","refine_bowl_hit_v003.py","package_checkpoint_v002.py"]],"independent_QA":"HOLD/not performed by artist","human_art_acceptance":"not performed","no_additional_call_opened":True}
dst=V2/"manifest_v002.json"
if dst.exists():raise FileExistsError(dst)
dst.write_text(json.dumps(manifest,indent=2,ensure_ascii=False),encoding="utf-8")
print(json.dumps({"manifest":str(dst),"v001_frozen_files":len(baseline),"v001_changed_files":changed,"alpha_overlap":0,"hit_overlap":0,"point_checks":point_values,"integrity":metrics,"old_protected_mask_changed_pixels":lock["old_protected_mask_changed_pixels"]}))

