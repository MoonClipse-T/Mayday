# MAYDAY — 별과 우주 방탈출

1인칭 3D 방탈출 (three.js r128 · 디벗 터치 / 키보드). 과학2 Ⅷ. 별과 우주(1~6차시).
선장 크리스가 되어 NASA 회의실에서 우주선까지 직접 걸어 다니고, 사람들과 대화하며 웜홀 너머 하위헌스 1호의 마지막 교신 "Mayday, Mayday, we are—"를 쫓는다.

- 게임: https://moonclipse-t.github.io/Mayday/ (제작용 바로 가기: `?s=meeting` · `launch` · `orbit` · `cryo` · `deck` · `bridge`, 고치는 중엔 `&dev` 를 붙이면 캐시 없이 받는다)
- 이야기 · 차시 연결: [STORY.md](STORY.md)
- 아직 별과 우주 아카이브에는 넣지 않았다 (다 만든 뒤에 넣는다).

## 조작
- 디벗: 왼쪽 끌기 이동 · 오른쪽 끌기 둘러보기 · 사람이나 물건을 눌러 대화와 조사 · 오른쪽 아래 [조사] [달리기] [점프]
- PC: W A S D 이동 · 마우스 끌기 · E 또는 클릭 · Shift 달리기 · Space 점프(대화 중에는 대사 넘기기)
- 함교 AR 홀로그램: 끌어서 돌리기 · 위아래로 기울이기 · 두 손가락(PC 는 휠)으로 확대

## 폴더 (이 폴더 = GitHub 저장소 Mayday, OneDrive 에도 그대로)
```
index.html            게임 화면 틀 (바이저 HUD · 교신 자막 · 장 카드 · 시작 화면)
web/
  engine.js           엔진 : 이동 · 충돌 · 조사 · 교신 자막 TALK · 장 카드 · LEVEL.load(맵 바꾸기)
  people.js           실사 인물 : 팔 내린 자세 · 숨쉬기 · 고개 돌려 보기 · 눈 깜빡임 · 말할 때 턱 (뼈로)
  sky.js              창밖 : 밤 도시 / 실제 별지도 + 웜홀 렌즈 + 목성 · WH(회의실 화면용 웜홀)
  screens.js          회의실 대형 화면 (실시간 관제 대시보드)
  holo.js             함교 AR 홀로그램(태양계 · 목성 · 은하 지도) · 함교 화면 UI
  scenes/s0_meeting.js  프롤로그 · NASA 브리핑룸 (앉아서 듣는 브리핑)
  scenes/s0b_launch.js  발사 컷신
  scenes/s0c_orbit.js   궤도 · 출발 컷신 (우주에서 본 2호)
  scenes/s1_cryo.js     1장 · 동면 구역 C (대원 해동)
  scenes/s2_deck.js     거주 구역 (의무실 · 식당 · 라운지)
  scenes/s3_bridge.js   함교 (AR · 웜홀 통과)
  main.js             시작
  style.css           화면 디자인
  vendor/             three.js r128 · GLTFLoader · SkeletonUtils
  assets/             게임이 읽는 맵(.glb) · 인물 · 그림 (일반 git — Pages 가 내보내야 해서 LFS 아님)
blender/              원본 .blend (Git LFS) : 00_회의실 · 01_동면실 · 02_거주구역 · 03_함교 · 90_발사_궤도
assets/               받은 원본 자료 (Git LFS) : sketchfab · polyhaven · sky · fonts
renders/              Blender 렌더
```

## 몸 충돌 (engine.js SOLID)
걸어 다니는 맵(회의실 · 동면실 · 거주 구역 · 함교)은 **보이는 메시 전부**를 가로 10 cm · 세로 5 cm 칸으로 채워 충돌을 만든다. 의자 · 탁자 · 캡슐 · 벽 · 유리 · 사람에 다 부딪힌다.
발 위 0.38 m 까지의 턱은 그냥 올라서고, 점프(0.66 m)하면 1 m 안팎의 책상 위에도 올라선다. 장면이 나중에 세우는 소품(캡슐 등)은 `LEVEL.solids.push(물체)` 로 넣는다. 확인용 `?nosolid` 끄기.
그래서 손으로 둔 `COL_` · `COLC_` 상자는 이제 쓰지 않는다(보이지 않는 벽이 생겨서). 컷신 맵은 `LEVEL.load(key,{solid:false})`.
문은 `makeDoor(x,z,rot,'표시판 글')` 로 벽면에 세운다 (문틀 · 빛 띠 · 열리는 문짝).

## 맵 만드는 규칙 (Blender 이름 → 엔진, 루나랜드와 같은 규칙)
`COL_` · `COLC_`(옛 손 충돌 — 걷는 맵에서는 무시) · `FLOOR_`(바닥 높이) · `LIGHT_`(점광원, 속성 color · i · d) · `SPAWN`(시작) · `SPOT_<id>`(사람 · 목적지 · 캡슐 자리, 방향 포함) · `IT_<id>`(조사 대상).
재질 이름이 `baked_` 로 시작하면 조명이 그림에 구워진 것으로 보고 빛 계산 없이 그린다.
내보내기 : glTF · extras 포함 · 모디파이어 적용 · JPEG · 웹 텍스처 1024~2048 → `web/assets/<key>.glb`. 같은 모델을 여러 번 쓰면(동면 캡슐) 하나만 내보내고 엔진에서 복제한다.

## 집 ↔ 학교
1. 작업 전 `git pull` (처음 받는 PC 는 `git lfs install` 한 번)
2. 작업 후 commit · push → 1~2분 뒤 사이트 반영
- `.blend` 안 그림 경로는 상대 경로 (집 PC 사용자 폴더가 달라도 열린다)
- 학교 망에서 Sketchfab 받기 : `.blend` 안 텍스트 블록 `mr_net` 의 `sf_search` / `sf_import` (Blender 의 인증서 검사가 학교 망에서 막혀서 Windows 통신을 쓴다)

## 출처
- 회의실: [Meeting room](https://sketchfab.com/3d-models/meeting-room-3fd65e8b05da4b9a94d287ae3f676fd1) by Titank · 인물: Renderpeople [Eric](https://sketchfab.com/3d-models/eric-rigged-001-rigged-3d-business-man-a46bc9f67aaa415bb4f3241eef900e7f) · [Carla](https://sketchfab.com/3d-models/carla-rigged-001-rigged-3d-business-women-acf520f450d14dd799f98a6fede3edf5) · [Claudia](https://sketchfab.com/3d-models/claudia-rigged-002-3d-rigged-business-women-c659bd0accab47c6bbe390cf822a2b92) — CC BY 4.0 (작가는 `assets/sketchfab/*/CREDIT.txt`)
- 우주선: [Sci-fi corridor](https://sketchfab.com/3d-models/sci-fi-corridor-5e6240c9b30145b0bf81fd02287985e3) by 3dhdscan · [Stasis / Clone Chamber](https://sketchfab.com/3d-models/stasis-clone-chamber-with-animations-8738f78ae4ec4630ac35a4783303ea95) by TampaJoey — CC BY 4.0
- 인물 추가: Renderpeople [Nathan](https://sketchfab.com/3d-models/nathan-animated-003-walking-3d-man-143a2b1ea5eb4385ae90a73657aca3bc) · [Sophia](https://sketchfab.com/3d-models/sophia-animated-003-animated-3d-woman-dc448c3be0e74f96a55fb475a13433cf) · [Manuel](https://sketchfab.com/3d-models/manuel-animated-001-3d-dancing-man-e65e0fef4e0743868c8d5bff36d61116) · [Security Guard](https://sketchfab.com/3d-models/security-guard-rigged-3d-model-1e3307732bbf4453b30f021bfec5bcaf) by Q.SARDOR — CC BY 4.0
- 함교 소품: [Sci-Fi Pilot Seat](https://sketchfab.com/3d-models/sci-fi-pilot-seat-52770448cb1149319d1d39ca5c254330) · [Hologram Table](https://sketchfab.com/3d-models/hologram-table-ab0c01198e314786a2c26b152b6cee51) · [Sci Fi Wall Bridge With Monitor](https://sketchfab.com/3d-models/sci-fi-wall-bridge-with-monitor-8875469bba4d47ea855b5d289ed135bb) — CC BY 4.0 (작가는 각 CREDIT.txt)
- 발사 · 외부: [Space Center Realistic Launch Facility](https://sketchfab.com/3d-models/space-center-realistic-launch-facility-4c87468c552243ec815251b7cb24bc04) by Nikoleta.Zhecheva · [Deep Space Science / Survey Vessel](https://sketchfab.com/3d-models/deep-space-science-survey-vessel-psx-lo-fi-925a09ef43fe4675acd0a935d61dcd43) by Vaportrash — CC BY 4.0 · 지구 지도: Solar System Scope (CC BY 4.0)
- 거주 구역 가구: Poly Haven 모델 (CC0)
- 재질 · 밤 도시: Poly Haven (CC0) · 별지도: NASA/Goddard SVS Deep Star Maps 2020 · 목성 지도: Solar System Scope (CC BY 4.0) · 사진: NASA 아폴로 17호, NASA/ESA 허블(목성)
- 엔진 기법: 루나랜드(같은 선생님 프로젝트)의 충돌 · 조사 · 태블릿 GPU 안전장치 · 배경 합치기 · three.js r128 (MIT)
