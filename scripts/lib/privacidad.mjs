// Funciones de limpieza y detección de datos personales.
// Las usa scripts/word-a-articulo.mjs y (Fase 3) el chequeo antes de cada push.
import os from 'node:os';
import path from 'node:path';
import { readFile, writeFile } from 'node:fs/promises';
import { inflateRawSync } from 'node:zlib';
import sharp from 'sharp';
import { PDFDocument, PDFDict, PDFName, PDFNumber, PDFRawStream, PDFRef } from 'pdf-lib';

/* ------------------------------------------------------------------ */
/* Imágenes                                                            */
/* ------------------------------------------------------------------ */

export const IMAGENES_RASTER = ['.jpg', '.jpeg', '.png', '.webp', '.gif', '.avif', '.tif', '.tiff', '.bmp'];

/**
 * Re-codifica la imagen sin ningún metadato (EXIF, XMP, IPTC, perfiles, textos PNG).
 * Antes aplica la orientación EXIF para que la foto no quede girada.
 * TIFF y BMP se convierten a PNG (el navegador no los muestra). Devuelve la extensión final.
 */
export async function limpiarImagen(entrada, salidaSinExtension) {
  const ext = path.extname(entrada).toLowerCase();
  const animada = ext === '.gif' || ext === '.webp';
  let img = sharp(entrada, { animated: animada, failOn: 'error' });
  const meta = await img.metadata();
  if (!(animada && (meta.pages ?? 1) > 1)) img = img.rotate(); // aplica la orientación y la descarta

  let extFinal;
  if (ext === '.jpg' || ext === '.jpeg') {
    img = img.jpeg({ quality: 85, mozjpeg: true });
    extFinal = '.jpg';
  } else if (ext === '.webp') {
    img = img.webp({ quality: 85 });
    extFinal = '.webp';
  } else if (ext === '.gif') {
    img = img.gif();
    extFinal = '.gif';
  } else if (ext === '.avif') {
    img = img.avif({ quality: 60 });
    extFinal = '.avif';
  } else {
    img = img.png({ compressionLevel: 9 });
    extFinal = '.png';
  }
  // sharp NO copia metadatos salvo que se le pida con keepMetadata()/withMetadata(): no lo hacemos.
  await img.toFile(salidaSinExtension + extFinal);
  return extFinal;
}

/** Limpia un SVG: quita <metadata>, comentarios y atributos de editores que guardan rutas o nombres. */
export function limpiarSvg(texto) {
  return texto
    .replace(/<!--[\s\S]*?-->/g, '')
    .replace(/<metadata[\s\S]*?<\/metadata>/gi, '')
    .replace(/<sodipodi:namedview[\s\S]*?(\/>|<\/sodipodi:namedview>)/gi, '')
    .replace(/\s(sodipodi|inkscape):[\w-]+="[^"]*"/gi, '')
    .replace(/\sxmlns:(sodipodi|inkscape|rdf|cc|dc)="[^"]*"/gi, '');
}

/** Devuelve la lista de metadatos que tiene una imagen (vacía = limpia). */
export async function metadatosDeImagen(archivo) {
  const ext = path.extname(archivo).toLowerCase();
  if (ext === '.svg') {
    const t = await readFile(archivo, 'utf8');
    return [/<metadata/i, /sodipodi:|inkscape:/i, /<rdf:RDF/i].filter((r) => r.test(t)).map((r) => `SVG: ${r.source}`);
  }
  const m = await sharp(archivo).metadata();
  const encontrados = [];
  if (m.exif) encontrados.push('EXIF');
  if (m.xmp) encontrados.push('XMP');
  if (m.iptc) encontrados.push('IPTC');
  if (m.icc) encontrados.push('perfil ICC');
  if (m.comments?.length) encontrados.push(`textos (${m.comments.map((c) => c.keyword).join(', ')})`);
  return encontrados;
}

/* ------------------------------------------------------------------ */
/* JPEG dentro de PDFs: quitar segmentos de metadatos                  */
/* ------------------------------------------------------------------ */

/** Quita de un JPEG los segmentos APP1 (EXIF/XMP), APP12, APP13 (IPTC) y COM. */
export function quitarMetadatosJpeg(bytes) {
  const b = Buffer.from(bytes);
  if (b[0] !== 0xff || b[1] !== 0xd8) return bytes;
  const partes = [b.subarray(0, 2)];
  let i = 2;
  let cambio = false;
  while (i + 4 <= b.length && b[i] === 0xff) {
    const marker = b[i + 1];
    if (marker === 0xda) break; // SOS: empieza la imagen, el resto se copia tal cual
    const len = b.readUInt16BE(i + 2);
    const quitar = marker === 0xe1 || marker === 0xec || marker === 0xed || marker === 0xfe;
    if (quitar) cambio = true;
    else partes.push(b.subarray(i, i + 2 + len));
    i += 2 + len;
  }
  if (!cambio) return bytes;
  partes.push(b.subarray(i));
  return new Uint8Array(Buffer.concat(partes));
}

/* ------------------------------------------------------------------ */
/* PDFs                                                                */
/* ------------------------------------------------------------------ */

const CLAVES_METADATOS = ['Metadata', 'PieceInfo', 'LastModified'];

/**
 * Devuelve una copia del PDF sin diccionario Info (autor, empresa, software, fechas),
 * sin XMP, sin identificador de documento y sin metadatos en las imágenes JPEG internas.
 */
export async function limpiarPdf(bytes) {
  let doc;
  try {
    doc = await PDFDocument.load(bytes, { updateMetadata: false });
  } catch (e) {
    throw new Error(`No se pudo leer el PDF (¿está protegido con contraseña?): ${e.message}`);
  }
  const ctx = doc.context;

  if (ctx.trailerInfo.Info instanceof PDFRef) ctx.delete(ctx.trailerInfo.Info);
  ctx.trailerInfo.Info = undefined;
  ctx.trailerInfo.ID = undefined;

  for (const [ref, obj] of ctx.enumerateIndirectObjects()) {
    const dict = obj instanceof PDFDict ? obj : obj?.dict instanceof PDFDict ? obj.dict : null;
    if (!dict) continue;

    // Streams de metadatos XMP sueltos
    const tipo = dict.get(PDFName.of('Type'));
    if (tipo === PDFName.of('Metadata')) {
      ctx.delete(ref);
      continue;
    }
    for (const clave of CLAVES_METADATOS) {
      const v = dict.get(PDFName.of(clave));
      if (v === undefined) continue;
      if (v instanceof PDFRef) ctx.delete(v);
      dict.delete(PDFName.of(clave));
    }
    // Imágenes JPEG embebidas (pueden traer EXIF con GPS, cámara, autor)
    if (obj instanceof PDFRawStream && dict.get(PDFName.of('Filter')) === PDFName.of('DCTDecode')) {
      const limpio = quitarMetadatosJpeg(obj.contents);
      if (limpio !== obj.contents) {
        dict.set(PDFName.of('Length'), PDFNumber.of(limpio.length));
        ctx.assign(ref, PDFRawStream.of(dict, limpio));
      }
    }
  }
  return doc.save({ useObjectStreams: false });
}

/**
 * Busca metadatos en un PDF (vacío = limpio). Lee la estructura con pdf-lib, así encuentra
 * también lo que está dentro de "object streams" comprimidos, y además hace una búsqueda
 * de texto plano como respaldo.
 */
export async function metadatosDePdf(bytes) {
  const encontrados = new Set();
  const t = Buffer.from(bytes).toString('latin1');
  if (/<x:xmpmeta|xmlns:xmp=/.test(t)) encontrados.add('XMP');
  if (/Exif\0\0/.test(t)) encontrados.add('EXIF en imagen');
  for (const k of ['Author', 'Creator', 'Producer', 'CreationDate', 'ModDate', 'Company'])
    if (new RegExp(`/${k}\\s*[(<]`).test(t)) encontrados.add(`Info (${k})`);

  let doc;
  try {
    doc = await PDFDocument.load(bytes, { updateMetadata: false });
  } catch {
    encontrados.add('no se pudo analizar (¿protegido?)');
    return [...encontrados];
  }
  const ctx = doc.context;
  const info = ctx.trailerInfo.Info && ctx.lookup(ctx.trailerInfo.Info);
  if (info instanceof PDFDict) for (const [k] of info.entries()) encontrados.add(`Info (${k.decodeText?.() ?? k.toString().slice(1)})`);
  if (ctx.trailerInfo.ID) encontrados.add('ID del documento');
  for (const [, obj] of ctx.enumerateIndirectObjects()) {
    const dict = obj instanceof PDFDict ? obj : obj?.dict instanceof PDFDict ? obj.dict : null;
    if (!dict) continue;
    if (dict.get(PDFName.of('Type')) === PDFName.of('Metadata')) encontrados.add('XMP');
    for (const clave of CLAVES_METADATOS) if (dict.has(PDFName.of(clave))) encontrados.add(clave === 'Metadata' ? 'XMP' : clave);
    if (obj instanceof PDFRawStream && dict.get(PDFName.of('Filter')) === PDFName.of('DCTDecode')) {
      if (quitarMetadatosJpeg(obj.contents) !== obj.contents) encontrados.add('EXIF/XMP en imagen');
    }
  }
  return [...encontrados];
}

/* ------------------------------------------------------------------ */
/* Texto                                                               */
/* ------------------------------------------------------------------ */

export const usuarioWindows = () => os.userInfo().username;

const RUTA_WINDOWS = /\b[A-Za-z]:\\(?:[^\\\s"'<>|*?\r\n]+\\)*[^\\\s"'<>|*?\r\n]*/g;
const RUTA_UNIX = /(?:^|[\s("'`])(\/(?:Users|home)\/[^\s"'`)<>]+)/g;
const EMAIL = /[\w.+-]+@[\w-]+(?:\.[\w-]+)+/g;

/** Reemplaza rutas absolutas de la PC por un marcador. Devuelve { texto, rutas }. */
export function quitarRutasAbsolutas(texto, marcador = '[ruta local eliminada]') {
  const rutas = [];
  let t = texto.replace(RUTA_WINDOWS, (m) => (rutas.push(m), marcador));
  t = t.replace(RUTA_UNIX, (m, ruta) => (rutas.push(ruta), m.replace(ruta, marcador)));
  return { texto: t, rutas };
}

/**
 * Busca datos personales en un texto: rutas absolutas, usuario de Windows, emails y
 * términos extra (por ejemplo, el autor o la empresa del .docx).
 * Devuelve [{ tipo, valor, linea }].
 */
export function buscarDatosPersonales(texto, { terminos = [], emailsPermitidos = [] } = {}) {
  const hallazgos = [];
  const usuario = usuarioWindows();
  const extra = [...new Set([usuario, ...terminos].filter((x) => x && x.trim().length >= 3))];
  texto.split(/\r?\n/).forEach((linea, i) => {
    for (const m of linea.matchAll(RUTA_WINDOWS)) hallazgos.push({ tipo: 'ruta absoluta', valor: m[0], linea: i + 1 });
    for (const m of linea.matchAll(RUTA_UNIX)) hallazgos.push({ tipo: 'ruta absoluta', valor: m[1], linea: i + 1 });
    for (const m of linea.matchAll(EMAIL)) {
      if (!emailsPermitidos.some((p) => (p instanceof RegExp ? p.test(m[0]) : p === m[0])))
        hallazgos.push({ tipo: 'email', valor: m[0], linea: i + 1 });
    }
    for (const term of extra) {
      const re = new RegExp(`(?<![\\p{L}\\d])${term.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')}(?![\\p{L}\\d])`, 'iu');
      if (re.test(linea)) hallazgos.push({ tipo: term === usuario ? 'usuario de Windows' : 'dato del documento', valor: term, linea: i + 1 });
    }
  });
  return hallazgos;
}

/* ------------------------------------------------------------------ */
/* Propiedades del .docx (autor, empresa, etc.)                        */
/* ------------------------------------------------------------------ */

/** Lee un archivo de dentro de un .zip (como un .docx) sin dependencias externas. */
export async function leerDeZip(zipPath, nombre) {
  const buf = await readFile(zipPath);
  const fin = buf.lastIndexOf(Buffer.from([0x50, 0x4b, 0x05, 0x06]));
  if (fin < 0) throw new Error('No es un archivo .zip/.docx válido');
  const total = buf.readUInt16LE(fin + 10);
  let p = buf.readUInt32LE(fin + 16);
  for (let n = 0; n < total; n++) {
    const metodo = buf.readUInt16LE(p + 10);
    const comprimido = buf.readUInt32LE(p + 20);
    const largoNombre = buf.readUInt16LE(p + 28);
    const largoExtra = buf.readUInt16LE(p + 30);
    const largoComent = buf.readUInt16LE(p + 32);
    const local = buf.readUInt32LE(p + 42);
    const archivo = buf.subarray(p + 46, p + 46 + largoNombre).toString('utf8');
    if (archivo === nombre) {
      const ini = local + 30 + buf.readUInt16LE(local + 26) + buf.readUInt16LE(local + 28);
      const datos = buf.subarray(ini, ini + comprimido);
      return (metodo === 8 ? inflateRawSync(datos) : datos).toString('utf8');
    }
    p += 46 + largoNombre + largoExtra + largoComent;
  }
  return null;
}

/** Autor, último en modificar, empresa y responsable guardados en el .docx. */
export async function propiedadesDocx(docx) {
  const core = (await leerDeZip(docx, 'docProps/core.xml')) ?? '';
  const app = (await leerDeZip(docx, 'docProps/app.xml')) ?? '';
  const tag = (xml, t) => xml.match(new RegExp(`<(?:\\w+:)?${t}>([^<]*)</(?:\\w+:)?${t}>`))?.[1]?.trim() || undefined;
  return {
    autor: tag(core, 'creator'),
    ultimoEnModificar: tag(core, 'lastModifiedBy'),
    empresa: tag(app, 'Company'),
    responsable: tag(app, 'Manager'),
    titulo: tag(core, 'title'),
  };
}

export async function escribirTexto(archivo, texto) {
  await writeFile(archivo, texto.replace(/\r\n/g, '\n'), 'utf8');
}
