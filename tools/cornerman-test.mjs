// The cornerman between rounds (spec §4; src/fight/cornerman.js, data/hints/):
//   node tools/cornerman-test.mjs [ids...]
// For every opponent (the Title Defense remixes too), through the real Fight:
//   - a player who defends nothing is caught by his supers: the corner talks about the super that caught him
//   - over a long run of corner breaks the same line never comes twice in a row
//   - with 0, 1 and 2+ losses on record the lines get a step clearer (the tier), and never repeat the answer's wording
//   - an anti-strategy that fired is the topic when no super caught you
// Exit code 1 on a failure.
import { Fight } from '../src/fight/fightState.js';
import { PerfectBot } from '../src/fight/bot.js';
import { FIGHTERS } from '../data/fighters/index.js';
import { TD_LISTS, remixed } from '../data/fighters/titleDefense.js';
import { cornerHints, hintTopics, hintBank } from '../src/fight/cornerman.js';
import { cornerStore } from '../src/save/cornerLog.js';
import { supersOf, superKey } from '../data/fighters/super.js';

const args = process.argv.slice(2);
const ids = args.filter((a) => !a.startsWith('--'));
const list = ids.length ? ids.map((id) => [id, FIGHTERS[id]]) : [...Object.entries(FIGHTERS), ...TD_LISTS.combined.map((id) => [id + '.td', remixed(id)])];
let bad = 0;
const fail = (id, why) => { bad++; console.log(`FAIL ${id}: ${why}`); };
class Pure extends PerfectBot { defend() { return false; } offense() {} }

for (const [id, d] of list) {
  // 1. caught by a super: the corner names it
  const f = new Fight({ fighter: d, audio: null, input: null, opts: { rounds: 3, infiniteHealth: true, corner: cornerStore({}) } });
  const bot = new Pure(f, { attack: false });
  let done = false, caught = 0, named = 0, last = null, repeats = 0;
  f.opts.onEnd = () => { done = true; };
  const orig = f.startBetween.bind(f);
  f.startBetween = () => {
    const log = f.roundLog, keys = Object.keys(log.superHits || {});
    orig();
    const tip = f.corner.tips[0];
    if (!tip) fail(id, `no hint after round ${f.round}`);
    if (tip === last) repeats++;
    last = tip;
    if (keys.length) { caught++; const B = hintBank(f.d); if (keys.some((k) => (B.super || {})[k] && B.super[k].includes(tip))) named++; }
  };
  for (let i = 0; i < 300000 && !done; i++) { bot.think(); f.update(); }
  if (caught && !named) fail(id, `caught by a super ${caught} time(s) and the corner never named it`);
  if (repeats) fail(id, `the same hint twice in a row (${repeats}x)`);
  // 2. many breaks in a row: never the same line twice in a row
  const C = cornerStore({});
  const g = new Fight({ fighter: d, audio: null, input: null, opts: { corner: C } });
  let prev = null;
  for (let k = 0; k < 12; k++) {
    const log = { hits: {}, antis: [], superHits: {}, damage: k % 3 ? 10 : 50, downs: 0 };
    const t = cornerHints(g, log)[0];
    if (!t) { fail(id, 'no hint for a quiet round'); break; }
    if (t === prev) { fail(id, `repeated "${t.slice(0, 40)}..." on break ${k + 1}`); break; }
    prev = t;
  }
  // 3. the tiers: the same topic gets a different (clearer) line after a loss, and again after two
  const S = supersOf(d)[0], key = S && superKey(S);
  if (key) {
    const lines = [0, 1, 2].map((n) => { const T = hintTopics(g, { superHits: { [key]: 1 }, antis: [] }, { tier: n }); return T[0] && T[0].text; });
    if (new Set(lines).size < 3) fail(id, `super ${key}: the three tiers aren't three different lines`);
  }
  // 4. an anti-strategy that fired is the topic (when no super caught you)
  const A = (d.antiStrategies || [])[0];
  if (A) {
    const T = hintTopics(g, { superHits: {}, antis: [A] }, { tier: 0 });
    if (!T[0] || T[0].key !== 'a:' + (A.grudge || A.id)) fail(id, `anti-strategy ${A.id} fired but the corner talked about ${T[0] && T[0].key}`);
  }
}
console.log(bad ? `${bad} failure(s)` : `ok: ${list.length} opponents`);
process.exit(bad ? 1 : 0);
