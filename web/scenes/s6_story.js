/* ============================================================
   3판 이야기 (STORY.md) — 3장 ~ 에필로그가 함께 쓰는 것 + 3장 쌍둥이 별 · 4장 등대 부표
   소품 : web/assets/story.glb (blender/10_하위헌스2호.blend 의 STORY 모음 · 세계 좌표 그대로)
     IT_h1(1호의 피 · 끌린 자국 · 손자국 · 시신 가방) · IT_vent_deck/hall(환기구, vent_grate_*) · IT_breaker(brk_door) · IT_axecase · IT_axe · IT_podhatch · ROOM_pod(포드 선실 x 120)
   문제 화면 (위쪽 패널 .spanel) : STORY.pick(표 고르기) · STORY.sort(카드 나누기) · STORY.sim(밀대 실험)
   ============================================================ */
'use strict';
const STORY={
  it(k){ const r=SHIP.rooms.story, h=SHIP.rooms.horror; return (r&&r.items[k])||(h&&h.items[k]); },      // story.glb · horror.glb
  show(k,on){ const o=this.it(k); if(o) o.visible=on; },
  // 소품 준비 : 피 데칼은 바닥 · 벽 위에 떠 보이게, 포드 선실은 안에서 보이게. 1호 장식은 1호에서만
  prep(R){ R.root.traverse(o=>{ if(!o.isMesh) return; const m=o.material;
      // 피 : 어둠 속에서도 손전등에 읽히게 살짝 스스로 빛나게
      if(/blood/.test(m.name)){ m.emissive=new THREE.Color(.5,.03,.02); m.emissiveMap=m.map; m.emissiveIntensity=2.2; m.depthWrite=false; m.polygonOffset=true; m.polygonOffsetFactor=-4; m.polygonOffsetUnits=-4; o.renderOrder=3; }
      if(o.name==='pod_cabin'){ m.side=THREE.DoubleSide; m.color.multiplyScalar(.4); } });
    ['h1','gore_hall','gore_sj','gore_bd','lamp'].forEach(k=>this.show(k,false)); },      // 피(gore_)는 끌려간 뒤에야 · 손전등(lamp)은 복제해서 쓴다
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
  wait(mesh,name,o={}){ return new Promise(res=>{ const it=interact(mesh,name,()=>{ if(!it.done){ it.done=true; if(!o.again) INTER.splice(INTER.indexOf(it),1); res(); } else if(o.again) o.again(); },{range:o.range||3,enabled:o.enabled}); }); },      // 다 쓴 대상은 지운다 (같은 화면에 다음 장 대상이 붙는다)
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
   3장 · 쌍둥이 별 — 신호 별계로 도약 → 같은 종류의 주황색 별 둘(A · B) → 구조 신호은 B 쪽
   빛 실험 : 빛이 퍼지는 넓이 (거리 2배 → 4칸, 3배 → 9칸) → 밝기는 거리의 제곱에 반비례
   과학 : A 까지 레이더 2 AU · B 는 A 보다 9배 어둡다 → 3배 멀다 → 6 AU
   ============================================================ */
const CH3={A:2, RATIO:9,
  async start(){ const f=S.flags, {me,V,MY,SJ,DN,OW}=STORY.L(); f.ch3=true; STORY.crew(); goal('');
    // 몸으로 : 기관실에서 도약 코일 예열 → 함장석으로 돌아와 도약 명령
    await TALK.say([MY('도약 좌표 0.2 pc 들어갔어요. 그런데 도약 코일이 식어 있어요.'),DN('기관실 원자로 화면에서 코일을 하나씩 맞춰 주세요. 박자를 놓치면 다시 해야 해요.')]);
    await STORY.at(BRIDGEUI.mesh('eng0'),'원자로 화면 — 도약 코일 예열','기관실 원자로 화면(서쪽 책상)에서 도약 코일을 예열한다',{range:2.8,up:.5});
    await STORY.qte('JUMP COIL · 도약 코일 예열','코일 넷을 차례로 맞추기',4);
    await TALK.say([DN('코일 넷 다 붉게 달아올랐어요. 함교로 가세요, 선장님!')]);
    const cs=SHIP.rooms.bridge.spots.captain; await STORY.go(cs.x,cs.z,'함교 함장석에서 도약을 명령한다',{r:1.3,y:1.2});
    await TALK.say([me('가자. 레아가 기다린다.'),V('도약합니다. 셋, 둘, 하나.')]);
    const fe=$('#fade'); fe.style.background='#fff'; AUDIO.tone(80,2.2,'sawtooth',.06,0,40); await fade(true,700); await sleep(900);
    f.jump1=true; this.sky(); await fade(false,1800); fe.style.background='';
    await TALK.say([V('도약 완료. 구조 신호가 오는 별 곁에 들어왔습니다.'),SJ('별이… 두 개예요. 똑같이 생긴 주황색 별 둘.'),
      V('두 별의 스펙트럼이 같습니다. 같은 종류의 별 — 실제로 내는 빛의 양이 같습니다.'),OW('그런데 하나는 훨씬 어둡네요.'),
      V('구조 신호는 어두운 별, B 쪽에서 옵니다. 밝은 별 A 까지는 레이더로 2 AU. B 는 너무 멀어 레이더가 닿지 않습니다.'),
      MY('B 까지 거리를 모르면 다음 도약을 못 해요.'),SJ('같은 별인데 어둡다는 건… 더 멀다는 거죠. 얼마나 멀까요?'),
      me('빛이 어떻게 퍼지는지부터 보자. 연구실 광학대로.')]);
    await STORY.at(STORY.it('optbench'),'광학대 — 빛 세기 실험','연구실 광학대에서 빛이 퍼지는 실험을 한다 (복도 동쪽 연구실)',{range:3.2,up:.4});
    // 빛 실험 : 전구에서 거리 d 의 판을 비추면 빛이 d² 칸에 퍼진다 → 한 칸 밝기 1/d²
    await STORY.sim('LIGHT · 빛이 퍼지는 넓이','판을 밀어서, 한 칸의 밝기가 <b>1/9</b> 이 되는 거리를 찾아보자',{min:1,max:4,step:1,val:1,unit:' 배 거리'},
      (g,W,H,d)=>{ const ob=STORY.it('optbench'), sc=ob&&ob.getObjectByName('ob_screen'); if(sc) sc.position.x=-1.35+.55*d;      // 광학대 위의 판도 같이 움직인다
        g.fillStyle='#040506'; g.fillRect(0,0,W,H); const x0=120, y0=H/2, X=x0+d*220, s=60*d;
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
    await TALK.say([V('B 까지 6 AU. 구조 신호가 오는 자리와 일치합니다.'),MY('짧은 도약으로 6 AU. 바로 갈게요.'),
      V('주의. B 주위에 소행성 띠가 있습니다. 1호가 띠 안에 항로 부표를 놓아 두었습니다.')]);
    await STORY.next('3장 · 쌍둥이 별 — 끝','4장 · 등대 부표',()=>CH4.start()); },
  // 신호 별계의 하늘 : 앞 창 너머 주황색 별 둘 (A 밝게 · B 어둡게)
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
      V('1호의 구조 신호에 항로 기록이 함께 실려 있습니다. 띠 안의 안전한 길은 그것뿐입니다. 그런데 부표 위치가 별 이름이 아니라 등급으로 적혀 있습니다.'),
      SJ('1호 항법사다운 장난이네요. 같이 풀어 봐요, 선장님. 항법 화면이에요.')]);
    goal('항법 화면에서 1호의 항로 기록을 푼다');
    await STORY.wait(BRIDGEUI.mesh('nav'),'항법 화면 — 1호 항로 기록');
    const lit=[]; const why=(i,n)=>n>=2?'겉보기 등급은 보이는 밝기, 절대 등급은 10 pc 에 두었을 때의 밝기 — 숫자가 작을수록 밝다':'다시 — 숫자가 작을수록 밝아요';
    await STORY.pick('HUY-1 NAV LOG · 1호 항로 기록',['별','겉보기 등급','절대 등급'],this.ROWS,[
      {q:'부표 1 — <b>눈에 가장 밝게 보이는</b> 별 쪽',ans:2,ok:'맞아요 — 겉보기 등급 −0.5, 가장 작다',hint:(i,n)=>i===1?'β 는 실제로 밝은 별이에요. 지금은 보이는 밝기':why(i,n)},
      {q:'부표 2 — <b>실제로 가장 밝은</b> 별 쪽',ans:1,ok:'맞아요 — 절대 등급 −2.0, 같은 거리에 두면 가장 밝다',hint:(i,n)=>i===2?'γ 는 가까워서 밝아 보일 뿐이에요. 절대 등급을 보자':why(i,n)},
      {q:'부표 3 — <b>정확히 10 pc</b> 떨어진 별 쪽',ans:3,ok:'맞아요 — 겉보기 등급 = 절대 등급 이면 10 pc',hint:(i,n)=>n>=2?'절대 등급은 10 pc 에 두었을 때의 등급 — 두 등급이 같은 별':'다시 — 두 등급을 비교해 보자'}],
      k=>{ lit.push(k); AUDIO.tone(660+k*110,.25,'sine',.06); });
    await TALK.say([V('부표 1, 2, 3 응답. 항로가 이어집니다.'),MY('보여요! 초록 불빛이 줄지어…'),MY('저는 엔진 출력을 볼게요. 조종은 선장님이 직접 — 오른쪽 조종석이에요.')]);
    // 몸으로 : 조종석에 앉아 소행성 띠를 직접 지난다
    await STORY.at(BRIDGEUI.mesh('pilotR'),'오른쪽 조종석 — 수동 조종','함교 앞 오른쪽 조종석에서 소행성 띠를 지난다',{range:2.8,up:.4});
    await STORY.steer('MANUAL PILOT · 소행성 띠 통과');
    await TALK.say([MY('…통과! 선장님, 손이 아직 살아 있네요.'),
      V('부표 4 — 응답 없음. 꺼져 있습니다.'),OW('…마지막 부표가 꺼져 있다는 건, 누가 껐다는 거죠.'),
      SJ('기록은 부표 3에서 끊겨요. 여기서부터 1호가 어디 있는지는… 우리가 찾아야 해요.'),me('찾는다. 반드시.')]);
    await STORY.next('4장 · 등대 부표 — 끝','5장 · 유령선',()=>CH5.start()); },
};

// 문제별 점검 (Shift+3 · 4) : 그 문제가 나오는 장의 처음
SCENES.ch3={title:'3장 · 쌍둥이 별', async enter(){ Object.assign(S.flags,{route:true,transit:true,passed:true,bridgeIn:true,where:true,ch2:true,ch2done:true,beacon:true,photos:true});
  await SCENES.ship.enter({at:'bridge'}); S.phase='play'; await CH3.start(); }};
SCENES.ch4={title:'4장 · 등대 부표', async enter(){ Object.assign(S.flags,{route:true,transit:true,passed:true,bridgeIn:true,where:true,ch2:true,ch2done:true,beacon:true,photos:true,ch3:true});
  await SCENES.ship.enter({at:'bridge'}); S.phase='play'; await CH4.start(); }};

/* ============================================================
   몸으로 하는 퀘스트 (2026-11-01 사용자 : "문제만 가만히 푸는 느낌 — 함선 공간을 알차게")
   STORY.mark(x,y,z) : 갈 곳 위에 깜빡이는 표지 → 지우는 함수
   STORY.go(x,z,goalText,{r,y}) : 목표 + 표지 → 닿으면 끝
   STORY.qte(hd,label,n) : 바늘이 초록 칸에 올 때 [누르기] (Space · E) n 번
   STORY.steer(hd) : 소행성 띠 조종 — 초록 부표 문 넷을 지난다 (부딪히기 세 번이면 처음부터)
   ============================================================ */
STORY.mark=function(x,y,z){ const cv=document.createElement('canvas'); cv.width=cv.height=64; const g=cv.getContext('2d');
  g.strokeStyle='#ff5a36'; g.lineWidth=6; g.beginPath(); g.moveTo(32,6); g.lineTo(58,32); g.lineTo(32,58); g.lineTo(6,32); g.closePath(); g.stroke();
  const sp=new THREE.Sprite(new THREE.SpriteMaterial({map:new THREE.CanvasTexture(cv),depthTest:false,transparent:true,toneMapped:false})); sp.scale.setScalar(.32); sp.renderOrder=20; sp.position.set(x,y,z); WORLD.add(sp);
  const fn=()=>{ sp.position.y=y+Math.sin(S.t*3)*.08; sp.material.opacity=.6+.4*Math.sin(S.t*5); }; TICK.push(fn);
  return ()=>{ WORLD.remove(sp); const i=TICK.indexOf(fn); if(i>=0) TICK.splice(i,1); }; };
STORY.go=async function(x,z,text,{r=1.4,y=1.6}={}){ goal(text); const un=this.mark(x,y,z); await this.reach(x,z,r); un(); };
STORY.at=async function(mesh,name,text,o={}){ goal(text); const v=new THREE.Vector3(); new THREE.Box3().setFromObject(mesh).getCenter(v); const un=this.mark(v.x,v.y+(o.up||.7),v.z); await this.wait(mesh,name,o); un(); };
STORY.qte=function(hd,label,n=3){ return new Promise(res=>{ const p=this.panel(hd), W=1000, H=110;
  p.bd.innerHTML=`<p class="q">${label} — 바늘이 <b>초록 칸</b>에 들어오면 누르기 <span class="cnt"></span></p><canvas width="${W}" height="${H}"></canvas><div class="row"><button class="go">누르기 (Space)</button></div>`;
  const cv=p.bd.querySelector('canvas'), g=cv.getContext('2d'), cnt=p.bd.querySelector('.cnt'); let k=0, t=0, z0=0, zw=0, live=true, cool=0;
  const zone=()=>{ zw=.16-k*.025; z0=.15+Math.random()*(.7-zw); }; zone();
  STORY._qte=()=>{ z0=0; zw=1; };                 // 시험용 : 초록 칸을 끝까지
  const pos=()=>.5+.5*Math.sin(t*(2.4+k*.6));
  const loop=()=>{ if(!live) return; t+=.05; cool=Math.max(0,cool-.05); g.fillStyle='#05070a'; g.fillRect(0,0,W,H);
    g.fillStyle='rgba(233,231,226,.08)'; g.fillRect(20,40,W-40,30); g.fillStyle='rgba(109,255,176,.55)'; g.fillRect(20+z0*(W-40),40,zw*(W-40),30);
    const x=20+pos()*(W-40); g.fillStyle=cool?'#ff5a36':'#e9e7e2'; g.fillRect(x-4,26,8,58);
    for(let i=0;i<n;i++){ g.fillStyle=i<k?'#6dffb0':'rgba(233,231,226,.2)'; g.beginPath(); g.arc(W/2-(n-1)*18+i*36,100,8,0,7); g.fill(); }
    cnt.textContent=k+' / '+n; setTimeout(loop,30); }; loop();
  const hit=()=>{ if(!live||cool) return; const v=pos();
    if(v>=z0&&v<=z0+zw){ k++; AUDIO.tone(520+k*160,.15,'sine',.08); if(k>=n){ live=false; p.ok('완료'); removeEventListener('keydown',kb,true); setTimeout(()=>{ p.close(); res(); },900); } else { p.ok('좋아요'); zone(); } }
    else { cool=.6; AUDIO.tone(180,.2,'square',.05); p.no(v<z0?'조금 일찍 — 기다렸다가':'조금 늦게 — 더 빨리'); } };
  p.bd.querySelector('.go').onclick=hit; const kb=e=>{ if(e.code==='Space'||e.code==='KeyE'||e.code==='Enter'){ e.preventDefault(); e.stopPropagation(); hit(); } }; addEventListener('keydown',kb,true); }); };
STORY.steer=function(hd){ return new Promise(res=>{ const p=this.panel(hd), W=1200, H=560;
  p.bd.innerHTML=`<p class="q">초록 <b>부표 사이</b>로 지나가자 — 돌에 세 번 부딪히면 처음부터 · ← → 키 또는 아래 단추 · 화면을 끌어도 된다 <span class="cnt"></span></p><canvas width="${W}" height="${H}"></canvas>
    <div class="row"><button class="go l">◀ 왼쪽</button><button class="go r">오른쪽 ▶</button></div>`;
  const cv=p.bd.querySelector('canvas'), g=cv.getContext('2d'), cnt=p.bd.querySelector('.cnt'), NEED=4;
  let x=W/2, vx=0, L=false, R=false, rocks=[], gates=[], stars=[], hits=0, passed=0, t=0, next=1.2, live=true, inv=0, drag=null;
  for(let i=0;i<90;i++) stars.push({x:Math.random()*W,y:Math.random()*H,s:Math.random()});
  const reset=()=>{ rocks=[]; gates=[]; hits=0; passed=0; t=0; next=1.2; x=W/2; };
  STORY._steer=()=>{ passed=NEED; };              // 시험용 : 바로 통과
  const loop=()=>{ if(!live) return; const dt=.033; t+=dt; inv=Math.max(0,inv-dt);
    vx+=((R?1:0)-(L?1:0))*2600*dt; vx*=.86; if(drag!==null) vx=(drag-x)*8; x=Math.max(60,Math.min(W-60,x+vx*dt));
    if(t>next){ next=t+.55+Math.random()*.4; rocks.push({x:60+Math.random()*(W-120),y:-40,r:18+Math.random()*30,v:240+Math.random()*120}); }
    if(t%4.2<dt){ const gx=160+Math.random()*(W-320); gates.push({x:gx,y:-30,w:230,done:false}); rocks=rocks.filter(r=>Math.abs(r.x-gx)>170||r.y>60); }
    g.fillStyle='#03050a'; g.fillRect(0,0,W,H); stars.forEach(s=>{ s.y+=(60+s.s*200)*dt; if(s.y>H){ s.y=0; s.x=Math.random()*W; } g.fillStyle=`rgba(255,255,255,${.3+s.s*.6})`; g.fillRect(s.x,s.y,1.5,2+s.s*4); });
    gates.forEach(q=>{ q.y+=200*dt; [q.x-q.w/2,q.x+q.w/2].forEach(bx=>{ g.fillStyle=q.done?'#2a5':'#6dffb0'; g.beginPath(); g.arc(bx,q.y,10,0,7); g.fill(); });
      g.setLineDash([8,10]); g.strokeStyle='rgba(109,255,176,.4)'; g.beginPath(); g.moveTo(q.x-q.w/2,q.y); g.lineTo(q.x+q.w/2,q.y); g.stroke(); g.setLineDash([]);
      if(!q.done&&q.y>H-90&&q.y<H-50){ q.done=true; if(Math.abs(x-q.x)<q.w/2){ passed++; AUDIO.tone(660+passed*110,.2,'sine',.07); p.ok('부표 '+passed+' 통과'); } else p.no('부표 문을 놓쳤어요 — 초록 불빛 사이로'); } });
    rocks.forEach(r=>{ r.y+=r.v*dt; g.fillStyle='#5b5650'; g.beginPath(); g.arc(r.x,r.y,r.r,0,7); g.fill(); g.fillStyle='#3a3632'; g.beginPath(); g.arc(r.x-r.r*.3,r.y-r.r*.2,r.r*.3,0,7); g.fill();
      if(!inv&&Math.hypot(r.x-x,r.y-(H-70))<r.r+22){ hits++; inv=1; AUDIO.noise(.4,.3,0,500); p.no('쾅! 선체 손상 '+hits+' / 3'); if(hits>=3){ p.no('선체가 버티지 못해요 — 처음부터 다시'); reset(); } } });
    rocks=rocks.filter(r=>r.y<H+60); gates=gates.filter(q=>q.y<H+40);
    g.save(); g.translate(x,H-70); if(inv&&Math.floor(t*12)%2) g.globalAlpha=.4; g.fillStyle='#e9e7e2'; g.beginPath(); g.moveTo(0,-30); g.lineTo(22,24); g.lineTo(0,14); g.lineTo(-22,24); g.closePath(); g.fill();
    g.fillStyle='#ff9a50'; g.beginPath(); g.moveTo(-8,20); g.lineTo(0,34+Math.random()*10); g.lineTo(8,20); g.fill(); g.restore();
    cnt.textContent='부표 '+passed+' / '+NEED+' · 손상 '+hits+' / 3';
    if(passed>=NEED){ live=false; p.ok('소행성 띠 통과!'); cleanup(); setTimeout(()=>{ p.close(); res(); },1200); return; }
    setTimeout(loop,33); };
  const kd=e=>{ if(e.code==='ArrowLeft'||e.code==='KeyA'){ L=true; e.preventDefault(); } if(e.code==='ArrowRight'||e.code==='KeyD'){ R=true; e.preventDefault(); } }, ku=e=>{ if(e.code==='ArrowLeft'||e.code==='KeyA') L=false; if(e.code==='ArrowRight'||e.code==='KeyD') R=false; };
  addEventListener('keydown',kd,true); addEventListener('keyup',ku,true);
  const cleanup=()=>{ removeEventListener('keydown',kd,true); removeEventListener('keyup',ku,true); };
  const bl=p.bd.querySelector('.l'), br=p.bd.querySelector('.r');
  bl.onpointerdown=()=>L=true; bl.onpointerup=bl.onpointerleave=()=>L=false; br.onpointerdown=()=>R=true; br.onpointerup=br.onpointerleave=()=>R=false;
  const cx=e=>{ const r=cv.getBoundingClientRect(); return (e.clientX-r.left)/r.width*W; };
  cv.onpointerdown=e=>{ drag=cx(e); cv.setPointerCapture(e.pointerId); }; cv.onpointermove=e=>{ if(drag!==null) drag=cx(e); }; cv.onpointerup=()=>{ drag=null; vx=0; };
  loop(); }); };
