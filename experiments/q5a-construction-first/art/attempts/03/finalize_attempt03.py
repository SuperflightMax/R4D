"""Verify this candidate, record actual reproduction, publish authorized art entrypoints."""
import hashlib,json,subprocess,sys
from pathlib import Path

HERE=Path(__file__).resolve().parent
ART=HERE.parents[1];ROOT=ART.parent;REPO=ROOT.parents[1]
def sha(p):return hashlib.sha256(p.read_bytes()).hexdigest()
def save(p,d):p.write_bytes((json.dumps(d,ensure_ascii=False,indent=2)+'\n').encode('utf-8'))
def run(name,*args):
    result=subprocess.run([sys.executable,'-B',str(HERE/name),*args],cwd=REPO,capture_output=True,text=True,check=True)
    print(result.stdout,flush=True)
    if result.stderr:print(result.stderr,file=sys.stderr,flush=True)
    return json.loads(result.stdout)

repeat=run('prepare_attempt03.py','--check')
assert repeat['result']=='PASS' and repeat['files']==86
independent=run('validate_attempt03.py','--save')
assert independent['result']=='PASS' and independent['hands_scales']==76
base=json.loads((HERE/'validation.json').read_bytes())
old=json.loads((ART/'attempts/02/candidate-validation-v2.json').read_bytes())
for s in old['generated_sources']:assert sha(ART/s['file'])==s['sha256']
reproduction={
 'result':'PASS','command':'python -B experiments/q5a-construction-first/art/attempts/03/prepare_attempt03.py --check',
 'observed_stdout':repeat,'scope':'86 existing outputs recomputed in memory and byte-compared; no output regeneration during check',
 'scripts_sha256':{n:sha(HERE/n) for n in ['prepare_attempt03.py','validate_attempt03.py']},
 'package_sha256':sha(HERE/'package.json'),'validation_sha256':sha(HERE/'validation.json'),
 'independent_checks_sha256':sha(HERE/'independent-checks.json'),
 'outputs_sha256':base['outputs_sha256']}
save(HERE/'reproduction.json',reproduction)
candidate=json.loads((HERE/'package.json').read_bytes())
candidate.update({'validation':'attempts/03/candidate-validation.json','gate_commit':'d3bdf8f1cffebe2179805eeb54a8a36faab08805',
 'method':'existing generated material, deterministic local retouch and v4 registration; no additional generation',
 'correction_log':'attempts/03/ART_CORRECTIONS.md','source_provenance':'attempts/02/ART-attempt02.md'})
validation={'result':'NUMERIC_AND_REPRODUCTION_PASS_REVIEW_PENDING','construction_sha256':base['construction_sha256'],
 'selected_attempt':'03','surface_count':15,'additional_imagegen_calls':0,'retouched_surfaces':base['retouched_surfaces'],
 'geometry':base['geometry'],'protected_prior_files':162,'pose_checks':base['pose_checks'],
 'authored_hand_alpha_checks':base['authored_hand_alpha_checks'],'independent_summary':independent,
 'generated_sources':old['generated_sources'],
 'evidence_sha256':{'attempts/03/'+n:sha(HERE/n) for n in ['package.json','validation.json','independent-checks.json','reproduction.json','prepare_attempt03.py','validate_attempt03.py','ART_CORRECTIONS.md']},
 'outputs_sha256':{'attempts/03/'+n:h for n,h in base['outputs_sha256'].items()},
 'visual_review':'Asset Artist static review complete; Concept/Builder acceptance pending; motion not evaluated',
 'protected_entrypoint_archives':{'ART.md':'art/attempts/02/ART-attempt02.md','art/package.json':'art/attempts/02/candidate-package-v2.json','art/validation.json':'art/attempts/02/candidate-validation-v2.json'}}
save(HERE/'candidate-package.json',candidate);save(HERE/'candidate-validation.json',validation)
(ART/'package.json').write_bytes((HERE/'candidate-package.json').read_bytes())
(ART/'validation.json').write_bytes((HERE/'candidate-validation.json').read_bytes())
(ROOT/'ART.md').write_bytes((HERE/'ART-current.md').read_bytes())
print(json.dumps({'result':'CANDIDATE_PUBLISHED_FOR_REVIEW','package_sha256':sha(ART/'package.json'),
 'validation_sha256':sha(ART/'validation.json'),'construction_sha256':sha(ROOT/'construction/construction.json')},indent=2),flush=True)
