// The algorithm of de Berg, Conradi, van der Hoog and Staals,
// "Simpler and Faster Contiguous Art Gallery" (arXiv:2508.09734).
//
//   1. If the kernel of P is non-empty, one guard suffices (Observation 2.2).
//   2. Compute the vertices of the arrangement C_P of the supporting lines,
//      the candidate guards G_P (Definition 5.1) and the start points U_P
//      (Definition 5.2).
//   3. For every u in U_P run the greedy algorithm, where one greedy step
//      next(u) = max { v : some guard sees [u, v] } is computed as in
//      Lemma 6.8: the best candidate chain of G_P containing u (good guards),
//      and, for bad guards, the first/last point of the line l_u inside the
//      visibility core P_E (Lemma 4.9).
//   4. Return the smallest solution found (Theorem 7.1).
//
// We replace the polylogarithmic data structures of the paper by simple
// polynomial-time routines (visibility graph shortest paths, explicit
// visibility computations), which is fast enough for a few dozen vertices.

import { sub, dist, ccwAngle, add, mul, len } from './vec.js';
import { mod } from './polygon.js';
import { visibleChains, chainThrough, seesChain } from './visibility.js';
import { bigBox, clipLeft, coreOfEdges, kernel, lineThroughConvex, edgesOfChain } from './core.js';
import { ShortestPaths, isLeftTurning } from './shortestPath.js';
import { arrangementVertices } from './arrangement.js';

const key = (p) => `${p.x.toFixed(7)},${p.y.toFixed(7)}`;

export class Solver {
  constructor(P) {
    this.P = P;
    this.n = P.n;
    this._vis = new Map();
    this._next = new Map();
    this._sp = null;
    this._arr = null;
    this._GP = null;
    this._UP = null;
    this.stats = { visCalls: 0, nextCalls: 0 };
  }

  get sp() {
    if (!this._sp) this._sp = new ShortestPaths(this.P);
    return this._sp;
  }

  /** Cached visibility (maximal visible chains) of a point. */
  vis(g) {
    const k = key(g);
    let v = this._vis.get(k);
    if (!v) {
      v = visibleChains(this.P, g);
      this.stats.visCalls++;
      this._vis.set(k, v);
    }
    return v;
  }

  /** Kernel of P (empty array when P is not star-shaped). */
  kernel() {
    if (!this._kernel) this._kernel = kernel(this.P);
    return this._kernel;
  }

  isStarShaped() {
    const K = this.kernel();
    return K.length >= 1 && K.every((p) => !p.artificial);
  }

  arrangement() {
    if (!this._arr) this._arr = arrangementVertices(this.P);
    return this._arr;
  }

  /** Candidate guard set G_P of Definition 5.1. */
  candidateGuards() {
    if (this._GP) return this._GP;
    const n = this.n;
    const out = [];
    const seen = new Set();
    for (const c of this.arrangement()) {
      const xs = new Set();
      for (const e of c.edges) { xs.add(mod(e, n)); xs.add(mod(e + 1, n)); }
      const V = this.vis(c.p);
      for (const x of xs) {
        const ch = chainThrough(V, x, n);
        if (!ch) continue;
        let a = ch.a, b = ch.b;
        const s = Math.floor(a / n) * n;
        a -= s; b -= s;
        const k = `${key(c.p)}|${a.toFixed(7)}|${b.toFixed(7)}`;
        if (seen.has(k)) continue;
        seen.add(k);
        out.push({ g: c.p, a, b, x, edges: c.edges, vertexOfP: c.vertexOfP, full: !!ch.full });
      }
    }
    this._GP = out;
    return out;
  }

  /** Start points U_P of Definition 5.2 (sorted, deduplicated). */
  startPoints() {
    if (this._UP) return this._UP;
    const n = this.n;
    const raw = [];
    for (let i = 0; i < n; i++) raw.push({ u: i, from: 'vertex' });
    for (const G of this.candidateGuards()) raw.push({ u: mod(G.a, n), from: 'candidate', guard: G });
    raw.sort((x, y) => x.u - y.u);
    const out = [];
    for (const r of raw) {
      if (out.length && Math.abs(out[out.length - 1].u - r.u) < 1e-9) continue;
      if (r.u > n - 1e-9) continue;
      out.push(r);
    }
    this._UP = out;
    return out;
  }

  /** Best candidate (good-guard) chain containing u: part one of Lemma 6.8. */
  nextGood(u) {
    const n = this.n;
    let best = null;
    for (const G of this.candidateGuards()) {
      let v = null;
      if (G.full) v = u + n;
      else if (G.a - 1e-9 <= u && u <= G.b + 1e-9) v = G.b;
      else if (G.a - 1e-9 <= u + n && u + n <= G.b + 1e-9) v = G.b - n;
      if (v === null) continue;
      if (!best || v > best.v) best = { v, g: G.g, kind: 'good', source: G };
    }
    return best;
  }

  /**
   * Bad-guard part of Lemma 6.8 (u in [0, n)). For every edge e_j beyond the
   * current best value: compute the shortest path from u to the endpoints of
   * e_j; if it is left turning, let l_u be the line through its first edge,
   * intersect l_u with the visibility core P_E of the edges from u to e_j and
   * test the first and the last point of l_u in P_E (Lemma 4.9).
   * When `trace` is an array, a record of every edge that was examined is pushed.
   */
  nextBad(u, vBest, trace = null) {
    const P = this.P, n = this.n;
    const eu = Math.floor(u + 1e-12) % n;
    const pu = P.at(u);
    const visU = this.sp.visFrom(pu);
    const box = bigBox(P);
    let core = box;
    let best = null;
    for (let s = 0; s < n; s++) {
      const j = (eu + s) % n;
      const [a, b] = P.edge(j);
      core = clipLeft(core, a, b, j);
      const endParam = eu + s + 1; // unrolled parameter of the end of e_j
      const rec = trace ? { j, endParam, core: core.slice(), attempts: [] } : null;
      if (core.length < 3) {
        if (rec) { rec.emptyCore = true; trace.push(rec); }
        break; // Observation 2.1: nobody sees beyond the start of e_j
      }
      if (endParam <= vBest + 1e-9 && !trace) continue;
      for (const w of [(j + 1) % n, j]) {
        const path = this.sp.pathToVertex(pu, w, visU);
        if (!path || path.pts.length < 2) continue;
        const left = isLeftTurning(path.pts);
        const att = rec ? { w, path: path.pts, left, points: [] } : null;
        if (rec) rec.attempts.push(att);
        if (!left) continue;
        const dir = sub(path.pts[1], pu);
        if (len(dir) < 1e-9) continue;
        const iv = lineThroughConvex(core, pu, dir);
        if (!iv) continue;
        if (att) att.line = { p: pu, dir, iv };
        for (const sv of iv) {
          if (!Number.isFinite(sv)) continue;
          const g = add(pu, mul(dir, sv));
          if (!P.contains(g)) { if (att) att.points.push({ g, ok: false, why: 'outside P' }); continue; }
          if (!P.segInside(g, pu)) { if (att) att.points.push({ g, ok: false, why: 'does not see u' }); continue; }
          const ch = chainThrough(this.vis(g), u, n);
          if (!ch) continue;
          if (att) att.points.push({ g, ok: true, v: ch.b });
          if ((!best || ch.b > best.v) && ch.b > vBest - 1e-12) {
            best = { v: ch.b, g, kind: 'bad', edge: j, line: { p: pu, dir } };
          }
        }
      }
      if (rec) trace.push(rec);
    }
    return best;
  }

  /** next(u): the farthest v such that some guard sees [u, v]. */
  next(t) {
    const n = this.n;
    const u = mod(t, n);
    const shift = t - u;
    const k = u.toFixed(9);
    let r = this._next.get(k);
    if (!r) {
      this.stats.nextCalls++;
      const good = this.nextGood(u);
      const bad = this.nextBad(u, good ? good.v : u);
      r = good;
      if (bad && (!good || bad.v > good.v + 1e-9)) r = bad;
      if (!r) r = { v: u, g: P_at(this.P, u), kind: 'none' };
      this._next.set(k, r);
    }
    return { ...r, v: r.v + shift };
  }

  /** Greedy algorithm from u. Stops after `limit` guards if not finished. */
  greedy(u0, limit = Infinity) {
    const n = this.n;
    const guards = [];
    let t = u0;
    for (;;) {
      if (guards.length >= limit) return { u: u0, guards, complete: false };
      const r = this.next(t);
      const end = Math.min(r.v, u0 + n);
      guards.push({ g: r.g, a: t, b: end, kind: r.kind, reach: r.v });
      if (r.v >= u0 + n - 1e-7) return { u: u0, guards, complete: true };
      if (r.v <= t + 1e-9) return { u: u0, guards, complete: false, stuck: true };
      t = r.v;
    }
  }

  /**
   * Full algorithm (Theorem 7.1). Options:
   *   exhaustive: run the greedy from every start point (otherwise stop early
   *               once the lower bound (first size - 1) is reached).
   *   onProgress(i, total)
   */
  solve({ exhaustive = false, onProgress = null } = {}) {
    const n = this.n;
    // The whole method assumes a simple polygon (one boundary cycle, no self-crossing, no holes):
    // with holes the boundary is not a single cycle and the proofs of [5] do not apply.
    if (!this.P.isSimple()) throw new Error('The contiguous art gallery algorithm requires a simple polygon.');
    const t0 = Date.now();
    if (this.isStarShaped()) {
      const K = this.kernel();
      const c = K.reduce((acc, p) => ({ x: acc.x + p.x / K.length, y: acc.y + p.y / K.length }), { x: 0, y: 0 });
      return {
        k: 1, starShaped: true, guards: [{ g: c, a: 0, b: n, kind: 'kernel' }],
        runs: [], startPoints: [], time: Date.now() - t0,
      };
    }
    const starts = this.startPoints();
    const runs = [];
    let best = null;
    let lower = 1;
    for (let i = 0; i < starts.length; i++) {
      const u = starts[i].u;
      const limit = !exhaustive && best ? best.guards.length - 1 : Infinity;
      const r = this.greedy(u, limit);
      runs.push({ u, size: r.complete ? r.guards.length : null, atLeast: r.complete ? null : r.guards.length + 1, from: starts[i].from });
      if (r.complete && (!best || r.guards.length < best.guards.length)) {
        best = r;
        if (runs.length === 1) lower = Math.max(1, r.guards.length - 1);
      }
      if (onProgress) onProgress(i + 1, starts.length);
      if (!exhaustive && best && best.guards.length <= lower && runs.length > 1) break;
      if (!exhaustive && best && best.guards.length === 2) break; // k >= 2 here
    }
    return {
      k: best.guards.length,
      guards: best.guards,
      bestStart: best.u,
      runs,
      startPoints: starts,
      candidates: this.candidateGuards(),
      arrangement: this.arrangement(),
      time: Date.now() - t0,
      stats: { ...this.stats },
    };
  }
}

function P_at(P, u) { return P.at(u); }

/** Classification of Definition 4.1. */
export function classifyGuard(P, g, u, v) {
  const eps = 1e-7;
  const pu = P.at(u), pv = P.at(v);
  const I = Math.floor(u + eps) + 1 < v - eps;
  const II = dist(g, pu) > 1e-6 && dist(g, pv) > 1e-6;
  let angle = II ? ccwAngle(sub(pu, g), sub(pv, g)) : null;
  // u, g, v collinear: the plain angle is 0 or 2*pi; use the swept angle to decide
  if (II && (angle < 1e-7 || 2 * Math.PI - angle < 1e-7)) {
    const sw = sweepAngle(P, g, u, v);
    angle = sw > Math.PI ? sw : 0;
  }
  const III = II && angle > Math.PI + 1e-9;
  const IV = !P.segInside(pu, pv);
  return { I, II, III, IV, angle, bad: I && II && III && IV };
}

/**
 * The angle under which g sees the chain [u, v]: the total counter-clockwise
 * rotation of the direction from g to a point walking along the chain. When g
 * sees the chain this is the angle of the polygon P_g at g (it can be close to
 * 2*pi, where the plain angle between gu and gv would wrap around to 0).
 */
export function sweepAngle(P, g, u, v) {
  const pts = [P.at(u)];
  for (let k = Math.floor(u + 1e-9) + 1; k < v - 1e-9; k++) pts.push(P.at(k));
  pts.push(P.at(v));
  let s = 0;
  for (let i = 0; i + 1 < pts.length; i++) {
    const a = sub(pts[i], g), b = sub(pts[i + 1], g);
    s += Math.atan2(a.x * b.y - a.y * b.x, a.x * b.x + a.y * b.y);
  }
  if (s < 0 && s > -1e-9) s = 0;
  return s;
}

/** Does guard g see the whole chain [a, b]? */
export function guardSeesChain(solverOrP, g, a, b) {
  const S = solverOrP instanceof Solver ? solverOrP : new Solver(solverOrP);
  return seesChain(S.vis(g), a, b, S.n);
}

export { edgesOfChain, coreOfEdges };
