/* ============================================================
   프롤로그 · NASA 존슨 우주 센터 브리핑룸 B (2091. 03. 14)
   다 같이 테이블에 앉아 있고, 그레이 국장이 화면 앞에서 발표한다. 크리스(나)도 앉아서 듣는다 — 둘러보기만 된다
   국장 발표 → 아마라 박사(웜홀 · 분광) → 엘레나(1호 마지막 교신 · 파형 아래의 낮은 소리) → 구조 계획 : 2호는 열넉 달 뒤에나 뜬다 → 지금 뜰 수 있는 건 1인 구조정 R-1 (연료 편도분)
     → 돌아오는 길 = 1호를 깨워 몰고 오기 → 1호를 설계한 크리스가 혼자 간다 → 넉 달 뒤 웜홀 건너편 조종석 (scenes/game.js) — 4판
   맵 : web/assets/meeting.glb (blender/00_회의실.blend) — SPAWN · IT_screen
   ============================================================ */
'use strict';
SCENES.meeting={title:'프롤로그 · 브리핑룸', async enter(){
  prefetch(['launch','cockpit','ship_ext',...SHIP.list().map(l=>l[0])]);      // 회의 동안 구조정 · 1호 파일을 받아 둔다
  await LEVEL.load('meeting'); await SKY.city(-1.1,.9); renderer.toneMappingExposure=1;
  // 방은 조명이 구워져 있고, 사람만 빛을 받는다
  WORLD.add(new THREE.HemisphereLight(0xfff6ea,0x2a2a30,1.05));
  const key=new THREE.DirectionalLight(0xfff0dc,.9); key.position.set(2,4,2); WORLD.add(key);
  // 테이블 의자 10개 (왼쪽 줄은 동쪽(+x)을, 오른쪽 줄은 서쪽을 본다) — 화면은 북쪽 벽(z −4.8)
  // 의자 자리 · 높이는 충돌 칸에서 잰 값 (앉는 면 가운데 x −1.3 / 0.25 · 높이 0.57 m)
  const ROW=[-1.65,-.65,.3,1.25,2.2], L=i=>({x:-1.28,z:ROW[i],yaw:-Math.PI/2}), R=i=>({x:.23,z:ROW[i],yaw:Math.PI/2});
  const sit=(kind,at,name,role)=>PEOPLE.spawn({kind,name,role,at,pose:'sit',seatY:.57});
  const [gray,amara,elena,maya,seojun,daniel,guard]=await Promise.all([
    PEOPLE.spawn({kind:'eric',name:'로버트 그레이',role:'NASA 탐사 임무국장',at:{x:2.35,z:-3.9,yaw:Math.PI*.8}}),
    sit('carla',R(0),'아마라 오코예','천체물리학자'), sit('claudia',R(3),'엘레나 피셔','심우주 통신 책임자'),
    sit('maya',R(1),'마야 첸','비행 관제 책임자'), sit('seojun',R(2),'한서준','항법 연구원'), sit('daniel',L(3),'다니엘 로드리게스','구조정 R-1 정비 책임'),
    PEOPLE.spawn({kind:'guard',name:'경비',role:'',at:{x:3.6,z:3.7,yaw:Math.PI*.15}})]);
  guard.watch=false;
  await SCREEN.mount(LEVEL.items.screen,new THREE.Vector3(0,1.6,0));
  const scr=new THREE.Vector3(-.43,2,-4.75), all=[amara,elena,maya,seojun,daniel];
  // 모두가 말하는 사람을 본다 (말하는 사람은 크리스를 본다)
  // 크리스의 눈도 따라간다 : 말하는 사람 얼굴로, 화면을 짚으면 화면으로 (앉아서 듣는 동안만 · 손으로 둘러봐도 다음 대사에서 다시 모인다)
  const gaze=(x,y,z)=>{ if(P.look&&!P.free) lookAt(x,y,z,.9); };
  const attend=who=>{ const h=who.B.head?who.B.head.getWorldPosition(new THREE.Vector3()):new THREE.Vector3(who.wrap.position.x,who.headY,who.wrap.position.z); all.concat(gray).forEach(p=>{ p.lookAt=p===who?null:h; }); if(who===gray&&gray.pointAt) gaze(scr.x,scr.y-.05,scr.z); else gaze(h.x,h.y-.05,h.z); };
  const toScreen=()=>{ all.forEach(p=>p.lookAt=scr); gaze(scr.x,scr.y-.05,scr.z); };
  const f=S.flags, me=t=>({kind:'me',t}), say=(npc,who)=>(t,fx,scr)=>({who,t,npc,fx:()=>{ attend(npc); fx&&fx(); if(scr) toScreen(); }});      // scr : 이 대사 동안은 화면을 본다
  const G=say(gray,'그레이 국장'), A=say(amara,'아마라 박사'), E=say(elena,'엘레나'), MY=say(maya,'마야'), SJ=say(seojun,'서준'), DN=say(daniel,'다니엘');
  const point=on=>{ gray.pointAt=on?scr:null; if(on) toScreen(); };

  // 크리스의 자리 : 왼쪽 줄 두 번째 의자 — 앉은 눈높이
  const seat=L(1); warp(seat.x-.12,seat.z,0); P.eye=1.18; P.yaw=yawTo(-.43,-4.75)*.6+(-Math.PI/2)*.4; P.pitch=.06;
  stamp('NASA JSC · 브리핑룸 B','2091.03.14  21:38');
  AUDIO.hum(.3,60); MUSIC.play('brief'); await fade(false,1400);
  await card('PROLOGUE','2091년 3월 14일','휴스턴 · NASA 존슨 우주 센터',3000);
  S.phase='play'; P.free=false; P.look=true;       // 앉아 있는 동안 : 둘러보기만
  goal('회의 · 화면을 보며 듣는다');
  await TALK.say([me('긴급 회의. 자정 가까운 시간인데 자리가 다 찼다.'),
    G('다 모였군. 시작하지. 늦은 시간에 불러서 미안하네.',()=>SCREEN.show('gravity')),
    G('전 세계 관측소 412곳의 중력계 값이야. 붉은 곳일수록 평소 지구 중력과 차이가 크네.',()=>point(true)),
    G('5년 전엔 저울이 몇 그램 틀리는 정도였지. 지금은 해마다 네 배씩 커지고 있어. 오른쪽 아래 — 콜로라도 볼더 관측소, 지금 이 순간의 값이야.'),
    G('결과가 이거야.',()=>{ SCREEN.show('earth'); }),
    G('밀물이 방벽을 넘고, 비행기가 고도를 지키지 못하고, 원자시계마저 하루 31나노초씩 어긋나. 태풍도 지진도 막아 냈는데… 땅이 끌어당기는 힘이 바뀌는 건 처음이야.'),
    DN('…뉴욕 배터리 공원 조위계 그래프, 저거 이번 달 거예요?',()=>point(false)), G('그래, 다니엘. 이번 달이야.'),
    G('원인은 지구 밖에 있었네.',()=>{ SCREEN.show('jupiter'); point(true); }),
    G('점선이 원래 목성이 돌아야 할 길, 붉은 선이 실제로 관측된 길이야. 한쪽으로 끌려 나가고 있지.'),
    me('목성을 끌어당긴다고요? 그만한 질량이 어디에… 저기엔 아무것도 없는데.'),
    G('보이지 않을 뿐이야. 아마라 박사.',()=>point(false)),
  ]);
  await TALK.say([
    A('네. 목성 근처를 우주 망원경으로 찍은 하늘이에요.',()=>SCREEN.show('wormhole'),1),
    A('보이세요? 별빛이 고리처럼 휘어 있어요. 아주 큰 질량이 지나가는 빛을 휘게 하는 거예요. 그런데 빛을 내지도, 그림자를 만들지도 않아요.',null,1),
    A('고리 안쪽을 보세요. 그 안에 보이는 별들은… 이 근처 하늘의 별이 아니에요. 시공간에 뚫린 구멍. 웜홀이에요.',null,1),
    SJ('안쪽 하늘이 다른 곳이라는 건 어떻게 확신하죠?'),
    A('빛을 무지개처럼 펼쳐 봤어요. 스펙트럼이요.',()=>SCREEN.show('spectrum'),1),
    A('검은 줄 — 흡수선은 원소마다 자리가 정해져 있어요. 별빛의 지문이죠. 그런데 웜홀 안쪽 빛은 모든 흡수선이 같은 비율로 붉은 쪽으로 밀려 있어요.',null,1),
    A('우리에게서 빠르게 멀어지는, 아주 먼 은하의 빛이라는 뜻이에요. 약 4억 3천만 광년. 외부 은하, NGC 3500.',null,1),
    me('그래서 1호를 보낸 거였군요.'),
    A('네. 그다음은… 엘레나가 설명할 거예요.'),
  ]);
  await TALK.say([
    E('하위헌스 1호, 대원 열두 명. 웜홀 너머에서 312일 동안 행성 자료를 보내왔어요. 생명 가능 지대의 행성을 찾는 게 임무였죠.'),
    E('이게 마지막 수신이에요. 틀어 볼게요.',()=>{ SCREEN.show('mayday'); setTimeout(()=>AUDIO.radio(5.5),700); }),
    {who:'하위헌스 1호',ch:'수신 HUY-1',kind:'radio',t:'…치직… Mayday, Mayday, we are— …',fx:()=>toScreen()},
    E('여기서 끊겼어요. 그 뒤로 일곱 달째, 아무것도 없어요.'),
    MY('"we are"… 우리는, 뭐라는 거죠. 다쳤다? 길을 잃었다?'),
    E('모르겠어요. 파형이 그 순간 갑자기 끊겨요. 고장처럼 보이지 않아요.'),
    E('그리고 하나 더 있어요. 목소리 아래, 아주 낮은 소리. 18 헤르츠. 사람 목소리도, 기계 소리도 아니에요.'),
    me('…누가 끊은 것처럼.'),
  ]);
  await TALK.say([
    G('중력 이상은 기다려 주지 않네. 원래는 2호를 보낼 생각이었어. 그런데 2호는 궤도 조립장에서 아직 반도 못 지었네. 열넉 달 뒤에나 뜰 수 있어.'),
    G('그동안 중력 이상은 지금의 다섯 배가 되지. 그때는 늦어.'),
    G('그래서 지금 바로 뜰 수 있는 건 하나뿐이야. 2호에 실으려던 구조정, R-1.',()=>{ SCREEN.show('crew'); point(true); }),
    DN('제가 정비하고 있는 배예요. 한 사람만 타요. 동면 캡슐 하나, 넉 달이면 목성 곁 웜홀까지 가요.',()=>point(false)),
    DN('그런데… 연료 탱크가 작아요. 편도분이에요. 웜홀을 건너면 돌아올 연료가 없어요.'),
    SJ('그럼 돌아올 방법은요?'),
    MY('1호요. 1호는 왕복 연료를 싣고 갔어요. 원자로만 다시 켜면, 1호를 몰고 웜홀을 되짚어 올 수 있어요.'),
    G('크리스. 1호 원자로를 설계한 사람이 자네야. 꺼진 원자로를 혼자 다시 켤 수 있는 사람도 자네뿐이고.'),
    me('…혼자 가서, 1호를 깨우고, 1호를 타고 돌아온다.'),
    G('그래. 그리고 이것도 가져가게. 펄스 권총이야.'),
    me('…구조하러 가는데 총입니까.'),
    G('저 파형 아래의 소리가 뭔지 아무도 모르네. 자네 몸은 자네가 지켜야 해.'),
    E('1호 대원 명단이에요. 생물학자 레아 문 — 마지막까지 자료를 보낸 사람이에요. 살아 있다면… 데려와 주세요.'),
    me('1호를 찾겠습니다. 그 문장의 끝도요.'),
    G('출발은 다음 주, 케네디 39B. 오늘은 여기까지.'),
  ]);
  all.concat(gray).forEach(p=>p.lookAt=null);
  // 회의가 끝나면 다음 주 발사 → 지구 궤도 출발 → 넉 달 뒤 목성 · 웜홀 (scenes/journey.js) → 웜홀 건너편 조종석 (scenes/flight.js)
  S.phase='cut'; P.look=false; goal(''); await fade(true,1400);
  await GAME.journey();
}};
