/* ============================================================
   하위헌스 2호 — 함선 안은 한 공간
   함교 · 거주 구역 · 동면 구역 C 를 나란히 놓고 (모두 창이 배 앞(−z)을 본다), 뒤쪽 중앙 복도가 세 방의 뒷문을 잇는다.
   문을 열고 걸어서 오간다 — 화면 전환 없음 (뒤에 추격 장면도 이 공간에서)
   방 코드는 ROOMS.<key>(R) : R = LEVEL.add 의 방 (R.ox 만큼 x 로 옮겨 놓았다 · R.X(방 안 x) = 세계 x · z 는 그대로)
   세 방 뒷벽 가운데(x −0.9~0.9, z 8.5~8.9)에는 원래 문틀이 뚫려 있고 닫힌 문짝(base_door)만 있다 → 문짝을 지우고 진짜 문을 단다
   제작용 바로 가기 : ?s=cryo(처음부터) · ?s=deck · ?s=bridge (해동이 끝난 것으로) · ?s=lounge (출발 직후 라운지)
   ============================================================ */
'use strict';
const ROOMS={};
const SHIP={OX:{bridge:0,deck:14,cryo:27}, HALL:{z1:8.9,z2:12.18,x1:-3.3,x2:31.8,h:2.6}, DOORZ:8.7, rooms:{}, doors:{}, lock:{}, zone:null, mode:'wake',
  NAME:{bridge:'함교',deck:'거주 구역',cryo:'동면 구역 C',hall:'중앙 복도'}, EXPO:{bridge:.85,deck:.85,cryo:.62,hall:.8},
  // 하늘은 하나 : 출발 직후(지구 궤도) · 목성 앞(웜홀) · 건너편
  sky(){ return S.flags.passed?{dir:[0,.02,1],R:.07,srot:2.4,jupiter:false,sunDir:[-.4,.6,.5]}
    :this.mode==='depart'?{dir:[.05,.04,-1],R:.0005,jupiter:false,sunDir:[1,.25,.3]}:{dir:[.05,.04,-1],R:.16,jdir:[-.75,-.12,-.65],jsize:.9,sunDir:[1,.3,.6]}; },
  when(){ return S.flags.passed?'위치 미상':this.mode==='depart'?'지구 궤도 출발 · 목성까지 214일':S.flags.transit?'웜홀 진입':'출발 214일째 · 목성 궤도'; },
  zoneAt(x,z){ return z>this.HALL.z1-.05?'hall':x<7?'bridge':x<21?'deck':'cryo'; },
};

/* 중앙 복도 : Blender 로 만든 지도 (blender/04_중앙복도.blend → web/assets/hall.glb)
   Sketchfab Sci-fi Corridor(corridor_2019) 반쪽을 거울로 온전하게 → 1.45 배 → 세 칸 이어 35 m · 칸 사이 문짝은 지우고 양 끝 문은 남겼다
   방 쪽 벽에 문 구멍 셋(x 0 · 14 · 27, 폭 1.9 · 높이 2.5)과 문틀 · 바닥판. 안쪽 폭 3.3 m (z 8.9 ~ 12.2) · 천장 2.6 m · 양쪽 바닥에 파이프 */
SHIP.hall=async function(){ const H=this.HALL; await LEVEL.add('hall');
  for(let x=H.x1+3;x<H.x2;x+=6){ const l=new THREE.PointLight(0xd8ecff,.9,8,1.8); l.position.set(x,H.h-.35,(H.z1+H.z2)/2); WORLD.add(l); } };

/* 문 : 방 안 · 복도 양쪽에서 누른다. lock[key]() 가 글을 돌려주면 잠겨 있다 */
SHIP.door=function(R,label,back){ const x=R.X(0), z=this.DOORZ, d=makeDoor(x,z,Math.PI,back,{back:label,tunnel:false,room:R}); this.doors[R.key]=d;      // 방 쪽 표시판 = 나가는 곳, 복도 쪽 = 이 방
  const use=async()=>{ const why=this.lock[R.key]&&this.lock[R.key](); if(why) return TALK.say([{who:'VEGA',kind:'vega',t:why}]); await d.open(); };
  for(const [zz,nm] of [[z-.45,'문 · '+back],[z+.45,'문 · '+label]]){ const m=new THREE.Mesh(new THREE.BoxGeometry(1.8,2.5,.2),PICK); m.position.set(x,1.25,zz); WORLD.add(m);
    interact(m,nm,use,{range:3,enabled:()=>!d.isOpen}); }
  return d; };

SCENES.ship={title:'하위헌스 2호', async enter(o={}){ const f=S.flags; SHIP.mode=o.mode||'wake'; SHIP.zone=null; SHIP.lock={}; SHIP.doors={};
  LEVEL.clear(); BRIDGEUI.clear();
  const backDoor=root=>cutTris(root,'base_door',c=>c.z>7);
  const [br,dk,cr]=await Promise.all([
    LEVEL.add('bridge',{ox:SHIP.OX.bridge,prep:root=>{ backDoor(root); ROOMS.bridgePrep(root); }}),
    LEVEL.add('deck',{ox:SHIP.OX.deck,prep:backDoor}),
    // 동면 구역은 북쪽(관측창 앞) 문짝도 창을 가려서 함께 지운다
    LEVEL.add('cryo',{ox:SHIP.OX.cryo,prep:root=>cutTris(root,'base_door',c=>Math.abs(c.z)>7)})]);
  SHIP.rooms={bridge:br,deck:dk,cryo:cr}; for(const r of [br,dk,cr]) r.X=x=>x+r.ox;
  await SKY.space(SHIP.sky());
  WORLD.add(new THREE.HemisphereLight(0xc8d8ee,0x121518,.38));
  await SHIP.hall();
  SHIP.door(br,'함교','중앙 복도'); SHIP.door(dk,'거주 구역','중앙 복도'); SHIP.door(cr,'동면 구역 C','중앙 복도');
  await ROOMS.bridge(br); await ROOMS.deck(dk); await ROOMS.cryo(cr);
  SOLID.build();                              // 걷기 전에 미리 (태블릿에서 첫 걸음이 멈칫하지 않게)
  // 지금 있는 구역 : 위치 표시 · 선내도 · 밝기(눈이 적응하듯 천천히) · 처음 들어가면 그 방의 이야기
  TICK.push(dt=>{ const z=SHIP.zoneAt(P.x,P.z); renderer.toneMappingExposure=lerp(renderer.toneMappingExposure,SHIP.EXPO[z],1-Math.pow(.25,dt));
    if(z===SHIP.zone) return; SHIP.zone=z; stamp('하위헌스 2호 · '+SHIP.NAME[z],SHIP.when()); if(z!=='hall') SHIPMAP.at(z);
    const r=SHIP.rooms[z]; if(r&&r.onEnter&&S.phase==='play') r.onEnter(); });
  AUDIO.hum(1,44);
  if(SHIP.mode==='depart') return LOUNGE.start(dk);
  if(o.at&&o.at!=='cryo'){ Object.assign(f,{window:true,thawed:true,allAwake:true}); SHIP.crewOnBridge(); cr.skipWake();
    const R=SHIP.rooms[o.at]; warp(R.spawn.x,R.spawn.z,R.spawn.yaw); await fade(false,1200); S.phase='play'; P.free=true; return; }
  return cr.start(); }};
// 예전 장면 이름 → 함선 안 자리
SCENES.cryo={enter:()=>SCENES.ship.enter({at:'cryo'})}; SCENES.deck={enter:()=>SCENES.ship.enter({at:'deck'})}; SCENES.bridge={enter:()=>SCENES.ship.enter({at:'bridge'})};
SCENES.lounge={enter:()=>SCENES.ship.enter({mode:'depart'})};
