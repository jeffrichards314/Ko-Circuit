// The human-model player (spec §9): the perfect-play bot (src/fight/bot.js) with a person's limits, used to calibrate every
// fight against the championship rounds (tools/championship-test.mjs). It plays
// through the same Fight and Player code as a person, pressing the same buttons.
//
//   reaction     200-280 ms (12-17 frames) from the first frame of a tell to seeing it; a pattern it has learned is seen at once
//   anticipation a defense lands up to +-3 frames either side of the ideal one (the same skew on a golden moment's punch)
//   mistakes     about 3% of its inputs are wrong: a defense skipped, a dodge to the wrong side, a punch to the wrong height
//   experience   it stops punching a wall: a spot (his state and move) whose punches have thudded off him 3 times (an ABSORBED punch that he did not
//                evade: the dull thud of Brody's wall) and landed under a third as often is left alone, across attempts. (Only walls: an evasion, a guard or
//                a parry is something a player has to read, and this one does not.) HUMAN.experience turns it off.
//   profiles     golden: false  "no golden moments" (the calibration's player: never goes for a super's golden moment)
//                golden: true   "uses golden moments" (goes for them, with the same jitter)
//                keepAway: true dodges everything and pokes a few jabs (one in about 5 s): the championship test's turtle
//                pure: true     ...and never throws a punch at all
import { PerfectBot } from './bot.js';

export const HUMAN = { react: [12, 17], jitter: 3, wrong: 0.03, learn: 3, bias: 2, poke: 330, experience: true };

export class Memory {
  constructor() { this.seen = {}; this.spots = {}; this.attempts = 0; }
}
const rnd = (a, b) => a + Math.floor(Math.random() * (b - a + 1));

export class HumanBot extends PerfectBot {
  constructor(fight, { memory = new Memory(), golden = false, keepAway = false, pure = false, ...o } = {}) {
    super(fight, { attack: !keepAway, noGolden: !golden, ...o });
    this.mem = memory;
    this.keepAway = keepAway;
    this.pure = pure; // (keep-away that never throws a punch at all)
    this.cur = null; this.curT = 0; this.inst = this.sample(null);
    this.lastPoke = -999;
    // what every punch of ours did to him, by spot: his state, move and (in his recovery) how his punch was answered
    const O = fight.opp, orig = O.onPlayerPunch.bind(O);
    O.onPlayerPunch = (p) => {
      const k = this.spot(), r = orig(p), S = (this.mem.spots[k] ||= { hit: 0, blocked: 0 });
      if (r.result === 'hit') S.hit++; else if (r.result === 'blocked' && r.absorbed && !r.evaded) S.blocked++;
      return r;
    };
  }
  spot() { const O = this.f.opp; return `${O.state}:${O.state === 'windup' || O.state === 'recovery' ? O.moveId : ''}:${O.state === 'recovery' ? O.moveResult : ''}`; }
  walled() { const S = HUMAN.experience && this.mem.spots[this.spot()]; return !!S && S.blocked >= 3 && S.hit < S.blocked / 3 && !this.mod(this.f.opp, 'stillwater'); } // (the Monk's answer is the bait: a blocked punch is the point)
  sample() {
    return { rt: rnd(HUMAN.react[0], HUMAN.react[1]), jit: rnd(-HUMAN.jitter, HUMAN.jitter), fumble: Math.random() < HUMAN.wrong, side: Math.random() < HUMAN.wrong };
  }
  think() {
    const O = this.f.opp, w = this.f.phase === 'fight' && O.state === 'windup' ? O.move : null;
    // a new windup: a new reaction time, a new skew, a new chance to slip up (and one more sighting of the move)
    if (w && (w !== this.cur || O.moveT < this.curT)) { this.inst = this.sample(); this.mem.seen[O.moveId] = (this.mem.seen[O.moveId] || 0) + 1; }
    this.cur = w; this.curT = O.moveT;
    super.think();
    // the keep-away player: a jab now and then when it's safe
    if (this.keepAway && !this.pure && this.f.phase === 'fight' && !this.now.size && this.f.clock - this.lastPoke >= HUMAN.poke) {
      const P = this.f.player;
      if (P.state === 'idle' && !P.pink && ['idle', 'block'].includes(O.state) && this.clearFrames(O) >= this.safeJab + 6 && !O.armor) {
        this.jab(this.canReachHead(O)); this.lastPoke = this.f.clock; // (a poke at his stance, never into a tell: no counters, no perfect hits)
      }
    }
  }
  known(id) { return Math.min(1, (this.mem.seen[id] || 0) / HUMAN.learn); }
  reaction(O) { return this.inst.rt * (1 - this.known(O.moveId)); }
  lead() { return HUMAN.bias + this.inst.jit; }
  goldenSkew() { return this.inst.jit; }
  fumble() { return this.inst.fumble; }
  wrongSide(k) { return this.inst.side ? (k === 'dodgeL' ? 'dodgeR' : k === 'dodgeR' ? 'dodgeL' : k) : k; }
  jab(high) {
    if (this.walled() && !this.f.opp.armor && this.f.opp.state !== 'windup') return; // (a spot that has only ever thudded: not again)
    super.jab(Math.random() < HUMAN.wrong ? !high : high);
  }
}
