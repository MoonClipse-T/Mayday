/* ============================================================
   하위헌스 2호 — 함선 안은 하나의 건물 (blender/10_하위헌스2호.blend 가 전체 배치의 원본)
   중앙 복도(동서 59 m)를 따라 북쪽 : 함교 · 식당(거주 구역) · 동면 구역 C · 연구실 · 에어록 / 남쪽 : 라운지(전망대) / 동쪽 끝 : 기관실
   방마다 창은 배 바깥을 본다. 문을 열고 걸어서 오간다 — 화면 전환 없음
   방 코드는 ROOMS.<key>(R) : R = LEVEL.add 의 방 (R.ox · R.oz 만큼 옮겨 놓았다 · R.X(방 안 x) = 세계 x)
   ★ 빠르게 : 방들은 한 번만 풀어 둔다(LEVEL.build 캐시) · 발사 컷신 동안 미리 푼다(SHIP.preload) · 충돌 칸은 일꾼이 화면 뒤에서
   제작용 바로 가기 : ?s=cryo(처음부터) · ?s=deck · ?s=bridge (해동이 끝난 것으로) · ?s=lounge (출발 직후 라운지)
   ============================================================ */
'use strict';
const ROOMS={};
const SHIP={OX:{bridge:0,deck:14,cryo:27,lab:39,lobby:20.5,engine:63.3}, OZ:{lobby:19.725,engine:10.35},
  HALL:{z1:8.9,z2:12.18,x1:-3.3,x2:55.3,h:2.6}, DOORZ:8.7, rooms:{}, doors:{}, lock:{}, zone:null, mode:'wake',
  NAME:{bridge:'함교',deck:'식당 · 의무실',cryo:'동면 구역 C',lab:'연구실',airlock:'에어록',lobby:'라운지 · 전망대',engine:'기관실',hall:'중앙 복도'},
  EXPO:{bridge:.85,deck:.85,cryo:.62,lab:.95,airlock:.7,lobby:1.0,engine:1.05,hall:.8},
  // 하늘은 하나 : 출발 직후(지구가 뒤로 멀어진다) · 목성 앞(웜홀) · 건너편
  sky(){ return S.flags.passed?{dir:[0,.02,1],R:.07,srot:2.4,jupiter:false,sunDir:[-.4,.6,.5]}
    :this.mode==='depart'?{dir:[.05,.04,-1],R:.0005,jdir:[-.22,.06,1],jsize:.12,ptex:'earth_day.jpg',sunDir:[-1,.25,.6]}:{dir:[.05,.04,-1],R:.16,jdir:[-.75,-.12,-.65],jsize:.9,sunDir:[1,.3,.6]}; },
  when(){ return S.flags.passed?'위치 미상':this.mode==='depart'?'지구 궤도 출발 · 목성까지 214일':S.flags.transit?'웜홀 진입':'출발 214일째 · 목성 궤도'; },
  zoneAt(x,z){ if(x>55.3) return 'engine'; if(z>12.3) return 'lobby'; if(z>this.HALL.z1-.05) return 'hall';
    return x<7?'bridge':x<21?'deck':x<31.6?'cryo':x<47?'lab':'airlock'; },
  // 방 목록 : [키, LEVEL.add 옵션] — 들어갈 때와 미리 풀 때 똑같이 (캐시 키가 같아야 한다)
  list(){ const backDoor=root=>cutTris(root,'base_door',c=>c.z>7), O=this.OX, Z=this.OZ;
    return [['bridge',{ox:O.bridge,prep:root=>{ backDoor(root); ROOMS.bridgePrep(root); }}],['deck',{ox:O.deck,prep:backDoor}],
      ['cryo',{ox:O.cryo,prep:root=>cutTris(root,'base_door',c=>Math.abs(c.z)>7)}],        // 동면 구역은 북쪽(관측창 앞) 문짝도 창을 가려서 함께 지운다
      ['lab',{ox:O.lab}],['lobby',{ox:O.lobby,oz:Z.lobby}],['engine',{ox:O.engine,oz:Z.engine}],['hall',{}]]; },
  preload(){ return this._pre||(this._pre=LEVEL.preload(this.list()).then(()=>LEVEL.warmBundles(this.list().map(([k,o])=>k+'@'+(o.ox||0)+','+(o.oz||0))))); },
};

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

SCENES.ship={title:'하위헌스 2호', async enter(o={}){ const f=S.flags; SHIP.mode=o.mode||'wake'; SHIP.zone=null; SHIP.lock={}; SHIP.doors={};
  LOADING.show('하위헌스 2호 · 선내 시스템 동기화'); const t0=performance.now();
  LEVEL.clear(); BRIDGEUI.clear();
  const L=SHIP.list(); let done=0; L.forEach(([k,op])=>LEVEL.build(k,op).then(()=>LOADING.set(++done/L.length*.8)));
  const R={}; for(const [k,op] of L.filter(l=>l[0]!=='hall')) R[k]=await LEVEL.add(k,op);
  SHIP.rooms=R; for(const r of Object.values(R)) r.X=x=>x+r.ox;
  await SKY.space(SHIP.sky());
  WORLD.add(new THREE.HemisphereLight(0xc8d8ee,0x121518,.38));
  await SHIP.hall();
  SHIP.door(R.bridge,'함교','중앙 복도'); SHIP.door(R.deck,'식당 · 의무실','중앙 복도'); SHIP.door(R.cryo,'동면 구역 C','중앙 복도');
  SHIP.door(R.lab,'연구실','중앙 복도',{x:37.43}); SHIP.door(R.lab,'에어록','중앙 복도',{x:50.43,key:'airlock'});
  SHIP.door(R.lobby,'라운지 · 전망대','중앙 복도',{x:14,z:12.45,rot:0}); SHIP.door(R.engine,'기관실','중앙 복도',{x:55.25,z:10.35,rot:Math.PI/2});
  SHIP.lock.airlock=()=>'에어록은 선외 활동 때만 엽니다. 지금은 잠가 둡니다.';
  await ROOMS.bridge(R.bridge); await ROOMS.deck(R.deck); await ROOMS.cryo(R.cryo); await ROOMS.lab(R.lab); await ROOMS.lobby(R.lobby); await ROOMS.engine(R.engine);
  LOADING.set(.9); await SOLID.build();               // 묶음 칸은 미리 계산돼 있다 — 장면이 넣은 것만 일꾼이 새로
  LIGHTPOOL.start(); SKYMASK.build(); LEVEL.warm(); LOADING.set(1);
  console.log('ship ready',Math.round(performance.now()-t0)+' ms');
  // 지금 있는 구역 : 위치 표시 · 선내도 · 밝기(눈이 적응하듯 천천히) · 처음 들어가면 그 방의 이야기
  TICK.push(dt=>{ const z=SHIP.zoneAt(P.x,P.z); renderer.toneMappingExposure=lerp(renderer.toneMappingExposure,SHIP.EXPO[z],1-Math.pow(.25,dt));
    if(z===SHIP.zone) return; SHIP.zone=z; stamp('하위헌스 2호 · '+SHIP.NAME[z],SHIP.when()); SHIPMAP.at(z);
    const r=SHIP.rooms[z]; if(r&&r.onEnter&&S.phase==='play') r.onEnter(); });
  TICK.push(()=>SHIPMAP.dot(P.x,P.z));
  AUDIO.hum(1,44); LOADING.hide();
  if(SHIP.mode==='depart') return LOUNGE.start(R.lobby);
  if(o.at&&o.at!=='cryo'){ Object.assign(f,{window:true,thawed:true,allAwake:true}); SHIP.crewOnBridge(); R.cryo.skipWake();
    const r=R[o.at]; warp(r.spawn.x,r.spawn.z,r.spawn.yaw); await fade(false,1200); S.phase='play'; P.free=true; return; }
  return R.cryo.start(); }};
// 예전 장면 이름 → 함선 안 자리
SCENES.cryo={enter:()=>SCENES.ship.enter({at:'cryo'})}; SCENES.deck={enter:()=>SCENES.ship.enter({at:'deck'})}; SCENES.bridge={enter:()=>SCENES.ship.enter({at:'bridge'})};
SCENES.lab={enter:()=>SCENES.ship.enter({at:'lab'})}; SCENES.lobby={enter:()=>SCENES.ship.enter({at:'lobby'})}; SCENES.engine={enter:()=>SCENES.ship.enter({at:'engine'})};
SCENES.lounge={enter:()=>SCENES.ship.enter({mode:'depart'})};
