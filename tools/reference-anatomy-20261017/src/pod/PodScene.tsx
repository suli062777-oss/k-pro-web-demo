import React, { useEffect, useMemo, useRef } from 'react';
import * as THREE from 'three';
import { useFrame, useThree, type ThreeEvent } from '@react-three/fiber';
import { Html, OrbitControls, useGLTF } from '@react-three/drei';
import { RoomEnvironment } from 'three/examples/jsm/environments/RoomEnvironment.js';
import { damp } from '../product/animations';
import { MODULES, MODULE_BY_ID, STATIONS, type ModuleId, type StationId } from './modules';
import type { Lang } from './i18n';

export const MODEL_URL = `${import.meta.env.BASE_URL}models/pod-colored.glb`;

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
}

export function PodModel({ lang, station, focus, explodeTarget, onPickModule }: PodModelProps) {
  const gltf = useGLTF(MODEL_URL, false, true);
  const rootRef = useRef<THREE.Group>(null);
  const labelRefs = useRef(new Map<ModuleId, THREE.Group>());
  const explodeCur = useRef(0);
  const awayCur = useRef(0);
  const tmpColor = useMemo(() => new THREE.Color(), []);

  const built = useMemo(() => {
    const model = gltf.scene.clone(true);
    const partMeshes = new Map<number, THREE.Mesh>();

    model.traverse((child) => {
      const mesh = child as THREE.Mesh;
      if (!mesh.isMesh) return;
      const idx = partIndexOf(mesh.name) ?? partIndexOf(mesh.parent?.name || '');
      if (idx === null) return;
      partMeshes.set(idx, mesh);
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

  useFrame((_, delta) => {
    const dt = Math.min(delta, 0.1);
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
    if (!onPickModule) return;
    const idx = partIndexOf(ev.object.name) ?? partIndexOf(ev.object.parent?.name || '');
    if (idx === null) return;
    const mid = MODULE_OF_PART.get(idx);
    if (mid) onPickModule(mid);
  };

  return (
    <>
      <group
        ref={rootRef}
        onClick={handlePick}
        onPointerOver={() => {
          document.body.style.cursor = 'pointer';
        }}
        onPointerOut={() => {
          document.body.style.cursor = 'auto';
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

export function CameraRig({ station, onUserOrbit }: { station: StationId; onUserOrbit: () => void }) {
  const controls = useThree((s) => s.controls) as
    | {
        target: THREE.Vector3;
        addEventListener: (t: string, f: () => void) => void;
        removeEventListener: (t: string, f: () => void) => void;
        update: () => void;
      }
    | null;
  const camera = useThree((s) => s.camera);
  const def = STATIONS.find((s) => s.id === station)!;
  const desiredPos = useRef(new THREE.Vector3(...def.camera.pos));
  const desiredTarget = useRef(new THREE.Vector3(...def.camera.target));
  const tweenUntil = useRef(0);
  const stationRef = useRef(station);

  useEffect(() => {
    desiredPos.current.set(...def.camera.pos);
    desiredTarget.current.set(...def.camera.target);
    if (stationRef.current !== station) {
      stationRef.current = station;
      tweenUntil.current = performance.now() + 2000;
    }
  }, [station, def]);

  useEffect(() => {
    if (!controls) return;
    const cancel = () => {
      tweenUntil.current = 0;
      onUserOrbit();
    };
    controls.addEventListener('start', cancel);
    return () => controls.removeEventListener('start', cancel);
  }, [controls, onUserOrbit]);

  useFrame((_, delta) => {
    if (!controls) return;
    if (performance.now() < tweenUntil.current) {
      const k = Math.min(delta * 3.4, 1);
      camera.position.lerp(desiredPos.current, k);
      controls.target.lerp(desiredTarget.current, k);
      controls.update();
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
}: PodModelProps & { onUserOrbit: () => void }) {
  return (
    <>
      <color attach="background" args={['#0a0d13']} />
      <PodEnvironment />
      <PodModel lang={lang} station={station} focus={focus} explodeTarget={explodeTarget} onPickModule={onPickModule} />
      <CameraRig station={station} onUserOrbit={onUserOrbit} />
      <OrbitControls
        makeDefault
        enableDamping
        dampingFactor={0.08}
        minDistance={0.5}
        maxDistance={6}
        maxPolarAngle={Math.PI * 0.55}
        target={[0, 0.5, 0]}
      />
    </>
  );
}

useGLTF.preload(MODEL_URL);
