/* 시작 : 시작 화면 뒤의 장면(GAME.title) → 단추 → GAME.begin
   1부 index.html = scenes/part1.js (회의 → 여정 → 도킹) · 2부 thirteenth.html = scenes/part2.js (1호 안 → 돌아가기)
   제작용 바로 가기 ?s=<장면> — 다른 부의 장면이면 그 부의 파일로 넘어간다 */
'use strict';
(async function boot(){
  const ONE=GAME.part===1;
  $('#title .how').innerHTML=ONE?(IS_TOUCH?'왼쪽 끌기 이동 · 오른쪽 끌기 둘러보기 · 물건을 눌러 조사':'W A S D 이동 · 마우스 끌기 둘러보기 · Shift 달리기 · E 조사')
    :(IS_TOUCH?'왼쪽 끌기 이동 · 오른쪽 끌기 둘러보기 · [사격] · [웅크림] · 물건을 눌러 조사 · 숨기':'W A S D 이동 · 마우스 끌기 둘러보기 · F 사격 · C 웅크리기 · Shift 달리기 · E 조사 · 숨기');
  requestAnimationFrame(frame);
  const jump=(location.search.match(/[?&]s=(\w+)/)||[])[1], OTHER=ONE?['board','survivor','hunt','engine','bridge','stalk']:['meeting','launch','depart','jupiter','cockpit','end'];
  if(OTHER.includes(jump)) return location.replace((ONE?'thirteenth.html':'index.html')+location.search);
  const btn=$('#start'), go1=btn.dataset.go||'시작';
  try{
    if(jump&&GAME.stages.includes(jump)){ toast('점검 · '+jump,2500); $('#title').classList.add('off'); document.body.classList.remove('at-title'); AUDIO.init(); return GAME.jump(jump); }
    // 불러오는 만큼 단추에 (2부는 1호를 통째로 불러온다)
    const bar=$('#loading .bar i'), iv=setInterval(()=>{ const w=parseInt(bar.style.width)||0; if(w) btn.textContent='불러오는 중 '+w+' %'; },300);
    await GAME.title(); clearInterval(iv); await fade(false,1800);
    btn.disabled=false; btn.textContent=go1;
  }catch(e){ console.error(e); btn.textContent='불러오기 실패 — '+e.message; return; }
  btn.onclick=async()=>{ if(S.phase!=='title') return; AUDIO.init(); AUDIO.beep(); S.phase='cut'; $('#title').classList.add('off'); document.body.classList.remove('at-title'); await GAME.begin(); };
})();
