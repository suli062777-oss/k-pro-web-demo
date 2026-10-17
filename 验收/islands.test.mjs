import test from 'node:test';
import assert from 'node:assert/strict';
import { TAU, createMotion, canAnimate, advanceMotion, motionPose, fitCylinder } from '../island-state.mjs';

test('a full revolution takes 50 seconds at different frame rates', () => {
  for (const fps of [15, 30, 60, 120]) {
    const state = createMotion(35);
    for (let frame = 0; frame < fps * 50; frame++) advanceMotion(state, 1 / fps, true);
    const angle = motionPose(state, 50, 6).angle;
    assert.ok(Math.abs(angle - 35 * Math.PI / 180) < 1e-9);
  }
});

test('hover pauses only one model, freezes float, and resumes at the same phase', () => {
  const a = createMotion(35), b = createMotion(55);
  advanceMotion(a, 7, true); advanceMotion(b, 7, true);
  a.hover = true;
  const frozen = motionPose(a, 50, 6), other = motionPose(b, 50, 6);
  for (let i = 0; i < 600; i++) {
    advanceMotion(a, 1 / 60, canAnimate(a, true, false));
    advanceMotion(b, 1 / 60, canAnimate(b, true, false));
  }
  assert.deepEqual(motionPose(a, 50, 6), frozen);
  assert.notEqual(motionPose(b, 50, 6).angle, other.angle);
  a.hover = false;
  advanceMotion(a, 1 / 60, canAnimate(a, true, false));
  assert.ok(Math.abs(motionPose(a, 50, 6).angle - frozen.angle - TAU / 3000) < 1e-10);
});

test('keyboard focus, manual pause, offscreen and hidden document stop motion', () => {
  for (const reason of ['focus', 'userPaused', 'offscreen', 'hidden']) {
    const state = createMotion(20);
    if (reason === 'focus' || reason === 'userPaused') state[reason] = true;
    advanceMotion(state, 100, canAnimate(state, reason !== 'offscreen', reason === 'hidden'));
    assert.equal(state.elapsed, 0);
  }
});

test('reduced motion defaults to static, explicit play can resume', () => {
  const state = createMotion(15, true);
  assert.equal(canAnimate(state, true, false), false);
  state.userPaused = false;
  assert.equal(canAnimate(state, true, false), true);
});

test('camera encloses every bounding-box corner through 360 degrees at all target aspect ratios', () => {
  for (const [x, y, z] of [[2, 1.2, 1.6], [1.3, 3.1, 2], [3, 0.4, 2.8]]) {
    const radius = Math.hypot(x, z) / 2;
    const phi = 35 * Math.PI / 180;
    for (const aspect of [0.45, 1, 1.8, 3]) {
      const half = fitCylinder(radius, y / 2, aspect, 35);
      for (let degree = 0; degree <= 360; degree += 5) {
        const theta = degree * Math.PI / 180;
        for (const sx of [-1, 1]) for (const sy of [-1, 1]) for (const sz of [-1, 1]) {
          const px = sx * x / 2 * Math.cos(theta) - sz * z / 2 * Math.sin(theta);
          const pz = sx * x / 2 * Math.sin(theta) + sz * z / 2 * Math.cos(theta);
          const py = sy * y / 2 * Math.cos(phi) - pz * Math.sin(phi);
          assert.ok(Math.abs(px) < half * aspect);
          // Includes room for 4px of float in a 105px-high phone thumbnail.
          assert.ok(Math.abs(py) + 4 * 2 * half / 105 < half);
        }
      }
    }
  }
});
