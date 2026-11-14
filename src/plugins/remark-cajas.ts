/*
 * Cajas destacadas en Markdown con sintaxis de directivas:
 *
 *   :::tip                  :::warning[Título propio]
 *   Texto de la caja.       Texto.
 *   :::                     :::
 *
 * Tipos: tip | important | warning | danger
 * (también en español: sugerencia | importante | advertencia | peligro).
 * El título por defecto sale del archivo de traducciones según el idioma del
 * archivo (es.md / en.md). Cada caja lleva ícono + título + color.
 */
import { visit } from 'unist-util-visit';
import { ICONOS } from '../icons/iconos.mjs';
import { es } from '../i18n/ui/es';
import { en } from '../i18n/ui/en';

type Tipo = 'tip' | 'important' | 'warning' | 'danger';
const TIPOS: Record<string, Tipo> = {
  tip: 'tip', sugerencia: 'tip',
  important: 'important', importante: 'important', note: 'important', nota: 'important',
  warning: 'warning', advertencia: 'warning',
  danger: 'danger', peligro: 'danger',
};

// eslint-disable-next-line @typescript-eslint/no-explicit-any
type Nodo = any;

const texto = (n: Nodo): string => ('value' in n ? n.value : (n.children ?? []).map(texto).join(''));

const svg = (name: string) => ({
  type: 'element',
  tagName: 'svg',
  properties: {
    width: 20, height: 20, viewBox: '0 0 24 24', fill: 'none', stroke: 'currentColor',
    strokeWidth: 1.75, strokeLinecap: 'round', strokeLinejoin: 'round', ariaHidden: 'true',
  },
  children: ICONOS[name].map((d) => ({ type: 'element', tagName: 'path', properties: { d }, children: [] })),
});

export default function remarkCajas() {
  return (tree: Nodo, file: Nodo) => {
    const ruta = String(file.path ?? file.history?.[0] ?? '');
    const t = /[\\/]en\.mdx?$/.test(ruta) ? en : es;
    const fuente = String(file.value ?? '');

    visit(tree, (node: Nodo, index: number | undefined, parent: Nodo) => {
      if (!['containerDirective', 'leafDirective', 'textDirective'].includes(node.type)) return;
      const tipo = TIPOS[node.name];

      // Algo como "10:30" o ":foo" que no es una caja: se devuelve tal cual estaba escrito.
      if (node.type !== 'containerDirective' || !tipo) {
        if (parent && index !== undefined && node.position) {
          const original = fuente.slice(node.position.start.offset, node.position.end.offset);
          parent.children.splice(index, 1,
            node.type === 'leafDirective'
              ? { type: 'paragraph', children: [{ type: 'text', value: original }] }
              : { type: 'text', value: original });
        }
        return;
      }

      let titulo: string = t.callouts[tipo];
      const primero = node.children[0];
      if (primero?.data?.directiveLabel) {
        titulo = texto(primero);
        node.children.shift();
      }

      node.data = {
        hName: 'div',
        hProperties: { className: ['callout', `callout--${tipo}`], role: 'note' },
      };
      node.children.unshift({
        type: 'paragraph',
        children: [],
        data: {
          hName: 'p',
          hProperties: { className: ['callout-title'] },
          hChildren: [svg(tipo), { type: 'text', value: titulo }],
        },
      });
    });
  };
}
