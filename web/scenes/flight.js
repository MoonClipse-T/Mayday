/* ============================================================
   구조정 R-1 비행 · 도킹 (4.9 · 4.16 부터 2부 첫머리) — 내가 몬다 · 도킹은 세 단계
   우주는 그림이 아니게 : 1호는 진짜 3D 물체(둘레를 돌며 볼 수 있다 · 부딪히면 튕긴다) · 둘레의 먼지 · 떨어져 나온 파편 · 노란 변광성 S-09(1부에서 찾은 별) · 행성 없음 · 웜홀은 100 pc 뒤 (주름길로 왔다)
   1호는 죽은 배 : 전력 0 — 불빛이 하나도 없다. 구조정 전조등이 비춰야 드러난다. 긴 축을 중심으로 10초에 한 바퀴 돈다
   ① 접근 : 도약해 내린 자리(640 m)에서 직접 몰고 간다 — 고리 앞 70 m 안으로 들어오면 다음 단계
      (R-1 의 도킹 해치는 뒤쪽 → VEGA 가 고리 앞 16 m 에 배를 세우고 · 축과 기수를 잡고 · 배를 돌리는 동안 해치 방의 후방 도킹 조종대로 걸어간다)
   ② 회전 맞추기 : 뒤 카메라로 1호를 보며 [롤]로 같은 쪽 · 같은 빠르기로 돈다 — 같아지면 1호가 멈춰 보인다 (눈으로 판단 · 숫자 없음)
      돌 방향은 알려 준다(빛나는 단추) · 같은 빠르기를 3초 지키면 회전이 저절로 고정된다 · 고리는 화면 한가운데에 붙잡아 둔다 (변수는 회전 하나 — 4.15)
   ③ 도킹 : 화면 가운데의 원(= 내 해치)을 1호의 도킹 고리에 겹치고 [전진]으로 끝까지 — 고리가 화면에 가득 찰 때 어긋남이 고리 지름의 10 % 쯤(0.4 m) 안이면 '탁' 물린다
      축 · 기수 · 표시 맞추기는 없다 (VEGA 가 잡는다) · 빗나가면 밀려났다가 다시 · 두 번 빗나가면 도킹 보조
   물린 뒤 : 1호 안에 공기가 있는지 모른다 → 해치 방 보관함에서 우주복을 입고 → 외부 해치 → 틈 없이 이어진 연결 통로 → 1호 쪽 문 → scenes/part2.js 의 1호 에어록 · 헬멧은 거기서 공기를 확인하고 벗는다 (scenes/part2.js board)
   조작 (터치가 기본 · 키보드도) : 화면 끌기 = ① 기수 · ③ 원을 고리 쪽으로 (위아래 · 옆 이동 단추는 4.12 에 뺐다) · [전진][후진] = W/S · [롤 ◀][롤 ▶] = Q/E · [정지] = X
   ============================================================ */
'use strict';
const FLIGHT={W:.6,                // 1호 자전 (rad/s ≈ 34°/s · 10초에 한 바퀴 — 4.12 사용자 : 아주 빠르게 돈다)
  // 장면 : 1호 · 별 · 파편 · R-1 (2부 시작 화면에서 먼저 만든다 → run)
  async build(){ LEVEL.clear(); goal('');
    const hull=await loadGLB('ship_ext');
    // 4.25 : 1부 끝과 같은 하늘 — 노란 변광성 S-09 가 1호 바로 뒤 (다가가는 쪽 · 시작 화면에서 1호가 별 앞에 그림자로 선다)
    const sunDir=new THREE.Vector3(-.2,-.05,1).normalize();
    await SKY.space({dir:[.1,.08,-1],R:.0001,srot:2.4,jupiter:false,sunDir:sunDir.toArray(),far:true,sunI:.3});      // 행성 · 웜홀 없음 (웜홀은 100 pc 뒤)
    scene.background=new THREE.Color(0x000000);
    WORLD.add(new THREE.HemisphereLight(0x6f7f99,0x050607,.045));
    const sun=new THREE.DirectionalLight(0xffd9a0,1.25); sun.position.copy(sunDir).multiplyScalar(500); WORLD.add(sun);
    this.s09(sunDir);
    /* ---- 1호 : 실제 크기(길이 약 140 m) · 긴 축(z)을 중심으로 돈다 · 뱃머리(−z)에 도킹 고리 ---- */
    const G=this.G=new THREE.Group(); WORLD.add(G); hull.scale.setScalar(3); G.add(hull);
    hull.traverse(o=>{ if(o.isMesh){ o.material=o.material.clone(); if(o.material.color) o.material.color.multiplyScalar(.4); if(o.material.emissive) o.material.emissive.setRGB(0,0,0); } });
    G.updateMatrixWorld(true); const hb=new THREE.Box3().setFromObject(hull); this.hb=hb.clone();
    const zf=hb.min.z, port=this.port=new THREE.Group(); port.position.set(0,0,zf-2.2); G.add(port); this.buildPort(port,zf);
    this.debris(hb); this.dust();
    /* ---- 나 : 구조정 R-1 (scenes/r1.js — 조종석 · 로비 · 해치 방, 앞 = +z) ----
       rig = 조종하는 몸(기수 = +z) · 그 안의 R-1 묶음 g. 도킹 때는 g 만 반 바퀴 돌려 뒤(외부 해치)를 앞으로 — 조종 계산은 그대로 */
    const rig=this.rig=new THREE.Group(); WORLD.add(rig); const g=await R1.mount(rig);
    R1.dashLight(g);
    // 전조등 : 1호는 스스로 빛나지 않는다 — 내 빛이 닿는 데만 보인다 (앞 = +z)
    const lamp=new THREE.SpotLight(0xe8f0ff,1.5,190,.3,.6,1.15); lamp.position.set(0,.2,1.6); lamp.target.position.set(0,0,40); rig.add(lamp,lamp.target);
    this.stick=this.pivot(R1.b.root,'steering'); this.throttle=this.pivot(R1.b.root,'throttle');
    rig.position.set(18,9,zf-640); rig.lookAt(0,0,zf);      // 물체의 lookAt 은 +z 를 목표로 — 이 모델도 +z 가 앞
    this.v=new THREE.Vector3(); this.av=new THREE.Vector3(); this.head={y:0,p:-.04}; this.fails=0; this.docked=false; this.assist=false; this.sync=false; this.mode=null; this.want=new Set(); this.auto=false; this.stage=1; this.syncT=0; this.settled=false; this.rT=0; this.roll=0; this.al=0; this.lamp=lamp;
    this.helm=true; this.aftcam=false; this.nose=0; document.body.classList.remove('aftcam');
    this.built=true; },
  async run(){ S.phase='cut'; P.free=false; if(!this.built) await this.build(); this.built=false; goal(''); R1.seated=true;
    stamp('구조정 R-1 · 조종석','2091.07.22 · 변광성 S-09 곁'); window.dragHook=null;
    TICK.push(this.fn=dt=>this.tick(dt)); MUSIC.play('derelict',{fade:4});
    this.ui(true);
    await fade(false,2200); $('#fade').style.background='';
    S.phase='play'; P.free=false; P.look=false;      // 앉아 있다 : 걷는 조이스틱이 화면 왼쪽 끌기를 가로채지 않게 (디벗 — 4.19)
    await TALK.say([VG('1호 확인. 앞쪽 640 m. 불빛 없음. 열 반응 없음. 생명 신호… 하나.'),I('하나. …엘레나가 말한 레아 문일까.'),
      VG('1호가 긴 축을 중심으로 빠르게 돌고 있습니다. 10초에 한 바퀴. 무언가에 부딪혀 자세 제어를 잃은 것 같습니다.'),I('…저렇게 도는 문에 어떻게 붙지.'),
      VG(byDevice('조종은 선장님께 넘깁니다. W 전진 · 화면을 끌어(또는 방향키) 기수 · X 정지. 1호 뱃머리의 도킹 고리로 가십시오.','조종은 선장님께 넘깁니다. [전진] · 화면을 끌어 기수 · [정지]. 1호 뱃머리의 도킹 고리로 가십시오.'),'조종은 선장님께 넘깁니다. W 전진 · 끌기로 기수 · X 감속. 1호 뱃머리의 도킹 고리로 가십시오.')]);
    goal(byDevice('1호 도킹 고리로 — W 전진 · 끌어서 기수','1호 도킹 고리로 — [전진] · 끌어서 기수'));
    await new Promise(r=>this.onNear=r);
    // ① → ② : R-1 의 도킹 해치는 뒤쪽 — VEGA 가 고리 앞 대기 자리로 몰고 가 축 · 기수를 잡고 배를 돌리는 동안, 해치 방의 후방 도킹 조종대로 걸어간다
    this.helm=false; this.stage=2; this.autoOn();
    await TALK.say([VG('도킹 고리 앞 60 m. 도킹 절차를 시작합니다.'),VG('R-1 의 도킹 해치는 뒤쪽입니다. 제가 배를 돌려 뒤를 1호에 대겠습니다.'),VG('해치 방의 후방 도킹 조종대로 가 주십시오. 거기서 뒤 카메라를 보며 모십니다.')]);
    await R1.stand(this.head); this.turn();
    await R1.task('aft','해치 방(맨 뒤) — 후방 도킹 조종대로');
    if(!this.turned.done){ goal('배를 돌리는 중…'); await this.turned; }
    S.phase='cut'; P.free=false; goal(''); await camTo({x:.62,z:-10.62,yaw:-Math.PI/2,pitch:-.12,eye:1.5},.8);
    AUDIO.tone(660,.1,'square',.04); AUDIO.noise(.4,.08,0,2400); this.aftcam=true; document.body.classList.add('aftcam'); this.ui(true); this.helm=true; S.phase='play';
    // ② 회전 맞추기 : 눈으로 보고 맞춘다 — 같아지면 1호가 멈춰 보인다
    await TALK.say([VG('후방 카메라 연결. 이제 뒤가 앞입니다.'),VG('축과 기수는 제가 잡겠습니다. 선장님은 회전만 맞추십시오.'),VG('롤 단추로 1호와 같은 방향, 같은 빠르기로 도십시오. 1호가 아주 빠릅니다 — 오래 눌러야 합니다.'),VG('뒤 카메라 원 바깥의 주황 점이 1호의 주황 막대입니다. 점이 멈추면 1호가 멈춰 보이는 것이고, 대신 바깥의 별이 돕니다.'),I('…돌아가는 문에 맞춰 들어간다.')]);
    goal(byDevice('② 회전 맞추기 — Q · E 로 돌아, 1호의 주황 막대가 멈춰 보이게 3초','② 회전 맞추기 — [롤] 단추로 돌아, 1호의 주황 막대가 멈춰 보이게 3초'));
    // 축 한가운데에 다 설 때까지 기다린 뒤에 시작한다
    for(let i=0;i<120&&!this.settled;i++) await sleep(100); this.mode='spin'; await new Promise(r=>this.onSync=r);
    // ③ 도킹 : 원을 고리에 겹치고 끝까지
    await TALK.say([VG('회전 일치. 고정합니다.'),VG(byDevice('이제 화면을 끌어 원을 도킹 고리에 겹치고, 그대로 끝까지 붙이십시오.','이제 화면을 손가락으로 끌어 원을 도킹 고리에 겹치고, 그대로 끝까지 붙이십시오.'))]);
    goal(byDevice('③ 도킹 — 화면을 끌어 원을 고리에 겹치고, W 로 끝까지','③ 도킹 — 화면을 끌어 원을 고리에 겹치고, [전진]으로 끝까지'));
    this.stage=3; this.mode='dock'; await new Promise(r=>this.onDock=r);
    await this.board(); },
  // 자동 자세 (② · ③) : 이제부터 기수는 1호의 긴 축에 고정 · 도킹 기준점은 외부 해치 · 전조등은 해치 쪽에서 1호를 비춘다
  autoOn(){ this.auto=true; this.nose=R1.NOSE; this.roll=this.rollOf(this.rig.quaternion); this.al=0; this.av.x=this.av.y=0;
    this.lamp.position.set(0,this.HY+1,this.nose+.4); this.lamp.target.position.set(0,this.HY,this.nose+40); },
  // 배 돌리기 : 조종하는 몸(rig)은 그대로 1호를 보고, R-1 만 반 바퀴 — 끝나면 외부 해치가 앞(1호 쪽)
  turn(){ const g=R1.g; let k=0, th=0; this.turned=new Promise(res=>{ const f=dt=>{ k=Math.min(1,k+dt/9); g.rotation.y=Math.PI*k*k*(3-2*k); th-=dt; if(k<1&&th<=0){ th=.7; SFX.play('thruster',{vol:.5}); }
      if(k>=1){ TICK.splice(TICK.indexOf(f),1); this.turned.done=true; toast('배 돌리기 완료 — 외부 해치가 1호 쪽',2200); res(); } }; TICK.push(f); }); },
  // 도킹 기준점 : 보통은 조종하는 몸의 자리 · 도킹 절차에 들어가면 외부 해치 한가운데 (기수 쪽으로 NOSE m · 바닥에서 HY m)
  dockPt(){ const p=this.rig.getWorldPosition(new THREE.Vector3()); if(this.nose) p.add(new THREE.Vector3(0,this.HY,this.nose).applyQuaternion(this.rig.getWorldQuaternion(new THREE.Quaternion()))); return p; },

  /* ---- 장면 만들기 ---- */
  // 변광성 S-09 (4.25) : 1부 끝(SEEK.found)과 같은 노란 공 · 빛무리 둘 · 여드레에 한 번 숨 — 카메라를 따라 860 m 앞(각 크기가 1부와 같다)
  s09(d){ const gl=this._gl||(this._gl=(()=>{ const c=document.createElement('canvas'); c.width=c.height=128; const g=c.getContext('2d'), r=g.createRadialGradient(64,64,0,64,64,64); r.addColorStop(0,'rgba(255,255,255,1)'); r.addColorStop(.25,'rgba(255,255,255,.45)'); r.addColorStop(1,'rgba(255,255,255,0)'); g.fillStyle=r; g.fillRect(0,0,128,128); return new THREE.CanvasTexture(c); })());
    const mk=(c,sc,o)=>{ const sp=new THREE.Sprite(new THREE.SpriteMaterial({map:gl,color:new THREE.Color(c).convertSRGBToLinear(),transparent:true,opacity:o,depthTest:true,depthWrite:false,blending:THREE.AdditiveBlending,fog:false,toneMapped:false})); sp.scale.setScalar(sc); sp.renderOrder=-1; WORLD.add(sp); return sp; };
    const star=new THREE.Mesh(new THREE.SphereGeometry(62,48,32),new THREE.ShaderMaterial({uniforms:{t:{value:0},k:{value:1}},vertexShader:'varying vec3 vN; varying vec3 vP; varying vec3 vV; void main(){ vP=position; vN=normalize(mat3(modelMatrix)*normal); vec4 w=modelMatrix*vec4(position,1.0); vV=normalize(cameraPosition-w.xyz); gl_Position=projectionMatrix*viewMatrix*w; }',
      fragmentShader:'uniform float t,k; varying vec3 vN,vP,vV; float h(vec3 p){ return fract(sin(dot(p,vec3(12.9,78.2,37.7)))*43758.5); } float n(vec3 p){ vec3 i=floor(p),f=fract(p); f=f*f*(3.0-2.0*f); return mix(mix(mix(h(i),h(i+vec3(1,0,0)),f.x),mix(h(i+vec3(0,1,0)),h(i+vec3(1,1,0)),f.x),f.y),mix(mix(h(i+vec3(0,0,1)),h(i+vec3(1,0,1)),f.x),mix(h(i+vec3(0,1,1)),h(i+vec3(1,1,1)),f.x),f.y),f.z); }'
        +' void main(){ vec3 p=vP*.12; float g=n(p+vec3(t*.15))*.6+n(p*2.7-vec3(t*.2))*.4; float mu=max(0.0,dot(normalize(vN),normalize(vV))); vec3 c=mix(vec3(1.0,.5,.1),vec3(1.0,.86,.46),pow(mu,.55)); gl_FragColor=vec4(c*(1.15+.9*g)*k*(.7+.9*mu),1.0); }'}));
    star.renderOrder=-1; WORLD.add(star); const h1=mk(0xffc24a,760,.55), h2=mk(0xff9a2e,1500,.4); let t=0;
    TICK.push(dt=>{ t+=dt; const p=camera.position.clone().addScaledVector(d,860); star.position.copy(p); h1.position.copy(p); h2.position.copy(p); star.material.uniforms.t.value=t; star.material.uniforms.k.value=1+.12*Math.sin(t*.5); h1.material.opacity=.5+.1*Math.sin(t*.5); }); },
  sunSprite(d){ const cv=document.createElement('canvas'); cv.width=cv.height=256; const g=cv.getContext('2d'), gr=g.createRadialGradient(128,128,0,128,128,128);
    gr.addColorStop(0,'#fff'); gr.addColorStop(.1,'rgba(255,226,150,.98)'); gr.addColorStop(.3,'rgba(255,186,90,.24)'); gr.addColorStop(1,'rgba(0,0,0,0)'); g.fillStyle=gr; g.fillRect(0,0,256,256);
    const sp=new THREE.Sprite(new THREE.SpriteMaterial({map:new THREE.CanvasTexture(cv),color:0xffd08a,depthWrite:false,blending:THREE.AdditiveBlending,fog:false,toneMapped:false})); sp.scale.setScalar(300); sp.renderOrder=-1; WORLD.add(sp);
    TICK.push(()=>sp.position.copy(camera.position).addScaledVector(d,900)); },
  // 도킹 고리 : 고리 · 안쪽 해치 · 목(선체로 이어짐) · 주황 표시 셋(롤을 맞추는 기준 — 칠이라 전조등을 받아야 보인다)
  buildPort(port,zf){ const metal=new THREE.MeshStandardMaterial({color:0x6a7076,metalness:.5,roughness:.6}), dark=new THREE.MeshStandardMaterial({color:0x1d2126,metalness:.3,roughness:.8});
    const ring=new THREE.Mesh(new THREE.TorusGeometry(1.9,.28,16,48),metal); port.add(ring);
    const disc=new THREE.Mesh(new THREE.CircleGeometry(1.7,40),dark); disc.position.z=.12; disc.rotation.y=Math.PI; port.add(disc); this.disc=disc;
    const neck=new THREE.Mesh(new THREE.CylinderGeometry(2.1,2.4,6,24,1,true),metal); neck.rotation.x=Math.PI/2; neck.position.z=3.2; port.add(neck);
    const plate=new THREE.Mesh(new THREE.CylinderGeometry(3.4,3.4,.4,32),dark); plate.rotation.x=Math.PI/2; plate.position.z=6; port.add(plate);
    const orange=new THREE.MeshStandardMaterial({color:0xff7a2a,roughness:.5,metalness:0,emissive:0x1c0a02}); this.marks=[];
    for(let k=0;k<3;k++){ const a=k*Math.PI*2/3, m=new THREE.Mesh(new THREE.ConeGeometry(.28,.6,3),orange); m.position.set(Math.sin(a)*2.45,Math.cos(a)*2.45,-.05); m.rotation.z=-a; port.add(m); this.marks.push(m); }
    // 판 위의 막대 여섯 (흰 다섯 · 굵은 주황 하나) : 1호가 도는 것을 눈으로 읽는 기준 (② 회전 맞추기)
    const white=new THREE.MeshStandardMaterial({color:0xd8dde2,roughness:.6,metalness:0,emissive:0x0b0c0d});
    for(let k=0;k<6;k++){ const a=k*Math.PI/3, b=new THREE.Mesh(new THREE.BoxGeometry(k?.16:.5,.8,.06),k?white:orange); b.position.set(Math.sin(a)*2.9,Math.cos(a)*2.9,5.76); b.rotation.z=-a; port.add(b); if(!k) this.bar0=b; } },
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
      el.innerHTML=`<div class="hud"><ol class="stage"><li>접근</li><li>회전 맞추기</li><li>도킹</li></ol><p class="d"></p><p class="s"></p><p class="w"></p><p class="h"></p></div>
      <div class="bracket"><i></i><i></i><i></i><i></i><b></b></div><div class="nose"><i></i><span>끌기</span></div>
      <svg class="ret" viewBox="-50 -50 100 100"><circle class="c" r="48"/><g class="m"><path d="M0 -56V-44"/><circle cx="0" cy="-59" r="2.6"/></g><circle class="k" r="48" pathLength="100" transform="rotate(-90)"/><path class="x" d="M-6 0H6M0 -6V6"/></svg>
      <div class="pads">
        <div class="act">${B('fwd','전진')}${B('back','후진')}${B('rl','롤 ◀')}${B('rr','롤 ▶')}${B('brake','정지')}</div></div>`; document.body.appendChild(el);
      el.querySelectorAll('.pads button').forEach(b=>{ const k=b.dataset.k; b.addEventListener('pointerdown',e=>{ e.stopPropagation(); e.preventDefault(); FLIGHT.btn[k]=true; b.classList.add('on'); });
        ['pointerup','pointerleave','pointercancel'].forEach(t=>b.addEventListener(t,()=>{ FLIGHT.btn[k]=false; b.classList.remove('on'); })); }); }
    el.classList.toggle('on',on); el.classList.remove('stg'); el.dataset.m=''; el.querySelector('.ret').style.display='none'; el.querySelector('.h').textContent='';
    document.body.classList.toggle('flying',on); if(!on) this.btn={};
    window.dragHook=on?(dx,dy)=>{ if(this.docked) return; if(this.mode==='dock'){ if(S.phase!=='play'||TALK.on) return; const q=this.rig.quaternion, up=new THREE.Vector3(0,1,0).applyQuaternion(q), rt=new THREE.Vector3().crossVectors(new THREE.Vector3(0,0,1).applyQuaternion(q),up), k=IS_TOUCH?.006:.004; this.v.addScaledVector(rt,dx*k).addScaledVector(up,-dy*k); return; } if(this.auto) return; const k=IS_TOUCH?.0035:.0024; this.av.y-=dx*k*1.6; this.av.x-=dy*k*1.6; }:null; },
  btn:{},

  /* ---- 매 프레임 : 힘 · 회전 · 충돌 · 도킹 판정 · 카메라 ----
     STAND 대기 자리(고리 앞 m) · CAP 물리는 거리(고리가 화면에 가득 찰 때) · TOL 회전 빠르기 허용 차(rad/s) · TOL3 원의 허용 어긋남(m ≈ 고리 지름의 10 %)
     ACC 롤 단추의 세기(rad/s² · 처음 누를 때 → 오래 누를 때 → 거의 맞았을 때) · CATCH 손을 뗐을 때 이만큼 가까우면 MAG 세기로 1호 빠르기에 살며시 맞춰진다 · HY 외부 해치 한가운데 높이 · GAP 물린 뒤 해치와 고리 사이 */
  STAND:16, CAP:3, TOL:.06, TOL3:.4, ACC:[.06,.24,.06], MAG:.9, CATCH:.11, HY:.85, GAP:.3, HOLD:3,
  OFF:new THREE.Vector3(1.3,.8,0),      // ③에서만 축에서 조금 비켜난다 (원을 고리에 겹치는 일) — 1호와 함께 도는 틀에서 잰다. ②는 축 위에 정확히 (4.15 : 비켜 선 채 롤을 하면 고리가 화면 둘레를 돌아 보였다 — 세차운동처럼)
  tick(dt){ const rig=this.rig, G=this.G, B=this.btn, K=keys;
    // 1호 자전 · 파편
    G.rotation.z+=this.W*dt; for(const m of this.deb){ m.rotation.x+=m.userData.w.x*dt; m.rotation.y+=m.userData.w.y*dt; m.position.addScaledVector(m.userData.v,dt); }
    if(!this.docked){
      // 앞 +z · 위 +y 이면 오른쪽은 −x (뒤 카메라의 오른쪽과 같다)
      const q=rig.quaternion, fw=new THREE.Vector3(0,0,1).applyQuaternion(q), up=new THREE.Vector3(0,1,0).applyQuaternion(q), rt=new THREE.Vector3().crossVectors(fw,up);
      // helm : 조종석 · 후방 조종대에 있을 때만 손이 닿는다
      const ctl=S.phase==='play'&&!TALK.on&&this.helm, m=this.mode, on=k=>ctl&&(K['Key'+this.KEYS[k]]||B[k]);
      const thr=(on('fwd')?1:0)-(on('back')?1:0), lat=(on('right')?1:0)-(on('left')?1:0), ver=(on('up')?1:0)-(on('down')?1:0), rIn=(on('rr')?1:0)-(on('rl')?1:0); this.thr=thr;
      const pr=this.portRel();
      if(!this.auto){
        // ① 접근 : 내가 몬다 — 1호 가까이에선 저절로 속도를 줄인다 (지나쳐 버리지 않게) · 대화 중 · [정지] 는 멈춘다
        this.v.addScaledVector(fw,thr*(thr>0?5:3)*dt).addScaledVector(rt,lat*1.8*dt).addScaledVector(up,ver*1.8*dt);
        const sp=this.v.length(), vmax=pr.rel.length()<180?Math.max(3,pr.rel.length()*.06):32; if(sp>vmax) this.v.multiplyScalar(1-Math.min(1,dt*1.2));
        if(!ctl||on('brake')) this.v.multiplyScalar(1-Math.min(1,dt*(ctl?1.8:1.5)));
        if(ctl){ this.av.y+=((K.ArrowLeft?1:0)-(K.ArrowRight?1:0))*1.4*dt; this.av.x+=((K.ArrowUp?1:0)-(K.ArrowDown?1:0))*1.4*dt; this.av.z+=rIn*.3*dt; }
        // 기수(위아래 · 좌우)는 손을 떼면 멈춘다 (자세 유지 장치)
        this.av.x*=1-Math.min(1,dt*2.2); this.av.y*=1-Math.min(1,dt*2.2);
        rig.rotateX(-this.av.x*dt); rig.rotateY(this.av.y*dt); rig.rotateZ(this.av.z*dt);
      } else {
        // ② · ③ : 축 · 기수는 VEGA 가 잡는다 — 남는 것은 롤 하나. ②에서만 손으로 돌리고, 맞으면(2초) 고정된다
        // ② 회전 : 변수는 회전 하나. 짧게 누르면 아주 조금 · 오래 누르면 점점 세게 · 1호와 거의 같아지면 다시 조금씩 (지나치지 않게) · 손을 떼면 그 빠르기를 지키고, 거의 같으면 1호 빠르기로 살며시 맞춰진다
        if(m==='spin'){ if(ctl){ const [a0,a1,a2]=this.ACC; let e=this.av.z-this.W; this.rT=rIn&&rIn===this.rD?(this.rT||0)+dt:0; this.rD=rIn; const acc=Math.abs(e)<.12?a2:lerp(a0,a1,clamp((this.rT-.25)/1.2,0,1));
            this.av.z=clamp(this.av.z+rIn*acc*dt,-1,1); e=this.av.z-this.W; if(!rIn&&Math.abs(e)<this.CATCH) this.av.z-=e*Math.min(1,dt*this.MAG);
            this.syncT=Math.abs(this.av.z-this.W)<this.TOL?this.syncT+dt:0; if(this.syncT>=this.HOLD) this.locked(); } }
        else if(this.sync) this.av.z=this.W;
        else this.av.z*=1-Math.min(1,dt*1.5);
        // 기수는 1호의 긴 축(+z)으로 · 롤은 외부 해치의 축을 중심으로 (해치가 제자리에서 돈다)
        const d0=this.dockPt(); this.roll+=this.av.z*dt; const qd=new THREE.Quaternion().setFromAxisAngle(new THREE.Vector3(0,0,1),this.roll);
        this.al=Math.min(1,this.al+dt/4); if(this.al<1) rig.quaternion.slerp(qd,Math.min(1,dt*1.6)); else rig.quaternion.copy(qd);
        rig.position.add(d0.sub(this.dockPt()));
        // 고정된 뒤(③)에는 1호와 함께 도는 틀에서 움직인다 : 축에서 벗어난 만큼과 속도를 같이 돌린다 → 고리가 화면에서 제자리에 있다
        if(this.sync){ const th=this.av.z*dt, c=Math.cos(th), sn=Math.sin(th), o=pr.rel; rig.position.x+=c*o.x-sn*o.y-o.x; rig.position.y+=sn*o.x+c*o.y-o.y; const v=this.v, vx=v.x; v.x=c*vx-sn*v.y; v.y=sn*vx+c*v.y; }
        if(m==='dock'){
          // ③ 도킹 : 이동 단추로 원을 고리에 · [전진]으로 다가간다. 손을 떼면 미끄러짐을 잡고, 고리에 가까울수록 느리게 (VEGA)
          this.v.addScaledVector(fw,thr*(thr>0?1.6:1.3)*dt).addScaledVector(rt,lat*1.1*dt).addScaledVector(up,ver*1.1*dt);
          if(!lat) this.v.addScaledVector(rt,-this.v.dot(rt)*Math.min(1,dt*2.2)); if(!ver) this.v.addScaledVector(up,-this.v.dot(up)*Math.min(1,dt*2.2)); if(!thr) this.v.addScaledVector(fw,-this.v.dot(fw)*Math.min(1,dt*.9));
          const vmax=pr.d>12?1.6:pr.d>6?1:.6, vf=this.v.dot(fw); if(vf>vmax) this.v.addScaledVector(fw,(vmax-vf)*Math.min(1,dt*3));
          if(!ctl||on('brake')) this.v.multiplyScalar(1-Math.min(1,dt*2));
          const o=pr.rel.clone().addScaledVector(pr.out,-pr.d);
          // 도킹 보조 : 원을 고리 쪽으로 조금씩 끌어 준다 · 너무 멀리 벗어나면 되돌린다 (옆 10 m · 앞 40 m)
          if(this.assist) this.v.addScaledVector(o,-dt*.5);
          if(pr.lat>10) this.v.addScaledVector(o,-dt*.3); if(pr.d>40) this.v.addScaledVector(fw,dt*1.5);
        } else {
          // 대기 자리 : 고리 앞 STAND m · 축 한가운데 (VEGA 가 붙잡아 둔다 — 회전 말고는 움직이지 않는다) · 고정되면 ③을 위해 조금 비켜난다 (함께 도는 틀)
          this.v.multiplyScalar(1-Math.min(1,dt*(m==='spin'?8:1.4))); const at=pr.pp.clone().addScaledVector(pr.out,this.STAND); if(this.sync) at.add(this.OFF.clone().applyAxisAngle(new THREE.Vector3(0,0,1),this.roll));
          const e=at.sub(this.dockPt()), L=e.length(); this.settled=L<.06; if(L<.004||(m==='spin'&&L<.06)) rig.position.add(e); else rig.position.addScaledVector(e,Math.min(1,dt*(this.sync?1.6:.8),5*dt/L));
        }
      }
      if(this.v.length()>32) this.v.setLength(32);
      rig.position.addScaledVector(this.v,dt);
      this.collide();
      if(m==='dock') this.dockCheck(); else if(!this.auto&&this.onNear&&(pr.d<70&&pr.d>0&&pr.lat<30||pr.rel.length()<80)){ const r=this.onNear; this.onNear=null; r(); }
      // 계기 : 조종간 · 추력 손잡이가 손을 따라 움직인다
      if(this.stick) this.stick.rotation.set(this.av.x*.8,0,-this.av.y*.8-(this.av.z-(this.sync?this.W:0))*2);
      if(this.throttle) this.throttle.position.z=(this.thr||0)*.025;
      this._th=(this._th||0)-dt; if((thr||lat||ver||rIn)&&this._th<=0){ this._th=.45; SFX.play('thruster',{vol:.5+.4*Math.abs(thr)}); }
    }
    // 먼지 : 내 둘레로 감싼다
    const dp=this.dustPts.geometry.attributes.position, c=rig.getWorldPosition(new THREE.Vector3()); for(let i=0;i<dp.count;i++){ for(let a=0;a<3;a++){ let v=dp.array[i*3+a]-c.getComponent(a); if(v>40) dp.array[i*3+a]-=80; else if(v<-40) dp.array[i*3+a]+=80; } } dp.needsUpdate=true;
    // 카메라 : 앉아 있으면 조종석 눈 + 고개 (조종석은 +z 를 본다) · 후방 조종대면 외부 해치 축 위의 뒤 카메라 (화면 한가운데 = 내 해치가 가는 곳) · 걸을 때는 R1 이 놓는다
    const gw=R1.g.getWorldQuaternion(new THREE.Quaternion());
    if(R1.seated&&!this.boarding){ camera.position.copy(R1.eye()); camera.quaternion.copy(gw).multiply(new THREE.Quaternion().setFromEuler(new THREE.Euler(this.head.p,Math.PI+this.head.y,0,'YXZ'))); }
    else if(this.aftcam){ R1.g.updateWorldMatrix(true,false); camera.position.copy(new THREE.Vector3(0,this.HY,-12.25).applyMatrix4(R1.g.matrixWorld)); camera.quaternion.copy(gw); }
    this.hud(); },
  // 계기판 : 단계 · 거리 · 속도 · 목표 괄호와 기수 화살표(①) · 가운데 원(② 2초 채우기 · ③ 조준) · 빛나는 단추와 한 줄 도움말
  hud(){ const el=$('#flight'); if(!el||!el.classList.contains('on')) return; const {pp,d,lat,rel}=this.portRel(), sp=this.v.length(), q=this.rig.quaternion, m=this.mode, L=rel.length();
    const fw=new THREE.Vector3(0,0,1).applyQuaternion(q), up=new THREE.Vector3(0,1,0).applyQuaternion(q), rt=new THREE.Vector3().crossVectors(fw,up), W=new Set();
    el.classList.toggle('stg',!!this.stage); el.dataset.m=m||''; el.querySelectorAll('.stage li').forEach((li,i)=>{ li.className=i+1<this.stage?'ok':i+1===this.stage?'cur':''; });
    const c=this.G.getWorldPosition(new THREE.Vector3()), far=L>60, tgt=far&&L>150?c:pp, n=tgt.clone().project(camera), vis=!this.auto&&n.z<1&&Math.abs(n.x)<1.2&&Math.abs(n.y)<1.2;
    el.querySelector('.d').textContent=(far?'1호 도킹 고리까지 ':'고리까지 ')+Math.max(0,L).toFixed(L<20?1:0)+' m'; el.querySelector('.s').textContent='속도 '+sp.toFixed(sp<3?2:1)+' m/s'+(this.assist?' · 도킹 보조':'')+(this.sync?' · 회전 고정':'');
    const br=el.querySelector('.bracket'); br.style.display=vis?'block':'none'; if(vis){ const sz=far?Math.max(40,Math.min(260,9000/Math.max(L,1))):Math.max(36,Math.min(300,600/Math.max(d,1))); br.style.left=((n.x+1)/2*innerWidth)+'px'; br.style.top=((1-n.y)/2*innerHeight)+'px'; br.style.width=br.style.height=sz+'px'; br.querySelector('b').textContent=far&&L>150?'HUY-1':'도킹 고리'; }
    // ① 기수 : 목표가 화면 가운데에서 벗어나면 끌 방향 화살표 (끈 쪽으로 기수가 돈다)
    const to=tgt.clone().sub(this.rig.position).normalize(), wx=to.dot(rt), wy=to.dot(up), off=Math.acos(clamp(to.dot(fw),-1,1)), nose=el.querySelector('.nose');
    const turn=!this.auto&&off>.14&&S.phase==='play'; nose.style.display=turn?'block':'none'; if(turn) nose.style.transform=`translate(-50%,-50%) rotate(${Math.atan2(-wy,wx)}rad)`;
    let w='', h='', rpx=0, good=false, k=0;
    if(!this.auto){
      // 순항 : 멀면 초속 12 m 까지 [전진]이 빛난다 — 가까워지면 저절로 줄인다
      if(this.onNear&&this.v.dot(to)<Math.min(12,L*.05)&&L>90) W.add('fwd');
      w=this.v.length()>2&&L<120?'1호 가까이 — 저절로 속도를 줄인다':'';
      h=turn?byDevice('화면을 화살표 쪽으로 끌어(또는 방향키) 기수를 1호로','화면을 화살표 쪽으로 끌어 기수를 1호로'):W.has('fwd')?byDevice('W 를 눌러 다가간다','[전진] 을 눌러 다가간다'):'';
    } else if(m==='spin'){
      // ② : 1호가 어느 쪽으로 돌아 보이는지 · 어느 단추인지만 알려 준다 — 같아졌는지는 눈으로 (1호가 멈춰 보인다)
      const e=this.av.z-this.W, a=Math.abs(e), how=a>.3?'빠르게 ':a>.1?'':'천천히 '; good=a<this.TOL; k=Math.min(1,this.syncT/this.HOLD); rpx=Math.min(innerWidth,innerHeight)*.2; if(!good) W.add(e<0?'rr':'rl');
      // 원 바깥 주황 점 = 1호 판의 주황 막대가 화면에서 있는 쪽 (돌아 보이면 점이 돈다 · 맞으면 멈춘다)
      const bp=this.bar0.getWorldPosition(new THREE.Vector3()).project(camera), ang=Math.atan2(bp.x*camera.aspect,bp.y)*180/Math.PI; el.querySelector('.ret .m').setAttribute('transform','rotate('+ang.toFixed(1)+')');
      h=good?'1호가 멈춰 보인다 — 손을 떼고 그대로 '+this.HOLD+'초':e<0?'주황 점이 시계 방향(↻)으로 '+how+'돈다 — '+byDevice('E','[롤 ▶]')+' 를 '+(a<.14?'톡톡 짧게':'길게')+' 눌러 같은 쪽으로':'주황 점이 거꾸로(↺) '+how+'돈다, 너무 빨리 돌았다 — '+byDevice('Q','[롤 ◀]')+' 를 '+(a<.14?'톡톡 짧게':'길게')+' 눌러 늦춘다';
    } else if(m==='dock'){
      // ③ : 가운데 원 = 내 해치. 원의 크기는 지금 거리에서 보이는 고리의 크기 — 겹치면 초록
      const cd=Math.max(.6,d-.35), o=pp.clone().sub(this.dockPt()), tx=clamp(o.dot(rt)*.6,-1,1)-this.v.dot(rt), ty=clamp(o.dot(up)*.6,-1,1)-this.v.dot(up);
      rpx=Math.min(Math.min(innerWidth,innerHeight)*.47,1.9/cd/Math.tan(camera.fov*Math.PI/360)*innerHeight/2); good=lat<=this.TOL3; k=good?1:0;
      if(lat>this.TOL3*.6){ if(Math.hypot(tx,ty)>.08&&S.phase==='play'){ nose.style.display='block'; nose.style.transform=`translate(-50%,-50%) rotate(${Math.atan2(-ty,tx)}rad)`; } h='화면을 화살표 쪽으로 끌어 원을 도킹 고리에 겹친다'; }
      else { if(this.v.dot(fw)<.3) W.add('fwd'); h='원이 고리에 겹쳤다 — '+byDevice('W','[전진]')+' 로 끝까지 붙인다'; }
    } else if(!this.sync&&S.phase==='play') h='VEGA 가 고리 앞 '+this.STAND+' m 에 배를 세우는 중';
    el.querySelector('.w').textContent=w; el.querySelector('.h').textContent=TALK.on?'':h;
    const ret=el.querySelector('.ret'); ret.style.display=rpx?'block':'none';
    if(rpx){ ret.style.width=ret.style.height=(rpx*2/.96)+'px'; ret.classList.toggle('ok',good); const ring=ret.querySelector('.k'); ring.style.strokeDasharray='100'; ring.style.strokeDashoffset=String(100*(1-k)); ring.style.display=m==='spin'?'':'none'; ret.querySelector('.m').style.display=m==='spin'?'':'none'; }
    this.want=W; el.querySelectorAll('.pads button').forEach(b=>b.classList.toggle('want',W.has(b.dataset.k))); },
  // 도킹 고리 기준 : d = 고리 앞으로의 거리 · lat = 축에서 벗어난 거리 · rel = 고리에서 나(도킹 기준점)까지
  portRel(){ const pp=this.port.getWorldPosition(new THREE.Vector3()), out=new THREE.Vector3(0,0,-1), rel=this.dockPt().sub(pp), d=rel.dot(out), lat=rel.clone().addScaledVector(out,-d).length(); return {pp,d,lat,rel,out}; },
  // 선체 충돌 : 1호 상자(조금 줄인) 안으로 들어가면 튕긴다
  collide(){ const G=this.G, loc=G.worldToLocal(this.dockPt()), b=this.hb, m=.9;
    if(loc.x>b.min.x*m&&loc.x<b.max.x*m&&loc.y>b.min.y*m&&loc.y<b.max.y*m&&loc.z>b.min.z+4&&loc.z<b.max.z){ const c=new THREE.Vector3(0,0,(b.min.z+b.max.z)/2), n=loc.clone().sub(c); n.z*=.3; n.normalize().transformDirection(G.matrixWorld);
      this.rig.position.addScaledVector(n,1.2); this.v.reflect(n).multiplyScalar(.3); this.bump('선체 충돌!'); } },
  bump(t){ if(this._bt>S.t) return; this._bt=S.t+1; FX.shake(.6,.06); AUDIO.noise(.6,.4,0,300); AUDIO.tone(70,.5,'sawtooth',.08,0,-30); toast(t,1500); },
  // 롤 : 위쪽 벡터의 xy 각 (1호 G.rotation.z 와 같은 잣대)
  rollOf(q){ const u=new THREE.Vector3(0,1,0).applyQuaternion(q); return Math.atan2(-u.x,u.y); },
  // ② 끝 : 같은 빠르기를 2초 지켰다 → 회전 고정 (이제 1호와 함께 돈다)
  locked(){ this.sync=true; this.av.z=this.W; this.mode='hold'; AUDIO.tone(660,.12,'sine',.06); AUDIO.tone(990,.18,'sine',.06,.12); toast('회전 고정 — 1호가 멈춰 보인다',2000); const r=this.onSync; this.onSync=null; r&&r(); },
  // ③ 판정 : 고리가 화면에 가득 찰 만큼(CAP m) 다가왔을 때 원이 고리에 겹쳐 있으면(어긋남 TOL3 안) 물린다 · 아니면 고리 테에 밀려난다
  dockCheck(){ const {d,lat}=this.portRel(); if(d>=this.CAP||d<-2) return;
    if(lat<=this.TOL3) return this.latch();
    this.v.set(this.v.x*.2,this.v.y*.2,-1.3); this.rig.position.z-=this.CAP-d+.25; this.fails++; this.bump('도킹 실패 — 원이 고리에서 벗어났다');
    if(this.fails===2&&!this.assist){ this.assist=true; TALK.say([VG('도킹 보조를 켭니다. 원을 고리 쪽으로 조금씩 끌어 드리겠습니다.')]); } },
  // 잠김 : '탁' — 고리가 해치를 끌어당겨 물고, 1호와 함께 돈다 (이제 창밖의 우주가 돈다)
  async latch(){ if(this.docked) return; this.docked=true; this.mode=null; S.phase='cut'; P.free=false; goal('');
    const G=this.G, rig=this.rig; G.attach(rig); this.v.set(0,0,0); this.av.set(0,0,0); AUDIO.tone(180,.12,'square',.07); AUDIO.noise(.25,.3,0,500); FX.shake(.35,.03); toast('포착 — 걸쇠가 문다',1600);
    // 외부 해치 한가운데가 고리 한가운데(GAP m 앞)에 오도록 끌려 들어간다 (G 안의 좌표)
    const from=rig.position.clone(), to=this.port.position.clone().add(new THREE.Vector3(0,0,-this.GAP)).sub(new THREE.Vector3(0,this.HY,this.nose).applyQuaternion(rig.quaternion)); let k=0;
    await new Promise(res=>{ const f=dt=>{ k=Math.min(1,k+dt/1.8); rig.position.lerpVectors(from,to,k*k*(3-2*k)); if(k>=1){ TICK.splice(TICK.indexOf(f),1); res(); } }; TICK.push(f); });
    SFX.play('dock'); FX.shake(.8,.05); await sleep(1600); FX.shake(.3,.03); await sleep(900);
    // 뒤 카메라를 끄고 해치 방으로
    this.ui(false); this.helm=false; this.aftcam=false; document.body.classList.remove('aftcam'); this.lamp.intensity=0;
    await TALK.say([VG('도킹 고리 잠김. 걸쇠 셋 — 모두 물렸습니다.'),VG('회전 동기화 완료. 이제 우리가 1호와 함께 돕니다.'),I('…창밖의 별이 돈다.'),
      VG('연결 통로 기밀 확인. 1호 안의 공기는 알 수 없습니다. 1호의 센서가 모두 죽어 있습니다.'),VG('우주복을 입고 건너가십시오. 보관함은 해치 옆에 있습니다.'),
      VG('그레이 국장의 지시를 다시 알려 드립니다 — 권총을 챙기십시오.'),I('…18 헤르츠. 그 소리가 뭔지 이제 알게 되겠군.')]);
    const r=this.onDock; this.onDock=null; r&&r(); },
  // 연결 통로 : R-1 외부 해치의 벽 두께 안에서 시작해 1호 쪽 문까지 틈 없이 이어진 통 (안에서 바깥 우주가 보이지 않는다) · 발판 · 띠 조명
  //   1호 쪽 끝 : 문틀(가운데가 뚫린 판) · 두 쪽 문 · 그 너머는 1호의 캄캄한 에어록 — 고리 안쪽 판은 치운다 (통로가 지나간다)
  tunnel(g){ const L=5, HY=this.HY, T=new THREE.Group(); g.add(T); T.position.set(0,HY,-11.78); T.rotation.y=Math.PI; if(this.disc) this.disc.visible=false;
    const tm=new THREE.MeshStandardMaterial({color:0x1b2026,emissive:0x080b0f,metalness:.2,roughness:.9,side:THREE.BackSide}), tube=new THREE.Mesh(new THREE.CylinderGeometry(1.15,1.15,L,24,1,true),tm); tube.rotation.x=Math.PI/2; tube.position.z=L/2; T.add(tube);
    const deck=new THREE.Mesh(new THREE.BoxGeometry(1.5,.05,L),new THREE.MeshStandardMaterial({color:0x15181b,metalness:.6,roughness:.75})); deck.position.set(0,-HY-.025,L/2); T.add(deck);
    for(let i=0;i<6;i++){ const s=new THREE.Mesh(new THREE.TorusGeometry(1.13,.035,6,28),new THREE.MeshBasicMaterial({color:i%2?0x6f9fc4:0x20252b,toneMapped:false})); s.position.z=.3+i*.88; T.add(s); }
    const lt=new THREE.PointLight(0x9fd8ff,.55,4.6,1.8); lt.position.set(0,.7,1.9); T.add(lt);
    const sh=new THREE.Shape(); sh.moveTo(-1.4,-1.4); sh.lineTo(1.4,-1.4); sh.lineTo(1.4,1.4); sh.lineTo(-1.4,1.4); sh.lineTo(-1.4,-1.4);
    const ho=new THREE.Path(); ho.moveTo(-.75,-HY); ho.lineTo(-.75,.95); ho.lineTo(.75,.95); ho.lineTo(.75,-HY); ho.lineTo(-.75,-HY); sh.holes.push(ho);
    const frame=new THREE.Mesh(new THREE.ShapeGeometry(sh),new THREE.MeshStandardMaterial({color:0x2c3036,metalness:.6,roughness:.7,side:THREE.DoubleSide})); frame.position.z=L; T.add(frame);
    const hm=new THREE.MeshStandardMaterial({color:0x3b4047,metalness:.6,roughness:.65}), h1=new THREE.Mesh(new THREE.BoxGeometry(.75,1.8,.08),hm), h2=h1.clone(); h1.position.set(-.375,.05,L-.06); h2.position.set(.375,.05,L-.06); T.add(h1,h2);
    const red=new THREE.PointLight(0xff2a14,.7,2.4,1.8); red.position.set(0,.8,L-.45); T.add(red);
    const room=new THREE.Mesh(new THREE.BoxGeometry(2.8,2.6,3.2),new THREE.MeshStandardMaterial({color:0x08090a,metalness:.3,roughness:.95,side:THREE.BackSide})); room.position.set(0,.3,L+1.6); T.add(room);
    return Object.assign(T,{h1,h2,red}); },
  // 우주복 : 보관함 앞에 서서 → 꺼내 입고(화면이 잠깐 어두워진다) → 헬멧을 잠근다 (헬멧 테 · 숨소리)
  async suitUp(){ S.phase='cut'; P.free=false; goal(''); await camTo({x:0,z:-10.6,yaw:Math.PI/2,pitch:-.1,eye:1.5},.8);
    await DO.doors(true); SFX.play('cloth'); const hs=[HANDS.make('R'),HANDS.make('L')], sp=DO.D.suits&&DO.D.suits[0]; if(sp){ const c=DO.gp(sp,V3(0,.15,.1)); await Promise.all(hs.map((h,i)=>HANDS.enter(h,R1.g,c.clone().add(V3(0,0,i?.16:-.16)),V3(0,1,0),.6))); }
    await fade(true,700); hs.forEach(h=>HANDS.remove(h)); if(sp) sp.visible=false; SFX.play('cloth'); await sleep(900); SFX.play('cloth'); await sleep(700); SFX.play('locker_close',{vol:.6}); DO.leaf(0); DO.D.il.intensity=0; await sleep(500);
    SFX.play('airlock',{vol:.35}); HANDS.suit=true; HELMET.on(true); await fade(false,1000); $('#fade').style.background='';
    await TALK.say([I('…공기가 있을지 없을지는, 열어 봐야 안다.'),VG('우주복 기밀 정상. 산소 여섯 시간분. 외부 해치를 여십시오.')]); S.phase='play'; P.free=true; },
  // 해치를 지나 1호로 : 우주복을 입고 → 외부 해치를 직접 연다 → 연결 통로 → 1호 쪽 문을 손으로 연다
  async board(){ this.boarding=true; const T=this.tunnel(R1.g);
    // 해치 방에서 (P 는 R-1 안의 좌표 · 해치는 −z 쪽) : 1호 안에 공기가 있는지 모른다 → 보관함에서 우주복부터
    S.phase='play'; P.free=true;
    await TALK.say([I('…권총. 그리고 손전등.')]);
    R1.on.hatch=()=>TALK.say([VG('우주복부터 입으십시오, 크리스.')]);
    await R1.task('locker','우주복 보관함 — 우주복을 입는다'); delete R1.on.hatch;
    await this.suitUp();
    await R1.task('hatch','외부 해치를 연다 — 연결 통로 너머가 1호');
    // 핸들을 잡고 OPEN 쪽으로 끝까지 돌린다 → 해치가 옆으로 열린다
    await DO.wheel(-1,1.25); S.phase='cut'; P.free=false; goal(''); await camTo({x:0,z:-11.0,yaw:0,pitch:0,eye:1.5},.6);
    toast('외부 해치 개방',1200); await R1.openHatch();
    // 연결 통로를 걷는다 (1호 쪽 문 = −z 로 5 m)
    await camTo({x:0,z:-12.9,eye:1.5},1.5); await camTo({x:0,z:-15.3},1.7);
    await TALK.say([I('…1호 쪽 문. 손으로 연다.')]);
    await camTo({z:-16.02,pitch:-.1},.7); const dh=[HANDS.make('R'),HANDS.make('L')], DZ=-16.66; await Promise.all(dh.map((h,i)=>HANDS.enter(h,R1.g,V3(i?-.05:.05,1.16,DZ),V3(0,1,0),.6))); dh.forEach(h=>HANDS.pose(h,'grip',.2)); await sleep(350);
    // 1호 해치 : 잠금을 풀고 양쪽으로 미끄러진다 → 캄캄한 1호 에어록으로
    SFX.play('airlock',{vol:.8}); let k=0; await new Promise(res=>{ const f=dt=>{ k=Math.min(1,k+dt/1.4); T.h1.position.x=-.375-k*.75; T.h2.position.x=.375+k*.75; dh.forEach((h,i)=>HANDS.put(h,V3((i?-1:1)*(.05+k*.5),1.16,DZ),V3(0,1,0))); T.red.intensity=.7*(1-k); if(k>=1){ TICK.splice(TICK.indexOf(f),1); res(); } }; TICK.push(f); });
    dh.forEach(h=>HANDS.exit(h,.4)); await camTo({x:0,z:-17.4},1.8); AUDIO.noise(1.5,.15,0,600);
    fade.next='1호로 들어가는 중'; await fade(true,1400); HANDS.suit=false; TICK.splice(TICK.indexOf(this.fn),1); this.boarding=false; this.auto=false; this.stage=0; window.dragHook=null; window.camHook=null; document.body.classList.remove('flying'); },
  // 1호로 들어간 뒤 : R-1 과 1호 겉모습을 그래픽 메모리에서 내린다 (디벗 · 다시 쓰면 저절로 올라온다)
  free(){ const seen=new Set(); [R1.g,this.G].forEach(r=>r&&r.traverse(o=>{ if(!o.isMesh) return; o.geometry.dispose(); (Array.isArray(o.material)?o.material:[o.material]).forEach(m=>['map','normalMap','roughnessMap','metalnessMap','emissiveMap','aoMap'].forEach(k=>{ const t=m[k]; if(t&&!seen.has(t)){ seen.add(t); t.dispose(); } })); })); }
};
