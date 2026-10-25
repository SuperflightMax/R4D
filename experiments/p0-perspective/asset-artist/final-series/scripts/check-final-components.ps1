param(
    [string]$Root = (Split-Path -Parent $PSScriptRoot)
)

$ErrorActionPreference='Stop'
Add-Type -AssemblyName System.Drawing

function Assert([bool]$Condition,[string]$Message){if(-not $Condition){throw $Message}}
function Get-Sha([string]$Path){(Get-FileHash -Algorithm SHA256 -LiteralPath $Path).Hash.ToLowerInvariant()}

function Get-AlphaStats([string]$Path){
    $source=[System.Drawing.Bitmap]::FromFile($Path)
    try{
        $bitmap=[System.Drawing.Bitmap]::new($source.Width,$source.Height,[System.Drawing.Imaging.PixelFormat]::Format32bppArgb)
        $graphics=[System.Drawing.Graphics]::FromImage($bitmap)
        try{$graphics.CompositingMode=[System.Drawing.Drawing2D.CompositingMode]::SourceCopy;$graphics.DrawImageUnscaled($source,0,0)}finally{$graphics.Dispose()}
    }finally{$source.Dispose()}
    try{
        $rect=[System.Drawing.Rectangle]::new(0,0,$bitmap.Width,$bitmap.Height)
        $data=$bitmap.LockBits($rect,[System.Drawing.Imaging.ImageLockMode]::ReadOnly,[System.Drawing.Imaging.PixelFormat]::Format32bppArgb)
        try{$stride=[Math]::Abs($data.Stride);$bytes=[byte[]]::new($stride*$bitmap.Height);[System.Runtime.InteropServices.Marshal]::Copy($data.Scan0,$bytes,0,$bytes.Length)}finally{$bitmap.UnlockBits($data)}
        $zero=0L;$opaque=0L;$partial=0L;$edge=0L;$minX=$bitmap.Width;$minY=$bitmap.Height;$maxX=-1;$maxY=-1
        for($y=0;$y-lt$bitmap.Height;$y++){for($x=0;$x-lt$bitmap.Width;$x++){
            $alpha=$bytes[$y*$stride+$x*4+3]
            if($alpha-eq 0){$zero++}elseif($alpha-eq 255){$opaque++}else{$partial++}
            if($alpha-gt 0){if($x-lt$minX){$minX=$x};if($x-gt$maxX){$maxX=$x};if($y-lt$minY){$minY=$y};if($y-gt$maxY){$maxY=$y};if($x-eq 0-or$y-eq 0-or$x-eq($bitmap.Width-1)-or$y-eq($bitmap.Height-1)){$edge++}}
        }}
        [ordered]@{size=@($bitmap.Width,$bitmap.Height);alpha0=$zero;alpha255=$opaque;alphaPartial=$partial;nonzeroBounds=if($maxX-ge 0){@($minX,$minY,$maxX,$maxY)}else{$null};nonzeroEdgePixels=$edge}
    }finally{$bitmap.Dispose()}
}

$reports=@();$allHashes=@();$l1Forbidden=@(
    'dd50392203e30387c6bb0219102da9295213b56fe89375be6f33aed478ade3b6',
    '6318a55c01b3116678445604440113d4e450489db9bfc3b0ac2f1839c52bb878',
    '0d25b1a01fb17f2875254d80155f62a2173caee5fd4d13fc6f6762bbb02d45e8'
)
foreach($board in 'board-01','board-02','board-03','board-04'){
    $prepared=Join-Path (Join-Path $Root $board) 'prepared';$metadata=Get-Content -LiteralPath (Join-Path $prepared 'component-metadata.json') -Raw|ConvertFrom-Json
    $platePath=Join-Path $prepared $metadata.environment.preparedFile;$masterPath=Join-Path $prepared $metadata.master.preparedFile;$shadowPath=Join-Path $prepared $metadata.shadow.preparedFile
    $plateHash=Get-Sha $platePath;$masterHash=Get-Sha $masterPath;$shadowHash=Get-Sha $shadowPath
    Assert ($plateHash-eq$metadata.environment.preparedSha256) "${board}: plate hash mismatch";Assert ($masterHash-eq$metadata.master.preparedSha256) "${board}: master hash mismatch";Assert ($shadowHash-eq$metadata.shadow.preparedSha256) "${board}: shadow hash mismatch"
    $plate=Get-AlphaStats $platePath;$master=Get-AlphaStats $masterPath;$shadow=Get-AlphaStats $shadowPath
    Assert ($plate.size[0]-eq1536-and$plate.size[1]-eq1536) "${board}: plate size";Assert ($plate.alpha0-eq0-and$plate.alphaPartial-eq0) "${board}: plate must be opaque"
    Assert ($master.nonzeroEdgePixels-eq0) "${board}: master touches edge";Assert ($master.alpha0-gt0-and$master.alpha255-gt0-and$master.alphaPartial-gt0) "${board}: master alpha distribution"
    Assert ($shadow.nonzeroEdgePixels-eq0-and$shadow.alpha0-gt0-and$shadow.alphaPartial-gt0) "${board}: shadow alpha/edge"
    Assert (($master.size-join',')-eq($shadow.size-join',')) "${board}: shadow canvas differs"
    Assert (($metadata.master.baseCenterAnchorPx-join',')-eq($metadata.shadow.baseCenterAnchorPx-join',')) "${board}: shadow anchor differs"
    Assert ($master.nonzeroBounds[3]-eq[double]$metadata.master.baseCenterAnchorPx[1]) "${board}: base anchor is not at lowest visible master edge"
    $integration=Get-Content -LiteralPath (Join-Path (Join-Path $Root 'integration-manifests') "$board.json") -Raw|ConvertFrom-Json
    Assert ($integration.sources.plate.sha256-eq$plateHash) "${board}: integration plate hash differs from file"
    Assert ($integration.sources.master.sha256-eq$masterHash) "${board}: integration master hash differs from file"
    Assert ($integration.sources.shadow.sha256-eq$shadowHash) "${board}: integration shadow hash differs from file"
    $allHashes+=@($plateHash,$masterHash,$shadowHash)
    $reports+=[ordered]@{boardId=$board;plate=[ordered]@{sha256=$plateHash;alpha=$plate};master=[ordered]@{sha256=$masterHash;anchor=$metadata.master.baseCenterAnchorPx;alpha=$master};shadow=[ordered]@{sha256=$shadowHash;anchor=$metadata.shadow.baseCenterAnchorPx;alpha=$shadow}}
}
Assert (($allHashes|Select-Object -Unique).Count-eq12) 'All twelve prepared component hashes must be unique'
foreach($hash in $allHashes){Assert ($hash-notin$l1Forbidden) "Forbidden L1 hash reused: $hash"}
$output=[ordered]@{schema='r4d.p0.final-component-validation.v1';status='pass';boards=$reports;uniqueness=[ordered]@{componentHashes=12;uniqueHashes=12;l1HashesReused=0};boardsComposited=$false}
$outputPath=Join-Path $Root 'component-validation.json';$output|ConvertTo-Json -Depth 10|Set-Content -LiteralPath $outputPath -Encoding utf8NoBOM
Write-Output 'PASS: four opaque plates; four clean RGBA masters; four same-anchor shadows; 12 unique non-L1 component hashes; no board composites'
