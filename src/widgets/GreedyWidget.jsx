import React, { useMemo, useState, useEffect } from 'react';
import { Stage, PolygonView, Chain, Dot, Seg, BoundaryHandle, colorOf } from '../components/svg.jsx';
import { Widget, PresetPicker, Toggle, Button, presetPolygon, solverFor, solutionFor, M } from '../components/ui.jsx';
import Strip from '../components/Strip.jsx';
import { mod, relFrom } from '../geometry/polygon.js';

/** Section 2.2: the greedy algorithm and the k + 1 bound. */
export default function GreedyWidget() {
  const [preset, setPreset] = useState('comb');
  const P = presetPolygon(preset);
  const S = solverFor(P);
  const [u, setU] = useState(0.35);
  const [shown, setShown] = useState(99);
  const [showOpt, setShowOpt] = useState(true);
  useEffect(() => { setU(0.35); setShown(99); }, [preset]);

  const run = useMemo(() => S.greedy(u), [S, u]);
  const opt = useMemo(() => solutionFor(P), [P]);
  const k = opt.k;
  const guards = run.guards.slice(0, shown);

  // optimal chains, starting with the one that contains u (index 0, as in the proof of Theorem 7.1)
  const optChains = useMemo(() => {
    const G = opt.guards;
    let i0 = G.findIndex((G0) => relFrom(u, G0.a, P.n) <= G0.b - G0.a + 1e-9);
    if (i0 < 0) i0 = 0;
    return G.map((_, i) => G[(i0 + i) % G.length]);
  }, [opt, u, P]);
  const startsOpt = optChains.some((G0) => Math.abs(relFrom(u, G0.a, P.n)) < 1e-6);

  const setStartToOpt = () => {
    const G0 = opt.guards[0];
    setU(mod(G0.a, P.n));
    setShown(99);
  };

  const rows = [
    { label: 'greedy', intervals: guards.map((G, i) => ({ a: G.a, b: G.b, color: colorOf(i), text: `${i + 1}` })) },
  ];
  if (showOpt) {
    rows.push({ label: 'optimal', intervals: optChains.map((G, i) => ({ a: G.a, b: G.b, color: '#64748b', opacity: 0.55 + 0.1 * (i % 2), text: startsOpt ? `${i + 1}` : `${i}` })) });
  }
  const done = shown >= run.guards.length;

  return (
    <Widget
      tag="Figure 3" id="fig-3"
      title="The greedy algorithm"
      controls={<>
        <PresetPicker value={preset} onChange={setPreset} ids={['comb', 'dumbbell', 'zigzag', 'gallery', 'ushape', 'badpair']} />
        <Toggle checked={showOpt} onChange={setShowOpt}>compare with an optimal solution</Toggle>
      </>}
      caption={<>
        Drag the start point <M>u</M> along the boundary. Each greedy step adds the guard that sees the longest chain{' '}
        <M>[u_i, v_i]</M> starting where the previous one stopped (the value <M>{'v_i = \\mathrm{next}(u_i)'}</M>). In the strip
        below, the boundary is cut open at <M>u</M>: greedy chain <M>i</M> always ends at or after the end of optimal chain{' '}
        <M>i-1</M> ("greedy stays ahead"), which is why greedy never needs more than <M>k+1</M> guards, and only <M>k</M> when
        it starts at the beginning of an optimal chain.
      </>}
    >
      <div className="row-buttons">
        <Button onClick={() => setShown(0)}>Reset</Button>
        <Button onClick={() => setShown(Math.min(run.guards.length, shown + 1))} disabled={done} kind="primary">Step</Button>
        <Button onClick={() => setShown(99)} disabled={done}>Run to the end</Button>
        <Button onClick={setStartToOpt}>Start at an optimal chain</Button>
      </div>
      <Stage P={P}>
        <PolygonView P={P} />
        {guards.map((G, i) => (
          <g key={i}>
            <Chain a={G.a} b={G.b} color={colorOf(i)} width={7} />
            <Seg a={G.g} b={P.at(G.a)} stroke={colorOf(i)} dash="4 4" />
            <Seg a={G.g} b={P.at(G.b)} stroke={colorOf(i)} dash="4 4" />
          </g>
        ))}
        {guards.map((G, i) => <Dot key={i} p={G.g} r={7} fill={colorOf(i)} label={`g${i + 1}`} />)}
        {guards.map((G, i) => <Dot key={`e${i}`} p={P.at(G.b)} r={4} fill="white" stroke={colorOf(i)} strokeWidth={2.5} />)}
        <BoundaryHandle t={u} onChange={(t) => { setU(t); }} label="u" color="var(--ink)" />
      </Stage>
      <Strip P={P} u={u} rows={rows} />
      <p className="note">
        {done
          ? <>Greedy from this <M>u</M> uses <strong>{run.guards.length}</strong> guard{run.guards.length > 1 ? 's' : ''}; the optimum is <strong>k = {k}</strong>.{' '}
            {run.guards.length === k ? (startsOpt ? 'It starts at the beginning of an optimal chain, so it is optimal.' : 'This start point happens to be good.') : 'This start point is not good enough: one guard too many.'}</>
          : <>Step {shown} of {run.guards.length}.</>}
      </p>
    </Widget>
  );
}
