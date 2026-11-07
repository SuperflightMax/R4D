param(
    [Parameter(Mandatory)]
    [ValidatePattern('^[0-9a-f]{40}$')]
    [string] $CandidateSha,

    [ValidatePattern('^[a-z0-9-]+$')]
    [string] $Run = 'r01'
)

$ErrorActionPreference = 'Stop'
$repo = 'D:\dev\R4D'
$product = 'experiments/q3c-victorian-mantis'
$stageStart = '21fbafcfb435838bc84aed931fe68e57cae9fdbc'
$expectedZone = Join-Path $repo 'experiments\q3c-victorian-mantis\qa\technical\stage-c'
if ([Environment]::MachineName -ne 'WIN-36E9FF9EJM0' -or $PSScriptRoot -ne $expectedZone) {
    throw 'Expected local WIN-36E9FF9EJM0 and the assigned Stage C QA directory.'
}
if ($CandidateSha -eq $stageStart) { throw 'Provide the exact Builder candidate from CTO.' }
if ($PSVersionTable.PSVersion -lt [version]'7.4') { throw 'PowerShell 7.4+ is required for byte-preserving native redirection.' }

git -C $repo merge-base --is-ancestor $stageStart $CandidateSha
if ($LASTEXITCODE -ne 0) { throw 'Candidate must descend from the Stage C start.' }
git -C $repo merge-base --is-ancestor $CandidateSha refs/remotes/origin/main
if ($LASTEXITCODE -ne 0) { throw 'Fetch and confirm the candidate is on origin/main.' }

$buildInputs = @(
    'index.html', 'package.json', 'package-lock.json', 'vite.config.js',
    'src', 'public', 'tests', 'assets',
    'design/asset-handoff/PRODUCTION_RIG_V1.md'
) | ForEach-Object { "$product/$_" }

$tree = @(git -C $repo -c core.quotePath=false ls-tree -r $CandidateSha -- $buildInputs)
if ($LASTEXITCODE -ne 0 -or $tree.Count -eq 0) { throw 'Candidate inputs are unavailable.' }
$inputs = foreach ($entry in $tree) {
    if ($entry -notmatch '^100(?:644|755) blob ([0-9a-f]{40})\t(.+)$') {
        throw "Expected an ordinary tracked input: $entry"
    }
    [pscustomobject]@{ path = $Matches[2]; blob = $Matches[1] }
}
foreach ($required in @('index.html', 'package.json', 'package-lock.json', 'assets/rig/FULL_RIG_V1.json', 'design/asset-handoff/PRODUCTION_RIG_V1.md')) {
    if ("$product/$required" -notin $inputs.path) { throw "Candidate is missing $required" }
}

$runRoot = Join-Path $PSScriptRoot ".local\$CandidateSha-$Run"
if (Test-Path -LiteralPath $runRoot) { throw 'Choose a fresh run name.' }
New-Item -ItemType Directory -Path $runRoot | Out-Null
foreach ($dir in @('tree', 'temp', 'logs', 'evidence', 'profiles')) {
    New-Item -ItemType Directory -Path (Join-Path $runRoot $dir) | Out-Null
}
$treeRoot = Join-Path $runRoot 'tree'

$files = foreach ($inputFile in $inputs) {
    $path = Join-Path $treeRoot $inputFile.path
    New-Item -ItemType Directory -Path (Split-Path -Parent $path) -Force | Out-Null
    git -C $repo cat-file blob $inputFile.blob > $path
    if ($LASTEXITCODE -ne 0) { throw "Could not read Git blob: $path" }
    $blob = (git -C $repo hash-object --no-filters -- $path).Trim()
    if ($LASTEXITCODE -ne 0 -or $blob -ne $inputFile.blob) { throw "Git blob byte mismatch: $path" }
    [pscustomobject]@{
        path = $inputFile.path
        blob = $blob
        sha256 = (Get-FileHash -LiteralPath $path -Algorithm SHA256).Hash.ToLowerInvariant()
    }
}
$manifest = [pscustomobject]@{
    candidateSha = $CandidateSha
    stageStart = $stageStart
    runRoot = $runRoot
    treeRoot = $treeRoot
    productRoot = Join-Path $treeRoot $product
    files = @($files)
}
$manifest | ConvertTo-Json -Depth 5 | Set-Content -LiteralPath (Join-Path $runRoot 'pin.json') -Encoding utf8
$manifest | Select-Object candidateSha, runRoot, productRoot
