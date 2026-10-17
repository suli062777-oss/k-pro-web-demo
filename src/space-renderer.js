import * as THREE from 'three';
import { GLTFLoader } from 'three/examples/jsm/loaders/GLTFLoader.js';
import { DRACOLoader } from 'three/examples/jsm/loaders/DRACOLoader.js';
import { OrbitControls } from 'three/examples/jsm/controls/OrbitControls.js';
import { RoomEnvironment } from 'three/examples/jsm/environments/RoomEnvironment.js';

function disposeModel(model) {
  const geometries = new Set(), materials = new Set(), textures = new Set();
  model?.traverse(object => {
    if (object.geometry) geometries.add(object.geometry);
    for (const material of object.material ? (Array.isArray(object.material) ? object.material : [object.material]) : []) {
      materials.add(material);
      for (const value of Object.values(material)) if (value?.isTexture) textures.add(value);
    }
  });
  geometries.forEach(value => value.dispose());
  materials.forEach(value => value.dispose());
  textures.forEach(value => { value.source?.data?.close?.(); value.dispose(); });
}

export function createSpaceRenderer(canvas, config, onFailure = () => {}) {
  const renderer = new THREE.WebGLRenderer({ canvas, antialias: true, alpha: false, powerPreference: 'low-power' });
  renderer.setPixelRatio(Math.min(devicePixelRatio || 1, config.maxDpr || 1.5));
  renderer.setClearColor(config.background || '#e7e5df');
  renderer.toneMapping = THREE.ACESFilmicToneMapping;
  renderer.toneMappingExposure = 1.04;
  renderer.shadowMap.enabled = true;
  renderer.shadowMap.type = THREE.PCFSoftShadowMap;
  renderer.shadowMap.autoUpdate = false;
  const scene = new THREE.Scene();
  const studio = new RoomEnvironment(), pmrem = new THREE.PMREMGenerator(renderer);
  const environment = pmrem.fromScene(studio, .04);
  studio.dispose(); pmrem.dispose();
  scene.environment = environment.texture;
  scene.environmentIntensity = .5;
  scene.add(new THREE.HemisphereLight(0xffffff, 0xb2b7bd, 1));
  const key = new THREE.DirectionalLight(0xfff5e5, 2.4); key.position.set(5, 8, 6);
  key.castShadow = true;
  key.shadow.mapSize.set(1024, 1024);
  Object.assign(key.shadow.camera, { left: -10, right: 10, top: 10, bottom: -10, near: .1, far: 50 });
  key.shadow.camera.updateProjectionMatrix();
  key.shadow.bias = -.0003;
  key.shadow.normalBias = .01;
  const rim = new THREE.DirectionalLight(0xeaf0fa, .8); rim.position.set(-5, 4, -3);
  scene.add(key, rim);
  const camera = new THREE.PerspectiveCamera(40, 1, .01, 200);
  const controls = new OrbitControls(camera, canvas);
  controls.enablePan = false;
  controls.enableDamping = true;
  controls.dampingFactor = .09;
  controls.rotateSpeed = .55;
  controls.zoomSpeed = .8;
  controls.minPolarAngle = .12;
  controls.maxPolarAngle = Math.PI * .485;
  controls.enabled = false;
  const decoder = new DRACOLoader().setDecoderPath(new URL('./draco/', import.meta.url).href).setWorkerLimit(1);
  const loader = new GLTFLoader().setDRACOLoader(decoder);
  let model = null, bounds, currentSpec, framingBounds, enabled = false, raf = 0, lost = false, initial, updating = false;

  function draw() {
    if (!enabled || lost || document.hidden || !model) return;
    renderer.render(scene, camera);
    const spherical = new THREE.Spherical().setFromVector3(camera.position.clone().sub(controls.target));
    canvas.dataset.azimuth = spherical.theta.toFixed(5);
    canvas.dataset.distance = spherical.radius.toFixed(5);
    canvas.dataset.elevation = (Math.PI / 2 - spherical.phi).toFixed(5);
    canvas.dataset.frames = String(Number(canvas.dataset.frames || 0) + 1);
  }
  function settle() {
    raf = 0;
    if (!enabled || document.hidden) return;
    updating = true;
    const changed = controls.update();
    updating = false;
    if (changed) { draw(); raf = requestAnimationFrame(settle); }
  }
  function wake() { if (updating) return; draw(); if (!raf && enabled && !document.hidden) raf = requestAnimationFrame(settle); }
  controls.addEventListener('change', wake);
  canvas.addEventListener('webglcontextlost', event => { event.preventDefault(); lost = true; setActive(false); onFailure(new Error('WebGL context lost')); });
  canvas.addEventListener('webglcontextrestored', () => { lost = false; });

  function frame() {
    if (!model) return;
    const options = { ...config.camera, ...currentSpec.camera };
    const center = framingBounds.getCenter(new THREE.Vector3());
    const direction = new THREE.Vector3().setFromSpherical(new THREE.Spherical(1, THREE.MathUtils.degToRad(90 - options.elevation), THREE.MathUtils.degToRad(options.azimuth)));
    const right = new THREE.Vector3().crossVectors(new THREE.Vector3(0, 1, 0), direction).normalize();
    const up = new THREE.Vector3().crossVectors(direction, right).normalize();
    const tanY = Math.tan(THREE.MathUtils.degToRad(camera.fov / 2)), tanX = tanY * camera.aspect;
    let distance = 0;
    for (const x of [framingBounds.min.x, framingBounds.max.x]) for (const y of [framingBounds.min.y, framingBounds.max.y]) for (const z of [framingBounds.min.z, framingBounds.max.z]) {
      const p = new THREE.Vector3(x, y, z).sub(center);
      distance = Math.max(distance, Math.abs(p.dot(right)) / tanX + p.dot(direction), Math.abs(p.dot(up)) / tanY + p.dot(direction));
    }
    distance *= options.padding || 1.14;
    controls.target.copy(center);
    camera.position.copy(center).addScaledVector(direction, distance);
    controls.minDistance = Math.max(1, distance * .28);
    controls.maxDistance = Math.min(150, distance * 2.5);
    controls.update();
    initial = { position: camera.position.clone(), target: controls.target.clone() };
    controls.saveState(); wake();
  }
  function resize() {
    const w = Math.max(1, canvas.clientWidth), h = Math.max(1, canvas.clientHeight);
    renderer.setSize(w, h, false); camera.aspect = w / h; camera.updateProjectionMatrix();
    if (model) frame();
  }
  function setActive(value) {
    enabled = value; controls.enabled = value && !!model;
    if (!enabled) { cancelAnimationFrame(raf); raf = 0; }
    else wake();
  }
  async function load(spec) {
    const gltf = await loader.loadAsync(new URL(spec.src, document.baseURI).href);
    return gltf.scene;
  }
  function present(next, spec) {
    if (lost) { disposeModel(next); throw new Error('WebGL context unavailable'); }
    release(); model = next; currentSpec = spec;
    model.updateMatrixWorld(true);
    const original = new THREE.Box3().setFromObject(model), size = original.getSize(new THREE.Vector3()), center = original.getCenter(new THREE.Vector3());
    const scale = 8 / Math.max(size.x, size.y, size.z);
    model.scale.setScalar(scale);
    model.position.set(-center.x * scale, -original.min.y * scale, -center.z * scale);
    scene.add(model); model.updateMatrixWorld(true);
    bounds = new THREE.Box3().setFromObject(model);
    framingBounds = bounds.clone();
    const framing = { ...config.camera, ...spec.camera };
    if (framing.focus && framing.span) {
      const x = (framing.focus[0] - center.x) * scale, z = (framing.focus[1] - center.z) * scale, half = framing.span * scale / 2;
      framingBounds.min.x = x - half; framingBounds.max.x = x + half;
      framingBounds.min.z = z - half; framingBounds.max.z = z + half;
    }
    model.traverse(object => { if (object.isMesh) { object.castShadow = true; object.receiveShadow = true; } });
    renderer.shadowMap.needsUpdate = true;
    enabled = true; controls.enabled = true; resize();
  }
  function release() {
    setActive(false);
    if (model) { scene.remove(model); disposeModel(model); model = null; }
  }
  function action(name) {
    if (!model || !enabled) return;
    // Clear residual damping before explicit reset or keyboard controls.
    if (name === 'reset') {
      const damping = controls.enableDamping; controls.enableDamping = false; controls.update();
      camera.position.copy(initial.position); controls.target.copy(initial.target); controls.update(); controls.enableDamping = damping;
    } else {
      const spherical = new THREE.Spherical().setFromVector3(camera.position.clone().sub(controls.target));
      if (name === 'left') spherical.theta -= .18;
      if (name === 'right') spherical.theta += .18;
      if (name === 'up') spherical.phi = Math.max(controls.minPolarAngle, spherical.phi - .12);
      if (name === 'down') spherical.phi = Math.min(controls.maxPolarAngle, spherical.phi + .12);
      if (name === 'in') spherical.radius = Math.max(controls.minDistance, spherical.radius * .84);
      if (name === 'out') spherical.radius = Math.min(controls.maxDistance, spherical.radius / .84);
      camera.position.copy(controls.target).add(new THREE.Vector3().setFromSpherical(spherical)); controls.update();
    }
    wake();
  }
  return { load, present, release, discard: disposeModel, resize, setActive, action, draw, exportCover: () => { draw(); return new Promise(resolve => canvas.toBlob(resolve, 'image/webp', .93)); } };
}
