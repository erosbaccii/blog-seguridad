// Set de íconos propio. Todos en una grilla de 24×24, trazo de 1.75, puntas redondeadas.
// Cada ícono es una lista de "d" de <path>. Lo usan Icon.astro y el plugin de cajas destacadas.

/** @type {Record<string, string[]>} */
export const ICONOS = {
  // ---- Categorías ----
  'blue-team': [
    'M12 3 4.5 6v5.5c0 4.6 3.1 8.2 7.5 9.5 4.4-1.3 7.5-4.9 7.5-9.5V6L12 3z',
    'M8.5 12.2l2.4 2.4 4.6-4.8',
  ],
  'casos-reales': [
    'M10.5 4a6.5 6.5 0 1 0 0 13 6.5 6.5 0 0 0 0-13z',
    'M15.3 15.3 20 20',
    'M10.5 7.5v3.5l2.2 1.4',
  ],
  'que-hacer-si': [
    'M9 4h6M9 4a1 1 0 0 0-1 1v1h8V5a1 1 0 0 0-1-1',
    'M8 5.5H6.5A1.5 1.5 0 0 0 5 7v12.5A1.5 1.5 0 0 0 6.5 21h11a1.5 1.5 0 0 0 1.5-1.5V7a1.5 1.5 0 0 0-1.5-1.5H16',
    'M8.5 11.5l1.5 1.5 2.5-2.5M8.5 16.5l1.5 1.5 2.5-2.5M14.5 12h1.5M14.5 17h1.5',
  ],
  'ia-seguridad': [
    'M7 7h10v10H7z',
    'M10 3v4M14 3v4M10 17v4M14 17v4M3 10h4M3 14h4M17 10h4M17 14h4',
    'M12 9.5l.8 1.7 1.7.8-1.7.8-.8 1.7-.8-1.7-1.7-.8 1.7-.8z',
  ],
  tesis: [
    'M3 8.5 12 4l9 4.5-9 4.5-9-4.5z',
    'M6.5 10.3v4.4c0 1.4 2.5 2.8 5.5 2.8s5.5-1.4 5.5-2.8v-4.4',
    'M21 8.5v5',
  ],
  'anti-phishing': [
    'M3.5 6.5h17v11h-17z',
    'M3.5 7l8.5 6 8.5-6',
    'M17 14.5v2.2a1.8 1.8 0 0 1-3.6 0',
  ],
  contacto: [
    'M4 5.5h16a1 1 0 0 1 1 1v9a1 1 0 0 1-1 1h-9l-4.5 3.5v-3.5H4a1 1 0 0 1-1-1v-9a1 1 0 0 1 1-1z',
    'M7.5 10h9M7.5 13h6',
  ],

  // ---- Cajas destacadas ----
  tip: [
    'M9 18h6M10 21h4',
    'M12 3a6 6 0 0 0-3.6 10.8c.6.5 1 1.3 1 2.1v.1h5.2v-.1c0-.8.4-1.6 1-2.1A6 6 0 0 0 12 3z',
  ],
  important: [
    'M12 3a9 9 0 1 0 0 18 9 9 0 0 0 0-18z',
    'M12 7.5v6M12 16.5h.01',
  ],
  warning: [
    'M10.3 3.9 1.8 18a2 2 0 0 0 1.7 3h17a2 2 0 0 0 1.7-3L13.7 3.9a2 2 0 0 0-3.4 0z',
    'M12 9v4M12 17h.01',
  ],
  danger: [
    'M8.2 3h7.6L21 8.2v7.6L15.8 21H8.2L3 15.8V8.2L8.2 3z',
    'M9 9l6 6M15 9l-6 6',
  ],

  // ---- Interfaz ----
  search: ['M10.5 4a6.5 6.5 0 1 0 0 13 6.5 6.5 0 0 0 0-13z', 'M15.3 15.3 20 20'],
  chevron: ['M9 6l6 6-6 6'],
  'chevrons-left': ['M11 6l-6 6 6 6M18 6l-6 6 6 6'],
  'chevrons-right': ['M13 6l6 6-6 6M6 6l6 6-6 6'],
  copy: ['M9 9h11v11H9z', 'M5 15H4V4h11v1'],
  check: ['M5 12.5l4.5 4.5L19 7.5'],
  download: ['M12 4v11M7.5 10.5 12 15l4.5-4.5', 'M5 19h14'],
  list: ['M9 6h11M9 12h11M9 18h11M4.5 6h.01M4.5 12h.01M4.5 18h.01'],
  'arrow-left': ['M19 12H5M11 6l-6 6 6 6'],
  'arrow-right': ['M5 12h14M13 6l6 6-6 6'],
  menu: ['M4 7h16M4 12h16M4 17h16'],
};

/** Ícono de cada tipo de caja destacada. */
export const ICONO_CAJA = { tip: 'tip', important: 'important', warning: 'warning', danger: 'danger' };
