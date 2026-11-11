import React from 'react';
import { link } from '../router.js';
import { M } from '../components/ui.jsx';
import { Sub, Thm, AUTHORS, Cite } from '../sections/blocks.jsx';
import { Chapter1, Chapter2, Chapter3, Chapter4, Chapter5 } from '../sections/chapters.jsx';
import { Reveal } from '../anim/motion.jsx';

export const CHAPTERS = [
  {
    id: 1, short: 'Greedy', title: 'The greedy algorithm is almost optimal', author: 'ilias', comp: Chapter1, hue: 'indigo',
    lead: 'Visibility cores tell us when one guard is enough. The greedy algorithm is never more than one guard away from the optimum, and it is optimal when it starts at the right place.',
    sections: [['notation', 'Notation'], ['cores', '2.1 Visibility cores'], ['greedy', '2.2 The greedy algorithm']],
    refs: 'Observations 2.1, 2.2 · proof of Theorem 7.1',
  },
  {
    id: 2, short: 'Good & bad guards', title: 'Good guards, bad guards', author: 'ilias', comp: Chapter2, hue: 'rose',
    lead: 'A guard is bad when it looks around a corner. Good guards can always be slid onto a vertex of the arrangement of the supporting lines; bad guards need more care.',
    sections: [['goodbad', '2.3 Good and bad guards'], ['replace', '2.4 Replacing guards']],
    refs: 'Definition 4.1 · Proposition 4.3 · Lemmas 4.2–4.6, 4.9 · Corollary 4.7',
  },
  {
    id: 3, short: 'Few starting points', title: 'Only O(n²) starting points matter', author: 'jomaa', comp: Chapter3, hue: 'emerald',
    lead: <>The candidate guards <M>G_P</M> and the start points <M>U_P</M> form finite sets of size <M>O(n^2)</M>. Theorem 5.4 shows that some optimal solution has a chain that starts in <M>U_P</M>, even when all its guards are bad.</>,
    sections: [['discrete', '2.5 Candidates and start points'], ['thm54', '2.6 Theorem 5.4']],
    refs: 'Definitions 5.1, 5.2 · Lemma 5.3 · Theorem 5.4 · Lemma 6.6',
  },
  {
    id: 4, short: 'Fast greedy steps', title: 'One greedy step in O(log² n)', author: 'jomaa', comp: Chapter4, hue: 'amber',
    lead: 'Two shortest paths and two rays give the maximal chain a point sees. With a few precomputed structures, each greedy step costs O(log² n), and the whole algorithm O(k n² log² n).',
    sections: [['lemma62', '2.7 Maximal visible chains'], ['nextstep', '2.8 One greedy step'], ['full', '2.9 The complete algorithm']],
    refs: 'Definition 6.1 · Lemmas 6.2, 6.5, 6.8 · Theorem 7.1',
  },
  {
    id: 5, short: 'Θ(n log n)', title: 'Towards the optimal Θ(n log n)', author: 'jomaa', comp: Chapter5, hue: 'cyan',
    lead: 'A few months later the same group reached Θ(n log n): linear-size start sets, a sliding window, and the function next as O(n) Möbius pieces, with a matching lower bound.',
    sections: [['optimal', '2.10 The optimal algorithm']],
    refs: 'de Berg, Conradi, van der Hoog, Rotenberg (arXiv:2511.02960)',
  },
];

function Notation() {
  return (
    <Sub id="notation" num="2.0" title="Notation" author="ilias">
      <p>
        <M>P</M> is a simple polygon with <M>n</M> vertices <M>{'v_0, \\dots, v_{n-1}'}</M> in counter-clockwise order. Every edge is directed,{' '}
        <M>{'e_i = v_i v_{i+1}'}</M>, so the interior of <M>P</M> lies to its <em>left</em>. For <M>u, v \in \partial P</M>, the <em>chain</em> <M>[u,v]</M> is the
        part of the boundary traversed counter-clockwise from <M>u</M> to <M>v</M>, and <M>(u,v)</M> the same chain without its endpoints.
      </p>
      <Thm kind="Definition" name="contiguous guard">
        A point <M>g \in P</M> <em>sees</em> <M>q</M> if the segment <M>gq</M> is contained in the closed polygon <M>P</M> (it may slide along an edge or graze a reflex
        vertex). A <strong>contiguous guard</strong> <M>(g,[u,v])</M> is a point <M>g</M> together with a chain whose every point <M>g</M> sees. The problem asks for the
        minimum number <M>k</M> of contiguous guards whose chains cover <M>\partial P</M>; we may assume that the chains partition the boundary.
      </Thm>
      <Thm kind="Assumption" name="simple polygon">
        Throughout, <M>P</M> is a <strong>simple polygon</strong>: its boundary is a single closed curve that does not cross itself, and <M>P</M> has no holes.
        This is not a detail. (1) <M>\partial P</M> is then one cycle, so chains are intervals of a circle and the greedy argument of Section 2.2 applies.
        (2) <M>P</M> is simply connected: a closed curve inside <M>P</M> bounds a region inside <M>P</M> (used for <M>P_g \subseteq P</M> in every replacement lemma), and the
        shortest path between two points is unique (used in Lemmas 4.9, 6.2 and 6.8). With holes, a point may see two vertices without seeing the edge between them, the
        approach of <Cite k="2" /> provably fails, and whether the problem is still polynomial is an open question.
      </Thm>
    </Sub>
  );
}

export default function ChapterPage({ id }) {
  const ch = CHAPTERS.find((c) => c.id === id) || CHAPTERS[0];
  const prev = CHAPTERS.find((c) => c.id === ch.id - 1);
  const next = CHAPTERS.find((c) => c.id === ch.id + 1);
  const Comp = ch.comp;
  return (
    <div className={`chapter hue-${ch.hue}`}>
      <section className="chapter-hero">
        <div className="wrap">
          <a className="crumb" href={link('/proof')}>← The proof</a>
          <div className="chapter-num">Chapter {ch.id} <span>/ {CHAPTERS.length}</span></div>
          <h1>{ch.title}</h1>
          <p className="chapter-lead">{ch.lead}</p>
          <div className="chapter-meta">
            <span className="pill">Explained by {AUTHORS[ch.author]}</span>
            <span className="pill pill-soft">{ch.refs}</span>
          </div>
        </div>
      </section>
      <div className="wrap chapter-layout">
        <aside className="chapter-toc">
          <div className="toc-title">In this chapter</div>
          {ch.sections.map(([sid, label]) => <a key={sid} href={link(`/proof/${ch.id}`, { s: sid })}>{label}</a>)}
          <div className="toc-title toc-gap">All chapters</div>
          {CHAPTERS.map((c) => <a key={c.id} href={link(`/proof/${c.id}`)} className={c.id === ch.id ? 'active' : ''}>{c.id}. {c.short}</a>)}
        </aside>
        <article className="chapter-body prose">
          {ch.id === 1 ? <Notation /> : null}
          <Comp />
          <nav className="chapter-nav">
            {prev ? <a href={link(`/proof/${prev.id}`)} className="cn-card"><span>← Previous</span><b>{prev.id}. {prev.short}</b></a> : <span />}
            {next ? <a href={link(`/proof/${next.id}`)} className="cn-card cn-next"><span>Next →</span><b>{next.id}. {next.short}</b></a>
              : <a href={link('/play')} className="cn-card cn-next"><span>Now →</span><b>Play the game</b></a>}
          </nav>
        </article>
      </div>
    </div>
  );
}

export { Reveal };
