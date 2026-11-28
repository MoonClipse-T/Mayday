/* ============================================================
   1호를 찾아서 (4.16) — 웜홀을 건넌 뒤, 1부의 마지막 절반 : 1호의 마지막 전파를 거슬러 1호가 있는 곳을 알아낸다
   ① 여기는 어디 : 깜깜한 하늘(별만 드문드문) → VEGA 가 눈앞에 홀로그램을 띄운다 — 우리은하가 아니다 · 외부 은하 NGC 3500 (지구에서 4억 3천만 광년)
   ② 전파의 방향 : 안테나는 뱃머리에 있다 → 기수를 돌려 전파가 가장 또렷한 쪽을 찾는다 → 지구에 닿지 못한 '기록 조각' 셋이 풀린다 (표면 온도 5,500 K · 밝기가 변하는 별)
   ③ 촬영 : 그쪽을 찍는다 — 빛을 내는 것 열셋 → 사진 한 장으로는 밝기가 변하는지 모른다 → 해치 방 기록 단말에서 1호가 같은 하늘을 열이레 동안 찍은 옛 기록을 찾아 밝기 표로 본다 (4.23 : 동면 대신)
   ④ 지우기 (로비의 홀로그램) : 1단계 밝기가 변하는 별(변광성)만 남기기 → 2단계 그 가운데 표면 온도 5,500 K 인 별 하나 (4.23)
   ⑤ 절대 등급 : 남은 별의 밝기가 되풀이되는 주기를 재고 → 같은 종류의 별 다섯에서 규칙(주기가 두 배 → 0.7 작아진다)을 찾아 절대 등급을 알아낸다 (지식이 아니라 규칙 찾기) → −4.5
   ⑥ 겉보기 등급 (4.25) : 변광성은 평균 등급을 쓴다 — 기록의 가장 밝을 때 −2.0 · 가장 밝을 때는 가장 어두울 때의 100배 → 가장 어두울 때 3.0 → 평균 0.5 (단답)
   4.25 : ⑤ ⑥ ⑦ 의 답은 밀대가 아니라 단답(숫자 자판) — 찍어서 맞히지 못하게
   ⑦ 거리 : 5등급 차 = 밝기 100배 → 10 pc 의 10배 = 100 pc (시험 신호로 확인)
   ⑧ 도약 : 주름길(웜홀이 열리며 시공간에 잡힌 주름 — 1호도 전파도 이 길로 왔다)을 100 pc → 소행성 지대(scenes/belt.js) → 노란 변광성 곁에 1호의 그림자 → 1부 끝 (도킹은 2부)
   홀로그램은 모두 3D (additive · 벽에 가리지 않음) · 재는 장치는 그 옆 판(#seek)
   ============================================================ */
'use strict';
const SEEK={
  DAYS:17, TARGET:9, PERIOD:8, ABS:-4.5, APP:.5, MAX:-2.0, MIN:3.0, MULT:10,      // 4.25 : 겉보기 0.5 (−2.0 과 3.0 의 평균) − 절대 −4.5 = 5 → 100 pc
  COL:{b:['파란색','#6a98ff'],bw:['청백색','#a5c3ff'],w:['흰색','#f2f5ff'],yw:['황백색','#fff0bd'],y:['노란색','#ffd02a'],o:['주황색','#ff8f30'],r:['붉은색','#ff4630']},
  // 열원 열셋 : n 번호 · c 색 · x y 판 위 자리 · m 크기 · P 밝기가 변하는 주기(없으면 그대로) · t0 가장 밝은 날
  STARS:[{n:1,c:'w',x:-.72,y:.27,m:1.0},{n:2,c:'b',x:-.43,y:.37,m:1.15},{n:3,c:'y',x:-.16,y:.2,m:1.05},{n:4,c:'r',x:-.63,y:-.06,m:1.0,P:12,t0:6},{n:5,c:'o',x:-.31,y:-.03,m:.9},{n:6,c:'y',x:.1,y:-.14,m:.85},{n:7,c:'b',x:.3,y:.36,m:.9},
    {n:8,c:'bw',x:.65,y:.22,m:1.0,P:5,t0:2},{n:9,c:'y',x:.41,y:.04,m:1.0,P:8,t0:3},{n:10,c:'r',x:-.1,y:-.38,m:1.1},{n:11,c:'o',x:-.5,y:-.36,m:1.0,P:10,t0:4},{n:12,c:'y',x:.3,y:-.35,m:1.1},{n:13,c:'yw',x:.71,y:-.25,m:1.05}],
  // 기록 조각 (지구에 닿지 못한 1호의 전파) : [본문, 화면에 붙여 둘 짧은 글]
  FRAG:[['…여기가 어딘지 모르겠다. 무언가에 휩쓸려 왔다. 창밖에 별이 하나 있다. 표면 온도를 쟀다. 5,500 K.','창밖에 별이 하나.<br>표면 온도 <b>5,500 K</b>.'],
    ['…그 별이 이상하다. 밝아졌다가, 어두워졌다가. 숨을 쉬는 것 같다.','밝아졌다가, 어두워졌다가.<br><b>숨을 쉬는</b> 것 같다.'],
    ['…밤마다 환기구에서 소리가 난다. 불을 켜면 멈춘다. 몇 명 남았는지… 이제 세지 않는다.','밤마다 환기구에서 소리.<br>몇 명 남았는지 세지 않는다.']],
  // 같은 종류의 별 (규칙 : 주기 2배 → 절대 등급 0.7 작아진다) — 표면 온도 · 겉보기 등급은 규칙이 없다
  CARDS:[{k:'A',P:2,M:-3.1,T:'6,300 K',m:4.2},{k:'B',P:32,M:-5.9,T:'5,400 K',m:7.7},{k:'C',P:16,M:-5.2,T:'5,900 K',m:6.1},{k:'?',P:8,M:null,T:'5,500 K',m:null},{k:'D',P:4,M:-3.8,T:'6,100 K',m:5.5},{k:'E',P:1,M:-2.4,T:'5,700 K',m:9.3}],
  // 0(어두움) ~ 1(밝음) : 빠르게 밝아지고 천천히 어두워진다
  wave(d,P,t0){ let f=((d-t0)/P+.25)%1; if(f<0) f+=1; const s=f<.25?f/.25:1-(f-.25)/.75; return s*s*(3-2*s); },
  flux(s,d){ return s.P?Math.pow(10,.4*1.9*(this.wave(d,s.P,s.t0)-.5)):1; },
  V:t=>({who:'VEGA',ch:'구조정 AI',kind:'vega',t}), C:t=>({kind:'me',t}),
  N:(v,d=1)=>(v<0?'−':'')+Math.abs(v).toFixed(d),

  async run(from='arrive'){ const J=this.J=await JOURNEY.cockpit(); J.head.y=0; J.head.p=-.02;
    await SKY.space({dir:[.14,.06,-1],R:.09,jupiter:false,sunDir:[-.4,.5,.6],far:true,sunI:.1}); scene.background=new THREE.Color(0x000000); renderer.toneMappingExposure=1; this.lamps(); this.board=null; this.day=0;
    if(from==='arrive'){ await this.arrive(); await this.direction(); await this.shoot(); await this.records(); }
    else { await this.dim(.3,0); this.ui(); this.frags(); if(from==='holo'){ fade(false,900); await R1.stand(J.head); } }
    if(['belt','crash','eva','site','found'].includes(from)){ loadGLB('ship_ext').then(h=>this.hull=h); if(from!=='found') await BELT.run({belt:'fly',eva:'prep'}[from]||from); return this.found(); }
    if(from!=='warp'){ await this.hologram(); await this.erase(); await this.absolute(); await this.apparent(); await this.distance(); await this.closeHolo(); }
    else { fade(false,800); await R1.stand(J.head); }
    await this.warp(); },

  /* ---- 배 안의 불 : 홀로그램을 볼 때 어둡게 ---- */
  lamps(){ this.L=[]; const ms=new Set(); R1.g.traverse(o=>{ const m=o.isMesh&&o.material; if(!m||Array.isArray(m)||ms.has(m)) return; if(m.emissive&&m.emissive.r+m.emissive.g+m.emissive.b>.6){ ms.add(m); if(m.userData.e0===undefined) m.userData.e0=m.emissiveIntensity; m.emissiveIntensity=m.userData.e0; } }); this.glowM=[...ms]; R1.g.traverse(o=>{ if(o.isPointLight&&!o.userData.holo){ if(o.userData.i0===undefined) o.userData.i0=o.intensity; o.intensity=o.userData.i0; this.L.push(o); } }); WORLD.children.forEach(o=>{ if(o.isHemisphereLight){ if(o.userData.i0===undefined) o.userData.i0=o.intensity; this.L.push(o); } }); this.lk=1; },
  dim(k,dur=1.2){ const a=this.lk; this.lk=k; const set=v=>{ this.L.forEach(l=>l.intensity=l.userData.i0*v); this.glowM.forEach(m=>m.emissiveIntensity=m.userData.e0*Math.max(.12,v)); }; if(!dur){ set(k); return Promise.resolve(); } return over(dur,e=>set(a+(k-a)*e)); },

  /* ---- 홀로그램 재료 ---- */
  glowTex(){ return this._gt||(this._gt=(()=>{ const c=document.createElement('canvas'); c.width=c.height=128; const g=c.getContext('2d'), r=g.createRadialGradient(64,64,0,64,64,64); r.addColorStop(0,'rgba(255,255,255,1)'); r.addColorStop(.16,'rgba(255,255,255,.95)'); r.addColorStop(.3,'rgba(255,255,255,.42)'); r.addColorStop(.6,'rgba(255,255,255,.1)'); r.addColorStop(1,'rgba(255,255,255,0)'); g.fillStyle=r; g.fillRect(0,0,128,128); return new THREE.CanvasTexture(c); })()); },
  lin(c){ return new THREE.Color(c).convertSRGBToLinear(); },
  smat(color,o={}){ return new THREE.SpriteMaterial({map:this.glowTex(),color:this.lin(color),transparent:true,depthTest:false,depthWrite:false,blending:THREE.AdditiveBlending,toneMapped:false,fog:false,...o}); },
  label(text,{size=46,color='#bfe6ff',h=.05,w=640}={}){ const c=document.createElement('canvas'); c.width=w; c.height=84; const x=c.getContext('2d'); x.font=`500 ${size}px "IBM Plex Sans KR","Malgun Gothic",sans-serif`; x.fillStyle=color; x.textAlign='center'; x.textBaseline='middle'; x.shadowColor='rgba(0,0,0,.9)'; x.shadowBlur=10; x.fillText(text,w/2,44);
    const t=new THREE.CanvasTexture(c); t.encoding=THREE.sRGBEncoding; const s=new THREE.Sprite(new THREE.SpriteMaterial({map:t,transparent:true,depthTest:false,depthWrite:false,toneMapped:false,fog:false})); s.scale.set(h*w/84,h,1); s.renderOrder=12; return s; },
  lines(pts,color=0x9fd8ff,op=.7){ const m=new THREE.LineSegments(new THREE.BufferGeometry().setFromPoints(pts),new THREE.LineBasicMaterial({color:this.lin(color),transparent:true,opacity:op,depthTest:false,depthWrite:false,toneMapped:false,fog:false})); m.renderOrder=8; m.frustumCulled=false; return m; },
  // 나선 은하 : 점구름 (원반 = xz)
  galaxy({n=3800,arms=2,bar=.2,wind=3.4,R=.5,tint=[.55,.8,1]}={}){ if(LITE) n=n*.6|0; const pos=new Float32Array(n*3), col=new Float32Array(n*3), g=()=>(Math.random()+Math.random()+Math.random()-1.5)/1.5;
    for(let i=0;i<n;i++){ let x,y,z,b; if(Math.random()<.24){ const r=Math.abs(g())*.17*R/.5, a=Math.random()*6.283; x=Math.cos(a)*r*(1+bar*2.4); z=Math.sin(a)*r*.75; y=g()*.05; b=1; }
      else { const r=(.1+Math.pow(Math.random(),.75)*.9)*R, k=(Math.random()*arms|0)/arms*6.283, a=k+Math.log(r/R+.12)*wind+g()*(.34+.16*R/r*.2); x=Math.cos(a)*r; z=Math.sin(a)*r; y=g()*.014; b=.5+.5*Math.random(); }
      pos.set([x,y,z],i*3); const r=Math.hypot(x,z)/R, warm=Math.max(0,1-r*3); col.set([(tint[0]+(1-tint[0])*warm)*b,(tint[1]+(.9-tint[1])*warm)*b,(tint[2]+(.72-tint[2])*warm)*b],i*3); }
    const ge=new THREE.BufferGeometry(); ge.setAttribute('position',new THREE.BufferAttribute(pos,3)); ge.setAttribute('color',new THREE.BufferAttribute(col,3));
    const m=new THREE.Points(ge,new THREE.PointsMaterial({map:this.glowTex(),size:.011,vertexColors:true,transparent:true,opacity:.9,depthTest:false,depthWrite:false,blending:THREE.AdditiveBlending,toneMapped:false,fog:false})); m.renderOrder=8; m.frustumCulled=false; return m; },
  // 서서히 나타나고 사라지기 : 묶음 안 재질의 투명도
  op(g,k){ g.traverse(o=>{ const m=o.material; if(!m) return; if(m.userData.o===undefined) m.userData.o=m.opacity; m.opacity=m.userData.o*k; }); },
  async show(g,on,dur=.8){ g.visible=true; await over(dur,e=>this.op(g,on?e:1-e)); if(!on) g.visible=false; },
  hum(){ AUDIO.tone(520,.18,'sine',.05); AUDIO.tone(780,.3,'sine',.045,.1); AUDIO.noise(.5,.04,0,4000,'highpass'); },

  /* ============ ① 여기는 어디 ============ */
  async arrive(){ const {V,C}=this, {head}=this.J; S.phase='cut'; P.free=false; goal(''); stamp('구조정 R-1 · 조종석','2091.07.21 · 웜홀 통과 +00:04'); AUDIO.hum(.35,34); MUSIC.play('space',{fade:4});
    await fade(false,2600); $('#fade').style.background=''; await card('웜홀 건너편','여기는 어디인가','지구를 떠난 지 넉 달 · 1호가 끊긴 지 열한 달',3400);
    S.phase='play'; P.look=true; let moved=0; const dh=window.dragHook; window.dragHook=(dx,dy,e)=>{ moved+=Math.abs(dx)+Math.abs(dy); dh(dx,dy,e); };
    await TALK.say([V('웜홀 통과 완료. 선체 이상 없음. 크리스, 괜찮습니까?'),C('…괜찮아.')]);
    goal('창밖을 둘러본다 — 화면을 끌어 고개를 돌린다'); { let t=0; await until(dt=>{ t+=dt; return moved>500&&t>3||t>9; }); } goal('');
    await TALK.say([C('…깜깜하다. 은하수가 없다.'),C('아는 별자리도, 하나도 없다. 여기는… 어떤 은하지?'),V('별 지도와 대조하겠습니다. 앞을 보십시오.')]);
    window.dragHook=dh; { const y0=head.y,p0=head.p; await over(.9,e=>{ head.y=y0*(1-e); head.p=p0+(-.02-p0)*e; }); }
    // 홀로그램 : 조종석 앞 유리 앞 (눈앞 1.25 m)
    this.dim(.4,1.4); const H=this.H=new THREE.Group(); R1.g.add(H); H.position.set(0,1.06,.05); H.rotation.y=Math.PI;
    const pl=new THREE.PointLight(0x7fd4ff,.35,2.2,2); pl.userData.holo=true; pl.position.set(0,0,.3); H.add(pl); JOURNEY.tick(()=>{ if(pl.parent) pl.intensity=.35+.05*Math.sin(S.t*9); });
    const A=new THREE.Group(), B=new THREE.Group(); H.add(A,B); A.visible=B.visible=false; const ga=this.galaxy({arms:2,bar:.5,R:.42}), gb=this.galaxy({arms:3,bar:.1,wind:4.2,R:.46,tint:[.72,.62,1]}); ga.rotation.x=gb.rotation.x=0; A.add(ga); B.add(gb); A.rotation.x=.62; B.rotation.x=.62;
    const la=this.label('우리은하',{h:.08}), lb=this.label('외부 은하  NGC 3500',{h:.085,color:'#ffe1a6'}); la.position.set(0,.4,0); lb.position.set(.1,.43,0); const HA=new THREE.Group(), HB=new THREE.Group(); H.add(HA,HB); HA.add(la); HB.add(lb); HA.visible=HB.visible=false;
    const sun=new THREE.Sprite(this.smat(0xffe9a0)); sun.scale.setScalar(.035); sun.position.set(.2,.01,.06); sun.renderOrder=10; A.add(sun); const me=new THREE.Sprite(this.smat(0xff5a36)); me.scale.setScalar(.06); me.position.set(-.425,.012,.09); me.renderOrder=11; me.visible=false; B.add(me);
    JOURNEY.tick(dt=>{ if(!H.parent) return; A.rotation.y+=dt*.12; B.rotation.y+=dt*.05; me.material.opacity=.55+.45*Math.sin(S.t*6); });
    const rings=new THREE.Group(); B.add(rings); rings.position.set(.2,.01,-.18); rings.visible=false; const RG=[0,1,2].map(i=>{ const m=new THREE.Mesh(new THREE.RingGeometry(.96,1,48),new THREE.MeshBasicMaterial({color:0x9fd8ff,transparent:true,depthTest:false,depthWrite:false,blending:THREE.AdditiveBlending,side:THREE.DoubleSide,toneMapped:false})); m.rotation.x=-Math.PI/2; m.renderOrder=9; rings.add(m); return m; });
    JOURNEY.tick(()=>{ if(rings.visible&&H.parent) RG.forEach((m,i)=>{ const k=(S.t*.35+i/3)%1; m.scale.setScalar(.02+k*.3); m.material.opacity=.7*(1-k); }); });
    await TALK.say([{...V('우리은하의 별 지도입니다.'),fx:()=>{ this.hum(); this.show(A,true); this.show(HA,true); }},
      V('지금 창밖의 별과 대조합니다. …일치하는 별, 0개.'),
      {...V('여기는 우리은하가 아닙니다.'),fx:()=>{ AUDIO.tone(180,.5,'sine',.06); over(1.6,e=>{ A.scale.setScalar(1-.68*e); A.position.set(-.46*e,.26*e,0); HA.position.set(-.5*e,-.02*e,0); HA.scale.setScalar(1-.2*e); }); }},
      {...V('우리은하 밖에 있는 은하 — 외부 은하입니다.'),fx:()=>{ this.hum(); this.show(B,true,1.4); this.show(HB,true,1.4); }},
      V('별빛의 흡수선이 아마라 박사의 자료와 같습니다. NGC 3500. 지구에서 약 4억 3천만 광년.'),
      C('빛이 4억 년 넘게 달려야 하는 거리를… 한순간에.'),
      {...V('우리는 이 은하의 맨 가장자리에 있습니다. 별이 드문 곳입니다.'),fx:()=>{ me.visible=true; AUDIO.tone(990,.12,'sine',.06); }},
      C('그래서 이렇게 깜깜했군. …1호는? 1호는 어디 있어.'),
      V('보이지 않습니다. 열도, 불빛도 없습니다.'),
      {...V('하지만 1호의 MAYDAY 신호가 지금도 이 하늘에 울립니다. 이틀에 한 번꼴로.'),fx:()=>{ rings.visible=true; AUDIO.radio(2.5); }},
      V('그 신호를 거슬러 올라가면, 1호가 있습니다.')]);
    await TALK.say([{...RADIO(MORSE.text('MAYDAY')),fx:()=>MORSE.play('MAYDAY')},C('…MAYDAY. 지구에서 들은 그대로다.')]);
    this.hum(); await this.show(H,false,.7); R1.g.remove(H); P.look=false; },

  /* ============ ② 전파의 방향 ============ */
  async direction(){ const {V,C}=this, {rig,head}=this.J; S.phase='play'; P.free=false;
    await TALK.say([V('전파 안테나는 뱃머리에 고정돼 있습니다. 기수를 돌려, 전파가 가장 또렷한 쪽을 찾으십시오.')]);
    goal(byDevice('전파가 가장 또렷한 쪽으로 — 화면을 끌어(또는 방향키) 기수를 돌린다','전파가 가장 또렷한 쪽으로 — 화면을 끌어 기수를 돌린다'));
    const T=new THREE.Vector3(-.87,.26,-.42).normalize(), av=new THREE.Vector3(), ui=document.createElement('div'); ui.id='sig'; ui.innerHTML='<p class="k">HUY-1 수신 · 뱃머리 안테나</p><canvas width="900" height="150"></canvas><div class="bar"><i></i></div><p class="m">잡음뿐이다</p><div class="nose"><i></i></div>'; document.body.appendChild(ui); requestAnimationFrame(()=>ui.classList.add('on'));
    const cv=ui.querySelector('canvas'), g=cv.getContext('2d'), bar=ui.querySelector('.bar i'), msg=ui.querySelector('.m'), nose=ui.querySelector('.nose'); const hk=window.dragHook; let idle=0;
    window.dragHook=(dx,dy)=>{ if(TALK.on) return; const k=IS_TOUCH?.0046:.0032; av.y-=dx*k; av.x-=dy*k; idle=0; };
    // 소리 : 잡음이 걷히고 낮은 떨림(18 Hz)이 올라온다
    const ac=AUDIO.ctx, snd=ac?(()=>{ const n=ac.sampleRate*2, b=ac.createBuffer(1,n,ac.sampleRate), d=b.getChannelData(0); for(let i=0;i<n;i++) d[i]=Math.random()*2-1; const s=ac.createBufferSource(); s.buffer=b; s.loop=true; const f=ac.createBiquadFilter(); f.type='bandpass'; f.frequency.value=1600; f.Q.value=.7; const v=ac.createGain(); v.gain.value=0; s.connect(f).connect(v).connect(ac.destination); s.start();
      const o=ac.createOscillator(), lf=ac.createOscillator(), lg=ac.createGain(), ov=ac.createGain(); o.frequency.value=62; lf.frequency.value=18; lg.gain.value=0; ov.gain.value=0; lf.connect(lg).connect(ov.gain); o.connect(ov).connect(ac.destination); o.start(); lf.start();
      return {set(k){ const t=ac.currentTime; v.gain.setTargetAtTime(.07*(1-k)+.006,t,.1); ov.gain.setTargetAtTime(.04*k*k,t,.1); lg.gain.setTargetAtTime(.04*k*k,t,.1); },stop(){ v.gain.setTargetAtTime(0,ac.currentTime,.2); ov.gain.setTargetAtTime(0,ac.currentTime,.2); lg.gain.setTargetAtTime(0,ac.currentTime,.2); setTimeout(()=>{ s.stop(); o.stop(); lf.stop(); },900); }}; })():null;
    let hold=0, t=0, bp=0, ph=0; const fw=new THREE.Vector3(), up=new THREE.Vector3(), rt=new THREE.Vector3();
    await until(dt=>{ if(TALK.on) return false; t+=dt; idle+=dt; const K=keys; av.y+=((K.ArrowLeft||K.KeyA?1:0)-(K.ArrowRight||K.KeyD?1:0))*1.3*dt; av.x+=((K.ArrowUp||K.KeyW?1:0)-(K.ArrowDown||K.KeyS?1:0))*1.3*dt; if(K.ArrowLeft||K.ArrowRight||K.ArrowUp||K.ArrowDown) idle=0;
      rig.rotateX(-av.x*dt); rig.rotateY(av.y*dt); av.multiplyScalar(1-Math.min(1,dt*2)); fw.set(0,0,1).applyQuaternion(rig.quaternion); up.set(0,1,0).applyQuaternion(rig.quaternion); rt.crossVectors(fw,up);
      const off=Math.acos(clamp(fw.dot(T),-1,1)), s=.5*Math.pow(Math.max(0,1-off/2.6),1.3)+.5*Math.exp(-Math.pow(off/.28,2));
      if(off<.11&&idle>.25){ const ax=new THREE.Vector3().crossVectors(fw,T); if(ax.length()>1e-4) rig.quaternion.premultiply(new THREE.Quaternion().setFromAxisAngle(ax.normalize(),off*Math.min(1,dt*1.6))); }      // 거의 맞으면 살며시 끌려간다
      this.J.cam(); hold=off<.06?hold+dt:0; snd&&snd.set(s); bar.style.width=Math.round(s*100)+'%'; ui.classList.toggle('hot',s>.8);
      msg.textContent=hold>0?'그대로…':s>.8?'펄스가 또렷하다 — 조금만 더':s>.45?'잡음 속에 무언가 있다':s>.18?'잡음이 조금 걷혔다':'잡음뿐이다';
      bp-=dt; if(bp<=0&&s>.25){ bp=1.15-.85*s; AUDIO.tone(700+500*s,.05,'sine',.02+.05*s); }
      // 파형 : 잡음 위로 목소리의 마디가 드러난다
      ph+=dt; g.clearRect(0,0,900,150); g.lineWidth=2.5; g.strokeStyle=s>.8?'#ffb0a0':'#9fd8ff'; g.beginPath(); for(let x=0;x<900;x+=3){ const u=x/900, env=Math.pow(Math.abs(Math.sin(u*9.4+ph*1.1))*Math.abs(Math.sin(u*23+ph*.6)),.8), y=75+Math.sin(x*.21+ph*26)*58*env*s+(Math.random()-.5)*92*(1-s)*(.25+.75*(1-s)); x?g.lineTo(x,y):g.moveTo(x,y); } g.stroke();
      // 오래 헤매면 방향을 알려 준다
      const help=t>32&&off>.16; nose.style.display=help?'block':'none'; if(help){ const wx=T.dot(rt), wy=T.dot(up); nose.style.transform=`rotate(${Math.atan2(-wy,wx)}rad)`; }
      return hold>1.5; });
    goal(''); snd&&snd.stop(); AUDIO.tone(660,.12,'sine',.07); AUDIO.tone(990,.2,'sine',.07,.12); window.dragHook=hk; toast('전파 방향 고정',1800);
    const q0=rig.quaternion.clone(), q1=q0.clone(); { const f=new THREE.Vector3(0,0,1).applyQuaternion(q0); q1.premultiply(new THREE.Quaternion().setFromUnitVectors(f,T)); } await over(.8,e=>rig.quaternion.copy(q0).slerp(q1,e));
    ui.classList.add('lock'); msg.textContent='방향 고정';
    // 기록 조각 셋
    MORSE.play('MAYDAY',{vol:.05}); await TALK.say([V('방향을 고정했습니다. …크리스. MAYDAY 펄스 사이에 다른 자료가 실려 있습니다.'),V('1호의 옛 기록입니다. 마지막 교신 뒤에 쓰였고, 지구에는 닿지 못했습니다. 조각 셋을 풀었습니다.')]);
    this.ui(); for(let i=0;i<3;i++){ AUDIO.radio(2.2); await TALK.say([{who:'레아 문',ch:'1호 기록 · 조각 '+(i+1),kind:'radio',t:this.FRAG[i][0]}]); this.frags(i+1); }
    ui.classList.remove('on'); setTimeout(()=>ui.remove(),600);
    await TALK.say([C('…레아 문. 마지막 교신 뒤에도 살아 있었다.'),V('1호의 임무는 태양을 닮은 별의 골디락스 존에서 행성을 찾는 것이었습니다.'),V('1호는 기록 속 그 별을 찾아갔습니다. 그 별을 찾으면, 1호를 찾습니다.')]); },

  /* ---- 화면 판 : 기록 조각(왼쪽) · 장치(오른쪽) · 아래 줄 ---- */
  ui(){ let e=$('#seek'); if(!e){ e=document.createElement('div'); e.id='seek'; e.innerHTML='<div class="rec"><p class="k">1호 기록 조각</p></div><div class="side"></div><div class="bot"></div><div class="chip"></div>'; document.body.appendChild(e); } requestAnimationFrame(()=>e.classList.add('on')); return this.E=e; },
  frags(n=3){ const r=this.E.querySelector('.rec'); r.querySelectorAll('.f').forEach(x=>x.remove()); for(let i=0;i<n;i++){ const d=document.createElement('div'); d.className='f'+(i===n-1?' new':''); d.innerHTML=`<b class="i">${i+1}</b><p>${this.FRAG[i][1]}</p>`; r.appendChild(d); } r.classList.add('on'); },
  side(html,cls=''){ const s=this.E.querySelector('.side'); s.className='side '+cls; s.innerHTML='<button class="fold" aria-label="접기">접기 ▾</button>'+html; s.querySelector('.fold').onclick=()=>{ AUDIO.click(); const m=s.classList.toggle('min'); s.querySelector('.fold').textContent=m?'펼치기 ▴':'접기 ▾'; }; requestAnimationFrame(()=>s.classList.add('on')); return s; },
  off(sel){ const s=this.E.querySelector(sel); s.classList.remove('on'); setTimeout(()=>{ if(!s.classList.contains('on')) s.innerHTML=''; },350); },
  ok(){ AUDIO.tone(880,.12,'sine',.08); AUDIO.tone(1320,.18,'sine',.07,.1); }, no(){ AUDIO.tone(220,.18,'square',.04); },
  // 끌기 : 누른 것에서 시작해 창 전체에서 따라간다 (손가락이 밖으로 나가도 이어진다)
  grab(el,{down,move,up}){ el.addEventListener('pointerdown',e=>{ if(TALK.on||down(e)===false) return; e.preventDefault(); const id=e.pointerId, mv=ev=>{ if(ev.pointerId===id) move(ev); }, en=ev=>{ if(ev.pointerId!==id) return; removeEventListener('pointermove',mv); removeEventListener('pointerup',en); removeEventListener('pointercancel',en); up&&up(ev); }; addEventListener('pointermove',mv); addEventListener('pointerup',en); addEventListener('pointercancel',en); }); },
  press(btn){ return new Promise(r=>btn.addEventListener('click',()=>{ AUDIO.click(); r(); },{once:true})); },
  // 밀대 : − [막대] + (누르고 있으면 이어서)
  dial(el,{min,max,step,val,on}){ el.innerHTML=`<button aria-label="줄이기">−</button><input type="range" min="${min}" max="${max}" step="${step}" value="${val}"><button aria-label="늘리기">+</button>`; const r=el.querySelector('input'), B=el.querySelectorAll('button'); let iv=0; const go=()=>on(+(+r.value).toFixed(3));
    r.addEventListener('input',()=>{ AUDIO.tick(); go(); }); B.forEach((b,i)=>{ const st=()=>{ if(!b.isConnected) return end(); r.value=+r.value+(i?step:-step); AUDIO.tick(); go(); }, end=()=>{ clearTimeout(iv); clearInterval(iv); iv=0; }; b.addEventListener('pointerdown',e=>{ e.preventDefault(); st(); iv=setTimeout(()=>iv=setInterval(st,70),380); }); ['pointerup','pointerleave','pointercancel'].forEach(n=>b.addEventListener(n,end)); }); go(); return r; },

  // 단답 (4.25) : 숫자 자판(− · 소수점 · 지우기) · PC 키보드도 · Enter = 기록 단추. 밀대처럼 밀어 보며 찍지 못하게
  ask(el,{unit='',go=null,on=null}={}){ let t=''; el.className='ask'; el.innerHTML=`<div class="ans"><b class="v"></b><span class="u">${unit}</span></div><div class="kp">${['1','2','3','4','5','6','7','8','9','0','.','−'].map(k=>`<button data-k="${k}">${k}</button>`).join('')}<button data-k="⌫" class="w">⌫</button></div>`;
    const v=el.querySelector('.v'), val=()=>!t||t==='−'||t==='.'?NaN:parseFloat(t.replace('−','-')), show=()=>{ v.textContent=t||'?'; on&&on(val()); },
      key=k=>{ AUDIO.tick(); if(k==='⌫') t=t.slice(0,-1); else if(k==='−') t=t.startsWith('−')?t.slice(1):'−'+t; else if(k==='.'){ if(!t.includes('.')) t+=t.replace('−','')?'.':'0.'; } else if(t.replace(/[−.]/g,'').length<5) t+=k; show(); };
    el.querySelectorAll('.kp button').forEach(b=>b.onclick=()=>key(b.dataset.k));
    const kb=e=>{ if(!el.isConnected) return removeEventListener('keydown',kb,true); if(TALK.on||e.ctrlKey||e.altKey||e.metaKey) return; if(e.key==='Enter'&&go){ e.preventDefault(); go.click(); return; } const k=/^[0-9.]$/.test(e.key)?e.key:e.key==='-'?'−':e.key==='Backspace'?'⌫':null; if(!k) return; e.preventDefault(); e.stopPropagation(); key(k); };
    addEventListener('keydown',kb,true); show(); return {get v(){ return val(); }, clear(){ t=''; show(); }}; },

  /* ============ ③ 촬영 ============ */
  makeBoard(){ const G=this.board=new THREE.Group(), W=.98, Hh=.56, c=.12, pts=[]; [[-1,-1],[1,-1],[1,1],[-1,1]].forEach(([a,b])=>{ const x=a*W,y=b*Hh; pts.push(new THREE.Vector3(x,y,0),new THREE.Vector3(x-a*c,y,0),new THREE.Vector3(x,y,0),new THREE.Vector3(x,y-b*c,0)); }); G.add(this.lines(pts,0x9fd8ff,.9));
    const gr=[]; for(let i=-4;i<=4;i++) gr.push(new THREE.Vector3(i*.22,-Hh+.03,-.02),new THREE.Vector3(i*.22,Hh-.03,-.02)); for(let j=-2;j<=2;j++) gr.push(new THREE.Vector3(-W+.03,j*.22,-.02),new THREE.Vector3(W-.03,j*.22,-.02)); G.add(this.lines(gr,0x6fb6e0,.12));
    const pane=new THREE.Mesh(new THREE.PlaneGeometry(W*2,Hh*2),new THREE.MeshBasicMaterial({color:this.lin(0x03090f),transparent:true,opacity:.8,depthTest:false,depthWrite:false,toneMapped:false,side:THREE.DoubleSide})); pane.position.z=-.03; pane.renderOrder=7; G.add(pane);
    this.S=this.STARS.map(d=>{ const [name,hex]=this.COL[d.c], o=new THREE.Group(), z=((d.n*37)%7-3)*.022; o.position.set(d.x,d.y,z); const hl=new THREE.Sprite(this.smat(hex,{opacity:.9})), core=new THREE.Sprite(this.smat(0xffffff,{opacity:.4})), tag=this.label('S-'+String(d.n).padStart(2,'0'),{size:44,h:.036,w:220,color:'#8fb9d6'}); tag.position.set(0,-.075,0); hl.renderOrder=9; core.renderOrder=10; o.add(hl,core,tag); G.add(o); return {d,o,hl,core,tag,name,hex,out:false,k:1,home:new THREE.Vector3(d.x,d.y,z)}; });
    this.paint(); return G; },
  // 그날의 밝기대로
  paint(){ for(const s of this.S){ const f=this.flux(s.d,this.day)*s.d.m, r=Math.sqrt(f)*s.k; s.hl.scale.setScalar(.17*r); s.core.scale.setScalar(.045*r); s.hl.material.opacity=Math.min(1,.6+.4*f)*(s.a??1)*(this.ba??1); s.core.material.opacity=Math.min(.6,.25+.2*f)*(s.a??1)*(this.ba??1); s.tag.material.opacity=(s.a??1)*(this.ba??1); } },
  async shoot(){ const {V,C}=this, hk=window.dragHook; S.phase='play'; P.free=false; window.dragHook=()=>{};
    await TALK.say([V('전파가 온 쪽을 촬영합니다. 빛을 내는 것은 모두 담깁니다.')]);
    const b=this.E.querySelector('.bot'); b.className='bot mid on'; b.innerHTML='<button class="go big">촬영</button>'; goal('[촬영]을 눌러 그쪽 하늘을 찍는다'); await this.press(b.querySelector('button')); goal(''); this.off('.bot');
    AUDIO.noise(.08,.25,0,3000); AUDIO.tone(1200,.05,'square',.05); FX.flash('#eaf6ff',500); await sleep(500); AUDIO.noise(.06,.2,0,2200);
    const G=this.makeBoard(); R1.g.add(G); G.position.set(0,1.1,.12); G.rotation.y=Math.PI; G.scale.setScalar(.62); G.visible=true; this.S.forEach(s=>s.a=0); this.ba=1; this.paint(); this.hum();
    // 노출 : 빛이 하나씩 맺힌다
    await Promise.all(this.S.map(async(s,i)=>{ await sleep(250+i*170); AUDIO.tone(900+i*60,.05,'sine',.03); await over(.9,e=>{ s.a=e; this.paint(); }); })); await sleep(400);
    await TALK.say([V('빛을 내는 것, 열셋. 1호는 이 가운데 하나의 곁에 있습니다.'),C('나머지는 지우면 된다. …그런데 밝기가 변하는 건 사진 한 장으로는 모르잖아.'),V('이 하늘은 1호가 먼저 지나갔습니다. 1호가 보내온 옛 관측 기록이 R-1 에 실려 있습니다.'),V('같은 하늘을 여러 날 찍은 기록이 있을 겁니다. 해치 방 기록 단말에서 찾아보십시오.')]);
    await this.show(G,false,.6); R1.g.remove(G); window.dragHook=hk; },      // 4.19 : 끌기를 돌려주지 않아, 캡슐 · 홀로그램까지 걸을 때 고개가 돌아가지 않았다
  // 기록 단말 (4.23 사용자 : 동면 대신 지난 기록을 찾아 데이터를 시각화) — 해치 방 후방 조종대 화면
  //   찾을 것 : 전파가 온 쪽(방위 244° · 고도 +15°)을 여러 날 찍은 기록 → 열세 빛의 밝기를 날짜별로 그린 표 → 로비 홀로그램
  ARC:[['G-3 행성 탐사 · 골디락스 존 후보','112° · +02°',1,'2090.05.30','planet'],['S-구역 하늘 탐사 · 시험 촬영','244° · +15°',1,'2090.06.01','one'],['S-구역 하늘 탐사','244° · +15°',17,'2090.06.02 ~ 06.18','ok'],
    ['N-구역 하늘 탐사','061° · −20°',17,'2090.07.04 ~ 07.20','dir'],['웜홀 쪽 하늘 (우리 은하)','015° · +40°',9,'2090.04.11 ~ 04.19','dir'],['선체 외부 점검 사진','—',24,'2090.06.20','hull']],
  async records(){ const {V,C}=this, {head}=this.J; this.E.classList.remove('on'); this.dim(1,1.2); R1.view='…별 몇 개. 그 사이는 그냥 어둠이다.'; R1.viewDir=null; await R1.stand(head);
    const pk=R1._picks[Object.keys(R1.BOX).indexOf('aft')], it=INTER.find(i=>i.mesh===pk), n0=it&&it.name; if(it) it.name='기록 단말 — 1호의 옛 관측 기록';
    await R1.task('aft','해치 방(맨 뒤) 기록 단말 — 1호의 옛 관측 기록을 찾는다'); if(it) it.name=n0;
    S.phase='cut'; P.free=false; goal(''); await camTo({x:.62,z:-10.62,yaw:-Math.PI/2,pitch:-.12,eye:1.5},.8); AUDIO.tone(660,.1,'square',.04); AUDIO.noise(.3,.06,0,2400);
    stamp('구조정 R-1 · NGC 3500 가장자리','2091.07.21 · 1호의 옛 기록'); this.E.classList.add('on'); this.frags();
    const rows=this.ARC.map((r,i)=>`<tr data-i="${i}"><td>${r[0]}</td><td>${r[1]}</td><td>${r[2]}장</td><td>${r[3]}</td></tr>`).join('');
    const s=this.side(`<p class="hd">HUY-1 관측 기록 보관소</p><p class="want">전파가 온 쪽 : 방위 <b>244°</b> · 고도 <b>+15°</b></p><table class="arc"><tr><th>기록</th><th>방향 (방위 · 고도)</th><th>장수</th><th>날짜</th></tr>${rows}</table><canvas class="hm" width="1120" height="360"></canvas><div class="row"><p class="msg">기록을 누르면 미리 본다</p><button class="go" disabled>이 기록을 불러온다</button></div>`,'arcv');
    const cv=s.querySelector('.hm'), g=cv.getContext('2d'), msg=s.querySelector('.msg'), go=s.querySelector('.go'); let sel=-1, miss=0;
    // 밝기 표 : 줄 = 빛 열셋 · 칸 = 날짜 (밝을수록 노랗게) — 미리 보기는 흐리게
    const heat=(kind,full)=>{ g.clearRect(0,0,1120,360); if(kind==='hull'||kind==='planet'){ g.fillStyle='rgba(191,230,255,.5)'; g.font='28px "IBM Plex Sans KR",sans-serif'; g.textAlign='center'; g.fillText(kind==='hull'?'선체 사진 — 별이 없다':'행성 한 장 — 이 하늘이 아니다',560,190); return; }
      const days=kind==='one'?1:17, rnd=kind==='dir'?(i=>Math.abs(Math.sin(i*91.7))):null, X0=120, W=(1120-X0-20)/17, H=360/14;
      g.font='18px "IBM Plex Mono",monospace'; g.textAlign='right'; g.fillStyle='rgba(191,230,255,.7)'; for(let r=0;r<13;r++) g.fillText(kind!=='dir'?'S-'+String(r+1).padStart(2,'0'):'?',X0-12,(r+1)*H+6);
      for(let r=0;r<13;r++) for(let d=0;d<days;d++){ const st=this.STARS[r], f=kind!=='dir'?this.flux(st,d)*st.m:.6+.5*rnd(r*31+d*7), k=clamp((f-.35)/1.3,0,1); g.fillStyle=`rgba(${Math.round(60+195*k)},${Math.round(70+150*k)},${Math.round(90-40*k)},${full?1:.55})`; g.fillRect(X0+d*W+1,r*H+H*.5+1,W-2,H-2); }
      g.textAlign='center'; g.fillStyle='rgba(191,230,255,.6)'; for(let d=0;d<days;d+=4) g.fillText((d+1)+'일',X0+d*W+W/2,356); };
    s.querySelectorAll('tr[data-i]').forEach(tr=>tr.onclick=()=>{ if(TALK.on) return; AUDIO.tick(); sel=+tr.dataset.i; s.querySelectorAll('tr').forEach(t=>t.classList.toggle('sel',t===tr)); heat(this.ARC[sel][4],false); go.disabled=false; msg.textContent=this.ARC[sel][0]; });
    goal('1호의 옛 기록에서 — 전파가 온 쪽을 여러 날 찍은 기록을 찾는다');
    await new Promise(res=>{ go.onclick=async()=>{ if(TALK.on||sel<0) return; const k=this.ARC[sel][4]; AUDIO.click();
      if(k==='ok'){ this.ok(); heat('ok',true); s.classList.add('good'); msg.textContent='열세 빛의 밝기 — 날짜별로'; go.disabled=true; res(); return; }
      this.no(); miss++; msg.textContent=k==='one'?'한 장뿐이다 — 밝기가 변하는지 알려면 여러 날 찍은 기록이어야 한다':k==='dir'?'방향이 다르다 — 전파는 방위 244° · 고도 +15° 에서 왔다':k==='hull'?'하늘 사진이 아니다':'이 하늘이 아니다 — 방향을 보자'; }; });
    goal(''); await sleep(900);
    await TALK.say([V('S-구역 하늘 탐사, 1호가 하루 한 장씩 열이레 동안 찍었습니다. 빛을 내는 것 열셋의 밝기를 날짜별로 그렸습니다.'),C('줄마다 색이 그대로인 것도 있고, 밝아졌다 어두워졌다 하는 것도 있다.'),V('로비 홀로그램에 열이레 치를 띄우겠습니다.')]);
    this.off('.side'); },

  /* ============ ④ 지우기 (로비의 홀로그램) ============ */
  HZ:-5.75, EYE:{x:0,z:-7.5,yaw:Math.PI,pitch:-.03,eye:1.5},
  // 판이 다 보이는 자리 : 세로 화면이면 물러선다 · 보는 동안 화면을 돌리면 다시 맞춘다 (4.19)
  fitEye(){ this.EYE.z=Math.max(-8.6,this.HZ-Math.max(1.75,1.08/(Math.tan(THREE.MathUtils.degToRad(camera.fov/2))*camera.aspect))); },
  async hologram(){ this.fitEye(); this.atHolo=false; if(!this._rs){ this._rs=()=>setTimeout(()=>{ if(!this.atHolo) return; this.fitEye(); if(!camAnim) camTo({...this.EYE},.5); },120); addEventListener('resize',this._rs); }
    const G=this.makeBoard(); this.J.head.y=0; R1.g.add(G); G.position.set(0,1.56,this.HZ); G.rotation.y=Math.PI; this.ba=1; this.S.forEach(s=>s.a=1);
    // 바닥의 투영 장치 : 원판 · 빛기둥
    const base=this.base=new THREE.Group(); R1.g.add(base); base.position.set(0,0,this.HZ); const ring=new THREE.Mesh(new THREE.CylinderGeometry(.2,.24,.05,28),new THREE.MeshStandardMaterial({color:0x22282e,roughness:.6,metalness:.2})), lens=new THREE.Mesh(new THREE.CircleGeometry(.15,28),new THREE.MeshBasicMaterial({color:0x9fe0ff,toneMapped:false})); ring.position.y=.025; lens.rotation.x=-Math.PI/2; lens.position.y=.053; base.add(ring,lens);
    const cone=new THREE.Mesh(new THREE.CylinderGeometry(.85,.13,1.02,32,1,true),new THREE.ShaderMaterial({transparent:true,depthWrite:false,side:THREE.DoubleSide,blending:THREE.AdditiveBlending,uniforms:{k:{value:1}},vertexShader:'varying float y; void main(){ y=uv.y; gl_Position=projectionMatrix*modelViewMatrix*vec4(position,1.0); }',fragmentShader:'uniform float k; varying float y; void main(){ gl_FragColor=vec4(vec3(.35,.7,.95)*(1.0-y)*(1.0-y)*.3*k,1.0); }'})); cone.position.y=.55; base.add(cone);
    const pl=new THREE.PointLight(0x7fd4ff,.34,3.4,1.8); pl.userData.holo=true; pl.position.set(0,1.5,-.3); base.add(pl);
    JOURNEY.tick(()=>{ if(!G.parent) return; G.rotation.y=Math.PI+Math.sin(S.t*.32)*.045; G.position.y=1.56+Math.sin(S.t*.6)*.006; pl.intensity=.34+.04*Math.sin(S.t*11); });
    await camTo({yaw:Math.PI,pitch:-.04},1.1); goal('로비의 홀로그램 앞으로'); P.free=true; S.phase='play'; await until(()=>Math.abs(P.x)<1.1&&Math.abs(P.z-this.EYE.z)<.55);
    goal(''); S.phase='cut'; P.free=false; await camTo({...this.EYE},1); this.hum(); this.dim(.12,1); S.phase='play'; window.dragHook=()=>{}; this.atHolo=true; },
  // 판 위의 좌표 (화면 → 홀로그램 판)
  pt(e){ const rc=new THREE.Raycaster(); rc.setFromCamera(new THREE.Vector2(e.clientX/innerWidth*2-1,-(e.clientY/innerHeight)*2+1),camera); const G=this.board; G.updateWorldMatrix(true,false); const n=new THREE.Vector3(0,0,1).transformDirection(G.matrixWorld), o=G.getWorldPosition(new THREE.Vector3()), h=rc.ray.intersectPlane(new THREE.Plane().setFromNormalAndCoplanarPoint(n,o),new THREE.Vector3()); return h?G.worldToLocal(h):null; },
  scr(o){ const v=o.getWorldPosition(new THREE.Vector3()).project(camera); return [(v.x+1)/2*innerWidth,(1-v.y)/2*innerHeight]; },
  async erase(){ const {V,C}=this, E=this.E, el=$('#c'), bot=E.querySelector('.bot'), chip=E.querySelector('.chip');
    await TALK.say([V('1호가 찍은 열이레 치입니다. 아래 막대를 밀면 날짜가 흐릅니다.'),C('기록 조각 2 — 밝아졌다, 어두워졌다. 먼저 밝기가 변하는 별만 남기자.')]);
    let phase=1; const VAR=[4,8,9,11], ID=n=>'S-'+String(n).padStart(2,'0');
    goal('1단계 — 밝기가 변하는 별(변광성)만 남긴다 · 날짜를 넘기며 밝기가 그대로인 별을 지운다 (누르거나 판 밖으로 끌어낸다)');
    bot.className='bot on'; bot.innerHTML='<button class="play" aria-label="재생">▶</button><input class="tl" type="range" min="0" max="16" step="0.05" value="0"><b class="d">1일째</b><span class="n"></span><button class="go">변광성만 남겼다</button>';
    const tl=bot.querySelector('.tl'), dl=bot.querySelector('.d'), nn=bot.querySelector('.n'), go=bot.querySelector('.go'), pb=bot.querySelector('.play'); let playing=false, sel=null, drag=null, done=false, miss=0;
    const setDay=d=>{ this.day=d; tl.value=d; dl.textContent=(Math.floor(d)+1)+'일째'; this.paint(); }; tl.addEventListener('input',()=>{ playing=false; pb.textContent='▶'; setDay(+tl.value); }); pb.onclick=()=>{ AUDIO.click(); playing=!playing; pb.textContent=playing?'❚❚':'▶'; if(playing&&this.day>=16) setDay(0); };
    const left=()=>this.S.filter(s=>!s.out), upd=()=>{ const n=left().length; nn.textContent='남은 별 '+n; go.disabled=n<1; }; upd(); setDay(0);
    const drop=(s,dir)=>{ s.out=true; AUDIO.noise(.25,.08,0,2600,'highpass'); AUDIO.tone(520,.2,'sine',.04,0,-300); const p0=s.o.position.clone(), v=dir||new THREE.Vector3((Math.random()-.5)*.2,.1,0); over(.5,e=>{ s.o.position.copy(p0).addScaledVector(v,e); s.a=1-e*.76; s.k=1-e*.6; this.paint(); }).then(()=>{ over(.4,e=>{ s.o.position.lerpVectors(s.o.position,s.home,e); }); s.tag.material.color.set(0x556070); }); sel=null; chip.classList.remove('on'); upd(); };
    const back=s=>{ s.out=false; AUDIO.tone(520,.15,'sine',.05,0,260); s.tag.material.color.set(0xffffff); over(.4,e=>{ s.a=.24+.76*e; s.k=.4+.6*e; this.paint(); }); upd(); };
    const pick=s=>{ sel=s; chip.className='chip on'; chip.innerHTML=`<p><i style="background:${s.hex}"></i>S-${String(s.d.n).padStart(2,'0')} · ${s.name}</p><button>${s.out?'되살린다':'지운다'}</button>`; chip.querySelector('button').onclick=()=>{ s.out?back(s):drop(s); sel=null; chip.classList.remove('on'); }; };
    const find=e=>{ let best=null, bd=46; for(const s of this.S){ const [x,y]=this.scr(s.o), d=Math.hypot(x-e.clientX,y-e.clientY); if(d<bd){ bd=d; best=s; } } return best; };
    const down=e=>{ if(TALK.on||done) return; const s=find(e); drag=s?{s,x:e.clientX,y:e.clientY,mv:false}:null; if(!s){ sel=null; chip.classList.remove('on'); } }, move=e=>{ if(!drag||drag.s.out) return; if(!drag.mv&&Math.hypot(e.clientX-drag.x,e.clientY-drag.y)<14) return; drag.mv=true; sel=null; chip.classList.remove('on'); const p=this.pt(e); if(p) drag.s.o.position.set(clamp(p.x,-1.35,1.35),clamp(p.y,-.85,.85),drag.s.home.z); },
      upx=()=>{ if(!drag) return; const {s,mv}=drag; drag=null; if(!mv) return pick(s); const p=s.o.position, far=Math.abs(p.x)>.92||Math.abs(p.y)>.5; if(far) drop(s,p.clone().sub(s.home).setLength(.35)); else { const p0=p.clone(); over(.3,e=>s.o.position.lerpVectors(p0,s.home,e)); } };
    el.addEventListener('pointerdown',down); addEventListener('pointermove',move); addEventListener('pointerup',upx); addEventListener('pointercancel',upx);
    const f=dt=>{ if(playing){ const d=this.day+dt*2.2; if(d>=16){ playing=false; pb.textContent='▶'; setDay(16); } else setDay(d); } if(sel){ const [x,y]=this.scr(sel.o); chip.style.transform=`translate(${clamp(x+26,8,innerWidth-220)}px,${clamp(y-30,60,innerHeight-220)}px)`; } }; TICK.push(f);
    let miss2=0; await new Promise(res=>{ go.onclick=async()=>{ if(done||TALK.on) return; const L=left().map(s=>s.d.n), NM=n=>this.S.find(s=>s.d.n===n).name; AUDIO.click();
        if(phase===1){ const keep=L.filter(n=>!VAR.includes(n)), lost=VAR.filter(n=>!L.includes(n));
          if(!keep.length&&!lost.length){ phase=2; this.ok(); go.textContent='이 별을 쫓는다'; await TALK.say([V('변광성 넷 — S-04, S-08, S-09, S-11.'),C('기록 조각 1 — 창밖의 별, 표면 온도 5,500 K.'),V('이 가운데 그 표면 온도인 별 하나만 남기십시오.')]); goal('2단계 — 변광성 가운데 표면 온도 5,500 K 인 별 하나만 남긴다 (별을 누르면 색이 보인다)'); upd(); return; }
          this.no(); miss++; const Ls=[]; if(lost.length) Ls.push(V(`${ID(lost[0])} 는 밝기가 변하는 별입니다. 다시 눌러 되살리십시오.`)); if(keep.length) Ls.push(V(`${ID(keep[0])} 의 밝기는 열이레 동안 그대로였습니다.`+(keep.length>1?` 그런 별이 ${keep.length}개 남아 있습니다.`:''))); if(miss>=2) Ls.push(V('막대를 천천히 밀며 별 하나만 지켜보십시오. 커졌다 작아졌다 하면 변광성입니다.')); await TALK.say(Ls); return; }
        if(L.length===1&&L[0]===this.TARGET){ done=true; this.ok(); res(); return; }
        this.no(); miss2++; const Ls=[], wrongC=L.filter(n=>this.S.find(s=>s.d.n===n).d.c!=='y'), still=L.filter(n=>!VAR.includes(n));
        if(still.length) Ls.push(V(`${ID(still[0])} 는 밝기가 변하지 않는 별입니다.`)); else if(!L.includes(this.TARGET)) Ls.push(V('남은 별 가운데 표면 온도 5,500 K 인 별이 없습니다. 지운 변광성을 되살려 보십시오.')); else if(wrongC.length) Ls.push(V(`${ID(wrongC[0])}, ${NM(wrongC[0])}. 표면 온도 5,500 K 인 별의 색이 아닙니다.`));
        Ls.push(miss2<2?V('하나만 남기십시오.'):V('표면 온도가 높은 별은 파랗고, 낮은 별은 붉습니다. 5,500 K 는 태양과 비슷합니다.')); await TALK.say(Ls); }; });
    TICK.splice(TICK.indexOf(f),1); el.removeEventListener('pointerdown',down); removeEventListener('pointermove',move); removeEventListener('pointerup',upx); removeEventListener('pointercancel',upx); chip.classList.remove('on'); this.off('.bot'); goal('');
    this.E.querySelector('.rec').classList.remove('on');
    // 남은 하나 : 판 가운데로 커진다
    const T=this.T=this.S.find(s=>s.d.n===this.TARGET); this.S.forEach(s=>{ if(s!==T) over(.6,e=>{ s.a=Math.min(s.a,.24*(1-e)); }); }); const p0=T.o.position.clone(); this.live=true; await over(1.4,e=>{ T.o.position.lerpVectors(p0,new THREE.Vector3(-.6,.12,.05),e); T.k=1+e*1.9; this.paint(); }); T.tag.position.y=-.25; T.tag.scale.multiplyScalar(1.5);
    // 이제부터 별은 제 빠르기로 밝아졌다 어두워졌다 한다 (하루 = 0.6 초)
    JOURNEY.tick(dt=>{ if(this.live){ this.day=(this.day+dt*1.6)%800; this.paint(); } });
    await TALK.say([C('S-09. 노란 별. 그리고 밝기가 변한다.'),V('조각의 기록과 모두 일치합니다. 1호는 이 별 곁에 있습니다.'),C('방향은 안다. 이제 거리만 알면 돼.'),V('너무 멀어 시차로는 잴 수 없습니다.'),C('그럼 밝기로 재자. 실제로 얼마나 밝은 별인지 — 절대 등급을 알면, 겉보기 등급과 견줘서 거리를 알 수 있어.'),V('이 별의 절대 등급은 어떤 목록에도 없습니다.'),C('…이 별은 밝기가 변하지. 거기에 뭔가 있을 거야.')]); },

  /* ============ ⑤ 절대 등급 : 주기 재기 → 규칙 찾기 ============ */
  curve(g,W,H,{P,t0,days,x0=0,x1=W,y0=8,y1=H-8,color='#ffd02a',dots=false}){ g.lineWidth=2.4; g.strokeStyle=color; g.beginPath(); const n=Math.max(140,days*8); for(let i=0;i<=n;i++){ const d=i/n*days, x=x0+(x1-x0)*i/n, y=y1-(y1-y0)*this.wave(d,P,t0); i?g.lineTo(x,y):g.moveTo(x,y); } g.stroke();
    if(dots){ g.fillStyle='#fff'; for(let d=0;d<=days;d++){ g.beginPath(); g.arc(x0+(x1-x0)*d/days,y1-(y1-y0)*this.wave(d,P,t0),4.4,0,7); g.fill(); } } },
  async absolute(){ const {V,C}=this;
    const s=this.side('<p class="hd">S-09 · 열이레 동안의 밝기</p><canvas class="lc" width="1120" height="420"></canvas><div class="row"><p class="read">두 막대 사이 <b>0.0</b>일</p><button class="go">주기로 기록</button></div><p class="msg">두 막대를 끌어, 밝기가 <b>한 번 되풀이되는 데 걸리는 날수</b>를 재자</p>','curve');
    const cv=s.querySelector('canvas'), g=cv.getContext('2d'), W=1120, H=420, X0=92, X1=W-96, Y0=44, Y1=H-70, D=16, x=d=>X0+(X1-X0)*d/D, rd=s.querySelector('.read b'), msg=s.querySelector('.msg'), bar=[1,6]; let dr=-1;
    const draw=()=>{ g.clearRect(0,0,W,H); g.font='24px "IBM Plex Mono","IBM Plex Sans KR",monospace'; g.textAlign='center'; g.fillStyle='rgba(191,230,255,.75)'; g.strokeStyle='rgba(159,216,255,.16)'; g.lineWidth=1.5; for(let d=0;d<=D;d++){ g.beginPath(); g.moveTo(x(d),Y0-14); g.lineTo(x(d),Y1+14); g.stroke(); if(d%2===0) g.fillText(d+1,x(d),Y1+44); } g.textAlign='left'; g.fillText('일째',X1+24,Y1+44); g.fillText('밝음',6,Y0+10); g.fillText('어두움',6,Y1+4);
      this.curve(g,W,H,{P:this.PERIOD,t0:3,days:D,x0:X0,x1:X1,y0:Y0,y1:Y1,dots:true});
      const [a,b]=[Math.min(...bar),Math.max(...bar)]; g.fillStyle='rgba(255,90,54,.1)'; g.fillRect(x(a),Y0-14,x(b)-x(a),Y1-Y0+28); bar.forEach(d=>{ g.strokeStyle='#ff5a36'; g.lineWidth=4; g.beginPath(); g.moveTo(x(d),Y0-24); g.lineTo(x(d),Y1+14); g.stroke(); g.fillStyle='#ff5a36'; g.beginPath(); g.arc(x(d),Y0-24,15,0,7); g.fill(); }); rd.textContent=(b-a).toFixed(1); };
    const dayAt=e=>{ const r=cv.getBoundingClientRect(); return clamp(((e.clientX-r.left)/r.width*W-X0)/(X1-X0)*D,0,D); }; draw();
    this.grab(cv,{down:e=>{ const d=dayAt(e); dr=Math.abs(d-bar[0])<=Math.abs(d-bar[1])?0:1; bar[dr]=d; draw(); },move:e=>{ let d=dayAt(e); const n=Math.round(d*2)/2; if(Math.abs(n-d)<.14) d=n; bar[dr]=d; draw(); }});
    goal('S-09 의 밝기가 되풀이되는 주기를 잰다'); let miss=0;
    await new Promise(res=>{ s.querySelector('.go').onclick=()=>{ if(TALK.on) return; const d=Math.abs(bar[0]-bar[1]); if(Math.abs(d-this.PERIOD)<=.35){ this.ok(); msg.textContent='주기 8일 — 기록했다'; s.classList.add('good'); setTimeout(res,1100); } else { this.no(); miss++; msg.textContent=miss<2?d.toFixed(1)+'일 뒤에는 밝기가 처음과 다르다 — 다시 재자':'가장 밝은 날에서 다음 가장 밝은 날까지 재 보자'; } }; });
    this.off('.side'); goal('');
    await TALK.say([V('S-09. 주기 8일.'),V('우리은하의 기록에서 같은 종류의 별 다섯을 찾았습니다. 가까이 있어, 절대 등급을 이미 아는 별들입니다.'),C('규칙이 있는지 보자. 무엇이 변할 때 절대 등급이 따라 변하는지.')]);
    // 카드 여섯 : 끌어서 순서를 바꾼다
    const order=this.CARDS.map((_,i)=>i), q=this.side('<p class="hd">같은 종류의 별 — 절대 등급은 무엇을 따라 변하는가</p><div class="cards"></div><p class="msg">카드를 끌어 순서를 바꿔 가며 견줘 보자</p><div class="dialrow"><p class="lb">S-09 의 절대 등급</p><div class="ask"></div><button class="go">기록</button></div>','rule');
    const box=q.querySelector('.cards'), els=this.CARDS.map((c,i)=>{ const d=document.createElement('div'); d.className='card'+(c.M===null?' tgt':''); d.innerHTML=`<p class="nm">${c.M===null?'S-09':'별 '+c.k}</p><canvas width="220" height="86"></canvas><dl><dt>주기</dt><dd>${c.P}일</dd><dt>표면 온도</dt><dd>${c.T}</dd><dt>겉보기 등급</dt><dd>${c.m===null?'—':c.m.toFixed(1)}</dd><dt class="ab">절대 등급</dt><dd class="ab">${c.M===null?'?':this.N(c.M)}</dd></dl>`; box.appendChild(d); const k=d.querySelector('canvas'), gg=k.getContext('2d'); this.curve(gg,220,86,{P:c.P,t0:c.P*.3,days:32,color:c.M===null?'#ffd02a':'#9fd8ff'}); return d; });
    const N=els.length, place=skip=>{ const w=box.clientWidth/N; order.forEach((ci,pos)=>{ if(ci===skip) return; els[ci].style.transform=`translateX(${pos*w}px)`; els[ci].style.width=(w-8)+'px'; }); }; place(); requestAnimationFrame(()=>place()); const rs=()=>place(); addEventListener('resize',rs);
    els.forEach((d,ci)=>{ let x0=0, p0=0; this.grab(d,{down:e=>{ x0=e.clientX; p0=order.indexOf(ci)*box.clientWidth/N; d.classList.add('drag'); },move:e=>{ const w=box.clientWidth/N, nx=clamp(p0+e.clientX-x0,0,w*(N-1)); d.style.transform=`translateX(${nx}px)`; const to=Math.round(nx/w), at=order.indexOf(ci); if(to!==at){ order.splice(at,1); order.splice(to,0,ci); AUDIO.tick(); place(ci); } },up:()=>{ d.classList.remove('drag'); place(); }}); });
    const m2=q.querySelector('.msg'), A=this.ask(q.querySelector('.ask'),{unit:'등급',go:q.querySelector('.go')});
    goal('규칙을 찾아 S-09 의 절대 등급을 알아낸다'); miss=0;
    await new Promise(res=>{ q.querySelector('.go').onclick=()=>{ if(TALK.on) return; const v=A.v; if(isNaN(v)){ m2.textContent='숫자를 넣자 (자판의 − 는 음수)'; return; } if(Math.abs(v-this.ABS)<.051){ this.ok(); els[3].querySelector('dd.ab').textContent=this.N(this.ABS); q.classList.add('good'); m2.textContent='절대 등급 '+this.N(this.ABS)+' — 규칙에 꼭 맞는다'; order.sort((a,b)=>this.CARDS[a].P-this.CARDS[b].P); place(); setTimeout(res,2600); }
      else { this.no(); miss++; A.clear(); m2.textContent=miss<2?this.N(v)+' 이면 규칙에서 벗어난다':miss<4?'주기가 짧은 것부터 늘어놓고, 절대 등급이 얼마씩 달라지는지 보자':'주기가 두 배가 될 때마다 절대 등급은 얼마씩 작아지는가?'; } }; });
    removeEventListener('resize',rs); this.off('.side'); goal('');
    await TALK.say([C('주기가 두 배가 될 때마다 절대 등급이 0.7씩 작아진다. 천천히 숨 쉬는 별일수록 실제로 더 밝아.'),V('S-09 의 절대 등급, '+this.N(this.ABS)+'.'),V('헨리에타 리비트가 1912년에 찾아낸 규칙입니다.'),C('이제 이 별이 여기서 얼마나 밝게 보이는지만 재면 된다.')]); },

  /* ============ ⑥ 겉보기 등급 : 광도계 ============ */
  async apparent(){ const {V,C}=this;
    await TALK.say([V('S-09 는 8일마다 밝아졌다 어두워졌다 합니다. 이런 별의 겉보기 등급은 가장 밝을 때와 가장 어두울 때 등급의 평균으로 씁니다.'),V('1호의 기록에 따르면 가장 밝을 때 −2.0 등급. 그리고 가장 밝을 때는 가장 어두울 때보다 밝기가 100배입니다.'),C('그럼 가장 어두울 때는 몇 등급이지.')]);
    const s=this.side('<p class="hd">S-09 의 겉보기 등급 — 평균 밝기를 등급으로</p><canvas width="1120" height="330"></canvas><p class="note">기록 : 가장 밝을 때 <b>−2.0 등급</b> · 가장 밝을 때의 밝기 = 가장 어두울 때의 <b>100배</b></p><div class="dialrow"><p class="lb q"></p><div class="ask"></div><button class="go">기록</button></div><p class="msg">등급이 작을수록 밝다</p>','mag');
    const cv=s.querySelector('canvas'), g=cv.getContext('2d'), W=1120, H=330, X0=60, X1=W-250, Y0=50, Y1=H-46, msg=s.querySelector('.msg'), q=s.querySelector('.q'), go=s.querySelector('.go'), A=this.ask(s.querySelector('.ask'),{unit:'등급',go});
    const draw=(lo,avg)=>{ g.clearRect(0,0,W,H); this.curve(g,W,H,{P:this.PERIOD,t0:3,days:24,x0:X0,x1:X1,y0:Y0,y1:Y1});
      const ln=(y,c,dash,t)=>{ g.setLineDash(dash); g.strokeStyle=c; g.lineWidth=2.5; g.beginPath(); g.moveTo(X0,y); g.lineTo(X1+14,y); g.stroke(); g.setLineDash([]); g.fillStyle=c; g.font='500 27px "IBM Plex Sans KR",sans-serif'; g.textAlign='left'; g.fillText(t,X1+26,y+9); };
      ln(Y0,'#ffe9a8',[10,8],'가장 밝을 때 −2.0'); ln(Y1,'#9fd8ff',[10,8],'가장 어두울 때 '+(lo===undefined?'?':this.N(lo))); if(avg!==undefined) ln((Y0+Y1)/2,'#6dffb0',[],'평균 '+this.N(avg)); };
    draw(); let miss=0;
    // ① 가장 어두울 때
    q.textContent='가장 어두울 때의 등급'; goal('S-09 가 가장 어두울 때의 등급을 구한다');
    await new Promise(res=>{ go.onclick=()=>{ if(TALK.on) return; const v=A.v; if(isNaN(v)) return; if(Math.abs(v-this.MIN)<.051){ this.ok(); draw(this.MIN); msg.textContent='밝기 100배 = 5등급 차이 — 가장 어두울 때 '+this.N(this.MIN)+' 등급'; A.clear(); res(); return; }
      this.no(); miss++; A.clear(); msg.textContent=v<this.MAX?'등급이 작을수록 밝다 — 어두울 때는 −2.0 보다 큰 수':miss<2?this.N(v)+' 등급이면 밝기 차이가 100배가 아니다':'1등급 차이 ≈ 2.5배 · 5등급 차이 = 정확히 100배'; }; });
    await sleep(900);
    // ② 평균
    q.textContent='평균 등급 (겉보기 등급)'; msg.textContent='가장 밝을 때와 가장 어두울 때 등급의 평균'; goal('두 등급의 평균 — S-09 의 겉보기 등급을 구한다'); miss=0;
    await new Promise(res=>{ go.onclick=()=>{ if(TALK.on) return; const v=A.v; if(isNaN(v)) return; if(Math.abs(v-this.APP)<.051){ this.ok(); draw(this.MIN,this.APP); s.classList.add('good'); msg.textContent='겉보기 등급 '+this.N(this.APP); setTimeout(res,1700); return; }
      this.no(); miss++; A.clear(); msg.textContent=miss<2?this.N(v)+' 은 평균이 아니다':'(−2.0 + 3.0) ÷ 2'; }; });
    this.off('.side'); goal(''); await TALK.say([V('S-09 의 겉보기 등급, '+this.N(this.APP)+'.'),C('겉보기 등급 '+this.N(this.APP)+'. 절대 등급 '+this.N(this.ABS)+'.'),C('절대 등급은 별을 10 pc 에 놓았다고 쳤을 때의 등급. …실제로는 그보다 어둡게 보인다. 10 pc 보다 멀다는 뜻이지.')]); },

  /* ============ ⑦ 거리 ============ */
  async distance(){ const {V,C}=this;
    const s=this.side(`<p class="hd">S-09 까지의 거리</p><div class="two"><p>겉보기 등급<b>${this.N(this.APP)}</b><small>여기서 본 등급</small></p><p>절대 등급<b>${this.N(this.ABS)}</b><small>10 pc 에서 본 등급</small></p></div><canvas width="1120" height="400"></canvas><div class="dialrow"><p class="lb">거리는 10 pc 의</p><div class="ask"></div><button class="go">시험 신호</button></div><p class="msg">거리를 정해 시험 신호를 쏘아 보자</p>`,'dist');
    const cv=s.querySelector('canvas'), g=cv.getContext('2d'), val=s.querySelector('.val'), msg=s.querySelector('.msg'); let n=1, miss=0, ping=0;
    // 별빛은 거리의 제곱으로 퍼진다 : 10 pc 에서 한 칸이던 빛이 n 배 거리에서는 n×n 칸
    const draw=()=>{ const W=1120,H=400, sx=58, sy=184, K=44, X=k=>sx+K*k, hh=k=>7.6*k, xn=X(n), face=(x,h,k,c)=>{ const D=h*.5, P=(u,v)=>[x+u*D*.5,sy+v*h-u*h*.3]; g.strokeStyle=c; g.lineWidth=k>9?1.2:2; g.beginPath(); for(let i=0;i<=k;i++){ const t=-1+2*i/k; g.moveTo(...P(t,-1)); g.lineTo(...P(t,1)); g.moveTo(...P(-1,t)); g.lineTo(...P(1,t)); } g.stroke(); };
      g.clearRect(0,0,W,H); g.fillStyle='rgba(255,208,42,.1)'; g.strokeStyle='rgba(255,208,42,.5)'; g.lineWidth=2; g.beginPath(); g.moveTo(sx,sy); g.lineTo(xn,sy-hh(n)); g.lineTo(xn,sy+hh(n)); g.closePath(); g.fill(); g.stroke();
      const r=g.createRadialGradient(sx,sy,2,sx,sy,40); r.addColorStop(0,'#fff6c8'); r.addColorStop(.3,'#ffd02a'); r.addColorStop(1,'rgba(255,208,42,0)'); g.fillStyle=r; g.fillRect(sx-40,sy-40,80,80);
      face(X(1),hh(1),1,'#bfe6ff'); if(n>1) face(xn,hh(n),n,'#ffd02a');
      g.fillStyle='#bfe6ff'; g.font='26px "IBM Plex Sans KR",sans-serif'; g.textAlign='left'; g.fillText(n===1?'10 pc':n*10+' pc',Math.min(xn+hh(n)*.3+18,W-140),sy+9); if(n>3){ g.textAlign='center'; g.fillText('10 pc',X(1)+4,sy+64); }
      g.textAlign='center'; g.fillStyle='#ffe9a8'; g.font='500 30px "IBM Plex Sans KR",sans-serif'; g.fillText(n>1?'빛이 '+n+' × '+n+' 칸으로 퍼진다  →  밝기 1 / '+n*n:'10 pc 에서 본 밝기 = 1',W/2,H-10);
      if(ping>0){ g.strokeStyle='rgba(159,216,255,'+(1-ping)+')'; g.lineWidth=5; g.beginPath(); g.arc(xn,sy,20+ping*120,0,7); g.stroke(); } };
    const A=this.ask(s.querySelector('.ask'),{unit:'배',go:s.querySelector('.go'),on:x=>{ n=Number.isInteger(x)&&x>=1&&x<=20?x:1; draw(); }}); goal('겉보기 등급과 절대 등급을 견줘 거리를 알아낸다'); const R=k=>k>=10?Math.round(k):k.toFixed(1);
    await new Promise(res=>{ let busyP=false; s.querySelector('.go').onclick=async()=>{ if(TALK.on||busyP) return; const a=A.v; if(!(a>=1)||!Number.isInteger(a)){ msg.textContent='1 보다 큰 자연수를 넣자'; return; } n=a; busyP=true; AUDIO.tone(1400,.2,'sine',.06); msg.textContent='신호를 보냈다…'; await over(1.1,(e,k)=>{ ping=k; draw(); }); ping=0; draw(); busyP=false; const r=100/(n*n);
        if(n===this.MULT){ this.ok(); s.classList.add('good'); AUDIO.radio(1.6); msg.textContent='되돌아왔다 — 100 pc. S-09 는 거기 있다'; setTimeout(res,2400); return; }
        this.no(); miss++; msg.textContent=(r>1?`빈 공간이다. ${n*10} pc 라면 별이 지금보다 ${R(r)}배 밝게 보여야 한다`:`빈 공간이다. ${n*10} pc 라면 별이 지금보다 ${R(1/r)}배 어둡게 보여야 한다`)+(miss>=2?' · 5등급 차이는 밝기 100배':''); A.clear(); }; });
    this.off('.side'); goal(''); await TALK.say([C('등급 차이 5. 밝기로는 100배. 빛은 거리의 제곱으로 퍼지니까, 10배 멀다. 10 pc 의 10배 — 100 pc.'),V('시험 신호가 되돌아왔습니다. 100 pc. 1호의 전파와 같은 자리입니다.'),C('…찾았다.'),
      C('그런데 100 pc 면 빛으로도 326년이야. 1호가 거기까지 어떻게 갔지?'),V('제 힘으로 간 것이 아닙니다. 웜홀이 열릴 때 이 은하의 시공간에도 주름이 잡혔습니다. 1호는 그 주름에 휩쓸려 갔습니다.'),V('1호의 전파도 주름을 타고 왔습니다. 그래서 우리가 들을 수 있었습니다.'),C('그럼 우리도 그 길을 탈 수 있겠군.'),V('방향은 전파에서, 거리는 별빛에서 얻었습니다. 둘이 맞아야 1호 곁에서 내립니다. 조종석으로 오십시오.')]); },
  async closeHolo(){ this.live=false; this.atHolo=false; prefetch(['r1_ext','rocks']); this.hum(); S.phase='cut'; this.E.classList.remove('on'); await this.show(this.board,false,.8); R1.g.remove(this.board); R1.g.remove(this.base); this.dim(1,1.4); await camTo({z:-7.2,eye:1.66,pitch:0},.8); window.dragHook=(dx,dy,e)=>{ if(R1.seated){ const h=this.J.head,k=IS_TOUCH?.004:.003; h.y=clamp(h.y-dx*k,-1.1,1.1); h.p=clamp(h.p-dy*k,-.6,.5); return; } const k=e&&e.pointerType==='touch'?.0048:.0032; P.yaw-=dx*k; P.pitch=clamp(P.pitch-dy*k,-1.3,1.3); }; S.phase='play'; P.free=true; },

  /* ============ ⑧ 도약 → 1호 ============ */
  // 추력 손잡이 : 위로 끝까지 민다 — 놓으면 조금 되돌아온다 (도약 · 엔진 켜기)
  async throttle(text,g){ const head=this.J.head, e=this.ui(), b=e.querySelector('.bot'); e.querySelector('.rec').classList.remove('on'); b.className='bot mid right on'; b.innerHTML='<div class="thr"><p>'+text+'</p><div class="slot"><i></i><b></b></div></div>'; goal(g);
    const th=this._th||(this._th=FLIGHT.pivot(R1.b.root,'throttle')); if(th&&th.userData.z0===undefined) th.userData.z0=th.position.z; const z0=th?th.userData.z0:0, slot=b.querySelector('.slot'), knob=b.querySelector('.slot b'), fill=b.querySelector('.slot i'); let k=0, on=false, last=0; const setK=v=>{ k=clamp(v,0,1); knob.style.bottom=k*100+'%'; fill.style.height=k*100+'%'; if(th) th.position.z=z0+k*.05; head.sx=(Math.random()-.5)*.006*k; head.sy=(Math.random()-.5)*.006*k; };
    this.grab(slot,{down:ev=>{ on=true; last=ev.clientY; },move:ev=>{ const d=(last-ev.clientY)/Math.max(60,slot.clientHeight-40); last=ev.clientY; setK(k+d); },up:()=>on=false});
    let nt=0; await until(dt=>{ if(keys.KeyW||keys.ArrowUp) setK(k+dt*.7); else if(!on&&k>0) setK(k-dt*.25); nt-=dt; if(k>.05&&nt<=0){ nt=.14; AUDIO.noise(.3,.05+.12*k,0,200+500*k); } return k>=.995; });
    goal(''); this.off('.bot'); return th; },
  async warp(){ const {V,C}=this, {rig,head}=this.J; loadGLB('ship_ext').then(h=>this.hull=h); await R1.task('seat','조종석으로 — 주름길 도약 100 pc'); await R1.sit(); head.y=0; head.p=-.02; S.phase='play'; P.free=false; window.dragHook=()=>{}; this.dim(.35,1);
    stamp('구조정 R-1 · 조종석','2091.07.22 · 도약 100 pc');
    await TALK.say([V('방향, 1호의 전파. 거리, 100 pc. 주름길 입구를 열었습니다.'),{who:'크리스',ch:'무전',kind:'me',t:'…기다려, 1호. 지금 간다.'}]);
    const th=await this.throttle('추력 손잡이를 끝까지 민다',byDevice('추력 손잡이를 위로 끝까지 민다 (또는 W)','추력 손잡이를 위로 끝까지 민다')), z0=th?th.userData.z0:0; S.phase='cut'; AUDIO.tone(50,7,'sawtooth',.07,0,60); AUDIO.noise(6,.22,0,500); SFX.play('thruster',{vol:1});
    // 별이 늘어나 줄이 된다 → 하얗게
    const N=LITE?360:620, pos=new Float32Array(N*6), st=[...Array(N)].map(()=>({a:Math.random()*6.283,r:3+Math.pow(Math.random(),.6)*26,z:Math.random()*160})), ge=new THREE.BufferGeometry(); ge.setAttribute('position',new THREE.BufferAttribute(pos,3)); const ln=new THREE.LineSegments(ge,new THREE.LineBasicMaterial({color:0xcfe6ff,transparent:true,opacity:0,blending:THREE.AdditiveBlending,depthWrite:false,toneMapped:false,fog:false})); ln.frustumCulled=false; rig.add(ln);
    let t=0; await until(dt=>{ t+=dt; const s=Math.min(1,t/4.2), v=4+s*s*260, len=.05+s*s*34; st.forEach((o,i)=>{ o.z-=v*dt; if(o.z<-4){ o.z=160; o.a=Math.random()*6.283; } const x=Math.cos(o.a)*o.r, y=Math.sin(o.a)*o.r; pos.set([x,y,o.z,x,y,o.z+len],i*6); }); ge.attributes.position.needsUpdate=true; ln.material.opacity=Math.min(.9,t*.8); camera.fov=70+s*s*26; camera.updateProjectionMatrix(); head.sx=(Math.random()-.5)*.016*s; head.sy=(Math.random()-.5)*.016*s; SKY.U.tun.value=0; return t>5.4; });
    const fe=$('#fade'); fe.style.background='#fff'; AUDIO.noise(1,.5,0,700); fade.next='주름길에서 튕겨 나가는 중'; await fade(true,350); rig.remove(ln); camera.fov=70; camera.updateProjectionMatrix(); head.sx=head.sy=0; if(th) th.position.z=z0; AUDIO.hum(.25,30); await BELT.run('fly'); await this.found(); },
  // 도착 : 노란 변광성 · 그 앞을 지나는 1호의 그림자
  async found(){ const {V,C}=this, {rig,head}=this.J; await SKY.space({dir:[0,0,-1],R:.0001,jupiter:false,sunDir:[0,0,1],far:true,sunI:.05}); scene.background=new THREE.Color(0x000000);
    rig.position.set(0,0,0); rig.quaternion.set(0,0,0,1); head.y=0; head.p=-.02;
    // 별 : 노란 공 + 둘레 빛 — 여드레에 한 번 숨을 쉰다 (지금은 어두워지는 중)
    const sd=new THREE.Vector3(-.16,.1,1).normalize(), SP=sd.clone().multiplyScalar(860), star=new THREE.Mesh(new THREE.SphereGeometry(62,48,32),new THREE.ShaderMaterial({uniforms:{t:{value:0},k:{value:1}},vertexShader:'varying vec3 vN; varying vec3 vP; varying vec3 vV; void main(){ vP=position; vN=normalize(mat3(modelMatrix)*normal); vec4 w=modelMatrix*vec4(position,1.0); vV=normalize(cameraPosition-w.xyz); gl_Position=projectionMatrix*viewMatrix*w; }',
      fragmentShader:`uniform float t,k; varying vec3 vN,vP,vV; float h(vec3 p){ return fract(sin(dot(p,vec3(12.9,78.2,37.7)))*43758.5); } float n(vec3 p){ vec3 i=floor(p),f=fract(p); f=f*f*(3.0-2.0*f); return mix(mix(mix(h(i),h(i+vec3(1,0,0)),f.x),mix(h(i+vec3(0,1,0)),h(i+vec3(1,1,0)),f.x),f.y),mix(mix(h(i+vec3(0,0,1)),h(i+vec3(1,0,1)),f.x),mix(h(i+vec3(0,1,1)),h(i+vec3(1,1,1)),f.x),f.y),f.z); }
        void main(){ vec3 p=vP*.12; float g=n(p+vec3(t*.15))*.6+n(p*2.7-vec3(t*.2))*.4; float mu=max(0.0,dot(normalize(vN),normalize(vV))); vec3 c=mix(vec3(1.0,.5,.1),vec3(1.0,.86,.46),pow(mu,.55)); gl_FragColor=vec4(c*(1.15+.9*g)*k*(.7+.9*mu),1.0); }`})); star.position.copy(SP); WORLD.add(star);
    const halo=new THREE.Sprite(this.smat(0xffc24a,{depthTest:true,opacity:.55})); halo.scale.setScalar(760); halo.position.copy(SP); halo.renderOrder=-1; WORLD.add(halo); const halo2=new THREE.Sprite(this.smat(0xff9a2e,{depthTest:true,opacity:.4})); halo2.scale.setScalar(1500); halo2.position.copy(SP); halo2.renderOrder=-1; WORLD.add(halo2);
    const key=new THREE.DirectionalLight(0xffd9a0,1.5); key.position.copy(SP); WORLD.add(key); this.L.forEach(l=>{ if(l.isHemisphereLight) l.color.set(0xffd9a8); });
    // 1호 : 어두운 몸 · 긴 축으로 빠르게 돈다 · 별 앞을 가로질러
    const hull=this.hull||await loadGLB('ship_ext'), G=new THREE.Group(); hull.scale.setScalar(3); hull.traverse(o=>{ if(o.isMesh){ o.material=o.material.clone(); if(o.material.color) o.material.color.multiplyScalar(.12); if(o.material.emissive) o.material.emissive.setRGB(0,0,0); } }); G.add(hull); G.position.set(-86,44,620); G.rotation.set(.1,1.15,0,'YXZ'); WORLD.add(G); const spin=new THREE.Group(); G.add(spin); spin.add(hull);
    const lamp=new THREE.SpotLight(0xe8f0ff,0,900,.16,.7,.6); lamp.position.set(0,.2,1.6); lamp.target.position.set(-86,44,620); rig.add(lamp,lamp.target);
    let t=0, sp=0; JOURNEY.tick(dt=>{ t+=dt; star.material.uniforms.t.value=t; star.material.uniforms.k.value=1+.12*Math.sin(t*.5); halo.material.opacity=.82+.14*Math.sin(t*.5); spin.rotation.z+=dt*.6; rig.position.z+=sp*dt; this.J.cam(); });
    const c0=camera.far; camera.far=2400; camera.updateProjectionMatrix(); stamp('구조정 R-1 · 변광성 S-09 곁','2091.07.22 · 소행성 지대 너머');
    await sleep(700); await fade(false,2400); $('#fade').style.background=''; AUDIO.tone(110,5,'sine',.05); MUSIC.play('derelict',{fade:5}); await over(1,e=>sp=14*e);
    S.phase='play'; P.look=true; window.dragHook=(dx,dy)=>{ const k=IS_TOUCH?.004:.003; head.y=clamp(head.y-dx*k,-1.1,1.1); head.p=clamp(head.p-dy*k,-.6,.5); };
    await TALK.say([V('소행성 지대를 벗어났습니다. 앞쪽에 변광성 S-09.'),C('…노란 별. 정말로 숨을 쉬는 것 같다.'),V('전파원 확인. 바로 앞입니다.'),C('별 앞에 뭔가 있다. …검은 그림자.')]);
    await over(1.2,e=>lamp.intensity=9*e); AUDIO.tone(60,2.5,'sine',.07);
    await TALK.say([V('길이 140 m. 선체 번호… HUY-1.'),C('…하위헌스 1호.'),V('불빛 없음. 열 반응 없음. 긴 축을 중심으로 돌고 있습니다. 생명 신호… 하나.'),C('찾았다.')]);
    sp=22; AUDIO.radio(3); await sleep(2600); P.look=false; S.phase='cut'; await fade(true,2400); camera.far=c0; camera.updateProjectionMatrix(); this.E&&this.E.classList.remove('on'); JOURNEY.clean(); }
};
