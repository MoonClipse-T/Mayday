/* ============================================================
   출발 직후 — 거주 구역 라운지 (함선 공간 · SHIP.mode 'depart')
   다른 대원은 이미 동면 캡슐에 들어갔다. 크리스와 다니엘(기관)만 소파에 남아 이야기한다 (1차시 : 시차 · 연주 시차 · pc)
   다니엘 "웜홀까지 얼마나 걸려요?" → 거리를 알면 시간 → "거리는 어떻게 재요?" → 시차
   『인터스텔라』 오마주 : 탁자 위 A4 종이에 직접 그려 가며 설명한다 (디벗 : 손가락으로 선 긋기 · 누르기)
     ① 1월 지구 — 7월 지구 (공전 궤도 지름)  ② 태양 — 별 (별까지의 거리)  ③ 1월 지구 — 별
     ④ 연주 시차 p 는 어디?  ⑤ p = 1″ 일 때 태양 — 별 거리 = 1 pc 는 어디?
   → 퀴즈 : 웜홀의 연주 시차 약 11° → d = 1 / p(″) pc 의 p 를 적는다 (39,600)
   과학 : 웜홀은 목성 곁(태양에서 약 5.2 AU) → tan p = 1 AU / 5.2 AU → p ≈ 11°.  1/39,600 pc × 206,265 AU/pc ≈ 5.2 AU ≈ 7억 8천만 km
          배의 속도 초속 42 km (함교 조종석 화면) 로 7억 8천만 km ÷ 42 km/s ≈ 1,860만 초 ≈ 214일 — 이야기 속 비행 일수와 같다
   ============================================================ */
'use strict';
const LOUNGE={P_DEG:11, P_SEC:39600,
  async start(R){ const X=R.X, me=t=>({kind:'me',t}), V=t=>({who:'VEGA',kind:'vega',t});
    // 탁자 · 소파 자리 (충돌 칸에서 잰 값) : 왼쪽 소파 오른쪽 자리(크리스) · 오른쪽 소파 왼쪽 자리(다니엘) · 그 사이 앞 낮은 탁자
    const seatC={x:X(-.8),z:-5.55}, seatD={x:X(1.1),z:-5.55}, tbl={x:X(.2),z:-6.55}, top=(SOLID.top(tbl.x,tbl.z,1.2,.05)||.42)+.004;
    const dn=await PEOPLE.spawn({kind:'daniel',name:'다니엘 로드리게스',role:'기관',at:{x:seatD.x,z:seatD.z,yaw:0},pose:'sit',seatY:.45});
    const DN=t=>({who:'다니엘',t,npc:dn});
    // A4 종이 (가로로 눕힘) — 캔버스에 그린다
    const PW=.297, PH=.21, CW=1188, CH=840, cv=document.createElement('canvas'); cv.width=CW; cv.height=CH; const g=cv.getContext('2d');
    const tex=new THREE.CanvasTexture(cv); tex.encoding=THREE.sRGBEncoding; tex.anisotropy=4;
    const paper=new THREE.Mesh(new THREE.PlaneGeometry(PW,PH),new THREE.MeshStandardMaterial({map:tex,roughness:.9}));
    paper.rotation.set(-Math.PI/2,0,.04); paper.position.set(tbl.x,top+.012,tbl.z); WORLD.add(paper);
    // 받침판 : 탁자가 나무 격자라 종이가 떠 보이지 않게 (어두운 무광 판)
    const board=new THREE.Mesh(new THREE.BoxGeometry(.34,.012,.255),new THREE.MeshStandardMaterial({color:0x0c0e10,roughness:.95,metalness:0})); board.position.set(tbl.x,top+.005,tbl.z); WORLD.add(board);
    const pen=new THREE.Mesh(new THREE.CylinderGeometry(.004,.004,.15,8),new THREE.MeshStandardMaterial({color:0x223344,metalness:.3})); pen.rotation.set(0,0,Math.PI/2.3); pen.position.set(tbl.x+.17,top+.018,tbl.z+.07); WORLD.add(pen);
    // 종이 위 점 (px) : 태양 · 1월 지구 · 7월 지구 · 별
    const Sun={x:594,y:690}, E1={x:300,y:690}, E2={x:888,y:690}, Star={x:594,y:140}, done=[];
    const hand=(s,w=500)=>`${w} ${s}px "Nanum Pen Script","Segoe Print","Comic Sans MS","Malgun Gothic",sans-serif`;
    const line=(a,b,w=4,c='#2a2f3a')=>{ g.strokeStyle=c; g.lineWidth=w; g.lineCap='round'; g.beginPath(); g.moveTo(a.x,a.y); g.lineTo(b.x,b.y); g.stroke(); };
    const dot=(p,r,c)=>{ g.fillStyle=c; g.beginPath(); g.arc(p.x,p.y,r,0,7); g.fill(); };
    const label=(t,x,y,s=34,c='#2a2f3a',al='center')=>{ g.fillStyle=c; g.font=hand(s); g.textAlign=al; g.textBaseline='middle'; g.fillText(t,x,y); };
    function base(){ g.fillStyle='#f4f1ea'; g.fillRect(0,0,CW,CH);
      for(let i=0;i<1400;i++){ g.fillStyle=`rgba(120,110,90,${Math.random()*.04})`; g.fillRect(Math.random()*CW,Math.random()*CH,2,2); }
      g.setLineDash([10,12]); g.strokeStyle='rgba(60,70,90,.35)'; g.lineWidth=2; g.beginPath(); g.ellipse(Sun.x,Sun.y,E2.x-Sun.x,56,0,0,7); g.stroke(); g.setLineDash([]);
      dot(Sun,22,'#e0a030'); label('태양',Sun.x,Sun.y+58,44);
      dot(E1,12,'#3a78c8'); label('1월 지구',E1.x,E1.y+54,40); dot(E2,12,'#3a78c8'); label('7월 지구',E2.x,E2.y+54,40);
      g.fillStyle='#c8382a'; g.font='600 64px sans-serif'; g.textAlign='center'; g.textBaseline='middle'; g.fillText('★',Star.x,Star.y); label('별',Star.x+60,Star.y,44);
      done.forEach(f=>f()); tex.needsUpdate=true; }
    base();
    // 그리기 : 종이 위 좌표 ← 화면 좌표 (레이캐스트 → UV)
    const rc=new THREE.Raycaster(), toPaper=e=>{ rc.setFromCamera(new THREE.Vector2(e.clientX/innerWidth*2-1,-(e.clientY/innerHeight)*2+1),camera); const h=rc.intersectObject(paper)[0]; return h?{x:h.uv.x*CW,y:(1-h.uv.y)*CH}:null; };
    const near=(a,b,r)=>Math.hypot(a.x-b.x,a.y-b.y)<r, segD=(p,a,b)=>{ const vx=b.x-a.x, vy=b.y-a.y, t=clamp(((p.x-a.x)*vx+(p.y-a.y)*vy)/(vx*vx+vy*vy),0,1); return Math.hypot(p.x-a.x-vx*t,p.y-a.y-vy*t); };
    let stroke=null, want=null;
    const cvs=$('#c'), down=e=>{ if(!want) return; const p=toPaper(e); if(!p) return; stroke=[p]; }, move=e=>{ if(!stroke) return; const p=toPaper(e); if(!p) return; const q=stroke[stroke.length-1]; stroke.push(p); line(q,p,5,'#4a5060'); tex.needsUpdate=true; },
      up=()=>{ if(!stroke) return; const s=stroke; stroke=null; const ok=want.check(s); if(ok){ AUDIO.tone(880,.12,'sine',.08); AUDIO.tone(1320,.16,'sine',.07,.1); done.push(want.draw); base(); const r=want.res; want=null; r(); } else { AUDIO.tone(220,.18,'square',.04); base(); toast(want.hint,2600); } };
    cvs.addEventListener('pointerdown',down); addEventListener('pointermove',move); addEventListener('pointerup',up);
    // 한 단계 : 안내 → 맞게 그릴 때까지
    const step=(text,hint,check,draw)=>new Promise(res=>{ goal(text); want={hint,check,draw,res}; });
    const lineStep=(a,b,text,hint,extra)=>step(text,hint,s=>{ const p=s[0], q=s[s.length-1]; return s.length>2&&((near(p,a,80)&&near(q,b,80))||(near(p,b,80)&&near(q,a,80))); },()=>{ line(a,b,5); extra&&extra(); });
    const tapStep=(text,hint,test,draw)=>step(text,hint,s=>test(s[s.length-1]),draw);

    // ---- 무대 : 크리스는 소파에 앉아 있다 (둘러보기만) ----
    warp(seatC.x-.12,seatC.z,0); P.eye=1.12; P.yaw=yawTo(seatD.x,seatD.z-1.5); P.pitch=-.05;
    stamp('하위헌스 2호 · 거주 구역','지구 궤도 출발 · 목성까지 214일'); SHIPMAP.at('deck'); AUDIO.hum(.7,50);
    await fade(false,1600);
    await card('','출발 6시간 뒤','하위헌스 2호 · 거주 구역 라운지',2600);
    S.phase='play'; P.free=false; P.look=true;
    await TALK.say([me('다들 동면 캡슐에 들어갔다. 마지막으로 남은 건 나와 다니엘.'),
      DN('선장님, 들어가기 전에 하나만요. 궁금한 게 있는데… 저 웜홀까지 얼마나 걸리는 거예요?'),
      me('웜홀까지의 거리를 알면, 우리 배의 속도로 시간을 추정할 수 있지.'),
      DN('그럼 거리는 어떻게 재는 거예요? 줄자를 댈 수도 없고.'),
      me('시차를 쓰지. 종이 있나? 그려서 보여 줄게.'),
      DN('여기요. A4 한 장.')]);
    // 종이 위로 몸을 숙인다
    window.dragHook=()=>{}; P.look=false;
    await camTo({x:tbl.x,z:tbl.z+.015,yaw:0,pitch:-1.52,eye:top+.31},1.4);
    await TALK.say([me('한쪽 눈을 감고 손가락을 보면, 오른눈 왼눈을 바꿀 때마다 손가락이 배경 앞에서 움직여 보이지. 그게 시차야.'),
      me('지구는 1년에 한 바퀴 태양을 돈다. 1월과 7월에 같은 별을 보면, 가까운 별일수록 먼 별들 앞에서 더 많이 움직여 보여.'),
      me('그려 볼게.')]);
    await lineStep(E1,E2,'① 1월 지구 → 7월 지구 : 손가락으로 직선을 긋는다 (지구 공전 궤도의 지름)','두 파란 점(1월 지구 · 7월 지구)을 이어 보세요',()=>{ label('1 AU',(E1.x+Sun.x)/2,Sun.y-30,30,'#3a78c8'); });
    await TALK.say([me('태양에서 지구까지가 1 AU — 약 1억 5천만 km.')]);
    await lineStep(Sun,Star,'② 태양 → 별 : 직선을 긋는다 (별까지의 거리 d)','태양(주황 점)과 별(★)을 이어 보세요',()=>label('d',Sun.x+26,(Sun.y+Star.y)/2,40,'#c8382a','left'));
    await lineStep(E1,Star,'③ 1월 지구 → 별 : 직선을 긋는다','1월 지구(왼쪽 파란 점)와 별(★)을 이어 보세요');
    await TALK.say([me('삼각형이 생겼지. 별에서 보면 태양과 지구가 아주 조금 벌어져 보여. 그 각이 바로…')]);
    await tapStep('④ 연주 시차는 어디일까? 그 각을 눌러 표시한다','별(★) 꼭짓점 — 두 선 사이의 각을 눌러 보세요',p=>near(p,{x:Star.x-34,y:Star.y+110},95)&&p.x<Star.x+6,
      ()=>{ const a1=Math.atan2(Sun.y-Star.y,Sun.x-Star.x), a2=Math.atan2(E1.y-Star.y,E1.x-Star.x); g.strokeStyle='#c8382a'; g.lineWidth=4; g.beginPath(); g.arc(Star.x,Star.y,120,Math.min(a1,a2),Math.max(a1,a2)); g.stroke(); label('p (연주 시차)',Star.x-150,Star.y+150,30,'#c8382a','right'); });
    await TALK.say([me('연주 시차 p. 1 AU 를 별에서 본 각이야. 별이 멀수록 이 각이 작아져.'),
      me('그리고 이 각이 정확히 1초(1″) — 1도의 3600분의 1 — 일 때, 태양에서 별까지의 거리를…')]);
    await tapStep('⑤ p = 1″ 일 때 1 pc 는 어디일까? 그 거리를 눌러 표시한다','태양에서 별까지의 선(d)을 눌러 보세요',p=>segD(p,Sun,Star)<34&&p.y>Star.y+70&&p.y<Sun.y-50,
      ()=>{ g.strokeStyle='#c8382a'; g.lineWidth=3; const x=Sun.x+60; line({x,y:Star.y+20},{x,y:Sun.y-20},3,'#c8382a'); line({x:x-12,y:Star.y+20},{x:x+12,y:Star.y+20},3,'#c8382a'); line({x:x-12,y:Sun.y-20},{x:x+12,y:Sun.y-20},3,'#c8382a');
        label('p = 1″ 이면  d = 1 pc',x+18,(Sun.y+Star.y)/2+46,32,'#c8382a','left'); label('(약 3.26 광년)',x+18,(Sun.y+Star.y)/2+86,26,'#c8382a','left'); label('d = 1 / p  (pc)',Sun.x+250,Star.y+40,38,'#2a2f3a'); });
    goal(''); window.dragHook=null;
    await TALK.say([me('1 파섹. 연주 시차가 1초인 거리. 그래서 거리(pc) = 1 ÷ 연주 시차(″).'),
      DN('그럼 웜홀도 이걸로 잴 수 있겠네요?'),
      me('그래. 지구에서 1월과 7월에 잰 웜홀의 연주 시차는 약 '+this.P_DEG+'°. 아주 가깝다는 뜻이지.')]);
    // 퀴즈 : d = 1 / p(″)
    await this.quiz();
    await TALK.say([V('계산을 확인합니다. 1/39,600 pc — 1 pc 는 약 20만 6천 AU 이므로, 약 5.2 AU. 7억 8천만 km 입니다.'),
      V('본 함선의 순항 속도는 초속 42 km. 7억 8천만 km ÷ 42 km/s ≈ 1,860만 초. 약 214일입니다.'),
      DN('214일! 그래서 214일이었구나. …이제 진짜 자러 가야겠네요. 깨면 목성 앞이겠죠.'),
      me('잘 자, 다니엘. 214일 뒤에 보자.')]);
    removeEventListener('pointermove',move); removeEventListener('pointerup',up); cvs.removeEventListener('pointerdown',down);
    S.phase='cut'; await fade(true,1800); await go('approach'); },

  // 숫자 입력 : 1 / □ pc
  quiz(){ return new Promise(res=>{ const q=document.createElement('div'); q.id='quiz';
    q.innerHTML=`<p class="hd">연주 시차로 거리 구하기</p><p class="q">웜홀의 연주 시차 p ≈ ${this.P_DEG}°<br>거리 d = 1 / p(″) — 웜홀까지의 거리는?</p>
      <p class="eq">d = 1 / <input type="text" inputmode="numeric" autocomplete="off" aria-label="연주 시차(초)"> pc</p><p class="msg"></p><button>확인</button>`;
    document.body.appendChild(q); requestAnimationFrame(()=>q.classList.add('on')); const inp=q.querySelector('input'), msg=q.querySelector('.msg'); let tries=0; setTimeout(()=>inp.focus(),300);
    const check=()=>{ const v=Number(String(inp.value).replace(/[,\s]/g,'')); tries++;
      if(v===this.P_SEC){ AUDIO.tone(880,.12,'sine',.08); AUDIO.tone(1320,.2,'sine',.07,.1); msg.textContent='정답 — 1 / 39,600 pc'; q.classList.add('ok'); setTimeout(()=>{ q.remove(); res(); },1200); return; }
      AUDIO.tone(220,.18,'square',.04);
      msg.textContent=v===this.P_DEG?'p 는 초(″) 단위로 넣어야 해요. 1° = 60′ = 3600″':tries<2?'다시 — 도(°)를 초(″)로 바꿔 보세요':`힌트 : ${this.P_DEG} × 3600 = ?`; };
    q.querySelector('button').onclick=check; inp.onkeydown=e=>{ if(e.key==='Enter') check(); e.stopPropagation(); }; }); },
};
