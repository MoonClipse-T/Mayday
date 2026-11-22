/* ============================================================
   SKY : 창밖 — 회의실은 밤 도시(Poly Haven rooftop_night), 우주선은 실제 별지도 + 웜홀 + 목성
   웜홀 렌즈 : 화면 점마다 시선 d 와 웜홀 방향 c 의 각 θ 를 구해
     θ < R : 목 안 — 건너편 은하(gal.jpg)를 어안처럼 · θ ≥ R : 빛이 α = R²/θ 만큼 꺾여 들어온 쪽의 별(아인슈타인 고리)
   WH.target() : 같은 계산을 렌더 타깃에 그려 회의실 화면에 띄운다
   ============================================================ */
'use strict';
const LENS=`
uniform sampler2D sky, gal; uniform vec3 C; uniform float R, t, srot, tun;
const float PI=3.14159265;
vec3 eq(sampler2D tx, vec3 d){ return texture2D(tx, vec2(atan(d.x,-d.z)/(2.0*PI)+0.5, asin(clamp(d.y,-1.0,1.0))/PI+0.5)).rgb; }
vec3 roty(vec3 d, float a){ float s=sin(a), c=cos(a); return vec3(c*d.x+s*d.z,d.y,-s*d.x+c*d.z); }
vec3 lens(vec3 d){
  float th=acos(clamp(dot(d,C),-1.0,1.0)); vec3 q=d-C*dot(d,C); q=length(q)>1e-5?normalize(q):vec3(1.0,0.0,0.0);
  if(th<R){ float ph=th/R*PI; vec3 d2=roty(normalize(C*cos(ph)+q*sin(ph)),t*.02);
    vec3 g=eq(gal,d2)*vec3(1.15,1.0,.9)*1.5*(smoothstep(1.0,.86,th/R)*.85+.15);
    if(tun>0.0){ float k=th/R; float rings=.5+.5*sin(log(k+.02)*14.0-t*9.0); g=mix(g,g*(.6+1.6*rings)+vec3(.25,.35,.5)*rings*k,tun); }
    return g; }
  float ps=th-R*R/th; vec3 col=eq(sky,roty(normalize(C*cos(ps)+q*sin(ps)),srot))*1.25;
  col+=vec3(1.0,.92,.82)*exp(-pow((th-R)/(R*.035),2.0))*.6; return col*(1.0+.6*exp(-(th-R)/(R*.5))); }`;
const SKY=(()=>{ let mesh=null, jup=null, sun=null, mat=null; const U={sky:{value:null},gal:{value:null},C:{value:new THREE.Vector3(0,0,-1)},R:{value:.12},t:{value:0},srot:{value:0},tun:{value:0}};
  let texP=null; const T={}; const tex=()=>texP||(texP=Promise.all([loadTex('sky.jpg'),loadTex('gal.jpg')]).then(([a,b])=>{ [a,b].forEach(x=>{ x.minFilter=THREE.LinearFilter; x.generateMipmaps=false; }); U.sky.value=a; U.gal.value=b; T.home=a; T.gal=b; }));
  // 웜홀 건너편 하늘 (4.11) : 은하수 띠가 없다 — 드문 별 · 옅은 성운 · 멀리 커다란 나선 은하 하나 · 작은 은하 둘 (캔버스로 한 번 그린다 · 등장방형)
  //   목 안(렌즈 안쪽)은 거꾸로 우리 은하수(sky.jpg) — 건너온 곳이 비쳐 보인다
  function farTex(){ if(T.far) return T.far; const W=LITE?2048:4096, H=W/2, c=document.createElement('canvas'); c.width=W; c.height=H; const x=c.getContext('2d'); let sd=7; const R=()=>(sd=(sd*16807)%2147483647)/2147483647;
    x.fillStyle='#010103'; x.fillRect(0,0,W,H); x.globalCompositeOperation='lighter';
    const blob=(px,py,r,col,a)=>{ const g=x.createRadialGradient(px,py,0,px,py,r); g.addColorStop(0,'rgba('+col+','+a+')'); g.addColorStop(1,'rgba('+col+',0)'); x.fillStyle=g; x.fillRect(px-r,py-r,2*r,2*r); };
    [[.12,.35,.16,'150,60,90',.07],[.18,.42,.1,'60,120,150',.06],[.72,.7,.2,'90,50,120',.05],[.8,.62,.09,'160,80,60',.05],[.45,.2,.12,'50,90,130',.04]].forEach(([u,v,r,c2,a])=>{ for(let i=0;i<14;i++) blob((u+(R()-.5)*r*.8)*W,(v+(R()-.5)*r*.5)*H,r*W*(.15+R()*.3),c2,a); });
    const N=LITE?3500:7000; for(let i=0;i<N;i++){ const u=R(), v=Math.acos(2*R()-1)/Math.PI, m=Math.pow(R(),9), px=u*W, py=v*H, sz=(.3+m*1.1)*W/4096, t=R(), col=t<.15?'255,190,150':t<.35?'180,205,255':'240,240,255';
      x.fillStyle='rgba('+col+','+(.2+m*.8)+')'; x.beginPath(); x.arc(px,py,sz,0,7); x.fill(); if(m>.7) blob(px,py,sz*4,col,.1); }
    // 나선 은하 : 두 팔 로그 나선 · 노란 중심 · 푸른 팔 · 기울어진 원반 (가로로 늘린 것은 등장방형 위도 보정)
    const gal=(gu,gv,size,tilt,rot,seed)=>{ const cx=gu*W, cy=gv*H, S=size*W, sx=1/Math.cos((gv-.5)*Math.PI); sd=seed; const cs=Math.cos(rot), sn=Math.sin(rot);
      const at=(ex,ey)=>[cx+(ex*cs-ey*tilt*sn)*sx, cy+ex*sn+ey*tilt*cs];
      // 원반 빛 (넓고 옅게) → 팔을 따라 뭉게뭉게 → 별 알갱이 → 팔 사이 먼지 → 밝은 중심
      for(let i=0;i<40;i++){ const a=R()*7, r=S*.35*Math.sqrt(R()); const [X,Y]=at(Math.cos(a)*r,Math.sin(a)*r); blob(X,Y,S*.22,'150,165,210',.025); }
      const arm=(t,k)=>{ const th=t*1.55+k*Math.PI, r=S*.05*Math.exp(.6*t); return [Math.cos(th)*r,Math.sin(th)*r,r]; };
      for(let i=0;i<(LITE?260:520);i++){ const t=.4+R()*3.2, [ex,ey,r]=arm(t,i%2), j=r*.22; const [X,Y]=at(ex+(R()-.5)*j,ey+(R()-.5)*j); blob(X,Y,S*(.03+R()*.04),R()<.15?'255,150,180':'140,170,255',.045); }
      const n=LITE?9000:20000; for(let i=0;i<n;i++){ const t=Math.pow(R(),.8)*3.6, [ex,ey,r]=arm(t,i%2), j=r*(.18+.3*R()); const [X,Y]=at(ex+(R()-.5)*j*2,ey+(R()-.5)*j*2);
        x.fillStyle=R()<.12?'rgba(255,190,200,.25)':'rgba('+(190+R()*60|0)+','+(205+R()*40|0)+',255,'+(.05+R()*.2)+')'; x.fillRect(X,Y,W/4096*1.3,W/4096*1.3); }
      x.globalCompositeOperation='source-over'; for(let i=0;i<300;i++){ const t=.5+R()*3, [ex,ey,r]=arm(t+.35,i%2); const [X,Y]=at(ex+(R()-.5)*r*.15,ey+(R()-.5)*r*.15); x.fillStyle='rgba(8,5,6,'+(.04+R()*.06)+')'; x.beginPath(); x.arc(X,Y,S*(.008+R()*.014),0,7); x.fill(); }
      x.globalCompositeOperation='lighter'; blob(cx,cy,S*.07,'255,236,200',.8); blob(cx,cy,S*.16,'255,215,165',.32); blob(cx,cy,S*.32,'255,205,160',.08); };
    gal(.62,.4,.15,.42,.5,11); gal(.27,.66,.018,.35,-.3,23); gal(.9,.3,.011,.6,1.1,31);
    const t=new THREE.CanvasTexture(c); t.encoding=THREE.sRGBEncoding; t.minFilter=THREE.LinearFilter; t.generateMipmaps=false; return T.far=t; }
  function clear(){ [mesh,jup,sun].forEach(o=>o&&o.parent&&o.parent.remove(o)); mesh=jup=sun=null; scene.background=new THREE.Color(0x020304); }
  // 밤 도시 : 큰 구 안쪽에 사진을 붙인다 (구 UV = 등장방형). turn = 창밖으로 보일 방향(라디안)
  async function city(turn=0,bright=1){ clear(); const t=await loadTex('city_night.jpg'); t.wrapS=THREE.RepeatWrapping; t.repeat.x=-1;
    mesh=new THREE.Mesh(new THREE.SphereGeometry(400,48,24),new THREE.MeshBasicMaterial({map:t,side:THREE.BackSide,depthWrite:false,fog:false,color:new THREE.Color(bright,bright,bright)}));
    mesh.rotation.y=turn; mesh.renderOrder=-1; scene.add(mesh); }
  // 우주 : 별지도 + 웜홀(방향 dir, 각 반지름 R) + 목성(방향 jdir, 각 크기 jsize)
  async function space({dir=[0,0,-1],R=.12,jdir=[.6,-.1,-1],jsize=.35,sunDir=[1,.3,.4],srot=0,jupiter=true,ptex='jupiter_map.jpg',far=false}={}){ clear(); await tex();
    U.sky.value=far?farTex():T.home; U.gal.value=far?T.home:T.gal;      // 건너편 : 다른 하늘 · 목 안에 우리 은하수
    U.C.value.set(...dir).normalize(); U.R.value=R; U.srot.value=srot; U.tun.value=0;
    mat=new THREE.ShaderMaterial({uniforms:U,depthWrite:false,side:THREE.BackSide,
      vertexShader:'varying vec3 vD; void main(){ vec4 w=modelMatrix*vec4(position,1.0); vD=w.xyz-cameraPosition; gl_Position=projectionMatrix*viewMatrix*w; }',
      fragmentShader:'varying vec3 vD;'+LENS+' void main(){ gl_FragColor=vec4(lens(normalize(vD)),1.0); }'});
    mesh=new THREE.Mesh(new THREE.SphereGeometry(900,48,24),mat); mesh.renderOrder=-2; mesh.frustumCulled=false; scene.add(mesh);
    if(!jupiter){ sun=new THREE.DirectionalLight(0xfff4e6,.6); sun.position.set(...sunDir).multiplyScalar(1000); scene.add(sun); if(SKYMASK.on) SKYMASK.set(true); return; }
    const PT=SKY._pt||(SKY._pt={}), jt=await (PT[ptex]||(PT[ptex]=loadTex(ptex))), d=new THREE.Vector3(...jdir).normalize(), dist=700, r=Math.tan(jsize/2)*dist;
    jup=new THREE.Mesh(new THREE.SphereGeometry(r,64,32),new THREE.MeshStandardMaterial({map:jt,roughness:1,metalness:0}));
    jup.userData.dir=d; jup.userData.dist=dist; jup.rotation.z=.05; scene.add(jup);
    sun=new THREE.DirectionalLight(0xfff4e6,2.2); sun.position.set(...sunDir).multiplyScalar(1000); sun.target=jup; scene.add(sun); if(SKYMASK.on) SKYMASK.set(true); }
  function tick(dt){ U.t.value+=dt; if(mesh&&mat) mesh.position.copy(camera.position);
    if(jup){ jup.position.copy(camera.position).addScaledVector(jup.userData.dir,jup.userData.dist); jup.rotation.y+=dt*.01; } }
  return {city,space,clear,tick,tex,U,get jup(){ return jup; },mats:()=>[mesh&&mesh.material,jup&&jup.material].filter(Boolean)};
})();
// 회의실 화면용 : 웜홀을 렌더 타깃에 그린다 (같은 렌즈 계산, 평면 화면이라 시선은 화면 좌표로)
const WH={ rt:null, sc:null, cam:null, U:null,
  async target(w=1024,h=576){ await SKY.tex(); this.rt=new THREE.WebGLRenderTarget(w,h); this.U={sky:SKY.U.sky,gal:SKY.U.gal,C:{value:new THREE.Vector3(0,0,-1)},R:{value:.17},t:{value:0},srot:{value:0},tun:{value:0},asp:{value:w/h}};
    this.sc=new THREE.Scene(); this.cam=new THREE.OrthographicCamera(-1,1,1,-1,0,1);
    this.sc.add(new THREE.Mesh(new THREE.PlaneGeometry(2,2),new THREE.ShaderMaterial({uniforms:this.U,
      vertexShader:'varying vec2 vUv; void main(){ vUv=uv; gl_Position=vec4(position.xy,0.0,1.0); }',
      fragmentShader:'varying vec2 vUv; uniform float asp;'+LENS+' void main(){ vec2 p=(vUv-0.5)*vec2(asp,1.0)*1.1; gl_FragColor=vec4(lens(normalize(vec3(p,-1.0))),1.0); }'})));
    this.rt.texture.encoding=THREE.sRGBEncoding; return this.rt.texture; },
  render(dt){ if(!this.rt) return; this.U.t.value+=dt; this.U.R.value=Math.min(.2,this.U.R.value+dt*.003); const prev=renderer.getRenderTarget(); renderer.setRenderTarget(this.rt); renderer.render(this.sc,this.cam); renderer.setRenderTarget(prev); } };
