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
  let texP=null; const T={}; const tex=()=>texP||(texP=Promise.all([loadTex('sky.jpg'),loadTex('gal.jpg')]).then(([a,b])=>{ [a,b].forEach(x=>{ x.minFilter=THREE.LinearFilter; x.generateMipmaps=false; }); T.home=a; T.gal=b; U.sky.value=a; U.gal.value=farTex(); }));      // 웜홀 목 안 = 건너편 하늘 (건너가면 그 하늘 안에 있다)
  // 웜홀 건너편 하늘 (4.12) : 다른 은하 안 — 은하수는 있지만 우리 것과 다르다 (사용자 : 은하가 통째로 보일 수는 없다)
  //   gal.jpg(우리 은하수 사진)를 좌우로 뒤집고 · 띠를 위아래로 1.6배 넓히고 · 중심 팽대부를 키우고 · 색을 바꾸고(푸른 별빛 · 붉은 성운) · 마젤란 구름은 지운다
  //   목 안(렌즈 안쪽)은 거꾸로 우리 은하수(sky.jpg) — 건너온 곳이 비쳐 보인다
  function farTex(){ if(T.far) return T.far; const im=T.gal.image, W=Math.min(LITE?2048:4096,im.width), H=W/2, c=document.createElement('canvas'); c.width=W; c.height=H; const x=c.getContext('2d');
    x.translate(W,0); x.scale(-1,1); const k=1.6; x.drawImage(im,0,0,im.width,im.height,0,H/2-H*k/2,W,H*k); x.setTransform(1,0,0,1,0,0);
    // 마젤란 구름 자리(뒤집고 넓힌 뒤) : 옆의 별밭으로 덮는다
    [[.28,.77,.035],[.34,.9,.022]].forEach(([u,v,r])=>{ const R=r*W; x.save(); x.beginPath(); x.arc(u*W,v*H,R,0,7); x.clip(); x.drawImage(c,u*W-R+.12*W,v*H-R,2*R,2*R,u*W-R,v*H-R,2*R,2*R); x.restore(); });
    // 색 : 밝은 곳은 푸르고 희게, 어두운 먼지 띠 둘레는 붉은 보라로 — 우리 은하수(누런 갈색)와 다르게
    const d=x.getImageData(0,0,W,H), p=d.data; for(let i=0;i<p.length;i+=4){ const r=p[i],g=p[i+1],b=p[i+2], L=(r+g+b)/3, t=Math.min(1,L/150);
      p[i]=Math.min(255,L*(1.05-.25*t)+(r-L)*.4+18*(1-t)*t*2); p[i+1]=Math.min(255,L*(.88+.08*t)); p[i+2]=Math.min(255,L*(1.0+.35*t)+(b-L)*.4+10*(1-t)*t*2); }
    x.putImageData(d,0,0);
    // 중심 팽대부를 조금 더 밝고 크게 (다른 은하의 중심)
    x.globalCompositeOperation='lighter'; const cx=.5*W, cy=.5*H, g=x.createRadialGradient(cx,cy,0,cx,cy,W*.09); g.addColorStop(0,'rgba(255,230,210,.35)'); g.addColorStop(1,'rgba(255,200,190,0)');
    x.setTransform(1.8,0,0,1,-cx*.8,0); x.fillStyle=g; x.fillRect(cx-W*.09,cy-W*.09,W*.18,W*.18); x.setTransform(1,0,0,1,0,0); x.globalCompositeOperation='source-over';
    const t=new THREE.CanvasTexture(c); t.minFilter=THREE.LinearFilter; t.generateMipmaps=false; return T.far=t; }
  function clear(){ [mesh,jup,sun].forEach(o=>o&&o.parent&&o.parent.remove(o)); mesh=jup=sun=null; scene.background=new THREE.Color(0x020304); }
  // 밤 도시 : 큰 구 안쪽에 사진을 붙인다 (구 UV = 등장방형). turn = 창밖으로 보일 방향(라디안)
  async function city(turn=0,bright=1){ clear(); const t=await loadTex('city_night.jpg'); t.wrapS=THREE.RepeatWrapping; t.repeat.x=-1;
    mesh=new THREE.Mesh(new THREE.SphereGeometry(400,48,24),new THREE.MeshBasicMaterial({map:t,side:THREE.BackSide,depthWrite:false,fog:false,color:new THREE.Color(bright,bright,bright)}));
    mesh.rotation.y=turn; mesh.renderOrder=-1; scene.add(mesh); }
  // 우주 : 별지도 + 웜홀(방향 dir, 각 반지름 R) + 목성(방향 jdir, 각 크기 jsize)
  async function space({dir=[0,0,-1],R=.12,jdir=[.6,-.1,-1],jsize=.35,sunDir=[1,.3,.4],srot=0,jupiter=true,ptex='jupiter_map.jpg',far=false}={}){ clear(); await tex();
    U.sky.value=far?farTex():T.home; U.gal.value=far?T.home:farTex();      // 건너편 : 다른 하늘 · 목 안에 우리 은하수
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
