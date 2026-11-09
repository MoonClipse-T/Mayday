/* ============================================================
   여정 (4.4) — 회의 다음 주, 혼자 떠나 웜홀을 건너기까지 (화면 전환 없이 한 흐름 · 동료 없음)
   ① 발사 : 케네디 39B 새벽 · R-1 을 실은 로켓 (launch.glb — Space Center Realistic Launch Facility, CC BY) · 카운트다운 → 점화 → 이륙
   ② 지구 궤도 출발 : R-1 조종석 · 발아래 지구 (낮 · 밤 · 구름) · 상단 분리 → 이온 엔진 점화 → 지구가 멀어진다 → 동면
   ③ 넉 달 뒤 목성 : 동면에서 깨어나 · 창밖을 채운 목성(실제 공 · 위성 둘) → 직접 몰고 웜홀로 → 경계에서 자동 진입 → 터널 → 하얗게
   → scenes/flight.js 웜홀 건너편 (1호를 찾아 직접 몰고 간다)
   문제 자리 : JOURNEY.slot('이름') — 지금은 그냥 지나간다. 사용자가 문제를 주면 여기에 끼운다 (발사 전 · 궤도 · 목성 · 웜홀 앞)
   조종석 안에서는 화면을 끌어 고개를 돌려 둘러볼 수 있다
   ============================================================ */
'use strict';
const JOURNEY={
  // 문제를 끼울 자리 (지금은 비어 있다)
  slots:{}, async slot(name){ const f=this.slots[name]; if(f) await f(); },
  async run(from='launch'){ if(from==='launch') await this.launch(); if(from==='launch'||from==='depart') await this.depart(); await this.jupiter(); },
  // 장면이 TICK 에 넣은 것 · 끌기 손잡이를 한 번에 치운다
  _t:[], tick(f){ TICK.push(f); this._t.push(f); return f; },
  clean(){ this._t.forEach(f=>{ const i=TICK.indexOf(f); if(i>=0) TICK.splice(i,1); }); this._t=[]; window.dragHook=null; window.camHook=null; P.look=false; scene.fog=null; camera.rotation.z=0; },
  R:(t,who='발사 관제 · 다니엘',auto)=>({who,ch:'무전',kind:'radio',t,auto:auto||Math.max(1600,t.length*95+700)}),
  C:(t,auto)=>({kind:'me',t,auto:auto||Math.max(1600,t.length*95+800)}),
  V:(t,auto)=>({who:'VEGA',ch:'구조정 AI',kind:'vega',t,auto:auto||Math.max(1800,t.length*95+800)}),

  /* ---- ① 발사 ---- */
  async launch(){ const {R,C}=this; S.phase='cut'; P.free=false; goal('');
    SHIP.preload();
    await LEVEL.load('launch',{solid:false}); SKY.clear();
    // 새벽 하늘 : 지평선은 주황, 위로 갈수록 남색
    const sky=new THREE.Mesh(new THREE.SphereGeometry(1600,32,16),new THREE.ShaderMaterial({side:THREE.BackSide,depthWrite:false,fog:false,
      vertexShader:'varying vec3 vP; void main(){ vP=position; gl_Position=projectionMatrix*modelViewMatrix*vec4(position,1.0); }',
      fragmentShader:'varying vec3 vP; void main(){ vec3 d=normalize(vP); float h=d.y; float sunA=max(0.0,dot(d,normalize(vec3(.8,.05,-.6))));'
        +'vec3 c=mix(vec3(1.0,.55,.3),vec3(.33,.4,.62),smoothstep(0.0,.25,h)); c=mix(c,vec3(.05,.08,.2),smoothstep(.25,.9,h)); c+=vec3(1.0,.7,.4)*pow(sunA,24.0)*1.5+vec3(1.0,.5,.25)*pow(sunA,4.0)*.25;'
        +'if(h<0.0) c=mix(vec3(.25,.22,.22),c,exp(h*30.0)); gl_FragColor=vec4(c,1.0); }'}));
    sky.renderOrder=-3; WORLD.add(sky); this.tick(()=>sky.position.copy(camera.position)); scene.fog=new THREE.Fog(0xb59a8c,300,1500);
    WORLD.traverse(o=>{ if(o.isMesh&&o.material&&!o.material.map&&o.material.color&&o.material.color.r>.8) o.material.color.setRGB(.5,.5,.52); });
    WORLD.add(new THREE.HemisphereLight(0xc8c8e0,0x3a3028,.9)); const sun=new THREE.DirectionalLight(0xffc08a,1.6); sun.position.set(800,60,-600); WORLD.add(sun);
    renderer.toneMappingExposure=1.0;
    const rocket=LEVEL.root.getObjectByName('ANIM_rocket'), rb=new THREE.Box3().setFromObject(rocket), base=new THREE.Vector3((rb.min.x+rb.max.x)/2,rb.min.y,(rb.min.z+rb.max.z)/2), H=rb.max.y-rb.min.y;
    // 불꽃 (원뿔 · 더하기 섞기) · 빛 · 연기
    const flame=new THREE.Mesh(new THREE.ConeGeometry(2.6,22,24,1,true),new THREE.ShaderMaterial({transparent:true,depthWrite:false,blending:THREE.AdditiveBlending,uniforms:{t:{value:0},k:{value:0}},
      vertexShader:'varying vec2 vUv; void main(){ vUv=uv; gl_Position=projectionMatrix*modelViewMatrix*vec4(position,1.0); }',
      fragmentShader:'uniform float t,k; varying vec2 vUv; void main(){ float a=pow(vUv.y,1.6)*(0.75+0.25*sin(vUv.y*40.0-t*60.0)); vec3 c=mix(vec3(1.0,.45,.1),vec3(1.0,.95,.8),pow(vUv.y,3.0)); gl_FragColor=vec4(c*a*k*1.6,a*k); }'}));
    flame.rotation.x=Math.PI; flame.visible=false; WORLD.add(flame);
    const glow=new THREE.PointLight(0xff8a3a,0,320,1.4); WORLD.add(glow);
    const puff=(()=>{ const c=document.createElement('canvas'); c.width=c.height=128; const x=c.getContext('2d'), g=x.createRadialGradient(64,64,0,64,64,64); g.addColorStop(0,'rgba(255,255,255,.95)'); g.addColorStop(.6,'rgba(255,255,255,.35)'); g.addColorStop(1,'rgba(255,255,255,0)'); x.fillStyle=g; x.fillRect(0,0,128,128); return new THREE.CanvasTexture(c); })();
    const N=LITE?90:160, smoke=[], sm=new THREE.SpriteMaterial({map:puff,color:0xd8cfc8,transparent:true,depthWrite:false,opacity:0,fog:true});
    for(let i=0;i<N;i++){ const s=new THREE.Sprite(sm.clone()); s.visible=false; WORLD.add(s); smoke.push({s,life:0,v:new THREE.Vector3()}); }
    let si=0; const emit=(p,spread,up)=>{ const o=smoke[si++%N]; o.s.position.copy(p).add(new THREE.Vector3((Math.random()-.5)*spread,0,(Math.random()-.5)*spread)); o.life=0; o.s.visible=true;
      const a=Math.random()*Math.PI*2; o.v.set(Math.cos(a)*(8+Math.random()*16),up+Math.random()*6,Math.sin(a)*(8+Math.random()*16)); o.s.scale.setScalar(6); };
    let ign=0, lift=0, y0=0, vy=0;
    this.tick(dt=>{ flame.material.uniforms.t.value+=dt; if(ign){ ign+=dt; flame.visible=true; flame.material.uniforms.k.value=Math.min(1,ign*1.5);
        if(lift){ vy+=dt*(4+lift*2.5); lift+=dt; y0+=vy*dt; rocket.position.y=y0; }
        const nz=base.clone(); nz.y=rb.min.y+y0; flame.position.set(nz.x,nz.y-10,nz.z); flame.scale.setScalar(1+Math.min(1,ign*.5)); glow.position.set(nz.x,nz.y+2,nz.z); glow.intensity=(6+Math.random()*3)*Math.min(1,ign);
        for(let k=0;k<(LITE?2:4);k++) emit(nz,lift?3:10,lift?-4:2);
        const sh=Math.max(0,.35-Math.max(0,lift-6)*.04)*Math.min(1,ign); camera.position.x+=(Math.random()-.5)*sh; camera.position.y+=(Math.random()-.5)*sh; }
      smoke.forEach(o=>{ if(!o.s.visible) return; o.life+=dt; o.s.position.addScaledVector(o.v,dt); o.v.multiplyScalar(.985); o.v.y+=dt*1.5; o.s.scale.setScalar(6+o.life*9); o.s.material.opacity=Math.max(0,.55*(1-o.life/9)); if(o.life>9) o.s.visible=false;
        o.s.material.color.setRGB(.85+.15*Math.max(0,1-o.life/2),.8,.76); }); });
    // 카메라 : 관람석 (로켓에서 약 420 m) → 이륙하면 따라 올려다본다
    const view=(dist,ang,eye)=>{ P.x=base.x+Math.cos(ang)*dist; P.z=base.z+Math.sin(ang)*dist; P.y=0; P.eye=eye; };
    const aim=y=>{ P.yaw=Math.atan2(-(base.x-P.x),-(base.z-P.z)); P.pitch=Math.atan2(y-(P.y+P.eye),Math.hypot(base.x-P.x,base.z-P.z)); };
    let track=0; view(330,.9,2.2); aim(rb.min.y+H*.55); this.tick(()=>{ if(track) aim(rb.min.y+y0+H*track); });
    stamp('케네디 우주 센터 · 39B 발사대','2091.03.21  05:52'); cine(true); AUDIO.hum(.4,70);
    await fade(false,1800);
    await card('일주일 뒤','2091년 3월 21일','케네디 우주 센터 · 발사대 39B',2600);
    await this.slot('발사 전');
    await TALK.say([R('R-1 구조정, 여기는 발사 관제. 기상 양호. 탑승 인원 한 명 확인.'),C('창밖이 밝아 온다. 이게 마지막으로 보는 지구의 아침일지도 모른다.'),
      R('크리스, 최종 확인 바랍니다.'),{who:'크리스',ch:'무전',kind:'me',t:'발사 관제, R-1. 발사 준비 완료. Go for launch.',auto:2000},
      R('T−10. 9. 8. 7. 6.',undefined,1100),R('메인 엔진 점화.',undefined,800)]);
    ign=.01; AUDIO.noise(9,.5,0,220); AUDIO.noise(9,.25,.4,900); AUDIO.tone(38,9,'sawtooth',.08);
    await TALK.say([R('5. 4. 3. 2. 1.',undefined,1000)]);
    lift=.01; AUDIO.noise(10,.45,0,160); track=.55;
    await TALK.say([R('이륙! R-1 출발. 휴스턴, 관제 넘깁니다.',undefined,2600)]);
    await sleep(3200); view(160,1.3,1.6); aim(rb.min.y+y0+H*.5);
    await TALK.say([R('R-1, 휴스턴. 궤적 정상, 고도 12 km. …잘 다녀와요, 크리스. 1호를 찾아 줘요.','휴스턴 · 마야',3200)]);
    await sleep(2200); const fe=$('#fade'); fe.style.background='#fff'; await fade(true,1400); track=0;
    this.clean(); cine(false); },

  /* ---- 구조정 R-1 (②③ 공통) : 앞 = +z · 조종석 · 로비 · 해치 방 (scenes/r1.js) ----
     앉아 있으면 끌어서 고개 돌리기 · 일어나면 걸어 다닌다 (끌기 = 둘러보기) */
  async cockpit(){ LEVEL.clear(); const rig=new THREE.Group(); WORLD.add(rig); const g=await R1.mount(rig);
    const dash=new THREE.PointLight(0x7fd4ff,.7,2.4,2); dash.position.set(0,.85,-.55); g.add(dash); WORLD.add(new THREE.HemisphereLight(0x6f7f99,0x050607,.12));
    const head={y:0,p:-.04,sy:0,sp:0}; P.look=true;
    window.dragHook=(dx,dy,e)=>{ if(!R1.seated){ if(!P.free&&!P.look) return; const k=e&&e.pointerType==='touch'?.0048:.0032; P.yaw-=dx*k; P.pitch=clamp(P.pitch-dy*k,-1.3,1.3); return; }
      const k=IS_TOUCH?.004:.003; head.y=clamp(head.y-dx*k,-1.1,1.1); head.p=clamp(head.p-dy*k,-.6,.5); };
    const q=new THREE.Quaternion(), cam=()=>{ if(!R1.seated) return; camera.position.copy(R1.eye()).add(new THREE.Vector3(head.sx||0,head.sy||0,0));
      camera.quaternion.copy(g.getWorldQuaternion(q)).multiply(new THREE.Quaternion().setFromEuler(new THREE.Euler(head.p,Math.PI+head.y,0,'YXZ'))); };
    this.tick(cam); return {rig,head,cam}; },

  /* ---- ② 지구 궤도 출발 ---- */
  async depart(){ const {R,C,V}=this; S.phase='cut'; P.free=false; goal('');
    const {head}=await this.cockpit();
    await SKY.space({dir:[0,-1,0],R:.0001,jupiter:false,sunDir:[1,.25,.3]});
    renderer.toneMappingExposure=1.05; scene.background=new THREE.Color(0x000000);
    const sunL=new THREE.DirectionalLight(0xfff4e6,2.2); sunL.position.set(1000,250,300); WORLD.add(sunL);
    // 지구 : 낮 · 밤(도시 불빛) · 구름 · 대기 가장자리 — 발아래 앞쪽
    const [day,night,cloud]=await Promise.all([loadTex('earth_day.jpg'),loadTex('earth_night.jpg'),loadTex('earth_clouds.jpg')]);
    const ER=900, L=sunL.position.clone().normalize(), earth=new THREE.Mesh(new THREE.SphereGeometry(ER,96,48),new THREE.ShaderMaterial({uniforms:{day:{value:day},night:{value:night},cl:{value:cloud},L:{value:L},t:{value:0}},
      vertexShader:'varying vec2 vUv; varying vec3 vN; varying vec3 vW; void main(){ vUv=uv; vN=normalize(mat3(modelMatrix)*normal); vec4 w=modelMatrix*vec4(position,1.0); vW=w.xyz; gl_Position=projectionMatrix*viewMatrix*w; }',
      fragmentShader:`uniform sampler2D day,night,cl; uniform vec3 L; uniform float t; varying vec2 vUv; varying vec3 vN; varying vec3 vW;
        void main(){ float d=dot(normalize(vN),L); float k=smoothstep(-.15,.25,d); vec3 c=texture2D(day,vUv).rgb*(.15+1.1*max(d,0.0)); float cl0=texture2D(cl,vUv+vec2(t*.002,0.0)).r;
          c=mix(c,vec3(1.0)*max(d,0.0)*1.1,cl0*.85); vec3 n=texture2D(night,vUv).rgb*vec3(1.0,.8,.55)*1.4*(1.0-k)*(1.0-cl0);
          vec3 v=normalize(cameraPosition-vW); float rim=pow(1.0-max(dot(v,normalize(vN)),0.0),3.0); vec3 atm=vec3(.35,.6,1.0)*rim*(.25+1.2*max(d+.2,0.0));
          gl_FragColor=vec4(mix(n,c,k)+atm,1.0); }`}));
    earth.position.set(-110,-ER-22,720); earth.rotation.y=2.4; WORLD.add(earth);
    let thrust=0, v=0, k=0; this.tick(dt=>{ earth.material.uniforms.t.value+=dt; earth.rotation.y+=dt*.004;
      if(thrust>0){ v=Math.min(70,v+dt*thrust*9); earth.position.y-=v*dt*.55; earth.position.z-=v*dt; k+=dt; head.sx=(Math.random()-.5)*.004*Math.min(1,thrust); head.sy=(Math.random()-.5)*.004*Math.min(1,thrust); } });
    stamp('구조정 R-1 · 지구 궤도','2091.03.21  09:40 · 고도 412 km'); AUDIO.hum(.3,40);
    const fe=$('#fade'); await fade(false,2200); fe.style.background='';
    await card('지구 궤도','구조정 R-1','한 사람 · 동면 캡슐 하나 · 연료는 편도분',3000);
    S.phase='play';      // 끌어서 둘러볼 수 있게
    await TALK.say([V('상단 분리 완료. 지구 궤도 진입. R-1, 단독 비행을 시작합니다.'),C('…발아래가 지구다. 그리고 정말로, 혼자다.'),
      V('이온 엔진 점화까지 20분. 그 전에 선내를 점검해 주십시오 — 맨 뒤 해치 방의 외부 해치 잠금입니다.')]);
    // 일어나 배 안을 걷는다 : 해치 방 → 로비 → 조종석 (문제를 끼울 자리 '지구 궤도')
    R1.view='…창 아래로 지구가 돈다. 구름 아래 어딘가에 휴스턴이 있다.';
    await R1.stand(head);
    await R1.task('hatch','외부 해치 잠금을 확인한다 — 맨 뒤 해치 방');
    AUDIO.tone(520,.1,'square',.04); AUDIO.tone(780,.12,'square',.04,.12);
    await TALK.say([V('외부 해치 잠금 정상. 기압 정상.'),V('동면에 들기 전에 한 끼 드십시오. 넉 달 동안은 먹지 못합니다.')]);
    await R1.task('galley','로비의 식량 배급기에서 끼니를 때운다');
    AUDIO.tone(880,.08,'sine',.05); AUDIO.noise(1.4,.05,.1,700);
    await TALK.say([C('…데운 단백질 죽. 지구에서의 마지막 식사가 이거라니.'),V('점화 2분 전. 조종석으로 돌아와 주십시오.')]);
    await this.slot('지구 궤도');
    await R1.task('seat','조종석으로 — 이온 엔진 점화');
    await R1.sit(); head.y=0; head.p=-.04; S.phase='play';
    await TALK.say([V('목성까지 넉 달. 이온 엔진 점화 준비 완료.'),R('R-1, 휴스턴. 이온 엔진 점화, 허가합니다.','휴스턴 · 마야'),{who:'크리스',ch:'무전',kind:'me',t:'휴스턴, R-1. 이온 엔진 점화.',auto:1900}]);
    thrust=.05; const ti=setInterval(()=>{ thrust=Math.min(1.2,thrust+.08); },120); AUDIO.tone(90,6,'sine',.06,0,40); SFX.play('thruster',{vol:.9});
    await TALK.say([V('점화 확인. 궤도를 벗어납니다.'),R('점화 확인. 좋은 여행 되세요, 크리스. …꼭 돌아와요.','휴스턴 · 마야',3200)]);
    await sleep(3500); clearInterval(ti);
    // 동면 : 로비 뒤쪽 캡슐로 걸어가 들어간다
    await TALK.say([V('동면 캡슐 준비 완료. 목성 궤도에서 깨워 드리겠습니다.'),V('로비 뒤쪽, 캡슐로 가십시오.')]);
    R1.view='…지구가 작아진다. 손톱만 해졌다.';
    await R1.stand(head);
    await R1.task('capsule','동면 캡슐로 — 로비 뒤쪽');
    await R1.intoCapsule(); AUDIO.noise(2,.08,0,400); AUDIO.tone(140,3,'sine',.05,0,-60);
    await TALK.say([C('…다녀오겠습니다.')]);
    S.phase='cut'; await fade(true,2000); this.clean(); },

  /* ---- ③ 넉 달 뒤 : 목성 곁에서 직접 몰고 웜홀로 ----
     목성 · 위성 · 웜홀은 공간에 실제로 놓인 물체 (예전엔 카메라에 붙은 그림이라 웜홀에 들어갈 때 목성이 따라 들어왔다)
     웜홀 : 렌즈 셰이더의 방향 · 크기를 매 프레임 '내 자리에서 본' 값으로 → 다가가면 커지고, 기수를 돌리면 목성 · 웜홀이 창밖에서 제자리에 있다
     조작은 scenes/flight.js 와 같다 (화면 단추 · 키보드 · 끌기 = 기수) · 웜홀 경계에 닿으면 자동 조종으로 진입 → 터널 → 하얗게 */
  async jupiter(){ const {C,V}=this; S.phase='cut'; P.free=false; goal('');
    await card('넉 달 뒤','목성','2091년 7월 · 웜홀까지 41만 km',3000);
    const {rig,head,cam}=await this.cockpit(); P.look=false;
    camera.far=12000; camera.updateProjectionMatrix();
    // 목성은 배의 +x 쪽 (로비 창가 바 쪽 창으로 보이게) — 앉으면 앞 유리 왼쪽
    const SUN=new THREE.Vector3(-.7,.35,-.6).normalize(), WH=new THREE.Vector3(-160,70,2600), RW=150, KM=158;      // 1 m = 158 km 로 줄인 지도 (웜홀까지 41만 km)
    await SKY.space({dir:[0,0,1],R:.04,jupiter:false,sunDir:SUN.toArray()}); renderer.toneMappingExposure=1.05;
    const sun=new THREE.DirectionalLight(0xfff4e6,2.3); sun.position.copy(SUN).multiplyScalar(3000); WORLD.add(sun);
    // 목성 : 실제 공 (자전 · 대기 가장자리 빛) · 위성 둘 (이오 · 유로파)
    const jt=await loadTex('jupiter_map.jpg'), JR=700, JP=new THREE.Vector3(1080,-280,380);
    const jup=new THREE.Mesh(new THREE.SphereGeometry(JR,96,48),new THREE.MeshStandardMaterial({map:jt,roughness:1,metalness:0})); jup.position.copy(JP); jup.rotation.z=.05; WORLD.add(jup);
    const halo=new THREE.Mesh(new THREE.SphereGeometry(JR*1.02,64,32),new THREE.ShaderMaterial({transparent:true,depthWrite:false,blending:THREE.AdditiveBlending,side:THREE.BackSide,uniforms:{L:{value:SUN}},
      vertexShader:'varying vec3 vN; varying vec3 vW; void main(){ vN=normalize(mat3(modelMatrix)*normal); vec4 w=modelMatrix*vec4(position,1.0); vW=w.xyz; gl_Position=projectionMatrix*viewMatrix*w; }',
      fragmentShader:'uniform vec3 L; varying vec3 vN; varying vec3 vW; void main(){ vec3 v=normalize(cameraPosition-vW); float r=pow(max(0.0,1.0-abs(dot(v,vN))),2.5); float d=max(0.0,dot(-vN,L)+.25); gl_FragColor=vec4(vec3(1.0,.82,.6)*r*d*.8,r*d); }'}));
    halo.position.copy(JP); WORLD.add(halo);
    const moons=[[22,0xd8c27a,new THREE.Vector3(420,-60,900)],[18,0xc9c2b4,new THREE.Vector3(1900,120,1500)]].map(([r,c,p])=>{ const m=new THREE.Mesh(new THREE.SphereGeometry(r,32,16),new THREE.MeshStandardMaterial({color:c,roughness:1})); m.position.copy(p); WORLD.add(m); return m; });
    // 처음 : 목성과 웜홀 사이를 본다 (목성이 창 왼쪽을 채운다)
    rig.position.set(0,0,0); rig.lookAt(420,-70,700);
    stamp('구조정 R-1 · 목성 궤도','2091.07 · 출발 122일째');
    // 조종 (flight.js 와 같은 단추 · 키 · 끌기)
    const v=new THREE.Vector3(), av=new THREE.Vector3(), U=SKY.U, el=()=>$('#flight'); let ctl=false, near=null, warned=0, th=0;
    FLIGHT.av=av; FLIGHT.docked=false; FLIGHT.btn={}; FLIGHT.ui(true); FLIGHT.ui(false); el().querySelector('.dock').classList.remove('on');      // 계기 화면은 조종석에 앉은 뒤에
    this.tick(dt=>{ jup.rotation.y+=dt*.012;
      const q=rig.quaternion, fw=new THREE.Vector3(0,0,1).applyQuaternion(q), up=new THREE.Vector3(0,1,0).applyQuaternion(q), rt=new THREE.Vector3().crossVectors(fw,up), B=FLIGHT.btn, K=keys;
      const live=ctl&&S.phase==='play'&&!TALK.on, on=k=>live&&(K['Key'+FLIGHT.KEYS[k]]||B[k]);
      const thr=(on('fwd')?1:0)-(on('back')?1:0), lat=(on('right')?1:0)-(on('left')?1:0), ver=(on('up')?1:0)-(on('down')?1:0), rIn=(on('rr')?1:0)-(on('rl')?1:0);
      v.addScaledVector(fw,thr*(thr>0?32:20)*dt).addScaledVector(rt,lat*14*dt).addScaledVector(up,ver*14*dt);
      if(!lat) v.addScaledVector(rt,-v.dot(rt)*Math.min(1,dt*1.2)); if(!ver) v.addScaledVector(up,-v.dot(up)*Math.min(1,dt*1.2));      // 자세 유지 : 옆으로 미끄러지지 않게
      const toW=WH.clone().sub(rig.position), L=toW.length(); toW.normalize();
      const vmax=L<700?Math.max(40,L*.2):180; if(v.length()>vmax) v.multiplyScalar(1-Math.min(1,dt*1.5));      // 웜홀 가까이선 저절로 줄인다
      if(!live&&!near||on('brake')) v.multiplyScalar(1-Math.min(1,dt*1.3));
      if(live){ av.y+=((K.ArrowLeft?1:0)-(K.ArrowRight?1:0))*1.4*dt; av.x+=((K.ArrowUp?1:0)-(K.ArrowDown?1:0))*1.4*dt; }
      av.z+=rIn*.6*dt; if(!rIn) av.z*=1-Math.min(1,dt*1.5); av.x*=1-Math.min(1,dt*2.2); av.y*=1-Math.min(1,dt*2.2);
      if(near) near(dt,fw,toW,L);      // 자동 조종 (진입)
      rig.rotateX(-av.x*dt); rig.rotateY(av.y*dt); rig.rotateZ(av.z*dt); rig.position.addScaledVector(v,dt); cam();      // 움직인 뒤 눈 자리를 다시 (빠를 때 조종석 뒤로 밀리지 않게)
      // 목성에 너무 가까이 : 대기권 — 밀려나고 경고
      const jd=rig.position.distanceTo(JP); if(jd<JR+140){ const n=rig.position.clone().sub(JP).normalize(); rig.position.copy(JP).addScaledVector(n,JR+140); v.addScaledVector(n,-Math.min(0,v.dot(n))*1.3); FX.shake(.3,.03);
        if(S.t>warned){ warned=S.t+8; TALK.say([V('목성 대기권에 너무 가깝습니다. 기수를 돌리십시오.')]); } }
      // 웜홀 렌즈 : 내 자리에서 본 방향 · 크기
      const cp=camera.position, d=WH.clone().sub(cp), Ld=d.length(); U.C.value.copy(d.normalize()); if(!this.inTransit) U.R.value=Math.asin(Math.min(.99,RW/Math.max(Ld,RW)));
      // 엔진 소리
      th-=dt; if((thr||lat||ver)&&th<=0){ th=.45; SFX.play('thruster',{vol:.5+.4*Math.abs(thr)}); }
      // 계기 : 거리 · 속도 · 웜홀 괄호 · 기수 화살표 · 빛나는 단추
      const E=el(); if(!E) return; const sp=v.length(), n=WH.clone().project(camera), onS=n.z<1&&Math.abs(n.x)<1.2&&Math.abs(n.y)<1.2, W=new Set();
      E.querySelector('.d').textContent='웜홀까지 '+Math.round(Math.max(0,L-RW)*KM).toLocaleString()+' km'; E.querySelector('.s').textContent='속도 '+(sp*.16).toFixed(1)+' km/s';
      const br=E.querySelector('.bracket'); br.style.display=onS&&ctl?'block':'none'; if(onS){ const sz=Math.max(40,Math.min(320,innerHeight*U.R.value*1.6)); br.style.left=((n.x+1)/2*innerWidth)+'px'; br.style.top=((1-n.y)/2*innerHeight)+'px'; br.style.width=br.style.height=sz+'px'; br.querySelector('b').textContent='웜홀'; }
      const wx=toW.dot(rt), wy=toW.dot(up), off=Math.acos(clamp(toW.dot(fw),-1,1)), turn=ctl&&live&&off>.12, nose=E.querySelector('.nose'); nose.style.display=turn?'block':'none'; if(turn) nose.style.transform=`translate(-50%,-50%) rotate(${Math.atan2(-wy,wx)}rad)`;
      if(live&&!turn&&v.dot(toW)<vmax*.8) W.add('fwd');
      E.querySelector('.w').textContent=!ctl?'':turn?byDevice('화면을 화살표 쪽으로 끌어(또는 방향키) 기수를 웜홀로','화면을 화살표 쪽으로 끌어 기수를 웜홀로'):W.has('fwd')?byDevice('W 를 눌러 웜홀로','[전진] 을 눌러 웜홀로'):L<700?'웜홀 가까이 — 저절로 속도를 줄인다':'';
      FLIGHT.want=W; E.querySelectorAll('.pads button').forEach(b=>b.classList.toggle('want',W.has(b.dataset.k)));
      if(ctl&&!near&&L<RW*1.6&&this.onEdge){ const r=this.onEdge; this.onEdge=null; r(); } });
    // 동면 캡슐에서 깨어난다 → 로비 창가에서 목성 → 조종석에 앉으면 비행 화면 (문제를 끼울 자리 '목성')
    await R1.wake();
    AUDIO.noise(2.2,.08,0,500); await fade(false,2600); AUDIO.hum(.6,36); MUSIC.play('space',{fade:4});
    await TALK.say([V('동면 해제. 크리스, 들립니까? 목성 궤도입니다.')]);
    await R1.outOfCapsule();
    R1.view='…목성. 창 하나를 가득 채운다. 줄무늬가 천천히 흐른다. 저 옆 어딘가에 웜홀.';
    await TALK.say([C('…몸이 무겁다. 넉 달을 잤다.'),V('창밖을 보십시오. 그리고 조종석으로 와 주십시오. 웜홀까지 41만 km 입니다.')]);
    await this.slot('목성');
    await R1.task('seat','조종석으로 — 웜홀까지 41만 km (창가에서 목성을 볼 수 있다)');
    await R1.sit(); S.phase='play'; head.y=0; head.p=-.04;
    await TALK.say([C('…목성이 창을 가득 채우고 있다.'),V('앞쪽에 웜홀. 1호의 마지막 항적도 저 안으로 이어집니다.'),C('1호는 저기로 들어가서, 돌아오지 못했다.')]);
    FLIGHT.ui(true);
    await TALK.say([V('조종을 넘깁니다. 웜홀 한가운데로 직접 몰고 들어가십시오.')]);
    goal(byDevice('웜홀로 — W 전진 · 끌어서(또는 방향키) 기수 · 기수를 돌려 목성도 볼 수 있다','웜홀로 — [전진] · 끌어서 기수 · 기수를 돌려 목성도 볼 수 있다')); ctl=true; P.free=true;
    await new Promise(r=>this.onEdge=r);
    // 경계 : 자동 조종이 기수를 웜홀 한가운데로 · 속도는 일정하게
    goal(''); S.phase='cut'; P.free=false; FLIGHT.btn={};
    near=(dt,fw,toW,L)=>{ const ax=new THREE.Vector3().crossVectors(fw,toW); if(ax.length()>1e-4) rig.quaternion.premultiply(new THREE.Quaternion().setFromAxisAngle(ax.normalize(),Math.min(fw.angleTo(toW),dt*.8))); av.set(0,0,0); v.lerp(toW.clone().multiplyScalar(clamp((L-RW*1.08)*.3,0,30)),Math.min(1,dt*1.5)); };      // 경계 앞에서 멈춘다 (가운데를 지나쳐 버리지 않게)
    await TALK.say([V('웜홀 경계 접근. 자동 조종으로 진입 궤도를 잡습니다.'),V('진입 궤도 고정. 선체 응력이 올라갑니다. 몸을 고정하십시오.'),{who:'크리스',ch:'무전',kind:'me',t:'…R-1, 웜홀 진입.',auto:1800}]);
    await this.slot('웜홀 앞');
    // 통과 : 렌즈가 화면을 삼키고 터널 무늬 · 흔들림 · 굉음 → 하얗게 (목성은 이미 등 뒤)
    this.inTransit=true; const R0=U.R.value; let k=0, done=false; AUDIO.hum(1.6,34); el()&&el().classList.remove('on');
    this.tick(dt=>{ k+=dt/10; const e=Math.min(1,k); U.R.value=R0+Math.pow(e,2.2)*2.6; U.tun.value=Math.max(0,(e-.45)/.55);
      const sh=e*e*.03; head.sx=(Math.random()-.5)*sh; head.sy=(Math.random()-.5)*sh; if(Math.random()<dt*3*e) AUDIO.noise(.5,.08+.1*e,0,300+600*e); if(e>=1) done=true; });
    setTimeout(()=>AUDIO.tone(60,8,'sawtooth',.06,0,-25),300);
    await TALK.say([V('중력 렌즈 경계 통과. 별빛이 고리 안으로 말려 들어갑니다.'),V('선체 응력 87%. 92%.'),C('버텨…!')]);
    while(!done) await sleep(100);
    const fe=$('#fade'); fe.style.background='#fff'; await fade(true,500); AUDIO.hum(.2,30);
    this.inTransit=false; FLIGHT.ui(false); this.clean(); U.tun.value=0; camera.far=2000; camera.updateProjectionMatrix();
    await sleep(1400); },
};
