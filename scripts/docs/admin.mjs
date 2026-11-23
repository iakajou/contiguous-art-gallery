// Documents 4 and 5 (EN): work split and AI journal (drafts for the students to complete).

export function workSplit() {
  return String.raw`
<div class="cover">
  <div class="kicker">INFO-F420 Computational Geometry · ULB · 2026–2027</div>
  <h1>Work distribution</h1>
  <p class="subtitle">Guarding Walls Contiguously — Ilias Akajou (520466) and Jomaa Abdulrahman (583629)</p>
  <p class="draft">Same content as Section R.5 of the report. To check together before the submission.</p>
</div>
<h2>1. Who explains what (site and presentation)</h2>
<table><thead><tr><th>Part</th><th>Content</th><th>Explained by</th></tr></thead><tbody>
<tr><td>Overview 01–02</td><td>The problem, the simple-polygon assumption, why the problem is surprising</td><td>Ilias</td></tr>
<tr><td>Chapter 1</td><td>Visibility cores, the greedy algorithm and its $k+1$ bound</td><td>Ilias</td></tr>
<tr><td>Chapter 2</td><td>Good and bad guards, replacement lemmas</td><td>Ilias</td></tr>
<tr><td>Chapter 3</td><td>Candidate guards $G_P$, start points $U_P$, Theorem 5.4</td><td>Jomaa</td></tr>
<tr><td>Chapter 4</td><td>Lemma 6.2, Lemma 6.8, Theorem 7.1</td><td>Jomaa</td></tr>
<tr><td>Chapter 5</td><td>The optimal $\Theta(n\log n)$ algorithm</td><td>Jomaa</td></tr>
<tr><td>Overview 05</td><td>Implementation and validation</td><td>Jomaa</td></tr>
<tr><td>Overview 06, Play</td><td>The game, conclusion</td><td>Ilias</td></tr>
</tbody></table>
<h2>2. Who is responsible for which part of the code</h2>
<p>Each of us reviewed, tested and can explain these parts. The code was written with AI assistance (see the report, Section R.6, and the AI journal).</p>
<table><thead><tr><th>Ilias Akajou</th><th>Jomaa Abdulrahman</th></tr></thead><tbody>
<tr><td><code>vec.js</code>, <code>polygon.js</code>, <code>visibility.js</code>, <code>core.js</code></td><td><code>shortestPath.js</code>, <code>arrangement.js</code></td></tr>
<tr><td><code>solver.js</code>: <code>next</code>, <code>greedy</code>, <code>solve</code></td><td><code>solver.js</code>: <code>candidateGuards</code>, <code>startPoints</code>, <code>nextBad</code></td></tr>
<tr><td>Figures 1–5</td><td><code>proofs.js</code>, Figures 6–11</td></tr>
<tr><td>Site structure, design, animations</td><td>Tests (<code>tests/</code>)</td></tr>
<tr><td>Game, random polygons</td><td>Report sections on implementation and related work</td></tr>
</tbody></table>
<h2>3. Together</h2>
<p>Choice of the topic, the proposal and its revision, the division of the explanations, the report and the deployment. Ilias led the development sessions and chose
the structure of the site; Jomaa reviewed the site and pointed out that the simple-polygon assumption had to be stated on the overview page.</p>
<h2>4. External help</h2>
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
