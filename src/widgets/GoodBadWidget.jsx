import React, { useMemo, useState, useEffect } from 'react';
import { Stage, PolygonView, Chain, Dot, Seg, Handle, BoundaryHandle, AngleArc, Polyline } from '../components/svg.jsx';
import { Widget, PresetPicker, Button, presetPolygon, solverFor, M, Check, Badge, deg } from '../components/ui.jsx';
import { classifyGuard } from '../geometry/solver.js';
import { chainThrough, seesChain, unseenParts } from '../geometry/visibility.js';
import { verticesIn } from '../geometry/proofs.js';
import { insideOf, defaultGuard } from '../components/helpers.js';
import { mod } from '../geometry/polygon.js';

const START = {
  notch: { g: { x: 497, y: 456 }, m: 0.5 },
  badpair: { g: { x: 460, y: 171 }, m: 4.5 },
  ushape: { g: { x: 500, y: 200 }, m: 0.5 },
  comb: { g: { x: 500, y: 180 }, m: 0.5 },
  gallery: { g: { x: 600, y: 300 }, m: 0.5 },
};

function maximal(S, P, g, m) {
  const ch = chainThrough(S.vis(g), m, P.n);
  return ch ? { u: mod(ch.a, P.n), v: mod(ch.b, P.n), full: !!ch.full } : null;
}

/** Section 2.3: good and bad guards (Definition 4.1). */
export default function GoodBadWidget() {
  const [preset, setPreset] = useState('notch');
  const P = presetPolygon(preset);
  const S = solverFor(P);
  const init = () => {
    const st = START[preset] || { g: defaultGuard(P), m: 0.5 };
    const g = P.contains(st.g) ? st.g : defaultGuard(P);
    const ch = maximal(S, P, g, st.m) || maximal(S, P, g, 0.5) || { u: 0.2, v: 0.8 };
    return { g, u: ch.u, v: ch.v };
  };
  const [st, setSt] = useState(init);
  useEffect(() => { setSt(init()); }, [preset]);
  const { g, u } = st;
  const v = u + mod(st.v - u, P.n);

  const cls = classifyGuard(P, g, u, v);
  const vis = S.vis(g);
  const contiguous = seesChain(vis, u, v, P.n);
  const unseen = unseenParts(vis, u, v, P.n);
  const path = useMemo(() => S.sp.path(P.at(u), P.at(v)), [S, P, u, v]);
  const inner = verticesIn(u, v);

  const maximise = () => {
    const ch = maximal(S, P, g, (u + v) / 2);
    if (ch && !ch.full) setSt({ ...st, u: ch.u, v: ch.v });
  };

  return (
    <Widget
      tag="Figure 4" id="fig-4"
      title="Good and bad guards"
      controls={<PresetPicker value={preset} onChange={setPreset} ids={['notch', 'badpair', 'ushape', 'comb', 'gallery']} />}
      caption={<>
        A contiguous guard <M>(g,[u,v])</M> is <strong>bad</strong> when it satisfies the four conditions of Definition 4.1,
        and <strong>good</strong> otherwise. The orange arc is the angle <M>\angle(u,g,v)</M> swept counter-clockwise from{' '}
        <M>u</M> to <M>v</M>; the purple dashed path is the shortest path from <M>u</M> to <M>v</M> inside <M>P</M>.
        A bad guard looks "around a corner": it sees more than a half-turn of boundary while <M>u</M> and <M>v</M> cannot
        see each other.
      </>}
    >
      <div className="row-buttons">
        <Button onClick={maximise}>Extend to the maximal chain</Button>
        <span className="verdict">{!contiguous ? <Badge kind="no">not a contiguous guard: g does not see the whole chain</Badge> : cls.bad ? <Badge kind="bad">BAD guard</Badge> : <Badge kind="good">GOOD guard</Badge>}</span>
      </div>
      <Stage P={P}>
        <PolygonView P={P} />
        <Chain a={u} b={v} color={cls.bad ? '#ea580c' : '#2563eb'} width={7} />
        {unseen.map((c, i) => <Chain key={i} a={c.a} b={c.b} color="#dc2626" width={7} />)}
        {cls.II && <AngleArc g={g} a={P.at(u)} b={P.at(v)} radius={36} />}
        <Seg a={g} b={P.at(u)} stroke="var(--muted)" dash="4 4" />
        <Seg a={g} b={P.at(v)} stroke="var(--muted)" dash="4 4" />
        {path && <Polyline pts={path.pts} stroke="#7c3aed" width={2.5} dash="7 5" />}
        {inner.map((k) => <Dot key={k} p={P.at(k)} r={4.5} fill="var(--ink)" />)}
        <BoundaryHandle t={u} onChange={(t) => setSt({ ...st, u: t })} label="u" />
        <BoundaryHandle t={st.v} onChange={(t) => setSt({ ...st, v: t })} label="v" />
        <Handle p={g} onChange={(q) => setSt({ ...st, g: q })} constrain={insideOf(P)} color="#dc2626" label="g" />
      </Stage>
      <ul className="checks">
        <Check ok={cls.I}>(I) the open chain <M>(u,v)</M> contains a vertex of <M>P</M> ({inner.length} {inner.length === 1 ? 'vertex' : 'vertices'})</Check>
        <Check ok={cls.II}>(II) <M>{'u \\neq g'}</M> and <M>{'v \\neq g'}</M></Check>
        <Check ok={cls.III}>(III) <M>{'\\angle(u,g,v) > \\pi'}</M> (here {cls.angle !== null ? deg(cls.angle) : '–'})</Check>
        <Check ok={cls.IV}>(IV) the shortest path from <M>u</M> to <M>v</M> is not a single segment {path ? `(${path.pts.length - 1} segment${path.pts.length > 2 ? 's' : ''})` : ''}</Check>
      </ul>
    </Widget>
  );
}
