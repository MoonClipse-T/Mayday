/* ============================================================
   SKY : 창밖 — 회의실은 밤 도시(Poly Haven rooftop_night), 우주선은 실제 별지도 + 웜홀 + 목성
   웜홀 렌즈 : 화면 점마다 시선 d 와 웜홀 방향 c 의 각 θ 를 구해
     θ < R : 목 안 — 건너편 하늘을 어안처럼 · θ ≥ R : 빛이 α = R²/θ 만큼 꺾여 들어온 쪽의 별(아인슈타인 고리)
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
const SKY=(()=>{ let mesh=null, jup=null, sun=null, mat=null, pts=[]; const U={sky:{value:null},gal:{value:null},C:{value:new THREE.Vector3(0,0,-1)},R:{value:.12},t:{value:0},srot:{value:0},tun:{value:0}};
  let texP=null; const T={}; const tex=()=>texP||(texP=loadTex('sky.jpg').then(a=>{ a.minFilter=THREE.LinearFilter; a.generateMipmaps=false; T.home=a; U.sky.value=a; U.gal.value=throatTex(); }));      // 웜홀 목 안 = 건너편 하늘 (건너가면 그 하늘 안에 있다)
  // 웜홀 건너편 하늘 (4.16 사용자 : 은하수를 없애고 깜깜한 하늘에 별만 조금) — 은하 맨 가장자리, 별이 드문 곳
  //   그림(starTex)은 희미한 잔별만 · 눈에 띄는 별은 점(dots)으로 또렷하게. 웜홀 목 안(렌즈 안쪽)은 같은 하늘이 한데 모여 보이므로 별이 더 촘촘하다
  const TINT=[[255,255,255],[255,255,255],[214,226,255],[186,206,255],[255,244,214],[255,226,170],[255,190,130]];
  function starTex(W,n,hi,haze){ const H=W/2, c=document.createElement('canvas'); c.width=W; c.height=H; const x=c.getContext('2d'); x.fillStyle=haze||'#000'; x.fillRect(0,0,W,H);
    for(let i=0;i<n;i++){ const u=Math.random(), th=Math.acos(1-2*Math.random())/Math.PI, b=Math.pow(Math.random(),3.2)*hi+.1, t=TINT[Math.random()*TINT.length|0], r=.45+b*.55; x.fillStyle=`rgba(${t[0]},${t[1]},${t[2]},${Math.min(1,b)})`; x.beginPath(); x.ellipse(u*W,th*H,r/Math.max(.2,Math.sin(th*Math.PI)),r,0,0,7); x.fill(); }
    const t=new THREE.CanvasTexture(c); t.encoding=THREE.sRGBEncoding; t.minFilter=THREE.LinearFilter; t.generateMipmaps=false; return t; }
  function farTex(){ return T.far||(T.far=starTex(LITE?2048:4096,LITE?1500:2600,.42)); }
  function throatTex(){ return T.throat||(T.throat=starTex(2048,LITE?2600:3600,1.1,'#02050b')); }
  // 또렷한 별 : 크기 셋의 점 (카메라를 따라다닌다)
  function dots(){ const px=renderer.getPixelRatio(), cv=document.createElement('canvas'); cv.width=cv.height=32; const g=cv.getContext('2d'), gr=g.createRadialGradient(16,16,0,16,16,16); gr.addColorStop(0,'#fff'); gr.addColorStop(.35,'rgba(255,255,255,.75)'); gr.addColorStop(1,'rgba(255,255,255,0)'); g.fillStyle=gr; g.fillRect(0,0,32,32); const map=new THREE.CanvasTexture(cv);
    [[2.4,LITE?300:420,.62],[3.6,130,.9],[5.6,30,1.15]].forEach(([size,n,k])=>{ const pos=new Float32Array(n*3), col=new Float32Array(n*3); for(let i=0;i<n;i++){ const z=2*Math.random()-1, a=Math.random()*6.2832, r=Math.sqrt(1-z*z); pos.set([r*Math.cos(a)*850,z*850,r*Math.sin(a)*850],i*3); const t=TINT[Math.random()*TINT.length|0], b=k*(.4+.6*Math.random())/255; col.set(t.map(v=>v*b),i*3); }
      const ge=new THREE.BufferGeometry(); ge.setAttribute('position',new THREE.BufferAttribute(pos,3)); ge.setAttribute('color',new THREE.BufferAttribute(col,3));
      const m=new THREE.Points(ge,new THREE.PointsMaterial({size:size*px,sizeAttenuation:false,vertexColors:true,map,transparent:true,depthWrite:false,fog:false,toneMapped:false})); m.frustumCulled=false; m.renderOrder=-1; scene.add(m); pts.push(m); }); }
  function clear(){ pts.forEach(o=>o.geometry.dispose()); [mesh,jup,sun,...pts].forEach(o=>o&&o.parent&&o.parent.remove(o)); mesh=jup=sun=null; pts=[]; scene.background=new THREE.Color(0x020304); }
  // 밤 도시 : 큰 구 안쪽에 사진을 붙인다 (구 UV = 등장방형). turn = 창밖으로 보일 방향(라디안)
  async function city(turn=0,bright=1){ clear(); const t=await loadTex('city_night.jpg'); t.wrapS=THREE.RepeatWrapping; t.repeat.x=-1;
    mesh=new THREE.Mesh(new THREE.SphereGeometry(400,48,24),new THREE.MeshBasicMaterial({map:t,side:THREE.BackSide,depthWrite:false,fog:false,color:new THREE.Color(bright,bright,bright)}));
    mesh.rotation.y=turn; mesh.renderOrder=-1; scene.add(mesh); }
  // 우주 : 별지도 + 웜홀(방향 dir, 각 반지름 R) + 목성(방향 jdir, 각 크기 jsize)
  async function space({dir=[0,0,-1],R=.12,jdir=[.6,-.1,-1],jsize=.35,sunDir=[1,.3,.4],srot=0,jupiter=true,ptex='jupiter_map.jpg',far=false,sunI=.6}={}){ clear(); await tex();
    U.sky.value=far?farTex():T.home; U.gal.value=far?T.home:throatTex(); if(far) dots();      // 건너편 : 다른 하늘 · 목 안에 우리 은하수
    U.C.value.set(...dir).normalize(); U.R.value=R; U.srot.value=srot; U.tun.value=0;
    mat=new THREE.ShaderMaterial({uniforms:U,depthWrite:false,side:THREE.BackSide,
      vertexShader:'varying vec3 vD; void main(){ vec4 w=modelMatrix*vec4(position,1.0); vD=w.xyz-cameraPosition; gl_Position=projectionMatrix*viewMatrix*w; }',
      fragmentShader:'varying vec3 vD;'+LENS+' void main(){ gl_FragColor=vec4(lens(normalize(vD)),1.0); }'});
    mesh=new THREE.Mesh(new THREE.SphereGeometry(900,48,24),mat); mesh.renderOrder=-2; mesh.frustumCulled=false; scene.add(mesh);
    if(!jupiter){ sun=new THREE.DirectionalLight(0xfff4e6,sunI); sun.position.set(...sunDir).multiplyScalar(1000); scene.add(sun); if(SKYMASK.on) SKYMASK.set(true); return; }
    const PT=SKY._pt||(SKY._pt={}), jt=await (PT[ptex]||(PT[ptex]=loadTex(ptex))), d=new THREE.Vector3(...jdir).normalize(), dist=700, r=Math.tan(jsize/2)*dist;
    jup=new THREE.Mesh(new THREE.SphereGeometry(r,64,32),new THREE.MeshStandardMaterial({map:jt,roughness:1,metalness:0}));
    jup.userData.dir=d; jup.userData.dist=dist; jup.rotation.z=.05; scene.add(jup);
    sun=new THREE.DirectionalLight(0xfff4e6,2.2); sun.position.set(...sunDir).multiplyScalar(1000); sun.target=jup; scene.add(sun); if(SKYMASK.on) SKYMASK.set(true); }
  function tick(dt){ U.t.value+=dt; if(mesh&&mat) mesh.position.copy(camera.position); pts.forEach(o=>o.position.copy(camera.position));
    if(jup){ jup.position.copy(camera.position).addScaledVector(jup.userData.dir,jup.userData.dist); jup.rotation.y+=dt*.01; } }
  return {city,space,clear,tick,tex,U,get jup(){ return jup; },mats:()=>[mesh&&mesh.material,jup&&jup.material,...pts.map(o=>o.material)].filter(Boolean)};
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
