// Dash's file on you (knowledge spec K3, the Dash row of K6): what gets saved after a fight and what the
// next fight does with it.
//   node tools/rival-record-test.mjs
// 1. BehaviorTracker.strategy() names the right style for each kind of play (crafted totals).
// 2. Real fights against Dash: a turtle, a jab-spammer and a waiter each end a one-round fight; the record
//    put() is that style, and the next Dash reads it and switches on the matching answer.
// 3. Every answer, for every Dash: the perfect-play bot (defense only) takes no hit with it switched on.
// Exit code 1 on any failure.
import { Fight } from '../src/fight/fightState.js';
import { PerfectBot } from '../src/fight/bot.js';
import { BehaviorTracker, STRATEGIES } from '../src/fight/behavior.js';
import { FIGHTERS } from '../data/fighters/index.js';

let bad = 0, n = 0;
const check = (ok, text) => { n++; if (!ok) bad++; console.log(`  ${ok ? 'ok  ' : 'FAIL'} ${text}`); };

// --- 1. the classifier ---------------------------------------------------------------------
console.log('strategy() from the whole fight:');
const T0 = { punches: 60, head: 30, body: 30, left: 30, right: 30, stars: 0, landed: 20, counters: 10, blocks: 6, blockFrames: 200, dodgeL: 6, dodgeR: 6, early: 1, repeats: 0, rushed: 0, maxPassive: 200, maxHoard: 0, spam: 0 };
const tracker = (over, t = 3600) => { const b = new BehaviorTracker({}); b.t = t; b.total = { ...T0, ...over }; return b.strategy().key; };
const CASES = {
  none: {},
  jab: { punches: 160 },
  turtle: { blockFrames: 1900 },
  early: { dodgeL: 6, dodgeR: 6, early: 9 },
  bias: { dodgeL: 11, dodgeR: 1, early: 2 },
  hoard: { maxHoard: 900 },
  zone: { head: 55, body: 5 },
  passive: { maxPassive: 1500 },
  rush: { rushed: 14 },
  repeat: { repeats: 5 },
};
for (const [want, over] of Object.entries(CASES)) { const got = tracker(over); check(got === want, `${want.padEnd(8)} -> ${got}`); }
check(STRATEGIES.every((k) => k in CASES), 'every strategy the tracker can name is covered above');

// --- 2. real fights, and the next fight reads the file ----------------------------------------------
class Driven {
  constructor(fn) { this.fn = fn; this.now = new Set(); this.f = 0; }
  pressed(a) { return this.now.has(a); }
  held(a) { return this.now.has(a); }
  released() { return false; }
  confirm() { return false; }
  back() { return false; }
  anyPressed() { return false; }
  update() { this.now.clear(); this.f++; this.fn(this); }
  tap(...a) { for (const k of a) this.now.add(k); }
}
function play(dash, fn, record = null) {
  const saved = [];
  const inp = new Driven(fn);
  const f = new Fight({ fighter: FIGHTERS[dash], audio: null, input: inp, opts: { rounds: 1, roundFrames: 4320, infiniteHealth: true, infiniteHearts: true, rivalRecord: { get: () => record, put: (r) => saved.push(r) } } });
  let done = false; f.opts.onEnd = () => { done = true; };
  for (let i = 0; i < 40000 && !done && f.phase !== 'between'; i++) { if (f.phase === 'fight' || f.phase === 'intro' || f.phase === 'announce') inp.update(); f.update(); }
  if (!done) { f.result = f.makeResult('opponent', 'KO'); f.end(); } // (no judges: a player who only turtles or stands still is not ended by the bell: the fight is called off after the round)
  return { f, saved };
}
console.log('real fights against Dash I:');
const STYLES = {
  turtle: (i) => { if (i.f % 24 === 1) i.tap('down'); },
  jab: (i) => { if (i.f % 9 === 1) i.tap(i.f % 18 === 1 ? 'a' : 'b'); },
  passive: () => {},
};
for (const [want, fn] of Object.entries(STYLES)) {
  const { saved } = play('dash1', fn);
  check(saved.length === 1 && saved[0].key === want, `${want.padEnd(8)} fight saved ${JSON.stringify(saved[0] && { key: saved[0].key, score: saved[0].score, fight: saved[0].fight })}`);
  const g = new Fight({ fighter: FIGHTERS.dash2, audio: null, input: new Driven(() => {}), opts: { rounds: 1, rivalRecord: { get: () => saved[0], put() {} } } });
  for (let i = 0; i < 600 && g.phase !== 'fight'; i++) g.update();
  for (let i = 0; i < 6; i++) g.update();
  const K = g.opp.know, ans = `fileOnYou:${want}`;
  check(K.st.fileOnYou.key === want && K.force.antis.has(ans), `next Dash reads it: opens with the answer to ${want} (${ans})`);
}
{
  // no record, or a style that didn't stand out: no answer switched on
  for (const rec of [null, { key: 'none' }]) {
    const g = new Fight({ fighter: FIGHTERS.dash3, audio: null, input: new Driven(() => {}), opts: { rounds: 1, rivalRecord: { get: () => rec, put() {} } } });
    for (let i = 0; i < 600 && g.phase !== 'fight'; i++) g.update();
    for (let i = 0; i < 6; i++) g.update();
    check(g.opp.know.force.antis.size === 0, `${rec ? 'a record of "none"' : 'no record'}: he opens with nothing`);
  }
  // the answer only lasts the first 25 seconds of the fight
  const g = new Fight({ fighter: FIGHTERS.dash4, audio: null, input: new Driven(() => {}), opts: { rounds: 1, invincible: true, rivalRecord: { get: () => ({ key: 'turtle' }), put() {} } } });
  for (let i = 0; i < 600 && g.phase !== 'fight'; i++) g.update();
  for (let i = 0; i < 6; i++) g.update();
  const on = g.opp.know.force.antis.has('fileOnYou:turtle');
  for (let i = 0; i < 1600; i++) g.update();
  check(on && !g.opp.know.force.antis.has('fileOnYou:turtle'), 'the answer is switched on at the bell and off again after 25 seconds');
}

// --- 3. every answer stays fair -----------------------------------------------------------------------
console.log('perfect-play defense with each answer switched on:');
for (const dash of ['dash1', 'dash2', 'dash3', 'dash4', 'dash5', 'dash6', 'dash7', 'dash8']) {
  const res = [];
  for (const key of STRATEGIES) {
    const f = new Fight({ fighter: FIGHTERS[dash], audio: null, input: null, opts: { rounds: 1, rivalRecord: { get: () => ({ key }), put() {} } } });
    const bot = new PerfectBot(f, { attack: false });
    let r = null; f.opts.onEnd = (x) => { r = x; };
    for (let i = 0; i < 60000 && !r; i++) { bot.think(); f.update(); }
    if (f.stats.hitsTaken) res.push(`${key}: ${f.stats.hitsTaken} hits`);
  }
  check(!res.length, `${dash}: ${res.length ? res.join('; ') : 'untouched with all 9 answers'}`);
}
console.log(`\n${n - bad}/${n} checks passed`);
process.exit(bad ? 1 : 0);
