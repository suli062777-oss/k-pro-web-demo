// Adapted from the user-selected V3-Halowash-little-worlds/src/hw-index.js.
// Original source snapshot and provenance: tools/reference-world-20261017/.
/* L Pro overview page bootstrap: four scene dioramas (GLB, one per care
 * scenario) stand on light concrete plazas around a rounded crossroads,
 * labelled by white callout pills (HTML overlay) that link to each live
 * scene. Bundled to an IIFE exposing window.HWIndex.start(config). The
 * Draco decoder ships inside the bundle as data URIs; the GLB dioramas
 * load from models/ over HTTP (pages are served from GitHub Pages). */
import * as THREE from "three";
import { OrbitControls } from "three/examples/jsm/controls/OrbitControls.js";
import { GLTFLoader } from "three/examples/jsm/loaders/GLTFLoader.js";
import { DRACOLoader } from "three/examples/jsm/loaders/DRACOLoader.js";
import { RoomEnvironment } from "three/examples/jsm/environments/RoomEnvironment.js";
import { EffectComposer } from "three/examples/jsm/postprocessing/EffectComposer.js";
import { RenderPass } from "three/examples/jsm/postprocessing/RenderPass.js";
import { OutlinePass } from "three/examples/jsm/postprocessing/OutlinePass.js";
import { OutputPass } from "three/examples/jsm/postprocessing/OutputPass.js";
import { createBackdrop } from "./world-backdrop.js";

const START_THETA = 45;     /* camera azimuth the fronts are composed against */
const START_PHI = 46;       /* camera elevation: high, plan-like, as in the key visual */
const AUTO_SPIN = 0.45;
const CELLS = [[-1, 1], [1, 1], [-1, -1], [1, -1]];
const SLAB_HALF = 6.15;     /* plaza slab half side */
const SLAB_TOP = .23;       /* slab surface height (extrude depth + bevel) */

const TREE_H = 2.4;

/* ------------------------------------- white callout pills (3D sprites) */
const ICON_PATHS = {
  home: ["M4 11.4 12 4.8l8 6.6", "M6.3 10.4v8.2h11.4v-8.2"],
  cross: ["M12 5.6v12.8", "M5.6 12h12.8"],
  face: ["M8.9 13.6c.8 1.2 1.9 1.9 3.1 1.9s2.3-.7 3.1-1.9", "M9.4 9.9h.01", "M14.6 9.9h.01"],
  salon: ["M8 8.3 19 16.5", "M8 15.7 19 7.5"]
};

/* One billboard per building: white pill (icon disc, title, subtitle,
 * chevron) with a thin stem down to an anchor dot on the roofline. Drawn
 * as a canvas texture so it stays crisp and immune to DOM compositing.
 * drawPill is kept separate so the language toggle can redraw in place. */
function drawPill(cnv, name, desc, iconKey, highlighted = false) {
  const W = cnv.width, H = cnv.height;
  const cx = cnv.getContext("2d");
  cx.clearRect(0, 0, W, H);

  /* stem + anchor dot */
  cx.strokeStyle = "#c3cad1"; cx.lineWidth = 3;
  cx.beginPath(); cx.moveTo(W / 2, 120); cx.lineTo(W / 2, 244); cx.stroke();
  cx.beginPath(); cx.arc(W / 2, 256, 10, 0, Math.PI * 2);
  cx.fillStyle = "#ffffff"; cx.fill();
  cx.strokeStyle = "#aab2ba"; cx.stroke();

  /* pill */
  cx.save();
  cx.shadowColor = "rgba(40,50,60,.20)";
  cx.shadowBlur = 16; cx.shadowOffsetY = 5;
  cx.beginPath();
  if (cx.roundRect) cx.roundRect(10, 10, W - 20, 110, 55);
  else cx.rect(10, 10, W - 20, 110);
  cx.fillStyle = "#ffffff"; cx.fill();
  cx.restore();
  cx.lineWidth = 2; cx.strokeStyle = "#e6e9ec"; cx.stroke();

  /* icon in a periwinkle disc */
  const cxI = 74, cyI = 65, rI = 30;
  cx.beginPath(); cx.arc(cxI, cyI, rI, 0, Math.PI * 2);
  cx.fillStyle = highlighted ? "#202124" : "#858585"; cx.fill();
  cx.save();
  cx.translate(cxI - 15, cyI - 15);
  cx.scale(30 / 24, 30 / 24);
  cx.strokeStyle = "#ffffff"; cx.lineWidth = 2 * (24 / 30);
  cx.lineCap = "round"; cx.lineJoin = "round";
  if (iconKey === "face") { cx.beginPath(); cx.arc(12, 12, 7.6, 0, Math.PI * 2); cx.stroke(); }
  if (iconKey === "salon") {
    cx.beginPath(); cx.arc(6.3, 6.9, 2, 0, Math.PI * 2); cx.stroke();
    cx.beginPath(); cx.arc(6.3, 17.1, 2, 0, Math.PI * 2); cx.stroke();
  }
  for (const d of (ICON_PATHS[iconKey] || ICON_PATHS.home)) cx.stroke(new Path2D(d));
  cx.restore();

  /* texts (textAlign must be reset: a previous draw leaves it "center") */
  cx.textBaseline = "middle";
  cx.textAlign = "left";
  cx.fillStyle = "#23282e";
  cx.font = "700 38px 'Microsoft YaHei','PingFang SC',system-ui,sans-serif";
  cx.fillText(name, 124, desc ? 50 : 65);
  cx.fillStyle = "#8d949b";
  cx.font = "400 25px 'Microsoft YaHei','PingFang SC',system-ui,sans-serif";
  if (desc) cx.fillText(desc, 124, 93);
  cx.fillStyle = "#b9bfc6";
  cx.font = "400 46px system-ui,sans-serif";
  cx.textAlign = "center";
  cx.fillText("›", highlighted ? 677 : 668, 63);
}

function makeCalloutMesh(name, desc, iconKey) {
  const W = 720, H = 300;
  const cnv = document.createElement("canvas");
  cnv.width = W; cnv.height = H;
  drawPill(cnv, name, desc, iconKey);

  const tex = new THREE.CanvasTexture(cnv);
  if (THREE.SRGBColorSpace) tex.colorSpace = THREE.SRGBColorSpace;
  tex.anisotropy = 8;

  const PLANE_W = 8.2, PLANE_H = PLANE_W * H / W;
  const mesh = new THREE.Mesh(
    new THREE.PlaneGeometry(PLANE_W, PLANE_H),
    new THREE.MeshBasicMaterial({ map: tex, transparent: true, depthWrite: false, depthTest: false, fog: false, toneMapped: false })
  );
  mesh.renderOrder = 10;
  /* anchor dot sits at canvas y 256; keep it at the building-top anchor */
  mesh.userData.dotOffset = (0.5 - 256 / H) * PLANE_H;
  mesh.userData.redraw = (n, d, highlighted = false) => { drawPill(cnv, n, d, iconKey, highlighted); tex.needsUpdate = true; };
  return mesh;
}

/* ------------------------------------------------- plaza slab + greenery */
function roundedRectShape(w, h, r) {
  const s = new THREE.Shape();
  const x = -w / 2, y = -h / 2;
  s.moveTo(x + r, y);
  s.lineTo(x + w - r, y);
  s.quadraticCurveTo(x + w, y, x + w, y + r);
  s.lineTo(x + w, y + h - r);
  s.quadraticCurveTo(x + w, y + h, x + w - r, y + h);
  s.lineTo(x + r, y + h);
  s.quadraticCurveTo(x, y + h, x, y + h - r);
  s.lineTo(x, y + r);
  s.quadraticCurveTo(x, y, x + r, y);
  return s;
}

const MATS = {
  slab: new THREE.MeshStandardMaterial({ color: 0xe9edf0, roughness: .9 }),
  bark: new THREE.MeshStandardMaterial({ color: 0x63686d, roughness: .95 }),
  leafA: new THREE.MeshStandardMaterial({ color: 0x53663f, roughness: 1 }),
  leafB: new THREE.MeshStandardMaterial({ color: 0x475a36, roughness: 1 }),
  hedge: new THREE.MeshStandardMaterial({ color: 0x475f3a, roughness: 1 }),
  planter: new THREE.MeshStandardMaterial({ color: 0xd5d9dc, roughness: .92 })
};

let treeProto = null;                        /* prepared GLB street tree */

function makeTree() {
  const g = new THREE.Group();
  if (treeProto) {                             /* GLB street tree, height-normalized */
    const t = treeProto.clone(true);
    t.rotation.y = Math.random() * Math.PI * 2;
    t.scale.multiplyScalar(.85 + Math.random() * .3);
    g.add(t);
    return g;
  }
  /* procedural fallback while / if the GLB tree is unavailable */
  const trunk = new THREE.Mesh(new THREE.CylinderGeometry(.1, .15, 1.15, 7), MATS.bark);
  trunk.position.y = .58;
  const blob1 = new THREE.Mesh(new THREE.IcosahedronGeometry(.8, 1), MATS.leafA);
  blob1.position.y = 1.62; blob1.scale.set(1, .82, 1);
  const blob2 = new THREE.Mesh(new THREE.IcosahedronGeometry(.52, 1), MATS.leafB);
  blob2.position.y = 2.18; blob2.scale.set(1, .8, 1);
  const pot = new THREE.Mesh(new THREE.CylinderGeometry(.55, .55, .12, 12), MATS.planter);
  pot.position.y = .06;
  for (const m of [trunk, blob1, blob2]) { m.castShadow = true; m.receiveShadow = true; }
  pot.receiveShadow = true;
  g.add(trunk, blob1, blob2, pot);
  return g;
}

/* prepare the GLB tree once: deepen the canopy to the key visual's forest
 * green, height-normalize, base on y=0 */
function prepTreeProto(src) {
  const t = src.clone(true);
  t.traverse(o => {
    if (o.isMesh && o.material) {
      o.material = o.material.clone();
      o.material.color = new THREE.Color(0x6f8a5c);   /* deep-forest tint over the baked albedo */
    }
  });
  const box3 = new THREE.Box3().setFromObject(t);
  const size = box3.getSize(new THREE.Vector3());
  const s = TREE_H / size.y;
  t.scale.setScalar(s);
  t.position.y = -box3.min.y * s;
  const g = new THREE.Group();
  g.add(t);
  return g;
}

/* rows of small trees on the sidewalk band along the four street arms,
 * plus one at each rounded corner of the intersection */
function addStreetTrees(scene) {
  const g = new THREE.Group();
  const off = 2.72;                            /* between curb and plaza edge */
  const stops = [5.9, 9.1, 12.3];
  for (const sx of [-1, 1]) for (const sz of [-1, 1]) {
    for (const d of stops) {
      const t1 = makeTree();
      t1.position.set(sx * off, 0, sz * d);
      const t2 = makeTree();
      t2.position.set(sz * d, 0, sx * off);
      for (const t of [t1, t2]) {
        t.rotation.y = Math.random() * Math.PI * 2;
        t.scale.setScalar(.85 + Math.random() * .3);
        g.add(t);
      }
    }
    const c = makeTree();                      /* intersection corner tree */
    c.position.set(sx * off, 0, sz * off);
    c.rotation.y = Math.random() * Math.PI * 2;
    g.add(c);
  }
  scene.add(g);
}

function addHedges(unit) {
  const geo = new THREE.BoxGeometry(1, 1, 1);
  const L = SLAB_HALF * 2 - 2.4, off = SLAB_HALF - .5;
  for (const [x, z, w, d] of [[0, off, L, .34], [0, -off, L, .34], [off, 0, .34, L], [-off, 0, .34, L]]) {
    const m = new THREE.Mesh(geo, MATS.hedge);
    m.scale.set(w, .4, d);
    m.position.set(x, SLAB_TOP + .2, z);
    m.castShadow = true; m.receiveShadow = true;
    unit.add(m);
  }
}

// The scene composition above is kept from the reference. This adapter scopes
// controls/lifecycle to a homepage section and opens K pro's local panoramas.
export async function createWorldRenderer(canvas, config, hooks) {
  const { onEnter, onFailure, onMotion, labels } = hooks;
  const renderer = new THREE.WebGLRenderer({ canvas, antialias: true, alpha: false, powerPreference: 'low-power' });
  renderer.setPixelRatio(Math.min(devicePixelRatio || 1, config.maxDpr ?? 1.5));
  renderer.shadowMap.enabled = true;
  renderer.shadowMap.type = THREE.PCFShadowMap;
  renderer.shadowMap.autoUpdate = false;
  renderer.toneMapping = THREE.ACESFilmicToneMapping;
  renderer.toneMappingExposure = 1.08;
  const scene = new THREE.Scene();
  const backdrop = createBackdrop(scene);
  const studio = new RoomEnvironment(), pmrem = new THREE.PMREMGenerator(renderer);
  const environment = pmrem.fromScene(studio, .04);
  scene.environment = environment.texture;
  scene.environmentIntensity = .46;
  studio.dispose(); pmrem.dispose();
  const camera = new THREE.PerspectiveCamera(30, 1, .1, 600);
  const controls = new OrbitControls(camera, canvas);
  controls.enabled = false;
  Object.assign(controls, { enableDamping: true, dampingFactor: .07, enablePan: false, rotateSpeed: .55, zoomSpeed: .8, minPolarAngle: Math.PI * .14, maxPolarAngle: Math.PI * .49, autoRotateSpeed: config.autoSpin ?? AUTO_SPIN });
  // A homepage must still scroll: zoom is explicit via buttons, or two fingers.
  controls.enableZoom = true;
  canvas.addEventListener('wheel', event => { if (!event.ctrlKey) event.stopImmediatePropagation(); }, { capture: true, passive: true });
  controls.touches = { ONE: null, TWO: THREE.TOUCH.DOLLY_ROTATE };
  canvas.style.touchAction = 'pan-y';
  scene.add(new THREE.HemisphereLight(0xffffff, 0xcfd4d8, .78));
  const key = new THREE.DirectionalLight(0xffffff, 2.9);
  key.castShadow = true;
  key.shadow.mapSize.set(config.shadowSize ?? 2048, config.shadowSize ?? 2048);
  const rim = new THREE.DirectionalLight(0xeef2f5, .7);
  scene.add(key, key.target, rim);
  const draco = new DRACOLoader();
  draco.setDecoderPath(new URL('./draco/', import.meta.url).href);
  draco.setWorkerLimit(1);
  const loader = new GLTFLoader().setDRACOLoader(draco);
  let active = false, ready = false, failed = false, raf = 0, ticking = false, last = 0, dirty = true;
  let paused = matchMedia('(prefers-reduced-motion: reduce)').matches, lang = config.language || 'en';
  let items = [], pointerHighlight = null, focusHighlight = null, hoverId = null;
  const reducedMotion = matchMedia('(prefers-reduced-motion: reduce)');
  const feedback = { scale: 1.04, durationMs: 200, outlineWidth: 2, ...config.hover };
  let composer, outline;
  function ensureOutline() {
    if (composer) return;
    // Allocate postprocessing only when a pointer/keyboard first selects a building.
    composer = new EffectComposer(renderer);
    composer.addPass(new RenderPass(scene, camera));
    outline = new OutlinePass(new THREE.Vector2(canvas.clientWidth, canvas.clientHeight), scene, camera);
    outline.visibleEdgeColor.set(feedback.outlineColor || '#fff');
    outline.hiddenEdgeColor.set('#000');
    outline.edgeThickness = feedback.outlineWidth;
    outline.downSampleRatio = 2;
    outline.pulsePeriod = 0;
    // White silhouette over a soft charcoal rim remains visible on pale buildings.
    outline.overlayMaterial.blending = THREE.NormalBlending;
    outline.overlayMaterial.uniforms.rimColor = { value: new THREE.Color(feedback.shadowColor || '#303030') };
    outline.overlayMaterial.fragmentShader = `
      varying vec2 vUv;
      uniform sampler2D edgeTexture1;
      uniform sampler2D edgeTexture2;
      uniform float edgeStrength;
      uniform vec3 rimColor;
      void main() {
        float edge = texture2D(edgeTexture1, vUv).r;
        float wide = texture2D(edgeTexture2, vUv).r;
        float line = smoothstep(0.025, 0.19, edge);
        float shadow = clamp(wide * 7.0, 0.0, 0.6);
        gl_FragColor = vec4(mix(rimColor, vec3(1.0), line), max(line, shadow) * edgeStrength);
      }`;
    composer.addPass(outline);
    composer.addPass(new OutputPass());
    composer.setSize(canvas.clientWidth, canvas.clientHeight);
  }
  function setHighlight(id, source = 'pointer') {
    if (source === 'focus') focusHighlight = id; else pointerHighlight = id;
    const next = pointerHighlight || focusHighlight;
    if (hoverId === next) return;
    hoverId = next;
    if (hoverId) {
      ensureOutline();
      // Flush OrbitControls' residual auto-rotation without moving the camera.
      // Otherwise damping keeps a hovered building drifting under the pointer.
      const position = camera.position.clone(), target = controls.target.clone();
      const damping = controls.enableDamping;
      controls.autoRotate = false; controls.enableDamping = false; controls.update(0);
      camera.position.copy(position); controls.target.copy(target); controls.update(0);
      controls.enableDamping = damping;
    }
    for (const item of items) {
      const selected = item.spec.id === hoverId;
      item.button.classList.toggle('is-highlighted', selected);
      item.callout.userData.redraw(labelText(item.spec)[0], selected ? (lang === 'en' ? 'Enter 360°' : '进入 360° 空间') : '', selected);
    }
    canvas.dataset.hovered = hoverId || '';
    wake();
  }
  function animateFeedback(delta) {
    let changing = false;
    for (const item of items) {
      const target = item.spec.id === hoverId ? 1 : 0;
      const step = reducedMotion.matches ? 1 : delta * 1000 / feedback.durationMs;
      const previous = item.hoverAmount;
      item.hoverAmount = target > previous ? Math.min(target, previous + step) : Math.max(target, previous - step);
      changing ||= item.hoverAmount !== target;
      const eased = item.hoverAmount * item.hoverAmount * (3 - 2 * item.hoverAmount);
      item.visual.scale.setScalar(1 + (reducedMotion.matches ? 0 : feedback.scale - 1) * eased);
      item.callout.scale.setScalar(1 + (reducedMotion.matches ? 0 : .025) * eased);
      item.callout.position.y = item.calloutY + item.height * (item.visual.scale.x - 1) * item.unit.scale.x;
      item.button.dataset.hoverScale = item.visual.scale.x.toFixed(4);
      if (previous !== item.hoverAmount) { dirty = true; renderer.shadowMap.needsUpdate = true; }
    }
    return changing;
  }
  function failure(error) {
    if (failed) return;
    failed = true; active = false; controls.enabled = false;
    cancelAnimationFrame(raf); raf = 0;
    onFailure(error);
  }
  canvas.addEventListener('webglcontextlost', event => { event.preventDefault(); failure(new Error('World context lost')); });
  const timer = setTimeout(() => failure(new Error('World assets timed out')), 30000);
  let gltfs, tree;
  try {
    [gltfs, tree] = await Promise.all([
      Promise.all(config.scenes.map(spec => loader.loadAsync(new URL(spec.model, document.baseURI).href))),
      loader.loadAsync(new URL(config.tree, document.baseURI).href),
    ]);
  } catch (error) { clearTimeout(timer); renderer.dispose(); draco.dispose(); throw error; }
  clearTimeout(timer);
  if (failed) { renderer.dispose(); draco.dispose(); throw new Error('World load cancelled'); }
  treeProto = prepTreeProto(tree.scene);
  const labelText = spec => lang === 'zh' ? [spec.name, spec.desc] : [spec.nameEn, spec.descEn];
  items = config.scenes.map((spec, index) => {
    const model = gltfs[index].scene;
    model.traverse(o => { if (o.isMesh) { o.castShadow = true; o.receiveShadow = true; } });
    model.rotation.y = THREE.MathUtils.degToRad(START_THETA - 180 + (spec.yaw ?? 180));
    const box = new THREE.Box3().setFromObject(model), size = box.getSize(new THREE.Vector3()), center = box.getCenter(new THREE.Vector3());
    const scale = (spec.footprint || 11.2) / Math.max(size.x, size.z);
    const wrap = new THREE.Group(), unit = new THREE.Group(), visual = new THREE.Group();
    model.scale.setScalar(scale);
    model.position.set(-center.x * scale, -box.min.y * scale, -center.z * scale);
    visual.position.y = SLAB_TOP + .015; visual.add(model); unit.add(visual);
    const slab = new THREE.Mesh(new THREE.ExtrudeGeometry(roundedRectShape(SLAB_HALF * 2, SLAB_HALF * 2, 1), { depth: .2, bevelEnabled: true, bevelThickness: .025, bevelSize: .03, bevelSegments: 2, curveSegments: 10 }), MATS.slab);
    slab.rotation.x = -Math.PI / 2; slab.receiveShadow = true;
    unit.add(slab); addHedges(unit); wrap.add(unit);
    const callout = makeCalloutMesh(labelText(spec)[0], '', spec.icon);
    callout.position.y = size.y * scale + .35 - callout.userData.dotOffset;
    wrap.add(callout); scene.add(wrap);
    return { wrap, unit, visual, model, callout, spec, index, height: size.y * scale, calloutY: callout.position.y, hoverAmount: 0, button: labels.get(spec.id) };
  });
  addStreetTrees(scene);
  const home = { position: new THREE.Vector3(), target: new THREE.Vector3() };
  let portrait = null;
  function layout(reset = false) {
    const previousDistance = home.position.distanceTo(home.target);
    const offset = camera.position.clone().sub(controls.target);
    const nextPortrait = camera.aspect < .9;
    portrait = nextPortrait;
    const gap = portrait ? 16.2 : 18.7, scale = portrait ? .8 : 1;
    for (const item of items) {
      const [x, z] = CELLS[item.index];
      item.wrap.position.set(x * gap / 2, 0, z * gap / 2);
      item.unit.scale.setScalar(scale);
    }
    scene.updateMatrixWorld(true);
    const box = new THREE.Box3();
    for (const item of items) {
      box.union(new THREE.Box3().setFromObject(item.unit));
      // A camera-facing label must not change the fit envelope on every resize.
      // Its orientation changes while orbiting; use a fixed billboard envelope.
      const anchor = item.callout.getWorldPosition(new THREE.Vector3());
      box.expandByPoint(anchor.clone().add(new THREE.Vector3(4.1, 1.71, 4.1)));
      box.expandByPoint(anchor.clone().sub(new THREE.Vector3(4.1, 1.71, 4.1)));
    }
    const center = box.getCenter(new THREE.Vector3()), sphere = box.getBoundingSphere(new THREE.Sphere());
    const vfov = THREE.MathUtils.degToRad(camera.fov), hfov = 2 * Math.atan(Math.tan(vfov / 2) * camera.aspect);
    const dist = sphere.radius / Math.sin(Math.min(vfov, hfov) / 2) * (portrait ? .98 : .94);
    home.target.copy(center);
    home.position.copy(center).add(new THREE.Vector3().setFromSpherical(new THREE.Spherical(dist, THREE.MathUtils.degToRad(START_PHI), THREE.MathUtils.degToRad(START_THETA))));
    if (reset || previousDistance === 0) { camera.position.copy(home.position); controls.target.copy(center); }
    else { camera.position.copy(center).add(offset.multiplyScalar(dist / previousDistance)); controls.target.copy(center); }
    controls.minDistance = dist * .4; controls.maxDistance = dist * 1.6;
    const r = sphere.radius;
    Object.assign(key.shadow.camera, { left: -r, right: r, top: r, bottom: -r, near: .1, far: r * 8 });
    key.shadow.bias = -.0004;
    key.position.copy(center).add(new THREE.Vector3(r * .9, r * 1.4, r * .6));
    key.target.position.copy(center); key.shadow.camera.updateProjectionMatrix();
    rim.position.copy(center).add(new THREE.Vector3(-r, r * 1.2, -r));
    renderer.shadowMap.needsUpdate = true;
  }
  const projected = new THREE.Vector3();
  function project(point, target) {
    projected.copy(point); target.localToWorld(projected); projected.project(camera);
    return { x: (projected.x * .5 + .5) * canvas.clientWidth, y: (-projected.y * .5 + .5) * canvas.clientHeight };
  }
  function updateLabels() {
    scene.updateMatrixWorld(true); camera.updateMatrixWorld(true);
    for (const item of items) {
      const a = project(new THREE.Vector3(-4, 3.4167 * (.5 - 10 / 300), 0), item.callout);
      const b = project(new THREE.Vector3(4, 3.4167 * (.5 - 120 / 300), 0), item.callout);
      Object.assign(item.button.style, { left: a.x + 'px', top: a.y + 'px', width: Math.max(1, b.x - a.x) + 'px', height: Math.max(1, b.y - a.y) + 'px' });
      const center = new THREE.Box3().setFromObject(item.model).getCenter(new THREE.Vector3()).project(camera);
      item.button.dataset.buildingX = ((center.x * .5 + .5) * canvas.clientWidth).toFixed(1);
      item.button.dataset.buildingY = ((-center.y * .5 + .5) * canvas.clientHeight).toFixed(1);
    }
  }
  function draw() {
    for (const item of items) item.callout.quaternion.copy(camera.quaternion);
    backdrop.setDistance(camera.position.distanceTo(controls.target), camera.position); backdrop.update();
    const highlighted = items.filter(item => item.hoverAmount > 0);
    if (composer && highlighted.length) {
      outline.selectedObjects = highlighted.map(item => item.visual);
      outline.edgeStrength = Math.max(...highlighted.map(item => item.hoverAmount));
      composer.render();
    } else renderer.render(scene, camera);
    canvas.dataset.outlined = highlighted.map(item => item.spec.id).join(',');
    updateLabels();
    Object.assign(canvas.dataset, { frames: String(Number(canvas.dataset.frames || 0) + 1), angle: controls.getAzimuthalAngle().toFixed(5), distance: camera.position.distanceTo(controls.target).toFixed(5), paused: String(paused) });
    dirty = false;
  }
  function tick(now) {
    raf = 0;
    if (!active || failed || !ready) { last = 0; return; }
    const elapsed = last ? (now - last) / 1000 : 0;
    if (last && elapsed < 1 / (config.maxFps || 30)) { raf = requestAnimationFrame(tick); return; }
    last = now; ticking = true;
    controls.autoRotate = !paused && !hoverId;
    const animating = animateFeedback(elapsed || 1 / 60);
    const changed = controls.update(Math.min(elapsed, .1));
    if (changed || dirty || controls.autoRotate) draw();
    ticking = false;
    if (controls.autoRotate || changed || animating) raf = requestAnimationFrame(tick); else last = 0;
  }
  function wake() { dirty = true; if (!raf && active && ready && !ticking && !failed) raf = requestAnimationFrame(tick); }
  function setActive(value) {
    active = !!value && !failed;
    controls.enabled = active;
    if (!active) {
      setHighlight(null, 'focus'); setHighlight(null);
      canvas.style.cursor = 'grab';
      cancelAnimationFrame(raf); raf = 0; last = 0;
    }
    else wake();
    canvas.dataset.active = String(active);
  }
  function setPaused(value) { paused = value; controls.autoRotate = !paused && !hoverId; onMotion(paused); wake(); }
  controls.addEventListener('start', () => { setPaused(true); });
  controls.addEventListener('change', wake);
  function resize() {
    const width = Math.max(1, canvas.clientWidth), height = Math.max(1, canvas.clientHeight);
    renderer.setSize(width, height, false); camera.aspect = width / height; camera.updateProjectionMatrix();
    layout(); composer?.setSize(width, height); wake();
  }
  function action(name) {
    if (name === 'pause') { setPaused(!paused); return; }
    setPaused(true);
    if (name === 'reset') {
      controls.enableDamping = false; controls.update(0);
      camera.position.copy(home.position); controls.target.copy(home.target);
      controls.update(0); controls.enableDamping = true; wake(); return;
    }
    const off = camera.position.clone().sub(controls.target), spherical = new THREE.Spherical().setFromVector3(off);
    if (name === 'in' || name === 'out') spherical.radius = THREE.MathUtils.clamp(spherical.radius * (name === 'in' ? .85 : 1 / .85), controls.minDistance, controls.maxDistance);
    if (name === 'left') spherical.theta -= .12;
    if (name === 'right') spherical.theta += .12;
    if (name === 'up') spherical.phi -= .08;
    if (name === 'down') spherical.phi += .08;
    spherical.phi = THREE.MathUtils.clamp(spherical.phi, controls.minPolarAngle, controls.maxPolarAngle);
    camera.position.copy(controls.target).add(new THREE.Vector3().setFromSpherical(spherical));
    controls.update(0); wake();
  }
  const raycaster = new THREE.Raycaster();
  function pick(event) {
    const rect = canvas.getBoundingClientRect();
    raycaster.setFromCamera(new THREE.Vector2((event.clientX - rect.left) / rect.width * 2 - 1, -((event.clientY - rect.top) / rect.height) * 2 + 1), camera);
    const hit = raycaster.intersectObjects(items.map(i => i.model), true)[0];
    if (!hit) return null;
    let object = hit.object;
    while (object.parent && !items.some(i => i.wrap === object)) object = object.parent;
    return items.find(i => i.wrap === object);
  }
  let press = null;
  const pointers = new Set();
  canvas.addEventListener('pointerdown', event => {
    pointers.add(event.pointerId);
    if (pointers.size === 1) press = { x: event.clientX, y: event.clientY, moved: false };
    else if (press) press.moved = true;
    if (event.pointerType !== 'touch') canvas.focus({ preventScroll: true });
  });
  canvas.addEventListener('pointermove', event => {
    if (press && pointers.size && Math.hypot(event.clientX - press.x, event.clientY - press.y) > 7) { press.moved = true; setHighlight(null); }
    if (event.pointerType === 'mouse' && !pointers.size) { const item = pick(event); canvas.style.cursor = item ? 'pointer' : 'grab'; setHighlight(item?.spec.id || null); }
  });
  canvas.addEventListener('pointerleave', () => setHighlight(null));
  canvas.addEventListener('pointerup', event => { pointers.delete(event.pointerId); });
  canvas.addEventListener('pointercancel', event => { pointers.delete(event.pointerId); if (press) press.moved = true; });
  canvas.addEventListener('click', event => {
    if (!active || press?.moved) return;
    const item = pick(event);
    if (item) { setHighlight(null); canvas.focus({ preventScroll: true }); canvas.dataset.lastPick = item.spec.id; onEnter(item.spec.id); }
  });
  canvas.addEventListener('keydown', event => {
    const name = { ArrowLeft: 'left', ArrowRight: 'right', ArrowUp: 'up', ArrowDown: 'down', '+': 'in', '=': 'in', '-': 'out', ' ': 'pause', Escape: 'reset', Home: 'reset' }[event.key];
    if (name) { event.preventDefault(); action(name); }
  });
  // One-finger horizontal rotation, with vertical page scrolling left to browser.
  let touch = null;
  canvas.addEventListener('pointerdown', e => { if (e.pointerType === 'touch' && pointers.size === 1) touch = { id: e.pointerId, x: e.clientX, y: e.clientY, last: e.clientX, horizontal: false }; });
  canvas.addEventListener('pointermove', e => {
    if (!touch || e.pointerId !== touch.id || pointers.size !== 1) return;
    const dx = e.clientX - touch.x, dy = e.clientY - touch.y;
    if (!touch.horizontal && Math.abs(dx) > 10 && Math.abs(dx) > Math.abs(dy) * 1.2) { touch.horizontal = true; setPaused(true); }
    if (!touch.horizontal) return;
    const off = camera.position.clone().sub(controls.target), sp = new THREE.Spherical().setFromVector3(off);
    sp.theta -= (e.clientX - touch.last) * .006; touch.last = e.clientX;
    camera.position.copy(controls.target).add(new THREE.Vector3().setFromSpherical(sp)); controls.update(0); wake();
  });
  ['pointerup', 'pointercancel'].forEach(type => canvas.addEventListener(type, () => { touch = null; }));
  function setLanguage(value) {
    lang = value;
    for (const item of items) item.callout.userData.redraw(labelText(item.spec)[0], item.spec.id === hoverId ? (lang === 'en' ? 'Enter 360°' : '进入 360° 空间') : '', item.spec.id === hoverId);
    wake();
  }
  ready = true; resize(); controls.autoRotate = false; controls.update(0); draw(); onMotion(paused);
  return { setActive, resize, action, setLanguage, setPaused, setHighlight };
}

