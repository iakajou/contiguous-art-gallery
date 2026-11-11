// Animated scenes for the home page. All geometry is computed by our solver;
// the animations only replay what the algorithm found.

import React, { useMemo } from 'react';
import { chainPoints } from '../geometry/visibility.js';
import { mod } from '../geometry/polygon.js';
import { sub, dist } from '../geometry/vec.js';
import { useLoopClock, phase, clamp01, easeOut } from './motion.jsx';

export const NEON = ['#60a5fa', '#34d399', '#f472b6', '#fbbf24', '#a78bfa', '#22d3ee', '#fb7185', '#a3e635'];
export const INK = ['#4f46e5', '#059669', '#db2777', '#d97706', '#7c3aed', '#0891b2', '#e11d48', '#65a30d'];

const D = (pts, closed) => (pts && pts.length ? pts.map((p, i) => `${i ? 'L' : 'M'}${p.x.toFixed(1)},${(-p.y).toFixed(1)}`).join(' ') + (closed ? 'Z' : '') : '');

/** First fraction p (0..1, by length) of a polyline. */
export function partial(pts, p) {
  if (!pts || pts.length < 2) return pts || [];
  if (p >= 1) return pts;
  let L = 0;
  for (let i = 0; i + 1 < pts.length; i++) L += dist(pts[i], pts[i + 1]);
  let left = L * clamp01(p);
  const out = [pts[0]];
  for (let i = 0; i + 1 < pts.length; i++) {
    const d = dist(pts[i], pts[i + 1]);
    if (left <= d) { const f = d ? left / d : 0; out.push({ x: pts[i].x + (pts[i + 1].x - pts[i].x) * f, y: pts[i].y + (pts[i + 1].y - pts[i].y) * f }); return out; }
    out.push(pts[i + 1]);
    left -= d;
  }
  return out;
}

function viewBox(P, pad = 30) {
  const { minX, minY, maxX, maxY } = P.bbox;
  return `${minX - pad} ${-maxY - pad} ${maxX - minX + 2 * pad} ${maxY - minY + 2 * pad}`;
}

/**
 * Cameras "painting" their chains one after the other.
 * runs: [{ guards: [{g, a, b}], label, u }]
 */
export function SweepScene({ P, runs, dark = true, perGuard = 1.5, hold = 1.8, fadeOut = 0.7, className = '', showU = false, unit = 1.6 }) {
  const palette = dark ? NEON : INK;
  const durations = runs.map((r) => r.guards.length * perGuard + hold + fadeOut + 0.4);
  const cycle = durations.reduce((a, b) => a + b, 0);
  const [ref, t] = useLoopClock(cycle, { still: durations[0] - fadeOut - 0.05 });
  let r = 0, lt = t;
  while (r < runs.length - 1 && lt >= durations[r]) { lt -= durations[r]; r++; }
  const run = runs[r];
  const dur = durations[r];
  const groupOpacity = 1 - phase(lt, dur - fadeOut, fadeOut);
  const started = run.guards.filter((_, i) => lt >= 0.4 + i * perGuard).length;
  const stroke = dark ? 'rgba(226,232,240,0.85)' : 'var(--ink)';
  const fill = dark ? 'rgba(148,163,184,0.10)' : 'var(--poly-fill)';
  const vb = useMemo(() => viewBox(P), [P]);
  return (
    <div ref={ref} className={`scene ${dark ? 'scene-dark' : ''} ${className}`}>
      <svg viewBox={vb} className="scene-svg" role="img" aria-label="contiguous guards sweeping the walls">
        <defs>
          <filter id="glow" x="-50%" y="-50%" width="200%" height="200%">
            <feGaussianBlur stdDeviation="5" result="b" />
            <feMerge><feMergeNode in="b" /><feMergeNode in="SourceGraphic" /></feMerge>
          </filter>
        </defs>
        <path d={D(P.pts, true)} fill={fill} stroke={stroke} strokeWidth={2.2 * unit} strokeLinejoin="round" />
        <g style={{ opacity: groupOpacity }}>
          {run.guards.map((G, i) => {
            const p = phase(lt, 0.4 + i * perGuard, perGuard * 0.92);
            if (p <= 0) return null;
            const end = G.a + (G.b - G.a) * p;
            const ch = chainPoints(P, G.a, end);
            const c = palette[i % palette.length];
            const pe = P.at(end);
            const beam = p < 1 ? 1 : 0;
            return (
              <g key={i}>
                <path d={D([G.g, ...ch], true)} fill={c} fillOpacity={dark ? 0.16 : 0.13} stroke="none" />
                <path d={D(ch)} fill="none" stroke={c} strokeWidth={6.5 * unit} strokeLinecap="round" strokeLinejoin="round" filter={dark ? 'url(#glow)' : undefined} />
                <line x1={G.g.x} y1={-G.g.y} x2={pe.x} y2={-pe.y} stroke={c} strokeWidth={1.6 * unit} strokeOpacity={0.9 * beam} />
                <line x1={G.g.x} y1={-G.g.y} x2={P.at(G.a).x} y2={-P.at(G.a).y} stroke={c} strokeWidth={1.2 * unit} strokeDasharray={`${5 * unit} ${5 * unit}`} strokeOpacity={0.7} />
                <circle cx={G.g.x} cy={-G.g.y} r={(6 + 10 * (1 - easeOut((lt - 0.4 - i * perGuard) / 0.6))) * unit} fill="none" stroke={c} strokeOpacity={0.6 * (1 - easeOut((lt - 0.4 - i * perGuard) / 0.6))} strokeWidth={2 * unit} />
                <circle cx={G.g.x} cy={-G.g.y} r={6.5 * unit} fill={c} stroke={dark ? '#0b1020' : '#fff'} strokeWidth={2 * unit} />
                {beam ? <circle cx={pe.x} cy={-pe.y} r={4.5 * unit} fill="#fff" stroke={c} strokeWidth={2 * unit} /> : null}
              </g>
            );
          })}
          {showU && run.u !== undefined && (() => { const pu = P.at(run.u); return (
            <g>
              <rect x={pu.x - 7 * unit} y={-pu.y - 7 * unit} width={14 * unit} height={14 * unit} rx={3 * unit} fill={dark ? '#fff' : '#0f172a'} />
              <text x={pu.x + 12 * unit} y={-pu.y + 22 * unit} fontSize={20 * unit} fill={dark ? '#fff' : '#0f172a'} fontStyle="italic" fontFamily="Instrument Serif, serif">u</text>
            </g>); })()}
        </g>
      </svg>
      {run.label ? (
        <div className="scene-label" style={{ opacity: groupOpacity }}>
          <span className="scene-label-text">{run.label}</span>
          <span className="scene-count"><b>{started}</b> guard{started === 1 ? '' : 's'}</span>
        </div>
      ) : null}
    </div>
  );
}

/**
 * Scene for "few starting points": supporting lines, arrangement vertices, then the start points U_P
 * coloured by the size of the greedy solution from them.
 */
export function DiscretizeScene({ P, S, res }) {
  const cycle = 9.5;
  const [ref, t] = useLoopClock(cycle, { still: 7.6 });
  const arr = S.arrangement();
  const lines = useMemo(() => Array.from({ length: P.n }, (_, i) => {
    const [a, b] = P.edge(i); const d = sub(b, a); const L = Math.hypot(d.x, d.y) || 1; const R = P.diam * 2;
    return { a: { x: a.x - (d.x / L) * R, y: a.y - (d.y / L) * R }, b: { x: a.x + (d.x / L) * R, y: a.y + (d.y / L) * R } };
  }), [P]);
  const out = 1 - phase(t, cycle - 0.7, 0.7);
  const vb = viewBox(P);
  return (
    <div ref={ref} className="scene">
      <svg viewBox={vb} className="scene-svg" role="img" aria-label="arrangement of supporting lines and candidate start points">
        <defs><clipPath id="dclip"><path d={D(P.pts, true)} /></clipPath></defs>
        <path d={D(P.pts, true)} fill="var(--poly-fill)" stroke="var(--ink)" strokeWidth={3} strokeLinejoin="round" />
        <g style={{ opacity: out }}>
          {lines.map((l, i) => {
            const p = phase(t, 0.2 + i * 0.08, 0.9);
            const m = { x: (l.a.x + l.b.x) / 2, y: (l.a.y + l.b.y) / 2 };
            const a = { x: m.x + (l.a.x - m.x) * p, y: m.y + (l.a.y - m.y) * p };
            const b = { x: m.x + (l.b.x - m.x) * p, y: m.y + (l.b.y - m.y) * p };
            return <line key={i} x1={a.x} y1={-a.y} x2={b.x} y2={-b.y} stroke="var(--accent)" strokeOpacity={0.35 * (1 - phase(t, 4.6, 0.8))} strokeWidth={1.6} />;
          })}
          {arr.map((c, i) => {
            const p = easeOut((t - 2.2 - (i % 25) * 0.04) / 0.4);
            return <circle key={i} cx={c.p.x} cy={-c.p.y} r={6 * clamp01(p)} fill="var(--ink)" fillOpacity={0.85 * (1 - 0.6 * phase(t, 4.6, 0.8))} />;
          })}
          {res && res.runs && res.runs.map((r, i) => {
            const p = easeOut((t - 4.8 - i * 0.03) / 0.4);
            const q = P.at(r.u);
            const good = r.size === res.k;
            const col = t > 6.6 ? (good ? '#10b981' : '#f59e0b') : 'var(--accent)';
            return <circle key={i} cx={q.x} cy={-q.y} r={9 * clamp01(p)} fill={col} stroke="var(--surface)" strokeWidth={2.5} style={{ transition: 'fill .5s' }} />;
          })}
        </g>
      </svg>
      <div className="scene-legend">
        <span className={t < 2.2 ? 'on' : ''}>① supporting lines</span>
        <span className={t >= 2.2 && t < 4.8 ? 'on' : ''}>② arrangement vertices = candidate guards</span>
        <span className={t >= 4.8 && t < 6.6 ? 'on' : ''}>③ start points U<sub>P</sub></span>
        <span className={t >= 6.6 ? 'on' : ''}>④ <i className="dot g" /> optimal start <i className="dot o" /> one guard too many</span>
      </div>
    </div>
  );
}

/** Scene for Lemma 6.2: shortest paths, rays and the maximal visible chain. */
export function Lemma62Scene({ P, L, g, m }) {
  const cycle = 8.5;
  const [ref, t] = useLoopClock(cycle, { still: 6.4 });
  const out = 1 - phase(t, cycle - 0.6, 0.6);
  const vb = viewBox(P);
  if (!L || L.full) return null;
  const E = chainPoints(P, L.s, L.t);
  const ch = chainPoints(P, L.u, L.u + mod(L.v - L.u, P.n));
  const pE = phase(t, 0.3, 1.0), pS = phase(t, 1.5, 1.1), pT = phase(t, 2.2, 1.1), pR = phase(t, 3.6, 0.9), pC = phase(t, 4.7, 1.0);
  const ray = (r, p) => (r.hit ? [g, { x: g.x + (r.hit.p.x - g.x) * p, y: g.y + (r.hit.p.y - g.y) * p }] : []);
  return (
    <div ref={ref} className="scene">
      <svg viewBox={vb} className="scene-svg" role="img" aria-label="Lemma 6.2: two shortest paths and two rays">
        <path d={D(P.pts, true)} fill="var(--poly-fill)" stroke="var(--ink)" strokeWidth={3} strokeLinejoin="round" />
        <g style={{ opacity: out }}>
          <path d={D(partial(E, pE))} fill="none" stroke="var(--ink)" strokeOpacity={0.55} strokeWidth={9} strokeLinecap="round" strokeLinejoin="round" />
          <path d={D(partial(L.piS.pts, pS))} fill="none" stroke="#ef4444" strokeWidth={5} strokeLinecap="round" strokeLinejoin="round" />
          <path d={D(partial(L.piT.pts, pT))} fill="none" stroke="#3b82f6" strokeWidth={5} strokeLinecap="round" strokeLinejoin="round" />
          {pR > 0 && <path d={D(ray(L.rs, pR))} stroke="#ef4444" strokeWidth={3} strokeDasharray="4 9" strokeLinecap="round" />}
          {pR > 0 && <path d={D(ray(L.rt, pR))} stroke="#3b82f6" strokeWidth={3} strokeDasharray="4 9" strokeLinecap="round" />}
          {pC > 0 && <path d={D(partial(ch, pC))} fill="none" stroke="#10b981" strokeWidth={12} strokeLinecap="round" strokeLinejoin="round" />}
          {pE > 0.95 && <><circle cx={L.ps.x} cy={-L.ps.y} r={9} fill="#ef4444" /><circle cx={L.pt.x} cy={-L.pt.y} r={9} fill="#3b82f6" /></>}
          {pR > 0.98 && L.rs.hit && <circle cx={L.rs.hit.p.x} cy={-L.rs.hit.p.y} r={10} fill="#10b981" stroke="#fff" strokeWidth={3} />}
          {pR > 0.98 && L.rt.hit && <circle cx={L.rt.hit.p.x} cy={-L.rt.hit.p.y} r={10} fill="#10b981" stroke="#fff" strokeWidth={3} />}
          <circle cx={g.x} cy={-g.y} r={11} fill="#0f172a" stroke="#fff" strokeWidth={3} />
          <circle cx={P.at(m).x} cy={-P.at(m).y} r={7} fill="#64748b" />
        </g>
      </svg>
      <div className="scene-legend">
        <span className={t < 1.5 ? 'on' : ''}>① edges facing g</span>
        <span className={t >= 1.5 && t < 3.6 ? 'on' : ''}>② shortest paths from s and t</span>
        <span className={t >= 3.6 && t < 4.7 ? 'on' : ''}>③ two rays</span>
        <span className={t >= 4.7 ? 'on' : ''}>④ the maximal visible chain</span>
      </div>
    </div>
  );
}

/** A bad guard: the beam sweeps more than half a turn around the obstacle. */
export function BadGuardScene({ P, g, ch, angle }) {
  const cycle = 6;
  const [ref, t] = useLoopClock(cycle, { still: 4.0 });
  const p = phase(t, 0.3, 3.2);
  const out = 1 - phase(t, cycle - 0.6, 0.6);
  const end = ch.a + (ch.b - ch.a) * p;
  const pts = chainPoints(P, ch.a, end);
  const pe = P.at(end);
  const pu = P.at(ch.a);
  // arc of the swept angle
  const a0 = Math.atan2(pu.y - g.y, pu.x - g.x);
  const R = 60;
  const sw = angle * p;
  const arc = [g];
  for (let i = 0; i <= 48; i++) { const a = a0 + (sw * i) / 48; arc.push({ x: g.x + R * Math.cos(a), y: g.y + R * Math.sin(a) }); }
  return (
    <div ref={ref} className="scene">
      <svg viewBox={viewBox(P)} className="scene-svg" role="img" aria-label="a bad guard looking around a corner">
        <path d={D(P.pts, true)} fill="var(--poly-fill)" stroke="var(--ink)" strokeWidth={3} strokeLinejoin="round" />
        <g style={{ opacity: out }}>
          <path d={D([g, ...pts], true)} fill="#f97316" fillOpacity={0.14} />
          <path d={D(pts)} fill="none" stroke="#f97316" strokeWidth={10} strokeLinecap="round" strokeLinejoin="round" />
          <path d={D(arc, true)} fill="#f97316" fillOpacity={0.25} stroke="#f97316" strokeWidth={2} />
          {p < 1 && <line x1={g.x} y1={-g.y} x2={pe.x} y2={-pe.y} stroke="#f97316" strokeWidth={2.5} />}
          <circle cx={g.x} cy={-g.y} r={11} fill="#ef4444" stroke="#fff" strokeWidth={3} />
        </g>
      </svg>
      <div className="scene-badge" style={{ opacity: out }}>{Math.round((angle * p * 180) / Math.PI)}° {angle * p > Math.PI ? <b>&gt; 180°: bad guard</b> : null}</div>
    </div>
  );
}
