// The arrangement C_P of the supporting lines of the edges of P.
// We only need its vertices that lie in (the closed) P: these are the
// candidate guard positions of Definition 5.1.

import { sub, lerp, lineLine } from './vec.js';

export function arrangementVertices(P, { insideOnly = true } = {}) {
  const n = P.n;
  const raw = [];
  for (let i = 0; i < n; i++) {
    const [a, b] = P.edge(i);
    for (let j = i + 1; j < n; j++) {
      const [c, d] = P.edge(j);
      const r = lineLine(a, sub(b, a), c, sub(d, c));
      if (!r) continue;
      const p = lerp(a, b, r.t);
      if (!Number.isFinite(p.x) || !Number.isFinite(p.y)) continue;
      if (insideOnly && !P.contains(p, 1e-6)) continue;
      raw.push({ p, edges: [i, j] });
    }
  }
  // merge (numerically) identical points: a point where several lines meet
  const cell = 1e-4;
  const grid = new Map();
  const out = [];
  const key = (x, y) => `${Math.floor(x / cell)},${Math.floor(y / cell)}`;
  for (const r of raw) {
    const kx = Math.floor(r.p.x / cell), ky = Math.floor(r.p.y / cell);
    let found = null;
    for (let dx = -1; dx <= 1 && !found; dx++) {
      for (let dy = -1; dy <= 1 && !found; dy++) {
        const list = grid.get(`${kx + dx},${ky + dy}`);
        if (!list) continue;
        for (const o of list) {
          if (Math.abs(o.p.x - r.p.x) < 1e-6 && Math.abs(o.p.y - r.p.y) < 1e-6) { found = o; break; }
        }
      }
    }
    if (found) {
      for (const e of r.edges) if (!found.edges.includes(e)) found.edges.push(e);
    } else {
      const o = { p: r.p, edges: [...r.edges] };
      out.push(o);
      const k = key(r.p.x, r.p.y);
      if (!grid.has(k)) grid.set(k, []);
      grid.get(k).push(o);
    }
  }
  // tag polygon vertices
  for (const o of out) {
    o.vertexOfP = -1;
    for (let i = 0; i < n; i++) {
      const v = P.v(i);
      if (Math.abs(v.x - o.p.x) < 1e-6 && Math.abs(v.y - o.p.y) < 1e-6) { o.vertexOfP = i; break; }
    }
  }
  return out;
}

/** Endpoints of the supporting lines clipped to a (large) box, for drawing. */
export function supportingLineSegments(P, box) {
  const segs = [];
  for (let i = 0; i < P.n; i++) {
    const [a, b] = P.edge(i);
    const d = sub(b, a);
    const ts = [];
    const { minX, minY, maxX, maxY } = box;
    if (Math.abs(d.x) > 1e-12) { ts.push((minX - a.x) / d.x, (maxX - a.x) / d.x); }
    if (Math.abs(d.y) > 1e-12) { ts.push((minY - a.y) / d.y, (maxY - a.y) / d.y); }
    const pts = ts.map((t) => lerp(a, b, t)).filter((p) => p.x >= minX - 1e-6 && p.x <= maxX + 1e-6 && p.y >= minY - 1e-6 && p.y <= maxY + 1e-6);
    if (pts.length >= 2) {
      pts.sort((p, q) => (p.x - q.x) || (p.y - q.y));
      segs.push({ edge: i, a: pts[0], b: pts[pts.length - 1] });
    }
  }
  return segs;
}
