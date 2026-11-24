// One "individual contribution" document per student (EN): precisely who did what.
// Same content as Section R.5 of the report ("Team: who did what"), split by person.

const PEOPLE = {
  ilias: {
    name: 'Ilias Akajou', id: '520466', other: 'Jomaa Abdulrahman',
    summary: 'I did the first half of part 2, the algorithm of [5]: visibility cores, the greedy algorithm and its $k+1$ bound, good and bad guards, and the '
      + 'replacement of guards by arrangement vertices (Sections 2.1–2.4, Figures 2–5). I also did part 1, kept short as the professor asked, the game, '
      + 'the geometry basics of the code, the structure and design of the site, and I led the development sessions.',
    steps: [
      ['Visibility cores; one guard is enough if and only if $P$ is star-shaped (Obs. 2.1, 2.2)', '2.1, Fig. 2', '<code>core.js</code>, <code>visibility.js</code>'],
      ['The greedy algorithm: at most $k+1$ guards, and $k$ from the right start', '2.2, Fig. 3', '<code>solver.js</code>: <code>next</code>, <code>greedy</code>, <code>solve</code>'],
      ['Good and bad guards (Def. 4.1)', '2.3, Fig. 4', '<code>solver.js</code>: <code>classifyGuard</code>'],
      ['Replacing guards by arrangement vertices (Prop. 4.3, Lemmas 4.2–4.6, Cor. 4.7, Lemma 4.9)', '2.4, Fig. 5', '<code>proofs.js</code>: <code>replaceGoodGuard</code>, <code>lemma49</code>'],
    ],
    more: [
      ['1. The problem (kept short)', 'Overview 01–02 and Figure 1: the problem, the simple-polygon assumption, why the problem is surprising'],
      ['Geometry basics', '<code>vec.js</code>, <code>polygon.js</code> (visibility test, simplicity test)'],
      ['3. Game and sandbox', 'The game and the sandbox (<code>GameWidget.jsx</code>), random simple polygons (<code>generate.js</code>)'],
      ['4. Report', 'R.1 Summary, R.2 Context'],
      ['Site', 'Structure, design and animations, deployment on GitHub Pages; development sessions with the AI assistant'],
    ],
    talk: [
      ['0:00–0:30', 'Header', 'The problem in one question; everything on the site is computed live'],
      ['0:30–1:45', '01 The problem', 'Definitions, simple polygon, demo of Figure 1'],
      ['1:45–2:30', '02 Why it is surprising', 'The other variants are hard; the 2024–2026 timeline'],
      ['2:30–4:15', '03 Idea 1', 'The greedy algorithm: at most $k+1$ guards, and $k$ from the right start'],
      ['4:15–5:15', '03 Idea 2 (first half)', 'Good and bad guards; a good guard slides to a crossing of wall lines'],
      ['11:15–12:00', '06 and Play', 'Demo of the game, conclusion, acknowledgements'],
    ],
  },
  jomaa: {
    name: 'Jomaa Abdulrahman', id: '583629', other: 'Ilias Akajou',
    summary: 'I did the second half of part 2, the algorithm of [5]: the candidate guards $G_P$ and start points $U_P$, Theorem 5.4, the maximal visible chain '
      + '(Lemma 6.2), one greedy step (Lemma 6.8), the complete algorithm (Theorem 7.1) and the optimal $\\Theta(n\\log n)$ algorithm of [6] '
      + '(Sections 2.5–2.10, Figures 6–11). I also did the validation (automatic tests), the report sections on related work and implementation, '
      + 'and I found that the simple-polygon assumption was missing from the overview.',
    steps: [
      ['The arrangement, candidate guards $G_P$ and start points $U_P$ (Def. 5.1, 5.2, Lemma 5.3)', '2.5, Fig. 6', '<code>arrangement.js</code>; <code>solver.js</code>: <code>candidateGuards</code>, <code>startPoints</code>'],
      ['Theorem 5.4: an optimal solution starts in $U_P$', '2.6, Fig. 7', '<code>proofs.js</code>: <code>theorem54</code>'],
      ['The maximal visible chain: two shortest paths and two rays (Lemma 6.2)', '2.7, Fig. 8', '<code>shortestPath.js</code>; <code>proofs.js</code>: <code>maximalChainLemma62</code>'],
      ['One greedy step in $O(\\log^2 n)$, bad guards on the line $\\ell_u$ (Lemmas 6.5–6.8)', '2.8, Fig. 9', '<code>solver.js</code>: <code>nextBad</code>'],
      ['The complete algorithm in $O(kn^2\\log^2 n)$ (Theorem 7.1)', '2.9, Fig. 10', 'uses <code>solve</code>'],
      ['The optimal $\\Theta(n\\log n)$ algorithm and its lower bound [6]', '2.10, Fig. 11', '(not implemented)'],
    ],
    more: [
      ['1. The problem (kept short)', 'Pointed out that the simple-polygon assumption had to be stated on the overview, because the algorithm does not work otherwise'],
      ['Validation', 'Automatic tests (<code>tests/</code>) and overview section 05'],
      ['4. Report', 'R.3 Related work, R.4 Implementation'],
      ['Site', 'Review of the site'],
    ],
    talk: [
      ['5:15–7:00', '03 Idea 2 (second half)', 'Crossings, $G_P$, $U_P$, Theorem 5.4'],
      ['7:00–8:45', '03 Idea 3', 'Lemma 6.2 (two shortest paths and two rays), one greedy step in $O(\\log^2 n)$'],
      ['8:45–10:00', '04 The result', '$O(kn^2\\log^2 n)$, then $\\Theta(n\\log n)$'],
      ['10:00–11:15', '05 Built and verified', 'Implementation, tests, our remark on Lemma 6.2'],
    ],
  },
};

export default function contribution(who) {
  const p = PEOPLE[who];
  const rows = (list) => list.map((r) => `<tr>${r.map((c) => `<td>${c}</td>`).join('')}</tr>`).join('');
  return String.raw`
<style>
.role { border: 1px solid #c7d2fe; background: #eef2ff; border-radius: 3mm; padding: 3mm 4.5mm; }
.subtitle { hyphens: manual; font-size: 12.5pt; }
h1 { font-size: 22pt; }
table { break-inside: auto; }
tr { break-inside: avoid; }
h2 { margin-top: 6mm; }
p { hyphens: manual; }
.cover { min-height: 0; break-after: auto; padding: 6mm 0 2mm; }
.sign { margin-top: 10mm; display: flex; gap: 12mm; font: 10pt Helvetica, Arial, sans-serif; color: #475569; }
.sign div { flex: 1; border-top: 1px solid #94a3b8; padding-top: 1.5mm; }
</style>
<div class="cover">
  <div class="kicker">INFO-F420 Computational Geometry · ULB · 2026–2027</div>
  <h1>Individual contribution — ${p.name}</h1>
  <p class="subtitle">Guarding Walls Contiguously — ${p.name} (${p.id}), team project with ${p.other}</p>
  <p class="note-cover">This document is the part of Section R.5 of our report (“Team: who did what”) that concerns ${p.name}.
  Both team members submit the same project.</p>
</div>

<h2>1. In short</h2>
<div class="role"><p>${p.summary}</p></div>

<h2>2. How we split the work, following the professor's feedback</h2>
<p>Our proposal planned that Ilias would work on part 1 (the problem), Jomaa on part 2 (the algorithm of [5]), and both on parts 3 (the game) and 4 (the report).
The professor asked us to keep part 1 short, to both work on part 2, the core of the project, and to split its explanations, with web widgets for the steps of the proof.
We did so: part 1 is a single section of the overview, and part 2 is split into two halves of the proof, each of us doing one half, with one interactive widget per step.</p>

<h2>3. My steps of the proof (part 2)</h2>
<table><thead><tr><th>Step of the proof</th><th>Section, widget</th><th>Code</th></tr></thead><tbody>${rows(p.steps)}</tbody></table>

<h2>4. My other parts</h2>
<table><thead><tr><th>Part</th><th>What I did</th></tr></thead><tbody>${rows(p.more)}</tbody></table>

<h2>5. My part of the presentation</h2>
<p>The presentation lasts 12 minutes and follows the overview page from top to bottom. My parts:</p>
<table><thead><tr><th>Time</th><th>Section</th><th>Content</th></tr></thead><tbody>${rows(p.talk)}</tbody></table>

<h2>6. What we did together</h2>
<p>The choice of the topic, the proposal and its revision, the division of the work, Sections R.5–R.7 of the report, and the AI journal.</p>

<h2>7. How we worked, and external help</h2>
<p>The code, the widgets and the first drafts of the texts were produced with an AI assistant (Claude, by Anthropic), in development sessions led by Ilias.
For each part, the person named in this document checked it against the paper, tested it, and explains it in the presentation. Our AI journal describes this use in detail.</p>
<ul>
<li>Our professor's feedback on the proposal (see Section 2).</li>
<li>A fellow student's feedback on the course forum: the overview page had too many animations; they now play once, can be replayed, and can be switched off.</li>
</ul>

<h2>8. Links</h2>
<ul>
<li>Public page: <code>https://iakajou.github.io/contiguous-art-gallery/</code></li>
<li>Source code: <code>https://github.com/iakajou/contiguous-art-gallery</code></li>
</ul>

<div class="sign"><div>Ilias Akajou</div><div>Jomaa Abdulrahman</div></div>
`;
}
