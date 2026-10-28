/* ============================================================
   SCREEN : 회의실 대형 화면 — 실제 관제실 자료처럼 계속 움직이는 대시보드 (캔버스로 매 프레임)
   국장이 말하며 SCREEN.show('gravity') 처럼 넘긴다. 패널 비율 16:7 (논리 크기 1600×700)
   웜홀 : sky.js 렌즈 계산을 렌더 타깃(WH)으로 띄우고, 그 위에 투명 캔버스(측정 표시)를 한 장 더 겹친다
   ============================================================ */
'use strict';
const SCREEN=(()=>{ const W=1600,H=700; let cv,g,tex,mesh,ov,og,otex,oMesh,mode='off',t=0,clock=0,whTex=null; const img={};
  const CW=LITE?1600:2048, K=CW/W;
  const F=(w,s)=>`${w} ${s}px "IBM Plex Sans KR","Malgun Gothic",sans-serif`, M=(s,w=500)=>`${w} ${s}px "IBM Plex Mono",Consolas,monospace`;
  const INK='#ece9e3', MUTE='rgba(233,231,226,.55)', DIM='rgba(233,231,226,.3)', HAIR='rgba(233,231,226,.14)', AL='#ff5a36', CY='#9fd8ff', BG='#05080c';
  const loadImg=k=>img[k]||(img[k]=new Promise(r=>{ const i=new Image(); i.onload=()=>r(i); i.onerror=()=>r(null); i.src='web/assets/'+k+'.jpg'; }));
  async function mount(item,toward){
    cv=document.createElement('canvas'); cv.width=CW; cv.height=Math.round(H*K); g=cv.getContext('2d'); g.scale(K,K);
    tex=new THREE.CanvasTexture(cv); tex.encoding=THREE.sRGBEncoding; tex.anisotropy=8;
    mesh=screenPlane(item,toward,new THREE.MeshBasicMaterial({map:tex,toneMapped:false}));
    ov=document.createElement('canvas'); ov.width=cv.width; ov.height=cv.height; og=ov.getContext('2d'); og.scale(K,K);
    otex=new THREE.CanvasTexture(ov); otex.encoding=THREE.sRGBEncoding;
    oMesh=new THREE.Mesh(mesh.geometry,new THREE.MeshBasicMaterial({map:otex,transparent:true,toneMapped:false,depthWrite:false}));
    oMesh.position.copy(mesh.position); oMesh.quaternion.copy(mesh.quaternion); oMesh.translateZ(.004); oMesh.visible=false; WORLD.add(oMesh);
    // 화면 빛이 방에 번진다 (화면 앞 약한 점광원)
    const glow=new THREE.PointLight(0x9fc6e8,.0,6,2); glow.position.copy(mesh.position); glow.translateZ(.8); WORLD.add(glow); SCREEN.glow=glow;
    whTex=await WH.target(1024,448);
    for(const k of ['earth_day','jupiter','gal']) img[k]=await loadImg(k); show('idle'); return mesh; }

  /* ---------- 그리기 도구 ---------- */
  const T=(s,x,y,font,col,al='left')=>{ g.font=font; g.fillStyle=col; g.textAlign=al; g.fillText(s,x,y); g.textAlign='left'; };
  const box=(x,y,w,h,label,c=g)=>{ c.strokeStyle=HAIR; c.lineWidth=1; c.strokeRect(x+.5,y+.5,w,h); if(label){ c.font=M(13); c.fillStyle=DIM; c.fillText(label.toUpperCase(),x+12,y+22); } };
  const hhmmss=s=>{ const a=Math.floor(s); return [a/3600|0,(a/60|0)%60,a%60].map(v=>String(v).padStart(2,'0')).join(':'); };
  const ease=k=>k<0?0:k>1?1:1-Math.pow(1-k,3);
  function chrome(id,title,sub){ g.fillStyle=BG; g.fillRect(0,0,W,H);
    // 바탕 격자
    g.strokeStyle='rgba(233,231,226,.035)'; g.lineWidth=1; for(let x=0;x<W;x+=40){ g.beginPath(); g.moveTo(x,64); g.lineTo(x,H-40); g.stroke(); } for(let y=64;y<H-40;y+=40){ g.beginPath(); g.moveTo(0,y); g.lineTo(W,y); g.stroke(); }
    g.fillStyle='rgba(255,255,255,.03)'; g.fillRect(0,0,W,52); g.fillStyle=AL; g.fillRect(28,24,18,3);
    T('NASA · 중력 이상 대응 TF',58,32,M(15),MUTE); T(id,420,32,M(15),AL); T(title,500,33,F(600,20),INK);
    if(sub) T(sub,W-430,32,M(14),DIM);
    T('UTC−5  '+hhmmss(78060+clock),W-28,32,M(15),INK,'right');
    g.fillStyle=HAIR; g.fillRect(0,52,W,1); g.fillRect(0,H-36,W,1);
    // 아래 띠 : 실시간 수신 (흘러간다)
    const tick='▲ 대전 Δg +16.8 mGal    ▲ 스발바르 +18.4    ▼ 케이프타운 조석 +2.3 m    ● JPL 목성 위치 잔차 +4.1″    ● 원자시계 편차 31 ns/일    ▲ 레이캬비크 +18.9    ● DSN 캔버라 HUY-1 채널 무응답 214일    ';
    g.save(); g.beginPath(); g.rect(0,H-35,W,35); g.clip(); g.font=M(14); g.fillStyle=MUTE; const tw=g.measureText(tick).width, off=-(clock*60%tw);
    for(let x=off;x<W;x+=tw) g.fillText(tick,x+20,H-12); g.restore();
    g.fillStyle=AL; g.fillRect(0,H-35,6,35); }
  // 세계 지도 (등장방형) — 어둡게
  function map(x,y,w,h,label){ box(x,y,w,h,label); if(img.earth_day){ g.globalAlpha=.5; g.drawImage(img.earth_day,x+1,y+1,w-2,h-2); g.globalAlpha=1; }
    g.fillStyle='rgba(5,8,12,.45)'; g.fillRect(x+1,y+1,w-2,h-2);
    g.strokeStyle='rgba(159,216,255,.08)'; for(let i=1;i<6;i++){ g.beginPath(); g.moveTo(x+w*i/6,y); g.lineTo(x+w*i/6,y+h); g.stroke(); } for(let i=1;i<4;i++){ g.beginPath(); g.moveTo(x,y+h*i/4); g.lineTo(x+w,y+h*i/4); g.stroke(); }
    return (lat,lon)=>[x+(lon+180)/360*w, y+(90-lat)/180*h]; }

  const STN=[['대전',36.35,127.38,16.8],['휴스턴',29.8,-95.4,16.9],['스발바르',78.2,15.6,18.4],['나이로비',-1.3,36.8,15.1],['시드니',-33.9,151.2,16.2],['산티아고',-33.4,-70.6,17.7],
    ['도쿄',35.7,139.7,17.1],['레이캬비크',64.1,-21.9,18.9],['케이프타운',-33.9,18.4,15.6],['하와이',19.8,-155.5,16.4]];
  const COAST=[['상하이',31.2,121.5],['뉴욕',40.7,-74],['암스테르담',52.4,4.9],['부산',35.1,129],['마이애미',25.8,-80.2],['뭄바이',19.1,72.9],['자카르타',-6.2,106.8],['베네치아',45.4,12.3],['방콕',13.8,100.5]];

  const D={
    idle(){ chrome('B-0314','긴급 브리핑','기밀 2급');
      // 천천히 도는 지구 (위도 · 경도 선)
      const cx=1160,cy=375,R=230; g.fillStyle='rgba(159,216,255,.04)'; g.beginPath(); g.arc(cx,cy,R,0,7); g.fill(); g.strokeStyle='rgba(159,216,255,.5)'; g.beginPath(); g.arc(cx,cy,R,0,7); g.stroke();
      g.strokeStyle='rgba(159,216,255,.22)'; for(let la=-60;la<=60;la+=30){ const r=R*Math.cos(la*Math.PI/180), yy=cy-R*Math.sin(la*Math.PI/180); g.beginPath(); g.ellipse(cx,yy,r,r*.12,0,0,7); g.stroke(); }
      for(let k=0;k<12;k++){ const a=k*Math.PI/6+clock*.15, s=Math.cos(a); if(Math.sin(a)<0) continue; g.beginPath(); g.ellipse(cx,cy,Math.abs(R*s),R,0,0,7); g.stroke(); }
      STN.forEach(([n,la,lo],i)=>{ const a=lo*Math.PI/180+clock*.15, z=Math.cos(la*Math.PI/180)*Math.sin(a+Math.PI/2); if(z<0) return; const px=cx+R*Math.cos(la*Math.PI/180)*Math.cos(a+Math.PI/2)*-1, py=cy-R*Math.sin(la*Math.PI/180);
        g.fillStyle=AL; g.globalAlpha=.5+.5*Math.sin(clock*3+i); g.beginPath(); g.arc(px,py,4,0,7); g.fill(); g.globalAlpha=1; });
      T('중력 이상 대응 회의',90,240,F(300,74),INK); T('하위헌스 계획 · 2차 탐사 결정 회의',92,290,F(400,26),MUTE);
      ['01  지구 중력 이상 현황','02  원인 — 목성 궤도의 비틀림','03  웜홀 관측과 분광 분석','04  하위헌스 1호 마지막 교신','05  2차 탐사 · 승무원'].forEach((s,i)=>T(s,92,380+i*44,M(20),i?MUTE:INK));
      T('발표  로버트 그레이 · NASA 탐사 임무국장',92,620,M(16),AL); },

    gravity(){ chrome('01','지구 중력 이상 — 관측소 실시간','IGS · 초전도 중력계 412곳'); const k=ease(t/2.5);
      const P=map(28,72,940,470,'전 지구 중력 편차 (mGal)');
      STN.forEach(([n,la,lo,v],i)=>{ const [x,y]=P(la,lo), r=(18+v*2.2)*(.85+.15*Math.sin(clock*2.4+i))*k;
        const gr=g.createRadialGradient(x,y,0,x,y,r); gr.addColorStop(0,'rgba(255,90,54,.75)'); gr.addColorStop(1,'rgba(255,90,54,0)'); g.fillStyle=gr; g.beginPath(); g.arc(x,y,r,0,7); g.fill();
        g.fillStyle=INK; g.beginPath(); g.arc(x,y,2.5,0,7); g.fill(); T(n,x+8,y-6,F(500,14),INK); });
      // 오른쪽 : 해마다 커지는 편차 (로그 눈금) + 오늘의 흔들림
      box(990,72,582,300,'평균 편차 · 로그 눈금'); const G=[[2086,.02],[2087,.08],[2088,.3],[2089,1.2],[2090,4.6],[2091,17]];
      const gx=y=>1040+(y-2086)/5*480, gy=v=>340-(Math.log10(v)+2)/3.4*230;
      [.01,.1,1,10].forEach(v=>{ g.strokeStyle=HAIR; g.beginPath(); g.moveTo(1040,gy(v)); g.lineTo(1540,gy(v)); g.stroke(); T(String(v),1032,gy(v)+5,M(12),DIM,'right'); });
      G.forEach(([y])=>T(String(y),gx(y),362,M(12),DIM,'center'));
      g.strokeStyle=AL; g.lineWidth=2.5; g.beginPath(); const n=1+k*(G.length-1);
      for(let i=0;i<Math.floor(n);i++){ const [y,v]=G[i]; i?g.lineTo(gx(y),gy(v)):g.moveTo(gx(y),gy(v)); }
      if(n<G.length){ const i=Math.floor(n), f=n-i, [y0,v0]=G[i-1]||G[0], [y1,v1]=G[i]; g.lineTo(lerp(gx(y0),gx(y1),f),lerp(gy(v0),gy(v1),f)); } g.stroke(); g.lineWidth=1;
      if(k>=1){ g.fillStyle=AL; g.beginPath(); g.arc(gx(2091),gy(17),5+2*Math.sin(clock*5),0,7); g.fill(); T('×4 / 년',gx(2091)-14,gy(17)-14,M(15),AL,'right'); }
      // 오늘 24시간 (초당 흔들림)
      box(990,388,582,154,'대전 관측소 · 최근 60초'); g.strokeStyle=CY; g.beginPath();
      for(let i=0;i<=120;i++){ const s=clock-i*.5, v=16.8+.6*Math.sin(s*1.7)+.35*Math.sin(s*5.3)+.2*Math.sin(s*11.1); const x=1560-i*4.3, y=480-(v-16.8)*55; i?g.lineTo(x,y):g.moveTo(x,y); } g.stroke();
      const now=16.8+.6*Math.sin(clock*1.7)+.35*Math.sin(clock*5.3); T((now>=0?'+':'')+now.toFixed(2)+' mGal',1560,420,M(22,600),INK,'right');
      // 아래 표
      box(28,556,1544,104,'');
      STN.slice(0,6).forEach(([n,,,v],i)=>{ const x=52+i*255, live=v+.25*Math.sin(clock*2+i*1.3); T(n,x,592,F(500,17),MUTE); T('+'+live.toFixed(1),x,634,M(30,600),i===0?AL:INK); T('mGal',x+110,634,M(13),DIM); }); },

    earth(){ chrome('01-2','지구 — 지난 12개월 피해','NOAA · USGS · ICAO'); const k=ease(t/2);
      const P=map(28,72,940,470,'해안 조석 경보 · 실시간');
      COAST.forEach(([n,la,lo],i)=>{ const [x,y]=P(la,lo), on=Math.sin(clock*4+i*1.7)>-.2, r=10+8*((clock*1.3+i*.37)%1);
        g.strokeStyle='rgba(255,90,54,'+(1-((clock*1.3+i*.37)%1))+')'; g.lineWidth=2; g.beginPath(); g.arc(x,y,r,0,7); g.stroke(); g.lineWidth=1;
        g.fillStyle=on?AL:'rgba(255,90,54,.4)'; g.fillRect(x-3,y-3,6,6); T(n,x+10,y+5,F(500,14),INK); });
      const C=[['해안 방벽을 넘은 밀물',412,'건'],['고도를 지키지 못한 항공기',1880,'편'],['규모 6 이상 지진',3.1,'배'],['원자시계 오차',31,'ns / 일']];
      C.forEach(([s,v,u],i)=>{ const y=72+i*118; box(990,y,582,106,''); T(s,1012,y+34,F(500,18),MUTE);
        const val=v*ease(t/2.2-i*.15), txt=v%1?val.toFixed(1):Math.round(val).toLocaleString(); T(txt,1012,y+88,M(46,600),i===0?AL:INK); T(u,1012+g.measureText(txt).width+12,y+88,M(18),DIM);
        g.fillStyle=i===0?AL:CY; g.fillRect(1300,y+70,250*ease(t/2.2-i*.15)*(.6+.4*(i%2)),6); });
      box(28,556,1544,104,'부산 조위계 · 30일 (m)'); g.strokeStyle=CY; g.beginPath();
      for(let i=0;i<=400;i++){ const d=i/400, a=.4+1.9*d*d, v=a*Math.sin(d*60+clock*.8)+.15*Math.sin(d*240); const x=52+i*3.8, y=616-v*14; i?g.lineTo(x,y):g.moveTo(x,y); } g.stroke();
      g.strokeStyle='rgba(255,90,54,.6)'; g.setLineDash([5,5]); g.beginPath(); g.moveTo(52,588); g.lineTo(1560,588); g.stroke(); g.setLineDash([]); T('방벽 높이',1560,582,M(12),AL,'right'); },

    jupiter(){ chrome('02','원인 — 목성 공전 궤도의 비틀림','JPL 천체력 DE-912 · 주노3 관측'); const k=ease(t/3);
      box(28,72,940,588,'태양계 위에서 본 모습'); const cx=500,cy=372, RE=62, RJ=262;
      g.save(); g.beginPath(); g.rect(29,73,938,586); g.clip();
      g.strokeStyle=HAIR; g.beginPath(); g.arc(cx,cy,RE,0,7); g.stroke(); g.setLineDash([6,8]); g.strokeStyle='rgba(233,231,226,.45)'; g.beginPath(); g.arc(cx,cy,RJ,0,7); g.stroke(); g.setLineDash([]);
      // 관측된 목성 궤도 : 웜홀 쪽으로 끌려 나간다
      const wa=-.55, wx=cx+Math.cos(wa)*(RJ+70), wy=cy+Math.sin(wa)*(RJ+70);
      g.strokeStyle=AL; g.lineWidth=2; g.beginPath(); for(let i=0;i<=200;i++){ const a=i/200*Math.PI*2, pull=k*44*Math.exp(-Math.pow(Math.atan2(Math.sin(a-wa),Math.cos(a-wa))/.9,2)); const r=RJ+pull; i?g.lineTo(cx+Math.cos(a)*r,cy+Math.sin(a)*r):g.moveTo(cx+Math.cos(a)*r,cy+Math.sin(a)*r); } g.stroke(); g.lineWidth=1;
      g.fillStyle='#f4d28c'; g.beginPath(); g.arc(cx,cy,10,0,7); g.fill(); T('태양',cx,cy+32,M(13),MUTE,'center');
      const ea=clock*.9; g.fillStyle=CY; g.beginPath(); g.arc(cx+Math.cos(ea)*RE,cy+Math.sin(ea)*RE,5,0,7); g.fill(); T('지구',cx+Math.cos(ea)*RE+9,cy+Math.sin(ea)*RE-8,M(12),CY);
      const ja=wa-.9+clock*.05%1, jp=RJ+k*44*Math.exp(-Math.pow((ja-wa)/.9,2)); const jx=cx+Math.cos(ja)*jp, jy=cy+Math.sin(ja)*jp;
      g.fillStyle='#e0b48a'; g.beginPath(); g.arc(jx,jy,11,0,7); g.fill(); T('목성',jx+16,jy+5,F(600,15),INK);
      // 웜홀 : 보이지 않는 질량 — 시간이 지나면 표시
      if(t>2.2){ const a=Math.min(1,(t-2.2)/1.2); g.globalAlpha=a; g.strokeStyle=AL; for(let r=8;r<40;r+=10){ g.beginPath(); g.arc(wx,wy,r+3*Math.sin(clock*3+r),0,7); g.stroke(); }
        T('?  보이지 않는 질량',wx+44,wy+4,F(600,17),AL); g.globalAlpha=1; }
      g.restore();
      T('— — 예측 궤도',52,640,M(13),MUTE); T('— 관측 궤도',210,640,M(13),AL);
      if(img.jupiter){ box(990,72,280,280,'주노3 · 2091.02'); g.drawImage(img.jupiter,1000,98,260,244); }
      box(1290,72,282,280,'궤도 요소 변화'); [['이심률','0.0489','0.0531'],['근일점 이동','0″','+2.1″/일'],['공전 주기','11.86 y','11.91 y']].forEach(([a,b,c],i)=>{ const y=130+i*72;
        T(a,1310,y,F(500,15),MUTE); T(b,1310,y+32,M(18),DIM); T('→ '+c,1420,y+32,M(19,600),AL); });
      box(990,368,582,292,'위치 잔차 (관측 − 예측, 각초)'); g.strokeStyle=HAIR; g.beginPath(); g.moveTo(1030,600); g.lineTo(1550,600); g.stroke();
      g.strokeStyle=AL; g.lineWidth=2; g.beginPath(); for(let i=0;i<=100;i++){ const d=i/100*k, v=Math.pow(d,2.6)*190+4*Math.sin(i*.7+clock); const x=1030+i*5.2, y=600-v; i?g.lineTo(x,y):g.moveTo(x,y); } g.stroke(); g.lineWidth=1;
      T('2086',1030,630,M(12),DIM); T('2091',1550,630,M(12),DIM,'right'); T('+'+(4.1*k).toFixed(1)+'″',1550,420,M(30,600),AL,'right'); },

    wormhole(){ /* 바탕은 WH 렌더 타깃 — 겹친 투명 캔버스에 측정 표시를 그린다 */ },
    spectrum(){ chrome('03','웜홀 안쪽 빛의 스펙트럼','분광기 VIS-2 · 노출 4,800 s'); const z=.031*ease((t-1.2)/3);
      const L=[[393.4,'Ca K'],[396.8,'Ca H'],[486.1,'Hβ'],[517.3,'Mg'],[589.0,'Na'],[656.3,'Hα']], X=l=>52+(l-370)/340*1180;
      const band=(y,s,label)=>{ box(28,y-30,1240,128,label); const gr=g.createLinearGradient(X(380),0,X(700),0); ['#4b2bb5','#2a55ff','#18b3d4','#3fcf58','#f0e036','#ff8a1f','#c21414'].forEach((c,i)=>gr.addColorStop(i/6,c));
        g.fillStyle=gr; g.fillRect(X(380),y,X(700)-X(380),40); g.fillStyle='#000'; L.forEach(([l])=>{ const x=X(l*(1+s)); if(x<X(700)) g.fillRect(x-2.5,y,5,40); });
        // 세기 그래프
        g.strokeStyle=s?AL:INK; g.beginPath(); for(let l=380;l<=700;l+=.5){ let v=1; L.forEach(([c])=>{ v-=.7*Math.exp(-Math.pow((l-c*(1+s))/2.2,2)); }); v+=.03*Math.sin(l*3.1+clock*6)*(s?1:0); const x=X(l), yy=y+88-v*36; l>380?g.lineTo(x,yy):g.moveTo(x,yy); } g.stroke(); };
      band(110,0,'실험실 기준 (정지한 광원)'); band(300,z,'웜홀 안쪽 빛 (관측)');
      L.forEach(([l,n])=>{ const x0=X(l), x1=X(l*(1+z)); T(n,x0,282,M(12),DIM,'center'); g.strokeStyle='rgba(255,90,54,.5)'; g.setLineDash([3,4]); g.beginPath(); g.moveTo(x0,250); g.lineTo(x1,300); g.stroke(); g.setLineDash([]); });
      [400,450,500,550,600,650,700].forEach(l=>T(l+' nm',X(l),448,M(12),DIM,'center'));
      // 오른쪽 : 계산
      box(1290,72,282,276,'NGC 3500'); if(img.gal){ g.save(); g.beginPath(); g.rect(1291,96,280,251); g.clip(); g.drawImage(img.gal,1291-60+Math.sin(clock*.2)*8,96-40,400,330); g.restore(); }
      box(28,478,1544,182,'계산'); const v=299792*z, d=v/70;
      T('적색 편이  z = Δλ / λ',52,530,F(500,20),MUTE); T(z.toFixed(3),52,590,M(44,600),AL);
      T('멀어지는 속도  v = c · z',460,530,F(500,20),MUTE); T(Math.round(v).toLocaleString()+' km/s',460,590,M(40,600),INK);
      T('거리  d = v / H₀',920,530,F(500,20),MUTE); T(z>.03?'약 4억 3천만 광년':(d*3.26/100).toFixed(1)+' 억 광년',920,590,M(36,600),z>.03?AL:INK);
      T('흡수선이 모두 같은 비율로 긴 파장 쪽으로 밀렸다 → 우리은하 밖, 멀어지는 은하의 빛',52,640,F(400,17),DIM);
      box(1290,364,282,100,'판정'); T(z>.03?'외부 은하':'분석 중…',1310,430,F(600,30),z>.03?AL:MUTE); },

    mayday(){ chrome('04','하위헌스 1호 — 마지막 수신','DSN 캔버라 70 m · X 밴드 8.42 GHz');
      box(28,72,1100,250,'수신 파형'); const alive=t<5.8, a=alive?.32+.2*Math.sin(t*2.3):.02;
      g.strokeStyle='rgba(255,90,54,.9)'; g.lineWidth=1.6; g.beginPath(); for(let x=40;x<1120;x+=3){ const y=198+(Math.random()-.5)*200*a*(.35+Math.sin(x*.013+t*5)**2); x>40?g.lineTo(x,y):g.moveTo(x,y); } g.stroke(); g.lineWidth=1;
      // 폭포수 (주파수 · 시간)
      box(28,338,1100,322,'스펙트로그램'); if(!D.wf){ D.wf=document.createElement('canvas'); D.wf.width=540; D.wf.height=150; }
      const w=D.wf.getContext('2d'); w.drawImage(D.wf,0,1); const row=w.createImageData(540,1);
      for(let i=0;i<540;i++){ const c=Math.abs(i-270), sig=alive&&t>.6?Math.exp(-c*c/30)*(.7+.3*Math.random()):0, sb=alive&&t>.6?.35*Math.exp(-Math.pow(c-40-20*Math.sin(t*3),2)/60):0, n=Math.random()*.18+sig+sb;
        row.data[i*4]=255*Math.min(1,n*1.6); row.data[i*4+1]=90*Math.min(1,n*1.2); row.data[i*4+2]=54*n; row.data[i*4+3]=255; } w.putImageData(row,0,0);
      g.imageSmoothingEnabled=false; g.drawImage(D.wf,40,364,1076,284); g.imageSmoothingEnabled=true;
      box(1144,72,428,588,'메타데이터');
      [['발신','HUY-1 · 하위헌스 1호'],['수신 시각','2090.08.11  04:17:33'],['임무 일수','312일째'],['신호 세기',alive?(-151.8+Math.sin(clock*7)*.6).toFixed(1)+' dBm':'—'],['경로','웜홀 경유 · 지연 미상']].forEach(([a,b],i)=>{ T(a,1166,124+i*62,F(500,15),DIM); T(b,1166,150+i*62,M(18),i===3&&!alive?AL:INK); });
      const s='MAYDAY, MAYDAY, WE ARE—', n=Math.min(s.length,Math.floor(Math.max(0,t-.8)*6)); box(1144,440,428,220,'음성 → 글');
      T(s.slice(0,12),1166,520,M(34,600),AL); T(s.slice(12,n),1166,566,M(34,600),AL);
      if(!alive){ T('— 신호 끊김 · LOS —',1166,620,M(16),MUTE); T('그 뒤로 응답 없음  7개월',52,312,M(16),AL); } },

    crew(){ chrome('05','2차 탐사 · 하위헌스 2호','궤도 조립 · 2091. 04. 20 출발');
      box(28,72,940,370,'선체 옆모습 · 길이 214 m'); const y=262;
      g.strokeStyle='rgba(233,231,226,.6)'; g.lineWidth=1.5;
      const seg=[[70,60,'함교'],[140,80,'거주 구역'],[230,150,'동면 구역 A · B · C'],[390,110,'연구 · 실험 모듈'],[510,200,'트러스 · 방열판'],[720,190,'반응로 · 이온 엔진']];
      seg.forEach(([x,w,n],i)=>{ const h=i===4?16:i===5?70:i===2?84:60; g.strokeRect(x+.5,y-h/2,w,h); if(i===4){ for(let k=0;k<8;k++){ g.strokeRect(x+10+k*24,y-90,16,70); g.strokeRect(x+10+k*24,y+20,16,70); } }
        const ly=i%2?y+80:y-80; g.strokeStyle=HAIR; g.beginPath(); g.moveTo(x+w/2,y+(i%2?1:-1)*h/2); g.lineTo(x+w/2,ly+(i%2?-14:6)); g.stroke(); g.strokeStyle='rgba(233,231,226,.6)';
        T(n,x+w/2,i%2?ly+8:ly,F(500,15),i===2?AL:MUTE,'center'); });
      g.fillStyle='rgba(159,216,255,.7)'; for(let k=0;k<6;k++){ const a=(clock*3+k)%1; g.globalAlpha=1-a; g.fillRect(910+a*50,y-4+((k%3)-1)*14,24,3); } g.globalAlpha=1; g.lineWidth=1;
      box(28,456,940,204,'항로'); const pts=[[60,600],[300,560],[620,520],[900,500]]; g.strokeStyle=CY; g.setLineDash([4,6]); g.beginPath(); pts.forEach(([x,yy],i)=>i?g.lineTo(x,yy):g.moveTo(x,yy)); g.stroke(); g.setLineDash([]);
      [['지구',0],['궤도 조립장',1],['목성 · 214일',2],['웜홀',3]].forEach(([n,i])=>{ const [x,yy]=pts[i]; g.fillStyle=i===3?AL:INK; g.beginPath(); g.arc(x,yy,i===3?8:5,0,7); g.fill(); T(n,x,yy+30,F(500,15),i===3?AL:MUTE,'center'); });
      const sh=(clock*.12)%1; g.fillStyle=AL; g.beginPath(); g.arc(lerp(60,900,sh),lerp(600,500,sh)-(sh<.33?sh*120:sh<.66?40-(sh-.33)*60:20-(sh-.66)*60),3,0,7); g.fill();
      box(990,72,582,588,'승무원 14명'); const C=[['크리스','선장'],['마야','부선장 · 조종'],['서준','항법'],['레아','통신'],['다니엘','기관'],['오언','보안'],['사라','의무관'],['아이샤','생명 과학'],['토마스','지질'],['유키','대기 과학'],['파블로','로봇'],['노라','의무 보조'],['이반','기관 보조'],['하은','데이터']];
      C.forEach(([n,r],i)=>{ const x=1012+(i%2)*280, yy=118+Math.floor(i/2)*76, on=t*5>i; if(!on) return;
        g.fillStyle=i?'rgba(233,231,226,.06)':'rgba(255,90,54,.14)'; g.fillRect(x,yy-26,262,62); T(n,x+14,yy+2,F(600,20),i?INK:AL); T(r,x+14,yy+26,F(400,14),MUTE); T('HUY-2 · '+String(i+1).padStart(2,'0'),x+250,yy+2,M(12),DIM,'right'); }); },
  };
  // 웜홀 위에 겹치는 측정 표시
  function overlay(){ og.clearRect(0,0,W,H); const k=ease(t/2), cx=W/2, cy=H/2, r=Math.tan(WH.U.R.value)/1.1*H;
    og.fillStyle='rgba(5,8,12,.75)'; og.fillRect(0,0,W,52); og.fillStyle=AL; og.fillRect(28,24,18,3); og.font=M(15); og.fillStyle=MUTE; og.fillText('NASA · 중력 이상 대응 TF',58,32);
    og.fillStyle=AL; og.fillText('02-2',420,32); og.font=F(600,20); og.fillStyle=INK; og.fillText('목성 곁 · 중력 렌즈 관측',500,33); og.font=M(15); og.textAlign='right'; og.fillText('제임스 웹 2 · NIRCam',W-28,32); og.textAlign='left';
    og.strokeStyle='rgba(255,90,54,'+(.5+.4*Math.sin(clock*3))+')'; og.lineWidth=2; og.beginPath(); og.arc(cx,cy,r+8+(1-k)*60,0,7); og.stroke(); og.lineWidth=1;
    og.strokeStyle='rgba(233,231,226,.5)'; [[-1,0],[1,0],[0,-1],[0,1]].forEach(([a,b])=>{ og.beginPath(); og.moveTo(cx+a*(r+30),cy+b*(r+30)); og.lineTo(cx+a*(r+70),cy+b*(r+70)); og.stroke(); });
    if(t>1.2){ og.font=M(16); og.fillStyle=INK; og.fillText('아인슈타인 고리  θE = 3.8″',cx+r+80,cy-20); og.fillStyle=MUTE; og.fillText('렌즈 질량  ≈ 목성의 41배',cx+r+80,cy+8); og.fillText('빛을 내지 않음 · 그림자 없음',cx+r+80,cy+34); }
    if(t>2.6){ og.font=F(600,26); og.fillStyle=AL; og.fillText('고리 안쪽 = 다른 하늘',90,H-80); og.font=F(400,17); og.fillStyle=MUTE; og.fillText('가운데에 보이는 별과 은하는 이 근처의 것이 아니다',90,H-50); }
    otex.needsUpdate=true; }
  function show(m){ mode=m; t=0; if(!mesh) return; const wh=m==='wormhole'; mesh.material.map=wh?whTex:tex; mesh.material.needsUpdate=true; oMesh.visible=wh;
    if(wh) overlay(); else { D[m]&&D[m](); tex.needsUpdate=true; } AUDIO.tone(520,.06,'sine',.05); AUDIO.tone(780,.05,'sine',.03,.07); }
  let acc=0; function tick(dt){ if(!mesh) return; t+=dt; clock+=dt; if(SCREEN.glow) SCREEN.glow.intensity=mode==='off'?0:.55;
    if(mode==='wormhole'){ WH.render(dt); acc+=dt; if(acc>1/20){ acc=0; overlay(); } return; }
    acc+=dt; if(acc<1/24) return; acc=0; if(D[mode]){ D[mode](); tex.needsUpdate=true; } }
  return {mount,show,tick,get mode(){ return mode; }, glow:null};
})();
