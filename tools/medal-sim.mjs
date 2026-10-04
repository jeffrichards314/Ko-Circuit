// Challenge medal check (§15): validates every fighter's Gold challenge against
// his data, and plays him with the perfect-play bot to see which medals a
// perfect player takes and how fast it knocks him out (the speed targets'
// calibration: data/medals.js SPEED).
//   node tools/medal-sim.mjs [ids...] [--fights 4] [--static] [--patient]
// --patient: the bot only defends in round 1 (lets his super come around a few
// times), for the Golds about a super (duck it twice, crash him twice...).
// Static problems (unknown check / move / open step, a counter check on a move
// that can't be countered, a "never block" on a fighter with an unblockable-
// only... anything a player couldn't meet) set exit code 1.
import { Fight } from '../src/fight/fightState.js';
import { PerfectBot } from '../src/fight/bot.js';
import { FIGHTERS } from '../data/fighters/index.js';
import { CHECKS, medalsFor, speedTarget } from '../data/medals.js';

const args = process.argv.slice(2);
const flag = (k) => args.includes(k);
const nIdx = args.indexOf('--fights');
const N = nIdx >= 0 ? +args[nIdx + 1] : 4;
const ids = args.filter((a, i) => !a.startsWith('--') && args[i - 1] !== '--fights');
const list = ids.length ? ids : Object.keys(FIGHTERS);
const DEF = { dodged: ['dodgeL', 'dodgeR'], blocked: ['block'], ducked: ['duck'] };
const clock = (s) => `${Math.floor(s / 60)}:${String(s % 60).padStart(2, '0')}`;

function staticCheck(d) {
  const S = d.medals && d.medals.signature, errs = [];
  if (!S) return ['no signature challenge'];
  if (!CHECKS[S.check]) errs.push(`unknown check ${S.check}`);
  const moves = d.moves;
  if (S.move) {
    const m = moves[S.move];
    if (!m) errs.push(`no move ${S.move}`);
    else if (S.check === 'counterMove' && !m.counterWindow && !(moves[S.move + '*'] && moves[S.move + '*'].counterWindow)) errs.push(`${S.move} can't be countered`);
    else if (S.check === 'moveResult' && !(m.avoidBy || []).some((a) => DEF[S.result].includes(a))) errs.push(`${S.move} can't be ${S.result}`);
  }
  if (S.check === 'never') {
    const bad = Object.entries(moves).filter(([, m]) => (m.avoidBy || []).length && m.avoidBy.every((a) => DEF[S.defense].includes(a)));
    if (bad.length) errs.push(`only ${S.defense} avoids: ${bad.map(([k]) => k).join(', ')}`);
  }
  if (S.id) {
    const opens = new Set();
    for (const p of d.patterns) for (const s of p.steps) if (s.open) opens.add(s.id || s.anim);
    for (const m of Object.values(moves)) if (m.openAfter) opens.add(m.openAfter.id);
    if (!opens.has(S.id)) errs.push(`no open step ${S.id}`);
  }
  return errs;
}

let bad = 0;
const rows = [];
for (const id of list) {
  const d = FIGHTERS[id];
  const errs = staticCheck(d);
  if (errs.length) { bad++; console.log(`${id}: ${errs.join('; ')}`); }
  if (flag('--static')) continue;
  const got = { speed: 0, flawless: 0, signature: 0 }, times = [];
  for (let i = 0; i < N; i++) {
    const f = new Fight({ fighter: d, audio: null, input: null, opts: {} }); // (the fighter's own round count: the Will Shard's five, ZERO's four phases)
    const bot = new PerfectBot(f, { attack: true });
    let result = null;
    f.opts.onEnd = (r) => { result = r; };
    for (let k = 0; k < 200000 && !result; k++) { if (flag('--patient')) bot.attack = f.round > 1; bot.think(); f.update(); }
    if (!result) continue;
    if (result.winner === 'player') times.push(result.seconds);
    const m = medalsFor(d, result, speedTarget);
    for (const k of Object.keys(got)) if (m[k]) got[k]++;
  }
  times.sort((a, b) => a - b);
  const med = times.length ? times[times.length >> 1] : null;
  rows.push({ id, circuit: d.circuit, med, target: speedTarget(d), got });
  console.log(`${id.padEnd(10)} ${d.circuit.padEnd(12)} bot KO ${med == null ? '  -  ' : clock(med).padStart(5)}  target ${clock(speedTarget(d)).padStart(5)}  ` +
    `speed ${got.speed}/${N}  flawless ${got.flawless}/${N}  gold ${got.signature}/${N}  "${d.medals.signature.text}"`);
}
process.exit(bad ? 1 : 0);
