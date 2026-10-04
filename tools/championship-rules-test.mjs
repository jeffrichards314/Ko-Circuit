// The rules of the championship rounds (spec §4): no decisions, round 4 on, sudden death from round 6, the clock, the boss phases.
//   node tools/championship-rules-test.mjs
// (The numbers' effect on real fights, with the human-model player, is tools/championship-test.mjs.)
import { Fight, clockString } from '../src/fight/fightState.js';
import { FIGHTERS } from '../data/fighters/index.js';
import { CHAMPIONSHIP, ROUND, escalation, roundFrames, REGULATION, BOUTS } from '../data/difficulty.js';
import { Frame } from '../src/engine/renderer.js';
import { championshipCall } from '../src/fight/cornerman.js';

let n = 0, bad = 0;
const ok = (c, m) => { n++; if (!c) { bad++; console.log('  FAIL', m); } };
const inp = { pressed: () => false, held: () => false, released: () => false, confirm: () => false, back: () => false, anyPressed: () => false, update() {} };
// skip the announcer, intro and the bell: into the fight proper
function start(id, opts = {}) {
  const f = new Fight({ fighter: FIGHTERS[id], audio: null, input: inp, opts: { ...opts } });
  let res = null; f.opts.onEnd = (r) => { res = r; };
  f.result$ = () => res;
  for (let i = 0; i < 400 && f.phase !== 'fight'; i++) f.update();
  return f;
}
const run = (f, frames) => { for (let i = 0; i < frames && f.phase === 'fight'; i++) f.update(); };
// play the bell out and walk through the corner into the next round
function nextRound(f) {
  let g = 0;
  while (f.phase !== 'fight' && !f.result && g++ < 4000) { if (f.phase === 'between') f.corner.t = 2000; f.update(); }
}
function endRound(f) { f.clockFrames = 1; f.update(); }

// --- the clock: the same for every fight -----------------------------------------------------------------
{
  const f = start('gus'), b = start('jax');
  ok(f.roundFrames === 4320 && roundFrames(false) === 4320 && f.fps === 24, 'a round is 3:00 on a 24-frame game clock (72 real seconds)');
  ok(b.roundFrames === 5400 && b.fps === 30 && roundFrames(true) === 5400, 'a big boss keeps his slower clock (3:00 over 90 real seconds)');
  ok(ROUND.game === 180 && REGULATION === 3, 'three regular rounds of 180 game seconds');
  const dw = new Fight({ fighter: FIGHTERS.barney, audio: null, input: inp, opts: {} });
  ok(dw.rounds === 3 && dw.round === 1 && dw.esc.c === 0, 'a fight starts at round 1, a normal one');
  for (const id of ['nox', 'blockShard', 'herald', 'tess', 'hank']) ok(new Fight({ fighter: FIGHTERS[id], audio: null, input: inp, opts: {} }).roundFrames === 4320, `${id}: no round of his own (standard clock)`);
  ok(clockString(Math.ceil(f.clockFrames / f.fps)) === '3:00', 'the clock reads 3:00');
}

// --- no decisions: round 3 ends, round 4 is a championship round ---------------------------------------------
{
  const f = start('gus');
  f.round = 3; endRound(f);
  ok(f.phase === 'roundEnd', 'the bell of round 3');
  nextRound(f);
  ok(f.round === 4 && f.phase === 'fight' && !f.result && f.esc.c === 1 && !f.esc.sudden, 'round 3 ends with nobody down: round 4, a championship round, no judges, no result');
  f.opp.state = 'idle'; f.opp.wait = 99999;
  endRound(f); nextRound(f);
  ok(f.round === 5 && f.esc.c === 2 && !f.esc.sudden, 'round 5 is the second championship round');
  endRound(f); nextRound(f);
  ok(f.round === 6 && f.esc.c === 3 && f.esc.sudden, 'round 6 is sudden death');
  ok(['intro', 'fight'].includes(f.phase) && !f.result, 'and no result yet');
  const fr = new Frame(); f.render(fr);
  ok(true, 'renders');
}

// --- the escalation table ------------------------------------------------------------------------------------------
{
  const E = [1, 2, 3, 4, 5, 8].map(escalation), E0 = escalation(0);
  ok(E0.pace === 1 && E0.openings === 1 && E0.damage === 1 && E0.supers === 0 && E0.oppHeal === 1 && E0.youHeal === 1 && !E0.sudden, 'a normal round is untouched');
  const mono = (k, dir) => E.every((e, i) => !i || (dir > 0 ? e[k] >= E[i - 1][k] : e[k] <= E[i - 1][k]));
  ok(mono('pace', -1) && mono('openings', -1) && mono('idle', -1) && mono('oppHeal', -1) && mono('youHeal', -1) && mono('supers', 1) && mono('damage', 1), 'every lever only escalates');
  ok(E[0].oppHeal < 1 && E[2].oppHeal === 0 && E[3].oppHeal === 0, 'his recovery shrinks, then stops');
  ok(E[0].youHeal < 1 && E[3].youHeal === 0, 'the player\'s recovery shrinks too (and stops)');
  ok(!E[0].sudden && !E[1].sudden && E[2].sudden && E[5].sudden && CHAMPIONSHIP.suddenFrom === 3, 'sudden death from the third championship round (round 6)');
}

// --- sudden death: the first knockdown by either fighter ends it ----------------------------------------------------
{
  const f = start('gus', { startRound: 6 });
  ok(f.esc.sudden && f.round === 6, 'a fight can start in round 6 (the tools)');
  run(f, 5);
  f.opp.health = 0; f.oppKnockdown();
  for (let i = 0; i < 200 && !f.result; i++) f.update();
  ok(f.result && f.result.winner === 'player' && f.result.method === 'KO' && f.result.round === 6 && f.result.championship, 'sudden death: his first knockdown is a KO for the player, no count');
  const g = start('gus', { startRound: 6 });
  g.player.health = 0; g.playerKnockdown();
  for (let i = 0; i < 200 && !g.result; i++) g.update();
  ok(g.result && g.result.winner === 'opponent' && g.result.method === 'KO' && g.result.championship, 'sudden death: the first knockdown of the player ends it, a loss, no get-up mash');
  const h = start('gus', { startRound: 5 });
  h.opp.health = 0; h.oppKnockdown();
  ok(h.phase === 'oppDown' && !h.tko, 'round 5 is not sudden death: a normal count');
  const k = start('gus', { startRound: 4 });
  k.kdRound.opp = 2; k.opp.health = 0; k.oppKnockdown();
  for (let i = 0; i < 200 && !k.result; i++) k.update();
  ok(k.result && k.result.method === 'TKO', 'three knockdowns in a round are still a TKO');
}

// --- bosses: every phase first, then the championship rounds -----------------------------------------------------------
{
  const f = start('halcyon', { startRound: 8 });
  ok(f.bossPhases === 3 && f.rounds === 5 && f.round === 8 && f.esc.sudden, 'Halcyon: three phases, five regular rounds, then the championship rounds');
  f.opp.health = 0; f.oppKnockdown();
  ok(f.phase === 'phaseShift' && !f.result, 'sudden death: a phase break is not the knockdown that ends the fight');
  for (let i = 0; i < 300 && f.phase !== 'fight'; i++) f.update();
  ok(f.bossPhase === 2 && f.opp.health === f.opp.maxHealth, 'he gets up as the next phase at full health');
  f.bossPhase = 3; f.opp.health = 0; f.oppKnockdown();
  for (let i = 0; i < 200 && !f.result; i++) f.update();
  ok(f.result && f.result.winner === 'player' && f.result.method === 'KO' && f.result.phase === 3, 'sudden death in the last phase: the first knockdown ends it');
  for (const id of Object.keys(BOUTS)) {
    const b = new Fight({ fighter: FIGHTERS[id], audio: null, input: inp, opts: {} });
    ok(b.rounds === BOUTS[id].rounds && b.rounds > BOUTS[id].phases && b.bossPhases === BOUTS[id].phases && b.roundFrames === 5400, `${id}: ${BOUTS[id].rounds} regular rounds on the boss clock for ${BOUTS[id].phases} phases`);
  }
  const z = start('zeroTrue');
  z.round = 7; z.opp.health = 1; endRound(z); nextRound(z);
  ok(z.round === 8 && z.esc.c === 1 && !z.result && z.bossPhase === 1, 'a boss with phases left at the end of his regular rounds goes on to the championship rounds (no champion-retains loss)');
}

// --- between rounds: his recovery and the corner's -----------------------------------------------------------------------
{
  const f = start('gus');
  const O = f.opp, heal = FIGHTERS.gus.stats.betweenRoundHeal;
  f.round = 2; O.health = 50; endRound(f);
  for (let i = 0; i < 120 && f.phase !== 'between'; i++) f.update();
  ok(Math.round(O.health) === Math.round(Math.min(O.maxHealth, 50 + O.maxHealth * heal)) && f.corner.healCap() === 30, 'a regular break: he recovers his heal, the corner gives 30');
  const g = start('gus');
  g.round = 3; g.opp.health = 50; endRound(g);
  for (let i = 0; i < 120 && g.phase !== 'between'; i++) g.update();
  const e1 = escalation(1);
  ok(Math.round(g.opp.health) === Math.round(Math.min(g.opp.maxHealth, 50 + g.opp.maxHealth * heal * e1.oppHeal)) && g.corner.healCap() === Math.round(30 * e1.youHeal), 'into round 4: he recovers less, the corner gives less');
  ok(g.corner.tips[0] === championshipCall(g) && /judges/i.test(g.corner.tips[0]), 'the cornerman says it the first time');
  const h = start('gus');
  h.round = 5; h.opp.health = 50; endRound(h);
  for (let i = 0; i < 120 && h.phase !== 'between'; i++) h.update();
  ok(h.corner.tips[0] === championshipCall(h) && /sudden/i.test(h.corner.tips[0]) && h.corner.healCap() === 0, 'before round 6: sudden death, nothing to recover');
  const j = start('gus');
  j.round = 6; j.opp.health = 50; endRound(j);
  for (let i = 0; i < 120 && j.phase !== 'between'; i++) j.update();
  ok(Math.round(j.opp.health) === 50 && !championshipCall(j), 'in sudden death he recovers nothing, and nobody says it twice');
}

// --- the Will Shard: five rounds of his own, his final form held in the Gauntlet --------------------------------------------
{
  const w = new Fight({ fighter: FIGHTERS.willShard, audio: null, input: inp, opts: {} });
  ok(w.rounds === 5, 'the Will Shard keeps his five rounds in the Career');
  const g = new Fight({ fighter: FIGHTERS.willShard, audio: null, input: inp, opts: { stageLock: 5 } });
  ok(g.rounds === 3 && g.stage === 5, 'in a Gauntlet he fights the regular rounds in his final form');
}

console.log(bad ? `${bad} of ${n} checks failed` : `championship rules clean (${n} checks)`);
process.exit(bad ? 1 : 0);
