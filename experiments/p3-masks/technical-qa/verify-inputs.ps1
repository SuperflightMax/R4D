param(
    [Parameter(Mandatory = $true)][string]$NativeRepo,
    [Parameter(Mandatory = $true)][string]$PixiRoot,
    [string]$SourceImage = 'K:\Agents\R4D\Assets\perspective\01-jungle.jpg'
)

# Read-only preparation. Does not run or approve a P3 candidate.
$ErrorActionPreference = 'Stop'
$repo = (Resolve-Path (Join-Path $PSScriptRoot '..\..\..')).Path
$p1 = '4b47db04c7140ebf88f69b91faa0b790d46f22ec'
$prefix = 'experiments/p1-collider-mapping/clean-repeat-01/'
$core = '5a6fa03f1cdb3de88a2d9c7dbe795eb8e2a7f023'

function Read-Git([string]$Root, [string]$Arguments) {
    $info = New-Object System.Diagnostics.ProcessStartInfo
    $info.FileName = 'git'
    $info.Arguments = '--no-optional-locks -C "' + $Root + '" ' + $Arguments
    $info.UseShellExecute = $false
    $info.CreateNoWindow = $true
    $info.RedirectStandardOutput = $true
    $info.RedirectStandardError = $true
    $info.StandardOutputEncoding = New-Object System.Text.UTF8Encoding($false, $true)
    $process = [System.Diagnostics.Process]::Start($info)
    try {
        $output = $process.StandardOutput.ReadToEnd()
        $errors = $process.StandardError.ReadToEnd()
        $process.WaitForExit()
        if ($process.ExitCode -ne 0) { throw "Git read failed: $errors" }
        return $output
    } finally { $process.Dispose() }
}

function Get-TextDigest([string]$Text) {
    $sha = [System.Security.Cryptography.SHA256]::Create()
    try {
        $utf8 = New-Object System.Text.UTF8Encoding($false, $true)
        $bytes = $utf8.GetBytes($Text.Replace("`r`n", "`n"))
        return ([BitConverter]::ToString($sha.ComputeHash($bytes))).Replace('-', '').ToLowerInvariant()
    } finally { $sha.Dispose() }
}

function Require([bool]$Condition, [string]$Description) {
    if (-not $Condition) { throw $Description }
}

function Project($Matrix, [double]$X, [double]$Y) {
    $w = $Matrix[2][0] * $X + $Matrix[2][1] * $Y + $Matrix[2][2]
    Require ([math]::Abs($w) -gt 1e-12) 'Projection reached its horizon'
    return @(
        (($Matrix[0][0] * $X + $Matrix[0][1] * $Y + $Matrix[0][2]) / $w),
        (($Matrix[1][0] * $X + $Matrix[1][1] * $Y + $Matrix[1][2]) / $w)
    )
}

$pins = [ordered]@{
    config = @('simulation/boards/01/trial-01/config.json', 'dd5c519cd6d4b7295118e0a3a1063efed424a0ce739450bd5153c6a9941982db')
    manifest = @('simulation/boards/01/trial-01/manifest.json', '7784dc0a215d0e472cf06a4eee03793592727cf0fa9a1fa0e0c78e5f1d17da18')
    projection = @('research/board01-projection.candidate-01.json', '9ca9e520f1927426a3a5ba73a5eacaf90fedffc9385e7d08d5b1e6ee644b020c')
}
$texts = @{}
$digests = [ordered]@{}
foreach ($name in $pins.Keys) {
    $text = Read-Git $repo ('show "' + $p1 + ':' + $prefix + $pins[$name][0] + '"')
    $digest = Get-TextDigest $text
    Require ($digest -eq $pins[$name][1]) "$name differs from the pinned canonical LF SHA256"
    $texts[$name] = $text
    $digests[$name] = $digest
}
$config = $texts.config | ConvertFrom-Json
$manifest = $texts.manifest | ConvertFrom-Json
$projection = $texts.projection | ConvertFrom-Json
Require ($config.board.pins.Count -eq 25 -and $config.board.segments.Count -eq 16 -and $config.board.buckets.Count -eq 4 -and $config.board.drops.Count -eq 1) 'Unexpected config counts'
Require ($config.board.ball.r -eq 16 -and $config.defaults.tickMs -eq 5 -and $config.defaults.quantizeDigits -eq 7) 'Unexpected radius/tick/quantization'
Require ($config.physics.gravityY -eq 980 -and $config.physics.maxBallSpeed -eq 2000 -and $config.physics.angleDeviationDeg -eq 2 -and $config.physics.bounceDeviation -eq 0.02 -and $config.rng.algo -eq 'lcg32') 'Unexpected physics or PRNG'
Require ($manifest.coreCommit -eq $core -and $manifest.config.canonicalLfUtf8Sha256 -eq $digests.config -and $manifest.research.canonicalLfUtf8Sha256 -eq $digests.projection) 'Manifest provenance mismatch'

$imageDigest = (Get-FileHash -LiteralPath $SourceImage -Algorithm SHA256).Hash.ToLowerInvariant()
Require ($imageDigest -eq 'c8f9e4245c1de8c2086e615bc75dc10aea59b76b614d6e106593e07262e24f72') 'Jungle source hash mismatch'
Require ($manifest.source.sha256 -eq $imageDigest) 'Manifest source mismatch'
Add-Type -AssemblyName System.Drawing
$image = [System.Drawing.Image]::FromFile($SourceImage)
try {
    Require ($image.Width -eq 1536 -and $image.Height -eq 1536) 'Jungle dimensions mismatch'
} finally { $image.Dispose() }

$head = (Read-Git $NativeRepo 'rev-parse HEAD').Trim()
$tree = (Read-Git $NativeRepo ('rev-parse "' + $core + ':packages/sim-core"')).Trim()
$nativeStatus = Read-Git $NativeRepo 'status --porcelain=v1 -- packages/sim-core'
Require ($head -eq $core) 'Native HEAD mismatch'
Require ($tree -eq '008d16a80a26bb77d562a45218b01da09b0d9ff0') 'Native package tree mismatch'
Require ([string]::IsNullOrWhiteSpace($nativeStatus)) 'Native package working tree is dirty'

$maxError = 0.0
foreach ($corner in $manifest.projection.sourceImageQuadPx) {
    $native = Project $manifest.projection.sourceToNative $corner[0] $corner[1]
    $source = Project $manifest.projection.nativeToSource $native[0] $native[1]
    $maxError = [math]::Max($maxError, [math]::Max([math]::Abs($source[0] - $corner[0]), [math]::Abs($source[1] - $corner[1])))
}
foreach ($pin in $config.board.pins) {
    $source = Project $manifest.projection.nativeToSource $pin.x $pin.y
    $native = Project $manifest.projection.sourceToNative $source[0] $source[1]
    $maxError = [math]::Max($maxError, [math]::Max([math]::Abs($native[0] - $pin.x), [math]::Abs($native[1] - $pin.y)))
}
Require ($maxError -lt 1e-7) 'Projection roundtrip mismatch (mixed source/native coordinate units)'

$pixi = Get-Content -Raw -LiteralPath (Join-Path $PixiRoot 'package.json') | ConvertFrom-Json
Require ($pixi.name -eq 'pixi.js' -and $pixi.version -eq '8.22.0' -and $pixi.license -eq 'MIT') 'Pixi package metadata mismatch'
$license = Join-Path $PixiRoot 'LICENSE'
Require (Test-Path -LiteralPath $license -PathType Leaf) 'Pixi license missing'
$math = Read-Git $repo ('show "' + $p1 + ':' + $prefix + 'viewer/src/view-math.mjs"')
$recipeCommit = 'ee4d8e5c7dbb3b6618d58d6dacb0caf9b73dfb1b'
$recipe = Read-Git $repo ('show "' + $recipeCommit + ':experiments/p0-perspective/research/CROSS_SERIES_CONCLUSION_AND_RECIPE.md"')
[ordered]@{
    scope = 'COMMON_INPUT_PREPARATION_ONLY; P3 product QA not executed'
    utc = [DateTime]::UtcNow.ToString('yyyy-MM-ddTHH:mm:ssZ')
    p1Commit = $p1
    canonicalLfSha256 = $digests
    viewMathCanonicalLfSha256 = Get-TextDigest $math
    p0Commit = $recipeCommit
    p0RecipeCanonicalLfSha256 = Get-TextDigest $recipe
    sourceSha256 = $imageDigest
    sourceDimensions = @(1536, 1536)
    nativeCommit = $head
    nativePackageTree = $tree
    nativePackageStatus = 'clean'
    counts = @(25, 16, 4, 1)
    maxRoundtripAbsoluteErrorMixedUnits = $maxError
    pixiVersion = $pixi.version
    pixiLicense = $pixi.license
    pixiLicenseSha256 = (Get-FileHash -LiteralPath $license -Algorithm SHA256).Hash.ToLowerInvariant()
} | ConvertTo-Json -Depth 5
