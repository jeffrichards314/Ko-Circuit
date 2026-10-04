// The difficulty curve, headless (spec §9): every fight's score in story order (tools/difficulty-score.js), its flags, and an
// SVG graph. With --before <dir>, the same measured off another copy of the game (the pre-rebalance backup) drawn under it.
//   node tools/difficulty-graph.mjs [--before ../backup/ko-circuit] [--out reports/difficulty.svg] [--table]
import { writeFileSync, mkdirSync } from 'node:fs';
import { dirname, resolve } from 'node:path';
import { pathToFileURL } from 'node:url';
import { FIGHTERS } from '../data/fighters/index.js';
import { CIRCUITS } from '../data/circuits.js';
import { curve, graphSVG, LEVERS } from './difficulty-score.js';

const args = process.argv.slice(2);
const opt = (k, d) => { const i = args.indexOf(k); return i >= 0 ? args[i + 1] : d; };
const after = curve(FIGHTERS, CIRCUITS);
const series = [{ rows: after.rows, color: '#f0c040', label: 'now', flags: true, labels: true, width: 2 }];
let before = null;
if (opt('--before')) {
  const dir = resolve(opt('--before'));
  const F = (await import(pathToFileURL(dir + '/data/fighters/index.js'))).FIGHTERS;
  const C = (await import(pathToFileURL(dir + '/data/circuits.js'))).CIRCUITS;
  before = curve(F, C);
  series.unshift({ rows: before.rows, color: '#6f8fd0', label: 'before', dash: '4 3' });
}
const out = opt('--out', 'reports/difficulty.svg');
mkdirSync(dirname(out), { recursive: true });
writeFileSync(out, graphSVG(series, { title: 'KO CIRCUIT DIFFICULTY SCORE, STORY ORDER' }));
const pad = (s, n) => String(s).padEnd(n);
if (args.includes('--table')) {
  console.log(`${pad('#', 4)}${pad('fighter', 12)}${pad('circuit', 12)}${pad('role', 9)}${pad('score', 7)}${before ? pad('before', 8) : ''}${LEVERS.map((k) => pad(k, 8)).join('')}tell dmg getup`);
  for (const r of after.rows) {
    const b = before && before.rows.find((x) => x.id === r.id);
    console.log(`${pad(r.i + 1, 4)}${pad(r.id, 12)}${pad(r.circuit, 12)}${pad(r.role, 9)}${pad(r.score.toFixed(1), 7)}${before ? pad(b ? b.score.toFixed(1) : '-', 8) : ''}${LEVERS.map((k) => pad(r.levers[k].toFixed(2), 8)).join('')}${r.raw.tell}f ${r.raw.dmg.toFixed(1)} ${r.raw.needs.map((v) => v.toFixed(1)).join('/')}${r.flag ? '  !' : ''}`);
  }
}
console.log(`\n${after.flags.length} flag(s)`);
for (const f of after.flags) console.log('  ! ' + f.text);
if (before) console.log(`\nbefore: ${before.flags.length} flag(s)`);
console.log(`graph: ${out}`);
process.exit(after.flags.length ? 1 : 0);
