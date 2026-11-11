import React from 'react';
import { mod } from '../geometry/polygon.js';

/**
 * The boundary of P "cut open" at u and unrolled onto a segment of length W.
 * rows: [{label, intervals: [{a, b, color, text}] }]
 * marks: [{t, color, label}] vertical lines.
 */
export default function Strip({ P, u, rows, marks = [], W = 820, rowH = 30, showVertices = true }) {
  const L = P.perimeterLength();
  const base = P.arcLength(u);
  const X = (t) => (mod(P.arcLength(t) - base, L) / L) * W;
  const left = 110;
  const H = rows.length * rowH + 34;
  const parts = (a, b) => {
    const x1 = X(a);
    const len = ((P.arcLength(b) - P.arcLength(a)) / L) * W;
    if (len >= W - 1e-6) return [[0, W]];
    if (x1 + len <= W + 1e-6) return [[x1, Math.min(W, x1 + len)]];
    return [[x1, W], [0, x1 + len - W]];
  };
  const verts = [];
  if (showVertices) for (let i = 0; i < P.n; i++) verts.push(X(i));
  return (
    <svg className="strip" viewBox={`0 0 ${left + W + 20} ${H}`} role="img" aria-label="unrolled boundary">
      <g transform={`translate(${left},6)`}>
        <line x1={0} y1={rows.length * rowH + 4} x2={W} y2={rows.length * rowH + 4} stroke="var(--muted)" strokeWidth={1} />
        {verts.map((x, i) => <line key={i} x1={x} x2={x} y1={rows.length * rowH} y2={rows.length * rowH + 8} stroke="var(--muted)" strokeWidth={1} />)}
        <text x={0} y={rows.length * rowH + 22} fontSize={12} fill="var(--muted)">u</text>
        <text x={W} y={rows.length * rowH + 22} fontSize={12} fill="var(--muted)" textAnchor="end">u (after one full turn)</text>
        {rows.map((r, ri) => (
          <g key={ri} transform={`translate(0,${ri * rowH})`}>
            <text x={-8} y={rowH / 2 + 4} fontSize={13} textAnchor="end" fill="var(--ink)" fontWeight={600}>{r.label}</text>
            <rect x={0} y={4} width={W} height={rowH - 8} fill="var(--strip-bg)" rx={3} />
            {r.intervals.map((iv, k) => parts(iv.a, iv.b).map(([x1, x2], j) => (
              <g key={`${k}-${j}`}>
                <rect x={x1} y={5 + (iv.lane || 0) * 0} width={Math.max(1.5, x2 - x1)} height={rowH - 10} fill={iv.color} opacity={iv.opacity || 0.85} rx={3} stroke="white" strokeWidth={1} />
                {iv.text && x2 - x1 > 22 ? <text x={(x1 + x2) / 2} y={rowH / 2 + 4} fontSize={12} textAnchor="middle" fill="white" fontWeight={700}>{iv.text}</text> : null}
              </g>
            )))}
          </g>
        ))}
        {marks.map((m, i) => {
          const x = m.end ? W : X(m.t);
          return (
            <g key={i}>
              <line x1={x} x2={x} y1={0} y2={rows.length * rowH + 4} stroke={m.color || '#111'} strokeDasharray="3 3" strokeWidth={1.2} />
              {m.label ? <text x={x + 3} y={10} fontSize={11} fill={m.color || '#111'}>{m.label}</text> : null}
            </g>
          );
        })}
      </g>
    </svg>
  );
}
