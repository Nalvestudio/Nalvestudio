// Real-scale technical drawings for the home hero doors (port of legacy js/hero.js).
// Pure string builders: rendered once on the server through dangerouslySetInnerHTML (static, no user input).
import { render } from '@/lib/garments';

const f = (n: number) => Math.round(n * 100) / 100;
const font = 'font-family="IBM Plex Mono, monospace" font-size="2.3" font-weight="600"';
const fontL = 'font-family="IBM Plex Mono, monospace" font-size="3.1" font-weight="600"';
const INK = '#111112', ACC = '#FF4D00';

interface CircleShape {
  t: 'c';
  x: number;
  y: number;
  r: number;
  fill: string;
  inner?: string;
}

interface RectShape {
  t: 'r';
  x: number;
  y: number;
  w: number;
  h: number;
  rx?: number;
  fill: string;
  inner?: string;
}

type Shape = CircleShape | RectShape;

function sticker(shape: Shape, i: number): string {
  const delay = `style="animation-delay:${0.25 + i * 0.09}s"`;
  const cut = 'fill="none" stroke="#FF4D00" stroke-width=".22" stroke-dasharray=".7 .5"';
  if (shape.t === 'c') return `<g class="pop" ${delay}><circle cx="${shape.x}" cy="${shape.y}" r="${f(shape.r + 0.55)}" ${cut}/><circle cx="${shape.x}" cy="${shape.y}" r="${shape.r}" fill="${shape.fill}" stroke="${INK}" stroke-width=".25"/>${shape.inner || ''}</g>`;
  return `<g class="pop" ${delay}><rect x="${f(shape.x - 0.55)}" y="${f(shape.y - 0.55)}" width="${f(shape.w + 1.1)}" height="${f(shape.h + 1.1)}" rx="${f((shape.rx || 1) + 0.55)}" ${cut}/><rect x="${shape.x}" y="${shape.y}" width="${shape.w}" height="${shape.h}" rx="${shape.rx || 1}" fill="${shape.fill}" stroke="${INK}" stroke-width=".25"/>${shape.inner || ''}</g>`;
}

const shapes: Shape[] = [
  { t: 'c', x: 8, y: 8, r: 6.4, fill: INK, inner: `<circle cx="8" cy="8" r="3" fill="${ACC}"/>` },
  { t: 'r', x: 16.5, y: 1.6, w: 12, h: 8, rx: 1.6, fill: ACC },
  { t: 'c', x: 36, y: 9, r: 6.5, fill: '#fff', inner: `<circle cx="36" cy="9" r="1.8" fill="${INK}"/>` },
  { t: 'r', x: 45, y: 1.6, w: 11.4, h: 12, rx: 1.6, fill: INK },
  { t: 'c', x: 22.5, y: 19.5, r: 5.6, fill: ACC },
  { t: 'r', x: 1.6, y: 17.5, w: 12.5, h: 12.5, rx: 1.6, fill: '#fff', inner: `<text x="7.85" y="25.3" text-anchor="middle" font-family="Unbounded, sans-serif" font-size="6.5" font-weight="700" fill="${INK}">N</text>` },
  { t: 'r', x: 32, y: 18, w: 13, h: 7, rx: 1.4, fill: '#fff', inner: `<path d="M34 21.5 h9" stroke="${INK}" stroke-width=".5"/>` },
  { t: 'c', x: 52, y: 24, r: 4.4, fill: ACC },
  { t: 'c', x: 22.5, y: 32, r: 5.6, fill: '#fff', inner: `<circle cx="22.5" cy="32" r="1.6" fill="${INK}"/>` },
  { t: 'r', x: 1.6, y: 32, w: 12.5, h: 7, rx: 1.4, fill: INK },
  { t: 'r', x: 32, y: 28, w: 14, h: 9, rx: 1.4, fill: ACC },
  { t: 'c', x: 51, y: 33.5, r: 3.6, fill: INK },
  { t: 'c', x: 8, y: 45, r: 4.4, fill: ACC },
  { t: 'r', x: 14.8, y: 40.5, w: 13.8, h: 8.5, rx: 1.4, fill: '#fff', inner: `<path d="M17 45 h9.5" stroke="${INK}" stroke-width=".5"/><path d="M17 47 h6" stroke="${INK}" stroke-width=".5"/>` },
  { t: 'r', x: 32, y: 39.5, w: 24.4, h: 9, rx: 1.6, fill: '#fff', inner: `<path d="M34.5 44 h19" stroke="${INK}" stroke-width=".5"/>` },
];

export function planchaArt(): string {
  return `<svg viewBox="-10 -10 78 70" role="img" aria-label="Plancha de stickers de 58 por 50 centímetros">
      <rect x="0" y="0" width="58" height="50" fill="#fff" stroke="${INK}" stroke-width=".35"/>
      ${shapes.map(sticker).join('')}
      <g stroke="${INK}" stroke-width=".25" fill="none">
        <line class="dimline" pathLength="1" x1="0" y1="-4.5" x2="58" y2="-4.5" marker-start="url(#arr)" marker-end="url(#arr)"/>
        <line class="dimline" pathLength="1" x1="-4.5" y1="0" x2="-4.5" y2="50" marker-start="url(#arr)" marker-end="url(#arr)"/>
      </g>
      <text x="29" y="-6.2" text-anchor="middle" ${font} fill="${INK}">58 cm</text>
      <text transform="translate(-6.2 25) rotate(-90)" text-anchor="middle" ${font} fill="${INK}">50 cm</text>
    </svg>`;
}

export function teeArt(): string {
  const r = render('tee', 49, 68, 'front', INK);
  const ax = -(r.ext.halfW + 3.5);
  return `<svg viewBox="-54 -8 108 88" role="img" aria-label="Remera talle M de 49 por 68 centímetros">
      ${r.svg}
      <rect class="pop" style="animation-delay:.5s" x="-11" y="17" width="22" height="16" rx=".8" fill="none" stroke="${ACC}" stroke-width=".4" stroke-dasharray="1.2 .9"/>
      <circle class="pop" style="animation-delay:.6s" cx="0" cy="25" r="5.2" fill="${ACC}"/>
      <g stroke="${ACC}" stroke-width=".25" fill="none"><line class="dimline" pathLength="1" x1="-11" y1="14.2" x2="11" y2="14.2" marker-start="url(#arr-acc)" marker-end="url(#arr-acc)"/></g>
      <text x="0" y="12.4" text-anchor="middle" ${fontL} fill="${ACC}">22 cm</text>
      <g stroke="${INK}" stroke-width=".25" fill="none">
        <line class="dimline" pathLength="1" x1="-24.5" y1="73.5" x2="24.5" y2="73.5" marker-start="url(#arr)" marker-end="url(#arr)"/>
        <line class="dimline" pathLength="1" x1="${f(ax)}" y1="0" x2="${f(ax)}" y2="68" marker-start="url(#arr)" marker-end="url(#arr)"/>
      </g>
      <text x="0" y="78.2" text-anchor="middle" ${fontL} fill="${INK}">49 cm</text>
      <text transform="translate(${f(ax - 1.6)} 34) rotate(-90)" text-anchor="middle" ${fontL} fill="${INK}">68 cm</text>
    </svg>`;
}
