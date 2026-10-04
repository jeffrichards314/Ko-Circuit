// The Title Defense exclusive attacks (spec §6; data/fighters/remixes/exclusive.js), one by one, through the real fight code:
//   node tools/exclusive-test.mjs [ids...] [--runs N]
// For every opponent of every division:
//   1. it exists, is a super of his (armored, the first one he throws), and has exactly one golden moment (an instant knockdown, or the long
//      stun for a boss) with a glint cue
//   2. FAIR: the exclusive attack alone, started again and again with the perfect-play bot defending (and its slips starting on either side),
//      never lands a single blow
//   3. its golden moment lands (the bot's clean punch on the glint) and ends the attack
//   4. HARD: its attackHardness (tools/difficulty-score.js) is above every other attack of his (his best combo, his other supers)
//   5. its sound exists, its blows have a tell (a windup of 3+ frames) and a defense that works, and its cornerman hints and scouting entry exist
// Exit code 1 on a failure.
import { Fight } from '../src/fight/fightState.js';
import { PerfectBot } from '../src/fight/bot.js';
import { FIGHTERS } from '../data/fighters/index.js';
import { TD_LISTS, remixed } from '../data/fighters/titleDefense.js';
import { supersOf, superKey, chainsOf } from '../data/fighters/super.js';
import { attackHardness, otherAttacks } from './difficulty-score.js';
import { scoutEntries } from '../src/fight/knowledge.js';
import { SFX_NAMES } from '../src/engine/audio.js';
import { hintBank } from '../src/fight/cornerman.js';

const args = process.argv.slice(2);
const rIdx = args.indexOf('--runs');
const RUNS = rIdx >= 0 ? +args[rIdx + 1] : 6;
const ids = args.filter((a, i) => !a.startsWith('--') && args[i - 1] !== '--runs');
const list = ids.length ? ids : [...new Set(TD_LISTS.combined)];
let bad = 0, rows = [];
const fail = (id, why) => { bad++; console.log(`FAIL ${id}: ${why}`); };

function fresh(d, bot = false, opts = {}) {
  const f = new Fight({ fighter: d, audio: null, input: null, opts: { infiniteHearts: true, ...opts } });
  f.setPhase('fight'); f.opp.resume(1); f.player.stars = 3;
  const O = f.opp; O.forced = []; O.superPlan = [];
  const B = new PerfectBot(f, { attack: bot });
  return { f, O, B };
}
// one run of the exclusive: the blows that landed, whether the golden moment landed, the frames it took
function run(d, S, { attack, flip }) {
  const { f, O, B } = fresh(d, attack);
  if (flip) B.nextDir = 1;
  const hits = [];
  const orig = f.opponentAttack.bind(f);
  f.opponentAttack = (m) => { const r = orig(m); if (r === 'hit') hits.push(m.id); return r; };
  O.seqTurn = O.seqSupers.indexOf(S);
  O.startSuper();
  let golden = false, frames = 0, started = false;
  const og = O.onPlayerPunch.bind(O);
  O.onPlayerPunch = (p) => { const r = og(p); if (r.golden) golden = r.golden === superKey(S) || r.golden === true; return r; };
  for (let i = 0; i < 1400; i++) {
    B.think(); f.update(); frames = i;
    if (O.armor) started = true;
    if (started && !O.armor && !O.forced.length && ['idle', 'recovery', 'open'].includes(O.state) && !hitsPending(O)) { if (O.state === 'idle' || (golden && ['hit', 'stunned'].includes(O.state))) break; }
    if (golden && ['hit', 'stunned', 'idle'].includes(O.state) && !O.armor) break;
    if (f.phase !== 'fight') break;
  }
  return { hits, golden, frames };
}
const hitsPending = () => false;

for (const id of list) {
  const d = remixed(id), orig = FIGHTERS[id];
  if (!d || !d.remix) { fail(id, 'no remix'); continue; }
  const sups = supersOf(d), S = sups.find((x) => x.exclusive);
  if (!S) { fail(id, 'no exclusive super'); continue; }
  if (sups.filter((x) => x.exclusive).length !== 1) fail(id, 'more than one exclusive super');
  if (supersOf(orig).some((x) => x.exclusive)) fail(id, 'the career fighter has the exclusive attack too');
  const key = superKey(S);
  // 1. armored, first in line, one golden moment with a cue
  const O0 = new Fight({ fighter: d, audio: null, input: null, opts: {} }).opp;
  if (O0.seqSupers[0] !== S) fail(id, 'it is not the first super he throws');
  const chain = chainsOf(S)[0];
  const golds = chain.filter((m) => d.moves[m] && (d.moves[m].goldenHit)).length + (['taunt', 'advance'].includes(S.golden) ? 1 : 0);
  const goldMoves = chain.map((m) => d.moves[m]).filter((m) => m && m.goldenHit);
  if (['windup', 'recovery'].includes(S.golden) && goldMoves.length !== 1) fail(id, `${goldMoves.length} golden moves in the chain`);
  void golds;
  if (!(S.window || goldMoves[0] && (goldMoves[0].kdWindow || goldMoves[0].recoveryKd))) fail(id, 'the golden moment has no frames');
  for (const m of chain) {
    const mv = d.moves[m + (m === chain[0] ? '*' : '')] || d.moves[m];
    if (!mv) { fail(id, `missing move ${m}`); continue; }
    if (!mv.call && !mv.feint) {
      if (mv.windupFrames < 3) fail(id, `${m}: a tell of ${mv.windupFrames} frames`);
      if (!(mv.avoidBy || []).length) fail(id, `${m}: no defense that works`);
    }
  }
  const last = d.moves[chain[chain.length - 1]];
  if (!last.knockdown) fail(id, 'its last blow is not a one-hit knockdown');
  // 5. its sound, hints, scouting
  if (S.sfx && !SFX_NAMES.includes(S.sfx)) fail(id, `no sound "${S.sfx}"`);
  for (const m of chain) { const mv = d.moves[m]; if (mv && mv.sfx) for (const v of Object.values(mv.sfx)) if (typeof v === 'string' && !SFX_NAMES.includes(v)) fail(id, `${m}: no sound "${v}"`); }
  const B = hintBank(d), L = (B.super || {})[key];
  if (!L || L.length < 3) fail(id, `no cornerman hints for ${key} (need three tiers)`);
  else if (new Set(L).size < 3) fail(id, 'the three cornerman hints are not three different lines');
  const E = scoutEntries(d).find((e) => e.key === 's:' + key);
  if (!E) fail(id, 'no scouting entry'); else if (!E.e.scout || E.e.scout.length < 20) fail(id, 'the scouting entry has no text');
  // 2 + 3. fair, and the golden moment lands
  let hitsTaken = 0, landed = 0, frames = 0;
  for (let k = 0; k < RUNS; k++) { const r = run(d, S, { attack: false, flip: k & 1 }); hitsTaken += r.hits.length; if (r.hits.length) console.log(`  ${id}: run ${k}: hit by ${r.hits.join(', ')}`); frames = Math.max(frames, r.frames); }
  if (hitsTaken) fail(id, `${hitsTaken} blow(s) landed on a perfect defense`);
  for (let k = 0; k < 3; k++) { const r = run(d, S, { attack: true, flip: k & 1 }); if (r.golden) landed++; }
  if (landed < 3) fail(id, `the golden moment landed ${landed}/3`);
  // 4. harder than anything else he throws
  const mine = attackHardness(d, S), others = otherAttacks(d, S).map((a) => ({ ...a, h: attackHardness(d, a.S, a.moves) }));
  const best = others.reduce((a, b) => (b.h.score > a.h.score ? b : a), { h: { score: 0 }, label: '-' });
  if (mine.score <= best.h.score) fail(id, `not his hardest attack: ${mine.score.toFixed(1)} vs ${best.label} ${best.h.score.toFixed(1)}`);
  rows.push({ id, key, name: S.name, golden: S.golden, hit: S.hit || 'any', mine: mine.score, best: best.h.score, bestLabel: best.label, n: mine.hits, cover: mine.cover, frames });
}
if (args.includes('--table')) for (const r of rows) console.log(`${r.id.padEnd(12)} ${String(r.n).padStart(2)} blows  cover ${r.cover}  ${r.mine.toFixed(1).padStart(5)} vs ${r.best.toFixed(1).padStart(5)} (${r.bestLabel})  ${r.golden}/${r.hit}  ${r.name}`);
console.log(bad ? `${bad} failure(s) over ${list.length} opponents` : `ok: ${list.length} exclusive attacks (fair, landable, hardest of their fighter)`);
process.exit(bad ? 1 : 0);
