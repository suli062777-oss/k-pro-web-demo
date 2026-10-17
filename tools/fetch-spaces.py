"""Extract only the authored indoor GLBs from the pinned source pages."""
import base64, hashlib, json, re, struct, subprocess
from pathlib import Path

root = Path(__file__).resolve().parent.parent
commit = json.loads((root / 'assets/islands/sources.json').read_text())['commit']
originals = root / 'tools/space-originals'
originals.mkdir(exist_ok=True)
out = root / 'assets/spaces'
out.mkdir(exist_ok=True)
records = []
for key in ['home', 'ward', 'garden', 'salon']:
    url = f'https://raw.githubusercontent.com/lzllzllzllzllzl/V3-Halowash-little-worlds/{commit}/scene-{key}.html'
    page = subprocess.check_output(['curl', '--fail', '--location', '--silent', '--show-error', '--retry', '3', '--retry-all-errors', '--retry-delay', '1', url])
    html = page.decode('utf-8-sig')
    embedded = re.search(r'model:\s*"data:model/gltf-binary;base64,([A-Za-z0-9+/=]+)"', html)
    if not embedded:
        raise ValueError(f'No embedded GLB in {key}')
    data = base64.b64decode(embedded.group(1), validate=True)
    assert data[:4] == b'glTF' and struct.unpack_from('<I', data, 8)[0] == len(data)
    (originals / f'{key}.glb').write_bytes(data)
    def setting(name):
        m = re.search(r'\b' + name + r':\s*(null|\[[^\]]+\]|[\d.]+)', html)
        return json.loads(m.group(1)) if m else None
    records.append({'id': key, 'source': url, 'pageSha256': hashlib.sha256(page).hexdigest(), 'sha256': hashlib.sha256(data).hexdigest(), 'bytes': len(data), 'camera': {k: setting(k) for k in ['azimuth', 'focus', 'span']}})
    print(key, len(data), 'bytes extracted', flush=True)
(out / 'sources.json').write_text(json.dumps({'commit': commit, 'files': records, 'licenseNote': 'User-selected source assets; source repository has no explicit model license. No new license assigned.'}, indent=2) + '\n')
