/* Browser-only acceptance fixtures. Not loaded by the production homepage. */
const mode = new URLSearchParams(location.search).get('mode');
if (mode === 'reduced') {
  const original = window.matchMedia.bind(window);
  window.matchMedia = query => query === '(prefers-reduced-motion: reduce)' ? { matches: true, media: query, addEventListener() {}, removeEventListener() {} } : original(query);
}
if (mode === 'no-webgl') {
  const original = HTMLCanvasElement.prototype.getContext;
  HTMLCanvasElement.prototype.getContext = function (kind, ...args) {
    return /webgl/.test(kind) ? null : original.call(this, kind, ...args);
  };
}
if (mode === 'failed-model') window.KPRO_CONTENT.islands.models.ward.src = 'assets/islands/intentional-missing-fixture.glb';
if (mode === 'rotation') window.KPRO_CONTENT.islands.rotationSeconds = 6;

document.addEventListener('DOMContentLoaded', () => {
  if (mode !== 'rotation') return;
  const button = document.createElement('button');
  button.textContent = 'Run 360° framing audit';
  button.style.cssText = 'position:fixed;top:8px;right:8px;z-index:9999;padding:12px;background:white;color:black;border:1px solid black';
  const report = document.createElement('pre');
  report.id = 'island-qa-report';
  report.style.cssText = 'position:fixed;bottom:0;right:0;z-index:9999;max-height:170px;overflow:auto;background:white;color:black;font-size:11px;padding:10px';
  document.body.append(button, report);
  button.addEventListener('click', () => {
    const views = [...document.querySelectorAll('[data-variant="thumb"]')];
    if (views.some(v => !v.classList.contains('is-ready'))) { report.textContent = 'Wait for all four models to load.'; return; }
    const results = Object.fromEntries(views.map(v => [v.dataset.islandView, { previous: Number(v.dataset.angle), rotation: 0, samples: 0, edgePixels: 0, nonempty: false }]));
    const started = performance.now();
    button.disabled = true;
    report.textContent = 'Running a complete revolution and checking transparent borders…';
    function sample() {
      for (const view of views) {
        const r = results[view.dataset.islandView];
        const angle = Number(view.dataset.angle);
        r.rotation += (angle - r.previous + Math.PI * 2) % (Math.PI * 2); r.previous = angle;
        const canvas = view.querySelector('canvas'), w = canvas.width, h = canvas.height;
        const data = canvas.getContext('2d').getImageData(0, 0, w, h).data;
        for (let x = 0; x < w; x++) r.edgePixels += Number(data[x * 4 + 3] > 8) + Number(data[((h - 1) * w + x) * 4 + 3] > 8);
        for (let y = 1; y < h - 1; y++) r.edgePixels += Number(data[(y * w) * 4 + 3] > 8) + Number(data[(y * w + w - 1) * 4 + 3] > 8);
        r.nonempty ||= data.some((value, i) => i % 4 === 3 && value > 8);
        r.samples++;
      }
      if (performance.now() - started < 8200) requestAnimationFrame(sample);
      else {
        for (const r of Object.values(results)) { delete r.previous; r.passed = r.rotation >= Math.PI * 2 && r.edgePixels === 0 && r.nonempty; }
        report.textContent = JSON.stringify({ mode, results }, null, 2);
        button.disabled = false;
      }
    }
    requestAnimationFrame(sample);
  });
});
