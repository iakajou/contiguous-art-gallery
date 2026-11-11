import React, { useMemo, useState, useEffect } from 'react';
import { Stage, PolygonView, Region, Chain, Handle, BoundaryHandle, InfLine, Seg, Dot } from '../components/svg.jsx';
import { Widget, PresetPicker, Toggle, presetPolygon, solverFor, M, Check } from '../components/ui.jsx';
import { coreOfEdges, edgesOfChain, pointInConvex } from '../geometry/core.js';
import { seesChain, unseenParts } from '../geometry/visibility.js';
import { defaultGuard, insideOf } from '../components/helpers.js';
import { mod } from '../geometry/polygon.js';
import { sub } from '../geometry/vec.js';

/** Section 2.1: visibility cores, Observations 2.1 and 2.2. */
export default function CoreWidget() {
  const [preset, setPreset] = useState('ushape');
  const P = presetPolygon(preset);
  const S = solverFor(P);
  const [u, setU] = useState(0.5);
  const [v, setV] = useState(3.5);
  const [whole, setWhole] = useState(false);
  const startGuard = (u0, v0) => {
    const C = coreOfEdges(P, edgesOfChain(P, u0, u0 + mod(v0 - u0, P.n))).filter((p) => !p.artificial);
    if (C.length >= 3) {
      const c = C.reduce((acc, p) => ({ x: acc.x + p.x / C.length, y: acc.y + p.y / C.length }), { x: 0, y: 0 });
      if (P.contains(c)) return c;
    }
    return defaultGuard(P);
  };
  const [g, setG] = useState(() => startGuard(0.5, 3.5));
  useEffect(() => { const v0 = Math.min(P.n - 0.5, 3.5); setU(0.5); setV(v0); setWhole(false); setG(startGuard(0.5, v0)); }, [preset]);

  const a = whole ? 0 : u;
  const b = whole ? P.n : u + mod(v - u, P.n);
  const E = useMemo(() => edgesOfChain(P, a, b), [P, a, b]);
  const PE = useMemo(() => coreOfEdges(P, E), [P, E]);
  const empty = PE.length < 3;
  const bounded = !empty && PE.every((p) => !p.artificial);
  const vis = S.vis(g);
  const sees = whole ? vis.full : seesChain(vis, a, b, P.n);
  const unseen = whole ? (vis.full ? [] : unseenParts(vis, 0, P.n, P.n)) : unseenParts(vis, a, b, P.n);
  const inCore = !empty && pointInConvex(PE, g, 1e-6);

  return (
    <Widget
      tag="Figure 2" id="fig-2"
      title="The visibility core of a chain"
      controls={<>
        <PresetPicker value={preset} onChange={setPreset} ids={['ushape', 'star', 'notch', 'dumbbell', 'zigzag']} />
        <Toggle checked={whole} onChange={setWhole}>whole boundary (kernel)</Toggle>
      </>}
      caption={<>
        Move the square handles <M>u</M> and <M>v</M> to choose a chain <M>[u,v]</M>; dashed lines are the supporting lines
        of the edges <M>E</M> met by the open chain <M>(u,v)</M>, and the green region is their visibility core <M>P_E</M>{' '}
        (the points left of all of them). Drag <M>g</M>: whenever <M>g</M> sees the whole chain, it is inside <M>P_E</M>{' '}
        (Observation 2.1). With the whole boundary selected, <M>P_E</M> is the kernel of <M>P</M>: it is non-empty exactly
        when one guard suffices (Observation 2.2).
      </>}
    >
      <Stage P={P}>
        {E.map((i) => { const [p, q] = P.edge(i); return <InfLine key={i} p={p} dir={sub(q, p)} />; })}
        <PolygonView P={P} />
        {!empty && <Region pts={PE} />}
        <Chain a={a} b={b} color="#16a34a" width={7} />
        {unseen.map((c, i) => <Chain key={i} a={c.a} b={c.b} color="#dc2626" width={7} />)}
        {!whole && <>
          <Seg a={g} b={P.at(a)} stroke="var(--muted)" dash="3 4" />
          <Seg a={g} b={P.at(b)} stroke="var(--muted)" dash="3 4" />
        </>}
        {!whole && <BoundaryHandle t={u} onChange={setU} label="u" color="var(--ink)" />}
        {!whole && <BoundaryHandle t={v} onChange={setV} label="v" color="var(--ink)" />}
        <Handle p={g} onChange={setG} constrain={insideOf(P)} color={sees ? '#16a34a' : '#dc2626'} label="g" />
      </Stage>
      <ul className="checks">
        <Check ok={!empty}>{whole ? <>the kernel of <M>P</M> is {empty ? 'empty' : 'non-empty'} {empty ? <>(<M>P</M> is not star-shaped, so <M>k \ge 2</M>)</> : <>(<M>P</M> is star-shaped, <M>k = 1</M>)</>}</> : <>the core <M>P_E</M> of the {E.length} edge{E.length > 1 ? 's' : ''} met by <M>(u,v)</M> is {empty ? 'empty: no guard can see this chain' : bounded ? 'non-empty (bounded)' : 'non-empty (unbounded)'}</>}</Check>
        <Check ok={inCore}><M>g</M> {inCore ? 'lies' : 'does not lie'} in <M>P_E</M></Check>
        <Check ok={sees}><M>g</M> {sees ? 'sees' : 'does not see'} the whole chain{!sees && inCore ? ' (being in P_E is necessary, but not sufficient)' : ''}</Check>
      </ul>
    </Widget>
  );
}
