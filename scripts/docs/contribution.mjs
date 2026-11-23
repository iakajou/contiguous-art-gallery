// One "individual contribution" document per student (EN): what each of us explains, presents and is
// responsible for in the code. Same content as Section R.5 of the report, split by person.

const PEOPLE = {
  ilias: {
    name: 'Ilias Akajou', id: '520466', other: 'Jomaa Abdulrahman',
    summary: 'I introduce the problem and the simple-polygon assumption, and explain the first half of the algorithm: visibility cores, the greedy algorithm '
      + 'and its $k+1$ bound, and good and bad guards. I am responsible for the geometry basics, the greedy algorithm, the structure and design of the site, and the game.',
    explains: [
      ['Overview 01–02', 'The problem, the simple-polygon assumption, why the problem is surprising'],
      ['Chapter 1', 'Visibility cores, the greedy algorithm and its $k+1$ bound'],
      ['Chapter 2', 'Good and bad guards, replacement lemmas (Prop. 4.3, Lemmas 4.2–4.6, Cor. 4.7)'],
      ['Overview 06, Play', 'The game, conclusion'],
    ],
    talk: [
      ['0:00–0:30', 'Header', 'The problem in one question; everything on the site is computed live'],
      ['0:30–1:45', '01 The problem', 'Definitions, simple polygon, demo of Figure 1'],
      ['1:45–2:30', '02 Why it is surprising', 'The other variants are hard; the 2024–2026 timeline'],
      ['2:30–4:15', '03 Idea 1', 'The greedy algorithm: at most $k+1$ guards, and $k$ from the right start'],
      ['4:15–5:15', '03 Idea 2 (first half)', 'Good and bad guards; a good guard slides to a crossing of wall lines'],
      ['11:15–12:00', '06 and Play', 'Demo of the game, conclusion, acknowledgements'],
    ],
    code: [
      ['<code>geometry/vec.js</code>', 'Vectors and the orientation test'],
      ['<code>geometry/polygon.js</code>', 'Polygon, boundary parameter, visibility test <code>segInside</code>, simplicity test <code>isSimple</code>'],
      ['<code>geometry/visibility.js</code>', 'Maximal chains seen by a point'],
      ['<code>geometry/core.js</code>', 'Visibility cores (intersection of half-planes)'],
      ['<code>geometry/solver.js</code>: <code>next</code>, <code>greedy</code>, <code>solve</code>', 'The greedy algorithm and the optimum over all start points'],
      ['<code>widgets/</code>, Figures 1–5', 'The figures of Chapters 1 and 2'],
      ['<code>App.jsx</code>, <code>pages/</code>, <code>anim/</code>, <code>styles.css</code>', 'Structure of the site, design and animations'],
      ['<code>GameWidget.jsx</code>, <code>geometry/generate.js</code>', 'The game and the random simple polygons'],
    ],
    own: 'I led the development sessions and chose the structure of the site: an overview page that follows the presentation, and the details in five chapters.',
  },
  jomaa: {
    name: 'Jomaa Abdulrahman', id: '583629', other: 'Ilias Akajou',
    summary: 'I explain the second half of the algorithm: the candidate guards $G_P$ and the start points $U_P$ (Theorem 5.4), the fast computation of one greedy step '
      + '(Lemmas 6.2 and 6.8, Theorem 7.1), the optimal $\\Theta(n\\log n)$ algorithm, and how we validated our implementation. I am responsible for the shortest paths, '
      + 'the arrangement, the candidates and bad guards in the solver, the proof constructions, and the tests.',
    explains: [
      ['Chapter 3', 'Candidate guards $G_P$, start points $U_P$, Theorem 5.4'],
      ['Chapter 4', 'Maximal visible chains (Lemma 6.2), one greedy step (Lemma 6.8), Theorem 7.1'],
      ['Chapter 5', 'The optimal $\\Theta(n\\log n)$ algorithm'],
      ['Overview 05', 'Implementation and validation'],
    ],
    talk: [
      ['5:15–7:00', '03 Idea 2 (second half)', 'Crossings, $G_P$, $U_P$, Theorem 5.4'],
      ['7:00–8:45', '03 Idea 3', 'Lemma 6.2 (two shortest paths and two rays), one greedy step in $O(\\log^2 n)$'],
      ['8:45–10:00', '04 The result', '$O(kn^2\\log^2 n)$, then $\\Theta(n\\log n)$'],
      ['10:00–11:15', '05 Built and verified', 'Implementation, tests, our remark on Lemma 6.2'],
    ],
    code: [
      ['<code>geometry/shortestPath.js</code>', 'Shortest paths inside the polygon'],
      ['<code>geometry/arrangement.js</code>', 'Crossings of the wall lines inside the polygon'],
      ['<code>geometry/solver.js</code>: <code>candidateGuards</code>, <code>startPoints</code>, <code>nextBad</code>', 'The sets $G_P$ and $U_P$, and the search for bad guards'],
      ['<code>geometry/proofs.js</code>', 'The constructions of the proofs (Lemma 4.9, Lemma 6.2, Theorem 5.4)'],
      ['<code>widgets/</code>, Figures 6–11', 'The figures of Chapters 3, 4 and 5'],
      ['<code>tests/</code>', 'Automatic tests and their brute-force comparisons (<code>npm test</code>)'],
      ['Report R.3 and R.4', 'Related work, implementation notes'],
    ],
    own: 'I reviewed the site and pointed out that the simple-polygon assumption had to be stated on the overview page, because the algorithm does not work otherwise; we added it to the overview, Chapter 1, the game and the report.',
  },
};

export default function contribution(who) {
  const p = PEOPLE[who];
  const rows = (list) => list.map((r) => `<tr>${r.map((c) => `<td>${c}</td>`).join('')}</tr>`).join('');
  return String.raw`
<style>
.role { border: 1px solid #c7d2fe; background: #eef2ff; border-radius: 3mm; padding: 3mm 4.5mm; }
.subtitle { hyphens: manual; }
.cover { min-height: 0; break-after: auto; padding: 6mm 0 2mm; }
.sign { margin-top: 10mm; display: flex; gap: 12mm; font: 10pt Helvetica, Arial, sans-serif; color: #475569; }
.sign div { flex: 1; border-top: 1px solid #94a3b8; padding-top: 1.5mm; }
</style>
<div class="cover">
  <div class="kicker">INFO-F420 Computational Geometry · ULB · 2026–2027</div>
  <h1>Individual contribution — ${p.name}</h1>
  <p class="subtitle">Guarding Walls Contiguously — ${p.name} (${p.id}), team project with ${p.other}</p>
  <p class="note-cover">This document is the part of Section R.5 of our report (“Team, work distribution and acknowledgements”) that concerns ${p.name}.
  Both team members submit the same project.</p>
</div>

<h2>1. In short</h2>
<div class="role"><p>${p.summary}</p></div>

<h2>2. What I explain on the site</h2>
<table><thead><tr><th>Part</th><th>Content</th></tr></thead><tbody>${rows(p.explains)}</tbody></table>

<h2>3. My part of the presentation</h2>
<p>The presentation lasts 12 minutes and follows the overview page from top to bottom. My parts:</p>
<table><thead><tr><th>Time</th><th>Section</th><th>Content</th></tr></thead><tbody>${rows(p.talk)}</tbody></table>

<h2>4. The code I am responsible for</h2>
<p>I reviewed, tested and can explain the following parts. The code was written with AI assistance (report, Section R.6, and our AI journal).</p>
<table><thead><tr><th>Part of the code</th><th>What it does</th></tr></thead><tbody>${rows(p.code)}</tbody></table>

<h2>5. My own contribution to the team work</h2>
<p>${p.own}</p>

<h2>6. What we did together</h2>
<p>Choice of the topic, the proposal and its revision after the professor's feedback, the division of the explanations, the report, and the deployment of the public page.</p>

<h2>7. External help</h2>
<ul>
<li>Our professor's feedback on the proposal: keep the classical art gallery problem short, share the explanation of the algorithm, illustrate the steps of the proof with widgets.</li>
<li>A fellow student's feedback on the course forum: the overview page had too many animations; they now play once, can be replayed, and can be switched off.</li>
<li>An AI assistant (Claude, by Anthropic), used to understand the papers and to implement and test the code. We reviewed, tested and corrected its results. The details are in our AI journal.</li>
</ul>

<h2>8. Links</h2>
<ul>
<li>Public page: <code>https://iakajou.github.io/contiguous-art-gallery/</code></li>
<li>Source code: <code>https://github.com/iakajou/contiguous-art-gallery</code></li>
</ul>

<div class="sign"><div>Ilias Akajou</div><div>Jomaa Abdulrahman</div></div>
`;
}
