/* ============================================================
   거주 구역 (CREW DECK) — 함선 안의 방 하나 (scenes/ship.js). 뒤쪽 의무실(회복 캡슐) · 가운데 식당 · 왼쪽 벽 수경 재배 · 앞쪽 라운지 창
   맵 : web/assets/deck.glb (blender/02_거주구역.blend) — SPAWN(뒷문 앞) · SPOT_rec0~3 · SPOT_window · SPOT_eat · SPOT_lounge
   가구 : Poly Haven (CC0) · 출발 직후의 라운지 대화(시차로 웜홀까지의 거리)는 scenes/s2b_lounge.js
   ============================================================ */
'use strict';
ROOMS.deck=async R=>{ const f=S.flags, me=t=>({kind:'me',t}), V=t=>({who:'VEGA',kind:'vega',t}), X=R.X, sp=R.spots;
  R.objs.forEach(r=>r.traverse(o=>{ if(o.isMesh&&o.material&&/wall_albedo|base_ram|base_door/.test(o.material.name)) o.material.emissiveIntensity=.5; }));
  // 의무실 회복 캡슐 넷 (동면 캡슐과 같은 모델 · 비어 있다)
  const pod=await loadGLB('pod');
  for(let k=0;k<4;k++){ const s=sp['rec'+k]; if(!s) continue; const o=THREE.SkeletonUtils.clone(pod); o.position.set(s.x,0,s.z); o.rotation.y=Math.PI;
    o.traverse(m=>{ if(m.isMesh&&/HumanBody/.test(m.material.name)) m.visible=false; }); R.add(o); LEVEL.solids.push(o);
    if(k%2===0){ const l=new THREE.PointLight(0x6dffb0,.7,3,2); l.position.set(s.x,1.3,s.z); R.add(l); }
    const pk=new THREE.Mesh(new THREE.CylinderGeometry(.55,.55,2,10),PICK); pk.position.set(s.x,1,s.z); WORLD.add(pk);
    interact(pk,'회복 캡슐',()=>TALK.say([V('의무실 회복 캡슐입니다. 지금은 비어 있습니다. 다섯 명 모두 건강합니다.')]),{range:2.6}); }
  // 살펴보기
  const look=(x,z,w,h,name,lines)=>{ const m=new THREE.Mesh(new THREE.BoxGeometry(w,1.6,h),PICK); m.position.set(X(x),.8,z); WORLD.add(m); interact(m,name,()=>TALK.say(lines()),{range:3}); };
  look(-4.7,0,1,6.5,'수경 재배 상자',()=>[V('수경 재배 구역입니다. 선내 산소의 12%와 신선 식품을 맡고 있습니다.'),me('214일 동안 잘 자랐군. 누군가는 물을 줬다는 뜻이다.'),V('자동 급수입니다, 선장님.')]);
  look(.6,-.1,2.8,4.4,'식당 테이블',()=>[me(f.allAwake?'컵 네 개. 마야, 서준, 다니엘… 그리고 오언. 다들 커피부터 마셨군.':'출발 전에 마신 커피잔이 그대로다.')]);
  // 라운지 창 : 창 앞에서 바라보면
  const w=sp.window; TICK.push(()=>{ if(f.deckWin||S.busy||!P.free||!w||SHIP.mode!=='wake') return; if(Math.hypot(P.x-w.x,P.z-w.z)>3.2) return; if(-Math.cos(P.yaw)>-.8) return; f.deckWin=true;
    TALK.say(f.passed?[me('…창밖은 그대로다. 별이 있고, 어둠이 있고. 그런데 집이 없다.')]:[me('라운지 창으로 보니 목성이 더 크다.'),V('목성 표면의 붉은 점 — 대적점은 지구보다 큽니다. 웜홀은 그 오른쪽입니다.')]); });
  // 처음 들어오면
  R.onEnter=()=>{ if(f.deckIn||SHIP.mode!=='wake'||!f.allAwake) return; f.deckIn=true;
    TALK.say([V('거주 구역입니다. 뒤쪽이 의무실, 가운데가 식당, 앞쪽 창가가 라운지입니다.'),V('함교는 중앙 복도 서쪽 끝입니다. 대원들이 먼저 가 있습니다.')]); };
};
