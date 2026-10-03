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
  text('.nav-left', content.navigation.left);
  $('.nav-left').href = content.navigation.leftTarget;
  $('#receipt-strip').innerHTML = content.receipts.map(item => `<article class="receipt" style="--rotation:${Number(item.rotation)}deg"><h3>${escape(item.title)}</h3><div class="receipt-divider" aria-hidden="true">${escape(item.divider)}</div>${item.lines.map(line=>`<p>${escape(line)}</p>`).join('')}</article>`).join('');

  const sceneStrip = $('#scene-strip');
  let activeScene = 'bedside';
  sceneStrip.innerHTML = content.scenes.map(scene => {
    const expanded = scene.id === activeScene;
    const thumb = `<button type="button" class="scene-thumb" data-scene-toggle="${escape(scene.id)}" aria-expanded="${expanded}" aria-controls="scene-${escape(scene.id)}" aria-label="Explore ${escape(scene.label)}"><img src="${escape(scene.image)}" alt="${escape(scene.label)} island illustration" width="200" height="200" loading="lazy"></button>`;
    const heading = `<h3>${escape(scene.label)}</h3><p class="scene-subtitle">${escape(scene.title)}</p><div class="scene-rule" aria-hidden="true"></div>`;
    const paragraphs = scene.paragraphs.map(p=>`<p class="scene-copy">${escape(p)}</p>`).join('');
    const note = scene.position === 'top' ? thumb + heading + paragraphs : scene.position === 'middle' ? heading + thumb + paragraphs : heading + paragraphs + thumb;
    return `<article class="scene-card ${expanded?'is-expanded':''}" data-scene="${escape(scene.id)}" style="--rotation:${Number(scene.rotation)}deg"><div class="scene-note">${note}</div><div class="scene-panorama" id="scene-${escape(scene.id)}" aria-hidden="${!expanded}" ${expanded?'':'inert'}><img src="${escape(scene.image)}" alt="${escape(scene.label)} scene detail" loading="lazy"><button class="scene-panorama-button" type="button" data-scene-preview="${escape(scene.id)}"><span>Explore the scene <span aria-hidden="true">↗</span></span></button></div></article>`;
  }).join('');
  sceneStrip.addEventListener('click', event => {
    const toggle = event.target.closest('[data-scene-toggle]');
    if (toggle) {
      activeScene = activeScene === toggle.dataset.sceneToggle ? null : toggle.dataset.sceneToggle;
      $$('.scene-card').forEach(card => {
        const expanded = card.dataset.scene === activeScene;
        card.classList.toggle('is-expanded', expanded);
        $('.scene-thumb', card).setAttribute('aria-expanded', String(expanded));
        const panel = $('.scene-panorama', card);
        panel.setAttribute('aria-hidden', String(!expanded));
        panel.inert = !expanded;
      });
    }
    const preview = event.target.closest('[data-scene-preview]');
    if (preview) {
      const scene = content.scenes.find(s=>s.id===preview.dataset.scenePreview);
      text('#scene-dialog-title', scene.label);
      $('#scene-dialog-image').src = scene.image;
      $('#scene-dialog-image').alt = scene.label + ' island illustration';
      openDialog($('#scene-dialog'));
    }
  });

  $('#hotspots').innerHTML = content.hotspots.map((item,i)=>`<button class="hotspot" type="button" data-detail="${i}" style="left:${Number(item.x)}%;top:${Number(item.y)}%" aria-label="${i+1}. ${escape(item.title)}" aria-pressed="${i===0}" aria-controls="detail-body-${i}">${i+1}</button>`).join('');
  $('#product-rows').innerHTML = content.hotspots.map((item,i)=>`<div class="detail-item"><h3><button class="detail-title" type="button" data-detail="${i}" id="detail-title-${i}" aria-expanded="${i===0}" aria-controls="detail-body-${i}"><span>0${i+1}</span>${escape(item.title)}</button></h3><p class="detail-body" id="detail-body-${i}" aria-labelledby="detail-title-${i}" ${i===0?'':'hidden'}>${escape(item.body)}</p></div>`).join('');
  $('.product-explorer').addEventListener('click', event => {
    const button = event.target.closest('[data-detail]');
    if (!button) return;
    const index = Number(button.dataset.detail);
    $$('.hotspot').forEach((item,i)=>item.setAttribute('aria-pressed', String(i===index)));
    $$('.detail-title').forEach((item,i)=>item.setAttribute('aria-expanded', String(i===index)));
    $$('.detail-body').forEach((item,i)=>{ item.hidden = i!==index; });
  });

  text('#app-title', content.app.title);
  text('#app-chinese', content.app.chinese);
  text('#app-intro', content.app.intro);
  $('#app-features').innerHTML = content.app.features.map((feature,i)=>`<li><span>0${i+1}</span>${escape(feature)}</li>`).join('');
  $('#faq-list').innerHTML = content.faq.map((item,i)=>`<details><summary id="faq-question-${i}">${escape(item.q)}</summary><p aria-labelledby="faq-question-${i}">${escape(item.a)}</p></details>`).join('');
  text('#closing-title',content.closing.title);
  text('#closing-chinese',content.closing.chinese);

  // Modal dialogs keep native focus trapping and Escape support.
  let modalTrigger = null;
  function openDialog(dialog) {
    modalTrigger = document.activeElement;
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
      if (modalTrigger?.isConnected) modalTrigger.focus({preventScroll:true});
    });
  });
  $$('[data-follow]').forEach(button=>button.addEventListener('click',()=>{
    text('#follow-message',button.dataset.follow === 'Contact' ? 'K pro is taking shape. Our official contact details will be shared here as the project develops.' : 'Our official '+button.dataset.follow+' channel will be shared here. In the meantime, discover what K pro is all about.');
    openDialog($('#follow-dialog'));
  }));

  // Scale the wrapper transform, preserving the source SVG root dimensions.
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
