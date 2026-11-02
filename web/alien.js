/* ============================================================
   ALIEN : 기생체 (web/assets/alien.glb)
     모델 Tripo(글 → 3D) · 리토폴로지 2만 면 · Tripo 자동 리깅(Mixamo 뼈 65개)
     동작 Mixamo 9개 → tools/retarget.py 로 한 파일에 : idle walk run swipe roar jump_attack die crawl crawl_run
   - ALIEN.spawn({at,face,height,clip}) → a   (height : 선 키 m — 어린 개체는 작게 해서 crawl 로 긴다)
   - ALIEN.play(a,'roar',{once:true}) → 끝날 때 풀리는 Promise
   - ALIEN.go(a,[[x,z],…],{speed,clip}) → 걸어서 / 기어서 간다 (도착하면 idle)
   - 시험 : 주소 ?s=alien — 복도에서 순찰하다 가까이 가면 울부짖고, 닿으면 할퀸다
   ============================================================ */
'use strict';
const ALIEN=(()=>{ const list=[]; let proto=null;
  async function spawn({at,face=0,height=2.7,clip='idle'}){
    // 몸통(꼭짓점이 가장 많은 살)으로 잰다 — 안쪽 입 · 이빨은 작다
    // 키 재기 : 뼈 단위(cm)와 살 단위가 달라서 Box3 로는 안 된다 → 쉬는 자세(T)로 뼈를 입힌 살 꼭짓점으로 잰다
    if(!proto) proto=loadGLB('alien').then(s=>{ let m; s.traverse(o=>{ if(o.isSkinnedMesh&&(!m||o.geometry.attributes.position.count>m.geometry.attributes.position.count)) m=o; }); m.skeleton.pose(); s.updateMatrixWorld(true);
      const box=new THREE.Box3(), v=new THREE.Vector3(), n=m.geometry.attributes.position.count;
      for(let i=0;i<n;i+=5){ m.boneTransform(i,v); box.expandByPoint(v.applyMatrix4(m.matrixWorld)); }
      m.material.transparent=false; m.material.depthWrite=true; s.userData.box=box; return s; });
    const src=await proto, g=THREE.SkeletonUtils.clone(src), wrap=new THREE.Group(); wrap.add(g); WORLD.add(wrap);
    const b=src.userData.box, k=height/(b.max.y-b.min.y); g.scale.setScalar(k); g.position.y=-b.min.y*k;
    g.traverse(o=>{ if(o.isMesh){ o.frustumCulled=false; o.material.envMapIntensity=.8; } });
    wrap.position.set(at.x,at.y||0,at.z); wrap.rotation.y=face;
    const mixer=new THREE.AnimationMixer(g), acts={};
    for(const c of src.userData.animations) acts[c.name]=mixer.clipAction(PEOPLE.inPlace(c));
    const morphs=[]; g.traverse(o=>{ if(o.morphTargetInfluences) morphs.push(o); });
    // 붉은 기운 : 검은 몸이 어둠에 묻히지 않게 머리 앞에 약한 붉은 빛 (함께 움직인다)
    const glow=new THREE.PointLight(0xff3a20,1.4,2.2+height,1.6); WORLD.add(glow);
    const a={wrap,g,mixer,acts,cur:null,path:null,speed:0,move:null,morphs,open:0,openTo:null,glow,h:height}; list.push(a); play(a,clip,{fade:0}); return a; }
  // 얼굴이 갈라진다 (Blender 모양 키 'split' — blender/20_기생체.blend) : 울부짖기 · 할퀴기 · 덮치기 · 가까이 왔을 때 열린다. a.openTo 로 직접 정할 수도 있다
  function face(a,dt){ if(!a.morphs.length) return; const n=a.cur&&a.cur.getClip().name, w=a.wrap.position, near=Math.hypot(P.x-w.x,P.z-w.z)<5;
    const want=a.openTo!=null?a.openTo:/roar|swipe|jump_attack/.test(n)?1:near?.7:0; a.open+=(want-a.open)*Math.min(1,dt*(want>a.open?9:3));
    a.morphs.forEach(o=>o.morphTargetInfluences[0]=a.open); }

  function play(a,name,{fade=.3,once=false}={}){ const n=a.acts[name]; if(!n) return Promise.resolve();
    if(a.cur!==n){ n.reset(); n.setLoop(once?THREE.LoopOnce:THREE.LoopRepeat,Infinity); n.clampWhenFinished=once; n.play(); if(a.cur&&fade) a.cur.crossFadeTo(n,fade,false); else if(a.cur) a.cur.stop(); a.cur=n; }
    return once?new Promise(res=>{ const f=e=>{ if(e.action!==n) return; a.mixer.removeEventListener('finished',f); res(); }; a.mixer.addEventListener('finished',f); }):Promise.resolve(); }

  function go(a,pts,{speed=1.4,clip='walk'}={}){ a.path=pts.map(p=>p.slice()); a.speed=speed; a.move=clip; play(a,clip);
    return new Promise(res=>a.done=res); }

  function tick(dt){ for(const a of list){ a.mixer.update(dt); face(a,dt);
    if(a.glow){ const r=a.wrap.rotation.y; a.glow.position.set(a.wrap.position.x+Math.sin(r)*.5,a.wrap.position.y+(a.flip?-1:1)*a.h*.75,a.wrap.position.z+Math.cos(r)*.5); a.glow.intensity=1.2+a.open*1.8; }
    if(a.stun>0){ a.stun-=dt; continue; }               // 총에 맞으면 잠깐 멈칫 (죽지는 않는다)
    if(!a.path) continue; const w=a.wrap.position, [tx,tz]=a.path[0], dx=tx-w.x, dz=tz-w.z, d=Math.hypot(dx,dz);
    if(d<.1){ a.path.shift(); if(!a.path.length){ a.path=null; play(a,'idle'); const r=a.done; a.done=null; r&&r(); } continue; }
    const s=Math.min(d,a.speed*dt); w.x+=dx/d*s; w.z+=dz/d*s;
    let dy=Math.atan2(dx,dz)-a.wrap.rotation.y; dy=Math.atan2(Math.sin(dy),Math.cos(dy)); a.wrap.rotation.y+=dy*Math.min(1,dt*6); } }

  function stop(a){ a.path=null; a.done=null; }
  function remove(a){ a.wrap.parent&&a.wrap.parent.remove(a.wrap); a.glow&&a.glow.parent&&a.glow.parent.remove(a.glow); const i=list.indexOf(a); if(i>=0) list.splice(i,1); }
  function clear(){ list.slice().forEach(remove); }
  // 몸 가운데 (쏘기 · 거리) — 천장에 거꾸로 매달린 것(a.flip)은 아래쪽
  const center=a=>a.wrap.position.clone().add(new THREE.Vector3(0,(a.flip?-1:1)*a.h*.45,0));
  return {spawn,play,go,stop,tick,clear,remove,center,list};
})();

// 시험 장면 : 중앙 복도 순찰 → 6 m 안이면 울부짖고 쫓아온다 → 1.6 m 안이면 할퀸다
SCENES.alien={title:'기생체 시험', async enter(){ await SCENES.ship.enter({at:'bridge'});
  warp(14,10.5); P.yaw=yawTo(30,10.5);
  const a=await ALIEN.spawn({at:{x:34,z:10.5},face:-Math.PI/2});
  goal('기생체 시험 · 가까이 가 보자');
  let mode='patrol', busy=false;
  const patrol=async()=>{ while(mode==='patrol'){ await ALIEN.go(a,[[24,10.5]],{speed:1.1}); if(mode!=='patrol') break; await ALIEN.go(a,[[44,10.5]],{speed:1.1}); } };
  patrol();
  TICK.push(async()=>{ if(busy) return; const w=a.wrap.position, d=Math.hypot(P.x-w.x,P.z-w.z);
    if(mode==='patrol'&&d<6){ busy=true; mode='hunt'; ALIEN.stop(a); a.wrap.rotation.y=Math.atan2(P.x-w.x,P.z-w.z); await ALIEN.play(a,'roar',{once:true}); busy=false; }
    else if(mode==='hunt'&&d<1.6){ busy=true; ALIEN.stop(a); a.wrap.rotation.y=Math.atan2(P.x-w.x,P.z-w.z); await ALIEN.play(a,'swipe',{once:true}); busy=false; }
    else if(mode==='hunt'&&d>14){ mode='patrol'; patrol(); }
    else if(mode==='hunt'&&(!a.path||Math.hypot(a.path[0][0]-P.x,a.path[0][1]-P.z)>.8)) ALIEN.go(a,[[P.x,P.z]],{speed:3.2,clip:'run'}); }); }};
