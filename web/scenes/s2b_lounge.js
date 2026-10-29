/* ============================================================
   출발 직후 — 라운지 · 전망대 (함선 공간 · SHIP.mode 'depart'). 통유리 너머로 지구가 작아진다
   다른 대원은 이미 동면 캡슐에 들어갔다. 크리스와 다니엘(기관)만 소파에 남아 이야기한다 (1차시 : 시차 · 연주 시차 · pc)
   다니엘 "웜홀까지 얼마나 걸려요?" → 거리를 알면 시간 → "거리는 어떻게 재요?" → 시차
   『인터스텔라』 오마주 : 탁자 위 A4 종이에 직접 그린다 (디벗 : 손가락으로 선 긋기 · 누르기). 안내는 짧게 — 학생이 생각하게
     ① 시차 : 두 눈 → 손가락 → 벽 (선 둘)     ② 연주 시차 : 1월 · 7월 지구 → 별 (선 둘) · 태양 → 별     ③ 연주 시차 p 는 어느 각?
   → 퀴즈 : 웜홀의 연주 시차 약 11° → 거리 d(pc) = 1 ÷ p(″) 에서 p 를 초로 (39,600)
   과학 : 웜홀은 목성 곁(태양에서 약 5.2 AU) → tan p = 1 AU / 5.2 AU → p ≈ 11°.  1/39,600 pc × 206,265 AU/pc ≈ 5.2 AU ≈ 7억 8천만 km
          배의 순항 속도 초속 42 km 로 7억 8천만 km ÷ 42 km/s ≈ 1,860만 초 ≈ 214일 — 이야기 속 비행 일수와 같다
   ============================================================ */
'use strict';
const LOUNGE={P_DEG:11, P_SEC:39600,
  async start(R){ const me=t=>({kind:'me',t}), V=t=>({who:'VEGA',kind:'vega',t});
    // 라운지 가운데 소파 (창을 본다 = +z) · 앞 낮은 탁자
    const seatC={x:20.35,z:19.72}, seatD={x:21.3,z:19.72}, tbl={x:20.8,z:21.9}, top=(SOLID.top(tbl.x,tbl.z,1.0,.05)||.35)+.004;
    const dn=await PEOPLE.spawn({kind:'daniel',name:'다니엘 로드리게스',role:'기관',at:{x:seatD.x,z:seatD.z,yaw:Math.PI},pose:'sit',seatY:.44});
    const DN=t=>({who:'다니엘',t,npc:dn});
    // A4 종이 (가로) — 캔버스에 그린다. 종이 윗변이 창 쪽(+z)
    const PW=.297, PH=.21, CW=1188, CH=840, cv=document.createElement('canvas'); cv.width=CW; cv.height=CH; const g=cv.getContext('2d');
    const tex=new THREE.CanvasTexture(cv); tex.encoding=THREE.sRGBEncoding; tex.anisotropy=4;
    const paper=new THREE.Mesh(new THREE.PlaneGeometry(PW,PH),new THREE.MeshStandardMaterial({map:tex,roughness:.9}));
    paper.rotation.set(-Math.PI/2,0,Math.PI+.04); paper.position.set(tbl.x,top+.012,tbl.z); WORLD.add(paper);
    const board=new THREE.Mesh(new THREE.BoxGeometry(.34,.012,.255),new THREE.MeshStandardMaterial({color:0x0c0e10,roughness:.95,metalness:0})); board.position.set(tbl.x,top+.005,tbl.z); WORLD.add(board);
    const pen=new THREE.Mesh(new THREE.CylinderGeometry(.004,.004,.15,8),new THREE.MeshStandardMaterial({color:0x223344,metalness:.3})); pen.rotation.set(0,0,Math.PI/2.3); pen.position.set(tbl.x-.17,top+.018,tbl.z-.07); WORLD.add(pen);
    // 종이 위 점 (px). 왼쪽 반 = 시차 · 오른쪽 반 = 연주 시차
    const EL={x:110,y:735}, ER={x:250,y:735}, FG={x:180,y:430}, WALL=95;
    const Sun={x:860,y:700}, E1={x:690,y:700}, E2={x:1030,y:700}, Star={x:860,y:170}, done=[];
    const hand=(s,w=500)=>`${w} ${s}px "Nanum Pen Script","Segoe Print","Comic Sans MS","Malgun Gothic",sans-serif`;
    const line=(a,b,w=4,c='#2a2f3a')=>{ g.strokeStyle=c; g.lineWidth=w; g.lineCap='round'; g.beginPath(); g.moveTo(a.x,a.y); g.lineTo(b.x,b.y); g.stroke(); };
    const dot=(p,r,c)=>{ g.fillStyle=c; g.beginPath(); g.arc(p.x,p.y,r,0,7); g.fill(); };
    const label=(t,x,y,s=34,c='#2a2f3a',al='center')=>{ g.fillStyle=c; g.font=hand(Math.round(s*1.35)); g.textAlign=al; g.textBaseline='middle'; g.fillText(t,x,y); };
    const ext=(a,b,y)=>({x:a.x+(b.x-a.x)*(y-a.y)/(b.y-a.y),y});          // a→b 를 높이 y 까지 늘인 점
    function base(){ g.fillStyle='#f4f1ea'; g.fillRect(0,0,CW,CH);
      for(let i=0;i<1400;i++){ g.fillStyle=`rgba(120,110,90,${Math.random()*.04})`; g.fillRect(Math.random()*CW,Math.random()*CH,2,2); }
      g.strokeStyle='rgba(60,70,90,.18)'; g.lineWidth=2; g.beginPath(); g.moveTo(CW*.44,40); g.lineTo(CW*.44,CH-40); g.stroke();
      // 시차 : 두 눈 · 손가락 · 먼 벽
      label('시차',40,48,46,'#2a2f3a','left');
      g.strokeStyle='#8a8f99'; g.lineWidth=3; g.setLineDash([14,10]); g.beginPath(); g.moveTo(30,WALL); g.lineTo(CW*.44-30,WALL); g.stroke(); g.setLineDash([]); label('먼 벽',CW*.44-60,WALL-26,30,'#6a707a');
      [EL,ER].forEach((e,i)=>{ g.strokeStyle='#2a2f3a'; g.lineWidth=3; g.beginPath(); g.ellipse(e.x,e.y,30,18,0,0,7); g.stroke(); dot(e,9,'#2a2f3a'); label(i?'오른눈':'왼눈',e.x,e.y+44,30); });
      g.strokeStyle='#c8892a'; g.lineWidth=12; g.lineCap='round'; g.beginPath(); g.moveTo(FG.x,FG.y+70); g.lineTo(FG.x,FG.y-6); g.stroke(); label('손가락',FG.x+60,FG.y+10,30,'#a06818','left');
      // 연주 시차 : 태양 · 지구 공전 궤도 · 별
      label('연주 시차',CW*.44+40,48,46,'#2a2f3a','left');
      g.setLineDash([10,12]); g.strokeStyle='rgba(60,70,90,.35)'; g.lineWidth=2; g.beginPath(); g.ellipse(Sun.x,Sun.y,E2.x-Sun.x,52,0,0,7); g.stroke(); g.setLineDash([]);
      dot(Sun,22,'#e0a030'); label('태양',Sun.x,Sun.y+56,38);
      dot(E1,12,'#3a78c8'); label('1월 지구',E1.x,E1.y+50,32); dot(E2,12,'#3a78c8'); label('7월 지구',E2.x,E2.y+50,32);
      g.fillStyle='#c8382a'; g.font='600 64px sans-serif'; g.textAlign='center'; g.textBaseline='middle'; g.fillText('★',Star.x,Star.y); label('별',Star.x+56,Star.y,40);
      done.forEach(f=>f()); tex.needsUpdate=true; }
    base();
    // 그리기 : 종이 위 좌표 ← 화면 좌표 (레이캐스트 → UV)
    const rc=new THREE.Raycaster(), toPaper=e=>{ rc.setFromCamera(new THREE.Vector2(e.clientX/innerWidth*2-1,-(e.clientY/innerHeight)*2+1),camera); const h=rc.intersectObject(paper)[0]; return h?{x:h.uv.x*CW,y:(1-h.uv.y)*CH}:null; };
    const near=(a,b,r)=>Math.hypot(a.x-b.x,a.y-b.y)<r, segD=(p,a,b)=>{ const vx=b.x-a.x, vy=b.y-a.y, t=clamp(((p.x-a.x)*vx+(p.y-a.y)*vy)/(vx*vx+vy*vy),0,1); return Math.hypot(p.x-a.x-vx*t,p.y-a.y-vy*t); };
    const passes=(s,p,r)=>s.some(q=>near(q,p,r));
    let stroke=null, want=null, miss=0;
    const cvs=$('#c'), down=e=>{ if(!want) return; const p=toPaper(e); if(!p) return; stroke=[p]; }, move=e=>{ if(!stroke) return; const p=toPaper(e); if(!p) return; const q=stroke[stroke.length-1]; stroke.push(p); line(q,p,5,'#4a5060'); tex.needsUpdate=true; },
      up=()=>{ if(!stroke) return; const s=stroke; stroke=null; const ok=want.check(s);
        if(ok){ AUDIO.tone(880,.12,'sine',.08); AUDIO.tone(1320,.16,'sine',.07,.1); done.push(ok===true?want.draw:ok); base(); miss=0; if(want.more&&want.more()) return; const r=want.res; want=null; r(); }
        else { AUDIO.tone(220,.18,'square',.04); base(); miss++; if(miss>=2) toast(want.hint,3200); } };
    cvs.addEventListener('pointerdown',down); addEventListener('pointermove',move); addEventListener('pointerup',up);
    // 한 단계 : 짧은 목표 → 맞게 그릴 때까지 (두 번 틀리면 그때 힌트)
    const step=(text,hint,check,draw,more)=>new Promise(res=>{ goal(text); miss=0; want={hint,check,draw,res,more}; });

    // ---- 무대 : 크리스는 소파에 앉아 있다 (둘러보기만) ----
    warp(seatC.x,seatC.z-.1,Math.PI); P.eye=1.12; P.yaw=Math.PI+.12; P.pitch=.05;
    stamp('하위헌스 2호 · 라운지 · 전망대','지구 궤도 출발 · 목성까지 214일'); SHIPMAP.at('lobby'); AUDIO.hum(.7,50);
    await fade(false,1600);
    await card('','출발 6시간 뒤','하위헌스 2호 · 라운지',2600);
    S.phase='play'; P.free=false; P.look=true;
    await TALK.say([me('다들 동면 캡슐에 들어갔다. 창밖에 지구가 손톱만 해졌다.'),
      DN('선장님, 들어가기 전에 하나만요. …저 웜홀까지 얼마나 걸리는 거예요?'),
      me('거리를 알면, 배의 속도로 시간을 알 수 있지.'),
      DN('그 거리는 어떻게 재요? 줄자를 댈 수도 없고.'),
      me('시차. 종이 있나? 시차랑 연주 시차를 그림으로 그려 보자.'),
      DN('여기요. A4 한 장.')]);
    window.dragHook=()=>{}; P.look=false; SHIPMAP.at(null);
    await camTo({x:tbl.x,z:tbl.z-.015,yaw:Math.PI,pitch:-1.52,eye:top+.31},1.4);
    // ① 시차 : 두 눈에서 손가락을 지나 벽까지 (선 둘, 순서 자유)
    await TALK.say([me('한쪽 눈씩 번갈아 감고 손가락을 보면, 손가락이 벽 앞에서 움직여 보이지.')]);
    const eyes={L:false,R:false};
    await step('① 시차 : 두 눈에서 손가락을 지나 벽까지','눈 → 손가락 → 벽. 한 눈에 한 줄씩',s=>{ const a=s[0], b=s[s.length-1];
        for(const [k,e] of [['L',EL],['R',ER]]){ if(eyes[k]) continue; const st=near(a,e,90)?a:near(b,e,90)?b:null; if(!st) continue; const en=st===a?b:a;
          if(passes(s,FG,70)&&en.y<WALL+110){ eyes[k]=true; const hit=ext(e,FG,WALL); return ()=>{ line(e,hit,4,'#3a78c8'); dot(hit,10,'#3a78c8'); label(k==='L'?'왼눈':'오른눈',hit.x,WALL-30,26,'#3a78c8'); }; } }
        return false; },null,()=>!(eyes.L&&eyes.R));
    const hL=ext(EL,FG,WALL), hR=ext(ER,FG,WALL);
    done.push(()=>{ g.strokeStyle='#c8382a'; g.lineWidth=4; line({x:hR.x,y:WALL+28},{x:hL.x,y:WALL+28},4,'#c8382a'); label('시차',(hL.x+hR.x)/2,WALL+62,34,'#c8382a'); }); base();
    await TALK.say([DN('벽 위에서 손가락이 이만큼 옮겨 다니네요.'),me('가까운 것일수록 더 많이 옮겨 다닌다. 이번엔 눈 대신 지구로.')]);
    // ② 연주 시차 : 반년 사이 지구의 두 자리 → 별, 그리고 태양 → 별
    const legs={E1:false,E2:false,S:false};
    await step('② 1월 · 7월의 지구에서 별을, 태양에서 별을 이어 보자','파란 점(지구) · 주황 점(태양) 에서 ★ 까지',s=>{ const a=s[0], b=s[s.length-1];
        for(const [k,P0] of [['E1',E1],['E2',E2],['S',Sun]]){ if(legs[k]) continue; if((near(a,P0,85)&&near(b,Star,85))||(near(b,P0,85)&&near(a,Star,85))){ legs[k]=true; return ()=>line(P0,Star,4,k==='S'?'#2a2f3a':'#3a78c8'); } }
        return false; },null,()=>!(legs.E1&&legs.E2&&legs.S));
    done.push(()=>{ label('1 AU',(E1.x+Sun.x)/2,Sun.y-28,28,'#3a78c8'); label('d',Sun.x+22,(Sun.y+Star.y)/2,38,'#c8382a','left'); }); base();
    await TALK.say([me('반년 사이에 지구는 궤도 반대편으로 간다. 별을 보는 방향이 그만큼 바뀌지.'),
      me('별 꼭짓점의 이 각 — 그 절반이 연주 시차야.')]);
    // ③ 연주 시차 p : 별 꼭짓점, 1월 지구 쪽 반각 (태양–별 선과 지구–별 선 사이)
    await step('③ 연주 시차 p 는 어디일까','별 꼭짓점 — 태양 쪽 선과 지구 쪽 선 사이의 각',s=>{ const p=s[s.length-1]; return p.y>Star.y+40&&p.y<Star.y+240&&near(p,{x:Star.x-30,y:Star.y+130},100)&&p.x<Star.x+4; },
      ()=>{ const a1=Math.atan2(Sun.y-Star.y,Sun.x-Star.x), a2=Math.atan2(E1.y-Star.y,E1.x-Star.x); g.strokeStyle='#c8382a'; g.lineWidth=5; g.beginPath(); g.arc(Star.x,Star.y,120,Math.min(a1,a2),Math.max(a1,a2)); g.stroke(); label('p',Star.x-46,Star.y+150,40,'#c8382a'); });
    done.push(()=>{ label('p = 1″  →  d = 1 pc',Sun.x+30,Star.y+300,30,'#c8382a','left'); label('거리(pc) = 1 ÷ p(″)',CW*.44+40,CH-46,38,'#2a2f3a','left'); }); base();
    goal(''); window.dragHook=null; SHIPMAP.at('lobby');
    await TALK.say([me('연주 시차가 1초(1″)일 때의 거리가 1 파섹, 1 pc. 약 3.26 광년.'),
      me('그래서 거리를 파섹으로, 연주 시차를 초로 쓰면 — 거리 = 1 ÷ 연주 시차.'),
      DN('그럼 웜홀도 이걸로 잴 수 있겠네요?'),
      me('지구에서 반년 간격으로 잰 웜홀의 연주 시차는 약 '+this.P_DEG+'°. 아주 가깝다는 뜻이지.')]);
    await this.quiz();
    await TALK.say([V('계산을 확인합니다. 1/39,600 pc — 1 pc 는 약 20만 6천 AU 이므로, 약 5.2 AU. 7억 8천만 km 입니다.'),
      V('본 함선의 순항 속도는 초속 42 km. 7억 8천만 km ÷ 42 km/s ≈ 1,860만 초. 약 214일입니다.'),
      DN('214일! 그래서 214일이었구나. …이제 진짜 자러 가야겠네요. 깨면 목성 앞이겠죠.'),
      me('잘 자, 다니엘. 214일 뒤에 보자.')]);
    removeEventListener('pointermove',move); removeEventListener('pointerup',up); cvs.removeEventListener('pointerdown',down);
    S.phase='cut'; await fade(true,1800); await go('approach'); },

  // 숫자 입력 : 거리(pc) = 1 ÷ [ □ ]″  — pc 는 왼쪽(구하는 것), 칸은 초(″)
  quiz(){ return new Promise(res=>{ const q=document.createElement('div'); q.id='quiz';
    q.innerHTML=`<p class="hd">연주 시차로 거리 구하기</p><p class="q">웜홀의 연주 시차 p ≈ ${this.P_DEG}°</p>
      <div class="eq"><span class="lhs">거리 <b>d</b><small>pc</small></span><span class="op">=</span><span class="frac"><span class="num">1</span><span class="den"><input type="text" inputmode="numeric" autocomplete="off" aria-label="연주 시차 (초)"><em>″</em></span></span></div>
      <p class="note">칸에는 연주 시차를 <b>초(″)</b> 단위로</p><p class="msg"></p><button>확인</button>`;
    document.body.appendChild(q); requestAnimationFrame(()=>q.classList.add('on')); const inp=q.querySelector('input'), msg=q.querySelector('.msg'); let tries=0; setTimeout(()=>inp.focus(),300);
    const check=()=>{ const v=Number(String(inp.value).replace(/[,\s]/g,'')); tries++;
      if(v===this.P_SEC){ AUDIO.tone(880,.12,'sine',.08); AUDIO.tone(1320,.2,'sine',.07,.1); msg.textContent='정답 — d = 1 ÷ 39,600″ = 약 0.000025 pc'; q.classList.add('ok'); setTimeout(()=>{ q.remove(); res(); },1500); return; }
      AUDIO.tone(220,.18,'square',.04);
      msg.textContent=v===this.P_DEG?'칸은 초(″) 단위예요. 도(°)로 넣으면 안 돼요':tries<2?'다시 — 도(°)를 초(″)로':`1° = 60′ = 3600″ 이니까, ${this.P_DEG}° 는?`; };
    q.querySelector('button').onclick=check; inp.onkeydown=e=>{ if(e.key==='Enter') check(); e.stopPropagation(); }; }); },
};
