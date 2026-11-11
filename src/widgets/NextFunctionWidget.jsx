import React, { useMemo, useState, useEffect } from 'react';
import { Stage, PolygonView, Chain, Dot, Seg, colorOf, BoundaryTicks } from '../components/svg.jsx';
import { Widget, PresetPicker, presetPolygon, solverFor, solutionFor, M } from '../components/ui.jsx';
import { mod } from '../geometry/polygon.js';

const cache = new WeakMap();

function sample(P, S, M = 240) {
  if (cache.has(P)) return cache.get(P);
  const n = P.n;
  const L = P.perimeterLength();
  const cum = [0];
  for (let i = 0; i < n; i++) cum.push(cum[i] + Math.hypot(P.v(i + 1).x - P.v(i).x, P.v(i + 1).y - P.v(i).y));
  const paramAt = (s) => {
    let i = 0;
    while (i < n - 1 && cum[i + 1] <= s) i++;
    return i + (s - cum[i]) / (cum[i + 1] - cum[i]);
  };
  const pts = [];
  for (let k = 0; k < M; k++) {
    const t = paramAt((k / M) * L + 1e-6);
    const nv = S.next(t).v;
    const size = S.greedy(t).guards.length;
    pts.push({ t, x: P.arcLength(t) / L, y: P.arcLength(nv) / L, size });
  }
  const r = { pts, L, paramAt };
  cache.set(P, r);
  return r;
}

/** Section 2.10: the function next and its revolutions (towards the Θ(n log n) algorithm). */
export default function NextFunctionWidget() {
  const [preset, setPreset] = useState('comb');
  const P = presetPolygon(preset);
  const S = solverFor(P);
  const [data, setData] = useState(null);
  const [x0, setX0] = useState(0.1);
  useEffect(() => {
    setData(null);
    if (S.isStarShaped()) return undefined;
    const id = setTimeout(() => setData(sample(P, S)), 20);
    return () => clearTimeout(id);
  }, [P, S]);
  const opt = useMemo(() => solutionFor(P), [P]);

  const W = 760, H = 250, padL = 46, padB = 70, padT = 10;
  const X = (x) => padL + x * W;
  const Y = (y) => padT + (1 - y / 2) * H;

  const rev = useMemo(() => {
    if (!data) return null;
    const t0 = data.paramAt(x0 * data.L + 1e-6);
    return S.greedy(t0);
  }, [data, x0, S]);

  const onPlotClick = (e) => {
    const svg = e.currentTarget;
    const pt = svg.createSVGPoint(); pt.x = e.clientX; pt.y = e.clientY;
    const q = pt.matrixTransform(svg.getScreenCTM().inverse());
    const x = (q.x - padL) / W;
    if (x >= 0 && x < 1) setX0(x);
  };

  const k = opt.k;
  return (
    <Widget
      tag="Figure 11" id="fig-11"
      title={<>The function <M>{'\\mathrm{next}'}</M> and its revolutions</>}
      controls={<PresetPicker value={preset} onChange={setPreset} ids={['comb', 'gallery', 'dumbbell', 'zigzag', 'ushape', 'badpair']} />}
      caption={<>
        Top: the graph of <M>{'x \\mapsto \\mathrm{next}(x)'}</M>, both axes measured as a fraction of the perimeter (the dotted lines are <M>y=x</M> and{' '}
        <M>y=x+1</M>, one full turn). It is non-decreasing; flat pieces come from fixed guards, curved pieces from guards that move with <M>x</M>.
        de Berg, Conradi, van der Hoog and Rotenberg show that it has only <M>O(n)</M> pieces, each a Möbius transformation <M>{'x\\mapsto\\frac{A+Bx}{C+Dx}'}</M>.
        The band below shows, for every start <M>x</M>, the size of the greedy solution (green: <M>k</M>, orange: <M>k+1</M>); teal ticks are <M>U_P</M>.
        Click the plot to choose <M>x_0</M>; its revolution <M>{'x_0, \\mathrm{next}(x_0), \\mathrm{next}^2(x_0), \\dots'}</M> is drawn as a staircase.
      </>}
    >
      {S.isStarShaped() ? <p className="note">This polygon is star-shaped.</p> : !data ? <p className="note">Computing next(x) for 240 values of x…</p> : (
        <svg className="plot" viewBox={`0 0 ${W + padL + 20} ${H + padT + padB}`} onPointerDown={onPlotClick} style={{ cursor: 'crosshair' }}>
          <rect x={X(0)} y={Y(2)} width={W} height={H} fill="var(--strip-bg)" />
          {[0, 0.5, 1, 1.5, 2].map((y) => <g key={y}><line x1={X(0)} x2={X(1)} y1={Y(y)} y2={Y(y)} stroke="var(--grid)" /><text x={X(0) - 6} y={Y(y) + 4} fontSize={11} textAnchor="end" fill="var(--muted)">{y}</text></g>)}
          {Array.from({ length: P.n }, (_, i) => <line key={i} x1={X(P.arcLength(i) / data.L)} x2={X(P.arcLength(i) / data.L)} y1={Y(2)} y2={Y(0)} stroke="var(--grid)" />)}
          <line x1={X(0)} y1={Y(0)} x2={X(1)} y2={Y(1)} stroke="var(--muted)" strokeDasharray="3 4" />
          <line x1={X(0)} y1={Y(1)} x2={X(1)} y2={Y(2)} stroke="var(--muted)" strokeDasharray="3 4" />
          <path d={data.pts.map((p, i) => `${i ? 'L' : 'M'}${X(p.x)},${Y(p.y)}`).join(' ')} fill="none" stroke="#1d4ed8" strokeWidth={2} />
          {rev && rev.guards.map((G, i) => {
            // guard i starts at a_i and reaches next(a_i); on the plot (x reduced to one turn) this is the
            // vertical segment from the diagonal (x, x) up to the graph (x, next(x)).
            const sa = P.arcLength(G.a) / data.L;
            const off = Math.floor(sa + 1e-9);
            const xa = sa - off;
            const yb = P.arcLength(G.reach !== undefined ? G.reach : G.b) / data.L - off;
            return (
              <g key={i}>
                <line x1={X(xa)} x2={X(xa)} y1={Y(xa)} y2={Y(Math.min(2, yb))} stroke={colorOf(i)} strokeWidth={2.5} />
                <circle cx={X(xa)} cy={Y(Math.min(2, yb))} r={4} fill={colorOf(i)} />
                <circle cx={X(xa)} cy={Y(xa)} r={3.2} fill="white" stroke={colorOf(i)} strokeWidth={2} />
                <text x={X(xa) + 5} y={Y(xa) + 14} fontSize={11} fill={colorOf(i)} fontWeight={700}>{`x${i}`}</text>
              </g>
            );
          })}
          {data.pts.map((p, i) => <rect key={i} x={X(p.x)} y={Y(0) + 18} width={W / data.pts.length + 0.6} height={14} fill={p.size === k ? '#16a34a' : '#ea580c'} />)}
          {S.startPoints().map((s, i) => <line key={i} x1={X(P.arcLength(s.u) / data.L)} x2={X(P.arcLength(s.u) / data.L)} y1={Y(0) + 34} y2={Y(0) + 44} stroke="#0f766e" strokeWidth={1.5} />)}
          <line x1={X(x0)} x2={X(x0)} y1={Y(2)} y2={Y(0) + 46} stroke="var(--ink)" strokeWidth={1.2} strokeDasharray="2 2" />
          <text x={X(0)} y={Y(0) + 62} fontSize={11} fill="var(--muted)">x (fraction of the perimeter, from v0)</text>
          <text x={X(1)} y={Y(0) + 62} fontSize={11} fill="var(--muted)" textAnchor="end">greedy size: green = k = {k}, orange = k + 1</text>
        </svg>
      )}
      {data && rev && (
        <Stage P={P} height={260}>
          <PolygonView P={P} />
          {rev.guards.map((G, i) => <g key={i}><Chain a={G.a} b={G.b} color={colorOf(i)} width={7} /><Seg a={G.g} b={P.at(G.a)} stroke={colorOf(i)} dash="4 4" /><Seg a={G.g} b={P.at(G.b)} stroke={colorOf(i)} dash="4 4" /></g>)}
          {rev.guards.map((G, i) => <Dot key={i} p={G.g} r={6} fill={colorOf(i)} />)}
          <BoundaryTicks ts={[rev.u]} color="var(--ink)" r={6} />
        </Stage>
      )}
      {rev && <p className="note">The revolution of <M>x_0</M> needs {rev.guards.length} guard{rev.guards.length > 1 ? 's' : ''} (optimum <M>{`k = ${k}`}</M>).</p>}
    </Widget>
  );
}
