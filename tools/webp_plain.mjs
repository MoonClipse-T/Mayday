// Blender 가 WebP 그림으로 내보낸 GLB 를 three r128 이 읽게 고친다 : node tools/webp_plain.mjs <파일.glb>
//   Blender : texture.extensions.EXT_texture_webp.source (source 없음) → r128 GLTFLoader 는 source 를 찾다 멈춘다
//   → source 를 바로 적고 확장을 뺀다 (브라우저는 image/webp 를 그대로 푼다) · 그림 UV 번호(texCoord)가 1 이면 0 으로 (r128 은 map 에 UV 1 을 못 쓴다)
import fs from 'fs';
const f = process.argv[2], b = fs.readFileSync(f), jl = b.readUInt32LE(12), j = JSON.parse(b.subarray(20, 20 + jl).toString());
let n = 0, uv = 0;
for (const t of j.textures || []) { const e = t.extensions && t.extensions.EXT_texture_webp; if (e) { t.source = e.source; delete t.extensions.EXT_texture_webp; if (!Object.keys(t.extensions).length) delete t.extensions; n++; } }
// 그림이 비어 내보내진 것(Blender 'Image data is empty') : 재질에서 그 그림 자리를 지운다 (색만 남는다)
const empty = new Set((j.textures || []).map((t, i) => t.source === undefined ? i : -1).filter(i => i >= 0)); let cut = 0;
const fix = o => { if (!o || typeof o !== 'object') return; for (const k in o) { const v = o[k]; if (v && typeof v === 'object') { if ('index' in v && empty.has(v.index)) { delete o[k]; cut++; continue; } if ('index' in v && v.texCoord === 1) { v.texCoord = 0; uv++; } fix(v); } } };
(j.materials || []).forEach(fix);
['extensionsUsed', 'extensionsRequired'].forEach(k => { if (j[k]) { j[k] = j[k].filter(x => x !== 'EXT_texture_webp'); if (!j[k].length) delete j[k]; } });
let js = Buffer.from(JSON.stringify(j)); const pad = (4 - js.length % 4) % 4; js = Buffer.concat([js, Buffer.alloc(pad, 0x20)]);
const rest = b.subarray(20 + jl), out = Buffer.alloc(12 + 8 + js.length + rest.length);
b.copy(out, 0, 0, 12); out.writeUInt32LE(out.length, 8); out.writeUInt32LE(js.length, 12); out.writeUInt32LE(0x4E4F534A, 16); js.copy(out, 20); rest.copy(out, 20 + js.length);
fs.writeFileSync(f, out); console.log(f, 'webp', n, 'uv1→0', uv, 'empty cut', cut, out.length);
