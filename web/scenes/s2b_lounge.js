/* ============================================================
   출발 직후 — 라운지 · 전망대 (함선 공간 · SHIP.mode 'depart'). 통유리 너머로 지구가 작아진다
   다른 대원은 이미 동면 캡슐에 들어갔다. 크리스(소파)와 다니엘(탁자 건너 스툴)만 남아 마주 앉아 이야기한다 (1차시 : 시차 · 연주 시차 · pc)
   다니엘 "웜홀까지 얼마나 걸려요?" → 거리를 알면 시간 → "거리는 어떻게 재요?" → 시차
   『인터스텔라』 오마주 : 탁자 위 A4 종이에 직접 그린다 (디벗 : 손가락으로 선 긋기 · 누르기). 안내는 짧게 — 학생이 생각하게
     ① 시차 : 1월 · 7월 지구 → 별 → 먼 배경 (선 둘)     ② 연주 시차 : 태양 → 별     ③ 연주 시차 p 는 어느 각? (누르기)
   → 퀴즈 : 웜홀의 연주 시차 약 11° → 거리 d(pc) = 1 ÷ p(″) 에서 p 를 초로 (39,600)
   과학 : 웜홀은 목성 곁(태양에서 약 5.2 AU) → tan p = 1 AU / 5.2 AU → p ≈ 11°.  1/39,600 pc × 206,265 AU/pc ≈ 5.2 AU ≈ 7억 8천만 km
          배의 순항 속도 초속 42 km 로 7억 8천만 km ÷ 42 km/s ≈ 1,860만 초 ≈ 214일 — 이야기 속 비행 일수와 같다
   ============================================================ */
'use strict';
const LOUNGE={P_DEG:11, P_SEC:39600,
  async start(R){ const me=t=>({kind:'me',t}), V=t=>({who:'VEGA',kind:'vega',t});
    // 크리스는 가운데 소파 (창을 본다 = +z) · 앞 낮은 탁자 · 다니엘은 탁자 건너편 가죽 스툴에 (창을 등지고 크리스를 본다)
    const tbl={x:20.8,z:21.9}, seatC={x:20.8,z:19.72}, seatD={x:20.8,z:23.05}, top=(SOLID.top(tbl.x,tbl.z,1.0,.05)||.35)+.004;
    let leather=null; R.root.traverse(o=>{ if(o.isMesh&&o.material&&o.material.name==='lounge_leather') leather=o.material; });
    const pouf=new THREE.Mesh(new THREE.CylinderGeometry(.27,.29,.42,28),leather||new THREE.MeshStandardMaterial({color:0x4a3c32,roughness:.6}));
    pouf.position.set(seatD.x,.21,seatD.z); R.add(pouf);
    const dn=await PEOPLE.spawn({kind:'daniel',name:'다니엘 로드리게스',role:'기관',at:{x:seatD.x,z:seatD.z,yaw:0},pose:'sit',seatY:.44});
    const DN=t=>({who:'다니엘',t,npc:dn});
    // 큰 종이 (가로 · A2 쯤) — 캔버스에 그린다. 종이 윗변이 창 쪽(+z)
    const PW=.66, PH=.467, CW=1188, CH=840, cv=document.createElement('canvas'); cv.width=CW; cv.height=CH; const g=cv.getContext('2d');
    const tex=new THREE.CanvasTexture(cv); tex.encoding=THREE.sRGBEncoding; tex.anisotropy=8;
    const paper=new THREE.Mesh(new THREE.PlaneGeometry(PW,PH),new THREE.MeshStandardMaterial({map:tex,roughness:.9}));
    paper.rotation.set(-Math.PI/2,0,Math.PI+.03); paper.position.set(tbl.x,top+.012,tbl.z); WORLD.add(paper);
    const board=new THREE.Mesh(new THREE.BoxGeometry(PW+.04,.012,PH+.04),new THREE.MeshStandardMaterial({color:0x0c0e10,roughness:.95,metalness:0})); board.position.set(tbl.x,top+.005,tbl.z); WORLD.add(board);
    const pen=new THREE.Mesh(new THREE.CylinderGeometry(.004,.004,.15,8),new THREE.MeshStandardMaterial({color:0x223344,metalness:.3})); pen.rotation.set(0,0,Math.PI/2.3); pen.position.set(tbl.x-.39,top+.018,tbl.z-.12); WORLD.add(pen);
    // 종이 위 점 (px) : 아래 = 태양 · 지구 공전 궤도, 가운데 = 가까운 별, 위 = 먼 배경 (먼 별들)
    const WALL=110, Sun={x:594,y:700}, E1={x:364,y:700}, E2={x:824,y:700}, Star={x:594,y:360}, done=[];
    const hand=(s,w=500)=>`${w} ${s}px "Nanum Pen Script","Segoe Print","Comic Sans MS","Malgun Gothic",sans-serif`;
    const line=(a,b,w=4,c='#2a2f3a')=>{ g.strokeStyle=c; g.lineWidth=w; g.lineCap='round'; g.beginPath(); g.moveTo(a.x,a.y); g.lineTo(b.x,b.y); g.stroke(); };
    const dot=(p,r,c)=>{ g.fillStyle=c; g.beginPath(); g.arc(p.x,p.y,r,0,7); g.fill(); };
    const label=(t,x,y,s=34,c='#2a2f3a',al='center')=>{ g.fillStyle=c; g.font=hand(Math.round(s*1.35)); g.textAlign=al; g.textBaseline='middle'; g.fillText(t,x,y); };
    const ext=(a,b,y)=>({x:a.x+(b.x-a.x)*(y-a.y)/(b.y-a.y),y});          // a→b 를 높이 y 까지 늘인 점
    const bg=[...Array(26)].map((_,i)=>({x:110+i*37+((i*53)%17),y:WALL-24-((i*31)%30),r:2+(i*7)%3}));
    function base(){ g.fillStyle='#f4f1ea'; g.fillRect(0,0,CW,CH);
      for(let i=0;i<1400;i++){ g.fillStyle=`rgba(120,110,90,${(i*37%100)/2500})`; g.fillRect((i*733)%CW,(i*389)%CH,2,2); }
      // 먼 배경 : 점선 + 작은 별들
      g.strokeStyle='#8a8f99'; g.lineWidth=3; g.setLineDash([14,10]); g.beginPath(); g.moveTo(90,WALL); g.lineTo(CW-90,WALL); g.stroke(); g.setLineDash([]);
      bg.forEach(p=>dot(p,p.r,'#9aa0aa')); label('먼 별들 (배경)',CW-96,WALL+36,38,'#6a707a','right');
      // 태양 · 지구 공전 궤도 · 가까운 별
      g.setLineDash([10,12]); g.strokeStyle='rgba(60,70,90,.35)'; g.lineWidth=2; g.beginPath(); g.ellipse(Sun.x,Sun.y,E2.x-Sun.x,52,0,0,7); g.stroke(); g.setLineDash([]);
      dot(Sun,26,'#e0a030'); label('태양',Sun.x,Sun.y+66,46);
      dot(E1,15,'#3a78c8'); label('1월 지구',E1.x,E1.y+62,44); dot(E2,15,'#3a78c8'); label('7월 지구',E2.x,E2.y+62,44);
      g.fillStyle='#c8382a'; g.font='600 84px sans-serif'; g.textAlign='center'; g.textBaseline='middle'; g.fillText('★',Star.x,Star.y); label('가까운 별',Star.x+60,Star.y-48,44,'#2a2f3a','left');
      done.forEach(f=>f()); tex.needsUpdate=true; }
    base();
    // 그리기 : 종이 위 좌표 ← 화면 좌표 (레이캐스트 → UV)
    const rc=new THREE.Raycaster(), toPaper=e=>{ rc.setFromCamera(new THREE.Vector2(e.clientX/innerWidth*2-1,-(e.clientY/innerHeight)*2+1),camera); const h=rc.intersectObject(paper)[0]; return h?{x:h.uv.x*CW,y:(1-h.uv.y)*CH}:null; };
    const near=(a,b,r)=>Math.hypot(a.x-b.x,a.y-b.y)<r, passes=(s,p,r)=>s.some(q=>near(q,p,r));
    let stroke=null, want=null, miss=0;
    const cvs=$('#c'), down=e=>{ if(!want) return; const p=toPaper(e); if(!p) return; stroke=[p]; }, move=e=>{ if(!stroke) return; const p=toPaper(e); if(!p) return; const q=stroke[stroke.length-1]; stroke.push(p); line(q,p,7,'#4a5060'); tex.needsUpdate=true; },
      up=()=>{ if(!stroke) return; const s=stroke; stroke=null; const ok=want.check(s);
        if(ok){ AUDIO.tone(880,.12,'sine',.08); AUDIO.tone(1320,.16,'sine',.07,.1); done.push(ok===true?want.draw:ok); base(); miss=0; if(want.more&&want.more()) return; const r=want.res; want=null; r(); }
        else { AUDIO.tone(220,.18,'square',.04); base(); miss++; if(miss>=2) toast(want.hint,3200); } };
    cvs.addEventListener('pointerdown',down); addEventListener('pointermove',move); addEventListener('pointerup',up);
    // 한 단계 : 짧은 목표 → 맞게 그릴 때까지 (두 번 틀리면 그때 힌트)
    const step=(text,hint,check,draw,more)=>new Promise(res=>{ goal(text); miss=0; want={hint,check,draw,res,more}; });
    this._t={E1,E2,Sun,Star,WALL,ext,paper,CW,CH,PW,PH};                    // 시험용 (dev)

    // ---- 무대 : 크리스는 소파에, 다니엘은 탁자 건너편에 마주 앉아 있다 (둘러보기만) ----
    warp(seatC.x,seatC.z-.1,Math.PI); P.eye=1.12; P.yaw=Math.PI; P.pitch=-.04;
    stamp('하위헌스 2호 · 라운지 · 전망대','지구 궤도 출발 · 목성까지 214일'); SHIPMAP.at('lobby'); AUDIO.hum(.7,50);
    await fade(false,1600);
    await card('','출발 6시간 뒤','하위헌스 2호 · 라운지',2600);
    S.phase='play'; P.free=false; P.look=true;
    await TALK.say([me('다들 동면 캡슐에 들어갔다. 다니엘 어깨 너머로, 지구가 손톱만 해졌다.'),
      DN('선장님, 들어가기 전에 하나만요. …저 웜홀까지 얼마나 걸리는 거예요?'),
      me('거리를 알면, 배의 속도로 시간을 알 수 있지.'),
      DN('그 거리는 어떻게 재요? 줄자를 댈 수도 없고.'),
      me('시차를 이용하면 구할 수 있어.'),
      DN('시차요? 그게 뭔데요?'),
      me('그려서 보여 줄게. 종이 좀.'),
      DN('여기요.')]);
    window.dragHook=()=>{}; P.look=false; SHIPMAP.at(null);
    // 몸을 앞으로 숙여 종이를 본다 — 탁자 건너 다니엘도 보인다
    await camTo({x:tbl.x,z:tbl.z-.65,yaw:Math.PI,pitch:-.47,eye:1.12},1.4);
    await TALK.say([me('지구, 가까운 별, 그리고 그 뒤 아주 먼 별들(배경)을 그려 뒀어.')]);
    toast('지구 · 별 · 배경으로 시차와 연주 시차를 그려서 설명해 보자',4200);
    // ① 시차 : 1월 · 7월의 지구에서 별을 지나 배경까지 (선 둘, 순서 자유)
    const seen={E1:false,E2:false};
    await step('① 시차를 그려 보자','지구 → ★ → 배경 선. 지구 하나에 한 줄씩',s=>{ const a=s[0], b=s[s.length-1];
        for(const [k,e] of [['E1',E1],['E2',E2]]){ if(seen[k]) continue; const st=near(a,e,90)?a:near(b,e,90)?b:null; if(!st) continue; const en=st===a?b:a;
          if(passes(s,Star,75)&&en.y<WALL+110){ seen[k]=true; const hit=ext(e,Star,WALL); return ()=>{ line(e,hit,6,'#3a78c8'); dot(hit,13,'#3a78c8'); label(k==='E1'?'1월':'7월',hit.x,WALL-50,40,'#3a78c8'); }; } }
        return false; },null,()=>!(seen.E1&&seen.E2));
    const h1=ext(E1,Star,WALL), h2=ext(E2,Star,WALL);
    done.push(()=>{ line({x:h2.x,y:WALL+18},{x:h1.x,y:WALL+18},7,'#c8382a'); label('시차',(h1.x+h2.x)/2,WALL+62,50,'#c8382a'); }); base();
    await TALK.say([DN('어? 1월이랑 7월에, 별이 배경 위에서 이만큼 다른 자리에 보이네요.'),
      me('그게 시차. 보는 자리가 바뀌면, 가까운 별은 먼 배경 앞에서 옮겨 보여. 가까울수록 더 많이.'),
      DN('그럼 이 옮겨 간 정도로 거리를 알 수 있는 거예요?'),
      me('각도로 바꾸면. 이번엔 태양에서 보자.')]);
    // ② 연주 시차 : 태양 → 별, 그리고 각 p
    await step('② 연주 시차를 그려 보자','태양(주황 점)에서 ★ 까지 한 줄',s=>{ const a=s[0], b=s[s.length-1]; return (near(a,Sun,85)&&near(b,Star,85))||(near(b,Sun,85)&&near(a,Star,85)); },
      ()=>line(Sun,Star,6,'#2a2f3a'));
    done.push(()=>{ label('1 AU',(E1.x+Sun.x)/2,Sun.y-34,40,'#3a78c8'); label('d',Sun.x+20,(Sun.y+Star.y)/2+70,52,'#c8382a','left'); }); base();
    // ③ 연주 시차 p : 별 꼭짓점, 태양–별 선과 1월 지구–별 선 사이 (누르기)
    const aS=Math.atan2(Sun.y-Star.y,Sun.x-Star.x), aE=Math.atan2(E1.y-Star.y,E1.x-Star.x);
    await step('③ 연주 시차 p 는 어느 각일까','별 꼭짓점 — 태양 쪽 선과 지구 쪽 선 사이',s=>{ const p=s[s.length-1], r=Math.hypot(p.x-Star.x,p.y-Star.y), a=Math.atan2(p.y-Star.y,p.x-Star.x);
        return r>35&&r<280&&a>Math.min(aS,aE)-.12&&a<Math.max(aS,aE)+.12; },
      ()=>{ g.strokeStyle='#c8382a'; g.lineWidth=7; g.beginPath(); g.arc(Star.x,Star.y,120,Math.min(aS,aE),Math.max(aS,aE)); g.stroke(); const m=(aS+aE)/2; label('p',Star.x+Math.cos(m)*168,Star.y+Math.sin(m)*168,56,'#c8382a'); });
    done.push(()=>{ label('p = 1″ 이면 d = 1 pc',CW-50,420,36,'#c8382a','right'); label('거리(pc) = 1 ÷ p(″)',CW-50,495,46,'#2a2f3a','right'); }); base();
    goal(''); window.dragHook=null; SHIPMAP.at('lobby');
    await TALK.say([me('지구 공전 궤도 반지름(1 AU)을 별에서 본 각 — 이게 연주 시차 p.'),
      me('연주 시차가 1초(1″)일 때의 거리가 1 파섹, 1 pc. 약 3.26 광년.'),
      me('그래서 거리를 파섹으로, 연주 시차를 초로 쓰면 — 거리 = 1 ÷ 연주 시차.'),
      DN('그럼 웜홀도 이걸로 잴 수 있겠네요? 웜홀의 연주 시차는 얼마예요?'),
      me('반년 간격으로 잰 값이 약 '+this.P_DEG+'°. 아주 가깝다는 뜻이지.'),
      DN('그럼 웜홀까지 몇 pc 예요? 선장님이 한번 계산해 봐요.')]);
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
