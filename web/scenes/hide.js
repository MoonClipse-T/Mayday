/* ============================================================
   숨기 (4.8) — 진짜로 들어가 숨는 곳 네 가지 · 방마다 둘 넘게
   옷장(locker.glb · 그물 문 두 짝) : 문을 열고 → 들어가 돌아서고 → 문을 닫는다 — 그물 틈으로 밖이 보인다
   침대(bed.glb · 철제 병원 침대) : 옆에 웅크리고 → 엎드려 → 밑으로 기어 들어간다 — 매트리스 아래로 바닥만 보인다
   화물 상자(crate.glb · blender/06_숨는곳_화물상자.blend — 뚜껑 lid 가 뒤 경첩으로 열린다) : 뚜껑을 열고 → 들어가 웅크리고 → 닫는다 — 앞판 틈으로 내다본다
   동면 캡슐(동면 구역 C 의 빈 캡슐) : 올라가 눕는다 — 서리 낀 유리 너머로 본다
   규칙 (scenes/stalk.js 의 성체) : 성체가 '보기 전에' 숨으면 못 찾는다 — 앞을 지나가다 사라진다 · 보는 앞에서 숨으면 끌어낸다 (숨 참기는 없앴다 — 숨으면 산다)
   ============================================================ */
'use strict';
const HIDE={in:null,spots:[],seen:false,busy:false,
  NAME:{locker:'옷장 — 들어가 숨는다',bed:'침대 — 밑으로 기어 들어가 숨는다',crate:'화물 상자 — 들어가 뚜껑을 닫는다',pod:'동면 캡슐 — 들어가 눕는다'},
  // 방마다 (1호 좌표) — 옷장은 가장 가까운 벽에 등을 대고, 침대 · 상자는 빈 바닥에 (상자도 벽이 가까우면 등을 댄다)
  LOCK:[[6.5,11.6],[21,11.6],[33,9.4],[44.5,11.6],                    // 중앙 복도
    [58.5,-.6],[61.2,-.6],[60,21.4],[66,21.4],                        // 기관실
    [44.5,1.4],[33,6.2],                                              // 연구실
    [10.2,-7.6],[19.6,5.4],                                           // 식당 · 의무실
    [-5.6,5.6],[5.6,-2.4],                                            // 함교
    [30.6,6.2],                                                       // 동면 구역 C
    [51.3,6.4],                                                       // 에어록 (우주복 보관함)
    [10.8,15],[30.2,19]],                                             // 라운지
  BEDS:[[11.2,-5.4],[17.2,-5.4],[24.5,23.5]],
  CRATE:[[36.5,1.6],[57,1.6],[69,19.6],[27.5,25.4],[4.6,6.4],[16.5,-1.5]],
  PODS:['L4','R3'],
  async setup(){ this.spots=[]; this.in=null; this.busy=false; const [lk,bd,cr]=await Promise.all([loadGLB('locker'),loadGLB('bed'),loadGLB('crate')]);
    for(const [x,z] of this.LOCK){ const w=this.wall(x,z); if(!w||SOLID.hit(w.x+Math.sin(w.yaw)*.9,w.z+Math.cos(w.yaw)*.9,.2,1.6,.3)) continue;      // 문 앞이 비어 있어야 들어간다
      const o=lk.clone(true), dl=o.getObjectByName('door_L'), dr=o.getObjectByName('door_R');
      o.position.set(w.x,floorAt(w.x,w.z),w.z); o.rotation.y=w.yaw; WORLD.add(o); LEVEL.solids.push(o);
      this.add({kind:'locker',o,dl,dr,x:w.x,z:w.z,yaw:w.yaw}); }
    for(const [x0,z0] of this.BEDS){ const [x,z]=freeSpot(x0,z0,{r:1,y1:.05,y2:1.4}); const o=bd.clone(true); o.scale.setScalar(.01); o.position.set(x,floorAt(x,z),z); WORLD.add(o); LEVEL.solids.push(o);
      this.add({kind:'bed',o,x,z,yaw:0}); }
    for(const [x0,z0] of this.CRATE){ let [x,z]=freeSpot(x0,z0,{r:.95,y1:.05,y2:1.2}), yaw=0; const w=this.wall(x,z,2.2); if(w){ x=w.x+Math.sin(w.yaw)*.22; z=w.z+Math.cos(w.yaw)*.22; yaw=w.yaw; }
      if(SOLID.hit(x+Math.sin(yaw)*1.2,z+Math.cos(yaw)*1.2,.2,1.6,.3)) continue;
      const o=cr.clone(true), lid=o.getObjectByName('lid'); o.traverse(m=>{ if(m.isMesh){ m.material=m.material.clone(); m.material.side=THREE.DoubleSide; m.material.envMapIntensity=.3; } });
      o.position.set(x,floorAt(x,z),z); o.rotation.y=yaw; WORLD.add(o); LEVEL.solids.push(o);
      this.add({kind:'crate',o,lid,x,z,yaw}); }
    // 동면 캡슐 : rooms.js 가 놓은 빈(열린) 캡슐 — 통로 쪽에서 올라간다
    const pods=SHIP.rooms&&SHIP.rooms.cryo&&SHIP.rooms.cryo.pods||{}; for(const k of this.PODS){ const p=pods[k]; if(!p) continue; this.add({kind:'pod',o:p.open,x:p.x,z:p.z,yaw:p.side>0?Math.PI/2:-Math.PI/2,eye:p.y+.28}); }
    SOLID.want=true; },
  // 벽 찾기 : 네 방향으로 max m 안의 가장 가까운 막힌 칸 → 그 벽에 등을 대는 자리 · 방향
  wall(x,z,max=1.6){ let best=null; for(const [dx,dz] of [[1,0],[-1,0],[0,1],[0,-1]]) for(let t=.1;t<max;t+=.05){ if(SOLID.hit(x+dx*t,z+dz*t,.8,1.6,.04)){ if(!best||t<best.t) best={t,dx,dz}; break; } }
    if(!best) return null; const px=x+best.dx*(best.t-.3), pz=z+best.dz*(best.t-.3); return {x:px,z:pz,yaw:Math.atan2(-best.dx,-best.dz)}; },      // 앞(+z)이 벽 반대쪽을 본다
  SIZE:{locker:[1.3,1.6,.8],bed:[2,1.6,1.2],crate:[1.7,1.1,1.05],pod:[1.2,1.5,2.4]},
  add(s){ const [a,b,c]=this.SIZE[s.kind], pk=new THREE.Mesh(new THREE.BoxGeometry(a,b,c),PICK); pk.position.set(s.x,floorAt(s.x,s.z)+b/2+(s.kind==='pod'?.4:0),s.z); pk.rotation.y=s.kind==='pod'?0:s.yaw; WORLD.add(pk); s.pick=pk; s.name=this.NAME[s.kind];
    s.zone=SHIP.zoneAt(s.x,s.z); interact(pk,s.name,()=>this.enter(s),{range:2.5,enabled:()=>!this.in&&!this.busy}); this.spots.push(s); },
  // 문 · 뚜껑 : 경첩을 축으로
  doors(s,open,dur=.6){ return new Promise(res=>{ let k=0; const lid=s.kind==='crate', a0=lid?-s.lid.rotation.x:s.dr?s.dr.rotation.y:0, a1=open?(lid?1.25:1.75):0;
    const f=dt=>{ k=Math.min(1,k+dt/dur); const e=k*k*(3-2*k), a=lerp(a0,a1,e); if(lid) s.lid.rotation.x=-a; else { if(s.dl) s.dl.rotation.y=-a; if(s.dr) s.dr.rotation.y=a; } if(k>=1){ TICK.splice(TICK.indexOf(f),1); res(); } }; TICK.push(f); }); },
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
    else if(s.kind==='crate'){ SFX.play('locker_open',{at:s}); await this.doors(s,true,.5); await camTo({eye:1.25},.6); const out=this.front(s,1.05); await camTo({x:out.x,z:out.z,eye:1.66,pitch:0},.8); await this.doors(s,false,.6); SFX.play('locker_close',{at:s}); }
    else { SFX.play('airlock',{at:s,vol:.5}); s.o.visible=true; await camTo({eye:s.eye+.3},.6); const side=this.front(s,1.15); await camTo({x:side.x,z:side.z,eye:1.66,pitch:0},.9); }
    this.in=null; this.busy=false; P.free=true; },
  // 죽거나 처음부터 : 숨은 상태를 풀고 문 · 뚜껑 · 덮개를 되돌린다
  reset(){ const s=this.in; if(s){ if(s.kind==='locker'||s.kind==='crate') this.doors(s,false,.01); if(s.kind==='pod') s.o.visible=true; } this.in=null; this.busy=false; this.seen=false; this.ui(false); this.fx(null); P.look=false; },
  fx(kind){ const e=FXEL('hidefx'); e.className=kind?'on '+kind:''; e.innerHTML=kind?'<p>숨어 있다 — '+byDevice('E 나가기','[나가기]')+'</p>':''; },
  ui(on){ let out=$('#hideout'); if(!out){ out=document.createElement('button'); out.id='hideout'; out.className='ring'; out.textContent='나가기'; $('#hud').appendChild(out); out.addEventListener('pointerdown',e=>{ e.stopPropagation(); HIDE.leave(); }); }
    document.body.classList.toggle('hiding',on); out.classList.toggle('on',on); if(GUN.held) GUN.held.visible=!on;
    if(STORY.spot){ if(on){ this._tk=STORY.spot.intensity>0?(S.flags.power?.5:1):0; STORY.torch(this._tk*.2); } else STORY.torch(this._tk||0); } },      // 숨어 있는 동안 : 총은 내리고 · 손전등은 손으로 가린다 (희미하게만)
  LOOK:{locker:[.75,-.5,.4],bed:[.75,-.15,.12],crate:[.6,-.14,.16],pod:[.7,-.2,.4]},
  tick(dt){ if(!this.in) return; const [ya,p0,p1]=this.LOOK[this.in.kind];
    // 틈 · 매트리스 아래 · 유리 너머 : 너무 멀리 고개를 돌리지 못하게
    const a=Math.atan2(Math.sin(P.yaw-this.base.yaw),Math.cos(P.yaw-this.base.yaw)); if(Math.abs(a)>ya) P.yaw=this.base.yaw+Math.sign(a)*ya; P.pitch=clamp(P.pitch,p0,p1);
    // 숨소리 (작게)
    this.bt=(this.bt||0)-dt; if(this.bt<=0){ this.bt=2.4; SFX.play('breath',{vol:.6}); } },
};
addEventListener('keydown',e=>{ if(e.code==='KeyE'&&HIDE.in&&!HIDE.busy&&!TALK.on){ e.stopPropagation(); HIDE.leave(); } },true);
