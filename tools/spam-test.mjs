// Button-mash check: does spamming punches beat him? (It shouldn't: like Punch-Out,
// hits should come from counters in his tells and punishes after you slip a punch.)
//   node tools/spam-test.mjs [ids...] [--fights N] [--latency N] [--circuit id] [--td]   (--td: the Title Defense remixes; every fighter of any defense by default)
// Three players fight each opponent:
//   pure:    mashes jabs and never defends (a button-masher)
//   masher:  the perfect-play bot's defense with an N-frame reaction time (default 14),
//            and a jab whenever it isn't busy defending (random heights, both hands)
//   patient: the same defense, with the perfect-play bot's offense (counters,
//            punishes, stars, perfect hits)
// Prints wins, % of punches that landed, hits taken, counters landed and the average
// fight length in game seconds, per fight.
import { Fight } from '../src/fight/fightState.js';
import { PerfectBot } from '../src/fight/bot.js';
import { FIGHTERS } from '../data/fighters/index.js';
import { CIRCUITS } from '../data/circuits.js';
import { remixed, TD_LISTS } from '../data/fighters/titleDefense.js';

const args = process.argv.slice(2);
const opt = (k, d) => { const i = args.indexOf(k); return i >= 0 ? args[i + 1] : d; };
const N = +opt('--fights', 6);
const LAT = +opt('--latency', 14);
const circ = opt('--circuit', null);
const ids = args.filter((a, i) => !a.startsWith('--') && !['--fights', '--latency', '--circuit'].includes(args[i - 1]) && a !== '--strip');
const TD = args.includes('--td');
const STRIP = args.includes('--strip'); // (compare against the fighter without his knowledge layer)
const list = ids.length ? ids : TD ? TD_LISTS.combined : circ ? CIRCUITS[circ].fighters : [...CIRCUITS.rookie.fighters, ...CIRCUITS.minor.fighters, ...CIRCUITS.metro.fighters, ...CIRCUITS.major.fighters];

class Masher extends PerfectBot {
  offense(P) {
    if (P.pink) return;
    // mash: a new punch on every frame the player could start (or queue) one
    if (P.state === 'idle' || P.state === 'jab' || (P.state === 'dodge' && P.dodgeSuccess)) {
      if ((this.f.clock & 1) === 0) this.jab(Math.random() < 0.5);
    }
  }
}

class Pure extends Masher { defend() { return false; } }

function run(id, Bot) {
  const base = TD ? remixed(id) : FIGHTERS[id];
  const d = STRIP ? { ...base, exploits: [], antiStrategies: [], scriptedMoments: [], stateTriggers: [] } : base;
  const f = new Fight({ fighter: d, audio: null, input: null, opts: {} }); // (the fighter's own round count: the Will Shard's five, ZERO's four phases)
  const bot = new Bot(f, { attack: true, latency: LAT });
  let result = null;
  f.opts.onEnd = (r) => { result = r; };
  for (let i = 0; i < 200000 && !result; i++) { bot.think(); f.update(); }
  return { result, stats: f.stats };
}

console.log(`reaction time ${LAT} frames, ${N} fights each\n`);
console.log('opponent'.padEnd(12), ...['PURE MASH', 'DEFEND+MASH', 'PATIENT'].map((h) => `${h} win land% taken ctr  len`.padEnd(38)));
for (const id of list) {
  const row = [id.padEnd(12)];
  for (const Bot of [Pure, Masher, PerfectBot]) {
    let w = 0, thrown = 0, landed = 0, taken = 0, ctr = 0, len = 0;
    for (let k = 0; k < N; k++) {
      const r = run(id, Bot);
      if (r.result && r.result.winner === 'player') w++;
      len += r.result ? r.result.seconds : 540; thrown += r.stats.thrown; landed += r.stats.landed; taken += r.stats.hitsTaken; ctr += r.stats.counters;
    }
    const pct = thrown ? Math.round((100 * landed) / thrown) : 0;
    row.push(`${String(w).padStart(2)}/${N} ${String(pct).padStart(3)}% ${(taken / N).toFixed(1).padStart(5)} ${(ctr / N).toFixed(1).padStart(4)} ${String(Math.round(len / N)).padStart(4)}`.padEnd(38));
  }
  console.log(row.join(' '));
}
