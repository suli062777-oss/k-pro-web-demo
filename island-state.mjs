export const TAU = Math.PI * 2;

export function createMotion(initialAngle = 0, reduced = false) {
  return { elapsed: 0, initialAngle: initialAngle * Math.PI / 180, userPaused: reduced, hover: false, focus: false };
}

export function canAnimate(state, visible, hidden) {
  return visible && !hidden && !state.userPaused && !state.hover && !state.focus;
}

export function advanceMotion(state, seconds, playing) {
  if (playing && Number.isFinite(seconds) && seconds > 0) state.elapsed += seconds;
}

export function motionPose(state, rotationSeconds, floatSeconds) {
  return {
    angle: (state.initialAngle + state.elapsed / Math.max(1, rotationSeconds) * TAU) % TAU,
    float: Math.sin(state.elapsed / Math.max(1, floatSeconds) * TAU)
  };
}

// A cylinder encloses the model at EVERY yaw, unlike an initial-angle AABB.
// Its projected vertical span and horizontal radius bound a full revolution.
export function fitCylinder(radius, halfHeight, aspect, elevation, padding = 1.16, scale = 1) {
  const phi = elevation * Math.PI / 180;
  const projectedHalfHeight = halfHeight * Math.cos(phi) + radius * Math.sin(phi);
  return Math.max(projectedHalfHeight, radius / Math.max(0.01, aspect)) * Math.max(1.08, padding) / Math.min(1, Math.max(0.5, scale));
}
