/* ============================================================
   선체 밖 3인칭 (4.23 사용자 : 우주 밖에서는 내가 직접 움직인다) — scenes/belt.js 의 선외 활동에 끼운다
   몸 : 비행복 대원(person_seojun · Mixamo 뼈)을 흰 우주복으로 칠하고 헬멧 · 생명 유지 장치를 붙인다
   이동 : 무중력 — 추진기(W A S D · R/F 위아래 · 왼쪽 조이스틱)는 천천히 붙는 힘 · [점프] 는 잡은 곳을 박차고 보는 쪽으로
          [잡기] : 손이 닿는 손잡이를 잡는다 (오른팔을 뻗는다 · 그 자리에 몸이 붙는다) · 다시 누르면 놓는다
   안전줄 : 마지막으로 건 곳에서 10 m — 팽팽해지면 더 못 간다 · 배 겉면은 0.2 m 칸으로 막는다(복셀 · SOLID 일꾼)
   카메라 : 몸 뒤 3.4 m · 끌어서 둘레를 돈다 · 배에 막히면 당겨 온다
   목적지(손잡이 k)를 잡으면 1인칭으로 돌아가 하던 일(밸브 · 뽑기 · 숨기 · 해치)을 잇는다
   좌표는 모두 R-1 안의 좌표 g (BELT 와 같다)
   ============================================================ */
'use strict';
Object.assign(BELT,{
  TP:{R:.26, REACH:1.75, ROPE:10, ACC:1.7, DRAG:.85, JUMP:2.6, VMAX:2.6},
  // ---- 배 겉면 칸 (한 번만) ----
  vk(i,j,k){ return ((i+512)*1024+(j+512))*1024+(k+512); },
  async tpVox(){ if(this.vox) return; const rig=this.J.rig, q=rig.quaternion.clone(), p=rig.position.clone(); rig.quaternion.identity(); rig.position.set(0,0,0); rig.updateMatrixWorld(true);
    const pk=SOLID.pack([this.ext]); rig.quaternion.copy(q); rig.position.copy(p); rig.updateMatrixWorld(true); const c=await SOLID.run(pk), S=new Set();
    for(let t=0;t<c.length;t+=3) S.add(this.vk(Math.floor(c[t]/2),Math.floor(c[t+1]/4),Math.floor(c[t+2]/2))); this.vox=S; },
  occ(x,y,z,r){ const S=this.vox; if(!S) return false; const a=Math.floor((x-r)/.2), b=Math.floor((x+r)/.2), c=Math.floor((y-r)/.2), d=Math.floor((y+r)/.2), e=Math.floor((z-r)/.2), f=Math.floor((z+r)/.2), rr=(r+.08)**2;
    for(let i=a;i<=b;i++) for(let j=c;j<=d;j++) for(let k=e;k<=f;k++){ if(!S.has(this.vk(i,j,k))) continue; const dx=(i+.5)*.2-x, dy=(j+.5)*.2-y, dz=(k+.5)*.2-z; if(dx*dx+dy*dy+dz*dz<rr) return true; } return false; },
  // 몸 (발 원점) : 세 공
  bodyHit(p){ const r=this.TP.R; return this.occ(p.x,p.y+.35,p.z,r)||this.occ(p.x,p.y+.95,p.z,r)||this.occ(p.x,p.y+1.5,p.z,r); },

  // ---- 몸 ----
  async tpBody(){ if(this.tb&&this.tb.wrap.parent) return this.tb; const p=await PEOPLE.spawn({kind:'seojun',name:'',at:{x:0,z:0,yaw:0}}); p.watch=false; p.solid=false; p.pick.visible=false;
    const suit=new THREE.MeshStandardMaterial({color:0xe4e2dc,roughness:.78,metalness:0}), dark=new THREE.MeshStandardMaterial({color:0x3a3f45,roughness:.6,metalness:.3});
    p.g.traverse(o=>{ if(o.isMesh&&o!==p.pick){ o.material=suit; } });
    p.wrap.updateMatrixWorld(true); const hp=p.B.head.getWorldPosition(new THREE.Vector3()), ws=p.B.head.getWorldScale(new THREE.Vector3()).x;
    const hel=new THREE.Group(); hel.add(new THREE.Mesh(new THREE.SphereGeometry(.17,24,16),suit)); const vis=new THREE.Mesh(new THREE.SphereGeometry(.172,24,16,-1.1,2.2,1.05,1.0),new THREE.MeshStandardMaterial({color:0x1a2230,roughness:.12,metalness:.9,envMapIntensity:1.2})); vis.rotation.y=Math.PI; hel.add(vis); hel.position.copy(hp).add(new THREE.Vector3(0,.04,0)); WORLD.add(hel); p.B.head.attach(hel);
    const sp=p.B.sp3.getWorldPosition(new THREE.Vector3()), pack=new THREE.Mesh(new THREE.BoxGeometry(.38,.5,.2),suit), cap=new THREE.Mesh(new THREE.BoxGeometry(.3,.08,.16),dark); pack.position.copy(sp).add(new THREE.Vector3(0,.02,-.2)); cap.position.copy(pack.position).add(new THREE.Vector3(0,.29,0)); WORLD.add(pack,cap); p.B.sp3.attach(pack); p.B.sp3.attach(cap);
    p.wrap.traverse(o=>{ if(o.isMesh) o.frustumCulled=false; }); R1.g.add(p.wrap); p.wrap.visible=false; return this.tb=p; },

  // ---- 손잡이 ----
  handle(k){ const o=this.N('HR_0'+k), b=new THREE.Box3().setFromObject(o), inv=new THREE.Matrix4().copy(R1.g.matrixWorld).invert(); b.applyMatrix4(inv); const c=b.getCenter(V3()), n=k===0?V3(0,0,-1):k<3?V3(0,.6,-.8).normalize():V3(0,1,0); return {k,c,n}; },
  // 손잡이를 잡은 몸 자리 (발 원점) · 바라보는 쪽
  anchorAt(h){ const chest=h.k>=3?h.c.clone().add(V3(0,.95,.32)):h.c.clone().addScaledVector(h.n,.62).add(V3(0,-.1,0)), p=chest.sub(V3(0,1.15,0)); for(let i=0;i<14&&this.bodyHit(p);i++) p.addScaledVector(h.n,.1); return p; },      // 배에 끼지 않는 데까지 밖으로

  /* ---- 3인칭 한 구간 : 손잡이 k 를 잡을 때까지 (opt.hurry : 돌 무리 남은 초 · opt.tick 매 프레임) ---- */
  async tpLeg(k,text,opt={}){ await this.tpVox(); const p=await this.tpBody(), T=this.TP, w=p.wrap;
    // 1인칭 손을 치우고 · 몸을 지금 눈 자리에
    if(this.H) for(const s of ['R','L']){ const o=this.H[s]; o.on=false; HANDS.remove(o.h); } this.H=null;
    if(!this.tp){ this.tp={v:V3(0,0,0),yaw:P.yaw,pitch:-.25,grip:null,stick:[0,0],up:0}; if(opt.from!==undefined){ const h=this.handle(opt.from); w.position.copy(this.anchorAt(h)); this.tp.grip=h; this.tp.gk=1; this.tp.g0=w.position.clone(); } else w.position.set(P.x,Math.max(P.eye-1.45,-1),P.z); w.rotation.y=P.yaw+Math.PI; }
    w.visible=true; document.body.classList.add('tp'); const st=this.tp, tgt=this.handle(k);
    goal(text+' — '+byDevice('W A S D 추진 · R/F 위아래 · E 잡기 · 스페이스 박차기 · 끌기 둘러보기','왼쪽 끌기 추진 · [잡기] · [점프] · 오른쪽 끌기 둘러보기'));
    this.mark.position.copy(tgt.c); this.mark.visible=true;
    const ui=this.tpUI(), dist=ui.querySelector('.d');
    window.dragHook=(dx,dy)=>{ if(TALK.on) return; const kk=IS_TOUCH?.006:.0042; st.yaw-=dx*kk; st.pitch=clamp(st.pitch-dy*kk,-1.25,1.1); };
    const fwd=V3(0,0,0), rt=V3(0,0,0), up=V3(0,1,0), q=new THREE.Quaternion(), wq=new THREE.Quaternion(), cam=V3(0,0,0), aim=V3(0,0,0);
    // 카메라 : 몸 뒤 (배에 막히면 당겨 온다)
    const hook=()=>{ const tg=w.position.clone().add(V3(0,1.25,0)); const d=V3(Math.sin(st.yaw)*Math.cos(st.pitch),-Math.sin(st.pitch),Math.cos(st.yaw)*Math.cos(st.pitch)); let L=3.4; for(let s=.4;s<=3.4;s+=.12){ const c=tg.clone().addScaledVector(d,s); if(this.occ(c.x,c.y,c.z,.16)){ L=Math.max(.6,s-.2); break; } }
      cam.copy(tg).addScaledVector(d,L); R1.g.updateWorldMatrix(true,false); camera.position.copy(R1.g.localToWorld(cam.clone())); camera.up.set(0,1,0).applyQuaternion(R1.g.getWorldQuaternion(wq)); camera.lookAt(R1.g.localToWorld(tg.clone())); camera.up.set(0,1,0); };
    window.camHook=hook;
    let done=false, warnT=0, hint=0;
    const grab=()=>{ if(TALK.on||done) return; const chest=w.position.clone().add(V3(0,1.15,0));
      if(st.grip){ if(st.grip.k!==k&&tgt.c.distanceTo(chest)<T.REACH+.3){ st.grip=tgt; st.g0=w.position.clone(); st.gk=0; this.thud(.1); return; } st.grip=null; p.pointAt=null; this.thud(.06); return; }      // 잡은 채로 목적지에 손이 닿으면 옮겨 잡는다
      let best=null, bd=T.REACH;
        for(let j=0;j<10;j++){ const h=this.handle(j), d=h.c.distanceTo(chest)-(j===k?.6:0); if(d<bd){ bd=d; best=h; } }      // 손이 닿으면 목적지 손잡이부터
        if(!best){ toast('손이 닿는 손잡이가 없다 — 더 가까이',1300); return; }
        st.grip=best; st.v.set(0,0,0); st.g0=w.position.clone(); st.gk=0; this.thud(.1); SFX.play('cloth',{vol:.25}); };
    const jump=()=>{ if(TALK.on||done) return; if(!st.grip){ toast('잡은 곳이 없으면 박찰 수 없다 — 추진기로 움직인다',1500); return; } const d=V3(-Math.sin(st.yaw)*Math.cos(st.pitch),Math.sin(st.pitch),-Math.cos(st.yaw)*Math.cos(st.pitch)); st.grip=null; p.pointAt=null; st.v.copy(d.multiplyScalar(T.JUMP)); this.thud(.12); AUDIO.noise(.2,.06,0,900); };
    ui.querySelector('.grab').onpointerdown=e=>{ e.preventDefault(); e.stopPropagation(); grab(); }; ui.querySelector('.jump').onpointerdown=e=>{ e.preventDefault(); e.stopPropagation(); jump(); };
    ui.querySelectorAll('.ud button').forEach(b=>{ b.onpointerdown=e=>{ e.preventDefault(); e.stopPropagation(); st.up=+b.dataset.u; }; b.onpointerup=b.onpointerleave=b.onpointercancel=()=>st.up=0; });
    const kd=e=>{ if(e.repeat) return; if(e.code==='KeyE'){ e.stopImmediatePropagation(); grab(); } if(e.code==='Space'){ e.preventDefault(); e.stopImmediatePropagation(); jump(); } }; addEventListener('keydown',kd,true);
    // 왼쪽 조이스틱 (터치)
    const sk=ui.querySelector('.stk'), kn=sk.querySelector('i'); let sid=null, sx=0, sy=0;
    const pd=e=>{ if(e.pointerType!=='touch'||e.clientX>innerWidth*.45||sid!==null) return; e.stopImmediatePropagation(); sid=e.pointerId; sx=e.clientX; sy=e.clientY; sk.style.left=(sx-60)+'px'; sk.style.top=(sy-60)+'px'; sk.classList.add('on'); },
      pm=e=>{ if(e.pointerId!==sid) return; let dx=e.clientX-sx, dy=e.clientY-sy; const m=Math.hypot(dx,dy); if(m>55){ dx*=55/m; dy*=55/m; } st.stick=[dx/55,dy/55]; kn.style.transform=`translate(${dx}px,${dy}px)`; },
      pu=e=>{ if(e.pointerId!==sid) return; sid=null; st.stick=[0,0]; kn.style.transform=''; sk.classList.remove('on'); };
    canvas.addEventListener('pointerdown',pd,true); addEventListener('pointermove',pm); addEventListener('pointerup',pu); addEventListener('pointercancel',pu);
    S.phase='play'; P.free=false; P.look=false;
    await until(dt=>{ if(TALK.on) return false; const K=keys, live=S.phase==='play';
      // 보는 쪽 (카메라 기준)
      fwd.set(-Math.sin(st.yaw)*Math.cos(st.pitch),Math.sin(st.pitch),-Math.cos(st.yaw)*Math.cos(st.pitch)); rt.set(Math.cos(st.yaw),0,-Math.sin(st.yaw));
      let ix=(K.KeyD?1:0)-(K.KeyA?1:0)+st.stick[0], iz=(K.KeyW?1:0)-(K.KeyS?1:0)-st.stick[1], iy=(K.KeyR?1:0)-(K.KeyF?1:0)+st.up; const m=Math.hypot(ix,iz,iy); if(m>1){ ix/=m; iz/=m; iy/=m; }
      if(!live){ ix=iz=iy=0; }
      if(st.grip&&(ix||iz||iy)){ st.grip=null; p.pointAt=null; }
      if(st.grip){ // 잡은 손잡이로 몸이 끌려간다 · 팔을 뻗는다
        const to=this.anchorAt(st.grip); st.gk=Math.min(1,st.gk+dt*2.2); w.position.lerpVectors(st.g0,to,st.gk*st.gk*(3-2*st.gk)); st.v.set(0,0,0);
        aim.copy(st.grip.c); p.pointAt=R1.g.localToWorld(aim.clone()); const fy=Math.atan2(st.grip.c.x-w.position.x,st.grip.c.z-w.position.z); w.rotation.y+=Math.atan2(Math.sin(fy-w.rotation.y),Math.cos(fy-w.rotation.y))*Math.min(1,dt*5);
        if(st.grip.k===k&&st.gk>=1) done=true; }
      else { st.v.addScaledVector(fwd,iz*T.ACC*dt).addScaledVector(rt,ix*T.ACC*dt).addScaledVector(up,iy*T.ACC*dt); st.v.multiplyScalar(1-Math.min(1,dt*T.DRAG*(m>0?.25:1))); if(st.v.length()>T.VMAX) st.v.setLength(T.VMAX);
        if(m>.1){ this._th=(this._th||0)-dt; if(this._th<=0){ this._th=.35; AUDIO.noise(.18,.035,0,1800,'highpass'); } }
        // 움직이기 : 막히면 축마다 미끄러진다 (이미 끼어 있으면 덜 끼는 쪽만)
        const cur=w.position.clone(), stuck=this.bodyHit(cur), nx=cur.clone().addScaledVector(st.v,dt);
        if(!this.bodyHit(nx)||stuck) w.position.copy(nx); else { for(const a of ['x','y','z']){ const t=w.position.clone(); t[a]+=st.v[a]*dt; if(!this.bodyHit(t)) w.position.copy(t); else st.v[a]*=-.15; } }
        // 안전줄 : 마지막으로 건 곳에서 ROPE m
        const c=this.clips[this.clips.length-1]; if(c){ const d=w.position.clone().add(V3(0,1,0)).sub(c), L=d.length(); if(L>T.ROPE){ d.normalize(); w.position.addScaledVector(d,T.ROPE-L); const vr=st.v.dot(d); if(vr>0) st.v.addScaledVector(d,-vr*1.2); warnT-=dt; if(warnT<=0){ warnT=2; toast('안전줄이 팽팽하다',1100); this.thud(.08); } } }
        // 몸 방향 : 움직이는 쪽 (없으면 카메라 쪽)
        const hv=V3(st.v.x,0,st.v.z), fy=hv.length()>.2?Math.atan2(hv.x,hv.z):st.yaw+Math.PI; w.rotation.y+=Math.atan2(Math.sin(fy-w.rotation.y),Math.cos(fy-w.rotation.y))*Math.min(1,dt*3);
        w.rotation.x=lerp(w.rotation.x,clamp(-st.v.dot(fwd)*.12,-.25,.25),Math.min(1,dt*3)); }
      // 떠 있는 몸이 천천히 흔들린다
      p.g.position.y=Math.sin(S.t*.9)*.015;
      this.ropeEnd=w.position.clone().add(V3(0,.95,0));
      // 목적지까지 · 닿는 손잡이가 있으면 [잡기] 가 빛난다
      const chest=w.position.clone().add(V3(0,1.15,0)), D=chest.distanceTo(tgt.c); dist.textContent=D.toFixed(1)+' m'; let near=false; for(let j=0;j<10&&!near;j++) near=this.handle(j).c.distanceTo(chest)<T.REACH; ui.querySelector('.grab').classList.toggle('want',near&&!st.grip); ui.querySelector('.grab').textContent=st.grip?'놓기':'잡기';
      hint+=dt; if(hint>40&&D>3){ hint=-30; toast(byDevice('빛나는 고리 쪽으로 — W 로 추진하거나, 손잡이를 잡고 스페이스로 박찬다','빛나는 고리 쪽으로 — 왼쪽을 끌어 추진하거나, 손잡이를 잡고 [점프]'),3200); }
      opt.tick&&opt.tick(dt,st); return done; });
    // 끝 : 1인칭으로 (몸을 감추고 손을 다시)
    removeEventListener('keydown',kd,true); canvas.removeEventListener('pointerdown',pd,true); removeEventListener('pointermove',pm); removeEventListener('pointerup',pu); removeEventListener('pointercancel',pu);
    ui.classList.remove('on'); this.mark.visible=false; goal(''); this.ropeEnd=null; return st.grip; },
  // 3인칭을 끝내고 손잡이 k 의 1인칭 자리로 (BELT.node)
  async tpEnd(k){ const p=this.tb, st=this.tp; S.phase='cut'; document.body.classList.remove('tp'); if(p){ p.wrap.visible=false; p.pointAt=null; } this.tp=null;
    window.camHook=this.fpHook; const n=this.node(k); Object.assign(P,{x:n.x,z:n.z,eye:n.eye,yaw:n.yaw,pitch:n.pitch}); this.look(); this.hands(); await this.hold('R',k,.2); await this.hold('L',k,.2); this.last='L'; this.atK=k; },
  tpUI(){ let e=$('#evaui'); if(!e){ e=document.createElement('div'); e.id='evaui'; e.innerHTML='<p class="d"></p><div class="ud"><button data-u="1" aria-label="위로">▲</button><button data-u="-1" aria-label="아래로">▼</button></div><button class="jump">점프</button><button class="grab">잡기</button><div class="stk"><i></i></div>'; document.body.appendChild(e); } e.classList.add('on'); return e; },
});
