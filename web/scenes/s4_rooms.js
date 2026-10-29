/* ============================================================
   함선의 새 방 셋 (blender/10_하위헌스2호.blend) — 연구실 · 라운지(전망대) · 기관실
   연구실 : Sketchfab Sci-fi lab (Agata Wilczek) + 분광기(CC0) · 현미경 — 3장 별빛 분광 퍼즐 자리
   라운지 : 배 한가운데의 놀 수 있는 곳. 통유리 · 천창 · 소파 · 바 · 탁구대 · 정원 (Poly Haven 가구)
   기관실 : 핵융합 · 핵분열 혼합 원자로 (Sketchfab, Lynxon) · 제어 콘솔 둘
   ============================================================ */
'use strict';
const V_=t=>({who:'VEGA',kind:'vega',t}), ME_=t=>({kind:'me',t});
const peek=(R,x,y,z,w,h,d,name,lines,range=3)=>{ const m=new THREE.Mesh(new THREE.BoxGeometry(w,h,d),PICK); m.position.set(x,y,z); WORLD.add(m); interact(m,name,()=>TALK.say(lines()),{range}); return m; };

ROOMS.lab=async R=>{ const f=S.flags, it=R.items, U=BRIDGEUI;
  if(it.spectro){ it.spectro.material=PICK;
    interact(it.spectro,'분광기 — 빛을 무지개로 펼친다',()=>TALK.say([V_('광학 분광기입니다. 별빛을 프리즘으로 펼쳐 흡수선의 자리를 잽니다.'),ME_('별의 색과 온도… 1호가 보낸 행성 자료도 이걸로 다시 봐야겠군.')]),{range:2.6}); }
  peek(R,42.0,1.15,6.8,.4,.5,.4,'현미경',()=>[V_('표본 현미경입니다. 지금은 비어 있습니다.')],2.4);
  R.onEnter=()=>{ if(f.labIn||SHIP.mode!=='wake') return; f.labIn=true;
    TALK.say([V_('연구실입니다. 분광기 · 현미경 · 시료 탱크. 행성 자료와 별빛을 분석하는 곳입니다.')]); };
};

ROOMS.lobby=async R=>{ const f=S.flags, U=BRIDGEUI, {T,head,F,M,INK,MUTE,DIM,CY,AL}=U;
  // 나무 바닥 · 가죽 · 깔개 : 따뜻하되 차분하게 (텍스처 색이 진하다)
  R.objs.forEach(r=>r.traverse(o=>{ if(!o.isMesh||!o.material) return; const n=o.material.name;
    if(n==='lounge_wood'){ o.material.color.setRGB(.36,.37,.38); o.material.roughness=.6; } if(n==='lounge_rug') o.material.color.setRGB(.17,.2,.25); if(n==='lounge_leather') o.material.color.setRGB(.36,.34,.32); }));
  const fill=new THREE.PointLight(0xffe2c4,.9,16,1.6); fill.position.set(20.5,4.2,19.5); R.add(fill);
  // 바 뒤 작은 화면 : 선내 음악 · 시각
  U.mount('lounge',R.items.scr_lounge,new THREE.Vector3(14,1.6,18),(g,W,H,t)=>{ head(g,W,'LOUNGE','라운지');
    T(g,'지금 흐르는 곡',16,H*.42,F(500,15),MUTE); T(g,'Clair de Lune — 드뷔시',16,H*.42+30,F(600,22),INK);
    for(let i=0;i<40;i++){ const h=6+Math.abs(Math.sin(t*3+i*.7)*Math.sin(t*1.3+i))*36; g.fillStyle=CY; g.fillRect(16+i*(W-32)/40,H-20-h,(W-32)/40-3,h); } });
  TICK.push(dt=>U.tick(dt));
  // 살펴보기 (세계 좌표 · three)
  peek(R,20.5,1.5,26.4,20,3,.6,'통유리 창',()=>S.flags.passed?[ME_('같은 별, 같은 어둠. 그런데 여기엔 우리 해가 없다.')]:SHIP.mode==='depart'?[ME_('지구가 점점 작아진다.')]:[ME_('214일 동안 아무도 이 창 앞에 앉지 않았겠지.'),V_('전망창은 두께 30 cm 의 다층 유리입니다. 우주선(宇宙線)을 막는 막이 들어 있습니다.')],4.5);
  peek(R,26.0,.8,15.6,2.8,.4,1.6,'탁구대',()=>[ME_('다니엘이랑 오언이 출발 전날 밤새 쳤다던 그 탁구대.'),V_('무중력 구간에서는 공이 돌아오지 않습니다. 이 배는 엔진이 1 G 로 밀어 주는 동안만 칠 수 있습니다.')],3.5);
  peek(R,12.2,1.1,18.5,1.2,1.4,6,'바 카운터',()=>[ME_('술은 없다. 무알코올 맥주 열두 캔, 커피, 그리고 누가 숨겨 둔 초콜릿.')],3);
  peek(R,30.2,1.0,23.6,1.2,2,4.5,'정원',()=>[V_('라운지 정원은 대원들의 기분을 위해 둔 것입니다. 산소는 식당 쪽 수경 재배가 맡습니다.')],3);
  peek(R,16.4,.7,24.9,.6,.8,.6,'카세트 플레이어',()=>[ME_('마야 거다. 70년 된 붐박스. "음악은 테이프로 들어야 진짜"라나.')],2.4);
  R.onEnter=()=>{ if(f.lobbyIn||SHIP.mode!=='wake') return; f.lobbyIn=true;
    TALK.say([V_('라운지입니다. 배 한가운데에 있습니다. 쉬는 곳이자 전망대입니다.'),ME_('…천장까지 별이다.')]); };
};

ROOMS.engine=async R=>{ const f=S.flags, U=BRIDGEUI, {T,head,F,M,INK,MUTE,DIM,CY,AL}=U, it=R.items;
  // 원자로 빛 : 숨 쉬듯
  const core=new THREE.PointLight(0x7fd4ff,2.4,18,1.6); core.position.set(63.3,5,10.35); R.add(core);
  // 높이 10 m 의 큰 방 : 빛이 멀리까지 가도록 (맵의 LIGHT_ 도 세게)
  R.objs.forEach(o=>{ if(o.isPointLight){ o.intensity*=1.3; o.decay=1.3; o.distance*=1.3; }
    if(o.traverse) o.traverse(m=>{ if(!m.isMesh||!m.material) return; const n=m.material.name;
      if(n==='eng_wall') m.material.color.setRGB(.17,.18,.2); if(n==='eng_band') m.material.color.setRGB(.11,.115,.12); if(n==='eng_ceil') m.material.color.setRGB(.1,.1,.11); if(n==='eng_rib'){ m.material.color.setRGB(.05,.055,.06); m.material.metalness=.8; } }); });
  [[58.5,4.5],[68,4.5],[58.5,16.2],[68,16.2]].forEach(([x,z])=>{ const l=new THREE.PointLight(0xc8d8ea,1.4,18,1.3); l.position.set(x,7.5,z); R.add(l); });
  const warm=new THREE.PointLight(0xff7a2a,1.2,10,1.5); warm.position.set(63.3,.6,10.35); R.add(warm);
  TICK.push(()=>{ core.intensity=2.2+.6*Math.sin(S.t*1.4)+.15*Math.sin(S.t*9); });
  const sc=(key,item,label)=>U.mount(key,item,new THREE.Vector3(55.8,1.4,10.35),(g,W,H,t)=>{ head(g,W,'ENGINEERING',label);
    [['노심 온도','1.2억 K'],['자기장 가둠','99.7 %'],['이온 엔진 추력','2 × 410 kN'],['방열판','정상']].forEach(([a,b],i)=>{ const y=60+i*((H-70)/4); T(g,a,16,y+18,F(500,16),MUTE); T(g,b,W-16,y+18,M(20,600),i===0?AL:INK,'right'); });
    g.strokeStyle=CY; g.beginPath(); for(let x=0;x<W;x+=3){ const y=H-14-10*(1+Math.sin(x*.05+t*2)); x?g.lineTo(x,y):g.moveTo(x,y); } g.stroke(); });
  sc('eng0',it.scr_eng0,'원자로'); sc('eng1',it.scr_eng1,'추진');
  peek(R,63.3,3.5,10.35,7,7,7,'원자로 — 핵융합 · 핵분열 혼합로',()=>[V_('하위헌스 2호의 심장입니다. 수소를 헬륨으로 바꾸는 핵융합으로 에너지를 얻습니다. 별이 빛나는 방식과 같습니다.'),ME_('배 안에 작은 별이 하나 있는 셈이군.')],9);
  R.onEnter=()=>{ if(f.engIn||SHIP.mode!=='wake') return; f.engIn=true;
    TALK.say([V_('기관실입니다. 원자로 주변 노란 선 안으로는 들어가지 마십시오.')]); };
};
