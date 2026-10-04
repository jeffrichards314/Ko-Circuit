// Headless knowledge scenarios (knowledge spec K7): sets up and triggers every exploit and
// anti-strategy through the real fight code (tools/knowledge-scenarios.js; the fight lab's
// "Run knowledge tests" button runs the same ones in the browser).
//   node tools/knowledge-test.mjs [ids...] [--forced]
// --forced also checks the lab's force toggle on every exploit.
// --td runs the Title Defense remixes' own exploits and anti-strategies instead (every fighter in any defense by default).
// Exit code 1 if any scenario fails.
import { FIGHTERS } from '../data/fighters/index.js';
import { remixed, TD_LISTS } from '../data/fighters/titleDefense.js';
import { runFighter } from './knowledge-scenarios.js';

const args = process.argv.slice(2);
const ids = args.filter((a) => !a.startsWith('--'));
const TD = args.includes('--td');
const list = ids.length ? ids : TD ? TD_LISTS.combined : Object.keys(FIGHTERS).filter((id) => (FIGHTERS[id].exploits || []).length || (FIGHTERS[id].antiStrategies || []).length);
let bad = 0, n = 0;
for (const id of list) {
  const d = TD && FIGHTERS[id] ? remixed(id) : FIGHTERS[id];
  if (!d) { console.log(`?? ${id}`); continue; }
  console.log(`${d.name} (${id})${TD ? ' [REMIX]' : ''}`);
  for (const r of runFighter(d, { forced: args.includes('--forced') })) {
    n++;
    if (!r.ok) bad++;
    console.log(`  ${r.ok ? 'ok  ' : 'FAIL'} ${r.kind.padEnd(7)} ${r.name.padEnd(26)} ${r.why}${r.ok ? '' : ` (${r.frames}f)`}`);
  }
}
console.log(`\n${n - bad}/${n} scenarios passed`);
process.exit(bad ? 1 : 0);
