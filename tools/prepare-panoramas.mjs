import sharp from 'sharp';
import { mkdir, readFile, writeFile, stat } from 'node:fs/promises';
import { createHash } from 'node:crypto';
import { resolve, join } from 'node:path';

// Re-encode only: originals remain untouched, with no crop or aspect change.
const input = resolve(process.argv[2] || '../世界场景360');
const output = resolve('assets/panoramas');
await mkdir(output, { recursive: true });
const files = {
  home: 'Modern Home Care Room Interior_pano.png',
  ward: 'Modern Hospital Room with Advanced Device_pano.png',
  garden: 'Serene Senior Care Lounge_pano.png',
  salon: 'Inviting Scalp-Care Salon Interior_pano.png',
};
const records = [];
for (const [id, name] of Object.entries(files)) {
  const path = join(input, name), source = await readFile(path);
  const info = await sharp(source).metadata();
  if (info.width !== info.height * 2) throw new Error(`${name}: expected a 2:1 panorama`);
  const variants = [];
  for (const [suffix, width, quality] of [['', info.width, 94], ['-mobile', 2560, 92]]) {
    const file = `${id}${suffix}.webp`;
    await sharp(source).resize({ width, withoutEnlargement: true }).webp({ quality, effort: 6 }).toFile(join(output, file));
    const meta = await sharp(join(output, file)).metadata();
    const bytes = await readFile(join(output, file));
    variants.push({ file, width: meta.width, height: meta.height, bytes: bytes.length, sha256: createHash('sha256').update(bytes).digest('hex') });
  }
  records.push({ id, original: name, originalBytes: (await stat(path)).size, width: info.width, height: info.height, originalSha256: createHash('sha256').update(source).digest('hex'), variants });
}
await writeFile(join(output, 'sources.json'), JSON.stringify({ sourceDirectory: input, projection: 'equirectangular', originalsUnchanged: true, records }, null, 2) + '\n');
console.log(JSON.stringify(records.map(({ id, originalBytes, variants }) => ({ id, originalBytes, variants: variants.map(({ file, bytes, width, height }) => ({ file, bytes, width, height })) })), null, 2));
