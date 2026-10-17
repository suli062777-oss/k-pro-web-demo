import { createMotion, canAnimate, advanceMotion, motionPose } from './island-state.mjs';

export function startIslands(config = window.KPRO_CONTENT?.islands) {
  if (!config || !document.querySelector('[data-island-view]')) return;
  const media = matchMedia('(prefers-reduced-motion: reduce)');
  const states = new Map(Object.entries(config.models).map(([id, spec]) => [id, {
    id, spec, motion: createMotion(spec.initialAngle, media.matches), model: null, status: 'idle', hovered: new Set(), focused: new Set()
  }]));
  const views = new Map();
  const regions = new WeakSet();
  let engine, enginePromise, queue = Promise.resolve(), raf = 0, last = null, failed = false;

  function controls(state) {
    document.querySelectorAll(`[data-island-motion="${state.id}"]`).forEach(button => {
      button.disabled = state.status !== 'ready';
      const label = window.KPRO_CONTENT.scenes.find(scene => scene.id === state.id)?.label || state.id;
      button.setAttribute('aria-pressed', String(state.motion.userPaused));
      button.setAttribute('aria-label', `${state.motion.userPaused ? 'Resume' : 'Pause'} ${label} animation`);
      button.innerHTML = `<span aria-hidden="true">${state.motion.userPaused ? '▷' : 'Ⅱ'}</span><span class="island-motion-label">${state.motion.userPaused ? 'play' : 'pause'}</span>`;
    });
  }

  function fallback(state, error) {
    state.status = 'fallback';
    for (const view of views.values()) if (view.id === state.id) {
      view.element.classList.remove('is-ready');
      view.element.dataset.islandStatus = 'fallback';
    }
    controls(state);
    // Keep the existing illustration and all card actions available.
    console.warn('K pro island fallback:', state.id, error.message);
  }

  function failEngine(error) {
    failed = true;
    cancelAnimationFrame(raf); raf = 0; last = null;
    for (const state of states.values()) fallback(state, error);
  }

  function getEngine() {
    if (!enginePromise) enginePromise = import('./assets/islands-engine.js?v=20261015-shared').then(module => {
      engine = module.createIslandRenderer(config, failEngine);
      return engine;
    }).catch(error => { failEngine(error); throw error; });
    return enginePromise;
  }

  function load(state) {
    if (failed || state.status !== 'idle') return;
    state.status = 'loading';
    for (const view of views.values()) if (view.id === state.id) view.element.dataset.islandStatus = 'loading';
    // Decode one model at a time to bound memory and worker bursts on phones.
    queue = queue.then(async () => {
      if (failed) return;
      try {
        const renderer = await getEngine();
        state.model = await renderer.load(state.id);
        state.status = 'ready';
        controls(state);
        for (const view of views.values()) if (view.id === state.id) view.dirty = true;
        wake();
      } catch (error) { if (!failed) fallback(state, error); }
    });
  }

  function visibleViews() {
    const dialog = document.querySelector('dialog[open]');
    return [...views.values()].filter(view => view.visible && view.element.isConnected && view.element.clientWidth > 1 && view.element.clientHeight > 1 && !view.element.closest('[inert]') && (!dialog || dialog.contains(view.element)));
  }

  function tick(now) {
    raf = 0;
    if (document.hidden || failed) { last = null; return; }
    const visible = visibleViews();
    const loaded = visible.filter(view => states.get(view.id).model);
    if (!loaded.length) { last = null; return; }
    const elapsed = last === null ? 0 : Math.min((now - last) / 1000, 0.25);
    const interval = 1 / (config.maxFps || 30);
    if (last !== null && elapsed < interval - 0.001) { raf = requestAnimationFrame(tick); return; }
    last = now;
    const activeIds = new Set(loaded.map(view => view.id));
    let moving = false;
    for (const state of states.values()) {
      state.motion.hover = [...state.hovered].some(region => region.isConnected && (!document.querySelector('dialog[open]') || region.closest('dialog[open]')));
      state.motion.focus = [...state.focused].some(region => region.isConnected && region.contains(document.activeElement) && document.activeElement.matches(':focus-visible'));
      const playing = canAnimate(state.motion, activeIds.has(state.id), document.hidden);
      state.playing = playing;
      advanceMotion(state.motion, elapsed, playing);
      moving ||= playing;
    }
    try {
      engine.resizeSurface(loaded);
      for (const view of loaded) {
        const state = states.get(view.id);
        if (view.dirty || state.playing) engine.render(view, state.model, motionPose(state.motion, state.spec.rotationSeconds ?? config.rotationSeconds, state.spec.floatSeconds ?? config.floatSeconds));
        view.element.dataset.paused = String(!state.playing);
      }
    } catch (error) { failEngine(error); return; }
    if (moving) raf = requestAnimationFrame(tick);
    else last = null;
  }

  function wake() {
    if (!raf && !document.hidden && !failed) { last = null; raf = requestAnimationFrame(tick); }
  }

  const preload = new IntersectionObserver(entries => entries.forEach(entry => {
    if (entry.isIntersecting) load(states.get(entry.target.dataset.islandView));
  }), { rootMargin: config.preloadMargin || '240px' });
  const visibility = new IntersectionObserver(entries => {
    entries.forEach(entry => { const view = views.get(entry.target); if (view) { view.visible = entry.isIntersecting; view.dirty = true; } });
    wake();
  });
  const resize = new ResizeObserver(entries => { entries.forEach(entry => { const view = views.get(entry.target); if (view) view.dirty = true; }); wake(); });

  function refresh() {
    for (const state of states.values()) {
      for (const region of state.hovered) if (!region.isConnected) state.hovered.delete(region);
      for (const region of state.focused) if (!region.isConnected) state.focused.delete(region);
    }
    for (const [element, view] of views) if (!element.isConnected) {
      preload.unobserve(element); visibility.unobserve(element); resize.unobserve(element); views.delete(element);
    }
    document.querySelectorAll('[data-island-view]').forEach(element => {
      if (views.has(element) || !states.has(element.dataset.islandView)) return;
      const id = element.dataset.islandView, canvas = element.querySelector('canvas'), context = canvas.getContext('2d', { alpha: true });
      if (!context) return;
      const shadow = { ...config.shadow, ...states.get(id).spec.shadow };
      element.style.setProperty('--island-shadow-opacity', shadow.opacity);
      element.style.setProperty('--island-shadow-blur', shadow.blur + 'px');
      element.style.setProperty('--island-shadow-width', shadow.width + '%');
      element.dataset.islandStatus = states.get(id).status;
      views.set(element, { id, element, canvas, context, visible: false, dirty: true });
      preload.observe(element); visibility.observe(element); resize.observe(element);
    });
    document.querySelectorAll('[data-island-controls]').forEach(region => {
      if (regions.has(region)) return;
      regions.add(region);
      const state = states.get(region.dataset.islandControls);
      if (!state) return;
      region.addEventListener('pointerenter', event => { if (event.pointerType !== 'touch') { state.hovered.add(region); wake(); } });
      region.addEventListener('pointerleave', () => { state.hovered.delete(region); wake(); });
      region.addEventListener('pointerdown', () => { state.focused.delete(region); wake(); });
      region.addEventListener('focusin', () => { state.focused.add(region); wake(); });
      region.addEventListener('focusout', () => { state.focused.delete(region); wake(); });
    });
    for (const state of states.values()) controls(state);
    wake();
  }

  document.addEventListener('click', event => {
    const button = event.target.closest('[data-island-motion]');
    if (!button) return;
    const state = states.get(button.dataset.islandMotion);
    state.motion.userPaused = !state.motion.userPaused;
    controls(state); wake();
  });
  document.addEventListener('visibilitychange', () => {
    cancelAnimationFrame(raf); raf = 0; last = null;
    if (!document.hidden) { for (const view of views.values()) view.dirty = true; wake(); }
  });
  media.addEventListener('change', () => {
    for (const state of states.values()) { state.motion.userPaused = media.matches; controls(state); }
    wake();
  });
  document.querySelectorAll('dialog').forEach(dialog => {
    new MutationObserver(() => { for (const view of views.values()) view.dirty = true; wake(); }).observe(dialog, { attributes: true, attributeFilter: ['open'] });
  });
  window.addEventListener('kpro:islands-changed', refresh);
  window.addEventListener('resize', () => { for (const view of views.values()) view.dirty = true; wake(); }, { passive: true });
  refresh();
}

if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', () => startIslands(), { once: true });
else startIslands();
