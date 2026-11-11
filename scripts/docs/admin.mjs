// Documents 4 and 5 (EN): work split and AI journal (drafts for the students to complete).

export function workSplit() {
  return String.raw`
<div class="cover">
  <div class="kicker">INFO-F420 Computational Geometry · ULB · 2026–2027</div>
  <h1>How we shared the work</h1>
  <p class="subtitle">Guarding Walls Contiguously — Ilias Akajou (520466) and Jomaa Abdulrahman (583629)</p>
  <p class="draft">DRAFT — to be checked and completed by both of us so that it describes what each of us actually did.</p>
</div>
<h2>1. Change with respect to the proposal</h2>
<p>In the proposal, Ilias was responsible for part 1 (the problem) and Jomaa for part 2 (the algorithm). Following the feedback we received
("do not spend too much time on classical art gallery problems; both work on part 2 and split the explanations there; use web widgets to
illustrate the different steps of the proof"), we reduced part 1 to a short introduction and split the explanations of part 2 between us.</p>
<h2>2. Explanations of the web page</h2>
<table><thead><tr><th>Section</th><th>Topic</th><th>Paper</th><th>Responsible</th></tr></thead><tbody>
<tr><td>1</td><td>The problem, context (short)</td><td>§1–2</td><td>Ilias</td></tr>
<tr><td>2.1</td><td>Visibility cores, one-guard case</td><td>Obs. 2.1, 2.2</td><td>Ilias</td></tr>
<tr><td>2.2</td><td>Greedy algorithm, k + 1 bound</td><td>Thm 7.1 (proof)</td><td>Ilias</td></tr>
<tr><td>2.3</td><td>Good and bad guards</td><td>Def. 4.1, Obs. 4.8</td><td>Ilias</td></tr>
<tr><td>2.4</td><td>Replacing guards</td><td>Prop. 4.3, Lemmas 4.2–4.6, Cor. 4.7, Lemma 4.9</td><td>Ilias</td></tr>
<tr><td>2.5</td><td>Candidate guards and start points</td><td>Def. 5.1, 5.2, Lemma 6.6</td><td>Jomaa</td></tr>
<tr><td>2.6</td><td>Theorem 5.4</td><td>Lemma 5.3, Thm 5.4</td><td>Jomaa</td></tr>
<tr><td>2.7</td><td>Maximal visible chains</td><td>Def. 6.1, Lemmas 6.2, 6.5</td><td>Jomaa</td></tr>
<tr><td>2.8</td><td>One greedy step in O(log² n)</td><td>Lemma 6.8</td><td>Jomaa</td></tr>
<tr><td>2.9</td><td>Complete algorithm, running time</td><td>Thm 7.1</td><td>Ilias</td></tr>
<tr><td>2.10</td><td>The Θ(n log n) algorithm</td><td>[6]</td><td>Jomaa</td></tr>
<tr><td>3</td><td>Game and sandbox</td><td>—</td><td>both</td></tr>
<tr><td>4</td><td>Summary, implementation, references</td><td>—</td><td>both</td></tr>
</tbody></table>
<p>Each subsection of the web page shows its author ("Explained by …").</p>
<h2>3. Implementation</h2>
<table><thead><tr><th>Component</th><th>Files</th><th>Responsible</th></tr></thead><tbody>
<tr><td>Geometry kernel (visibility, cores, shortest paths)</td><td>src/geometry/vec, polygon, visibility, core, shortestPath</td><td>to complete</td></tr>
<tr><td>Solver ($G_P$, $U_P$, next, greedy)</td><td>src/geometry/arrangement, solver</td><td>to complete</td></tr>
<tr><td>Proof constructions and their figures</td><td>src/geometry/proofs, src/widgets (Figures 2–11)</td><td>split as in section 2</td></tr>
<tr><td>Game, sandbox, random polygons</td><td>src/widgets/GameWidget, src/geometry/generate</td><td>to complete</td></tr>
<tr><td>Tests</td><td>tests/</td><td>to complete</td></tr>
<tr><td>Page layout, report text</td><td>src/App, src/sections</td><td>both</td></tr>
</tbody></table>
<h2>4. Use of AI tools</h2>
<p>We used an AI assistant during the project; how and for what is described in our AI journal, which is handed in with this document.</p>
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
