// Genera public/og/default-es.png y default-en.png (1200×630) para compartir en LinkedIn y otras redes.
// Los colores salen de src/styles/tokens.css. Uso: npm run og
import { mkdir, readFile } from 'node:fs/promises';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import sharp from 'sharp';

const SITIO = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');
const css = await readFile(path.join(SITIO, 'src/styles/tokens.css'), 'utf8');
const c = Object.fromEntries([...css.matchAll(/--([\w-]+):\s*(#[0-9a-fA-F]{6})/g)].map(([, k, v]) => [k, v]));

// color-mix(in srgb, a p, b), igual que --hero-bg-2 en tokens.css
const mezcla = (a, b, p) =>
  '#' + [1, 3, 5].map((i) => Math.round(parseInt(a.slice(i, i + 2), 16) * p + parseInt(b.slice(i, i + 2), 16) * (1 - p)).toString(16).padStart(2, '0')).join('');
const fondo2 = mezcla(c['l-accent'], c['d-bg'], 0.28);

const textos = {
  es: { sub: 'Seguridad defensiva, concientización', sub2: 'anti-phishing e IA', tag: 'Artículos · Guías · Entrenamiento' },
  en: { sub: 'Defensive security, anti-phishing', sub2: 'awareness and AI', tag: 'Articles · Guides · Training' },
};
const fuente = "'IBM Plex Sans', 'Segoe UI', Arial, sans-serif";
const mono = "'JetBrains Mono', Consolas, 'Courier New', monospace";

// Pistas de circuito en isométrico alrededor del escudo
const S = 26, O = { x: 905, y: 360 };
const P = (u, v) => `${(O.x + (u - v) * 0.866 * S).toFixed(1)},${(O.y + (u + v) * 0.5 * S).toFixed(1)}`;
const pistas = [
  [[1.6, -0.6], [3.2, -0.6], [3.2, -2.4], [4.6, -2.4]],
  [[1.6, 0.8], [3.8, 0.8], [3.8, 2.2]],
  [[0.6, 1.6], [0.6, 3.6], [2.2, 3.6]],
  [[-0.8, 1.6], [-0.8, 4.4]],
  [[-1.6, 0.6], [-3.4, 0.6], [-3.4, 2.6], [-4.6, 2.6]],
  [[-1.6, -0.8], [-4.4, -0.8]],
  [[-0.6, -1.6], [-0.6, -3.6], [-2.4, -3.6]],
  [[0.8, -1.6], [0.8, -4.2]],
];
const placa = [P(-5, -5), P(5, -5), P(5, 5), P(-5, 5)].join(' ');
const chip = [P(-1.6, -1.6), P(1.6, -1.6), P(1.6, 1.6), P(-1.6, 1.6)].join(' ');

function svg(lang) {
  const t = textos[lang];
  return `<svg xmlns="http://www.w3.org/2000/svg" width="1200" height="630" viewBox="0 0 1200 630">
  <defs>
    <linearGradient id="bg" x1="0" y1="0" x2="1" y2="1"><stop offset="0" stop-color="${c['d-bg']}"/><stop offset="1" stop-color="${fondo2}"/></linearGradient>
    <radialGradient id="glow" cx="0.75" cy="0.55" r="0.5"><stop offset="0" stop-color="${c['d-accent-2']}" stop-opacity="0.28"/><stop offset="1" stop-color="${c['d-accent-2']}" stop-opacity="0"/></radialGradient>
    <linearGradient id="sh" x1="0" y1="0" x2="0.4" y2="1"><stop offset="0" stop-color="${c['d-accent']}"/><stop offset="1" stop-color="${c['l-accent']}"/></linearGradient>
  </defs>
  <rect width="1200" height="630" fill="url(#bg)"/>
  <rect width="1200" height="630" fill="url(#glow)"/>
  <polygon points="${placa}" fill="${c['d-surface']}" fill-opacity="0.55" stroke="${c['d-accent-2']}" stroke-opacity="0.35"/>
  <g fill="none" stroke="${c['d-accent']}" stroke-opacity="0.75" stroke-width="2.4" stroke-linejoin="round" stroke-linecap="round">
    ${pistas.map((p) => `<polyline points="${p.map(([u, v]) => P(u, v)).join(' ')}"/>`).join('')}
  </g>
  <g fill="${c['d-bg']}" stroke="${c['d-accent-2']}" stroke-width="2">
    ${pistas.map((p) => { const [x, y] = P(...p.at(-1)).split(','); return `<ellipse cx="${x}" cy="${y}" rx="6" ry="3.6"/>`; }).join('')}
  </g>
  <polygon points="${chip}" fill="${c['d-border']}" stroke="${c['d-accent-2']}" stroke-width="1.5"/>
  <ellipse cx="${O.x}" cy="${O.y - 10}" rx="80" ry="44" fill="${c['d-accent-2']}" fill-opacity="0.18"/>
  <g transform="translate(${O.x} ${O.y - 110}) scale(1.6)">
    <path d="M0-41 33-29V-2C33 22 16 35 0 41-16 35-33 22-33-2V-29z" fill="${c['d-accent-2']}" fill-opacity="0.2" stroke="${c['d-accent-2']}" stroke-width="1.5"/>
    <path d="M0-36 28-26V-2C28 18 14 29 0 35-14 29-28 18-28-2V-26z" fill="url(#sh)"/>
    <path d="M-8-3v-6a8 8 0 0 1 16 0v6" fill="none" stroke="${c['d-text']}" stroke-width="3" stroke-linecap="round"/>
    <rect x="-12" y="-4" width="24" height="19" rx="3.5" fill="${c['d-text']}"/>
    <circle cx="0" cy="4" r="2.6" fill="${c['l-accent']}"/>
  </g>
  <g fill="${c['violet']}"><path transform="translate(760 150)" d="M0-10Q1-1 10 0Q1 1 0 10Q-1 1-10 0Q-1-1 0-10z"/></g>
  <g fill="${c['d-accent-2']}"><path transform="translate(1080 210) scale(.8)" d="M0-10Q1-1 10 0Q1 1 0 10Q-1 1-10 0Q-1-1 0-10z"/></g>

  <rect x="80" y="96" width="64" height="64" rx="14" fill="${c['d-accent-2']}"/>
  <rect x="72" y="88" width="64" height="64" rx="14" fill="${c['l-accent']}"/>
  <text x="104" y="130" text-anchor="middle" font-family="${mono}" font-weight="700" font-size="26" fill="${c['l-surface']}">EB</text>
  <text x="80" y="290" font-family="${fuente}" font-weight="700" font-size="72" fill="${c['d-text']}">Eros Baccigalupi</text>
  <text x="80" y="356" font-family="${fuente}" font-size="34" fill="${c['d-text-muted']}">${t.sub}</text>
  <text x="80" y="400" font-family="${fuente}" font-size="34" fill="${c['d-text-muted']}">${t.sub2}</text>
  <rect x="80" y="470" width="4" height="40" fill="${c['d-accent-2']}"/>
  <text x="100" y="498" font-family="${mono}" font-size="22" fill="${c['d-accent']}">${t.tag}</text>
</svg>`;
}

const salida = path.join(SITIO, 'public', 'og');
await mkdir(salida, { recursive: true });
for (const lang of Object.keys(textos)) {
  // sharp no copia metadatos al PNG
  await sharp(Buffer.from(svg(lang))).png({ compressionLevel: 9 }).toFile(path.join(salida, `default-${lang}.png`));
  console.log(`✔ public/og/default-${lang}.png`);
}
