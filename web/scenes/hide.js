/* ============================================================
   숨기 (4.9) — 진짜로 들어가 숨는 곳 다섯 가지 · 방마다 둘 넘게 · 그 방에 있을 법한 것만 (복도에 옷장을 세워 두지 않는다)
   옷장(locker.glb · 그물 문 두 짝) : 문을 열고 → 들어가 돌아서고 → 문을 닫는다 — 그물 틈으로 밖이 보인다
   침대(bed.glb · 철제 병원 침대) : 옆에 웅크리고 → 엎드려 → 밑으로 기어 들어간다 — 매트리스 아래로 바닥만 보인다
   화물 상자(crate.glb · blender/06_숨는곳_화물상자.blend — 뚜껑 lid 가 뒤 경첩으로 열린다) : 뚜껑을 열고 → 들어가 웅크리고 → 닫는다 — 앞판 틈으로 내다본다
   동면 캡슐(동면 구역 C 의 빈 캡슐) : 올라가 눕는다 — 서리 낀 유리 너머로 본다
   환기 덕트(duct.glb · blender/07_숨는곳_환기덕트.blend — 벽 아래의 네모난 환기구 body · 위 경첩으로 들리는 격자 grille · 벽을 타고 올라가는 수직 덕트 riser) : 격자를 들고 → 돌아앉아 엎드려 발부터 밀고 들어가 → 격자를 당겨 닫는다 — 격자 살 틈으로 바닥 높이에서 내다본다
     복도 · 함교 · 라운지 · 기관실
   4.10 — 방마다 그 방의 물건으로 (blender/08_숨는곳_방마다.blend · 옷장을 이름만 바꿔 쓰던 것을 없앴다)
     실험대 수납장(bench.glb · 연구실) : 무릎을 꿇고 아래 문 둘을 열고 → 기어 들어가 → 문을 거의 닫는다 — 문틈으로 내다본다
     제염 샤워 부스(shower.glb · 연구실) : 서리 유리문을 옆으로 밀고 → 들어가 돌아서 → 닫는다 — 뿌연 유리 너머 그림자만 보인다
     배관 틈(pipes.glb · 기관실 — Sketchfab 배관 묶음) : 옆으로 몸을 비틀어 배관과 벽 사이로 → 배관 사이 틈으로 본다
     우주복 걸이(suits.glb · 에어록 — Sketchfab Spacesuit) : 걸린 우주복 둘을 헤치고 그 뒤 벽에 붙는다 — 우주복 사이로 본다 (우주복이 흔들린다)
     방호복 보관함(기관실) : 옷장 모양이지만 노란 칠 · 방사능 표지
   규칙 (scenes/stalk.js 의 성체) : 성체가 '보기 전에' 숨으면 못 찾는다 — 앞을 지나가다 사라진다 · 보는 앞에서 숨으면 끌어낸다 (숨 참기는 없앴다 — 숨으면 산다)
   ============================================================ */
'use strict';
const HIDE={in:null,spots:[],seen:false,busy:false,
  NAME:{locker:'옷장 — 들어가 숨는다',bed:'침대 — 밑으로 기어 들어가 숨는다',crate:'화물 상자 — 들어가 뚜껑을 닫는다',pod:'동면 캡슐 — 들어가 눕는다',duct:'환기 덕트 — 엎드려 들어가 숨는다',
    bench:'실험대 수납장 — 기어 들어가 문을 닫는다',shower:'제염 샤워 부스 — 들어가 문을 닫는다',pipes:'배관 틈 — 몸을 비틀어 들어간다',suits:'우주복 걸이 — 우주복 뒤에 숨는다'},
  LOCKNAME:{engine:'방호복 보관함'},
  // 방마다 (1호 좌표) — 벽에 등을 대고 (BACK : 그 물건의 원점에서 등판까지), 침대 · 상자는 빈 바닥에 (상자도 벽이 가까우면 등을 댄다)
  LOCK:[[58.5,-.6]],                                                  // 기관실 방호복 보관함 (노란 칠 · 방사능 표지)
  WALLED:[['pipes',56.1,16.8],['bench',44.5,1.4],['shower',32.6,5.2],['suits',51.3,6.4]],      // 기관실 배관 틈 · 연구실 실험대 · 제염 샤워 · 에어록 우주복 걸이 (동면 구역은 캡슐 둘)
  BACK:{pipes:.6,bench:.44,shower:.6,suits:.6},
  // 벽 환기 덕트 : 중앙 복도 넷 · 함교 둘 · 라운지 둘 · 기관실 둘
  DUCT:[[6.5,10.9],[21,11.2],[33,9.9],[44.5,11.2],[-4.6,5],[4.6,-.4],[10.8,15],[30.2,19],[61.2,-.6],[60,21.4]],
  BEDS:[[11.2,-5.4],[17.2,-5.4]],                                       // 의무실 침대 (라운지에 병원 침대는 두지 않는다)
  CRATE:[[36.5,1.6],[57,1.6],[69,19.6],[27.5,25.4],[4.6,6.4],[16.5,-1.5]],
  PODS:['L4','R3'],
  async setup(){ this.spots=[]; this.in=null; this.busy=false; const [lk,bd,cr,du,...room]=await Promise.all(['locker','bed','crate','duct','pipes','bench','shower','suits'].map(loadGLB)), RM={pipes:room[0],bench:room[1],shower:room[2],suits:room[3]};
    for(const [x,z] of this.LOCK){ const w=this.wall(x,z); if(!w||SOLID.hit(w.x+Math.sin(w.yaw)*.9,w.z+Math.cos(w.yaw)*.9,.2,1.6,.3)) continue;      // 문 앞이 비어 있어야 들어간다
      const o=lk.clone(true), dl=o.getObjectByName('door_L'), dr=o.getObjectByName('door_R');
      o.position.set(w.x,floorAt(w.x,w.z),w.z); o.rotation.y=w.yaw; WORLD.add(o); LEVEL.solids.push(o);
      if(SHIP.zoneAt(w.x,w.z)==='engine') this.hazmat(o);
      this.add({kind:'locker',o,dl,dr,x:w.x,z:w.z,yaw:w.yaw}); }
    // 방마다의 물건 : 벽에 등을 대고 · 앞(들어가는 쪽)이 비어 있어야
    for(const [kind,x,z] of this.WALLED){ const w=this.wall(x,z,2.2,this.BACK[kind]); if(!w) continue; const ws={x:w.x,z:w.z,yaw:w.yaw}, ent=kind==='pipes'?this.local(ws,1.3,.3):this.front(ws,1.0), mid=this.front(ws,.45);
      if(SOLID.hit(ent.x,ent.z,.2,1.6,.3)||SOLID.hit(w.x,w.z,.2,1.6,.35)||SOLID.hit(mid.x,mid.z,.2,1.6,.3)) continue;      // 들어가는 자리 · 놓일 자리가 비어 있어야
      const o=RM[kind].clone(true); o.traverse(m=>{ if(m.isMesh){ m.material=m.material.clone(); m.material.envMapIntensity=.35; if(/glass/i.test(m.material.name)){ m.material.transparent=true; m.material.depthWrite=false; m.material.opacity=/frost/.test(m.material.name)?.55:.25; } } });
      o.position.set(w.x,floorAt(w.x,w.z),w.z); o.rotation.y=w.yaw; WORLD.add(o); LEVEL.solids.push(o);
      const s={kind,o,x:w.x,z:w.z,yaw:w.yaw}; if(kind==='bench'){ s.dl=o.getObjectByName('door_L'); s.dr=o.getObjectByName('door_R'); } if(kind==='shower') s.door=o.getObjectByName('door');
      if(kind==='suits') s.suits=['suit_L','suit_R'].map(n=>o.getObjectByName(n)).filter(Boolean);
      this.add(s); }
    for(const [x0,z0] of this.BEDS){ const [x,z]=freeSpot(x0,z0,{r:1,y1:.05,y2:1.4}); const o=bd.clone(true); o.scale.setScalar(.01); o.position.set(x,floorAt(x,z),z); WORLD.add(o); LEVEL.solids.push(o);
      this.add({kind:'bed',o,x,z,yaw:0}); }
    for(const [x0,z0] of this.CRATE){ let [x,z]=freeSpot(x0,z0,{r:.95,y1:.05,y2:1.2}), yaw=0; const w=this.wall(x,z,2.2); if(w){ x=w.x+Math.sin(w.yaw)*.22; z=w.z+Math.cos(w.yaw)*.22; yaw=w.yaw; }
      if(SOLID.hit(x+Math.sin(yaw)*1.2,z+Math.cos(yaw)*1.2,.2,1.6,.3)) continue;
      const o=cr.clone(true), lid=o.getObjectByName('lid'); o.traverse(m=>{ if(m.isMesh){ m.material=m.material.clone(); m.material.side=THREE.DoubleSide; m.material.envMapIntensity=.3; } });
      o.position.set(x,floorAt(x,z),z); o.rotation.y=yaw; WORLD.add(o); LEVEL.solids.push(o);
      this.add({kind:'crate',o,lid,x,z,yaw}); }
    // 환기 덕트 : 낮은 높이에서 가장 가까운 벽에 등을 붙인다 · 복도에서는 벽 아래 배관 띠에 반쯤 묻는다(0.2 m 만 나온다 — 좁은 복도를 막지 않게) · 앞 바닥이 비어 있어야 엎드린다
    for(const [x,z] of this.DUCT){ const hall=SHIP.zoneAt(x,z)==='hall', w=this.wall(x,z,2.6,hall?-.2:0,.15,.7); if(!w||SOLID.hit(w.x+Math.sin(w.yaw)*1.15,w.z+Math.cos(w.yaw)*1.15,.2,1.6,.3)) continue;
      const o=du.clone(true), lid=o.getObjectByName('grille'), up=o.getObjectByName('riser'); if(up) up.visible=hall;      // 벽을 타고 올라가는 수직 덕트는 복도에서만 (방 안에서는 창 · 화면을 가린다)
      o.traverse(m=>{ if(m.isMesh){ m.material=m.material.clone(); m.material.envMapIntensity=.35; } });
      o.position.set(w.x,floorAt(w.x+Math.sin(w.yaw)*.9,w.z+Math.cos(w.yaw)*.9),w.z); o.rotation.y=w.yaw; WORLD.add(o); LEVEL.solids.push(o);
      this.add({kind:'duct',o,lid,x:w.x,z:w.z,yaw:w.yaw}); }
    // 동면 캡슐 : rooms.js 가 놓은 빈(열린) 캡슐 — 통로 쪽에서 올라간다
    const pods=SHIP.rooms&&SHIP.rooms.cryo&&SHIP.rooms.cryo.pods||{}; for(const k of this.PODS){ const p=pods[k]; if(!p) continue; this.add({kind:'pod',o:p.open,x:p.x,z:p.z,yaw:p.side>0?Math.PI/2:-Math.PI/2,eye:p.y+.28}); }
    SOLID.want=true; },
  // 벽 찾기 : 네 방향으로 max m 안의 가장 가까운 막힌 칸 → 그 벽에 등을 대는 자리 · 방향
  wall(x,z,max=1.6,back=.3,y1=.8,y2=1.6){ let best=null; for(const [dx,dz] of [[1,0],[-1,0],[0,1],[0,-1]]) for(let t=.1;t<max;t+=.05){ if(SOLID.hit(x+dx*t,z+dz*t,y1,y2,.04)){ if(!best||t<best.t) best={t,dx,dz}; break; } }
    if(!best) return null; const px=x+best.dx*(best.t-back), pz=z+best.dz*(best.t-back); return {x:px,z:pz,yaw:Math.atan2(-best.dx,-best.dz)}; },      // 앞(+z)이 벽 반대쪽을 본다
  SIZE:{locker:[1.3,1.6,.8],bed:[2,1.6,1.2],crate:[1.7,1.1,1.05],pod:[1.2,1.5,2.4],duct:[1.2,1,.6],bench:[1.9,1,.9],shower:[1.25,2,1.2],pipes:[2.1,1.8,1],suits:[2.1,1.8,.95]},
  // 물건 안의 자리 → 세계 좌표 (lx : 오른쪽 · lz : 앞 — 앞 = 물건이 바라보는 쪽, 벽 반대)
  local(s,lx,lz){ const c=Math.cos(s.yaw), n=Math.sin(s.yaw); return {x:s.x+lx*c+lz*n,z:s.z-lx*n+lz*c}; },
  // 기관실 보관함 : 노랗게 칠하고 위에 방사능 표지 · 방호복 글
  hazmat(o){ o.traverse(m=>{ if(m.isMesh){ m.material=m.material.clone(); m.material.color.setRGB(1,.74,.18); } });
    const cv=document.createElement('canvas'); cv.width=512; cv.height=256; const g=cv.getContext('2d'); g.fillStyle='#e8b020'; g.fillRect(0,0,512,256);
    for(let i=-6;i<20;i++){ g.fillStyle='#111'; g.beginPath(); g.moveTo(i*40,256); g.lineTo(i*40+20,256); g.lineTo(i*40+60,216); g.lineTo(i*40+40,216); g.fill(); }
    g.fillStyle='#111'; g.beginPath(); g.arc(120,108,22,0,7); g.fill(); for(let k=0;k<3;k++){ const a=k*2.094-1.571; g.beginPath(); g.moveTo(120,108); g.arc(120,108,82,a-.52,a+.52); g.closePath(); g.fill(); }
    g.fillStyle='#e8b020'; g.beginPath(); g.arc(120,108,32,0,7); g.fill(); g.fillStyle='#111'; g.beginPath(); g.arc(120,108,20,0,7); g.fill();
    g.font='700 64px "IBM Plex Sans KR","Malgun Gothic",sans-serif'; g.textBaseline='middle'; g.fillText('방호복',230,84); g.font='600 34px "IBM Plex Mono",monospace'; g.fillText('HAZMAT · RAD',232,150);
    const t=new THREE.CanvasTexture(cv); t.encoding=THREE.sRGBEncoding; const sg=new THREE.Mesh(new THREE.PlaneGeometry(.9,.45),new THREE.MeshStandardMaterial({map:t,roughness:.6})); sg.position.set(0,1.78,.36); o.add(sg); },
  add(s){ const [a,b,c]=this.SIZE[s.kind], pk=new THREE.Mesh(new THREE.BoxGeometry(a,b,c),PICK); const f=this.front(s,s.kind==='duct'?.25:0); pk.position.set(f.x,(s.kind==='duct'?s.o.position.y:floorAt(s.x,s.z))+b/2+(s.kind==='pod'?.4:0),f.z); pk.rotation.y=s.kind==='pod'?0:s.yaw; WORLD.add(pk); s.pick=pk;
    s.zone=SHIP.zoneAt(f.x,f.z); s.name=s.kind==='locker'?(this.LOCKNAME[s.zone]||'옷장')+' — 들어가 숨는다':this.NAME[s.kind]; interact(pk,s.name,()=>this.enter(s),{range:2.5,enabled:()=>!this.in&&!this.busy}); this.spots.push(s); },
  // 문 · 뚜껑 : 경첩을 축으로
  // open : true 다 열기 · false 닫기 · 숫자 그만큼 (실험대 문은 틈을 남긴다) · 샤워 부스 문은 옆으로 민다
  doors(s,open,dur=.6){ return new Promise(res=>{ let k=0; const lid=!!s.lid, sl=!!s.door, a0=sl?s.door.position.x:lid?-s.lid.rotation.x:s.dr?s.dr.rotation.y:0;
    const a1=typeof open==='number'?open:open?(sl?1.05:s.kind==='duct'?1.4:lid?1.25:s.kind==='bench'?1.55:1.75):0;
    const f=dt=>{ k=Math.min(1,k+dt/dur); const e=k*k*(3-2*k), a=lerp(a0,a1,e); if(sl) s.door.position.x=a; else if(lid) s.lid.rotation.x=-a; else { if(s.dl) s.dl.rotation.y=-a; if(s.dr) s.dr.rotation.y=a; } if(k>=1){ TICK.splice(TICK.indexOf(f),1); res(); } }; TICK.push(f); }); },
  // 우주복이 흔들린다 (헤치고 들어갈 때 · 나올 때)
  sway(s,amp=.22){ (s.suits||[]).forEach((o,i)=>{ const z0=o.userData.z0??(o.userData.z0=o.rotation.z), x0=o.userData.x0??(o.userData.x0=o.rotation.x); let t=0; const f=dt=>{ t+=dt; const k=Math.exp(-t*1.6)*amp*(i?-1:1); o.rotation.z=z0+Math.sin(t*5.5)*k; o.rotation.x=x0+Math.sin(t*4.1+1)*k*.5; if(t>3){ o.rotation.z=z0; o.rotation.x=x0; TICK.splice(TICK.indexOf(f),1); } }; TICK.push(f); }); },
  front(s,d){ return {x:s.x+Math.sin(s.yaw)*d,z:s.z+Math.cos(s.yaw)*d}; },
  // 성체가 찾아와 설 자리 (숨은 곳 앞 · 빈 바닥)
  stand(s){ const f=this.front(s,s.kind==='bed'?1.7:1.75), [x,z]=freeSpot(f.x,f.z,{r:.45,y1:.3,y2:1.1}); return {x,z}; },
  yawFace(tx,tz,from){ return Math.atan2(-(tx-from.x),-(tz-from.z)); },
  async enter(s){ if(this.in||this.busy) return; this.busy=true; P.free=false; ME.setCrouch(false);
    // 들어가는 걸 성체가 봤나 (보는 앞에서 숨으면 들킨다)
    this.seen=BEAST.list.some(b=>!b.duct&&b.wrap.visible&&BEAST.sees(b));
    const out=this.front(s,1.05);
    if(s.kind==='locker'){
      await camTo({x:out.x,z:out.z,yaw:this.yawFace(s.x,s.z,out),pitch:0,eye:1.66},.5);
      SFX.play('locker_open',{at:s}); await this.doors(s,true,.6);
      const inn=this.front(s,-.02); await camTo({x:inn.x,z:inn.z,eye:1.6},.8); SFX.play('cloth');
      await camTo({yaw:s.yaw+Math.PI,pitch:0},.6);      // 돌아서서 문 쪽(밖)을 본다
      SFX.play('locker_close',{at:s}); await this.doors(s,false,.5);
    } else if(s.kind==='bed'){
      // 침대 : 긴 옆쪽(±z)에 웅크리고 → 엎드려 → 밑으로
      const side=P.z<s.z?-1:1, sx=s.x, sz=s.z+side*1.05;
      await camTo({x:sx,z:sz,yaw:this.yawFace(s.x,s.z,{x:sx,z:sz}),pitch:-.3,eye:1.0},.6); SFX.play('kneel');
      await camTo({eye:.32,pitch:-.05},.6); SFX.play('crawl');
      await camTo({x:s.x,z:s.z+side*.15,eye:.24},1.3);
      await camTo({yaw:this.yawFace(s.x,s.z+side*5,{x:s.x,z:s.z}),pitch:.02},.5);
    } else if(s.kind==='crate'){
      // 화물 상자 : 앞에 서서 뚜껑을 열고 → 넘어 들어가 웅크리고 → 앞판 틈 쪽을 보고 → 뚜껑을 닫는다
      await camTo({x:out.x,z:out.z,yaw:this.yawFace(s.x,s.z,out),pitch:-.35,eye:1.66},.5);
      SFX.play('locker_open',{at:s}); await this.doors(s,true,.7);
      await camTo({x:s.x,z:s.z,eye:1.25,pitch:-.6},.8); SFX.play('cloth');
      await camTo({eye:.56,yaw:s.yaw+Math.PI,pitch:0},.8);
      SFX.play('locker_close',{at:s}); await this.doors(s,false,.5);
    } else if(s.kind==='duct'){
      // 환기 덕트 : 앞에 무릎을 꿇고 격자를 들어 올린다 → 등을 돌려 엎드린다 → 발부터 뒤로 밀고 들어간다 → 격자를 당겨 닫는다
      await camTo({x:out.x,z:out.z,yaw:this.yawFace(s.x,s.z,out),pitch:-.5,eye:1.66},.5); SFX.play('kneel'); await camTo({eye:.95,pitch:-.3},.5);
      SFX.play('locker_open',{at:s,vol:.7}); await this.doors(s,true,.6);
      await camTo({yaw:s.yaw+Math.PI,pitch:-.4},.7); await camTo({eye:.42,pitch:-.06},.6); SFX.play('crawl');
      const inn=this.front(s,.14); await camTo({x:inn.x,z:inn.z,eye:.42,pitch:.03},1.5);
      SFX.play('locker_close',{at:s,vol:.7}); await this.doors(s,false,.5);
    } else if(s.kind==='bench'){
      // 실험대 수납장 : 앞에 무릎 꿇고 → 아래 문 둘을 열고 → 기어 들어가 돌아앉고 → 문을 반쯤 닫는다 (틈 사이로 바깥)
      await camTo({x:out.x,z:out.z,yaw:this.yawFace(s.x,s.z,out),pitch:-.45,eye:1.66},.5); SFX.play('kneel'); await camTo({eye:.9,pitch:-.25},.5);
      SFX.play('locker_open',{at:s,vol:.7}); await this.doors(s,true,.6);
      await camTo({eye:.5,pitch:-.05},.5); SFX.play('crawl'); const inn=this.front(s,-.08); await camTo({x:inn.x,z:inn.z,eye:.5},1.2);
      await camTo({yaw:s.yaw+Math.PI,pitch:0},.6);
      SFX.play('locker_close',{at:s,vol:.6}); await this.doors(s,.42,.5);
    } else if(s.kind==='shower'){
      // 제염 샤워 부스 : 서리 유리문을 옆으로 밀고 → 들어가 돌아서고 → 문을 닫는다 (닫힐 때 칙 — 제염 안개)
      await camTo({x:out.x,z:out.z,yaw:this.yawFace(s.x,s.z,out),pitch:0,eye:1.66},.5);
      SFX.play('airlock',{at:s,vol:.45}); await this.doors(s,true,.7);
      const inn=this.front(s,-.05); await camTo({x:inn.x,z:inn.z,eye:1.62},.8); SFX.play('cloth');
      await camTo({yaw:s.yaw+Math.PI,pitch:0},.6);
      SFX.play('airlock',{at:s,vol:.4}); await this.doors(s,false,.6); AUDIO.noise(1.6,.06,0,3000,'highpass');
    } else if(s.kind==='pipes'){
      // 배관 틈 : 배관 옆 끝에 서서 → 몸을 옆으로 돌려 배관과 벽 사이로 비집고 들어간다 → 배관 쪽(밖)을 본다
      const side=this.local(s,1.25,-.25), mid=this.local(s,.75,-.25), inn=this.local(s,.2,-.25);
      await camTo({x:side.x,z:side.z,yaw:this.yawFace(mid.x,mid.z,side),pitch:0,eye:1.66},.6); SFX.play('cloth');
      await camTo({x:mid.x,z:mid.z,eye:1.6,pitch:-.05},.8); SFX.play('crawl',{vol:.4}); await camTo({x:inn.x,z:inn.z},.9);
      await camTo({yaw:s.yaw+Math.PI,pitch:0},.6); AUDIO.noise(1.2,.05,0,1800);
    } else if(s.kind==='suits'){
      // 우주복 걸이 : 우주복 둘 사이를 헤치고 → 뒤 벽에 등을 붙이고 → 돌아서서 우주복 사이로 본다
      await camTo({x:out.x,z:out.z,yaw:this.yawFace(s.x,s.z,out),pitch:0,eye:1.66},.5);
      SFX.play('cloth'); this.sway(s,.12); const inn=this.front(s,-.3); await camTo({x:inn.x,z:inn.z,eye:1.6},1.0);
      await camTo({yaw:s.yaw+Math.PI,pitch:0},.6); this.sway(s,.05);
    } else {
      // 동면 캡슐 : 통로 쪽에 서서 → 올라가 눕는다
      const side=this.front(s,1.15);
      await camTo({x:side.x,z:side.z,yaw:this.yawFace(s.x,s.z,side),pitch:-.4,eye:1.66},.6); SFX.play('cloth');
      await camTo({x:s.x,z:s.z,eye:s.eye+.3,pitch:-.2},1.0);
      await camTo({eye:s.eye,yaw:s.yaw+Math.PI,pitch:.08},.7);
      SFX.play('airlock',{at:s,vol:.5}); FX.black(.7); await sleep(180); s.o.visible=false; FX.black(0);      // 안에서는 캡슐이 눈을 가리지 않게 (서리 낀 유리 테는 화면 덮개로)
    }
    this.fx(s.kind); this.in=s; this.busy=false; P.look=true; this.base={yaw:P.yaw}; this.ui(true); },
  async leave(){ const s=this.in; if(!s||this.busy) return; this.busy=true; this.ui(false); this.fx(null); P.look=false;
    if(s.kind==='locker'){ SFX.play('locker_open',{at:s}); await this.doors(s,true,.5); const out=this.front(s,1.0); await camTo({x:out.x,z:out.z,eye:1.66},.7); await this.doors(s,false,.6); SFX.play('locker_close',{at:s}); }
    else if(s.kind==='bed'){ const side=Math.sign(P.z-s.z)||1; SFX.play('crawl'); await camTo({x:s.x,z:s.z+side*1.05,eye:.32},1.2); await camTo({eye:1.66,pitch:0},.7); }
    else if(s.kind==='duct'){ SFX.play('locker_open',{at:s,vol:.7}); await this.doors(s,true,.5); SFX.play('crawl'); const out=this.front(s,1.05); await camTo({x:out.x,z:out.z,eye:.42},1.2); await camTo({eye:1.66,pitch:0},.8); await this.doors(s,false,.5); SFX.play('locker_close',{at:s,vol:.6}); }
    else if(s.kind==='crate'){ SFX.play('locker_open',{at:s}); await this.doors(s,true,.5); await camTo({eye:1.25},.6); const out=this.front(s,1.05); await camTo({x:out.x,z:out.z,eye:1.66,pitch:0},.8); await this.doors(s,false,.6); SFX.play('locker_close',{at:s}); }
    else if(s.kind==='bench'){ SFX.play('locker_open',{at:s,vol:.6}); await this.doors(s,true,.45); SFX.play('crawl'); const out=this.front(s,1.0); await camTo({x:out.x,z:out.z,eye:.5},1.1); await camTo({eye:1.66,pitch:0},.7); await this.doors(s,false,.5); SFX.play('locker_close',{at:s,vol:.6}); }
    else if(s.kind==='shower'){ SFX.play('airlock',{at:s,vol:.45}); await this.doors(s,true,.6); const out=this.front(s,1.0); await camTo({x:out.x,z:out.z,eye:1.66,pitch:0},.8); await this.doors(s,false,.6); }
    else if(s.kind==='pipes'){ const mid=this.local(s,.75,-.25), side=this.local(s,1.3,-.25); SFX.play('cloth'); await camTo({x:mid.x,z:mid.z,yaw:this.yawFace(side.x,side.z,mid)},.8); await camTo({x:side.x,z:side.z,eye:1.66,pitch:0},.7); }
    else if(s.kind==='suits'){ SFX.play('cloth'); this.sway(s,.12); const out=this.front(s,1.0); await camTo({x:out.x,z:out.z,eye:1.66,pitch:0},.9); }
    else { SFX.play('airlock',{at:s,vol:.5}); s.o.visible=true; await camTo({eye:s.eye+.3},.6); const side=this.front(s,1.15); await camTo({x:side.x,z:side.z,eye:1.66,pitch:0},.9); }
    this.in=null; this.busy=false; P.free=true; },
  // 죽거나 처음부터 : 숨은 상태를 풀고 문 · 뚜껑 · 덮개를 되돌린다
  reset(){ const s=this.in; if(s){ if(s.dl||s.lid||s.door) this.doors(s,false,.01); if(s.kind==='pod') s.o.visible=true; } this.in=null; this.busy=false; this.seen=false; this.ui(false); this.fx(null); P.look=false; },
  fx(kind){ const e=FXEL('hidefx'); e.className=kind?'on '+kind:''; e.innerHTML=kind?'<p>숨어 있다 — '+byDevice('E 나가기','[나가기]')+'</p>':''; },
  ui(on){ let out=$('#hideout'); if(!out){ out=document.createElement('button'); out.id='hideout'; out.className='ring'; out.textContent='나가기'; $('#hud').appendChild(out); out.addEventListener('pointerdown',e=>{ e.stopPropagation(); HIDE.leave(); }); }
    document.body.classList.toggle('hiding',on); out.classList.toggle('on',on); if(GUN.held) GUN.held.visible=!on;
    if(STORY.spot){ if(on){ this._tk=STORY.spot.intensity>0?(S.flags.power?.5:1):0; STORY.torch(this._tk*.2); } else STORY.torch(this._tk||0); } },      // 숨어 있는 동안 : 총은 내리고 · 손전등은 손으로 가린다 (희미하게만)
  LOOK:{locker:[.75,-.5,.4],bed:[.75,-.15,.12],crate:[.6,-.14,.16],pod:[.7,-.2,.4],duct:[.6,-.1,.34],bench:[.45,-.25,.2],shower:[.8,-.4,.35],pipes:[.55,-.35,.35],suits:[.5,-.35,.3]},
  tick(dt){ if(!this.in) return; const [ya,p0,p1]=this.LOOK[this.in.kind];
    // 틈 · 매트리스 아래 · 유리 너머 : 너무 멀리 고개를 돌리지 못하게
    const a=Math.atan2(Math.sin(P.yaw-this.base.yaw),Math.cos(P.yaw-this.base.yaw)); if(Math.abs(a)>ya) P.yaw=this.base.yaw+Math.sign(a)*ya; P.pitch=clamp(P.pitch,p0,p1);
    // 숨소리 (작게)
    this.bt=(this.bt||0)-dt; if(this.bt<=0){ this.bt=2.4; SFX.play('breath',{vol:.6}); } },
};
addEventListener('keydown',e=>{ if(e.code==='KeyE'&&HIDE.in&&!HIDE.busy&&!TALK.on){ e.stopPropagation(); HIDE.leave(); } },true);
