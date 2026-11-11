// Screenshots of the site for the PDF documentation.
// Needs a running server (npm run dev or npm run preview) and Google Chrome.
// Usage: node scripts/screenshots.mjs [baseUrl]    (default http://localhost:5173)

import fs from 'node:fs';
import os from 'node:os';
import path from 'node:path';
import { execFileSync } from 'node:child_process';
import { fileURLToPath } from 'node:url';

const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');
const base = (process.argv[2] || 'http://localhost:5173').replace(/\/$/, '');
const out = path.join(root, 'docs', 'screenshots');
fs.mkdirSync(out, { recursive: true });

export const SHOTS = [
  // home page (the oral presentation), section by section
  ['01_home_hero', '#/'],
  ['02_home_problem', '#/?only=problem', 1400],
  ['03_home_surprise', '#/?only=surprise', 1100],
  ['05_home_idea1', '#/?only=idea-1', 900],
  ['06_home_idea2', '#/?only=idea-2', 1100],
  ['07_home_idea3', '#/?only=idea-3', 900],
  ['08_home_result', '#/?only=result', 1000],
  ['09_home_verified', '#/?only=verified', 900],
  ['10_home_try', '#/?only=try', 760],
  // detail pages
  ['11_proof_index', '#/proof', 1500],
  ['12_chapter2', '#/proof/2', 900],
  ['15_play', '#/play', 1500],
  ['16_report', '#/report', 1000],
  // the eleven interactive figures and the game
  ['fig01', '#/?only=fig-1', 1300],
  ['fig02', '#/proof/1?only=fig-2', 1300],
  ['fig03', '#/proof/1?only=fig-3', 1500],
  ['fig04', '#/proof/2?only=fig-4', 1300],
  ['fig05', '#/proof/2?only=fig-5', 1400],
  ['fig06', '#/proof/3?only=fig-6', 1300],
  ['fig07', '#/proof/3?only=fig-7', 1100],
  ['fig08', '#/proof/4?only=fig-8', 1100],
  ['fig09', '#/proof/4?only=fig-9', 1100],
  ['fig10', '#/proof/4?only=fig-10', 1300],
  ['fig11', '#/proof/5?only=fig-11', 1500],
  ['fig12_game', '#/play?only=fig-game', 1500],
];

const chrome = ['/Applications/Google Chrome.app/Contents/MacOS/Google Chrome', '/usr/bin/google-chrome', '/usr/bin/chromium'].find((c) => fs.existsSync(c));
if (!chrome) { console.error('Google Chrome not found'); process.exit(1); }

const only = process.argv.slice(3);
for (const [name, hash, h = 820] of SHOTS) {
  if (only.length && !only.includes(name)) continue;
  const profile = fs.mkdtempSync(path.join(os.tmpdir(), 'cag-shot-'));
  const file = path.join(out, `${name}.png`);
  execFileSync(chrome, ['--headless=new', '--disable-gpu', '--hide-scrollbars', `--user-data-dir=${profile}`, `--window-size=1280,${h}`,
    '--force-device-scale-factor=1.5', '--virtual-time-budget=9000', `--screenshot=${file}`, `${base}/?shot=1${hash}`], { stdio: 'ignore', timeout: 120000 });
  fs.rmSync(profile, { recursive: true, force: true });
  console.log('✓', name);
}
