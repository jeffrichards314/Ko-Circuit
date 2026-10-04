// The table of every Title Defense exclusive attack and its golden moment (spec §20 T7), generated: reports/exclusive-attacks.md
//   node tools/exclusive-table.mjs [--print]
import { writeFileSync } from 'node:fs';
import { TD_LISTS, remixed } from '../data/fighters/titleDefense.js';
import { DIVISIONS, DIVISION_NAMES } from '../data/divisions.js';
import { supersOf, chainsOf, hitOf, hitWords } from '../data/fighters/super.js';
import { attackHardness, otherAttacks } from './difficulty-score.js';
import { FIGHTERS } from '../data/fighters/index.js';

const rows = [];
for (const div of DIVISIONS.filter((d) => d !== 'combined')) {
  for (const id of TD_LISTS[div]) {
    const d = remixed(id), S = supersOf(d).find((x) => x.exclusive), chain = chainsOf(S)[0];
    const mv = (k) => d.moves[k] || d.moves[k + '*'];
    const blows = chain.filter((k) => !(mv(k).call || mv(k).feint));
    const gm = chain.map((k) => d.moves[k]).find((m) => m && m.goldenHit);
    const last = mv(chain[chain.length - 1]);
    const H = hitWords(hitOf(S, d)).toLowerCase().replace(/^a /, '');
    const where = S.golden === 'taunt' ? `during his taunt (the glint on frame ${S.window[0]})` : S.golden === 'advance' ? 'as he steps back in (the first frames of the first blow)'
      : S.golden === 'recovery' ? `slip ${gm.name}, then in its recovery` : `in the windup of ${gm.name}`;
    const best = otherAttacks(d, S).map((a) => attackHardness(d, a.S, a.moves).score).reduce((a, b) => Math.max(a, b), 0);
    rows.push(`| ${DIVISION_NAMES[div]} | ${FIGHTERS[id].name} | ${S.name} | ${blows.length}, ${last.name} last | ${attackHardness(d, S).cover} | ${where}: ${H} | ${d.goldenStun ? 'stun' : 'knockdown'} | ${attackHardness(d, S).score.toFixed(0)} vs ${best.toFixed(0)} |`);
  }
}
const out = `| Division | Opponent | Attack | Blows | Defenses it takes | Golden moment (the punch that cancels it) | Effect | Hardness (vs his best other attack) |\n|---|---|---|---|---|---|---|---|\n${rows.join('\n')}\n`;
writeFileSync(new URL('../reports/exclusive-attacks.md', import.meta.url), out);
if (process.argv.includes('--print')) console.log(out); else console.log(`${rows.length} attacks: reports/exclusive-attacks.md`);
