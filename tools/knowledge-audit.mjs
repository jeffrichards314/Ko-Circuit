// Headless knowledge audit (knowledge spec K7): the same checks as tools/knowledge-audit.html.
//   node tools/knowledge-audit.mjs [--done] [--difficulty]   (--done: only fighters that have a knowledge layer;
//   --difficulty: also the difficulty score of every fight in story order, its flags and reports/difficulty.svg)
// Exit code 1 if any error (a K4 rule broken) is found among the fighters it lists.
import { FIGHTERS } from '../data/fighters/index.js';
import { CIRCUITS } from '../data/circuits.js';
import { audit } from './knowledge-audit.js';
import { curve, graphSVG, LEVERS } from './difficulty-score.js';
import { writeFileSync, mkdirSync } from 'node:fs';

const onlyDone = process.argv.includes('--done');
const R = audit(FIGHTERS, CIRCUITS);
const mark = { error: 'ERROR', warn: 'warn ', note: 'note ' };
let errors = 0;
for (const r of R.rows) {
  if (onlyDone && !r.done) continue;
  console.log(`${r.name} (${r.id}, ${r.circuit}${r.role !== 'fighter' ? ', ' + r.role : ''})  ${r.exploits.length}E / ${r.antis.length}A / ${r.moments.length}S`);
  if (r.done) {
    console.log(`  exploits: ${r.exploits.map((x) => `${x.name} [${x.type}, ${x.hint}${x.hidden ? ', hidden' : ''}]`).join('; ') || '-'}`);
    console.log(`  anti:     ${r.antis.map((a) => `${a.name} [${a.type}${a.mild ? ', mild' : ''}]`).join('; ') || '-'}`);
    if (r.moments.length) console.log(`  moments:  ${r.moments.map((s) => `${s.name} (${s.when})`).join('; ')}`);
  }
  for (const i of r.issues) { console.log(`  ${mark[i.level]} ${i.text}`); if (i.level === 'error') errors++; }
}
console.log('\nroster-wide:');
for (const i of R.global) { console.log(`  ${mark[i.level]} ${i.text}`); if (i.level === 'error') errors++; }
if (!R.global.length) console.log('  (nothing)');
console.log('\nanti-strategy types:');
for (const [t, ids] of Object.entries(R.typeUse)) console.log(`  ${t.padEnd(12)} ${ids.join(', ') || '-- NONE --'}`);
const done = R.rows.filter((r) => r.done).length;
console.log(`\n${done}/${R.rows.length} fighters have a knowledge layer. ${R.counts.error} errors, ${R.counts.warn} warnings, ${R.counts.note} notes.`);
if (process.argv.includes('--difficulty')) {
  const D = curve(FIGHTERS, CIRCUITS);
  console.log('\ndifficulty score, story order (tools/difficulty-score.js):');
  for (const r of D.rows) console.log(`  ${String(r.i + 1).padStart(3)} ${r.id.padEnd(12)} ${r.circuit.padEnd(11)} ${r.role.padEnd(9)} ${r.score.toFixed(1).padStart(5)} ${'#'.repeat(Math.round(r.score / 2))}${r.flag ? '  !' : ''}`);
  for (const f of D.flags) { console.log(`  ERROR ${f.text}`); errors++; }
  mkdirSync('reports', { recursive: true });
  writeFileSync('reports/difficulty.svg', graphSVG([{ rows: D.rows, color: '#f0c040', label: 'difficulty score', flags: true, labels: true, width: 2 }]));
  console.log(`  ${D.flags.length} curve flag(s); graph: reports/difficulty.svg (levers: ${LEVERS.join(', ')})`);
}
process.exit(errors ? 1 : 0);
