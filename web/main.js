/* 시작 : 시작 화면 뒤로 불 꺼진 하위헌스 1호가 천천히 돈다 → [시작] 으로 구조정 조종석부터 한 흐름 (scenes/game.js)
   제작용 바로 가기 : ?s=cockpit · board · survivor · hunt · engine · bridge */
'use strict';
(async function boot(){
  $('#title .how').innerHTML=IS_TOUCH?'왼쪽 끌기 이동 · 오른쪽 끌기 둘러보기 · [사격] · [웅크림] · 물건을 눌러 조사':'W A S D 이동 · 마우스 끌기 둘러보기 · F 사격 · C 웅크리기 · Shift 달리기 · E 조사';
  requestAnimationFrame(frame);
  const jump=(location.search.match(/[?&]s=(\w+)/)||[])[1];
  const btn=$('#start');
  try{
    if(jump&&GAME.stages.includes(jump)){ toast('점검 · '+jump,2500); $('#title').classList.add('off'); document.body.classList.remove('at-title'); AUDIO.init(); return GAME.jump(jump); }
    // 시작 화면 뒤 : 별 사이에 불 꺼진 1호
    await SKY.space(SHIP.sky()); const h1=await loadGLB('ship_ext'); h1.traverse(o=>{ if(o.isMesh&&o.material.color){ o.material=o.material.clone(); o.material.color.multiplyScalar(.6); if(o.material.emissive) o.material.emissive.setRGB(0,0,0); } });
    h1.position.set(14,-4,-70); h1.rotation.set(.15,.9,.05); WORLD.add(h1); const sun=new THREE.DirectionalLight(0xffd2a0,1.8); sun.position.set(-300,200,-500); WORLD.add(sun, new THREE.HemisphereLight(0x8090a8,0x050608,.2));
    P.x=0; P.z=0; P.eye=0; TICK.push(dt=>{ if(S.phase==='title') h1.rotation.y+=dt*.02; }); await fade(false,1800);
    btn.disabled=false; btn.textContent='시작';
  }catch(e){ console.error(e); btn.textContent='불러오기 실패 — '+e.message; return; }
  btn.onclick=async()=>{ if(S.phase!=='title') return; AUDIO.init(); AUDIO.beep(); S.phase='cut'; $('#title').classList.add('off'); document.body.classList.remove('at-title'); await fade(true,1200); await GAME.jump('cockpit'); };
})();
