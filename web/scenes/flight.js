/* ============================================================
   구조정 R-1 비행 · 도킹 (4.2) — 내가 몬다
   ① 웜홀을 막 지난 자리(1호까지 650 m)에서 직접 몰고 간다 : 1호는 진짜 3D 물체 — 둘레를 돌며 볼 수 있다 · 부딪히면 튕긴다
      우주는 그림이 아니게 : 둘레의 먼지(움직이면 스쳐 지나간다) · 1호에서 떨어져 나온 파편 · 먼 별 하나(해) · 행성 없음
      1호는 죽은 배 : 전력 0 — 불빛이 하나도 없다. 어두운 면은 먼 해에 가장자리만 보이고, 고리는 구조정 전조등이 비춰야 드러난다
   ② 도킹 (인터스텔라처럼) : 1호는 긴 축을 중심으로 천천히 돈다 → 뱃머리 도킹 고리에 축을 맞추고 · 같은 빠르기로 돌고(롤) · 표시 셋을 맞추고 · 천천히 닿는다
   ③ 잠김 → 회전 동기화(이제 우주가 돈다) → 기압 → 앞 해치 → 연결 통로를 지나 1호 에어록으로
   조작 (4.4 · 키보드와 화면 단추 둘 다) : 이동 ↑↓←→ = R/F/A/D · [전진][후진] = W/S · 화면 끌기(또는 방향키) = 기수 · [롤 ◀][롤 ▶] = Q/E · [정지] = X
   쉽게 (4.4) : 대화 중에는 저절로 멈춘다 · 1호 가까이에선 저절로 속도를 줄인다 · 도킹 중엔 옆으로 미끄러지지 않는다(자세 유지)
         회전이 1호와 같아지면 '회전 고정' — 그 뒤 롤 단추는 표시만 밀어 맞춘다 · 해야 할 조작 단추가 빛난다 · 한 번 실패하면 도킹 보조
   ============================================================ */
'use strict';
const FLIGHT={W:.12,               // 1호 자전 (rad/s ≈ 6.9°/s)
  async run({journey=false}={}){ const self=this; S.phase='cut'; P.free=false; LEVEL.clear(); goal('');
    stamp('구조정 R-1 · 조종석','2091.07 · 웜홀 통과 +00:04');
    SHIP.preload();                                            // 1호 안은 나는 동안 화면 뒤에서 풀어 둔다
    const hull=await loadGLB('ship_ext');
    await SKY.space({dir:[.1,.08,-1],R:.1,srot:2.4,jupiter:false,sunDir:[-.55,.4,.75]});      // 웜홀은 등 뒤 · 행성 없음
    scene.background=new THREE.Color(0x000000);
    WORLD.add(new THREE.HemisphereLight(0x6f7f99,0x050607,.045));
    const sunDir=new THREE.Vector3(-.55,.4,.75).normalize(), sun=new THREE.DirectionalLight(0xfff0dc,1.15); sun.position.copy(sunDir).multiplyScalar(500); WORLD.add(sun);
    this.sunSprite(sunDir);
    /* ---- 1호 : 실제 크기(길이 약 140 m) · 긴 축(z)을 중심으로 돈다 · 뱃머리(−z)에 도킹 고리 ---- */
    const G=this.G=new THREE.Group(); WORLD.add(G); hull.scale.setScalar(3); G.add(hull);
    hull.traverse(o=>{ if(o.isMesh){ o.material=o.material.clone(); if(o.material.color) o.material.color.multiplyScalar(.4); if(o.material.emissive) o.material.emissive.setRGB(0,0,0); } });
    G.updateMatrixWorld(true); const hb=new THREE.Box3().setFromObject(hull); this.hb=hb.clone();
    const zf=hb.min.z, port=this.port=new THREE.Group(); port.position.set(0,0,zf-2.2); G.add(port); this.buildPort(port,zf);
    this.debris(hb); this.dust();
    /* ---- 나 : 구조정 R-1 (scenes/r1.js — 조종석 · 로비 · 해치 방, 앞 = +z) ----
       rig = 조종하는 몸(기수 = +z) · 그 안의 R-1 묶음 g. 도킹 때는 g 만 반 바퀴 돌려 뒤(외부 해치)를 앞으로 — 조종 계산은 그대로 */
    const rig=this.rig=new THREE.Group(); WORLD.add(rig); const g=await R1.mount(rig);
    const dash=new THREE.PointLight(0x7fd4ff,.7,2.4,2); dash.position.set(0,.85,-.55); g.add(dash);
    // 전조등 : 1호는 스스로 빛나지 않는다 — 내 빛이 닿는 데만 보인다 (앞 = +z)
    const lamp=new THREE.SpotLight(0xe8f0ff,1.5,190,.3,.6,1.15); lamp.position.set(0,.2,1.6); lamp.target.position.set(0,0,40); rig.add(lamp,lamp.target);
    this.stick=this.pivot(R1.b.root,'steering'); this.throttle=this.pivot(R1.b.root,'throttle');
    rig.position.set(18,9,zf-640); rig.lookAt(0,0,zf);      // 물체의 lookAt 은 +z 를 목표로 — 이 모델도 +z 가 앞
    this.v=new THREE.Vector3(); this.av=new THREE.Vector3(); this.head={y:0,p:-.04}; this.fails=0; this.docked=false; this.assist=false; this.sync=false; this.mode=null; this.want=new Set();
    this.helm=true; this.aftcam=false; this.nose=0; document.body.classList.remove('aftcam');
    window.dragHook=null;
    TICK.push(this.fn=dt=>this.tick(dt)); MUSIC.play('space',{fade:4});
    this.ui(true);
    await fade(false,2200); $('#fade').style.background='';
    await card('웜홀 건너편 · NGC 3500','MAYDAY','지구를 떠난 지 넉 달 · 1호가 끊긴 지 열한 달',3600);
    S.phase='play'; P.free=true; P.look=false;
    // 여정에서 이어지면(목성 → 웜홀) 이미 깨어 있다 · 바로 가기(?s=cockpit)면 동면에서 깬다
    await TALK.say(journey?[VG('웜홀 통과 완료. 선체 이상 없음. 크리스, 괜찮습니까?'),I('…괜찮아. 별은 그대로인데, 아는 별이 하나도 없다.'),VG('하위헌스 1호의 마지막 녹음을 다시 재생합니다.')]
      :[VG('동면 해제 완료. 웜홀 통과 완료. 선체 이상 없음. 크리스, 들립니까?'),I('…들린다. 넉 달 잤는데 어제 회의실에 있던 것 같군.'),VG('하위헌스 1호의 마지막 녹음을 다시 재생합니다.')]);
    AUDIO.radio(5); await TALK.say([RADIO('…여기는 하위헌스 1호… 대원 열두 명 중… 우리는 지금…'),RADIO('Mayday, Mayday, we are—')]);
    await TALK.say([VG('1호 확인. 앞쪽 640 m. 불빛 없음. 열 반응 없음. 생명 신호… 하나.'),I('하나. …엘레나가 말한 레아 문일까.'),
      VG('1호가 긴 축을 중심으로 돌고 있습니다. 약 7초에 한 바퀴의 8분의 1. 무언가에 부딪혀 자세 제어를 잃은 것 같습니다.'),
      VG(byDevice('조종은 선장님께 넘깁니다. W 전진 · 화면을 끌어(또는 방향키) 기수 · X 정지. 1호 뱃머리의 도킹 고리로 가십시오.','조종은 선장님께 넘깁니다. [전진] · 화면을 끌어 기수 · [정지]. 1호 뱃머리의 도킹 고리로 가십시오.'),'조종은 선장님께 넘깁니다. W 전진 · 끌기로 기수 · X 감속. 1호 뱃머리의 도킹 고리로 가십시오.')]);
    goal(byDevice('1호 도킹 고리로 — W 전진 · 끌어서 기수','1호 도킹 고리로 — [전진] · 끌어서 기수'));
    await new Promise(r=>this.onNear=r);
    // R-1 의 도킹 해치는 뒤쪽 : VEGA 가 배를 돌리는 동안 해치 방의 후방 도킹 조종대로 걸어간다 → 뒤 카메라를 보며 도킹
    this.helm=false;
    await TALK.say([VG('도킹 고리 앞 60 m. 도킹 절차를 시작합니다.'),VG('R-1 의 도킹 해치는 뒤쪽입니다. 제가 배를 돌려 뒤를 1호에 대겠습니다.'),VG('해치 방의 후방 도킹 조종대로 가 주십시오. 거기서 뒤 카메라를 보며 모십니다.')]);
    await R1.stand(this.head); this.turn();
    await R1.task('aft','해치 방(맨 뒤) — 후방 도킹 조종대로');
    if(!this.turned.done){ goal('배를 돌리는 중…'); await this.turned; }
    S.phase='cut'; P.free=false; goal(''); await camTo({x:.62,z:-10.62,yaw:-Math.PI/2,pitch:-.12,eye:1.5},.8);
    AUDIO.tone(660,.1,'square',.04); AUDIO.noise(.4,.08,0,2400); this.aftcam=true; document.body.classList.add('aftcam'); this.ui(true); this.helm=true; S.phase='play';
    await TALK.say([VG('후방 카메라 연결. 이제 뒤가 앞입니다.'),VG('① 축 맞추기 · ② 회전 맞추기 · ③ 표시 맞추기 · ④ 천천히 닿기. 지금 눌러야 할 단추가 빛납니다.','① 1호의 긴 축에 맞춰 일직선으로 · ② Q/E 로 1호와 같은 빠르기로 돌고 · ③ 고리의 주황 표시 셋을 화면의 표시에 맞춘 뒤 · ④ 초속 0.8 m 보다 느리게 닿으십시오.'),
      I('…돌아가는 문에 맞춰 들어간다.')]);
    goal('도킹 — 빛나는 단추를 따라 한 단계씩');
    this.mode='dock'; await new Promise(r=>this.onDock=r);
    await this.board(); },
  // 배 돌리기 : 조종하는 몸(rig)은 그대로 1호를 보고, R-1 만 반 바퀴 — 끝나면 외부 해치가 앞(1호 쪽)
  turn(){ const g=R1.g; let k=0, th=0; this.turned=new Promise(res=>{ const f=dt=>{ k=Math.min(1,k+dt/9); g.rotation.y=Math.PI*k*k*(3-2*k); th-=dt; if(k<1&&th<=0){ th=.7; SFX.play('thruster',{vol:.5}); }
      if(k>=1){ TICK.splice(TICK.indexOf(f),1); this.nose=R1.NOSE; this.turned.done=true; toast('배 돌리기 완료 — 외부 해치가 1호 쪽',2200); res(); } }; TICK.push(f); }); },
  // 도킹 기준점 : 보통은 조종하는 몸의 자리 · 돌린 뒤에는 외부 해치(기수 쪽으로 NOSE m)
  dockPt(){ const p=this.rig.position.clone(); if(this.nose) p.addScaledVector(new THREE.Vector3(0,0,1).applyQuaternion(this.rig.getWorldQuaternion(new THREE.Quaternion())),this.nose); return p; },

  /* ---- 장면 만들기 ---- */
  sunSprite(d){ const cv=document.createElement('canvas'); cv.width=cv.height=256; const g=cv.getContext('2d'), gr=g.createRadialGradient(128,128,0,128,128,128);
    gr.addColorStop(0,'#fff'); gr.addColorStop(.08,'rgba(255,244,220,.95)'); gr.addColorStop(.3,'rgba(255,200,140,.18)'); gr.addColorStop(1,'rgba(0,0,0,0)'); g.fillStyle=gr; g.fillRect(0,0,256,256);
    const sp=new THREE.Sprite(new THREE.SpriteMaterial({map:new THREE.CanvasTexture(cv),depthWrite:false,blending:THREE.AdditiveBlending,fog:false,toneMapped:false})); sp.scale.setScalar(110); sp.renderOrder=-1; WORLD.add(sp);
    TICK.push(()=>sp.position.copy(camera.position).addScaledVector(d,900)); },
  // 도킹 고리 : 고리 · 안쪽 해치 · 목(선체로 이어짐) · 주황 표시 셋(롤을 맞추는 기준 — 칠이라 전조등을 받아야 보인다)
  buildPort(port,zf){ const metal=new THREE.MeshStandardMaterial({color:0x6a7076,metalness:.5,roughness:.6}), dark=new THREE.MeshStandardMaterial({color:0x1d2126,metalness:.3,roughness:.8});
    const ring=new THREE.Mesh(new THREE.TorusGeometry(1.9,.28,16,48),metal); port.add(ring);
    const disc=new THREE.Mesh(new THREE.CircleGeometry(1.7,40),dark); disc.position.z=.12; disc.rotation.y=Math.PI; port.add(disc);
    const neck=new THREE.Mesh(new THREE.CylinderGeometry(2.1,2.4,6,24,1,true),metal); neck.rotation.x=Math.PI/2; neck.position.z=3.2; port.add(neck);
    const plate=new THREE.Mesh(new THREE.CylinderGeometry(3.4,3.4,.4,32),dark); plate.rotation.x=Math.PI/2; plate.position.z=6; port.add(plate);
    const orange=new THREE.MeshStandardMaterial({color:0xff7a2a,roughness:.5,metalness:0,emissive:0x1c0a02}); this.marks=[];
    for(let k=0;k<3;k++){ const a=k*Math.PI*2/3, m=new THREE.Mesh(new THREE.ConeGeometry(.28,.6,3),orange); m.position.set(Math.sin(a)*2.45,Math.cos(a)*2.45,-.05); m.rotation.z=-a; port.add(m); this.marks.push(m); } },
  // 파편 : 1호에서 떨어져 나온 조각들 (천천히 돌며 떠 있다)
  debris(hb){ const mat=new THREE.MeshStandardMaterial({color:0x5a6068,metalness:.7,roughness:.5}), mat2=new THREE.MeshStandardMaterial({color:0x2a2e33,metalness:.5,roughness:.7}); this.deb=[];
    for(let i=0;i<46;i++){ const big=Math.random()<.25, geo=Math.random()<.5?new THREE.BoxGeometry(1,.08+Math.random()*.3,.6+Math.random()):new THREE.DodecahedronGeometry(.5,0);
      const m=new THREE.Mesh(geo,Math.random()<.6?mat:mat2), s=(big?2.5:.4)+Math.random()*(big?3:1.2); m.scale.set(s*(.6+Math.random()),s*(.6+Math.random()),s*(.6+Math.random()));
      const a=Math.random()*6.28, r=50+Math.random()*170, z=hb.min.z-30-Math.random()*380; m.position.set(Math.cos(a)*r,Math.sin(a)*r*.6,z*(Math.random()<.5?1:-.4));
      m.userData.w=new THREE.Vector3(Math.random()-.5,Math.random()-.5,Math.random()-.5).multiplyScalar(.4); m.userData.v=new THREE.Vector3(Math.random()-.5,Math.random()-.5,Math.random()-.5).multiplyScalar(.3); WORLD.add(m); this.deb.push(m); } },
  // 먼지 : 내 둘레 80 m 상자 안에 — 움직이면 스쳐 지나간다 (상자 밖으로 나가면 반대편으로)
  dust(){ const N=LITE?700:1400, pos=new Float32Array(N*3); for(let i=0;i<N*3;i++) pos[i]=(Math.random()-.5)*80;
    const g=new THREE.BufferGeometry(); g.setAttribute('position',new THREE.BufferAttribute(pos,3));
    const pts=new THREE.Points(g,new THREE.PointsMaterial({color:0xb8c4d6,size:.07,sizeAttenuation:true,transparent:true,opacity:.55,depthWrite:false})); pts.frustumCulled=false; WORLD.add(pts); this.dustPts=pts; },
  // 조종간 · 추력 손잡이 : 제자리에서 기울도록 가운데에 축을 둔다
  pivot(root,name){ let m=null; root.traverse(o=>{ if(o.isMesh&&o.name.startsWith(name)) m=o; }); if(!m) return null;
    root.updateMatrixWorld(true); const c=new THREE.Box3().setFromObject(m).getCenter(new THREE.Vector3()), piv=new THREE.Group(); m.parent.add(piv); m.parent.worldToLocal(c); piv.position.copy(c); piv.attach(m); return piv; },

  /* ---- 조작 화면 : 계기 · 도킹 단계판 · 화면 단추 (터치 · 마우스 모두 — 키보드도 그대로) ---- */
  KEYS:{up:'R',down:'F',left:'A',right:'D',fwd:'W',back:'S',rl:'Q',rr:'E',brake:'X'},
  ui(on){ let el=$('#flight'); if(!el){ el=document.createElement('div'); el.id='flight';
      const B=(k,t)=>`<button data-k="${k}">${t}${IS_TOUCH?'':`<small>${this.KEYS[k]}</small>`}</button>`;
      el.innerHTML=`<div class="hud"><p class="d"></p><p class="s"></p><p class="w"></p></div>
      <div class="bracket"><i></i><i></i><i></i><i></i><b></b></div><div class="nose"><i></i><span>끌기</span></div>
      <div class="dock"><svg viewBox="-100 -100 200 200"><circle r="70" class="o"/><g class="m"></g><g class="tgt"><circle r="10"/></g><line x1="-90" y1="0" x2="-20" y2="0"/><line x1="20" y1="0" x2="90" y2="0"/><line x1="0" y1="-90" x2="0" y2="-20"/><line x1="0" y1="20" x2="0" y2="90"/></svg>
        <div class="panel"><ol class="steps"><li>축</li><li>회전</li><li>표시</li><li>접근</li></ol><p class="now"></p>
        <table><tr><th></th><th>지금</th><th>목표</th></tr>${[['lat','축 어긋남','1 m 안'],['ang','기수 각','7° 안'],['rr','회전 빠르기 차','고정'],['ra','표시 어긋남','±12°'],['cv','접근 속도','1.2 m/s 아래'],['dd','고리까지','4 m 에서 판정']].map(([k,n,g])=>`<tr><td>${n}</td><td class="${k} v"></td><td class="g">${g}</td></tr>`).join('')}</table></div></div>
      <div class="pads"><div class="move"><span>이동</span>${B('up','↑')}${B('left','←')}${B('right','→')}${B('down','↓')}</div>
        <div class="act">${B('fwd','전진')}${B('back','후진')}${B('rl','롤 ◀')}${B('rr','롤 ▶')}${B('brake','정지')}</div></div>`; document.body.appendChild(el);
      el.querySelectorAll('.pads button').forEach(b=>{ const k=b.dataset.k; b.addEventListener('pointerdown',e=>{ e.stopPropagation(); e.preventDefault(); FLIGHT.btn[k]=true; b.classList.add('on'); });
        ['pointerup','pointerleave','pointercancel'].forEach(t=>b.addEventListener(t,()=>{ FLIGHT.btn[k]=false; b.classList.remove('on'); })); }); }
    el.classList.toggle('on',on); document.body.classList.toggle('flying',on); if(!on) this.btn={};
    window.dragHook=on?(dx,dy)=>{ if(this.docked) return; const k=IS_TOUCH?.0035:.0024; this.av.y-=dx*k*1.6; this.av.x-=dy*k*1.6; }:null; },
  btn:{},

  /* ---- 매 프레임 : 힘 · 회전 · 충돌 · 도킹 판정 · 카메라 ---- */
  tick(dt){ const rig=this.rig, G=this.G, B=this.btn, K=keys;
    // 1호 자전 · 파편
    G.rotation.z+=this.W*dt; for(const m of this.deb){ m.rotation.x+=m.userData.w.x*dt; m.rotation.y+=m.userData.w.y*dt; m.position.addScaledVector(m.userData.v,dt); }
    if(!this.docked){
      const q=rig.quaternion, fw=new THREE.Vector3(0,0,1).applyQuaternion(q), up=new THREE.Vector3(0,1,0).applyQuaternion(q), rt=new THREE.Vector3().crossVectors(fw,up);      // 앞 +z · 위 +y 이면 오른쪽은 −x
      const ctl=S.phase==='play'&&!TALK.on&&this.helm, dock=this.mode==='dock', on=k=>ctl&&(K['Key'+this.KEYS[k]]||B[k]);      // helm : 조종석 · 후방 조종대에 있을 때만 (걷는 동안은 배가 멈춰 선다)
      const thr=(on('fwd')?1:0)-(on('back')?1:0), lat=(on('right')?1:0)-(on('left')?1:0), ver=(on('up')?1:0)-(on('down')?1:0); this.thr=thr;
      const near=dock?.45:1;      // 도킹 중에는 추력을 작게 (섬세하게)
      this.v.addScaledVector(fw,thr*(thr>0?5:3)*near*dt).addScaledVector(rt,lat*1.8*near*dt).addScaledVector(up,ver*1.8*near*dt);
      const pr=this.portRel();
      if(dock){ // 자세 유지 : 손을 떼면 옆 · 위아래 미끄러짐을 스스로 잡는다 · 고리에 가까울수록 앞으로 가는 속도를 줄인다 (VEGA)
        if(!lat) this.v.addScaledVector(rt,-this.v.dot(rt)*Math.min(1,dt*1.6)); if(!ver) this.v.addScaledVector(up,-this.v.dot(up)*Math.min(1,dt*1.6));
        const vmax=pr.d>25?3:pr.d>10?1.5:.8, vf=this.v.dot(fw); if(vf>vmax) this.v.addScaledVector(fw,(vmax-vf)*Math.min(1,dt*2)); }
      else { const sp=this.v.length(), vmax=pr.rel.length()<180?Math.max(3,pr.rel.length()*.06):32; if(sp>vmax) this.v.multiplyScalar(1-Math.min(1,dt*1.2)); }      // 1호 가까이 : 지나쳐 버리지 않게
      if(!ctl||on('brake')) this.v.multiplyScalar(1-Math.min(1,dt*(ctl?1.8:1.5)));      // 대화 중 · [정지] : 멈춘다
      if(ctl){ this.av.y+=((K.ArrowLeft?1:0)-(K.ArrowRight?1:0))*1.4*dt; this.av.x+=((K.ArrowUp?1:0)-(K.ArrowDown?1:0))*1.4*dt; }
      // 롤 : 회전 고정이면 1호와 같은 빠르기로 돌고, 누르는 동안만 표시를 밀어 맞춘다 · 아니면 누르는 만큼 빨라진다 (같아지면 고정)
      const rIn=(on('rr')?1:0)-(on('rl')?1:0);
      if(this.sync) this.av.z=lerp(this.av.z,this.W+rIn*.1,Math.min(1,dt*4));
      else { this.av.z+=rIn*.3*dt; if(dock&&Math.abs(this.av.z-this.W)<.05){ this.sync=true; AUDIO.tone(660,.12,'sine',.06); AUDIO.tone(990,.18,'sine',.06,.12); toast('회전 고정 — 1호와 같은 빠르기',1800); } }
      if(this.v.length()>32) this.v.setLength(32);
      // 기수(위아래 · 좌우)는 손을 떼면 멈춘다 (자세 유지 장치)
      this.av.x*=1-Math.min(1,dt*2.2); this.av.y*=1-Math.min(1,dt*2.2);
      if(this.assist&&dock) this.assistStep(dt);
      rig.rotateX(-this.av.x*dt); rig.rotateY(this.av.y*dt); rig.rotateZ(this.av.z*dt);
      rig.position.addScaledVector(this.v,dt);
      this.collide();
      if(dock) this.dockCheck(dt); else if(this.onNear&&(pr.d<70&&pr.d>0&&pr.lat<30||pr.rel.length()<80)){ const r=this.onNear; this.onNear=null; r(); }
      // 계기 : 조종간 · 추력 손잡이가 손을 따라 움직인다
      if(this.stick) this.stick.rotation.set(this.av.x*.8,0,-this.av.y*.8-(this.av.z-(this.sync?this.W:0))*2);
      if(this.throttle) this.throttle.position.z=(this.thr||0)*.025;
      this._th=(this._th||0)-dt; if((thr||lat||ver||rIn)&&this._th<=0){ this._th=.45; SFX.play('thruster',{vol:.5+.4*Math.abs(thr)}); }
    }
    // 먼지 : 내 둘레로 감싼다
    const dp=this.dustPts.geometry.attributes.position, c=rig.position; for(let i=0;i<dp.count;i++){ for(let a=0;a<3;a++){ let v=dp.array[i*3+a]-c.getComponent(a); if(v>40) dp.array[i*3+a]-=80; else if(v<-40) dp.array[i*3+a]+=80; } } dp.needsUpdate=true;
    // 카메라 : 앉아 있으면 조종석 눈 + 고개 (조종석은 +z 를 본다) · 후방 조종대면 외부 해치 밖의 뒤 카메라 · 걸을 때는 R1 이 놓는다
    const gw=R1.g.getWorldQuaternion(new THREE.Quaternion());
    if(R1.seated&&!this.boarding){ camera.position.copy(R1.eye()); camera.quaternion.copy(gw).multiply(new THREE.Quaternion().setFromEuler(new THREE.Euler(this.head.p,Math.PI+this.head.y,0,'YXZ'))); }
    else if(this.aftcam){ R1.g.updateMatrixWorld(true); camera.position.copy(new THREE.Vector3(0,1.1,-12.25).applyMatrix4(R1.g.matrixWorld)); camera.quaternion.copy(gw); }
    this.hud(); },
  // 계기판 : 거리 · 속도 · 목표 괄호 · 기수 화살표 · 도킹 단계판 · 빛나는 단추
  hud(){ const el=$('#flight'); if(!el||!el.classList.contains('on')) return; const {pp,d,lat,rel}=this.portRel(), sp=this.v.length(), q=this.rig.quaternion;
    const fw=new THREE.Vector3(0,0,1).applyQuaternion(q), up=new THREE.Vector3(0,1,0).applyQuaternion(q), rt=new THREE.Vector3().crossVectors(fw,up), W=new Set(), dock=this.mode==='dock';
    const c=this.G.getWorldPosition(new THREE.Vector3()), far=rel.length()>60, tgt=far&&rel.length()>150?c:pp, n=tgt.clone().project(camera), on=n.z<1&&Math.abs(n.x)<1.2&&Math.abs(n.y)<1.2;
    el.querySelector('.d').textContent=(far?'1호 도킹 고리까지 ':'고리까지 ')+Math.max(0,rel.length()).toFixed(rel.length()<20?1:0)+' m'; el.querySelector('.s').textContent='속도 '+sp.toFixed(sp<3?2:1)+' m/s'+(this.assist?' · 도킹 보조':'')+(this.sync?' · 회전 고정':'');
    const br=el.querySelector('.bracket'); br.style.display=on?'block':'none'; if(on){ const sz=far?Math.max(40,Math.min(260,9000/Math.max(rel.length(),1))):Math.max(36,Math.min(300,600/Math.max(d,1))); br.style.left=((n.x+1)/2*innerWidth)+'px'; br.style.top=((1-n.y)/2*innerHeight)+'px'; br.style.width=br.style.height=sz+'px'; br.querySelector('b').textContent=far&&rel.length()>150?'HUY-1':'도킹 고리'; }
    // 기수 : 목표가 화면 가운데에서 벗어나면 끌 방향 화살표 (끈 쪽으로 기수가 돈다)
    const to=tgt.clone().sub(this.rig.position).normalize(), want=dock?new THREE.Vector3(0,0,1):to, wx=want.dot(rt), wy=want.dot(up), off=Math.acos(clamp(want.dot(fw),-1,1)), nose=el.querySelector('.nose');
    const turn=off>(dock?.1:.14)&&S.phase==='play'; nose.style.display=turn?'block':'none'; if(turn) nose.style.transform=`translate(-50%,-50%) rotate(${Math.atan2(-wy,wx)}rad)`;
    let w='';      // 순항 : 멀면 초속 12 m 까지 [전진]이 빛난다 — 가까워지면 저절로 줄인다
    if(!dock){ if(this.onNear&&this.v.dot(to)<Math.min(12,rel.length()*.05)&&rel.length()>90) W.add('fwd'); w=this.v.length()>2&&rel.length()<120?'1호 가까이 — 저절로 속도를 줄인다':turn?byDevice('화면을 화살표 쪽으로 끌어(또는 방향키) 기수를 1호로','화면을 화살표 쪽으로 끌어 기수를 1호로'):W.has('fwd')?byDevice('W 를 눌러 다가간다','[전진] 을 눌러 다가간다'):''; }
    el.querySelector('.w').textContent=w;
    const dk=el.querySelector('.dock'); dk.classList.toggle('on',dock);
    if(dock&&this.D){ const D=this.D, ok={lat:D.lat<1,ang:D.ang<.12,rr:this.sync,ra:Math.abs(D.ra)<.21,cv:D.cv<1.2&&D.cv>-.2};
      const set=(k,txt,good)=>{ const t=el.querySelector('.'+k); t.textContent=txt; t.className=k+' v'+(good?' ok':''); };
      set('lat',D.lat.toFixed(2)+' m',ok.lat); set('ang',(D.ang*57.3).toFixed(1)+'°',ok.ang); set('rr',this.sync?'고정 ✓':((D.rr*57.3>0?'+':'')+(D.rr*57.3).toFixed(1)+'°/s'),ok.rr); set('ra',(D.ra*57.3).toFixed(0)+'°',ok.ra); set('cv',D.cv.toFixed(2)+' m/s',ok.cv); set('dd',Math.max(0,D.d).toFixed(1)+' m',true);
      // 지금 단계 : ① 축(+기수) → ② 회전 → ③ 표시 → ④ 접근
      const K=k=>byDevice(this.KEYS[k],'');
      const vx=this.v.dot(rt), vy=this.v.dot(up), {rel:rr}=this.portRel(), o=rr.clone().addScaledVector(new THREE.Vector3(0,0,-1),-rr.dot(new THREE.Vector3(0,0,-1))), ox=clamp(-o.dot(rt)*.3,-1.2,1.2)-vx, oy=clamp(-o.dot(up)*.3,-1.2,1.2)-vy;
      let st=4, now='';
      if(!ok.lat||Math.hypot(vx,vy)>.25){ st=1; if(Math.abs(ox)>.08) W.add(ox>0?'right':'left'); if(Math.abs(oy)>.08) W.add(oy>0?'up':'down'); now='① 축 맞추기 — 빛나는 이동 단추로 고리 한가운데에 맞춘다'; }
      else if(!ok.ang){ st=1; now='① 기수 — 화면을 화살표 쪽으로 끌어 고리를 정면에'; }
      else if(!ok.rr){ st=2; W.add(this.av.z<this.W?'rr':'rl'); now='② 회전 맞추기 — 빛나는 롤 단추를 누르고 있으면 1호처럼 돈다 (같아지면 저절로 고정)'; }
      else if(!ok.ra){ st=3; W.add(D.ra>0?'rl':'rr'); now='③ 표시 맞추기 — 빛나는 롤 단추를 누르고 있으면 주황 표시가 흰 표시 쪽으로 간다'; }
      else { st=4; if(D.cv<.3) W.add('fwd'); now='④ 접근 — 빛나는 [전진]을 짧게. 고리 앞에선 VEGA 가 속도를 줄여 준다'; }
      if(!IS_TOUCH){ const ks=[...W].map(k=>this.KEYS[k]).join(' · '); if(ks) now+=' ('+ks+')'; }
      el.querySelector('.now').textContent=now; el.querySelectorAll('.steps li').forEach((li,i)=>{ li.className=i+1<st?'ok':i+1===st?'cur':''; });
      // 조준 원 : 고리 가운데가 화면에서 어디에 · 표시 셋 : 고리의 주황 표시가 내 기준(위 · 120° · 240°)에서 얼마나 돌아 있나
      const m=el.querySelector('.m'), g=el.querySelector('.tgt'), pn=pp.clone().project(camera); g.setAttribute('transform',`translate(${clamp(pn.x*90,-85,85)},${clamp(-pn.y*90,-85,85)})`);
      if(!m.firstChild) m.innerHTML=[0,1,2].map(k=>`<polygon points="0,-82 -7,-70 7,-70" transform="rotate(${k*120})"/>`).join('')+[0,1,2].map(k=>`<line class="ref" x1="0" y1="-92" x2="0" y2="-74" transform="rotate(${k*120})"/>`).join('');
      m.querySelectorAll('polygon').forEach((p,k)=>p.setAttribute('transform',`rotate(${k*120-D.ra*57.3})`)); }
    this.want=W; el.querySelectorAll('.pads button').forEach(b=>b.classList.toggle('want',W.has(b.dataset.k))); },
  // 도킹 고리 기준 : d = 고리 앞으로의 거리 · lat = 축에서 벗어난 거리 · rel = 고리에서 나까지
  portRel(){ const pp=this.port.getWorldPosition(new THREE.Vector3()), out=new THREE.Vector3(0,0,-1), rel=this.dockPt().sub(pp), d=rel.dot(out), lat=rel.clone().addScaledVector(out,-d).length(); return {pp,d,lat,rel,out}; },
  // 선체 충돌 : 1호 상자(조금 줄인) 안으로 들어가면 튕긴다
  collide(){ const G=this.G, loc=G.worldToLocal(this.dockPt()), b=this.hb, m=.9;
    if(loc.x>b.min.x*m&&loc.x<b.max.x*m&&loc.y>b.min.y*m&&loc.y<b.max.y*m&&loc.z>b.min.z+4&&loc.z<b.max.z){ const c=new THREE.Vector3(0,0,(b.min.z+b.max.z)/2), n=loc.clone().sub(c); n.z*=.3; n.normalize().transformDirection(G.matrixWorld);
      this.rig.position.addScaledVector(n,1.2); this.v.reflect(n).multiplyScalar(.3); this.bump('선체 충돌!'); } },
  bump(t){ if(this._bt>S.t) return; this._bt=S.t+1; FX.shake(.6,.06); AUDIO.noise(.6,.4,0,300); AUDIO.tone(70,.5,'sawtooth',.08,0,-30); toast(t,1500); },
  // 롤 : 위쪽 벡터의 xy 각 (1호 G.rotation.z 와 같은 잣대)
  rollOf(q){ const u=new THREE.Vector3(0,1,0).applyQuaternion(q); return Math.atan2(-u.x,u.y); },
  dockCheck(dt){ const {d,lat}=this.portRel(), fw=new THREE.Vector3(0,0,1).applyQuaternion(this.rig.quaternion), ang=Math.acos(clamp(fw.dot(new THREE.Vector3(0,0,1)),-1,1));
    const r=this.rollOf(this.rig.quaternion), rate=this._pr===undefined?0:Math.atan2(Math.sin(r-this._pr),Math.cos(r-this._pr))/Math.max(dt,1e-3); this._pr=r; this.rate=lerp(this.rate||0,rate,Math.min(1,dt*4));
    let ra=((r-this.G.rotation.z)%(Math.PI*2/3)+Math.PI*2)%(Math.PI*2/3); if(ra>Math.PI/3) ra-=Math.PI*2/3;
    this.D={d,lat,ang,rr:this.av.z-this.W,ra,cv:this.v.z};
    if(d<4.2&&d>-2){ const ok=lat<1&&ang<.12&&this.sync&&Math.abs(ra)<.21&&this.v.z<1.2&&this.v.z>-.2;
      if(ok) return this.latch();
      // 실패 : 고리에 부딪혀 튕긴다
      this.v.set(this.v.x*.2,this.v.y*.2,-1.4); this.rig.position.z-=.6; this.fails++; this.bump('도킹 실패 — '+(lat>=1?'축이 어긋났다':ang>=.12?'기수가 비뚤다':!this.sync?'회전 빠르기가 다르다':Math.abs(ra)>=.21?'표시가 어긋났다':'너무 빠르다'));
      if(this.fails===1&&!this.assist){ this.assist=true; TALK.say([VG('도킹 보조를 켭니다. 축과 기수는 제가 잡겠습니다. 회전과 표시만 맞추십시오.')]); } } },
  assistStep(dt){ const {lat,rel,out,d}=this.portRel(); if(d>70) return; const off=rel.clone().addScaledVector(out,-rel.dot(out)); this.v.addScaledVector(off,-dt*.6); this.v.x*=1-dt*.8; this.v.y*=1-dt*.8;
    const fw=new THREE.Vector3(0,0,1).applyQuaternion(this.rig.quaternion), want=new THREE.Vector3(0,0,1), ax=new THREE.Vector3().crossVectors(fw,want); if(ax.length()>1e-4){ const q=new THREE.Quaternion().setFromAxisAngle(ax.normalize(),Math.min(fw.angleTo(want),dt*.5)); this.rig.quaternion.premultiply(q); } },
  // 잠김 : 고리에 물리고 · 1호와 함께 돈다 (이제 창밖의 우주가 돈다)
  async latch(){ if(this.docked) return; this.docked=true; this.mode=null; S.phase='cut'; P.free=false; goal('');
    const {pp}=this.portRel(); const G=this.G; G.attach(this.rig); this.v.set(0,0,0); this.av.set(0,0,0);
    // 마지막 몇 cm : 고리 쪽으로 빨려 들어가 맞물린다
    const from=this.rig.position.clone(), to=G.worldToLocal(pp.clone().add(new THREE.Vector3(0,0,-1.2-this.nose))); let k=0;      // 외부 해치가 고리에 닿도록 (돌린 배는 해치까지 NOSE m)
    await new Promise(res=>{ const f=dt=>{ k=Math.min(1,k+dt/1.2); this.rig.position.lerpVectors(from,to,k*k*(3-2*k)); if(k>=1){ TICK.splice(TICK.indexOf(f),1); res(); } }; TICK.push(f); });
    SFX.play('dock'); FX.shake(.8,.05); await sleep(1600); FX.shake(.3,.03); await sleep(900);
    this.ui(false); $('#flight').classList.remove('on'); this.helm=false; this.aftcam=false; document.body.classList.remove('aftcam');      // 뒤 카메라를 끄고 해치 방으로
    await TALK.say([VG('도킹 고리 잠김. 걸쇠 셋 — 모두 물렸습니다.'),VG('회전 동기화 완료. 이제 우리가 1호와 함께 돕니다.'),I('…창밖의 별이 돈다.'),
      VG('연결 통로 기압 맞추는 중… 1호 쪽 온도 영하 12도. 공기는 숨 쉴 수 있습니다.'),VG('그레이 국장의 지시를 다시 알려 드립니다 — 권총을 챙기십시오.'),I('…18 헤르츠. 그 소리가 뭔지 이제 알게 되겠군.')]);
    const r=this.onDock; this.onDock=null; r&&r(); },
  // 해치를 지나 1호로 : 해치 방에서 외부 해치를 직접 연다 → 연결 통로 → 1호 쪽 문을 손으로 연다
  async board(){ this.boarding=true; const g=R1.g;
    // 연결 통로 (R-1 외부 해치 → 1호 고리) : 원통 · 손잡이 · 띠 조명 · 끝의 1호 해치(두 쪽으로 열림)
    const T=new THREE.Group(); g.add(T); T.position.set(0,.85,-11.95); T.rotation.y=Math.PI;
    const tm=new THREE.MeshStandardMaterial({color:0x3a4048,metalness:.6,roughness:.5,side:THREE.BackSide}), tube=new THREE.Mesh(new THREE.CylinderGeometry(.85,.85,4.2,20,1,true),tm); tube.rotation.x=Math.PI/2; tube.position.z=2.1; T.add(tube);
    for(let i=0;i<5;i++){ const s=new THREE.Mesh(new THREE.TorusGeometry(.84,.03,6,24),new THREE.MeshBasicMaterial({color:i%2?0x9fd8ff:0x2a3038,toneMapped:false})); s.position.z=.4+i*.9; T.add(s); }
    const lt=new THREE.PointLight(0x9fd8ff,1.4,5,1.6); lt.position.set(0,.5,1.8); T.add(lt);
    const hm=new THREE.MeshStandardMaterial({color:0x6a7078,metalness:.7,roughness:.4}), h1=new THREE.Mesh(new THREE.BoxGeometry(.85,1.7,.08),hm), h2=h1.clone(); h1.position.set(-.425,0,4.15); h2.position.set(.425,0,4.15); T.add(h1,h2);
    const red=new THREE.PointLight(0xff2a14,1.2,3,1.6); red.position.set(0,.6,3.8); T.add(red);
    // 해치 방에서 : 걸어서 외부 해치로 (P 는 R-1 안의 좌표 · 해치는 −z 쪽)
    S.phase='play'; P.free=true;
    await TALK.say([I('…권총. 그리고 손전등.'),VG('외부 해치 너머 연결 통로 기압 정상. 해치를 여십시오.')]);
    await R1.task('hatch','외부 해치를 연다 — 연결 통로 너머가 1호');
    S.phase='cut'; P.free=false; goal(''); await camTo({x:0,z:-11.0,yaw:0,pitch:0,eye:1.5},.9);
    toast('외부 해치 개방',1200); await R1.openHatch();
    // 연결 통로를 걷는다 (통로 끝 = −z 로 4.2 m)
    await camTo({x:0,z:-12.7,eye:1.45},1.3); await camTo({x:0,z:-14.6},1.3);
    await TALK.say([I('…1호 쪽 문. 손으로 연다.')]);
    // 1호 해치 : 잠금을 풀고 양쪽으로 미끄러진다
    SFX.play('airlock',{vol:.8}); let k=0; await new Promise(res=>{ const f=dt=>{ k=Math.min(1,k+dt/1.4); h1.position.x=-.425-k*.85; h2.position.x=.425+k*.85; red.intensity=1.2*(1-k); if(k>=1){ TICK.splice(TICK.indexOf(f),1); res(); } }; TICK.push(f); });
    await camTo({x:0,z:-16.3},1.6); AUDIO.noise(1.5,.15,0,600);
    await fade(true,900); TICK.splice(TICK.indexOf(this.fn),1); this.boarding=false; window.dragHook=null; window.camHook=null; document.body.classList.remove('flying'); }
};
