param([Parameter(Mandatory=$true)][string]$OutputId,[Parameter(Mandatory=$true)][string]$Name,[Parameter(Mandatory=$true)][string]$Prompt,[bool]$Transparent=$false,[string[]]$Inputs=@())
$ErrorActionPreference='Stop'
$root=Split-Path -Parent $PSScriptRoot;$components=Join-Path $root 'components-v01'
$source='C:\Users\user\.codex\generated_images\01a1879b-dcdf-77a3-845d-e75730c9e68f\'+$OutputId+'.png'
$destination=Join-Path $components ('raw\'+$Name+'.png')
if(-not(Test-Path -LiteralPath $destination)){Copy-Item -LiteralPath $source -Destination $destination}
$s=Get-Item -LiteralPath $source;$d=Get-Item -LiteralPath $destination
$sha=(Get-FileHash -LiteralPath $source -Algorithm SHA256).Hash.ToLowerInvariant()
if($sha -ne (Get-FileHash -LiteralPath $destination -Algorithm SHA256).Hash.ToLowerInvariant() -or $s.Length -ne $d.Length){throw 'Native original/copy mismatch'}
$d.CreationTimeUtc=$s.CreationTimeUtc;$d.LastWriteTimeUtc=$s.LastWriteTimeUtc;$d.LastAccessTimeUtc=$s.LastAccessTimeUtc;$d.Attributes=$s.Attributes
Add-Type -AssemblyName System.Drawing;$im=[System.Drawing.Bitmap]::new($destination);$canvas=@($im.Width,$im.Height);$im.Dispose()
$record=[ordered]@{tool='native image_gen';toolOutputId=$OutputId;promptFile=('components-v01/prompts/'+$Prompt);promptWorkingBytesSha256=(Get-FileHash -LiteralPath (Join-Path $components ('prompts\'+$Prompt)) -Algorithm SHA256).Hash.ToLowerInvariant();transparent_background=$Transparent;referencedInputs=@($Inputs|ForEach-Object{[ordered]@{path=$_;sha256=(Get-FileHash -LiteralPath $_ -Algorithm SHA256).Hash.ToLowerInvariant()}});output=('components-v01/raw/'+$Name+'.png');outputSha256=$sha;outputBytes=$d.Length;canvas=$canvas;model='not exposed';seed='not exposed';cliFallback=$false}
$copyFile=Join-Path $components ($Name+'-copy.json')
if(-not(Test-Path -LiteralPath $copyFile)){$copy=[ordered]@{source=$source;destination=$destination;sha256=$sha;bytes=$d.Length;canvas=$canvas;creationTimeUtc=$s.CreationTimeUtc.ToString('o');lastWriteTimeUtc=$s.LastWriteTimeUtc.ToString('o');sourceRetained=$true};[IO.File]::WriteAllText($copyFile,($copy|ConvertTo-Json -Depth 5).Replace("`r`n","`n")+"`n",[Text.UTF8Encoding]::new($false))}
$journal=Join-Path $root 'evidence\IMAGEGEN_INVOCATIONS.jsonl'
if(-not [IO.File]::ReadAllText($journal).Contains($OutputId)){[IO.File]::AppendAllText($journal,($record|ConvertTo-Json -Depth 6 -Compress)+"`n",[Text.UTF8Encoding]::new($false))}
[pscustomobject]@{name=$Name;sha256=$sha;bytes=$d.Length;canvas=$canvas}|ConvertTo-Json -Compress
