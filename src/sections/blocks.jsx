import React from 'react';
import { Boundary } from '../components/ui.jsx';
import { link } from '../router.js';

/** Who wrote which part of the explanations (edit freely). */
export const AUTHORS = {
  ilias: 'Ilias Akajou',
  jomaa: 'Jomaa Abdulrahman',
  both: 'Ilias Akajou & Jomaa Abdulrahman',
};

export function Section({ id, num, title, children, author }) {
  return (
    <section id={id} className="section">
      <h2><span className="sec-num">{num}</span> {title}</h2>
      {author ? <div className="byline">Explained by {AUTHORS[author]}</div> : null}
      {children}
    </section>
  );
}

export function Sub({ id, num, title, children, author }) {
  return (
    <section id={id} className="subsection">
      <div className="sub-head">
        <span className="sub-num">{num}</span>
        <h2>{title}</h2>
      </div>
      {author ? <div className="byline">Explained by {AUTHORS[author]}</div> : null}
      <Boundary>{children}</Boundary>
    </section>
  );
}

export function Thm({ kind = 'Theorem', name, children }) {
  const k = kind.toLowerCase();
  const cls = k.startsWith('def') ? 'def' : k.startsWith('obs') ? 'obs' : 'thm';
  return (
    <div className={`box box-${cls}`}>
      <div className="box-title"><span className="box-kind">{kind}</span>{name ? <span className="box-name">{name}</span> : null}</div>
      <div className="box-body">{children}</div>
    </div>
  );
}

export function Proof({ children, title = 'Proof sketch' }) {
  return (
    <details className="proof" open>
      <summary>{title}</summary>
      <div>{children}</div>
    </details>
  );
}

export function Aside({ children, title }) {
  return <div className="aside">{title ? <strong>{title} </strong> : null}{children}</div>;
}

export function Cite({ k }) {
  return <a className="cite" href={link('/report', { ref: k })}>[{k}]</a>;
}
