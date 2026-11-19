from pathlib import Path
from PIL import Image
import numpy as np,json,argparse
ap=argparse.ArgumentParser(description="Replay already-generated restoration patches; no generation or texture drawing.")
ap.add_argument("--manifest",default=r"K:\Agents\R4D\Review\HO-TP-01\assets\v001\manifest_v001.json")
ap.add_argument("--output-dir")
ap.add_argument("--verify-only",action="store_true")
a=ap.parse_args()
m=json.loads(Path(a.manifest).read_text(encoding="utf-8"))
results={}
for key,s in m["states"].items():
 full=Image.open(m["private_exact_original_copy_png"]["path"]).convert("RGBA")
 patch=Image.open(s["replacement_patch_rgba_png"]["path"]).convert("RGBA")
 full.alpha_composite(patch,tuple(s["replacement_patch_origin_xy"]))
 im=full.convert("RGB")
 expected=Image.open(s["full_working_png"]["path"]).convert("RGB")
 mismatch=int(np.any(np.array(im)!=np.array(expected),axis=2).sum())
 if mismatch:raise RuntimeError(f"{key}: replay differs at {mismatch} pixels")
 if a.output_dir and not a.verify_only:
  outdir=Path(a.output_dir);outdir.mkdir(parents=True,exist_ok=True)
  out=outdir/Path(s["full_working_png"]["path"]).name
  if out.exists():raise FileExistsError(out)
  im.save(out)
 results[key]={"replay_mismatched_pixels":mismatch,"size":list(im.size)}
print(json.dumps(results))

