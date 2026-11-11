// Test-suite for the geometry kernel and the solver.
// Run with: npm test   (or: node tests/run-tests.mjs [numRandomPolygons])

import { Polygon, polygonFromArray, inChain, mod } from '../src/geometry/polygon.js';
import { visibleChains, chainThrough } from '../src/geometry/visibility.js';
import { Solver } from '../src/geometry/solver.js';
import { randomPolygon, mulberry32 } from '../src/geometry/generate.js';
import { PRESETS } from '../src/geometry/presets.js';

let failures = 0, checks = 0;
function check(cond, msg) {
  checks++;
  if (!cond) { failures++; console.log('  FAIL:', msg); }
}

// ---------------------------------------------------------------- unit tests
{
  const sq = polygonFromArray([[0, 0], [10, 0], [10, 10], [0, 10]]);
  check(sq.segInside({ x: 1, y: 1 }, { x: 9, y: 9 }), 'square diagonal inside');
  check(sq.segInside({ x: 0, y: 0 }, { x: 10, y: 0 }), 'segment along an edge is inside (closed P)');
  check(!sq.segInside({ x: 1, y: 1 }, { x: 11, y: 1 }), 'segment leaving the square');
  const V = visibleChains(sq, { x: 5, y: 5 });
  check(V.full, 'center of square sees everything');

  // L-shape: the reflex vertex (5,5) blocks part of the boundary from (9,1)
  const L = polygonFromArray([[0, 0], [10, 0], [10, 5], [5, 5], [5, 10], [0, 10]]);
  check(L.segInside({ x: 10, y: 5 }, { x: 0, y: 5 }), 'segment grazing reflex vertex is inside');
  check(!L.segInside({ x: 9, y: 4 }, { x: 4, y: 9.9 }), 'segment cutting the notch is outside');
  const VL = visibleChains(L, { x: 9, y: 1 });
  check(!VL.full && VL.chains.length >= 1, 'L-shape: point in one arm does not see all');
  // a point on the boundary sees its own edge
  const VB = visibleChains(L, { x: 10, y: 2 });
  const ch = chainThrough(VB, 1.4, L.n);
  check(ch && ch.a <= 1 + 1e-9 && ch.b >= 2 - 1e-9, 'boundary point sees its whole edge');
  // arrangement vertex outside the edge but on its supporting line sees it edge-on
  const VC = visibleChains(L, { x: 5, y: 0 });
  check(chainThrough(VC, 0.2, L.n) !== null, 'point on an edge sees that edge');
}

// --------------------------------------- visibility vs. brute-force sampling
function checkVisibility(P, rand, samples = 40) {
  let bad = 0;
  for (let s = 0; s < samples; s++) {
    let g;
    do {
      g = { x: P.bbox.minX + rand() * (P.bbox.maxX - P.bbox.minX), y: P.bbox.minY + rand() * (P.bbox.maxY - P.bbox.minY) };
    } while (!P.insideStrict(g));
    const V = visibleChains(P, g);
    for (let k = 0; k < 60; k++) {
      const t = rand() * P.n;
      const direct = P.segInside(g, P.at(t));
      const viaChains = V.full || V.chains.some((c) => inChain(t, c.a, c.b, P.n, 1e-9));
      if (direct !== viaChains) bad++;
    }
  }
  return bad;
}

// ------------------------------------------ next(u) vs. brute-force next(u)
function bruteGuards(P, S, step) {
  const pts = [];
  for (let x = P.bbox.minX; x <= P.bbox.maxX; x += step) {
    for (let y = P.bbox.minY; y <= P.bbox.maxY; y += step) {
      const g = { x, y };
      if (P.insideStrict(g)) pts.push(g);
    }
  }
  for (const c of S.arrangement()) pts.push(c.p);
  for (let i = 0; i < P.n; i++) pts.push(P.v(i));
  return pts.map((g) => ({ g, V: S.vis(g) }));
}

function bruteNext(P, guards, u) {
  let best = u;
  for (const { V } of guards) {
    const ch = chainThrough(V, u, P.n);
    if (ch && ch.b > best) best = ch.b;
  }
  return best;
}

function testPolygon(P, label, rand, { brute = true } = {}) {
  const S = new Solver(P);
  const visBad = checkVisibility(P, rand, 15);
  check(visBad === 0, `${label}: visibility chains disagree with direct test in ${visBad} samples`);
  const res = S.solve({ exhaustive: true });
  // every greedy solution must be valid: each guard sees its chain, chains cover
  const sol = res.guards;
  let covered = sol[sol.length - 1].b - sol[0].a >= P.n - 1e-6;
  for (let i = 0; i + 1 < sol.length; i++) covered = covered && sol[i + 1].a <= sol[i].b + 1e-9;
  check(covered, `${label}: solution does not cover the boundary`);
  for (const G of sol) {
    const ch = chainThrough(S.vis(G.g), G.a + 1e-9, P.n);
    check(ch && ch.b >= G.b - 1e-6, `${label}: a guard does not see its chain`);
  }
  // greedy from dense start points never beats the U_P-based optimum
  let denseMin = Infinity;
  const D = 200;
  for (let i = 0; i < D; i++) {
    const r = S.greedy((i * P.n) / D + 1e-4);
    if (r.complete) denseMin = Math.min(denseMin, r.guards.length);
  }
  check(denseMin >= res.k, `${label}: dense greedy found ${denseMin} < k = ${res.k}`);
  // every greedy run uses at most k + 1 guards
  const maxRun = Math.max(...res.runs.map((r) => r.size || 0));
  check(res.starShaped || maxRun <= res.k + 1, `${label}: some greedy run used ${maxRun} > k + 1`);
  let worst = 0;
  if (brute && !res.starShaped) {
    const step = Math.max(P.bbox.maxX - P.bbox.minX, P.bbox.maxY - P.bbox.minY) / 45;
    const guards = bruteGuards(P, S, step);
    const us = [];
    for (let i = 0; i < P.n; i++) us.push(i, i + 0.5);
    for (let i = 0; i < 25; i++) us.push(rand() * P.n);
    for (const u of us) {
      const ours = S.next(u).v;
      const theirs = bruteNext(P, guards, u);
      worst = Math.max(worst, theirs - ours);
      check(theirs <= ours + 1e-6, `${label}: brute next(${u.toFixed(3)}) = ${theirs.toFixed(5)} > ours ${ours.toFixed(5)}`);
    }
  }
  return { k: res.k, denseMin, time: res.time, starts: res.startPoints.length, worst };
}

console.log('Preset polygons');
const rand = mulberry32(12345);
for (const [name, pr] of Object.entries(PRESETS)) {
  const P = polygonFromArray(pr.points);
  check(P.isSimple(), `${name} is simple`);
  const r = testPolygon(P, name, rand);
  console.log(`  ${name.padEnd(18)} n=${String(P.n).padStart(2)} k=${r.k} denseMin=${r.denseMin} |U_P|=${r.starts} ${r.time}ms`);
}

const N = Number(process.argv[2] || 30);
console.log(`Random polygons (${N})`);
const ks = {};
for (let s = 0; s < N; s++) {
  const n = 8 + (s % 9);
  const P = randomPolygon(n, { seed: 1000 + s });
  if (!P) { console.log('  generation failed', s); continue; }
  const r = testPolygon(P, `random#${s}`, rand, { brute: s < N });
  ks[r.k] = (ks[r.k] || 0) + 1;
  console.log(`  seed ${1000 + s} n=${String(n).padStart(2)} k=${r.k} denseMin=${r.denseMin} |U_P|=${r.starts} ${r.time}ms`);
}
console.log('k distribution', ks);
console.log(`\n${checks - failures}/${checks} checks passed`);
process.exit(failures ? 1 : 0);
