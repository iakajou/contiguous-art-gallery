import React, { useMemo, useState, useEffect } from 'react';
import { Stage, PolygonView, Chain, Dot, Seg, Handle, BoundaryHandle, Region, InfLine, Polyline, Poly, Label } from '../components/svg.jsx';
import { Widget, PresetPicker, presetPolygon, solverFor, M, Badge } from '../components/ui.jsx';
import { chainThrough } from '../geometry/visibility.js';
import { replaceGoodGuard, lemma49 } from '../geometry/proofs.js';
import { insideOf, defaultGuard } from '../components/helpers.js';
import { sub } from '../geometry/vec.js';

const START = {
  gallery: { g: { x: 220, y: 420 }, m: 0.5 },
  ushape: { g: { x: 250, y: 200 }, m: 6.5 },
  notch: { g: { x: 497, y: 456 }, m: 0.5 },
  badpair: { g: { x: 460, y: 171 }, m: 4.5 },
  comb: { g: { x: 500, y: 180 }, m: 0.5 },
};

const LEMMA_TEXT = {
  '4.2': <>Condition (I) fails: <M>(u,v)</M> lies inside one edge <M>e</M>. Either endpoint of <M>e</M> sees the whole edge (Lemma 4.2).</>,
  '4.4': <>Condition (II) fails: <M>g = u</M>. Then <M>P_g</M> is the polygon bounded by <M>[u,v]</M> and <M>vu</M> (Lemma 4.4).</>,
  '4.5': <>Condition (III) fails: <M>{'\\angle(u,g,v) \\le \\pi'}</M>. The polygon <M>P_g</M> (grey) lies left of <M>gu</M> and <M>vg</M>,
    so any point of <M>{'P_E \\cap P_g'}</M> is in the kernel of <M>P_g</M> and sees all of <M>[u,v]</M> (Lemma 4.5).</>,
  '4.6': <>Condition (IV) fails: <M>u</M> sees <M>v</M>. Then <M>{'P_g \\subseteq P\''}</M>, the polygon bounded by <M>[u,v]</M> and
    the segment <M>vu</M>, and the same argument works inside <M>P'</M> (Lemma 4.6).</>,
};

const TYPE_TEXT = {
  'vertex of P_E inside P_g': <>a vertex of <M>P_E</M> lying in <M>P_g</M></>,
  'vertex of P in [u,v] inside P_E': <>a vertex of <M>P</M> on <M>[u,v]</M> lying in <M>P_E</M></>,
  'endpoint of the edge': <>an endpoint of the edge that contains <M>[u,v]</M></>,
};

/** Section 2.4: replacing good guards (Proposition 4.3, Lemmas 4.2-4.6) and bad guards (Lemma 4.9). */
export default function ReplaceWidget() {
  const [preset, setPreset] = useState('gallery');
  const P = presetPolygon(preset);
  const S = solverFor(P);
  const init = () => {
    const s0 = START[preset] || { g: defaultGuard(P), m: 0.5 };
    return { g: P.contains(s0.g) ? s0.g : defaultGuard(P), m: s0.m };
  };
  const [st, setSt] = useState(init);
  useEffect(() => { setSt(init()); }, [preset]);
  const { g, m } = st;
  const ch = chainThrough(S.vis(g), m, P.n);
  const u = ch ? ch.a : null, v = ch ? ch.b : null;
  const full = ch && ch.full;

  const R = useMemo(() => (ch && !full ? replaceGoodGuard(P, S, g, u, v) : null), [P, S, g, u, v, full]);
  const isBad = R && R.lemma === 'bad';
  const L49 = useMemo(() => (isBad ? lemma49(P, S, g, u, v) : null), [isBad, P, S, g, u, v]);

  let info = null;
  if (!ch) info = <p className="note">The point <M>m</M> is not visible from <M>g</M>. Move <M>m</M> or <M>g</M>.</p>;
  else if (full) info = <p className="note"><M>g</M> sees the whole boundary.</p>;
  else if (!isBad) {
    const c = R.chosen;
    info = (
      <div className="note">
        <Badge kind="good">GOOD guard</Badge> {LEMMA_TEXT[R.lemma]}{' '}
        {c ? <>The replacement guard <M>c</M> (star) is {TYPE_TEXT[c.type]}: the intersection of the supporting lines of two edges (dashed teal), i.e. a <strong>vertex of the arrangement</strong> <M>C_P</M>, and it sees all of <M>[u,v]</M>.</> : 'No replacement found (degenerate input).'}
        {' '}Candidates tested: {R.candidates.length} ({R.candidates.filter((x) => x.sees).length} see the chain).
      </div>
    );
  } else {
    const ok = (L49.gstar || []).find((x) => x.sees);
    const okv = (L49.coreVertices || []).find((x) => x.sees);
    info = (
      <div className="note">
        <Badge kind="bad">BAD guard</Badge> Here the proof uses Lemma 4.9. The shortest path <M>S_v</M> from <M>v</M> to <M>u</M> (red) is a
        convex chain; <M>{'\\ell_u'}</M> and <M>{'\\ell_v'}</M> support its last and first edges. The polygon <M>P_v</M> (grey) bounded by{' '}
        <M>[u,v]</M> and <M>S_v</M> has visibility core <M>{'P\' = P_E \\cap'}</M> (left of <M>{'\\ell_u'}</M> and <M>{'\\ell_v'}</M>) (dark green), which contains <M>g</M>.
        {ok ? <> The point where <M>{'\\ell_u'}</M> leaves <M>P_E</M> lies in <M>P'</M> and sees all of <M>[u,v]</M> (star).</> : okv ? <> A vertex of <M>P_E</M> inside <M>P'</M> sees all of <M>[u,v]</M> (star).</> : null}
        {' '}Unlike the good case, this point depends on <M>u</M> (through <M>{'\\ell_u'}</M>), so it cannot be precomputed.
      </div>
    );
  }

  const star = R && !isBad ? R.chosen : null;
  const star49 = L49 ? ((L49.gstar || []).find((x) => x.sees) || (L49.coreVertices || []).find((x) => x.sees)) : null;

  return (
    <Widget
      tag="Figure 5" id="fig-5"
      title="Replacing a guard by an arrangement vertex"
      controls={<PresetPicker value={preset} onChange={setPreset} ids={['gallery', 'notch', 'badpair', 'ushape', 'comb']} />}
      caption={<>
        Drag <M>g</M> and the square <M>m</M>; the guard is <M>(g,[u,v])</M> where <M>[u,v]</M> is the maximal chain seen by <M>g</M>{' '}
        through <M>m</M>. Green: the visibility core <M>P_E</M> of the edges met by <M>(u,v)</M>. For a good guard, Proposition 4.3 finds a
        vertex of <M>P_E</M> inside <M>P_g</M> (or a vertex of <M>P</M> on <M>[u,v]</M> inside <M>P_E</M>); it sees the same chain.
      </>}
    >
      <Stage P={P}>
        {star && star.lines.map((i) => { const [a, b] = P.edge(i); return <InfLine key={i} p={a} dir={sub(b, a)} stroke="#0f766e" dash="8 5" width={1.4} />; })}
        <PolygonView P={P} />
        {R && !isBad && R.lemma !== '4.2' && <Poly pts={R.Pg} fill="rgba(100,116,139,0.28)" stroke="var(--muted)" width={1} dash="3 3" />}
        {R && !isBad && R.lemma !== '4.2' && R.PE.length >= 3 && <Region pts={R.PE} />}
        {L49 && L49.Pv && <Poly pts={L49.Pv} fill="rgba(100,116,139,0.28)" stroke="var(--muted)" width={1} dash="3 3" />}
        {L49 && <Region pts={L49.PE} fill="rgba(22,163,74,0.12)" />}
        {L49 && L49.Pprime && L49.Pprime.length >= 3 && <Region pts={L49.Pprime} fill="rgba(21,128,61,0.45)" stroke="#166534" />}
        {L49 && L49.lu && <InfLine p={L49.lu.p} dir={L49.lu.dir} stroke="#b45309" dash="8 5" width={1.5} />}
        {L49 && L49.lv && <InfLine p={L49.lv.p} dir={L49.lv.dir} stroke="#b45309" dash="2 5" width={1.5} />}
        {L49 && L49.Sv && <Polyline pts={L49.Sv.pts} stroke="#dc2626" width={3} />}
        {ch && !full && <Chain a={u} b={v} color={isBad ? '#ea580c' : '#2563eb'} width={7} />}
        {ch && !full && <>
          <Seg a={g} b={P.at(u)} stroke="var(--muted)" dash="4 4" />
          <Seg a={g} b={P.at(v)} stroke="var(--muted)" dash="4 4" />
          <Label p={P.at(u)} text="u" dx={-16} dy={10} />
          <Label p={P.at(v)} text="v" dx={8} dy={10} />
        </>}
        {R && !isBad && R.candidates.map((c, i) => <Dot key={i} p={c.p} r={4.5} fill={c.sees ? '#16a34a' : '#dc2626'} />)}
        {L49 && (L49.gstar || []).map((x, i) => <Dot key={i} p={x.p} r={4.5} fill={x.sees ? '#16a34a' : '#94a3b8'} />)}
        {star && <Star p={star.p} label="c" />}
        {star49 && <Star p={star49.p} label="g*" />}
        <BoundaryHandle t={m} onChange={(t) => setSt({ ...st, m: t })} label="m" color="var(--muted)" />
        <Handle p={g} onChange={(q) => setSt({ ...st, g: q })} constrain={insideOf(P)} color="#dc2626" label="g" />
      </Stage>
      {info}
    </Widget>
  );
}

function Star({ p, label }) {
  const pts = [];
  for (let i = 0; i < 10; i++) {
    const r = i % 2 === 0 ? 15 : 6.5;
    const a = Math.PI / 2 + (i * Math.PI) / 5;
    pts.push({ x: p.x + r * Math.cos(a), y: p.y + r * Math.sin(a) });
  }
  return (
    <g>
      <Poly pts={pts} fill="#facc15" stroke="#854d0e" width={1.5} />
      <Label p={p} text={label} dx={12} dy={-14} />
    </g>
  );
}
