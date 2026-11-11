/* ============================================================
   성체 추격 (4.8) — 감독 : 성체는 배 어딘가에 있다가 찾아온다 (공포 게임식 — 소리로 먼저 알리고, 숨으면 지나간다)
   away  배 어딘가 (보이지 않는다) — GAP 초 뒤에 찾아온다 · 총소리는 그 시간을 당긴다
   warn  통로로 (hall) : 특유의 울음소리가 들린다 → 먼 복도 격자에서 내려와 내가 있는 방 문으로 기어 온다 (도착까지 LEAD.hall 초쯤)
         환풍구로 (vent · 가끔) : 덕트 울림 소리 · 먼지 → LEAD.vent 초 뒤 내가 있는 방의 천장 격자로 떨어진다
   도착  숨어 있으면 (보이기 전에 숨었으면) prowl : 숨은 곳 앞까지 와서 서성이다 → leave : 먼 격자로 올라가 사라진다
         숨지 못했으면 attack : 울부짖고 쫓아온다 — 약점(머리 · 가슴 · 다리 사이) 다섯 발이면 물러간다(rout) · 닿으면 잡혀간다(onCatch)
         환풍구로 온 것은 맞설 수 없다 (enraged — 더 빠르고 물러가지 않는다) : 반드시 숨어야 한다
   쓰기 : await STALK.start({first:20,onCatch}) · STALK.stop() · STALK.reset(초) (죽고 다시) · STALK.force='vent'|'hall' (다음 방문 방식)
          미션(어디에 다녀와라 · 가져와라 · 관측해라)을 하는 동안 켜 두면 된다 — 숨을 곳은 scenes/hide.js 가 방마다 둔다
   ============================================================ */
'use strict';
const STALK={on:false,b:null,state:'off',t:0,type:'hall',last:null,force:null,visits:0,told:{},onCatch:null,id:0,busy:false,RV:{},w:null,
  LEAD:{hall:11,vent:10},               // 소리가 난 뒤 도착까지 (초) — 숨을 곳까지 걸어갈 시간
  GAP:[55,85],                          // 다녀간 뒤 다시 올 때까지 (초)
  ROOMV:{bridge:[0,3.6],deck:[14,3.6],cryo:[27,3.4],lab:[39,4.8],airlock:[50.4,7.3],lobby:[16.5,16.5],engine:[57.6,13.2]},      // 방마다 천장 격자 (문 안쪽)
  LINE:{cry:'저 울음소리 — 가까이 옵니다. 들어오기 전에 숨으십시오. 옷장, 침대 밑, 상자, 캡슐 — 어디든.',
    vent:'환기 덕트가 울립니다. 머리 위로 옵니다. 이번에는 맞설 수 없습니다 — 숨으십시오!',
    weak:'몸통은 소용없습니다. 빛나는 곳 — 머리, 가슴, 다리 사이를 쏘십시오. 다섯 발!',
    rout:'물러갑니다. …다시 올 겁니다.', pass:'지나갔습니다. 지금 움직이십시오.'},
  TEXT:{hall:'울음소리 — 성체가 가까이 온다 · 들어오기 전에 숨어라',vent:'환풍구가 울린다 — 머리 위로 온다 · 숨어라 (맞설 수 없다)',
    fight:'약점을 쏴라 — 머리 · 가슴 · 다리 사이',rage:'숨어라 — 지금은 맞설 수 없다',hide:'숨죽여라 — 지나갈 때까지'},
  // 방 천장 격자 (복도 격자는 BEAST.vents) — 1호를 불러올 때마다
  vents(){ this.RV={}; for(const [k,[x0,z0]] of Object.entries(this.ROOMV)){ const [x,z]=freeSpot(x0,z0,{r:.6,y1:.3,y2:1.8}); let y=6.4; for(let h=1.9;h<6.4;h+=.05) if(SOLID.hit(x,z,h,h+.05,.25)){ y=h; break; }
      const v={x,z,y,open:false,zone:k}; v.mesh=new THREE.Mesh(new THREE.PlaneGeometry(1.05,1.05),BEAST.grate); v.mesh.rotation.x=Math.PI/2; v.mesh.position.set(x,y-.03,z); WORLD.add(v.mesh); this.RV[k]=v; } },
  rand([a,b]){ return a+Math.random()*(b-a); },
  // 켜기 : beast 를 주면 그 성체를 쓴다 · engage 면 지금 눈앞에서 덤빈다 (기관실에서 들켰을 때)
  async start({first=22,onCatch=null,beast=null,engage=false}={}){ if(onCatch) this.onCatch=onCatch;
    if(beast) this.b=beast; if(!this.b||!BEAST.list.includes(this.b)) this.b=await BEAST.spawn({at:{x:57,z:18.5},clip:'idle'});
    this.on=true; this.busy=false; if(!this.fn) this.fn=dt=>this.tick(dt); if(!TICK.includes(this.fn)) TICK.push(this.fn);
    if(engage){ this.visits=Math.max(1,this.visits); this.attack(false); } else this.away(first); },
  stop(){ this.on=false; this.id++; this.busy=false; this.state='off'; this.ui(''); if(this.b){ this.b.mode='idle'; this.b.enraged=false; this.b.rout=false; } },
  reset(t=20){ if(!this.on) return; this.busy=false; this.away(t); },
  // 무대 밖으로
  away(t){ const b=this.b; this.id++; BEAST.reset(b); b.duct=true; b.wrap.visible=false; b.wrap.position.set(220,0,10.5); b.mode='away'; b.wk=0; b.enraged=false; b.rout=false; this.state='away'; this.t=t; this.ui(''); },
  noise(k){ if(this.on&&this.state==='away') this.t=Math.max(7,this.t-k); },
  doorXZ(){ const z=SHIP.zoneAt(P.x,P.z), D=ROUTE.DOOR[z]; return z==='hall'||!D?[P.x,10.5]:D[1]; },
  // 처음 겪을 때 VEGA 가 알려 준다 (말 상자를 띄우면 멈춰 서야 하니 — 목소리 + 위쪽 글로)
  tell(k){ if(this.told[k]) return; this.told[k]=1; const t=this.LINE[k]; VOICE.play(t); toast('VEGA — '+t,5200); },
  ui(k){ const e=FXEL('stalkfx'); e.className=k?'on '+k:''; e.innerHTML=k?'<p>'+this.TEXT[k]+'</p>'+(k==='fight'?'<div class="pips">'+[0,1,2,3,4].map(i=>'<i'+(i<(this.b.wk||0)?' class="on"':'')+'></i>').join('')+'</div>':''):''; this.uik=k; },

  /* ---- 찾아온다 ---- */
  come(){ const b=this.b; this.visits++; this.type=this.force||(this.visits>1&&this.last!=='vent'&&Math.random()<.34?'vent':'hall'); this.force=null; this.last=this.type; this.id++; this.w={t:0,snd:0,n:0,re:0};
    if(this.type==='hall'){ const [hx]=this.doorXZ(), v=BEAST.VENTS.slice().sort((a,c)=>Math.abs(c.x-hx)-Math.abs(a.x-hx))[0];      // 가장 먼 복도 격자에서 내려온다
      BEAST.reset(b); b.wrap.position.set(v.x,floorAt(v.x,v.z),v.z); b.wrap.rotation.y=hx<v.x?-Math.PI/2:Math.PI/2; b.low=true; BEAST.rest(b); b.mode='prowl';
      this.w.speed=clamp(Math.abs(v.x-hx)/this.LEAD.hall,1.1,2.6); }
    this.state='warn'; this.ui(this.type); this.tell(this.type==='hall'?'cry':'vent'); },
  warn(dt){ const b=this.b, w=this.w, wp=b.wrap.position; w.t+=dt; w.snd-=dt;
    if(this.type==='hall'){
      if(w.snd<=0){ w.snd=4.6; SFX.play('beast_call',{at:wp,far:true,vol:clamp(.6+w.n*.15,0,1)}); w.n++; }
      const [tx,tz]=this.doorXZ(); w.re-=dt; if(w.re<=0||!b.path){ w.re=.6; b.path=[[tx,tz]]; b.speed=w.speed; b.move='walk'; }
      const d=Math.hypot(P.x-wp.x,P.z-wp.z), see=BEAST.sees(b);
      if(Math.hypot(tx-wp.x,tz-wp.z)<2.2||see&&d<9||w.t>this.LEAD.hall+12) this.arrive();
    } else {
      if(w.snd<=0){ w.snd=2.2; SFX.play('vent_rumble',{vol:clamp(.55+w.n*.12,0,1),rate:.8+Math.random()*.25}); THUD(.1+w.n*.04); FX.shake(.25,.008+w.n*.004); w.n++;
        BLOOD.spray(new THREE.Vector3(P.x+(Math.random()-.5)*2.4,2.2,P.z+(Math.random()-.5)*2.4),5,.4,0x8a8a8a); }
      if(w.t>=this.LEAD.vent){ this.state='drop'; this.drop(); } } },
  arrive(){ if(HIDE.in&&!HIDE.seen) this.prowl(HIDE.in); else this.attack(false); },
  async drop(){ const b=this.b, id=++this.id, live=()=>id===this.id&&this.on, zone=SHIP.zoneAt(P.x,P.z);
    const hall=BEAST.VENTS.slice().sort((a,c)=>Math.abs(a.x-P.x)-Math.abs(c.x-P.x)), v=zone==='hall'||!this.RV[zone]?(hall.find(h=>Math.abs(h.x-P.x)>=2.5)||hall[0]):this.RV[zone];
    if(!await BEAST.dropFrom(b,v,live)) return;
    if(HIDE.in&&!HIDE.seen) this.prowl(HIDE.in); else this.attack(true); },

  /* ---- 맞닥뜨림 ---- */
  async attack(enraged=false,keep=false){ const b=this.b, id=++this.id; this.state='attack'; b.mode='chase'; if(!keep) b.wk=0; b.enraged=enraged; b.rout=false; this.lost=0; this.lastP={x:P.x,z:P.z}; this.re=0;
    this.ui(enraged?'rage':'fight'); if(!enraged) this.tell('weak');
    this.busy=true; BEAST.stop(b); const w=b.wrap.position; b.wrap.rotation.y=Math.atan2(P.x-w.x,P.z-w.z); SFX.play('beast_roar',{at:w}); STING(.5); FX.shake(.4,.04);
    if(!b.low) await Promise.race([BEAST.play(b,'roar',{once:true}),sleep(2400)]); else await sleep(enraged?500:900);
    if(id===this.id) this.busy=false; },
  act(dt){ const b=this.b, w=b.wrap.position, d=Math.hypot(P.x-w.x,P.z-w.z); if(this.busy||b.stun>0||b.duct) return; const see=BEAST.sees(b);
    if(this.state==='attack'){
      if(HIDE.in){ if(HIDE.seen) return this.found(HIDE.in); return this.prowl(HIDE.in); }      // 보는 앞에서 숨었으면 끌어낸다 · 안 보이는 데서 숨었으면 놓친다
      if(see){ this.lost=0; this.lastP={x:P.x,z:P.z}; } else this.lost+=dt;
      if(d<1.45&&see) return this.grab();
      this.re-=dt; if(this.re<=0||!b.path){ this.re=.35; const T=this.lost>1.2?this.lastP:P; b.path=ROUTE.path(w.x,w.z,T.x,T.z); b.speed=b.enraged?4.3:3.1; b.move='run'; }
      if(this.lost>7) this.leave(false);
    } else if(!b.rout&&!HIDE.in&&see&&d<12) this.attack(b.enraged,true); },      // 서성이거나 돌아가는 중에 나를 보면 덤빈다
  // 약점에 맞았다 (BEAST.weakHit 이 부른다) — 다섯 발이면 물러간다
  weak(b){ if(b!==this.b||!this.on||b.enraged||b.rout) return; if(this.state!=='attack'){ if(['warn','prowl','leave'].includes(this.state)) this.attack(false,true); }
    if(this.uik==='fight') this.ui('fight'); if(b.wk>=5) this.rout(); },
  // 몸통에 맞았다 : 통하지 않는다 — 다만 내가 있는 걸 안다
  body(b){ if(b!==this.b||!this.on) return; if(!this.told.body){ this.told.body=1; toast('몸통은 통하지 않는다 — 빛나는 약점을 노려라',3200); } if(['warn','prowl','leave'].includes(this.state)&&!b.rout&&!HIDE.in) this.attack(b.enraged,true); },
  rout(){ const b=this.b; this.id++; this.busy=false; b.rout=true; b.mode='prowl'; this.ui(''); this.tell('rout'); SFX.play('beast_roar',{at:b.wrap.position,rate:1.5}); FX.shake(.3,.03); this.leave(false); },
  go(x,z,speed,live,max=18){ const b=this.b; return Promise.race([BEAST.go(b,x,z,{speed,clip:speed>2.6?'run':'walk'}),new Promise(r=>{ let t=0; const f=dt=>{ t+=dt; if(t>max||!live()){ const i=TICK.indexOf(f); if(i>=0) TICK.splice(i,1); r(); } }; TICK.push(f); })]); },
  // 숨은 곳 앞에서 서성인다 → 돌아간다
  async prowl(s){ const b=this.b, id=++this.id, live=()=>id===this.id&&this.on; this.state='prowl'; b.mode='prowl'; this.busy=false; this.ui('hide');
    const st=HIDE.stand(s); await this.go(st.x,st.z,1.5,live,16); if(!live()) return;
    BEAST.stop(b); const w=b.wrap.position; b.wrap.rotation.y=Math.atan2(s.x-w.x,s.z-w.z); BEAST.rest(b); SFX.play('beast_growl',{at:w,vol:1}); await sleep(1500); if(!live()) return;
    if(Math.random()<.5){ THUD(.35); FX.shake(.25,.025); SFX.play('locker_close',{at:s,vol:.8}); }      // 툭 건드려 본다
    await sleep(1500+Math.random()*1300); if(!live()) return;
    SFX.play('beast_growl',{at:w,vol:.7}); this.leave(true); },
  // 먼 복도 격자로 가서 올라간다 → 배 어딘가로
  async leave(passed){ const b=this.b, id=++this.id, live=()=>id===this.id&&this.on; this.state='leave'; b.mode='prowl'; this.ui(HIDE.in?'hide':'');
    const w=b.wrap.position, [hx]=this.doorXZ(), far=BEAST.VENTS.filter(v=>Math.abs(v.x-hx)>=9), v=(far.length?far:BEAST.VENTS).slice().sort((a,c)=>Math.hypot(a.x-w.x,a.z-w.z)-Math.hypot(c.x-w.x,c.z-w.z))[0];
    await this.go(v.x,v.z,b.rout?4.4:2.4,live,24); if(!live()) return;
    await BEAST.climbInto(b,v,live); if(!live()) return;
    if(passed) this.tell('pass'); this.away(this.rand(this.GAP)); },
  // 보는 앞에서 숨었다 : 문 · 뚜껑을 뜯고 끌어낸다
  async found(s){ const b=this.b, id=++this.id, live=()=>id===this.id&&this.on; this.state='found'; b.mode='found'; const st=HIDE.stand(s); await this.go(st.x,st.z,3.1,live,10); if(!live()) return;
    BEAST.stop(b); const w=b.wrap.position; b.wrap.rotation.y=Math.atan2(s.x-w.x,s.z-w.z); SFX.play('found'); if(s.kind==='locker'||s.kind==='crate') HIDE.doors(s,true,.25);
    await Promise.race([BEAST.play(b,'swipe',{once:true,fade:.05}),sleep(900)]); if(!live()) return; this.caught(); },
  async grab(){ const b=this.b, id=++this.id, w=b.wrap.position; this.busy=true; BEAST.stop(b); b.wrap.rotation.y=Math.atan2(P.x-w.x,P.z-w.z); AUDIO.tone(700,.3,'sawtooth',.07,0,-300); BEAST.play(b,'swipe',{once:true,fade:.05}); P.free=false; await sleep(450); if(id!==this.id) return; this.caught(); },
  // 잡혀간다
  caught(){ this.id++; this.busy=true; this.state='caught'; this.ui(''); FX.flash('#900000',900); SCREAM(.6); this.onCatch&&this.onCatch(); },

  tick(dt){ if(!this.on||S.phase!=='play') return;
    if(this.state==='away'){ if(!TALK.on&&!HIDE.busy) this.t-=dt; if(this.t<=0) this.come(); }
    else if(this.state==='warn') this.warn(dt);
    else if(this.state==='attack'||this.state==='prowl'||this.state==='leave') this.act(dt); },
};
