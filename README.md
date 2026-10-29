# MAYDAY — 별과 우주 방탈출

1인칭 3D 방탈출 (three.js r128 · 디벗 터치 / 키보드). 과학2 Ⅷ. 별과 우주(1~6차시).
선장 크리스가 되어 NASA 회의실에서 우주선까지 직접 걸어 다니고, 사람들과 대화하며 웜홀 너머 하위헌스 1호의 마지막 교신 "Mayday, Mayday, we are—"를 쫓는다.

- 게임: https://moonclipse-t.github.io/Mayday/ (제작용 바로 가기: `?s=meeting` · `launch` · `orbit` · `lounge` · `approach` · `cryo` · `deck` · `bridge` · `lab` · `lobby` · `engine`, 고치는 중엔 `&dev` 를 붙이면 캐시 없이 받는다)
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
  scenes/ship.js        함선 = 하나의 건물 : 중앙 복도(59 m) 북쪽에 함교 · 식당 · 동면 C · 연구실 · 에어록, 남쪽에 라운지(전망대), 동쪽 끝에 기관실
  scenes/s1_cryo.js     1장 · 동면 구역 C (캡슐 안 대원 넷 → 한 번에 해동 → 걸어 나와 함교로)
  scenes/s2_deck.js     거주 구역 (의무실 · 식당 · 라운지)
  scenes/s2b_lounge.js  출발 직후 라운지(전망대) : 다니엘과 대화 · A4 종이에 시차 · 연주 시차 그리기 · 퀴즈 d(pc) = 1 ÷ p(″) (1차시)
  scenes/s3_bridge.js   함교 (AR · 웜홀 통과)
  scenes/s4_rooms.js    연구실 · 라운지 · 기관실
  main.js             시작
  style.css           화면 디자인
  vendor/             three.js r128 · GLTFLoader · SkeletonUtils
  assets/             게임이 읽는 맵(.glb) · 인물 · 그림 (일반 git — Pages 가 내보내야 해서 LFS 아님)
blender/              원본 .blend (Git LFS) : 00_회의실 · 01_동면실 · 02_거주구역 · 03_함교 · 04_중앙복도 · 90_발사_궤도
                      ★ 10_하위헌스2호.blend = 함선 전체 배치의 원본 (모든 방 + 복도 + 새 방 셋). 방 하나를 고치면 여기서 그 방만 내보낸다
assets/               받은 원본 자료 (Git LFS) : sketchfab · polyhaven · sky · fonts
renders/              Blender 렌더
```

## 몸 충돌 (engine.js SOLID)
걸어 다니는 맵(회의실 · 동면실 · 거주 구역 · 함교)은 **보이는 메시 전부**를 가로 10 cm · 세로 5 cm 칸으로 채워 충돌을 만든다. 의자 · 탁자 · 캡슐 · 벽 · 유리 · 사람에 다 부딪힌다.
발 위 0.38 m 까지의 턱은 그냥 올라서고, 점프(0.66 m)하면 1 m 안팎의 책상 위에도 올라선다. 장면이 나중에 세우는 소품(캡슐 등)은 `LEVEL.solids.push(물체)` 로 넣는다. 확인용 `?nosolid` 끄기.
그래서 손으로 둔 `COL_` · `COLC_` 상자는 이제 쓰지 않는다(보이지 않는 벽이 생겨서). 컷신 맵은 `LEVEL.load(key,{solid:false})`.
문은 `makeDoor(x,z,rot,'표시판 글')` 로 벽면에 세운다 (문틀 · 빛 띠 · 열리는 문짝 · 문틀 안에만 보이는 통로). `door.enter()` = 열고 걸어 들어가며 어두워짐.
Blender 의 `fog_volume`(안개 부피 상자)은 웹에서 회색 벽이 되므로 엔진이 뺀다. 한 메시에 묶인 소품 일부를 빼려면 `cutTris(root,재질,조건)`.

## 함선 = 하나의 건물 (scenes/ship.js · blender/10_하위헌스2호.blend)
```
            ▲ 뱃머리 쪽 창 (−z)
  [함교] [식당·의무실] [동면 C] [연구실] [에어록]
  ════════════════ 중앙 복도 59 m ════════════════ [기관실]
               [ 라운지 · 전망대 ]            (원자로)
```
- 세계 좌표(three) : 방 원점 x — 함교 0 · 식당 14 · 동면 27 · 연구실 39 · 라운지 (20.5, z 19.7) · 기관실 (63.3, z 10.35). 복도 z 8.9 ~ 12.2.
- Blender 에서 방마다 `ROOM_<key>` 빈 물체 밑에 둔다. 내보낼 때는 그 빈 물체를 원점으로 옮겨 `web/assets/<key>.glb` 로 (엔진이 `ox` · `oz` 만큼 다시 옮긴다).
- 방 코드는 `ROOMS.<key>(R)` — `R.X(방 안 x)` = 세계 x. 문은 `SHIP.door(R,이름,뒤,{x,z,rot})`.
- 라운지 = 배 한가운데의 쉬는 곳 · 전망대 : 통유리 · 천창 · 소파 · 바 · 탁구대 · 정원. 출발 직후 대화도 여기서 (창밖으로 지구가 작아진다).

## 빠르게 (검은 화면 줄이기 · 디벗)
- **맵은 한 번만 푼다** : `LEVEL.build` 가 풀기 · 손보기 · 배경 합치기까지 한 묶음을 캐시 → 다시 들어가면 붙이기만 (목성 컷신 뒤 · 웜홀 뒤에도 그대로).
- **미리 받기 · 미리 풀기** : 회의 동안 함선 파일을 받고(`prefetch`), 발사 · 궤도 컷신 동안 풀어서 그래픽 메모리에 올려 둔다(`SHIP.preload` → `LEVEL.warmBundles`).
- **몸 충돌 칸은 일꾼(Web Worker)이** 화면 뒤에서 계산하고 묶음마다 캐시 · 4.2 m 높이까지 · 1 비트 칸.
- **빛 묶음(LIGHTPOOL)** : 맵 · 장면의 점광원(60 개쯤)은 보이지 않게 두고, 가까이서 실제로 밝히는 순으로 진짜 빛 6 ~ 10 개에 옮겨 담는다 (셰이더를 다시 만들지 않는다).
- **같은 키트 재질은 하나만** (`shareMats`) — 방마다 같은 선체 그림을 따로 올리지 않는다.
- **별은 창으로만 (SKYMASK)** : 창유리(`wf_glass…` · `M_glass`) 모양에만 스텐실을 남기고 하늘은 그 안에만 → 벽 · 천장 틈으로 우주가 보이지 않는다. 새 창은 이름을 `wf_glass_…` 로.
- 이 PC 기준 : 첫 출발 라운지까지 6.7 초 → 1.3 초 (미리 푼 경우), 다시 들어갈 때도 1.3 초.

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
- 마야 · 한서준 · 다니엘 · 오언: Tripo Studio 로 직접 생성 (`assets/tripo/` 원본 → `web/assets/person_<이름>.glb`, 텍스처 1024)
- 인물 추가: Renderpeople [Nathan](https://sketchfab.com/3d-models/nathan-animated-003-walking-3d-man-143a2b1ea5eb4385ae90a73657aca3bc) · [Sophia](https://sketchfab.com/3d-models/sophia-animated-003-animated-3d-woman-dc448c3be0e74f96a55fb475a13433cf) · [Manuel](https://sketchfab.com/3d-models/manuel-animated-001-3d-dancing-man-e65e0fef4e0743868c8d5bff36d61116) · [Security Guard](https://sketchfab.com/3d-models/security-guard-rigged-3d-model-1e3307732bbf4453b30f021bfec5bcaf) by Q.SARDOR — CC BY 4.0
- 함교 소품: [Sci-Fi Pilot Seat](https://sketchfab.com/3d-models/sci-fi-pilot-seat-52770448cb1149319d1d39ca5c254330) · [Hologram Table](https://sketchfab.com/3d-models/hologram-table-ab0c01198e314786a2c26b152b6cee51) · [Sci Fi Wall Bridge With Monitor](https://sketchfab.com/3d-models/sci-fi-wall-bridge-with-monitor-8875469bba4d47ea855b5d289ed135bb) — CC BY 4.0 (작가는 각 CREDIT.txt)
- 발사 · 외부: [Space Center Realistic Launch Facility](https://sketchfab.com/3d-models/space-center-realistic-launch-facility-4c87468c552243ec815251b7cb24bc04) by Nikoleta.Zhecheva · [Deep Space Science / Survey Vessel](https://sketchfab.com/3d-models/deep-space-science-survey-vessel-psx-lo-fi-925a09ef43fe4675acd0a935d61dcd43) by Vaportrash — CC BY 4.0 · 지구 지도: Solar System Scope (CC BY 4.0)
- 거주 구역 가구: Poly Haven 모델 (CC0) · 중앙 복도: [Sci-fi corridor 2019](assets/sketchfab/corridor_2019/CREDIT.txt) (CC BY 4.0)
- 연구실: [Sci-fi lab](https://sketchfab.com/3d-models/sci-fi-lab-a676e149e343403bb5e57686f3d31da5) by Agata Wilczek · [Sci-Fi Microscope](https://sketchfab.com/3d-models/sci-fi-microscope-ab7e120d948a468da31f9a410d205000) by Tomek Suchodolski · [Sci-fi Lab Cell](https://sketchfab.com/3d-models/sci-fi-lab-cell-0bd8e745f008419ca7097395ad697d16) by LxNazarov — CC BY 4.0 · [An optical spectrometer](https://sketchfab.com/3d-models/an-optical-spectrometer-1cb673f9f1044907a6261e4bb8a63464) by Virtual Museums of Małopolska — CC0
- 기관실: [Large Fission/Fusion Hybrid Reactor](https://sketchfab.com/3d-models/large-fissionfusion-hybrid-reactor-c331666c133042c1a73c438857ce0149) by Lynxon — CC BY 4.0
- 라운지: Poly Haven 모델 · 재질 (소파 · 바 의자 · 붐박스 · 화분 · 나무 바닥 · 가죽 · 천, CC0)
- 재질 · 밤 도시: Poly Haven (CC0) · 별지도: NASA/Goddard SVS Deep Star Maps 2020 · 목성 지도: Solar System Scope (CC BY 4.0) · 사진: NASA 아폴로 17호, NASA/ESA 허블(목성)
- 엔진 기법: 루나랜드(같은 선생님 프로젝트)의 충돌 · 조사 · 태블릿 GPU 안전장치 · 배경 합치기 · three.js r128 (MIT)
