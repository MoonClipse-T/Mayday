/* ============================================================
   R-1 출발 점검 (4.11) — 지구 궤도에서 조작을 가볍게 익힌다
   MISSION : 점검표 (화면 왼쪽 종이) — ① 외부 해치 잠금 ② 우주복 상태 ③ 배급기에서 죽 ④ 창가 탁상에서 목성까지의 거리 ⑤ 조종석 · 이온 점화
     ①~④ 는 순서 없이 · 다 하면 ⑤
   PARALLAX : ④ — 2.x 라운지의 '다니엘과 시차 그리기' 그대로 (종이에 그려 시차 · 연주 시차 표시 → 계산기 calc.js)
     다니엘은 휴스턴에서 무전 · 크리스는 창가 바에 앉아 종이에 그린다 (탁상 카메라로 보여 준다)
     과학 : 목성은 반년이면 궤도를 따라 움직여 연주 시차로 바로 잴 수 없다 → 목성 곁에 붙박인 웜홀을 잰다 (= 목성까지의 거리)
       tan p = 1 AU / 5.2 AU → p ≈ 11° = 39,600″ → d = 1/39,600 pc × 206,265 AU ≈ 5.2 AU ≈ 7억 8천만 km ÷ 74 km/s ≈ 122일 (넉 달)
   PODLOCK : 동면 캡슐 — 다니엘이 장난으로 건 영어 네 글자 암호 · VEGA 는 힌트만 (답은 말하지 못한다)
   ============================================================ */
'use strict';
// ★ 캡슐 암호 · VEGA 힌트 — 사용자가 줄 예정 (지금은 임시 값). 힌트는 누를 때마다 다음 것 (끝까지 가면 마지막을 다시)
const PODLOCK_PW={answer:'NASA', hints:['(임시 힌트) 다니엘 기관사가 남긴 힌트는 아직 받지 못했습니다. 네 글자, 영어 대문자입니다.','(임시 힌트) 우리를 이곳에 보낸 곳의 이름입니다.']};

const MISSION={
  ITEMS:[['hatch','외부 해치 잠금 확인','해치 방 · 맨 뒤'],['locker','우주복 상태 확인','해치 방 · 왼쪽 보관함'],['galley','식량 배급기에서 죽을 먹는다','로비'],
    ['ledge','창가 탁상에 앉아 목성까지의 거리를 잰다','로비 · 오른쪽 창'],['seat','조종석으로 — 이온 점화','맨 앞']],
  el:null, left(){ return this.ITEMS.slice(0,4).filter(([id])=>!this.done.has(id)).length; },
  show(){ this.done=new Set(); let e=this.el=$('#mission'); if(!e){ e=this.el=document.createElement('div'); e.id='mission'; document.body.appendChild(e); }
    e.innerHTML='<p class="hd">R-1 출발 점검표</p><ol>'+this.ITEMS.map(([id,t,w],i)=>`<li data-id="${id}"${i===4?' class="last"':''}><b>${i+1}</b><span>${t}<small>${w}</small></span></li>`).join('')+'</ol>';
    requestAnimationFrame(()=>e.classList.add('on')); },
  check(id){ this.done.add(id); const li=this.el&&this.el.querySelector(`[data-id="${id}"]`); if(li) li.classList.add('ok'); AUDIO.tone(660,.08,'sine',.05); AUDIO.tone(990,.12,'sine',.05,.08);
    if(this.left()===0&&this.el) this.el.querySelector('.last').classList.add('now'); },
  hide(){ if(this.el) this.el.classList.remove('on'); },
  goal(){ const n=this.left(); goal(n?`점검표 — 남은 ${n}개 (순서 상관없음) · `+byDevice('W A S D 이동 · E 조사','왼쪽 끌기 이동 · 물건을 눌러 조사'):''); },

  // ①~④ : 자리마다 기다렸다가 그 자리의 점검 → 표에 체크 (한 번에 하나씩 — 하는 동안 다른 자리는 잠근다)
  async run(J){ this.show(); this.goal();
    await Promise.all(this.ITEMS.slice(0,4).map(([id])=>R1.task(id).then(async()=>{ R1.lock=true; P.free=false; goal('');
      try{ await this.ACT[id](J); } finally{ R1.lock=false; P.free=true; } this.check(id); this.goal(); }))); },
  ACT:{
    async hatch(J){ AUDIO.tone(520,.1,'square',.04); AUDIO.tone(780,.12,'square',.04,.12); await TALK.say([J.V('외부 해치 잠금 정상. 기압 정상. 바깥은 진공입니다.')]); },
    async locker(J){ SFX.play('locker_open',{vol:.6});
      await doc('EVA 우주복 점검','<p><b>헬멧</b> — 밀폐 고리 이상 없음 · 김서림 방지 정상</p><p><b>산소통 A</b> — 100 % · <b>산소통 B</b> — 98 %</p><p><b>장갑 · 관절</b> — 누출 없음</p><p><b>배터리</b> — 9시간 · 무전기 정상</p><p class="dim">— 가슴판 : R-1 · 1인 승무원</p>','해치 방 · 우주복 보관함');
      await TALK.say([J.C('…이상 없다. 1호에 닿으면 이걸 입고 건너간다.'),J.V('우주복 상태 양호. 점검표에 기록합니다.')]); },
    async galley(J){ AUDIO.tone(880,.08,'sine',.05); AUDIO.noise(1.4,.05,.1,700);
      await TALK.say([J.C('…데운 단백질 죽. 지구에서의 마지막 식사가 이거라니.'),J.V('동면에 들면 넉 달 동안 먹지 못합니다. 잘 드셨습니다.')]); },
    ledge(J){ return PARALLAX.run(J); } } };

/* ---- ④ 창가 탁상 : 종이에 시차 · 연주 시차를 그린다 → 계산기 (2.x 라운지와 같은 판정 · 그림) ---- */
const PARALLAX={P_DEG:11, P_SEC:39600,
  async run(J){ const {C,V}=J, DN=t=>({who:'다니엘',ch:'무전 · 휴스턴',kind:'radio',t,auto:Math.max(1800,t.length*95+800)}), g3=R1.g;
    // 창가 바 윗면 (R-1 안 좌표 : 바 윗면 y 1.031 · x 1.05~1.38) — 종이는 A3 쯤, 윗변이 창 쪽(+x)
    const top=1.031, tbl={x:1.215,z:-6.65}, PW=.42, PH=.297, CW=1188, CH=840;
    if(R1.paper) R1.paper.forEach(o=>o.parent&&o.parent.remove(o));
    const cv=document.createElement('canvas'); cv.width=CW; cv.height=CH; const g=cv.getContext('2d');
    const tex=new THREE.CanvasTexture(cv); tex.encoding=THREE.sRGBEncoding; tex.anisotropy=8;
    const paper=new THREE.Mesh(new THREE.PlaneGeometry(PW,PH),new THREE.MeshStandardMaterial({map:tex,roughness:.9}));
    paper.rotation.set(-Math.PI/2,0,-Math.PI/2+.03); paper.position.set(tbl.x,top+.008,tbl.z); g3.add(paper);
    const pen=new THREE.Mesh(new THREE.CylinderGeometry(.004,.004,.14,8),new THREE.MeshStandardMaterial({color:0x223344,metalness:.3})); pen.rotation.set(Math.PI/2,0,.4); pen.position.set(tbl.x-.05,top+.006,tbl.z+.27); g3.add(pen);
    const lamp=new THREE.PointLight(0xfff1dc,.9,1.6,2); lamp.position.set(tbl.x-.15,top+.55,tbl.z); g3.add(lamp);
    R1.paper=[paper,pen,lamp];
    // 종이 위 점 (px) : 아래 = 태양 · 지구 공전 궤도, 가운데 = 가까운 천체(★), 위 = 먼 배경 (먼 별들)
    const WALL=110, Sun={x:594,y:700}, E1={x:364,y:700}, E2={x:824,y:700}, Star={x:594,y:360}, done=[];
    const hand=(s,w=500)=>`${w} ${s}px "Nanum Pen Script","Segoe Print","Comic Sans MS","Malgun Gothic",sans-serif`;
    const line=(a,b,w=4,c='#2a2f3a')=>{ g.strokeStyle=c; g.lineWidth=w; g.lineCap='round'; g.beginPath(); g.moveTo(a.x,a.y); g.lineTo(b.x,b.y); g.stroke(); };
    const dot=(p,r,c)=>{ g.fillStyle=c; g.beginPath(); g.arc(p.x,p.y,r,0,7); g.fill(); };
    const label=(t,x,y,s=34,c='#2a2f3a',al='center')=>{ g.fillStyle=c; g.font=hand(Math.round(s*1.35)); g.textAlign=al; g.textBaseline='middle'; g.fillText(t,x,y); };
    const ext=(a,b,y)=>({x:a.x+(b.x-a.x)*(y-a.y)/(b.y-a.y),y});          // a→b 를 높이 y 까지 늘인 점
    const bg=[...Array(26)].map((_,i)=>({x:110+i*37+((i*53)%17),y:WALL-24-((i*31)%30),r:2+(i*7)%3}));
    function base(){ g.fillStyle='#f4f1ea'; g.fillRect(0,0,CW,CH);
      for(let i=0;i<1400;i++){ g.fillStyle=`rgba(120,110,90,${(i*37%100)/2500})`; g.fillRect((i*733)%CW,(i*389)%CH,2,2); }
      g.strokeStyle='#8a8f99'; g.lineWidth=3; g.setLineDash([14,10]); g.beginPath(); g.moveTo(90,WALL); g.lineTo(CW-90,WALL); g.stroke(); g.setLineDash([]);
      bg.forEach(p=>dot(p,p.r,'#9aa0aa')); label('먼 별들 (배경)',CW-96,WALL+36,38,'#6a707a','right');
      g.setLineDash([10,12]); g.strokeStyle='rgba(60,70,90,.35)'; g.lineWidth=2; g.beginPath(); g.ellipse(Sun.x,Sun.y,E2.x-Sun.x,52,0,0,7); g.stroke(); g.setLineDash([]);
      dot(Sun,26,'#e0a030'); label('태양',Sun.x,Sun.y+66,46);
      dot(E1,15,'#3a78c8'); label('1월 지구',E1.x,E1.y+62,44); dot(E2,15,'#3a78c8'); label('7월 지구',E2.x,E2.y+62,44);
      g.fillStyle='#c8382a'; g.font='600 84px sans-serif'; g.textAlign='center'; g.textBaseline='middle'; g.fillText('★',Star.x,Star.y); label('가까운 천체',Star.x+60,Star.y-48,44,'#2a2f3a','left');
      done.forEach(f=>f()); tex.needsUpdate=true; }
    base(); if(document.fonts) document.fonts.load(hand(60)).then(base,()=>{});      // 손글씨 글꼴이 늦게 오면 다시 그린다
    // 그리기 : 종이 위 좌표 ← 화면 좌표 (레이캐스트 → UV)
    const rc=new THREE.Raycaster(), toPaper=e=>{ rc.setFromCamera(new THREE.Vector2(e.clientX/innerWidth*2-1,-(e.clientY/innerHeight)*2+1),camera); const h=rc.intersectObject(paper)[0]; return h?{x:h.uv.x*CW,y:(1-h.uv.y)*CH}:null; };
    const near=(a,b,r)=>Math.hypot(a.x-b.x,a.y-b.y)<r, passes=(s,p,r)=>s.some(q=>near(q,p,r));
    let stroke=null, want=null, miss=0;
    const cvs=$('#c'), down=e=>{ if(!want) return; const p=toPaper(e); if(!p) return; stroke=[p]; }, move=e=>{ if(!stroke) return; const p=toPaper(e); if(!p) return; const q=stroke[stroke.length-1]; stroke.push(p); line(q,p,7,'#4a5060'); tex.needsUpdate=true; },
      up=()=>{ if(!stroke) return; const s=stroke; stroke=null; const ok=want.check(s);
        if(ok){ AUDIO.tone(880,.12,'sine',.08); AUDIO.tone(1320,.16,'sine',.07,.1); done.push(ok===true?want.draw:ok); base(); miss=0; if(want.more&&want.more()) return; const r=want.res; want=null; r(); }
        else { AUDIO.tone(220,.18,'square',.04); base(); miss++; if(miss>=2) toast(want.hint,3200); } };
    const step=(text,hint,check,draw,more)=>new Promise(res=>{ goal(text); miss=0; want={hint,check,draw,res,more}; });
    this._t={E1,E2,Sun,Star,WALL,ext,paper,CW,CH};                    // 시험용

    // ---- 창가 바 의자에 앉는다 → 다니엘 무전 ----
    S.phase='cut'; const s=R1.spots.ledge||{x:.55,z:-6.65};
    await camTo({x:s.x+.08,z:tbl.z,yaw:-Math.PI/2,pitch:-.35,eye:1.38},1.0); SFX.play('cloth',{vol:.4}); S.phase='play';
    await TALK.say([C('…창가 탁상. 종이 한 장과 펜. 창 아래로 지구가 돈다.'),
      DN('R-1, 휴스턴 다니엘. 크리스, 점검표 넷째 줄 봤어요? 목성까지의 거리 — 그거 제가 넣었어요.'),
      DN('근데 솔직히… 거기까지 거리를 어떻게 재요? 줄자를 댈 수도 없고.'),
      C('시차를 이용하면 구할 수 있어.'),
      DN('시차요? 그게 뭔데요?'),
      C('그려서 보여 줄게. 탁상 카메라 켤게.'),
      DN('보여요. 태양 · 지구 둘 · 별 하나.')]);
    const prevDrag=window.dragHook; window.dragHook=()=>{}; S.phase='cut'; MISSION.el&&MISSION.el.classList.remove('on');      // 종이를 가리지 않게
    // 종이를 화면 가득 : 위에서 내려다본다 (세로 화면이면 더 멀리서)
    const tf=Math.tan(THREE.MathUtils.degToRad(camera.fov/2)), fit=Math.max((PH/2+.02)/tf,(PW/2+.02)/(tf*camera.aspect));
    await camTo({x:tbl.x-.012,z:tbl.z,yaw:-Math.PI/2,pitch:-1.54,eye:top+fit},1.4); S.phase='play';
    cvs.addEventListener('pointerdown',down); addEventListener('pointermove',move); addEventListener('pointerup',up);
    // 목표는 하나 — 무엇을 어떤 순서로 그릴지는 학생이 정한다. 두 번 틀리면 그때 빠진 것을 짧게 알려 준다
    const got={E1:false,E2:false,S:false,p:false};
    const aS=Math.atan2(Sun.y-Star.y,Sun.x-Star.x), aE=Math.atan2(E1.y-Star.y,E1.x-Star.x);
    const h1=ext(E1,Star,WALL), h2=ext(E2,Star,WALL);
    const mark={
      E:k=>{ const e=k==='E1'?E1:E2, hit=ext(e,Star,WALL); return ()=>{ line(e,hit,6,'#3a78c8'); dot(hit,13,'#3a78c8'); label(k==='E1'?'1월':'7월',hit.x,WALL-50,40,'#3a78c8'); }; },
      par:()=>{ line({x:h2.x,y:WALL+18},{x:h1.x,y:WALL+18},7,'#c8382a'); label('시차',(h1.x+h2.x)/2,WALL+62,50,'#c8382a'); },
      S:()=>{ line(Sun,Star,6,'#2a2f3a'); label('1 AU',(E1.x+Sun.x)/2,Sun.y-34,40,'#3a78c8'); label('d',Sun.x+20,(Sun.y+Star.y)/2+70,52,'#c8382a','left'); },
      p:()=>{ g.strokeStyle='#c8382a'; g.lineWidth=7; g.beginPath(); g.arc(Star.x,Star.y,120,Math.min(aS,aE),Math.max(aS,aE)); g.stroke(); const m=(aS+aE)/2; label('p · 연주 시차',Star.x+Math.cos(m)*170,Star.y+Math.sin(m)*170,46,'#c8382a','right'); } };
    const hintNow=()=>!(got.E1&&got.E2)?'시차 : 지구에서 ★ 를 지나 배경까지':!got.S?'연주 시차 : 태양과 ★ 도 이어 보자':'연주 시차 : ★ 꼭짓점의 각을 눌러 표시';
    await step('시차와 연주 시차를 그림에 표시해 보자','',s=>{ const a=s[0], b=s[s.length-1];
        for(const k of ['E1','E2']){ const e=k==='E1'?E1:E2; if(got[k]) continue; const st=near(a,e,90)?a:near(b,e,90)?b:null; if(!st) continue; const en=st===a?b:a;
          if(passes(s,Star,75)&&en.y<WALL+110){ got[k]=true; const m=mark.E(k); return got.E1&&got.E2?()=>{ m(); mark.par(); }:m; } }
        if(!got.S&&((near(a,Sun,85)&&near(b,Star,85))||(near(b,Sun,85)&&near(a,Star,85)))){ got.S=true; return mark.S; }
        if(!got.p&&got.S&&(got.E1||got.E2)){ const r=Math.hypot(b.x-Star.x,b.y-Star.y), an=Math.atan2(b.y-Star.y,b.x-Star.x);
          if(r>35&&r<280&&an>Math.min(aS,aE)-.12&&an<Math.max(aS,aE)+.12){ got.p=true; return mark.p; } }
        want.hint=hintNow(); return false; },null,()=>!(got.E1&&got.E2&&got.S&&got.p));
    done.push(()=>{ label('p = 1″ 이면 d = 1 pc',CW-50,420,36,'#c8382a','right'); label('거리(pc) = 1 ÷ p(″)',CW-50,495,46,'#2a2f3a','right'); }); base();
    removeEventListener('pointermove',move); removeEventListener('pointerup',up); cvs.removeEventListener('pointerdown',down);
    goal(''); await sleep(1600);
    S.phase='cut'; await camTo({x:s.x+.08,z:tbl.z,yaw:-Math.PI/2,pitch:-.45,eye:1.38},1.2); window.dragHook=prevDrag; MISSION.el&&MISSION.el.classList.add('on'); S.phase='play';
    await TALK.say([C('연주 시차가 1초(1″)일 때의 거리가 1 파섹, 1 pc. 그래서 거리(pc) = 1 ÷ 연주 시차(″).'),
      DN('그럼 목성은요? 목성도 반년 간격으로 재면 돼요?'),
      C('목성은 반년이면 제 궤도를 따라 꽤 움직여 버려. 그래서 목성 바로 곁에 꼼짝 않고 떠 있는 웜홀을 쟀지.'),
      C('반년 간격으로 잰 웜홀의 연주 시차가 약 '+this.P_DEG+'°.'),
      DN('그럼 몇 pc 예요? 계산기 띄울게요.')]);
    await this.quiz();
    await TALK.say([V('계산을 확인합니다. 1/39,600 pc — 1 pc 는 약 20만 6천 AU 이므로 약 5.2 AU. 태양에서 약 7억 8천만 km 입니다.'),
      V('R-1 의 비행 경로도 약 7억 8천만 km. 이온 엔진 평균 초속 74 km 로 약 1,050만 초 — 122일, 넉 달입니다.'),
      DN('넉 달! 그래서 넉 달이었구나. …점검표 마지막 줄 남았죠? 이온 점화.'),
      C('고마워, 다니엘. 종이는 여기 두고 갈게.')]);
    S.phase='cut'; await camTo({x:s.x-.1,z:tbl.z,yaw:-Math.PI/2,pitch:0,eye:1.66},.8); S.phase='play'; },

  // 계산 : 거리(pc) = 1 ÷ [p″] = [d]  — 칸은 옆 계산기로만 채운다 (calc.js). ① 11° → 초 ② 1 ÷ p
  quiz(){ const D=this.P_DEG, P=this.P_SEC, d=1/P;
    return calcQuiz({order:['p','d'],
      work:`<p class="hd">연주 시차로 목성(웜홀)까지의 거리 구하기</p><p class="q">웜홀의 연주 시차 p ≈ ${D}°</p>
        <div class="eq"><span class="lhs">거리 <b>d</b><small>pc</small></span><span class="op">=</span><span class="frac"><span class="num">1</span><span class="den"><input class="bx" data-k="p" aria-label="연주 시차 (초)"><em>″</em></span></span>
          <span class="op">=</span><input class="bx" data-k="d" aria-label="거리 (pc)"></div>`,
      check:(k,v,n)=>k==='p'?(v===P?{ok:'맞아요 — '+D+'° = '+P.toLocaleString()+'″. 이제 1 ÷ p'}
          :{no:v===D?'칸은 초(″) 단위예요. 도(°)로 넣으면 안 돼요':n<2?'다시 — 도(°)를 초(″)로':`1° = 60′ = 3600″ 이니까, ${D}° 는?`})
        :Math.abs(v-d)/d<.02?{ok:'정답 — d ≈ '+numStr(d)+' pc'}
          :{no:Math.abs(v-1/D)/(1/D)<.02?'p 는 초(″)로 바꾼 값으로 나눠야 해요':v===P?'거리는 1 ÷ p 예요':n<2?'다시 — 1 ÷ '+P.toLocaleString():'계산기에서 1 ÷ '+P+' = 을 눌러 보자'} }); },
};

/* ---- 동면 캡슐 잠금 : 영어 네 글자 · [VEGA 힌트] (답은 못 말한다) ---- */
const PODLOCK={
  run(J){ const {answer,hints}=PODLOCK_PW, A=answer.toUpperCase(); let hi=0, told=false;
    return new Promise(res=>{ const q=document.createElement('div'); q.id='podlock';
      q.innerHTML=`<p class="hd">동면 캡슐 · 잠금</p><p class="note">“선배, 그냥 자면 재미없잖아요 :) — 다니엘”</p>
        <div class="slots">${'<i></i>'.repeat(4)}</div><p class="msg"></p>
        <div class="kb">${'QWERTYUIOPASDFGHJKLZXCVBNM'.split('').map(c=>`<button data-c="${c}">${c}</button>`).join('')}<button data-c="⌫" class="w">⌫</button></div>
        <div class="row"><button class="hint">VEGA 에게 힌트</button><button class="ok">확인</button></div>`;
      document.body.appendChild(q); requestAnimationFrame(()=>q.classList.add('on'));
      let s=''; const slots=[...q.querySelectorAll('.slots i')], msg=q.querySelector('.msg'), draw=()=>slots.forEach((e,i)=>e.textContent=s[i]||'');
      const key=c=>{ AUDIO.tick(); if(c==='⌫') s=s.slice(0,-1); else if(s.length<4) s+=c; q.classList.remove('bad'); msg.textContent=''; draw(); };
      const ok=()=>{ if(s.length<4){ msg.textContent='네 글자를 넣자'; return; }
        if(s===A){ AUDIO.tone(880,.12,'sine',.08); AUDIO.tone(1320,.2,'sine',.07,.1); q.classList.add('good'); msg.textContent='잠금 해제'; removeEventListener('keydown',kb,true); setTimeout(()=>{ q.remove(); res(); },1100); return; }
        AUDIO.tone(180,.25,'square',.05); q.classList.add('bad'); msg.textContent='암호가 틀렸습니다'; s=''; setTimeout(draw,350); };
      const hint=async()=>{ if(TALK.on) return; const h=hints[Math.min(hi,hints.length-1)]; hi++;
        const L=[J.V(h)]; if(!told){ told=true; L.push(J.V('답은 말씀드릴 수 없습니다. 다니엘 기관사가 그 부분만 제 발화 권한을 막아 두었습니다.')); } await TALK.say(L); };
      q.querySelectorAll('.kb button').forEach(b=>b.onclick=()=>key(b.dataset.c)); q.querySelector('.ok').onclick=ok; q.querySelector('.hint').onclick=hint;
      const kb=e=>{ if(TALK.on) return; const k=e.key.length===1&&/[a-z]/i.test(e.key)?e.key.toUpperCase():e.key==='Backspace'?'⌫':e.key==='Enter'?'ok':null; if(!k) return; e.preventDefault(); e.stopPropagation(); k==='ok'?ok():key(k); };
      addEventListener('keydown',kb,true); }); },
};
