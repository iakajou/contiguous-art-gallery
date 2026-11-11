// Document 1 (FR): explication détaillée de la preuve. Utilise String.raw pour garder les commandes LaTeX.
import * as F from '../figures.mjs';

export default function explication() {
  const pb = F.fig_problem();
  const core = F.fig_core();
  const gr = F.fig_greedy();
  const gb = F.fig_goodbad();
  const rp = F.fig_replace();
  const l49 = F.fig_lemma49();
  const arr = F.fig_arrangement();
  const t54 = F.fig_theorem54();
  const l62 = F.fig_lemma62();
  const ns = F.fig_nextstep();
  const np = F.fig_nextplot();
  const deg = (a) => `${((a * 180) / Math.PI).toFixed(0)}°`;

  return String.raw`
<div class="cover">
  <div class="kicker">INFO-F420 Computational Geometry · ULB · 2026–2027</div>
  <h1>Guarding Walls Contiguously</h1>
  <p class="subtitle">Explication détaillée de l'algorithme de de Berg, Conradi, van der Hoog et Staals pour le <em>Contiguous Art Gallery Problem</em></p>
  <p class="authors">Ilias Akajou (520466) · Jomaa Abdulrahman (583629)</p>
  <p class="note-cover">Document d'étude en français qui accompagne le site web du projet. Il suit exactement le plan de la partie 2 du site
  (sections 2.1 à 2.10) et détaille chaque preuve plus que la page web. Toutes les figures sont calculées par notre implémentation.</p>
  <div class="toc-box">
    <strong>Plan</strong>
    <ol>
      <li>Le problème (rappel bref)</li>
      <li>Vue d'ensemble de la preuve</li>
      <li>Partie A — le glouton est presque optimal (2.1–2.2)</li>
      <li>Partie B — bons et mauvais gardiens (2.3–2.4)</li>
      <li>Partie C — discrétisation : $G_P$, $U_P$ et le théorème 5.4 (2.5–2.6)</li>
      <li>Partie D — un pas glouton rapide (2.7–2.8)</li>
      <li>L'algorithme complet (2.9) et l'algorithme optimal en $\Theta(n\log n)$ (2.10)</li>
      <li>Répartition proposée des explications · glossaire</li>
    </ol>
  </div>
</div>

<h2>0. Comment lire ce document</h2>
<p>Le professeur nous a conseillé de ne pas passer trop de temps sur le problème classique de la galerie d'art (beaucoup de ressources existent)
et de <strong>travailler tous les deux sur la partie 2</strong>, en nous répartissant les explications. Le document est donc surtout consacré
à la preuve de l'article [5]. Chaque section indique le lemme correspondant de l'article et la figure interactive du site qui l'illustre.
La dernière section propose une répartition des sections de la partie 2 entre nous deux (à adapter).</p>
<p><strong>Notations.</strong> $P$ est un polygone simple à $n$ sommets $v_0,\dots,v_{n-1}$ donnés dans le sens trigonométrique (anti-horaire).
L'arête $e_i=v_iv_{i+1}$ est orientée, donc l'intérieur de $P$ est <em>à gauche</em> de chaque arête. Pour deux points $u,v$ du bord $\partial P$,
la <em>chaîne</em> $[u,v]$ est la partie du bord parcourue de $u$ à $v$ dans le sens anti-horaire, et $(u,v)$ la même chaîne sans ses extrémités.
Un point $g$ <em>voit</em> $q$ si le segment $gq$ est contenu dans $P$ ; $P$ est un ensemble <strong>fermé</strong> : un segment qui longe une arête
ou qui frôle un sommet réflexe reste « dans » $P$. Ce détail compte beaucoup dans les preuves (les gardiens candidats sont sur les droites support des arêtes).</p>

<h2>1. Le problème (rappel bref)</h2>
<div class="box def"><b>Définition.</b> Un <strong>gardien contigu</strong> est un couple $(g,[u,v])$ où $g\in P$ et $[u,v]$ est une chaîne dont
<em>chaque</em> point est vu par $g$. Le <strong>Contiguous Art Gallery Problem</strong> demande le nombre minimum $k$ de gardiens contigus dont les chaînes
recouvrent $\partial P$. On peut supposer que les chaînes ne se chevauchent pas : elles forment une partition du bord.</div>
<div class="figrow"><figure>${pb.a}<figcaption>Un point $g$ (rouge), sa région de visibilité (jaune) et les chaînes maximales qu'il voit (bleu). Un gardien contigu n'en garde qu'<em>une</em>.</figcaption></figure>
<figure>${pb.b}<figcaption>Une solution optimale du polygone en U : $k=${pb.k}$ gardiens, chacun avec sa chaîne (couleurs).</figcaption></figure></div>
<p><strong>Pourquoi c'est surprenant.</strong> La version classique (gardiens ponctuels qui doivent voir tout le polygone) est NP-difficile [8] et même
$\exists\mathbb{R}$-complète [9] ; ne garder que le bord avec des gardiens ponctuels est aussi $\exists\mathbb{R}$-difficile [10]. Ajouter la contrainte de
contiguïté semblait rendre le problème plus dur, mais c'est l'inverse : chaque gardien couvre <em>un intervalle</em> d'un objet de dimension 1 (le bord),
et couvrir un cercle par des intervalles est facile dès qu'on sait quels intervalles utiliser. C'est exactement ce que le glouton exploite.</p>
<table><thead><tr><th>Année</th><th>Référence</th><th>Idée</th><th>Temps</th></tr></thead><tbody>
<tr><td>2024</td><td>Shermer (CCCG)</td><td>problème posé</td><td>ouvert</td></tr>
<tr><td>2024–25</td><td>[2], [3], [4] → [1] (SoCG 2025)</td><td>glouton répété / $O(n^4)$ candidats / arcs analytiques</td><td>$O(kn^5\log n)$, $O(n^6\log n)$</td></tr>
<tr class="hl"><td>2025</td><td>[5] de Berg, Conradi, van der Hoog, Staals</td><td>glouton depuis $O(n^2)$ départs</td><td>$O(kn^2\log^2 n)$</td></tr>
<tr><td>2025–26</td><td>[6] de Berg, Conradi, van der Hoog, Rotenberg</td><td>dominateurs, fenêtre glissante, Möbius</td><td>$\Theta(n\log n)$</td></tr>
</tbody></table>

<h2>2. Vue d'ensemble de la preuve</h2>
<p>L'algorithme de [5] tient en une phrase : <strong>lancer un algorithme glouton depuis $O(n^2)$ points de départ bien choisis sur le bord, et garder
la plus petite solution</strong>. La preuve qu'il est correct et rapide repose sur trois idées.</p>
<ol>
<li><strong>Le glouton est presque optimal</strong> : depuis n'importe quel point, il utilise au plus $k+1$ gardiens, et exactement $k$ s'il part du début
d'une chaîne d'une solution optimale (sections 2.1–2.2).</li>
<li><strong>Peu de départs suffisent</strong> : il existe toujours une solution optimale dont une chaîne commence dans un ensemble explicite $U_P$ de $O(n^2)$ points.
L'outil clé est la distinction entre <em>bons</em> et <em>mauvais</em> gardiens : un bon gardien peut être déplacé sur un sommet de l'arrangement des droites support ;
une solution faite uniquement de mauvais gardiens peut être transformée pour contenir un bon gardien (sections 2.3–2.6).</li>
<li><strong>Chaque pas glouton est rapide</strong> : en $O(\log^2 n)$ grâce aux plus courts chemins, au lancer de rayon et à des noyaux de visibilité précalculés (sections 2.7–2.8).</li>
</ol>
<p>Total : $O(n^2)$ départs $\times$ $O(k)$ pas $\times$ $O(\log^2 n)$ = $O(kn^2\log^2 n)$ (section 2.9).</p>

<h2>3. Partie A — le glouton est presque optimal</h2>
<h3>2.1 Noyaux de visibilité et le cas d'un seul gardien <span class="ref">(Obs. 2.1, 2.2 — Figure 2 du site)</span></h3>
<div class="box def"><b>Définition (noyau de visibilité).</b> Pour un ensemble $E$ d'arêtes orientées de $P$, le <em>noyau de visibilité</em> $P_E$ est l'ensemble des points
du plan situés à gauche (ou sur) la droite support de chaque arête de $E$. C'est une intersection de demi-plans : un polygone convexe, éventuellement vide ou non borné.</div>
<div class="box obs"><b>Observation 2.1.</b> Si $(g,[u,v])$ est un gardien contigu, alors $g\in P_E$ où $E$ est l'ensemble des arêtes rencontrées par la chaîne ouverte $(u,v)$.</div>
<p><em>Preuve.</em> Supposons $g$ strictement à droite de la droite support d'une arête $e\in E$. Prenons un point $q$ dans l'intérieur relatif de $e\cap(u,v)$.
Juste avant d'atteindre $q$, le segment $gq$ arrive du côté droit de $e$, c'est-à-dire de l'<em>extérieur</em> de $P$ (l'intérieur est à gauche).
Donc $gq\not\subseteq P$ et $g$ ne voit pas $q$ : contradiction. $\square$</p>
<div class="box obs"><b>Observation 2.2.</b> Un seul gardien contigu suffit ($k=1$) si et seulement si le noyau de toutes les arêtes de $P$ (le <em>kernel</em>) est non vide,
c'est-à-dire si $P$ est étoilé. On le teste en temps linéaire (Lee–Preparata [13]).</div>
<p><em>Preuve.</em> ($\Rightarrow$) Observation 2.1 avec $E$ = toutes les arêtes. ($\Leftarrow$) Soit $p$ dans le noyau et $q\in P$ quelconque.
Partons de $q$ et avançons en ligne droite vers $p$. Si le segment sortait de $P$, au point de sortie il traverserait une arête $e$ de sa gauche (l'intérieur) vers sa droite
(l'extérieur) ; le mouvement étant rectiligne, tous les points suivants, et en particulier $p$, seraient strictement à droite de la droite support de $e$ — impossible
puisque $p$ est à gauche de toutes les arêtes. Donc $qp\subseteq P$ : $p$ voit tout $P$, et en particulier tout le bord. $\square$</p>
<p><strong>Ce qu'il faut retenir.</strong> L'observation 2.2 est utilisée partout ensuite, mais appliquée à de <em>petits polygones</em> $Q\subseteq P$ construits dans la preuve :
pour montrer qu'un point $c$ voit une chaîne $[u,v]$, on trouve un polygone $Q\subseteq P$ dont le bord contient $[u,v]$ et on montre que $c$ est dans son noyau.</p>
<div class="figrow"><figure>${core.f1}<figcaption>Chaîne $[u,v]$ (vert), droites support de ses arêtes (pointillés) et noyau $P_E$ (vert clair). Le point $g\in P_E$ voit toute la chaîne.</figcaption></figure>
<figure>${core.f2}<figcaption>Un point hors de $P_E$ ne voit pas toute la chaîne (parties rouges) : c'est l'observation 2.1.</figcaption></figure></div>

<h3>2.2 L'algorithme glouton <span class="ref">(preuve du théorème 7.1 — Figure 3)</span></h3>
<p>Pour $u\in\partial P$, notons $\mathrm{next}(u)$ le point $v$ le plus loin (dans le sens anti-horaire) tel qu'<em>un</em> gardien voie toute la chaîne $[u,v]$.
Ce maximum existe car l'ensemble des couples (gardien, chaîne vue) est fermé. Le <strong>glouton depuis $u$</strong> prend le gardien qui réalise $\mathrm{next}(u)$,
repart de $\mathrm{next}(u)$, et ainsi de suite jusqu'à ce que les chaînes recouvrent $\partial P$. On note $G_u$ le résultat.</p>
<div class="box thm"><b>Lemme (glouton).</b> Pour tout $u$, $|G_u|\le k+1$. Si une solution optimale contient un gardien dont la chaîne <em>commence</em> en $u$, alors $|G_u|=k$.</div>
<p><em>Preuve (« le glouton reste en avance »).</em> Fixons une solution optimale $G^*$ et numérotons ses chaînes $[u^*_0,v^*_0],[u^*_1,v^*_1],\dots$ dans l'ordre du bord,
en commençant par celle qui contient $u$ (indice 0). Les chaînes du glouton sont $[u_1,v_1],[u_2,v_2],\dots$ avec $u_1=u$ et $u_{i+1}=v_i$.
Montrons par récurrence que $v_i\ge v^*_{i-1}$ (positions mesurées le long du bord à partir de $u$).</p>
<ul>
<li><em>Initialisation.</em> Le gardien optimal d'indice 0 voit $[u^*_0,v^*_0]\ni u$, donc il voit $[u,v^*_0]$ ; par définition de $\mathrm{next}$, $v_1=\mathrm{next}(u)\ge v^*_0$.</li>
<li><em>Hérédité.</em> Supposons $v_i\ge v^*_{i-1}$. Si $u_{i+1}=v_i>v^*_i$, on a directement $v_{i+1}\ge u_{i+1}>v^*_i$. Sinon, comme les chaînes optimales se touchent
($u^*_i\le v^*_{i-1}$), on a $u_{i+1}\in[u^*_i,v^*_i]$ ; le $i$-ème gardien optimal voit donc $[u_{i+1},v^*_i]$, d'où $v_{i+1}=\mathrm{next}(u_{i+1})\ge v^*_i$.</li>
</ul>
<p>Après $k+1$ pas, $v_{k+1}\ge v^*_k$, qui est $v^*_0$ après un tour complet, donc au-delà de $u$ + un tour : tout le bord est couvert, d'où $|G_u|\le k+1$.
Si $u$ est le <em>début</em> d'une chaîne optimale, on numérote cette chaîne 1 au lieu de 0 et la même récurrence donne $v_i\ge v^*_i$ : $k$ pas suffisent. $\square$</p>
<div class="figrow"><figure>${gr.f1}<figcaption>Glouton depuis un mauvais départ : ${gr.n1} gardiens ($=k+1$).</figcaption></figure>
<figure>${gr.f2}<figcaption>Glouton depuis le début d'une chaîne optimale : ${gr.n2} gardiens ($=k$).</figcaption></figure></div>
<p><strong>Conséquence.</strong> Pour tout $u$, $k\in\{|G_u|-1,|G_u|\}$. Tout le problème est de trouver un bon point de départ. Merrild et al. [2] relancent le glouton
$O(kn^3)$ fois ; l'apport de [5] est un ensemble $U_P$ de seulement $O(n^2)$ départs, dont l'un est garanti être le début d'une chaîne optimale.</p>
<p class="remark"><strong>Remarque (monotonie).</strong> $\mathrm{next}$ est croissante : si $x\le x'$ et qu'un gardien voit $[x,v]$, il voit aussi $[x',v]$. C'est pour cela que la
comparaison « le glouton reste en avance » fonctionne.</p>

<h2>4. Partie B — bons et mauvais gardiens</h2>
<h3>2.3 Définition <span class="ref">(Déf. 4.1, Obs. 4.8 — Figure 4)</span></h3>
<div class="box def"><b>Définition 4.1.</b> Un gardien contigu $(g,[u,v])$ est <strong>mauvais</strong> s'il vérifie les quatre conditions :
(I) la chaîne ouverte $(u,v)$ contient un sommet de $P$ ; (II) $u\ne g$ et $v\ne g$ ; (III) l'angle $\angle(v,g,u)>\pi$ ; (IV) le plus court chemin de $u$ à $v$ dans $P$
n'est pas un seul segment. Il est <strong>bon</strong> sinon.</div>
<p><strong>Intuition.</strong> Comme $g$ est à gauche de toutes les arêtes de la chaîne (obs. 2.1), la chaîne tourne dans le sens anti-horaire autour de $g$ ; l'angle
de la condition (III) est l'angle balayé de la direction de $u$ à celle de $v$. Un bon gardien regarde sa chaîne « de face » (angle $\le\pi$) ; un mauvais gardien
regarde « autour d'un obstacle » : il voit plus d'un demi-tour de mur alors que $u$ et $v$ ne se voient pas. Les conditions (I), (II), (IV) excluent les cas dégénérés
faciles (chaîne dans une seule arête, gardien sur le bord, $u$ voit $v$).</p>
<div class="box obs"><b>Observation 4.8.</b> Si $g$ voit $u$ et $v$ et $\angle(v,g,u)>\pi$, le plus court chemin de $u$ à $v$ est une chaîne convexe qui tourne toujours à gauche.</div>
<p><em>Idée.</em> Le chemin $u\to g\to v$ est dans $P$ ; en le « tendant », on obtient le plus court chemin, qui reste dans le triangle $ugv$ côté obstacle et
s'enroule autour des sommets réflexes qui bloquent le segment $uv$. Comme l'angle en $g$ dépasse $\pi$, ces sommets sont tous du même côté : la chaîne est convexe.</p>
<div class="figrow"><figure>${gb.f}<figcaption>Un <strong>mauvais</strong> gardien dans la salle à encoche : angle ${deg(gb.cls.angle)} &gt; $\pi$, et le plus court chemin $u\to v$ (violet) contourne l'encoche.</figcaption></figure>
<figure>${gb.f2}<figcaption>Un <strong>bon</strong> gardien : il voit sa chaîne sous un angle de ${deg(gb.cls2.angle)} $\le\pi$.</figcaption></figure></div>

<h3>2.4 Remplacer un gardien par un sommet de l'arrangement <span class="ref">(Prop. 4.3, Lemmes 4.2–4.6, Cor. 4.7, Lemme 4.9 — Figure 5)</span></h3>
<p>Soit $C_P$ l'<strong>arrangement</strong> des $n$ droites support des arêtes ; il a $O(n^2)$ sommets. Pour un gardien $(g,[u,v])$ on note $E$ les arêtes rencontrées par $(u,v)$,
$P_E$ leur noyau, et $P_g$ le polygone délimité par le segment $gu$, la chaîne $[u,v]$ et le segment $vg$. Comme $g$ voit $u$, $v$ et toute la chaîne, $P_g\subseteq P$.</p>
<div class="box thm"><b>Proposition 4.3.</b> Si $[u,v]$ contient un sommet de $P$, alors ou bien un sommet de $P_E$ est dans $P_g$, ou bien un sommet de $P$ appartenant à $[u,v]$ est dans $P_E$.</div>
<p><em>Preuve.</em> Le bord de $P_E$ est une chaîne convexe $C$. Comme $g\in P_E$ et que $u$ et $v$ sont sur les droites support de la première et de la dernière arête de $E$,
la chaîne $C$ traverse les segments $gu$ et $vg$ ; soit $C'$ sa partie dans $P_g$. Si $C'$ ne contient aucun sommet de $P_E$, c'est un morceau d'une seule arête de $P_E$,
portée par la droite support d'une arête $e\in E$, avec ses deux extrémités hors de $P_g$. Ce segment coupe $P_g$ en traversant la chaîne là où se trouve $e$ : une extrémité de $e$
appartient à $[u,v]$ et se trouve sur $C'$, donc dans $P_E$. $\square$</p>
<p>Le point fourni par la proposition est dans $P_E$ (à gauche de toutes les arêtes de la chaîne). S'il est <em>aussi</em> à gauche des segments $gu$ et $vg$, il est dans le
noyau de $P_g$ et voit donc toute la chaîne par l'observation 2.2. C'est exactement ce que fournit chaque condition de la définition 4.1 qui échoue :</p>
<ul>
<li><strong>Lemme 4.2 (I échoue).</strong> $(u,v)$ est contenue dans une seule arête $ab$ : le sommet $a$ voit toute l'arête (segment contenu dans $P$).</li>
<li><strong>Lemme 4.4 (II échoue, $g=u$).</strong> $P_g$ est délimité par $[u,v]$ et le segment $vu$ ; tout $P_g$ est à gauche de $vu$, donc le point trouvé est dans le noyau de $P_g$.</li>
<li><strong>Lemme 4.5 (III échoue).</strong> $\angle(v,g,u)\le\pi$ : $P_g$ est entièrement à gauche de $gu$ et de $vg$ (c'est le sens de « angle $\le\pi$ »), même conclusion.</li>
<li><strong>Lemme 4.6 (IV échoue, $u$ voit $v$).</strong> On travaille dans $P'$ délimité par $[u,v]$ et $vu$ : $P_g\subseteq P'\subseteq P$ et le noyau de $P'$ vaut $P_E\cap P'$.
Le point trouvé (dans $P_g\cap P_E$) est donc dans le noyau de $P'$ et voit $[u,v]$.</li>
</ul>
<div class="box thm"><b>Corollaire 4.7.</b> Pour tout bon gardien $(g,[u,v])$, il existe un gardien $(c,[u,v])$ où $c$ est un sommet de $C_P$, intersection des droites support de deux arêtes $e_1,e_2$.
Sauf si $[u,v]$ ne contient aucun sommet de $P$, on peut choisir $c$ tel que $[u,v]$ contienne une extrémité de $e_1$ et une de $e_2$.</div>
<p>(Un sommet de $P_E$ est l'intersection de deux droites support d'arêtes de $E$, qui rencontrent $(u,v)$ ; un sommet de $P$ est l'intersection des droites de ses deux arêtes.)</p>
<div class="figrow"><figure>${rp.f}<figcaption>Bon gardien (lemme ${rp.lemma}) : $P_g$ en gris, $P_E$ en vert. L'étoile $c$ est ${rp.type === 'vertex of P_E inside P_g' ? 'un sommet de $P_E$ dans $P_g$' : 'un sommet de $P$ dans $P_E$'}, intersection de deux droites support (pointillés) : elle voit la même chaîne.</figcaption></figure></div>
<p><strong>Pourquoi les mauvais gardiens posent problème.</strong> Si l'angle dépasse $\pi$, le polygone $P_g$ n'est plus à gauche de $gu$ et $vg$ : un sommet de $P_E$ dans $P_g$
peut être caché de $u$ par l'obstacle autour duquel le gardien regarde. L'article décrit quand même où trouver un remplaçant, mais il dépend de $u$ :</p>
<div class="box thm"><b>Lemme 4.9.</b> Soit $(g,[u,v])$ mauvais, $v$ sur l'arête $v_jv_{j+1}$, et $\ell_u$ la droite support de la dernière arête du plus court chemin de $v_{j+1}$ à $u$.
Alors un sommet de $P_E$, ou le premier ou le dernier point de $\ell_u$ dans $P_E$, voit aussi $[u,v]$.</div>
<p><em>Preuve.</em> Soit $S_v$ le plus court chemin de $v$ à $u$ ; par l'observation 4.8 il est convexe, donc son noyau est l'intersection des demi-plans à gauche des droites $\ell_v$
et $\ell_u$ portant sa première et sa dernière arête. Le polygone $P_v$ délimité par $S_v$ et $[u,v]$ a pour noyau $P'=P_E\cap\{\text{gauche de }\ell_u,\ell_v\}$, qui contient $g$.
Si une extrémité de $\ell_u\cap P_E$ est dans $P'$, elle est dans le noyau de $P_v$ et voit $[u,v]$. Sinon $P'$ est borné et non vide, et l'un de ses sommets est un sommet de
$P_E$ (ou de $P$), qui voit $[u,v]$ pour la même raison. $\square$</p>
<div class="figrow"><figure>${l49}<figcaption>Lemme 4.9 sur le mauvais gardien de la figure précédente : $P_v$ (gris), $P'$ (vert foncé), $S_v$ (rouge), $\ell_u$ et $\ell_v$ (orange). Le point $g^*$ où $\ell_u$ quitte $P_E$ voit toute la chaîne.</figcaption></figure></div>

<h2>5. Partie C — discrétisation</h2>
<h3>2.5 Gardiens candidats $G_P$ et points de départ $U_P$ <span class="ref">(Déf. 5.1, 5.2, Lemme 6.6 — Figure 6)</span></h3>
<div class="box def"><b>Définition 5.1.</b> Pour chaque sommet $c$ de $C_P$, défini par les arêtes $ab$ et $ef$, et chaque $x\in\{a,b,e,f\}$ vu par $c$, soit $[u_x,v_x]$ l'unique
chaîne maximale (pour l'inclusion) vue par $c$ qui contient $x$. $G_P$ est l'ensemble de ces gardiens $(c,[u_x,v_x])$.</div>
<div class="box def"><b>Définition 5.2.</b> $U_P$ = tous les sommets de $P$ et tous les débuts $u_x$ des gardiens de $G_P$. On a $|G_P|,|U_P|=O(n^2)$.</div>
<p>« Unique » : un point fixe voit un ensemble fixe de chaînes maximales disjointes (sa région de visibilité coupe le bord en morceaux), donc il y en a une seule qui contient $x$.</p>
<div class="figrow"><figure>${arr.f}<figcaption>Polygone « galerie » ($n=${arr.n}$) : droites support, ${arr.nArr} sommets de $C_P$ dans $P$, $|G_P|=${arr.nGP}$, $|U_P|=${arr.nUP}$ (points verts sur le bord). Le sommet $c$ (rouge) et ses chaînes candidates.</figcaption></figure></div>
<p><strong>Calcul (lemme 6.6, $O(n^2\log n)$).</strong> On parcourt l'arrangement le long d'une marche qui passe par tous ses sommets. Pour le sommet courant on maintient,
dans un arbre équilibré, la chaîne de bits « suis-je à gauche de la droite $i$ ? » ; entre deux sommets voisins elle change en au plus deux positions. En chaque sommet $c$
et pour chaque extrémité $x$ : une requête de plus court chemin teste si $c$ voit $x$ ; l'arbre donne la plus longue suite d'arêtes ayant $c$ à gauche ($E_{c,x}$, déf. 6.1) ;
le lemme 6.5 donne $[u_x,v_x]$ en $O(\log n)$.</p>

<h3>2.6 Théorème 5.4 : une solution optimale commence dans $U_P$ <span class="ref">(Lemme 5.3 — Figure 7)</span></h3>
<div class="box thm"><b>Lemme 5.3.</b> Si $(g,[u,v])$ est un gardien avec $[u,v]\ne\partial P$ maximale, alors ou bien $v$ est un sommet réflexe, ou bien le segment $vg$ contient un sommet réflexe en son intérieur.</div>
<p><em>Preuve.</em> Juste après $v$ le bord n'est plus vu par $g$ (maximalité). Pour $\varepsilon>0$ petit, le plus court chemin de $g$ à $v+\varepsilon$ se plie donc en un sommet réflexe $x$.
Quand $\varepsilon\to0$, ce chemin tend vers le segment $gv$ : soit $x=v$, soit $x$ est à l'intérieur du segment $vg$. $\square$</p>
<div class="box thm"><b>Théorème 5.4.</b> Si $G$ est une solution minimale avec $|G|>1$, il existe une solution $G'$ de même taille dont un gardien $(g,[u,v])$ vérifie $u\in U_P$.</div>
<p><em>Preuve.</em> On commence par étendre chaque chaîne à la chaîne maximale vue par son gardien.</p>
<p><strong>Cas 1 : un gardien est bon.</strong> Si sa chaîne ne contient aucun sommet, le lemme 4.2 le remplace par un sommet de $P$ dont la chaîne commence en un sommet ($\in U_P$).
Sinon le corollaire 4.7 donne un sommet $c$ de $C_P$ qui voit la même chaîne $[u,v]$, avec $[u,v]$ contenant une extrémité $x$ d'une arête définissant $c$. Le candidat
$(c,[u_x,v_x])\in G_P$ voit la chaîne maximale qui contient $x$, donc $[u,v]\subseteq[u_x,v_x]$ : on remplace le gardien par ce candidat, sa chaîne commence en $u_x\in U_P$.</p>
<p><strong>Cas 2 : tous les gardiens sont mauvais.</strong> Prenons $(g,[u,v])$. Si $u$ est un sommet, c'est fini. Si $v$ est un sommet, le gardien suivant (dont la chaîne contient $v$)
peut être raccourci pour commencer en $v$. Sinon, par le lemme 5.3, $vg$ passe par un sommet réflexe $r\notin[u,v]$ ; un autre gardien $(g',[u',v'])$ voit $r$. Si $r$ est une
extrémité de sa chaîne, on conclut comme ci-dessus. Sinon $r$ est à l'intérieur de sa chaîne : $g'$ est à gauche des deux arêtes en $r$, donc à gauche de la droite $vg$, et comme
$\angle(v,g,u)>\pi$, cela force $g'$ dans $P_g$. On retire de sa chaîne la partie $(u,v)$ déjà couverte par $g$ : il reste une seule chaîne $[a,b]$ (sinon $G$ ne serait pas minimale),
vue depuis $P_g$ sous un angle $\angle(a,g',b)\le\pi$. Le gardien raccourci est <strong>bon</strong> : on revient au cas 1. $\square$</p>
<div class="figrow four">${t54.panels.map((p, i) => `<figure>${p}<figcaption>${['(1) Chaînes maximales : les deux gardiens sont <strong>mauvais</strong> (angles &gt; π).', '(2) Lemme 5.3 : le segment $vg_1$ passe par le sommet réflexe $r$.', '(3) $g_2$ est raccourci : l\'angle devient $\\le\\pi$, il est <strong>bon</strong>.', '(4) Corollaire 4.7 : $g_2$ remplacé par un candidat de $G_P$ ; sa chaîne commence en $u_x\\in U_P$.'][i]}</figcaption></figure>`).join('')}</div>

<h2>6. Partie D — un pas glouton rapide</h2>
<h3>2.7 La chaîne visible maximale <span class="ref">(Déf. 6.1, Lemmes 6.2, 6.5 — Figure 8)</span></h3>
<div class="box def"><b>Définition 6.1.</b> Pour $g\in P$ et $m\in\partial P$ vu par $g$, $E_{g,m}$ est la plus longue suite contiguë d'arêtes contenant $m$ telle que $g$ soit à gauche de la droite support de chacune.</div>
<div class="box thm"><b>Lemme 6.2.</b> Soient $s$, $t$ le premier et le dernier sommet d'une sous-suite $E\subseteq E_{g,m}$ avec $m\in[s,t]\ne\partial P$. Soient $\pi_s$, $\pi_t$ les plus courts chemins de $s$ et $t$ à $g$,
et $r_s$, $r_t$ les rayons partant de $g$ le long de leur dernière arête. Ils touchent $[s,t]$ en $u$ et $v$, et $[u,v]$ est l'unique chaîne maximale de $[s,t]$ vue par $g$ qui contient $m$.</div>
<p><em>Preuve.</em> Le segment $gm$ coupe la région bordée par $\pi_s$, $[s,t]$, $\pi_t$ en une partie $P_s$ (côté $s$) et une partie $P_t$. Soit $u^*$ le dernier point de $[s,m]$ tel que $gu^*$
touche $\pi_s$ en plus d'un point. Le polygone délimité par $[u^*,m]$, $mg$ et $gu^*$ ne contient aucun point de $\pi_s$ ; il est donc dans $P$, et $g$ est à gauche de toutes ses arêtes :
$g$ voit $[u^*,m]$ (obs. 2.2). Les points avant $u^*$ sont cachés par $\pi_s$. Enfin $gu^*$ longe la dernière arête de $\pi_s$ (sinon on pourrait raccourcir $\pi_s$) : $u^*$ est le point
où $r_s$ touche la chaîne. Idem pour $v$. $\square$</p>
<p class="remark"><strong>Notre remarque d'implémentation.</strong> Quand la chaîne $[s,t]$ fait plus d'un tour autour de $g$, le rayon $r_t$ peut toucher $[s,t]$ <em>deux fois</em>
(par exemple quand $\pi_t$ passe par $s$). L'énoncé « les rayons touchent $[s,t]$ en $u$ et $v$ » devient ambigu ; c'est la définition de la preuve qui tranche : $u$ est le point
de $[s,m]$ le plus proche de $m$, et $v$ celui de $[m,t]$ le plus proche de $m$. Notre première version prenait le point le plus proche de $g$ et se trompait dans environ 19 % des
cas aléatoires ; avec la bonne règle, elle coïncide avec un calcul direct de visibilité sur tous nos tests.</p>
<div class="figrow"><figure>${l62}<figcaption>Lemme 6.2 : chaîne $E$ de $s$ à $t$ (noir), plus courts chemins $\pi_s$ (rouge) et $\pi_t$ (bleu), rayons, et le résultat $[u,v]$ (vert).</figcaption></figure></div>
<p><strong>Structures de données.</strong> Guibas–Hershberger [11] : après $O(n)$ prétraitement, le plus court chemin entre deux points est rendu en $O(\log n)$ sous forme de $O(\log n)$ arbres
équilibrés, ce qui donne sa dernière arête en $O(\log n)$. Hershberger–Suri [14] : le premier point du bord touché par un rayon en $O(\log n)$. Donc le lemme 6.5 coûte $O(\log n)$.</p>

<h3>2.8 Un pas glouton en $O(\log^2 n)$ <span class="ref">(Lemme 6.8 — Figure 9)</span></h3>
<p>La structure de données comporte : (1) les structures du lemme 6.2 ; (2) les noyaux de toutes les suites de $2^j$ arêtes commençant ou finissant à chaque arête, pour obtenir
le noyau de n'importe quel intervalle d'arêtes comme intersection de deux noyaux stockés ; (3) les chaînes de $G_P$ triées par début, sans les chaînes dominées.</p>
<p><strong>Requête $\mathrm{next}(u)$.</strong> (a) <em>Bons gardiens</em> : chercher la chaîne candidate $[u',v']$ contenant $u$ qui va le plus loin (recherche binaire) ; par le corollaire 4.7,
si le gardien optimal est bon, $v'\ge\mathrm{next}(u)$. (b) <em>Mauvais gardiens</em> : recherche binaire sur l'arête $e$ où pourrait finir un mauvais gardien. Pour une arête $e$ : le plus
court chemin de l'extrémité de $e$ à $u$ doit être convexe (obs. 4.8) ; si oui, on calcule $\ell_u$, on l'intersecte avec $P_E$ (deux noyaux stockés), et on applique le lemme 6.5
au premier et au dernier point de $\ell_u\cap P_E$. Le lemme 4.9 garantit qu'on trouve ainsi le mauvais gardien (ou qu'un candidat faisait déjà aussi bien).
$O(\log n)$ étapes de recherche binaire à $O(\log n)$ chacune : $O(\log^2 n)$.</p>
<div class="figrow"><figure>${ns.f}<figcaption>Polygone « deux mauvais gardiens » : le meilleur candidat de $G_P$ (bleu, gardien $c$) atteint ${ns.good.toFixed(2)} arêtes après $u$ ; le mauvais gardien $g^*$ trouvé sur $\ell_u$ atteint ${ns.best.toFixed(2)}. C'est lui qui réalise $\mathrm{next}(u)$.</figcaption></figure></div>

<h2>7. L'algorithme complet et l'algorithme optimal</h2>
<h3>2.9 Théorème 7.1 <span class="ref">(Figure 10)</span></h3>
<div class="box thm"><b>Théorème 7.1.</b> On calcule une solution optimale en $O(kn^2\log^2 n)$ temps et $O(n^2)$ espace.</div>
<ol>
<li>Si le noyau de $P$ est non vide : un gardien suffit (obs. 2.2), $O(n)$.</li>
<li>Calculer $U_P$ et la structure du lemme 6.8 : $O(n^2\log n)$.</li>
<li>Pour chacun des $O(n^2)$ départs $u\in U_P$, lancer le glouton : au plus $k+1$ pas de $O(\log^2 n)$.</li>
<li>Rendre la plus petite solution. Par le théorème 5.4, un $u\in U_P$ est le début d'une chaîne optimale, et le glouton depuis ce $u$ rend $k$ gardiens.</li>
</ol>
<p><strong>Total</strong> : $O(n^2\log n)+O(n^2)\cdot O(k)\cdot O(\log^2 n)=O(kn^2\log^2 n)$. Gain par rapport à $O(kn^5\log n)$ : un facteur $\Theta(n^3/\log n)$.</p>
<p class="remark"><strong>Observation expérimentale.</strong> Sur 373 polygones aléatoires non étoilés, en médiane 47 % des points de $U_P$ donnent déjà une solution optimale
(au minimum 4,7 %). Dans ces tests, partir des seuls sommets de $P$ suffisait toujours — mais rien ne le garantit en général : la preuve a besoin des points $u_x$,
et l'algorithme optimal de [6] utilise lui aussi « sommets + débuts de dominateurs ».</p>

<h3>2.10 Vers $\Theta(n\log n)$ <span class="ref">([6] — Figure 11)</span></h3>
<ul>
<li><strong>Ensemble de départs linéaire.</strong> Tout bon gardien est dominé par un <em>dominateur bon</em> (au plus un par paire d'indices $(i,j)$ : « segment-intersecting »
si le noyau $E[i-1,j+1]$ coupe le segment $v_iv_j$, sinon « angle-maximizing »). En ne gardant que les dominateurs non strictement dominés, il en reste $O(n)$, qui définissent
un ensemble $X$ de $O(n)$ départs. Les mauvais gardiens sont dominés par des dominateurs <em>mauvais</em> ($O(n)$ après réduction) ou <em>moches</em> (« ugly »), calculés à la volée.</li>
<li><strong>Fenêtre glissante.</strong> Les noyaux $E[i-1,j+1]$ sont maintenus quand $i$ et $j$ ne font qu'augmenter ; par dualité c'est une enveloppe convexe sous des mises à jour
« premier entré, premier sorti » (Chan–Hershberger–Pratt). On calcule $\mathrm{next}(x)$ pour tout $x\in X$ en $O(n\log n)$ au total, d'où $O(kn\log n)$.</li>
<li><strong>Supprimer $k$.</strong> $\mathrm{next}$ est une fonction par morceaux à $O(n)$ morceaux, chacun constant ou une transformation de Möbius $x\mapsto\frac{A+Bx}{C+Dx}$.
Après une révolution de taille $k'$, on sait que $k\in\{k'-1,k'\}$ ; une évaluation paresseuse dans un arbre équilibré applique $\mathrm{next}$ à tout $X$ simultanément et teste
en $O(n\log n)$ si un $x$ fait le tour avec $k'-1$ gardiens.</li>
<li><strong>Borne inférieure.</strong> Réduction depuis <em>set disjointness</em> ($\Omega(n\log n)$ dans le modèle real RAM) : on construit un polygone dont une longue arête a une
« indentation » pour chaque $a\in A$ et une « poche » pour chaque $b\in B$, gardable seulement depuis le point correspondant à $b$ ; il est gardable avec $2|B|+2$ gardiens ssi $A\cap B=\emptyset$.</li>
</ul>
<div class="figrow"><figure>${np.f}<figcaption>Graphe de $x\mapsto\mathrm{next}(x)$ (peigne, $k=${np.k}$), axes en fraction du périmètre ; pointillés : $y=x$ et $y=x+1$. Les paliers viennent de gardiens fixes, les parties courbes de gardiens qui bougent avec $x$.
Bande : taille du glouton depuis $x$ (vert $=k$, orange $=k+1$) ; traits : $U_P$, qui tombent bien dans les zones vertes.</figcaption></figure></div>

<h2>8. Répartition proposée des explications de la partie 2</h2>
<p>Suivant la remarque du professeur, nous travaillons tous les deux sur la partie 2 et nous répartissons les explications. Proposition (modifiable dans
<code>src/sections/blocks.jsx</code> et dans les attributs <code>author</code> de <code>src/sections/Part2.jsx</code>) :</p>
<table><thead><tr><th>Section</th><th>Contenu</th><th>Explique</th></tr></thead><tbody>
<tr><td>1</td><td>Le problème (bref)</td><td>Ilias</td></tr>
<tr><td>2.1, 2.2</td><td>Noyaux, glouton, borne $k+1$</td><td>Ilias</td></tr>
<tr><td>2.3, 2.4</td><td>Bons/mauvais gardiens, lemmes de remplacement, lemme 4.9</td><td>Ilias</td></tr>
<tr><td>2.5, 2.6</td><td>$G_P$, $U_P$, théorème 5.4</td><td>Jomaa</td></tr>
<tr><td>2.7, 2.8</td><td>Lemme 6.2, structure de données du lemme 6.8</td><td>Jomaa</td></tr>
<tr><td>2.9</td><td>Algorithme complet, complexité</td><td>Ilias</td></tr>
<tr><td>2.10</td><td>Algorithme optimal $\Theta(n\log n)$</td><td>Jomaa</td></tr>
<tr><td>3, 4</td><td>Jeu, bac à sable, rapport</td><td>les deux</td></tr>
</tbody></table>

<h2>Glossaire français – anglais</h2>
<table><tbody>
<tr><td>gardien contigu</td><td>contiguous guard</td><td>chaîne (du bord)</td><td>chain</td></tr>
<tr><td>noyau de visibilité</td><td>visibility core</td><td>noyau (kernel), polygone étoilé</td><td>kernel, star-shaped</td></tr>
<tr><td>droite support</td><td>supporting line</td><td>arrangement de droites</td><td>line arrangement</td></tr>
<tr><td>sommet réflexe</td><td>reflex vertex</td><td>plus court chemin</td><td>shortest path</td></tr>
<tr><td>lancer de rayon</td><td>ray shooting</td><td>révolution (du glouton)</td><td>revolution</td></tr>
</tbody></table>

<h2>Références</h2>
<ol class="refs">
<li>Biniaz, Maheshwari, Merrild, Mitchell, Odak, Polishchuk, Robson, Rysgaard, Schou, Shermer, Spalding-Jamieson, Svenning, Zheng. Polynomial-time algorithms for contiguous art gallery and related problems. SoCG 2025.</li>
<li>Merrild, Rysgaard, Schou, Svenning. The contiguous art gallery problem is solvable in polynomial time. arXiv:2412.13938.</li>
<li>Biniaz, Bose, Maheshwari, Mitchell, Odak, Polishchuk, Shermer. Contiguous boundary guarding. arXiv:2412.15053.</li>
<li>Robson, Spalding-Jamieson, Zheng. The analytic arc cover problem… arXiv:2412.15567.</li>
<li><b>de Berg, Conradi, van der Hoog, Staals. Simpler and faster contiguous art gallery. arXiv:2508.09734, 2025.</b></li>
<li>de Berg, Conradi, van der Hoog, Rotenberg. The contiguous art gallery problem is in Θ(n log n). arXiv:2511.02960.</li>
<li>Chvátal. A combinatorial theorem in plane geometry. JCTB 1975.</li>
<li>Lee, Lin. Computational complexity of art gallery problems. IEEE Trans. Inf. Theory 1986.</li>
<li>Abrahamsen, Adamaszek, Miltzow. The art gallery problem is ∃ℝ-complete. J. ACM 2022.</li>
<li>Stade. The point-boundary art gallery problem is ∃ℝ-hard. SoCG 2025.</li>
<li>Guibas, Hershberger. Optimal shortest path queries in a simple polygon. JCSS 1989.</li>
<li>Guibas, Hershberger, Leven, Sharir, Tarjan. Linear-time algorithms for visibility and shortest path problems… Algorithmica 1987.</li>
<li>Lee, Preparata. An optimal algorithm for finding the kernel of a polygon. J. ACM 1979.</li>
<li>Hershberger, Suri. A pedestrian approach to ray shooting. SODA 1993.</li>
</ol>
`;
}
