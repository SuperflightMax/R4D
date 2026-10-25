"""Hash-only preparation. Does not instantiate Cage or optimize actual inputs."""
from pathlib import Path
import json,hashlib
HERE=Path(__file__).resolve().parent;QROOT=HERE.parents[1];R1=HERE.parent/'early-v04-r1'
sha=lambda p:hashlib.sha256(p.read_bytes()).hexdigest()
read=lambda p:json.loads(p.read_text(encoding='utf-8'))
if (HERE/'ACTUAL_RUN_STARTED.json').exists():raise SystemExit('No re-freeze after actual run starts.')
contract=HERE/'R2_SOLVER_CONTRACT.md'
expected={R1/'CAGE_REST.json':'4a61860b531a233745fac0ba6402678f391fff908af3631df61865672b85d0f7',
 R1/'CAGE_TARGETS.json':'3907a869b637708170c0d5650e404fc359f63013f1843789b7592198a3a19a6b',
 R1/'SOURCE_GEOMETRY.json':'6decc6ffe46937a7f09717cf4198699d32108a396f2798299bfb05cdf975d391',
 R1/'inputs03/SHORTS_TRACE.json':'330468ff7eba951f88efb8b4af464f3b772094a67bea9ac62124b0cc3345484a',
 R1/'inputs03/MATERIALS.json':'5c03e254dca5e430d978b9fcf4bd713df639375039af25523b442d3239a0c65f'}
for p,v in expected.items():
 if sha(p)!=v:raise SystemExit(f'Frozen input changed: {p.name}')
synthetic=read(HERE/'synthetic/SYNTHETIC_CHECK.json')
if not synthetic['pass']or not synthetic['noActualInputsLoaded']:raise SystemExit('Synthetic preflight missing/failed.')
rest=read(R1/'CAGE_REST.json');targets=read(R1/'CAGE_TARGETS.json')
assert(len(rest['vertices']),len(rest['triangles']),len(rest['constraints']))==(614,1169,29)
assert len(targets['frames'])==241 and targets['drop']==230 and targets['back']==-110
files=list(expected)+[contract,HERE/'CONFIG.json',HERE/'positive_solver.py',HERE/'run_r2.py',HERE/'freeze_contract.py',
 HERE/'CODE_READINESS.md',R1/'CAGE_COVERAGE.json',R1/'GEOMETRY_FEASIBILITY.json',R1/'FINAL_LINKAGE.json',
 QROOT/'app/early-v04-r1/kinematics.mjs',QROOT/'art/whole-v04/raw/whole-v04.png',
 QROOT/'art/early-v04-r1/MATERIALS.json',QROOT/'art/early-v04-r1/SHORTS_TRACE.json']
manifest=read(R1/'inputs03/MATERIALS.json')
for material in manifest['materials']:
 p=R1/'inputs03'/material['file'];assert sha(p)==material['sha256'];files.append(p)
 p=QROOT/'art/early-v04-r1'/material['file'];assert sha(p)==material['sha256'];files.append(p)
files+=list((HERE/'synthetic').glob('*.json'))+list((HERE/'synthetic').glob('*.jsonl'))
hashes={str(p.relative_to(QROOT)):sha(p)for p in files}
data={'version':'R2-contract01-before-actual','purpose':'published pre-run contract/code/frozen inputs; hash-only capture, no actual optimization',
 'contractSha256':sha(contract),'syntheticPreflightPass':True,'actualSolveStarted':False,
 'immutableCounts':{'vertices':614,'triangles':1169,'pins':29,'outputs':241,'drop':230,'back':-110},'sha256':hashes}
(HERE/'R2_HASHES.json').write_text(json.dumps(data,indent=2)+'\n',encoding='utf-8')
assert all(sha(QROOT/p)==v for p,v in hashes.items())
print(json.dumps({'contractSha256':data['contractSha256'],'manifestSha256':sha(HERE/'R2_HASHES.json'),
 'files':len(hashes),'allHashesVerified':True,'actualSolveStarted':False},indent=2))
