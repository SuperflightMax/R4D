$ErrorActionPreference='Stop'
Add-Type -AssemblyName System.Drawing
$taskBasePath='E:/R4D/perspective/p5-runtime/asset-artist/raw/receiver-v1.png'
$taskFrontPath='E:/R4D/perspective/p5-runtime/asset-artist/raw/receiver-front-v1.png'
$taskBase=[System.Drawing.Bitmap]::new($taskBasePath)
$taskFront=[System.Drawing.Bitmap]::new($taskFrontPath)
function Test-P5Dark($Pixel){return $Pixel.A -ge 128 -and $Pixel.R -lt 145 -and $Pixel.G -lt 100 -and $Pixel.B -lt 75 -and $Pixel.R -gt 1.2*$Pixel.G}
function Test-P5CavityCore([int]$X,[int]$Y){$taskHits=0;foreach($taskDy in -1,0,1){foreach($taskDx in -6,-3,0,3,6){if(Test-P5Dark ($taskBase.GetPixel($X+$taskDx,$Y+$taskDy))){$taskHits++}}};return $taskHits -ge 14}
try{
 $taskRows=@(350,375,400,425,450,475,500,525,550,575,600)
 $taskSpans=@(foreach($taskY in $taskRows){$taskLeft=628;$taskRight=628;if(Test-P5Dark ($taskBase.GetPixel(628,$taskY))){while($taskLeft -gt 200 -and (Test-P5Dark ($taskBase.GetPixel($taskLeft-1,$taskY)))){$taskLeft--};while($taskRight -lt 1050 -and (Test-P5Dark ($taskBase.GetPixel($taskRight+1,$taskY)))){$taskRight++}}else{$taskLeft=-1;$taskRight=-1};[ordered]@{y=$taskY;connectedLeft=$taskLeft;connectedRight=$taskRight;centerBase=@($taskBase.GetPixel(628,$taskY).R,$taskBase.GetPixel(628,$taskY).G,$taskBase.GetPixel(628,$taskY).B,$taskBase.GetPixel(628,$taskY).A);centerFrontAlpha=$taskFront.GetPixel(628,$taskY).A}})
 $taskTop=477;$taskBottom=477;while($taskTop -gt 250 -and (Test-P5CavityCore 628 ($taskTop-1))){$taskTop--};while($taskBottom -lt 650 -and (Test-P5CavityCore 628 ($taskBottom+1))){$taskBottom++}
 $taskTop713=477;$taskBottom713=477;while($taskTop713 -gt 250 -and (Test-P5CavityCore 713 ($taskTop713-1))){$taskTop713--};while($taskBottom713 -lt 650 -and (Test-P5CavityCore 713 ($taskBottom713+1))){$taskBottom713++}
 $taskTargets=Get-Content -LiteralPath E:/R4D/perspective/p5-runtime/asset-artist/refs/targets.json -Raw|ConvertFrom-Json
 $taskReceiver=$taskTargets.objects|Where-Object{$_.id -eq 'receiver-01'}
 $taskM=$taskTargets.projection.nativeToSource
 function Project-P5($X,$Y){$taskW=$taskM[2][0]*$X+$taskM[2][1]*$Y+$taskM[2][2];return @((($taskM[0][0]*$X+$taskM[0][1]*$Y+$taskM[0][2])/$taskW),(($taskM[1][0]*$X+$taskM[1][1]*$Y+$taskM[1][2])/$taskW))}
 $taskNative=@(32911.5049218,34857.8713072)
 $taskProjected=Project-P5 $taskNative[0] $taskNative[1]
 $taskRing=@(for($taskI=0;$taskI -lt 128;$taskI++){ $taskAngle=2*[math]::PI*$taskI/128;$taskP=Project-P5 ($taskNative[0]+16*[math]::Cos($taskAngle)) ($taskNative[1]+16*[math]::Sin($taskAngle));[pscustomobject]@{x=$taskP[0];y=$taskP[1]}})
 $taskBallWidth=($taskRing|Measure-Object x -Maximum).Maximum-($taskRing|Measure-Object x -Minimum).Minimum
 $taskBallScale=$taskBallWidth/959
 $taskReceiverScale=$taskReceiver.sourcePx.footprintWidth/290
 $taskCenterTexture=@((149+959/2),(150+941/2))
 $taskBodyCenter=@(($taskProjected[0]+($taskCenterTexture[0]-628)*$taskBallScale),($taskProjected[1]+($taskCenterTexture[1]-1089)*$taskBallScale))
 $taskReceiverOrigin=@(($taskReceiver.sourcePx.anchor[0]-628*$taskReceiverScale),($taskReceiver.sourcePx.anchor[1]-477*$taskReceiverScale))
 $taskResult=[ordered]@{
  method='Read-only connected dark-cavity pixel runs from interior center, excluding disconnected brown ropes/shadows. Threshold approximation, not complete alpha mask';basePath=$taskBasePath;frontPath=$taskFrontPath;verticalCavityAtX628=@($taskTop,$taskBottom);verticalCavityAtX713=@($taskTop713,$taskBottom713);frontAlphaAtBallVisualCenter=$taskFront.GetPixel(713,347).A;verticalCavityMidY=($taskTop+$taskBottom)/2;declaredAnchorPx=@(628,477);darkHorizontalSpans=$taskSpans
  c01=@{consumer='0c611039246904443128b9d12084af2c5a0ae6e6';seed=1696420279;state=875;nativeBall=$taskNative;sourceGroundAnchor=$taskProjected;ballSourceDiameter=$taskBallWidth;ballBodyVisibleCenterSource=$taskBodyCenter;ballBodyVisibleCenterInReceiverTexture=@((($taskBodyCenter[0]-$taskReceiverOrigin[0])/$taskReceiverScale),(($taskBodyCenter[1]-$taskReceiverOrigin[1])/$taskReceiverScale));receiverUniformScale=$taskReceiverScale;receiverSourceAnchor=$taskReceiver.sourcePx.anchor;captureRadiusNative=$taskReceiver.native.radius;nativeCenterDistance=[math]::Sqrt([math]::Pow($taskNative[0]-$taskReceiver.native.anchor[0],2)+[math]::Pow($taskNative[1]-$taskReceiver.native.anchor[1],2));currentGeometryUnmodified=$true}
 }
 $taskResult|ConvertTo-Json -Depth 10|Set-Content -LiteralPath E:/R4D/perspective/p5-runtime/asset-artist/manifests/receiver-c01-measurements.json -Encoding utf8NoBOM
 $taskResult|ConvertTo-Json -Depth 10
}finally{$taskBase.Dispose();$taskFront.Dispose()}
