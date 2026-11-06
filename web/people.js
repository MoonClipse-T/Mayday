/* ============================================================
   PEOPLE : 실사 인물 (Sketchfab CC BY — web/assets/person_<kind>.glb)
     Renderpeople : eric · carla · claudia · manuel (리깅) · nathan (걷기 동작) · sophia (서서 쉬는 동작)
     guard (Mixamo 뼈 · 서서 쉬는 동작)
     maya · seojun · daniel · owen (Tripo — Mixamo 뼈 mixamorig:Hips · idle · walk · 비행복) : 크기는 실제 키(HEIGHT)로 맞춘다
   - 뼈 이름이 모델마다 달라서 정규식 두 벌로 찾는다 (Renderpeople upperarm_l_024 / Mixamo LeftArm_09)
   - 자세는 뼈 방향을 '월드 방향'으로 맞추는 aim 으로 만든다 (뼈 축을 몰라도 된다) : 팔 내리기 · 앉기 · 화면 가리키기
   - 움직임 : 숨쉬기 · 고개 돌려 보기 · 눈 깜빡임 · 말할 때 턱 — 동작 클립이 있으면(걷기 · 쉬기) 그 위에 더한다
   - PEOPLE.spawn({kind,name,role,at,pose:'stand'|'sit',seatY}) → 사람
     p.talking = true 면 입이 움직인다 · p.pointAt = Vector3 면 오른팔로 가리킨다 · p.lookAt = Vector3 면 그쪽을 본다
     PEOPLE.walk(p,[[x,z(,y)],…],speed) → 걸어서 간다 (걷기 클립이 있는 모델만 다리가 움직인다) · p.sleep = true 면 동면 중 (움직임 · 시선 멈춤)
   - 비행복 대원 넷은 Mixamo 동작을 더 갖고 있다 (tools/retarget.py) : 빠르면(2.4 m/s 이상) run · p.armed 면 pistol_run · p.crouch 면 crouch · p.hurt 면 limp
     p.mood = 'scared' | 'nervous' | 'aim' | 'argue' | 'struggle' | 'crawl_back' → 서 있을 때 그 동작 · 말할 때(mood 없음)는 talk 손짓
     PEOPLE.act(p,'point'|'wave'|'hit',{n}) → 한 번(n 번) 하고 원래 동작으로 (Promise)
     걷는 사람은 가구(몸 충돌 칸 SOLID)를 비켜 돌고, 서 있는데 가구 속이면 가까운 빈자리로 나온다 (앉음 · 동면 · 끌려가는 중 · 캡슐 안은 빼고)
     p.armed 면 오른손에 총 (web/assets/gun.glb · 쥔 자리 GUN) · p.kick = .15 면 반동
   ============================================================ */
'use strict';
const PEOPLE=(()=>{
  const proto={}, list=[]; const V=()=>new THREE.Vector3(), Q=()=>new THREE.Quaternion();
  const _a=V(), _b=V(), _q=Q(), _p=Q(), _r=Q(), _s=Q();
  // Tripo 모델은 크기가 제각각이라 키(m)로 맞추고 발을 바닥에 둔다
  const HEIGHT={maya:1.66,seojun:1.76,owen:1.86,daniel:1.75};
  async function load(kind){ if(!proto[kind]) proto[kind]=loadGLB('person_'+kind).then(s=>{ if(HEIGHT[kind]){ s.updateMatrixWorld(true); const b=new THREE.Box3().setFromObject(s), k=HEIGHT[kind]/(b.max.y-b.min.y);
      s.scale.multiplyScalar(k); s.position.y-=b.min.y*k; } return s; }); return proto[kind]; }
  const bone=(g,re)=>{ let b=null; g.traverse(o=>{ if(!b&&o.isBone&&re.test(o.name)) b=o; }); return b; };
  // Mixamo 뼈 : 불러오면 : 가 빠진다(mixamorigHips). Sketchfab 은 끝에 _번호(mixamorigHips_01), Tripo 는 번호 없이 — 둘 다 받는다
  const RE={hip:/(^|_)hip_\d|mixamorig:?Hips(_|$)/, sp2:/(^|_)spine_02|mixamorig:?Spine1(_|$)/, sp3:/(^|_)spine_03|mixamorig:?Spine2(_|$)/, neck:/(^|_)neck_\d|mixamorig:?Neck(_|$)/, head:/(^|_)head_\d|mixamorig:?Head(_\d|$)/, jaw:/(^|_)jaw_\d/,
    lidL:/(^|_)eyelid_l_\d/, lidR:/(^|_)eyelid_r_\d/,
    uaL:/(^|_)upperarm_l_\d|mixamorig:?LeftArm(_|$)/, laL:/(^|_)lowerarm_l_\d|mixamorig:?LeftForeArm(_|$)/, hL:/(^|_)hand_l_\d|mixamorig:?LeftHand(_\d|$)/,
    uaR:/(^|_)upperarm_r_\d|mixamorig:?RightArm(_|$)/, laR:/(^|_)lowerarm_r_\d|mixamorig:?RightForeArm(_|$)/, hR:/(^|_)hand_r_\d|mixamorig:?RightHand(_\d|$)/,
    ulL:/(^|_)upperleg_l_\d|mixamorig:?LeftUpLeg(_|$)/, llL:/(^|_)lowerleg_l_\d|mixamorig:?LeftLeg(_|$)/, fL:/(^|_)foot_l_\d|mixamorig:?LeftFoot(_|$)/, tL:/(^|_)ball_l_\d|mixamorig:?LeftToeBase(_|$)/,
    ulR:/(^|_)upperleg_r_\d|mixamorig:?RightUpLeg(_|$)/, llR:/(^|_)lowerleg_r_\d|mixamorig:?RightLeg(_|$)/, fR:/(^|_)foot_r_\d|mixamorig:?RightFoot(_|$)/, tR:/(^|_)ball_r_\d|mixamorig:?RightToeBase(_|$)/};
  // 뼈를 월드 방향 dir 로 향하게 (자식 뼈 쪽이 뼈 방향)
  function aim(b,child,dir){ if(!b||!child) return; b.updateWorldMatrix(true,false); child.updateWorldMatrix(true,false);
    b.getWorldPosition(_a); child.getWorldPosition(_b); _b.sub(_a).normalize(); _q.setFromUnitVectors(_b,dir.clone().normalize());
    b.getWorldQuaternion(_r); b.parent.getWorldQuaternion(_p); _r.premultiply(_q); b.quaternion.copy(_p.invert().multiply(_r)); b.updateWorldMatrix(false,true); }
  // 뼈를 월드 축 axis 둘레로 angle 만큼 더 돌린다 (부모가 먼저 돌아간 상태를 반영하도록 부모 행렬을 새로 구한다)
  function turn(b,axis,angle){ if(!b||!angle) return; b.parent.updateWorldMatrix(true,false); b.parent.getWorldQuaternion(_p);
    _q.setFromAxisAngle(axis,angle); _r.copy(_p).invert().multiply(_q).multiply(_p); b.quaternion.premultiply(_r); }

  // 제자리 동작으로 : 뿌리 · 골반 이동 중 한쪽으로 계속 나가는 축(걷기의 앞)을 첫 값에 묶는다 → 몸은 엔진이 옮긴다
  function inPlace(c0){ const c=c0.clone(); c.tracks.forEach(t=>{ if(!/position$/.test(t.name)) return; const v=t.values, n=v.length/3;
      for(let ax=0;ax<3;ax++){ let lo=1e9,hi=-1e9; for(let i=0;i<n;i++){ lo=Math.min(lo,v[i*3+ax]); hi=Math.max(hi,v[i*3+ax]); }
        if(Math.abs(v[(n-1)*3+ax]-v[ax])>(hi-lo)*.5&&hi-lo>1e-4) for(let i=0;i<n;i++) v[i*3+ax]=v[ax]; } });
    return c; }

  async function spawn({kind,name,role='',at,face,pose='stand',seatY=.47,clip=null}){
    const src=await load(kind), g=THREE.SkeletonUtils.clone(src), wrap=new THREE.Group(); wrap.add(g); WORLD.add(wrap);
    g.traverse(o=>{ if(o.isMesh){ o.frustumCulled=false; if(o.material){ o.material.envMapIntensity=.6; } } });
    wrap.position.set(at.x,at.y||0,at.z); wrap.rotation.y=(face??at.yaw)-Math.PI;     // 모델은 블렌더 -y(=three +z)를 본다
    wrap.updateMatrixWorld(true);
    const B={}; for(const k in RE) B[k]=bone(g,RE[k]);
    const clips=src.userData.animations||[]; let mixer=null, idleA=null, walkA=null; const acts={};
    // 몸 기준 방향 (x 몸의 왼쪽(+), y 위, z 앞) → 월드
    const toW=(x,y,z)=>new THREE.Vector3(x,y,z).applyQuaternion(wrap.quaternion);
    const side=s=>s==='L'?1:-1;
    if(pose==='sit'){
      for(const s of ['L','R']){ const k=side(s);
        aim(B['ul'+s],B['ll'+s],toW(k*.12,-.08,1)); aim(B['ll'+s],B['f'+s],toW(k*.03,-1,.14)); aim(B['f'+s],B['t'+s],toW(0,-.25,1));
        aim(B['ua'+s],B['la'+s],toW(k*.2,-1,.3)); aim(B['la'+s],B['h'+s],toW(-k*.18,-.35,1)); }
      // 골반을 의자 높이로 : 엉덩이(hip 뼈)가 앉는 면 + 0.1 m · 몸통은 조금 뒤로
      turn(B.sp2,V().set(1,0,0).applyQuaternion(wrap.quaternion),-.06);
      g.updateMatrixWorld(true); const hp=V(); (B.hip||g).getWorldPosition(hp); wrap.position.y+=seatY+.1-hp.y;
      const back=toW(0,0,-.1); wrap.position.add(back);
    } else if(pose==='lie'){      // 바닥에 누운 몸 : 왼팔은 옆으로 늘어지고 · 오른손은 배를 움켜쥐고 · 오른 무릎을 세우고 · 고개를 왼쪽으로 (눕히기는 부르는 쪽이 wrap 을 돌린다)
      aim(B.uaL,B.laL,toW(.42,-.9,.02)); aim(B.laL,B.hL,toW(.3,-.92,-.02));
      aim(B.uaR,B.laR,toW(-.42,-.82,.34)); aim(B.laR,B.hR,toW(.82,.32,.42));
      aim(B.ulL,B.llL,toW(.12,-1,.03)); aim(B.llL,B.fL,toW(.08,-1,-.02));
      aim(B.ulR,B.llR,toW(-.14,-.7,.7)); aim(B.llR,B.fR,toW(-.06,-.72,-.68)); aim(B.fR,B.tR,toW(-.05,-1,.12));
      turn(B.neck,V().set(0,1,0),.55); turn(B.head,V().set(0,1,0),.25);
    } else {
      for(const s of ['L','R']){ const k=side(s);      // 팔 내리기 (모델의 l 뼈 = 몸의 왼쪽 = 몸 기준 +x)
        aim(B['ua'+s],B['la'+s],toW(k*.16,-1,.02)); aim(B['la'+s],B['h'+s],toW(k*.1,-1,.32)); }
      if(clips.length&&clip!==false){
        mixer=new THREE.AnimationMixer(g);
        // 동작 고르기 : 이름에 walk · idle 이 있으면 그것 (Tripo), 하나뿐이면 nathan 은 걷기 · 나머지는 서서 쉬기
        const walkC=clips.find(c=>/walk/i.test(c.name))||(kind==='nathan'?clips[0]:null), idleC=clips.find(c=>/idle/i.test(c.name))||(clips[0]!==walkC?clips[0]:null);
        const play=c0=>{ if(!c0) return null; const c=inPlace(c0); const a=mixer.clipAction(c); a.play(); a.time=Math.random()*c.duration; return a; };
        idleA=play(idleC); walkA=play(walkC); if(walkA) walkA.setEffectiveWeight(0);
        // 나머지 동작 (대원 넷) : 무게 0 으로 틀어 두고 tick 이 하나를 골라 서서히 바꾼다
        if(idleA) acts.idle=idleA; if(walkA) acts.walk=walkA;
        clips.forEach(c0=>{ const n=c0.name.replace(/\.\d+$/,''); if(acts[n]||c0===idleC||c0===walkC) return; const a=mixer.clipAction(inPlace(c0)); a.play(); a.setEffectiveWeight(0); acts[n]=a; });
      }
    }
    wrap.updateMatrixWorld(true);
    const base=new Map(); g.traverse(o=>{ if(o.isBone) base.set(o,o.quaternion.clone()); });
    const hp=V(); g.updateMatrixWorld(true); (B.head||g).getWorldPosition(hp);
    // 탭 판정 원기둥
    const pk=new THREE.Mesh(new THREE.CylinderGeometry(.38,.38,pose==='sit'?1.4:1.9,10),PICK); pk.position.set(0,pose==='sit'?.7-(wrap.position.y-(at.y||0)):.95,0); wrap.add(pk);
    const p={kind,name,role,wrap,g,B,base,mixer,idleA,walkA,acts,cur:null,once:null,mood:null,mw:0,pose,headY:hp.y-(at.y||0),talking:false,blinkT:1+Math.random()*3,blink:0,ph:Math.random()*10,look:0,lookP:0,jaw:0,pick:pk,watch:true,
      pointAt:null,pw:0,lookAt:null,path:null,speed:1.25};
    list.push(p); return p; }

  // 쥔 자리 : 오른손 뼈 기준 위치(m) · 회전(라디안) — 게임에서 보며 맞춘 값
  const GUN={pos:[0,.06,0],rot:[-3.02,.11,-1.24]}; let gunP=null;
  const gunFit=g=>{ const ws=g.userData.ws||1; g.position.fromArray(GUN.pos).multiplyScalar(1/ws); g.rotation.fromArray(GUN.rot); };
  const up=new THREE.Vector3(0,1,0);
  // 사람끼리 겹치지 않게 (걷는 사람만 움직인다) : 같은 쪽으로 가는 앞사람이 가까우면 기다리고, 닿으면 밀어 낸다
  const others=p=>list.filter(q=>q!==p&&!q.sleep&&q.wrap.visible&&q.wrap.parent);
  function blocked(p,ux,uz){ const w=p.wrap.position;
    return others(p).some(q=>{ const ox=q.wrap.position.x-w.x, oz=q.wrap.position.z-w.z, r=Math.hypot(ox,oz); if(r>.9||r<1e-4||(ox*ux+oz*uz)/r<.7) return false;
      if(!q.path) return false; const [qx,qz]=q.path[0], qd=Math.hypot(qx-q.wrap.position.x,qz-q.wrap.position.z)||1;
      return ((qx-q.wrap.position.x)*ux+(qz-q.wrap.position.z)*uz)/qd>0; }); }       // 마주 오는 사람은 기다리지 않는다 (서로 기다리면 멈춘다) → apart 가 비켜 준다
  function apart(p){ const w=p.wrap.position; for(const q of others(p)){ const R=q.pose==='sit'?.6:.5, ox=w.x-q.wrap.position.x, oz=w.z-q.wrap.position.z, r=Math.hypot(ox,oz);
    if(r>=R) continue; const k=q.path?(R-r)/2:R-r, nx=r>1e-4?ox/r:1, nz=r>1e-4?oz/r:0; w.x+=nx*k; w.z+=nz*k; if(q.path){ q.wrap.position.x-=nx*k; q.wrap.position.z-=nz*k; } } }
  // 가구 · 벽 (engine 의 몸 충돌 칸 SOLID) : 발 위 STEP ~ 머리 사이에 막힌 칸이 있나 — 탁자 · 식탁 한가운데 서지 않게
  const solidAt=(x,z,y)=>SOLID.hit(x,z,y+STEP,y+1.6,.2);
  // 막힌 자리면 가장 가까운 빈자리 (1.5 m 안 · 없으면 null)
  function freeNear(x,z,y){ for(let r=.15;r<=1.5;r+=.15) for(let a=0;a<12;a++){ const t=a/12*Math.PI*2+r, fx=x+Math.sin(t)*r, fz=z+Math.cos(t)*r; if(!solidAt(fx,fz,y)) return [fx,fz]; } return null; }
  function tick(dt){ for(const p of list){ const {B,wrap}=p; p.ph+=dt;
      p.base.forEach((q,b)=>b.quaternion.copy(q));
      // 걷기 : 다음 점으로 몸을 돌리며 나간다 (그 점에 누가 서 있으면 가까이 온 것으로 친다)
      if(p.path&&p.path.length){ const pt=p.path[0];
        if(p._pt!==pt){ p._pt=pt; p.side=0; p.best=1e9; p.nogo=0; }      // 새 점 : 비켜 돌기 처음부터
        // 가려는 점이 가구 속이면 옆 빈자리로 바꾼다 (STORY.follow 가 탁자 너머를 고를 때)
        if(pt._ok!==SOLID.g&&pt[2]===undefined){ pt._ok=SOLID.g; if(solidAt(pt[0],pt[1],wrap.position.y)){ const f=freeNear(pt[0],pt[1],wrap.position.y); if(f){ pt[0]=f[0]; pt[1]=f[1]; } } }
        const [tx,tz,ty]=pt, dx=tx-wrap.position.x, dz=tz-wrap.position.z, d=Math.hypot(dx,dz);
        if(ty!==undefined) wrap.position.y+=(ty-wrap.position.y)*Math.min(1,dt*5);      // 점에 높이가 있으면 (캡슐 바닥 → 복도 바닥)
        if(d<.08||(d<.5&&others(p).some(q=>Math.hypot(q.wrap.position.x-tx,q.wrap.position.z-tz)<.5))){ p.path.shift(); if(!p.path.length){ p.path=null; p.done&&p.done(); } }
        else { let ang=Math.atan2(dx,dz); const s=blocked(p,dx/d,dz/d)?0:Math.min(d,p.speed*dt), x=wrap.position.x, z=wrap.position.z, y=wrap.position.y;
          // 앞이 가구면 옆으로 비켜 돈다 : 덜 꺾어도 되는 쪽(p.side)을 골라 그 점까지는 그쪽으로 (35° 씩) — 그쪽이 다 막혀야 반대쪽
          // 이미 끼어 있거나(캡슐에서 나올 때) 3 초 동안 그 점에 가까워지지 않으면 예전처럼 그냥 간다 — 장면이 멈추지 않게
          if(d<p.best-.05){ p.best=d; p.nogo=0; } else p.nogo+=dt;
          if(s>0&&p.nogo<3&&!solidAt(x,z,y)){ const ok=a=>!solidAt(x+Math.sin(a)*Math.max(s,.12),z+Math.cos(a)*Math.max(s,.12),y), O=[.6,1.2,1.8,2.4];
            if(!ok(ang)){ if(!p.side){ const n=sd=>O.findIndex(o=>ok(ang+sd*o))>>>0; p.side=n(1)<=n(-1)?1:-1; } const k=O.find(o=>ok(ang+p.side*o));
              if(k!==undefined) ang+=p.side*k; else { p.side=-p.side; ang=null; } } }
          let df=Math.atan2(dx,dz)-wrap.rotation.y; if(ang!==null) df=ang-wrap.rotation.y; df=Math.atan2(Math.sin(df),Math.cos(df)); wrap.rotation.y+=df*Math.min(1,dt*6);
          if(ang!==null){ wrap.position.x+=Math.sin(ang)*s; wrap.position.z+=Math.cos(ang)*s; } }
        apart(p); }
      // 서 있는데 가구 속이면 (처음 놓인 자리 · 밀려난 자리) 가까운 빈자리로 미끄러져 나온다 — 앉음 · 동면 · 끌려가는 중 · 바닥보다 높은 곳(캡슐 안)은 빼고
      else if(SOLID.g&&!p.sleep&&p.pose!=='sit'&&p.mood!=='struggle'&&p.mood!=='crawl_back'&&wrap.parent&&Math.abs(wrap.position.y-floorAt(wrap.position.x,wrap.position.z))<.15){
        p.chk=(p.chk||0)-dt; if(p.chk<0){ p.chk=.5; p.out=solidAt(wrap.position.x,wrap.position.z,wrap.position.y)?freeNear(wrap.position.x,wrap.position.z,wrap.position.y):null; }
        if(p.out){ const k=Math.min(1,dt*4); wrap.position.x+=(p.out[0]-wrap.position.x)*k; wrap.position.z+=(p.out[1]-wrap.position.z)*k; } }
      // 동작이 많은 대원 : 한 번 하는 동작 > 이동(달리기 · 웅크려 걷기 · 절뚝 · 걷기) > 기분 > 말하기 손짓 > 쉬기 — 고른 것만 무게 1 로 서서히
      if(p.mixer&&!p.sleep&&p.acts.run){ const A=p.acts, has=n=>A[n]&&n;
        p.cur=p.once||(p.path?(p.speed>=2.4?has(p.armed&&'pistol_run')||'run':has(p.crouch&&'crouch')||has(p.hurt&&'limp')||'walk'):has(p.mood)||(p.talking&&p.pose!=='sit'&&has('talk'))||'idle');
        const k=Math.min(1,dt*6); for(const n in A){ const a=A[n], w=a.getEffectiveWeight(), t=n===p.cur?1:0; if(w!==t) a.setEffectiveWeight(Math.abs(t-w)<.01?t:w+(t-w)*k); }
        p.mixer.update(dt); }
      // 서 있으면 idle, 걸으면 walk 로 부드럽게 바꾼다 (쉬는 동작이 없는 모델은 걸을 때만 움직인다)
      else if(p.mixer&&!p.sleep){ p.mw+=((p.path?1:0)-p.mw)*Math.min(1,dt*5); if(p.walkA) p.walkA.setEffectiveWeight(p.mw); if(p.idleA) p.idleA.setEffectiveWeight(p.walkA?1-p.mw:1);
        if(p.idleA||p.mw>.01) p.mixer.update(dt); }
      const right=V().set(1,0,0).applyQuaternion(wrap.quaternion);      // 몸 기준 x 축 (월드) — 이 축으로 + 돌리면 앞으로 숙여진다
      // 숨쉬기 · 몸무게 옮기기
      if(!p.mixer){ turn(B.hip,up,Math.sin(p.ph*.35)*(p.pose==='sit'?.008:.025)); }
      turn(B.sp3,right,Math.sin(p.ph*1.6)*.012);
      // 시선 : lookAt 이 있으면 그쪽, 없으면 가까운 크리스 (몸 정면에서 ±70° 안)
      const hx=wrap.position.x, hz=wrap.position.z, T=p.lookAt||{x:P.x,y:P.y+P.eye,z:P.z}, dx=T.x-hx, dz=T.z-hz, fwd=wrap.rotation.y;
      let want=Math.atan2(dx,dz)-fwd; want=Math.atan2(Math.sin(want),Math.cos(want)); const near=(p.lookAt||Math.hypot(dx,dz)<6)&&p.watch&&!p.path;
      want=near&&!p.sleep?clamp(want,-1.2,1.2):0; p.look+=(want-p.look)*Math.min(1,dt*3);
      const wantP=near?clamp(Math.atan2(p.headY+(wrap.position.y)-T.y,Math.hypot(dx,dz)),-.45,.45):0; p.lookP+=(wantP-p.lookP)*Math.min(1,dt*3);
      turn(B.neck,up,p.look*.45); turn(B.head,up,p.look*.55); turn(B.head,right,p.lookP*.8);
      // 가리키기 : 오른팔을 목표 쪽으로 (pw 0→1 로 부드럽게)
      p.pw+=((p.pointAt?1:0)-p.pw)*Math.min(1,dt*3);
      if(p.pw>.01&&B.uaR&&B.laR&&B.hR){ const tgt=p.pointAt||p._lastPt; if(tgt){ p._lastPt=tgt; wrap.updateMatrixWorld(true);
        const q0=B.uaR.quaternion.clone(), q1=B.laR.quaternion.clone(); B.uaR.getWorldPosition(_a); const dir=V().copy(tgt).sub(_a).normalize();
        aim(B.uaR,B.laR,V().copy(dir).add(V().set(0,-.55,0))); aim(B.laR,B.hR,dir);
        B.uaR.quaternion.copy(q0.slerp(_s.copy(B.uaR.quaternion),p.pw)); B.laR.quaternion.copy(q1.slerp(_s.copy(B.laR.quaternion),p.pw)); } }
      // 총 (Sketchfab CC BY · web/assets/gun.glb — 손잡이가 원점 · 총구 +x · 위 +y) : p.armed 면 오른손 뼈에 붙여 보인다
      if(p.armed&&!p.gun&&B.hR){ p.gun=new THREE.Group(); B.hR.add(p.gun); gunP=gunP||loadGLB('gun');
        gunP.then(s=>{ const ws=B.hR.getWorldScale(V()).x; p.gun.add(s.clone()); p.gun.scale.setScalar(1/ws); p.gun.userData.ws=ws; gunFit(p.gun); }); }
      if(p.gun) p.gun.visible=!!p.armed;
      // 반동 : p.kick = .15 면 오른팔이 잠깐 튀어 오른다 (총 쏘기)
      if(p.kick>0){ p.kick-=dt; const k=Math.sin(Math.max(0,p.kick)/.15*Math.PI)*.3; turn(B.laR,right,-k); turn(B.hR,right,-k*.6); }
      // 말하기 : 턱 · 고개 끄덕임
      const tj=p.talking?(.06+.07*Math.abs(Math.sin(p.ph*11)*Math.sin(p.ph*4.3))):0; p.jaw+=(tj-p.jaw)*Math.min(1,dt*18);
      turn(B.jaw,right,p.jaw); if(p.talking) turn(B.head,right,Math.sin(p.ph*2.1)*.03);
      // 눈 깜빡임
      p.blinkT-=dt; if(p.blinkT<0){ p.blink=.14; p.blinkT=2+Math.random()*4; } if(p.blink>0){ p.blink-=dt; const k=Math.sin(Math.max(0,p.blink)/.14*Math.PI)*.45; turn(B.lidL,right,k); turn(B.lidR,right,k); }
    } }
  function clear(){ list.forEach(p=>p.wrap.parent&&p.wrap.parent.remove(p.wrap)); list.length=0; }
  function remove(p){ p.wrap.parent&&p.wrap.parent.remove(p.wrap); const i=list.indexOf(p); if(i>=0) list.splice(i,1); const j=INTER.findIndex(it=>it.mesh===p.pick); if(j>=0) INTER.splice(j,1); }
  // 걸어서 가기 (걷기 클립이 있는 모델은 다리가 움직인다) → 도착하면 Promise
  // 한 번 하는 동작 : 처음부터 n 번 → 끝나면 원래 동작으로 (그 동작이 없는 사람은 바로 끝)
  function act(p,n,{times=1}={}){ const a=p.acts&&p.acts[n]; if(!a) return Promise.resolve(); a.reset(); a.setLoop(THREE.LoopRepeat,Infinity); p.once=n;
    return new Promise(res=>setTimeout(()=>{ if(p.once===n) p.once=null; res(); },a.getClip().duration*times*1000)); }
  function walk(p,pts,speed=1.25){ return new Promise(res=>{ p.path=pts.map(a=>a.slice()); p.speed=speed; p.done=res; }); }
  // 사람에게 말 걸기 : 이름표 + 대화 함수
  function talkable(p,fn){ return interact(p.pick,'대화 · '+p.name+(p.role?' ('+p.role+')':''),fn,{range:3.2}); }
  return {spawn,tick,clear,remove,talkable,walk,act,list,inPlace,GUN,gunFit};
})();
