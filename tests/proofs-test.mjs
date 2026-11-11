// Empirical checks of the lemmas used by the interactive figures.
import { polygonFromArray, mod } from '../src/geometry/polygon.js';
import { Solver, classifyGuard } from '../src/geometry/solver.js';
import { chainThrough } from '../src/geometry/visibility.js';
import { replaceGoodGuard, lemma49, maximalChainLemma62, theorem54 } from '../src/geometry/proofs.js';
import { randomPolygon, mulberry32 } from '../src/geometry/generate.js';
import { PRESETS } from '../src/geometry/presets.js';

const rand = mulberry32(99);
const stats = { good: 0, goodOk: 0, bad: 0, badOk: 0, l62: 0, l62ok: 0, thm: 0, thmOk: 0, allBad: [] };
const lemmaCount = {};
function randomInside(P) {
  for (;;) {
    const g = { x: P.bbox.minX + rand() * (P.bbox.maxX - P.bbox.minX), y: P.bbox.minY + rand() * (P.bbox.maxY - P.bbox.minY) };
    if (P.insideStrict(g)) return g;
  }
}
function run(P, label) {
  const S = new Solver(P);
  const n = P.n;
  for (let s = 0; s < 40; s++) {
    const g = randomInside(P);
    const V = S.vis(g);
    if (V.full) continue;
    for (const c of V.chains) {
      // maximal chain and a random sub-chain
      for (const [u, v] of [[c.a, c.b], [c.a + (c.b - c.a) * 0.3 * rand(), c.b - (c.b - c.a) * 0.3 * rand()]]) {
        const cls = classifyGuard(P, g, u, v);
        if (!cls.bad) {
          stats.good++;
          const R = replaceGoodGuard(P, S, g, u, v);
          lemmaCount[R.lemma] = (lemmaCount[R.lemma] || 0) + 1;
          if (R.chosen) stats.goodOk++; else console.log(`  ${label}: no replacement for good guard`, R.lemma, g, u, v);
        } else {
          stats.bad++;
          const L = lemma49(P, S, g, u, v);
          const ok = (L.gstar || []).some((x) => x.sees) || (L.coreVertices || []).some((x) => x.sees);
          if (ok) stats.badOk++; else console.log(`  ${label}: lemma 4.9 found nothing`, g, u, v);
        }
      }
      // lemma 6.2 for a random m in the chain
      const m = c.a + (c.b - c.a) * rand();
      const L62 = maximalChainLemma62(P, S, g, m);
      if (L62 && !L62.full) {
        stats.l62++;
        const ok = L62.u !== null && L62.v !== null && L62.ref &&
          Math.abs(mod(L62.u - L62.ref.a + 0.5, n) - 0.5) < 1e-5 && Math.abs(mod(L62.v - L62.ref.b + 0.5, n) - 0.5) < 1e-5;
        if (ok) stats.l62ok++; else console.log(`  ${label}: lemma 6.2 mismatch`, L62.u, L62.v, L62.ref);
      }
    }
  }
  const sol = S.solve();
  if (!sol.starShaped) {
    stats.thm++;
    const steps = theorem54(P, S, sol.guards);
    const last = steps[steps.length - 1];
    const starts = S.startPoints().map((x) => x.u);
    const ok = last.start !== undefined && last.start !== null && starts.some((u) => Math.abs(mod(u - last.start + 0.5, n) - 0.5) < 1e-6);
    if (ok) stats.thmOk++; else console.log(`  ${label}: theorem 5.4 walk-through ended with`, last.kind);
    if (steps[0].cls.every((c) => c.bad)) stats.allBad.push(label);
  }
}
for (const [name, pr] of Object.entries(PRESETS)) run(polygonFromArray(pr.points), name);
const N = Number(process.argv[2] || 40);
for (let s = 0; s < N; s++) {
  const P = randomPolygon(8 + (s % 13), { seed: 5000 + s });
  if (P) run(P, `seed${5000 + s}`);
}
console.log(stats, lemmaCount);
