// Tiny SVG renderer for the static figures of the PDF documents.
// Geometry is in math coordinates (y up); drawing flips y.

import { chainPoints } from '../src/geometry/visibility.js';

const esc = (s) => String(s).replace(/&/g, '&amp;').replace(/</g, '&lt;');
const d = (pts, closed) => pts.map((p, i) => `${i ? 'L' : 'M'}${p.x.toFixed(1)},${(-p.y).toFixed(1)}`).join(' ') + (closed ? ' Z' : '');

export function figure(P, layers, { width = 480, pad = 34, extra = [], title = '' } = {}) {
  let { minX, minY, maxX, maxY } = P.bbox;
  for (const p of extra) { minX = Math.min(minX, p.x); maxX = Math.max(maxX, p.x); minY = Math.min(minY, p.y); maxY = Math.max(maxY, p.y); }
  minX -= pad; minY -= pad; maxX += pad; maxY += pad;
  const W = maxX - minX, H = maxY - minY;
  const u = W / width; // user units per output pixel
  const out = [];
  const L = Math.hypot(W, H) * 2;
  for (const l of layers) {
    switch (l.type) {
      case 'polygon':
        out.push(`<path d="${d(P.pts, true)}" fill="${l.fill || '#f1f5f9'}" stroke="#1f2937" stroke-width="${(l.width || 1.6) * u}" stroke-linejoin="round"/>`);
        if (l.vertices !== false) P.pts.forEach((p, i) => {
          const refl = P.isReflex(i);
          out.push(`<circle cx="${p.x}" cy="${-p.y}" r="${(refl ? 2.8 : 2.1) * u}" fill="${refl ? '#fff' : '#1f2937'}" stroke="#1f2937" stroke-width="${1 * u}"/>`);
        });
        break;
      case 'poly':
        if (l.pts && l.pts.length >= 3) out.push(`<path d="${d(l.pts, true)}" fill="${l.fill || 'none'}" stroke="${l.stroke || 'none'}" stroke-width="${(l.width || 1) * u}" ${l.dash ? `stroke-dasharray="${l.dash.split(' ').map((x) => x * u).join(' ')}"` : ''}/>`);
        break;
      case 'polyline':
        if (l.pts && l.pts.length >= 2) out.push(`<path d="${d(l.pts, false)}" fill="none" stroke="${l.stroke || '#000'}" stroke-width="${(l.width || 1.5) * u}" stroke-linecap="round" stroke-linejoin="round" ${l.dash ? `stroke-dasharray="${l.dash.split(' ').map((x) => x * u).join(' ')}"` : ''} ${l.opacity ? `stroke-opacity="${l.opacity}"` : ''}/>`);
        break;
      case 'chain': {
        const pts = chainPoints(P, l.a, Math.max(l.a, l.b));
        out.push(`<path d="${d(pts, false)}" fill="none" stroke="${l.color || '#2563eb'}" stroke-width="${(l.width || 5) * u}" stroke-linecap="round" stroke-linejoin="round" ${l.opacity ? `stroke-opacity="${l.opacity}"` : ''} ${l.dash ? `stroke-dasharray="${l.dash.split(' ').map((x) => x * u).join(' ')}"` : ''}/>`);
        break;
      }
      case 'seg':
        out.push(`<line x1="${l.a.x}" y1="${-l.a.y}" x2="${l.b.x}" y2="${-l.b.y}" stroke="${l.stroke || '#334155'}" stroke-width="${(l.width || 1.2) * u}" ${l.dash ? `stroke-dasharray="${l.dash.split(' ').map((x) => x * u).join(' ')}"` : ''} stroke-linecap="round"/>`);
        break;
      case 'line': {
        const n = Math.hypot(l.dir.x, l.dir.y) || 1;
        const a = { x: l.p.x - (l.dir.x / n) * L, y: l.p.y - (l.dir.y / n) * L };
        const b = { x: l.p.x + (l.dir.x / n) * L, y: l.p.y + (l.dir.y / n) * L };
        out.push(`<line x1="${a.x}" y1="${-a.y}" x2="${b.x}" y2="${-b.y}" stroke="${l.stroke || '#94a3b8'}" stroke-width="${(l.width || 0.8) * u}" stroke-dasharray="${(l.dash || '5 4').split(' ').map((x) => x * u).join(' ')}"/>`);
        break;
      }
      case 'dot':
        out.push(`<circle cx="${l.p.x}" cy="${-l.p.y}" r="${(l.r || 4) * u}" fill="${l.fill || '#111'}" stroke="${l.stroke || '#fff'}" stroke-width="${1.2 * u}"/>`);
        if (l.label) out.push(label(l.p, l.label, l.dx ?? 7, l.dy ?? 9, u, l.size));
        break;
      case 'label':
        out.push(label(l.p, l.text, l.dx ?? 0, l.dy ?? 0, u, l.size, l.color));
        break;
      case 'arc': {
        const R = (l.radius || 22) * u;
        const a0 = Math.atan2(l.a.y - l.g.y, l.a.x - l.g.x);
        let sw = Math.atan2(l.b.y - l.g.y, l.b.x - l.g.x) - a0;
        while (sw < 0) sw += 2 * Math.PI;
        const pts = [l.g];
        for (let i = 0; i <= 40; i++) pts.push({ x: l.g.x + R * Math.cos(a0 + (sw * i) / 40), y: l.g.y + R * Math.sin(a0 + (sw * i) / 40) });
        out.push(`<path d="${d(pts, true)}" fill="${l.fill || 'rgba(234,88,12,0.18)'}" stroke="${l.color || '#ea580c'}" stroke-width="${1.2 * u}"/>`);
        break;
      }
      case 'star': {
        const pts = [];
        for (let i = 0; i < 10; i++) { const r = (i % 2 ? 4 : 9) * u; const a = Math.PI / 2 + (i * Math.PI) / 5; pts.push({ x: l.p.x + r * Math.cos(a), y: l.p.y + r * Math.sin(a) }); }
        out.push(`<path d="${d(pts, true)}" fill="#facc15" stroke="#854d0e" stroke-width="${1 * u}"/>`);
        if (l.label) out.push(label(l.p, l.label, 9, 10, u));
        break;
      }
      default:
        break;
    }
  }
  const h = Math.round((width * H) / W);
  return `<svg xmlns="http://www.w3.org/2000/svg" viewBox="${minX} ${-maxY} ${W} ${H}" width="${width}" height="${h}" style="max-width:100%;height:auto" role="img"${title ? ` aria-label="${esc(title)}"` : ''}><clipPath id="c${Math.random().toString(36).slice(2, 7)}"><rect x="${minX}" y="${-maxY}" width="${W}" height="${H}"/></clipPath>${out.join('')}</svg>`;
}

function label(p, text, dx, dy, u, size = 12, color = '#111827') {
  return `<text x="${p.x + dx * u}" y="${-p.y - dy * u}" font-size="${size * u}" font-family="Georgia, serif" font-style="italic" font-weight="600" fill="${color}" stroke="#fff" stroke-width="${2.5 * u}" paint-order="stroke">${esc(text)}</text>`;
}
