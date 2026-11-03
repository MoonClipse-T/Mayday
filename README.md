# MAYDAY — 별과 우주 방탈출

1인칭 3D 공포 방탈출 (three.js r128 · 디벗 터치 / 키보드). 과학2 Ⅷ. 별과 우주.
NASA 긴급 브리핑(프롤로그)에서 시작해, 크리스는 혼자 1인 구조정을 타고 웜홀 너머 하위헌스 1호를 찾아간다. 1호는 이미 전멸했고, 시신마다 애벌레가 들어 있다. 총으로 애벌레를 없애고, 성체를 피해 숨고 도망치며, 1호를 몰고 웜홀로 돌아와야 한다. (4판 · 2026-11-03 — 동료 · 장 구분 · 문제는 뺐다. 문제는 나중에 하나씩 끼운다)

- 게임: https://moonclipse-t.github.io/Mayday/ (고치는 중엔 `&dev` 를 붙이면 캐시 없이 받는다)
- 제작용 바로 가기 `?s=` : `meeting`(처음 · 브리핑) · `cockpit`(구조정) · `board`(1호 에어록) · `survivor`(생존자) · `hunt`(애벌레 사냥) · `engine`(기관실 · 성체) · `bridge`(함교 · 출발)
- 이야기 · 흐름: [STORY.md](STORY.md)
- 아직 별과 우주 아카이브에는 넣지 않았다 (다 만든 뒤에 넣는다).

## 조작
- 디벗: 왼쪽 끌기 이동 · 오른쪽 끌기 둘러보기 · [사격] · [웅크림] · [달리기] · 물건을 눌러 조사
- PC: W A S D 이동 · 마우스 끌기 · F 사격 · C 웅크리기 · Shift 달리기 · E 조사(옷장 · 침대에 숨기 / 나오기) · Space 대사 넘기기 · 숨어 있을 때 숨 참기
- 구조정 : W/S 전진 · 후진 · A/D 좌우 · R/F 위아래 · 끌기(방향키) 기수 · Q/E 롤 · X 감속 (디벗은 화면 단추)

## 폴더 (이 폴더 = GitHub 저장소 Mayday, OneDrive 에도 그대로)
```
index.html            게임 화면 틀 (바이저 HUD · 교신 자막 · 장 카드 · 시작 화면)
web/
  engine.js           엔진 : 이동 · 충돌 · 조사 · 교신 자막 TALK · 장 카드 · LEVEL(맵) · SOLID(몸 충돌 칸)
  people.js           실사 인물 (생존자 레아) : 뼈로 자세 · 숨쉬기 · 턱
  sky.js              창밖 : 밤 도시 / 실제 별지도 + 웜홀 렌즈 + 행성 · WH(회의실 화면용 웜홀)
  screens.js          회의실 대형 화면 (실시간 관제 대시보드 · 구조 계획)
  scenes/s0_meeting.js  프롤로그 · NASA 브리핑룸 (앉아서 듣는 브리핑 → 넉 달 뒤 구조정)
  creatures.js        애벌레(LARVA) · 성체(BEAST : 보고 · 듣고 · 쫓고 · 찾기) · 길 찾기(문 둘) · 가구 비켜 돌기
  scenes/tools.js     이야기 도구 : 소품 · 손전등 · 목표 표지 · 문제 화면(나중에) · 공포 연출 · 피 · 권총 · 체력 · 웅크리기
  scenes/ship.js      1호 = 하나의 건물 : 중앙 복도(59 m) 북쪽에 함교 · 식당 · 동면 C · 연구실 · 에어록, 남쪽에 라운지, 동쪽 끝에 기관실
  scenes/rooms.js     방마다 보이는 것 (꺼진 화면 · 비상등 · 캡슐 · 원자로 재가동)
  scenes/game.js      한 흐름 : 구조정 → 1호 → 생존자 → 애벌레 사냥 → 기관실 성체 → 함교 출발 (저장 지점)
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
- 우주선: [Sci-fi corridor](https://sketchfab.com/3d-models/sci-fi-corridor-5e6240c9b30145b0bf81fd02287985e3) by 3dhdscan · [Stasis / Clone Chamber](https://sketchfab.com/3d-models/stasis-clone-chamber-with-animations-8738f78ae4ec4630ac35a4783303ea95) by TampaJoey — CC BY 4.0
- **애벌레**: [Lurker - Rigged and Animated](https://sketchfab.com/3d-models/28b3e1a216904de7ad212368fb9d8f59) by HighPolyDensity → `web/assets/larva.glb` · **성체**: [Nightmare Creature 1#](https://sketchfab.com/3d-models/9fb509d207d744babeb5d87a486f7de1) by Mr.Prizz → `beast.glb` — CC BY 4.0
- **시신**: [Dead Hazmat Female](https://sketchfab.com/3d-models/2e879c914d6b4e15a05f8496977854fd) by OHR3D · [Low Poly Dead Body Covered](https://sketchfab.com/3d-models/1e6ae13f6c2e46429eaca4d22d8bdbaa) by -Arthur- · [Corpse](https://sketchfab.com/3d-models/be9b034525c246cebab3620acb5a8027) by Tamal De Quezo → `corpse_a/b/c.glb` · **구조정 조종석**: [Spacefighter Cockpit (Wasp Interdictor)](https://sketchfab.com/3d-models/db4aa67fe1164ec088083d7dac2d273f) by Comrade1280 → `cockpit.glb` — CC BY 4.0
- **소리**: 목소리 · 배경 음악 · 효과음 — ElevenLabs 로 생성 (`web/audio/` · 원본 `assets/elevenlabs/`)
- 옷장: [Locker Equipment](https://sketchfab.com/3d-models/fae22ece4d764979aafd614ebe09956d) by Siberia (문을 Blender 에서 경첩 축으로 나눔 → `web/assets/locker.glb`) · 침대: [Hospital Bed](https://sketchfab.com/3d-models/f8c13a19e84343e7b644c19f7b9488d3) by loxfear → `bed.glb` — CC BY 4.0
- 회의실: [Meeting room](https://sketchfab.com/3d-models/meeting-room-3fd65e8b05da4b9a94d287ae3f676fd1) by Titank · 인물: Renderpeople [Eric](https://sketchfab.com/3d-models/eric-rigged-001-rigged-3d-business-man-a46bc9f67aaa415bb4f3241eef900e7f) · [Carla](https://sketchfab.com/3d-models/carla-rigged-001-rigged-3d-business-women-acf520f450d14dd799f98a6fede3edf5) · [Claudia](https://sketchfab.com/3d-models/claudia-rigged-002-3d-rigged-business-women-c659bd0accab47c6bbe390cf822a2b92) · [Security Guard](https://sketchfab.com/3d-models/security-guard-rigged-3d-model-1e3307732bbf4453b30f021bfec5bcaf) by Q.SARDOR — CC BY 4.0 · 마야 · 서준 · 다니엘 : Tripo Studio 로 직접 생성 + Adobe Mixamo 동작
- 권총(내 손): [Sci-fi Pistol Game-Ready](https://sketchfab.com/3d-models/sci-fi-pistol-game-ready-1613f084d05d461ca9dd87dde66cdb3b) by Ali haghshenas — CC BY 4.0 → `web/assets/gun.glb`
- 공포 소품(천장 환기구 · 피 · 할퀸 자국 · 손전등): Blender 로 직접 제작 — `tools/build_horror.py` → `blender/21_공포소품.blend` · `web/assets/horror.glb` (피 그림은 `blender/tex_story/`)
- 생존자 레아: Renderpeople [Sophia](https://sketchfab.com/3d-models/sophia-animated-003-animated-3d-woman-dc448c3be0e74f96a55fb475a13433cf) — CC BY 4.0
- 함교 소품: [Sci-Fi Pilot Seat](https://sketchfab.com/3d-models/sci-fi-pilot-seat-52770448cb1149319d1d39ca5c254330) · [Hologram Table](https://sketchfab.com/3d-models/hologram-table-ab0c01198e314786a2c26b152b6cee51) · [Sci Fi Wall Bridge With Monitor](https://sketchfab.com/3d-models/sci-fi-wall-bridge-with-monitor-8875469bba4d47ea855b5d289ed135bb) — CC BY 4.0 (작가는 각 CREDIT.txt)
- 1호 겉모습: [Deep Space Science / Survey Vessel](https://sketchfab.com/3d-models/deep-space-science-survey-vessel-psx-lo-fi-925a09ef43fe4675acd0a935d61dcd43) by Vaportrash — CC BY 4.0 · 행성 지도: Solar System Scope (CC BY 4.0)
- 거주 구역 가구: Poly Haven 모델 (CC0) · 중앙 복도: [Sci-fi corridor 2019](assets/sketchfab/corridor_2019/CREDIT.txt) (CC BY 4.0)
- 연구실: [Sci-fi lab](https://sketchfab.com/3d-models/sci-fi-lab-a676e149e343403bb5e57686f3d31da5) by Agata Wilczek · [Sci-Fi Microscope](https://sketchfab.com/3d-models/sci-fi-microscope-ab7e120d948a468da31f9a410d205000) by Tomek Suchodolski · [Sci-fi Lab Cell](https://sketchfab.com/3d-models/sci-fi-lab-cell-0bd8e745f008419ca7097395ad697d16) by LxNazarov — CC BY 4.0 · [An optical spectrometer](https://sketchfab.com/3d-models/an-optical-spectrometer-1cb673f9f1044907a6261e4bb8a63464) by Virtual Museums of Małopolska — CC0
- 기관실: [Large Fission/Fusion Hybrid Reactor](https://sketchfab.com/3d-models/large-fissionfusion-hybrid-reactor-c331666c133042c1a73c438857ce0149) by Lynxon — CC BY 4.0
- 라운지: Poly Haven 모델 · 재질 (소파 · 바 의자 · 붐박스 · 화분 · 나무 바닥 · 가죽 · 천, CC0)
- 재질 · 밤 도시: Poly Haven (CC0) · 별지도: NASA/Goddard SVS Deep Star Maps 2020 · 목성 지도: Solar System Scope (CC BY 4.0) · 사진: NASA 아폴로 17호, NASA/ESA 허블(목성)
- 엔진 기법: 루나랜드(같은 선생님 프로젝트)의 충돌 · 조사 · 태블릿 GPU 안전장치 · 배경 합치기 · three.js r128 (MIT)
