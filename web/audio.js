/* ============================================================
   소리 (4.2) — ElevenLabs 로 만든 목소리 · 배경 음악 · 효과음 (web/audio/)
   VOICE : 대사 글과 같은 줄의 목소리 (web/audio/voice/<인물>_<번호>.mp3 · 줄 목록 voice/lines.json = tools/lines.json)
           TALK 가 한 줄을 띄우면 그 목소리를 틀고, 넘기면 멈춘다
   MUSIC : brief(회의) · space(구조정) · derelict(1호 탐색) · chase(쫓길 때) — 천천히 바꿔 튼다
   SFX   : 효과음 (가까울수록 크게 · 왼쪽 오른쪽으로) — 파일을 아직 못 받았으면 합성음으로
   ============================================================ */
'use strict';
const SFX=(()=>{ const buf={}, base='web/audio/sfx/';
  const NAMES=['shot','burst','larva_hiss','larva_hurt','larva_die','larva_leap','jumpscare','struggle','thrown','bite','locker_open','locker_close','crawl','breath','gasp','found','beast_roar','beast_growl','beast_step','beast_eat','dock','thruster','airlock','heartbeat'];
  const ALIAS={cloth:'crawl',kneel:'crawl'}, VOL={shot:.55,larva_hiss:.45,breath:.5,heartbeat:.8,beast_step:.7,crawl:.6,thruster:.35};
  // 합성음 (파일이 없을 때)
  const SYN={shot:()=>{ AUDIO.noise(.12,.35,0,5200,'highpass'); AUDIO.tone(1800,.18,'sawtooth',.06,0,-1500); },burst:()=>{ AUDIO.noise(.5,.3,0,700); AUDIO.tone(900,.4,'sawtooth',.05,0,600); },
    jumpscare:()=>{ AUDIO.noise(.8,.7,0,4200); AUDIO.tone(1500,.75,'sawtooth',.13,0,-1250); AUDIO.tone(52,1.1,'square',.12); },heartbeat:()=>{ AUDIO.tone(48,.18,'sine',.1); setTimeout(()=>AUDIO.tone(42,.14,'sine',.08),160); }};
  async function load(n){ if(buf[n]!==undefined||!AUDIO.ctx) return; buf[n]=null; try{ const r=await fetch(base+n+'.mp3?v='+(window.V||'')); if(!r.ok) throw 0; buf[n]=await AUDIO.ctx.decodeAudioData(await r.arrayBuffer()); }catch(e){ buf[n]=false; } }
  function preload(){ AUDIO.init(); NAMES.forEach(load); }
  // at : 소리 난 자리 (없으면 머리 안) · vol : 크기 · rate : 빠르기(조금씩 달리)
  function play(name,{at=null,vol=1,rate=null}={}){ name=ALIAS[name]||name; const c=AUDIO.ctx; if(!c) return;
    const b=buf[name]; if(!b){ if(b===undefined) load(name); if(SYN[name]) SYN[name](); return; }
    const s=c.createBufferSource(); s.buffer=b; s.playbackRate.value=rate||(.94+Math.random()*.12); const g=c.createGain(); let v=vol*(VOL[name]||1);
    let node=s; if(at){ const cp=camera.getWorldPosition(new THREE.Vector3()), d=cp.distanceTo(new THREE.Vector3(at.x,at.y||1,at.z)); v*=1/(1+Math.max(0,d-1)/3.5); if(d>30) return;
      const p=c.createStereoPanner?c.createStereoPanner():null; if(p){ const r=new THREE.Vector3(1,0,0).applyQuaternion(camera.quaternion), dir=new THREE.Vector3(at.x-cp.x,0,at.z-cp.z).normalize(); p.pan.value=clamp(dir.dot(r),-1,1)*.8; s.connect(p); node=p; } }
    g.gain.value=v; node.connect(g).connect(c.destination); s.start(); return s; }
  return {play,preload,NAMES}; })();

const MUSIC={cur:null,el:null,vol:.42,
  play(name,{vol=this.vol,fade=2.5}={}){ if(this.cur===name) return; this.cur=name; const old=this.el;
    if(old) this.ramp(old,0,fade,()=>{ old.pause(); old.src=''; });
    if(!name){ this.el=null; return; }
    const el=new Audio('web/audio/music/'+name+'.mp3?v='+(window.V||'')); el.loop=true; el.volume=0; el.play().catch(()=>{}); this.el=el; this.ramp(el,vol,fade); },
  ramp(el,to,sec,done){ const from=el.volume, t0=performance.now(); const f=()=>{ const k=Math.min(1,(performance.now()-t0)/(sec*1000)); el.volume=from+(to-from)*k; if(k<1) setTimeout(f,50); else done&&done(); }; f(); },
  duck(on){ if(this.el) this.ramp(this.el,on?this.vol*.45:this.vol,.4); } };

const VOICE={map:null,el:null,
  async load(){ if(this.map) return; this.map={}; try{ const L=await (await fetch('web/audio/voice/lines.json?v='+(window.V||''))).json();
    for(const [k,arr] of Object.entries(L)) arr.forEach((t,i)=>{ if(t.replace(/[….\s]/g,'')) this.map[t]=k+'_'+i; }); }catch(e){} },
  play(t){ this.stop(); const f=this.map&&this.map[t]; if(!f) return; const el=new Audio('web/audio/voice/'+f+'.mp3?v='+(window.V||'')); el.volume=1; el.play().catch(()=>{}); this.el=el; MUSIC.duck(true); el.onended=()=>MUSIC.duck(false); },
  stop(){ if(this.el){ this.el.pause(); this.el=null; MUSIC.duck(false); } } };
// 대사 한 줄 = 목소리 한 줄 (TALK 를 감싼다)
{ const show=TALK.show.bind(TALK), next=TALK.next.bind(TALK);
  TALK.show=function(){ const L=this.q[this.i]; VOICE.play(L&&L.t); show(); };
  TALK.next=function(){ const done=$('#talk .txt').textContent.length>=this.full.length; if(done) VOICE.stop(); next(); }; }
addEventListener('pointerdown',()=>{ SFX.preload(); VOICE.load(); },{once:true,capture:true});
addEventListener('keydown',()=>{ SFX.preload(); VOICE.load(); },{once:true,capture:true});
