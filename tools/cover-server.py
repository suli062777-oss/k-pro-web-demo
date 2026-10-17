"""Local, development-only receiver for covers rendered by the cover studio."""
from http.server import ThreadingHTTPServer, SimpleHTTPRequestHandler
from pathlib import Path
import os,re
root = Path(__file__).resolve().parent.parent
os.chdir(root)
class Handler(SimpleHTTPRequestHandler):
    def do_POST(self):
        match = re.fullmatch(r'/__cover/(home|ward|garden|salon)', self.path)
        if not match or self.headers.get('Origin') != 'http://127.0.0.1:4175':
            self.send_error(403); return
        size = int(self.headers.get('Content-Length', '0'))
        if not 100 < size < 4_000_000:
            self.send_error(400); return
        data = self.rfile.read(size)
        if data[:4] != b'RIFF' or data[8:12] != b'WEBP':
            self.send_error(400); return
        (root / f'assets/spaces/{match.group(1)}-cover.webp').write_bytes(data)
        self.send_response(200); self.end_headers(); self.wfile.write(b'saved')
ThreadingHTTPServer(('127.0.0.1',4175), Handler).serve_forever()
