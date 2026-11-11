// Basic 2D vector helpers. Points are plain objects {x, y}.
// All tolerances are absolute; polygons are expected to live in a
// coordinate box of roughly [0, 1000] x [0, 1000].

export const EPS = 1e-7;

export const pt = (x, y) => ({ x, y });
export const add = (a, b) => ({ x: a.x + b.x, y: a.y + b.y });
export const sub = (a, b) => ({ x: a.x - b.x, y: a.y - b.y });
export const mul = (a, s) => ({ x: a.x * s, y: a.y * s });
export const dot = (a, b) => a.x * b.x + a.y * b.y;
export const cross = (a, b) => a.x * b.y - a.y * b.x;
export const len = (a) => Math.hypot(a.x, a.y);
export const dist = (a, b) => Math.hypot(a.x - b.x, a.y - b.y);
export const lerp = (a, b, t) => ({ x: a.x + (b.x - a.x) * t, y: a.y + (b.y - a.y) * t });
export const mid = (a, b) => lerp(a, b, 0.5);
export const normalize = (a) => {
  const l = len(a);
  return l < 1e-15 ? { x: 0, y: 0 } : { x: a.x / l, y: a.y / l };
};
export const samePoint = (a, b, eps = EPS) => dist(a, b) <= eps;

/** Twice the signed area of triangle abc (> 0 iff c is left of a->b). */
export const orient = (a, b, c) => (b.x - a.x) * (c.y - a.y) - (b.y - a.y) * (c.x - a.x);

/** Signed distance of c to the directed line a->b (positive = left). */
export function sideOfLine(a, b, c) {
  const d = dist(a, b);
  if (d < 1e-15) return 0;
  return orient(a, b, c) / d;
}

/**
 * Intersection of the lines p + t*r and q + u*s.
 * Returns {t, u} or null when the lines are (nearly) parallel.
 */
export function lineLine(p, r, q, s) {
  const den = cross(r, s);
  const scale = len(r) * len(s);
  if (Math.abs(den) <= 1e-12 * Math.max(scale, 1e-30)) return null;
  const qp = sub(q, p);
  return { t: cross(qp, s) / den, u: cross(qp, r) / den };
}

/** Distance from point p to segment ab, and the parameter of the projection. */
export function pointSegment(p, a, b) {
  const ab = sub(b, a);
  const l2 = dot(ab, ab);
  let t = l2 < 1e-30 ? 0 : dot(sub(p, a), ab) / l2;
  t = Math.max(0, Math.min(1, t));
  const proj = lerp(a, b, t);
  return { d: dist(p, proj), t, proj };
}

/** Counter-clockwise angle in [0, 2*pi) needed to rotate direction a onto direction b. */
export function ccwAngle(a, b) {
  let ang = Math.atan2(cross(a, b), dot(a, b));
  if (ang < 0) ang += 2 * Math.PI;
  return ang;
}

/** Signed area of a polygon given as a list of points (> 0 for CCW). */
export function signedArea(pts) {
  let s = 0;
  for (let i = 0; i < pts.length; i++) {
    const a = pts[i];
    const b = pts[(i + 1) % pts.length];
    s += a.x * b.y - b.x * a.y;
  }
  return s / 2;
}

/** Proper intersection test of two closed segments (used for simplicity checks). */
export function segmentsIntersect(a, b, c, d, eps = EPS) {
  const o1 = sideOfLine(a, b, c);
  const o2 = sideOfLine(a, b, d);
  const o3 = sideOfLine(c, d, a);
  const o4 = sideOfLine(c, d, b);
  const s = (v) => (v > eps ? 1 : v < -eps ? -1 : 0);
  const s1 = s(o1), s2 = s(o2), s3 = s(o3), s4 = s(o4);
  if (s1 * s2 < 0 && s3 * s4 < 0) return true;
  const onSeg = (p, q, r) => pointSegment(r, p, q).d <= eps;
  if (s1 === 0 && onSeg(a, b, c)) return true;
  if (s2 === 0 && onSeg(a, b, d)) return true;
  if (s3 === 0 && onSeg(c, d, a)) return true;
  if (s4 === 0 && onSeg(c, d, b)) return true;
  return false;
}
