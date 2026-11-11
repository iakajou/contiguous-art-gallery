import React, { useMemo, useState, useEffect } from 'react';
import { Stage, PolygonView, Chain, Dot, Seg, InfLine, BoundaryTicks, Label, colorOf } from '../components/svg.jsx';
import { Widget, PresetPicker, Toggle, presetPolygon, solverFor, M } from '../components/ui.jsx';
import { sub, dist } from '../geometry/vec.js';
import { mod } from '../geometry/polygon.js';

/** Section 2.5: the arrangement C_P, the candidate guards G_P and the start points U_P. */
export default function ArrangementWidget() {
  const [preset, setPreset] = useState('gallery');
  const P = presetPolygon(preset);
  const S = solverFor(P);
  const [sel, setSel] = useState(null);
  const [lines, setLines] = useState(true);
  useEffect(() => setSel(null), [preset]);

  const arr = S.arrangement();
  const GP = S.candidateGuards();
  const UP = S.startPoints();
  const starShaped = S.isStarShaped();
  const c = sel !== null ? arr[sel] : null;
  const cGuards = useMemo(() => (c ? GP.filter((G) => dist(G.g, c.p) < 1e-7) : []), [c, GP]);

  const onDown = (q) => {
    let best = -1, bd = Infinity;
    arr.forEach((a, i) => { const d = dist(a.p, q); if (d < bd) { bd = d; best = i; } });
    setSel(bd < 0.04 * P.diam ? best : null);
  };

  const ends = c ? [...new Set(c.edges.flatMap((e) => [mod(e, P.n), mod(e + 1, P.n)]))] : [];
  const names = ['a', 'b', 'e', 'f', 'h', 'i'];

  return (
    <Widget
      tag="Figure 6" id="fig-6"
      title={<>The arrangement <M>C_P</M>, the candidate guards <M>G_P</M> and the start points <M>U_P</M></>}
      controls={<>
        <PresetPicker value={preset} onChange={setPreset} ids={['gallery', 'ushape', 'dumbbell', 'comb', 'zigzag', 'badpair']} />
        <Toggle checked={lines} onChange={setLines}>supporting lines</Toggle>
      </>}
      caption={<>
        Dashed: the supporting lines of the edges of <M>P</M>; black dots: the vertices of their arrangement <M>C_P</M> inside <M>P</M>.{' '}
        <strong> Click on a vertex</strong> <M>c</M>: its two defining edges are highlighted, and for every endpoint <M>x</M> of these edges
        that <M>c</M> sees, the unique maximal chain <M>[u_x, v_x]</M> containing <M>x</M> is a candidate guard of <M>G_P</M>{' '}
        (Definition 5.1). Teal marks on the boundary: the start points <M>U_P</M> (all vertices of <M>P</M> and all <M>u_x</M>, Definition 5.2).
      </>}
    >
      <Stage P={P} onBackgroundDown={onDown} cursor="pointer">
        {lines && Array.from({ length: P.n }, (_, i) => { const [a, b] = P.edge(i); return <InfLine key={i} p={a} dir={sub(b, a)} opacity={0.45} />; })}
        <PolygonView P={P} />
        {c && c.edges.map((e) => { const [a, b] = P.edge(e); return <g key={e}><InfLine p={a} dir={sub(b, a)} stroke="#0f766e" dash="0" width={1.6} /><Seg a={a} b={b} stroke="#0f766e" width={5} /></g>; })}
        {cGuards.map((G, i) => (
          <g key={i}>
            <Chain a={G.a} b={G.b} color={colorOf(i)} width={7 + 3 * (cGuards.length - 1 - i)} opacity={0.75} />
            <Dot p={P.at(G.a)} r={6} fill={colorOf(i)} label={`u${i + 1}`} labelOffset={[-22, 10]} />
          </g>
        ))}
        {!starShaped && <BoundaryTicks ts={UP.map((x) => x.u)} />}
        {arr.map((a, i) => <Dot key={i} p={a.p} r={i === sel ? 7 : 3.2} fill={i === sel ? '#dc2626' : 'var(--ink)'} />)}
        {c && ends.map((x, i) => <Label key={x} p={P.v(x)} text={names[i] || 'x'} dx={6} dy={-16} color="#0f766e" />)}
        {c && <Label p={c.p} text="c" dx={10} dy={10} color="#dc2626" />}
      </Stage>
      <div className="stats">
        <span><M>n</M> = {P.n}</span>
        <span>vertices of <M>C_P</M> in <M>P</M>: {arr.length} (at most <M>{`\\binom{n}{2} = ${(P.n * (P.n - 1)) / 2}`}</M>)</span>
        <span><M>|G_P|</M> = {GP.length}</span>
        <span><M>|U_P|</M> = {starShaped ? '– (star-shaped)' : UP.length}</span>
      </div>
      {c && <p className="note">Selected <M>c</M>: defining edges {c.edges.map((e) => `e${e}`).join(', ')}; it contributes {cGuards.length} candidate guard{cGuards.length === 1 ? '' : 's'} to <M>G_P</M>{cGuards.length === 0 ? ' (it sees none of the endpoints of its defining edges)' : ''}.</p>}
    </Widget>
  );
}
