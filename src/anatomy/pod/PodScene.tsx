import React, { useEffect, useMemo, useRef, useState } from 'react';
import * as THREE from 'three';
import { useFrame, useThree, type ThreeEvent } from '@react-three/fiber';
import { Html, OrbitControls, useGLTF } from '@react-three/drei';
import { RoomEnvironment } from 'three/examples/jsm/environments/RoomEnvironment.js';
import { damp } from '../product/animations';
import { MODULES, MODULE_BY_ID, STATIONS, type ModuleId, type StationId } from './modules';
import type { Lang } from './i18n';

export const MODEL_URL = (window as any).KPRO_CONTENT.productAnatomy.model;

const PART_RE = /^tripo_part_(\d+)$/;

function partIndexOf(name: string): number | null {
  const m = PART_RE.exec(name);
  return m ? Number(m[1]) : null;
}

/** 零件 → 所属模块 */
const MODULE_OF_PART = (() => {
  const m = new Map<number, ModuleId>();
  for (const mod of MODULES) for (const id of mod.parts) m.set(id, mod.id);
  return m;
})();

/** 爆炸位移 = 组位移 + 特殊零件附加位移（装配顺序 = 拆解顺序） */
function computeOffsets(): Map<number, [number, number, number]> {
  const out = new Map<number, [number, number, number]>();
  for (const mod of MODULES) {
    for (const id of mod.parts) {
      const extra = mod.partExtra?.[id];
      out.set(
        id,
        extra
          ? [mod.offset[0] + extra[0], mod.offset[1] + extra[1], mod.offset[2] + extra[2]]
          : [...mod.offset],
      );
    }
  }
  return out;
}

const PART_OFFSETS = computeOffsets();

/** 外壳避让位移：聚焦功能模块时整组外壳向上后方飞远，不遮挡模块展示（glTF 坐标，Y 上 / -Z 背） */
const SHELL_AWAY: [number, number, number] = [0, 1.6, -0.9];

/* ---------------- 产品模型：分组 / 爆炸 / 高亮 ---------------- */

interface GroupRuntime {
  meshes: THREE.Mesh[];
  anchor: THREE.Vector3; // 组包围盒中心（装配态，世界坐标）
  opacity: number;
  glow: number;
}

interface PodModelProps {
  lang: Lang;
  station: StationId;
  focus: ModuleId[];
  explodeTarget: number;
  /** 点击模型部位 → 所属模块 */
  onPickModule?: (moduleId: ModuleId) => void;
  onReady?: () => void;
  onBounds?: (bounds: THREE.Box3) => void;
}

export function PodModel({ lang, station, focus, explodeTarget, onPickModule, onReady, onBounds }: PodModelProps) {
  const gltf = useGLTF(MODEL_URL, false, true);
  const rootRef = useRef<THREE.Group>(null);
  const labelRefs = useRef(new Map<ModuleId, THREE.Group>());
  const explodeCur = useRef(0);
  const awayCur = useRef(0);
  const tmpColor = useMemo(() => new THREE.Color(), []);

  const built = useMemo(() => {
    const model = gltf.scene.clone(true);
    model.updateMatrixWorld(true);
    const partMeshes = new Map<number, THREE.Mesh>();

    model.traverse((child) => {
      const mesh = child as THREE.Mesh;
      if (!mesh.isMesh) return;
      const idx = partIndexOf(mesh.name) ?? partIndexOf(mesh.parent?.name || '');
      if (idx === null) return;
      partMeshes.set(idx, mesh);
      mesh.material = Array.isArray(mesh.material) ? mesh.material.map(mat => mat.clone()) : mesh.material.clone();
      mesh.castShadow = true;
      mesh.receiveShadow = true;
      mesh.userData.basePos = mesh.position.clone(); // 装配态局部位置
    });

    const map = {} as Record<ModuleId, GroupRuntime>;
    const box = new THREE.Box3();
    const tmp = new THREE.Box3();
    for (const mod of MODULES) {
      const meshes: THREE.Mesh[] = [];
      box.makeEmpty();
      for (const id of mod.parts) {
        const mesh = partMeshes.get(id);
        if (!mesh) continue;
        meshes.push(mesh);
        tmp.setFromObject(mesh);
        box.union(tmp);
      }
      map[mod.id] = {
        meshes,
        anchor: box.isEmpty() ? new THREE.Vector3() : box.getCenter(new THREE.Vector3()),
        opacity: 1,
        glow: 0,
      };
    }
    return { model, partMeshes, map };
  }, [gltf]);

  useEffect(() => {
    rootRef.current?.add(built.model);
    onReady?.();
    return () => {
      built.model.removeFromParent();
      for (const mesh of built.partMeshes.values()) {
        const materials = Array.isArray(mesh.material) ? mesh.material : [mesh.material];
        materials.forEach(material => material.dispose());
      }
    };
  }, [built, onReady]);

  // Fit the selected module's final pose, independent from the in-flight explosion.
  useEffect(() => {
    const box = new THREE.Box3();
    built.model.updateMatrixWorld(true);
    for (const [idx, mesh] of built.partMeshes) {
      const moduleId = MODULE_OF_PART.get(idx);
      if (!moduleId || (focus.length && !focus.includes(moduleId))) continue;
      const base = mesh.userData.basePos as THREE.Vector3;
      const mod = MODULE_BY_ID[moduleId];
      const off = PART_OFFSETS.get(idx)!;
      let ox = off[0];
      if (mod.spreadX && !mod.partExtra?.[idx]) ox += (Math.sign(base.x) || 0.001) * mod.spreadX;
      const away = moduleId === 'shell' && focus.length > 0 && !focus.includes('shell') ? 1 : 0;
      const target = new THREE.Vector3(base.x + ox * explodeTarget, base.y + off[1] * explodeTarget + SHELL_AWAY[1] * away, base.z + off[2] * explodeTarget + SHELL_AWAY[2] * away);
      const matrix = new THREE.Matrix4().compose(target, mesh.quaternion, mesh.scale);
      if (mesh.parent) matrix.premultiply(mesh.parent.matrixWorld);
      mesh.geometry.computeBoundingBox();
      box.union(mesh.geometry.boundingBox!.clone().applyMatrix4(matrix));
    }
    if (!box.isEmpty()) onBounds?.(box);
  }, [built, focus, explodeTarget, onBounds]);

  useFrame((_, delta) => {
    const dt = matchMedia('(prefers-reduced-motion: reduce)').matches ? 1 : Math.min(delta, 0.1);
    const { model, partMeshes, map } = built;
    if (rootRef.current && model.parent !== rootRef.current) rootRef.current.add(model);

    // 1) 爆炸进度阻尼趋近目标
    explodeCur.current = damp(explodeCur.current, explodeTarget, 4.5, dt);
    const e = explodeCur.current;
    // 外壳避让：聚焦功能模块（未聚焦外壳）时整组外壳飞远；结构与底盘/爆炸总览时归位
    const shellAway = focus.length > 0 && !focus.includes('shell');
    awayCur.current = damp(awayCur.current, shellAway ? 1 : 0, 4.5, dt);
    const away = awayCur.current;

    // 2) 零件位移 = 装配位 + 模块位移 × 爆炸进度
    for (const [idx, mesh] of partMeshes) {
      const base = mesh.userData.basePos as THREE.Vector3;
      const off = PART_OFFSETS.get(idx);
      const modId = MODULE_OF_PART.get(idx);
      if (!off || !modId) continue; // 非映射零件（如合并产生的杂名网格）跳过，避免整帧崩溃
      const mod = MODULE_BY_ID[modId];
      let ox = off[0];
      if (mod.spreadX && !mod.partExtra?.[idx]) {
        ox += (Math.sign(base.x) || 0.001) * mod.spreadX;
      }
      const shellClear = modId === 'shell';
      mesh.position.set(
        base.x + ox * e,
        base.y + off[1] * e + (shellClear ? SHELL_AWAY[1] * away : 0),
        base.z + off[2] * e + (shellClear ? SHELL_AWAY[2] * away : 0),
      );
    }

    // 3) 聚焦高亮 + 标签跟随爆炸位移
    for (const mod of MODULES) {
      const g = map[mod.id];
      const focused = focus.includes(mod.id);
      const dimmed = focus.length > 0 && !focused;
      g.opacity = damp(g.opacity, dimmed ? 0.18 : 1, 6, dt);
      g.glow = damp(g.glow, focused ? 1 : 0, 6, dt);

      tmpColor.set(mod.color);
      for (const mesh of g.meshes) {
        const mats = Array.isArray(mesh.material) ? mesh.material : [mesh.material];
        for (const mat of mats as THREE.MeshStandardMaterial[]) {
          mat.opacity = g.opacity;
          const transparent = g.opacity < 0.999;
          if (mat.transparent !== transparent) {
            mat.transparent = transparent;
            mat.depthWrite = !transparent;
          }
          mat.emissive.copy(tmpColor).multiplyScalar(g.glow * 0.22);
        }
      }

      // 标签锚点 = 组中心 + 组位移（护理组整体按 x 符号近似展开）
      const label = labelRefs.current.get(mod.id);
      if (label) {
        const anchor = g.anchor;
        const off = MODULE_BY_ID[mod.id].offset;
        let ax = anchor.x + off[0] * e;
        if (mod.spreadX) ax += (Math.sign(anchor.x) || 0.001) * mod.spreadX * e;
        label.position.set(ax, anchor.y + off[1] * e, anchor.z + off[2] * e);
      }
    }
  });

  const showAllHots = station === 'overview' || station === 'exploded';

  // 点击模型任意部位 → 跳到该模块的站位（触发爆炸 + 相机飞近）
  const handlePick = (ev: ThreeEvent<MouseEvent>) => {
    if (!onPickModule || ev.delta > 5) return;
    const idx = partIndexOf(ev.object.name) ?? partIndexOf(ev.object.parent?.name || '');
    if (idx === null) return;
    const mid = MODULE_OF_PART.get(idx);
    if (mid) { ev.stopPropagation(); onPickModule(mid); }
  };

  return (
    <>
      <group
        ref={rootRef}
        onClick={handlePick}
        onPointerOver={() => {
          if (rootRef.current) rootRef.current.userData.hovered = true;
        }}
        onPointerOut={() => {
          if (rootRef.current) rootRef.current.userData.hovered = false;
        }}
      />
      {MODULES.map((mod) => {
        if (!mod.hotspot) return null; // supply 无独立热点，随结构站位展示
        const focused = focus.includes(mod.id);
        if (!(showAllHots || focused)) return null;
        return (
          <group
            key={mod.id}
            ref={(g) => {
              if (g) labelRefs.current.set(mod.id, g);
              else labelRefs.current.delete(mod.id);
            }}
          >
            <Html center zIndexRange={[30, 20]} className="pod-hot-wrap">
              <button
                type="button"
                className={`pod-hot${focused ? ' on' : ''}`}
                style={{
                  '--lx': `${mod.hotShift?.[0] ?? 0}px`,
                  '--ly': `${mod.hotShift?.[1] ?? 0}px`,
                } as React.CSSProperties}
                aria-label={lang === 'en' ? `${mod.en} module` : `${mod.name} 模块`}
                onClick={(e) => {
                  e.stopPropagation();
                  onPickModule?.(mod.id);
                }}
              >
                {mod.hotspot}
              </button>
            </Html>
          </group>
        );
      })}
    </>
  );
}

/* ---------------- 环境：灯光 / 地面网格 / 接触阴影 / 本地环境反射 ---------------- */

export function PodEnvironment() {
  const gl = useThree((s) => s.gl);
  const scene = useThree((s) => s.scene);

  useEffect(() => {
    const pmrem = new THREE.PMREMGenerator(gl);
    const envTex = pmrem.fromScene(new RoomEnvironment(), 0.04).texture;
    scene.environment = envTex;
    return () => {
      scene.environment = null;
      envTex.dispose();
      pmrem.dispose();
    };
  }, [gl, scene]);

  return (
    <>
      <ambientLight intensity={0.24} />
      <directionalLight
        position={[2.6, 3.2, 2.4]}
        intensity={1.15}
        castShadow
        shadow-mapSize={[1024, 1024]}
        shadow-bias={-0.0004}
      >
        <orthographicCamera attach="shadow-camera" args={[-1.6, 1.6, 2.0, -0.5, 0.1, 9]} />
      </directionalLight>
      {/* 深色背景下的轮廓光：背面冷蓝勾边，正面补光 */}
      <directionalLight position={[-2.6, 1.8, -2.6]} intensity={1.05} color="#7fb2ff" />
      <directionalLight position={[0, 1.4, 2.8]} intensity={0.5} color="#9fc6ff" />
      <FloorGlow />
    </>
  );
}

/** 深色舞台地面辉光（Canvas 径向渐变，衬托产品轮廓） */
function FloorGlow() {
  const tex = useMemo(() => {
    const c = document.createElement('canvas');
    c.width = 256;
    c.height = 256;
    const ctx = c.getContext('2d')!;
    const g = ctx.createRadialGradient(128, 128, 8, 128, 128, 126);
    g.addColorStop(0, 'rgba(96, 140, 255, 0.20)');
    g.addColorStop(0.55, 'rgba(70, 110, 220, 0.08)');
    g.addColorStop(1, 'rgba(70, 110, 220, 0)');
    ctx.fillStyle = g;
    ctx.fillRect(0, 0, 256, 256);
    return new THREE.CanvasTexture(c);
  }, []);
  return (
    <mesh position={[0, 0.0015, 0]} rotation={[-Math.PI / 2, 0, 0]} renderOrder={-1}>
      <planeGeometry args={[2.2, 1.5]} />
      <meshBasicMaterial map={tex} transparent depthWrite={false} />
    </mesh>
  );
}

/* ---------------- 相机导览（站位切换平滑飞行，用户拖拽即交还控制权） ---------------- */

export function CameraRig({ station, bounds, resetToken, onUserOrbit }: { station: StationId; bounds: THREE.Box3 | null; resetToken: number; onUserOrbit: () => void }) {
  const controls = useThree(s => s.controls) as any;
  const camera = useThree(s => s.camera) as THREE.PerspectiveCamera;
  const size = useThree(s => s.size);
  const gl = useThree(s => s.gl);
  const def = STATIONS.find(s => s.id === station)!;
  const desiredPos = useRef(new THREE.Vector3(...def.camera.pos));
  const desiredTarget = useRef(new THREE.Vector3(...def.camera.target));
  const tweenUntil = useRef(0);
  const lastReset = useRef(-1);
  const guidedDirection = useRef(new THREE.Vector3(1.35, .53, 1.7).normalize());
  const frames = useRef(0);
  useEffect(() => {
    if (!bounds || !controls) return;
    const center = bounds.getCenter(new THREE.Vector3());
    const reset = lastReset.current !== resetToken;
    if (reset) guidedDirection.current.set(...def.camera.pos).sub(new THREE.Vector3(...def.camera.target)).normalize();
    const direction = reset || performance.now() < tweenUntil.current
      ? guidedDirection.current.clone()
      : camera.position.clone().sub(controls.target).normalize();
    const right = new THREE.Vector3().crossVectors(new THREE.Vector3(0, 1, 0), direction).normalize();
    const up = new THREE.Vector3().crossVectors(direction, right).normalize();
    const tanV = Math.tan(THREE.MathUtils.degToRad(camera.fov / 2));
    const tanH = tanV * Math.max(0.1, size.width / size.height);
    let distance = .5;
    for (const x of [bounds.min.x, bounds.max.x]) for (const y of [bounds.min.y, bounds.max.y]) for (const z of [bounds.min.z, bounds.max.z]) {
      const v = new THREE.Vector3(x, y, z).sub(center);
      distance = Math.max(distance, Math.abs(v.dot(right)) / tanH + v.dot(direction), Math.abs(v.dot(up)) / tanV + v.dot(direction));
    }
    desiredTarget.current.copy(center);
    desiredPos.current.copy(center).addScaledVector(direction, distance * (size.width < 500 ? 1.25 : 1.2));
    lastReset.current = resetToken;
    tweenUntil.current = performance.now() + 1600;
    if (matchMedia('(prefers-reduced-motion: reduce)').matches) {
      camera.position.copy(desiredPos.current); controls.target.copy(center); controls.update(); tweenUntil.current = 0;
    }
  }, [bounds, controls, camera, def, resetToken, size.width, size.height]);
  useEffect(() => {
    if (!controls) return;
    const cancel = () => { tweenUntil.current = 0; onUserOrbit(); };
    controls.addEventListener('start', cancel);
    // Ordinary wheel continues scrolling the surrounding page; Ctrl + wheel can zoom.
    const wheel = (event: WheelEvent) => { if (!event.ctrlKey) event.stopImmediatePropagation(); };
    gl.domElement.addEventListener('wheel', wheel, { capture: true, passive: true });
    gl.domElement.tabIndex = 0;
    const key = (event: KeyboardEvent) => {
      if (!['ArrowLeft','ArrowRight','ArrowUp','ArrowDown','+','-'].includes(event.key)) return;
      event.preventDefault(); cancel();
      const offset = camera.position.clone().sub(controls.target);
      const spherical = new THREE.Spherical().setFromVector3(offset);
      if (event.key === 'ArrowLeft') spherical.theta -= .13;
      if (event.key === 'ArrowRight') spherical.theta += .13;
      if (event.key === 'ArrowUp') spherical.phi -= .1;
      if (event.key === 'ArrowDown') spherical.phi += .1;
      if (event.key === '+') spherical.radius *= .9;
      if (event.key === '-') spherical.radius *= 1.1;
      spherical.phi = THREE.MathUtils.clamp(spherical.phi, .15, Math.PI * .55);
      spherical.radius = THREE.MathUtils.clamp(spherical.radius, .5, 8);
      camera.position.copy(controls.target).add(new THREE.Vector3().setFromSpherical(spherical)); controls.update();
    };
    gl.domElement.addEventListener('keydown', key);
    return () => { controls.removeEventListener('start', cancel); gl.domElement.removeEventListener('wheel', wheel, true); gl.domElement.removeEventListener('keydown', key); };
  }, [controls, onUserOrbit, gl, camera]);
  useFrame((_, delta) => {
    if (!controls) return;
    if (performance.now() < tweenUntil.current) {
      const k = Math.min(delta * 5.5, 1);
      camera.position.lerp(desiredPos.current, k); controls.target.lerp(desiredTarget.current, k); controls.update();
    } else if (tweenUntil.current > 0) {
      camera.position.copy(desiredPos.current); controls.target.copy(desiredTarget.current); controls.update(); tweenUntil.current = 0;
    }
    const data = gl.domElement.dataset;
    data.frames = String(++frames.current); data.station = station;
    data.distance = camera.position.distanceTo(controls.target).toFixed(5);
    data.angle = Math.atan2(camera.position.x-controls.target.x, camera.position.z-controls.target.z).toFixed(5);
    if (bounds) {
      let left = 1, right = -1, top = -1, bottom = 1;
      for (const x of [bounds.min.x, bounds.max.x]) for (const y of [bounds.min.y, bounds.max.y]) for (const z of [bounds.min.z, bounds.max.z]) {
        const point = new THREE.Vector3(x, y, z).project(camera);
        left = Math.min(left, point.x); right = Math.max(right, point.x); top = Math.max(top, point.y); bottom = Math.min(bottom, point.y);
      }
      data.fit = JSON.stringify({ left, right, top, bottom });
    }
  });
  return null;
}

/* ---------------- 场景总成 ---------------- */

export function PodSceneContent({
  lang,
  station,
  focus,
  explodeTarget,
  onUserOrbit,
  onPickModule,
  onReady,
  resetToken,
}: PodModelProps & { onUserOrbit: () => void; resetToken: number }) {
  const [bounds, setBounds] = useState<THREE.Box3 | null>(null);
  const gl = useThree(s => s.gl);
  useEffect(() => { gl.domElement.setAttribute('role', 'application'); gl.domElement.setAttribute('aria-label', lang === 'en' ? 'L Pro 3D product: drag or use arrow keys to rotate; pinch or plus/minus keys to zoom.' : 'L Pro 三维产品：拖动或方向键旋转，双指或加减键缩放。'); }, [gl, lang]);
  return (
    <>
      <color attach="background" args={['#0a0d13']} />
      <PodEnvironment />
      <PodModel lang={lang} station={station} focus={focus} explodeTarget={explodeTarget} onPickModule={onPickModule} onReady={onReady} onBounds={setBounds} />
      <CameraRig station={station} bounds={bounds} resetToken={resetToken} onUserOrbit={onUserOrbit} />
      <OrbitControls
        makeDefault
        enablePan={false}
        enableDamping
        dampingFactor={0.08}
        minDistance={0.5}
        maxDistance={8}
        maxPolarAngle={Math.PI * 0.55}
        target={[0, 0.5, 0]}
      />
    </>
  );
}

