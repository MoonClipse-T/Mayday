/* 시작 : 시작 화면 뒤로 회의실을 미리 불러 둔다 → [임무 시작] 으로 프롤로그. 제작용 바로 가기 : ?s=cryo */
'use strict';
(async function boot(){
  $('#title .how').innerHTML=IS_TOUCH?'왼쪽 끌기 이동 · 오른쪽 끌기 둘러보기 · 사람 · 물건을 눌러 대화 · 조사 · [점프]로 낮은 물건 위에':'W A S D 이동 · 마우스 끌기 둘러보기 · E 또는 클릭 대화 · 조사 · Shift 달리기 · Space 점프 · 대사 넘기기';
  requestAnimationFrame(frame);
  const jump=(location.search.match(/[?&]s=(\w+)/)||[])[1];
  const btn=$('#start');
  try{
    if(jump&&SCENES[jump]){ $('#title').classList.add('off'); document.body.classList.remove('at-title'); await SCENES[jump].enter(); return; }
    // 시작 화면 뒤 : 어두운 회의실을 천천히 둘러본다
    await LEVEL.load('meeting'); await SKY.city(-1.1,.9); const s=LEVEL.spawn; warp(s.x,s.z,s.yaw); P.pitch=-.05;
    TICK.push(dt=>{ if(S.phase==='title') P.yaw+=dt*.02; }); await fade(false,1800);
    btn.disabled=false; btn.textContent='임무 시작';
  }catch(e){ console.error(e); btn.textContent='불러오기 실패 — '+e.message; return; }
  btn.onclick=async()=>{ if(S.phase!=='title') return; AUDIO.init(); AUDIO.beep(); S.phase='cut'; $('#title').classList.add('off'); document.body.classList.remove('at-title'); await go('meeting'); };
})();
