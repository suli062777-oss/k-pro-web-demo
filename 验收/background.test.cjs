// Controller tests with simulated geometry/media; actual decode needs a video asset.
const { readFileSync } = require('node:fs');
const { resolve } = require('node:path');
const vm = require('node:vm');
const assert = require('node:assert/strict');
const root = resolve(__dirname, '..');

function harness(withVideo = false) {
  const frames = [], events = {}, mediaEvents = {}, preferences = {};
  const style = () => ({ values: {}, setProperty(key, value) { this.values[key] = value; } });
  const background = { style: style() }, frost = { style: style() }, image = {};
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
  const main = { children: Object.keys(content.background.sections).map((id, index) => ({
    id, getBoundingClientRect: () => ({ top: (index ? 1200 + (index - 1) * 1100 : 0) - context.scrollY })
  })) };
  const nodes = { '#site-background': background, '#background-image': image, '#background-video': video, '#background-frost': frost, main };
  context.document = { documentElement, querySelector: selector => nodes[selector] };
  vm.runInContext(readFileSync(resolve(root, 'background.js'), 'utf8'), context);
  const flush = () => { while (frames.length) frames.shift()(); };
  const scroll = y => { context.scrollY = y; events.scroll(); flush(); };
  flush();
  return { scroll, flush, video, mediaEvents, reduced, preferences, documentElement,
    resize: () => { onResize(); flush(); }, frames,
    blur: () => parseFloat(frost.style.values['--background-blur']) };
}

const still = harness();
assert.equal(still.video.loads, 0, 'no request when video source is empty');
assert.equal(still.blur(), 0, 'hero is clear');
still.scroll(615);
assert.equal(still.blur(), 10, 'partial entry gives intermediate blur');
still.scroll(900);
assert.equal(still.blur(), 20, 'content receives full blur');
still.scroll(615);
assert.equal(still.blur(), 10, 'reverse scroll retraces the same transition');
still.scroll(0);
assert.equal(still.blur(), 0, 'returning to top clears background');
still.scroll(6900);
assert.equal(still.blur(), 16, 'footer uses its configured blur');
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
assert.equal(motion.blur(), 20, 'readability treatment remains in reduced motion');
motion.reduced.matches = false; motion.preferences.change(); motion.flush();
assert.equal(motion.video.hidden, false);
motion.mediaEvents.error();
assert.equal(motion.video.hidden, true, 'video errors reveal the image fallback');
console.log('PASS: reversible frost, scroll mapping, latest seek, static rest, resize, reduced motion and media fallback.');
