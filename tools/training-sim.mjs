// Training drill calibration: plays each drill headlessly with simulated players
// of different skill and prints the scores, next to the medal thresholds.
//   node tools/training-sim.mjs [--runs N]
import { DRILL_CLASS, DRILLS, medalOf } from '../src/screens/training.js';
import { DEFAULT_PROFILE } from '../data/customization.js';

const args = process.argv.slice(2);
const RUNS = args.includes('--runs') ? +args[args.indexOf('--runs') + 1] : 20;
const MEDAL = ['-', 'BRONZE', 'SILVER', 'GOLD'];
const gauss = () => { let u = 0; for (let i = 0; i < 6; i++) u += Math.random(); return (u - 3) / Math.sqrt(0.5); };

function play(game, brain) {
  const screen = { g: { profile: DEFAULT_PROFILE }, args: { to: 'world' } };
  const d = new DRILL_CLASS[game](screen);
  const A = { sfx() {}, stop() {} };
  let now = new Set();
  const I = { pressed: (k) => now.has(k), held: () => false };
  for (let f = 0; f < 20000 && !d.done; f++) { now = new Set(brain(d, f)); d.update(I, A); }
  return d.score;
}

// players: sd = timing error (frames, gaussian); rate = mash presses per second
const players = {
  bag: {
    perfect: () => { let plan = null; return (d) => { const i = d.next; if (i >= d.times.length) return []; return d.t + 1 === d.times[i] ? [i % 2 ? 'a' : 'b'] : []; }; },
    good: (sd) => () => { const off = {}; return (d) => { const i = d.next; if (i >= d.times.length) return []; if (off[i] === undefined) off[i] = Math.round(gauss() * sd); return d.t + 1 === d.times[i] + off[i] ? [i % 2 ? 'a' : 'b'] : []; }; },
  },
  rope: {
    timed: (sd) => () => { let target = null; return (d) => {
      if (d.h > 0 || d.stumble > 0 || d.t < d.start) { target = null; return []; }
      const P = d.period(), th = d.theta % (Math.PI * 2);
      const toPass = Math.round(((Math.PI - th + Math.PI * 2) % (Math.PI * 2)) / (Math.PI * 2 / P));
      if (target === null) target = Math.max(2, 10 + Math.round(gauss() * sd));
      if (toPass <= target) { target = null; return ['a']; }
      return [];
    }; },
  },
  run: {
    mash: (rate, jumpSd) => () => { let next = 0, hand = 'a'; return (d, f) => {
      const out = [];
      if (d.t >= d.start && f >= next) { out.push(hand); hand = hand === 'a' ? 'b' : 'a'; next = f + 60 / rate; }
      // jump when the next obstacle is about one reaction away
      const o = d.obs.find((x) => !x.hit && x.x - d.dist > -4);
      if (o && d.h === 0 && d.v > 0) { const frames = (o.x - d.dist - 8) / d.v; if (frames <= 12 + (d.jumpErr ?? (d.jumpErr = gauss() * jumpSd)) && frames > 0) { out.push('up'); d.jumpErr = null; } }
      return out;
    }; },
  },
};

function report(game, name, mk) {
  const s = []; for (let k = 0; k < RUNS; k++) s.push(play(game, mk()));
  s.sort((a, b) => a - b);
  const med = s[Math.floor(s.length / 2)];
  console.log(`  ${name.padEnd(26)} median ${String(med).padStart(4)}  (min ${s[0]}, max ${s[s.length - 1]})  ${MEDAL[medalOf(game, med)]}`);
}

console.log(`SPEED BAG  medals ${DRILLS.bag.medals.join(' / ')}`);
report('bag', 'frame-perfect', players.bag.perfect);
for (const sd of [2, 3, 4, 6]) report('bag', `timing error sd ${sd}f`, players.bag.good(sd));
console.log(`JUMP ROPE  medals ${DRILLS.rope.medals.join(' / ')}`);
for (const sd of [0, 2, 3, 4, 6]) report('rope', `timing error sd ${sd}f`, players.rope.timed(sd));
console.log(`ROAD RUN   medals ${DRILLS.run.medals.join(' / ')}`);
for (const [r, j] of [[6, 3], [8, 3], [10, 3], [12, 2], [14, 1]]) report('run', `${r} presses/s, jump sd ${j}f`, players.run.mash(r, j));
