import React, { useMemo, useState, useEffect } from 'react';
import { Stage, PolygonView, Chain, Dot, Seg, Handle, BoundaryHandle, Polyline, Ray, Label, InfLine } from '../components/svg.jsx';
import { Widget, PresetPicker, presetPolygon, solverFor, M, Stepper, Badge } from '../components/ui.jsx';
import { maximalChainLemma62 } from '../geometry/proofs.js';
import { insideOf, defaultGuard } from '../components/helpers.js';
import { mod } from '../geometry/polygon.js';
import { sub } from '../geometry/vec.js';

const START = {
  gallery: { g: { x: 140, y: 140 }, m: 5.5 },
  ushape: { g: { x: 340, y: 140 }, m: 0.5 },
  comb: { g: { x: 660, y: 180 }, m: 0.5 },
  zigzag: { g: { x: 430, y: 200 }, m: 1.5 },
  dumbbell: { g: { x: 450, y: 350 }, m: 0.4 },
};

/** Section 2.7: Lemma 6.2, the maximal chain seen by g through m via shortest paths and ray shooting. */
export default function Lemma62Widget() {
  const [preset, setPreset] = useState('gallery');
  const P = presetPolygon(preset);
  const S = solverFor(P);
  const init = () => { const s0 = START[preset] || { g: defaultGuard(P), m: 0.5 }; return { g: P.contains(s0.g) ? s0.g : defaultGuard(P), m: s0.m }; };
  const [st, setSt] = useState(init);
  const [step, setStep] = useState(3);
  useEffect(() => { setSt(init()); setStep(3); }, [preset]);
  const { g, m } = st;
  const L = useMemo(() => maximalChainLemma62(P, S, g, m), [P, S, g, m]);
  const visible = P.segInside(g, P.at(m));

  const agree = L && !L.full && L.u !== null && L.v !== null && L.ref &&
    Math.abs(mod(L.u - L.ref.a + 0.5, P.n) - 0.5) < 1e-5 && Math.abs(mod(L.v - L.ref.b + 0.5, P.n) - 0.5) < 1e-5;

  const steps = [
    { title: <>The edge set <M>{'E_{g,m}'}</M></>, body: <>Starting from the edge containing <M>m</M>, we walk along <M>\partial P</M> in both directions as long as <M>g</M> lies left of the supporting line of the edges (Definition 6.1). This gives the bold chain from the vertex <M>s</M> to the vertex <M>t</M>. By Observation 2.1, every chain seen by <M>g</M> through <M>m</M> is inside it.</> },
    { title: 'Shortest paths to g', body: <>Compute the shortest paths <M>\pi_s</M> (red) from <M>s</M> to <M>g</M> and <M>\pi_t</M> (blue) from <M>t</M> to <M>g</M>. Where they bend, they wrap around the reflex vertices that hide part of <M>[s,t]</M> from <M>g</M>.</> },
    { title: 'Shoot two rays', body: <>Shoot the ray <M>r_s</M> from <M>g</M> backwards along the last edge of <M>\pi_s</M>, and <M>r_t</M> along the last edge of <M>\pi_t</M>. They hit <M>[s,t]</M> at <M>u</M> and <M>v</M> (the hit closest to <M>m</M> on each side). </> },
    { title: <>The answer <M>[u,v]</M></>, body: <>The chain <M>[u,v]</M> is the unique maximal chain visible from <M>g</M> that contains <M>m</M> (inside <M>E</M>). With the data structures of Guibas–Hershberger (shortest paths) and Hershberger–Suri (ray shooting) this costs <M>O(\log n)</M> (Lemma 6.5).{' '}
      {agree ? <Badge kind="good">matches the visibility computation</Badge> : L && L.ref ? <Badge kind="no">differs from the reference</Badge> : null}</> },
  ];

  return (
    <Widget
      tag="Figure 8" id="fig-8"
      title="Lemma 6.2: the maximal visible chain through m"
      controls={<PresetPicker value={preset} onChange={setPreset} ids={['gallery', 'ushape', 'comb', 'zigzag', 'dumbbell']} />}
      caption={<>Drag <M>g</M> and <M>m</M>, then go through the steps. The construction only needs two shortest-path queries and two ray-shooting queries.</>}
    >
      <div className="split">
        <div className="split-fig">
          <Stage P={P}>
            {step === 0 && L && !L.full && L.E.map((i) => { const [a, b] = P.edge(i); return <InfLine key={i} p={a} dir={sub(b, a)} opacity={0.4} />; })}
            <PolygonView P={P} />
            {L && !L.full && <Chain a={L.s} b={L.t} color="var(--ink)" width={5} opacity={0.7} />}
            {L && !L.full && <>
              <Dot p={L.ps} r={6} fill="#dc2626" label="s" labelOffset={[-18, 10]} />
              <Dot p={L.pt} r={6} fill="#2563eb" label="t" labelOffset={[8, 10]} />
            </>}
            {L && !L.full && step >= 1 && <>
              <Polyline pts={L.piS.pts} stroke="#dc2626" width={3} />
              <Polyline pts={L.piT.pts} stroke="#2563eb" width={3} />
            </>}
            {L && !L.full && step >= 2 && <>
              <Ray p={g} dir={L.rs.dir} to={L.rs.hit ? L.rs.hit.p : null} stroke="#dc2626" dash="2 5" width={2} />
              <Ray p={g} dir={L.rt.dir} to={L.rt.hit ? L.rt.hit.p : null} stroke="#2563eb" dash="2 5" width={2} />
            </>}
            {L && !L.full && step >= 3 && L.u !== null && L.v !== null && <Chain a={L.u} b={L.u + mod(L.v - L.u, P.n)} color="#16a34a" width={8} />}
            {L && !L.full && step >= 2 && L.rs.hit && <Dot p={L.rs.hit.p} r={6} fill="#16a34a" label="u" labelOffset={[-18, -16]} />}
            {L && !L.full && step >= 2 && L.rt.hit && <Dot p={L.rt.hit.p} r={6} fill="#16a34a" label="v" labelOffset={[8, -16]} />}
            <BoundaryHandle t={m} onChange={(t) => setSt({ ...st, m: t })} label="m" color="var(--muted)" />
            <Handle p={g} onChange={(q) => setSt({ ...st, g: q })} constrain={insideOf(P)} color="#dc2626" label="g" />
          </Stage>
        </div>
        <div className="split-text">
          {!visible ? <p className="note"><M>g</M> does not see <M>m</M>: move one of them.</p>
            : L && L.full ? <p className="note"><M>g</M> is left of every edge: it sees the whole boundary.</p>
              : <Stepper steps={steps} step={step} setStep={setStep} />}
        </div>
      </div>
    </Widget>
  );
}
