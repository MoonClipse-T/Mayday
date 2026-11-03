# ElevenLabs 결과 받기 : tools/urls.txt 의 "이름 주소" 줄마다 assets/elevenlabs/<이름>.mp3 (이미 있으면 건너뜀)
$ProgressPreference='SilentlyContinue'
Get-Content tools/urls.txt | ForEach-Object { $p=$_ -split ' ',2; if($p.Length -lt 2){ return }; $out="assets/elevenlabs/$($p[0]).mp3"; if(-not (Test-Path $out)){ Invoke-WebRequest -UseBasicParsing -Uri $p[1] -OutFile $out; "got $($p[0])" } }
