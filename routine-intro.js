(() => {
  'use strict';
  const config = window.KPRO_CONTENT?.routineIntro;
  const section = document.querySelector('#routine');
  if (!config || !section?.classList.contains('routine-intro')) return;
  const $ = id => document.getElementById(id);
  const escape = value => String(value).replace(/[&<>"']/g, char => ({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[char]));
  const copy = () => config.translations[window.KPRO_LANGUAGE || 'en'] || config.translations.en;
  const dialog = $('routine-dialog');
  let dialogKind = null;
  let returnFocus = null;
  let returnPosition = 0;

  function renderDialog() {
    if (!dialogKind) return;
    const text = copy();
    const detail = text[dialogKind];
    $('routine-dialog-title').textContent = detail.title;
    $('routine-dialog-intro').textContent = detail.intro;
    const steps = $('routine-dialog-steps');
    steps.hidden = !detail.steps?.length;
    steps.innerHTML = (detail.steps || []).map(step => `<li><strong>${escape(step.title)}</strong><p>${escape(step.body)}</p></li>`).join('');
    dialog.querySelector('.routine-dialog-close').setAttribute('aria-label', text.close);
    dialog.querySelector('.routine-dialog-done').textContent = text.close;
  }

  const video = $('routine-video');
  const media = $('routine-media');
  const toggle = $('routine-video-toggle');
  const reduced = matchMedia('(prefers-reduced-motion: reduce)');
  let near = false;
  let visible = false;
  let loaded = false;
  let failed = false;
  let userPaused = false;
  let userStarted = false;
  let blocked = false;
  let playPending = false;
  const poster = config.media.poster;
  $('routine-poster-source').setAttribute('href', poster.src);
  $('routine-poster-source').setAttribute('width', poster.width);
  $('routine-poster-source').setAttribute('height', poster.height);
  $('routine-poster').setAttribute('viewBox', poster.crop.join(' '));
  media.style.setProperty('--routine-video-position', config.media.position);
  media.style.setProperty('--routine-video-mobile-position', config.media.mobilePosition);
  media.style.setProperty('--routine-video-grayscale', config.media.grayscale);
  video.muted = true;
  video.loop = true;
  video.playsInline = true;

  function updateToggle() {
    toggle.hidden = !config.media.video || failed;
    toggle.textContent = !video.paused ? copy().pause : copy().play;
    toggle.setAttribute('aria-label', toggle.textContent);
  }
  function shouldPlay() {
    return visible && !document.hidden && !document.querySelector('dialog[open]') && !failed && !userPaused && (!reduced.matches || userStarted);
  }
  function syncVideo() {
    if (!config.media.video || failed) return;
    if (!loaded && near && (!reduced.matches || userStarted)) {
      loaded = true;
      video.src = config.media.video;
      video.preload = 'metadata';
      video.load();
    }
    if (!shouldPlay()) video.pause();
    else if (loaded && !blocked && !playPending && video.paused) {
      playPending = true;
      video.play().then(() => {
        if (!shouldPlay()) video.pause();
      }).catch(error => {
        if (error.name !== 'AbortError') { blocked = true; media.dataset.state = 'blocked'; }
      }).finally(() => { playPending = false; updateToggle(); });
    }
    updateToggle();
  }
  video.addEventListener('playing', () => {
    if (!shouldPlay()) { video.pause(); return; }
    video.hidden = false;
    media.dataset.state = 'video';
    updateToggle();
  });
  video.addEventListener('pause', updateToggle);
  video.addEventListener('error', () => {
    failed = true; video.hidden = true; media.dataset.state = 'fallback'; updateToggle();
  });
  toggle.addEventListener('click', () => {
    if (!video.paused) userPaused = true;
    else { userPaused = false; userStarted = true; blocked = false; }
    syncVideo();
  });
  new IntersectionObserver(entries => { near = entries[0].isIntersecting; syncVideo(); }, {rootMargin:'250px'}).observe(media);
  new IntersectionObserver(entries => { visible = entries[0].isIntersecting; syncVideo(); }, {threshold:0}).observe(media);
  document.addEventListener('visibilitychange', syncVideo);
  reduced.addEventListener('change', () => { userStarted = false; if (reduced.matches) video.hidden = true; syncVideo(); });
  new MutationObserver(syncVideo).observe(document.body, {subtree:true, attributes:true, attributeFilter:['open']});

  for (const kind of ['order', 'how']) {
    const button = $(`routine-${kind}`);
    const target = config.actions[kind].url;
    if (target) {
      button.href = target;
      button.removeAttribute('aria-haspopup');
    } else {
      button.addEventListener('click', event => {
        event.preventDefault();
        returnFocus = button;
        returnPosition = scrollY;
        dialogKind = kind;
        renderDialog();
        dialog.showModal();
        document.documentElement.style.overflow = 'hidden';
      });
    }
  }
  dialog.querySelectorAll('.routine-dialog-close,.routine-dialog-done').forEach(button => button.addEventListener('click', () => dialog.close()));
  dialog.addEventListener('click', event => {
    const r = dialog.getBoundingClientRect();
    if (event.target === dialog && (event.clientX < r.left || event.clientX > r.right || event.clientY < r.top || event.clientY > r.bottom)) dialog.close();
  });
  dialog.addEventListener('close', () => {
    document.documentElement.style.overflow = '';
    window.scrollTo({top:returnPosition, behavior:'instant'});
    returnFocus?.focus({preventScroll:true});
    dialogKind = null;
  });
  function translate() {
    const text = copy();
    $('routine-title').innerHTML = text.title.map(line => `<span>${escape(line)}</span>`).join('');
    $('routine-benefits').innerHTML = text.benefits.map(line => `<li>${line.map(part => part.strong ? `<strong>${escape(part.text)}</strong>` : escape(part.text)).join('')}</li>`).join('');
    $('routine-notes').innerHTML = text.notes.map(note => `<p>${escape(note)}</p>`).join('');
    $('routine-order').textContent = text.orderLabel;
    $('routine-how').textContent = text.howLabel;
    if ($('routine-video-hint')) {
      $('routine-video-hint').textContent = text.videoHint;
      $('routine-how').setAttribute('aria-describedby', 'routine-video-hint');
    }
    $('routine-poster').setAttribute('aria-label', text.imageAlt);
    renderDialog();
    updateToggle();
  }
  window.addEventListener('kpro:language', translate);
  translate();
})();
