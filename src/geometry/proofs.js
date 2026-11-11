// Constructions that appear inside the proofs of the paper. They are used by
// the interactive figures, so they return every intermediate object.

import { sub, dist, ccwAngle, add, mul, sideOfLine, pointSegment } from './vec.js';
import { Polygon, mod, relFrom } from './polygon.js';
import { chainThrough, seesChain, chainPoints } from './visibility.js';
import { coreOfEdges, edgesOfChain, clipLeft, lineThroughConvex, pointInConvex, bigBox, markArtificial } from './core.js';
import { classifyGuard } from './solver.js';

/** Vertices of P strictly inside the chain (u, v) (unrolled parameters). */
export function verticesIn(u, v, eps = 1e-9) {
  const out = [];
  for (let k = Math.floor(u + eps) + 1; k < v - eps; k++) out.push(k);
  return out;
}

/** The polygon P_g bounded by g->u, the chain [u, v] and v->g. */
export function polygonPg(P, g, u, v) {
  const pts = chainPoints(P, u, v);
  if (dist(g, pts[0]) > 1e-6 && dist(g, pts[pts.length - 1]) > 1e-6) pts.unshift(g);
  return pts;
}

function containsLoose(pts, p) {
  if (pts.length < 3) return false;
  const Q = new Polygon(pts);
  return Q.contains(p, 1e-5);
}

/** Edges of E whose supporting lines pass through c (the "defining" edges). */
export function definingEdges(P, edges, c, eps = 1e-5) {
  return edges.filter((i) => {
    const [a, b] = P.edge(i);
    return Math.abs(sideOfLine(a, b, c)) < eps;
  });
}

/**
 * Proposition 4.3 and Lemmas 4.2, 4.4, 4.5, 4.6: given a good guard (g, [u, v]),
 * find a vertex c of the arrangement that also sees [u, v].
 */
export function replaceGoodGuard(P, S, g, u, v) {
  const n = P.n;
  const cls = classifyGuard(P, g, u, v);
  const E = edgesOfChain(P, u, v);
  const PE = coreOfEdges(P, E);
  const Pg = polygonPg(P, g, u, v);
  let lemma;
  if (!cls.I) lemma = '4.2';
  else if (!cls.II) lemma = '4.4';
  else if (!cls.III) lemma = '4.5';
  else if (!cls.IV) lemma = '4.6';
  else lemma = 'bad';
  const candidates = [];
  if (lemma === '4.2') {
    const e = Math.floor(u + 1e-9) % n;
    for (const k of [e, e + 1]) {
      const c = P.v(k);
      candidates.push({ p: c, type: 'endpoint of the edge', sees: seesChain(S.vis(c), u, v, n), lines: [] });
    }
  } else {
    for (const c of PE) {
      if (c.artificial) continue;
      if (!containsLoose(Pg, c)) continue;
      candidates.push({ p: c, type: 'vertex of P_E inside P_g', sees: seesChain(S.vis(c), u, v, n), lines: definingEdges(P, E, c) });
    }
    for (const k of verticesIn(u - 1e-9, v + 1e-9)) {
      const c = P.v(k);
      if (!pointInConvex(PE, c, 1e-6)) continue;
      candidates.push({ p: c, type: 'vertex of P in [u,v] inside P_E', sees: seesChain(S.vis(c), u, v, n), lines: [mod(k - 1, n), mod(k, n)], vertex: mod(k, n) });
    }
  }
  const chosen = candidates.find((c) => c.sees) || null;
  return { cls, lemma, E, PE, Pg, candidates, chosen };
}

/**
 * Lemma 4.9 for a bad guard (g, [u, v]): either a vertex of P_E or the first
 * or last point of l_u inside P_E sees [u, v].
 */
export function lemma49(P, S, g, u, v) {
  const n = P.n;
  const sp = S.sp;
  const pu = P.at(u), pv = P.at(v);
  const j = Math.ceil(v - 1e-9) - 1; // v lies on edge e_j = v_j v_{j+1}
  const wj1 = mod(j + 1, n);
  const toW = sp.pathToVertex(pu, wj1); // shortest path u -> v_{j+1}
  const Sv = sp.path(pv, pu); // shortest path v -> u
  const E = edgesOfChain(P, u, v);
  const box = bigBox(P);
  let PEraw = box;
  for (const i of E) { const [a, b] = P.edge(i); PEraw = clipLeft(PEraw, a, b); }
  const PE = markArtificial(PEraw, box);
  const res = { E, PE, toW, Sv, wj1, j };
  if (!toW || toW.pts.length < 2 || !Sv || Sv.pts.length < 2) return res;
  const lu = { p: pu, dir: sub(toW.pts[1], pu) };
  const k = Sv.pts.length;
  // the visibility core of the convex chain S_v: left of its first and last edge (directed v -> u)
  let Pp = clipLeft(PEraw, Sv.pts[0], Sv.pts[1]);
  Pp = clipLeft(Pp, Sv.pts[k - 2], Sv.pts[k - 1]);
  Pp = markArtificial(Pp, box);
  res.lu = lu;
  res.lv = { p: pv, dir: sub(Sv.pts[1], pv) };
  res.Pprime = Pp;
  res.Pv = [...chainPoints(P, u, v), ...Sv.pts.slice(1, -1)];
  const iv = lineThroughConvex(PEraw, pu, lu.dir);
  const pts = [];
  if (iv) {
    for (const s of iv) {
      if (!Number.isFinite(s)) continue;
      const q = add(pu, mul(lu.dir, s));
      pts.push({ p: q, inPprime: pointInConvex(Pp, q, 1e-5), sees: P.contains(q) && seesChain(S.vis(q), u, v, n) });
    }
  }
  res.gstar = pts;
  res.coreVertices = PE.filter((c) => !c.artificial && pointInConvex(Pp, c, 1e-5)).map((c) => ({ p: c, sees: P.contains(c) && seesChain(S.vis(c), u, v, n) }));
  return res;
}

/**
 * Lemma 6.2: the maximal chain seen by g that contains m, computed with two
 * shortest paths and two ray-shooting queries.
 */
export function maximalChainLemma62(P, S, g, m) {
  const n = P.n;
  const left = (i) => { const [a, b] = P.edge(i); return sideOfLine(a, b, g) >= -1e-7; };
  const isVertex = Math.abs(m - Math.round(m)) < 1e-7;
  let lo, hi; // edge indices (unrolled) of E_{g,m}
  if (isVertex) {
    const k = Math.round(m);
    lo = left(k - 1) ? k - 1 : k;
    hi = left(k) ? k : k - 1;
    if (!left(k - 1) && !left(k)) return null;
  } else {
    const e = Math.floor(m);
    if (!left(e)) return null;
    lo = hi = e;
  }
  while (hi - lo + 1 < n && left(lo - 1)) lo--;
  while (hi - lo + 1 < n && left(hi + 1)) hi++;
  const E = [];
  for (let i = lo; i <= hi; i++) E.push(mod(i, n));
  if (E.length >= n) return { E, full: true };
  const s = lo, t = hi + 1; // unrolled parameters of the vertices s and t
  const ps = P.at(s), pt = P.at(t);
  const piS = S.sp.path(ps, g);
  const piT = S.sp.path(pt, g);
  if (!piS || !piT) return null;
  const mm = lo + mod(m - lo, n); // m in the frame [s, t]
  // All hits of the ray from g through the last edge of pi with the chain [s, t],
  // beyond the last vertex of pi. As in the proof of Lemma 6.2, u is the hit in
  // [s, m] closest to m and v the hit in [m, t] closest to m. (When the chain
  // winds more than once around g the ray can hit [s, t] twice.)
  const shoot = (pi, side) => {
    const k = pi.pts.length;
    const through = pi.pts[k - 2]; // last vertex before g
    const dir = sub(through, g);
    const hits = [];
    for (let i = lo; i <= hi; i++) {
      const [a, b] = P.edge(i);
      const den = dir.x * (b.y - a.y) - dir.y * (b.x - a.x);
      if (Math.abs(den) < 1e-12) continue;
      const ag = sub(a, g);
      const lam = (ag.x * (b.y - a.y) - ag.y * (b.x - a.x)) / den;
      const mu = (ag.x * dir.y - ag.y * dir.x) / den;
      if (mu < -1e-9 || mu > 1 + 1e-9) continue;
      if (lam < 1 - 1e-7) continue;
      hits.push({ lam, t: i + Math.min(1, Math.max(0, mu)), p: add(g, mul(dir, lam)) });
    }
    let best = null;
    for (const h of hits) {
      if (side < 0 && h.t <= mm + 1e-9 && (!best || h.t > best.t)) best = h;
      if (side > 0 && h.t >= mm - 1e-9 && (!best || h.t < best.t)) best = h;
    }
    return { through, dir, hit: best, hits };
  };
  const rs = shoot(piS, -1);
  const rt = shoot(piT, +1);
  const u = rs.hit ? rs.hit.t : null;
  const v = rt.hit ? rt.hit.t : null;
  // reference answer computed from the visibility structure
  const ref = chainThrough(S.vis(g), m, n);
  return { E, s, t, ps, pt, piS, piT, rs, rt, u, v, ref };
}

/**
 * The proof of Theorem 5.4 as a sequence of steps, applied to a solution
 * `guards` (list of {g, a, b}).
 */
export function theorem54(P, S, guards) {
  const n = P.n;
  const steps = [];
  // 1. make every chain inclusion-wise maximal
  const G = guards.map((G0) => {
    const ch = chainThrough(S.vis(G0.g), (G0.a + G0.b) / 2, n);
    return { g: G0.g, a: ch ? ch.a : G0.a, b: ch ? ch.b : G0.b };
  });
  const cls = G.map((x) => classifyGuard(P, x.g, x.a, x.b));
  steps.push({ kind: 'maximal', guards: G, cls });
  const goodIdx = cls.findIndex((c) => !c.bad);
  const finishGood = (i, guardsNow) => {
    const x = guardsNow[i];
    const R = replaceGoodGuard(P, S, x.g, x.a, x.b);
    if (R.lemma === '4.2') {
      const e = Math.floor(x.a + 1e-9) % n;
      steps.push({ kind: 'replace-edge', index: i, guard: x, R, newGuard: { g: P.v(e), a: e, b: e + 1 }, start: e });
      return;
    }
    const c = R.chosen;
    let gp = null;
    if (c) {
      for (const cand of S.candidateGuards()) {
        if (dist(cand.g, c.p) > 1e-5) continue;
        if (seesChain(S.vis(cand.g), x.a, x.b, n) && containsChain(cand, x.a, x.b, n)) { gp = cand; break; }
      }
    }
    steps.push({ kind: 'replace-good', index: i, guard: x, R, candidate: gp, start: gp ? gp.a : null });
  };
  if (goodIdx >= 0) {
    finishGood(goodIdx, G);
    return steps;
  }
  // all guards are bad
  const x = G[0];
  const isV = (t) => Math.abs(t - Math.round(t)) < 1e-7;
  if (isV(x.a)) { steps.push({ kind: 'start-vertex', index: 0, start: x.a }); return steps; }
  if (isV(x.b)) { steps.push({ kind: 'end-vertex', index: 0, start: x.b }); return steps; }
  const pv = P.at(x.b);
  let r = null;
  for (let k = 0; k < n; k++) {
    if (!P.isReflex(k)) continue;
    const w = P.v(k);
    if (dist(w, pv) < 1e-6 || dist(w, x.g) < 1e-6) continue;
    if (pointSegment(w, pv, x.g).d < 1e-4) { if (!r || dist(w, pv) < dist(r.p, pv)) r = { k, p: w }; }
  }
  steps.push({ kind: 'lemma53', index: 0, r });
  if (!r) return steps;
  const j = G.findIndex((y, idx) => idx !== 0 && inChainU(r.k, y.a, y.b, n));
  if (j < 0) return steps;
  const y = G[j];
  // [a, b] = [u', v'] \ (u, v): the part of the chain of g' that is not seen by g
  const uu = y.a, vv = y.b, L = vv - uu, lx = x.b - x.a;
  const relA = relFrom(x.a, uu, n); // where (u, v) starts, relative to u'
  const relB = relA + lx;        // where it ends
  let a = uu, b = vv;
  if (Math.abs(relA) < 1e-7) a = uu + Math.min(lx, L);
  else if (relA < L) b = uu + relA;
  else if (relB > n) a = uu + (relB - n);
  const trimmed = { g: y.g, a, b };
  const c2 = classifyGuard(P, y.g, a, b);
  steps.push({ kind: 'trim', index: j, before: y, after: trimmed, cls: c2, r });
  const G2 = G.map((z, idx) => (idx === j ? trimmed : z));
  if (!c2.bad) finishGood(j, G2);
  return steps;
}

function inChainU(t, a, b, n) {
  return relFrom(t, a, n) <= b - a + 1e-9;
}

function containsChain(cand, a, b, n) {
  if (cand.full) return true;
  const r = relFrom(a, cand.a, n);
  return r >= -1e-7 && r + (b - a) <= cand.b - cand.a + 1e-7;
}

export { classifyGuard };
