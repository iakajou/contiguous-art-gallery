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
<tr><td>Validation</td><td>Automatic tests (<code>tests/</code>), the precision found on Lemma 6.2, overview section 05</td><td></td></tr>
<tr><td>4. Report</td><td>R.1 Summary, R.2 Context</td><td>R.3 Related work, R.4 Implementation</td></tr>
<tr><td>Site</td><td>Structure, design, animations, deployment</td><td>Review of the site</td></tr>
<tr><td>Presentation (12 min)</td><td>0:00–5:15 and 10:00–11:15</td><td>5:15–10:00 and 11:15–12:00</td></tr>
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
  const prompts = [
    ['07/11', 'Implement the project of our proposal, following the professor’s feedback, and give us documents that explain the papers.',
      'Read the papers [1]–[6]; implemented the geometry library, the algorithm and the tests; a first site with 11 interactive figures and a game; explanations in French.'],
    ['09/11', 'Restructure the site: an overview with only what we will present orally, the details on other pages, and one document that explains everything.',
      'New structure: overview, five proof chapters, game, report; new design; a complete explanation document.'],
    ['11/11', 'Explain the subject to us from scratch, in French: we have to understand it in order to explain it ourselves.',
      'A step-by-step explanation of the problem and of the proof, from the basic definitions.'],
    ['11/11', 'Jomaa’s remark: the site does not say that the polygon must be simple, and the algorithm fails otherwise. Check this and the course requirements.',
      'Confirmed in the papers; the assumption is now explained on every page; requirements checked.'],
    ['23/11', 'Who explains which part of the proof at the oral, and how: one guide per student.',
      'A work-distribution section and one presentation guide per student, with likely questions and answers.'],
    ['23/11', 'State precisely who did what, following the professor’s feedback.', 'Team section rewritten step by step of the proof.'],
    ['24/11', 'Explain the whole project to us in detail, in French: the course requirements, every step of the proof, the code and the site.',
      'A detailed explanation document with questions to test ourselves.'],
    ['24/11', 'Check that nothing is wrong: compare the report with the papers, the professor’s feedback, the site and the course page on the UV.',
      'Corrections (Section 5); bibliography following the citation guidelines; run instructions.'],
  ];
  return String.raw`
<style>
.ours { border: 1px solid #a7f3d0; background: #ecfdf5; border-radius: 3mm; padding: 2mm 5mm; }
.ours li { margin: 1.6mm 0; }
table.prompts td:first-child { white-space: nowrap; }
table.prompts { break-inside: auto; }
table.prompts tr { break-inside: avoid; }
table.prompts td:nth-child(2) { width: 50%; }
</style>
<div class="cover" style="min-height:0;break-after:auto;padding:4mm 0 0">
  <div class="kicker">INFO-F420 Computational Geometry · ULB · 2026–2027</div>
  <h1>AI journal</h1>
  <p class="subtitle" style="hyphens:manual">Guarding Walls Contiguously — Ilias Akajou (520466) and Jomaa Abdulrahman (583629)</p>
</div>

<h2>1. Tools and models</h2>
<p>Claude Code (Anthropic), model Claude Opus 5.5, used in the desktop app between 7 and 24 November 2026, in work sessions led by Ilias.
The assistant could read and write the files of the project, run the code and the tests, and open the site in a browser.</p>

<h2>2. Our work and our decisions</h2>
<div class="ours"><ul>
<li><b>The topic and the plan.</b> We chose the topic and the main paper and wrote the project proposal (19 October): the four parts, the plan and the bibliography.
All the AI sessions started from this proposal. After the professor's feedback we revised the plan: part 1 short, both of us on part 2, widgets for the steps of the proof.</li>
<li><b>We directed the project.</b> Every session started from our request (Section 4). We reviewed each result and asked for changes. The structure of the site is our decision:
Ilias found the first version too cluttered and asked for an overview that contains only what we present orally, with the details on other pages.</li>
<li><b>The simple-polygon assumption.</b> Jomaa reviewed the site and noticed that it did not say that the polygon must be simple, although the algorithm fails otherwise.
We had it explained on every page.</li>
<li><b>Feedback from the class.</b> We posted a preliminary version on the course forum and acted on a fellow student's remark: the animations of the overview now play once and can be switched off.</li>
<li><b>Publication.</b> We created the public GitHub repository and published the site on GitHub Pages.</li>
<li><b>Quality control.</b> We asked for the report to be checked against the papers, the course checklist and the course page on the UV, and had every error corrected (Section 5).</li>
<li><b>Understanding and presentation.</b> We used the explanations produced with the AI to understand the proof. We split it in two halves:
Ilias the first half (Sections 2.1–2.4) and the tests, Jomaa the second half (Sections 2.5–2.10). Each of us studies his half to explain and defend it at the oral.</li>
</ul></div>

<h2>3. What the AI did, at our request</h2>
<ul>
<li>It read the papers with us and explained the proof step by step, including documents in French.</li>
<li>It designed the site (layout, pages, animations) and built it.</li>
<li>It implemented the algorithm of [5], the eleven interactive figures and the game in JavaScript.</li>
<li>It wrote automatic tests that compare every step with brute-force computations, and used them to verify and correct the code.</li>
<li>It drafted the texts of the site and of the report, and the LaTeX version of the report.</li>
<li>It compared the report with the papers and the course requirements, and corrected the errors.</li>
</ul>

<h2>4. Significant prompts and responses</h2>
<p>Summaries of our main requests (written in French) and of the results.</p>
<table class="prompts"><thead><tr><th>Date</th><th>What we asked</th><th>Result</th></tr></thead><tbody>
${prompts.map(([d, q, a]) => `<tr><td>${d}/2026</td><td>${q}</td><td>${a}</td></tr>`).join('')}
</tbody></table>

<h2>5. How we checked, corrected or rejected the results</h2>
<ul>
<li><b>Tests.</b> Every computation is compared with a slower direct computation on thousands of random cases (${info.checks}). This is how we found that the first implementation of Lemma 6.2 took the wrong intersection point (wrong in about 19% of cases); the paper's proof gives the right rule, and the statement of the lemma needs this precision.</li>
<li><b>Papers.</b> We compared the statements of the report with the papers. This corrected a running time wrongly attributed to Robson et al., the description of Biniaz et al., the page count of [5] and the statement of Lemma 6.8.</li>
<li><b>Course page.</b> Following the citation guidelines, we cite the journal version of Hershberger and Suri (1995) and give DOIs.</li>
<li><b>Rejected.</b> A claim in a figure that we could not justify in all cases was removed; an observation from our experiments is reported only as an observation; a reference we could not check was not added.</li>
</ul>
`;
}
