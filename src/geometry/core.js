// Visibility cores: intersections of the closed half-planes lying left of
// directed edges of P. Implemented with Sutherland-Hodgman clipping of a
// large bounding square, so unbounded cores become (large) bounded polygons.
// Vertices created by the artificial square are flagged with `artificial`.

import { sub, cross, lerp, dot, sideOfLine, dist } from './vec.js';

export function bigBox(P, factor = 30) {
  const { minX, minY, maxX, maxY } = P.bbox;
  const cx = (minX + maxX) / 2, cy = (minY + maxY) / 2;
  const r = Math.max(maxX - minX, maxY - minY) * factor + 100;
  return [
    { x: cx - r, y: cy - r, artificial: true },
    { x: cx + r, y: cy - r, artificial: true },
    { x: cx + r, y: cy + r, artificial: true },
    { x: cx - r, y: cy + r, artificial: true },
  ];
}

/** Keep the part of convex polygon `poly` on the left of (or on) the line a->b. */
export function clipLeft(poly, a, b, tag = null) {
  const out = [];
  const m = poly.length;
  if (!m) return out;
  const s = poly.map((p) => sideOfLine(a, b, p));
  for (let i = 0; i < m; i++) {
    const p = poly[i], q = poly[(i + 1) % m];
    const sp = s[i], sq = s[(i + 1) % m];
    if (sp >= -1e-9) out.push(p);
    if ((sp > 1e-9 && sq < -1e-9) || (sp < -1e-9 && sq > 1e-9)) {
      const x = lerp(p, q, sp / (sp - sq));
      out.push(x);
    }
  }
  // remove consecutive duplicates
  const res = [];
  for (const p of out) {
    if (!res.length || dist(res[res.length - 1], p) > 1e-9) res.push(p);
  }
  if (res.length > 1 && dist(res[0], res[res.length - 1]) <= 1e-9) res.pop();
  return res;
}

/** Visibility core of a list of edge indices of P. */
export function coreOfEdges(P, edgeIdx, box = null) {
  const B = box || bigBox(P);
  let poly = B;
  for (const i of edgeIdx) {
    const [a, b] = P.edge(i);
    poly = clipLeft(poly, a, b, i);
    if (!poly.length) break;
  }
  return markArtificial(poly, B);
}

/** Flag vertices lying on the artificial bounding square (they are "at infinity"). */
export function markArtificial(poly, B) {
  const minX = B[0].x, minY = B[0].y, maxX = B[2].x, maxY = B[2].y;
  const tol = (maxX - minX) * 1e-9;
  return poly.map((p) => ({
    x: p.x, y: p.y,
    artificial: Math.abs(p.x - minX) < tol || Math.abs(p.x - maxX) < tol ||
      Math.abs(p.y - minY) < tol || Math.abs(p.y - maxY) < tol,
  }));
}

/** Edge indices of the chain [a, b] (the edges intersected by the open chain (a, b)). */
export function edgesOfChain(P, a, b) {
  const n = P.n;
  const out = [];
  if (b - a >= n - 1e-9) {
    for (let i = 0; i < n; i++) out.push(i);
    return out;
  }
  const first = Math.floor(a + 1e-12);
  let last = Math.ceil(b - 1e-12) - 1;
  if (last < first) last = first;
  for (let k = first; k <= last; k++) out.push(((k % n) + n) % n);
  return out;
}

/** Kernel of P = visibility core of all edges (empty iff P is not star-shaped). */
export function kernel(P) {
  const all = [];
  for (let i = 0; i < P.n; i++) all.push(i);
  return coreOfEdges(P, all);
}

/**
 * Intersection of the line p + s*dir with a convex polygon.
 * Returns [sMin, sMax] or null.
 */
export function lineThroughConvex(poly, p, dir) {
  let lo = -Infinity, hi = Infinity;
  const m = poly.length;
  if (m < 3) return null;
  for (let i = 0; i < m; i++) {
    const a = poly[i], b = poly[(i + 1) % m];
    // inside = left of a->b (poly is CCW)
    const e = sub(b, a);
    const num = cross(e, sub(p, a)); // >= 0 inside at s = 0
    const den = cross(e, dir);       // change per unit s
    if (Math.abs(den) < 1e-14) {
      if (num < -1e-9 * Math.hypot(e.x, e.y)) return null;
      continue;
    }
    const s0 = -num / den;
    if (den > 0) lo = Math.max(lo, s0);
    else hi = Math.min(hi, s0);
  }
  if (lo > hi + 1e-12) return null;
  return [lo, hi];
}

export function pointInConvex(poly, p, eps = 1e-7) {
  const m = poly.length;
  if (m < 3) return false;
  for (let i = 0; i < m; i++) {
    if (sideOfLine(poly[i], poly[(i + 1) % m], p) < -eps) return false;
  }
  return true;
}

export { dot };
