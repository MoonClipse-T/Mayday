/* ============================================================
   MAYDAY — 1인칭 엔진 (three.js r128 · 터치/키보드 겸용)
   파일 : engine.js(엔진) → people.js(사람) → sky.js(창밖) → screens.js(화면) → scenes/*.js(장면) → main.js(시작)
   맵은 Blender 에서 만들고, 이름 규칙으로 엔진이 읽는다 (루나랜드와 같은 규칙) :
     COL_(사각 충돌) · COLC_(원기둥 충돌) · FLOOR_(밟는 바닥 높이) · LIGHT_(점광원, 속성 color·i·d)
     SPAWN(시작) · SPOT_<id>(사람 · 목적지 자리, 방향 포함) · IT_<id>(조사 대상)
   장면마다 맵 하나 — LEVEL.load(key) 로 바꿔 불러온다 (회의실 → 우주선 …)
   ============================================================ */
'use strict';
const $=s=>document.querySelector(s);
const clamp=(v,a,b)=>v<a?a:v>b?b:v, lerp=(a,b,t)=>a+(b-a)*t, sleep=ms=>new Promise(r=>setTimeout(r,ms));
const IS_TOUCH=matchMedia('(pointer:coarse)').matches||('ontouchstart' in window);
document.body.classList.toggle('touch',IS_TOUCH);

/* ---------------- 소리 (합성음 — 파일 없음) ---------------- */
const AUDIO={ctx:null,
  init(){ if(this.ctx){ if(this.ctx.state==='suspended') this.ctx.resume(); return; } try{ this.ctx=new (window.AudioContext||window.webkitAudioContext)(); }catch(e){} },
  tone(f,dur,type='sine',vol=.2,t0=0,slide=0){ const c=this.ctx; if(!c) return; const o=c.createOscillator(),g=c.createGain(), t=c.currentTime+t0;
    o.type=type; o.frequency.setValueAtTime(f,t); if(slide) o.frequency.exponentialRampToValueAtTime(Math.max(20,f+slide),t+dur);
    g.gain.setValueAtTime(0,t); g.gain.linearRampToValueAtTime(vol,t+.01); g.gain.exponentialRampToValueAtTime(.0001,t+dur); o.connect(g).connect(c.destination); o.start(t); o.stop(t+dur+.05); },
  noise(dur,vol=.2,t0=0,freq=1200,type='lowpass'){ const c=this.ctx; if(!c) return; const n=c.sampleRate*dur|0, b=c.createBuffer(1,n,c.sampleRate), d=b.getChannelData(0);
    for(let i=0;i<n;i++) d[i]=Math.random()*2-1; const s=c.createBufferSource(); s.buffer=b; const f=c.createBiquadFilter(); f.type=type; f.frequency.value=freq; const g=c.createGain();
    const t=c.currentTime+t0; g.gain.setValueAtTime(vol,t); g.gain.exponentialRampToValueAtTime(.0001,t+dur); s.connect(f).connect(g).connect(c.destination); s.start(t); },
  click(){ this.tone(1400,.03,'square',.05); },
  tick(){ this.tone(2400,.015,'square',.025); },
  beep(){ this.tone(880,.12,'sine',.12); this.tone(1320,.16,'sine',.1,.12); },
  // 무전 잡음 : 띠 거른 잡음이 끊기며 이어진다
  radio(sec){ const c=this.ctx; if(!c) return; const n=c.sampleRate*sec|0, b=c.createBuffer(1,n,c.sampleRate), d=b.getChannelData(0); let g=1;
    for(let i=0;i<n;i++){ if(i%2400===0) g=Math.random()<.25?.15:.6+Math.random()*.4; d[i]=(Math.random()*2-1)*g; }
    const s=c.createBufferSource(); s.buffer=b; const f=c.createBiquadFilter(); f.type='bandpass'; f.frequency.value=1700; f.Q.value=.8; const v=c.createGain(); v.gain.value=.16;
    s.connect(f).connect(v).connect(c.destination); s.start(); },
  // 배경 웅웅거림 (건물 공조 · 선체) : level 0 ~ 1, 주파수 base
  humNode:null, hum(level,base=55){ const c=this.ctx; if(!c) return;
    if(!this.humNode){ const g=c.createGain(); g.gain.value=0; g.connect(c.destination); const os=[1,1.5,2.01].map((k,i)=>{ const o=c.createOscillator(), v=c.createGain(); o.frequency.value=base*k; v.gain.value=[.5,.2,.1][i]; o.connect(v).connect(g); o.start(); return o; }); this.humNode={g,os}; }
    this.humNode.os.forEach((o,i)=>o.frequency.setTargetAtTime(base*[1,1.5,2.01][i],c.currentTime,.5)); this.humNode.g.gain.setTargetAtTime(.045*level,c.currentTime,1); },
};
['pointerdown','keydown'].forEach(t=>addEventListener(t,()=>AUDIO.init(),{capture:true,passive:true}));

/* ---------------- 렌더러 ---------------- */
const canvas=$('#c');
const renderer=new THREE.WebGLRenderer({canvas,antialias:!IS_TOUCH,powerPreference:'high-performance'});
// 태블릿(디벗) : 그래픽 메모리를 줄인다 — GLB 속 그림을 1024 로 줄여서 푼다 (루나랜드 v36 에서 확인한 방법) · 확인용 ?lite
const LITE=IS_TOUCH||/[?&]lite/.test(location.search);
if(LITE&&typeof createImageBitmap!=='undefined'){ const cib=createImageBitmap.bind(window);
  window.createImageBitmap=(src,...a)=>src instanceof Blob&&a.length<=1?cib(src,Object.assign({},a[0],{resizeWidth:1024,resizeHeight:1024,resizeQuality:'medium'})):cib(src,...a); }
renderer.setPixelRatio(Math.min(devicePixelRatio,LITE?1:2)); renderer.outputEncoding=THREE.sRGBEncoding; renderer.toneMapping=THREE.ACESFilmicToneMapping; renderer.toneMappingExposure=1.0;
// 디벗(갤럭시 탭 · Mali) GPU 안전장치 : 반사광 계산이 넘쳐 화면이 하얗게 덮이는 문제 (루나랜드 safeShaders 그대로)
(function safeShaders(){ const C=THREE.ShaderChunk, a='float D = D_GGX( alpha, dotNH );', r='return F * ( G * D );';
  if(!C.bsdfs.includes(a)||!C.bsdfs.includes(r)) return console.warn('safeShaders : three.js 셰이더가 바뀌었다');
  C.bsdfs=C.bsdfs.split(a).join('vec3 nxh_ = cross( normal, halfDir ); float k_ = alpha / max( dot( nxh_, nxh_ ) + pow2( dotNH * alpha ), 1e-8 ); float D = min( RECIPROCAL_PI * k_ * k_, 6e4 );')
    .split(r).join('return min( F * ( G * D ), vec3( 6e4 ) );');
  C.tonemapping_fragment='{ float s_ = gl_FragColor.r + gl_FragColor.g + gl_FragColor.b; if( !( s_ >= 0.0 && s_ < 1e6 ) ) gl_FragColor.rgb = vec3( 0.0 ); }'+String.fromCharCode(10)+C.tonemapping_fragment; })();
const scene=new THREE.Scene(); scene.background=new THREE.Color(0x020304);
const camera=new THREE.PerspectiveCamera(70,1,0.05,2000); scene.add(camera);
function resize(){ renderer.setSize(innerWidth,innerHeight,false); camera.aspect=innerWidth/innerHeight; camera.updateProjectionMatrix(); }
addEventListener('resize',resize); resize();

/* ---------------- 상태 · 충돌 ---------------- */
const P={x:0,z:0,y:0,eye:1.66,yaw:0,pitch:0,vx:0,vz:0,r:0.3,speed:2.2,free:false};
const FLOORS=[], COL=[], CIRC=[], INTER=[], TICK=[];
const WORLD=new THREE.Group(); scene.add(WORLD);
const S={phase:'title',flags:{},t:0,busy:false,run:false};
function floorAt(x,z){ let y=0; for(const f of FLOORS){ if(x>f.x1&&x<f.x2&&z>f.z1&&z<f.z2) y=Math.max(y,f.y); } return y; }
function blocked(x,z){ const r=P.r;
  for(const b of COL){ if(b.on&&!b.on()) continue; if(x+r>b.x1&&x-r<b.x2&&z+r>b.z1&&z-r<b.z2) return true; }
  for(const c of CIRC){ if(c.on&&!c.on()) continue; const dx=x-c.x,dz=z-c.z,rr=c.r+r; if(dx*dx+dz*dz<rr*rr) return true; } return false; }
function move(dx,dz){ if(blocked(P.x,P.z)){ P.x+=dx; P.z+=dz; return; }      // 끼어 있으면 빠져나오게
  let nx=P.x+dx; if(!blocked(nx,P.z)) P.x=nx; else for(let k=0;k<4;k++){ dx*=.5; if(!blocked(P.x+dx,P.z)){ P.x+=dx; break; } }
  let nz=P.z+dz; if(!blocked(P.x,nz)) P.z=nz; else for(let k=0;k<4;k++){ dz*=.5; if(!blocked(P.x,P.z+dz)){ P.z+=dz; break; } } }
function addBox(x1,z1,x2,z2,on){ COL.push({x1:Math.min(x1,x2),z1:Math.min(z1,z2),x2:Math.max(x1,x2),z2:Math.max(z1,z2),on}); }

/* ---------------- 입력 : 키보드 · 마우스 끌기 · 터치(왼쪽 조이스틱 · 오른쪽 시점) ---------------- */
const keys={};
addEventListener('keydown',e=>{ keys[e.code]=true;
  if(TALK.on&&(e.code==='Space'||e.code==='Enter'||e.code==='KeyE')){ e.preventDefault(); TALK.next(); return; }
  if(S.phase!=='play') return;
  if(e.code==='KeyE'&&!S.busy) tryInteract(); if(e.code==='Escape'&&$('#doc').classList.contains('on')) closeDoc(); });
addEventListener('keyup',e=>{ keys[e.code]=false; });
const stick={id:null,cx:0,cy:0,dx:0,dy:0}, look={id:null,lx:0,ly:0,sx:0,sy:0,t0:0,moved:false};
const stickEl=$('#stick'), knob=$('#knob');
canvas.addEventListener('pointerdown',e=>{ if(TALK.on&&!P.look){ TALK.next(); return; } if((S.busy&&!P.look)||S.phase!=='play') return; canvas.setPointerCapture(e.pointerId);
  if(stick.id===null&&e.pointerType==='touch'&&e.clientX<innerWidth*.45&&P.free){ stick.id=e.pointerId; stick.cx=e.clientX; stick.cy=e.clientY;
    stickEl.style.left=(e.clientX-70)+'px'; stickEl.style.top=(e.clientY-70)+'px'; stickEl.style.bottom='auto'; stickEl.classList.add('live'); setStick(e.clientX,e.clientY); return; }
  if(look.id===null){ look.id=e.pointerId; look.lx=look.sx=e.clientX; look.ly=look.sy=e.clientY; look.t0=performance.now(); look.moved=false; } });
canvas.addEventListener('pointermove',e=>{ if(e.pointerId===stick.id){ setStick(e.clientX,e.clientY); return; }
  if(e.pointerId!==look.id) return; const dx=e.clientX-look.lx, dy=e.clientY-look.ly; look.lx=e.clientX; look.ly=e.clientY;
  if(Math.hypot(e.clientX-look.sx,e.clientY-look.sy)>8) look.moved=true; if(window.dragHook){ dragHook(dx,dy,e); return; } if(!P.free&&!P.look) return;
  const k=e.pointerType==='touch'?.0048:.0032; P.yaw-=dx*k; P.pitch=clamp(P.pitch-dy*k,-1.3,1.3); });
function endPointer(e){ if(e.pointerId===stick.id){ stick.id=null; stick.dx=stick.dy=0; knob.style.transform=''; stickEl.classList.remove('live'); stickEl.style.left=stickEl.style.top=stickEl.style.bottom=''; return; }
  if(e.pointerId===look.id){ look.id=null; if(!look.moved&&performance.now()-look.t0<400){ if(TALK.on) TALK.next(); else tapAt(e.clientX,e.clientY); } } }
canvas.addEventListener('pointerup',endPointer); canvas.addEventListener('pointercancel',endPointer);
function setStick(x,y){ let dx=x-stick.cx, dy=y-stick.cy; const m=Math.hypot(dx,dy), R=60; if(m>R){ dx=dx/m*R; dy=dy/m*R; } stick.dx=dx/R; stick.dy=dy/R; knob.style.transform=`translate(${dx}px,${dy}px)`; }
$('#run').addEventListener('pointerdown',e=>{ e.stopPropagation(); S.run=!S.run; e.currentTarget.classList.toggle('on',S.run); AUDIO.click(); });

/* ---------------- 조사 (레이캐스트) ---------------- */
const ray=new THREE.Raycaster(); ray.far=4; let hot=null;
const PICK=new THREE.MeshBasicMaterial({transparent:true,opacity:0,depthWrite:false});     // 보이지 않는 탭 판정용
function pick(nx,ny){ ray.setFromCamera(new THREE.Vector2(nx,ny),camera); const list=INTER.filter(i=>i.mesh.visible!==false&&(!i.enabled||i.enabled()));
  const hits=ray.intersectObjects(list.map(i=>i.mesh),true);
  for(const h of hits){ let o=h.object; while(o){ const it=list.find(i=>i.mesh===o); if(it) return h.distance<=(it.range||2.6)?it:null; o=o.parent; } } return null; }
function tapAt(cx,cy){ if(!P.free||S.busy) return; const it=pick(cx/innerWidth*2-1,-(cy/innerHeight)*2+1); if(it){ AUDIO.click(); it.fn(); } }
function tryInteract(){ if(!P.free||S.busy) return; const it=hot||pick(0,0); if(it){ AUDIO.click(); it.fn(); } }
$('#act').addEventListener('pointerdown',e=>{ e.stopPropagation(); tryInteract(); });
// 조사 대상 붙이기 : mesh(또는 IT_ 이름), 이름표, 동작
function interact(mesh,name,fn,o={}){ if(typeof mesh==='string') mesh=LEVEL.items[mesh]; if(!mesh) return null; const it={mesh,name,fn,range:o.range,enabled:o.enabled}; INTER.push(it); return it; }

/* ---------------- 화면 글 ---------------- */
let toastT=0; function toast(s,ms=2400){ const t=$('#toast'); t.textContent=s; t.classList.add('on'); clearTimeout(toastT); toastT=setTimeout(()=>t.classList.remove('on'),ms); }
function goal(s){ $('#goaltext').textContent=s||''; $('#goal').classList.toggle('on',!!s); if(s) AUDIO.tick(); }
function stamp(where,when){ $('#where').textContent=where; $('#when').textContent=when||''; }
function cine(on){ document.body.classList.toggle('cine',on); }      // 연출 중 : HUD 숨김
function busy(){ S.busy=TALK.on||$('#doc').classList.contains('on'); document.body.classList.toggle('talking',TALK.on); if(S.busy){ stick.dx=stick.dy=0; } }
function doc(title,html,dt=''){ return new Promise(res=>{ const d=$('#doc'); d.querySelector('h2').textContent=title; d.querySelector('.body').innerHTML=html; d.querySelector('.dt').textContent=dt;
  d.classList.add('on'); busy(); d.querySelector('.close').onclick=()=>{ closeDoc(); res(); }; }); }
function closeDoc(){ $('#doc').classList.remove('on'); AUDIO.click(); busy(); }
const fadeEl=$('#fade'); function fade(on,ms=900){ fadeEl.style.transitionDuration=ms+'ms'; fadeEl.classList.toggle('on',on); return sleep(ms); }
async function card(kick,title,sub,ms=3200){ const c=$('#card'); c.querySelector('.kick').textContent=kick; c.querySelector('.title').textContent=title; c.querySelector('.sub').textContent=sub||'';
  c.classList.add('on'); await sleep(ms); c.classList.remove('on'); await sleep(700); }

/* ---------------- 교신 자막 (대화) ----------------
   TALK.say([{who,t,ch,kind,npc}, …]) → Promise. kind : ''(사람) · 'me'(크리스 독백) · 'vega'(함선 AI) · 'radio'(무전)
   말하는 동안 npc.talking = true (people.js 가 턱 · 고개를 움직인다) */
const TALK={on:false,q:[],i:0,res:null,timer:0,full:'',
  say(lines){ return new Promise(res=>{ this.q=lines; this.i=0; this.res=res; this.on=true; $('#talk').classList.add('on'); busy(); this.show(); }); },
  show(){ const L=this.q[this.i], el=$('#talk'); this.full=L.t; el.className='on '+(L.kind||'');
    el.querySelector('.name').textContent=L.who||(L.kind==='me'?'크리스':''); el.querySelector('.ch').textContent=L.ch||(L.kind==='vega'?'VEGA':L.kind==='radio'?'무전':L.kind==='me'?'생각':'현장');
    const t=el.querySelector('.txt'); t.textContent=''; let k=0; clearInterval(this.timer); TALK.speaker(L.npc);
    if(L.fx) L.fx();
    this.timer=setInterval(()=>{ k++; t.textContent=L.t.slice(0,k); if(k%3===0&&L.kind==='vega') AUDIO.tick(); if(k>=L.t.length){ clearInterval(this.timer); el.classList.add('done'); TALK.speaker(null); if(L.auto){ const i=this.i; setTimeout(()=>{ if(this.on&&this.i===i) this.next(); },L.auto); } } },L.kind==='vega'?28:24); },
  next(){ const t=$('#talk .txt'); if(t.textContent.length<this.full.length){ clearInterval(this.timer); t.textContent=this.full; $('#talk').classList.add('done'); TALK.speaker(null); return; }
    this.i++; if(this.i<this.q.length) return this.show();
    this.on=false; $('#talk').classList.remove('on'); TALK.speaker(null); busy(); const r=this.res; this.res=null; r&&r(); },
  cur:null, speaker(npc){ if(this.cur) this.cur.talking=false; this.cur=npc||null; if(npc) npc.talking=true; },
};
$('#talk').addEventListener('pointerdown',e=>{ e.stopPropagation(); TALK.next(); });

/* ---------------- 카메라 연출 ---------------- */
let camAnim=null;
function yawTo(x,z){ const a=Math.atan2(-(x-P.x),-(z-P.z)); return P.yaw+Math.atan2(Math.sin(a-P.yaw),Math.cos(a-P.yaw)); }
function pitchTo(x,y,z){ return Math.atan2(y-(P.y+P.eye),Math.hypot(x-P.x,z-P.z)); }
function camTo(to,dur){ return new Promise(res=>{ camAnim={from:{x:P.x,z:P.z,y:P.y,yaw:P.yaw,pitch:P.pitch,eye:P.eye},to,t:0,dur,res}; }); }
function lookAt(x,y,z,dur=1.2){ return camTo({yaw:yawTo(x,z),pitch:pitchTo(x,y,z)},dur); }
function tickCam(dt){ if(!camAnim) return; camAnim.t+=dt; const k=Math.min(1,camAnim.t/camAnim.dur), e=k<.5?2*k*k:-1+(4-2*k)*k, f=camAnim.from, t=camAnim.to;
  for(const n of ['x','z','y','yaw','pitch','eye']) P[n]=lerp(f[n],t[n]??f[n],e); if(k>=1){ const r=camAnim.res; camAnim=null; r(); } }
function warp(x,z,yaw){ P.x=x; P.z=z; P.y=floorAt(x,z); P.vx=P.vz=0; if(yaw!==undefined) P.yaw=yaw; P.pitch=0; }

/* ---------------- GLB ---------------- */
const gltfLoader=new THREE.GLTFLoader(), GLB={};
async function loadGLB(key){ if(!GLB[key]) GLB[key]=fetch('web/assets/'+key+'.glb?v='+(window.V||'')).then(r=>{ if(!r.ok) throw new Error(key+'.glb '+r.status); return r.arrayBuffer(); });
  const buf=await GLB[key]; return new Promise((res,rej)=>gltfLoader.parse(buf,'',g=>{ g.scene.userData.animations=g.animations||[]; res(g.scene); },rej)); }
const texLoader=new THREE.TextureLoader();
function loadTex(file){ return new Promise((res,rej)=>texLoader.load('web/assets/'+file+'?v='+(window.V||''),t=>{ t.encoding=THREE.sRGBEncoding; res(t); },undefined,rej)); }

/* ---------------- 맵 (장면) ----------------
   LEVEL.load(key) : 앞 맵을 비우고 web/assets/<key>.glb 를 읽어 이름 규칙대로 충돌 · 자리 · 조사 대상을 만든다
   재질 이름이 baked_ 로 시작하면 조명이 그림에 구워진 것 → 빛 계산 없이 그대로 보인다 (태블릿에서 가볍고 실사처럼) */
const LEVEL={key:null,root:null,spawn:{x:0,z:0,yaw:0},spots:{},items:{},lights:[],
  async load(key){ this.clear(); this.key=key;
    const root=await loadGLB(key); WORLD.add(root); root.updateMatrixWorld(true); this.root=root;
    const kill=[], bb=new THREE.Box3(), v=new THREE.Vector3(), q=new THREE.Quaternion(), e=new THREE.Euler();
    root.traverse(o=>{ const n=o.name||'';
      if(/^COLC_/.test(n)){ bb.setFromObject(o); CIRC.push({x:(bb.min.x+bb.max.x)/2,z:(bb.min.z+bb.max.z)/2,r:(bb.max.x-bb.min.x)/2}); kill.push(o); return; }
      if(/^COL_/.test(n)){ bb.setFromObject(o); addBox(bb.min.x,bb.min.z,bb.max.x,bb.max.z); kill.push(o); return; }
      if(/^FLOOR_/.test(n)){ bb.setFromObject(o); FLOORS.push({x1:bb.min.x,x2:bb.max.x,z1:bb.min.z,z2:bb.max.z,y:bb.max.y}); kill.push(o); return; }
      if(/^LIGHT_/.test(n)){ const u=o.userData, l=new THREE.PointLight(new THREE.Color(u.color||'#ffe2c0'),u.i||1,u.d||10,1.6); o.getWorldPosition(l.position); WORLD.add(l); this.lights.push(l); return; }
      if(n==='SPAWN'||/^SPOT_/.test(n)){ o.getWorldPosition(v); o.getWorldQuaternion(q); e.setFromQuaternion(q,'YXZ'); const p={x:v.x,y:v.y,z:v.z,yaw:e.y};
        if(n==='SPAWN') this.spawn=p; else this.spots[n.slice(5)]=p; return; }
      if(/^IT_/.test(n)){ this.items[n.slice(3)]=o; dequant(o); }
      if(o.isMesh) (Array.isArray(o.material)?o.material:[o.material]).forEach(m=>{ if(/^baked_/i.test(m.name)) o.material=new THREE.MeshBasicMaterial({map:m.map,name:m.name}); });
    });
    kill.forEach(o=>o.parent&&o.parent.remove(o));
    mergeStatic(root); },
  clear(){ WORLD.clear(); COL.length=CIRC.length=FLOORS.length=INTER.length=TICK.length=0; this.spots={}; this.items={}; this.lights=[]; hot=null;
    if(typeof PEOPLE!=='undefined') PEOPLE.clear(); if(typeof SKY!=='undefined') SKY.clear(); },
};
/* 배경 합치기 (루나랜드 mergeStatic) : 움직이지 않는 메시를 같은 재질끼리 하나로 — 그리기 횟수만 줄고 모양은 그대로. IT_ · 투명 · 뼈대 메시는 빼고 · ?nomerge 끄기 */
const NQ={Int8Array:127,Uint8Array:255,Int16Array:32767,Uint16Array:65535};
function qv(a,i,c){ let v=c===0?a.getX(i):c===1?a.getY(i):c===2?a.getZ(i):a.getW(i); if(a.normalized){ const k=NQ[(a.isInterleavedBufferAttribute?a.data.array:a.array).constructor.name]; if(k) v=Math.max(v/k,-1); } return v; }
function mergeStatic(root){ if(/[?&]nomerge/.test(location.search)) return; const groups=new Map(), v=new THREE.Vector3(), nv=new THREE.Vector3(), nm=new THREE.Matrix3();
  root.updateMatrixWorld(true);
  root.traverse(o=>{ if(!o.isMesh||o.isSkinnedMesh||Array.isArray(o.material)||!o.visible) return; for(let p=o;p;p=p.parent) if(/^(IT_|ANIM_)/.test(p.name)) return;
    const g=o.geometry, m=o.material; if(!g.attributes.position||m.transparent||g.attributes.tangent||Object.keys(g.morphAttributes||{}).length) return;
    const key=m.uuid+'|'+Object.keys(g.attributes).sort().join(','); (groups.get(key)||groups.set(key,[]).get(key)).push(o); });
  groups.forEach(list=>{ if(list.length<2) return; const g0=list[0].geometry, names=Object.keys(g0.attributes); let vc=0, ic=0;
    list.forEach(o=>{ const g=o.geometry; vc+=g.attributes.position.count; ic+=g.index?g.index.count:g.attributes.position.count; });
    const out={}; names.forEach(n=>out[n]=new Float32Array(vc*g0.attributes[n].itemSize)); const idx=vc>65535?new Uint32Array(ic):new Uint16Array(ic); let vo=0, io=0;
    list.forEach(o=>{ const g=o.geometry, mw=o.matrixWorld, flip=mw.determinant()<0, n=g.attributes.position.count; nm.getNormalMatrix(mw);
      names.forEach(nn=>{ const a=g.attributes[nn], sz=a.itemSize, d=out[nn];
        if(nn==='position') for(let i=0;i<n;i++){ v.set(qv(a,i,0),qv(a,i,1),qv(a,i,2)).applyMatrix4(mw); d[(vo+i)*3]=v.x; d[(vo+i)*3+1]=v.y; d[(vo+i)*3+2]=v.z; }
        else if(nn==='normal') for(let i=0;i<n;i++){ nv.set(qv(a,i,0),qv(a,i,1),qv(a,i,2)).applyMatrix3(nm).normalize(); d[(vo+i)*3]=nv.x; d[(vo+i)*3+1]=nv.y; d[(vo+i)*3+2]=nv.z; }
        else for(let i=0;i<n;i++) for(let c=0;c<sz;c++) d[(vo+i)*sz+c]=qv(a,i,c); });
      const tri=(a,b,c)=>{ idx[io++]=vo+a; idx[io++]=vo+(flip?c:b); idx[io++]=vo+(flip?b:c); };
      if(g.index){ const ia=g.index; for(let t=0;t+2<ia.count;t+=3) tri(ia.getX(t),ia.getX(t+1),ia.getX(t+2)); } else for(let t=0;t+2<n;t+=3) tri(t,t+1,t+2);
      vo+=n; o.parent.remove(o); });
    const geo=new THREE.BufferGeometry(); names.forEach(nn=>geo.setAttribute(nn,new THREE.BufferAttribute(out[nn],g0.attributes[nn].itemSize))); geo.setIndex(new THREE.BufferAttribute(idx,1)); geo.computeBoundingSphere();
    WORLD.add(new THREE.Mesh(geo,list[0].material)); }); }
// 압축(quantize)된 GLB 는 r128 레이캐스트가 빗나간다 → 조사 대상(IT_)만 좌표를 풀어 둔다 (루나랜드 dequant)
function dequant(o){ o.traverse(m=>{ const a=m.geometry&&m.geometry.attributes.position; if(!a||!a.normalized) return;
  const k=NQ[a.array.constructor.name]||1, f=new Float32Array(a.count*3); for(let i=0;i<a.count;i++){ f[i*3]=Math.max(a.getX(i)/k,-1); f[i*3+1]=Math.max(a.getY(i)/k,-1); f[i*3+2]=Math.max(a.getZ(i)/k,-1); }
  m.geometry.setAttribute('position',new THREE.BufferAttribute(f,3)); }); }
// 맵의 화면 자리(IT_ 얇은 상자) 앞에 평면을 세운다. toward = 화면이 바라볼 쪽의 점 → 평면 메시
function screenPlane(item,toward,mat){ const bb=new THREE.Box3().setFromObject(item), c=bb.getCenter(new THREE.Vector3()), s=bb.getSize(new THREE.Vector3());
  const alongX=s.x<s.z, m=new THREE.Mesh(new THREE.PlaneGeometry(alongX?s.z:s.x,s.y),mat), sg=alongX?Math.sign(toward.x-c.x):Math.sign(toward.z-c.z);
  m.position.copy(c); if(alongX){ m.position.x+=sg*(s.x/2+.005); m.rotation.y=sg*Math.PI/2; } else { m.position.z+=sg*(s.z/2+.005); m.rotation.y=sg>0?0:Math.PI; }
  item.visible=false; WORLD.add(m); return m; }

/* ---------------- 메인 루프 ---------------- */
let last=performance.now();
function frame(now){ requestAnimationFrame(frame); const dt=Math.min(.1,(now-last)/1000); last=now; S.t+=dt;
  tickCam(dt);
  if(P.free&&!S.busy&&!camAnim&&S.phase==='play'){ let fx=0,fz=0; if(keys.KeyW||keys.ArrowUp) fz+=1; if(keys.KeyS||keys.ArrowDown) fz-=1; if(keys.KeyA||keys.ArrowLeft) fx-=1; if(keys.KeyD||keys.ArrowRight) fx+=1;
    if(stick.id!==null){ fx+=stick.dx; fz-=stick.dy; } const m=Math.hypot(fx,fz); if(m>1){ fx/=m; fz/=m; }
    const sp=P.speed*(keys.ShiftLeft||keys.ShiftRight||S.run?1.7:1), s=Math.sin(P.yaw), c=Math.cos(P.yaw);
    const vx=(-s*fz+c*fx)*sp, vz=(-c*fz-s*fx)*sp; P.vx=lerp(P.vx,vx,1-Math.pow(.001,dt)); P.vz=lerp(P.vz,vz,1-Math.pow(.001,dt)); move(P.vx*dt,P.vz*dt);
    const sp2=Math.hypot(P.vx,P.vz); P.bob=(P.bob||0)+sp2*dt*6.5; P.bobA=lerp(P.bobA||0,sp2>.3?.022:0,.1); }
  P.y=lerp(P.y,floorAt(P.x,P.z),1-Math.pow(.0005,dt));
  camera.position.set(P.x,P.y+P.eye+Math.sin(P.bob||0)*(P.bobA||0),P.z); camera.rotation.order='YXZ'; camera.rotation.set(P.pitch,P.yaw,0);
  if(P.free&&!S.busy&&S.phase==='play'){ const it=pick(0,0); if(it!==hot){ hot=it; $('#label').textContent=it?it.name:''; $('#label').classList.toggle('on',!!it); $('#reticle').classList.toggle('hot',!!it); $('#act').classList.toggle('on',!!it); } }
  else if(hot){ hot=null; $('#label').classList.remove('on'); $('#reticle').classList.remove('hot'); $('#act').classList.remove('on'); }
  TICK.forEach(f=>f(dt)); if(typeof PEOPLE!=='undefined') PEOPLE.tick(dt); if(typeof SKY!=='undefined') SKY.tick(dt); if(typeof SCREEN!=='undefined') SCREEN.tick(dt);
  renderer.render(scene,camera); }

/* 장면 등록 : SCENES.<key> = {title, async enter(){…}} — main.js 가 순서대로 부른다. 제작용 바로 가기 : 주소 ?s=<key> */
const SCENES={};
async function go(key){ S.phase='cut'; P.free=false; P.look=false; await fade(true); P.eye=1.66; camera.fov=70; camera.updateProjectionMatrix(); goal(''); window.dragHook=null; SHIPMAP.at(null); await SCENES[key].enter(); }

/* 선내도 : 왼쪽 위 작은 배 그림 — 지금 있는 구역에 불이 들어온다 (우주선 안에서만) */
const SHIPMAP={rooms:[['bridge','함교',8,40],['deck','거주 구역',56,58],['cryo','동면 C',122,40],['cryoAB','동면 A·B',170,40],['eng','기관',218,34]],
  at(key){ const el=$('#shipmap'); if(!key){ el.classList.remove('on'); return; }
    const r=this.rooms.map(([k,n,x,w])=>{ const on=k===key, lock=k==='cryoAB'||k==='eng';
      return `<rect x="${x}" y="14" width="${w}" height="18" fill="${on?'rgba(255,90,54,.22)':'rgba(233,231,226,.04)'}" stroke="${on?'#ff5a36':'rgba(233,231,226,.35)'}" stroke-width="1"${lock?' stroke-dasharray="2 2"':''}/>`
        +`<text x="${x+w/2}" y="46" fill="${on?'#ff5a36':'rgba(233,231,226,.55)'}" font-size="9" text-anchor="middle" font-family="IBM Plex Sans KR,sans-serif">${n}</text>`; }).join('');
    el.innerHTML=`<svg viewBox="0 0 260 52" role="img"><text x="0" y="8" fill="rgba(233,231,226,.4)" font-size="7" font-family="IBM Plex Mono,monospace" letter-spacing="1.4">HUY-2 · DECK PLAN</text>`
      +`<path d="M4 23 L8 14 M4 23 L8 32" stroke="rgba(233,231,226,.35)" fill="none"/><line x1="48" y1="23" x2="56" y2="23" stroke="rgba(233,231,226,.35)"/><line x1="114" y1="23" x2="122" y2="23" stroke="rgba(233,231,226,.35)"/><line x1="162" y1="23" x2="170" y2="23" stroke="rgba(233,231,226,.35)"/><line x1="210" y1="23" x2="218" y2="23" stroke="rgba(233,231,226,.35)"/>`+r+`</svg>`;
    el.classList.add('on'); } };
