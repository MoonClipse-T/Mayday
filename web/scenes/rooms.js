/* ============================================================
   1호의 방들 (4판) — 보이는 것만 손본다 (이야기 · 대사는 game.js)
   함교(조종석 · 함장석) · 식당 · 의무실(회복 캡슐) · 동면 구역 C(캡슐 다섯 · 관측창) · 연구실 · 라운지 · 기관실(원자로)
   전력이 죽은 배 : 방 불빛은 꺼져 있고(SHIP.dim) 붉은 비상등만 숨 쉬듯 · 원자로를 다시 켜면(ROOMS.power) 불이 돌아온다
   ============================================================ */
'use strict';
// 비상등 : 방마다 붉은 빛 하나가 천천히 깜빡인다 (전력이 돌아오면 끈다)
const EMERG=[];
function emergency(R,x,y,z){ const l=new THREE.PointLight(0xff2a14,0,8,1.8); l.position.set(x,y,z); R.add(l); EMERG.push(l); return l; }
// 의자 7개가 거꾸로(등받이가 화면 쪽) 내보내져 있다 → 제자리에서 반 바퀴
ROOMS.bridgePrep=root=>root.children.filter(o=>/^seat_/.test(o.name)).forEach(o=>{ const c=new THREE.Box3().setFromObject(o).getCenter(new THREE.Vector3());
  o.rotation.y+=Math.PI; o.updateMatrixWorld(true); const c2=new THREE.Box3().setFromObject(o).getCenter(new THREE.Vector3()); o.position.x+=c.x-c2.x; o.position.z+=c.z-c2.z; });
const deadGlow=R=>R.objs.forEach(r=>r.traverse(o=>{ if(o.isMesh&&o.material&&/wall_albedo|base_ram|base_door/.test(o.material.name)) o.material.emissiveIntensity=.03; }));

ROOMS.bridge=async R=>{ deadGlow(R); const it=R.items;
  const tm=new THREE.MeshStandardMaterial({color:0x1b1f25,metalness:.65,roughness:.38}); R.objs.forEach(r=>r.traverse(o=>{ if(o.isMesh&&o.material&&o.material.name==='Table_v2') o.material=tm; }));
  if(it.holo) it.holo.visible=true; emergency(R,0,3,-2); };

ROOMS.deck=async R=>{ deadGlow(R); const sp=R.spots, pod=await loadGLB('pod');
  for(let k=0;k<4;k++){ const s=sp['rec'+k]; if(!s) continue; const o=THREE.SkeletonUtils.clone(pod); o.position.set(s.x,0,s.z); o.rotation.y=Math.PI;
    o.traverse(m=>{ if(m.isMesh&&/HumanBody/.test(m.material.name)) m.visible=false; }); R.add(o); LEVEL.solids.push(o); }
  emergency(R,14,3,0); };

ROOMS.cryo=async R=>{ deadGlow(R); const X=R.X, sp=R.spots;
  // 동면 캡슐 다섯 : 눕혀 받침대 위에 — 1호 대원들의 캡슐은 열려 있고 비었다
  const [pod,podOpen]=await Promise.all([loadGLB('pod'),loadGLB('pod_open')]);
  const PODY=.95, PODZ={L3:2.9,L4:0,L5:-2.9,R3:1.45,R4:-1.45}, OPEN=['L3','L4','R3','R4'];
  const plinthM=new THREE.MeshStandardMaterial({color:0x1a1e23,metalness:.5,roughness:.55}), stripM=new THREE.MeshBasicMaterial({color:0x5a1010});
  const plinth=s=>{ const g=new THREE.Group(), b=new THREE.Mesh(new THREE.BoxGeometry(.78,.44,2.2),plinthM), l=new THREE.Mesh(new THREE.BoxGeometry(.8,.02,2.0),stripM);
    b.position.y=.22; l.position.y=.05; g.add(b,l); g.position.set(s.x,0,s.z); R.add(g); LEVEL.solids.push(g); };
  const place=(src,s)=>{ const o=THREE.SkeletonUtils.clone(src); o.position.set(s.x,PODY,s.z+1.25);
    o.quaternion.setFromAxisAngle(new THREE.Vector3(0,0,1),Math.PI/2+(s.x-R.ox<0?-.3:.3)).multiply(new THREE.Quaternion().setFromAxisAngle(new THREE.Vector3(1,0,0),-Math.PI/2));
    o.traverse(m=>{ if(m.isMesh){ m.frustumCulled=false; if(/HumanBody/.test(m.material.name)) m.visible=false;
      if(/glass/i.test(m.material.name)){ m.material=m.material.clone(); m.material.opacity=.22; m.material.emissiveIntensity=.04; m.material.depthWrite=false; } } }); R.add(o); LEVEL.solids.push(o); };
  Object.entries(PODZ).forEach(([k,z])=>{ const m=sp['pod_'+k], s={x:m?m.x:X(k[0]==='L'?-2.9:2.9),z}; place(OPEN.includes(k)?podOpen:pod,s); plinth(s); });
  if(R.items.c07) R.items.c07.visible=false;
  // 관측창 : 얼룩 · 가장자리 서리 · 비스듬히 볼수록 반사
  const gl=R.root.getObjectByName('wf_glass'); { const c=document.createElement('canvas'); c.width=c.height=512; const x=c.getContext('2d');
    for(let i=0;i<260;i++){ x.fillStyle=`rgba(255,255,255,${Math.random()*.05})`; x.beginPath(); x.arc(Math.random()*512,Math.random()*512,2+Math.random()*26,0,7); x.fill(); }
    const mat=new THREE.ShaderMaterial({uniforms:{smudge:{value:new THREE.CanvasTexture(c)}},transparent:true,depthWrite:false,
      vertexShader:'varying vec2 vUv; varying vec3 vW; varying vec3 vN; void main(){ vUv=uv; vec4 w=modelMatrix*vec4(position,1.0); vW=w.xyz; vN=normalize(mat3(modelMatrix)*normal); gl_Position=projectionMatrix*viewMatrix*w; }',
      fragmentShader:`uniform sampler2D smudge; varying vec2 vUv; varying vec3 vW; varying vec3 vN;
        void main(){ vec3 v=normalize(cameraPosition-vW); float fr=pow(1.0-abs(dot(v,vN)),3.0); float s=texture2D(smudge,vUv*vec2(1.6,1.0)).a; vec2 e=min(vUv,1.0-vUv); float edge=1.0-smoothstep(0.0,0.09,min(e.x*1.6,e.y));
          gl_FragColor=vec4(vec3(.78,.86,1.0),clamp(s*.9+fr*.22+edge*.25,0.0,.5)); }`});
    const pane=new THREE.Mesh(new THREE.PlaneGeometry(3.6,2.3),mat); pane.position.set(X(0),2.05,-8.6); R.add(pane); if(gl) gl.visible=false; }
  const win=new THREE.PointLight(0xb8c8ff,.8,10,1.8); win.position.set(X(0),2.2,-7.6); R.add(win);
  emergency(R,X(-3.1),3.6,3.5); };

ROOMS.lab=async R=>{ deadGlow(R); emergency(R,40,3,4); };

ROOMS.lobby=async R=>{ R.objs.forEach(r=>r.traverse(o=>{ if(!o.isMesh||!o.material) return; const n=o.material.name;
    if(n==='lounge_wood'){ o.material.color.setRGB(.3,.31,.32); o.material.roughness=.6; } if(n==='lounge_rug') o.material.color.setRGB(.14,.16,.2); if(n==='lounge_leather') o.material.color.setRGB(.3,.28,.27); }));
  emergency(R,20.5,4.2,19.5); };

ROOMS.engine=async R=>{ const it=R.items;
  // 원자로 : 꺼져 있다 → ROOMS.power() 로 숨 쉬듯 켜진다
  const core=new THREE.PointLight(0x7fd4ff,0,18,1.6); core.position.set(63.3,5,10.35); R.add(core);
  R.objs.forEach(o=>{ if(o.isPointLight){ o.userData.on=o.intensity*1.3; o.intensity=0; o.decay=1.3; o.distance*=1.3; }
    if(o.traverse) o.traverse(m=>{ if(!m.isMesh||!m.material) return; const n=m.material.name;
      if(n==='eng_wall') m.material.color.setRGB(.17,.18,.2); if(n==='eng_band') m.material.color.setRGB(.11,.115,.12); if(n==='eng_ceil') m.material.color.setRGB(.1,.1,.11); if(n==='eng_rib'){ m.material.color.setRGB(.05,.055,.06); m.material.metalness=.8; } }); });
  const lamps=[[58.5,4.5],[68,4.5],[58.5,16.2],[68,16.2]].map(([x,z])=>{ const l=new THREE.PointLight(0xc8d8ea,0,18,1.3); l.position.set(x,7.5,z); R.add(l); return l; });
  let rail=null; R.root.parent.traverse(m=>{ if(m.isMesh&&m.material&&m.material.name==='eng_rail') rail=m.material; });
  if(rail) [9.38,11.32].forEach(z=>{ const p=new THREE.Mesh(new THREE.CylinderGeometry(.028,.028,1.42,12),rail); p.position.set(63.3-Math.sqrt(6.9**2-(z-10.35)**2),.71,z); R.add(p); });
  // 제어 콘솔 둘 (원자로 재가동) : 화면 자리
  R.consoles=['scr_eng0','scr_eng1'].map(k=>it[k]).filter(Boolean);
  emergency(R,58,3,10.35);
  ROOMS.power=()=>{ S.flags.power=true; EMERG.forEach(l=>l.intensity=0); EMERG.length=0; let k=0; AUDIO.hum(1,44);
    const f=dt=>{ k=Math.min(1,k+dt/4); core.intensity=(2.2+.6*Math.sin(S.t*1.4))*k; lamps.forEach(l=>l.intensity=1.4*k); R.objs.forEach(o=>{ if(o.isPointLight&&o.userData.on) o.intensity=o.userData.on*k; }); }; TICK.push(f); }; };

// 비상등 숨쉬기 (ship.js 가 TICK 에 넣는다)
const emergTick=dt=>{ EMERG.forEach(l=>l.intensity=0); };      // 4.4 : 붉은 비상등을 끈다 (시야를 가렸다 — 사용자) · 전력 0 = 불빛 없음
