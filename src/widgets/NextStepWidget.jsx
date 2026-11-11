import React, { useMemo, useState, useEffect } from 'react';
import { Stage, PolygonView, Chain, Dot, Seg, BoundaryHandle, Polyline, Region, InfLine, Label } from '../components/svg.jsx';
import { Widget, PresetPicker, presetPolygon, solverFor, M, Badge, fmt } from '../components/ui.jsx';
import { mod } from '../geometry/polygon.js';
import { PRESETS } from '../geometry/presets.js';

/** Section 2.8: one greedy step, next(u), as in Lemma 6.8. */
export default function NextStepWidget() {
  const [preset, setPreset] = useState('badpair');
  const P = presetPolygon(preset);
  const S = solverFor(P);
  const [u, setU] = useState(() => PRESETS[preset].demoStart ?? 0.3);
  const [sel, setSel] = useState(null);
  useEffect(() => { setU(PRESETS[preset].demoStart ?? 0.3); setSel(null); }, [preset]);

  const data = useMemo(() => {
    if (S.isStarShaped()) return null;
    const good = S.nextGood(u);
    const trace = [];
    S.nextBad(u, good ? good.v : u, trace);
    const best = S.next(u);
    return { good, trace, best };
  }, [S, u]);

  if (!data) {
    return <Widget tag="Figure 9" id="fig-9" title={<>One greedy step: computing <M>{'\\mathrm{next}(u)'}</M></>} controls={<PresetPicker value={preset} onChange={setPreset} />}>
      <p className="note">This polygon is star-shaped; choose another one.</p>
    </Widget>;
  }
  const { good, trace, best } = data;
  const uu = u; // u in [0, n)
  const rows = trace.map((r) => {
    const okAtt = r.attempts.find((a) => a.w === mod(r.j + 1, P.n)) || r.attempts[0];
    const pts = r.attempts.flatMap((a) => a.points.filter((x) => x.ok));
    const vmax = pts.length ? Math.max(...pts.map((x) => x.v)) : null;
    return { ...r, att: okAtt, vmax };
  });
  const selRow = sel !== null ? rows.find((r) => r.j === sel) : null;
  const badWins = best.kind === 'bad';

  return (
    <Widget
      tag="Figure 9" id="fig-9"
      title={<>One greedy step: computing <M>{'\\mathrm{next}(u)'}</M></>}
      controls={<PresetPicker value={preset} onChange={setPreset} ids={['badpair', 'notch', 'comb', 'gallery', 'ushape', 'zigzag']} />}
      caption={<>
        Lemma 6.8 computes <M>{'\\mathrm{next}(u)'}</M> in two parts. <strong>Good guards:</strong> look up the candidate chain of <M>G_P</M> containing{' '}
        <M>u</M> that reaches farthest (blue). <strong>Bad guards:</strong> for an edge <M>e_j</M>, take the shortest path from <M>u</M> to the end of <M>e_j</M>;
        if it turns only left, the line <M>{'\\ell_u'}</M> through its first edge is intersected with the visibility core <M>P_E</M> of the edges from <M>u</M> to <M>e_j</M>,
        and the first and last points of <M>{'\\ell_u \\cap P_E'}</M> are tried as guards (Lemma 4.9). Click a row of the table to see that edge.
      </>}
    >
      <div className="split">
        <div className="split-fig">
          <Stage P={P}>
            {selRow && selRow.core && selRow.core.length >= 3 && <Region pts={selRow.core} fill="rgba(22,163,74,0.16)" />}
            {selRow && selRow.att && selRow.att.line && <InfLine p={selRow.att.line.p} dir={selRow.att.line.dir} stroke="#b45309" dash="8 5" width={1.5} />}
            <PolygonView P={P} />
            {selRow && <Chain a={uu} b={selRow.endParam} color="#64748b" width={4} opacity={0.6} />}
            {selRow && selRow.att && <Polyline pts={selRow.att.path} stroke={selRow.att.left ? '#7c3aed' : '#dc2626'} width={3} dash="7 4" />}
            {selRow && selRow.attempts.flatMap((a, k) => a.points.map((x, i) => <Dot key={`${k}-${i}`} p={x.g} r={5} fill={x.ok ? '#b45309' : '#94a3b8'} />))}
            {good && <Chain a={uu} b={good.v} color="#2563eb" width={9} opacity={0.5} />}
            {good && <Dot p={good.g} r={6} fill="#2563eb" label="c" />}
            <Chain a={uu} b={best.v} color={badWins ? '#ea580c' : '#1d4ed8'} width={5} />
            <Seg a={best.g} b={P.at(uu)} stroke="var(--ink)" dash="4 4" />
            <Seg a={best.g} b={P.at(best.v)} stroke="var(--ink)" dash="4 4" />
            <Dot p={best.g} r={8} fill={badWins ? '#ea580c' : '#1d4ed8'} label={badWins ? 'g* (bad)' : 'best'} />
            <Dot p={P.at(best.v)} r={5} fill="white" stroke="var(--ink)" strokeWidth={2.5} />
            <Label p={P.at(best.v)} text="next(u)" dx={8} dy={-14} />
            <BoundaryHandle t={u} onChange={setU} label="u" color="var(--ink)" />
          </Stage>
        </div>
        <div className="split-text">
          <p className="note">
            Good part: <M>v'</M> = {good ? fmt(good.v - uu) : '–'} edges after <M>u</M>.<br />
            Result: <M>{'\\mathrm{next}(u)'}</M> is {fmt(best.v - uu)} edges after <M>u</M>, realised by a{' '}
            {badWins ? <Badge kind="bad">bad guard found on a line ℓu</Badge> : <Badge kind="good">candidate guard of G_P</Badge>}
          </p>
          <div className="table-wrap">
            <table className="tbl">
              <thead><tr><th>edge</th><th>path left-turning?</th><th>points on ℓu</th><th>reach</th></tr></thead>
              <tbody>
                {rows.map((r) => (
                  <tr key={r.j} className={r.j === sel ? 'sel' : ''} onClick={() => setSel(r.j === sel ? null : r.j)}>
                    <td>e{r.j}</td>
                    <td>{r.emptyCore ? 'core empty – stop' : r.att ? (r.att.left ? '✓' : '✗') : '–'}</td>
                    <td>{r.attempts.reduce((s, a) => s + a.points.length, 0)}</td>
                    <td>{r.vmax !== null ? fmt(r.vmax - uu) : '–'}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
          <p className="small">The paper performs a binary search over the edges (the predicate is monotone), giving <M>O(\log n)</M> rounds of <M>O(\log n)</M> each. For clarity we list every edge.</p>
        </div>
      </div>
    </Widget>
  );
}
