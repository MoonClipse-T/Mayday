/* ============================================================
   5장 · 유령선 — 하위헌스 1호 (2호와 같은 설계의 자매선 → 같은 공간을 암흑 · 손전등 · 피 자국으로)
   에어록으로 건너간다 → 영하 12도 · 끌린 자국 · 손자국 · 시신 가방 셋 → 동면 구역은 전원이 없어 잠김
   → 1호 함교 : 주성을 다시 설정해야 컴퓨터가 깬다 — 별빛 색 실험(표면 온도 밀대) → 1호 별 목록에서 창밖의 별 고르기
   → 레아의 기록 "차가우면 그것도 잠들까" → 동면 캡슐 속 레아 → 해동 · 2호로
   과학 (교과서 색 · 온도) : 청색 30,000 K · 청백색 20,000 · 백색 10,000 · 황백색 7,500 · 황색 6,000 · 주황색 4,500 · 적색 3,000
   ============================================================ */
'use strict';
const STARCOL=[[3000,[255,106,58],'적색'],[4500,[255,169,90],'주황색'],[6000,[255,236,150],'황색'],[7500,[255,246,222],'황백색'],[10000,[240,244,255],'백색'],[20000,[186,206,255],'청백색'],[30000,[150,182,255],'청색']];
const starRGB=T=>{ const c=STARCOL; if(T<=c[0][0]) return c[0][1]; for(let i=1;i<c.length;i++) if(T<=c[i][0]){ const k=(T-c[i-1][0])/(c[i][0]-c[i-1][0]); return c[i-1][1].map((v,j)=>Math.round(v+(c[i][1][j]-v)*k)); } return c[c.length-1][1]; };
// 따라오기 : 동행하는 사람이 내 뒤 1.5 m 쯤을 따라 걷는다
STORY.follow=function(p){ const f=()=>{ if(!PEOPLE.list.includes(p)){ TICK.splice(TICK.indexOf(f),1); return; } const w=p.wrap.position, d=Math.hypot(P.x-w.x,P.z-w.z);
    if(d>9){ p.path=null; w.set(P.x-Math.sin(P.yaw)*-1.6,0,P.z-Math.cos(P.yaw)*-1.6); return; }      // 멀리 처졌으면 내 뒤로
    if(d>2.6&&!p.path){ const k=(d-1.5)/d; PEOPLE.walk(p,[[w.x+(P.x-w.x)*k,w.z+(P.z-w.z)*k]],1.6); } }; TICK.push(f); };
// 함교 대원 (앉은 셋) 보이기 · 숨기기
STORY.seated=function(on){ const c=SHIP.crew; ['maya','seojun','daniel'].forEach(k=>{ const p=c[k]; if(p){ p.wrap.visible=on; p.solid=on; p.pick.visible=on; } }); };

const CH5={
  async start(){ const f=S.flags, {me,V,MY,SJ,DN,OW}=STORY.L(); f.ch5=true; STORY.crew(); if(!f.jump1){ f.jump1=true; CH3.sky(); }
    const LOG=t=>({who:'1호 기록',ch:'HUY-1 LOG',kind:'radio',t}), VR=t=>({who:'VEGA',ch:'무전 · 2호',kind:'vega',t});
    await TALK.say([V('1호까지 2 km. 응답 없음. 선체 불빛 없음.'),MY('…우리 배랑 똑같이 생겼어요.'),SJ('자매선이니까요. 설계도가 같아요. 방 배치도 똑같을 거예요.'),
      V('에어록 도킹 완료. 1호 안 생명 신호 — 하나. 아주 약합니다.'),OW('제가 같이 갑니다, 선장님.'),me('마야, 배를 부탁해. 서준, 다니엘은 통신을 열어 둬.')]);
    f.dock=true; SHIP.lock.airlock=null; goal('복도 동쪽 끝 에어록으로 간다');
    const ow=SHIP.crew.owen; ow.wrap.position.set(49.2,0,10.9); ow.wrap.rotation.y=Math.PI/2;
    await STORY.reach(50.43,7.1,1.1);
    // 1호로 : 같은 공간을 어둡게 · 피 자국 · 2호 대원은 이 배에 없다
    S.phase='cut'; P.free=false; goal(''); AUDIO.noise(1.6,.18,0,600); await fade(true,1200);
    SHIP.huy1=true; SHIP.zone=null; STORY.show('h1',true); STORY.seated(false); STORY.dark(true,{red:true}); HOLO.root.visible=false;
    ['pilotL','pilotR','nav','comms','eng','sci','top','vega'].forEach(k=>{ const m=BRIDGEUI.mesh(k); if(m) m.visible=false; });
    SHIP.lock.cryo=()=>f.h1power?null:'동면 구역 C — 전원이 없습니다. 문이 꿈쩍도 하지 않습니다.';
    SHIP.lock.airlock=()=>f.leahSaved?null:'레아를 찾기 전에는 돌아갈 수 없다.';
    warp(50.43,10.4,Math.PI/2); ow.wrap.position.set(51.6,0,10.9); await card('','하위헌스 1호','도킹 · 내부 온도 영하 12도',2600); await fade(false,1600); S.phase='play'; P.free=true;
    STORY.follow(ow); AUDIO.hum(.4,38);
    await TALK.say([OW('…추워요. 입김이 나요.'),me('손전등 켜. 불이 하나도 없군.'),VR('선장님, 생명 신호는 동면 구역 C 쪽입니다.'),
      OW('동면 구역은 전원이 없으면 안 열려요. 우리 배랑 같다면… 기관실에 비상 발전기가 있어요.')]);
    // 몸으로 : 1호 기관실 비상 발전기를 손으로 돌린다 → 불이 조금 들어온다
    const gen=STORY.it('genlever'), arm=gen&&gen.getObjectByName('gen_arm');
    await STORY.at(gen,'비상 발전기 — 손잡이를 돌린다','1호 기관실(복도 동쪽 끝) 남쪽 벽의 비상 발전기를 돌린다',{range:2.8,up:.9});
    await STORY.qte('GENERATOR · 비상 발전기','손잡이를 힘껏 — 박자에 맞춰',3);
    if(arm) arm.rotation.x=-1.2; AUDIO.tone(70,1.6,'sawtooth',.07,0,60); STORY.dark(true,{red:false}); SHIP.dim=.42;
    await TALK.say([OW('불이… 들어와요. 조금이지만.'),VR('1호 비상 전원 일부 복구. 함교 컴퓨터를 깨울 수 있습니다.')]);
    goal('1호 함교에서 컴퓨터를 깨운다 (복도 서쪽 끝)');
    // 복도 천장 환기구 아래를 지날 때 : 위에서 무언가 긁는 소리
    { const vg=STORY.it('vent_hall'), gr=vg&&vg.getObjectByName('vent_grate_hall'); const fn=()=>{ if(Math.abs(P.x-34)<1.6&&P.z>8.9){ TICK.splice(TICK.indexOf(fn),1); AUDIO.noise(.8,.25,0,900); AUDIO.tone(1400,.3,'sawtooth',.03,0,-900);
        if(gr){ let k=0; const sh=dt=>{ k+=dt; gr.position.x=Math.sin(k*60)*.02; if(k>.8){ gr.position.x=0; TICK.splice(TICK.indexOf(sh),1); } }; TICK.push(sh); }
        TALK.say([OW('…방금, 천장에서 뭐가 긁었어요.'),me('계속 가. 멈추지 마.')]); } }; TICK.push(fn); }
    // 지나가며 보는 것 : 끌린 자국 · 시신 가방 (한 번씩)
    const seen=(x,z,r,lines)=>{ const fn=()=>{ if(Math.hypot(P.x-x,P.z-z)<r&&!TALK.on){ TICK.splice(TICK.indexOf(fn),1); TALK.say(lines); } }; TICK.push(fn); };
    seen(27,9.6,2.6,[me('…끌고 간 자국이다. 동면실 쪽으로.'),OW('손자국이… 벽을 짚고 버틴 것 같아요.')]);
    seen(11.6,5.6,2.4,[OW('시신 가방… 셋.'),me('1호 대원은 열둘이었다. 나머지는?'),OW('…모르겠어요.')]);
    const b=SHIP.rooms.bridge.spots.sci||{x:3.2,z:-3.6}, box=new THREE.Mesh(new THREE.BoxGeometry(1.2,1.6,1.2),PICK); box.position.set(b.x,.9,b.z); WORLD.add(box);
    await STORY.at(box,'1호 과학 스테이션 — 비상 전원','1호 함교 과학 스테이션에서 컴퓨터를 깨운다',{range:3});
    await TALK.say([{who:'1호 컴퓨터',kind:'vega',ch:'HUY-1',t:'비상 시동. 항법 기준 소실. 주성을 다시 설정하십시오.'},OW('주성이요?'),
      me('이 배가 도는 별. 창밖의 별 B 를 목록에서 골라 주면 깨어난다는 거야. 색으로 온도를 맞춰 보자.')]);
    await STORY.sim('STAR COLOR · 별빛 색과 표면 온도','밀대로 표면 온도를 바꿔, 실험 별의 색을 <b>창밖의 별 B</b> 와 같게 맞추자',{min:3000,max:30000,step:500,val:15000,unit:' K',fmt:v=>v.toLocaleString()},
      (g,W,H,T)=>{ g.fillStyle='#040506'; g.fillRect(0,0,W,H);
        const ball=(x,y,rgb,lab)=>{ const gr=g.createRadialGradient(x,y,0,x,y,150); gr.addColorStop(0,'#fff'); gr.addColorStop(.25,`rgb(${rgb})`); gr.addColorStop(1,'rgba(0,0,0,0)'); g.fillStyle=gr; g.beginPath(); g.arc(x,y,150,0,7); g.fill();
          g.fillStyle='rgba(233,231,226,.75)'; g.font='600 24px "IBM Plex Sans KR",sans-serif'; g.textAlign='center'; g.fillText(lab,x,y+190); };
        ball(330,200,starRGB(4500).join(','),'창밖의 별 B'); ball(870,200,starRGB(T).join(','),'실험 별 · '+T.toLocaleString()+' K');
        const y0=H-58; for(let x=0;x<W-120;x++){ const t=3000+x/(W-120)*27000; g.fillStyle=`rgb(${starRGB(t)})`; g.fillRect(60+x,y0,1,16); }
        g.fillStyle='#e9e7e2'; g.beginPath(); const mx=60+(T-3000)/27000*(W-120); g.moveTo(mx,y0-4); g.lineTo(mx-8,y0-16); g.lineTo(mx+8,y0-16); g.fill(); },
      T=>T>=4000&&T<=5000,T=>T<4000?'너무 붉어요 — 온도를 조금 올리자':T<6500?'조금 노래요 — 온도를 낮추자':'파랗게 보이면 아주 뜨거운 별 — 온도를 많이 낮추자');
    await STORY.pick('HUY-1 STAR CATALOG · 1호 별 목록',['별','색','표면 온도'],[['K-1','청백색','20,000 K'],['K-2','황색','6,000 K'],['K-3','주황색','4,500 K'],['K-4','적색','3,000 K'],['K-5','백색','10,000 K']],[
      {q:'이 배가 도는 별 — <b>창밖의 별 B</b> 는?',ans:2,ok:'주성 설정 : K-3 · 주황색 · 4,500 K',hint:(i,n)=>n>=2?'방금 맞춘 색 — 4,000 ~ 5,000 K':'다시 — 창밖의 별은 무슨 색이었지?'},
      {q:'목록에서 표면 온도가 <b>가장 높은</b> 별은?',ans:0,ok:'맞아요 — 파란빛을 띨수록 뜨겁다',hint:(i,n)=>i===3?'붉은 별은 온도가 낮아요':'파란빛에 가까운 별일수록 뜨거워요'}]);
    f.h1power=true; AUDIO.tone(220,.8,'sine',.05); AUDIO.tone(440,.6,'sine',.05,.3); STORY.dark(true,{red:false});
    await TALK.say([{who:'1호 컴퓨터',kind:'vega',ch:'HUY-1',t:'주성 설정 완료. 비상 전원 — 동면 구역 C. 마지막 기록을 재생합니다.'},
      LOG('…레아 문. 312일째. 다들… 다들 없어졌어. 나는 동면 캡슐로 들어간다.'),LOG('차가우면… 그것도 잠들까.'),OW('"그것"이요?'),me('동면 구역으로.')]);
    goal('동면 구역 C 로 간다');
    // 레아 : 오른쪽 둘째 캡슐 안에 누워 있다 (닫힌 캡슐)
    const cr=SHIP.rooms.cryo; cr.podSet('R3',false); const s=cr.pods.R3.s;
    const le=STORY.leah=await PEOPLE.spawn({kind:'sophia',name:'레아 문',role:'1호 생물학자',at:{x:s.x,z:s.z,yaw:0}}); le.sleep=true; le.watch=false; le.solid=false;
    le.wrap.rotation.set(-Math.PI/2,0,0); le.wrap.position.set(s.x,.7,s.z+.86);
    const pb=new THREE.Mesh(new THREE.BoxGeometry(1.2,1.6,2.5),PICK); pb.position.set(s.x,.8,s.z); WORLD.add(pb);
    await STORY.wait(pb,'동면 캡슐 C-03 — 레아 문 · 해동',{range:3});
    S.phase='cut'; P.free=false; await camTo({x:s.x-1.5,z:s.z+.5,yaw:yawTo(s.x,s.z+.5),pitch:-.42,eye:1.66},1); P.look=true;      // 캡슐을 내려다본다
    AUDIO.noise(1.6,.12,0,5000,'highpass'); await sleep(1600); cr.podSet('R3',true); AUDIO.noise(.6,.1,0,2400);
    await TALK.say([STORY.L().LE('…하아… 누, 누구… 2호? 진짜… 사람이에요?'),me('하위헌스 2호 선장, 크리스. 집에 데려다줄게요.'),STORY.L().LE('추워… 너무 추워요. 다들… 다들 그게…'),
      OW('지금은 말하지 마요. 업을게요.')]);
    f.leahSaved=true; P.look=false; S.phase='play';
    await STORY.next('5장 · 유령선 — 끝','6장 · 손님',()=>CH6.start()); },
};

/* ============================================================
   6장 · 손님 — 2호 식당. 레아가 1호의 귀환 항로를 알려 준다 (웜홀 출구는 성단 둘 사이)
   성단 나누기 : 산개 성단 (별 수백~수천 · 엉성 · 젊고 파란 별 · 은하 원반) / 구상 성단 (수만~수십만 · 공 모양 · 늙고 붉은 별 · 헤일로)
   → 저녁 식사 → 정전 → 벽의 그림자로 탄생 (상처는 보이지 않는다) → 레아 죽음 · 식당 바닥 환기구로 무언가가 들어갔다
   ============================================================ */
const CH6={
  async start(){ const f=S.flags; f.ch6=true; f.leahSaved=true; STORY.crew(); if(!f.jump1){ f.jump1=true; CH3.sky(); }
    // 다시 2호 : 불 · 대원
    SHIP.huy1=false; SHIP.zone=null; STORY.show('h1',false); STORY.dark(false); STORY.seated(false);
    ['pilotL','pilotR','nav','comms','eng','sci','top','vega'].forEach(k=>{ const m=BRIDGEUI.mesh(k); if(m) m.visible=true; });
    SHIP.lock={}; PEOPLE.list.filter(p=>p===STORY.leah||p===SHIP.crew.owen).forEach(p=>PEOPLE.remove(p)); SHIP.crew.owen=null;
    await this.invite();
    // 식당 탁자 (x 13.3 ~ 16, z 0.35 ~ 2.45) 둘레에 선다
    const T={x:14.6,z:1.4}, face=(x,z)=>Math.atan2(x-T.x,z-T.z), at=(x,z)=>({x,z,yaw:face(x,z)});
    const [le,my,sj,dn,ow]=await Promise.all([PEOPLE.spawn({kind:'sophia',name:'레아 문',role:'1호 생물학자',at:at(16.5,.4)}),PEOPLE.spawn({kind:'maya',name:'마야 첸',role:'부선장',at:at(12.7,.9)}),
      PEOPLE.spawn({kind:'seojun',name:'한서준',role:'항법',at:at(12.7,2.0)}),PEOPLE.spawn({kind:'daniel',name:'다니엘 로드리게스',role:'기관',at:at(14.6,3.3)}),PEOPLE.spawn({kind:'owen',name:'오언 하트',role:'보안',at:at(16.5,2.5)})]);
    STORY.leah=le; const C={maya:my,seojun:sj,daniel:dn,owen:ow}; this.cast=C;
    const w=(who,npc)=>t=>({who,t,npc}), me=t=>({kind:'me',t}), V=t=>({who:'VEGA',kind:'vega',t}), LE=w('레아',le), MY=w('마야',my), SJ=w('서준',sj), DN=w('다니엘',dn), OW=w('오언',ow);
    warp(14.6,-.6,0); P.yaw=Math.PI; SHIP.zone=null; AUDIO.hum(1,44); await fade(false,1200); S.phase='play'; P.free=false; P.look=true;
    await TALK.say([LE('다들 와 줬네요. …몇 달 만에 사람들이랑 먹는 밥이에요.'),MY('천천히 먹어요. 아무도 안 뺏어 가요.'),
      SJ('레아 씨, 1호는 어떻게 돌아가려고 했어요? 웜홀 출구가 이쪽에선 안 보여요.'),
      LE('1호 항법사가 별무리 두 개로 길을 잡았어요. 웜홀 출구는 그 둘 사이에 있어요. 하나는 엉성한 별무리, 하나는 공처럼 빽빽한 별무리.'),
      me('산개 성단과 구상 성단이군. 둘을 헷갈리면 엉뚱한 데로 간다. 정리해 보자.')]);
    const thumb=(kind)=>{ const c=document.createElement('canvas'); c.width=220; c.height=140; const g=c.getContext('2d'); g.fillStyle='#05070a'; g.fillRect(0,0,220,140);
      let s=kind?3:9; const r=()=>(s=(s*16807)%2147483647)/2147483647;
      if(kind){ for(let i=0;i<900;i++){ const a=r()*7, d=Math.pow(r(),2.2)*60; g.fillStyle=`rgba(255,${200+r()*40|0},${150+r()*40|0},${.5+r()*.5})`; g.fillRect(110+Math.cos(a)*d,70+Math.sin(a)*d,1.6,1.6); } }
      else for(let i=0;i<60;i++){ const x=40+r()*140, y=20+r()*100, b=1+r()*2.5; g.fillStyle=`rgba(${170+r()*40|0},${200+r()*40|0},255,.95)`; g.beginPath(); g.arc(x,y,b,0,7); g.fill(); }
      return c.toDataURL(); };
    goal('레아의 별무리 둘을 산개 성단 · 구상 성단으로 나눈다');
    await STORY.sort('CLUSTERS · 귀환 항로의 별무리 둘',`<span class="pics"><img src="${thumb(0)}" alt="엉성한 별무리"><img src="${thumb(1)}" alt="빽빽한 별무리"></span>카드를 누르고, 알맞은 칸을 누르자`,['산개 성단','구상 성단'],
      [['엉성하게 흩어진 별무리 (왼쪽 그림)',0],['공 모양으로 빽빽한 별무리 (오른쪽 그림)',1],['별 수백 ~ 수천 개',0],['별 수만 ~ 수십만 개',1],['젊고 파란 별이 많다',0],['늙고 붉은 별이 많다',1],['은하 원반 · 나선팔에 있다',0],['은하 중심 둘레 · 헤일로에 있다',1]],
      i=>i%2?'빽빽한 공 모양 = 오래된 별들이 모인 구상 성단':'엉성한 별무리 = 젊은 별들이 모인 산개 성단');
    goal(''); await TALK.say([SJ('파란 산개 성단과 붉은 구상 성단 사이. 항로 잡았어요.'),LE('…고마워요. 정말로.'),DN('자, 건배! 집으로 가는 길에.'),
      LE('…잠깐만요. 가슴이… 좀 답답해서.'),OW('괜찮아요? 얼굴이 하얘요.')]);
    // 정전 → 붉은 비상등 하나 → 벽의 그림자
    S.phase='cut'; P.free=false; AUDIO.tone(60,.6,'sawtooth',.08); STORY.dark(true,{red:true}); SHIP.dim=.12; le.wrap.visible=false;
    await TALK.say([V('주 전원 이상. 비상등으로 전환합니다.'),MY('뭐야, 갑자기—'),LE('아, 아아…!')]);
    await this.shadow();
    SHIP.dim=.3; le.wrap.visible=true; le.sleep=true; le.watch=false; le.solid=false; le.wrap.rotation.set(-Math.PI/2,0,.4); le.wrap.position.set(16.7,.12,.0);
    const gr=STORY.it('vent_deck'); const gt=gr&&gr.getObjectByName('vent_grate_deck'); if(gt){ gt.position.set(.55,.25,.06); gt.rotation.set(.6,.3,0); }
    STORY.dark(false); SHIP.dim=.55; AUDIO.hum(.8,40);
    await TALK.say([V('주 전원 복구.'),OW('레아 씨! 레아—'),MY('…숨을 안 쉬어요.'),SJ('바닥 환기구 창살이… 뜯겨 있어요.'),
      OW('뭔가 들어갔어요. 고양이만 한 게… 환기구로.'),me('…"차가우면 그것도 잠들까." 레아가 데려온 거야. 몸속에.'),DN('그럼 지금 그게… 이 배 안에 있다고요?')]);
    f.leahDead=true; S.phase='play';
    await STORY.next('6장 · 손님 — 끝','7장 · 사냥',()=>CH7.start()); },
  // 몸으로 : 저녁 전에 배를 한 바퀴 — 함교 · 연구실 · 라운지 · 기관실의 대원을 직접 불러 온다 (레아는 식당에서 기다린다)
  async invite(){ const me=t=>({kind:'me',t}), at=(x,z,tx,tz)=>({x,z,yaw:Math.atan2(x-tx,z-tz)});
    const le=await PEOPLE.spawn({kind:'sophia',name:'레아 문',role:'1호 생물학자',at:at(16.5,.4,14.6,-.6)});
    const W=[['maya','마야 첸','부선장',0,-1.2,0,-4,'마야','어머, 다 같이요? 좋아요. 조종은 자동으로 걸어 둘게요.'],['seojun','한서준','항법',40.6,4.4,42.7,2.6,'서준','레아 씨 1호 항로 자료 보고 있었어요. 밥 먹으면서 물어봐야겠다.'],
      ['owen','오언 하트','보안',20.5,17.4,20.5,22,'오언','…레아 씨랑 같이요? 네. 저도 가죠. 가까이 앉을게요.'],['daniel','다니엘 로드리게스','기관',59.2,10.3,63.3,10.35,'다니엘','밥이요?! 원자로는 혼자서도 잘 돌아가요. 바로 갈게요!']];
    const ppl=await Promise.all(W.map(([k,n,r,x,z,tx,tz])=>PEOPLE.spawn({kind:k,name:n,role:r,at:at(x,z,tx,tz)})));
    warp(14.6,-.6,0); P.yaw=Math.PI; SHIP.zone=null; await card('','하루 뒤','하위헌스 2호 · 식당',2400); S.phase='play'; P.free=true;
    await TALK.say([{who:'레아',t:'…따뜻하다. 하루 종일 이 말만 하네요.',npc:le},me('오늘 저녁은 다 같이 먹자. 대원들을 불러올게요. 여기서 기다려요.')]);
    goal('대원 넷을 저녁 식사에 부른다 — 함교 · 연구실 · 라운지 · 기관실');
    await new Promise(res=>{ let left=W.length; ppl.forEach((p,i)=>{ const w=W[i], un=STORY.mark(w[3],2.3,w[4]); let done=false;
      PEOPLE.talkable(p,async()=>{ if(done) return TALK.say([{who:w[7],t:'식당에서 봐요.',npc:p}]); done=true; un(); await TALK.say([me('저녁 같이 먹자. 식당으로.'),{who:w[7],t:w[8],npc:p}]);
        left--; goal(left?'대원 '+left+'명 남았다 — 함교 · 연구실 · 라운지 · 기관실':''); if(!left) res(); }); }); });
    await STORY.go(14.6,-.2,'모두 불렀다 — 식당으로 돌아간다',{r:1.6});
    S.phase='cut'; P.free=false; await fade(true,900); [le,...ppl].forEach(p=>PEOPLE.remove(p)); },
  // 벽의 그림자 : 식당 안쪽 칸 벽(x 19.66)에 비친 레아의 그림자 — 몸이 떨리고, 가슴에서 작은 것이 튀어나와 달아난다 (그림자만)
  shadow(){ return new Promise(res=>{ const W=512, H=600, cv=document.createElement('canvas'); cv.width=W; cv.height=H; const g=cv.getContext('2d'), tex=new THREE.CanvasTexture(cv);
    const pl=new THREE.Mesh(new THREE.PlaneGeometry(2.2,2.6),new THREE.MeshBasicMaterial({map:tex,transparent:true,depthWrite:false,toneMapped:false}));
    pl.position.set(19.6,1.55,0); pl.rotation.y=-Math.PI/2; WORLD.add(pl);
    const lamp=new THREE.PointLight(0xff2a14,4,12,1.6); lamp.position.set(12.5,2.2,.2); WORLD.add(lamp);
    camTo({x:14.2,z:.3,yaw:-Math.PI/2+.05,pitch:.03,eye:1.66},1.2);
    let t=0; const fn=dt=>{ t+=dt; g.clearRect(0,0,W,H); const lit=g.createRadialGradient(W/2,H*.45,20,W/2,H*.45,W*.62); lit.addColorStop(0,'rgba(255,70,45,.85)'); lit.addColorStop(.6,'rgba(190,30,20,.5)'); lit.addColorStop(1,'rgba(120,10,6,0)'); g.fillStyle=lit; g.fillRect(0,0,W,H);      // 비상등에 붉게 비친 벽
      const sh=t<1.4?0:t<5?Math.sin(t*38)*8*Math.min(1,(t-1.4)):0, bend=t>3.2&&t<5?Math.sin((t-3.2)/1.8*Math.PI)*.35:0;
      g.save(); g.translate(W/2+sh,H); g.rotate(-bend*.3); g.fillStyle='rgba(0,0,0,.9)';
      g.beginPath(); g.ellipse(0,-430,52,62,0,0,7); g.fill();                        // 머리
      g.beginPath(); g.moveTo(-95,-360); g.quadraticCurveTo(-120,-160,-90,0); g.lineTo(90,0); g.quadraticCurveTo(120,-160,95,-360); g.closePath(); g.fill();     // 몸
      if(t>3.6&&t<4.4){ const k=(t-3.6)/.8; g.beginPath(); g.ellipse(0,-260,40+k*20,30+k*14,0,0,7); g.fill(); }   // 가슴이 부풀고
      g.restore();
      if(t>4.4){ const k=Math.min(1,(t-4.4)/1.6), x=W/2+k*210, y=H-300+k*k*220;      // 작은 것이 튀어나와 벽을 따라 달아난다
        g.fillStyle='rgba(0,0,0,.95)'; g.beginPath(); g.ellipse(x,y,46,20,-.3+k*.5,0,7); g.fill(); g.beginPath(); g.moveTo(x-40,y); g.quadraticCurveTo(x-90,y-30,x-120,y+10); g.lineWidth=8; g.strokeStyle='rgba(0,0,0,.9)'; g.stroke();
        for(let i=0;i<4;i++){ g.beginPath(); g.moveTo(x-20+i*14,y+10); g.lineTo(x-28+i*14+Math.sin(t*30+i)*10,y+34); g.lineWidth=5; g.stroke(); } }
      tex.needsUpdate=true;
      if(t>1.4&&t<5&&Math.random()<dt*6) AUDIO.noise(.12,.08,0,300+Math.random()*500);
      if(t>4.4&&t<4.5) AUDIO.tone(900,.4,'sawtooth',.05,0,600);
      if(t>7){ TICK.splice(TICK.indexOf(fn),1); WORLD.remove(pl,lamp); res(); } };
    TICK.push(fn); }); },
};

SCENES.ch5={title:'5장 · 유령선', async enter(){ Object.assign(S.flags,{route:true,transit:true,passed:true,bridgeIn:true,where:true,ch2:true,ch2done:true,beacon:true,photos:true,ch3:true,ch4:true});
  await SCENES.ship.enter({at:'bridge'}); S.phase='play'; await CH5.start(); }};
SCENES.ch6={title:'6장 · 손님', async enter(){ Object.assign(S.flags,{route:true,transit:true,passed:true,bridgeIn:true,where:true,ch2:true,ch2done:true,ch3:true,ch4:true,ch5:true,leahSaved:true});
  await SCENES.ship.enter({at:'deck'}); S.phase='play'; await CH6.start(); }};
