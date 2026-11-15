// RSS y sitemaps separados por idioma. Nunca incluyen borradores (ni siquiera en `npm run dev`)
// ni las páginas de aviso "este artículo no está traducido".
import rss from '@astrojs/rss';
import { useTranslations, localizedPath, localizedFile, langs, defaultLang, type Lang, type RouteKey } from '../i18n';
import { getArticulos, slugOf } from './articulos';
import { getModulos, slugModulo } from './navegacion';

const publicados = async (lang?: Lang) => (await getArticulos(lang)).filter((a) => !a.data.draft);

/* ---------------- RSS ---------------- */

export async function rssDeIdioma(lang: Lang, site: URL) {
  const t = useTranslations(lang);
  const self = new URL(localizedFile(lang, 'rss.xml'), site).href;
  const items = (await publicados(lang)).map((a) => ({
    title: a.data.title,
    description: a.data.description,
    pubDate: a.data.pubDate,
    link: localizedPath(lang, 'articles', slugOf(a)),
    categories: [t.categories[a.data.category], ...a.data.tags],
  }));
  return rss({
    title: `${t.meta.siteName} — ${t.nav.articles}`,
    description: t.meta.siteDescription,
    site: new URL(localizedPath(lang, 'home'), site).href,
    items,
    trailingSlash: true,
    xmlns: { atom: 'http://www.w3.org/2005/Atom' },
    customData: `<language>${t.meta.dateLocale}</language><atom:link href="${self}" rel="self" type="application/rss+xml"/>`,
  });
}

/* ---------------- Sitemap ---------------- */

interface Entrada {
  lang: Lang;
  loc: string;
  lastmod?: Date;
  /** Versiones en cada idioma (incluida la propia). */
  alternativas: Partial<Record<Lang, string>>;
}

const SECCIONES: RouteKey[] = ['home', 'articles', 'training', 'projects', 'about'];

async function entradas(site: URL): Promise<Entrada[]> {
  const abs = (p: string) => new URL(p, site).href;
  const lista: Entrada[] = [];

  // Secciones fijas: existen en los dos idiomas
  for (const key of SECCIONES) {
    const alternativas = Object.fromEntries(langs.map((l) => [l, abs(localizedPath(l, key))]));
    for (const l of langs) lista.push({ lang: l, loc: alternativas[l], alternativas });
  }

  // Artículos: solo las versiones que existen de verdad
  const arts = await publicados();
  for (const slug of new Set(arts.map(slugOf))) {
    const versiones = arts.filter((a) => slugOf(a) === slug);
    const alternativas = Object.fromEntries(versiones.map((a) => [a.data.lang, abs(localizedPath(a.data.lang, 'articles', slug))]));
    for (const a of versiones)
      lista.push({ lang: a.data.lang, loc: alternativas[a.data.lang], lastmod: a.data.updatedDate ?? a.data.pubDate, alternativas });
  }

  // Módulos del curso: versiones que existen, enlazadas entre idiomas
  const mods = (await Promise.all(langs.map((l) => getModulos(l)))).flat().filter((m) => !m.data.draft);
  for (const slug of new Set(mods.map(slugModulo))) {
    const versiones = mods.filter((m) => slugModulo(m) === slug);
    const alternativas = Object.fromEntries(versiones.map((m) => [m.data.lang, abs(localizedPath(m.data.lang, 'training', slug))]));
    for (const m of versiones)
      lista.push({ lang: m.data.lang, loc: alternativas[m.data.lang], lastmod: m.data.updatedDate ?? m.data.pubDate, alternativas });
  }
  return lista;
}

const xml = (s: string) => s.replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;').replace(/"/g, '&quot;');

export async function sitemapDeIdioma(lang: Lang, site: URL) {
  const urls = (await entradas(site))
    .filter((e) => e.lang === lang)
    .map((e) => {
      const alts = Object.entries(e.alternativas);
      const links =
        alts.length > 1
          ? [
              ...alts.map(([l, href]) => `<xhtml:link rel="alternate" hreflang="${l}" href="${xml(href!)}"/>`),
              `<xhtml:link rel="alternate" hreflang="x-default" href="${xml(e.alternativas[defaultLang] ?? e.loc)}"/>`,
            ].join('')
          : '';
      const lastmod = e.lastmod ? `<lastmod>${e.lastmod.toISOString().slice(0, 10)}</lastmod>` : '';
      return `<url><loc>${xml(e.loc)}</loc>${lastmod}${links}</url>`;
    });
  return new Response(
    `<?xml version="1.0" encoding="UTF-8"?>\n<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9" xmlns:xhtml="http://www.w3.org/1999/xhtml">\n${urls.join('\n')}\n</urlset>\n`,
    { headers: { 'Content-Type': 'application/xml; charset=utf-8' } },
  );
}

export function sitemapIndex(site: URL) {
  const items = langs.map((l) => `<sitemap><loc>${xml(new URL(`sitemap-${l}.xml`, site).href)}</loc></sitemap>`);
  return new Response(
    `<?xml version="1.0" encoding="UTF-8"?>\n<sitemapindex xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">\n${items.join('\n')}\n</sitemapindex>\n`,
    { headers: { 'Content-Type': 'application/xml; charset=utf-8' } },
  );
}
