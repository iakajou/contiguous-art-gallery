// Home page = what we present orally. Everything else lives on the detail pages.

import React, { useMemo, useState } from 'react';
import { link, sectionLink } from '../router.js';
import { M, presetPolygon, solverFor, solutionFor } from '../components/ui.jsx';
import { Cite } from '../sections/blocks.jsx';
import { Reveal, CountUp, useInView } from '../anim/motion.jsx';
import { SweepScene, BadGuardScene, DiscretizeScene, Lemma62Scene } from '../anim/scenes.jsx';
import Playground from '../widgets/Playground.jsx';
import { chainThrough } from '../geometry/visibility.js';
import { classifyGuard } from '../geometry/solver.js';
import { maximalChainLemma62 } from '../geometry/proofs.js';
import { mod } from '../geometry/polygon.js';

function Hero() {
  const P = presetPolygon('atrium');
  const sol = solutionFor(P);
  const runs = useMemo(() => [{ guards: sol.guards }], [sol]);
  return (
    <section className="hero">
      <div className="hero-bg" aria-hidden="true"><div className="glow g1" /><div className="glow g2" /><div className="grid" /></div>
      <div className="hero-inner">
        <div className="hero-text">
          <div className="eyebrow eyebrow-dark stagger" style={{ '--d': 0 }}>INFO-F420 · Computational Geometry · ULB</div>
          <h1 className="stagger" style={{ '--d': 1 }}>Guarding Walls <em>Contiguously</em></h1>
          <p className="hero-lede stagger" style={{ '--d': 2 }}>
            How many cameras does it take to film every wall of a gallery, if each camera films <b>one unbroken stretch</b> of wall?
          </p>
          <div className="hero-cta stagger" style={{ '--d': 3 }}>
            <a className="btn btn-glow" href={link("/", { s: "problem" })}>Start the tour</a>
            <a className="btn btn-ghost" href={link('/proof')}>Read the full proof</a>
            <a className="btn btn-ghost" href={link('/play')}>Play</a>
          </div>
          <div className="hero-authors stagger" style={{ '--d': 4 }}>Ilias Akajou &amp; Jomaa Abdulrahman · 2026–2027</div>
        </div>
        <div className="hero-art stagger" style={{ '--d': 2 }}>
          <SweepScene P={P} runs={runs} dark perGuard={1.7} hold={2.4} unit={1.9} />
          <div className="hero-caption">Three cameras, each sweeping one stretch of wall: an optimal solution computed live by our solver.</div>
        </div>
      </div>
      <a href={link("/", { s: "problem" })} className="scroll-cue" aria-label="scroll down"><span /></a>
    </section>
  );
}

function SectionHead({ num, kicker, title, children }) {
  return (
    <Reveal className="sec-head">
      <div className="sec-kicker"><span className="sec-n">{num}</span>{kicker}</div>
      <h2>{title}</h2>
      {children ? <p className="sec-lead">{children}</p> : null}
    </Reveal>
  );
}

function Problem() {
  return (
    <section id="problem" className="home-sec">
      <div className="wrap">
        <SectionHead num="01" kicker="The problem" title={<>One camera, <em>one stretch of wall</em></>}>
          The gallery is a <b>simple polygon</b> <M>P</M> with <M>n</M> vertices: one closed boundary that never crosses itself, and no holes.
          A <b>contiguous guard</b> is a point <M>g</M> of <M>P</M> together with a single stretch <M>[u,v]</M> of the boundary that <M>g</M> sees entirely.
          We want the minimum number <M>k</M> of contiguous guards whose stretches cover all walls.
        </SectionHead>
        <Reveal delay={100}><Playground /></Reveal>
        <Reveal className="simple-box">
          <div className="simple-title">Why “simple polygon” is essential</div>
          <div className="simple-grid">
            <div><b>One loop of walls.</b> Without holes, the boundary is a single closed loop, so every guard covers one interval of a circle. The greedy algorithm and its <M>k+1</M> bound rely on this.</div>
            <div><b>No hidden pockets.</b> A closed curve drawn inside <M>P</M> only encloses points of <M>P</M>, and shortest paths are unique. Every replacement lemma of the proof uses this.</div>
            <div><b>With holes, it breaks.</b> A point can then see both ends of a wall without seeing the wall in between. Whether the problem is still polynomial is open <Cite k="2" />.</div>
          </div>
        </Reveal>
      </div>
    </section>
  );
}

function Surprise() {
  const cards = [
    { tag: 'Classical art gallery', what: 'point guards must see the whole polygon', verdict: 'NP-hard, even ∃ℝ-complete', cls: 'hard', refs: 'Lee–Lin 1986 · Abrahamsen et al. 2018' },
    { tag: 'Guard only the walls', what: 'point guards must see the whole boundary', verdict: '∃ℝ-hard', cls: 'hard', refs: 'Stade, SoCG 2025' },
    { tag: 'Contiguous walls', what: 'each guard covers one stretch of boundary', verdict: 'polynomial, even Θ(n log n)', cls: 'easy', refs: 'SoCG 2025 → 2026' },
  ];
  const milestones = [
    { y: '2024', t: 'Open problem', d: 'posed by T. Shermer at CCCG', c: 'open' },
    { y: '2025', t: 'O(k n⁵ log n)', d: 'three independent teams, SoCG', c: '' },
    { y: '2025', t: 'O(k n² log² n)', d: 'de Berg, Conradi, van der Hoog, Staals', c: 'focus' },
    { y: '2026', t: 'Θ(n log n)', d: 'optimal, with a lower bound', c: '' },
  ];
  const [ref, inView] = useInView();
  return (
    <section id="surprise" className="home-sec home-sec-alt">
      <div className="wrap">
        <SectionHead num="02" kicker="Why it is surprising" title={<>Harder constraint, <em>easier problem</em></>}>
          Almost every art gallery problem is intractable. Asking each camera to film one contiguous stretch should make things harder; instead, it makes the
          problem solvable in polynomial time.
        </SectionHead>
        <div className="cards3">
          {cards.map((c, i) => (
            <Reveal key={c.tag} delay={i * 120} className={`verdict-card ${c.cls}`}>
              <div className="vc-tag">{c.tag}</div>
              <div className="vc-what">{c.what}</div>
              <div className="vc-verdict">{c.verdict}</div>
              <div className="vc-refs">{c.refs}</div>
            </Reveal>
          ))}
        </div>
        <div ref={ref} className={`timeline ${inView ? 'in' : ''}`}>
          <div className="tl-line" />
          {milestones.map((m, i) => (
            <div key={i} className={`tl-item ${m.c}`} style={{ '--i': i }}>
              <div className="tl-dot" />
              <div className="tl-year">{m.y}</div>
              <div className="tl-title">{m.t}</div>
              <div className="tl-desc">{m.d}</div>
            </div>
          ))}
        </div>
        <Reveal className="why-box">
          <b>Why?</b> Contiguity turns the problem into covering a circle (the boundary) with intervals. Covering a circle with intervals is easy with a greedy
          algorithm, <em>as soon as we know where to start</em>. The whole paper is about finding that start.
        </Reveal>
      </div>
    </section>
  );
}

function IdeaRow({ n, title, children, scene, links, flip, wide }) {
  return (
    <div id={`idea-${n}`} className={`idea ${flip ? 'idea-flip' : ''} ${wide ? 'idea-wide' : ''}`}>
      <Reveal className="idea-scene">{scene}</Reveal>
      <Reveal className="idea-text" delay={120}>
        <div className="idea-n">{n}</div>
        <h3>{title}</h3>
        {children}
        <div className="idea-links">{links.map(([href, label]) => <a key={href} href={href} className="arrow-link">{label} →</a>)}</div>
      </Reveal>
    </div>
  );
}

function Algorithm() {
  // idea 1: greedy from a bad start vs from the start of an optimal chain (comb)
  const comb = presetPolygon('comb');
  const Sc = solverFor(comb);
  const greedyRuns = useMemo(() => {
    const opt = solutionFor(comb);
    let bad = null;
    for (let i = 0; i < 400 && !bad; i++) { const u = (i * comb.n) / 400 + 0.003; const r = Sc.greedy(u); if (r.guards.length === opt.k + 1) bad = r; }
    const good = Sc.greedy(mod(opt.guards[0].a, comb.n));
    return [
      { guards: bad.guards, u: bad.u, label: 'Greedy from an arbitrary point u' },
      { guards: good.guards, u: good.u, label: 'Greedy from the start of an optimal chain' },
    ];
  }, [comb, Sc]);
  // idea 2: a bad guard and the candidate start points
  const notch = presetPolygon('notch');
  const Sn = solverFor(notch);
  const bad = useMemo(() => {
    const g = { x: 497, y: 456 };
    const ch = chainThrough(Sn.vis(g), 0.5, notch.n);
    return { g, ch, angle: classifyGuard(notch, g, ch.a, ch.b).angle };
  }, [notch, Sn]);
  const gal = presetPolygon('gallery');
  const Sg = solverFor(gal);
  const res = useMemo(() => Sg.solve({ exhaustive: true }), [Sg]);
  // idea 3: Lemma 6.2
  const L62 = useMemo(() => maximalChainLemma62(gal, Sg, { x: 140, y: 140 }, 5.5), [gal, Sg]);

  return (
    <section id="algorithm" className="home-sec">
      <div className="wrap">
        <SectionHead num="03" kicker="The algorithm" title={<>The whole algorithm <em>in one sentence</em></>} />
        <Reveal className="big-quote">
          Run a <b>greedy</b> algorithm from <b><M>O(n^2)</M> well-chosen starting points</b> on the boundary, and keep the smallest solution.
        </Reveal>
        <p className="center muted">Three ideas make this correct and fast.</p>

        <IdeaRow
          n="1"
          title="Greedy is never more than one guard off"
          scene={<SweepScene P={comb} runs={greedyRuns} dark={false} perGuard={1.25} hold={2.2} showU unit={1.5} />}
          links={[[sectionLink('greedy'), 'Chapter 1: the greedy algorithm']]}
        >
          <p>
            From a point <M>u</M>, take the guard that sees the longest stretch starting at <M>u</M>, continue from where it stops, and repeat.
            Comparing with an optimal solution chain by chain, greedy always <em>stays ahead</em>: it uses at most <M>k+1</M> guards from any start,
            and exactly <M>k</M> if it starts where an optimal stretch starts.
          </p>
        </IdeaRow>

        <IdeaRow
          n="2"
          wide
          title={<>Only <M>O(n^2)</M> starting points matter</>}
          scene={<div className="scene-pair"><BadGuardScene P={notch} g={bad.g} ch={bad.ch} angle={bad.angle} /><DiscretizeScene P={gal} S={Sg} res={res} /></div>}
          links={[[link('/proof/2'), 'Chapter 2: good and bad guards'], [link('/proof/3'), 'Chapter 3: Theorem 5.4']]}
        >
          <p>
            A guard is <b>bad</b> if it looks around a corner (it sees its stretch under more than 180°), and <b>good</b> otherwise. A good guard can slide to a
            crossing point of the lines through the edges without losing anything; a solution made only of bad guards can be reshaped to contain a good one.
          </p>
          <p>
            So some optimal stretch starts at one of the <M>O(n^2)</M> points <M>U_P</M> derived from those crossings (Theorem 5.4).
          </p>
        </IdeaRow>

        <IdeaRow
          n="3"
          title={<>Each greedy step takes <M>{'O(\\log^2 n)'}</M></>}
          scene={<Lemma62Scene P={gal} L={L62} g={{ x: 140, y: 140 }} m={5.5} />}
          links={[[link('/proof/4'), 'Chapter 4: fast greedy steps']]}
        >
          <p>
            What a guard sees around a point is found with only <b>two shortest paths and two rays</b> (Lemma 6.2): the paths wrap around the obstacles,
            and the rays that extend them mark where the visible stretch begins and ends.
          </p>
          <p>
            With these structures and a few precomputed cores, one greedy step costs <M>{'O(\\log^2 n)'}</M>, even for bad guards.
          </p>
        </IdeaRow>
      </div>
    </section>
  );
}

function ComplexityRace() {
  const [n, setN] = useState(100);
  const k = 5;
  const lg = Math.log2(n);
  const rows = [
    { name: 'SoCG 2025 (best of three)', f: 'O(k n⁵ log n)', v: k * n ** 5 * lg, c: '#f43f5e' },
    { name: 'de Berg et al. 2025 — our paper', f: 'O(k n² log² n)', v: k * n * n * lg * lg, c: '#6366f1', focus: true },
    { name: 'de Berg et al. 2026', f: 'Θ(n log n)', v: n * lg, c: '#10b981' },
  ];
  const max = Math.log10(rows[0].v) + 0.5;
  const [ref, inView] = useInView();
  const sci = (x) => { const e = Math.floor(Math.log10(x)); const m = x / 10 ** e; return <>{m.toFixed(1)}×10<sup>{e}</sup></>; };
  return (
    <div ref={ref} className={`race ${inView ? 'in' : ''}`}>
      <div className="race-head">
        <span>Operations (log scale) for a polygon with</span>
        <label className="race-n"><input type="range" min={10} max={1000} step={10} value={n} onChange={(e) => setN(Number(e.target.value))} /> <b>n = {n}</b></label>
        <span className="muted">(k = {k})</span>
      </div>
      {rows.map((r, i) => (
        <div key={r.name} className={`race-row ${r.focus ? 'focus' : ''}`} style={{ '--i': i }}>
          <div className="race-name">{r.name}<span className="race-f">{r.f}</span></div>
          <div className="race-track"><div className="race-bar" style={{ width: inView ? `${(Math.log10(r.v) / max) * 100}%` : '0%', background: r.c }} /></div>
          <div className="race-val">{sci(r.v)}</div>
        </div>
      ))}
    </div>
  );
}

function Result() {
  return (
    <section id="result" className="home-sec home-sec-alt">
      <div className="wrap">
        <SectionHead num="04" kicker="The result" title={<>From <em>n⁵</em> to <em>n²</em>, then to <em>n log n</em></>} />
        <Reveal className="formula">
          <div><span className="f-big"><M>O(n^2)</M></span><span className="f-cap">starting points</span></div>
          <div className="f-op">×</div>
          <div><span className="f-big"><M>O(k)</M></span><span className="f-cap">greedy steps</span></div>
          <div className="f-op">×</div>
          <div><span className="f-big"><M>{'O(\\log^2 n)'}</M></span><span className="f-cap">per step</span></div>
          <div className="f-op">=</div>
          <div className="f-res"><span className="f-big"><M>{'O(k\\,n^2\\log^2 n)'}</M></span><span className="f-cap">Theorem 7.1</span></div>
        </Reveal>
        <Reveal><ComplexityRace /></Reveal>
        <Reveal className="note-row">
          A few months later, the same group reached the optimal <M>{'\\Theta(n\\log n)'}</M>: only <M>O(n)</M> starting points, and the function{' '}
          <M>{'\\mathrm{next}'}</M> described by <M>O(n)</M> simple pieces. <a className="arrow-link" href={link('/proof/5')}>Chapter 5 →</a>
        </Reveal>
      </div>
    </section>
  );
}

function Verified() {
  const stats = [
    { v: 11, s: '', label: 'interactive figures, one per step of the proof' },
    { v: 13082, s: '', label: 'random guards on which every replacement lemma was checked' },
    { v: 1541, s: '', label: 'automatic checks against brute force, all passing' },
    { v: 0.4, s: ' s', label: 'to solve a 40-vertex gallery in the browser', f: (x) => x.toFixed(1) },
  ];
  return (
    <section id="verified" className="home-sec">
      <div className="wrap">
        <SectionHead num="05" kicker="Built and verified" title={<>Everything on this site is <em>computed live</em></>}>
          We implemented the algorithm in JavaScript and tested every construction of the proof against independent brute-force computations.
          Along the way we found that the statement of Lemma 6.2 needs a precision when a chain winds around the guard more than once.
        </SectionHead>
        <div className="stats4">
          {stats.map((s, i) => (
            <Reveal key={i} delay={i * 90} className="stat">
              <div className="stat-v"><CountUp to={s.v} format={s.f} />{s.s}</div>
              <div className="stat-l">{s.label}</div>
            </Reveal>
          ))}
        </div>
        <div className="center"><a className="arrow-link" href={link('/report', { s: 'implementation' })}>How we implemented and tested it →</a></div>
      </div>
    </section>
  );
}

function PlayCta() {
  const P = presetPolygon('gallery');
  const sol = solutionFor(P);
  const runs = useMemo(() => [{ guards: sol.guards }], [sol]);
  return (
    <section id="try" className="home-sec">
      <div className="wrap">
        <Reveal className="cta-card">
          <div className="cta-text">
            <div className="sec-kicker"><span className="sec-n">06</span>Your turn</div>
            <h2>Can you beat <em>the algorithm</em>?</h2>
            <p>Random galleries, your cameras, your stretches of wall. The game checks your solution and tells you if it is optimal.</p>
            <a className="btn btn-glow" href={link('/play')}>Play now</a>
          </div>
          <div className="cta-art"><SweepScene P={P} runs={runs} dark perGuard={1.6} hold={1.6} unit={1.7} /></div>
        </Reveal>
      </div>
    </section>
  );
}

export default function Home() {
  return (
    <div className="home">
      <Hero />
      <Problem />
      <Surprise />
      <Algorithm />
      <Result />
      <Verified />
      <PlayCta />
    </div>
  );
}
