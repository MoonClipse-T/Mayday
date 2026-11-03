/* 시작 : 시작 화면 뒤로 어두운 회의실이 천천히 돈다 → [임무 시작] 으로 NASA 브리핑(scenes/s0_meeting.js) → 넉 달 뒤 구조정 조종석부터 한 흐름 (scenes/game.js)
   제작용 바로 가기 : ?s=meeting · cockpit · board · survivor · hunt · engine · bridge */
'use strict';
(async function boot(){
  $('#title .how').innerHTML=IS_TOUCH?'왼쪽 끌기 이동 · 오른쪽 끌기 둘러보기 · [사격] · [웅크림] · 물건을 눌러 조사':'W A S D 이동 · 마우스 끌기 둘러보기 · F 사격 · C 웅크리기 · Shift 달리기 · E 조사';
  requestAnimationFrame(frame);
  const jump=(location.search.match(/[?&]s=(\w+)/)||[])[1];
  const btn=$('#start');
  try{
    if(jump&&GAME.stages.includes(jump)){ toast('점검 · '+jump,2500); $('#title').classList.add('off'); document.body.classList.remove('at-title'); AUDIO.init(); return GAME.jump(jump); }
    // 시작 화면 뒤 : 어두운 회의실을 천천히 둘러본다
    await LEVEL.load('meeting'); await SKY.city(-1.1,.9); const sp=LEVEL.spawn; warp(sp.x,sp.z,sp.yaw); P.pitch=-.05;
    TICK.push(dt=>{ if(S.phase==='title') P.yaw+=dt*.02; }); await fade(false,1800);
    btn.disabled=false; btn.textContent='임무 시작';
  }catch(e){ console.error(e); btn.textContent='불러오기 실패 — '+e.message; return; }
  btn.onclick=async()=>{ if(S.phase!=='title') return; AUDIO.init(); AUDIO.beep(); S.phase='cut'; $('#title').classList.add('off'); document.body.classList.remove('at-title'); await go('meeting'); };
})();
