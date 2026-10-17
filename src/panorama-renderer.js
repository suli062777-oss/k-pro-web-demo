import * as THREE from 'three';
import { createView, turn, zoom, drag, direction } from '../panorama-state.mjs';

export function createPanoramaRenderer(canvas, config, onFailure = () => {}) {
  const renderer = new THREE.WebGLRenderer({ canvas, antialias: false, alpha: false, powerPreference: 'low-power' });
  renderer.setPixelRatio(Math.min(devicePixelRatio || 1, config.maxDpr || 1.5));
  renderer.setClearColor(config.background || '#151515');
  renderer.outputColorSpace = THREE.SRGBColorSpace;
  renderer.toneMapping = THREE.NoToneMapping;
  const scene = new THREE.Scene();
  const camera = new THREE.PerspectiveCamera(70, 1, .1, 1100);
  // View the inside of a sphere; the camera stays at its centre at all times.
  const geometry = new THREE.SphereGeometry(500, 80, 48);
  geometry.scale(-1, 1, 1);
  const material = new THREE.MeshBasicMaterial({ toneMapped: false });
  const sphere = new THREE.Mesh(geometry, material);
  scene.add(sphere);
  let current = null, view = createView(), initial = { ...view }, enabled = false, lost = false, raf = 0;
  const pointers = new Map();

  function draw() {
    if (!enabled || lost || document.hidden || !current) return;
    camera.fov = view.fov;
    camera.updateProjectionMatrix();
    camera.position.set(0, 0, 0);
    camera.lookAt(...direction(view));
    renderer.render(scene, camera);
    Object.assign(canvas.dataset, {
      yaw: view.yaw.toFixed(5), pitch: view.pitch.toFixed(5), fov: view.fov.toFixed(5),
      cameraPosition: '0,0,0', frames: String(Number(canvas.dataset.frames || 0) + 1),
    });
  }
  function wake() {
    if (raf || !enabled || lost || document.hidden) return;
    raf = requestAnimationFrame(() => { raf = 0; draw(); });
  }
  function clearPointers() {
    for (const id of pointers.keys()) if (canvas.hasPointerCapture(id)) canvas.releasePointerCapture(id);
    pointers.clear();
  }
  function setActive(value) {
    enabled = value && !!current && !lost;
    if (!enabled) { cancelAnimationFrame(raf); raf = 0; clearPointers(); }
    else wake();
  }
  const discard = texture => { texture?.dispose(); texture?.image?.close?.(); };
  function release() {
    setActive(false);
    material.map = null; material.needsUpdate = true;
    discard(current); current = null;
    delete canvas.dataset.source;
  }
  async function load(spec, { signal } = {}) {
    const useMobile = matchMedia('(max-width: 650px)').matches || (spec.width || 4608) > renderer.capabilities.maxTextureSize;
    const src = useMobile && spec.mobileSrc ? spec.mobileSrc : spec.src;
    const response = await fetch(new URL(src, document.baseURI), { signal });
    if (!response.ok) throw new Error(`Panorama HTTP ${response.status}`);
    const blob = await response.blob();
    const image = new Image();
    const url = URL.createObjectURL(blob);
    try {
      image.src = url;
      await image.decode();
      if (signal?.aborted) throw new DOMException('Aborted', 'AbortError');
      if (image.naturalWidth !== image.naturalHeight * 2) throw new Error('Panorama must have a 2:1 aspect ratio');
      const texture = new THREE.Texture(image);
      texture.colorSpace = THREE.SRGBColorSpace;
      texture.wrapS = THREE.RepeatWrapping;
      texture.anisotropy = Math.min(4, renderer.capabilities.getMaxAnisotropy());
      texture.needsUpdate = true;
      texture.userData.source = src;
      return texture;
    } finally { URL.revokeObjectURL(url); }
  }
  function resize() {
    const width = Math.max(1, canvas.clientWidth), height = Math.max(1, canvas.clientHeight);
    renderer.setSize(width, height, false);
    camera.aspect = width / height;
    camera.updateProjectionMatrix();
    wake(); // Preserve the user's orientation when the viewport changes.
  }
  function present(texture, spec) {
    if (lost) { discard(texture); throw new Error('WebGL context unavailable'); }
    release();
    current = texture;
    material.map = texture; material.needsUpdate = true;
    view = createView({ ...config.camera, ...spec.camera }); initial = { ...view };
    canvas.dataset.source = texture.userData.source;
    enabled = true; resize(); draw();
  }
  function action(name) {
    if (!enabled) return;
    if (name === 'reset') view = { ...initial };
    if (name === 'left') turn(view, -15);
    if (name === 'right') turn(view, 15);
    if (name === 'up') turn(view, 0, 10);
    if (name === 'down') turn(view, 0, -10);
    if (name === 'in') zoom(view, .88);
    if (name === 'out') zoom(view, 1 / .88);
    wake();
  }
  const span = () => {
    const [a, b] = [...pointers.values()];
    return b ? Math.hypot(a.x - b.x, a.y - b.y) : 0;
  };
  canvas.addEventListener('pointerdown', event => {
    if (!enabled || (event.pointerType === 'mouse' && event.button !== 0)) return;
    event.preventDefault();
    canvas.focus({ preventScroll: true });
    pointers.set(event.pointerId, { x: event.clientX, y: event.clientY });
    canvas.setPointerCapture(event.pointerId);
  });
  canvas.addEventListener('pointermove', event => {
    if (!enabled || !pointers.has(event.pointerId)) return;
    const old = pointers.get(event.pointerId), before = span();
    pointers.set(event.pointerId, { x: event.clientX, y: event.clientY });
    if (pointers.size === 1) drag(view, event.clientX - old.x, event.clientY - old.y, canvas.clientHeight);
    else { const after = span(); if (before > 0 && after > 0) zoom(view, before / after); }
    wake();
  });
  const endPointer = event => {
    pointers.delete(event.pointerId);
    if (canvas.hasPointerCapture(event.pointerId)) canvas.releasePointerCapture(event.pointerId);
  };
  ['pointerup', 'pointercancel', 'lostpointercapture'].forEach(type => canvas.addEventListener(type, endPointer));
  canvas.addEventListener('wheel', event => {
    if (!enabled) return;
    event.preventDefault();
    const delta = event.deltaY * (event.deltaMode === 1 ? 16 : event.deltaMode === 2 ? canvas.clientHeight : 1);
    zoom(view, Math.exp(Math.max(-1, Math.min(1, delta * .001)))); wake();
  }, { passive: false });
  canvas.addEventListener('webglcontextlost', event => {
    event.preventDefault(); lost = true; setActive(false); onFailure(new Error('WebGL context lost'));
  });
  canvas.addEventListener('webglcontextrestored', () => { lost = false; });
  return { load, present, release, discard, resize, setActive, action, draw };
}
