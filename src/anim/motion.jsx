// Small animation toolkit: scroll reveal, in-view detection and a looping clock.
// Every animation respects the "reduce motion" setting of the operating system.

import React, { useEffect, useRef, useState } from 'react';

export const clamp01 = (x) => Math.max(0, Math.min(1, x));
export const ease = (x) => { const t = clamp01(x); return t < 0.5 ? 4 * t * t * t : 1 - Math.pow(-2 * t + 2, 3) / 2; };
export const easeOut = (x) => 1 - Math.pow(1 - clamp01(x), 3);
/** Progress of an event that starts at `start` and lasts `dur` seconds, eased. */
export const phase = (t, start, dur) => ease((t - start) / dur);

export function reducedMotion() {
  if (typeof document !== 'undefined' && document.documentElement.classList.contains('no-anim')) return true;
  try { return window.matchMedia('(prefers-reduced-motion: reduce)').matches; } catch (e) { return false; }
}

/** true once the element has entered the viewport (or always when `repeat` and visible). */
export function useInView(options = {}) {
  const { once = true, rootMargin = '0px 0px -12% 0px', threshold = 0.15 } = options;
  const ref = useRef(null);
  const [inView, setInView] = useState(false);
  useEffect(() => {
    const el = ref.current;
    if (!el) return undefined;
    if (typeof IntersectionObserver === 'undefined') { setInView(true); return undefined; }
    const io = new IntersectionObserver(([e]) => {
      if (e.isIntersecting) { setInView(true); if (once) io.disconnect(); }
      else if (!once) setInView(false);
    }, { rootMargin, threshold });
    io.observe(el);
    return () => io.disconnect();
  }, [once, rootMargin, threshold]);
  return [ref, inView];
}

/** Fade + rise when scrolled into view. */
export function Reveal({ children, delay = 0, as: Tag = 'div', className = '', y = 22, ...rest }) {
  const [ref, inView] = useInView();
  return (
    <Tag ref={ref} className={`reveal ${inView ? 'in' : ''} ${className}`} style={{ '--reveal-delay': `${delay}ms`, '--reveal-y': `${y}px` }} {...rest}>
      {children}
    </Tag>
  );
}

/**
 * A clock in seconds that loops every `cycle` seconds while the element is visible.
 * Returns [ref, t]. With reduced motion, t stays at `still` (default: end of the cycle).
 */
export function useLoopClock(cycle, { still = null, speed = 1, once = true } = {}) {
  // once = true: play the animation a single time, then hold on the final frame (`still`).
  // This keeps the pages calm to read; replay() starts it again.
  const [ref, inView] = useInView({ once: false, threshold: 0.05, rootMargin: '0px' });
  const [t, setT] = useState(0);
  const [run, setRun] = useState(0);
  const base = useRef(null);
  const reduce = useRef(false);
  useEffect(() => { reduce.current = reducedMotion(); }, []);
  const end = still ?? cycle * 0.999;
  useEffect(() => {
    if (reduce.current) { setT(end); return undefined; }
    if (!inView) return undefined;
    let raf;
    const start = performance.now() - (base.current ?? 0) * 1000;
    const tick = (now) => {
      let s = ((now - start) / 1000) * speed;
      if (once && s >= end) { base.current = end / speed; setT(end); return; }
      s %= cycle;
      base.current = s / speed;
      setT(s);
      raf = requestAnimationFrame(tick);
    };
    raf = requestAnimationFrame(tick);
    return () => cancelAnimationFrame(raf);
  }, [inView, cycle, speed, end, once, run]);
  const replay = () => { base.current = 0; setT(0); setRun((r) => r + 1); };
  return [ref, t, replay];
}

/** Small button to play an animation again. */
export function ReplayButton({ onClick, dark }) {
  if (reducedMotion()) return null;
  return <button type="button" className={`scene-replay ${dark ? 'dark' : ''}`} onClick={onClick} aria-label="replay the animation">↻ Replay</button>;
}

/** Number that counts up when it becomes visible. */
export function CountUp({ to, duration = 1400, format = (x) => Math.round(x).toLocaleString('en-US'), className }) {
  const [ref, inView] = useInView();
  const [v, setV] = useState(0);
  useEffect(() => {
    if (!inView) return undefined;
    if (reducedMotion()) { setV(to); return undefined; }
    let raf;
    const t0 = performance.now();
    const tick = (now) => {
      const p = easeOut((now - t0) / duration);
      setV(to * p);
      if (p < 1) raf = requestAnimationFrame(tick);
    };
    raf = requestAnimationFrame(tick);
    return () => cancelAnimationFrame(raf);
  }, [inView, to, duration]);
  return <span ref={ref} className={className}>{format(v)}</span>;
}

/** A short burst of confetti (used when the player finds an optimal solution). */
export function Confetti({ count = 70 }) {
  const pieces = React.useMemo(() => Array.from({ length: count }, (_, i) => ({
    left: Math.random() * 100,
    delay: Math.random() * 0.35,
    dur: 1.6 + Math.random() * 1.2,
    rot: Math.random() * 720 - 360,
    drift: Math.random() * 160 - 80,
    color: ['#6366f1', '#06b6d4', '#f472b6', '#10b981', '#f59e0b', '#a78bfa'][i % 6],
    w: 6 + Math.random() * 6,
  })), [count]);
  if (reducedMotion()) return null;
  return (
    <div className="confetti" aria-hidden="true">
      {pieces.map((p, i) => (
        <i key={i} style={{ left: `${p.left}%`, background: p.color, width: p.w, height: p.w * 0.45, animationDelay: `${p.delay}s`, animationDuration: `${p.dur}s`, '--rot': `${p.rot}deg`, '--drift': `${p.drift}px` }} />
      ))}
    </div>
  );
}
