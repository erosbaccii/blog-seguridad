#!/usr/bin/env node
/*
 * Word → artículo
 *
 * Uso (desde la carpeta sitio):
 *   npm run word -- "Mi tesis.docx"
 *   npm run word -- "Mi tesis.docx" --slug mi-tesis --reemplazar
 *
 * Toma el .docx de ../originales (NUNCA lo modifica: trabaja sobre una copia temporal) y:
 *  1. Lo convierte a Markdown con Pandoc, aceptando el control de cambios y descartando comentarios.
 *  2. Crea src/content/articulos/<slug>/es.md con frontmatter a completar (lang "es", draft true).
 *  3. Copia las imágenes a src/content/articulos/<slug>/imagenes/ sin metadatos (EXIF/XMP/IPTC).
 *  4. Si existe ../originales/<mismo nombre>.pdf, lo copia sin metadatos a public/descargas/<slug>.pdf.
 *  5. Quita rutas absolutas de la PC y avisa si encuentra usuario de Windows, emails, autor o empresa.
 */
import { spawnSync } from 'node:child_process';
import { existsSync } from 'node:fs';
import { copyFile, mkdtemp, mkdir, readdir, readFile, rm, writeFile } from 'node:fs/promises';
import os from 'node:os';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import {
  IMAGENES_RASTER,
  buscarDatosPersonales,
  escribirTexto,
  limpiarImagen,
  limpiarPdf,
  limpiarSvg,
  metadatosDeImagen,
  metadatosDePdf,
  propiedadesDocx,
  quitarRutasAbsolutas,
} from './lib/privacidad.mjs';

const SITIO = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');
const ORIGINALES = path.resolve(SITIO, '..', 'originales');
const ARTICULOS = path.join(SITIO, 'src', 'content', 'articulos');
const DESCARGAS = path.join(SITIO, 'public', 'descargas');

const rel = (p) => path.relative(SITIO, p).split(path.sep).join('/'); // nunca mostrar rutas absolutas
const ok = (m) => console.log(`  ✔ ${m}`);
const aviso = (m) => console.log(`  ⚠ ${m}`);
const salir = (m) => {
  console.error(`\n✖ ${m}\n`);
  process.exit(1);
};

/* ---------------- Argumentos ---------------- */
const args = process.argv.slice(2);
const nombre = args.find((a) => !a.startsWith('--'));
const opcion = (o) => {
  const i = args.indexOf(o);
  return i >= 0 ? args[i + 1] : undefined;
};
const reemplazar = args.includes('--reemplazar');
if (!nombre) {
  const disponibles = existsSync(ORIGINALES) ? (await readdir(ORIGINALES)).filter((f) => f.toLowerCase().endsWith('.docx')) : [];
  salir(
    `Indicá el nombre de un .docx de la carpeta originales.\n  Ejemplo: npm run word -- "Mi tesis.docx"` +
      (disponibles.length ? `\n  Disponibles: ${disponibles.join(', ')}` : ''),
  );
}

const docx = path.join(ORIGINALES, path.basename(nombre));
if (!docx.toLowerCase().endsWith('.docx')) salir('El archivo tiene que ser .docx');
if (!existsSync(docx)) salir(`No encontré "${path.basename(nombre)}" en la carpeta originales.`);

const slugify = (s) =>
  s
    .normalize('NFD')
    .replace(/[̀-ͯ]/g, '')
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-+|-+$/g, '')
    .slice(0, 80);
const base = path.basename(docx, path.extname(docx));
const slug = slugify(opcion('--slug') ?? base);
if (!slug) salir('No pude armar un slug a partir del nombre. Usá --slug mi-articulo');

const destino = path.join(ARTICULOS, slug);
const destinoMd = path.join(destino, 'es.md');
if (existsSync(destinoMd) && !reemplazar) salir(`Ya existe ${rel(destinoMd)}. Usá --reemplazar para pisarlo.`);

/* ---------------- Pandoc ---------------- */
function buscarPandoc() {
  const candidatos = [
    'pandoc',
    process.env.LOCALAPPDATA && path.join(process.env.LOCALAPPDATA, 'Pandoc', 'pandoc.exe'),
    process.env.ProgramFiles && path.join(process.env.ProgramFiles, 'Pandoc', 'pandoc.exe'),
  ].filter(Boolean);
  for (const c of candidatos) {
    const r = spawnSync(c, ['--version'], { encoding: 'utf8' });
    if (r.status === 0) return c;
  }
  salir(
    'Pandoc no está instalado. En Windows instalalo con:\n    winget install JohnMacFarlane.Pandoc\n  y abrí una terminal nueva.',
  );
}
const pandoc = buscarPandoc();
const correr = (argv, cwd) => {
  const r = spawnSync(pandoc, argv, { cwd, encoding: 'utf8', maxBuffer: 64 * 1024 * 1024 });
  if (r.status !== 0) salir(`Pandoc falló:\n${r.stderr}`);
  return r.stdout;
};

console.log(`\nConvirtiendo "${path.basename(docx)}" → ${rel(destinoMd)}\n`);

// Copia de trabajo: el original no se toca
const tmp = await mkdtemp(path.join(os.tmpdir(), 'word-a-articulo-'));
try {
  const copia = path.join(tmp, 'documento.docx');
  await copyFile(docx, copia);
  const props = await propiedadesDocx(copia);

  // --track-changes=accept: aplica los cambios aceptados, descarta lo borrado y los comentarios
  correr(
    ['documento.docx', '-f', 'docx', '-t', 'gfm', '--wrap=none', '--track-changes=accept', '--extract-media=media', '-o', 'salida.md'],
    tmp,
  );
  let md = await readFile(path.join(tmp, 'salida.md'), 'utf8');
  md = md.replace(/\r\n/g, '\n');

  /* ---------------- Título y encabezados ---------------- */
  let titulo;
  const primerH1 = md.match(/^\s*# (.+)\n/);
  if (primerH1) {
    titulo = primerH1[1].trim();
    md = md.slice(primerH1[0].length);
  }
  // El cuerpo usa H2 para las secciones: si quedan H1, se bajan todos los niveles uno.
  if (/^# /m.test(md)) md = md.replace(/^(#{1,5}) /gm, '#$1 ');

  /* ---------------- Imágenes ---------------- */
  await mkdir(destino, { recursive: true });
  const carpetaImg = path.join(destino, 'imagenes');
  const mapa = new Map(); // ruta pandoc → ruta final
  let n = 0;
  const sinAlt = [];

  // Pandoc escribe <img> en HTML cuando la imagen tiene tamaño: se pasa a Markdown.
  md = md.replace(/<img\b[^>]*>/gi, (tag) => {
    const src = tag.match(/\ssrc="([^"]*)"/i)?.[1] ?? '';
    const alt = tag.match(/\salt="([^"]*)"/i)?.[1] ?? '';
    return `![${alt}](${src})`;
  });
  // Imágenes con epígrafe: Pandoc las envuelve en <figure> (y dentro de HTML el Markdown no se procesa).
  // Se dejan como imagen + epígrafe en cursiva; si el epígrafe repite el texto alternativo, se omite.
  const sinEtiquetas = (s) => s.replace(/<[^>]+>/g, '').replace(/\s+/g, ' ').trim();
  md = md.replace(/<figure>([\s\S]*?)<\/figure>/gi, (_, dentro) => {
    const img = dentro.match(/!\[[^\]]*\]\([^)]*\)/)?.[0] ?? '';
    const alt = img.match(/!\[([^\]]*)\]/)?.[1]?.trim() ?? '';
    const epigrafe = sinEtiquetas(dentro.match(/<figcaption[^>]*>([\s\S]*?)<\/figcaption>/i)?.[1] ?? '');
    return epigrafe && epigrafe !== alt ? `${img}\n\n*${epigrafe}*` : img;
  });
  // Listas: "1.  Texto" → "1. Texto"
  md = md.replace(/^(\s*)(\d+\.|[-*+])\s{2,}/gm, '$1$2 ');

  const refs = [...md.matchAll(/!\[([^\]]*)\]\(([^)\s]+)(?:\s+"[^"]*")?\)/g)];
  for (const [, , src] of refs) {
    if (mapa.has(src)) continue;
    const origen = path.resolve(tmp, decodeURIComponent(src));
    if (!origen.startsWith(tmp) || !existsSync(origen)) continue;
    const ext = path.extname(origen).toLowerCase();
    n += 1;
    const salidaBase = path.join(carpetaImg, `${slug}-${n}`);
    await mkdir(carpetaImg, { recursive: true });
    if (IMAGENES_RASTER.includes(ext)) {
      const extFinal = await limpiarImagen(origen, salidaBase);
      mapa.set(src, `./imagenes/${slug}-${n}${extFinal}`);
    } else if (ext === '.svg') {
      await writeFile(salidaBase + '.svg', limpiarSvg(await readFile(origen, 'utf8')), 'utf8');
      mapa.set(src, `./imagenes/${slug}-${n}.svg`);
    } else {
      n -= 1;
      aviso(`Imagen en formato ${ext} (por ejemplo, un gráfico de Office): no se puede usar en la web. Exportala como PNG y reemplazá el TODO.`);
      mapa.set(src, null);
    }
  }
  md = md.replace(/!\[([^\]]*)\]\(([^)\s]+)(?:\s+"[^"]*")?\)/g, (todo, alt, src) => {
    if (!mapa.has(src)) return todo;
    const final = mapa.get(src);
    if (final === null) return `**TODO: imagen en formato no compatible (${path.extname(src)}). Exportala como PNG.**`;
    let texto = alt.trim();
    if (!texto) {
      texto = 'TODO: texto alternativo';
      sinAlt.push(final);
    }
    return `![${texto}](${final})`;
  });
  if (n) ok(`${n} imagen(es) copiadas sin metadatos a ${rel(carpetaImg)}/`);
  if (sinAlt.length) aviso(`${sinAlt.length} imagen(es) sin texto alternativo: quedó "TODO: texto alternativo".`);

  /* ---------------- Rutas absolutas y datos personales ---------------- */
  const limpio = quitarRutasAbsolutas(md);
  md = limpio.texto;
  if (limpio.rutas.length) aviso(`Quité ${limpio.rutas.length} ruta(s) absoluta(s) del texto (quedó "[ruta local eliminada]").`);

  /* ---------------- PDF con el mismo nombre ---------------- */
  let pdfPublico;
  const pdfOriginal = (await readdir(ORIGINALES)).find((f) => f.toLowerCase() === `${base.toLowerCase()}.pdf`);
  if (pdfOriginal) {
    const bytes = await readFile(path.join(ORIGINALES, pdfOriginal));
    const limpioPdf = await limpiarPdf(bytes);
    const quedan = await metadatosDePdf(limpioPdf);
    if (quedan.length) salir(`El PDF todavía tiene metadatos (${quedan.join(', ')}). No lo copié.`);
    await mkdir(DESCARGAS, { recursive: true });
    const salidaPdf = path.join(DESCARGAS, `${slug}.pdf`);
    await writeFile(salidaPdf, limpioPdf);
    pdfPublico = `/descargas/${slug}.pdf`;
    ok(`PDF copiado sin metadatos a ${rel(salidaPdf)}`);
  }

  /* ---------------- Frontmatter ---------------- */
  const hoy = new Date().toISOString().slice(0, 10);
  const q = (s) => JSON.stringify(s);
  const front = [
    '---',
    `title: ${q(titulo ?? 'TODO: título')}`,
    `description: ${q('TODO: descripción de 1 o 2 líneas (máx. 220 caracteres)')}`,
    `pubDate: ${hoy}`,
    `category: "blue-team" # TODO: blue-team | casos-reales | que-hacer-si | ia-seguridad | tesis`,
    `tags: [] # TODO`,
    `nivel: "basico" # TODO: basico | intermedio`,
    `publico: ["personas"] # TODO: personas | empresas | tecnicos`,
    'draft: true',
    'lang: "es"',
    ...(pdfPublico ? [`pdf: ${q(pdfPublico)}`] : []),
    '---',
    '',
    '<!--',
    'TODO: adaptar a la plantilla sin cambiar el sentido:',
    '  ## Resumen (3 líneas) · ## Para quién es · ## Contexto · ## Qué hacer, paso a paso · ## Checklist final · ## Fuentes',
    'Cajas destacadas: :::tip / :::important / :::warning / :::danger ... :::',
    '-->',
    '',
    '',
  ].join('\n');

  const final = front + md.trim() + '\n';
  await escribirTexto(destinoMd, final);
  ok(`Artículo creado: ${rel(destinoMd)} (borrador)`);

  /* ---------------- Verificación ---------------- */
  const terminos = [props.autor, props.ultimoEnModificar, props.empresa, props.responsable].filter(Boolean);
  const hallazgos = buscarDatosPersonales(final, { terminos });
  for (const h of hallazgos) aviso(`${h.tipo} en la línea ${h.linea} de es.md: "${h.valor}". Revisalo antes de publicar.`);

  for (const img of existsSync(carpetaImg) ? await readdir(carpetaImg) : []) {
    const quedan = (await metadatosDeImagen(path.join(carpetaImg, img))).filter((m) => m !== 'perfil ICC');
    if (quedan.length) salir(`La imagen ${img} todavía tiene metadatos: ${quedan.join(', ')}`);
  }
  ok('Verificado: las imágenes y el PDF no tienen metadatos.');
  if (terminos.length) ok(`No se copiaron autor/empresa del .docx al frontmatter (${terminos.length} dato(s) descartados).`);

  console.log(`\nListo. Revisá ${rel(destinoMd)}: completá los TODO y adaptalo a la plantilla.\n`);
} finally {
  await rm(tmp, { recursive: true, force: true });
}
