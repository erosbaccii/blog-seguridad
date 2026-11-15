import { defineCollection } from 'astro:content';
import { glob } from 'astro/loaders';
import { z } from 'astro/zod';

export const CATEGORIAS = ['blue-team', 'casos-reales', 'que-hacer-si', 'ia-seguridad', 'tesis'] as const;
export const NIVELES = ['basico', 'intermedio'] as const;
export const PUBLICOS = ['personas', 'empresas', 'tecnicos'] as const;

/*
 * Un artículo = una carpeta. Ejemplo:
 *   src/content/articulos/correo-sospechoso/es.mdx   ← versión en español
 *   src/content/articulos/correo-sospechoso/en.mdx   ← versión en inglés (opcional)
 *   src/content/articulos/correo-sospechoso/imagenes/ ← imágenes compartidas
 * El nombre de la carpeta es el slug, igual en los dos idiomas.
 */
const articulos = defineCollection({
  loader: glob({ pattern: '*/{es,en}.{md,mdx}', base: './src/content/articulos' }),
  schema: ({ image }) =>
    z
      .object({
        title: z.string().min(1),
        description: z.string().min(1).max(220),
        pubDate: z.coerce.date(),
        updatedDate: z.coerce.date().optional(),
        category: z.enum(CATEGORIAS),
        tags: z.array(z.string()).default([]),
        nivel: z.enum(NIVELES),
        publico: z.array(z.enum(PUBLICOS)).min(1),
        draft: z.boolean().default(false),
        lang: z.enum(['es', 'en']),
        translationOf: z.string().optional(),
        pdf: z
          .string()
          .regex(/^\/descargas\/[\w.-]+\.pdf$/, 'El PDF tiene que estar en /descargas/nombre.pdf')
          .optional(),
        cover: image().optional(),
        coverAlt: z.string().optional(),
      })
      .refine((d) => !d.cover || !!d.coverAlt, {
        message: 'Si hay "cover", agregá "coverAlt" (texto alternativo en el idioma del artículo).',
        path: ['coverAlt'],
      })
      .refine((d) => !d.updatedDate || d.updatedDate >= d.pubDate, {
        message: '"updatedDate" no puede ser anterior a "pubDate".',
        path: ['updatedDate'],
      }),
});

/*
 * Módulos del curso anti-phishing:
 *   src/content/modulos/<slug>/es.md  y  en.md
 * El quiz va en el frontmatter; "answer" es la posición (desde 0) de la opción correcta.
 */
const pregunta = z
  .object({
    question: z.string().min(1),
    options: z.array(z.string().min(1)).min(2).max(5),
    answer: z.number().int().nonnegative(),
    explanation: z.string().min(1),
  })
  .refine((q) => q.answer < q.options.length, {
    message: '"answer" tiene que ser la posición de una de las opciones (empieza en 0).',
    path: ['answer'],
  });

const modulos = defineCollection({
  loader: glob({ pattern: '*/{es,en}.{md,mdx}', base: './src/content/modulos' }),
  schema: z.object({
    title: z.string().min(1),
    description: z.string().min(1).max(220),
    order: z.number().int().positive(),
    minutes: z.number().int().positive(),
    pubDate: z.coerce.date(),
    updatedDate: z.coerce.date().optional(),
    lang: z.enum(['es', 'en']),
    translationOf: z.string().optional(),
    draft: z.boolean().default(false),
    quiz: z.array(pregunta).default([]),
  }),
});

export const collections = { articulos, modulos };
