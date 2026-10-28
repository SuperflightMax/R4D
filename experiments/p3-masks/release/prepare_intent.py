"""Read-only VPS capture and local-only P3 release preparation. No remote writes."""
import hashlib
import json
import os
from pathlib import Path, PurePosixPath
import re
import subprocess
import sys
import tarfile

WORK = Path(r"E:\R4D\perspective\p3-worktrees\release-engineer")
OUT = Path(r"E:\R4D\perspective\p3-runtime\release-engineer\intent-p3-frozen-01")
FROZEN = Path(r"E:\R4D\perspective\p3-runtime\builder\full-checkpoint-06")
RELEASE_ID = "p3-jungle-masks-frozen-01"
MANIFEST_HASH = "e2e9f7d837b3d05f484f75a877af6992a70ee88363add783d80f3c6e206f431f"
CODE = "f1aca21e7b9ba19001e7e8762fcaf2511bf9bf74"
ART = "f899a308aed156a11e2a1013292ed68c6669959d"
SSH = ["ssh", "-o", "BatchMode=yes", "-o", "StrictHostKeyChecking=yes",
       "-o", "ConnectTimeout=15", "-o", "ConnectionAttempts=1", "vps1-direct"]


def digest(data):
    return hashlib.sha256(data).hexdigest()


def file_entry(path, relative):
    data = path.read_bytes()
    return {"path": relative, "bytes": len(data), "sha256": digest(data)}


def inventory(root, exclude=()):
    result = []
    for p in sorted(root.rglob("*")):
        assert not p.is_symlink(), "Symlink prohibited"
        if p.is_file() and p.relative_to(root).as_posix() not in exclude:
            result.append(file_entry(p, p.relative_to(root).as_posix()))
    return sorted(result, key=lambda f: f["path"])


def write_json(path, value):
    path.write_bytes((json.dumps(value, ensure_ascii=False, indent=2) + "\n").encode())


def ssh_python(script):
    result = subprocess.run(SSH + ["python3 -"], input=script.encode(),
                            stdout=subprocess.PIPE, stderr=subprocess.PIPE, check=True)
    return json.loads(result.stdout)


def verify_frozen():
    raw = (FROZEN / "file-manifest.json").read_bytes()
    assert digest(raw) == MANIFEST_HASH
    m = json.loads(raw)
    assert m["sourceCommit"] == CODE
    listed = sorted(m["files"], key=lambda f: f["path"])
    actual = inventory(FROZEN, ("file-manifest.json",))
    assert actual == listed, "Frozen payload identity mismatch"
    assert len(actual) == 76 and sum(f["bytes"] for f in actual) == 3388537
    return {"manifestSha256": digest(raw), "manifestBytes": len(raw),
            "payloadFiles": len(actual), "payloadBytes": sum(f["bytes"] for f in actual)}


REMOTE = r'''
import pathlib,re,json,hashlib,datetime,os
h=lambda b:hashlib.sha256(b).hexdigest()
s=pathlib.Path('/etc/nginx/snippets/review.locations.conf'); b=s.read_bytes()
pattern=rb'(^\s*root\s+)([^;\s]+)(\s*;)'
roots=re.findall(pattern,b,re.M)
assert roots and len({x[1] for x in roots})==1
r=pathlib.Path(roots[0][1].decode()).resolve()
base=pathlib.Path('/srv/superflight-review/releases'); assert r.is_relative_to(base)
release=base/r.relative_to(base).parts[0]
mp=release/'RELEASE_MANIFEST.json'; mb=mp.read_bytes(); m=json.loads(mb)
entries=sorted(m['published_files'],key=lambda f:f['path'])
actual=[]
for p in sorted(r.rglob('*')):
 assert not p.is_symlink()
 if p.is_file() and p!=mp:
  data=p.read_bytes(); actual.append({'path':p.relative_to(r).as_posix(),'bytes':len(data),'sha256':h(data)})
assert entries==actual, 'Live bytes differ from published manifest'
assert len(actual)==m['published_file_count']
assert sum(f['bytes'] for f in actual)==m['published_bytes']
target=base/'p3-jungle-masks-frozen-01'; assert not target.exists(), 'Proposed release exists'
candidate=re.sub(pattern,lambda x:x[1]+str(target).encode()+x[3],b,flags=re.M)
normalize=lambda x:re.sub(pattern,lambda y:y[1]+b'<REVIEW_ROOT>'+y[3],x,flags=re.M)
assert normalize(candidate)==normalize(b)
docs=[]
for name in ['/home/sf/assistant-context/vps/services/superflight-studio.md','/opt/superflight-studio/README_RU.txt','/home/sf/assistant-context/vps/INDEX.md','/home/sf/assistant-context/vps/PROCEDURES.md']:
 docs.append({'path':name,'sha256':h(pathlib.Path(name).read_bytes())})
print(json.dumps({'utc':datetime.datetime.now(datetime.timezone.utc).isoformat(),
 'root':str(r),'releaseDir':str(release),'manifestPath':str(mp),'manifestSha256':h(mb),
 'manifestBytes':len(mb),'publishedFiles':actual,'publishedBytes':sum(f['bytes'] for f in actual),
 'snippetPath':str(s),'snippetSha256':h(b),'snippetRootNormalizedSha256':h(normalize(b)),
 'candidateSnippetSha256':h(candidate),'rootDirectiveCount':len(roots),
 'proposedRoot':str(target),'docs':docs,'diskFreeBytes':os.statvfs(r).f_bavail*os.statvfs(r).f_frsize}))
'''


def guard_same(a, b):
    for k in ("root", "manifestSha256", "snippetSha256", "publishedFiles"):
        assert a[k] == b[k], "Baseline changed: " + k


def capture():
    print("Frozen identity:", json.dumps(verify_frozen()), flush=True)
    assert not OUT.exists() or not any(OUT.iterdir()), "Do not overwrite capture"
    OUT.mkdir(parents=True, exist_ok=True)
    before = ssh_python(REMOTE)
    write_json(OUT / "baseline-guard.json", before)
    print("Live manifest and opaque bytes verified; downloading baseline", flush=True)
    archive = OUT / "baseline.tar"
    # Absolute root is validated above; shlex quoting prevents command interpolation.
    import shlex
    with archive.open("xb") as target:
        subprocess.run(SSH + ["tar -cf - -C " + shlex.quote(before["root"]) + " ."],
                       stdout=target, stderr=subprocess.PIPE, check=True)
    baseline = OUT / "baseline"
    baseline.mkdir()
    with tarfile.open(archive, "r:") as source:
        for member in source:
            name = PurePosixPath(member.name)
            assert not name.is_absolute() and ".." not in name.parts
            target = baseline.joinpath(*name.parts)
            if member.isdir():
                target.mkdir(parents=True, exist_ok=True)
            else:
                assert member.isfile(), "Only ordinary files/directories allowed"
                target.parent.mkdir(parents=True, exist_ok=True)
                with target.open("xb") as output:
                    import shutil
                    shutil.copyfileobj(source.extractfile(member), output)
    assert inventory(baseline, ("RELEASE_MANIFEST.json",)) == before["publishedFiles"]
    assert digest((baseline / "RELEASE_MANIFEST.json").read_bytes()) == before["manifestSha256"]
    after = ssh_python(REMOTE)
    guard_same(before, after)
    write_json(OUT / "baseline-guard-after-capture.json", after)
    # Output only the shared catalog shell; never disclose old card contents.
    catalog = (baseline / "review/index.html").read_text(encoding="utf-8")
    section = re.search(r'<section\b[^>]*aria-labelledby="r4d-perspective-title"[^>]*>(.*?)</section>', catalog, re.S)
    assert section
    first = re.search(r'<a\b[^>]*class="card"[^>]*>.*?</a>', section[1], re.S)
    assert first
    header = section[1][:first.start()]
    print("Catalog section shell:", header, flush=True)
    import html.parser
    class Skeleton(html.parser.HTMLParser):
        def handle_starttag(self, tag, attrs):
            print("card tag", tag, {k:v for k,v in attrs if k!='href'})
    if first:
        Skeleton().feed(first[0])
    print("CAPTURE_COMPLETE", json.dumps({"root": before["root"],
          "publishedFiles": len(before["publishedFiles"]), "bytes": before["publishedBytes"],
          "archiveSha256": digest(archive.read_bytes())}), flush=True)


def prepare():
    import shutil
    import difflib
    frozen = verify_frozen()
    before = json.loads((OUT / "baseline-guard.json").read_bytes())
    after = json.loads((OUT / "baseline-guard-after-capture.json").read_bytes())
    guard_same(before, after)
    baseline = OUT / "baseline"
    assert inventory(baseline, ("RELEASE_MANIFEST.json",)) == before["publishedFiles"]
    root = OUT / "release" / RELEASE_ID
    assert not root.exists(), "Do not overwrite a prepared release"
    shutil.copytree(baseline, root)
    route = root / "review/r4d/p3-masks"
    assert not route.exists(), "P3 route already exists in baseline"
    shutil.copytree(FROZEN, route)
    assert inventory(route) == inventory(FROZEN)
    card_bytes = (WORK / "experiments/p3-masks/release/catalog-card.html").read_bytes()
    card = card_bytes.decode("utf-8").replace("\r\n", "\n")
    old = (root / "review/index.html").read_bytes()
    text = old.decode("utf-8")
    assert "\r" not in text, "Preserve source line endings explicitly"
    section = re.search(r'<section\b[^>]*aria-labelledby="r4d-perspective-title"[^>]*>(.*?)</section>', text, re.S)
    assert section and section[1].count('<span>2 демонстрации</span>') == 1
    end = section[1].rfind("      </div>")
    assert end >= 0
    insert = section.start(1) + end
    updated = text[:insert] + card + text[insert:]
    counter_old = '<span>2 демонстрации</span>'
    counter_new = '<span>3 демонстрации</span>'
    start = section.start(1)
    pos = updated.index(counter_old, start, insert)
    updated = updated[:pos] + updated[pos:].replace(counter_old, counter_new, 1)
    assert updated.replace(card, "", 1).replace(counter_new, counter_old, 1).encode() == old
    new = updated.encode("utf-8")
    (root / "review/index.html").write_bytes(new)
    patch = "".join(difflib.unified_diff(text.splitlines(True), updated.splitlines(True),
                    fromfile="baseline/review/index.html", tofile="candidate/review/index.html", n=0))
    (OUT / "catalog.delta.patch").write_bytes(patch.encode("utf-8"))
    published = inventory(root, ("RELEASE_MANIFEST.json",))
    old_map = {x["path"]:x for x in before["publishedFiles"]}
    new_map = {x["path"]:x for x in published}
    changed = [p for p in old_map if old_map[p] != new_map[p]]
    added = sorted(new_map.keys() - old_map.keys())
    assert changed == ["review/index.html"]
    assert len(added) == 77 and all(p.startswith("review/r4d/p3-masks/") for p in added)
    assert all(p.startswith("review/") for p in new_map), "Manifest remains outside /review"
    qa = []
    for commit, name in [
        ("c0db64fe4a0204d77be0d3ab61ffe21331d9c90a", "technical-qa/TQA_REPORT_FROZEN_01.md"),
        ("0f282b89a5d58f6613153ceb385657c8fb761b1d", "visual-qa/REPORT_FROZEN_01.md")]:
        path = "experiments/p3-masks/" + name
        raw = subprocess.check_output(["git", "-C", str(WORK), "show", commit + ":" + path])
        for expected in (CODE, ART, MANIFEST_HASH):
            assert expected.encode() in raw
        qa.append({"commit":commit,"path":path,"sha256":digest(raw),"bytes":len(raw)})
    metadata = {
        "schema_version":1,"release_id":RELEASE_ID,"path_prefix":"/review/",
        "publication_note":"Частичный исследовательский результат; полный художественный PASS не выдан.",
        "previous_release":before["root"],"previous_manifest":before["manifestSha256"],
        "preparation_recipe_sha256":digest(Path(__file__).read_bytes()),
        "p3_masks":{"candidate":"P3-frozen-01","code_commit":CODE,"art_commit":ART,
          "handoff_commit":"4603d99a5904d10924f55416e36100b2c470b534",
          "frozen_manifest_sha256":MANIFEST_HASH,"qa_reports":qa,
          "limitation":"Общий маппинг left-5: seed2818447218/t612, ранний отскок от видимого пола; плохой повтор сохранён. Не full visual/art PASS."},
        "catalog_update":{"path":"review/index.html","previous_sha256":digest(old),
          "sha256":digest(new),"previous_bytes":len(old),"bytes":len(new),
          "added_card_sha256":digest(card.encode()),"perspective_count_before":2,"perspective_count_after":3,
          "reverse_delta_restores_exact_baseline":True},
        "published_file_count":len(published),"published_bytes":sum(x["bytes"] for x in published),
        "published_files":published}
    write_json(root / "RELEASE_MANIFEST.json", metadata)
    # The manifest itself is outside /review and is hashed by the intent, avoiding self-reference.
    archive = OUT / (RELEASE_ID + ".tar.gz")
    assert not archive.exists()
    with tarfile.open(archive, "w:gz", compresslevel=1) as target:
        for p in sorted(root.rglob("*"), key=lambda p:p.relative_to(root).as_posix()):
            info = target.gettarinfo(str(p), arcname=p.relative_to(root).as_posix())
            info.uid = info.gid = 0
            info.uname = info.gname = "root"
            info.mtime = 0
            info.mode = 0o755 if p.is_dir() else 0o644
            if p.is_file():
                with p.open("rb") as source:
                    target.addfile(info, source)
            else:
                target.addfile(info)
    assert inventory(route) == inventory(FROZEN), "Do not modify frozen bytes"
    assert inventory(root, ("RELEASE_MANIFEST.json",)) == published
    archive_files = []
    with tarfile.open(archive, "r:gz") as transport:
        for member in transport:
            assert member.uid == member.gid == 0
            assert member.mode == (0o755 if member.isdir() else 0o644)
            assert member.isdir() or member.isfile()
            if member.isfile():
                data = transport.extractfile(member).read()
                archive_files.append({"path":member.name,"bytes":len(data),"sha256":digest(data)})
    assert sorted(archive_files, key=lambda f:f["path"]) == inventory(root)
    summary = {"server_write":False,"releaseId":RELEASE_ID,"proposedRoot":before["proposedRoot"],
      "releaseTree":str(root),"manifest":file_entry(root/"RELEASE_MANIFEST.json","RELEASE_MANIFEST.json"),
      "archive":file_entry(archive,archive.name),"payload":frozen,
      "publishedFiles":len(published),"publishedBytes":metadata["published_bytes"],
      "totalFiles":len(published)+1,"totalBytes":metadata["published_bytes"]+(root/"RELEASE_MANIFEST.json").stat().st_size,
      "unchangedBaselineFiles":len(old_map)-1,"changedBaselineFiles":changed,"addedFiles":len(added),
      "catalog":metadata["catalog_update"],"qa":qa,
      "baselineGuard":{k:before[k] for k in ("root","manifestSha256","snippetSha256","snippetRootNormalizedSha256","candidateSnippetSha256","rootDirectiveCount")},
      "rollbackProposed":"/opt/superflight-studio/backups/review-p3-frozen-01-<CTO-token-id>",
      "rollbackExists":False,"ctotoken":None}
    write_json(OUT / "intent-summary.json", summary)
    print(json.dumps(summary, ensure_ascii=False, indent=2), flush=True)


def recheck():
    before = json.loads((OUT / "baseline-guard.json").read_bytes())
    current = ssh_python(REMOTE)
    guard_same(before, current)
    write_json(OUT / "baseline-guard-final.json", current)
    print("BASELINE_GUARD_UNCHANGED", current["utc"], current["root"], flush=True)


if __name__ == "__main__":
    assert len(sys.argv) == 2 and sys.argv[1] in ("verify", "capture", "prepare", "recheck")
    if sys.argv[1] == "verify":
        print(json.dumps(verify_frozen()))
    elif sys.argv[1] == "capture":
        capture()
    elif sys.argv[1] == "prepare":
        prepare()
    else:
        recheck()
