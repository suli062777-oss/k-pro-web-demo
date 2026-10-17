import { build } from 'esbuild';
import { mkdir, copyFile } from 'node:fs/promises';
await build({
  entryPoints: { 'anatomy-engine': 'src/anatomy/pod/main.tsx', 'world-engine': 'src/world-renderer.js', 'islands-engine': 'src/island-renderer.js', 'spaces-engine': 'src/space-renderer.js', 'panorama-engine': 'src/panorama-renderer.js' },
  outdir: 'assets', chunkNames: 'viewer-chunks/[name]-[hash]',
  bundle: true, splitting: true, format: 'esm', minify: true,
  sourcemap: false, legalComments: 'linked', target: ['es2022'],
  define: { 'process.env.NODE_ENV': '"production"' },
});
await mkdir('assets/draco', { recursive: true });
for (const file of ['draco_decoder.wasm', 'draco_wasm_wrapper.js']) await copyFile('node_modules/three/examples/jsm/libs/draco/gltf/' + file, 'assets/draco/' + file);
await copyFile('node_modules/three/LICENSE', 'assets/licenses/three-MIT.txt');
await copyFile('node_modules/draco3dgltf/README.md', 'assets/draco/README.md');
console.log('World, island, panorama and legacy space renderers built with shared Three.js chunks.');
