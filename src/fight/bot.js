// Perfect-play bot: a frame-exact player used to prove §9's rule that every
// attack can be avoided (and every opponent beaten) with perfect play.
//
// It plays through the same Fight and Player code as a person, pressing the
// same buttons. It is allowed to read the opponent's current move (the tell a
// perfect player reads) and the rest of the pattern he is in (what a player
// who has learned him knows), but it never looks at whether a windup is a fake:
// every fake is defended like the real thing. (Windups flagged `call` are not
// punches at all, a shout or a spin with its own look, and a designed feint with
// its own tell sound that no real punch makes can be heard for what it is, so it
// doesn't defend those.) It does not look past the end of
// the current pattern either (the next one is picked at random).
//
//   const bot = new PerfectBot(fight, { attack: true });
//   each frame: bot.think(); fight.update();      (bot is the fight's input)
//
// attack: false -> defend only (the avoidability check)
// attack: true  -> also counter, punish, use stars and go for perfect hits
// latency: n    -> a human-ish handicap: it can't react to a windup until it has
//                  been showing for n frames (a reaction time), and it wins a
//                  standoff draw n frames after the bell at the earliest.
// learned: true -> with latency: a player who has learned the fighter. The reaction
//                  time only applies to a combo's opener; the follow-ups of a fixed
//                  (unshuffled) chain are known and anticipated (tools/balance.mjs).
// Phase 5: it leaves `trap` openings alone (possum, meditation), throws only
// body shots at a giant who isn't kneeling, saves Star Punches for an iron jaw
// that's rocked (or its star-timed perfect hit), and draws in a standoff.
// Ascension (spec §18): it mashes out of a clinch (`player.held`); a modifier's `threats` (a light
// trail's echo, a shadow that attacks on its own) are defended like a windup; a modifier's `futile`
// says punching is pointless right now (a raised shield) and it waits.

import { PT } from './player.js';
import { SUPER_ADVANCE } from '../../data/fighters/super.js';

const DODGE_LEAD = 3;   // press a dodge this many frames before the impact frame
const SAFE_JAB = 13;    // a jab needs this many clear frames before the next impact
const SAFE_STAR = 46;

export class PerfectBot {
  // sloppy: also throws the odd punch into his guard (to provoke parries, ice
  // counters and snowballs) and then has to defend whatever that brings.
  constructor(fight, { attack = true, sloppy = false, latency = 0, learned = false, noGolden = false } = {}) {
    this.sloppy = sloppy;
    this.noGolden = noGolden; // a player who doesn't know the golden moments (tools/championship-test.mjs)
    this.latency = latency;
    this.learned = learned;
    this.f = fight;
    this.attack = attack;
    this.now = new Set();   // pressed this frame
    this.hold = new Set();  // held this frame
    this.log = [];
    this.nextDir = -1;
    const ws = Object.values(fight.d.moves).map((m) => m.windupFrames);
    this.minWindup = Math.max(4, Math.round(Math.min(...ws) * 0.6));
    // How much room a jab needs before his next impact: 13 frames when whatever comes next can be slipped (the jab lets you out into a dodge
    // from frame 10), but a punch that can only be blocked (or only ducked) needs you free of the jab first: 18 (19) frames from the press.
    // A move with a longer windup than the bot's lower bound gives that much slack back. (Only a fighter with a short block-only or duck-only punch, at
    // a 3-5 frame tell, needs more than 13.)
    const lock = (m) => (m.avoidBy.some((a) => a.startsWith('dodge')) ? SAFE_JAB : m.avoidBy.includes('block') ? 18 : m.avoidBy.includes('duck') ? 19 : SAFE_JAB);
    const real = Object.values(fight.d.moves).filter((m) => m.avoidBy && m.avoidBy.length && !m.feint && !m.call && !m.echo && !m.strike);
    this.safeJab = Math.max(SAFE_JAB, ...real.map((m) => lock(m) - Math.max(0, m.windupFrames - this.minWindup)));
    // with no floor to slip on (Vorgath's phases) every punch is a block or a duck
    const lock2 = (m) => { const av = m.avoidBy.filter((a) => !a.startsWith('dodge')); return av.includes('block') || (!av.length && m.height === 'low') ? 18 : 19; };
    this.safeJabFloor = Math.max(this.safeJab, ...real.map((m) => lock2(m) - Math.max(0, m.windupFrames - this.minWindup)));
    fight.input = this; // the bot IS the fight's input
  }

  // Input interface (what Fight and Player read)
  pressed(a) { return this.now.has(a); }
  held(a) { return this.now.has(a) || this.hold.has(a); }
  released() { return false; }
  confirm() { return this.now.has('start') || this.now.has('a'); }
  back() { return false; }
  anyPressed(list = ['a', 'b', 'start', 'star']) { return list.some((a) => this.now.has(a)); }
  update() {}

  press(...as) { for (const a of as) this.now.add(a); }

  think() {
    this.now.clear(); this.hold.clear();
    const f = this.f, P = f.player, O = f.opp;
    switch (f.phase) {
      case 'announce': if (f.pt > 40) this.press('start'); return;
      case 'between': if (f.corner && f.corner.t < 280 && (f.clock & 1)) this.press('a'); if (f.corner && f.corner.t > 300) this.press('start'); return;
      case 'playerDown': if (f.clock & 1) this.press('a'); return;
      case 'fight': break;
      default: return;
    }
    if (O.state === 'standoff') {
      const D = O.mods.duel;
      if (D && D.phase === 'draw' && D.t + 1 >= Math.max(1, this.latency)) this.press('a');
      return;
    }
    if (P.state === 'held') { this.press(f.clock & 1 ? 'a' : 'b'); return; } // a clinch: mash
    if (this.defend(P, O)) return;
    if (this.sloppy && !this.mod(O, 'judge') && P.state === 'idle' && (['idle', 'block'].includes(O.state) || (O.state === 'open' && O.openStep && O.openStep.trap)) && this.clearFrames(O) >= SAFE_JAB + 8 && (f.clock % 7) === 0 && Math.random() < 0.08) { this.jab(true); return; }
    if (this.attack) this.offense(P, O);
  }

  // --- defense ---------------------------------------------------------------
  defend(P, O) {
    // second tap of a duck
    if (this.duckArm) {
      this.duckArm = false;
      if (P.state === 'block') { this.press('down'); return true; }
    }
    // keep holding block through a block-only punch
    if (P.state === 'block' && this.blocking) {
      if ((O.state === 'windup' || O.state === 'active') && O.move && O.move.avoidBy.includes('block')) { this.hold.add('down'); return true; }
      this.blocking = false;
    }
    // the threat to defend: his windup, or a modifier's own (a trail's echo), whichever lands first
    let m, d, tellT;
    // (a call, a shout or a stamp, is not a punch: it doesn't hide a strike of a modifier's landing at the same time)
    if (O.state === 'windup' && O.move && !(O.move.feint && O.move.call)) { m = O.move; d = m.windupFrames - O.moveT; tellT = this.tellT(O); }
    for (const mod of O.modifiers) {
      const T = mod.def.threats && mod.def.threats(O, mod.cfg);
      if (T) for (const t of T) if (d === undefined || t.left < d) { m = t.move; d = t.left; tellT = t.tellT ?? 99; }
    }
    if (!m) return false;
    if (tellT < this.reaction(O)) return false; // hasn't registered the tell yet
    if (this.fumble(m, O)) return false; // (a human's wrong input: no defense this time)
    if (m.feint && m.call) return false; // a shout / spin / signal, not a punch: nothing to defend
    if (m.feint && !m.fake && this.readableFeint(m)) return false; // e.g. Pockets' squeak: no real punch sounds like it
    if (d > 24) return false;
    const av = m.avoidBy;
    const B = this.lead(m); // (a human's press lands a few frames either side of the ideal one)
    // already covered by what we're doing?
    if (P.state === 'dodge' && av.includes(P.dir < 0 ? 'dodgeL' : 'dodgeR') && P.t + d <= PT.DODGE_AVOID[1] && P.t + d >= PT.DODGE_AVOID[0]) return true;
    if (P.state === 'duck' && av.includes('duck') && P.t + d <= PT.DUCK_AVOID[1]) return true;
    if (P.state === 'block' && av.includes('block') && !(P.guardBroken > 0)) { this.hold.add('down'); this.blocking = true; return true; }

    const can = this.capabilities(P);
    // (a wall of fire or a chain shuts one side: Queen Soot, the Jailer)
    const dodges = ['dodgeL', 'dodgeR'].filter((k) => av.includes(k) && !(P.noDodge && (P.noDodge === 2 || (k === 'dodgeL' ? -1 : 1) === P.noDodge)));
    const tapDucks = P.clock + 1 - P.lastDownTap <= PT.DOUBLE_TAP; // a DOWN now would be read as the 2nd tap of a duck
    if (dodges.length && (can.dodge || can.dodgeSoon)) {
      if (!can.dodge) return true;
      if (d > DODGE_LEAD + 1 + B) return false; // not yet: free to counter meanwhile
      {
        if (d < 2) return this.fail(m, 'too late to dodge');
        const pick = this.wrongSide(dodges.length === 2 ? (this.nextDir < 0 ? 'dodgeL' : 'dodgeR') : dodges[0]);
        this.nextDir = -this.nextDir;
        // under a screen flip (Eclipse) the keys are swapped: press whichever one slips that way
        this.press(this.f.opp.mapInput(pick === 'dodgeL' ? 'left' : 'right'));
      }
      return true;
    }
    if (av.includes('duck') && can.duck) {
      if (d > DODGE_LEAD + 2 + B) return false;
      {
        if (d < 3) return this.fail(m, 'too late to duck');
        this.press('down');
        if (!tapDucks) this.duckArm = true;
      }
      return true;
    }
    if (av.includes('block') && can.block) {
      if (d > 6 + B) return false;
      if (!tapDucks || d <= 2) {
        if (tapDucks) return this.fail(m, 'block tap would register as a duck');
        this.press('down'); this.hold.add('down'); this.blocking = true;
      }
      return true;
    }
    if (d <= 2 && this.warned !== m) { this.warned = m; return this.fail(m, `no defense available (player ${P.state} t=${P.t}, avoid ${av.join('/') || 'none'})`); }
    return true;
  }

  // Hooks for a human-model player (src/fight/humanBot.js); the perfect bot has none of these limits.
  lead() { return 0; }           // frames earlier (+) or later (-) than the ideal one a defense is pressed
  fumble() { return false; }     // a wrong input: skip this defense
  wrongSide(k) { return k; }     // ...or dodge the wrong way
  goldenSkew() { return 0; }     // frames early/late on a golden moment's punch

  // Frames the real tell has been showing (a lightning flash comes first: Bolt's
  // shoulder only moves after the hold).
  tellT(O) { return O.moveT - (O.move.boltHold || 0); }

  // Reaction time for his current windup: none for the known follow-up of a fixed chain.
  reaction(O) {
    if (!this.latency || !this.learned || !O.pattern || O.steps !== O.pattern.steps) return this.latency;
    const prev = O.steps[O.stepIdx - 2];
    const cur = O.steps[O.stepIdx - 1];
    const chained = cur && cur.move === O.moveId && prev && prev.move && !(O.d.moves[prev.move] || {}).call;
    return chained ? 0 : this.latency;
  }

  // A designed feint is readable when it has its own tell sound that none of
  // his real punches make (Pockets' thin squeak vs the honk-honk of a real one).
  readableFeint(m) {
    const snd = m.sfx && m.sfx.tell;
    if (!snd) return false;
    return !Object.values(this.f.d.moves).some((r) => !r.feint && r.sfx && r.sfx.tell === snd);
  }

  // What the player can start this frame (and whether waiting would still work).
  capabilities(P) {
    const t1 = P.t + 1; // Player.update increments t before reading input
    const s = P.state;
    const idle = s === 'idle';
    const chain = s === 'dodge' && P.dodgeSuccess && t1 >= P.dodgeChain();
    const jabOut = s === 'jab' && t1 >= PT.JAB_DODGE;
    return {
      dodge: idle || chain || jabOut || (s === 'dodge' && t1 >= P.dodgeTotal()) || (s === 'jab' && t1 >= PT.JAB_TOTAL),
      duck: idle || chain || s === 'block',
      block: (idle || chain) && !(P.guardBroken > 0), // (a broken guard stops nothing: defenseCost)
      // a dodge that becomes possible in a few frames (end of a jab, or of a clean slip)
      dodgeSoon: s === 'jab' || (s === 'dodge' && P.dodgeSuccess),
    };
  }

  fail(m, why) {
    this.log.push({ t: this.f.clock, round: this.f.round, move: m.id, why });
    return true;
  }

  // --- offense ---------------------------------------------------------------
  offense(P, O) {
    if (P.pink) {
      // exhausted, he can't punch. The Monk answers a slip too, and slipping that answer gets the hearts back
      const m = this.mod(O, 'stillwater');
      if (m && P.state === 'idle' && (O.state === 'idle' || O.state === 'block') && !O.armor && !O.mods.sw.q && O.mods.sw.settle <= 0) { this.press(this.nextDir < 0 ? 'left' : 'right'); this.nextDir = -this.nextDir; }
      return;
    }
    const idle = P.state === 'idle' || (P.state === 'dodge' && P.dodgeSuccess && P.t + 1 >= P.dodgeCancel());
    // punching is pointless right now (a raised shield, a wall of cloud): wait for a way in (a perfect hit still goes through)
    const futile = O.modifiers.some((m) => m.def.futile && m.def.futile(O, m.cfg));
    if (!idle) return;
    const clear = this.clearFrames(O);
    // a super: armored from its first frame to its last attack. Only its golden moment gets through (the right punch, on
    // the glint's frame); anything else clanks off, so a perfect player defends it and waits for that one punch.
    const H = this.noGolden ? null : O.cueHit();
    if (H) {
      const lead = H.star || O.d.kdStar ? PT.STAR_IMPACT : PT.JAB_IMPACT;
      // (only a deliberate punch counts: none of ours in the last goldenClean frames by the time it lands)
      const B = this.f.behavior, clean = !O.d.goldenClean || !B.total.punches || B.t + lead - B.lastPunch >= O.d.goldenClean;
      if (clean && O.kdCue(lead + this.goldenSkew(O))) {
        if (H.star || O.d.kdStar) { if (P.stars > 0) { this.press('star'); return; } }
        else { this.jabAt(H.side, H.height ? H.height === 'high' : this.canReachHead(O)); return; }
      }
    }
    if (O.armor) return;
    if (H && O.goldenAhead(H.star || O.d.kdStar ? PT.STAR_IMPACT : PT.JAB_IMPACT)) return; // (hold the punches: the golden frame is coming)
    // counters and perfect hits during a windup
    if (O.state === 'windup' && O.move && O.move.counterWindow) {
      if (this.tellT(O) < this.reaction(O)) return;
      const m = O.move, at = O.moveT + PT.JAB_IMPACT;
      if (m.recoveryKd) return; // his super's golden chance comes after it: slip it, don't counter it
      // braced (a punch bounced off him just before): this tell can't be countered, and on a tell this short a jab thrown now only costs the dodge
      if (O.read && m.windupFrames - O.moveT <= PT.JAB_TOTAL - 2) return;
      const cw = m.counterWindow, kd = m.kdWindow;
      const wantKd = kd && O.moveT + PT.JAB_IMPACT <= kd[1];
      if (futile && !wantKd) return;
      if (wantKd && at < kd[0]) return; // wait for the perfect frame
      if (at >= cw[0] && at <= cw[1] && m.windupFrames - O.moveT > PT.JAB_IMPACT) return this.jab(m.counterWith === 'high' || (m.counterWith !== 'low' && this.canReachHead(O)));
      return;
    }
    // backed off for a super: out of reach (the golden chance may be as he steps in)
    if (O.state === 'backstep' || (O.state === 'taunt' && O.superFar)) return;
    if (O.state === 'advance') return;
    const tk = O.state === 'taunt' ? O.tauntKdNow() : null;
    if (tk && O.d.kdStar) {
      // a star-only perfect hit: the Star Punch lands STAR_IMPACT frames after the press
      const at = O.t + PT.STAR_IMPACT;
      if (P.stars > 0 && at >= tk[0] && at <= tk[1] && clear >= SAFE_STAR) { this.press('star'); return; }
    } else if (tk) {
      const at = O.t + PT.JAB_IMPACT;
      if (at >= tk[0] && at <= tk[1] && clear >= SAFE_JAB) return this.jab(this.canReachHead(O));
      if (at < tk[0]) return;
    }
    // the golden chance after a slipped super
    if (O.state === 'recovery' && O.move && O.move.recoveryKd && (O.moveResult === 'dodged' || O.moveResult === 'ducked')) {
      const at = O.moveT + PT.JAB_IMPACT, k = O.move.recoveryKd;
      if (at >= k[0] && at <= k[1]) return this.jab(this.canReachHead(O));
      if (at < k[0]) return;
    }
    if (O.state === 'open' && O.openStep && O.openStep.kd) {
      const at = O.t + PT.JAB_IMPACT, k = O.openStep.kd;
      if (at >= k[0] && at <= k[1] && clear >= SAFE_JAB) return this.jab(true);
      if (at < k[0] && O.openHits === 0) return;
    }
    // The Monk never attacks first: he answers what you do. A perfect player baits him with a punch (every answer is one
    // the bot can defend and then punish) and saves a Star Punch to call his super once it's due (its golden moment is above)
    const still = this.mod(O, 'stillwater');
    if (still && (O.state === 'idle' || O.state === 'block') && !O.armor) {
      const W = O.mods.sw;
      if (W.q || W.settle > 0 || clear < this.safeJab) return;
      if (P.stars > 0 && still.def.due(O) && clear >= SAFE_STAR) { this.press('star'); return; }
      return this.jab(this.canReachHead(O) && (this.alt = !this.alt));
    }
    if (futile) return; // (the golden chances above still go through)
    // a Star Punch puts out Queen Soot's fire wall, and breaks the Jailer's chains (spent on that, when it can land clear)
    if (P.stars > 0 && P.state === 'idle' && clear >= SAFE_STAR && ((this.mod(O, 'firewall') && O.mods.wall) || (this.mod(O, 'chained') && O.mods.chain))) { this.press('star'); return; }
    const stunned = O.state === 'stunned' || (O.state === 'hit' && O.stun > 0);
    const open = O.state === 'open' && O.openStep && !O.openStep.trap;
    if (P.stars > 0 && clear >= SAFE_STAR && (stunned || open) && this.starWorthIt(O)) { this.press('star'); return; }
    if (clear < (P.noDodge ? this.safeJabFloor : this.safeJab)) return;
    // ice armour (Glacier): anything but a counter, a stun or a star bounces off and
    // draws the Ice Shard, so a perfect player leaves his recovery alone
    const ice = this.mod(O, 'frozen');
    if (ice && !stunned && !(ice.cfg.hittable || []).includes(O.state)) return;
    // Kiln glazes a zone hit twice in a row: a perfect player works the other one from the last hit
    const high = () => {
      if (this.mod(O, 'glaze')) { const Z = this.f.behavior.zone; if (Z.zone) return Z.zone !== 'head' && this.canReachHead(O); }
      return this.canReachHead(O) && (this.alt = !this.alt);
    };
    if (open && O.openHits < (O.openStep.comboLimit ?? 99)) return this.jab(high());
    // punish a slipped (or blocked) punch in his recovery (only if it lands before he's
    // back in his stance), then ride the flurry it starts
    const recLeft = O.state === 'recovery' && O.move ? O.move.recoveryFrames - O.moveT : 0;
    if ((O.state === 'recovery' && O.moveResult !== 'hit' && recLeft > PT.JAB_IMPACT) || ((O.state === 'hit' || (O.state === 'stunned' && O.stun > PT.JAB_IMPACT)) && O.combo < O.flurry)) return this.jab(high()); // (not into the last frames of a stun: it lands on his guard)
  }

  mod(O, type) { return O.modifiers.find((m) => m.cfg.type === type); }
  // An iron jaw only goes down to a star once he's rocked: save them till then
  // (or for his star-timed perfect hit).
  starWorthIt(O) {
    // a super whose golden moment is a Star Punch: keep one in hand for it
    if (O.supList.some((S) => S.hit === 'star') && this.f.player.stars <= 1) return false;
    // (the Monk's super is called by a Star Punch: keep one for it)
    if (this.mod(O, 'stillwater') && this.f.player.stars <= 1) return false;
    const j = this.mod(O, 'ironJaw');
    return !j || O.health <= Math.round(O.maxHealth * j.cfg.rocked);
  }
  // A giant's head is out of reach unless he's down on one knee, and a hard hat
  // turns every head shot away until he's stunned.
  canReachHead(O) {
    if (this.mod(O, 'hardHat') && !(O.state === 'stunned' || O.stun > 0) && !(O.know && O.know.flag('hatOff'))) return false;
    const k = this.mod(O, 'kneel');
    return !k || (O.state === 'open' && O.openStep && O.openStep.id === k.cfg.step.id);
  }

  // a jab with a given hand (a golden moment can need one): 'L' = b, 'R' = a
  jabAt(side, high) {
    if (!side) return this.jab(high);
    this.side = side === 'L' ? 'b' : 'a';
    this.press(this.side);
    if (high) this.hold.add('up');
  }
  jab(high) {
    this.side = this.side === 'a' ? 'b' : 'a';
    if (this.f.player.lock === this.side) this.side = this.side === 'a' ? 'b' : 'a'; // (a locked arm: use the other)
    this.press(this.side);
    if (high) this.hold.add('up');
  }

  // A lower bound on the frames before his next punch could land.
  clearFrames(O) {
    let t = this.clearFramesOwn(O);
    // ...and whatever else of his is on its way (an echo, a shadow): it lands then too
    for (const mod of O.modifiers) {
      const T = mod.def.threats && mod.def.threats(O, mod.cfg);
      if (T) for (const th of T) t = Math.min(t, th.left);
    }
    return t;
  }
  clearFramesOwn(O) {
    const next = this.minWindup;
    switch (O.state) {
      case 'windup': return O.move.windupFrames - O.moveT;
      case 'recovery': {
        const len = O.moveResult === 'hit' ? Math.round(O.move.recoveryFrames * 0.5) : O.move.recoveryFrames;
        return len - O.moveT + next;
      }
      case 'idle': case 'block': {
        // (the Monk starts nothing by himself: only an answer already on its way, which clearFrames counts as a threat)
        if (this.mod(O, 'stillwater')) return 999;
        // a guard counter already on its way (queued, a few frames from firing): it lands after its own windup
        const g = O.guardQ && O.d.moves[O.guardQ.id];
        if (g) return Math.min(Math.max(0, O.wait), O.guardQ.delay) + g.windupFrames;
        return Math.max(0, O.wait) + next;
      }
      case 'taunt': return Math.max(0, O.wait) + (O.superTaunt ? (O.superFar ? SUPER_ADVANCE : 0) + O.superMove().windupFrames : next);
      case 'backstep': return 60;
      case 'advance': return SUPER_ADVANCE - O.t + O.superMove().windupFrames;
      case 'open': return Math.max(0, O.wait) + next;
      case 'hit': return (O.hitLen || O.d.stats.hitstun) - O.t + (O.stun > 0 ? O.stun : 0) + 20 + next;
      case 'stunned': return O.stun + 20 + next;
      default: return 0;
    }
  }
}
