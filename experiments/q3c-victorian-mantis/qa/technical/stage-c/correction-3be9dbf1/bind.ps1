param([Parameter(Mandatory)][string] $RunRoot)

$ErrorActionPreference = 'Stop'
$stage = Split-Path -Parent $PSScriptRoot
$run = (Resolve-Path -LiteralPath $RunRoot).Path
$sha = '3be9dbf11e7a07a2678c3be161e54fd24aa7f893'
if (-not $run.StartsWith((Join-Path $stage ".local\$sha-"), [StringComparison]::OrdinalIgnoreCase)) {
    throw 'Select the correction run directory.'
}
$pin = Get-Content -LiteralPath "$run/pin.json" -Raw | ConvertFrom-Json
if ($pin.candidateSha -ne $sha) { throw 'Wrong candidate' }
$buildHash = (Get-FileHash -LiteralPath "$run/build-manifest.json").Hash.ToLowerInvariant()
$template = Get-Content -LiteralPath "$stage/collect-c2.js" -Raw
if ([regex]::Matches($template, 'const binding = null;').Count -ne 1) { throw 'Invalid collector template' }
$template = $template.Replace('await page.setViewportSize(viewport);',
    'await page.emulateMedia({ reducedMotion: binding.reducedMotion });' + [Environment]::NewLine +
    '  await page.setViewportSize(viewport);')
$template = $template.Replace('touchPoints: navigator.maxTouchPoints,', 'reduced: matchMedia("(prefers-reduced-motion: reduce)").matches, touchPoints: navigator.maxTouchPoints,')
$cases = @(
    @{ tag='desktop'; kind='live'; mode='pointer'; width=1440; height=1000; idleMs=12500 },
    @{ tag='keyboard'; kind='live'; mode='keyboard'; width=1440; height=1000; idleMs=1000 },
    @{ tag='touch390'; kind='live'; mode='touch'; width=390; height=844; idleMs=1200 },
    @{ tag='touch360'; kind='live'; mode='touch'; width=360; height=732; idleMs=1200 },
    @{ tag='reduced-desktop'; kind='live'; mode='keyboard'; width=1440; height=1000; idleMs=700 },
    @{ tag='reduced390'; kind='live'; mode='touch'; width=390; height=844; idleMs=700 },
    @{ tag='reduced360'; kind='live'; mode='touch'; width=360; height=732; idleMs=700 },
    @{ tag='seed42-a'; kind='trace'; mode='pointer'; width=1440; height=1000; idleMs=0 },
    @{ tag='seed42-b'; kind='trace'; mode='pointer'; width=1440; height=1000; idleMs=0 }
)
foreach ($case in $cases) {
    $binding = [ordered]@{
        sha=$sha; buildSha256=$buildHash; url='http://127.0.0.1:4207/'
        output=(Join-Path $run 'evidence')
        tag=$case.tag; kind=$case.kind; mode=$case.mode
        viewport=@{ width=$case.width; height=$case.height }
        reducedMotion=$(if ($case.tag.StartsWith('reduced')) { 'reduce' } else { 'no-preference' })
        seed=42; hz=120; introLimitTicks=800; transformTicks=610; idleTicks=1501
        capsulePhase='capsule'; mantisPhase='mantis'; actionName='Раскрыться'; firstKey='e'
        liveIdleMs=$case.idleMs
    } | ConvertTo-Json -Compress -Depth 5
    $template.Replace('const binding = null;', "const binding = $binding;") |
        Set-Content -LiteralPath "$run/collect-$($case.tag).js" -Encoding utf8
}
$prior = Get-Content -LiteralPath "$stage/input-be62.js" -Raw
$prior.Replace('be62b16b0253208493e5d546e0f9d158342a9250', $sha).
    Replace('d51cc6dd6d6f00b5203c3ce428fab4907af463054c8b9537b06c17054f43619e', $buildHash).
    Replace('127.0.0.1:4205', '127.0.0.1:4207') | Set-Content -LiteralPath "$run/input-correction.js" -Encoding utf8
$intro = Get-Content -LiteralPath "$PSScriptRoot/observe-intro.js" -Raw
$binding = @{sha=$sha; buildSha256=$buildHash; output=(Join-Path $run 'evidence')} | ConvertTo-Json -Compress
$intro.Replace('const binding = null;', "const binding = $binding;") |
    Set-Content -LiteralPath "$run/observe-intro.js" -Encoding utf8
