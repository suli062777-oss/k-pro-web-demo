// Development-only regression harness. Uses the production homepage and real
// DOM events/raycasting; does not call the renderer's private state or methods.
const uxMode = new URLSearchParams(location.search).get('mode') || 'normal';
if (uxMode === 'reduced') {
  const nativeMatch = window.matchMedia.bind(window);
  window.matchMedia = query => query.includes('prefers-reduced-motion')
    ? { matches: true, media: query, addEventListener() {}, removeEventListener() {} }
    : nativeMatch(query);
}
document.addEventListener('DOMContentLoaded', () => {
  const $ = selector => document.querySelector(selector);
  const controls = document.createElement('div');
  controls.id = 'ux-test-controls';
  controls.style.cssText = 'position:fixed;right:10px;bottom:10px;z-index:9999;display:flex;gap:8px';
  controls.innerHTML = '<button id="ux-run">运行交互回归</button><button id="ux-ui-run">运行页面流程</button><button id="ux-show">展示建筑悬停</button>';
  controls.style.flexWrap='wrap';controls.style.maxWidth='calc(100% - 20px)';controls.style.justifyContent='flex-end';
  controls.querySelectorAll('button').forEach(b => b.style.cssText='background:#fff;color:#111;border:1px solid #555;padding:12px;border-radius:6px');
  const output = document.createElement('pre'); output.id = 'ux-results';
  output.style.cssText='position:fixed;left:10px;bottom:10px;z-index:9999;background:white;color:black;font:10px monospace;max-height:100px;max-width:380px;overflow:auto';
  output.style.pointerEvents='none';output.style.maxWidth='min(380px,calc(100vw - 20px))';
  document.body.append(controls, output);
  const sleep = ms => new Promise(resolve => setTimeout(resolve, ms));
  const until = async predicate => {
    const end = performance.now() + 30000;
    while (!predicate()) { if (performance.now() > end) throw new Error('State timeout'); await sleep(50); }
  };
  const world = $('#world-canvas'), dialog = $('#scene-dialog');
  const label = id => $(`[data-world-enter="${id}"]`);
  const point = id => { const rect=world.getBoundingClientRect();return {x:rect.left+Number(label(id).dataset.buildingX),y:rect.top+Number(label(id).dataset.buildingY)}; };
  const pointer = (type,p,kind='mouse') => world.dispatchEvent(new PointerEvent(type,{pointerId:77,pointerType:kind,clientX:p.x,clientY:p.y,button:0,bubbles:true,cancelable:true}));
  const leave = () => pointer('pointerleave',{x:0,y:0});
  const scale = id => Number(label(id).dataset.hoverScale || 1);
  const prepare = async () => {
    $('#settings').scrollIntoView({behavior:'instant',block:'start'});
    await until(()=>$('#world-stage').dataset.state==='ready' && world.dataset.active==='true');
    $('[data-world-action="reset"]').click();
    await sleep(250);
  };
  const hover = async id => {
    pointer('pointermove',point(id));
    await until(()=>world.dataset.hovered===id && world.dataset.outlined===id && Math.abs(scale(id)-(uxMode==='reduced'?1:1.04))<.001);
  };
  $('#ux-show').onclick = async () => { await prepare(); await hover('home'); controls.style.display='none'; output.hidden=true; };
  $('#ux-run').onclick = async event => {
    const checks=[];event.target.disabled=true;output.dataset.result='running';
    const check=(name,pass,details)=>{checks.push({name,pass:!!pass,...(details?{details}:{})});if(!pass)throw new Error(name);};
    try {
      await prepare();
      for (const id of ['home','ward','garden','salon']) {
        await hover(id);
        check(id+' raycast hover / white outline / scale',world.style.cursor==='pointer' && label(id).classList.contains('is-highlighted'),{scale:scale(id),outline:world.dataset.outlined});
        check(id+' leaves other buildings unscaled',['home','ward','garden','salon'].filter(i=>i!==id).every(i=>Math.abs(scale(i)-1)<.001));
        leave();await until(()=>!world.dataset.outlined);
        check(id+' hover fully resets',scale(id)===1&&!label(id).classList.contains('is-highlighted'));
      }
      $('[data-world-action="pause"]').click();await sleep(250);
      await hover('home');await sleep(400);
      const angle=Number(world.dataset.angle);await sleep(250);
      check('Hover temporarily stops rotation',Math.abs(Number(world.dataset.angle)-angle)<.0001);
      leave();await sleep(300);
      check('Leaving resumes previously playing rotation',Math.abs(Number(world.dataset.angle)-angle)>.0001);
      $('[data-world-action="reset"]').click();await sleep(250);
      await hover('home');
      $('#app').scrollIntoView({behavior:'instant'});await until(()=>world.dataset.active==='false');
      await prepare();await until(()=>!world.dataset.outlined);
      check('Returning from another section clears stale highlight',!world.dataset.hovered&&!label('home').classList.contains('is-highlighted'));
      const oldCapture=world.setPointerCapture,oldRelease=world.releasePointerCapture,oldHas=world.hasPointerCapture;
      try {
        // Synthetic pointer IDs are not registered with the native browser.
        world.setPointerCapture=()=>{};world.releasePointerCapture=()=>{};world.hasPointerCapture=()=>false;
        const start=point('home'),end={x:start.x+70,y:start.y+2};
        const initial=Number(world.dataset.angle);
        pointer('pointerdown',start);pointer('pointermove',end);pointer('pointerup',end);
        world.dispatchEvent(new MouseEvent('click',{clientX:end.x,clientY:end.y,bubbles:true}));await sleep(300);
        check('Mouse drag rotates without opening a panorama',!dialog.open&&Math.abs(Number(world.dataset.angle)-initial)>.001);
        $('[data-world-action="reset"]').click();await sleep(250);
        const touchStart=point('ward'),touchEnd={x:touchStart.x+65,y:touchStart.y+2},before=Number(world.dataset.angle);
        pointer('pointerdown',touchStart,'touch');pointer('pointermove',touchEnd,'touch');pointer('pointerup',touchEnd,'touch');await sleep(250);
        check('Horizontal touch drag rotates without opening',!dialog.open&&Math.abs(Number(world.dataset.angle)-before)>.001);
        for(const id of ['home','ward','garden','salon']) {
          $('[data-world-action="reset"]').click();await sleep(200);
          const p=point(id),y=scrollY;
          world.focus({preventScroll:true});pointer('pointerdown',p,'touch');pointer('pointerup',p,'touch');
          world.dispatchEvent(new MouseEvent('click',{clientX:p.x,clientY:p.y,bubbles:true}));
          await until(()=>$('#space-stage').dataset.state==='ready');
          check(id+' single tap opens matching panorama',dialog.open&&$('#space-stage').dataset.scene===id&&$('#space-canvas').dataset.source.includes('/'+id));
          check(id+' bilingual panorama UI',$('#scene-dialog-title').textContent===window.KPRO_CONTENT.spaces.scenes[id].titleEn&&$('#space-instruction').textContent.includes('Drag')&&$('#space-instruction').getBoundingClientRect().height>0);
          dialog.querySelector('.dialog-close').click();await sleep(200);
          check(id+' return restores scroll and focus',!dialog.open&&Math.abs(scrollY-y)<2&&document.activeElement===world);
        }
      } finally {world.setPointerCapture=oldCapture;world.releasePointerCapture=oldRelease;world.hasPointerCapture=oldHas;}
      check('World does not capture ordinary page wheel',(()=>{const e=new WheelEvent('wheel',{deltaY:100,bubbles:true,cancelable:true});world.dispatchEvent(e);return!e.defaultPrevented;})());
      check('No page horizontal overflow',document.documentElement.scrollWidth<=innerWidth);
      output.dataset.result='pass';
    } catch(error){checks.push({error:error.message});output.dataset.result='fail';if(dialog.open)dialog.querySelector('.dialog-close').click();}
    output.textContent=JSON.stringify({mode:uxMode,viewport:[innerWidth,innerHeight],result:output.dataset.result,checks},null,2);
    event.target.disabled=false;
  };
  $('#ux-ui-run').onclick = async event => {
    const checks=[];event.target.disabled=true;output.dataset.result='running';
    const check=(name,pass,details)=>{checks.push({name,pass:!!pass,...(details?{details}:{})});if(!pass)throw new Error(name);};
    const geometry = () => ({y:scrollY,tab:$('.price-mode-tabs').getBoundingClientRect().top});
    const fill=(name,value)=>{const input=$(`[name="${name}"]`);input.value=value;input.dispatchEvent(new Event('input',{bubbles:true}));};
    const go=async(id)=>{$('#'+id).scrollIntoView({behavior:'instant'});await sleep(600);};
    try {
      $('[data-site-language="zh"]').click();
      check('Language updates URL and visible labels',new URL(location).searchParams.get('lang')==='zh'&&document.documentElement.lang==='zh-CN'&&$('#routine-how').textContent==='如何使用');
      $('[data-site-language="en"]').click();
      const header=$('.site-header');
      check('One persistent opaque white header',document.querySelectorAll('.site-header').length===1&&getComputedStyle(header).position==='fixed'&&getComputedStyle(header).backgroundColor==='rgb(255, 255, 255)');
      if(innerWidth<=800){
        $('#site-menu-toggle').click();
        check('Mobile menu opens and becomes keyboard-accessible',$('#site-menu-toggle').getAttribute('aria-expanded')==='true'&&!$('#site-section-links').inert);
        document.dispatchEvent(new KeyboardEvent('keydown',{key:'Escape',bubbles:true}));
        check('Escape closes menu and restores focus',$('#site-menu-toggle').getAttribute('aria-expanded')==='false'&&$('#site-section-links').inert&&document.activeElement===$('#site-menu-toggle'));
      }
      await go('product');await until(()=>['ready','fallback'].includes($('.pod-shell')?.dataset.state));
      check('Product model ready',$('.pod-shell').dataset.state==='ready');
      const buttons=[...document.querySelectorAll('.pod-feat')],descriptions=[];
      for(const button of buttons){
        button.click();await sleep(160);
        descriptions.push($('#pod-feature-description').textContent);
        check(button.textContent.trim()+' selected without duplicated explanations',button.getAttribute('aria-pressed')==='true'&&document.querySelectorAll('.pod-feat[aria-pressed="true"]').length===1&&document.querySelectorAll('.pod-feat-desc').length===0);
      }
      check('Each feature has its own explanation',new Set(descriptions).size===buttons.length);
      if(innerWidth>980)check('No nested desktop text scrolling',['.pod-left','.pod-feats'].every(s=>$(s).scrollHeight<=$(s).clientHeight+1));
      await go('app');
      $('[data-app-download="android"]').click();
      check('App availability and button feedback are explicit',!$('#app-download-status').hidden&&$('#app-download-status').textContent.length>0&&$('#app-availability').textContent.includes('Coming soon'));
      check('App and FAQ remain white',['app','readiness'].every(id=>getComputedStyle($('#'+id)).backgroundColor==='rgb(255, 255, 255)'));
      check('FAQ follows pricing',!!($('#pricing').compareDocumentPosition($('#readiness'))&Node.DOCUMENT_POSITION_FOLLOWING));
      check('How-to link retains supplied video',$('#routine-how').href.includes('bilibili.com/video/BV19oJQ69E5X/'));
      await go('pricing');$('[data-price-view="overview"]').click();await sleep(650);
      $('[data-price-view="demo"]').click();await sleep(650);
      if(innerWidth<=800)check('Mobile booking lands on form',Math.abs($('.pricing-content').getBoundingClientRect().top-header.offsetHeight-18)<3&&$('.price-photo-frame').getBoundingClientRect().height<=100);
      fill('fullName','Demo Visitor');fill('email','demo@example.com');
      $('.price-mode-tabs').scrollIntoView({behavior:'instant',block:'center'});await sleep(80);
      $('#price-online-tab').focus({preventScroll:true});const before=geometry();$('#price-online-tab').click();await sleep(450);const after=geometry();
      check('Clicking booking mode retains scroll and tab position',Math.abs(before.y-after.y)<2&&Math.abs(before.tab-after.tab)<2,{before,after});
      check('Booking mode preserves entered fields',$('[name="fullName"]').value==='Demo Visitor'&&$('[name="email"]').value==='demo@example.com');
      check('Online mode requires timezone instead of city',$('[name="city"]').disabled&&!$('[name="zone"]').disabled&&$('[name="zone"]').required);
      const beforeKey=geometry();$('#price-online-tab').dispatchEvent(new KeyboardEvent('keydown',{key:'ArrowLeft',bubbles:true,cancelable:true}));await sleep(450);
      check('Keyboard booking switch retains position',$('#pricing').dataset.state==='demo'&&Math.abs(geometry().y-beforeKey.y)<2);
      $('[data-price-view="overview"]').click();await sleep(600);$('[data-price-view="plans"]').click();await sleep(600);
      check('Plan view opens',$('#pricing').dataset.state==='plans');
      $('[data-price-view="refills"]').click();await sleep(500);
      check('Refills opens its accordion',$('#pricing').dataset.state==='overview'&&$('#price-refills-toggle').getAttribute('aria-expanded')==='true');
      $('#price-specifications-toggle').click();await sleep(350);
      check('Accordion remains mutually exclusive',$('#price-specifications-toggle').getAttribute('aria-expanded')==='true'&&$('#price-refills-toggle').getAttribute('aria-expanded')==='false');
      await go('readiness');$('#faq-list summary').click();
      check('FAQ expands',$('#faq-list details').open);
      check('No page horizontal overflow',document.documentElement.scrollWidth<=innerWidth,{width:innerWidth,scrollWidth:document.documentElement.scrollWidth});
      output.dataset.result='pass';
    }catch(error){checks.push({error:error.message});output.dataset.result='fail';}
    output.textContent=JSON.stringify({suite:'page-flow',viewport:[innerWidth,innerHeight],result:output.dataset.result,checks},null,2);event.target.disabled=false;
  };
});
