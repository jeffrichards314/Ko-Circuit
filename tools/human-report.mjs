// Formats the human-model playthrough (tools/human-playthrough.mjs): one table per profile, and the flags the release audit asks for.
//   node tools/human-report.mjs [dir]   (default reports/playthrough)
import { readFileSync, existsSync } from 'node:fs';
import { STORY, BOSSES, ZONE, roleOf } from '../data/difficulty.js';
import { CIRCUITS } from '../data/circuits.js';
import { FIGHTERS } from '../data/fighters/index.js';
const dir = process.argv[2] || 'reports/playthrough';
const rd = (f) => (existsSync(`${dir}/${f}`) ? readFileSync(`${dir}/${f}`, 'utf8').trim().split('\n').map((l) => JSON.parse(l)) : []);
const rows = rd('fighters+td.jsonl').length ? rd('fighters+td.jsonl') : rd('fighters.jsonl');
const pct = (x) => `${Math.round(100 * x)}%`.padStart(4);
const order = (r) => { const i = STORY.indexOf(r.circuit); return (i < 0 ? 999 : i) * 1000 + Object.keys(FIGHTERS).indexOf(r.id); };
const out = [];
for (const td of [false, true]) {
  const R = rows.filter((r) => !!r.td === td).sort((a, b) => order(a) - order(b));
  if (!R.length) continue;
  out.push(`\n=== ${td ? 'TITLE DEFENSE VERSIONS' : 'CAREER'}  (cold = first-ever attempt; tries = attempts to a first win; after learning: win, round, KO/TKO, medals earned of ${R[0].plain ? 30 : 0} fights)`);
  for (const prof of ['plain', 'golden']) {
    out.push(`\n-- profile: ${prof === 'plain' ? 'no golden moments' : 'uses golden moments'}`);
    out.push('fighter       circuit      cold  tries  win  rnd(max) champ   KO  TKO   time   hits | spd flw gold | gldn/fight  minWin');
    for (const r of R) {
      const p = r[prof];
      const mw = r.widths.length ? Math.min(...r.widths) : '-';
      out.push(`${r.id.padEnd(13)} ${String(r.circuit).padEnd(11)} ${pct(p.cold)} ${String(p.first ?? 'NEVER').padStart(5)} ${pct(p.win)}  ${String(p.round ?? '-').padStart(2)}(${String(p.roundMax ?? '-').padStart(2)}) ${pct(p.champ)} ${pct(p.ko)} ${pct(p.tko)} ${String(Math.round(p.seconds ?? 0)).padStart(5)}s ${(p.hits ?? 0).toFixed(1).padStart(5)} | ${pct(p.medals.speed)} ${pct(p.medals.flawless)} ${pct(p.medals.signature)} | ${p.goldens.toFixed(1).padStart(5)}  ${mw}`);
    }
  }
}
// the divisions
const runs = rd('runs.jsonl');
if (runs.length) {
  out.push('\n=== DIVISIONS: the player learns every fighter first, then runs until it has cleared (Title Defense: 10 clears, Gauntlet: 3)');
  out.push('mode      division    profile  fights  attempts  clears  first-clear  median clear time (par)   medals earned (of the clears)        runs ended by');
  for (const r of runs.sort((a, b) => (a.mode + a.division + a.golden).localeCompare(b.mode + b.division + b.golden))) {
    const t = r.seconds ? `${Math.floor(r.seconds / 3600)}:${String(Math.floor((r.seconds % 3600) / 60)).padStart(2, '0')}:${String(Math.round(r.seconds % 60)).padStart(2, '0')}` : '-';
    const par = r.par ? ` (${Math.floor(r.par / 3600)}:${String(Math.floor((r.par % 3600) / 60)).padStart(2, '0')}:${String(r.par % 60).padStart(2, '0')})` : '';
    out.push(`${(r.mode === 'td' ? 'defense' : 'gauntlet').padEnd(9)} ${r.division.padEnd(11)} ${(r.golden ? 'golden' : 'plain').padEnd(8)} ${String(r.len).padStart(6)}  ${String(r.attempts).padStart(8)}  ${String(r.clears).padStart(6)}  ${String(r.firstClear ?? 'never').padStart(11)}  ${(t + par).padEnd(24)}  ${(r.medals ? `bronze ${r.medals.bronze} silver ${r.medals.silver} gold ${r.medals.gold}` : '-').padEnd(36)} ${Object.entries(r.ends).sort((a, b) => b[1] - a[1]).slice(0, 4).map(([k, v]) => `${k} x${v}`).join(', ')}`);
  }
}
console.log(out.join('\n'));
