/* ============================================================
   숨기 (4.2) — 진짜로 들어가 숨는다
   옷장(locker.glb · 그물 문 두 짝이 경첩으로 열린다) : 앞에 서고 → 문을 열고 → 들어가 돌아서고 → 문을 닫는다 — 그물 틈으로 밖이 보인다
   침대(bed.glb · 철제 병원 침대) : 옆에 웅크리고 → 바닥에 엎드려 → 밑으로 기어 들어간다 — 매트리스 아래로 바닥만 보인다
   숨어 있으면 성체가 나를 못 본다. 다만 들어가는 걸 들키면 끌어낸다 · 가까이 오면 숨을 참아야 한다 (Space · [숨 참기] 길게, 7초)
   ============================================================ */
'use strict';
const HIDE={in:null,spots:[],holding:false,breath:7,seen:false,
  // 옷장 · 침대 놓기 : 옷장은 가장 가까운 벽에 등을 대고, 침대는 빈 바닥에
  async setup(){ this.spots=[]; this.in=null; const [lk,bd]=await Promise.all([loadGLB('locker'),loadGLB('bed')]);
    const LOCK=[[6.5,11.6],[21,11.6],[33,9.4],[44.5,11.6],[58.5,-.6],[61.2,-.6],[60,21.4],[66,21.4],[44.5,1.4],[10.2,-7.6]], BEDS=[[11.2,-5.4],[17.2,-5.4],[24.5,23.5]];
    for(const [x,z] of LOCK){ const w=this.wall(x,z); if(!w) continue; const o=lk.clone(true), dl=o.getObjectByName('door_L'), dr=o.getObjectByName('door_R');
      o.position.set(w.x,floorAt(w.x,w.z),w.z); o.rotation.y=w.yaw; WORLD.add(o); LEVEL.solids.push(o);
      this.add({kind:'locker',o,dl,dr,x:w.x,z:w.z,yaw:w.yaw,name:'옷장 — 들어가 숨는다'}); }
    for(const [x0,z0] of BEDS){ const [x,z]=freeSpot(x0,z0,{r:1,y1:.05,y2:1.4}); const o=bd.clone(true); o.scale.setScalar(.01); o.position.set(x,floorAt(x,z),z); WORLD.add(o); LEVEL.solids.push(o);
      this.add({kind:'bed',o,x,z,yaw:0,name:'침대 — 밑으로 기어 들어가 숨는다'}); }
    SOLID.want=true; },
  // 벽 찾기 : 네 방향으로 1.6 m 안의 가장 가까운 막힌 칸 → 그 벽에 등을 대는 자리 · 방향
  wall(x,z){ let best=null; for(const [dx,dz] of [[1,0],[-1,0],[0,1],[0,-1]]) for(let t=.1;t<1.6;t+=.05){ if(SOLID.hit(x+dx*t,z+dz*t,.8,1.6,.04)){ if(!best||t<best.t) best={t,dx,dz}; break; } }
    if(!best) return null; const px=x+best.dx*(best.t-.3), pz=z+best.dz*(best.t-.3); return {x:px,z:pz,yaw:Math.atan2(-best.dx,-best.dz)}; },      // 옷장 앞(+z)이 벽 반대쪽을 본다
  add(s){ const pk=new THREE.Mesh(new THREE.BoxGeometry(s.kind==='bed'?2:1.3,1.6,s.kind==='bed'?1.2:.8),PICK); pk.position.set(s.x,.8,s.z); pk.rotation.y=s.yaw; WORLD.add(pk); s.pick=pk;
    interact(pk,s.name,()=>this.enter(s),{range:2.4,enabled:()=>!this.in&&!this.busy}); this.spots.push(s); },
  // 옷장 문 : 경첩을 축으로 바깥쪽으로 (왼쪽 −, 오른쪽 +)
  doors(s,open,dur=.6){ return new Promise(res=>{ let k=0; const a0=s.dr?s.dr.rotation.y:0, a1=open?1.75:0; const f=dt=>{ k=Math.min(1,k+dt/dur); const e=k*k*(3-2*k), a=lerp(a0,a1,e); if(s.dl) s.dl.rotation.y=-a; if(s.dr) s.dr.rotation.y=a; if(k>=1){ TICK.splice(TICK.indexOf(f),1); res(); } }; TICK.push(f); }); },
  front(s,d){ return {x:s.x+Math.sin(s.yaw)*d,z:s.z+Math.cos(s.yaw)*d}; },
  async enter(s){ if(this.in||this.busy) return; this.busy=true; P.free=false; ME.setCrouch(false);
    // 들어가는 걸 성체가 봤나 (쫓기는 중에 보이는 곳에서 숨으면 들킨다)
    this.seen=BEAST.list.some(b=>b.mode==='chase'&&BEAST.sees(b));
    const out=this.front(s,1.05), face=s.yaw+Math.PI;      // 가구를 바라보는 방향 (카메라 yaw : 앞 = −z)
    if(s.kind==='locker'){
      await camTo({x:out.x,z:out.z,yaw:this.yawFace(s.x,s.z,out),pitch:0,eye:1.66},.5);
      SFX.play('locker_open',{at:s}); await this.doors(s,true,.6);
      const inn=this.front(s,-.02); await camTo({x:inn.x,z:inn.z,eye:1.6},.8); SFX.play('cloth');
      await camTo({yaw:s.yaw+Math.PI,pitch:0},.6);      // 돌아서서 문 쪽(밖)을 본다
      SFX.play('locker_close',{at:s}); await this.doors(s,false,.5); this.fx('locker');
    } else {
      // 침대 : 긴 옆쪽(±z)에 웅크리고 → 엎드려 → 밑으로
      const side=P.z<s.z?-1:1, sx=s.x, sz=s.z+side*1.05;
      await camTo({x:sx,z:sz,yaw:this.yawFace(s.x,s.z,{x:sx,z:sz}),pitch:-.3,eye:1.0},.6); SFX.play('kneel');
      await camTo({eye:.32,pitch:-.05},.6); SFX.play('crawl');
      await camTo({x:s.x,z:s.z+side*.15,eye:.24},1.3);
      await camTo({yaw:this.yawFace(s.x,s.z+side*5,{x:s.x,z:s.z})+0,pitch:.02},.5); this.fx('bed');
    }
    this.in=s; this.busy=false; this.holding=false; this.breath=7; P.look=true; this.base={yaw:P.yaw}; this.ui(true); },
  async leave(){ const s=this.in; if(!s||this.busy) return; this.busy=true; this.ui(false); this.fx(null); P.look=false;
    if(s.kind==='locker'){ SFX.play('locker_open',{at:s}); await this.doors(s,true,.5); const out=this.front(s,1.0); await camTo({x:out.x,z:out.z,eye:1.66},.7); await this.doors(s,false,.6); SFX.play('locker_close',{at:s}); }
    else { const side=Math.sign(P.z-s.z)||1; SFX.play('crawl'); await camTo({x:s.x,z:s.z+side*1.05,eye:.32},1.2); await camTo({eye:1.66,pitch:0},.7); }
    this.in=null; this.busy=false; P.free=true; },
  // 죽거나 처음부터 : 숨은 상태를 풀고 문을 닫아 둔다
  reset(){ if(this.in&&this.in.dl) this.doors(this.in,false,.01); this.in=null; this.busy=false; this.ui(false); this.fx(null); P.look=false; },
  yawFace(tx,tz,from){ return Math.atan2(-(tx-from.x),-(tz-from.z)); },
  fx(kind){ const e=FXEL('hidefx'); e.className=kind?'on '+kind:''; e.innerHTML=kind?'<p>숨어 있다 — E 나가기 · Space 숨 참기 (길게)</p>':''; },
  ui(on){ let b=$('#breath'); if(!b){ b=document.createElement('button'); b.id='breath'; b.className='ring'; b.textContent='숨 참기'; $('#hud').appendChild(b);
      b.addEventListener('pointerdown',e=>{ e.stopPropagation(); HIDE.holding=true; b.classList.add('held'); }); ['pointerup','pointerleave','pointercancel'].forEach(t=>b.addEventListener(t,()=>{ HIDE.holding=false; b.classList.remove('held'); }));
      const out=document.createElement('button'); out.id='hideout'; out.className='ring small'; out.textContent='나가기'; $('#hud').appendChild(out); out.addEventListener('pointerdown',e=>{ e.stopPropagation(); HIDE.leave(); }); }
    b.classList.toggle('on',on); $('#hideout').classList.toggle('on',on); $('#hideout').style.display=on?'block':''; FXEL('breathbar').classList.toggle('on',on); if(!FXEL('breathbar').firstChild) FXEL('breathbar').innerHTML='<i></i>'; },
  // 성체가 듣나 : 숨을 참지 않고 3.5 m 안 · 숨이 다하면 헐떡인다
  noisy(b){ if(!this.in) return false; const d=Math.hypot(b.wrap.position.x-this.in.x,b.wrap.position.z-this.in.z); return d<3.5&&(!this.holding||this.breath<=0); },
  tick(dt){ if(!this.in) return; const kb=keys.Space; if(kb!==undefined&&!IS_TOUCH) this.holding=!!kb;
    if(this.holding&&this.breath>0){ this.breath=Math.max(0,this.breath-dt); if(this.breath===0){ this.holding=false; SFX.play('gasp'); } }
    else if(!this.holding) this.breath=Math.min(7,this.breath+dt*.8);
    const bar=FXEL('breathbar').firstChild; if(bar) bar.style.width=(this.breath/7*100)+'%';
    // 그물 틈 · 매트리스 아래 : 너무 멀리 고개를 돌리지 못하게
    const a=Math.atan2(Math.sin(P.yaw-this.base.yaw),Math.cos(P.yaw-this.base.yaw)); if(Math.abs(a)>.75) P.yaw=this.base.yaw+Math.sign(a)*.75; P.pitch=clamp(P.pitch,this.in.kind==='bed'?-.15:-.5,this.in.kind==='bed'?.12:.4);
    // 숨소리 : 참지 않으면 들린다
    this.bt=(this.bt||0)-dt; if(this.bt<=0){ this.bt=this.holding?3:1.6; if(!this.holding) SFX.play('breath'); } },
};
addEventListener('keydown',e=>{ if(e.code==='KeyE'&&HIDE.in&&!HIDE.busy&&!TALK.on){ e.stopPropagation(); HIDE.leave(); } },true);
