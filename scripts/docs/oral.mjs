// Document 3 (FR): fiche de présentation orale et questions probables.
export default function oral() {
  return String.raw`
<div class="cover">
  <div class="kicker">INFO-F420 Computational Geometry · ULB · 2026–2027</div>
  <h1>Fiche de présentation et questions probables</h1>
  <p class="subtitle">Pour présenter le site et défendre le projet : plan, démonstrations à faire en direct, messages clés, questions/réponses</p>
  <p class="authors">Ilias Akajou (520466) · Jomaa Abdulrahman (583629)</p>
</div>

<h2>1. Le message en trois phrases</h2>
<ol>
<li>Le <em>Contiguous Art Gallery Problem</em> est polynomial alors que presque toutes les variantes de la galerie d'art sont NP-difficiles ou $\exists\mathbb{R}$-complètes,
parce que la contiguïté transforme le problème en un recouvrement d'un cercle (le bord) par des intervalles.</li>
<li>Le glouton est à un gardien près de l'optimum depuis n'importe quel départ, et optimal depuis le début d'une chaîne optimale ; de Berg et al. montrent qu'il suffit
d'essayer $O(n^2)$ départs, grâce à la distinction bons/mauvais gardiens et à l'arrangement des droites support.</li>
<li>Avec des plus courts chemins et du lancer de rayon, chaque pas glouton coûte $O(\log^2 n)$, d'où $O(kn^2\log^2 n)$ ; un article suivant atteint l'optimal $\Theta(n\log n)$.</li>
</ol>

<h2>2. Plan de présentation (≈ 15 minutes)</h2>
<table><thead><tr><th>Temps</th><th>Qui</th><th>Contenu</th><th>Démo sur le site</th></tr></thead><tbody>
<tr><td>1 min</td><td>Ilias</td><td>Le problème, pourquoi c'est surprenant</td><td>Figure 1 : bouger $g$, montrer qu'il voit plusieurs chaînes mais n'en garde qu'une ; cocher « optimal »</td></tr>
<tr><td>2 min</td><td>Ilias</td><td>Noyaux (obs. 2.1, 2.2), glouton, borne $k+1$</td><td>Figure 2 (cocher « whole boundary » sur l'étoile puis sur le U) ; figure 3 : départ quelconque (4 gardiens) puis « Start at an optimal chain » (3)</td></tr>
<tr><td>3 min</td><td>Ilias</td><td>Bons/mauvais gardiens, remplacement (prop. 4.3, cor. 4.7)</td><td>Figure 4 (encoche : mauvais) ; figure 5 (galerie : étoile $c$)</td></tr>
<tr><td>3 min</td><td>Jomaa</td><td>$G_P$, $U_P$, théorème 5.4</td><td>Figure 6 (cliquer un sommet) ; figure 7 (dérouler les 4 étapes sur « Two bad guards »)</td></tr>
<tr><td>3 min</td><td>Jomaa</td><td>Lemme 6.2, lemme 6.8, complexité</td><td>Figure 8 (étapes) ; figure 9 (table, le mauvais gardien gagne) ; figure 10 (polygone aléatoire)</td></tr>
<tr><td>2 min</td><td>Jomaa</td><td>$\Theta(n\log n)$ en bref</td><td>Figure 11 : graphe de $\mathrm{next}$, zones vertes/orange</td></tr>
<tr><td>1 min</td><td>les deux</td><td>Jeu, implémentation, tests</td><td>Jouer une partie « Easy » en direct</td></tr>
</tbody></table>

<h2>3. Questions probables et réponses</h2>
<div class="qa">
<p class="q">Pourquoi le glouton utilise-t-il au plus $k+1$ gardiens ?</p>
<p class="a">Argument « le glouton reste en avance » : on numérote les chaînes optimales à partir de celle qui contient $u$ (indice 0). La $i$-ème chaîne gloutonne finit au moins
aussi loin que la $(i-1)$-ème chaîne optimale, parce que le point où le glouton reprend est dans la $i$-ème chaîne optimale, dont le gardien voit donc jusqu'à sa fin.
Après $k+1$ chaînes on a dépassé la fin de la chaîne 0 après un tour.</p>

<p class="q">Pourquoi ne pas simplement essayer tous les points du bord ?</p>
<p class="a">Il y en a une infinité. Il faut un ensemble fini de départs dont l'un est le début d'une chaîne optimale : c'est $U_P$ ($O(n^2)$ points). Nos expériences montrent qu'en
pratique environ la moitié des points de $U_P$ sont de bons départs, mais la garantie vient du théorème 5.4.</p>

<p class="q">Qu'est-ce qu'un mauvais gardien, intuitivement, et pourquoi pose-t-il problème ?</p>
<p class="a">C'est un gardien qui voit sa chaîne sous un angle de plus de $\pi$, en regardant autour d'un obstacle : $u$ et $v$ ne se voient pas. Pour un bon gardien, le polygone
$P_g$ est à gauche des segments $gu$ et $gv$, donc tout point de $P_E\cap P_g$ est dans le noyau de $P_g$ et voit la chaîne. Pour un mauvais gardien ce n'est plus vrai, et le
remplaçant (lemme 4.9) se trouve sur une droite $\ell_u$ qui dépend de $u$ : on ne peut pas le précalculer, on le calcule à la volée pendant le glouton.</p>

<p class="q">Comment le théorème 5.4 se débarrasse-t-il des solutions faites uniquement de mauvais gardiens ?</p>
<p class="a">La chaîne d'un mauvais gardien $g$ est maximale, donc (lemme 5.3) le segment de sa fin $v$ vers $g$ passe par un sommet réflexe $r$ que $g$ ne couvre pas. Le gardien $g'$
qui couvre $r$ est forcé dans $P_g$ ; on enlève de sa chaîne la partie déjà vue par $g$, et le reste est vu sous un angle $\le\pi$ : $g'$ devient bon, et un bon gardien se
remplace par un candidat de $G_P$ dont la chaîne commence dans $U_P$.</p>

<p class="q">Pourquoi les sommets de l'arrangement des droites support ?</p>
<p class="a">Parce que les contraintes de visibilité d'une chaîne sont « être à gauche des droites support de ses arêtes » (obs. 2.1) : la région admissible est un polygone convexe
dont les sommets sont des intersections de ces droites. Pousser un bon gardien jusqu'à un sommet de cette région ne lui fait rien perdre (prop. 4.3).</p>

<p class="q">Que calcule exactement le lemme 6.2 et pourquoi deux plus courts chemins ?</p>
<p class="a">La chaîne maximale vue par $g$ contenant $m$. Ce qui cache le bord à $g$, ce sont des sommets réflexes ; le plus court chemin de $s$ (début de la zone où $g$ est à gauche
des arêtes) vers $g$ s'enroule autour du dernier obstacle, et le rayon qui prolonge sa dernière arête donne la limite de l'ombre $u$. Idem de l'autre côté avec $t$ pour $v$.</p>

<p class="q">Avez-vous trouvé quelque chose de faux ou d'imprécis dans l'article ?</p>
<p class="a">Une imprécision dans l'énoncé du lemme 6.2 : quand la chaîne fait plus d'un tour autour de $g$, un rayon peut toucher $[s,t]$ deux fois ; il faut prendre le point le plus
proche de $m$, comme dans la définition de $u^*$ de la preuve. Sinon, toutes les constructions de l'article ont fonctionné sur plus de 13 000 gardiens aléatoires.</p>

<p class="q">Quelle est la complexité de votre implémentation ?</p>
<p class="a">Polynomiale mais plus élevée que l'article (pas de structures en $O(\log n)$) : graphe de visibilité et Floyd–Warshall en $O(n^3)$, visibilité exacte d'un point en
$O(n^2)$–$O(n^3)$, balayage linéaire des arêtes au lieu de la recherche binaire. Sous la seconde pour $n\le 40$, ce qui suffit pour le jeu et les figures.</p>

<p class="q">Comment savez-vous que votre solveur est correct ?</p>
<p class="a">(1) Chaque gardien proposé vient d'un vrai calcul de visibilité : le solveur ne peut pas tricher sur la couverture. (2) On compare $\mathrm{next}(u)$ à une force brute sur
une grille dense de gardiens, et l'optimum à des gloutons depuis 200 départs. (3) Chaque lemme est testé sur des milliers de gardiens aléatoires. Tout passe.</p>

<p class="q">Et si le polygone n'est pas en position générale ?</p>
<p class="a">L'article le suppose. Dans notre code, les droites parallèles n'ont pas d'intersection (ignorées) et les points concourants sont fusionnés en gardant toutes les arêtes qui les
définissent. Le jeu accepte donc aussi des polygones orthogonaux dessinés à la main ; les exemples du site sont légèrement perturbés.</p>

<p class="q">Quelle est la différence entre [5] et [6] ?</p>
<p class="a">[5] : $O(n^2)$ départs et un pas glouton en $O(\log^2 n)$, soit $O(kn^2\log^2 n)$. [6] : $O(n)$ départs (dominateurs réduits), une fenêtre glissante pour calculer
$\mathrm{next}$ sur tous les départs en $O(n\log n)$, puis la représentation de $\mathrm{next}$ par $O(n)$ morceaux de Möbius pour éliminer le facteur $k$ ; plus une borne inférieure
$\Omega(n\log n)$ par réduction depuis <em>set disjointness</em>.</p>

<p class="q">Pourquoi $\Omega(n\log n)$ et pas $\Omega(n)$ ?</p>
<p class="a">Parce qu'on peut encoder <em>set disjointness</em> (décider si deux ensembles de $n$ nombres sont disjoints, $\Omega(n\log n)$ comparaisons) dans un polygone : chaque élément
de $B$ crée une poche gardable seulement depuis un point précis du long mur, et chaque élément de $A$ rend ce point inutilisable.</p>

<p class="q">Comment générez-vous les polygones du jeu ?</p>
<p class="a">Points aléatoires reliés dans un ordre aléatoire, puis « 2-opt » : tant que deux arêtes se croisent on inverse la portion de tournée entre elles (la longueur diminue
strictement, donc ça termine). On rejette les polygones avec des angles trop aigus ou des sommets trop proches d'autres arêtes, et les polygones étoilés (trop faciles).</p>
</div>

<h2>4. Pièges à éviter à l'oral</h2>
<ul>
<li>Ne pas dire que le glouton est optimal : il l'est seulement depuis un bon départ ; ailleurs il peut utiliser $k+1$ gardiens.</li>
<li>« Bon » et « mauvais » ne veulent pas dire « utile » et « inutile » : une solution optimale peut ne contenir que des mauvais gardiens (figure 7).</li>
<li>$U_P$ n'est pas un ensemble de positions de gardiens mais de <em>points de départ</em> sur le bord ; les positions candidates sont les sommets de $C_P$ ($G_P$).</li>
<li>$P_E$ n'est pas forcément dans $P$ : c'est une intersection de demi-plans du plan entier.</li>
</ul>
`;
}
