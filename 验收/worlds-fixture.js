// Development-only, never loaded by the production homepage.
const mode = new URLSearchParams(location.search).get('mode') || 'normal';
if (mode === 'failed-world') window.KPRO_CONTENT.worldOverview.scenes[0].model = 'assets/worlds/intentional-missing.glb';
if (mode === 'no-webgl') {
  const original = HTMLCanvasElement.prototype.getContext;
  HTMLCanvasElement.prototype.getContext = function(type, ...args) { return this.id === 'world-canvas' && /webgl/.test(type) ? null : original.call(this, type, ...args); };
}
window.addEventListener('DOMContentLoaded', () => {
  const $ = s => document.querySelector(s);
  const button = document.createElement('button'); button.id = 'run-world-checks'; button.textContent = '运行小世界验收';
  button.style.cssText = 'position:fixed;right:10px;bottom:10px;z-index:9999;background:white;color:black;padding:12px;border:1px solid';
  const output = document.createElement('pre'); output.id = 'world-results';
  output.style.cssText = 'position:fixed;left:0;bottom:0;z-index:9999;background:white;color:black;max-width:520px;max-height:180px;overflow:auto;font:11px monospace';
  document.body.append(button, output);
  const delay = ms => new Promise(r => setTimeout(r, ms));
  const until = async predicate => { const end = performance.now() + 20000; while (!predicate()) { if (performance.now() > end) throw new Error('State timeout'); await delay(50); } };
  const settled = async () => { let last, repeats = 0; await until(() => { const now = $('#world-canvas').dataset.frames; repeats = now === last ? repeats + 1 : 0; last = now; return repeats >= 4; }); };
  button.addEventListener('click', async () => {
    button.disabled = true; output.textContent = 'Running…';
    const checks = [], scenes = [], world = $('#world-canvas'), stage = $('#world-stage'), dialog = $('#scene-dialog');
    const check = (name, value, detail) => { checks.push({ name, pass: !!value, ...(detail ? { detail } : {}) }); if (!value) throw new Error(name); };
    const view = () => ({ angle: Number(world.dataset.angle), distance: Number(world.dataset.distance) });
    const glass = () => [...document.querySelectorAll('.glass-panel')].map(e => getComputedStyle(e, '::before').backdropFilter + getComputedStyle(e, '::before').backgroundColor).join('|');
    const glassBefore = glass();
    const openAndReturn = async (id, trigger, action) => {
      trigger.focus({ preventScroll: true });
      const before = view();
      action(); await until(() => $('#space-stage').dataset.state === 'ready');
      check(id + ' opens own panorama', $('#space-stage').dataset.scene === id && $('#space-canvas').dataset.source.includes('/' + id));
      const y = Number(dialog.dataset.returnY), frames = world.dataset.frames;
      await delay(180);
      check(id + ' underlying world pauses', world.dataset.frames === frames && world.dataset.active !== 'true');
      scenes.push({ id, panorama: $('#space-canvas').dataset.source });
      dialog.querySelector('.dialog-close').click(); await delay(200);
      check(id + ' return and focus restored', !dialog.open && document.activeElement === trigger && Math.abs(scrollY - y) < 2);
      if (mode === 'normal') check(id + ' world orientation and zoom restored', Math.abs(view().angle - before.angle) < .001 && Math.abs(view().distance - before.distance) < .01, { before, after: view() });
    };
    try {
      check('Old bookmark UI removed', !$('#scene-strip') && !$('#scene-viewport') && !document.querySelector('.scene-card'));
      stage.scrollIntoView({ block: 'start', behavior: 'instant' });
      await until(() => ['ready', 'fallback'].includes(stage.dataset.state));
      if (mode === 'normal') {
        check('One complete world renders', stage.dataset.state === 'ready' && world.width > 0 && document.querySelectorAll('.world-label-hit').length === 4);
        $('[data-world-action="reset"]').click(); await settled();
        check('Reset returns to original composition', Math.abs(view().angle - Math.PI / 4) < .001);
        const initial = view();
        $('[data-world-action="in"]').click(); await settled();
        check('World zoom works', view().distance < initial.distance);
        $('[data-world-action="reset"]').click(); await settled();
        const y = scrollY;
        world.focus({ preventScroll: true }); world.dispatchEvent(new KeyboardEvent('keydown', { key: 'ArrowRight', bubbles: true, cancelable: true })); await settled();
        check('Scoped keyboard rotates without scrolling page', view().angle > initial.angle && scrollY === y);
        $('[data-world-action="reset"]').click(); await settled();
        const wheel = new WheelEvent('wheel', { deltaY: 120, bubbles: true, cancelable: true }); world.dispatchEvent(wheel);
        check('Ordinary wheel remains page scrolling', !wheel.defaultPrevented);
        $('#world-language').click(); await delay(100);
        check('Language changes within world only', stage.lang === 'zh-CN' && $('#settings-title').textContent === '四场景小世界' && $('#app-title').textContent === window.KPRO_CONTENT.app.title);
        $('#world-language').click();
        for (const id of ['home', 'ward', 'garden', 'salon']) {
          const trigger = innerWidth <= 700 ? $(`[data-world-choice="${id}"]`) : $(`[data-world-enter="${id}"]`);
          await openAndReturn(id, trigger, () => trigger.click());
        }
        // Raycast the actual centres of all four loaded buildings, independently
        // of the accessible pill buttons used above.
        for (const id of ['home', 'ward', 'garden', 'salon']) {
          const label = $(`[data-world-enter="${id}"]`), r = world.getBoundingClientRect();
          await openAndReturn(id, world, () => world.dispatchEvent(new MouseEvent('click', { clientX: r.left + Number(label.dataset.buildingX), clientY: r.top + Number(label.dataset.buildingY), bubbles: true })));
          check(id + ' building raycast matches', world.dataset.lastPick === id);
        }
        const oldCapture = world.setPointerCapture, oldHas = world.hasPointerCapture;
        try {
          world.setPointerCapture = () => {}; world.hasPointerCapture = () => false;
          const point = (type, pointerId, x, y) => world.dispatchEvent(new PointerEvent(type, { pointerId, pointerType: 'touch', clientX: x, clientY: y, button: 0, bubbles: true, cancelable: true }));
          const before = view();
          point('pointerdown', 101, 100, 350); point('pointermove', 101, 180, 355); point('pointerup', 101, 180, 355); await settled();
          check('One finger horizontal rotation', Math.abs(view().angle - before.angle) > .05);
          world.dispatchEvent(new MouseEvent('click', { clientX: 180, clientY: 355, bubbles: true }));
          check('Drag never opens a panorama', !dialog.open);
          const prePinch = view().distance;
          point('pointerdown', 101, 100, 350); point('pointerdown', 102, 200, 350); point('pointermove', 102, 270, 350); point('pointerup', 101, 100, 350); point('pointerup', 102, 270, 350); await settled();
          check('Two finger zoom', view().distance < prePinch);
        } finally { world.setPointerCapture = oldCapture; world.hasPointerCapture = oldHas; }
        $('[data-world-action="reset"]').click(); await settled();
        $('[data-world-action="pause"]').click(); await delay(180);
        check('Play resumes world spin', world.dataset.paused === 'false');
        $('[data-world-action="pause"]').click(); await settled();
        const frames = world.dataset.frames; await delay(180);
        check('Paused world stops rendering when settled', world.dataset.frames === frames);
        $('#app').scrollIntoView({ behavior: 'instant' }); await delay(150);
        check('Offscreen world suspended', world.dataset.active === 'false');
        stage.scrollIntoView({ behavior: 'instant' }); await delay(100);
      } else {
        check('Recoverable world fallback', stage.dataset.state === 'fallback' && !labelsVisible() && [...stage.querySelectorAll('[data-world-action]')].every(b => b.disabled));
        for (const id of ['home', 'ward', 'garden', 'salon']) {
          const trigger = $(`[data-world-choice="${id}"]`);
          await openAndReturn(id, trigger, () => trigger.click());
        }
      }
      check('All world controls fit viewport width', [...stage.querySelectorAll('.world-toolbar button')].every(e => { const r = e.getBoundingClientRect(); return r.left >= 0 && r.right <= innerWidth; }));
      check('No page horizontal overflow', document.documentElement.scrollWidth <= innerWidth);
      check('Stable glass unaffected', glass() === glassBefore);
      output.dataset.result = 'pass';
    } catch (error) { output.dataset.result = 'fail'; checks.push({ error: error.message }); if (dialog.open) dialog.querySelector('.dialog-close').click(); }
    output.textContent = JSON.stringify({ mode, viewport: [innerWidth, innerHeight], result: output.dataset.result, scenes, checks }, null, 2);
  });
  function labelsVisible() { return !$('#world-labels').hidden; }
});
