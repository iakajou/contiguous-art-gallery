// Builds the archive to share the project:
//   Guarding-Walls-Contiguously.zip  (written next to the project folder)
//   ├── VOIR_LE_SITE.html          the whole site in one file (double-click, works offline)
//   ├── Le_sujet_explique.pdf      the subject explained simply, from zero (FR)
//   ├── Dossier_complet.pdf        the document that explains everything
//   ├── LISEZ-MOI.txt              how to view, run and continue the project
//   └── projet/                    the source code (without node_modules)
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
fs.copyFileSync(path.join(root, 'docs', 'LISEZ-MOI.txt'), path.join(dir, 'LISEZ-MOI.txt'));

const skip = new Set(['node_modules', 'dist', 'dist-single', '.DS_Store', 'html']);
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
