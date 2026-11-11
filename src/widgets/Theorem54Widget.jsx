import React, { useMemo, useState, useEffect } from 'react';
import { Stage, PolygonView, Chain, Dot, Seg, AngleArc, Label, colorOf, InfLine, BoundaryTicks } from '../components/svg.jsx';
import { Widget, PresetPicker, presetPolygon, solverFor, solutionFor, M, Stepper, Badge } from '../components/ui.jsx';
import { theorem54 } from '../geometry/proofs.js';
import { PRESETS } from '../geometry/presets.js';
import { sub } from '../geometry/vec.js';

/** Section 2.6: Theorem 5.4, step by step. */
export default function Theorem54Widget() {
  const [preset, setPreset] = useState('badpair');
  const P = presetPolygon(preset);
  const S = solverFor(P);
  const [step, setStep] = useState(0);
  useEffect(() => setStep(0), [preset]);

  const base = useMemo(() => {
    const demo = PRESETS[preset].demoStart;
    if (demo !== undefined) return S.greedy(demo).guards;
    return solutionFor(P).guards;
  }, [P, S, preset]);
  const steps = useMemo(() => theorem54(P, S, base), [P, S, base]);
  const UP = S.startPoints().map((x) => x.u);

  const st0 = steps[0];
  const desc = steps.map((s) => describe(s, st0));
  const cur = steps[Math.min(step, steps.length - 1)];

  // which guards to draw at this step
  let guards = st0.guards.map((G, i) => ({ ...G, i }));
  const trim = steps.find((s) => s.kind === 'trim');
  const trimIdx = steps.indexOf(trim);
  if (trim && step >= trimIdx) guards = guards.map((G) => (G.i === trim.index ? { ...trim.after, i: G.i } : G));

  return (
    <Widget
      tag="Figure 7" id="fig-7"
      title={<>Theorem 5.4: some optimal solution starts in <M>U_P</M></>}
      controls={<PresetPicker value={preset} onChange={setPreset} ids={['badpair', 'ushape', 'comb', 'gallery', 'dumbbell']} />}
      caption={<>
        We start from an optimal solution and transform it, without adding guards, until one chain starts at a point of{' '}
        <M>U_P</M> (teal marks). The polygon <em>Two bad guards</em> shows the hardest case, where every guard of the solution is bad.
      </>}
    >
      <div className="split">
        <div className="split-fig">
          <Stage P={P}>
            <PolygonView P={P} />
            <BoundaryTicks ts={UP} />
            {guards.map((G) => (
              <g key={G.i}>
                <Chain a={G.a} b={G.b} color={colorOf(G.i)} width={7} opacity={cur.index !== undefined && cur.index !== G.i && cur.kind !== 'maximal' ? 0.35 : 0.9} />
                <Seg a={G.g} b={P.at(G.a)} stroke={colorOf(G.i)} dash="4 4" />
                <Seg a={G.g} b={P.at(G.b)} stroke={colorOf(G.i)} dash="4 4" />
              </g>
            ))}
            {cur.kind === 'maximal' && guards.map((G) => (st0.cls[G.i].III ? <AngleArc key={G.i} g={G.g} a={P.at(G.a)} b={P.at(G.b)} radius={26} color={colorOf(G.i)} fill="rgba(0,0,0,0.06)" /> : null))}
            {cur.kind === 'lemma53' && cur.r && (() => {
              const G = st0.guards[cur.index];
              return <g>
                <Seg a={G.g} b={P.at(G.b)} stroke="#dc2626" width={3} />
                <Dot p={cur.r.p} r={8} fill="#dc2626" label="r" />
                <Label p={P.at(G.b)} text="v" dx={8} dy={8} />
              </g>;
            })()}
            {cur.kind === 'trim' && <>
              <Chain a={cur.before.a} b={cur.before.b} color="#94a3b8" width={13} opacity={0.35} />
              <Chain a={cur.after.a} b={cur.after.b} color={colorOf(cur.index)} width={9} />
              <AngleArc g={cur.after.g} a={P.at(cur.after.a)} b={P.at(cur.after.b)} radius={34} color="#16a34a" fill="rgba(22,163,74,0.2)" />
              {cur.r && <Dot p={cur.r.p} r={6} fill="#dc2626" label="r" />}
            </>}
            {(cur.kind === 'replace-good' || cur.kind === 'replace-edge') && <ReplaceDraw P={P} cur={cur} />}
            {(cur.kind === 'start-vertex' || cur.kind === 'end-vertex') && <Dot p={P.at(cur.start)} r={9} fill="#0f766e" label="start in U_P" />}
            {guards.map((G) => <Dot key={G.i} p={G.g} r={7} fill={colorOf(G.i)} label={`g${G.i + 1}`} />)}
          </Stage>
        </div>
        <div className="split-text">
          <Stepper steps={desc} step={Math.min(step, steps.length - 1)} setStep={setStep} />
        </div>
      </div>
    </Widget>
  );
}

function ReplaceDraw({ P, cur }) {
  if (cur.kind === 'replace-edge') {
    return <g>
      <Chain a={cur.newGuard.a} b={cur.newGuard.b} color="#0f766e" width={11} opacity={0.6} />
      <Dot p={cur.newGuard.g} r={9} fill="#0f766e" label="vertex guard" />
    </g>;
  }
  const c = cur.R.chosen;
  return (
    <g>
      {c && c.lines.map((i) => { const [a, b] = P.edge(i); return <InfLine key={i} p={a} dir={sub(b, a)} stroke="#0f766e" dash="8 5" width={1.4} />; })}
      {cur.candidate && <Chain a={cur.candidate.a} b={cur.candidate.b} color="#0f766e" width={13} opacity={0.45} />}
      {c && <Dot p={c.p} r={9} fill="#facc15" stroke="#854d0e" label="c" />}
      {cur.candidate && <Dot p={P.at(cur.candidate.a)} r={8} fill="#0f766e" label="u_x ∈ U_P" labelOffset={[10, -18]} />}
    </g>
  );
}

function describe(s, st0) {
  const name = (i) => `g${i + 1}`;
  switch (s.kind) {
    case 'maximal':
      return {
        title: 'Make every chain maximal',
        body: <>Each guard keeps its position but its chain is extended to the maximal chain it sees. Classification:{' '}
          {s.cls.map((c, i) => <span key={i}>{name(i)} <Badge kind={c.bad ? 'bad' : 'good'}>{c.bad ? 'bad' : 'good'}</Badge>{' '}</span>)}
          {s.cls.some((c) => !c.bad) ? <> — at least one guard is good, so we can use Corollary 4.7 directly.</> : <> — all guards are bad: this is the difficult case of the proof.</>}</>,
      };
    case 'lemma53':
      return {
        title: `Lemma 5.3 on ${name(s.index)}`,
        body: s.r ? <>Neither end of the chain of {name(s.index)} is a vertex. Its chain is maximal, so the segment from its end <M>v</M> to the guard
          passes through a reflex vertex <M>r</M> (red) that is <em>not</em> on its chain. Some other guard must see <M>r</M>.</>
          : <>No reflex vertex found on the segment (degenerate case).</>,
      };
    case 'trim':
      return {
        title: `Shorten the chain of ${name(s.index)}`,
        body: <>Guard {name(s.index)} sees <M>r</M> with <M>r</M> strictly inside its chain, so it lies left of both edges at <M>r</M> and
          inside the polygon <M>P_g</M> of the first guard. Removing from its chain the part already covered by the first guard leaves a chain{' '}
          <M>[a,b]</M> with <M>{'\\angle(a,g\',b) \\le \\pi'}</M> (green arc): the shortened guard is{' '}
          <Badge kind={s.cls.bad ? 'bad' : 'good'}>{s.cls.bad ? 'still bad' : 'good'}</Badge>, and the guards still cover <M>\partial P</M>.</>,
      };
    case 'replace-good':
      return {
        title: <>Replace {name(s.index)} by a candidate of <M>G_P</M></>,
        body: s.candidate ? <>By Corollary 4.7 an arrangement vertex <M>c</M> (yellow), defined by two edges with an endpoint <M>x</M> on the chain,
          sees the same chain. The candidate <M>{'(c,[u_x,v_x]) \\in G_P'}</M> (thick teal) contains it. Replacing the guard keeps a solution of the same
          size, and now one chain starts at <M>{'u_x \\in U_P'}</M>. <strong>Done.</strong></>
          : <>Corollary 4.7 gives a vertex <M>c</M> of the arrangement that sees the chain.</>,
      };
    case 'replace-edge':
      return { title: `Lemma 4.2 on ${name(s.index)}`, body: <>The chain lies inside one edge; the guard is replaced by an endpoint of that edge, whose chain starts at a vertex of <M>P</M> (in <M>U_P</M>). <strong>Done.</strong></> };
    case 'start-vertex':
      return { title: 'The chain starts at a vertex', body: <>The chain of {name(s.index)} starts at a vertex of <M>P</M>, which belongs to <M>U_P</M>. <strong>Done.</strong></> };
    case 'end-vertex':
      return { title: 'The chain ends at a vertex', body: <>The chain ends at a vertex <M>v</M>; the next guard (whose chain contains <M>v</M>) can be shortened to start at <M>v \in U_P</M>. <strong>Done.</strong></> };
    default:
      return { title: s.kind };
  }
}
