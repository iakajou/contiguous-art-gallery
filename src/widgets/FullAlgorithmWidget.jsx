import React, { useMemo, useState, useEffect } from 'react';
import { Stage, PolygonView, Chain, Dot, Seg, colorOf } from '../components/svg.jsx';
import { Widget, PresetPicker, Button, presetPolygon, solverFor, M, Badge } from '../components/ui.jsx';
import { randomPolygon } from '../geometry/generate.js';
import { mod } from '../geometry/polygon.js';

/** Section 2.9: the whole algorithm (Theorem 7.1). */
export default function FullAlgorithmWidget() {
  const [preset, setPreset] = useState('gallery');
  const [rand, setRand] = useState(null);
  const [n, setN] = useState(18);
  const P = rand || presetPolygon(preset);
  const S = solverFor(P);
  const [sel, setSel] = useState(null);
  const [res, setRes] = useState(null);
  const [busy, setBusy] = useState(false);
  useEffect(() => {
    setSel(null); setRes(null); setBusy(true);
    const id = setTimeout(() => { setRes(S.solve({ exhaustive: true })); setBusy(false); }, 30);
    return () => clearTimeout(id);
  }, [S]);

  const newRandom = () => {
    for (let t = 0; t < 30; t++) {
      const Q = randomPolygon(n, { seed: Math.floor(Math.random() * 1e9) });
      if (Q) { setRand(Q); return; }
    }
  };

  const run = useMemo(() => {
    if (!res || res.starShaped) return null;
    if (sel === null) return { u: res.bestStart, guards: res.guards };
    return S.greedy(res.runs[sel].u);
  }, [res, sel, S]);

  const hist = {};
  if (res && !res.starShaped) for (const r of res.runs) hist[r.size] = (hist[r.size] || 0) + 1;
  const total = res && res.runs ? res.runs.length : 0;

  const onDown = (q) => {
    if (!res || res.starShaped) return;
    let best = -1, bd = Infinity;
    res.runs.forEach((r, i) => { const p = P.at(r.u); const d = Math.hypot(p.x - q.x, p.y - q.y); if (d < bd) { bd = d; best = i; } });
    setSel(bd < 0.03 * P.diam ? best : null);
  };

  return (
    <Widget
      tag="Figure 10" id="fig-10"
      title="The complete algorithm (Theorem 7.1)"
      controls={<>
        <PresetPicker value={rand ? '' : preset} onChange={(v) => { setRand(null); setPreset(v); }} ids={['gallery', 'comb', 'dumbbell', 'zigzag', 'ushape', 'badpair']} />
        <label className="ctl"><span>n</span><input type="range" min={8} max={40} value={n} onChange={(e) => setN(Number(e.target.value))} /><span className="num">{n}</span></label>
        <Button onClick={newRandom}>Random polygon</Button>
      </>}
      caption={<>
        The algorithm runs the greedy algorithm once from every start point of <M>U_P</M> and keeps the smallest solution.
        Each mark on the boundary is a start point, coloured by the size of its greedy solution:{' '}
        <span style={{ color: '#16a34a', fontWeight: 700 }}>green = k</span>, <span style={{ color: '#ea580c', fontWeight: 700 }}>orange = k+1</span>.
        By Theorem 7.1 there are never other values, and by Theorem 5.4 at least one mark is green. Click a mark to see its greedy solution.
      </>}
    >
      <Stage P={P} onBackgroundDown={onDown} cursor="pointer">
        <PolygonView P={P} />
        {run && run.guards.map((G, i) => (
          <g key={i}>
            <Chain a={G.a} b={G.b} color={colorOf(i)} width={7} />
            <Seg a={G.g} b={P.at(G.a)} stroke={colorOf(i)} dash="4 4" />
            <Seg a={G.g} b={P.at(G.b)} stroke={colorOf(i)} dash="4 4" />
          </g>
        ))}
        {res && res.starShaped && <Dot p={res.guards[0].g} r={8} fill="#2563eb" label="kernel guard" />}
        {res && !res.starShaped && res.runs.map((r, i) => (
          <Dot key={i} p={P.at(r.u)} r={i === sel ? 7 : 4.2} fill={r.size === res.k ? '#16a34a' : '#ea580c'} stroke="white" />
        ))}
        {run && run.guards.map((G, i) => <Dot key={i} p={G.g} r={7} fill={colorOf(i)} label={`g${i + 1}`} />)}
        {run && <Dot p={P.at(run.u)} r={9} fill="none" stroke="var(--ink)" strokeWidth={2.5} />}
      </Stage>
      {busy && <p className="note">Computing…</p>}
      {res && (
        <div className="stats">
          <span><M>n</M> = {P.n}</span>
          <span><strong>k = {res.k}</strong>{res.starShaped ? ' (star-shaped: kernel non-empty)' : ''}</span>
          {!res.starShaped && <>
            <span>vertices of <M>C_P</M> in <M>P</M>: {res.arrangement.length}</span>
            <span><M>|G_P|</M> = {res.candidates.length}</span>
            <span><M>|U_P|</M> = {total}</span>
            <span>greedy runs of size k: {hist[res.k] || 0}, of size k+1: {hist[res.k + 1] || 0}</span>
            <span>calls to next: {res.stats.nextCalls}</span>
          </>}
        </div>
      )}
      {res && !res.starShaped && run && <p className="note">Showing the greedy solution from {sel === null ? 'the best start point' : 'the selected start point'}: {run.guards.length} guards {run.guards.length === res.k ? <Badge kind="good">optimal</Badge> : <Badge kind="bad">k + 1</Badge>}</p>}
    </Widget>
  );
}

export { mod };
