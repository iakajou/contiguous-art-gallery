// The detailed proof, split into five chapters (one page each). Text written for the web page;
// each <Sub> is one step of the proof of de Berg, Conradi, van der Hoog and Staals [5].
import React from 'react';
import { M, MD } from '../components/ui.jsx';
import { Sub, Thm, Proof, Aside, Cite } from './blocks.jsx';
import CoreWidget from '../widgets/CoreWidget.jsx';
import GreedyWidget from '../widgets/GreedyWidget.jsx';
import GoodBadWidget from '../widgets/GoodBadWidget.jsx';
import ReplaceWidget from '../widgets/ReplaceWidget.jsx';
import ArrangementWidget from '../widgets/ArrangementWidget.jsx';
import Theorem54Widget from '../widgets/Theorem54Widget.jsx';
import Lemma62Widget from '../widgets/Lemma62Widget.jsx';
import NextStepWidget from '../widgets/NextStepWidget.jsx';
import FullAlgorithmWidget from '../widgets/FullAlgorithmWidget.jsx';
import NextFunctionWidget from '../widgets/NextFunctionWidget.jsx';

export function Chapter1() {
  return (
    <>
      <Sub id="cores" num="2.1" title="Visibility cores and the one-guard case" author="ilias">
        <Thm kind="Definition" name="visibility core">
          For a set <M>E</M> of (directed) edges of <M>P</M>, the <strong>visibility core</strong> <M>P_E</M> is the set of points of the plane that
          lie left of, or on, the supporting line of every edge of <M>E</M>. It is an intersection of half-planes, hence a convex polygon (possibly
          unbounded or empty).
        </Thm>
        <Thm kind="Observation" name="2.1">
          If <M>(g,[u,v])</M> is a contiguous guard, then <M>g</M> lies in the visibility core <M>P_E</M> of the set <M>E</M> of edges met by the open chain <M>(u,v)</M>.
        </Thm>
        <p>
          Indeed, if <M>g</M> were strictly to the right of an edge <M>e</M>, it would look at <M>e</M> "from behind": a segment from <M>g</M> to a point
          in the relative interior of <M>e</M> arrives from the exterior side of <M>e</M>, so it cannot stay inside <M>P</M>. Conversely, for a whole
          polygon <M>Q</M>, every point of its core (the intersection of the half-planes of <em>all</em> its edges) sees all of <M>Q</M>: this is the
          classical <em>kernel</em> of <M>Q</M>.
        </p>
        <Thm kind="Observation" name="2.2">
          One contiguous guard can see all of <M>\partial P</M> if and only if the visibility core of all edges of <M>P</M> (its kernel) is non-empty,
          i.e. if and only if <M>P</M> is star-shaped. This can be checked in linear time <Cite k="13" />.
        </Thm>
        <p>
          Observation 2.2 is used again and again below, not for <M>P</M> itself but for small polygons built inside <M>P</M>: to prove that a point{' '}
          <M>c</M> sees a chain <M>[u,v]</M>, we exhibit a polygon <M>{'Q \\subseteq P'}</M> whose boundary contains <M>[u,v]</M> and show that{' '}
          <M>c</M> lies in its kernel. From now on we assume <M>{'k \\ge 2'}</M>.
        </p>
        <CoreWidget />
      </Sub>

      <Sub id="greedy" num="2.2" title="The greedy algorithm" author="ilias">
        <p>
          For a point <M>u \in \partial P</M>, let <M>{'\\mathrm{next}(u)'}</M> be the farthest point <M>v</M> (counter-clockwise from <M>u</M>) such that
          some guard <M>g</M> sees the whole chain <M>[u,v]</M>. The <strong>greedy algorithm from <M>u</M></strong> takes the guard realising{' '}
          <M>{'\\mathrm{next}(u)'}</M>, then restarts from <M>{'\\mathrm{next}(u)'}</M>, and so on, until the chains cover <M>\partial P</M>. Call the result <M>G_u</M>.
        </p>
        <Thm kind="Lemma" name="greedy, proof of Theorem 7.1">
          For every <M>u \in \partial P</M>, <M>{'|G_u| \\le k+1'}</M>. If some optimal solution contains a guard whose chain <em>starts</em> at <M>u</M>,
          then <M>|G_u| = k</M>.
        </Thm>
        <Proof title="Proof (greedy stays ahead)">
          <p>
            Fix an optimal solution <M>G^*</M> and number its chains <M>{'[u^*_0,v^*_0], [u^*_1,v^*_1], \\dots'}</M> along the boundary, starting
            with the chain that contains <M>u</M> (index 0). Let <M>{'[u_1,v_1],[u_2,v_2],\\dots'}</M> be the chains of <M>G_u</M>, with <M>u_1 = u</M>{' '}
            and <M>{'u_{i+1} = v_i'}</M>. We show <M>{'v_i \\ge v^*_{i-1}'}</M> by induction. The guard of chain 0 sees <M>{'[u, v^*_0]'}</M>, so{' '}
            <M>{'v_1 = \\mathrm{next}(u) \\ge v^*_0'}</M>. If <M>{'v_i \\ge v^*_{i-1}'}</M>, then either <M>{'u_{i+1} = v_i > v^*_i'}</M> (and we are
            done), or <M>{'u_{i+1} \\in [u^*_i, v^*_i]'}</M> because consecutive optimal chains touch; then the <M>i</M>-th optimal guard sees{' '}
            <M>{'[u_{i+1}, v^*_i]'}</M>, hence <M>{'v_{i+1} = \\mathrm{next}(u_{i+1}) \\ge v^*_i'}</M>.
            After <M>k+1</M> steps, <M>{'v_{k+1} \\ge v^*_k'}</M>, which is <M>{'v^*_0'}</M> after a full turn, so the boundary is covered.
            If <M>u</M> is the start of an optimal chain we can number that chain 1 instead of 0, and the same induction gives{' '}
            <M>{'v_i \\ge v^*_i'}</M>, so <M>k</M> greedy guards suffice.
          </p>
        </Proof>
        <p>
          So the greedy algorithm is always within one guard of the optimum; the whole difficulty is to find a good starting point. Merrild et al.{' '}
          <Cite k="2" /> restart the greedy <M>O(kn^3)</M> times. The key contribution of <Cite k="5" /> is a set <M>U_P</M> of only <M>O(n^2)</M>{' '}
          starting points, one of which is guaranteed to be the start of an optimal chain.
        </p>
        <GreedyWidget />
      </Sub>

    </>
  );
}

export function Chapter2() {
  return (
    <>
      <Sub id="goodbad" num="2.3" title="Good and bad guards" author="ilias">
        <p>
          To discretise the possible solutions, the paper splits contiguous guards in two classes. Intuitively a guard is <em>good</em> if the angle{' '}
          <M>{'\\angle(u,g,v)'}</M> under which it sees its chain is at most <M>\pi</M>, and <em>bad</em> if it sees "around" an obstacle, with an angle larger
          than <M>\pi</M>. The precise definition has four conditions.
        </p>
        <Thm kind="Definition" name="4.1">
          A contiguous guard <M>(g,[u,v])</M> is <strong>bad</strong> if (I) the open chain <M>(u,v)</M> contains a vertex of <M>P</M>,
          (II) <M>{'u \\neq g'}</M> and <M>{'v \\neq g'}</M>, (III) <M>{'\\angle(v,g,u) > \\pi'}</M>, and (IV) the shortest path from <M>u</M> to <M>v</M>{' '}
          in <M>P</M> is not a single segment. It is <strong>good</strong> otherwise.
        </Thm>
        <Thm kind="Observation" name="4.8">
          If <M>g</M> sees <M>u</M> and <M>v</M> and <M>{'\\angle(v,g,u) > \\pi'}</M>, then the shortest path from <M>u</M> to <M>v</M> in <M>P</M> is a convex,
          left-turning chain.
        </Thm>
        <p>
          The angle is measured counter-clockwise from the direction of <M>u</M> to the direction of <M>v</M>: since <M>g</M> lies left of every edge of
          the chain, the chain turns counter-clockwise around <M>g</M>. In the figure below, the default guard of the notched room sees almost the whole
          room, more than a half turn around it: it is bad.
        </p>
        <GoodBadWidget />
      </Sub>

      <Sub id="replace" num="2.4" title="Replacing guards by arrangement vertices" author="ilias">
        <p>
          Let <M>C_P</M> be the arrangement of the <M>n</M> lines supporting the edges of <M>P</M>. It has <M>O(n^2)</M> vertices. The goal of this
          part is to show that a good guard can always be moved to a vertex of <M>C_P</M> without losing any of its chain. Throughout, <M>E</M> is the set of
          edges met by <M>(u,v)</M>, <M>P_E</M> its visibility core, and <M>P_g</M> the polygon bounded by the segment <M>gu</M>, the chain <M>[u,v]</M> and
          the segment <M>vg</M>.
        </p>
        <Thm kind="Proposition" name="4.3">
          Let <M>(g,[u,v])</M> be a contiguous guard such that <M>[u,v]</M> contains a vertex of <M>P</M>. Then either a vertex of <M>P_E</M> lies in{' '}
          <M>P_g</M>, or a vertex of <M>P</M> in <M>[u,v]</M> lies in <M>P_E</M>.
        </Thm>
        <Proof>
          <p>
            The boundary of <M>P_E</M> is a convex chain <M>C</M>. Since <M>{'g \\in P_E'}</M> while <M>u</M> and <M>v</M> are on the supporting lines of the
            first and last edges, <M>C</M> crosses the segments <M>gu</M> and <M>vg</M>; let <M>C'</M> be its part inside <M>P_g</M>. If <M>C'</M> contains
            no vertex of <M>P_E</M>, it is part of a single edge of <M>P_E</M>, which lies on the supporting line of some <M>e \in E</M>. That segment cuts{' '}
            <M>P_g</M> and the edge <M>e</M> itself belongs to <M>[u,v]</M>, so one endpoint of <M>e</M> lies on <M>C'</M>, hence in <M>P_E</M>.
          </p>
        </Proof>
        <p>
          The point found by Proposition 4.3 is in <M>P_E</M> (left of every edge of the chain). If it is also left of <M>gu</M> and <M>vg</M>, it lies in the
          kernel of <M>P_g</M> and therefore sees all of <M>[u,v]</M> by Observation 2.2. This is precisely what each failing condition of Definition 4.1 provides:
        </p>
        <ul>
          <li><strong>Lemma 4.2 (I fails).</strong> <M>(u,v)</M> lies inside one edge <M>ab</M>: the vertex <M>a</M> sees the whole edge.</li>
          <li><strong>Lemma 4.4 (II fails).</strong> <M>g = u</M>: then <M>P_g</M> is bounded by <M>[u,v]</M> and the segment <M>vu</M>, and everything inside lies left of <M>vu</M>.</li>
          <li><strong>Lemma 4.5 (III fails).</strong> <M>{'\\angle(v,g,u) \\le \\pi'}</M>: then <M>P_g</M> lies left of both <M>gu</M> and <M>vg</M>.</li>
          <li><strong>Lemma 4.6 (IV fails).</strong> <M>u</M> sees <M>v</M>: work in the polygon <M>{'P\' \\supseteq P_g'}</M> bounded by <M>[u,v]</M> and <M>vu</M>, whose core is <M>{'P_E \\cap P\''}</M>.</li>
        </ul>
        <Thm kind="Corollary" name="4.7">
          For every good guard <M>(g,[u,v])</M> there is a contiguous guard <M>(c,[u,v])</M> where <M>c</M> is a vertex of the arrangement <M>C_P</M>, defined by
          the supporting lines of two edges <M>e_1, e_2</M>. Unless <M>[u,v]</M> contains no vertex of <M>P</M>, <M>[u,v]</M> contains a vertex of both <M>e_1</M> and <M>e_2</M>.
        </Thm>
        <p>
          For a <strong>bad</strong> guard this fails: the vertex of <M>P_E</M> inside <M>P_g</M> may be hidden from <M>u</M> by the obstacle the guard looks around.
          The paper still describes where a replacement can be found, but the answer depends on the start point <M>u</M>:
        </p>
        <Thm kind="Lemma" name="4.9">
          Let <M>(g,[u,v])</M> be a bad guard with <M>v</M> on the edge <M>{'v_j v_{j+1}'}</M>, and let <M>{'\\ell_u'}</M> be the supporting line of the last edge of the
          shortest path from <M>{'v_{j+1}'}</M> to <M>u</M>. Then a vertex of <M>P_E</M>, or the first or the last point of <M>{'\\ell_u'}</M> inside <M>P_E</M>, also sees <M>[u,v]</M>.
        </Thm>
        <Proof>
          <p>
            Let <M>S_v</M> be the shortest path from <M>v</M> to <M>u</M>; it is convex (Observation 4.8), so its visibility core is the intersection of the half-planes
            left of the lines <M>{'\\ell_v'}</M> and <M>{'\\ell_u'}</M> supporting its first and last edges. The polygon <M>P_v</M> bounded by <M>S_v</M> and <M>[u,v]</M> therefore
            has core <M>{"P' = P_E \\cap \\{\\text{left of } \\ell_u, \\ell_v\\}"}</M>, which contains <M>g</M>. If an endpoint of <M>{'\\ell_u \\cap P_E'}</M> is in <M>P'</M>, it is in the kernel
            of <M>P_v</M> and sees <M>[u,v]</M>. Otherwise <M>P'</M> is bounded and one of its vertices is a vertex of <M>P_E</M> (or of <M>P</M>), which sees <M>[u,v]</M> for the same reason.
          </p>
        </Proof>
        <ReplaceWidget />
      </Sub>

    </>
  );
}

export function Chapter3() {
  return (
    <>
      <Sub id="discrete" num="2.5" title="Discretisation: candidate guards and start points" author="jomaa">
        <p>
          Corollary 4.7 suggests putting guards only on the vertices of <M>C_P</M>. A fixed point <M>c</M> sees a fixed set of maximal chains of the boundary, so
          the following finite sets are well defined.
        </p>
        <Thm kind="Definition" name="5.1, candidate guards">
          For every vertex <M>c</M> of <M>C_P</M>, defined by the edges <M>ab</M> and <M>ef</M>, and for every <M>{'x \\in \\{a,b,e,f\\}'}</M> seen by <M>c</M>, let{' '}
          <M>{'[u_x,v_x]'}</M> be the unique inclusion-wise maximal chain seen by <M>c</M> that contains <M>x</M>. The set <M>G_P</M> contains all these guards <M>{'(c,[u_x,v_x])'}</M>.
        </Thm>
        <Thm kind="Definition" name="5.2, start points">
          <M>U_P</M> consists of all vertices of <M>P</M> and all start points <M>u_x</M> of guards of <M>G_P</M>. Both sets have size <M>O(n^2)</M>.
        </Thm>
        <p>
          The paper computes <M>G_P</M> in <M>O(n^2 \log n)</M> time (Lemma 6.6) by walking through the arrangement: it maintains, in a balanced tree, the bit string
          telling on which side of each supporting line the current vertex lies (it changes in at most two positions between neighbouring vertices). At each vertex{' '}
          <M>c</M> and endpoint <M>x</M>, a shortest-path query tests whether <M>c</M> sees <M>x</M>, the tree gives the maximal run of edges having <M>c</M> on their left
          (<M>{'E_{c,x}'}</M>, Definition 6.1), and Lemma 6.5 (next sections) returns <M>{'[u_x, v_x]'}</M> in <M>O(\log n)</M> time.
        </p>
        <ArrangementWidget />
      </Sub>

      <Sub id="thm54" num="2.6" title={<>Theorem 5.4: an optimal solution starts in <M>U_P</M></>} author="jomaa">
        <Thm kind="Lemma" name="5.3">
          Let <M>(g,[u,v])</M> be a contiguous guard such that <M>{'[u,v] \\neq \\partial P'}</M> is maximal. Then either <M>v</M> is a reflex vertex of <M>P</M>, or the segment{' '}
          <M>vg</M> contains a reflex vertex of <M>P</M> in its interior.
        </Thm>
        <p>
          Indeed, just after <M>v</M> the boundary is no longer visible from <M>g</M>, so the shortest paths from <M>g</M> to the points just after <M>v</M> bend
          at a reflex vertex; it is either <M>v</M> itself or a vertex lying on the segment <M>vg</M>.
        </p>
        <Thm kind="Theorem" name="5.4">
          Let <M>G</M> be a minimum set of contiguous guards covering <M>\partial P</M>, with <M>|G| &gt; 1</M>. There is a set <M>G'</M> with <M>|G'| = |G|</M> covering{' '}
          <M>\partial P</M> in which some guard <M>(g,[u,v])</M> has <M>{'u \\in U_P'}</M>.
        </Thm>
        <Proof>
          <p>First extend every chain of <M>G</M> to the maximal chain its guard sees.</p>
          <p>
            <strong>Some guard is good.</strong> If its chain contains no vertex, replace it by a vertex guard (Lemma 4.2): its chain starts at a vertex of{' '}
            <M>P</M>. Otherwise Corollary 4.7 gives an arrangement vertex <M>c</M> seeing the same chain <M>[u,v]</M>, where <M>[u,v]</M> contains an endpoint <M>x</M> of a
            defining edge of <M>c</M>. The candidate <M>{'(c,[u_x,v_x]) \\in G_P'}</M> sees the maximal chain through <M>x</M>, which contains <M>[u,v]</M>. Use it instead:
            its chain starts at <M>{'u_x \\in U_P'}</M>.
          </p>
          <p>
            <strong>All guards are bad.</strong> Take one, <M>(g,[u,v])</M>. If <M>u</M> is a vertex we are done; if <M>v</M> is a vertex, the next guard can be shortened
            to start at <M>v</M>. Otherwise, by Lemma 5.3, <M>vg</M> passes through a reflex vertex <M>r</M> outside <M>[u,v]</M>, and another guard <M>{"(g',[u',v'])"}</M>{' '}
            sees <M>r</M> in the interior of its chain. Then <M>g'</M> is left of both edges at <M>r</M>, hence left of the line <M>vg</M>, and since{' '}
            <M>{'\\angle(v,g,u) > \\pi'}</M> this forces <M>g'</M> into <M>P_g</M>. Remove from its chain the part <M>(u,v)</M> that <M>g</M> already covers: the rest is a single
            chain <M>[a,b]</M> (otherwise <M>G</M> would not be minimal) and from inside <M>P_g</M> it is seen under an angle <M>{"\\angle(a,g',b) \\le \\pi"}</M>. The shortened
            guard is good, and we are back in the first case.
          </p>
        </Proof>
        <Theorem54Widget />
      </Sub>

    </>
  );
}

export function Chapter4() {
  return (
    <>
      <Sub id="lemma62" num="2.7" title="Computing a maximal visible chain" author="jomaa">
        <p>
          Both the computation of <M>G_P</M> and the greedy steps need the maximal chain seen by a point <M>g</M> that contains a given boundary point <M>m</M>.
          Computing the whole visibility polygon of <M>g</M> would cost <M>O(n)</M>; the paper does it in <M>O(\log n)</M>.
        </p>
        <Thm kind="Definition" name="6.1">
          For <M>g \in P</M> and <M>m \in \partial P</M> seen by <M>g</M>, <M>{'E_{g,m}'}</M> is the maximal contiguous sequence of edges containing <M>m</M> such that <M>g</M>{' '}
          lies left of the supporting line of each of them.
        </Thm>
        <Thm kind="Lemma" name="6.2">
          Let <M>s</M> and <M>t</M> be the first and last vertices of <M>{'E \\subseteq E_{g,m}'}</M> with <M>{'m \\in [s,t] \\neq \\partial P'}</M>. Let <M>\pi_s</M> (resp.{' '}
          <M>\pi_t</M>) be the shortest path from <M>s</M> (resp. <M>t</M>) to <M>g</M>, and <M>r_s</M> (resp. <M>r_t</M>) the ray from <M>g</M> through its last edge. The rays
          hit <M>[s,t]</M> in <M>u</M> and <M>v</M>, and <M>[u,v]</M> is the unique maximal chain inside <M>[s,t]</M> that is visible from <M>g</M> and contains <M>m</M>.
        </Thm>
        <Proof>
          <p>
            The segment <M>gm</M> splits the region bounded by <M>\pi_s</M>, <M>[s,t]</M> and <M>\pi_t</M> into a part <M>P_s</M> containing <M>s</M> and a part <M>P_t</M>.
            Let <M>u^*</M> be the last point of <M>[s,m]</M> such that <M>gu^*</M> touches <M>\pi_s</M> in more than one point. The polygon bounded by <M>[u^*,m]</M>, <M>mg</M>{' '}
            and <M>gu^*</M> contains no point of <M>\pi_s</M>, so it lies in <M>P</M>, and <M>g</M> is in its kernel: <M>g</M> sees <M>[u^*,m]</M>. Points before <M>u^*</M> are
            hidden by <M>\pi_s</M>. Finally <M>gu^*</M> must run along the last edge of <M>\pi_s</M> (otherwise <M>\pi_s</M> could be shortened), so <M>u^*</M> is where <M>r_s</M>{' '}
            hits the chain. The same holds for <M>v</M>.
          </p>
        </Proof>
        <Aside title="A detail we noticed while implementing it.">
          When the chain <M>[s,t]</M> winds more than once around <M>g</M>, the ray <M>r_t</M> can hit <M>[s,t]</M> <em>twice</em> (for instance when <M>\pi_t</M> passes through{' '}
          <M>s</M>). The statement "the rays hit <M>[s,t]</M> in <M>u</M> and <M>v</M>" is then ambiguous, but the proof's definition settles it: <M>u</M> is the hit in <M>[s,m]</M>{' '}
          closest to <M>m</M>, and <M>v</M> the hit in <M>[m,t]</M> closest to <M>m</M>. Our first implementation took the hit closest to <M>g</M> and was wrong in about 19% of
          our random tests; with the rule above it agrees with a direct visibility computation in all 6541 test cases.
        </Aside>
        <p>
          With the shortest-path structure of Guibas and Hershberger <Cite k="11" /> (each path is returned as <M>O(\log n)</M> balanced trees, so its last edge is found
          in <M>O(\log n)</M>) and the ray-shooting structure of Hershberger and Suri <Cite k="14" />, this is <M>O(\log n)</M> per query (Lemma 6.5).
        </p>
        <Lemma62Widget />
      </Sub>

      <Sub id="nextstep" num="2.8" title={<>One greedy step in <M>{'O(\\log^2 n)'}</M></>} author="jomaa">
        <Thm kind="Lemma" name="6.8">
          After <M>O(n^2 \log n)</M> preprocessing and with <M>O(n^2)</M> space, for any <M>{'u \\in \\partial P'}</M> one can compute <M>{'\\mathrm{next}(u)'}</M> and a guard realising it in{' '}
          <M>O(\log^2 n)</M> time.
        </Thm>
        <p>The data structure has three parts:</p>
        <ol>
          <li>the shortest-path and ray-shooting structures of Lemma 6.2;</li>
          <li>the visibility cores of all chains of <M>2^j</M> consecutive edges starting or ending at each edge (<M>O(n \log n)</M> convex polygons, <M>O(n^2)</M> space), so that the core of any range of edges is the intersection of two stored cores;</li>
          <li>the chains of <M>G_P</M>, sorted by start point, with dominated chains removed, so that the farthest-reaching candidate chain containing <M>u</M> is found by binary search.</li>
        </ol>
        <p>
          A query first looks up the best candidate chain <M>{"[u', v']"}</M> containing <M>u</M>. By Corollary 4.7, if the guard realising <M>{'\\mathrm{next}(u)'}</M> is good,
          then <M>{"v' \\ge \\mathrm{next}(u)"}</M>. To catch bad guards, the query binary-searches the edge <M>e</M> on which a bad guard could end: the shortest path from the end
          of <M>e</M> to <M>u</M> must be convex (Observation 4.8); if it is, compute <M>{'\\ell_u'}</M>, intersect it with <M>P_E</M> (two stored cores), and apply Lemma 6.5 to the first and last
          points of <M>{'\\ell_u \\cap P_E'}</M>. Lemma 4.9 guarantees that this finds the bad guard (or that a candidate already did as well).
        </p>
        <NextStepWidget />
      </Sub>

      <Sub id="full" num="2.9" title="The complete algorithm and its running time" author="ilias">
        <Thm kind="Theorem" name="7.1">
          Given a simple polygon <M>P</M> with <M>n</M> vertices, a minimum set of <M>k</M> contiguous guards covering <M>\partial P</M> can be computed in{' '}
          <M>O(kn^2 \log^2 n)</M> time and <M>O(n^2)</M> space.
        </Thm>
        <ol>
          <li>If the kernel of <M>P</M> is non-empty, return one guard in it (<M>k=1</M>, Observation 2.2).</li>
          <li>Compute <M>U_P</M> and the data structure of Lemma 6.8 in <M>O(n^2 \log n)</M> time.</li>
          <li>For each of the <M>O(n^2)</M> points <M>{'u \\in U_P'}</M>, run the greedy algorithm: <M>O(k)</M> steps of <M>O(\log^2 n)</M> each.</li>
          <li>Return the smallest solution. By Theorem 5.4 some <M>{'u \\in U_P'}</M> starts an optimal chain, and the greedy from that <M>u</M> returns <M>k</M> guards.</li>
        </ol>
        <table className="tbl">
          <thead><tr><th>Step</th><th>Paper</th><th>Our implementation (JavaScript, this page)</th></tr></thead>
          <tbody>
            <tr><td>kernel test</td><td><M>O(n)</M> <Cite k="13" /></td><td><M>O(n^2)</M> half-plane clipping</td></tr>
            <tr><td>shortest paths</td><td><M>O(\log n)</M> query <Cite k="11" /></td><td>visibility graph + Floyd–Warshall, <M>O(n^3)</M> preprocessing</td></tr>
            <tr><td>maximal visible chain</td><td><M>O(\log n)</M> (Lemma 6.5)</td><td>exact visibility of all boundary pieces, <M>O(n^2)</M>–<M>O(n^3)</M></td></tr>
            <tr><td><M>G_P</M>, <M>U_P</M></td><td><M>O(n^2 \log n)</M></td><td>one visibility computation per arrangement vertex</td></tr>
            <tr><td>greedy step</td><td><M>O(\log^2 n)</M> with binary search</td><td>linear scan over the edges, memoised</td></tr>
            <tr><td>total</td><td><M>O(kn^2 \log^2 n)</M></td><td>polynomial; under a second for <M>{'n \\le 40'}</M></td></tr>
          </tbody>
        </table>
        <FullAlgorithmWidget />
      </Sub>

    </>
  );
}

export function Chapter5() {
  return (
    <>
      <Sub id="optimal" num="2.10" title={<>Towards the optimal <M>{'\\Theta(n \\log n)'}</M> algorithm</>} author="jomaa">
        <p>
          A few months later, de Berg, Conradi, van der Hoog and Rotenberg <Cite k="6" /> closed the problem with a <M>\Theta(n \log n)</M> bound. We only sketch
          the main ideas.
        </p>
        <ul>
          <li>
            <strong>Linear-size start set.</strong> Good guards are dominated by <em>good dominators</em>, at most one per pair of edge indices <M>(i,j)</M>: a{' '}
            <em>segment-intersecting</em> dominator (when the core <M>{'E[i-1,j+1]'}</M> crosses the segment <M>{'v_i v_j'}</M>) or an <em>angle-maximising</em> one. Keeping only the
            dominators that are not strictly dominated leaves <M>O(n)</M> of them, which define a start set <M>X</M> of size <M>O(n)</M> (instead of <M>{'U_P'}</M> of size <M>O(n^2)</M>).
            Bad guards are dominated by <em>bad</em> dominators (<M>O(n)</M> after reduction) or by <em>ugly</em> ones, computed on the fly.
          </li>
          <li>
            <strong>Sliding window.</strong> The cores <M>{'E[i-1,j+1]'}</M> are maintained while <M>i</M> and <M>j</M> only increase. By duality this is a convex hull under
            first-in-first-out updates (Chan, Hershberger and Pratt), so <M>{'\\mathrm{next}(x)'}</M> can be computed for all <M>{'x \\in X'}</M> in <M>O(n \log n)</M> total time,
            giving <M>O(kn \log n)</M>.
          </li>
          <li>
            <strong>Removing <M>k</M>.</strong> <M>{'\\mathrm{next}'}</M> is a piecewise function with only <M>O(n)</M> pieces, each constant or a Möbius transformation{' '}
            <M>{'x \\mapsto \\frac{A+Bx}{C+Dx}'}</M> (an earlier analysis gave <M>O(n^3)</M> pieces <Cite k="4" />). After one revolution of size <M>k'</M>, we know{' '}
            <M>{"k \\in \\{k'-1, k'\\}"}</M>; a lazy evaluation in a balanced tree applies <M>{'\\mathrm{next}'}</M> to all of <M>X</M> simultaneously and checks in{' '}
            <M>O(n \log n)</M> time whether some <M>x</M> completes a revolution with <M>k'-1</M> guards.
          </li>
          <li>
            <strong>Lower bound.</strong> A reduction from <em>set disjointness</em>, which needs <M>\Omega(n\log n)</M> comparisons in the real RAM: for sets <M>A</M>, <M>B</M>,
            build a polygon whose long edge has an indent for every <M>{'a \\in A'}</M> and a pocket for every <M>{'b \\in B'}</M> that can only be guarded from the point
            corresponding to <M>b</M>; it can be guarded with <M>2|B|+2</M> guards if and only if <M>{'A \\cap B = \\emptyset'}</M>.
          </li>
        </ul>
        <p>
          The figure below shows the function <M>{'\\mathrm{next}'}</M> computed by our implementation, and the revolutions that the greedy algorithm follows. It also
          shows which start points are good: the green band is the set of starts from which greedy is optimal; the points of <M>U_P</M> (teal ticks) always hit it.
        </p>
        <NextFunctionWidget />
      </Sub>

    </>
  );
}

export { MD };
