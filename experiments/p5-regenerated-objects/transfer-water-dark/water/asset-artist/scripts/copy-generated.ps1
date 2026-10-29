param([ValidateSet('water','dark')][string]$Board='water',[Parameter(Mandatory=$true)][string]$Source,[Parameter(Mandatory=$true)][string]$Name,[Parameter(Mandatory=$true)][string]$Prompt,[string[]]$References=@())
$ErrorActionPreference='Stop'
$taskRuntime='E:/R4D/perspective/p5-runtime/asset-artist/transfer-water-dark/'+$Board
$taskOwn='E:/R4D/perspective/p5-worktrees/asset-artist/experiments/p5-regenerated-objects/transfer-water-dark/'+$Board+'/asset-artist'
$taskSource=Get-Item -LiteralPath $Source;$taskDestination=Join-Path $taskRuntime ('raw/'+$Name+'.png')
if(Test-Path -LiteralPath $taskDestination){throw 'Refuse to overwrite raw generation'}
Copy-Item -LiteralPath $taskSource.FullName -Destination $taskDestination
$taskCopy=Get-Item -LiteralPath $taskDestination;$taskCopy.CreationTimeUtc=$taskSource.CreationTimeUtc;$taskCopy.LastWriteTimeUtc=$taskSource.LastWriteTimeUtc;$taskCopy.Attributes=$taskSource.Attributes
$taskHash=(Get-FileHash -LiteralPath $taskDestination -Algorithm SHA256).Hash.ToLowerInvariant()
if($taskHash -ne (Get-FileHash -LiteralPath $taskSource.FullName -Algorithm SHA256).Hash.ToLowerInvariant() -or $taskCopy.Length -ne $taskSource.Length){throw 'Copy pin mismatch'}
$taskRecord=[ordered]@{utc=[DateTime]::UtcNow.ToString('o');asset=$Name;tool='native-imagegen';toolOutputId=[IO.Path]::GetFileNameWithoutExtension($taskSource.Name);source=$taskSource.FullName;raw=$taskCopy.FullName;sha256=$taskHash;bytes=$taskCopy.Length;originalRetained=$true;prompt=$Prompt;promptSha256=(Get-FileHash -LiteralPath (Join-Path $taskOwn $Prompt) -Algorithm SHA256).Hash.ToLowerInvariant();references=$References;creationTimeUtc=$taskSource.CreationTimeUtc.ToString('o');lastWriteTimeUtc=$taskSource.LastWriteTimeUtc.ToString('o');attributes=$taskSource.Attributes.ToString();corrections=@()}
$taskJson=($taskRecord|ConvertTo-Json -Depth 10)-replace "`r`n","`n";[IO.File]::WriteAllText((Join-Path $taskOwn ('records/'+$Name+'.json')),$taskJson+"`n",[Text.UTF8Encoding]::new($false));$taskJson
