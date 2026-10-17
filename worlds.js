const stage = document.querySelector('#world-stage');
const canvas = document.querySelector('#world-canvas');
const config = window.KPRO_CONTENT.worldOverview;
const status = document.querySelector('#world-status');
const choices = document.querySelector('#world-choices');
const labelsRoot = document.querySelector('#world-labels');
const labels = new Map();
const actions = [...stage.querySelectorAll('[data-world-action]')];
const reduced = matchMedia('(prefers-reduced-motion: reduce)');
let engine, started = false, visible = false, failed = false, paused = reduced.matches, lang = window.KPRO_LANGUAGE || config.language || 'en';

function enter(id) {
  if (!config.scenes.some(scene => scene.id === id)) return;
  window.dispatchEvent(new CustomEvent('kpro:world-open', { detail: { id } }));
}
for (const spec of config.scenes) {
  const button = document.createElement('button');
  button.type = 'button'; button.className = 'world-label-hit'; button.dataset.worldEnter = spec.id;
  button.setAttribute('aria-label', `进入 ${spec.name} 360° 场景`);
  button.addEventListener('click', () => enter(spec.id));
  button.addEventListener('pointerenter', event => { if (event.pointerType !== 'touch') engine?.setPaused(true); });
  button.addEventListener('focus', () => engine?.setPaused(true));
  labelsRoot.append(button); labels.set(spec.id, button);
  const choice = document.createElement('button');
  choice.type = 'button'; choice.className = 'world-choice'; choice.dataset.worldChoice = spec.id;
  choice.setAttribute('aria-label', `进入 ${spec.name} 360° 场景`);
  const image = document.createElement('img');
  image.src = window.KPRO_CONTENT.spaces.scenes[spec.id].cover;
  image.alt = ''; image.width = 1200; image.height = 1200; image.loading = 'lazy';
  const name = document.createElement('span'); name.dataset.worldName = spec.id;
  choice.append(image, name);
  choice.addEventListener('click', () => enter(spec.id));
  choices.append(choice);
}
function updateCopy() {
  const copy = config.copy[lang];
  stage.lang = lang === 'zh' ? 'zh-CN' : 'en';
  document.querySelector('#settings-title').textContent = copy.title;
  document.querySelector('#world-instruction').textContent = copy.instruction;
  const localLanguage = document.querySelector('#world-language');
  if (localLanguage) localLanguage.textContent = lang === 'en' ? '中文' : 'EN';
  const pause = stage.querySelector('[data-world-action="pause"]');
  pause.textContent = paused ? copy.play : copy.pause;
  pause.setAttribute('aria-pressed', String(paused));
  stage.querySelector('[data-world-action="reset"]').textContent = copy.reset;
  for (const spec of config.scenes) document.querySelector(`[data-world-name="${spec.id}"]`).textContent = lang === 'en' ? spec.nameEn : spec.name;
  status.textContent = failed ? copy.failed : engine ? '' : copy.loading;
}
function active() { engine?.setActive(visible && !document.hidden && !document.querySelector('dialog[open]')); }
function fail(error) {
  failed = true; stage.dataset.state = 'fallback'; stage.setAttribute('aria-busy', 'false');
  labelsRoot.hidden = true; canvas.tabIndex = -1;
  actions.forEach(button => button.disabled = true);
  engine?.setActive(false); updateCopy();
  console.warn('K pro world fallback:', error.message);
}
async function start() {
  if (started) return;
  started = true; stage.dataset.state = 'loading'; stage.setAttribute('aria-busy', 'true');
  try {
    const module = await import('./assets/world-engine.js?v=20261017-worlds');
    engine = await module.createWorldRenderer(canvas, config, { labels, onEnter: enter, onFailure: fail, onMotion(value) { paused = value; updateCopy(); } });
    if (failed) { engine.setActive(false); return; }
    stage.dataset.state = 'ready'; stage.setAttribute('aria-busy', 'false');
    labelsRoot.hidden = false; actions.forEach(button => button.disabled = false);
    engine.setLanguage(lang); updateCopy(); active();
  } catch (error) { fail(error); }
}
actions.forEach(button => button.addEventListener('click', () => engine?.action(button.dataset.worldAction)));
document.querySelector('#world-language')?.addEventListener('click', () => { lang = lang === 'en' ? 'zh' : 'en'; updateCopy(); engine?.setLanguage(lang); });
window.addEventListener('kpro:language', event => { lang = event.detail.lang; updateCopy(); engine?.setLanguage(lang); });
new IntersectionObserver(entries => entries.forEach(entry => { if (entry.isIntersecting) start(); }), { rootMargin: '300px' }).observe(stage);
new IntersectionObserver(entries => { visible = entries[0].isIntersecting; active(); }).observe(stage);
new ResizeObserver(() => engine?.resize()).observe(canvas);
document.addEventListener('visibilitychange', active);
document.querySelectorAll('dialog').forEach(dialog => new MutationObserver(active).observe(dialog, { attributes: true, attributeFilter: ['open'] }));
reduced.addEventListener('change', () => engine?.setPaused(reduced.matches));
updateCopy();
