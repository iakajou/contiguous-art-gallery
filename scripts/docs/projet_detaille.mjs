// "Le projet expliqué en détail" (FR): the whole project, slowly and from zero —
// the course, the problem, every step of the algorithm, our code, our site, the presentation.
// Every figure is computed with the same geometry code as the website.

import path from 'node:path';
import { pathToFileURL, fileURLToPath } from 'node:url';
import { polygonFromArray, mod } from '../../src/geometry/polygon.js';
import { Solver } from '../../src/geometry/solver.js';
import { PRESETS } from '../../src/geometry/presets.js';
import { figure } from '../svgfig.mjs';
import * as F from '../figures.mjs';
import { figBasics, figSee, figLoop, figStrip, complexityBars, figSimple, figHoleShadow } from './comprendre.mjs';

const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..', '..');
const img = (name) => `<img class="shot" src="${pathToFileURL(path.join(root, 'docs', 'screenshots', `${name}.jpg`)).href}" alt="">`;
const COLORS = ['#2563eb', '#16a34a', '#9333ea', '#d97706', '#0891b2', '#db2777'];
const SUB = ['₀', '₁', '₂', '₃', '₄', '₅', '₆', '₇', '₈', '₉'];
const poly = (id) => polygonFromArray(PRESETS[id].points);
const deg = (a) => `${Math.round((a * 180) / Math.PI)}°`;
const yes = (b) => (b ? '<b style="color:#b91c1c">oui</b>' : '<b style="color:#047857">non</b>');

// ------------------------------------------------------------------ small blocks
const part = (num, title, sub) => `<div class="part"><div class="part-letter">${num}</div><h1 class="part-title">${title}</h1><p class="part-sub">${sub}</p></div>`;
const one = (t) => `<div class="one"><b class="t">En une phrase</b><p>${t}</p></div>`;
const pic = (t) => `<div class="analogy"><b class="t">L'image à avoir en tête</b> — ${t}</div>`;
const keep = (items) => `<div class="key"><b class="t">À retenir</b><ul>${items.map((x) => `<li>${x}</li>`).join('')}</ul></div>`;
const ask = (list) => `<div class="ask"><b class="t">Ce qu'on peut te demander</b>${list.map(([q, a]) => `<p class="q">${q}</p><p class="a">${a}</p>`).join('')}</div>`;
const warn = (t) => `<div class="warn"><b>Attention.</b> ${t}</div>`;

// ------------------------------------------------------------------ new figures
/** Vertex numbers and the boundary parameter t on the U-shaped room. */
function figParam() {
  const P = poly('ushape');
  const off = [[-24, -18], [8, -18], [8, 6], [-16, 10], [8, -18], [-20, -18], [6, 10], [-20, 8]];
  const layers = [{ type: 'polygon', fill: '#eef2ff' }, { type: 'chain', a: 2, b: 3, color: '#93c5fd', width: 6 }];
  for (let i = 0; i < P.n; i++) layers.push({ type: 'label', p: P.v(i), text: String(i), dx: off[i][0], dy: off[i][1], size: 13, color: '#1d4ed8' });
  layers.push({ type: 'dot', p: P.at(0.25), r: 5, fill: '#dc2626', label: 't = 0,25', dx: -24, dy: -22 });
  layers.push({ type: 'dot', p: P.at(2.5), r: 5, fill: '#dc2626', label: 't = 2,5', dx: -20, dy: 12 });
  layers.push({ type: 'label', p: { x: 520, y: 102 }, text: 'sens du parcours →', dx: 0, dy: 12, size: 12, color: '#475569' });
  return figure(P, layers, { width: 380, pad: 40, extra: [{ x: 60, y: 50 }, { x: 940, y: 640 }] });
}

/** The greedy algorithm, one guard per panel. */
function greedySteps(P, S, u) {
  const run = S.greedy(u);
  const panels = run.guards.map((G, i) => {
    const layers = [{ type: 'polygon' }];
    run.guards.slice(0, i + 1).forEach((H, j) => layers.push({ type: 'chain', a: H.a, b: H.b, color: COLORS[j % 6], width: j === i ? 6 : 4, opacity: j === i ? 1 : 0.45 }));
    layers.push({ type: 'seg', a: G.g, b: P.at(G.a), stroke: COLORS[i % 6], dash: '3 3' }, { type: 'seg', a: G.g, b: P.at(G.b), stroke: COLORS[i % 6], dash: '3 3' });
    layers.push({ type: 'dot', p: G.g, r: 5, fill: COLORS[i % 6], label: `g${SUB[i + 1]}` });
    layers.push({ type: 'dot', p: P.at(G.a), r: 4, fill: '#111', stroke: '#fff', label: i === 0 ? 'u' : `u${SUB[i + 1]}`, dx: -14, dy: -16 });
    return figure(P, layers, { width: 240 });
  });
  return { panels, run };
}

function growthTable() {
  const fmt = (x) => {
    if (x < 1e5) return Math.round(x).toLocaleString('fr-FR');
    const e = Math.floor(Math.log10(x));
    return `${(x / 10 ** e).toFixed(1).replace('.', ',')} × 10<sup>${e}</sup>`;
  };
  const time = (ops) => {
    const s = ops / 1e9;
    if (s < 1e-3) return 'moins d’une milliseconde';
    if (s < 1) return `${Math.round(s * 1000)} ms`;
    if (s < 3600) return `${Math.round(s)} s`;
    if (s < 86400 * 3) return `${Math.round(s / 3600)} heures`;
    if (s < 86400 * 365 * 3) return `${Math.round(s / 86400)} jours`;
    return `${Math.round(s / 86400 / 365).toLocaleString('fr-FR')} ans`;
  };
  const rows = [['$n\\log n$', (n) => n * Math.log2(n)], ['$n^2$', (n) => n * n], ['$n^2\\log^2 n$', (n) => n * n * Math.log2(n) ** 2], ['$n^5$', (n) => n ** 5]];
  return `<table><thead><tr><th>Croissance</th><th>$n=10$</th><th>$n=100$</th><th>$n=1000$</th><th>Temps pour $n=1000$<br>(10<sup>9</sup> opérations par seconde)</th></tr></thead><tbody>${rows.map(([name, f]) =>
    `<tr><td>${name}</td><td>${fmt(f(10))}</td><td>${fmt(f(100))}</td><td>${fmt(f(1000))}</td><td>${time(f(1000))}</td></tr>`).join('')}</tbody></table>`;
}

// ------------------------------------------------------------------ document
export default function projetDetaille(stats) {
  const pb = F.fig_problem();
  const core = F.fig_core();
  const gb = F.fig_goodbad();
  const rep = F.fig_replace();
  const l49 = F.fig_lemma49();
  const arr = F.fig_arrangement();
  const t54 = F.fig_theorem54();
  const l62 = F.fig_lemma62();
  const ns = F.fig_nextstep();
  const np = F.fig_nextplot();

  const U = poly('ushape');
  const solU = new Solver(U).solve();
  const comb = poly('comb');
  const Sc = new Solver(comb);
  const optC = Sc.solve();
  let badU = null;
  for (let i = 0; i < 400 && badU === null; i++) { const u = (i * comb.n) / 400 + 0.003; if (Sc.greedy(u).guards.length === optC.k + 1) badU = u; }
  const steps = greedySteps(comb, Sc, badU);
  const i0 = Math.max(0, optC.guards.findIndex((G) => mod(badU - G.a, comb.n) <= G.b - G.a + 1e-9));
  const optRot = optC.guards.map((_, i) => optC.guards[(i0 + i) % optC.guards.length]);
  const good = greedySteps(comb, Sc, mod(optC.guards[0].a, comb.n));

  return String.raw`
<style>
.one { border: 1px solid #c7d2fe; background: #eef2ff; border-radius: 3mm; padding: 2.5mm 4.5mm; margin: 3mm 0; break-inside: avoid; }
.one p { margin: 0.5mm 0; font-size: 11.5pt; }
.t { display: block; font: 700 8.5pt Helvetica, Arial, sans-serif; letter-spacing: .06em; text-transform: uppercase; margin-bottom: 1mm; }
.one .t { color: #4338ca; }
.key { border: 1px solid #a7f3d0; background: #ecfdf5; border-radius: 3mm; padding: 2.5mm 4.5mm; margin: 4mm 0; break-inside: avoid; }
.key .t { color: #047857; }
.key ul { margin: 0; padding-left: 5mm; }
.analogy { border-left: 3px solid #f59e0b; background: #fffbeb; padding: 2.5mm 4mm; margin: 3.5mm 0; border-radius: 0 2mm 2mm 0; break-inside: avoid; text-align: left; }
.analogy .t { display: inline; color: #b45309; }
.ask { border: 1px solid #e2e8f0; background: #f8fafc; border-radius: 3mm; padding: 2.5mm 4.5mm; margin: 4mm 0; }
.ask .q { break-after: avoid; }
.ask .a { break-inside: avoid; }
.ask .t { color: #475569; }
.ask .q { font-weight: 700; margin: 2mm 0 0.3mm; }
.ask .a { margin: 0 0 0 4mm; color: #334155; }
.warn { border-left: 3px solid #ef4444; background: #fef2f2; padding: 2.5mm 4mm; margin: 3.5mm 0; border-radius: 0 2mm 2mm 0; break-inside: avoid; }
.script { border: 1px solid #c7d2fe; background: #f5f3ff; border-radius: 3mm; padding: 3mm 4.5mm; margin: 3.5mm 0; break-inside: avoid; }
.script .t { color: #6d28d9; }
pre.pseudo { font: 8.6pt Menlo, monospace; background: #0f172a; color: #e2e8f0; padding: 3.5mm 4mm; border-radius: 2mm; line-height: 1.45; white-space: pre-wrap; break-inside: avoid; }
pre.pseudo b { color: #fbbf24; font-weight: 400; }
pre.pseudo i { color: #94a3b8; font-style: normal; }
.minirow { display: flex; gap: 4mm; justify-content: center; margin: 3mm 0; break-inside: avoid; }
figure.mini { flex: 1; text-align: center; margin: 0; }
figure.mini figcaption { font-size: 8.8pt; text-align: center; }
.bars { margin: 3mm 0; break-inside: avoid; }
.bar-row { display: grid; grid-template-columns: 52mm 1fr 26mm; gap: 3mm; align-items: center; margin: 2mm 0; font: 9pt Helvetica, Arial, sans-serif; }
.bar-name span { color: #64748b; }
.bar-track { height: 4mm; background: #f1f5f9; border-radius: 2mm; overflow: hidden; }
.bar-track div { height: 100%; border-radius: 2mm; }
.bar-val { text-align: right; }
.figrow.three figure { width: 31%; flex: 0 0 31%; }
.figrow.three { flex-wrap: wrap; }
.plan { counter-reset: s; list-style: none; padding: 0; }
.plan li { counter-increment: s; margin: 2mm 0; padding-left: 9mm; position: relative; }
.plan li::before { content: counter(s); position: absolute; left: 0; top: 0; width: 6mm; height: 6mm; border-radius: 50%; background: #4f46e5; color: #fff; font: 700 9pt Helvetica; text-align: center; line-height: 6mm; }
.tree { font: 8.8pt Menlo, monospace; background: #f8fafc; border: 1px solid #e2e8f0; padding: 3mm 4mm; border-radius: 2mm; white-space: pre; line-height: 1.4; break-inside: avoid; }
.shotrow img.shot { max-height: 95mm; width: auto; max-width: 100%; margin: 0 auto; }
.shotrow figure { text-align: center; }
table.small td, table.small th { font-size: 8.6pt; }
.part { padding-top: 40mm; }
</style>

<div class="cover">
  <div class="kicker">INFO-F420 Computational Geometry · ULB · 2026–2027</div>
  <h1>Le projet expliqué en détail</h1>
  <p class="subtitle">Tout ce qu'il faut comprendre sur « Guarding Walls Contiguously » : le cours, le problème, chaque étape de l'algorithme, notre code, notre site et l'oral — expliqué depuis zéro, sans rien supposer</p>
  <p class="authors">Projet d'Ilias Akajou (520466) et Jomaa Abdulrahman (583629)</p>
  <div class="toc-box"><strong>Les 8 parties</strong><ol>
    <li><b>Le projet en bref</b> : ce que le cours demande, ce que nous avons fait, qui a fait quoi</li>
    <li><b>Les bases, depuis zéro</b> : polygone, « voir », le bord, la notation $O(\dots)$, comment lire un article</li>
    <li><b>Le problème</b> : la galerie d'art, notre variante, pourquoi c'est surprenant, pourquoi « simple »</li>
    <li><b>L'algorithme, étape par étape</b> : les 12 étapes de la preuve, chacune avec une image, un exemple et ce qu'il faut retenir</li>
    <li><b>Notre code</b> : les fichiers, le solveur, les tests, ce qu'on a trouvé</li>
    <li><b>Notre site</b> : les pages et les 11 figures interactives</li>
    <li><b>L'oral</b> : le déroulé, quoi dire, les questions probables</li>
    <li><b>Teste-toi</b> et petit dictionnaire français–anglais</li>
  </ol></div>
  <div class="note-cover"><b>Comment lire ce document.</b> Chaque section commence par un encadré bleu <b>« En une phrase »</b> et finit par un encadré vert <b>« À retenir »</b>.
  Si tu as peu de temps, lis seulement ces encadrés : tu auras l'essentiel. Si tu as une heure, lis les parties 1 à 3 en entier et les encadrés de la partie 4.
  Pour l'oral, lis en plus ta propre moitié de la partie 4 en entier (Ilias : 4.1 à 4.8 ; Jomaa : 4.9 à 4.13) et la partie 7.
  Toutes les figures ont été calculées par notre propre code, le même que celui du site.</div>
</div>

${part('1', 'Le projet en bref', 'Ce que le cours demande, ce que nous avons fait, et qui a fait quoi.')}

<h2>1.1 Le cours et ce qu'on doit rendre</h2>
${one('Dans le cours INFO-F420, chaque équipe choisit un sujet de géométrie algorithmique, l’explique sur une page web interactive publique, et le présente oralement.')}
<p>Le projet se fait à deux. Ce que le cours demande :</p>
<table><thead><tr><th>Demande du cours</th><th>Ce que nous avons</th></tr></thead><tbody>
<tr><td>Une page web publique avec les noms des auteurs</td><td>Le site sur GitHub Pages : <code>iakajou.github.io/contiguous-art-gallery</code></td></tr>
<tr><td>Un rapport (le sujet et le travail fait)</td><td>La page <em>Report</em> du site, plus les 5 chapitres de la preuve</td></tr>
<tr><td>Des résultats de programmation</td><td>11 figures interactives, un jeu, et un solveur testé (${stats.checks})</td></tr>
<tr><td>Un lien vers un dépôt git public avec tout le code</td><td><code>github.com/iakajou/contiguous-art-gallery</code></td></tr>
<tr><td>Qui a fait quoi, et l'aide extérieure (humaine ou IA)</td><td>Section R.5 « Team: who did what » et R.6 (IA) du rapport ; une fiche par personne</td></tr>
<tr><td>Une bibliographie bien formatée</td><td>Section R.7 du rapport</td></tr>
<tr><td>Un journal IA</td><td>À compléter par nous (parties 4 et 5) et à joindre à la remise</td></tr>
<tr><td>La remise</td><td>Le zip, le lien de la page et le lien du dépôt, déposés <b>par chacun de nous deux</b> (remises identiques) ; le lien posté sur le forum</td></tr>
<tr><td>Les dates</td><td>Remise le <b>25 novembre</b> ; présentation orale en <b>décembre</b></td></tr>
</tbody></table>

<h2>1.2 Notre projet en cinq phrases</h2>
<ol class="plan">
<li>Le sujet : on veut filmer <b>tous les murs</b> d'une galerie (un polygone simple) avec le moins de caméras possible, chaque caméra ne filmant qu'<b>une seule bande continue de mur</b>.</li>
<li>Ce problème, posé en 2024, a été résolu très vite ; nous expliquons la solution la plus simple, celle de <b>de Berg, Conradi, van der Hoog et Staals (2025)</b>.</li>
<li>Leur idée : lancer un <b>algorithme glouton</b> (toujours aller le plus loin possible) depuis une <b>liste finie de points de départ</b> bien choisis, et garder le meilleur résultat.</li>
<li>Nous avons <b>programmé tout l'algorithme</b> en JavaScript et <b>vérifié chaque étape de la preuve</b> par des tests automatiques ; nous y avons trouvé une imprécision dans l'énoncé d'un lemme (le 6.2).</li>
<li>Le tout est expliqué sur un <b>site interactif</b> : une page d'accueil courte pour l'oral, cinq chapitres pour la preuve avec une figure manipulable par étape, un jeu et le rapport.</li>
</ol>

<h2>1.3 Le retour du prof, et comment on l'a suivi</h2>
<p>Dans notre proposition (19 octobre), le site avait quatre parties : 1. le problème, 2. l'algorithme de l'article, 3. un jeu, 4. le rapport. Nous avions prévu qu'Ilias ferait la partie 1,
Jomaa la partie 2, et les deux les parties 3 et 4. Le prof a répondu trois choses :</p>
<table><thead><tr><th>Ce que le prof a dit</th><th>Ce que nous avons fait</th></tr></thead><tbody>
<tr><td>Ne pas passer trop de temps sur le problème classique de la galerie d'art (il y a beaucoup de ressources)</td><td>La partie 1 tient en une seule section de l'accueil et deux phrases à l'oral</td></tr>
<tr><td>Travailler <b>tous les deux</b> sur la partie 2 (le cœur du projet) et s'en répartir les explications</td><td>La preuve est coupée en deux moitiés : Ilias explique la première (sections 2.1–2.4), Jomaa la seconde (2.5–2.10)</td></tr>
<tr><td>Des widgets web pour illustrer les étapes de la preuve</td><td>Une figure interactive par étape : 11 figures au total</td></tr>
</tbody></table>

<h2>1.4 Qui a fait quoi</h2>
<table><thead><tr><th>Partie</th><th>Ilias</th><th>Jomaa</th></tr></thead><tbody>
<tr><td>1. Le problème (court)</td><td>Accueil 01–02 et figure 1</td><td>A signalé que l'hypothèse « polygone simple » manquait</td></tr>
<tr><td>2. L'algorithme, 1<sup>re</sup> moitié</td><td>Noyaux, glouton, bons/mauvais gardiens, remplacement (2.1–2.4, figures 2–5)</td><td></td></tr>
<tr><td>2. L'algorithme, 2<sup>e</sup> moitié</td><td></td><td>$G_P$, $U_P$, théorème 5.4, lemme 6.2, pas glouton, algorithme complet, $\Theta(n\log n)$ (2.5–2.10, figures 6–11)</td></tr>
<tr><td>Code</td><td>Bases de géométrie, glouton, solveur, jeu, structure et design du site</td><td>Plus courts chemins, arrangement, candidats, mauvais gardiens, constructions des preuves, tests</td></tr>
<tr><td>4. Rapport</td><td>R.1, R.2</td><td>R.3, R.4 (ensemble : R.5–R.7)</td></tr>
<tr><td>Oral (12 min)</td><td>0:00–5:15 et 11:15–12:00</td><td>5:15–11:15</td></tr>
</tbody></table>
<p>Le code, les figures et les premiers jets des textes ont été produits avec un assistant IA (Claude), dans des séances menées par Ilias. Pour chaque partie, la personne nommée
l'a vérifiée face à l'article, testée, et c'est elle qui l'explique. C'est écrit tel quel dans le rapport (R.5, R.6) : il faut pouvoir l'assumer à l'oral.</p>
${keep(['Le cours veut : une page web publique, un dépôt git public, un rapport sur la page, qui a fait quoi, l’aide IA déclarée, une bibliographie, un journal IA, un oral.',
    'Le prof voulait : partie 1 courte, tous les deux sur la partie 2, des widgets pour la preuve. C’est ce que nous avons fait.',
    'Ilias = la première moitié de la preuve (+ le problème, le jeu, le site) ; Jomaa = la seconde moitié (+ les tests).'])}

${part('2', 'Les bases, depuis zéro', 'Tout le vocabulaire nécessaire, avec des dessins. Aucune connaissance préalable n’est supposée.')}

<h2>2.1 Un polygone</h2>
${one('Un polygone, c’est une forme fermée faite de segments droits : ici, c’est le plan d’une galerie vue du dessus.')}
<div class="figrow"><figure>${figBasics()}<figcaption>La « salle en U ». Les murs sont les <b>arêtes</b>, les coins sont les <b>sommets</b>. Les points blancs sont les coins rentrants.</figcaption></figure></div>
<ul>
<li><b>$n$</b> = le nombre de sommets (égal au nombre d'arêtes). C'est la <b>taille</b> du problème : quand on dit qu'un algorithme est rapide, on parle de la façon dont son temps grandit avec $n$. La salle en U a $n=8$.</li>
<li><b>Sommet réflexe</b> (coin rentrant) : un coin dont l'angle <em>intérieur</em> dépasse 180°. Dans la salle en U, ce sont les deux coins du fond du « U ». Ce sont <b>les seuls coins qui cachent la vue</b> : sans coin rentrant (polygone convexe), on voit tout depuis n'importe où.</li>
<li><b>Convexe</b> : sans creux. Un triangle, un carré, un hexagone régulier sont convexes ; la salle en U ne l'est pas.</li>
</ul>

<h2>2.2 Un polygone <em>simple</em></h2>
${one('Simple = un seul contour fermé, qui ne se croise pas, sans trou. C’est une condition obligatoire de tout le sujet.')}
${figSimple()}
<p>Un « trou », c'est par exemple un pilier ou un bloc au milieu de la salle. Tous les articles supposent qu'il n'y en a pas, et l'algorithme ne marche <b>pas</b> sans cette hypothèse
(on verra pourquoi en 3.5). C'est la remarque que Jomaa a faite sur le site : il faut le dire clairement, dès le début.</p>

<h2>2.3 « Voir »</h2>
${one('Un point $g$ voit un point $q$ si le segment $gq$ reste à l’intérieur de la galerie, comme un rayon laser qui ne traverse pas les murs.')}
<div class="figrow"><figure>${figSee()}<figcaption>$g$ voit $q$ (vert) mais pas $q'$ (rouge) : le coin rentrant entouré cache toute la partie rose du mur de droite. La limite de l'ombre est le prolongement de la ligne $g$–coin.</figcaption></figure>
<figure>${pb.a}<figcaption>Tout ce que voit $g$ : la zone jaune (son « polygone de visibilité »). Sur le bord, il voit plusieurs morceaux séparés (en bleu).</figcaption></figure></div>
<p>Deux précisions qui comptent pour la suite :</p>
<ul>
<li><b>Frôler est permis.</b> Un segment qui longe un mur ou qui touche un coin compte comme « dans » la galerie (on dit que la galerie est un ensemble <em>fermé</em>).</li>
<li><b>Ce qui cache, ce sont les coins rentrants.</b> Une ombre commence toujours sur la ligne qui part de l'observateur et passe par un coin rentrant.</li>
</ul>

<h2>2.4 Le bord, et comment on repère un point du bord</h2>
${one('Le bord de la galerie est une boucle ; on le parcourt toujours dans le même sens, et chaque point du bord est repéré par un seul nombre $t$.')}
<div class="figrow"><figure>${figParam()}<figcaption>Les sommets sont numérotés de 0 à $n-1$ dans le sens inverse des aiguilles d'une montre. L'arête $i$ va du sommet $i$ au sommet $i+1$.
Le point $t=2{,}5$ est au milieu de l'arête 2 ; le point $t=0{,}25$ est au quart de l'arête 0.</figcaption></figure></div>
<ul>
<li>Le bord est noté $\partial P$ (« dé-P »). Quand on fait le tour, après le sommet $n-1$ on revient au sommet 0.</li>
<li>Un point du bord = un nombre $t$ entre $0$ et $n$ : <b>partie entière</b> = numéro de l'arête, <b>partie décimale</b> = position sur l'arête. C'est exactement comme ça que notre code représente les points du bord.</li>
<li>Une <b>chaîne</b> $[u,v]$ = le morceau de bord qu'on parcourt en allant de $u$ à $v$ dans le sens du parcours. C'est « une bande de mur ».</li>
</ul>

<h2>2.5 Algorithme et notation $O(\dots)$</h2>
${one('Un algorithme est une recette précise ; $O(\\dots)$ dit comment son temps de calcul grandit quand le problème grandit.')}
<p>Dire qu'un algorithme est en $O(n^2)$, c'est dire : pour une galerie à $n$ coins, il fait au plus de l'ordre de $n^2$ opérations (on ignore les constantes comme « 3 fois »).
Concrètement, si $n$ double, un algorithme en $O(n^2)$ prend environ 4 fois plus de temps, un algorithme en $O(n^5)$ environ 32 fois plus. Le logarithme $\log n$ grandit très lentement :
$\log_2 1000\approx 10$, $\log_2 10^6\approx 20$.</p>
${growthTable()}
<p>Le symbole $\Theta(\dots)$ (thêta) veut dire « exactement de cet ordre » : pas plus, <em>et</em> pas moins. Quand on dit que le problème est en $\Theta(n\log n)$, on dit qu'il existe un
algorithme en $O(n\log n)$ <b>et</b> qu'aucun algorithme ne peut faire mieux.</p>
<p>« Polynomial » veut dire en $O(n^c)$ pour une constante $c$ : c'est la frontière entre « faisable » et « impossible en pratique ». <b>NP-difficile</b> veut dire qu'on ne connaît aucun algorithme
polynomial et qu'on pense qu'il n'en existe pas.</p>

<h2>2.6 Comment lire un article de recherche</h2>
<table><thead><tr><th>Mot</th><th>Ce que ça veut dire</th></tr></thead><tbody>
<tr><td>Définition</td><td>On donne un nom à quelque chose (ex. : « gardien mauvais »).</td></tr>
<tr><td>Observation</td><td>Un petit fait facile, prouvé en quelques lignes.</td></tr>
<tr><td>Lemme</td><td>Un résultat intermédiaire, une « brique » qui sert à prouver le résultat principal.</td></tr>
<tr><td>Proposition</td><td>Un résultat de taille moyenne.</td></tr>
<tr><td>Corollaire</td><td>Une conséquence directe d'un résultat qu'on vient de prouver.</td></tr>
<tr><td>Théorème</td><td>Un résultat important.</td></tr>
<tr><td>Preuve</td><td>L'argument qui montre que c'est vrai dans <em>tous</em> les cas. Elle finit par □.</td></tr>
</tbody></table>
<p>Dans notre article, les résultats sont numérotés par section : « lemme 6.2 » = le 2<sup>e</sup> résultat de la section 6. Notre site garde cette numérotation pour qu'on puisse comparer avec l'article.</p>
${keep(['$n$ = nombre de coins ; les coins rentrants (réflexes) sont ceux qui cachent la vue.',
    'Simple = un contour, pas de croisement, pas de trou : obligatoire.',
    '$g$ voit $q$ si le segment $gq$ reste dans la galerie (frôler est permis).',
    'Un point du bord = un nombre $t$ (arête + position) ; une chaîne $[u,v]$ = une bande de mur parcourue dans le sens inverse des aiguilles d’une montre.',
    '$O(n^2)$ = « grandit comme $n^2$ » ; $\\Theta$ = exactement cet ordre ; NP-difficile = pas d’algorithme rapide connu.'])}

${part('3', 'Le problème', 'La galerie d’art classique (en bref), notre variante « contiguë », et pourquoi elle est surprenante.')}

<h2>3.1 Le problème classique (très court, comme le prof l'a demandé)</h2>
<p>En 1973, Victor Klee pose la question : combien de gardiens faut-il pour que <b>chaque point</b> d'une galerie soit vu par au moins un gardien ? En 1975, Chvátal montre que
$\lfloor n/3\rfloor$ gardiens suffisent toujours (et sont parfois nécessaires). Mais trouver le nombre <b>minimum</b> pour une galerie donnée est <b>NP-difficile</b> (Lee et Lin, 1986),
et même $\exists\mathbb{R}$-complet (Abrahamsen, Adamaszek et Miltzow, 2018) : c'est encore plus dur que NP. Même si on ne veut surveiller <b>que les murs</b> avec des gardiens ordinaires,
le problème reste $\exists\mathbb{R}$-difficile (Stade, 2025).</p>
<p><b>À l'oral : deux phrases maximum.</b> « Le problème classique est très dur. Notre variante, étonnamment, ne l'est pas. »</p>

<h2>3.2 Notre problème : une caméra filme une seule bande de mur</h2>
${one('On veut couvrir tout le bord avec le moins de caméras possible, chaque caméra filmant une seule bande continue de mur qu’elle voit entièrement.')}
${pic('une caméra de surveillance posée dans la salle, qui pivote lentement et filme une bande de mur d’un seul tenant. Elle ne peut pas filmer un bout de ce mur-ci puis sauter à un autre mur plus loin.')}
<div class="box def"><b>Définition (gardien contigu).</b> Un gardien contigu est un couple $(g,[u,v])$ : un point $g$ de la galerie et une chaîne $[u,v]$ du bord dont $g$ voit <b>chaque point</b>.
Le <b>problème de la galerie d'art contiguë</b> demande le nombre minimum $k$ de gardiens contigus dont les chaînes, ensemble, couvrent tout le bord.</div>
<div class="figrow"><figure>${pb.a}<figcaption>$g$ voit plusieurs morceaux de bord (bleus), mais comme gardien contigu il n'en garde <b>qu'un seul</b>.</figcaption></figure>
<figure>${pb.b}<figcaption>Une solution optimale : $k=${pb.k}$. Chaque couleur est la bande d'une caméra ; ensemble elles font tout le tour.</figcaption></figure></div>
<p><b>Pourquoi une caméra ne suffit pas ici ?</b> Il faudrait un point d'où l'on voit toute la salle. Dans la salle en U, il n'y en a pas : depuis le bras gauche, on ne voit pas le fond du bras droit.
Une galerie qui possède un tel point s'appelle <b>étoilée</b>. Une caméra suffit <b>si et seulement si</b> la galerie est étoilée.</p>
<p>On peut toujours supposer que les bandes <b>ne se chevauchent pas</b> : si deux bandes se chevauchent, on raccourcit l'une (une caméra qui voit une bande voit aussi tout morceau de cette bande).
Une solution est donc un <b>découpage du bord en $k$ bandes</b>, chacune filmée par sa caméra.</p>

<h2>3.3 Pourquoi c'est surprenant</h2>
${one('On ajoute une contrainte (« une seule bande par caméra ») et le problème devient facile, alors que toutes les autres variantes sont très dures.')}
<p>La raison profonde : le bord est une <b>boucle</b>, et chaque caméra en couvre un <b>arc</b>. Le problème devient « couvrir un cercle avec le moins d'arcs possible ».
C'est un problème à <b>une dimension</b>, beaucoup plus facile qu'un problème sur une surface.</p>
<div class="figrow"><figure style="flex:0 0 36%">${figLoop(U, solU.guards)}<figcaption>Le bord de la salle en U vu comme une boucle : les deux arcs colorés sont les deux bandes de la solution.</figcaption></figure>
<figure>${pic('une piste d’athlétisme circulaire à éclairer avec des projecteurs. Chaque projecteur éclaire un arc de piste. Stratégie simple : partir d’un point, prendre le projecteur qui éclaire le plus loin, repartir de là où il s’arrête, et recommencer. La seule difficulté : par où commencer.')}</figure></div>
<table><thead><tr><th>Année</th><th>Qui</th><th>Résultat</th></tr></thead><tbody>
<tr><td>2024</td><td>Thomas Shermer (conférence CCCG)</td><td>pose le problème : est-il facile ou difficile ?</td></tr>
<tr><td>fin 2024</td><td>trois équipes indépendantes</td><td>trois algorithmes polynomiaux, très différents et lents ; réunis en un article à SoCG 2025 : $O(kn^5\log n)$</td></tr>
<tr><td><b>2025</b></td><td><b>de Berg, Conradi, van der Hoog, Staals</b></td><td><b>une preuve courte et un algorithme en $O(kn^2\log^2 n)$ — notre article</b></td></tr>
<tr><td>2025–2026</td><td>de Berg, Conradi, van der Hoog, Rotenberg</td><td>l'algorithme le plus rapide possible : $\Theta(n\log n)$</td></tr>
</tbody></table>
<p>En un an à peine, on est passé d'une question ouverte à l'algorithme optimal. Nous avons choisi l'article de 2025 parce qu'il est <b>court</b> (12 pages avec les références, contre 48, 22 et 21 pages pour les
trois premières preuves) et presque autonome : on peut le comprendre en entier.</p>

<h2>3.4 Le paramètre $k$</h2>
<p>Le temps de notre algorithme dépend aussi de $k$, le nombre de caméras de la réponse. On dit que l'algorithme est <b>sensible à la sortie</b> (<em>output-sensitive</em>) : il est plus rapide
quand la réponse est petite. Comme $k\le n$ (une caméra par arête suffit toujours), $O(kn^2\log^2 n)$ est au pire $O(n^3\log^2 n)$.</p>

<h2>3.5 Pourquoi le polygone doit être simple</h2>
<ol>
<li><b>Le bord doit être une seule boucle.</b> Tout repose sur « couvrir un cercle par des arcs ». Avec un trou, le bord est fait de plusieurs boucles (le contour et le tour du trou).</li>
<li><b>Pas de poche cachée.</b> Dans un polygone simple, toute courbe fermée tracée dans la galerie n'entoure que des points de la galerie. Les preuves utilisent ça sans arrêt : « le petit
polygone formé par la caméra et sa bande est dans la galerie ». Et il n'y a qu'<b>un seul</b> plus court chemin entre deux points ; avec un trou, on pourrait le contourner par la gauche ou par la droite.</li>
<li><b>Voir les deux bouts ne suffit plus.</b> Avec un trou, une caméra peut voir les deux bouts d'un mur sans voir son milieu :</li>
</ol>
<div class="figrow"><figure>${figHoleShadow()}</figure></div>
<p>Merrild et al. écrivent que leur méthode ne marche pas avec des trous, et que ce cas est une <b>question ouverte</b>. Notre solveur refuse d'ailleurs un polygone non simple.</p>
${keep(['Problème : couvrir tout le bord avec le moins de caméras, chacune filmant une seule bande continue qu’elle voit en entier.',
    'Une caméra suffit si et seulement si la galerie est étoilée.',
    'La surprise : les autres variantes sont très dures, celle-ci est facile parce que le bord est une boucle (couvrir un cercle par des arcs).',
    'Notre article (2025) : $O(kn^2\\log^2 n)$. Le meilleur possible (2026) : $\\Theta(n\\log n)$.',
    'Sans « polygone simple », la méthode ne marche plus, et le cas avec trous est ouvert.'])}

${part('4', 'L’algorithme, étape par étape', 'Les 12 étapes de la preuve. Ilias explique 4.1 à 4.8, Jomaa 4.9 à 4.13.')}

<h2>Le plan de toute la preuve</h2>
<p>Avant d'entrer dans les détails, voici la logique complète. Garde-la sous les yeux : chaque section ci-dessous est une case de ce plan.</p>
<ol class="plan">
<li><b>Ce qu'une caméra peut voir</b> (4.1) — pour voir une bande, la caméra doit être devant chacun de ses murs : dans le « noyau ».</li>
<li><b>Le glouton</b> (4.2–4.3) — depuis un point $u$, prendre la bande la plus longue possible, repartir de sa fin, recommencer.</li>
<li><b>Le glouton est presque parfait</b> (4.4) — au plus $k+1$ caméras, et exactement $k$ s'il part du début d'une bande optimale.</li>
<li><b>Le vrai problème : où commencer</b> (4.5) — il y a une infinité de départs ; il faut une liste finie qui contient un bon départ.</li>
<li><b>Bonnes et mauvaises caméras</b> (4.6) — on trie les caméras en deux sortes selon l'angle sous lequel elles voient leur bande.</li>
<li><b>Une bonne caméra peut glisser vers un croisement</b> (4.7) — sur un croisement de deux droites qui prolongent des murs.</li>
<li><b>Les mauvaises caméras</b> (4.8) — on peut les trouver sur une droite bien précise.</li>
<li><b>La liste des départs $U_P$</b> (4.9) — fabriquée à partir des croisements : environ $n^2$ points.</li>
<li><b>Le théorème 5.4</b> (4.10) — une solution optimale commence toujours en un point de $U_P$.</li>
<li><b>Calculer une bande visible vite</b> (4.11) — avec deux plus courts chemins et deux rayons (lemme 6.2).</li>
<li><b>Un pas du glouton en $O(\log^2 n)$</b> (4.12) — lemme 6.8 ; puis tout assembler : $O(kn^2\log^2 n)$ (théorème 7.1).</li>
<li><b>Et après</b> (4.13) — l'algorithme optimal $\Theta(n\log n)$.</li>
</ol>

<h2>4.1 Ce qu'une caméra peut voir : le noyau de visibilité <span class="ref">(obs. 2.1, 2.2 — site : section 2.1, figure 2 — Ilias)</span></h2>
${one('Pour voir toute une bande de mur, la caméra doit être du côté intérieur de chacun des murs de la bande ; la zone où c’est le cas s’appelle le noyau de la bande.')}
${pic('un mur a un « devant » (côté salle) et un « derrière ». On ne peut pas filmer un mur de dos. Pour filmer plusieurs murs à la fois, il faut être devant chacun d’eux.')}
<p>Prolonge chaque mur de la bande par une droite infinie. Chaque droite coupe le plan en deux : le côté « devant le mur » (à gauche quand on parcourt le bord dans le bon sens) et le côté « derrière ».
Le <b>noyau de visibilité</b> $P_E$ de la bande est l'ensemble des points qui sont devant <b>tous</b> ses murs à la fois.</p>
<div class="figrow"><figure>${core.f1}<figcaption>Une bande (verte), les droites qui prolongent ses murs (pointillés) et son noyau (zone verte). La caméra $g$ dans le noyau voit toute la bande.</figcaption></figure>
<figure>${core.f2}<figcaption>Une caméra hors du noyau : elle est derrière un des murs, et ne voit pas tout (parties rouges).</figcaption></figure></div>
<ul>
<li><b>Observation 2.1</b> : une caméra qui voit toute une bande est <b>forcément</b> dans le noyau de cette bande. (Sinon elle serait derrière un des murs et le verrait « de dos ».)</li>
<li>Attention, l'inverse n'est pas toujours vrai : être dans le noyau ne suffit pas toujours (un autre morceau de galerie peut cacher la vue). Toute la suite de l'article sert justement à gérer ça.</li>
<li><b>Observation 2.2</b> : une seule caméra suffit pour toute la galerie <b>si et seulement si</b> le noyau de <em>tous</em> les murs n'est pas vide : c'est la définition d'une galerie <b>étoilée</b>.
On sait le tester en temps $O(n)$ (algorithme de Lee et Preparata).</li>
<li>Le noyau est toujours <b>convexe</b> (une intersection de demi-plans), et ses coins sont des <b>croisements de droites qui prolongent des murs</b>. Retiens bien ce dernier point : il sert en 4.7.</li>
</ul>
${keep(['Noyau d’une bande = la zone devant tous ses murs ; c’est un polygone convexe dont les coins sont des croisements de droites-murs.',
    'Une caméra qui voit une bande est dans son noyau (obs. 2.1).',
    'Une caméra suffit ⇔ la galerie est étoilée ⇔ le noyau de tous les murs n’est pas vide (obs. 2.2), testable en $O(n)$.'])}

<h2>4.2 Le pas glouton : $\mathrm{next}(u)$ <span class="ref">(site : section 2.2 — Ilias)</span></h2>
${one('$\\mathrm{next}(u)$ est le point le plus loin $v$ tel qu’une caméra (n’importe où) puisse filmer toute la bande de $u$ à $v$.')}
<p>On part d'un point $u$ du bord. Parmi toutes les positions possibles de caméra et toutes les bandes qui commencent en $u$, on prend celle qui va <b>le plus loin</b>.
Son point d'arrivée s'appelle $\mathrm{next}(u)$ (« le suivant de $u$ »). Deux propriétés simples :</p>
<ul>
<li><b>$\mathrm{next}$ ne recule jamais</b> : si $u'$ est après $u$, alors $\mathrm{next}(u')$ est après (ou égal à) $\mathrm{next}(u)$. En effet, une caméra qui voit $[u,v]$ voit aussi le morceau $[u',v]$.</li>
<li><b>Calculer $\mathrm{next}(u)$ est la vraie difficulté technique</b> : il y a une infinité de positions de caméra possibles. C'est le sujet des sections 4.11 et 4.12.</li>
</ul>

<h2>4.3 L'algorithme glouton, pas à pas <span class="ref">(site : section 2.2, figure 3 — Ilias)</span></h2>
${one('Le glouton part de $u$, saute à $\\mathrm{next}(u)$, puis à $\\mathrm{next}(\\mathrm{next}(u))$, et ainsi de suite, jusqu’à avoir fait le tour complet.')}
${pic('une randonnée de plusieurs jours avec des refuges : chaque jour, tu marches jusqu’au refuge le plus lointain que tu peux atteindre. Un jour = une caméra.')}
<p>Voici le glouton sur la galerie « peigne » ($n=${comb.n}$, optimum $k=${optC.k}$), lancé depuis un point $u$ quelconque. Chaque image ajoute une caméra :</p>
<div class="figrow four">${steps.panels.map((p, i) => `<figure>${p}<figcaption>Étape ${i + 1} : depuis ${i === 0 ? '$u$' : `$u_${i + 1}$`}, la caméra $g_${i + 1}$ filme la bande la plus longue possible.${i === steps.panels.length - 1 ? ' Le tour est fini.' : ''}</figcaption></figure>`).join('')}</div>
<p>Résultat : <b>${steps.run.guards.length} caméras</b>, alors que l'optimum est ${optC.k}. Depuis un autre départ — le début d'une bande d'une solution optimale — le glouton trouve l'optimum :</p>
<div class="figrow three">${good.panels.map((p, i) => `<figure>${p}<figcaption>Étape ${i + 1}</figcaption></figure>`).join('')}</div>
<p>Le glouton dépend donc du point de départ. La section suivante dit exactement de combien il peut se tromper.</p>

<h2>4.4 Pourquoi le glouton est presque parfait <span class="ref">(preuve du théorème 7.1 — Ilias)</span></h2>
${one('Depuis n’importe quel départ, le glouton utilise au plus $k+1$ caméras ; depuis le début d’une bande optimale, il en utilise exactement $k$.')}
<p>L'argument s'appelle <b>« le glouton reste en avance »</b>. Prends une solution optimale (les $k$ bandes grises ci-dessous). Coupe la boucle au point de départ $u$ et mets-la à plat :</p>
<div class="figrow"><figure>${figStrip(comb, badU, steps.run.guards, optRot)}<figcaption>Ligne du haut : les bandes du glouton. Ligne du bas : une solution optimale, numérotée à partir de la bande qui contient $u$.
Chaque bande gloutonne finit au moins aussi loin que la bande optimale de même rang.</figcaption></figure></div>
<p>Numérote les bandes optimales $O_1, O_2, \dots, O_k$ dans l'ordre du tour, $O_1$ étant celle qui contient $u$. Appelle $e_i$ la fin de $O_i$, et $v_i$ la fin de la $i$-ème bande du glouton.
On montre que <b>$v_i$ est toujours au moins aussi loin que $e_i$</b> :</p>
<ol>
<li><b>Première bande.</b> $O_1$ contient $u$, donc sa caméra filme toute la bande de $u$ à $e_1$. Le glouton prend la bande la plus longue qui commence en $u$ : il va au moins jusqu'à $e_1$. Donc $v_1\ge e_1$.</li>
<li><b>Bande suivante.</b> Supposons $v_i\ge e_i$. Si $v_i$ est déjà après $e_{i+1}$, c'est gagné. Sinon, $v_i$ se trouve dans la bande $O_{i+1}$ (qui commence en $e_i$). La caméra de $O_{i+1}$ filme
donc toute la bande de $v_i$ à $e_{i+1}$ ; le glouton, qui repart de $v_i$ et va le plus loin possible, atteint au moins $e_{i+1}$. Donc $v_{i+1}\ge e_{i+1}$.</li>
<li><b>Conclusion.</b> Après $k$ bandes, le glouton a atteint $e_k$, c'est-à-dire le début de $O_1$ (un tour plus loin), qui est juste avant $u$. Il lui manque au plus le petit morceau jusqu'à $u$ :
<b>une caméra de plus suffit</b>. Total : au plus $k+1$.</li>
<li><b>Bon départ.</b> Si $u$ est exactement le début de $O_1$, alors $e_k$ est $u$ lui-même (un tour plus loin) : $k$ bandes suffisent, et on ne peut pas faire moins puisque $k$ est l'optimum.</li>
</ol>
${keep(['« Le glouton reste en avance » : sa $i$-ème bande finit au moins aussi loin que la $i$-ème bande optimale.',
    'Depuis n’importe où : au plus $k+1$. Depuis le début d’une bande optimale : exactement $k$.',
    'Conséquence : si le glouton depuis $u$ donne $m$ caméras, alors $k$ vaut $m$ ou $m-1$.'])}

<h2>4.5 Le vrai problème : par où commencer ? <span class="ref">(Ilias)</span></h2>
${one('Tout le problème revient à trouver un bon point de départ ; comme il y en a une infinité, il faut une liste finie qui en contient au moins un bon.')}
<p>On ne connaît pas la solution optimale, donc on ne sait pas où ses bandes commencent. Le graphique ci-dessous montre, pour 200 départs répartis sur le bord du peigne, si le glouton
trouve l'optimum (vert) ou une caméra de trop (orange) :</p>
<div class="figrow"><figure>${np.f}<figcaption>En bas : vert = le glouton trouve $k=${np.k}$, orange = $k+1$. Petits traits verts foncés = les points de la liste $U_P$ (section 4.9).
La courbe bleue est $\mathrm{next}(x)$ : elle ne redescend jamais (elle « monte en escalier »).</figcaption></figure></div>
<p>Les premiers algorithmes (2025) essayaient de l'ordre de $kn^3$ départs. L'apport de notre article : une liste $U_P$ d'environ <b>$n^2$</b> départs, dont <b>au moins un</b> est forcément le début
d'une bande d'une solution optimale. Les sections 4.6 à 4.10 construisent cette liste et prouvent qu'elle marche.</p>

<h2>4.6 Bonnes et mauvaises caméras <span class="ref">(déf. 4.1, obs. 4.8 — site : section 2.3, figure 4 — Ilias)</span></h2>
${one('Une caméra est « mauvaise » si elle regarde sa bande autour d’un obstacle, sous un angle de plus de 180° ; sinon elle est « bonne ».')}
${pic('une bonne caméra regarde sa bande « de face », comme un spectateur devant un écran. Une mauvaise caméra est placée dans un coin et voit le mur « s’enrouler » autour d’elle, au-delà d’un demi-tour, alors que les deux bouts de sa bande ne se voient pas entre eux.')}
<p>Précisément, une caméra $(g,[u,v])$ est <b>mauvaise</b> si les <b>quatre</b> conditions suivantes sont vraies à la fois ; il suffit qu'une seule soit fausse pour qu'elle soit bonne :</p>
<table><thead><tr><th>Condition</th><th>En mots</th><th>Exemple mauvais (à gauche)</th><th>Exemple bon (à droite)</th></tr></thead><tbody>
<tr><td>(I)</td><td>la bande contient un coin de la galerie (elle n'est pas dans un seul mur)</td><td>${yes(gb.cls.I)}</td><td>${yes(gb.cls2.I)}</td></tr>
<tr><td>(II)</td><td>la caméra n'est pas posée à un bout de sa bande</td><td>${yes(gb.cls.II)}</td><td>${yes(gb.cls2.II)}</td></tr>
<tr><td>(III)</td><td>l'angle sous lequel elle voit sa bande dépasse 180°</td><td>${yes(gb.cls.III)} (${deg(gb.cls.angle)})</td><td>${yes(gb.cls2.III)} (${deg(gb.cls2.angle)})</td></tr>
<tr><td>(IV)</td><td>les deux bouts $u$ et $v$ ne se voient pas</td><td>${yes(gb.cls.IV)}</td><td>${yes(gb.cls2.IV)}</td></tr>
<tr><td></td><td><b>Verdict</b></td><td><b>mauvaise</b> (4 × oui)</td><td><b>bonne</b></td></tr>
</tbody></table>
<div class="figrow"><figure>${gb.f}<figcaption>Une <b>mauvaise</b> caméra dans la salle à encoche : elle voit sa bande (orange) sous ${deg(gb.cls.angle)}, et le plus court chemin de $u$ à $v$ (violet) doit contourner l'encoche.</figcaption></figure>
<figure>${gb.f2}<figcaption>Une <b>bonne</b> caméra : elle voit sa bande sous ${deg(gb.cls2.angle)}.</figcaption></figure></div>
<p><b>Observation 4.8</b> : pour une mauvaise caméra, le plus court chemin de $u$ à $v$ (la « ficelle tendue » entre les deux bouts) tourne <b>toujours du même côté</b> (à gauche) : il s'enroule autour
de l'obstacle. Ça servira en 4.8.</p>
${warn('« mauvaise » ne veut pas dire « inutile » : une solution optimale peut ne contenir que des mauvaises caméras. C’est justement le cas difficile (section 4.10).')}

<h2>4.7 Une bonne caméra peut glisser vers un croisement <span class="ref">(prop. 4.3, lemmes 4.2–4.6, cor. 4.7 — site : section 2.4, figure 5 — Ilias)</span></h2>
${one('Toute bonne caméra peut être déplacée sur un croisement de deux droites qui prolongent des murs, sans perdre aucun morceau de sa bande.')}
${pic('la caméra est dans une zone convexe (le noyau de sa bande) ; on la pousse vers un coin de cette zone. Les coins du noyau sont des croisements de droites-murs : il n’y en a qu’un nombre fini.')}
<p>Pourquoi c'est important : il y a une <b>infinité</b> de positions possibles pour une caméra, mais seulement environ $n^2/2$ croisements de droites. Si on peut toujours se ramener à un croisement,
on n'a plus qu'un nombre fini de caméras à considérer.</p>
<p>La preuve, en simplifiant :</p>
<ol>
<li>On regarde le petit polygone $P_g$ formé par la caméra $g$, sa bande $[u,v]$ et les deux segments $gu$ et $gv$ (en gris ci-dessous). Il est dans la galerie (polygone simple !) et $g$ voit tout son bord.</li>
<li><b>Proposition 4.3</b> : soit un coin du noyau $P_E$ de la bande est dans $P_g$, soit un coin de la bande est dans le noyau. Dans les deux cas, on trouve un point $c$ qui est devant tous les murs de la bande.</li>
<li>Il faut encore que $c$ soit « du bon côté » des segments $gu$ et $gv$. C'est là qu'on utilise le fait que la caméra est <b>bonne</b> : chaque condition fausse donne un argument
(lemme 4.2 : bande dans un seul mur ; lemme 4.4 : caméra au bout de sa bande ; lemme 4.5 : angle d'au plus 180° ; lemme 4.6 : $u$ voit $v$).</li>
<li><b>Corollaire 4.7</b> : le point $c$ trouvé est un croisement de droites-murs, et il voit toute la bande $[u,v]$.</li>
</ol>
<div class="figrow"><figure>${rep.f}<figcaption>Une bonne caméra $g$ et sa bande (bleue) ; $P_g$ en gris, le noyau $P_E$ en vert. L'étoile $c$ est le croisement trouvé (ici par le lemme ${rep.lemma}) : il voit la même bande.</figcaption></figure></div>
${keep(['Bonne caméra ⇒ on peut la remplacer par une caméra sur un croisement de droites-murs qui voit la même bande (cor. 4.7).',
    'Il y a environ $n^2/2$ croisements : on passe d’une infinité de positions à un nombre fini.',
    'Pour une mauvaise caméra, ça ne marche pas toujours : l’obstacle autour duquel elle regarde peut cacher le croisement.'])}

<h2>4.8 Les mauvaises caméras : sur la droite $\ell_u$ <span class="ref">(lemme 4.9 — site : section 2.4 — Ilias ; utilisé par Jomaa en 4.12)</span></h2>
${one('Une mauvaise caméra peut être remplacée par une caméra située sur une droite précise $\\ell_u$ : au premier ou au dernier point de cette droite dans le noyau.')}
<p>On ne peut pas pousser une mauvaise caméra vers un croisement fixe. Mais on sait quand même où chercher. Prends le plus court chemin entre la fin de la bande et $u$ ; d'après l'observation 4.8,
il s'enroule autour de l'obstacle. La droite $\ell_u$ qui prolonge son <b>dernier segment</b> (celui qui arrive en $u$) est celle qui « rase » l'obstacle. Le <b>lemme 4.9</b> dit : un coin du noyau,
ou le premier ou le dernier point de $\ell_u$ dans le noyau, voit aussi toute la bande.</p>
<div class="figrow"><figure>${l49}<figcaption>La mauvaise caméra de la section 4.6. En rouge : le plus court chemin $S_v$ de $v$ à $u$ ; en orange : les droites $\ell_u$ et $\ell_v$ qui prolongent son dernier et son premier segment.
Le point $g^*$ (étoile) est sur $\ell_u$, au bord du noyau : il voit toute la bande.</figcaption></figure></div>
<p>Ce résultat ne donne pas une liste fixe de positions (la droite $\ell_u$ dépend de $u$), mais il permet de <b>trouver</b> la meilleure mauvaise caméra au moment de calculer $\mathrm{next}(u)$ (section 4.12).</p>

<h2>4.9 La liste des départs $U_P$ <span class="ref">(déf. 5.1, 5.2 — site : section 2.5, figure 6 — Jomaa)</span></h2>
${one('On prolonge tous les murs par des droites ; à chaque croisement, on regarde quelles bandes une caméra posée là peut filmer ; les débuts de ces bandes, plus tous les coins, forment la liste $U_P$.')}
<ol>
<li><b>L'arrangement.</b> On trace la droite qui prolonge chaque mur ($n$ droites). Leurs croisements situés dans la galerie forment un ensemble fini de points (au plus $n(n-1)/2$).</li>
<li><b>Les caméras candidates $G_P$</b> (définition 5.1). Un croisement $c$ est défini par deux murs $ab$ et $ef$. Pour chacune de ces quatre extrémités $x\in\{a,b,e,f\}$ que $c$ voit, on prend
la bande la plus longue vue par $c$ qui contient $x$. Chaque croisement donne donc au plus 4 caméras candidates.</li>
<li><b>Les départs $U_P$</b> (définition 5.2) = les <b>débuts</b> de toutes ces bandes candidates, plus <b>tous les coins</b> de la galerie. Il y en a de l'ordre de $n^2$.</li>
</ol>
<div class="figrow"><figure>${arr.f}<figcaption>La galerie « gallery » ($n=${arr.n}$) : les droites qui prolongent les murs, leurs ${arr.nArr} croisements dans la galerie (points noirs), un croisement $c$ (rouge) et ses bandes candidates.
Au total $|G_P|=${arr.nGP}$ caméras candidates et $|U_P|=${arr.nUP}$ départs (points verts sur le bord).</figcaption></figure></div>
${warn('ne pas confondre : $G_P$ = des <b>caméras</b> (une position + une bande) ; $U_P$ = des <b>points du bord</b> (des départs pour le glouton).')}

<h2>4.10 Le théorème 5.4 : une solution optimale commence dans $U_P$ <span class="ref">(lemme 5.3, théorème 5.4 — site : section 2.6, figure 7 — Jomaa)</span></h2>
${one('Il existe toujours une solution optimale dont une des bandes commence en un point de $U_P$ ; donc le glouton lancé depuis tous les points de $U_P$ trouve l’optimum.')}
<p>C'est le résultat central de l'article. La preuve distingue deux cas.</p>
<p><b>Cas 1 : la solution optimale contient une bonne caméra.</b> On la fait glisser sur un croisement $c$ (section 4.7). La caméra candidate de $c$ voit la bande la plus longue qui contient la bande
d'origine : on l'utilise à la place, et sa bande commence en un point de $U_P$. La caméra précédente raccourcit simplement sa bande pour ne pas chevaucher. Même nombre de caméras.</p>
<p><b>Cas 2 : toutes les caméras sont mauvaises.</b> C'est le cas difficile. L'astuce :</p>
<ol>
<li>on étend chaque bande au maximum de ce que sa caméra voit ;</li>
<li><b>lemme 5.3</b> : au bout d'une bande maximale, la vue est bloquée par un coin rentrant $r$ (soit $v$ lui-même, soit un coin sur le segment $vg$) ;</li>
<li>ce coin $r$ est filmé par une autre caméra $g'$ ; on montre que $g'$ est forcément « dans le dos » de la première, dans le polygone $P_g$ ;</li>
<li>on <b>raccourcit</b> la bande de $g'$ en lui retirant ce que $g$ filme déjà : sa bande devient plus petite et l'angle passe sous 180° — <b>elle devient bonne</b> ;</li>
<li>on est revenu au cas 1.</li>
</ol>
<div class="figrow four">${t54.panels.map((p, i) => `<figure>${p}<figcaption>${['① Les deux caméras sont mauvaises (angles de plus de 180°).', '② Lemme 5.3 : un coin rentrant $r$ bloque la vue de $g_1$.', '③ On raccourcit la bande de $g_2$ : elle devient bonne.', '④ On la remplace par une caméra candidate : sa bande commence dans $U_P$.'][i]}</figcaption></figure>`).join('')}</div>
${keep(['Théorème 5.4 : une solution optimale a une bande qui commence dans $U_P$ (environ $n^2$ points).',
    'Donc : lancer le glouton depuis chaque point de $U_P$ et garder le meilleur donne l’optimum $k$.',
    'Cas difficile (toutes mauvaises) : raccourcir la bande d’une caméra « dans le dos » la rend bonne.'])}

<h2>4.11 Calculer une bande visible vite : le lemme 6.2 <span class="ref">(déf. 6.1, lemmes 6.2, 6.5 — site : section 2.7, figure 8 — Jomaa)</span></h2>
${one('Pour savoir quelle bande une caméra $g$ voit autour d’un point $m$ du mur, il suffit de deux plus courts chemins et de deux rayons.')}
${pic('une ficelle tendue entre un bout du mur et la caméra s’enroule exactement autour du coin qui cache la vue. En prolongeant le dernier bout de la ficelle par un laser partant de la caméra, on tombe pile sur la limite de l’ombre.')}
<ol>
<li>Autour de $m$, on prend la plus longue suite de murs dont $g$ est devant (définition 6.1) ; on appelle $s$ et $t$ ses deux bouts.</li>
<li>On calcule les plus courts chemins de $s$ vers $g$ et de $t$ vers $g$ (rouge et bleu). Ils s'enroulent autour des coins qui cachent la vue.</li>
<li>On tire un rayon depuis $g$ le long du dernier segment de chaque chemin. Là où il touche le mur, on obtient $u$ et $v$.</li>
<li><b>Lemme 6.2</b> : la bande $[u,v]$ est exactement la bande maximale vue par $g$ qui contient $m$.</li>
</ol>
<div class="figrow"><figure>${l62}<figcaption>La caméra $g$, le point $m$, les deux plus courts chemins (rouge depuis $s$, bleu depuis $t$), les deux rayons, et la bande visible obtenue (verte), de $u$ à $v$.</figcaption></figure></div>
<div class="box obs"><b>Ce que nous avons trouvé.</b> Quand la bande fait plus d'un tour autour de $g$, un rayon peut toucher le mur <b>deux fois</b>. L'énoncé ne dit pas lequel prendre.
La preuve, elle, le dit : celui qui est <b>le plus proche de $m$</b>. Notre première version prenait le plus proche de $g$ et se trompait dans environ 19 % des cas aléatoires ;
nos tests l'ont détecté, et avec la bonne règle tout concorde. Le résultat de l'article reste vrai : c'est l'énoncé qui manque de précision.</div>
<p><b>Lemme 6.5</b> : avec deux structures de données connues — celle de Guibas et Hershberger pour les plus courts chemins, celle de Hershberger et Suri pour les rayons — chaque requête coûte
$O(\log n)$. Donc le lemme 6.2 se calcule en $O(\log n)$.</p>

<h2>4.12 Un pas du glouton en $O(\log^2 n)$, et l'algorithme complet <span class="ref">(lemme 6.8, théorème 7.1 — site : sections 2.8, 2.9, figures 9, 10 — Jomaa)</span></h2>
${one('Pour calculer $\\mathrm{next}(u)$, on prend la meilleure caméra parmi les candidates (bonnes) et la meilleure mauvaise caméra trouvée sur $\\ell_u$ ; chaque pas coûte $O(\\log^2 n)$.')}
<p>Calculer $\mathrm{next}(u)$ (lemme 6.8) se fait en deux parties :</p>
<ol>
<li><b>Les bonnes caméras.</b> D'après 4.7, la meilleure bonne caméra peut être prise parmi les candidates $G_P$. On les a précalculées et triées : une recherche dichotomique trouve la meilleure bande qui contient $u$.</li>
<li><b>Les mauvaises caméras.</b> On cherche, par dichotomie, le mur le plus lointain où une mauvaise caméra pourrait finir. Pour chaque mur testé : le plus court chemin depuis $u$ tourne-t-il à gauche ? On en déduit
la droite $\ell_u$, on la coupe avec le noyau, et on teste les deux extrémités (lemme 4.9) avec le lemme 6.2.</li>
</ol>
<div class="figrow"><figure>${ns.f}<figcaption>Galerie « deux mauvais gardiens » : la meilleure candidate (bleue, caméra $c$) va ${ns.good.toFixed(2).replace('.', ',')} arêtes après $u$ ; la mauvaise caméra $g^*$ trouvée sur $\ell_u$ (orange) va jusqu'à ${ns.best.toFixed(2).replace('.', ',')} arêtes : c'est elle qui donne $\mathrm{next}(u)$.</figcaption></figure></div>
<p><b>L'algorithme complet</b> (théorème 7.1) :</p>
<pre class="pseudo"><i>// entrée : un polygone simple P à n sommets</i>
<b>si</b> P est étoilé : <b>renvoyer</b> 1 caméra (dans le noyau)          <i>// O(n)</i>
construire les caméras candidates G_P et les départs U_P  <i>// O(n² log n)</i>
<b>pour chaque</b> départ u dans U_P :                            <i>// O(n²) départs</i>
    lancer le glouton depuis u :                          <i>// au plus k+1 pas</i>
        répéter u ← next(u) jusqu'à avoir fait le tour    <i>// O(log² n) par pas</i>
<b>renvoyer</b> la plus petite solution trouvée</pre>
<p style="text-align:center"><b>$O(n^2)$ départs $\times$ $O(k)$ pas $\times$ $O(\log^2 n)$ par pas $=$ $O(kn^2\log^2 n)$</b></p>
<p>Pour une galerie de $n=100$ coins avec $k=5$, voici l'ordre de grandeur du nombre d'opérations (échelle logarithmique) :</p>
${complexityBars()}
${keep(['Lemme 6.2 : bande visible = 2 plus courts chemins + 2 rayons ; notre remarque : prendre le point touché le plus proche de $m$.',
    '$\\mathrm{next}(u)$ = max(meilleure candidate bonne, meilleure mauvaise sur $\\ell_u$), en $O(\\log^2 n)$ (lemme 6.8).',
    'Total : $O(n^2)$ départs × $O(k)$ pas × $O(\\log^2 n)$ = $O(kn^2\\log^2 n)$ (théorème 7.1).'])}

<h2>4.13 Et après : l'algorithme optimal $\Theta(n\log n)$ <span class="ref">(site : section 2.10, figure 11 — Jomaa)</span></h2>
${one('Quelques mois plus tard, trois des mêmes auteurs, avec E. Rotenberg, ont trouvé un algorithme en $O(n\\log n)$ et prouvé qu’on ne peut pas faire mieux.')}
<ul>
<li><b>Moins de départs</b> : $O(n)$ au lieu de $O(n^2)$, grâce à la notion de caméras « dominantes » (qui font au moins aussi bien que les autres).</li>
<li><b>Tous les départs à la fois</b> : au lieu de relancer le glouton depuis chaque départ, une « fenêtre glissante » calcule $\mathrm{next}$ pour tous les départs ensemble.</li>
<li><b>$\mathrm{next}$ en morceaux</b> : la fonction $\mathrm{next}$ est faite de $O(n)$ morceaux simples (constants ou de la forme $x\mapsto\frac{A+Bx}{C+Dx}$), ce qui évite le facteur $k$.</li>
<li><b>Borne inférieure</b> : une réduction depuis un problème connu (« les deux ensembles sont-ils disjoints ? ») montre qu'aucun algorithme ne peut faire mieux que $\Omega(n\log n)$.</li>
</ul>
<p>Nous n'avons pas implémenté cet algorithme : la figure 11 du site montre seulement la fonction $\mathrm{next}$ (en escalier) sur laquelle il repose. À l'oral, une ou deux phrases suffisent.</p>

<h2>4.14 Tout l'algorithme sur une page</h2>
<table class="small"><thead><tr><th>Étape</th><th>Ce qu'elle établit</th><th>Article</th><th>Site</th><th>Qui</th></tr></thead><tbody>
<tr><td>Noyau</td><td>une caméra qui voit une bande est dans son noyau ; 1 caméra ⇔ étoilé</td><td>obs. 2.1, 2.2</td><td>2.1, fig. 2</td><td>Ilias</td></tr>
<tr><td>Glouton</td><td>au plus $k+1$ ; $k$ depuis un bon départ</td><td>th. 7.1 (preuve)</td><td>2.2, fig. 3</td><td>Ilias</td></tr>
<tr><td>Bon / mauvais</td><td>4 conditions ; chemin convexe pour les mauvais</td><td>déf. 4.1, obs. 4.8</td><td>2.3, fig. 4</td><td>Ilias</td></tr>
<tr><td>Remplacement</td><td>bonne → croisement ; mauvaise → sur $\ell_u$</td><td>prop. 4.3, lem. 4.2–4.6, cor. 4.7, lem. 4.9</td><td>2.4, fig. 5</td><td>Ilias</td></tr>
<tr><td>Candidats</td><td>$G_P$ et $U_P$, environ $n^2$</td><td>déf. 5.1, 5.2</td><td>2.5, fig. 6</td><td>Jomaa</td></tr>
<tr><td>Théorème central</td><td>une solution optimale commence dans $U_P$</td><td>lem. 5.3, th. 5.4</td><td>2.6, fig. 7</td><td>Jomaa</td></tr>
<tr><td>Bande visible</td><td>2 plus courts chemins + 2 rayons</td><td>lem. 6.2, 6.5</td><td>2.7, fig. 8</td><td>Jomaa</td></tr>
<tr><td>Pas glouton</td><td>$\mathrm{next}(u)$ en $O(\log^2 n)$</td><td>lem. 6.8</td><td>2.8, fig. 9</td><td>Jomaa</td></tr>
<tr><td>Algorithme</td><td>$O(kn^2\log^2 n)$</td><td>th. 7.1</td><td>2.9, fig. 10</td><td>Jomaa</td></tr>
<tr><td>Optimal</td><td>$\Theta(n\log n)$</td><td>article [6]</td><td>2.10, fig. 11</td><td>Jomaa</td></tr>
</tbody></table>

${part('5', 'Notre code', 'Comment nous avons programmé l’algorithme, comment nous l’avons vérifié, et ce que nous y avons trouvé.')}

<h2>5.1 Les choix</h2>
<ul>
<li><b>JavaScript, dans le navigateur.</b> Tout le calcul se fait dans la page web : pas de serveur, le site peut être hébergé gratuitement sur GitHub Pages, et chaque figure recalcule en direct quand on bouge un point.</li>
<li><b>React</b> pour l'interface (les pages, les figures), <b>Vite</b> pour construire le site, <b>KaTeX</b> pour afficher les formules.</li>
<li><b>Plus simple que l'article.</b> Comme annoncé dans notre proposition, nous n'avons pas programmé les structures de données rapides (Guibas–Hershberger, Hershberger–Suri) : nous utilisons
des versions plus simples, polynomiales, qui suffisent pour des galeries de quelques dizaines de sommets. L'algorithme est le même ; seule la vitesse des « briques » change.</li>
</ul>

<h2>5.2 Les fichiers</h2>
<div class="tree">contiguous-art-gallery/
├── src/geometry/        <i>le cœur : toute la géométrie et l'algorithme</i>
│   ├── vec.js           vecteurs, test « à gauche / à droite »           (Ilias)
│   ├── polygon.js       polygone, paramètre t, test de visibilité          (Ilias)
│   ├── visibility.js    ce qu'un point voit du bord                        (Ilias)
│   ├── core.js          noyaux (intersection de demi-plans)                (Ilias)
│   ├── shortestPath.js  plus courts chemins dans le polygone               (Jomaa)
│   ├── arrangement.js   croisements des droites-murs                       (Jomaa)
│   ├── solver.js        G_P, U_P, next, glouton, solve                     (les deux)
│   ├── proofs.js        les constructions des preuves (pour les figures)   (les deux)
│   ├── generate.js      polygones simples aléatoires (pour le jeu)         (Ilias)
│   └── presets.js       les galeries d'exemple (salle en U, peigne…)
├── src/widgets/         les 11 figures interactives et le jeu
├── src/pages/           les pages du site (accueil, preuve, jeu, rapport)
├── src/anim/            les animations de l'accueil
├── tests/               les tests automatiques                             (Jomaa)
├── scripts/             fabrication des PDF, du zip, des captures d'écran
└── docs/                les PDF (dont celui-ci)</div>

<h2>5.3 Les briques de base <span class="ref">(Ilias)</span></h2>
<p><b>« À gauche de »</b> (<code>vec.js</code>). Presque tout repose sur un seul calcul : étant donnés trois points $a$, $b$, $c$, le point $c$ est-il à gauche, à droite ou sur la droite $a\to b$ ?
C'est le signe d'un petit déterminant. Par exemple, « être devant un mur » = « être à gauche de la droite du mur ».</p>
<p><b>Le test de visibilité</b> (<code>polygon.js</code>, fonction <code>segInside</code>). Pour savoir si $g$ voit $q$ : on coupe le segment $gq$ à tous les endroits où il touche le bord,
et on vérifie que le milieu de chaque morceau est dans la galerie. Ça gère proprement le cas où le segment frôle un coin ou longe un mur. La fonction <code>isSimple</code> vérifie qu'aucune arête n'en croise une autre.</p>
<p><b>Ce que voit un point</b> (<code>visibility.js</code>). La visibilité le long du bord ne change qu'en des points précis : les sommets, et les endroits où un rayon partant de $g$ et passant par un sommet touche le bord.
Entre deux tels points, elle est constante : on teste un point par morceau, puis on recolle les morceaux visibles en bandes maximales.</p>
<p><b>Les noyaux</b> (<code>core.js</code>). On part d'un très grand carré et on le découpe par chaque demi-plan « devant le mur », l'un après l'autre.</p>

<h2>5.4 Les briques de la seconde moitié <span class="ref">(Jomaa)</span></h2>
<p><b>Plus courts chemins</b> (<code>shortestPath.js</code>). Un plus court chemin ne se plie qu'aux coins rentrants. On calcule quels sommets se voient (le « graphe de visibilité »), puis toutes les
plus courtes distances entre sommets (algorithme de Floyd–Warshall). Pour deux points quelconques, on les relie aux sommets qu'ils voient.</p>
<p><b>L'arrangement</b> (<code>arrangement.js</code>). On croise toutes les paires de droites-murs, on garde les croisements qui sont dans la galerie, et on fusionne ceux qui coïncident.</p>
<p><b>Les mauvaises caméras</b> (<code>solver.js</code>, fonction <code>nextBad</code>). Au lieu d'une dichotomie, on parcourt les murs après $u$ un par un. À chaque mur : on ajoute son demi-plan au noyau
(si le noyau devient vide, personne ne peut voir plus loin : on s'arrête), on teste si le plus court chemin tourne à gauche, on coupe la droite $\ell_u$ avec le noyau et on teste ses deux extrémités.</p>

<h2>5.5 Le solveur</h2>
<p>Voici, simplifié, ce que fait la fonction <code>solve</code> de <code>solver.js</code> :</p>
<pre class="pseudo"><b>solve</b>(P):
  <b>si</b> P n'est pas simple : erreur                     <i>// l'hypothèse de tout l'article</i>
  <b>si</b> P est étoilé : <b>renvoyer</b> 1 caméra
  meilleur ← aucun
  <b>pour chaque</b> départ u de U_P (triés) :
      r ← <b>greedy</b>(u, limite = taille(meilleur) − 1)   <i>// on abandonne si ça ne peut pas battre le meilleur</i>
      <b>si</b> r est complet et plus petit : meilleur ← r
      <b>si</b> taille(meilleur) = (taille du 1er essai) − 1 : <b>arrêter</b>   <i>// on ne peut pas faire mieux</i>
  <b>renvoyer</b> meilleur

<b>greedy</b>(u0):
  t ← u0 ; caméras ← []
  <b>répéter</b> :
      (g, v) ← <b>next</b>(t)                     <i>// la bande la plus longue depuis t</i>
      ajouter (g, [t, v]) aux caméras
      <b>si</b> v ≥ u0 + n : <b>renvoyer</b> caméras   <i>// tour complet</i>
      t ← v

<b>next</b>(u):
  bonne    ← meilleure candidate de G_P dont la bande contient u
  mauvaise ← <b>nextBad</b>(u)                 <i>// recherche sur la droite ℓ_u, lemme 4.9</i>
  <b>renvoyer</b> la plus longue des deux</pre>
<p><b>L'arrêt anticipé</b> vient directement de la section 4.4 : si le premier glouton donne $m$ caméras, on sait que $k\ge m-1$. Dès qu'un départ donne $m-1$, c'est forcément l'optimum, on s'arrête.</p>
<p>Temps mesurés sur des galeries aléatoires : ${stats.perf}.</p>

<h2>5.6 Les tests : comment on sait que c'est juste <span class="ref">(Jomaa)</span></h2>
${one('Nous comparons chaque calcul à un calcul indépendant, plus lent mais évident, sur des milliers de galeries aléatoires.')}
<table><thead><tr><th>Ce qu'on teste</th><th>Contre quoi</th></tr></thead><tbody>
<tr><td>La visibilité</td><td>un test direct, segment par segment</td></tr>
<tr><td>$\mathrm{next}(u)$</td><td>une grille dense de positions de caméra : aucune ne doit aller plus loin</td></tr>
<tr><td>L'optimum $k$</td><td>le glouton lancé depuis 200 départs répartis sur le bord : aucun ne doit faire mieux</td></tr>
<tr><td>Chaque construction de la preuve</td><td>prop. 4.3, lemmes 4.2–4.6, 4.9, 6.2, théorème 5.4, vérifiés sur des milliers de caméras aléatoires</td></tr>
</tbody></table>
<p>Résultat de la dernière exécution : <b>${stats.checks}</b>. Sur les preuves : ${stats.lemmas}</p>
<p>C'est grâce à ces tests que nous avons trouvé l'imprécision du lemme 6.2 (section 4.11) : notre première version ne concordait pas avec le calcul direct dans environ 19 % des cas.</p>

<h2>5.7 Lancer le projet sur son ordinateur</h2>
<table><thead><tr><th>Commande</th><th>Ce qu'elle fait</th></tr></thead><tbody>
<tr><td><code>npm install</code></td><td>installe les dépendances (une seule fois)</td></tr>
<tr><td><code>npm run dev</code></td><td>lance le site en local, qui se met à jour à chaque modification</td></tr>
<tr><td><code>npm test</code></td><td>lance tous les tests</td></tr>
<tr><td><code>npm run docs</code></td><td>refabrique les PDF</td></tr>
<tr><td><code>npm run zip</code></td><td>refabrique le zip à rendre</td></tr>
<tr><td><code>git push</code></td><td>envoie sur GitHub ; le site public se met à jour tout seul en moins d'une minute</td></tr>
</tbody></table>
${keep(['Tout tourne dans le navigateur (JavaScript, React) ; le site est sur GitHub Pages.',
    'Même algorithme que l’article, avec des briques plus simples (pas de Guibas–Hershberger) : suffisant pour quelques dizaines de sommets.',
    'Chaque calcul est vérifié contre un calcul direct, plus lent ; c’est ainsi qu’on a trouvé la remarque sur le lemme 6.2.'])}

${part('6', 'Notre site', 'Une page d’accueil courte qui sert de support à l’oral, et des pages de détail pour tout le reste.')}

<h2>6.1 Les pages</h2>
<table><thead><tr><th>Page</th><th>Adresse</th><th>Contenu</th></tr></thead><tbody>
<tr><td>Overview (accueil)</td><td><code>#/</code></td><td>Le support de l'oral : en-tête, 01 le problème, 02 pourquoi c'est surprenant, 03 l'algorithme en 3 idées, 04 le résultat, 05 construit et vérifié, 06 essayer</td></tr>
<tr><td>The proof</td><td><code>#/proof</code></td><td>Le sommaire des 5 chapitres de la preuve, avec qui explique quoi</td></tr>
<tr><td>Chapitres 1 à 5</td><td><code>#/proof/1</code> … <code>#/proof/5</code></td><td>La preuve en détail : énoncés, idées de preuve, une figure interactive par étape</td></tr>
<tr><td>Play</td><td><code>#/play</code></td><td>Le jeu et le bac à sable</td></tr>
<tr><td>Report</td><td><code>#/report</code></td><td>Le rapport : résumé, contexte, travaux liés, implémentation, qui a fait quoi, IA, références</td></tr>
</tbody></table>
<div class="shotrow two"><figure>${img('01_home_hero')}<figcaption>L'en-tête de l'accueil : trois caméras balaient leur bande (une solution optimale calculée en direct).</figcaption></figure>
<figure>${img('11_proof_index')}<figcaption>La page « The proof » : les 5 chapitres et qui les explique.</figcaption></figure></div>
<div class="shotrow two"><figure>${img('15_play')}<figcaption>Le jeu : une galerie aléatoire ; tu places des caméras et choisis leur bande ; le jeu vérifie et compare avec l'optimum.</figcaption></figure>
<figure>${img('16_report')}<figcaption>Le rapport, avec les liens vers la page publique et le dépôt.</figcaption></figure></div>

<h2>6.2 Les 11 figures interactives</h2>
<table class="small"><thead><tr><th>Figure</th><th>Où</th><th>Ce qu'on peut faire</th><th>Ce qu'elle montre</th><th>Qui</th></tr></thead><tbody>
<tr><td>1. Un gardien contigu</td><td>accueil 01</td><td>déplacer $g$, choisir un morceau</td><td>ce que voit un point ; un gardien n'en garde qu'un morceau ; la solution optimale</td><td>Ilias</td></tr>
<tr><td>2. Le noyau</td><td>2.1</td><td>déplacer $g$ et les bouts de la bande</td><td>droites-murs, noyau, parties non vues</td><td>Ilias</td></tr>
<tr><td>3. Le glouton</td><td>2.2</td><td>déplacer le départ $u$</td><td>les étapes du glouton, $k$ ou $k+1$</td><td>Ilias</td></tr>
<tr><td>4. Bon / mauvais</td><td>2.3</td><td>déplacer $g$</td><td>les 4 conditions, l'angle, le plus court chemin</td><td>Ilias</td></tr>
<tr><td>5. Remplacement</td><td>2.4</td><td>déplacer $g$</td><td>$P_g$, noyau, croisement trouvé ; lemme 4.9 pour les mauvais</td><td>Ilias</td></tr>
<tr><td>6. Arrangement</td><td>2.5</td><td>choisir un croisement</td><td>droites, croisements, $G_P$, $U_P$</td><td>Jomaa</td></tr>
<tr><td>7. Théorème 5.4</td><td>2.6</td><td>avancer pas à pas</td><td>la transformation d'une solution « toute mauvaise »</td><td>Jomaa</td></tr>
<tr><td>8. Lemme 6.2</td><td>2.7</td><td>déplacer $g$ et $m$</td><td>2 plus courts chemins, 2 rayons, la bande</td><td>Jomaa</td></tr>
<tr><td>9. Un pas glouton</td><td>2.8</td><td>déplacer $u$, cliquer un mur du tableau</td><td>bonne candidate, recherche des mauvaises</td><td>Jomaa</td></tr>
<tr><td>10. L'algorithme complet</td><td>2.9</td><td>lancer sur une galerie</td><td>le glouton depuis chaque départ de $U_P$</td><td>Jomaa</td></tr>
<tr><td>11. La fonction next</td><td>2.10</td><td>survoler</td><td>$\mathrm{next}$ en escalier (base de $\Theta(n\log n)$)</td><td>Jomaa</td></tr>
</tbody></table>

<h2>6.3 Les animations, et le retour d'un étudiant</h2>
<p>Un étudiant a trouvé sur le forum que l'accueil était difficile à suivre à cause des animations. Nous avons donc changé : tout le contenu s'affiche directement ; chaque animation se joue
<b>une seule fois</b> puis reste sur son image finale, avec un bouton <b>↻ Replay</b> ; un bouton <b>⏸</b> en haut coupe toutes les animations. C'est mentionné dans les remerciements du rapport.</p>

${part('7', 'L’oral', 'Le déroulé en 12 minutes, ce qu’il faut dire, et les questions probables. Chacun a aussi son guide détaillé.')}

<h2>7.1 Le déroulé</h2>
<p>L'oral suit la page d'accueil, de haut en bas. Les guides détaillés, avec le texte à dire, sont dans <code>docs/oral/Oral_Ilias_FR.pdf</code> et <code>docs/oral/Oral_Jomaa_FR.pdf</code>.</p>
<table><thead><tr><th>Temps</th><th>Qui</th><th>Section de l'accueil</th><th>Contenu</th><th>Ici</th></tr></thead><tbody>
<tr><td>0:00–0:30</td><td>Ilias</td><td>En-tête</td><td>Le sujet en une question</td><td>1.2</td></tr>
<tr><td>0:30–1:45</td><td>Ilias</td><td>01 Le problème</td><td>Définitions, polygone simple, démo de la figure 1</td><td>3.2, 3.5</td></tr>
<tr><td>1:45–2:30</td><td>Ilias</td><td>02 Pourquoi c'est surprenant</td><td>Les autres variantes sont dures ; la frise 2024 → 2026</td><td>3.1, 3.3</td></tr>
<tr><td>2:30–4:15</td><td>Ilias</td><td>03 Idée 1</td><td>Le glouton : au plus $k+1$, $k$ depuis le bon départ</td><td>4.2–4.5</td></tr>
<tr><td>4:15–5:15</td><td>Ilias</td><td>03 Idée 2 (début)</td><td>Bonnes et mauvaises caméras ; une bonne glisse vers un croisement</td><td>4.6–4.8</td></tr>
<tr><td>5:15–7:00</td><td>Jomaa</td><td>03 Idée 2 (fin)</td><td>Croisements, $G_P$, $U_P$, théorème 5.4</td><td>4.9, 4.10</td></tr>
<tr><td>7:00–8:45</td><td>Jomaa</td><td>03 Idée 3</td><td>Lemme 6.2, un pas glouton en $O(\log^2 n)$</td><td>4.11, 4.12</td></tr>
<tr><td>8:45–10:00</td><td>Jomaa</td><td>04 Le résultat</td><td>$O(kn^2\log^2 n)$, puis $\Theta(n\log n)$</td><td>4.12, 4.13</td></tr>
<tr><td>10:00–11:15</td><td>Jomaa</td><td>05 Construit et vérifié</td><td>Implémentation, tests, notre remarque sur le lemme 6.2</td><td>5</td></tr>
<tr><td>11:15–12:00</td><td>Ilias</td><td>06 et page Play</td><td>Démo du jeu, conclusion, remerciements</td><td>6</td></tr>
</tbody></table>

<h2>7.2 Le sujet en 30 secondes (à savoir par cœur, tous les deux)</h2>
<div class="script"><b class="t">Version 30 secondes</b>
<p>« On veut filmer tous les murs d'une galerie — un polygone simple, sans trou — avec le moins de caméras possible, mais chaque caméra ne filme qu'une bande continue de mur.
Presque tous les problèmes de galerie d'art sont très durs ; celui-ci, étonnamment, se résout vite. L'idée : le bord est une boucle, et un algorithme glouton qui va toujours le plus loin
possible se trompe d'au plus une caméra. Il suffit donc de le lancer depuis une liste d'environ $n^2$ points de départ bien choisis, et l'un d'eux donne l'optimum. »</p></div>

<h2>7.3 Les questions probables</h2>
${ask([
    ['Pourquoi le polygone doit-il être simple ?', 'Le bord doit être une seule boucle ; les preuves utilisent que toute courbe fermée dans la galerie n’entoure que la galerie ; et avec un trou, on peut voir les deux bouts d’un mur sans voir son milieu. Avec des trous, la question est ouverte.'],
    ['Pourquoi le glouton fait-il au plus une caméra de trop ?', 'Il « reste en avance » : sa $i$-ème bande finit au moins aussi loin que la $i$-ème bande optimale. Après $k$ bandes, il ne manque qu’un petit morceau, couvert par une caméra de plus.'],
    ['Quelle différence entre $G_P$ et $U_P$ ?', '$G_P$ : des caméras candidates (un croisement + une bande). $U_P$ : des points du bord, les débuts de ces bandes plus les coins ; ce sont les départs du glouton.'],
    ['Qu’est-ce qu’une mauvaise caméra ?', 'Une caméra qui voit sa bande sous plus de 180°, autour d’un obstacle, alors que les deux bouts ne se voient pas (les 4 conditions de la définition 4.1). On ne peut pas toujours la faire glisser vers un croisement.'],
    ['Comment le théorème 5.4 gère-t-il une solution sans bonne caméra ?', 'Le coin qui bloque la vue d’une mauvaise caméra est filmé par une autre caméra, forcément dans son dos ; on raccourcit la bande de celle-ci, et elle devient bonne.'],
    ['Qu’avez-vous trouvé sur le lemme 6.2 ?', 'Quand la bande fait plus d’un tour autour de $g$, un rayon touche le mur deux fois ; il faut prendre le point le plus proche de $m$. Notre première version se trompait dans 19 % des cas ; les tests l’ont montré.'],
    ['Pourquoi votre code est-il plus lent que l’article ?', 'Nous avons remplacé les structures de données en $O(\\log n)$ par des versions plus simples, comme annoncé dans la proposition. L’algorithme est le même.'],
    ['Comment savez-vous que votre code est juste ?', 'Chaque calcul est comparé à un calcul direct plus lent, sur des milliers de cas aléatoires : ' + stats.checks + '.'],
    ['Comment avez-vous utilisé l’IA ?', 'Nous avons utilisé un assistant IA (Claude) pour comprendre les articles, écrire et tester le code et rédiger les textes, dans des séances menées par Ilias. Nous avons vérifié les résultats face à l’article et par les tests. Le journal IA détaille tout.'],
    ['Qui a fait quoi ?', 'Comme le prof l’a demandé, nous avons travaillé tous les deux sur l’algorithme : Ilias la première moitié (noyaux, glouton, bonnes/mauvaises caméras), Jomaa la seconde (candidats, théorème 5.4, lemme 6.2, complexité) et les tests. Le détail est dans la section R.5 du rapport.'],
  ])}

<h2>7.4 Les pièges à éviter</h2>
<ul>
<li>Ne pas dire que le glouton est toujours optimal : il peut faire <b>une</b> caméra de trop.</li>
<li>Ne pas confondre $G_P$ (des caméras) et $U_P$ (des points de départ sur le bord).</li>
<li>Le noyau d'une bande n'est pas forcément dans la galerie : c'est une zone du plan entier.</li>
<li>Ne pas présenter la remarque sur le lemme 6.2 comme une erreur du théorème : le résultat reste vrai.</li>
<li>Toujours dire « polygone <b>simple</b> ».</li>
<li>Être honnête sur l'IA : le rapport et le journal disent ce qu'elle a fait ; ce qu'on dit à l'oral doit être pareil.</li>
</ul>

${part('8', 'Teste-toi', 'Quinze questions pour vérifier que tu as compris, avec les réponses, puis un petit dictionnaire.')}

<h2>8.1 Questions</h2>
${ask([
    ['1. Que veut dire « $g$ voit $q$ » ?', 'Le segment $gq$ reste dans la galerie (il peut frôler le bord).'],
    ['2. Qu’est-ce qu’un gardien contigu ?', 'Un point $g$ avec une bande continue $[u,v]$ du bord qu’il voit en entier.'],
    ['3. Quand une seule caméra suffit-elle ?', 'Quand la galerie est étoilée (il existe un point qui voit tout) ; on le teste en $O(n)$.'],
    ['4. Pourquoi le problème contigu est-il « facile » ?', 'Le bord est une boucle et chaque caméra en couvre un arc : c’est un problème de couverture d’un cercle, en une dimension.'],
    ['5. Qu’est-ce que $\\mathrm{next}(u)$ ?', 'Le point le plus loin $v$ tel qu’une caméra voie toute la bande $[u,v]$.'],
    ['6. Combien de caméras le glouton utilise-t-il ?', 'Au plus $k+1$ depuis n’importe quel départ, exactement $k$ depuis le début d’une bande optimale.'],
    ['7. Qu’est-ce que le noyau d’une bande ?', 'La zone du plan devant tous les murs de la bande ; une caméra qui voit la bande est dedans.'],
    ['8. Quelles sont les 4 conditions d’une mauvaise caméra ?', '(I) la bande contient un coin ; (II) la caméra n’est pas à un bout ; (III) angle de plus de 180° ; (IV) $u$ ne voit pas $v$.'],
    ['9. Que dit le corollaire 4.7 ?', 'Une bonne caméra peut être remplacée par une caméra sur un croisement de droites-murs qui voit la même bande.'],
    ['10. Combien y a-t-il de croisements ?', 'Au plus $n(n-1)/2$, donc $O(n^2)$.'],
    ['11. Que contient $U_P$ ?', 'Tous les coins de la galerie et les débuts des bandes des caméras candidates $G_P$.'],
    ['12. Que dit le théorème 5.4 ?', 'Il existe une solution optimale dont une bande commence dans $U_P$.'],
    ['13. Comment calcule-t-on la bande visible autour de $m$ ?', 'Deux plus courts chemins (depuis les bouts $s$ et $t$ vers $g$) et deux rayons le long de leur dernier segment (lemme 6.2).'],
    ['14. D’où vient $O(kn^2\\log^2 n)$ ?', '$O(n^2)$ départs, $O(k)$ pas de glouton par départ, $O(\\log^2 n)$ par pas.'],
    ['15. Qu’apporte l’article $\\Theta(n\\log n)$ ?', '$O(n)$ départs, $\\mathrm{next}$ calculé pour tous les départs à la fois, et une preuve qu’on ne peut pas faire mieux.'],
  ])}

<h2>8.2 Petit dictionnaire français – anglais</h2>
<table class="small"><thead><tr><th>Français</th><th>Anglais (site et oral)</th><th>Sens</th></tr></thead><tbody>
<tr><td>polygone simple</td><td>simple polygon</td><td>un contour, sans croisement, sans trou</td></tr>
<tr><td>sommet / sommet réflexe</td><td>vertex / reflex vertex</td><td>coin / coin rentrant (angle intérieur &gt; 180°)</td></tr>
<tr><td>arête, bord</td><td>edge, boundary $\partial P$</td><td>un mur ; tous les murs</td></tr>
<tr><td>chaîne, bande</td><td>chain $[u,v]$</td><td>morceau continu du bord</td></tr>
<tr><td>gardien contigu</td><td>contiguous guard</td><td>caméra + une bande qu'elle voit en entier</td></tr>
<tr><td>noyau de visibilité</td><td>visibility core $P_E$</td><td>zone devant tous les murs d'une bande</td></tr>
<tr><td>noyau (du polygone)</td><td>kernel</td><td>points qui voient toute la galerie</td></tr>
<tr><td>étoilé</td><td>star-shaped</td><td>qui a un noyau non vide</td></tr>
<tr><td>glouton</td><td>greedy</td><td>qui prend toujours le meilleur choix immédiat</td></tr>
<tr><td>bon / mauvais gardien</td><td>good / bad guard</td><td>angle ≤ 180° / &gt; 180° autour d'un obstacle</td></tr>
<tr><td>arrangement</td><td>arrangement</td><td>les droites-murs et leurs croisements</td></tr>
<tr><td>gardiens candidats, départs</td><td>candidate guards $G_P$, start points $U_P$</td><td>la liste finie de caméras et de départs</td></tr>
<tr><td>plus court chemin</td><td>shortest path</td><td>la ficelle tendue dans la galerie</td></tr>
<tr><td>lancer de rayon</td><td>ray shooting</td><td>où un rayon touche le bord</td></tr>
<tr><td>borne inférieure</td><td>lower bound</td><td>on ne peut pas faire plus vite</td></tr>
<tr><td>NP-difficile</td><td>NP-hard</td><td>pas d'algorithme rapide connu</td></tr>
<tr><td>sensible à la sortie</td><td>output-sensitive</td><td>temps qui dépend de la taille de la réponse ($k$)</td></tr>
</tbody></table>

<h2>Références principales</h2>
<ol class="refs">
<li>S. de Berg, J. Conradi, I. van der Hoog, F. Staals. <em>Simpler and faster contiguous art gallery.</em> arXiv:2508.09734, 2025. <b>(notre article)</b></li>
<li>S. de Berg, J. Conradi, I. van der Hoog, E. Rotenberg. <em>The contiguous art gallery problem is in Θ(n log n).</em> arXiv:2511.02960, 2025–2026.</li>
<li>A. Biniaz et al. <em>Polynomial-time algorithms for contiguous art gallery and related problems.</em> SoCG 2025, LIPIcs 332, 20:1–20:21.</li>
<li>M. C. R. Merrild, C. M. Rysgaard, J. K. R. Schou, R. Svenning. <em>The contiguous art gallery problem is solvable in polynomial time.</em> arXiv:2412.13938, 2024.</li>
<li>V. Chvátal. <em>A combinatorial theorem in plane geometry.</em> J. Combin. Theory Ser. B 18(1):39–41, 1975.</li>
</ol>
<p>La liste complète est dans la section R.7 du rapport.</p>
`;
}
