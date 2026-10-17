import React from 'react';
import { useProgress } from '@react-three/drei';
import { STATIONS, type StationDef, type StationId } from './modules';
import { STRINGS, type Lang } from './i18n';

const stripCircled = (s: string) => s.replace(/^[①②③④⑤⑥]\s*/, '');

/* ---------------- 左上角欧莱雅标志（仿 L'Oréal Professionnel 字标） ---------------- */

export function PodLogo() {
  return (
    <div className="pod-logo" aria-label="L'Oréal Professionnel Paris">
      <span className="pod-logo-loreal">L'ORÉAL</span>
      <span className="pod-logo-pro">PROFESSIONNEL</span>
      <span className="pod-logo-paris">PARIS</span>
    </div>
  );
}

/* ---------------- 右上角语言切换 ---------------- */

export function LangToggle({
  lang,
  onChange,
}: {
  lang: Lang;
  onChange: (lang: Lang) => void;
}) {
  return (
    <div className="pod-lang" role="group" aria-label="Language / 语言">
      <button
        type="button"
        className={`pod-lang-opt${lang === 'en' ? ' on' : ''}`}
        aria-pressed={lang === 'en'}
        onClick={() => onChange('en')}
      >
        EN
      </button>
      <button
        type="button"
        className={`pod-lang-opt${lang === 'zh' ? ' on' : ''}`}
        aria-pressed={lang === 'zh'}
        onClick={() => onChange('zh')}
      >
        中文
      </button>
    </div>
  );
}

/* ---------------- 左侧特性列表（01-06，Steampod 版式） ---------------- */

const FEATURE_ITEMS = STATIONS.filter((s) => s.id !== 'overview');

export function FeatureList({
  lang,
  current,
  onPick,
}: {
  lang: Lang;
  current: StationId;
  onPick: (id: StationId) => void;
}) {
  return (
    <ol className="pod-feats" aria-label={STRINGS[lang].listTitle}>
      {FEATURE_ITEMS.map((s) => {
        const active = s.id === current;
        const title = lang === 'en' ? s.en : stripCircled(s.name);
        const desc = lang === 'en' ? s.briefEn : s.brief;
        return (
          <li key={s.id}>
            <button
              type="button"
              className={`pod-feat${active ? ' on' : ''}`}
              aria-pressed={active}
              onClick={() => onPick(s.id)}
            >
              <span className="pod-feat-title">
                <span className="pod-feat-num">{s.num}</span>
                <span className="pod-feat-dash">–</span>
                <span className="pod-feat-name">{title}</span>
                {lang === 'zh' && <span className="pod-feat-en">{s.en}</span>}
              </span>
              <span className="pod-feat-desc">{desc}</span>
            </button>
          </li>
        );
      })}
    </ol>
  );
}

/* ---------------- 左下角胶囊按钮（自动巡览） ---------------- */

export function TourPill({
  lang,
  autoTour,
  onToggle,
}: {
  lang: Lang;
  autoTour: boolean;
  onToggle: () => void;
}) {
  const t = STRINGS[lang];
  return (
    <button type="button" className="pod-pill" aria-pressed={autoTour} onClick={onToggle}>
      {autoTour ? t.tourActive : t.tourIdle}
    </button>
  );
}

/* ---------------- 3D 面板右下角控件（步进 / 总览 / 爆炸滑杆） ---------------- */

export function SceneControls({
  lang,
  station,
  index,
  explode,
  onPrev,
  onNext,
  onReset,
  onExplode,
}: {
  lang: Lang;
  station: StationDef;
  index: number;
  explode: number;
  onPrev: () => void;
  onNext: () => void;
  onReset: () => void;
  onExplode: (v: number) => void;
}) {
  const t = STRINGS[lang];
  const name = lang === 'en' ? station.en : stripCircled(station.name);
  return (
    <div className="pod-ctl">
      <div className="pod-ctl-station" key={`${lang}-${station.id}`}>
        <span className="pod-ctl-num" style={{ '--mc': station.color } as React.CSSProperties}>
          {station.num}
        </span>
        <span className="pod-ctl-name">{name}</span>
      </div>
      <div className="pod-ctl-slider">
        <span className="pod-ctl-label">EXPLODE</span>
        <input
          type="range"
          min={0}
          max={100}
          value={Math.round(explode * 100)}
          onChange={(e) => onExplode(Number(e.target.value) / 100)}
          aria-label="EXPLODE"
        />
        <span className="pod-ctl-pct">{Math.round(explode * 100)}%</span>
      </div>
      <button type="button" className="pod-ctl-round" onClick={onReset} title={t.resetTitle} aria-label={t.resetTitle}>
        ⟲
      </button>
      <button
        type="button"
        className="pod-ctl-round"
        onClick={onPrev}
        disabled={index === 0}
        title={t.prevTitle}
        aria-label={t.prevTitle}
      >
        ←
      </button>
      <button
        type="button"
        className="pod-ctl-round"
        onClick={onNext}
        disabled={index === STATIONS.length - 1}
        title={t.nextTitle}
        aria-label={t.nextTitle}
      >
        →
      </button>
    </div>
  );
}

/* ---------------- 加载遮罩 ---------------- */

export function LoadingVeil({ lang }: { lang: Lang }) {
  const { active, progress } = useProgress();
  const t = STRINGS[lang];
  if (!active && progress >= 100) return null;
  return (
    <div className="pod-veil" role="status">
      <div className="pod-veil-box">
        <svg viewBox="0 0 64 64" width="46" height="46" fill="none" stroke="#111" strokeWidth="2">
          <circle cx="32" cy="32" r="26" strokeDasharray="120 44" className="pod-veil-ring" />
          <circle cx="32" cy="14" r="4" />
          <circle cx="18" cy="44" r="4" />
          <circle cx="46" cy="44" r="4" />
        </svg>
        <div className="pod-veil-title">{t.loadingTitle}</div>
        <div className="pod-veil-text">{t.loadingText(Math.round(progress))}</div>
        <div className="pod-veil-bar">
          <i style={{ width: `${Math.round(progress)}%` }} />
        </div>
      </div>
    </div>
  );
}
