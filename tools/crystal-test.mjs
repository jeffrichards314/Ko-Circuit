// ZERO's crystals (the true form rework, 2026-10-04), through the real fight code:
//   node tools/crystal-test.mjs [--td] [--runs N]
//   1. twelve whole crystals at the start of every fight (a new fight, a new Title Defense attempt: nothing carries over)
//   2. every crystal's glow is lit BEFORE an attack of its family comes (from the step back of its crystal attack; at the start of the windup of any
//      family blow in his routines) and unlit crystals stay dim
//   3. each crystal attack (the twelve, the pair, the Convergence in Title Defense), run again and again with the perfect-play bot defending, never
//      lands a blow; the bot's golden moment lands, cracks exactly the crystals in that attack and no other
//   4. a cracked crystal's whole family is out of his pool: its moves are skipped, they are gone from a new pattern, its test segment is skipped,
//      its attack is never picked again
//   5. his plain routine is never taken away (nothing breaks with all twelve cracked: he still throws punches)
import { Fight } from '../src/fight/fightState.js';
import { PerfectBot } from '../src/fight/bot.js';
import { FIGHTERS } from '../data/fighters/index.js';
import { remixed } from '../data/fighters/titleDefense.js';
import { supersOf } from '../data/fighters/super.js';
import { CRYSTALS, CRYSTAL_OF_MOVE } from '../data/fighters/void/crystals.js';
import { isBroken, aliveCrystals, derive } from '../src/fight/asc/crystals.js';

const args = process.argv.slice(2);
const TD = args.includes('--td');
const RUNS = args.includes('--runs') ? +args[args.indexOf('--runs') + 1] : 8;
const d = TD ? remixed('zeroTrue') : FIGHTERS.zeroTrue;
let bad = 0, ok = 0;
const fail = (why) => { bad++; console.log(`FAIL ${why}`); };
const NOINPUT = { pressed: () => false, held: () => false, released: () => false, confirm: () => false, back: () => false, anyPressed: () => false };
const fresh = (opts = {}) => {
  const f = new Fight({ fighter: d, audio: null, input: NOINPUT, opts: { invincible: opts.invincible ?? false, infiniteHearts: true, ...opts } });
  f.setPhase('fight'); f.opp.resume(1); f.player.stars = 3;
  f.opp.forced = []; f.opp.superPlan = [];
  return f;
};

// 1. twelve whole
{
  const f = fresh(), g = fresh();
  if (aliveCrystals(f.opp).length !== 12 || aliveCrystals(g.opp).length !== 12) fail('a new fight does not start with twelve whole crystals');
  f.opp.mods.cr.broken.dodgeShard = 1;
  if (aliveCrystals(fresh().opp).length !== 12) fail('a cracked crystal carried over into a new fight');
  ok++;
}

// 2. the glow comes first
{
  const f = fresh({ invincible: true }), O = f.opp, C = O.mods.cr;
  let checked = 0, late = 0;
  const bot = new PerfectBot(f, { attack: false });
  for (let i = 0; i < 20000 && f.phase === 'fight'; i++) {
    bot.think();
    const wasState = O.state;
    f.update();
    if (O.state === 'windup' && wasState !== 'windup' && O.moveT <= 1) {
      const id = CRYSTAL_OF_MOVE[O.moveId];
      if (id) { checked++; if (C.glow[id] < 0.85) late++; }
    }
  }
  if (!checked) fail('no family blow was thrown in the glow test');
  else if (late) fail(`${late} of ${checked} family blows came before their crystal was lit`);
  else ok++;
}

// 3. every crystal attack: fair, and its golden moment cracks exactly its crystals
const attacks = supersOf(d).filter((S) => S.crystal || S.pair || S.exclusive);
for (const S0 of attacks) {
  const label = S0.name;
  const pairs = S0.pair ? [['rhythmShard', 'memoryShard'], ['dodgeShard', 'timeShard'], ['counterShard', 'chaosShard']] : S0.exclusive ? [['dodgeShard', 'blockShard', 'duckShard', 'counterShard'], ['sightShard', 'soundShard', 'rhythmShard', 'echoShard'], ['timeShard', 'willShard'], ['willShard']] : [null];
  for (const ids of pairs) {
    // defense: the bot defends (slips starting each side), never hit
    for (const flip of [false, true]) {
      for (let r = 0; r < Math.max(1, RUNS >> 1); r++) {
        const f = fresh(), O = f.opp, B = new PerfectBot(f, { attack: false });
        if (flip) B.nextDir = 1;
        const hits = [];
        const orig = f.opponentAttack.bind(f);
        f.opponentAttack = (m) => { const res = orig(m); if (res === 'hit') hits.push(m.id); return res; };
        // (the pair's and the Convergence's blows are chosen as he throws it: built here from the crystals named)
        const S = ids ? derive(O, S0, ids, S0.pair ? 'pair' : 'convergence') : S0;
        O.startSuper(S);
        let started = false;
        for (let i = 0; i < 1600; i++) { B.think(); f.update(); if (O.armor) started = true; if (started && !O.armor && !O.forced.length && O.state === 'idle') break; }
        if (hits.length) { fail(`${label} ${ids ? ids.join('+') : ''}: ${hits.length} blows landed under perfect defense (${hits.slice(0, 3).join(', ')}) flip=${flip}`); break; }
      }
    }
    // golden: the bot lands it and exactly the crystals of the attack crack
    {
      const f = fresh({ invincible: true }), O = f.opp, bot = new PerfectBot(f, { attack: true });
      const before = new Set(Object.keys(O.mods.cr.broken));
      f.input = bot;
      const S = ids ? derive(O, S0, ids, S0.pair ? 'pair' : 'convergence') : S0, want = S.crystals || (S.crystal ? [S.crystal] : []);
      O.startSuper(S);
      let got = false;
      const og = O.onPlayerPunch.bind(O);
      O.onPlayerPunch = (p) => { const r = og(p); if (r.golden) got = true; return r; };
      for (let i = 0; i < 1400 && !got; i++) { bot.think(); f.update(); }
      if (!got) { fail(`${label}: the bot could not land the golden moment`); continue; }
      const cracked = Object.keys(O.mods.cr.broken).filter((k) => !before.has(k)).sort(), expect = [...want].filter((k) => !before.has(k)).sort();
      if (cracked.join() !== expect.join()) fail(`${label}: cracked ${cracked.join('+') || 'nothing'}, wanted ${expect.join('+')}`);
      else if (!want.length) fail(`${label}: it names no crystal`);
      else ok++;
    }
  }
}

// 3b. in Title Defense the Convergence is the first super of the fight (and then every third)
if (TD) {
  const f = fresh(), O = f.opp, M = O.modifiers.find((m) => m.cfg.type === 'crystals');
  const picks = [0, 1, 2, 3].map(() => M.def.pickSuper(O, M.cfg, O.seqSupers));
  if (!picks[0].exclusive || picks[1].exclusive || picks[2].exclusive || !picks[3].exclusive) fail('the Convergence is not the first super and then every third');
  else if (picks[0].crystals.length !== 4) fail(`the Convergence ran ${picks[0].crystals.length} crystals, wanted 4`);
  else ok++;
}

// 4. a cracked crystal's family leaves his pool
{
  const f = fresh(), O = f.opp, C = O.mods.cr;
  C.broken.dodgeShard = 1; C.broken.willShard = 1;
  const M = O.modifiers.find((m) => m.cfg.type === 'crystals');
  if (!M.def.removed(O, M.cfg, 'dodge_jab') || !M.def.removed(O, M.cfg, 'will_wall') || M.def.removed(O, M.cfg, 'block_jab')) fail('removed() does not follow the cracked crystals');
  const pat = d.patterns.find((p) => p.id === 'final1');
  const steps = M.def.steps(O, M.cfg, pat.steps);
  const bad2 = steps.filter((s) => s.move && ['dodgeShard', 'willShard'].includes(CRYSTAL_OF_MOVE[s.move]));
  if (bad2.length) fail('a pattern kept moves of a cracked crystal');
  if (steps.length >= pat.steps.length) fail('a pattern was not shortened by the cracked crystals');
  // his supers: never one of theirs
  O.superPlan = [0];
  for (let i = 0; i < 80; i++) { const S = M.def.pickSuper(O, M.cfg, O.seqSupers); const ids = S.crystals || (S.crystal ? [S.crystal] : []); if (ids.some((x) => isBroken(O, x))) { fail(`a cracked crystal's attack was picked again (${S.name})`); break; } }
  // the segments: the test of a cracked crystal is skipped
  const seg = O.modifiers.find((m) => m.cfg.type === 'zeroSeg');
  const seen = new Set();
  const R = seg.cfg.rounds[1];
  for (let i = 0; i < 12; i++) { O.fight.clockFrames = f.roundFrames - Math.round((i + 0.5) * (f.roundFrames / 10)); f.bossPhase = 1; seg.def.update(O, seg.cfg); seen.add(O.mods.seg); }
  void R;
  if (seen.has('dodge') || seen.has('will')) fail('a cracked crystal\'s test segment still ran');
  else ok++;
}

// 5. nothing left: every crystal cracked, he still fights
{
  const f = fresh({ invincible: true }), O = f.opp;
  for (const c of CRYSTALS) O.mods.cr.broken[c.id] = -9999;
  let thrown = 0;
  const orig = f.opponentAttack.bind(f);
  f.opponentAttack = (m) => { thrown++; return orig(m); };
  const bot = new PerfectBot(f, { attack: false });
  for (let i = 0; i < 6000; i++) { bot.think(); f.update(); }
  if (thrown < 5) fail(`with every crystal cracked he threw only ${thrown} blows in 100 seconds`);
  else ok++;
}

console.log(bad ? `${bad} failure(s), ${ok} checks passed` : `ok: ${ok} checks passed (${TD ? 'Title Defense' : 'Career'})`);
process.exit(bad ? 1 : 0);
