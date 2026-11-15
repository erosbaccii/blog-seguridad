import { getCollection } from 'astro:content';
import { CATEGORIAS } from '../content.config';
import { useTranslations, localizedPath, type Lang } from '../i18n';
import { getArticulos, slugOf } from './articulos';

export interface NavItem {
  label: string;
  href: string;
  current?: boolean;
}
export interface NavGroup {
  id: string;
  label: string;
  icon: string;
  items: NavItem[];
  current?: boolean;
}

const marcar = (items: NavItem[], currentHref?: string) =>
  items.map((i) => ({ ...i, current: i.href === currentHref }));

/** Árbol de la sección Artículos: categorías → artículos del idioma. */
export async function navArticulos(lang: Lang, currentHref?: string): Promise<NavGroup[]> {
  const t = useTranslations(lang);
  const arts = await getArticulos(lang);
  return CATEGORIAS.map((c) => {
    const items = marcar(
      arts
        .filter((a) => a.data.category === c)
        .map((a) => ({ label: a.data.title, href: localizedPath(lang, 'articles', slugOf(a)) })),
      currentHref,
    );
    return { id: c, label: t.categories[c], icon: c, items, current: items.some((i) => i.current) };
  });
}

/** Módulos del curso anti-phishing, ordenados. */
export async function getModulos(lang: Lang) {
  const all = await getCollection('modulos', ({ data }) => import.meta.env.DEV || !data.draft);
  return all.filter((m) => m.data.lang === lang).sort((a, b) => a.data.order - b.data.order);
}

/** Árbol de la sección Entrenamiento: curso → módulos. */
export async function navEntrenamiento(lang: Lang, currentHref?: string): Promise<NavGroup[]> {
  const t = useTranslations(lang);
  const items = marcar(
    (await getModulos(lang)).map((m) => ({
      label: m.data.title,
      href: localizedPath(lang, 'training', slugModulo(m)),
    })),
    currentHref,
  );
  return [{ id: 'anti-phishing', label: t.training.courseName, icon: 'anti-phishing', items, current: true }];
}

export type Modulo = Awaited<ReturnType<typeof getModulos>>[number];

/** El slug del módulo es el nombre de su carpeta. */
export const slugModulo = (m: Modulo) => m.id.split('/')[0];

/** Una ruta por módulo que existe en `lang`, con su versión en el otro idioma si la hay. */
export async function getRutasModulos(lang: Lang) {
  const propios = await getModulos(lang);
  const otros = await getModulos(lang === 'es' ? 'en' : 'es');
  return propios.map((entry, i) => ({
    params: { slug: slugModulo(entry) },
    props: {
      entry,
      alternate: otros.find((o) => slugModulo(o) === slugModulo(entry)),
      prev: propios[i - 1],
      next: propios[i + 1],
    },
  }));
}
