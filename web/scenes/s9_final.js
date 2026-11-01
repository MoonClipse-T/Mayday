/* ============================================================
   9장 · 증발하는 웜홀 — 우주 팽창 : 출발 때 · 지금 은하 거리표 (모든 거리가 같은 비율로 늘었다) → 풍선 실험 (어느 점에서 봐도 다른 점이 멀어진다 = 중심이 없다)
     웜홀이 줄어드는 것은 이야기 속 설정 (실제 웜홀은 발견된 적이 없다) · 적색편이 · 허블 법칙이라는 말은 쓰지 않는다 (중2 과정 밖)
   → 냉각제가 바닥나 성체가 깨어난다 → 기관실 탈출 포드까지 달린다 → 포드가 웜홀을 지나고 2호는 찢긴다
   에필로그 — 목성 궤도 · 포드 안 격리 적외선 검사 → 다니엘 가슴에 뜨거운 점 여럿 → "집에 왔네요" → 암전
   포드 선실 : story.glb 의 ROOM_pod (x 120 · SPOT_pod1/2 · IT_podscan · LIGHT_pod)
   ============================================================ */
'use strict';
const CH9={GAL:[['A',10,12],['B',20,24],['C',40,48],['D',60,72]],
  async start(){ const f=S.flags; f.ch9=true; Object.assign(f,{leahDead:true,owenGone:true,seojunGone:true,mayaGone:true,danielBit:true}); STORY.crew(); STORY.clearCast();
    if(!f.jump1){ f.jump1=true; CH3.sky(); } SHIP.huy1=false; STORY.show('h1',false); STORY.dark(true); SHIP.dim=.5; SHIP.lock={}; STORY.seated(false);
    const c=SHIP.crew; if(c.daniel){ c.daniel.wrap.visible=true; c.daniel.solid=true; c.daniel.pick.visible=true; } const DN=sayer('다니엘',c.daniel);
    const sp=SHIP.rooms.bridge.spawn; warp(sp.x,sp.z,sp.yaw); SHIP.zone=null; if(!STORY.held) STORY.hold();
    await card('','다음 날','하위헌스 2호 · 함교 · 남은 사람 둘',2400);
    await TALK.say([VG('경고. 뒤쪽 웜홀의 반지름이 줄어들고 있습니다.'),DN('줄어들어요? 웜홀이?'),
      VG('웜홀 둘레의 공간이 늘어나고 있습니다. 출발 때와 지금, 주변 은하까지의 거리를 비교해 보십시오.'),ME('우주가 팽창하고 있다는 거군.')]);
    toast('이야기 속 설정 — 웜홀은 아직 실제로 발견된 적이 없다',4200);
    goal('과학 스테이션에서 은하 거리표를 본다');
    await STORY.wait(BRIDGEUI.mesh('sci'),'과학 스테이션 — 은하 거리표');
    const rows=this.GAL.map(([n,a,b])=>`<tr><td>${n}</td><td>${a}</td><td>${n==='C'?'<input class="bx" data-k="c" aria-label="은하 C 지금 거리">':b}</td></tr>`).join('');
    await calcQuiz({order:['k','c'],
      work:`<p class="hd">늘어나는 거리 (단위 : 백만 광년)</p><table class="st"><tr><th>은하</th><th>출발 때</th><th>지금</th></tr>${rows}</table>
        <div class="eq"><span class="lhs">모든 거리가</span><input class="bx" data-k="k" aria-label="몇 배"><em class="u">배</em></div>`,
      check:(k,v,n)=>{ if(k==='k') return Math.abs(v-1.2)<.001?{ok:'맞아요 — 모든 거리가 1.2배. 이제 C'}:{no:v===2?'늘어난 거리(2)가 아니라 몇 배가 됐는지':n<2?'다시 — 12 ÷ 10':'지금 거리 ÷ 출발 때 거리'};
        return v===48?{ok:'정답 — 40 × 1.2 = 48. 멀리 있는 은하일수록 더 많이 멀어졌다'}:{no:v===42?'C 도 2만 늘어난 게 아니에요. 같은 비율로':n<2?'다시 — 40 × 1.2':'계산기에서 40 × 1.2 ='}; } });
    await TALK.say([DN('멀수록 더 많이 멀어졌네요. 그럼 우리가 우주 한가운데에 있는 거예요?'),ME('풍선으로 보자.')]);
    // 풍선 실험 : 점(은하)이 찍힌 풍선을 분다. 어느 점에서 봐도 나머지가 멀어진다
    const DOTS=[[-.5,-.3],[.1,-.55],[.55,-.1],[.3,.45],[-.25,.5],[-.65,.2],[-.12,.08]];      // 마지막 = 우리 (일부러 한가운데가 아니다)
    await STORY.sim('BALLOON · 팽창하는 풍선','풍선을 끝까지 불어 보자 — 빨간 점(우리)에서 보면 다른 점들은 어떻게 될까?',{min:1,max:3,step:.1,val:1,unit:' 배',fmt:v=>v.toFixed(1)},
      (g,W,H,s)=>{ g.fillStyle='#040506'; g.fillRect(0,0,W,H); const cx=W/2, cy=H/2, R=72*s;
        g.fillStyle='rgba(255,120,110,.18)'; g.strokeStyle='rgba(255,140,120,.6)'; g.beginPath(); g.arc(cx,cy,R*1.18,0,7); g.fill(); g.stroke();
        const me=DOTS[6]; DOTS.forEach(([x,y],i)=>{ const X=cx+x*R, Y=cy+y*R;
          if(i!==6){ g.strokeStyle='rgba(159,216,255,.5)'; g.setLineDash([5,6]); g.beginPath(); g.moveTo(cx+me[0]*R,cy+me[1]*R); g.lineTo(X,Y); g.stroke(); g.setLineDash([]); }
          g.fillStyle=i===6?'#ff5a36':'#e9e7e2'; g.beginPath(); g.arc(X,Y,7,0,7); g.fill(); });
        g.fillStyle='rgba(233,231,226,.7)'; g.font='500 20px "IBM Plex Sans KR",sans-serif'; g.textAlign='left'; g.fillText('빨간 점 = 우리은하 · 흰 점 = 다른 은하',30,40); },
      s=>s>=3,s=>'끝까지 불어 보자 — 지금 '+s.toFixed(1)+' 배');
    await STORY.pick('EXPANSION · 팽창하는 우주',['보기'],[['우리은하가 우주의 중심이다'],['웜홀이 우주의 중심이다'],['가장 먼 은하가 중심이다'],['중심이 없다 — 어느 은하에서 보아도 다른 은하들이 멀어진다']],[
      {q:'풍선의 어느 점에서 보아도 다른 점들이 멀어졌다. 팽창하는 우주의 중심은?',ans:3,ok:'맞아요 — 공간 전체가 늘어나서, 중심이 따로 없다',hint:(i,n)=>n>=2?'흰 점 하나를 우리라고 해도 똑같이 보인다':'다시 — 다른 점에 서서 보면?'}]);
    await TALK.say([VG('웜홀이 닫히기까지 약 20분. 2호의 엔진으로는 늦습니다. 기관실의 탈출 포드는 웜홀을 지날 수 있습니다. 두 사람이 탈 수 있습니다.'),
      DN('…딱 둘이네요.'),VG('경고. 동면 구역 C 냉각제 소진. 안에서 움직임.'),ME('깨어났다. 다니엘, 기관실로! 뛰어!')]);
    STORY.seated(false); f.run9=true;
    while(!(await this.run())){ ALIEN.clear(); warp(2,10.4,-Math.PI/2); await sleep(400); await fade(false,800); S.phase='play'; P.free=true; toast('다시 — 멈추지 말고 달려',2400); }
    await this.pod(); },
  // 마지막 추격 : 함교 앞 복도 → 기관실 포드 해치 (x 71 · z 6). 동면 구역 앞을 지나면 성체가 뛰쳐나온다
  async run(){ ['cryo','engine','bridge'].forEach(k=>SHIP.doors[k]&&SHIP.doors[k].open()); STORY.dark(true,{red:true}); SHIP.dim=.3;
    goal('기관실 탈출 포드까지 달린다 (복도 동쪽 끝 → 기관실 동쪽 벽)');
    // 동면 구역 문(x 27)을 지나 몇 걸음 더 간 뒤(x 33)에야 뒤에서 문을 부수고 나온다 → 계속 달리면 따돌린다 (성체 3.1 < 달리기 3.74 m/s)
    //   앞에서 튀어나오면 좁은 복도에서 비켜 갈 수가 없다 (예전엔 늘 잡혔다)
    const a=await ALIEN.spawn({at:{x:27,z:7.2},face:0,height:2.7,clip:'idle'}); a.h=2.7; let out=false, ready=false; S.run=true; $('#run').classList.add('on');
    const trig=async()=>{ if(out||P.x<33) return; out=true; TICK.splice(TICK.indexOf(trig),1); THUD(.6); GROWL(.12); camera.position.y+=.05;
      await ALIEN.go(a,[[27,10.4]],{speed:3,clip:'run'}); ALIEN.play(a,'roar',{once:true}); AUDIO.tone(90,1.4,'sawtooth',.09,0,-30); toast('뒤에서 — 뛰어!',1600); await sleep(700); ready=true; };
    TICK.push(trig);
    const ok=await STORY.chase(a,{to:{x:69.6,z:6.2},r:1.8,speed:3.1,clip:'run',catchR:1.4,started:()=>ready});
    S.run=false; $('#run').classList.remove('on'); if(ok) ALIEN.go(a,[[60,10.3]],{speed:2.2,clip:'walk'}); return ok; },
  // 포드 : 해치를 열고 탄다 → 분리 → 웜홀 → 하얗게
  async pod(){ goal(''); S.phase='cut'; P.free=false; AUDIO.noise(.8,.2,0,900); await fade(true,700); ALIEN.clear(); STORY.unhold();
    STORY.dark(false); SHIP.dim=1; STORY.skyClear(); const pr=SHIP.rooms.story, s1=pr.spots.pod1, s2=pr.spots.pod2;
    PEOPLE.list.slice().forEach(p=>PEOPLE.remove(p)); const dn=await PEOPLE.spawn({kind:'daniel',name:'다니엘 로드리게스',role:'기관',at:{x:s2.x,z:s2.z,yaw:-Math.PI/2},pose:'sit',seatY:.66}); STORY.dn=dn;
    warp(s1.x,s1.z,-Math.PI/2); P.eye=1.25; P.yaw=-Math.PI/2-.3; P.pitch=.06; SHIP.dim=.6; await SKY.space({dir:[1,.02,0],R:.16,jupiter:false,sunDir:[0,.5,1]}); SKYMASK.set(false);      // 포드 창은 배 유리 가림판(SKYMASK) 밖이다
    await fade(false,900); const DN=sayer('다니엘',dn), POD=t=>({who:'포드',kind:'vega',ch:'POD-1',t});
    // 몸으로 : 해치를 두드리는 소리 속에서 분리 볼트 셋을 직접 터뜨린다
    const bang=setInterval(()=>{ AUDIO.noise(.35,.35,0,400); camera.position.x+=(Math.random()-.5)*.03; },900);
    await TALK.say([POD('자동 분리 실패. 분리 볼트 셋을 수동으로 터뜨려 주십시오.'),DN('해치를 두드려요! 빨리요, 선장님!')]);
    S.phase='play'; await STORY.qte('RELEASE · 분리 볼트','볼트 셋 — 하나씩',3); clearInterval(bang); S.phase='cut'; P.free=false;
    await TALK.say([POD('분리.'),DN('2호… 잘 있어.')]);
    let k=0; const shake=dt=>{ k+=dt; const e=Math.min(1,k/9); SKY.U.R.value=.16+e*1.6; SKY.U.tun.value=Math.max(0,(e-.4)/.6); camera.position.x+=(Math.random()-.5)*.02*e; camera.position.y+=(Math.random()-.5)*.02*e; }; TICK.push(shake); AUDIO.hum(1.6,30);
    await TALK.say([VG('…하위헌스 2호, 선체 응력 한계. 선장님, 잘 가십시오.'),ME('고마웠어, 베가.')]);
    while(k<9) await sleep(200);
    const fe=$('#fade'); fe.style.background='#fff'; await fade(true,600); TICK.splice(TICK.indexOf(shake),1); await sleep(1400);
    await EPILOGUE.start(); },
};

/* 에필로그 : 목성 궤도 · 격리 적외선 검사 */
const EPILOGUE={
  async start(){ const f=S.flags; f.epilogue=true; S.phase='cut'; P.free=false; goal('');
    const pr=SHIP.rooms.story; let dn=STORY.dn;
    if(!dn){ PEOPLE.list.slice().forEach(p=>PEOPLE.remove(p)); const s2=pr.spots.pod2; dn=STORY.dn=await PEOPLE.spawn({kind:'daniel',name:'다니엘 로드리게스',role:'기관',at:{x:s2.x,z:s2.z,yaw:-Math.PI/2},pose:'sit',seatY:.66}); }
    STORY.skyClear(); const s1=pr.spots.pod1; warp(s1.x,s1.z,-Math.PI/2); P.eye=1.25; P.yaw=-Math.PI/2-.3; P.pitch=.06; STORY.dark(false); SHIP.dim=.6;
    await SKY.space({jupiter:true,jdir:[1,-.12,.25],jsize:.75,sunDir:[.2,.4,1]}); SKYMASK.set(false); AUDIO.hum(.6,48);
    const fe=$('#fade'); fe.style.background=''; fe.classList.add('on'); await card('에필로그','목성 궤도','탈출 포드 1 · 웜홀을 나온 지 여섯 시간',3200); await fade(false,1600);
    const DN=sayer('다니엘',dn), POD=t=>({who:'포드',kind:'vega',ch:'POD-1',t}), NASA=t=>({who:'휴스턴',ch:'NASA',kind:'radio',t});
    await TALK.say([NASA('하위헌스 포드, 여기는 휴스턴. 신호 받았다. …살아 돌아왔군. 정말로.'),ME('둘입니다. 둘만.'),
      NASA('구조선이 가고 있다. 그 전에 격리 절차부터. 포드 적외선 검사를 시작해 주게.'),POD('격리 적외선 검사를 시작합니다. 움직이지 마십시오.')]);
    // 스캐너 고리가 선실을 지나간다 → 열화상
    const ring=pr.items.podscan; if(ring){ const x0=ring.position.x; let t=0; await new Promise(r=>{ const fn=dt=>{ t+=dt; ring.position.x=x0+Math.sin(t*1.2)*1.2; if(t>3.4){ ring.position.x=x0; TICK.splice(TICK.indexOf(fn),1); r(); } }; TICK.push(fn); AUDIO.tone(300,3.2,'sine',.03,0,200); }); }
    await this.thermal();
    await TALK.say([POD('대원 1 크리스 — 정상. 대원 2 다니엘 로드리게스 — 흉부 고온 반응 일곱 곳.'),ME('…다니엘.')]);
    await camTo({x:P.x,z:P.z,yaw:yawTo(dn.wrap.position.x,dn.wrap.position.z),pitch:-.08,eye:1.25},1.4); P.look=true;      // 옆자리 다니엘을 본다
    await TALK.say([DN('…'),DN('집에 왔네요.')]);
    S.phase='cut'; await sleep(600); fe.style.transitionDuration='0ms'; fe.classList.add('on'); AUDIO.hum(0,40); await sleep(2600);
    await card('','MAYDAY','“Mayday, Mayday, we are—”',5200);
    await card('','끝','과학2 Ⅷ 별과 우주 · 하위헌스 2호의 기록',4200); goal(''); },
  // 열화상 : 화면 가득 — 사람 둘(차가운 파랑 → 뜨거운 노랑), 다니엘 가슴에 하얗게 뜨거운 점 일곱 개가 뛴다
  thermal(){ return new Promise(res=>{ const el=document.createElement('div'); el.id='thermal'; const cv=document.createElement('canvas'); cv.width=1280; cv.height=720; el.appendChild(cv);
    const cap=document.createElement('p'); cap.textContent='IR · 격리 검사 · 흉부 고온 반응 7'; el.appendChild(cap); document.body.appendChild(el); requestAnimationFrame(()=>el.classList.add('on'));
    const g=cv.getContext('2d'); let t=0;
    const body=(x,s)=>{ const gr=g.createRadialGradient(x,380,20,x,380,260*s); gr.addColorStop(0,'rgba(255,170,40,.95)'); gr.addColorStop(.4,'rgba(220,40,80,.85)'); gr.addColorStop(1,'rgba(40,20,120,0)');
      g.fillStyle=gr; g.beginPath(); g.ellipse(x,200,70*s,85*s,0,0,7); g.fill(); g.beginPath(); g.moveTo(x-150*s,720); g.quadraticCurveTo(x-170*s,330,x,290); g.quadraticCurveTo(x+170*s,330,x+150*s,720); g.fill(); };
    const fn=dt=>{ t+=dt; g.fillStyle='#0a0630'; g.fillRect(0,0,1280,720); body(380,1); body(900,1.05);
      for(let i=0;i<7;i++){ const x=900+Math.cos(i*2.4)*60+(i%3-1)*30, y=430+Math.sin(i*1.7)*70, r=14+5*Math.sin(t*5+i), gr=g.createRadialGradient(x,y,0,x,y,r*2.4);
        gr.addColorStop(0,'#fff'); gr.addColorStop(.35,'#fff36a'); gr.addColorStop(1,'rgba(255,200,0,0)'); g.fillStyle=gr; g.beginPath(); g.arc(x,y,r*2.4,0,7); g.fill(); }
      g.fillStyle='rgba(255,255,255,.8)'; g.font='500 22px "IBM Plex Mono",monospace'; g.textAlign='center'; g.fillText('대원 1 · 36.6 ℃',380,700); g.fillText('대원 2 · 37.0 ℃ · ▲ 7',900,700);
      if(t>5.5){ TICK.splice(TICK.indexOf(fn),1); el.classList.remove('on'); setTimeout(()=>el.remove(),600); res(); } };
    TICK.push(fn); AUDIO.tone(1200,.08,'square',.03); }); },
};

SCENES.ch9={title:'9장 · 증발하는 웜홀', async enter(){ Object.assign(S.flags,{route:true,transit:true,passed:true,bridgeIn:true,where:true,ch2:true,ch2done:true,ch3:true,ch4:true,ch5:true,leahSaved:true,ch6:true,leahDead:true,ch7:true,owenGone:true,ch8:true,seojunGone:true,mayaGone:true,danielBit:true});
  await SCENES.ship.enter({at:'bridge'}); S.phase='play'; await CH9.start(); }};
SCENES.epilogue={title:'에필로그', async enter(){ Object.assign(S.flags,{passed:true,ch9:true});
  await SCENES.ship.enter({at:'bridge'}); await EPILOGUE.start(); }};
