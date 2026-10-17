/* ---------------- 双语字典：默认英文，右上角可切换中文 ---------------- */

export type Lang = 'en' | 'zh';

export const DEFAULT_LANG: Lang = 'en';
const LANG_KEY = 'pod-lang';

export function initialLang(): Lang {
  try {
    const q = new URLSearchParams(window.location.search).get('lang');
    if (q === 'en' || q === 'zh') return q;
    const saved = localStorage.getItem(LANG_KEY);
    if (saved === 'en' || saved === 'zh') return saved;
  } catch {
    /* 隐私模式等场景下忽略存储异常 */
  }
  return DEFAULT_LANG;
}

export function persistLang(lang: Lang) {
  try {
    localStorage.setItem(LANG_KEY, lang);
  } catch {
    /* ignore */
  }
}

export interface Strings {
  hero: [string, string, string];
  listTitle: string;
  tourIdle: string;
  tourActive: string;
  resetTitle: string;
  prevTitle: string;
  nextTitle: string;
  loadingTitle: string;
  loadingText: (pct: number) => string;
  fallback: string;
  /** 语言切换按钮上显示的目标语言 */
  otherLang: string;
  htmlLang: string;
}

export const STRINGS: Record<Lang, Strings> = {
  en: {
    hero: ['L Pro', 'exclusive', 'features.'],
    listTitle: 'Module features',
    tourIdle: 'Auto guided tour',
    tourActive: 'Stop tour',
    resetTitle: 'Back to overview',
    prevTitle: 'Previous module',
    nextTitle: 'Next module',
    loadingTitle: "L'ORÉAL PROFESSIONNEL",
    loadingText: (pct) => `Loading assembly model ${pct}%`,
    fallback:
      'WebGL is unavailable in this browser. Enable hardware acceleration or switch to a modern browser to launch the exploded-view bench.',
    otherLang: '中文',
    htmlLang: 'en',
  },
  zh: {
    hero: ['L Pro', '独家功能', '全解析。'],
    listTitle: '模块特性目录',
    tourIdle: '自动巡览',
    tourActive: '停止巡览',
    resetTitle: '回到整机总览',
    prevTitle: '上一站位',
    nextTitle: '下一站位',
    loadingTitle: "L'ORÉAL PROFESSIONNEL",
    loadingText: (pct) => `正在装载整机模型 ${pct}%`,
    fallback: '当前浏览器无法启动爆炸实验台，请开启硬件加速或使用支持 WebGL 的现代浏览器。',
    otherLang: 'EN',
    htmlLang: 'zh-CN',
  },
};
