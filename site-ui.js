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
  function apply(next, persist = true) {
    lang = next; window.KPRO_LANGUAGE = lang;
    document.documentElement.lang = lang === 'zh' ? 'zh-CN' : 'en';
    const copy = config.translations[lang];
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
    window.dispatchEvent(new CustomEvent('kpro:language', { detail: { lang } }));
  }
  document.querySelectorAll('[data-site-language]').forEach(button => button.addEventListener('click', () => apply(button.dataset.siteLanguage)));
  document.querySelectorAll('[data-follow]').forEach(button => button.addEventListener('click', () => {
    const copy = config.translations[lang];
    setText('#follow-message', button.dataset.follow === 'Contact' ? copy.contact : copy.follow.replace('{platform}', button.dataset.follow));
  }));
  apply(lang, false);
})();
