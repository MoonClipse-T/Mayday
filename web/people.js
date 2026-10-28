/* ============================================================
   PEOPLE : 실사 인물 (Renderpeople 무료 리깅 모델 · Sketchfab CC BY — web/assets/person_<kind>.glb)
   - 모델은 팔을 벌린 A 자세라서, 불러올 때 뼈를 돌려 팔을 내린 자세로 만든다 (뼈 방향을 '월드 방향'으로 맞추는 식이라 뼈 축을 몰라도 된다)
   - 움직임은 모두 뼈로 : 숨쉬기(가슴) · 몸무게 옮기기(골반) · 고개 돌려 크리스 보기(목 · 머리) · 눈 깜빡임(눈꺼풀) · 말할 때 턱
   - PEOPLE.spawn({kind,name,role,at}) → 사람 (talking = true 면 입이 움직인다)
   ============================================================ */
'use strict';
const PEOPLE=(()=>{
  const proto={}, list=[]; const V=()=>new THREE.Vector3(), Q=()=>new THREE.Quaternion();
  const _a=V(), _b=V(), _q=Q(), _p=Q(), _r=Q();
  async function load(kind){ if(!proto[kind]) proto[kind]=loadGLB('person_'+kind); return proto[kind]; }
  const bone=(g,re)=>{ let b=null; g.traverse(o=>{ if(!b&&o.isBone&&re.test(o.name)) b=o; }); return b; };
  // 뼈를 월드 방향 dir 로 향하게 (자식 뼈 쪽이 뼈 방향)
  function aim(b,child,dir){ b.updateWorldMatrix(true,false); child.updateWorldMatrix(true,false);
    b.getWorldPosition(_a); child.getWorldPosition(_b); _b.sub(_a).normalize(); _q.setFromUnitVectors(_b,dir.clone().normalize());
    b.getWorldQuaternion(_r); b.parent.getWorldQuaternion(_p); _r.premultiply(_q); b.quaternion.copy(_p.invert().multiply(_r)); b.updateWorldMatrix(false,true); }
  // 뼈를 월드 축 axis 둘레로 angle 만큼 더 돌린다 (부모가 먼저 돌아간 상태를 반영하도록 부모 행렬을 새로 구한다)
  function turn(b,axis,angle){ if(!b||!angle) return; b.parent.updateWorldMatrix(true,false); b.parent.getWorldQuaternion(_p);
    _q.setFromAxisAngle(axis,angle); _r.copy(_p).invert().multiply(_q).multiply(_p); b.quaternion.premultiply(_r); }

  async function spawn({kind,name,role='',at,face}){
    const src=await load(kind), g=THREE.SkeletonUtils.clone(src), wrap=new THREE.Group(); wrap.add(g); WORLD.add(wrap);
    g.traverse(o=>{ if(o.isMesh){ o.frustumCulled=false; if(o.material){ o.material.envMapIntensity=.6; } } });
    wrap.position.set(at.x,at.y||0,at.z); wrap.rotation.y=(face??at.yaw)-Math.PI;     // 모델은 블렌더 -y(=three +z)를 본다
    wrap.updateMatrixWorld(true);
    const B={hip:bone(g,/^hip_/),sp2:bone(g,/^spine_02/),sp3:bone(g,/^spine_03/),neck:bone(g,/^neck_/),head:bone(g,/^head_\d/),jaw:bone(g,/^jaw_\d/),
      lidL:bone(g,/^eyelid_l_\d/),lidR:bone(g,/^eyelid_r_\d/),
      uaL:bone(g,/^upperarm_l_\d/),laL:bone(g,/^lowerarm_l_\d/),hL:bone(g,/^hand_l_\d/),uaR:bone(g,/^upperarm_r_\d/),laR:bone(g,/^lowerarm_r_\d/),hR:bone(g,/^hand_r_\d/)};
    // 팔 내리기 : 몸 기준 방향 (x 몸의 왼쪽(+), y 위, z 앞) → 월드
    const toW=(x,y,z)=>new THREE.Vector3(x,y,z).applyQuaternion(wrap.quaternion);
    const side=s=>s==='L'?1:-1;
    for(const s of ['L','R']){ const k=side(s);      // 모델의 l 뼈 = 몸의 왼쪽 = 몸 기준 +x
      if(B['ua'+s]&&B['la'+s]) aim(B['ua'+s],B['la'+s],toW(k*.16,-1,.02));
      if(B['la'+s]&&B['h'+s]) aim(B['la'+s],B['h'+s],toW(k*.1,-1,.32)); }
    const base=new Map(); g.traverse(o=>{ if(o.isBone) base.set(o,o.quaternion.clone()); });
    // 키 · 머리 높이 (말 걸 때 시선)
    const hp=V(); (B.head||g).getWorldPosition(hp);
    // 탭 판정 원기둥
    const pk=new THREE.Mesh(new THREE.CylinderGeometry(.38,.38,1.9,10),PICK); pk.position.set(0,.95,0); wrap.add(pk);
    const p={kind,name,role,wrap,g,B,base,headY:hp.y-(at.y||0),talking:false,blinkT:1+Math.random()*3,blink:0,ph:Math.random()*10,look:0,lookP:0,jaw:0,pick:pk,watch:true};
    list.push(p); return p; }

  const up=new THREE.Vector3(0,1,0);
  function tick(dt){ for(const p of list){ const {B,wrap}=p; p.ph+=dt;
      p.base.forEach((q,b)=>b.quaternion.copy(q));
      const right=V().set(1,0,0).applyQuaternion(wrap.quaternion);      // 몸 기준 x 축 (월드) — 이 축으로 + 돌리면 앞으로 숙여진다
      // 숨쉬기 · 몸무게 옮기기
      turn(B.hip,up,Math.sin(p.ph*.35)*.025); turn(B.sp3,right,Math.sin(p.ph*1.6)*.012);
      // 크리스 쪽으로 고개 (몸 정면에서 ±70° 안)
      const hx=wrap.position.x, hz=wrap.position.z, dx=P.x-hx, dz=P.z-hz, fwd=wrap.rotation.y;
      let want=Math.atan2(dx,dz)-fwd; want=Math.atan2(Math.sin(want),Math.cos(want)); const near=Math.hypot(dx,dz)<6&&p.watch;
      want=near?clamp(want,-1.2,1.2):0; p.look+=(want-p.look)*Math.min(1,dt*3);
      const eyeY=P.y+P.eye, wantP=near?clamp(Math.atan2(p.headY+(wrap.position.y)-eyeY,Math.hypot(dx,dz)),-.4,.4):0; p.lookP+=(wantP-p.lookP)*Math.min(1,dt*3);
      turn(B.neck,up,p.look*.45); turn(B.head,up,p.look*.55); turn(B.head,right,p.lookP*.8);
      // 말하기 : 턱 · 고개 끄덕임
      const tj=p.talking?(.06+.07*Math.abs(Math.sin(p.ph*11)*Math.sin(p.ph*4.3))):0; p.jaw+=(tj-p.jaw)*Math.min(1,dt*18);
      turn(B.jaw,right,p.jaw); if(p.talking) turn(B.head,right,Math.sin(p.ph*2.1)*.03);
      // 눈 깜빡임
      p.blinkT-=dt; if(p.blinkT<0){ p.blink=.14; p.blinkT=2+Math.random()*4; } if(p.blink>0){ p.blink-=dt; const k=Math.sin(Math.max(0,p.blink)/.14*Math.PI)*.45; turn(B.lidL,right,k); turn(B.lidR,right,k); }
    } }
  function clear(){ list.forEach(p=>p.wrap.parent&&p.wrap.parent.remove(p.wrap)); list.length=0; }
  // 사람에게 말 걸기 : 이름표 + 대화 함수
  function talkable(p,fn){ return interact(p.pick,'대화 · '+p.name+(p.role?' ('+p.role+')':''),fn,{range:3.2}); }
  return {spawn,tick,clear,talkable,list};
})();
