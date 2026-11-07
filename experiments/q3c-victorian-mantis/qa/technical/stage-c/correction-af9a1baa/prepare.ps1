param([Parameter(Mandatory)][string] $RunRoot)

$ErrorActionPreference = 'Stop'
$stage = Split-Path -Parent $PSScriptRoot
$run = (Resolve-Path -LiteralPath $RunRoot).Path
$sha = 'af9a1baa7122fc5d17d0783581a564be2d32f187'
$prior = 'bffca72375cee40e8cd96bb19e47b60f7b95e5d9'
if (-not $run.StartsWith((Join-Path $stage ".local\$sha-"), [StringComparison]::OrdinalIgnoreCase)) {
    throw 'Wrong QA run directory.'
}
$pin = Get-Content -LiteralPath "$run/pin.json" -Raw | ConvertFrom-Json
if ($pin.candidateSha -ne $sha) { throw 'Wrong candidate.' }
$buildHash = (Get-FileHash -LiteralPath "$run/build-manifest.json").Hash.ToLowerInvariant()
$binding = @{sha=$sha; buildSha256=$buildHash; output=(Join-Path $run 'evidence').Replace('\','/')} | ConvertTo-Json -Compress

$intro = (Get-Content -LiteralPath "$stage/correction-3be9dbf1/observe-intro.js" -Raw).
    Replace('127.0.0.1:4207', '127.0.0.1:4211').
    Replace('phase: frame.phase, planted: frame.planted,', 'phase: frame.phase, body: frame.pose.body, lift: frame.pose.lift, planted: frame.planted,').
    Replace('selected.map(id =>', 'all.map(id =>').
    Replace('return [id, { matrix, physicalMatrix, roll }];', 'return [id, { matrix, physicalMatrix, roll, world: frame.pose.parts[id].world }];')
if (-not $intro.Contains('parts: Object.fromEntries(all.map') -or -not $intro.Contains('world: frame.pose.parts[id].world')) {
    throw 'Intro template anchors changed.'
}
$intro.Replace('const binding = null;', "const binding = $binding;") |
    Set-Content -LiteralPath "$run/observe-intro.js" -Encoding utf8
$smoke = Get-Content -LiteralPath "$PSScriptRoot/normal-smoke.js" -Raw
$smoke.Replace('const binding = null;', "const binding = $binding;") |
    Set-Content -LiteralPath "$run/normal-smoke.js" -Encoding utf8

# Reuse the prior contact regression check byte-for-byte apart from run binding.
$source = Get-Content -LiteralPath "$stage/correction-bffca723/measure-contact.mjs" -Raw
$cut = $source.IndexOf('function inspectGeometry(')
if ($cut -lt 0) { throw 'Prior contact probe anchor changed.' }
$contact = $source.Substring(0, $cut).
    Replace($prior, $sha).
    Replace('3be9dbf11e7a07a2678c3be161e54fd24aa7f893', $prior).
    Replace('../correction-3be9dbf1/evidence/', '../../correction-bffca723/evidence/')
$contact + 'export { capture, contactCheck, sha, baseline, buildSha256, oldBuildSha256, previous, legIds };' |
    Set-Content -LiteralPath "$run/contact-probe.mjs" -Encoding utf8
