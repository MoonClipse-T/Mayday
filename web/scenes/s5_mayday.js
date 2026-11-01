/* ============================================================
   2장 · 메이데이 — 웜홀 건너편 함교 (1장 끝 은하 지도 바로 뒤에 이어진다 · 바로 가기 ?s=mayday · Shift+7)
   통신 콘솔 : HUY-1 구조 신호에 레아 문의 녹음이 실려 끝없이 되풀이된다 → 방향은 알지만 거리를 모른다 (도약하려면 거리)
   → 탐측기 A · B 를 배 양쪽으로 1 AU 씩 (기준선 2 AU = 지구 공전 궤도 양 끝과 같다) → 같은 순간에 구조 신호 방향 사진
   → 과학 스테이션 블링크 비교기 : 두 사진을 번갈아 띄워 자리가 바뀌는 별 찾기 (가까운 별일수록 많이 움직인다 · 먼 배경 별은 그대로)
   → 확대 눈금(한 칸 1″)으로 움직인 각을 센다 → 계산기 : 연주 시차 p · 거리 d(pc) · 빛으로 몇 년(광년)
   과학 : A · B 사이(2 AU)에서 본 시차 10″ → 1 AU 기준 연주 시차 p = 5″ → d = 1 ÷ 5 = 0.2 pc ≈ 41,000 AU
          0.2 pc × 3.26 = 0.652 광년 ≈ 8개월 → 지금 들은 녹음은 8개월 전에 보낸 전파 (녹음은 그보다 오래 되풀이되고 있었다)
   레아의 "주황색 별" 은 5장(별의 색과 표면 온도)의 복선
   ============================================================ */
'use strict';
const CH2={SHIFT:10, P:5, D:.2, LY:.652,
  async start(){ const f=S.flags, {maya,seojun,daniel,owen}=SHIP.crew, U=BRIDGEUI;
    const me=t=>({kind:'me',t}), V=t=>({who:'VEGA',kind:'vega',t}), MY=t=>({who:'마야',t,npc:maya}), SJ=t=>({who:'서준',t,npc:seojun}),
      DN=t=>({who:'다니엘',t,npc:daniel}), OW=t=>({who:'오언',t,npc:owen}), LEA=t=>({who:'하위헌스 1호',ch:'HUY-1 구조 신호',kind:'radio',t});
    const wait=(mesh,name,opt={})=>new Promise(res=>{ const it=interact(mesh,name,()=>{ if(!it.done){ it.done=true; if(!opt.again) INTER.splice(INTER.indexOf(it),1); res(); } else if(opt.again) opt.again(); },{range:3.2,enabled:opt.enabled}); });
    f.ch2=true; S.phase='play'; P.free=true; SHIP.zone=null;
    await TALK.say([V('1호의 구조 신호입니다. 자동으로 되풀이되는 신호에… 사람의 목소리가 실려 있습니다.'),OW('선장님, 통신 콘솔로 오세요. 직접 들으셔야 해요.')]);
    goal('통신 콘솔에서 신호를 듣는다');
    const record=[LEA('…치직… 여기는 하위헌스 1호. 생물학자 레아 문입니다.'),LEA('이 녹음을 듣는 사람이 있다면… 1호는 주황색 별을 도는 행성 궤도에 있어요.'),
      LEA('대원들은… 대원들은 이제 없어요. 저 혼자예요. 배 안이 너무 추워요.'),LEA('오지 마세요. …아니, 와 주세요. 제발— …치직…'),LEA('…여기는 하위헌스 1호. 생물학자 레아 문입니다. 이 녹음을—')];
    const play=()=>{ AUDIO.radio(4); return TALK.say(record); };
    await wait(U.mesh('comms'),'통신 콘솔 — HUY-1 신호 듣기',{again:play});
    await play();
    await TALK.say([V('같은 녹음이 끝없이 되풀이됩니다. 1호가 자동으로 보내는 구조 신호에 실려 있습니다.'),SJ('살아 있는 사람이 있다는 거잖아요!'),me('…레아 문. 1호의 생물학자.'),
      MY('어디예요? 바로 가요.'),SJ('방향은 잡혔어요. 구조 신호는 저쪽 별에서 와요. 그런데 거리를 몰라요. 도약하려면 거리를 넣어야 해요.'),
      DN('거리를 잘못 넣으면 별 한가운데로 뛰어들 수도 있어요.'),me('시차로 재자. 출발하던 날 너한테 종이에 그려 줬던 거.'),
      DN('아, 그 종이! 그런데 여긴 지구가 없잖아요. 반년을 기다릴 수도 없고.'),
      SJ('기준선만 있으면 돼요. 탐측기 두 대를 배 양쪽으로 1 AU 씩 보내면, 지구 공전 궤도의 양 끝이랑 같아요.'),
      DN('탐측기는 기관실 북쪽 벽 발사관에 있어요. 선장님이 직접 쏴 주세요. 저는 여기서 궤도를 넣을게요.')]);
    // 몸으로 : 기관실까지 걸어가 발사 콘솔에서 A · B 를 차례로 점화한다
    const L=STORY.it('launch'), con=L&&L.getObjectByName('launch_console');
    await STORY.at(con,'발사 콘솔 — 탐측기 A · B','기관실 북쪽 벽 발사 콘솔에서 탐측기를 쏜다 (복도 동쪽 끝 기관실)',{range:2.8});
    for(const k of ['A','B']){ await STORY.qte('PROBE '+k+' · 탐측기 '+k,'탐측기 '+k+' 점화',3); await this.fire(L.getObjectByName('probe'+k)); }
    await TALK.say([V('탐측기 A · B 발사 확인. 각자 1 AU 에 닿으면 같은 순간에 구조 신호가 오는 쪽을 찍습니다.'),DN('둘 다 궤도에 올랐어요, 선장님!')]);
    f.beacon=true; S.phase='cut'; P.free=false; await fade(true,1400);
    await card('','사흘 뒤','탐측기 A · B — 배 양쪽으로 1 AU',2600); await fade(false,1400); S.phase='play'; P.free=true;
    await TALK.say([V('사진 두 장을 받았습니다. 과학 스테이션의 블링크 비교기로 보내 두었습니다.'),
      SJ('두 사진을 번갈아 띄워 보세요. 가까운 별일수록 많이 움직여요. 1930년에 명왕성도 이렇게 찾았대요.')]);
    f.photos=true; await STORY.at(U.mesh('sci'),'과학 스테이션 — 블링크 비교기','함교로 돌아가 과학 스테이션에서 두 사진을 비교한다');
    await this.blink();
    await TALK.say([V('확인합니다. 신호가 오는 별까지 0.2 pc. 약 4만 1천 AU, 빛으로 0.65년 — 약 8개월 거리입니다.'),
      SJ('그럼… 지금 들은 녹음은 8개월 전에 출발한 거예요.'),me('8개월 전까지는 살아 있었다는 거군. …지금은?'),OW('…'),
      MY('도약 좌표 넣을게요. 0.2 pc.'),V('도약 거리는 1%만 틀려도 별에 부딪힐 수 있습니다. 그 별의 밝기로 거리를 한 번 더 확인할 것을 권합니다.'),
      SJ('밝기요? …저 별 옆에 똑같이 생긴 별이 하나 더 있어요. 둘을 비교하면 될 것 같아요.')]);
    f.ch2done=true; await STORY.next('2장 · 메이데이 — 끝','3장 · 쌍둥이 별',()=>CH3.start()); },

  // 탐측기 발사 : 발사관 밖으로(벽 쪽) 미끄러져 나가 사라진다
  fire(pr){ return new Promise(res=>{ if(!pr) return res(); AUDIO.noise(1.2,.3,0,1600); AUDIO.tone(90,1,'sawtooth',.06,0,200); let k=0; const z0=pr.position.z;
    const fn=dt=>{ k=Math.min(1,k+dt/.9); pr.position.z=z0-k*k*3.2; if(k>=1){ pr.visible=false; TICK.splice(TICK.indexOf(fn),1); res(); } }; TICK.push(fn); }); },
  /* 블링크 비교기 : 화면 위쪽 패널. 사진 A · B 를 번갈아 → 점선 원 안에서 움직이는 별 누르기 → 확대 눈금 → 계산기 */
  blink(){ return new Promise(async res=>{
    const W=1200, H=560, K=6, C={x:640,y:280,r:95};                       // K : 사진 1″ = 6 px
    const el=document.createElement('div'); el.id='blink';
    el.innerHTML=`<p class="hd"><span>BLINK COMPARATOR · 블링크 비교기</span><span class="ph"></span></p><canvas width="${W}" height="${H}"></canvas>
      <div class="bar"><button data-v="A">사진 A</button><button data-v="B">사진 B</button><button data-v="auto">깜빡이기</button></div>`;
    document.body.appendChild(el); requestAnimationFrame(()=>el.classList.add('on'));
    const cv=el.querySelector('canvas'), g=cv.getContext('2d'), ph=el.querySelector('.ph'), btn=[...el.querySelectorAll('.bar button')];
    // 별 : 먼 배경 별은 두 사진에서 그대로, 가까운 별 셋은 탐측기 B(오른쪽)에서 볼 때 왼쪽으로 옮겨 간다 (가까울수록 많이)
    let s=7; const rnd=()=>(s=(s*16807)%2147483647)/2147483647;
    const bg=[]; while(bg.length<170){ const x=rnd()*W, y=rnd()*H, m=rnd(); if(Math.hypot(x-C.x,y-C.y)<C.r+14) continue; bg.push({x,y,r:.7+m*m*2.6}); }
    bg.push({x:652,y:236,r:1.9});                                          // 점선 원 안의 먼 별 (움직이지 않는다)
    const beacon={x:676,y:296,sh:this.SHIFT,r:3.2}, movers=[beacon,{x:300,y:150,sh:3,r:2.4},{x:985,y:430,sh:1.5,r:2.2}];
    const at=(m,v)=>({x:m.x-(v==='B'?m.sh*K:0),y:m.y});
    let view='A', auto=true, zoom=false, t0=performance.now();
    const star=(x,y,r)=>{ const gr=g.createRadialGradient(x,y,0,x,y,r*3); gr.addColorStop(0,'rgba(255,255,255,1)'); gr.addColorStop(.35,'rgba(235,240,245,.85)'); gr.addColorStop(1,'rgba(235,240,245,0)'); g.fillStyle=gr; g.beginPath(); g.arc(x,y,r*3,0,7); g.fill(); };
    const txt=(t,x,y,c,sz=22,al='left')=>{ g.fillStyle=c; g.font=`500 ${sz}px "IBM Plex Mono",monospace`; g.textAlign=al; g.textBaseline='middle'; g.fillText(t,x,y); };
    const draw=()=>{ const H=cv.height; g.fillStyle='#040506'; g.fillRect(0,0,W,H);
      if(!zoom){ bg.forEach(b=>star(b.x,b.y,b.r)); movers.forEach(m=>{ const p=at(m,view); star(p.x,p.y,m.r); });
        g.setLineDash([10,9]); g.strokeStyle='rgba(159,216,255,.8)'; g.lineWidth=2; g.beginPath(); g.arc(C.x,C.y,C.r,0,7); g.stroke(); g.setLineDash([]);
        txt('구조 신호가 오는 쪽',C.x,C.y+C.r+24,'#9fd8ff',20,'center'); }
      else { // 확대 : 신호 별 둘레 띠 · 눈금 한 칸 = 1″ (40 px) — 아래 계산기와 겹치지 않게 낮은 띠로
        const Z=40, cx=W/2, cy=H/2-20, mx=beacon.x-beacon.sh*K/2, X=x=>cx+(x-mx)/K*Z, Y=y=>cy+(y-beacon.y)/K*Z;
        g.strokeStyle='rgba(159,216,255,.16)'; g.lineWidth=1; for(let x=cx%Z;x<W;x+=Z){ g.beginPath(); g.moveTo(x,0); g.lineTo(x,H-60); g.stroke(); } for(let y=cy%Z;y<H-60;y+=Z){ g.beginPath(); g.moveTo(0,y); g.lineTo(W,y); g.stroke(); }
        const a=at(beacon,'A'), b=at(beacon,'B'), o=view==='A'?b:a;
        g.setLineDash([6,6]); g.strokeStyle='rgba(255,90,54,.7)'; g.lineWidth=2; g.beginPath(); g.arc(X(o.x),Y(o.y),16,0,7); g.stroke(); g.setLineDash([]);
        txt(view==='A'?'B':'A',X(o.x),Y(o.y)-34,'#ff5a36',20,'center'); star(X(view==='A'?a.x:b.x),Y(a.y),6); txt(view,X(view==='A'?a.x:b.x),Y(a.y)-34,'#e9e7e2',20,'center');
        // 아래 눈금자
        const y0=H-44; g.strokeStyle='#e9e7e2'; g.lineWidth=2; g.beginPath(); g.moveTo(X(b.x)-Z,y0); g.lineTo(X(a.x)+Z,y0); g.stroke();
        for(let k=-1;k<=beacon.sh+1;k++){ const x=X(b.x)+k*Z; g.beginPath(); g.moveTo(x,y0-(k%2===0?16:9)); g.lineTo(x,y0); g.stroke(); if(k>=0&&k%2===0) txt(String(k),x,y0+18,'rgba(233,231,226,.8)',16,'center'); }
        g.setLineDash([4,6]); g.strokeStyle='rgba(233,231,226,.35)'; [a.x,b.x].forEach(v=>{ g.beginPath(); g.moveTo(X(v),Y(a.y)+14); g.lineTo(X(v),y0-18); g.stroke(); }); g.setLineDash([]);
        txt('눈금 한 칸 = 1″',24,H-44,'#9fd8ff',20); }
      txt('사진 '+view,24,30,'#ff5a36',24); txt(view==='A'?'탐측기 A · 배 왼쪽 1 AU':'탐측기 B · 배 오른쪽 1 AU',24,60,'rgba(233,231,226,.62)',18);
      ph.textContent=auto?'깜빡이는 중':'사진 '+view; btn.forEach(b=>b.classList.toggle('on',b.dataset.v==='auto'?auto:!auto&&b.dataset.v===view)); };
    let live=true; const loop=()=>{ if(!live) return; if(auto&&performance.now()-t0>650){ view=view==='A'?'B':'A'; t0=performance.now(); AUDIO.tone(view==='A'?520:600,.03,'sine',.015); } draw(); setTimeout(loop,60); }; loop();
    btn.forEach(b=>b.onclick=()=>{ AUDIO.tick(); if(b.dataset.v==='auto') auto=!auto; else { auto=false; view=b.dataset.v; } t0=performance.now(); draw(); });
    S.busy=true; P.free=false;
    // ① 점선 원 안에서 움직이는 별 누르기 (두 번 틀리면 힌트)
    goal('두 사진을 번갈아 보며, 구조 신호가 오는 쪽(점선 원) 안에서 움직이는 별을 누른다');
    let miss=0;
    await new Promise(ok=>{ cv.onpointerdown=e=>{ const r=cv.getBoundingClientRect(), x=(e.clientX-r.left)/r.width*W, y=(e.clientY-r.top)/r.height*H;
      const hitB=['A','B'].some(v=>{ const p=at(beacon,v); return Math.hypot(x-p.x,y-p.y)<30; });
      if(hitB){ AUDIO.tone(880,.12,'sine',.08); AUDIO.tone(1320,.16,'sine',.07,.1); cv.onpointerdown=null; ok(); return; }
      AUDIO.tone(220,.18,'square',.04); miss++;
      const far=Math.hypot(x-652,y-236)<26, other=movers.slice(1).some(m=>['A','B'].some(v=>{ const p=at(m,v); return Math.hypot(x-p.x,y-p.y)<26; }));
      toast(far?'그 별은 두 사진에서 그대로 — 아주 먼 배경 별이에요':other?'움직이는 별이지만 점선 원 밖이에요':miss>=2?'깜빡일 때 점선 원 안에서 자리가 바뀌는 별':'다시 — 깜빡이며 보자',3000); }; });
    // ② 확대 눈금 → 계산
    zoom=true; auto=true; cv.height=300; el.classList.add('zoom'); draw(); goal('');
    await calcQuiz({order:['p','d','ly'],
      work:`<p class="hd">시차로 신호 별까지 거리 구하기</p><p class="q">위 확대 눈금으로 별이 움직인 각을 센다 (한 칸 = 1″)<br>탐측기 A · B 사이 = 2 AU (배 양쪽으로 1 AU 씩)</p>
        <div class="eq"><span class="lhs">연주 시차 <b>p</b></span><span class="op">=</span><input class="bx" data-k="p" aria-label="연주 시차 (초)"><em class="u">″</em></div>
        <div class="eq"><span class="lhs">거리 <b>d</b><small>pc</small></span><span class="op">=</span><span class="op">1 ÷ p =</span><input class="bx" data-k="d" aria-label="거리 (pc)"></div>
        <div class="eq"><span class="lhs">빛으로</span><span class="op">=</span><input class="bx" data-k="ly" aria-label="광년"><em class="u">광년</em></div>
        <p class="note">1 pc ≈ 3.26 광년</p>`,
      check:(k,v,n)=>{ const sh=this.SHIFT, p=this.P, d=this.D, ly=this.LY;
        if(k==='p') return v===p?{ok:'맞아요 — A · B(2 AU) 사이 시차 '+sh+'″, 1 AU 기준인 연주 시차는 그 반'}
          :{no:v===sh?sh+'″ 는 A · B(2 AU) 사이에서 본 시차예요. 연주 시차는 1 AU 기준':n<2?'눈금을 다시 세어 보자 — 한 칸 = 1″':'움직인 칸 수 ÷ 2'};
        if(k==='d') return Math.abs(v-d)<.002?{ok:'정답 — d = '+d+' pc'}:{no:v===p?'거리는 1 ÷ p 예요':n<2?'다시 — 1 ÷ '+p:'계산기에서 1 ÷ '+p+' = 을 눌러 보자'};
        return Math.abs(v-ly)/ly<.02?{ok:'정답 — 약 '+ly+' 광년'}:{no:Math.abs(v-d/3.26)/(d/3.26)<.02?'pc 를 광년으로 : 3.26 을 곱해요':n<2?'다시 — '+d+' × 3.26':'계산기에서 '+d+' × 3.26 = 을 눌러 보자'}; } });
    live=false; el.classList.remove('on'); setTimeout(()=>el.remove(),400); S.busy=false; goal(''); res(); }); },
};
// 점검 7 (Shift+7) : 웜홀 건너편 · 은하 지도를 본 뒤 = 2장 처음
SCENES.mayday={title:'2장 · 메이데이', async enter(){ Object.assign(S.flags,{route:true,transit:true,passed:true,bridgeIn:true,where:true});
  await SCENES.ship.enter({at:'bridge'}); await CH2.start(); }};
