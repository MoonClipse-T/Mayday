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
  let texP=null; const tex=()=>texP||(texP=Promise.all([loadTex('sky.jpg'),loadTex('gal.jpg')]).then(([a,b])=>{ [a,b].forEach(x=>{ x.minFilter=THREE.LinearFilter; x.generateMipmaps=false; }); U.sky.value=a; U.gal.value=b; }));
  function clear(){ [mesh,jup,sun].forEach(o=>o&&o.parent&&o.parent.remove(o)); mesh=jup=sun=null; scene.background=new THREE.Color(0x020304); }
  // 밤 도시 : 큰 구 안쪽에 사진을 붙인다 (구 UV = 등장방형). turn = 창밖으로 보일 방향(라디안)
  async function city(turn=0,bright=1){ clear(); const t=await loadTex('city_night.jpg'); t.wrapS=THREE.RepeatWrapping; t.repeat.x=-1;
    mesh=new THREE.Mesh(new THREE.SphereGeometry(400,48,24),new THREE.MeshBasicMaterial({map:t,side:THREE.BackSide,depthWrite:false,fog:false,color:new THREE.Color(bright,bright,bright)}));
    mesh.rotation.y=turn; mesh.renderOrder=-1; scene.add(mesh); }
  // 우주 : 별지도 + 웜홀(방향 dir, 각 반지름 R) + 목성(방향 jdir, 각 크기 jsize)
  async function space({dir=[0,0,-1],R=.12,jdir=[.6,-.1,-1],jsize=.35,sunDir=[1,.3,.4],srot=0,jupiter=true}={}){ clear(); await tex();
    U.C.value.set(...dir).normalize(); U.R.value=R; U.srot.value=srot; U.tun.value=0;
    mat=new THREE.ShaderMaterial({uniforms:U,depthWrite:false,side:THREE.BackSide,
      vertexShader:'varying vec3 vD; void main(){ vec4 w=modelMatrix*vec4(position,1.0); vD=w.xyz-cameraPosition; gl_Position=projectionMatrix*viewMatrix*w; }',
      fragmentShader:'varying vec3 vD;'+LENS+' void main(){ gl_FragColor=vec4(lens(normalize(vD)),1.0); }'});
    mesh=new THREE.Mesh(new THREE.SphereGeometry(900,48,24),mat); mesh.renderOrder=-2; mesh.frustumCulled=false; scene.add(mesh);
    if(!jupiter){ sun=new THREE.DirectionalLight(0xfff4e6,.6); sun.position.set(...sunDir).multiplyScalar(1000); scene.add(sun); return; }
    const jt=await loadTex('jupiter_map.jpg'), d=new THREE.Vector3(...jdir).normalize(), dist=700, r=Math.tan(jsize/2)*dist;
    jup=new THREE.Mesh(new THREE.SphereGeometry(r,64,32),new THREE.MeshStandardMaterial({map:jt,roughness:1,metalness:0}));
    jup.userData.dir=d; jup.userData.dist=dist; jup.rotation.z=.05; scene.add(jup);
    sun=new THREE.DirectionalLight(0xfff4e6,2.2); sun.position.set(...sunDir).multiplyScalar(1000); sun.target=jup; scene.add(sun); }
  function tick(dt){ U.t.value+=dt; if(mesh&&mat) mesh.position.copy(camera.position);
    if(jup){ jup.position.copy(camera.position).addScaledVector(jup.userData.dir,jup.userData.dist); jup.rotation.y+=dt*.01; } }
  return {city,space,clear,tick,tex,U,get jup(){ return jup; }};
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
