// Balance audit (§9): every fighter against his circuit's row of the difficulty table.
//   node tools/balance.mjs [ids...] [--curve] [--fights N] [--td]
//
// Static checks (always):
//   tell      median windup of his real punches vs the circuit's tell window
//             (feints, calls, supers and chain follow-ups are left out: follow-ups are the
//             2nd+ punches of a combo, where the tell is the combo's first punch)
//   block     his heart drain on a blocked punch vs the circuit's "hearts lost when blocked"
//   dmg       his hardest real punch (damage x damageMult), and one-hit knockdowns
//             (§9: small hits early, one-hit knockdown signatures from Major on)
//   getup     the get-up table's first entry (slow and inconsistent early, "always up at 9" late)
//   stars     star sources (star windows, star open steps, punish stars)
//   kd        the perfect-hit rule (kdWindow / tauntKd / open-step kd)
// Anything outside the circuit's band is flagged with a '!'.
//
// --curve: a reaction-time difficulty gauge. The perfect-play bot defends with an
//   N-frame reaction time for full fights at several latencies, as a player who has
//   learned him (the follow-ups of his fixed chains are known, see bot.js `learned`),
//   and the table shows the share of his punches that land, and how many he throws. §9's curve should read:
//   gentle through Major, steep from World, a wall from Legends on. Outliers are
//   fighters much harder or easier than the rest of their circuit.
// --td: audit the Title Defense remixes instead (data/fighters/titleDefense.js).
import { FIGHTERS } from '../data/fighters/index.js';
import { CIRCUITS, ALL_ORDER as CIRCUIT_ORDER } from '../data/circuits.js'; // (the base game's circuits, then the Ascension's)
import { FRAMES_PER_SEC } from '../src/fight/fightState.js';
import { DAMAGE, damageOf } from '../data/difficulty.js';

const args = process.argv.slice(2);
const flag = (k) => args.includes(k);
const opt = (k, d) => { const i = args.indexOf(k); return i >= 0 ? +args[i + 1] : d; };
const ids = args.filter((a, i) => !a.startsWith('--') && !['--fights'].includes(args[i - 1]));

let roster = FIGHTERS;
if (flag('--td')) {
  const { TD_LISTS, remixed } = await import('../data/fighters/titleDefense.js');
  roster = Object.fromEntries(TD_LISTS.combined.map((id) => [id, remixed(id)]));
}
const list = (ids.length ? ids : Object.keys(roster)).filter((id) => roster[id]);
// (a rival fight sits with the circuit whose title it follows: CIRCUITS[id].after)
const order = (id) => { const c = CIRCUITS[id]; return CIRCUIT_ORDER.indexOf(c.after || id) + (c.after ? 0.5 : 0); };
list.sort((a, b) => order(roster[a].circuit) - order(roster[b].circuit));

// Per-circuit bands for the checks that the table doesn't pin down exactly.
// Index = position on CIRCUIT_ORDER (difficulty order). Damage is his hardest
// real punch in player health (100 = a full bar).
const BAND = { // (fighters off the difficulty curve only: everyone in FIGHTERS is on it)
  dmg: [[8, 20], [10, 22], [12, 26], [14, 30], [16, 34], [16, 34], [18, 40], [20, 44], [22, 48], [24, 52], [24, 52], [26, 56], [28, 60], [28, 64],
    // the Ascension (spec §18): Pantheon I-VII
    [22, 54], [24, 56], [26, 58], [28, 60], [30, 62], [32, 64], [34, 66],
    // Phase F: Halcyon, the Underworld I-VI, Vorgath, the Void I-III, ZERO's true form (A3: the damage side of the curve keeps rising
    // loosely; the levers that matter down there are tells, lives, healing and darkness)
    [30, 72], [28, 64], [28, 64], [28, 64], [30, 70], [30, 70], [30, 70], [40, 76], [30, 76], [30, 76], [30, 76], [45, 80]],
};

const median = (a) => { const s = [...a].sort((x, y) => x - y); return s.length ? s[Math.floor((s.length - 1) / 2)] : null; };
const pad = (s, n) => String(s).padEnd(n);

// A move that starts a punch (not a feint/call, not the 2nd+ punch of a chain).
function realMoves(d) {
  const follow = new Set();
  for (const p of d.patterns || []) {
    const st = p.steps || [];
    for (let i = 1; i < st.length; i++) if (st[i].move && st[i - 1].move && !d.moves[st[i - 1].move]?.feint) follow.add(st[i].move);
  }
  // a move that only ever follows another move directly is a chain follow-up
  const starts = new Set();
  for (const p of d.patterns || []) {
    const st = p.steps || [];
    st.forEach((s, i) => { if (s.move && !(i > 0 && st[i - 1].move && !d.moves[st[i - 1].move]?.feint)) starts.add(s.move); });
  }
  // (a move with no defense at all is a standoff's punishment, Quinn's BANG!: not a tell)
  return Object.entries(d.moves).filter(([id, m]) => !m.super && !m.feint && !m.call && !m.strike && m.activeFrames > 0 && m.avoidBy.length && (starts.has(id) || !follow.has(id)))
    .map(([id, m]) => ({ id, ...m }));
}

function audit(id) {
  const d = roster[id], c = CIRCUITS[d.circuit], ci = order(d.circuit);
  const flags = [];
  const moves = realMoves(d);
  const allReal = Object.values(d.moves).filter((m) => !m.feint && !m.call && m.activeFrames > 0);
  // (a move with a `quiet` lead, Link's chain rattle before he moves, has that many frames of sound-only warning: the tell is what shows)
  const w = moves.map((m) => m.windupFrames - (m.quiet || 0));
  const med = median(w), min = Math.min(...w);
  // tells: the median opener should sit within ~40% of the circuit window
  // (longer early is fine: the table is the target, holds are extra), and none
  // should be shorter than the window minus a third (except the boss's signature).
  const tellLo = Math.floor(c.tellWindow * 0.67), tellHi = Math.ceil(c.tellWindow * 1.5) + 2;
  // (the Counter Shard's tells are long on purpose: nothing hurts him but a counter, and every counter window is three frames wide)
  if (!d.longTells && (med < tellLo || med > tellHi)) flags.push(`tell median ${med}f (window ${c.tellWindow}f, band ${tellLo}-${tellHi})`);
  const shortest = moves.filter((m) => m.windupFrames - (m.quiet || 0) < tellLo && !m.knockdown);
  if (shortest.length) flags.push(`short tells: ${shortest.map((m) => `${m.id} ${m.windupFrames - (m.quiet || 0)}f`).join(', ')}`);
  const drain = d.stats.heartDrainOnBlock ?? c.heartsLostOnBlock;
  if (drain !== c.heartsLostOnBlock) flags.push(`block drain ${drain} (table ${c.heartsLostOnBlock})`);
  const dm = d.stats.damageMult || 1;
  const hardest = Math.max(...allReal.filter((m) => !m.knockdown).map((m) => Math.round(m.damage * dm)));
  // (the damage curve lives in data/difficulty.js: his average punch against the curve at his heat, his own weight kept in part)
  if (d.difficulty) {
    const want = DAMAGE.at0 + (DAMAGE.at1 - DAMAGE.at0) * d.difficulty.h, avg = damageOf(d);
    if (avg < want * 0.6 || avg > want * 1.5) flags.push(`average punch ${avg.toFixed(1)} (curve ${want.toFixed(1)})`);
  } else {
    const [dlo, dhi] = BAND.dmg[ci] || [0, 999];
    if (hardest < dlo || hardest > dhi) flags.push(`hardest punch ${hardest} (band ${dlo}-${dhi})`);
  }
  const kos = allReal.filter((m) => m.knockdown).map((m) => m.id);
  const majorPlus = ci >= CIRCUIT_ORDER.indexOf('major');
  if (kos.length && !majorPlus) flags.push(`one-hit knockdown before Major: ${kos.join(', ')}`);
  const g0 = d.getUpTable[0];
  // (§9: opponents rise later and later, "always up at 9" from the Grand Prix on; nothing in the Ascension rises before 8)
  if (ci >= CIRCUIT_ORDER.indexOf('p1') && g0.upAt && g0.upAt[0] < 8) flags.push(`first get-up ${g0.upAt.join('-')} (the Ascension rises at 8+)`);
  const kd = Object.values(d.moves).some((m) => m.kdWindow || m.kdOnCue || m.recoveryKd) || !!d.tauntKd || !!(d.super && d.super.window)
    || (d.special || []).some((m) => m.step && m.step.kd)
    || (d.patterns || []).some((p) => p.steps.some((s) => s.kd)) || Object.values(d.moves).some((m) => m.openAfter && m.openAfter.kd);
  if (!kd) flags.push('NO PERFECT-HIT KNOCKDOWN (design rule)');
  const stars = Object.values(d.moves).filter((m) => m.starWindow).length
    + (d.patterns || []).reduce((n, p) => n + p.steps.filter((s) => s.star).length, 0)
    + Object.values(d.moves).filter((m) => m.punishStar || (m.openAfter && m.openAfter.star)).length;
  return {
    id, d, c, flags,
    row: [pad(id, 10), pad(c.id.slice(0, 11), 12), pad(`${med}/${min}f`, 8), pad(c.tellWindow + 'f', 5), pad(drain + '/' + c.heartsLostOnBlock, 5),
      pad(d.stats.health, 5), pad(`${hardest}${kos.length ? '+KO' : ''}`, 8), pad(g0.upAt ? g0.upAt.join('-') : '--', 6), pad(stars, 4), pad(c.randomness, 9)].join(''),
  };
}

console.log(`${pad('fighter', 10)}${pad('circuit', 12)}${pad('tell', 8)}${pad('win', 5)}${pad('blk', 5)}${pad('hp', 5)}${pad('maxdmg', 8)}${pad('getup', 6)}${pad('*src', 4)}random`);
let nflag = 0;
for (const id of list) {
  const a = audit(id);
  console.log(a.row + (a.flags.length ? '  !' : ''));
  for (const f of a.flags) { console.log(`    ! ${f}`); nflag++; }
}
console.log(`\n${nflag} flag(s)`);

if (flag('--curve')) {
  const { Fight } = await import('../src/fight/fightState.js');
  const { PerfectBot } = await import('../src/fight/bot.js');
  const LATS = [8, 12, 16, 20];
  const N = opt('--fights', 2);
  console.log(`\nReaction-time curve, defending only (${N} fight(s) each): % of his punches that land, and punches per game minute`);
  console.log(`${pad('fighter', 10)}${pad('circuit', 12)}${LATS.map((l) => pad(`${l}f`, 7)).join('')}${pad('ppm', 5)}`);
  const byCircuit = {};
  for (const id of list) {
    const row = [];
    let ppm = 0;
    for (const lat of LATS) {
      let hits = 0, thrown = 0, frames = 0;
      for (let k = 0; k < N; k++) {
        const f = new Fight({ fighter: roster[id], audio: null, input: null, opts: { invincible: true } });
        const bot = new PerfectBot(f, { attack: false, latency: lat, learned: true });
        const orig = f.opponentAttack.bind(f);
        f.opponentAttack = (m) => { if (f.phase === 'fight') thrown++; return orig(m); };
        let done = false;
        f.opts.onEnd = () => { done = true; };
        for (let i = 0; i < 60000 && !done; i++) { bot.think(); f.update(); if (f.phase === 'fight') frames++; }
        hits += f.stats.hitsTaken;
      }
      row.push(thrown ? (100 * hits) / thrown : 0);
      ppm = thrown / (frames / (FRAMES_PER_SEC * 60)); // per game minute
    }
    (byCircuit[roster[id].circuit] ||= []).push([id, row]);
    console.log(`${pad(id, 10)}${pad(roster[id].circuit.slice(0, 11), 12)}${row.map((v) => pad(v.toFixed(0) + '%', 7)).join('')}${pad(ppm.toFixed(0), 5)}`);
  }
  console.log('\nCircuit averages');
  for (const [c, rows] of Object.entries(byCircuit)) {
    const avg = LATS.map((_, i) => rows.reduce((s, r) => s + r[1][i], 0) / rows.length);
    console.log(`${pad(c, 22)}${avg.map((v) => pad(v.toFixed(0) + '%', 7)).join('')}`);
  }
}
