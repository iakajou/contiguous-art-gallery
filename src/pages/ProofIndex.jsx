import React from 'react';
import { link } from '../router.js';
import { M } from '../components/ui.jsx';
import { AUTHORS } from '../sections/blocks.jsx';
import { CHAPTERS } from './ChapterPage.jsx';
import { Reveal } from '../anim/motion.jsx';

const STEPS = [
  { chapter: 1, label: 'Greedy is almost optimal', items: ['Visibility cores (Obs. 2.1, 2.2)', 'Greedy: k + 1 anywhere, k from a good start'] },
  { chapter: 2, label: 'Good and bad guards', items: ['Definition 4.1', 'Good guard → arrangement vertex (Cor. 4.7)', 'Bad guard → point on ℓu (Lemma 4.9)'] },
  { chapter: 3, label: 'Few starts suffice', items: [<>Candidates <M>G_P</M>, starts <M>U_P</M></>, <>Theorem 5.4: an optimal chain starts in <M>U_P</M></>], key: true },
  { chapter: 4, label: 'Fast greedy steps', items: ['Lemma 6.2: 2 shortest paths + 2 rays', 'Lemma 6.8: next(u) in O(log² n)', 'Theorem 7.1: O(k n² log² n)'], key: true },
];

export default function ProofIndex() {
  return (
    <div className="page-proof">
      <section className="page-hero">
        <div className="wrap">
          <div className="eyebrow">The proof, step by step</div>
          <h1>How to guard every wall <em>with the fewest cameras</em></h1>
          <p className="page-lead">
            For a simple polygon (no holes), the algorithm of de Berg, Conradi, van der Hoog and Staals runs a greedy algorithm from <M>O(n^2)</M> well-chosen starting points and keeps the
            best solution. Five short chapters explain why this works, each with interactive figures computed live by our implementation.
          </p>
        </div>
      </section>

      <section className="wrap">
        <Reveal className="flow">
          {STEPS.map((s, i) => (
            <a key={s.chapter} href={link(`/proof/${s.chapter}`)} className={`flow-step ${s.key ? 'flow-key' : ''}`} style={{ '--i': i }}>
              <div className="flow-num">{i + 1}</div>
              <div className="flow-label">{s.label}</div>
              <ul>{s.items.map((it, j) => <li key={j}>{it}</li>)}</ul>
            </a>
          ))}
        </Reveal>

        <div className="chapter-grid">
          {CHAPTERS.map((c, i) => (
            <Reveal key={c.id} delay={i * 80}>
              <a href={link(`/proof/${c.id}`)} className={`chapter-card hue-${c.hue}`}>
                <div className="cc-top"><span className="cc-num">{String(c.id).padStart(2, '0')}</span><span className="cc-arrow">→</span></div>
                <h3>{c.title}</h3>
                <p>{c.lead}</p>
                <div className="cc-foot">
                  <span>{c.sections.length} section{c.sections.length > 1 ? 's' : ''}</span>
                  <span>{AUTHORS[c.author]}</span>
                </div>
              </a>
            </Reveal>
          ))}
        </div>
      </section>
    </div>
  );
}
