// @ts-check
import { defineConfig } from 'astro/config';
import mdx from '@astrojs/mdx';
import { unified } from '@astrojs/markdown-remark';
import remarkDirective from 'remark-directive';
import remarkCajas from './src/plugins/remark-cajas.ts';

/**
 * Shiki pone los colores del código en atributos style="…". Con una CSP estricta
 * (sin 'unsafe-inline') eso se bloquea, así que se pasan a clases (.tk-…) definidas en global.css.
 * @type {import('shiki').ShikiTransformer}
 */
const shikiSinEstilosInline = {
  name: 'sin-estilos-inline',
  pre(node) {
    delete node.properties.style;
    delete node.properties.tabindex;
    node.properties.tabindex = '0'; // el bloque con scroll horizontal tiene que poder enfocarse con teclado
  },
  span(node) {
    const estilo = String(node.properties.style ?? '');
    if (!estilo) return;
    delete node.properties.style;
    const color = estilo.match(/var\(--astro-code-([\w-]+)\)/)?.[1];
    if (color) this.addClassToHast(node, `tk-${color}`);
    if (/font-style:\s*italic/.test(estilo)) this.addClassToHast(node, 'tk-italic');
    if (/font-weight:\s*bold/.test(estilo)) this.addClassToHast(node, 'tk-bold');
  },
};

export default defineConfig({
  // URL de Cloudflare Pages. TODO: cambiar por el dominio propio cuando lo tengas.
  site: 'https://blog-seguridad.pages.dev',
  trailingSlash: 'always',
  build: {
    format: 'directory',
    // CSS siempre en archivos externos (nada de <style> en el HTML): CSP sin 'unsafe-inline'
    inlineStylesheets: 'never',
  },
  // JS siempre en archivos externos (nada de <script> inline) y sin recursos en data: URIs
  vite: { build: { assetsInlineLimit: 0 } },
  i18n: {
    locales: ['es', 'en'],
    defaultLocale: 'es',
    routing: { prefixDefaultLocale: false },
  },
  markdown: {
    // Pipeline remark/rehype (estándar): cajas destacadas con :::tip, :::warning, etc.
    processor: unified({ remarkPlugins: [remarkDirective, remarkCajas] }),
    // Colores del código desde la paleta (variables --astro-code-* en tokens.css)
    shikiConfig: { theme: 'css-variables', transformers: [shikiSinEstilosInline] },
  },
  integrations: [mdx()],
});
