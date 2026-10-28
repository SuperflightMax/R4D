param([Parameter(Mandatory=$true)][string]$Source,[Parameter(Mandatory=$true)][string]$Name)
$ErrorActionPreference='Stop'
$taskRoot='E:/R4D/perspective/p5-runtime/asset-artist'
$taskSource=Get-Item -LiteralPath $Source
$taskDestination=Join-Path $taskRoot ('raw/' + $Name + '.png')
if(Test-Path -LiteralPath $taskDestination) {throw 'Refusing overwrite of raw image'}
Copy-Item -LiteralPath $taskSource.FullName -Destination $taskDestination
$taskCopy=Get-Item -LiteralPath $taskDestination
$taskCopy.CreationTimeUtc=$taskSource.CreationTimeUtc
$taskCopy.LastWriteTimeUtc=$taskSource.LastWriteTimeUtc
$taskCopy.Attributes=$taskSource.Attributes
$taskSourceHash=(Get-FileHash -LiteralPath $taskSource.FullName -Algorithm SHA256).Hash.ToLowerInvariant()
$taskCopyHash=(Get-FileHash -LiteralPath $taskDestination -Algorithm SHA256).Hash.ToLowerInvariant()
if($taskSourceHash -ne $taskCopyHash -or $taskSource.Length -ne $taskCopy.Length) {throw 'Source/destination verification failed'}
$taskRecord=[ordered]@{utc=[DateTime]::UtcNow.ToString('o');operation='verified-copy';source=$taskSource.FullName;destination=$taskCopy.FullName;sha256=$taskCopyHash;bytes=$taskCopy.Length;originalRetained=$true;reason='Active reference; native C output preserved';creationTimeUtc=$taskSource.CreationTimeUtc.ToString('o');lastWriteTimeUtc=$taskSource.LastWriteTimeUtc.ToString('o');attributes=$taskSource.Attributes.ToString()}
$taskRecord | ConvertTo-Json -Compress | Add-Content -LiteralPath (Join-Path $taskRoot 'manifests/copy-records.jsonl') -Encoding utf8NoBOM
$taskRecord | ConvertTo-Json
