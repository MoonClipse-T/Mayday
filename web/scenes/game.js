/* ============================================================
   MAYDAY 4판 — 한 흐름 (장 · 화면 전환 없음 · STORY.md)
   ⓪ NASA 브리핑룸 (scenes/s0_meeting.js · 구조 계획) → 넉 달 뒤
   ① 구조정 조종석 : 웜홀 건너편 · Mayday 녹음 · 불 꺼진 1호 · 연료는 편도분 → 도킹 (화면 전환은 여기 한 번 — 해치를 지나 1호로)
   ② 1호 : 암흑 · 손전등 · 찢긴 시신 · 피 → ③ 동면 구역 C 의 생존자 레아 → 가슴에서 애벌레 → 첫 사격
   ④ 애벌레 사냥 (시신마다 하나) → ⑤ 기관실 원자로 재가동 · 시신을 먹던 성체 → 숨고 · 도망쳐 ⑥ 함교 → 1호를 몰고 웜홀로 (다음 이야기 : 사용자 지시 대기)
   저장 지점 : 죽으면 그 자리부터 (GAME.cp) · 제작용 바로 가기 ?s=cockpit · board · survivor · hunt · engine · bridge
   ============================================================ */
'use strict';
const VG=(t,v)=>({who:'VEGA',ch:'무전 · 구조정',kind:'vega',t,v}), I=t=>({kind:'me',t}), RADIO=t=>({who:'HUY-1',ch:'녹음 · 312일째',kind:'radio',t});
// 시신 (애벌레가 든 몸) : 자리 · 모델(a 벽에 기대 앉은 방호복 — 등이 모델의 −z · b 천에 덮인 몸 · c 피 묻은 천) · 방향
const BODIES=[[22,10.6,'b',1.57],[45,10.5,'c',.3],[35.5,9.4,'a',0],[16.6,-3.2,'b',1],[29.4,5.2,'c',0],[41,3.6,'b',.5],[9,9.3,'a',0],[2,-1.2,'b',.8],[24,21,'c',2]];
// 시신 칠하기 : 방호복의 샛노랑 · 파랑 장갑을 빼고 때 · 피 · 찢김 / 천에는 번진 피 (몸 상자 안 비율 — WEAR)
const WEARS={
  a:{grime:[.4,.38,.34],desat:.86,matte:true,blobs:[[.5,.62,.8,.2,'b'],[.42,.5,.85,.16,'o'],[.62,.72,.8,.12,'t'],[.34,.62,.8,.1,'t'],[.55,.42,.9,.12,'w'],[.2,.4,.7,.13,'b'],[.8,.45,.7,.14,'o'],[.5,.9,.7,.12,'o'],[.68,.2,.85,.14,'b'],[.3,.15,.9,.1,'t']]},
  b:{grime:[.62,.58,.54],matte:true,blobs:[[.5,.5,1,.17,'b'],[.3,.55,1,.12,'o'],[.72,.48,1,.14,'b'],[.45,.3,1,.1,'t'],[.6,.7,1,.1,'t'],[.2,.4,.5,.12,'o'],[.85,.6,.5,.1,'o']]},
  c:{grime:[.56,.5,.47],matte:true,blobs:[[.55,.5,.9,.14,'w'],[.35,.45,.9,.14,'b'],[.7,.6,.9,.1,'o'],[.25,.7,.6,.1,'t']]}};
const RAGS={a:[[.3,.27,.1],[.16,.17,.24],[.3,.3,.28]],b:[[.42,.4,.37],[.2,.22,.26]],c:[[.44,.4,.36],[.24,.24,.25]]};
// 레아 : 열한 달을 버틴 생물학자 — 1호 대원복이 찢어지고 · 말라붙은 피 · 젖은 피 · 손에 피 · 얼굴에 때 (몸 상자 안 비율)
const LEAH_WEAR={grime:[.5,.46,.42],desat:.45,matte:true,blobs:[[.5,.66,.82,.075,'b'],[.45,.56,.85,.06,'o'],[.58,.62,.85,.07,'t'],[.4,.7,.8,.06,'t'],[.5,.5,.85,.09,'o'],[.62,.45,.7,.06,'t'],[.4,.3,.8,.07,'t'],[.6,.2,.8,.06,'o'],[.42,.13,.85,.05,'t'],
  [.03,.56,.5,.06,'b'],[.97,.56,.5,.06,'b'],[.1,.56,.5,.06,'o'],[.9,.56,.5,.06,'o'],[.5,.92,.85,.05,'o'],[.56,.9,.9,.035,'b'],[.5,.8,.5,.09,'o'],[.5,.5,.2,.1,'o']]};

const GAME={cp:null,
  stages:['meeting','launch','depart','jupiter','cockpit','board','survivor','hunt','engine','bridge'],
  // 바로 가기 · 처음부터
  async jump(key){ const f=S.flags; S.phase='cut'; P.free=false;
    if(key==='meeting') return SCENES.meeting.enter();
    if(['launch','depart','jupiter'].includes(key)) return this.journey(key);
    if(key==='cockpit') return this.cockpit();
    await this.ship();
    if(key==='board') return this.board();
    fade(false,1200);
    if(key==='survivor'){ warp(27,7.4,Math.PI*0); return this.survivor(); }
    this.leahDead(); if(key==='hunt'){ warp(27,7,Math.PI); return this.hunt(); }
    Object.assign(f,{hunted:true}); LARVA.on=false; LARVA.hosts.forEach(h=>h.done=true);
    if(key==='engine'){ warp(46,10.5,-Math.PI/2); return this.engine(); }
    f.power=true; this.lightsOn(); warp(54,10.5,Math.PI/2); return this.escape(); },

  /* ---- ① 구조정 : 직접 몰고 가 도킹한다 (scenes/flight.js) → 연결 통로를 지나 1호 에어록 ---- */
  // 전력 복구 : 방 불빛 · 빛 띠 · 화면이 돌아온다 (손전등은 그대로 · 조금 약하게)
  lightsOn(){ ROOMS.power(); STORY.dark(false); $('#torch').classList.add('on'); STORY.spot.intensity=4; SHIP.dim=.75; if(SHIP.hemi) SHIP.hemi.intensity=.38; },
  async cockpit(){ await FLIGHT.run(); await this.ship(); return this.board(); },
  // 회의 다음 : 발사 → 지구 궤도 출발 → 동면 → 넉 달 뒤 목성 · 웜홀 (scenes/journey.js) → 건너편에서 직접 몰고 도킹
  async journey(from='launch'){ await JOURNEY.run(from); await FLIGHT.run({journey:true}); await this.ship(); return this.board(); },

  /* ---- 1호 불러오기 (어둠 · 시신 · 피) ---- */
  async ship(){ const f=S.flags; await SCENES.ship.enter(); MUSIC.play('derelict',{fade:3}); STORY.show('h1',true); STORY.dark(true); SHIP.dim=.8; if(SHIP.hemi) SHIP.hemi.intensity=.035;      // 붉은 빛 없이 캄캄하게 — 손전등이 비춘 곳만 밝다
    Object.values(SHIP.doors).forEach(d=>d.open());      // 전력이 없어 문은 모두 열린 채
    await this.bodies(); await HIDE.setup(); TICK.push(dt=>HIDE.tick(dt)); await GUN.hold(); ME.heal(); ME.onDeath=()=>this.died(); DREAD.on();
    // 어둠 속 소리 : 몇 초마다 어딘가에서 (가끔 머리 위 쿵)
    let t=6; TICK.push(dt=>{ if(S.phase!=='play') return; t-=dt; if(t<=0){ t=7+Math.random()*8; Math.random()<.45?GROWL(.035):Math.random()<.5?THUD(.1):AUDIO.tone(2200+Math.random()*600,.6,'sine',.01,0,-400); } });
    // 입김 : 차가운 배
    { let b=0; TICK.push(dt=>{ b-=dt; if(b<=0&&S.phase==='play'&&!f.power){ b=3+Math.random(); const p=camera.getWorldPosition(new THREE.Vector3()).add(camera.getWorldDirection(new THREE.Vector3()).multiplyScalar(.35)); p.y-=.12; breath(p); } }); } },
  // 시신 놓기 : 바닥에 피 웅덩이 · 애벌레 등록
  async bodies(){ const M={}; for(const k of 'abc') M[k]=loadGLB('corpse_'+k).then(s=>{ WEAR.paint(s,WEARS[k]); return s; }); this.hosts=[];
    for(const [x0,z0,k,ry0] of BODIES){ const src=await M[k], o=src.clone(); let ry=ry0, [x,z]=freeSpot(x0,z0,k==='a'?{r:.42,y1:.05,y2:1.15}:{r:.55,y1:.05});
      if(k==='a'){ const w=HIDE.wall(x,z); if(w&&!SOLID.hit(w.x,w.z,.05,1.15,.26)){ x=w.x+Math.sin(w.yaw)*.42; z=w.z+Math.cos(w.yaw)*.42; ry=w.yaw; } }      // 벽 쪽 큰 배관에 등을 기댄다 (바닥 가의 붉은 관을 뚫지 않게 그만큼 앞으로)
      const bb=new THREE.Box3().setFromObject(o), sz=bb.getSize(new THREE.Vector3()), s=k==='a'?1:1.8/Math.max(sz.x,sz.z);
      o.scale.setScalar(s); o.rotation.y=ry; const g=new THREE.Group(); g.add(o); const c=new THREE.Box3().setFromObject(o).getCenter(new THREE.Vector3()); o.position.x-=c.x; o.position.z-=c.z; o.position.y-=bb.min.y*s;
      g.position.set(x,0,z); WORLD.add(g); BLOOD.pool(x+(Math.random()-.5)*.4,z+(Math.random()-.5)*.4,2.2+Math.random()*.8);
      // 어디서 끌려왔나 : 가장 멀리 트인 쪽으로 핏줄기 · 둘레에 찢긴 옷 조각
      { let best=0, ang=0; for(let i=0;i<12;i++){ const a=i/12*6.283+ry; let t=.6; while(t<5.5&&!SOLID.hit(x+Math.sin(a)*t,z+Math.cos(a)*t,.05,.6,.2)) t+=.25; if(t>best){ best=t; ang=a; } } if(best>1.4) BLOOD.trail(x+Math.sin(ang)*.3,z+Math.cos(ang)*.3,ang,Math.min(best-.3,3.2+Math.random()*1.6),.5+Math.random()*.25); }
      BLOOD.scraps(x,z,8,RAGS[k]);
      this.hosts.push(LARVA.host({x,z,near:k==='a'?4.5:5.2})); } },
  // 죽으면 : 마지막 저장 지점부터
  async died(){ S.phase='cut'; P.free=false; SCREAM(.5); await fade(true,1400); ME.setCrouch(false); HIDE.reset(); if(LARVA.grab) LARVA.struggle&&(LARVA.grab.need=0,LARVA.struggle());
    const c=this.cp||{x:50.43,z:7,yaw:Math.PI}; warp(c.x,c.z,c.yaw); ME.heal();
    LARVA.list.forEach(l=>{ if(l.state!=='dead'&&Math.hypot(l.wrap.position.x-c.x,l.wrap.position.z-c.z)<8){ const a=Math.random()*6; l.wrap.position.x=c.x+Math.sin(a)*9; l.wrap.position.z=c.z+Math.cos(a)*9; } });
    if(c.reset) await c.reset();
    await sleep(500); await fade(false,1200); toast('다시 — 마지막 저장 지점',2200); S.phase='play'; P.free=true; },
  save(x,z,yaw,reset){ this.cp={x,z,yaw,reset}; },

  /* ---- ② 1호 에어록 → 복도 ---- */
  async board(){ const f=S.flags; warp(50.43,6.6,Math.PI); this.save(50.43,6.6,Math.PI); await fade(false,1800); S.phase='play'; P.free=true;
    await TALK.say([I('…춥다. 입김이 나.'),VG('1호 비상 전력 0. 모든 문이 열린 채입니다. 생명 신호는 배 앞쪽, 동면 구역 C 입니다.'),I('손전등뿐이군.')]);
    goal('생존자를 찾는다 — 동면 구역 C (복도 서쪽)');
    STORY.once(45,9.7,3.2,()=>TALK.say([I('…사람이다. 아니, 사람이었던 것.'),I('가슴이… 안에서 밖으로 찢겨 있다.'),VG('맥박 없음. 사망한 지 수 주로 추정됩니다.')]));
    STORY.once(36,10.5,2.4,()=>{ THUD(.3); AUDIO.noise(1.5,.08,0,400); TALK.say([I('…위에서 뭔가 지나갔다.'),VG('환기 덕트 안입니다. 크기는… 측정되지 않습니다.')]); });
    STORY.once(30,10.5,2.4,()=>TALK.say([I('끌고 간 자국. 손톱으로 바닥을 긁은 자국.'),I('다들… 어디로 끌려간 거지.')]));
    return this.survivor(); },

  /* ---- ③ 동면 구역 C 의 생존자 ---- */
  async survivor(){ const f=S.flags; S.phase='play'; P.free=true;
    goal('생존자를 찾는다 — 동면 구역 C');
    const lx=24.5, lz=-5.0, le=this.leah=await this.leahBody(lx,lz);
    BLOOD.pool(lx,lz-1,1.8);
    const LE=t=>({who:'레아',t,npc:le}), MUT=['…차가워야 해… 차가우면 잠들어…','…움직여… 안에서 움직여…','…쏘지 마… 나 아직… 나야…'];
    { let k=0, cd=0; const fn=dt=>{ if(f.leahFound||!PEOPLE.list.includes(le)) return TICK.splice(TICK.indexOf(fn),1); cd-=dt; if(cd>0) return; if(Math.hypot(P.x-lx,P.z-lz)<9&&!TALK.on){ cd=6; TALK.say([LE(MUT[k++%MUT.length])]); } }; TICK.push(fn); }
    await new Promise(res=>PEOPLE.talkable(le,()=>{ if(f.leahFound) return; f.leahFound=true; res(); }));
    this.save(27,6.8,0);
    S.phase='cut'; P.free=false; ME.setCrouch(false); await camTo({x:lx+.9,z:lz-.6,yaw:yawTo(lx,lz-1.3),pitch:-.75,eye:1.55},1); P.look=true;
    await TALK.say([I('…레아 문? 1호 생물학자, 레아 문.'),LE('…누구…'),I('구조하러 왔어요. NASA, 크리스. 혼자예요.'),LE('…혼자… 다행이다… 다른 사람은 데려오지 마…'),
      I('무슨 일이 있었던 거예요. 다른 대원들은?'),LE('…그게 우리를 먹었어. 하나씩. 그리고… 먹다 남긴 몸마다… 알을…'),LE('…나도야. 느껴져. 안에서— 아, 아아—')]);
    const larva=await this.birth(le); P.look=false;
    // 첫 사격 : 덮쳐 오는 애벌레
    await TALK.say([VG('크리스! 쏘십시오!')]); goal(byDevice('쏴라 — F 또는 [사격]','쏴라 — [사격]')); S.phase='play'; P.free=true;
    LARVA.on=true; await new Promise(r=>{ LARVA.onKill=()=>r(); });
    goal(''); await sleep(600);
    await TALK.say([I('…하아… 하아…'),VG('생체 반응… 늘어납니다. 일곱, 여덟… 1호 곳곳의 시신마다 하나씩입니다.'),
      I('"먹다 남긴 몸마다 알을." …전부 깨어나고 있다.'),VG('원자로가 있는 기관실까지 가려면 복도를 지나야 합니다. 그것들을 그냥 두면 따라옵니다.')]);
    return this.hunt(); },
  // 레아의 몸 : 대원복(Tripo) 을 칠해 찢고 더럽힌다 · 바닥에 누워 (발이 남 · 머리가 북쪽 벽)
  async leahBody(lx,lz){ const le=await PEOPLE.spawn({kind:'maya',name:'레아 문',role:'1호 생물학자',pose:'lie',at:{x:lx,z:lz,yaw:0}}); le.watch=false; le.solid=false; le.sleep=true;
    le.wrap.rotation.set(-Math.PI/2,0,0); le.wrap.position.y=.1; le.wrap.updateMatrixWorld(true); le.wear=WEAR.paint(le.g,LEAH_WEAR); BLOOD.scraps(lx,lz-.9,7,[[.2,.21,.23],[.12,.13,.15]],1); return le; },
  // 가슴에서 애벌레 : 경련 · 피 · 붉은 섬광 → 내 쪽으로 뛰어든다
  async birth(le){ const w=le.wrap.position, chest=new THREE.Vector3(w.x,.3,w.z-1.25);
    let shake=true; const sh=()=>{ if(shake){ le.wrap.position.y=.1+Math.abs(Math.sin(S.t*31))*.05; le.wrap.rotation.y=Math.sin(S.t*27)*.05; } }; TICK.push(sh); AUDIO.noise(1.6,.12,0,500);
    await TALK.say([{who:'레아',t:'커헉… 커, 커헉—',npc:le}]);
    BLOOD.spray(chest,30,3); SFX.play('burst',{at:chest}); await sleep(500); BLOOD.spray(chest,40,3.6); AUDIO.noise(.6,.3,0,900); await sleep(400);
    const fl=new THREE.PointLight(0xff2010,8,6,1.6); fl.position.copy(chest); WORLD.add(fl); setTimeout(()=>WORLD.remove(fl),160);
    BLOOD.spray(chest,70,5); AUDIO.tone(1100,.5,'sawtooth',.07,0,700); STING(.8); FX.flash('#ff2010',300); FX.shake(.5,.05);
    shake=false; TICK.splice(TICK.indexOf(sh),1); le.wrap.rotation.set(-Math.PI/2+.12,0,0); le.wrap.position.y=.1; le.wear&&le.wear.add([[.5,.68,.9,.11,'w'],[.5,.6,.85,.13,'b']]);
    const l=await LARVA.spawn(chest.x,chest.z,0); l.state='rise'; l.t=1.4; l.wrap.rotation.y=Math.atan2(P.x-chest.x,P.z-chest.z); l.wrap.position.y=.0;
    LARVA.hosts.push({x:chest.x,z:chest.z,done:true}); await sleep(900); return l; },
  leahDead(){ const lx=24.5, lz=-5.0; this.leahBody(lx,lz).then(le=>{ le.wear.add([[.5,.68,.9,.11,'w'],[.5,.6,.85,.13,'b']]); le.wrap.rotation.x=-Math.PI/2+.12; }); BLOOD.pool(lx,lz-1,2.2); S.flags.leahFound=true; },

  /* ---- ④ 애벌레 사냥 ---- */
  async hunt(){ const f=S.flags; S.phase='play'; P.free=true; LARVA.on=true; this.save(27,7.4,Math.PI);
    const show=n=>goal(n>0?'애벌레를 모두 없앤다 — 남은 생체 반응 '+n:'');
    show(LARVA.left()); toast('시신에 다가가면 깨어난다 — 쏴라',3000);
    await new Promise(res=>{ LARVA.onKill=n=>{ show(n); if(n===0) res(); else if(n===4) TALK.say([VG('절반입니다. 남은 반응 넷.')]); };
      TICK.push(function chk(){ if(LARVA.left()===0){ TICK.splice(TICK.indexOf(chk),1); res(); } }); });
    LARVA.on=false; f.hunted=true; await sleep(800);
    await TALK.say([VG('…1호 안의 작은 생체 반응, 모두 사라졌습니다.'),I('끝났나.'),VG('아닙니다. 반응 하나가 남았습니다. 아주 큽니다. 기관실 쪽입니다.'),
      I('…원자로도 기관실에 있다.'),VG('원자로를 다시 켜야 1호를 움직일 수 있습니다. 제어 콘솔 둘입니다.')]);
    return this.engine(); },

  /* ---- ⑤ 기관실 : 원자로 재가동 · 시신을 먹던 성체 ---- */
  async engine(){ const f=S.flags, R=SHIP.rooms.engine; S.phase='play'; P.free=true; this.save(46,10.5,-Math.PI/2);
    goal('기관실로 — 원자로를 다시 켠다 (복도 동쪽 끝)');
    // 원자로 옆에서 시신을 먹고 있다 (등을 돌린 채)
    const [ex,ez]=freeSpot(59.2,19.3,{r:.6}); const meal=(await loadGLB('corpse_b')).clone(); meal.scale.setScalar(.75); meal.rotation.y=Math.PI/2; meal.position.set(ex+.9,0,ez); WORLD.add(meal); BLOOD.pool(ex+.8,ez,2.6);
    const b=this.beast=await BEAST.spawn({at:{x:ex,z:ez},face:Math.PI/2,clip:'eat'});      // 원자로 남쪽 바닥 · 입구(서쪽)에 등을 돌리고
    let chomp=0; const eat=dt=>{ if(b.cur!==b.A.eat) return; chomp-=dt; if(chomp<=0){ chomp=2.6+Math.random()*1.5; SFX.play('beast_eat',{at:b.wrap.position}); } }; TICK.push(eat);
    await STORY.reach(55.3,10.5,1.4);
    S.phase='cut'; P.free=false; await lookAt(ex,1.2,ez,1.4); P.look=true;
    await TALK.say([I('…'),VG('(작게) 움직이지 마십시오. 저것이… 1호 대원들을…'),I('먹고 있다.'),VG('원자로 콘솔 둘은 입구 왼쪽과 오른쪽입니다. 웅크리면 덜 보입니다. 저것에게 들키면—'),I('알아.')]);
    P.look=false; S.phase='play'; P.free=true; ME.setCrouch(true);
    // 들키면 쫓아온다 · 잡히면 처음부터 (먹던 자리로)
    let stop=null; const wake=()=>{ if(stop) return; TICK.splice(TICK.indexOf(eat),1); stop=BEAST.hunt(b,{patrol:[[60,4.5],[66.5,10.35],[60,16.2],[50,10.5],[30,10.5]],onCatch:()=>this.died()}); };
    const watch=()=>{ if(!stop&&(BEAST.sees(b)&&Math.hypot(P.x-ex,P.z-ez)<6||b.stun>0||S.run)) wake(); }; TICK.push(watch);
    this.save(54,10.5,Math.PI/2,async()=>{ if(stop){ stop(); stop=null; } b.stun=0; b.wrap.position.set(ex,0,ez); b.wrap.rotation.y=Math.PI/2; BEAST.play(b,'eat'); if(!TICK.includes(eat)) TICK.push(eat); });
    const cons=(R.consoles&&R.consoles.length?R.consoles:[]).slice(0,2); let done=0;
    goal('원자로 제어 콘솔 둘을 켠다 — 0 / 2');
    await Promise.all(cons.map((c,i)=>STORY.at(c,'원자로 제어 콘솔 — 켠다','',{range:2.4}).then(async()=>{ done++; AUDIO.tone(300+i*200,.4,'square',.05); AUDIO.noise(.8,.3,0,500); goal('원자로 제어 콘솔 둘을 켠다 — '+done+' / 2');
      if(done===1){ TALK.say([VG('첫 번째 콘솔 응답. …소리가 컸습니다.')]); wake(); b.heard={x:P.x,z:P.z}; } })));
    TICK.splice(TICK.indexOf(watch),1);
    this.lightsOn(); FX.shake(1.2,.03); AUDIO.tone(55,4,'sawtooth',.08,0,40);
    await TALK.say([VG('원자로 재점화! 1호 전력 복구 — 12%, 30%…'),VG('함교 조종석으로 가십시오, 크리스. 거기서 1호를 움직일 수 있습니다!')]);
    if(!stop) wake(); this.stopBeast=()=>{ stop&&stop(); };
    return this.escape(); },

  /* ---- ⑥ 함교로 → 1호를 몰고 웜홀로 ---- */
  async escape(){ const f=S.flags; S.phase='play'; P.free=true;
    if(!this.beast){ const b=this.beast=await BEAST.spawn({at:{x:60,z:16},face:-Math.PI/2,clip:'idle'}); this.stopBeast=BEAST.hunt(b,{patrol:[[40,10.5],[20,10.5],[14,20],[5,10.5]],onCatch:()=>this.died()}); }
    const rehunt=()=>{ this.stopBeast&&this.stopBeast(); this.stopBeast=BEAST.hunt(this.beast,{roar:false,patrol:[[40,10.5],[20,10.5],[14,20],[5,10.5]],onCatch:()=>this.died()}); };
    this.save(50,10.5,-Math.PI/2,async()=>{ const b=this.beast; b.stun=0; b.wrap.position.set(62,0,16); rehunt(); b.heard={x:52,z:10.5}; });
    goal('함교로 — 조종석에서 1호를 움직인다 (복도 서쪽 끝)');
    const cs=SHIP.rooms.bridge.spots.captain||{x:0,z:-1}, seat=new THREE.Mesh(new THREE.CylinderGeometry(.5,.5,1.4,12),PICK); seat.position.set(cs.x,.7,cs.z); WORLD.add(seat);
    await STORY.at(seat,'함장석 — 1호를 움직인다','함교 함장석으로 — 1호를 움직인다',{range:2.6});
    this.stopBeast&&this.stopBeast(); S.phase='cut'; P.free=false; ME.setCrouch(false); goal('');
    const d=SHIP.doors.bridge, b=this.beast; await d.close(); SHIP.lock.bridge=()=>'열면 안 된다!';
    BEAST.stop(b); b.wrap.position.set(0,0,10.8); b.wrap.rotation.y=Math.PI;
    await camTo({x:cs.x,z:cs.z+.1,yaw:0,pitch:.02,eye:1.22},1.2); P.look=true;
    for(let i=0;i<3;i++){ await sleep(650); THUD(.55); GROWL(.12); FX.shake(.3,.04); toast(['쾅!','쾅!!','쾅!!!'][i],600); }
    await TALK.say([VG('함교 문 밀폐. 1호 조종권 확보. 항로… 웜홀 입구까지 사흘.'),I('사흘 동안 저것과 같은 배에.'),VG('네. 그리고 크리스—'),I('…알아. 문이 오래 버티지 못한다는 거.'),
      VG('1호, 출발합니다.')]);
    AUDIO.hum(1.4,34); FX.shake(2,.03); await sleep(1500); await fade(true,2200);
    await card('하위헌스 1호 — 웜홀로','이야기는 여기까지 (다음 : 웜홀 속에서)','분기점 · 문제는 사용자 지시를 기다린다',5200);
    location.search=''; },
};
// 입김 : 작은 흰 안개가 퍼지며 사라진다
function breath(p){ const t=BREATH_TEX(); const sp=new THREE.Sprite(new THREE.SpriteMaterial({map:t,transparent:true,depthWrite:false,opacity:.0})); sp.position.copy(p); sp.scale.setScalar(.15); WORLD.add(sp);
  let k=0; const f=dt=>{ k+=dt; sp.material.opacity=Math.sin(Math.min(1,k/1.6)*Math.PI)*.18; sp.scale.setScalar(.15+k*.25); sp.position.y+=dt*.05; if(k>1.6){ WORLD.remove(sp); TICK.splice(TICK.indexOf(f),1); } }; TICK.push(f); }
const BREATH_TEX=()=>BREATH_TEX.t||(BREATH_TEX.t=(()=>{ const c=document.createElement('canvas'); c.width=c.height=64; const g=c.getContext('2d'), r=g.createRadialGradient(32,32,0,32,32,32); r.addColorStop(0,'rgba(230,236,245,.9)'); r.addColorStop(1,'rgba(230,236,245,0)'); g.fillStyle=r; g.fillRect(0,0,64,64); return new THREE.CanvasTexture(c); })());
