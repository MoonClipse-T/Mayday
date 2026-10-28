/* ============================================================
   궤도 · 출발 (컷신, 우주에서 본 하위헌스 2호) → 라운지(lounge : 시차로 웜홀까지의 거리) → 214일 후 목성 앞(approach) → 동면 구역(cryo)
   맵 : web/assets/ship_ext.glb (Deep Space Science / Survey Vessel, CC BY) · 지구 : Solar System Scope 낮 · 구름 · 밤 지도 (CC BY 4.0)
   ============================================================ */
'use strict';
SCENES.orbit={title:'궤도', async enter(){
  LEVEL.clear(); const ship=await loadGLB('ship_ext'); WORLD.add(ship);
  await SKY.space({dir:[0,.3,-1],R:.0001,jupiter:false,sunDir:[1,.25,.3]});
  renderer.toneMappingExposure=1.05;
  const sun=new THREE.DirectionalLight(0xfff4e6,2.4); sun.position.set(1000,250,300); WORLD.add(sun); WORLD.add(new THREE.AmbientLight(0x223040,.35));
  // 지구 : 낮 · 밤(도시 불빛) · 구름 · 대기 가장자리
  const [day,night,cloud]=await Promise.all([loadTex('earth_day.jpg'),loadTex('earth_night.jpg'),loadTex('earth_clouds.jpg')]);
  const ER=900, earth=new THREE.Mesh(new THREE.SphereGeometry(ER,96,48),new THREE.ShaderMaterial({uniforms:{day:{value:day},night:{value:night},cl:{value:cloud},L:{value:sun.position.clone().normalize()},t:{value:0}},
    vertexShader:'varying vec2 vUv; varying vec3 vN; varying vec3 vW; void main(){ vUv=uv; vN=normalize(mat3(modelMatrix)*normal); vec4 w=modelMatrix*vec4(position,1.0); vW=w.xyz; gl_Position=projectionMatrix*viewMatrix*w; }',
    fragmentShader:`uniform sampler2D day,night,cl; uniform vec3 L; uniform float t; varying vec2 vUv; varying vec3 vN; varying vec3 vW;
      void main(){ float d=dot(normalize(vN),L); float k=smoothstep(-.15,.25,d); vec3 c=texture2D(day,vUv).rgb*(.15+1.1*max(d,0.0)); float cl0=texture2D(cl,vUv+vec2(t*.002,0.0)).r;
        c=mix(c,vec3(1.0)*max(d,0.0)*1.1,cl0*.85); vec3 n=texture2D(night,vUv).rgb*vec3(1.0,.8,.55)*1.4*(1.0-k)*(1.0-cl0);
        vec3 v=normalize(cameraPosition-vW); float rim=pow(1.0-max(dot(v,normalize(vN)),0.0),3.0); vec3 atm=vec3(.35,.6,1.0)*rim*(.25+1.2*max(d+.2,0.0));
        gl_FragColor=vec4(mix(n,c,k)+atm,1.0); }`}));
  earth.position.set(0,-ER-160,-250); earth.rotation.y=2.4; WORLD.add(earth);
  const halo=new THREE.Mesh(new THREE.SphereGeometry(ER*1.025,64,32),new THREE.ShaderMaterial({transparent:true,depthWrite:false,blending:THREE.AdditiveBlending,side:THREE.BackSide,uniforms:{L:{value:sun.position.clone().normalize()}},
    vertexShader:'varying vec3 vN; varying vec3 vW; void main(){ vN=normalize(mat3(modelMatrix)*normal); vec4 w=modelMatrix*vec4(position,1.0); vW=w.xyz; gl_Position=projectionMatrix*viewMatrix*w; }',
    fragmentShader:'uniform vec3 L; varying vec3 vN; varying vec3 vW; void main(){ vec3 v=normalize(cameraPosition-vW); float r=pow(max(0.0,1.0-abs(dot(v,vN))),2.0); float d=max(0.0,dot(-vN,L)+.3); gl_FragColor=vec4(vec3(.3,.55,1.0)*r*d,r*d); }'}));
  halo.position.copy(earth.position); WORLD.add(halo);
  // 엔진 불빛 (선미 쪽)
  const sb=new THREE.Box3().setFromObject(ship), sc=sb.getCenter(new THREE.Vector3()), L=sb.max.z-sb.min.z;
  const glowTex=(()=>{ const c=document.createElement('canvas'); c.width=c.height=128; const x=c.getContext('2d'), g=x.createRadialGradient(64,64,0,64,64,64); g.addColorStop(0,'rgba(255,255,255,1)'); g.addColorStop(.25,'rgba(150,200,255,.8)'); g.addColorStop(1,'rgba(80,140,255,0)'); x.fillStyle=g; x.fillRect(0,0,128,128); return new THREE.CanvasTexture(c); })();
  const eng=[]; for(const dx of [-3.2,0,3.2]){ const s=new THREE.Sprite(new THREE.SpriteMaterial({map:glowTex,transparent:true,blending:THREE.AdditiveBlending,depthWrite:false,opacity:0})); s.position.set(sc.x+dx,sc.y,sb.max.z+1.5); s.scale.setScalar(6); ship.add(s); eng.push(s); }
  let thrust=0, v=0; TICK.push(dt=>{ earth.material.uniforms.t.value+=dt; earth.rotation.y+=dt*.004; eng.forEach((s,i)=>{ s.material.opacity=Math.min(1,thrust)*(.8+.2*Math.sin(S.t*30+i)); s.scale.setScalar(6+thrust*10); });
    if(thrust>0){ v+=dt*thrust*6; ship.position.z-=v*dt; } });
  // 카메라 : 배 옆에서 천천히 돈다
  P.free=false; P.eye=0; let ang=.6; const orbitCam=dt=>{ ang+=dt*.035; const r=L*1.25; P.x=sc.x+Math.cos(ang)*r; P.z=sc.z+Math.sin(ang)*r*.8; P.y=sc.y+L*.18;
    const T=ship.position.clone().add(sc); P.yaw=Math.atan2(-(T.x-P.x),-(T.z-P.z)); P.pitch=Math.atan2(T.y-P.y,Math.hypot(T.x-P.x,T.z-P.z)); }; TICK.push(orbitCam);
  stamp('지구 궤도 · 고도 412 km','2091.04.20  09:40'); cine(true); AUDIO.hum(.3,40);
  await fade(false,2200); $('#fade').style.background='';
  await card('지구 궤도','하위헌스 2호','길이 214 m · 승무원 5명 · 목표 : 목성의 웜홀',3200);
  const R=(t,who='휴스턴',auto=1600)=>({who,ch:'무전',kind:'radio',t,auto});
  await TALK.say([R('하위헌스 2호, 헤르메스 도킹 완료 확인. 승무원 전원 이동.',undefined,1800),{who:'VEGA',kind:'vega',t:'승무원 다섯 명, 동면 캡슐 배정을 마쳤습니다. 목성까지 214일.',auto:1800},
    {who:'크리스',ch:'무전',kind:'me',t:'휴스턴, 하위헌스 2호. 이온 엔진 점화합니다.',auto:1400}]);
  thrust=.05; const ti=setInterval(()=>{ thrust=Math.min(1.2,thrust+.08); },120); AUDIO.tone(90,6,'sine',.06,0,40);
  await TALK.say([R('엔진 점화 확인. 좋은 여행 되게, 크리스. 1호를 찾아 주게.',undefined,2400)]);
  await sleep(3800); clearInterval(ti);
  await fade(true,1500); cine(false); await go('lounge');
}};
// 214일 후 : 목성 앞, 웜홀 쪽으로 다가가는 2호 (라운지 대화가 끝나면)
SCENES.approach={title:'목성 접근', async enter(){
  LEVEL.clear(); const ship=await loadGLB('ship_ext'); WORLD.add(ship); renderer.toneMappingExposure=1.05; cine(true);
  WORLD.add(new THREE.AmbientLight(0x223040,.35)); const sun=new THREE.DirectionalLight(0xfff4e6,2.4); sun.position.set(1000,250,300); WORLD.add(sun);
  const sb=new THREE.Box3().setFromObject(ship), sc=sb.getCenter(new THREE.Vector3()), L=sb.max.z-sb.min.z;
  const glowTex=(()=>{ const c=document.createElement('canvas'); c.width=c.height=128; const x=c.getContext('2d'), g=x.createRadialGradient(64,64,0,64,64,64); g.addColorStop(0,'rgba(255,255,255,1)'); g.addColorStop(.25,'rgba(150,200,255,.8)'); g.addColorStop(1,'rgba(80,140,255,0)'); x.fillStyle=g; x.fillRect(0,0,128,128); return new THREE.CanvasTexture(c); })();
  const eng=[]; for(const dx of [-3.2,0,3.2]){ const s=new THREE.Sprite(new THREE.SpriteMaterial({map:glowTex,transparent:true,blending:THREE.AdditiveBlending,depthWrite:false,opacity:.5})); s.position.set(sc.x+dx,sc.y,sb.max.z+1.5); s.scale.setScalar(7); ship.add(s); eng.push(s); }
  P.free=false; P.eye=0;
  await card('214일 후','목성','하위헌스 2호 · 웜홀까지 41만 km',3000);
  WORLD.remove(sun);
  await SKY.space({dir:[.25,.06,-1],R:.12,jdir:[-.6,-.25,-1],jsize:.95,sunDir:[1,.25,.3]});
  TICK.push(dt=>{ eng.forEach((s,i)=>{ s.material.opacity=.5+.1*Math.sin(S.t*30+i); s.scale.setScalar(7); }); ship.position.z-=dt*2; });
  // 배 뒤에서 앞(웜홀)을 본다
  P.x=sc.x+8; P.z=sb.max.z+L*.9; P.y=sc.y+L*.22; TICK.push(()=>{ const T=new THREE.Vector3(sc.x,sc.y,sc.z-L*2).add(ship.position); P.yaw=Math.atan2(-(T.x-P.x),-(T.z-P.z))+.18; P.pitch=Math.atan2(T.y-P.y,Math.hypot(T.x-P.x,T.z-P.z))+.04; P.z-=0; });
  stamp('목성 궤도 접근','출발 214일째'); await fade(false,2000);
  await TALK.say([{who:'VEGA',kind:'vega',t:'목성 중력권 진입. 선장님의 동면 해제를 시작합니다.',auto:2600}]);
  await sleep(1200); cine(false); await go('cryo');
}};
