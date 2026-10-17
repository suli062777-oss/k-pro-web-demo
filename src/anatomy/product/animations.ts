import * as THREE from 'three';

export function lerpTo(current: number, target: number, speed: number, dt: number): number {
  return current + (target - current) * Math.min(1, speed * dt);
}

export function damp(current: number, target: number, lambda: number, dt: number): number {
  return THREE.MathUtils.lerp(current, target, 1 - Math.exp(-lambda * dt));
}
