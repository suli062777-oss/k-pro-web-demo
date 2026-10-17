(() => {
  'use strict';
  const content = window.KPRO_CONTENT;
  const background = document.querySelector('#site-background');
  if (!content || !background) return;

  const config = content.background;
  const image = document.querySelector('#background-image');
  const video = document.querySelector('#background-video');
  const main = document.querySelector('main');
  const reduceMotion = matchMedia('(prefers-reduced-motion: reduce)');
  const clamp = value => Math.min(1, Math.max(0, value));
  const mix = (a, b, amount) => a + (b - a) * amount;
  const rgb = hex => hex.match(/[a-f\d]{2}/gi).map(value => parseInt(value, 16));
  const sections = Array.from(main.children);

  // Wrap adjacent chapters of the same theme in one physical glass panel.
  // Existing nodes, reading order, IDs and event listeners are preserved.
  // Panel styles are assigned once; scrolling never changes these values.
  const themeBySection = new Map(config.groups.flatMap(group => group.sections.map(id => [id, group.theme])));
  let panel = null;
  let previousTheme = null;
  sections.forEach(section => {
    const theme = themeBySection.get(section.id);
    const state = config.themes[theme];
    if (!state) { panel = null; previousTheme = null; return; }
    if (!panel || theme !== previousTheme) {
      panel = document.createElement('div');
      panel.className = 'glass-panel';
      panel.dataset.theme = theme;
      panel.style.setProperty('--panel-blur', `${Math.max(0, state.blur)}px`);
      panel.style.setProperty('--panel-grayscale', clamp(state.grayscale));
      panel.style.setProperty('--panel-tint', `rgba(${rgb(state.tint).join(',')},${clamp(state.opacity)})`);
      panel.style.setProperty('--panel-foreground', state.foreground);
      main.insertBefore(panel, section);
      previousTheme = theme;
    }
    panel.append(section);
  });
  image.src = content.site.heroImage;
  background.style.setProperty('--background-position', config.position);
  background.style.setProperty('--background-mobile-position', config.mobilePosition);

  // Autoplay and scroll seeking are separate modes. Never let scrolling seek
  // an automatically playing background; glass parameters stay constant in both.
  if (content.site.videoPlayback === 'autoplay') {
    const toggle = document.querySelector('#background-video-toggle');
    let requested = false;
    let ready = false;
    let failed = false;
    let userPaused = false;
    let userStarted = false;
    let blocked = false;
    let playPending = false;
    video.muted = true;
    video.defaultMuted = true;
    video.playsInline = true;
    video.loop = content.site.videoLoop !== false;
    video.poster = content.site.heroImage;

    function updateToggle() {
      background.dataset.playback = failed ? 'fallback' : !video.paused ? 'playing' : blocked ? 'blocked' : 'paused';
      video.hidden = !ready || failed || (reduceMotion.matches && !userStarted);
      if (!toggle) return;
      const zh = (window.KPRO_LANGUAGE || document.documentElement.lang).startsWith('zh');
      toggle.hidden = !content.site.heroVideo || failed;
      toggle.textContent = video.paused ? (zh ? '播放背景' : 'Play video') : (zh ? '暂停背景' : 'Pause video');
      toggle.setAttribute('aria-label', toggle.textContent);
      toggle.dataset.playing = String(!video.paused);
    }
    function shouldPlay() {
      return !document.hidden && !document.querySelector('dialog[open]') && !failed && !userPaused && (!reduceMotion.matches || userStarted);
    }
    function syncPlayback() {
      if (!content.site.heroVideo || failed) { updateToggle(); return; }
      if (!requested && (!reduceMotion.matches || userStarted)) {
        requested = true;
        video.src = content.site.heroVideo;
        video.preload = 'auto';
        video.load();
      }
      if (!shouldPlay()) video.pause();
      else if (!blocked && !playPending && video.paused) {
        playPending = true;
        video.play().catch(error => {
          // Visibility/dialog changes can legitimately interrupt an in-flight play.
          if (error.name !== 'AbortError') blocked = true;
        }).finally(() => { playPending = false; updateToggle(); });
      }
      updateToggle();
    }
    video.addEventListener('loadeddata', () => { ready = true; syncPlayback(); });
    video.addEventListener('playing', () => {
      if (!shouldPlay()) video.pause();
      updateToggle();
    });
    video.addEventListener('pause', updateToggle);
    video.addEventListener('error', () => { failed = true; video.pause(); updateToggle(); });
    toggle?.addEventListener('click', () => {
      if (video.paused) { userPaused = false; userStarted = true; blocked = false; }
      else userPaused = true;
      syncPlayback();
    });
    reduceMotion.addEventListener('change', () => { userStarted = false; syncPlayback(); });
    document.addEventListener('visibilitychange', syncPlayback);
    window.addEventListener('pageshow', syncPlayback);
    window.addEventListener('pagehide', () => video.pause());
    window.addEventListener('kpro:language', updateToggle);
    document.querySelectorAll('dialog').forEach(dialog => new MutationObserver(syncPlayback).observe(dialog, { attributes: true, attributeFilter: ['open'] }));
    syncPlayback();
    return;
  }

  let framePending = false;
  let needsMeasure = true;
  let viewportHeight = 1;
  let scrollRange = 1;
  let progress = 0;
  let videoReady = false;
  let videoRequested = false;

  // Only the video needs scroll geometry. The panels follow normal document flow.
  function measure() {
    viewportHeight = document.documentElement.clientHeight || innerHeight;
    scrollRange = Math.max(1, document.documentElement.scrollHeight - viewportHeight);
    needsMeasure = false;
  }

  // Always seek to the newest scroll position once an in-flight seek finishes.
  // No play(), autoplay or loop: stopping the scroll leaves the frame paused.
  function syncVideo() {
    if (!videoReady || reduceMotion.matches || video.seeking) return;
    const duration = video.duration;
    if (!Number.isFinite(duration) || duration <= 0) return;
    const lastFrame = Math.max(0, duration - 0.05);
    const start = Math.min(lastFrame, Math.max(0, Number(content.site.videoStart) || 0));
    const requestedEnd = content.site.videoEnd == null ? lastFrame : Number(content.site.videoEnd);
    const end = Math.max(start, Math.min(lastFrame, Number.isFinite(requestedEnd) ? requestedEnd : lastFrame));
    const target = mix(start, end, progress);
    if (Math.abs(video.currentTime - target) > 0.025) video.currentTime = target;
  }

  function update() {
    framePending = false;
    if (needsMeasure) measure();
    // Video progress uses the whole document, independently of the glass panels.
    progress = clamp(scrollY / scrollRange);
    syncVideo();
  }
  function requestFrame() {
    if (!framePending) {
      framePending = true;
      requestAnimationFrame(update);
    }
  }
  function invalidate() {
    needsMeasure = true;
    requestFrame();
  }

  function syncMotionPreference() {
    video.pause();
    video.hidden = reduceMotion.matches || !videoReady;
    if (content.site.heroVideo && !reduceMotion.matches && !videoRequested) {
      videoRequested = true;
      video.poster = content.site.heroImage;
      video.src = content.site.heroVideo;
      video.preload = 'auto';
      video.load();
    }
    requestFrame();
  }
  video.addEventListener('loadeddata', () => {
    videoReady = true;
    video.pause();
    video.hidden = reduceMotion.matches;
    requestFrame();
  });
  video.addEventListener('seeked', syncVideo);
  video.addEventListener('durationchange', requestFrame);
  video.addEventListener('error', () => { videoReady = false; video.hidden = true; });
  reduceMotion.addEventListener('change', syncMotionPreference);
  addEventListener('scroll', requestFrame, { passive: true });
  addEventListener('resize', invalidate, { passive: true });
  addEventListener('pageshow', invalidate);
  window.visualViewport?.addEventListener('resize', invalidate, { passive: true });
  const layoutObserver = new ResizeObserver(invalidate);
  layoutObserver.observe(main);
  sections.forEach(section => layoutObserver.observe(section));
  syncMotionPreference();
})();
