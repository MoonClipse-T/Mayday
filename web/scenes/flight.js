/* ============================================================
   구조정 R-1 비행 · 도킹 (4.2) — 내가 몬다
   ① 웜홀을 막 지난 자리(1호까지 650 m)에서 직접 몰고 간다 : 1호는 진짜 3D 물체 — 둘레를 돌며 볼 수 있다 · 부딪히면 튕긴다
      우주는 그림이 아니게 : 둘레의 먼지(움직이면 스쳐 지나간다) · 1호에서 떨어져 나온 파편 · 먼 별 하나(해) · 행성 없음
      1호는 죽은 배 : 전력 0 — 불빛이 하나도 없다. 어두운 면은 먼 해에 가장자리만 보이고, 고리는 구조정 전조등이 비춰야 드러난다
   ② 도킹 (인터스텔라처럼) : 1호는 긴 축을 중심으로 천천히 돈다 → 뱃머리 도킹 고리에 축을 맞추고 · 같은 빠르기로 돌고(롤) · 표시 셋을 맞추고 · 천천히 닿는다
   ③ 잠김 → 회전 동기화(이제 우주가 돈다) → 기압 → 앞 해치 → 연결 통로를 지나 1호 에어록으로
   조작 : W/S 전진 · 후진 · A/D 좌우 · R/F 위아래 · 방향키 또는 끌기 = 기수 · Q/E 롤 · X 감속
          터치 : 왼쪽 막대 = 좌우 · 위아래 이동 · 오른쪽 끌기 = 기수 · 단추 [전진] [후진] [롤◀] [롤▶] [감속]
   ============================================================ */
'use strict';
const FLIGHT={W:.12,               // 1호 자전 (rad/s ≈ 6.9°/s)
  async run(){ const self=this; S.phase='cut'; P.free=false; LEVEL.clear(); goal('');
    stamp('구조정 R-1 · 조종석','2091.07 · 웜홀 통과 +00:04');
    SHIP.preload();                                            // 1호 안은 나는 동안 화면 뒤에서 풀어 둔다
    const [ck,hull]=await Promise.all([loadGLB('cockpit'),loadGLB('ship_ext')]);
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
    /* ---- 나 : 구조정 (조종석 모델 · 앞 = +z) ---- */
    const rig=this.rig=new THREE.Group(); ck.position.y=-1.74; rig.add(ck); WORLD.add(rig);
    ck.traverse(o=>{ if(o.isMesh&&/glass/i.test(o.material.name)){ o.material.transparent=true; o.material.opacity=.1; o.material.depthWrite=false; } });
    const dash=new THREE.PointLight(0x7fd4ff,.7,2.4,2); dash.position.set(0,.85,-.55); rig.add(dash);
    // 전조등 : 1호는 스스로 빛나지 않는다 — 내 빛이 닿는 데만 보인다 (앞 = +z)
    const lamp=new THREE.SpotLight(0xe8f0ff,1.5,190,.3,.6,1.15); lamp.position.set(0,.2,1.6); lamp.target.position.set(0,0,40); rig.add(lamp,lamp.target);
    this.stick=this.pivot(ck,'steering'); this.throttle=this.pivot(ck,'throttle');
    rig.position.set(18,9,zf-640); rig.lookAt(0,0,zf);      // 물체의 lookAt 은 +z 를 목표로 — 이 모델도 +z 가 앞
    this.v=new THREE.Vector3(); this.av=new THREE.Vector3(); this.head={y:0,p:-.04}; this.fails=0; this.docked=false; this.assist=false;
    TICK.push(this.fn=dt=>this.tick(dt)); MUSIC.play('space',{fade:4});
    this.ui(true);
    await fade(false,2200);
    await card('웜홀 건너편 · NGC 3500','MAYDAY','지구를 떠난 지 넉 달 · 1호가 끊긴 지 열한 달',3600);
    S.phase='play'; P.free=true; P.look=false;
    await TALK.say([VG('동면 해제 완료. 웜홀 통과 완료. 선체 이상 없음. 크리스, 들립니까?'),I('…들린다. 넉 달 잤는데 어제 회의실에 있던 것 같군.'),VG('하위헌스 1호의 마지막 녹음을 다시 재생합니다.')]);
    AUDIO.radio(5); await TALK.say([RADIO('…여기는 하위헌스 1호… 대원 열두 명 중… 우리는 지금…'),RADIO('Mayday, Mayday, we are—')]);
    await TALK.say([VG('1호 확인. 앞쪽 640 m. 불빛 없음. 열 반응 없음. 생명 신호… 하나.'),I('하나. …엘레나가 말한 레아 문일까.'),
      VG('1호가 긴 축을 중심으로 돌고 있습니다. 약 7초에 한 바퀴의 8분의 1. 무언가에 부딪혀 자세 제어를 잃은 것 같습니다.'),
      VG(byDevice('조종은 선장님께 넘깁니다. W 전진 · 끌기로 기수 · X 감속. 1호 뱃머리의 도킹 고리로 가십시오.','조종은 선장님께 넘깁니다. [전진] · 화면을 끌어 기수 · [감속]. 1호 뱃머리의 도킹 고리로 가십시오.'),'조종은 선장님께 넘깁니다. W 전진 · 끌기로 기수 · X 감속. 1호 뱃머리의 도킹 고리로 가십시오.')]);
    goal(byDevice('1호로 — 직접 몰고 간다 (W 전진 · 끌기 기수 · X 감속)','1호로 — 직접 몰고 간다 ([전진] · 끌어서 기수 · [감속])'));
    await new Promise(r=>this.onNear=r);
    await TALK.say([VG('도킹 고리 앞 60 m. 도킹 절차를 시작합니다.'),VG(byDevice('① 1호의 긴 축에 맞춰 일직선으로 · ② Q/E 로 1호와 같은 빠르기로 돌고 · ③ 고리의 주황 표시 셋을 화면의 표시에 맞춘 뒤 · ④ 초속 0.8 m 보다 느리게 닿으십시오.','① 1호의 긴 축에 맞춰 일직선으로 · ② [롤 ◀][롤 ▶] 로 1호와 같은 빠르기로 돌고 · ③ 고리의 주황 표시 셋을 화면의 표시에 맞춘 뒤 · ④ 초속 0.8 m 보다 느리게 닿으십시오.'),'① 1호의 긴 축에 맞춰 일직선으로 · ② Q/E 로 1호와 같은 빠르기로 돌고 · ③ 고리의 주황 표시 셋을 화면의 표시에 맞춘 뒤 · ④ 초속 0.8 m 보다 느리게 닿으십시오.'),
      I('…돌아가는 문에 맞춰 들어간다.')]);
    goal('도킹 — 오른쪽 표의 조작대로');
    this.mode='dock'; await new Promise(r=>this.onDock=r);
    await this.board(); },

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

  /* ---- 조작 화면 ---- */
  ui(on){ let el=$('#flight'); if(!el){ el=document.createElement('div'); el.id='flight'; el.innerHTML=`<div class="hud"><p class="d"></p><p class="s"></p><p class="w"></p></div>
      <div class="bracket"><i></i><i></i><i></i><i></i><b></b></div><div class="dock"><svg viewBox="-100 -100 200 200"><circle r="70" class="o"/><g class="m"></g><g class="tgt"><circle r="10"/></g><line x1="-90" y1="0" x2="-20" y2="0"/><line x1="20" y1="0" x2="90" y2="0"/><line x1="0" y1="-90" x2="0" y2="-20"/><line x1="0" y1="20" x2="0" y2="90"/></svg>
      <table><tr><th>도킹</th><th>지금</th><th>목표</th><th>조작</th></tr>${[['lat','축 어긋남','0.6 m 안'],['ang','기수 각','4° 안'],['rr','회전 빠르기 차','±1.7°/s'],['ra','표시 어긋남','±7°'],['cv','접근 속도','0.85 m/s 아래'],['dd','고리까지','4 m 에서 판정']].map(([k,n,g])=>`<tr><td>${n}</td><td class="${k} v"></td><td class="g">${g}</td><td class="${k}h h"></td></tr>`).join('')}<tr><td class="nx" colspan="4"></td></tr></table></div>
      <div class="pads"><button data-k="fwd">전진</button><button data-k="back">후진</button><button data-k="rl">롤 ◀</button><button data-k="rr">롤 ▶</button><button data-k="brake">감속</button></div>`; document.body.appendChild(el);
      el.querySelectorAll('.pads button').forEach(b=>{ const k=b.dataset.k; b.addEventListener('pointerdown',e=>{ e.stopPropagation(); FLIGHT.btn[k]=true; b.classList.add('on'); }); ['pointerup','pointerleave','pointercancel'].forEach(t=>b.addEventListener(t,()=>{ FLIGHT.btn[k]=false; b.classList.remove('on'); })); }); }
    el.classList.toggle('on',on); document.body.classList.toggle('flying',on);
    window.dragHook=on?(dx,dy)=>{ if(this.docked) return; const k=IS_TOUCH?.0035:.0024; this.av.y-=dx*k*1.6; this.av.x-=dy*k*1.6; }:null; },
  btn:{},

  /* ---- 매 프레임 : 힘 · 회전 · 충돌 · 도킹 판정 · 카메라 ---- */
  tick(dt){ const rig=this.rig, G=this.G, B=this.btn, K=keys;
    // 1호 자전 · 파편
    G.rotation.z+=this.W*dt; for(const m of this.deb){ m.rotation.x+=m.userData.w.x*dt; m.rotation.y+=m.userData.w.y*dt; m.position.addScaledVector(m.userData.v,dt); }
    if(!this.docked){
      const q=rig.quaternion, fw=new THREE.Vector3(0,0,1).applyQuaternion(q), up=new THREE.Vector3(0,1,0).applyQuaternion(q), rt=new THREE.Vector3().crossVectors(fw,up);      // 앞 +z · 위 +y 이면 오른쪽은 −x
      const ctl=S.phase==='play'&&!TALK.on;
      if(ctl){ const thr=(K.KeyW||B.fwd?1:0)-(K.KeyS||B.back?1:0); this.thr=thr;
        const lat=(K.KeyD?1:0)-(K.KeyA?1:0)+(stick.id!==null?stick.dx:0), ver=(K.KeyR?1:0)-(K.KeyF?1:0)-(stick.id!==null?stick.dy:0);
        const near=this.mode==='dock'?.35:1;      // 도킹 중에는 추력을 작게 (섬세하게)
        this.v.addScaledVector(fw,thr*(thr>0?5:3)*near*dt).addScaledVector(rt,lat*1.6*near*dt).addScaledVector(up,ver*1.6*near*dt);
        if(K.KeyX||B.brake) this.v.multiplyScalar(1-Math.min(1,dt*1.4));
        this.av.y+=((K.ArrowLeft?1:0)-(K.ArrowRight?1:0))*1.4*dt; this.av.x+=((K.ArrowUp?1:0)-(K.ArrowDown?1:0))*1.4*dt;
        this.av.z+=((K.KeyE||B.rr?1:0)-(K.KeyQ||B.rl?1:0))*.22*dt; }
      if(this.v.length()>32) this.v.setLength(32);
      // 기수(위아래 · 좌우)는 손을 떼면 멈춘다 (자세 유지 장치) · 롤은 그대로 돈다 (1호와 같은 빠르기를 유지해야 하니까)
      this.av.x*=1-Math.min(1,dt*2.2); this.av.y*=1-Math.min(1,dt*2.2);
      // 도킹 보조 (두 번 실패하면) : 축 · 기수만 살짝 잡아 준다
      if(this.assist&&this.mode==='dock') this.assistStep(dt);
      rig.rotateX(-this.av.x*dt); rig.rotateY(this.av.y*dt); rig.rotateZ(this.av.z*dt);
      rig.position.addScaledVector(this.v,dt);
      this.collide();
      if(this.mode==='dock') this.dockCheck(dt); else if(this.onNear&&this.portRel().d<60&&this.portRel().lat<18){ const r=this.onNear; this.onNear=null; r(); }
      // 계기 : 조종간 · 추력 손잡이가 손을 따라 움직인다
      if(this.stick) this.stick.rotation.set(this.av.x*.8,0,-this.av.y*.8-this.av.z*2);
      if(this.throttle) this.throttle.position.z=(this.thr||0)*.025;
      // 엔진 소리 : 추력만큼
      this._th=(this._th||0)-dt; if((this.thr||Math.abs(this.av.z)>.02&&(keys.KeyQ||keys.KeyE))&&this._th<=0){ this._th=.45; SFX.play('thruster',{vol:.6+.4*Math.abs(this.thr||0)}); }
    }
    // 먼지 : 내 둘레로 감싼다
    const dp=this.dustPts.geometry.attributes.position, c=rig.position; for(let i=0;i<dp.count;i++){ for(let a=0;a<3;a++){ let v=dp.array[i*3+a]-c.getComponent(a); if(v>40) dp.array[i*3+a]-=80; else if(v<-40) dp.array[i*3+a]+=80; } } dp.needsUpdate=true;
    // 카메라 : 조종석 눈 + 고개 (조종석은 +z 를 본다)
    rig.updateMatrixWorld(true); const eye=new THREE.Vector3(0,1.02,-1.22).applyMatrix4(rig.matrixWorld);
    const hq=new THREE.Quaternion().setFromEuler(new THREE.Euler(this.head.p,Math.PI+this.head.y,0,'YXZ')), wq=rig.getWorldQuaternion(new THREE.Quaternion());
    if(!this.boarding){ camera.position.copy(eye); camera.quaternion.copy(wq).multiply(hq); }
    this.hud(); },
  // 계기판 : 거리 · 속도 · 목표 괄호(고리 · 1호) · 도킹 표 (맞으면 초록)
  hud(){ const el=$('#flight'); if(!el||!el.classList.contains('on')) return; const {pp,d,lat}=this.portRel(), sp=this.v.length();
    const c=this.G.getWorldPosition(new THREE.Vector3()), far=d>60, tgt=far&&d>150?c:pp, n=tgt.clone().project(camera), on=n.z<1&&Math.abs(n.x)<1.2&&Math.abs(n.y)<1.2;
    el.querySelector('.d').textContent=(far?'1호 도킹 고리까지 ':'고리까지 ')+Math.max(0,d).toFixed(d<20?1:0)+' m'; el.querySelector('.s').textContent='속도 '+sp.toFixed(sp<3?2:1)+' m/s'+(this.assist?' · 도킹 보조':'');
    el.querySelector('.w').textContent=this.v.z>2&&d<40?byDevice('너무 빠르다 — 감속 (X)','너무 빠르다 — [감속]'):'';
    const br=el.querySelector('.bracket'); br.style.display=on?'block':'none'; if(on){ const sz=far?Math.max(40,Math.min(260,9000/Math.max(d,1))):Math.max(36,Math.min(300,600/Math.max(d,1))); br.style.left=((n.x+1)/2*innerWidth)+'px'; br.style.top=((1-n.y)/2*innerHeight)+'px'; br.style.width=br.style.height=sz+'px'; br.querySelector('b').textContent=far&&d>150?'HUY-1':'도킹 고리'; }
    const dk=el.querySelector('.dock'); dk.classList.toggle('on',this.mode==='dock'); if(this.mode!=='dock'||!this.D) return; const D=this.D;
    const set=(k,txt,ok,hint='')=>{ const t=el.querySelector('.'+k); t.textContent=txt; t.className=k+' v'+(ok?' ok':''); el.querySelector('.'+k+'h').textContent=ok?'':hint; };
    const H=this.hints(), ok={lat:D.lat<.6,ang:D.ang<.07,rr:Math.abs(D.rr)<.03,ra:Math.abs(D.ra)<.12,cv:D.cv<.85&&D.cv>-.2};
    set('lat',D.lat.toFixed(2)+' m',ok.lat,H.lat); set('ang',(D.ang*57.3).toFixed(1)+'°',ok.ang,H.ang); set('rr',(D.rr*57.3>0?'+':'')+(D.rr*57.3).toFixed(1)+'°/s',ok.rr,H.roll); set('ra',(D.ra*57.3).toFixed(0)+'°',ok.ra,H.roll);
    set('cv',D.cv.toFixed(2)+' m/s',ok.cv&&!H.over,H.cv); set('dd',Math.max(0,D.d).toFixed(1)+' m',true);
    // 지금 할 일 하나 : 축 → 기수 → 회전 · 표시 → 접근
    el.querySelector('.nx').textContent='지금 — '+(!ok.lat||H.drift>.2?'축에 맞춘다 : '+H.lat:!ok.ang?'기수를 고리로 : '+H.ang:!(ok.rr&&ok.ra)?(H.roll==='유지'?'회전 유지 — 표시가 다가온다':'회전과 표시를 맞춘다 : '+H.roll):H.cv?'다가간다 : '+H.cv:'그대로 — 천천히 닿는다');
    // 조준 원 : 고리 가운데가 화면에서 어디에 · 표시 셋 : 고리의 주황 표시가 내 기준(위 · 120° · 240°)에서 얼마나 돌아 있나
    const m=el.querySelector('.m'), g=el.querySelector('.tgt'); g.setAttribute('transform',`translate(${clamp(n.x*90,-85,85)},${clamp(-n.y*90,-85,85)})`);
    if(!m.firstChild) m.innerHTML=[0,1,2].map(k=>`<polygon points="0,-82 -7,-70 7,-70" transform="rotate(${k*120})"/>`).join('')+[0,1,2].map(k=>`<line class="ref" x1="0" y1="-92" x2="0" y2="-74" transform="rotate(${k*120})"/>`).join('');
    m.querySelectorAll('polygon').forEach((p,k)=>p.setAttribute('transform',`rotate(${k*120-D.ra*57.3})`)); },
  // 무엇을 눌러야 하나 (표 · 지금 할 일) : 축 = 이동 방향 (이미 그쪽으로 빠르면 반대로 — 멈춰야 하니까) · 기수 = 끌 방향 · 롤 = 표시가 다가오는 빠르기를 목표로 · 접근 = 거리에 맞는 빠르기
  hints(){ const D=this.D, q=this.rig.quaternion, fw=new THREE.Vector3(0,0,1).applyQuaternion(q), up=new THREE.Vector3(0,1,0).applyQuaternion(q), rt=new THREE.Vector3().crossVectors(fw,up), {rel,out}=this.portRel(), off=rel.clone().addScaledVector(out,-rel.dot(out));
    const vx=this.v.dot(rt), vy=this.v.dot(up), ox=clamp(-off.dot(rt)*.3,-1.2,1.2)-vx, oy=clamp(-off.dot(up)*.3,-1.2,1.2)-vy, wx=new THREE.Vector3(0,0,1).dot(rt), wy=new THREE.Vector3(0,0,1).dot(up), ar=(x,y,t)=>(Math.abs(x)>t?(x>0?'→':'←'):'')+(Math.abs(y)>t?(y>0?'↑':'↓'):'');
    const key=(x,y,t)=>[Math.abs(x)>t?(x>0?'D':'A'):'',Math.abs(y)>t?(y>0?'R':'F'):''].filter(Boolean).join(' · '), want=clamp(-D.ra*.35,-.07,.07), e=D.rr-want, roll=Math.abs(e)<.012?'유지':e>0?byDevice('Q 롤 ◀','롤 ◀'):byDevice('E 롤 ▶','롤 ▶');
    const vmax=D.d>20?3:D.d>8?1.5:.7, over=D.cv>vmax, cv=over?byDevice('X 감속','감속'):D.cv<vmax*.45?byDevice('W 전진','전진'):'';
    this.cmd={ox,oy,wx,wy,e,over,fwd:D.cv<vmax*.45};
    return {drift:Math.hypot(vx,vy),lat:byDevice(key(ox,oy,.05),'막대 '+ar(ox,oy,.05)),ang:byDevice('방향키 ','끌기 ')+ar(wx,wy,.02),roll,cv,over}; },
  // 도킹 고리 기준 : d = 고리 앞으로의 거리 · lat = 축에서 벗어난 거리 · rel = 고리에서 나까지
  portRel(){ const pp=this.port.getWorldPosition(new THREE.Vector3()), out=new THREE.Vector3(0,0,-1), rel=this.rig.position.clone().sub(pp), d=rel.dot(out), lat=rel.clone().addScaledVector(out,-d).length(); return {pp,d,lat,rel,out}; },
  // 선체 충돌 : 1호 상자(조금 줄인) 안으로 들어가면 튕긴다
  collide(){ const G=this.G, loc=G.worldToLocal(this.rig.position.clone()), b=this.hb, m=.9;
    if(loc.x>b.min.x*m&&loc.x<b.max.x*m&&loc.y>b.min.y*m&&loc.y<b.max.y*m&&loc.z>b.min.z+4&&loc.z<b.max.z){ const c=new THREE.Vector3(0,0,(b.min.z+b.max.z)/2), n=loc.clone().sub(c); n.z*=.3; n.normalize().transformDirection(G.matrixWorld);
      this.rig.position.addScaledVector(n,1.2); this.v.reflect(n).multiplyScalar(.3); this.bump('선체 충돌!'); } },
  bump(t){ if(this._bt>S.t) return; this._bt=S.t+1; FX.shake(.6,.06); AUDIO.noise(.6,.4,0,300); AUDIO.tone(70,.5,'sawtooth',.08,0,-30); toast(t,1500); },
  // 롤 : 위쪽 벡터의 xy 각 (1호 G.rotation.z 와 같은 잣대)
  rollOf(q){ const u=new THREE.Vector3(0,1,0).applyQuaternion(q); return Math.atan2(-u.x,u.y); },
  dockCheck(dt){ const {d,lat}=this.portRel(), fw=new THREE.Vector3(0,0,1).applyQuaternion(this.rig.quaternion), ang=Math.acos(clamp(fw.dot(new THREE.Vector3(0,0,1)),-1,1));
    const r=this.rollOf(this.rig.quaternion), rate=this._pr===undefined?0:Math.atan2(Math.sin(r-this._pr),Math.cos(r-this._pr))/Math.max(dt,1e-3); this._pr=r; this.rate=lerp(this.rate||0,rate,Math.min(1,dt*4));
    let ra=((r-this.G.rotation.z)%(Math.PI*2/3)+Math.PI*2)%(Math.PI*2/3); if(ra>Math.PI/3) ra-=Math.PI*2/3;
    this.D={d,lat,ang,rr:this.rate-this.W,ra,cv:this.v.z};
    if(d<4.2&&d>-2){ const ok=lat<.6&&ang<.07&&Math.abs(this.rate-this.W)<.03&&Math.abs(ra)<.12&&this.v.z<.85&&this.v.z>-.2;
      if(ok) return this.latch();
      // 실패 : 고리에 부딪혀 튕긴다
      this.v.set(this.v.x*.2,this.v.y*.2,-1.4); this.rig.position.z-=.6; this.fails++; this.bump('도킹 실패 — '+(lat>=.6?'축이 어긋났다':ang>=.07?'기수가 비뚤다':Math.abs(this.rate-this.W)>=.03?'회전 빠르기가 다르다':Math.abs(ra)>=.12?'표시가 어긋났다':'너무 빠르다'));
      if(this.fails===2&&!this.assist){ this.assist=true; TALK.say([VG('도킹 보조를 켭니다. 축과 기수는 제가 잡겠습니다. 회전과 표시만 맞추십시오.')]); } } },
  assistStep(dt){ const {lat,rel,out,d}=this.portRel(); if(d>70) return; const off=rel.clone().addScaledVector(out,-rel.dot(out)); this.v.addScaledVector(off,-dt*.6); this.v.x*=1-dt*.8; this.v.y*=1-dt*.8;
    const fw=new THREE.Vector3(0,0,1).applyQuaternion(this.rig.quaternion), want=new THREE.Vector3(0,0,1), ax=new THREE.Vector3().crossVectors(fw,want); if(ax.length()>1e-4){ const q=new THREE.Quaternion().setFromAxisAngle(ax.normalize(),Math.min(fw.angleTo(want),dt*.5)); this.rig.quaternion.premultiply(q); } },
  // 잠김 : 고리에 물리고 · 1호와 함께 돈다 (이제 창밖의 우주가 돈다)
  async latch(){ if(this.docked) return; this.docked=true; this.mode=null; S.phase='cut'; P.free=false; goal('');
    const {pp}=this.portRel(); const G=this.G; G.attach(this.rig); this.v.set(0,0,0); this.av.set(0,0,0);
    // 마지막 몇 cm : 고리 쪽으로 빨려 들어가 맞물린다
    const from=this.rig.position.clone(), to=G.worldToLocal(pp.clone().add(new THREE.Vector3(0,0,-1.2))); let k=0;
    await new Promise(res=>{ const f=dt=>{ k=Math.min(1,k+dt/1.2); this.rig.position.lerpVectors(from,to,k*k*(3-2*k)); if(k>=1){ TICK.splice(TICK.indexOf(f),1); res(); } }; TICK.push(f); });
    SFX.play('dock'); FX.shake(.8,.05); await sleep(1600); FX.shake(.3,.03); await sleep(900);
    this.ui(false); $('#flight').classList.remove('on');
    await TALK.say([VG('도킹 고리 잠김. 걸쇠 셋 — 모두 물렸습니다.'),VG('회전 동기화 완료. 이제 우리가 1호와 함께 돕니다.'),I('…창밖의 별이 돈다.'),
      VG('연결 통로 기압 맞추는 중… 1호 쪽 온도 영하 12도. 공기는 숨 쉴 수 있습니다.'),VG('그레이 국장의 지시를 다시 알려 드립니다 — 권총을 챙기십시오.'),I('…18 헤르츠. 그 소리가 뭔지 이제 알게 되겠군.')]);
    const r=this.onDock; this.onDock=null; r&&r(); },
  // 해치를 지나 1호로 : 일어나 앞 해치 → 연결 통로 → 1호 에어록 문이 열린다
  async board(){ this.boarding=true; const rig=this.rig; rig.updateMatrixWorld(true);
    // 연결 통로 (구조정 앞 → 1호 고리) : 원통 · 손잡이 · 띠 조명 · 끝의 1호 해치(두 쪽으로 열림)
    const T=new THREE.Group(); rig.add(T); T.position.set(0,.6,.9);
    const tm=new THREE.MeshStandardMaterial({color:0x3a4048,metalness:.6,roughness:.5,side:THREE.BackSide}), tube=new THREE.Mesh(new THREE.CylinderGeometry(.85,.85,4.2,20,1,true),tm); tube.rotation.x=Math.PI/2; tube.position.z=2.1; T.add(tube);
    for(let i=0;i<5;i++){ const s=new THREE.Mesh(new THREE.TorusGeometry(.84,.03,6,24),new THREE.MeshBasicMaterial({color:i%2?0x9fd8ff:0x2a3038,toneMapped:false})); s.position.z=.4+i*.9; T.add(s); }
    const lt=new THREE.PointLight(0x9fd8ff,1.4,5,1.6); lt.position.set(0,.5,1.8); T.add(lt);
    const hm=new THREE.MeshStandardMaterial({color:0x6a7078,metalness:.7,roughness:.4}), h1=new THREE.Mesh(new THREE.BoxGeometry(.85,1.7,.08),hm), h2=h1.clone(); h1.position.set(-.425,0,4.15); h2.position.set(.425,0,4.15); T.add(h1,h2);
    const red=new THREE.PointLight(0xff2a14,1.2,3,1.6); red.position.set(0,.6,3.8); T.add(red);
    const cam0=camera.position.clone(), q0=camera.quaternion.clone(), path=[new THREE.Vector3(0,1.25,-.6),new THREE.Vector3(0,1.0,.7),new THREE.Vector3(0,.95,1.6),new THREE.Vector3(0,.95,3.3)];
    const look=new THREE.Quaternion(); rig.getWorldQuaternion(look); look.multiply(new THREE.Quaternion().setFromEuler(new THREE.Euler(0,Math.PI,0)));
    const walk=(a,b,dur,bob=0)=>new Promise(res=>{ let k=0; const f=dt=>{ k=Math.min(1,k+dt/dur); const e=k*k*(3-2*k), p=a.clone().lerp(b,e); p.y+=Math.sin(k*Math.PI*4)*bob; camera.position.copy(p.applyMatrix4(rig.matrixWorld)); camera.quaternion.slerpQuaternions(q0,look,Math.min(1,k*2)); if(k>=1){ TICK.splice(TICK.indexOf(f),1); res(); } }; TICK.push(f); });
    AUDIO.noise(1.2,.12,0,1200); await walk(new THREE.Vector3(0,1.02,-1.22),path[0],1.2);
    SFX.play('airlock'); toast('앞 해치 개방',1200); await walk(path[0],path[1],1.6,.02); await walk(path[1],path[2],1.2,.03);
    await TALK.say([I('…1호 쪽 문. 손으로 연다.')]);
    // 1호 해치 : 잠금을 풀고 양쪽으로 미끄러진다
    SFX.play('airlock',{vol:.8}); let k=0; await new Promise(res=>{ const f=dt=>{ k=Math.min(1,k+dt/1.4); h1.position.x=-.425-k*.85; h2.position.x=.425+k*.85; red.intensity=1.2*(1-k); if(k>=1){ TICK.splice(TICK.indexOf(f),1); res(); } }; TICK.push(f); });
    await walk(path[2],path[3],1.6,.03); AUDIO.noise(1.5,.15,0,600);
    await fade(true,900); TICK.splice(TICK.indexOf(this.fn),1); this.boarding=false; window.dragHook=null; document.body.classList.remove('flying'); }
};
