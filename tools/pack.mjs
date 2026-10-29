// 웹용 GLB 줄이기 : node tools/pack.mjs <원본.glb> <결과.glb> [--full | --tex]
//   --full (방 · 컷신) : 모양 줄이기(simplify) + 그림 WebP 1024 + meshopt 압축
//   --tex  (사람 · 뼈대 있는 것) : 그림만 WebP 1024
// 필요 : npm i @gltf-transform/core@4 @gltf-transform/functions@4 @gltf-transform/extensions@4 meshoptimizer sharp
import { NodeIO } from '@gltf-transform/core';
import { ALL_EXTENSIONS } from '@gltf-transform/extensions';
import { dedup, prune, simplify, weld, textureCompress, meshopt } from '@gltf-transform/functions';
import { MeshoptEncoder, MeshoptDecoder, MeshoptSimplifier } from 'meshoptimizer';
import sharp from 'sharp';

const [src, out, mode = '--full'] = process.argv.slice(2);
await MeshoptEncoder.ready; await MeshoptDecoder.ready;
const io = new NodeIO().registerExtensions(ALL_EXTENSIONS).registerDependencies({ 'meshopt.encoder': MeshoptEncoder, 'meshopt.decoder': MeshoptDecoder });
const doc = await io.read(src);
const steps = [dedup(), prune({ keepLeaves: true, keepAttributes: true, keepExtras: true })];   // 빈 물체(SPAWN · SPOT_ · LIGHT_)는 남긴다
if (mode === '--full') steps.push(weld(), simplify({ simplifier: MeshoptSimplifier, ratio: +(process.env.RATIO||.5), error: +(process.env.ERR||.0008) }));
steps.push(textureCompress({ encoder: sharp, targetFormat: 'webp', resize: [1024, 1024], quality: 80 }));
if (mode === '--full') steps.push(meshopt({ encoder: MeshoptEncoder, level: 'medium' }));
await doc.transform(...steps);
await io.write(out, doc);
