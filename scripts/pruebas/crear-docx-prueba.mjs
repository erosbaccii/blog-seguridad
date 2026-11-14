// Genera ../originales/ejemplo-prueba.docx y ejemplo-prueba.pdf CARGADOS de metadatos,
// para probar que `npm run word` los limpia. Uso: node scripts/pruebas/crear-docx-prueba.mjs
import { spawnSync } from 'node:child_process';
import { mkdtemp, rm, writeFile, mkdir } from 'node:fs/promises';
import os from 'node:os';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import sharp from 'sharp';
import { PDFDocument, PDFName, PDFString, StandardFonts } from 'pdf-lib';

const SITIO = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..', '..');
const ORIGINALES = path.resolve(SITIO, '..', 'originales');
const usuario = os.userInfo().username;
const pandoc = ['pandoc', path.join(process.env.LOCALAPPDATA ?? '', 'Pandoc', 'pandoc.exe')].find(
  (c) => spawnSync(c, ['--version']).status === 0,
);
if (!pandoc) throw new Error('Pandoc no está instalado');

const tmp = await mkdtemp(path.join(os.tmpdir(), 'prueba-docx-'));
try {
  // Foto JPEG con EXIF: cámara, autor, software y GPS
  const svgFoto = `<svg xmlns="http://www.w3.org/2000/svg" width="900" height="500"><rect width="900" height="500" fill="#1E293B"/><rect x="60" y="60" width="780" height="380" rx="24" fill="#2563EB"/><text x="450" y="270" font-size="56" text-anchor="middle" fill="#F8FAFC" font-family="Arial">Captura de un correo</text></svg>`;
  const foto = await sharp(Buffer.from(svgFoto))
    .jpeg({ quality: 80 })
    .withExif({
      IFD0: { Make: 'Telefono de Prueba', Model: 'Modelo X', Artist: usuario, Software: 'Editor de Fotos 1.0', Copyright: usuario },
      IFD3: { GPSLatitudeRef: 'S', GPSLatitude: '34/1 36/1 0/1', GPSLongitudeRef: 'W', GPSLongitude: '58/1 22/1 0/1' },
    })
    .toBuffer();
  await writeFile(path.join(tmp, 'foto.jpg'), foto);

  // Diagrama PNG con XMP (autor y herramienta)
  const svgDiag = `<svg xmlns="http://www.w3.org/2000/svg" width="800" height="300"><rect width="800" height="300" fill="#F8FAFC"/><g fill="#38BDF8" stroke="#1E293B" stroke-width="3"><rect x="40" y="110" width="200" height="80" rx="12"/><rect x="300" y="110" width="200" height="80" rx="12"/><rect x="560" y="110" width="200" height="80" rx="12"/></g><g font-family="Arial" font-size="24" text-anchor="middle" fill="#1E293B"><text x="140" y="158">Recibir</text><text x="400" y="158">Verificar</text><text x="660" y="158">Reportar</text></g></svg>`;
  const xmp = `<?xpacket begin="" id="W5M0MpCehiHzreSzNTczkc9d"?><x:xmpmeta xmlns:x="adobe:ns:meta/"><rdf:RDF xmlns:rdf="http://www.w3.org/1999/02/22-rdf-syntax-ns#"><rdf:Description xmlns:dc="http://purl.org/dc/elements/1.1/" xmlns:xmp="http://ns.adobe.com/xap/1.0/"><dc:creator><rdf:Seq><rdf:li>${usuario}</rdf:li></rdf:Seq></dc:creator><xmp:CreatorTool>Herramienta de Diagramas 2.0</xmp:CreatorTool></rdf:Description></rdf:RDF></x:xmpmeta><?xpacket end="w"?>`;
  await sharp(Buffer.from(svgDiag)).png().withXmp(xmp).toFile(path.join(tmp, 'diagrama.png'));

  // Ruta de la PC armada en tiempo de ejecución (las barras van dobles para que Markdown las respete)
  const rutaDePrueba = ['C:', 'Users', usuario, 'Documents', 'notas-phishing.txt'].join('\\\\');
  const md = `---
author: ${usuario}
---

# Ejemplo de prueba: cómo reconocer un phishing

Este documento sirve para probar la conversión de Word a artículo.

## Contexto

El phishing es un engaño por correo. [Ojo: revisar esta definición con el profe]{.comment-start id="1" author="${usuario}" date="2026-11-14T10:00:00Z"}Esta oración tiene un comentario.[]{.comment-end id="1"}

Texto con control de cambios: [esta parte fue agregada]{.insertion author="${usuario}" date="2026-11-14T10:00:00Z"}[ y esta parte fue borrada]{.deletion author="${usuario}" date="2026-11-14T10:00:00Z"}.

![Captura de pantalla de un correo sospechoso](foto.jpg)

## Pasos

1. Frenar.
2. Verificar por otro canal.
3. Reportar.

![](diagrama.png){width=80%}

Mis notas estaban en ${rutaDePrueba} y el contacto de prueba es contacto@ejemplo.com.
`;
  await writeFile(path.join(tmp, 'prueba.md'), md, 'utf8');
  await mkdir(ORIGINALES, { recursive: true });
  const docx = path.join(ORIGINALES, 'ejemplo-prueba.docx');
  const r = spawnSync(pandoc, ['prueba.md', '-o', docx], { cwd: tmp, encoding: 'utf8' });
  if (r.status !== 0) throw new Error(r.stderr);

  // PDF con Info completo, XMP y una foto con EXIF adentro
  const pdf = await PDFDocument.create();
  pdf.setTitle('Ejemplo de prueba');
  pdf.setAuthor(usuario);
  pdf.setSubject('Prueba de metadatos');
  pdf.setKeywords(['phishing', 'prueba']);
  pdf.setCreator('Microsoft Word');
  pdf.setProducer('Microsoft Word para Microsoft 365');
  pdf.getInfoDict().set(PDFName.of('Company'), PDFString.of('Empresa de Prueba S.A.'));
  const xmpPdf = pdf.context.stream(xmp, { Type: 'Metadata', Subtype: 'XML' });
  pdf.catalog.set(PDFName.of('Metadata'), pdf.context.register(xmpPdf));
  const page = pdf.addPage([595, 842]);
  const font = await pdf.embedFont(StandardFonts.Helvetica);
  page.drawText('Ejemplo de prueba: como reconocer un phishing', { x: 50, y: 780, size: 18, font });
  const img = await pdf.embedJpg(foto);
  page.drawImage(img, { x: 50, y: 450, width: 495, height: 275 });
  await writeFile(path.join(ORIGINALES, 'ejemplo-prueba.pdf'), await pdf.save());

  console.log('Creados en la carpeta originales: ejemplo-prueba.docx y ejemplo-prueba.pdf');
} finally {
  await rm(tmp, { recursive: true, force: true });
}
