// "Comprendre le sujet" (FR): a gentle explanation of the whole subject, from zero.
// Figures are computed with the same geometry code as the website.

import { polygonFromArray, mod } from '../../src/geometry/polygon.js';
import { Solver } from '../../src/geometry/solver.js';
import { PRESETS } from '../../src/geometry/presets.js';
import { chainPoints } from '../../src/geometry/visibility.js';
import { figure } from '../svgfig.mjs';
import * as F from '../figures.mjs';

const COLORS = ['#2563eb', '#16a34a', '#9333ea', '#d97706', '#0891b2', '#db2777'];
const poly = (id) => polygonFromArray(PRESETS[id].points);

// ---------------------------------------------------------------- small figures
function figBasics() {
  const P = poly('ushape');
  const mid = (a, b) => ({ x: (a.x + b.x) / 2, y: (a.y + b.y) / 2 });
  return figure(P, [
    { type: 'polygon', fill: '#eef2ff' },
    { type: 'chain', a: 0, b: 1, color: '#2563eb', width: 5 },
    { type: 'label', p: mid(P.v(0), P.v(1)), text: 'un mur = une arête', dx: -60, dy: 14, size: 13, color: '#1d4ed8' },
    { type: 'dot', p: P.v(2), r: 6, fill: '#16a34a' },
    { type: 'label', p: P.v(2), text: 'un coin = un sommet', dx: -142, dy: -22, size: 13, color: '#15803d' },
    { type: 'dot', p: P.v(4), r: 7, fill: '#dc2626' },
    { type: 'label', p: P.v(4), text: 'coin rentrant (réflexe)', dx: -150, dy: 18, size: 13, color: '#b91c1c' },
    { type: 'label', p: { x: 500, y: 190 }, text: 'l’intérieur de la galerie', dx: -70, dy: 0, size: 13, color: '#475569' },
  ], { width: 400 });
}

function figSee() {
  const P = poly('ushape');
  const g = { x: 250, y: 200 };
  const r = P.v(4); // the reflex corner
  const q1 = { x: 896, y: 200 };
  const q2 = { x: 896, y: 470 };
  const shadow = { x: 896, y: g.y + ((r.y - g.y) * (896 - g.x)) / (r.x - g.x) };
  return figure(P, [
    { type: 'polygon', fill: '#eef2ff' },
    { type: 'chain', a: 1 + (shadow.y - 104) / (600 - 104), b: 2, color: '#fca5a5', width: 7 },
    { type: 'seg', a: g, b: shadow, stroke: '#94a3b8', width: 1.2, dash: '3 4' },
    { type: 'seg', a: g, b: q1, stroke: '#16a34a', width: 2.6 },
    { type: 'seg', a: g, b: q2, stroke: '#dc2626', width: 2.6, dash: '6 4' },
    { type: 'dot', p: r, r: 9, fill: 'none', stroke: '#dc2626' },
    { type: 'dot', p: g, r: 6, fill: '#111827', label: 'g', dx: -16, dy: -16 },
    { type: 'dot', p: q1, r: 5, fill: '#16a34a', label: 'q (vu)', dx: -58, dy: 10 },
    { type: 'dot', p: q2, r: 5, fill: '#dc2626', label: 'q′ (caché)', dx: -82, dy: 10 },
  ], { width: 400, pad: 46 });
}

/** The boundary drawn as a loop, with the chains of a solution as coloured arcs. */
function figLoop(P, guards, size = 240) {
  const L = P.perimeterLength();
  const R = 80, c = 110;
  const arc = (a, b, color, w) => {
    const t0 = (P.arcLength(a) / L) * 2 * Math.PI - Math.PI / 2;
    const t1 = (P.arcLength(b) / L) * 2 * Math.PI - Math.PI / 2;
    const pts = [];
    for (let i = 0; i <= 80; i++) { const t = t0 + ((t1 - t0) * i) / 80; pts.push(`${(c + R * Math.cos(t)).toFixed(1)},${(c + R * Math.sin(t)).toFixed(1)}`); }
    return `<polyline points="${pts.join(' ')}" fill="none" stroke="${color}" stroke-width="${w}" stroke-linecap="round"/>`;
  };
  let s = `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 220 220" width="${size}" style="max-width:100%">`;
  s += `<circle cx="${c}" cy="${c}" r="${R}" fill="none" stroke="#cbd5e1" stroke-width="10"/>`;
  guards.forEach((G, i) => { s += arc(G.a, G.b, COLORS[i % COLORS.length], 10); });
  for (let i = 0; i < P.n; i++) {
    const t = (P.arcLength(i) / L) * 2 * Math.PI - Math.PI / 2;
    s += `<line x1="${c + (R - 9) * Math.cos(t)}" y1="${c + (R - 9) * Math.sin(t)}" x2="${c + (R + 9) * Math.cos(t)}" y2="${c + (R + 9) * Math.sin(t)}" stroke="#334155" stroke-width="1.4"/>`;
  }
  s += `<text x="${c}" y="${c - 4}" text-anchor="middle" font-family="Helvetica" font-size="12" fill="#334155">le bord</text>`;
  s += `<text x="${c}" y="${c + 12}" text-anchor="middle" font-family="Helvetica" font-size="12" fill="#334155">= une boucle</text>`;
  return `${s}</svg>`;
}

/** Two rows of intervals on the boundary cut open at u: greedy vs optimal. */
function figStrip(P, u, greedy, opt) {
  const L = P.perimeterLength();
  const W = 520, x0 = 90, rowH = 30;
  const X = (t) => (mod(P.arcLength(t) - P.arcLength(u), L) / L) * W;
  const bars = (list, row, col) => list.map((G, i) => {
    const x1 = X(G.a);
    const len = ((P.arcLength(G.b) - P.arcLength(G.a)) / L) * W;
    const parts = x1 + len <= W + 0.5 ? [[x1, x1 + len]] : [[x1, W], [0, x1 + len - W]];
    return parts.map(([a, b]) => `<rect x="${x0 + a}" y="${row * rowH + 6}" width="${Math.max(1.5, b - a)}" height="${rowH - 12}" rx="3" fill="${col(i)}" stroke="#fff"/>`
      + (b - a > 18 ? `<text x="${x0 + (a + b) / 2}" y="${row * rowH + 20}" text-anchor="middle" font-family="Helvetica" font-size="11" font-weight="700" fill="#fff">${i + 1}</text>` : '')).join('');
  }).join('');
  let s = `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 ${W + x0 + 10} ${2 * rowH + 30}" width="${W + x0 + 10}" style="max-width:100%">`;
  s += `<text x="${x0 - 8}" y="21" text-anchor="end" font-family="Helvetica" font-size="12" font-weight="700">glouton</text>`;
  s += `<text x="${x0 - 8}" y="${rowH + 21}" text-anchor="end" font-family="Helvetica" font-size="12" font-weight="700">optimal</text>`;
  s += `<rect x="${x0}" y="6" width="${W}" height="${rowH - 12}" fill="#f1f5f9"/><rect x="${x0}" y="${rowH + 6}" width="${W}" height="${rowH - 12}" fill="#f1f5f9"/>`;
  s += bars(greedy, 0, (i) => COLORS[i % COLORS.length]);
  s += bars(opt, 1, () => '#94a3b8');
  s += `<line x1="${x0}" x2="${x0 + W}" y1="${2 * rowH + 6}" y2="${2 * rowH + 6}" stroke="#94a3b8"/>`;
  s += `<text x="${x0}" y="${2 * rowH + 22}" font-family="Helvetica" font-size="11" fill="#64748b">départ u</text>`;
  s += `<text x="${x0 + W}" y="${2 * rowH + 22}" text-anchor="end" font-family="Helvetica" font-size="11" fill="#64748b">retour à u (un tour complet)</text>`;
  return `${s}</svg>`;
}

function complexityBars() {
  const n = 100, k = 5, lg = Math.log2(n);
  const rows = [
    ['SoCG 2025 (3 équipes)', 'O(k n⁵ log n)', k * n ** 5 * lg, '#f43f5e'],
    ['de Berg et al. 2025 (notre article)', 'O(k n² log² n)', k * n * n * lg * lg, '#6366f1'],
    ['de Berg et al. 2026', 'Θ(n log n)', n * lg, '#10b981'],
  ];
  const max = Math.log10(rows[0][2]) + 0.5;
  const sci = (x) => { const e = Math.floor(Math.log10(x)); return `${(x / 10 ** e).toFixed(1)} × 10<sup>${e}</sup>`; };
  return `<div class="bars">${rows.map(([name, f, v, c]) => `<div class="bar-row"><div class="bar-name">${name}<br><span>${f}</span></div><div class="bar-track"><div style="width:${(Math.log10(v) / max) * 100}%;background:${c}"></div></div><div class="bar-val">${sci(v)}</div></div>`).join('')}</div>`;
}


/** Small SVG panels for "simple polygon" (math coords, y up). */
function panel(polys, extras = '', { w = 150, box = [0, 0, 400, 300], title = '', ok = true } = {}) {
  const [x0, y0, x1, y1] = box;
  const pad = 16;
  const D = (pts) => pts.map((p, i) => `${i ? 'L' : 'M'}${p[0]},${-p[1]}`).join(' ') + 'Z';
  let s = `<svg xmlns="http://www.w3.org/2000/svg" viewBox="${x0 - pad} ${-y1 - pad} ${x1 - x0 + 2 * pad} ${y1 - y0 + 2 * pad}" width="${w}" style="max-width:100%">`;
  for (const q of polys) s += `<path d="${D(q.pts)}${(q.holes || []).map((h) => ' ' + D(h)).join('')}" fill="${q.fill || '#eef2ff'}" stroke="${q.stroke || '#1f2937'}" stroke-width="5" stroke-linejoin="round" fill-rule="evenodd"/>`;
  s += extras + '</svg>';
  return `<figure class="mini">${s}<figcaption><b style="color:${ok ? '#059669' : '#dc2626'}">${ok ? '✓' : '✗'}</b> ${title}</figcaption></figure>`;
}

function figSimple() {
  const simple = panel([{ pts: [[0, 0], [400, 0], [400, 300], [250, 300], [250, 140], [150, 140], [150, 300], [0, 300]] }], '', { title: 'simple : un seul contour, pas de croisement, pas de trou' });
  const cross = panel([{ pts: [[0, 0], [400, 300], [400, 0], [0, 300]], fill: '#fee2e2' }], '', { title: 'pas simple : le contour se croise', ok: false });
  const hole = panel([{ pts: [[0, 0], [400, 0], [400, 300], [0, 300]], holes: [[[150, 100], [150, 200], [250, 200], [250, 100]]], fill: '#fee2e2' }], '', { title: 'pas simple : il y a un trou', ok: false });
  return `<div class="minirow">${simple}${cross}${hole}</div>`;
}

/** With a hole, a point can see both ends of a wall without seeing its middle. */
function figHoleShadow() {
  const g = [200, 250];
  const L = 146.4, R = 253.6; // shadow of the hole on the bottom wall
  const extras = `
    <line x1="0" y1="0" x2="${L}" y2="0" stroke="#16a34a" stroke-width="9"/>
    <line x1="${R}" y1="0" x2="400" y2="0" stroke="#16a34a" stroke-width="9"/>
    <line x1="${L}" y1="0" x2="${R}" y2="0" stroke="#dc2626" stroke-width="9"/>
    <line x1="${g[0]}" y1="${-g[1]}" x2="0" y2="0" stroke="#16a34a" stroke-width="3"/>
    <line x1="${g[0]}" y1="${-g[1]}" x2="400" y2="0" stroke="#16a34a" stroke-width="3"/>
    <line x1="${g[0]}" y1="${-g[1]}" x2="200" y2="0" stroke="#dc2626" stroke-width="3" stroke-dasharray="10 8"/>
    <circle cx="${g[0]}" cy="${-g[1]}" r="11" fill="#111827"/>
    <text x="${g[0] + 16}" y="${-g[1] + 6}" font-family="Georgia" font-style="italic" font-size="26">g</text>
    <text x="10" y="-14" font-family="Georgia" font-style="italic" font-size="26">a</text>
    <text x="372" y="-14" font-family="Georgia" font-style="italic" font-size="26">b</text>`;
  return panel([{ pts: [[0, 0], [400, 0], [400, 300], [0, 300]], holes: [[[170, 50], [170, 110], [230, 110], [230, 50]]] }], extras,
    { w: 260, title: 'avec un trou, $g$ voit les deux bouts $a$ et $b$ du mur du bas, mais pas son milieu (rouge)', ok: false });
}

// ---------------------------------------------------------------- document
export default function comprendre() {
  const pb = F.fig_problem();
  const gr = F.fig_greedy();
  const core = F.fig_core();
  const gb = F.fig_goodbad();
  const arr = F.fig_arrangement();
  const l62 = F.fig_lemma62();
  const t54 = F.fig_theorem54();

  const U = poly('ushape');
  const solU = new Solver(U).solve();
  const comb = poly('comb');
  const Sc = new Solver(comb);
  const optC = Sc.solve();
  let badU = null;
  for (let i = 0; i < 400 && badU === null; i++) { const u = (i * comb.n) / 400 + 0.003; if (Sc.greedy(u).guards.length === optC.k + 1) badU = u; }
  const runBad = Sc.greedy(badU);
  // optimal chains numbered from the one that contains u (as in the proof)
  const i0 = Math.max(0, optC.guards.findIndex((G) => mod(badU - G.a, comb.n) <= G.b - G.a + 1e-9));
  const optRot = optC.guards.map((_, i) => optC.guards[(i0 + i) % optC.guards.length]);

  return String.raw`
<style>
.key { border: 1px solid #c7d2fe; background: #eef2ff; border-radius: 3mm; padding: 3mm 4.5mm; margin: 3.5mm 0; break-inside: avoid; }
.key b.t { display: block; font: 700 9pt Helvetica, Arial, sans-serif; letter-spacing: .06em; text-transform: uppercase; color: #4338ca; margin-bottom: 1mm; }
.analogy { text-align: left; border-left: 3px solid #f59e0b; background: #fffbeb; padding: 2.5mm 4mm; margin: 3.5mm 0; border-radius: 0 2mm 2mm 0; break-inside: avoid; }
.analogy b.t { font: 700 9pt Helvetica, Arial, sans-serif; color: #b45309; text-transform: uppercase; letter-spacing: .06em; }
.script { border: 1px solid #a7f3d0; background: #ecfdf5; border-radius: 3mm; padding: 3mm 4.5mm; margin: 3.5mm 0; break-inside: avoid; }
.script b.t { font: 700 9pt Helvetica, Arial, sans-serif; color: #047857; text-transform: uppercase; letter-spacing: .06em; }
.warn { border-left: 3px solid #ef4444; background: #fef2f2; padding: 2.5mm 4mm; margin: 3.5mm 0; border-radius: 0 2mm 2mm 0; break-inside: avoid; }
.big { font-size: 13pt; line-height: 1.45; }
.ideas li { margin: 2mm 0; }
.bars { margin: 3mm 0; break-inside: avoid; }
.bar-row { display: grid; grid-template-columns: 52mm 1fr 26mm; gap: 3mm; align-items: center; margin: 2mm 0; font: 9pt Helvetica, Arial, sans-serif; }
.bar-name span { color: #64748b; }
.bar-track { height: 4mm; background: #f1f5f9; border-radius: 2mm; overflow: hidden; }
.bar-track div { height: 100%; border-radius: 2mm; }
.bar-val { text-align: right; }
.qa .q { font-weight: 700; margin: 3mm 0 0.5mm; break-after: avoid; }
.qa .a { margin: 0 0 0 4mm; color: #334155; }
.step-num { display: inline-block; width: 6mm; height: 6mm; border-radius: 50%; background: #4f46e5; color: #fff; font: 700 9pt Helvetica; text-align: center; line-height: 6mm; margin-right: 2mm; }
h2 { break-before: auto; }
.newpage { break-before: page; }
.minirow { display: flex; gap: 4mm; justify-content: center; margin: 3mm 0; break-inside: avoid; }
figure.mini { flex: 1; text-align: center; margin: 0; }
figure.mini figcaption { font-size: 8.8pt; text-align: center; }
td.ok { color: #047857; font-weight: 700; }
td.todo { color: #b45309; font-weight: 700; }
</style>

<div class="cover">
  <div class="kicker">INFO-F420 Computational Geometry · ULB · 2026–2027</div>
  <h1>Tout le sujet, expliqué simplement</h1>
  <p class="subtitle">Le problème de la galerie d'art « contigu » et l'article de de Berg, Conradi, van der Hoog et Staals, expliqués depuis zéro — pour pouvoir les expliquer à son tour</p>
  <p class="authors">Projet d'Ilias Akajou et Jomaa Abdulrahman</p>
  <div class="toc-box"><strong>Ce que tu vas trouver</strong><ol>
    <li>Le sujet en une minute</li>
    <li>Le vocabulaire, avec des dessins</li>
    <li>La condition indispensable : un polygone simple</li>
    <li>Le problème classique (très court)</li>
    <li>Notre problème : les caméras qui filment un seul morceau de mur</li>
    <li>Pourquoi c'est surprenant</li>
    <li>Idée n° 1 : l'algorithme glouton</li>
    <li>Idée n° 2 : trouver un bon point de départ</li>
    <li>Idée n° 3 : aller vite</li>
    <li>Le bilan, et ce que veut dire $O(\dots)$</li>
    <li>Comment l'article est construit</li>
    <li>Comment l'expliquer à l'oral</li>
    <li>Notre site, et ce que le cours demande</li>
    <li>Teste-toi (11 questions et leurs réponses)</li>
    <li>Petit dictionnaire</li>
  </ol></div>
  <p class="note-cover">Conseil : lis d'abord les parties 1 à 6 (le sujet lui-même). Les parties 7 à 11 expliquent les idées de l'article, sans formules compliquées.
  La partie 12 te donne des phrases toutes prêtes pour l'oral, la partie 13 fait le point sur ce que le cours demande.</p>
</div>

<h2>1. Le sujet en une minute</h2>
<div class="key big">
<p>Imagine un musée vu du dessus : sa forme est un <b>polygone</b>. On veut filmer <b>tous les murs</b> avec des caméras.
Chaque caméra est posée quelque part dans le musée et <b>pivote pour filmer une seule bande continue de mur</b>, sans sauter de morceau.</p>
<p><b>Question : combien de caméras faut-il, au minimum ?</b></p>
<p>Ce problème s'appelle le <em>Contiguous Art Gallery Problem</em>. Il a été posé en 2024. La surprise : alors que presque tous les problèmes de ce genre sont
« impossibles à résoudre vite », celui-ci peut être résolu par un algorithme rapide. Notre projet explique l'algorithme de de Berg, Conradi, van der Hoog et Staals (2025),
qui tient en une phrase :</p>
<p style="text-align:center"><b>« On essaie un algorithme glouton depuis un nombre limité de points de départ bien choisis, et on garde la meilleure réponse. »</b></p>
</div>
<p>Tout le reste du document explique cette phrase : ce qu'est un algorithme glouton, pourquoi il marche presque, et comment on choisit les points de départ.</p>

<h2>2. Le vocabulaire, avec des dessins</h2>
<div class="figrow"><figure>${figBasics()}<figcaption><b>Le polygone.</b> La galerie vue du dessus. Les murs sont les <em>arêtes</em>, les coins sont les <em>sommets</em>. Un coin « rentrant » (angle intérieur de plus de 180°) s'appelle un <b>sommet réflexe</b> : c'est lui qui bloque la vue.</figcaption></figure>
<figure>${figSee()}<figcaption><b>« Voir ».</b> La caméra $g$ voit le point $q$ si le segment $gq$ reste dans la galerie (comme un laser qui ne traverse pas les murs). Ici $g$ voit $q$ (vert) mais pas $q'$ (rouge) : le coin rentrant entouré cache toute la partie rose du mur de droite. La limite de l'ombre est le prolongement de la ligne $g$–coin (pointillés gris).</figcaption></figure></div>
<ul>
<li><b>$n$</b> = le nombre de sommets (de coins) du polygone. C'est la « taille » du problème.</li>
<li><b>Le bord</b> (noté $\partial P$) = l'ensemble des murs. On le parcourt toujours dans le même sens (sens inverse des aiguilles d'une montre).</li>
<li><b>Une chaîne</b> $[u,v]$ = un morceau continu du bord, du point $u$ au point $v$. C'est « une bande de mur ».</li>
<li><b>Toucher les murs est autorisé</b> : un segment qui longe un mur ou qui frôle un coin compte comme « dans » la galerie.</li>
</ul>

<h2>3. La condition indispensable : un polygone simple</h2>
<p>Tous les articles sur ce problème supposent que la galerie est un <b>polygone simple</b> : <b>un seul contour fermé, qui ne se croise jamais, et sans trou</b>
(pas de pilier ou de bloc au milieu de la salle).</p>
${figSimple()}
<p>Ce n'est pas un détail technique : <b>sans cette condition, l'algorithme ne marche plus</b>. Il y a trois raisons.</p>
<ol>
<li><b>Les murs forment une seule boucle.</b> Toute l'idée du sujet (couvrir une boucle avec des arcs, l'algorithme glouton, la preuve « au plus une caméra de trop »)
repose sur le fait que le bord est <em>une</em> boucle. Avec des trous, il y aurait plusieurs boucles : le contour extérieur et le contour de chaque trou.</li>
<li><b>Pas de poche cachée.</b> Dans un polygone simple, toute courbe fermée dessinée dans la galerie n'entoure que des points de la galerie (on dit que $P$ est
<em>simplement connexe</em>). Toutes les preuves de l'article utilisent ça (« le petit polygone formé par la caméra et sa bande est dans la galerie »).
Et le plus court chemin (la « ficelle tendue ») entre deux points est unique ; avec un trou, on pourrait le contourner par la gauche ou par la droite.</li>
<li><b>Avec un trou, voir les deux bouts d'un mur ne suffit plus.</b> Dans un polygone simple, une caméra placée devant un mur et qui voit ses deux extrémités voit tout le mur.
Avec un trou, ce n'est plus vrai :</li>
</ol>
<div class="figrow"><figure>${figHoleShadow()}</figure></div>
<div class="key"><b class="t">Ce qu'en dit la littérature</b> Merrild, Rysgaard, Schou et Svenning écrivent que leur méthode <b>ne marche pas</b> pour les polygones avec trous, et que
savoir si ce cas se résout encore en temps polynomial est une <b>question ouverte</b> (leur tableau 1 indique « Open »). Sur notre site, les galeries du jeu sont toujours
simples, et le bac à sable refuse un polygone dont les arêtes se croisent.</div>

<h2>4. Le problème classique (très court)</h2>
<p>Le problème « historique » (Klee, 1973) : placer le moins possible de gardiens pour que <em>chaque point de la salle</em> soit vu. On sait depuis 1975 (Chvátal) que $\lfloor n/3\rfloor$
gardiens suffisent toujours, mais trouver le nombre <em>minimum</em> est <b>NP-difficile</b> : on ne connaît aucun algorithme rapide, et on pense qu'il n'en existe pas.
C'est même <b>$\exists\mathbb{R}$-complet</b> (encore plus dur : les meilleures positions peuvent demander des coordonnées « irrationnelles »). Même si on ne veut surveiller
<em>que les murs</em> avec des gardiens ordinaires, c'est encore $\exists\mathbb{R}$-difficile (2025).</p>
<div class="analogy"><b class="t">À retenir</b> — Presque toutes les variantes de la galerie d'art sont des problèmes durs. Le professeur nous a demandé de ne pas passer de temps là-dessus :
une ou deux phrases suffisent à l'oral.</div>

<h2>5. Notre problème : une caméra = un seul morceau de mur</h2>
<div class="analogy"><b class="t">Image</b> — Une caméra de surveillance posée dans la salle, qui tourne lentement et filme une bande de mur sans interruption. Elle ne peut pas filmer
« un bout de ce mur-ci, puis sauter et filmer un bout d'un autre mur plus loin ». Une bande, d'un seul tenant.</div>
<div class="box def"><b>Définition.</b> Un <b>gardien contigu</b> est un point $g$ de la galerie avec une chaîne $[u,v]$ (une bande de mur) dont $g$ voit <em>chaque point</em>.
On cherche le nombre minimum $k$ de gardiens contigus dont les bandes, mises bout à bout, couvrent <em>tout</em> le bord.</div>
<div class="figrow"><figure>${pb.a}<figcaption>Un point $g$ (rouge) voit la zone jaune. Sur le bord, il voit des morceaux séparés (bleus). Comme gardien contigu, il ne peut en <b>garder qu'un seul</b>.</figcaption></figure>
<figure>${pb.b}<figcaption>Une solution optimale pour la salle en U : $k=${pb.k}$ caméras. Chaque couleur est la bande filmée par une caméra ; ensemble, elles font tout le tour.</figcaption></figure></div>
<p><b>Pourquoi une seule caméra ne suffit pas ici ?</b> Pour voir d'un coup tous les murs, il faudrait se placer à un endroit d'où l'on voit toute la salle. Dans la salle en U,
un tel endroit n'existe pas : depuis le bras gauche on ne voit pas le fond du bras droit, et inversement. Une galerie où un tel endroit existe s'appelle <b>étoilée</b> :
c'est exactement le cas où $k = 1$.</p>
<div class="key"><b class="t">La différence avec le problème classique</b> On ne surveille que les murs (pas l'intérieur), et chaque caméra ne filme qu'<b>un seul morceau continu</b>.
On pourrait croire que cette contrainte en plus rend le problème plus dur. C'est l'inverse.</div>

<h2>6. Pourquoi c'est surprenant</h2>
<p>Ajouter une contrainte (« un seul morceau par caméra ») rend le problème <b>plus facile</b>. L'explication tient en une image : le bord de la galerie est une <b>boucle</b>.
Chaque caméra en couvre un <b>arc</b> (un intervalle). Notre problème devient donc : <em>couvrir un cercle avec le moins possible d'arcs</em>, en sachant quels arcs sont
autorisés (ceux qu'une caméra peut filmer d'un seul tenant).</p>
<div class="figrow"><figure style="flex:0 0 38%">${figLoop(U, solU.guards)}<figcaption>Le bord de la salle en U « déplié » en boucle : les deux arcs colorés sont les deux bandes de la solution optimale. Les petits traits marquent les coins.</figcaption></figure>
<figure><div class="analogy" style="margin-top:0"><b class="t">Analogie</b> — Une piste d'athlétisme circulaire qu'on veut éclairer entièrement avec des projecteurs. Chaque projecteur éclaire un arc de piste.
Combien de projecteurs au minimum ? Sur un cercle, une stratégie simple marche très bien : partir d'un point, prendre le projecteur qui éclaire le plus loin, repartir de
là où il s'arrête, et ainsi de suite. C'est l'<b>algorithme glouton</b>. La seule difficulté : <b>par où commencer</b>.</div></figure></div>
<table><thead><tr><th>Année</th><th>Qui</th><th>Résultat</th></tr></thead><tbody>
<tr><td>2024</td><td>T. Shermer</td><td>pose le problème (ouvert)</td></tr>
<tr><td>2025</td><td>trois équipes indépendantes (SoCG)</td><td>un algorithme polynomial, mais lent : $O(kn^5\log n)$</td></tr>
<tr><td><b>2025</b></td><td><b>de Berg, Conradi, van der Hoog, Staals</b></td><td><b>beaucoup plus simple et plus rapide : $O(kn^2\log^2 n)$ — notre article</b></td></tr>
<tr><td>2026</td><td>de Berg, Conradi, van der Hoog, Rotenberg</td><td>le meilleur possible : $\Theta(n\log n)$</td></tr>
</tbody></table>

<h2>7. Idée n° 1 : l'algorithme glouton</h2>
<p>On part d'un point $u$ du bord. On cherche la caméra qui filme la bande la plus longue <b>commençant en $u$</b>. Elle s'arrête en un point qu'on appelle
$\mathrm{next}(u)$ (« le suivant de $u$ »). On repart de $\mathrm{next}(u)$, on cherche à nouveau la meilleure caméra, et on continue jusqu'à avoir fait le tour complet.</p>
<div class="analogy"><b class="t">Analogie</b> — Une randonnée en plusieurs étapes, où chaque soir tu dois dormir dans un refuge. La stratégie gloutonne : chaque jour, marcher
jusqu'au refuge le plus lointain que tu peux atteindre. Ici, une « journée » = une caméra, et « aller le plus loin possible » = la bande la plus longue.</div>
<div class="figrow"><figure>${gr.f1}<figcaption>Glouton depuis un point $u$ quelconque : <b>${gr.n1} caméras</b>.</figcaption></figure><figure>${gr.f2}<figcaption>Glouton depuis le début d'une bande d'une solution optimale : <b>${gr.n2} caméras</b> (l'optimum, $k=${gr.k}$).</figcaption></figure></div>
<h3>Pourquoi le glouton est presque parfait</h3>
<p>Compare le glouton avec une solution optimale, bande par bande, en faisant le tour dans le même sens. Le glouton est toujours <b>en avance</b> (ou à égalité) :</p>
<ul>
<li>sa 1<sup>re</sup> bande va au moins aussi loin que la fin de la bande optimale qui contient le point de départ (car cette caméra optimale aurait pu servir) ;</li>
<li>ensuite, à chaque étape, il repart d'un point situé dans une bande optimale, et la caméra de cette bande lui permet d'aller au moins jusqu'à sa fin.</li>
</ul>
<div class="figrow"><figure>${figStrip(comb, badU, runBad.guards, optRot)}<figcaption>Le bord « coupé » au point de départ $u$ et mis à plat. Ligne du haut : les bandes du glouton (couleurs). Ligne du bas : une solution optimale.
Chaque bande gloutonne finit au moins aussi loin que la bande optimale précédente : le glouton ne perd jamais plus d'une caméra.</figcaption></figure></div>
<div class="key"><b class="t">Le résultat à retenir</b> Depuis <b>n'importe quel</b> point de départ, le glouton utilise <b>au plus $k+1$</b> caméras (une de trop au pire).
S'il part <b>du début d'une bande d'une solution optimale</b>, il en utilise exactement <b>$k$</b>. Tout le problème se résume donc à trouver un bon point de départ.</div>
<p>Le souci : il y a une <b>infinité</b> de points sur le bord, on ne peut pas tous les essayer. Les premières solutions (2025) essayaient beaucoup de départs ($O(kn^3)$ relances),
d'où leur lenteur. L'apport de notre article est de montrer qu'une <b>petite liste</b> de départs suffit.</p>

<h2>8. Idée n° 2 : trouver un bon point de départ</h2>
<p>Le but : construire une liste finie de points du bord, de taille environ $n^2$, dont <b>au moins un</b> est le début d'une bande d'une solution optimale. Ensuite, on lance le
glouton depuis chacun et on garde le meilleur. Pour fabriquer cette liste, l'article raisonne sur les <b>positions des caméras</b>.</p>

<h3>a) Où une caméra peut-elle se placer pour voir une bande ?</h3>
<p>Pour filmer une bande de mur, la caméra doit être <b>devant chaque mur de la bande</b> (du côté intérieur). Prolonge chaque mur de la bande par une droite :
la caméra doit être du bon côté de toutes ces droites. La zone obtenue (verte ci-dessous) s'appelle le <b>noyau de visibilité</b> de la bande.
C'est toujours une forme convexe (sans creux), dont les coins sont des <b>croisements de droites qui prolongent des murs</b>.</p>
<div class="figrow"><figure>${core.f1}<figcaption>Une bande (verte), les droites qui prolongent ses murs (pointillés) et son noyau (zone verte). La caméra dans le noyau voit toute la bande.</figcaption></figure><figure>${core.f2}<figcaption>Une caméra hors du noyau ne voit pas toute la bande (parties rouges).</figcaption></figure></div>

<h3>b) Les bonnes caméras peuvent glisser jusqu'à un croisement</h3>
<p>L'article distingue deux sortes de caméras :</p>
<ul>
<li><b>bonne caméra</b> : elle voit sa bande « de face », sous un angle d'au plus 180° ;</li>
<li><b>mauvaise caméra</b> : elle regarde « autour d'un coin », sous un angle de plus de 180°, et les deux extrémités de sa bande ne se voient pas entre elles.</li>
</ul>
<div class="figrow"><figure>${gb.f}<figcaption>Une <b>mauvaise</b> caméra : elle voit presque toute la salle autour de l'encoche (angle orange de ${Math.round((gb.cls.angle * 180) / Math.PI)}°).</figcaption></figure><figure>${gb.f2}<figcaption>Une <b>bonne</b> caméra : elle voit sa bande sous un angle de ${Math.round((gb.cls2.angle * 180) / Math.PI)}°.</figcaption></figure></div>
<p>Le premier grand résultat : <b>une bonne caméra peut toujours être déplacée sur un croisement de deux droites qui prolongent des murs, sans perdre aucun morceau de sa bande.</b>
Intuition : dans la zone où elle peut se placer (le noyau), on la pousse vers un coin de cette zone ; tant qu'elle reste dans la zone et du bon côté, elle voit toujours tout.
Les croisements de droites prolongeant les murs sont en nombre limité : au plus $n(n-1)/2$, donc de l'ordre de $n^2$.</p>
<div class="figrow"><figure>${arr.f}<figcaption>Toutes les droites qui prolongent les murs, leurs croisements dans la galerie (points noirs, ${arr.nArr} ici) et les <b>points de départ candidats</b> qu'on en déduit (points verts sur le bord, ${arr.nUP} ici).</figcaption></figure></div>
<p>Pour chaque croisement $c$, on regarde les bandes maximales que $c$ peut filmer ; leurs <b>débuts</b>, plus tous les coins de la galerie, forment la liste des départs candidats,
notée $U_P$. Elle contient de l'ordre de $n^2$ points.</p>

<h3>c) Et les mauvaises caméras ?</h3>
<p>Une mauvaise caméra ne peut pas toujours glisser vers un croisement (l'obstacle autour duquel elle regarde la gênerait). L'article montre (théorème 5.4) qu'on peut quand même
s'en sortir : si une solution optimale n'a <em>que</em> des mauvaises caméras, on peut la <b>modifier sans ajouter de caméra</b> pour qu'elle contienne une bonne caméra.
L'astuce : la vue d'une mauvaise caméra est bloquée par un coin rentrant $r$ ; la caméra qui filme $r$ est forcément « dans le dos » de la première ; on raccourcit sa bande
(on lui enlève ce que la première filme déjà) et elle devient une bonne caméra.</p>
<div class="figrow four">${t54.panels.map((p, i) => `<figure>${p}<figcaption>${['① Les deux caméras sont mauvaises.', '② Un coin rentrant $r$ bloque la vue de $g_1$.', '③ On raccourcit la bande de $g_2$ : elle devient bonne.', '④ On la remplace par une caméra sur un croisement : sa bande commence dans la liste.'][i]}</figcaption></figure>`).join('')}</div>
<div class="key"><b class="t">Le résultat central de l'article</b> Il existe toujours une solution optimale dont une bande commence en un point de la liste $U_P$
(environ $n^2$ points). Donc, en lançant le glouton depuis chacun de ces points, au moins un des essais trouve l'optimum.</div>

<h2>9. Idée n° 3 : aller vite</h2>
<p>Il reste à faire chaque étape du glouton rapidement : étant donné un point $u$, trouver $\mathrm{next}(u)$, la bande la plus longue qui commence en $u$. L'outil clé
(lemme 6.2) calcule la bande maximale qu'une caméra $g$ voit autour d'un point du mur, avec seulement <b>deux « ficelles tendues » et deux « lasers »</b> :</p>
<ul>
<li>la ficelle tendue (le <b>plus court chemin</b> dans la galerie) entre chaque bout de la zone de murs qui fait face à $g$ et la caméra : elle s'enroule autour des coins qui cachent la vue ;</li>
<li>on prolonge le dernier bout de chaque ficelle par un laser partant de la caméra : là où le laser touche le mur, la zone visible commence ou s'arrête.</li>
</ul>
<div class="figrow"><figure>${l62}<figcaption>La caméra $g$, les deux ficelles tendues (rouge depuis $s$, bleue depuis $t$), les deux lasers, et la bande visible obtenue (verte), de $u$ à $v$.</figcaption></figure></div>
<p>Grâce à des structures de données connues (qui répondent à « quel est le plus court chemin ? » ou « où touche ce laser ? » en temps $O(\log n)$), une étape
du glouton coûte $O(\log^2 n)$, même quand la meilleure caméra est une mauvaise caméra.</p>

<h2>10. Le bilan, et ce que veut dire $O(\dots)$</h2>
<div class="analogy"><b class="t">La notation $O$</b> — $O(n^2)$ veut dire : « quand la galerie a $n$ coins, le nombre d'opérations grandit au plus comme $n^2$ » (on ignore les constantes).
Si $n$ double, un algorithme en $O(n^2)$ fait environ 4 fois plus de travail ; en $O(n^5)$, 32 fois plus. $\log n$ grandit très lentement ($\log_2 1000 \approx 10$).</div>
<p>L'algorithme complet :</p>
<ol>
<li>si la galerie est étoilée, une caméra suffit (on le teste en temps linéaire) ;</li>
<li>sinon, construire la liste $U_P$ (environ $n^2$ départs) ;</li>
<li>lancer le glouton depuis chaque départ : environ $k$ étapes de $O(\log^2 n)$ chacune ;</li>
<li>garder la plus petite solution.</li>
</ol>
<p style="text-align:center" class="big">$O(n^2)$ départs $\times$ $O(k)$ étapes $\times$ $O(\log^2 n)$ par étape $=$ $\mathbf{O(k\,n^2\log^2 n)}$</p>
<p>Pour une galerie de $n=100$ coins et $k=5$ caméras, voici l'ordre de grandeur du nombre d'opérations (échelle logarithmique) :</p>
${complexityBars()}
<p><b>Et après ?</b> Quelques mois plus tard, les mêmes auteurs ont trouvé l'algorithme le plus rapide possible, en $\Theta(n\log n)$ : une liste de départs de taille $n$
seulement, et une façon astucieuse de calculer $\mathrm{next}$ pour tous les départs à la fois. Ils montrent aussi qu'on ne peut pas faire mieux. À l'oral, une phrase suffit.</p>

<h2>11. Comment l'article est construit</h2>
<p>L'article (arXiv:2508.09734, 11 pages) suit exactement les idées ci-dessus. Voici où trouver chaque morceau :</p>
<table><thead><tr><th>Section de l'article</th><th>Ce qu'elle fait</th><th>Ici</th><th>Sur le site</th></tr></thead><tbody>
<tr><td>2. Préliminaires</td><td>polygone simple, chaînes, noyau de visibilité ; une caméra suffit ssi la galerie est étoilée (obs. 2.1, 2.2)</td><td>§2, §3, §5</td><td>chapitre 1</td></tr>
<tr><td>3. Vue d'ensemble</td><td>le plan de la preuve en une page</td><td>§1</td><td>page « The proof »</td></tr>
<tr><td>4. Structurer les positions</td><td>bonnes et mauvaises caméras (déf. 4.1) ; une bonne caméra glisse vers un croisement (prop. 4.3, lemmes 4.2–4.6, cor. 4.7) ; cas des mauvaises (lemme 4.9)</td><td>§8 a–b</td><td>chapitre 2</td></tr>
<tr><td>5. Discrétisation</td><td>la liste des caméras candidates et des départs $U_P$ (déf. 5.1, 5.2) ; une solution optimale commence dans $U_P$ (lemme 5.3, théorème 5.4)</td><td>§8 c</td><td>chapitre 3</td></tr>
<tr><td>6. Structure de données</td><td>la bande visible maximale avec deux plus courts chemins et deux rayons (lemmes 6.2, 6.5) ; un pas glouton en $O(\log^2 n)$ (lemme 6.8)</td><td>§9</td><td>chapitre 4</td></tr>
<tr><td>7. L'algorithme</td><td>tout assembler : $O(k n^2 \log^2 n)$ ; preuve que le glouton utilise au plus $k+1$ caméras (théorème 7.1)</td><td>§7, §10</td><td>chapitres 1 et 4</td></tr>
</tbody></table>

<h2>12. Comment l'expliquer à l'oral</h2>
<div class="script"><b class="t">Version 30 secondes</b>
<p>« On veut filmer tous les murs d'une galerie — un polygone simple, sans trou — avec le moins de caméras possible, mais chaque caméra ne filme qu'une bande continue de mur. Presque tous les problèmes de
galerie d'art sont très durs ; celui-ci, étonnamment, se résout vite. L'idée : le bord est une boucle, et couvrir une boucle par des arcs se fait avec un algorithme glouton,
à condition de bien choisir le point de départ. L'article montre qu'il suffit d'essayer environ $n^2$ points de départ bien choisis. »</p></div>
<div class="script"><b class="t">Version 2 minutes (les étapes)</b>
<ol>
<li><b>Le problème.</b> Polygone simple (sans trou) = galerie ; caméra = point + une bande continue de mur qu'elle voit en entier ; on minimise le nombre de caméras. Insister : sans « simple », la méthode ne marche plus.</li>
<li><b>La surprise.</b> Les autres variantes sont NP-difficiles ; celle-ci est polynomiale, et même en $n\log n$.</li>
<li><b>Le glouton.</b> Depuis un point, prendre la caméra qui va le plus loin, recommencer. Il est toujours en avance sur l'optimum : au plus une caméra de trop, et parfait s'il part du bon endroit.</li>
<li><b>Les bons départs.</b> Une « bonne » caméra peut glisser jusqu'à un croisement de droites prolongeant les murs ; les « mauvaises » peuvent être transformées en bonnes. D'où une liste d'environ $n^2$ départs dont un est forcément bon.</li>
<li><b>La vitesse.</b> Chaque étape se calcule avec deux plus courts chemins et deux lasers : $O(\log^2 n)$. Total : $O(k\,n^2\log^2 n)$.</li>
</ol></div>
<div class="warn"><b>Erreurs à éviter.</b>
<ul>
<li>Ne pas dire que le glouton est toujours optimal : il peut utiliser une caméra de trop si le départ est mauvais.</li>
<li>« Mauvaise caméra » ne veut pas dire « inutile » : une solution optimale peut ne contenir que des mauvaises caméras.</li>
<li>La liste $U_P$ contient des <b>points de départ sur le bord</b>, pas des positions de caméras.</li>
<li>On ne surveille que les murs, pas l'intérieur de la salle.</li>
</ul></div>
<p><b>Où montrer chaque idée sur le site :</b> l'accueil suit exactement cet ordre (section 01 = le problème, 02 = la surprise, 03 = les trois idées, 04 = le bilan).
Pour une démonstration, la figure 1 (bouger une caméra) et le jeu (page <em>Play</em>) parlent d'eux-mêmes.</p>

<h2>13. Notre site, et ce que le cours demande</h2>
<p><b>Le site</b> a cinq pages : <em>Overview</em> (l'accueil, qui suit l'ordre de l'oral), <em>The proof</em> (la preuve en 5 chapitres avec 11 figures interactives),
<em>Play</em> (le jeu et le bac à sable), <em>Report</em> (le rapport : résumé, contexte, littérature, implémentation, équipe, sources et IA, bibliographie).</p>
<table><thead><tr><th>Ce que demande le cours</th><th>Où c'est dans le projet</th><th>État</th></tr></thead><tbody>
<tr><td>Lire et comprendre des articles récents de géométrie algorithmique</td><td>article principal [5], suite [6], travaux de 2024–2025 [1]–[4]</td><td class="ok">fait</td></tr>
<tr><td>Revue de la littérature : énoncés principaux des résultats liés</td><td>rapport, sections R.2 et R.3</td><td class="ok">fait</td></tr>
<tr><td>Quelque chose de créatif qui montre la compréhension</td><td>site didactique, animations, jeu</td><td class="ok">fait</td></tr>
<tr><td>De la programmation en JavaScript qui tourne dans la page</td><td>le solveur, les 11 figures et le jeu</td><td class="ok">fait</td></tr>
<tr><td>Un rapport avec une bibliographie en forme standard</td><td>page <em>Report</em>, section R.7</td><td class="ok">fait</td></tr>
<tr><td>Contributions individuelles clairement indiquées</td><td>« Explained by » sur chaque chapitre, rapport R.5</td><td class="todo">répartition du code à préciser (document « Work split »)</td></tr>
<tr><td>Reconnaître l'aide de l'IA dans le rapport, citer ses sources</td><td>rapport R.6</td><td class="ok">fait</td></tr>
<tr><td>Journal IA : outils, prompts, vérifications, décisions</td><td>docs/AI_journal_EN_draft.pdf, lié depuis le rapport</td><td class="todo">parties 4 et 5 à écrire nous-mêmes</td></tr>
<tr><td>Une courte présentation</td><td>l'accueil sert de support ; plan dans le dossier complet (partie C)</td><td class="todo">à répéter</td></tr>
<tr><td>Un lien public vers la page (ex. GitHub Pages)</td><td>workflow prêt dans le projet</td><td class="todo">à publier</td></tr>
<tr><td>Un zip (contenu de la page + tout le code + instructions) sur l'UV</td><td>Guarding-Walls-Contiguously.zip</td><td class="todo">prêt, à déposer</td></tr>
<tr><td>Participer à la discussion du forum</td><td>—</td><td class="todo">à faire</td></tr>
</tbody></table>
<div class="warn"><b>Dates.</b> 11 novembre 2026 : poster une <b>version préliminaire</b> sur le forum pour avoir l'avis des autres étudiants.
25 novembre 2026 : <b>rendu du projet</b>. Décembre 2026 : défense orale. Les délais sont stricts et chaque retard est pénalisé.</div>

<h2>14. Teste-toi</h2>
<p>Essaie de répondre de tête avant de lire la réponse.</p>
<div class="qa">
<p class="q">1. Qu'est-ce qu'un gardien contigu ?</p><p class="a">Une position $g$ dans la galerie et une bande continue de mur $[u,v]$ dont $g$ voit chaque point.</p>
<p class="q">2. Quand une seule caméra suffit-elle ?</p><p class="a">Quand la galerie est étoilée : il existe un point d'où l'on voit toute la salle (le « noyau » de la galerie n'est pas vide).</p>
<p class="q">3. Qu'est-ce qui cache la vue d'une caméra ?</p><p class="a">Les coins rentrants (sommets réflexes, angle intérieur de plus de 180°).</p>
<p class="q">4. Pourquoi ce problème est-il plus facile que le problème classique ?</p><p class="a">Parce que chaque caméra couvre un seul arc de la boucle formée par le bord : on se ramène à couvrir un cercle par des arcs, ce que le glouton fait bien.</p>
<p class="q">5. Que fait l'algorithme glouton ?</p><p class="a">Depuis un point $u$, il prend la caméra qui filme la plus longue bande commençant en $u$, repart de la fin de cette bande, et recommence jusqu'à faire le tour.</p>
<p class="q">6. Combien de caméras utilise le glouton ?</p><p class="a">Au plus $k+1$ depuis n'importe quel départ, et exactement $k$ s'il part du début d'une bande d'une solution optimale.</p>
<p class="q">7. Qu'est-ce qu'une mauvaise caméra ?</p><p class="a">Une caméra qui regarde « autour d'un coin » : elle voit sa bande sous un angle de plus de 180° et les deux bouts de la bande ne se voient pas.</p>
<p class="q">8. Pourquoi les croisements de droites prolongeant les murs ?</p><p class="a">Parce qu'une bonne caméra peut glisser jusqu'à l'un d'eux sans rien perdre : ce sont les coins de la zone où elle peut se placer. Il y en a au plus environ $n^2/2$.</p>
<p class="q">9. Que dit le théorème principal (5.4) ?</p><p class="a">Il existe toujours une solution optimale dont une bande commence dans la liste $U_P$ ; donc lancer le glouton depuis chaque point de $U_P$ trouve l'optimum.</p>
<p class="q">10. Pourquoi le polygone doit-il être simple ?</p><p class="a">Pour que le bord soit une seule boucle (couverture par des arcs, glouton), qu'il n'y ait pas de « poche » cachée (les preuves en ont besoin) et que voir les deux bouts d'un mur suffise à le voir en entier. Avec des trous, la méthode ne marche plus et la question est ouverte.</p>
<p class="q">11. Quelle est la complexité finale et d'où vient-elle ?</p><p class="a">$O(k\,n^2\log^2 n)$ : $n^2$ départs, $k$ étapes par glouton, $\log^2 n$ par étape. Le second article atteint $\Theta(n\log n)$, le mieux possible.</p>
</div>

<h2>15. Petit dictionnaire</h2>
<table><tbody>
<tr><td><b>Polygone simple</b></td><td>un seul contour fermé fait de segments qui ne se croisent pas, sans trou (la galerie vue du dessus) ; c'est l'hypothèse indispensable</td></tr>
<tr><td><b>Trou</b></td><td>un obstacle au milieu de la salle (pilier) ; interdit dans notre problème</td></tr>
<tr><td><b>Simplement connexe</b></td><td>sans trou : toute courbe fermée dans la galerie n'entoure que des points de la galerie</td></tr>
<tr><td><b>Sommet / arête</b></td><td>coin / mur</td></tr>
<tr><td><b>Sommet réflexe</b></td><td>coin rentrant, d'angle intérieur supérieur à 180° ; c'est lui qui cache la vue</td></tr>
<tr><td><b>Bord $\partial P$</b></td><td>l'ensemble des murs, parcouru comme une boucle</td></tr>
<tr><td><b>Chaîne $[u,v]$</b></td><td>bande continue de mur, de $u$ à $v$</td></tr>
<tr><td><b>Gardien contigu</b></td><td>une caméra (un point) et la bande qu'elle filme</td></tr>
<tr><td><b>$k$</b></td><td>le nombre minimum de caméras (la réponse au problème)</td></tr>
<tr><td><b>Étoilé</b></td><td>il existe un point qui voit toute la galerie ; alors $k=1$</td></tr>
<tr><td><b>Noyau (de visibilité)</b></td><td>la zone d'où l'on est devant tous les murs d'une bande (ou de toute la galerie)</td></tr>
<tr><td><b>Algorithme glouton</b></td><td>à chaque étape, faire le choix qui va le plus loin, sans revenir en arrière</td></tr>
<tr><td><b>$\mathrm{next}(u)$</b></td><td>le point le plus loin qu'une seule caméra peut atteindre en filmant depuis $u$</td></tr>
<tr><td><b>Arrangement</b></td><td>le dessin formé par toutes les droites qui prolongent les murs ; ses croisements sont les positions candidates</td></tr>
<tr><td><b>$U_P$</b></td><td>la liste des points de départ candidats (environ $n^2$)</td></tr>
<tr><td><b>Plus court chemin</b></td><td>la « ficelle tendue » entre deux points à l'intérieur de la galerie</td></tr>
<tr><td><b>NP-difficile</b></td><td>problème pour lequel on ne connaît pas d'algorithme rapide (et on pense qu'il n'en existe pas)</td></tr>
<tr><td><b>$O(\dots)$</b></td><td>ordre de grandeur du nombre d'opérations quand $n$ grandit</td></tr>
</tbody></table>
<p class="note-cover">Pour aller plus loin : le <em>Dossier complet</em> (partie D) contient toutes les preuves, et le site permet de manipuler chaque étape.</p>
`;
}
