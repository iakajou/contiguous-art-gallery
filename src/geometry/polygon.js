// Simple polygon with a boundary parametrisation.
//
// Vertices v_0..v_{n-1} are stored in counter-clockwise order. Edge i goes
// from v_i to v_{i+1}. A point on the boundary is described by a real
// parameter t: floor(t) is the edge index and t - floor(t) the fraction along
// that edge. Parameters are taken modulo n, so t and t + n are the same point;
// a chain [a, b] is the counter-clockwise walk from a to b with a <= b <= a + n.

import {
  EPS, sub, dot, cross, dist, lerp, len, sideOfLine, signedArea,
  pointSegment, segmentsIntersect, lineLine,
} from './vec.js';

export const mod = (t, n) => ((t % n) + n) % n;

export class Polygon {
  constructor(points) {
    let pts = points.map((p) => ({ x: p.x, y: p.y }));
    if (signedArea(pts) < 0) pts = pts.reverse();
    this.pts = pts;
    this.n = pts.length;
    let minX = Infinity, minY = Infinity, maxX = -Infinity, maxY = -Infinity;
    for (const p of pts) {
      minX = Math.min(minX, p.x); maxX = Math.max(maxX, p.x);
      minY = Math.min(minY, p.y); maxY = Math.max(maxY, p.y);
    }
    this.bbox = { minX, minY, maxX, maxY };
    this.diam = Math.hypot(maxX - minX, maxY - minY);
  }

  v(i) { return this.pts[mod(i, this.n)]; }
  edge(i) { return [this.v(i), this.v(i + 1)]; }

  /** Point of the boundary with parameter t. */
  at(t) {
    const n = this.n;
    let tt = mod(t, n);
    let i = Math.floor(tt);
    if (i >= n) i = n - 1;
    const f = tt - i;
    return lerp(this.pts[i], this.pts[(i + 1) % n], f);
  }

  /** Edge index containing parameter t (an integer t belongs to the edge it starts). */
  edgeOf(t) { return Math.floor(mod(t, this.n) + 1e-12) % this.n; }

  isReflex(i) {
    const a = this.v(i - 1), b = this.v(i), c = this.v(i + 1);
    return sideOfLine(a, b, c) < -EPS;
  }

  reflexVertices() {
    const out = [];
    for (let i = 0; i < this.n; i++) if (this.isReflex(i)) out.push(i);
    return out;
  }

  /** Distance from p to the boundary and the closest boundary parameter. */
  closestBoundary(p) {
    let best = { d: Infinity, t: 0 };
    for (let i = 0; i < this.n; i++) {
      const [a, b] = this.edge(i);
      const r = pointSegment(p, a, b);
      if (r.d < best.d) best = { d: r.d, t: i + r.t, proj: r.proj };
    }
    if (best.t >= this.n) best.t -= this.n;
    return best;
  }

  onBoundary(p, eps = 1e-6) { return this.closestBoundary(p).d <= eps; }

  /** Strict interior test (ray casting). */
  insideStrict(p) {
    let inside = false;
    const pts = this.pts, n = this.n;
    for (let i = 0, j = n - 1; i < n; j = i++) {
      const a = pts[i], b = pts[j];
      if ((a.y > p.y) !== (b.y > p.y)) {
        const x = a.x + ((p.y - a.y) * (b.x - a.x)) / (b.y - a.y);
        if (x > p.x) inside = !inside;
      }
    }
    return inside;
  }

  /** Membership in the closed polygon (interior or boundary). */
  contains(p, eps = 1e-6) {
    if (this.onBoundary(p, eps)) return true;
    return this.insideStrict(p);
  }

  /**
   * Does the closed segment pq lie inside the closed polygon P?
   * (This is the visibility predicate: p sees q.)
   * Touching the boundary, sliding along edges and grazing reflex vertices
   * are all allowed, exactly as in the definition "pq is contained in P".
   */
  segInside(p, q) {
    if (!this.contains(p) || !this.contains(q)) return false;
    const d = sub(q, p);
    const L2 = dot(d, d);
    if (L2 < 1e-18) return true;
    const L = Math.sqrt(L2);
    const ts = [0, 1];
    const n = this.n, pts = this.pts;
    for (let i = 0; i < n; i++) {
      const a = pts[i], b = pts[(i + 1) % n];
      const sa = cross(d, sub(a, p)) / L;
      const sb = cross(d, sub(b, p)) / L;
      if (Math.abs(sa) <= EPS) {
        const ta = dot(sub(a, p), d) / L2;
        if (ta > 0 && ta < 1) ts.push(ta);
      }
      if (Math.abs(sb) <= EPS) {
        const tb = dot(sub(b, p), d) / L2;
        if (tb > 0 && tb < 1) ts.push(tb);
      }
      if ((sa > EPS && sb < -EPS) || (sa < -EPS && sb > EPS)) {
        const sp = sideOfLine(a, b, p);
        const sq = sideOfLine(a, b, q);
        if ((sp > EPS && sq < -EPS) || (sp < -EPS && sq > EPS)) return false; // proper crossing
        const x = lerp(a, b, sa / (sa - sb));
        const tx = dot(sub(x, p), d) / L2;
        if (tx > 0 && tx < 1) ts.push(tx);
      }
    }
    ts.sort((x, y) => x - y);
    for (let k = 0; k + 1 < ts.length; k++) {
      if (ts[k + 1] - ts[k] < 1e-12) continue;
      const m = lerp(p, q, (ts[k] + ts[k + 1]) / 2);
      if (!this.contains(m)) return false;
    }
    return true;
  }

  sees(p, q) { return this.segInside(p, q); }

  /**
   * First boundary point hit by the ray from o in direction dir, ignoring
   * hits closer than minS (in units of |dir|). Returns {s, t, p} or null.
   */
  rayHit(o, dir, minS = 1e-9) {
    let best = null;
    for (let i = 0; i < this.n; i++) {
      const [a, b] = this.edge(i);
      const r = lineLine(o, dir, a, sub(b, a));
      if (!r) continue;
      if (r.t <= minS) continue;
      if (r.u < -1e-12 || r.u > 1 + 1e-12) continue;
      if (!best || r.t < best.s) {
        const u = Math.min(1, Math.max(0, r.u));
        best = { s: r.t, t: i + u, p: lerp(a, b, u), edge: i };
      }
    }
    if (best && best.t >= this.n) best.t -= this.n;
    return best;
  }

  /** All boundary hits of the ray o + s*dir (s > minS), sorted by s. */
  rayHits(o, dir, minS = 1e-9) {
    const out = [];
    for (let i = 0; i < this.n; i++) {
      const [a, b] = this.edge(i);
      const r = lineLine(o, dir, a, sub(b, a));
      if (!r) continue;
      if (r.t <= minS) continue;
      if (r.u < -1e-12 || r.u > 1 + 1e-12) continue;
      const u = Math.min(1, Math.max(0, r.u));
      let t = i + u;
      if (t >= this.n) t -= this.n;
      out.push({ s: r.t, t, p: lerp(a, b, u), edge: i });
    }
    out.sort((x, y) => x.s - y.s);
    return out;
  }

  /** Is the polygon simple (no two non-adjacent edges intersect)? */
  isSimple() {
    const n = this.n;
    if (n < 3) return false;
    for (let i = 0; i < n; i++) {
      const [a, b] = this.edge(i);
      if (dist(a, b) < 1e-6) return false;
      for (let j = i + 1; j < n; j++) {
        if (j === i + 1 || (i === 0 && j === n - 1)) continue;
        const [c, d] = this.edge(j);
        if (segmentsIntersect(a, b, c, d, 1e-9)) return false;
      }
    }
    return true;
  }

  perimeterLength() {
    let s = 0;
    for (let i = 0; i < this.n; i++) s += dist(this.v(i), this.v(i + 1));
    return s;
  }

  area() { return signedArea(this.pts); }

  /** Arc length position (from v_0) of boundary parameter t; handy for 1D plots. */
  arcLength(t) {
    const n = this.n;
    const k = Math.floor(t / n);
    let tt = t - k * n;
    let s = 0;
    const i = Math.min(n - 1, Math.floor(tt));
    for (let j = 0; j < i; j++) s += dist(this.v(j), this.v(j + 1));
    s += (tt - i) * dist(this.v(i), this.v(i + 1));
    return s + k * this.perimeterLength();
  }

  toJSON() { return this.pts.map((p) => [round(p.x), round(p.y)]); }
}

const round = (x) => Math.round(x * 1000) / 1000;

export function polygonFromArray(arr) {
  return new Polygon(arr.map(([x, y]) => ({ x, y })));
}

/** Length of the CCW chain [a, b] measured in parameter units. */
export const chainLength = (a, b) => b - a;

/** Is parameter t inside the (unrolled) chain [a, b]? Handles wrap-around. */
export function inChain(t, a, b, n, eps = 1e-9) {
  if (b - a >= n - eps) return true;
  const tt = a + mod(t - a, n);
  if (tt <= b + eps) return true;
  // t numerically equal to a from the other side
  return Math.abs(mod(t - a, n) - n) <= eps;
}

/** Offset of t after a along the boundary, in (-eps, n - eps] (robust to round-off). */
export function relFrom(t, a, n, eps = 1e-7) {
  let r = mod(t - a, n);
  if (r > n - eps) r -= n;
  return r;
}

/** Position of t relative to a: the representative of t in [a, a + n). */
export const unrollFrom = (t, a, n) => a + mod(t - a, n);

export { len };
