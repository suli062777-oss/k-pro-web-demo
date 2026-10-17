(() => {
  'use strict';
  const config = window.KPRO_CONTENT?.pricing;
  const root = document.querySelector('#pricing');
  if (!root || !config) return;
  const esc = value => String(value).replace(/[&<>"']/g, c => ({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));
  const text = () => config.translations[window.KPRO_LANGUAGE || 'en'] || config.translations.en;
  const money = value => '¥' + new Intl.NumberFormat('en-US').format(value);
  const price = config.prices;
  const q = selector => root.querySelector(selector);
  const qa = selector => [...root.querySelectorAll(selector)];
  const reduced = matchMedia('(prefers-reduced-motion: reduce)');
  const routes = { '#pricing':'overview', '#pricing-demo':'demo', '#pricing-online':'online', '#pricing-plans':'plans', '#pricing-refills':'refills', '#pricing-specs':'specs' };
  let state = 'overview', selectedImage = 0, accordion = 'description', submitted = false;
  let headerFrame = 0;
  let settleAnchor = Boolean(routes[location.hash]);
  const field = (key, input) => `<label class="price-field"><span data-p-copy="${key}"></span>${input}</label>`;
  const action = (key, target, primary = false) => `<button type="button" class="price-button${primary ? ' is-primary' : ''}" data-price-view="${target}" data-p-copy="${key}"></button>`;
  const accordionItem = (id, body) => `<div class="price-accordion-item" data-accordion="${id}"><h3><button type="button" id="price-${id}-toggle" data-price-accordion="${id}" aria-expanded="false" aria-controls="price-${id}-body"><span data-p-copy="${id}"></span><i aria-hidden="true"></i></button></h3><div class="price-accordion-body" id="price-${id}-body" role="region" aria-labelledby="price-${id}-toggle" aria-hidden="true" inert><div>${body}</div></div></div>`;
  const description = `<p data-p-copy="descriptionText"></p><p class="price-strong" data-p-copy="descriptionStrong"></p><p data-p-copy="descriptionEnd"></p>`;
  const refills = `<h4 data-p-copy="refillTitle"></h4><p data-p-copy="refillIntro"></p><dl class="price-refill-table"><div><dt data-p-copy="refillFormula"></dt><dd>${money(price.refill)} <span data-p-copy="perUse"></span></dd></div><div><dt data-p-copy="refillAccessories"></dt><dd data-p-copy="refillOptions"></dd></div><div><dt data-p-copy="refillCleaning"></dt><dd data-p-copy="refillGuide"></dd></div></dl><p class="price-muted" data-p-copy="refillNote"></p><button type="button" class="price-text-link" data-price-enquire><span data-p-copy="refillEnquire"></span> <span aria-hidden="true">→</span></button>`;
  const specs = `<table class="price-spec-table"><tbody id="price-spec-rows"></tbody></table><p class="price-muted" data-p-copy="specNote"></p>`;
  root.innerHTML = `
    <nav class="price-breadcrumb" aria-label="Breadcrumb"><a href="#home" data-p-copy="homeCrumb"></a><span aria-hidden="true">›</span><button type="button" data-price-view="overview" id="price-crumb-parent"></button><span aria-hidden="true">›</span><strong id="price-crumb-current"></strong></nav>
    <div class="pricing-grid">
      <div class="pricing-gallery">
        <div class="price-photo-frame" id="price-gallery" role="group" tabindex="0">
          <div class="price-photo" id="price-photo"></div>
          <button type="button" class="price-image-arrow previous" data-price-image="-1"><span aria-hidden="true">‹</span></button>
          <button type="button" class="price-image-arrow next" data-price-image="1"><span aria-hidden="true">›</span></button>
        </div>
        <div class="price-thumbnails" id="price-thumbnails"></div>
        <div class="price-experience-caption" hidden><h3 data-p-copy="experienceTitle"></h3><p data-p-copy="experienceIntro"></p></div>
      </div>
      <div class="pricing-content">
        <div class="price-view" data-view="overview">
          <h2 class="price-product-title" id="price-overview-title" tabindex="-1" data-p-copy="title"></h2>
          <p class="price-tagline" data-p-copy="tagline"></p>
          <div class="price-home-row"><span><span data-p-copy="home"></span> <strong>${money(price.home)}</strong></span><span><span data-p-copy="rental"></span> <strong>${money(price.homeRental)}<span data-p-copy="month"></span></strong></span></div>
          <p class="price-professional-row"><span data-p-copy="professional"></span> <span>${money(price.professional)}</span><span aria-hidden="true">·</span><span data-p-copy="rental"></span> <span>${money(price.professionalRental)}<span data-p-copy="month"></span></span></p>
          <p class="price-tax price-muted" data-p-copy="tax"></p>
          <div class="price-main-actions">${action('book','demo')}${action('plans','plans')}</div>
          <div class="price-accordions">${accordionItem('description',description)}${accordionItem('refills',refills)}${accordionItem('specifications',specs)}</div>
        </div>
        <div class="price-view" data-view="booking" hidden>
          <h2 class="price-form-title" id="price-booking-title" tabindex="-1"></h2><p class="price-view-intro" id="price-booking-intro"></p>
          <div class="price-mode-tabs" role="tablist" aria-label="Demo type"><button type="button" role="tab" id="price-demo-tab" aria-controls="price-form-panel" data-price-view="demo" data-p-copy="inPerson"></button><button type="button" role="tab" id="price-online-tab" aria-controls="price-form-panel" data-price-view="online" data-p-copy="online"></button></div>
          <div id="price-form-panel" role="tabpanel" aria-labelledby="price-demo-tab">
            <form id="price-booking-form" novalidate>
              ${field('fullName','<input name="fullName" autocomplete="name" required maxlength="100">')}
              ${field('email','<input name="email" type="email" autocomplete="email" required maxlength="254">')}
              <div data-price-field="city">${field('city','<input name="city" autocomplete="address-level2" required maxlength="100">')}</div>
              <div data-price-field="zone" hidden>${field('zone','<select name="zone"><option value="" data-p-copy="selectZone"></option>'+config.timeZones.map(z=>`<option value="${esc(z)}">${esc(z.replaceAll('_',' '))}</option>`).join('')+'</select>')}</div>
              <div class="price-date-row">${field('date','<input name="date" type="date" required>')}${field('time','<select name="time" required><option value="" data-p-copy="selectTime"></option>'+config.timeSlots.map(s=>`<option>${esc(s)}</option>`).join('')+'</select>')}</div>
              <fieldset class="price-edition"><legend data-p-copy="edition"></legend><label><input type="radio" name="edition" value="home" checked><span data-p-copy="home"></span></label><label><input type="radio" name="edition" value="professional"><span data-p-copy="professional"></span></label></fieldset>
              <label class="price-field"><span id="price-notes-label"></span><textarea name="notes" rows="2" maxlength="1000"></textarea></label>
              <p id="price-form-error" class="price-form-error" role="alert" hidden></p>
              <button type="submit" class="price-button is-primary" id="price-submit"></button>
              <p id="price-demo-notice" class="price-demo-notice"></p>
            </form>
            <div class="price-success" id="price-success" hidden><span class="price-success-icon" aria-hidden="true">✓</span><h3 id="price-success-title" tabindex="-1"></h3><p data-p-copy="successBody"></p><button type="button" class="price-button is-primary" data-price-edit data-p-copy="editRequest"></button>${action('returnOverview','overview')}</div>
          </div>
        </div>
        <div class="price-view" data-view="plans" hidden>
          <h2 class="price-plans-title" id="price-plans-title" tabindex="-1" data-p-copy="plansTitle"></h2><p class="price-view-intro" data-p-copy="plansIntro"></p>
          <div class="price-plan-columns">
            <article><h3 data-p-copy="home"></h3><p data-p-copy="homeIntro"></p><dl><dt data-p-copy="purchase"></dt><dd>${money(price.home)}</dd><dt data-p-copy="rentalLabel"></dt><dd>${money(price.homeRental)}<small data-p-copy="month"></small></dd></dl><button type="button" class="price-button is-primary" data-price-edition="home" data-p-copy="chooseHome"></button></article>
            <article><h3 data-p-copy="professional"></h3><p data-p-copy="professionalIntro"></p><dl><dt data-p-copy="purchase"></dt><dd>${money(price.professional)}</dd><dt data-p-copy="rentalLabel"></dt><dd>${money(price.professionalRental)}<small data-p-copy="month"></small></dd></dl><button type="button" class="price-button" data-price-edition="professional" data-p-copy="contactTeam"></button></article>
          </div><p class="price-plan-note price-muted" data-p-copy="plansNote"></p>
        </div>
      </div>
    </div>
    <div class="price-refill-strip" hidden><h3 data-p-copy="routineTitle"></h3><p><span data-p-copy="careRefills"></span> <strong>${money(price.refill)} <span data-p-copy="perUse"></span></strong></p><button type="button" class="price-text-link" data-price-view="refills"><span data-p-copy="exploreRefills"></span> <span aria-hidden="true">→</span></button></div>
    <p class="price-concept" data-p-copy="concept"></p>`;
  root.style.setProperty('--price-layout-ms', config.motion.layoutMs + 'ms');
  root.style.setProperty('--price-accordion-ms', config.motion.accordionMs + 'ms');
  const form = q('#price-booking-form');
  const today = new Date();
  form.elements.date.min = `${today.getFullYear()}-${String(today.getMonth()+1).padStart(2,'0')}-${String(today.getDate()).padStart(2,'0')}`;
  function svg(item, decorative = false) {
    const label = item[window.KPRO_LANGUAGE || 'en'] || item.en;
    const [x,y,width,height] = item.crop;
    const clip = `price-crop-${decorative?'thumb':'main'}-${item.id}`;
    return `<svg viewBox="${item.crop.join(' ')}" preserveAspectRatio="xMidYMid meet" ${decorative ? 'aria-hidden="true"' : `role="img" aria-label="${esc(label)}"`}><defs><clipPath id="${clip}"><rect x="${x}" y="${y}" width="${width}" height="${height}" /></clipPath></defs><image clip-path="url(#${clip})" href="${esc(config.image.src)}" width="${config.image.width}" height="${config.image.height}" /></svg>`;
  }
  function renderImage(animate = false) {
    const photo = q('#price-photo');
    photo.innerHTML = svg(config.gallery[selectedImage]);
    if (animate && !reduced.matches) photo.animate([{opacity:0,transform:'translateX(8px)'},{opacity:1,transform:'translateX(0)'}],{duration:config.motion.viewMs,easing:'ease-out'});
    qa('[data-price-thumb]').forEach((b,i) => b.setAttribute('aria-pressed',String(i===selectedImage)));
  }
  function changeImage(index) { selectedImage = (index + config.gallery.length) % config.gallery.length; renderImage(true); }
  function setAccordion(next) {
    accordion = next;
    qa('[data-accordion]').forEach(item => {
      const open = item.dataset.accordion === next;
      item.classList.toggle('is-open',open);
      item.querySelector('button').setAttribute('aria-expanded',String(open));
      const body = item.querySelector('.price-accordion-body');
      body.setAttribute('aria-hidden',String(!open)); body.inert = !open;
    });
  }
  function bookingCopy() {
    const c = text(), online = state === 'online';
    q('#price-booking-title').textContent = online ? c.onlineTitle : c.demoTitle;
    q('#price-booking-intro').textContent = online ? c.onlineIntro : c.demoIntro;
    q('#price-notes-label').textContent = online ? c.onlineNotes : c.demoNotes;
    q('#price-submit').textContent = online ? c.requestOnline : c.requestDemo;
    q('#price-demo-notice').textContent = online ? c.onlineNotice : c.demoNotice;
    q('#price-success-title').textContent = online ? c.onlineSuccessTitle : c.successTitle;
    q('[data-price-field="city"]').hidden = online;
    q('[data-price-field="zone"]').hidden = !online;
    form.elements.city.required = !online; form.elements.city.disabled = online;
    form.elements.zone.required = online; form.elements.zone.disabled = !online;
    for (const mode of ['demo','online']) {
      const button = q(`#price-${mode}-tab`), active = state === mode;
      button.setAttribute('aria-selected',String(active)); button.tabIndex = active ? 0 : -1;
    }
    q('#price-form-panel').setAttribute('aria-labelledby',online ? 'price-online-tab' : 'price-demo-tab');
    q('#price-form-error').textContent = c.formError;
  }
  function showState(next, options = {}) {
    if (next === 'refills' || next === 'specs') {
      setAccordion(next === 'refills' ? 'refills' : 'specifications');
      next = 'overview';
    }
    if (!['overview','demo','online','plans'].includes(next)) return;
    const changed = state !== next;
    state = next;
    root.dataset.state = state;
    const booking = state === 'demo' || state === 'online';
    qa('.price-view').forEach(view => { view.hidden = view.dataset.view !== (booking ? 'booking' : state); });
    q('#price-thumbnails').hidden = state !== 'overview';
    qa('.price-image-arrow').forEach(b => b.hidden = state !== 'overview');
    q('.price-experience-caption').hidden = !booking;
    q('.price-refill-strip').hidden = state !== 'plans';
    if (changed && state !== 'overview') { selectedImage = 0; renderImage(); }
    if (changed) { submitted = false; q('#price-success').hidden = true; form.hidden = false; q('#price-form-error').hidden = true; }
    bookingCopy();
    const c = text();
    q('#price-crumb-parent').textContent = state === 'overview' ? c.toolsCrumb : c.productCrumb;
    q('#price-crumb-current').textContent = state === 'overview' ? c.productCrumb : state === 'plans' ? c.plansCrumb : state === 'online' ? c.onlineCrumb : c.demoCrumb;
    const activeView = q('.price-view:not([hidden])');
    if (changed && !reduced.matches) activeView.animate([{opacity:0,transform:'translateY(12px)'},{opacity:1,transform:'translateY(0)'}], {duration:config.motion.viewMs,easing:'cubic-bezier(.2,.65,.3,1)'});
    if (options.push) {
      const hash = options.route || (state === 'overview' ? '#pricing' : `#pricing-${state}`);
      if (location.hash !== hash) history.pushState(null,'',hash);
    }
    if (options.scroll) { settleAnchor = true; root.scrollIntoView({behavior:reduced.matches?'instant':'smooth',block:'start'}); }
    if (options.focus) activeView.querySelector('h2').focus({preventScroll:true});
    scheduleHeader();
  }
  root.addEventListener('click', event => {
    const target = event.target.closest('button'); if (!target) return;
    if (target.dataset.priceView) {
      if (target.dataset.priceView === 'overview') setAccordion('description');
      showState(target.dataset.priceView,{push:true,route:target.dataset.priceView==='refills'?'#pricing-refills':undefined,scroll:true,focus:true});
    }
    if (target.dataset.priceAccordion) setAccordion(accordion === target.dataset.priceAccordion ? null : target.dataset.priceAccordion);
    if (target.dataset.priceImage) changeImage(selectedImage + Number(target.dataset.priceImage));
    if (target.dataset.priceThumb != null) changeImage(Number(target.dataset.priceThumb));
    if (target.dataset.priceEdition) {
      form.elements.edition.value = target.dataset.priceEdition;
      showState(target.dataset.priceEdition==='professional'?'online':'demo',{push:true,scroll:true,focus:true});
    }
    if (target.hasAttribute('data-price-enquire')) {
      if (!form.elements.notes.value) form.elements.notes.value = text().refillEnquire;
      showState('online',{push:true,scroll:true,focus:true});
    }
    if (target.hasAttribute('data-price-edit')) { submitted=false; q('#price-success').hidden=true; form.hidden=false; form.elements.fullName.focus({preventScroll:true}); }
  });
  q('#price-gallery').addEventListener('keydown', event => {
    if (state !== 'overview' || !['ArrowLeft','ArrowRight'].includes(event.key)) return;
    event.preventDefault(); changeImage(selectedImage+(event.key==='ArrowRight'?1:-1));
  });
  q('.price-mode-tabs').addEventListener('keydown', event => {
    if (!['ArrowLeft','ArrowRight','Home','End'].includes(event.key)) return;
    event.preventDefault();
    const next = event.key==='Home'?'demo':event.key==='End'?'online':state==='demo'?'online':'demo';
    showState(next,{push:true});q(`#price-${next}-tab`).focus({preventScroll:true});
  });
  form.addEventListener('submit', event => {
    // Deliberately no network request, storage, checkout or appointment creation.
    event.preventDefault();
    form.elements.fullName.value = form.elements.fullName.value.trim();
    form.elements.city.value = form.elements.city.value.trim();
    if (!form.reportValidity()) { q('#price-form-error').hidden=false; return; }
    q('#price-form-error').hidden=true; submitted=true; form.hidden=true; q('#price-success').hidden=false;
    q('#price-success-title').focus({preventScroll:true});
  });
  form.addEventListener('input', () => { q('#price-form-error').hidden=true; });
  function translate() {
    const c = text();
    document.querySelectorAll('[data-p-copy]').forEach(node => { if (typeof c[node.dataset.pCopy] === 'string') node.textContent = c[node.dataset.pCopy]; });
    q('#price-spec-rows').innerHTML = c.specRows.map(([label,value])=>`<tr><th scope="row">${esc(label)}</th><td>${esc(value)}</td></tr>`).join('');
    q('#price-thumbnails').innerHTML = config.gallery.map((item,i)=>`<button type="button" data-price-thumb="${i}" aria-label="${esc(item[window.KPRO_LANGUAGE||'en'] || item.en)}" aria-pressed="${selectedImage===i}">${svg(item,true)}</button>`).join('');
    q('.price-image-arrow.previous').setAttribute('aria-label',c.galleryPrevious);
    q('.price-image-arrow.next').setAttribute('aria-label',c.galleryNext);
    q('#price-gallery').setAttribute('aria-label',c.galleryLabel);
    q('#price-crumb-parent').setAttribute('aria-label',c.back);
    renderImage(); showState(state);
    if (submitted) { form.hidden=true; q('#price-success').hidden=false; }
  }
  function syncHeader() {
    headerFrame=0;
    const rect=root.getBoundingClientRect();
    const header=document.querySelector('.site-header');
    header.classList.toggle('is-pricing',rect.top<=header.offsetHeight+2 && rect.bottom>header.offsetHeight+2);
  }
  function scheduleHeader() { if (!headerFrame) headerFrame=requestAnimationFrame(syncHeader); }
  addEventListener('scroll',scheduleHeader,{passive:true});addEventListener('resize',scheduleHeader,{passive:true});
  // Lazy 3D sections above can change height after a direct #pricing load.
  // Keep that requested anchor aligned until the visitor starts interacting.
  for (const name of ['wheel','touchstart','pointerdown','keydown']) addEventListener(name,()=>{settleAnchor=false;},{passive:true});
  new ResizeObserver(()=>{
    if (settleAnchor && routes[location.hash]) root.scrollIntoView({behavior:'instant',block:'start'});
    scheduleHeader();
  }).observe(document.querySelector('main'));
  function route(scroll = true) {
    const next=routes[location.hash];if(!next) { scheduleHeader();return; }
    if(next==='overview')setAccordion('description');
    showState(next,{scroll});
  }
  document.addEventListener('click',event=>{
    const link=event.target.closest('a[href="#pricing"]');
    if(!link)return;
    event.preventDefault();setAccordion('description');showState('overview',{push:true,scroll:true,focus:true});
  });
  addEventListener('popstate',()=>route());addEventListener('hashchange',()=>route());
  window.addEventListener('kpro:language',translate);
  setAccordion('description');translate();route(true);scheduleHeader();
})();
