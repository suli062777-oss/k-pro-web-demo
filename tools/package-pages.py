"""Package the existing, committed static website without development files."""
from pathlib import Path
import shutil

root = Path(__file__).resolve().parent.parent
output = root / '_site'
if output.exists():
    raise SystemExit('_site already exists; preserve or remove the previous artifact first.')

entries = [
    'index.html', 'app.html', 'styles.css', 'app-download.css', 'worlds.css',
    'anatomy.css', 'site-header.css', 'routine-intro.css', 'pricing.css',
    'spaces.css', 'content.js', 'pricing-content.js', 'app.js', 'site-ui.js',
    'routine-intro.js', 'pricing.js', 'anatomy.js', 'worlds.js', 'spaces.js',
    'background.js',
]
files = [root / name for name in entries]
files.extend(path for path in (root / 'assets').rglob('*') if path.is_file()
             and path.name not in {'sources.json', '.DS_Store'}
             and path.suffix != '.map')
for path in files:
    if not path.is_file() or path.is_symlink():
        raise SystemExit(f'Missing or unsupported publication file: {path.relative_to(root)}')

for path in files:
    target = output / path.relative_to(root)
    target.parent.mkdir(parents=True, exist_ok=True)
    shutil.copyfile(path, target)
(output / '.nojekyll').touch()
size = sum(path.stat().st_size for path in files)
print(f'Prepared {len(files)} website files ({size:,} bytes) in {output}')
print('Excluded repository history, source workspace, design references and acceptance records.')
