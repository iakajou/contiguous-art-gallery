import React from 'react';
import { M } from '../components/ui.jsx';
import { Sub, Thm, Cite, Aside } from '../sections/blocks.jsx';
import { link } from '../router.js';
import { REPO_URL, SITE_URL } from '../links.js';

// The written report: results, context, implementation, team, references.
export default function Report() {
  return (
    <div className="page-report">
      <section className="page-hero page-hero-compact">
        <div className="wrap">
          <div className="eyebrow">Report</div>
          <h1>Summary, implementation <em>and references</em></h1>
          <p className="page-lead">
            The written part of the project: what the paper proves, where it sits among art gallery problems, how we implemented and tested it,
            and how we shared the work. The detailed proofs are in <a href={link('/proof')}>the proof chapters</a>.
          </p>
        </div>
      </section>
      <article className="wrap prose report-body">
      <div className="links-box">
        <div><b>Public page</b><a href={SITE_URL}>{SITE_URL.replace('https://', '')}</a></div>
        <div><b>Source code</b><a href={REPO_URL}>{REPO_URL.replace('https://', '')}</a></div>
        <div><b>Authors</b>Ilias Akajou (520466) · Jomaa Abdulrahman (583629) · <a href={link('/report', { s: 'team' })}>who did what</a></div>
      </div>
      <Sub id="summary" num="R.1" title="Summary of the results">
        <Thm kind="Theorem" name="de Berg, Conradi, van der Hoog, Staals 2025">
          For a simple polygon <M>P</M> with <M>n</M> vertices, the Contiguous Art Gallery Problem can be solved in <M>O(kn^2\log^2 n)</M> time and <M>O(n^2)</M> space, where <M>k</M> is the size of an optimal solution.
        </Thm>
        <p>The proof combines three simple facts, which we illustrated one by one:</p>
        <ol>
          <li>the greedy algorithm uses at most <M>k+1</M> guards from any start and exactly <M>k</M> from the start of an optimal chain (Section 2.2);</li>
          <li>good guards can be moved to vertices of the arrangement of the supporting lines (Corollary 4.7), and a solution made only of bad guards can be turned into one containing a good guard (Theorem 5.4), so one of the <M>O(n^2)</M> points of <M>U_P</M> is the start of an optimal chain;</li>
          <li>a greedy step only needs shortest paths, ray shooting and precomputed visibility cores, which gives <M>O(\log^2 n)</M> per step (Lemma 6.8).</li>
        </ol>
        <p>
          The reason the problem is easy, while classical art gallery variants are not, is the one-dimensional structure created by contiguity: once the start
          of one chain is known, the greedy algorithm is optimal, so the search space collapses to a set of starting points on the boundary.
        </p>
        <Aside title="The simple-polygon assumption is essential.">
          All the papers on this problem assume that <M>P</M> is simple (one boundary, no self-intersection, no hole), and the method fails without it:
          (i) the boundary must be a single cycle, which is what the greedy argument covers with intervals; (ii) every closed curve in <M>P</M> encloses only
          points of <M>P</M>, which all the proofs use, and shortest paths are unique; (iii) with a hole, a guard can see both endpoints of an edge without seeing
          its middle. Merrild et al. <Cite k="2" /> note that their approach does not extend to polygons with holes and that this case is open. Our solver
          rejects non-simple polygons.
        </Aside>

        <h3 className="tbl-title">The steps of the proof, in one table</h3>
        <div className="tbl-scroll">
          <table className="tbl">
            <thead><tr><th>Step</th><th>Main statement</th><th>Where</th></tr></thead>
            <tbody>
              <tr><td>Visibility cores (Obs. 2.1, 2.2)</td><td>A guard that sees a chain lies in the visibility core of its edges; one guard suffices if and only if <M>P</M> is star-shaped, which is tested in <M>O(n)</M> <Cite k="13" />.</td><td>2.1, Figure 2</td></tr>
              <tr><td>Greedy algorithm</td><td>From any start <M>u</M>, the greedy algorithm uses at most <M>k+1</M> guards, and exactly <M>k</M> if an optimal chain starts at <M>u</M>.</td><td>2.2, Figure 3</td></tr>
              <tr><td>Good and bad guards (Def. 4.1, Obs. 4.8)</td><td>A guard is bad if its open chain contains a vertex, <M>{'g\\neq u,v'}</M>, it sees its chain under an angle larger than <M>\pi</M>, and <M>u</M> does not see <M>v</M>; for a bad guard the shortest path from <M>u</M> to <M>v</M> turns left.</td><td>2.3, Figure 4</td></tr>
              <tr><td>Replacement (Prop. 4.3, Cor. 4.7, Lemma 4.9)</td><td>A good guard can be replaced by a vertex of the arrangement of the supporting lines; a bad guard by the first or last point of the line <M>{'\\ell_u'}</M> inside the visibility core.</td><td>2.4, Figure 5</td></tr>
              <tr><td>Candidates (Def. 5.1, 5.2)</td><td>The candidate guards <M>G_P</M> and the starting points <M>U_P</M> both have size <M>O(n^2)</M>.</td><td>2.5, Figure 6</td></tr>
              <tr><td>Theorem 5.4</td><td>Some optimal solution has a chain that starts at a point of <M>U_P</M>.</td><td>2.6, Figure 7</td></tr>
              <tr><td>Lemma 6.2</td><td>The maximal chain seen by <M>g</M> around <M>m</M> is given by two shortest paths and two rays (taking the hit closest to <M>m</M>).</td><td>2.7, Figure 8</td></tr>
              <tr><td>Lemma 6.8</td><td>After <M>O(n^2\log n)</M> preprocessing and with <M>O(n^2)</M> space, <M>{'\\mathrm{next}(u)'}</M> is computed in <M>O(\log^2 n)</M>.</td><td>2.8, Figure 9</td></tr>
              <tr><td>Theorem 7.1</td><td>The problem is solved in <M>O(kn^2\log^2 n)</M> time and <M>O(n^2)</M> space.</td><td>2.9, Figure 10</td></tr>
              <tr><td>Optimal bound <Cite k="6" /></td><td><M>\Theta(n\log n)</M>, with a matching lower bound.</td><td>2.10, Figure 11</td></tr>
            </tbody>
          </table>
        </div>

        <h3 className="tbl-title">Our contribution</h3>
        <ul>
          <li>An interactive webpage: a short overview used for the presentation, five chapters that follow the proof of <Cite k="5" /> step by step with eleven interactive figures, a game, and this report.</li>
          <li>A complete implementation of the algorithm in JavaScript, running in the browser, with simpler polynomial-time subroutines instead of the polylogarithmic data structures of the paper (Section R.4).</li>
          <li>Automatic tests that check the implementation and every construction of the proof against independent brute-force computations (Section R.4).</li>
          <li>A precision on Lemma 6.2 of <Cite k="5" />, found with these tests: when a chain winds around the guard more than once, a ray can hit the chain twice and the right point is the one closest to <M>m</M> (<a href={link('/proof/4', { s: 'lemma62' })}>Section 2.7</a>).</li>
        </ul>
        <p>
          <b>Conclusion.</b> The Contiguous Art Gallery Problem is a rare art gallery problem that can be solved in polynomial time, because contiguity turns
          it into covering a cycle with intervals: once the start of one optimal chain is known, the greedy algorithm is optimal. The paper of de Berg et al.
          shows that <M>O(n^2)</M> starting points, built from the arrangement of the supporting lines, always contain such a start. Implementing every step of
          the proof and testing it on random polygons helped us understand it in detail, and revealed that the statement of Lemma 6.2 needs a precision.
          The case of polygons with holes remains open.
        </p>
      </Sub>

      <Sub id="context" num="R.2" title="Context: why this problem is surprising">
        <p>
          Most art gallery problems are hard. The classical one (point guards that must see the whole polygon) is NP-hard <Cite k="8" /> and even{' '}
          <M>{'\\exists\\mathbb{R}'}</M>-complete <Cite k="9" />, and guarding only the boundary with point guards is <M>{'\\exists\\mathbb{R}'}</M>-hard as
          well <Cite k="10" />. Adding the contiguity constraint looks like it should make things harder, but it does the opposite: every guard covers a single
          interval of a one-dimensional object, the boundary, and covering a circle with intervals is easy once we know which intervals to use.
        </p>
        <div className="tbl-scroll">
          <table className="tbl tbl-wide">
            <thead><tr><th>Year</th><th>Reference</th><th>Main idea</th><th>Running time</th></tr></thead>
            <tbody>
              <tr><td>2024</td><td>Shermer (CCCG open problem)</td><td>problem posed</td><td>open</td></tr>
              <tr><td>2024–25</td><td><Cite k="2" /> <Cite k="3" /> <Cite k="4" /> → <Cite k="1" /> (SoCG 2025)</td><td>repeated greedy / <M>O(n^4)</M> candidates / analytic arc cover</td><td><M>O(kn^5\log n)</M></td></tr>
              <tr className="hl"><td>2025</td><td>de Berg, Conradi, van der Hoog, Staals <Cite k="5" /></td><td>greedy from <M>O(n^2)</M> candidate starts</td><td><M>O(kn^2\log^2 n)</M></td></tr>
              <tr><td>2025–26</td><td>de Berg, Conradi, van der Hoog, Rotenberg <Cite k="6" /></td><td>dominators, sliding window, Möbius pieces</td><td><M>\Theta(n\log n)</M></td></tr>
            </tbody>
          </table>
        </div>
        <Aside title="Scope.">
          As suggested for this project, we do not re-explain the classical art gallery problem (Chvátal's <M>{'\\lfloor n/3 \\rfloor'}</M> theorem <Cite k="7" /> and its
          fan-triangulation proof), which is covered by many resources, and focus on the algorithm of <Cite k="5" />.
        </Aside>
      </Sub>

      <Sub id="literature" num="R.3" title="Related work: the main results">
        <p>We read the five papers on the problem itself ([1]–[6]) and the classical results they build on. Their main statements, in short:</p>
        <ul>
          <li><b>Art gallery problems.</b> Chvátal <Cite k="7" />: <M>{'\\lfloor n/3 \\rfloor'}</M> point guards always suffice to see a simple polygon, and are sometimes necessary.
            Lee and Lin <Cite k="8" />: minimising the number of guards is NP-hard, already when guards must be placed at vertices. Abrahamsen, Adamaszek and Miltzow <Cite k="9" />: the art gallery problem is <M>{'\\exists\\mathbb{R}'}</M>-complete.
            Stade <Cite k="10" />: guarding only the boundary with point guards is <M>{'\\exists\\mathbb{R}'}</M>-hard.</li>
          <li><b>One guard.</b> Lee and Preparata <Cite k="13" />: the kernel of a polygon (the points that see all of it) can be computed in <M>O(n)</M> time; this decides whether <M>k = 1</M>.</li>
          <li><b>First polynomial algorithms (2024–2025).</b> Merrild, Rysgaard, Schou and Svenning <Cite k="2" />: the greedy algorithm uses at most <M>k+1</M> guards; restarting it <M>O(kn^3)</M> times gives an
            optimal solution in <M>O(kn^5\log n)</M> time; their approach does not extend to polygons with holes, for which the complexity is open.
            Biniaz et al. <Cite k="3" />: an exact algorithm that computes <M>O(n^4)</M> candidate guard locations and combines them; they also show that <M>{'\\lfloor (n-2)/2 \\rfloor'}</M> contiguous guards always suffice. Robson, Spalding-Jamieson and Zheng <Cite k="4" />: a reduction to the
            <em>analytic arc cover problem</em>, solved with tools from real algebraic geometry; they showed that <M>{'\\mathrm{next}'}</M> is a piecewise function with <M>O(n^3)</M> pieces <Cite k="6" />. The three works were merged at SoCG 2025 <Cite k="1" />.</li>
          <li><b>Our paper.</b> de Berg, Conradi, van der Hoog and Staals <Cite k="5" />: <M>O(n^2)</M> starting points suffice and one greedy step costs <M>O(\log^2 n)</M>, hence <M>O(kn^2\log^2 n)</M>.</li>
          <li><b>Optimal bound.</b> de Berg, Conradi, van der Hoog and Rotenberg <Cite k="6" />: <M>O(n)</M> starting points, <M>{'\\mathrm{next}'}</M> with <M>O(n)</M> Möbius pieces, an <M>O(n\log n)</M>
            algorithm, and a matching <M>\Omega(n\log n)</M> lower bound by reduction from set disjointness.</li>
          <li><b>Tools.</b> Guibas and Hershberger <Cite k="11" />: shortest-path queries in a simple polygon in <M>O(\log n)</M> after linear preprocessing. Guibas et al. <Cite k="12" />: visibility and
            shortest-path trees in linear time in a triangulated simple polygon. Hershberger and Suri <Cite k="14" />: ray shooting in <M>O(\log n)</M>.</li>
        </ul>
      </Sub>

      <Sub id="implementation" num="R.4" title="Our implementation">
        <p>
          Everything on this page runs in the browser (JavaScript + React, no server). The geometry code is in <code>src/geometry/</code>:
          visibility (<code>visibility.js</code>), visibility cores (<code>core.js</code>), shortest paths (<code>shortestPath.js</code>), the arrangement
          (<code>arrangement.js</code>), the algorithm (<code>solver.js</code>) and the constructions used in the proofs (<code>proofs.js</code>).
          As announced in our proposal, we replaced the polylogarithmic data structures by simpler polynomial-time routines, which are fast enough for a few dozen vertices.
        </p>
        <div className="tbl-scroll">
          <table className="tbl">
            <thead><tr><th>File</th><th>Content</th></tr></thead>
            <tbody>
              <tr><td><code>vec.js</code>, <code>polygon.js</code></td><td>vectors, orientation test, boundary parameter, visibility test of a segment, simplicity test</td></tr>
              <tr><td><code>visibility.js</code></td><td>maximal chains seen by a point</td></tr>
              <tr><td><code>core.js</code></td><td>visibility cores (intersection of half-planes)</td></tr>
              <tr><td><code>shortestPath.js</code></td><td>shortest paths inside <M>P</M></td></tr>
              <tr><td><code>arrangement.js</code></td><td>vertices of the arrangement of the supporting lines inside <M>P</M></td></tr>
              <tr><td><code>solver.js</code></td><td><M>G_P</M>, <M>U_P</M>, <M>{'\\mathrm{next}'}</M>, the greedy algorithm, the full algorithm</td></tr>
              <tr><td><code>proofs.js</code></td><td>the constructions of the proofs, used by the figures and the tests</td></tr>
              <tr><td><code>generate.js</code></td><td>random simple polygons for the game</td></tr>
            </tbody>
          </table>
        </div>
        <p>
          <b>Simplifications.</b> Shortest paths are computed on the visibility graph of the vertices (Floyd–Warshall); the arrangement is computed by
          intersecting all pairs of supporting lines; the search for bad guards scans the edges after <M>u</M> one by one instead of a binary search,
          maintaining the visibility core incrementally and stopping as soon as it becomes empty. The algorithm is the same; only the speed of the
          subroutines changes. The solver also stops early: if the first greedy run uses <M>m</M> guards, then <M>{'k\\ge m-1'}</M>, so a run with
          <M>m-1</M> guards is optimal. On random polygons the full algorithm takes about 10&nbsp;ms for <M>n=12</M>, 26&nbsp;ms for <M>n=20</M>,
          121&nbsp;ms for <M>n=30</M> and 0.3–0.4&nbsp;s for <M>n=40</M>.
        </p>
        <p>We tested the implementation against independent brute-force computations (<code>npm test</code>, <code>tests/</code>):</p>
        <ul>
          <li>visibility chains agree with direct segment tests on random points;</li>
          <li><M>{'\\mathrm{next}(u)'}</M> computed as in Lemma 6.8 is never beaten by a dense grid of candidate guards;</li>
          <li>the greedy from 200 evenly spaced starts never finds fewer guards than the <M>U_P</M>-based optimum, and no greedy run uses more than <M>k+1</M> guards;</li>
          <li>on the guards of 60 random polygons (<code>node tests/proofs-test.mjs 60</code>), Proposition 4.3 / Corollary 4.7 produced a valid replacement for all 8&nbsp;647 good guards and Lemma 4.9 for all 1&nbsp;381 bad guards, our Lemma 6.2 construction matched the visibility computation in all 5&nbsp;014 cases, and the walk-through of Theorem 5.4 ended at a point of <M>U_P</M> in all 61 cases.</li>
        </ul>
        <Aside title="Robustness.">
          The algorithm constantly uses points that lie exactly on supporting lines (arrangement vertices see their defining edges "edge-on") and segments that graze
          reflex vertices. We therefore treat <M>P</M> as a closed set, test visibility by splitting a segment at all its contacts with the boundary, and use small
          tolerances. The example polygons are slightly perturbed so that they are in general position, as assumed in the paper.
        </Aside>
        <h3 className="tbl-title">The interactive figures</h3>
        <div className="tbl-scroll">
          <table className="tbl">
            <thead><tr><th>Figure</th><th>Section</th><th>What it shows</th><th>Explained by</th></tr></thead>
            <tbody>
              <tr><td>1</td><td>Overview</td><td>a contiguous guard, the maximal chains it sees, an optimal solution</td><td>Ilias</td></tr>
              <tr><td>2</td><td>2.1</td><td>the visibility core of a chain</td><td>Ilias</td></tr>
              <tr><td>3</td><td>2.2</td><td>the greedy algorithm and the <M>k+1</M> bound</td><td>Ilias</td></tr>
              <tr><td>4</td><td>2.3</td><td>good and bad guards (Definition 4.1)</td><td>Ilias</td></tr>
              <tr><td>5</td><td>2.4</td><td>replacement of good guards (Corollary 4.7) and bad guards (Lemma 4.9)</td><td>Ilias</td></tr>
              <tr><td>6</td><td>2.5</td><td>the arrangement, <M>G_P</M> and <M>U_P</M></td><td>Jomaa</td></tr>
              <tr><td>7</td><td>2.6</td><td>Theorem 5.4 step by step</td><td>Jomaa</td></tr>
              <tr><td>8</td><td>2.7</td><td>Lemma 6.2</td><td>Jomaa</td></tr>
              <tr><td>9</td><td>2.8</td><td>one greedy step (Lemma 6.8)</td><td>Jomaa</td></tr>
              <tr><td>10</td><td>2.9</td><td>the complete algorithm (Theorem 7.1)</td><td>Jomaa</td></tr>
              <tr><td>11</td><td>2.10</td><td>the function <M>{'\\mathrm{next}'}</M>, basis of the <M>\Theta(n\log n)</M> algorithm</td><td>Jomaa</td></tr>
            </tbody>
          </table>
        </div>
        <p>In the game (page <a href={link('/play')}>Play</a>), the page generates a random simple polygon, the player places guards and chooses their chains, and the
          game checks the solution and compares it with the optimum computed by our solver.</p>
      </Sub>

      <Sub id="team" num="R.5" title="Team: who did what">
        <p>
          <b>Authors.</b> Ilias Akajou (520466) and Jomaa Abdulrahman (583629). We both submit this same project.
        </p>
        <p>
          <b>How we followed the professor's feedback.</b> Our proposal had four parts: 1. the problem, 2. the algorithm of <Cite k="5" />, 3. a game,
          4. the report. It planned that Ilias would work on part 1, Jomaa on part 2, and both on parts 3 and 4. The professor asked us to keep part 1 short,
          because the classical art gallery problem is well covered elsewhere, to both work on part 2, the core of the project, and to split its explanations,
          with web widgets for the steps of the proof. We did so: part 1 is now a single section of the overview, and part 2 is split into two halves of the proof,
          each of us explaining one half, with one interactive widget per step.
        </p>

        <h3 className="tbl-title">Part 2, the algorithm of [5]: who did which step of the proof</h3>
        <div className="tbl-scroll">
          <table className="tbl">
            <thead><tr><th>Step of the proof</th><th>Who</th><th>Section, widget</th><th>Code</th></tr></thead>
            <tbody>
              <tr><td>Visibility cores; one guard is enough if and only if <M>P</M> is star-shaped (Obs. 2.1, 2.2)</td><td>Ilias</td><td>2.1, Figure 2</td><td><code>core.js</code>, <code>visibility.js</code></td></tr>
              <tr><td>The greedy algorithm: at most <M>k+1</M> guards, and <M>k</M> from the right start</td><td>Ilias</td><td>2.2, Figure 3</td><td><code>solver.js</code>: <code>next</code>, <code>greedy</code>, <code>solve</code></td></tr>
              <tr><td>Good and bad guards (Def. 4.1)</td><td>Ilias</td><td>2.3, Figure 4</td><td><code>solver.js</code>: <code>classifyGuard</code></td></tr>
              <tr><td>Replacing guards by arrangement vertices (Prop. 4.3, Lemmas 4.2–4.6, Cor. 4.7, Lemma 4.9)</td><td>Ilias</td><td>2.4, Figure 5</td><td><code>proofs.js</code>: <code>replaceGoodGuard</code>, <code>lemma49</code></td></tr>
              <tr><td>The arrangement, candidate guards <M>G_P</M> and start points <M>U_P</M> (Def. 5.1, 5.2, Lemma 5.3)</td><td>Jomaa</td><td>2.5, Figure 6</td><td><code>arrangement.js</code>; <code>solver.js</code>: <code>candidateGuards</code>, <code>startPoints</code></td></tr>
              <tr><td>Theorem 5.4: an optimal solution starts in <M>U_P</M></td><td>Jomaa</td><td>2.6, Figure 7</td><td><code>proofs.js</code>: <code>theorem54</code></td></tr>
              <tr><td>The maximal visible chain: two shortest paths and two rays (Lemma 6.2)</td><td>Jomaa</td><td>2.7, Figure 8</td><td><code>shortestPath.js</code>; <code>proofs.js</code>: <code>maximalChainLemma62</code></td></tr>
              <tr><td>One greedy step in <M>{'O(\\log^2 n)'}</M>, bad guards on the line <M>\ell_u</M> (Lemmas 6.5–6.8)</td><td>Jomaa</td><td>2.8, Figure 9</td><td><code>solver.js</code>: <code>nextBad</code></td></tr>
              <tr><td>The complete algorithm in <M>{'O(kn^2\\log^2 n)'}</M> (Theorem 7.1)</td><td>Jomaa</td><td>2.9, Figure 10</td><td>uses <code>solve</code></td></tr>
              <tr><td>The optimal <M>{'\\Theta(n\\log n)'}</M> algorithm and its lower bound <Cite k="6" /></td><td>Jomaa</td><td>2.10, Figure 11</td><td>(not implemented)</td></tr>
            </tbody>
          </table>
        </div>

        <h3 className="tbl-title">The other parts</h3>
        <div className="tbl-scroll">
          <table className="tbl">
            <thead><tr><th>Part</th><th>Ilias Akajou</th><th>Jomaa Abdulrahman</th></tr></thead>
            <tbody>
              <tr><td>1. The problem (kept short)</td><td>Overview 01–02 and Figure 1: the problem, the simple-polygon assumption, why the problem is surprising</td><td>Pointed out that the simple-polygon assumption had to be stated on the overview</td></tr>
              <tr><td>Geometry basics</td><td><code>vec.js</code>, <code>polygon.js</code> (visibility test, simplicity test)</td><td></td></tr>
              <tr><td>3. Game and sandbox</td><td>The game and the sandbox (<code>GameWidget.jsx</code>), random simple polygons (<code>generate.js</code>)</td><td></td></tr>
              <tr><td>Validation</td><td>Automatic tests against brute force (<code>tests/</code>), the precision found on Lemma 6.2, overview section 05</td><td></td></tr>
              <tr><td>4. Report</td><td>R.1 Summary, R.2 Context</td><td>R.3 Related work, R.4 Implementation</td></tr>
              <tr><td>Site</td><td>Structure, design and animations, deployment on GitHub Pages</td><td>Review of the site</td></tr>
              <tr><td>Presentation (12 min)</td><td>0:00–5:15 and 10:00–11:15</td><td>5:15–10:00 and 11:15–12:00 (game, conclusion)</td></tr>
            </tbody>
          </table>
        </div>
        <h3 className="tbl-title">Individual contributions, in short</h3>
        <p>
          <b>Ilias Akajou.</b> The first half of the proof (Sections 2.1–2.4, Figures 2–5: visibility cores, the greedy algorithm and its <M>k+1</M> bound,
          good and bad guards, replacement of guards); the validation (automatic tests against brute force, with the precision found on Lemma 6.2); the problem
          (overview and Figure 1), the game, the geometry basics of the code, and the structure and design of the site; he led the development sessions.
          At the oral: 0:00–5:15 and 10:00–11:15.
        </p>
        <p>
          <b>Jomaa Abdulrahman.</b> The second half of the proof (Sections 2.5–2.10, Figures 6–11: <M>G_P</M> and <M>U_P</M>, Theorem 5.4, Lemma 6.2, one greedy
          step, the complete algorithm and the <M>\Theta(n\log n)</M> algorithm); the report sections on related work and implementation; the review of the site,
          where he found that the simple-polygon assumption was missing. At the oral: 5:15–10:00, then the game and the conclusion (11:15–12:00).
        </p>
        <p>
          <b>Together:</b> the choice of the topic, the proposal and its revision, the division of the work, Sections R.5–R.7 of the report, and the AI journal.
        </p>
        <p>
          <b>How we worked.</b> The code, the widgets and the first drafts of the texts were produced with an AI assistant, in development sessions led by Ilias
          (Section R.6). For each part, the person named above checked it against the paper, tested it, and explains it in the presentation.
        </p>
        <p>
          <b>Acknowledgements.</b> We thank our professor for the feedback on our proposal, and a fellow student for feedback on the course forum: the overview page
          had too many animations, so they now play once, can be replayed, and can be switched off (⏸ in the top bar). The use of AI is acknowledged in Section R.6.
        </p>
      </Sub>

      <Sub id="ai" num="R.6" title="Sources, AI assistance and credits">
        <p>
          <b>Sources.</b> All definitions, lemmas and theorems of the proof chapters are paraphrased from de Berg, Conradi, van der Hoog and Staals <Cite k="5" />, and keep
          the numbering of that paper; Chapter 5 summarises <Cite k="6" />. The proof sketches are our own rewording of their proofs. All figures and animations are our own:
          they are computed by our implementation, and no figure was copied from the papers.
        </p>
        <p>
          <b>Use of AI.</b> We used an AI assistant (Claude Code by Anthropic, model Claude Opus 5.5) as a tool: at our request it explained the papers,
          implemented and tested the code, and drafted the texts of this site. We decided what to build, what to keep and what to change, and we checked the
          results with the automated tests and against the papers (Section R.4). Our AI journal, provided with the submission, describes this use, the access
          limits we met, and how we checked, corrected or rejected the results.
        </p>
        <p>
          <b>Software.</b> The site uses React and Vite (MIT licence), KaTeX (MIT) for formulas, vite-plugin-singlefile (MIT) for the offline version, and the fonts Inter,
          Instrument Serif and JetBrains Mono (SIL Open Font License), distributed through the Fontsource packages. No other code was reused.
        </p>
      </Sub>

      <Sub id="refs" num="R.7" title="References">
        <ol className="refs">
          <li id="ref-1">A. Biniaz, A. Maheshwari, M. C. R. Merrild, J. S. B. Mitchell, S. Odak, V. Polishchuk, E. W. Robson, C. M. Rysgaard, J. K. R. Schou, T. Shermer, J. Spalding-Jamieson, R. Svenning, D. W. Zheng. Polynomial-time algorithms for contiguous art gallery and related problems. In <em>Proc. 41st International Symposium on Computational Geometry (SoCG 2025)</em>, volume 332 of LIPIcs, pages 20:1–20:21, 2025. Open access: <a href="https://doi.org/10.4230/LIPIcs.SoCG.2025.20">doi:10.4230/LIPIcs.SoCG.2025.20</a>.</li>
          <li id="ref-2">M. C. R. Merrild, C. M. Rysgaard, J. K. R. Schou, R. Svenning. The contiguous art gallery problem is solvable in polynomial time. <a href="https://arxiv.org/abs/2412.13938">arXiv:2412.13938</a>, 2024 (v3, 2025). Merged into [1]; full version.</li>
          <li id="ref-3">A. Biniaz, P. Bose, A. Maheshwari, J. S. B. Mitchell, S. Odak, V. Polishchuk, T. C. Shermer. Contiguous boundary guarding. <a href="https://arxiv.org/abs/2412.15053">arXiv:2412.15053</a>, 2024 (v2, 2025). Merged into [1]; full version.</li>
          <li id="ref-4">E. W. Robson, J. Spalding-Jamieson, D. W. Zheng. The analytic arc cover problem and its applications to contiguous art gallery, polygon separation, and shape carving. <a href="https://arxiv.org/abs/2412.15567">arXiv:2412.15567</a>, 2024 (v2, 2025). Merged into [1]; full version.</li>
          <li id="ref-5"><strong>S. de Berg, J. Conradi, I. van der Hoog, F. Staals. Simpler and faster contiguous art gallery. <a href="https://arxiv.org/abs/2508.09734">arXiv:2508.09734</a>, 2025.</strong> (main article of this project)</li>
          <li id="ref-6">S. de Berg, J. Conradi, I. van der Hoog, E. Rotenberg. The contiguous art gallery problem is in Θ(n log n). <a href="https://arxiv.org/abs/2511.02960">arXiv:2511.02960</a>, 2025 (v6, 2026).</li>
          <li id="ref-7">V. Chvátal. A combinatorial theorem in plane geometry. <em>Journal of Combinatorial Theory, Series B</em>, 18(1):39–41, 1975. <a href="https://doi.org/10.1016/0095-8956(75)90061-1">doi:10.1016/0095-8956(75)90061-1</a>.</li>
          <li id="ref-8">D. T. Lee, A. K. Lin. Computational complexity of art gallery problems. <em>IEEE Transactions on Information Theory</em>, 32(2):276–282, 1986. <a href="https://doi.org/10.1109/TIT.1986.1057165">doi:10.1109/TIT.1986.1057165</a>.</li>
          <li id="ref-9">M. Abrahamsen, A. Adamaszek, T. Miltzow. The art gallery problem is ∃ℝ-complete. <em>Journal of the ACM</em>, 69(1):4:1–4:70, 2022. <a href="https://doi.org/10.1145/3486220">doi:10.1145/3486220</a>. Preliminary version in STOC 2018. Open access: <a href="https://arxiv.org/abs/1704.06969">arXiv:1704.06969</a>.</li>
          <li id="ref-10">J. Stade. The point-boundary art gallery problem is ∃ℝ-hard. In <em>Proc. 41st International Symposium on Computational Geometry (SoCG 2025)</em>, volume 332 of LIPIcs, pages 74:1–74:23, 2025. Open access: <a href="https://doi.org/10.4230/LIPIcs.SoCG.2025.74">doi:10.4230/LIPIcs.SoCG.2025.74</a>.</li>
          <li id="ref-11">L. J. Guibas, J. Hershberger. Optimal shortest path queries in a simple polygon. <em>Journal of Computer and System Sciences</em>, 39(2):126–152, 1989. <a href="https://doi.org/10.1016/0022-0000(89)90041-X">doi:10.1016/0022-0000(89)90041-X</a>.</li>
          <li id="ref-12">L. J. Guibas, J. Hershberger, D. Leven, M. Sharir, R. E. Tarjan. Linear-time algorithms for visibility and shortest path problems inside triangulated simple polygons. <em>Algorithmica</em>, 2:209–233, 1987. <a href="https://doi.org/10.1007/BF01840360">doi:10.1007/BF01840360</a>.</li>
          <li id="ref-13">D. T. Lee, F. P. Preparata. An optimal algorithm for finding the kernel of a polygon. <em>Journal of the ACM</em>, 26(3):415–421, 1979. <a href="https://doi.org/10.1145/322139.322142">doi:10.1145/322139.322142</a>.</li>
          <li id="ref-14">J. Hershberger, S. Suri. A pedestrian approach to ray shooting: shoot a ray, take a walk. <em>Journal of Algorithms</em>, 18(3):403–431, 1995. <a href="https://doi.org/10.1006/jagm.1995.1017">doi:10.1006/jagm.1995.1017</a>. Preliminary version in SODA 1993.</li>
        </ol>
      </Sub>
      </article>
    </div>
  );
}
