from pathlib import Path
from PIL import Image
import numpy as np,json,hashlib
P=Path(r"K:\Agents\R4D\Review\HO-TP-01\assets\v001")
R=Path(r"D:\dev\R4D\experiments\hidden-object\HO-TP-01\art")
SOURCE=Path(r"K:\Agents\R4D\Review\HO-AF-01\C-ship-bakery\HO-AF-01_C_selected-master_from-C2-correction01_20261119T085657Z.png")
def fm(p):
 p=Path(p);v={"path":str(p),"bytes":p.stat().st_size,"sha256":hashlib.sha256(p.read_bytes()).hexdigest()}
 if p.suffix.lower()==".png":
  with Image.open(p) as im:v.update(width=im.width,height=im.height,mode=im.mode)
 return v
assert fm(SOURCE)["sha256"]=="f6f96897290470778067ae15cba408418673f7578c38195736bee60fb822a65e"
orig=np.array(Image.open(SOURCE).convert("RGB"))
roi=np.zeros(orig.shape[:2],bool);roi[480:941,:960]=True
tech=json.loads((P/"technical_composite_v002.json").read_text())
calls=json.loads((R/"calls_v001.json").read_text())
states={}
selected={
"bread_removed":{"object":"two_touching_large_bread_halves_only","name":"bread","state":"state_bread_removed_v003.png","patch":"patch_bread_rgba_v003.png","alpha":"mask_bread_alpha_v003.png","protected":"protected_bread_v003.png","crop":[176,535,480,320],"raw":"raw_edit_01_bread_v001.png","guide":"guide_bread_v001.png","quality":"candidate_for_CTO_review_not_independent_PASS"},
"bowl_removed":{"object":"wooden_bowl_and_all_dough","name":"bowl","state":"state_bowl_removed_v002.png","patch":"patch_bowl_rgba_v002.png","alpha":"mask_bowl_alpha_v004.png","protected":"protected_bowl_v004.png","crop":[464,480,384,256],"raw":"raw_edit_02_bowl_v001.png","guide":"guide_bowl_v003.png","quality":"partial_visible_upper_edge_linen_seam_do_not_treat_as_art_accepted"}
}
alphas=[]
for key,c in selected.items():
 im=np.array(Image.open(P/c["state"]).convert("RGB"))
 assert im.shape==orig.shape
 alpha=np.array(Image.open(P/c["alpha"]))
 protected=np.array(Image.open(P/c["protected"]))>0
 diff=np.any(im!=orig,axis=2);alphas.append(alpha>0)
 xy=np.argwhere(diff)
 metrics={"changed_pixels":int(diff.sum()),"changed_bbox_xyxy":[int(xy[:,1].min()),int(xy[:,0].min()),int(xy[:,1].max()+1),int(xy[:,0].max()+1)],"outside_roi_changed_pixels":int(np.count_nonzero(diff&~roi)),"outside_exact_alpha_changed_pixels":int(np.count_nonzero(diff&(alpha==0))),"protected_shapes_changed_pixels":int(np.count_nonzero(diff&protected)),"separate_fragment_CTO_rectangle_changed_pixels":int(diff[695:731,495:546].sum()),"front_linen_sample_changed_pixels":int(diff[770:941,180:370].sum()),"rear_linen_sample_changed_pixels":int(diff[530:550,590:710].sum()),"wooden_block_sample_changed_pixels":int(diff[624:640,491:545].sum())}
 assert all(metrics[k]==0 for k in ["outside_roi_changed_pixels","outside_exact_alpha_changed_pixels","protected_shapes_changed_pixels","separate_fragment_CTO_rectangle_changed_pixels","front_linen_sample_changed_pixels","rear_linen_sample_changed_pixels","wooden_block_sample_changed_pixels"])
 states[key]={"object":c["object"],"full_working_png":fm(P/c["state"]),"replacement_patch_rgba_png":fm(P/c["patch"]),"replacement_patch_origin_xy":c["crop"][:2],"replacement_patch_crop_xywh":c["crop"],"replacement_alpha_full_png":fm(P/c["alpha"]),"alpha_source_in_repository":fm(R/c["alpha"]),"protected_pixel_mask_png":fm(P/c["protected"]),"raw_generated_png":fm(P/c["raw"]),"edit_target_png":fm(P/f"target_{c['name']}_v001.png"),"edit_guidance_png":fm(P/c["guide"]),"registered_native_crop_png":fm(P/f"aligned_{c['name']}_v002.png"),"registration":tech[c["name"]]["registration"],"integrity_measurements":metrics,"art_status":c["quality"],"diagnostic_2x_png":fm(P/("inspect_state_bread_2x_v003.png" if c["name"]=="bread" else "inspect_state_bowl_2x_v002.png"))}
overlap=int(np.count_nonzero(alphas[0]&alphas[1]));assert overlap==0
m={"schema":"HO-TP-01-checkpoint-01-v001","status":"CHECKPOINT_CANDIDATES_ONLY_STOP_FOR_CTO","source_original_png":fm(SOURCE),"private_exact_original_copy_png":fm(P/"original_C2_exact.png"),"roi_full_source_xywh":[0,480,960,461],"coordinate_system":"native full source 1672x941, x right, y down; rectangle upper bounds exclusive","object_definitions":{"bread":"ONLY two large touching halves. Separate fragment around x495..545,y695..730 and all loose crumbs remain original.","bowl":"Entire wooden bowl together with all dough. Bread, linen, wooden detail and other environment stay."},"method":"Two precomputed restoration states and registered replacement patches. Not a universal object/background/shadow layer system. No script-drawn artistic forms/textures. Replacement alphas include blend/contact restoration area and are NOT click/hit masks.","states":states,"mask_overlap_pixels":overlap,"combined_state":"not produced or artist-reviewed in this checkpoint; masks disjoint, assembly belongs to Builder","calls":calls,"calls_this_assignment":2,"calls_this_assignment_limit":2,"subscription_call_cost":"unknown","separate_imagegen_quota":"not measured","total_observed_imagegen_wait_seconds":sum(c["observed_wait_seconds"] for c in calls),"replay_helper":fm(R/"replay_patches_v001.py"),"technical_sources":[fm(p) for p in sorted(R.glob("*.py"))],"mask_parameter_sources":[fm(P/"mask_parameters_v001.json"),fm(P/"mask_parameters_bowl_v003.json"),fm(P/"mask_refinement_v002.json")],"superseded_not_selected":[str(P/n) for n in ["state_bread_removed_v001.png","state_bread_removed_v002.png","state_bowl_removed_v001.png"]],"independent_QA":"HOLD; no independent PASS declared","human_art_acceptance":"not performed","no_further_generation_authorized_by_this_checkpoint":True}
out=P/"manifest_v001.json"
if out.exists():raise FileExistsError(out)
out.write_text(json.dumps(m,indent=2,ensure_ascii=False),encoding="utf-8")
print(json.dumps({"manifest":str(out),"mask_overlap_pixels":overlap,"states":{k:v["integrity_measurements"] for k,v in states.items()}},ensure_ascii=False))

