# MAYDAY — 별과 우주 방탈출

웜홀 너머로 떠난 하위헌스 1호가 남긴 마지막 한 마디, "Mayday, Mayday, we are—".
과학2 Ⅷ. 별과 우주(1~6차시) 방탈출이다. 디벗(태블릿) 웹에서만 진행한다.

- 사이트: https://moonclipse-t.github.io/Mayday/
- 이야기 전체와 차시 연결: [STORY.md](STORY.md)
- 아직 별과 우주 아카이브에는 넣지 않았다 (다 만든 뒤에 넣는다).

## 폴더
```
방탈출/                 ← 이 폴더 = GitHub 저장소 Mayday (OneDrive 에도 그대로 있음)
├─ index.html           사이트 첫 화면 (GitHub Pages)
├─ web/                 사이트 코드 · 그림 · 글꼴 (작게 줄인 것만)
│   ├─ main.js          장면 목록 SCENES · 타자기 · 넘기기
│   ├─ wormhole.js      웜홀 렌즈 효과 (three.js 셰이더, 실제 별지도)
│   ├─ sfx.js           소리 (Web Audio 로 만들어 냄, 파일 없음)
│   ├─ img/ · fonts/    사이트에서 쓰는 것
├─ blender/             Blender 원본 (.blend) — Git LFS
├─ assets/              원본 자료 — Git LFS
│   ├─ sketchfab/<이름>/   받은 모델 + CREDIT.txt (출처)
│   ├─ polyhaven/          CC0 재질
│   ├─ sky/ · fonts/       NASA 별지도 · 원본 글꼴
├─ renders/             Blender 렌더 결과 (png)
└─ STORY.md · README.md
```

## 집 ↔ 학교
1. 작업 전: `git pull`
2. 작업 후: `git add -A && git commit -m "..." && git push`
- `.blend` 와 `assets/` 는 Git LFS 로 올라간다 (무료 10 GiB). 처음 받는 PC 는 `git lfs install` 한 번.
- `.blend` 안의 그림 경로는 모두 상대 경로라서 PC 사용자 이름이 달라도 열린다.

## 고칠 때
- 장면 글: `web/main.js` 의 `SCENES`. 글을 바꾸면 글꼴을 다시 줄인다 (쓴 글자만 남김):
  ```
  cat index.html web/main.js > /tmp/chars.txt
  uv run --with fonttools --with brotli pyftsubset assets/fonts/body.ttf --text-file=/tmp/chars.txt --flavor=woff2 --output-file=web/fonts/body.woff2
  uv run --with fonttools --with brotli pyftsubset assets/fonts/head.ttf --text-file=/tmp/chars.txt --flavor=woff2 --output-file=web/fonts/head.woff2
  ```
- Sketchfab: 학교 망에서는 Blender 안 Python 의 인증서 검사가 막혀서, `.blend` 안 텍스트 블록 `mr_net` 의 `sf_search` / `sf_import(uid, 이름, size)` 로 받는다 (Windows 통신을 씀, 토큰은 애드온 설정의 것).

## 출처
- 공간: [Sci-fi corridor](https://sketchfab.com/3d-models/sci-fi-corridor-5e6240c9b30145b0bf81fd02287985e3) by 3dhdscan · [Stasis / Clone Chamber](https://sketchfab.com/3d-models/stasis-clone-chamber-with-animations-8738f78ae4ec4630ac35a4783303ea95) by TampaJoey — CC BY 4.0
- 재질: Poly Haven (CC0)
- 별지도: NASA/Goddard SVS, Deep Star Maps 2020
- 사진: 지구 — NASA 아폴로 17호 · 지구돋이 — NASA/Bill Anders · 목성 — NASA, ESA, A. Simon (허블)
- 코드: three.js r170 (MIT)
