import en from './en.json';
import fa from './fa.json';

export type Locale = 'en' | 'fa';
export type Dictionary = typeof en;

const locales: Record<Locale, Dictionary> = { en, fa };

export function getLocale(lang: Locale): Dictionary {
  return locales[lang] || locales.en;
}

export function getLangFromPath(pathname: string): Locale {
  if (pathname.startsWith('/fa')) return 'fa';
  return 'en';
}

export function getOtherLang(lang: Locale): Locale {
  return lang === 'en' ? 'fa' : 'en';
}

export function switchLang(pathname: string, targetLang: Locale): string {
  const currentLang = getLangFromPath(pathname);
  if (currentLang === targetLang) return pathname;

  let path = pathname;
  // Remove current lang prefix
  if (currentLang === 'fa') {
    path = path.replace(/^\/fa/, '') || '/';
  }

  // Add target lang prefix
  if (targetLang === 'fa') {
    path = '/fa' + (path === '/' ? '' : path);
  }

  return path;
}
