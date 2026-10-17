// Development-only checks. This script is never included by the homepage.
const mode = new URLSearchParams(location.search).get('mode') || 'normal';
const originalWard = { ...window.KPRO_CONTENT.spaces.scenes.ward };
if (mode === 'failed') Object.assign(window.KPRO_CONTENT.spaces.scenes.ward, { src: 'assets/panoramas/intentional-missing.webp', mobileSrc: 'assets/panoramas/intentional-missing.webp' });
if (mode === 'no-webgl') {
  const getContext = HTMLCanvasElement.prototype.getContext;
  HTMLCanvasElement.prototype.getContext = function (kind, ...args) {
    return this.id === 'space-canvas' && /webgl/.test(kind) ? null : getContext.call(this, kind, ...args);
  };
}
window.addEventListener('DOMContentLoaded', () => {
  const $ = selector => document.querySelector(selector);
  const button = document.createElement('button');
  button.id = 'run-panorama-checks'; button.textContent = '运行全景验收';
  button.style.cssText = 'position:fixed;right:12px;top:12px;z-index:9999;padding:14px;background:white;color:black';
  const output = document.createElement('pre'); output.id = 'panorama-results';
  output.style.cssText = 'position:fixed;bottom:0;right:0;z-index:9999;max-width:550px;max-height:200px;overflow:auto;background:white;color:black;font:11px monospace';
  document.body.append(button, output);
  const delay = ms => new Promise(resolve => setTimeout(resolve, ms));
  const frame = () => new Promise(resolve => requestAnimationFrame(() => requestAnimationFrame(resolve)));
  const until = async predicate => {
    const end = performance.now() + 15000;
    while (!predicate()) { if (performance.now() > end) throw new Error('Timed out waiting for panorama state'); await delay(50); }
  };
  button.addEventListener('click', async () => {
    button.disabled = true; output.textContent = 'Running…';
    const checks = [], scenes = [];
    const check = (name, pass, detail) => { checks.push({ name, pass: !!pass, ...(detail ? { detail } : {}) }); if (!pass) throw new Error(name); };
    const canvas = $('#space-canvas'), stage = $('#space-stage'), dialog = $('#scene-dialog');
    const state = () => ({ yaw: Number(canvas.dataset.yaw), pitch: Number(canvas.dataset.pitch), fov: Number(canvas.dataset.fov) });
    const glass = () => [...document.querySelectorAll('.glass-panel')].map(e => getComputedStyle(e, '::before').backdropFilter + getComputedStyle(e, '::before').backgroundColor);
    const beforeGlass = glass();
    try {
      check('Panoramas are lazy loaded', performance.getEntriesByType('resource').filter(e => /panoramas\/.+\.webp/.test(e.name)).length === 0);
      for (const id of mode === 'normal' ? ['home', 'ward', 'garden', 'salon'] : ['ward']) {
        $(`[data-scene-toggle="${id}"]`).click();
        await delay(750); // Wait for the site's deliberate card/rail transition.
        check(id + ' only selected card expanded', document.querySelectorAll('.scene-card.is-expanded').length === 1 && $(`[data-scene="${id}"]`).classList.contains('is-expanded'));
        const trigger = $(`[data-scene-preview="${id}"]`);
        trigger.focus(); trigger.click();
        await until(() => ['ready', 'fallback'].includes(stage.dataset.state));
        const returned = { y: Number(dialog.dataset.returnY), rail: Number(dialog.dataset.returnRail) };
        if (mode !== 'normal') {
          check(mode + ' has recoverable fallback', stage.dataset.state === 'fallback' && !$('#space-status').textContent.includes('undefined') && !$('[data-space-action="retry"]').hidden && $('#space-fallback').complete);
          if (mode === 'failed') {
            Object.assign(window.KPRO_CONTENT.spaces.scenes.ward, originalWard);
            $('[data-space-action="retry"]').click(); await until(() => stage.dataset.state === 'ready');
            check('Retry loads the correct recovered panorama', canvas.dataset.source.includes('/ward'));
          }
        } else {
          check(id + ' correct scene ready', stage.dataset.state === 'ready' && stage.dataset.scene === id && canvas.dataset.source.includes('/' + id + (innerWidth <= 650 ? '-mobile.webp' : '.webp')));
          check(id + ' stays at fixed viewpoint', canvas.dataset.cameraPosition === '0,0,0');
          const initial = state();
          for (let i = 0; i < 24; i++) { $('[data-space-action="right"]').click(); await frame(); }
          check(id + ' full 360 degree turn', Math.abs(state().yaw - initial.yaw) < .00001);
          $('[data-space-action="in"]').click(); await frame();
          check(id + ' zoom changes field of view', state().fov < initial.fov && canvas.dataset.cameraPosition === '0,0,0');
          $('[data-space-action="reset"]').click(); await frame();
          check(id + ' reset framing', JSON.stringify(initial) === JSON.stringify(state()));
          const oldCapture = canvas.setPointerCapture, oldHasCapture = canvas.hasPointerCapture;
          try {
            // Synthetic touch input drives the production pointer handlers;
            // browser capture requires a physical pointer, so stub capture only.
            canvas.setPointerCapture = () => {}; canvas.hasPointerCapture = () => false;
            const point = (type, pointerId, x, y) => canvas.dispatchEvent(new PointerEvent(type, { pointerId, pointerType: 'touch', clientX: x, clientY: y, bubbles: true, cancelable: true }));
            point('pointerdown', 101, 80, 250); point('pointermove', 101, 180, 280); point('pointerup', 101, 180, 280); await frame();
            check(id + ' touch drag changes direction', state().yaw !== initial.yaw && state().pitch !== initial.pitch);
            point('pointerdown', 101, 80, 250); point('pointerdown', 102, 180, 250); point('pointermove', 102, 240, 250); point('pointerup', 101, 80, 250); point('pointerup', 102, 240, 250); await frame();
            check(id + ' two finger pinch zoom', state().fov < initial.fov);
          } finally { canvas.setPointerCapture = oldCapture; canvas.hasPointerCapture = oldHasCapture; }
          $('[data-space-action="reset"]').click(); await frame();
          const frames = canvas.dataset.frames; await delay(150);
          check(id + ' idle view has no animation loop', canvas.dataset.frames === frames);
          check(id + ' all controls inside viewport', [...dialog.querySelectorAll('button:not([hidden])')].every(e => { const r = e.getBoundingClientRect(); return r.left >= 0 && r.right <= innerWidth + 1 && r.top >= 0 && r.bottom <= innerHeight + 1; }));
          scenes.push({ id, source: canvas.dataset.source, framing: state(), canvas: [canvas.width, canvas.height] });
        }
        dialog.querySelector('.dialog-close').click(); await frame();
        check(id + ' closed and resource released', !dialog.open && stage.dataset.state === 'closed' && !canvas.dataset.source);
        check(id + ' return restores page, rail and focus', Math.abs(scrollY - returned.y) < 2 && Math.abs($('#scene-viewport').scrollLeft - returned.rail) < 2 && document.activeElement === trigger);
      }
      check('Glass panels unchanged', JSON.stringify(glass()) === JSON.stringify(beforeGlass));
      check('Page has no horizontal overflow', document.documentElement.scrollWidth <= innerWidth);
      if (mode === 'normal') {
        // Cancel a real request while opening, then immediately open another scene.
        $(`[data-scene-preview="salon"]`).click(); dialog.querySelector('.dialog-close').click();
        $('[data-scene-toggle="home"]').click(); await delay(750);
        $('[data-scene-preview="home"]').click(); await until(() => stage.dataset.state === 'ready');
        check('Rapid close and switch cannot show stale scene', stage.dataset.scene === 'home' && canvas.dataset.source.includes('/home'));
        dialog.querySelector('.dialog-close').click();
      }
      output.dataset.result = 'pass';
    } catch (error) { output.dataset.result = 'fail'; checks.push({ error: error.message }); if (dialog.open) dialog.querySelector('.dialog-close').click(); }
    output.textContent = JSON.stringify({ mode, viewport: [innerWidth, innerHeight], result: output.dataset.result, scenes, checks }, null, 2);
  });
});
