import { mod } from '../geometry/polygon.js';
import { solverFor } from './ui.jsx';

const guardCache = new WeakMap();

/** A "nice" interior point: sees a long part of the boundary, not too close to it. */
export function defaultGuard(P, rank = 0) {
  let list = guardCache.get(P);
  if (!list) {
    const S = solverFor(P);
    const { minX, minY, maxX, maxY } = P.bbox;
    const cand = [];
    const N = 18;
    for (let i = 1; i < N; i++) {
      for (let j = 1; j < N; j++) {
        const g = { x: minX + ((maxX - minX) * i) / N, y: minY + ((maxY - minY) * j) / N };
        if (!P.insideStrict(g)) continue;
        if (P.closestBoundary(g).d < 0.04 * P.diam) continue;
        const V = S.vis(g);
        let best = 0;
        if (V.full) best = P.n;
        else for (const c of V.chains) best = Math.max(best, P.arcLength(c.b) - P.arcLength(c.a));
        cand.push({ g, score: best });
      }
    }
    cand.sort((a, b) => b.score - a.score);
    list = cand.map((c) => c.g);
    guardCache.set(P, list);
  }
  return list[Math.min(rank, list.length - 1)] || { x: (P.bbox.minX + P.bbox.maxX) / 2, y: (P.bbox.minY + P.bbox.maxY) / 2 };
}

/** Keep a point inside P (returns null when outside, to ignore the move). */
export const insideOf = (P) => (q) => (P.contains(q) ? q : null);

/** Unrolled chain [u, v] from two boundary parameters (v taken after u). */
export const chainFrom = (u, v, n) => ({ a: u, b: u + mod(v - u, n) });
