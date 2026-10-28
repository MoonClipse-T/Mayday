// 소리는 모두 Web Audio 로 그 자리에서 만든다 (파일 없음). 기본은 꺼짐 — 오른쪽 위 [소리] 로 켠다.
let ac = null, on = false, humGain = null;
const ctx = () => (ac ??= new (window.AudioContext || window.webkitAudioContext)());
function noise(sec) {
  const a = ctx(), b = a.createBuffer(1, a.sampleRate * sec, a.sampleRate), d = b.getChannelData(0);
  for (let i = 0; i < d.length; i++) d[i] = Math.random() * 2 - 1;
  const s = a.createBufferSource(); s.buffer = b; return s;
}
export const sfx = {
  unlock() { if (on) ctx().resume(); },
  toggle() {
    on = !on;
    if (on) { ctx().resume(); this.hum(0.4); } else if (humGain) humGain.gain.setTargetAtTime(0, ctx().currentTime, 0.2);
    return on;
  },
  // 우주선 선체의 낮은 울림
  hum(level) {
    if (!on) return;
    const a = ctx();
    if (!humGain) {
      humGain = a.createGain(); humGain.gain.value = 0; humGain.connect(a.destination);
      for (const [f, g] of [[42, 0.5], [63, 0.25], [84.5, 0.12]]) { const o = a.createOscillator(), v = a.createGain(); o.frequency.value = f; v.gain.value = g; o.connect(v).connect(humGain); o.start(); }
    }
    humGain.gain.setTargetAtTime(0.05 * level, a.currentTime, 0.8);
  },
  // 타자기 · 단말기 소리
  tick() {
    if (!on) return;
    const a = ctx(), o = a.createOscillator(), g = a.createGain();
    o.type = 'square'; o.frequency.value = 1800 + Math.random() * 400; g.gain.setValueAtTime(0.012, a.currentTime); g.gain.exponentialRampToValueAtTime(0.0001, a.currentTime + 0.03);
    o.connect(g).connect(a.destination); o.start(); o.stop(a.currentTime + 0.04);
  },
  // 무전 잡음
  static(sec) {
    if (!on) return;
    const a = ctx(), s = noise(sec), f = a.createBiquadFilter(), g = a.createGain();
    f.type = 'bandpass'; f.frequency.value = 1700; f.Q.value = 0.7;
    const t = a.currentTime; g.gain.setValueAtTime(0, t); g.gain.linearRampToValueAtTime(0.14, t + 0.15);
    for (let k = 0.4; k < sec - 0.5; k += 0.35 + Math.random() * 0.4) g.gain.setValueAtTime(0.05 + Math.random() * 0.16, t + k);
    g.gain.linearRampToValueAtTime(0, t + sec);
    s.connect(f).connect(g).connect(a.destination); s.start();
  },
};
