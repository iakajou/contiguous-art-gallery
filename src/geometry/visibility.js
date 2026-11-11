// Visibility from a point g inside a simple polygon P.
//
// visibleChains(P, g) returns the maximal chains of the boundary that g sees.
// We use the classical observation that, along the boundary, visibility from
// g can only change at a vertex of P or at a point hit by a ray from g through
// a vertex of P. Between two consecutive such critical points visibility is
// constant, so testing one midpoint per elementary interval is exact.

import { sub, len, dist, mul, add } from './vec.js';
import { mod, inChain, unrollFrom } from './polygon.js';

export function visibleStructure(P, g) {
  const n = P.n;
  const crit = [];
  for (let i = 0; i < n; i++) crit.push(i);
  for (let i = 0; i < n; i++) {
    const w = P.v(i);
    const dir = sub(w, g);
    if (len(dir) < 1e-9) continue;
    for (const h of P.rayHits(g, dir, 1e-9)) crit.push(h.t);
  }
  const cb = P.closestBoundary(g);
  if (cb.d < 1e-6) crit.push(cb.t);
  const sorted = crit.map((t) => mod(t, n)).sort((a, b) => a - b);
  const C = [];
  for (const t of sorted) if (!C.length || t - C[C.length - 1] > 1e-9) C.push(t);
  if (C.length > 1 && C[0] + n - C[C.length - 1] <= 1e-9) C.pop();
  const m = C.length;
  const ptVis = C.map((t) => P.segInside(g, P.at(t)));
  const gapVis = C.map((t, k) => {
    const t2 = k + 1 < m ? C[k + 1] : C[0] + n;
    return P.segInside(g, P.at((t + t2) / 2));
  });
  // The visible set is closed: endpoints of visible gaps are visible.
  for (let k = 0; k < m; k++) {
    if (gapVis[k]) { ptVis[k] = true; ptVis[(k + 1) % m] = true; }
  }
  return { g, C, ptVis, gapVis, n };
}

/**
 * Maximal visible chains of g. Returns {full, chains: [{a, b}]} where each
 * chain is closed, a in [0, n) and a <= b <= a + n.
 */
export function visibleChains(P, g) {
  const S = visibleStructure(P, g);
  const { C, ptVis, gapVis, n } = S;
  const m = C.length;
  const E = 2 * m;
  const vis = (e) => (e % 2 === 0 ? ptVis[e / 2] : gapVis[(e - 1) / 2]);
  const range = (e) => {
    if (e % 2 === 0) return [C[e / 2], C[e / 2]];
    const k = (e - 1) / 2;
    return [C[k], k + 1 < m ? C[k + 1] : C[0] + n];
  };
  let start = -1;
  for (let e = 0; e < E; e++) if (!vis(e)) { start = e; break; }
  if (start < 0) return { full: true, chains: [{ a: 0, b: n }], structure: S };
  const chains = [];
  let cur = null;
  for (let s = 1; s <= E; s++) {
    const idx = start + s;
    const e = idx % E;
    const off = idx >= E ? n : 0;
    if (vis(e)) {
      const [lo, hi] = range(e);
      if (!cur) cur = { a: lo + off, b: hi + off };
      else cur.b = hi + off;
    } else if (cur) {
      chains.push(cur);
      cur = null;
    }
  }
  if (cur) chains.push(cur);
  for (const c of chains) {
    const k = Math.floor(c.a / n);
    c.a -= k * n; c.b -= k * n;
    if (c.a >= n - 1e-12) { c.a -= n; c.b -= n; }
  }
  chains.sort((x, y) => x.a - y.a);
  return { full: false, chains, structure: S };
}

/**
 * The unique maximal chain seen by g that contains boundary parameter t.
 * Returns {a, b} with a <= t <= b (in the same unrolled frame as t), or null
 * when g does not see the point P.at(t).
 */
export function chainThrough(vis, t, n, eps = 1e-7) {
  if (vis.full) return { a: t, b: t + n, full: true };
  for (const c of vis.chains) {
    if (inChain(t, c.a, c.b, n, eps)) {
      let tt = unrollFrom(t, c.a, n);
      if (tt > c.b + eps && Math.abs(tt - n - c.a) <= eps) tt -= n;
      const shift = t - tt;
      return { a: c.a + shift, b: c.b + shift };
    }
  }
  return null;
}

/** Does g see every point of the chain [a, b]? */
export function seesChain(vis, a, b, n, eps = 1e-7) {
  if (vis.full) return true;
  if (b - a < eps) return vis.chains.some((c) => inChain(a, c.a, c.b, n, eps));
  for (const c of vis.chains) {
    if (!inChain(a, c.a, c.b, n, eps)) continue;
    let rel = mod(a - c.a, n);
    if (rel > n - eps) rel -= n; // a is (numerically) just before c.a
    if (rel + (b - a) <= c.b - c.a + eps) return true;
  }
  return false;
}

/** Parts of chain [a, b] NOT seen by g, as a list of sub-chains (for drawing). */
export function unseenParts(vis, a, b, n) {
  if (vis.full) return [];
  // walk the elementary intervals of the structure
  const out = [];
  const S = vis.structure;
  const C = S.C, m = C.length;
  // sample-based but exact w.r.t. elementary intervals
  const pieces = [];
  for (let k = 0; k < m; k++) {
    const lo = C[k];
    const hi = k + 1 < m ? C[k + 1] : C[0] + n;
    pieces.push({ lo, hi, vis: S.gapVis[k] });
  }
  const len = b - a;
  for (const p of pieces) {
    for (const off of [-n, 0, n, 2 * n]) {
      const lo = Math.max(p.lo + off, a);
      const hi = Math.min(p.hi + off, a + len);
      if (hi - lo > 1e-9 && !p.vis) out.push({ a: lo, b: hi });
    }
  }
  out.sort((x, y) => x.a - y.a);
  const merged = [];
  for (const c of out) {
    if (merged.length && c.a <= merged[merged.length - 1].b + 1e-9) {
      merged[merged.length - 1].b = Math.max(merged[merged.length - 1].b, c.b);
    } else merged.push({ ...c });
  }
  return merged;
}

/** Move a point that lies on the boundary slightly into the interior (for drawing). */
export function nudgeInside(P, g) {
  if (!P.onBoundary(g, 1e-6) && P.insideStrict(g)) return g;
  for (const r of [1e-3, 1e-2, 0.1, 0.5, 1, 2]) {
    for (let k = 0; k < 32; k++) {
      const a = (2 * Math.PI * k) / 32 + 0.01;
      const q = { x: g.x + r * Math.cos(a), y: g.y + r * Math.sin(a) };
      if (P.insideStrict(q) && !P.onBoundary(q, r / 4) && P.segInside(g, q)) return q;
    }
  }
  return g;
}

/** Visibility polygon of g (for drawing). */
export function visibilityPolygon(P, g0) {
  const g = nudgeInside(P, g0);
  const angles = [];
  for (let i = 0; i < P.n; i++) {
    const w = P.v(i);
    if (dist(w, g) < 1e-9) continue;
    const a = Math.atan2(w.y - g.y, w.x - g.x);
    angles.push(a - 1e-5, a, a + 1e-5);
  }
  angles.sort((x, y) => x - y);
  const out = [];
  for (const a of angles) {
    const dir = { x: Math.cos(a), y: Math.sin(a) };
    const h = P.rayHit(g, dir, 1e-9);
    if (h) out.push(h.p);
  }
  return out;
}

/** Sample points along the chain [a, b] (including vertices), for drawing. */
export function chainPoints(P, a, b) {
  const pts = [P.at(a)];
  let k = Math.floor(a) + 1;
  while (k < b - 1e-12) {
    pts.push(P.at(k));
    k++;
  }
  pts.push(P.at(b));
  return pts;
}

export { add, mul };
