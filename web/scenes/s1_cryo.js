/* ============================================================
   1장 · 깨어남 — 하위헌스 2호 동면 구역 C (출발 214일째, 목성 궤도 진입 3시간 전)
   맵 : web/assets/cryo.glb (blender/01_동면실.blend) — SPAWN · SPOT_window · SPOT_pod_L1~R7 · COL_/COLC_
   흐름 : 깨어남 → 관측창(목성 · 웜홀) → 대원 13명 해동 (캡슐마다 체온 · 심박 확인) → 남쪽 문 → 거주 구역(deck)
   창밖 : 실제 별지도 + 웜홀 렌즈 + 목성 (sky.js) · 창유리 : 얼룩 · 반사 · 경광등이 비친다
   ============================================================ */
'use strict';
// 캡슐 번호 · 대원 (STORY.md 승무원 표). kind 가 있는 대원은 일어나서 말을 건다 — 나머지는 캡슐 안에서 회복
const CREW=[
  {pod:'L1',id:'C-01',name:'레아 문',role:'통신'},{pod:'L2',id:'C-02',name:'사라 킴',role:'의무관'},
  {pod:'L3',id:'C-03',name:'마야 첸',role:'부선장 · 조종',kind:'sophia',line:['…목성은요? 벌써 보여요?','선장님 얼굴이 먼저 보이네요. 다행이다.']},
  {pod:'L4',id:'C-04',name:'크리스',role:'선장',me:true},
  {pod:'L5',id:'C-05',name:'한서준',role:'항법',kind:'nathan',line:['으… 머리야. 214일이요? 별 위치부터 다시 재야겠네요.','항법 컴퓨터가 잔 동안 쌓인 오차가 꽤 될 거예요.']},
  {pod:'L6',id:'C-06',name:'아이샤 칸',role:'생명 과학'},{pod:'L7',id:'C-07',name:'토마스 베어',role:'지질'},
  {pod:'R1',id:'C-08',name:'유키 사토',role:'대기 과학'},{pod:'R2',id:'C-09',name:'파블로 루이스',role:'로봇'},
  {pod:'R3',id:'C-10',name:'다니엘 로드리게스',role:'기관',kind:'manuel',line:['엔진 소리… 좋아, 살아 있네.','선장님, 저는 기관실 점검부터 하고 함교로 갈게요.']},
  {pod:'R4',id:'C-11',name:'오언 하트',role:'보안',kind:'guard',line:['오언 하트, 이상 없습니다.','…꿈을 꿨는데, 기억이 안 나네요.']},
  {pod:'R5',id:'C-12',name:'노라 페레스',role:'의무 보조'},{pod:'R6',id:'C-13',name:'이반 소콜로프',role:'기관 보조'},{pod:'R7',id:'C-14',name:'하은 박',role:'데이터'}];

SCENES.cryo={title:'1장 · 깨어남', async enter(){
  await LEVEL.load('cryo');
  const f=S.flags, me=t=>({kind:'me',t}), V=t=>({who:'VEGA',kind:'vega',t});
  // 동면 캡슐 14기 : 모델 하나(pod · 열린 캡슐 pod_open)를 SPOT_pod_* 자리에 복제해 세운다 (모양 데이터는 함께 쓴다)
  const [pod,podOpen]=await Promise.all([loadGLB('pod'),loadGLB('pod_open')]);
  const pods={};
  const place=(src,s)=>{ const o=THREE.SkeletonUtils.clone(src); o.position.set(s.x,0,s.z); o.rotation.y=s.yaw; o.traverse(m=>{ if(m.isMesh) m.frustumCulled=false; }); WORLD.add(o); return o; };
  Object.entries(LEVEL.spots).filter(([k])=>k.startsWith('pod_')).forEach(([k,s])=>{ pods[k.slice(4)]={s,o:place(k==='pod_L4'?podOpen:pod,s)}; });
  if(LEVEL.items.c07) LEVEL.items.c07.visible=false;
  await SKY.space({dir:[.2,.1,-1],R:.1,jdir:[-.3,-.07,-1],jsize:.5,sunDir:[1,.35,.2]});
  WORLD.add(new THREE.HemisphereLight(0x9fb4c8,0x101418,.22));
  // 정전 : 선체 세트의 자체 발광(천장 환기구 불빛)을 낮춘다
  WORLD.traverse(o=>{ if(o.isMesh&&o.material&&/wall_albedo|base_ram|base_door/.test(o.material.name)) o.material.emissiveIntensity=.15; });
  renderer.toneMappingExposure=.62;
  const pl=(c,i,d,x,y,z)=>{ const l=new THREE.PointLight(c,i,d,1.8); l.position.set(x,y,z); WORLD.add(l); return l; };
  const red=[pl(0xff2a14,0,9,-3.1,3.6,3.5),pl(0xff2a14,0,9,3.1,3.6,-3.5)];
  // 캡슐 불빛 (해동하면 푸른색 → 초록) : 캡슐마다 하나씩은 무거우니 줄마다 넷
  const podLight={}; [['L',-2.4],['R',2.4]].forEach(([side,x])=>[[7,4.67],[2.33,0,-2.33],[-4.67,-7]].forEach((zs,i)=>{ const z=zs.reduce((a,b)=>a+b)/zs.length, l=pl(0x4fb8ff,1.5,4.5,x,1.4,z);
    zs.forEach(zz=>{ const k=CREW.find(c=>pods[c.pod]&&Math.abs(pods[c.pod].s.z-zz)<.1&&c.pod[0]===side); if(k) podLight[k.pod]=l; }); }));
  pl(0xb8c8ff,1.2,10,0,2.2,-7.6);                              // 창빛
  let alarm=0; TICK.push(()=>{ alarm=Math.max(0,Math.sin(S.t*2.6))**6; red.forEach(l=>l.intensity=alarm*5*(f.allAwake?.0:1)); });

  /* ---- 창유리 : 보는 사람과 바깥 사이에 유리가 있다는 느낌 (얼룩 · 가장자리 서리 · 비스듬히 볼수록 반사 · 경광등이 비친다) ---- */
  const gl=LEVEL.root.getObjectByName('wf_glass')||null;
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
    const pane=new THREE.Mesh(new THREE.PlaneGeometry(3.6,2.3),mat); pane.position.set(0,2.05,-8.6); WORLD.add(pane); if(gl) gl.visible=false;
    TICK.push(()=>{ U.alarm.value=alarm*(f.allAwake?0:1); }); }

  /* ---- 해동 화면 (캡슐 단말) ---- */
  const vit=$('#vitals');
  async function thaw(c){ const P0=pods[c.pod]; f['t_'+c.id]=true; S.thawing=true; S.awake=(S.awake||0)+1; goal('');
    vit.querySelector('.id').textContent=c.id; vit.querySelector('.nm').textContent=c.name; vit.querySelector('.rl').textContent=c.role;
    vit.classList.add('on'); AUDIO.beep(); const temp=36.3+Math.random()*.5, hr=56+Math.random()*14|0; c.temp=temp;
    const tE=vit.querySelector('.temp'), hE=vit.querySelector('.hr'), bar=vit.querySelector('.bar i'), st=vit.querySelector('.st');
    st.textContent='해동 중'; const t0=performance.now(), dur=3200;
    await new Promise(res=>{ const step=()=>{ const k=Math.min(1,(performance.now()-t0)/dur), e=1-Math.pow(1-k,2);
      tE.textContent=(31.2+(temp-31.2)*e).toFixed(1); hE.textContent=Math.round(12+(hr-12)*e); bar.style.width=(k*100)+'%';
      if(Math.random()<.12) AUDIO.tick(); k<1?requestAnimationFrame(step):res(); }; step(); });
    st.textContent='생체 신호 정상'; AUDIO.tone(660,.15,'sine',.1); AUDIO.tone(990,.25,'sine',.08,.15);
    steam(P0.s); AUDIO.noise(1.8,.16,0,5000,'highpass'); if(podLight[c.pod]) podLight[c.pod].color.set(0x6dffb0);
    if(c.kind){ // 캡슐이 열리고 일어난다
      WORLD.remove(P0.o); P0.o=place(podOpen,P0.s);
      const sx=P0.s.x+(P0.s.x<0?1.05:-1.05), p=await PEOPLE.spawn({kind:c.kind,name:c.name,role:c.role,at:{x:sx,z:P0.s.z,yaw:P0.s.x<0?-Math.PI/2:Math.PI/2}});
      c.p=p; await sleep(600); vit.classList.remove('on');
      await TALK.say(c.line.map((t,i)=>({who:c.name.split(' ')[0],t,npc:p})));
      PEOPLE.talkable(p,()=>TALK.say([{who:c.name.split(' ')[0],t:c.after||'함교에서 뵐게요, 선장님.',npc:p}]));
    } else { await sleep(900); vit.classList.remove('on'); toast(c.id+' '+c.name+' · 캡슐 안에서 회복 중',2200); }
    S.thawing=false; const left=CREW.filter(k=>!k.me&&!f['t_'+k.id]).length; goal(left?`대원을 깨운다 — 캡슐 단말을 눌러 해동 (${13-left} / 13)`:'');
    if(!left) await allAwake(); }
  // 증기 : 부드러운 점들이 솟았다 퍼진다
  const puff=(()=>{ const c=document.createElement('canvas'); c.width=c.height=64; const x=c.getContext('2d'), gr=x.createRadialGradient(32,32,0,32,32,32); gr.addColorStop(0,'rgba(255,255,255,.9)'); gr.addColorStop(1,'rgba(255,255,255,0)'); x.fillStyle=gr; x.fillRect(0,0,64,64); return new THREE.CanvasTexture(c); })();
  function steam(s){ const n=60, geo=new THREE.BufferGeometry(), pos=new Float32Array(n*3), vel=[]; for(let i=0;i<n;i++){ pos[i*3]=s.x+(Math.random()-.5)*.6; pos[i*3+1]=.6+Math.random()*.6; pos[i*3+2]=s.z+(Math.random()-.5)*1.2;
      vel.push([(s.x<0?1:-1)*(.3+Math.random()*.6),.2+Math.random()*.5,(Math.random()-.5)*.4]); }
    geo.setAttribute('position',new THREE.BufferAttribute(pos,3)); const m=new THREE.PointsMaterial({map:puff,size:.7,transparent:true,opacity:.5,depthWrite:false,color:0xcfe6ff}); const pts=new THREE.Points(geo,m); WORLD.add(pts);
    let life=0; const fn=dt=>{ life+=dt; for(let i=0;i<n;i++){ pos[i*3]+=vel[i][0]*dt; pos[i*3+1]+=vel[i][1]*dt; pos[i*3+2]+=vel[i][2]*dt; vel[i][0]*=.97; } geo.attributes.position.needsUpdate=true; m.opacity=.5*Math.max(0,1-life/2.6); m.size=.7+life*.5;
      if(life>2.6){ WORLD.remove(pts); TICK.splice(TICK.indexOf(fn),1); } }; TICK.push(fn); }
  // 캡슐 탭 판정 (보이지 않는 상자)
  CREW.filter(c=>!c.me).forEach(c=>{ const s=pods[c.pod]&&pods[c.pod].s; if(!s) return; const b=new THREE.Mesh(new THREE.BoxGeometry(1.1,2,2),PICK); b.position.set(s.x,1,s.z); WORLD.add(b);
    interact(b,c.id+' 캡슐 · '+c.name+' ('+c.role+') — 해동',()=>thaw(c),{range:3,enabled:()=>f.window&&!f['t_'+c.id]&&!S.thawing}); });

  async function allAwake(){ f.allAwake=true; await sleep(500);
    await TALK.say([V('대원 13명 해동 완료. 생체 신호 모두 정상입니다. 경보를 해제합니다.'),V('회복 중인 아홉 명은 의무실로 옮기겠습니다.'),
      {who:'마야',t:'선장님, 다들 정신 차리는 데 시간 좀 걸릴 거예요. 저희는 먼저 함교로 가 있을게요.',npc:CREW[2].p},
      {who:'서준',t:'목성 궤도 진입 전에 항법부터 맞춰야 해요. 따라오세요.',npc:CREW[4].p}]);
    // 서준이 앞서 걸어 나간다 (걷기 동작) · 나머지는 잠시 뒤 사라진다 (먼저 이동)
    const door={x:0,z:8.1}; const sj=CREW[4].p; if(sj){ sj.watch=false; PEOPLE.walk(sj,[[sj.wrap.position.x,6.6],[0,6.6],[door.x,door.z]],1.3).then(()=>PEOPLE.remove(sj)); }
    setTimeout(()=>[CREW[2],CREW[9],CREW[10]].forEach(c=>c.p&&PEOPLE.remove(c.p)),4200);
    goal('함교로 간다 — 동면 구역 남쪽 문'); }

  // 남쪽 문 → 거주 구역
  const dm=new THREE.Mesh(new THREE.BoxGeometry(2.1,2.7,.5),PICK); dm.position.set(0,1.35,8.4); WORLD.add(dm);
  interact(dm,'문 · 중앙 통로 (거주 구역 · 함교)',async()=>{ if(!f.allAwake){ await TALK.say([V(f.window?'대원 해동이 끝나기 전에는 동면 구역을 잠가 둡니다.':'선장님, 먼저 관측창을 확인해 주십시오.')]); return; }
    AUDIO.noise(.9,.2,0,900); AUDIO.tone(140,.5,'sawtooth',.05); await go('deck'); },{range:3.2});

  // 관측창 : 창 앞 3.5 m 안에서 창을 바라보면 (카메라를 억지로 돌리지 않고, 시야만 살짝 모은다)
  const sw=LEVEL.spots.window, wdir=new THREE.Vector3(.2,.1,-1).normalize();
  TICK.push(()=>{ if(f.window||S.busy||!P.free||!sw) return; if(Math.hypot(P.x-sw.x,P.z-sw.z)>3.6) return;
    const fz=-Math.cos(P.yaw); if(fz>-.85) return; f.window=true;
    (async()=>{ goal(''); const fov0=camera.fov; let k=0; const z=dt=>{ k=Math.min(1,k+dt/2.2); camera.fov=lerp(fov0,58,k*k*(3-2*k)); camera.updateProjectionMatrix(); }; TICK.push(z);
      await TALK.say([me('…저게 웜홀.'),V('웜홀까지 41만 km. 목성 중력권에 들어왔습니다. 별빛이 고리 모양으로 휘는 것이 보이실 겁니다.'),
        me('고리 안쪽 별들은… 우리 하늘의 별이 아니라고 했지.'),me('214일을 잤는데 하루처럼 느껴지는군.'),
        V('선장님, 목성 궤도 진입 전에 대원을 깨워야 합니다. 캡슐마다 선장님의 생체 확인이 필요합니다.'),
        V('캡슐 단말을 누르시면 해동을 시작합니다. 체온과 심박이 정상 범위에 들어오는지 함께 봐 주십시오.')]);
      TICK.splice(TICK.indexOf(z),1); let b=0; const back=dt=>{ b=Math.min(1,b+dt/1.2); camera.fov=lerp(58,fov0,b); camera.updateProjectionMatrix(); if(b>=1) TICK.splice(TICK.indexOf(back),1); }; TICK.push(back);
      goal('대원을 깨운다 — 캡슐 단말을 눌러 해동 (0 / 13)'); })(); });

  warp(LEVEL.spawn.x,LEVEL.spawn.z,LEVEL.spawn.yaw); stamp('하위헌스 2호 · 동면 구역 C','출발 214일째  ·  목성 궤도 진입 T−3:12'); SHIPMAP.at('cryo');
  AUDIO.hum(1,42);
  await card('1장 · 깨어남','214일 후 — 목성 궤도 진입 3시간 전','하위헌스 2호 · 동면 구역 C',3400);
  await fade(false,2400);
  S.phase='play';
  await TALK.say([V('동면 해제 완료. 좋은 아침입니다, 크리스 선장님.'),V('목성 궤도 진입까지 3시간 12분. 정전으로 비상 전원을 쓰고 있습니다. 대원 열세 명은 아직 동면 중입니다.'),
    me('머리가 깨질 것 같군… 창밖부터 봐야겠다.')]);
  P.free=true; goal('복도 끝 관측창으로 가서 밖을 본다');
}};
