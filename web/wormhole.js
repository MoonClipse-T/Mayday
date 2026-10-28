// 웜홀: 실제 별지도(sky.jpg)를 중력 렌즈처럼 휘게 하고, 목 안쪽에는 건너편 하늘(gal.jpg)을 보여 준다.
// 화면의 각 점마다 시선 방향 d 와 웜홀 방향 c 사이의 각 θ 를 구해서
//   θ < R : 목 안 — 건너편 하늘을 어안처럼 (가운데 = 정면, 테두리 = 뒤쪽)
//   θ ≥ R : 바깥 — 빛이 웜홀 쪽으로 α = R²/θ 만큼 꺾여 들어온 방향의 별을 그린다 (아인슈타인 고리)
import * as THREE from './three.module.min.js';

const FRAG = `
precision highp float;
uniform sampler2D sky, gal; uniform vec2 res; uniform float t, R, fov, yaw, pitch;
varying vec2 vUv;
const float PI = 3.14159265;
vec3 eq(sampler2D tx, vec3 d){ vec2 uv = vec2(atan(d.x, -d.z) / (2.0*PI) + 0.5, asin(clamp(d.y,-1.0,1.0)) / PI + 0.5); return texture2D(tx, uv).rgb; }
mat3 rotY(float a){ float c=cos(a), s=sin(a); return mat3(c,0.,-s, 0.,1.,0., s,0.,c); }
mat3 rotX(float a){ float c=cos(a), s=sin(a); return mat3(1.,0.,0., 0.,c,s, 0.,-s,c); }
void main(){
  vec2 p = (vUv - 0.5) * vec2(res.x/res.y, 1.0) * 2.0 * tan(fov*0.5);
  vec3 d = normalize(rotY(yaw) * rotX(pitch) * vec3(p, -1.0));
  vec3 c = vec3(0.0, 0.0, -1.0);
  float th = acos(clamp(dot(d, c), -1.0, 1.0));
  vec3 q = d - c * dot(d, c); q = length(q) > 1e-5 ? normalize(q) : vec3(1.0, 0.0, 0.0);
  vec3 col;
  if (th < R) {
    float u = th / R, ph = u * PI;                       // 목 안: 0 ~ 180°
    vec3 d2 = rotY(t * 0.02) * normalize(c * cos(ph) + q * sin(ph));
    col = eq(gal, d2) * vec3(1.15, 1.0, 0.9) * 1.5;
    col *= smoothstep(1.0, 0.86, u) * 0.85 + 0.15;           // 테두리로 갈수록 어둡게
  } else {
    float a = R * R / th;                                 // 꺾이는 각
    float ps = th - a;                                    // 음수면 반대편 상 (거울상)
    vec3 ds = normalize(c * cos(ps) + q * sin(ps));
    col = eq(sky, ds) * 1.35;
    float ring = exp(-pow((th - R) / (R * 0.035), 2.0));   // 아인슈타인 고리
    col += vec3(1.0, 0.92, 0.82) * ring * 0.55;
    col *= 1.0 + 0.6 * exp(-(th - R) / (R * 0.5));
  }
  float vig = smoothstep(1.4, 0.3, length(vUv - 0.5) * 1.6);
  gl_FragColor = vec4(col * vig, 1.0);
}`;

export function wormhole(canvas, base) {
  const r = new THREE.WebGLRenderer({ canvas, antialias: false });
  r.setPixelRatio(Math.min(devicePixelRatio, 1.5));
  const cam = new THREE.OrthographicCamera(-1, 1, 1, -1, 0, 1), scene = new THREE.Scene();
  const ld = new THREE.TextureLoader(), tex = (f) => { const x = ld.load(base + f); x.colorSpace = THREE.SRGBColorSpace; x.minFilter = THREE.LinearFilter; x.generateMipmaps = false; return x; };
  const U = { sky: { value: tex('sky.jpg') }, gal: { value: tex('gal.jpg') }, res: { value: new THREE.Vector2(1, 1) }, t: { value: 0 }, R: { value: 0.2 }, fov: { value: 1.1 }, yaw: { value: 0.35 }, pitch: { value: 0.05 } };
  scene.add(new THREE.Mesh(new THREE.PlaneGeometry(2, 2), new THREE.ShaderMaterial({ uniforms: U, fragmentShader: FRAG,
    vertexShader: 'varying vec2 vUv; void main(){ vUv = uv; gl_Position = vec4(position.xy, 0.0, 1.0); }' })));
  const REST = [0.42, -0.2];   // 웜홀이 화면 오른쪽 위에 오도록 (글과 겹치지 않게)
  let raf = 0, t0 = 0, yaw = REST[0] - 0.3, pitch = REST[1], drag = null, moved = 0;
  const size = () => { const w = canvas.clientWidth, h = canvas.clientHeight; r.setSize(w, h, false); U.res.value.set(w, h); };
  const loop = (now) => {
    const t = (now - t0) / 1000; U.t.value = t;
    U.R.value = 0.18 + 0.1 * Math.min(t / 14, 1);          // 천천히 다가간다
    if (!drag) { yaw += (REST[0] - yaw) * 0.004; pitch += (REST[1] - pitch) * 0.004; }   // 손을 떼면 제자리로
    U.yaw.value = yaw; U.pitch.value = pitch;
    r.render(scene, cam); raf = requestAnimationFrame(loop);
  };
  canvas.addEventListener('pointerdown', (e) => { drag = { x: e.clientX, y: e.clientY, yaw, pitch }; moved = 0; canvas.setPointerCapture(e.pointerId); });
  canvas.addEventListener('pointermove', (e) => {
    if (!drag) return;
    const k = 2.4 / canvas.clientHeight, dx = e.clientX - drag.x, dy = e.clientY - drag.y; moved = Math.max(moved, Math.hypot(dx, dy));
    yaw = drag.yaw + dx * k; pitch = Math.max(-1.2, Math.min(1.2, drag.pitch + dy * k));
  });
  const up = () => { drag = null; };
  canvas.addEventListener('pointerup', up); canvas.addEventListener('pointercancel', up);
  addEventListener('resize', size);
  return {
    start() { size(); t0 = performance.now(); cancelAnimationFrame(raf); raf = requestAnimationFrame(loop); },
    stop() { cancelAnimationFrame(raf); },
    dragged() { const m = moved > 8; moved = 0; return m; },
  };
}
