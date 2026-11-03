#!/bin/sh
# ElevenLabs 결과 받기 : tools/urls.txt 의 "이름 주소" 줄마다 assets/elevenlabs/<이름>.mp3 (이미 있으면 건너뜀 · Windows curl = 학교 인증서 OK)
while read -r n u; do [ -z "$n" ] && continue; o="assets/elevenlabs/$n.mp3"; [ -s "$o" ] && continue; /c/Windows/System32/curl.exe -s -f -o "$o" "$u" && echo "got $n" || echo "FAIL $n"; done < tools/urls.txt
