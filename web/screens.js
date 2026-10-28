/* ============================================================
   SCREEN : 회의실 대형 화면 (브리핑 자료). 국장이 대화하며 SCREEN.show('gravity') 처럼 넘긴다
   그림은 캔버스로 그리고(움직이는 것은 매 프레임), 웜홀은 sky.js 의 렌즈 계산을 렌더 타깃으로 받아 그대로 띄운다
   ============================================================ */
'use strict';
const SCREEN=(()=>{ const W=1024,H=576, CW=1024, CH=458; let cv,g,tex,mesh,mode='off',t=0,whTex=null; const img={};      // 패널은 16:7 — 16:9 로 그린 자료를 가운데에 줄여 넣는다
  const F=(w,s)=>`${w} ${s}px "IBM Plex Sans KR","Malgun Gothic",sans-serif`, M=s=>`500 ${s}px "IBM Plex Mono",Consolas,monospace`;
  const loadImg=k=>img[k]||(img[k]=new Promise(r=>{ const i=new Image(); i.onload=()=>r(i); i.onerror=()=>r(null); i.src='web/assets/'+k+'.jpg'; }));
  async function mount(item,toward){ cv=document.createElement('canvas'); cv.width=CW; cv.height=CH; const g0=cv.getContext('2d'); const k=CH/H;
    g0.fillStyle='#07090c'; g0.fillRect(0,0,CW,CH); g0.translate((CW-W*k)/2,0); g0.scale(k,k); g=g0;
    tex=new THREE.CanvasTexture(cv); tex.encoding=THREE.sRGBEncoding; tex.anisotropy=4;
    mesh=screenPlane(item,toward,new THREE.MeshBasicMaterial({map:tex,toneMapped:false})); whTex=await WH.target(CW,CH);
    for(const k of ['earth','jupiter']) img[k]=await loadImg(k); show('idle'); return mesh; }
  const head=(k,title)=>{ g.fillStyle='#07090c'; g.fillRect(0,0,W,H); g.fillStyle='#ff5a36'; g.fillRect(48,46,22,2);
    g.font=M(15); g.fillStyle='rgba(233,231,226,.6)'; g.fillText(k,82,52); g.font=F(600,30); g.fillStyle='#ece9e3'; g.fillText(title,48,96); };
  const D={
    idle(){ g.fillStyle='#07090c'; g.fillRect(0,0,W,H); g.font=M(16); g.fillStyle='rgba(233,231,226,.55)'; g.fillText('NASA 존슨 우주 센터 · 브리핑룸 B',60,90);
      g.font=F(300,62); g.fillStyle='#f0ede7'; g.fillText('중력 이상 대응 회의',60,190); g.font=M(18); g.fillStyle='#ff5a36'; g.fillText('2091. 03. 14  21:40  ·  기밀 2급',60,240);
      g.strokeStyle='rgba(233,231,226,.18)'; g.beginPath(); g.moveTo(60,300); g.lineTo(W-60,300); g.stroke(); g.font=F(400,22); g.fillStyle='rgba(233,231,226,.7)'; g.fillText('발표 · 로버트 그레이 국장',60,350); },
    gravity(){ head('자료 1','지구 평균 중력과의 차이 (mGal)'); const G=[[2086,.02],[2087,.08],[2088,.3],[2089,1.2],[2090,4.6],[2091,17]];
      const x=y=>110+(y-2086)/5*(W-200), lg=v=>H-80-(Math.log10(v)+2)/3.4*(H-230), k=Math.min(1,t/3);
      g.font=M(14); [.01,.1,1,10].forEach(v=>{ g.strokeStyle='rgba(233,231,226,.1)'; g.beginPath(); g.moveTo(110,lg(v)); g.lineTo(W-90,lg(v)); g.stroke(); g.fillStyle='rgba(233,231,226,.4)'; g.fillText(String(v),56,lg(v)+5); });
      G.forEach(([y])=>{ g.fillStyle='rgba(233,231,226,.4)'; g.fillText(y,x(y)-20,H-44); });
      g.strokeStyle='#ff5a36'; g.lineWidth=3; g.beginPath(); const n=1+k*(G.length-1); for(let i=0;i<Math.floor(n);i++){ const [y,v]=G[i]; i?g.lineTo(x(y),lg(v)):g.moveTo(x(y),lg(v)); }
      if(n<G.length){ const i=Math.floor(n), f=n-i, [y0,v0]=G[i-1]||G[0], [y1,v1]=G[i]; g.lineTo(lerp(x(y0),x(y1),f),lerp(lg(v0),lg(v1),f)); } g.stroke(); g.lineWidth=1;
      if(k>=1){ g.fillStyle='#ece9e3'; g.font=M(18); g.fillText('17 mGal · 해마다 약 4배',x(2091)-250,lg(17)-14); } },
    earth(){ head('자료 2','지구 — 지난 12개월'); if(img.earth) g.drawImage(img.earth,W-470,40,430,430);
      g.font=F(400,24); g.fillStyle='rgba(233,231,226,.85)'; ['· 해안 방벽 초과 밀물 412건','· 항공기 고도 유지 실패 1,880건','· 규모 6 이상 지진 3배 증가','· 원자시계 오차 하루 31 ns'].forEach((s,i)=>g.fillText(s,60,190+i*58)); },
    jupiter(){ head('자료 3','목성 — 공전 궤도의 비틀림'); if(img.jupiter) g.drawImage(img.jupiter,W-460,70,400,400);
      const cx=330,cy=330; g.strokeStyle='rgba(233,231,226,.25)'; g.beginPath(); g.ellipse(cx,cy,230,150,0,0,7); g.stroke();
      g.strokeStyle='#ff5a36'; g.setLineDash([6,6]); g.beginPath(); g.ellipse(cx+18,cy-8,232+8*Math.sin(t),152,.12,0,7); g.stroke(); g.setLineDash([]);
      g.fillStyle='#f4d28c'; g.beginPath(); g.arc(cx,cy,9,0,7); g.fill(); g.font=M(14); g.fillStyle='rgba(233,231,226,.6)'; g.fillText('태양',cx-14,cy+30); g.fillStyle='#ff5a36'; g.fillText('현재 궤도',cx+120,cy-170); },
    spectrum(){ head('자료 5','같은 원소, 다른 위치 — 흡수선 비교'); const L=[393.4,396.8,434,486.1,517.3,589,656.3], nm=l=>60+(l-380)/340*(W-120), z=.12*Math.min(1,Math.max(0,(t-1)/3));
      const band=(y,k)=>{ const gr=g.createLinearGradient(60,0,W-60,0); ['#5b2cc9','#2f5bff','#1fb7d6','#43d15a','#f2e23a','#ff8a1f','#c21414'].forEach((c,i)=>gr.addColorStop(i/6,c)); g.fillStyle=gr; g.fillRect(60,y,W-120,70);
        g.fillStyle='#07090c'; L.forEach(l=>{ const xx=nm(l*k); if(xx<W-60) g.fillRect(xx-2,y,4,70); }); };
      g.font=F(400,20); g.fillStyle='rgba(233,231,226,.7)'; g.fillText('실험실의 빛',60,170); band(186,1); g.fillText('웜홀에서 나온 빛',60,330); band(346,1+z);
      g.font=M(14); g.fillStyle='rgba(233,231,226,.4)'; [400,500,600,700].forEach(l=>g.fillText(l+' nm',nm(l)-24,450)); if(z>.1){ g.fillStyle='#ff5a36'; g.font=F(600,22); g.fillText('→ 모두 붉은 쪽으로  ·  외부 은하 NGC 3500',60,510); } },
    mayday(){ g.fillStyle='#07090c'; g.fillRect(0,0,W,H); g.font=M(16); g.fillStyle='rgba(233,231,226,.55)'; g.fillText('수신 기록 HUY-1  ·  2090. 11. 02  ·  312일째',60,70);
      g.strokeStyle='rgba(255,90,54,.8)'; g.lineWidth=2; g.beginPath(); const a=t<6?.35:.04; for(let x=60;x<W-60;x+=4){ const y=300+(Math.random()-.5)*220*a*(.4+Math.sin(x*.012+t*4)**2); x>60?g.lineTo(x,y):g.moveTo(x,y); } g.stroke(); g.lineWidth=1;
      const s='MAYDAY, MAYDAY, WE ARE—', n=Math.min(s.length,Math.floor(Math.max(0,t-.8)*7)); g.font='600 52px "IBM Plex Mono",monospace'; g.fillStyle='#ff5a36'; g.fillText(s.slice(0,n),60,480);
      if(t>5) { g.font=M(16); g.fillStyle='rgba(233,231,226,.45)'; g.fillText('— 신호 끊김 —',60,530); } },
    crew(){ head('자료 7','하위헌스 2호 승무원 · 14명'); const C=['크리스 · 선장','마야 · 부선장','서준 · 항법','레아 · 통신','엘레나 · 의무관','다니엘 · 기관','아이샤 · 생명 과학','토마스 · 지질','유키 · 대기 과학','파블로 · 로봇','노라 · 의무 보조','이반 · 기관 보조','하은 · 데이터','오언 · 보안'];
      C.forEach((s,i)=>{ const x=60+(i%2)*470, y=160+Math.floor(i/2)*54; g.font=F(i?400:600,22); g.fillStyle=i?'rgba(233,231,226,.8)':'#ff5a36'; g.fillText(s,x,y); g.fillStyle='rgba(233,231,226,.12)'; g.fillRect(x,y+16,420,1); }); },
  };
  function show(m){ mode=m; t=0; if(!mesh) return; mesh.material.map=m==='wormhole'?whTex:tex; mesh.material.needsUpdate=true; if(D[m]){ D[m](); tex.needsUpdate=true; } AUDIO.tone(520,.06,'sine',.05); }
  let acc=0; function tick(dt){ if(!mesh) return; t+=dt; if(mode==='wormhole') return WH.render(dt); acc+=dt; if(acc<1/30) return; acc=0;
    if(['gravity','jupiter','spectrum','mayday'].includes(mode)){ D[mode](); tex.needsUpdate=true; } }
  return {mount,show,tick,get mode(){ return mode; }};
})();
