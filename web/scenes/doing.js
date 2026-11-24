/* ============================================================
   R-1 에서 손으로 하는 일 (4.14) — 손(scenes/hands.js)이 나와서 실제로 잡고 · 돌리고 · 열고 · 먹는다
   모델 : web/assets/r1_props.glb ← blender/11_손과장치.blend (해치 핸들 · 우주복 보관함과 두 문짝 · 배급기 · 그릇 · 숟가락)
   DO.wheel(dir)   외부 해치 핸들 : 문에 어느 쪽이 LOCK 인지 적혀 있다 → 핸들을 잡고 더 돌아가지 않을 때까지 (끌어서 둥글게 · A D · 화면 단추)
   DO.locker(J)    우주복 보관함 : 전자 잠금(AI 의 이름) → 두 문을 잡아 연다 → 걸린 우주복 둘의 이름표를 보고 문 안쪽 전자 점검표에 체크 (틀린 항목 하나를 고친다)
   DO.eat()        식량 배급기 : 단추 → 그릇이 나오고 죽이 쏟아진다 → 들고 숟가락으로 먹는다
   codePad()       영어 네 글자 자판 (보관함 · 동면 캡슐이 같이 쓴다)
   ============================================================ */
'use strict';
const V3=(x,y,z)=>new THREE.Vector3(x,y,z);
// 매 프레임 할 일 : f(dt) 가 true 를 돌려주면 끝
const until=f=>new Promise(res=>{ const t=dt=>{ if(f(dt)){ TICK.splice(TICK.indexOf(t),1); res(); } }; TICK.push(t); });
const over=(dur,f)=>{ let k=0; return until(dt=>{ k=Math.min(1,k+dt/dur); f(k*k*(3-2*k),k); return k>=1; }); };

const DO={g:null, D:{}, WC:V3(0,.6,-11.526), SUIT:[{o2:100,bat:9,date:'2091.03.18'},{o2:71,bat:9,date:'2091.03.18'}],
  // 걷는 좌표(g 안)에서 본 물체 안의 점 · 방향
  gp(o,p){ o.updateWorldMatrix(true,false); return R1.g.worldToLocal(o.localToWorld(p.clone())); },
  gd(o,d){ return this.gp(o,d).sub(this.gp(o,V3(0,0,0))).normalize(); },
  // 그림판 화면 : pw×ph m · w×h 점
  scr(w,h,pw,ph){ const c=document.createElement('canvas'); c.width=w; c.height=h; const t=new THREE.CanvasTexture(c); t.encoding=THREE.sRGBEncoding; t.anisotropy=8;
    const m=new THREE.Mesh(new THREE.PlaneGeometry(pw,ph),new THREE.MeshBasicMaterial({map:t,toneMapped:false,transparent:true,depthWrite:false})); m.renderOrder=4; return {m,x:c.getContext('2d'),t,w,h}; },
  F:(s,w=600)=>`${w} ${s}px "IBM Plex Sans KR","Malgun Gothic",sans-serif`,
  txt(x,s,px,py,size,col,al='left',w=600){ x.font=this.F(size,w); x.fillStyle=col; x.textAlign=al; x.textBaseline='middle'; x.fillText(s,px,py); },

  /* ---- 붙이기 : R-1 묶음에 한 번만 (장면이 바뀌어도 그대로 남는다) ---- */
  async mount(){ if(this.g===R1.g){ this.leaf(0); this.D.W.position.x=0; return; } const g=this.g=R1.g, D=this.D={}, [p]=await Promise.all([loadGLB('r1_props'),HANDS.load()]), N=n=>p.getObjectByName(n);
    p.traverse(o=>{ if(o.isMesh) o.material.metalness=Math.min(.35,o.material.metalness); });      // 둘레 반사가 없는 세계 — 쇠가 까맣게 죽지 않게
    g.traverse(o=>{ if(o.isMesh&&(/^Locker_Equip/.test(o.material.name||'')||o.name==='hatch_handle')) o.visible=false; });      // 옛 보관함(문이 벽을 보고 있었다) · 해치의 막대는 감춘다 (몸 충돌은 그대로)
    // ① 해치 핸들
    const W=D.W=new THREE.Group(); W.position.copy(this.WC); g.add(W); D.wheel=N('wheel'); W.add(N('wheelbase'),D.wheel);
    D.ring=this.scr(1200,680,1.2,.68); D.ring.m.position.z=-.0885; W.add(D.ring.m); D.ind=this.scr(560,112,.4,.08); D.ind.m.position.set(0,.385,-.08); W.add(D.ind.m);
    this.drawRing(); this.setLock(true);
    // ② 우주복 보관함 (앞 = +x 쪽)
    const L=D.L=new THREE.Group(); L.position.set(-.84,0,-10.6); L.rotation.y=Math.PI/2; g.add(L); D.leafR=N('leafR'); D.leafL=N('leafL'); L.add(N('locker'),D.leafR,D.leafL);
    D.lock=this.scr(280,380,.14,.19); D.lock.m.position.set(-.35,1.4,.0455); D.leafR.add(D.lock.m); this.drawLock('');
    D.list=this.scr(820,1160,.41,.58); D.list.m.position.set(-.273,1.32,-.037); D.list.m.rotation.y=Math.PI; D.leafR.add(D.list.m); this.drawList();
    const il=D.il=new THREE.PointLight(0xdfeaff,0,1.7,1.6); il.position.set(0,1.8,-.08); L.add(il);
    loadGLB('suits').then(s=>{ s.updateMatrixWorld(true); D.suits=['suit_L','suit_R'].map((n,i)=>{ const o=s.getObjectByName(n), bb=new THREE.Box3().setFromObject(o), sz=bb.getSize(V3()), c=bb.getCenter(V3()), k=Math.min(1.46/sz.y,.5/sz.x,.5/sz.z);
        const a=new THREE.Group(), w=new THREE.Group(); s.attach(o); a.add(o); o.position.sub(c); a.scale.setScalar(k); w.add(a); w.position.set(i?.27:-.27,1.84-sz.y*k/2,-.3); L.add(w); o.traverse(q=>{ if(q.isMesh) q.material.metalness=Math.min(.3,q.material.metalness); });
        const tg=this.scr(420,300,.2,.143); tg.m.position.set(0,.12,.2); w.add(tg.m); this.drawTag(tg,i); return w; }); }).catch(e=>console.warn('suits',e));
    // ③ 배급기 (조리대 위 · 앞 = +x 쪽)
    const M=D.M=new THREE.Group(); M.position.set(-1.3,.87,-6.1); M.rotation.y=Math.PI/2; g.add(M); M.add(N('dispenser')); D.bowl=N('bowl'); D.spoon=N('spoon');
    D.ms=this.scr(300,140,.145,.068); D.ms.m.position.set(-.05,.395,.2865); M.add(D.ms.m); this.drawDisp('식량 배급기','단추를 누르십시오');
    const pg=D.pg=new THREE.Mesh(new THREE.CircleGeometry(1,32),new THREE.MeshStandardMaterial({color:0x8f7240,roughness:.95})); pg.rotation.x=-Math.PI/2; D.bowl.add(pg); pg.visible=false;
    this.leaf(0); },

  /* ============ ① 외부 해치 핸들 ============ */
  drawRing(){ const {x,t,w,h}=this.D.ring, cx=w/2, cy=h/2; x.clearRect(0,0,w,h); x.lineCap='round';
    const arc=(col,a0,a1,ccw)=>{ x.strokeStyle=col; x.lineWidth=20; x.beginPath(); x.arc(cx,cy,276,a0,a1,ccw); x.stroke(); const ex=cx+Math.cos(a1)*276, ey=cy+Math.sin(a1)*276, d=a1+(ccw?-1:1)*Math.PI/2; x.fillStyle=col; x.beginPath(); x.moveTo(ex+Math.cos(d)*52,ey+Math.sin(d)*52); x.lineTo(ex+Math.cos(d+2.2)*40,ey+Math.sin(d+2.2)*40); x.lineTo(ex+Math.cos(d-2.2)*40,ey+Math.sin(d-2.2)*40); x.fill(); };
    const T=-Math.PI/2; arc('#58d68d',T+.22,T+1.5,false); arc('#e0982f',T-.22,T-1.5,true);
    this.txt(x,'LOCK',cx+340,cy-70,64,'#58d68d','left',600); this.txt(x,'잠금',cx+340,cy-10,38,'#58d68d'); this.txt(x,'OPEN',cx-340,cy-70,64,'#e0982f','right',600); this.txt(x,'열림',cx-340,cy-10,38,'#e0982f','right'); t.needsUpdate=true; },
  setLock(on,pct){ this.locked=on; const {x,t,w,h}=this.D.ind; x.fillStyle='#07090b'; x.fillRect(0,0,w,h); x.strokeStyle=on?'#58d68d':'#e0982f'; x.lineWidth=6; x.strokeRect(3,3,w-6,h-6);
    this.txt(x,on?'LOCKED  잠김':'보조 잠금 '+Math.round((pct||0)*100)+' %',w/2,h/2+2,52,on?'#58d68d':'#e0982f','center'); t.needsUpdate=true; },
  // dir : +1 = LOCK(시계 방향) · −1 = OPEN · turns 바퀴
  async wheel(dir=1,turns=1.5){ const D=this.D, C=this.WC, T=turns*Math.PI*2, R=.205, MS=$('#mission'); S.phase='cut'; P.free=false; goal(''); if(MS) MS.classList.remove('on');
    await camTo({x:0,z:-10.94,yaw:0,pitch:-.5,eye:1.12},1.0); SFX.play('cloth',{vol:.5});
    // 두 손 : 핸들의 오른쪽 · 왼쪽을 잡는다 (φ = 핸들 면의 각 · 엄지는 위)
    const H=[{h:HANDS.make('R'),c:.3,phi:.5},{h:HANDS.make('L'),c:Math.PI-.3,phi:Math.PI-.15}], at=(phi,out=0)=>C.clone().add(V3(Math.cos(phi)*(R+out*.5),Math.sin(phi)*(R+out*.5),out)), tan=h=>h.h.side==='R'?V3(-Math.sin(h.phi),Math.cos(h.phi),0):V3(Math.sin(h.phi),-Math.cos(h.phi),0);
    await Promise.all(H.map(h=>HANDS.enter(h.h,R1.g,at(h.phi,.09),tan(h),.7))); H.forEach(h=>HANDS.pose(h.h,'grip',.25)); await Promise.all(H.map(h=>HANDS.to(h.h,at(h.phi),tan(h),.28))); AUDIO.noise(.1,.12,0,900);
    S.phase='play'; goal(byDevice(dir>0?'핸들을 LOCK(↻) 쪽으로 돌린다 — 더 돌아가지 않을 때까지 · 둥글게 끌기 또는 D':'핸들을 OPEN(↺) 쪽으로 돌린다 — 더 돌아가지 않을 때까지 · 둥글게 끌기 또는 A',dir>0?'핸들을 LOCK(↻) 쪽으로 둥글게 끌어 돌린다 — 더 돌아가지 않을 때까지':'핸들을 OPEN(↺) 쪽으로 둥글게 끌어 돌린다 — 더 돌아가지 않을 때까지'));
    // 입력 : 핸들 둘레로 둥글게 끌기 (시계 방향 +) · A/D · 단추
    let pend=0, t=0, last=null, clk=0, warn=0, done=false, hold=0; const r0=D.wheel.rotation.z, ctr=()=>{ const n=R1.g.localToWorld(C.clone()).project(camera); return [(n.x+1)/2*innerWidth,(1-n.y)/2*innerHeight]; };
    const el=$('#c'), dn=e=>{ if(TALK.on) return; const [cx,cy]=ctr(); last=Math.atan2(e.clientY-cy,e.clientX-cx); }, mv=e=>{ if(last===null) return; const [cx,cy]=ctr(), a=Math.atan2(e.clientY-cy,e.clientX-cx), d=Math.atan2(Math.sin(a-last),Math.cos(a-last)); last=a; pend=clamp(pend+d,-.9,.9); }, up=()=>{ last=null; };
    el.addEventListener('pointerdown',dn); addEventListener('pointermove',mv); addEventListener('pointerup',up); addEventListener('pointercancel',up);
    const ui=document.createElement('div'); ui.id='wheelui'; ui.innerHTML='<button data-d="-1" aria-label="시계 반대 방향">↺</button><button data-d="1" aria-label="시계 방향">↻</button>'; document.body.appendChild(ui);
    ui.querySelectorAll('button').forEach(b=>{ b.addEventListener('pointerdown',e=>{ e.preventDefault(); hold=+b.dataset.d; }); ['pointerup','pointerleave','pointercancel'].forEach(n=>b.addEventListener(n,()=>hold=0)); });
    await until(dt=>{ const key=((keys.KeyD||keys.ArrowRight||keys.KeyE)?1:0)-((keys.KeyA||keys.ArrowLeft||keys.KeyQ)?1:0)||hold; if(key) pend=clamp(pend+key*2.6*dt,-.3,.3);
      const busyH=H.filter(h=>h.re>0).length, sp=(busyH?1.5:2.5)*dt, st=clamp(pend,-sp,sp); pend-=st; pend*=1-Math.min(1,dt*1.5); let nt=t+st*dir;
      if(nt<-.45){ nt=-.45; pend=0; if(warn<=0){ warn=1.4; THUD(.2); toast(dir>0?'이쪽은 OPEN — LOCK(↻) 쪽으로':'이쪽은 LOCK — OPEN(↺) 쪽으로',1400); } } warn-=dt;
      if(nt>=T){ nt=T; done=true; }
      const dA=-(nt-t)*dir; t=nt; D.wheel.rotation.z=r0-t*dir;      // 세계 각 (반시계 +)
      clk+=Math.abs(dA); if(clk>.26){ clk=0; AUDIO.tone(320+Math.random()*60,.03,'square',.03); AUDIO.noise(.05,.06,0,1800); }
      if(dir>0&&!done) this.setLock(false,.2+.8*Math.max(0,t)/T);
      // 손 : 핸들을 따라 돌다가, 팔이 꼬이기 전에 한 손씩 놓고 되돌아가 다시 잡는다
      for(const h of H){ if(h.re>0){ h.re-=dt; const k=1-Math.max(0,h.re)/.34, e=k*k*(3-2*k); h.phi=h.a0+(h.a1-h.a0)*e; HANDS.put(h.h,at(h.phi,.07*Math.sin(Math.min(1,k)*Math.PI)),tan(h)); if(h.re<=.12&&h.h.cur==='open') HANDS.pose(h.h,'grip',.12); continue; }
        h.phi+=dA; HANDS.put(h.h,at(h.phi),tan(h)); const off=h.phi-h.c; if(Math.abs(off)>.8&&off*dA>0&&!H.some(o=>o!==h&&o.re>0)){ h.re=.34; h.a0=h.phi; h.a1=h.c-Math.sign(off)*.55; HANDS.pose(h.h,'open',.1); } }
      return done; });
    el.removeEventListener('pointerdown',dn); removeEventListener('pointermove',mv); removeEventListener('pointerup',up); removeEventListener('pointercancel',up); ui.remove(); goal('');
    THUD(.5); FX.shake(.18,.012); AUDIO.noise(.2,.3,0,500); S.phase='cut'; await sleep(350); if(dir>0){ this.setLock(true); AUDIO.tone(520,.1,'square',.05); AUDIO.tone(780,.14,'square',.05,.12); } else { this.locked=false; AUDIO.tone(420,.14,'square',.05); const {x,t:tt,w,h:hh}=D.ind; x.fillStyle='#07090b'; x.fillRect(0,0,w,hh); x.strokeStyle='#e0982f'; x.lineWidth=6; x.strokeRect(3,3,w-6,hh-6); this.txt(x,'OPEN  열림',w/2,hh/2+2,52,'#e0982f','center'); tt.needsUpdate=true; }
    H.forEach(h=>HANDS.pose(h.h,'open',.2)); await sleep(160); await Promise.all(H.map(h=>HANDS.exit(h.h,.45))); await camTo({eye:1.66,pitch:0},.6); if(MS&&MISSION.open) MS.classList.add('on'); S.phase='play'; },

  /* ============ ② 우주복 보관함 ============ */
  leaf(a){ this.la=a; this.D.leafR.rotation.y=a; this.D.leafL.rotation.y=-a; },
  drawLock(s,st=''){ const {x,t,w,h}=this.D.lock; x.fillStyle='#05080a'; x.fillRect(0,0,w,h); const col=st==='ok'?'#58d68d':st==='bad'?'#ff5a36':'#9fd8ff'; x.strokeStyle=col; x.lineWidth=5; x.strokeRect(6,6,w-12,h-12);
    this.txt(x,st==='ok'?'열림':st==='bad'?'거부':'잠김',w/2,52,40,col,'center'); for(let i=0;i<4;i++){ x.strokeStyle='rgba(159,216,255,.6)'; x.lineWidth=3; x.strokeRect(24+i*59,96,52,66); this.txt(x,s[i]||'',50+i*59,131,44,col,'center'); }
    for(let r=0;r<4;r++) for(let c=0;c<4;c++){ x.fillStyle='rgba(159,216,255,.16)'; x.fillRect(28+c*58,190+r*44,48,34); } t.needsUpdate=true; },
  drawTag(s,i){ const {x,t,w,h}=s, U=this.SUIT[i], col=U.o2<90?'#e0982f':'#58d68d'; x.fillStyle='#0b0e11'; x.fillRect(0,0,w,h); x.strokeStyle='#e9e7e2'; x.lineWidth=6; x.strokeRect(4,4,w-8,h-8);
    this.txt(x,'SUIT '+'AB'[i],24,46,48,'#fff'); this.txt(x,'EVA',w-24,46,30,'#9aa0a6','right'); this.txt(x,'산소',24,116,38,'#c8ccd0'); this.txt(x,U.o2+' %',w-24,116,50,col,'right'); x.fillStyle='rgba(255,255,255,.14)'; x.fillRect(24,148,w-48,18); x.fillStyle=col; x.fillRect(24,148,(w-48)*U.o2/100,18);
    this.txt(x,'배터리',24,204,34,'#c8ccd0'); this.txt(x,U.bat+'시간',w-24,204,40,'#fff','right'); this.txt(x,'점검일',24,258,32,'#c8ccd0'); this.txt(x,U.date,w-24,258,34,'#fff','right'); t.needsUpdate=true; },
  // 점검표 : v 적힌 값 · 맞음(1) / 다름(−1) · 다르면 값을 고친다 (opts)
  ROWS(){ return [{n:'우주복',v:'2 벌',o:['1 벌','2 벌','3 벌'],a:'2 벌'},{n:'헬멧',v:'2 개',o:['1 개','2 개','3 개'],a:'2 개'},{n:'A 산소',v:'100 %',o:['100 %','98 %','71 %','54 %'],a:'100 %'},{n:'B 산소',v:'98 %',o:['98 %','100 %','71 %','54 %'],a:'71 %'},{n:'배터리 (A · B)',v:'9 시간',o:['9 시간','7 시간','5 시간'],a:'9 시간'},{n:'점검일',v:'2091.03.18',o:['2091.03.18','2091.02.18','2090.03.18'],a:'2091.03.18'}].map(r=>({...r,mk:0,i:0})); },
  drawList(msg='',ok=false){ const {x,t,w,h}=this.D.list, R=this.rows=this.rows||this.ROWS(); x.fillStyle='#06101a'; x.fillRect(0,0,w,h); x.fillStyle='#0d2438'; x.fillRect(0,0,w,104); this.txt(x,'EVA 우주복 점검표',32,54,46,'#9fd8ff'); this.txt(x,'R-1',w-32,54,34,'#6f9fc4','right');
    R.forEach((r,k)=>{ const y=118+k*146; x.fillStyle=k%2?'#081521':'#0a1a29'; x.fillRect(0,y,w,142); this.txt(x,r.n,30,y+42,36,'#c7d6e2'); const ed=r.mk<0;
      this.txt(x,ed?r.o[r.i]:r.v,ed?188:30,y+98,44,ed?'#ffb84d':'#fff',ed?'center':'left'); if(ed){ this.txt(x,'◀',46,y+98,44,'#ffb84d','center'); this.txt(x,'▶',330,y+98,44,'#ffb84d','center'); }
      [[1,'맞음',396,'#58d68d'],[-1,'다름',602,'#ffb84d']].forEach(([m,s,bx,c])=>{ const on=r.mk===m; x.fillStyle=on?c:'rgba(159,216,255,.08)'; x.fillRect(bx,y+26,186,92); x.strokeStyle=on?c:'rgba(159,216,255,.45)'; x.lineWidth=4; x.strokeRect(bx,y+26,186,92); this.txt(x,(on?'✓ ':'')+s,bx+93,y+73,40,on?'#06101a':'#c7d6e2','center'); }); });
    x.fillStyle=ok?'#58d68d':'#12476b'; x.fillRect(30,h-146,w-60,88); this.txt(x,ok?'점검 완료 ✓':'점검 완료',w/2,h-101,46,ok?'#06101a':'#fff','center',600); this.txt(x,msg,w/2,h-30,32,'#ffb84d','center'); t.needsUpdate=true; },
  // 점검표를 눌렀다 (그림판 좌표) → 무엇을 눌렀나
  hitList(px,py){ const R=this.rows, h=this.D.list.h, w=this.D.list.w; if(py>h-156&&py<h-48) return {done:true}; const k=Math.floor((py-118)/146); if(k<0||k>=R.length) return null; const r=R[k]; if(px>=390&&px<592) return {r,m:1}; if(px>=596) return {r,m:-1}; if(r.mk<0&&px<120) return {r,st:-1}; if(r.mk<0&&px>250&&px<390) return {r,st:1}; return null; },
  // 두 문 : 손으로 잡아 연다 · 닫는다
  async doors(open){ const D=this.D, R=HANDS.make('R'), L=HANDS.make('L'), hp=s=>this.gp(s?D.leafR:D.leafL,V3(s?-.495:.495,1.12,.06)), up=V3(0,1,0), O=V3(.06,0,0); const A0=this.la, A1=open?2.0:0;
    if(open){ await Promise.all([HANDS.enter(R,R1.g,hp(1).add(O),up,.6),HANDS.enter(L,R1.g,hp(0).add(O),up,.6)]); HANDS.pose(R,'grip',.2); HANDS.pose(L,'grip',.2); await Promise.all([HANDS.to(R,hp(1),up,.22),HANDS.to(L,hp(0),up,.22)]); SFX.play('locker_open',{vol:.7}); }
    else { await Promise.all([HANDS.enter(R,R1.g,hp(1),up,.5),HANDS.enter(L,R1.g,hp(0),up,.5)]); }
    D.il.intensity=open?.9:.9; let rel=false; await over(open?1.7:1.1,e=>{ this.leaf(A0+(A1-A0)*e); if(open?this.la<1.15:true){ HANDS.put(R,hp(1),up); HANDS.put(L,hp(0),up); } else if(!rel){ rel=true; HANDS.exit(R,.5); HANDS.exit(L,.5); } });
    if(!open){ SFX.play('locker_close',{vol:.7}); D.il.intensity=0; await Promise.all([HANDS.exit(R,.4),HANDS.exit(L,.4)]); } },
  async locker({V,C}){ const D=this.D, MS=$('#mission'); S.phase='cut'; P.free=false; goal(''); this.rows=this.ROWS(); this.drawList(); this.drawLock(''); if(MS) MS.classList.remove('on');
    // 전자 잠금 : 가까이 가서 검지로 누른다
    const lp=this.gp(D.leafR,V3(-.35,1.4,.05)); await camTo({x:-.2,z:lp.z+.02,yaw:Math.PI/2,pitch:-.46,eye:1.56},.9); await TALK.say([V('보관함은 전자 잠금입니다. 비밀번호를 입력하십시오.')]);
    const f=HANDS.make('R','point'), home=lp.clone().add(V3(.13,-.07,-.07)); let chain=Promise.resolve(); await HANDS.enter(f,R1.g,home,V3(0,1,0),.5); S.phase='play';
    const tap=s=>{ this.drawLock(s); const k=lp.clone().add(V3(.004,-.015-Math.random()*.06,.05-Math.random()*.1)); chain=chain.then(()=>HANDS.poke(f,k,V3(.06,0,0),.1)); };
    await codePad({cls:'low',hd:'우주복 보관함 · 전자 잠금',html:'<p class="note">비밀번호 네 글자 (영어)</p><p class="ask">이 구조정 <b>AI 의 이름</b>은?</p>',answer:'VEGA',onKey:tap,onBad:()=>{ this.drawLock('----','bad'); setTimeout(()=>this.drawLock(''),700); }});
    this.drawLock('VEGA','ok'); S.phase='cut'; await chain; await HANDS.exit(f,.35); AUDIO.noise(.3,.2,0,700); THUD(.15);
    await camTo({x:-.02,z:-10.6,yaw:Math.PI/2,pitch:-.12,eye:1.5},.6); await this.doors(true);
    await camTo({x:.12,z:-10.6,yaw:Math.PI/2,pitch:-.06,eye:1.5},.5); await TALK.say([V('우주복 두 벌. 문 안쪽이 점검표입니다. 실물과 다른 항목이 있으면 고쳐 주십시오.')]);
    // 보는 자리 : 우주복 A · B · 점검표 (화면을 끌어 둘러볼 수도 있다)
    const n=this.gd(D.leafR,V3(0,0,-1)), lc=this.gp(D.leafR,V3(-.273,1.32,-.04)), VIEW={all:{x:.12,z:-10.6,yaw:Math.PI/2,pitch:-.06,eye:1.5},a:{x:-.42,z:-10.33,yaw:Math.PI/2,pitch:-.02,eye:1.36},b:{x:-.42,z:-10.87,yaw:Math.PI/2,pitch:-.02,eye:1.36},
      list:{x:lc.x+n.x*.6,z:lc.z+n.z*.6,yaw:Math.atan2(n.x,n.z),pitch:0,eye:lc.y}};
    const ui=document.createElement('div'); ui.id='viewui'; ui.innerHTML='<button data-v="a">우주복 A</button><button data-v="b">우주복 B</button><button data-v="list">점검표</button><button data-v="all">물러서기</button>'; document.body.appendChild(ui); let cur='all', mov=false, fin=false;
    const see=async v=>{ if(mov||fin) return; mov=true; cur=v; ui.querySelectorAll('button').forEach(b=>b.classList.toggle('on',b.dataset.v===v)); await camTo({...VIEW[v]},.65); mov=false; };
    ui.querySelectorAll('button').forEach(b=>b.addEventListener('pointerdown',e=>{ e.stopPropagation(); AUDIO.click(); see(b.dataset.v); }));
    S.phase='play'; P.look=true; goal('우주복을 보고 점검표에 체크 — 맞으면 [맞음], 다르면 [다름] 을 누르고 값을 고친다');
    const rc=new THREE.Raycaster(), el=$('#c'); let pd=null; const fg=HANDS.make('R','point'); let tapping=false;
    await new Promise(res=>{ const down=e=>{ pd=TALK.on?null:[e.clientX,e.clientY]; }, upp=async e=>{ if(!pd||Math.hypot(e.clientX-pd[0],e.clientY-pd[1])>10||mov||fin) return; pd=null; rc.setFromCamera(new THREE.Vector2(e.clientX/innerWidth*2-1,-(e.clientY/innerHeight)*2+1),camera);
          const hit=rc.intersectObject(D.list.m)[0]; if(!hit){ return; } if(cur!=='list') return see('list'); const q=this.hitList(hit.uv.x*D.list.w,(1-hit.uv.y)*D.list.h); if(!q||tapping) return;
          // 검지로 누른다 → 그 순간 바뀐다
          tapping=true; const gpnt=R1.g.worldToLocal(hit.point.clone()), back=n.clone().multiplyScalar(.05); if(!fg.g.parent){ R1.g.add(fg.g); HANDS.put(fg,lc.clone().add(n.clone().multiplyScalar(.12)).add(V3(0,-.52,0)),V3(0,1,0)); } await HANDS.poke(fg,gpnt,back,.16);
          if(q.done){ const bad=this.rows.filter(r=>!(r.mk===1&&r.v===r.a||r.mk===-1&&r.o[r.i]===r.a)), blank=this.rows.filter(r=>!r.mk).length;
            if(!bad.length){ fin=true; this.drawList('',true); AUDIO.tone(880,.12,'sine',.08); AUDIO.tone(1320,.2,'sine',.07,.1); el.removeEventListener('pointerdown',down); el.removeEventListener('pointerup',upp); setTimeout(res,700); }
            else { AUDIO.tone(200,.2,'square',.05); this.drawList(blank?'아직 체크하지 않은 항목이 '+blank+'개':'실물과 다른 항목이 '+bad.length+'개 — 다시 확인'); } }
          else { if(q.m){ q.r.mk=q.m; if(q.m<0) q.r.i=q.r.o.indexOf(q.r.v); } else q.r.i=(q.r.i+q.st+q.r.o.length)%q.r.o.length; this.drawList(); }
          if(!fin) HANDS.to(fg,lc.clone().add(n.clone().multiplyScalar(.12)).add(V3(0,-.52,0)),V3(0,1,0),.32); setTimeout(()=>tapping=false,180); };
      el.addEventListener('pointerdown',down); el.addEventListener('pointerup',upp); });
    P.look=false; ui.remove(); goal(''); S.phase='cut'; HANDS.exit(fg,.4);
    await camTo({x:-.02,z:-10.6,yaw:Math.PI/2,pitch:-.1,eye:1.5},.7); await TALK.say([C('우주복 두 벌, 헬멧 둘. …B 산소가 71 퍼센트. 적힌 값이 틀렸다.'),V('기록을 71 퍼센트로 고쳤습니다. 닿기 전까지 채워 두겠습니다. 점검 완료.')]);
    await this.doors(false); this.drawLock(''); await camTo({x:.35,z:-10.6,eye:1.66,pitch:0},.6); if(MS&&MISSION.open) MS.classList.add('on'); S.phase='play'; },

  /* ============ ③ 식량 배급기 ============ */
  drawDisp(a,b){ const {x,t,w,h}=this.D.ms; x.fillStyle='#071017'; x.fillRect(0,0,w,h); this.txt(x,a,w/2,50,34,'#ffb84d','center'); this.txt(x,b,w/2,100,24,'#c7d6e2','center'); t.needsUpdate=true; },
  // 그릇 안 죽의 높이 k (0~1)
  fill(k){ const pg=this.D.pg; pg.visible=k>.01; pg.position.y=.009+.034*k; pg.scale.setScalar(.034+.02*Math.sqrt(k)); },
  async eat(){ const D=this.D, M=D.M, MS=$('#mission'); S.phase='cut'; P.free=false; goal(''); if(MS) MS.classList.remove('on');
    await camTo({x:-.38,z:-6.1,yaw:Math.PI/2,pitch:-.36,eye:1.5},.9);
    // 단추를 검지로
    const f=HANDS.make('R','point'), bp=this.gp(M,V3(.11,.395,.293)); await HANDS.enter(f,R1.g,bp.clone().add(V3(.1,-.04,-.02)),V3(0,1,0),.5); await HANDS.poke(f,bp,V3(.06,0,0),.22); HANDS.exit(f,.4);
    // 그릇이 내려오고 → 죽이 쏟아진다 → 김
    this.drawDisp('단백질 죽','데우는 중…'); AUDIO.tone(880,.08,'sine',.05); AUDIO.hum&&0; await sleep(700); AUDIO.noise(.5,.08,0,500); const b=D.bowl; M.add(b); b.rotation.set(0,0,0); b.scale.setScalar(1); this.fill(0); b.visible=true;
    await over(.45,e=>b.position.set(0,.2-.157*e,.15)); AUDIO.tone(1500,.05,'triangle',.06); await sleep(250); this.drawDisp('단백질 죽','내리는 중…');
    const st=new THREE.Mesh(new THREE.CylinderGeometry(.011,.014,1,14),D.pg.material); M.add(st); AUDIO.noise(2.6,.09,0,650); let w=0;
    await over(2.6,(e,k)=>{ w+=.3; const top=.255, bot=.043+.009+.034*e, on=k<.93?1:(1-k)/.07; st.visible=on>0; st.scale.set(on*(1+.12*Math.sin(w)),Math.max(.01,top-bot),on*(1+.12*Math.cos(w*1.3))); st.position.set(0,(top+bot)/2,.15); this.fill(e); }); M.remove(st);
    this.drawDisp('완성','뜨겁습니다'); AUDIO.tone(1046,.1,'sine',.05); const puffs=this.steam(b); await sleep(500);
    // 왼손으로 그릇을 들고 → 눈앞으로 → 오른손 숟가락으로 세 번
    const L=HANDS.make('L'), bw=this.gp(M,V3(0,.043,.15)), Ly=V3(0,1,0), grab=bw.clone().add(V3(.03,.028,.055)), fw=V3(-Math.sin(P.yaw),0,-Math.cos(P.yaw)), rt=V3(Math.cos(P.yaw),0,-Math.sin(P.yaw)); await HANDS.enter(L,R1.g,grab.clone().add(V3(.05,.02,.05)),Ly,.6); HANDS.pose(L,'hold',.25); await HANDS.to(L,grab,Ly,.28);
    L.g.attach(b); const eye=V3(P.x,P.y+P.eye,P.z), near=eye.clone().addScaledVector(fw,.36).addScaledVector(rt,-.06).add(V3(0,-.27,0)); camTo({pitch:-.42},.9); await HANDS.to(L,near,Ly,.95); SFX.play('cloth',{vol:.4});
    const R=HANDS.make('R','pinch'), sp=D.spoon; sp.visible=true; R.g.add(sp); sp.position.set(.075,.018,-.02); sp.rotation.set(0,0,0); sp.quaternion.setFromUnitVectors(V3(0,0,1),V3(1,0,0)); sp.position.set(.1,.016,-.018);      // 숟가락 머리(모델의 −z… 앞) = 엄지 쪽
    const bowlAt=()=>this.gp(b,V3(0,.05,0)), Xs=rt.clone().multiplyScalar(-.75).add(V3(0,-.62,0)).addScaledVector(fw,.1), hov=()=>bowlAt().addScaledVector(Xs.clone().normalize(),-.125).add(V3(0,.05,0)), dip=()=>hov().add(V3(0,-.062,0)), mouth=eye.clone().addScaledVector(fw,.24).addScaledVector(rt,.14).add(V3(0,-.17,0));
    await HANDS.enter(R,R1.g,hov(),Xs,.6);
    for(let i=0;i<3;i++){ await HANDS.to(R,dip(),Xs,.28); AUDIO.tone(1900,.03,'triangle',.02); const k0=1-i*.3, k1=1-(i+1)*.3; over(.3,e=>this.fill(k0+(k1-k0)*e)); await HANDS.to(R,hov(),Xs,.3); await HANDS.to(R,mouth,Xs.clone().addScaledVector(V3(0,1,0),.5),.45); AUDIO.noise(.18,.05,0,900); await sleep(i===2?650:320); if(i<2) await HANDS.to(R,hov(),Xs,.4); }
    puffs(); await Promise.all([HANDS.exit(R,.4),HANDS.exit(L,.5)]); b.visible=false; M.add(b); sp.visible=false; M.add(sp); this.drawDisp('식량 배급기','단추를 누르십시오'); await camTo({eye:1.66,pitch:-.05},.5); if(MS&&MISSION.open) MS.classList.add('on'); S.phase='play'; },
  // 김 : 그릇 위로 피어오른다 → 멈추는 함수
  steam(b){ const tx=this._st||(this._st=(()=>{ const c=document.createElement('canvas'); c.width=c.height=64; const g=c.getContext('2d'), r=g.createRadialGradient(32,32,0,32,32,32); r.addColorStop(0,'rgba(255,255,255,.8)'); r.addColorStop(1,'rgba(255,255,255,0)'); g.fillStyle=r; g.fillRect(0,0,64,64); return new THREE.CanvasTexture(c); })());
    const L=[...Array(7)].map((_,i)=>{ const s=new THREE.Sprite(new THREE.SpriteMaterial({map:tx,transparent:true,depthWrite:false,opacity:0})); s.userData.t=i/7; b.add(s); return s; }); let on=true;
    const f=dt=>{ L.forEach(s=>{ s.userData.t=(s.userData.t+dt*.5)%1; const t=s.userData.t; s.position.set(Math.sin(t*9+s.id)*.012,.06+t*.16,Math.cos(t*7+s.id)*.012); s.scale.setScalar(.03+t*.07); s.material.opacity=on?.22*Math.sin(t*Math.PI):s.material.opacity*.9; }); }; TICK.push(f);
    return ()=>{ on=false; setTimeout(()=>{ const i=TICK.indexOf(f); if(i>=0) TICK.splice(i,1); L.forEach(s=>b.remove(s)); },600); }; },
};

/* ---- 영어 네 글자 자판 → 맞힐 때까지 기다린다 ---- */
function codePad({cls='',hd,html,answer,onKey,onBad}){ const A=answer.toUpperCase(); return new Promise(res=>{ const q=document.createElement('div'); q.id='podlock'; q.className=cls;
  q.innerHTML=`<p class="hd">${hd}</p>${html}<div class="slots">${'<i></i>'.repeat(4)}</div><p class="msg"></p>
    <div class="kb">${'QWERTYUIOPASDFGHJKLZXCVBNM'.split('').map(c=>`<button data-c="${c}">${c}</button>`).join('')}<button data-c="⌫" class="w">⌫</button></div><div class="row"><button class="ok">확인</button></div>`;
  document.body.appendChild(q); requestAnimationFrame(()=>q.classList.add('on'));
  let s='', end=false; const slots=[...q.querySelectorAll('.slots i')], msg=q.querySelector('.msg'), draw=()=>slots.forEach((e,i)=>e.textContent=s[i]||'');
  const key=c=>{ if(end) return; AUDIO.tick(); if(c==='⌫') s=s.slice(0,-1); else if(s.length<4) s+=c; else return; q.classList.remove('bad'); msg.textContent=''; draw(); onKey&&onKey(s); };
  const ok=()=>{ if(end) return; if(s.length<4){ msg.textContent='네 글자를 넣자'; return; }
    if(s===A){ end=true; AUDIO.tone(880,.12,'sine',.08); AUDIO.tone(1320,.2,'sine',.07,.1); q.classList.add('good'); msg.textContent='잠금 해제'; removeEventListener('keydown',kb,true); setTimeout(()=>{ q.remove(); res(); },1000); return; }
    AUDIO.tone(180,.25,'square',.05); q.classList.add('bad'); msg.textContent='암호가 틀렸습니다'; s=''; setTimeout(draw,350); onBad&&onBad(); };
  q.querySelectorAll('.kb button').forEach(b=>b.onclick=()=>key(b.dataset.c)); q.querySelector('.ok').onclick=ok;
  const kb=e=>{ if(TALK.on) return; const k=e.key.length===1&&/[a-z]/i.test(e.key)?e.key.toUpperCase():e.key==='Backspace'?'⌫':e.key==='Enter'?'ok':null; if(!k) return; e.preventDefault(); e.stopPropagation(); k==='ok'?ok():key(k); };
  addEventListener('keydown',kb,true); }); }
