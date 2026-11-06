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
    p.bd.innerHTML=`<p class="q">${label} — 바늘이 <b>초록 칸</b>에 들어오면 누르기 <span class="cnt"></span></p><canvas width="${W}" height="${H}"></canvas><div class="row"><button class="go">${byDevice('누르기 (Space)','누르기')}</button></div>`;
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
// 조작 글 : 키보드 / 터치 (디벗)
const byDevice=(kb,touch)=>IS_TOUCH?touch:kb;
const FXEL=id=>{ let e=document.getElementById(id); if(!e){ e=document.createElement('div'); e.id=id; document.body.appendChild(e); } return e; };
const STING=(v=1)=>{ AUDIO.noise(.8,.7*v,0,4200); AUDIO.tone(1500,.75,'sawtooth',.13*v,0,-1250); AUDIO.tone(52,1.1,'square',.12*v); AUDIO.tone(2300,.3,'square',.05*v,.05,-800); };
const SCREAM=(v=1)=>{ AUDIO.tone(620,1.1,'sawtooth',.07*v,0,380); AUDIO.tone(880,.9,'triangle',.05*v,.1,-300); AUDIO.noise(1,.15*v,0,1800); };
const GROWL=(v=.06,at)=>SFX.play('beast_growl',{vol:Math.min(1,v*10),at});
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
      g.fillStyle='rgb(44,2,2)'; const blob=(x,y,rx,ry,a)=>{ g.beginPath(); g.ellipse(x,y,rx,ry,a,0,7); g.fill(); };
      for(let i=0;i<150;i++){ const a=Math.random()*6.28, d=Math.pow(Math.random(),.8)*74, r=(3+Math.random()*20)*(1-d/105); blob(128+Math.cos(a)*d,128+Math.sin(a)*d,r,r*(.55+Math.random()*.45),a); }      // 웅덩이 : 작은 덩이를 겹쳐 가장자리가 들쭉날쭉
      for(let i=0;i<46;i++){ const a=Math.random()*6.28, d=66+Math.random()*50, l=.5+Math.random()*3.6; blob(128+Math.cos(a)*d,128+Math.sin(a)*d,l,l*.32,a); }      // 튄 자국 : 바깥쪽으로 길쭉하게
      const t=new THREE.CanvasTexture(c); t.encoding=THREE.sRGBEncoding;
      return new THREE.MeshStandardMaterial({map:t,transparent:true,depthWrite:false,roughness:.34,metalness:0,emissive:new THREE.Color(.08,.003,.003),emissiveMap:t}); })()); },
  pool(x,z,s=1.6,y=0){ const m=new THREE.Mesh(new THREE.PlaneGeometry(s,s),this.poolMat()); m.rotation.set(-Math.PI/2,0,Math.random()*6); m.position.set(x,y+.036,z); m.renderOrder=2; WORLD.add(m); return m; },      // 복도 바닥 면이 3 cm 높다 — 그 위로
  // 핏방울이 튄다 (p 에서 n 개 · 속도 spd)
  spray(p,n,spd,col){ const tex=this.tex(); for(let k=0;k<n;k++){ const sp=new THREE.Sprite(new THREE.SpriteMaterial({map:tex,transparent:true,depthWrite:false,color:col||0xffffff})); sp.scale.setScalar(.03+Math.random()*.06); sp.position.copy(p); WORLD.add(sp);
    const v=new THREE.Vector3(Math.random()-.5,Math.random()*.9+.2,Math.random()-.5).multiplyScalar(spd); let t=0; const fn=dt=>{ t+=dt; sp.position.addScaledVector(v,dt); v.y-=dt*7; if(sp.position.y<.02){ v.set(0,0,0); sp.position.y=.02; } if(t>1.4){ WORLD.remove(sp); TICK.splice(TICK.indexOf(fn),1); } }; TICK.push(fn); } },
  // 끌린 자국 : (x,z) 에서 ang 쪽으로 len m — 길게 번진 핏줄기가 끝으로 갈수록 옅어진다 (몸은 x,z 에 있다)
  trail(x,z,ang,len=3,w=.6){ if(!this._tr) this._tr=[0,1].map(()=>{ const c=document.createElement('canvas'); c.width=128; c.height=512; const g=c.getContext('2d');
        for(let i=0;i<46;i++){ const px=20+Math.random()*88, y0=Math.random()*150, y1=y0+90+Math.random()*(400-y0), wd=2+Math.random()*13, gr=g.createLinearGradient(0,y0,0,y1), a=.5+Math.random()*.4; gr.addColorStop(0,`rgba(62,2,2,${a})`); gr.addColorStop(.75,`rgba(52,1,1,${a*.55})`); gr.addColorStop(1,'rgba(40,0,0,0)');
          g.strokeStyle=gr; g.lineWidth=wd; g.lineCap='round'; g.beginPath(); g.moveTo(px,y0); g.bezierCurveTo(px+(Math.random()-.5)*16,y0+80,px+(Math.random()-.5)*24,y1-80,px+(Math.random()-.5)*20,y1); g.stroke(); }
        for(let i=0;i<5;i++){ const y=420+Math.random()*80, s=12+Math.random()*16; g.fillStyle='rgba(30,0,0,.22)'; g.fillRect(24+Math.random()*80,y,s,3); }      // 끝자락의 손톱 자국
        const t=new THREE.CanvasTexture(c); t.encoding=THREE.sRGBEncoding; return new THREE.MeshStandardMaterial({map:t,transparent:true,depthWrite:false,roughness:.36,metalness:0,emissive:new THREE.Color(.08,.003,.003),emissiveMap:t}); });
    const m=new THREE.Mesh(new THREE.PlaneGeometry(w,len),this._tr[Math.random()<.5?0:1]), cx=x+Math.sin(ang)*len/2, cz=z+Math.cos(ang)*len/2; m.rotation.order='YXZ'; m.rotation.set(-Math.PI/2,ang+Math.PI,0); m.position.set(cx,floorAt(cx,cz)+.038,cz); m.renderOrder=2; WORLD.add(m); return m; },
  // 찢긴 옷 조각 : 몸 둘레 바닥에 — 들쭉날쭉한 조각 n 개를 한 덩어리로 (그리기 한 번) · cols = 옷 색들
  scraps(x,z,n=7,cols=[[.26,.28,.3]],R=1.5){ const P3=[], C3=[]; for(let i=0;i<n;i++){ const a=Math.random()*6.28, d=.35+Math.random()*R, cx=x+Math.sin(a)*d, cz=z+Math.cos(a)*d; if(SOLID.hit(cx,cz,.04,.3,.05)) continue; const y0=floorAt(cx,cz)+.04, rot=Math.random()*6.28, long=Math.random()<.4?2.6:1.1, r0=.05+Math.random()*.11, col=cols[i%cols.length], bl=Math.random(), K=9;
      const rim=[]; for(let k=0;k<K;k++){ const t=k/K*6.28, r=r0*(.45+Math.random()*.75), lx=Math.cos(t)*r*long, lz=Math.sin(t)*r; rim.push([cx+lx*Math.cos(rot)-lz*Math.sin(rot),y0+Math.random()*.018,cz+lx*Math.sin(rot)+lz*Math.cos(rot)]); }
      const tint=b=>b?[.07,.004,.004]:col.map(v=>v*(.3+Math.random()*.2)); for(let k=0;k<K;k++){ const p=rim[k], q=rim[(k+1)%K]; P3.push(cx,y0+.012,cz,...p,...q); C3.push(...tint(bl<.45),...tint(bl<.75&&Math.random()<.5),...tint(bl<.75&&Math.random()<.5)); } }
    if(!P3.length) return null; const g=new THREE.BufferGeometry(); g.setAttribute('position',new THREE.Float32BufferAttribute(P3,3)); g.setAttribute('color',new THREE.Float32BufferAttribute(C3,3)); g.computeVertexNormals();
    const m=new THREE.Mesh(g,this._sc||(this._sc=new THREE.MeshStandardMaterial({vertexColors:true,roughness:.92,metalness:0,side:THREE.DoubleSide}))); WORLD.add(m); return m; },
  // 천장 한 점에서 떨어진다
  drip(x,y,z,dur=4){ const tex=this.tex(); let t=0, n=0; const f=dt=>{ t+=dt; if(t>dur){ TICK.splice(TICK.indexOf(f),1); return; } n+=dt*(6-t); while(n>1){ n--; const sp=new THREE.Sprite(new THREE.SpriteMaterial({map:tex,transparent:true,depthWrite:false})); sp.scale.setScalar(.03+Math.random()*.03); sp.position.set(x+(Math.random()-.5)*.25,y,z+(Math.random()-.5)*.25); WORLD.add(sp);
      let v=0; const g=dt=>{ v+=dt*9.8; sp.position.y-=v*dt; if(sp.position.y<.02){ WORLD.remove(sp); TICK.splice(TICK.indexOf(g),1); } }; TICK.push(g); } }; TICK.push(f); },
};

/* ---- 몸에 칠하기 : 피 · 찢김 · 때 ----
   모델의 그림(map)을 캔버스로 옮기고, 몸의 자리(blob)에 드는 삼각형을 그림 위 좌표(UV)로 칠한다 — 그림이 조각나 있어도 몸에서는 한 자리에 묻는다
   blob = [좌우 0~1, 아래위 0~1, 뒤앞 0~1 (몸 상자 안 비율), 반지름(키 대비), 종류] · 종류 : b 피 · o 마른 피 · w 깊은 상처 · t 찢김 (세로로 긴 틈)
   grime : 전체를 곱해 어둡게 · desat : 채도 빼기 · matte : 번들거림 없애기 */
const WEAR={INK:{b:'rgba(50,3,3,.93)',o:'rgba(26,7,5,.88)',w:'rgba(16,0,0,.97)',t:'rgba(8,4,4,.96)'},
  // 삼각형 목록 만들기 (모델 공간 위치 · 그림 좌표) — 메시마다 캔버스 하나
  paint(root,{blobs=[],grime=[.6,.56,.52],desat=0,matte=false,size=LITE?512:1024}={}){ root.updateMatrixWorld(true); const inv=new THREE.Matrix4().copy(root.matrixWorld).invert(), box=new THREE.Box3(), v=new THREE.Vector3(), M=[];
    root.traverse(o=>{ if(!o.isMesh||!o.geometry.attributes.position||o.material===PICK) return; const pos=o.geometry.attributes.position, mt=new THREE.Matrix4().multiplyMatrices(inv,o.matrixWorld), pts=new Float32Array(pos.count*3); for(let i=0;i<pos.count;i++){ v.fromBufferAttribute(pos,i).applyMatrix4(mt); box.expandByPoint(v); pts.set([v.x,v.y,v.z],i*3); } M.push({o,pts}); });
    const sz=box.getSize(new THREE.Vector3()), H=Math.max(sz.x,sz.y,sz.z), out=[];
    for(const {o,pts} of M){ const src=o.material, uv=o.geometry.attributes.uv, mat=src.clone(); o.material=mat; mat.envMapIntensity=.3; if(matte){ mat.roughness=1; mat.metalness=0; }
      if(!src.map||!src.map.image||!uv){ mat.color.setRGB(mat.color.r*grime[0],mat.color.g*grime[1],mat.color.b*grime[2]); if(desat){ const l=(mat.color.r+mat.color.g+mat.color.b)/3; mat.color.lerp(new THREE.Color(l,l,l),desat); } continue; }
      const c=document.createElement('canvas'); c.width=c.height=size; const g=c.getContext('2d'); g.drawImage(src.map.image,0,0,size,size);
      if(desat){ g.globalCompositeOperation='saturation'; g.fillStyle=`rgba(0,0,0,${desat})`; g.fillRect(0,0,size,size); }
      g.globalCompositeOperation='multiply'; g.fillStyle=`rgb(${grime.map(k=>Math.round(k*255)).join(',')})`; g.fillRect(0,0,size,size); g.globalCompositeOperation='source-over';
      const arr=uv.array||uv.data.array, un=uv.normalized?(arr instanceof Uint16Array?1/65535:arr instanceof Uint8Array?1/255:1):1, xf=src.map.matrix, idx=o.geometry.index; src.map.updateMatrix();
      const U=new Float32Array(uv.count*2), w=new THREE.Vector3(); for(let i=0;i<uv.count;i++){ w.set(uv.getX(i)*un,uv.getY(i)*un,1).applyMatrix3(xf); U[i*2]=w.x; U[i*2+1]=w.y; }
      const tex=new THREE.CanvasTexture(c); tex.encoding=THREE.sRGBEncoding; tex.flipY=false; tex.wrapS=src.map.wrapS; tex.wrapT=src.map.wrapT; tex.offset.copy(src.map.offset); tex.repeat.copy(src.map.repeat); tex.rotation=src.map.rotation; tex.center.copy(src.map.center); tex.anisotropy=src.map.anisotropy; mat.map=tex; mat.needsUpdate=true;
      const part={g,c,tex,pts,U,idx,n:idx?idx.count:pts.length/3}; out.push(part); this.ink(part,blobs,box,sz,H); }
    return {add:bl=>out.forEach(p=>this.ink(p,bl,box,sz,H))}; },
  ink(p,blobs,box,sz,H){ const {g,U,pts,idx,n,c}=p, S0=c.width, sd=(i)=>{ const x=Math.sin(i*127.1)*43758.5; return x-Math.floor(x); }; const Bs=blobs.map(([x,y,z,r,k])=>({x:box.min.x+x*sz.x,y:box.min.y+y*sz.y,z:box.min.z+z*sz.z,r:r*H,k}));
    for(const b of Bs){ g.fillStyle=g.strokeStyle=this.INK[b.k]||this.INK.b; g.lineWidth=1.5; g.beginPath(); let hit=0;
      for(let t=0;t+2<n;t+=3){ const a=idx?idx.getX(t):t, e=idx?idx.getX(t+1):t+1, f=idx?idx.getX(t+2):t+2, cx=(pts[a*3]+pts[e*3]+pts[f*3])/3, cy=(pts[a*3+1]+pts[e*3+1]+pts[f*3+1])/3, cz=(pts[a*3+2]+pts[e*3+2]+pts[f*3+2])/3;
        const dx=cx-b.x, dy=(cy-b.y)*(b.k==='t'?.3:1), dz=(cz-b.z)*(b.k==='t'?1:1), wx=b.k==='t'?dx*2.6:dx, d=Math.sqrt(wx*wx+dy*dy+dz*dz); if(d>b.r*(.62+sd(t)*.7)) continue;
        g.moveTo(U[a*2]*S0,U[a*2+1]*S0); g.lineTo(U[e*2]*S0,U[e*2+1]*S0); g.lineTo(U[f*2]*S0,U[f*2+1]*S0); g.closePath(); hit++; }
      if(hit){ g.fill(); g.stroke(); } } p.tex.needsUpdate=true; },
};

/* ---- 나 : 체력 · 웅크리기 · 권총 ---- */
const ME={hp:3,max:3,crouch:false,dead:false,onDeath:null,
  // 다치기 : 화면 가장자리에 피 · 흔들림 → 0 이면 onDeath
  hurt(n=1){ if(this.dead||S.phase!=='play') return; this.hp=Math.max(0,this.hp-n); FX.flash('#a00000',600); FX.shake(.4,.07); AUDIO.tone(160,.35,'sawtooth',.08,0,-80); AUDIO.noise(.3,.25,0,900); this.show();
    if(this.hp<=0){ this.dead=true; this.onDeath&&this.onDeath(); } },
  heal(){ this.hp=this.max; this.dead=false; this.show(); },
  show(){ const e=FXEL('hurtfx'); e.style.opacity=[.85,.55,.25,0][this.hp]||0; },
  // 웅크리기 : 눈높이 · 속도를 낮춘다 (가구 뒤에 숨으면 성체가 못 본다)
  setCrouch(on){ if(this.crouch===on) return; this.crouch=on; P.eye=on?1.0:1.66; P.speed=on?1.1:2.2; const b=$('#crouch'); if(b) b.classList.toggle('on2',on); },
};
addEventListener('keydown',e=>{ if(e.code==='KeyC'&&!e.repeat&&S.phase==='play'&&P.free) ME.setCrouch(!ME.crouch); });

// 손에 든 펄스 권총 (gun.glb · 손잡이가 원점 · 총구 +x) : F 키 · [사격] 단추. 맞히면 GUN.targets 의 hit(t) 를 부른다
const GUN={held:null,kick:0,cool:0,targets:[],
  async hold(){ if(this.held){ if(!TICK.includes(this.fn)) TICK.push(this.fn); return; } const src=await loadGLB('gun'), g=new THREE.Group(); g.add(src);
    src.rotation.y=Math.PI/2;                      // 총구(+x) → 카메라 앞(−z)
    src.traverse(o=>{ if(o.isMesh){ o.frustumCulled=false; o.renderOrder=30; o.material.depthTest=true; } });
    camera.add(g); this.held=g; g.scale.setScalar(1.05);
    const fill=new THREE.PointLight(0xfff1dc,.7,1.2,2); fill.position.set(.1,.05,-.2); g.add(fill); this.fill=fill; this.body=src;      // 어둠 속에서도 손의 총이 보이게
    const muzzle=new THREE.Object3D(); muzzle.position.set(0,.03,-.2); g.add(muzzle); this.muzzle=muzzle;
    TICK.push(this.fn=dt=>{ if(!g.parent) return; this.kick=Math.max(0,this.kick-dt*7); this.cool=Math.max(0,this.cool-dt);
      g.position.set(.19,-.2+this.kick*.03+Math.sin(P.bob||0)*.006,-.42+this.kick*.06); g.rotation.set(this.kick*.25,.14,0); });      // 총구가 조준점 쪽으로 조금
    let b=$('#fire'); if(!b){ b=document.createElement('button'); b.id='fire'; b.className='ring'; b.textContent='사격'; $('#hud').appendChild(b); b.addEventListener('pointerdown',e=>{ e.stopPropagation(); GUN.shoot(); }); }
    b.classList.add('on');
    let c=$('#crouch'); if(!c){ c=document.createElement('button'); c.id='crouch'; c.className='ring small'; c.textContent='웅크림'; $('#hud').appendChild(c); c.addEventListener('pointerdown',e=>{ e.stopPropagation(); ME.setCrouch(!ME.crouch); AUDIO.click(); }); }
    c.classList.add('on');
    if(!this.fk){ this.fk=true; addEventListener('keydown',e=>{ if(e.code==='KeyF'&&!e.repeat) GUN.shoot(); }); } },
  // 애벌레가 얼굴에 붙으면 : 총은 가려지고 · 그 빛이 얼굴 앞의 살을 비춘다 (빛 개수를 바꾸면 화면이 멈칫하니 옮기기만 한다)
  face(on){ if(!this.held) return; this.body.visible=!on; this.fill.position.set(on?-.19:.1,on?.26:.05,on?.22:-.2); this.fill.intensity=on?1.8:.7; this.fill.distance=on?2.4:1.2; },
  drop(){ if(this.held){ camera.remove(this.held); this.held=null; } ['#fire','#crouch'].forEach(s=>{ const b=$(s); if(b) b.classList.remove('on'); }); },
  // 쏘기 : 화면 가운데로 · 가장 가까운 과녁 (과녁 = {center():Vector3, r, hit(), alive()})
  // 맞힌 표시 : 조준점이 잠깐 빨갛게 (죽이면 더 크게)
  marker(kill){ const r=$('#reticle'); r.classList.remove('hit','kill'); void r.offsetWidth; r.classList.add(kill?'kill':'hit'); setTimeout(()=>r.classList.remove('hit','kill'),kill?420:180); },
  shoot(){ if(LARVA.grab){ LARVA.struggle(); return; } if(!this.held||S.phase!=='play'||TALK.on||this.cool>0||HIDE.in) return; this.cool=.32; this.kick=1;
    SFX.play('shot');
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
// 얼굴에 달라붙었을 때 : 화면 · E 연타도 떼어 내기
addEventListener('pointerdown',()=>{ if(LARVA.grab) LARVA.struggle(); },{capture:true});
addEventListener('keydown',e=>{ if(LARVA.grab&&(e.code==='KeyE'||e.code==='Space')&&!e.repeat) LARVA.struggle(); });
