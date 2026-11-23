import React, { useEffect, useLayoutEffect, useState } from 'react';
import { useRoute, link } from './router.js';
import Home from './pages/Home.jsx';
import ProofIndex from './pages/ProofIndex.jsx';
import ChapterPage, { CHAPTERS } from './pages/ChapterPage.jsx';
import Play from './pages/Play.jsx';
import Report from './pages/Report.jsx';
import { REPO_URL, SITE_URL } from './links.js';

function Logo() {
  return (
    <svg viewBox="0 0 64 64" className="logo" aria-hidden="true">
      <defs>
        <linearGradient id="lg" x1="0" y1="0" x2="1" y2="1">
          <stop offset="0" stopColor="#818cf8" /><stop offset="1" stopColor="#22d3ee" />
        </linearGradient>
      </defs>
      <path d="M6 54 L14 10 L30 26 L44 8 L58 54 Z" fill="none" stroke="url(#lg)" strokeWidth="5" strokeLinejoin="round" />
      <path d="M32 40 L14 10" stroke="#f472b6" strokeWidth="3" strokeLinecap="round" opacity=".8" />
      <path d="M32 40 L58 54" stroke="#f472b6" strokeWidth="3" strokeLinecap="round" opacity=".8" />
      <circle cx="32" cy="40" r="5.5" fill="#f472b6" />
    </svg>
  );
}

const NAV = [
  ['/', 'Overview'],
  ['/proof', 'The proof'],
  ['/play', 'Play'],
  ['/report', 'Report'],
];

// animations on/off: the class must be set before the page re-mounts, so that the scenes read it
const applyMotion = (m) => document.documentElement.classList.toggle('no-anim', window.location.search.includes('shot') || m === 'off');

function Navbar({ route, theme, setTheme, motion, setMotion }) {
  const [scrolled, setScrolled] = useState(false);
  const [open, setOpen] = useState(false);
  const [progress, setProgress] = useState(0);
  useEffect(() => {
    const on = () => {
      setScrolled(window.scrollY > 24);
      const h = document.documentElement.scrollHeight - window.innerHeight;
      setProgress(h > 0 ? Math.min(1, window.scrollY / h) : 0);
    };
    on();
    window.addEventListener('scroll', on, { passive: true });
    return () => window.removeEventListener('scroll', on);
  }, [route.path]);
  useEffect(() => setOpen(false), [route.path]);
  const onHero = route.path === '/' && !scrolled;
  const active = (p) => (p === '/' ? route.path === '/' : route.path.startsWith(p));
  return (
    <header className={`nav ${scrolled ? 'nav-solid' : ''} ${onHero ? 'nav-hero' : ''} ${open ? 'nav-open' : ''}`}>
      <div className="nav-inner">
        <a href={link('/')} className="brand"><Logo /><span>Guarding Walls <em>Contiguously</em></span></a>
        <nav className="nav-links" aria-label="main">
          {NAV.map(([p, label]) => <a key={p} href={link(p)} className={active(p) ? 'active' : ''}>{label}</a>)}
        </nav>
        <div className="nav-actions">
          <a className="icon-btn" href={REPO_URL} target="_blank" rel="noreferrer" aria-label="source code on GitHub" title="Source code on GitHub">
            <svg viewBox="0 0 16 16" width="17" height="17" aria-hidden="true"><path fill="currentColor" d="M8 0C3.58 0 0 3.58 0 8c0 3.54 2.29 6.53 5.47 7.59.4.07.55-.17.55-.38 0-.19-.01-.82-.01-1.49-2.01.37-2.53-.49-2.69-.94-.09-.23-.48-.94-.82-1.13-.28-.15-.68-.52-.01-.53.63-.01 1.08.58 1.23.82.72 1.21 1.87.87 2.33.66.07-.52.28-.87.51-1.07-1.78-.2-3.64-.89-3.64-3.95 0-.87.31-1.59.82-2.15-.08-.2-.36-1.02.08-2.12 0 0 .67-.21 2.2.82.64-.18 1.32-.27 2-.27.68 0 1.36.09 2 .27 1.53-1.04 2.2-.82 2.2-.82.44 1.1.16 1.92.08 2.12.51.56.82 1.27.82 2.15 0 3.07-1.87 3.75-3.65 3.95.29.25.54.73.54 1.48 0 1.07-.01 1.93-.01 2.2 0 .21.15.46.55.38A8.013 8.013 0 0016 8c0-4.42-3.58-8-8-8z"/></svg>
          </a>
          <button type="button" className="icon-btn" onClick={() => { const m = motion === 'on' ? 'off' : 'on'; applyMotion(m); setMotion(m); }} aria-label="turn animations on or off" title={motion === 'on' ? 'Turn animations off' : 'Turn animations on'}>
            {motion === 'on' ? '⏸' : '▶'}
          </button>
          <button type="button" className="icon-btn" onClick={() => setTheme(theme === 'dark' ? 'light' : 'dark')} aria-label="toggle dark mode" title="Toggle dark mode">
            {theme === 'dark' ? '☀' : '☾'}
          </button>
          <button type="button" className="icon-btn menu-btn" onClick={() => setOpen(!open)} aria-label="menu">{open ? '✕' : '☰'}</button>
        </div>
      </div>
      <div className="nav-progress" style={{ transform: `scaleX(${progress})` }} />
    </header>
  );
}

function Footer() {
  return (
    <footer className="site-footer">
      <div className="footer-inner">
        <div>
          <div className="footer-brand"><Logo /> Guarding Walls <em>Contiguously</em></div>
          <p>An interactive exploration of the Contiguous Art Gallery Problem. INFO-F420 Computational Geometry, Université libre de Bruxelles, 2026–2027.</p>
          <p className="muted">Ilias Akajou (520466) · Jomaa Abdulrahman (583629)</p>
          <p className="muted">Source code: <a href={REPO_URL}>github.com/iakajou/contiguous-art-gallery</a></p>
        </div>
        <div className="footer-cols">
          <div><b>Explore</b><a href={link('/')}>Overview</a><a href={link('/proof')}>The proof</a><a href={link('/play')}>Play</a><a href={link('/report')}>Report</a></div>
          <div><b>Chapters</b>{CHAPTERS.map((c) => <a key={c.id} href={link(`/proof/${c.id}`)}>{c.id}. {c.short}</a>)}</div>
          <div><b>Code</b><a href={REPO_URL}>GitHub repository</a><a href={`${REPO_URL}/archive/refs/heads/main.zip`}>Download the code (zip)</a><a href={SITE_URL}>Public page</a></div>
          <div><b>Papers</b><a href="https://arxiv.org/abs/2508.09734">de Berg et al. 2025</a><a href="https://arxiv.org/abs/2511.02960">Θ(n log n) paper</a><a href="https://doi.org/10.4230/LIPIcs.SoCG.2025.20">SoCG 2025</a></div>
        </div>
      </div>
    </footer>
  );
}

export default function App() {
  const route = useRoute();
  const [motion, setMotion] = useState(() => {
    let m = 'on';
    try { m = localStorage.getItem('cag-motion') || 'on'; } catch (e) { /* storage unavailable */ }
    applyMotion(m);
    return m;
  });
  useEffect(() => {
    applyMotion(motion);
    try { localStorage.setItem('cag-motion', motion); } catch (e) { /* storage unavailable */ }
  }, [motion]);
  const [theme, setTheme] = useState(() => {
    try { return localStorage.getItem('cag-theme') || 'light'; } catch (e) { return 'light'; }
  });
  useEffect(() => {
    document.documentElement.setAttribute('data-theme', theme);
    try { localStorage.setItem('cag-theme', theme); } catch (e) { /* storage unavailable */ }
  }, [theme]);

  // scroll: to a subsection (?s=id / ?ref=n) or to the top on page change
  useLayoutEffect(() => {
    const target = route.query.s || (route.query.ref ? `ref-${route.query.ref}` : null);
    if (!target) { window.scrollTo(0, 0); return undefined; }
    const id = setTimeout(() => {
      const el = document.getElementById(target);
      if (el) window.scrollTo({ top: el.getBoundingClientRect().top + window.scrollY - 84, behavior: document.documentElement.classList.contains('no-anim') ? 'auto' : 'smooth' });
    }, 80);
    return () => clearTimeout(id);
  }, [route.path, route.query.s, route.query.ref]);

  // screenshot helper (?shot in the URL and #...?only=id): keep only the element with that id on screen
  useEffect(() => {
    const only = route.query.only;
    if (!only || !document.documentElement.classList.contains('no-anim')) return undefined;
    const id = setTimeout(() => {
      let el = document.getElementById(only);
      if (!el) return;
      document.body.style.paddingTop = '24px';
      document.body.style.paddingBottom = '24px';
      while (el && el !== document.body) {
        for (const sib of el.parentElement ? el.parentElement.children : []) {
          if (sib !== el) sib.style.display = 'none';
        }
        el.style.gridColumn = '1 / -1';
        el.style.margin = el.classList.contains('widget') ? '0 auto' : el.style.margin;
        el.style.paddingTop = '0';
        el.style.paddingBottom = '0';
        el = el.parentElement;
      }
      window.scrollTo(0, 0);
    }, 50);
    return () => clearTimeout(id);
  }, [route.path, route.query.only]);

  let page;
  const [p0, p1] = route.parts;
  if (!p0) page = <Home />;
  else if (p0 === 'proof' && p1) page = <ChapterPage id={Number(p1)} />;
  else if (p0 === 'proof') page = <ProofIndex />;
  else if (p0 === 'play') page = <Play />;
  else if (p0 === 'report') page = <Report />;
  else page = <Home />;

  return (
    <div className="app">
      <Navbar route={route} theme={theme} setTheme={setTheme} motion={motion} setMotion={setMotion} />
      <main key={`${route.path}-${motion}`} className="page-enter">{page}</main>
      <Footer />
    </div>
  );
}
