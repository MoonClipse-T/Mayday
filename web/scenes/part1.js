/* ============================================================
   MAYDAY 1부 (4.13 · index.html) — 1호를 찾기까지
   ⓪ NASA 브리핑룸 (scenes/s0_meeting.js · 구조 계획) → ① 발사 · 지구 궤도(점검표 · 시차 · 캡슐 암호) · 목성 · 웜홀 (scenes/journey.js · mission.js)
   → ② 건너편에서 직접 몰고 도킹 · 우주복 · 1호의 문을 연다 (scenes/flight.js) → 1부 끝 (2부로 가는 단추)
   2부(1호 안 → 돌아가기)는 scenes/part2.js (atrox.html) — 1호 안 맵은 1부에서 받지 않는다 (디벗 메모리 · 시작이 빨라진다)
   제작용 바로 가기 ?s=meeting · launch · depart · jupiter · cockpit · end
   ============================================================ */
'use strict';
const GAME={part:1, NEXT:'atrox.html',
  stages:['meeting','launch','depart','jupiter','cockpit','end'],
  // 시작 화면 : 어두운 회의실을 천천히 둘러본다
  async title(){ await LEVEL.load('meeting'); await SKY.city(-1.1,.9); const sp=LEVEL.spawn; warp(sp.x,sp.z,sp.yaw); P.pitch=-.05; TICK.push(dt=>{ if(S.phase==='title') P.yaw+=dt*.02; }); },
  begin(){ return go('meeting'); },
  async jump(key){ S.phase='cut'; P.free=false;
    if(key==='meeting') return SCENES.meeting.enter();
    if(key==='cockpit') return this.cockpit();
    if(key==='end') return this.end();
    return this.journey(key); },
  async cockpit(){ await FLIGHT.run(); return this.end(); },
  // 회의 다음 : 발사 → 지구 궤도 출발 → 동면 → 넉 달 뒤 목성 · 웜홀 (scenes/journey.js) → 건너편에서 직접 몰고 도킹 → 1호의 문
  async journey(from='launch'){ await JOURNEY.run(from); await FLIGHT.run({journey:true}); return this.end(); },
  /* ---- 1부 끝 : 1호의 캄캄한 문턱을 넘은 순간, 검은 화면 ----
     헬멧 안 숨소리 → 녹음의 첫 마디 → 멀리서 무언가의 울음 → 자막 → 2부로 가는 단추 */
  async end(){ S.phase='cut'; P.free=false; goal(''); document.body.classList.add('overfade'); fade(true,10); HELMET.on(false); MUSIC.play(null,{fade:2}); stamp('하위헌스 1호 · 에어록','전력 없음');
    const e=document.createElement('div'); e.id='ending';
    e.innerHTML=`<p class="k">Mayday 1부 · 끝</p><h2>1호를 찾았다</h2><p class="s">대원 열두 명. 생명 신호 하나.</p>
      <div class="next"><p>2부</p><h3>Mayday_The Atrox</h3><a class="go" href="${this.NEXT}">2부로 간다</a></div><a class="again" href="./">1부 처음으로</a>`;
    document.body.appendChild(e); await sleep(1200); SFX.play('breath',{vol:.6}); await sleep(1800); AUDIO.radio(3); await TALK.say([{...RADIO('Mayday, Mayday, we are—'),auto:2600}]);
    SFX.play('beast_call',{vol:.5}); await sleep(2600); e.classList.add('on'); AUDIO.tone(55,3,'sine',.08); try{ localStorage.setItem('mayday.part1','done'); }catch(_){} },
};
