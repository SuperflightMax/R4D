param([Parameter(Mandatory)][string] $RunRoot)

$ErrorActionPreference = 'Stop'
$sha = 'be62b16b0253208493e5d546e0f9d158342a9250'
$run = (Resolve-Path -LiteralPath $RunRoot).Path
if (-not $run.StartsWith((Join-Path $PSScriptRoot '.local') + '\', [StringComparison]::OrdinalIgnoreCase)) {
    throw 'Use the assigned QA run directory.'
}
$pin = Get-Content -LiteralPath (Join-Path $run 'pin.json') -Raw | ConvertFrom-Json
if ($pin.candidateSha -ne $sha) { throw 'Wrong correction candidate' }
$buildHash = (Get-FileHash -LiteralPath (Join-Path $run 'build-manifest.json')).Hash.ToLowerInvariant()
$template = Get-Content -LiteralPath (Join-Path $PSScriptRoot 'collect-c2.js') -Raw
if ([regex]::Matches($template, 'const binding = null;').Count -ne 1) { throw 'Collector binding marker is missing' }
$cases = @(
    @{ tag='live-desktop'; kind='live'; mode='pointer'; width=1440; height=1000; idleMs=12000 },
    @{ tag='live-keyboard'; kind='live'; mode='keyboard'; width=1440; height=1000; idleMs=1000 },
    @{ tag='live-touch390'; kind='live'; mode='touch'; width=390; height=844; idleMs=1800 },
    @{ tag='live-touch360'; kind='live'; mode='touch'; width=360; height=732; idleMs=1800 },
    @{ tag='seed42-a'; kind='trace'; mode='pointer'; width=1440; height=1000; idleMs=0 },
    @{ tag='seed42-b'; kind='trace'; mode='pointer'; width=1440; height=1000; idleMs=0 }
)
foreach ($case in $cases) {
    $binding = [ordered]@{
        sha=$sha; buildSha256=$buildHash; url='http://127.0.0.1:4205/'
        output=(Join-Path $run 'evidence')
        tag=$case.tag; kind=$case.kind; mode=$case.mode
        viewport=@{ width=$case.width; height=$case.height }
        seed=42; hz=120; introLimitTicks=800; transformTicks=610; idleTicks=1441
        capsulePhase='capsule'; mantisPhase='mantis'; actionName='Раскрыться'; firstKey='e'
        liveIdleMs=$case.idleMs
    } | ConvertTo-Json -Compress -Depth 6
    $path = Join-Path $run ('collect-' + $case.tag + '.js')
    $template.Replace('const binding = null;', "const binding = $binding;") | Set-Content -LiteralPath $path -Encoding utf8
    $path
}
