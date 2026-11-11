// Shortest paths inside a simple polygon.
//
// The paper uses the O(log n)-query structure of Guibas and Hershberger.
// For polygons with a few dozen vertices we use the classical visibility-graph
// approach instead: a shortest path between two points of P is a polygonal
// chain whose interior vertices are reflex vertices of P, so it suffices to
// know which vertices see each other (precomputed, Floyd-Warshall) and which
// vertices are seen by the two query points.

import { dist, orient } from './vec.js';

export class ShortestPaths {
  constructor(P) {
    this.P = P;
    const n = P.n;
    this.n = n;
    const V = P.pts;
    const D = Array.from({ length: n }, () => new Float64Array(n).fill(Infinity));
    const nxt = Array.from({ length: n }, () => new Int32Array(n).fill(-1));
    // only reflex vertices can be interior vertices of a shortest path,
    // but every vertex may be an endpoint, so we keep all of them.
    for (let i = 0; i < n; i++) {
      D[i][i] = 0;
      nxt[i][i] = i;
      for (let j = i + 1; j < n; j++) {
        if (P.segInside(V[i], V[j])) {
          const d = dist(V[i], V[j]);
          D[i][j] = D[j][i] = d;
          nxt[i][j] = j;
          nxt[j][i] = i;
        }
      }
    }
    const reflex = new Set(P.reflexVertices());
    for (let k = 0; k < n; k++) {
      if (!reflex.has(k)) continue;
      const Dk = D[k];
      for (let i = 0; i < n; i++) {
        const dik = D[i][k];
        if (dik === Infinity) continue;
        const Di = D[i], Ni = nxt[i];
        for (let j = 0; j < n; j++) {
          const v = dik + Dk[j];
          if (v < Di[j] - 1e-12) { Di[j] = v; Ni[j] = Ni[k]; }
        }
      }
    }
    this.D = D;
    this.nxt = nxt;
  }

  /** Which vertices of P does p see? */
  visFrom(p) {
    const V = this.P.pts;
    const out = new Array(this.n);
    for (let i = 0; i < this.n; i++) out[i] = this.P.segInside(p, V[i]);
    return out;
  }

  vertexPath(i, j) {
    const out = [i];
    let c = i;
    let guard = 0;
    while (c !== j && guard++ < 4 * this.n) {
      c = this.nxt[c][j];
      if (c < 0) return null;
      out.push(c);
    }
    return out;
  }

  /** Shortest path from point p to vertex w. visP = visFrom(p) (optional cache). */
  pathToVertex(p, w, visP = null) {
    const vp = visP || this.visFrom(p);
    const V = this.P.pts;
    let best = Infinity, bi = -1;
    for (let i = 0; i < this.n; i++) {
      if (!vp[i]) continue;
      const v = dist(p, V[i]) + this.D[i][w];
      if (v < best - 1e-12) { best = v; bi = i; }
    }
    if (bi < 0) return null;
    const idx = this.vertexPath(bi, w);
    return cleanPath([p, ...idx.map((k) => V[k])], idx);
  }

  /** Shortest path between two arbitrary points of P. */
  path(p, q, visP = null, visQ = null) {
    if (this.P.segInside(p, q)) return { pts: [p, q], vertexIdx: [], length: dist(p, q) };
    const vp = visP || this.visFrom(p);
    const vq = visQ || this.visFrom(q);
    const V = this.P.pts;
    let best = Infinity, bi = -1, bj = -1;
    for (let i = 0; i < this.n; i++) {
      if (!vp[i]) continue;
      const di = dist(p, V[i]);
      for (let j = 0; j < this.n; j++) {
        if (!vq[j]) continue;
        const v = di + this.D[i][j] + dist(V[j], q);
        if (v < best - 1e-12) { best = v; bi = i; bj = j; }
      }
    }
    if (bi < 0) return null;
    const idx = this.vertexPath(bi, bj);
    const r = cleanPath([p, ...idx.map((k) => V[k]), q], idx);
    return r;
  }
}

function cleanPath(pts, idx) {
  const out = [];
  for (const p of pts) {
    if (!out.length || dist(out[out.length - 1], p) > 1e-9) out.push(p);
  }
  let length = 0;
  for (let i = 0; i + 1 < out.length; i++) length += dist(out[i], out[i + 1]);
  return { pts: out, vertexIdx: idx, length };
}

/** Are all turns of the polyline left turns (or straight)? */
export function isLeftTurning(pts, eps = 1e-9) {
  for (let i = 1; i + 1 < pts.length; i++) {
    if (orient(pts[i - 1], pts[i], pts[i + 1]) < -eps * dist(pts[i - 1], pts[i]) * dist(pts[i], pts[i + 1])) return false;
  }
  return true;
}
