import React, { Suspense, useCallback, useEffect, useState } from 'react';
import { Canvas } from '@react-three/fiber';
import { PodSceneContent } from './PodScene';
import { FeatureList, LangToggle, LoadingVeil, PodLogo, SceneControls, TourPill } from './ui';
import { STATIONS, STATION_OF_MODULE, type ModuleId } from './modules';
import { STRINGS, initialLang, persistLang, type Lang } from './i18n';

function webglAvailable(): boolean {
  try {
    const c = document.createElement('canvas');
    return !!(c.getContext('webgl2') || c.getContext('webgl'));
  } catch {
    return false;
  }
}

export function PodApp() {
  const [lang, setLang] = useState<Lang>(initialLang);
  const [stationIdx, setStationIdx] = useState(0);
  const [explodeOverride, setExplodeOverride] = useState<number | null>(null);
  const [autoTour, setAutoTour] = useState(false);
  const station = STATIONS[stationIdx];

  const changeLang = useCallback((next: Lang) => {
    setLang(next);
    persistLang(next);
  }, []);

  useEffect(() => {
    document.documentElement.lang = STRINGS[lang].htmlLang;
    document.title =
      lang === 'en'
        ? "L Pro Exclusive Features · L'Oréal Professionnel"
        : 'L Pro 独家功能全解析 · 欧莱雅沙龙专属';
  }, [lang]);

  const goStation = useCallback((idx: number) => {
    setStationIdx(idx);
    setExplodeOverride(null);
  }, []);

  const pickStation = useCallback(
    (id: string) => {
      setAutoTour(false);
      const idx = STATIONS.findIndex((s) => s.id === id);
      if (idx >= 0) goStation(idx);
    },
    [goStation],
  );

  const step = useCallback(
    (dir: 1 | -1) => {
      setAutoTour(false);
      goStation(Math.min(STATIONS.length - 1, Math.max(0, stationIdx + dir)));
    },
    [stationIdx, goStation],
  );

  // 自动巡览：每 7 秒推进一个站位
  useEffect(() => {
    if (!autoTour) return;
    const timer = window.setInterval(() => {
      setStationIdx((i) => (i + 1) % STATIONS.length);
      setExplodeOverride(null);
    }, 7000);
    return () => window.clearInterval(timer);
  }, [autoTour]);

  const onUserOrbit = useCallback(() => setAutoTour(false), []);

  // 点击模型部位 / 热点圆标：跳到所属模块的站位（自动爆炸 + 相机飞近）
  const onPickModule = useCallback(
    (moduleId: ModuleId) => {
      const sid = STATION_OF_MODULE[moduleId];
      if (sid) pickStation(sid);
    },
    [pickStation],
  );

  // 爆炸进度：站位默认值，滑杆可覆盖
  const explodeTarget = explodeOverride ?? station.explode;
  const onExplode = useCallback((v: number) => {
    setAutoTour(false);
    setExplodeOverride(v);
  }, []);

  if (!webglAvailable()) {
    return (
      <div className="pod-fallback">
        <p>{STRINGS[lang].fallback}</p>
      </div>
    );
  }

  const isMobile = window.innerWidth < 760;

  return (
    <div className="pod-shell">
      <header className="pod-top">
        <PodLogo />
        <LangToggle lang={lang} onChange={changeLang} />
      </header>

      <div className="pod-body">
        <aside className="pod-left">
          <h1 className="pod-hero">
            {STRINGS[lang].hero[0]}
            <br />
            {STRINGS[lang].hero[1]}
            <br />
            {STRINGS[lang].hero[2]}
          </h1>
          <FeatureList lang={lang} current={station.id} onPick={pickStation} />
          <div className="pod-left-foot">
            <TourPill lang={lang} autoTour={autoTour} onToggle={() => setAutoTour((v) => !v)} />
          </div>
        </aside>

        <main className="pod-stage">
          <Canvas
            shadows
            gl={{ antialias: true, alpha: false, powerPreference: 'default' }}
            camera={{ position: [1.35, 1.05, 1.7], fov: 42, near: 0.02, far: 40 }}
            style={{ position: 'absolute', inset: 0 }}
            dpr={Math.min(window.devicePixelRatio || 1, isMobile ? 1.5 : 2)}
          >
            <Suspense fallback={null}>
              <PodSceneContent
                lang={lang}
                station={station.id}
                focus={station.focus}
                explodeTarget={explodeTarget}
                onUserOrbit={onUserOrbit}
                onPickModule={onPickModule}
              />
            </Suspense>
          </Canvas>
          <SceneControls
            lang={lang}
            station={station}
            index={stationIdx}
            explode={explodeTarget}
            onPrev={() => step(-1)}
            onNext={() => step(1)}
            onReset={() => pickStation('overview')}
            onExplode={onExplode}
          />
          <LoadingVeil lang={lang} />
        </main>
      </div>
    </div>
  );
}
