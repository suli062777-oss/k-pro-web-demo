import sharp from 'sharp';
import { readFile, writeFile, mkdir } from 'node:fs/promises';
import { createHash } from 'node:crypto';
import { resolve } from 'node:path';
import vm from 'node:vm';
import { createView, direction } from '../panorama-state.mjs';

// Render rectilinear views of the existing panoramas, not a flat panorama crop.
// Camera axes match src/panorama-renderer.js; source images are never modified.
const root = resolve(import.meta.dirname, '..');
const context = { window: {} };
vm.runInNewContext(await readFile(resolve(root, 'content.js'), 'utf8'), context);
const config = context.window.KPRO_CONTENT.spaces;
const size = 1200;
const records = [];
await mkdir(resolve(root, 'assets/panoramas/covers'), { recursive: true });

for (const [id, spec] of Object.entries(config.scenes)) {
  const source = await readFile(resolve(root, spec.src));
  const { data, info } = await sharp(source).removeAlpha().toColourspace('srgb').raw().toBuffer({ resolveWithObject: true });
  if (info.width !== info.height * 2 || info.channels !== 3) throw new Error(`${id}: expected a 2:1 RGB panorama`);
  const view = createView({ ...config.camera, ...spec.camera });
  const yaw = view.yaw * Math.PI / 180, pitch = view.pitch * Math.PI / 180;
  const forward = direction(view);
  const right = [Math.sin(yaw), 0, -Math.cos(yaw)];
  const up = [Math.sin(pitch) * Math.cos(yaw), Math.cos(pitch), Math.sin(pitch) * Math.sin(yaw)];
  const extent = Math.tan(view.fov * Math.PI / 360);
  const pixels = Buffer.alloc(size * size * 3);
  const wrap = x => (x % info.width + info.width) % info.width;
  const clampY = y => Math.min(info.height - 1, Math.max(0, y));
  for (let y = 0; y < size; y++) {
    const sy = (1 - 2 * (y + .5) / size) * extent;
    for (let x = 0; x < size; x++) {
      const sx = (2 * (x + .5) / size - 1) * extent;
      const dx = forward[0] + right[0] * sx + up[0] * sy;
      const dy = forward[1] + up[1] * sy;
      const dz = forward[2] + right[2] * sx + up[2] * sy;
      const length = Math.hypot(dx, dy, dz);
      const u = ((Math.atan2(dz, dx) / (2 * Math.PI) + 1) % 1) * info.width - .5;
      const v = (.5 - Math.asin(dy / length) / Math.PI) * info.height - .5;
      const x0 = Math.floor(u), y0 = Math.floor(v), fx = u - x0, fy = v - y0;
      const a = (clampY(y0) * info.width + wrap(x0)) * 3;
      const b = (clampY(y0) * info.width + wrap(x0 + 1)) * 3;
      const c = (clampY(y0 + 1) * info.width + wrap(x0)) * 3;
      const d = (clampY(y0 + 1) * info.width + wrap(x0 + 1)) * 3;
      const offset = (y * size + x) * 3;
      for (let channel = 0; channel < 3; channel++) {
        pixels[offset + channel] = Math.round((data[a + channel] * (1 - fx) + data[b + channel] * fx) * (1 - fy) + (data[c + channel] * (1 - fx) + data[d + channel] * fx) * fy);
      }
    }
  }
  const file = `assets/panoramas/covers/${id}.webp`;
  const result = await sharp(pixels, { raw: { width: size, height: size, channels: 3 } }).webp({ quality: 92, effort: 6 }).toBuffer();
  await writeFile(resolve(root, file), result);
  records.push({ id, source: spec.src, sourceSha256: createHash('sha256').update(source).digest('hex'), file, width: size, height: size, camera: { yaw: view.yaw, pitch: view.pitch, fov: view.fov }, bytes: result.length, sha256: createHash('sha256').update(result).digest('hex') });
}
await writeFile(resolve(root, 'assets/panoramas/covers/sources.json'), JSON.stringify({ projection: 'rectilinear perspective from the actual 360 panorama', records }, null, 2) + '\n');
console.log(JSON.stringify(records.map(({ id, file, bytes }) => ({ id, file, bytes })), null, 2));
