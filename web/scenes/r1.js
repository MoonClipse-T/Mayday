/* ============================================================
   구조정 R-1 안 (4.6) — 1인 구조정이지만 걸어 다닐 만한 크기 : 앞에서부터
     ① 조종석(조종 통 · 양옆 계기) → ② 로비(배급기 · 창가 바 · 책장과 의자 · 동면 캡슐) → ③ 해치 방(우주복 보관함 · 후방 도킹 조종대 · 외부 해치)
   맵 : blender/05_구조정R1.blend → web/assets/r1.glb (Space Ship Hallway · Kitchen · Poly Haven 가구 · 조종석은 그대로 앞에)
   R-1 은 비행 몸(rig) 안의 묶음 g — 걷는 좌표 P 는 g 안의 좌표 (바닥 y 0 · 앞 = +z · 조종석 눈 (0, 1.02, −1.22))
     걷는 동안 : 엔진이 P 로 카메라를 놓은 뒤 camHook 이 g 의 자세를 곱한다 → 배가 날아가도 · 돌아도 그 안을 걷는다
     조종석에 앉으면(sit) 비행 화면으로 · 일어나면(stand) 다시 걷는다
   자리(station) : 맵의 SPOT_<id> 자리마다 조사 대상 — 문제를 끼울 곳 (R1.on[id] = fn 으로 바꿔 끼운다 · R1.task(id) 는 그 자리를 쓸 때까지 기다린다)
   ============================================================ */
'use strict';
const R1={g:null,b:null,seated:true,on:{},_wait:{},
  EYE:new THREE.Vector3(0,1.02,-1.22), NOSE:11.9,      // 앉은 눈 · 외부 해치까지 (g 의 −z 쪽)
  // rig 안에 R-1 을 붙인다 (장면마다 — LEVEL.clear 가 충돌 · 조사 대상을 비우므로 다시 등록)
  async mount(rig){ const b=this.b=await LEVEL.build('r1'), g=this.g=b.group; rig.add(g); g.position.set(0,0,0); g.rotation.set(0,0,0);
    if(!b.ready){ b.ready=true;
      b.lights.forEach((d,i)=>{ if(LITE&&i%2) return; const l=new THREE.PointLight(new THREE.Color(d.c),d.i*1.15,d.d,1.6); l.position.copy(d.p); g.add(l); });
      g.traverse(o=>{ if(!o.isMesh||!o.material) return; const n=o.material.name||'';
        if(/glass/i.test(n)){ o.material.transparent=true; o.material.opacity=n==='Glass'?.06:.12; o.material.depthWrite=false; }
        if(n==='Floor_vent'){ o.material.roughness=Math.max(.35,o.material.roughness); } }); }
    FLOORS.push(...b.floors); LEVEL.solidTris.push(b); SOLID.want=true;
    this.spots=b.spots; this.items=b.items; this.stations(); this.seated=true; this.hatchOpen=false; return g; },
  // 걷기 ↔ 앉기
  follow(on){ const q=new THREE.Quaternion(); window.camHook=on?()=>{ this.g.updateWorldMatrix(true,false); camera.position.applyMatrix4(this.g.matrixWorld); camera.quaternion.premultiply(this.g.getWorldQuaternion(q)); }:null; },
  // 부모(비행 몸 rig)의 자리까지 지금 값으로 — g 만 새로 하면 rig 의 지난 프레임 자리를 써서, 빠르게 날 때 눈이 조종석 뒤에 남는다
  eye(){ this.g.updateWorldMatrix(true,false); return this.EYE.clone().applyMatrix4(this.g.matrixWorld); },
  // 조종 통 위로 넘어 들어가 앉는다
  async sit(){ S.phase='cut'; P.free=false; goal(''); await camTo({x:0,z:-2.55,yaw:Math.PI,pitch:-.55,eye:2.02},.9); await camTo({x:0,z:this.EYE.z,yaw:Math.PI,pitch:-.04,eye:this.EYE.y},1.1);
    AUDIO.tone(220,.12,'square',.04); AUDIO.tone(330,.12,'square',.04,.12); this.follow(false); this.seated=true; },
  // 일어나 조종석 뒤로 (head : 앉아 있을 때 고개 돌린 만큼에서 시작)
  async stand(head){ P.x=0; P.z=this.EYE.z; P.y=0; P.eye=this.EYE.y; P.yaw=Math.PI+(head?head.y:0); P.pitch=head?head.p:0; this.seated=false; this.follow(true);
    if(typeof FLIGHT!=='undefined'&&document.body.classList.contains('flying')) FLIGHT.ui(false); S.phase='cut'; P.free=false;
    await camTo({x:0,z:-2.55,yaw:Math.PI*.98,pitch:-.3,eye:2.02},.9); await camTo({x:0,z:-3.15,yaw:0,pitch:0,eye:1.66},1.0); S.phase='play'; P.free=true; },
  // 자리 : 보이지 않는 판정 상자 + 이름표 · 기본 동작 (문제를 끼우면 R1.on[id] 가 먼저)
  LABEL:{seat:'조종석 — 앉는다',galley:'식량 배급기',ledge:'창가 — 밖을 본다',shelf:'책장',capsule:'동면 캡슐',locker:'우주복 보관함',aft:'후방 도킹 조종대',hatch:'외부 해치'},
  BOX:{seat:[[0,.9,-2.78],[1.1,1.6,.25]],galley:[[-.9,1.1,-5.4],[.8,1.6,2.8]],ledge:[[1.2,1.25,-6.65],[.5,.7,1.4]],shelf:[[1.25,1.7,-4.68],[.4,.9,1.4]],
    capsule:[[-.86,1.1,-8.75],[1,2.1,1]],locker:[[-1.12,1.1,-10.6],[.6,2,1.2]],aft:[[1.2,1.3,-10.62],[.45,1.2,1.1]],hatch:[[0,.85,-11.68],[1.4,1.6,.2]]},
  stations(){ (this._picks||[]).forEach(m=>m.parent&&m.parent.remove(m)); this._picks=[]; this._wait={};      // 묶음은 장면마다 다시 쓰므로 지난 판정 상자는 치운다
    for(const id in this.BOX){ const [c,s]=this.BOX[id], m=new THREE.Mesh(new THREE.BoxGeometry(...s),PICK); m.position.set(...c); this.g.add(m); this._picks.push(m);
      interact(m,this.LABEL[id],()=>this.use(id),{range:2.6,enabled:()=>!this.seated}); } },
  async use(id){ const w=this._wait[id]; if(w){ delete this._wait[id]; return w(); } if(this.on[id]) return this.on[id](); const f=this.FLAVOR[id]; if(f) await f.call(this); },
  // 그 자리를 쓸 때까지 기다린다 (goal 글을 함께)
  task(id,text){ if(text) goal(text); return new Promise(r=>this._wait[id]=r); },
  // 아무 일 없을 때의 반응 (문제를 끼우기 전)
  FLAVOR:{
    seat(){ return TALK.say([I('…지금은 자동 항법이다. 앉을 일이 생기면 VEGA 가 부른다.')]); },
    galley(){ AUDIO.tone(880,.08,'sine',.05); AUDIO.noise(1.2,.05,.1,700); return TALK.say([I(['…데운 단백질 죽. 맛은 없다. 따뜻하기는 하다.','…물 한 팩. 지구에서 떠 온 물이 줄어든다.','…넉 달 치 식량. 편도분 연료처럼, 돌아갈 몫은 없다.'][this._g=(this._g||0)%3,this._g++])]); },
    async ledge(){ S.busy=true; const y0=P.yaw, p0=P.pitch; await camTo({yaw:-Math.PI/2,pitch:-.05},.9); await TALK.say([I(this.view||'…창밖은 별뿐이다. 깜빡이지 않는 별.')]); await camTo({yaw:y0,pitch:p0},.7); S.busy=false; },
    shelf(){ return doc('R-1 운용 수첩','<p><b>R-1 구조정</b> — 1인 · 동면 캡슐 1 · 이온 엔진 · 연료 <b>편도분</b>.</p><p><b>도킹</b> : R-1 의 도킹 해치는 <b>뒤쪽(외부 해치)</b>에 있다. 도킹할 때는 배를 돌려 뒤를 상대 고리에 대고, 해치 방의 <b>후방 도킹 조종대</b>에서 뒤 카메라를 보며 몬다.</p><p><b>동면</b> : 캡슐에 들어가면 VEGA 가 정해진 날에 깨운다. 깨어나면 몸이 무겁다 — 천천히 일어날 것.</p><p class="dim">— 책 사이에 끼워진 사진 : 1호 대원 열두 명. 맨 끝에 레아 문.</p>','책장 · 둘째 칸'); },
    capsule(){ return TALK.say([I('…넉 달을 저 안에서 잔다. 아니, 잤다.')]); },
    locker(){ SFX.play('locker_open',{vol:.6}); return TALK.say([I('EVA 우주복 한 벌, 산소통 둘. …1호 안은 공기가 있기를.')]); },
    aft(){ return TALK.say([I('후방 도킹 조종대. 뒤쪽 카메라로 보며 배를 몬다 — 도킹할 때 쓴다.')]); },
    hatch(){ AUDIO.tone(520,.1,'square',.04); return TALK.say([VG('외부 해치 잠금 정상. 바깥은 진공입니다, 크리스.')]); } },
  // 외부 해치 : 옆으로 미끄러져 열린다
  openHatch(){ const d=this.items.hatchdoor; if(!d||this.hatchOpen) return Promise.resolve(); this.hatchOpen=true; SFX.play('airlock'); AUDIO.noise(1.4,.15,0,900);
    const x0=d.position.x; let k=0; return new Promise(res=>{ const f=dt=>{ k=Math.min(1,k+dt/1.6); d.position.x=x0+k*k*(3-2*k)*1.45; if(k>=1){ TICK.splice(TICK.indexOf(f),1); res(); } }; TICK.push(f); }); },
  // 동면 캡슐에서 깨어난다 : 캡슐 안 → 밖으로 한 걸음
  async wake(){ const c=this.spots.capsule||{x:-.25,z:-8.75}; this.seated=false; this.follow(true); warp(-0.86,-8.75,-Math.PI/2); P.eye=1.62; P.pitch=-.1; S.phase='cut'; P.free=false; return c; },
  async outOfCapsule(){ const c=this.spots.capsule||{x:-.25,z:-8.75}; await camTo({x:c.x+.15,z:c.z,yaw:-Math.PI/2,pitch:0,eye:1.66},1.6); S.phase='play'; P.free=true; },
  async intoCapsule(){ S.phase='cut'; P.free=false; goal(''); await camTo({x:-.4,z:-8.75,yaw:Math.PI/2,pitch:0},.8); await camTo({x:-.86,z:-8.75,yaw:-Math.PI/2,pitch:-.1,eye:1.62},1.4); },
};
