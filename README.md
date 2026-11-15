# Sitio personal — seguridad defensiva

Blog estático hecho con [Astro](https://astro.build): artículos en español e inglés, entrenamiento anti-phishing y proyectos.

## Comandos

| Comando | Qué hace |
| --- | --- |
| `npm install` | Instala las dependencias |
| `npm run dev` | Servidor local en `http://localhost:4321` (muestra borradores) |
| `npm run build` | Genera el sitio en `dist/` (sin borradores) y verifica que cumpla la CSP |
| `npm run contraste` | Verifica el contraste WCAG AA de la paleta |
| `npm run word -- "archivo.docx"` | Convierte un Word de `../originales/` en artículo |
| `npm run privacidad` | Busca metadatos, rutas de la PC, usuario y emails (`-- --dist` revisa también el build) |
| `npm run og` | Regenera las imágenes para compartir (`public/og/`) |

## Seguridad y privacidad

- **Cabeceras** (`public/_headers`, Cloudflare Pages): CSP estricta sin `unsafe-inline`, HSTS, `X-Content-Type-Options`, `Referrer-Policy`, `Permissions-Policy` y `frame-ancestors 'none'` / `X-Frame-Options`.
- **Sin nada inline:** todo el JS y el CSS son archivos propios. `scripts/verificar-csp.mjs` corre en cada build y falla si aparece un `<script>`/`<style>` inline, un `style=""`, un `onclick=""` o un recurso de terceros.
- **Descargas:** el build quita de `dist/` los PDFs que solo usa un borrador.
- **Antes de cada push** (hook `.githooks/pre-push`, se activa con `git config core.hooksPath .githooks`): revisa los archivos y cada commit que se va a subir, incluido el email del autor, que tiene que ser el "noreply" de GitHub. Si encuentra algo, frena el push y dice en qué archivo.
- **Estadísticas:** Cloudflare Web Analytics (sin cookies). La CSP ya lo permite.

## SEO

`hreflang` en cada página, sitemap por idioma (`/sitemap-es.xml`, `/sitemap-en.xml`, índice en `/sitemap-index.xml`), RSS por idioma (`/rss.xml`, `/en/rss.xml`), `robots.txt`, Open Graph y Twitter Cards con imagen 1200×630, y datos estructurados (JSON-LD) en el inicio y en los artículos.

## Word → artículo

```bash
npm run word -- "Mi tesis.docx"
npm run word -- "Mi tesis.docx" --slug mi-tesis --reemplazar
```

Requiere [Pandoc](https://pandoc.org) (`winget install JohnMacFarlane.Pandoc`). El script:

- trabaja sobre una copia: el `.docx` original no se modifica;
- acepta el control de cambios y descarta los comentarios;
- crea `src/content/articulos/<slug>/es.md` como borrador, con el frontmatter a completar;
- copia las imágenes a `imagenes/` **sin metadatos** (EXIF, XMP, IPTC, GPS);
- si hay un PDF con el mismo nombre, lo copia a `public/descargas/` **sin metadatos**;
- borra rutas absolutas de la PC y avisa si encuentra usuario, emails, autor o empresa.

Para probarlo: `node scripts/pruebas/crear-docx-prueba.mjs` genera un `.docx` y un `.pdf` cargados de metadatos en `../originales/`.

## Escribir artículos

Cada artículo es una carpeta en `src/content/articulos/<slug>/` con `es.md`, `en.md` (opcional) e `imagenes/`.
Cajas destacadas:

```md
:::tip
Texto de la sugerencia.
:::

:::warning[Título propio]
Texto.
:::
```

Tipos: `tip`, `important`, `warning`, `danger` (o en español: `sugerencia`, `importante`, `advertencia`, `peligro`).

## Módulos de entrenamiento

Cada módulo es una carpeta en `src/content/modulos/<slug>/` con `es.md` y `en.md`. El quiz va en el frontmatter y se corrige en el navegador (no se envía nada):

```yaml
order: 1          # posición en el curso
minutes: 12       # duración estimada
pubDate: 2026-11-14
quiz:
  - question: ¿Pregunta?
    options: [Opción A, Opción B, Opción C]
    answer: 1     # posición de la correcta, empezando en 0 (acá, "Opción B")
    explanation: Por qué es la correcta.
```

Sin JavaScript, cada pregunta muestra un "Ver la respuesta".
