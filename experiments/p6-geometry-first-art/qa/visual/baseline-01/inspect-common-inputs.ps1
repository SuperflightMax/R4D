param(
  [string]$Repo = 'E:\R4D\perspective\p6-worktrees\visual-qa',
  [string]$Runtime = 'E:\R4D\perspective\p6-runtime\visual-qa',
  [string]$Source = 'K:\Agents\R4D\Assets\perspective\01-jungle.jpg'
)
$ErrorActionPreference = 'Stop'
$ExpectedSourceHash = 'c8f9e4245c1de8c2086e615bc75dc10aea59b76b614d6e106593e07262e24f72'
$P1 = '4b47db04c7140ebf88f69b91faa0b790d46f22ec'
$P0 = 'ee4d8e5c7dbb3b6618d58d6dacb0caf9b73dfb1b'
$OutDir = $PSScriptRoot
$InputDir = Join-Path $Runtime 'baseline-01\common-inputs'
New-Item -ItemType Directory -Path $InputDir -Force | Out-Null
$SourceHash = (Get-FileHash -LiteralPath $Source -Algorithm SHA256).Hash.ToLowerInvariant()
if ($SourceHash -ne $ExpectedSourceHash) { throw 'Jungle source hash mismatch' }
function Read-GitObject([string]$Spec) {
  $info = [Diagnostics.ProcessStartInfo]::new('git')
  $info.WorkingDirectory = $Repo
  $info.UseShellExecute = $false
  $info.RedirectStandardOutput = $true
  $info.RedirectStandardError = $true
  foreach ($arg in @('-C', $Repo, 'show', $Spec)) { $info.ArgumentList.Add($arg) }
  $process = [Diagnostics.Process]::new()
  $process.StartInfo = $info
  [void]$process.Start()
  $errorTask = $process.StandardError.ReadToEndAsync()
  $buffer = [IO.MemoryStream]::new()
  $process.StandardOutput.BaseStream.CopyTo($buffer)
  $process.WaitForExit()
  $errorText = $errorTask.GetAwaiter().GetResult()
  if ($process.ExitCode -ne 0) { throw "git show failed: $Spec : $errorText" }
  $data = $buffer.ToArray()
  $process.Dispose()
  $buffer.Dispose()
  return ,$data
}
$Specs = @(
  @{Name='config.json'; Spec="${P1}:experiments/p1-collider-mapping/clean-repeat-01/simulation/boards/01/trial-01/config.json"; Bytes=9503; Sha256='dd5c519cd6d4b7295118e0a3a1063efed424a0ce739450bd5153c6a9941982db'},
  @{Name='manifest.json'; Spec="${P1}:experiments/p1-collider-mapping/clean-repeat-01/simulation/boards/01/trial-01/manifest.json"; Bytes=11565; Sha256='7784dc0a215d0e472cf06a4eee03793592727cf0fa9a1fa0e0c78e5f1d17da18'},
  @{Name='projection.mjs'; Spec="${P1}:experiments/p1-collider-mapping/clean-repeat-01/simulation/projection.mjs"},
  @{Name='view-math.mjs'; Spec="${P1}:experiments/p1-collider-mapping/clean-repeat-01/viewer/src/view-math.mjs"},
  @{Name='P0-RECIPE.md'; Spec="${P0}:experiments/p0-perspective/research/CROSS_SERIES_CONCLUSION_AND_RECIPE.md"}
)
$InputRecords = foreach ($entry in $Specs) {
  $bytes = Read-GitObject $entry.Spec
  $hash = [Convert]::ToHexString([Security.Cryptography.SHA256]::HashData($bytes)).ToLowerInvariant()
  if ($entry.ContainsKey('Bytes') -and $bytes.Length -ne $entry.Bytes) { throw "Length mismatch: $($entry.Name)" }
  if ($entry.ContainsKey('Sha256') -and $hash -ne $entry.Sha256) { throw "Hash mismatch: $($entry.Name)" }
  [IO.File]::WriteAllBytes((Join-Path $InputDir $entry.Name), $bytes)
  [ordered]@{name=$entry.Name; gitObject=$entry.Spec; bytes=$bytes.Length; sha256=$hash}
}
$config = Get-Content -LiteralPath (Join-Path $InputDir 'config.json') -Raw | ConvertFrom-Json
$manifest = Get-Content -LiteralPath (Join-Path $InputDir 'manifest.json') -Raw | ConvertFrom-Json
$H = $manifest.projection.nativeToSource
function Project([double]$x, [double]$y) {
  $w = $H[2][0]*$x + $H[2][1]*$y + $H[2][2]
  if ([math]::Abs($w) -lt 1e-12) { throw 'Projection at horizon' }
  $px = ($H[0][0]*$x + $H[0][1]*$y + $H[0][2])/$w
  $py = ($H[1][0]*$x + $H[1][1]*$y + $H[1][2])/$w
  return ,@($px,$py)
}
function Round3([double]$v) { [math]::Round($v,3) }
function CircleRecord($item, [string]$kind) {
  $center = Project $item.x $item.y
  $points = for ($i=0; $i -lt 360; $i++) {
    $theta = $i * [math]::PI / 180
    $p = Project ($item.x+$item.r*[math]::Cos($theta)) ($item.y+$item.r*[math]::Sin($theta))
    [pscustomobject]@{x=$p[0]; y=$p[1]}
  }
  $extX = $points | Measure-Object -Property x -Minimum -Maximum
  $extY = $points | Measure-Object -Property y -Minimum -Maximum
  $ballLeft = Project ($item.x-$config.board.ball.r) $item.y
  $ballRight = Project ($item.x+$config.board.ball.r) $item.y
  $ballFar = Project $item.x ($item.y-$config.board.ball.r)
  $ballNear = Project $item.x ($item.y+$config.board.ball.r)
  [pscustomobject][ordered]@{
    id=$item.id; kind=$kind; nativeX=$item.x; nativeY=$item.y; nativeR=$item.r
    sourceCenterX=(Round3 $center[0]); sourceCenterY=(Round3 $center[1])
    sourceMinX=(Round3 $extX.Minimum); sourceMaxX=(Round3 $extX.Maximum)
    sourceMinY=(Round3 $extY.Minimum); sourceMaxY=(Round3 $extY.Maximum)
    ballR16WidthAtDepth=(Round3 ($ballRight[0]-$ballLeft[0]))
    ballR16FloorDepthAtDepth=(Round3 ($ballNear[1]-$ballFar[1]))
  }
}
$Objects = @($config.board.pins | ForEach-Object { CircleRecord $_ 'pin' }) + @($config.board.buckets | ForEach-Object { CircleRecord $_ 'bucket' })
$Segments = @($config.board.segments | ForEach-Object {
  $a = Project $_.x1 $_.y1; $b = Project $_.x2 $_.y2
  [ordered]@{id=$_.id; fromPx=@((Round3 $a[0]),(Round3 $a[1])); toPx=@((Round3 $b[0]),(Round3 $b[1]))}
})
$Drop = $config.board.drops[0]
$DropPx = Project $Drop.x $Drop.y
$payload = [ordered]@{
  schema='r4d.p6.visual-qa.baseline-01.geometry.v1'
  scope='Static provenance and projected lookup only; not candidate validation, motion QA or artistic PASS'
  source=[ordered]@{path=$Source;bytes=(Get-Item -LiteralPath $Source).Length;sha256=$SourceHash;width=1536;height=1536}
  inputs=$InputRecords
  method='nativeToSource homography from accepted P1 manifest; 360 angular samples per original physical circle; pixel values rounded to 0.001 for lookup, not art tolerance; ball dimensions are floor-footprint extents, not final standing-sprite dimensions'
  counts=[ordered]@{pins=$config.board.pins.Count;segments=$config.board.segments.Count;buckets=$config.board.buckets.Count;drops=$config.board.drops.Count}
  dynamics=[ordered]@{radius=$config.board.ball.r;tickMs=$config.defaults.tickMs;quantizeDigits=$config.defaults.quantizeDigits;gravityY=$config.physics.gravityY;maxBallSpeed=$config.physics.maxBallSpeed;angleDeviationDeg=$config.physics.angleDeviationDeg;bounceDeviation=$config.physics.bounceDeviation;rng=$config.rng.algo;seedInInput=$config.rng.seed;seedRunsExecuted=0}
  sourceManifestStatus=$manifest.status
  acceptanceNote='Manifest retains historical trial/provisional wording; accepted-input authority is later CTO/Max pin at P1 exact 4b47db04c7140ebf88f69b91faa0b790d46f22ec. This baseline does not reopen P1 acceptance.'
  drop=[ordered]@{id=$Drop.id;nativeX=$Drop.x;nativeY=$Drop.y;sourcePx=@((Round3 $DropPx[0]),(Round3 $DropPx[1]));angleDeg=$Drop.angleDeg;speed=$Drop.speed}
  objects=$Objects;segments=$Segments
}
[IO.File]::WriteAllText((Join-Path $OutDir 'geometry-lookup.json'), ($payload | ConvertTo-Json -Depth 20)+"`n", [Text.UTF8Encoding]::new($false))
$Objects | Export-Csv -LiteralPath (Join-Path $OutDir 'geometry-lookup.csv') -NoTypeInformation -Encoding utf8
Write-Output 'Verified public common inputs'
$InputRecords | ConvertTo-Json -Depth 4 -Compress
Write-Output 'Projected lookup'
$Objects | Format-Table id,kind,sourceCenterX,sourceCenterY,ballR16WidthAtDepth,ballR16FloorDepthAtDepth -AutoSize
Write-Output 'Drop and boundaries'
$payload.drop | ConvertTo-Json -Compress
$Segments | ConvertTo-Json -Depth 4 -Compress
