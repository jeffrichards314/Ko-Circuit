// Title Defense against the Career (spec §6, §9): every Title Defense opponent must score ABOVE his Career version on the difficulty score
// (tools/difficulty-score.js: tell, damage, get-up, pattern, supers, anti-strategies, phases, and for a remix the exclusive attack's hardness).
//   node tools/td-difficulty.mjs [--table]
// Also checks, inside each division, that the defense does not get easier as it goes (the champions and the bosses are the peaks, as in the
// career: a champion below the champion before him is flagged, a note, not a failure), and prints how far above the career each one is.
// Exit code 1 if any opponent scores at or below his Career version.
import { FIGHTERS } from '../data/fighters/index.js';
import { CIRCUITS } from '../data/circuits.js';
import { TD_LISTS, remixed } from '../data/fighters/titleDefense.js';
import { DIVISIONS } from '../data/divisions.js';
import { measure, LEVERS } from './difficulty-score.js';

const table = process.argv.includes('--table');
let bad = 0, n = 0;
const rows = [];
for (const div of DIVISIONS.filter((d) => d !== 'combined')) {
  let prev = null;
  for (const id of TD_LISTS[div]) {
    const career = FIGHTERS[id], remix = remixed(id), C = CIRCUITS[career.circuit];
    const a = measure(career, C), b = measure(remix, C);
    const gain = b.score - a.score;
    n++;
    if (!(b.score > a.score)) { bad++; console.log(`FAIL ${id}: Title Defense ${b.score.toFixed(1)} is not above the Career ${a.score.toFixed(1)}`); }
    // which levers moved
    const moved = [...LEVERS, 'exclusive'].filter((k) => (b.levers[k] ?? 0) - (a.levers[k] ?? 0) > 0.005).map((k) => `${k} +${(((b.levers[k] ?? 0) - (a.levers[k] ?? 0)) * 100).toFixed(0)}`).join(', ');
    rows.push({ div, id, career: a.score, td: b.score, gain, moved, note: prev && b.score < prev.td - 0.25 ? `below ${prev.id} (${prev.td.toFixed(1)})` : '' });
    prev = { id, td: b.score };
  }
}
if (table) for (const r of rows) console.log(`${r.div.padEnd(10)} ${r.id.padEnd(12)} career ${r.career.toFixed(1).padStart(5)}  title defense ${r.td.toFixed(1).padStart(5)}  (+${r.gain.toFixed(1)})  ${r.moved}${r.note ? `   NOTE ${r.note}` : ''}`);
const min = rows.reduce((a, b) => (b.gain < a.gain ? b : a));
console.log(bad ? `${bad} of ${n} opponents are not above their Career version` : `ok: all ${n} opponents score above their Career version (smallest gain +${min.gain.toFixed(1)}: ${min.id})`);
process.exit(bad ? 1 : 0);
