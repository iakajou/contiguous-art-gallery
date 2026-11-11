import React, { useMemo, useState, useEffect } from 'react';
import { Stage, PolygonView, Region, Chain, Handle, Dot, colorOf, Seg } from '../components/svg.jsx';
import { Widget, PresetPicker, Toggle, presetPolygon, solverFor, solutionFor, M } from '../components/ui.jsx';
import { visibilityPolygon, chainThrough } from '../geometry/visibility.js';
import { defaultGuard, insideOf } from '../components/helpers.js';
import { inChain } from '../geometry/polygon.js';

/** Part 1: what a contiguous guard is. */
export default function Playground() {
  const [preset, setPreset] = useState('ushape');
  const P = presetPolygon(preset);
  const S = solverFor(P);
  const [g, setG] = useState(() => defaultGuard(P));
  const [pick, setPick] = useState(null); // boundary parameter selecting one visible chain
  const [showOpt, setShowOpt] = useState(false);
  useEffect(() => { setG(defaultGuard(P)); setPick(null); }, [preset]);

  const vis = S.vis(g);
  const vp = useMemo(() => visibilityPolygon(P, g), [P, g]);
  const sol = useMemo(() => (showOpt ? solutionFor(P) : null), [P, showOpt]);
  let selected = null;
  if (pick !== null) selected = chainThrough(vis, pick, P.n);
  if (!selected && !vis.full && vis.chains.length) {
    // default: the longest visible chain
    let best = null;
    for (const c of vis.chains) if (!best || P.arcLength(c.b) - P.arcLength(c.a) > P.arcLength(best.b) - P.arcLength(best.a)) best = c;
    selected = best;
  }
  if (vis.full) selected = { a: 0, b: P.n };

  const onDown = (q) => {
    const cb = P.closestBoundary(q);
    if (cb.d < 0.03 * P.diam) {
      if (vis.full || vis.chains.some((c) => inChain(cb.t, c.a, c.b, P.n))) setPick(cb.t);
    }
  };

  return (
    <Widget
      tag="Figure 1" id="fig-1"
      title="A contiguous guard"
      controls={<>
        <PresetPicker value={preset} onChange={setPreset} ids={['ushape', 'dumbbell', 'notch', 'star', 'gallery']} />
        <Toggle checked={showOpt} onChange={setShowOpt}>show an optimal solution</Toggle>
      </>}
      caption={<>
        Drag the guard <M>g</M>. The yellow region is its visibility polygon and the light blue pieces of
        the boundary are the <em>maximal chains</em> it sees. A contiguous guard has to pick <strong>one</strong> of
        them (click on a light blue piece to choose it). {vis.full
          ? <>Here <M>g</M> sees the whole boundary: the polygon is star-shaped and one guard suffices.</>
          : <>Here <M>g</M> sees {vis.chains.length} maximal chain{vis.chains.length > 1 ? 's' : ''}.</>}
      </>}
    >
      <Stage P={P} onBackgroundDown={onDown}>
        <PolygonView P={P} />
        {!showOpt && <Region pts={vp} fill="rgba(250,204,21,0.28)" stroke="rgba(202,138,4,0.6)" width={1} />}
        {!showOpt && !vis.full && vis.chains.map((c, i) => <Chain key={i} a={c.a} b={c.b} color="#93c5fd" width={6} />)}
        {!showOpt && selected && <Chain a={selected.a} b={selected.b} color="#1d4ed8" width={7} />}
        {!showOpt && selected && !vis.full && <>
          <Seg a={g} b={P.at(selected.a)} stroke="#1d4ed8" dash="4 4" />
          <Seg a={g} b={P.at(selected.b)} stroke="#1d4ed8" dash="4 4" />
        </>}
        {sol && sol.guards.map((G, i) => (
          <g key={i}>
            <Chain a={G.a} b={G.b} color={colorOf(i)} width={7} />
            <Seg a={G.g} b={P.at(G.a)} stroke={colorOf(i)} dash="4 4" />
            <Seg a={G.g} b={P.at(G.b)} stroke={colorOf(i)} dash="4 4" />
            <Dot p={G.g} r={7} fill={colorOf(i)} label={`g${i + 1}`} />
          </g>
        ))}
        {!showOpt && <Handle p={g} onChange={setG} constrain={insideOf(P)} color="#dc2626" label="g" />}
      </Stage>
      {sol && <p className="note">Optimal number of contiguous guards for this polygon: <strong>k = {sol.k}</strong>. Each colour is one guard with its chain.</p>}
    </Widget>
  );
}
