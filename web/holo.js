/* ============================================================
   HOLO : 함교 AR 항법 홀로그램 (홀로 테이블 위에 뜨는 3D 지도) · 함교 화면 UI (BRIDGEUI)
   보기 : solar(태양계) · jupiter(목성 근처 · 웜홀 진입 경로) · galaxy(은하 지도 — 웜홀을 지나면 NGC 3500 안에 있다)
   테이블을 누르면 AR 모드 : 카메라가 테이블 앞으로 · 끌면 홀로그램이 돈다 · 아래 버튼으로 보기를 바꾼다
   ============================================================ */
'use strict';
const HOLO=(()=>{ let root=null, cur=null, mode=null, yaw=0, tilt=.32, hold=0, spin=.12, beam=null, t=0, side='home'; const views={}, labels=[];
  const CY=0x7fd4ff, AL=0xff5a36, WH=0xeaf6ff;
  const add=(m)=>new THREE.MeshBasicMaterial({color:m.color??CY,transparent:true,opacity:m.op??.6,blending:THREE.AdditiveBlending,depthWrite:false,side:THREE.DoubleSide,wireframe:!!m.wire});
  const lmat=(c=CY,op=.55)=>new THREE.LineBasicMaterial({color:c,transparent:true,opacity:op,blending:THREE.AdditiveBlending,depthWrite:false});
  function ring(r,c,op,seg=128,dash=false){ const p=[]; for(let i=0;i<=seg;i++){ const a=i/seg*Math.PI*2; p.push(new THREE.Vector3(Math.cos(a)*r,0,Math.sin(a)*r)); }
    const g=new THREE.BufferGeometry().setFromPoints(p); if(dash){ const l=new THREE.LineSegments(g,lmat(c,op)); return l; } return new THREE.Line(g,lmat(c,op)); }
  function dot(r,c=CY,op=.9){ return new THREE.Mesh(new THREE.SphereGeometry(r,16,10),add({color:c,op})); }
  // 글씨 (카메라를 보는 판)
  function label(txt,c='#bfe9ff',sub=''){ const cv=document.createElement('canvas'); cv.width=512; cv.height=128; const g=cv.getContext('2d');
    g.font='600 44px "IBM Plex Sans KR",sans-serif'; g.fillStyle=c; g.fillText(txt,8,52); if(sub){ g.font='500 30px "IBM Plex Mono",monospace'; g.fillStyle='rgba(191,233,255,.7)'; g.fillText(sub,8,100); }
    const s=new THREE.Sprite(new THREE.SpriteMaterial({map:new THREE.CanvasTexture(cv),transparent:true,depthWrite:false,blending:THREE.AdditiveBlending})); s.scale.set(.32,.08,1); s.center.set(0,.5); labels.push(s); return s; }
  function trail(pts,c=AL,op=.8){ const g=new THREE.BufferGeometry().setFromPoints(pts.map(p=>new THREE.Vector3(...p))); return new THREE.Line(g,lmat(c,op)); }

  function build(){ root=new THREE.Group(); root.visible=false;
    // 테이블 위 빛기둥
    const bg=new THREE.CylinderGeometry(.95,1.05,.9,48,1,true), bm=new THREE.ShaderMaterial({transparent:true,depthWrite:false,blending:THREE.AdditiveBlending,side:THREE.DoubleSide,uniforms:{t:{value:0}},
      vertexShader:'varying vec2 vUv; void main(){ vUv=uv; gl_Position=projectionMatrix*modelViewMatrix*vec4(position,1.0); }',
      fragmentShader:'uniform float t; varying vec2 vUv; void main(){ float a=(1.0-vUv.y)*.16*(.8+.2*sin(vUv.y*80.0-t*6.0)); gl_FragColor=vec4(.45,.8,1.0,a); }'});
    beam=new THREE.Mesh(bg,bm); beam.position.y=-.1; root.add(beam);
    const base=ring(.98,CY,.5); base.position.y=-.52; root.add(base);

    /* 태양계 : 태양 · 행성 궤도 · 목성 + 웜홀 · 2호 */
    { const g=new THREE.Group(); const K=.085;      // 1 AU = 0.085 m
      g.add(dot(.035,0xffd27a,1)); const sl=label('태양','#ffe2a8'); sl.position.set(.04,.05,0); g.add(sl);
      [[.39,'수성'],[.72,'금성'],[1,'지구'],[1.52,'화성'],[5.2,'목성'],[9.5,'토성']].forEach(([a,n],i)=>{ const r=a*K; g.add(ring(r,CY,i===4?.8:.35));
        const p=dot(i===4?.024:.012,i===2?0x8fd0ff:CY); const ang=[1.2,2.6,-.4,.7,-.62,2.2][i]; p.position.set(Math.cos(ang)*r,0,Math.sin(ang)*r); g.add(p);
        const l=label(n); l.position.copy(p.position).add(new THREE.Vector3(.02,.035,0)); g.add(l); if(i===2) g.userData.earth=p; if(i===4) g.userData.jup=p; });
      const j=g.userData.jup.position, wh=dot(.028,AL,.9); wh.position.set(j.x+.07,0,j.z-.04); g.add(wh); const wr=ring(.05,AL,.9); wr.position.copy(wh.position); g.add(wr);
      const wl=label('웜홀','#ff9a80','목성에서 41만 km'); wl.position.copy(wh.position).add(new THREE.Vector3(.04,.06,0)); g.add(wl); g.userData.wr=wr;
      const e=g.userData.earth.position, pts=[]; for(let i=0;i<=40;i++){ const k=i/40; pts.push([lerp(e.x,j.x,k)+Math.sin(k*Math.PI)*.12,Math.sin(k*Math.PI)*.02,lerp(e.z,j.z,k)-Math.sin(k*Math.PI)*.08]); } g.add(trail(pts,AL,.7));
      const tl=label('2호 항로 · 214일','#ff9a80'); tl.position.set(pts[20][0],.06,pts[20][2]); g.add(tl);
      g.scale.setScalar(1.15); views.solar=g; root.add(g); }

    /* 목성 근처 : 목성 · 갈릴레이 위성 · 웜홀(렌즈 고리) · 진입 경로 */
    { const g=new THREE.Group();
      const jm=new THREE.Mesh(new THREE.SphereGeometry(.16,48,24),new THREE.MeshBasicMaterial({color:0xffffff,transparent:true,opacity:.55,blending:THREE.AdditiveBlending,depthWrite:false}));
      loadTex('jupiter_map.jpg').then(t=>{ jm.material.map=t; jm.material.needsUpdate=true; });
      g.add(jm); g.add(new THREE.Mesh(new THREE.SphereGeometry(.163,24,12),add({wire:true,op:.18}))); g.userData.jm=jm;
      const jl=label('목성','#ffe2c4','반지름 71,492 km'); jl.position.set(.12,.2,0); g.add(jl);
      [['이오',.27],['유로파',.36],['가니메데',.48],['칼리스토',.66]].forEach(([n,r],i)=>{ const rr=ring(r,CY,.28); g.add(rr); const m=dot(.01); const a=i*1.7; m.position.set(Math.cos(a)*r,0,Math.sin(a)*r); g.add(m); const l=label(n); l.position.copy(m.position).add(new THREE.Vector3(.015,.03,0)); l.scale.multiplyScalar(.8); g.add(l); });
      const W=new THREE.Vector3(.62,.04,-.46); const wh=new THREE.Group(); wh.position.copy(W); g.add(wh);
      wh.add(dot(.05,0x000000,1)); for(let k=0;k<4;k++){ const r=ring(.06+k*.018,k?CY:AL,k?.35-k*.07:1); r.rotation.x=Math.PI/2; wh.add(r); } wh.userData.spin=true; g.userData.wh=wh;
      const wl=label('웜홀','#ff9a80','질량 ≈ 목성 × 41'); wl.position.copy(W).add(new THREE.Vector3(.07,.1,0)); g.add(wl);
      const pts=[]; for(let i=0;i<=60;i++){ const k=i/60; const a=-2.4+k*2.6, r=.95-k*.3; pts.push([Math.cos(a)*r*(1-k)+W.x*k,.0+k*.04,Math.sin(a)*r*(1-k)+W.z*k]); } g.add(trail(pts,AL,.9));
      const ship=dot(.014,0xffffff,1); g.add(ship); g.userData.ship=ship; g.userData.path=pts;
      const sl=label('하위헌스 2호','#ffffff','진입까지 41만 km'); g.add(sl); g.userData.sl=sl;
      views.jupiter=g; root.add(g); }

    /* 은하 지도 : 나선 은하 (점) — home = 우리은하 · away = NGC 3500 */
    const spiral=(n,arms,tw,r0,col,bar=0)=>{ const p=new Float32Array(n*3), c=new Float32Array(n*3); const ca=new THREE.Color(col), cb=new THREE.Color(0xffe0b0);
      for(let i=0;i<n;i++){ const arm=i%arms, k=Math.pow(Math.random(),.6), r=r0*(.08+k*.92), a=arm/arms*Math.PI*2+Math.log(1+r/r0*6)*tw+(Math.random()-.5)*.5*(1-k*.4);
        let x=Math.cos(a)*r, z=Math.sin(a)*r; if(bar&&r<r0*.3){ x=(Math.random()-.5)*r0*.6; z=(Math.random()-.5)*r0*.12; }
        p[i*3]=x+(Math.random()-.5)*.02; p[i*3+1]=(Math.random()-.5)*.02*(1-k); p[i*3+2]=z+(Math.random()-.5)*.02; const m=ca.clone().lerp(cb,1-k); c[i*3]=m.r; c[i*3+1]=m.g; c[i*3+2]=m.b; }
      const g=new THREE.BufferGeometry(); g.setAttribute('position',new THREE.BufferAttribute(p,3)); g.setAttribute('color',new THREE.BufferAttribute(c,3));
      return new THREE.Points(g,new THREE.PointsMaterial({size:.008,vertexColors:true,transparent:true,opacity:.85,blending:THREE.AdditiveBlending,depthWrite:false})); };
    { const g=new THREE.Group(), home=new THREE.Group(), away=new THREE.Group();
      home.add(spiral(LITE?2600:5000,4,2.2,.75,0x9fd8ff,1)); const sun=dot(.012,0xffd27a,1); sun.position.set(.43,0,.18); home.add(sun);
      const sl=label('태양계 · 우리 위치','#ffe2a8','은하 중심에서 2만 6천 광년'); sl.position.copy(sun.position).add(new THREE.Vector3(.02,.05,0)); home.add(sl);
      const ml=label('우리은하','#bfe9ff','지름 약 10만 광년'); ml.position.set(-.5,.18,-.5); home.add(ml);
      away.add(spiral(LITE?2400:4600,2,2.8,.7,0xffc9a0,0)); const here=dot(.014,AL,1); here.position.set(-.36,0,.3); away.add(here); away.userData.here=here;
      const hl=label('현재 위치','#ff9a80','NGC 3500 · 바깥 나선팔'); hl.position.copy(here.position).add(new THREE.Vector3(.02,.05,0)); away.add(hl);
      const al=label('NGC 3500','#ffd9bf','우리은하가 아니다'); al.position.set(-.45,.2,-.45); away.add(al);
      // 멀리 있는 우리은하 (작은 점 + 점선)
      const far=spiral(600,4,2.2,.06,0x9fd8ff,1); far.position.set(.82,.25,-.78); away.add(far);
      const fl=label('우리은하','#bfe9ff','약 4억 3천만 광년'); fl.position.set(.7,.36,-.78); away.add(fl);
      const dl=new THREE.LineSegments(new THREE.BufferGeometry().setFromPoints((()=>{ const a=[]; for(let i=0;i<24;i++){ const k0=i/24, k1=(i+.5)/24; a.push(new THREE.Vector3(lerp(-.36,.82,k0),lerp(0,.25,k0),lerp(.3,-.78,k0)),new THREE.Vector3(lerp(-.36,.82,k1),lerp(0,.25,k1),lerp(.3,-.78,k1))); } return a; })()),lmat(AL,.6)); away.add(dl);
      g.add(home,away); g.userData.home=home; g.userData.away=away; views.galaxy=g; root.add(g); }
    Object.values(views).forEach(v=>{ v.visible=false; v.rotation.order='XYZ'; }); WORLD.add(root); return root; }

  function show(m){ mode=m; Object.entries(views).forEach(([k,v])=>v.visible=k===m); if(m==='galaxy'){ views.galaxy.userData.home.visible=side==='home'; views.galaxy.userData.away.visible=side==='away'; }
    document.querySelectorAll('#holoui .btns button').forEach(b=>b.classList.toggle('on',b.dataset.m===m)); AUDIO.tone(1200,.05,'sine',.05); AUDIO.tone(1800,.05,'sine',.04,.05); }
  function tick(dt){ if(!root||!root.visible) return; t+=dt; hold-=dt; if(hold<0) yaw+=spin*dt; if(cur) cur.rotation.y=yaw;
    Object.values(views).forEach(v=>{ v.rotation.set(tilt,yaw,0,'XYZ'); }); beam.material.uniforms.t.value=t;
    root.children.forEach(o=>{ if(o.material&&o.material.opacity!==undefined&&o!==beam) {} });
    const J=views.jupiter; if(J.visible){ J.userData.jm.rotation.y+=dt*.2; J.userData.wh.children.forEach((r,i)=>{ if(i) r.scale.setScalar(1+.08*Math.sin(t*2+i)); });
      const P=J.userData.path, k=(t*.06)%1, i=Math.floor(k*(P.length-1)); J.userData.ship.position.set(...P[i]); J.userData.sl.position.set(P[i][0]+.02,P[i][1]+.05,P[i][2]); }
    if(views.solar.visible) views.solar.userData.wr.scale.setScalar(1+.15*Math.sin(t*3));
    // 깜빡임 (홀로그램 느낌)
    root.traverse(o=>{ if(o.material&&o.material.blending===THREE.AdditiveBlending&&o.material.userData.op===undefined) o.material.userData.op=o.material.opacity; if(o.material&&o.material.userData.op!==undefined) o.material.opacity=o.material.userData.op*(.88+.12*Math.sin(t*23+o.id)); }); }
  return {build,show,tick,get root(){ return root; },get mode(){ return mode; },set side(v){ side=v; if(mode==='galaxy') show('galaxy'); },get side(){ return side; },set spin(v){ spin=v; },
    // 손으로 돌리기 : 좌우 끌기 = 돌리기 · 위아래 끌기 = 기울이기 · 두 손가락 / 휠 = 크게 작게 (끄는 동안과 뒤 3초는 저절로 돌지 않는다)
    rot(d,dt2=0){ yaw+=d; tilt=Math.max(-.35,Math.min(1.45,tilt+dt2)); hold=3; },
    zoom(k){ if(!root) return; const s0=root.userData.s0||(root.userData.s0=root.scale.x); root.scale.setScalar(Math.max(s0*.6,Math.min(s0*2.2,root.scale.x*k))); hold=3; },
    reset(){ tilt=.32; if(root&&root.userData.s0) root.scale.setScalar(root.userData.s0); }};
})();

/* ---------- 함교 화면 (캔버스 UI) ---------- */
const BRIDGEUI=(()=>{ const S={}; let acc=0, t=0; const F=(w,s)=>`${w} ${s}px "IBM Plex Sans KR",sans-serif`, M=(s,w=500)=>`${w} ${s}px "IBM Plex Mono",monospace`;
  const INK='#e6f2fa', MUTE='rgba(200,225,240,.6)', DIM='rgba(200,225,240,.32)', CY='#7fd4ff', AL='#ff5a36', BG='#03070b';
  // 맵의 IT_ 상자 앞면에 평면을 붙인다 (가장 얇은 축 = 화면이 보는 쪽, toward 쪽으로)
  function facePlane(item,toward){ item.updateMatrixWorld(true); item.geometry.computeBoundingBox(); const b=item.geometry.boundingBox, s=b.getSize(new THREE.Vector3()), c=b.getCenter(new THREE.Vector3());
    const ax=s.x<s.y&&s.x<s.z?'x':s.y<s.z?'y':'z', q=item.getWorldQuaternion(new THREE.Quaternion()), wc=c.clone().applyMatrix4(item.matrixWorld);
    const n=new THREE.Vector3(ax==='x'?1:0,ax==='y'?1:0,ax==='z'?1:0).applyQuaternion(q); if(n.dot(toward.clone().sub(wc))<0) n.negate();
    const dims=ax==='x'?[s.z,s.y]:ax==='y'?[s.x,s.z]:[s.x,s.y], up=new THREE.Vector3(0,ax==='y'?0:1,ax==='y'?-1:0).applyQuaternion(q);
    const m=new THREE.Mesh(new THREE.PlaneGeometry(dims[0],dims[1]),new THREE.MeshBasicMaterial({toneMapped:false}));
    const mx=new THREE.Matrix4().lookAt(new THREE.Vector3(),n.clone().negate(),up); m.quaternion.setFromRotationMatrix(mx); m.position.copy(wc).addScaledVector(n,s[ax]/2+.003);
    item.visible=false; WORLD.add(m); return {m,w:dims[0],h:dims[1]}; }
  function mount(key,item,toward,draw){ if(!item) return; const f=facePlane(item,toward), W=512, H=Math.round(512*f.h/f.w); const cv=document.createElement('canvas'); cv.width=W; cv.height=H;
    const tex=new THREE.CanvasTexture(cv); tex.encoding=THREE.sRGBEncoding; f.m.material.map=tex; f.m.material.needsUpdate=true; S[key]={g:cv.getContext('2d'),tex,W,H,draw,mesh:f.m}; }
  function tick(dt){ t+=dt; acc+=dt; if(acc<1/12) return; acc=0; for(const k in S){ const s=S[k]; const g=s.g; g.fillStyle=BG; g.fillRect(0,0,s.W,s.H); s.draw(g,s.W,s.H,t); s.tex.needsUpdate=true; } }
  function clear(){ for(const k in S) delete S[k]; }
  const T=(g,s,x,y,f,c,a='left')=>{ g.font=f; g.fillStyle=c; g.textAlign=a; g.fillText(s,x,y); g.textAlign='left'; };
  const head=(g,W,id,name)=>{ g.fillStyle='rgba(127,212,255,.08)'; g.fillRect(0,0,W,34); g.fillStyle=CY; g.fillRect(0,0,4,34); T(g,id,14,23,M(14),CY); T(g,name,W-12,23,F(500,15),MUTE,'right'); };
  return {mount,tick,clear,mesh:k=>S[k]&&S[k].mesh,T,head,F,M,INK,MUTE,DIM,CY,AL};
})();
