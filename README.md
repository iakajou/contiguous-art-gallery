# Guarding Walls Contiguously

An interactive website about the **Contiguous Art Gallery Problem**, built for the course
INFO-F420 *Computational Geometry* (Université libre de Bruxelles, 2026–2027) by
**Ilias Akajou (520466)** and **Jomaa Abdulrahman (583629)**.

It explains, step by step and with interactive figures, the algorithm of

> S. de Berg, J. Conradi, I. van der Hoog, F. Staals. *Simpler and faster contiguous art gallery.* arXiv:2508.09734, 2025.

and sketches the optimal Θ(n log n) algorithm of de Berg, Conradi, van der Hoog and Rotenberg (arXiv:2511.02960).
Every figure and animation is computed live in the browser by our own JavaScript implementation of the algorithm.

**Everything is explained in French in [`docs/Guarding_Walls_Contiguously_Dossier_complet.pdf`](docs/Guarding_Walls_Contiguously_Dossier_complet.pdf)**
(project, site tour, oral presentation, detailed proof, figures, implementation, how to continue).

## Pages

| Route | Page | Content |
| --- | --- | --- |
| `#/` | Overview | what we present orally: the problem, why it is surprising, the algorithm in three ideas (animated), the result |
| `#/proof` | The proof | map of the proof and the five chapters |
| `#/proof/1` … `#/proof/5` | Chapters | statements, detailed proofs, interactive figures 2–11 |
| `#/play` | Play | the game and the sandbox |
| `#/report` | Report | summary, context, implementation, team, references |

## Commands

Requirements: Node.js 18 or newer.

```bash
npm install
npm run dev           # development server on http://localhost:5173
npm test              # geometry and algorithm tests (brute-force comparisons, proof constructions)
npm run build         # static site in dist/ (for GitHub Pages)
npm run build:single  # the whole site in ONE html file (dist-single/index.html), opens offline
npm run docs          # rebuild the PDF documents of docs/ (needs Google Chrome)
npm run zip           # archive to share: single-file site + PDF + sources
```

## Publishing on GitHub Pages

1. Push this folder to a GitHub repository (branch `main`).
2. In *Settings → Pages*, choose *Source: GitHub Actions*.
3. `.github/workflows/deploy.yml` tests, builds and publishes the site at every push.

## Code structure

```
src/
  App.jsx, router.js  site shell (navigation bar, footer) and hash routing
  pages/              Home (oral), ProofIndex, ChapterPage, Play, Report
  sections/           chapters.jsx (text of the proof chapters), blocks.jsx (layout blocks, authors)
  anim/               motion.jsx (scroll reveal, loop clock, counters, confetti), scenes.jsx (animated scenes)
  widgets/            the 11 interactive figures and the game
  components/         SVG building blocks, UI elements
  geometry/           pure JavaScript, no dependency (also runs in Node for the tests)
    vec.js, polygon.js, visibility.js, core.js, shortestPath.js, arrangement.js
    solver.js         the algorithm: G_P, U_P, next(u) (Lemma 6.8), greedy, Theorem 7.1
    proofs.js         constructions used in the proofs (Prop. 4.3, Lemmas 4.2-4.9, 6.2, Thm 5.4)
    generate.js       random simple polygons; presets.js example polygons
  styles.css          design system (light/dark themes, typography, animations)
tests/                run-tests.mjs (solver vs brute force), proofs-test.mjs (lemmas)
scripts/              PDF generation (build-docs.mjs, docs/*.mjs), screenshots, zip
docs/                 complete dossier (PDF), drafts (work split, AI journal), screenshots, proposal
```

## Implementation choices

The paper reaches O(k n² log² n) with polylogarithmic shortest-path and ray-shooting structures. As announced in the
proposal, we use simpler polynomial-time routines (visibility-graph shortest paths, explicit visibility of the boundary,
linear scan instead of binary search in Lemma 6.8), fast enough for polygons with a few dozen vertices (≈ 0.4 s for n = 40).
Animations are hand-written (CSS and `requestAnimationFrame`), run only when visible, and respect the system's
"reduce motion" setting.

## Opening the code in CodeSandbox

The repository contains `.codesandbox/tasks.json`: CodeSandbox installs the dependencies and starts the site by itself.

1. Push this folder to GitHub (or use `Guarding-Walls-Contiguously-CodeSandbox.zip`, produced by `npm run zip`).
2. On [codesandbox.io](https://codesandbox.io), choose **Import** and paste the repository URL.
3. The *Site (dev server)* task starts automatically; the preview opens on port 5173. The *Tests* task runs `npm test`.

Without GitHub: create a new Devbox, upload the files of the zip, then run `npm install` and `npm run dev -- --host` in its terminal.

## Important assumption

The input must be a **simple polygon** (one closed boundary that does not cross itself, no holes). All the papers assume it, and the algorithm
relies on it: the boundary is a single cycle, shortest paths are unique, and closed curves inside the polygon only enclose points of the
polygon. With holes the approach of Merrild et al. fails and the complexity of the problem is open. The sandbox rejects non-simple polygons.
