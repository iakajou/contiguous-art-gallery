// Two French presentation guides: one for Ilias, one for Jomaa.
// What each says, when, what to show on screen, what to master, the code each is responsible for,
// and the likely questions on each part.
import path from 'node:path';
import { pathToFileURL, fileURLToPath } from 'node:url';

const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..', '..');
const shot = (name) => `<img class="shot" src="${pathToFileURL(path.join(root, 'docs', 'screenshots', `${name}.jpg`)).href}" alt="">`;

const TIMELINE = [
  ['0:00', '0:30', 'ilias', 'En-tête', 'Présenter le sujet en une question'],
  ['0:30', '1:45', 'ilias', '01 Le problème', 'Définitions, polygone simple, démo figure 1'],
  ['1:45', '2:30', 'ilias', '02 Pourquoi c\'est surprenant', 'Les autres variantes sont dures ; frise 2024 → 2026'],
  ['2:30', '4:15', 'ilias', '03 Idée 1 : le glouton', 'Au plus $k+1$, et $k$ depuis le bon départ'],
  ['4:15', '5:15', 'ilias', '03 Idée 2 (début)', 'Bons et mauvais gardiens ; une bonne caméra glisse vers un croisement'],
  ['5:15', '7:00', 'jomaa', '03 Idée 2 (fin)', 'Croisements, $G_P$, $U_P$, théorème 5.4'],
  ['7:00', '8:45', 'jomaa', '03 Idée 3', 'Lemme 6.2 (2 chemins + 2 rayons), pas glouton en $O(\\log^2 n)$'],
  ['8:45', '10:00', 'jomaa', '04 Le résultat', '$O(kn^2\\log^2 n)$, puis $\\Theta(n\\log n)$'],
  ['10:00', '11:15', 'jomaa', '05 Construit et vérifié', 'Implémentation, tests, notre remarque sur le lemme 6.2'],
  ['11:15', '12:00', 'ilias', '06 + page Play', 'Démo du jeu, conclusion, remerciements'],
];

const NAMES = { ilias: 'Ilias Akajou', jomaa: 'Jomaa Abdulrahman' };

function timelineTable(who) {
  return `<table class="tl"><thead><tr><th>Temps</th><th>Qui</th><th>Section de l'accueil</th><th>Contenu</th></tr></thead><tbody>${TIMELINE.map(([a, b, w, sec, what]) =>
    `<tr class="${w === who ? 'me' : ''}"><td>${a}–${b}</td><td>${w === 'ilias' ? 'Ilias' : 'Jomaa'}</td><td>${sec}</td><td>${what}</td></tr>`).join('')}</tbody></table>`;
}

const seg = ({ time, title, screen, img, say, keys, demo, handover }) => `
<div class="seg">
  <div class="seg-head"><span class="seg-time">${time}</span><h3>${title}</h3></div>
  ${img ? `<div class="seg-img">${shot(img)}</div>` : ''}
  <p class="lbl">À l'écran</p><p>${screen}</p>
  ${demo ? `<p class="lbl">Geste</p><p>${demo}</p>` : ''}
  <p class="lbl">Ce que tu dis</p><div class="say">${say}</div>
  ${keys ? `<p class="lbl">Mots-clés à placer</p><p class="keys">${keys}</p>` : ''}
  ${handover ? `<div class="handover"><b>Transition</b> — ${handover}</div>` : ''}
</div>`;

const qa = (list) => `<div class="qa">${list.map(([q, a]) => `<p class="q">${q}</p><p class="a">${a}</p>`).join('')}</div>`;

const COMMON_QA = [
  ['Comment avez-vous utilisé l\'IA ?', 'Nous avons utilisé un assistant IA (Claude, d\'Anthropic) pour comprendre les articles et pour implémenter et tester le code du site. Nous avons relu, testé et corrigé ses résultats : par exemple, un premier choix faux dans le lemme 6.2 a été corrigé grâce aux tests, et l\'hypothèse « polygone simple » a été ajoutée sur l\'accueil après la relecture de Jomaa. Notre journal IA détaille les outils, les prompts importants, ce qu\'on a vérifié et nos décisions.'],
  ['Qui a fait quoi ?', 'Ilias explique l\'introduction, le glouton et les bons/mauvais gardiens (chapitres 1–2) ; Jomaa explique les points de départ, le théorème 5.4, le calcul rapide et l\'algorithme optimal (chapitres 3–5) et la validation. Chacun est responsable de la partie du code liée à ses chapitres (tableau de la section R.5 du rapport).'],
];

const CHECK = `<ul class="check">
<li>Répéter au moins deux fois à deux, chronomètre en main (12 minutes).</li>
<li>Ouvrir à l'avance : l'accueil du site en ligne, le chapitre 3 (figure 7), la page <em>Play</em>. Garder <code>VOIR_LE_SITE.html</code> sur l'ordinateur en secours si internet ne marche pas.</li>
<li>Zoom du navigateur à 110–125 % pour le projecteur ; thème clair.</li>
<li>Les animations se jouent une fois quand on arrive sur une section ; le bouton <b>↻ Replay</b> les relance, le bouton <b>⏸</b> en haut les coupe toutes.</li>
<li>Avoir lu le document « Tout le sujet, expliqué simplement » et sa partie de l'article.</li>
</ul>`;

// --------------------------------------------------------------------------- Ilias
function ilias() {
  return String.raw`
${seg({
    time: '0:00 – 0:30', title: 'En-tête', img: '01_home_hero',
    screen: 'L\'accueil du site, tout en haut : le titre et l\'animation des trois caméras qui balaient chacune une portion de mur.',
    say: String.raw`<p>« Bonjour, nous sommes Ilias Akajou et Jomaa Abdulrahman. Notre projet porte sur le <em>Contiguous Art Gallery Problem</em>.
La question est simple : combien de caméras faut-il pour filmer <b>tous les murs</b> d'une galerie, si chaque caméra ne filme qu'<b>une seule portion continue de mur</b> ?
Nous expliquons l'algorithme de de Berg, Conradi, van der Hoog et Staals, publié en 2025. Tout ce que vous voyez sur le site est calculé en direct par notre implémentation :
ici, par exemple, une solution optimale à trois caméras. »</p>`,
    keys: 'contiguous guard (gardien contigu) · boundary (bord) · live computation',
  })}
${seg({
    time: '0:30 – 1:45', title: '01 — Le problème', img: '02_home_problem',
    screen: 'Section 01 : la définition, la figure 1 (salle en U), puis l\'encadré « Why simple polygon is essential ».',
    demo: 'Déplacer le point $g$ dans la figure 1 : montrer la zone jaune (ce qu\'il voit) et les morceaux bleu clair. Cliquer sur un morceau bleu : « il n\'en garde qu\'un ». Cocher « show an optimal solution » : $k=2$.',
    say: String.raw`<p>« La galerie est un <b>polygone simple</b> à $n$ sommets : un seul contour qui ne se croise pas, et pas de trou.
Un point $g$ <b>voit</b> un point $q$ si le segment $gq$ reste dans la galerie. Un <b>gardien contigu</b>, c'est un point $g$ avec un morceau continu du bord, une <em>chaîne</em> $[u,v]$, qu'il voit en entier.
On cherche le nombre minimum $k$ de gardiens dont les chaînes couvrent tout le bord. »</p>
<p>(démo) « Ce point voit plusieurs morceaux de mur séparés, mais comme gardien contigu il n'en garde qu'un. Ici, il faut deux caméras. »</p>
<p>« Le mot <b>simple</b> est essentiel, pour trois raisons : les murs forment une seule boucle, ce dont dépend tout l'argument du glouton ; une courbe fermée dans la galerie n'entoure que la galerie, ce qu'utilisent toutes les preuves ; et avec un trou, on peut voir les deux bouts d'un mur sans voir son milieu. Avec des trous, la méthode ne marche plus, et la question est ouverte. »</p>`,
    keys: 'simple polygon · no holes · chain $[u,v]$ · $k$',
  })}
${seg({
    time: '1:45 – 2:30', title: '02 — Pourquoi c\'est surprenant', img: '03_home_surprise',
    screen: 'Les trois cartes (rouge, rouge, vert) et la frise 2024 → 2026.',
    say: String.raw`<p>« Presque toutes les variantes de la galerie d'art sont dures. La version classique est NP-difficile et même $\exists\mathbb{R}$-complète ; surveiller seulement les murs avec des gardiens ordinaires est aussi $\exists\mathbb{R}$-difficile.
Ajouter la contrainte « un seul morceau par caméra » devrait rendre le problème plus dur… et c'est l'inverse : il devient polynomial.
Posé en 2024, résolu en $O(kn^5\log n)$ en 2025 par trois équipes, puis en $O(kn^2\log^2 n)$ par l'article que nous expliquons, et enfin en $\Theta(n\log n)$ en 2026. »</p>
<p>« L'intuition : le bord est une boucle, chaque caméra en couvre un arc. Couvrir un cercle par des arcs est facile avec un algorithme glouton… à condition de savoir <b>où commencer</b>. »</p>`,
    keys: 'NP-hard · ∃ℝ-complete · polynomial · covering a circle with arcs',
  })}
${seg({
    time: '2:30 – 4:15', title: '03 — Idée 1 : le glouton', img: '05_home_idea1',
    screen: 'La grande phrase « Run a greedy algorithm from $O(n^2)$ well-chosen starting points… », puis l\'animation de l\'idée 1 (peigne : 4 gardiens puis 3).',
    demo: 'Laisser l\'animation se jouer (ou cliquer ↻ Replay) : d\'abord 4 gardiens depuis un point quelconque, puis 3 depuis le début d\'une chaîne optimale.',
    say: String.raw`<p>« Tout l'algorithme tient en une phrase : lancer un <b>glouton</b> depuis $O(n^2)$ points de départ bien choisis, et garder la meilleure solution. »</p>
<p>« Le glouton : depuis un point $u$ du bord, on prend la caméra qui filme la plus longue portion qui commence en $u$. Elle s'arrête en $\mathrm{next}(u)$ ; on recommence de là, jusqu'à faire le tour. »</p>
<p>« Pourquoi c'est presque optimal : on compare avec une solution optimale, chaîne par chaîne. Le point où le glouton repart est toujours dans une chaîne optimale, et la caméra de cette chaîne lui permet d'aller au moins jusqu'à sa fin : le glouton <b>reste en avance</b>. Donc il utilise <b>au plus $k+1$</b> caméras, et <b>exactement $k$</b> s'il part du début d'une chaîne optimale. Ici : 4 depuis un mauvais départ, 3 depuis le bon. »</p>
<p>« Tout le problème devient : trouver un bon point de départ. Il y en a une infinité ; les premiers travaux relançaient le glouton $O(kn^3)$ fois. L'apport de l'article : une liste de seulement $O(n^2)$ départs. »</p>`,
    keys: 'greedy · next(u) · greedy stays ahead · $k+1$ · good starting point',
  })}
${seg({
    time: '4:15 – 5:15', title: '03 — Idée 2, début : bons et mauvais gardiens', img: '06_home_idea2',
    screen: 'L\'idée 2 : à gauche, l\'animation du mauvais gardien (296° autour de l\'encoche).',
    say: String.raw`<p>« Pour construire cette liste, l'article regarde où peuvent être les caméras. Il distingue deux sortes de gardiens. Un gardien est <b>bon</b> s'il voit sa chaîne de face, sous un angle d'au plus 180°.
Il est <b>mauvais</b> s'il regarde autour d'un obstacle : angle de plus de 180°, et les deux bouts de sa chaîne ne se voient pas. Celui-ci voit 296° autour de l'encoche : il est mauvais. »</p>
<p>« Premier résultat clé : un <b>bon</b> gardien peut toujours glisser jusqu'à un <b>croisement de deux droites qui prolongent des murs</b>, sans rien perdre de sa chaîne. Intuitivement, pour voir sa chaîne, il doit être devant chacun de ses murs ; la zone autorisée est convexe, et ses coins sont justement ces croisements. »</p>`,
    keys: 'good guard · bad guard · angle > 180° · supporting lines · arrangement vertex',
    handover: '« Mais un mauvais gardien ne peut pas toujours glisser ainsi. Jomaa va vous montrer comment l\'article s\'en sort, et comment on obtient la liste des points de départ. »',
  })}
${seg({
    time: '11:15 – 12:00', title: '06 — Le jeu et la conclusion', img: 'fig12_game',
    screen: 'Page <em>Play</em> (niveau Easy).',
    demo: 'Cliquer dans la galerie pour poser une caméra, cliquer un mur (la portion vue se sélectionne), poser une deuxième caméra, puis « Check ». Si c\'est optimal : confettis. Sinon cocher « show optimal ».',
    say: String.raw`<p>« Pour finir, le jeu : on place des caméras, on choisit leur mur, et le jeu vérifie que chaque caméra voit toute sa portion et que tout est couvert, puis compare avec l'optimum calculé par l'algorithme. »</p>
<p>« À retenir : la contiguïté transforme le problème en couverture d'une boucle par des arcs ; le glouton est presque parfait ; et l'article montre qu'il suffit d'essayer $O(n^2)$ départs, avec des pas rapides. Le tout pour un polygone simple. »</p>
<p>« Nous avons utilisé un assistant IA pour comprendre les articles et pour implémenter et tester le code, que nous avons relu et corrigé ; c'est détaillé dans notre rapport et notre journal IA. Merci, nous sommes prêts pour vos questions. »</p>`,
  })}

<h2>4. Comprendre ta partie en profondeur</h2>
<h3>Polygone simple et visibilité</h3>
<p>Un polygone simple : contour fermé, segments qui ne se croisent pas, pas de trou. On parcourt le bord dans le sens anti-horaire : l'intérieur est toujours <b>à gauche</b> de chaque arête.
« Voir » est pris au sens fermé : un segment qui longe un mur ou frôle un coin compte comme dans la galerie (c'est indispensable car les positions candidates sont sur les droites des murs).</p>
<h3>Le noyau de visibilité (observations 2.1, 2.2)</h3>
<p>Pour une chaîne, on prolonge chacun de ses murs par une droite ; le <b>noyau</b> $P_E$ est l'ensemble des points à gauche de toutes ces droites. <b>Obs. 2.1</b> : un gardien qui voit toute la chaîne est dans $P_E$ (sinon il verrait un mur « de dos »).
<b>Obs. 2.2</b> : une seule caméra suffit ($k=1$) si et seulement si le noyau de <em>tous</em> les murs n'est pas vide, c'est-à-dire si le polygone est étoilé ; on le teste en temps linéaire (Lee–Preparata).</p>
<h3>Le glouton et la borne $k+1$ (preuve du théorème 7.1)</h3>
<p>$\mathrm{next}(u)$ = le point le plus loin $v$ tel qu'une caméra voit $[u,v]$. Numérote les chaînes optimales à partir de celle qui contient $u$ (indice 0). Récurrence : $v_1 \ge v^*_0$, et si $v_i \ge v^*_{i-1}$ alors le départ $u_{i+1}=v_i$ est dans la chaîne optimale $i$ (ou déjà au-delà), donc $v_{i+1}\ge v^*_i$.
Après $k+1$ étapes on a fait le tour. Si $u$ est le début d'une chaîne optimale, on la numérote 1 et $k$ étapes suffisent. <b>Conséquence</b> : $k \in \{|G_u|-1, |G_u|\}$ pour tout départ $u$.</p>
<h3>Bons et mauvais gardiens (définition 4.1)</h3>
<p>Un gardien $(g,[u,v])$ est mauvais si les <b>quatre</b> conditions sont vraies : (I) la chaîne ouverte contient un sommet ; (II) $g\neq u$ et $g\neq v$ ; (III) angle $>\pi$ ; (IV) $u$ ne voit pas $v$ (le plus court chemin n'est pas un segment). Sinon il est bon.
<b>Obs. 4.8</b> : pour un mauvais gardien, le plus court chemin de $u$ à $v$ tourne toujours à gauche (chaîne convexe).</p>
<h3>Remplacer un bon gardien (prop. 4.3, lemmes 4.2, 4.4–4.6, cor. 4.7)</h3>
<p>$P_g$ = le polygone formé par $gu$, la chaîne et $vg$. <b>Prop. 4.3</b> : un sommet du noyau $P_E$ est dans $P_g$, ou un sommet de la chaîne est dans $P_E$. Ce point est à gauche de tous les murs de la chaîne ; si en plus il est à gauche de $gu$ et $vg$, il est dans le noyau de $P_g$ et voit toute la chaîne.
C'est exactement ce que donne chaque condition qui échoue : 4.2 (chaîne dans une arête : une extrémité de l'arête suffit), 4.4 ($g=u$), 4.5 (angle $\le\pi$), 4.6 ($u$ voit $v$). <b>Cor. 4.7</b> : tout bon gardien peut être remplacé par un sommet de l'arrangement des droites des murs.</p>

<h2>5. Le code dont tu es responsable</h2>
<table><thead><tr><th>Fichier</th><th>Ce qu'il fait</th><th>Comment l'expliquer</th></tr></thead><tbody>
<tr><td><code>geometry/vec.js</code></td><td>vecteurs, test d'orientation</td><td>« <code>orient(a,b,c)</code> dit si $c$ est à gauche de $a\to b$ : c'est la base de tout. »</td></tr>
<tr><td><code>geometry/polygon.js</code></td><td>polygone, paramètre du bord, <code>segInside</code>, <code>isSimple</code></td><td>« Un point du bord est un réel $t$ : partie entière = arête, partie décimale = position sur l'arête. Pour savoir si $g$ voit $q$, on coupe le segment à tous ses contacts avec le bord et on vérifie que chaque morceau est dedans. »</td></tr>
<tr><td><code>geometry/visibility.js</code></td><td>chaînes maximales vues par un point</td><td>« La visibilité ne change qu'aux sommets et aux points touchés par un rayon passant par un sommet ; entre deux tels points elle est constante, donc on teste un point par morceau. »</td></tr>
<tr><td><code>geometry/core.js</code></td><td>noyaux (intersection de demi-plans)</td><td>« On découpe un très grand carré par chaque demi-plan, l'un après l'autre. »</td></tr>
<tr><td><code>geometry/solver.js</code> : <code>next</code>, <code>greedy</code>, <code>solve</code></td><td>le glouton et l'optimum</td><td>« <code>next(u)</code> prend le meilleur entre les candidats bons et la recherche des mauvais ; <code>greedy</code> applique <code>next</code> jusqu'au tour complet ; <code>solve</code> essaie chaque départ de $U_P$ et s'arrête dès qu'il trouve une solution avec une caméra de moins que le premier essai, car c'est forcément l'optimum. Il refuse un polygone non simple. »</td></tr>
<tr><td><code>widgets/</code> figures 1 à 5</td><td>gardien contigu, noyau, glouton, bon/mauvais, remplacement</td><td>« Chaque figure appelle les mêmes fonctions que le solveur et redessine en direct. »</td></tr>
<tr><td><code>App.jsx</code>, <code>pages/</code>, <code>anim/</code>, <code>styles.css</code></td><td>structure du site, design, animations</td><td>« Routage par <code>#/…</code> (marche sur GitHub Pages) ; les animations rejouent des résultats du solveur, se jouent une fois et peuvent être coupées. »</td></tr>
<tr><td><code>GameWidget.jsx</code>, <code>generate.js</code></td><td>le jeu, les polygones aléatoires</td><td>« Points aléatoires reliés, puis on décroise les arêtes (2-opt) jusqu'à avoir un polygone simple ; on rejette les formes trop pointues et les polygones étoilés. »</td></tr>
</tbody></table>

<h2>6. Questions probables sur ta partie</h2>
${qa([
    ['Pourquoi le glouton utilise-t-il au plus $k+1$ caméras ?', 'Argument « il reste en avance » : en numérotant les chaînes optimales depuis celle qui contient le départ, la $i$-ème chaîne gloutonne finit au moins là où finit la $(i-1)$-ème chaîne optimale. Après $k+1$ étapes, on a fait le tour.'],
    ['Pourquoi le polygone doit-il être simple ?', 'Le bord est alors une seule boucle (couverture d\'un cercle par des arcs) ; toute courbe fermée dans $P$ n\'entoure que $P$ (les preuves l\'utilisent : $P_g\\subseteq P$) ; voir les deux bouts d\'un mur suffit à le voir. Avec des trous, Merrild et al. montrent que leur méthode échoue, et la complexité est ouverte.'],
    ['Quelle différence avec le problème classique ?', 'On ne surveille que le bord, pas l\'intérieur, et chaque gardien ne couvre qu\'un seul morceau continu. Cette contrainte rend le problème unidimensionnel et polynomial.'],
    ['Quand une seule caméra suffit-elle ?', 'Quand le noyau du polygone n\'est pas vide (polygone étoilé). On le calcule en $O(n)$.'],
    ['Pourquoi un gardien qui voit sa chaîne est-il dans le noyau de cette chaîne ?', 'S\'il était strictement à droite d\'un mur de la chaîne, le segment vers ce mur arriverait par l\'extérieur de la galerie : il ne pourrait pas le voir (observation 2.1).'],
    ['Qu\'est-ce qu\'un mauvais gardien, et pourquoi est-ce gênant ?', 'Il voit sa chaîne sous plus de 180° en regardant autour d\'un obstacle, et $u$ ne voit pas $v$. Le point trouvé par la proposition 4.3 peut alors être caché de $u$ par l\'obstacle : on ne peut pas le faire glisser vers un croisement fixe.'],
    ['Pourquoi les croisements de droites ?', 'La zone où un gardien peut voir sa chaîne est une intersection de demi-plans (convexe) ; ses coins sont des croisements de droites prolongeant des murs. Un bon gardien peut glisser jusqu\'à un tel coin sans rien perdre.'],
    ['Comment le jeu vérifie-t-il une solution ?', 'Pour chaque caméra, on calcule exactement ce qu\'elle voit et on vérifie que sa chaîne est incluse dedans ; puis on vérifie que l\'union des chaînes fait tout le tour du bord. On compare avec le $k$ du solveur.'],
    ...COMMON_QA,
  ])}

<h2>7. Pièges à éviter</h2>
<ul>
<li>Ne pas dire que le glouton est toujours optimal : il peut faire une caméra de trop.</li>
<li>« Mauvais » ne veut pas dire « inutile » : une solution optimale peut ne contenir que des mauvais gardiens.</li>
<li>Toujours dire « polygone <b>simple</b> » en donnant la définition.</li>
<li>Ne pas entrer dans les détails du chapitre 3 : c'est la partie de Jomaa.</li>
</ul>`;
}

// --------------------------------------------------------------------------- Jomaa
function jomaa() {
  return String.raw`
${seg({
    time: '5:15 – 7:00', title: '03 — Idée 2, fin : les points de départ et le théorème 5.4', img: '06_home_idea2',
    screen: 'L\'idée 2 : à droite, l\'animation de l\'arrangement (droites, croisements, puis départs $U_P$ en vert/orange). En option : chapitre 3, figure 7 (le théorème 5.4 en 4 étapes).',
    demo: 'Laisser jouer l\'animation de droite (↻ Replay si besoin). Si le temps le permet, ouvrir le chapitre 3 et cliquer « Next » sur les 4 étapes de la figure 7.',
    say: String.raw`<p>« Merci Ilias. On prolonge chaque mur par une droite : ces $n$ droites se croisent en au plus $n(n-1)/2$ points, l'<b>arrangement</b>. Ce sont les positions candidates des caméras. »</p>
<p>« Pour chaque croisement $c$, on prend les chaînes maximales que $c$ voit autour des extrémités de ses deux murs : ce sont les <b>gardiens candidats</b> $G_P$. Leurs points de début, plus les sommets du polygone, forment la liste $U_P$ des <b>départs candidats</b> : $O(n^2)$ points. Sur l'animation : en vert, les départs depuis lesquels le glouton est optimal ; en orange, ceux où il fait une caméra de trop. »</p>
<p>« Le <b>théorème 5.4</b> dit qu'il existe toujours une solution optimale dont une chaîne commence dans $U_P$. Si un gardien de la solution est bon, on le remplace par un candidat sur un croisement, et sa chaîne commence dans $U_P$.
Si tous les gardiens sont mauvais : la vue d'un mauvais gardien est bloquée par un coin rentrant $r$ (lemme 5.3) ; le gardien qui voit $r$ est forcément « dans son dos » ; on raccourcit sa chaîne de ce que le premier voit déjà, et il devient <b>bon</b>. On revient au premier cas. »</p>
<p>« Donc : lancer le glouton depuis chaque point de $U_P$ trouve forcément l'optimum. »</p>`,
    keys: 'arrangement · candidate guards $G_P$ · start points $U_P$ · Theorem 5.4 · Lemma 5.3',
  })}
${seg({
    time: '7:00 – 8:45', title: '03 — Idée 3 : aller vite', img: '07_home_idea3',
    screen: 'L\'animation du lemme 6.2 : arêtes vues de face, deux plus courts chemins (rouge, bleu), deux rayons, la chaîne verte.',
    say: String.raw`<p>« Reste à faire chaque pas du glouton vite. L'outil clé est le <b>lemme 6.2</b> : la chaîne maximale qu'une caméra $g$ voit autour d'un point $m$. On prend la suite de murs autour de $m$ qui font face à $g$, de $s$ à $t$. On trace les <b>plus courts chemins</b> de $s$ et de $t$ vers $g$ : comme une ficelle tendue, ils s'enroulent autour des coins qui cachent la vue.
On prolonge leur dernier segment par un <b>rayon</b> depuis $g$ : là où il touche le mur, la partie visible commence ou s'arrête. »</p>
<p>« Avec des structures de données connues, un plus court chemin et un rayon se calculent en $O(\log n)$. Pour un pas glouton (<b>lemme 6.8</b>), on cherche d'abord le meilleur candidat bon dans une liste triée, puis on cherche par dichotomie le meilleur mauvais gardien, qui se trouve sur une droite $\ell_u$ fixée par le plus court chemin depuis $u$. Total : $O(\log^2 n)$ par pas. »</p>`,
    keys: 'shortest path · ray shooting · Lemma 6.2 · Lemma 6.8 · $O(\\log^2 n)$',
  })}
${seg({
    time: '8:45 – 10:00', title: '04 — Le résultat', img: '08_home_result',
    screen: 'La formule et la « course » des complexités ; bouger le curseur $n$.',
    demo: 'Faire glisser le curseur $n$ de 100 à 1000 : les écarts entre les barres augmentent.',
    say: String.raw`<p>« En tout : $O(n^2)$ départs, fois $O(k)$ pas de glouton, fois $O(\log^2 n)$ par pas : $O(k\,n^2\log^2 n)$, au lieu de $O(kn^5\log n)$ avant. Pour $n=100$, on passe d'environ $10^{11}$ à $10^6$ opérations. »</p>
<p>« Quelques mois plus tard, les mêmes auteurs ont obtenu $\Theta(n\log n)$ : seulement $O(n)$ départs, une fenêtre glissante pour calculer $\mathrm{next}$ partout en $O(n\log n)$, et $\mathrm{next}$ décrite par $O(n)$ morceaux simples, des transformations de Möbius. Ils montrent aussi qu'on ne peut pas faire mieux, par une réduction depuis le problème des ensembles disjoints. »</p>`,
    keys: 'Theorem 7.1 · $O(kn^2\\log^2 n)$ · $\\Theta(n\\log n)$ · lower bound',
  })}
${seg({
    time: '10:00 – 11:15', title: '05 — Construit et vérifié', img: '09_home_verified',
    screen: 'Les quatre chiffres (figures, gardiens testés, vérifications, temps de calcul).',
    say: String.raw`<p>« Nous avons implémenté l'algorithme en JavaScript : il tourne dans la page et calcule toutes les figures. À la place des structures en $O(\log n)$, nous utilisons des méthodes plus simples (graphe de visibilité, parcours linéaire), largement assez rapides : moins d'une demi-seconde pour 40 sommets. »</p>
<p>« Nous avons testé contre des calculs en force brute : une grille dense de caméras ne bat jamais notre $\mathrm{next}(u)$, et le glouton depuis 200 départs ne trouve jamais mieux que notre optimum. Chaque lemme a été vérifié sur des milliers de gardiens aléatoires. »</p>
<p>« Une trouvaille : l'énoncé du lemme 6.2 est imprécis quand la chaîne fait plus d'un tour autour de la caméra, car un rayon peut alors toucher la chaîne deux fois. La preuve dit qu'il faut prendre le point le plus proche de $m$ : notre première version prenait le plus proche de $g$, et se trompait dans environ 19 % des cas. Enfin, le solveur refuse un polygone non simple. »</p>`,
    keys: 'brute force · tests · Lemma 6.2 precision · simple polygon enforced',
    handover: '« Ilias va maintenant vous montrer le jeu. »',
  })}

<h2>4. Comprendre ta partie en profondeur</h2>
<h3>Arrangement, $G_P$ et $U_P$ (définitions 5.1, 5.2)</h3>
<p>L'arrangement $C_P$ est formé par les $n$ droites qui prolongent les murs ; il a $O(n^2)$ sommets. Pour chaque sommet $c$, défini par les murs $ab$ et $ef$, et chaque extrémité $x\in\{a,b,e,f\}$ que $c$ voit, on prend <b>l'unique</b> chaîne maximale vue par $c$ qui contient $x$ (unique car ce que voit un point fixe est fixe). Ces gardiens forment $G_P$ ; $U_P$ = tous les sommets de $P$ + les débuts des chaînes de $G_P$.</p>
<h3>Lemme 5.3 et théorème 5.4</h3>
<p><b>Lemme 5.3</b> : si la chaîne $[u,v]$ de $g$ est maximale, alors $v$ est un sommet réflexe, ou le segment $vg$ passe par un sommet réflexe (c'est lui qui cache la suite).
<b>Théorème 5.4</b> : (1) on rend chaque chaîne maximale ; (2) s'il existe un bon gardien, le corollaire 4.7 donne un croisement $c$ qui voit sa chaîne, et le candidat $(c,[u_x,v_x])\in G_P$ la contient : sa chaîne commence en $u_x\in U_P$ ;
(3) si tous sont mauvais : si $u$ ou $v$ est un sommet, c'est fini ; sinon le coin $r$ du lemme 5.3 est vu par un autre gardien $g'$ à l'intérieur de sa chaîne, donc $g'$ est à gauche des deux murs en $r$, donc dans $P_g$ ; on retire de sa chaîne la partie déjà vue par $g$ : il reste une seule chaîne $[a,b]$ (sinon la solution ne serait pas minimale), vue sous un angle $\le\pi$ : $g'$ est devenu bon, on applique (2).</p>
<h3>Lemme 6.2 et notre remarque</h3>
<p>$E_{g,m}$ = la plus longue suite de murs autour de $m$ dont $g$ est à gauche ; $s,t$ ses extrémités. Les plus courts chemins de $s$ et $t$ vers $g$ ; les rayons depuis $g$ le long de leur dernier segment touchent $[s,t]$ en $u$ et $v$ : $[u,v]$ est la chaîne maximale visible contenant $m$.
<b>Preuve</b> : soit $u^*$ le dernier point de $[s,m]$ tel que $gu^*$ touche le chemin $\pi_s$ en plus d'un point ; le polygone $[u^*,m]$, $mg$, $gu^*$ ne contient pas de point de $\pi_s$, donc il est dans $P$ et $g$ est dans son noyau. <b>Remarque</b> : quand la chaîne fait plus d'un tour autour de $g$, le rayon peut toucher $[s,t]$ deux fois : il faut prendre le point le plus proche de $m$ (définition de $u^*$).</p>
<h3>Lemmes 6.5, 6.6, 6.8 et théorème 7.1</h3>
<p><b>6.5</b> : avec Guibas–Hershberger (plus courts chemins en $O(\log n)$) et Hershberger–Suri (rayons en $O(\log n)$), le lemme 6.2 coûte $O(\log n)$. <b>6.6</b> : calcul de $G_P$ en $O(n^2\log n)$ en parcourant l'arrangement et en maintenant de quel côté de chaque droite on est (deux bits changent entre voisins).
<b>6.8</b> : structure en $O(n^2)$ espace ; requête $\mathrm{next}(u)$ = meilleur candidat bon (recherche binaire dans les chaînes triées) puis dichotomie sur l'arête où pourrait finir un mauvais gardien : chemin de $u$ vers la fin de l'arête convexe ? droite $\ell_u$ ; intersection avec le noyau (deux noyaux stockés) ; lemme 6.5 sur les extrémités ; le lemme 4.9 garantit le résultat. <b>7.1</b> : $O(n^2)$ départs × $O(k)$ pas × $O(\log^2 n)$.</p>
<h3>L'algorithme optimal $\Theta(n\log n)$</h3>
<p>Dominateurs bons (au plus un par paire d'indices), mauvais et « moches » ; après réduction, $O(n)$ départs. Fenêtre glissante sur les paires $(i,j)$ : les noyaux se maintiennent comme une enveloppe convexe sous des ajouts/retraits FIFO. $\mathrm{next}$ a $O(n)$ morceaux (constants ou Möbius $x\mapsto\frac{A+Bx}{C+Dx}$) : évaluation paresseuse de toutes les révolutions à la fois. Borne inférieure : réduction depuis <em>set disjointness</em>, $\Omega(n\log n)$.</p>

<h2>5. Le code dont tu es responsable</h2>
<table><thead><tr><th>Fichier</th><th>Ce qu'il fait</th><th>Comment l'expliquer</th></tr></thead><tbody>
<tr><td><code>geometry/shortestPath.js</code></td><td>plus courts chemins dans $P$</td><td>« Un plus court chemin ne se plie qu'aux sommets réflexes : on calcule quels sommets se voient, puis Floyd–Warshall. Pour deux points quelconques, on les relie aux sommets qu'ils voient. Plus simple que Guibas–Hershberger, suffisant pour quelques dizaines de sommets. »</td></tr>
<tr><td><code>geometry/arrangement.js</code></td><td>croisements des droites dans $P$</td><td>« Toutes les paires de droites, on garde les intersections dans $P$ et on fusionne celles qui coïncident. »</td></tr>
<tr><td><code>geometry/solver.js</code> : <code>candidateGuards</code>, <code>startPoints</code>, <code>nextBad</code></td><td>$G_P$, $U_P$, et la recherche des mauvais gardiens</td><td>« <code>nextBad</code> parcourt les arêtes après $u$ (au lieu d'une dichotomie), ajoute un demi-plan au noyau à chaque arête, s'arrête si le noyau devient vide, teste si le chemin tourne à gauche, coupe la droite $\ell_u$ avec le noyau et teste ses deux extrémités. »</td></tr>
<tr><td><code>geometry/proofs.js</code></td><td>les constructions des preuves</td><td>« Lemme 6.2 avec la bonne règle (point le plus proche de $m$), le théorème 5.4 étape par étape, le lemme 4.9 : ce sont les fonctions utilisées par les figures 5, 7 et 8. »</td></tr>
<tr><td><code>widgets/</code> figures 6 à 11</td><td>arrangement, théorème 5.4, lemme 6.2, pas glouton, algorithme complet, fonction next</td><td>« Chaque figure appelle le solveur et affiche les objets de la preuve. »</td></tr>
<tr><td><code>tests/</code></td><td>tests automatiques (<code>npm test</code>)</td><td>« Visibilité contre un test direct ; $\mathrm{next}(u)$ contre une grille de caméras ; l'optimum contre 200 départs ; chaque lemme sur des milliers de cas aléatoires. 1541 vérifications passent. »</td></tr>
</tbody></table>

<h2>6. Questions probables sur ta partie</h2>
${qa([
    ['Pourquoi $O(n^2)$ départs ?', 'Les positions candidates sont les croisements de $n$ droites, il y en a $O(n^2)$ ; chacun donne au plus 4 chaînes candidates, donc $O(n^2)$ débuts de chaînes, plus les $n$ sommets.'],
    ['Quelle différence entre $G_P$ et $U_P$ ?', '$G_P$ est un ensemble de gardiens (une position sur un croisement + une chaîne) ; $U_P$ est un ensemble de points du bord : les débuts de ces chaînes et les sommets. On lance le glouton depuis les points de $U_P$.'],
    ['Comment le théorème 5.4 traite-t-il une solution sans bon gardien ?', 'Le coin qui bloque un mauvais gardien est vu par un autre gardien, forcément situé dans le polygone $P_g$ ; on raccourcit la chaîne de cet autre gardien de ce qui est déjà couvert, et l\'angle devient au plus 180° : il est bon.'],
    ['Pourquoi des plus courts chemins dans le lemme 6.2 ?', 'Ce qui cache le bord à $g$, ce sont des coins rentrants ; le plus court chemin de $s$ vers $g$ s\'enroule exactement autour du dernier coin qui cache, et le prolonger donne la limite de l\'ombre.'],
    ['Qu\'avez-vous trouvé sur le lemme 6.2 ?', 'Quand la chaîne fait plus d\'un tour autour de $g$, un rayon peut toucher $[s,t]$ deux fois ; l\'énoncé est ambigu, la preuve dit de prendre le point le plus proche de $m$. Notre première version prenait le plus proche de $g$ et se trompait dans environ 19 % des tests.'],
    ['Comment calcule-t-on $\\mathrm{next}(u)$ quand le meilleur gardien est mauvais ?', 'Le lemme 4.9 dit qu\'il se trouve (ou un gardien aussi bon) au premier ou au dernier point de la droite $\\ell_u$ dans le noyau des murs concernés ; $\\ell_u$ est la droite du premier segment du plus court chemin depuis $u$. On teste ces deux points.'],
    ['Pourquoi votre implémentation est-elle plus lente que l\'article ?', 'Nous n\'avons pas implémenté les structures en $O(\\log n)$ (Guibas–Hershberger, Hershberger–Suri) ; nous utilisons des versions polynomiales plus simples, comme annoncé dans la proposition. Cela suffit pour illustrer l\'algorithme sur des galeries de quelques dizaines de sommets.'],
    ['Qu\'apporte l\'article $\\Theta(n\\log n)$ ?', '$O(n)$ départs au lieu de $O(n^2)$, une fenêtre glissante pour calculer $\\mathrm{next}$ sur tous les départs à la fois, et $\\mathrm{next}$ en $O(n)$ morceaux de Möbius pour éviter le facteur $k$ ; plus une borne inférieure qui montre que c\'est optimal.'],
    ['Comment avez-vous testé ?', 'Contre des calculs indépendants en force brute (grille de caméras, glouton depuis 200 départs, test direct de visibilité) et en vérifiant chaque lemme sur des milliers de gardiens aléatoires.'],
    ...COMMON_QA,
  ])}

<h2>7. Pièges à éviter</h2>
<ul>
<li>$U_P$ contient des <b>points de départ sur le bord</b>, pas des positions de caméras (ça, c'est $G_P$).</li>
<li>Le noyau $P_E$ n'est pas forcément dans la galerie : c'est une intersection de demi-plans du plan entier.</li>
<li>Ne pas présenter notre remarque sur le lemme 6.2 comme une erreur du théorème : le résultat reste vrai, c'est l'énoncé qui manque de précision.</li>
<li>Pour $\Theta(n\log n)$, rester sur les idées : ne pas entrer dans les détails des dominateurs.</li>
</ul>`;
}

export default function oralPerson(who) {
  const other = who === 'ilias' ? 'jomaa' : 'ilias';
  const body = who === 'ilias' ? ilias() : jomaa();
  const minutes = who === 'ilias' ? '6 minutes (début et fin)' : '6 minutes (milieu)';
  return String.raw`
<style>
.tl tr.me td { background: #eef2ff; font-weight: 600; }
.seg { break-inside: avoid; border: 1px solid #e2e8f0; border-radius: 3mm; padding: 3mm 4.5mm; margin: 4mm 0; }
.seg-head { display: flex; align-items: baseline; gap: 3mm; }
.seg-head h3 { margin: 0; }
.seg-time { font: 700 9.5pt Helvetica, Arial, sans-serif; color: #fff; background: #4f46e5; border-radius: 1.5mm; padding: 0.5mm 2mm; }
.seg-img { text-align: center; }
.seg-img img.shot { width: auto; max-width: 100%; max-height: 82mm; border: 1px solid #e2e8f0; border-radius: 2mm; margin: 2mm 0; }
.lbl { font: 700 8.5pt Helvetica, Arial, sans-serif; text-transform: uppercase; letter-spacing: .06em; color: #64748b; margin: 2.5mm 0 0.5mm; }
.say { background: #f8fafc; border-left: 3px solid #4f46e5; padding: 1mm 3mm; }
.say p { margin: 1.2mm 0; }
.keys { font-style: italic; color: #334155; }
.handover { margin-top: 2.5mm; background: #ecfdf5; border-radius: 2mm; padding: 2mm 3mm; }
.qa .q { font-weight: 700; margin: 3mm 0 0.5mm; break-after: avoid; }
.qa .a { margin: 0 0 0 4mm; color: #334155; }
.check li { margin: 1.5mm 0; }
.role { border: 1px solid #c7d2fe; background: #eef2ff; border-radius: 3mm; padding: 3mm 4.5mm; }
</style>
<div class="cover">
  <div class="kicker">INFO-F420 Computational Geometry · ULB · 2026–2027 · Présentation orale</div>
  <h1>Ton oral — ${NAMES[who]}</h1>
  <p class="subtitle">Ce que tu dis, quand, comment, ce que tu montres à l'écran, ce que tu dois maîtriser et les questions qu'on peut te poser</p>
  <p class="authors">Projet « Guarding Walls Contiguously » · ${NAMES.ilias} & ${NAMES.jomaa}</p>
  <div class="toc-box"><strong>Sommaire</strong><ol>
    <li>Ton rôle en bref</li><li>Le déroulé complet (12 minutes)</li><li>Ton texte, partie par partie</li>
    <li>Comprendre ta partie en profondeur</li><li>Le code dont tu es responsable</li><li>Questions probables et réponses</li><li>Pièges à éviter</li><li>Avant l'oral</li>
  </ol></div>
</div>

<h2>1. Ton rôle en bref</h2>
<div class="role">
<p><b>Tu parles environ ${minutes}.</b> ${who === 'ilias'
    ? 'Tu ouvres la présentation (sujet, problème, polygone simple, pourquoi c\'est surprenant), tu expliques le glouton et les bons/mauvais gardiens, puis tu passes la parole à Jomaa. Tu reprends à la fin pour la démo du jeu et la conclusion.'
    : 'Tu prends la parole après Ilias, au milieu de l\'idée 2 : points de départ $U_P$ et théorème 5.4, puis le calcul rapide (lemmes 6.2 et 6.8), le résultat, l\'algorithme optimal et la validation. Tu rends la parole à Ilias pour le jeu.'}</p>
<p><b>Dans le rapport et le site</b>, tu es indiqué comme celui qui explique ${who === 'ilias' ? 'l\'accueil 01–02, les chapitres 1 et 2, et le jeu' : 'les chapitres 3, 4 et 5 et la section « implémentation et validation »'}.</p>
<p><b>Ton binôme</b> : ${NAMES[other]}. Vous devez tous les deux pouvoir répondre aux questions générales (polygone simple, glouton, résultat principal, usage de l'IA).</p>
</div>

<h2>2. Le déroulé complet (12 minutes)</h2>
<p>Les lignes surlignées sont les tiennes. L'oral suit la page d'accueil du site, de haut en bas.</p>
${timelineTable(who)}

<h2>3. Ton texte, partie par partie</h2>
<p>Ce sont des phrases proposées : dis-les avec tes mots. Si l'oral se fait en anglais, utilise les mots-clés indiqués sous chaque partie.</p>
${body}

<h2>8. Avant l'oral</h2>
${CHECK}
`;
}
