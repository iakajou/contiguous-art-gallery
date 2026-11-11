// The complete French dossier: one PDF that explains everything.
import path from 'node:path';
import { pathToFileURL, fileURLToPath } from 'node:url';
import explication from './explication.mjs';
import technique from './technique.mjs';
import oral from './oral.mjs';

const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..', '..');
const shot = (name) => pathToFileURL(path.join(root, 'docs', 'screenshots', `${name}.jpg`)).href;
const img = (name, cls = '') => `<img class="shot ${cls}" src="${shot(name)}" alt="">`;
const stripCover = (html) => html.replace(/<div class="cover">[\s\S]*?<\/div>\s*<\/div>\s*\n/, '').replace(/<div class="cover">[\s\S]*?\n<\/div>\n/, '');

function part(letter, title, sub) {
  return `<div class="part"><div class="part-letter">${letter}</div><h1 class="part-title">${title}</h1><p class="part-sub">${sub}</p></div>`;
}

const FIGS = [
  ['fig01', 'Figure 1 — Un gardien contigu', 'Accueil, section 01', 'La région jaune est ce que voit le point $g$ ; les morceaux bleu clair sont les chaînes maximales qu\'il voit. Un gardien contigu n\'en garde qu\'une.', 'Déplacer $g$ ; cliquer sur un morceau bleu clair pour le choisir ; cocher « show an optimal solution » pour voir les $k$ gardiens optimaux.'],
  ['fig02', 'Figure 2 — Le noyau de visibilité', 'Chapitre 1, §2.1', 'Les droites support des arêtes de la chaîne $[u,v]$ et leur noyau $P_E$ (vert). Observation 2.1 : un gardien qui voit toute la chaîne est dans $P_E$.', 'Déplacer les poignées carrées $u$, $v$ et le point $g$ ; cocher « whole boundary » : le noyau de $P$ est vide ssi $k\\ge 2$.'],
  ['fig03', 'Figure 3 — L\'algorithme glouton', 'Chapitre 1, §2.2', 'Le glouton pas à pas, et la bande « déroulée » qui compare ses chaînes à celles d\'une solution optimale : il reste toujours en avance.', '« Step », « Run to the end », « Reset » ; déplacer $u$ ; « Start at an optimal chain » montre que $k$ gardiens suffisent depuis le bon départ.'],
  ['fig04', 'Figure 4 — Bons et mauvais gardiens', 'Chapitre 2, §2.3', 'Les quatre conditions de la définition 4.1 évaluées en direct, l\'angle balayé (orange) et le plus court chemin de $u$ à $v$ (violet).', 'Déplacer $g$, $u$, $v$ ; « Extend to the maximal chain ». Sur la salle à encoche, le gardien par défaut est mauvais (296°).'],
  ['fig05', 'Figure 5 — Remplacer un gardien', 'Chapitre 2, §2.4', 'Bon gardien : $P_g$ (gris), $P_E$ (vert) et le remplaçant $c$ (étoile), sommet de l\'arrangement. Mauvais gardien : la construction du lemme 4.9 ($P_v$, $P\'$, $\\ell_u$, $\\ell_v$, $g^*$).', 'Déplacer $g$ et $m$ ; choisir « Room with a notch » ou « Two bad guards » pour voir le cas mauvais.'],
  ['fig06', 'Figure 6 — Arrangement, $G_P$ et $U_P$', 'Chapitre 3, §2.5', 'Toutes les droites support, les sommets de l\'arrangement dans $P$ et les points de départ $U_P$ (marques vertes).', 'Cliquer sur un sommet $c$ : ses deux arêtes définissantes et ses chaînes candidates s\'affichent.'],
  ['fig07', 'Figure 7 — Théorème 5.4 pas à pas', 'Chapitre 3, §2.6', 'La preuve appliquée à une vraie solution optimale faite de deux mauvais gardiens : chaînes maximales, lemme 5.3, raccourcissement, remplacement par un candidat de $G_P$.', '« Next » / « Previous », ou cliquer une étape.'],
  ['fig08', 'Figure 8 — Lemme 6.2', 'Chapitre 4, §2.7', '$E_{g,m}$, les plus courts chemins $\\pi_s$ (rouge) et $\\pi_t$ (bleu), les deux rayons, et la chaîne maximale $[u,v]$ (vert), comparée à un calcul direct.', 'Déplacer $g$ et $m$ puis dérouler les 4 étapes ; le badge vert confirme l\'accord avec la visibilité calculée directement.'],
  ['fig09', 'Figure 9 — Un pas glouton : $\\mathrm{next}(u)$', 'Chapitre 4, §2.8', 'La partie « bons gardiens » (meilleur candidat de $G_P$, en bleu) et la recherche des mauvais gardiens arête par arête (table).', 'Déplacer $u$ ; cliquer une ligne du tableau pour voir le chemin, $\\ell_u$ et le noyau de cette arête.'],
  ['fig10', 'Figure 10 — L\'algorithme complet', 'Chapitre 4, §2.9', 'Chaque point de $U_P$ coloré par la taille du glouton qui en part (vert $=k$, orange $=k+1$) et la meilleure solution.', 'Cliquer une marque pour voir son glouton ; « Random polygon » et le curseur $n$ pour tester d\'autres galeries.'],
  ['fig11', 'Figure 11 — La fonction $\\mathrm{next}$', 'Chapitre 5, §2.10', 'Le graphe de $x\\mapsto \\mathrm{next}(x)$, ses paliers et ses parties courbes, et la bande des bons départs (vert) ; les marques de $U_P$ tombent dans le vert.', 'Cliquer dans le graphe pour choisir $x_0$ : sa révolution est dessinée en escalier et sur le polygone.'],
  ['fig12_game', 'Le jeu et le bac à sable', 'Page Play', 'Galerie aléatoire : placer des caméras, choisir leurs murs, vérifier ; le jeu compare avec l\'optimum (confettis si c\'est optimal). Le bac à sable permet de dessiner ses polygones.', 'Cliquer dans la galerie pour une caméra, cliquer un mur pour sa portion, puis « Check ».'],
];

export default function dossier(stats) {
  const expl = stripCover(explication());
  const tech = stripCover(technique(stats));
  const qa = oral().split('<h2>3. Questions probables et réponses</h2>')[1]
    .replace('<h2>4. Pièges à éviter à l\'oral</h2>', '<h2>C.3 Pièges à éviter</h2>');

  return String.raw`
<div class="cover cover-img">
  ${img('01_home_hero', 'hero-shot')}
  <div class="kicker">INFO-F420 Computational Geometry · ULB · 2026–2027</div>
  <h1>Guarding Walls Contiguously</h1>
  <p class="subtitle">Dossier complet : le projet, le site, la présentation orale, la preuve en détail, l'implémentation, et comment continuer le travail</p>
  <p class="authors">Ilias Akajou (520466) · Jomaa Abdulrahman (583629)</p>
  <div class="toc-box"><strong>Sommaire</strong><ol type="A">
    <li>Le projet en un coup d'œil</li>
    <li>Visite du site</li>
    <li>La présentation orale (et les questions probables)</li>
    <li>La preuve en détail</li>
    <li>Les figures interactives, une par une</li>
    <li>L'implémentation et sa validation</li>
    <li>Continuer le projet</li>
  </ol></div>
</div>

${part('A', 'Le projet en un coup d\'œil', 'Ce qui a été fait, et comment les remarques du professeur sont prises en compte.')}
<h2>A.1 Le sujet</h2>
<p>Le <em>Contiguous Art Gallery Problem</em> : dans une galerie (un polygone simple $P$ à $n$ sommets), chaque caméra filme <strong>une seule portion continue de mur</strong>.
Combien faut-il de caméras, au minimum, pour filmer tous les murs ? Contrairement à presque toutes les variantes de la galerie d'art (NP-difficiles ou $\exists\mathbb{R}$-complètes),
ce problème se résout en temps polynomial. Notre projet explique l'algorithme de de Berg, Conradi, van der Hoog et Staals [5] en $O(kn^2\log^2 n)$, et résume l'algorithme optimal
en $\Theta(n\log n)$ des mêmes auteurs [6].</p>
<p class="remark"><b>Hypothèse essentielle : $P$ est un polygone simple</b> (un seul contour qui ne se croise pas, sans trou). Le bord est alors une seule boucle, les plus courts chemins sont uniques et toute courbe fermée dans $P$ n'entoure que des points de $P$ : toutes les preuves en dépendent. Avec des trous, la méthode de Merrild et al. échoue et la complexité du problème est ouverte. Le site le dit sur l'accueil, au chapitre 1 et dans le rapport ; le solveur refuse un polygone non simple.</p>
<h2>A.2 Les demandes du professeur et ce que nous avons fait</h2>
<table><thead><tr><th>Remarque</th><th>Ce qui est fait</th></tr></thead><tbody>
<tr><td>Ne pas passer trop de temps sur le problème classique de la galerie d'art</td><td>L'accueil ne garde que la définition (section 01) et pourquoi c'est surprenant (section 02). Aucune ré-explication du théorème de Chvátal (une phrase dans le rapport).</td></tr>
<tr><td>Travailler tous les deux sur la partie 2 et se répartir les explications</td><td>La preuve est découpée en 5 chapitres ; chaque chapitre et chaque section affichent « Explained by … ». Répartition en A.4.</td></tr>
<tr><td>Des widgets web qui illustrent les étapes de la preuve</td><td>11 figures interactives (une par étape) dans les chapitres, plus 4 animations sur l'accueil et le jeu. Toutes calculées en direct par notre implémentation.</td></tr>
</tbody></table>
<h2>A.3 Ce qui est livré</h2>
<ul>
<li><strong>Le site</strong> (React, publiable sur GitHub Pages) : un accueil = le support de l'oral, la preuve en 5 chapitres, le jeu, le rapport.</li>
<li><strong>Le solveur</strong> : l'algorithme de [5] en JavaScript, utilisé par toutes les figures et par le jeu.</li>
<li><strong>Les tests</strong> : ${stats.checks} ; ${stats.lemmas}</li>
<li><strong>Ce dossier</strong>, plus deux brouillons à compléter : la répartition du travail et le journal IA (docs/).</li>
<li><strong>L'archive</strong> à envoyer : sources, aperçu du site en un seul fichier HTML, documents.</li>
</ul>
<h2>A.4 Répartition des explications</h2>
<table><thead><tr><th>Partie</th><th>Contenu</th><th>Explique</th></tr></thead><tbody>
<tr><td>Accueil 01–02</td><td>Le problème, pourquoi c'est surprenant</td><td>Ilias</td></tr>
<tr><td>Chapitre 1</td><td>Noyaux de visibilité, glouton, borne $k+1$</td><td>Ilias</td></tr>
<tr><td>Chapitre 2</td><td>Bons/mauvais gardiens, lemmes de remplacement</td><td>Ilias</td></tr>
<tr><td>Chapitre 3</td><td>$G_P$, $U_P$, théorème 5.4</td><td>Jomaa</td></tr>
<tr><td>Chapitre 4</td><td>Lemme 6.2, lemme 6.8, algorithme complet</td><td>Jomaa</td></tr>
<tr><td>Chapitre 5</td><td>Algorithme optimal $\Theta(n\log n)$</td><td>Jomaa</td></tr>
<tr><td>Jeu, rapport</td><td>—</td><td>les deux</td></tr>
</tbody></table>
<p class="remark">Cette répartition est une proposition : elle se change dans <code>src/sections/blocks.jsx</code> (noms) et dans <code>src/pages/ChapterPage.jsx</code> / <code>src/sections/chapters.jsx</code> (attributs <code>author</code>).</p>

${part('B', 'Visite du site', 'Une page d\'accueil courte pour l\'oral, et des pages de détail pour tout le reste.')}
<h2>B.1 Plan du site</h2>
<table><thead><tr><th>Adresse</th><th>Page</th><th>Contenu</th></tr></thead><tbody>
<tr><td><code>#/</code></td><td>Overview</td><td>Le support de l'oral : 6 sections courtes, 1 figure interactive, 4 animations</td></tr>
<tr><td><code>#/proof</code></td><td>The proof</td><td>Carte de la preuve et accès aux 5 chapitres</td></tr>
<tr><td><code>#/proof/1</code> … <code>#/proof/5</code></td><td>Chapitres</td><td>Énoncés, preuves détaillées, figures interactives 2 à 11</td></tr>
<tr><td><code>#/play</code></td><td>Play</td><td>Le jeu et le bac à sable</td></tr>
<tr><td><code>#/report</code></td><td>Report</td><td>Résumé, contexte, implémentation, équipe, références</td></tr>
</tbody></table>
<p>Le routage utilise le fragment <code>#/…</code> : le site fonctionne tel quel sur GitHub Pages et même ouvert comme simple fichier. Un thème sombre est disponible (bouton ☾).</p>
<h2>B.2 L'accueil, section par section</h2>
<div class="shotrow"><figure>${img('01_home_hero')}<figcaption><b>En-tête.</b> Le titre, la question en une phrase, et une animation : trois caméras balaient chacune leur portion de mur. C'est une solution optimale calculée en direct par notre solveur sur le polygone « Atrium ».</figcaption></figure></div>
<div class="shotrow"><figure>${img('02_home_problem')}<figcaption><b>01 — Le problème.</b> La définition en deux phrases et la figure 1 : on déplace un point, on voit ce qu'il voit, on choisit une portion.</figcaption></figure></div>
<div class="shotrow"><figure>${img('03_home_surprise')}<figcaption><b>02 — Pourquoi c'est surprenant.</b> Trois cartes (galerie classique, murs seulement, murs contigus) et une frise animée 2024 → 2026 qui se dessine au défilement.</figcaption></figure></div>
<div class="shotrow"><figure>${img('05_home_idea1')}<figcaption><b>03 — L'algorithme en une phrase, idée 1.</b> Animation : le glouton depuis un point quelconque utilise 4 gardiens ($k+1$), puis depuis le début d'une chaîne optimale 3 gardiens ($k$).</figcaption></figure></div>
<div class="shotrow"><figure>${img('06_home_idea2')}<figcaption><b>Idée 2.</b> À gauche, un mauvais gardien : le faisceau balaie plus de 180° autour de l'encoche. À droite, les droites support apparaissent, puis les sommets de l'arrangement, puis les départs $U_P$ colorés (vert : départ optimal, orange : un gardien de trop).</figcaption></figure></div>
<div class="shotrow"><figure>${img('07_home_idea3')}<figcaption><b>Idée 3.</b> Le lemme 6.2 animé : arêtes vues de face, deux plus courts chemins, deux rayons, puis la chaîne visible maximale.</figcaption></figure></div>
<div class="shotrow"><figure>${img('08_home_result')}<figcaption><b>04 — Le résultat.</b> La formule $O(n^2)\times O(k)\times O(\log^2 n)$ et une « course » des complexités en échelle logarithmique (curseur $n$).</figcaption></figure></div>
<div class="shotrow two"><figure>${img('09_home_verified')}<figcaption><b>05 — Construit et vérifié.</b> Les chiffres de nos tests (compteurs animés).</figcaption></figure><figure>${img('10_home_try')}<figcaption><b>06 — À vous de jouer.</b> Lien vers le jeu, avec une animation.</figcaption></figure></div>
<h2>B.3 Les pages de détail</h2>
<div class="shotrow two"><figure>${img('11_proof_index')}<figcaption><b>The proof.</b> La carte de la preuve en 4 étapes et les 5 chapitres.</figcaption></figure><figure>${img('12_chapter2')}<figcaption><b>Un chapitre.</b> En-tête coloré, auteur, résultats couverts, sommaire latéral, puis énoncés, preuves et figures.</figcaption></figure></div>
<div class="shotrow two"><figure>${img('15_play')}<figcaption><b>Play.</b> Le jeu en trois étapes.</figcaption></figure><figure>${img('16_report')}<figcaption><b>Report.</b> Résumé, contexte, implémentation, équipe, références.</figcaption></figure></div>
<h2>B.4 Design et animations</h2>
<ul>
<li>Typographies : Inter (texte), Instrument Serif (mots en italique dégradé), JetBrains Mono (code). Thème clair et thème sombre.</li>
<li>Animations : apparition des sections au défilement, changement de page en fondu, caméras qui balaient les murs, frise et barres qui se dessinent, compteurs, étapes de preuve en fondu, confettis quand on trouve l'optimum au jeu.</li>
<li>Les animations ne tournent que quand elles sont visibles, et sont désactivées si l'ordinateur demande de « réduire les animations ».</li>
</ul>

${part('C', 'La présentation orale', 'L\'accueil du site est le support : on le déroule de haut en bas.')}
<h2>C.1 Déroulé (≈ 12–15 minutes)</h2>
<table><thead><tr><th>Section de l'accueil</th><th>Qui</th><th>Durée</th><th>Ce qu'on dit</th><th>Geste</th></tr></thead><tbody>
<tr><td>En-tête</td><td>Ilias</td><td>0:30</td><td>La question : combien de caméras, si chacune filme une portion continue de mur ?</td><td>Laisser tourner l'animation</td></tr>
<tr><td>01 Le problème</td><td>Ilias</td><td>1:30</td><td>Définition du gardien contigu ; un point voit plusieurs morceaux mais n'en garde qu'un.</td><td>Bouger $g$, cocher « optimal »</td></tr>
<tr><td>02 Pourquoi c'est surprenant</td><td>Ilias</td><td>1:30</td><td>Les autres variantes sont dures ; la contiguïté ramène à couvrir un cercle par des intervalles ; frise des résultats.</td><td>Faire défiler la frise</td></tr>
<tr><td>03 Idée 1</td><td>Ilias</td><td>2:00</td><td>Le glouton ; « il reste en avance » : au plus $k+1$, et $k$ depuis le bon départ.</td><td>Montrer 4 puis 3 gardiens</td></tr>
<tr><td>03 Idée 2</td><td>Jomaa</td><td>3:00</td><td>Bons/mauvais gardiens ; un bon gardien glisse vers un sommet de l'arrangement ; théorème 5.4 : un départ de $U_P$ est optimal.</td><td>Ouvrir le chapitre 3, figure 7, dérouler les 4 étapes</td></tr>
<tr><td>03 Idée 3</td><td>Jomaa</td><td>2:00</td><td>Lemme 6.2 : deux plus courts chemins et deux rayons ; un pas glouton en $O(\log^2 n)$.</td><td>Laisser tourner l'animation</td></tr>
<tr><td>04 Le résultat</td><td>Jomaa</td><td>1:30</td><td>$O(kn^2\log^2 n)$, puis $\Theta(n\log n)$ avec borne inférieure.</td><td>Bouger le curseur $n$</td></tr>
<tr><td>05–06</td><td>les deux</td><td>1:30</td><td>Notre implémentation, nos tests, la remarque sur le lemme 6.2 ; démo du jeu.</td><td>Page Play, niveau « Easy »</td></tr>
</tbody></table>
<h2>C.2 Questions probables et réponses</h2>
${qa}

${part('D', 'La preuve en détail', 'Toutes les étapes de l\'article [5], avec les preuves complètes et des figures calculées par notre code.')}
${expl}

${part('E', 'Les figures interactives', 'Où les trouver, ce qu\'elles montrent, comment s\'en servir.')}
${FIGS.map(([f, title, where, what, how]) => `<div class="figcard"><h3>${title} <span class="ref">${where}</span></h3>${img(f)}<p><b>Ce qu'elle montre.</b> ${what}</p><p><b>Comment s'en servir.</b> ${how}</p></div>`).join('\n')}

${part('F', 'L\'implémentation et sa validation', 'Comment le site et le solveur sont construits, testés et rendus robustes.')}
${tech}

${part('G', 'Continuer le projet', 'Pour reprendre le travail à partir de l\'archive.')}
<h2>G.1 Voir le site tout de suite</h2>
<p>Dans l'archive, ouvrir <code>VOIR_LE_SITE.html</code> (double-clic) : c'est tout le site dans un seul fichier, sans installation ni connexion.</p>
<h2>G.2 Travailler sur le code</h2>
<ol>
<li>Installer <a href="https://nodejs.org">Node.js</a> 18 ou plus récent.</li>
<li>Dans le dossier <code>projet/</code> : <code>npm install</code> (une seule fois), puis <code>npm run dev</code> et ouvrir l'adresse affichée (<code>http://localhost:5173</code>). Chaque modification de fichier se voit immédiatement.</li>
<li>Avant de partager : <code>npm test</code> (tous les tests doivent passer) et <code>npm run build</code>.</li>
</ol>
<table><thead><tr><th>Je veux…</th><th>Fichier</th></tr></thead><tbody>
<tr><td>changer le texte de l'accueil (l'oral)</td><td><code>src/pages/Home.jsx</code></td></tr>
<tr><td>changer le texte d'un chapitre</td><td><code>src/sections/chapters.jsx</code> ; titres et résumés : <code>src/pages/ChapterPage.jsx</code></td></tr>
<tr><td>changer le rapport</td><td><code>src/pages/Report.jsx</code></td></tr>
<tr><td>changer qui explique quoi</td><td><code>src/sections/blocks.jsx</code> et les attributs <code>author</code></td></tr>
<tr><td>changer une figure</td><td><code>src/widgets/…Widget.jsx</code></td></tr>
<tr><td>changer une animation</td><td><code>src/anim/scenes.jsx</code>, <code>src/anim/motion.jsx</code></td></tr>
<tr><td>changer les couleurs / le design</td><td><code>src/styles.css</code> (variables en haut du fichier)</td></tr>
<tr><td>ajouter un polygone d'exemple</td><td><code>src/geometry/presets.js</code></td></tr>
<tr><td>toucher à l'algorithme</td><td><code>src/geometry/solver.js</code> (puis <code>npm test</code>)</td></tr>
</tbody></table>
<h2>G.3 Publier sur GitHub Pages</h2>
<ol>
<li>Créer un dépôt GitHub et y pousser le contenu de <code>projet/</code> (branche <code>main</code>).</li>
<li>Dans <em>Settings → Pages</em>, choisir <em>Source : GitHub Actions</em>.</li>
<li>Le fichier <code>.github/workflows/deploy.yml</code> teste, construit et publie le site à chaque push ; l'adresse apparaît dans l'onglet <em>Actions</em>.</li>
</ol>
<h2>G.4 Régénérer les documents et l'archive</h2>
<ul>
<li><code>npm run docs</code> : régénère ce PDF et les brouillons (nécessite Google Chrome).</li>
<li>Captures d'écran : lancer <code>npm run dev</code>, puis <code>node scripts/screenshots.mjs http://localhost:5173</code> et <code>python3 scripts/trim-shots.py docs/screenshots</code> (Pillow).</li>
<li><code>npm run build:single</code> : l'aperçu en un seul fichier ; <code>npm run zip</code> : l'archive complète.</li>
</ul>
<h2>G.5 Ce qu'il reste à faire</h2>
<ul class="todo">
<li>Relire chaque chapitre face à l'article et reformuler avec nos mots ce que nous dirons à l'oral.</li>
<li>Valider (ou changer) la répartition des explications, et compléter le document « Work split » (docs/).</li>
<li>Compléter le journal IA (docs/) avec notre propre évaluation : il doit rester exact.</li>
<li>Publier le site sur GitHub Pages et mettre le lien dans le rapport.</li>
<li>Répéter l'oral avec le déroulé C.1 (chronométrer).</li>
</ul>
`;
}
