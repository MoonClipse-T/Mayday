/* ============================================================
   프롤로그 · NASA 존슨 우주 센터 브리핑룸 B (2091. 03. 14)
   국장 → 아마라 박사 → 엘레나 → 다시 국장(선장 임명) → 창가 → 우주선(cryo) 으로
   맵 : web/assets/meeting.glb (blender/00_회의실.blend) — SPAWN · SPOT_director/astro/comm/window · IT_screen
   ============================================================ */
'use strict';
SCENES.meeting={title:'프롤로그 · 브리핑룸', async enter(){
  await LEVEL.load('meeting'); await SKY.city(-1.1,.9); renderer.toneMappingExposure=1;
  // 방은 조명이 구워져 있고, 사람만 빛을 받는다
  const hemi=new THREE.HemisphereLight(0xfff6ea,0x2a2a30,1.05); WORLD.add(hemi);
  const key=new THREE.DirectionalLight(0xfff0dc,.9); key.position.set(2,4,2); WORLD.add(key);
  const sp=LEVEL.spots, mk=(kind,at,name,role)=>PEOPLE.spawn({kind,name,role,at});
  const gray=await mk('eric',sp.director,'로버트 그레이','국장'), amara=await mk('carla',sp.astro,'아마라 오코예','천체물리학자'), elena=await mk('claudia',sp.comm,'엘레나 피셔','통신 책임자');
  await SCREEN.mount(LEVEL.items.screen,new THREE.Vector3(0,1.6,0));
  const f=S.flags, me=t=>({kind:'me',t}), G=(t,fx)=>({who:'그레이 국장',t,npc:gray,fx}), A=(t,fx)=>({who:'아마라 박사',t,npc:amara,fx}), E=(t,fx)=>({who:'엘레나',t,npc:elena,fx});

  PEOPLE.talkable(gray,async()=>{
    if(!f.brief1){ f.brief1=true; await TALK.say([
      G('크리스, 와 줬군. 앉을 시간은 없네. 화면을 보게.',()=>SCREEN.show('gravity')),
      G('지구 평균 중력과의 차이야. 5년 전엔 저울이 몇 그램 틀리는 정도였지. 지금은 해마다 네 배씩 커지고 있어.'),
      G('밀물이 방벽을 넘고, 비행기가 고도를 지키지 못하고 있네. 태풍도 지진도 막아 냈는데… 이런 건 처음이야.',()=>SCREEN.show('earth')),
      G('원인은 지구 밖에 있었네. 목성의 공전 궤도가 조금씩 비틀리고 있어.',()=>SCREEN.show('jupiter')),
      me('목성을 움직인다고요? 그만한 질량이 어디에…'),
      G('그걸 찾은 사람이 아마라 박사야. 박사에게 직접 듣게.'),
    ]); goal('아마라 박사에게 목성 곁에서 찾은 것을 듣는다'); return; }
    if(!f.brief3){ await TALK.say([G(f.brief2?'엘레나에게 1호의 마지막 교신도 듣고 오게.':'아마라 박사가 오른쪽에 있네.')]); return; }
    if(!f.captain){ f.captain=true; await TALK.say([
      G('중력 이상은 기다려 주지 않네. NASA는 2차 탐사를 결정했어. 하위헌스 2호.',()=>SCREEN.show('crew')),
      G('크리스. 자네가 선장을 맡아 주게. 대원은 자네를 포함해 열네 명이야.'),
      me('…1호를 찾겠습니다. 그 문장의 끝도요.'),
      G('출발은 다음 달이야. 가기 전에 창밖을 한번 보게. 저 하늘 어딘가에 목성이 있지.'),
    ]); goal('창가로 가서 밤하늘을 본다'); return; }
    await TALK.say([G('창가에 가 보게, 크리스.')]); });

  PEOPLE.talkable(amara,async()=>{
    if(!f.brief1){ await TALK.say([A('국장님 브리핑부터 들으세요. 화면 앞에 계세요.')]); return; }
    if(!f.brief2){ f.brief2=true; await TALK.say([
      A('크리스. 목성 근처를 찍은 하늘이에요. 별빛이 고리처럼 휘어 있죠?',()=>SCREEN.show('wormhole')),
      A('보이지 않는 엄청난 질량이 지나가는 빛을 휘게 하는 거예요. 시공간에 뚫린 구멍 — 웜홀.'),
      A('그 안에서 새어 나온 빛을 무지개처럼 펼쳐 봤어요. 검은 흡수선이 전부 붉은 쪽으로 밀려 있었어요.',()=>SCREEN.show('spectrum')),
      A('아주 먼 곳에서, 우리에게서 멀어지며 온 빛이라는 뜻이죠. 웜홀 건너편은 우리은하가 아니에요. 외부 은하, NGC 3500.'),
      me('그래서 1호를 보낸 거군요.'),
      A('네. 1호의 마지막 교신은… 엘레나에게 들어 보세요. 왼쪽 창가 쪽에 있어요.'),
    ]); goal('엘레나에게 1호의 마지막 교신을 듣는다'); return; }
    await TALK.say([A('흡수선의 위치는 거짓말을 안 해요. 그게 별빛의 지문이거든요.')]); });

  PEOPLE.talkable(elena,async()=>{
    if(!f.brief2){ await TALK.say([E('브리핑이 먼저예요, 선장님.')]); return; }
    if(!f.brief3){ f.brief3=true; await TALK.say([
      E('하위헌스 1호, 대원 열두 명. 웜홀 너머에서 312일 동안 행성 자료를 보내왔어요.'),
      E('이게 마지막 수신이에요. 틀어 볼게요.',()=>{ SCREEN.show('mayday'); setTimeout(()=>AUDIO.radio(5.5),600); }),
      {who:'하위헌스 1호',ch:'수신 HUY-1',kind:'radio',t:'…치직… Mayday, Mayday, we are— …'},
      E('여기서 끊겼어요. 그 뒤로 일곱 달째, 아무것도 없어요.'),
      me('‘we are’ … 그다음은 뭐였을까.'),
    ]); goal('그레이 국장에게 돌아간다'); return; }
    await TALK.say([E('신호가 다시 잡히면 제일 먼저 알려 드릴게요.')]); });

  // 창가 : 가까이 가면 밤하늘을 보고 다음 장면으로
  TICK.push(()=>{ if(!f.captain||f.window||S.busy) return; const w=sp.window; if(Math.hypot(P.x-w.x,P.z-w.z)>1.4) return; f.window=true;
    (async()=>{ P.free=false; goal(''); await lookAt(w.x+Math.sin(w.yaw)*-30,9,w.z+Math.cos(w.yaw)*-30,1.6);
      await TALK.say([me('저 불빛 너머 어딘가에 목성이 있다. 그리고 그 곁에 — 문이 하나 열려 있다.'),me('…돌아올 수 있을까.')]);
      await go('cryo'); })(); });

  warp(LEVEL.spawn.x,LEVEL.spawn.z,LEVEL.spawn.yaw); stamp('NASA JSC · 브리핑룸 B','2091.03.14  21:38');
  AUDIO.hum(.6,60); await fade(false,1200);
  await card('PROLOGUE','2091년 3월 14일','휴스턴 · NASA 존슨 우주 센터');
  S.phase='play'; P.free=true;
  await TALK.say([me('긴급 회의라더니… 국장님이 직접 불렀다.')]);
  goal('화면 앞의 그레이 국장에게 간다');
}};
