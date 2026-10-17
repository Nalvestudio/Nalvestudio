// Garment silhouettes drawn AT REAL SCALE (port of legacy js/garments.js).
// All coordinates are in CENTIMETERS: origin (0,0) is the neck center on the shoulder top edge,
// X grows to the right and Y downwards. "W" = chest width of the flat garment, "L" = shoulder to hem.

export const GARMENT_VIEW = { FRONT: 'front', BACK: 'back' } as const;
export type GarmentView = (typeof GARMENT_VIEW)[keyof typeof GARMENT_VIEW];

export type GarmentGeometryType = 'tee' | 'crop' | 'tank' | 'hoodie';

interface GarmentElement {
  k: 'body' | 'band' | 'rib' | 'shade' | 'stitch' | 'seam';
  d: string;
  w?: number;
}

export interface GarmentExtent {
  halfW: number;
  top: number;
  bottom: number;
}

export interface GarmentLimits {
  halfW: number;
  minY: number;
  maxY: number;
}

export interface GarmentGeometry {
  els: GarmentElement[];
  ext: GarmentExtent;
  limits: GarmentLimits;
  neckY: number;
}

export interface GarmentRender {
  svg: string;
  ext: GarmentExtent;
  limits: GarmentLimits;
  neckY: number;
}

type Point = [number, number];

const clamp = (v: number, a: number, b: number) => Math.max(a, Math.min(b, v));
const r2 = (n: number) => Math.round(n * 100) / 100;
const P = (x: number, y: number) => `${r2(x)} ${r2(y)}`;

const neckLR = (nw: number, nd: number) => `C ${P(-nw, nd * 0.6)} ${P(-nw * 0.55, nd)} ${P(0, nd)} C ${P(nw * 0.55, nd)} ${P(nw, nd * 0.6)} ${P(nw, 0)}`;
const neckRL = (nw: number, nd: number) => `C ${P(nw, nd * 0.6)} ${P(nw * 0.55, nd)} ${P(0, nd)} C ${P(-nw * 0.55, nd)} ${P(-nw, nd * 0.6)} ${P(-nw, 0)}`;
const mirrorLine = (x1: number, y1: number, x2: number, y2: number) => [`M ${P(x1, y1)} L ${P(x2, y2)}`, `M ${P(-x1, y1)} L ${P(-x2, y2)}`];

function tee(W: number, L: number, front: boolean, sleeve: number): GarmentGeometry {
  const ks = clamp(W / 49, 0.65, 1.1);
  const nw = 9 * ks, nd = (front ? 8 : 2.6) * ks;
  const sx = W / 2 + 3 * ks, sy = 5 * ks;
  const a = (35 * Math.PI) / 180, ca = Math.cos(a), sa = Math.sin(a);
  const sl = sleeve * ks, cuff = 17 * ks;
  const p1: Point = [sx + sl * ca, sy + sl * sa];
  const p2: Point = [p1[0] - cuff * sa, p1[1] + cuff * ca];
  const p3: Point = [W / 2, sy + 21 * ks];
  const d = `M ${P(-nw, 0)} L ${P(-sx, sy)} L ${P(-p1[0], p1[1])} L ${P(-p2[0], p2[1])} L ${P(-p3[0], p3[1])} L ${P(-W / 2, L)} L ${P(W / 2, L)} L ${P(p3[0], p3[1])} L ${P(p2[0], p2[1])} L ${P(p1[0], p1[1])} L ${P(sx, sy)} L ${P(nw, 0)} ${neckRL(nw, nd)} Z`;
  const off = 1.8 * ks;
  const q1: Point = [p1[0] - off * ca, p1[1] - off * sa], q2: Point = [p2[0] - off * ca, p2[1] - off * sa];
  const els: GarmentElement[] = [
    { k: 'body', d },
    { k: 'shade', d: `M ${P(-nw, 0)} Q ${P(0, -2.6 * ks)} ${P(nw, 0)} ${neckRL(nw, nd)} Z` },
    { k: 'rib', d: `M ${P(-nw, 0)} ${neckLR(nw, nd)}`, w: 1.9 * ks },
    ...mirrorLine(q1[0], q1[1], q2[0], q2[1]).map((l): GarmentElement => ({ k: 'stitch', d: l })),
    { k: 'stitch', d: `M ${P(-W / 2, L - 2.2)} L ${P(W / 2, L - 2.2)}` },
  ];
  return { els, ext: { halfW: Math.max(p1[0], p2[0]), top: -2.6 * ks, bottom: L }, limits: { halfW: W / 2 - 2, minY: nd + 2, maxY: L - 3 }, neckY: nd };
}

function tank(W: number, L: number, front: boolean): GarmentGeometry {
  const ks = clamp(W / 52, 0.7, 1.15);
  const nw = 10.5 * ks, nd = (front ? 13 : 4) * ks, x1 = W / 2 - 7;
  const arm = (s: number) => `${P(s * (x1 - 0.5), 10)} ${P(s * (W / 2 - 2), 19)} ${P(s * (W / 2), 25)}`;
  const d = `M ${P(-nw, 0)} L ${P(-x1, 0)} C ${arm(-1)} L ${P(-W / 2, L)} L ${P(W / 2, L)} L ${P(W / 2, 25)} C ${P(W / 2 - 2, 19)} ${P(x1 - 0.5, 10)} ${P(x1, 0)} L ${P(nw, 0)} ${neckRL(nw, nd)} Z`;
  const els: GarmentElement[] = [
    { k: 'body', d },
    { k: 'shade', d: `M ${P(-nw, 0)} Q ${P(0, -2.4 * ks)} ${P(nw, 0)} ${neckRL(nw, nd)} Z` },
    { k: 'rib', d: `M ${P(-nw, 0)} ${neckLR(nw, nd)}`, w: 1.6 * ks },
    { k: 'rib', d: `M ${P(-x1, 0)} C ${arm(-1)}`, w: 1.4 },
    { k: 'rib', d: `M ${P(x1, 0)} C ${P(x1 - 0.5, 10)} ${P(W / 2 - 2, 19)} ${P(W / 2, 25)}`, w: 1.4 },
    { k: 'stitch', d: `M ${P(-W / 2, L - 2.2)} L ${P(W / 2, L - 2.2)}` },
  ];
  return { els, ext: { halfW: W / 2, top: -2.4 * ks, bottom: L }, limits: { halfW: W / 2 - 8, minY: nd + 2, maxY: L - 3 }, neckY: nd };
}

function hoodie(W: number, L: number, front: boolean): GarmentGeometry {
  const k = clamp(W / 52, 0.7, 1.3);
  const nw = 10 * k, nd = (front ? 5 : 1.5) * k;
  const sx = W / 2 + 1.5 * k, sy = 6 * k;
  const c1: Point = [W / 2 + 13 * k, L - 9], cw = 10 * k;
  const dx = c1[0] - sx, dy = c1[1] - sy, len = Math.hypot(dx, dy);
  const dir: Point = [dx / len, dy / len], perp: Point = [-dir[1], dir[0]];
  const c2: Point = [c1[0] + perp[0] * cw, c1[1] + perp[1] * cw];
  const rib = 7;
  const c1b: Point = [c1[0] + dir[0] * rib, c1[1] + dir[1] * rib], c2b: Point = [c2[0] + dir[0] * rib, c2[1] + dir[1] * rib];
  const arm: Point = [W / 2 - 1, 22 * k];
  const sleeve = (s: number) => `M ${P(s * sx, sy)} L ${P(s * c1[0], c1[1])} L ${P(s * c2[0], c2[1])} L ${P(s * arm[0], arm[1])} Z`;
  const cuff = (s: number) => `M ${P(s * c1[0], c1[1])} L ${P(s * c1b[0], c1b[1])} L ${P(s * c2b[0], c2b[1])} L ${P(s * c2[0], c2[1])} Z`;
  const hh = 21 * k;
  const hood = `M ${P(-nw * 1.1, 3)} C ${P(-nw * 1.7, -9 * k)} ${P(-nw * 1.2, -hh)} ${P(0, -hh)} C ${P(nw * 1.2, -hh)} ${P(nw * 1.7, -9 * k)} ${P(nw * 1.1, 3)} Z`;
  const body = `M ${P(-nw, 0)} L ${P(-sx, sy)} L ${P(-W / 2, sy + 5 * k)} L ${P(-W / 2, L)} L ${P(W / 2, L)} L ${P(W / 2, sy + 5 * k)} L ${P(sx, sy)} L ${P(nw, 0)} ${neckRL(nw, nd)} Z`;
  const els: GarmentElement[] = [
    { k: 'body', d: sleeve(-1) }, { k: 'body', d: sleeve(1) },
    { k: 'band', d: cuff(-1) }, { k: 'band', d: cuff(1) },
    { k: 'body', d: hood },
    { k: 'body', d: body },
    { k: 'band', d: `M ${P(-W / 2, L - 6.5)} L ${P(W / 2, L - 6.5)} L ${P(W / 2, L)} L ${P(-W / 2, L)} Z` },
  ];
  if (front) {
    els.push({ k: 'shade', d: `M ${P(-nw, 0)} C ${P(-nw * 1.2, -8 * k)} ${P(-nw * 0.6, -16 * k)} ${P(0, -16 * k)} C ${P(nw * 0.6, -16 * k)} ${P(nw * 1.2, -8 * k)} ${P(nw, 0)} ${neckRL(nw, nd)} Z` });
    els.push({ k: 'rib', d: `M ${P(-nw, 0)} ${neckLR(nw, nd)}`, w: 1.6 * k });
    els.push({ k: 'seam', d: `M ${P(-3 * k, nd + 0.5)} L ${P(-3.6 * k, nd + 11 * k)}` });
    els.push({ k: 'seam', d: `M ${P(3 * k, nd + 0.5)} L ${P(3.6 * k, nd + 11 * k)}` });
    const y1 = L * 0.5, y2 = L - 9;
    els.push({ k: 'seam', d: `M ${P(-0.27 * W, y1)} L ${P(0.27 * W, y1)} L ${P(0.35 * W, y2)} L ${P(-0.35 * W, y2)} Z` });
  } else {
    els.push({ k: 'seam', d: `M ${P(0, -hh)} L ${P(0, 0)}` });
    els.push({ k: 'rib', d: `M ${P(-nw, 0)} ${neckLR(nw, nd)}`, w: 1.4 * k });
  }
  return { els, ext: { halfW: Math.max(c1[0], c2b[0], c1b[0]), top: -hh, bottom: L }, limits: { halfW: W / 2 - 2, minY: front ? nd + 4 : 8, maxY: L - 8 }, neckY: nd };
}

export function geometry(type: GarmentGeometryType, W: number, L: number, view: GarmentView): GarmentGeometry {
  const front = view !== GARMENT_VIEW.BACK;
  if (type === 'tank') return tank(W, L, front);
  if (type === 'hoodie') return hoodie(W, L, front);
  if (type === 'crop') return tee(W, L, front, 17);
  return tee(W, L, front, 20);
}

const rgb = (h: string) => [1, 3, 5].map((i) => parseInt(h.slice(i, i + 2), 16));
export const lum = (h: string) => {
  const [r, g, b] = rgb(h);
  return r * 0.3 + g * 0.59 + b * 0.11;
};
const mix = (h: string, t: string, a: number) => {
  const A = rgb(h), B = rgb(t);
  return '#' + A.map((v, i) => Math.round(v + (B[i] - v) * a).toString(16).padStart(2, '0')).join('');
};

/** SVG markup (inner elements only) for a garment silhouette filled with a color. */
export function render(type: GarmentGeometryType, W: number, L: number, view: GarmentView, fill: string): GarmentRender {
  const g = geometry(type, W, L, view);
  const dark = lum(fill) < 110;
  const outline = dark ? 'rgba(255,255,255,.30)' : 'rgba(17,17,18,.55)';
  const ribC = dark ? mix(fill, '#ffffff', 0.14) : mix(fill, '#000000', 0.09);
  const stitch = dark ? 'rgba(255,255,255,.38)' : 'rgba(17,17,18,.38)';
  let s = '';
  for (const e of g.els) {
    if (e.k === 'body') s += `<path d="${e.d}" fill="${fill}" stroke="${outline}" stroke-width=".35" stroke-linejoin="round"/><path d="${e.d}" fill="url(#cloth)"/>`;
    else if (e.k === 'band') s += `<path d="${e.d}" fill="${ribC}" stroke="${outline}" stroke-width=".3" stroke-linejoin="round"/>`;
    else if (e.k === 'rib') s += `<path d="${e.d}" fill="none" stroke="${ribC}" stroke-width="${r2(e.w || 1.8)}"/>`;
    else if (e.k === 'shade') s += `<path d="${e.d}" fill="rgba(0,0,0,.34)"/>`;
    else if (e.k === 'stitch') s += `<path d="${e.d}" fill="none" stroke="${stitch}" stroke-width=".2" stroke-dasharray=".8 .6"/>`;
    else s += `<path d="${e.d}" fill="none" stroke="${stitch}" stroke-width=".28" stroke-linecap="round"/>`;
  }
  return { svg: s, ext: g.ext, limits: g.limits, neckY: g.neckY };
}

/** Width/length dimension lines, like in the size charts. */
export function dims(W: number, L: number, ext: GarmentExtent): string {
  const ink = 'rgba(17,17,18,.75)', y = L + 5.5, ax = -(ext.halfW + 3.5);
  const font = 'font-family="IBM Plex Mono, monospace" font-size="2.3" font-weight="600" fill="rgba(17,17,18,.8)"';
  return `<g stroke="${ink}" stroke-width=".25" fill="none">
      <line x1="${r2(-W / 2)}" y1="${L}" x2="${r2(-W / 2)}" y2="${r2(y + 1.5)}" stroke-dasharray=".8 .6" opacity=".5"/>
      <line x1="${r2(W / 2)}" y1="${L}" x2="${r2(W / 2)}" y2="${r2(y + 1.5)}" stroke-dasharray=".8 .6" opacity=".5"/>
      <line x1="${r2(-W / 2)}" y1="${y}" x2="${r2(W / 2)}" y2="${y}" marker-start="url(#arr)" marker-end="url(#arr)"/>
      <line x1="${r2(ax - 1.5)}" y1="0" x2="${r2(ax + 1.5)}" y2="0" opacity=".5"/>
      <line x1="${r2(ax - 1.5)}" y1="${L}" x2="${r2(ax + 1.5)}" y2="${L}" opacity=".5"/>
      <line x1="${r2(ax)}" y1="0" x2="${r2(ax)}" y2="${L}" marker-start="url(#arr)" marker-end="url(#arr)"/>
    </g>
    <text x="0" y="${r2(y + 3.6)}" text-anchor="middle" ${font}>ANCHO ${W} cm</text>
    <text transform="translate(${r2(ax - 1.4)} ${r2(L / 2)}) rotate(-90)" text-anchor="middle" ${font}>LARGO ${L} cm</text>`;
}

/** Small icon (full <svg>) for the garment picker. */
export function icon(type: GarmentGeometryType, W: number, L: number): string {
  const r = render(type, W, L, GARMENT_VIEW.FRONT, '#E4E1D7');
  const x = r.ext.halfW + 2, top = r.ext.top - 2, h = L - top + 3;
  return `<svg viewBox="${r2(-x)} ${r2(top)} ${r2(2 * x)} ${r2(h)}" aria-hidden="true">${r.svg}</svg>`;
}
