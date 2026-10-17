// Reference UI/state preserved; scoped lifecycle, page scrolling and recovery added for K pro.
import React, { Suspense, useCallback, useEffect, useRef, useState } from 'react';
import { Canvas } from '@react-three/fiber';
import { useGLTF } from '@react-three/drei';
import { PCFShadowMap } from 'three';
import { PodSceneContent } from './PodScene';
import { FeatureList, LoadingVeil, SceneControls, TourPill } from './ui';
import { STATIONS, STATION_OF_MODULE, type ModuleId } from './modules';
import { STRINGS, type Lang } from './i18n';
const config = (window as any).KPRO_CONTENT.productAnatomy;
class SceneBoundary extends React.Component<{ children: React.ReactNode; onError: () => void }, { error: boolean }> {
  state = { error: false };
  static getDerivedStateFromError() { return { error: true }; }
  componentDidCatch() { this.props.onError(); }
  render() { return this.state.error ? null : this.props.children; }
}
export function PodApp() {
  const [lang, setLang] = useState<Lang>((window as any).KPRO_LANGUAGE || 'en');
  const [stationIdx, setStationIdx] = useState(0);
  const [explodeOverride, setExplodeOverride] = useState<number | null>(null);
  const [autoTour, setAutoTour] = useState(false);
  const [active, setActive] = useState(false);
  const [error, setError] = useState(() => {
    try { const canvas = document.createElement('canvas'); const context = canvas.getContext('webgl2'); const available = !!context; context?.getExtension('WEBGL_lose_context')?.loseContext(); return !available; } catch { return true; }
  });
  const [ready, setReady] = useState(false);
  const [attempt, setAttempt] = useState(0);
  const [resetToken, setResetToken] = useState(0);
  const host = useRef<HTMLDivElement>(null);
  const station = STATIONS[stationIdx];
  const t = STRINGS[lang];
  const explodeTarget = explodeOverride ?? station.explode;
  useEffect(() => {
    const change = (event: Event) => setLang((event as CustomEvent).detail.lang);
    window.addEventListener('kpro:language', change);
    return () => window.removeEventListener('kpro:language', change);
  }, []);
  useEffect(() => {
    let visible = false;
    const sync = () => setActive(visible && !document.hidden && !document.querySelector('dialog[open]'));
    const observer = new IntersectionObserver(entries => { visible = entries[0].isIntersecting; sync(); });
    observer.observe(host.current!);
    document.addEventListener('visibilitychange', sync);
    const modalObserver = new MutationObserver(sync);
    document.querySelectorAll('dialog').forEach(dialog => modalObserver.observe(dialog, { attributes: true, attributeFilter: ['open'] }));
    return () => { observer.disconnect(); modalObserver.disconnect(); document.removeEventListener('visibilitychange', sync); };
  }, []);
  useEffect(() => {
    if (ready || error) return;
    const timer = setTimeout(() => setError(true), config.loadTimeoutMs || 45000);
    return () => clearTimeout(timer);
  }, [ready, error, attempt]);
  useEffect(() => {
    if (!autoTour || !active || !ready || error) return;
    const timer = setInterval(() => {
      setStationIdx(i => (i + 1) % STATIONS.length); setExplodeOverride(null);
    }, config.tourIntervalMs || 7000);
    return () => clearInterval(timer);
  }, [autoTour, active, ready, error]);
  const pickStation = useCallback((id: string) => {
    const index = STATIONS.findIndex(s => s.id === id);
    if (index < 0) return;
    setAutoTour(false); setStationIdx(index); setExplodeOverride(null); setResetToken(v => v + 1);
  }, []);
  const step = (dir: number) => pickStation(STATIONS[Math.min(STATIONS.length - 1, Math.max(0, stationIdx + dir))].id);
  const onUserOrbit = useCallback(() => setAutoTour(false), []);
  const onPickModule = useCallback((id: ModuleId) => pickStation(STATION_OF_MODULE[id]), [pickStation]);
  const onReady = useCallback(() => setReady(true), []);
  const onError = useCallback(() => setError(true), []);
  const retry = () => { useGLTF.clear(config.model); setReady(false); setError(false); setAttempt(v => v + 1); };
  return (
    <div className="pod-shell" ref={host} lang={lang === 'zh' ? 'zh-CN' : 'en'} data-station={station.id} data-explode={explodeTarget} data-state={error ? 'fallback' : ready ? 'ready' : 'loading'} data-active={active} data-tour={autoTour}>
      <div className="pod-body">
        <aside className="pod-left">
          <h2 className="pod-hero" id="product-title">{t.hero.map((line, i) => <React.Fragment key={i}>{i > 0 && <><span className="pod-title-space"> </span><br /></>}{line}</React.Fragment>)}</h2>
          <FeatureList lang={lang} current={station.id} onPick={pickStation} />
          <p className="pod-mobile-description">{lang === 'en' ? station.briefEn : station.brief}</p>
          <div className="pod-left-foot"><TourPill lang={lang} disabled={!ready || error} autoTour={autoTour} onToggle={() => setAutoTour(v => !v)} /></div>
        </aside>
        <div className="pod-stage" aria-label={lang === 'en' ? 'Interactive product model' : '可交互产品模型'}>
          {!error && <SceneBoundary key={attempt} onError={onError}>
            <Canvas className="pod-canvas" shadows={{ type: PCFShadowMap }} frameloop={active ? 'always' : 'never'}
              gl={{ antialias: true, alpha: false, powerPreference: 'default' }}
              camera={{ position: [1.35, 1.05, 1.7], fov: 42, near: 0.02, far: 40 }}
              dpr={[1, config.maxDpr || 1.5]}
              onCreated={({ gl }) => { gl.domElement.addEventListener('webglcontextlost', onError, { once: true }); }}
              fallback={<p>{t.fallback}</p>}>
              <Suspense fallback={null}>
                <PodSceneContent lang={lang} station={station.id} focus={station.focus} explodeTarget={explodeTarget} onUserOrbit={onUserOrbit} onPickModule={onPickModule} onReady={onReady} resetToken={resetToken} />
              </Suspense>
            </Canvas>
          </SceneBoundary>}
          {error ? <div className="pod-error" role="status"><img src={config.fallbackImage} alt={lang === 'en' ? 'L Pro product concept' : 'L Pro 产品概念图'} /><div><p>{lang === 'en' ? 'The 3D model could not load. You can still explore the six features.' : '3D 模型暂时无法加载，你仍可浏览六项功能。'}</p><button className="pod-pill" onClick={retry}>{lang === 'en' ? 'Try again' : '重新加载'}</button></div></div> : !ready && <LoadingVeil lang={lang} />}
          <SceneControls lang={lang} station={station} index={stationIdx} explode={explodeTarget} onPrev={() => step(-1)} onNext={() => step(1)} onReset={() => pickStation('overview')} onExplode={v => { setAutoTour(false); setExplodeOverride(v); }} disabled={!ready || error} />
        </div>
      </div>
    </div>
  );
}
