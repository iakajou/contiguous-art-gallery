// Document 2 (FR): guide technique de l'implémentation.
export default function technique(stats) {
  return String.raw`
<div class="cover">
  <div class="kicker">INFO-F420 Computational Geometry · ULB · 2026–2027</div>
  <h1>Guide technique</h1>
  <p class="subtitle">Comment le site et le solveur sont construits, comment ils ont été testés, et comment les modifier</p>
  <p class="authors">Ilias Akajou (520466) · Jomaa Abdulrahman (583629)</p>
  <div class="toc-box"><strong>Plan</strong><ol>
    <li>Lancer, tester, publier</li><li>Architecture du code</li><li>Conventions géométriques</li>
    <li>Les briques géométriques</li><li>Le solveur (algorithme de [5])</li><li>Les constructions des preuves</li>
    <li>Validation</li><li>Robustesse numérique : les pièges rencontrés</li><li>Les widgets</li><li>Modifier le projet</li></ol></div>
</div>

<h2>1. Lancer, tester, publier</h2>
<pre>cd contiguous-art-gallery
npm install          # une seule fois
npm run dev          # serveur local : http://localhost:5173
npm test             # tests (solveur contre force brute + lemmes)
npm run build        # site statique dans dist/
npm run build:single # le site en UN seul fichier HTML (dist-single/index.html, s'ouvre par double-clic)
npm run docs         # régénère les PDF de docs/ (nécessite Google Chrome)
npm run zip          # fabrique l'archive à envoyer (sources + aperçu + PDF)</pre>
<p><strong>GitHub Pages.</strong> Pousser le dossier sur un dépôt GitHub (branche <code>main</code>), puis dans <em>Settings → Pages</em> choisir
<em>Source : GitHub Actions</em>. Le fichier <code>.github/workflows/deploy.yml</code> installe, teste, construit et publie le site à chaque push.
Le site utilise des chemins relatifs (<code>base: './'</code> dans <code>vite.config.js</code>) et fonctionne donc aussi dans un sous-dossier.</p>
<p><strong>Technologies.</strong> React 18 pour l'interface, Vite 5 pour le build, KaTeX pour les formules, polices Inter / Instrument Serif /
JetBrains Mono embarquées (le site marche hors-ligne). Aucune bibliothèque d'animation : les animations sont écrites à la main (CSS + <code>requestAnimationFrame</code>)
et respectent le réglage « réduire les animations » du système. Toute la géométrie est en JavaScript pur
(dossier <code>src/geometry/</code>, sans dépendance), ce qui permet de l'exécuter aussi dans Node pour les tests.</p>

<h2>2. Architecture du code</h2>
<table><thead><tr><th>Fichier</th><th>Rôle</th></tr></thead><tbody>
<tr><td><code>geometry/vec.js</code></td><td>vecteurs, test d'orientation, intersection de droites</td></tr>
<tr><td><code>geometry/polygon.js</code></td><td>classe <code>Polygon</code> : paramétrisation du bord, appartenance (fermée), prédicat de visibilité <code>segInside</code>, lancer de rayon</td></tr>
<tr><td><code>geometry/visibility.js</code></td><td>chaînes maximales vues par un point, polygone de visibilité (dessin)</td></tr>
<tr><td><code>geometry/core.js</code></td><td>noyaux de visibilité (intersection de demi-plans), kernel</td></tr>
<tr><td><code>geometry/shortestPath.js</code></td><td>plus courts chemins dans $P$ (graphe de visibilité + Floyd–Warshall)</td></tr>
<tr><td><code>geometry/arrangement.js</code></td><td>sommets de l'arrangement des droites support à l'intérieur de $P$</td></tr>
<tr><td><code>geometry/solver.js</code></td><td>l'algorithme : $G_P$, $U_P$, $\mathrm{next}(u)$ (lemme 6.8), glouton, théorème 7.1 ; classification (déf. 4.1)</td></tr>
<tr><td><code>geometry/proofs.js</code></td><td>constructions des preuves : prop. 4.3, lemmes 4.2–4.6, 4.9, 6.2, théorème 5.4 (utilisées par les figures)</td></tr>
<tr><td><code>geometry/generate.js</code></td><td>polygones simples aléatoires (« 2-opt untangling ») pour le jeu</td></tr>
<tr><td><code>geometry/presets.js</code></td><td>polygones d'exemple (en position générale)</td></tr>
<tr><td><code>App.jsx</code>, <code>router.js</code></td><td>coque du site (barre de navigation, pied de page) et routage par <code>#/…</code> (fonctionne sur GitHub Pages et en fichier local)</td></tr>
<tr><td><code>pages/</code></td><td>les pages : <code>Home</code> (présentation orale), <code>ProofIndex</code>, <code>ChapterPage</code> (5 chapitres), <code>Play</code>, <code>Report</code></td></tr>
<tr><td><code>anim/</code></td><td>animations : <code>motion.jsx</code> (apparition au défilement, horloge en boucle, compteurs, confettis) et <code>scenes.jsx</code> (caméras qui balaient les murs, arrangement, lemme 6.2, mauvais gardien)</td></tr>
<tr><td><code>components/</code></td><td>briques SVG (scène, poignées déplaçables, chaînes…), UI (formules, cadres de figure, stepper)</td></tr>
<tr><td><code>widgets/</code></td><td>une figure interactive par fichier + le jeu</td></tr>
<tr><td><code>sections/</code></td><td>texte détaillé des chapitres de la preuve (<code>chapters.jsx</code>) et blocs de mise en page (<code>blocks.jsx</code>)</td></tr>
<tr><td><code>styles.css</code></td><td>tout le design (thème clair/sombre, typographies Inter et Instrument Serif, animations CSS)</td></tr>
<tr><td><code>tests/</code></td><td><code>run-tests.mjs</code> (solveur), <code>proofs-test.mjs</code> (lemmes)</td></tr>
<tr><td><code>scripts/</code></td><td>génération des figures et des PDF de <code>docs/</code></td></tr>
</tbody></table>

<h2>3. Conventions géométriques</h2>
<ul>
<li><strong>Orientation.</strong> Les sommets sont stockés dans le sens trigonométrique (le constructeur inverse l'ordre si l'aire signée est négative).
Les calculs utilisent des coordonnées mathématiques ($y$ vers le haut) ; le dessin SVG retourne l'axe $y$, si bien qu'un polygone anti-horaire apparaît aussi anti-horaire à l'écran.</li>
<li><strong>Paramétrisation du bord.</strong> Un point du bord est un réel $t$ : $\lfloor t\rfloor$ est l'indice de l'arête et $t-\lfloor t\rfloor$ la fraction parcourue.
$t$ et $t+n$ désignent le même point ; une chaîne $[a,b]$ est stockée « déroulée » avec $a\le b\le a+n$. Les sommets ont des paramètres entiers, ce qui rend
exacts les tests « la chaîne contient-elle un sommet ».</li>
<li><strong>$P$ est fermé.</strong> « $g$ voit $q$ » signifie que le segment $gq$ est dans $P$ <em>fermé</em> : il peut longer une arête ou frôler un sommet réflexe.
C'est indispensable, car les gardiens candidats sont sur les droites support des arêtes et voient leurs arêtes « par la tranche ».</li>
</ul>

<h2>4. Les briques géométriques</h2>
<h3>4.1 Le prédicat de visibilité <code>segInside(p, q)</code></h3>
<p>On collecte tous les paramètres où le segment $pq$ touche le bord (sommets situés sur $pq$, intersections, extrémités de chevauchements colinéaires). Une traversée
<em>propre</em> d'une arête (les deux extrémités de l'arête strictement de part et d'autre de $pq$ et $p,q$ strictement de part et d'autre de l'arête) rend immédiatement
« non ». Sinon on teste le milieu de chaque sous-segment entre deux contacts consécutifs : il doit être dans $P$ fermé. Coût $O(n)$ par contact, donc $O(n)$ à $O(n^2)$.</p>
<h3>4.2 Chaînes maximales vues par un point <code>visibleChains(P, g)</code></h3>
<p>Le long du bord, la visibilité depuis $g$ ne peut changer qu'en un sommet de $P$ ou en un point touché par un rayon issu de $g$ passant par un sommet.
On calcule tous ces <em>points critiques</em> ($O(n)$ rayons, toutes leurs intersections avec le bord), on teste la visibilité de chaque point critique et du milieu
de chaque intervalle élémentaire : entre deux points critiques consécutifs, la visibilité est constante, donc le résultat est exact. On ferme ensuite l'ensemble vu
(les extrémités d'un intervalle vu sont vues) et on regroupe les intervalles consécutifs en chaînes maximales. Coût $O(n^2)$ à $O(n^3)$ par point.</p>
<h3>4.3 Noyaux de visibilité</h3>
<p>Intersection de demi-plans par découpages successifs (Sutherland–Hodgman) d'un très grand carré. Les sommets créés par le carré sont marqués « artificiels » :
ils représentent l'infini (noyau non borné) et ne sont jamais utilisés comme candidats.</p>
<h3>4.4 Plus courts chemins</h3>
<p>Un plus court chemin dans un polygone simple est une ligne brisée dont les sommets intérieurs sont des sommets réflexes. On précalcule quels sommets se voient
et on applique Floyd–Warshall (en ne passant que par les sommets réflexes) : $O(n^3)$. Pour une requête entre deux points quelconques, on calcule les sommets vus par
chacun et on minimise $|p\,v_i|+D[i][j]+|v_j\,q|$. Le papier utilise Guibas–Hershberger ($O(\log n)$ par requête) ; pour quelques dizaines de sommets la version simple suffit.</p>
<h3>4.5 Arrangement</h3>
<p>Les $\binom n2$ intersections de droites support, filtrées pour ne garder que celles dans $P$, puis fusionnées quand elles coïncident numériquement (en gardant l'union des arêtes qui les définissent).</p>

<h2>5. Le solveur (<code>solver.js</code>)</h2>
<ol>
<li><code>isStarShaped()</code> : noyau de toutes les arêtes ; s'il est non vide, $k=1$ et le gardien est le centre du noyau.</li>
<li><code>candidateGuards()</code> = $G_P$ (déf. 5.1) : pour chaque sommet $c$ de l'arrangement et chaque extrémité $x$ de ses arêtes définissantes vue par $c$, la chaîne maximale de $c$ contenant $x$.</li>
<li><code>startPoints()</code> = $U_P$ (déf. 5.2) : sommets de $P$ + débuts des chaînes de $G_P$, triés et sans doublons.</li>
<li><code>next(u)</code> (lemme 6.8) : le maximum de
  <ul><li><code>nextGood(u)</code> : la fin la plus lointaine parmi les chaînes de $G_P$ qui contiennent $u$ ;</li>
  <li><code>nextBad(u)</code> : pour chaque arête $e_j$ après $u$ (balayage linéaire au lieu de la recherche binaire), plus court chemin de $u$ vers les extrémités de $e_j$ ;
  s'il tourne à gauche, droite $\ell_u$ par sa première arête, intersection avec le noyau $P_E$ (maintenu incrémentalement en ajoutant une arête à la fois), et les deux extrémités
  de $\ell_u\cap P_E$ sont testées comme gardiens (lemme 4.9). On ignore les arêtes qui ne peuvent pas battre la meilleure valeur, et on s'arrête dès que le noyau devient vide
  (observation 2.1 : plus personne ne peut voir au-delà).</li></ul>
  Les résultats sont mémorisés (<code>Map</code>) : deux gloutons qui passent par le même point ne recalculent rien.</li>
<li><code>greedy(u)</code> : applique <code>next</code> jusqu'à couvrir un tour complet.</li>
<li><code>solve()</code> : glouton depuis chaque $u\in U_P$, garde le minimum. Arrêt anticipé : si une solution de taille (taille du premier glouton $-1$) est trouvée,
elle est optimale (borne $k+1$) ; si $k=2$ est atteint, c'est optimal puisque $P$ n'est pas étoilé. Option <code>exhaustive</code> pour la figure 10.</li>
</ol>
<p><strong>Propriété importante.</strong> Toute valeur proposée par <code>next</code> vient d'un vrai calcul de visibilité depuis un vrai point : le solveur ne peut donc jamais
annoncer une couverture fausse. Le théorème de l'article garantit qu'il ne rate pas l'optimum ; nos tests le vérifient empiriquement.</p>
<p><strong>Performances</strong> (navigateur ou Node, polygones aléatoires) : ${stats.perf}.</p>

<h2>6. Les constructions des preuves (<code>proofs.js</code>)</h2>
<table><thead><tr><th>Fonction</th><th>Résultat de l'article</th><th>Ce qu'elle rend</th></tr></thead><tbody>
<tr><td><code>replaceGoodGuard</code></td><td>Prop. 4.3, lemmes 4.2–4.6, cor. 4.7</td><td>$P_E$, $P_g$, lemme applicable, candidats testés, remplaçant $c$</td></tr>
<tr><td><code>lemma49</code></td><td>Lemme 4.9</td><td>$S_v$, $\ell_u$, $\ell_v$, $P_v$, $P'$, points $g^*$</td></tr>
<tr><td><code>maximalChainLemma62</code></td><td>Déf. 6.1, lemme 6.2</td><td>$E_{g,m}$, $s$, $t$, $\pi_s$, $\pi_t$, rayons, $[u,v]$ et la référence calculée directement</td></tr>
<tr><td><code>theorem54</code></td><td>Lemme 5.3, théorème 5.4</td><td>la suite des étapes de la preuve appliquée à une solution</td></tr>
<tr><td><code>classifyGuard</code> (solver.js)</td><td>Déf. 4.1</td><td>les quatre conditions et l'angle</td></tr>
</tbody></table>

<h2>7. Validation</h2>
<p>Les tests (<code>npm test</code>) comparent l'implémentation à des calculs indépendants :</p>
<ul>
<li><strong>Visibilité</strong> : pour des points aléatoires, l'appartenance aux chaînes calculées coïncide avec le test direct <code>segInside</code>.</li>
<li><strong>$\mathrm{next}(u)$ contre force brute</strong> : une grille dense de gardiens (≈ 2000 points + sommets de l'arrangement) ne fait jamais mieux que notre $\mathrm{next}(u)$.</li>
<li><strong>Optimum</strong> : le glouton depuis 200 départs régulièrement espacés ne trouve jamais moins de gardiens que l'optimum calculé via $U_P$ ; aucun glouton n'utilise plus de $k+1$ gardiens ; chaque solution rendue couvre le bord et chaque gardien voit sa chaîne.</li>
<li><strong>Lemmes</strong> : ${stats.lemmas}</li>
</ul>
<p>Dernière exécution : <strong>${stats.checks}</strong>.</p>

<h2>8. Robustesse numérique : les pièges rencontrés</h2>
<ol>
<li><strong>Visibilité « par la tranche ».</strong> Un sommet de l'arrangement est sur la droite support de ses arêtes : sans $P$ fermé et sans gestion des contacts, il ne verrait pas ses propres arêtes.</li>
<li><strong>Lemme 6.2, double intersection.</strong> Quand la chaîne fait plus d'un tour autour de $g$, un rayon peut toucher $[s,t]$ deux fois ; il faut prendre le point le plus proche de $m$
de chaque côté (définition de $u^*$ dans la preuve), pas le plus proche de $g$. Notre première version se trompait dans ≈ 19 % des cas.</li>
<li><strong>Bouclage des paramètres.</strong> Un paramètre $a=8{,}999999999999998$ comparé à $9$ « modulo $n$ » peut donner presque $n$. Toutes les comparaisons de chaînes passent par
<code>relFrom</code> qui ramène l'écart dans $(-\varepsilon, n-\varepsilon]$.</li>
<li><strong>Angle d'un gardien.</strong> Si $u$, $g$ et $v$ sont alignés (la chaîne fait exactement un tour), l'angle entre $gu$ et $gv$ vaut numériquement $0$ alors que l'angle balayé vaut $2\pi$ :
on utilise alors l'angle balayé le long de la chaîne.</li>
<li><strong>Position générale.</strong> L'article suppose qu'aucune paire de droites n'est parallèle et qu'aucun triplet n'est concourant ; les exemples sont légèrement perturbés.
Le solveur fonctionne aussi sur des polygones orthogonaux dessinés à la main (droites parallèles ignorées, points concourants fusionnés).</li>
</ol>

<h2>9. Les widgets</h2>
<table><thead><tr><th>Figure</th><th>Fichier</th><th>Résultat illustré</th></tr></thead><tbody>
<tr><td>1</td><td>Playground.jsx (accueil)</td><td>définition, chaînes maximales d'un point, solution optimale</td></tr>
<tr><td>2</td><td>CoreWidget.jsx</td><td>noyau $P_E$, obs. 2.1, 2.2</td></tr>
<tr><td>3</td><td>GreedyWidget.jsx</td><td>glouton pas à pas, bande « le glouton reste en avance », $k$ vs $k+1$</td></tr>
<tr><td>4</td><td>GoodBadWidget.jsx</td><td>déf. 4.1 (quatre conditions en direct), obs. 4.8</td></tr>
<tr><td>5</td><td>ReplaceWidget.jsx</td><td>prop. 4.3, lemmes 4.2–4.6, cor. 4.7 ; lemme 4.9 pour les mauvais gardiens</td></tr>
<tr><td>6</td><td>ArrangementWidget.jsx</td><td>$C_P$, $G_P$, $U_P$ (cliquer un sommet)</td></tr>
<tr><td>7</td><td>Theorem54Widget.jsx</td><td>théorème 5.4 pas à pas (cas « tous mauvais » sur « Two bad guards »)</td></tr>
<tr><td>8</td><td>Lemma62Widget.jsx</td><td>lemme 6.2 pas à pas, comparaison avec la visibilité directe</td></tr>
<tr><td>9</td><td>NextStepWidget.jsx</td><td>lemme 6.8 : partie « bons gardiens » et table des arêtes pour les mauvais</td></tr>
<tr><td>10</td><td>FullAlgorithmWidget.jsx</td><td>théorème 7.1 : tous les départs de $U_P$ colorés $k$ / $k+1$, polygones aléatoires</td></tr>
<tr><td>11</td><td>NextFunctionWidget.jsx</td><td>graphe de $\mathrm{next}$, révolutions, zones de bons départs ([6])</td></tr>
<tr><td>Jeu</td><td>GameWidget.jsx (page Play)</td><td>jeu et bac à sable (dessin, import/export JSON), confettis en cas de victoire</td></tr>
</tbody></table>
<p><strong>Interaction.</strong> Les figures sont en SVG ; les poignées utilisent les <em>pointer events</em> (souris et tactile). Les calculs lourds sont mémorisés par polygone
(<code>solverFor</code>, <code>solutionFor</code>) et partagés entre les figures. Chaque sous-section est protégée par une <em>error boundary</em> : une erreur dans une figure n'efface pas la page.</p>

<h2>10. Modifier le projet</h2>
<ul>
<li><strong>Auteurs des sections</strong> : <code>AUTHORS</code> dans <code>src/sections/blocks.jsx</code> et l'attribut <code>author</code> de chaque <code>&lt;Sub&gt;</code>.</li>
<li><strong>Ajouter un polygone d'exemple</strong> : une entrée dans <code>src/geometry/presets.js</code> (coordonnées $y$ vers le haut, environ 0–1000), puis l'ajouter aux listes <code>ids</code> des figures voulues.</li>
<li><strong>Texte</strong> : accueil <code>src/pages/Home.jsx</code>, chapitres <code>src/sections/chapters.jsx</code> (métadonnées dans <code>src/pages/ChapterPage.jsx</code>), rapport <code>src/pages/Report.jsx</code>. Formules : <code>&lt;M&gt;</code> (en ligne) ; avec des accolades, écrire <code>&lt;M&gt;{'\\frac{a}{b}'}&lt;/M&gt;</code>.</li>
<li><strong>Régénérer les PDF</strong> : <code>npm run docs</code> (nécessite Google Chrome). Les captures d'écran viennent de <code>scripts/screenshots.mjs</code> (serveur lancé + Chrome) puis <code>scripts/trim-shots.py</code> (Pillow).</li>
</ul>
`;
}
