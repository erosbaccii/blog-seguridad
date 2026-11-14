// Verifica el contraste WCAG de la paleta definida en src/styles/tokens.css.
// Uso: npm run contraste
import { readFileSync } from 'node:fs';
import { fileURLToPath } from 'node:url';

const css = readFileSync(fileURLToPath(new URL('../src/styles/tokens.css', import.meta.url)), 'utf8');
const raw = {};
for (const [, name, hex] of css.matchAll(/--([ld]-[\w-]+):\s*(#[0-9a-fA-F]{6})/g)) raw[name] = hex;

const rgb = (hex) => [1, 3, 5].map((i) => parseInt(hex.slice(i, i + 2), 16));
const lin = (c) => ((c /= 255) <= 0.04045 ? c / 12.92 : ((c + 0.055) / 1.055) ** 2.4);
const lum = (hex) => { const [r, g, b] = rgb(hex).map(lin); return 0.2126 * r + 0.7152 * g + 0.0722 * b; };
const ratio = (a, b) => { const [x, y] = [lum(a), lum(b)].sort((m, n) => n - m); return (x + 0.05) / (y + 0.05); };
// color-mix(in srgb, a p%, b)
const mix = (a, b, p) => '#' + rgb(a).map((v, i) => Math.round(v * p + rgb(b)[i] * (1 - p)).toString(16).padStart(2, '0')).join('');

let fallos = 0;
function check(modo, fg, bg, min, nota = '') {
  const p = modo === 'claro' ? 'l-' : 'd-';
  const f = raw[p + fg] ?? fg;
  const b = bg.startsWith('#') ? bg : raw[p + bg];
  const r = ratio(f, b);
  const ok = r >= min;
  if (!ok) fallos++;
  console.log(`${ok ? 'OK  ' : 'FALLA'} [${modo}] ${fg.padEnd(14)} sobre ${bg.padEnd(14)} ${r.toFixed(2)}:1 (mín ${min})${nota ? ' — ' + nota : ''}`);
}

for (const modo of ['claro', 'oscuro']) {
  const p = modo === 'claro' ? 'l-' : 'd-';
  for (const bg of ['bg', 'surface']) {
    check(modo, 'text', bg, 4.5);
    check(modo, 'text-muted', bg, 4.5);
    check(modo, 'accent', bg, 4.5);
    for (const s of ['success', 'warning', 'danger']) check(modo, `${s}-text`, bg, 4.5);
  }
  if (modo === 'oscuro') { check(modo, 'accent-2', 'bg', 4.5); check(modo, 'accent-2', 'surface', 4.5); }
  check(modo, 'on-accent', 'accent', 4.5, 'texto de botones');
  // Cajas de alerta: fondo teñido 9% sobre la superficie
  for (const s of ['success', 'warning', 'danger', 'accent']) {
    const tinted = mix(raw[p + s], raw[p + 'surface'], 0.09);
    check(modo, 'text', tinted, 4.5, `texto en caja ${s}`);
    check(modo, s === 'accent' ? 'accent' : `${s}-text`, tinted, 4.5, `título en caja ${s}`);
    check(modo, s === 'accent' ? 'accent' : `${s}-text`, tinted, 3, `ícono en caja ${s}`);
  }
  const tag = mix(raw[p + 'accent-2'], raw[p + 'surface'], 0.14);
  check(modo, 'text', tag, 4.5, 'texto en etiqueta');
}

console.log('\nSolo informativo (paleta original usada como texto):');
for (const s of ['success', 'warning', 'danger']) console.log(`  [claro] ${s} ${raw['l-' + s]} sobre blanco: ${ratio(raw['l-' + s], '#FFFFFF').toFixed(2)}:1`);
console.log(`  [claro] accent-2 ${raw['l-accent-2']} sobre blanco: ${ratio(raw['l-accent-2'], '#FFFFFF').toFixed(2)}:1`);

if (fallos) { console.error(`\n${fallos} combinación(es) no cumplen.`); process.exit(1); }
console.log('\nTodas las combinaciones de texto cumplen WCAG AA.');
