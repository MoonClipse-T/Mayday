/* ============================================================
   하위헌스 1호 — 함선 안은 하나의 건물 (blender/10_하위헌스2호.blend 가 전체 배치의 원본 · 예전 2호 공간을 1호로 쓴다)
   중앙 복도(동서 59 m)를 따라 북쪽 : 함교 · 식당(거주 구역) · 동면 구역 C · 연구실 · 에어록 / 남쪽 : 라운지(전망대) / 동쪽 끝 : 기관실
   방마다 창은 배 바깥을 본다. 문을 열고 걸어서 오간다 — 화면 전환 없음
   방 코드는 ROOMS.<key>(R) : R = LEVEL.add 의 방 (R.ox · R.oz 만큼 옮겨 놓았다 · R.X(방 안 x) = 세계 x)
   ★ 빠르게 : 방들은 한 번만 풀어 둔다(LEVEL.build 캐시) · 발사 컷신 동안 미리 푼다(SHIP.preload) · 충돌 칸은 일꾼이 화면 뒤에서
   4판 : 1호는 전력이 죽은 배 — 어둠 · 손전등 · 문은 모두 열려 있다. 이야기는 scenes/game.js
   ============================================================ */
'use strict';
const ROOMS={};
const SHIP={OX:{bridge:0,deck:14,cryo:27,lab:39,lobby:20.5,engine:63.3}, OZ:{lobby:19.725,engine:10.35},
  HALL:{z1:8.9,z2:12.18,x1:-3.3,x2:55.3,h:2.6}, DOORZ:8.7, rooms:{}, doors:{}, lock:{}, zone:null, dim:1,      // dim : 어둠 (전력이 죽은 1호)
  NAME:{bridge:'함교',deck:'식당 · 의무실',cryo:'동면 구역 C',lab:'연구실',airlock:'에어록',lobby:'라운지 · 전망대',engine:'기관실',hall:'중앙 복도'},
  EXPO:{bridge:.85,deck:.85,cryo:.62,lab:.95,airlock:.7,lobby:1.0,engine:1.05,hall:.8},
  // 하늘 : 웜홀 건너편 (NGC 3500) — 웜홀은 뒤쪽에 작게
  sky(){ return {dir:[0,.02,1],R:.07,srot:2.4,jupiter:false,sunDir:[-.5,.45,-.7]}; },      // 웜홀 건너편 : 행성은 없다 (별과 웜홀뿐)
  when(){ return S.flags.power?'원자로 재가동 · 영하 4도':'전력 없음 · 영하 12도'; },
  zoneAt(x,z){ if(x>55.3) return 'engine'; if(z>12.3) return 'lobby'; if(z>this.HALL.z1-.05) return 'hall';
    return x<7?'bridge':x<21?'deck':x<31.6?'cryo':x<47?'lab':'airlock'; },
  // 방 목록 : [키, LEVEL.add 옵션] — 들어갈 때와 미리 풀 때 똑같이 (캐시 키가 같아야 한다)
  list(){ const backDoor=root=>cutTris(root,'base_door',c=>c.z>7), O=this.OX, Z=this.OZ;
    return [['bridge',{ox:O.bridge,prep:root=>{ backDoor(root); ROOMS.bridgePrep(root); }}],['deck',{ox:O.deck,prep:backDoor}],
      ['cryo',{ox:O.cryo,prep:root=>cutTris(root,'base_door',c=>Math.abs(c.z)>7)}],        // 동면 구역은 북쪽(관측창 앞) 문짝도 창을 가려서 함께 지운다
      ['lab',{ox:O.lab,prep:root=>{ shove(root,['Object_14004','Object_6002','Object_7002','Object_17001','Object_20001','Object_21001'],-2,0);
        root.traverse(o=>{ if(o.isMesh&&/^rura_(gwna_baza|glowna_szybka)/.test(o.material.name)) o.visible=false; }); }}],      // 가운데 큰 관(탱크)은 감춘다 → 그 자리에 유리 격리실(story.glb IT_iso)      // 연구실 : 문 바로 안을 막던 실험대(위 물건째)를 서쪽으로 2 m
      ['lobby',{ox:O.lobby,oz:Z.lobby}],
      ['engine',{ox:O.engine,oz:Z.engine,prep:root=>cutTris(root,'eng_rail',c=>c.x<57&&c.z>9.4&&c.z<11.3)}],['hall',{}],      // 기관실 : 문 앞을 가로지르던 난간을 끊어 원자로 단으로 바로 오른다
      ['story',{solid:false}],                 // 이야기 소품 (story.glb · 세계 좌표 그대로 · 몸 충돌 없음)
      ['horror',{solid:false}]]; },            // 공포 소품 (horror.glb ← tools/build_horror.py · blender/21_공포소품.blend) : 천장 환기구 · 끌려간 뒤의 피 · 마야의 손전등
  preload(){ return this._pre||(this._pre=LEVEL.preload(this.list()).then(()=>LEVEL.warmBundles(this.list().map(([k,o])=>k+'@'+(o.ox||0)+','+(o.oz||0))))); },
};

// 맵 안 물체를 세계 좌표로 (dx, dz) 만큼 옮긴다 — 문을 막는 가구 치우기
function shove(root,names,dx,dz){ root.updateMatrixWorld(true); const w=new THREE.Vector3(), L=[];
  root.traverse(o=>{ if(names.includes(o.name)) L.push(o); }); L.forEach(o=>{ o.getWorldPosition(w); w.x+=dx; w.z+=dz; o.position.copy(o.parent.worldToLocal(w)); }); }

/* 중앙 복도 : Blender (blender/10_하위헌스2호.blend 의 HALL · HALL_E → web/assets/hall.glb)
   Sketchfab Sci-fi Corridor(corridor_2019) 반쪽을 거울로 온전하게 → 1.45 배 → 다섯 칸 59 m. 북쪽 문 구멍 다섯(함교 · 식당 · 동면 · 연구실 · 에어록) · 남쪽 하나(라운지) · 동쪽 끝(기관실) */
SHIP.hall=async function(){ const H=this.HALL; await LEVEL.add('hall',this.list().find(l=>l[0]==='hall')[1]);
  for(let x=H.x1+3;x<H.x2;x+=6){ const l=new THREE.PointLight(0xd8ecff,.9,8,1.8); l.position.set(x,H.h-.35,(H.z1+H.z2)/2); WORLD.add(l); } };

/* 문 : 방 안 · 복도 양쪽에서 누른다. lock[key]() 가 글을 돌려주면 잠겨 있다
   x · z · rot : 문 자리와 앞면 방향 (rot π = 앞면이 −z = 북쪽 방 안쪽, 0 = 남쪽, π/2 = 동쪽) */
SHIP.door=function(R,label,back,{x=R.X(0),z=this.DOORZ,rot=Math.PI,key=R.key}={}){ const d=makeDoor(x,z,rot,back,{back:label,tunnel:false,room:R}); this.doors[key]=d;      // 방 쪽 표시판 = 나가는 곳, 복도 쪽 = 이 방
  const use=async()=>{ const why=this.lock[key]&&this.lock[key](); if(why) return TALK.say([{who:'VEGA',kind:'vega',t:why}]); await d.open(); };
  const nx=Math.sin(rot), nz=Math.cos(rot);
  for(const [k,nm] of [[1,'문 · '+back],[-1,'문 · '+label]]){ const m=new THREE.Mesh(new THREE.BoxGeometry(1.8,2.5,.2),PICK); m.position.set(x+nx*.45*k,1.25,z+nz*.45*k); m.rotation.y=rot; WORLD.add(m);
    interact(m,nm,use,{range:3,enabled:()=>!d.isOpen}); }
  return d; };

SCENES.ship={title:'하위헌스 1호', async enter(){ SHIP.zone=null; SHIP.lock={}; SHIP.doors={}; SHIP.dim=1; STORY.spot=null;
  LOADING.show('하위헌스 1호 · 도킹'); const t0=performance.now();
  LEVEL.clear();
  const L=SHIP.list(); let done=0; L.forEach(([k,op])=>LEVEL.build(k,op).then(()=>LOADING.set(++done/L.length*.8)));
  const R={}; for(const [k,op] of L.filter(l=>l[0]!=='hall')) R[k]=await LEVEL.add(k,op);
  SHIP.rooms=R; for(const r of Object.values(R)) r.X=x=>x+r.ox;
  await SKY.space(SHIP.sky());
  WORLD.add(SHIP.hemi=new THREE.HemisphereLight(0xc8d8ee,0x121518,.38));
  await SHIP.hall();
  SHIP.door(R.bridge,'함교','중앙 복도'); SHIP.door(R.deck,'식당 · 의무실','중앙 복도'); SHIP.door(R.cryo,'동면 구역 C','중앙 복도');
  SHIP.door(R.lab,'연구실','중앙 복도',{x:37.43}); SHIP.door(R.lab,'에어록','중앙 복도',{x:50.43,key:'airlock'});
  SHIP.door(R.lobby,'라운지 · 전망대','중앙 복도',{x:14,z:12.45,rot:0}); SHIP.door(R.engine,'기관실','중앙 복도',{x:55.25,z:10.35,rot:Math.PI/2});
  // 복도 칸 이음새(x 31.5)의 문틀도 칸이 두툼해 복도를 통째로 막았다 → 동쪽(연구실 · 에어록 · 기관실)으로 걸어갈 수 없었다
  SOLID.holes=[[54.4,9.85,55.6,11.15,.2,1.85],[31.1,9.85,32.2,11.15,.2,1.85]];      // 복도 동쪽 끝 문 구멍 (기관실) : 비스듬한 문설주가 칸으로는 0.7 m 라 막혔다
  EMERG.length=0; STORY.prep(R.story); STORY.prep(R.horror); await ROOMS.bridge(R.bridge); await ROOMS.deck(R.deck); await ROOMS.cryo(R.cryo); await ROOMS.lab(R.lab); await ROOMS.lobby(R.lobby); await ROOMS.engine(R.engine);
  TICK.push(emergTick);
  LOADING.set(.9); await SOLID.build();               // 묶음 칸은 미리 계산돼 있다 — 장면이 넣은 것만 일꾼이 새로
  LIGHTPOOL.start(); SKYMASK.build(); LEVEL.warm(); LOADING.set(1);
  console.log('ship ready',Math.round(performance.now()-t0)+' ms');
  // 지금 있는 구역 : 위치 표시 · 선내도 · 밝기(눈이 적응하듯 천천히) · 처음 들어가면 그 방의 이야기
  TICK.push(dt=>{ const z=SHIP.zoneAt(P.x,P.z); renderer.toneMappingExposure=lerp(renderer.toneMappingExposure,SHIP.EXPO[z]*SHIP.dim,1-Math.pow(.25,dt));
    if(z===SHIP.zone) return; SHIP.zone=z; stamp('하위헌스 1호 · '+SHIP.NAME[z],SHIP.when()); SHIPMAP.at(z);
    const r=SHIP.rooms[z]; if(r&&r.onEnter&&S.phase==='play') r.onEnter(); });
  TICK.push(()=>SHIPMAP.dot(P.x,P.z));
  // 보이는 방만 그린다 : 지금 있는 방 · 복도 · 복도에서 열린(열리는) 문 너머 방 (함교에 있으면 나머지 다섯 방 — 삼각형 수십만 개 — 은 건너뛴다)
  //   식당 문과 라운지 문은 복도를 사이에 두고 마주 본다 → 서로 보인다
  const doorOf={bridge:['bridge'],deck:['deck'],cryo:['cryo'],lab:['lab','airlock'],lobby:['lobby'],engine:['engine']}, facing={deck:'lobby',lobby:'deck'};
  const near=k=>doorOf[k].some(d=>{ const g=SHIP.doors[d]; return g&&(g.isOpen||Math.hypot(P.x-g.position.x,P.z-g.position.z)<4); });
  TICK.push(()=>{ const z=SHIP.zoneAt(P.x,P.z), here=z==='airlock'?'lab':z;
    for(const [k,r] of Object.entries(R)) if(k!=='story'&&k!=='horror') r.root.parent.visible=k===here||((here==='hall'||facing[here]===k)&&near(k)); });
  AUDIO.hum(.6,38); LOADING.hide(); }};
