/* ============================================================
   손 (4.14) — 크리스의 손이 나와서 잡고 · 돌리고 · 누르고 · 든다 (1부 · 2부 같이 쓴다)
   모델 : web/assets/hands.glb ← blender/11_손과장치.blend (Sketchfab heavy pistol animated · bumstrum · CC BY 의 오른팔에 뼈대를 다시 심었다)
     rigR · handR : 오른손 (왼손은 거울) · 자세 gun 쥔 권총 / grip 막대 쥐기 / point 가리키기 / open 펴기 / hold 그릇 들기 / pinch 집기
     pistol · muzzle2 · gunframe : 권총 (gunframe = 권총 좌표) · flashlight : 손전등 (앞 = 엄지 쪽)
   손 틀 : 원점 = 쥔 자리 · X = 엄지 쪽(쥔 막대의 방향) · Z = 팔뚝 쪽 · 손바닥은 오른손 +Y · 왼손 −Y
   ============================================================ */
'use strict';
const HANDS={POSE:{}, suit:false, list:[],
  load(){ return this._p||(this._p=loadGLB('hands').then(g=>{ this.src=g; g.updateMatrixWorld(true);
    (g.userData.animations||[]).forEach(c=>{ const d=this.POSE[c.name]={}; c.tracks.forEach(t=>{ const m=t.name.match(/^(.+)\.quaternion$/); if(m) d[m[1]]=new THREE.Quaternion().fromArray(t.values,0); }); });
    this.gunInv=g.getObjectByName('gunframe').matrixWorld.clone().invert();
    g.traverse(o=>{ if(o.isMesh){ o.frustumCulled=false; const m=o.material; m.metalness=Math.min(m.metalness,.25); if(m.name==='arms'){ m.roughness=Math.max(.75,m.roughness); m.metalness=0; m.color.setScalar(.78); } } }); })); },
  // 장갑 : 우주복을 입은 뒤 (헬멧을 쓰고 있는 동안) — 흰 소매 · 흰 장갑
  glove(){ if(!this._gl){ let m=null; this.src.traverse(o=>{ if(o.isMesh&&o.material.name==='arms') m=o.material; }); this._gl=m.clone(); this._gl.map=null; this._gl.color.setHex(0xb9bcba); this._gl.roughness=.85; this._gl.needsUpdate=true; } return this._gl; },
  // 손 하나 : side 'R' | 'L' → {g(놓는 묶음), pose(), to(), …}
  make(side,pose='open'){ const rig=THREE.SkeletonUtils.clone(this.src.getObjectByName('rigR')), g=new THREE.Group(), m=new THREE.Group(); m.add(rig); if(side==='L') m.scale.set(1,-1,1); g.add(m);
    const bones={}, B=o=>{ if(o.isBone) bones[o.name]=o; }; rig.traverse(B); rig.traverse(o=>{ if(o.isMesh){ o.frustumCulled=false; if(this.suit) o.material=this.glove(); } });
    const h={side,g,rig,bones,tip:rig.getObjectByName('tipI'),from:null,k:1,dur:.2,cur:pose};
    this.apply(h,this.POSE[pose],null,1); this.list.push(h); if(!this._f) this._f=dt=>this.tick(dt); if(!TICK.includes(this._f)) TICK.push(this._f); return h; },
  apply(h,to,from,k){ for(const n in to){ const b=h.bones[n]; if(!b) continue; if(from&&from[n]) b.quaternion.copy(from[n]).slerp(to[n],k); else b.quaternion.copy(to[n]); } },
  pose(h,name,dur=.22){ if(h.cur===name) return; const now={}; for(const n in h.bones) now[n]=h.bones[n].quaternion.clone(); h.from=now; h.cur=name; h.k=0; h.dur=dur; },
  tick(dt){ for(const h of this.list) if(h.k<1){ h.k=Math.min(1,h.k+dt/h.dur); const e=h.k*h.k*(3-2*h.k); this.apply(h,this.POSE[h.cur],h.from,e); } },
  remove(h){ if(!h) return; if(h.g.parent) h.g.parent.remove(h.g); const i=this.list.indexOf(h); if(i>=0) this.list.splice(i,1); },
  // 방향 : X 엄지 쪽 · Z 팔뚝 쪽 (X 에 맞춰 바로잡는다)
  quat(x,z){ const X=x.clone().normalize(), Z=z.clone().addScaledVector(X,-z.dot(X)).normalize(), Y=new THREE.Vector3().crossVectors(Z,X); return new THREE.Quaternion().setFromRotationMatrix(new THREE.Matrix4().makeBasis(X,Y,Z)); },
  // 어깨 : 지금 눈에서 (걷는 좌표 P — R-1 안에서는 g 의 좌표)
  shoulder(side){ const s=side==='R'?1:-1, c=Math.cos(P.yaw), n=Math.sin(P.yaw); return new THREE.Vector3(P.x+c*.2*s+n*.06,P.y+P.eye-.34,P.z-n*.2*s+c*.06); },
  // 놓기 : p 자리 · x 엄지 쪽 → 팔뚝은 어깨 쪽으로
  put(h,p,x,z){ h.g.position.copy(p); h.g.quaternion.copy(this.quat(x,z||this.shoulder(h.side).sub(p))); },
  // 화면 아래에서 나와 → p 로 (처음 나타날 때)
  enter(h,parent,p,x,dur=.55){ parent.add(h.g); const s=this.shoulder(h.side); this.put(h,s.clone().lerp(p,.12).add(new THREE.Vector3(0,-.12,0)),x); return this.to(h,p,x,dur); },
  to(h,p,x,dur=.35,z){ const p0=h.g.position.clone(), q0=h.g.quaternion.clone(), q1=this.quat(x,z||this.shoulder(h.side).sub(p)); let k=0;
    return new Promise(res=>{ const f=dt=>{ k=Math.min(1,k+dt/dur); const e=k*k*(3-2*k); h.g.position.lerpVectors(p0,p,e); h.g.quaternion.copy(q0).slerp(q1,e); if(k>=1){ TICK.splice(TICK.indexOf(f),1); res(); } }; TICK.push(f); }); },
  async exit(h,dur=.45){ if(!h||!h.g.parent) return this.remove(h); const s=this.shoulder(h.side); await this.to(h,s.add(new THREE.Vector3(0,-.25,0)),new THREE.Vector3(0,1,0),dur); this.remove(h); },
  // 검지 끝을 p 에 : 손 틀에서 본 검지 끝만큼 물러선 자리
  tipAt(h,p,x=new THREE.Vector3(0,1,0)){ this.apply(h,this.POSE.point,null,1); h.cur='point'; h.k=1; const q=this.quat(x,this.shoulder(h.side).sub(p)); h.g.updateMatrixWorld(true); const t=h.g.worldToLocal(h.tip.getWorldPosition(new THREE.Vector3())); return {p:p.clone().sub(t.applyQuaternion(q)),q,x}; },
  // 콕 누르기 : 손가락 끝으로 p 를 눌렀다 뗀다 (back = 뗄 때 물러날 쪽)
  async poke(h,p,back,dur=.16){ const a=this.tipAt(h,p), q0=h.g.quaternion.clone(), p0=h.g.position.clone(), off=a.p.clone().add(back); const mv=(pA,pB,qA,qB,d)=>new Promise(res=>{ let k=0; const f=dt=>{ k=Math.min(1,k+dt/d); const e=k*k*(3-2*k); h.g.position.lerpVectors(pA,pB,e); h.g.quaternion.copy(qA).slerp(qB,e); if(k>=1){ TICK.splice(TICK.indexOf(f),1); res(); } }; TICK.push(f); });
    await mv(p0,off,q0,a.q,dur); await mv(off,a.p,a.q,a.q,dur*.5); AUDIO.tone(1250,.03,'square',.04); await mv(a.p,off,a.q,a.q,dur*.6); },
};
