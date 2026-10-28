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
     PEOPLE.walk(p,[[x,z],…],speed) → 걸어서 간다 (걷기 클립이 있는 모델만 다리가 움직인다)
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

  async function spawn({kind,name,role='',at,face,pose='stand',seatY=.47,clip=null}){
    const src=await load(kind), g=THREE.SkeletonUtils.clone(src), wrap=new THREE.Group(); wrap.add(g); WORLD.add(wrap);
    g.traverse(o=>{ if(o.isMesh){ o.frustumCulled=false; if(o.material){ o.material.envMapIntensity=.6; } } });
    wrap.position.set(at.x,at.y||0,at.z); wrap.rotation.y=(face??at.yaw)-Math.PI;     // 모델은 블렌더 -y(=three +z)를 본다
    wrap.updateMatrixWorld(true);
    const B={}; for(const k in RE) B[k]=bone(g,RE[k]);
    const clips=src.userData.animations||[]; let mixer=null, idleA=null, walkA=null;
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
    } else {
      for(const s of ['L','R']){ const k=side(s);      // 팔 내리기 (모델의 l 뼈 = 몸의 왼쪽 = 몸 기준 +x)
        aim(B['ua'+s],B['la'+s],toW(k*.16,-1,.02)); aim(B['la'+s],B['h'+s],toW(k*.1,-1,.32)); }
      if(clips.length&&clip!==false){
        mixer=new THREE.AnimationMixer(g);
        // 동작 고르기 : 이름에 walk · idle 이 있으면 그것 (Tripo), 하나뿐이면 nathan 은 걷기 · 나머지는 서서 쉬기
        const walkC=clips.find(c=>/walk/i.test(c.name))||(kind==='nathan'?clips[0]:null), idleC=clips.find(c=>/idle/i.test(c.name))||(clips[0]!==walkC?clips[0]:null);
        // 제자리 동작으로 : 뿌리 · 골반 이동 중 한쪽으로 계속 나가는 축(걷기의 앞)을 첫 값에 묶는다 → 몸은 엔진이 옮긴다
        const play=c0=>{ if(!c0) return null; const c=c0.clone(); c.tracks.forEach(t=>{ if(!/position$/.test(t.name)) return; const v=t.values, n=v.length/3;
          for(let ax=0;ax<3;ax++){ let lo=1e9,hi=-1e9; for(let i=0;i<n;i++){ lo=Math.min(lo,v[i*3+ax]); hi=Math.max(hi,v[i*3+ax]); }
            if(Math.abs(v[(n-1)*3+ax]-v[ax])>(hi-lo)*.5&&hi-lo>1e-4) for(let i=0;i<n;i++) v[i*3+ax]=v[ax]; } });
          const a=mixer.clipAction(c); a.play(); a.time=Math.random()*c.duration; return a; };
        idleA=play(idleC); walkA=play(walkC); if(walkA) walkA.setEffectiveWeight(0);
      }
    }
    wrap.updateMatrixWorld(true);
    const base=new Map(); g.traverse(o=>{ if(o.isBone) base.set(o,o.quaternion.clone()); });
    const hp=V(); g.updateMatrixWorld(true); (B.head||g).getWorldPosition(hp);
    // 탭 판정 원기둥
    const pk=new THREE.Mesh(new THREE.CylinderGeometry(.38,.38,pose==='sit'?1.4:1.9,10),PICK); pk.position.set(0,pose==='sit'?.7-(wrap.position.y-(at.y||0)):.95,0); wrap.add(pk);
    const p={kind,name,role,wrap,g,B,base,mixer,idleA,walkA,mw:0,pose,headY:hp.y-(at.y||0),talking:false,blinkT:1+Math.random()*3,blink:0,ph:Math.random()*10,look:0,lookP:0,jaw:0,pick:pk,watch:true,
      pointAt:null,pw:0,lookAt:null,path:null,speed:1.25};
    list.push(p); return p; }

  const up=new THREE.Vector3(0,1,0);
  function tick(dt){ for(const p of list){ const {B,wrap}=p; p.ph+=dt;
      p.base.forEach((q,b)=>b.quaternion.copy(q));
      // 걷기 : 다음 점으로 몸을 돌리며 나간다
      if(p.path&&p.path.length){ const [tx,tz]=p.path[0], dx=tx-wrap.position.x, dz=tz-wrap.position.z, d=Math.hypot(dx,dz);
        if(d<.08){ p.path.shift(); if(!p.path.length){ p.path=null; p.done&&p.done(); } }
        else { const want=Math.atan2(dx,dz); let df=want-wrap.rotation.y; df=Math.atan2(Math.sin(df),Math.cos(df)); wrap.rotation.y+=df*Math.min(1,dt*6);
          const s=Math.min(d,p.speed*dt); wrap.position.x+=dx/d*s; wrap.position.z+=dz/d*s; } }
      // 서 있으면 idle, 걸으면 walk 로 부드럽게 바꾼다 (쉬는 동작이 없는 모델은 걸을 때만 움직인다)
      if(p.mixer){ p.mw+=((p.path?1:0)-p.mw)*Math.min(1,dt*5); if(p.walkA) p.walkA.setEffectiveWeight(p.mw); if(p.idleA) p.idleA.setEffectiveWeight(p.walkA?1-p.mw:1);
        if(p.idleA||p.mw>.01) p.mixer.update(dt); }
      const right=V().set(1,0,0).applyQuaternion(wrap.quaternion);      // 몸 기준 x 축 (월드) — 이 축으로 + 돌리면 앞으로 숙여진다
      // 숨쉬기 · 몸무게 옮기기
      if(!p.mixer){ turn(B.hip,up,Math.sin(p.ph*.35)*(p.pose==='sit'?.008:.025)); }
      turn(B.sp3,right,Math.sin(p.ph*1.6)*.012);
      // 시선 : lookAt 이 있으면 그쪽, 없으면 가까운 크리스 (몸 정면에서 ±70° 안)
      const hx=wrap.position.x, hz=wrap.position.z, T=p.lookAt||{x:P.x,y:P.y+P.eye,z:P.z}, dx=T.x-hx, dz=T.z-hz, fwd=wrap.rotation.y;
      let want=Math.atan2(dx,dz)-fwd; want=Math.atan2(Math.sin(want),Math.cos(want)); const near=(p.lookAt||Math.hypot(dx,dz)<6)&&p.watch&&!p.path;
      want=near?clamp(want,-1.2,1.2):0; p.look+=(want-p.look)*Math.min(1,dt*3);
      const wantP=near?clamp(Math.atan2(p.headY+(wrap.position.y)-T.y,Math.hypot(dx,dz)),-.45,.45):0; p.lookP+=(wantP-p.lookP)*Math.min(1,dt*3);
      turn(B.neck,up,p.look*.45); turn(B.head,up,p.look*.55); turn(B.head,right,p.lookP*.8);
      // 가리키기 : 오른팔을 목표 쪽으로 (pw 0→1 로 부드럽게)
      p.pw+=((p.pointAt?1:0)-p.pw)*Math.min(1,dt*3);
      if(p.pw>.01&&B.uaR&&B.laR&&B.hR){ const tgt=p.pointAt||p._lastPt; if(tgt){ p._lastPt=tgt; wrap.updateMatrixWorld(true);
        const q0=B.uaR.quaternion.clone(), q1=B.laR.quaternion.clone(); B.uaR.getWorldPosition(_a); const dir=V().copy(tgt).sub(_a).normalize();
        aim(B.uaR,B.laR,V().copy(dir).add(V().set(0,-.55,0))); aim(B.laR,B.hR,dir);
        B.uaR.quaternion.copy(q0.slerp(_s.copy(B.uaR.quaternion),p.pw)); B.laR.quaternion.copy(q1.slerp(_s.copy(B.laR.quaternion),p.pw)); } }
      // 말하기 : 턱 · 고개 끄덕임
      const tj=p.talking?(.06+.07*Math.abs(Math.sin(p.ph*11)*Math.sin(p.ph*4.3))):0; p.jaw+=(tj-p.jaw)*Math.min(1,dt*18);
      turn(B.jaw,right,p.jaw); if(p.talking) turn(B.head,right,Math.sin(p.ph*2.1)*.03);
      // 눈 깜빡임
      p.blinkT-=dt; if(p.blinkT<0){ p.blink=.14; p.blinkT=2+Math.random()*4; } if(p.blink>0){ p.blink-=dt; const k=Math.sin(Math.max(0,p.blink)/.14*Math.PI)*.45; turn(B.lidL,right,k); turn(B.lidR,right,k); }
    } }
  function clear(){ list.forEach(p=>p.wrap.parent&&p.wrap.parent.remove(p.wrap)); list.length=0; }
  function remove(p){ p.wrap.parent&&p.wrap.parent.remove(p.wrap); const i=list.indexOf(p); if(i>=0) list.splice(i,1); const j=INTER.findIndex(it=>it.mesh===p.pick); if(j>=0) INTER.splice(j,1); }
  // 걸어서 가기 (걷기 클립이 있는 모델은 다리가 움직인다) → 도착하면 Promise
  function walk(p,pts,speed=1.25){ return new Promise(res=>{ p.path=pts.map(a=>a.slice()); p.speed=speed; p.done=res; }); }
  // 사람에게 말 걸기 : 이름표 + 대화 함수
  function talkable(p,fn){ return interact(p.pick,'대화 · '+p.name+(p.role?' ('+p.role+')':''),fn,{range:3.2}); }
  return {spawn,tick,clear,remove,talkable,walk,list};
})();
