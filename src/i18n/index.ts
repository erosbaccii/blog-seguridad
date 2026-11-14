import { getRelativeLocaleUrl } from 'astro:i18n';
import { es } from './ui/es';
import { en } from './ui/en';

export const languages = { es: 'Español', en: 'English' } as const;
export type Lang = keyof typeof languages;
export const defaultLang: Lang = 'es';
export const langs = Object.keys(languages) as Lang[];

const dictionaries = { es, en };

export function useTranslations(lang: Lang) {
  return dictionaries[lang];
}

export function getLang(locale: string | undefined): Lang {
  return locale === 'en' ? 'en' : 'es';
}

export function otherLang(lang: Lang): Lang {
  return lang === 'es' ? 'en' : 'es';
}

/** Reemplaza {clave} en un texto de traducción. */
export function fmt(template: string, vars: Record<string, string | number>) {
  return template.replace(/\{(\w+)\}/g, (_, k: string) => String(vars[k] ?? `{${k}}`));
}

export function formatDate(date: Date, lang: Lang) {
  return new Intl.DateTimeFormat(dictionaries[lang].meta.dateLocale, {
    day: 'numeric',
    month: 'long',
    year: 'numeric',
    timeZone: 'UTC',
  }).format(date);
}

/** Segmento de URL de cada sección, por idioma (URLs limpias y traducidas). */
export const routes = {
  home: { es: '', en: '' },
  articles: { es: 'articulos', en: 'articles' },
  training: { es: 'entrenamiento', en: 'training' },
  projects: { es: 'proyectos', en: 'projects' },
  about: { es: 'sobre-mi', en: 'about' },
} as const;
export type RouteKey = keyof typeof routes;

/** URL relativa de una sección (y subruta opcional) en un idioma. */
export function localizedPath(lang: Lang, key: RouteKey, ...rest: string[]) {
  const path = [routes[key][lang], ...rest].filter(Boolean).join('/');
  return getRelativeLocaleUrl(lang, path);
}

/** URL de un archivo (rss.xml, sitemap.xml…) en un idioma, sin barra final. */
export function localizedFile(lang: Lang, file: string) {
  return `${lang === defaultLang ? '' : `/${lang}`}/${file}`;
}
