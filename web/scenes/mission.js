/* ============================================================
   R-1 출발 점검 (4.11 · 4.14 손으로 하는 점검) — 지구 궤도에서 조작을 가볍게 익힌다
   MISSION : 점검표 (화면 왼쪽 종이) — ① 외부 해치 핸들을 LOCK 쪽으로 끝까지 ② 우주복 보관함(비밀번호 = AI 이름) → 전자 점검표 ③ 배급기에서 죽 ④ 창가 탁상에서 웜홀까지의 거리 ⑤ 조종석 · 이온 점화
     ①~④ 는 순서 없이 · 다 하면 ⑤ · 손으로 하는 일은 scenes/doing.js (손 = scenes/hands.js)
   PARALLAX : ④ — 혼잣말로 계산하고 VEGA 가 받아친다 (4.14 : 다니엘 무전 → VEGA). 종이에 시차 · 연주 시차를 스스로 표시 → 계산기 calc.js
     과학 : 연주 시차로 재는 것은 붙박인 웜홀 (목성 궤도 근처 · 목성은 반년이면 궤도를 따라 움직여 시차로 재지 않는다) — 도착할 무렵 목성이 마침 웜홀 곁에 온다
       tan p = 1 AU / 5.2 AU → p ≈ 11° = 39,600″ → d = 1/39,600 pc × 206,265 AU ≈ 5.2 AU ≈ 7억 8천만 km ÷ 74 km/s ≈ 122일 (넉 달)
   PODLOCK : 동면 캡슐 — 다니엘이 장난으로 건 암호 (동물 이름을 영어로 → 글자마다 그 수만큼 뒤 · 앞 글자)
     늑대 WOLF+1=XPMG · 사자 LION−2=JGML · 곰 BEAR+3=EHDU · 나사 NASA−4=JWOW (A 앞은 Z 로 이어진다)
   ============================================================ */
'use strict';
const PODLOCK_PW={answer:'JWOW', lines:[['늑대 + 1','XPMG'],['사자 − 2','JGML'],['곰 + 3','EHDU'],['나사 − 4','?']]};

const MISSION={
  ITEMS:[['hatch','외부 해치를 끝까지 잠근다','해치 방 · 맨 뒤'],['locker','우주복 점검','해치 방 · 왼쪽 보관함'],['galley','식량 배급기에서 죽을 먹는다','로비'],
    ['ledge','창가 탁상에서 웜홀까지의 거리를 잰다','로비 · 오른쪽 창'],['seat','조종석으로 — 이온 점화','맨 앞']],
  el:null, left(){ return this.ITEMS.slice(0,4).filter(([id])=>!this.done.has(id)).length; },
  show(){ this.open=true; DO.setLock(false,.2); this.done=new Set(); let e=this.el=$('#mission'); if(!e){ e=this.el=document.createElement('div'); e.id='mission'; document.body.appendChild(e); }
    e.innerHTML='<p class="hd">R-1 출발 점검표</p><ol>'+this.ITEMS.map(([id,t,w],i)=>`<li data-id="${id}"${i===4?' class="last"':''}><b>${i+1}</b><span>${t}<small>${w}</small></span></li>`).join('')+'</ol>';
    requestAnimationFrame(()=>e.classList.add('on')); },
  check(id){ this.done.add(id); const li=this.el&&this.el.querySelector(`[data-id="${id}"]`); if(li) li.classList.add('ok'); AUDIO.tone(660,.08,'sine',.05); AUDIO.tone(990,.12,'sine',.05,.08);
    if(this.left()===0&&this.el) this.el.querySelector('.last').classList.add('now'); },
  hide(){ this.open=false; if(this.el) this.el.classList.remove('on'); },
  goal(){ const n=this.left(); goal(n?`점검표 — 남은 ${n}개 (순서 상관없음) · `+byDevice('W A S D 이동 · E 조사','왼쪽 끌기 이동 · 물건을 눌러 조사'):''); },

  // ①~④ : 자리마다 기다렸다가 그 자리의 점검 → 표에 체크 (한 번에 하나씩 — 하는 동안 다른 자리는 잠근다)
  async run(J){ this.show(); this.goal();
    await Promise.all(this.ITEMS.slice(0,4).map(([id])=>R1.task(id).then(async()=>{ R1.lock=true; P.free=false; goal('');
      try{ await this.ACT[id](J); } finally{ R1.lock=false; P.free=true; } this.check(id); this.goal(); }))); },
  ACT:{
    async hatch(J){ await DO.wheel(1,1.5); await TALK.say([J.V('외부 해치 보조 잠금 100 퍼센트. 기압 정상. 바깥은 진공입니다.')]); },
    locker(J){ return DO.locker(J); },
    async galley(J){ await DO.eat(); await TALK.say([J.C('…데운 단백질 죽. 지구에서의 마지막 식사가 이거라니.'),J.V('동면에 들면 넉 달 동안 먹지 못합니다. 잘 드셨습니다.')]); },
    ledge(J){ return PARALLAX.run(J); } } };

/* ---- ④ 창가 탁상 : 종이에 시차 · 연주 시차를 그린다 → 계산기 (2.x 라운지와 같은 판정 · 그림) ---- */
const PARALLAX={P_DEG:11, P_SEC:39600,
  async run(J){ const {C,V}=J, g3=R1.g, x0=P.x, z0=P.z;
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
    const cvs=$('#c'), down=e=>{ if(!want||TALK.on) return; const p=toPaper(e); if(!p) return; stroke=[p]; }, move=e=>{ if(!stroke) return; const p=toPaper(e); if(!p) return; const q=stroke[stroke.length-1]; stroke.push(p); line(q,p,7,'#4a5060'); tex.needsUpdate=true; },
      up=()=>{ if(!stroke) return; const s=stroke; stroke=null; const ok=want.check(s);
        if(ok){ AUDIO.tone(880,.12,'sine',.08); AUDIO.tone(1320,.16,'sine',.07,.1); done.push(ok); base(); miss=0; tk.hint(''); tk.set(); if(want.more()) return; const r=want.res; want=null; r(); }
        else { AUDIO.tone(220,.18,'square',.04); base(); miss++; tk.hint(miss>=2?want.hint:'다시 그려 보자'); } };
    this._t={E1,E2,Sun,Star,WALL,ext,paper,CW,CH};                    // 시험용

    // ---- 창가 바 의자에 앉는다 → 혼잣말 · VEGA ----
    S.phase='cut'; const s=R1.spots.ledge||{x:.55,z:-6.65}; P.y=0; P.pinY=true;      // 탁자 위에서는 높이를 고정 (엔진이 탁자 윗면을 바닥으로 잡지 않게)
    await camTo({x:s.x+.08,z:tbl.z,yaw:-Math.PI/2,pitch:-.35,eye:1.38},1.0); SFX.play('cloth',{vol:.4}); S.phase='play';
    await TALK.say([C('…종이 한 장과 펜. 창 아래로 지구가 돈다.'),
      C('넉 달이라. …웜홀까지 얼마나 먼지, 직접 한번 계산해 볼까.'),
      V('웜홀까지의 거리는 항법 컴퓨터에 있습니다. 5점—'),
      C('쉿. 말하지 마. 내가 구할 거야.'),
      V('…알겠습니다. 기다리겠습니다.'),
      C('반년 간격으로 보면, 가까운 것은 먼 별들 앞에서 자리가 어긋나 보인다. 그게 시차.')]);
    const prevDrag=window.dragHook; window.dragHook=()=>{}; S.phase='cut'; MISSION.el&&MISSION.el.classList.remove('on');      // 종이를 가리지 않게
    // 종이를 화면 가득 : 위에서 내려다본다 · 왼쪽에 할 일 글을 둘 자리를 남긴다 (가로 화면) — 종이는 오른쪽으로
    const wide=camera.aspect>1.15, use=wide?.7:1, tf=Math.tan(THREE.MathUtils.degToRad(camera.fov/2)), fit=Math.max((PH/2+.015)/tf,(PW/2+.015)/(tf*camera.aspect*use)), sh=wide?(1-use)*fit*tf*camera.aspect*.92:0;
    await camTo({x:tbl.x-.012,z:tbl.z-sh,yaw:-Math.PI/2,pitch:-1.54,eye:top+fit},1.4); S.phase='play';
    cvs.addEventListener('pointerdown',down); addEventListener('pointermove',move); addEventListener('pointerup',up);
    // 할 일 : 화면 왼쪽 가운데에 크게 (표시할 때마다 체크)
    const td=document.createElement('div'); td.id='taskbig'; td.innerHTML='<p class="k">창가 탁상</p><h3>시차와 연주 시차를<br>표시해 보자</h3><ul><li data-k="par">시차</li><li data-k="p">연주 시차</li></ul><p class="h"></p>'; document.body.appendChild(td); requestAnimationFrame(()=>td.classList.add('on'));
    const tk={hint:t=>td.querySelector('.h').textContent=t,set:()=>td.querySelectorAll('li').forEach(li=>li.classList.toggle('ok',!!got[li.dataset.k]))};
    // 무엇을 어떤 순서로 그릴지는 학생이 정한다. 두 번 틀리면 그때 빠진 것을 짧게 알려 준다
    const got={E1:false,E2:false,par:false,S:false,p:false};
    const aS=Math.PI/2, HW=Math.atan2(E2.x-Star.x,E2.y-Star.y);      // 별에서 본 태양 쪽(아래) · 절반각
    const h1=ext(E1,Star,WALL), h2=ext(E2,Star,WALL);
    const arcAt=(upper,r,a0,a1,c)=>{ const m=upper?-Math.PI/2:Math.PI/2; g.strokeStyle=c; g.lineWidth=7; g.beginPath(); g.arc(Star.x,Star.y,r,m+Math.min(a0,a1),m+Math.max(a0,a1)); g.stroke(); };
    const mark={
      E:k=>{ const e=k==='E1'?E1:E2, hit=ext(e,Star,WALL); return ()=>{ line(e,hit,6,'#3a78c8'); dot(hit,13,'#3a78c8'); label(k==='E1'?'1월':'7월',hit.x,WALL-50,40,'#3a78c8'); }; },
      par:up=>()=>{ arcAt(up,up?150:205,-HW,HW,'#c8382a'); label('시차',up?Star.x:Star.x+150,up?Star.y-182:Star.y+190,50,'#c8382a',up?'center':'left'); },
      S:()=>{ line(Sun,Star,6,'#2a2f3a'); label('1 AU',(E1.x+Sun.x)/2,Sun.y-34,40,'#3a78c8'); label('d',Sun.x+20,(Sun.y+Star.y)/2+90,52,'#c8382a','left'); },
      p:(up,side)=>()=>{ arcAt(up,up?95:110,0,side*HW,'#1f8f5a'); const lx=(up?side:-side)*1; label('p · 연주 시차',Star.x+lx*(up?110:95),up?Star.y-95:Star.y+120,44,'#1f8f5a',lx<0?'right':'left'); } };
    const hintNow=()=>!(got.E1&&got.E2)?'지구에서 ★ 를 지나 배경까지 선을 그어 보자':!got.par?'두 선 사이의 각을 둥글게 표시해 보자 → 시차':!got.S?'태양과 ★ 을 이어 각을 반으로 나눠 보자':'나눈 절반의 각을 둥글게 표시해 보자 → 연주 시차';
    // 각 표시 : ★ 둘레에 그린 획이 어느 쪽(아래 · 위) 각 안에서 얼마나 벌어졌나
    const sweep=s=>{ const q=s.filter(o=>{ const r=Math.hypot(o.x-Star.x,o.y-Star.y); return r>22&&r<360; }); if(q.length<Math.max(1,s.length*.7)) return null; const my=q.reduce((t,o)=>t+o.y,0)/q.length, upper=my<Star.y, d=q.map(o=>{ const a=Math.atan2(o.x-Star.x,(o.y-Star.y)*(upper?-1:1)); return upper?a:-a; }), lo=Math.min(...d), hi=Math.max(...d);
      let len=0; for(let i=1;i<s.length;i++) len+=Math.hypot(s[i].x-s[i-1].x,s[i].y-s[i-1].y); if(lo<-HW-.3||hi>HW+.3) return null; const rr=q.map(o=>Math.hypot(o.x-Star.x,o.y-Star.y)), radial=Math.max(...rr)-Math.min(...rr); return {upper,lo,hi,span:hi-lo,len,radial}; };
    await new Promise(res=>{ tk.set(); goal(''); want={res,hint:'',more:()=>!(got.E1&&got.E2&&got.par&&got.S&&got.p),check:s=>{ const a=s[0], b=s[s.length-1]; want.hint=hintNow();
        // 지구 → ★ → 배경
        for(const k of ['E1','E2']){ const e=k==='E1'?E1:E2; if(got[k]) continue; const st=near(a,e,90)?a:near(b,e,90)?b:null; if(!st) continue; const en=st===a?b:a;
          if(passes(s,Star,75)&&en.y<WALL+120){ got[k]=true; return mark.E(k); } }
        // 절반각을 나누는 곧은 선 (태양 — ★ : 태양에서 ★ 까지든 · 배경까지 늘였든 · ★ 에서 아래로 그었든 다 맞다)
        const xs=s.map(q=>q.x), ys=s.map(q=>q.y), vy=Math.max(...ys)-Math.min(...ys);
        if(!got.S&&vy>150&&xs.every(x=>Math.abs(x-Star.x)<60)&&Math.min(...ys)<Star.y+70&&Math.max(...ys)>Star.y+120){ got.S=true; return mark.S; }
        const w=sweep(s); if(w){ const tapd=w.len<26, arc=w.span>.3&&w.radial<Math.max(90,w.len*.6);
          // 시차 : 두 시선 사이 전체 각 / 연주 시차 : 태양 — ★ 선으로 나눈 절반
          if(!got.par&&got.E1&&got.E2&&((arc&&w.span>HW*1.15)||(tapd&&!got.S))){ got.par=true; return mark.par(w.upper); }
          if(!got.p&&got.S&&(got.E1||got.E2)&&((arc&&w.span<=HW*1.45)||tapd)){ const m=(w.lo+w.hi)/2, side=m>0?1:-1; if(Math.abs(m)>.06&&(side>0?w.lo>-.28:w.hi<.28)){ got.p=true; return mark.p(w.upper,side); } } }
        return false; }}; });
    td.classList.remove('on'); setTimeout(()=>td.remove(),500);
    done.push(()=>{ label('p = 1″ 이면 d = 1 pc',CW-50,420,36,'#c8382a','right'); label('거리(pc) = 1 ÷ p(″)',CW-50,495,46,'#2a2f3a','right'); }); base();
    removeEventListener('pointermove',move); removeEventListener('pointerup',up); cvs.removeEventListener('pointerdown',down);
    goal(''); await sleep(1600);
    S.phase='cut'; await camTo({x:s.x+.08,z:tbl.z,yaw:-Math.PI/2,pitch:-.45,eye:1.38},1.2); window.dragHook=prevDrag; MISSION.el&&MISSION.el.classList.add('on'); S.phase='play';
    await TALK.say([C('연주 시차가 1초(1″)일 때의 거리가 1 파섹, 1 pc. 그래서 거리(pc) = 1 ÷ 연주 시차(″).'),
      V('책 없이 외우고 계시는군요.'),
      C('중학교 때 배웠거든. 반년 간격으로 잰 웜홀의 연주 시차가 약 '+this.P_DEG+'°.'),
      V('단위가 도입니다. 혹시나 해서 말씀드립니다.'),
      C('알아. 초로 바꿔야지. …계산기가 어디 있더라.')]);
    await this.quiz();
    await TALK.say([V('항법 컴퓨터와 같은 값입니다. 1/39,600 pc — 1 pc 는 약 20만 6천 AU 이므로 약 5.2 AU. 태양에서 약 7억 8천만 km, 목성 궤도와 거의 같은 거리입니다.'),
      C('거봐.'),
      V('R-1 은 초속 74 km 로 갑니다. 122일, 넉 달입니다.'),
      V('1호가 떠날 때는 목성이 웜홀에서 멀리 있어 항로가 계속 어긋났습니다. 이번에는 도착할 무렵 목성이 마침 웜홀 곁에 옵니다.'),
      C('창밖으로 목성을 보면서 들어가겠군. …이 종이는 여기 두고 가자.')]);
    // 몸을 펴고 앉기 전에 섰던 자리로 물러난다 (의자 · 탁자에 낀 자리에 두면 가구를 타고 솟았다)
    S.phase='cut'; const bad=SOLID.hit(x0,z0,.3,1.6,.2); await camTo({x:bad?.05:x0,z:bad?-6.2:z0,yaw:-Math.PI/2,pitch:0,eye:1.66},.9); P.y=0; P.vy=0; P.gy=0; P.pinY=false; S.phase='play'; },

  // 계산 : 거리(pc) = 1 ÷ [p″] = [d]  — 칸은 옆 계산기로만 채운다 (calc.js). ① 11° → 초 ② 1 ÷ p
  quiz(){ const D=this.P_DEG, P=this.P_SEC, d=1/P;
    return calcQuiz({order:['p','d'],
      work:`<p class="hd">연주 시차로 웜홀까지의 거리 구하기</p><p class="q">웜홀의 연주 시차 p ≈ ${D}°</p>
        <div class="eq"><span class="lhs">거리 <b>d</b><small>pc</small></span><span class="op">=</span><span class="frac"><span class="num">1</span><span class="den"><input class="bx" data-k="p" aria-label="연주 시차 (초)"><em>″</em></span></span>
          <span class="op">=</span><input class="bx" data-k="d" aria-label="거리 (pc)"></div>`,
      check:(k,v,n)=>k==='p'?(v===P?{ok:'맞아요 — '+D+'° = '+P.toLocaleString()+'″. 이제 1 ÷ p'}
          :{no:v===D?'칸은 초(″) 단위예요. 도(°)로 넣으면 안 돼요':n<2?'다시 — 도(°)를 초(″)로':`1° = 60′ = 3600″ 이니까, ${D}° 는?`})
        :Math.abs(v-d)/d<.02?{ok:'정답 — d ≈ '+numStr(d)+' pc'}
          :{no:Math.abs(v-1/D)/(1/D)<.02?'p 는 초(″)로 바꾼 값으로 나눠야 해요':v===P?'거리는 1 ÷ p 예요':n<2?'다시 — 1 ÷ '+P.toLocaleString():'계산기에서 1 ÷ '+P+' = 을 눌러 보자'} }); },
};

/* ---- 동면 캡슐 잠금 : 다니엘의 쪽지 (동물 이름 암호) · 영어 네 글자 ---- */
const PODLOCK={ run(){ const {answer,lines}=PODLOCK_PW; return codePad({hd:'동면 캡슐 · 잠금',answer,
  html:`<div class="memo"><p>“선배, 그냥 자면 재미없잖아요 :) — 다니엘”</p><table>${lines.map(([a,b])=>`<tr><td>${a}</td><td>=</td><td class="${b==='?'?'q':''}">${b}</td></tr>`).join('')}</table></div>`}); } };
