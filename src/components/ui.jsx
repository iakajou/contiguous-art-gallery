import React, { useMemo, useState } from 'react';
import katex from 'katex';
import { PRESETS } from '../geometry/presets.js';
import { polygonFromArray } from '../geometry/polygon.js';
import { Solver } from '../geometry/solver.js';

/** Inline math. */
export function M({ children }) {
  const html = useMemo(() => katex.renderToString(String(children), { throwOnError: false }), [children]);
  return <span className="m" dangerouslySetInnerHTML={{ __html: html }} />;
}

/** Display math. */
export function MD({ children }) {
  const html = useMemo(() => katex.renderToString(String(children), { throwOnError: false, displayMode: true }), [children]);
  return <div className="md" dangerouslySetInnerHTML={{ __html: html }} />;
}

// ------------------------------------------------------------ solver cache
const polyCache = new Map();
const solverCache = new Map();

export function presetPolygon(id) {
  if (!polyCache.has(id)) polyCache.set(id, polygonFromArray(PRESETS[id].points));
  return polyCache.get(id);
}

export function solverFor(P) {
  let s = solverCache.get(P);
  if (!s) { s = new Solver(P); solverCache.set(P, s); }
  return s;
}

const solveCache = new WeakMap();
/** Memoised optimal solution of a polygon (computed synchronously, cached). */
export function solutionFor(P) {
  let r = solveCache.get(P);
  if (!r) { r = solverFor(P).solve(); solveCache.set(P, r); }
  return r;
}

// ------------------------------------------------------------ widgets frame
export class Boundary extends React.Component {
  constructor(props) { super(props); this.state = { err: null }; }
  static getDerivedStateFromError(err) { return { err }; }
  componentDidCatch(err) { console.error(err); }
  render() {
    if (this.state.err) {
      return <div className="note">This figure hit an error ({String(this.state.err.message || this.state.err)}). <button type="button" className="btn" onClick={() => this.setState({ err: null })}>Retry</button></div>;
    }
    return this.props.children;
  }
}

export function Widget({ title, children, controls, caption, id, tag }) {
  return (
    <figure className="widget" id={id}>
      <div className="widget-head">
        <div className="widget-title">{tag ? <span className="widget-tag">{tag}</span> : null}{title}</div>
        {controls ? <div className="widget-controls">{controls}</div> : null}
      </div>
      <div className="widget-body"><Boundary>{children}</Boundary></div>
      {caption ? <figcaption className="widget-caption">{caption}</figcaption> : null}
    </figure>
  );
}

export function PresetPicker({ value, onChange, ids }) {
  const list = ids || Object.keys(PRESETS);
  return (
    <label className="ctl">
      <span>Polygon</span>
      <select value={value} onChange={(e) => onChange(e.target.value)}>
        {list.map((id) => <option key={id} value={id}>{PRESETS[id].label}</option>)}
      </select>
    </label>
  );
}

export function Toggle({ checked, onChange, children }) {
  return (
    <label className="ctl toggle">
      <input type="checkbox" checked={checked} onChange={(e) => onChange(e.target.checked)} />
      <span>{children}</span>
    </label>
  );
}

export function Button({ onClick, children, kind = 'default', disabled, title }) {
  return <button type="button" className={`btn btn-${kind}`} onClick={onClick} disabled={disabled} title={title}>{children}</button>;
}

/** Proof stepper: shows a list of steps, one active. */
export function Stepper({ steps, step, setStep }) {
  return (
    <div className="stepper">
      <div className="stepper-nav">
        <Button onClick={() => setStep(Math.max(0, step - 1))} disabled={step === 0}>◀ Previous</Button>
        <span className="stepper-count">Step {step + 1} / {steps.length}</span>
        <Button onClick={() => setStep(Math.min(steps.length - 1, step + 1))} disabled={step === steps.length - 1} kind="primary">Next ▶</Button>
      </div>
      <ol className="stepper-list">
        {steps.map((s, i) => (
          <li key={i} className={i === step ? 'active' : i < step ? 'done' : ''} onClick={() => setStep(i)}>
            <strong>{s.title}</strong>
            {i === step && s.body ? <div className="stepper-body">{s.body}</div> : null}
          </li>
        ))}
      </ol>
    </div>
  );
}

export function Check({ ok, children }) {
  return <li className={ok ? 'ok' : 'no'}><span className="mark">{ok ? '✓' : '✗'}</span> {children}</li>;
}

export function Badge({ kind, children }) {
  return <span className={`badge badge-${kind}`}>{children}</span>;
}

export function useLocalState(initial) {
  return useState(initial);
}

export const fmt = (t, d = 2) => (t === null || t === undefined || Number.isNaN(t) ? '–' : Number(t).toFixed(d));
export const deg = (a) => `${((a * 180) / Math.PI).toFixed(1)}°`;
