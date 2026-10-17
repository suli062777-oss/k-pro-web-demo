import { NodeIO } from '@gltf-transform/core';
import { ALL_EXTENSIONS } from '@gltf-transform/extensions';
import { dedup, weld, simplify, textureCompress, prune, draco, getBounds } from '@gltf-transform/functions';
import { MeshoptSimplifier } from 'meshoptimizer';
import draco3d from 'draco3dgltf';
import sharp from 'sharp';
import { mkdir, stat, writeFile } from 'node:fs/promises';
import { fileURLToPath } from 'node:url';

const root = fileURLToPath(new URL('../', import.meta.url));
const spaces = process.argv.includes('--spaces');
const assetDir = spaces ? 'spaces' : 'islands';
const io = new NodeIO().registerExtensions(ALL_EXTENSIONS).registerDependencies({
  'draco3d.decoder': await draco3d.createDecoderModule(),
  'draco3d.encoder': await draco3d.createEncoderModule()
});
await MeshoptSimplifier.ready;
await mkdir(root + 'assets/' + assetDir, { recursive: true });
function metrics(doc) {
  return {
    triangles: doc.getRoot().listMeshes().flatMap(m => m.listPrimitives()).reduce((n, p) => n + (p.getIndices()?.getCount() ?? p.getAttribute('POSITION').getCount()) / 3, 0),
    materials: doc.getRoot().listMaterials().length,
    textures: doc.getRoot().listTextures().length,
    bounds: getBounds(doc.getRoot().listScenes()[0])
  };
}
const report = [];
for (const name of ['home', 'ward', 'garden', 'salon']) {
  const source = root + (spaces ? `tools/space-originals/${name}.glb` : `tools/island-originals/${name}-main.glb`);
  const output = root + `assets/${assetDir}/${name}.glb`;
  const doc = await io.read(source);
  const before = { ...metrics(doc), bytes: (await stat(source)).size };
  await doc.transform(
    dedup(), weld(),
    simplify({ simplifier: MeshoptSimplifier, ratio: 0.18, error: 0.001 }),
    textureCompress({ encoder: sharp, targetFormat: 'webp', resize: [1024, 1024], quality: 85 }),
    prune(), draco({ method: 'edgebreaker', quantizePosition: 14, quantizeTexcoord: 12 })
  );
  await io.write(output, doc);
  const after = { ...metrics(doc), bytes: (await stat(output)).size };
  report.push({ name, before, after });
  console.log(name, JSON.stringify({ before: before.triangles, after: after.triangles, bytes: after.bytes }));
}
await writeFile(root + `assets/${assetDir}/optimization.json`, JSON.stringify(report, null, 2) + '\n');
