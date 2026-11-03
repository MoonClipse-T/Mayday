/* ============================================================
   MAYDAY 4판 — 한 흐름 (장 · 화면 전환 없음 · STORY.md)
   ⓪ NASA 브리핑룸 (scenes/s0_meeting.js · 구조 계획) → 넉 달 뒤
   ① 구조정 조종석 : 웜홀 건너편 · Mayday 녹음 · 불 꺼진 1호 · 연료는 편도분 → 도킹 (화면 전환은 여기 한 번 — 해치를 지나 1호로)
   ② 1호 : 암흑 · 손전등 · 찢긴 시신 · 피 → ③ 동면 구역 C 의 생존자 레아 → 가슴에서 애벌레 → 첫 사격
   ④ 애벌레 사냥 (시신마다 하나) → ⑤ 기관실 원자로 재가동 · 시신을 먹던 성체 → 숨고 · 도망쳐 ⑥ 함교 → 1호를 몰고 웜홀로 (다음 이야기 : 사용자 지시 대기)
   저장 지점 : 죽으면 그 자리부터 (GAME.cp) · 제작용 바로 가기 ?s=cockpit · board · survivor · hunt · engine · bridge
   ============================================================ */
'use strict';
const VG=t=>({who:'VEGA',ch:'무전 · 구조정',kind:'vega',t}), I=t=>({kind:'me',t}), RADIO=t=>({who:'HUY-1',ch:'녹음 · 312일째',kind:'radio',t});
// 시신 (애벌레가 든 몸) : 자리 · 모델(a 벽에 기대 앉은 방호복 — 등이 모델의 −z · b 천에 덮인 몸 · c 피 묻은 천) · 방향
const BODIES=[[22,10.6,'b',1.57],[45,9.7,'c',.3],[33,11.8,'a',Math.PI],[16.6,-3.2,'b',1],[29.4,5.2,'c',0],[41,3.6,'b',.5],[9,9.3,'a',0],[2,-1.2,'b',.8],[24,21,'c',2]];

const GAME={cp:null,
  stages:['meeting','cockpit','board','survivor','hunt','engine','bridge'],
  // 바로 가기 · 처음부터
  async jump(key){ const f=S.flags; S.phase='cut'; P.free=false;
    if(key==='meeting') return SCENES.meeting.enter();
    if(key==='cockpit') return this.cockpit();
    await this.ship();
    if(key==='board') return this.board();
    fade(false,1200);
    if(key==='survivor'){ warp(27,7.4,Math.PI*0); return this.survivor(); }
    this.leahDead(); if(key==='hunt'){ warp(27,7,Math.PI); return this.hunt(); }
    Object.assign(f,{hunted:true}); LARVA.on=false; LARVA.hosts.forEach(h=>h.done=true);
    if(key==='engine'){ warp(46,10.5,-Math.PI/2); return this.engine(); }
    f.power=true; ROOMS.power(); warp(54,10.5,Math.PI/2); return this.escape(); },

  /* ---- ① 구조정 ---- */
  async cockpit(){ S.phase='cut'; P.free=false; LEVEL.clear(); goal(''); stamp('구조정 R-1 · 조종석','2091.07 · 웜홀 통과 +00:04');
    const [ck,h1]=await Promise.all([loadGLB('cockpit'),loadGLB('ship_ext')]); WORLD.add(ck); ck.position.y=-1.74;
    ck.traverse(o=>{ if(o.isMesh&&/glass/i.test(o.material.name)){ o.material.transparent=true; o.material.opacity=.12; o.material.depthWrite=false; } });
    await SKY.space({...SHIP.sky(),dir:[.1,.08,-1],R:.1});      // 막 지나온 웜홀은 등 뒤
    WORLD.add(new THREE.HemisphereLight(0x9fb4d0,0x0a0b0d,.35)); const dash=new THREE.PointLight(0x7fd4ff,.9,2.4,2); dash.position.set(0,.85,-.55); WORLD.add(dash);
    // 1호 : 불이 하나도 없는 배 (어둡게) — 앞 창 너머 멀리서 다가온다
    h1.traverse(o=>{ if(o.isMesh){ o.material=o.material.clone(); if(o.material.color) o.material.color.multiplyScalar(.5); if(o.material.emissive) o.material.emissive.setRGB(0,0,0); } });
    h1.rotation.set(.12,.7,.05); WORLD.add(h1); const sun=new THREE.DirectionalLight(0xffd2a0,1.6); sun.position.set(-300,200,-500); WORLD.add(sun);
    let far=1; TICK.push(dt=>{ far=Math.max(0,far-dt/70); h1.position.set(18*far-6,-6+2*far,60+520*far); h1.rotation.y+=dt*.004; });
    P.x=0; P.z=-1.22; P.y=0; P.eye=1.02; P.yaw=Math.PI; P.pitch=-.04; P.look=true;      // 조종석은 +z 를 본다
    await fade(false,2400);
    await card('웜홀 건너편 · NGC 3500','MAYDAY','지구를 떠난 지 넉 달 · 1호가 끊긴 지 열한 달',3600);
    await TALK.say([VG('동면 해제 완료. 웜홀 통과 완료. 선체 이상 없음. 크리스, 들립니까?'),I('…들린다. 넉 달 잤는데 어제 회의실에 있던 것 같군.'),
      VG('하위헌스 1호의 마지막 녹음을 다시 재생합니다.')]);
    AUDIO.radio(5); await TALK.say([RADIO('…여기는 하위헌스 1호… 대원 열두 명 중… 우리는 지금…'),RADIO('Mayday, Mayday, we are—')]);
    await TALK.say([I('…312일 동안 자료를 보내던 배가, 이 한 마디로 끝났다.'),VG('1호 위치 확인. 앞쪽 1.2 km. 불빛 없음. 열 반응 없음. 생명 신호… 하나.'),
      I('하나. …엘레나가 말한 레아 문일까.'),VG('다시 알려 드립니다. 이 구조정의 연료는 편도분입니다. 지구로 돌아가려면 1호의 원자로와 연료가 필요합니다.'),
      I('계획대로다. 1호를 깨워서, 1호를 몰고 돌아간다.'),VG('네. 도킹 장치 정렬 중입니다.')]);
    while(far>.02) await sleep(200);
    AUDIO.noise(1.2,.35,0,300); THUD(.6); FX.shake(.7,.05); await sleep(900);
    await TALK.say([VG('도킹 완료. 1호 에어록 바깥 해치와 연결되었습니다. 안쪽 기압 정상, 온도 영하 12도.'),VG('그레이 국장의 지시를 다시 알려 드립니다 — 권총을 챙기십시오.'),I('…18 헤르츠. 그 소리가 뭔지 이제 알게 되겠군.')]);
    // 일어나 해치로 : 화면 전환은 여기 한 번
    P.look=false; await camTo({z:-1.9,eye:1.3,pitch:.15},1.4); AUDIO.noise(1.4,.25,0,1500); await fade(true,1200);
    await this.ship(); return this.board(); },

  /* ---- 1호 불러오기 (어둠 · 시신 · 피) ---- */
  async ship(){ const f=S.flags; await SCENES.ship.enter(); STORY.show('h1',true); STORY.dark(true,{red:true}); SHIP.dim=.32;
    Object.values(SHIP.doors).forEach(d=>d.open());      // 전력이 없어 문은 모두 열린 채
    await this.bodies(); await GUN.hold(); ME.heal(); ME.onDeath=()=>this.died(); DREAD.on();
    // 어둠 속 소리 : 몇 초마다 어딘가에서 (가끔 머리 위 쿵)
    let t=6; TICK.push(dt=>{ if(S.phase!=='play') return; t-=dt; if(t<=0){ t=7+Math.random()*8; Math.random()<.45?GROWL(.035):Math.random()<.5?THUD(.1):AUDIO.tone(2200+Math.random()*600,.6,'sine',.01,0,-400); } });
    // 입김 : 차가운 배
    { let b=0; TICK.push(dt=>{ b-=dt; if(b<=0&&S.phase==='play'&&!f.power){ b=3+Math.random(); const p=camera.getWorldPosition(new THREE.Vector3()).add(camera.getWorldDirection(new THREE.Vector3()).multiplyScalar(.35)); p.y-=.12; breath(p); } }); } },
  // 시신 놓기 : 바닥에 피 웅덩이 · 애벌레 등록
  async bodies(){ const M={a:loadGLB('corpse_a'),b:loadGLB('corpse_b'),c:loadGLB('corpse_c')}; this.hosts=[];
    for(const [x0,z0,k,ry] of BODIES){ const src=await M[k], o=src.clone(), [x,z]=freeSpot(x0,z0,{r:k==='a'?.25:.55});
      const bb=new THREE.Box3().setFromObject(o), sz=bb.getSize(new THREE.Vector3()), s=k==='a'?1:1.8/Math.max(sz.x,sz.z);
      o.scale.setScalar(s); o.rotation.y=ry; const g=new THREE.Group(); g.add(o); const c=new THREE.Box3().setFromObject(o).getCenter(new THREE.Vector3()); o.position.x-=c.x; o.position.z-=c.z; o.position.y-=bb.min.y*s;
      g.position.set(x,0,z); WORLD.add(g); BLOOD.pool(x+(Math.random()-.5)*.4,z+(Math.random()-.5)*.4,2.2+Math.random()*.8);
      this.hosts.push(LARVA.host({x,z,near:k==='a'?4.5:5.2})); } },
  // 죽으면 : 마지막 저장 지점부터
  async died(){ S.phase='cut'; P.free=false; SCREAM(.5); await fade(true,1400); ME.setCrouch(false);
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
    const lx=24.5, lz=-5.0, le=this.leah=await PEOPLE.spawn({kind:'sophia',name:'레아 문',role:'1호 생물학자',at:{x:lx,z:lz,yaw:0}}); le.watch=false; le.solid=false;
    le.sleep=true; le.wrap.rotation.set(-Math.PI/2,0,0); le.wrap.position.y=.12;      // 바닥에 반듯이 누워 (발이 남 · 머리가 북쪽 벽)
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
    await TALK.say([VG('크리스! 쏘십시오!')]); goal('쏴라 — F 또는 [사격]'); S.phase='play'; P.free=true;
    LARVA.on=true; await new Promise(r=>{ LARVA.onKill=()=>r(); });
    goal(''); await sleep(600);
    await TALK.say([I('…하아… 하아…'),VG('생체 반응… 늘어납니다. 일곱, 여덟… 1호 곳곳의 시신마다 하나씩입니다.'),
      I('"먹다 남긴 몸마다 알을." …전부 깨어나고 있다.'),VG('원자로가 있는 기관실까지 가려면 복도를 지나야 합니다. 그것들을 그냥 두면 따라옵니다.')]);
    return this.hunt(); },
  // 가슴에서 애벌레 : 경련 · 피 · 붉은 섬광 → 내 쪽으로 뛰어든다
  async birth(le){ const w=le.wrap.position, chest=new THREE.Vector3(w.x,.3,w.z-1.25);
    let shake=true; const sh=()=>{ if(shake){ le.wrap.position.y=.12+Math.abs(Math.sin(S.t*31))*.05; le.wrap.rotation.y=Math.sin(S.t*27)*.05; } }; TICK.push(sh); AUDIO.noise(1.6,.12,0,500);
    await TALK.say([{who:'레아',t:'커헉… 커, 커헉—',npc:le}]);
    BLOOD.spray(chest,30,3); SQUELCH(.4); await sleep(500); BLOOD.spray(chest,40,3.6); AUDIO.noise(.6,.3,0,900); await sleep(400);
    const fl=new THREE.PointLight(0xff2010,8,6,1.6); fl.position.copy(chest); WORLD.add(fl); setTimeout(()=>WORLD.remove(fl),160);
    BLOOD.spray(chest,70,5); AUDIO.tone(1100,.5,'sawtooth',.07,0,700); STING(.8); FX.flash('#ff2010',300); FX.shake(.5,.05);
    shake=false; TICK.splice(TICK.indexOf(sh),1); le.wrap.rotation.set(-Math.PI/2+.12,0,0); le.wrap.position.y=.12;
    const l=await LARVA.spawn(chest.x,chest.z,0); l.state='rise'; l.t=1.4; l.wrap.rotation.y=Math.atan2(P.x-chest.x,P.z-chest.z); l.wrap.position.y=.0;
    LARVA.hosts.push({x:chest.x,z:chest.z,done:true}); await sleep(900); return l; },
  leahDead(){ const lx=24.5, lz=-5.0; PEOPLE.spawn({kind:'sophia',name:'레아 문',at:{x:lx,z:lz,yaw:0}}).then(le=>{ le.sleep=true; le.watch=false; le.solid=false; le.wrap.rotation.set(-Math.PI/2+.12,0,0); le.wrap.position.y=.12; }); BLOOD.pool(lx,lz-1,2.2); S.flags.leahFound=true; },

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
    let chomp=0; const eat=dt=>{ if(b.cur!==b.A.eat) return; chomp-=dt; if(chomp<=0){ chomp=1.2+Math.random(); const d=Math.hypot(P.x-ex,P.z-ez); if(d<20) SQUELCH(.05+.15*Math.max(0,1-d/20)); } }; TICK.push(eat);
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
    ROOMS.power(); STORY.dark(true,{red:false}); SHIP.dim=.75; FX.shake(1.2,.03); AUDIO.tone(55,4,'sawtooth',.08,0,40);
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
