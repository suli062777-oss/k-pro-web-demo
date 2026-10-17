(() => {
  'use strict';
  const content = window.KPRO_CONTENT;
  if (!content) return;
  const $ = (selector, root = document) => root.querySelector(selector);
  const $$ = (selector, root = document) => Array.from(root.querySelectorAll(selector));
  const escape = value => String(value).replace(/[&<>"']/g, char => ({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[char]));
  const text = (selector, value) => { $(selector).textContent = value; };

  // Copy and image paths are kept outside the layout in content.js.
  Object.entries(content.copy || {}).forEach(([selector, value]) => {
    const element = $(selector);
    if (element) { element.textContent = value; element.classList.add('configured-copy'); }
  });
  const receiptStrip = $('#receipt-strip');
  if (receiptStrip) receiptStrip.innerHTML = content.receipts.map(item => `<article class="receipt" style="--rotation:${Number(item.rotation)}deg"><h3>${escape(item.title)}</h3><div class="receipt-divider" aria-hidden="true">${escape(item.divider)}</div>${item.lines.map(line=>`<p>${escape(line)}</p>`).join('')}</article>`).join('');

  // The full island world opens the existing, scene-matched 360° viewer directly.
  window.addEventListener('kpro:world-open', event => {
    const id = event.detail?.id;
    const space = content.spaces.scenes[id];
    if (!space) return;
    text('#scene-dialog-title', space.title);
    openDialog($('#scene-dialog'));
    window.dispatchEvent(new CustomEvent('kpro:space-open', { detail: { id } }));
  });

  text('#app-title', content.app.title);
  text('#app-intro', content.app.intro);
  $('#app-phone-image').src = content.app.image;
  $('#app-phone-image').alt = content.app.imageAlt;
  $('#app-download-actions').innerHTML = content.app.downloads.map(item => {
    const label = escape(item.label);
    return item.url
      ? `<a class="pill app-download-button" href="${escape(item.url)}" aria-label="Download for ${label}">${label}</a>`
      : `<button class="pill app-download-button" type="button" data-app-download="${escape(item.id)}" aria-label="${label} download availability">${label}</button>`;
  }).join('');
  $('#app-download-actions').addEventListener('click', event => {
    const button = event.target.closest('[data-app-download]');
    if (!button) return;
    const item = content.app.downloads.find(item => item.id === button.dataset.appDownload);
    const status = $('#app-download-status');
    status.textContent = content.app.pendingMessage.replace('{platform}', item.label);
    status.hidden = false;
  });
  $('#faq-list').innerHTML = content.faq.map((item,i)=>`<details><summary id="faq-question-${i}">${escape(item.q)}</summary><p aria-labelledby="faq-question-${i}">${escape(item.a)}</p></details>`).join('');
  text('#closing-title',content.closing.title);
  text('#closing-chinese',content.closing.chinese);

  // Modal dialogs keep native focus trapping and Escape support.
  let modalTrigger = null;
  let modalPosition = null;
  function openDialog(dialog) {
    modalTrigger = document.activeElement;
    modalPosition = { x: scrollX, y: scrollY };
    dialog.dataset.returnY = String(modalPosition.y);
    dialog.showModal();
    document.documentElement.style.overflow = 'hidden';
  }
  $$('dialog').forEach(dialog => {
    $$('.dialog-close,.dialog-done',dialog).forEach(button=>button.addEventListener('click',()=>dialog.close()));
    dialog.addEventListener('click', event => {
      const r = dialog.getBoundingClientRect();
      if (event.target===dialog && (event.clientX<r.left||event.clientX>r.right||event.clientY<r.top||event.clientY>r.bottom)) dialog.close();
    });
    dialog.addEventListener('close',()=>{
      document.documentElement.style.overflow = '';
      if (modalPosition) {
        window.scrollTo({ left: modalPosition.x, top: modalPosition.y, behavior: 'instant' });
      }
      if (modalTrigger?.isConnected) modalTrigger.focus({preventScroll:true});
    });
  });
  $$('[data-follow]').forEach(button=>button.addEventListener('click',()=>{
    text('#follow-message',button.dataset.follow === 'Contact' ? 'K pro is taking shape. Our official contact details will be shared here as the project develops.' : 'Our official '+button.dataset.follow+' channel will be shared here. In the meantime, discover what K pro is all about.');
    openDialog($('#follow-dialog'));
  }));

  // Soften only the two brand graphics, independently of the scrolling backdrop.
  ['wordmark', 'tagline'].forEach(name => {
    const slot = $('.hero-' + name);
    const effect = content.branding?.[name];
    if (!slot || !effect) return;
    if (effect.blur) slot.style.setProperty('--brand-blur', effect.blur);
    if (effect.halo) slot.style.setProperty('--brand-halo', effect.halo);
    if (Number.isFinite(effect.haloOpacity)) {
      slot.style.setProperty('--brand-halo-opacity', Math.max(0, Math.min(1, effect.haloOpacity)));
    }
  });

  // Scale the image transform, preserving the source SVG root dimensions.
  const scaleAsset = img => {
    if (!img.naturalWidth || !img.naturalHeight) return;
    const slot = img.parentElement;
    slot.style.setProperty('--asset-scale',Math.min(slot.clientWidth/img.naturalWidth,slot.clientHeight/img.naturalHeight));
  };
  const assetObserver = new ResizeObserver(entries=>entries.forEach(entry=>scaleAsset($('img',entry.target))));
  $$('[data-intrinsic]').forEach(img=>{
    img.addEventListener('load',()=>scaleAsset(img));
    scaleAsset(img);
    assetObserver.observe(img.parentElement);
  });

})();
