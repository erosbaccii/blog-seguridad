// Corre después de `astro build`. Todo lo de public/ se publica tal cual, así que un PDF de un
// artículo que todavía es borrador quedaría accesible en /descargas/. Este paso borra de dist/
// los PDFs que ninguna página publicada enlaza. (public/descargas/ no se toca.)
import { readdir, readFile, rm } from 'node:fs/promises';
import { existsSync } from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const DIST = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..', 'dist');
const DESCARGAS = path.join(DIST, 'descargas');
if (!existsSync(DESCARGAS)) process.exit(0);

const walk = async (d) =>
  (await Promise.all((await readdir(d, { withFileTypes: true })).map((e) => (e.isDirectory() ? walk(path.join(d, e.name)) : [path.join(d, e.name)])))).flat();

const enlazados = new Set();
for (const f of (await walk(DIST)).filter((f) => f.endsWith('.html'))) {
  for (const m of (await readFile(f, 'utf8')).matchAll(/href=["']\/descargas\/([^"'#?]+)/g)) enlazados.add(decodeURIComponent(m[1]));
}

const quitados = [];
for (const f of await walk(DESCARGAS)) {
  const rel = path.relative(DESCARGAS, f).split(path.sep).join('/');
  if (!enlazados.has(rel)) {
    await rm(f);
    quitados.push(rel);
  }
}
console.log(
  quitados.length
    ? `✔ Descargas: quité de dist/ ${quitados.length} archivo(s) que solo usa un borrador: ${quitados.join(', ')}`
    : `✔ Descargas: ${enlazados.size} archivo(s), todos enlazados desde páginas publicadas.`,
);
