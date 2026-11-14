import { getCollection, type CollectionEntry } from 'astro:content';
import type { Lang } from '../i18n';

export type Articulo = CollectionEntry<'articulos'>;

// En `npm run dev` se ven los borradores (con una etiqueta); en el build de producción no.
const mostrarBorradores = import.meta.env.DEV;

/** El slug es el nombre de la carpeta del artículo. */
export const slugOf = (a: Articulo) => a.id.split('/')[0];

export async function getArticulos(lang?: Lang) {
  const all = await getCollection('articulos', ({ data }) => mostrarBorradores || !data.draft);
  return all
    .filter((a) => !lang || a.data.lang === lang)
    .sort((a, b) => b.data.pubDate.valueOf() - a.data.pubDate.valueOf());
}

/**
 * Rutas de artículos para un idioma: una por slug existente en CUALQUIER idioma.
 * Si falta la versión en `lang`, `entry` queda vacío y la página muestra el aviso.
 */
export async function getRutasArticulos(lang: Lang) {
  const all = await getArticulos();
  const slugs = [...new Set(all.map(slugOf))];
  return slugs.map((slug) => ({
    params: { slug },
    props: {
      slug,
      entry: all.find((a) => slugOf(a) === slug && a.data.lang === lang),
      alternate: all.find((a) => slugOf(a) === slug && a.data.lang !== lang),
    },
  }));
}

/** Minutos de lectura estimados (200 palabras por minuto). */
export function readingTime(body = '') {
  const text = body
    .replace(/^import\s.+$/gm, ' ')
    .replace(/```[\s\S]*?```/g, ' ')
    .replace(/<[^>]+>/g, ' ')
    .replace(/[#>*_`[\]()!-]/g, ' ');
  const words = text.split(/\s+/).filter(Boolean).length;
  return Math.max(1, Math.round(words / 200));
}
