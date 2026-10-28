/* ============================================================
   1장 · 깨어남 — 하위헌스 2호 동면 구역 C (출발 214일째, 목성 궤도 진입 3시간 전)
   맵 : web/assets/cryo.glb (blender/01_동면실.blend) — SPAWN · SPOT_window · IT_c07 · COL_/COLC_
   창밖 : 실제 별지도 + 웜홀 렌즈 + 목성 (sky.js)
   ============================================================ */
'use strict';
SCENES.cryo={title:'1장 · 깨어남', async enter(){
  await LEVEL.load('cryo');
  // 동면 캡슐 14기 : 모델 하나(pod · 열린 함장 캡슐 pod_open)를 SPOT_pod_* 자리에 복제해 세운다 (모양 데이터는 함께 쓴다)
  const [pod,podOpen]=await Promise.all([loadGLB('pod'),loadGLB('pod_open')]);
  Object.entries(LEVEL.spots).filter(([k])=>k.startsWith('pod_')).forEach(([k,s])=>{ const src=k==='pod_L4'?podOpen:pod, o=THREE.SkeletonUtils.clone(src);
    o.position.set(s.x,0,s.z); o.rotation.y=s.yaw; o.traverse(m=>{ if(m.isMesh) m.frustumCulled=false; }); WORLD.add(o); });
  if(LEVEL.items.c07) LEVEL.items.c07.material=PICK;
  await SKY.space({dir:[.2,.1,-1],R:.1,jdir:[-.3,-.07,-1],jsize:.5,sunDir:[1,.35,.2]});
  WORLD.add(new THREE.HemisphereLight(0x9fb4c8,0x101418,.22));
  // 정전 : 선체 세트의 자체 발광(천장 환기구 불빛)을 낮춘다
  LEVEL.root.parent&&WORLD.traverse(o=>{ if(o.isMesh&&o.material&&/wall_albedo|base_ram|base_door/.test(o.material.name)) o.material.emissiveIntensity=.15; });
  renderer.toneMappingExposure=.62;
  // 정전 : 캡슐의 푸른 빛 · 경광등의 붉은 빛 · 창으로 들어오는 별빛
  const pl=(c,i,d,x,y,z)=>{ const l=new THREE.PointLight(c,i,d,1.8); l.position.set(x,y,z); WORLD.add(l); return l; };
  const red=[pl(0xff2a14,0,9,-3.1,3.6,3.5),pl(0xff2a14,0,9,3.1,3.6,-3.5)];
  [[-2.4,-4.7],[2.4,4.7],[2.4,-2.3],[-2.4,2.3]].forEach(([x,z])=>pl(0x4fb8ff,1.6,5,x,1.4,z));
  pl(0xff3a20,2.2,4,-2.4,1.4,0);                               // 레아의 캡슐 (C-07)
  pl(0xb8c8ff,1.2,10,0,2.2,-7.6);                              // 창빛
  TICK.push(()=>{ const k=Math.max(0,Math.sin(S.t*2.6))**6; red.forEach(l=>l.intensity=k*5); });
  const f=S.flags, me=t=>({kind:'me',t}), V=t=>({who:'VEGA',kind:'vega',t});
  const sw=LEVEL.spots.window;

  interact('c07','C-07 캡슐 단말',async()=>{ if(f.c07) return; f.c07=true; goal('');
    await TALK.say([me('C-07… 통신 담당 레아의 캡슐.'),me('비어 있다. 해동 기록도 없다.'),V('C-07 상태 정상. 레아 대원은 동면 중입니다.'),me('…뭐라고?')]);
    S.phase='cut'; P.free=false; await fade(true,1600); await card('1장 · 깨어남','— 계속 —','다음 업데이트 : 함교와 항법 (별까지의 거리)',4200); });

  TICK.push(()=>{ if(f.window||S.busy||!sw) return; if(Math.hypot(P.x-sw.x,P.z-sw.z)>1.6) return; f.window=true;
    (async()=>{ P.free=false; goal(''); const d=new THREE.Vector3(.2,.1,-1).normalize(); await lookAt(P.x+d.x*50,P.y+P.eye+d.y*50,P.z+d.z*50,1.8);
      await TALK.say([me('…저게 웜홀.'),V('웜홀까지 41만 km. 목성 중력권에 들어왔습니다. 별빛이 휘는 것이 보이실 겁니다.'),me('214일을 잤는데 하루처럼 느껴지는군.'),
        V('선장님, 대원 해동은 목성 궤도 진입 1시간 전에 시작합니다. 그 전에 캡슐 상태를 한번 둘러보시겠습니까?')]);
      P.free=true; goal('대원들의 캡슐을 둘러본다 — 붉게 빛나는 캡슐이 하나 있다'); })(); });

  warp(LEVEL.spawn.x,LEVEL.spawn.z,LEVEL.spawn.yaw); stamp('하위헌스 2호 · 동면 구역 C','출발 214일째  ·  목성 궤도 진입 T−3:12');
  AUDIO.hum(1,42);
  await card('214일 후','목성 궤도 진입 3시간 전','하위헌스 2호 · 동면 구역 C',3400);
  await fade(false,2400);
  S.phase='play';
  await TALK.say([V('동면 해제 완료. 좋은 아침입니다, 크리스 선장님.'),V('목성 궤도 진입까지 3시간 12분. 모든 대원은 정상적으로 동면 중입니다.'),me('머리가 깨질 것 같군… 창밖부터 봐야겠다.')]);
  P.free=true; goal('복도 끝 관측창으로 가서 밖을 본다');
}};
