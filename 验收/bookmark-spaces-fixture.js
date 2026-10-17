/* Acceptance-only UI harness; never included by index.html. */
const mode = new URLSearchParams(location.search).get('mode') || 'normal';
const originalWardSource = window.KPRO_CONTENT.spaces.scenes.ward.src;
if (mode === 'failed-space') window.KPRO_CONTENT.spaces.scenes.ward.src = 'assets/spaces/intentional-missing.glb';
if (mode === 'no-webgl') {
  const original = HTMLCanvasElement.prototype.getContext;
  HTMLCanvasElement.prototype.getContext = function(kind, ...args) {
    return this.id === 'space-canvas' && /webgl/.test(kind) ? null : original.call(this, kind, ...args);
  };
}
document.addEventListener('DOMContentLoaded', () => {
  const button = document.createElement('button'); button.id = 'run-bookmark-audit'; button.textContent = '运行书签与空间验收';
  button.style.cssText = 'position:fixed;top:8px;right:8px;z-index:99999;padding:10px;background:#fff;color:#111;border:1px solid';
  const report = document.createElement('pre'); report.id = 'bookmark-audit-report';
  report.style.cssText = 'position:fixed;bottom:0;right:0;z-index:99999;max-width:500px;max-height:160px;overflow:auto;background:white;color:black;font:11px monospace';
  document.body.append(button,report);
  const wait = ms => new Promise(resolve=>setTimeout(resolve,ms));
  async function until(predicate, timeout=20000) { const start=performance.now(); while(!predicate()){if(performance.now()-start>timeout)throw new Error('Timed out');await wait(60);} }
  button.onclick = async () => {
    button.disabled=true;
    const result={mode,viewport:[innerWidth,innerHeight],checks:[],failures:[],scenes:[]};
    const check=(name,passed,detail)=>{result.checks.push({name,passed,detail});if(!passed)result.failures.push(name);};
    const $=s=>document.querySelector(s), $$=s=>[...document.querySelectorAll(s)];
    try {
      check('Initial four collapsed horizontal bookmarks',$$('.scene-card').length===4&&!$('.scene-card.is-expanded')&&getComputedStyle($('#scene-strip')).flexDirection==='row');
      const notes=$$('.scene-note').map(el=>el.offsetWidth);
      const ids=mode==='normal'?['home','ward','garden','salon']:['ward'];
      for(const id of ids){
        report.textContent='Checking '+id+'…';
        const thumb=$(`[data-scene-toggle="${id}"]`),card=$(`.scene-card[data-scene="${id}"]`),entry=$(`[data-scene-preview="${id}"]`);
        thumb.scrollIntoView({block:'center',inline:'center',behavior:'instant'});thumb.focus({preventScroll:true});thumb.click();await wait(1200);
        check(id+' exclusive right expansion',$$('.scene-card.is-expanded').length===1&&card.classList.contains('is-expanded')&&$$('.scene-note').every((el,i)=>el.offsetWidth===notes[i])&&$$('.scene-card:not(.is-expanded)').every(el=>el.offsetWidth===notes[0]));
        const panel=$('#scene-'+id),note=card.querySelector('.scene-note');
        check(id+' preview right of fixed note',Math.abs(panel.getBoundingClientRect().left-note.getBoundingClientRect().right)<2);
        await until(()=>entry.querySelector('img').complete&&entry.querySelector('img').naturalWidth>0);
        entry.scrollIntoView({block:'center',inline:'center',behavior:'instant'});entry.focus({preventScroll:true});await wait(50);
        const before={y:scrollY,rail:$('#scene-viewport').scrollLeft};entry.click();
        await until(()=>['ready','fallback'].includes($('#space-stage').dataset.state));
        const actual=$('#space-stage').dataset.state;
        if(mode==='normal'){
          check(id+' corresponding indoor scene ready',actual==='ready'&&$('#space-stage').dataset.scene===id);
          const rect=$('#scene-dialog').getBoundingClientRect();
          check(id+' full viewport',Math.abs(rect.width-innerWidth)<2&&Math.abs(rect.height-innerHeight)<2);
          const start=Number($('#space-canvas').dataset.distance);
          $('[data-space-action="in"]').click();await wait(80);
          check(id+' zoom',Number($('#space-canvas').dataset.distance)<start);
          $('[data-space-action="reset"]').click();await wait(80);
          check(id+' reset',Math.abs(Number($('#space-canvas').dataset.distance)-start)<.0001);
        }else{
          check(mode+' shows usable fallback',actual==='fallback'&&$('#space-fallback').complete&&!$('#space-stage').classList.contains('is-ready')&&!$('[data-space-action="retry"]').hidden);
          if(mode==='failed-space'){
            window.KPRO_CONTENT.spaces.scenes.ward.src=originalWardSource;
            $('[data-space-action="retry"]').click();
            await until(()=>$('#space-stage').dataset.state==='ready');
            check('Retry succeeds when resource recovers',$('#space-stage').dataset.scene==='ward');
          }
        }
        $('#scene-dialog .dialog-close').click();await wait(120);
        const after={y:scrollY,rail:$('#scene-viewport').scrollLeft,focus:document.activeElement.dataset.scenePreview};
        check(id+' return restores card, scroll and focus',!$('#scene-dialog').open&&card.classList.contains('is-expanded')&&Math.abs(after.y-before.y)<2&&Math.abs(after.rail-before.rail)<2&&after.focus===id,{before,after});
        thumb.click();await wait(650);check(id+' repeat island click collapses',!$('.scene-card.is-expanded'));
        result.scenes.push({id,state:actual,cover:entry.querySelector('img').getAttribute('src')});
        check(id+' no document horizontal overflow',document.documentElement.scrollWidth===innerWidth);
      }
      $('[data-scene-toggle="home"]').click();await wait(650);$('[data-scene-toggle="salon"]').click();await wait(650);
      check('Switching is exclusive',$$('.scene-card.is-expanded').length===1&&$('.scene-card.is-expanded').dataset.scene==='salon');
      $('[data-scene-toggle="salon"]').click();await wait(650);
      const bg=$('.site-background').getBoundingClientRect();
      check('Fixed background and clear foreground',$$('.site-background').length===1&&getComputedStyle($('.site-background')).position==='fixed'&&bg.width===innerWidth&&bg.height===innerHeight&&getComputedStyle($('main')).filter==='none'&&getComputedStyle($('main')).opacity==='1');
      check('Original glass panels remain',$$('.glass-panel').length===3&&$$('.glass-panel').every(el=>getComputedStyle(el,'::before').backdropFilter==='blur(24px) grayscale(1)'));
    }catch(error){result.failures.push(error.message);}
    result.passed=result.failures.length===0;
    report.textContent=JSON.stringify(result,null,2);button.disabled=false;
  };
});
