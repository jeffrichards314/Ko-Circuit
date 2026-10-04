// Player fight logic: jabs (L/R, high/low), dodge, block, duck, star punch,
// hit stun, pink exhaustion. Timings are frames; tune them here.

export const PT = {
  JAB_TOTAL: 16,     // full jab animation
  JAB_IMPACT: 4,     // frame the glove connects
  JAB_BUFFER: 8,     // from here a new punch press is queued
  JAB_CANCEL: 11,    // queued punch starts here (fast alternating jabs)
  JAB_DODGE: 10,     // can bail out into a dodge from here
  DODGE_TOTAL: 24,
  DODGE_AVOID: [1, 17],
  DODGE_CANCEL: 12,  // after a successful dodge you can punch from here
  DODGE_CHAIN: 10,   // ...and dodge again or block from here (back-to-back combos)
  BLOCK_TOTAL: 20,
  DUCK_TOTAL: 26,
  DUCK_AVOID: [1, 20],
  DOUBLE_TAP: 14,    // frames between two DOWN taps for a duck
  STAR_TOTAL: 42,
  STAR_IMPACT: 20,
  HIT_STUN: 22,
  REBUFF: 18,        // a punch that bounces off his guard: no new punch for this long after impact
  DODGE_SHIFT: 20,   // how far the player slides sideways on a dodge
  // The Ascension (spec §18): a slick canvas or a gale (`player.slide`) makes every dodge run
  // `slide` frames longer (the slip itself, frames 1-17, is unchanged: it's the coming-back that
  // takes longer, and the counter timing with it). A clinch (`player.held`) holds you until you mash free.
  SLIDE_PX: 1.4,     // ...and carries you that many extra pixels per frame of slide
};

// Any button counts for a mash (a get-up, a clinch): the punches, the star, START and the pad. PAUSE does not.
export const MASH_BUTTONS = ['a', 'b', 'star', 'start', 'up', 'down', 'left', 'right'];
export const anyButton = (input) => MASH_BUTTONS.some((b) => input.pressed(b));

export class Player {
  constructor(fight) {
    this.fight = fight;
    this.maxHealth = 100;
    this.health = 100;
    this.hearts = 20;
    this.stars = 0;
    this.pink = false;
    this.state = 'idle';
    this.t = 0;
    this.dir = 0;        // -1 left, +1 right (dodge / punch hand)
    this.high = false;
    this.queued = null;
    this.lastDownTap = -99;
    this.clock = 0;
    this.dodgeSuccess = false;
    this.shake = 0;
    this.rebuff = 0;     // frames until a bounced-off glove can punch again
    this.guardBroken = 0; // frames the guard is broken for: blocking stops nothing (defenseCost)
    this.slide = 0;      // extra frames every dodge takes to come back from (slick canvas, gale)
    this.held = null;    // a clinch: { mash, power, decay, t, timeout, every, damage } (state 'held')
    // The Underworld (spec §18 A6, Phase C)
    this.noDodge = 0;    // a wall of fire or a chain on one side: -1 / 1 = you can't slip that way (Queen Soot, the Jailer); 2 = neither (Vorgath's last phase)
    this.lock = null;    // 'a' | 'b': that arm is locked (Gaoler Brisk); `lockT` frames left
    this.lockT = 0;
    this.stumbleT = 0;   // a missed punch on a wet canvas (Drowned Mae): frames you're off balance (state 'stumble')
  }

  // dodge timings with the slide added
  dodgeTotal() { return PT.DODGE_TOTAL + this.slide; }
  dodgeChain() { return PT.DODGE_CHAIN + this.slide; }
  dodgeCancel() { return PT.DODGE_CANCEL + this.slide; }

  set(state, dir = 0) {
    this.state = state; this.t = 0; this.dir = dir;
    if (state === 'dodge' || state === 'duck') this.dodgeSuccess = false;
  }

  update(input) {
    this.clock++;
    this.t++;
    if (this.shake > 0) this.shake--;
    if (this.rebuff > 0) this.rebuff--;
    if (this.guardBroken > 0) this.guardBroken--;
    if (this.lockT > 0 && --this.lockT === 0) this.lock = null;
    const f = this.fight;
    const act = f.phase === 'fight';
    const S = this.state;
    const punchPress = () => {
      if (this.rebuff > 0) return null; // the glove is still bouncing back off his guard
      // a locked arm doesn't answer (Gaoler Brisk's cuff): the press is swallowed with a clink
      if (input.pressed('a')) { if (this.lock === 'a') { f.sfx('clang'); return null; } return { side: 'R', high: input.held('up') }; }
      if (input.pressed('b')) { if (this.lock === 'b') { f.sfx('clang'); return null; } return { side: 'L', high: input.held('up') }; }
      return null;
    };
    // slipping toward a wall of fire or the end of a chain does nothing (a clink), the other way is free
    const dodgePress = () => {
      const d = input.pressed('left') ? -1 : input.pressed('right') ? 1 : 0;
      if (d && (d === this.noDodge || this.noDodge === 2)) { if (this.clock - (this.clinkAt ?? -99) > 6) { this.clinkAt = this.clock; f.sfx('clang'); } return 0; }
      return d;
    };

    if (!act) {
      if (S === 'held') this.held = null;
      if (['jab', 'dodge', 'block', 'duck', 'star', 'hit', 'held', 'stumble'].includes(S) && this.t > 40) this.set('idle');
      if (S === 'jab' && this.t >= PT.JAB_TOTAL) this.set('idle');
      return;
    }

    switch (S) {
      case 'idle': {
        const d = dodgePress();
        if (d) { this.set('dodge', d); f.sfx('dodge'); break; }
        if (input.pressed('down')) { this.downTap(); break; }
        if ((input.pressed('star') || input.pressed('start')) && this.stars > 0) { this.startStar(); break; }
        const p = punchPress();
        if (p) this.startPunch(p);
        break;
      }
      case 'jab': {
        if (this.t === PT.JAB_IMPACT) f.playerPunch({ side: this.dir < 0 ? 'L' : 'R', high: this.high, star: false });
        if (this.t >= PT.JAB_BUFFER) { const p = punchPress(); if (p) this.queued = p; }
        if (this.t >= PT.JAB_DODGE) { const d = dodgePress(); if (d) { this.queued = null; this.set('dodge', d); f.sfx('dodge'); break; } }
        if (this.t >= PT.JAB_CANCEL && this.queued) { const q = this.queued; this.queued = null; this.startPunch(q); break; }
        if (this.t >= PT.JAB_TOTAL) this.set('idle');
        break;
      }
      case 'dodge': {
        if (this.dodgeSuccess && this.t >= this.dodgeChain()) {
          // a clean slip lets you flow straight into the next defense
          const d = dodgePress();
          if (d) { this.set('dodge', d); f.sfx('dodge'); break; }
          if (input.pressed('down')) { this.downTap(); break; }
        }
        if (this.dodgeSuccess && this.t >= this.dodgeCancel()) {
          const p = punchPress();
          if (p) { this.startPunch(p); break; }
        }
        if (this.t >= this.dodgeTotal()) this.set('idle');
        break;
      }
      case 'held': this.updateHeld(input); break;
      case 'stumble':
        if (this.t >= this.stumbleT) this.set('idle');
        break;
      case 'block': {
        if (input.pressed('down') && this.clock - this.lastDownTap <= PT.DOUBLE_TAP) { this.set('duck'); this.lastDownTap = -99; break; }
        if (input.pressed('down')) this.lastDownTap = this.clock;
        if (this.t >= PT.BLOCK_TOTAL && !input.held('down')) this.set('idle');
        break;
      }
      case 'duck':
        if (this.t >= PT.DUCK_TOTAL) this.set('idle');
        break;
      case 'star':
        if (this.t === PT.STAR_IMPACT) f.playerPunch({ side: 'R', high: true, star: true });
        if (this.t >= PT.STAR_TOTAL) this.set('idle');
        break;
      case 'hit':
        if (this.t >= PT.HIT_STUN) this.set('idle');
        break;
      default:
        break; // down / getup / victory are driven by the fight
    }
  }

  downTap() {
    if (this.clock - this.lastDownTap <= PT.DOUBLE_TAP) { this.set('duck'); this.lastDownTap = -99; }
    else { this.set('block'); this.lastDownTap = this.clock; }
  }

  startPunch(p) {
    if (this.pink) { this.fight.sfx('tired'); this.set('idle'); return; }
    this.high = p.high;
    this.set('jab', p.side === 'L' ? -1 : 1);
  }

  startStar() {
    if (this.pink) { this.fight.sfx('tired'); return; }
    this.stars--;
    this.set('star', 1);
    this.fight.sfx('starWind');
  }

  // Opponent's punch arrives: how did we defend?
  defend(move) {
    const s = this.state, t = this.t;
    const av = move.avoidBy;
    if (s === 'dodge' && t >= PT.DODGE_AVOID[0] && t <= PT.DODGE_AVOID[1]) {
      if (av.includes(this.dir < 0 ? 'dodgeL' : 'dodgeR')) { this.dodgeSuccess = true; return 'dodged'; }
    }
    if (s === 'duck' && t >= PT.DUCK_AVOID[0] && t <= PT.DUCK_AVOID[1] && av.includes('duck')) { this.dodgeSuccess = true; return 'ducked'; }
    if (s === 'block' && av.includes('block') && !(this.guardBroken > 0)) return 'blocked';
    return 'hit';
  }

  // Caught in a clinch (Rocksteady Reuben; spec §18): no dodge, no punch, no block. Mash A / B to
  // break his hold (the circuit's get-up mash values, per press and per frame); every `every`
  // frames he squeezes for `damage` (never a knockdown on its own: a hold leaves you 1 health)
  // and a heart; he lets go by himself after `timeout` frames.
  hold({ power, decay, timeout = 140, every = 26, damage = 4, heart = 1 }) {
    this.held = { mash: 12, power, decay, t: 0, timeout, every, damage, heart };
    this.queued = null;
    this.set('held');
  }
  updateHeld(input) {
    const H = this.held, f = this.fight;
    if (!H) { this.set('idle'); return; }
    H.t++;
    if (anyButton(input)) { H.mash += H.power; f.sfx('mash'); } // (any button: the clinch is broken by pushing anything)
    H.mash = Math.max(0, H.mash - H.decay);
    if (H.t % H.every === 0 && H.t < H.timeout) f.squeeze(H);
    if (H.mash >= 100) { this.held = null; this.set('idle'); f.sfx('crowd'); f.event('clinchBreak'); f.opp.hook('clinchBroken', true); return; }
    if (H.t >= H.timeout) { this.held = null; this.set('idle'); f.opp.hook('clinchBroken', false); }
  }

  // A missed punch on a wet canvas (Drowned Mae; spec §18 A6): you slip and stagger for `frames`.
  // No dodge, block or punch until you have your feet again; anything that lands still hurts.
  stumble(frames) {
    if (this.state === 'down' || this.state === 'getup' || this.state === 'held' || this.state === 'hit') return;
    this.stumbleT = frames;
    this.queued = null;
    this.set('stumble');
  }

  // His guard turned the punch away: the glove bounces back, and you can't throw
  // another until it's home (you can still dodge out as usual).
  rebuffed() {
    this.rebuff = PT.REBUFF;
    this.queued = null;
  }

  takeHit() {
    this.set('hit', 0);
    this.queued = null;
    this.shake = 10;
  }

  // Sprite pose + x offset for rendering.
  view() {
    const s = this.state, t = this.t;
    let pose = 'idle1', dx = 0, dy = 0;
    const idle = this.pink ? ((this.clock >> 4) & 1 ? 'tired2' : 'tired') : ((this.clock / 24) | 0) % 2 ? 'idle2' : 'idle1';
    switch (s) {
      case 'idle': pose = idle; break;
      case 'jab': {
        const hand = this.dir < 0 ? 'L' : 'R';
        pose = t < 2 ? `jab${hand}_wind` : t < 11 ? `jab${hand}_${this.high ? 'high' : 'low'}` : idle;
        if (t >= 2 && t < 9) dy = -2;
        if (this.rebuff > PT.REBUFF - 8) { dy = 2; dx = this.rebuff & 2 ? 1 : -1; } // knocked back off his gloves
        break;
      }
      case 'dodge': {
        const k = t < 3 ? t / 3 : t < 17 ? 1 : Math.max(0, 1 - (t - 17) / (7 + this.slide));
        pose = t < 20 + this.slide ? (this.dir < 0 ? 'dodgeL' : 'dodgeR') : idle;
        dx = Math.round(this.dir * (PT.DODGE_SHIFT + this.slide * PT.SLIDE_PX) * k);
        break;
      }
      case 'held': pose = 'hit'; dx = (this.clock >> 1) & 1 ? 2 : -2; dy = 2; break;
      case 'stumble': pose = 'hit'; dx = Math.round(Math.sin(t * 0.9) * 3); dy = t < 4 ? 2 : 1; break; // (skidding on the wet canvas)
      case 'block': pose = 'block'; break;
      case 'duck': pose = t < 22 ? 'duck' : idle; break;
      case 'star': pose = t < PT.STAR_IMPACT - 2 ? 'starWind' : t < PT.STAR_TOTAL - 10 ? 'star' : idle;
        if (t >= PT.STAR_IMPACT - 2 && t < PT.STAR_IMPACT + 8) dy = -4;
        break;
      case 'hit': pose = 'hit'; dx = this.shake > 0 ? ((this.shake >> 1) & 1 ? 2 : -2) : 0; dy = t < 8 ? 3 : 1; break;
      case 'down': pose = t < 10 ? 'hit' : t < 22 ? 'fall' : 'down'; dy = t < 10 ? 4 : 0; break;
      case 'getup': pose = t < 20 ? 'getup' : idle; break;
      case 'victory': pose = 'victory'; dy = (this.clock >> 3) & 1 ? -2 : 0; break;
      case 'corner': pose = idle; break;
      default: pose = idle;
    }
    return { pose, dx, dy };
  }
}
