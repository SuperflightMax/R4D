from pathlib import Path
from PIL import Image
import numpy as np,json,argparse
ap=argparse.ArgumentParser(description="Replay saved HO-TP-01 patches only; no generation.")
ap.add_argument("--manifest",default=r"K:\Agents\R4D\Review\HO-TP-01\assets\v002\manifest_v002.json")
ap.add_argument("--output-dir")
ap.add_argument("--verify-only",action="store_true")
a=ap.parse_args();m=json.loads(Path(a.manifest).read_text(encoding="utf-8"))
orig=Image.open(m["source_original_png"]["path"]).convert("RGBA")
patches={k:Image.open(s["replacement_patch_rgba_png"]["path"]).convert("RGBA") for k,s in m["states"].items()}
results={}
for key,s in m["states"].items():
 im=orig.copy();im.alpha_composite(patches[key],tuple(s["replacement_patch_origin_xy"]));im=im.convert("RGB")
 exp=Image.open(s["full_working_png"]["path"]).convert("RGB")
 diff=int(np.any(np.array(im)!=np.array(exp),axis=2).sum());assert diff==0,(key,diff)
 results[key]=diff
 if a.output_dir and not a.verify_only:
  d=Path(a.output_dir);d.mkdir(parents=True,exist_ok=True);p=d/Path(s["full_working_png"]["path"]).name
  if p.exists():raise FileExistsError(p)
  im.save(p)
both=orig.copy()
for key,s in m["states"].items():both.alpha_composite(patches[key],tuple(s["replacement_patch_origin_xy"]))
exp=Image.open(m["combined_both_removed_png"]["path"]).convert("RGB")
diff=int(np.any(np.array(both.convert("RGB"))!=np.array(exp),axis=2).sum());assert diff==0,diff
results["both_removed"]=diff
if a.output_dir and not a.verify_only:
 p=Path(a.output_dir)/Path(m["combined_both_removed_png"]["path"]).name
 if p.exists():raise FileExistsError(p)
 both.convert("RGB").save(p)
print(json.dumps({"offline_replay_mismatched_pixels":results,"runtime_order_test":"not performed here"}))

