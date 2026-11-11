// Shared SVG building blocks. Geometry lives in "math" coordinates (y up);
// everything is converted with S(p) = (x, -y) before drawing so that
// counter-clockwise polygons also look counter-clockwise on screen.

import React, { createContext, useContext, useRef, useCallback, useMemo, useState, useEffect } from 'react';
import { chainPoints } from '../geometry/visibility.js';

export const S = (p) => ({ x: p.x, y: -p.y });
export const pathD = (pts, closed = false) => {
  if (!pts || !pts.length) return '';
  const s = pts.map((p, i) => `${i ? 'L' : 'M'}${p.x.toFixed(2)},${(-p.y).toFixed(2)}`).join(' ');
  return closed ? `${s} Z` : s;
};

// red is reserved for errors (unseen / uncovered parts), so the guard palette avoids it
export const COLORS = ['#2563eb', '#16a34a', '#9333ea', '#d97706', '#0891b2', '#db2777', '#65a30d', '#4f46e5', '#0d9488', '#a16207', '#7c3aed', '#0369a1'];
export const colorOf = (i) => COLORS[((i % COLORS.length) + COLORS.length) % COLORS.length];

const StageCtx = createContext(null);
export const useStage = () => useContext(StageCtx);

/**
 * <Stage P={polygon}> ... </Stage>
 * Props: onBackgroundDown(p, evt), onMove(p, evt), extra (array of points to include in the view)
 */
export function Stage({ P, children, pad = 40, extra = null, onBackgroundDown, onMove, onLeave, height, cursor, ariaLabel }) {
  const svgRef = useRef(null);
  const dragRef = useRef(null);
  const b = useMemo(() => {
    let { minX, minY, maxX, maxY } = P.bbox;
    if (extra) for (const p of extra) {
      minX = Math.min(minX, p.x); maxX = Math.max(maxX, p.x);
      minY = Math.min(minY, p.y); maxY = Math.max(maxY, p.y);
    }
    return { minX: minX - pad, minY: minY - pad, maxX: maxX + pad, maxY: maxY + pad };
  }, [P, pad, extra]);
  const vbW = b.maxX - b.minX, vbH = b.maxY - b.minY;
  const toMath = useCallback((evt) => {
    const svg = svgRef.current;
    if (!svg) return null;
    const pt = svg.createSVGPoint();
    pt.x = evt.clientX; pt.y = evt.clientY;
    const m = svg.getScreenCTM();
    if (!m) return null;
    const q = pt.matrixTransform(m.inverse());
    return { x: q.x, y: -q.y };
  }, []);
  const startDrag = useCallback((evt, onDrag, onEnd) => {
    evt.stopPropagation();
    evt.preventDefault();
    dragRef.current = { onDrag, onEnd };
    try { svgRef.current.setPointerCapture(evt.pointerId); } catch (e) { /* ignore */ }
  }, []);
  // user units per CSS pixel, measured from the rendered size (so that dots and labels keep a constant size)
  const [pxW, setPxW] = useState(800);
  useEffect(() => {
    const el = svgRef.current;
    if (!el || typeof ResizeObserver === 'undefined') return undefined;
    const ro = new ResizeObserver(() => {
      const r = el.getBoundingClientRect();
      if (r.width > 0 && r.height > 0) {
        // with preserveAspectRatio="meet" the scale is limited by the tighter dimension
        const sc = Math.min(r.width / vbW, r.height / vbH);
        setPxW(Math.round(vbW * sc));
      }
    });
    ro.observe(el);
    return () => ro.disconnect();
  }, [vbW, vbH]);
  const unit = vbW / Math.max(200, pxW) * 0.9;
  const ctx = useMemo(() => ({ P, toMath, startDrag, unit, bounds: b }), [P, toMath, startDrag, unit, b]);
  return (
    <StageCtx.Provider value={ctx}>
      <svg
        ref={svgRef}
        className="stage"
        viewBox={`${b.minX} ${-b.maxY} ${vbW} ${vbH}`}
        preserveAspectRatio="xMidYMid meet"
        style={{ height: height || undefined, cursor: cursor || 'default' }}
        role="img"
        aria-label={ariaLabel || 'interactive figure'}
        onPointerDown={(e) => {
          if (dragRef.current) return;
          const p = toMath(e);
          if (p && onBackgroundDown) onBackgroundDown(p, e);
        }}
        onPointerMove={(e) => {
          const p = toMath(e);
          if (!p) return;
          if (dragRef.current) dragRef.current.onDrag(p, e);
          else if (onMove) onMove(p, e);
        }}
        onPointerUp={(e) => {
          if (dragRef.current) {
            const d = dragRef.current;
            dragRef.current = null;
            if (d.onEnd) d.onEnd(toMath(e));
            try { svgRef.current.releasePointerCapture(e.pointerId); } catch (err) { /* ignore */ }
          }
        }}
        onPointerLeave={() => { if (onLeave) onLeave(); }}
      >
        {children}
      </svg>
    </StageCtx.Provider>
  );
}

export function Poly({ pts, fill = 'var(--poly-fill)', stroke = 'var(--ink)', width = 2, opacity = 1, dash, className }) {
  if (!pts || pts.length < 2) return null;
  return <path d={pathD(pts, true)} fill={fill} stroke={stroke} strokeWidth={width} fillOpacity={opacity} strokeDasharray={dash} vectorEffect="non-scaling-stroke" strokeLinejoin="round" className={className} />;
}

export function Polyline({ pts, stroke = 'var(--ink)', width = 2, dash, opacity = 1, className, cap = 'round' }) {
  if (!pts || pts.length < 2) return null;
  return <path d={pathD(pts)} fill="none" stroke={stroke} strokeWidth={width} strokeDasharray={dash} strokeOpacity={opacity} vectorEffect="non-scaling-stroke" strokeLinejoin="round" strokeLinecap={cap} className={className} />;
}

export function Seg({ a, b, stroke = 'var(--ink)', width = 1.5, dash, opacity = 1 }) {
  if (!a || !b) return null;
  return <line x1={a.x} y1={-a.y} x2={b.x} y2={-b.y} stroke={stroke} strokeWidth={width} strokeDasharray={dash} strokeOpacity={opacity} vectorEffect="non-scaling-stroke" strokeLinecap="round" />;
}

/** The boundary chain [a, b] of P drawn as a thick polyline. */
export function Chain({ a, b, color = '#2563eb', width = 7, opacity = 0.9, dash }) {
  const { P } = useStage();
  if (a === null || a === undefined || b === null || b === undefined) return null;
  const pts = chainPoints(P, a, Math.max(a, b));
  return <Polyline pts={pts} stroke={color} width={width} opacity={opacity} dash={dash} />;
}

export function Dot({ p, r = 5, fill = 'var(--ink)', stroke = 'white', label, labelOffset = [10, 14], fontSize = 15, strokeWidth = 1.5, title }) {
  const { unit } = useStage();
  if (!p) return null;
  const R = r * unit;
  return (
    <g>
      <circle cx={p.x} cy={-p.y} r={R} fill={fill} stroke={stroke} strokeWidth={strokeWidth} vectorEffect="non-scaling-stroke">
        {title ? <title>{title}</title> : null}
      </circle>
      {label ? <Label p={p} text={label} dx={labelOffset[0]} dy={labelOffset[1]} size={fontSize} /> : null}
    </g>
  );
}

export function Label({ p, text, dx = 8, dy = -8, size = 15, color = 'var(--ink)', anchor = 'start', weight = 600, italic = true }) {
  const { unit } = useStage();
  if (!p) return null;
  return (
    <text x={p.x + dx * unit} y={-p.y - dy * unit} fontSize={size * unit} fill={color} textAnchor={anchor} fontWeight={weight} fontStyle={italic ? 'italic' : 'normal'} className="svg-label" paintOrder="stroke" stroke="var(--bg)" strokeWidth={3 * unit} strokeLinejoin="round">
      {text}
    </text>
  );
}

/** A draggable handle. `constrain(p)` maps a raw pointer position to an allowed position (or null). */
export function Handle({ p, onChange, constrain, color = '#111827', r = 8, label, labelOffset, shape = 'circle', title, onEnd, onStart }) {
  const { startDrag, unit } = useStage();
  if (!p) return null;
  const R = r * unit;
  const down = (e) => {
    if (onStart) onStart();
    startDrag(e, (q) => {
      const c = constrain ? constrain(q) : q;
      if (c) onChange(c);
    }, onEnd);
  };
  return (
    <g className="handle" onPointerDown={down} style={{ cursor: 'grab' }}>
      <circle cx={p.x} cy={-p.y} r={R * 2.2} fill="transparent" />
      {shape === 'square' ? (
        <rect x={p.x - R} y={-p.y - R} width={2 * R} height={2 * R} fill={color} stroke="white" strokeWidth={2} vectorEffect="non-scaling-stroke" />
      ) : shape === 'diamond' ? (
        <path d={`M${p.x},${-p.y - R * 1.3} L${p.x + R * 1.3},${-p.y} L${p.x},${-p.y + R * 1.3} L${p.x - R * 1.3},${-p.y} Z`} fill={color} stroke="white" strokeWidth={2} vectorEffect="non-scaling-stroke" />
      ) : (
        <circle cx={p.x} cy={-p.y} r={R} fill={color} stroke="white" strokeWidth={2} vectorEffect="non-scaling-stroke" />
      )}
      {title ? <title>{title}</title> : null}
      {label ? <Label p={p} text={label} dx={(labelOffset || [12, 12])[0]} dy={(labelOffset || [12, 12])[1]} /> : null}
    </g>
  );
}

/** A handle constrained to the boundary of P; value is the boundary parameter t. */
export function BoundaryHandle({ t, onChange, color = '#111827', label, labelOffset, r = 7, shape = 'square', title }) {
  const { P } = useStage();
  const p = P.at(t);
  return (
    <Handle
      p={p}
      r={r}
      shape={shape}
      color={color}
      label={label}
      labelOffset={labelOffset}
      title={title}
      constrain={(q) => q}
      onChange={(q) => onChange(P.closestBoundary(q).t)}
    />
  );
}

/** Infinite line through p with direction dir, clipped to the stage bounds. */
export function InfLine({ p, dir, stroke = '#64748b', width = 1, dash = '6 5', opacity = 0.8 }) {
  const { bounds } = useStage();
  const L = Math.hypot(bounds.maxX - bounds.minX, bounds.maxY - bounds.minY) * 2;
  const l = Math.hypot(dir.x, dir.y) || 1;
  const d = { x: (dir.x / l) * L, y: (dir.y / l) * L };
  return <Seg a={{ x: p.x - d.x, y: p.y - d.y }} b={{ x: p.x + d.x, y: p.y + d.y }} stroke={stroke} width={width} dash={dash} opacity={opacity} />;
}

/** Ray from p in direction dir up to point q (if given) or the stage border. */
export function Ray({ p, dir, to, stroke = '#64748b', width = 1.5, dash = '2 4' }) {
  const { bounds } = useStage();
  let end = to;
  if (!end) {
    const L = Math.hypot(bounds.maxX - bounds.minX, bounds.maxY - bounds.minY) * 2;
    const l = Math.hypot(dir.x, dir.y) || 1;
    end = { x: p.x + (dir.x / l) * L, y: p.y + (dir.y / l) * L };
  }
  return <Seg a={p} b={end} stroke={stroke} width={width} dash={dash} />;
}

/** Arc showing the CCW angle at g from direction a to direction b. */
export function AngleArc({ g, a, b, radius = 40, color = '#ea580c', fill = 'rgba(234,88,12,0.15)' }) {
  const { unit } = useStage();
  const R = radius * unit;
  const a0 = Math.atan2(a.y - g.y, a.x - g.x);
  let a1 = Math.atan2(b.y - g.y, b.x - g.x);
  let sweep = a1 - a0;
  while (sweep < 0) sweep += 2 * Math.PI;
  const steps = 48;
  const pts = [g];
  for (let i = 0; i <= steps; i++) {
    const t = a0 + (sweep * i) / steps;
    pts.push({ x: g.x + R * Math.cos(t), y: g.y + R * Math.sin(t) });
  }
  return (
    <g>
      <path d={pathD(pts, true)} fill={fill} stroke="none" />
      <Polyline pts={pts.slice(1)} stroke={color} width={2} />
    </g>
  );
}

/** Region (convex polygon) drawn with a fill only. */
export function Region({ pts, fill = 'rgba(22,163,74,0.18)', stroke = '#16a34a', width = 1.5, dash }) {
  if (!pts || pts.length < 3) return null;
  return <path d={pathD(pts, true)} fill={fill} stroke={stroke} strokeWidth={width} strokeDasharray={dash} vectorEffect="non-scaling-stroke" />;
}

/** Polygon outline with vertex dots; reflex vertices are hollow. */
export function PolygonView({ P, fill = 'var(--poly-fill)', showVertices = true, vertexLabels = false, showReflex = true, stroke = 'var(--ink)' }) {
  return (
    <g>
      <Poly pts={P.pts} fill={fill} stroke={stroke} width={2} />
      {showVertices && P.pts.map((p, i) => (
        <Dot key={i} p={p} r={P.isReflex(i) && showReflex ? 3.6 : 2.6} fill={P.isReflex(i) && showReflex ? 'var(--bg)' : 'var(--ink)'} stroke="var(--ink)" label={vertexLabels ? `v${i}` : null} labelOffset={[6, 6]} fontSize={12} />
      ))}
    </g>
  );
}

/** Small "tick" marks on the boundary at parameters ts. */
export function BoundaryTicks({ ts, color = '#0f766e', r = 3.4, title }) {
  const { P } = useStage();
  return (
    <g>
      {ts.map((t, i) => <Dot key={i} p={P.at(t)} r={r} fill={color} stroke="white" strokeWidth={1} title={title ? title(t, i) : undefined} />)}
    </g>
  );
}
