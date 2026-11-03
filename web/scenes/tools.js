/* ============================================================
   이야기 도구 (4판) — game.js 가 쓴다
   STORY : 소품(story.glb · horror.glb) · 어둠(손전등) · 목표 표지 · 기다리기 · 문제 화면(pick · sort · sim · qte — 나중에 문제를 끼울 때)
   공포 : FX(암전 · 번쩍 · 흔들림 · 깜빡임) · 소리(STING · SCREAM · GROWL · THUD) · 피(drip · splat · spray)
   나 : 권총(1인칭 · gun.glb) · 체력 3 · 웅크리기
   ============================================================ */
'use strict';
const STORY={
  it(k){ const r=SHIP.rooms&&SHIP.rooms.story, h=SHIP.rooms&&SHIP.rooms.horror; return (r&&r.items[k])||(h&&h.items[k]); },      // story.glb · horror.glb
  show(k,on){ const o=this.it(k); if(o) o.visible=on; },
  // 소품 준비 : 피 데칼은 바닥 · 벽 위에 떠 보이게 · 어둠 속에서도 손전등에 읽히게 살짝 빛나게
  prep(R){ R.root.traverse(o=>{ if(!o.isMesh) return; const m=o.material;
      if(/blood/.test(m.name)){ m.emissive=new THREE.Color(.5,.03,.02); m.emissiveMap=m.map; m.emissiveIntensity=2.2; m.depthWrite=false; m.polygonOffset=true; m.polygonOffsetFactor=-4; m.polygonOffsetUnits=-4; o.renderOrder=3; } });
    ['lamp','pod_cabin'].forEach(k=>this.show(k,false)); },
  // 어둠 : 노출을 낮추고 화면 가장자리를 까맣게 (손전등 원) · red = 붉은 비상등
  dark(on,{red=false}={}){ SHIP.dim=on?.3:1; let el=$('#torch'); if(!el){ el=document.createElement('div'); el.id='torch'; document.body.appendChild(el); }
    el.classList.toggle('on',on); el.classList.toggle('red',on&&red);
    if(!this.spot||!this.spot.parent){ this.spot=new THREE.SpotLight(0xfff1dc,0,22,.42,.5,1.4); WORLD.add(this.spot,this.spot.target);
      TICK.push(()=>{ const s=this.spot; if(!s.intensity) return; s.position.copy(camera.position); camera.getWorldDirection(s.target.position).multiplyScalar(4).add(camera.position); }); }
    this.spot.intensity=on?3.2:0; },
  // 기다리기 : 물건을 누를 때까지
  wait(mesh,name,o={}){ return new Promise(res=>{ const it=interact(mesh,name,()=>{ if(!it.done){ it.done=true; INTER.splice(INTER.indexOf(it),1); res(); } },{range:o.range||3,enabled:o.enabled}); }); },
  // 위치에 닿을 때까지
  reach(x,z,r=1.2){ return new Promise(res=>{ const f=()=>{ if(Math.hypot(P.x-x,P.z-z)<r){ TICK.splice(TICK.indexOf(f),1); res(); } }; TICK.push(f); }); },
  // 갈 곳 위에 깜빡이는 표지 → 지우는 함수
  mark(x,y,z){ const cv=document.createElement('canvas'); cv.width=cv.height=64; const g=cv.getContext('2d');
    g.strokeStyle='#ff5a36'; g.lineWidth=6; g.beginPath(); g.moveTo(32,6); g.lineTo(58,32); g.lineTo(32,58); g.lineTo(6,32); g.closePath(); g.stroke();
    const sp=new THREE.Sprite(new THREE.SpriteMaterial({map:new THREE.CanvasTexture(cv),depthTest:false,transparent:true,toneMapped:false})); sp.scale.setScalar(.32); sp.renderOrder=20; sp.position.set(x,y,z); WORLD.add(sp);
    const fn=()=>{ sp.position.y=y+Math.sin(S.t*3)*.08; sp.material.opacity=.6+.4*Math.sin(S.t*5); }; TICK.push(fn);
    return ()=>{ WORLD.remove(sp); const i=TICK.indexOf(fn); if(i>=0) TICK.splice(i,1); }; },
  async go(x,z,text,{r=1.4,y=1.6}={}){ goal(text); const un=this.mark(x,y,z); await this.reach(x,z,r); un(); },
  async at(mesh,name,text,o={}){ if(text) goal(text); const v=new THREE.Vector3(); new THREE.Box3().setFromObject(mesh).getCenter(v); const un=this.mark(v.x,v.y+(o.up||.7),v.z); await this.wait(mesh,name,o); un(); },
  // 한 곳을 지날 때 한 번 (독백 · 연출)
  once(x,z,r,fn){ const f=()=>{ if(S.phase==='play'&&!TALK.on&&Math.hypot(P.x-x,P.z-z)<r){ TICK.splice(TICK.indexOf(f),1); fn(); } }; TICK.push(f); },

  /* ---- 문제 화면 : 위쪽 패널 (문제는 나중에 사용자 지시로 끼운다) ---- */
  panel(hd){ const el=document.createElement('div'); el.className='spanel'; el.innerHTML=`<p class="hd"><span>${hd}</span><span class="ph"></span></p><div class="bd"></div><p class="msg"></p>`;
    document.body.appendChild(el); requestAnimationFrame(()=>el.classList.add('on')); S.busy=true; P.free=false;
    const msg=el.querySelector('.msg');
    return {el,bd:el.querySelector('.bd'),ok(t){ AUDIO.tone(880,.12,'sine',.08); AUDIO.tone(1320,.16,'sine',.07,.1); msg.textContent=t; msg.className='msg ok'; },
      no(t){ AUDIO.tone(220,.18,'square',.04); msg.textContent=t; msg.className='msg'; },
      close(){ el.classList.remove('on'); setTimeout(()=>el.remove(),400); S.busy=false; P.free=true; }}; },
  // 표에서 줄 고르기 : qs = [{q, ans:줄 번호, ok, hint(고른 줄, 틀린 횟수)}]
  pick(hd,cols,rows,qs){ return new Promise(res=>{ const p=this.panel(hd);
    p.bd.innerHTML=`<p class="q"></p><table class="st"><tr>${cols.map(c=>`<th>${c}</th>`).join('')}</tr>${rows.map((r,i)=>`<tr data-i="${i}">${r.map(v=>`<td>${v}</td>`).join('')}</tr>`).join('')}</table>`;
    let k=0, miss=0; const qel=p.bd.querySelector('.q'), ask=()=>{ qel.innerHTML=`<b>${k+1} / ${qs.length}</b> ${qs[k].q}`; miss=0; }; ask();
    p.bd.querySelectorAll('tr[data-i]').forEach(tr=>tr.onclick=()=>{ const i=+tr.dataset.i, q=qs[k]; if(!q) return;
      if(i===q.ans){ tr.classList.add('hit'); setTimeout(()=>tr.classList.remove('hit'),900); p.ok(q.ok||'맞아요'); k++; if(k<qs.length) setTimeout(ask,900); else setTimeout(()=>{ p.close(); res(); },1600); }
      else { miss++; p.no(q.hint(i,miss)); } }); }); },
  // 카드 나누기 : cards = [[글, 칸 번호]]
  sort(hd,q,bins,cards,hint){ return new Promise(res=>{ const p=this.panel(hd);
    p.bd.innerHTML=`<p class="q">${q}</p><div class="cards">${cards.map((c,i)=>`<button data-i="${i}">${c[0]}</button>`).join('')}</div><div class="bins">${bins.map((b,i)=>`<div class="bin" data-b="${i}"><p>${b}</p></div>`).join('')}</div>`;
    let sel=null, left=cards.length; const bs=[...p.bd.querySelectorAll('.cards button')];
    bs.forEach(b=>b.onclick=()=>{ AUDIO.tick(); sel=b; bs.forEach(x=>x.classList.toggle('sel',x===b)); });
    p.bd.querySelectorAll('.bin').forEach(bin=>bin.onclick=()=>{ if(!sel) return; const i=+sel.dataset.i;
      if(+bin.dataset.b===cards[i][1]){ bin.appendChild(sel); sel.classList.remove('sel'); sel.disabled=true; sel=null; p.ok('맞아요'); if(--left===0) setTimeout(()=>{ p.close(); res(); },1500); }
      else p.no(hint(i)); }); }); },
  // 밀대 실험 : draw(g,W,H,v) · ok(v) 면 끝 · 아니면 hint(v)
  sim(hd,q,{min,max,step,val,unit,fmt=v=>v},draw,ok,hint){ return new Promise(res=>{ const p=this.panel(hd), W=1200, H=520;
    p.bd.innerHTML=`<p class="q">${q}</p><canvas width="${W}" height="${H}"></canvas><div class="row"><input type="range" min="${min}" max="${max}" step="${step}" value="${val}"><b class="val"></b><button class="go">확인</button></div>`;
    const cv=p.bd.querySelector('canvas'), g=cv.getContext('2d'), r=p.bd.querySelector('input'), vb=p.bd.querySelector('.val');
    let live=true; const loop=()=>{ if(!live) return; vb.textContent=fmt(+r.value)+(unit||''); draw(g,W,H,+r.value); setTimeout(loop,50); }; loop();
    p.bd.querySelector('.go').onclick=()=>{ const v=+r.value; if(ok(v)){ p.ok('맞아요'); live=false; setTimeout(()=>{ p.close(); res(v); },1400); } else p.no(hint(v)); }; }); },
  // 바늘이 초록 칸에 올 때 누르기 n 번 (Space · E)
  qte(hd,label,n=3){ return new Promise(res=>{ const p=this.panel(hd), W=1000, H=110;
    p.bd.innerHTML=`<p class="q">${label} — 바늘이 <b>초록 칸</b>에 들어오면 누르기 <span class="cnt"></span></p><canvas width="${W}" height="${H}"></canvas><div class="row"><button class="go">누르기 (Space)</button></div>`;
    const cv=p.bd.querySelector('canvas'), g=cv.getContext('2d'), cnt=p.bd.querySelector('.cnt'); let k=0, t=0, z0=0, zw=0, live=true, cool=0;
    const zone=()=>{ zw=.16-k*.025; z0=.15+Math.random()*(.7-zw); }; zone(); STORY._qte=()=>{ z0=0; zw=1; };
    const pos=()=>.5+.5*Math.sin(t*(2.4+k*.6));
    const loop=()=>{ if(!live) return; t+=.05; cool=Math.max(0,cool-.05); g.fillStyle='#05070a'; g.fillRect(0,0,W,H);
      g.fillStyle='rgba(233,231,226,.08)'; g.fillRect(20,40,W-40,30); g.fillStyle='rgba(109,255,176,.55)'; g.fillRect(20+z0*(W-40),40,zw*(W-40),30);
      const x=20+pos()*(W-40); g.fillStyle=cool?'#ff5a36':'#e9e7e2'; g.fillRect(x-4,26,8,58);
      for(let i=0;i<n;i++){ g.fillStyle=i<k?'#6dffb0':'rgba(233,231,226,.2)'; g.beginPath(); g.arc(W/2-(n-1)*18+i*36,100,8,0,7); g.fill(); }
      cnt.textContent=k+' / '+n; setTimeout(loop,30); }; loop();
    const hit=()=>{ if(!live||cool) return; const v=pos();
      if(v>=z0&&v<=z0+zw){ k++; AUDIO.tone(520+k*160,.15,'sine',.08); if(k>=n){ live=false; p.ok('완료'); removeEventListener('keydown',kb,true); setTimeout(()=>{ p.close(); res(); },900); } else { p.ok('좋아요'); zone(); } }
      else { cool=.6; AUDIO.tone(180,.2,'square',.05); p.no(v<z0?'조금 일찍 — 기다렸다가':'조금 늦게 — 더 빨리'); } };
    p.bd.querySelector('.go').onclick=hit; const kb=e=>{ if(e.code==='Space'||e.code==='KeyE'||e.code==='Enter'){ e.preventDefault(); e.stopPropagation(); hit(); } }; addEventListener('keydown',kb,true); }); },
};

/* ---- 공포 : 화면 · 소리 ---- */
const FXEL=id=>{ let e=document.getElementById(id); if(!e){ e=document.createElement('div'); e.id=id; document.body.appendChild(e); } return e; };
const STING=(v=1)=>{ AUDIO.noise(.8,.7*v,0,4200); AUDIO.tone(1500,.75,'sawtooth',.13*v,0,-1250); AUDIO.tone(52,1.1,'square',.12*v); AUDIO.tone(2300,.3,'square',.05*v,.05,-800); };
const SCREAM=(v=1)=>{ AUDIO.tone(620,1.1,'sawtooth',.07*v,0,380); AUDIO.tone(880,.9,'triangle',.05*v,.1,-300); AUDIO.noise(1,.15*v,0,1800); };
const GROWL=(v=.06)=>{ AUDIO.tone(70+Math.random()*30,1.6,'sawtooth',v,0,-30); AUDIO.noise(1.2,v*.8,0,260); };
const THUD=(v=.18)=>AUDIO.noise(.25,v,0,180);
const SQUELCH=(v=.2)=>{ AUDIO.noise(.35,v,0,700); AUDIO.tone(90,.3,'sine',v*.4,0,-40); };
const FX={
  black(op){ FXEL('blackout').style.opacity=op; },                          // 순간 암전 (1 = 완전히)
  flash(color='#ff2a10',ms=420){ const e=FXEL('flashfx'); e.style.transition='none'; e.style.background=color; e.style.opacity=.8; setTimeout(()=>{ e.style.transition=`opacity ${ms}ms`; e.style.opacity=0; },30); },
  shake(dur=.5,amp=.06){ let t=0; const f=dt=>{ t+=dt; const k=amp*Math.max(0,1-t/dur); camera.position.x+=(Math.random()-.5)*k; camera.position.y+=(Math.random()-.5)*k; camera.rotation.z=(Math.random()-.5)*k*.6; if(t>dur){ camera.rotation.z=0; TICK.splice(TICK.indexOf(f),1); } }; TICK.push(f); },
  // 조명이 이따금 끊긴다 → 멈추는 함수
  flicker(){ let next=1+Math.random()*2, off=0; const f=dt=>{ if(off>0){ off-=dt; if(off<=0) FX.black(0); return; } next-=dt;
      if(next<=0){ next=1.5+Math.random()*3.5; off=.06+Math.random()*.14; FX.black(.88); AUDIO.noise(.08,.05,0,6000); } };
    TICK.push(f); return ()=>{ const i=TICK.indexOf(f); if(i>=0) TICK.splice(i,1); FX.black(0); }; },
};
/* ---- 피 ---- */
const BLOOD={
  tex(){ return this._t||(this._t=(()=>{ const c=document.createElement('canvas'); c.width=c.height=32; const g=c.getContext('2d'), r=g.createRadialGradient(16,16,0,16,16,16); r.addColorStop(0,'rgba(120,8,6,1)'); r.addColorStop(.6,'rgba(90,4,3,.9)'); r.addColorStop(1,'rgba(60,0,0,0)'); g.fillStyle=r; g.fillRect(0,0,32,32); return new THREE.CanvasTexture(c); })()); },
  // 바닥 피 웅덩이 (얼룩진 가장자리 · 손전등에 젖은 빛)
  poolMat(){ return this._pm||(this._pm=(()=>{ const c=document.createElement('canvas'); c.width=c.height=256; const g=c.getContext('2d');
      for(let i=0;i<70;i++){ const x=128+(Math.random()-.5)*150*Math.random(), y=128+(Math.random()-.5)*150*Math.random(), r=10+Math.random()*48, gr=g.createRadialGradient(x,y,0,x,y,r);
        gr.addColorStop(0,'rgba(70,2,2,.95)'); gr.addColorStop(.7,'rgba(55,1,1,.8)'); gr.addColorStop(1,'rgba(40,0,0,0)'); g.fillStyle=gr; g.beginPath(); g.arc(x,y,r,0,7); g.fill(); }
      const t=new THREE.CanvasTexture(c); t.encoding=THREE.sRGBEncoding;
      return new THREE.MeshStandardMaterial({map:t,transparent:true,depthWrite:false,roughness:.15,metalness:.1,emissive:new THREE.Color(.25,.01,.01),emissiveMap:t,polygonOffset:true,polygonOffsetFactor:-4}); })()); },
  pool(x,z,s=1.6,y=0){ const m=new THREE.Mesh(new THREE.PlaneGeometry(s,s),this.poolMat()); m.rotation.set(-Math.PI/2,0,Math.random()*6); m.position.set(x,y+.012,z); m.renderOrder=2; WORLD.add(m); return m; },
  // 핏방울이 튄다 (p 에서 n 개 · 속도 spd)
  spray(p,n,spd,col){ const tex=this.tex(); for(let k=0;k<n;k++){ const sp=new THREE.Sprite(new THREE.SpriteMaterial({map:tex,transparent:true,depthWrite:false,color:col||0xffffff})); sp.scale.setScalar(.03+Math.random()*.06); sp.position.copy(p); WORLD.add(sp);
    const v=new THREE.Vector3(Math.random()-.5,Math.random()*.9+.2,Math.random()-.5).multiplyScalar(spd); let t=0; const fn=dt=>{ t+=dt; sp.position.addScaledVector(v,dt); v.y-=dt*7; if(sp.position.y<.02){ v.set(0,0,0); sp.position.y=.02; } if(t>1.4){ WORLD.remove(sp); TICK.splice(TICK.indexOf(fn),1); } }; TICK.push(fn); } },
  // 천장 한 점에서 떨어진다
  drip(x,y,z,dur=4){ const tex=this.tex(); let t=0, n=0; const f=dt=>{ t+=dt; if(t>dur){ TICK.splice(TICK.indexOf(f),1); return; } n+=dt*(6-t); while(n>1){ n--; const sp=new THREE.Sprite(new THREE.SpriteMaterial({map:tex,transparent:true,depthWrite:false})); sp.scale.setScalar(.03+Math.random()*.03); sp.position.set(x+(Math.random()-.5)*.25,y,z+(Math.random()-.5)*.25); WORLD.add(sp);
      let v=0; const g=dt=>{ v+=dt*9.8; sp.position.y-=v*dt; if(sp.position.y<.02){ WORLD.remove(sp); TICK.splice(TICK.indexOf(g),1); } }; TICK.push(g); } }; TICK.push(f); },
};

/* ---- 나 : 체력 · 웅크리기 · 권총 ---- */
const ME={hp:3,max:3,crouch:false,dead:false,onDeath:null,
  // 다치기 : 화면 가장자리에 피 · 흔들림 → 0 이면 onDeath
  hurt(n=1){ if(this.dead||S.phase!=='play') return; this.hp=Math.max(0,this.hp-n); FX.flash('#a00000',600); FX.shake(.4,.07); AUDIO.tone(160,.35,'sawtooth',.08,0,-80); AUDIO.noise(.3,.25,0,900); this.show();
    if(this.hp<=0){ this.dead=true; this.onDeath&&this.onDeath(); } },
  heal(){ this.hp=this.max; this.dead=false; this.show(); },
  show(){ const e=FXEL('hurtfx'); e.style.opacity=[.85,.55,.25,0][this.hp]||0; },
  // 웅크리기 : 눈높이 · 속도를 낮춘다 (가구 뒤에 숨으면 성체가 못 본다)
  setCrouch(on){ if(this.crouch===on) return; this.crouch=on; P.eye=on?1.0:1.66; P.speed=on?1.1:2.2; const b=$('#crouch'); if(b) b.classList.toggle('on',on); },
};
addEventListener('keydown',e=>{ if(e.code==='KeyC'&&!e.repeat&&S.phase==='play'&&P.free) ME.setCrouch(!ME.crouch); });

// 손에 든 펄스 권총 (gun.glb · 손잡이가 원점 · 총구 +x) : F 키 · [사격] 단추. 맞히면 GUN.targets 의 hit(t) 를 부른다
const GUN={held:null,kick:0,cool:0,targets:[],
  async hold(){ if(this.held){ if(!TICK.includes(this.fn)) TICK.push(this.fn); return; } const src=await loadGLB('gun'), g=new THREE.Group(); g.add(src);
    src.rotation.y=Math.PI/2;                      // 총구(+x) → 카메라 앞(−z)
    src.traverse(o=>{ if(o.isMesh){ o.frustumCulled=false; o.renderOrder=30; o.material.depthTest=true; } });
    camera.add(g); this.held=g; g.scale.setScalar(1.05);
    const fill=new THREE.PointLight(0xfff1dc,.7,1.2,2); fill.position.set(.1,.05,-.2); g.add(fill);      // 어둠 속에서도 손의 총이 보이게
    const muzzle=new THREE.Object3D(); muzzle.position.set(0,.03,-.2); g.add(muzzle); this.muzzle=muzzle;
    TICK.push(this.fn=dt=>{ if(!g.parent) return; this.kick=Math.max(0,this.kick-dt*7); this.cool=Math.max(0,this.cool-dt);
      g.position.set(.19,-.2+this.kick*.03+Math.sin(P.bob||0)*.006,-.42+this.kick*.06); g.rotation.set(this.kick*.25,.14,0); });      // 총구가 조준점 쪽으로 조금
    let b=$('#fire'); if(!b){ b=document.createElement('button'); b.id='fire'; b.className='ring'; b.textContent='사격'; $('#hud').appendChild(b); b.addEventListener('pointerdown',e=>{ e.stopPropagation(); GUN.shoot(); }); }
    b.classList.add('on');
    let c=$('#crouch'); if(!c){ c=document.createElement('button'); c.id='crouch'; c.className='ring small'; c.textContent='웅크림'; $('#hud').appendChild(c); c.addEventListener('pointerdown',e=>{ e.stopPropagation(); ME.setCrouch(!ME.crouch); AUDIO.click(); }); }
    c.classList.add('on');
    if(!this.fk){ this.fk=true; addEventListener('keydown',e=>{ if(e.code==='KeyF'&&!e.repeat) GUN.shoot(); }); } },
  drop(){ if(this.held){ camera.remove(this.held); this.held=null; } ['#fire','#crouch'].forEach(s=>{ const b=$(s); if(b) b.classList.remove('on'); }); },
  // 쏘기 : 화면 가운데로 · 가장 가까운 과녁 (과녁 = {center():Vector3, r, hit(), alive()})
  shoot(){ if(!this.held||S.phase!=='play'||TALK.on||this.cool>0) return; this.cool=.32; this.kick=1;
    AUDIO.noise(.12,.35,0,5200,'highpass'); AUDIO.tone(1800,.18,'sawtooth',.06,0,-1500); AUDIO.tone(120,.2,'sine',.08,0,-60);
    const o=camera.getWorldPosition(new THREE.Vector3()), d=camera.getWorldDirection(new THREE.Vector3());
    let hit=null, best=40;
    for(const t of this.targets){ if(t.alive&&!t.alive()) continue; const c=t.center(), k=c.clone().sub(o).dot(d); if(k<0||k>best) continue;
      if(o.clone().addScaledVector(d,k).distanceTo(c)<t.r&&clearShot(o,c)){ hit=t; best=k; } }
    // 벽에 막히면 거기까지
    let far=hit?best:40; if(!hit) for(let k=.5;k<40;k+=.25){ const p=o.clone().addScaledVector(d,k); if(SOLID.hit(p.x,p.z,p.y-.03,p.y+.03,.02)){ far=k; break; } }
    const m=this.muzzle.getWorldPosition(new THREE.Vector3()), end=o.clone().addScaledVector(d,far);
    // 레이저 빛줄기 · 총구 빛 · 맞은 자리 불꽃
    const beam=new THREE.Mesh(new THREE.CylinderGeometry(.012,.012,1,6,1,true),new THREE.MeshBasicMaterial({color:0xff9a50,transparent:true,opacity:.95,blending:THREE.AdditiveBlending,depthWrite:false,toneMapped:false}));
    const len=m.distanceTo(end); beam.scale.y=len; beam.position.copy(m).lerp(end,.5); beam.quaternion.setFromUnitVectors(new THREE.Vector3(0,1,0),end.clone().sub(m).normalize()); WORLD.add(beam);
    const fl=new THREE.PointLight(0xffa060,5,7,1.6); fl.position.copy(m); WORLD.add(fl);
    let t=0; const fade=dt=>{ t+=dt; beam.material.opacity=Math.max(0,.95-t*9); fl.intensity=Math.max(0,5-t*60); if(t>.12){ WORLD.remove(beam,fl); TICK.splice(TICK.indexOf(fade),1); } }; TICK.push(fade);
    if(hit) hit.hit(end,d); else BLOOD.spray(end,6,1.2,0xffb070); },
};
// 두 점 사이를 벽 · 가구가 막지 않나 (몸 충돌 칸으로)
function clearShot(a,b,step=.3){ const d=b.clone().sub(a), L=d.length(); d.normalize(); for(let k=.6;k<L-.5;k+=step){ const p=a.clone().addScaledVector(d,k); if(SOLID.hit(p.x,p.z,p.y-.04,p.y+.04,.03)) return false; } return true; }
