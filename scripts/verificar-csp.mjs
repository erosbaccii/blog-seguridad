// Corre después de `astro build`. Falla si el HTML generado tiene algo que la
// Content-Security-Policy de public/_headers bloquearía (y que rompería el sitio en producción):
// scripts o estilos inline, atributos style="" u onclick="", URLs javascript:, o recursos de terceros.
import { readdir, readFile } from 'node:fs/promises';
import { existsSync } from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const DIST = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..', 'dist');
if (!existsSync(DIST)) {
  console.error('No existe dist/. Corré primero: npm run build');
  process.exit(1);
}

const walk = async (d) =>
  (await Promise.all((await readdir(d, { withFileTypes: true })).map((e) => (e.isDirectory() ? walk(path.join(d, e.name)) : [path.join(d, e.name)])))).flat();

const problemas = [];
const html = (await walk(DIST)).filter((f) => f.endsWith('.html'));

for (const f of html) {
  const rel = path.relative(DIST, f).split(path.sep).join('/');
  const t = await readFile(f, 'utf8');
  const add = (m) => problemas.push(`${rel}: ${m}`);

  for (const m of t.matchAll(/<script\b([^>]*)>([\s\S]*?)<\/script>/gi)) {
    const attrs = m[1];
    if (/\btype=["']?application\/ld\+json/i.test(attrs)) continue; // bloque de datos, no se ejecuta
    if (!/\bsrc=/i.test(attrs)) add('<script> inline');
    const src = attrs.match(/\bsrc=["']([^"']+)/i)?.[1] ?? '';
    if (/^(https?:)?\/\//i.test(src)) add(`script de terceros: ${src}`);
  }
  if (/<style\b/i.test(t)) add('<style> inline');
  for (const m of t.matchAll(/<[a-z][^>]*\sstyle=["'][^"']*["'][^>]*>/gi)) add(`atributo style="": ${m[0].slice(0, 80)}…`);
  for (const m of t.matchAll(/\son[a-z]+=["'][^"']*["']/gi)) add(`manejador inline ${m[0].trim().slice(0, 40)}`);
  if (/(href|src)=["']\s*javascript:/i.test(t)) add('URL javascript:');
  for (const m of t.matchAll(/<link\b[^>]*rel=["']stylesheet["'][^>]*>/gi)) {
    if (/href=["'](https?:)?\/\//i.test(m[0])) add(`hoja de estilos de terceros: ${m[0]}`);
  }
  for (const m of t.matchAll(/<(img|source|video|audio|iframe)\b[^>]*\ssrcset?=["']((?:https?:)?\/\/[^"']+)/gi)) add(`recurso de terceros: ${m[2]}`);
  if (/<iframe\b/i.test(t)) add('<iframe>');
}

if (!existsSync(path.join(DIST, '_headers'))) problemas.push('falta dist/_headers (las cabeceras de seguridad no se aplicarían)');

if (problemas.length) {
  console.error(`\n✖ CSP: ${problemas.length} problema(s) en el build:\n  - ${problemas.join('\n  - ')}\n`);
  process.exit(1);
}
console.log(`✔ CSP: ${html.length} páginas sin scripts/estilos inline ni recursos de terceros.`);
