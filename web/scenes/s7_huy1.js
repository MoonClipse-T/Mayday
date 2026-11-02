/* ============================================================
   5장 · 유령선 (2026-11-01 사용자 구성)
     왜 푸나 : 구조 신호는 별 B 에서 온다 — 1호는 생명 가능 지대의 행성을 찾으러 왔으니 B 의 생명 가능 지대에 있을 것
       → B 의 표면 온도를 알아야 그 거리를 안다 → 별빛 색 실험(표면 온도 밀대) · 별 목록 → VEGA : 0.6 AU 궤도에 배 한 척
     도킹 장치가 부서져 있다 → 에어록에서 우주복 → 우주 유영(무중력)으로 1호 해치까지 → 1호 에어록
     1호 : 비상 전력도 없다 · 문은 모두 열려 있다 · 손전등만. 1호 항법 칩(귀환 항로) 회수 + 생존자 찾기
       어둠 속 어딘가에서 소리 · 복도 끝을 지나가는 그림자(성체가 여럿) → 동면 구역 구석에 웅크린 레아 문 (같은 말만 되풀이)
       → 에어록으로 돌아오는 길 : 멀리서 울음 → 닫힌 에어록 문을 무언가 쾅쾅 → 급히 바깥 해치 → 서둘러 2호로
   6장 · 손님 : 2호 연구실 유리 격리실에서 검사 → 피를 토하고 → 가슴에서 기생체가 → 유리창에 들러붙는다
     → 격리실 소각(화염) 승인 → 불이 꺼지면 아무것도 없다 · 바닥 환기구 창살이 열려 있다
     → 집으로 가야 한다 : 1호 칩의 귀환 항로 = 웜홀 출구는 별무리 둘 사이 → 산개 · 구상 성단 가려내기
   과학 (교과서 색 · 온도) : 청색 30,000 K · 청백색 20,000 · 백색 10,000 · 황백색 7,500 · 황색 6,000 · 주황색 4,500 · 적색 3,000
   소품 : Blender 10_하위헌스2호.blend 의 STORY 모음 (IT_iso 격리실 · IT_isopanel · SPOT_isobed · SPOT_isoview)
   ============================================================ */
'use strict';
const STARCOL=[[3000,[255,106,58],'적색'],[4500,[255,169,90],'주황색'],[6000,[255,236,150],'황색'],[7500,[255,246,222],'황백색'],[10000,[240,244,255],'백색'],[20000,[186,206,255],'청백색'],[30000,[150,182,255],'청색']];
const starRGB=T=>{ const c=STARCOL; if(T<=c[0][0]) return c[0][1]; for(let i=1;i<c.length;i++) if(T<=c[i][0]){ const k=(T-c[i-1][0])/(c[i][0]-c[i-1][0]); return c[i-1][1].map((v,j)=>Math.round(v+(c[i][1][j]-v)*k)); } return c[c.length-1][1]; };
// 따라오기 : 동행하는 사람이 내 뒤 1.5 m 쯤을 따라 걷는다
STORY.follow=function(p,back=1.6){ const f=()=>{ if(!PEOPLE.list.includes(p)){ TICK.splice(TICK.indexOf(f),1); return; } const w=p.wrap.position, d=Math.hypot(P.x-w.x,P.z-w.z);
    if(d>9){ p.path=null; w.set(P.x+Math.sin(P.yaw)*back,0,P.z+Math.cos(P.yaw)*back); return; }
    if(d>back+1&&!p.path){ const k=(d-back)/d; PEOPLE.walk(p,[[w.x+(P.x-w.x)*k,w.z+(P.z-w.z)*k]],1.7); } }; TICK.push(f);
  return ()=>{ const i=TICK.indexOf(f); if(i>=0) TICK.splice(i,1); }; };      // 멈추는 함수
// 함교 대원 (앉은 셋) 보이기 · 숨기기
STORY.seated=function(on){ const c=SHIP.crew||{}; ['maya','seojun','daniel'].forEach(k=>{ const p=c[k]; if(p){ p.wrap.visible=on; p.solid=on; p.pick.visible=on; } }); };
// 소리 : 멀리서 울음 · 머리 위 쿵
const GROWL=(v=.06)=>{ AUDIO.tone(70+Math.random()*30,1.6,'sawtooth',v,0,-30); AUDIO.noise(1.2,v*.8,0,260); };
const THUD=(v=.18)=>AUDIO.noise(.25,v,0,180);

/* ---- 우주 유영 : 함선 겉모습(ship_ext) 둘 · 아래로 생명 가능 지대의 푸른 행성 · W(또는 [추진])로 바라보는 쪽으로 밀고 S 로 줄인다 ---- */
const EVA={push:false,
  async go({back=false,o2=90,crew=[]}={}){ S.phase='cut'; P.free=false; goal('');
    LEVEL.clear(); BRIDGEUI.clear(); ALIEN.clear(); STORY.unhold&&STORY.unhold(); STORY.dark(false);
    const [s2,s1]=await Promise.all([loadGLB('ship_ext'),loadGLB('ship_ext')]); WORLD.add(s2);
    s1.position.set(72,6,-10); s1.rotation.set(.1,.55,.06); WORLD.add(s1);
    s1.traverse(o=>{ if(o.isMesh){ o.material=o.material.clone(); if(o.material.color) o.material.color.multiplyScalar(.45); if(o.material.emissive) o.material.emissive.setRGB(0,0,0); } });
    await SKY.space({jupiter:true,ptex:'earth_day.jpg',jdir:[.2,-.8,.35],jsize:1.3,sunDir:[-.5,.45,-.7]}); SKYMASK.set(false); CH3.sky();
    const sun=new THREE.DirectionalLight(0xffc89a,2.2); sun.position.set(-500,450,-700); WORLD.add(sun,new THREE.AmbientLight(0x30384a,.5)); renderer.toneMappingExposure=1;
    const b2=new THREE.Box3().setFromObject(s2), b1=new THREE.Box3().setFromObject(s1), c2=b2.getCenter(new THREE.Vector3()), c1=b1.getCenter(new THREE.Vector3());
    const A={x:b2.max.x+1.4,y:c2.y,z:c2.z}, B={x:b1.min.x-.6,y:c1.y,z:c1.z}, from=back?B:A, to=back?A:B;
    // 해치 표시 : 빛나는 고리
    const ring=new THREE.Mesh(new THREE.TorusGeometry(1.1,.07,8,32),new THREE.MeshBasicMaterial({color:back?0x6dffb0:0xff9a50,toneMapped:false})); ring.position.set(to.x,to.y,to.z); ring.rotation.y=Math.PI/2; WORLD.add(ring);
    const un=STORY.mark(to.x,to.y+1.6,to.z);
    P.x=from.x; P.z=from.z; P.y=0; P.eye=from.y; P.yaw=Math.atan2(-(to.x-from.x),-(to.z-from.z)); P.pitch=Math.atan2(to.y-from.y,Math.hypot(to.x-from.x,to.z-from.z));
    // 함께 가는 사람 : 옆에서 떠 간다
    const mates=await Promise.all(crew.map(k=>PEOPLE.spawn({kind:k,name:k,at:{x:from.x,z:from.z,yaw:P.yaw}})));
    let el=$('#helmet'); if(!el){ el=document.createElement('div'); el.id='helmet'; el.innerHTML='<i class="rim"></i><i class="glare"></i><div class="hud"><p class="t"></p><div class="o2"><i></i></div></div>'; document.body.appendChild(el); }
    let th=$('#thrust'); if(!th){ th=document.createElement('button'); th.id='thrust'; th.className='ring'; th.textContent='추진'; $('#hud').appendChild(th);
      th.addEventListener('pointerdown',e=>{ e.stopPropagation(); EVA.push=true; }); ['pointerup','pointerleave','pointercancel'].forEach(t=>th.addEventListener(t,()=>EVA.push=false)); }
    el.classList.add('on'); th.classList.add('on'); el.classList.toggle('low',back); SHIPMAP.at(null); stamp(back?'우주 유영 · 2호로':'우주 유영 · 1호로','산소 '+o2+'초');
    await card('',back?'탈출':'우주 유영',back?'산소 '+o2+'초 · 2호 해치로':'1호 해치까지 · 산소 '+o2+'초',2200); await fade(false,1400);
    await TALK.say(back?[{who:'VEGA',ch:'무전 · 2호',kind:'vega',t:'선장님, 1호 에어록 바깥 해치가 안쪽에서 휘고 있습니다. 서두르십시오!'}]
      :[{who:'오언',ch:'무전',t:'…숨소리밖에 안 들리네요.'},{kind:'me',t:'바라보는 쪽으로 밀어서 간다. 천천히. 1호 해치 — 주황 고리.'}]);
    goal(back?'초록 고리 — 2호 해치로 (W 또는 [추진] 길게)':'주황 고리 — 1호 해치로 (W 또는 [추진] 길게 · S 로 줄이기)');
    S.phase='play'; P.look=true; let o=o2, ok=null; const v=new THREE.Vector3(), hud=el.querySelector('.t'), bar=el.querySelector('.o2 i'); let br=0;
    await new Promise(res=>{ const fn=dt=>{ if(S.phase!=='play') return;
        const fw=camera.getWorldDirection(new THREE.Vector3()), t=(keys.KeyW||keys.ArrowUp||EVA.push)?1:(keys.KeyS||keys.ArrowDown)?-1:0;
        if(t>0) v.addScaledVector(fw,1.5*dt); else if(t<0) v.multiplyScalar(1-dt*1.6); v.multiplyScalar(1-dt*.05); if(v.length()>3.4) v.setLength(3.4);
        P.x+=v.x*dt; P.z+=v.z*dt; P.eye+=v.y*dt; P.y=0;
        mates.forEach((m,i)=>{ const r=new THREE.Vector3(1,0,0).applyQuaternion(camera.quaternion); m.wrap.position.copy(camera.position).addScaledVector(r,(i?1:-1)*1.8).addScaledVector(fw,1.2+i*.6); m.wrap.position.y-=1.4+Math.sin(S.t+i)*.15; m.wrap.rotation.set(.2*Math.sin(S.t*.5+i),P.yaw+Math.PI,.15*Math.cos(S.t*.4+i)); });
        o-=dt; const d=Math.hypot(P.x-to.x,P.z-to.z,P.y+P.eye-to.y); hud.textContent='산소 '+Math.max(0,Math.ceil(o))+'초 · 해치까지 '+d.toFixed(0)+' m'; bar.style.width=Math.max(0,o/o2*100)+'%';
        el.classList.toggle('low',back||o<20); br-=dt; if(br<=0){ br=o<20?1.1:2.6; AUDIO.noise(.9,.05,0,700); }
        ring.rotation.x+=dt; if(d<2.6){ ok=true; } else if(o<=0) ok=false;
        if(ok!==null){ TICK.splice(TICK.indexOf(fn),1); res(); } }; TICK.push(fn); });
    S.phase='cut'; un(); th.classList.remove('on'); EVA.push=false;
    if(!ok){ await fade(true,900); el.classList.remove('on'); toast('산소가 떨어졌다 — 다시',2600); await sleep(800); return this.go({back,o2,crew}); }
    AUDIO.noise(.8,.25,0,900); await fade(true,800); el.classList.remove('on'); P.eye=1.66; },
};

const CH5={
  async start(){ const f=S.flags, {me,V,MY,SJ,DN,OW}=STORY.L(); f.ch5=true; STORY.crew(); if(!f.jump1){ f.jump1=true; CH3.sky(); }
    // ① 왜 푸나 : 1호는 B 의 생명 가능 지대에 있다 → B 의 표면 온도를 알아야 그 거리를 안다
    await TALK.say([V('소행성 띠 안쪽 진입. 그런데 1호의 정확한 위치가 잡히지 않습니다. 구조 신호가 B 의 행성들 사이에서 반사되고 있습니다.'),
      SJ('1호 임무는 생명 가능 지대의 행성을 찾는 거였잖아요. 그럼 1호는 그 지대에 있을 거예요.'),
      V('생명 가능 지대의 거리는 별의 표면 온도로 정해집니다. 뜨거운 별일수록 멀리 있습니다.'),me('B 의 표면 온도부터. 빛의 색이면 알 수 있다.')]);
    await STORY.at(BRIDGEUI.mesh('sci'),'과학 스테이션 — 별빛 색과 온도','과학 스테이션에서 별 B 의 색으로 표면 온도를 잰다');
    await STORY.sim('STAR COLOR · 별빛 색과 표면 온도','밀대로 표면 온도를 바꿔, 실험 별의 색을 <b>창밖의 별 B</b> 와 같게 맞추자',{min:3000,max:30000,step:500,val:15000,unit:' K',fmt:v=>v.toLocaleString()},
      (g,W,H,T)=>{ g.fillStyle='#040506'; g.fillRect(0,0,W,H);
        const ball=(x,y,rgb,lab)=>{ const gr=g.createRadialGradient(x,y,0,x,y,150); gr.addColorStop(0,'#fff'); gr.addColorStop(.25,`rgb(${rgb})`); gr.addColorStop(1,'rgba(0,0,0,0)'); g.fillStyle=gr; g.beginPath(); g.arc(x,y,150,0,7); g.fill();
          g.fillStyle='rgba(233,231,226,.75)'; g.font='600 24px "IBM Plex Sans KR",sans-serif'; g.textAlign='center'; g.fillText(lab,x,y+190); };
        ball(330,200,starRGB(4500).join(','),'창밖의 별 B'); ball(870,200,starRGB(T).join(','),'실험 별 · '+T.toLocaleString()+' K');
        const y0=H-58; for(let x=0;x<W-120;x++){ const t=3000+x/(W-120)*27000; g.fillStyle=`rgb(${starRGB(t)})`; g.fillRect(60+x,y0,1,16); }
        g.fillStyle='#e9e7e2'; g.beginPath(); const mx=60+(T-3000)/27000*(W-120); g.moveTo(mx,y0-4); g.lineTo(mx-8,y0-16); g.lineTo(mx+8,y0-16); g.fill(); },
      T=>T>=4000&&T<=5000,T=>T<4000?'너무 붉어요 — 온도를 조금 올리자':T<6500?'조금 노래요 — 온도를 낮추자':'파랗게 보이면 아주 뜨거운 별 — 온도를 많이 낮추자');
    await STORY.pick('STAR CATALOG · 별의 색과 표면 온도',['별','색','표면 온도'],[['K-1','청백색','20,000 K'],['K-2','황색','6,000 K'],['K-3','주황색','4,500 K'],['K-4','적색','3,000 K'],['K-5','백색','10,000 K']],[
      {q:'별 B 와 같은 종류의 별은?',ans:2,ok:'별 B : 주황색 · 약 4,500 K',hint:(i,n)=>n>=2?'방금 맞춘 색 — 4,000 ~ 5,000 K':'다시 — 창밖의 별은 무슨 색이었지?'},
      {q:'목록에서 표면 온도가 <b>가장 높은</b> 별은?',ans:0,ok:'맞아요 — 파란빛을 띨수록 뜨겁다',hint:(i,n)=>i===3?'붉은 별은 온도가 낮아요':'파란빛에 가까운 별일수록 뜨거워요'}]);
    await TALK.say([V('B 는 태양보다 차가운 별 — 생명 가능 지대는 B 에서 약 0.6 AU. 그 궤도를 훑습니다…'),V('찾았습니다. 푸른 행성 곁, 배 한 척. 하위헌스 1호입니다.'),
      MY('…우리 배랑 똑같이 생겼어요. 불이 하나도 없어요.'),V('1호 도킹 장치가 부서져 있습니다. 배를 붙일 수 없습니다.'),me('그럼 건너간다. 오언, 우주복.'),OW('같이 갑니다.')]);
    // ② 에어록 → 우주복
    f.dock=true; SHIP.lock.airlock=null; await STORY.go(50.43,7.1,'복도 동쪽 끝 에어록에서 우주복을 입는다',{r:1.1});
    await TALK.say([V('우주복 산소 90초. 1호까지 약 40 m. 바라보는 쪽으로 추진합니다.'),me('…간다.')]);
    await EVA.go({o2:90,crew:['owen']});
    await this.inside(); },
  // ③ 1호 안 : 같은 설계의 배를 어둡게. 비상 전력 없음 · 문은 모두 열려 있다
  async inside(){ const f=S.flags; LOADING.show('하위헌스 1호 · 에어록');
    await SCENES.ship.enter({mode:'huy1',raw:true}); SHIP.huy1=true; SHIP.zone=null; STORY.show('h1',true); STORY.seated(false); STORY.dark(true,{red:false}); SHIP.dim=.36; goal(''); SHIPMAP.at(null); HOLO.root.visible=false;
    ['pilotL','pilotR','nav','comms','eng','sci','top','vega'].forEach(k=>{ const m=BRIDGEUI.mesh(k); if(m) m.visible=false; });
    Object.values(SHIP.doors).forEach(d=>d.open()); SHIP.lock={};
    const ow=await PEOPLE.spawn({kind:'owen',name:'오언 하트',role:'보안',at:{x:51.4,z:10.6,yaw:Math.PI/2}}), OW=t=>({who:'오언',t,npc:ow}), me=t=>({kind:'me',t}), VR=t=>({who:'VEGA',ch:'무전 · 2호',kind:'vega',t});
    warp(50.43,10.2,Math.PI/2); await fade(false,1500); S.phase='play'; P.free=true; STORY.follow(ow); AUDIO.hum(.3,36);
    await TALK.say([OW('…추워요. 입김이 나요. 불이 하나도 없어요.'),me('비상 전력도 없군. 문이 전부 열려 있다.'),
      VR('선장님, 1호 항법 칩을 꼭 가져오십시오. 1호가 웜홀을 건너온 길 — 우리가 돌아갈 길이 들어 있습니다.'),VR('그리고… 생명 신호 하나. 동면 구역 쪽입니다.')]);
    // 어둠 속 소리 : 몇 초마다 어딘가에서 (가끔 머리 위 쿵)
    let live=true, t=6; const amb=dt=>{ if(!live) return; t-=dt; if(t<=0){ t=7+Math.random()*7; Math.random()<.5?GROWL(.04):THUD(.12); } }; TICK.push(amb);
    // 지나가며 보는 것 (한 번씩)
    const seen=(x,z,r,lines)=>{ const fn=()=>{ if(Math.hypot(P.x-x,P.z-z)<r&&!TALK.on){ TICK.splice(TICK.indexOf(fn),1); TALK.say(lines); } }; TICK.push(fn); };
    seen(27,9.6,2.6,[me('…끌고 간 자국이다. 동면실 쪽으로.'),OW('손자국이… 벽을 짚고 버틴 것 같아요.')]);
    seen(11.6,5.6,2.4,[OW('시신 가방… 셋.'),me('1호 대원은 열둘이었다. 나머지는?'),OW('…모르겠어요.')]);
    // 복도 끝을 지나가는 그림자 (처음 복도 가운데를 지날 때)
    { let done=false; const fn=async()=>{ if(done||P.x>40||P.x<16||P.z<8.9) return; done=true; TICK.splice(TICK.indexOf(fn),1);
        const a=await ALIEN.spawn({at:{x:P.x<28?4:52,z:12.4},face:-Math.PI/2,height:2.7,clip:'walk'}); a.h=2.7; THUD(.25);
        await ALIEN.go(a,[[a.wrap.position.x,8.6]],{speed:1.4,clip:'walk'}); ALIEN.clear(); await TALK.say([OW('…방금, 복도 끝에. 봤어요?'),me('봤다. 소리 내지 마.')]); }; TICK.push(fn); }
    // ④ 할 일 둘 : 항법 칩(함교) · 생존자(동면 구역)
    const nav=SHIP.rooms.bridge.spots.nav||{x:-3.2,z:-3.6}, box=new THREE.Mesh(new THREE.BoxGeometry(1.2,1.6,1.2),PICK); box.position.set(nav.x,.9,nav.z); WORLD.add(box);
    const cr=SHIP.rooms.cryo, c=cr.ox!==undefined?cr.ox:27, lx=c-2.5, lz=-6.6;      // 창 쪽 기계 단 아래 바닥 구석
    const le=STORY.leah=await PEOPLE.spawn({kind:'sophia',name:'레아 문',role:'1호 생물학자',at:{x:lx,z:lz,yaw:Math.atan2(lx-c,lz+2)},pose:'sit',seatY:.05}); le.watch=false;
    const LE=t=>({who:'레아',t,npc:le}), MUT=['…차가워야 해… 차가우면 잠들어…','…차가워야 해…','…잠들면… 안 나와…','…차가워야 해… 차가우면…'];
    // 가까이 가면 중얼거림이 들린다
    { let k=0, cd=0; TICK.push(dt=>{ if(!PEOPLE.list.includes(le)||f.leahFound) return; cd-=dt; if(cd>0) return; const d=Math.hypot(P.x-lx,P.z-lz); if(d<9&&!TALK.on){ cd=6; TALK.say([LE(MUT[k++%MUT.length])]); } }); }
    goal('1호 항법 칩을 회수하고 (함교) · 생존자를 찾는다 (동면 구역)');
    const chip=STORY.at(box,'1호 항법 칩 — 뽑는다','',{range:3}).then(async()=>{ AUDIO.tone(900,.1,'square',.04); f.h1chip=true; await TALK.say([me('항법 칩 회수. …돌아갈 길이 여기 있다.')]); });
    goal('1호 항법 칩을 회수하고 (함교) · 생존자를 찾는다 (동면 구역)');
    const find=new Promise(res=>PEOPLE.talkable(le,async()=>{ if(f.leahFound) return TALK.say([LE(MUT[0])]); f.leahFound=true;
      S.phase='cut'; P.free=false; await camTo({x:lx,z:lz+1.4,yaw:0,pitch:-.45,eye:1.4},1); P.look=true;
      await TALK.say([me('…레아 문?'),LE('…차가워야 해… 차가우면 잠들어…'),me('하위헌스 2호 선장, 크리스. 집에 데려다줄게요.'),LE('…차가워야 해…'),OW('대답을 못 해요. 제가 업을게요.')]);
      P.look=false; S.phase='play'; P.free=true; res(); }));
    await Promise.all([chip,find]); goal('');
    // ⑤ 탈출 : 멀리서 울음 → 에어록으로 → 닫힌 문을 쾅쾅
    STORY.follow(le,2.4); GROWL(.09); await sleep(600);
    await TALK.say([OW('…저 소리. 가까워지고 있어요.'),me('에어록으로. 뛰어!')]);
    const hunter=await ALIEN.spawn({at:{x:4,z:10.5},face:Math.PI/2,height:2.7,clip:'roar'}); hunter.h=2.7; STORY.dread(); setTimeout(()=>ALIEN.go(hunter,[[46,10.5]],{speed:1.9,clip:'walk'}),1800);
    await STORY.go(50.43,7.1,'에어록으로 — 뛰어!',{r:1.2});
    S.phase='cut'; P.free=false; live=false; await SHIP.doors.airlock.close(); SHIP.lock.airlock=()=>'열면 안 된다!';
    warp(50.43,7.0,Math.PI); ALIEN.stop(hunter); hunter.wrap.position.set(50.4,0,11.2);
    for(let i=0;i<3;i++){ await sleep(700); THUD(.5); GROWL(.1); camera.position.x+=.06; toast(['쾅!','쾅!!','쾅!!!'][i],600); }
    await TALK.say([OW('문이… 휘어요!'),{who:'VEGA',ch:'무전 · 2호',kind:'vega',t:'에어록 감압을 시작합니다 — 바깥 해치를 직접 여십시오!'}]);
    S.phase='play'; await STORY.qte('AIRLOCK · 바깥 해치','잠금 셋을 차례로 — 빨리!',3); S.phase='cut';
    PEOPLE.remove(le); PEOPLE.remove(ow); ALIEN.clear(); f.leahSaved=true;
    await EVA.go({back:true,o2:45,crew:['owen','sophia']});
    await this.home(); },
  // ⑥ 2호 에어록으로 돌아온다
  async home(){ LOADING.show('하위헌스 2호 · 에어록'); await SCENES.ship.enter({raw:true}); SHIP.huy1=false; STORY.show('h1',false); STORY.dark(false); SHIP.dim=1; STORY.crew();
    warp(50.43,9.6,Math.PI); await fade(false,1400); S.phase='play'; P.free=true;
    const {me,V,MY}=STORY.L(); await TALK.say([V('2호 에어록 밀폐 확인. …1호 쪽 해치가 안쪽에서 뜯겨 나갔습니다.'),MY('선장님! 무사해요?'),me('…셋 다 살아 있다. 레아를 연구실 격리실로.')]);
    await STORY.next('5장 · 유령선 — 끝','6장 · 손님',()=>CH6.start()); },
};

/* ============================================================
   6장 · 손님 — 연구실 유리 격리실
   ============================================================ */
const CH6={
  async start(){ const f=S.flags; f.ch6=true; f.leahSaved=true; STORY.crew(); STORY.seated(false); SHIP.huy1=false; STORY.show('h1',false); STORY.dark(false); SHIP.lock={};
    PEOPLE.list.filter(p=>!Object.values(SHIP.crew||{}).includes(p)).forEach(p=>PEOPLE.remove(p));
    const sp=SHIP.rooms.story.spots, bed=sp.isobed, view=sp.isoview, at=(x,z,tx,tz)=>({x,z,yaw:Math.atan2(x-tx,z-tz)});
    const [le,my,sj,ow]=await Promise.all([PEOPLE.spawn({kind:'sophia',name:'레아 문',role:'1호 생물학자',at:{x:bed.x,z:bed.z,yaw:0}}),
      PEOPLE.spawn({kind:'maya',name:'마야 첸',role:'부선장',at:at(view.x-1.7,view.z+.2,bed.x,bed.z)}),PEOPLE.spawn({kind:'seojun',name:'한서준',role:'항법',at:at(view.x+1.6,view.z+.4,bed.x,bed.z)}),
      PEOPLE.spawn({kind:'owen',name:'오언 하트',role:'보안',at:at(view.x-.9,view.z+1.3,bed.x,bed.z)})]);
    STORY.leah=le; le.sleep=true; le.watch=false; le.solid=false; le.wrap.rotation.order='YXZ'; le.wrap.rotation.set(-Math.PI/2,Math.PI/2,0); le.wrap.position.set(bed.x+.85,bed.y-.05,bed.z);      // 검사대 위에 반듯이 (머리가 −x)
    const w=(who,npc)=>t=>({who,t,npc}), me=t=>({kind:'me',t}), V=t=>({who:'VEGA',kind:'vega',t}), LE=w('레아',le), MY=w('마야',my), SJ=w('서준',sj), OW=w('오언',ow);
    warp(view.x,view.z+.3,0); P.yaw=0; SHIP.zone=null; await card('','한 시간 뒤','하위헌스 2호 · 연구실 격리실',2400); await fade(false,1200); S.phase='play'; P.free=true;
    await TALK.say([V('레아 문 — 체온 34.1 ℃. 의식은 있으나 같은 말만 되풀이합니다.'),LE('…차가워야 해… 차가우면…'),
      MY('1호에서 무슨 일이 있었던 거예요…'),SJ('1호 항법 칩은 살아 있어요. 귀환 항로가 다 들어 있어요.'),me('검사부터. 격리실 패널로 전신 스캔.')]);
    const panel=STORY.it('isopanel'); await STORY.at(panel,'격리실 패널 — 전신 스캔','격리실 패널에서 전신 스캔을 시작한다',{range:2.6,up:.5});
    await this.scan(bed);
    await TALK.say([V('가슴 안쪽에 국소 고온 반응. …움직입니다.'),SJ('움직인다고요?'),LE('…아… 아, 안 돼… 차가워야… 차가워야 하는데—')]);
    // 피를 토하고 · 가슴에서 · 유리창에 들러붙는다
    S.phase='cut'; P.free=false; await camTo({x:view.x,z:view.z+.3,yaw:0,pitch:-.12,eye:1.66},.6); P.look=true;
    const larva=await this.birth(le,bed);
    await TALK.say([OW('뭐, 뭐야 저게!'),MY('유리에… 붙었어요!'),V('격리실 소각 장치 — 선장님의 승인이 필요합니다. 패널을 누르십시오!')]);
    P.look=false; S.phase='play'; P.free=true;
    await STORY.at(panel,'격리실 패널 — 소각 승인','격리실 패널에서 소각을 승인한다 — 지금!',{range:2.6,up:.5});
    await STORY.qte('INCINERATE · 소각 승인','승인 둘 — 손을 떨지 말고',2);
    S.phase='cut'; P.free=false; await camTo({x:view.x,z:view.z+.3,yaw:0,pitch:-.12,eye:1.66},.5); P.look=true;
    await this.burn(larva,le,bed);
    await TALK.say([V('소각 완료. …격리실 안 생체 반응 — 없습니다.'),OW('없어요? 그럼 저건 어디로…'),SJ('바닥 환기구 창살이… 뜯겨 있어요.'),
      me('…"차가우면 잠든다." 레아는 몸속의 그것을 재우려고 동면 캡슐에 들어갔던 거다.'),MY('그럼 지금 그게… 이 배 환기구 안에 있다는 거예요?'),
      me('집으로 간다. 지금 당장. 서준, 1호 칩의 귀환 항로.'),SJ('항법 화면으로 띄울게요. 웜홀 출구는… 별무리 둘 사이에 있대요.')]);
    P.look=false; S.phase='play'; P.free=true; [my,sj,ow].forEach(p=>PEOPLE.remove(p)); STORY.seated(true);
    // 함교로 가는 복도 : 발치를 무언가가 가로질러 벽 틈으로 (갑툭튀)
    const dart=()=>{ if(P.x>29||P.x<4||P.z<8.9||P.z>12.2) return; TICK.splice(TICK.indexOf(dart),1);
      (async()=>{ const x=P.x-2.4; const l=await ALIEN.spawn({at:{x,z:12},face:Math.PI,height:.6,clip:'crawl_run'}); l.h=.6; l.open=l.openTo=1; STING(.55); FX.shake(.3,.04);
        await ALIEN.go(l,[[x-.4,9]],{speed:6,clip:'crawl_run'}); ALIEN.remove(l); AUDIO.noise(.3,.2,0,1500); })(); }; TICK.push(dart);
    // 왜 푸나 : 1호 기록은 '젊고 엉성한 별무리'와 '늙고 빽빽한 별무리' 사이 — 어느 것이 어느 것인지 가려야 항로가 잡힌다
    await STORY.at(BRIDGEUI.mesh('nav'),'항법 화면 — 1호 귀환 항로','함교 항법 화면에서 1호 귀환 항로의 별무리 둘을 가려낸다');
    const thumb=(kind)=>{ const c=document.createElement('canvas'); c.width=220; c.height=140; const g=c.getContext('2d'); g.fillStyle='#05070a'; g.fillRect(0,0,220,140);
      let s=kind?3:9; const r=()=>(s=(s*16807)%2147483647)/2147483647;
      if(kind){ for(let i=0;i<900;i++){ const a=r()*7, d=Math.pow(r(),2.2)*60; g.fillStyle=`rgba(255,${200+r()*40|0},${150+r()*40|0},${.5+r()*.5})`; g.fillRect(110+Math.cos(a)*d,70+Math.sin(a)*d,1.6,1.6); } }
      else for(let i=0;i<60;i++){ const x=40+r()*140, y=20+r()*100, b=1+r()*2.5; g.fillStyle=`rgba(${170+r()*40|0},${200+r()*40|0},255,.95)`; g.beginPath(); g.arc(x,y,b,0,7); g.fill(); }
      return c.toDataURL(); };
    await STORY.sort('CLUSTERS · 1호 귀환 항로',`<span class="pics"><img src="${thumb(0)}" alt="엉성한 별무리"><img src="${thumb(1)}" alt="빽빽한 별무리"></span>1호 기록 : "출구는 <b>산개 성단</b>과 <b>구상 성단</b> 사이" — 카드를 누르고, 알맞은 칸을 누르자`,['산개 성단','구상 성단'],
      [['엉성하게 흩어진 별무리 (왼쪽 그림)',0],['공 모양으로 빽빽한 별무리 (오른쪽 그림)',1],['별 수백 ~ 수천 개',0],['별 수만 ~ 수십만 개',1],['젊고 파란 별이 많다',0],['늙고 붉은 별이 많다',1],['은하 원반 · 나선팔에 있다',0],['은하 중심 둘레 · 헤일로에 있다',1]],
      i=>i%2?'빽빽한 공 모양 = 오래된 별들이 모인 구상 성단':'엉성한 별무리 = 젊은 별들이 모인 산개 성단');
    const L=STORY.L(); await TALK.say([L.SJ('왼쪽이 산개 성단, 오른쪽이 구상 성단. 출구는 그 사이 — 항로 잡았어요.'),L.MY('엔진 최대로. 사흘이면 출구예요.'),L.V('경고 — 환기구 온도 센서에 이상 신호. 무언가 덕트 안을 지나갑니다.')]);
    f.leahDead=true; await STORY.next('6장 · 손님 — 끝','7장 · 사냥',()=>CH7.start()); },
  // 전신 스캔 : 푸른 빛의 막이 검사대를 훑는다
  scan(bed){ return new Promise(res=>{ const pl=new THREE.Mesh(new THREE.PlaneGeometry(.04,1.2),new THREE.MeshBasicMaterial({color:0x7fd4ff,transparent:true,opacity:.8,toneMapped:false,side:THREE.DoubleSide,blending:THREE.AdditiveBlending}));
    pl.rotation.x=-Math.PI/2; pl.scale.set(1,1,1); const li=new THREE.PointLight(0x7fd4ff,2,3,1.6); WORLD.add(pl,li); let t=0; AUDIO.tone(600,2.4,'sine',.03,0,300);
    const fn=dt=>{ t+=dt; const x=bed.x-1+((t*.9)%2); pl.position.set(x,bed.y+.15,bed.z); pl.rotation.z=0; pl.scale.y=1; li.position.set(x,bed.y+.4,bed.z); if(t>2.6){ TICK.splice(TICK.indexOf(fn),1); WORLD.remove(pl,li); res(); } }; TICK.push(fn); }); },
  // 피 · 경련 · 탄생 : 유리 안쪽에 피가 튀고 → 가슴에서 기생체가 뛰쳐나와 유리에 들러붙는다
  async birth(le,bed){ const Z2=4.45, blood=STORY.it('h1')&&STORY.it('h1').getObjectByName('h1_pool_hall'), bm=blood&&blood.material.clone(); if(bm){ bm.depthWrite=false; }
    const splat=(x,y,s)=>{ if(!bm) return; const m=new THREE.Mesh(new THREE.PlaneGeometry(1,1),bm); m.position.set(x,y,Z2-.03); m.scale.setScalar(.05); m.rotation.z=Math.random()*6; WORLD.add(m);
      let t=0; const fn=dt=>{ t+=dt; m.scale.setScalar(Math.min(s,.05+t*s*4)); if(t>.4) TICK.splice(TICK.indexOf(fn),1); }; TICK.push(fn); };
    const drop=STORY.dropTex||(STORY.dropTex=(()=>{ const c=document.createElement('canvas'); c.width=c.height=32; const g=c.getContext('2d'), r=g.createRadialGradient(16,16,0,16,16,16); r.addColorStop(0,'rgba(120,8,6,1)'); r.addColorStop(.6,'rgba(90,4,3,.9)'); r.addColorStop(1,'rgba(60,0,0,0)'); g.fillStyle=r; g.fillRect(0,0,32,32); return new THREE.CanvasTexture(c); })());
    const spray=(p,n,spd)=>{ for(let k=0;k<n;k++){ const sp=new THREE.Sprite(new THREE.SpriteMaterial({map:drop,transparent:true,depthWrite:false})); sp.scale.setScalar(.03+Math.random()*.05); sp.position.copy(p); WORLD.add(sp);
      const v=new THREE.Vector3(Math.random()-.5,Math.random()*.9+.2,Math.random()*.9+.1).multiplyScalar(spd); let t=0; const fn=dt=>{ t+=dt; sp.position.addScaledVector(v,dt); v.y-=dt*7; if(t>.9||sp.position.z>Z2-.05){ WORLD.remove(sp); TICK.splice(TICK.indexOf(fn),1); } }; TICK.push(fn); } };
    // 경련
    let shake=true; const sh=()=>{ if(shake) le.wrap.position.y=bed.y-.05+Math.abs(Math.sin(S.t*31))*.05; }; TICK.push(sh); AUDIO.noise(1.6,.12,0,500);
    await TALK.say([{who:'레아',t:'커헉… 커, 커헉—',npc:le}]);
    const chest=new THREE.Vector3(bed.x-.4,bed.y+.25,bed.z);
    spray(chest,26,3); splat(bed.x-.2,1.4,.5); AUDIO.noise(.5,.25,0,900); await sleep(700);
    spray(chest,30,3.5); splat(bed.x+.75,1.15,.55); splat(bed.x-.7,1.2,.4); await sleep(500);
    // 일어나 앉으며 토한다
    le.wrap.rotation.set(-.6,Math.PI/2,0); spray(chest.clone().add(new THREE.Vector3(0,.3,0)),40,4); splat(bed.x-.2,1.45,.6); AUDIO.noise(.8,.3,0,700);
    await TALK.say([{who:'레아',t:'—아아아아!',npc:le}]); shake=false; TICK.splice(TICK.indexOf(sh),1);
    // 가슴에서 : 빨간 섬광 · 피 분수 · 작은 기생체가 튀어나와 유리에 철썩
    const fl=new THREE.PointLight(0xff2010,0,6,1.6); fl.position.copy(chest); WORLD.add(fl); fl.intensity=8; setTimeout(()=>WORLD.remove(fl),160);
    spray(chest,60,5); splat(bed.x-.1,1.35,.7); AUDIO.tone(1100,.5,'sawtooth',.07,0,700); AUDIO.noise(.6,.4,0,1600);
    le.wrap.rotation.set(-Math.PI/2,Math.PI/2,0); le.wrap.position.y=bed.y-.05;
    const a=await ALIEN.spawn({at:{x:chest.x,y:chest.y,z:chest.z},face:0,height:.4,clip:'jump_attack'}); a.h=.4; a.openTo=1;
    const rim=a.rim=new THREE.PointLight(0xff3020,2.2,1.6,1.5); WORLD.add(rim); TICK.push(()=>rim.position.copy(a.wrap.position).add(new THREE.Vector3(0,.15,.35)));      // 검은 몸이 어둠에 묻히지 않게
    // 피가 덜 튄 오른쪽 위 유리로 뛴다
    const to=new THREE.Vector3(bed.x+.6,1.9,Z2-.1); await new Promise(r=>{ let k=0; const fn=dt=>{ k=Math.min(1,k+dt/.32); a.wrap.position.lerpVectors(chest,to,k); a.wrap.position.y+=Math.sin(k*Math.PI)*.35; if(k>=1){ TICK.splice(TICK.indexOf(fn),1); r(); } }; TICK.push(fn); });
    a.wrap.rotation.set(-1.0,0,0); ALIEN.play(a,'crawl'); AUDIO.noise(.3,.5,0,300); camera.position.y+=.04;
    return a; },
  // 소각 : 천장 노즐에서 불길 → 기생체는 바닥 환기구로 · 창살이 튀어 열린다 → 연기
  burn(a,le,bed){ return new Promise(res=>{ const iso=STORY.it('iso'), vent=iso&&iso.getObjectByName('iso_vent'), grate=iso&&iso.getObjectByName('iso_grate'), glass=iso&&iso.getObjectByName('iso_gz');
    const vp=vent?vent.getWorldPosition(new THREE.Vector3()):new THREE.Vector3(39.4,.15,1.3), nz=[]; if(iso) iso.traverse(o=>{ if(/^flame_n/.test(o.name)) nz.push(o.getWorldPosition(new THREE.Vector3())); });
    const cv=document.createElement('canvas'); cv.width=cv.height=64; const g=cv.getContext('2d'), gr=g.createRadialGradient(32,32,0,32,32,32); gr.addColorStop(0,'rgba(255,240,180,1)'); gr.addColorStop(.4,'rgba(255,140,40,.8)'); gr.addColorStop(1,'rgba(120,20,0,0)'); g.fillStyle=gr; g.fillRect(0,0,64,64);
    const tex=new THREE.CanvasTexture(cv), parts=[], li=new THREE.PointLight(0xff7a2a,0,9,1.4); li.position.set(bed.x,1.6,bed.z); WORLD.add(li);
    // 기생체 : 유리에서 떨어져 바닥 환기구로 (불이 붙기 직전)
    ALIEN.play(a,'crawl_run'); a.wrap.rotation.set(0,Math.PI*.8,0); const p0=a.wrap.position.clone(); let k=0;
    const run=dt=>{ k=Math.min(1,k+dt/.55); a.wrap.position.lerpVectors(p0,vp,k); a.wrap.position.y=p0.y*(1-k)+vp.y*k; if(k>=1){ TICK.splice(TICK.indexOf(run),1); ALIEN.clear(); if(a.rim) WORLD.remove(a.rim); if(grate){ grate.position.set(.3,.25,.1); grate.rotation.set(.9,0,.4); } AUDIO.noise(.3,.3,0,1200); } }; TICK.push(run);
    let t=0; AUDIO.noise(4,.3,0,600); AUDIO.tone(60,4,'sawtooth',.06);
    const fn=dt=>{ t+=dt; const on=t<4;
      if(on) for(let i=0;i<4;i++){ const n=nz[(Math.random()*nz.length)|0]||new THREE.Vector3(bed.x,2.6,bed.z); const sp=new THREE.Sprite(new THREE.SpriteMaterial({map:tex,transparent:true,depthWrite:false,blending:THREE.AdditiveBlending,toneMapped:false}));
        sp.position.copy(n); sp.scale.setScalar(.5); WORLD.add(sp); parts.push({sp,v:new THREE.Vector3((Math.random()-.5)*1.2,-2.4-Math.random(),(Math.random()-.5)*1.2),t:0}); }
      for(let i=parts.length-1;i>=0;i--){ const q=parts[i]; q.t+=dt; q.sp.position.addScaledVector(q.v,dt); if(q.sp.position.y<.25){ q.v.y=0; q.v.x*=1.02; q.v.z*=1.02; } q.sp.scale.setScalar(.5+q.t*1.8); q.sp.material.opacity=Math.max(0,1-q.t/.9);
        if(q.t>.9){ WORLD.remove(q.sp); parts.splice(i,1); } }
      li.intensity=on?5+Math.random()*3:Math.max(0,li.intensity-dt*4); if(glass&&glass.material.emissive){ glass.material.emissive.setRGB(on?.5:0,on?.18:0,0); }
      if(t>1.2&&le.wrap.visible){ le.wrap.visible=false; }
      if(t>5.2&&!parts.length){ TICK.splice(TICK.indexOf(fn),1); WORLD.remove(li); res(); } };
    TICK.push(fn); }); },
};

SCENES.ch5={title:'5장 · 유령선', async enter(){ Object.assign(S.flags,{route:true,transit:true,passed:true,bridgeIn:true,where:true,ch2:true,ch2done:true,beacon:true,photos:true,ch3:true,ch4:true,jump1:true});
  await SCENES.ship.enter({at:'bridge'}); S.phase='play'; await CH5.start(); }};
SCENES.ch6={title:'6장 · 손님', async enter(){ Object.assign(S.flags,{route:true,transit:true,passed:true,bridgeIn:true,where:true,ch2:true,ch2done:true,ch3:true,ch4:true,ch5:true,leahSaved:true,jump1:true});
  await SCENES.ship.enter({raw:true}); await CH6.start(); }};
