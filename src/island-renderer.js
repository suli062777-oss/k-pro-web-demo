import * as THREE from 'three';
import { GLTFLoader } from 'three/examples/jsm/loaders/GLTFLoader.js';
import { DRACOLoader } from 'three/examples/jsm/loaders/DRACOLoader.js';
import { RoomEnvironment } from 'three/examples/jsm/environments/RoomEnvironment.js';
import { fitCylinder } from '../island-state.mjs';

export function createIslandRenderer(config, onContextLost) {
  // One offscreen GPU context; small transparent 2D canvases follow the paper's
  // existing CSS transforms. No four independent WebGL contexts or full-page iframe.
  const surface = document.createElement('canvas');
  const renderer = new THREE.WebGLRenderer({ canvas: surface, alpha: true, antialias: true, powerPreference: 'low-power' });
  renderer.setPixelRatio(1);
  renderer.setClearColor(0x000000, 0);
  renderer.toneMapping = THREE.ACESFilmicToneMapping;
  renderer.toneMappingExposure = 1.12;
  renderer.outputColorSpace = THREE.SRGBColorSpace;
  const studio = new RoomEnvironment();
  const pmrem = new THREE.PMREMGenerator(renderer);
  const environment = pmrem.fromScene(studio, 0.04);
  studio.dispose();
  pmrem.dispose();
  const decoder = new DRACOLoader();
  decoder.setDecoderPath(new URL('./draco/', import.meta.url).href);
  decoder.setWorkerLimit(1);
  const loader = new GLTFLoader().setDRACOLoader(decoder);
  const models = new Map();
  let lost = false;
  surface.addEventListener('webglcontextlost', event => {
    event.preventDefault();
    lost = true;
    onContextLost(new Error('3D context unavailable'));
  });

  async function load(id) {
    if (models.has(id)) return models.get(id);
    const spec = config.models[id];
    const promise = loader.loadAsync(new URL(spec.src, document.baseURI).href).then(gltf => {
      const model = gltf.scene;
      model.updateMatrixWorld(true);
      const box = new THREE.Box3().setFromObject(model);
      if (box.isEmpty()) throw new Error('Empty island model: ' + id);
      const center = box.getCenter(new THREE.Vector3());
      const size = box.getSize(new THREE.Vector3());
      const scale = 2 / Math.hypot(size.x, size.z);
      model.scale.setScalar(scale);
      model.position.copy(center).multiplyScalar(-scale);
      const spin = new THREE.Group();
      spin.add(model);
      const scene = new THREE.Scene();
      scene.add(spin);
      scene.environment = environment.texture;
      scene.environmentIntensity = 0.55;
      scene.add(new THREE.HemisphereLight(0xffffff, 0xd6dade, 0.9));
      const key = new THREE.DirectionalLight(0xfffaf4, 2.5);
      key.position.set(4, 6, 5);
      const rim = new THREE.DirectionalLight(0xeef2f5, 0.75);
      rim.position.set(-4, 3, -3);
      scene.add(key, rim);
      // Preserve authored textures/materials; the paper contact shadow is a
      // stationary CSS layer, avoiding four expensive dynamic shadow maps.
      model.traverse(object => {
        if (!object.isMesh) return;
        for (const material of Array.isArray(object.material) ? object.material : [object.material]) {
          for (const value of Object.values(material)) if (value?.isTexture) value.anisotropy = Math.min(4, renderer.capabilities.getMaxAnisotropy());
        }
      });
      return { scene, spin, radius: 1, halfHeight: size.y * scale / 2, camera: new THREE.OrthographicCamera(-1, 1, 1, -1, 0.01, 50) };
    });
    models.set(id, promise);
    return promise;
  }

  function resizeSurface(views) {
    const max = config.maxRenderSize || 1200;
    let width = 1, height = 1;
    for (const view of views) {
      const dpr = Math.min(devicePixelRatio || 1, config.maxDpr || 1.5);
      const w = view.element.clientWidth, h = view.element.clientHeight;
      const ratio = Math.min(dpr, max / Math.max(1, w, h));
      view.pixelWidth = Math.max(1, Math.round(w * ratio));
      view.pixelHeight = Math.max(1, Math.round(h * ratio));
      if (view.canvas.width !== view.pixelWidth || view.canvas.height !== view.pixelHeight) {
        view.canvas.width = view.pixelWidth;
        view.canvas.height = view.pixelHeight;
        view.dirty = true;
      }
      width = Math.max(width, view.pixelWidth);
      height = Math.max(height, view.pixelHeight);
    }
    if (surface.width !== width || surface.height !== height) renderer.setSize(width, height, false);
  }

  function render(view, model, pose) {
    if (lost) throw new Error('3D context unavailable');
    const { camera, scene, spin, radius, halfHeight } = model;
    const spec = config.models[view.id];
    const options = { ...config.camera, ...spec.camera };
    const width = view.pixelWidth, height = view.pixelHeight, aspect = width / height;
    const half = fitCylinder(radius, halfHeight, aspect, options.elevation, options.padding, spec.scale);
    camera.left = -half * aspect; camera.right = half * aspect;
    camera.top = half; camera.bottom = -half;
    camera.updateProjectionMatrix();
    const elevation = THREE.MathUtils.degToRad(options.elevation);
    const azimuth = THREE.MathUtils.degToRad(options.azimuth);
    camera.position.set(10 * Math.cos(elevation) * Math.sin(azimuth), 10 * Math.sin(elevation), 10 * Math.cos(elevation) * Math.cos(azimuth));
    camera.lookAt(0, 0, 0);
    const shadow = view.element.querySelector('.island-shadow');
    if (shadow) {
      // Anchor the paper shadow just below the full-rotation model envelope,
      // rather than the bottom of a tall expanded viewport. It never spins/bobs.
      const projectedHalf = halfHeight * Math.cos(elevation) + radius * Math.sin(elevation);
      const options = { ...config.shadow, ...spec.shadow };
      shadow.style.top = (50 + projectedHalf / (2 * half) * 100 + (options.offset ?? 2) / view.element.clientHeight * 100) + '%';
      shadow.style.bottom = 'auto';
      shadow.style.height = Math.min(view.element.clientWidth * 0.09, view.element.clientHeight * 0.08) + 'px';
    }
    spin.rotation.y = pose.angle;
    spin.position.y = pose.float * (spec.floatPixels ?? config.floatPixels) * 2 * half / Math.max(1, view.element.clientHeight) / Math.cos(elevation);
    renderer.setScissorTest(false);
    renderer.setViewport(0, 0, width, height);
    renderer.clear();
    renderer.render(scene, camera);
    view.context.clearRect(0, 0, width, height);
    view.context.drawImage(surface, 0, surface.height - height, width, height, 0, 0, width, height);
    view.element.classList.add('is-ready');
    view.element.dataset.islandStatus = 'ready';
    view.element.dataset.angle = pose.angle.toFixed(5);
    view.element.dataset.float = pose.float.toFixed(5);
    view.element.dataset.frames = String(Number(view.element.dataset.frames || 0) + 1);
    view.dirty = false;
  }

  return { load, resizeSurface, render };
}
