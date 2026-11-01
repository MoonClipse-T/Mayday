/* ============================================================
   7장 · 사냥 — 성운 셋 (앞 창 = 암흑 성운 · 뒤 카메라 = 반사 · 방출 성운) → 보안 무기함의 펄스 권총 (맞히면 멈칫할 뿐) → 오언이 끌려간다 → 숨기 → 달리기 · 문 닫기
   8장 · 일어선 것 — 우리은하 지도 (헤일로 · 중심부 · 태양계 자리) → 차단기 파괴 · 암흑 → 서준 → 마야가 동면실 냉각제로 성체를 재우고 → 다니엘 5분 실종
   기생체 : web/alien.js (어린 개체 = 같은 모델을 사람 키로 · 네 발 crawl / 성체 = 2.7 m · 두 발)
   ============================================================ */
'use strict';
// 사람 대사 만들기 (그 장에서 새로 세운 사람)
const sayer=(who,npc)=>t=>({who,t,npc}), ME=t=>({kind:'me',t}), VG=t=>({who:'VEGA',kind:'vega',t}), RADIO=(who,t)=>({who,ch:'무전',kind:'radio',t});
// 손에 든 펄스 권총 (보안 무기함 IT_gun) : F 키 · [사격] 단추. 맞히면 잠깐 멈칫할 뿐 — 쓰러뜨릴 수는 없다. 탄 8발
STORY.hold=function(){ const src=this.it('gun'); if(!src||this.held) return; src.visible=false; const a=src.clone(); a.visible=true; a.scale.setScalar(1.6); WORLD.add(a); this.held=a; this.ammo=8; this.kick=0;
  const q=new THREE.Quaternion().setFromEuler(new THREE.Euler(0,Math.PI/2,0)), off=new THREE.Vector3(.26,-.3,-.55);
  TICK.push(dt=>{ if(!a.parent) return; this.kick=Math.max(0,this.kick-dt*6); a.quaternion.copy(camera.quaternion).multiply(q).multiply(new THREE.Quaternion().setFromEuler(new THREE.Euler(0,0,this.kick*.5)));
    a.position.copy(off).add(new THREE.Vector3(0,this.kick*.04,this.kick*.08)).applyQuaternion(camera.quaternion).add(camera.position); a.position.y+=Math.sin(P.bob||0)*.01; });
  let b=$('#fire'); if(!b){ b=document.createElement('button'); b.id='fire'; b.className='ring'; $('#hud').appendChild(b); b.addEventListener('pointerdown',e=>{ e.stopPropagation(); STORY.shoot(); }); }
  b.classList.add('on'); this.ammoShow();
  if(!this.fk){ this.fk=true; addEventListener('keydown',e=>{ if(e.code==='KeyF'&&!e.repeat) STORY.shoot(); }); }
  this.dread(); };
STORY.ammoShow=function(){ const b=$('#fire'); if(b) b.innerHTML='사격<small>'+this.ammo+'</small>'; };
STORY.unhold=function(){ if(this.held){ WORLD.remove(this.held); this.held=null; } const b=$('#fire'); if(b) b.classList.remove('on'); };
STORY.shoot=function(){ if(!this.held||S.phase!=='play'||TALK.on) return;
  if(this.ammo<=0){ AUDIO.tone(1800,.04,'square',.04); toast('찰칵 — 탄이 없다',1500); return; }
  this.ammo--; this.ammoShow(); this.kick=1; AUDIO.noise(.18,.4,0,3000); AUDIO.tone(140,.25,'sawtooth',.08,0,-90);
  const fl=new THREE.PointLight(0x9fd8ff,6,8,1.6); fl.position.copy(camera.position); WORLD.add(fl); setTimeout(()=>WORLD.remove(fl),70);
  const o=camera.position.clone(), d=camera.getWorldDirection(new THREE.Vector3()); let hit=null, best=30;
  for(const a of ALIEN.list){ const h=(a.h||2.7), c=a.wrap.position.clone().add(new THREE.Vector3(0,h*.45,0)), t=c.clone().sub(o).dot(d); if(t<0||t>best) continue;
    const r=o.clone().addScaledVector(d,t).distanceTo(c); if(r<Math.max(.5,h*.3)){ hit=a; best=t; } }
  const end=o.clone().addScaledVector(d,hit?best:30), g=new THREE.BufferGeometry().setFromPoints([this.held.position.clone(),end]);
  const ln=new THREE.Line(g,new THREE.LineBasicMaterial({color:0xbfe8ff,transparent:true,opacity:.9})); WORLD.add(ln); setTimeout(()=>WORLD.remove(ln),60);
  if(hit){ hit.stun=.9; hit.openTo=1; setTimeout(()=>hit.openTo=null,900); AUDIO.tone(500,.4,'sawtooth',.06,0,-350); ALIEN.play(hit,'roar',{once:true}).then(()=>{ if(hit.path) ALIEN.play(hit,hit.move||'run'); });
    for(let k=0;k<10;k++){ const sp=new THREE.Sprite(new THREE.SpriteMaterial({color:0x40ff60,transparent:true,depthWrite:false})); sp.scale.setScalar(.08); sp.position.copy(end); WORLD.add(sp);
      const v=new THREE.Vector3(Math.random()-.5,Math.random()*.8,Math.random()-.5).multiplyScalar(3); let t=0; const fn=dt=>{ t+=dt; sp.position.addScaledVector(v,dt); v.y-=dt*6; sp.material.opacity=1-t/.6; if(t>.6){ WORLD.remove(sp); TICK.splice(TICK.indexOf(fn),1); } }; TICK.push(fn); } } };
// 공포 : 가장 가까운 기생체와의 거리로 붉은 가장자리 · 심장 소리 · 흔들림
STORY.dread=function(){ if(this._dreadFn&&TICK.includes(this._dreadFn)) return; let el=$('#dread'); if(!el){ el=document.createElement('div'); el.id='dread'; document.body.appendChild(el); }
  let beat=0; TICK.push(this._dreadFn=dt=>{ let d=99; for(const a of ALIEN.list){ const w=a.wrap.position; d=Math.min(d,Math.hypot(P.x-w.x,P.z-w.z)); }
    const k=Math.max(0,Math.min(1,(13-d)/10)); el.style.opacity=k*.85; beat-=dt;
    if(k>0&&beat<=0){ beat=1.1-k*.75; AUDIO.tone(48,.18,'sine',.09*(.4+k)); setTimeout(()=>AUDIO.tone(42,.14,'sine',.07*(.4+k)),160); }
    if(d<3.5&&S.phase==='play'){ camera.position.x+=(Math.random()-.5)*.02*(3.5-d); camera.position.y+=(Math.random()-.5)*.02*(3.5-d); } }); };
// 쫓아오기 : 기생체가 나를 쫓는다. 닿으면 할퀴고 caught() · 목표 지점에 닿으면 끝
STORY.chase=function(a,{to,r=1.3,speed=3,clip='run',catchR=1.35,started=()=>true,safe=()=>false}){ return new Promise(res=>{ let busy=false, done=false;
  const fn=async()=>{ if(done||busy||!started()) return; const w=a.wrap.position, d=Math.hypot(P.x-w.x,P.z-w.z);
    if(Math.hypot(P.x-to.x,P.z-to.z)<r||(safe()&&d>5)){ done=true; TICK.splice(TICK.indexOf(fn),1); ALIEN.stop(a); ALIEN.play(a,'idle'); return res(true); }
    if(d<catchR&&S.phase==='play'){ busy=true; done=true; TICK.splice(TICK.indexOf(fn),1); ALIEN.stop(a); a.wrap.rotation.y=Math.atan2(P.x-w.x,P.z-w.z);
      P.free=false; AUDIO.tone(700,.3,'sawtooth',.07,0,-300); ALIEN.play(a,'swipe',{once:true}); await sleep(500); await fade(true,300); return res(false); }
    if(!a.path||Math.hypot(a.path[0][0]-P.x,a.path[0][1]-P.z)>.8) ALIEN.go(a,[[P.x,P.z]],{speed,clip}); };
  TICK.push(fn); }); };
// 숨었나 : 식당 양쪽 칸 (칸막이 뒤)
const hidden=()=>P.z<8.4&&P.z>-8.4&&P.x>7.8&&P.x<20.3&&(P.x>18.05||P.x<10.0);
// 앞 창 너머 구름 (암흑 성운 : 별을 가린다)
STORY.cloud=function(dir,size,rgba,add){ const cv=document.createElement('canvas'); cv.width=cv.height=256; const g=cv.getContext('2d');
  for(let i=0;i<40;i++){ const x=128+(Math.random()-.5)*120, y=128+(Math.random()-.5)*90, r=30+Math.random()*60, gr=g.createRadialGradient(x,y,0,x,y,r); gr.addColorStop(0,rgba); gr.addColorStop(1,'rgba(0,0,0,0)'); g.fillStyle=gr; g.fillRect(0,0,256,256); }
  const sp=new THREE.Sprite(new THREE.SpriteMaterial({map:new THREE.CanvasTexture(cv),depthWrite:false,fog:false,blending:add?THREE.AdditiveBlending:THREE.NormalBlending}));
  sp.scale.setScalar(size); sp.renderOrder=-1; const d=new THREE.Vector3(...dir).normalize(); WORLD.add(sp); TICK.push(()=>sp.position.copy(camera.position).addScaledVector(d,600)); (this.skies=this.skies||[]).push(sp); return sp; };
// 그 장에 필요 없는 사람 치우기
STORY.clearCast=function(){ const keep=Object.values(SHIP.crew||{}).filter(Boolean); PEOPLE.list.slice().forEach(p=>{ if(!keep.includes(p)) PEOPLE.remove(p); }); STORY.leah=null; };

const CH7={
  async start(){ const f=S.flags; f.ch7=true; f.leahDead=true; STORY.crew(); STORY.clearCast(); if(!f.jump1){ f.jump1=true; CH3.sky(); }
    SHIP.huy1=false; STORY.show('h1',false); STORY.dark(false); SHIP.dim=.7; STORY.seated(true); SHIP.lock={};
    const c=SHIP.crew, MY=sayer('마야',c.maya), SJ=sayer('서준',c.seojun), DN=sayer('다니엘',c.daniel);
    let ow=c.owen; if(!ow){ const sp=SHIP.rooms.bridge.spots.door||{x:0,z:7.2}; ow=c.owen=await PEOPLE.spawn({kind:'owen',name:'오언 하트',role:'보안',at:{x:sp.x,z:sp.z,yaw:Math.PI}}); }
    const OW=sayer('오언',ow);
    const sp=SHIP.rooms.bridge.spawn; warp(sp.x,sp.z,sp.yaw); SHIP.zone=null;
    STORY.cloud([.05,.03,-1],260,'rgba(0,0,0,.92)',false);                    // 앞 창 : 별이 없는 검은 구름
    await card('','몇 시간 뒤','하위헌스 2호 · 함교 · 귀환 항로',2400);
    await TALK.say([VG('웜홀 출구로 가는 길에 성운 셋. 어느 하나는 지나가야 합니다.'),
      SJ('검은 구름 안에선 별이 안 보여서 항법이 안 되고, 스스로 빛나는 붉은 구름은 뜨거운 별 둘레라 방사선이 세요. 둘 다 못 들어가요.'),
      ME('그럼 남은 하나 — 어느 게 어느 건지부터 가려내자. 과학 스테이션에 사진을 띄워.')]);
    goal('과학 스테이션에서 성운 사진 셋을 나눈다');
    await STORY.wait(BRIDGEUI.mesh('sci'),'과학 스테이션 — 성운 사진 셋');
    const pic=k=>{ const cv=document.createElement('canvas'); cv.width=220; cv.height=140; const g=cv.getContext('2d'); g.fillStyle='#05070a'; g.fillRect(0,0,220,140);
      for(let i=0;i<120;i++){ g.fillStyle=`rgba(255,255,255,${Math.random()*.8})`; g.fillRect(Math.random()*220,Math.random()*140,1.4,1.4); }
      const blob=(col,n)=>{ for(let i=0;i<n;i++){ const x=110+(Math.random()-.5)*110, y=70+(Math.random()-.5)*70, r=18+Math.random()*30, gr=g.createRadialGradient(x,y,0,x,y,r); gr.addColorStop(0,col); gr.addColorStop(1,'rgba(0,0,0,0)'); g.fillStyle=gr; g.fillRect(0,0,220,140); } };
      if(k===0) blob('rgba(0,0,0,.95)',30); if(k===1){ blob('rgba(90,140,255,.5)',22); g.fillStyle='#fff'; g.beginPath(); g.arc(110,70,4,0,7); g.fill(); } if(k===2) blob('rgba(255,70,90,.55)',26);
      return cv.toDataURL(); };
    await STORY.sort('NEBULAE · 성운 셋',`<span class="pics"><img src="${pic(0)}" alt="앞 창"><img src="${pic(1)}" alt="뒤 카메라 1"><img src="${pic(2)}" alt="뒤 카메라 2"></span>그림은 왼쪽부터 앞 창 · 뒤 카메라 1 · 뒤 카메라 2`,['암흑 성운','반사 성운','방출 성운'],
      [['앞 창 — 별이 없는 검은 구름',0],['뒤쪽 별빛을 가린다',0],['뒤 카메라 1 — 밝은 별 둘레의 파란 구름',1],['가까운 별의 빛을 반사한다',1],['뒤 카메라 2 — 붉은 구름',2],['뜨거운 별 빛을 받아 스스로 빛을 낸다',2]],
      i=>[0,1].includes(i)?'검게 보이는 건 빛을 내지도 반사하지도 않고 가리기 때문':[2,3].includes(i)?'파란 구름 가운데 밝은 별 — 그 빛을 되비춘다':'붉은 구름은 스스로 빛을 낸다');
    goal(''); await TALK.say([SJ('반사 성운으로 — 별빛이 보이고 방사선도 약해요. 항로 확정.'),
      VG('경고. 복도 천장 환기구에서 움직임. 크기… 사람만 합니다.'),DN('사람만 하다고요? 하루 만에?'),
      OW('제가 봅니다. 선장님은 함교 옆 보안 무기함에서 권총을 꺼내세요. 비밀번호는 선장님 지문이에요.'),ME('오언, 혼자 가지 마.')]);
    STORY.seated(true); PEOPLE.remove(ow); c.owen=null;
    goal('복도 함교 쪽 벽의 보안 무기함에서 권총을 꺼낸다');
    await STORY.wait(STORY.it('locker'),'보안 무기함 — 펄스 권총',{range:2.6}); STORY.hold(); AUDIO.noise(.3,.2,0,3000);
    // 오언이 끌려간다 : 복도 가운데, 천장 환기구 아래
    S.phase='cut'; P.free=false; goal('');
    const o2=await PEOPLE.spawn({kind:'owen',name:'오언 하트',role:'보안',at:{x:31,z:10.6,yaw:-Math.PI/2}}); const OW2=sayer('오언',o2);
    warp(28.4,10.4,0); await camTo({x:28.4,z:10.4,yaw:yawTo(33.4,10.8),pitch:-.2,eye:1.66},1.2); P.look=true;
    await TALK.say([OW2('선장님, 환기구 창살이 휘어 있어요. 안쪽에서 밀어낸 것처럼…')]);
    await PEOPLE.walk(o2,[[33.3,10.5]],1.1);
    // 오언 앞쪽(카메라 쪽)으로 떨어진다
    const a=await ALIEN.spawn({at:{x:32.6,y:2.2,z:11.3},face:-Math.PI/2,height:1.75,clip:'jump_attack'}); const vg=STORY.it('vent_hall'), gh=vg&&vg.getObjectByName('vent_grate_hall'); if(gh){ gh.position.set(.4,0,-.3); gh.rotation.set(.8,0,.3); }
    AUDIO.noise(.5,.3,0,2000); AUDIO.tone(900,.5,'sawtooth',.06,0,-500);
    await new Promise(r=>{ let k=0; const fn=dt=>{ k=Math.min(1,k+dt/.45); a.wrap.position.y=2.2*(1-k*k); if(k>=1){ TICK.splice(TICK.indexOf(fn),1); r(); } }; TICK.push(fn); });
    o2.sleep=true; o2.wrap.rotation.set(-Math.PI/2,0,0); o2.wrap.position.y=.15;
    await TALK.say([OW2('으아아—!'),ME('오언!')]);
    ALIEN.play(a,'crawl_run'); const drag=dt=>{ a.wrap.position.x+=dt*3.2; o2.wrap.position.x=a.wrap.position.x+.9; a.wrap.rotation.y=Math.PI/2; }; TICK.push(drag);
    await sleep(2400); TICK.splice(TICK.indexOf(drag),1); PEOPLE.remove(o2); ALIEN.clear(); f.owenGone=true; P.look=false;
    await TALK.say([RADIO('마야','선장님! 오언 신호가 끊겼어요!'),VG('그것이 복도를 돌아 서쪽으로 옵니다. 숨으십시오 — 식당 안쪽 칸막이 뒤로.')]);
    S.phase='play'; P.free=true;
    // 숨기 → 달리기 (잡히면 그 단계부터 다시)
    while(!(await this.hide())) await this.retry(24,10.6);
    while(!(await this.run())) await this.retry(19,1.2);
    await TALK.say([ME('하아… 하아…'),VG('라운지 문 잠금. 그것은 복도 환기구로 물러갔습니다.'),RADIO('다니엘','선장님, 괜찮아요? 저희도 라운지로 갈게요. 거기가 제일 넓어요.')]);
    await STORY.next('7장 · 사냥 — 끝','8장 · 일어선 것',()=>CH8.start()); },
  async retry(x,z){ ALIEN.clear(); warp(x,z,P.yaw); await sleep(400); await fade(false,800); S.phase='play'; P.free=true; toast('다시 — 들키지 않게',2400); },
  // 숨기 : 그것이 복도 → 식당 안을 한 바퀴 → 함교 쪽으로. 칸막이 뒤에 있지 않고 4.5 m 안에 들어오면 잡힌다
  async hide(){ goal('식당 안쪽 칸막이 뒤에 숨는다'); SHIP.doors.deck&&SHIP.doors.deck.open();
    const a=await ALIEN.spawn({at:{x:47,z:10.5},face:-Math.PI/2,height:1.75,clip:'crawl'}); let seen=false; await sleep(1500);
    const watch=()=>{ const w=a.wrap.position; if(!seen&&Math.hypot(P.x-w.x,P.z-w.z)<4.5&&!hidden()) seen=true; }; TICK.push(watch);
    const walk=ALIEN.go(a,[[14,10.5],[14,7.6],[14,2.5],[14,7.6],[14,10.5],[1.5,10.5]],{speed:2.1,clip:'crawl'});
    const r=await Promise.race([walk.then(()=>'pass'),new Promise(res=>{ const t=()=>{ if(seen){ TICK.splice(TICK.indexOf(t),1); res('seen'); } }; TICK.push(t); })]);
    TICK.splice(TICK.indexOf(watch),1); if(r==='pass'){ this.a=a; return true; }
    ALIEN.stop(a); toast('들켰다 — 칸막이 뒤로!',2000);
    if(!(await STORY.chase(a,{to:{x:-99,z:0},speed:3,clip:'crawl_run',safe:hidden}))) return false;
    await ALIEN.go(a,[[14,10.5],[1.5,10.5]],{speed:2,clip:'crawl'}); this.a=a; return true; },
  // 달리기 : 그것이 돌아선다 → 라운지(복도 가운데 남쪽 문)로 들어가 문을 닫는다
  // 그것은 함교 쪽(서쪽 끝)에서 돌아선다 — 라운지 문까지 내가 16 m, 그것이 15 m 남짓 · 달리면(3.74) 이긴다
  async run(){ const a=this.a||await ALIEN.spawn({at:{x:1.5,z:10.5},face:Math.PI/2,height:1.75,clip:'crawl'}); this.a=null; a.wrap.position.set(-1.5,0,10.5);
    SHIP.doors.lobby&&SHIP.doors.lobby.open(); goal('라운지로 달려가 문을 닫는다 (복도 가운데 남쪽 문)'); S.run=true; $('#run').classList.add('on');
    await TALK.say([VG('지금입니다. 라운지로!')]); ALIEN.play(a,'roar',{once:true}); await sleep(900);
    const ok=await STORY.chase(a,{to:{x:14,z:13.6},r:1.4,speed:2.9,clip:'crawl_run'}); S.run=false; $('#run').classList.remove('on');
    if(!ok) return false;
    await SHIP.doors.lobby.close(); SHIP.lock.lobby=()=>'문을 열면 안 된다.'; AUDIO.noise(.4,.3,0,400); ALIEN.go(a,[[14,11.2]],{speed:3,clip:'crawl_run'});
    setTimeout(()=>{ AUDIO.noise(.6,.2,0,800); ALIEN.go(a,[[34,10.5]],{speed:2,clip:'crawl'}).then(()=>ALIEN.clear()); },1600); return true; },
};

/* 우리은하 지도에서 누르기 : regions 판정 (캔버스 좌표) */
STORY.map=function(hd,draw,qs){ return new Promise(res=>{ const p=this.panel(hd), W=1200, H=560;
  p.bd.innerHTML=`<p class="q"></p><canvas width="${W}" height="${H}"></canvas>`; const cv=p.bd.querySelector('canvas'), g=cv.getContext('2d'), q=p.bd.querySelector('.q'), marks=[];
  let k=0, miss=0; const ask=()=>{ q.innerHTML=`<b>${k+1} / ${qs.length}</b> ${qs[k].q}`; miss=0; draw(g,W,H,marks); }; ask();
  cv.onpointerdown=e=>{ const r=cv.getBoundingClientRect(), x=(e.clientX-r.left)/r.width*W, y=(e.clientY-r.top)/r.height*H, Q=qs[k]; if(!Q) return;
    if(Q.hit(x,y)){ marks.push({x,y,t:Q.mark}); p.ok(Q.ok); k++; draw(g,W,H,marks); if(k<qs.length) setTimeout(ask,900); else setTimeout(()=>{ p.close(); res(); },1700); }
    else { miss++; p.no(Q.hint(miss)); } }; }); };

const CH8={
  async start(){ const f=S.flags; f.ch8=true; Object.assign(f,{leahDead:true,owenGone:true}); STORY.crew(); STORY.clearCast(); if(!f.jump1){ f.jump1=true; CH3.sky(); }
    SHIP.huy1=false; STORY.show('h1',false); STORY.dark(false); SHIP.dim=.7; SHIP.lock={lobby:()=>'지금은 문을 열면 안 된다.'};
    STORY.seated(false); const c=SHIP.crew; if(c.seojun){ c.seojun.wrap.visible=true; c.seojun.solid=true; }            // 서준은 함교에 혼자 남아 항법을 본다
    const at=(x,z,tx,tz)=>({x,z,yaw:Math.atan2(x-tx,z-tz)});      // 사람 yaw 는 카메라와 같다 (앞 = −sin, −cos)
    const [my,dn]=await Promise.all([PEOPLE.spawn({kind:'maya',name:'마야 첸',role:'부선장',at:at(19.2,17.4,20.5,19)}),PEOPLE.spawn({kind:'daniel',name:'다니엘 로드리게스',role:'기관',at:at(21.8,17.6,20.5,19)})]);
    const MY=sayer('마야',my), DN=sayer('다니엘',dn), SJR=t=>RADIO('서준',t);
    warp(20.5,19.6,Math.PI); SHIP.zone=null; if(!STORY.held){ STORY.hold(); }
    await card('','세 시간 뒤','하위헌스 2호 · 라운지 · 문을 잠갔다',2400);
    await TALK.say([MY('문은 잠갔어요. 그게 환기구로 다니면 소용없겠지만.'),DN('오언이… 오언이 그렇게 될 줄은.'),
      SJR('선장님, 서준이에요. 항법 컴퓨터가 계속 흔들려요. 집으로 갈 좌표를 우리은하 지도에 다시 찍어야 해요.'),
      SJR('지도를 라운지 화면으로 보낼게요. 은하 구조부터 같이 짚어 주세요.')]);
    goal('라운지 바 뒤 화면에서 우리은하 지도를 짚는다');
    await STORY.wait(BRIDGEUI.mesh('lounge'),'라운지 화면 — 우리은하 지도',{range:3.6});
    // 옆에서 본 은하 (왼쪽) · 위에서 본 은하 (오른쪽)
    const S1={x:300,y:300}, S2={x:880,y:290}, RD=250;
    const draw=(g,W,H,marks)=>{ g.fillStyle='#040506'; g.fillRect(0,0,W,H);
      g.strokeStyle='rgba(159,216,255,.35)'; g.setLineDash([8,8]); g.beginPath(); g.arc(S1.x,S1.y,210,0,7); g.stroke(); g.setLineDash([]);
      for(let i=0;i<26;i++){ const a=i*2.4, r=90+((i*53)%110); g.fillStyle='rgba(255,200,150,.9)'; g.beginPath(); g.arc(S1.x+Math.cos(a)*r,S1.y+Math.sin(a)*r*.95,3,0,7); g.fill(); }
      const disk=g.createLinearGradient(S1.x-RD,0,S1.x+RD,0); disk.addColorStop(0,'rgba(180,200,255,0)'); disk.addColorStop(.5,'rgba(220,225,255,.8)'); disk.addColorStop(1,'rgba(180,200,255,0)');
      g.fillStyle=disk; g.beginPath(); g.ellipse(S1.x,S1.y,RD,14,0,0,7); g.fill(); g.fillStyle='rgba(255,236,190,.95)'; g.beginPath(); g.ellipse(S1.x,S1.y,52,34,0,0,7); g.fill();
      for(let arm=0;arm<4;arm++) for(let i=0;i<220;i++){ const t=i/220, r=30+t*230, a=arm*Math.PI/2+t*4.2; g.fillStyle=`rgba(200,215,255,${.7-t*.4})`; g.fillRect(S2.x+Math.cos(a)*r+(Math.sin(i*7)*6),S2.y+Math.sin(a)*r+(Math.cos(i*5)*6),2.2,2.2); }
      g.fillStyle='rgba(255,236,190,.95)'; g.beginPath(); g.arc(S2.x,S2.y,30,0,7); g.fill();
      g.fillStyle='rgba(233,231,226,.7)'; g.font='500 20px "IBM Plex Sans KR",sans-serif'; g.textAlign='center'; g.fillText('옆에서 본 우리은하',S1.x,H-24); g.fillText('위에서 본 우리은하 · 지름 약 10만 광년',S2.x,H-24);
      g.strokeStyle='#e9e7e2'; g.lineWidth=2; g.beginPath(); g.moveTo(S2.x,26); g.lineTo(S2.x+RD,26); g.moveTo(S2.x,18); g.lineTo(S2.x,34); g.moveTo(S2.x+RD,18); g.lineTo(S2.x+RD,34); g.stroke(); g.lineWidth=1; g.fillText('중심 → 5만 광년',S2.x+RD/2,54);      // 축척 : 중심에서 가장자리까지
      marks.forEach(m=>{ g.strokeStyle='#ff5a36'; g.lineWidth=3; g.beginPath(); g.arc(m.x,m.y,16,0,7); g.stroke(); g.lineWidth=1; g.fillStyle='#ff5a36'; g.font='600 20px "IBM Plex Sans KR",sans-serif'; g.fillText(m.t,m.x,m.y-24); }); };
    await STORY.map('MILKY WAY · 집으로 가는 좌표',draw,[
      {q:'옆에서 본 은하 — 구상 성단(붉은 점)이 흩어진 둥근 영역 <b>헤일로</b> 를 누른다',mark:'헤일로',ok:'헤일로 — 원반을 둥글게 감싼다',
        hit:(x,y)=>{ const d=Math.hypot(x-S1.x,y-S1.y); return x<600&&d<220&&d>60&&Math.abs(y-S1.y)>26; },hint:n=>n>=2?'원반(가운데 납작한 띠) 위아래, 점선 원 안쪽':'원반이 아니라 그 둘레의 둥근 곳'},
      {q:'옆에서 본 은하 — 별이 가장 많이 모인 <b>중심부</b> 를 누른다',mark:'중심부',ok:'중심부 — 볼록하게 부푼 곳',
        hit:(x,y)=>((x-S1.x)/60)**2+((y-S1.y)/40)**2<1,hint:n=>n>=2?'납작한 원반 한가운데 볼록한 곳':'가운데를 보자'},
      {q:'위에서 본 은하 — <b>태양계</b> 자리를 누른다 (중심에서 약 3만 광년 · 나선팔 위)',mark:'태양계',ok:'태양계 — 중심에서 약 3만 광년, 나선팔 위',
        hit:(x,y)=>{ const d=Math.hypot(x-S2.x,y-S2.y)/RD*50000; return x>600&&d>22000&&d<36000; },hint:n=>n>=2?'막대 5만 광년의 반보다 조금 더 바깥':'중심도 가장자리도 아니에요 — 축척 막대를 보자'}]);
    goal(''); await TALK.say([SJR('좋아요, 좌표 들어갑니다… 태양계, 나선팔 위. 계산이 끝나면 바로 웜홀로—'),VG('경고. 주 차단기 함이 열렸습니다. 기관실 앞 복도.')]);
    // 차단기 파괴 · 암흑 · 서준
    const bd=STORY.it('breaker'), door=bd&&bd.getObjectByName('brk_door'); if(door){ door.rotation.z=-1.9; door.position.z-=.02; }
    AUDIO.noise(1,.35,0,1200); AUDIO.tone(50,1.2,'sawtooth',.08); STORY.dark(true,{red:true}); SHIP.dim=.32;
    await TALK.say([MY('불이…!'),SJR('선장님! 함교 앞에 그게… 그게 일어섰어요. 두 발로. 크, 커요—'),SJR('오지 마세요! 오지—'),{who:'무전',kind:'radio',t:'…치지직…'},ME('서준! 서준!')]);
    f.seojunGone=true; STORY.crew();
    // ---- 버티기 : 그것이 라운지로 계속 찾아온다 — 숨고(①) · 쏘아 쫓고(②) · 달린다(③) ----
    this.DN=DN; my.wrap.position.set(11.0,0,23.0); dn.wrap.position.set(12.0,0,23.4); [my,dn].forEach(p=>{ p.solid=false; });
    while(!(await this.hide())) await this.again();
    await TALK.say([DN('…갔어요. 갔어.'),MY('또 올 거예요. 냄새를 맡고 있어요.')]);
    while(!(await this.drive())) await this.again();
    f.danielBit=true; await TALK.say([DN('윽— 목이… 긁혔어요. 괜찮아요, 괜찮아.'),ME('다니엘, 피가—'),DN('괜찮다니까요! 그보다 또 와요.')]);
    await TALK.say([MY('여기 있으면 셋 다 죽어요. 제가 저걸 기관실 쪽으로 끌어낼게요.'),ME('마야, 안 돼.'),MY('선장님은 다니엘이랑 함교로. 집에 가는 좌표, 거기 있잖아요.'),MY('…잘 가요, 크리스.')]);
    while(!(await this.flee(my,dn))) await this.again();
    f.mayaGone=true;
    await TALK.say([VG('함교 문 잠금.'),RADIO('마야','…선장님, 들려요? 끌어냈어요. 기관실까지— 아, 아아—'),{who:'무전',kind:'radio',t:'…치지직…'},DN('…마야.'),ME('…좌표는 들어갔다. 다니엘, 끝까지 간다.')]);
    await STORY.next('8장 · 일어선 것 — 끝','9장 · 증발하는 웜홀',()=>CH9.start()); },
  // 잡혔으면 그 단계 처음으로
  async again(){ ALIEN.clear(); P.eye=1.66; await sleep(300); await fade(false,800); S.phase='play'; P.free=true; toast('다시 — 숨거나, 쏘거나, 달려라',2600); },
  // 숨을 곳 : 바 뒤 · 소파 뒤 (가까이 가면 몸을 웅크린다). 그것과 나 사이를 가구가 막고 있어야 숨은 것
  spots:[[11.4,22.4,'바 뒤'],[19.4,20.7,'소파 뒤']],
  see(a){ const w=a.wrap.position, d=Math.hypot(P.x-w.x,P.z-w.z); if(d>9) return false; const n=Math.ceil(d/.25);
    for(let i=2;i<n-1;i++){ const t=i/n; if(SOLID.hit(w.x+(P.x-w.x)*t,w.z+(P.z-w.z)*t,.3,1.0,.05)) return false; } return true; },
  inSpot(){ return this.spots.some(([x,z])=>Math.hypot(P.x-x,P.z-z)<1.0); },
  crouch(){ if(this._cr&&TICK.includes(this._cr)) return; this._cr=dt=>{ P.eye+=((this.inSpot()?1.0:1.66)-P.eye)*Math.min(1,dt*6); }; TICK.push(this._cr); },
  // ① 숨기 : 10초 안에 숨는다 → 그것이 들어와 둘러보고 나간다. 보이면 쫓아온다
  async hide(){ this.crouch(); const un=this.spots.map(([x,z])=>STORY.mark(x,1.2,z)); let left=10;
    goal('숨는다 — 바 뒤 · 소파 뒤 (표시) · '+left+'초'); await TALK.say([VG('성체가 라운지로 옵니다. 숨으십시오!')]);
    await new Promise(r=>{ const iv=setInterval(()=>{ left--; goal('숨는다 — 바 뒤 · 소파 뒤 (표시) · '+left+'초'); if(left<=3) AUDIO.noise(.2,.25,0,200); if(left<=0){ clearInterval(iv); r(); } },1000); });
    un.forEach(u=>u()); goal('숨죽인다 — 움직이지 말 것'); SHIP.lock.lobby=null; await SHIP.doors.lobby.open(); THUD(.4);
    const a=await ALIEN.spawn({at:{x:14,z:11.2},face:0,height:2.7,clip:'walk'}); a.h=2.7; let seen=false;
    const watch=()=>{ if(!seen&&this.see(a)&&(!this.inSpot()||Math.hypot(P.x-a.wrap.position.x,P.z-a.wrap.position.z)<2.2)) seen=true; }; TICK.push(watch);
    const walk=(async()=>{ await ALIEN.go(a,[[14,13.6],[17,14.6],[22,14.8]],{speed:1.3,clip:'walk'}); ALIEN.play(a,'roar',{once:true}); GROWL(.1); await sleep(2200);
      await ALIEN.go(a,[[17,14.6],[14,13.4],[14,10.6]],{speed:1.4,clip:'walk'}); })();
    const r=await Promise.race([walk.then(()=>'gone'),new Promise(res=>{ const t=()=>{ if(seen){ TICK.splice(TICK.indexOf(t),1); res('seen'); } }; TICK.push(t); })]);
    TICK.splice(TICK.indexOf(watch),1);
    if(r==='gone'){ ALIEN.clear(); await SHIP.doors.lobby.close(); return true; }
    ALIEN.stop(a); toast('들켰다!',1400); ALIEN.play(a,'roar',{once:true}); await sleep(600);
    return STORY.chase(a,{to:{x:-99,z:0},speed:3.4,clip:'run'}); },
  // ② 쫓아내기 : 천장 환기구에서 떨어져 천천히 다가온다 → 세 번 맞히면 물러난다
  async drive(){ const DN=this.DN; STORY.ammo=Math.max(STORY.ammo||0,6); STORY.ammoShow(); goal('');
    await TALK.say([DN('…위에서 소리가 나요.'),VG('천장 환기구! 바로 위입니다!')]);
    const sx=P.x+(P.x<20?4.5:-4.5), sz=Math.min(24.5,Math.max(14,P.z+1.5)); const a=await ALIEN.spawn({at:{x:sx,y:3.6,z:sz},face:Math.atan2(P.x-sx,P.z-sz),height:2.7,clip:'jump_attack'}); a.h=2.7;
    await new Promise(r=>{ let k=0; const fn=dt=>{ k=Math.min(1,k+dt/.4); a.wrap.position.y=3.6*(1-k*k); if(k>=1){ TICK.splice(TICK.indexOf(fn),1); r(); } }; TICK.push(fn); }); THUD(.6); camera.position.y+=.05;
    ALIEN.play(a,'roar',{once:true}); goal('쏴서 쫓아낸다 — F 또는 [사격] · 세 번'); await sleep(900);
    let hits=0; return new Promise(res=>{ let done=false;
      const fn=()=>{ if(done) return; if(a.stun>0&&!a._counted){ a._counted=true; hits++; goal('쏴서 쫓아낸다 — '+hits+' / 3'); } if(!(a.stun>0)) a._counted=false;
        const w=a.wrap.position, d=Math.hypot(P.x-w.x,P.z-w.z);
        if(hits>=3){ done=true; TICK.splice(TICK.indexOf(fn),1); ALIEN.stop(a); ALIEN.play(a,'roar',{once:true}).then(async()=>{ await ALIEN.go(a,[[14,13.4],[14,10.4]],{speed:3,clip:'run'}); ALIEN.clear(); }); goal(''); return res(true); }
        if(d<1.6&&S.phase==='play'){ done=true; TICK.splice(TICK.indexOf(fn),1); ALIEN.stop(a); ALIEN.play(a,'swipe',{once:true}); P.free=false; sleep(500).then(()=>fade(true,300)).then(()=>res(false)); return; }
        if(!(a.stun>0)&&(!a.path||Math.hypot(a.path[0][0]-P.x,a.path[0][1]-P.z)>.8)) ALIEN.go(a,[[P.x,P.z]],{speed:1.25,clip:'walk'}); };
      TICK.push(fn); }); },
  // ③ 달리기 : 마야가 그것을 동쪽으로 끌어낸다 → 다니엘과 함교로. 늦으면 그것이 돌아선다
  async flee(my,dn){ const sp=SHIP.rooms.bridge.spawn; SHIP.lock={}; await SHIP.doors.lobby.open(); SHIP.doors.bridge&&SHIP.doors.bridge.open();
    if(PEOPLE.list.includes(my)){ PEOPLE.walk(my,[[14,13.5],[14,10.6],[44,10.6]],3.2).then(()=>{ if(PEOPLE.list.includes(my)) PEOPLE.remove(my); }); }
    const a=await ALIEN.spawn({at:{x:30,z:10.6},face:-Math.PI/2,height:2.7,clip:'run'}); a.h=2.7; ALIEN.go(a,[[44,10.6]],{speed:2.6,clip:'run'});
    STORY.follow(dn,1.8); S.run=true; $('#run').classList.add('on'); goal('함교로 — 뛰어! (복도 서쪽 끝)'); GROWL(.1);
    await sleep(9000);
    // 마야를 놓친 그것이 돌아선다
    GROWL(.12); toast('…돌아온다!',1600); ALIEN.play(a,'roar',{once:true}); await sleep(700);
    const ok=await STORY.chase(a,{to:{x:sp.x,z:sp.z+.5},r:1.6,speed:3.1,clip:'run'});
    S.run=false; $('#run').classList.remove('on'); if(!ok){ PEOPLE.list.filter(p=>p.name==='마야 첸').forEach(p=>PEOPLE.remove(p)); return false; }
    await SHIP.doors.bridge.close(); SHIP.lock.bridge=()=>'열면 안 된다.'; ALIEN.go(a,[[0,10.4]],{speed:3,clip:'run'}).then(()=>{ THUD(.6); setTimeout(()=>ALIEN.clear(),1500); }); return true; },
};

SCENES.ch7={title:'7장 · 사냥', async enter(){ Object.assign(S.flags,{route:true,transit:true,passed:true,bridgeIn:true,where:true,ch2:true,ch2done:true,ch3:true,ch4:true,ch5:true,leahSaved:true,ch6:true,leahDead:true});
  await SCENES.ship.enter({at:'bridge'}); S.phase='play'; await CH7.start(); }};
SCENES.ch8={title:'8장 · 일어선 것', async enter(){ Object.assign(S.flags,{route:true,transit:true,passed:true,bridgeIn:true,where:true,ch2:true,ch2done:true,ch3:true,ch4:true,ch5:true,leahSaved:true,ch6:true,leahDead:true,ch7:true,owenGone:true});
  await SCENES.ship.enter({at:'lobby'}); S.phase='play'; await CH8.start(); }};
