// MAYDAY — 프롤로그 + 1장 입구. 장면을 누르면(→ · 스와이프) 글이 타자기처럼 나오고, 다 나오면 다음 장면.
import { wormhole } from './wormhole.js';
import { sfx } from './sfx.js';

const IMG = 'web/img/';
const CREW = [['크리스', '선장', 'cap'], ['마야', '부선장 · 조종'], ['서준', '항법'], ['레아', '통신'], ['엘레나', '의무관'], ['다니엘', '기관'],
  ['아이샤', '생명 과학'], ['토마스', '지질'], ['유키', '대기 과학'], ['파블로', '로봇 공학'], ['노라', '의무 보조'], ['이반', '기관 보조'], ['하은', '데이터 분석'], ['오언', '보안']];

// 중력 그래프: 지구 평균 중력과의 차이 (mGal) — 해마다 약 4배
const G = [[2086, 0.02], [2087, 0.08], [2088, 0.3], [2089, 1.2], [2090, 4.6], [2091, 17]];
const gravitySVG = () => {
  const W = 600, H = 260, x = (y) => 40 + (y - 2086) / 5 * (W - 60), lg = (v) => H - 30 - (Math.log10(v) + 2) / 3.4 * (H - 50);
  const pts = G.map(([y, v]) => `${x(y).toFixed(1)},${lg(v).toFixed(1)}`).join(' ');
  return `<svg viewBox="0 0 ${W} ${H}" aria-label="지구 중력 이상 그래프">
    ${[0.01, 0.1, 1, 10].map((v) => `<line x1="40" x2="${W - 20}" y1="${lg(v)}" y2="${lg(v)}" stroke="rgba(235,231,223,.1)"/><text x="0" y="${lg(v) + 4}" fill="#55524d">${v}</text>`).join('')}
    ${G.map(([y]) => `<text x="${x(y) - 16}" y="${H - 6}" fill="#55524d">${y}</text>`).join('')}
    <polyline class="grow" points="${pts}" fill="none" stroke="#ff4a3d" stroke-width="2.5"/>
    ${G.map(([y, v]) => `<circle cx="${x(y)}" cy="${lg(v)}" r="3.5" fill="#ff4a3d"/>`).join('')}
    <text x="${x(2091) - 70}" y="${lg(17) - 12}" fill="#ebe7df">17 mGal</text></svg>`;
};
// 스펙트럼: 실험실 흡수선 vs 웜홀에서 온 빛 (z = 0.12 → 모두 붉은 쪽으로)
const LINES = [393.4, 396.8, 434.0, 486.1, 517.3, 589.0, 656.3];
const spectrumSVG = () => {
  const W = 600, nm = (l) => 20 + (l - 380) / 340 * (W - 40), z = 0.12;
  const band = (y) => `<rect x="20" y="${y}" width="${W - 40}" height="44" fill="url(#rb)"/>`;
  const marks = (y, k) => LINES.map((l) => `<rect x="${nm(l * k) - 1.5}" y="${y}" width="3" height="44" fill="#050506"/>`).join('');
  return `<svg viewBox="0 0 ${W} 190" class="spec" aria-label="흡수선의 적색 편이">
    <defs><linearGradient id="rb" x1="0" x2="1"><stop offset="0" stop-color="#5b2cc9"/><stop offset=".18" stop-color="#2f5bff"/><stop offset=".36" stop-color="#1fb7d6"/>
      <stop offset=".5" stop-color="#43d15a"/><stop offset=".64" stop-color="#f2e23a"/><stop offset=".8" stop-color="#ff8a1f"/><stop offset="1" stop-color="#c21414"/></linearGradient>
      <clipPath id="cb"><rect x="20" y="104" width="${W - 40}" height="44"/></clipPath></defs>
    <text x="20" y="20" fill="#8f8b84">실험실의 빛 (멈춰 있는 광원)</text>${band(28)}${marks(28, 1)}
    <text x="20" y="96" fill="#8f8b84">웜홀에서 온 빛</text>${band(104)}
    <g clip-path="url(#cb)">${LINES.map((l) => `<rect class="shift" style="--dx:${(nm(l * (1 + z)) - nm(l)).toFixed(1)}px" x="${nm(l) - 1.5}" y="104" width="3" height="44" fill="#050506"/>`).join('')}</g>
    ${[400, 500, 600, 700].map((l) => `<text x="${nm(l) - 14}" y="172" fill="#55524d">${l} nm</text>`).join('')}
    <text x="${W - 150}" y="188" fill="#ff4a3d">→ 붉은 쪽으로 밀림</text></svg>`;
};

const SCENES = [
  { kind: 'title' },
  { kind: 'panel', bg: null, panel: () => `<h4>지구 평균 중력과의 차이 (mGal, 눈금은 10배씩)</h4>${gravitySVG()}`,
    place: '2091년 3월 · 미국 휴스턴, NASA 존슨 우주 센터 — 긴급 회의',
    lines: ['처음엔 작은 오차였다.', '저울이 몇 그램씩 틀리고, 원자시계가 하루에 몇십억분의 1초씩 어긋났다.', '5년 뒤, 그 오차는 숫자가 아니라 재난이 되었다.'] },
  { kind: 'img', img: 'earth.jpg', fit: true, scrim: 'l', credit: '지구 — NASA, 아폴로 17호 (1972, 공공 저작물)',
    place: '브리핑 자료 1 · 지구',
    lines: ['밀물이 해안 방벽을 넘었다. 비행기는 정해진 고도를 지키지 못했다.', '인류는 태풍도, 지진도 견딜 만큼 강해졌지만 —', { t: '땅이 끌어당기는 힘이 바뀌는 일은 처음이었다.', c: 'big' }] },
  { kind: 'img', img: 'jupiter.jpg', fit: true, scrim: 'l', credit: '목성 — NASA, ESA, A. Simon (GSFC) · 허블 우주 망원경 (2014)',
    place: '브리핑 자료 2 · 목성, 지구에서 6억 ~ 9억 km',
    lines: ['원인을 찾던 천문학자들이 마침내 하늘로 눈을 돌렸다.', '목성의 공전 궤도가 조금씩, 그러나 분명히 비틀리고 있었다.', '목성이 끌려가면 지구의 궤도도 흔들린다. 이대로라면 언젠가는 —'] },
  { kind: 'wormhole', credit: '배경 별 — NASA/Goddard SVS, Deep Star Maps 2020 · 웜홀 렌즈 효과는 실시간 계산',
    place: '브리핑 자료 3 · 목성 궤도 근처, 관측 영상 재구성', hint: '화면을 끌어서 둘러보기',
    lines: ['목성 곁에서, 보이지 않는 무언가가 별빛을 휘게 하고 있었다.', { t: '웜홀.', c: 'big' }, '시공간에 뚫린 구멍. 그 막대한 질량이 목성을 끌어당기고 있었다.'] },
  { kind: 'panel', panel: () => `<h4>스펙트럼 비교 — 같은 원소, 다른 위치</h4>${spectrumSVG()}`,
    place: '브리핑 자료 4 · NASA 분광 분석실',
    lines: ['웜홀을 빠져나온 빛을 무지개처럼 펼쳤다.', '검은 흡수선이 모두 붉은 쪽으로 밀려 있었다. 아주 먼 곳에서, 멀어지며 온 빛이라는 뜻이다.', { t: '건너편은 우리은하가 아니었다. 외부 은하, NGC 3500.', c: 'big' }] },
  { kind: 'img', img: 'earthrise.jpg', scrim: '', credit: '지구돋이(Earthrise) — NASA/Bill Anders, 아폴로 8호 (1968, 공공 저작물)',
    place: '2089년 · 하위헌스 1호 출발',
    lines: ['NASA는 웜홀을 재앙이 아니라 출구로 보기로 했다.', '최초의 외부 은하 탐사선, 하위헌스 1호. 대원 12명.', '임무는 건너편 은하에서 골디락스 존 — 생명 가능 지대의 행성을 찾는 것.', '웜홀을 지나는 전파 통신은 살아 있었다. 1호는 312일 동안 행성 자료를 보내왔다.'] },
  { kind: 'mayday', place: '2090년 11월 2일 · 수신 기록 HUY-1 · 312일째' },
  { kind: 'panel', panel: () => `<h4>하위헌스 2호 승무원 명단 · 14명</h4><ol class="manifest">${CREW.map(([n, r, c], i) => `<li class="${c || ''}" style="transition-delay:${0.2 + i * 0.08}s"><b>${n}</b><span>${r}</span></li>`).join('')}</ol>`,
    place: '2091년 3월 · 다시, 긴급 회의실',
    lines: ['중력 이상은 해마다 네 배씩 커지고 있었다.', 'NASA는 2차 탐사를 결정했다. 하위헌스 2호.', '선장은 NASA 수석 연구원, 크리스.', { t: '1호를 찾아, 그 문장의 끝을 들어라.', c: 'big' }] },
  { kind: 'cryo', img: 'cryo_main.jpg', credit: '공간 — Sci-fi corridor by 3dhdscan · Stasis / Clone Chamber by TampaJoey (Sketchfab, CC BY 4.0)',
    place: '1장 · 깨어남 — 하위헌스 2호, 동면 구역 C · 출발 214일째',
    lines: ['동면 해제. 목성 궤도 도착까지 3시간.', '일정대로라면 지금 깨어 있어야 할 사람은 선장 한 명뿐이다.', { t: '그런데 —', c: 'big' }] },
  { kind: 'img', img: 'cryo_pod.jpg', credit: '공간 — Sci-fi corridor by 3dhdscan · Stasis / Clone Chamber by TampaJoey (Sketchfab, CC BY 4.0)',
    place: '동면 캡슐 C-07',
    lines: ['통신 담당 레아의 캡슐. 비어 있다.', '해동 기록도 없다.', { t: 'VEGA › 좋은 아침입니다, 선장님. 모든 대원이 정상적으로 동면 중입니다.', c: 'ai' }] },
  { kind: 'end' },
];

// 동면실 사진(1600×900) 속 C-07 캡슐 위치 — 화면 비율이 달라도(object-fit: cover) 같은 곳을 가리키게 계산
const HOT = { x: 0.295, y: 0.43, w: 1600, h: 900, pos: 0.25 };
function placeHot() {
  const b = document.querySelector('.hot'); if (!b) return;
  const W = innerWidth, H = innerHeight, k = Math.max(W / HOT.w, H / HOT.h);
  b.style.left = `${(W - HOT.w * k) * HOT.pos + HOT.x * HOT.w * k}px`; b.style.top = `${(H - HOT.h * k) / 2 + HOT.y * HOT.h * k}px`;
}
addEventListener('resize', placeHot);
const stage = document.getElementById('stage'), nowEl = document.getElementById('now'), credit = document.getElementById('credit'), muteBtn = document.getElementById('mute');
document.getElementById('all').textContent = String(SCENES.length - 1).padStart(2, '0');
const esc = (s) => s.replace(/[&<>]/g, (c) => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;' }[c]));

function build(s) {
  const el = document.createElement('section'); el.className = 'scene' + (s.fit ? ' fit' : '');
  const copy = s.lines ? `<div class="copy"><p class="place">${s.place}</p>${s.lines.map((l) => `<p class="line ${typeof l === 'string' ? '' : l.c}"></p>`).join('')}</div><p class="tap">눌러서 계속</p>` : '';
  if (s.kind === 'title') el.innerHTML = `<div class="bg"><img src="${IMG}sky.jpg" alt="" class="kb" style="opacity:.45"></div><div class="scrim l"></div>
    <div class="title" style="position:absolute;inset:0"><p class="meta">별과 우주 · 방탈출</p><h1>MAY<span>DAY</span></h1>
    <p class="sub">목성 곁의 웜홀 너머로 떠난 탐사선이 마지막으로 보낸 한 마디.<br>그 문장의 끝을 찾아야 한다.</p><button class="start">시작하기</button></div>`;
  else if (s.kind === 'img') el.innerHTML = `<div class="bg${s.fit ? ' fit' : ''}"><img src="${IMG}${s.img}" alt="" class="kb"></div><div class="scrim ${s.scrim ?? ''}"></div>${copy}`;
  else if (s.kind === 'cryo') el.innerHTML = `<div class="bg"><img src="${IMG}${s.img}" alt="" style="object-position:${HOT.pos * 100}% 50%"></div><div class="scrim"></div>${copy}<button class="hot" aria-label="비어 있는 캡슐 보기"></button>`;
  else if (s.kind === 'panel') el.innerHTML = `<div class="bg" style="background:radial-gradient(120% 90% at 80% 10%,#121216 0%,#050506 60%)"></div><div class="panel">${s.panel()}</div>${copy}`;
  else if (s.kind === 'wormhole') el.innerHTML = `<div class="bg"><canvas class="full"></canvas></div><div class="scrim"></div><p class="hint">${s.hint}</p>${copy}`;
  else if (s.kind === 'mayday') el.innerHTML = `<div class="bg"><canvas class="full wave"></canvas></div><div class="tx"><p class="place">${s.place}</p>
    <p class="log"></p><p class="mayday"></p><p class="cut">— 신호 끊김 —</p></div><p class="tap">눌러서 계속</p>`;
  else if (s.kind === 'end') el.innerHTML = `<div class="bg"><img src="${IMG}cryo_back.jpg" alt="" class="kb" style="opacity:.5"></div><div class="scrim"></div>
    <div class="copy"><p class="place">제작 중</p><p class="line big">1장 · 깨어남</p>
    <p class="line" style="min-height:0">다음 업데이트에서는 이 동면실을 직접 걸어 다니며 단서를 찾고, 별까지의 거리를 재서 항법을 되살립니다.</p>
    <button class="start again">처음부터 다시</button></div>`;
  stage.append(el); return el;
}
const els = SCENES.map(build);
placeHot();

let cur = -1, typing = null, wh = null;
function type(el, s) {
  const ps = [...el.querySelectorAll('.copy .line')].filter((p) => !p.textContent);
  const texts = s.lines.map((l) => (typeof l === 'string' ? l : l.t));
  let li = 0, ci = 0, stop = false;
  const caret = '<span class="caret"></span>';
  const step = () => {
    if (stop) return;
    if (li >= texts.length) { el.classList.add('done'); typing = null; return; }
    ci++; ps[li].innerHTML = esc(texts[li].slice(0, ci)) + caret;
    if (ci % 3 === 0) sfx.tick();
    if (ci >= texts[li].length) { ps[li].innerHTML = esc(texts[li]); li++; ci = 0; typing.t = setTimeout(step, 520); return; }
    typing.t = setTimeout(step, 34);
  };
  typing = { t: setTimeout(step, 700), finish() { stop = true; clearTimeout(this.t); ps.forEach((p, i) => (p.innerHTML = esc(texts[i]))); el.classList.add('done'); typing = null; } };
}
function mayday(el) {
  const log = el.querySelector('.log'), big = el.querySelector('.mayday'), cut = el.querySelector('.cut');
  const L = ['> HUY-1 → JSC  행성 자료 전송 #4471 … 완료', '> 대상: NGC 3500-c4  ·  골디락스 존 안쪽  ·  표면 온도 추정 288 K', '> 음성 채널 열림'];
  const M = 'MAYDAY, MAYDAY,\nWE ARE—';
  let i = 0, j = 0, stop = false; log.textContent = ''; big.textContent = ''; cut.classList.remove('on');
  const wave = el.querySelector('canvas.wave'), ctx = wave.getContext('2d'); let amp = 0.15, raf;
  const draw = () => {
    const w = (wave.width = wave.clientWidth * devicePixelRatio), h = (wave.height = wave.clientHeight * devicePixelRatio);
    ctx.clearRect(0, 0, w, h); ctx.strokeStyle = 'rgba(255,74,61,.35)'; ctx.lineWidth = 1.5 * devicePixelRatio; ctx.beginPath();
    for (let x = 0; x < w; x += 3) { const y = h * 0.78 + (Math.random() - 0.5) * h * amp * (0.4 + Math.sin(x * 0.01 + performance.now() * 0.004) ** 2); x ? ctx.lineTo(x, y) : ctx.moveTo(x, y); }
    ctx.stroke(); raf = requestAnimationFrame(draw);
  };
  draw();
  const step = () => {
    if (stop) return;
    if (i < L.length) { log.textContent += L[i++] + '\n'; sfx.tick(); typing.t = setTimeout(step, 650); return; }
    if (j === 0) { sfx.static(5.5); amp = 0.5; }
    if (j < M.length) { big.textContent = M.slice(0, ++j); typing.t = setTimeout(step, M[j - 1] === ',' ? 380 : 95); return; }
    big.classList.add('glitch'); amp = 0.03; cut.classList.add('on'); el.classList.add('done'); typing = null;
  };
  typing = { t: setTimeout(step, 600), finish() { stop = true; clearTimeout(this.t); log.textContent = L.join('\n') + '\n'; big.textContent = M; amp = 0.03; cut.classList.add('on'); el.classList.add('done'); typing = null; } };
  return () => cancelAnimationFrame(raf);
}

let leave = null;
function go(n) {
  if (n < 0 || n >= SCENES.length || n === cur) return;
  typing?.finish(); leave?.(); leave = null;
  els[cur]?.classList.remove('on');
  cur = n; const s = SCENES[n], el = els[n];
  el.classList.remove('done'); el.querySelectorAll('.copy .line').forEach((p) => { if (s.lines) p.textContent = ''; });
  void el.offsetWidth; el.classList.add('on');
  document.body.classList.toggle('at-title', s.kind === 'title');
  nowEl.textContent = String(Math.max(n, 1)).padStart(2, '0'); credit.textContent = s.credit || '';
  sfx.hum(s.kind === 'cryo' || (s.img || '').startsWith('cryo') ? 1 : 0.4);
  if (s.lines) type(el, s);
  if (s.kind === 'mayday') leave = mayday(el);
  if (s.kind === 'wormhole') { wh ??= wormhole(el.querySelector('canvas'), IMG); wh.start(); leave = () => wh.stop(); }
  if (s.kind === 'title' || s.kind === 'end') el.classList.add('done');
  try { history.replaceState(null, '', n ? `#${n}` : location.pathname); } catch {}
}
const next = () => {
  const s = SCENES[cur];
  if (typing) { typing.finish(); return; }
  if (s.kind === 'title') return;
  go(cur + 1);
};

stage.addEventListener('click', (e) => {
  if (e.target.closest('.start')) { sfx.unlock(); go(e.target.closest('.again') ? 1 : 1); return; }
  if (e.target.closest('.hot')) { go(cur + 1); return; }
  if (SCENES[cur].kind === 'wormhole' && wh?.dragged()) return;
  next();
});
document.getElementById('next').addEventListener('click', next);
document.getElementById('prev').addEventListener('click', () => go(Math.max(1, cur - 1)));
muteBtn.addEventListener('click', () => { const on = sfx.toggle(); muteBtn.classList.toggle('on', on); muteBtn.textContent = on ? '소리 켬' : '소리 끔'; muteBtn.setAttribute('aria-label', on ? '소리 끄기' : '소리 켜기'); });
addEventListener('keydown', (e) => {
  if (['ArrowRight', ' ', 'Enter', 'PageDown'].includes(e.key)) { e.preventDefault(); SCENES[cur].kind === 'title' ? (sfx.unlock(), go(1)) : next(); }
  if (['ArrowLeft', 'PageUp'].includes(e.key)) go(Math.max(1, cur - 1));
});
// 스와이프 (웜홀 장면은 끌기가 둘러보기라 제외)
let sx = null;
stage.addEventListener('pointerdown', (e) => { sx = e.clientX; });
stage.addEventListener('pointerup', (e) => {
  if (sx == null || SCENES[cur].kind === 'wormhole') return;
  const dx = e.clientX - sx; sx = null;
  if (dx > 70) go(Math.max(1, cur - 1));
});
addEventListener('hashchange', () => { const n = parseInt(location.hash.slice(1), 10); if (n > 0 && n < SCENES.length) go(n); });
const start = parseInt(location.hash.slice(1), 10);
go(start > 0 && start < SCENES.length ? start : 0);
