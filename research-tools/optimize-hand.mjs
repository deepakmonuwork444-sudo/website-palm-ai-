// Optimise the hero hand GLB: weld, simplify, center, quantize (KHR_mesh_quantization needs no decoder, so the home CSP stays strict).
// Usage: node optimize-hand.mjs <in.glb> <out.glb> [targetTriangles]
import { NodeIO, Accessor } from '@gltf-transform/core';
import { ALL_EXTENSIONS } from '@gltf-transform/extensions';
import { dedup, weld, simplify, center, quantize, prune, normals, compactPrimitive } from '@gltf-transform/functions';
import { MeshoptSimplifier } from 'meshoptimizer';

const [input, output, target = '48000'] = process.argv.slice(2);
const io = new NodeIO().registerExtensions(ALL_EXTENSIONS);
const doc = await io.read(input);
const count = () => doc.getRoot().listMeshes().flatMap((m) => m.listPrimitives()).reduce((n, p) => n + (p.getIndices()?.getCount() ?? p.getAttribute('POSITION').getCount()) / 3, 0);
const before = count();
await MeshoptSimplifier.ready;
for (const mesh of doc.getRoot().listMeshes()) for (const prim of mesh.listPrimitives()) for (const sem of prim.listSemantics()) if (sem !== 'POSITION') prim.setAttribute(sem, null);
await doc.transform(dedup(), weld());
console.log('verts', doc.getRoot().listMeshes()[0].listPrimitives()[0].getAttribute('POSITION').getCount());
const ratio = Math.min(1, Number(target) / count());
await doc.transform(simplify({ simplifier: MeshoptSimplifier, ratio, error: 0.002 }));
for (const mesh of doc.getRoot().listMeshes()) for (const prim of mesh.listPrimitives()) for (const sem of prim.listSemantics()) if (sem !== 'POSITION' && sem !== 'NORMAL') prim.setAttribute(sem, null);
for (const tex of doc.getRoot().listTextures()) tex.dispose();
for (const mesh of doc.getRoot().listMeshes()) for (const prim of mesh.listPrimitives()) compactPrimitive(prim);
// Smooth, area-weighted vertex normals on the welded mesh (gltf-transform normals() unwelds).
for (const mesh of doc.getRoot().listMeshes()) for (const prim of mesh.listPrimitives()) {
  const pos = prim.getAttribute('POSITION').getArray(); const idx = prim.getIndices().getArray(); const n = new Float32Array(pos.length);
  for (let i = 0; i < idx.length; i += 3) {
    const [a, b, c] = [idx[i] * 3, idx[i + 1] * 3, idx[i + 2] * 3];
    const ux = pos[b] - pos[a], uy = pos[b + 1] - pos[a + 1], uz = pos[b + 2] - pos[a + 2];
    const vx = pos[c] - pos[a], vy = pos[c + 1] - pos[a + 1], vz = pos[c + 2] - pos[a + 2];
    const nx = uy * vz - uz * vy, ny = uz * vx - ux * vz, nz = ux * vy - uy * vx;
    for (const k of [a, b, c]) { n[k] += nx; n[k + 1] += ny; n[k + 2] += nz; }
  }
  for (let i = 0; i < n.length; i += 3) { const l = Math.hypot(n[i], n[i + 1], n[i + 2]) || 1; n[i] /= l; n[i + 1] /= l; n[i + 2] /= l; }
  prim.setAttribute('NORMAL', doc.createAccessor().setType('VEC3').setArray(n).setBuffer(doc.getRoot().listBuffers()[0]));
}
await doc.transform(center({ pivot: 'center' }), quantize({ quantizePosition: 14, quantizeNormal: 8 }), prune());
await io.write(output, doc);
console.log(`triangles ${before} -> ${count()}`);
