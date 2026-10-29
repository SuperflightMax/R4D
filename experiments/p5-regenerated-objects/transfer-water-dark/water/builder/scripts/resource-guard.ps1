param([string]$Tag = 'build', [double]$OwnPeakRAMGiB = 1, [double]$OwnPeakEGiB = 0.3)
$ErrorActionPreference = 'Stop'
$taskRuntime = 'E:\R4D\perspective\p5-runtime\builder\transfer-water-dark\water'
$taskEvidence = Join-Path $taskRuntime 'evidence'
New-Item -ItemType Directory -Path $taskEvidence -Force | Out-Null
$taskOs = Get-CimInstance Win32_OperatingSystem
$taskCpu = Get-CimInstance Win32_PerfFormattedData_PerfOS_Processor -Filter "Name='_Total'"
$taskProcessCpu = Get-CimInstance Win32_PerfFormattedData_PerfProc_Process -Filter "Name='_Total' OR Name='Idle'"
$taskAggregateCPU = ($taskProcessCpu | Where-Object Name -EQ '_Total').PercentProcessorTime - ($taskProcessCpu | Where-Object Name -EQ 'Idle').PercentProcessorTime
$taskProcesses = Get-Process
$taskDrives = @(Get-PSDrive -Name C,D,E | ForEach-Object { [pscustomobject]@{ Name = $_.Name; FreeGiB = [math]::Round($_.Free / 1GB, 3) } })
$taskFreeRAM = $taskOs.FreePhysicalMemory / 1MB
$taskFreeE = (Get-PSDrive -Name E).Free / 1GB
$taskRecord = [pscustomobject]@{
  Utc = [DateTime]::UtcNow.ToString('o'); Tag = $Tag
  RAMTotalGiB = [math]::Round($taskOs.TotalVisibleMemorySize / 1MB, 3)
  RAMFreeGiB = [math]::Round($taskFreeRAM, 3)
  CPUPercentSystem = $taskCpu.PercentProcessorTime
  CPUPercentAggregateNormalized = [math]::Round($taskAggregateCPU / [Environment]::ProcessorCount, 2)
  AggregateWorkingSetGiB = [math]::Round(($taskProcesses | Measure-Object WorkingSet64 -Sum).Sum / 1GB, 3)
  ProcessCount = $taskProcesses.Count; Drives = $taskDrives
  OwnPeakRAMGiB = $OwnPeakRAMGiB; OwnPeakEGiB = $OwnPeakEGiB
  ConcurrentAllowanceRAMGiB = 4; ConcurrentAllowanceEGiB = 2
  HeavyWorkAllowed = ($taskFreeRAM -ge ($OwnPeakRAMGiB + 4) -and $taskFreeE -gt 2 -and $taskFreeE -ge ($OwnPeakEGiB + 2))
}
$taskJson = $taskRecord | ConvertTo-Json -Depth 5
$taskFile = Join-Path $taskEvidence ('guard-' + [DateTime]::UtcNow.ToString('yyyyMMdd-HHmmss-fff') + '-' + $Tag + '.json')
[IO.File]::WriteAllText($taskFile, $taskJson + "`n", [Text.UTF8Encoding]::new($false))
$taskJson
if ($taskFreeE -le 4) { Write-Warning 'E <=4 GiB: checkpoint and diagnose own data; no foreign cleanup.' }
if ($taskFreeE -le 2) { throw 'E <=2 GiB: safe checkpoint STOP; no heavy work.' }
if (-not $taskRecord.HeavyWorkAllowed) { throw 'Insufficient free resources for declared own peak plus concurrent allowance.' }
