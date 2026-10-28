/* ============================================================
   1장 · 깨어남 — 하위헌스 2호 동면 구역 C (출발 214일째, 목성 궤도 진입 3시간 전) · 함선 안의 방 하나 (scenes/ship.js)
   맵 : web/assets/cryo.glb (blender/01_동면실.blend) — SPAWN · SPOT_window · SPOT_pod_L1~R7
   흐름 : 깨어남 → 관측창(목성 · 웜홀) → 캡슐 단말 하나로 대원 넷 동시 해동 (대원별 체온 · 심박 기록) → 넷이 캡슐에서 걸어 나와 함교로 → 뒷문 → 중앙 복도
   승무원은 최정예 다섯 (크리스 + 넷) — 캡슐 14기 중 다섯만 쓴다. 넷은 캡슐 안에 서서 잠들어 있다 (유리 너머로 보인다)
   창밖 : 실제 별지도 + 웜홀 렌즈 + 목성 (sky.js) · 창유리 : 얼룩 · 반사 · 경광등이 비친다
   ============================================================ */
'use strict';
const CREW=[
  {pod:'L3',id:'C-03',name:'마야 첸',role:'부선장 · 조종',kind:'maya',line:['…목성은요? 벌써 보여요?','선장님 얼굴이 먼저 보이네요. 다행이다.']},
  {pod:'L4',id:'C-04',name:'크리스',role:'선장',me:true},
  {pod:'L5',id:'C-05',name:'한서준',role:'항법',kind:'seojun',line:['으… 머리야. 214일이요? 별 위치부터 다시 재야겠네요.','항법 컴퓨터가 잔 동안 쌓인 오차가 꽤 될 거예요.']},
  {pod:'R3',id:'C-10',name:'다니엘 로드리게스',role:'기관',kind:'daniel',line:['엔진 소리… 좋아, 살아 있네.','선장님, 저는 기관실 점검부터 하고 함교로 갈게요.']},
  {pod:'R4',id:'C-11',name:'오언 하트',role:'보안',kind:'owen',line:['오언 하트, 이상 없습니다.','…꿈을 꿨는데, 기억이 안 나네요.']}];

ROOMS.cryo=async R=>{ const f=S.flags, me=t=>({kind:'me',t}), V=t=>({who:'VEGA',kind:'vega',t}), X=R.X, sp=R.spots;
  // 동면 캡슐 14기 : 모델 하나(pod · 열린 캡슐 pod_open)를 SPOT_pod_* 자리에 복제해 세운다. 모델 속 '복제 인간'은 숨긴다 (빈 캡슐)
  const [pod,podOpen]=await Promise.all([loadGLB('pod'),loadGLB('pod_open')]);
  const pods={}, PODY=.6;                     // 캡슐 안 발판 높이
  const place=(src,s)=>{ const o=THREE.SkeletonUtils.clone(src); o.position.set(s.x,0,s.z); o.rotation.y=s.yaw;
    o.traverse(m=>{ if(m.isMesh){ m.frustumCulled=false; if(/HumanBody/.test(m.material.name)) m.visible=false;
      // 캡슐 유리 : 모델 그대로면 거의 불투명하다 → 안에 선 대원이 보이게 옅게
      if(/glass/i.test(m.material.name)){ m.material=m.material.clone(); m.material.opacity=.22; m.material.emissiveIntensity=.12; m.material.depthWrite=false; } } }); R.add(o); LEVEL.solids.push(o); return o; };
  // 출발 직후(라운지 대화)에는 크리스와 다니엘의 캡슐이 아직 비어 열려 있다
  const openAtStart=SHIP.mode==='depart'?['pod_L4','pod_R3']:['pod_L4'];
  Object.entries(sp).filter(([k])=>k.startsWith('pod_')).forEach(([k,s])=>{ pods[k.slice(4)]={s,o:place(openAtStart.includes(k)?podOpen:pod,s)}; });
  if(R.items.c07) R.items.c07.visible=false;
  // 정전 : 선체 세트의 자체 발광(천장 환기구 불빛)을 낮춘다
  R.objs.forEach(r=>r.traverse(o=>{ if(o.isMesh&&o.material&&/wall_albedo|base_ram|base_door/.test(o.material.name)) o.material.emissiveIntensity=.15; }));
  const pl=(c,i,d,x,y,z)=>{ const l=new THREE.PointLight(c,i,d,1.8); l.position.set(X(x),y,z); R.add(l); return l; };
  const red=[pl(0xff2a14,0,9,-3.1,3.6,3.5),pl(0xff2a14,0,9,3.1,3.6,-3.5)];
  // 캡슐 불빛 : 대원 캡슐마다 하나 (해동하면 푸른색 → 초록)
  const podLight={}; CREW.filter(c=>!c.me).forEach(c=>{ const s=pods[c.pod].s; podLight[c.pod]=pl(0x4fb8ff,1.3,3.2,s.x-R.ox,1.6,s.z); });
  pl(0xb8c8ff,1.2,10,0,2.2,-7.6);                              // 창빛
  let alarm=0; TICK.push(()=>{ alarm=Math.max(0,Math.sin(S.t*2.6))**6; red.forEach(l=>l.intensity=alarm*5*(f.allAwake?.0:1)); });

  // 대원 넷 : 캡슐 안에 서서 잠들어 있다 (움직임 · 시선 멈춤) → 해동하면 걸어 나온다
  const side=s=>s.x-R.ox<0?-1:1;            // 왼쪽 줄(−1)은 +x 쪽 통로를 본다
  await Promise.all(CREW.filter(c=>c.kind&&!(SHIP.mode==='depart'&&c.kind==='daniel')).map(async c=>{ const s=pods[c.pod].s;
    c.p=await PEOPLE.spawn({kind:c.kind,name:c.name,role:c.role,at:{x:s.x,y:PODY,z:s.z,yaw:side(s)<0?-Math.PI/2:Math.PI/2}}); c.p.sleep=true; c.p.watch=false; c.p.solid=false; }));

  /* ---- 창유리 : 보는 사람과 바깥 사이에 유리가 있다는 느낌 (얼룩 · 가장자리 서리 · 비스듬히 볼수록 반사 · 경광등이 비친다) ---- */
  const gl=R.root.getObjectByName('wf_glass')||null;
  { const c=document.createElement('canvas'); c.width=c.height=512; const x=c.getContext('2d');
    for(let i=0;i<260;i++){ const r=2+Math.random()*26; x.fillStyle=`rgba(255,255,255,${Math.random()*.05})`; x.beginPath(); x.arc(Math.random()*512,Math.random()*512,r,0,7); x.fill(); }
    x.strokeStyle='rgba(255,255,255,.05)'; for(let i=0;i<40;i++){ x.beginPath(); const sx=Math.random()*512, sy=Math.random()*512; x.moveTo(sx,sy); x.lineTo(sx+(Math.random()-.5)*120,sy+(Math.random()-.5)*30); x.stroke(); }
    const smudge=new THREE.CanvasTexture(c);
    const U={smudge:{value:smudge},alarm:{value:0}};
    const mat=new THREE.ShaderMaterial({uniforms:U,transparent:true,depthWrite:false,
      vertexShader:'varying vec2 vUv; varying vec3 vW; varying vec3 vN; void main(){ vUv=uv; vec4 w=modelMatrix*vec4(position,1.0); vW=w.xyz; vN=normalize(mat3(modelMatrix)*normal); gl_Position=projectionMatrix*viewMatrix*w; }',
      fragmentShader:`uniform sampler2D smudge; uniform float alarm; varying vec2 vUv; varying vec3 vW; varying vec3 vN;
        void main(){ vec3 v=normalize(cameraPosition-vW); float fr=pow(1.0-abs(dot(v,vN)),3.0);
          float s=texture2D(smudge,vUv*vec2(1.6,1.0)).a; vec2 e=min(vUv,1.0-vUv); float edge=1.0-smoothstep(0.0,0.09,min(e.x*1.6,e.y));
          vec3 col=vec3(.78,.86,1.0)+vec3(.2,-.6,-.7)*alarm;
          gl_FragColor=vec4(col,clamp(s*.9+fr*.22+edge*.16+alarm*(.03+fr*.12),0.0,.5)); }`});
    const pane=new THREE.Mesh(new THREE.PlaneGeometry(3.6,2.3),mat); pane.position.set(X(0),2.05,-8.6); R.add(pane); if(gl) gl.visible=false;
    interact(pane,'관측창 — 밖을 본다',()=>lookOut(),{range:6,enabled:()=>!f.window});
    TICK.push(()=>{ U.alarm.value=alarm*(f.allAwake?0:1); }); }

  /* ---- 해동 화면 (캡슐 단말) : 넷을 한꺼번에 — 대원별 체온 · 심박은 기록해 둔다 (뒤에 괴물 판별 0.4 K 복선) ---- */
  const vit=$('#vitals');
  async function thawAll(){ if(f.thawed) return; f.thawed=true; goal(''); const crew=CREW.filter(c=>!c.me);
    crew.forEach(c=>{ c.temp=36.3+Math.random()*.5; c.hr=56+Math.random()*14|0; });
    vit.querySelector('.id').textContent='C-03 · 05 · 10 · 11'; vit.querySelector('.nm').textContent='대원 넷 동시 해동'; vit.querySelector('.rl').textContent='동면 구역 C · 선장 승인';
    vit.classList.add('on'); AUDIO.beep(); const tE=vit.querySelector('.temp'), hE=vit.querySelector('.hr'), bar=vit.querySelector('.bar i'), st=vit.querySelector('.st');
    const avgT=crew.reduce((a,c)=>a+c.temp,0)/crew.length, avgH=crew.reduce((a,c)=>a+c.hr,0)/crew.length;
    st.textContent='해동 중'; const t0=performance.now(), dur=4200;
    // 해동하는 동안 캡슐 불빛이 차례로 초록으로 바뀌고 증기가 오른다
    crew.forEach((c,i)=>setTimeout(()=>{ steam(pods[c.pod].s); podLight[c.pod].color.set(0x6dffb0); AUDIO.noise(1.4,.12,0,5000,'highpass'); },300+i*dur/crew.length));
    await new Promise(res=>{ const step=()=>{ const k=Math.min(1,(performance.now()-t0)/dur), e=1-Math.pow(1-k,2);
      tE.textContent=(31.2+(avgT-31.2)*e).toFixed(1); hE.textContent=Math.round(12+(avgH-12)*e); bar.style.width=(k*100)+'%';
      if(Math.random()<.12) AUDIO.tick(); k<1?requestAnimationFrame(step):res(); }; step(); });
    st.textContent='생체 신호 정상'; AUDIO.tone(660,.15,'sine',.1); AUDIO.tone(990,.25,'sine',.08,.15);
    // 기록 : 대원별 체온 (뒤에 다시 본다)
    const lst=document.createElement('div'); lst.className='list'; lst.innerHTML=crew.map(c=>`<p><span>${c.id}</span>${c.name}<b>${c.temp.toFixed(1)} ℃</b></p>`).join(''); vit.appendChild(lst);
    // 캡슐이 열리고 (유리가 걷힌다) 넷이 눈을 뜨고 통로로 걸어 나온다
    await sleep(1400);
    await Promise.all(crew.map(async (c,i)=>{ await sleep(i*350); const P0=pods[c.pod]; WORLD.remove(P0.o); P0.o=place(podOpen,P0.s); AUDIO.noise(.6,.1,0,2400);
      c.p.sleep=false; c.p.watch=true; await PEOPLE.walk(c.p,[[P0.s.x-side(P0.s)*1.05,P0.s.z,0]],.7); c.p.solid=true;
      PEOPLE.talkable(c.p,()=>TALK.say([{who:c.name.split(' ')[0],t:c.line[1],npc:c.p}])); }));
    await sleep(600); vit.classList.remove('on'); setTimeout(()=>lst.remove(),600);
    await TALK.say(crew.map(c=>({who:c.name.split(' ')[0],t:c.line[0],npc:c.p})));
    await allAwake(); }
  // 증기 : 부드러운 점들이 솟았다 퍼진다
  const puff=(()=>{ const c=document.createElement('canvas'); c.width=c.height=64; const x=c.getContext('2d'), gr=x.createRadialGradient(32,32,0,32,32,32); gr.addColorStop(0,'rgba(255,255,255,.9)'); gr.addColorStop(1,'rgba(255,255,255,0)'); x.fillStyle=gr; x.fillRect(0,0,64,64); return new THREE.CanvasTexture(c); })();
  function steam(s){ const n=60, geo=new THREE.BufferGeometry(), pos=new Float32Array(n*3), vel=[]; for(let i=0;i<n;i++){ pos[i*3]=s.x+(Math.random()-.5)*.6; pos[i*3+1]=.6+Math.random()*.6; pos[i*3+2]=s.z+(Math.random()-.5)*1.2;
      vel.push([-side(s)*(.3+Math.random()*.6),.2+Math.random()*.5,(Math.random()-.5)*.4]); }
    geo.setAttribute('position',new THREE.BufferAttribute(pos,3)); const m=new THREE.PointsMaterial({map:puff,size:.7,transparent:true,opacity:.5,depthWrite:false,color:0xcfe6ff}); const pts=new THREE.Points(geo,m); WORLD.add(pts);
    let life=0; const fn=dt=>{ life+=dt; for(let i=0;i<n;i++){ pos[i*3]+=vel[i][0]*dt; pos[i*3+1]+=vel[i][1]*dt; pos[i*3+2]+=vel[i][2]*dt; vel[i][0]*=.97; } geo.attributes.position.needsUpdate=true; m.opacity=.5*Math.max(0,1-life/2.6); m.size=.7+life*.5;
      if(life>2.6){ WORLD.remove(pts); const k=TICK.indexOf(fn); if(k>=0) TICK.splice(k,1); } }; TICK.push(fn); }
  // 캡슐 탭 판정 (보이지 않는 상자) — 대원 캡슐 넷
  CREW.filter(c=>!c.me).forEach(c=>{ const s=pods[c.pod].s, b=new THREE.Mesh(new THREE.BoxGeometry(1.1,2,2),PICK); b.position.set(s.x,1,s.z); WORLD.add(b);
    interact(b,c.id+' 캡슐 · '+c.name+' ('+c.role+') — 단말 : 전원 해동',()=>thawAll(),{range:3,enabled:()=>f.window&&!f.thawed}); });

  // 넷이 함교로 : 서준이 앞장서 뒷문을 열고, 복도를 따라 함교로 걸어간다 → 함교에 닿으면 자리에 앉아 있는 것으로 바꾼다
  async function allAwake(){ f.allAwake=true; await sleep(500);
    await TALK.say([V('대원 넷 해동 완료. 생체 신호 모두 정상입니다. 경보를 해제합니다.'),
      {who:'마야',t:'선장님, 다들 정신 차렸어요. 저희는 먼저 함교로 가 있을게요.',npc:CREW[0].p},
      {who:'서준',t:'목성 궤도 진입 전에 항법부터 맞춰야 해요. 따라오세요.',npc:CREW[2].p}]);
    goal('함교로 간다 — 뒷문 → 중앙 복도 서쪽 끝');
    const H=SHIP.HALL, hz=(H.z1+H.z2)/2, bx=SHIP.rooms.bridge.ox;
    CREW.filter(c=>c.kind).forEach(async (c,i)=>{ const p=c.p; p.watch=false; p.solid=false; await sleep(i*900);
      await PEOPLE.walk(p,[[p.wrap.position.x,6.6],[X(i%2?.4:-.4),6.6],[X(0),8.0]],1.25);
      await SHIP.doors.cryo.open();
      await PEOPLE.walk(p,[[X(0),hz],[bx+1,hz],[bx,hz]],1.35); await SHIP.doors.bridge.open(); await PEOPLE.walk(p,[[bx,7.6]],1.2);
      PEOPLE.remove(p); if(CREW.filter(k=>k.kind).every(k=>!PEOPLE.list.includes(k.p))) SHIP.crewOnBridge(); }); }

  // 뒷문 : 해동이 끝나기 전에는 잠겨 있다
  SHIP.lock.cryo=()=>f.allAwake?null:f.window?'대원 해동이 끝나기 전에는 동면 구역을 잠가 둡니다.':'선장님, 먼저 관측창을 확인해 주십시오.';

  // 관측창 : 창 앞 4.6 m 안에서 창 쪽(±45°)을 보거나, 창을 누르면 (카메라를 억지로 돌리지 않고, 시야만 살짝 모은다)
  const sw=sp.window;
  TICK.push(()=>{ if(f.window||S.busy||!P.free||!sw) return; if(Math.hypot(P.x-sw.x,P.z-sw.z)>4.6) return; if(Math.cos(P.yaw)<.7) return; lookOut(); });
  function lookOut(){ if(f.window) return; f.window=true;
    (async()=>{ goal(''); const fov0=camera.fov; let k=0; const z=dt=>{ k=Math.min(1,k+dt/2.2); camera.fov=lerp(fov0,58,k*k*(3-2*k)); camera.updateProjectionMatrix(); }; TICK.push(z);
      await TALK.say([me('…저게 웜홀.'),V('웜홀까지 41만 km. 목성 중력권에 들어왔습니다. 별빛이 고리 모양으로 휘는 것이 보이실 겁니다.'),
        me('고리 안쪽 별들은… 우리 하늘의 별이 아니라고 했지.'),me('214일을 잤는데 하루처럼 느껴지는군.'),
        V('선장님, 목성 궤도 진입 전에 대원을 깨워야 합니다. 해동은 선장 승인이 필요합니다.'),
        V('대원 캡슐의 단말을 누르시면 넷을 한꺼번에 해동합니다. 체온과 심박이 정상 범위에 들어오는지 함께 봐 주십시오.')]);
      TICK.splice(TICK.indexOf(z),1); let b=0; const back=dt=>{ b=Math.min(1,b+dt/1.2); camera.fov=lerp(58,fov0,b); camera.updateProjectionMatrix(); if(b>=1) TICK.splice(TICK.indexOf(back),1); }; TICK.push(back);
      goal('대원을 깨운다 — 대원 캡슐의 단말을 눌러 전원 해동'); })(); }

  // 바로 가기(?s=deck · bridge)로 들어오면 : 넷은 이미 함교에 있다
  R.skipWake=()=>{ CREW.filter(c=>c.kind).forEach(c=>PEOPLE.remove(c.p)); CREW.filter(c=>!c.me).forEach(c=>{ podLight[c.pod].color.set(0x6dffb0); }); };
  // 1장 시작 : 크리스가 열린 캡슐 앞에서 깨어난다
  R.start=async()=>{ warp(R.spawn.x,R.spawn.z,R.spawn.yaw); SHIPMAP.at('cryo');
    await card('1장 · 깨어남','214일 후 — 목성 궤도 진입 3시간 전','하위헌스 2호 · 동면 구역 C',3400);
    await fade(false,2400);
    S.phase='play';
    await TALK.say([V('동면 해제 완료. 좋은 아침입니다, 크리스 선장님.'),V('목성 궤도 진입까지 3시간 12분. 정전으로 비상 전원을 쓰고 있습니다. 대원 넷은 아직 동면 중입니다.'),
      me('머리가 깨질 것 같군… 마야, 서준, 다니엘, 오언. 다들 캡슐 안에 있다.'),me('창밖부터 봐야겠다.')]);
    P.free=true; goal('복도 끝 관측창으로 가서 밖을 본다'); };
};
