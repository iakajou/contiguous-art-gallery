import React from 'react';
import { M } from '../components/ui.jsx';
import { Sub, Thm, Cite, Aside } from '../sections/blocks.jsx';
import { link } from '../router.js';

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
      </Sub>

      <Sub id="context" num="R.2" title="Context: why this problem is surprising">
        <p>
          Most art gallery problems are hard. The classical one (point guards that must see the whole polygon) is NP-hard <Cite k="8" /> and even{' '}
          <M>{'\\exists\\mathbb{R}'}</M>-complete <Cite k="9" />, and guarding only the boundary with point guards is <M>{'\\exists\\mathbb{R}'}</M>-hard as
          well <Cite k="10" />. Adding the contiguity constraint looks like it should make things harder, but it does the opposite: every guard covers a single
          interval of a one-dimensional object, the boundary, and covering a circle with intervals is easy once we know which intervals to use.
        </p>
        <table className="tbl tbl-wide">
          <thead><tr><th>Year</th><th>Reference</th><th>Main idea</th><th>Running time</th></tr></thead>
          <tbody>
            <tr><td>2024</td><td>Shermer (CCCG open problem)</td><td>problem posed</td><td>open</td></tr>
            <tr><td>2024–25</td><td><Cite k="2" /> <Cite k="3" /> <Cite k="4" /> → <Cite k="1" /> (SoCG 2025)</td><td>repeated greedy / <M>O(n^4)</M> candidates / analytic arc cover</td><td><M>O(kn^5\log n)</M>, <M>O(n^6 \log n)</M></td></tr>
            <tr className="hl"><td>2025</td><td>de Berg, Conradi, van der Hoog, Staals <Cite k="5" /></td><td>greedy from <M>O(n^2)</M> candidate starts</td><td><M>O(kn^2\log^2 n)</M></td></tr>
            <tr><td>2025–26</td><td>de Berg, Conradi, van der Hoog, Rotenberg <Cite k="6" /></td><td>dominators, sliding window, Möbius pieces</td><td><M>\Theta(n\log n)</M></td></tr>
          </tbody>
        </table>
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
            Biniaz et al. <Cite k="3" />: a candidate set of <M>O(n^4)</M> guards always contains a guard of some optimal solution. Robson, Spalding-Jamieson and Zheng <Cite k="4" />: a reduction to the
            <em>analytic arc cover problem</em>, where <M>{'\\mathrm{next}'}</M> has <M>O(n^3)</M> pieces, giving <M>O(n^6\log n)</M>. The three works were merged at SoCG 2025 <Cite k="1" />.</li>
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
        <p>We tested the implementation against independent brute-force computations (<code>npm test</code>, <code>tests/</code>):</p>
        <ul>
          <li>visibility chains agree with direct segment tests on random points;</li>
          <li><M>{'\\mathrm{next}(u)'}</M> computed as in Lemma 6.8 is never beaten by a dense grid of candidate guards;</li>
          <li>the greedy from 200 evenly spaced starts never finds fewer guards than the <M>U_P</M>-based optimum, and no greedy run uses more than <M>k+1</M> guards;</li>
          <li>on more than 13&nbsp;000 random guards, Proposition 4.3 / Corollary 4.7 (good guards) and Lemma 4.9 (bad guards) always produced a valid replacement, and our Lemma 6.2 construction always matched the visibility computation; the walk-through of Theorem 5.4 always ended at a point of <M>U_P</M>.</li>
        </ul>
        <Aside title="Robustness.">
          The algorithm constantly uses points that lie exactly on supporting lines (arrangement vertices see their defining edges "edge-on") and segments that graze
          reflex vertices. We therefore treat <M>P</M> as a closed set, test visibility by splitting a segment at all its contacts with the boundary, and use small
          tolerances. The example polygons are slightly perturbed so that they are in general position, as assumed in the paper.
        </Aside>
      </Sub>

      <Sub id="team" num="R.5" title="Team and individual contributions">
        <p>
          Following the feedback on our proposal, we both worked on the explanation of the algorithm and split its steps between us. Each chapter of the proof
          shows who explains it.
        </p>
        <table className="tbl">
          <thead><tr><th>Part</th><th>Content</th><th>Explained by</th></tr></thead>
          <tbody>
            <tr><td>Overview</td><td>The problem, why it is surprising</td><td>Ilias Akajou</td></tr>
            <tr><td>Chapter 1</td><td>Visibility cores, greedy algorithm</td><td>Ilias Akajou</td></tr>
            <tr><td>Chapter 2</td><td>Good and bad guards, replacement lemmas</td><td>Ilias Akajou</td></tr>
            <tr><td>Chapter 3</td><td>Candidate guards, start points, Theorem 5.4</td><td>Jomaa Abdulrahman</td></tr>
            <tr><td>Chapter 4</td><td>Maximal visible chains, fast greedy step, complete algorithm</td><td>Jomaa Abdulrahman</td></tr>
            <tr><td>Chapter 5</td><td>The Θ(n log n) algorithm</td><td>Jomaa Abdulrahman</td></tr>
            <tr><td>Play, report</td><td>Game, sandbox, this report</td><td>both</td></tr>
          </tbody>
        </table>
        <p>
          The implementation (solver, figures, game) and the design of the site are joint work. The detailed split of what each of us did, and what was done with AI
          assistance, is given in our work-split document and in our AI journal (Section R.6).
        </p>
      </Sub>

      <Sub id="ai" num="R.6" title="Sources, AI assistance and credits">
        <p>
          <b>Sources.</b> All definitions, lemmas and theorems of the proof chapters are paraphrased from de Berg, Conradi, van der Hoog and Staals <Cite k="5" />, and keep
          the numbering of that paper; Chapter 5 summarises <Cite k="6" />. The proof sketches are our own rewording of their proofs. All figures and animations are our own:
          they are computed by our implementation, and no figure was copied from the papers.
        </p>
        <p>
          <b>Use of AI.</b> We used an AI assistant (Claude, by Anthropic, through Claude Code) intensively: to read the papers with us, to write the JavaScript
          implementation and its tests, to design the figures and the site, and to draft explanatory documents. We checked its output against the papers and with
          automatic tests against brute-force computations; several of its first results were wrong and were corrected (for example the choice of the ray hit in Lemma 6.2),
          and the importance of the simple-polygon assumption was pointed out by one of us. Our <a href="./ai-journal.pdf">AI journal</a> lists the tools, the significant
          prompts and answers, how we checked, corrected or rejected the results, and our own decisions.
        </p>
        <p>
          <b>Software.</b> The site uses React and Vite (MIT licence), KaTeX (MIT) for formulas, vite-plugin-singlefile (MIT) for the offline version, and the fonts Inter,
          Instrument Serif and JetBrains Mono (SIL Open Font License), distributed through the Fontsource packages. No other code was reused.
        </p>
      </Sub>

      <Sub id="refs" num="R.7" title="References">
        <ol className="refs">
          <li id="ref-1">A. Biniaz, A. Maheshwari, M. C. R. Merrild, J. S. B. Mitchell, S. Odak, V. Polishchuk, E. W. Robson, C. M. Rysgaard, J. K. R. Schou, T. Shermer, J. Spalding-Jamieson, R. Svenning, D. W. Zheng. Polynomial-time algorithms for contiguous art gallery and related problems. <em>SoCG 2025</em>, LIPIcs 332, 20:1–20:21. <a href="https://doi.org/10.4230/LIPIcs.SoCG.2025.20">doi:10.4230/LIPIcs.SoCG.2025.20</a></li>
          <li id="ref-2">M. C. R. Merrild, C. M. Rysgaard, J. K. R. Schou, R. Svenning. The contiguous art gallery problem is solvable in polynomial time. <a href="https://arxiv.org/abs/2412.13938">arXiv:2412.13938</a>, 2024.</li>
          <li id="ref-3">A. Biniaz, P. Bose, A. Maheshwari, J. S. B. Mitchell, S. Odak, V. Polishchuk, T. C. Shermer. Contiguous boundary guarding. <a href="https://arxiv.org/abs/2412.15053">arXiv:2412.15053</a>, 2024.</li>
          <li id="ref-4">E. W. Robson, J. Spalding-Jamieson, D. W. Zheng. The analytic arc cover problem and its applications to contiguous art gallery, polygon separation, and shape carving. <a href="https://arxiv.org/abs/2412.15567">arXiv:2412.15567</a>, 2024.</li>
          <li id="ref-5"><strong>S. de Berg, J. Conradi, I. van der Hoog, F. Staals. Simpler and faster contiguous art gallery. <a href="https://arxiv.org/abs/2508.09734">arXiv:2508.09734</a>, 2025.</strong> (main article of this project)</li>
          <li id="ref-6">S. de Berg, J. Conradi, I. van der Hoog, E. Rotenberg. The contiguous art gallery problem is in Θ(n log n). <a href="https://arxiv.org/abs/2511.02960">arXiv:2511.02960</a>, 2025–2026.</li>
          <li id="ref-7">V. Chvátal. A combinatorial theorem in plane geometry. <em>J. Combin. Theory Ser. B</em> 18(1):39–41, 1975.</li>
          <li id="ref-8">D. T. Lee, A. K. Lin. Computational complexity of art gallery problems. <em>IEEE Trans. Inf. Theory</em> 32(2):276–282, 1986.</li>
          <li id="ref-9">M. Abrahamsen, A. Adamaszek, T. Miltzow. The art gallery problem is ∃ℝ-complete. <em>J. ACM</em> 69(1), 2022. <a href="https://arxiv.org/abs/1704.06969">arXiv:1704.06969</a></li>
          <li id="ref-10">J. Stade. The point-boundary art gallery problem is ∃ℝ-hard. <em>SoCG 2025</em>, LIPIcs 332, 74:1–74:23.</li>
          <li id="ref-11">L. J. Guibas, J. Hershberger. Optimal shortest path queries in a simple polygon. <em>J. Comput. Syst. Sci.</em> 39(2):126–152, 1989.</li>
          <li id="ref-12">L. J. Guibas, J. Hershberger, D. Leven, M. Sharir, R. E. Tarjan. Linear-time algorithms for visibility and shortest path problems inside triangulated simple polygons. <em>Algorithmica</em> 2:209–233, 1987.</li>
          <li id="ref-13">D. T. Lee, F. P. Preparata. An optimal algorithm for finding the kernel of a polygon. <em>J. ACM</em> 26(3):415–421, 1979.</li>
          <li id="ref-14">J. Hershberger, S. Suri. A pedestrian approach to ray shooting: shoot a ray, take a walk. <em>SODA 1993</em>, 54–63.</li>
        </ol>
      </Sub>
      </article>
    </div>
  );
}
