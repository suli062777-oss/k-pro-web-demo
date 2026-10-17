/* Browser QA only: this file is not loaded by the production homepage. */
(() => {
  const mode = new URLSearchParams(location.search).get('mode') || 'normal';
  window.KPRO_CONTENT.productAnatomy.tourIntervalMs = 850;
  if (mode === 'failed-model') window.KPRO_CONTENT.productAnatomy.model = 'assets/anatomy/intentional-missing-test.glb';
  if (mode === 'no-webgl') { const getContext = HTMLCanvasElement.prototype.getContext; HTMLCanvasElement.prototype.getContext = function(type, ...args) { return !this.id && /webgl/.test(type) ? null : getContext.call(this,type,...args); }; }
  const delay = ms => new Promise(resolve => setTimeout(resolve, ms));
  const until = async (predicate, name, timeout = 30000) => { const end = performance.now() + timeout; while (!predicate()) { if (performance.now() > end) throw Error('Timeout: ' + name); await delay(80); } };
  document.addEventListener('DOMContentLoaded', () => {
    const button = document.createElement('button');button.id = 'anatomy-run';button.textContent = '运行产品验收';
    Object.assign(button.style, {position:'fixed',bottom:'6px',right:'6px',zIndex:1000,background:'#fff',color:'#111',border:'1px solid #aaa',padding:'10px',fontSize:'12px'});
    const output = document.createElement('pre');output.id='anatomy-results';output.hidden=true;
    document.body.append(button,output);
    button.onclick = async () => {
      button.disabled=true;
      const result = {mode,viewport:[innerWidth,innerHeight],result:'running',checks:[]};
      const check = (name,pass,detail) => {result.checks.push({name,pass:!!pass,...(detail ? {detail}: {})});if(!pass)throw Error(name);};
      const $ = s => document.querySelector(s);
      const canvas = () => $('.pod-stage canvas');
      const top = () => { $('#product').scrollIntoView({behavior:'instant',block:'start'}); };
      const choose = async id => { $(`[data-station-id="${id}"]`).click();await until(()=>$('.pod-shell').dataset.station===id,id);await delay(1800); };
      const setLanguage = async lang => { $(`[data-site-language="${lang}"]`).click();await delay(100); };
      try {
        top(); await until(()=>$('.pod-shell')?.dataset.state===(mode==='normal'?'ready':'fallback'),'model readiness');
        await delay(1800); top();
        check('Old photo hotspot explorer removed',!$('.product-explorer') && !$('#hotspots'));
        check('One fixed opaque white header',document.querySelectorAll('.site-header').length===1 && getComputedStyle($('.site-header')).position==='fixed' && getComputedStyle($('.site-header')).backgroundColor==='rgb(255, 255, 255)');
        check('Six reference features available',document.querySelectorAll('.pod-feat').length===6);
        await setLanguage('zh');
        check('Chinese updates product and world',$('#product-title').textContent.includes('独家功能') && $('#settings-title').textContent==='四场景小世界' && document.documentElement.lang==='zh-CN');
        check('Chinese updates rest of site',$('#readiness-title').textContent==='开始之前。' && $('#app-title').textContent.includes('你的护理'));
        await setLanguage('en');
        check('English updates product and world',$('#product-title').textContent.includes('exclusive') && $('#settings-title').textContent==='Four-scene mini world');
        if(mode==='normal') {
          check('Local model loaded',!!canvas());
          for(const id of ['washdiag','ends','care','dry','structure','exploded']) {
            await choose(id);
            check(id+' selection updates model',canvas().dataset.station===id && $(`[data-station-id="${id}"]`).getAttribute('aria-pressed')==='true');
            const fit=JSON.parse(canvas().dataset.fit);
            check(id+' target fits viewport',fit.left>=-1 && fit.right<=1 && fit.top<=1 && fit.bottom>=-1,fit);
          }
          $('.pod-ctl-round[title="Back to overview"]').click();await delay(1800);
          check('Reset returns assembled state',$('.pod-shell').dataset.station==='overview' && $('.pod-shell').dataset.explode==='0');
          const slider=$('.pod-ctl-slider input');
          Object.getOwnPropertyDescriptor(HTMLInputElement.prototype,'value').set.call(slider,'50');slider.dispatchEvent(new Event('input',{bubbles:true}));slider.dispatchEvent(new Event('change',{bubbles:true}));
          await until(()=>$('.pod-shell').dataset.explode==='0.5','slider');
          check('Explosion slider changes continuously',$('.pod-ctl-pct').textContent==='50%');
          $('.pod-ctl-round[title="Back to overview"]').click();await delay(1800);
          const angle=Number(canvas().dataset.angle), y=scrollY;
          canvas().dispatchEvent(new KeyboardEvent('keydown',{key:'ArrowRight',bubbles:true,cancelable:true}));await delay(200);
          check('Keyboard orbit scoped to canvas',Number(canvas().dataset.angle)!==angle && scrollY===y);
          const wheel=new WheelEvent('wheel',{deltaY:100,bubbles:true,cancelable:true});canvas().dispatchEvent(wheel);
          check('Ordinary wheel does not prevent page scroll',!wheel.defaultPrevented);
          $('.pod-left-foot button').click();await delay(950);
          check('Guided tour advances',$('.pod-shell').dataset.tour==='true' && $('.pod-shell').dataset.station!=='overview');
          canvas().dispatchEvent(new KeyboardEvent('keydown',{key:'ArrowLeft',bubbles:true,cancelable:true}));await delay(100);
          check('User orbit stops tour',$('.pod-shell').dataset.tour==='false');
          $('#home').scrollIntoView({behavior:'instant'});await delay(300);
          const frames=canvas().dataset.frames;await delay(200);
          check('Offscreen scene stops rendering',$('.pod-shell').dataset.active==='false' && canvas().dataset.frames===frames);
        } else {
          check('Failed model has usable fallback',$('.pod-error img').getAttribute('src')===window.KPRO_CONTENT.productAnatomy.fallbackImage);
          await choose('care');check('Feature descriptions remain usable',$('.pod-shell').dataset.station==='care');
          check('Unavailable 3D controls are disabled',[...document.querySelectorAll('.pod-ctl button, .pod-ctl input')].every(b=>b.disabled));
          check('Retry remains available',!!$('.pod-error button') && !$('.pod-error button').disabled);
        }
        for(const id of ['home','settings','product','app','readiness','closing']) {
          $('#'+id).scrollIntoView({behavior:'instant'});await delay(100);
          const header=$('.site-header').getBoundingClientRect();
          check('Header stays fixed at '+id,Math.abs(header.top)<1 && header.left>=0 && header.right<=innerWidth);
        }
        $('#settings').scrollIntoView({behavior:'instant'});await until(()=>$('#world-stage').dataset.state==='ready','world readiness');
        for(const id of ['home','ward','garden','salon']) {
          $(`[data-world-choice="${id}"]`).click();await until(()=>$('#scene-dialog').open,'open '+id);
          await until(()=>$('#space-stage').dataset.state==='ready','pano '+id,15000);
          check(id+' panorama entry retained',$('#scene-dialog').open && $('#space-canvas').dataset.source.includes('/'+id) && $('#space-fallback').getAttribute('src')===window.KPRO_CONTENT.spaces.scenes[id].cover);
          $('#scene-dialog .dialog-close').click();await delay(120);
        }
        top();await delay(200);
        check('No page horizontal overflow',document.documentElement.scrollWidth<=innerWidth);
        const ctl=$('.pod-ctl').getBoundingClientRect();check('Controls fit their stage width',ctl.left>=0 && ctl.right<=innerWidth);
        check('Background remains fixed',getComputedStyle($('#site-background')).position==='fixed');
        check('Brand soft focus retained',getComputedStyle($('.hero-wordmark')).filter!=='none');
        result.result='pass';
      } catch(error) {result.result='fail';result.error=error.message;}
      output.textContent=JSON.stringify(result,null,2);output.dataset.result=result.result;
      output.hidden=false;Object.assign(output.style,{position:'fixed',inset:'100px 20px 60px',zIndex:999,overflow:'auto',background:'#fff',color:'#111',fontSize:'11px'});
      button.textContent=result.result==='pass'?'产品验收通过':'产品验收失败';button.disabled=false;
    };
  });
})();
