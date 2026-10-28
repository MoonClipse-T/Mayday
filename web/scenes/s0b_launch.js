/* ============================================================
   발사 (컷신) — 2091. 04. 20 새벽, 케네디 우주 센터 39B. 승무원 수송 로켓이 궤도 조립장(하위헌스 2호)으로
   맵 : web/assets/launch.glb (blender/90_발사_궤도.blend · Space Center Realistic Launch Facility, CC BY) — ANIM_rocket
   연출 : 멀리서 카운트다운 → 점화(불꽃 · 연기 · 빛 · 흔들림 · 굉음) → 이륙 → 따라 올려다보기 → 하얗게 → 궤도
   ============================================================ */
'use strict';
SCENES.launch={title:'발사', async enter(){
  await LEVEL.load('launch'); SKY.clear();
  // 새벽 하늘 : 지평선은 주황, 위로 갈수록 남색 (구 안쪽에 그린다)
  const sky=new THREE.Mesh(new THREE.SphereGeometry(1600,32,16),new THREE.ShaderMaterial({side:THREE.BackSide,depthWrite:false,
    vertexShader:'varying vec3 vP; void main(){ vP=position; gl_Position=projectionMatrix*modelViewMatrix*vec4(position,1.0); }',
    fragmentShader:'varying vec3 vP; void main(){ vec3 d=normalize(vP); float h=d.y; float sunA=max(0.0,dot(d,normalize(vec3(.8,.05,-.6))));'
      +'vec3 c=mix(vec3(1.0,.55,.3),vec3(.33,.4,.62),smoothstep(0.0,.25,h)); c=mix(c,vec3(.05,.08,.2),smoothstep(.25,.9,h)); c+=vec3(1.0,.7,.4)*pow(sunA,24.0)*1.5+vec3(1.0,.5,.25)*pow(sunA,4.0)*.25;'
      +'if(h<0.0) c=mix(vec3(.25,.22,.22),c,exp(h*30.0)); gl_FragColor=vec4(c,1.0); }'}));
  sky.renderOrder=-3; sky.material.fog=false; WORLD.add(sky); TICK.push(()=>sky.position.copy(camera.position)); scene.fog=new THREE.Fog(0xb59a8c,300,1500);
  WORLD.traverse(o=>{ if(o.isMesh&&o.material&&!o.material.map&&o.material.color&&o.material.color.r>.8) o.material.color.setRGB(.5,.5,.52); });
  WORLD.add(new THREE.HemisphereLight(0xc8c8e0,0x3a3028,.9)); const sun=new THREE.DirectionalLight(0xffc08a,1.6); sun.position.set(800,60,-600); WORLD.add(sun);
  renderer.toneMappingExposure=1.0;
  const rocket=LEVEL.root.getObjectByName('ANIM_rocket'); const rb=new THREE.Box3().setFromObject(rocket); const base=new THREE.Vector3((rb.min.x+rb.max.x)/2,rb.min.y,(rb.min.z+rb.max.z)/2), H=rb.max.y-rb.min.y;
  // 불꽃 (원뿔 · 더하기 섞기) + 빛
  const flame=new THREE.Mesh(new THREE.ConeGeometry(2.6,22,24,1,true),new THREE.ShaderMaterial({transparent:true,depthWrite:false,blending:THREE.AdditiveBlending,uniforms:{t:{value:0},k:{value:0}},
    vertexShader:'varying vec2 vUv; void main(){ vUv=uv; gl_Position=projectionMatrix*modelViewMatrix*vec4(position,1.0); }',
    fragmentShader:'uniform float t,k; varying vec2 vUv; void main(){ float a=pow(vUv.y,1.6)*(0.75+0.25*sin(vUv.y*40.0-t*60.0)); vec3 c=mix(vec3(1.0,.45,.1),vec3(1.0,.95,.8),pow(vUv.y,3.0)); gl_FragColor=vec4(c*a*k*1.6,a*k); }'}));
  flame.rotation.x=Math.PI; flame.visible=false; WORLD.add(flame);
  const glow=new THREE.PointLight(0xff8a3a,0,320,1.4); WORLD.add(glow);
  // 연기 : 부드러운 점 120개
  const puff=(()=>{ const c=document.createElement('canvas'); c.width=c.height=128; const x=c.getContext('2d'), g=x.createRadialGradient(64,64,0,64,64,64); g.addColorStop(0,'rgba(255,255,255,.95)'); g.addColorStop(.6,'rgba(255,255,255,.35)'); g.addColorStop(1,'rgba(255,255,255,0)'); x.fillStyle=g; x.fillRect(0,0,128,128); return new THREE.CanvasTexture(c); })();
  const N=LITE?90:160, smoke=[]; const sm=new THREE.SpriteMaterial({map:puff,color:0xd8cfc8,transparent:true,depthWrite:false,opacity:.0,fog:true});
  for(let i=0;i<N;i++){ const s=new THREE.Sprite(sm.clone()); s.visible=false; WORLD.add(s); smoke.push({s,life:0,v:new THREE.Vector3()}); }
  let si=0; const emit=(p,spread,up)=>{ const o=smoke[si++%N]; o.s.position.copy(p).add(new THREE.Vector3((Math.random()-.5)*spread,0,(Math.random()-.5)*spread)); o.life=0; o.s.visible=true;
    const a=Math.random()*Math.PI*2; o.v.set(Math.cos(a)*(8+Math.random()*16),up+Math.random()*6,Math.sin(a)*(8+Math.random()*16)); o.s.scale.setScalar(6); };
  let ign=0, lift=0, y0=0, vy=0;
  TICK.push(dt=>{ flame.material.uniforms.t.value+=dt; if(ign){ ign+=dt; flame.visible=true; flame.material.uniforms.k.value=Math.min(1,ign*1.5);
      if(lift){ vy+=dt*(4+lift*2.5); lift+=dt; y0+=vy*dt; rocket.position.y=y0; }
      const nz=base.clone(); nz.y=rb.min.y+y0; flame.position.set(nz.x,nz.y-10,nz.z); flame.scale.setScalar(1+Math.min(1,ign*.5)); glow.position.set(nz.x,nz.y+2,nz.z); glow.intensity=(6+Math.random()*3)*Math.min(1,ign);
      for(let k=0;k<(LITE?2:4);k++) emit(nz,lift?3:10,lift?-4:2);
      const sh=Math.max(0,.35-Math.max(0,lift-6)*.04)*Math.min(1,ign); camera.position.x+=(Math.random()-.5)*sh; camera.position.y+=(Math.random()-.5)*sh; }
    smoke.forEach(o=>{ if(!o.s.visible) return; o.life+=dt; o.s.position.addScaledVector(o.v,dt); o.v.multiplyScalar(.985); o.v.y+=dt*1.5; o.s.scale.setScalar(6+o.life*9); o.s.material.opacity=Math.max(0,.55*(1-o.life/9)); if(o.life>9) o.s.visible=false;
      o.s.material.color.setRGB(.85+.15*Math.max(0,1-o.life/2),.8,.76); }); });
  // 카메라 : 관람석 (로켓에서 약 420 m)
  const view=(dist,ang,eye)=>{ P.x=base.x+Math.cos(ang)*dist; P.z=base.z+Math.sin(ang)*dist; P.y=0; P.eye=eye; };
  const aim=(y)=>{ P.yaw=Math.atan2(-(base.x-P.x),-(base.z-P.z)); P.pitch=Math.atan2(y-(P.y+P.eye),Math.hypot(base.x-P.x,base.z-P.z)); };
  view(420,.9,2.2); aim(rb.min.y+H*.55); TICK.push(()=>{ if(S.camTrack) aim(rb.min.y+y0+H*(S.camTrack)); });
  stamp('케네디 우주 센터 · 39B 발사대','2091.04.20  05:52'); cine(true); AUDIO.hum(.4,70);
  await fade(false,1800);
  await card('','2091년 4월 20일','케네디 우주 센터 · 발사대 39B',2600);
  const R=(t,who='발사 관제',auto=1400)=>({who,ch:'무전',kind:'radio',t,auto}), C=(t,auto=1500)=>({kind:'me',t,auto});
  await TALK.say([R('하위헌스 승무원 수송선 헤르메스, 궤도 조립장까지 랑데부 비행. 기상 양호.',undefined,1800),C('창밖이 밝아 온다. 이게 마지막으로 보는 지구의 아침이다.',1800),
    R('승무원 14명 탑승 확인. 선장, 최종 확인 바랍니다.'),{who:'크리스',ch:'무전',kind:'me',t:'헤르메스, 발사 준비 완료. Go for launch.',auto:1400},
    R('T−10. 9. 8. 7. 6.',undefined,900),R('메인 엔진 점화 시작.',undefined,600)]);
  ign=.01; AUDIO.noise(9,.5,0,220); AUDIO.noise(9,.25,.4,900); AUDIO.tone(38,9,'sawtooth',.08);
  await TALK.say([R('5. 4. 3. 2. 1.',undefined,700)]);
  lift=.01; AUDIO.noise(10,.45,0,160); S.camTrack=.55;
  await TALK.say([R('이륙! 하위헌스 2호 승무원 출발. 휴스턴, 관제 넘깁니다.',undefined,2600)]);
  await sleep(3500); view(160,1.3,1.6); aim(rb.min.y+y0+H*.5);
  await TALK.say([{who:'휴스턴',ch:'무전',kind:'radio',t:'헤르메스, 휴스턴. 궤적 정상. 고도 12 km… 가 보게, 크리스.',auto:2200}]);
  await sleep(2500); const fe=$('#fade'); fe.style.background='#fff'; await fade(true,1400); scene.fog=null; S.camTrack=0;
  cine(false); await SCENES.orbit.enter();
}};
