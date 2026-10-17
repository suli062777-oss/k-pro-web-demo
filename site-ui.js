(() => {
  const config = window.KPRO_CONTENT.siteUI;
  if (!config) return;
  const $ = selector => document.querySelector(selector);
  let lang = config.defaultLanguage;
  try {
    const requested = new URLSearchParams(location.search).get('lang');
    const saved = localStorage.getItem(config.storageKey);
    if (['en','zh'].includes(requested)) lang = requested;
    else if (['en','zh'].includes(saved)) lang = saved;
  } catch {}
  const setText = (selector, value) => { const node = $(selector); if (node && value != null) node.textContent = value; };
  function apply(next, persist = true, syncURL = true) {
    if (!['en', 'zh'].includes(next)) return;
    if (syncURL) { const url = new URL(location.href); url.searchParams.set('lang', next); history.replaceState(history.state, '', url); }
    lang = next; window.KPRO_LANGUAGE = lang;
    document.documentElement.lang = lang === 'zh' ? 'zh-CN' : 'en';
    const copy = config.translations[lang];
    $('.site-brand')?.setAttribute('aria-label', copy.homeLabel);
    $('#site-section-links')?.setAttribute('aria-label', copy.navLabel);
    document.querySelectorAll('[data-app-download]').forEach(button => { const item = window.KPRO_CONTENT.app.downloads.find(item => item.id === button.dataset.appDownload); button.setAttribute('aria-label', copy.appAvailabilityLabel.replace('{platform}', item.label)); });
    if (persist) { try { localStorage.setItem(config.storageKey, lang); } catch {} }
    document.querySelectorAll('[data-site-language]').forEach(button => button.setAttribute('aria-pressed', String(button.dataset.siteLanguage === lang)));
    document.querySelectorAll('[data-site-copy]').forEach(node => node.textContent = copy[node.dataset.siteCopy] || node.textContent);
    Object.entries(copy.copy).forEach(([selector, value]) => setText(selector, value));
    const hero = $('.hero-cta'); if (hero) hero.firstChild.textContent = copy.heroExplore + ' ';
    const scroll = $('.scroll-cue'); if (scroll) scroll.firstChild.textContent = copy.scroll + ' ';
    document.querySelectorAll('.receipt').forEach((receipt, i) => {
      const spec = copy.receipts[i]; if (!spec) return;
      receipt.querySelector('h3').textContent = spec.title;
      const existing = [...receipt.querySelectorAll('p')];
      // Use the same paragraph grouping as app.js; whitespace is retained by CSS.
      existing.forEach((p, index) => p.textContent = spec.lines[index] || '');
    });
    document.querySelectorAll('#faq-list details').forEach((detail, i) => { detail.querySelector('summary').textContent = copy.faq[i].q; detail.querySelector('p').textContent = copy.faq[i].a; });
    const foot = document.querySelectorAll('.closing footer nav a, .closing footer nav button[data-follow="Contact"]');
    foot.forEach((node, i) => { if (copy.footer[i]) node.textContent = copy.footer[i]; });
    window.KPRO_CONTENT.app.pendingMessage = copy.pending;
    const status = $('#app-download-status'); if (status) { status.hidden = true; status.textContent = ''; }
    setText('#follow-title', copy.modalTitle);
    const done = $('.dialog-done'); if (done) done.firstChild.textContent = copy.modalDone + ' ';
    setText('.skip-link', lang === 'zh' ? '跳到正文' : 'Skip to content');
    updateMenu();
    window.dispatchEvent(new CustomEvent('kpro:language', { detail: { lang } }));
  }
  document.querySelectorAll('[data-site-language]').forEach(button => button.addEventListener('click', () => apply(button.dataset.siteLanguage)));
  document.querySelectorAll('[data-follow]').forEach(button => button.addEventListener('click', () => {
    const copy = config.translations[lang];
    setText('#follow-message', button.dataset.follow === 'Contact' ? copy.contact : copy.follow.replace('{platform}', button.dataset.follow));
  }));
  const menu = $('#site-menu-toggle'), nav = $('#site-section-links');
  let menuOpen = false;
  function updateMenu() {
    if (!menu || !nav) return;
    menu.setAttribute('aria-expanded', String(menuOpen));
    menu.querySelector('span').textContent = config.translations[lang][menuOpen ? 'navClose' : 'navMenu'];
    $('.site-header').classList.toggle('menu-open', menuOpen);
    nav.inert = matchMedia('(max-width: 800px)').matches && !menuOpen;
  }
  function closeMenu(restoreFocus = false) { menuOpen = false; updateMenu(); if (restoreFocus) menu?.focus({preventScroll:true}); }
  menu?.addEventListener('click', () => { menuOpen = !menuOpen; updateMenu(); });
  nav?.addEventListener('click', event => { if (event.target.closest('a')) closeMenu(); });
  document.addEventListener('click', event => { if (menuOpen && !$('.site-header').contains(event.target)) closeMenu(); });
  document.addEventListener('keydown', event => { if (menuOpen && event.key === 'Escape') { event.preventDefault(); closeMenu(true); } });
  document.addEventListener('focusin', event => { if (menuOpen && !$('.site-header').contains(event.target)) closeMenu(); });
  addEventListener('resize', () => { if (!matchMedia('(max-width: 800px)').matches) menuOpen = false; updateMenu(); });
  addEventListener('popstate', () => { const next = new URL(location.href).searchParams.get('lang'); if (next && next !== lang) apply(next, true, false); });
  let navFrame = 0;
  const sections = [...document.querySelectorAll('main section[id]')];
  function updateActive() {
    navFrame = 0;
    const threshold = $('.site-header').offsetHeight + Math.min(innerHeight * .25, 180);
    let id = 'routine';
    for (const section of sections) { if (section.getBoundingClientRect().top <= threshold) id = section.id; }
    if (id === 'home') id = 'routine';
    nav?.querySelectorAll('a').forEach(link => { if (link.hash === '#' + id) link.setAttribute('aria-current','location'); else link.removeAttribute('aria-current'); });
  }
  function scheduleNav() { if (!navFrame) navFrame = requestAnimationFrame(updateActive); }
  addEventListener('scroll',scheduleNav,{passive:true}); addEventListener('resize',scheduleNav,{passive:true});
  new ResizeObserver(scheduleNav).observe(document.querySelector('main'));
  apply(lang, false); scheduleNav();
})();
