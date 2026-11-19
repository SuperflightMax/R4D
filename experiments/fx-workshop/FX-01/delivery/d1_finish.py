"""Record bounded delivery verification after the single issued CUT; never switches/reloads."""
import json
from pathlib import Path
import subprocess
from d1_stage import SNIPPET, append_docs, live, nginx_state, protected, sha, tree, utc, write_json

FOLDER=Path('/opt/superflight-studio/backups/review-fx01-43b6268e-20261119T031029Z')

def finish():
    cut=json.loads((FOLDER/'CUT_RESULT.json').read_text())
    ready=json.loads((FOLDER/'STAGING_READY.json').read_text())
    baseline=json.loads((FOLDER/'BASELINE.json').read_text())
    http=json.loads((FOLDER/'CUT-HTTP.json').read_text())
    browser=json.loads((FOLDER/'CUT-BROWSER.json').read_text())
    assert cut['key']==http['key']==browser['key']=='FX01-D1-CUT-43b6268e-20261119T031029Z'
    assert cut['source']==http['source']==browser['source']==ready['source']
    assert http['status']=='HTTP_VERIFIED' and http['passed']==http['total']==16
    assert browser['status']=='BROWSER_DELIVERY_SMOKE_PASS' and not browser['errors'] and not browser['failed']
    for loaded in browser['loaded']:
        reference=ready['runtime']['review/r4d/fx-workshop/fx-01/'+loaded['name']]
        assert loaded['size']==reference['size'] and loaded['sha256']==reference['sha256']
    assert {r['name'] for r in browser['loaded']}=={'index.html','style.css','app.js'}
    assert sha(SNIPPET.read_bytes())==ready['candidate_snippet_sha256'] and str(live()[1])==ready['staging_root']
    assert protected()==baseline['protected']
    assert tree(Path(baseline['root']))==baseline['inventory']
    assert tree(Path(ready['staging_root']))==json.loads((FOLDER/'STAGED_INVENTORY.json').read_text())
    assert nginx_state()==cut['nginx_state_after'], 'nginx changed after CUT; inspect rather than repeat'
    subprocess.run(['nginx','-t'],check=True,capture_output=True)
    result={'key':cut['key'],'status':'PUBLISHED_UX_CANDIDATE','at_utc':utc(),'source':cut['source'],'release':ready['staging_root'],'url':cut['url'],'snippet_sha256':ready['candidate_snippet_sha256'],'inventory_sha256':ready['staging_summary']['sha256'],'http':{'passed':http['passed'],'total':http['total'],'sha256':sha((FOLDER/'CUT-HTTP.json').read_bytes())},'browser':{'checks':len(browser['checks']),'loaded_exact_files':3,'sha256':sha((FOLDER/'CUT-BROWSER.json').read_bytes())},'graceful_reload_count':cut['graceful_reload_count'],'old_tree_protected_staging_preserved':True,'rollback_executed':False,'physicalM11':'NOT_VERIFIED','human_product_gate':'PENDING'}
    write_json(FOLDER/'CUT_DELIVERY_VERIFIED.json',result)
    append_docs(f'\n\n## FX-01 published UX candidate — {cut["key"]}\n\n{utc()}. Exact source {cut["source"]}, release {ready["staging_root"]}, URL {cut["url"]}. Anonymous HTTPS 16/16: runtime size/SHA256/MIME, both catalogs/links, no-store/noindex/nosniff/Referrer-Policy/DENY/HSTS, foreign Origin/POST/dotfiles and excluded dev/doc paths. Fresh-profile real-HTTPS browser delivery smoke {len(browser["checks"])} checks PASS: exact three response bodies, catalog path, apply/configure/A-B/pin/reload; no page/console errors or failed requests. Test namespace only, browser closed. Root-only atomic switch and one graceful reload; old root, protected components and full immutable inventories preserved. Receipts {FOLDER}/CUT_DELIVERY_VERIFIED.json. Physical M11 and Max/Slava/Product+Max gates remain OPEN; NOT full FX-01 acceptance and no FX-02+.\n')
    return result

if __name__=='__main__':
    print(json.dumps(finish(),ensure_ascii=True))
