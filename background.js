(() => {
  'use strict';
  const content = window.KPRO_CONTENT;
  const background = document.querySelector('#site-background');
  if (!content || !background) return;

  const config = content.background;
  const image = document.querySelector('#background-image');
  const video = document.querySelector('#background-video');
  const frost = document.querySelector('#background-frost');
  const main = document.querySelector('main');
  const reduceMotion = matchMedia('(prefers-reduced-motion: reduce)');
  const clamp = value => Math.min(1, Math.max(0, value));
  const mix = (a, b, amount) => a + (b - a) * amount;
  const smooth = value => value * value * (3 - 2 * value);
  const rgb = hex => hex.match(/[a-f\d]{2}/gi).map(value => parseInt(value, 16));
  const overscan = 64;
  const tint = state => `rgba(${state.tint.join(',')},${state.opacity})`;
  const sections = Array.from(main.children).filter(element => config.sections[element.id]).map(element => {
    const state = config.sections[element.id];
    return { element, top: 0, blur: Math.max(0, state.blur), opacity: clamp(state.opacity), tint: rgb(state.tint) };
  });
  image.src = content.site.heroImage;
  background.style.setProperty('--background-position', config.position);
  background.style.setProperty('--background-mobile-position', config.mobilePosition);
  background.style.setProperty('--frost-overscan', `${overscan}px`);

  let framePending = false;
  let needsMeasure = true;
  let viewportHeight = 1;
  let scrollRange = 1;
  let progress = 0;
  let videoReady = false;
  let videoRequested = false;

  // Geometry is cached until content or viewport size changes. Neither media
  // position nor foreground layout is changed by this controller.
  function measure() {
    viewportHeight = document.documentElement.clientHeight || innerHeight;
    scrollRange = Math.max(1, document.documentElement.scrollHeight - viewportHeight);
    sections.forEach(section => {
      section.top = section.element.getBoundingClientRect().top + scrollY;
    });
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
    // Video progress uses the whole document; frost uses section boundaries.
    progress = clamp(scrollY / scrollRange);
    const enter = clamp(config.transition.enter);
    const settle = Math.min(enter - 0.01, clamp(config.transition.settle));
    let blur = sections[0].blur;
    for (const next of sections.slice(1)) {
      const amount = smooth(clamp((scrollY + viewportHeight * enter - next.top) / (viewportHeight * (enter - settle))));
      if (amount <= 0) break;
      blur = mix(blur, next.blur, amount);
      if (amount < 1) break;
    }
    frost.style.setProperty('--background-blur', `${blur.toFixed(2)}px`);
    // A single gradient preserves each section's text contrast while light and
    // dark sections share the viewport. Its boundary follows the content; the
    // image/video underneath stays fixed. Blend inside section padding.
    const halfBlend = Math.max(1, viewportHeight * clamp(config.transition.tintBlend) / 2);
    const stops = [`${tint(sections[0])} ${sections[0].top - scrollY + overscan - halfBlend}px`];
    sections.slice(1).forEach((section, index) => {
      const boundary = section.top - scrollY + overscan;
      stops.push(`${tint(sections[index])} ${(boundary - halfBlend).toFixed(2)}px`);
      stops.push(`${tint(section)} ${(boundary + halfBlend).toFixed(2)}px`);
    });
    frost.style.setProperty('--background-tint', `linear-gradient(to bottom,${stops.join(',')})`);
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
  sections.forEach(section => layoutObserver.observe(section.element));
  syncMotionPreference();
})();
