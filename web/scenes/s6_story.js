/* ============================================================
   3판 이야기 (STORY.md) — 3장 ~ 에필로그가 함께 쓰는 것 + 3장 쌍둥이 별 · 4장 등대 부표
   소품 : web/assets/story.glb (blender/10_하위헌스2호.blend 의 STORY 모음 · 세계 좌표 그대로)
     IT_h1(1호의 피 · 끌린 자국 · 손자국 · 시신 가방) · IT_vent_deck/hall(환기구, vent_grate_*) · IT_breaker(brk_door) · IT_axecase · IT_axe · IT_podhatch · ROOM_pod(포드 선실 x 120)
   문제 화면 (위쪽 패널 .spanel) : STORY.pick(표 고르기) · STORY.sort(카드 나누기) · STORY.sim(밀대 실험)
   ============================================================ */
'use strict';
const STORY={
  it(k){ const r=SHIP.rooms.story; return r&&r.items[k]; },
  show(k,on){ const o=this.it(k); if(o) o.visible=on; },
  // 소품 준비 : 피 데칼은 바닥 · 벽 위에 떠 보이게, 포드 선실은 안에서 보이게. 1호 장식은 1호에서만
  prep(R){ R.root.traverse(o=>{ if(!o.isMesh) return; const m=o.material;
      if(/blood/.test(m.name)){ m.depthWrite=false; m.polygonOffset=true; m.polygonOffsetFactor=-4; m.polygonOffsetUnits=-4; o.renderOrder=3; }
      if(o.name==='pod_cabin'){ m.side=THREE.DoubleSide; m.color.multiplyScalar(.4); } });
    this.show('h1',false); },
  // 대사 : 함선 대원 (SHIP.crew) · 레아
  L(){ const c=SHIP.crew||{}, w=(who,npc)=>t=>({who,t,npc});
    return {me:t=>({kind:'me',t}),V:t=>({who:'VEGA',kind:'vega',t}),MY:w('마야',c.maya),SJ:w('서준',c.seojun),DN:w('다니엘',c.daniel),OW:w('오언',c.owen),LE:w('레아',this.leah)}; },
  // 이미 떠난 대원은 함교에서 지운다 (바로 가기로 들어와도 이야기와 맞게)
  crew(){ const f=S.flags, c=SHIP.crew; Object.assign(f,{deckIn:true,bridgeIn:true,labIn:true,lobbyIn:true,engIn:true});      // 3장부터는 방 소개를 다시 하지 않는다
    if(!c) return;
    [['owen',f.owenGone],['seojun',f.seojunGone],['maya',f.mayaGone]].forEach(([k,g])=>{ if(g&&c[k]){ PEOPLE.remove(c[k]); c[k]=null; } }); },
  // 어둠 : 노출을 낮추고 화면 가장자리를 까맣게 (손전등 원) · 붉은 비상등은 깜빡인다
  dark(on,{red=false}={}){ SHIP.dim=on?.3:1; let el=$('#torch'); if(!el){ el=document.createElement('div'); el.id='torch'; document.body.appendChild(el); }
    el.classList.toggle('on',on); el.classList.toggle('red',on&&red);
    if(!this.spot){ this.spot=new THREE.SpotLight(0xfff1dc,0,22,.42,.5,1.4); WORLD.add(this.spot,this.spot.target);
      TICK.push(()=>{ const s=this.spot; if(!s.intensity) return; s.position.copy(camera.position); camera.getWorldDirection(s.target.position).multiplyScalar(4).add(camera.position); }); }
    this.spot.intensity=on?3.2:0; },
  // 창밖 별 : 방향 dir 에 빛나는 점 (카메라를 따라간다 = 아주 멀다)
  glow(dir,size,color){ const cv=document.createElement('canvas'); cv.width=cv.height=128; const g=cv.getContext('2d'), gr=g.createRadialGradient(64,64,0,64,64,64);
    gr.addColorStop(0,'#fff'); gr.addColorStop(.18,color); gr.addColorStop(1,'rgba(0,0,0,0)'); g.fillStyle=gr; g.fillRect(0,0,128,128);
    const sp=new THREE.Sprite(new THREE.SpriteMaterial({map:new THREE.CanvasTexture(cv),depthWrite:false,blending:THREE.AdditiveBlending,fog:false}));
    sp.scale.setScalar(size); sp.renderOrder=-1; const d=new THREE.Vector3(...dir).normalize(); WORLD.add(sp);
    TICK.push(()=>sp.position.copy(camera.position).addScaledVector(d,600)); (this.skies=this.skies||[]).push(sp); return sp; },
  skyClear(){ (this.skies||[]).forEach(s=>s.parent&&s.parent.remove(s)); this.skies=[]; },
  // 장 끝 → 다음 장 (카드 한 장으로 잇는다)
  async next(endTitle,nextTitle,go){ S.phase='cut'; P.free=false; goal(''); await fade(true,1800); await card(endTitle,nextTitle,'',3800); await fade(false,1400); S.phase='play'; P.free=true; await go(); },
  // 기다리기 : 물건을 누를 때까지
  wait(mesh,name,o={}){ return new Promise(res=>{ const it=interact(mesh,name,()=>{ if(!it.done){ it.done=true; res(); } else if(o.again) o.again(); },{range:o.range||3,enabled:o.enabled}); }); },
  // 위치에 닿을 때까지
  reach(x,z,r=1.2){ return new Promise(res=>{ const f=()=>{ if(Math.hypot(P.x-x,P.z-z)<r){ TICK.splice(TICK.indexOf(f),1); res(); } }; TICK.push(f); }); },

  /* ---- 문제 화면 : 위쪽 패널 ---- */
  panel(hd){ const el=document.createElement('div'); el.className='spanel'; el.innerHTML=`<p class="hd"><span>${hd}</span><span class="ph"></span></p><div class="bd"></div><p class="msg"></p>`;
    document.body.appendChild(el); requestAnimationFrame(()=>el.classList.add('on')); S.busy=true; P.free=false;
    const msg=el.querySelector('.msg');
    return {el,bd:el.querySelector('.bd'),ok(t){ AUDIO.tone(880,.12,'sine',.08); AUDIO.tone(1320,.16,'sine',.07,.1); msg.textContent=t; msg.className='msg ok'; },
      no(t){ AUDIO.tone(220,.18,'square',.04); msg.textContent=t; msg.className='msg'; },
      close(){ el.classList.remove('on'); setTimeout(()=>el.remove(),400); S.busy=false; P.free=true; }}; },
  // 표에서 줄 고르기 : qs = [{q, ans:줄 번호, hint(고른 줄, 틀린 횟수)}] 차례로. onOk(i) 는 맞힐 때마다
  pick(hd,cols,rows,qs,onOk){ return new Promise(res=>{ const p=this.panel(hd);
    p.bd.innerHTML=`<p class="q"></p><table class="st"><tr>${cols.map(c=>`<th>${c}</th>`).join('')}</tr>${rows.map((r,i)=>`<tr data-i="${i}">${r.map(v=>`<td>${v}</td>`).join('')}</tr>`).join('')}</table>`;
    let k=0, miss=0; const qel=p.bd.querySelector('.q'), ask=()=>{ qel.innerHTML=`<b>${k+1} / ${qs.length}</b> ${qs[k].q}`; miss=0; }; ask();
    p.bd.querySelectorAll('tr[data-i]').forEach(tr=>tr.onclick=()=>{ const i=+tr.dataset.i, q=qs[k]; if(!q) return;
      if(i===q.ans){ tr.classList.add('hit'); setTimeout(()=>tr.classList.remove('hit'),900); p.ok(q.ok||'맞아요'); onOk&&onOk(k); k++; if(k<qs.length) setTimeout(ask,900); else setTimeout(()=>{ p.close(); res(); },1600); }
      else { miss++; p.no(q.hint(i,miss)); } }); }); },
  // 카드 나누기 : 카드를 누르고 → 칸을 누른다. cards = [[글, 칸 번호]]
  sort(hd,q,bins,cards,hint){ return new Promise(res=>{ const p=this.panel(hd);
    p.bd.innerHTML=`<p class="q">${q}</p><div class="cards">${cards.map((c,i)=>`<button data-i="${i}">${c[0]}</button>`).join('')}</div><div class="bins">${bins.map((b,i)=>`<div class="bin" data-b="${i}"><p>${b}</p></div>`).join('')}</div>`;
    let sel=null, left=cards.length; const bs=[...p.bd.querySelectorAll('.cards button')];
    bs.forEach(b=>b.onclick=()=>{ AUDIO.tick(); sel=b; bs.forEach(x=>x.classList.toggle('sel',x===b)); });
    p.bd.querySelectorAll('.bin').forEach(bin=>bin.onclick=()=>{ if(!sel) return; const i=+sel.dataset.i, want=cards[i][1];
      if(+bin.dataset.b===want){ bin.appendChild(sel); sel.classList.remove('sel'); sel.disabled=true; sel=null; p.ok('맞아요'); if(--left===0) setTimeout(()=>{ p.close(); res(); },1500); }
      else p.no(hint(i)); }); }); },
  // 밀대 실험 : draw(g,W,H,v) 로 그리고, ok(v) 일 때 [확인] → 끝. 아니면 hint(v)
  sim(hd,q,{min,max,step,val,unit,fmt=v=>v},draw,ok,hint){ return new Promise(res=>{ const p=this.panel(hd), W=1200, H=520;
    p.bd.innerHTML=`<p class="q">${q}</p><canvas width="${W}" height="${H}"></canvas><div class="row"><input type="range" min="${min}" max="${max}" step="${step}" value="${val}"><b class="val"></b><button class="go">확인</button></div>`;
    const cv=p.bd.querySelector('canvas'), g=cv.getContext('2d'), r=p.bd.querySelector('input'), vb=p.bd.querySelector('.val');
    let live=true; const loop=()=>{ if(!live) return; vb.textContent=fmt(+r.value)+(unit||''); draw(g,W,H,+r.value); setTimeout(loop,50); }; loop();
    p.bd.querySelector('.go').onclick=()=>{ const v=+r.value; if(ok(v)){ p.ok('맞아요'); live=false; setTimeout(()=>{ p.close(); res(v); },1400); } else p.no(hint(v)); }; }); },
};

/* ============================================================
   3장 · 쌍둥이 별 — 비컨 별계로 도약 → 같은 종류의 주황색 별 둘(A · B) → 비컨은 B 쪽
   빛 실험 : 빛이 퍼지는 넓이 (거리 2배 → 4칸, 3배 → 9칸) → 밝기는 거리의 제곱에 반비례
   과학 : A 까지 레이더 2 AU · B 는 A 보다 9배 어둡다 → 3배 멀다 → 6 AU
   ============================================================ */
const CH3={A:2, RATIO:9,
  async start(){ const f=S.flags, {me,V,MY,SJ,DN,OW}=STORY.L(); f.ch3=true; STORY.crew(); goal('');
    await TALK.say([MY('도약 좌표 0.2 pc. 선장님?'),me('가자. 레아가 기다린다.'),V('도약합니다. 셋, 둘, 하나.')]);
    const fe=$('#fade'); fe.style.background='#fff'; AUDIO.tone(80,2.2,'sawtooth',.06,0,40); await fade(true,700); await sleep(900);
    f.jump1=true; this.sky(); await fade(false,1800); fe.style.background='';
    await TALK.say([V('도약 완료. 비컨 별계에 들어왔습니다.'),SJ('별이… 두 개예요. 똑같이 생긴 주황색 별 둘.'),
      V('두 별의 스펙트럼이 같습니다. 같은 종류의 별 — 실제로 내는 빛의 양이 같습니다.'),OW('그런데 하나는 훨씬 어둡네요.'),
      V('비컨 전파는 어두운 별, B 쪽에서 옵니다. 밝은 별 A 까지는 레이더로 2 AU. B 는 너무 멀어 레이더가 닿지 않습니다.'),
      MY('B 까지 거리를 모르면 다음 도약을 못 해요.'),SJ('같은 별인데 어둡다는 건… 더 멀다는 거죠. 얼마나 멀까요?'),
      me('빛이 어떻게 퍼지는지부터 보자. 과학 스테이션.')]);
    goal('과학 스테이션에서 빛이 퍼지는 실험을 한다');
    await STORY.wait(BRIDGEUI.mesh('sci'),'과학 스테이션 — 빛 세기 실험');
    // 빛 실험 : 전구에서 거리 d 의 판을 비추면 빛이 d² 칸에 퍼진다 → 한 칸 밝기 1/d²
    await STORY.sim('LIGHT · 빛이 퍼지는 넓이','판을 밀어서, 한 칸의 밝기가 <b>1/9</b> 이 되는 거리를 찾아보자',{min:1,max:4,step:1,val:1,unit:' 배 거리'},
      (g,W,H,d)=>{ g.fillStyle='#040506'; g.fillRect(0,0,W,H); const x0=120, y0=H/2, X=x0+d*220, s=60*d;
        g.fillStyle='#ffd27a'; g.beginPath(); g.arc(x0,y0,18,0,7); g.fill();
        g.fillStyle='rgba(255,210,122,.08)'; g.beginPath(); g.moveTo(x0,y0); g.lineTo(X,y0-s/2*1); g.lineTo(X,y0+s/2*1); g.fill();
        g.strokeStyle='rgba(233,231,226,.5)'; for(let i=1;i<=4;i++){ const xx=x0+i*220; g.setLineDash([4,6]); g.beginPath(); g.moveTo(xx,40); g.lineTo(xx,H-60); g.stroke(); g.setLineDash([]);
          g.fillStyle='rgba(233,231,226,.55)'; g.font='18px "IBM Plex Mono",monospace'; g.textAlign='center'; g.fillText(i+'배',xx,H-30); }
        const c=s/d, b=1/(d*d); for(let i=0;i<d;i++) for(let j=0;j<d;j++){ g.fillStyle=`rgba(255,210,122,${Math.max(.08,b)})`; g.fillRect(X-8,y0-s/2+j*c+2,16,c-4); }
        g.fillStyle='#e9e7e2'; g.font='600 26px "IBM Plex Sans KR",sans-serif'; g.textAlign='left';
        g.fillText('빛이 비추는 칸 : '+d*d+' 칸',W-430,70); g.fillText('한 칸의 밝기 : 1/'+d*d,W-430,112);
        const cs=46, gx=W-430, gy=150; g.fillStyle='rgba(233,231,226,.55)'; g.font='18px "IBM Plex Sans KR",sans-serif'; g.fillText('판을 앞에서 보면',gx,gy-10);      // 판 정면 : d × d 칸
        for(let i=0;i<d;i++) for(let j=0;j<d;j++){ g.fillStyle=`rgba(255,210,122,${Math.max(.08,b)})`; g.fillRect(gx+i*cs,gy+j*cs,cs-4,cs-4); } },
      d=>d===3,d=>d<3?'더 멀리 — 한 칸이 더 어두워져야 해요':'너무 멀어요 — 1/'+d*d+' 이 됐어요');
    await TALK.say([SJ('거리가 3배면 빛이 9칸에 퍼져서, 한 칸은 1/9 밝기.'),me('밝기는 거리의 제곱에 반비례한다.')]);
    await calcQuiz({order:['k','d'],
      work:`<p class="hd">밝기로 별 B 까지의 거리</p><p class="q">A 와 B 는 같은 종류의 별 · A 까지 ${this.A} AU<br>B 는 A 보다 <b>${this.RATIO}배</b> 어둡게 보인다</p>
        <div class="eq"><span class="lhs">B 는 A 보다</span><input class="bx" data-k="k" aria-label="몇 배"><em class="u">배 멀다</em></div>
        <div class="eq"><span class="lhs">B 까지 <b>d</b></span><span class="op">=</span><input class="bx" data-k="d" aria-label="거리"><em class="u">AU</em></div>`,
      check:(k,v,n)=>{ const r=Math.sqrt(this.RATIO), d=this.A*r;
        if(k==='k') return v===r?{ok:'맞아요 — 9 = 3 × 3, 3배 멀다'}:{no:v===this.RATIO?'9배 어둡다고 9배 먼 건 아니에요. 밝기는 거리의 제곱에 반비례':n<2?'다시 — 몇 배 멀면 밝기가 1/9 일까?':'□ × □ = 9 인 □'};
        return v===d?{ok:'정답 — '+d+' AU'}:{no:v===this.A*this.RATIO?'9배가 아니라 3배 멀어요':n<2?'다시 — A 까지 거리 × 3':this.A+' × '+r+' ='}; } });
    await TALK.say([V('B 까지 6 AU. 비컨 위치와 일치합니다.'),MY('짧은 도약으로 6 AU. 바로 갈게요.'),
      V('주의. B 주위에 소행성 띠가 있습니다. 1호가 띠 안에 항로 부표를 놓아 두었습니다.')]);
    await STORY.next('3장 · 쌍둥이 별 — 끝','4장 · 등대 부표',()=>CH4.start()); },
  // 비컨 별계의 하늘 : 앞 창 너머 주황색 별 둘 (A 밝게 · B 어둡게)
  sky(){ STORY.glow([-.35,.12,-1],60,'rgba(255,170,90,.9)'); STORY.glow([.42,.05,-1],22,'rgba(255,170,90,.55)'); },
};

/* ============================================================
   4장 · 등대 부표 — 1호의 항로 기록은 별 이름 대신 '등급'으로 적혀 있다
   부표 1 : 가장 밝아 보이는 별 쪽 · 부표 2 : 실제로 가장 밝은 별 쪽 · 부표 3 : 정확히 10 pc 에 있는 별 쪽 · 부표 4 : 꺼져 있다
   과학 : 겉보기 등급 m = 보이는 밝기 (작을수록 밝다) · 절대 등급 M = 10 pc 에 두었을 때의 밝기 → m = M 이면 10 pc
   ============================================================ */
const CH4={
  ROWS:[['α','1.0','4.0'],['β','3.0','−2.0'],['γ','−0.5','1.5'],['δ','5.0','5.0'],['ε','6.0','0.5']],
  async start(){ const f=S.flags, {me,V,MY,SJ,DN,OW}=STORY.L(); f.ch4=true; STORY.crew(); if(!f.jump1){ f.jump1=true; CH3.sky(); }
    await TALK.say([V('B 별계 도착. 앞쪽 소행성 띠, 폭 0.4 AU.'),MY('돌덩이가 너무 많아요. 부표 없이는 못 들어가요.'),
      V('1호의 항로 기록을 찾았습니다. 그런데 부표 위치가 별 이름이 아니라 등급으로 적혀 있습니다.'),
      SJ('1호 항법사다운 장난이네요. 같이 풀어 봐요, 선장님. 항법 화면이에요.')]);
    goal('항법 화면에서 1호의 항로 기록을 푼다');
    await STORY.wait(BRIDGEUI.mesh('nav'),'항법 화면 — 1호 항로 기록');
    const lit=[]; const why=(i,n)=>n>=2?'겉보기 등급은 보이는 밝기, 절대 등급은 10 pc 에 두었을 때의 밝기 — 숫자가 작을수록 밝다':'다시 — 숫자가 작을수록 밝아요';
    await STORY.pick('HUY-1 NAV LOG · 1호 항로 기록',['별','겉보기 등급','절대 등급'],this.ROWS,[
      {q:'부표 1 — <b>눈에 가장 밝게 보이는</b> 별 쪽',ans:2,ok:'맞아요 — 겉보기 등급 −0.5, 가장 작다',hint:(i,n)=>i===1?'β 는 실제로 밝은 별이에요. 지금은 보이는 밝기':why(i,n)},
      {q:'부표 2 — <b>실제로 가장 밝은</b> 별 쪽',ans:1,ok:'맞아요 — 절대 등급 −2.0, 같은 거리에 두면 가장 밝다',hint:(i,n)=>i===2?'γ 는 가까워서 밝아 보일 뿐이에요. 절대 등급을 보자':why(i,n)},
      {q:'부표 3 — <b>정확히 10 pc</b> 떨어진 별 쪽',ans:3,ok:'맞아요 — 겉보기 등급 = 절대 등급 이면 10 pc',hint:(i,n)=>n>=2?'절대 등급은 10 pc 에 두었을 때의 등급 — 두 등급이 같은 별':'다시 — 두 등급을 비교해 보자'}],
      k=>{ lit.push(k); AUDIO.tone(660+k*110,.25,'sine',.06); });
    await TALK.say([V('부표 1, 2, 3 응답. 항로가 이어집니다.'),MY('보여요! 초록 불빛이 줄지어…'),
      V('부표 4 — 응답 없음. 꺼져 있습니다.'),OW('…마지막 부표가 꺼져 있다는 건, 누가 껐다는 거죠.'),
      SJ('부표 3에서 1호까지는 눈으로 갈 수 있어요. 저기, 띠 안쪽에 배 한 척.'),me('하위헌스 1호.')]);
    await STORY.next('4장 · 등대 부표 — 끝','5장 · 유령선',()=>CH5.start()); },
};

// 문제별 점검 (Shift+3 · 4) : 그 문제가 나오는 장의 처음
SCENES.ch3={title:'3장 · 쌍둥이 별', async enter(){ Object.assign(S.flags,{route:true,transit:true,passed:true,bridgeIn:true,where:true,ch2:true,ch2done:true,beacon:true,photos:true});
  await SCENES.ship.enter({at:'bridge'}); S.phase='play'; await CH3.start(); }};
SCENES.ch4={title:'4장 · 등대 부표', async enter(){ Object.assign(S.flags,{route:true,transit:true,passed:true,bridgeIn:true,where:true,ch2:true,ch2done:true,beacon:true,photos:true,ch3:true});
  await SCENES.ship.enter({at:'bridge'}); S.phase='play'; await CH4.start(); }};
