/* ============================================================
   7장 · 사냥 — 성운 셋 (앞 창 = 암흑 성운 · 뒤 카메라 = 반사 · 방출 성운) → 오언과 함께 무기함의 펄스 권총 (맞히면 멈칫할 뿐) → 깜빡이는 복도 · 머리 위 소리
     → 뒤따르던 오언이 천장 환기구로 낚아채인다 → 눈앞에 갑툭튀 → 숨기 → 달리기 · 문 닫기
   8장 · 일어선 것 — 우리은하 지도 (헤일로 · 중심부 · 태양계 자리) → 차단기 파괴 · 완전한 암흑 → 섬광 속 서준 뒤에 선 그것 → 숨기 → 다니엘을 끌고 가는 그것을 쏜다 → 함교 문을 손으로 여는 동안 등 뒤의 마야가 사라진다
   공포 도구 (2026-11-02) : FX(암전 · 번쩍 · 흔들림 · 깜빡임) · STORY.scare(갑툭튀) · STORY.snatch(천장으로 낚아채기) · STORY.drip · STORY.lampDrop
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
  for(const a of ALIEN.list){ const h=(a.h||2.7), c=ALIEN.center(a), t=c.clone().sub(o).dot(d); if(t<0||t>best) continue;
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
/* ---- 공포 도구 (2026-11-02 사용자 : 그것이 2호에 들어온 뒤는 긴장 · 긴박 · 그것의 모습이 핵심. 희생을 지켜보기만 하지 말고 — 옆의 동료가 천장에서 낚아채이고, 갑툭튀) ---- */
const FXEL=id=>{ let e=document.getElementById(id); if(!e){ e=document.createElement('div'); e.id=id; document.body.appendChild(e); } return e; };
const STING=(v=1)=>{ AUDIO.noise(.8,.7*v,0,4200); AUDIO.tone(1500,.75,'sawtooth',.13*v,0,-1250); AUDIO.tone(52,1.1,'square',.12*v); AUDIO.tone(2300,.3,'square',.05*v,.05,-800); };
const SCREAM=(v=1)=>{ AUDIO.tone(620,1.1,'sawtooth',.07*v,0,380); AUDIO.tone(880,.9,'triangle',.05*v,.1,-300); AUDIO.noise(1,.15*v,0,1800); };
const FX={
  black(op){ FXEL('blackout').style.opacity=op; },                          // 순간 암전 (1 = 완전히)
  flash(color='#ff2a10',ms=420){ const e=FXEL('flashfx'); e.style.transition='none'; e.style.background=color; e.style.opacity=.8; setTimeout(()=>{ e.style.transition=`opacity ${ms}ms`; e.style.opacity=0; },30); },
  shake(dur=.5,amp=.06){ let t=0; const f=dt=>{ t+=dt; const k=amp*Math.max(0,1-t/dur); camera.position.x+=(Math.random()-.5)*k; camera.position.y+=(Math.random()-.5)*k; camera.rotation.z=(Math.random()-.5)*k*.6; if(t>dur){ camera.rotation.z=0; TICK.splice(TICK.indexOf(f),1); } }; TICK.push(f); },
  // 조명이 이따금 끊긴다 (전기 지지직) → 멈추는 함수
  flicker(){ let next=1+Math.random()*2, off=0; const f=dt=>{ if(off>0){ off-=dt; if(off<=0) FX.black(0); return; } next-=dt;
      if(next<=0){ next=1.5+Math.random()*3.5; off=.06+Math.random()*.14; FX.black(.88); AUDIO.noise(.08,.05,0,6000); if(Math.random()<.4) setTimeout(()=>{ FX.black(.88); setTimeout(()=>FX.black(0),70); },off*1000+90); } };
    TICK.push(f); return ()=>{ const i=TICK.indexOf(f); if(i>=0) TICK.splice(i,1); FX.black(0); }; },
};
// 피 방울 : 천장 한 점에서 떨어진다
STORY.drip=function(x,y,z,dur=4){ const tex=STORY.dropTex||(STORY.dropTex=(()=>{ const c=document.createElement('canvas'); c.width=c.height=32; const g=c.getContext('2d'), r=g.createRadialGradient(16,16,0,16,16,16); r.addColorStop(0,'rgba(120,8,6,1)'); r.addColorStop(.6,'rgba(90,4,3,.9)'); r.addColorStop(1,'rgba(60,0,0,0)'); g.fillStyle=r; g.fillRect(0,0,32,32); return new THREE.CanvasTexture(c); })());
  let t=0, n=0; const f=dt=>{ t+=dt; if(t>dur){ TICK.splice(TICK.indexOf(f),1); return; } n+=dt*(6-t); while(n>1){ n--; const sp=new THREE.Sprite(new THREE.SpriteMaterial({map:tex,transparent:true,depthWrite:false})); sp.scale.setScalar(.03+Math.random()*.03); sp.position.set(x+(Math.random()-.5)*.25,y,z+(Math.random()-.5)*.25); WORLD.add(sp);
      let v=0; const g=dt=>{ v+=dt*9.8; sp.position.y-=v*dt; if(sp.position.y<.02){ WORLD.remove(sp); TICK.splice(TICK.indexOf(g),1); } }; TICK.push(g); } }; TICK.push(f); };
// 천장 환기구 창살이 젖혀져 매달린다 (horror.glb vent_grate_<key> · story.glb vent_grate_hall)
STORY.grate=function(key){ const it=this.it('vent_'+key), g=it&&it.getObjectByName('vent_grate_'+key); if(!g) return; g.position.set(0,-.36,.34); g.rotation.set(1.25,0,.15); AUDIO.noise(.25,.3,0,2600); AUDIO.tone(1900,.25,'triangle',.03,0,-600); };
// 떨어진 손전등 (horror.glb IT_lamp — Blender) : 바닥에서 빙글 돌다 멈춘다 (userData.stop 이면 그 자리에)
STORY.lampDrop=function(x,z){ const g=new THREE.Group(), src=this.it('lamp'), body=src?src.clone():new THREE.Mesh(new THREE.CylinderGeometry(.025,.03,.22,10),new THREE.MeshStandardMaterial({color:0x222428}));
  body.visible=true; body.position.set(0,0,0); if(!src) body.rotation.z=Math.PI/2; const sl=new THREE.SpotLight(0xfff1dc,3,14,.35,.5,1.3), tg=new THREE.Object3D(); tg.position.set(1,0,0); sl.target=tg; g.add(body,sl,tg); g.position.set(x,.03,z); WORLD.add(g);
  let w=7; const f=dt=>{ if(!g.parent){ TICK.splice(TICK.indexOf(f),1); return; } if(g.userData.stop) return; w=Math.max(.6,w-dt*3); g.rotation.y+=w*dt; }; TICK.push(f); AUDIO.noise(.3,.12,0,2500); return g; };
// 갑툭튀 : 바로 눈앞에 그것이 — 얼굴이 갈라지며 울부짖는다 · 번쩍 · 쾅 · 흔들림. keep 이 아니면 어둠 속으로 사라진다
STORY.scare=async function({a=null,dist=1.35,height=2.7,clip='roar',keep=false,hold=900}={}){ const d=camera.getWorldDirection(new THREE.Vector3()); d.y=0; d.normalize();
  const x=P.x+d.x*dist, z=P.z+d.z*dist, face=Math.atan2(P.x-x,P.z-z);
  if(a){ ALIEN.stop(a); a.flip=false; a.wrap.rotation.set(0,face,0); a.wrap.position.set(x,0,z); } else { a=await ALIEN.spawn({at:{x,z},face,height,clip}); a.h=height; }
  ALIEN.play(a,clip,{once:true,fade:0}); a.open=a.openTo=1; STING(); FX.flash(); FX.shake(.6,.08); THUD(.7);
  await sleep(hold); a.openTo=null; if(!keep){ FX.black(1); await sleep(160); ALIEN.remove(a); FX.black(0); } return a; };
// 낚아채기 : 사람 바로 위 천장에서 그것이 거꾸로 내려와 → 붙잡고 → 천장 속으로 끌어올린다 (천장 아래로는 상체만 보인다)
STORY.snatch=async function(p,{ceil=2.57,height=1.75,up=1.1}={}){ const w=p.wrap.position, top=1.5; p.path=null; p.watch=false; p.solid=false; p.pointAt=null;      // top : 머리가 내려오는 높이 (사람 얼굴 높이)
  const a=await ALIEN.spawn({at:{x:w.x,y:top+height+.7,z:w.z},face:0,height,clip:'swipe'}); a.h=height; a.flip=true; a.wrap.rotation.set(Math.PI,P.yaw,0); a.open=a.openTo=1;
  THUD(.6); STING(.8); FX.flash('#ff2a10',300);
  await new Promise(r=>{ let k=0; const f=dt=>{ k=Math.min(1,k+dt/.22); a.wrap.position.y=top+height+.7*(1-k); if(k>=1){ TICK.splice(TICK.indexOf(f),1); r(); } }; TICK.push(f); });
  SCREAM(); if(p.acts&&p.acts.struggle){ p.once=null; p.mood='struggle'; } else p.sleep=true;      // 허우적댄다 (동작이 없는 사람은 굳는다)
  await new Promise(r=>{ let k=0; const f=dt=>{ k+=dt; p.wrap.rotation.z=Math.sin(S.t*38)*.2; w.y=Math.min(.35,k*.8); if(k>.55){ TICK.splice(TICK.indexOf(f),1); r(); } }; TICK.push(f); });      // 붙잡고 버둥 (반 초)
  await new Promise(r=>{ let k=0; const y0=w.y, a0=a.wrap.position.y; const f=dt=>{ k=Math.min(1,k+dt/up); const e=k*k; a.wrap.position.y=a0+e*2.6; w.y=y0+e*2.6; p.wrap.rotation.z=Math.sin(S.t*40)*.25*(1-k); if(k>=1){ TICK.splice(TICK.indexOf(f),1); r(); } }; TICK.push(f); });
  this.drip(w.x,ceil-.05,w.z,5); PEOPLE.remove(p); ALIEN.remove(a); AUDIO.noise(1.2,.25,0,300); };
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
      OW('같이 가시죠. 무기함은 함교 옆 복도예요. 뒤는 제가 봅니다.')]);
    STORY.seated(true); PEOPLE.remove(ow); c.owen=null;
    // 오언이 바로 뒤를 따라온다
    const bs=SHIP.rooms.bridge.spawn, o2=await PEOPLE.spawn({kind:'owen',name:'오언 하트',role:'보안',at:{x:bs.x+.8,z:bs.z+1.2,yaw:bs.yaw}}); const OW2=sayer('오언',o2), unfollow=STORY.follow(o2,1.4); o2.armed=true; o2.mood='aim';
    goal('복도 함교 쪽 벽의 보안 무기함에서 권총을 꺼낸다');
    await STORY.wait(STORY.it('locker'),'보안 무기함 — 펄스 권총',{range:2.6}); STORY.hold(); AUDIO.noise(.3,.2,0,3000);
    await TALK.say([OW2('환기구는 복도 가운데, 동면 구역 지나서예요. 불이 깜빡이면 멈추세요.')]);
    // 복도 : 불이 끊기고, 머리 위를 무언가 따라 기어 온다 (소리가 점점 가까이)
    const unflick=FX.flicker(); let crawl=0; const above=dt=>{ crawl-=dt; const near=Math.max(0,1-Math.abs(P.x-34)/22); if(crawl<=0){ crawl=1.6-near; THUD(.06+near*.18); if(Math.random()<.3) AUDIO.noise(.4,.04+near*.06,0,900); } }; TICK.push(above);
    // 내가 환기구를 지나 한 걸음 → 뒤따르던 오언은 바로 그 아래 (조금 어긋나 있으면 맞춘다 — 나는 앞을 보고 있다)
    await STORY.go(36.2,10.5,'오언과 함께 복도 가운데 천장 환기구를 확인한다 (동면 구역 너머)',{r:1.1});
    TICK.splice(TICK.indexOf(above),1); unflick(); unfollow(); S.phase='cut'; P.free=false; goal(''); o2.path=null; o2.wrap.position.set(34,0,10.5); o2.wrap.rotation.y=-Math.PI/2-Math.PI;
    o2.pointAt=new THREE.Vector3(34,2.6,10.5); await TALK.say([{...OW2('선장님, 위에—'),auto:150}]);
    const vg=STORY.it('vent_hall'), gh=vg&&vg.getObjectByName('vent_grate_hall'); if(gh){ gh.position.set(.4,-.9,-.3); gh.rotation.set(1.2,0,.4); AUDIO.noise(.25,.3,0,2600); }
    camTo({yaw:yawTo(o2.wrap.position.x,o2.wrap.position.z),pitch:.18},.28); P.look=true;
    await STORY.snatch(o2,{height:1.75,up:1.0}); STORY.show('gore_hall',true); f.owenGone=true;
    await TALK.say([ME('오언! 오언!')]);
    // 정적 … 피 방울 … 그리고 바로 앞 천장에서
    await camTo({yaw:yawTo(39,10.5),pitch:0},.6); await sleep(1500); THUD(.3); await sleep(900);
    const j=await STORY.scare({dist:1.5,height:1.75,clip:'jump_attack',keep:true,hold:800}); ALIEN.play(j,'crawl_run'); ALIEN.go(j,[[48,10.5]],{speed:5,clip:'crawl_run'}).then(()=>ALIEN.remove(j));
    P.look=false; await TALK.say([RADIO('마야','선장님! 오언 신호가 끊겼어요! 무슨 소리예요?!'),VG('그것이 복도를 돌아 서쪽으로 옵니다. 숨으십시오 — 식당 안쪽 칸막이 뒤로.')]);
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
    STORY.seated(false);                                            // 남은 넷이 모두 라운지에 숨어 있다
    const at=(x,z,tx,tz)=>({x,z,yaw:Math.atan2(x-tx,z-tz)});      // 사람 yaw 는 카메라와 같다 (앞 = −sin, −cos)
    const scr=new THREE.Vector3(); new THREE.Box3().setFromObject(BRIDGEUI.mesh('lounge')).getCenter(scr);
    const sjx=scr.x+(20.5-scr.x)*.22, sjz=scr.z+(19-scr.z)*.22;
    const [my,dn,sj]=await Promise.all([PEOPLE.spawn({kind:'maya',name:'마야 첸',role:'부선장',at:at(19.2,17.4,20.5,19)}),PEOPLE.spawn({kind:'daniel',name:'다니엘 로드리게스',role:'기관',at:at(21.8,17.6,20.5,19)}),
      PEOPLE.spawn({kind:'seojun',name:'한서준',role:'항법',at:at(sjx,sjz,20.5,19)})]);
    const MY=sayer('마야',my), DN=sayer('다니엘',dn), SJ=sayer('서준',sj); this.my=my; this.dn=dn;
    warp(20.5,19.6,Math.PI); SHIP.zone=null; if(!STORY.held){ STORY.hold(); }
    await card('','세 시간 뒤','하위헌스 2호 · 라운지 · 문을 잠갔다',2400);
    await TALK.say([MY('문은 잠갔어요. 그게 환기구로 다니면 소용없겠지만.'),DN('오언이… 오언이 그렇게 될 줄은.'),
      SJ('선장님, 항법 컴퓨터가 계속 흔들려요. 집으로 갈 좌표를 우리은하 지도에 다시 찍어야 해요.'),
      SJ('바 뒤 화면에 지도 띄웠어요. 은하 구조부터 같이 짚어 주세요.')]);
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
    goal(''); await TALK.say([SJ('좋아요, 좌표 들어갑니다… 태양계, 나선팔 위. 계산이 끝나면 바로 웜홀로—'),VG('경고. 주 차단기 함이 열렸습니다. 기관실 앞 복도.'),
      MY('열렸다고요? 저절로?'),ME('…여는 법을 아는 거다.')]);
    // 차단기 파괴 → 완전한 암흑 (손전등만)
    const bd=STORY.it('breaker'), door=bd&&bd.getObjectByName('brk_door'); if(door){ door.rotation.z=-1.9; door.position.z-=.02; }
    AUDIO.noise(1,.35,0,1200); AUDIO.tone(50,1.2,'sawtooth',.08); FX.black(1); STORY.dark(true); SHIP.dim=.28; await sleep(1400); FX.black(0);
    my.armed=true; my.mood='aim'; dn.mood='scared'; sj.mood='nervous';      // 어둠 속 : 마야는 권총을 겨누고, 다니엘은 굳고, 서준은 두리번
    await TALK.say([DN('아무것도 안 보여요!'),SJ('비상등 스위치가 문 옆에 있어요. 제가 켤게요—')]);
    sj.solid=false; sj.crouch=true; await camTo({yaw:yawTo(16.2,14.6),pitch:0},.6); await PEOPLE.walk(sj,[[16.2,14.6]],1.0); sj.crouch=false;      // 웅크리고 살금살금      // 손전등 빛 속으로 걸어간다 (문 옆 · 천장 환기구 IT_vent_sj 아래)
    // 섬광 셋 : 서준 → 서준 뒤에 선 그것(처음으로 두 발로) → 아무도 없다
    await this.strobe(sj); f.seojunGone=true; STORY.crew();
    await TALK.say([DN('서, 서준이 형…? 형!'),MY('…서 있었어요. 두 발로. 사람보다 컸어요.'),ME('다들 숨어. 소리 내지 마.')]);
    // ---- 버티기 : 숨고(①) · 다니엘을 끌고 가는 그것을 쏘고(②) · 함교 문을 손으로 연다(③) ----
    this.DN=DN; my.wrap.position.set(11.0,0,23.0); dn.wrap.position.set(12.0,0,23.4); [my,dn].forEach(p=>{ p.solid=false; });
    my.mood='aim'; dn.mood='scared';
    while(!(await this.hide())) await this.again();
    await TALK.say([DN('…갔어요. 갔어.'),MY('아니요. 위에 있어요. 소리가 안 멈췄어요.')]);
    while(!(await this.grab())) await this.again();
    f.danielBit=true; await TALK.say([DN('윽— 목이… 물렸어요. 괜찮아요, 괜찮아.'),ME('다니엘, 피가—'),DN('괜찮다니까요!'),
      MY('여긴 끝났어요. 함교로 가요 — 문이 제일 두꺼워요. 전력이 없으니 손으로 열어야 해요.')]);
    while(!(await this.flee())) await this.again();
    f.mayaGone=true;
    await TALK.say([VG('함교 문 잠금. …마야 첸 대원의 생체 신호 — 없습니다.'),DN('마야 누나가… 바로 뒤에 있었는데…'),ME('…좌표는 들어갔다. 다니엘, 끝까지 간다.')]);
    await STORY.next('8장 · 일어선 것 — 끝','9장 · 증발하는 웜홀',()=>CH9.start()); },
  // 잡혔으면 그 단계 처음으로 (다니엘 · 마야는 제자리로)
  async again(){ ALIEN.clear(); P.eye=1.66; FX.black(0); const dn=this.dn; if(dn){ dn.sleep=false; dn.mood='scared'; dn.wrap.rotation.set(0,dn.wrap.rotation.y,0); dn.wrap.position.y=0; }
    await sleep(300); await fade(false,800); S.phase='play'; P.free=true; toast('다시 — 숨거나, 쏘거나, 달려라',2600); },
  // 섬광 셋 : 어둠 속에서 서준 → 그 뒤에 선 그것 → 빈자리와 떨어지는 피
  async strobe(sj){ S.phase='cut'; P.free=false; goal(''); const w=sj.wrap.position.clone(); await camTo({yaw:yawTo(w.x,w.z),pitch:.02},.5); P.look=true;
    const lit=async ms=>{ FX.black(0); renderer.toneMappingExposure=1.0; AUDIO.noise(.06,.1,0,5000); await sleep(ms); FX.black(1); };      // 비상등이 번쩍 — 방 전체가 잠깐 보인다
    FX.black(1); await sleep(900); THUD(.3);
    await lit(150); await sleep(850); GROWL(.1);
    const d=Math.hypot(w.x-P.x,w.z-P.z), bx=w.x+(w.x-P.x)/d*.9, bz=w.z+(w.z-P.z)/d*.9;
    const a=await ALIEN.spawn({at:{x:bx,z:bz},face:Math.atan2(P.x-bx,P.z-bz),height:2.7,clip:'idle'}); a.h=2.7; a.open=a.openTo=.6; sj.mood='scared';
    await lit(320); STING(.8); FX.shake(.4,.05);
    await sleep(450); SCREAM(); THUD(.7); ALIEN.remove(a); PEOPLE.remove(sj); STORY.grate('sj'); STORY.show('gore_sj',true); STORY.drip(w.x,6.3,w.z,5);      // 위로 — 천장 환기구 속으로
    await sleep(1100); await lit(260); await sleep(500); FX.black(0); P.look=false; },
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
  // ② 다니엘을 덮친다 : 천장에서 떨어져 다니엘을 끌고 라운지 문으로 (7초 남짓) → 그 안에 세 번 맞혀야 놓는다. 놓치면 그 단계 다시
  async grab(){ const DN=this.DN, dn=this.dn; STORY.ammo=Math.max(STORY.ammo||0,6); STORY.ammoShow(); goal('');
    // 다니엘이 숨은 곳에서 나와 라운지 안쪽 천장 환기구(horror.glb IT_vent_dn) 아래로 — 그 위에서 떨어진다
    const x=16, z=24.5; dn.sleep=false; dn.mood=null; dn.crouch=true; dn.wrap.position.y=0; dn.wrap.rotation.set(0,dn.wrap.rotation.y,0); await PEOPLE.walk(dn,[[x,z]],1.0); dn.crouch=false; dn.mood='nervous'; dn.wrap.rotation.y=Math.atan2(x-P.x,z-P.z)-Math.PI;
    await TALK.say([DN('…선장님. 위에서— 위에서 소리가—')]); THUD(.5); await sleep(450); STORY.grate('dn');
    const a=await ALIEN.spawn({at:{x:x+.35,y:5.6,z},face:Math.atan2(P.x-x,P.z-z),height:2.7,clip:'jump_attack'}); a.h=2.7; a.open=a.openTo=1;
    await new Promise(r=>{ let k=0; const f=dt=>{ k=Math.min(1,k+dt/.45); a.wrap.position.y=5.6*(1-k*k); if(k>=1){ TICK.splice(TICK.indexOf(f),1); r(); } }; TICK.push(f); });
    THUD(.8); STING(); FX.flash(); FX.shake(.5,.07); SCREAM(.7); a.openTo=null;
    const crawl=!!(dn.acts&&dn.acts.crawl_back); if(crawl){ dn.mood='crawl_back'; dn.watch=false; } else { dn.sleep=true; dn.wrap.rotation.set(-Math.PI/2,0,0); dn.wrap.position.y=.15; }      // 발목을 잡혀 끌려간다
    goal('다니엘을 끌고 가는 그것을 쏴라! — 0 / 3'); S.phase='play'; P.free=true;
    ALIEN.go(a,[[14,14.4],[14,11.4]],{speed:.95,clip:'walk'});
    const drag=()=>{ const r=a.wrap.rotation.y, w=a.wrap.position; dn.wrap.position.set(w.x-Math.sin(r)*.95,crawl?0:.15,w.z-Math.cos(r)*.95); if(crawl) dn.wrap.rotation.y=r; }      // 누운 채 그것을 보며 손으로 바닥을 밀어 버틴다 (발이 그것 쪽); TICK.push(drag);
    let hits=0; return new Promise(res=>{ let done=false; const end=ok=>{ done=true; TICK.splice(TICK.indexOf(fn),1); TICK.splice(TICK.indexOf(drag),1); goal(''); res(ok); };
      const fn=()=>{ if(done) return; if(a.stun>0&&!a._counted){ a._counted=true; hits++; goal('다니엘을 끌고 가는 그것을 쏴라! — '+hits+' / 3'); } if(!(a.stun>0)) a._counted=false;
        if(hits>=3){ ALIEN.stop(a); a.openTo=1; ALIEN.play(a,'roar',{once:true}).then(async()=>{ a.openTo=null; await ALIEN.go(a,[[14,13.4],[14,10.4]],{speed:3.4,clip:'run'}); ALIEN.remove(a); });
          dn.sleep=false; dn.watch=true; dn.mood='scared'; dn.hurt=true; dn.wrap.position.y=0; dn.wrap.rotation.set(0,Math.atan2(dn.wrap.position.x-P.x,dn.wrap.position.z-P.z)-Math.PI,0); return end(true); }
        const w=a.wrap.position; if(Math.hypot(P.x-w.x,P.z-w.z)<1.4&&S.phase==='play'){ ALIEN.stop(a); ALIEN.play(a,'swipe',{once:true}); P.free=false; sleep(500).then(()=>fade(true,300)).then(()=>end(false)); done=true; return; }
        if(!a.path&&!(a.stun>0)){ toast('다니엘을 놓쳤다',1800); P.free=false; fade(true,500).then(()=>end(false)); done=true; } };
      TICK.push(fn); }); },
  // ③ 함교로 : 전력이 없어 함교 문은 손으로 연다. 마야가 등 뒤를 지키다 — 비명. 돌아보면 바닥에서 도는 손전등 빛 속에 그것
  async flee(){ const dn=this.dn, sp=SHIP.rooms.bridge.spawn, bd=SHIP.doors.bridge; let my=this.my;
    if(!PEOPLE.list.includes(my)) my=this.my=await PEOPLE.spawn({kind:'maya',name:'마야 첸',role:'부선장',at:{x:P.x+1,z:P.z+1,yaw:P.yaw}});
    const MY=sayer('마야',my); my.solid=false; my.armed=true; my.mood=null; dn.mood=null; SHIP.lock={}; await SHIP.doors.lobby.open(); if(bd&&bd.isOpen) await bd.close();
    SHIP.lock.bridge=()=>'전력이 없다 — 문 앞에서 손으로 열어야 한다';
    STORY.follow(my,1.4); STORY.follow(dn,2.6); const un=FX.flicker(); S.run=true; $('#run').classList.add('on');
    let t=0; const amb=dt=>{ t+=dt; if(t>2){ t=Math.random(); THUD(.12+Math.random()*.18); } }; TICK.push(amb);      // 천장 속을 따라오는 소리
    const dx=bd?bd.position.x:sp.x; await STORY.go(dx,10.4,'함교로 — 뛰어! (복도 서쪽 끝 · 함교 문)',{r:1.5});
    TICK.splice(TICK.indexOf(amb),1); un(); S.run=false; $('#run').classList.remove('on');
    S.phase='cut'; P.free=false; await camTo({yaw:yawTo(dx,bd?bd.position.z:8.7),pitch:0},.35);
    my.path=null; my.wrap.position.set(2.8,0,10.4); my.wrap.rotation.y=Math.PI/2-Math.PI; my.mood='aim'; STORY.show('gore_bd',false);      // 내 등 뒤, 천장 환기구(IT_vent_bd) 아래에서 복도 동쪽을 본다
    await TALK.say([MY('제가 뒤를 볼게요. 선장님은 문을! 뒤돌아보지 마세요!')]);
    // 문을 여는 동안 : 등 뒤에서 — 울음 · 마야의 총소리 셋 · 비명 · 정적
    let taken=false; const take=()=>{ if(taken) return; taken=true; SCREAM(1); THUD(.7); FX.shake(.45,.06); const w=my.wrap.position;
      this.lamp=STORY.lampDrop(w.x,w.z); STORY.grate('bd'); STORY.show('gore_bd',true); STORY.drip(w.x,2.5,w.z,4); PEOPLE.remove(my); };
    const tm=[setTimeout(()=>GROWL(.12),1500),setTimeout(()=>{ PEOPLE.act(my,'shoot'); for(let i=0;i<3;i++) setTimeout(()=>{ AUDIO.noise(.18,.35,0,3000); AUDIO.tone(140,.2,'sawtooth',.06,0,-90); },i*280); },2800),setTimeout(take,4300)];
    S.phase='play'; await STORY.qte('OVERRIDE · 함교 문 수동 개방','레버 넷 — 뒤돌아보지 말 것',4); tm.forEach(clearTimeout); take();
    S.phase='cut'; P.free=false; bd&&bd.open(); await sleep(700);
    // 돌아본다
    await camTo({yaw:yawTo(P.x+10,10.4),pitch:-.05},.55); await sleep(900);
    const a=await STORY.scare({dist:2.3,height:2.7,keep:true,hold:650}); const lp=this.lamp; if(lp){ const w=a.wrap.position; lp.userData.stop=true; lp.rotation.y=Math.atan2(-(w.z-lp.position.z),w.x-lp.position.x); }
    dn.wrap.position.set(sp.x+.8,0,sp.z); dn.path=null;                // 다니엘은 먼저 함교 안으로
    ALIEN.play(a,'roar',{once:true}); await camTo({yaw:yawTo(bd?bd.position.x:sp.x,sp.z),pitch:0},.3);      // 몸을 돌려 문 쪽으로 — 그것은 등 뒤
    goal('함교 안으로! — 뛰어!'); S.phase='play'; P.free=true; S.run=true; $('#run').classList.add('on');
    const t0=performance.now();
    const ok=await STORY.chase(a,{to:{x:sp.x,z:sp.z+.5},r:1.6,speed:2.2,clip:'run',started:()=>performance.now()-t0>1200}); S.run=false; $('#run').classList.remove('on');
    if(this.lamp){ WORLD.remove(this.lamp); this.lamp=null; }
    if(!ok) return false;
    await bd.close(); SHIP.lock.bridge=()=>'열면 안 된다.'; THUD(.8); FX.shake(.3,.05); setTimeout(()=>{ THUD(.6); ALIEN.clear(); },1200); return true; },
};

SCENES.ch7={title:'7장 · 사냥', async enter(){ Object.assign(S.flags,{route:true,transit:true,passed:true,bridgeIn:true,where:true,ch2:true,ch2done:true,ch3:true,ch4:true,ch5:true,leahSaved:true,ch6:true,leahDead:true});
  await SCENES.ship.enter({at:'bridge'}); S.phase='play'; await CH7.start(); }};
SCENES.ch8={title:'8장 · 일어선 것', async enter(){ Object.assign(S.flags,{route:true,transit:true,passed:true,bridgeIn:true,where:true,ch2:true,ch2done:true,ch3:true,ch4:true,ch5:true,leahSaved:true,ch6:true,leahDead:true,ch7:true,owenGone:true});
  await SCENES.ship.enter({at:'lobby'}); S.phase='play'; await CH8.start(); }};
