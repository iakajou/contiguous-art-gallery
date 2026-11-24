// Builds the archive to share the project:
//   Guarding-Walls-Contiguously.zip  (written next to the project folder)
//   ├── VOIR_LE_SITE.html          the whole site in one file (double-click, works offline)
//   ├── Le_sujet_explique.pdf      the subject explained simply, from zero (FR)
//   ├── Le_projet_explique_en_detail.pdf  the whole project in detail, from zero (FR)
//   ├── Dossier_complet.pdf        the document that explains everything
//   ├── Contribution_*.pdf         one page per student: who explains / presents / is responsible for what
//   ├── LISEZ-MOI.txt              how to view, run and continue the project
//   └── projet/                    the source code (without node_modules)
// plus a CodeSandbox archive and a submission archive (see the end of this file)
// Usage: npm run zip   (runs build:single first)

import fs from 'node:fs';
import os from 'node:os';
import path from 'node:path';
import { execFileSync } from 'node:child_process';
import { fileURLToPath } from 'node:url';

const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');
const name = 'Guarding-Walls-Contiguously';
const out = path.resolve(root, '..', `${name}.zip`);
const stage = fs.mkdtempSync(path.join(os.tmpdir(), 'cag-zip-'));
const dir = path.join(stage, name);
fs.mkdirSync(dir);

console.log('building the single-file site…');
execFileSync('npx', ['vite', 'build', '--config', 'vite.single.config.js'], { cwd: root, stdio: 'ignore' });
fs.copyFileSync(path.join(root, 'dist-single', 'index.html'), path.join(dir, 'VOIR_LE_SITE.html'));

const pdf = path.join(root, 'docs', 'Guarding_Walls_Contiguously_Dossier_complet.pdf');
if (fs.existsSync(pdf)) fs.copyFileSync(pdf, path.join(dir, 'Dossier_complet.pdf'));
const easy = path.join(root, 'docs', 'Le_sujet_explique_FR.pdf');
if (fs.existsSync(easy)) fs.copyFileSync(easy, path.join(dir, 'Le_sujet_explique.pdf'));
const detail = path.join(root, 'docs', 'Le_projet_explique_en_detail_FR.pdf');
if (fs.existsSync(detail)) fs.copyFileSync(detail, path.join(dir, 'Le_projet_explique_en_detail.pdf'));
for (const f of ['Contribution_Ilias_Akajou.pdf', 'Contribution_Jomaa_Abdulrahman.pdf']) {
  const src = path.join(root, 'docs', f);
  if (fs.existsSync(src)) fs.copyFileSync(src, path.join(dir, f));
}
fs.copyFileSync(path.join(root, 'docs', 'LISEZ-MOI.txt'), path.join(dir, 'LISEZ-MOI.txt'));

const skip = new Set(['node_modules', 'dist', 'dist-single', '.DS_Store', 'html', 'oral', '.git']);
function copy(src, dst) {
  fs.mkdirSync(dst, { recursive: true });
  for (const e of fs.readdirSync(src, { withFileTypes: true })) {
    if (skip.has(e.name)) continue;
    const s = path.join(src, e.name), d = path.join(dst, e.name);
    if (e.isDirectory()) copy(s, d); else fs.copyFileSync(s, d);
  }
}
copy(root, path.join(dir, 'projet'));

if (fs.existsSync(out)) fs.rmSync(out);
execFileSync('zip', ['-r', '-q', '-X', out, name], { cwd: stage });
fs.rmSync(stage, { recursive: true, force: true });
console.log(`✓ ${out} (${(fs.statSync(out).size / 1e6).toFixed(1)} MB)`);

// Second archive: only the code, ready to import into CodeSandbox (or any editor).
// .codesandbox/tasks.json makes CodeSandbox install the dependencies and start the site by itself.
const sbName = `${name}-CodeSandbox`;
const sbOut = path.resolve(root, '..', `${sbName}.zip`);
const sbStage = fs.mkdtempSync(path.join(os.tmpdir(), 'cag-sb-'));
const sbDir = path.join(sbStage, sbName);
const keep = ['src', 'public', 'tests', '.codesandbox', '.github', 'index.html', 'package.json', 'package-lock.json',
  'vite.config.js', 'vite.single.config.js', 'README.md', '.gitignore'];
fs.mkdirSync(sbDir);
for (const k of keep) {
  const src = path.join(root, k);
  if (!fs.existsSync(src)) continue;
  if (fs.statSync(src).isDirectory()) copy(src, path.join(sbDir, k)); else fs.copyFileSync(src, path.join(sbDir, k));
}
if (fs.existsSync(sbOut)) fs.rmSync(sbOut);
execFileSync('zip', ['-r', '-q', '-X', sbOut, sbName], { cwd: sbStage });
fs.rmSync(sbStage, { recursive: true, force: true });
console.log(`✓ ${sbOut} (${(fs.statSync(sbOut).size / 1e6).toFixed(1)} MB)`);

// Third archive: the submission, with only what the course asks for: the content of the webpage
// (site-offline.html), all the code of the program (sources and tests, with what is needed to run them),
// instructions to run it, and the AI journal. No explanation documents, screenshots or drafts.
// named after the course, the students and their student numbers
const subName = 'INFO-F420_Ilias-Akajou_520466_Jomaa-Abdulrahman_583629';
const subOut = path.resolve(root, '..', `${subName}.zip`);
const subStage = fs.mkdtempSync(path.join(os.tmpdir(), 'cag-sub-'));
const subDir = path.join(subStage, subName);
const keepTop = ['index.html', 'package.json', 'package-lock.json', 'vite.config.js', 'vite.single.config.js'];
const keepDirs = ['src/', 'tests/', 'public/'];
const tracked = execFileSync('git', ['ls-files', '-co', '--exclude-standard'], { cwd: root, encoding: 'utf8' })
  .split('\n').filter((f) => f && fs.existsSync(path.join(root, f)))
  .filter((f) => keepTop.includes(f) || keepDirs.some((d) => f.startsWith(d)));
const codeDir = path.join(subDir, 'code');
for (const f of tracked) {
  fs.mkdirSync(path.dirname(path.join(codeDir, f)), { recursive: true });
  fs.copyFileSync(path.join(root, f), path.join(codeDir, f));
}
// the index.html at the root of the archive is the whole website in one file: it opens with a double-click
fs.copyFileSync(path.join(root, 'dist-single', 'index.html'), path.join(subDir, 'index.html'));
const journalPdf = path.join(root, 'docs', 'AI_journal_EN.pdf');
if (fs.existsSync(journalPdf)) fs.copyFileSync(journalPdf, path.join(subDir, 'AI_journal.pdf'));
fs.writeFileSync(path.join(subDir, 'HOW_TO_RUN.txt'), `Guarding Walls Contiguously - Ilias Akajou (520466) and Jomaa Abdulrahman (583629)
INFO-F420 Computational Geometry, ULB, 2026-2027

Public webpage:   https://iakajou.github.io/contiguous-art-gallery/
Git repository:   https://github.com/iakajou/contiguous-art-gallery

Content of this archive
  index.html       the whole webpage in one file (report, interactive figures, game)
  AI_journal.pdf   our AI journal
  code/            all the code of the program (sources and tests)

1. View the webpage (no installation)
   Open index.html (this folder) in a standard browser: double-click it. It works offline.
   The report is the "Report" page of the website; it includes the work distribution
   ("Team: who did what"), the acknowledgements and the references.

2. Run the code (Node.js 18 or later), in the folder code/
     npm install      install the dependencies (once)
     npm run dev      run the site locally and open the address it prints
     npm test         run the automatic tests
     npm run build    build the site into code/dist/
   code/index.html is the development entry point: it only works with "npm run dev".
`);
if (fs.existsSync(subOut)) fs.rmSync(subOut);
execFileSync('zip', ['-r', '-q', '-X', subOut, subName], { cwd: subStage });
fs.rmSync(subStage, { recursive: true, force: true });
console.log(`✓ ${subOut} (${(fs.statSync(subOut).size / 1e6).toFixed(1)} MB, ${tracked.length} code files in code/ + index.html (the site), AI_journal.pdf, HOW_TO_RUN.txt)`);
