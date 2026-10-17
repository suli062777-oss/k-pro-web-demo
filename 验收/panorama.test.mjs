import test from 'node:test';
import assert from 'node:assert/strict';
import { createView, turn, zoom, drag, direction } from '../panorama-state.mjs';

test('A full horizontal turn returns to the same ray without a jump or translation', () => {
  const view = createView({ yaw: 173, pitch: -3 });
  const start = direction(view);
  for (let i = 0; i < 24; i++) turn(view, 15);
  assert.equal(view.yaw, 173);
  direction(view).forEach((n, i) => assert.ok(Math.abs(n - start[i]) < 1e-10));
  for (let i = 0; i < 48; i++) turn(view, -15);
  assert.equal(view.yaw, 173);
});
test('Looking at the poles is bounded and never flips the camera', () => {
  const view = createView();
  turn(view, 0, 1000); assert.equal(view.pitch, 85);
  turn(view, 0, -2000); assert.equal(view.pitch, -85);
  assert.ok(Math.abs(Math.hypot(...direction(view)) - 1) < 1e-10);
});
test('Drag and pinch move the view naturally and bound magnification', () => {
  const view = createView({ fov: 70 });
  drag(view, 100, 50, 700);
  assert.equal(view.yaw, -10); assert.equal(view.pitch, 5);
  zoom(view, 100 / 200); assert.equal(view.fov, 45);
  zoom(view, 100); assert.equal(view.fov, 95);
  zoom(view, NaN); zoom(view, -1); assert.equal(view.fov, 95);
});
test('Initial framing is configurable, and restoring it is independent of later input', () => {
  const initial = createView({ yaw: -32, pitch: -3, fov: 70 });
  const view = { ...initial };
  turn(view, 90, 25); zoom(view, .8);
  assert.deepEqual(initial, createView({ yaw: -32, pitch: -3, fov: 70 }));
  Object.assign(view, initial);
  assert.deepEqual(view, initial);
});
