/* ============================================================
   거주 구역 (CREW DECK) — 동면 구역 C 와 함교 사이. 뒤쪽 의무실(회복 캡슐) · 가운데 식당 · 왼쪽 벽 수경 재배 · 앞쪽 라운지 창
   맵 : web/assets/deck.glb (blender/02_거주구역.blend) — SPAWN(동면 구역 문) · SPOT_bridgedoor · SPOT_rec0~3 · SPOT_window · SPOT_eat · SPOT_lounge
   가구 : Poly Haven (CC0)
   ============================================================ */
'use strict';
SCENES.deck={title:'거주 구역', async enter(){
  const f=S.flags, me=t=>({kind:'me',t}), V=t=>({who:'VEGA',kind:'vega',t});
  await LEVEL.load('deck');
  const away=!!f.passed;
  await SKY.space(away?{dir:[0,.02,1],R:.07,srot:2.4,jupiter:false}:{dir:[.05,.04,-1],R:.16,jdir:[-.75,-.12,-.65],jsize:.9,sunDir:[1,.3,.6]});
  WORLD.add(new THREE.HemisphereLight(0xffeedd,0x15181c,.5));
  WORLD.traverse(o=>{ if(o.isMesh&&o.material&&/wall_albedo|base_ram|base_door/.test(o.material.name)) o.material.emissiveIntensity=.5; });
  renderer.toneMappingExposure=.85;
  const sp=LEVEL.spots;
  // 의무실 회복 캡슐 넷 (동면 캡슐과 같은 모델) — 안에서 대원이 회복 중
  const pod=await loadGLB('pod'); const REC=[['레아 문','통신'],['사라 킴','의무관'],['아이샤 칸','생명 과학'],['유키 사토','대기 과학']];
  for(let k=0;k<4;k++){ const s=sp['rec'+k]; if(!s) continue; const o=THREE.SkeletonUtils.clone(pod); o.position.set(s.x,0,s.z); o.rotation.y=Math.PI; WORLD.add(o); LEVEL.solids.push(o);
    const l=new THREE.PointLight(0x6dffb0,.9,3,2); l.position.set(s.x,1.3,s.z); if(k%2===0) WORLD.add(l);
    const pk=new THREE.Mesh(new THREE.CylinderGeometry(.55,.55,2,10),PICK); pk.position.set(s.x,1,s.z); WORLD.add(pk);
    const [nm,rl]=REC[k]; interact(pk,'회복 캡슐 · '+nm+' ('+rl+')',()=>TALK.say([V(`${nm} 대원, 회복 2단계. 체온 ${(36.4+k*.1).toFixed(1)} ℃, 심박 ${58+k*3}. 약 30분 뒤 깨어납니다.`)]),{range:2.6}); }
  // 살펴보기
  const look=(x,z,w,h,name,lines)=>{ const m=new THREE.Mesh(new THREE.BoxGeometry(w,1.6,h),PICK); m.position.set(x,.8,z); WORLD.add(m); interact(m,name,()=>TALK.say(lines),{range:3}); };
  look(-4.7,0,1,6.5,'수경 재배 상자',[V('수경 재배 구역입니다. 선내 산소의 12%와 신선 식품을 맡고 있습니다.'),me('214일 동안 잘 자랐군. 누군가는 물을 줬다는 뜻이다.'),V('자동 급수입니다, 선장님.')]);
  look(.6,-.1,2.8,4.4,'식당 테이블',[me('컵 네 개. 마야, 서준, 다니엘… 그리고 오언. 다들 커피부터 마셨군.')]);
  // 라운지 창 : 창 앞에서 바라보면
  const w=sp.window; TICK.push(()=>{ if(f.deckWin||S.busy||!P.free||!w) return; if(Math.hypot(P.x-w.x,P.z-w.z)>3.2) return; if(-Math.cos(P.yaw)>-.8) return; f.deckWin=true;
    TALK.say(away?[me('…창밖은 그대로다. 별이 있고, 어둠이 있고. 그런데 집이 없다.')]:[me('라운지 창으로 보니 목성이 더 크다.'),V('목성 표면의 붉은 점 — 대적점은 지구보다 큽니다. 웜홀은 그 오른쪽입니다.')]); });
  // 문 : 동면 구역 C (뒤) · 함교 (왼쪽 벽 앞)
  // 눈에 보이는 문을 벽면에 붙이고, 누르는 상자는 그 바로 앞에 둔다 (벽면은 충돌 칸에서 잰 자리 : 뒤 z 8.3 · 왼쪽 기둥 앞 x −5.05)
  const door=(x,z,rot,label,name,fn)=>{ const d=makeDoor(x,z,rot,label), m=new THREE.Mesh(new THREE.BoxGeometry(2.1,2.7,.3),PICK);
    m.position.set(x+Math.sin(rot)*.2,1.35,z+Math.cos(rot)*.2); m.rotation.y=rot; WORLD.add(m); interact(m,name,()=>fn(d),{range:3.2}); };
  door(0,8.38,Math.PI,'동면 구역 C','문 · 동면 구역 C',()=>TALK.say([V('동면 구역 C는 비어 있습니다. 회복 중인 대원은 모두 이곳 의무실과 선실에 있습니다.')]));
  door(-5.0,-5.6,Math.PI/2,'함교','문 · 함교',async d=>{ await d.open(); S.from='deck'; await go('bridge'); });

  const fromBridge=S.from==='bridge'; S.from='';
  if(fromBridge&&sp.bridgedoor) warp(sp.bridgedoor.x+.6,sp.bridgedoor.z,-Math.PI/2); else warp(LEVEL.spawn.x,LEVEL.spawn.z,LEVEL.spawn.yaw);
  stamp('하위헌스 2호 · 거주 구역',away?'위치 미상':'목성 궤도 · 웜홀 진입 T−0:58'); SHIPMAP.at('deck');
  AUDIO.hum(.8,52); await fade(false,1200); S.phase='play';
  if(!f.deckIn){ f.deckIn=true;
    await TALK.say([V('거주 구역입니다. 뒤쪽이 의무실, 가운데가 식당, 앞쪽 창가가 라운지입니다.'),V('함교는 왼쪽 앞 문입니다. 마야 부선장과 한서준 대원이 먼저 가 있습니다.')]); }
  P.free=true; goal(f.passed?'':'함교로 간다 — 왼쪽 앞 문');
}};
