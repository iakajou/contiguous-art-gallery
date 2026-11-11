// Random simple polygons for the game.
//
// We use the "2-opt untangling" method: take random points, connect them in a
// random order and, while two edges cross, reverse the part of the tour between
// them (this strictly shortens the tour, so the process terminates). The result
// is a random simple polygon. We then reject polygons that are numerically
// unpleasant (very sharp spikes, vertices almost touching other edges, ...).

import { Polygon } from './polygon.js';
import { sideOfLine, pointSegment, segmentsIntersect, dist, sub, ccwAngle } from './vec.js';

export function mulberry32(seed) {
  let a = seed >>> 0;
  return function rand() {
    a = (a + 0x6d2b79f5) >>> 0;
    let t = a;
    t = Math.imul(t ^ (t >>> 15), t | 1);
    t ^= t + Math.imul(t ^ (t >>> 7), t | 61);
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}

function properCross(a, b, c, d) {
  const e = 1e-9;
  const o1 = sideOfLine(a, b, c), o2 = sideOfLine(a, b, d);
  const o3 = sideOfLine(c, d, a), o4 = sideOfLine(c, d, b);
  return ((o1 > e && o2 < -e) || (o1 < -e && o2 > e)) && ((o3 > e && o4 < -e) || (o3 < -e && o4 > e));
}

function untangle(pts, rand, maxIter = 20000) {
  const n = pts.length;
  let order = pts.map((_, i) => i);
  for (let i = n - 1; i > 0; i--) {
    const j = Math.floor(rand() * (i + 1));
    [order[i], order[j]] = [order[j], order[i]];
  }
  for (let iter = 0; iter < maxIter; iter++) {
    let found = false;
    outer: for (let i = 0; i < n; i++) {
      for (let j = i + 2; j < n; j++) {
        if (i === 0 && j === n - 1) continue;
        const a = pts[order[i]], b = pts[order[(i + 1) % n]];
        const c = pts[order[j]], d = pts[order[(j + 1) % n]];
        if (properCross(a, b, c, d)) {
          // reverse order[i+1..j]
          let l = i + 1, r = j;
          while (l < r) { [order[l], order[r]] = [order[r], order[l]]; l++; r--; }
          found = true;
          break outer;
        }
      }
    }
    if (!found) return order.map((k) => pts[k]);
  }
  return null;
}

/** Quality measures: smallest angle, clearance between vertices and edges. */
export function polygonQuality(P) {
  const n = P.n;
  let minAngle = Infinity, minStraight = Infinity, clearance = Infinity;
  for (let i = 0; i < n; i++) {
    const a = P.v(i - 1), b = P.v(i), c = P.v(i + 1);
    // interior angle at b (polygon is CCW)
    const ang = ccwAngle(sub(c, b), sub(a, b));
    minAngle = Math.min(minAngle, ang, 2 * Math.PI - ang);
    minStraight = Math.min(minStraight, Math.abs(ang - Math.PI));
    for (let j = 0; j < n; j++) {
      if (j === i || (j + 1) % n === i) continue;
      const [p, q] = P.edge(j);
      clearance = Math.min(clearance, pointSegment(b, p, q).d);
    }
  }
  return { minAngle, minStraight, clearance };
}

/**
 * Random simple polygon with n vertices inside [margin, W - margin] x [margin, H - margin].
 */
export function randomPolygon(n, { W = 1000, H = 700, seed = Date.now(), minAngleDeg = 14, clearanceFrac = 0.035, tries = 400 } = {}) {
  const rand = mulberry32(seed);
  const margin = 40;
  const scale = Math.min(W, H);
  for (let t = 0; t < tries; t++) {
    const pts = [];
    let guard = 0;
    while (pts.length < n && guard++ < 10000) {
      const p = { x: margin + rand() * (W - 2 * margin), y: margin + rand() * (H - 2 * margin) };
      if (pts.every((q) => dist(p, q) > scale * 0.08)) pts.push(p);
    }
    if (pts.length < n) continue;
    const poly = untangle(pts, rand);
    if (!poly) continue;
    const P = new Polygon(poly);
    if (!P.isSimple()) continue;
    const q = polygonQuality(P);
    if (q.minAngle < (minAngleDeg * Math.PI) / 180) continue;
    if (q.minStraight < (4 * Math.PI) / 180) continue;
    if (q.clearance < clearanceFrac * scale) continue;
    return P;
  }
  return null;
}

export { segmentsIntersect };
