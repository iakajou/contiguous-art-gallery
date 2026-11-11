// Builds the PDF documents of docs/ : HTML (math pre-rendered with KaTeX, figures computed
// with the geometry library) printed to PDF with headless Google Chrome.
// Usage: node scripts/build-docs.mjs [--no-tests] [--only=<file prefix>]

import fs from 'node:fs';
import path from 'node:path';
import os from 'node:os';
import { execFileSync } from 'node:child_process';
import { fileURLToPath, pathToFileURL } from 'node:url';
import katex from 'katex';
import dossier from './docs/dossier.mjs';
import comprendre from './docs/comprendre.mjs';
import { workSplit, aiJournal } from './docs/admin.mjs';
import { Solver } from '../src/geometry/solver.js';
import { randomPolygon } from '../src/geometry/generate.js';

const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');
const outDir = path.join(root, 'docs');
const htmlDir = path.join(outDir, 'html');
fs.mkdirSync(htmlDir, { recursive: true });
const katexCss = pathToFileURL(path.join(root, 'node_modules/katex/dist/katex.min.css')).href;

function renderMath(html) {
  html = html.replace(/\$\$([\s\S]+?)\$\$/g, (_, t) => katex.renderToString(t, { displayMode: true, throwOnError: false }));
  return html.replace(/\$([^$\n]+?)\$/g, (_, t) => katex.renderToString(t, { throwOnError: false }));
}

const CSS = `
@page { size: A4; margin: 17mm 16mm 18mm 16mm;
  @bottom-center { content: counter(page) " / " counter(pages); font: 9pt Helvetica, Arial, sans-serif; color: #64748b; } }
body { font-family: 'Iowan Old Style', Palatino, Georgia, serif; font-size: 10.6pt; line-height: 1.5; color: #1f2937; }
h1 { font-size: 26pt; margin: 6mm 0 3mm; line-height: 1.1; }
h2 { font-size: 15pt; margin: 8mm 0 2mm; border-bottom: 1px solid #e2e8f0; padding-bottom: 1mm; break-after: avoid; }
h3 { font-size: 12.5pt; margin: 5mm 0 1.5mm; break-after: avoid; }
h3 .ref { font-weight: 400; font-size: 9.5pt; color: #64748b; }
p { margin: 1.6mm 0; text-align: justify; hyphens: auto; }
li { margin: 0.8mm 0; }
.cover { min-height: 230mm; display: flex; flex-direction: column; justify-content: center; break-after: page; }
.kicker { font: 600 9pt Helvetica, Arial, sans-serif; letter-spacing: .06em; text-transform: uppercase; color: #64748b; }
.subtitle { font-size: 14pt; color: #475569; margin: 2mm 0 4mm; text-align: left; }
.authors { font: 11pt Helvetica, Arial, sans-serif; }
.note-cover, .draft { font-size: 10pt; color: #475569; border-left: 3px solid #93c5fd; padding-left: 3mm; text-align: left; }
.draft { border-left-color: #f59e0b; color: #92400e; font-weight: 600; }
.toc-box { margin-top: 10mm; border: 1px solid #e2e8f0; border-radius: 3mm; padding: 3mm 6mm; background: #f8fafc; }
.box { border-left: 3px solid #2563eb; background: #eff6ff; padding: 2mm 4mm; margin: 2.5mm 0; border-radius: 0 2mm 2mm 0; break-inside: avoid; }
.box.def { border-left-color: #16a34a; background: #f0fdf4; }
.box.obs { border-left-color: #ca8a04; background: #fefce8; }
.remark { background: #f8fafc; border: 1px solid #e2e8f0; padding: 2mm 3mm; border-radius: 2mm; break-inside: avoid; }
.figrow { display: flex; gap: 5mm; justify-content: center; align-items: flex-start; margin: 3mm 0; break-inside: avoid; }
.figrow.four { flex-wrap: wrap; }
.figrow.four figure { width: 46%; }
figure { margin: 0; text-align: center; flex: 1; }
figure svg { max-width: 100%; height: auto; }
figcaption { font-size: 8.8pt; color: #475569; margin-top: 1mm; text-align: left; line-height: 1.35; }
table { border-collapse: collapse; width: 100%; font: 9pt Helvetica, Arial, sans-serif; margin: 2mm 0; break-inside: avoid; }
th, td { border-bottom: 1px solid #e2e8f0; padding: 1.2mm 2mm; text-align: left; vertical-align: top; }
th { color: #475569; }
tr.hl td { background: #eff6ff; font-weight: 600; }
code { font: 8.6pt Menlo, monospace; background: #f1f5f9; padding: 0 1mm; border-radius: 1mm; }
pre { font: 8.8pt Menlo, monospace; background: #f1f5f9; padding: 3mm; border-radius: 2mm; }
.refs { font-size: 9pt; }
.qa .q { font-weight: 700; margin-top: 3.5mm; break-after: avoid; }
.qa .a { margin-left: 4mm; }
.katex { font-size: 1.02em; }
.cover-img { justify-content: flex-start; }
.hero-shot { width: 100%; border-radius: 4mm; margin-bottom: 8mm; box-shadow: 0 6mm 14mm -6mm rgba(15,23,42,.45); }
.part { break-before: page; min-height: 60mm; padding: 26mm 0 10mm; border-bottom: 2px solid #e2e8f0; margin-bottom: 6mm; }
.part-letter { font: 700 54pt Helvetica, Arial, sans-serif; background: linear-gradient(120deg,#6366f1,#8b5cf6,#06b6d4); -webkit-background-clip: text; background-clip: text; color: transparent; line-height: 1; }
.part-title { font-size: 24pt; margin: 3mm 0 2mm; }
.part-sub { font-size: 12pt; color: #475569; text-align: left; }
img.shot { width: 100%; border: 1px solid #e2e8f0; border-radius: 3mm; display: block; }
.shotrow { margin: 4mm 0 6mm; break-inside: avoid; }
.shotrow figure { margin: 0; }
.shotrow.two { display: flex; gap: 5mm; align-items: flex-start; }
.shotrow.two figure { flex: 1; }
.shotrow figcaption { font-size: 9.2pt; color: #334155; margin-top: 2mm; }
.figcard { break-inside: avoid; margin: 4mm 0 9mm; }
.figcard img.shot { margin: 2mm 0 3mm; }
.figcard p { margin: 1mm 0; }
.todo li { margin: 1.5mm 0; }
`;

function page(title, body) {
  return `<!doctype html><html lang="fr"><head><meta charset="utf-8"><title>${title}</title>
<link rel="stylesheet" href="${katexCss}"><style>${CSS}</style></head><body>${renderMath(body)}</body></html>`;
}

function chromePath() {
  const cands = [
    '/Applications/Google Chrome.app/Contents/MacOS/Google Chrome',
    '/Applications/Chromium.app/Contents/MacOS/Chromium',
    '/usr/bin/google-chrome', '/usr/bin/chromium', '/usr/bin/chromium-browser',
  ];
  return cands.find((c) => fs.existsSync(c));
}

function printPdf(htmlFile, pdfFile) {
  const chrome = chromePath();
  if (!chrome) { console.log('  (Chrome not found: HTML only)'); return; }
  const profile = fs.mkdtempSync(path.join(os.tmpdir(), 'cag-chrome-'));
  execFileSync(chrome, ['--headless=new', '--disable-gpu', '--no-pdf-header-footer', `--user-data-dir=${profile}`,
    '--virtual-time-budget=4000', `--print-to-pdf=${pdfFile}`, pathToFileURL(htmlFile).href], { stdio: 'ignore', timeout: 120000 });
  fs.rmSync(profile, { recursive: true, force: true });
}

// ------------------------------------------------------------ live statistics
function perfLine() {
  const parts = [];
  for (const n of [12, 20, 30, 40]) {
    let P = null;
    for (let s = 0; !P || new Solver(P).isStarShaped(); s++) P = randomPolygon(n, { seed: 4242 + 97 * s + n });
    const t0 = Date.now();
    const r = new Solver(P).solve();
    parts.push(`$n=${n}$ : ${Date.now() - t0} ms ($k=${r.k}$)`);
  }
  return parts.join(' ; ');
}

function testLines(runTests) {
  if (!runTests) return { checks: 'see npm test', lemmas: 'voir <code>npm test</code>' };
  const a = execFileSync('node', [path.join(root, 'tests/run-tests.mjs'), '30'], { encoding: 'utf8', timeout: 600000 });
  const b = execFileSync('node', [path.join(root, 'tests/proofs-test.mjs'), '60'], { encoding: 'utf8', timeout: 600000 });
  const checks = (a.match(/(\d+)\/(\d+) checks passed/) || [])[0] || '?';
  const num = (k) => Number((b.match(new RegExp(`${k}: (\\d+)`)) || [])[1] || 0);
  const lemmas = `bons gardiens : ${num('goodOk')}/${num('good')} remplacements trouvés (prop. 4.3, cor. 4.7) ; mauvais gardiens : ${num('badOk')}/${num('bad')} (lemme 4.9) ;
    lemme 6.2 : ${num('l62ok')}/${num('l62')} égal au calcul direct ; théorème 5.4 : ${num('thmOk')}/${num('thm')} déroulés terminés dans $U_P$.`;
  return { checks, lemmas };
}

const runTests = !process.argv.includes('--no-tests') && !(process.argv.find((a) => a.startsWith('--only=Le_sujet')));
console.log('statistics…');
const T = testLines(runTests);
const stats = { perf: perfLine(), checks: T.checks, lemmas: T.lemmas };
const today = new Date().toISOString().slice(0, 10);

const DOCS = [
  ['Le_sujet_explique_FR', 'Tout le sujet, expliqué simplement', () => comprendre()],
  ['Guarding_Walls_Contiguously_Dossier_complet', 'Dossier complet', () => dossier(stats)],
  ['Work_split_EN_draft', 'Work split', () => workSplit()],
  ['AI_journal_EN_draft', 'AI journal', () => aiJournal({ date: today, checks: stats.checks })],
];
const onlyArg = (process.argv.find((a) => a.startsWith('--only=')) || '').slice(7);
for (const [file, title, make] of DOCS) {
  if (onlyArg && !file.startsWith(onlyArg)) continue;
  const html = path.join(htmlDir, `${file}.html`);
  fs.writeFileSync(html, page(title, make()));
  const pdf = path.join(outDir, `${file}.pdf`);
  console.log('→', path.relative(root, pdf));
  printPdf(html, pdf);
}
console.log('done');
