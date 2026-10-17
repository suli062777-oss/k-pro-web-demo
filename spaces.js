const dialog = document.querySelector('#scene-dialog');
const canvas = document.querySelector('#space-canvas');
const stage = document.querySelector('#space-stage');
const status = document.querySelector('#space-status');
const config = window.KPRO_CONTENT.spaces;
let engine, importing, request = 0, activeId, controller;
const buttons = [...dialog.querySelectorAll('[data-space-action]')];

function state(value, message = '') {
  stage.dataset.state = value;
  stage.classList.toggle('is-ready', value === 'ready');
  stage.setAttribute('aria-busy', String(value === 'loading'));
  canvas.setAttribute('aria-hidden', String(value !== 'ready'));
  canvas.tabIndex = value === 'ready' ? 0 : -1;
  status.textContent = message;
  buttons.forEach(button => {
    if (button.dataset.spaceAction === 'retry') button.hidden = value !== 'fallback';
    else button.disabled = value !== 'ready';
  });
}
function fail(error) {
  engine?.release();
  state('fallback', '全景暂时无法加载。请重试，或关闭返回小世界。');
  console.warn('K pro space fallback:', activeId, error.message);
}
async function open(id) {
  const ticket = ++request;
  controller?.abort();
  const pending = controller = new AbortController();
  activeId = id;
  const spec = config.scenes[id];
  if (!spec) { fail(new Error('Unknown panorama')); return; }
  stage.dataset.scene = id;
  document.querySelector('#space-fallback').src = spec.cover;
  document.querySelector('#space-fallback').alt = spec.title + '室内空间封面';
  engine?.release(); state('loading', '正在打开 ' + spec.title + '全景…');
  canvas.setAttribute('aria-label', spec.title + ' 360°全景：拖动或方向键环视，加减键缩放，Esc 返回');
  let timeout;
  try {
    timeout = setTimeout(() => {
      pending.abort();
      if (ticket === request && dialog.open) { request++; fail(new Error('Panorama request timed out')); }
    }, 30000);
    importing ||= import('./assets/panorama-engine.js?v=20261015').catch(error => { importing = null; throw error; });
    const module = await importing;
    if (ticket !== request || !dialog.open || pending.signal.aborted) return;
    engine ||= module.createPanoramaRenderer(canvas, config, fail);
    const asset = await engine.load(spec, { signal: pending.signal });
    if (ticket !== request || !dialog.open) { engine.discard(asset); return; }
    engine.present(asset, spec);
    state('ready');
  } catch (error) { if (ticket === request && dialog.open) fail(error); }
  finally { clearTimeout(timeout); }
}
window.addEventListener('kpro:space-open', event => open(event.detail.id));
dialog.addEventListener('close', () => { request++; controller?.abort(); engine?.release(); state('closed'); });
buttons.forEach(button => button.addEventListener('click', () => {
  const action = button.dataset.spaceAction;
  if (action === 'retry') open(activeId);
  else engine?.action(action);
}));
canvas.addEventListener('keydown', event => {
  const action = { ArrowLeft: 'left', ArrowRight: 'right', ArrowUp: 'up', ArrowDown: 'down', '+': 'in', '=': 'in', '-': 'out', '0': 'reset', Home: 'reset' }[event.key];
  if (action) { event.preventDefault(); engine?.action(action); }
});
new ResizeObserver(() => { if (dialog.open && stage.dataset.state === 'ready') engine?.resize(); }).observe(stage);
document.addEventListener('visibilitychange', () => engine?.setActive(dialog.open && !document.hidden && stage.dataset.state === 'ready'));
state('closed');
