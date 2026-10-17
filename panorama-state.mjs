const clamp = (value, min, max) => Math.max(min, Math.min(max, value));
export const wrapYaw = yaw => ((yaw + 180) % 360 + 360) % 360 - 180;

export function createView(options = {}) {
  const minFov = clamp(options.minFov ?? 45, 20, 100);
  const maxFov = clamp(options.maxFov ?? 95, minFov, 110);
  const pitchLimit = clamp(options.pitchLimit ?? 85, 0, 89.5);
  return {
    yaw: wrapYaw(options.yaw ?? 0),
    pitch: clamp(options.pitch ?? 0, -pitchLimit, pitchLimit),
    fov: clamp(options.fov ?? 70, minFov, maxFov),
    minFov, maxFov, pitchLimit,
  };
}
export function turn(view, yaw, pitch = 0) {
  view.yaw = wrapYaw(view.yaw + yaw);
  view.pitch = clamp(view.pitch + pitch, -view.pitchLimit, view.pitchLimit);
}
export function zoom(view, factor) {
  if (Number.isFinite(factor) && factor > 0) view.fov = clamp(view.fov * factor, view.minFov, view.maxFov);
}
export function drag(view, dx, dy, height) {
  const degreesPerPixel = view.fov / Math.max(1, height);
  turn(view, -dx * degreesPerPixel, dy * degreesPerPixel);
}
// Yaw zero is the middle of the equirectangular image, with no camera travel.
export function direction(view) {
  const yaw = view.yaw * Math.PI / 180, pitch = view.pitch * Math.PI / 180;
  return [-Math.cos(pitch) * Math.cos(yaw), Math.sin(pitch), -Math.cos(pitch) * Math.sin(yaw)];
}
