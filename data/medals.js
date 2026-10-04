import { BOSSES, HEALTH, ZONE } from './difficulty.js';
// Medals (§15). Every fighter (the 50, Jax, ZERO, Dash's four fights, and
// every Ascension fighter, boss and Dash encounter as it is built) has three:
//   BRONZE  SPEED      win by KO or TKO under his target time (game clock from
//                      round 1's bell, across rounds). The target is his
//                      circuit's (SPEED below) unless his data file sets
//                      medals.speed (seconds).
//   SILVER  FLAWLESS   win without taking a hit: no punch lands on you and you're
//                      never knocked down. Blocked punches don't count.
//   GOLD    SIGNATURE  a challenge tied to his gimmick, in his data file:
//                      medals: { signature: { text, check, ...params } }
//                      `check` is one of the reusable CHECKS below (a new one
//                      only when no existing check fits, like the modifiers).
// Gold needs a win too (any method) unless the check says otherwise.
// Medals count in Career (circuit replays and podium rematches included) only.

// Speed targets per circuit, in game seconds. Calibrated against the perfect-play
// bot (tools/medal-sim.mjs): about 1.75x the circuit's median bot KO time,
// rounded up to 15 s and never lower than the circuit before it. A fighter the
// bot needs much longer for sets his own `medals.speed` (Tess, Iron Jaw).
export const SPEED = {
  rookie: 120, minor: 150, metro: 150, major: 150, carnival: 150, continental: 180,
  world: 195, storm: 195, legends: 195, grandprix: 210, underground: 210, dream: 240,
  nightmare: 240, zero: 480,
  rival1: 150, rival2: 150, rival3: 195, rival4: 210,
  // the Ascension (spec §18): recalibrated against the perfect-play bot with tools/medal-sim.mjs
  p1: 240, p2: 255, p3: 270, rival5: 270,
  // Phase B (calibrated with tools/medal-sim.mjs: the bot KOs P4 in ~2:20, P5 ~2:15, P6 ~2:00, P7 ~2:15; Halcyon is three KOs,
  // so his target is the whole 9:00 of three rounds: any knockout of the last form counts)
  p4: 285, p5: 300, p6: 315, rival6: 315, p7: 330, halcyon: 540,
  // Phase C (medal-sim: the bot KOs U1 in ~2:15, U2 ~2:15 (Queen Soot ~3:00), U3 ~2:15 (the Jailer ~3:55), Dash VII ~2:25;
  // never lower than the circuit before it, and a little more for each step down)
  u1: 330, u2: 345, u3: 360, rival7: 360,
  // Phase D (medal-sim: the bot KOs U4 in 2:50-6:05 (Fallen Brody, the slowest), U5 ~2:15-2:45, U6 ~2:40-4:30 (Nox, the Herald), Dash VIII ~2:50;
  // Vorgath is three knockouts, so like Halcyon his target is the whole 9:00 of three rounds: any knockout of the last phase counts)
  u4: 375, u5: 390, u6: 405, rival8: 405, vorgath: 540,
  // Phase E (medal-sim: the bot KOs Void I in 2:15-6:35 (the Block Shard, who gives one clean shot per block, is the slowest), Void II ~3:55-4:40,
  // Void III ~2:55-4:20 (the Will Shard has his own target: five rounds); ZERO's true form is four knockouts in a row, so like Halcyon and Vorgath his
  // target is the whole fight: any knockout of the last phase counts)
  // Phase F recalibration (tools/medal-sim.mjs, 60 fights each): ZERO's true form is four rounds, so 12:00 at most (the old 18:00 was longer than the fight:
  // any knockout of the last phase earns the Bronze; the bot needs 10:36); the Block Shard (5:49, up to 8:23), the Duck Shard (5:04, up to 8:21), the
  // Will Shard and Fallen Brody (6:05 against U4's 6:15) have their own targets in their data files
  v1: 420, v2: 435, v3: 450, rival9: 600, zeroTrue: 720, // (Dash Unbound: the bot's 90th percentile is 8:50 now that the bout's clock is 90 s rounds)
};

export const MEDALS = ['speed', 'flawless', 'signature'];

// Signature checks. Each gets (track, result, params) where track is the fight's
// telemetry (src/fight/tracker.js) and result the fight result; returns true if met.
const won = (r) => r.winner === 'player';
const mv = (t, id) => t.moves[id] || { hit: 0, blocked: 0, dodged: 0, ducked: 0, countered: 0 };
const sumMoves = (t, key) => Object.values(t.moves).reduce((a, m) => a + (m[key] || 0), 0);
export const CHECKS = {
  // an open step (by id) never ran its full length: you always broke it up
  noOpenDone: (t, r, p) => !(t.opens[p.id] && t.opens[p.id].done),
  // an open step happened at least n times (you made him do it)
  openCount: (t, r, p) => { const o = t.opens[p.id] || { done: 0, broken: 0 }; return o.done + o.broken >= p.n; },
  // a cue never happened / happened at least n times: '!name' = a gimmick event
  // (Fight.event: '!read' '!parry' '!teleport' '!hatClang' '!crowdFull' '!possumTrap' '!kneel')
  noCue: (t, r, p) => !t.cues[p.cue],
  cueCount: (t, r, p) => (t.cues[p.cue] || 0) >= p.n,
  // never threw the same punch (hand + height) twice in a row
  noRepeat: (t) => t.punches.repeats === 0,
  // every one of his knockdowns came this way (and there was at least one)
  kdOnly: (t, r, p) => t.kds.length > 0 && t.kds.every((k) => k.by === p.by),
  // at least one knockdown this way ('perfect' = his golden chance)
  kdBy: (t, r, p) => t.kds.filter((k) => k.by === p.by).length >= (p.n || 1),
  // at least n knockdowns
  kdCount: (t, r, p) => t.kds.length >= p.n,
  // a knockdown in this round
  kdInRound: (t, r, p) => t.kds.some((k) => k.round === p.round),
  // his move countered at least n times (hit him during its windup)
  counterMove: (t, r, p) => mv(t, p.move).countered >= (p.n || 1),
  // his move defended a given way at least n times
  moveResult: (t, r, p) => (mv(t, p.move)[p.result] || 0) >= (p.n || 1),
  // his move never landed on you
  neverHitBy: (t, r, p) => !mv(t, p.move).hit,
  // you never defended with this (block / dodge / duck: 'blocked' 'dodged' 'ducked')
  never: (t, r, p) => sumMoves(t, p.defense) === 0,
  counters: (t, r, p) => t.punches.counters >= p.n,
  noStarPunch: (t) => t.punches.stars === 0,
  // never ran out of hearts (never went pink)
  noPink: (t) => !t.cues.heartOut,
  // none of your punches bounced off his guard / none whiffed
  noGuarded: (t) => t.punches.guarded === 0,
  noWhiff: (t) => t.punches.whiffed === 0,
  // every hit you landed came from a counter (and the flurry it started), and every counter was on one of these moves (Barney Ascended)
  onlyCounters: (t, r, p) => t.punches.counters > 0 && t.punches.free === 0 && Object.entries(t.moves).reduce((n, [id, m]) => n + (p.moves.includes(id) ? 0 : m.countered || 0), 0) === 0,
  // landed no more than n punches in the whole fight (patience)
  maxLanded: (t, r, p) => t.punches.landed <= p.n,
  // won in round 1 / by a 10-count KO / by the finishing star punch
  round1: (t, r) => r.round === 1 && (r.method === 'KO' || r.method === 'TKO'),
  byKO: (t, r) => r.method === 'KO',
  byTKO: (t, r) => r.method === 'TKO',
  starFinish: (t, r) => (r.method === 'KO' || r.method === 'TKO') && t.kds.length > 0 && t.kds[t.kds.length - 1].by === 'star',
};

// Evaluate a finished fight: which of his three medals it earns.
export function medalsFor(fighter, result, speedOf) {
  const out = { speed: false, flawless: false, signature: false };
  if (!won(result) || !result.track) return out;
  const t = result.track;
  out.speed = (result.method === 'KO' || result.method === 'TKO') && result.seconds < speedOf(fighter);
  out.flawless = (result.stats.hitsTaken || 0) === 0 && (result.knockdowns.player || 0) === 0;
  const S = fighter.medals && fighter.medals.signature;
  out.signature = !!(S && CHECKS[S.check] && CHECKS[S.check](t, result, S));
  return out;
}
// (2026-10-03: regular fighters have more health, data/difficulty.js HEALTH, so their targets stretch with it, rounded up to 15 s; the big bosses are not scaled)
export const speedTarget = (fighter) => {
  const base = (fighter.medals && fighter.medals.speed) || SPEED[fighter.circuit] || 300;
  return BOSSES.includes(fighter.id) ? base : Math.ceil((base * (HEALTH[ZONE[fighter.circuit]] ?? 1)) / 15) * 15;
};

// Title Defense medals of a remixed champion (spec §6): his podium in the Belt Hall keeps a best time and the same three slots as a circuit
// fighter's, kept apart from the Career medals (they never count toward an unlock): BRONZE a KO or TKO under his circuit's target, SILVER a win
// taking no hit, GOLD a KO in under TD_GOLD of the target (his original signature challenge is about a fight that no longer goes the same way).
export const TD_GOLD = 0.6;
export const tdGoldTarget = (fighter) => Math.round(speedTarget(fighter) * TD_GOLD);
export function tdChampMedals(fighter, result) {
  const out = { speed: false, flawless: false, signature: false };
  if (!won(result)) return out;
  const ko = result.method === 'KO' || result.method === 'TKO';
  out.speed = ko && result.seconds < speedTarget(fighter);
  out.flawless = ((result.stats && result.stats.hitsTaken) || 0) === 0 && ((result.knockdowns && result.knockdowns.player) || 0) === 0;
  out.signature = ko && result.seconds < tdGoldTarget(fighter);
  return out;
}
