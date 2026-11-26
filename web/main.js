/* 시작 : 시작 화면 뒤의 장면(GAME.title) → 단추 → GAME.begin
   1부 index.html = scenes/part1.js (회의 → 여정 → 1호를 찾기) · 2부 atrox.html = scenes/part2.js (도킹 → 1호 안 → 돌아가기)
   제작용 바로 가기 ?s=<장면> — 다른 부의 장면이면 그 부의 파일로 넘어간다
   단축키 Ctrl + 숫자 : 장소별로 (SPOTS · 1부 1~6 · 2부 7~0) 어디서든 그 장소를 처음부터 다시 연다 */
'use strict';
// 수업에서 학생이 쓰지 못하게 하려면 DEBUG_KEYS 를 false 로
const DEBUG_KEYS=true, SPOTS=[['Digit1',1,'depart','지구 궤도'],['Digit2',1,'jupiter','목성 앞'],['Digit3',1,'seek','웜홀 이후'],['Digit4',1,'holo','로비 홀로그램 — 1호 찾기'],['Digit5',1,'belt','소행성 지대'],['Digit6',1,'site','선체 밖'],
  ['Digit7',2,'cockpit','1호 도킹'],['Digit8',2,'board','1호 에어록 → 동면 구역'],['Digit9',2,'engine','기관실'],['Digit0',2,'bridge','기관실 → 함교 (성체)']];
// 4.22 : Shift 는 달리기 키라 달리며 숫자를 누르면 장면이 넘어갔다 → Ctrl (크롬의 Ctrl+숫자 탭 이동 · Ctrl+0 확대 되돌리기는 막는다 · 계산기 숫자 입력보다 먼저 받는다)
if(DEBUG_KEYS) addEventListener('keydown',e=>{ if(!e.ctrlKey||e.repeat||e.shiftKey||e.altKey||e.metaKey) return; const k=SPOTS.find(k=>k[0]===e.code); if(!k) return; e.preventDefault(); e.stopPropagation();
  const q=new URLSearchParams(location.search); q.set('s',k[2]); location.href=(k[1]===1?'index.html':'atrox.html')+'?'+q; },true);
(async function boot(){
  const ONE=GAME.part===1;
  $('#title .how').innerHTML=ONE?(IS_TOUCH?'왼쪽 끌기 이동 · 오른쪽 끌기 둘러보기 · 물건을 눌러 조사':'W A S D 이동 · 마우스 끌기 둘러보기 · Shift 달리기 · E 조사')
    :(IS_TOUCH?'왼쪽 끌기 이동 · 오른쪽 끌기 둘러보기 · [사격] · [웅크림] · 물건을 눌러 조사 · 숨기':'W A S D 이동 · 마우스 끌기 둘러보기 · F 사격 · C 웅크리기 · Shift 달리기 · E 조사 · 숨기');
  requestAnimationFrame(frame);
  const jump=(location.search.match(/[?&]s=(\w+)/)||[])[1], OTHER=ONE?['cockpit','board','survivor','hunt','engine','bridge','stalk']:['meeting','launch','depart','jupiter','seek','holo','warp','belt','crash','eva','site','found','end'];
  if(OTHER.includes(jump)) return location.replace((ONE?'atrox.html':'index.html')+location.search);
  const btn=$('#start'), go1=btn.dataset.go||'시작';
  try{
    if(jump&&GAME.stages.includes(jump)){ toast('점검 · '+((SPOTS.find(k=>k[2]===jump)||[])[3]||jump),2500); $('#title').classList.add('off'); document.body.classList.remove('at-title'); AUDIO.init(); return GAME.jump(jump); }
    // 불러오는 만큼 단추에 
    const bar=$('#loading .bar i'), iv=setInterval(()=>{ const w=parseInt(bar.style.width)||0; if(w) btn.textContent='불러오는 중 '+w+' %'; },300);
    await GAME.title(); clearInterval(iv); await fade(false,1800);
    btn.disabled=false; btn.textContent=go1;
  }catch(e){ console.error(e); btn.textContent='불러오기 실패 — '+e.message; return; }
  btn.onclick=async()=>{ if(S.phase!=='title') return; AUDIO.init(); AUDIO.beep(); S.phase='cut'; $('#title').classList.add('off'); document.body.classList.remove('at-title'); await GAME.begin(); };
})();
