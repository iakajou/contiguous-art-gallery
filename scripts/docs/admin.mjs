// Documents 4 and 5 (EN): work split and AI journal (drafts for the students to complete).

export function workSplit() {
  return String.raw`
<div class="cover">
  <div class="kicker">INFO-F420 Computational Geometry · ULB · 2026–2027</div>
  <h1>Work distribution</h1>
  <p class="subtitle">Guarding Walls Contiguously — Ilias Akajou (520466) and Jomaa Abdulrahman (583629)</p>
  <p class="draft">Same content as Section R.5 of the report (“Team: who did what”). To check together before the submission.</p>
</div>
<h2>1. How we followed the professor's feedback</h2>
<p>Our proposal had four parts: 1. the problem, 2. the algorithm of [5], 3. a game, 4. the report. It planned that Ilias would work on part 1, Jomaa on part 2,
and both on parts 3 and 4. The professor asked us to keep part 1 short, to both work on part 2, the core of the project, and to split its explanations,
with web widgets for the steps of the proof. We did so: part 1 is a single section of the overview, and part 2 is split into two halves of the proof,
each of us doing one half, with one interactive widget per step.</p>
<h2>2. Part 2, the algorithm of [5]: who did which step of the proof</h2>
<table><thead><tr><th>Step of the proof</th><th>Section, widget</th><th>Code</th><th>Who</th></tr></thead><tbody>
<tr><td>Visibility cores; one guard is enough if and only if $P$ is star-shaped (Obs. 2.1, 2.2)</td><td>2.1, Fig. 2</td><td><code>core.js</code>, <code>visibility.js</code></td><td>Ilias</td></tr>
<tr><td>The greedy algorithm: at most $k+1$ guards, and $k$ from the right start</td><td>2.2, Fig. 3</td><td><code>solver.js</code>: <code>next</code>, <code>greedy</code>, <code>solve</code></td><td>Ilias</td></tr>
<tr><td>Good and bad guards (Def. 4.1)</td><td>2.3, Fig. 4</td><td><code>solver.js</code>: <code>classifyGuard</code></td><td>Ilias</td></tr>
<tr><td>Replacing guards by arrangement vertices (Prop. 4.3, Lemmas 4.2–4.6, Cor. 4.7, Lemma 4.9)</td><td>2.4, Fig. 5</td><td><code>proofs.js</code>: <code>replaceGoodGuard</code>, <code>lemma49</code></td><td>Ilias</td></tr>
<tr><td>The arrangement, candidate guards $G_P$ and start points $U_P$ (Def. 5.1, 5.2, Lemma 5.3)</td><td>2.5, Fig. 6</td><td><code>arrangement.js</code>; <code>solver.js</code>: <code>candidateGuards</code>, <code>startPoints</code></td><td>Jomaa</td></tr>
<tr><td>Theorem 5.4: an optimal solution starts in $U_P$</td><td>2.6, Fig. 7</td><td><code>proofs.js</code>: <code>theorem54</code></td><td>Jomaa</td></tr>
<tr><td>The maximal visible chain: two shortest paths and two rays (Lemma 6.2)</td><td>2.7, Fig. 8</td><td><code>shortestPath.js</code>; <code>proofs.js</code>: <code>maximalChainLemma62</code></td><td>Jomaa</td></tr>
<tr><td>One greedy step in $O(\log^2 n)$, bad guards on the line $\ell_u$ (Lemmas 6.5–6.8)</td><td>2.8, Fig. 9</td><td><code>solver.js</code>: <code>nextBad</code></td><td>Jomaa</td></tr>
<tr><td>The complete algorithm in $O(kn^2\log^2 n)$ (Theorem 7.1)</td><td>2.9, Fig. 10</td><td>uses <code>solve</code></td><td>Jomaa</td></tr>
<tr><td>The optimal $\Theta(n\log n)$ algorithm and its lower bound [6]</td><td>2.10, Fig. 11</td><td>(not implemented)</td><td>Jomaa</td></tr>
</tbody></table>
<h2>3. The other parts</h2>
<table><thead><tr><th>Part</th><th>Ilias Akajou</th><th>Jomaa Abdulrahman</th></tr></thead><tbody>
<tr><td>1. The problem (kept short)</td><td>Overview 01–02 and Figure 1</td><td>Pointed out that the simple-polygon assumption had to be stated on the overview</td></tr>
<tr><td>Geometry basics</td><td><code>vec.js</code>, <code>polygon.js</code></td><td></td></tr>
<tr><td>3. Game and sandbox</td><td><code>GameWidget.jsx</code>, <code>generate.js</code></td><td></td></tr>
<tr><td>Validation</td><td></td><td>Automatic tests (<code>tests/</code>), overview section 05</td></tr>
<tr><td>4. Report</td><td>R.1 Summary, R.2 Context</td><td>R.3 Related work, R.4 Implementation</td></tr>
<tr><td>Site</td><td>Structure, design, animations, deployment</td><td>Review of the site</td></tr>
<tr><td>Presentation (12 min)</td><td>0:00–5:15 and 11:15–12:00</td><td>5:15–11:15</td></tr>
</tbody></table>
<h2>4. Together, and how we worked</h2>
<p>Together: the choice of the topic, the proposal and its revision, the division of the work, Sections R.5–R.7 of the report, and the AI journal.</p>
<p>The code, the widgets and the first drafts of the texts were produced with an AI assistant, in development sessions led by Ilias. For each part, the person named
above checked it against the paper, tested it, and explains it in the presentation.</p>
<h2>5. External help</h2>
<p>Professor's feedback on the proposal; a fellow student's feedback on the forum (animations of the overview); an AI assistant (Claude, Anthropic), documented in the AI journal.</p>
`;
}

export function aiJournal(info) {
  return String.raw`
<div class="cover">
  <div class="kicker">INFO-F420 Computational Geometry · ULB · 2026–2027</div>
  <h1>AI journal</h1>
  <p class="subtitle">Guarding Walls Contiguously — Ilias Akajou (520466) and Jomaa Abdulrahman (583629)</p>
  <p class="draft">DRAFT prepared from the logs of the AI sessions. We must review it, complete the parts marked "to complete", add any other AI use, and keep it truthful.</p>
</div>

<h2>1. Tools and models</h2>
<table><tbody>
<tr><th>Tool</th><td>Claude Code (desktop app, "Code" tab), agentic coding assistant by Anthropic. It can read and write files in the project folder, run commands (Node, tests, headless Chrome) and open the site in a built-in browser.</td></tr>
<tr><th>Model</th><td>Claude Opus 5.5 (Anthropic).</td></tr>
<tr><th>Other tools</th><td><i>to complete</i> (e.g. Microsoft Copilot via ULB, if used).</td></tr>
<tr><th>Access limits</th><td><i>to complete</i> (subscription used, usage limits encountered).</td></tr>
<tr><th>Sources given to the AI</th><td>Our proposal (PDF), the professor's feedback, and the papers arXiv:2508.09734, 2511.02960 and 2412.13938, which the assistant downloaded and read.</td></tr>
</tbody></table>

<h2>2. Significant prompts and responses</h2>
<table><thead><tr><th>Date</th><th>Prompt (our words, translated)</th><th>Response (summary)</th></tr></thead><tbody>
<tr><td>2026-11-07</td><td>"Do this project: research on the internet, develop everything, make explanation PDFs, do what the professor asked" + proposal + feedback.</td>
<td>Read the papers; wrote the geometry library, the solver (algorithm of [5]), the tests, an English single-page site with 11 interactive figures and a game; French explanation PDFs; drafts of this journal and of the work split.</td></tr>
<tr><td>2026-11-09</td><td>"Rework the site to make it more modern; the home page should only contain what I will present orally, other pages for details; nice animations; one PDF that explains everything; a zip for my teammate."</td>
<td>Split the site into pages (overview = oral, five proof chapters, play, report); new design and animations replaying solver results; one complete French PDF with screenshots; a zip with a single-file version of the site.</td></tr>
<tr><td>2026-11-11</td><td>"Make me a PDF that explains the whole subject, I understood nothing." Then: our teammate's remark "the site does not say that the polygon is simple; this is crucial, otherwise the algorithm no longer works"; "check that everything respects the course requirements"; "give the code for CodeSandbox".</td>
<td>A step-by-step French PDF explaining the subject from scratch; the simple-polygon assumption stated on the home page, in Chapter 1, in the sandbox and in the report (checked in the papers: Merrild et al. write that their approach does not work with holes and that this case is open); report extended (related work, sources, AI use, licences); this journal restructured; a CodeSandbox-ready copy of the code.</td></tr>
<tr><td>2026-11-23</td><td>"I must do everything in the course checklist; make a good work distribution (who says what, who did what) and two PDFs explaining who says what and how." Plus a fellow student's forum feedback: "the overview page is a bit hard to follow with all the animations and transitions".</td>
<td>Checked the site against the checklist; added links to the public page and to the git repository, a work-distribution and acknowledgement section, and two presentation guides (one per student). Following the student's feedback, the overview shows its content at once, animations play once with a replay button, and a button turns them off.</td></tr>
<tr><td>2026-11-23</td><td>"We must say precisely who did what", with the professor's feedback on the proposal (keep part 1 short, both work on part 2 and split its explanations).</td>
<td>Rewrote the team section of the report: how we followed the feedback, who did which step of the proof (with its widget and its code), who did the other parts; one contribution document per student.</td></tr>
<tr><td>2026-11-24</td><td>"Make a detailed PDF that explains the whole project, in French: honestly, I understood nothing."</td>
<td>A French document that explains the course requirements, the problem, every step of the proof, our code, the site and the presentation, with questions to test ourselves.</td></tr>
<tr><td>2026-11-24</td><td>"Give a report in LaTeX that I can send to the professor."</td>
<td>A LaTeX version of the report of the webpage (problem, related work, proof sketch, implementation, who did what, use of AI, references), compiled and checked.</td></tr>
<tr><td>2026-11-24</td><td>"Check that everything is correct and respects what the professor said."</td>
<td>Compared the statements of the report with the papers, checked the links, the pages, the tests and the course checklist, and corrected the errors listed below.</td></tr>
</tbody></table>

<h2>3. How we used, checked, corrected or rejected the results</h2>
<h3>Checks</h3>
<ul>
<li>Automatic tests (<code>npm test</code>, last run: ${info.checks}): visibility against direct segment tests, next(u) against a dense grid of guards, the optimum against greedy runs from 200 start points, and every proof construction (Prop. 4.3, Lemmas 4.2–4.6, 4.9, 6.2, Theorem 5.4) on thousands of random guards.</li>
<li>Statements and numbering compared with the papers; the simple-polygon assumption checked in [2] and [5].</li>
<li>Every page opened in a browser (desktop and mobile widths, light and dark themes).</li>
</ul>
<h3>Corrections</h3>
<ul>
<li><b>Lemma 6.2.</b> The first implementation took the ray hit closest to $g$ and disagreed with a direct visibility computation in about 19% of random cases. Re-reading the proof showed that the right hit is the one closest to $m$ (definition of $u^*$). The statement of the paper is imprecise when the chain winds around $g$ more than once.</li>
<li><b>Animations (feedback from a fellow student).</b> The overview page was hard to follow; we made it calmer (see the 2026-11-23 session).</li>
<li><b>Simple polygon (found by Jomaa).</b> The site only stated the assumption in the chapter on notation; it is now explained on the home page and in the report, with the reason it is essential.</li>
<li><b>Related work (found when checking the report against the papers).</b> We had attributed a running time of $O(n^6\log n)$ to Robson et al. [4], whose paper gives no running time (this bound is in the abstract of Merrild et al. [2]); we had written that [5] has 11 pages (it has 12 with the references); we had described Biniaz et al. [3] in words that are not theirs; and the statement of Lemma 6.8 lacked its preprocessing time. All four are corrected.</li>
<li>Round-off when comparing boundary parameters modulo $n$; the angle of a guard whose chain makes a full turn; several display bugs (missing spaces next to formulas, a formula interpreted as code).</li>
</ul>
<h3>Rejected or not used</h3>
<ul>
<li>A claim that "being in the core and seeing both ends implies seeing the whole chain" was removed from a figure, because we could not justify it in all cases.</li>
<li>An experimental observation (in our random tests, starting the greedy at the vertices of $P$ was always enough) is reported only as an observation, not as a result: nothing in the papers guarantees it.</li>
<li>A reference to a EuroCG 2026 version of [6] was not added to the bibliography, because we could not check its details.</li>
</ul>

<h2>4. Our own decisions and contributions</h2>
<p class="draft">To complete by each of us, honestly. For example: choice of the topic and of the paper; the proposal; following the professor's feedback (short part 1, both on part 2); the split of the explanations (Ilias: overview and chapters 1–2, Jomaa: chapters 3–5); the simple-polygon correction (Jomaa); which AI outputs we kept or changed; what we checked by hand; what we will present orally and in our own words.</p>
<h2>5. Our assessment</h2>
<p class="draft">To complete: what the AI did well, where it was wrong, what we had to understand ourselves.</p>
`;
}
