param([ValidateSet('water','dark')][string]$Board='water',[Parameter(Mandatory=$true)][string]$Purpose,[Parameter(Mandatory=$true)][string]$Record)
$ErrorActionPreference='Stop'
$taskRuntime='E:/R4D/perspective/p5-runtime/asset-artist/transfer-water-dark/'+$Board
$env:TEMP=Join-Path $taskRuntime 'temp';$env:TMP=$env:TEMP
$taskOs=Get-CimInstance Win32_OperatingSystem;$taskProcesses=@(Get-Process);$taskCpu=@(Get-CimInstance Win32_Processor)
$taskGuard=[ordered]@{utc=[DateTime]::UtcNow.ToString('o');board=$Board;purpose=$Purpose;ramFreeGiB=[math]::Round($taskOs.FreePhysicalMemory/1MB,3);ramTotalGiB=[math]::Round($taskOs.TotalVisibleMemorySize/1MB,3);cpuLoadPercent=($taskCpu|Measure-Object LoadPercentage -Average).Average;aggregateWorkingSetGiB=[math]::Round(($taskProcesses|Measure-Object WorkingSet64 -Sum).Sum/1GB,3);processCount=$taskProcesses.Count;driveFreeGiB=@{};ownPeakEstimate=@{ramGiB=1;CInitialGiB=0.128;ERawSelectedGiB=0.25};concurrentAllowance=@{ramGiB=4;EGiB=2}}
foreach($taskDrive in 'C','D','E'){$taskGuard.driveFreeGiB[$taskDrive]=[math]::Round((Get-PSDrive -Name $taskDrive).Free/1GB,3)}
$taskJson=($taskGuard|ConvertTo-Json -Depth 8)-replace "`r`n","`n";[IO.File]::WriteAllText((Join-Path $taskRuntime ('guards/'+$Record+'.json')),$taskJson+"`n",[Text.UTF8Encoding]::new($false));$taskJson
if($taskGuard.driveFreeGiB.E -le 2){throw 'STOP E <=2 GiB; preserve WIP'}
if($taskGuard.driveFreeGiB.E -le 4){throw 'WARN E <=4 GiB; diagnose before heavy action'}
if($taskGuard.ramFreeGiB -lt 5 -or $taskGuard.driveFreeGiB.E -lt 2.25 -or $taskGuard.driveFreeGiB.C -lt 0.128){throw 'Insufficient declared own plus concurrent headroom'}
