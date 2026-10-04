// Shared by the championship tools: play one fight with the human-model player and measure it.
import { Fight } from '../../src/fight/fightState.js';
import { HumanBot, Memory } from '../../src/fight/humanBot.js';
import { FIGHTERS } from '../../data/fighters/index.js';
import { remixed } from '../../data/fighters/titleDefense.js';

export { Memory };
// "Hittable": how often the player lands a punch, as a share of OPEN_REF punches landed a second (an open fighter lets the human-model
// player land about one every half second; 100% = one every half second or better). Every punch the player throws goes in at an opening
// (src/fight/bot.js), so punches landed a second is how often there is one: pattern openings, and what the fighter's gimmick takes away.
export const OPEN_REF = 2;
export const fighterOf = (id, td) => (td ? remixed(id) : FIGHTERS[id]);

// Can a clean punch land on him right now? (a state-based mirror of OpponentAI.onPlayerPunch: no side effects)
export function hittable(O) {
  if (O.armor || O.view().hidden) return false;
  const S = O.state;
  switch (S) {
    case 'windup': { const cw = O.move && O.move.counterWindow; return !!cw && !O.read && O.moveT >= cw[0] && O.moveT <= cw[1]; }
    case 'recovery': return O.moveResult !== 'hit';
    case 'open': return O.openHits < (O.openStep && O.openStep.comboLimit != null ? O.openStep.comboLimit : 99);
    case 'idle': return O.idleHits < O.d.stats.idleHitLimit && O.d.stats.idleGuard !== 'high' && O.d.stats.idleGuard !== 'low';
    case 'taunt': return !O.superFar && !O.superTaunt;
    case 'hit': case 'stunned': return O.combo < O.flurry;
    default: return false;
  }
}

// opts: td, memory, golden, keepAway, near, roundFrames, rounds, maxFrames, stageLock, startHealth
export function play(id, o = {}) {
  const d = o.fighter || fighterOf(id, o.td);
  const f = new Fight({ fighter: d, audio: null, input: null, opts: { roundFrames: o.roundFrames, rounds: o.rounds, stageLock: o.stageLock, startHealth: o.startHealth, ...(o.opts || {}) } });
  const bot = new HumanBot(f, { memory: o.memory, golden: !!o.golden, keepAway: !!o.keepAway || !!o.pure, pure: !!o.pure });
  let res = null; f.opts.onEnd = (r) => { res = r; };
  let fightFrames = 0, hit = 0, punches = 0;
  // near: the "he was nearly finished at the end of round 3" scenario: the player fights as it always does, but in his last phase the opponent cannot
  // drop under `near` of his health until the championship rounds begin
  if (o.near != null) {
    const kd = f.oppKnockdown.bind(f);
    f.oppKnockdown = () => { if (f.round <= f.rounds && f.finalPhase()) f.opp.health = Math.round(o.near * f.opp.maxHealth); else kd(); };
  }
  for (let i = 0; i < (o.maxFrames || 3_000_000) && !res; i++) {
    // (a floor under his health in the regular rounds, in his last phase: the player cannot knock him out before the championship rounds)
    if (o.near != null && f.round <= f.rounds && f.finalPhase() && f.opp.health < o.near * f.opp.maxHealth && f.phase === 'fight') f.opp.health = Math.round(o.near * f.opp.maxHealth);
    bot.think();
    if (f.phase === 'fight') { fightFrames++; if (hittable(f.opp)) hit++; }
    f.update();
  }
  if (bot.mem) bot.mem.attempts++;
  return {
    res, win: !!res && res.winner === 'player', method: res && res.method, round: f.round, ko: f.clockUsed, fightFrames,
    hittable: fightFrames ? hit / fightFrames : 0, open: fightFrames ? Math.min(1, f.stats.landed / (fightFrames / 60) / OPEN_REF) : 0, lps: fightFrames ? f.stats.landed / (fightFrames / 60) : 0, points: f.points, kd: { ...f.kdTotal }, hitsTaken: f.stats.hitsTaken, stats: f.stats,
    seconds: fightFrames / 60, gameSeconds: f.round ? res && res.seconds : 0, pps: fightFrames ? f.points / (fightFrames / 60) : 0, roundFrames: f.roundFrames, rounds: f.rounds, health: f.player.health,
  };
}
