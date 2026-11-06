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

/* ---------------- 애벌레 ----------------
   시신을 찢고 나온다(rise) → 기어 온다(crawl : 속도가 붙고 줄며 · 촉수가 먼저) → 3 m 안이면 얼굴로 뛰어오른다(leap)
   → 얼굴에 달라붙는다(grab : 입이 화면을 가득 채운다 · 피 한 칸 · F 또는 화면 연타로 떼어 낸다) → 바닥에 떨어져 버둥(stun) → 다시 기어 온다
   맞으면 움찔하며 밀려난다(hurt) · 세 발이면 죽는다(die : 터지고 오그라든다) */
const LARVA=(()=>{ let proto=null; const hosts=[], list=[]; const L={hosts,list,on:false,onKill:null,YAW:Math.PI,SIZE:.9,HP:3,grab:null,FACE:{size:2.2,tilt:-.8,y:-.01,z:-.3}};      // 머리(부리)가 모델의 −z
  L.host=function({x,z,y=0,near=5.5}){ const h={x,z,y,near,done:false}; hosts.push(h); return h; };
  L.left=()=>hosts.filter(h=>!h.done).length+list.filter(l=>l.state!=='dead').length;
  L.clear=()=>{ if(L.grab) release(L.grab,false); list.forEach(l=>{ l.state='dead'; l.wrap.parent&&l.wrap.parent.remove(l.wrap); }); list.length=0; hosts.length=0; L.on=false; GUN.targets.length=0; };
  // 살 : 어둡고 젖은 느낌 (밝은 분홍에 격자가 또렷하면 칼집 낸 햄처럼 보인다) — 색을 낮추고 · 결(노멀)을 죽이고 · 빛 반사는 좁게
  function wetFlesh(s){ s.traverse(o=>{ if(!o.isMesh||!o.material) return; const m=o.material; m.metalness=0; m.side=THREE.DoubleSide; if(m.normalScale) m.normalScale.setScalar(.4);
      if(/Body/.test(m.name)){ m.color.setRGB(.9,.6,.55); m.roughness=.48;
        if(m.map&&m.map.image){ const z=LITE?512:1024, c=document.createElement('canvas'); c.width=c.height=z; const g=c.getContext('2d'); g.filter='blur('+(z/170)+'px)'; g.drawImage(m.map.image,0,0,z,z); g.filter='none'; g.fillStyle='rgba(44,9,8,.42)'; g.fillRect(0,0,z,z);      // 등의 밝은 격자 무늬를 눌러 준다
          const t=new THREE.CanvasTexture(c), s0=m.map; t.encoding=THREE.sRGBEncoding; t.flipY=false; t.wrapS=s0.wrapS; t.wrapT=s0.wrapT; t.offset.copy(s0.offset); t.repeat.copy(s0.repeat); t.rotation=s0.rotation; t.center.copy(s0.center); m.map=t; } } else if(/Beak/.test(m.name)){ m.color.setRGB(.035,.022,.018); m.roughness=.42; } else { m.color.multiplyScalar(.8); m.roughness=.5; } m.needsUpdate=true; }); return s; }
  // 달라붙었을 때 촉수 틈으로 복도가 보이지 않게 : 얼굴을 덮은 살 (눈앞을 감싸는 어두운 안쪽 면)
  function belly(){ if(L._belly) return L._belly; const c=document.createElement('canvas'); c.width=c.height=256; const g=c.getContext('2d'); g.fillStyle='#1a0605'; g.fillRect(0,0,256,256);
    for(let i=0;i<120;i++){ const x=Math.random()*256,y=Math.random()*256,r=8+Math.random()*32,gr=g.createRadialGradient(x,y,0,x,y,r); gr.addColorStop(0,Math.random()<.5?'rgba(96,24,20,.5)':'rgba(8,1,1,.6)'); gr.addColorStop(1,'rgba(0,0,0,0)'); g.fillStyle=gr; g.beginPath(); g.arc(x,y,r,0,7); g.fill(); }
    const t=new THREE.CanvasTexture(c); t.encoding=THREE.sRGBEncoding; t.wrapS=t.wrapT=THREE.RepeatWrapping; t.repeat.set(2,1);
    const m=new THREE.Mesh(new THREE.SphereGeometry(1.2,24,14,0,Math.PI*2,0,Math.PI*.62),new THREE.MeshStandardMaterial({map:t,color:new THREE.Color(.1,.05,.05),roughness:.7,metalness:0,side:THREE.BackSide,envMapIntensity:.1})); m.rotation.x=-Math.PI/2; m.renderOrder=39; m.frustumCulled=false; m.visible=false; camera.add(m); return L._belly=m; }

  async function spawn(x,z,y=0){ if(!proto) proto=loadRig('larva',{drop:/^Eyes$/,pose:/Swim_Forward/}).then(wetFlesh); const src=await proto, {wrap,g}=rigClone(src,L.SIZE,'max',L.YAW); WORLD.add(wrap); wrap.position.set(x,y,z); g.traverse(o=>{ if(o.isMesh&&o.material) o.material.envMapIntensity=.25; });
    const mixer=new THREE.AnimationMixer(g), C=src.userData.animations.map(c=>PEOPLE.inPlace(c)), A={};
    [['idle',/Idle_1/],['crawl',/Swim_Forward/],['bite',/Attack_Heavy/],['back',/Dash_Back/],['die',/Die/]].forEach(([k,re])=>{ const c=clipOf(C,re); if(c) A[k]=mixer.clipAction(c); });
    const l={wrap,g,mixer,A,cur:null,state:'crawl',cd:1.5,t:0,hp:L.HP,spd:0,kb:new THREE.Vector3(),hiss:1+Math.random()*2}; list.push(l);
    GUN.targets.push({center:()=>wrap.getWorldPosition(new THREE.Vector3()).add(new THREE.Vector3(0,l.state==='grab'?0:.22,0)),r:.5,alive:()=>l.state!=='dead',hit:(p,d)=>hit(l,p,d)}); return l; }
  function play(l,k,{once=false,fade=.2,speed=1}={}){ const a=l.A[k]; if(!a) return; a.timeScale=speed; if(l.cur===a&&!once) return; a.reset(); a.setLoop(once?THREE.LoopOnce:THREE.LoopRepeat,Infinity); a.clampWhenFinished=once; a.play(); if(l.cur&&l.cur!==a) l.cur.crossFadeTo(a,fade,false); l.cur=a; }
  // 시신을 찢고 나온다 : 피 · 살점이 튀며 → 작게 웅크렸다가 몸을 일으킨다
  async function burst(h){ h.done=true; const p=new THREE.Vector3(h.x,h.y+.3,h.z); SFX.play('burst',{at:p}); BLOOD.spray(p,50,3.4); BLOOD.pool(h.x,h.z,1.2); FX.shake(.25,.03);
    const l=await spawn(h.x,h.z,h.y); l.wrap.rotation.y=Math.atan2(P.x-h.x,P.z-h.z); play(l,'bite',{once:true,fade:0}); l.state='rise'; l.t=.9; l.wrap.scale.setScalar(.2);
    if(!L.seen){ L.seen=true; L.onFirst&&L.onFirst(l); } return l; }
  // 맞음 : 세 발째에 죽는다 — 그 전엔 움찔 · 밀려남 · 비명 · 녹색 체액
  function hit(l,p,d){ if(l.state==='dead') return; const at=p||l.wrap.getWorldPosition(new THREE.Vector3());
    BLOOD.spray(at,18,2.2,0xd8ff70); l.hp--; GUN.marker&&GUN.marker(l.hp<=0);
    if(l.state==='grab'){ release(l,true); if(l.hp>0) return; }
    if(l.hp<=0) return die(l,at,d);
    SFX.play('larva_hurt',{at}); l.state='hurt'; l.t=.5; l.spd=0; if(d) l.kb.set(d.x,0,d.z).normalize().multiplyScalar(2.6); play(l,'back',{once:true,fade:.05,speed:1.6}); }
  function die(l,p,d){ l.state='dead'; play(l,'die',{once:true,fade:.05}); SFX.play('larva_die',{at:p});
    BLOOD.spray(p,40,3,0xd8ff70); const g=BLOOD.pool(l.wrap.position.x,l.wrap.position.z,.9); g.material=g.material.clone(); g.material.color.setRGB(.5,.8,.2);
    if(d) l.kb.set(d.x,0,d.z).normalize().multiplyScalar(1.8);
    let t=0; const f=dt=>{ t+=dt; l.wrap.position.addScaledVector(l.kb,dt); l.kb.multiplyScalar(1-Math.min(1,dt*5)); if(t>2.5){ const k=Math.min(1,(t-2.5)/2); l.wrap.scale.setScalar(1-k*.5); l.wrap.position.y=-k*.12; }
      if(t>4.5){ TICK.splice(TICK.indexOf(f),1); WORLD.remove(l.wrap); const i=list.indexOf(l); if(i>=0) list.splice(i,1); } }; TICK.push(f);
    L.onKill&&L.onKill(L.left()); }
  // 얼굴로 뛰어오른다 : 바닥에서 눈높이로 포물선 (0.45 초) → 달라붙는다
  function leap(l){ l.state='leap'; l.lt=0; l.p0=l.wrap.position.clone(); play(l,'bite',{once:true,fade:.05,speed:1.3}); SFX.play('larva_leap',{at:l.p0}); }
  function grab(l){ L.grab=l; l.state='grab'; l.need=5; l.t=0; l.bit=0; l.jx=0; WORLD.remove(l.wrap); camera.add(l.wrap); l.wrap.scale.setScalar(L.FACE.size); l.wrap.rotation.set(L.FACE.tilt,Math.PI,0);      // 입이 나를 본다 (빨판 촉수가 양옆으로 화면을 덮는다)
    if(!l.beak){ l.beak=[]; l.g.traverse(o=>{ if(o.isBone&&/Beak_(Top|Bottom)/.test(o.name)) l.beak.push(o); }); l.jaw=l.beak.filter(b=>!/end/.test(b.name)); } GUN.face(true); belly().visible=true;
    // 물어뜯은 끝 자세로 굳히고(입이 앞) · 헤엄 동작을 살짝 얹어 촉수만 꿈틀댄다 (휘두르는 중간 자세면 옆모습이 된다)
    const bt=l.A.bite, cr=l.A.crawl; l.mixer.stopAllAction(); if(bt){ bt.reset(); bt.setLoop(THREE.LoopOnce,1); bt.clampWhenFinished=true; bt.timeScale=1; bt.setEffectiveWeight(1); bt.play(); bt.time=bt.getClip().duration; l.cur=bt; } if(cr){ cr.reset(); cr.setLoop(THREE.LoopRepeat,Infinity); cr.timeScale=1.5; cr.setEffectiveWeight(.22); cr.play(); l.over=cr; } l.mixer.update(.001); fitFace(l);
    l.wrap.traverse(o=>{ if(o.isMesh) o.renderOrder=40; });
    SFX.play('jumpscare'); FX.flash('#ff1a00',500); FX.shake(.8,.09); ME.hurt(1); const e=FXEL('grabfx'); e.innerHTML='<p>떼어 내라! — '+byDevice('F 연타 · 클릭','화면 연타')+'</p>'; e.classList.add('on'); }
  // 입이 화면 한가운데 눈앞에 오게 : 동작이 몸을 흔들어도 부리 사이를 매 프레임 재서 그 자리에 붙든다 (몸은 그 뒤로 화면을 채운다)
  const _m=new THREE.Vector3(), _b=new THREE.Vector3();
  function fitFace(l){ if(!l.beak.length) return; const sn=Math.sin(S.t*11), op=.16+Math.max(0,sn)*.5; l.jaw.forEach(b=>b.rotateX(/Top/.test(b.name)?-op:op));      // 부리가 벌어졌다 닫힌다
    _m.set(0,0,0); l.beak.forEach(b=>_m.add(camera.worldToLocal(b.getWorldPosition(_b)))); _m.multiplyScalar(1/l.beak.length);
    l.jx=(l.jx||0)*.82; l.wrap.position.x+=l.jx-_m.x; l.wrap.position.y+=L.FACE.y+Math.sin(S.t*30)*.006-_m.y; l.wrap.position.z+=L.FACE.z-_m.z; }
  // 떼어 내기 : 연타 한 번마다 흔들림 — 다 채우면 바닥으로 내던진다
  L.struggle=function(){ const l=L.grab; if(!l) return false; l.need--; FX.shake(.15,.05); SFX.play('struggle'); l.jx=(Math.random()-.5)*.09; if(l.need<=0) release(l,true); return true; };
  function release(l,thrown){ L.grab=null; if(l.over){ l.over.stop(); l.over.setEffectiveWeight(1); l.over=null; } FXEL('grabfx').classList.remove('on'); camera.remove(l.wrap); WORLD.add(l.wrap); l.wrap.scale.setScalar(1); GUN.face(false); belly().visible=false; if(l.state==='dead') return;
    const d=camera.getWorldDirection(new THREE.Vector3()); d.y=0; d.normalize(); const [x,z]=freeSpot(P.x+d.x*1.7,P.z+d.z*1.7,{r:.2,y1:.1,y2:.5});
    l.wrap.position.set(x,floorAt(x,z),z); l.wrap.rotation.set(0,Math.atan2(P.x-x,P.z-z),0); l.state='stun'; l.t=1.4; l.cd=3.5; l.spd=0; play(l,'back',{once:true,fade:.05}); if(thrown) SFX.play('thrown',{at:l.wrap.position}); }
  L.tick=function(dt){ for(const l of list) l.mixer.update(dt*(l.state==='crawl'?.6+l.spd*.35:1)); if(!L.on||S.phase!=='play') return;
    for(const h of hosts){ if(h.done) continue; const d=Math.hypot(P.x-h.x,P.z-h.z); if(d<2.6||d<h.near&&clearShot(new THREE.Vector3(h.x,h.y+1,h.z),camera.position)) burst(h); }
    const eye=camera.getWorldPosition(new THREE.Vector3());
    for(const l of list){ if(l.state==='dead') continue; const w=l.wrap.position, dx=P.x-w.x, dz=P.z-w.z, d=Math.hypot(dx,dz); l.t-=dt; l.cd-=dt;
      if(l.state==='rise'){ l.wrap.scale.setScalar(Math.min(1,l.wrap.scale.x+dt*1.2)); if(l.t<=0){ l.state='crawl'; play(l,'crawl'); } continue; }
      if(l.state==='hurt'||l.state==='stun'){ w.addScaledVector(l.kb,dt); l.kb.multiplyScalar(1-Math.min(1,dt*6)); if(l.t<=0){ l.state='crawl'; play(l,'crawl',{fade:.3}); } continue; }
      if(l.state==='crawl'){ l.spd=lerp(l.spd,d<1.2?.4:2.2,Math.min(1,dt*2.2)); steer(l.wrap,P.x,P.z,l.spd,dt,{r:.18,y1:.12,y2:.45,turn:5}); w.y=lerp(w.y,floorAt(w.x,w.z),Math.min(1,dt*8));
        l.hiss-=dt; if(l.hiss<=0){ l.hiss=1.8+Math.random()*2.5; if(d<14) SFX.play('larva_hiss',{at:w}); }
        if(d<3.4&&l.cd<=0&&!L.grab&&!ME.dead&&!HIDE.in&&clearShot(new THREE.Vector3(w.x,.6,w.z),eye)) leap(l); continue; }
      if(l.state==='leap'){ l.lt+=dt; const k=Math.min(1,l.lt/.45), tgt=eye.clone().add(camera.getWorldDirection(new THREE.Vector3()).multiplyScalar(.4)); w.lerpVectors(l.p0,tgt,k*k); w.y+=Math.sin(k*Math.PI)*.45-.25*k;
        l.wrap.rotation.y=Math.atan2(P.x-w.x,P.z-w.z); l.wrap.rotation.x=-k*.9; if(k>=1) grab(l); continue; }
      if(l.state==='grab'){ l.wrap.rotation.x=L.FACE.tilt+Math.sin(S.t*8)*.05; l.wrap.rotation.z=Math.sin(S.t*5.3)*.04; fitFace(l); l.bit+=dt; if(l.bit>2.4){ l.bit=0; ME.hurt(1); FX.shake(.4,.07); SFX.play('bite'); } } } };
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
  B.sees=function(b){ if(HIDE.in&&!HIDE.seen) return false; const w=b.wrap.position, dx=P.x-w.x, dz=P.z-w.z, d=Math.hypot(dx,dz), lim=ME.crouch?6.5:17; if(d>lim) return false;
    let a=Math.atan2(dx,dz)-b.wrap.rotation.y; a=Math.atan2(Math.sin(a),Math.cos(a)); if(Math.abs(a)>1.05&&d>2.6) return false;
    return clearShot(new THREE.Vector3(w.x,w.y+1.9,w.z),camera.getWorldPosition(new THREE.Vector3()),.25); };
  // 사냥 : 둘러보기(순찰 점들) → 보이면 울부짖고 쫓는다 → 놓치면 마지막 자리를 뒤진다. 닿으면 onCatch
  B.hunt=function(b,{patrol=[],onCatch,speed=3.3,roar=true}={}){ let mode='patrol', pi=0, last=null, lost=0, busy=false, roared=!roar, srch=0;
    const next=()=>{ if(!patrol.length) return; const [x,z]=patrol[pi++%patrol.length]; B.go(b,x,z,{speed:1.25,clip:'walk'}).then(()=>{ if(mode==='patrol') setTimeout(()=>{ if(mode==='patrol'&&!b.path) next(); },1500+Math.random()*2000); }); };
    next();
    const ai=b.ai=async dt=>{ if(busy||S.phase!=='play'||b.stun>0) return; const w=b.wrap.position, d=Math.hypot(P.x-w.x,P.z-w.z), see=B.sees(b);
      b.mode=mode;
      if(see){ last={x:P.x,z:P.z}; lost=0;
        if(mode!=='chase'){ mode='chase'; B.stop(b); if(!roared){ roared=true; busy=true; b.wrap.rotation.y=Math.atan2(P.x-w.x,P.z-w.z); SFX.play('beast_roar',{at:w}); STING(.5); FX.shake(.4,.04); await B.play(b,'roar',{once:true}); busy=false; } } }
      else if(mode==='chase'){ lost+=dt; if(lost>2.2){ mode='search'; srch=7; B.go(b,last.x,last.z,{speed:2,clip:'walk'}); } }
      if(b.heard&&mode!=='chase'){ last=b.heard; b.heard=null; mode='search'; srch=7; B.go(b,last.x,last.z,{speed:2.4,clip:'run'}); }
      if(HIDE.in&&!busy){ const s=HIDE.in, fr=HIDE.front(s,1.1), ds=Math.hypot(fr.x-w.x,fr.z-w.z);
        if(HIDE.seen||HIDE.noisy(b)){ if(mode!=='found'){ mode='found'; b.path=ROUTE.path(w.x,w.z,fr.x,fr.z); b.speed=speed; b.move='run'; B.play(b,'run'); GROWL(.12); }
          if(ds<.7||(!b.path&&ds<2)){ busy=true; B.stop(b); b.wrap.rotation.y=Math.atan2(s.x-w.x,s.z-w.z); SFX.play('found'); if(s.dl) HIDE.doors(s,true,.25); await B.play(b,'swipe',{once:true,fade:.05}); FX.flash('#900000',900); SCREAM(.6); busy=false; mode='done'; onCatch&&onCatch(); return; }
          return; }
        if(mode==='chase'){ mode='search'; srch=9; B.go(b,fr.x,fr.z,{speed:1.6,clip:'walk'}); } }
      if(mode==='chase'){ if(d<1.45){ busy=true; B.stop(b); b.wrap.rotation.y=Math.atan2(P.x-w.x,P.z-w.z); AUDIO.tone(700,.3,'sawtooth',.07,0,-300); B.play(b,'swipe',{once:true,fade:.05}); P.free=false; await sleep(450); FX.flash('#900000',900); SCREAM(.6); busy=false; mode='done'; onCatch&&onCatch(); return; }
        if(!b.path||b.path.length>1||Math.hypot(b.path[0][0]-P.x,b.path[0][1]-P.z)>.8){ b.path=ROUTE.path(w.x,w.z,P.x,P.z); b.speed=speed; b.move='run'; B.play(b,'run'); } }
      if(mode==='search'&&!b.path){ srch-=dt; if(srch<=0){ mode='patrol'; next(); } else if(b.cur!==b.A.battle) B.play(b,'battle'); } };
    TICK.push(ai); return ()=>{ mode='done'; const i=TICK.indexOf(ai); if(i>=0) TICK.splice(i,1); B.stop(b); }; };
  B.tick=function(dt){ for(const b of list){ b.mixer.update(dt); if(b.stun>0){ b.stun-=dt; continue; }
    if(b.path){ const [tx,tz]=b.path[0], left=steer(b.wrap,tx,tz,b.speed,dt,{r:.32,y1:.45,y2:1.9,turn:5}), w=b.wrap.position, gy=SOLID.top(w.x,w.z,w.y+.5,.2); w.y+=((gy===null?floorAt(w.x,w.z):Math.max(gy,floorAt(w.x,w.z)))-w.y)*Math.min(1,dt*8);      // 턱 · 원자로 단을 오른다
      if(left<.15){ b.path.shift(); if(!b.path.length){ b.path=null; B.play(b,'idle'); const r=b.done; b.done=null; r&&r(); } }
      // 발소리 : 무겁게 (가까울수록 크게)
      b.step-=dt*(b.speed>2?2.6:1.4); if(b.step<=0){ b.step=1; SFX.play('beast_step',{at:b.wrap.position}); } }
    b.gr=(b.gr||4)-dt; if(b.gr<=0){ b.gr=5+Math.random()*6; if(b.cur!==b.A.eat) SFX.play('beast_growl',{at:b.wrap.position,vol:.8}); } }
    // 쫓길 때 음악 : 하나라도 쫓으면 chase · 4 초 동안 아무도 안 쫓으면 원래대로
    const chasing=list.some(b=>b.mode==='chase'||b.mode==='found'); if(chasing){ B.calm=0; if(MUSIC.cur!=='chase'&&list.length) { B.before=MUSIC.cur; MUSIC.play('chase',{fade:.8,vol:.55}); } } else if(MUSIC.cur==='chase'){ B.calm=(B.calm||0)+dt; if(B.calm>4) MUSIC.play(B.before||'derelict',{fade:3}); } };
  return B; })();

// 가까운 생물과의 거리로 붉은 가장자리 · 심장 소리
const DREAD={on(){ if(this.fn) return; const el=FXEL('dread'); let beat=0;
  TICK.push(this.fn=dt=>{ let d=99; for(const b of BEAST.list){ const w=b.wrap.position; d=Math.min(d,Math.hypot(P.x-w.x,P.z-w.z)); } for(const l of LARVA.list){ if(l.state!=='dead'){ const w=l.wrap.position; d=Math.min(d,Math.hypot(P.x-w.x,P.z-w.z)*1.6); } }
    const k=Math.max(0,Math.min(1,(13-d)/10)); el.style.opacity=k*.85; beat-=dt;
    if(k>0&&beat<=0){ beat=1.1-k*.75; SFX.play('heartbeat',{vol:.3+.7*k}); } }); },
  off(){ if(this.fn){ const i=TICK.indexOf(this.fn); if(i>=0) TICK.splice(i,1); this.fn=null; } FXEL('dread').style.opacity=0; } };
// 엔진이 매 프레임 부르고(ALIEN.tick) · 맵을 비울 때 지운다(ALIEN.clear)
const ALIEN={tick(dt){ LARVA.tick(dt); BEAST.tick(dt); },clear(){ LARVA.clear(); BEAST.clear(); }};
// 빈 바닥 찾기 : (x,z) 둘레 r 안 · 높이 y1~y2 에 막힌 칸이 없는 가장 가까운 자리 (1.6 m 안 · 없으면 그대로)
function freeSpot(x,z,{r=.45,y1=.12,y2=.9}={}){ if(!SOLID.hit(x,z,y1,y2,r)) return [x,z]; for(let d=.15;d<=1.6;d+=.15) for(let a=0;a<16;a++){ const t=a/16*Math.PI*2+d, fx=x+Math.sin(t)*d, fz=z+Math.cos(t)*d; if(!SOLID.hit(fx,fz,y1,y2,r)) return [fx,fz]; } return [x,z]; }
