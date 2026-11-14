#!/usr/bin/env node
/*
 * Verificación de privacidad. Frena (exit 1) si encuentra datos personales o de la PC.
 *
 *   npm run privacidad                 → revisa los archivos que entrarían al repo
 *   npm run privacidad -- --dist       → además revisa dist/ (el sitio generado)
 *   node scripts/verificar-privacidad.mjs --pre-push   → lo usa el hook .githooks/pre-push
 *
 * Revisa: metadatos en imágenes (EXIF/XMP/IPTC) y PDFs (autor, empresa, software, fechas, XMP),
 * rutas absolutas de la PC (Windows, Mac o Linux), el usuario de Windows, emails (salvo los "noreply" de
 * GitHub y dominios de ejemplo) y documentos de Office. En --pre-push revisa además cada commit
 * que se va a subir: autor/email, líneas agregadas y archivos binarios del historial.
 *
 * Para permitir una línea a propósito, agregale el comentario: privacidad-ignorar-linea
 */
import { spawnSync } from 'node:child_process';
import { existsSync } from 'node:fs';
import { mkdtemp, readdir, readFile, rm, writeFile } from 'node:fs/promises';
import os from 'node:os';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { buscarDatosPersonales, metadatosDeImagen, metadatosDePdf, usuarioWindows } from './lib/privacidad.mjs';

const args = process.argv.slice(2);
const SITIO = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');
const REPO = args.includes('--repo') ? path.resolve(args[args.indexOf('--repo') + 1]) : SITIO;
const PRE_PUSH = args.includes('--pre-push');
const CON_DIST = args.includes('--dist');

const IMAGENES = ['.jpg', '.jpeg', '.png', '.webp', '.gif', '.avif', '.tif', '.tiff', '.bmp', '.heic'];
const OFFICE = ['.docx', '.doc', '.odt', '.rtf', '.xlsx', '.xls', '.pptx', '.ppt', '.pages', '.key'];
const TEXTO = ['.md', '.mdx', '.astro', '.ts', '.tsx', '.js', '.mjs', '.cjs', '.json', '.css', '.scss', '.html', '.xml', '.txt', '.svg', '.yml', '.yaml', '.toml', '.sh', ''];
const EMAILS_PERMITIDOS = [/@users\.noreply\.github\.com$/i, /@(example|ejemplo)\.(com|org|net)$/i, /^noreply@/i];
const IGNORAR_LINEA = 'privacidad-ignorar-linea';
const SIEMPRE_EXCLUIR = /(^|\/)(node_modules|dist|\.astro|\.git)\//;

const usuario = usuarioWindows();
const problemas = [];
const problema = (donde, que) => problemas.push({ donde, que });

const git = (argv, opts = {}) => spawnSync('git', argv, { cwd: REPO, maxBuffer: 256 * 1024 * 1024, ...opts });
const gitTexto = (argv) => {
  const r = git(argv, { encoding: 'utf8' });
  if (r.status !== 0) throw new Error(`git ${argv.join(' ')}: ${r.stderr}`);
  return r.stdout;
};
const esRepo = existsSync(path.join(REPO, '.git')) && git(['rev-parse', '--git-dir']).status === 0;

/* ---------------- Revisión de un archivo (por contenido) ---------------- */

async function revisarContenido(nombre, buf, rutaEnDisco) {
  const ext = path.extname(nombre).toLowerCase();
  const base = path.basename(nombre).toLowerCase();

  if (base.includes(usuario.toLowerCase())) problema(nombre, 'el nombre del archivo contiene el usuario de Windows');
  if (OFFICE.includes(ext)) return problema(nombre, `documento de Office (${ext}): los originales no se suben, van en la carpeta originales`);

  if (IMAGENES.includes(ext)) {
    try {
      const meta = (await metadatosDeImagen(rutaEnDisco)).filter((m) => m !== 'perfil ICC');
      if (meta.length) problema(nombre, `imagen con metadatos: ${meta.join(', ')}`);
    } catch (e) {
      problema(nombre, `no se pudo leer la imagen (${e.message})`);
    }
    return;
  }
  if (ext === '.pdf') {
    const meta = await metadatosDePdf(buf);
    if (meta.length) problema(nombre, `PDF con metadatos: ${meta.join(', ')}`);
    return;
  }
  if (ext === '.svg') {
    const meta = await metadatosDeImagen(rutaEnDisco);
    if (meta.length) problema(nombre, `SVG con metadatos de editor: ${meta.join(', ')}`);
  }
  if (TEXTO.includes(ext) || base.startsWith('.') || base === '_headers') {
    if (buf.includes(0)) return; // binario
    const texto = buf
      .toString('utf8')
      .split(/\r?\n/)
      .map((l) => (l.includes(IGNORAR_LINEA) ? '' : l))
      .join('\n');
    for (const h of buscarDatosPersonales(texto, { emailsPermitidos: EMAILS_PERMITIDOS }))
      problema(`${nombre}:${h.linea}`, `${h.tipo}: "${h.valor}"`);
  }
}

async function revisarArchivo(rel, raiz = REPO) {
  const abs = path.join(raiz, rel);
  await revisarContenido(rel, await readFile(abs), abs);
}

/* ---------------- Qué archivos revisar ---------------- */

async function archivosDelRepo() {
  if (esRepo) {
    // Los que están en el repo + los nuevos que no están en .gitignore (los que entrarían en un commit)
    return gitTexto(['ls-files', '-z', '--cached', '--others', '--exclude-standard'])
      .split('\0')
      .filter((f) => f && !SIEMPRE_EXCLUIR.test(f) && existsSync(path.join(REPO, f)));
  }
  const walk = async (d) =>
    (await Promise.all(
      (await readdir(path.join(REPO, d), { withFileTypes: true })).map((e) => {
        const rel = d ? `${d}/${e.name}` : e.name;
        if (SIEMPRE_EXCLUIR.test(rel + '/')) return [];
        return e.isDirectory() ? walk(rel) : [rel];
      }),
    )).flat();
  return walk('');
}

/* ---------------- Commits que se van a subir (pre-push) ---------------- */

async function commitsAPushear() {
  const entrada = await new Promise((res) => {
    let datos = '';
    if (process.stdin.isTTY) return res('');
    process.stdin.setEncoding('utf8');
    process.stdin.on('data', (c) => (datos += c));
    process.stdin.on('end', () => res(datos));
  });
  const ceros = /^0+$/;
  const shas = new Set();
  for (const linea of entrada.split('\n').filter(Boolean)) {
    const [, local, , remoto] = linea.split(' ');
    if (!local || ceros.test(local)) continue; // borrado de rama
    const rango = remoto && !ceros.test(remoto) ? [`${remoto}..${local}`] : [local, '--not', '--remotes'];
    gitTexto(['rev-list', ...rango]).split('\n').filter(Boolean).forEach((s) => shas.add(s));
  }
  return [...shas];
}

async function revisarCommit(sha) {
  const corto = sha.slice(0, 8);
  const [an, ae, cn, ce] = gitTexto(['show', '-s', '--format=%an%x00%ae%x00%cn%x00%ce', sha]).trim().split('\0');
  for (const [rol, nombre, email] of [['autor', an, ae], ['committer', cn, ce]]) {
    if (!/@users\.noreply\.github\.com$/i.test(email)) problema(`commit ${corto}`, `email del ${rol} no es el "noreply" de GitHub: ${email}`);
    if (nombre.toLowerCase() === usuario.toLowerCase()) problema(`commit ${corto}`, `nombre del ${rol} es el usuario de Windows`);
  }
  // Líneas agregadas en el commit
  let archivoActual = '';
  let nLinea = 0;
  for (const l of gitTexto(['show', '--format=', '-p', '--no-color', '--no-ext-diff', sha]).split('\n')) {
    if (l.startsWith('+++ ')) archivoActual = l.replace(/^\+\+\+ (b\/)?/, '');
    else if (l.startsWith('@@')) nLinea = Number(l.match(/\+(\d+)/)?.[1] ?? 0) - 1;
    else if (l.startsWith('+')) {
      nLinea++;
      if (l.includes(IGNORAR_LINEA)) continue;
      for (const h of buscarDatosPersonales(l.slice(1), { emailsPermitidos: EMAILS_PERMITIDOS }))
        problema(`commit ${corto} · ${archivoActual}:${nLinea}`, `${h.tipo}: "${h.valor}"`);
    } else if (!l.startsWith('-')) nLinea++;
  }
  // Binarios agregados o modificados en el commit (imágenes, PDFs, documentos)
  const cambiados = gitTexto(['diff-tree', '--no-commit-id', '--root', '-r', '-z', '--name-only', '--diff-filter=AM', sha]).split('\0').filter(Boolean);
  const tmp = await mkdtemp(path.join(os.tmpdir(), 'privacidad-'));
  try {
    for (const f of cambiados) {
      const ext = path.extname(f).toLowerCase();
      if (![...IMAGENES, '.pdf', '.svg', ...OFFICE].includes(ext)) continue;
      const blob = git(['show', `${sha}:${f}`]).stdout;
      const archivoTmp = path.join(tmp, `blob${ext}`);
      await writeFile(archivoTmp, blob);
      await revisarContenido(`commit ${corto} · ${f}`, blob, archivoTmp);
    }
  } finally {
    await rm(tmp, { recursive: true, force: true });
  }
}

/* ---------------- Ejecución ---------------- */

const archivos = await archivosDelRepo();
for (const f of archivos) await revisarArchivo(f);

if (CON_DIST) {
  const dist = path.join(REPO, 'dist');
  if (!existsSync(dist)) problema('dist/', 'no existe: corré npm run build');
  else {
    const walk = async (d) =>
      (await Promise.all((await readdir(d, { withFileTypes: true })).map((e) => (e.isDirectory() ? walk(path.join(d, e.name)) : [path.join(d, e.name)])))).flat();
    for (const f of await walk(dist)) await revisarArchivo(path.relative(REPO, f).split(path.sep).join('/'));
  }
}

let commits = [];
if (PRE_PUSH && esRepo) {
  commits = await commitsAPushear();
  for (const sha of commits) await revisarCommit(sha);
  const email = git(['config', 'user.email'], { encoding: 'utf8' }).stdout.trim();
  if (email && !/@users\.noreply\.github\.com$/i.test(email))
    problema('git config user.email', `no es el email "noreply" de GitHub (${email})`);
}

const resumen = `${archivos.length} archivos${CON_DIST ? ' + dist/' : ''}${PRE_PUSH ? ` y ${commits.length} commit(s)` : ''}`;
if (problemas.length) {
  console.error(`\n✖ Privacidad: encontré ${problemas.length} problema(s) en ${resumen}:\n`);
  for (const p of problemas) console.error(`  • ${p.donde}\n      ${p.que}`);
  if (PRE_PUSH) {
    console.error('\nEl push se frenó. Corregí los archivos y volvé a intentar.');
    if (problemas.some((p) => p.donde.startsWith('commit ')))
      console.error('⚠ Algunos datos ya están en commits: no alcanza con corregir el archivo, hay que limpiar el historial antes de subirlo.');
  }
  console.error('Si una línea es correcta a propósito, agregale el comentario "privacidad-ignorar-linea".\n');
  process.exit(1);
}
console.log(`✔ Privacidad: sin metadatos, rutas locales, usuario de Windows ni emails personales en ${resumen}.`);
