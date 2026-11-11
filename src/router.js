// Minimal hash router (works on GitHub Pages and when the page is opened as a local file).
// Routes look like  #/            (home)
//                   #/proof       (chapter overview)
//                   #/proof/2     (chapter 2)
//                   #/proof/2?s=replace   (chapter 2, scrolled to the subsection with id "replace")
//                   #/play  #/report?ref=5

import { useEffect, useState } from 'react';

export function parseHash(hash = window.location.hash) {
  const h = hash.replace(/^#/, '') || '/';
  const [path, qs] = h.split('?');
  const query = {};
  if (qs) for (const kv of qs.split('&')) { const [k, v] = kv.split('='); if (k) query[decodeURIComponent(k)] = decodeURIComponent(v || ''); }
  const parts = path.split('/').filter(Boolean);
  return { path: `/${parts.join('/')}`, parts, query };
}

export function useRoute() {
  const [route, setRoute] = useState(() => parseHash());
  useEffect(() => {
    const on = () => setRoute(parseHash());
    window.addEventListener('hashchange', on);
    return () => window.removeEventListener('hashchange', on);
  }, []);
  return route;
}

/** Build a link: link('/proof/2', { s: 'replace' }) -> '#/proof/2?s=replace' */
export function link(path, query) {
  const qs = query ? Object.entries(query).map(([k, v]) => `${encodeURIComponent(k)}=${encodeURIComponent(v)}`).join('&') : '';
  return `#${path}${qs ? `?${qs}` : ''}`;
}

/** Where each subsection of the proof lives (used by cross-references). */
export const SECTION_HOME = {
  notation: 1, cores: 1, greedy: 1,
  goodbad: 2, replace: 2,
  discrete: 3, thm54: 3,
  lemma62: 4, nextstep: 4, full: 4,
  optimal: 5,
};

export const sectionLink = (id) => link(`/proof/${SECTION_HOME[id]}`, { s: id });
