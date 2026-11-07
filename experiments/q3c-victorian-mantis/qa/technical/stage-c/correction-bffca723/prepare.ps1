param([Parameter(Mandatory)][string] $RunRoot)

$ErrorActionPreference = 'Stop'
$stage = Split-Path -Parent $PSScriptRoot
$templateRoot = Join-Path $stage 'correction-3be9dbf1'
$sha = 'bffca72375cee40e8cd96bb19e47b60f7b95e5d9'
$old = '3be9dbf11e7a07a2678c3be161e54fd24aa7f893'
$run = (Resolve-Path -LiteralPath $RunRoot).Path
if (-not $run.StartsWith((Join-Path $stage ".local\$sha-"), [StringComparison]::OrdinalIgnoreCase)) {
    throw 'Select the exact contact correction run directory.'
}

$source = (Get-Content -LiteralPath "$templateRoot/bind.ps1" -Raw).
    Replace('$PSScriptRoot', '$templateRoot').Replace($old, $sha).Replace('127.0.0.1:4207', '127.0.0.1:4209')
& ([scriptblock]::Create($source)) -RunRoot $run
$intro = (Get-Content -LiteralPath "$run/observe-intro.js" -Raw).Replace('127.0.0.1:4207', '127.0.0.1:4209')
$intro = $intro.Replace('phase: frame.phase, planted: frame.planted,',
    'phase: frame.phase, body: frame.pose.body, lift: frame.pose.lift, planted: frame.planted,').
    Replace('return [id, { matrix, physicalMatrix, roll }];',
    'return [id, { matrix, physicalMatrix, roll, world: frame.pose.parts[id].world }];')
if (-not $intro.Contains('lift: frame.pose.lift') -or -not $intro.Contains('world: frame.pose.parts[id].world')) {
    throw 'Intro template anchors changed'
}
Set-Content -LiteralPath "$run/observe-intro.js" -Value $intro -Encoding utf8

$buildHash = (Get-FileHash -LiteralPath "$run/build-manifest.json").Hash.ToLowerInvariant()
$frames = Get-Content -LiteralPath "$PSScriptRoot/capture-ticks.js" -Raw
$binding = @{sha=$sha; buildSha256=$buildHash; output=(Join-Path $run 'evidence').Replace('\','/')} | ConvertTo-Json -Compress
$frames.Replace('const binding = null;', "const binding = $binding;") |
    Set-Content -LiteralPath "$run/capture-ticks.js" -Encoding utf8

$adapter = (Get-Content -LiteralPath "$templateRoot/make-adapter.mjs" -Raw).
    Replace($old, $sha).Replace("new URL('../', import.meta.url)", "new URL('../../', import.meta.url)")
Set-Content -LiteralPath "$run/make-contact-adapter.mjs" -Value $adapter -Encoding utf8
node "$run/make-contact-adapter.mjs" $run
if ($LASTEXITCODE) { exit $LASTEXITCODE }

# The prior separation check is still applicable after K4. Its planar intro check is
# replaced by the contact-specific independent check, which includes changing depth.
$shape = Get-Content -LiteralPath "$templateRoot/measure-correction.mjs" -Raw
$start = $shape.IndexOf('const introduction = raw(')
$stop = $shape.IndexOf('function closestOnSegment(')
if ($start -lt 0 -or $stop -le $start) { throw 'Separation template anchors changed' }
$shape = $shape.Remove($start, $stop - $start).Replace($old, $sha)
$shape = $shape -replace '(?s)intro: \{ sha256: introduction.sha256,.*?max: introMax \}, separation', 'separation'
if ($shape.Contains('introduction.sha256')) { throw 'Separation output anchor changed' }
Set-Content -LiteralPath "$run/measure-separation.mjs" -Value $shape -Encoding utf8
