// Static figures for the PDF documents, computed with the same code as the web page.

import { polygonFromArray, mod } from '../src/geometry/polygon.js';
import { Solver, classifyGuard } from '../src/geometry/solver.js';
import { PRESETS } from '../src/geometry/presets.js';
import { visibilityPolygon, chainThrough, unseenParts } from '../src/geometry/visibility.js';
import { coreOfEdges, edgesOfChain } from '../src/geometry/core.js';
import { replaceGoodGuard, lemma49, maximalChainLemma62, theorem54 } from '../src/geometry/proofs.js';
import { sub } from '../src/geometry/vec.js';
import { figure } from './svgfig.mjs';

const COLORS = ['#2563eb', '#16a34a', '#9333ea', '#d97706', '#0891b2', '#db2777'];
const poly = (id) => polygonFromArray(PRESETS[id].points);
const solvers = new Map();
const S_ = (P) => { if (!solvers.has(P)) solvers.set(P, new Solver(P)); return solvers.get(P); };

function solutionLayers(P, guards, labels = true) {
  const L = [];
  guards.forEach((G, i) => {
    L.push({ type: 'chain', a: G.a, b: G.b, color: COLORS[i % COLORS.length], width: 5 });
    L.push({ type: 'seg', a: G.g, b: P.at(G.a), stroke: COLORS[i % COLORS.length], dash: '3 3' });
    L.push({ type: 'seg', a: G.g, b: P.at(G.b), stroke: COLORS[i % COLORS.length], dash: '3 3' });
  });
  guards.forEach((G, i) => L.push({ type: 'dot', p: G.g, r: 4.5, fill: COLORS[i % COLORS.length], label: labels ? `g${i + 1}` : null }));
  return L;
}

export function fig_problem() {
  const P = poly('ushape'); const S = S_(P);
  const sol = S.solve();
  const g = { x: 250, y: 200 };
  const vp = visibilityPolygon(P, g);
  const V = S.vis(g);
  const a = figure(P, [{ type: 'polygon' }, { type: 'poly', pts: vp, fill: 'rgba(250,204,21,0.3)', stroke: '#ca8a04', width: 0.8 },
    ...V.chains.map((c) => ({ type: 'chain', a: c.a, b: c.b, color: '#2563eb', width: 5 })), { type: 'dot', p: g, r: 5, fill: '#dc2626', label: 'g' }], { width: 300 });
  const b = figure(P, [{ type: 'polygon' }, ...solutionLayers(P, sol.guards)], { width: 300 });
  return { a, b, k: sol.k };
}

export function fig_core() {
  const P = poly('ushape'); const S = S_(P);
  const u = 0.5, v = 3.5;
  const E = edgesOfChain(P, u, v);
  const PE = coreOfEdges(P, E);
  const C = PE.filter((p) => !p.artificial);
  const g = C.reduce((acc, p) => ({ x: acc.x + p.x / C.length, y: acc.y + p.y / C.length }), { x: 0, y: 0 });
  const g2 = { x: 300, y: 200 };
  const unseen = unseenParts(S.vis(g2), u, v, P.n);
  const lines = E.map((i) => { const [a, b] = P.edge(i); return { type: 'line', p: a, dir: sub(b, a) }; });
  const f1 = figure(P, [...lines, { type: 'polygon' }, { type: 'poly', pts: PE, fill: 'rgba(22,163,74,0.2)', stroke: '#16a34a' }, { type: 'chain', a: u, b: v, color: '#16a34a', width: 5 },
    { type: 'dot', p: P.at(u), r: 3.5, fill: '#111', label: 'u' }, { type: 'dot', p: P.at(v), r: 3.5, fill: '#111', label: 'v' }, { type: 'dot', p: g, r: 5, fill: '#16a34a', label: 'g' }], { width: 300 });
  const f2 = figure(P, [...lines, { type: 'polygon' }, { type: 'poly', pts: PE, fill: 'rgba(22,163,74,0.2)', stroke: '#16a34a' }, { type: 'chain', a: u, b: v, color: '#16a34a', width: 5 },
    ...unseen.map((c) => ({ type: 'chain', a: c.a, b: c.b, color: '#dc2626', width: 5 })), { type: 'dot', p: g2, r: 5, fill: '#dc2626', label: 'g' }], { width: 300 });
  return { f1, f2 };
}

export function fig_greedy() {
  const P = poly('comb'); const S = S_(P);
  const sol = S.solve();
  let badU = null;
  for (let i = 0; i < 400; i++) { const u = (i * P.n) / 400 + 0.003; if (S.greedy(u).guards.length === sol.k + 1) { badU = u; break; } }
  const r1 = S.greedy(badU);
  const r2 = S.greedy(mod(sol.guards[0].a, P.n));
  const mk = (r) => figure(P, [{ type: 'polygon' }, ...solutionLayers(P, r.guards), { type: 'dot', p: P.at(r.u), r: 4, fill: '#111', stroke: '#fff', label: 'u', dx: -12, dy: -14 }], { width: 300 });
  return { f1: mk(r1), f2: mk(r2), k: sol.k, n1: r1.guards.length, n2: r2.guards.length };
}

export function fig_goodbad() {
  const P = poly('notch'); const S = S_(P);
  const g = { x: 497, y: 456 };
  const ch = chainThrough(S.vis(g), 0.5, P.n);
  const cls = classifyGuard(P, g, ch.a, ch.b);
  const path = S.sp.path(P.at(ch.a), P.at(ch.b));
  const f = figure(P, [{ type: 'polygon' }, { type: 'chain', a: ch.a, b: ch.b, color: '#ea580c', width: 5 }, { type: 'arc', g, a: P.at(ch.a), b: P.at(ch.b), radius: 26 },
    { type: 'seg', a: g, b: P.at(ch.a), dash: '3 3' }, { type: 'seg', a: g, b: P.at(ch.b), dash: '3 3' }, { type: 'polyline', pts: path.pts, stroke: '#7c3aed', width: 1.8, dash: '6 4' },
    { type: 'dot', p: g, r: 5, fill: '#dc2626', label: 'g' }, { type: 'dot', p: P.at(ch.a), r: 3.5, fill: '#111', label: 'u' }, { type: 'dot', p: P.at(ch.b), r: 3.5, fill: '#111', label: 'v', dx: -14 }], { width: 360 });
  // a good guard (angle < pi) in the gallery
  const P2 = poly('gallery'); const S2 = S_(P2);
  const g2 = { x: 220, y: 420 };
  const ch2 = chainThrough(S2.vis(g2), 0.5, P2.n);
  const cls2 = classifyGuard(P2, g2, ch2.a, ch2.b);
  const f2 = figure(P2, [{ type: 'polygon' }, { type: 'chain', a: ch2.a, b: ch2.b, color: '#2563eb', width: 5 }, { type: 'arc', g: g2, a: P2.at(ch2.a), b: P2.at(ch2.b), radius: 26, color: '#2563eb', fill: 'rgba(37,99,235,0.15)' },
    { type: 'seg', a: g2, b: P2.at(ch2.a), dash: '3 3' }, { type: 'seg', a: g2, b: P2.at(ch2.b), dash: '3 3' }, { type: 'dot', p: g2, r: 5, fill: '#dc2626', label: 'g' }], { width: 300 });
  return { f, cls, f2, cls2 };
}

export function fig_replace() {
  const P = poly('gallery'); const S = S_(P);
  const g = { x: 220, y: 420 };
  const ch = chainThrough(S.vis(g), 0.5, P.n);
  const R = replaceGoodGuard(P, S, g, ch.a, ch.b);
  const c = R.chosen;
  const layers = [...(c ? c.lines.map((i) => { const [a, b] = P.edge(i); return { type: 'line', p: a, dir: sub(b, a), stroke: '#0f766e', dash: '7 4', width: 1 }; }) : []),
    { type: 'polygon' }, { type: 'poly', pts: R.Pg, fill: 'rgba(100,116,139,0.28)', stroke: '#475569', dash: '3 3' },
    { type: 'poly', pts: R.PE, fill: 'rgba(22,163,74,0.18)', stroke: '#16a34a' }, { type: 'chain', a: ch.a, b: ch.b, color: '#2563eb', width: 5 },
    { type: 'seg', a: g, b: P.at(ch.a), dash: '3 3' }, { type: 'seg', a: g, b: P.at(ch.b), dash: '3 3' },
    { type: 'dot', p: g, r: 5, fill: '#dc2626', label: 'g' }, { type: 'dot', p: P.at(ch.a), r: 3, fill: '#111', label: 'u', dx: -12 }, { type: 'dot', p: P.at(ch.b), r: 3, fill: '#111', label: 'v' }];
  if (c) layers.push({ type: 'star', p: c.p, label: 'c' });
  return { f: figure(P, layers, { width: 380 }), lemma: R.lemma, type: c ? c.type : null };
}

export function fig_lemma49() {
  const P = poly('notch'); const S = S_(P);
  const g = { x: 497, y: 456 };
  const ch = chainThrough(S.vis(g), 0.5, P.n);
  const L = lemma49(P, S, g, ch.a, ch.b);
  const star = (L.gstar || []).find((x) => x.sees) || (L.coreVertices || []).find((x) => x.sees);
  const layers = [{ type: 'line', p: L.lu.p, dir: L.lu.dir, stroke: '#b45309', dash: '7 4', width: 1.1 }, { type: 'line', p: L.lv.p, dir: L.lv.dir, stroke: '#b45309', dash: '2 4', width: 1.1 },
    { type: 'polygon' }, { type: 'poly', pts: L.Pv, fill: 'rgba(100,116,139,0.25)', stroke: '#475569', dash: '3 3' },
    { type: 'poly', pts: L.Pprime, fill: 'rgba(21,128,61,0.45)', stroke: '#166534' }, { type: 'polyline', pts: L.Sv.pts, stroke: '#dc2626', width: 2.2 },
    { type: 'chain', a: ch.a, b: ch.b, color: '#ea580c', width: 4, opacity: 0.8 }, { type: 'dot', p: g, r: 5, fill: '#dc2626', label: 'g' },
    { type: 'dot', p: P.at(ch.a), r: 3, fill: '#111', label: 'u' }, { type: 'dot', p: P.at(ch.b), r: 3, fill: '#111', label: 'v', dx: -14 }];
  if (star) layers.push({ type: 'star', p: star.p, label: 'g*' });
  return figure(P, layers, { width: 380 });
}

export function fig_arrangement() {
  const P = poly('gallery'); const S = S_(P);
  const arr = S.arrangement(); const UP = S.startPoints();
  const lines = Array.from({ length: P.n }, (_, i) => { const [a, b] = P.edge(i); return { type: 'line', p: a, dir: sub(b, a), width: 0.6 }; });
  const c = arr.find((x) => x.vertexOfP < 0 && S.candidateGuards().filter((G) => G.g === x.p).length >= 2) || arr[0];
  const cg = S.candidateGuards().filter((G) => G.g === c.p);
  const layers = [...lines, { type: 'polygon' }, ...c.edges.map((e) => { const [a, b] = P.edge(e); return { type: 'line', p: a, dir: sub(b, a), stroke: '#0f766e', dash: '1 0', width: 1.2 }; }),
    ...cg.map((G, i) => ({ type: 'chain', a: G.a, b: G.b, color: COLORS[i], width: 6 - 2 * i, opacity: 0.8 })),
    ...arr.map((x) => ({ type: 'dot', p: x.p, r: 2, fill: '#0f172a', stroke: 'none' })),
    ...UP.map((x) => ({ type: 'dot', p: P.at(x.u), r: 2.6, fill: '#0f766e', stroke: '#fff' })),
    { type: 'dot', p: c.p, r: 5, fill: '#dc2626', label: 'c' }];
  return { f: figure(P, layers, { width: 400 }), nArr: arr.length, nGP: S.candidateGuards().length, nUP: UP.length, n: P.n };
}

export function fig_theorem54() {
  const P = poly('badpair'); const S = S_(P);
  const base = S.greedy(PRESETS.badpair.demoStart).guards;
  const steps = theorem54(P, S, base);
  const st0 = steps[0];
  const guardsL = (G) => solutionLayers(P, G);
  const panels = [];
  panels.push(figure(P, [{ type: 'polygon' }, ...guardsL(st0.guards), ...st0.guards.map((G, i) => ({ type: 'arc', g: G.g, a: P.at(G.a), b: P.at(G.b), radius: 16, color: COLORS[i], fill: 'rgba(0,0,0,0.06)' }))], { width: 250 }));
  const l53 = steps.find((s) => s.kind === 'lemma53');
  const G0 = st0.guards[0];
  panels.push(figure(P, [{ type: 'polygon' }, ...guardsL(st0.guards), { type: 'seg', a: G0.g, b: P.at(G0.b), stroke: '#dc2626', width: 2 }, ...(l53 && l53.r ? [{ type: 'dot', p: l53.r.p, r: 5, fill: '#dc2626', label: 'r' }] : [])], { width: 250 }));
  const tr = steps.find((s) => s.kind === 'trim');
  const G2 = st0.guards.map((G, i) => (tr && i === tr.index ? tr.after : G));
  panels.push(figure(P, [{ type: 'polygon' }, ...(tr ? [{ type: 'chain', a: tr.before.a, b: tr.before.b, color: '#94a3b8', width: 9, opacity: 0.4 }] : []), ...guardsL(G2), ...(tr ? [{ type: 'arc', g: tr.after.g, a: P.at(tr.after.a), b: P.at(tr.after.b), radius: 20, color: '#16a34a', fill: 'rgba(22,163,74,0.2)' }] : [])], { width: 250 }));
  const rep = steps.find((s) => s.kind === 'replace-good');
  const c = rep && rep.R.chosen;
  panels.push(figure(P, [{ type: 'polygon' }, ...guardsL(G2), ...(rep && rep.candidate ? [{ type: 'chain', a: rep.candidate.a, b: rep.candidate.b, color: '#0f766e', width: 9, opacity: 0.45 }, { type: 'dot', p: P.at(rep.candidate.a), r: 5, fill: '#0f766e', label: 'uₓ' }] : []), ...(c ? [{ type: 'star', p: c.p, label: 'c' }] : [])], { width: 250 }));
  return { panels, kinds: steps.map((s) => s.kind), cls: st0.cls.map((c) => c.bad), trimGood: tr ? !tr.cls.bad : null };
}

export function fig_lemma62() {
  const P = poly('gallery'); const S = S_(P);
  const g = { x: 140, y: 140 }, m = 5.5;
  const L = maximalChainLemma62(P, S, g, m);
  const layers = [{ type: 'polygon' }, { type: 'chain', a: L.s, b: L.t, color: '#0f172a', width: 3.5, opacity: 0.7 },
    { type: 'polyline', pts: L.piS.pts, stroke: '#dc2626', width: 2.2 }, { type: 'polyline', pts: L.piT.pts, stroke: '#2563eb', width: 2.2 },
    { type: 'seg', a: g, b: L.rs.hit.p, stroke: '#dc2626', dash: '2 4', width: 1.4 }, { type: 'seg', a: g, b: L.rt.hit.p, stroke: '#2563eb', dash: '2 4', width: 1.4 },
    { type: 'chain', a: L.u, b: L.u + mod(L.v - L.u, P.n), color: '#16a34a', width: 6 },
    { type: 'dot', p: L.ps, r: 4, fill: '#dc2626', label: 's', dx: -12 }, { type: 'dot', p: L.pt, r: 4, fill: '#2563eb', label: 't' },
    { type: 'dot', p: L.rs.hit.p, r: 4, fill: '#16a34a', label: 'u', dx: -12, dy: -14 }, { type: 'dot', p: L.rt.hit.p, r: 4, fill: '#16a34a', label: 'v', dy: -14 },
    { type: 'dot', p: P.at(m), r: 3.5, fill: '#475569', label: 'm' }, { type: 'dot', p: g, r: 5, fill: '#dc2626', label: 'g' }];
  return figure(P, layers, { width: 380 });
}

export function fig_nextstep() {
  const P = poly('badpair'); const S = S_(P);
  const u = PRESETS.badpair.demoStart;
  const good = S.nextGood(u);
  const best = S.next(u);
  const layers = [{ type: 'polygon' }, { type: 'chain', a: u, b: good.v, color: '#2563eb', width: 8, opacity: 0.45 }, { type: 'dot', p: good.g, r: 4.5, fill: '#2563eb', label: 'c' },
    ...(best.line ? [{ type: 'line', p: best.line.p, dir: best.line.dir, stroke: '#b45309', dash: '7 4', width: 1.1 }] : []),
    { type: 'chain', a: u, b: best.v, color: '#ea580c', width: 4 }, { type: 'seg', a: best.g, b: P.at(u), dash: '3 3' }, { type: 'seg', a: best.g, b: P.at(best.v), dash: '3 3' },
    { type: 'dot', p: best.g, r: 5, fill: '#ea580c', label: 'g*' }, { type: 'dot', p: P.at(u), r: 4, fill: '#111', label: 'u' }, { type: 'dot', p: P.at(best.v), r: 4, fill: '#fff', stroke: '#111', label: 'next(u)' }];
  return { f: figure(P, layers, { width: 360 }), good: good.v - u, best: best.v - u, kind: best.kind };
}

export function fig_nextplot() {
  const P = poly('comb'); const S = S_(P);
  const sol = S.solve();
  const L = P.perimeterLength();
  const n = P.n;
  const cum = [0];
  for (let i = 0; i < n; i++) cum.push(cum[i] + Math.hypot(P.v(i + 1).x - P.v(i).x, P.v(i + 1).y - P.v(i).y));
  const paramAt = (s) => { let i = 0; while (i < n - 1 && cum[i + 1] <= s) i++; return i + (s - cum[i]) / (cum[i + 1] - cum[i]); };
  const M = 200, W = 520, H = 200, pl = 34, pt = 8;
  const X = (x) => pl + x * W, Y = (y) => pt + (1 - y / 2) * H;
  const pts = [];
  for (let k = 0; k < M; k++) {
    const t = paramAt((k / M) * L + 1e-6);
    pts.push({ x: P.arcLength(t) / L, y: P.arcLength(S.next(t).v) / L, size: S.greedy(t).guards.length });
  }
  let s = `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 ${W + pl + 10} ${H + pt + 46}" width="${W + pl + 10}" style="max-width:100%;height:auto">`;
  s += `<rect x="${X(0)}" y="${Y(2)}" width="${W}" height="${H}" fill="#f1f5f9"/>`;
  for (const y of [0, 0.5, 1, 1.5, 2]) s += `<line x1="${X(0)}" x2="${X(1)}" y1="${Y(y)}" y2="${Y(y)}" stroke="#e2e8f0"/><text x="${X(0) - 5}" y="${Y(y) + 4}" font-size="10" text-anchor="end" fill="#64748b" font-family="Helvetica">${y}</text>`;
  s += `<line x1="${X(0)}" y1="${Y(0)}" x2="${X(1)}" y2="${Y(1)}" stroke="#94a3b8" stroke-dasharray="3 3"/><line x1="${X(0)}" y1="${Y(1)}" x2="${X(1)}" y2="${Y(2)}" stroke="#94a3b8" stroke-dasharray="3 3"/>`;
  s += `<path d="${pts.map((p, i) => `${i ? 'L' : 'M'}${X(p.x).toFixed(1)},${Y(p.y).toFixed(1)}`).join(' ')}" fill="none" stroke="#1d4ed8" stroke-width="1.8"/>`;
  for (const p of pts) s += `<rect x="${X(p.x)}" y="${Y(0) + 12}" width="${W / M + 0.5}" height="10" fill="${p.size === sol.k ? '#16a34a' : '#ea580c'}"/>`;
  for (const x of S.startPoints()) s += `<line x1="${X(P.arcLength(x.u) / L)}" x2="${X(P.arcLength(x.u) / L)}" y1="${Y(0) + 25}" y2="${Y(0) + 33}" stroke="#0f766e" stroke-width="1.2"/>`;
  s += `<text x="${X(0)}" y="${Y(0) + 44}" font-size="10" fill="#64748b" font-family="Helvetica">x (fraction du périmètre)</text>`;
  s += '</svg>';
  return { f: s, k: sol.k };
}
