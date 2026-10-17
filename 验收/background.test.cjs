// Panel grouping and video-controller checks; actual decode needs a video asset.
const { readFileSync } = require('node:fs');
const { resolve } = require('node:path');
const vm = require('node:vm');
const assert = require('node:assert/strict');
const root = resolve(__dirname, '..');

function harness(withVideo = false) {
  const frames = [], events = {}, mediaEvents = {}, preferences = {};
  const style = () => ({ values: {}, setProperty(key, value) { this.values[key] = value; } });
  const node = id => ({ id, style: style(), dataset: {}, children: [], parentElement: null,
    append(child) {
      if (child.parentElement) {
        const siblings = child.parentElement.children;
        siblings.splice(siblings.indexOf(child), 1);
      }
      this.children.push(child); child.parentElement = this;
    },
    insertBefore(child, reference) {
      this.children.splice(this.children.indexOf(reference), 0, child); child.parentElement = this;
    }
  });
  const background = node('site-background'), image = {};
  const video = { hidden: true, seeking: false, duration: 12, currentTime: 0, loads: 0, paused: true,
    pause() { this.paused = true; }, load() { this.loads++; },
    addEventListener(name, callback) { mediaEvents[name] = callback; }
  };
  const reduced = { matches: false, addEventListener(name, callback) { preferences[name] = callback; } };
  const documentElement = { clientHeight: 900, scrollHeight: 7800 };
  let onResize;
  const context = vm.createContext({
    window: {}, scrollY: 0, innerHeight: 900,
    matchMedia: () => reduced,
    addEventListener: (name, callback) => { events[name] = callback; },
    requestAnimationFrame: callback => frames.push(callback),
    ResizeObserver: class { constructor(callback) { onResize = callback; } observe() {} }
  });
  vm.runInContext(readFileSync(resolve(root, 'content.js'), 'utf8'), context);
  const content = context.window.KPRO_CONTENT;
  if (withVideo) { content.site.heroVideo = 'test-only.mp4'; content.site.videoStart = 2; content.site.videoEnd = 10; }
  const main = node('main');
  const originalSections = ['home','routine','settings','product','app','readiness','closing'].map(node);
  originalSections.forEach(section => main.append(section));
  const nodes = { '#site-background': background, '#background-image': image, '#background-video': video, main };
  context.document = { documentElement, querySelector: selector => nodes[selector], createElement: () => node('') };
  vm.runInContext(readFileSync(resolve(root, 'background.js'), 'utf8'), context);
  const flush = () => { while (frames.length) frames.shift()(); };
  const scroll = y => { context.scrollY = y; events.scroll(); flush(); };
  flush();
  return { scroll, flush, video, mediaEvents, reduced, preferences, documentElement, main, originalSections,
    resize: () => { onResize(); flush(); }, frames,
    panelStyles: () => JSON.stringify(main.children.filter(e => e.className === 'glass-panel').map(e => e.style.values)) };
}

const still = harness();
assert.equal(still.video.loads, 0, 'no request when video source is empty');
assert.equal(still.main.children[0], still.originalSections[0], 'hero stays outside all glass panels');
const panels = still.main.children.slice(1);
assert.deepEqual(panels.map(p => p.dataset.theme), ['dark','light','dark']);
assert.deepEqual(panels.map(p => p.children.map(s => s.id)), [['routine','settings','product'],['app','readiness'],['closing']]);
assert.deepEqual(panels.flatMap(p => p.children), still.originalSections.slice(1), 'reuse original nodes and preserve order/listeners');
assert.equal(panels[0].style.values['--panel-tint'], 'rgba(20,20,20,0.78)');
assert.equal(panels[1].style.values['--panel-tint'], 'rgba(245,245,245,0.86)');
panels.forEach(panel => {
  assert.equal(panel.style.values['--panel-blur'], '24px');
  assert.equal(panel.style.values['--panel-grayscale'], 1);
});
const fixedStyles = still.panelStyles();
[615,900,615,0,6900].forEach(y => {
  still.scroll(y);
  assert.equal(still.panelStyles(), fixedStyles, 'panel appearance is invariant during forward/reverse scrolling');
});
still.resize();
assert.equal(still.panelStyles(), fixedStyles, 'resizing does not change panel parameters');
assert.equal(still.frames.length, 0, 'no animation loop while stationary');

const motion = harness(true);
assert.equal(motion.video.loads, 1);
motion.mediaEvents.loadeddata(); motion.flush();
assert.equal(motion.video.currentTime, 2, 'top maps to video start');
motion.scroll(3450);
assert.equal(motion.video.currentTime, 6, 'half the document maps to half the clip');
motion.scroll(6900);
assert.equal(motion.video.currentTime, 10, 'footer maps to video end');
motion.video.seeking = true;
motion.scroll(3000); motion.scroll(1725);
assert.equal(motion.video.currentTime, 10, 'wait for existing seek');
motion.video.seeking = false; motion.mediaEvents.seeked();
assert.equal(motion.video.currentTime, 4, 'seek completion uses latest reversed target');
assert.equal(motion.video.paused, true, 'video remains paused');
const frameAtRest = motion.video.currentTime;
motion.flush();
assert.equal(motion.video.currentTime, frameAtRest, 'no time advance at rest');
motion.documentElement.scrollHeight = 14700; motion.resize();
assert.equal(motion.video.currentTime, 3, 'layout growth refreshes total scroll range');
motion.reduced.matches = true; motion.preferences.change(); motion.flush();
assert.equal(motion.video.hidden, true);
motion.scroll(3400);
assert.equal(motion.video.currentTime, 3, 'reduced motion does not seek');
assert.equal(motion.panelStyles(), fixedStyles, 'readability treatment remains in reduced motion');
motion.reduced.matches = false; motion.preferences.change(); motion.flush();
assert.equal(motion.video.hidden, false);
motion.mediaEvents.error();
assert.equal(motion.video.hidden, true, 'video errors reveal the image fallback');
console.log('PASS: continuous panel groups, stable grayscale glass, preserved section nodes, video scroll mapping, latest seek, static rest, resize, reduced motion and media fallback.');
