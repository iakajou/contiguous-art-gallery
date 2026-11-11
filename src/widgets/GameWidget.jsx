import React, { useMemo, useState, useEffect, useRef } from 'react';
import { Stage, PolygonView, Chain, Dot, Seg, Handle, Region, Poly, Polyline, colorOf, Label } from '../components/svg.jsx';
import { Widget, Button, Toggle, M, Badge, solverFor, presetPolygon } from '../components/ui.jsx';
import { randomPolygon } from '../geometry/generate.js';
import { Polygon, mod, relFrom } from '../geometry/polygon.js';
import { visibilityPolygon, chainThrough, seesChain, unseenParts } from '../geometry/visibility.js';
import { PRESET_LIST } from '../geometry/presets.js';
import { dist } from '../geometry/vec.js';
import { Confetti } from '../anim/motion.jsx';

const LEVELS = { easy: { n: 10, label: 'Easy (10 vertices)' }, medium: { n: 14, label: 'Medium (14)' }, hard: { n: 20, label: 'Hard (20)' }, expert: { n: 28, label: 'Expert (28)' } };

function newGamePolygon(n) {
  for (let t = 0; t < 60; t++) {
    const P = randomPolygon(n, { seed: Math.floor(Math.random() * 1e9) });
    if (!P) continue;
    if (solverFor(P).isStarShaped()) continue; // one guard would be too easy
    return P;
  }
  return presetPolygon('gallery');
}

/** Coverage of the boundary by a list of chains: returns uncovered pieces. */
function uncovered(chains, n) {
  const iv = [];
  for (const c of chains) {
    if (c.b - c.a >= n - 1e-9) return [];
    const a = mod(c.a, n), len = c.b - c.a;
    iv.push([a, a + len]);
    iv.push([a - n, a - n + len]);
  }
  iv.sort((x, y) => x[0] - y[0]);
  const gaps = [];
  let cur = 0;
  for (const [a, b] of iv) {
    if (b <= cur) continue;
    if (a > cur + 1e-7 && a < n) gaps.push({ a: cur, b: Math.min(a, n) });
    cur = Math.max(cur, b);
    if (cur >= n) break;
  }
  if (cur < n - 1e-7) gaps.push({ a: cur, b: n });
  return gaps;
}

export default function GameWidget() {
  const [mode, setMode] = useState('game');
  const [level, setLevel] = useState('medium');
  const [P, setP] = useState(() => newGamePolygon(LEVELS.medium.n));
  const [guards, setGuards] = useState([]);
  const [sel, setSel] = useState(-1);
  const [pending, setPending] = useState(null); // first click of a manual chain
  const [snap, setSnap] = useState(true);
  const [showOpt, setShowOpt] = useState(false);
  const [opt, setOpt] = useState(null);
  const [result, setResult] = useState(null);
  const [drawing, setDrawing] = useState(null); // list of points while drawing in sandbox
  const [hover, setHover] = useState(null);
  const [editVerts, setEditVerts] = useState(false);
  const [json, setJson] = useState('');
  const S = solverFor(P);

  useEffect(() => {
    setOpt(null);
    const id = setTimeout(() => setOpt(S.solve()), 30);
    return () => clearTimeout(id);
  }, [S]);

  const reset = (Q) => { setP(Q); setGuards([]); setSel(-1); setPending(null); setShowOpt(false); setResult(null); };
  const newGame = () => reset(newGamePolygon(LEVELS[level].n));

  const thr = 0.025 * P.diam;
  const onDown = (q) => {
    setResult(null);
    if (drawing) {
      if (drawing.length >= 3 && dist(q, drawing[0]) < thr) { finishDrawing(drawing); return; }
      setDrawing([...drawing, q]);
      return;
    }
    const cb = P.closestBoundary(q);
    if (cb.d < thr && sel >= 0) {
      const G = guards[sel];
      if (snap) {
        const ch = chainThrough(S.vis(G.g), cb.t, P.n);
        if (ch) updateGuard(sel, { a: ch.a, b: ch.b });
        else updateGuard(sel, { a: cb.t, b: cb.t });
      } else if (pending === null) {
        setPending(cb.t);
      } else {
        const a = pending, b = pending + mod(cb.t - pending, P.n);
        updateGuard(sel, { a, b });
        setPending(null);
      }
      return;
    }
    if (P.contains(q) && cb.d >= thr * 0.4) {
      const G = { g: q, a: null, b: null };
      setGuards([...guards, G]);
      setSel(guards.length);
      setPending(null);
    }
  };
  const updateGuard = (i, patch) => setGuards((gs) => gs.map((G, j) => (j === i ? { ...G, ...patch } : G)));
  const removeGuard = () => { if (sel < 0) return; setGuards(guards.filter((_, j) => j !== sel)); setSel(-1); setPending(null); };

  const finishDrawing = (pts) => {
    const Q = new Polygon(pts);
    if (!Q.isSimple()) { setResult({ kind: 'error', text: 'The polygon you drew is not simple (edges cross). Try again.' }); setDrawing(null); return; }
    setDrawing(null);
    reset(Q);
  };

  const check = () => {
    const issues = [];
    guards.forEach((G, i) => {
      if (G.a === null) issues.push(`guard ${i + 1} has no chain`);
      else if (!seesChain(S.vis(G.g), G.a, G.b, P.n)) issues.push(`guard ${i + 1} does not see its whole chain`);
    });
    const gaps = uncovered(guards.filter((G) => G.a !== null).map((G) => ({ a: G.a, b: G.b })), P.n);
    if (gaps.length) issues.push(`${gaps.length} part${gaps.length > 1 ? 's' : ''} of the boundary ${gaps.length > 1 ? 'are' : 'is'} not covered`);
    if (issues.length) { setResult({ kind: 'error', text: `Not valid yet: ${issues.join('; ')}.` }); return; }
    if (!opt) { setResult({ kind: 'ok', text: 'Valid solution! (the optimum is still being computed)' }); return; }
    if (guards.length === opt.k) setResult({ kind: 'win', text: `You win! ${guards.length} guards is optimal.` });
    else setResult({ kind: 'ok', text: `Valid solution with ${guards.length} guards, but ${opt.k} suffice. Try again, or reveal an optimal solution.` });
  };

  const gaps = uncovered(guards.filter((G) => G.a !== null).map((G) => ({ a: G.a, b: G.b })), P.n);
  const selG = sel >= 0 ? guards[sel] : null;
  const selVis = selG ? S.vis(selG.g) : null;
  const vp = useMemo(() => (selG ? visibilityPolygon(P, selG.g) : null), [P, selG]);

  const exportJson = () => setJson(JSON.stringify(P.toJSON()));
  const importJson = () => {
    try {
      const arr = JSON.parse(json);
      const Q = new Polygon(arr.map(([x, y]) => ({ x, y })));
      if (!Q.isSimple() || Q.n < 3) throw new Error('not simple');
      reset(Q);
    } catch (e) { setResult({ kind: 'error', text: 'Could not read the polygon: expected a JSON list of [x, y] pairs describing a simple polygon.' }); }
  };

  const drawP = drawing ? new Polygon([{ x: 0, y: 0 }, { x: 1000, y: 0 }, { x: 1000, y: 700 }, { x: 0, y: 700 }]) : P;

  return (
    <Widget
      tag="Game"
      id="fig-game"
      title={mode === 'game' ? 'Guard the gallery!' : 'Sandbox'}
      controls={<>
        <div className="tabs">
          <button type="button" className={mode === 'game' ? 'on' : ''} onClick={() => { setMode('game'); setDrawing(null); setEditVerts(false); }}>Game</button>
          <button type="button" className={mode === 'sandbox' ? 'on' : ''} onClick={() => setMode('sandbox')}>Sandbox</button>
        </div>
      </>}
      caption={mode === 'game' ? <>
        <strong>How to play.</strong> Click inside the gallery to place a guard. With a guard selected, click on the boundary to give it a chain
        (with <em>snap</em> on, one click takes the whole maximal chain it sees there; with snap off, click the start and then the end, counter-clockwise).
        Dashed red on a chain: a part its guard does not see; dotted red: walls that no chain covers yet. Drag guards to move them.
        Press <em>Check</em> when every wall is covered. Can you match the optimum computed by the algorithm of this page?
      </> : <>
        Draw your own polygon (click to add vertices counter-clockwise or clockwise, click the first vertex to close), drag its vertices, or load an example. Only <strong>simple polygons</strong> are accepted (edges may not cross, no holes), as the algorithm requires.
        The optimal number of guards is recomputed with our implementation of the algorithm. You can also place guards exactly as in the game.
      </>}
    >
      <div className="row-buttons">
        {mode === 'game' ? <>
          <label className="ctl"><span>Level</span>
            <select value={level} onChange={(e) => { setLevel(e.target.value); reset(newGamePolygon(LEVELS[e.target.value].n)); }}>
              {Object.entries(LEVELS).map(([k, v]) => <option key={k} value={k}>{v.label}</option>)}
            </select>
          </label>
          <Button onClick={newGame}>New gallery</Button>
        </> : <>
          <Button onClick={() => { setDrawing([]); setGuards([]); setSel(-1); setResult(null); }} kind="primary">Draw a polygon</Button>
          {drawing && drawing.length >= 3 && <Button onClick={() => finishDrawing(drawing)}>Close polygon</Button>}
          {drawing && <Button onClick={() => setDrawing(null)}>Cancel</Button>}
          <label className="ctl"><span>Example</span>
            <select value="" onChange={(e) => { if (e.target.value) reset(presetPolygon(e.target.value)); }}>
              <option value="">choose…</option>
              {PRESET_LIST.map((p) => <option key={p.id} value={p.id}>{p.label}</option>)}
            </select>
          </label>
          <Toggle checked={editVerts} onChange={(v) => { setEditVerts(v); setGuards([]); setSel(-1); }}>move vertices</Toggle>
        </>}
        <Toggle checked={snap} onChange={(v) => { setSnap(v); setPending(null); }}>snap chains</Toggle>
        <Button onClick={removeGuard} disabled={sel < 0}>Delete guard</Button>
        <Button onClick={() => { setGuards([]); setSel(-1); setResult(null); }} disabled={!guards.length}>Clear</Button>
        <Button onClick={check} kind="primary" disabled={!guards.length}>Check</Button>
        <Toggle checked={showOpt} onChange={setShowOpt}>show optimal</Toggle>
      </div>
      <Stage P={drawP} onBackgroundDown={onDown} onMove={(q) => setHover(q)} onLeave={() => setHover(null)} cursor={drawing ? 'crosshair' : 'pointer'}>
        {drawing ? (
          <g>
            <rect x={0} y={-700} width={1000} height={700} fill="var(--strip-bg)" />
            <Polyline pts={hover ? [...drawing, hover] : drawing} stroke="#1d4ed8" width={2} />
            {drawing.map((p, i) => <Dot key={i} p={p} r={i === 0 ? 7 : 4} fill={i === 0 ? '#16a34a' : '#1d4ed8'} />)}
            <Label p={{ x: 20, y: 680 }} text={drawing.length ? 'click the green vertex to close the polygon' : 'click to place the first vertex'} italic={false} weight={500} />
          </g>
        ) : (
          <g>
            <PolygonView P={P} />
            {vp && !showOpt && <Region pts={vp} fill="rgba(250,204,21,0.22)" stroke="rgba(202,138,4,0.5)" width={1} />}
            {selVis && !showOpt && !selVis.full && selVis.chains.map((c, i) => <Chain key={i} a={c.a} b={c.b} color="#bfdbfe" width={11} />)}
            {!showOpt && guards.map((G, i) => G.a !== null && (
              <g key={i}>
                <Chain a={G.a} b={G.b} color={colorOf(i)} width={i === sel ? 8 : 6} />
                {unseenParts(S.vis(G.g), G.a, G.b, P.n).map((c, j) => <Chain key={j} a={c.a} b={c.b} color="#dc2626" width={8} dash="5 4" />)}
                <Seg a={G.g} b={P.at(G.a)} stroke={colorOf(i)} dash="4 4" />
                <Seg a={G.g} b={P.at(G.b)} stroke={colorOf(i)} dash="4 4" />
              </g>
            ))}
            {!showOpt && guards.length > 0 && gaps.map((c, i) => <Chain key={`gap${i}`} a={c.a} b={c.b} color="#dc2626" width={4} opacity={0.95} dash="2 5" />)}
            {pending !== null && <Dot p={P.at(pending)} r={6} fill="var(--ink)" label="start" />}
            {showOpt && opt && opt.guards.map((G, i) => (
              <g key={i}>
                <Chain a={G.a} b={G.b} color={colorOf(i)} width={7} />
                <Seg a={G.g} b={P.at(G.a)} stroke={colorOf(i)} dash="4 4" />
                <Seg a={G.g} b={P.at(G.b)} stroke={colorOf(i)} dash="4 4" />
                <Dot p={G.g} r={7} fill={colorOf(i)} />
              </g>
            ))}
            {!showOpt && !editVerts && guards.map((G, i) => (
              <g key={i}>
                <Handle p={G.g} color={colorOf(i)} r={i === sel ? 9 : 7} label={`${i + 1}`} onStart={() => { setSel(i); setPending(null); }}
                  constrain={(q) => (P.contains(q) ? q : null)}
                  onChange={(q) => { setSel(i); updateGuard(i, { g: q }); }} />
              </g>
            ))}
            {editVerts && P.pts.map((p, i) => (
              <Handle key={i} p={p} r={6} color="var(--ink)" shape="square"
                onChange={(q) => {
                  const pts = P.pts.map((x, j) => (j === i ? q : x));
                  const Q = new Polygon(pts);
                  if (Q.isSimple()) { setP(Q); setGuards([]); setSel(-1); setResult(null); }
                }} />
            ))}
          </g>
        )}
      </Stage>
      {result?.kind === 'win' ? <Confetti key={result.text + guards.length} /> : null}
      <div className="game-status">
        <span>Guards: <strong>{guards.length}</strong></span>
        <span>Uncovered pieces: <strong>{guards.length ? gaps.length : '–'}</strong></span>
        <span>Optimum: <strong>{opt ? (showOpt || result?.kind === 'win' || mode === 'sandbox' ? opt.k : '?') : '…'}</strong></span>
        {result && <span className={`result result-${result.kind}`}>{result.kind === 'win' ? <Badge kind="good">WIN</Badge> : null} {result.text}</span>}
      </div>
      {mode === 'sandbox' && (
        <div className="json-box">
          <textarea value={json} onChange={(e) => setJson(e.target.value)} placeholder='[[100,100],[900,100],[900,600],[100,600]]' rows={2} />
          <div className="row-buttons">
            <Button onClick={exportJson}>Export current polygon</Button>
            <Button onClick={importJson}>Import</Button>
          </div>
        </div>
      )}
    </Widget>
  );
}

export { relFrom };
