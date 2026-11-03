/* ============================================================
   생물 (4판) : 애벌레 · 성체 — Sketchfab CC BY (README 출처)
   LARVA : web/assets/larva.glb ("Lurker" · 동작 Idle · Swim_Forward · Attack_Heavy · Dash_Back · Die)
     LARVA.host({x,z,kind}) 시신 하나 = 애벌레 하나 · 가까이 가면 찢고 나와 기어 와 덮친다 · 총 한 발이면 죽는다
   BEAST : web/assets/beast.glb ("Nightmare Creature" · 동작 22개) — 총에 맞으면 멈칫할 뿐 죽지 않는다
     BEAST.spawn({at,face}) → b · BEAST.play(b,'roar',{once}) · BEAST.hunt(b,{onCatch}) 보고 · 듣고 · 쫓고 · 찾는다
   길 찾기 : 방 ↔ 중앙 복도는 문 둘(방 안 · 복도)을 지난다 (ROUTE) · 가구는 몸 충돌 칸(SOLID)을 보고 비켜 돈다 (steer)
   ============================================================ */
'use strict';
// 문 자리 [방 안, 복도] — 함선 배치 (scenes/ship.js)
const ROUTE={DOOR:{bridge:[[0,7.4],[0,10.5]],deck:[[14,7.4],[14,10.5]],cryo:[[27,7.4],[27,10.5]],lab:[[37.43,7.4],[37.43,10.5]],airlock:[[50.43,7.4],[50.43,10.5]],
    lobby:[[14,13.8],[14,10.5]],engine:[[57,10.35],[54.2,10.5]]},
  path(ax,az,bx,bz){ const za=SHIP.zoneAt(ax,az), zb=SHIP.zoneAt(bx,bz), D=this.DOOR; if(za===zb) return [[bx,bz]];
    const p=[]; if(D[za]) p.push(D[za][0],D[za][1]); if(D[zb]) p.push(D[zb][1],D[zb][0]); p.push([bx,bz]); return p.map(a=>a.slice()); } };
// 한 걸음 : o(위치 · 방향 rotation.y)를 (tx,tz) 쪽으로 · 앞이 막히면 덜 꺾는 쪽으로 비켜 돈다 → 남은 거리
function steer(o,tx,tz,speed,dt,{r=.3,y1=.4,y2=1.6,turn=6}={}){ const w=o.position, dx=tx-w.x, dz=tz-w.z, d=Math.hypot(dx,dz); if(d<.05) return d;
  const s=Math.min(d,speed*dt), y=w.y, look=Math.max(s,.25), ok=a=>!SOLID.hit(w.x+Math.sin(a)*look,w.z+Math.cos(a)*look,y+y1,y+y2,r);
  let ang=Math.atan2(dx,dz);
  if(!SOLID.hit(w.x,w.z,y+y1,y+y2,r)&&!ok(ang)){ const O=[.6,1.2,1.8,2.4]; if(!o.userData.side){ const n=sd=>O.findIndex(k=>ok(ang+sd*k))>>>0; o.userData.side=n(1)<=n(-1)?1:-1; }
    const k=O.find(k=>ok(ang+o.userData.side*k)); if(k!==undefined) ang+=o.userData.side*k; else { o.userData.side=-o.userData.side; return d; } }
  else if(ok(ang)) o.userData.side=0;
  w.x+=Math.sin(ang)*s; w.z+=Math.cos(ang)*s; let df=ang-o.rotation.y; df=Math.atan2(Math.sin(df),Math.cos(df)); o.rotation.y+=df*Math.min(1,dt*turn); return d-s; }

// 뼈대 모델 불러오기 : 쉬는 자세의 뼈 자리로 크기를 잰다 (Sketchfab FBX 는 마디마다 배율이 제각각이라 살 상자로는 틀린다)
//   drop : 모델 속 크기가 엉뚱한 살을 뺀다 (Lurker 의 눈 메시는 몸보다 60 배 크게 들어 있다)
//   pose : 이 동작의 첫 자세로 잰다 (Lurker 는 쉬는 자세가 꼿꼿이 서 있다 — 헤엄 자세로 재야 바닥에 눕는다)
function loadRig(key,{drop=null,pose=null}={}){ return loadGLB(key).then(s=>{ const box=new THREE.Box3(), v=new THREE.Vector3(), kill=[];
  s.traverse(o=>{ if(drop&&o.isMesh&&drop.test(o.material&&o.material.name)) kill.push(o); }); kill.forEach(o=>o.parent.remove(o));
  const c=pose&&clipOf(s.userData.animations,pose); if(c){ const m=new THREE.AnimationMixer(s); m.clipAction(c).play(); m.update(.01); m.stopAllAction(); } else s.traverse(o=>{ if(o.isSkinnedMesh) o.skeleton.pose(); }); s.updateMatrixWorld(true);
  s.traverse(o=>{ if(o.isBone) box.expandByPoint(o.getWorldPosition(v)); });
  s.userData.box=box; return s; }); }
function rigClone(src,size,axis='y',yaw=0){ const g=THREE.SkeletonUtils.clone(src), wrap=new THREE.Group(), turn=new THREE.Group(); turn.rotation.y=yaw; turn.add(g); wrap.add(turn); const b=src.userData.box, sz=b.getSize(new THREE.Vector3());
  const k=size/(axis==='max'?Math.max(sz.x,sz.y,sz.z):sz[axis]); g.scale.setScalar(k); g.position.y=-b.min.y*k; g.position.x=-(b.min.x+b.max.x)/2*k; g.position.z=-(b.min.z+b.max.z)/2*k;
  g.traverse(o=>{ if(o.isMesh){ o.frustumCulled=false; if(o.material) o.material.envMapIntensity=.8; } }); return {wrap,g}; }
const clipOf=(clips,re)=>clips.find(c=>re.test(c.name));

/* ---------------- 애벌레 ---------------- */
const LARVA=(()=>{ let proto=null; const hosts=[], list=[]; const L={hosts,list,on:false,onKill:null,YAW:Math.PI,SIZE:.9};      // 머리(부리)가 모델의 −z
  // 시신 하나 등록 (애벌레가 든 몸)
  L.host=function({x,z,y=0,near=5.5}){ const h={x,z,y,near,done:false}; hosts.push(h); return h; };
  L.left=()=>hosts.filter(h=>!h.done).length+list.filter(l=>l.state!=='dead').length;
  L.clear=()=>{ list.forEach(l=>{ l.state='dead'; WORLD.remove(l.wrap); }); list.length=0; hosts.length=0; L.on=false; GUN.targets.length=0; };
  async function spawn(x,z,y=0){ if(!proto) proto=loadRig('larva',{drop:/^Eyes$/,pose:/Swim_Forward/}); const src=await proto, {wrap,g}=rigClone(src,L.SIZE,'max',L.YAW); WORLD.add(wrap); wrap.position.set(x,y,z);
    const mixer=new THREE.AnimationMixer(g), C=src.userData.animations.map(c=>PEOPLE.inPlace(c)), A={};
    [['idle',/Idle_1/],['crawl',/Swim_Forward/],['bite',/Attack_Heavy/],['back',/Dash_Back/],['die',/Die/]].forEach(([k,re])=>{ const c=clipOf(C,re); if(c) A[k]=mixer.clipAction(c); });
    const l={wrap,g,mixer,A,cur:null,state:'crawl',cd:0,t:0}; list.push(l);
    GUN.targets.push({center:()=>wrap.position.clone().add(new THREE.Vector3(0,.22,0)),r:.5,alive:()=>l.state!=='dead',hit:(p,d)=>kill(l,p,d)}); return l; }
  function play(l,k,{once=false,fade=.2}={}){ const a=l.A[k]; if(!a||l.cur===a) return; a.reset(); a.setLoop(once?THREE.LoopOnce:THREE.LoopRepeat,Infinity); a.clampWhenFinished=once; a.play(); if(l.cur) l.cur.crossFadeTo(a,fade,false); l.cur=a; }
  // 시신을 찢고 나온다
  async function burst(h){ h.done=true; const p=new THREE.Vector3(h.x,h.y+.3,h.z); SQUELCH(.4); AUDIO.tone(900,.4,'sawtooth',.05,0,600); BLOOD.spray(p,40,3.4); FX.shake(.25,.03);
    const l=await spawn(h.x,h.z,h.y); l.wrap.rotation.y=Math.atan2(P.x-h.x,P.z-h.z); play(l,'bite',{once:true,fade:0}); l.state='rise'; l.t=.7;
    if(!L.seen){ L.seen=true; L.onFirst&&L.onFirst(l); } return l; }
  function kill(l,p,d){ if(l.state==='dead') return; l.state='dead'; play(l,'die',{once:true,fade:.05}); SQUELCH(.5); AUDIO.tone(1400,.3,'sawtooth',.05,0,-900);
    BLOOD.spray(p||l.wrap.position.clone().add(new THREE.Vector3(0,.25,0)),30,2.6,0xd8ff70); l.wrap.position.addScaledVector(d||new THREE.Vector3(),.25);
    setTimeout(()=>{ let t=0; const f=dt=>{ t+=dt; l.wrap.position.y-=dt*.05; if(t>3){ TICK.splice(TICK.indexOf(f),1); WORLD.remove(l.wrap); const i=list.indexOf(l); if(i>=0) list.splice(i,1); } }; TICK.push(f); },2500);
    L.onKill&&L.onKill(L.left()); }
  L.tick=function(dt){ for(const l of list) l.mixer.update(dt); if(!L.on||S.phase!=='play') return;
    for(const h of hosts){ if(h.done) continue; const d=Math.hypot(P.x-h.x,P.z-h.z); if(d<2.6||d<h.near&&clearShot(new THREE.Vector3(h.x,h.y+1,h.z),camera.position)) burst(h); }
    for(const l of list){ if(l.state==='dead') continue; const w=l.wrap.position, dx=P.x-w.x, dz=P.z-w.z, d=Math.hypot(dx,dz); l.t-=dt; l.cd-=dt;
      if(l.state==='rise'){ if(l.t<=0){ l.state='crawl'; play(l,'crawl'); } continue; }
      if(l.state==='crawl'){ steer(l.wrap,P.x,P.z,2.1,dt,{r:.18,y1:.12,y2:.45,turn:8}); if(d<1.5&&l.cd<=0){ l.state='lunge'; l.t=.55; play(l,'bite',{once:true,fade:.08}); AUDIO.tone(700,.3,'sawtooth',.06,0,500); } continue; }
      if(l.state==='lunge'){ const k=Math.min(1,dt*7); w.x+=dx*k*.6; w.z+=dz*k*.6; l.wrap.rotation.y=Math.atan2(dx,dz);
        if(l.t<=0){ if(d<1.05){ ME.hurt(1); } l.state='back'; l.t=.6; play(l,'back',{once:true}); l.cd=1.2; } continue; }
      if(l.state==='back'){ w.x-=dx/(d||1)*dt*1.6; w.z-=dz/(d||1)*dt*1.6; if(l.t<=0){ l.state='crawl'; play(l,'crawl'); } } } };
  L.burst=burst; L.spawn=spawn; return L; })();

/* ---------------- 성체 ---------------- */
const BEAST=(()=>{ let proto=null; const list=[]; const B={list,H:2.55};
  const NAMES={idle:/\|idle$/,walk:/\|walk$/,run:/\|Run$/,roar:/\|roar$/,swipe:/attack_1/,swipe2:/attack_2/,bite:/\|bite$/,eat:/eating/,crawl:/\|crawl$/,jump:/\|jump$/,hit:/hit_1/,hit2:/hit_2/,battle:/battle_idle/};
  B.spawn=async function({at,face=0,clip='idle'}){ if(!proto) proto=loadRig('beast',{pose:/\|idle$/}); const src=await proto, {wrap,g}=rigClone(src,B.H,'y'); WORLD.add(wrap);
    wrap.position.set(at.x,at.y||0,at.z); wrap.rotation.y=face;
    // 어둠 속에서도 윤곽이 읽히게 : 차갑고 희미한 가장자리 빛 (손전등이 비추면 살이 드러난다)
    g.traverse(o=>{ if(o.isMesh&&o.material){ o.material=o.material.clone(); o.material.roughness=.55; o.material.emissive=new THREE.Color(.05,.012,.01); } });
    const mixer=new THREE.AnimationMixer(g), A={}; for(const [k,re] of Object.entries(NAMES)){ const c=clipOf(src.userData.animations,re); if(c) A[k]=mixer.clipAction(PEOPLE.inPlace(c)); }
    const b={wrap,g,mixer,A,cur:null,path:null,speed:0,stun:0,mode:'idle',step:0}; list.push(b); B.play(b,clip,{fade:0});
    GUN.targets.push({center:()=>wrap.position.clone().add(new THREE.Vector3(0,1.5,0)),r:.75,alive:()=>list.includes(b),hit:()=>B.shot(b)}); return b; };
  B.play=function(b,k,{once=false,fade=.25}={}){ const a=b.A[k]; if(!a) return Promise.resolve(); if(b.cur!==a||once){ a.reset(); a.setLoop(once?THREE.LoopOnce:THREE.LoopRepeat,Infinity); a.clampWhenFinished=once; a.play(); if(b.cur&&b.cur!==a&&fade) b.cur.crossFadeTo(a,fade,false); else if(b.cur&&b.cur!==a) b.cur.stop(); b.cur=a; }
    return once?new Promise(res=>{ const f=e=>{ if(e.action!==a) return; b.mixer.removeEventListener('finished',f); res(); }; b.mixer.addEventListener('finished',f); }):Promise.resolve(); };
  B.go=function(b,x,z,{speed=1.3,clip='walk'}={}){ b.path=ROUTE.path(b.wrap.position.x,b.wrap.position.z,x,z); b.speed=speed; b.move=clip; B.play(b,clip); return new Promise(res=>b.done=res); };
  B.stop=b=>{ b.path=null; b.done=null; };
  B.remove=b=>{ WORLD.remove(b.wrap); const i=list.indexOf(b); if(i>=0) list.splice(i,1); if(b.ai){ const j=TICK.indexOf(b.ai); if(j>=0) TICK.splice(j,1); } };
  B.clear=()=>list.slice().forEach(B.remove);
  // 맞으면 멈칫 (죽지 않는다) · 소리가 나니 쏜 쪽을 안다
  B.shot=function(b){ if(b.stun>0) return; b.stun=1.1; B.play(b,Math.random()<.5?'hit':'hit2',{once:true,fade:.05}); AUDIO.tone(220,.6,'sawtooth',.08,0,-120); BLOOD.spray(b.wrap.position.clone().add(new THREE.Vector3(0,1.6,0)),14,2,0xd8ff70); b.heard={x:P.x,z:P.z}; };
  // 보이나 : 거리 · 앞쪽 · 가리는 것 (웅크려 가구 뒤면 가까이 와야 보인다)
  B.sees=function(b){ const w=b.wrap.position, dx=P.x-w.x, dz=P.z-w.z, d=Math.hypot(dx,dz), lim=ME.crouch?6.5:17; if(d>lim) return false;
    let a=Math.atan2(dx,dz)-b.wrap.rotation.y; a=Math.atan2(Math.sin(a),Math.cos(a)); if(Math.abs(a)>1.05&&d>2.6) return false;
    return clearShot(new THREE.Vector3(w.x,w.y+1.9,w.z),camera.getWorldPosition(new THREE.Vector3()),.25); };
  // 사냥 : 둘러보기(순찰 점들) → 보이면 울부짖고 쫓는다 → 놓치면 마지막 자리를 뒤진다. 닿으면 onCatch
  B.hunt=function(b,{patrol=[],onCatch,speed=3.3,roar=true}={}){ let mode='patrol', pi=0, last=null, lost=0, busy=false, roared=!roar, srch=0;
    const next=()=>{ if(!patrol.length) return; const [x,z]=patrol[pi++%patrol.length]; B.go(b,x,z,{speed:1.25,clip:'walk'}).then(()=>{ if(mode==='patrol') setTimeout(()=>{ if(mode==='patrol'&&!b.path) next(); },1500+Math.random()*2000); }); };
    next();
    const ai=b.ai=async dt=>{ if(busy||S.phase!=='play'||b.stun>0) return; const w=b.wrap.position, d=Math.hypot(P.x-w.x,P.z-w.z), see=B.sees(b);
      b.mode=mode;
      if(see){ last={x:P.x,z:P.z}; lost=0;
        if(mode!=='chase'){ mode='chase'; B.stop(b); if(!roared){ roared=true; busy=true; b.wrap.rotation.y=Math.atan2(P.x-w.x,P.z-w.z); GROWL(.16); STING(.7); FX.shake(.4,.04); await B.play(b,'roar',{once:true}); busy=false; } } }
      else if(mode==='chase'){ lost+=dt; if(lost>2.2){ mode='search'; srch=7; B.go(b,last.x,last.z,{speed:2,clip:'walk'}); } }
      if(b.heard&&mode!=='chase'){ last=b.heard; b.heard=null; mode='search'; srch=7; B.go(b,last.x,last.z,{speed:2.4,clip:'run'}); }
      if(mode==='chase'){ if(d<1.45){ busy=true; B.stop(b); b.wrap.rotation.y=Math.atan2(P.x-w.x,P.z-w.z); AUDIO.tone(700,.3,'sawtooth',.07,0,-300); B.play(b,'swipe',{once:true,fade:.05}); P.free=false; await sleep(450); FX.flash('#900000',900); SCREAM(.6); busy=false; mode='done'; onCatch&&onCatch(); return; }
        if(!b.path||b.path.length>1||Math.hypot(b.path[0][0]-P.x,b.path[0][1]-P.z)>.8){ b.path=ROUTE.path(w.x,w.z,P.x,P.z); b.speed=speed; b.move='run'; B.play(b,'run'); } }
      if(mode==='search'&&!b.path){ srch-=dt; if(srch<=0){ mode='patrol'; next(); } else if(b.cur!==b.A.battle) B.play(b,'battle'); } };
    TICK.push(ai); return ()=>{ mode='done'; const i=TICK.indexOf(ai); if(i>=0) TICK.splice(i,1); B.stop(b); }; };
  B.tick=function(dt){ for(const b of list){ b.mixer.update(dt); if(b.stun>0){ b.stun-=dt; continue; }
    if(b.path){ const [tx,tz]=b.path[0], left=steer(b.wrap,tx,tz,b.speed,dt,{r:.32,y1:.45,y2:1.9,turn:5}), w=b.wrap.position, gy=SOLID.top(w.x,w.z,w.y+.5,.2); w.y+=((gy===null?floorAt(w.x,w.z):Math.max(gy,floorAt(w.x,w.z)))-w.y)*Math.min(1,dt*8);      // 턱 · 원자로 단을 오른다
      if(left<.15){ b.path.shift(); if(!b.path.length){ b.path=null; B.play(b,'idle'); const r=b.done; b.done=null; r&&r(); } }
      // 발소리 : 무겁게 (가까울수록 크게)
      b.step-=dt*(b.speed>2?2.4:1.3); if(b.step<=0){ b.step=1; const d=Math.hypot(P.x-b.wrap.position.x,P.z-b.wrap.position.z); if(d<22) THUD(.05+.25*Math.max(0,1-d/22)); } } } };
  return B; })();

// 가까운 생물과의 거리로 붉은 가장자리 · 심장 소리
const DREAD={on(){ if(this.fn) return; const el=FXEL('dread'); let beat=0;
  TICK.push(this.fn=dt=>{ let d=99; for(const b of BEAST.list){ const w=b.wrap.position; d=Math.min(d,Math.hypot(P.x-w.x,P.z-w.z)); } for(const l of LARVA.list){ if(l.state!=='dead'){ const w=l.wrap.position; d=Math.min(d,Math.hypot(P.x-w.x,P.z-w.z)*1.6); } }
    const k=Math.max(0,Math.min(1,(13-d)/10)); el.style.opacity=k*.85; beat-=dt;
    if(k>0&&beat<=0){ beat=1.1-k*.75; AUDIO.tone(48,.18,'sine',.09*(.4+k)); setTimeout(()=>AUDIO.tone(42,.14,'sine',.07*(.4+k)),160); } }); },
  off(){ if(this.fn){ const i=TICK.indexOf(this.fn); if(i>=0) TICK.splice(i,1); this.fn=null; } FXEL('dread').style.opacity=0; } };
// 엔진이 매 프레임 부르고(ALIEN.tick) · 맵을 비울 때 지운다(ALIEN.clear)
const ALIEN={tick(dt){ LARVA.tick(dt); BEAST.tick(dt); },clear(){ LARVA.clear(); BEAST.clear(); }};
// 빈 바닥 찾기 : (x,z) 둘레 r 안 · 높이 y1~y2 에 막힌 칸이 없는 가장 가까운 자리 (1.6 m 안 · 없으면 그대로)
function freeSpot(x,z,{r=.45,y1=.12,y2=.9}={}){ if(!SOLID.hit(x,z,y1,y2,r)) return [x,z]; for(let d=.15;d<=1.6;d+=.15) for(let a=0;a<16;a++){ const t=a/16*Math.PI*2+d, fx=x+Math.sin(t)*d, fz=z+Math.cos(t)*d; if(!SOLID.hit(fx,fz,y1,y2,r)) return [fx,fz]; } return [x,z]; }
